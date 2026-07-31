from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from celery import Celery
import redis
import os

db = SQLAlchemy()
ma = Marshmallow()

_redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
redis_client = redis.Redis.from_url(
    _redis_url,
    decode_responses=True,
    ssl=True if _redis_url.startswith('rediss://') else False
)

celery_app = Celery('travel_aggregator')
