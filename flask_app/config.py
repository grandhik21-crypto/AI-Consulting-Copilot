"""
Flask application configuration.
Loads settings from environment variables.
"""

import os
from dotenv import load_dotenv

# Load .env file if it exists
load_dotenv()


class Config:
    """Base configuration."""
    
    # Flask
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-me")
    
    # TMDB API
    TMDB_API_KEY = os.environ.get("TMDB_API_KEY")
    TMDB_BASE_URL = "https://api.themoviedb.org/3"
    TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"
    
    # Swipe settings
    DEFAULT_SWIPE_DECK_SIZE = 20
    MAX_REVIEWS_PER_MOVIE = 3
    REVIEW_TRUNCATE_LENGTH = 150
    
    @classmethod
    def validate(cls):
        """Validate required configuration."""
        if not cls.TMDB_API_KEY:
            raise ValueError(
                "TMDB_API_KEY environment variable is required. "
                "Get a free key at: https://www.themoviedb.org/settings/api"
            )


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False


# Select config based on environment
config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}


def get_config():
    """Get configuration based on FLASK_ENV."""
    env = os.environ.get("FLASK_ENV", "development")
    return config.get(env, config["default"])
