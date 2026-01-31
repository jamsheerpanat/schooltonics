<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Grade;
use App\Models\Period;
use App\Models\Section;
use App\Models\Student;
use App\Models\Subject;
use App\Models\TimetableEntry;
use App\Models\User;
use App\Models\Enrollment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentTodayTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_fetch_today_timetable(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $token = $user->createToken('test')->plainTextToken;

        $student = Student::create([
            'user_id' => $user->id,
            'name_en' => 'Test Student',
            'dob' => '2015-01-01',
            'gender' => 'male'
        ]);

        $year = AcademicYear::create(['name' => '2025', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'is_active' => true]);
        $grade = Grade::create(['name' => 'G1']);
        $section = Section::create(['grade_id' => $grade->id, 'name' => 'A']);
        $subject = Subject::create(['name' => 'Math', 'code' => 'MATH']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $period = Period::create(['name' => 'P1', 'start_time' => '08:00', 'end_time' => '09:00', 'sort_order' => 1]);

        Enrollment::create([
            'student_id' => $student->id,
            'academic_year_id' => $year->id,
            'section_id' => $section->id,
            'status' => 'active'
        ]);

        // Sunday
        $date = '2026-02-01';

        TimetableEntry::create([
            'academic_year_id' => $year->id,
            'section_id' => $section->id,
            'subject_id' => $subject->id,
            'teacher_user_id' => $teacher->id,
            'day_of_week' => 'sun',
            'period_id' => $period->id,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/v1/student/today?date={$date}");

        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.subject', 'Math');
        $response->assertJsonPath('0.teacher', $teacher->name);
    }
}
