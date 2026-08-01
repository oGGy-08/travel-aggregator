import os
from flask import Flask
from flask_cors import CORS
from .config import config
from .extensions import db, ma, redis_client, celery_app


def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    CORS(app, resources={r"/api/*": {"origins": app.config.get('CORS_ORIGINS', '*')}})

    db.init_app(app)
    ma.init_app(app)

    celery_app.conf.update(
        broker_url=app.config['CELERY_BROKER_URL'],
        result_backend=app.config['CELERY_RESULT_BACKEND']
    )

    from .api import register_blueprints
    register_blueprints(app)

    with app.app_context():
        from . import models  # noqa: F401 - ensure models are imported
        try:
            db.create_all()
        except Exception:
            pass  # DB might not be available yet, tables created on first successful connection

    return app
