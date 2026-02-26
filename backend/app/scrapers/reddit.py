import logging
from datetime import datetime, timedelta, timezone

import asyncpraw

from app.config import get_settings
from app.models.schemas import SocialMessage
from app.scrapers.base import BaseScraper

logger = logging.getLogger(__name__)

MAX_POSTS = 50


class RedditScraper(BaseScraper):
    platform = "reddit"

    async def fetch_messages(self, query: str) -> list[SocialMessage]:
        """Search Reddit for posts about a stock/company from the past 7 days."""
        settings = get_settings()

        if not settings.reddit_client_id or not settings.reddit_client_secret:
            raise ValueError("Reddit API credentials not configured")

        reddit = asyncpraw.Reddit(
            client_id=settings.reddit_client_id,
            client_secret=settings.reddit_client_secret,
            username=settings.reddit_username,
            password=settings.reddit_password,
            user_agent="HypeInvest-V2/2.0",
        )

        messages: list[SocialMessage] = []
        cutoff = datetime.now(timezone.utc) - timedelta(days=7)

        try:
            subreddit = await reddit.subreddit("all")
            async for post in subreddit.search(
                query, sort="relevance", time_filter="week", limit=MAX_POSTS
            ):
                created = datetime.fromtimestamp(post.created_utc, tz=timezone.utc)
                if created < cutoff:
                    continue

                text = post.title
                if post.selftext:
                    # Include beginning of body for more context
                    text += " " + post.selftext[:200]

                engagement = max(post.score, 0)

                messages.append(
                    SocialMessage(
                        text=text,
                        engagement=float(engagement),
                        source=f"r/{post.subreddit.display_name}",
                    )
                )
        finally:
            await reddit.close()

        logger.info(f"Reddit: fetched {len(messages)} posts for '{query}'")
        return messages
