<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function index(Request $request)
    {
        $query = Property::query();

        if ($request->filled('location')) {
            $query->where('location', 'like', '%'.$request->string('location')->toString().'%');
        }

        if ($request->filled('min_price')) {
            $query->where('price_per_night', '>=', (int) $request->input('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price_per_night', '<=', (int) $request->input('max_price'));
        }

        if ($request->filled('guests')) {
            $query->where('max_guests', '>=', (int) $request->input('guests'));
        }

        return response()->json(
            $query->orderByDesc('rating')->orderBy('price_per_night')->get()
        );
    }

    public function show(Property $property)
    {
        return response()->json($property);
    }

    public function availability(Request $request, Property $property)
    {
        $start = $request->filled('from')
            ? Carbon::parse($request->string('from')->toString())->startOfDay()
            : now()->startOfDay();
        $end = $request->filled('to')
            ? Carbon::parse($request->string('to')->toString())->startOfDay()
            : now()->addDays(29)->startOfDay();

        if ($end->lt($start)) {
            return response()->json(['message' => 'Invalid date range.'], 422);
        }

        $bookings = $property->bookings()
            ->where('status', '!=', 'cancelled')
            ->whereDate('check_in', '<=', $end->toDateString())
            ->whereDate('check_out', '>=', $start->toDateString())
            ->get(['check_in', 'check_out']);

        $days = [];
        $cursor = $start->copy();
        while ($cursor->lte($end)) {
            $dateString = $cursor->toDateString();
            $isBooked = $bookings->contains(function ($booking) use ($dateString) {
                return $booking->check_in->toDateString() <= $dateString
                    && $booking->check_out->toDateString() > $dateString;
            });

            $days[] = [
                'date' => $dateString,
                'available' => ! $isBooked,
            ];
            $cursor->addDay();
        }

        return response()->json([
            'property_id' => $property->id,
            'from' => $start->toDateString(),
            'to' => $end->toDateString(),
            'days' => $days,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'location' => ['required', 'string', 'max:180'],
            'type' => ['required', 'string', 'max:80'],
            'image_url' => ['required', 'url'],
            'stars' => ['required', 'integer', 'min:1', 'max:5'],
            'rating' => ['required', 'numeric', 'min:1', 'max:10'],
            'reviews_count' => ['required', 'integer', 'min:0'],
            'price_per_night' => ['required', 'integer', 'min:1'],
            'max_guests' => ['required', 'integer', 'min:1'],
            'free_cancellation' => ['required', 'boolean'],
            'breakfast_included' => ['required', 'boolean'],
            'pet_friendly' => ['required', 'boolean'],
            'wifi_included' => ['required', 'boolean'],
            'parking_included' => ['required', 'boolean'],
            'room_size_sqm' => ['required', 'integer', 'min:10', 'max:250'],
            'bed_type' => ['required', 'string', 'max:80'],
            'description' => ['required', 'string'],
        ]);

        return response()->json(Property::create($validated), 201);
    }

    public function update(Request $request, Property $property)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:200'],
            'location' => ['sometimes', 'string', 'max:180'],
            'type' => ['sometimes', 'string', 'max:80'],
            'image_url' => ['sometimes', 'url'],
            'stars' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'rating' => ['sometimes', 'numeric', 'min:1', 'max:10'],
            'reviews_count' => ['sometimes', 'integer', 'min:0'],
            'price_per_night' => ['sometimes', 'integer', 'min:1'],
            'max_guests' => ['sometimes', 'integer', 'min:1'],
            'free_cancellation' => ['sometimes', 'boolean'],
            'breakfast_included' => ['sometimes', 'boolean'],
            'pet_friendly' => ['sometimes', 'boolean'],
            'wifi_included' => ['sometimes', 'boolean'],
            'parking_included' => ['sometimes', 'boolean'],
            'room_size_sqm' => ['sometimes', 'integer', 'min:10', 'max:250'],
            'bed_type' => ['sometimes', 'string', 'max:80'],
            'description' => ['sometimes', 'string'],
        ]);

        $property->update($validated);

        return response()->json($property);
    }

    public function destroy(Property $property)
    {
        $property->delete();

        return response()->json(['message' => 'Property deleted.']);
    }

    public function uploadImage(Request $request, Property $property)
    {
        $validated = $request->validate([
            'image' => ['required', 'image', 'max:4096'],
        ]);

        $path = $validated['image']->store('property-images', 'public');
        $property->update([
            'image_url' => asset('storage/'.$path),
        ]);

        return response()->json($property);
    }
}
