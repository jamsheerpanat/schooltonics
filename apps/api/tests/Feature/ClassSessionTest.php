<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Grade;
use App\Models\Period;
use App\Models\Section;
use App\Models\Subject;
use App\Models\TimetableEntry;
use App\Models\User;
use App\Models\Student;
use App\Models\Enrollment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClassSessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_can_open_session_matching_timetable(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $token = $teacher->createToken('test')->plainTextToken;

        $year = AcademicYear::create(['name' => '2025', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'is_active' => true]);
        $grade = Grade::create(['name' => 'G1']);
        $section = Section::create(['grade_id' => $grade->id, 'name' => 'A']);
        $subject = Subject::create(['name' => 'Math', 'code' => 'MATH']);
        $period = Period::create(['name' => 'P1', 'start_time' => '08:00', 'end_time' => '09:00']);

        // Match a date to a day (2026-02-01 is a Sunday)
        $date = '2026-02-01';

        TimetableEntry::create([
            'academic_year_id' => $year->id,
            'section_id' => $section->id,
            'subject_id' => $subject->id,
            'teacher_user_id' => $teacher->id,
            'day_of_week' => 'sun',
            'period_id' => $period->id,
        ]);

        // Add a student to the roster
        $student = Student::create(['name_en' => 'Stud 1', 'dob' => '2015-01-01', 'gender' => 'male']);
        Enrollment::create([
            'student_id' => $student->id,
            'section_id' => $section->id,
            'academic_year_id' => $year->id,
            'status' => 'active'
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/class-sessions/open', [
                'section_id' => $section->id,
                'subject_id' => $subject->id,
                'period_id' => $period->id,
                'date' => $date,
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('session.teacher_user_id', $teacher->id);
        $response->assertJsonCount(1, 'roster');
        $response->assertJsonPath('roster.0.name_en', 'Stud 1');
    }

    public function test_cannot_open_session_if_not_in_timetable(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $token = $teacher->createToken('test')->plainTextToken;

        AcademicYear::create(['name' => '2025', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'is_active' => true]);
        $grade = Grade::create(['name' => 'G1']);
        $section = Section::create(['grade_id' => $grade->id, 'name' => 'A']);
        $subject = Subject::create(['name' => 'Math', 'code' => 'MATH']);
        $period = Period::create(['name' => 'P1', 'start_time' => '08:00', 'end_time' => '09:00']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/class-sessions/open', [
                'section_id' => $section->id,
                'subject_id' => $subject->id,
                'period_id' => $period->id,
                'date' => '2026-02-01', // Sunday
            ]);

        $response->assertStatus(422);
        $response->assertJsonPath('message', 'No matching timetable entry found for this session.');
    }
}
