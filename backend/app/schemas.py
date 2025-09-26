from pydantic import BaseModel
from typing import List, Dict, Any

class StockScore(BaseModel):
    symbol: str
    company: str = None
    probability: float
    last_price: float
    computed_at: str
    breakdown: Dict[str, float]

class Top5Response(BaseModel):
    window_days: int
    stocks: List[StockScore]

class Metric(BaseModel):
    name: str
    value: Any

class StockDetailResponse(BaseModel):
    symbol: str
    probability: float
    breakdown: Dict[str, float]
    metrics: List[Metric]
    price_history: List[List[float]]
