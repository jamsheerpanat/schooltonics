<?php

namespace App\Services;

use App\Models\CalendarEvent;
use App\Models\AuditLog;
use App\Services\PushNotificationService;
use Illuminate\Support\Facades\DB;

class CalendarEventService
{
    /**
     * Create a new calendar event.
     */
    public function createEvent(array $data, int $userId)
    {
        $event = DB::transaction(function () use ($data, $userId) {
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

        // Trigger Push Notification
        $this->notifyAudience(
            $event->visibility,
            "New Calendar Event",
            "{$event->title} on " . $event->start_date->format('M d')
        );

        return $event;
    }

    /**
     * Notify users based on visibility.
     */
    protected function notifyAudience(string $visibility, string $title, string $body)
    {
        $query = \App\Models\User::query()->where('status', 'active');

        if ($visibility !== 'all') {
            $query->where('role', $visibility);
        }

        $users = $query->get();
        $pushService = app(PushNotificationService::class);

        foreach ($users as $user) {
            $pushService->sendToUser($user, $title, $body);
        }
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
