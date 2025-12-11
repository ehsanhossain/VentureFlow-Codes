<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('currency_name');
            $table->string('currency_code')->unique(); // e.g., USD, EUR
            $table->string('currency_sign'); // e.g., $, €, ¥
            $table->foreignId('origin_country')->constrained('countries'); // foreign key only, no cascade
            $table->string('dollar_unit')->default(1); // 1 USD = X of this currency
            $table->decimal('exchange_rate', 15, 6); // precision for exchange rates
            $table->string('source')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};
