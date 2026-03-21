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
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('location');
            $table->string('type')->default('Hotel');
            $table->string('image_url');
            $table->unsignedTinyInteger('stars')->default(4);
            $table->decimal('rating', 3, 1)->default(8.0);
            $table->unsignedInteger('reviews_count')->default(0);
            $table->unsignedInteger('price_per_night');
            $table->unsignedSmallInteger('max_guests')->default(2);
            $table->boolean('free_cancellation')->default(true);
            $table->text('description');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
