<?php

namespace App\Services;

use App\Models\User;

class PushNotificationService
{
    /**
     * Send a notification to a specific user.
     * Stub for future Firebase implementation.
     */
    public function sendToUser(User $user, string $title, string $body, array $data = [])
    {
        $tokens = $user->devices()->pluck('fcm_token')->toArray();

        if (empty($tokens)) {
            return false;
        }

        // TODO: Implement FCM logic here
        \Log::info("Push Notification Stub: Sent to User ID {$user->id}", [
            'title' => $title,
            'body' => $body,
            'token_count' => count($tokens)
        ]);

        return true;
    }

    /**
     * Send a notification to multiple tokens.
     */
    public function sendToTokens(array $tokens, string $title, string $body, array $data = [])
    {
        if (empty($tokens)) {
            return false;
        }

        \Log::info("Push Notification Stub: Sent to " . count($tokens) . " tokens");

        return true;
    }
}
