from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Reddit
    reddit_client_id: str = ""
    reddit_client_secret: str = ""
    reddit_username: str = ""
    reddit_password: str = ""

    # Finnhub
    finnhub_api_key: str = ""

    # Anthropic
    anthropic_api_key: str = ""

    # YouTube (Phase 2)
    youtube_api_key: str = ""

    # NewsAPI
    news_api_key: str = ""

    # Frontend URL (for CORS in production)
    frontend_url: str = ""

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
