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
            'title' => fake()->randomElement([
                'Grand Riverside Hotel',
                'Skyline Suites',
                'Central City Apartments',
                'Blue Harbor Boutique',
                'Palm Garden Resort',
            ]),
            'location' => fake()->randomElement(['London', 'Paris', 'Rome', 'Istanbul', 'Dubai']),
            'type' => fake()->randomElement(['Hotel', 'Apartment', 'Resort', 'Guesthouse']),
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
            'description' => fake()->paragraph(2),
        ];
    }
}
