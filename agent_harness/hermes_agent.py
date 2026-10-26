import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import re
import json
import time
import urllib.parse
from typing import Dict, List, Any, Optional
from skills_engine.skill_loader import SkillManager
from ai_engine.gemma_client import GemmaClient

class HermesAgent:
    """
    Hermes Autonomous Agent Harness.
    Implements:
    - ReAct (Reasoning + Acting) Agent Execution Loop
    - Tool Orchestration (Clinical Validator, Image/Mermaid Generator, Telemetry, Calculator)
    - Dynamic Agent Skill (SKILL.md) Progressive Disclosure
    - EvidenceTrace Grounding for LabLens AI Medical Understanding
    - Prompt-Driven Multi-Mode Delivery (Conversational Chat, Clinical Table, Doctor Prep)
    """
    def __init__(self, gemma_client: Optional[GemmaClient] = None, skills_manager: Optional[SkillManager] = None):
        self.client = gemma_client or GemmaClient()
        self.skills_manager = skills_manager or SkillManager()
        self.history: List[Dict[str, Any]] = []
        self.tools = {
            "calculator": self._tool_calculator,
            "skill_executor": self._tool_execute_skill,
            "system_telemetry": self._tool_system_telemetry,
            "image_generator": self._tool_image_generator,
            "diagram_generator": self._tool_diagram_generator,
            "clinical_validator": self._tool_clinical_validator
        }

    # Built-in Tools
    def _tool_calculator(self, expression: str) -> str:
        """Evaluates arithmetic expressions safely."""
        try:
            allowed = set("0123456789+-*/(). %")
            if not all(c in allowed for c in expression):
                return "Error: Invalid characters in arithmetic expression."
            result = eval(expression, {"__builtins__": None}, {})
            return f"Result: {result}"
        except Exception as e:
            return f"Calculation error: {e}"

    def _tool_execute_skill(self, skill_name: str) -> str:
        """Dynamically loads and activates an Agent Skill via SKILL.md progressive disclosure."""
        skill = self.skills_manager.get_skill(skill_name)
        if not skill:
            return f"Error: Skill '{skill_name}' not found. Available: {[s['name'] for s in self.skills_manager.discover_skills()]}"
        return f"Activated Skill [{skill['name']} v{skill['version']}]:\nInstructions Summary:\n{skill['instructions'][:350]}..."

    def _tool_clinical_validator(self, text_or_context: str) -> str:
        """Deterministically extracts and checks lab values against clinical reference ranges."""
        try:
            from backend.app.clinical_engine import clinical_validator
            items = clinical_validator.extract_from_text(text_or_context)
            if not items:
                return "No recognized laboratory measurements found in text."
            
            summary_lines = []
            abnormal = []
            for it in items:
                flag_str = f"[{it['flag'].upper()}]" if it['is_abnormal'] else "[NORMAL]"
                summary_lines.append(f"- {it['test_name']}: {it['value']} {it['unit']} (Ref: {it['stated_range']}) -> {flag_str}")
                if it['is_abnormal']:
                    abnormal.append(f"{it['test_name']} ({it['flag']})")
                    
            header = f"Validated {len(items)} lab test(s). Flags: {len(abnormal)} abnormal ({', '.join(abnormal) if abnormal else 'None'}).\n"
            return header + "\n".join(summary_lines)
        except Exception as e:
            return f"Clinical validation note: {e}"

    def _tool_system_telemetry(self, query: str = "") -> str:
        """Returns hardware and GPU telemetry."""
        import torch
        cuda_ok = torch.cuda.is_available() if torch else False
        gpu_name = torch.cuda.get_device_name(0) if cuda_ok else "N/A"
        return f"Telemetry: CUDA Available: {cuda_ok}, GPU: {gpu_name}, PyTorch Version: {getattr(torch, '__version__', 'N/A')}"

    def _tool_image_generator(self, prompt: str) -> str:
        """Generates high-resolution AI visual image markdown matching the user's brief."""
        clean_prompt = prompt.lower().replace("generate", "").replace("create", "").replace("an image of", "").replace("image of", "").replace("picture of", "").replace("draw", "").strip()
        encoded = urllib.parse.quote(clean_prompt or "futuristic artificial intelligence technology glowing network 8k resolution cinematic")
        image_url = f"https://image.pollinations.ai/prompt/{encoded}?width=1024&height=768&nologo=true&enhance=true&model=flux"
        return f"![{clean_prompt or 'AI Visual'}]({image_url})"

    def _tool_diagram_generator(self, topic: str) -> str:
        """Generates structured visual Mermaid architecture flowcharts."""
        clean_topic = topic.replace("diagram", "").replace("flowchart", "").strip() or "LabLens AI Architecture"
        return (
            "```mermaid\n"
            "flowchart TD\n"
            '    Report["Patient Medical Report / Image / Audio"] --> OCR["Multimodal Ingestion"]\n'
            '    OCR --> Engine["Deterministic Validation Engine"]\n'
            '    Engine --> Evidence["EvidenceTrace Matrix"]\n'
            '    Evidence --> Gemma["Google Gemma 4 12B Unified Multimodal"]\n'
            '    Gemma --> Output["Plain Chat / Clinical Table / Doctor Prep"]\n'
            "```"
        )

    def run(
        self,
        user_prompt: str,
        max_steps: int = 3,
        file_content: Optional[str] = None,
        file_name: Optional[str] = None,
        image_base64: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes autonomous agent reasoning loop.
        Traces each Thought, Action, and Observation step.
        """
        start_time = time.time()
        steps = []
        available_skills = self.skills_manager.list_skills_summary()

        system_instruction = (
            "You are LabLens AI powered by Google Gemma 4 12B, an expert clinical review assistant and medical report interpreter.\n"
            "Your objective: Interpret laboratory blood panels, pathology results, and clinical prescriptions into compassionate, crystal-clear, structured explanations.\n"
            "Formatting & Clinical Rules:\n"
            "1. STRUCTURE YOUR REPORT INTO 4 DISTINCT MARKDOWN SECTIONS:\n"
            "   ### 🩺 Executive Health Summary\n"
            "   (A reassuring 2-3 sentence overview translating findings into everyday words.)\n\n"
            "   ### 🔍 Key Laboratory Insights & Biological Impact\n"
            "   (For each flagged or abnormal test, explain: What is this marker? What biological role does it play? What does this low/high value imply?)\n\n"
            "   ### 🥗 Evidence-Based Lifestyle & Nutritional Considerations\n"
            "   (Safe, non-prescriptive supportive advice: e.g., dietary sources of iron/folate paired with Vitamin C, hydration, glycemic awareness.)\n\n"
            "   ### 📋 Prioritized Questions for Your Doctor\n"
            "   (3-5 specific, high-yield questions for the patient's next clinical consultation.)\n\n"
            "2. SAFETY: Never declare a definitive disease diagnosis or advise changing prescribed drugs. Always emphasize consulting a licensed physician.\n"
            "3. ZERO HALLUCINATIONS: Ground every single statement in the provided EvidenceTrace test ranges.\n"
            "4. OUTPUT ONLY THE POLISHED CLINICAL REVIEW. Do not include raw scratchpads or '**Thought:**' prefixes in the final output."
        )

        effective_prompt = user_prompt
        combined_text = user_prompt + ("\n" + file_content if file_content else "")
        if file_content:
            file_snippet = file_content[:2000] if len(file_content) > 2000 else file_content
            effective_prompt = (
                f"Attached File: {file_name or 'medical_report'}\n"
                f"File Content Preview:\n```\n{file_snippet}\n```\n\n"
                f"User Instructions: {user_prompt}"
            )

        # Step 1: Detect Intent & Trigger Tools
        thought = f"Analyzing request: '{user_prompt}'."
        if file_name:
            thought += f" Ingested document: '{file_name}'."

        action = None
        action_input = None
        observation = None

        lower_prompt = user_prompt.lower()
        lower_combined = combined_text.lower()

        # Clinical / Medical detection
        medical_keywords = [
            "report", "blood", "hemoglobin", "glucose", "cholesterol", "test", "lab", "doctor",
            "medicine", "prescription", "patient", "symptoms", "creatinine", "wbc", "platelet",
            "lft", "kft", "cbc", "lipid", "sugar", "thyroid", "tsh", "vitamin", "urine", "sgpt", "sgot"
        ]

        if any(w in lower_combined for w in medical_keywords) or file_content:
            thought += " Medical context detected. Executing deterministic Clinical Validator and EvidenceTrace."
            action = "clinical_validator"
            action_input = file_content or user_prompt
            observation = self._tool_clinical_validator(action_input)
            
            # Also activate clinical skill
            self._tool_execute_skill("clinical-report-analyst")

        elif any(w in lower_prompt for w in ["image", "picture", "photo", "draw", "visual", "illustration", "generate an image", "create an image"]):
            action = "image_generator"
            action_input = user_prompt
            observation = self._tool_image_generator(action_input)
        elif any(w in lower_prompt for w in ["diagram", "flowchart", "workflow", "architecture"]):
            action = "diagram_generator"
            action_input = user_prompt
            observation = self._tool_diagram_generator(action_input)
        elif any(w in lower_prompt for w in ["calculate", "math", "+", "-", "*", "/"]):
            math_match = re.search(r"[\d\s\+\-\*\/\(\)\.]+", user_prompt)
            if math_match and len(math_match.group(0).strip()) > 2:
                action = "calculator"
                action_input = math_match.group(0).strip()
                observation = self._tool_calculator(action_input)
        elif any(w in lower_prompt for w in ["data", "statistics", "analytics", "numbers"]):
            action = "skill_executor"
            action_input = "data-analyst"
            observation = self._tool_execute_skill(action_input)
        elif any(w in lower_prompt for w in ["gpu", "hardware", "cuda", "vram", "system"]):
            action = "system_telemetry"
            action_input = "gpu"
            observation = self._tool_system_telemetry(action_input)
        else:
            action = "skill_executor"
            action_input = "research-assistant"
            observation = self._tool_execute_skill(action_input)

        steps.append({
            "step": 1,
            "thought": thought,
            "action": action,
            "action_input": action_input[:200] if action_input else None,
            "observation": observation
        })

        # Step 2: Prompt-Driven Mode Determination for Gemma Synthesis
        mode_instruction = ""
        if any(w in lower_prompt for w in ["chat", "casual", "aam bhasha", "simple", "hindi", "plain text", "batayein", "batao"]):
            mode_instruction = (
                "MODE: Conversational Chat. Explain findings in everyday, empathetic, reassuring language. "
                "Avoid complex medical terminology where possible. If user asked in Hindi, respond in clean natural Hindi/Hinglish."
            )
        elif any(w in lower_prompt for w in ["doctor", "question", "ask doctor", "consult", "checklist", "puchu", "puchhe"]):
            mode_instruction = (
                "MODE: Doctor Consultation Preparation. Provide a prioritized checklist of 3-5 specific questions "
                "for the patient to ask their physician during their next visit, explaining why each question matters."
            )
        elif any(w in lower_prompt for w in ["table", "structured", "format", "summary", "evidence", "report", "clinical"]):
            mode_instruction = (
                "MODE: Structured Clinical Table & Summary. Include an EvidenceTrace Markdown table with columns: "
                "| Test Name | Observed Value | Stated Reference Range | Status | Clinical Meaning |"
            )
        else:
            mode_instruction = (
                "MODE: Comprehensive Medical Review. Provide a reassuring summary, highlight any abnormal test values with EvidenceTrace, "
                "and conclude with 3 suggested questions for the doctor and a clear educational disclaimer."
            )

        final_prompt = (
            f"User Query & Context:\n{effective_prompt}\n\n"
            f"Deterministic EvidenceTrace Findings:\n{observation}\n\n"
            f"Response Directive: {mode_instruction}\n\n"
            "Generate the final comprehensive medical explanation for the user."
        )

        gemma_response = self.client.generate(
            prompt=final_prompt,
            system_instruction=system_instruction,
            image_base64=image_base64
        )
        raw_answer = gemma_response.get("text", "").strip()

        # Clean raw internal thought scratchpads from user-facing answer
        clean_answer = raw_answer
        if "**Thought:**" in clean_answer:
            parts = clean_answer.split("**Thought:**", 1)
            remaining = parts[1].strip()
            # If there is a header or section separator
            for sep in ["### ", "## ", "**Clinical Summary", "1. ", "Executive Health Summary"]:
                if sep in remaining:
                    t_part, a_part = remaining.split(sep, 1)
                    clean_answer = sep + a_part
                    steps.append({"step": 2, "thought": t_part[:300].strip(), "action": "clinical_synthesis", "action_input": None, "observation": "Grounded medical insights synthesized."})
                    break

        answer_text = clean_answer.strip()

        # Seamlessly inject generated multimodal artifact if not already in answer
        if action == "image_generator" and observation and "![" in observation:
            if "![" not in answer_text:
                answer_text = f"{observation}\n\n{answer_text}"
        elif action == "diagram_generator" and observation and "```mermaid" in observation:
            if "```mermaid" not in answer_text:
                answer_text = f"{answer_text}\n\n{observation}"

        # Clean fallback if model returned blank
        if not answer_text:
            if action == "clinical_validator":
                answer_text = (
                    f"### Clinical Laboratory Analysis\n\n"
                    f"{observation}\n\n"
                    "All test values have been compared against clinical reference ranges. "
                    "Please review any flagged values with your healthcare provider."
                )
            elif action == "image_generator":
                answer_text = f"{observation}\n\nHere is your generated visual asset based on: *{user_prompt}*."
            elif action == "diagram_generator":
                answer_text = f"Here is the generated architecture diagram for your request:\n\n{observation}"
            else:
                answer_text = f"Executed {action} successfully.\n\nObservation: {observation}"

        execution_record = {
            "query": user_prompt,
            "agent": "Hermes Agent Harness",
            "model_engine": gemma_response.get("model", "gemma4:12b-instruct-q4_0"),
            "steps": steps,
            "final_answer": answer_text,
            "duration_ms": round((time.time() - start_time) * 1000, 2),
            "status": "completed"
        }

        self.history.append(execution_record)
        return execution_record

if __name__ == "__main__":
    agent = HermesAgent()
    print("Testing Hermes Agent with Clinical Validation...")
    res = agent.run("Fasting Blood Sugar: 142 mg/dL, Hemoglobin: 10.2 g/dL. What does this mean?")
    print("Agent steps:", json.dumps(res["steps"], indent=2))
    print("Final answer preview:\n", res["final_answer"][:300])
