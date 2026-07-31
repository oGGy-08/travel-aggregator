import uuid
from datetime import datetime, timezone
from ..extensions import db


class Package(db.Model):
    __tablename__ = 'packages'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(20), default='DRAFT')  # DRAFT, SAVED, BOOKED, EXPIRED
    origin_city = db.Column(db.String(100), nullable=False)
    destination_city = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    passengers = db.Column(db.Integer, default=1)
    total_price = db.Column(db.Float, default=0.0)
    individual_price_sum = db.Column(db.Float, default=0.0)
    savings_amount = db.Column(db.Float, default=0.0)
    savings_percentage = db.Column(db.Float, default=0.0)
    compatibility_score = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    segments = db.relationship('PackageSegment', backref='package', lazy=True)
    deleted = db.Column(db.SmallInteger, default=0, nullable=False)
