<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Favorite;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $hotelProperties = Property::factory()
            ->count(50)
            ->state(['type' => 'Hotel'])
            ->create();
        $airbnbProperties = Property::factory()
            ->count(50)
            ->state(['type' => 'Airbnb'])
            ->create();
        $properties = $hotelProperties->concat($airbnbProperties);

        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@hotel.local',
            'role' => 'admin',
        ]);

        $guest = User::factory()->create([
            'name' => 'Guest User',
            'email' => 'guest@hotel.local',
            'role' => 'guest',
        ]);

        Booking::factory()->count(18)->recycle($properties)->create([
            'user_id' => $guest->id,
        ]);

        Favorite::create([
            'user_id' => $guest->id,
            'property_id' => $properties->first()->id,
        ]);
    }
}
