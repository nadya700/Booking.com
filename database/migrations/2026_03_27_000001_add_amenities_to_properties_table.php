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
        Schema::table('properties', function (Blueprint $table) {
            $table->boolean('breakfast_included')->default(false)->after('free_cancellation');
            $table->boolean('pet_friendly')->default(false)->after('breakfast_included');
            $table->boolean('wifi_included')->default(true)->after('pet_friendly');
            $table->boolean('parking_included')->default(false)->after('wifi_included');
            $table->unsignedSmallInteger('room_size_sqm')->default(24)->after('parking_included');
            $table->string('bed_type')->default('Queen Bed')->after('room_size_sqm');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'breakfast_included',
                'pet_friendly',
                'wifi_included',
                'parking_included',
                'room_size_sqm',
                'bed_type',
            ]);
        });
    }
};
