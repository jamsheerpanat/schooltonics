<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\ClassSession;
use App\Models\Section;
use App\Services\ClassSessionService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ClassSessionController extends Controller
{
    protected $sessionService;

    public function __construct(ClassSessionService $sessionService)
    {
        $this->sessionService = $sessionService;
    }

    public function open(Request $request)
    {
        $validated = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|exists:subjects,id',
            'period_id' => 'required|exists:periods,id',
            'date' => 'required|date',
        ]);

        $teacher = $request->user();

        // 1. Validate against timetable
        $isValid = $this->sessionService->validateTimetableMatch(
            $teacher->id,
            $validated['section_id'],
            $validated['subject_id'],
            $validated['period_id'],
            $validated['date']
        );

        if (!$isValid) {
            return response()->json(['message' => 'No matching timetable entry found for this session.'], 422);
        }

        $activeYear = AcademicYear::where('is_active', true)->first();

        // 2. Create or find session
        $session = ClassSession::firstOrCreate(
            [
                'section_id' => $validated['section_id'],
                'subject_id' => $validated['subject_id'],
                'period_id' => $validated['period_id'],
                'date' => $validated['date'],
            ],
            [
                'academic_year_id' => $activeYear->id,
                'teacher_user_id' => $teacher->id,
                'opened_at' => now(),
            ]
        );

        // 3. Return student roster
        $section = Section::with('grade')->findOrFail($validated['section_id']);
        $students = $section->grade->sections()->where('id', $section->id)->first()
            ? \App\Models\Enrollment::where('section_id', $section->id)
                ->where('academic_year_id', $activeYear->id)
                ->with('student')
                ->get()
                ->pluck('student')
            : [];

        return response()->json([
            'session' => $session,
            'roster' => $students,
        ], 201);
    }

    public function show($id)
    {
        $session = ClassSession::with(['section.grade', 'subject', 'period', 'teacher'])->findOrFail($id);
        return response()->json($session);
    }
}
