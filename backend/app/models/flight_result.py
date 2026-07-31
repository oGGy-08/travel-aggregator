import uuid
from datetime import datetime, timezone
from ..extensions import db


class FlightResult(db.Model):
    __tablename__ = 'flight_results'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    search_session_id = db.Column(db.String(36), db.ForeignKey('search_sessions.id'))
    provider = db.Column(db.String(50), nullable=False)
    provider_ref = db.Column(db.String(100), nullable=False)
    airline = db.Column(db.String(100), nullable=False)
    airline_code = db.Column(db.String(10), nullable=False)
    flight_number = db.Column(db.String(20), nullable=False)
    origin_airport = db.Column(db.String(5), nullable=False)
    destination_airport = db.Column(db.String(5), nullable=False)
    departure_time = db.Column(db.DateTime, nullable=False)
    arrival_time = db.Column(db.DateTime, nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    stops = db.Column(db.Integer, default=0)
    stop_airports = db.Column(db.JSON, nullable=True)
    cabin_class = db.Column(db.String(20), default='ECONOMY')
    price_amount = db.Column(db.Float, nullable=False)
    price_currency = db.Column(db.String(3), default='USD')
    baggage_included = db.Column(db.JSON, nullable=True)
    refundable = db.Column(db.Boolean, default=False)
    booking_url = db.Column(db.String(500), nullable=True)
    fetched_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    deleted = db.Column(db.SmallInteger, default=0, nullable=False)
