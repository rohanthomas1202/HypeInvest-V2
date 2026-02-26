from fastapi import APIRouter

from app.config import get_settings
from app.models.schemas import HealthResponse

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    settings = get_settings()
    sources: list[str] = []

    if settings.reddit_client_id:
        sources.append("reddit")
    if settings.youtube_api_key:
        sources.append("youtube")
    if settings.news_api_key:
        sources.append("news")

    return HealthResponse(
        status="ok",
        version="2.0.0",
        sources=sources,
    )
