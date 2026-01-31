<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\RecognitionService;
use App\Models\Recognition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RecognitionController extends Controller
{
    protected $recognitionService;

    public function __construct(RecognitionService $recognitionService)
    {
        $this->recognitionService = $recognitionService;
    }

    /**
     * Teacher: Post recognition for a student.
     */
    public function store(Request $request, int $sessionId)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'badge_code' => 'required|string|in:' . implode(',', Recognition::ALLOWED_BADGES),
            'comment' => 'nullable|string|max:500',
        ]);

        try {
            $recognition = $this->recognitionService->postRecognition($sessionId, $request->all(), Auth::id());
            return response()->json($recognition, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        }
    }

    /**
     * Student: Get my recognitions.
     */
    public function studentRecognition()
    {
        $student = Auth::user()->student;
        if (!$student) {
            return response()->json(['error' => 'Student record not found.'], 404);
        }

        $recognitions = $this->recognitionService->getRecognitionsForStudent($student->id);
        return response()->json($recognitions);
    }

    /**
     * Parent: Get child's recognitions.
     */
    public function parentRecognition(int $studentId)
    {
        // Verify relationship
        $guardian = Auth::user()->guardian;
        if (!$guardian || !$guardian->students()->where('student_id', $studentId)->exists()) {
            return response()->json(['error' => 'Unauthorized or student not found.'], 403);
        }

        $recognitions = $this->recognitionService->getRecognitionsForStudent($studentId);
        return response()->json($recognitions);
    }
}
