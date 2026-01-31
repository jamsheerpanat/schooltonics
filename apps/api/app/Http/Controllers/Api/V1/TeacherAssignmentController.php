<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\TeacherAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TeacherAssignmentController extends Controller
{
    public function index(Request $request)
    {
        $query = TeacherAssignment::with(['teacher', 'academicYear', 'section.grade', 'subject']);

        if ($request->has('teacher_id')) {
            $query->where('teacher_user_id', $request->teacher_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $activeYear = AcademicYear::where('is_active', true)->first();

        if (!$activeYear) {
            return response()->json(['message' => 'No active academic year found.'], 422);
        }

        $validated = $request->validate([
            'teacher_user_id' => [
                'required',
                Rule::exists('users', 'id')->where(function ($query) {
                    $query->where('role', 'teacher');
                }),
            ],
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|exists:subjects,id',
        ]);

        $assignment = TeacherAssignment::updateOrCreate(
            array_merge($validated, ['academic_year_id' => $activeYear->id])
        );

        return response()->json($assignment->load(['teacher', 'section.grade', 'subject']), 201);
    }
}
