import json
import logging

import anthropic

from app.config import get_settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a financial sentiment analyst. For each text provided, rate the sentiment toward the stock/company/crypto on a scale from -1.0 (very negative) to 1.0 (very positive).

Respond with ONLY a JSON array of floats, one per text. Each float is from -1.0 to 1.0.

Example for 3 texts:
[0.7, -0.3, 0.1]"""


async def analyze_sentiment(texts: list[str], ticker: str) -> list[float]:
    """Batch-analyze sentiment for multiple texts using Claude.

    Returns a list of sentiment floats from -1.0 to 1.0.
    """
    if not texts:
        return []

    settings = get_settings()
    if not settings.anthropic_api_key:
        logger.warning("No Anthropic API key — returning neutral sentiments")
        return [0.0] * len(texts)

    # Batch in chunks of 20 to keep prompts reasonable
    all_sentiments: list[float] = []
    for i in range(0, len(texts), 20):
        chunk = texts[i : i + 20]
        chunk_sentiments = await _analyze_chunk(chunk, ticker, settings.anthropic_api_key)
        all_sentiments.extend(chunk_sentiments)

    return all_sentiments


async def _analyze_chunk(texts: list[str], ticker: str, api_key: str) -> list[float]:
    numbered = "\n".join(f"{i + 1}. {text}" for i, text in enumerate(texts))
    user_prompt = f"Rate sentiment toward {ticker} in each text:\n\n{numbered}"

    try:
        client = anthropic.AsyncAnthropic(api_key=api_key)
        message = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_prompt}],
        )

        response_text = message.content[0].text.strip()
        logger.info(f"Sentiment response for {ticker}: {response_text[:200]}")

        results = json.loads(response_text)

        sentiments: list[float] = []
        for r in results:
            val = float(r) if isinstance(r, (int, float)) else 0.0
            sentiments.append(max(-1.0, min(1.0, val)))

        # Pad or trim to match input length
        while len(sentiments) < len(texts):
            sentiments.append(0.0)
        return sentiments[: len(texts)]

    except json.JSONDecodeError as e:
        logger.error(f"Sentiment JSON parse failed for {ticker}: {e}")
        logger.error(f"Raw response: {response_text[:500]}")
        return [0.0] * len(texts)
    except Exception as e:
        logger.error(f"Sentiment analysis failed for {ticker}: {type(e).__name__}: {e}")
        return [0.0] * len(texts)
