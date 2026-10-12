import os
import sys
import time
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import torch

# Initialize FastAPI App
app = FastAPI(
    title="Hackathon AI & Application Backend",
    description="High-performance backend API with deep learning integration for hackathon projects.",
    version="1.0.0"
)

# Enable CORS for frontend integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins during hackathon development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup time tracking
START_TIME = time.time()


# Request / Response Schemas
class PredictionRequest(BaseModel):
    input_text: Optional[str] = Field(None, description="Text input for NLP/LLM models")
    features: Optional[list[float]] = Field(None, description="Feature vector for tabular/numerical models")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Inference parameters (temperature, max_tokens, etc.)")


class PredictionResponse(BaseModel):
    status: str
    prediction: Any
    latency_ms: float
    device_used: str
    model_version: str


@app.get("/")
def read_root():
    return {
        "project": "Hackathon AI Platform",
        "status": "online",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }


@app.get("/api/health")
def health_check():
    """
    Returns system status, CUDA / GPU acceleration details, and uptime.
    Essential for hackathon live judging and frontend dashboards.
    """
    cuda_available = torch.cuda.is_available()
    gpu_info = {}
    
    if cuda_available:
        gpu_info = {
            "device_name": torch.cuda.get_device_name(0),
            "device_count": torch.cuda.device_count(),
            "allocated_vram_mb": round(torch.cuda.memory_allocated(0) / (1024 * 1024), 2),
            "reserved_vram_mb": round(torch.cuda.memory_reserved(0) / (1024 * 1024), 2),
            "max_vram_mb": round(torch.cuda.get_device_properties(0).total_memory / (1024 * 1024), 2)
        }
    
    return {
        "status": "healthy",
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "cuda_available": cuda_available,
        "gpu": gpu_info if cuda_available else "No CUDA GPU detected (running on CPU)",
        "python_version": sys.version.split()[0],
        "torch_version": torch.__version__
    }


@app.post("/api/predict", response_model=PredictionResponse)
def run_prediction(payload: PredictionRequest):
    """
    Primary AI Inference Endpoint.
    Executes model inference on GPU if available, falls back to CPU.
    """
    start_time = time.time()
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    try:
        # Placeholder / baseline logic (easily plugged into ai_engine.inference)
        if payload.input_text:
            # Example text processing / mock inference
            result = {
                "sentiment": "positive",
                "confidence": 0.942,
                "summary": f"Processed: {payload.input_text[:50]}...",
                "tokens_processed": len(payload.input_text.split())
            }
        elif payload.features:
            # Example numerical prediction
            tensor_feat = torch.tensor(payload.features, dtype=torch.float32).to(device)
            result = {
                "score": float(tensor_feat.mean().item()),
                "dimensions": list(tensor_feat.shape)
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either 'input_text' or 'features' must be provided."
            )
            
        latency = round((time.time() - start_time) * 1000, 2)
        
        return PredictionResponse(
            status="success",
            prediction=result,
            latency_ms=latency,
            device_used=device,
            model_version="1.0.0-hackathon"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
