<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Enrollment;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        $sectionA = Section::where('name', 'A')->first();
        $sectionB = Section::where('name', 'B')->first();

        if (!$activeYear || !$sectionA) {
            return;
        }

        $students = [
            [
                'name_en' => 'John Doe',
                'dob' => '2018-05-15',
                'gender' => 'male',
                'section' => $sectionA
            ],
            [
                'name_en' => 'Jane Smith',
                'dob' => '2018-08-20',
                'gender' => 'female',
                'section' => $sectionB
            ],
            [
                'name_en' => 'Alice Cooper',
                'dob' => '2017-12-10',
                'gender' => 'female',
                'section' => $sectionA
            ],
        ];

        foreach ($students as $data) {
            $student = Student::updateOrCreate(
                ['name_en' => $data['name_en']],
                [
                    'dob' => $data['dob'],
                    'gender' => $data['gender'],
                ]
            );

            Enrollment::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'academic_year_id' => $activeYear->id,
                ],
                [
                    'section_id' => $data['section']->id,
                    'roll_no' => 'R-' . str_pad($student->id, 3, '0', STR_PAD_LEFT),
                    'status' => 'active',
                ]
            );
        }
    }
}
