from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from celery import Celery
import redis
import os

db = SQLAlchemy()
ma = Marshmallow()

redis_client = redis.Redis.from_url(
    os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    decode_responses=True
)

celery_app = Celery('travel_aggregator')
