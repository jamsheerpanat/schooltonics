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
        Schema::table('users', function (Blueprint $blueprint) {
            $blueprint->enum('role', ['principal', 'office', 'teacher', 'student', 'parent'])->after('email');
            $blueprint->enum('status', ['active', 'inactive'])->default('active')->after('role');
            $blueprint->timestamp('last_login_at')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $blueprint) {
            $blueprint->dropColumn(['role', 'status', 'last_login_at']);
        });
    }
};
