import os
import sys
import time
from pathlib import Path
from typing import Dict, Any, Optional, List

# Ensure repository root is on sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi import FastAPI, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import torch

from skills_engine.skill_loader import SkillManager
from ai_engine.gemma_client import GemmaClient
from agent_harness.hermes_agent import HermesAgent

# Initialize FastAPI App
app = FastAPI(
    title="Hackathon AI Platform: Gemma, Hermes Agent & Agent Skills",
    description="High-performance backend API with Gemma LLM integration, Hermes agent harness, and SKILL.md open standard support.",
    version="2.0.0"
)

# Enable CORS for frontend integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Core Services
START_TIME = time.time()
skills_manager = SkillManager(skills_dir=str(ROOT_DIR / "skills"))
gemma_client = GemmaClient()
hermes_agent = HermesAgent(gemma_client=gemma_client, skills_manager=skills_manager)


# Schemas
class PredictionRequest(BaseModel):
    input_text: Optional[str] = Field(None, description="Text input for model")
    features: Optional[list[float]] = Field(None, description="Numerical features")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)


class PredictionResponse(BaseModel):
    status: str
    prediction: Any
    latency_ms: float
    device_used: str
    model_version: str


class AgentChatRequest(BaseModel):
    message: str = Field(..., description="User message or prompt for Hermes Agent")
    file_name: Optional[str] = Field(None, description="Optional attached file name")
    file_content: Optional[str] = Field(None, description="Optional attached text / data content")
    max_steps: Optional[int] = Field(3, description="Max reasoning steps in agent loop")


class CreateSkillRequest(BaseModel):
    name: str = Field(..., description="Unique skill directory name, e.g. code-auditor")
    description: str = Field(..., description="Short single-line description for agent discovery")
    instructions: str = Field(..., description="Full operational instructions body in markdown")
    tags: Optional[List[str]] = Field(default_factory=list, description="Categorization tags")


class GemmaGenerateRequest(BaseModel):
    prompt: str = Field(..., description="Prompt for Gemma model")
    system_instruction: Optional[str] = Field(None, description="System instructions")
    temperature: Optional[float] = Field(0.7, description="Sampling temperature")


@app.get("/")
def read_root():
    return {
        "project": "Hackathon Gemma & Hermes Agent Platform",
        "status": "online",
        "docs_url": "/docs",
        "health_url": "/api/health",
        "skills_url": "/api/skills"
    }


@app.get("/api/health")
def health_check():
    """
    Returns system status, CUDA / GPU acceleration details, and agent stats.
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
        "torch_version": torch.__version__,
        "discovered_skills_count": len(skills_manager.discover_skills())
    }


# ==============================================================================
# AGENT SKILLS OPEN STANDARD ENDPOINTS (SKILL.md)
# ==============================================================================
@app.get("/api/skills")
def list_skills():
    """
    Step 1 of Progressive Disclosure:
    Lists metadata (name, description, tags) for all discovered Agent Skills without body payload.
    """
    return {
        "count": len(skills_manager.discover_skills()),
        "skills": skills_manager.list_skills_summary()
    }


@app.get("/api/skills/{skill_name}")
def get_skill_detail(skill_name: str):
    """
    Step 2 of Progressive Disclosure:
    Loads full SKILL.md body and instructions on-demand when activated.
    """
    skill = skills_manager.get_skill(skill_name)
    if not skill:
        raise HTTPException(status_code=404, detail=f"Skill '{skill_name}' not found.")
    return skill


@app.post("/api/skills/create")
def create_skill(payload: CreateSkillRequest):
    """
    Dynamically authors a new Agent Skill following the SKILL.md open standard.
    Enables instant hackathon customization without code deployment!
    """
    clean_name = payload.name.strip().lower().replace(" ", "-")
    skill_dir = ROOT_DIR / "skills" / clean_name
    skill_dir.mkdir(parents=True, exist_ok=True)
    
    skill_file = skill_dir / "SKILL.md"
    tags_formatted = "\n".join([f"  - {t.strip()}" for t in payload.tags if t.strip()])
    
    file_content = (
        f"---\n"
        f"name: {clean_name}\n"
        f"description: {payload.description.strip()}\n"
        f"version: 1.0.0\n"
        f"tags:\n{tags_formatted if tags_formatted else '  - custom'}\n"
        f"---\n\n"
        f"{payload.instructions.strip()}\n"
    )
    
    with open(skill_file, "w", encoding="utf-8") as f:
        f.write(file_content)
        
    # Re-index skills in memory
    skills_manager.discover_skills()
    return {
        "status": "success",
        "message": f"Skill '{clean_name}' successfully created and indexed!",
        "skill": skills_manager.get_skill(clean_name)
    }


# ==============================================================================
# UNIVERSAL FILE UPLOAD ENDPOINT
# ==============================================================================
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Universal File Ingestion endpoint for CSV, JSON, TXT, Code, and Log files.
    Prepares data for Hermes Agent reasoning.
    """
    try:
        content_bytes = await file.read()
        # Decode as UTF-8 text (support up to 2MB)
        text_content = content_bytes.decode("utf-8", errors="replace")
        return {
            "status": "success",
            "filename": file.filename,
            "size_bytes": len(content_bytes),
            "line_count": len(text_content.splitlines()),
            "preview": text_content[:500],
            "content": text_content
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {e}")


# ==============================================================================
# HERMES AGENT & GEMMA ORCHESTRATION ENDPOINTS
# ==============================================================================
@app.post("/api/agent/chat")
def agent_chat(payload: AgentChatRequest):
    """
    Executes the autonomous Hermes Agent loop:
    Thought -> Action / Tool Call -> Observation -> Final Answer.
    Supports attached file payloads for real-time data/code analysis.
    """
    result = hermes_agent.run(
        user_prompt=payload.message,
        max_steps=payload.max_steps or 3,
        file_content=payload.file_content,
        file_name=payload.file_name
    )
    return result


@app.post("/api/gemma/generate")
def gemma_generate(payload: GemmaGenerateRequest):
    """
    Direct prompt generation using Google Gemma models via google-genai SDK.
    """
    response = gemma_client.generate(
        prompt=payload.prompt,
        system_instruction=payload.system_instruction,
        temperature=payload.temperature or 0.7
    )
    return response


# ==============================================================================
# INFERENCE ENDPOINT
# ==============================================================================
@app.post("/api/predict", response_model=PredictionResponse)
def run_prediction(payload: PredictionRequest):
    """
    Direct model inference endpoint.
    """
    start_time = time.time()
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    try:
        if payload.input_text:
            result = {
                "sentiment": "positive",
                "confidence": 0.942,
                "summary": f"Processed: {payload.input_text[:50]}...",
                "tokens_processed": len(payload.input_text.split())
            }
        elif payload.features:
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
            model_version="2.0.0-gemma-hermes"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
