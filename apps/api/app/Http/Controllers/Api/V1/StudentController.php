<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::with('activeEnrollment.section.grade')->get();
        return response()->json($students);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_en' => 'required|string|max:255',
            'dob' => 'required|date',
            'gender' => 'required|in:male,female,other',
        ]);

        $student = Student::create($validated);

        return response()->json($student, 201);
    }

    public function show($id)
    {
        $student = Student::with(['enrollments.section.grade', 'enrollments.academicYear'])->findOrFail($id);
        return response()->json($student);
    }

    public function enroll(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $activeYear = AcademicYear::where('is_active', true)->first();

        if (!$activeYear) {
            return response()->json(['message' => 'No active academic year found.'], 422);
        }

        $request->validate([
            'section_id' => 'required|exists:sections,id',
            'roll_no' => 'nullable|string|max:50',
        ]);

        // Check if already enrolled in this active year
        $existing = Enrollment::where('student_id', $student->id)
            ->where('academic_year_id', $activeYear->id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => "Student is already enrolled in academic year: {$activeYear->name}"
            ], 422);
        }

        $enrollment = Enrollment::create([
            'student_id' => $student->id,
            'academic_year_id' => $activeYear->id,
            'section_id' => $request->section_id,
            'roll_no' => $request->roll_no,
            'status' => 'active',
        ]);

        return response()->json($enrollment, 201);
    }
}
