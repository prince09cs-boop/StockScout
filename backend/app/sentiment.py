import os
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

# Transformer-based sentiment optional
TRANSFORMER = None
def load_transformer():
    global TRANSFORMER
    if TRANSFORMER is None:
        try:
            from transformers import pipeline
            TRANSFORMER = pipeline('sentiment-analysis', model='distilbert-base-uncased-finetuned-sst-2-english')
        except Exception as e:
            print('Transformer sentiment load failed:', e)
            TRANSFORMER = None
    return TRANSFORMER

def sentiment_score_vader(headlines: list):
    if not headlines:
        return 0.5
    scores = [analyzer.polarity_scores(h)['compound'] for h in headlines]
    mean = sum(scores)/len(scores)
    return float((mean + 1) / 2)

def sentiment_score_transformer(headlines: list):
    tr = load_transformer()
    if tr is None or not headlines:
        return 0.5
    vals = []
    for h in headlines:
        r = tr(h[:512])[0]
        if r['label'] == 'POSITIVE':
            vals.append(r['score'])
        else:
            vals.append(1.0 - r['score'])
    return float(sum(vals)/len(vals))

def sentiment_score(headlines: list):
    mode = os.getenv('SENTIMENT_MODE','vader')
    if mode == 'transformer':
        return sentiment_score_transformer(headlines)
    return sentiment_score_vader(headlines)
