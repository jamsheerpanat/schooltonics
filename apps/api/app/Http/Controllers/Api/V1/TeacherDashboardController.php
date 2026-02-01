<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\TimetableEntry;
use App\Models\AcademicYear;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TeacherDashboardController extends Controller
{
    /**
     * Get teacher dashboard overview
     */
    public function getDashboard(Request $request)
    {
        $teacher = $request->user();

        if (!in_array($teacher->role, ['teacher', 'principal', 'office'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $activeYear = AcademicYear::where('is_active', true)->first();

        if (!$activeYear) {
            return response()->json(['message' => 'No active academic year'], 422);
        }

        // Get teacher's class assignments
        $assignments = DB::table('teacher_assignments')
            ->where('teacher_user_id', $teacher->id)
            ->where('academic_year_id', $activeYear->id)
            ->get();

        $sectionIds = $assignments->pluck('section_id')->unique();

        // Count total students
        $totalStudents = Enrollment::whereIn('section_id', $sectionIds)
            ->where('academic_year_id', $activeYear->id)
            ->where('status', 'active')
            ->distinct('student_id')
            ->count('student_id');

        // Count total classes
        $totalClasses = $sectionIds->count();

        // Get today's schedule
        $today = Carbon::now();
        $dayOfWeek = strtolower($today->format('D'));

        $todaySchedule = TimetableEntry::with(['subject', 'period', 'section.grade'])
            ->where('teacher_user_id', $teacher->id)
            ->where('academic_year_id', $activeYear->id)
            ->where('day_of_week', $dayOfWeek)
            ->whereIn('section_id', $sectionIds)
            ->orderBy('period_id')
            ->get();

        // Count pending assignments (mock data for now)
        $pendingAssignments = 0;

        // Get recent activity (mock data for now)
        $recentActivity = [];

        // Calculate attendance rate (mock data for now)
        $attendanceRate = 95.5;

        return response()->json([
            'stats' => [
                'total_classes' => $totalClasses,
                'total_students' => $totalStudents,
                'pending_assignments' => $pendingAssignments,
                'attendance_rate' => $attendanceRate,
            ],
            'today_schedule' => $todaySchedule->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'subject' => $entry->subject->name,
                    'subject_code' => $entry->subject->code,
                    'section' => $entry->section->grade->name . ' - ' . $entry->section->name,
                    'period' => $entry->period->name,
                    'start_time' => $entry->period->start_time,
                    'end_time' => $entry->period->end_time,
                ];
            }),
            'recent_activity' => $recentActivity,
            'academic_year' => [
                'id' => $activeYear->id,
                'name' => $activeYear->name,
            ],
        ]);
    }

    /**
     * Get teacher's class list
     */
    public function getClasses(Request $request)
    {
        $teacher = $request->user();

        if (!in_array($teacher->role, ['teacher', 'principal', 'office'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $activeYear = AcademicYear::where('is_active', true)->first();

        if (!$activeYear) {
            return response()->json(['message' => 'No active academic year'], 422);
        }

        $query = DB::table('teacher_assignments')
            ->join('sections', 'teacher_assignments.section_id', '=', 'sections.id')
            ->join('grades', 'sections.grade_id', '=', 'grades.id')
            ->join('subjects', 'teacher_assignments.subject_id', '=', 'subjects.id')
            ->where('teacher_assignments.academic_year_id', $activeYear->id);

        if (!in_array($teacher->role, ['principal', 'office'])) {
            $query->where('teacher_assignments.teacher_user_id', $teacher->id);
        }

        $assignments = $query->select(
            'teacher_assignments.id as teacher_assignment_id',
            'sections.id as section_id',
            'sections.name as section_name',
            'grades.name as grade_name',
            'subjects.id as subject_id',
            'subjects.name as subject_name',
            'subjects.code as subject_code'
        )
            ->get();

        // Get student count for each section
        $classes = $assignments->map(function ($assignment) use ($activeYear) {
            $studentCount = Enrollment::where('section_id', $assignment->section_id)
                ->where('academic_year_id', $activeYear->id)
                ->where('status', 'active')
                ->count();

            return [
                'id' => $assignment->teacher_assignment_id,
                'section_id' => $assignment->section_id,
                'section_name' => $assignment->grade_name . ' - ' . $assignment->section_name,
                'subject' => $assignment->subject_name,
                'subject_code' => $assignment->subject_code,
                'subject_id' => $assignment->subject_id,
                'student_count' => $studentCount,
            ];
        });

        return response()->json($classes);
    }

    /**
     * Get class detail with students
     */
    public function getClassDetail(Request $request, $sectionId)
    {
        $teacher = $request->user();

        if (!in_array($teacher->role, ['teacher', 'principal', 'office'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $activeYear = AcademicYear::where('is_active', true)->first();

        if (!$activeYear) {
            return response()->json(['message' => 'No active academic year'], 422);
        }

        // Verify teacher has access to this section
        $hasAccess = DB::table('teacher_assignments')
            ->where('teacher_user_id', $teacher->id)
            ->where('section_id', $sectionId)
            ->where('academic_year_id', $activeYear->id)
            ->exists();

        if (!$hasAccess && !in_array($teacher->role, ['principal', 'office'])) {
            return response()->json(['message' => 'Unauthorized access to this class'], 403);
        }

        // Get section details
        $section = DB::table('sections')
            ->join('grades', 'sections.grade_id', '=', 'grades.id')
            ->where('sections.id', $sectionId)
            ->select(
                'sections.id',
                'sections.name as section_name',
                'sections.capacity',
                'grades.name as grade_name'
            )
            ->first();

        // Get students
        $students = DB::table('enrollments')
            ->join('students', 'enrollments.student_id', '=', 'students.id')
            ->where('enrollments.section_id', $sectionId)
            ->where('enrollments.academic_year_id', $activeYear->id)
            ->where('enrollments.status', 'active')
            ->select(
                'students.id',
                'students.name_en',
                'students.student_no',
                'students.gender',
                'enrollments.roll_no'
            )
            ->orderBy('enrollments.roll_no')
            ->get();

        return response()->json([
            'section' => [
                'id' => $section->id,
                'name' => $section->grade_name . ' - ' . $section->section_name,
                'grade' => $section->grade_name,
                'section' => $section->section_name,
                'capacity' => $section->capacity,
                'student_count' => $students->count(),
            ],
            'students' => $students,
        ]);
    }
}
