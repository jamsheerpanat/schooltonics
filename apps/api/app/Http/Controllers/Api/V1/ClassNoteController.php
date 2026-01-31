<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ClassNoteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClassNoteController extends Controller
{
    protected $noteService;

    public function __construct(ClassNoteService $noteService)
    {
        $this->noteService = $noteService;
    }

    /**
     * Teacher: Post notes for a session.
     */
    public function store(Request $request, int $sessionId)
    {
        $request->validate([
            'content' => 'required|string',
            'attachments' => 'nullable|array',
            'attachments.*.name' => 'required_with:attachments|string',
            'attachments.*.url' => 'required_with:attachments|string',
            'attachments.*.type' => 'required_with:attachments|string',
        ]);

        try {
            $notes = $this->noteService->postNotes($sessionId, $request->all(), Auth::id());
            return response()->json($notes, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        }
    }

    /**
     * Teacher: Get notes for a session.
     */
    public function show(int $sessionId)
    {
        $notes = $this->noteService->getNotesBySession($sessionId);
        return response()->json($notes);
    }

    /**
     * Student: Get notes for my classes.
     */
    public function studentNotes(Request $request)
    {
        $request->validate([
            'from' => 'required|date',
            'to' => 'required|date',
        ]);

        $student = Auth::user()->student;
        if (!$student) {
            return response()->json(['error' => 'Student record not found.'], 404);
        }

        $notes = $this->noteService->getNotesForStudent($student->id, $request->from, $request->to);
        return response()->json($notes);
    }

    /**
     * Parent: Get notes for my child.
     */
    public function parentNotes(Request $request, int $studentId)
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

        $notes = $this->noteService->getNotesForStudent($studentId, $request->from, $request->to);
        return response()->json($notes);
    }
}
