from abc import ABC, abstractmethod

from app.models.schemas import SocialMessage


class BaseScraper(ABC):
    """Abstract base class for all social media scrapers."""

    platform: str = ""

    @abstractmethod
    async def fetch_messages(self, query: str) -> list[SocialMessage]:
        """Fetch messages related to the query string.

        Args:
            query: Company name or ticker to search for.

        Returns:
            List of SocialMessage objects with text and engagement.
        """
        ...
