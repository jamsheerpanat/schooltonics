<?php

namespace App\Services;

use App\Models\ClassNote;
use App\Models\ClassSession;
use App\Models\AuditLog;
use App\Services\PushNotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ClassNoteService
{
    /**
     * Post notes for a class session.
     */
    public function postNotes(int $sessionId, array $data, int $teacherId)
    {
        $session = ClassSession::findOrFail($sessionId);

        // Rule: Only the teacher who owns the session can post
        if ($session->teacher_user_id !== $teacherId) {
            throw new \Exception("Unauthorized: You are not the owner of this class session.");
        }

        // Rule: Notes are read-only after posting (enforced by checking if exists)
        if ($session->notes()->exists()) {
            throw new \Exception("Notes have already been posted for this session and cannot be modified.");
        }

        $notes = DB::transaction(function () use ($session, $data, $teacherId) {
            $notes = ClassNote::create([
                'class_session_id' => $session->id,
                'content' => $data['content'],
                'attachments' => $data['attachments'] ?? null,
                'posted_at' => now(),
            ]);

            AuditLog::create([
                'user_id' => $teacherId,
                'action' => 'notes_created',
                'entity_type' => 'ClassNote',
                'entity_id' => $notes->id,
                'description' => "Class notes added for session {$session->id}",
            ]);

            return $notes;
        });

        // Notify students and parents
        $this->notifyStakeholders($session, "New Class Notes", "{$session->subject->name} notes available");

        return $notes;
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
     * Get notes for a class session.
     */
    public function getNotesBySession(int $sessionId)
    {
        return ClassNote::where('class_session_id', $sessionId)->first();
    }

    /**
     * Get notes for a student within a date range.
     */
    public function getNotesForStudent(int $studentId, string $from, string $to)
    {
        return ClassNote::whereHas('classSession', function ($query) use ($studentId, $from, $to) {
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
