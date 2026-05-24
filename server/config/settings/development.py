"""
config/settings/development.py

Development-only settings.
More verbose, less secure (by design — easier to debug).
"""
from .base import *  # noqa

DEBUG = True

# Allow all hosts locally
ALLOWED_HOSTS = ["*"]

# Faster password hashing in tests/dev
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",  # Fast, not for prod
]

# Show SQL queries in shell
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{levelname}] {asctime} {module} | {message}",
            "style": "{",
        },
        "simple": {
            "format": "[{levelname}] {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django.db.backends": {
            "handlers": ["console"],
            "level": "DEBUG",  # Set to DEBUG to see all SQL queries
            "propagate": False,
        },
        "apps": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}

# Django Debug Toolbar (optional, install separately)
try:
    import debug_toolbar  # noqa
    INSTALLED_APPS += ["debug_toolbar"]
    MIDDLEWARE += ["debug_toolbar.middleware.DebugToolbarMiddleware"]
    INTERNAL_IPS = ["127.0.0.1"]
except ImportError:
    pass

# Email to console in dev
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# CORS open in dev
CORS_ALLOW_ALL_ORIGINS = True
