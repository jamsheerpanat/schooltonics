<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Grade;
use App\Models\Section;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcademicTest extends TestCase
{
    use RefreshDatabase;

    public function test_office_admin_can_create_academic_year(): void
    {
        $user = User::factory()->create(['role' => 'office']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/academic-years', [
                'name' => '2024-2025',
                'start_date' => '2024-09-01',
                'end_date' => '2025-06-30',
                'is_active' => true,
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('academic_years', ['name' => '2024-2025', 'is_active' => true]);
    }

    public function test_only_one_academic_year_can_be_active(): void
    {
        $user = User::factory()->create(['role' => 'principal']);
        $token = $user->createToken('test')->plainTextToken;

        $year1 = AcademicYear::create([
            'name' => 'Year 1',
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31',
            'is_active' => true
        ]);

        $year2 = AcademicYear::create([
            'name' => 'Year 2',
            'start_date' => '2025-01-01',
            'end_date' => '2025-12-31',
            'is_active' => false
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/v1/academic-years/{$year2->id}/activate");

        $response->assertStatus(200);
        $this->assertFalse($year1->fresh()->is_active);
        $this->assertTrue($year2->fresh()->is_active);
    }

    public function test_student_cannot_create_academic_structure(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/grades', ['name' => 'Some Grade']);

        $response->assertStatus(403);
    }

    public function test_academic_structure_endpoint_returns_nested_data(): void
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $token = $user->createToken('test')->plainTextToken;

        $year = AcademicYear::create(['name' => '2025', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'is_active' => true]);
        $grade = Grade::create(['name' => 'Grade X', 'sort_order' => 10]);
        $section = Section::create(['grade_id' => $grade->id, 'name' => 'Section A', 'capacity' => 20]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/academic/structure');

        $response->assertStatus(200);
        $response->assertJsonPath('active_year.name', '2025');
        $response->assertJsonCount(1, 'grades');
        $response->assertJsonCount(1, 'grades.0.sections');
        $response->assertJsonPath('grades.0.sections.0.name', 'Section A');
    }
}
