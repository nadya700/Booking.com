<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\BookingConfirmedMail;
use App\Models\Booking;
use App\Models\Property;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->bookings()->with('property')->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_id' => ['required', 'exists:properties,id'],
            'guest_name' => ['required', 'string', 'max:120'],
            'guest_email' => ['required', 'email'],
            'check_in' => ['required', 'date'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'guests' => ['required', 'integer', 'min:1'],
        ]);

        $property = Property::findOrFail($validated['property_id']);

        if ($validated['guests'] > $property->max_guests) {
            throw ValidationException::withMessages([
                'guests' => 'Selected property cannot host this many guests.',
            ]);
        }

        $hasOverlap = Booking::where('property_id', $property->id)
            ->where('status', '!=', 'cancelled')
            ->whereDate('check_in', '<', $validated['check_out'])
            ->whereDate('check_out', '>', $validated['check_in'])
            ->exists();

        if ($hasOverlap) {
            throw ValidationException::withMessages([
                'check_in' => 'This property is not available for the selected dates.',
            ]);
        }

        $nights = Carbon::parse($validated['check_in'])->diffInDays(Carbon::parse($validated['check_out']));
        $totalPrice = max($nights, 1) * $property->price_per_night;

        $booking = Booking::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'total_price' => $totalPrice,
            'status' => 'confirmed',
            'payment_status' => 'unpaid',
        ]);

        Mail::to($booking->guest_email)->send(new BookingConfirmedMail($booking->load('property')));

        return response()->json($booking->load('property'), 201);
    }

    public function pay(Request $request, Booking $booking)
    {
        if ((int) $booking->user_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'You are not allowed to pay this booking.'], 403);
        }

        $validated = $request->validate([
            'payment_method' => [
                'required',
                'string',
                Rule::in(['credit_card', 'debit_card', 'bank_transfer', 'paypal']),
            ],
        ]);

        if ($booking->payment_status !== 'paid') {
            $booking->update([
                'payment_status' => 'paid',
                'payment_method' => $validated['payment_method'],
                'paid_at' => now(),
            ]);
        }

        return response()->json($booking->load('property'));
    }
}
