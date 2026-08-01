import os
from dotenv import load_dotenv

load_dotenv()


class BaseConfig:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = 900  # 15 minutes
    JWT_REFRESH_TOKEN_EXPIRES = 604800  # 7 days
    CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/1')
    CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/2')
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173')
    RATE_LIMIT_ANONYMOUS = 10
    RATE_LIMIT_AUTHENTICATED = 30


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL', 'mysql+pymysql://root:password@localhost:3306/travel_aggregator'
    )


class ProductionConfig(BaseConfig):
    DEBUG = False

    @property
    def SQLALCHEMY_DATABASE_URI(self):
        url = os.getenv('DATABASE_URL', '')
        # Railway gives mysql:// but SQLAlchemy needs mysql+pymysql://
        if url.startswith('mysql://'):
            url = url.replace('mysql://', 'mysql+pymysql://', 1)
        return url

    SQLALCHEMY_ENGINE_OPTIONS = {
        'connect_args': {
            'ssl': {'ca': '/etc/ssl/certs/ca-certificates.crt'}
        }
    }


class TestingConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
}
