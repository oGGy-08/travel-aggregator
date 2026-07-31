import uuid
from datetime import datetime, timezone
from ..extensions import db


class BusResult(db.Model):
    __tablename__ = 'bus_results'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    search_session_id = db.Column(db.String(36), db.ForeignKey('search_sessions.id'))
    provider = db.Column(db.String(50), nullable=False)
    provider_ref = db.Column(db.String(100), nullable=False)
    operator_name = db.Column(db.String(100), nullable=False)
    bus_type = db.Column(db.String(20), default='STANDARD')
    origin_station = db.Column(db.String(200), nullable=False)
    destination_station = db.Column(db.String(200), nullable=False)
    departure_time = db.Column(db.DateTime, nullable=False)
    arrival_time = db.Column(db.DateTime, nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    stops = db.Column(db.Integer, default=0)
    amenities = db.Column(db.JSON, nullable=True)
    price_amount = db.Column(db.Float, nullable=False)
    price_currency = db.Column(db.String(3), default='USD')
    seats_available = db.Column(db.Integer, default=0)
    rating = db.Column(db.Float, nullable=True)
    booking_url = db.Column(db.String(500), nullable=True)
    fetched_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    deleted = db.Column(db.SmallInteger, default=0, nullable=False)
