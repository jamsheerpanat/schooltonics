<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Period;
use App\Models\TimetableEntry;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TimetableController extends Controller
{
    public function storePeriod(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'sort_order' => 'integer',
        ]);

        $period = Period::create($validated);

        return response()->json($period, 201);
    }

    public function storeTimetableEntry(Request $request)
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        if (!$activeYear) {
            return response()->json(['message' => 'No active academic year found.'], 422);
        }

        $validated = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_user_id' => [
                'required',
                Rule::exists('users', 'id')->where(function ($query) {
                    $query->where('role', 'teacher');
                }),
            ],
            'day_of_week' => 'required|in:mon,tue,wed,thu,sun',
            'period_id' => 'required|exists:periods,id',
        ]);

        // Check for section overlap
        $sectionOverlap = TimetableEntry::where([
            'academic_year_id' => $activeYear->id,
            'section_id' => $validated['section_id'],
            'day_of_week' => $validated['day_of_week'],
            'period_id' => $validated['period_id'],
        ])->exists();

        if ($sectionOverlap) {
            return response()->json(['message' => 'This section already has a subject assigned for this period and day.'], 422);
        }

        // Check for teacher overlap
        $teacherOverlap = TimetableEntry::where([
            'academic_year_id' => $activeYear->id,
            'teacher_user_id' => $validated['teacher_user_id'],
            'day_of_week' => $validated['day_of_week'],
            'period_id' => $validated['period_id'],
        ])->exists();

        if ($teacherOverlap) {
            return response()->json(['message' => 'This teacher is already assigned to another section for this period and day.'], 422);
        }

        $entry = TimetableEntry::create(array_merge($validated, [
            'academic_year_id' => $activeYear->id
        ]));

        return response()->json($entry->load(['subject', 'teacher', 'period']), 201);
    }

    public function getBySection($sectionId)
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        if (!$activeYear) {
            return response()->json(['message' => 'No active academic year found.'], 422);
        }

        $timetable = TimetableEntry::with(['subject', 'teacher', 'period'])
            ->where('section_id', $sectionId)
            ->where('academic_year_id', $activeYear->id)
            ->get()
            ->groupBy('day_of_week');

        return response()->json($timetable);
    }

    public function getByTeacher($teacherId)
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        if (!$activeYear) {
            return response()->json(['message' => 'No active academic year found.'], 422);
        }

        $timetable = TimetableEntry::with(['subject', 'section.grade', 'period'])
            ->where('teacher_user_id', $teacherId)
            ->where('academic_year_id', $activeYear->id)
            ->get()
            ->groupBy('day_of_week');

        return response()->json($timetable);
    }
}
