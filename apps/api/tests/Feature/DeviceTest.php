<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserDevice;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeviceTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_device(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/devices/register', [
                'fcm_token' => 'sample-token-123',
                'platform' => 'ios',
                'device_model' => 'iPhone 15',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('user_devices', [
            'user_id' => $user->id,
            'fcm_token' => 'sample-token-123',
        ]);
    }

    public function test_user_can_unregister_device(): void
    {
        $user = User::factory()->create();
        $device = UserDevice::create([
            'user_id' => $user->id,
            'fcm_token' => 'bye-bye-token',
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/devices/unregister', [
                'fcm_token' => 'bye-bye-token',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('user_devices', ['fcm_token' => 'bye-bye-token']);
    }

    public function test_token_is_updated_if_registered_by_another_user(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Initially registered to user1
        UserDevice::create(['user_id' => $user1->id, 'fcm_token' => 'shared-token']);

        $token2 = $user2->createToken('test')->plainTextToken;

        // User 2 registers the same token
        $response = $this->withHeader('Authorization', 'Bearer ' . $token2)
            ->postJson('/api/v1/devices/register', [
                'fcm_token' => 'shared-token',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('user_devices', [
            'user_id' => $user2->id,
            'fcm_token' => 'shared-token',
        ]);
        $this->assertDatabaseMissing('user_devices', ['user_id' => $user1->id, 'fcm_token' => 'shared-token']);
    }
}
