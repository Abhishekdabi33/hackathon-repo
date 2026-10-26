# 🚀 LabLens AI — Production Deployment Guide

LabLens AI is architected for frictionless, one-click deployments across **Render**, **Vercel**, **Docker / Docker Compose**, and **Google Cloud Run**.

---

## 🌟 Quick Options Overview

| Platform | Frontend | Backend | Setup Effort | Recommended For |
|:---|:---|:---|:---|:---|
| **Render Blueprint** | Static Site | Web Service (FastAPI) | 1-Click (`render.yaml`) | **Full-Stack Hackathon / Live Demo** |
| **Vercel + Render** | Vercel (Edge SPA) | Render Web Service | 2 Minutes | Highest Frontend Global CDN Speed |
| **Docker Compose** | Nginx Container | Python 3.12 Container | 1 Command (`docker compose up`) | Local Production Testing / Self-Hosting |
| **Google Cloud Run** | Firebase / Cloud Run | Containerized FastAPI | 5 Minutes | Enterprise GCP Scalability |

---

## Option 1: Render One-Click Full Stack (Recommended)

The repository includes a root `render.yaml` blueprint defining:
1. `lablens-ai-backend` (FastAPI + Python 3.12, Uvicorn, Gemma 4 Client, EvidenceTrace Engine)
2. `lablens-ai-frontend` (React + Vite + Tailwind, static CDN hosting, automated routing rewrites)

### Steps to Deploy:
1. Push this repository to GitHub.
2. Go to [dashboard.render.com](https://dashboard.render.com) and click **New > Blueprint**.
3. Select your repository (`hackathon-repo`).
4. Render automatically parses `render.yaml` and spins up both services.
5. In the Environment Variables settings for `lablens-ai-backend`:
   - `GEMINI_API_KEY`: *(Optional)* Your Google GenAI API key for Gemini 2.5 Flash / Gemma 2 9B fallback.
   - `CLOUD_GPU_URL`: `https://proxy-service-editor.ngrok-free.dev` (Or your active Kaggle/Colab Gemma 4 12B Ollama tunnel).

---

## Option 2: Frontend on Vercel + Backend on Render / Railway

### 1. Deploy Backend (Render / Railway / Cloud Run)
- Build Command: `pip install -r backend/requirements.txt`
- Start Command: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
- Env Vars: `CLOUD_GPU_URL`, `GEMINI_API_KEY`
- Copy your deployed backend URL: `https://your-backend.onrender.com`

### 2. Deploy Frontend on Vercel
1. Import repository on [vercel.com](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend.onrender.com`
4. Click **Deploy**. Vercel will build the frontend with `pnpm run build` and route all API calls cleanly.

---

## Option 3: Docker & Docker Compose (Containerized)

The repository provides a root `Dockerfile` (Backend), `frontend/Dockerfile` (Multi-stage Vite + Nginx), and `docker-compose.yml`.

### One-Command Launch:
```bash
docker compose up --build
```

- Frontend UI: `http://localhost:3000`
- FastAPI Backend: `http://localhost:8000`
- Interactive API Docs: `http://localhost:8000/docs`

---

## Option 4: Local Production Run

```powershell
# 1. Start Backend
.venv\Scripts\python.exe -u scripts/run_backend.py

# 2. Start Frontend
pnpm --dir frontend run dev
```

Visit `http://localhost:5173` in your browser.
