<?php

namespace App\Services;

use App\Models\Announcement;
use App\Models\AnnouncementRead;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnnouncementService
{
    /**
     * Create a new announcement.
     */
    public function createAnnouncement(array $data, int $userId)
    {
        return DB::transaction(function () use ($data, $userId) {
            $announcement = Announcement::create([
                'title' => $data['title'],
                'body' => $data['body'],
                'audience' => $data['audience'] ?? 'all',
                'publish_at' => $data['publish_at'] ?? now(),
                'created_by_user_id' => $userId,
            ]);

            AuditLog::create([
                'user_id' => $userId,
                'action' => 'announcement_created',
                'entity_type' => 'Announcement',
                'entity_id' => $announcement->id,
                'description' => "Announcement '{$announcement->title}' created with audience '{$announcement->audience}'",
            ]);

            return $announcement;
        });
    }

    /**
     * Get announcements for a specific user based on their role.
     */
    public function getAnnouncementsForUser(int $userId, string $role)
    {
        $now = now();

        return Announcement::where('publish_at', '<=', $now)
            ->where(function ($query) use ($role) {
                $query->where('audience', 'all')
                    ->orWhere('audience', $role);
            })
            ->with([
                'reads' => function ($query) use ($userId) {
                    $query->where('user_id', $userId);
                }
            ])
            ->orderBy('publish_at', 'desc')
            ->get();
    }

    /**
     * Mark an announcement as read.
     */
    public function markAsRead(int $announcementId, int $userId)
    {
        return AnnouncementRead::updateOrCreate(
            ['announcement_id' => $announcementId, 'user_id' => $userId],
            ['read_at' => now()]
        );
    }
}
