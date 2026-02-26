# HypeInvest V2

A modern stock sentiment analysis app that computes a **Hype Index** (-100 to +100) by scraping social media platforms and analyzing sentiment with AI.

## Stack

- **Backend**: FastAPI + Uvicorn + Pydantic v2 + httpx (async)
- **Frontend**: Next.js 15 + React 19 + TypeScript + shadcn/ui + Tailwind CSS
- **Sentiment**: Claude API (Anthropic)
- **Data Sources**: Reddit, YouTube, NewsAPI, Bluesky, StockTwits
- **Stock Data**: Finnhub (primary) + yfinance (fallback)

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Fill in your API keys
uvicorn app.main:app --reload
```

API docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App at `http://localhost:3000`

## API Keys Required

| Key | Source |
|-----|--------|
| `REDDIT_CLIENT_ID` | https://www.reddit.com/prefs/apps |
| `REDDIT_CLIENT_SECRET` | (same) |
| `REDDIT_USERNAME` | Your Reddit account |
| `REDDIT_PASSWORD` | Your Reddit account |
| `FINNHUB_API_KEY` | https://finnhub.io/ |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/ |
| `YOUTUBE_API_KEY` | Google Cloud Console (Phase 2) |
| `NEWS_API_KEY` | https://newsapi.org/ (Phase 2) |
