from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .auth import router as auth_router, get_current_user
from .scoring import compute_top5, compute_stock_details
from .schemas import Top5Response, StockDetailResponse

app = FastAPI(title="StockScout-India")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")

@app.get('/stocks/top5', response_model=Top5Response)
async def top5(window: int = 7, user=Depends(get_current_user)):
    return compute_top5(window_days=window)

@app.get('/stocks/{symbol}', response_model=StockDetailResponse)
async def stock_detail(symbol: str, user=Depends(get_current_user)):
    return compute_stock_details(symbol, window_days=30)

@app.get('/health')
async def health():
    return {"status": "ok"}
