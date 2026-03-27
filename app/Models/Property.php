<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'location',
        'type',
        'image_url',
        'stars',
        'rating',
        'reviews_count',
        'price_per_night',
        'max_guests',
        'free_cancellation',
        'breakfast_included',
        'pet_friendly',
        'wifi_included',
        'parking_included',
        'room_size_sqm',
        'bed_type',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'free_cancellation' => 'boolean',
            'breakfast_included' => 'boolean',
            'pet_friendly' => 'boolean',
            'wifi_included' => 'boolean',
            'parking_included' => 'boolean',
            'rating' => 'float',
            'room_size_sqm' => 'integer',
        ];
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }
}
