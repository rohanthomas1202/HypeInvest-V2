class ScraperError(Exception):
    """Raised when a scraper fails to fetch data."""

    def __init__(self, platform: str, message: str):
        self.platform = platform
        super().__init__(f"{platform} scraper failed: {message}")


class StockNotFoundError(Exception):
    """Raised when a ticker symbol is not found."""

    def __init__(self, ticker: str):
        self.ticker = ticker
        super().__init__(f"Stock not found: {ticker}")


class SentimentError(Exception):
    """Raised when sentiment analysis fails."""
    pass
