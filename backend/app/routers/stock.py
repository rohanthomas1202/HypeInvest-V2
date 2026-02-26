from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import StockInfo
from app.services.stock_data import get_stock_info
from app.utils.errors import StockNotFoundError

router = APIRouter(prefix="/api", tags=["stock"])


@router.get("/stock", response_model=StockInfo)
async def stock_endpoint(ticker: str = Query(..., description="Stock ticker symbol")) -> StockInfo:
    try:
        return await get_stock_info(ticker)
    except StockNotFoundError:
        raise HTTPException(status_code=404, detail=f"Stock not found: {ticker}")
