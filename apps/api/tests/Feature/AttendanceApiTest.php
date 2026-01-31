<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Grade;
use App\Models\Section;
use App\Models\TeacherAssignment;
use App\Models\User;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Enrollment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceApiTest extends TestCase
{
    use RefreshDatabase;

    protected $teacher;
    protected $year;
    protected $section;

    protected function setUp(): void
    {
        parent::setUp();

        $this->teacher = User::factory()->create(['role' => 'teacher']);
        $this->year = AcademicYear::create(['name' => '2025', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'is_active' => true]);
        $grade = Grade::create(['name' => 'G1']);
        $this->section = Section::create(['grade_id' => $grade->id, 'name' => 'A']);
        $subject = Subject::create(['name' => 'Math', 'code' => 'MATH']);

        TeacherAssignment::create([
            'academic_year_id' => $this->year->id,
            'teacher_user_id' => $this->teacher->id,
            'section_id' => $this->section->id,
            'subject_id' => $subject->id,
        ]);
    }

    public function test_teacher_can_initialize_session_and_get_roster(): void
    {
        $student = Student::create(['name_en' => 'S1', 'dob' => '2015-01-01', 'gender' => 'male']);
        Enrollment::create([
            'student_id' => $student->id,
            'academic_year_id' => $this->year->id,
            'section_id' => $this->section->id,
            'status' => 'active'
        ]);

        $response = $this->actingAs($this->teacher)
            ->postJson('/api/v1/attendance/sessions', [
                'section_id' => $this->section->id,
                'date' => '2026-02-01'
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('roster.0.student_name', 'S1')
            ->assertJsonPath('roster.0.status', 'present');
    }

    public function test_teacher_can_submit_attendance(): void
    {
        $student = Student::create(['name_en' => 'S1', 'dob' => '2015-01-01', 'gender' => 'male']);
        Enrollment::create([
            'student_id' => $student->id,
            'academic_year_id' => $this->year->id,
            'section_id' => $this->section->id,
            'status' => 'active'
        ]);

        $initResponse = $this->actingAs($this->teacher)
            ->postJson('/api/v1/attendance/sessions', [
                'section_id' => $this->section->id,
                'date' => '2026-02-01'
            ]);

        $sessionId = $initResponse->json('session.id');

        $response = $this->actingAs($this->teacher)
            ->postJson("/api/v1/attendance/sessions/{$sessionId}/submit", [
                'records' => [
                    [
                        'student_id' => $student->id,
                        'status' => 'absent',
                        'reason' => 'Sick'
                    ]
                ]
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('absent_count', 1)
            ->assertJsonPath('status', 'submitted');

        $this->assertDatabaseHas('attendance_records', [
            'student_id' => $student->id,
            'status' => 'absent',
            'reason' => 'Sick'
        ]);
    }
}
