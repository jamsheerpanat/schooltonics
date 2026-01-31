<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('timetable_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->foreignId('section_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('teacher_user_id')->constrained('users')->onDelete('cascade');
            $table->enum('day_of_week', ['mon', 'tue', 'wed', 'thu', 'sun']);
            $table->foreignId('period_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            // Section cannot have two things at the same time
            $table->unique(['academic_year_id', 'section_id', 'day_of_week', 'period_id'], 'section_time_unique');

            // Teacher cannot be in two places at the same time
            $table->unique(['academic_year_id', 'teacher_user_id', 'day_of_week', 'period_id'], 'teacher_time_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timetable_entries');
    }
};
