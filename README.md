# 🚀 Hackathon Project

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

> Built for the hackathon by a 4-person team. Designed with a modular architecture for seamless collaboration without git conflicts.

---

## 👥 Team Roles & Responsibilities

| Member | Role | Primary Focus Area | Branch Namespace |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Tech Lead & Integration** | System Architecture, Full-stack bridging, DevOps | `feat/lead-*` |
| **Member 2** | **Frontend Engineer** | UI/UX, Component Library, State Management | `feat/frontend-*` |
| **Member 3** | **Backend Engineer** | REST API, Database/Cache, Auth, Data Validation | `feat/backend-*` |
| **Member 4** | **AI / ML Specialist & Docs**| Model Training/Fine-Tuning, Inference API, Pitch Deck | `feat/ai-*` |

---

## 📂 Repository Architecture

```
hackathon-repo/
├── frontend/               # React + Vite + Tailwind CSS dashboard
│   ├── src/
│   │   ├── components/     # UI components (Chat, Metrics, Controls)
│   │   ├── services/       # Axios/Fetch API client
│   │   └── App.jsx         # Main application dashboard
│   └── package.json
├── backend/                # FastAPI high-performance backend
│   ├── app/
│   │   ├── api/            # API route controllers
│   │   ├── core/           # Config, environment, security
│   │   ├── services/       # AI service bridge & business logic
│   │   └── main.py         # Application entry point & CORS
│   └── requirements.txt
├── ai_ml/                  # Machine Learning & AI Pipeline
│   ├── train_lora.py       # 4GB GPU optimized LoRA fine-tuning script
│   ├── inference.py        # Local Ollama / HF model runner + API fallback
│   ├── colab_notebook.ipynb# Google Colab notebook for free T4 cloud training
│   └── requirements.txt
├── docs/                   # Hackathon survival documentation
│   ├── TEAM_WORKFLOW.md    # Git branching rules & conflict prevention
│   ├── ARCHITECTURE.md     # System design & data flow
│   ├── PITCH_DECK_GUIDE.md # 3-minute pitch structure & judging rubrics
│   └── API_CONTRACT.md     # OpenAPI / REST contract
├── .github/workflows/      # Automated CI workflow
├── docker-compose.yml      # 1-command containerized stack
├── setup_workspace.bat     # Windows 1-click bootstrap
└── setup_workspace.ps1     # PowerShell 1-click bootstrap
```

---

## ⚡ Quickstart Guide

### 1. Clone & Setup Workspace
```bash
git clone https://github.com/Abhishekdabi33/hackathon-repo.git
cd hackathon-repo

# Run automatic bootstrap script (installs all dependencies)
.\setup_workspace.bat
# Or on PowerShell:
.\setup_workspace.ps1
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with any optional API keys
```

### 3. Launch Development Servers

**Backend (Terminal 1):**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```
- Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)

---

## 🤖 AI / Model Training (NVIDIA GPU Accelerated)

- **Local GPU Training**: Tested on NVIDIA RTX 2050 (4GB VRAM) using 4-bit LoRA:
  ```bash
  cd ai_ml
  python train_lora.py --model_name "unsloth/Llama-3.2-1B-Instruct" --epochs 3
  ```
- **Cloud GPU Training (Colab)**: Open `ai_ml/colab_notebook.ipynb` in Google Colab for free 15GB T4 GPU training, then drop the exported adapter weights into `ai_ml/checkpoints/`.
- **Local Inference**:
  ```bash
  python ai_ml/inference.py --prompt "Explain quantum computing in simple terms."
  ```

---

## 🏆 Hackathon Submission Checklist

- [ ] Working MVP deployed and accessible via URL or local demo
- [ ] 3-minute pitch deck completed (see `docs/PITCH_DECK_GUIDE.md`)
- [ ] 2-minute demo video recorded
- [ ] README updated with live demo link and screenshots
- [ ] Code formatted and tested via CI
