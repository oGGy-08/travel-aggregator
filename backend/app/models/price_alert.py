import uuid
from datetime import datetime, timezone
from ..extensions import db


class PriceAlert(db.Model):
    __tablename__ = 'price_alerts'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    search_type = db.Column(db.String(20), nullable=False)
    search_params = db.Column(db.JSON, nullable=False)
    target_price = db.Column(db.Float, nullable=False)
    current_price = db.Column(db.Float, nullable=True)
    price_currency = db.Column(db.String(3), default='USD')
    is_active = db.Column(db.Boolean, default=True)
    notification_method = db.Column(db.String(10), default='EMAIL')
    last_checked_at = db.Column(db.DateTime, nullable=True)
    triggered_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    deleted = db.Column(db.SmallInteger, default=0, nullable=False)
