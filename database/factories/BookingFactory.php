<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $checkIn = fake()->dateTimeBetween('+1 days', '+1 month');
        $checkOut = fake()->dateTimeBetween($checkIn->format('Y-m-d').' +1 day', $checkIn->format('Y-m-d').' +8 days');

        return [
            'user_id' => User::factory(),
            'property_id' => Property::factory(),
            'guest_name' => fake()->name(),
            'guest_email' => fake()->safeEmail(),
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'guests' => fake()->numberBetween(1, 4),
            'total_price' => fake()->numberBetween(100, 1900),
            'status' => fake()->randomElement(['confirmed', 'pending']),
        ];
    }
}
