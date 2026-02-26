import asyncio
import logging

from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import HypeResult, PlatformScore, SocialMessage
from app.scrapers.reddit import RedditScraper
from app.scrapers.youtube import YouTubeScraper
from app.scrapers.news import NewsScraper
from app.services.hype_index import compute_hype_index, compute_platform_score
from app.services.sentiment import analyze_sentiment
from app.services.stock_data import get_stock_info
from app.utils.errors import StockNotFoundError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["hype"])

# All available scrapers — extend this list in later phases
SCRAPERS = [RedditScraper(), YouTubeScraper(), NewsScraper()]


@router.get("/hype", response_model=HypeResult)
async def hype_endpoint(ticker: str = Query(..., description="Stock ticker symbol")) -> HypeResult:
    ticker = ticker.upper().strip()

    # Fetch stock info
    try:
        stock_info = await get_stock_info(ticker)
    except StockNotFoundError:
        raise HTTPException(status_code=404, detail=f"Stock not found: {ticker}")

    # Build search query — use company name if available, plus ticker
    search_query = f"{stock_info.name} {ticker}" if stock_info.name != ticker else ticker
    logger.info(f"Searching for: '{search_query}' across {len(SCRAPERS)} scrapers")

    # Run all scrapers concurrently
    scraper_tasks = [scraper.fetch_messages(search_query) for scraper in SCRAPERS]
    scraper_results = await asyncio.gather(*scraper_tasks, return_exceptions=True)

    # Process results per platform
    sources_used: list[str] = []
    sources_failed: list[str] = []
    all_platform_scores: list[PlatformScore] = []

    for scraper, result in zip(SCRAPERS, scraper_results):
        if isinstance(result, Exception):
            logger.error(f"{scraper.platform} scraper failed: {result}")
            sources_failed.append(scraper.platform)
            continue

        messages: list[SocialMessage] = result
        if not messages:
            sources_failed.append(scraper.platform)
            continue

        # Run sentiment analysis on all messages for this platform
        texts = [m.text for m in messages]
        sentiments = await analyze_sentiment(texts, ticker)

        # Attach sentiments back to messages
        for msg, sent in zip(messages, sentiments):
            msg.sentiment = sent

        # Compute platform score
        score = compute_platform_score(messages, scraper.platform)
        if score:
            all_platform_scores.append(score)
            sources_used.append(scraper.platform)
        else:
            sources_failed.append(scraper.platform)

    # Compute aggregate hype index
    hype_index, total_perception, total_popularity = compute_hype_index(all_platform_scores)

    return HypeResult(
        ticker=ticker,
        stock_info=stock_info,
        hype_index=hype_index,
        total_perception=total_perception,
        total_popularity=total_popularity,
        platform_scores=all_platform_scores,
        sources_used=sources_used,
        sources_failed=sources_failed,
    )
