# 🚀 Hackathon Project

[![CI Pipeline](https://github.com/Abhishekdabi33/hackathon-repo/actions/workflows/ci.yml/badge.svg)](https://github.com/Abhishekdabi33/hackathon-repo/actions)
![Python 3.12](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![PyTorch CUDA](https://img.shields.io/badge/AI-PyTorch_CUDA-EE4C2C?logo=pytorch)
![React 19](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react)
![TailwindCSS](https://img.shields.io/badge/Style-Tailwind_CSS-38B2AC?logo=tailwindcss)

> **High-Performance Full-Stack AI Platform built for Hackathons.**  
> Features real-time GPU inference, modular FastAPI backend, modern React frontend, and reproducible cloud/local training pipelines.

---

## 🏗️ System Architecture

```
hackathon-repo/
├── .github/                      # CI/CD and Pull Request Templates
│   ├── workflows/ci.yml          # Automated syntax and build verification
│   └── pull_request_template.md  # Standardized PR checklist
├── frontend/                     # Modern Web Application
│   ├── src/                      # React 19 + Tailwind + Lucide Components
│   ├── package.json              # Fast pnpm dependencies
│   └── vite.config.js            # API proxy configuration
├── backend/                      # Production-Ready REST API
│   ├── app/main.py               # FastAPI application, CORS, Telemetry
│   └── requirements.txt          # Lightweight backend dependencies
├── ai_engine/                    # Deep Learning & AI Pipeline
│   ├── model.py                  # PyTorch neural architecture
│   ├── train.py                  # Training pipeline with GPU telemetry
│   ├── inference.py              # Low-latency inference wrapper
│   └── train_colab_cloud.py      # Cloud GPU scaling guide (Colab/Kaggle)
├── TEAM_WORKFLOW.md              # 4-Person team playbook and branch rules
├── run_dev.ps1                   # One-click Windows development launcher
├── .env.example                  # Environment configuration template
└── .gitignore                    # Prevents leaking model weights & secrets
```

---

## ⚡ Quickstart Guide

### 1. Clone & Set Up Environment
```bash
git clone https://github.com/Abhishekdabi33/hackathon-repo.git
cd hackathon-repo

# Create Python environment using ultra-fast uv
uv venv --python 3.12 .venv
.\.venv\Scripts\activate

# Install backend dependencies
uv pip install -r backend/requirements.txt
```

### 2. Install Frontend Dependencies
```bash
cd frontend
pnpm install
cd ..
```

### 3. Launch Development Stack
Run the one-click launcher:
```powershell
.\run_dev.ps1
```
- **Web Application UI**: [http://localhost:5173](http://localhost:5173)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Hardware & GPU Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 🤖 AI Model Training & Inference

### Local Training (GPU / CPU)
Train the model locally:
```bash
python ai_engine/train.py --epochs 10 --batch_size 32
```
Checkpoints will be saved automatically to `ai_engine/checkpoints/best_model.pt`.

### Local Inference Test
```bash
python ai_engine/inference.py
```

### Cloud Scaling (Google Colab / Kaggle T4 & A100 GPUs)
For large open-source LLMs (Llama 3 8B, Mistral 7B) that exceed local 4GB VRAM:
Refer to `ai_engine/train_colab_cloud.py` for 4-bit QLoRA configuration.

---

## 👥 4-Person Team Distribution

- **Lead 1 (Frontend)**: React, UX/UI, Component Design, API Wiring
- **Lead 2 (Backend)**: FastAPI, Schemas, Database, Error Handling, Deployment
- **Lead 3 (AI / ML)**: Model architecture, data preprocessing, fine-tuning, latency
- **Lead 4 (Product & Pitch)**: Problem definition, slides, 3-min demo video, QA

---

## 📄 License
MIT License - Developed for Hackathon 2026.
