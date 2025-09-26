# Step-by-step: Run locally and make the app accessible to users (macOS)

## Prerequisites
- Git
- Python 3.11
- Node.js 18+
- (Optional) Docker & Docker Compose

---
## Option A: Quick local run (without Docker)

### Backend
1. Open Terminal
2. Create virtualenv and install deps
   ```bash
   cd /path/to/StockScout_full_upgraded/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Copy environment example
   ```bash
   cp ../.env.example .env
   # Edit .env if needed (DEV_MODE=true) and optionally set SENTIMENT_MODE=transformer
   ```
4. Run the backend
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
5. Open http://localhost:8000/docs to see API docs.

### Frontend
1. In a new terminal window/tab
   ```bash
   cd /path/to/StockScout_full_upgraded/frontend
   npm install
   npm run dev -- --host
   ```
2. Open http://localhost:5173 (vite default) or the host/port shown in console.

### Login (dev)
- On the frontend login screen, enter any email/mobile and click Request OTP.
- Dev OTP will appear on the login screen ("Dev OTP: 123456"). Use that to verify.

---
## Option B: Docker Compose (recommended if Docker installed)
1. From project root
   ```bash
   docker-compose up --build
   ```
2. Backend: http://localhost:8000, Frontend: http://localhost:3000

---
## Pushing to GitHub
1. Create a new repo on GitHub (StockScout) and copy the clone URL.
2. From project root:
   ```bash
   git init
   git remote add origin https://github.com/<your-username>/StockScout.git
   git add .
   git commit -m "Initial commit: StockScout scaffold (upgraded)"
   git push -u origin main
   ```

---
## Deploying (free-tier suggestions)
- Frontend: Vercel (connect repo, build command: `npm run build`, output dir: `dist`).
- Backend: Railway or Render free tier (connect repo, pick `backend/` folder). Set environment variables from `.env` in the project dashboard.

---
## Notes & Next steps
- Transformer sentiment will download a model (~250MB) when first used; ensure deployment host allows this.
- NSE option-chain scraping may be blocked; prefer paid APIs for production.
- For production, replace dev OTP with Twilio and set DEV_MODE=false.
