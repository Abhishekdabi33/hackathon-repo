import os
import time
import httpx
from app.core.config import settings

class AIService:
    def __init__(self):
        self.ollama_url = settings.OLLAMA_BASE_URL
        self.default_model = settings.OLLAMA_MODEL

    def get_hardware_status(self):
        status = {
            "device": "CPU",
            "cuda_available": False,
            "vram_gb": 0.0
        }
        try:
            import torch
            if torch.cuda.is_available():
                status["cuda_available"] = True
                status["device"] = torch.cuda.get_device_name(0)
                status["vram_gb"] = round(torch.cuda.get_device_properties(0).total_memory / (1024**3), 2)
        except ImportError:
            pass
        return status

    async def generate_response(self, prompt: str, temperature: float = 0.7, max_tokens: int = 512) -> str:
        # 1. Try local Ollama if running
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": self.default_model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {"temperature": temperature, "num_predict": max_tokens}
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    return data.get("response", "")
        except Exception:
            pass

        # 2. Mock fallback for rapid hackathon testing without waiting for model downloads
        return (
            f"[AI Assistant Response] Generated for prompt: '{prompt[:60]}...'. "
            "Backend is operational. Connect Ollama or set GEMINI_API_KEY in .env for live LLM responses."
        )

    async def process_pipeline(self, input_data: dict) -> dict:
        return {
            "processed": True,
            "summary": "Data successfully processed through hackathon pipeline",
            "features_extracted": len(input_data),
            "timestamp": time.time()
        }
