from flask import Blueprint, request, jsonify
import uuid
from ...extensions import db
from ...models.booking import Booking

bookings_bp = Blueprint('bookings', __name__)


@bookings_bp.route('/', methods=['POST'])
def create_booking():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing request body'}), 400

    # Price verification
    cached_price = data.get('expected_price')
    current_price = data.get('current_price', cached_price)
    if cached_price and current_price and abs(cached_price - current_price) > 0.01:
        return jsonify({
            'error': 'Price has changed',
            'cached_price': cached_price,
            'current_price': current_price,
        }), 409

    # Save to DB
    booking = Booking(
        user_id=data.get('user_id', 'anonymous'),
        package_id=data.get('package_id'),
        booking_type=data.get('booking_type', 'SINGLE'),
        status='CONFIRMED',
        total_amount=data.get('total_amount', 0),
        currency='INR',
        payment_status='PAID',
        payment_ref=f"PAY_{uuid.uuid4().hex[:12]}",
        provider_confirmations=data.get('provider_confirmations', {}),
    )
    db.session.add(booking)
    db.session.commit()

    return jsonify({
        'id': booking.id,
        'status': booking.status,
        'total_amount': booking.total_amount,
        'currency': booking.currency,
        'payment_status': booking.payment_status,
        'payment_ref': booking.payment_ref,
    }), 201


@bookings_bp.route('/<booking_id>', methods=['GET'])
def get_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    return jsonify({
        'id': booking.id,
        'user_id': booking.user_id,
        'booking_type': booking.booking_type,
        'status': booking.status,
        'total_amount': booking.total_amount,
        'currency': booking.currency,
        'payment_status': booking.payment_status,
        'payment_ref': booking.payment_ref,
        'provider_confirmations': booking.provider_confirmations,
    })
