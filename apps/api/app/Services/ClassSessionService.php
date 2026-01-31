<?php

namespace App\Services;

use App\Models\AcademicYear;
use App\Models\TimetableEntry;
use App\Models\Period;
use Carbon\Carbon;

class ClassSessionService
{
    /**
     * Validate if a session matches the timetable for a teacher.
     */
    public function validateTimetableMatch($teacherId, $sectionId, $subjectId, $periodId, $date)
    {
        $dayOfWeek = strtolower(Carbon::parse($date)->format('D'));

        // Map PHP/Carbon days to our enum
        $dayMap = [
            'mon' => 'mon',
            'tue' => 'tue',
            'wed' => 'wed',
            'thu' => 'thu',
            'sun' => 'sun',
            'fri' => null, // Holidays usually
            'sat' => null,
        ];

        $mappedDay = $dayMap[$dayOfWeek] ?? null;

        if (!$mappedDay) {
            return false;
        }

        $activeYear = AcademicYear::where('is_active', true)->first();

        return TimetableEntry::where([
            'academic_year_id' => $activeYear->id,
            'teacher_user_id' => $teacherId,
            'section_id' => $sectionId,
            'subject_id' => $subjectId,
            'period_id' => $periodId,
            'day_of_week' => $mappedDay,
        ])->exists();
    }

    /**
     * Resolve the current period based on current time.
     */
    public function getCurrentPeriod()
    {
        $now = Carbon::now()->format('H:i:s');

        return Period::where('start_time', '<=', $now)
            ->where('end_time', '>=', $now)
            ->first();
    }
}
