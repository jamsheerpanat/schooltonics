<?php

namespace App\Services;

use App\Models\Homework;
use App\Models\ClassSession;
use App\Models\AuditLog;
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

        return DB::transaction(function () use ($session, $data, $teacherId) {
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
