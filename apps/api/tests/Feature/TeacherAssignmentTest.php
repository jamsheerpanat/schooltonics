<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Grade;
use App\Models\Section;
use App\Models\Subject;
use App\Models\User;
use App\Models\TeacherAssignment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherAssignmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_office_admin_can_assign_teacher_to_subject_and_section(): void
    {
        $admin = User::factory()->create(['role' => 'office']);
        $token = $admin->createToken('test')->plainTextToken;

        $teacher = User::factory()->create(['role' => 'teacher']);
        $year = AcademicYear::create(['name' => '2025', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'is_active' => true]);
        $grade = Grade::create(['name' => 'Grade 1']);
        $section = Section::create(['grade_id' => $grade->id, 'name' => 'A']);
        $subject = Subject::create(['name' => 'Math', 'code' => 'MATH']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/teacher-assignments', [
                'teacher_user_id' => $teacher->id,
                'section_id' => $section->id,
                'subject_id' => $subject->id,
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('teacher_assignments', [
            'teacher_user_id' => $teacher->id,
            'academic_year_id' => $year->id,
            'section_id' => $section->id,
            'subject_id' => $subject->id,
        ]);
    }

    public function test_cannot_assign_non_teacher_role(): void
    {
        $admin = User::factory()->create(['role' => 'office']);
        $token = $admin->createToken('test')->plainTextToken;

        $student = User::factory()->create(['role' => 'student']);
        $year = AcademicYear::create(['name' => '2025', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'is_active' => true]);
        $grade = Grade::create(['name' => 'Grade 1']);
        $section = Section::create(['grade_id' => $grade->id, 'name' => 'A']);
        $subject = Subject::create(['name' => 'Math', 'code' => 'MATH']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/teacher-assignments', [
                'teacher_user_id' => $student->id,
                'section_id' => $section->id,
                'subject_id' => $subject->id,
            ]);

        $response->assertStatus(422);
    }

    public function test_cannot_assign_without_active_academic_year(): void
    {
        $admin = User::factory()->create(['role' => 'office']);
        $token = $admin->createToken('test')->plainTextToken;

        $teacher = User::factory()->create(['role' => 'teacher']);
        $grade = Grade::create(['name' => 'Grade 1']);
        $section = Section::create(['grade_id' => $grade->id, 'name' => 'A']);
        $subject = Subject::create(['name' => 'Math', 'code' => 'MATH']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/teacher-assignments', [
                'teacher_user_id' => $teacher->id,
                'section_id' => $section->id,
                'subject_id' => $subject->id,
            ]);

        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'No active academic year found.']);
    }
}
