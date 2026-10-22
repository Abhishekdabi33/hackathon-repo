import os
import json
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

class GemmaClient:
    """
    Google Gemma & Open-Weight LLM API Client.
    Supports:
    1. Official Google GenAI SDK (gemini-2.5-flash, gemma-2-9b-it, gemma-2-27b-it)
    2. Open-Weight API endpoints (OpenRouter, Groq, Hugging Face)
    3. Graceful offline simulation mode for hackathon offline testing
    """
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.cloud_gpu_url = os.getenv("CLOUD_GPU_URL", "").rstrip("/")
        self.model = model
        self.client = None
        self._init_client()

    def _init_client(self):
        if self.cloud_gpu_url:
            print(f"[OK] GemmaClient configured to route to Cloud GPU at: {self.cloud_gpu_url}")
        elif self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                print(f"[OK] Gemma/Gemini client initialized with model '{self.model}'")
            except Exception as e:
                print(f"[!] Warning initializing google-genai client: {e}")
                self.client = None
        else:
            print("[*] Running in mock/simulation mode. Set GEMINI_API_KEY (Google AI Studio) or CLOUD_GPU_URL (Kaggle/Colab) in .env for live AI.")

    def generate(self, prompt: str, system_instruction: Optional[str] = None, temperature: float = 0.7) -> Dict[str, Any]:
        """Generates text using Cloud GPU (Kaggle), Google GenAI SDK, or fallback simulation."""
        # 1. Check if Cloud GPU URL (Kaggle / Colab) is active
        if self.cloud_gpu_url:
            try:
                import httpx
                resp = httpx.post(
                    f"{self.cloud_gpu_url}/api/predict",
                    json={"prompt": prompt, "max_tokens": 512},
                    timeout=45.0
                )
                if resp.status_code == 200:
                    data = resp.json()
                    raw_text = data.get("result", "")
                    
                    # Clean up Causal LM output (strip prompt echoes)
                    clean_text = raw_text
                    if clean_text.startswith(prompt):
                        clean_text = clean_text[len(prompt):].strip()
                    elif "Provide the final comprehensive response to the user." in clean_text:
                        clean_text = clean_text.split("Provide the final comprehensive response to the user.")[-1].strip()

                    return {
                        "text": clean_text,
                        "model": "gemma-kaggle-t4-cloud",
                        "provider": "kaggle-cloud-gpu",
                        "status": "success"
                    }
            except Exception as e:
                print(f"[!] Cloud GPU request failed: {e}. Falling back to API/simulation.")

        # 2. Check if Google GenAI API is active
        if self.client:
            try:
                config = {}
                if system_instruction:
                    config["system_instruction"] = system_instruction
                if temperature is not None:
                    config["temperature"] = temperature

                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=config if config else None
                )
                return {
                    "text": response.text,
                    "model": self.model,
                    "provider": "google-genai",
                    "status": "success"
                }
            except Exception as e:
                print(f"[!] API call failed: {e}. Falling back to simulation.")

        # 3. Demonstration mode (reproducible offline response for hackathons)
        return {
            "text": f"[Gemma Simulation Response]\nBased on your query: '{prompt[:100]}...', "
                    f"the Gemma reasoning engine has analyzed the context and prepared the output.",
            "model": f"{self.model} (simulation)",
            "provider": "offline-simulated",
            "status": "simulated",
            "note": "Provide GEMINI_API_KEY in .env to call live Google Gemma models"
        }

if __name__ == "__main__":
    client = GemmaClient()
    res = client.generate("Hello Gemma! Explain agentic skills in one sentence.")
    print("Generation result:", res)
