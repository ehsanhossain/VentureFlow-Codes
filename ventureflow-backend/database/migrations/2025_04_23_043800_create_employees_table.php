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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('image')->nullable();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('gender');
            $table->string('employee_id')->unique();
            $table->foreignId('nationality')->constrained('countries');
            $table->string('joining_date');
            $table->string('employee_status');
            $table->string('dob');
            $table->string('work_email')->unique();
            $table->string('contact_number');
            $table->string('company')->nullable();
            $table->string('department')->nullable();
            $table->string('branch')->nullable();
            $table->string('team')->nullable();
            $table->string('designation')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->timestamps();
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
