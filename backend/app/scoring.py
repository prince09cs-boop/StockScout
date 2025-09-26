import numpy as np
import pandas as pd
from .datasources import fetch_ohlcv, fetch_nse_option_chain
from .sentiment import sentiment_score
from datetime import datetime
import os

def rsi(series: pd.Series, period: int = 14):
    delta = series.diff()
    up = delta.clip(lower=0)
    down = -1 * delta.clip(upper=0)
    ma_up = up.ewm(alpha=1/period, adjust=False).mean()
    ma_down = down.ewm(alpha=1/period, adjust=False).mean()
    rs = ma_up / ma_down
    return 100 - (100 / (1 + rs))

def macd(series: pd.Series):
    ema12 = series.ewm(span=12, adjust=False).mean()
    ema26 = series.ewm(span=26, adjust=False).mean()
    macd_line = ema12 - ema26
    signal = macd_line.ewm(span=9, adjust=False).mean()
    hist = macd_line - signal
    return macd_line, signal, hist

def ad_line(df: pd.DataFrame):
    clv = ((df['Close'] - df['Low']) - (df['High'] - df['Close'])) / (df['High'] - df['Low']).replace(0, np.nan)
    clv = clv.fillna(0)
    ad = (clv * df['Volume']).cumsum()
    return ad

def vwap(df: pd.DataFrame):
    pv = df['Close'] * df['Volume']
    return pv.cumsum() / df['Volume'].cumsum()

def normalize(x, low, high):
    try:
        if np.isnan(x):
            return 0.5
    except:
        pass
    return float(max(0, min(1, (x - low) / (high - low))))

def compute_subscores(df: pd.DataFrame, symbol: str, headlines: list = None, option_chain=None):
    close = df['Close']
    scores = {}
    r = rsi(close)
    latest_rsi = r.iloc[-1] if len(r)>0 else 50
    scores['rsi'] = normalize(latest_rsi, 20, 80)
    macd_line, signal, hist = macd(close)
    macd_cross = 1.0 if (macd_line.iloc[-1] > signal.iloc[-1] and macd_line.iloc[-2] <= signal.iloc[-2]) else 0.0
    scores['macd_cross'] = macd_cross
    ma20 = close.rolling(window=20).mean().iloc[-1] if len(close)>=20 else close.iloc[-1]
    ma50 = close.rolling(window=50).mean().iloc[-1] if len(close)>=50 else ma20
    scores['ma_position'] = 1.0 if close.iloc[-1] > ma20 and ma20 > ma50 else 0.0
    ad = ad_line(df)
    ad_slope = (ad.iloc[-1] - ad.iloc[-5]) / (ad.iloc[-5] + 1e-9) if len(ad) > 5 else 0
    scores['ad_slope'] = normalize(ad_slope, -1, 5)
    vol_recent = df['Volume'].iloc[-5:]
    avg_vol = vol_recent.mean() if len(vol_recent)>0 else 0
    is_green = close.iloc[-1] > close.iloc[-2] if len(close)>1 else True
    vol_spike = 1.0 if (df['Volume'].iloc[-1] > 1.5 * avg_vol and is_green) else 0.0
    scores['vol_spike_green'] = vol_spike
    v = vwap(df)
    latest_vwap = v.iloc[-1] if len(v)>0 else close.iloc[-1]
    scores['above_vwap'] = 1.0 if close.iloc[-1] > latest_vwap else 0.0
    # sentiment (uses backend/app/sentiment.py)
    scores['sentiment'] = sentiment_score(headlines or [])
    # options: compute simple call-put imbalance if available
    cp_ratio = 0.5
    iv_skew = 0.5
    if option_chain:
        try:
            calls = 0
            puts = 0
            # option_chain structure varies; handle common shapes
            records = option_chain.get('records', {})
            data = records.get('data') if isinstance(records, dict) else option_chain.get('filtered', {}).get('data', [])
            if not data and isinstance(option_chain, dict):
                data = option_chain.get('filtered', {}).get('data', [])
            for entry in data:
                if 'CE' in entry and entry['CE']:
                    calls += entry['CE'].get('totalBuyQuantity', 0) or 0
                if 'PE' in entry and entry['PE']:
                    puts += entry['PE'].get('totalBuyQuantity', 0) or 0
            if (calls+puts)>0:
                cp_ratio = calls/(calls+puts)
            iv_skew = 0.5
        except Exception:
            pass
    scores['options_cp_ratio'] = cp_ratio
    scores['options_iv_skew'] = iv_skew
    return scores

def aggregate_score(subscores: dict, weights: dict = None):
    if weights is None:
        weights = {'tech': 0.3, 'flow': 0.2, 'sentiment': 0.2, 'options': 0.2, 'fund': 0.1}
    tech = (subscores.get('rsi',0)*0.4 + subscores.get('macd_cross',0)*0.25 + subscores.get('ma_position',0)*0.25 + subscores.get('ad_slope',0)*0.1)
    flow = (subscores.get('vol_spike_green',0)*0.6 + subscores.get('above_vwap',0)*0.4)
    sentiment = subscores.get('sentiment',0)
    options = (subscores.get('options_cp_ratio',0) * 0.7 + subscores.get('options_iv_skew',0) * 0.3)
    fund = 0.5
    P = tech*weights['tech'] + flow*weights['flow'] + sentiment*weights['sentiment'] + options*weights['options'] + fund*weights['fund']
    breakdown = {'tech': tech, 'flow': flow, 'sentiment': sentiment, 'options': options, 'fund': fund}
    return max(0.0, min(1.0, float(P))), breakdown

def compute_top5(window_days: int = 7):
    watchlist = ['RELIANCE.NS','TCS.NS','INFY.NS','HDFCBANK.NS','ICICIBANK.NS']
    results = []
    for s in watchlist:
        df = fetch_ohlcv(s, period_days=60)
        if df is None or df.empty:
            continue
        option_chain = fetch_nse_option_chain(s)
        subs = compute_subscores(df, s, headlines=[], option_chain=option_chain)
        prob, breakdown = aggregate_score(subs)
        results.append({
            'symbol': s,
            'company': s.split('.')[0],
            'probability': prob,
            'last_price': float(df['Close'].iloc[-1]),
            'computed_at': datetime.utcnow().isoformat(),
            'breakdown': breakdown
        })
    results = sorted(results, key=lambda x: x['probability'], reverse=True)[:5]
    return {'window_days': window_days, 'stocks': results}

def compute_stock_details(symbol: str, window_days: int = 30):
    df = fetch_ohlcv(symbol, period_days=max(60, window_days))
    headlines = []
    option_chain = fetch_nse_option_chain(symbol)
    subs = compute_subscores(df, symbol, headlines, option_chain)
    prob, breakdown = aggregate_score(subs)
    price_history = df[['Open','High','Low','Close']].tail(window_days).values.tolist()
    return {
        'symbol': symbol,
        'probability': prob,
        'breakdown': breakdown,
        'metrics': [{'name':k,'value':v} for k,v in subs.items()],
        'price_history': price_history
    }
