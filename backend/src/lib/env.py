"""
Environment detection utilities
"""

import os


def is_production() -> bool:
    """Check if running in production environment"""
    return os.getenv("ENVIRONMENT", "development") == "production"


def is_dev() -> bool:
    """Check if running in development environment"""
    return not is_production()


def get_env(key: str, default: str = "") -> str:
    """Get environment variable with default"""
    return os.getenv(key, default)
