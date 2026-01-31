<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\ClassSession;
use App\Models\Grade;
use App\Models\Period;
use App\Models\Section;
use App\Models\Subject;
use App\Models\TimetableEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherDayTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_can_see_their_day_timeline(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $token = $teacher->createToken('test')->plainTextToken;

        $year = AcademicYear::create(['name' => '2025', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'is_active' => true]);
        $grade = Grade::create(['name' => 'G1']);
        $section = Section::create(['grade_id' => $grade->id, 'name' => 'A']);
        $subject = Subject::create(['name' => 'Math', 'code' => 'MATH']);
        $period = Period::create(['name' => 'P1', 'start_time' => '08:00', 'end_time' => '09:00']);

        // 2026-02-01 is Sunday
        $date = '2026-02-01';

        TimetableEntry::create([
            'academic_year_id' => $year->id,
            'section_id' => $section->id,
            'subject_id' => $subject->id,
            'teacher_user_id' => $teacher->id,
            'day_of_week' => 'sun',
            'period_id' => $period->id,
        ]);

        // Create a session for this day
        ClassSession::create([
            'academic_year_id' => $year->id,
            'section_id' => $section->id,
            'subject_id' => $subject->id,
            'teacher_user_id' => $teacher->id,
            'date' => $date,
            'period_id' => $period->id,
            'opened_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/v1/teacher/my-day?date={$date}");

        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment([
            'class_session_id' => 1,
            'is_opened' => true,
        ]);
        $response->assertJsonPath('0.period.name', 'P1');
    }
}
