<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use App\Models\AttendanceSession;
use App\Models\AttendanceRecord;
use App\Models\Student;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    protected $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    public function initializeSession(Request $request)
    {
        $validated = $request->validate([
            'section_id' => 'required|integer',
            'date' => 'required|date',
        ]);

        try {
            $session = $this->attendanceService->createOrGetSession(
                $validated['section_id'],
                $validated['date'],
                $request->user()->id
            );

            $data = $this->attendanceService->getSessionWithRoster($session->id);

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function submitSession(Request $request, $id)
    {
        $validated = $request->validate([
            'records' => 'required|array',
            'records.*.student_id' => 'required|integer',
            'records.*.status' => 'required|in:present,absent',
            'records.*.reason' => 'nullable|string',
        ]);

        try {
            $session = $this->attendanceService->submitSession(
                $id,
                $validated['records'],
                $request->user()->id
            );

            $summary = [
                'session_id' => $session->id,
                'status' => $session->status,
                'present_count' => $session->records->where('status', 'present')->count(),
                'absent_count' => $session->records->where('status', 'absent')->count(),
            ];

            return response()->json($summary);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function getSectionAttendance(Request $request, $sectionId)
    {
        $date = $request->query('date', now()->toDateString());

        try {
            $dateFormatted = Carbon::parse($date)->toDateString();
            $session = AttendanceSession::where('section_id', $sectionId)
                ->where('date', $dateFormatted)
                ->first();

            if (!$session) {
                return response()->json(['message' => 'No attendance recorded for this date.'], 404);
            }

            return response()->json($this->attendanceService->getSessionWithRoster($session->id));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function getStudentAttendance(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'student') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $from = $request->query('from', now()->startOfMonth()->toDateString());
        $to = $request->query('to', now()->toDateString());

        $student = Student::where('user_id', $user->id)->firstOrFail();

        $records = AttendanceRecord::where('student_id', $student->id)
            ->whereHas('session', function ($query) use ($from, $to) {
                $query->whereBetween('date', [$from, $to]);
            })
            ->with([
                'session' => function ($query) {
                    $query->select('id', 'date', 'status');
                }
            ])
            ->get()
            ->map(function ($record) {
                $date = $record->session->date;
                return [
                    'date' => $date instanceof Carbon ? $date->toDateString() : Carbon::parse($date)->toDateString(),
                    'status' => $record->status,
                    'reason' => $record->reason,
                ];
            });

        return response()->json($records);
    }

    public function getParentChildAttendance(Request $request, $studentId)
    {
        $from = $request->query('from', now()->startOfMonth()->toDateString());
        $to = $request->query('to', now()->toDateString());

        $records = AttendanceRecord::where('student_id', $studentId)
            ->whereHas('session', function ($query) use ($from, $to) {
                $query->whereBetween('date', [$from, $to]);
            })
            ->with([
                'session' => function ($query) {
                    $query->select('id', 'date', 'status');
                }
            ])
            ->get()
            ->map(function ($record) {
                $date = $record->session->date;
                return [
                    'date' => $date instanceof Carbon ? $date->toDateString() : Carbon::parse($date)->toDateString(),
                    'status' => $record->status,
                    'reason' => $record->reason,
                ];
            });

        return response()->json($records);
    }

    public function getPrincipalSummary(Request $request)
    {
        $date = $request->query('date', now()->toDateString());
        return response()->json($this->attendanceService->getPrincipalSummary($date));
    }
}
