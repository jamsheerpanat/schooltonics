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

        return $session;
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
}
