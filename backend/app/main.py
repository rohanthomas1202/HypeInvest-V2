import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, hype, stock

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.getLogger(__name__).info("HypeInvest V2 starting up")
    yield
    logging.getLogger(__name__).info("HypeInvest V2 shutting down")


app = FastAPI(
    title="HypeInvest V2",
    description="Stock sentiment analysis powered by social media hype",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router)
app.include_router(stock.router)
app.include_router(hype.router)
