import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.services.ai_service import AIService

api_router = APIRouter()
ai_service = AIService()

class ChatRequest(BaseModel):
    prompt: str = Field(..., description="User query or input")
    model: Optional[str] = Field("default", description="Model name to invoke")
    temperature: Optional[float] = Field(0.7, ge=0.0, le=1.0)
    max_tokens: Optional[int] = Field(512, ge=16, le=2048)

class PredictRequest(BaseModel):
    input_data: Dict[str, Any]

@api_router.get("/health")
def api_health():
    gpu_info = ai_service.get_hardware_status()
    return {
        "status": "healthy",
        "service": "Hackathon API v1",
        "hardware": gpu_info
    }

@api_router.post("/chat")
async def chat_completion(request: ChatRequest):
    start = time.time()
    try:
        reply = await ai_service.generate_response(
            prompt=request.prompt,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        latency = round((time.time() - start) * 1000, 2)
        return {
            "success": True,
            "response": reply,
            "latency_ms": latency
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/predict")
async def predict_endpoint(request: PredictRequest):
    start = time.time()
    result = await ai_service.process_pipeline(request.input_data)
    latency = round((time.time() - start) * 1000, 2)
    return {
        "success": True,
        "result": result,
        "latency_ms": latency
    }
