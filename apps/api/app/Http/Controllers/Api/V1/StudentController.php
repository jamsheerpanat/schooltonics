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
        $students = Student::with([
            'enrollments.section.grade',
            'enrollments.academicYear'
        ])->get();

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
        $student = Student::with([
            'enrollments.section.grade',
            'enrollments.academicYear',
            'guardians'
        ])->findOrFail($id);

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
    public function getToday(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'student') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $student = Student::where('user_id', $user->id)->first();
        if (!$student) {
            return response()->json(['message' => 'Student record not found.'], 404);
        }

        $dateStr = $request->query('date', now()->toDateString());

        $cacheKey = "student_today_{$student->id}_{$dateStr}";

        return \Illuminate\Support\Facades\Cache::remember($cacheKey, 60, function () use ($student, $dateStr, $request) {
            \Illuminate\Support\Facades\Log::debug("Cache miss: {$cacheKey}");
            return $this->fetchToday($student, $dateStr, $request);
        });
    }

    protected function fetchToday($student, $dateStr, $request)
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        if (!$activeYear) {
            return response()->json(['message' => 'No active academic year.'], 422);
        }

        $enrollment = Enrollment::where('student_id', $student->id)
            ->where('academic_year_id', $activeYear->id)
            ->where('status', 'active')
            ->first();

        if (!$enrollment) {
            return response()->json(['message' => 'Student not enrolled in any section.'], 422);
        }

        $requestedDate = \Carbon\Carbon::parse($dateStr);

        $dayMap = [
            'mon' => 'mon',
            'tue' => 'tue',
            'wed' => 'wed',
            'thu' => 'thu',
            'sun' => 'sun'
        ];
        $dayOfWeek = $dayMap[strtolower($requestedDate->format('D'))] ?? null;

        if (!$dayOfWeek) {
            return response()->json([]);
        }

        $timetable = \App\Models\TimetableEntry::with(['subject', 'period', 'teacher'])
            ->where('section_id', $enrollment->section_id)
            ->where('academic_year_id', $activeYear->id)
            ->where('day_of_week', $dayOfWeek)
            ->get();

        $sessions = \App\Models\ClassSession::where('section_id', $enrollment->section_id)
            ->whereDate('date', $requestedDate->toDateString())
            ->get()
            ->keyBy(function ($item) {
                return "{$item->subject_id}-{$item->period_id}";
            });

        $result = $timetable->map(function ($entry) use ($sessions) {
            $sessionKey = "{$entry->subject_id}-{$entry->period_id}";
            $session = $sessions->get($sessionKey);

            return [
                'subject' => $entry->subject->name,
                'subject_code' => $entry->subject->code,
                'teacher' => $entry->teacher->name,
                'period' => $entry->period->name,
                'start_time' => $entry->period->start_time,
                'end_time' => $entry->period->end_time,
                'is_session_open' => $session ? (bool) $session->opened_at : false,
            ];
        })->sortBy('start_time')->values();

        return response()->json($result);
    }
}
