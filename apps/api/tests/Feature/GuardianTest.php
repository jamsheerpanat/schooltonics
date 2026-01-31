<?php

namespace Tests\Feature;

use App\Models\Guardian;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuardianTest extends TestCase
{
    use RefreshDatabase;

    public function test_office_admin_can_create_guardian_and_user(): void
    {
        $admin = User::factory()->create(['role' => 'office']);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/guardians', [
                'name' => 'Michael Smith',
                'phone' => '123456789',
                'email' => 'michael@example.com',
                'relation' => 'Father',
                'password' => 'secret123'
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('guardians', ['email' => 'michael@example.com']);
        $this->assertDatabaseHas('users', ['email' => 'michael@example.com', 'role' => 'parent']);
    }

    public function test_office_admin_can_attach_guardian_to_student(): void
    {
        $admin = User::factory()->create(['role' => 'office']);
        $token = $admin->createToken('test')->plainTextToken;

        $student = Student::create(['name_en' => 'Billy', 'dob' => '2015-01-01', 'gender' => 'male']);
        $guardian = Guardian::create(['name' => 'Dad', 'phone' => '1', 'email' => 'dad@e.com', 'relation' => 'Father']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/v1/students/{$student->id}/guardians/attach", [
                'guardian_id' => $guardian->id,
                'is_primary' => true
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('student_guardians', [
            'student_id' => $student->id,
            'guardian_id' => $guardian->id,
            'is_primary' => true
        ]);
    }

    public function test_parent_can_only_see_their_linked_children(): void
    {
        $student1 = Student::create(['name_en' => 'My Child', 'dob' => '2015-01-01', 'gender' => 'male']);
        $student2 = Student::create(['name_en' => 'Other Child', 'dob' => '2015-01-01', 'gender' => 'female']);

        // Create parent user and guardian
        $parentUser = User::factory()->create(['role' => 'parent', 'email' => 'parent@e.com']);
        $guardian = Guardian::create([
            'user_id' => $parentUser->id,
            'name' => 'Parent Name',
            'phone' => '123',
            'email' => 'parent@e.com',
            'relation' => 'Mother'
        ]);

        // Link only student 1
        $student1->guardians()->attach($guardian->id, ['is_primary' => true]);

        $token = $parentUser->createToken('test')->plainTextToken;

        // Parent should see student 1
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/parent/children');

        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.name_en', 'My Child');

        // Parent should NOT be able to access overview for student 2
        $response2 = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/v1/parent/child/{$student2->id}/overview");

        $response2->assertStatus(403);
    }
}
