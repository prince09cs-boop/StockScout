# Backend

## Run locally (macOS)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env
# If using transformer sentiment, set SENTIMENT_MODE=transformer in .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Open http://localhost:8000/docs for API docs.
