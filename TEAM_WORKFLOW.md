# 🏆 4-Person Hackathon Team Playbook & Strategy

Welcome team! This playbook is designed to help our 4-person team move with maximum speed, prevent merge conflicts, deliver a polished full-stack AI project, and score maximum points with hackathon judges.

---

## 👥 1. Role Division & Ownership

| Member / GitHub Handle | Primary Role | Core Responsibilities | Working Directory / Git Branch |
| :--- | :--- | :--- | :--- |
| **@gunwantjawle-ux** | **Frontend & UI/UX Lead** | React 19 UI, Tailwind styling, Agent reasoning trace visuals, SKILL.md explorer, responsive layout | `frontend/` on `feature/frontend` |
| **@sarthakchambhare16-wdym** | **Backend & API Systems Lead** | FastAPI endpoints, data models, error handling, CORS, session state, server deployment | `backend/` on `feature/backend` |
| **@vedxnt-b** | **AI Engine & Agent Skills Lead** | Hermes Agent tools, Gemma API client tuning, authoring new `SKILL.md` files, model inference | `agent_harness/`, `skills/`, `ai_engine/` on `feature/ai-agent` |
| **@Abhishekdabi33** | **Team Lead, Architecture & Pitch Demo** | System architecture integration, GitHub management, pitch deck, 3-min demo video, judge alignment | `README.md`, `docs/` on `feature/pitch-demo` |

---

## 🌿 2. Git Branching & Collaboration Rules

### The Golden Rules:
1. **Never commit directly to `main`!**
   - `main` is always production-ready and demo-ready.
   - All development happens on feature branches:
     - `git checkout -b feature/frontend`
     - `git checkout -b feature/backend`
     - `git checkout -b feature/ai-model`
     - `git checkout -b feature/pitch-demo`
2. **Never commit model weights or dataset dumps to Git!**
   - Checkpoints (`*.pt`, `*.bin`, `*.safetensors`) and datasets (`*.csv`, `*.parquet`) are in `.gitignore`.
   - Store large assets in Google Drive or Hugging Face Hub and link them in README.
3. **Pull often, rebase or merge cleanly**:
   ```bash
   git pull origin main --rebase
   ```
4. **Use PRs with our Checklist**:
   - Every feature branch merges into `main` via a GitHub Pull Request so GitHub Actions CI automatically verifies that nothing is broken.

---

## ⏰ 3. 24-Hour / 36-Hour Hackathon Timeline

```
[Phase 1: Hours 0-4]   -> Architecture freeze, API schema agreed, boilerplate running.
[Phase 2: Hours 4-16]  -> Parallel build: Frontend UI, Backend API, Model training.
[Phase 3: Hours 16-20] -> Integration: Frontend connects to Backend + AI Engine.
[Phase 4: Hours 20-28] -> Feature lock! Polish UX, error edge cases, demo data.
[Phase 5: Hours 28-end]-> Pitch deck finalized, demo video recorded (NEVER risk live wifi failure!).
```

---

## 💻 4. Local Development Quickstart

### Prerequisites
- Python 3.12 (via `uv`)
- Node.js 20+ & `pnpm`
- Git

### Launch Everything:
In PowerShell:
```powershell
.\run_dev.ps1
```
Or manually:
- Backend: `uvicorn backend.app.main:app --reload --port 8000`
- Frontend: `cd frontend && pnpm run dev`

---

## 🎯 5. How to Win Hackathon Judging Criteria

1. **Innovation & Problem Fit (25%)**: State the specific problem in the first 20 seconds of your pitch.
2. **Technical Execution (25%)**: Real model inference, GPU acceleration, clean architecture, responsive UI.
3. **Business & Impact Potential (25%)**: Who pays for this? What is the ROI or time saved?
4. **Demo & Delivery (25%)**:
   - Have a pre-recorded backup demo video in case Wi-Fi fails!
   - Show a working product, not just slides.
