# Agent Instructions

You're working inside the **WAT framework** (Workflows, Agents, Tools). This architecture separates concerns so that probabilistic AI handles reasoning while deterministic code handles execution. That separation is what makes this system reliable.

## The WAT Architecture

**Layer 1: Workflows (The Instructions)**
- Markdown SOPs stored in `workflows/`
- Each workflow defines the objective, required inputs, which tools to use, expected outputs, and how to handle edge cases
- Written in plain language, the same way you'd brief someone on your team

**Layer 2: Agents (The Decision-Maker)**
- This is your role. You're responsible for intelligent coordination.
- Read the relevant workflow, run tools in the correct sequence, handle failures gracefully, and ask clarifying questions when needed
- You connect intent to execution without trying to do everything yourself
- Example: If you need to pull data from a website, don't attempt it directly. Read `workflows/scrape_website.md`, figure out the required inputs, then execute `tools/scrape_single_site.py`

**Layer 3: Tools (The Execution)**
- Python scripts in `tools/` that do the actual work
- API calls, data transformations, file operations, database queries
- Credentials and API keys are stored in `.env`
- These scripts are consistent, testable, and fast

**Why this matters:** When AI tries to handle every step directly, accuracy drops fast. If each step is 90% accurate, you're down to 59% success after just five steps. By offloading execution to deterministic scripts, you stay focused on orchestration and decision-making where you excel.

## How to Operate

**1. Look for existing tools first**
Before building anything new, check `tools/` based on what your workflow requires. Only create new scripts when nothing exists for that task.

**2. Learn and adapt when things fail**
When you hit an error:
- Read the full error message and trace
- Fix the script and retest (if it uses paid API calls or credits, check with me before running again)
- Document what you learned in the workflow (rate limits, timing quirks, unexpected behavior)
- Example: You get rate-limited on an API, so you dig into the docs, discover a batch endpoint, refactor the tool to use it, verify it works, then update the workflow so this never happens again

**3. Keep workflows current**
Workflows should evolve as you learn. When you find better methods, discover constraints, or encounter recurring issues, update the workflow. That said, don't create or overwrite workflows without asking unless I explicitly tell you to. These are your instructions and need to be preserved and refined, not tossed after one use.

## The Self-Improvement Loop

Every failure is a chance to make the system stronger:
1. Identify what broke
2. Fix the tool
3. Verify the fix works
4. Update the workflow with the new approach
5. Move on with a more robust system

This loop is how the framework improves over time.

## File Structure

**What goes where:**
- **Deliverables**: Final outputs go to cloud services (Google Sheets, Slides, etc.) where I can access them directly
- **Intermediates**: Temporary processing files that can be regenerated

**Directory layout:**
```
.tmp/           # Temporary files (scraped data, intermediate exports). Regenerated as needed.
tools/          # Python scripts for deterministic execution
workflows/      # Markdown SOPs defining what to do and how
.env            # API keys and environment variables (NEVER store secrets anywhere else)
credentials.json, token.json  # Google OAuth (gitignored)
```

**Core principle:** Local files are just for processing. Anything I need to see or use lives in cloud services. Everything in `.tmp/` is disposable.

## Bottom Line

You sit between what I want (workflows) and what actually gets done (tools). Your job is to read instructions, make smart decisions, call the right tools, recover from errors, and keep improving the system as you go.

Stay pragmatic. Stay reliable. Keep learning.

---

# HypeInvest V2

## What This Is

A modernized rewrite of HypeInvest, a Hack UTD hackathon-winning stock sentiment analysis app. The original lives at `../HypeInvesting-HackUTD/` and must not be modified.

## Full Implementation Plan

The detailed phased plan is at: `C:\Users\rohan\.claude\plans\synchronous-knitting-tower.md`

Reference it when starting each phase.

## Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript + shadcn/ui + Tailwind CSS + TanStack Query v5 + Recharts
- **Backend**: FastAPI + Uvicorn + Pydantic v2 + httpx (async)
- **Sentiment**: Claude API (Anthropic) — batch texts, return -1.0 to 1.0 per text
- **Data Sources**: Reddit (asyncpraw) + YouTube Data API v3 + NewsAPI + Bluesky (AT Protocol) + StockTwits
- **Stock Data**: Finnhub (primary, 60 free calls/min) + yfinance (fallback/history)

## Project Structure

```
HypeInvest-V2/
  backend/                      # FastAPI app
    app/
      main.py                   # App entry, CORS, lifespan
      config.py                 # Pydantic Settings from .env
      models/schemas.py         # Pydantic response models
      routers/                  # hype.py, stock.py, health.py
      services/                 # hype_index.py, sentiment.py, stock_data.py
      scrapers/                 # base.py, reddit.py, youtube.py, news.py, bluesky.py, stocktwits.py
    requirements.txt
    .env.example
  frontend/                     # Next.js app
    src/
      app/                      # Pages (layout, page, search/, dashboard/, docs/)
      components/               # layout/, stock/, search/, ui/
      hooks/                    # TanStack Query hooks
      lib/                      # api.ts, utils.ts
      types/                    # TypeScript interfaces
      providers/                # QueryProvider, ThemeProvider
  README.md
  .gitignore
```

## Architecture Rules

1. **Backend and frontend are separate** — frontend calls FastAPI directly, no Next.js API routes for data
2. **All API keys in `.env`** — never hardcode credentials. Use Pydantic Settings to load them.
3. **Async everywhere in backend** — `async def` endpoints, `asyncpraw`, `httpx`, `asyncio.gather()` for parallel scraping
4. **Typed API contract** — Pydantic models on backend, matching TypeScript interfaces on frontend
5. **Graceful degradation** — if one scraper fails, omit it and compute with remaining sources
6. **TanStack Query for all data fetching** — no raw `fetch()` calls in components
7. **shadcn/ui components** — use the CLI to add components, customize from there

## The Hype Index Algorithm (Corrected)

```
Per platform:
  perception = sum((engagement + 1) * sentiment) / sum(engagement + 1)   # weighted avg, [-1, 1]
  popularity = min(total_engagement / platform_cap, 1.0)                  # normalized, [0, 1]

Aggregate:
  total_perception = avg(all platform perceptions)   # divide by actual count, not hardcoded
  total_popularity = avg(all platform popularities)

Hype Index:
  if perception == 0: hype = 0
  else: hype = sign(perception) * tanh^2(8 * popularity * perception) * 100   # [-100, 100]
```

Platform caps: Reddit=10K, YouTube=10M, News=5K, Bluesky=5K, StockTwits=10K

## Phases (Summary)

1. **Phase 1**: FastAPI + Reddit scraper + stock data + sentiment + hype algorithm
2. **Phase 2**: YouTube + News scrapers (backend feature-complete)
3. **Phase 3**: Next.js frontend + search page + hype gauge
4. **Phase 4**: Dashboard + price charts
5. **Phase 5**: Bluesky + StockTwits (new sources)
6. **Phase 6**: Dark mode + docs page + error handling + deploy prep

## Required API Keys

```env
REDDIT_CLIENT_ID=         # https://www.reddit.com/prefs/apps
REDDIT_CLIENT_SECRET=
REDDIT_USERNAME=
REDDIT_PASSWORD=
YOUTUBE_API_KEY=          # Google Cloud Console → YouTube Data API v3
NEWS_API_KEY=             # https://newsapi.org/register
FINNHUB_API_KEY=          # https://finnhub.io/
ANTHROPIC_API_KEY=        # https://console.anthropic.com/
```
