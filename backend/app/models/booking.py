import uuid
from datetime import datetime, timezone
from ..extensions import db


class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    package_id = db.Column(db.String(36), db.ForeignKey('packages.id'), nullable=True)
    booking_type = db.Column(db.String(10), default='SINGLE')  # SINGLE, PACKAGE
    status = db.Column(db.String(20), default='PENDING')
    total_amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='USD')
    payment_status = db.Column(db.String(20), default='PENDING')
    payment_ref = db.Column(db.String(100), nullable=True)
    provider_confirmations = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))
    deleted = db.Column(db.SmallInteger, default=0, nullable=False)
