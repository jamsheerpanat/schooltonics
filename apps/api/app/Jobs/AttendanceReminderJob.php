<?php

namespace App\Jobs;

use App\Models\AcademicYear;
use App\Models\AttendanceSession;
use App\Models\TimetableEntry;
use App\Services\PushNotificationService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AttendanceReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(PushNotificationService $pushService): void
    {
        $now = Carbon::now();
        $date = $now->toDateString();
        $dayMap = [
            0 => 'sunday',
            1 => 'monday',
            2 => 'tuesday',
            3 => 'wednesday',
            4 => 'thursday',
            5 => 'friday',
            6 => 'saturday',
        ];
        $dayOfWeek = $dayMap[$now->dayOfWeek];

        $activeYear = AcademicYear::where('is_active', true)->first();
        if (!$activeYear)
            return;

        // Find all sections that have a class today that has already started
        $sections = TimetableEntry::where('academic_year_id', $activeYear->id)
            ->where('day_of_week', $dayOfWeek)
            ->whereHas('period', function ($query) use ($now) {
                $query->where('start_time', '<=', $now->toTimeString());
            })
            ->with(['section', 'teacher'])
            ->get()
            ->groupBy('section_id');

        foreach ($sections as $sectionId => $entries) {
            // Check if attendance is submitted for this section today
            $session = AttendanceSession::where('section_id', $sectionId)
                ->where('date', $date)
                ->first();

            if (!$session || $session->status !== 'submitted') {
                // Attendance is pending. Notify the teacher of the first period or all teachers?
                // Usually the class teacher or the teacher of the first period is responsible.
                // For this micro-script, we'll notify the teacher of the entry that triggered this.
                foreach ($entries as $entry) {
                    if ($entry->teacher) {
                        $pushService->sendToUser(
                            $entry->teacher,
                            "Attendance Reminder",
                            "Reminder: Attendance pending for {$entry->section->grade->name} - {$entry->section->name}"
                        );
                    }
                }
            }
        }
    }
}
