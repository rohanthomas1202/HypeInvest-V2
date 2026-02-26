import logging

import finnhub
import yfinance as yf

from app.config import get_settings
from app.models.schemas import StockInfo
from app.utils.errors import StockNotFoundError

logger = logging.getLogger(__name__)

# Common crypto tickers → (finnhub symbol, yfinance symbol, display name)
CRYPTO_MAP = {
    "BTC": ("BINANCE:BTCUSDT", "BTC-USD", "Bitcoin"),
    "ETH": ("BINANCE:ETHUSDT", "ETH-USD", "Ethereum"),
    "SOL": ("BINANCE:SOLUSDT", "SOL-USD", "Solana"),
    "ADA": ("BINANCE:ADAUSDT", "ADA-USD", "Cardano"),
    "XRP": ("BINANCE:XRPUSDT", "XRP-USD", "XRP"),
    "DOGE": ("BINANCE:DOGEUSDT", "DOGE-USD", "Dogecoin"),
    "DOT": ("BINANCE:DOTUSDT", "DOT-USD", "Polkadot"),
    "AVAX": ("BINANCE:AVAXUSDT", "AVAX-USD", "Avalanche"),
    "MATIC": ("BINANCE:MATICUSDT", "MATIC-USD", "Polygon"),
    "LINK": ("BINANCE:LINKUSDT", "LINK-USD", "Chainlink"),
    "UNI": ("BINANCE:UNIUSDT", "UNI-USD", "Uniswap"),
    "ATOM": ("BINANCE:ATOMUSDT", "ATOM-USD", "Cosmos"),
    "LTC": ("BINANCE:LTCUSDT", "LTC-USD", "Litecoin"),
    "SHIB": ("BINANCE:SHIBUSDT", "SHIB-USD", "Shiba Inu"),
    "ARB": ("BINANCE:ARBUSDT", "ARB-USD", "Arbitrum"),
    "OP": ("BINANCE:OPUSDT", "OP-USD", "Optimism"),
    "APT": ("BINANCE:APTUSDT", "APT-USD", "Aptos"),
    "NEAR": ("BINANCE:NEARUSDT", "NEAR-USD", "NEAR Protocol"),
    "FIL": ("BINANCE:FILUSDT", "FIL-USD", "Filecoin"),
    "PEPE": ("BINANCE:PEPEUSDT", "PEPE-USD", "Pepe"),
}


def is_crypto(ticker: str) -> bool:
    return ticker.upper() in CRYPTO_MAP


async def get_stock_info(ticker: str) -> StockInfo:
    """Fetch stock or crypto data. Tries Finnhub first for stocks, yfinance as fallback.
    Crypto tickers go directly to yfinance."""
    ticker = ticker.upper().strip()

    # Crypto → try Finnhub first, then yfinance
    if is_crypto(ticker):
        settings = get_settings()
        if settings.finnhub_api_key:
            try:
                return _fetch_crypto_finnhub(ticker, settings.finnhub_api_key)
            except Exception as e:
                logger.warning(f"Finnhub crypto failed for {ticker}: {e}, trying yfinance")
        try:
            return _fetch_crypto_yfinance(ticker)
        except Exception as e:
            logger.error(f"Crypto fetch failed for {ticker}: {e}")
            raise StockNotFoundError(ticker)

    # Stocks: try Finnhub first
    settings = get_settings()
    if settings.finnhub_api_key:
        try:
            return _fetch_finnhub(ticker, settings.finnhub_api_key)
        except Exception as e:
            logger.warning(f"Finnhub failed for {ticker}: {e}, falling back to yfinance")

    # Fallback to yfinance
    try:
        return _fetch_yfinance(ticker)
    except Exception as e:
        logger.error(f"yfinance also failed for {ticker}: {e}")
        raise StockNotFoundError(ticker)


def _fetch_crypto_finnhub(ticker: str, api_key: str) -> StockInfo:
    fh_symbol, _, display_name = CRYPTO_MAP[ticker]
    client = finnhub.Client(api_key=api_key)

    quote = client.quote(fh_symbol)
    if not quote or quote.get("c", 0) == 0:
        raise ValueError(f"No Finnhub quote for {fh_symbol}")

    return StockInfo(
        ticker=ticker,
        name=display_name,
        current_price=quote["c"],
        change=round(quote["d"] or 0, 2),
        change_percent=round(quote["dp"] or 0, 2),
        high=quote["h"],
        low=quote["l"],
        market_cap=None,
        currency="USD",
    )


def _fetch_crypto_yfinance(ticker: str) -> StockInfo:
    _, yf_symbol, display_name = CRYPTO_MAP[ticker]
    stock = yf.Ticker(yf_symbol)
    info = stock.info

    price = info.get("regularMarketPrice") or info.get("currentPrice", 0)
    if not price:
        raise ValueError(f"No price data for {ticker}")

    prev_close = info.get("regularMarketPreviousClose") or info.get("previousClose", price)
    change = round(price - prev_close, 2)
    change_pct = round((change / prev_close) * 100, 2) if prev_close else 0.0

    return StockInfo(
        ticker=ticker,
        name=display_name,
        current_price=price,
        change=change,
        change_percent=change_pct,
        high=info.get("dayHigh") or info.get("regularMarketDayHigh", price),
        low=info.get("dayLow") or info.get("regularMarketDayLow", price),
        market_cap=info.get("marketCap"),
        currency="USD",
    )


def _fetch_finnhub(ticker: str, api_key: str) -> StockInfo:
    client = finnhub.Client(api_key=api_key)

    quote = client.quote(ticker)
    if not quote or quote.get("c", 0) == 0:
        raise ValueError(f"No quote data for {ticker}")

    profile = client.company_profile2(symbol=ticker)
    name = profile.get("name", ticker) if profile else ticker
    market_cap = profile.get("marketCapitalization") if profile else None
    # Finnhub returns market cap in millions
    if market_cap:
        market_cap = market_cap * 1_000_000

    return StockInfo(
        ticker=ticker,
        name=name,
        current_price=quote["c"],
        change=round(quote["d"] or 0, 2),
        change_percent=round(quote["dp"] or 0, 2),
        high=quote["h"],
        low=quote["l"],
        market_cap=market_cap,
        currency="USD",
    )


def _fetch_yfinance(ticker: str) -> StockInfo:
    stock = yf.Ticker(ticker)
    info = stock.info

    if not info or "currentPrice" not in info and "regularMarketPrice" not in info:
        raise ValueError(f"No data for {ticker}")

    price = info.get("currentPrice") or info.get("regularMarketPrice", 0)
    prev_close = info.get("previousClose") or info.get("regularMarketPreviousClose", price)
    change = round(price - prev_close, 2)
    change_pct = round((change / prev_close) * 100, 2) if prev_close else 0.0

    return StockInfo(
        ticker=ticker,
        name=info.get("shortName") or info.get("longName", ticker),
        current_price=price,
        change=change,
        change_percent=change_pct,
        high=info.get("dayHigh") or info.get("regularMarketDayHigh", price),
        low=info.get("dayLow") or info.get("regularMarketDayLow", price),
        market_cap=info.get("marketCap"),
        currency=info.get("currency", "USD"),
    )
