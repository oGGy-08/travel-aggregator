def register_blueprints(app):
    from .auth.routes import auth_bp
    from .search.routes import search_bp
    from .search.explore import explore_bp
    from .packages.routes import packages_bp
    from .bookings.routes import bookings_bp
    from .alerts.routes import alerts_bp
    from .health import health_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(search_bp, url_prefix='/api/search')
    app.register_blueprint(explore_bp, url_prefix='/api/explore')
    app.register_blueprint(packages_bp, url_prefix='/api/packages')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
    app.register_blueprint(health_bp, url_prefix='/api')
