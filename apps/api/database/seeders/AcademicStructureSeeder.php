<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Grade;
use App\Models\Section;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class AcademicStructureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Academic Year
        AcademicYear::updateOrCreate(
            ['name' => '2025–2026'],
            [
                'start_date' => '2025-09-01',
                'end_date' => '2026-06-30',
                'is_active' => true,
            ]
        );

        // 2. Grades
        $grades = [
            ['name' => 'KG', 'sort_order' => 1],
            ['name' => 'Grade 1', 'sort_order' => 2],
        ];

        foreach ($grades as $gradeData) {
            $grade = Grade::updateOrCreate(['name' => $gradeData['name']], $gradeData);

            // 3. Sections
            $sections = ['A', 'B'];
            foreach ($sections as $sectionName) {
                Section::updateOrCreate(
                    ['grade_id' => $grade->id, 'name' => $sectionName],
                    ['capacity' => 30]
                );
            }
        }

        // 4. Subjects
        $subjects = [
            ['name' => 'Mathematics', 'code' => 'MATH'],
            ['name' => 'English', 'code' => 'ENG'],
        ];

        foreach ($subjects as $subjectData) {
            Subject::updateOrCreate(['code' => $subjectData['code']], $subjectData);
        }
    }
}
