# 🔬 LabLens AI
### AI-Powered Medical Report Understanding & Clinical Review Assistant
**Powered by Google Gemma 4 12B, EvidenceTrace™ Deterministic Validation, and the SKILL.md Open Standard**

[![Google Gemma 4 12B](https://img.shields.io/badge/Model-Google_Gemma_4_12B-4285F4?logo=google)](https://ai.google.dev/gemma)
[![Hardware](https://img.shields.io/badge/Hardware-Kaggle_Dual_Tesla_T4_(32GB_VRAM)-20BEFF?logo=kaggle)](https://kaggle.com/)
[![EvidenceTrace](https://img.shields.io/badge/Validation-EvidenceTrace™_0ms_Deterministic-10B981)](#-the-evidencetrace-architecture)
[![Agent Skills](https://img.shields.io/badge/Standard-SKILL.md_Open_Standard-FF6F00)](https://agentskills.io/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Hackathon 2026 Deliverable**  
> Every day, millions of patients receive complex diagnostic reports (CBC, Lipid Panels, Metabolic Profiles, Prescriptions) filled with cryptic abbreviations and reference ranges. Generic LLMs hallucinate numbers and offer dangerous ungrounded medical advice.  
> **LabLens AI** bridges the communication gap between pathology labs and patients by pairing **Google Gemma 4 12B** running on cloud dual GPUs with an uncompromising, zero-hallucination **Deterministic Python Validation Engine (EvidenceTrace™)**.

---

## 🌟 Core Pillars

1. **Understand (Plain-Language Demystification)**:  
   Translates intimidating pathology findings, metabolic panels, and clinical prescriptions into compassionate, easily understandable language.
2. **Verify (EvidenceTrace™ Zero-Hallucination Engine)**:  
   A deterministic Python validation layer extracts every test measurement with word-boundary regex, cross-references it against 18 certified clinical reference standards, and flags abnormal values (`LOW`, `HIGH`, `CRITICAL`) with 0ms latency. The LLM is strictly constrained by this ground truth.
3. **Ask Better Questions (Physician Prep Checklist)**:  
   Rather than attempting autonomous medical diagnoses, LabLens AI arms the patient with prioritized, high-yield questions for their next doctor's appointment.
4. **Export Medical Brief (Printable Hospital Summary)**:  
   One-click generation of a clean, structured clinical summary ready to print (`window.print()`) or share with treating physicians.

---

## 👥 Hackathon Pods & Engineering Squads

We operate in two focused, cross-functional engineering pairs:

### 🎨 Pod 1: Frontend Engineering & UI/UX
| Collaborators | Role | Git Branch | Working Directory |
| :--- | :--- | :--- | :--- |
| **[@vedxnt-b](https://github.com/vedxnt-b)** & **[@piyushmatodepatil](https://github.com/piyushmatodepatil)** | **Frontend & UI/UX Leads** | `feature/frontend` | [`frontend/`](frontend/) |

- Interactive React 19 dashboard with responsive dark-mode styling.
- Real-time agent reasoning trace cards (`Thought ➔ Action ➔ Observation`).
- Live EvidenceTrace™ test validation table with color-coded status badges.
- One-click sample report selector and printable medical brief exporter.

---

### ⚙️ Pod 2: Backend Architecture & AI Engine
| Collaborators | Role | Git Branch | Working Directory |
| :--- | :--- | :--- | :--- |
| **[@Abhishekdabi33](https://github.com/Abhishekdabi33)** (Team Lead) & **[@gunwantjawle-ux](https://github.com/gunwantjawle-ux)** | **Backend Systems & AI Leads** | `feature/backend-ai` | [`backend/`](backend/), [`ai_engine/`](ai_engine/), [`agent_harness/`](agent_harness/), [`skills/`](skills/) |

- High-performance FastAPI server with Pydantic validation and CORS.
- Cloud GPU orchestration hosting **Google Gemma 4 12B** (`lablens-clinical`) on Kaggle dual Tesla T4 GPUs via permanent ngrok tunnel.
- Deterministic Clinical Validation Engine (`clinical_engine.py`) with 18 core lab test standards.
- Domain-specific open standard skill: [`skills/clinical-report-analyst/SKILL.md`](skills/clinical-report-analyst/SKILL.md).

---

## 🧩 System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│             React 19 Frontend (@vedxnt-b & @piyushmatodepatil)         │
│         Vite dev server running on http://localhost:5173               │
│    Interactive Medical Console • EvidenceTrace Cards • Sample Loader   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             FastAPI Backend (@Abhishekdabi33 & @gunwantjawle-ux)       │
│         Uvicorn server running on http://localhost:8000                │
└───────────┬───────────────────────┬───────────────────────┬────────────┘
            │                       │                       │
            ▼                       ▼                       ▼
┌───────────────────────┐ ┌───────────────────┐ ┌────────────────────────┐
│  EvidenceTrace™       │ │ Hermes ReAct      │ │ Agent Skills Engine    │
│  Deterministic Engine │ │ Autonomous Agent  │ │ SKILL.md Standard      │
│  - 0ms Latency        │ │ - Multi-step loop │ │ - Progressive          │
│  - Regex & Range Spec │ │ - Tool execution  │ │   disclosure           │
│  - Strict Lab Ranges  │ │ - Trace capture   │ │ - Clinical playbooks   │
└───────────┬───────────┘ └─────────┬─────────┘ └────────────────────────┘
            │                       │
            └───────────┬───────────┘
                        │
                        ▼ (Open-Weight Model Inference)
┌────────────────────────────────────────────────────────────────────────┐
│        Google Gemma 4 12B Cloud GPU Cluster (Kaggle Dual Tesla T4)     │
│   • Model: lablens-clinical (Gemma 4 12B compiled with Modelfile)      │
│   • Hardware: 2x Tesla T4 GPUs (32GB VRAM total)                       │
│   • Throughput: ~25.5 tokens/second                                    │
│   • Live Ngrok Tunnel: https://proxy-service-editor.ngrok-free.dev      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔬 The EvidenceTrace™ Architecture

To eliminate medical hallucinations, **LabLens AI enforces a strict two-stage pipeline**:

```
[ Medical Report / CSV / Image ]
               │
               ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Stage 1: Deterministic Python Validation (0ms, 100% Deterministic)     │
│  - Extracts exact numerical values and units with boundary regex       │
│  - Compares with certified medical ranges (e.g., HbA1c: 4.0 - 5.6%)    │
│  - Flags status: NORMAL | LOW | HIGH | CRITICAL                        │
│  - Binds findings directly to raw report excerpt snippets              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Stage 2: Gemma 4 12B Autonomous Clinical Reasoning                     │
│  - Gemma receives the validated EvidenceTrace table as hard ground     │
│    truth context.                                                      │
│  - Generates compassionate, plain-language patient summaries.          │
│  - Compiles prioritized questions for the patient's next doctor visit. │
│  - Strictly prohibited from making ungrounded diagnostic claims.       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health check and model engine telemetry |
| `GET` | `/api/clinical/standards` | Returns the 18 certified medical lab standards and ranges |
| `GET` | `/api/clinical/samples` | Lists pre-loaded medical report samples for 1-click testing |
| `POST` | `/api/clinical/validate` | Instant 0ms deterministic extraction and range validation |
| `POST` | `/api/clinical/analyze` | Full end-to-end analysis (EvidenceTrace + Gemma 4 12B) |
| `POST` | `/api/clinical/ask` | Grounded Q&A against validated report excerpts |
| `POST` | `/api/clinical/export-summary` | Generates printable hospital HTML and markdown briefs |
| `POST` | `/api/upload` | Ingestion for PDF (pure Python zlib), CSV, TXT, and Images |
| `GET` | `/api/skills` | Discovers open-standard skills in `skills/` |
| `GET` | `/api/skills/{name}` | Returns full `SKILL.md` content via progressive disclosure |

---

## 📂 Pre-Loaded Medical Sample Datasets

Located in `data/sample_reports/` for instant evaluation:
- **`sample_blood_report.txt`**: Complete Blood Count (CBC) + Fasting Sugar + HbA1c + Vit D3 panel.
- **`sample_lipid_panel.csv`**: Comprehensive cardiovascular lipid profile (Cholesterol, HDL, LDL, Triglycerides).
- **`sample_thyroid_panel.txt`**: Endocrinology screen (TSH, T3, T4, Metabolic profile).
- **`sample_prescription.txt`**: Real outpatient prescription slip with dosing instructions.

---

## ⚡ Quickstart Guide

### 1. Set Up Python Environment
```bash
# Using uv (recommended) or standard venv
uv venv --python 3.12 .venv
.\.venv\Scripts\activate      # Windows PowerShell
# source .venv/bin/activate   # Mac / Linux

# Install backend dependencies
uv pip install -r backend/requirements.txt
```

### 2. Configure Environment (`.env`)
Create `.env` in the root directory:
```env
# Cloud GPU Gemma 4 12B ngrok tunnel URL
CLOUD_GPU_URL=https://proxy-service-editor.ngrok-free.dev

# (Optional fallback) Google AI Studio API key
GEMINI_API_KEY=your_key_here
```

### 3. Launch Development Servers

**Backend:**
```bash
python scripts/run_backend.py
# Running on http://localhost:8000 (Swagger docs at /docs)
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

---

## ☁️ Running Gemma 4 12B on Kaggle Dual Tesla T4 GPUs

1. Open [Kaggle Notebooks](https://www.kaggle.com/code) and click **New Notebook**.
2. Upload [`notebooks/kaggle_gemma_gpu_runner.ipynb`](notebooks/kaggle_gemma_gpu_runner.ipynb).
3. Under **Notebook Options ➔ Accelerator**, choose **GPU T4 x2**.
4. Run all 7 cells in sequence:
   - Cell 1: Verifies dual Tesla T4 GPUs (29.1 GB VRAM available).
   - Cell 2: Installs `zstd` and Ollama `0.40.11`.
   - Cell 3: Starts the background Ollama daemon via Python `subprocess.Popen`.
   - Cell 4: Pulls official Google **Gemma 4 12B** (`gemma4:12b`, 8.0 GB).
   - Cell 5: Compiles custom **`lablens-clinical`** model with clinical guardrails.
   - Cell 6: Runs inference benchmark (~25.5 tokens/sec).
   - Cell 7: Starts ngrok tunnel exposing port 11434 with public HTTPS URL.
5. Paste your ngrok public URL into `.env` as `CLOUD_GPU_URL`.

---

## ⚖️ Clinical & Ethical Disclaimer

> **IMPORTANT:** LabLens AI is an assistive technology designed to enhance health literacy and prepare patients for informed consultations with licensed medical professionals. It does **not** provide autonomous medical diagnoses, modify existing treatment regimens, or replace the clinical judgment of a physician. In case of a medical emergency, immediately contact local emergency services or your nearest healthcare facility.

---

## 📄 License
MIT License — Created with ❤️ for Hackathon 2026.
