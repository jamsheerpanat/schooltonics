<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_returns_success(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'ok',
                'app' => 'OctoSchoolEngine',
                'version' => 'v1',
            ]);

        // Assert Request ID header is present
        $response->assertHeader('X-Request-ID');
    }
}
