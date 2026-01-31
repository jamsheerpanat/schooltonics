<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\HomeworkService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HomeworkController extends Controller
{
    protected $homeworkService;

    public function __construct(HomeworkService $homeworkService)
    {
        $this->homeworkService = $homeworkService;
    }

    /**
     * Teacher: Post homework for a session.
     */
    public function store(Request $request, int $sessionId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'instructions' => 'required|string',
            'due_date' => 'nullable|date|after_or_equal:today',
            'attachments' => 'nullable|array',
            'attachments.*.name' => 'required_with:attachments|string',
            'attachments.*.url' => 'required_with:attachments|string',
            'attachments.*.type' => 'required_with:attachments|string',
        ]);

        try {
            $homework = $this->homeworkService->postHomework($sessionId, $request->all(), Auth::id());
            return response()->json($homework, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        }
    }

    /**
     * Teacher: Get homework for a session.
     */
    public function show(int $sessionId)
    {
        $homework = $this->homeworkService->getHomeworkBySession($sessionId);
        return response()->json($homework);
    }

    /**
     * Student: Get homework for my classes.
     */
    public function studentHomework(Request $request)
    {
        $request->validate([
            'from' => 'required|date',
            'to' => 'required|date',
        ]);

        $student = Auth::user()->student;
        if (!$student) {
            return response()->json(['error' => 'Student record not found.'], 404);
        }

        $homework = $this->homeworkService->getHomeworkForStudent($student->id, $request->from, $request->to);
        return response()->json($homework);
    }

    /**
     * Parent: Get homework for my child.
     */
    public function parentHomework(Request $request, int $studentId)
    {
        $request->validate([
            'from' => 'required|date',
            'to' => 'required|date',
        ]);

        // Verify relationship
        $guardian = Auth::user()->guardian;
        if (!$guardian || !$guardian->students()->where('student_id', $studentId)->exists()) {
            return response()->json(['error' => 'Unauthorized or student not found.'], 403);
        }

        $homework = $this->homeworkService->getHomeworkForStudent($studentId, $request->from, $request->to);
        return response()->json($homework);
    }
}
