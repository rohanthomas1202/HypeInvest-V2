from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class SocialMessage(BaseModel):
    text: str
    engagement: float
    source: str
    sentiment: float = 0.0


class PlatformScore(BaseModel):
    platform: str
    perception: float  # weighted avg sentiment, [-1, 1]
    popularity: float  # normalized engagement, [0, 1]
    message_count: int
    total_engagement: float


class StockInfo(BaseModel):
    ticker: str
    name: str
    current_price: float
    change: float
    change_percent: float
    high: float
    low: float
    market_cap: Optional[float] = None
    currency: str = "USD"


class HypeResult(BaseModel):
    ticker: str
    stock_info: StockInfo
    hype_index: float  # [-100, 100]
    total_perception: float  # [-1, 1]
    total_popularity: float  # [0, 1]
    platform_scores: list[PlatformScore]
    sources_used: list[str]
    sources_failed: list[str]


class HealthResponse(BaseModel):
    status: str
    version: str
    sources: list[str]
