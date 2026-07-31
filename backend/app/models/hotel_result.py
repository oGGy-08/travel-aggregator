import uuid
from datetime import datetime, timezone
from ..extensions import db


class HotelResult(db.Model):
    __tablename__ = 'hotel_results'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    search_session_id = db.Column(db.String(36), db.ForeignKey('search_sessions.id'))
    provider = db.Column(db.String(50), nullable=False)
    provider_ref = db.Column(db.String(100), nullable=False)
    hotel_name = db.Column(db.String(200), nullable=False)
    star_rating = db.Column(db.Integer, nullable=True)
    user_rating = db.Column(db.Float, nullable=True)
    review_count = db.Column(db.Integer, default=0)
    address = db.Column(db.String(500), nullable=True)
    city = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    room_type = db.Column(db.String(100), nullable=False)
    check_in_date = db.Column(db.Date, nullable=False)
    check_out_date = db.Column(db.Date, nullable=False)
    price_per_night = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    price_currency = db.Column(db.String(3), default='USD')
    amenities = db.Column(db.JSON, nullable=True)
    images = db.Column(db.JSON, nullable=True)
    cancellation_policy = db.Column(db.String(200), nullable=True)
    booking_url = db.Column(db.String(500), nullable=True)
    fetched_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    deleted = db.Column(db.SmallInteger, default=0, nullable=False)
