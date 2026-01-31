<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\ClassSession;
use App\Models\TimetableEntry;
use App\Services\CurrentTimeResolver;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TeacherController extends Controller
{
    protected $timeResolver;

    public function __construct(CurrentTimeResolver $timeResolver)
    {
        $this->timeResolver = $timeResolver;
    }

    public function getMyDay(Request $request)
    {
        $dateStr = $request->query('date', Carbon::today()->toDateString());
        $requestedDate = Carbon::parse($dateStr);
        $dayOfWeek = $this->timeResolver->getDayOfWeek($requestedDate);

        if (!$dayOfWeek) {
            return response()->json(['message' => 'No school on this day.'], 200);
        }

        $activeYear = AcademicYear::where('is_active', true)->first();
        if (!$activeYear) {
            return response()->json(['message' => 'No active academic year.'], 422);
        }

        $teacher = $request->user();

        // 1. Fetch Timetable
        $timetable = TimetableEntry::with(['section.grade', 'subject', 'period'])
            ->where('teacher_user_id', $teacher->id)
            ->where('academic_year_id', $activeYear->id)
            ->where('day_of_week', $dayOfWeek)
            ->get();

        // 2. Fetch Class Sessions for this day
        $sessions = ClassSession::where('teacher_user_id', $teacher->id)
            ->whereDate('date', $requestedDate->toDateString())
            ->get()
            ->keyBy(function ($item) {
                return "{$item->section_id}-{$item->subject_id}-{$item->period_id}";
            });

        $now = $this->timeResolver->now();
        $isToday = $requestedDate->isToday();

        $timeline = $timetable->map(function ($entry) use ($sessions, $now, $isToday, $requestedDate) {
            $period = $entry->period;
            $sessionId = "{$entry->section_id}-{$entry->subject_id}-{$entry->period_id}";
            $session = $sessions->get($sessionId);

            $startTime = Carbon::createFromTimeString($period->start_time, $requestedDate->timezone);
            $endTime = Carbon::createFromTimeString($period->end_time, $requestedDate->timezone);

            // Determine Status
            if (!$isToday) {
                $status = $requestedDate->isPast() ? 'past' : 'upcoming';
            } else {
                if ($now->lt($startTime)) {
                    $status = 'upcoming';
                } elseif ($now->gt($endTime)) {
                    $status = 'past';
                } else {
                    $status = 'current';
                }
            }

            return [
                'section' => [
                    'id' => $entry->section->id,
                    'name' => $entry->section->name,
                    'grade' => $entry->section->grade->name,
                ],
                'subject' => [
                    'id' => $entry->subject->id,
                    'name' => $entry->subject->name,
                    'code' => $entry->subject->code,
                ],
                'period' => [
                    'id' => $period->id,
                    'name' => $period->name,
                    'start_time' => $period->start_time,
                    'end_time' => $period->end_time,
                ],
                'status' => $status,
                'class_session_id' => $session ? $session->id : null,
                'is_opened' => $session ? (bool) $session->opened_at : false,
                'is_closed' => $session ? (bool) $session->closed_at : false,
            ];
        })->sortBy('period.start_time')->values();

        return response()->json($timeline);
    }
}
