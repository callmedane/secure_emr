import os
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_SQLITE_DIR = BASE_DIR / "data"
DEFAULT_SQLITE_DIR.mkdir(parents=True, exist_ok=True)
DEFAULT_SQLITE_PATH = DEFAULT_SQLITE_DIR / "secure_emr.db"


def _default_database_url() -> str:
    return f"sqlite:///{DEFAULT_SQLITE_PATH.as_posix()}"


class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", _default_database_url())
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {"check_same_thread": False}
    } if SQLALCHEMY_DATABASE_URI.startswith("sqlite") else {}

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", "30")))
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    ADDITIONAL_CORS_ORIGINS = [origin.strip() for origin in os.getenv("ADDITIONAL_CORS_ORIGINS", "http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,http://localhost:3000,http://127.0.0.1:3000").split(",") if origin.strip()]
    RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")
    ADMIN_REGISTRATION_KEY = os.getenv("ADMIN_REGISTRATION_KEY", "")
    MFA_ISSUER_NAME = os.getenv("MFA_ISSUER_NAME", "Secure EMR")
    LOCKOUT_THRESHOLD = int(os.getenv("LOCKOUT_THRESHOLD", "5"))
    LOCKOUT_MINUTES = int(os.getenv("LOCKOUT_MINUTES", "15"))
    MFA_ENROLLMENT_MINUTES = int(os.getenv("MFA_ENROLLMENT_MINUTES", "15"))
    ENFORCE_SECURE_CONFIG = os.getenv("ENFORCE_SECURE_CONFIG", "false").lower() == "true"

    @classmethod
    def validate(cls) -> None:
        if cls.ENFORCE_SECURE_CONFIG and cls.JWT_SECRET_KEY == "dev-secret":
            raise RuntimeError("JWT_SECRET_KEY must be set to a strong secret in production.")
