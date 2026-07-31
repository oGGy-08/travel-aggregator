import uuid
from datetime import datetime, timezone
from ..extensions import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    preferred_currency = db.Column(db.String(3), default='INR')
    preferred_language = db.Column(db.String(5), default='en')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))
    deleted = db.Column(db.SmallInteger, default=0, nullable=False)
