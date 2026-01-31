<?php

namespace App\Services;

use App\Models\Homework;
use App\Models\ClassSession;
use App\Models\AuditLog;
use App\Services\PushNotificationService;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class HomeworkService
{
    /**
     * Post homework for a class session.
     */
    public function postHomework(int $sessionId, array $data, int $teacherId)
    {
        $session = ClassSession::findOrFail($sessionId);

        // Ownership check
        if ($session->teacher_user_id !== $teacherId) {
            throw new \Exception("Unauthorized: You are not the owner of this class session.");
        }

        // Rule: One homework per session
        if ($session->homework()->exists()) {
            throw new \Exception("Homework has already been assigned for this session.");
        }

        $homework = DB::transaction(function () use ($session, $data, $teacherId) {
            $homework = Homework::create([
                'class_session_id' => $session->id,
                'title' => $data['title'],
                'instructions' => $data['instructions'],
                'due_date' => $data['due_date'] ?? Carbon::now()->addDay()->toDateString(),
                'attachments' => $data['attachments'] ?? null,
                'posted_at' => now(),
            ]);

            AuditLog::create([
                'user_id' => $teacherId,
                'action' => 'homework_created',
                'entity_type' => 'Homework',
                'entity_id' => $homework->id,
                'description' => "Homework '{$homework->title}' assigned for session {$session->id}",
            ]);

            return $homework;
        });

        // Notify students and parents
        $this->notifyStakeholders($session, "New Homework", "Due on " . Carbon::parse($homework->due_date)->format('M d'));

        return $homework;
    }

    /**
     * Notify all students and parents in the section.
     */
    protected function notifyStakeholders(ClassSession $session, string $title, string $body)
    {
        $enrollments = \App\Models\Enrollment::where('section_id', $session->section_id)
            ->where('status', 'active')
            ->with(['student.user', 'student.guardians.user'])
            ->get();

        $pushService = app(PushNotificationService::class);

        foreach ($enrollments as $enrollment) {
            $student = $enrollment->student;

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
    }

    /**
     * Get homework for a session.
     */
    public function getHomeworkBySession(int $sessionId)
    {
        return Homework::where('class_session_id', $sessionId)->first();
    }

    /**
     * Get homework for a student within date range.
     */
    public function getHomeworkForStudent(int $studentId, string $from, string $to)
    {
        return Homework::whereHas('classSession', function ($query) use ($studentId, $from, $to) {
            $query->where('date', '>=', $from)
                ->where('date', '<=', $to)
                ->whereHas('section', function ($q) use ($studentId) {
                    $q->whereHas('enrollments', function ($e) use ($studentId) {
                        $e->where('student_id', $studentId)
                            ->where('status', 'active');
                    });
                });
        })
            ->with(['classSession.subject', 'classSession.period'])
            ->get();
    }
}
