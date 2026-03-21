<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Property;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function analytics(Request $request)
    {
        $totalProperties = Property::count();
        $totalBookings = Booking::count();
        $confirmedRevenue = Booking::where('status', 'confirmed')->sum('total_price');
        $activeGuests = Booking::distinct('user_id')->count('user_id');

        $topProperties = Property::withCount('bookings')
            ->orderByDesc('bookings_count')
            ->limit(5)
            ->get(['id', 'title', 'location']);

        return response()->json([
            'total_properties' => $totalProperties,
            'total_bookings' => $totalBookings,
            'confirmed_revenue' => $confirmedRevenue,
            'active_guests' => $activeGuests,
            'top_properties' => $topProperties,
        ]);
    }
}
