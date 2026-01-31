<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Grade;
use App\Models\Period;
use App\Models\Section;
use App\Models\Subject;
use App\Models\TimetableEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TimetableTest extends TestCase
{
    use RefreshDatabase;

    public function test_office_admin_can_create_period(): void
    {
        $admin = User::factory()->create(['role' => 'office']);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/periods', [
                'name' => 'P1',
                'start_time' => '08:00',
                'end_time' => '09:00',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('periods', ['name' => 'P1']);
    }

    public function test_office_admin_can_create_timetable_entry(): void
    {
        $admin = User::factory()->create(['role' => 'office']);
        $token = $admin->createToken('test')->plainTextToken;

        $year = AcademicYear::create(['name' => '2025', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'is_active' => true]);
        $grade = Grade::create(['name' => 'G1']);
        $section = Section::create(['grade_id' => $grade->id, 'name' => 'A']);
        $subject = Subject::create(['name' => 'Math', 'code' => 'MATH']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $period = Period::create(['name' => 'P1', 'start_time' => '08:00', 'end_time' => '09:00']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/timetable-entries', [
                'section_id' => $section->id,
                'subject_id' => $subject->id,
                'teacher_user_id' => $teacher->id,
                'day_of_week' => 'sun',
                'period_id' => $period->id,
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('timetable_entries', [
            'section_id' => $section->id,
            'day_of_week' => 'sun',
            'period_id' => $period->id,
        ]);
    }

    public function test_cannot_overlap_section_timetable(): void
    {
        $admin = User::factory()->create(['role' => 'office']);
        $token = $admin->createToken('test')->plainTextToken;

        $year = AcademicYear::create(['name' => '2025', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'is_active' => true]);
        $grade = Grade::create(['name' => 'G1']);
        $section = Section::create(['grade_id' => $grade->id, 'name' => 'A']);
        $subject1 = Subject::create(['name' => 'Math', 'code' => 'MATH']);
        $subject2 = Subject::create(['name' => 'English', 'code' => 'ENG']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $period = Period::create(['name' => 'P1', 'start_time' => '08:00', 'end_time' => '09:00']);

        // First entry
        TimetableEntry::create([
            'academic_year_id' => $year->id,
            'section_id' => $section->id,
            'subject_id' => $subject1->id,
            'teacher_user_id' => $teacher->id,
            'day_of_week' => 'sun',
            'period_id' => $period->id,
        ]);

        // Second entry for SAME section, day, period
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/timetable-entries', [
                'section_id' => $section->id,
                'subject_id' => $subject2->id,
                'teacher_user_id' => $teacher->id,
                'day_of_week' => 'sun',
                'period_id' => $period->id,
            ]);

        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'This section already has a subject assigned for this period and day.']);
    }

    public function test_cannot_overlap_teacher_timetable(): void
    {
        $admin = User::factory()->create(['role' => 'office']);
        $token = $admin->createToken('test')->plainTextToken;

        $year = AcademicYear::create(['name' => '2025', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'is_active' => true]);
        $grade = Grade::create(['name' => 'G1']);
        $section1 = Section::create(['grade_id' => $grade->id, 'name' => 'A']);
        $section2 = Section::create(['grade_id' => $grade->id, 'name' => 'B']);
        $subject = Subject::create(['name' => 'Math', 'code' => 'MATH']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $period = Period::create(['name' => 'P1', 'start_time' => '08:00', 'end_time' => '09:00']);

        // Teacher in Section A
        TimetableEntry::create([
            'academic_year_id' => $year->id,
            'section_id' => $section1->id,
            'subject_id' => $subject->id,
            'teacher_user_id' => $teacher->id,
            'day_of_week' => 'sun',
            'period_id' => $period->id,
        ]);

        // Same teacher in Section B at SAME time
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/timetable-entries', [
                'section_id' => $section2->id,
                'subject_id' => $subject->id,
                'teacher_user_id' => $teacher->id,
                'day_of_week' => 'sun',
                'period_id' => $period->id,
            ]);

        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'This teacher is already assigned to another section for this period and day.']);
    }
}
