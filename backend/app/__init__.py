from flask import Flask, jsonify
from .config import Config
from .extensions import db, jwt, cors, migrate, limiter
from .models import RevokedToken
from .routes.auth import auth_bp
from .routes.patients import patients_bp
from .routes.audit import audit_bp
from .routes.dashboard import dashboard_bp
from .routes.users import users_bp
from .routes.settings import settings_bp
from .routes.admin import admin_bp


def create_app() -> Flask:
    Config.validate()
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    allowed_origins = [app.config["FRONTEND_ORIGIN"], *app.config.get("ADDITIONAL_CORS_ORIGINS", [])]
    cors.init_app(app, resources={r"/api/*": {"origins": allowed_origins}})
    migrate.init_app(app, db)
    limiter.init_app(app)

    @jwt.token_in_blocklist_loader
    def is_token_revoked(_jwt_header, jwt_payload):
        return RevokedToken.query.filter_by(jti=jwt_payload.get("jti")).first() is not None

    @jwt.revoked_token_loader
    def revoked_token_callback(_jwt_header, _jwt_payload):
        return jsonify({"message": "Token has been revoked. Please log in again."}), 401

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(patients_bp, url_prefix="/api")
    app.register_blueprint(audit_bp, url_prefix="/api")
    app.register_blueprint(dashboard_bp, url_prefix="/api")
    app.register_blueprint(users_bp, url_prefix="/api")
    app.register_blueprint(settings_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api")

    @app.get('/')
    def root():
        return {"message": "Secure EMR backend is running", "health": "/api/health"}

    @app.get('/api/health')
    def health():
        return {"status": "ok"}

    return app
