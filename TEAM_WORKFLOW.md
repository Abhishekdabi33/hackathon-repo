# 🏆 4-Person Hackathon Team Playbook & Strategy

Welcome team! This playbook is designed to help our 4-person team move with maximum speed, prevent merge conflicts, deliver a polished full-stack AI project, and score maximum points with hackathon judges.

---

## 👥 1. Role Division & 2-Person Squads

We are working in two focused, cross-functional engineering pairs:

### 🎨 Pod 1: Frontend Engineering & UI/UX
- **Team Members**: **@vedxnt-b** (Frontend Lead) & **@piyushmatodepatil** (UI/UX & Components Lead)
- **Primary Directory**: `frontend/`
- **Git Branch**: `feature/frontend`
- **Responsibilities & What to Do**:
  1. **UI Components & Layout**: Build and polish the React 19 + Tailwind CSS interactive dashboard.
  2. **Agent Reasoning Traces**: Create real-time step cards visualizing Hermes Agent thoughts, tool calls, and observations.
  3. **SKILL.md Explorer**: Build an intuitive drawer/viewer to let judges inspect the raw YAML frontmatter and operational markdown instructions of any loaded skill.
  4. **API Integration**: Connect frontend state to backend REST routes (`/api/agent/chat`, `/api/skills`, `/api/health`).
  5. **Demo Polish & Responsiveness**: Ensure instant loading, mobile/desktop responsiveness, and clean dark-mode presentation.

---

### ⚙️ Pod 2: Backend Architecture & AI Engine
- **Team Members**: **@gunwantjawle-ux** (Backend Systems Lead) & **@Abhishekdabi33** (AI Engine & Project Lead)
- **Primary Directories**: `backend/`, `ai_engine/`, `agent_harness/`, `skills/`, `notebooks/`
- **Git Branch**: `feature/backend-ai`
- **Responsibilities & What to Do**:
  1. **FastAPI Endpoints & Routing**: Maintain high-speed endpoints with Pydantic schemas, error handling, and CORS.
  2. **Hermes Agent Loop**: Implement and expand autonomous tool-use in `agent_harness/hermes_agent.py` (Thought ➔ Action ➔ Observation).
  3. **Google Gemma & Cloud GPU Integration**: Wire `GemmaClient` to Google AI Studio API and connect to Kaggle 2x Tesla T4 GPUs via `CLOUD_GPU_URL`.
  4. **Authoring Domain SKILL.md Playbooks**: Create new operational skills in `skills/` using the Agent Skill open standard.
  5. **Project Leadership & Pitch Demo**: Coordinate repo merges, write pitch slides, and record a 3-minute demo video.

---

## 🌿 2. Git Branching & Collaboration Rules

### The Golden Rules:
1. **Never commit directly to `main`!**
   - `main` is always production-ready and demo-ready.
   - All development happens on feature branches:
     - `git checkout -b feature/frontend` (Vedant & Piyush)
     - `git checkout -b feature/backend-ai` (Gunwant & Abhishek)
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
