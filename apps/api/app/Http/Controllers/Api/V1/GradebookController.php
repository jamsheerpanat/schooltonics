<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GradebookController extends Controller
{
    /**
     * Get gradebook for a specific section and subject
     */
    public function getGradebook(Request $request)
    {
        $teacher = $request->user();
        $sectionId = $request->query('section_id');

        if (!in_array($teacher->role, ['teacher', 'principal', 'office'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$sectionId) {
            return response()->json(['message' => 'Section ID is required'], 400);
        }

        $activeYear = AcademicYear::where('is_active', true)->first();
        if (!$activeYear) {
            return response()->json(['message' => 'No active academic year'], 422);
        }

        // Verify teacher access
        $hasAccess = DB::table('teacher_assignments')
            ->where('teacher_user_id', $teacher->id)
            ->where('section_id', $sectionId)
            ->where('academic_year_id', $activeYear->id)
            ->exists();

        if (!$hasAccess && !in_array($teacher->role, ['principal', 'office'])) {
            return response()->json(['message' => 'Unauthorized access to this class'], 403);
        }

        // Get all students in the section
        $students = DB::table('enrollments')
            ->join('students', 'enrollments.student_id', '=', 'students.id')
            ->where('enrollments.section_id', $sectionId)
            ->where('enrollments.status', 'active')
            ->select('students.id', 'students.name_en', 'enrollments.roll_no')
            ->orderBy('enrollments.roll_no')
            ->get();

        $assignmentQuery = DB::table('assignments')
            ->where('section_id', $sectionId)
            ->where('academic_year_id', $activeYear->id);

        if (!in_array($teacher->role, ['principal', 'office'])) {
            $assignmentQuery->where('teacher_id', $teacher->id);
        }

        $assignments = $assignmentQuery->select('id', 'title', 'type', 'max_marks', 'due_date')
            ->orderBy('due_date', 'asc')
            ->get();

        // Get all grades for these assignments
        $assignmentIds = $assignments->pluck('id');
        $grades = DB::table('assignment_submissions')
            ->whereIn('assignment_id', $assignmentIds)
            ->select('assignment_id', 'student_id', 'grade')
            ->get();

        // Organize grades into a map for easy lookup
        $gradesMap = [];
        foreach ($grades as $grade) {
            $gradesMap[$grade->student_id][$grade->assignment_id] = $grade->grade;
        }

        return response()->json([
            'section_info' => DB::table('sections')
                ->join('grades', 'sections.grade_id', '=', 'grades.id')
                ->where('sections.id', $sectionId)
                ->select('sections.name as section_name', 'grades.name as grade_name')
                ->first(),
            'students' => $students,
            'assignments' => $assignments,
            'grades' => $gradesMap,
        ]);
    }
}
