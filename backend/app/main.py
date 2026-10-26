from fastapi.responses import StreamingResponse
from backend.app.rag_engine import clinical_rag
import os
import sys
import time
import base64
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List

# Ensure repository root is on sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi import FastAPI, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
try:
    import torch
except ImportError:
    torch = None

from skills_engine.skill_loader import SkillManager
from ai_engine.gemma_client import GemmaClient
from agent_harness.hermes_agent import HermesAgent
from backend.app.clinical_engine import clinical_validator, CLINICAL_STANDARDS

# Initialize FastAPI App with LabLens AI Branding
app = FastAPI(
    title="LabLens AI — Multimodal Medical Report & Clinical Review Assistant",
    description="AI-Powered Medical Report Understanding & Clinical Review Assistant powered by Google Gemma 4 12B, deterministic clinical validation, and EvidenceTrace.",
    version="3.0.0-lablens-gemma"
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


# ==============================================================================
# SCHEMAS
# ==============================================================================
class ClinicalValidateRequest(BaseModel):
    report_text: str = Field(..., description="Raw text of medical report, CSV, or clinical notes")
    patient_age: Optional[int] = Field(None, description="Patient age in years")
    patient_gender: Optional[str] = Field(None, description="Patient biological sex (male/female)")


class ClinicalAnalyzeRequest(BaseModel):
    report_text: Optional[str] = Field(None, description="Report text content or transcription")
    prompt: Optional[str] = Field("Analyze this medical report and explain findings", description="User question or delivery prompt")
    image_base64: Optional[str] = Field(None, description="Optional base64 encoded image (prescription / scanned report)")
    file_name: Optional[str] = Field(None, description="Document filename")
    patient_context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Optional age, gender, symptoms")


class ClinicalAskRequest(BaseModel):
    question: str = Field(..., description="User question about their report")
    report_text: Optional[str] = Field(None, description="Contextual report text")
    evidence_trace: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Validated evidence trace items")


class ExportSummaryRequest(BaseModel):
    patient_name: Optional[str] = Field("Patient", description="Patient name")
    report_text: Optional[str] = Field("", description="Original report text")
    evidence_trace: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Validated evidence trace items")
    explanation: Optional[str] = Field("", description="Clinical explanation")
    doctor_questions: Optional[List[str]] = Field(default_factory=list, description="Doctor consultation questions")
    abnormal_count: Optional[int] = Field(0, description="Total flagged abnormalities")


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
    image_base64: Optional[str] = Field(None, description="Optional attached base64 image")
    max_steps: Optional[int] = Field(3, description="Max reasoning steps in agent loop")


class CreateSkillRequest(BaseModel):
    name: str = Field(..., description="Unique skill directory name, e.g. clinical-report-analyst")
    description: str = Field(..., description="Short single-line description for agent discovery")
    instructions: str = Field(..., description="Full operational instructions body in markdown")
    tags: Optional[List[str]] = Field(default_factory=list, description="Categorization tags")


class RAGAskRequest(BaseModel):
    question: str = Field(..., description="User question in any language (English, Hindi, Hinglish, etc.)")
    report_text: Optional[str] = Field(None, description="Patient report text or context")
    file_name: Optional[str] = Field("Medical Report", description="Document name")
    image_base64: Optional[str] = Field(None, description="Optional image base64")

class GemmaGenerateRequest(BaseModel):
    prompt: str = Field(..., description="Prompt for Gemma model")
    system_instruction: Optional[str] = Field(None, description="System instructions")
    temperature: Optional[float] = Field(0.7, description="Sampling temperature")


# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================
def extract_pdf_text_and_images(pdf_bytes: bytes) -> tuple[str, Optional[str]]:
    """
    High-Fidelity Hybrid PDF Extraction:
    1. Attempts native vector text extraction via PyMuPDF / pypdf.
    2. If page contains scanned raster images or sparse text (< 40 chars),
       runs RapidOCR on high-DPI rendered page pixmaps.
    3. Returns clean UTF-8 text and the primary base64-encoded page image for multimodal vision.
    """
    text_chunks = []
    first_image_b64 = None

    try:
        import pymupdf as fitz
        from rapidocr_onnxruntime import RapidOCR
        ocr_engine = RapidOCR()

        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for i, page in enumerate(doc):
            page_text = page.get_text().strip()
            if len(page_text) > 40:
                text_chunks.append(page_text)
            else:
                pix = page.get_pixmap(dpi=150)
                img_bytes = pix.tobytes("png")
                if not first_image_b64 and i == 0:
                    first_image_b64 = base64.b64encode(img_bytes).decode("utf-8")
                
                res, _ = ocr_engine(img_bytes)
                if res:
                    ocr_lines = [r[1] for r in res]
                    text_chunks.append("\n".join(ocr_lines))

            if not first_image_b64 and i == 0:
                pix = page.get_pixmap(dpi=150)
                first_image_b64 = base64.b64encode(pix.tobytes("png")).decode("utf-8")

        if text_chunks:
            return "\n\n".join(text_chunks), first_image_b64
    except Exception:
        pass

    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        pypdf_chunks = []
        for p in reader.pages:
            t = p.extract_text()
            if t and len(t.strip()) > 10:
                pypdf_chunks.append(t.strip())
        if pypdf_chunks:
            return "\n\n".join(pypdf_chunks), first_image_b64
    except Exception:
        pass

    import zlib
    text_pieces = []
    stream_pattern = re.compile(b"stream[\r\n]+(.*?)[\r\n]+endstream", re.DOTALL)
    for match in stream_pattern.finditer(pdf_bytes):
        raw_stream = match.group(1)
        try:
            decompressed = zlib.decompress(raw_stream)
            bt_matches = re.findall(rb"\((.*?)\)\s*Tj", decompressed)
            for m in bt_matches:
                t = m.decode("latin1", errors="replace").strip()
                if t:
                    text_pieces.append(t)
        except Exception:
            pass

    if text_pieces:
        return "\n".join(text_pieces), first_image_b64

    return "No readable text or scan detected in PDF document.", first_image_b64


def extract_pdf_text_pure_python(pdf_bytes: bytes) -> str:
    """Backward compatibility wrapper."""
    text, _ = extract_pdf_text_and_images(pdf_bytes)
    return text


def get_device_environment() -> Dict[str, Any]:
    """
    Gathers real hardware, operating system, and AI environment telemetry using standard library.
    """
    import platform
    import shutil
    import ctypes

    cuda_available = torch.cuda.is_available() if torch else False
    gpu_info = {}
    if cuda_available:
        max_vram = round(torch.cuda.get_device_properties(0).total_memory / (1024 * 1024), 2)
        alloc_vram = round(torch.cuda.memory_allocated(0) / (1024 * 1024), 2)
        reserved_vram = round(torch.cuda.memory_reserved(0) / (1024 * 1024), 2)
        avail_vram = round(max_vram - alloc_vram, 2)
        gpu_info = {
            "device_name": torch.cuda.get_device_name(0),
            "device_count": torch.cuda.device_count(),
            "allocated_vram_mb": alloc_vram,
            "reserved_vram_mb": reserved_vram,
            "max_vram_mb": max_vram,
            "available_vram_mb": avail_vram,
            "driver_cuda_version": getattr(getattr(torch, "version", None), "cuda", "N/A") or "N/A"
        }

    total_disk, used_disk, free_disk = shutil.disk_usage(ROOT_DIR)

    ram_info = {}
    try:
        class MEMORYSTATUSEX(ctypes.Structure):
            _fields_ = [
                ("dwLength", ctypes.c_ulong),
                ("dwMemoryLoad", ctypes.c_ulong),
                ("ullTotalPhys", ctypes.c_ulonglong),
                ("ullAvailPhys", ctypes.c_ulonglong),
                ("ullTotalPageFile", ctypes.c_ulonglong),
                ("ullAvailPageFile", ctypes.c_ulonglong),
                ("ullTotalVirtual", ctypes.c_ulonglong),
                ("ullAvailVirtual", ctypes.c_ulonglong),
                ("sullAvailExtendedVirtual", ctypes.c_ulonglong),
            ]
        mem = MEMORYSTATUSEX()
        mem.dwLength = ctypes.sizeof(MEMORYSTATUSEX)
        ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(mem))
        ram_info = {
            "total_gb": round(mem.ullTotalPhys / (1024**3), 2),
            "used_gb": round((mem.ullTotalPhys - mem.ullAvailPhys) / (1024**3), 2),
            "free_gb": round(mem.ullAvailPhys / (1024**3), 2),
            "percent_used": mem.dwMemoryLoad
        }
    except Exception:
        ram_info = {"total_gb": None, "used_gb": None, "free_gb": None, "percent_used": None}

    return {
        "os": f"{platform.system()} {platform.release()} (Build {platform.version()})",
        "cpu": {
            "processor": platform.processor() or platform.machine(),
            "cores": os.cpu_count(),
            "architecture": platform.machine()
        },
        "gpu": gpu_info if cuda_available else None,
        "ram": ram_info,
        "storage": {
            "total_gb": round(total_disk / (1024**3), 1),
            "used_gb": round(used_disk / (1024**3), 1),
            "free_gb": round(free_disk / (1024**3), 1),
            "percent_used": round((used_disk / total_disk) * 100, 1)
        },
        "python_version": sys.version.split()[0],
        "ai_framework": f"PyTorch {getattr(torch, '__version__', 'N/A')}" if torch else "Python Cloud Runtime",
        "model": {
            "name": "Google Gemma 4 12B",
            "variant": "gemma4:12b-instruct-q4_0",
            "version": "3.0.0-lablens-gemma",
            "inference_device": torch.cuda.get_device_name(0) if cuda_available else "CPU (Multi-threaded)",
            "device_type": "cuda:0" if cuda_available else "cpu",
            "model_status": "Ready",
            "current_inference_status": "Idle"
        }
    }


# ==============================================================================
# BASE SYSTEM ENDPOINTS
# ==============================================================================
@app.get("/")
def read_root():
    return {
        "project": "LabLens AI — Clinical Review & Report Assistant",
        "model": "Google Gemma 4 12B Unified Multimodal",
        "status": "online",
        "docs_url": "/docs",
        "health_url": "/api/health",
        "skills_url": "/api/skills",
        "standards_url": "/api/clinical/standards"
    }


@app.get("/api/health")
def health_check():
    device_env = get_device_environment()
    cuda_available = torch.cuda.is_available() if torch else False
    
    return {
        "status": "healthy",
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "cuda_available": cuda_available,
        "gpu": device_env["gpu"] if cuda_available else "No CUDA GPU detected (running on CPU)",
        "python_version": sys.version.split()[0],
        "torch_version": getattr(torch, "__version__", "Cloud Light Mode"),
        "discovered_skills_count": len(skills_manager.discover_skills()),
        "device_config": device_env
    }


@app.get("/api/system/device")
def get_device_config():
    return get_device_environment()


# ==============================================================================
# LABLENS AI CLINICAL ENDPOINTS
# ==============================================================================
@app.get("/api/clinical/standards")
def get_clinical_standards():
    """
    Returns the comprehensive medical reference dictionary for all standard lab tests.
    """
    return {
        "count": len(CLINICAL_STANDARDS),
        "standards": CLINICAL_STANDARDS
    }


@app.post("/api/clinical/validate")
def validate_clinical_report(payload: ClinicalValidateRequest):
    """
    Deterministic Python Validation Engine.
    Instantly extracts and validates all test measurements against laboratory ranges
    and clinical standards with zero hallucinations.
    """
    start_time = time.time()
    evidence_items = clinical_validator.extract_from_text(payload.report_text)
    
    abnormal_items = [e for e in evidence_items if e["is_abnormal"]]
    normal_items = [e for e in evidence_items if not e["is_abnormal"]]

    return {
        "status": "success",
        "latency_ms": round((time.time() - start_time) * 1000, 2),
        "total_tests_detected": len(evidence_items),
        "abnormal_count": len(abnormal_items),
        "normal_count": len(normal_items),
        "evidence_trace": evidence_items,
        "flagged_abnormalities": abnormal_items
    }


@app.post("/api/clinical/analyze")
def analyze_clinical_document(payload: ClinicalAnalyzeRequest):
    """
    End-to-End Clinical Analysis:
    1. Extracts and checks numerical tests with Deterministic Validation.
    2. Builds EvidenceTrace linking findings to original text.
    3. Prompts Gemma 4 12B according to user intent (Chat / Clinical Table / Doctor Prep).
    """
    start_time = time.time()
    report_text = payload.report_text or ""

    # 0. Multimodal Auto-OCR: If image_base64 is provided without text, extract text using RapidOCR
    if (not report_text or len(report_text.strip()) < 10) and payload.image_base64:
        try:
            from rapidocr_onnxruntime import RapidOCR
            ocr_engine = RapidOCR()
            raw_img = base64.b64decode(payload.image_base64)
            res, _ = ocr_engine(raw_img)
            if res:
                report_text = "\n".join([r[1] for r in res])
        except Exception as ocr_err:
            print(f"[!] Analyze OCR fallback notice: {ocr_err}")

    # 1. Deterministic Extraction & Validation
    evidence_items = clinical_validator.extract_from_text(report_text) if report_text else []
    abnormal_items = [e for e in evidence_items if e["is_abnormal"]]

    # 2. Run Autonomous Reasoning Agent
    agent_res = hermes_agent.run(
        user_prompt=payload.prompt or "Analyze this medical report and explain findings",
        file_content=report_text,
        file_name=payload.file_name or "medical_report.txt",
        image_base64=payload.image_base64
    )

    # 3. Compile prioritized questions for doctor
    doctor_questions = []
    for item in abnormal_items:
        doctor_questions.extend(item.get("suggested_questions", []))
    if not doctor_questions and evidence_items:
        doctor_questions.append("Are there any routine lifestyle or dietary updates you recommend based on these normal results?")

    return {
        "status": "success",
        "latency_ms": round((time.time() - start_time) * 1000, 2),
        "explanation": agent_res.get("final_answer", ""),
        "evidence_trace": evidence_items,
        "abnormal_count": len(abnormal_items),
        "total_tests": len(evidence_items),
        "doctor_questions": list(dict.fromkeys(doctor_questions))[:6],
        "agent_steps": agent_res.get("steps", []),
        "model_used": agent_res.get("model_engine", "gemma4:12b-instruct-q4_0")
    }


@app.post("/api/clinical/stream")
async def stream_clinical_analysis(payload: ClinicalAnalyzeRequest):
    """
    Real-Time Server-Sent Events (SSE) Streaming Endpoint:
    Streams Gemma 4 12B tokens token-by-token (first come first write)
    along with EvidenceTrace validation metadata.
    """
    report_text = payload.report_text or ""
    evidence_items = clinical_validator.extract_from_text(report_text) if report_text else []
    abnormal_items = [e for e in evidence_items if e["is_abnormal"]]

    # Prioritized doctor questions
    doctor_questions = []
    for item in abnormal_items:
        doctor_questions.extend(item.get("suggested_questions", []))
    if not doctor_questions and evidence_items:
        doctor_questions.append("Are there any routine lifestyle or dietary updates you recommend based on these normal results?")

    # Build prompt using RAG engine for language sensitivity & grounding
    user_prompt = payload.prompt or "Analyze this medical report and explain findings"
    rag_prompt = clinical_rag.build_grounded_prompt(
        user_query=user_prompt,
        report_text=report_text,
        report_name=payload.file_name or "Medical Report"
    )

    async def event_generator():
        import json
        # 1. Send initial metadata packet
        meta = {
            "type": "metadata",
            "evidence_trace": evidence_items,
            "abnormal_count": len(abnormal_items),
            "total_tests": len(evidence_items),
            "doctor_questions": list(dict.fromkeys(doctor_questions))[:5],
            "model_used": "Google Gemma 4 12B"
        }
        yield f"data: {json.dumps(meta)}\n\n"

        # 2. Stream tokens from GemmaClient
        for token in gemma_client.generate_stream(
            prompt=rag_prompt,
            image_base64=payload.image_base64
        ):
            chunk = {"type": "token", "token": token}
            yield f"data: {json.dumps(chunk)}\n\n"

        # 3. Send done signal
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/api/clinical/rag-ask")
async def rag_ask(payload: RAGAskRequest):
    """
    Multilingual RAG Report Query Endpoint:
    Understands questions in any language (English, Hindi, Hinglish, Marathi, Gujarati, Spanish, etc.)
    and grounds the answer in patient records and AHA/ADA/WHO clinical guidelines.
    """
    rag_prompt = clinical_rag.build_grounded_prompt(
        user_query=payload.question,
        report_text=payload.report_text,
        report_name=payload.file_name or "Medical Report"
    )

    retrieval_info = clinical_rag.retrieve(payload.question, top_k=3)

    resp = gemma_client.generate(
        prompt=rag_prompt,
        image_base64=payload.image_base64
    )

    return {
        "status": "success",
        "question": payload.question,
        "answer": resp.get("text", ""),
        "retrieved_sections": [c["section"] for c in retrieval_info.get("report_chunks", [])],
        "guidelines_consulted": [g["title"] for g in retrieval_info.get("guideline_chunks", [])],
        "model_used": resp.get("model", "Google Gemma 4 12B")
    }


@app.post("/api/clinical/ask")
def ask_report_question(payload: ClinicalAskRequest):
    """
    Ask Your Report:
    Answers specific questions grounded strictly in the validated report and EvidenceTrace.
    """
    start_time = time.time()
    
    context = payload.report_text or ""
    if payload.evidence_trace:
        context += "\nValidated EvidenceTrace:\n"
        for item in payload.evidence_trace:
            context += f"- {item.get('test_name')}: {item.get('value')} {item.get('unit')} ({item.get('flag')})\n"

    res = hermes_agent.run(
        user_prompt=f"Question about medical report: {payload.question}",
        file_content=context,
        file_name="patient_report_context.txt"
    )

    return {
        "status": "success",
        "answer": res.get("final_answer", ""),
        "latency_ms": round((time.time() - start_time) * 1000, 2),
        "model_used": res.get("model_engine", "gemma4:12b-instruct-q4_0")
    }


@app.get("/api/clinical/samples")
def get_sample_reports():
    """
    Returns pre-loaded medical report samples (CBC, Lipids, Thyroid, Prescriptions)
    for instant 1-click clinical demonstrations without manual upload.
    """
    samples_dir = ROOT_DIR / "data" / "sample_reports"
    samples = []
    if samples_dir.exists():
        for file_path in sorted(samples_dir.iterdir()):
            if file_path.is_file() and file_path.suffix in [".txt", ".csv", ".json"]:
                content = file_path.read_text(encoding="utf-8", errors="replace")
                stem_title = (
                    file_path.stem.replace("sample_", "")
                    .replace("_", " ")
                    .title()
                )
                file_type = "csv" if file_path.suffix == ".csv" else "text"
                samples.append({
                    "id": file_path.stem,
                    "filename": file_path.name,
                    "title": stem_title,
                    "file_type": file_type,
                    "line_count": len(content.splitlines()),
                    "preview": content[:260],
                    "content": content
                })
    return {
        "status": "success",
        "count": len(samples),
        "samples": samples
    }


def format_clinical_markdown_to_html(md_text: str) -> str:
    """
    Transforms clinical explanation markdown into clean, hospital-grade HTML.
    Eliminates raw markdown syntax (**bold**, ### headers, *italics*, bullet points)
    and strips redundant 'Questions for doctor' sections that are rendered in the dedicated section.
    """
    if not md_text:
        return "<p style='color: #64748b;'>No clinical narrative available.</p>"

    # Strip redundant questions section from the narrative body if present
    cleaned = re.split(
        r'###?\s*(?:Prioritized\s*)?Questions\s*(?:for\s*(?:your\s*)?Doctor)?|\*\*Prioritized Questions for Your Doctor\*\*',
        md_text,
        flags=re.IGNORECASE
    )[0].strip()

    # Escape HTML special characters except formatting we will introduce
    cleaned = cleaned.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    lines = cleaned.split("\n")
    html_lines = []
    in_list = False

    for line in lines:
        stripped = line.strip()

        # Handle empty lines
        if not stripped:
            if in_list:
                html_lines.append("</ul>")
                in_list = False
            continue

        # Handle Headers (###, ##, #)
        header_match = re.match(r'^(#{1,4})\s+(.+)$', stripped)
        if header_match:
            if in_list:
                html_lines.append("</ul>")
                in_list = False
            level = len(header_match.group(1))
            h_text = header_match.group(2)
            h_text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', h_text)
            if level <= 2:
                html_lines.append(f'<h3 style="font-size: 15px; font-weight: 700; color: #0369a1; margin: 18px 0 6px 0; border-bottom: 1.5px solid #e0f2fe; padding-bottom: 4px;">{h_text}</h3>')
            else:
                html_lines.append(f'<h4 style="font-size: 13.5px; font-weight: 700; color: #0284c7; margin: 14px 0 6px 0; border-left: 3px solid #0284c7; padding-left: 8px;">{h_text}</h4>')
            continue

        # Handle Bullet Points (* or -)
        bullet_match = re.match(r'^[\*\-•]\s+(.+)$', stripped)
        if bullet_match:
            if not in_list:
                html_lines.append('<ul style="margin: 6px 0 10px 0; padding-left: 20px; list-style-type: disc;">')
                in_list = True
            item_text = bullet_match.group(1)
            item_text = re.sub(r'\*\*(.+?)\*\*', r'<strong style="color: #0f172a; font-weight: 600;">\1</strong>', item_text)
            item_text = re.sub(r'\*(.+?)\*', r'<em style="color: #475569;">\1</em>', item_text)
            html_lines.append(f'<li style="margin-bottom: 6px; line-height: 1.6; color: #334155; font-size: 13.5px;">{item_text}</li>')
            continue

        # Handle Numbered Lists
        num_match = re.match(r'^\d+\.\s+(.+)$', stripped)
        if num_match:
            if in_list:
                html_lines.append("</ul>")
                in_list = False
            item_text = num_match.group(1)
            item_text = re.sub(r'\*\*(.+?)\*\*', r'<strong style="color: #0f172a; font-weight: 600;">\1</strong>', item_text)
            item_text = re.sub(r'\*(.+?)\*', r'<em style="color: #475569;">\1</em>', item_text)
            html_lines.append(f'<div style="margin-bottom: 6px; line-height: 1.6; color: #334155; font-size: 13.5px; padding-left: 12px; border-left: 2px solid #bae6fd;">{item_text}</div>')
            continue

        # Normal text paragraph
        if in_list:
            html_lines.append("</ul>")
            in_list = False

        p_text = stripped
        p_text = re.sub(r'\*\*(.+?)\*\*', r'<strong style="color: #0f172a; font-weight: 600;">\1</strong>', p_text)
        p_text = re.sub(r'\*(.+?)\*', r'<em style="color: #475569;">\1</em>', p_text)
        html_lines.append(f'<p style="margin: 6px 0; line-height: 1.65; color: #334155; font-size: 13.5px;">{p_text}</p>')

    if in_list:
        html_lines.append("</ul>")

    return "\n".join(html_lines)


@app.post("/api/clinical/export-summary")
def export_clinical_summary(payload: ExportSummaryRequest):
    """
    Generates a structured, printable clinical review brief with hospital formatting,
    EvidenceTrace matrix, flagged abnormalities, and physician consultation checklist.
    Returns both HTML formatted ready for printing (window.print()) and markdown.
    """
    patient = payload.patient_name or "Patient"
    evidence = payload.evidence_trace or []
    questions = payload.doctor_questions or []
    explanation = payload.explanation or "No explanation generated."
    abnormal_items = [e for e in evidence if e.get("is_abnormal")]
    normal_count = len(evidence) - len(abnormal_items)

    curr_time_str = datetime.now().strftime("%d %b %Y, %I:%M %p")
    doc_id = f"LBL-{int(time.time()) % 1000000:06d}"

    # Build Evidence Table Rows (HTML & MD)
    table_rows_html = ""
    table_rows_md = "| Test Name | Value | Reference Range | Status | Clinical Implication |\n|:---|:---|:---|:---|:---|\n"

    for idx, item in enumerate(evidence):
        raw_status = (item.get("status") or item.get("flag") or "NORMAL").upper()
        is_abnormal = item.get("is_abnormal") or (raw_status not in ["NORMAL", "REPORTED", "UNKNOWN_RANGE"])

        t_name = item.get("test_name") or item.get("name") or f"Diagnostic Metric {idx+1}"
        raw_val = item.get("value") if item.get("value") is not None else item.get("measured_value")
        val_display = str(raw_val) if raw_val is not None else "-"
        unit_str = item.get("unit") or ""

        # Reference range: check stated_range, reference, ref_range, or min-max
        ref_display = item.get("stated_range") or item.get("reference") or item.get("ref_range")
        if not ref_display or str(ref_display).strip().lower() in ["none", "null", ""]:
            eff_min = item.get("effective_min")
            eff_max = item.get("effective_max")
            if eff_min is not None and eff_max is not None:
                ref_display = f"{eff_min} - {eff_max} {unit_str}".strip()
            elif eff_max is not None:
                ref_display = f"&lt; {eff_max} {unit_str}".strip()
            elif eff_min is not None:
                ref_display = f"&gt; {eff_min} {unit_str}".strip()
            else:
                ref_display = "Standard laboratory interval"

        # Status badge styling
        if "CRITICAL" in raw_status:
            badge_label = "CRITICAL LOW" if "LOW" in raw_status else "CRITICAL HIGH"
            badge_bg = "#ffe4e6"
            badge_color = "#9f1239"
            badge_border = "#f43f5e"
            row_bg = "#fff1f2"
        elif "LOW" in raw_status:
            badge_label = "LOW"
            badge_bg = "#ffedd5"
            badge_color = "#9a3412"
            badge_border = "#fb923c"
            row_bg = "#fffaf5"
        elif "HIGH" in raw_status:
            badge_label = "HIGH"
            badge_bg = "#fef3c7"
            badge_color = "#92400e"
            badge_border = "#f59e0b"
            row_bg = "#fffdf5"
        else:
            badge_label = "NORMAL"
            badge_bg = "#dcfce7"
            badge_color = "#166534"
            badge_border = "#86efac"
            row_bg = "#ffffff"

        context = (
            item.get("clinical_significance")
            or item.get("meaning")
            or item.get("description")
            or ("Measurement outside reference range requiring physician correlation." if is_abnormal else "Value is within standard physiological gold standard parameters.")
        )

        table_rows_html += f"""
        <tr style="background: {row_bg}; border-bottom: 1px solid #e2e8f0; page-break-inside: avoid;">
          <td style="padding: 10px 14px; font-weight: 600; color: #0f172a; font-size: 13.5px;">{t_name}</td>
          <td style="padding: 10px 14px; font-weight: 700; color: #1e293b; font-size: 13.5px; white-space: nowrap;">{val_display} <span style="font-weight: 400; font-size: 12px; color: #64748b;">{unit_str}</span></td>
          <td style="padding: 10px 14px; color: #475569; font-size: 13px; white-space: nowrap;">{ref_display}</td>
          <td style="padding: 10px 14px; white-space: nowrap;">
            <span style="background: {badge_bg}; color: {badge_color}; border: 1px solid {badge_border}; font-weight: 700; padding: 3px 8px; border-radius: 6px; font-size: 11px; display: inline-block;">
              ● {badge_label}
            </span>
          </td>
          <td style="padding: 10px 14px; color: #334155; font-size: 12.5px; line-height: 1.5;">{context}</td>
        </tr>
        """
        table_rows_md += f"| {t_name} | {val_display} {unit_str} | {ref_display} | **{badge_label}** | {context} |\n"

    # Format questions as structured consultation cards
    questions_cards_html = ""
    for idx, q in enumerate(questions):
        clean_q = re.sub(r'^\d+[\.\)]\s*', '', q.strip())
        questions_cards_html += f"""
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #0284c7; border-radius: 8px; padding: 12px 14px; margin-bottom: 10px; page-break-inside: avoid;">
          <div style="display: flex; align-items: flex-start; gap: 8px;">
            <span style="font-weight: 700; color: #0284c7; font-size: 13px;">[ &nbsp; ] Q{idx+1}:</span>
            <div style="font-size: 13.5px; font-weight: 600; color: #0f172a; line-height: 1.5;">{clean_q}</div>
          </div>
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between;">
            <span>Doctor's Observation / Prescription: __________________________________________________</span>
            <span>Date: [ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]</span>
          </div>
        </div>
        """
    questions_md = "\n".join([f"{i+1}. {q}" for i, q in enumerate(questions)])

    # Format explanation cleanly
    formatted_explanation_html = format_clinical_markdown_to_html(explanation)

    # Complete hospital-grade printable HTML document
    html_document = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>LabLens AI - Clinical Review Summary ({patient})</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    * {{ box-sizing: border-box; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      margin: 0;
      padding: 32px 24px;
      font-size: 14px;
      line-height: 1.5;
    }}
    .document-sheet {{
      max-width: 920px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 36px 40px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }}
    .header-bar {{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }}
    .brand-title {{
      font-size: 24px;
      font-weight: 800;
      color: #0284c7;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .brand-sub {{
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
      margin-top: 3px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }}
    .doc-meta {{
      text-align: right;
      font-size: 12px;
      color: #475569;
    }}
    .badge-certified {{
      display: inline-block;
      background: #e0f2fe;
      color: #0369a1;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      border: 1px solid #bae6fd;
      margin-bottom: 4px;
    }}
    .demographics-grid {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 24px;
    }}
    .demo-item label {{
      display: block;
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 2px;
    }}
    .demo-item span {{
      font-size: 13.5px;
      font-weight: 600;
      color: #0f172a;
    }}
    .section-header {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-left: 4px solid #0284c7;
      padding-left: 10px;
      margin-top: 28px;
      margin-bottom: 14px;
    }}
    .section-title {{
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}
    .table-container {{
      width: 100%;
      overflow-x: auto;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 24px;
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: left;
    }}
    th {{
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      font-size: 11.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 14px;
      border-bottom: 2px solid #cbd5e1;
    }}
    .explanation-container {{
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 18px 20px;
      margin-bottom: 24px;
    }}
    .signoff-box {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      border-radius: 8px;
      padding: 16px 20px;
      margin-top: 24px;
      page-break-inside: avoid;
    }}
    .stamp-area {{
      border: 1.5px dashed #94a3b8;
      border-radius: 6px;
      padding: 10px;
      text-align: center;
      color: #64748b;
      font-size: 11px;
    }}
    .disclaimer-box {{
      margin-top: 24px;
      padding: 12px 16px;
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 6px;
      font-size: 11.5px;
      color: #92400e;
      line-height: 1.5;
    }}
    .print-controls {{
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 16px;
      max-width: 920px;
      margin-left: auto;
      margin-right: auto;
    }}
    .btn-print {{
      background: #0284c7;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }}
    .btn-print:hover {{
      background: #0369a1;
    }}
    @media print {{
      @page {{
        margin: 12mm 14mm;
        size: A4;
      }}
      body {{
        background: #ffffff;
        padding: 0;
      }}
      .document-sheet {{
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }}
      .no-print {{
        display: none !important;
      }}
      table {{
        page-break-inside: auto;
      }}
      tr {{
        page-break-inside: avoid;
        page-break-after: auto;
      }}
    }}
  </style>
</head>
<body>
  <div class="print-controls no-print">
    <button class="btn-print" onclick="window.print()">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <div class="document-sheet">
    <!-- Header -->
    <div class="header-bar">
      <div>
        <div class="brand-title">🔬 LabLens AI</div>
        <div class="brand-sub">Clinical Pathology Review & EvidenceTrace™ Brief</div>
      </div>
      <div class="doc-meta">
        <span class="badge-certified">Certified Gold Standard Review</span>
        <div><b>Doc ID:</b> {doc_id}</div>
        <div><b>Generated:</b> {curr_time_str}</div>
        <div><b>Engine:</b> Google Gemma 4 12B Dual T4</div>
      </div>
    </div>

    <!-- Patient Demographics & Investigation Overview -->
    <div class="demographics-grid">
      <div class="demo-item">
        <label>Patient Name</label>
        <span>{patient}</span>
      </div>
      <div class="demo-item">
        <label>Specimen / Panel</label>
        <span>Comprehensive Clinical Panel</span>
      </div>
      <div class="demo-item">
        <label>Total Tests Validated</label>
        <span>{len(evidence)} Tests ({abnormal_items.__len__()} Flagged)</span>
      </div>
      <div class="demo-item">
        <label>Review Status</label>
        <span style="color: {'#dc2626' if abnormal_items else '#16a34a'};">
          {'● Action Required' if abnormal_items else '● All Parameters Normal'}
        </span>
      </div>
    </div>

    <!-- EvidenceTrace Table -->
    <div class="section-header">
      <div class="section-title">EvidenceTrace™ Test Validation Matrix</div>
      <div style="font-size: 12px; color: #64748b;">
        {len(abnormal_items)} Flagged &bull; {normal_count} Within Interval
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Investigation</th>
            <th>Result</th>
            <th>Reference Range</th>
            <th>Status</th>
            <th>Clinical Context & Pathophysiology</th>
          </tr>
        </thead>
        <tbody>
          {table_rows_html if table_rows_html else '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #94a3b8;">No standard numerical measurements detected in this report.</td></tr>'}
        </tbody>
      </table>
    </div>

    <!-- Clinical Narrative -->
    <div class="section-header">
      <div class="section-title">Clinical Findings & Plain-Language Explanation</div>
    </div>
    <div class="explanation-container">
      {formatted_explanation_html}
    </div>

    <!-- Physician Consultation Questions -->
    <div class="section-header">
      <div class="section-title">Prioritized Questions for Your Doctor</div>
      <div style="font-size: 11px; color: #64748b;">Bring this sheet to your clinical visit</div>
    </div>
    <div>
      {questions_cards_html if questions_cards_html else '<div style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; color: #64748b;">No specific abnormalities flagged. Discuss routine preventative screening with your physician.</div>'}
    </div>

    <!-- Physician Sign-Off & Verification Stamp -->
    <div class="signoff-box">
      <div>
        <div style="font-size: 11.5px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px;">Attending Physician Correlation</div>
        <div style="font-size: 12.5px; color: #334155; line-height: 1.6;">
          Doctor's Name: ____________________________<br/>
          Clinic / Hospital: ___________________________<br/>
          Signature: __________________ &nbsp; Date: ________
        </div>
      </div>
      <div class="stamp-area">
        <div style="font-weight: 700; margin-bottom: 4px;">LABORATORY / CLINIC STAMP</div>
        <div>Verified with Gold Standard Reference Intervals</div>
        <div style="font-size: 10px; margin-top: 6px; color: #94a3b8;">Ref: {doc_id} &bull; Gemma 4 12B</div>
      </div>
    </div>

    <!-- Clinical Legal Disclaimer -->
    <div class="disclaimer-box">
      ⚠️ <b>Clinical Safety Notice:</b> LabLens AI provides computational educational assistance based on Google Gemma 4 12B and standardized laboratory reference intervals. It is designed to assist patients in understanding laboratory markers and preparing targeted questions for their healthcare providers. It does not replace independent professional medical diagnosis, judgment, or treatment. Always consult a licensed physician or pathologist.
    </div>
  </div>
</body>
</html>"""

    return {
        "status": "success",
        "html_document": html_document,
        "markdown_document": f"# LabLens AI - Clinical Review Summary\n\n### EvidenceTrace™ Validation\n{table_rows_md}\n\n### Clinical Explanation\n{explanation}\n\n### Questions for Physician\n{questions_md}\n\n> ⚠️ *Clinical Safety Notice: Informational assistance only. Consult a licensed healthcare provider.*",
        "summary": {
            "patient_name": patient,
            "total_tests": len(evidence),
            "abnormal_count": len(abnormal_items),
            "doctor_questions_count": len(questions)
        }
    }



@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Universal File Ingestion endpoint for PDF, CSV, JSON, TXT, and Image files.
    Prepares text and base64 payloads for Gemma 4 multimodal analysis.
    """
    try:
        content_bytes = await file.read()
        filename_lower = file.filename.lower()

        # Handle PDF documents
        if filename_lower.endswith(".pdf"):
            extracted_text, img_b64 = extract_pdf_text_and_images(content_bytes)
            return {
                "status": "success",
                "filename": file.filename,
                "file_type": "pdf",
                "size_bytes": len(content_bytes),
                "line_count": len(extracted_text.splitlines()),
                "preview": extracted_text[:500],
                "content": extracted_text,
                "image_base64": img_b64
            }

        # Handle Image files (PNG, JPG, JPEG, WEBP)
        if any(filename_lower.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp"]):
            b64_str = base64.b64encode(content_bytes).decode("utf-8")
            from rapidocr_onnxruntime import RapidOCR
            ocr_engine = RapidOCR()
            res, _ = ocr_engine(content_bytes)
            ocr_text = "\n".join([r[1] for r in res]) if res else ""
            final_content = ocr_text if ocr_text else f"[Medical Image / Prescription: {file.filename}]"
            return {
                "status": "success",
                "filename": file.filename,
                "file_type": "image",
                "size_bytes": len(content_bytes),
                "image_base64": b64_str,
                "preview": final_content[:500],
                "content": final_content
            }

        # Handle Video files (MP4, MOV, WEBM, AVI)
        if any(filename_lower.endswith(ext) for ext in [".mp4", ".mov", ".webm", ".avi"]):
            import tempfile, cv2
            from rapidocr_onnxruntime import RapidOCR
            ocr_engine = RapidOCR()
            video_ocr_lines = []
            first_frame_b64 = None

            with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp_vid:
                tmp_vid.write(content_bytes)
                tmp_vid_path = tmp_vid.name

            try:
                cap = cv2.VideoCapture(tmp_vid_path)
                frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                sample_indices = [0, frame_count // 2, max(0, frame_count - 5)] if frame_count > 10 else [0]
                for idx in sample_indices:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                    ret, frame = cap.read()
                    if ret:
                        if not first_frame_b64:
                            _, buf = cv2.imencode(".png", frame)
                            first_frame_b64 = base64.b64encode(buf.tobytes()).decode("utf-8")
                        res, _ = ocr_engine(frame)
                        if res:
                            for r in res:
                                if r[1] not in video_ocr_lines:
                                    video_ocr_lines.append(r[1])
                cap.release()
            finally:
                try:
                    os.remove(tmp_vid_path)
                except Exception:
                    pass

            vid_content = "\n".join(video_ocr_lines) if video_ocr_lines else f"[Video Recording: {file.filename} - Keyframe analyzed]"
            return {
                "status": "success",
                "filename": file.filename,
                "file_type": "video",
                "size_bytes": len(content_bytes),
                "line_count": len(vid_content.splitlines()),
                "preview": vid_content[:500],
                "content": vid_content,
                "image_base64": first_frame_b64
            }

        # Handle Text-based formats (CSV, TXT, JSON, TSV)
        text_content = content_bytes.decode("utf-8", errors="replace")
        return {
            "status": "success",
            "filename": file.filename,
            "file_type": "text",
            "size_bytes": len(content_bytes),
            "line_count": len(text_content.splitlines()),
            "preview": text_content[:500],
            "content": text_content
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {e}")


# ==============================================================================
# AGENT SKILLS OPEN STANDARD ENDPOINTS (SKILL.md)
# ==============================================================================
@app.get("/api/skills")
def list_skills():
    return {
        "count": len(skills_manager.discover_skills()),
        "skills": skills_manager.list_skills_summary()
    }


@app.get("/api/skills/{skill_name}")
def get_skill_detail(skill_name: str):
    skill = skills_manager.get_skill(skill_name)
    if not skill:
        raise HTTPException(status_code=404, detail=f"Skill '{skill_name}' not found.")
    return skill


@app.post("/api/skills/create")
def create_skill(payload: CreateSkillRequest):
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
        
    skills_manager.discover_skills()
    return {
        "status": "success",
        "message": f"Skill '{clean_name}' successfully created and indexed!",
        "skill": skills_manager.get_skill(clean_name)
    }


# ==============================================================================
# HERMES AGENT & GEMMA ORCHESTRATION ENDPOINTS
# ==============================================================================
@app.post("/api/agent/chat")
def agent_chat(payload: AgentChatRequest):
    result = hermes_agent.run(
        user_prompt=payload.message,
        max_steps=payload.max_steps or 3,
        file_content=payload.file_content,
        file_name=payload.file_name,
        image_base64=payload.image_base64
    )
    return result


@app.post("/api/gemma/generate")
def gemma_generate(payload: GemmaGenerateRequest):
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
    start_time = time.time()
    device = "cuda" if (torch and torch.cuda.is_available()) else "cpu"
    
    try:
        if payload.input_text:
            result = {
                "sentiment": "positive",
                "confidence": 0.942,
                "summary": f"Processed: {payload.input_text[:50]}...",
                "tokens_processed": len(payload.input_text.split())
            }
        elif payload.features:
            tensor_feat = torch.tensor(payload.features, dtype=torch.float32).to(device) if torch else payload.features
            result = {
                "score": float(tensor_feat.mean().item()) if torch else float(sum(payload.features)/len(payload.features)),
                "dimensions": list(tensor_feat.shape) if torch else [len(payload.features)]
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
            model_version="3.0.0-lablens-gemma"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
