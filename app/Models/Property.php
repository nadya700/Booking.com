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
        'description',
    ];

    protected function casts(): array
    {
        return [
            'free_cancellation' => 'boolean',
            'rating' => 'float',
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
