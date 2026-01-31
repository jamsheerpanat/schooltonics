<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Grade;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentTest extends TestCase
{
    use RefreshDatabase;

    public function test_office_admin_can_create_student(): void
    {
        $user = User::factory()->create(['role' => 'office']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/students', [
                'name_en' => 'John Doe',
                'dob' => '2015-05-10',
                'gender' => 'male',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('students', ['name_en' => 'John Doe']);
        $this->assertNotEmpty($response->json('student_no'));
    }

    public function test_office_admin_can_enroll_student_in_active_year(): void
    {
        $user = User::factory()->create(['role' => 'office']);
        $token = $user->createToken('test')->plainTextToken;

        $year = AcademicYear::create(['name' => '2025', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'is_active' => true]);
        $grade = Grade::create(['name' => 'KG']);
        $section = Section::create(['grade_id' => $grade->id, 'name' => 'A']);
        $student = Student::create(['name_en' => 'Jane Doe', 'dob' => '2018-01-01', 'gender' => 'female']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/v1/students/{$student->id}/enroll", [
                'section_id' => $section->id,
                'roll_no' => '101',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'academic_year_id' => $year->id,
            'section_id' => $section->id,
            'roll_no' => '101'
        ]);
    }

    public function test_cannot_enroll_twice_in_same_academic_year(): void
    {
        $user = User::factory()->create(['role' => 'office']);
        $token = $user->createToken('test')->plainTextToken;

        $year = AcademicYear::create(['name' => '2025', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'is_active' => true]);
        $grade = Grade::create(['name' => 'KG']);
        $section = Section::create(['grade_id' => $grade->id, 'name' => 'A']);
        $student = Student::create(['name_en' => 'Jane Doe', 'dob' => '2018-01-01', 'gender' => 'female']);

        // First enrollment
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/v1/students/{$student->id}/enroll", ['section_id' => $section->id]);

        // Second enrollment effort
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/v1/students/{$student->id}/enroll", ['section_id' => $section->id]);

        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => "Student is already enrolled in academic year: 2025"]);
    }
}
