<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Announcement;
use App\Models\AttendanceRecord;
use App\Models\AttendanceSession;
use App\Models\CalendarEvent;
use App\Models\FeeItem;
use App\Models\Grade;
use App\Models\Section;
use App\Models\Student;
use App\Models\Enrollment;
use App\Models\StudentDue;
use App\Models\Subject;
use App\Models\TeacherAssignment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Users
        $principal = User::updateOrCreate(
            ['email' => 'principal@octoschool.com'],
            ['name' => 'Principal Skinner', 'password' => Hash::make('password'), 'role' => 'principal']
        );
        $office = User::updateOrCreate(
            ['email' => 'office@octoschool.com'],
            ['name' => 'Office Admin', 'password' => Hash::make('password'), 'role' => 'office']
        );
        $teacher = User::updateOrCreate(
            ['email' => 'teacher1@octoschool.com'],
            ['name' => 'Edna Krabappel', 'password' => Hash::make('password'), 'role' => 'teacher']
        );
        $studentUser = User::updateOrCreate(
            ['email' => 'student1@octoschool.com'],
            ['name' => 'Bart Simpson', 'password' => Hash::make('password'), 'role' => 'student']
        );
        $parentUser = User::updateOrCreate(
            ['email' => 'parent1@octoschool.com'],
            ['name' => 'Homer Simpson', 'password' => Hash::make('password'), 'role' => 'parent']
        );

        // 2. Academic Year
        $year = AcademicYear::updateOrCreate(
            ['name' => '2025–2026'],
            ['start_date' => '2025-09-01', 'end_date' => '2026-06-30', 'is_active' => true]
        );

        // 3. Structure (Grades/Sections)
        $grade4 = Grade::updateOrCreate(['name' => 'Grade 4']);

        $sectionA = Section::updateOrCreate(['grade_id' => $grade4->id, 'name' => 'A']);
        $sectionB = Section::updateOrCreate(['grade_id' => $grade4->id, 'name' => 'B']);
        $sectionC = Section::updateOrCreate(['grade_id' => $grade4->id, 'name' => 'C']);

        // 4. Subjects
        $math = Subject::updateOrCreate(['code' => 'MATH'], ['name' => 'Mathematics']);
        $history = Subject::updateOrCreate(['code' => 'HIST'], ['name' => 'History']);

        // 4b. Fee Items
        $tuitionFee = FeeItem::updateOrCreate(['name' => 'Tuition Fee'], ['category' => 'tuition', 'default_amount' => 1500.00]);

        // 5. Assignments
        TeacherAssignment::updateOrCreate(
            [
                'teacher_user_id' => $teacher->id,
                'academic_year_id' => $year->id,
                'section_id' => $sectionA->id,
                'subject_id' => $math->id,
            ]
        );

        // 6. Students (10 students)
        $students = [];
        // Lead student linked to user
        $bart = Student::updateOrCreate(
            ['user_id' => $studentUser->id],
            ['name_en' => 'Bart Simpson', 'dob' => '2015-04-01', 'gender' => 'male', 'student_no' => 'S-001']
        );
        $students[] = $bart;

        // 9 dummy students
        for ($i = 2; $i <= 10; $i++) {
            $students[] = Student::create([
                'name_en' => "Student $i",
                'dob' => '2015-01-01',
                'gender' => $i % 2 == 0 ? 'female' : 'male',
                'student_no' => "S-00$i",
            ]);
        }

        // Enroll them
        foreach ($students as $index => $student) {
            Enrollment::create([
                'student_id' => $student->id,
                'academic_year_id' => $year->id,
                'section_id' => $index < 5 ? $sectionA->id : $sectionB->id, // Split between A and B
                'roll_no' => $index + 1,
                'status' => 'active',
            ]);

            // Assign Fees
            StudentDue::create([
                'student_id' => $student->id,
                'fee_item_id' => $tuitionFee->id,
                'amount' => 1500.00,
                'due_date' => '2025-09-01',
                'status' => $index === 0 ? 'unpaid' : ($index === 1 ? 'paid' : 'unpaid'), // Bart unpaid, Student 2 paid
            ]);
        }

        // 7. Announcement
        Announcement::create([
            'title' => 'School Closed Tomorrow',
            'body' => 'Due to heavy snow, the school will be closed.',
            'audience' => 'all',
            'publish_at' => now(),
            'created_by_user_id' => $principal->id,
        ]);

        // 7b. Calendar Events
        CalendarEvent::create([
            'title' => 'Term 1 Finals',
            'description' => 'Final exams for the first term.',
            'start_date' => now()->addDays(5)->format('Y-m-d'),
            'end_date' => now()->addDays(10)->format('Y-m-d'),
            'visibility' => 'all',
            'created_by_user_id' => $principal->id,
        ]);

        CalendarEvent::create([
            'title' => 'Teacher Planning Day',
            'description' => 'No school for students.',
            'start_date' => now()->subDays(2)->format('Y-m-d'),
            'end_date' => now()->subDays(2)->format('Y-m-d'),
            'visibility' => 'teacher',
            'created_by_user_id' => $principal->id,
        ]);

        // 8. Daily Flow (Attendance)
        // Create session for today for Section A
        $today = now()->format('Y-m-d');

        $session = AttendanceSession::firstOrCreate(
            ['section_id' => $sectionA->id, 'date' => $today],
            [
                'academic_year_id' => $year->id,
                'created_by_teacher_id' => $teacher->id,
                'status' => 'submitted',
                'submitted_at' => now()->subHours(2),
            ]
        );

        // Mark Bart absent, others present in Section A
        $sectionAStudents = Enrollment::where('section_id', $sectionA->id)->with('student')->get();

        foreach ($sectionAStudents as $enrollment) {
            AttendanceRecord::updateOrCreate(
                ['attendance_session_id' => $session->id, 'student_id' => $enrollment->student_id],
                [
                    'status' => $enrollment->student_id === $bart->id ? 'absent' : 'present',
                    'reason' => $enrollment->student_id === $bart->id ? 'Sick' : null,
                ]
            );
        }
    }
}
