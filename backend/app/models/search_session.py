import uuid
from datetime import datetime, timezone, timedelta
from ..extensions import db


class SearchSession(db.Model):
    __tablename__ = 'search_sessions'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    search_type = db.Column(db.String(20), nullable=False)  # FLIGHT, BUS, HOTEL, PACKAGE
    origin = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    departure_date = db.Column(db.Date, nullable=False)
    return_date = db.Column(db.Date, nullable=True)
    passengers = db.Column(db.Integer, default=1)
    rooms = db.Column(db.Integer, nullable=True)
    filters_applied = db.Column(db.JSON, nullable=True)
    results_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = db.Column(db.DateTime,
                           default=lambda: datetime.now(timezone.utc) + timedelta(minutes=15))

    __table_args__ = (
        db.Index('idx_search_route_date', 'origin', 'destination', 'departure_date'),
    )
    deleted = db.Column(db.SmallInteger, default=0, nullable=False)
