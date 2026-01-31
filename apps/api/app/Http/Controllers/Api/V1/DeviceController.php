<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\UserDevice;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    /**
     * Register a new device or update an existing one.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'fcm_token' => 'required|string',
            'platform' => 'nullable|string|in:ios,android,web',
            'device_model' => 'nullable|string',
        ]);

        $device = UserDevice::updateOrCreate(
            ['fcm_token' => $validated['fcm_token']],
            [
                'user_id' => $request->user()->id,
                'platform' => $validated['platform'] ?? null,
                'device_model' => $validated['device_model'] ?? null,
                'last_seen_at' => now(),
            ]
        );

        return response()->json($device, 201);
    }

    /**
     * Unregister a device (useful when logging out).
     */
    public function unregister(Request $request)
    {
        $request->validate([
            'fcm_token' => 'required|string',
        ]);

        UserDevice::where('fcm_token', $request->fcm_token)
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json(['message' => 'Device unregistered successfully.']);
    }
}
