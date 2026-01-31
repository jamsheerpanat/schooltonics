<?php

namespace App\Services;

use App\Models\AcademicYear;
use App\Models\AttendanceSession;
use App\Models\AttendanceRecord;
use App\Models\AuditLog;
use App\Models\TeacherAssignment;
use Illuminate\Support\Facades\DB;

class AttendanceService
{
    /**
     * Create or retrieve an attendance session.
     */
    public function createOrGetSession(int $sectionId, string $date, int $teacherId)
    {
        $this->validateTeacherAssignment($teacherId, $sectionId);

        $activeYear = AcademicYear::where('is_active', true)->firstOrFail();
        $dateFormatted = \Carbon\Carbon::parse($date)->toDateString();

        return DB::transaction(function () use ($activeYear, $sectionId, $dateFormatted, $teacherId) {
            $session = AttendanceSession::firstOrCreate(
                [
                    'section_id' => $sectionId,
                    'date' => $dateFormatted,
                ],
                [
                    'academic_year_id' => $activeYear->id,
                    'created_by_teacher_id' => $teacherId,
                    'status' => 'draft',
                ]
            );

            if ($session->wasRecentlyCreated) {
                AuditLog::create([
                    'user_id' => $teacherId,
                    'action' => 'attendance.session_created',
                    'entity_type' => 'AttendanceSession',
                    'entity_id' => $session->id,
                    'description' => "Attendance session created for section {$sectionId} on {$dateFormatted}",
                ]);
            }

            return $session;
        });
    }

    /**
     * Submit an attendance session with records.
     */
    public function submitSession(int $sessionId, array $records, int $teacherId)
    {
        $session = AttendanceSession::findOrFail($sessionId);

        if ($session->status !== 'draft') {
            throw new \Exception("Session is already {$session->status} and cannot be modified.");
        }

        if ($session->created_by_teacher_id !== $teacherId) {
            $this->validateTeacherAssignment($teacherId, $session->section_id);
        }

        DB::transaction(function () use ($session, $records, $teacherId) {
            foreach ($records as $record) {
                $attendanceRecord = AttendanceRecord::updateOrCreate(
                    [
                        'attendance_session_id' => $session->id,
                        'student_id' => $record['student_id'],
                    ],
                    [
                        'status' => $record['status'], // 'present' or 'absent'
                        'reason' => $record['reason'] ?? null,
                    ]
                );

                if ($record['status'] === 'absent') {
                    AuditLog::create([
                        'user_id' => $teacherId,
                        'action' => 'attendance.absence_recorded',
                        'entity_type' => 'AttendanceRecord',
                        'entity_id' => $attendanceRecord->id,
                        'description' => "Student {$record['student_id']} marked absent",
                        'metadata' => ['session_id' => $session->id, 'reason' => $record['reason'] ?? '']
                    ]);
                }
            }

            $session->update([
                'status' => 'submitted',
                'submitted_at' => now(),
            ]);

            AuditLog::create([
                'user_id' => $teacherId,
                'action' => 'attendance.session_submitted',
                'entity_type' => 'AttendanceSession',
                'entity_id' => $session->id,
                'description' => "Attendance session {$session->id} submitted and locked.",
            ]);
        });

        // Send notifications for absent students
        $this->notifyAbsentees($session);

        // Cache Invalidation
        $teacherCacheKey = "teacher_day_{$teacherId}_" . now()->toDateString();
        \Illuminate\Support\Facades\Cache::forget($teacherCacheKey);
        // Note: Students also have caches but invalidating strictly for attendance status change 
        // to a specific session is tedious without Tags. 
        // Reliance on 60s TTL is sufficient for students.
        // Teacher needs faster update to confirm submission status.

        return $session;
    }

    /**
     * Notify students and guardians about absence.
     */
    protected function notifyAbsentees(AttendanceSession $session)
    {
        $absentRecords = $session->records()->where('status', 'absent')->with('student.user', 'student.guardians.user')->get();
        $pushService = app(PushNotificationService::class);

        foreach ($absentRecords as $record) {
            $student = $record->student;
            $title = "Attendance Update";
            $body = "{$student->name_en} marked Absent today.";

            // Notify student
            if ($student->user) {
                $pushService->sendToUser($student->user, $title, $body);
            }

            // Notify guardians
            foreach ($student->guardians as $guardian) {
                if ($guardian->user) {
                    $pushService->sendToUser($guardian->user, $title, $body);
                }
            }
        }
    }

    /**
     * Validate if teacher is assigned to this section.
     */
    public function validateTeacherAssignment(int $teacherId, int $sectionId)
    {
        $activeYear = AcademicYear::where('is_active', true)->firstOrFail();

        $assigned = TeacherAssignment::where('academic_year_id', $activeYear->id)
            ->where('teacher_user_id', $teacherId)
            ->where('section_id', $sectionId)
            ->exists();

        if (!$assigned) {
            // Check if user is principal (bypass)
            $user = \App\Models\User::find($teacherId);
            if ($user && $user->role === 'principal') {
                return true;
            }
            throw new \Exception("Teacher is not assigned to this section.");
        }

        return true;
    }

    /**
     * Get session data including student roster with current status.
     */
    public function getSessionWithRoster(int $sessionId)
    {
        $session = AttendanceSession::with('records')->findOrFail($sessionId);

        $activeYear = AcademicYear::where('is_active', true)->firstOrFail();

        $roster = \App\Models\Enrollment::where('section_id', $session->section_id)
            ->where('academic_year_id', $activeYear->id)
            ->where('status', 'active')
            ->with('student')
            ->get()
            ->map(function ($enrollment) use ($session) {
                $record = $session->records->firstWhere('student_id', $enrollment->student_id);
                return [
                    'student_id' => $enrollment->student_id,
                    'student_name' => $enrollment->student->name_en,
                    'roll_no' => $enrollment->roll_no,
                    'status' => $record ? $record->status : 'present',
                    'reason' => $record ? $record->reason : null,
                ];
            });

        return [
            'session' => $session,
            'roster' => $roster,
        ];
    }

    /**
     * Get attendance summary for principal.
     */
    public function getPrincipalSummary(string $date)
    {
        $dateFormatted = \Carbon\Carbon::parse($date)->toDateString();

        return \App\Models\Section::with(['grade'])->get()->map(function ($section) use ($dateFormatted) {
            $session = AttendanceSession::where('section_id', $section->id)
                ->where('date', $dateFormatted)
                ->with('records')
                ->first();

            $totalCount = \App\Models\Enrollment::where('section_id', $section->id)
                ->where('status', 'active')
                ->count();

            $presentCount = 0;
            if ($session && $totalCount > 0) {
                $absentCount = $session->records->where('status', 'absent')->count();
                $presentCount = $totalCount - $absentCount;
                $percentage = ($presentCount / $totalCount) * 100;
            } else {
                $percentage = 0;
            }

            return [
                'section_id' => $section->id,
                'section_name' => $section->grade->name . ' - ' . $section->name,
                'total_students' => $totalCount,
                'present_count' => $presentCount,
                'attendance_percentage' => round($percentage, 2),
                'status' => $session ? $session->status : 'no_session'
            ];
        });
    }
}
