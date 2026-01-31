<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AttendanceSession;
use App\Models\Section;
use App\Models\StudentDue;
use App\Models\Student;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function dailyAttendance(Request $request)
    {
        $date = $request->input('date', date('Y-m-d'));

        // simple report: list all sections and their submission status
        $sections = Section::with(['grade'])
            ->where('is_active', true)
            ->get();

        $submissions = AttendanceSession::where('date', $date)
            ->get()
            ->keyBy('section_id');

        $report = $sections->map(function ($section) use ($submissions) {
            $submission = $submissions->get($section->id);
            return [
                'section_id' => $section->id,
                'section_name' => $section->grade->name . ' - ' . $section->name,
                'status' => $submission ? $submission->status : 'pending',
                'submitted_at' => $submission ? $submission->submitted_at : null,
                'submitted_by' => $submission ? $submission->creator->name : null,
            ];
        });

        return response()->json([
            'date' => $date,
            'data' => $report
        ]);
    }

    public function outstandingDues(Request $request)
    {
        // Get all unpaid dues grouped by student
        $dues = StudentDue::where('status', '!=', 'paid')
            ->select('student_id', DB::raw('SUM(amount) as total_due'))
            ->groupBy('student_id')
            ->with([
                'student' => function ($q) {
                    $q->select('id', 'name_en', 'student_no');
                }
            ])
            ->get();

        // Filter out any 0 balance if partial logic messed up (safety)
        $report = $dues->filter(fn($d) => $d->total_due > 0)->values();

        return response()->json([
            'generated_at' => now(),
            'data' => $report
        ]);
    }

    public function studentList(Request $request)
    {
        $sectionId = $request->input('section_id');

        $query = Enrollment::where('status', 'active')
            ->with(['student', 'section.grade']);

        if ($sectionId) {
            $query->where('section_id', $sectionId);
        }

        $enrollments = $query->get();

        $report = $enrollments->map(function ($enrollment) {
            return [
                'student_id' => $enrollment->student->id,
                'student_no' => $enrollment->student->student_no,
                'name' => $enrollment->student->name_en,
                'grade_section' => $enrollment->section->grade->name . ' - ' . $enrollment->section->name,
                'dob' => $enrollment->student->dob,
                'gender' => $enrollment->student->gender,
            ];
        });

        return response()->json([
            'count' => $report->count(),
            'data' => $report
        ]);
    }
}
