import logging
from datetime import datetime, timedelta, timezone

import httpx

from app.config import get_settings
from app.models.schemas import SocialMessage
from app.scrapers.base import BaseScraper

logger = logging.getLogger(__name__)

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"
MAX_RESULTS = 25


class YouTubeScraper(BaseScraper):
    platform = "youtube"

    async def fetch_messages(self, query: str) -> list[SocialMessage]:
        """Search YouTube for videos about a stock/company from the past 7 days."""
        settings = get_settings()

        if not settings.youtube_api_key:
            raise ValueError("YouTube API key not configured")

        published_after = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

        async with httpx.AsyncClient(timeout=15.0) as client:
            # Step 1: Search for videos
            search_resp = await client.get(
                YOUTUBE_SEARCH_URL,
                params={
                    "part": "snippet",
                    "q": query,
                    "type": "video",
                    "order": "relevance",
                    "publishedAfter": published_after,
                    "maxResults": MAX_RESULTS,
                    "key": settings.youtube_api_key,
                },
            )
            search_resp.raise_for_status()
            search_data = search_resp.json()

            video_ids = [
                item["id"]["videoId"]
                for item in search_data.get("items", [])
                if "videoId" in item.get("id", {})
            ]

            if not video_ids:
                return []

            # Step 2: Get video statistics (view count, like count)
            stats_resp = await client.get(
                YOUTUBE_VIDEOS_URL,
                params={
                    "part": "statistics,snippet",
                    "id": ",".join(video_ids),
                    "key": settings.youtube_api_key,
                },
            )
            stats_resp.raise_for_status()
            stats_data = stats_resp.json()

        messages: list[SocialMessage] = []
        for item in stats_data.get("items", []):
            snippet = item.get("snippet", {})
            stats = item.get("statistics", {})

            title = snippet.get("title", "")
            view_count = int(stats.get("viewCount", 0))
            like_count = int(stats.get("likeCount", 0))

            # Engagement: views weighted by like ratio
            # likeCount / (likeCount + 1) avoids division by zero
            engagement = view_count * (like_count / (like_count + 1))

            messages.append(
                SocialMessage(
                    text=title,
                    engagement=engagement,
                    source=snippet.get("channelTitle", "YouTube"),
                )
            )

        logger.info(f"YouTube: fetched {len(messages)} videos for '{query}'")
        return messages
