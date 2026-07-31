import uuid
from datetime import datetime, timezone
from ..extensions import db


class PackageSegment(db.Model):
    __tablename__ = 'package_segments'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    package_id = db.Column(db.String(36), db.ForeignKey('packages.id'), nullable=False)
    segment_type = db.Column(db.String(10), nullable=False)  # FLIGHT, BUS, HOTEL
    segment_ref_id = db.Column(db.String(36), nullable=False)
    position = db.Column(db.Integer, default=0)
    start_datetime = db.Column(db.DateTime, nullable=False)
    end_datetime = db.Column(db.DateTime, nullable=False)
    price_amount = db.Column(db.Float, nullable=False)
    price_currency = db.Column(db.String(3), default='USD')
    provider = db.Column(db.String(50), nullable=False)
    summary = db.Column(db.String(500), nullable=True)
    deleted = db.Column(db.SmallInteger, default=0, nullable=False)
