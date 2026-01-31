<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\AttendanceSession;
use App\Models\Grade;
use App\Models\Section;
use App\Models\TeacherAssignment;
use App\Models\User;
use App\Models\Subject;
use App\Services\AttendanceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceIntegrityTest extends TestCase
{
    use RefreshDatabase;

    public function test_cannot_create_duplicate_attendance_session_for_same_section_and_date(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $year = AcademicYear::create(['name' => '2025', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'is_active' => true]);
        $grade = Grade::create(['name' => 'G1']);
        $section = Section::create(['grade_id' => $grade->id, 'name' => 'A']);
        $subject = Subject::create(['name' => 'Math', 'code' => 'MATH']);

        TeacherAssignment::create([
            'academic_year_id' => $year->id,
            'teacher_user_id' => $teacher->id,
            'section_id' => $section->id,
            'subject_id' => $subject->id,
        ]);

        $service = new AttendanceService();
        $date = '2026-02-01';

        // First session
        $service->createOrGetSession($section->id, $date, $teacher->id);
        $this->assertDatabaseCount('attendance_sessions', 1);

        // Second session for same section/date
        $service->createOrGetSession($section->id, $date, $teacher->id);

        // Count should still be 1 because of firstOrCreate
        $this->assertDatabaseCount('attendance_sessions', 1);

        // Try to force direct database insert to prove unique constraint
        $this->expectException(\Illuminate\Database\UniqueConstraintViolationException::class);
        AttendanceSession::create([
            'academic_year_id' => $year->id,
            'section_id' => $section->id,
            'date' => $date,
            'created_by_teacher_id' => $teacher->id,
            'status' => 'draft',
        ]);
    }

    public function test_session_becomes_locked_after_submission(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $year = AcademicYear::create(['name' => '2025', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'is_active' => true]);
        $grade = Grade::create(['name' => 'G1']);
        $section = Section::create(['grade_id' => $grade->id, 'name' => 'A']);
        $subject = Subject::create(['name' => 'Math', 'code' => 'MATH']);

        TeacherAssignment::create([
            'academic_year_id' => $year->id,
            'teacher_user_id' => $teacher->id,
            'section_id' => $section->id,
            'subject_id' => $subject->id,
        ]);

        $service = new AttendanceService();
        $date = '2026-02-01';

        $session = $service->createOrGetSession($section->id, $date, $teacher->id);

        // Submit
        $service->submitSession($session->id, [], $teacher->id);

        $session->refresh();
        $this->assertEquals('submitted', $session->status);
        $this->assertNotNull($session->submitted_at);

        // Try to submit again
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("Session is already submitted and cannot be modified.");
        $service->submitSession($session->id, [], $teacher->id);
    }
}
