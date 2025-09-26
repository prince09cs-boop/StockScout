import yfinance as yf
import pandas as pd
from datetime import datetime
import os
import httpx
from bs4 import BeautifulSoup

CACHE = {}

def fetch_ohlcv(symbol: str, period_days: int = 60):
    key = f"ohlcv:{symbol}:{period_days}"
    now = datetime.utcnow()
    entry = CACHE.get(key)
    cache_seconds = int(os.environ.get('YFINANCE_CACHE_SECONDS') or 300)
    if entry and (now - entry['ts']).seconds < cache_seconds:
        return entry['data']
    ticker = yf.Ticker(symbol)
    period = f"{max(60, period_days)}d"
    df = ticker.history(period=period)
    df = df.reset_index()
    CACHE[key] = {'ts': now, 'data': df}
    return df

def fetch_nse_option_chain(symbol: str):
    """Fetch option chain JSON from NSE public endpoint for indices or for stocks when available.
    Note: NSE blocks naive scraping. This function is a best-effort stub and includes headers and retries.
    Use a paid API for production.
    """
    base = symbol.replace('.NS','')
    # Try indices endpoint first
    url_idx = f"https://www.nseindia.com/api/option-chain-indices?symbol={base}"
    url_eq = f"https://www.nseindia.com/api/option-chain-equities?symbol={base}"
    headers = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0 Safari/537.36"}
    try:
        with httpx.Client(headers=headers, timeout=10) as client:
            r = client.get(url_idx)
            if r.status_code == 200:
                return r.json()
            r2 = client.get(url_eq)
            if r2.status_code == 200:
                return r2.json()
    except Exception as e:
        print('NSE option fetch failed', e)
    return None
