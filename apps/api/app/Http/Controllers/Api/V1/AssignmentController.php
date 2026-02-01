<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AssignmentController extends Controller
{
    /**
     * Get all assignments for teacher
     */
    public function index(Request $request)
    {
        $teacher = $request->user();

        if (!in_array($teacher->role, ['teacher', 'principal', 'office'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $activeYear = AcademicYear::where('is_active', true)->first();

        if (!$activeYear) {
            return response()->json(['message' => 'No active academic year'], 422);
        }

        $query = DB::table('assignments')
            ->join('sections', 'assignments.section_id', '=', 'sections.id')
            ->join('grades', 'sections.grade_id', '=', 'grades.id')
            ->join('subjects', 'assignments.subject_id', '=', 'subjects.id')
            ->where('assignments.academic_year_id', $activeYear->id);

        if (!in_array($teacher->role, ['principal', 'office'])) {
            $query->where('assignments.teacher_id', $teacher->id);
        }

        $assignments = $query->select(
            'assignments.*',
            'sections.name as section_name',
            'grades.name as grade_name',
            'subjects.name as subject_name',
            'subjects.code as subject_code'
        )
            ->orderBy('assignments.due_date', 'desc')
            ->get();

        // Get submission counts
        $assignmentsWithStats = $assignments->map(function ($assignment) {
            $totalStudents = DB::table('enrollments')
                ->where('section_id', $assignment->section_id)
                ->where('status', 'active')
                ->count();

            $submittedCount = DB::table('assignment_submissions')
                ->where('assignment_id', $assignment->id)
                ->count();

            $gradedCount = DB::table('assignment_submissions')
                ->where('assignment_id', $assignment->id)
                ->whereNotNull('grade')
                ->count();

            return [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'type' => $assignment->type,
                'due_date' => $assignment->due_date,
                'max_marks' => $assignment->max_marks,
                'section' => $assignment->grade_name . ' - ' . $assignment->section_name,
                'subject' => $assignment->subject_name,
                'subject_code' => $assignment->subject_code,
                'total_students' => $totalStudents,
                'submitted' => $submittedCount,
                'graded' => $gradedCount,
                'status' => $this->getAssignmentStatus($assignment->due_date),
            ];
        });

        return response()->json($assignmentsWithStats);
    }

    /**
     * Create new assignment
     */
    public function store(Request $request)
    {
        $teacher = $request->user();

        if (!in_array($teacher->role, ['teacher', 'principal', 'office'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|exists:subjects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:homework,quiz,project,exam,other',
            'due_date' => 'required|date',
            'max_marks' => 'required|integer|min:1',
            'instructions' => 'nullable|string',
        ]);

        $activeYear = AcademicYear::where('is_active', true)->first();

        if (!$activeYear) {
            return response()->json(['message' => 'No active academic year'], 422);
        }

        // Verify teacher has access to this section/subject
        $hasAccess = DB::table('teacher_assignments')
            ->where('teacher_user_id', $teacher->id)
            ->where('section_id', $validated['section_id'])
            ->where('subject_id', $validated['subject_id'])
            ->where('academic_year_id', $activeYear->id)
            ->exists();

        if (!$hasAccess && !in_array($teacher->role, ['principal', 'office'])) {
            return response()->json(['message' => 'Unauthorized access to this class/subject'], 403);
        }

        $assignmentId = DB::table('assignments')->insertGetId([
            'teacher_id' => $teacher->id,
            'section_id' => $validated['section_id'],
            'subject_id' => $validated['subject_id'],
            'academic_year_id' => $activeYear->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'due_date' => $validated['due_date'],
            'max_marks' => $validated['max_marks'],
            'instructions' => $validated['instructions'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $assignment = DB::table('assignments')->where('id', $assignmentId)->first();

        return response()->json($assignment, 201);
    }

    /**
     * Get assignment detail with submissions
     */
    public function show(Request $request, $id)
    {
        $teacher = $request->user();

        if (!in_array($teacher->role, ['teacher', 'principal', 'office'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $assignmentQuery = DB::table('assignments')
            ->join('sections', 'assignments.section_id', '=', 'sections.id')
            ->join('grades', 'sections.grade_id', '=', 'grades.id')
            ->join('subjects', 'assignments.subject_id', '=', 'subjects.id')
            ->where('assignments.id', $id);

        if (!in_array($teacher->role, ['principal', 'office'])) {
            $assignmentQuery->where('assignments.teacher_id', $teacher->id);
        }

        $assignment = $assignmentQuery->select(
            'assignments.*',
            'sections.name as section_name',
            'grades.name as grade_name',
            'subjects.name as subject_name',
            'subjects.code as subject_code'
        )
            ->first();

        if (!$assignment) {
            return response()->json(['message' => 'Assignment not found'], 404);
        }

        // Get all students in the section
        $students = DB::table('enrollments')
            ->join('students', 'enrollments.student_id', '=', 'students.id')
            ->where('enrollments.section_id', $assignment->section_id)
            ->where('enrollments.status', 'active')
            ->select(
                'students.id',
                'students.name_en',
                'students.student_no',
                'enrollments.roll_no'
            )
            ->orderBy('enrollments.roll_no')
            ->get();

        // Get submissions
        $submissions = DB::table('assignment_submissions')
            ->where('assignment_id', $id)
            ->get()
            ->keyBy('student_id');

        // Combine students with their submissions
        $studentsWithSubmissions = $students->map(function ($student) use ($submissions) {
            $submission = $submissions->get($student->id);

            return [
                'student_id' => $student->id,
                'name' => $student->name_en,
                'student_no' => $student->student_no,
                'roll_no' => $student->roll_no,
                'submitted' => $submission ? true : false,
                'submitted_at' => $submission->submitted_at ?? null,
                'grade' => $submission->grade ?? null,
                'feedback' => $submission->feedback ?? null,
                'status' => $this->getSubmissionStatus($submission),
            ];
        });

        return response()->json([
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'type' => $assignment->type,
                'due_date' => $assignment->due_date,
                'max_marks' => $assignment->max_marks,
                'instructions' => $assignment->instructions,
                'section' => $assignment->grade_name . ' - ' . $assignment->section_name,
                'subject' => $assignment->subject_name,
                'subject_code' => $assignment->subject_code,
            ],
            'submissions' => $studentsWithSubmissions,
            'stats' => [
                'total' => $students->count(),
                'submitted' => $submissions->count(),
                'graded' => $submissions->filter(fn($s) => $s->grade !== null)->count(),
                'pending' => $students->count() - $submissions->count(),
            ],
        ]);
    }

    /**
     * Grade a submission
     */
    public function gradeSubmission(Request $request, $assignmentId, $studentId)
    {
        $teacher = $request->user();

        if (!in_array($teacher->role, ['teacher', 'principal', 'office'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'grade' => 'required|numeric|min:0',
            'feedback' => 'nullable|string',
        ]);

        // Verify assignment belongs to teacher
        $assignmentQuery = DB::table('assignments')
            ->where('id', $assignmentId);

        if (!in_array($teacher->role, ['principal', 'office'])) {
            $assignmentQuery->where('teacher_id', $teacher->id);
        }

        $assignment = $assignmentQuery->first();

        if (!$assignment) {
            return response()->json(['message' => 'Assignment not found'], 404);
        }

        // Check if grade exceeds max marks
        if ($validated['grade'] > $assignment->max_marks) {
            return response()->json(['message' => 'Grade cannot exceed maximum marks'], 422);
        }

        // Update or create submission
        DB::table('assignment_submissions')->updateOrInsert(
            [
                'assignment_id' => $assignmentId,
                'student_id' => $studentId,
            ],
            [
                'grade' => $validated['grade'],
                'feedback' => $validated['feedback'] ?? null,
                'graded_at' => now(),
                'updated_at' => now(),
            ]
        );

        return response()->json(['message' => 'Grade submitted successfully']);
    }

    /**
     * Helper: Get assignment status
     */
    private function getAssignmentStatus($dueDate)
    {
        $due = Carbon::parse($dueDate);
        $now = Carbon::now();

        if ($now->gt($due)) {
            return 'overdue';
        } elseif ($now->diffInDays($due) <= 3) {
            return 'due_soon';
        } else {
            return 'active';
        }
    }

    /**
     * Helper: Get submission status
     */
    private function getSubmissionStatus($submission)
    {
        if (!$submission) {
            return 'not_submitted';
        }

        if ($submission->grade !== null) {
            return 'graded';
        }

        return 'submitted';
    }
}
