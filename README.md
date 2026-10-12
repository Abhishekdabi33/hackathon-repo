# 🚀 Hackathon AI Platform: Gemma, Hermes Agent & Agent Skills

[![CI Pipeline](https://github.com/Abhishekdabi33/hackathon-repo/actions/workflows/ci.yml/badge.svg)](https://github.com/Abhishekdabi33/hackathon-repo/actions)
![Google Gemma](https://img.shields.io/badge/Model-Google_Gemma-4285F4?logo=google)
![Hermes Agent](https://img.shields.io/badge/Agent-Hermes_Harness-8A2BE2)
![Agent Skills](https://img.shields.io/badge/Standard-SKILL.md_Open_Standard-FF6F00)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![React 19](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react)
![PyTorch CUDA](https://img.shields.io/badge/CUDA-12.4_Accelerated-EE4C2C?logo=pytorch)

> **Autonomous Full-Stack AI Platform built for Hackathons.**  
> Powered by **Google Gemma models**, **Nous Research Hermes Agent harness**, and the **Agent Skill Open Standard (`SKILL.md`)** with progressive disclosure.

---

## 🎯 Tech Stack Alignment

| Track / Pillar | Technology | Implementation in This Repo |
| :--- | :--- | :--- |
| **Open-Weight Models** | **Google Gemma (Gemma 2 / Gemma 4)** | [`ai_engine/gemma_client.py`](ai_engine/gemma_client.py) using official `google-genai` SDK |
| **Agent Harness** | **Hermes Agent (Nous Research)** | [`agent_harness/hermes_agent.py`](agent_harness/hermes_agent.py) ReAct loop + persistent memory |
| **Agent Skills** | **SKILL.md Open Standard** | [`skills/`](skills/) + [`skills_engine/skill_loader.py`](skills_engine/skill_loader.py) with progressive disclosure |
| **Backend API** | **FastAPI + Uvicorn** | [`backend/app/main.py`](backend/app/main.py) with endpoints for Agent, Skills, and Gemma |
| **Frontend UI** | **React 19 + Tailwind + Lucide** | [`frontend/`](frontend/) with interactive reasoning trace console & SKILL.md explorer |

---

## 🏗️ Repository Architecture

```
hackathon-repo/
├── agent_harness/                # Autonomous Agent Framework
│   ├── hermes_agent.py           # ReAct loop, tool calling, memory traces
│   └── __init__.py
├── skills/                       # Agent Skills Open Standard
│   ├── data-analyst/SKILL.md     # Statistical analysis playbook
│   ├── api-integrator/SKILL.md   # API payload & endpoint generation
│   └── research-assistant/SKILL.md# Documentation synthesis
├── skills_engine/                # Progressive Disclosure Engine
│   └── skill_loader.py           # YAML frontmatter indexer & body loader
├── ai_engine/                    # Model Clients & Training
│   ├── gemma_client.py           # Google Gemma / Open-Weight LLM client
│   ├── model.py                  # PyTorch neural architecture
│   ├── train.py                  # GPU model training pipeline
│   ├── inference.py              # Low-latency inference wrapper
│   └── train_colab_cloud.py      # Cloud GPU scaling guide (Colab/Kaggle)
├── frontend/                     # Modern Web Application
│   ├── src/App.jsx               # Agent console & SKILL.md explorer
│   └── vite.config.js            # API proxy configuration
├── backend/                      # Production-Ready REST API
│   ├── app/main.py               # FastAPI endpoints for Agent & Skills
│   └── requirements.txt
├── TEAM_WORKFLOW.md              # 4-Person team playbook and branch rules
├── run_dev.ps1                   # One-click Windows development launcher
├── .env.example                  # Environment configuration template
└── .gitignore                    # Prevents leaking model weights & secrets
```

---

## ⚡ Quickstart Guide

### 1. Set Up Environment
```bash
git clone https://github.com/Abhishekdabi33/hackathon-repo.git
cd hackathon-repo

# Create Python environment
uv venv --python 3.12 .venv
.\.venv\Scripts\activate

# Install backend dependencies & Google GenAI SDK
uv pip install -r backend/requirements.txt
uv pip install google-genai pyyaml
```

### 2. Configure Environment Keys
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your `GEMINI_API_KEY` (from [Google AI Studio](https://aistudio.google.com/)) to enable live Google Gemma calls.

### 3. Launch Development Stack
Run the one-click launcher:
```powershell
.\run_dev.ps1
```
- **Web UI & Agent Console**: [http://localhost:5173](http://localhost:5173)
- **API Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Discovered Agent Skills**: [http://localhost:8000/api/skills](http://localhost:8000/api/skills)

---

## 👥 4-Person Team Distribution

- **Member 1 (Frontend Lead)**: React 19 UI, Agent reasoning visualization, SKILL.md inspector.
- **Member 2 (Backend Lead)**: FastAPI routing, Agent session persistence, API error handling.
- **Member 3 (AI / Agent Engineer)**: Gemma prompt tuning, Hermes tool definitions, new `SKILL.md` authoring.
- **Member 4 (Product & Pitch Lead)**: Problem statement, 3-minute demo video, judging criteria alignment.

---

## 📄 License
MIT License - Developed for Hackathon 2026.
