# 🏗️ System Architecture

## Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│               Frontend (React + Vite + Tailwind)       │
│   - Responsive Dashboard & Controls                    │
│   - Live AI Chat & Generation Playground               │
│   - REST / WebSocket Client                            │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / JSON (Port 8000)
                           ▼
┌────────────────────────────────────────────────────────┐
│               Backend (FastAPI Service)                │
│   - Request Validation (Pydantic)                      │
│   - Business Logic & Orchestration                     │
│   - Health & Telemetry Endpoints                       │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼ (Local / GPU)            ▼ (Cloud Fallback)
┌──────────────────────────────┐ ┌──────────────────────────────┐
│  Local AI Engine (ai_ml/)    │ │  Cloud LLM API               │
│  - RTX 2050 CUDA PyTorch     │ │  - Google Gemini API         │
│  - Ollama (Llama 3.2 1B)     │ │  - OpenAI API                │
│  - 4-bit LoRA Fine-Tuned     │ │  - Hugging Face Inference    │
└──────────────────────────────┘ └──────────────────────────────┘
```

## Data Flow
1. **User Interaction**: Frontend sends user query/input payload to `/api/v1/predict` or `/api/v1/chat`.
2. **Validation**: FastAPI validates headers and payload structure.
3. **AI Routing**:
   - Primary: Routes to local GPU model (Ollama / PyTorch pipeline) for zero-latency, private inference.
   - Fallback: If local GPU is busy or prompt exceeds memory, seamlessly falls back to cloud API.
4. **Response**: Sanitized result returns to Frontend and updates UI in real-time.
