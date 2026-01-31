<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Section;
use App\Models\Subject;
use App\Models\TeacherAssignment;
use App\Models\User;
use Illuminate\Database\Seeder;

class TeacherAssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        $teacher = User::where('role', 'teacher')->first();
        $section = Section::first();
        $subjectMath = Subject::where('code', 'MATH')->first();
        $subjectEng = Subject::where('code', 'ENG')->first();

        if (!$activeYear || !$teacher || !$section || !$subjectMath) {
            return;
        }

        TeacherAssignment::updateOrCreate([
            'teacher_user_id' => $teacher->id,
            'academic_year_id' => $activeYear->id,
            'section_id' => $section->id,
            'subject_id' => $subjectMath->id,
        ]);

        if ($subjectEng) {
            TeacherAssignment::updateOrCreate([
                'teacher_user_id' => $teacher->id,
                'academic_year_id' => $activeYear->id,
                'section_id' => $section->id,
                'subject_id' => $subjectEng->id,
            ]);
        }
    }
}
