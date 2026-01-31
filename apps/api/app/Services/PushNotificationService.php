<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PushNotificationService
{
    /**
     * Send a notification to a specific user.
     */
    public function sendToUser(User $user, string $title, string $body, array $data = [])
    {
        $tokens = $user->devices()->pluck('fcm_token')->toArray();

        if (empty($tokens)) {
            return false;
        }

        return $this->sendToTokens($tokens, $title, $body, $data);
    }

    /**
     * Send a notification to multiple tokens.
     */
    public function sendToTokens(array $tokens, string $title, string $body, array $data = [])
    {
        $serverKey = config('services.fcm.server_key');

        if (empty($tokens) || !$serverKey) {
            Log::warning("PushNotificationService: Attempted to send without tokens or server key.");
            return false;
        }

        try {
            // Using FCM Legacy HTTP Send API for simplicity in this micro-script context
            // Note: FCM v1 is recommended for production
            $response = Http::withHeaders([
                'Authorization' => 'key=' . $serverKey,
                'Content-Type' => 'application/json',
            ])->post('https://fcm.googleapis.com/fcm/send', [
                        'registration_ids' => $tokens,
                        'notification' => [
                            'title' => $title,
                            'body' => $body,
                            'sound' => 'default',
                        ],
                        'data' => array_merge($data, [
                            'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                        ]),
                    ]);

            Log::info("Push Notification Sent", [
                'title' => $title,
                'token_count' => count($tokens),
                'response' => $response->json()
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error("Push Notification Error: " . $e->getMessage());
            return false;
        }
    }
}
