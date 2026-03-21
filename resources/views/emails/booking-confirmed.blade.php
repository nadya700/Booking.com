<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Booking Confirmation</title>
</head>
<body>
    <h2>Booking Confirmed</h2>
    <p>Hi {{ $booking->guest_name }},</p>
    <p>Your reservation has been confirmed.</p>
    <ul>
        <li><strong>Property:</strong> {{ $booking->property->title }}</li>
        <li><strong>Location:</strong> {{ $booking->property->location }}</li>
        <li><strong>Check-in:</strong> {{ $booking->check_in->toDateString() }}</li>
        <li><strong>Check-out:</strong> {{ $booking->check_out->toDateString() }}</li>
        <li><strong>Guests:</strong> {{ $booking->guests }}</li>
        <li><strong>Total:</strong> ${{ $booking->total_price }}</li>
    </ul>
    <p>Thank you for booking with us.</p>
</body>
</html>
