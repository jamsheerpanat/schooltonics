<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Period;
use App\Models\Section;
use App\Models\Subject;
use App\Models\TimetableEntry;
use App\Models\User;
use Illuminate\Database\Seeder;

class TimetableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        if (!$activeYear)
            return;

        // 1. Create Periods
        $periods = [
            ['name' => 'P1', 'start_time' => '08:00', 'end_time' => '08:45', 'sort_order' => 1],
            ['name' => 'P2', 'start_time' => '08:45', 'end_time' => '09:30', 'sort_order' => 2],
            ['name' => 'Break', 'start_time' => '09:30', 'end_time' => '10:00', 'sort_order' => 3],
            ['name' => 'P3', 'start_time' => '10:00', 'end_time' => '10:45', 'sort_order' => 4],
            ['name' => 'P4', 'start_time' => '10:45', 'end_time' => '11:30', 'sort_order' => 5],
            ['name' => 'P5', 'start_time' => '11:30', 'end_time' => '12:15', 'sort_order' => 6],
        ];

        $periodModels = [];
        foreach ($periods as $data) {
            $periodModels[] = Period::updateOrCreate(['name' => $data['name']], $data);
        }

        // 2. Create Timetable for Sunday (Section KG-A)
        $section = Section::where('name', 'A')->first();
        $teacher = User::where('role', 'teacher')->first();
        $subjectMath = Subject::where('code', 'MATH')->first();
        $subjectEng = Subject::where('code', 'ENG')->first();

        if ($section && $teacher && $subjectMath && $subjectEng) {
            $days = ['sun', 'mon', 'tue', 'wed', 'thu'];

            foreach ($days as $day) {
                // P1: alternating Math and English
                TimetableEntry::updateOrCreate([
                    'academic_year_id' => $activeYear->id,
                    'section_id' => $section->id,
                    'day_of_week' => $day,
                    'period_id' => $periodModels[0]->id,
                ], [
                    'subject_id' => $day === 'mon' || $day === 'wed' ? $subjectEng->id : $subjectMath->id,
                    'teacher_user_id' => $teacher->id,
                ]);

                // P2:
                TimetableEntry::updateOrCreate([
                    'academic_year_id' => $activeYear->id,
                    'section_id' => $section->id,
                    'day_of_week' => $day,
                    'period_id' => $periodModels[1]->id,
                ], [
                    'subject_id' => $day === 'mon' || $day === 'wed' ? $subjectMath->id : $subjectEng->id,
                    'teacher_user_id' => $teacher->id,
                ]);

                // P3:
                TimetableEntry::updateOrCreate([
                    'academic_year_id' => $activeYear->id,
                    'section_id' => $section->id,
                    'day_of_week' => $day,
                    'period_id' => $periodModels[3]->id,
                ], [
                    'subject_id' => $subjectMath->id,
                    'teacher_user_id' => $teacher->id,
                ]);
            }
        }
    }
}
