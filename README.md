# 🚀 Hackathon Autonomous AI Platform
### Built with Google Gemma, Hermes Agent Harness & the SKILL.md Open Standard

[![GitHub Repo](https://img.shields.io/badge/GitHub-hackathon--repo-181717?logo=github)](https://github.com/Abhishekdabi33/hackathon-repo)
[![Google Gemma](https://img.shields.io/badge/Model-Google_Gemma-4285F4?logo=google)](https://ai.google.dev/gemma)
[![Hermes Agent](https://img.shields.io/badge/Harness-Hermes_Autonomous_Agent-8A2BE2)](https://hermes-agent.nousresearch.com/)
[![Agent Skills](https://img.shields.io/badge/Standard-SKILL.md_Open_Standard-FF6F00)](https://agentskills.io/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react)](https://react.dev/)

> **A production-ready full-stack AI platform built for the hackathon.**  
> Solves the context-bloat and GPU bottleneck problems by combining **Google Gemma open-weight models**, an autonomous **Hermes Agent ReAct harness**, and modular **Agent Skills (`SKILL.md`)** with progressive disclosure.

---

## 👥 Official Team Pods & Engineering Squads

We are working in two focused, cross-functional engineering pairs:

### 🎨 Pod 1: Frontend Engineering & UI/UX
| Collaborators | Role | Git Branch | Working Directory |
| :--- | :--- | :--- | :--- |
| **[@vedxnt-b](https://github.com/vedxnt-b)** & **[@piyushmatodepatil](https://github.com/piyushmatodepatil)** | **Frontend & UI/UX Leads** | `feature/frontend` | [`frontend/`](frontend/) |

**What to Do & Key Deliverables:**
- Build and polish the **React 19 + Tailwind CSS** interactive web dashboard.
- Create real-time **agent reasoning trace cards** (`Thought ➔ Action ➔ Observation`).
- Build an interactive **SKILL.md visual inspector** showing raw YAML metadata and operational markdown.
- Wire frontend HTTP calls to backend REST routes (`/api/agent/chat`, `/api/skills`, `/api/health`).
- Deliver responsive dark-mode styling, clean animations, and a demo-ready presentation.

---

### ⚙️ Pod 2: Backend Architecture & AI Engine
| Collaborators | Role | Git Branch | Working Directory |
| :--- | :--- | :--- | :--- |
| **[@gunwantjawle-ux](https://github.com/gunwantjawle-ux)** & **[@Abhishekdabi33](https://github.com/Abhishekdabi33)** | **Backend Systems & AI Leads** | `feature/backend-ai` | [`backend/`](backend/), [`ai_engine/`](ai_engine/), [`agent_harness/`](agent_harness/), [`skills/`](skills/) |

**What to Do & Key Deliverables:**
- Maintain high-performance **FastAPI server routing**, schemas with Pydantic, CORS, and error handling.
- Expand the **Hermes Agent ReAct harness** (`agent_harness/hermes_agent.py`) with custom tool calling.
- Manage **Google Gemma model integration** via official `google-genai` SDK and Kaggle 2x Tesla T4 GPUs (`CLOUD_GPU_URL`).
- Author domain-specific **`SKILL.md` operational playbooks** in `skills/` following the Agent Skill open standard.
- Coordinate GitHub code merges, write pitch documentation, and record a 3-minute demo video.

---

## 🔗 How Teammates Connect to This Repository (Step-by-Step)

### 1. Authenticate with GitHub
Ensure you have authenticated Git with your GitHub account:
```bash
# Verify authentication
gh auth status

# If not authenticated, login with your GitHub handle:
gh auth login
```

### 2. Configure Your Git Identity
Set your local git name to match your GitHub handle:
```bash
git config --global user.name "your-github-username"
git config --global user.email "your-email@example.com"
```

### 3. Clone the Project
```bash
git clone https://github.com/Abhishekdabi33/hackathon-repo.git
cd hackathon-repo
```

### 4. Create & Work on Your Assigned Pod Branch
**Never commit directly to `main`!** Everyone works on their assigned pod branch:
```bash
# For Frontend Squad (@vedxnt-b & @piyushmatodepatil):
git checkout -b feature/frontend

# For Backend & AI Engine Squad (@gunwantjawle-ux & @Abhishekdabi33):
git checkout -b feature/backend-ai
```

### 5. Push Your Work & Open a Pull Request
```bash
git add .
git commit -m "feat(scope): describe what you built"
git push -u origin <your-branch-name>
```
Go to [GitHub Pull Requests](https://github.com/Abhishekdabi33/hackathon-repo/pulls) and open a PR into `main`. The team lead reviews and merges cleanly!

---

## 🧩 How the System Components Connect to Each Other

```
┌────────────────────────────────────────────────────────────────────────┐
│             React 19 Frontend (@vedxnt-b & @piyushmatodepatil)         │
│         Vite dev server running on http://localhost:5173               │
│         Proxies all API calls through /api                             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             FastAPI Backend (@gunwantjawle-ux & @Abhishekdabi33)       │
│         Uvicorn server running on http://localhost:8000                │
│         API Docs available at http://localhost:8000/docs               │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│  Hermes Agent Harness                │  │  Agent Skills Engine         │
│  Autonomous ReAct Loop               │◄─┤  SKILL.md Open Standard      │
│  (Thought ➔ Tool ➔ Observation)      │  │  (Progressive Disclosure)    │
└──────────────────┬───────────────────┘  └──────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Model Inference Layer (@vedxnt-b)                    │
│  Option A: Google AI Studio API (Free Gemma / Gemini, 0 GPU needed)   │
│  Option B: Kaggle Cloud 2x Tesla T4 GPUs (32GB VRAM via ngrok tunnel) │
│  Option C: Local CUDA acceleration (PyTorch 2.6.0+cu124)               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Quickstart Guide

### 1. Set Up Python Virtual Environment
```bash
# Using ultra-fast uv (or standard python -m venv)
uv venv --python 3.12 .venv
.\.venv\Scripts\activate      # Windows PowerShell
# source .venv/bin/activate   # Mac / Linux

# Install backend & AI dependencies
uv pip install -r backend/requirements.txt
uv pip install google-genai pyyaml torch torchvision --index-url https://download.pytorch.org/whl/cu124
```

### 2. Set Up Frontend
```bash
cd frontend
pnpm install     # or npm install
cd ..
```

### 3. Configure Keys (`.env`)
Copy the environment template:
```bash
cp .env.example .env
```
Add your free Google AI Studio key:
```env
GEMINI_API_KEY=your_free_google_ai_studio_key
```

### 4. One-Click Launch (Windows)
```powershell
.\run_dev.ps1
```
- **Web App UI**: [http://localhost:5173](http://localhost:5173)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Discovered Skills API**: [http://localhost:8000/api/skills](http://localhost:8000/api/skills)
- **System Health & GPU Telemetry**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## ☁️ No High-End GPU? Use Kaggle Free 2x Tesla T4 GPUs (32 GB VRAM)

Your team does **not** need expensive local hardware. We included a ready-to-run notebook:
📂 **[`notebooks/kaggle_gemma_gpu_runner.ipynb`](notebooks/kaggle_gemma_gpu_runner.ipynb)**

1. Go to [kaggle.com/code](https://www.kaggle.com/code) ➔ **New Notebook** ➔ **File ➔ Upload Notebook**.
2. Select `kaggle_gemma_gpu_runner.ipynb`.
3. Under **Settings**, select **Accelerator: GPU T4 x2** (30 free hours/week).
4. Run the notebook to fine-tune Gemma or serve inference through an `ngrok` tunnel directly to your local web app!

---

## 📁 Repository Directory Structure

```
hackathon-repo/
├── agent_harness/                # Autonomous Agent Framework
│   ├── hermes_agent.py           # ReAct loop, tool calling, execution traces
│   └── __init__.py
├── skills/                       # Agent Skills Open Standard
│   ├── data-analyst/SKILL.md     # Statistical & EDA analysis playbook
│   ├── api-integrator/SKILL.md   # API payload formatting & SDK generation
│   └── research-assistant/SKILL.md# Documentation synthesis playbook
├── skills_engine/                # Progressive Disclosure Engine
│   └── skill_loader.py           # YAML frontmatter indexer & markdown loader
├── ai_engine/                    # Model Integration & Training
│   ├── gemma_client.py           # Google Gemma / Cloud GPU inference client
│   ├── model.py                  # PyTorch neural architecture
│   ├── train.py                  # Local GPU training test script
│   └── inference.py              # Lightweight inference wrapper
├── notebooks/                    # Cloud GPU Acceleration
│   └── kaggle_gemma_gpu_runner.ipynb # 1-Click Kaggle 2x T4 GPU notebook
├── frontend/                     # Modern Web Application
│   ├── src/App.jsx               # Agent console, SKILL.md explorer, team tab
│   ├── package.json              # React 19 + Tailwind dependencies
│   └── vite.config.js            # API proxy configuration
├── backend/                      # Production REST API
│   ├── app/main.py               # FastAPI endpoints for Agent & Skills
│   └── requirements.txt          # Backend dependencies
├── TEAM_WORKFLOW.md              # 4-Person team strategy & rules
├── run_dev.ps1                   # One-click Windows dev launcher
├── .env.example                  # Environment configuration template
└── .gitignore                    # Protects secrets & large model weights
```

---

## 🏆 Hackathon Winning Strategy Checklist

- [x] **Code Authentication & Repo Leadership**: Connected to GitHub as project owner [@Abhishekdabi33](https://github.com/Abhishekdabi33).
- [x] **Clean 4-Way Role Division**: Clear branch ownership with zero collision.
- [x] **Track Requirements Met**: Official Google Gemma SDK, Hermes Agent loop, and Agent Skills `SKILL.md` standard implemented.
- [x] **Live Interactive Demo**: Real-time agent console showing thoughts, tool calls, and answers.
- [x] **Low-Hardware Resilience**: Google AI Studio API fallback + Kaggle 2x T4 GPU cloud notebook.
- [ ] **Pitch Presentation**: Prepare 5-slide deck + 3-minute pre-recorded backup video.

---

## 📄 License
MIT License - Created for Hackathon 2026.
