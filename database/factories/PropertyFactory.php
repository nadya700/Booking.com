<?php

namespace Database\Factories;

use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Property>
 */
class PropertyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => sprintf(
                '%s %s',
                fake()->randomElement(['Grand', 'Azure', 'Urban', 'Sunset', 'Harbor', 'Emerald', 'Royal', 'Golden']),
                fake()->randomElement(['Retreat', 'Suites', 'Residence', 'Loft', 'Hotel', 'Stay', 'Haven', 'House'])
            ),
            'location' => fake()->randomElement([
                'London',
                'Paris',
                'Rome',
                'Istanbul',
                'Dubai',
                'Barcelona',
                'Amsterdam',
                'Lisbon',
                'Prague',
                'Vienna',
            ]),
            'type' => fake()->randomElement(['Hotel', 'Airbnb']),
            'image_url' => fake()->randomElement([
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
                'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1000&q=80',
                'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80',
                'https://images.unsplash.com/photo-1501117716987-c8e1ecb2101f?auto=format&fit=crop&w=1000&q=80',
            ]),
            'stars' => fake()->numberBetween(3, 5),
            'rating' => fake()->randomFloat(1, 7.5, 9.8),
            'reviews_count' => fake()->numberBetween(50, 3250),
            'price_per_night' => fake()->numberBetween(65, 420),
            'max_guests' => fake()->numberBetween(1, 6),
            'free_cancellation' => fake()->boolean(70),
            'breakfast_included' => fake()->boolean(65),
            'pet_friendly' => fake()->boolean(45),
            'wifi_included' => true,
            'parking_included' => fake()->boolean(60),
            'room_size_sqm' => fake()->numberBetween(16, 72),
            'bed_type' => fake()->randomElement(['Queen Bed', 'King Bed', 'Twin Beds', 'Queen + Sofa Bed']),
            'description' => fake()->paragraph(2),
        ];
    }
}
