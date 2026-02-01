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
        Schema::table('announcements', function (Blueprint $table) {
            $table->foreignId('section_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropForeign(['section_id']);
            $table->dropForeign(['academic_year_id']);
            $table->dropColumn(['section_id', 'academic_year_id', 'priority']);
        });
    }
};
