<?php

namespace App\Services;

use Carbon\Carbon;

class CurrentTimeResolver
{
    /**
     * Get current time based on timezone.
     */
    public function now()
    {
        // For this project, we assume the server time/timezone is configured correctly
        // OR we can hardcode for local testing if needed.
        return Carbon::now();
    }

    /**
     * Get day of week for a date in our enum format.
     */
    public function getDayOfWeek($date)
    {
        $dayOfWeek = strtolower(Carbon::parse($date)->format('D'));

        $dayMap = [
            'mon' => 'mon',
            'tue' => 'tue',
            'wed' => 'wed',
            'thu' => 'thu',
            'sun' => 'sun',
        ];

        return $dayMap[$dayOfWeek] ?? null;
    }
}
