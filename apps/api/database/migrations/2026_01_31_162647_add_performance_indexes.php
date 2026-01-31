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
        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->index(['section_id', 'date']);
        });

        Schema::table('attendance_records', function (Blueprint $table) {
            $table->index(['attendance_session_id', 'student_id']);
        });

        Schema::table('announcements', function (Blueprint $table) {
            $table->index(['publish_at']);
        });

        Schema::table('student_dues', function (Blueprint $table) {
            $table->index(['student_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->dropIndex(['section_id', 'date']);
        });

        Schema::table('attendance_records', function (Blueprint $table) {
            $table->dropIndex(['attendance_session_id', 'student_id']);
        });

        Schema::table('announcements', function (Blueprint $table) {
            $table->dropIndex(['publish_at']);
        });

        Schema::table('student_dues', function (Blueprint $table) {
            $table->dropIndex(['student_id', 'status']);
        });
    }
};
