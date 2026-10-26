# 🩺 Samjho Health (LabLens AI)
### Multimodal Medical Report Understanding & Clinical Review Assistant
**Powered by Google Gemma 4 12B, EvidenceTrace™ Deterministic Validation, and the SKILL.md Open Standard**

[![Google Gemma 4 12B](https://img.shields.io/badge/Model-Google_Gemma_4_12B-4285F4?logo=google)](https://ai.google.dev/gemma)
[![Hardware](https://img.shields.io/badge/Hardware-Kaggle_Dual_Tesla_T4_(32GB_VRAM)-20BEFF?logo=kaggle)](https://kaggle.com/)
[![EvidenceTrace](https://img.shields.io/badge/Validation-EvidenceTrace™_0ms_Deterministic-10B981)](#-the-evidencetrace-architecture)
[![Agent Skills](https://img.shields.io/badge/Standard-SKILL.md_Open_Standard-FF6F00)](https://agentskills.io/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/Frontend-React_19_%2B_TanStack-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Apple_Healthcare_System-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Every day, millions of patients receive complex diagnostic reports (CBC, Lipid Panels, Thyroid Screens, Metabolic Profiles, Prescriptions) filled with cryptic abbreviations, numerical ranges, and intimidating clinical jargon. Standard LLMs hallucinate numbers, miscalculate reference intervals, and give ungrounded medical opinions.  
> **Samjho Health** bridges this communication gap by uniting **Google Gemma 4 12B** running on cloud dual GPUs with an uncompromising, zero-hallucination **Deterministic Python Validation Engine (EvidenceTrace™)**, an interactive **Voice Talk Agent (Hitho AI)**, and a clean, Apple-grade healthcare interface.

---

## 👥 Project Members

- **Abhishek Dabi** — [@Abhishekdabi33](https://github.com/Abhishekdabi33)
- **Vedant Bhavsar** — [@vedxnt-b](https://github.com/vedxnt-b)
- **Piyush Patil** — [@piyushmatodepatil](https://github.com/piyushmatodepatil)
- **Gunwant Jawle** — [@gunwantjawle-ux](https://github.com/gunwantjawle-ux)

---

## 🌟 Key Features & Capabilities

### 1. 📄 Multimodal Clinical Document Ingestion
- **Universal Format Support**: Ingests PDF laboratory reports (via PyMuPDF & RapidOCR), medical photography/scans (JPG, PNG, WEBP), clinical videos with keyframe extraction, CSV tables, and plain text files.
- **Dual-Mode Upload & Prompt Interface**: Users can either drop medical document files or directly paste raw report text and type custom health inquiries.

### 2. ⚡ EvidenceTrace™ Zero-Hallucination Validation Engine (0ms Latency)
- A deterministic Python validation layer extracts every test measurement using strict word-boundary regex patterns and immediately cross-references them against certified clinical reference intervals.
- Flags test measurements as `NORMAL`, `ATTENTION / HIGH`, `LOW`, or `CRITICAL` with **0ms latency** before the LLM ever sees the prompt.
- The model is strictly constrained by these deterministic findings, eliminating diagnostic hallucinations.

### 3. 🧠 Google Gemma 4 12B Cloud GPU Intelligence
- Hosted on Kaggle dual Tesla T4 GPUs (32GB VRAM total) running fine-tuned `lablens-clinical` with Ollama and an HTTPS ngrok tunnel.
- Supports real-time token-by-token Server-Sent Events (SSE) streaming (`/api/clinical/stream`) at ~25.5 tokens/sec.
- Automatic fallback to Google Gemini Flash API when cloud GPU tunnels are offline.

### 4. 🎙️ Interactive Hitho AI Voice Talk Agent
- Tap Hitho AI anywhere on the screen to launch the real-time **Voice Talk Agent** dialog.
- Powered by the Web Speech API (`webkitSpeechRecognition`) with live acoustic wavebars and bilingual speech synthesis (`SpeechSynthesisUtterance` with Hindi & English voice detection).
- Grounded conversational Q&A against the patient's active report via `/api/clinical/rag-ask` and `/api/clinical/ask`.

### 5. 🎨  Healthcare Design System
- Clean, bright **White + Soft Blue + Electric Blue** color system (`#F8FAFF`, `#EEF5FF`, `#FFFFFF`, `#2563EB`, `#3B82F6`).
- Premium Linotype *Neue Haas Grotesk* typography.
- Compact, fluid **160px light blue cursor spotlight** with button-hover constriction and an optical shockwave burst animation that disappears upon clicking interactive controls.
- Smooth TanStack Router client-side navigation with default home landing page initialization.

### 6. 🗂️ Deduplicated Report History & Local-First Privacy
- All analyzed reports are stored securely and privately in the user's browser `localStorage`.
- Built-in signature deduplication (`deduplicateReports()`) automatically purges redundant duplicate entries and heals stored records.
- Real-time search and filter bar to search historical summaries by report title or file name.

### 7. 📋 Prioritized Physician Questions & Hospital Brief Export
- Automatically generates high-yield, prioritized consultation questions for the patient's next doctor visit based on out-of-range biomarkers.
- One-click structured hospital summary export (`/api/clinical/export-summary`) ready for print (`window.print()`) or sharing with clinicians.

### 8. 🛠️ Agent Skills Architecture (`SKILL.md`)
- Adheres to the open `SKILL.md` agent specification with progressive disclosure in [`skills/clinical-report-analyst/SKILL.md`](skills/clinical-report-analyst/SKILL.md).

---

## 🧩 System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│             React 19 + TanStack Router Frontend                        │
│         Vite dev server running on http://localhost:5173               │
│   • Apple Healthcare UI • Hitho AI Voice Agent • EvidenceTrace™ Cards  │
│   • Universal File/Text Ingestion • Local-First Deduplicated History   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / SSE / REST
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             FastAPI High-Performance Backend                           │
│         Uvicorn server running on http://localhost:8000                │
└───────────┬───────────────────────┬───────────────────────┬────────────┘
            │                       │                       │
            ▼                       ▼                       ▼
┌───────────────────────┐ ┌───────────────────┐ ┌────────────────────────┐
│  EvidenceTrace™       │ │ Hermes ReAct      │ │ Agent Skills Engine    │
│  Deterministic Engine │ │ Autonomous Agent  │ │ SKILL.md Standard      │
│  - 0ms Latency        │ │ - Multi-step loop │ │ - Progressive          │
│  - Regex & Range Spec │ │ - Tool execution  │ │   disclosure           │
│  - 18+ Lab Standards  │ │ - Trace capture   │ │ - Clinical playbooks   │
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
│   • Fallback: Google Gemini API (Dual Redundancy)                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔬 The EvidenceTrace™ Dual-Stage Pipeline

To eliminate medical hallucinations, **Samjho Health enforces a strict two-stage verification pipeline**:

```
[ Medical Report / PDF / Image / Video / Text ]
                      │
                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Stage 1: Deterministic Python Validation (0ms, 100% Deterministic)     │
│  - Extracts exact numerical values and units with boundary regex       │
│  - Compares with certified medical ranges (Hb, Glucose, Lipid, TSH...) │
│  - Flags status: NORMAL | ATTENTION | OUTSIDE RANGE | CRITICAL         │
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
| `GET` | `/api/clinical/standards` | Returns certified medical lab standards and reference ranges |
| `GET` | `/api/clinical/samples` | Lists pre-loaded medical report samples (CBC, Lipids, Thyroid, Rx) |
| `POST` | `/api/clinical/validate` | Instant 0ms deterministic biomarker extraction and range validation |
| `POST` | `/api/clinical/analyze` | Full end-to-end analysis (EvidenceTrace™ + Gemma 4 12B) |
| `POST` | `/api/clinical/stream` | Real-time token-by-token SSE streaming inference from Gemma 4 12B |
| `POST` | `/api/clinical/rag-ask` | Grounded clinical RAG question answering against uploaded report |
| `POST` | `/api/clinical/ask` | Contextual Q&A against validated report excerpts |
| `POST` | `/api/clinical/export-summary` | Generates printable hospital HTML and markdown medical briefs |
| `POST` | `/api/upload` | Universal ingestion for PDF, CSV, TXT, Images, and Video keyframes |
| `GET` | `/api/skills` | Discovers open-standard skills in `skills/` |
| `GET` | `/api/skills/{name}` | Returns full `SKILL.md` content via progressive disclosure |

---

## 📂 Pre-Loaded Medical Sample Datasets

Located in `data/sample_reports/` for instant evaluation:
- **`sample_blood_report.txt`**: Complete Blood Count (CBC) + Fasting Sugar + Mild Anemia indicators.
- **`sample_lipid_panel.csv`**: Comprehensive cardiovascular lipid profile (Cholesterol, HDL, LDL, Triglycerides).
- **`sample_thyroid_panel.txt`**: Endocrinology screen (TSH, T3, T4, Anti-TPO antibodies).
- **`sample_prescription.txt`**: Real outpatient prescription slip with vital signs and medication directions.

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
Create a `.env` file in the root directory:
```env
# Cloud GPU Gemma 4 12B ngrok tunnel URL
CLOUD_GPU_URL=https://proxy-service-editor.ngrok-free.dev

# (Optional fallback) Google Gemini API key
GEMINI_API_KEY=your_key_here
```

### 3. Launch Development Servers

**Backend (FastAPI):**
```bash
python scripts/run_backend.py
# Running on http://localhost:8000 (Swagger docs at http://localhost:8000/docs)
```

**Frontend (React 19 + Vite):**
```bash
cd frontend
pnpm install
pnpm run dev
# Opens automatically on http://localhost:5173/
```

---

## ☁️ Running Gemma 4 12B on Kaggle Dual Tesla T4 GPUs

1. Open [Kaggle Notebooks](https://www.kaggle.com/code) and click **New Notebook**.
2. Upload [`notebooks/kaggle_gemma_gpu_runner.ipynb`](notebooks/kaggle_gemma_gpu_runner.ipynb).
3. Under **Notebook Options ➔ Accelerator**, choose **GPU T4 x2**.
4. Run all cells in sequence:
   - Verifies dual Tesla T4 GPUs (~29.1 GB VRAM available).
   - Installs `zstd` and Ollama `0.40.11`.
   - Starts the background Ollama daemon via Python `subprocess.Popen`.
   - Pulls official Google **Gemma 4 12B** (`gemma4:12b`, 8.0 GB).
   - Compiles custom **`lablens-clinical`** model with clinical guardrails.
   - Runs inference benchmark (~25.5 tokens/sec).
   - Starts ngrok tunnel exposing port 11434 with public HTTPS URL.
5. Paste your ngrok public URL into `.env` as `CLOUD_GPU_URL`.

---

## ⚖️ Clinical & Ethical Disclaimer

> **IMPORTANT:** Samjho Health (LabLens AI) is an assistive educational technology engineered to enhance patient health literacy, explain diagnostic reports in plain language, and prepare patients for informed consultations with licensed physicians. It does **not** provide autonomous medical diagnoses, formulate definitive treatment regimens, or replace the professional judgment of a healthcare provider. In case of a medical emergency, immediately contact your local emergency services or visit the nearest emergency medical facility.

---

## 📄 License
MIT License — Created with ❤️ for Hackathon 2026.
