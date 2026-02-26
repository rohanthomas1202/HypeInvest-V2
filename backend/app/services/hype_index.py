from __future__ import annotations

import math
from typing import Optional

from app.models.schemas import PlatformScore, SocialMessage

# Caps tuned for the data volumes our API tier actually returns
# (25 YouTube results, 50 Reddit posts, 50 news articles)
POPULARITY_CAPS: dict[str, float] = {
    "reddit": 5_000,
    "youtube": 500_000,
    "news": 50,
    "bluesky": 2_000,
    "stocktwits": 5_000,
}


def compute_platform_score(
    messages: list[SocialMessage], platform: str
) -> Optional[PlatformScore]:
    """Compute perception and popularity for a single platform.

    Returns None if there are no messages.
    """
    if not messages:
        return None

    # Perception: engagement-weighted average sentiment
    weighted_sum = sum((m.engagement + 1) * m.sentiment for m in messages)
    weight_total = sum(m.engagement + 1 for m in messages)

    perception = weighted_sum / weight_total if weight_total > 0 else 0.0

    # Popularity: total engagement normalized by platform cap
    total_engagement = sum(m.engagement for m in messages)
    cap = POPULARITY_CAPS.get(platform, 5_000)
    popularity = min(total_engagement / cap, 1.0)

    return PlatformScore(
        platform=platform,
        perception=round(perception, 4),
        popularity=round(popularity, 4),
        message_count=len(messages),
        total_engagement=total_engagement,
    )


def compute_hype_index(platform_scores: list[PlatformScore]) -> tuple[float, float, float]:
    """Compute the aggregate Hype Index from platform scores.

    Returns (hype_index, total_perception, total_popularity).
    hype_index is in [-100, 100].

    Formula: sign(perception) * tanh(4 * popularity * |perception|) * 100
    - tanh saturates smoothly to [-1, 1]
    - multiplier of 4 gives good spread for typical data volumes
    """
    if not platform_scores:
        return 0.0, 0.0, 0.0

    count = len(platform_scores)
    total_perception = sum(ps.perception for ps in platform_scores) / count
    total_popularity = sum(ps.popularity for ps in platform_scores) / count

    if total_perception == 0:
        return 0.0, 0.0, total_popularity

    sign = 1.0 if total_perception > 0 else -1.0
    hype = sign * math.tanh(4 * total_popularity * abs(total_perception)) * 100

    return round(hype, 2), round(total_perception, 4), round(total_popularity, 4)
