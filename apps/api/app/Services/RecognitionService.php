<?php

namespace App\Services;

use App\Models\Recognition;
use App\Models\ClassSession;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;

class RecognitionService
{
    /**
     * Post a recognition for a student in a class session.
     */
    public function postRecognition(int $sessionId, array $data, int $teacherId)
    {
        $session = ClassSession::findOrFail($sessionId);

        // Ownership check
        if ($session->teacher_user_id !== $teacherId) {
            throw new \Exception("Unauthorized: You are not the owner of this class session.");
        }

        // Validate badge code
        if (!in_array($data['badge_code'], Recognition::ALLOWED_BADGES)) {
            throw new \Exception("Invalid badge code. Allowed: " . implode(', ', Recognition::ALLOWED_BADGES));
        }

        return DB::transaction(function () use ($session, $data, $teacherId) {
            $recognition = Recognition::create([
                'class_session_id' => $session->id,
                'student_id' => $data['student_id'],
                'badge_code' => $data['badge_code'],
                'comment' => $data['comment'] ?? null,
                'posted_at' => now(),
            ]);

            AuditLog::create([
                'user_id' => $teacherId,
                'action' => 'recognition_created',
                'entity_type' => 'Recognition',
                'entity_id' => $recognition->id,
                'description' => "Student {$data['student_id']} recognized with '{$data['badge_code']}' in session {$session->id}",
            ]);

            return $recognition;
        });
    }

    /**
     * Get recognitions for a student.
     */
    public function getRecognitionsForStudent(int $studentId)
    {
        return Recognition::where('student_id', $studentId)
            ->with(['classSession.subject', 'classSession.period'])
            ->orderBy('posted_at', 'desc')
            ->get();
    }
}
