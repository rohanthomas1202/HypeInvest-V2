import logging
from datetime import datetime, timedelta, timezone

import httpx

from app.config import get_settings
from app.models.schemas import SocialMessage
from app.scrapers.base import BaseScraper

logger = logging.getLogger(__name__)

NEWS_API_URL = "https://newsapi.org/v2/everything"
MAX_ARTICLES = 50


class NewsScraper(BaseScraper):
    platform = "news"

    async def fetch_messages(self, query: str) -> list[SocialMessage]:
        """Search NewsAPI for articles about a stock/company from the past 7 days."""
        settings = get_settings()

        if not settings.news_api_key:
            raise ValueError("NewsAPI key not configured")

        now = datetime.now(timezone.utc)
        from_date = (now - timedelta(days=7)).strftime("%Y-%m-%d")
        to_date = now.strftime("%Y-%m-%d")

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                NEWS_API_URL,
                params={
                    "qInTitle": query,
                    "from": from_date,
                    "to": to_date,
                    "language": "en",
                    "sortBy": "relevancy",
                    "pageSize": MAX_ARTICLES,
                    "apiKey": settings.news_api_key,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        total_results = data.get("totalResults", 0)
        articles = data.get("articles", [])

        messages: list[SocialMessage] = []
        for article in articles:
            title = article.get("title") or ""
            description = article.get("description") or ""
            source_name = article.get("source", {}).get("name", "Unknown")

            text = title
            if description:
                text += " " + description[:200]

            # News articles don't have engagement metrics like upvotes,
            # so we use a flat engagement of 1.0 per article.
            # Popularity is driven by totalResults / cap instead.
            messages.append(
                SocialMessage(
                    text=text,
                    engagement=1.0,
                    source=source_name,
                )
            )

        # Store total_results on the list so hype_index can use it for popularity
        # We handle this via message count + the popularity cap in hype_index.py
        logger.info(
            f"News: fetched {len(messages)} articles (total: {total_results}) for '{query}'"
        )
        return messages
