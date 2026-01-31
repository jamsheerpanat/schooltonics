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
        Schema::create('fee_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->default('tuition'); // tuition, transport, exam, etc.
            $table->decimal('default_amount', 10, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('student_dues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('fee_item_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->date('due_date');
            $table->enum('status', ['unpaid', 'partial', 'paid'])->default('unpaid');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_dues');
        Schema::dropIfExists('fee_items');
    }
};
