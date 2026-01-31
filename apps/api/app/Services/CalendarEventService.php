<?php

namespace App\Services;

use App\Models\CalendarEvent;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;

class CalendarEventService
{
    /**
     * Create a new calendar event.
     */
    public function createEvent(array $data, int $userId)
    {
        return DB::transaction(function () use ($data, $userId) {
            $event = CalendarEvent::create([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'visibility' => $data['visibility'] ?? 'all',
                'created_by_user_id' => $userId,
            ]);

            AuditLog::create([
                'user_id' => $userId,
                'action' => 'calendar_event_created',
                'entity_type' => 'CalendarEvent',
                'entity_id' => $event->id,
                'description' => "Calendar event '{$event->title}' created with visibility '{$event->visibility}'",
            ]);

            return $event;
        });
    }

    /**
     * Get calendar events for a specific user role within a date range.
     */
    public function getEvents(string $from, string $to, string $role)
    {
        return CalendarEvent::where(function ($query) use ($from, $to) {
            $query->whereBetween('start_date', [$from, $to])
                ->orWhereBetween('end_date', [$from, $to])
                ->orWhere(function ($q) use ($from, $to) {
                    $q->where('start_date', '<', $from)
                        ->where('end_date', '>', $to);
                });
        })
            ->where(function ($query) use ($role) {
                $query->where('visibility', 'all')
                    ->orWhere('visibility', $role);
            })
            ->orderBy('start_date', 'asc')
            ->get();
    }
}
