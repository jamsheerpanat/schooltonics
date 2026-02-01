<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TeacherAnalyticsController extends Controller
{
    public function getOverview(Request $request)
    {
        $teacher = $request->user();

        if (!in_array($teacher->role, ['teacher', 'principal', 'office'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $activeYear = AcademicYear::where('is_active', true)->first();
        if (!$activeYear) {
            return response()->json(['message' => 'No active academic year'], 422);
        }

        // 1. Attendance Trends (Last 30 days)
        $attendanceQuery = DB::table('attendance_sessions')
            ->join('attendance_records', 'attendance_sessions.id', '=', 'attendance_records.attendance_session_id')
            ->where('attendance_sessions.academic_year_id', $activeYear->id)
            ->where('attendance_sessions.date', '>=', now()->subDays(30));

        if (!in_array($teacher->role, ['principal', 'office'])) {
            $attendanceQuery->where('attendance_sessions.created_by_user_id', $teacher->id);
        }

        $attendanceTrends = $attendanceQuery->select(
            'attendance_sessions.date',
            DB::raw("COUNT(CASE WHEN attendance_records.status = 'present' THEN 1 END) as present"),
            DB::raw("COUNT(*) as total")
        )
            ->groupBy('attendance_sessions.date')
            ->orderBy('attendance_sessions.date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => Carbon::parse($item->date)->format('M d'),
                    'rate' => $item->total > 0 ? round(($item->present / $item->total) * 100, 1) : 0
                ];
            });

        // 2. Grade Distribution (Last assignments)
        $gradeQuery = DB::table('assignments')
            ->join('assignment_submissions', 'assignments.id', '=', 'assignment_submissions.assignment_id');

        if (!in_array($teacher->role, ['principal', 'office'])) {
            $gradeQuery->where('assignments.teacher_id', $teacher->id);
        }

        $grades = $gradeQuery->whereNotNull('assignment_submissions.grade')
            ->select(
                DB::raw("CASE 
                    WHEN (grade/max_marks) >= 0.9 THEN 'A'
                    WHEN (grade/max_marks) >= 0.8 THEN 'B'
                    WHEN (grade/max_marks) >= 0.7 THEN 'C'
                    WHEN (grade/max_marks) >= 0.6 THEN 'D'
                    ELSE 'F' 
                END as letter"),
                DB::raw("COUNT(*) as count")
            )
            ->groupBy('letter')
            ->orderBy('letter')
            ->get();

        // 3. Section Comparison
        $sectionQuery = DB::table('teacher_assignments')
            ->join('sections', 'teacher_assignments.section_id', '=', 'sections.id')
            ->join('grades', 'sections.grade_id', '=', 'grades.id')
            ->join('assignments', 'sections.id', '=', 'assignments.section_id')
            ->join('assignment_submissions', 'assignments.id', '=', 'assignment_submissions.assignment_id');

        if (!in_array($teacher->role, ['principal', 'office'])) {
            $sectionQuery->where('teacher_assignments.teacher_user_id', $teacher->id);
        }

        $sectionPerformance = $sectionQuery->whereNotNull('assignment_submissions.grade')
            ->select(
                DB::raw("grades.name || ' - ' || sections.name as name"),
                DB::raw("AVG(assignment_submissions.grade / assignments.max_marks * 100) as average")
            )
            ->groupBy(DB::raw("grades.name || ' - ' || sections.name"))
            ->get();

        return response()->json([
            'attendanceTrends' => $attendanceTrends,
            'gradeDistribution' => $grades,
            'sectionPerformance' => $sectionPerformance,
            'summary' => [
                'avgAttendance' => $attendanceTrends->avg('rate') ?: 0,
                'avgGrade' => $sectionPerformance->avg('average') ?: 0,
                'totalAssignments' => (function () use ($teacher) {
                    $q = DB::table('assignments');
                    if (!in_array($teacher->role, ['principal', 'office'])) {
                        $q->where('teacher_id', $teacher->id);
                    }
                    return $q->count();
                })()
            ]
        ]);
    }
}
