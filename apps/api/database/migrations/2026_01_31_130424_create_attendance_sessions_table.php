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
        Schema::create('attendance_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained()->onDelete('restrict');
            $table->foreignId('section_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->foreignId('created_by_teacher_id')->constrained('users')->onDelete('restrict');
            $table->timestamp('submitted_at')->nullable();
            $table->enum('status', ['draft', 'submitted', 'locked'])->default('draft');
            $table->timestamps();

            $table->unique(['section_id', 'date'], 'unique_section_attendance_day');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_sessions');
    }
};
