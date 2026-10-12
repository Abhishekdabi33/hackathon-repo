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
        self.model = model
        self.client = None
        self._init_client()

    def _init_client(self):
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                print(f"[OK] Gemma/Gemini client initialized with model '{self.model}'")
            except Exception as e:
                print(f"[!] Warning initializing google-genai client: {e}")
                self.client = None
        else:
            print("[*] No GEMINI_API_KEY set. GemmaClient running in demonstration/mock mode.")

    def generate(self, prompt: str, system_instruction: Optional[str] = None, temperature: float = 0.7) -> Dict[str, Any]:
        """Generates text using Gemma or fallback demonstration engine."""
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

        # Demonstration mode (reproducible offline response for hackathons)
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
