<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Grade;
use App\Models\Section;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcademicController extends Controller
{
    public function storeAcademicYear(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:academic_years',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean',
        ]);

        if ($request->is_active) {
            AcademicYear::where('is_active', true)->update(['is_active' => false]);
        }

        $academicYear = AcademicYear::create($validated);

        return response()->json($academicYear, 201);
    }

    public function activateAcademicYear($id)
    {
        $academicYear = AcademicYear::findOrFail($id);

        DB::transaction(function () use ($academicYear) {
            AcademicYear::where('is_active', true)->update(['is_active' => false]);
            $academicYear->update(['is_active' => true]);
        });

        return response()->json(['message' => "Academic year {$academicYear->name} is now active."]);
    }

    public function storeGrade(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:grades',
            'sort_order' => 'integer',
        ]);

        $grade = Grade::create($validated);

        return response()->json($grade, 201);
    }

    public function storeSection(Request $request)
    {
        $validated = $request->validate([
            'grade_id' => 'required|exists:grades,id',
            'name' => 'required|string',
            'capacity' => 'integer|min:1',
        ]);

        // Unique check for name in the same grade
        $exists = Section::where('grade_id', $request->grade_id)
            ->where('name', $request->name)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'The section name already exists for this grade.'], 422);
        }

        $section = Section::create($validated);

        return response()->json($section, 201);
    }

    public function storeSubject(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:subjects',
            'code' => 'required|string|unique:subjects',
        ]);

        $subject = Subject::create($validated);

        return response()->json($subject, 201);
    }

    public function getStructure()
    {
        $academicYears = AcademicYear::orderBy('start_date', 'desc')->get();
        $grades = Grade::with('sections')->orderBy('sort_order')->get();
        $sections = Section::with('grade')->get();
        $subjects = Subject::all();

        return response()->json([
            'academic_years' => $academicYears,
            'grades' => $grades,
            'sections' => $sections,
            'subjects' => $subjects,
        ]);
    }

    public function getTeachers()
    {
        $teachers = \App\Models\User::where('role', 'teacher')->get();
        return response()->json($teachers);
    }
}
