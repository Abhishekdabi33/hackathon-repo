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
    - Tool Orchestration & Multimodal Output Execution (Image, Diagram, Telemetry)
    - Dynamic Agent Skill (SKILL.md) Activation
    - Execution History & Memory Traces
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
            "diagram_generator": self._tool_diagram_generator
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
        return f"Activated Skill [{skill['name']} v{skill['version']}]:\nInstructions Summary:\n{skill['instructions'][:300]}..."

    def _tool_system_telemetry(self, query: str = "") -> str:
        """Returns hardware and GPU telemetry."""
        import torch
        cuda_ok = torch.cuda.is_available()
        gpu_name = torch.cuda.get_device_name(0) if cuda_ok else "N/A"
        return f"Telemetry: CUDA Available: {cuda_ok}, GPU: {gpu_name}, PyTorch Version: {torch.__version__}"

    def _tool_image_generator(self, prompt: str) -> str:
        """Generates high-resolution AI visual image markdown matching the user's brief."""
        clean_prompt = prompt.lower().replace("generate", "").replace("create", "").replace("an image of", "").replace("image of", "").replace("picture of", "").replace("draw", "").strip()
        encoded = urllib.parse.quote(clean_prompt or "futuristic artificial intelligence technology glowing network 8k resolution cinematic")
        image_url = f"https://image.pollinations.ai/prompt/{encoded}?width=1024&height=768&nologo=true&enhance=true&model=flux"
        return f"![{clean_prompt or 'AI Visual'}]({image_url})"

    def _tool_diagram_generator(self, topic: str) -> str:
        """Generates structured visual Mermaid architecture flowcharts."""
        clean_topic = topic.replace("diagram", "").replace("flowchart", "").strip() or "Hackathon Architecture"
        return (
            "```mermaid\n"
            "flowchart TD\n"
            f'    User["User Query: {clean_topic[:30]}"] --> Agent["Hermes Reasoning Engine"]\n'
            '    Agent --> Skills["SKILL.md Domain Rules"]\n'
            '    Agent --> Cloud["Kaggle 2x Tesla T4 GPUs (Gemma 2)"]\n'
            '    Cloud --> Output["Multimodal Delivery (PDF, Image, Markdown)"]\n'
            "```"
        )

    def run(self, user_prompt: str, max_steps: int = 3, file_content: Optional[str] = None, file_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes autonomous agent reasoning loop.
        Traces each Thought, Action, and Observation step.
        """
        start_time = time.time()
        steps = []
        available_skills = self.skills_manager.list_skills_summary()

        system_instruction = (
            "You are Hermes Agent, an autonomous reasoning agent.\n"
            "You have access to tools: 'calculator', 'skill_executor', 'system_telemetry'.\n"
            f"Available Agent Skills: {[s['name'] for s in available_skills]}.\n"
            "Format your thought process as: Thought -> Action -> Observation -> Final Answer."
        )

        # Context augmentation if file is attached
        effective_prompt = user_prompt
        if file_content:
            file_snippet = file_content[:1500] if len(file_content) > 1500 else file_content
            effective_prompt = (
                f"Attached File: {file_name or 'data_file'}\n"
                f"File Content Preview:\n```\n{file_snippet}\n```\n\n"
                f"User Instructions: {user_prompt}"
            )

        # Step 1: Analyze user request and detect appropriate skill or tool
        thought = f"Analyzing request: '{user_prompt}'."
        if file_name:
            thought += f" Ingested file attachment: '{file_name}'."
        thought += " Checking if an Agent Skill or tool is required."

        action = None
        action_input = None
        observation = None

        lower_prompt = user_prompt.lower()
        if any(w in lower_prompt for w in ["image", "picture", "photo", "draw", "visual", "illustration", "generate an image", "create an image"]):
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
        elif any(w in lower_prompt for w in ["api", "payload", "json", "endpoint"]):
            action = "skill_executor"
            action_input = "api-integrator"
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
            "action_input": action_input,
            "observation": observation
        })

        # Step 2: Final Synthesis using Gemma Client
        final_prompt = (
            f"User Query & Context:\n{effective_prompt}\n\n"
            f"Tool Executed: {action} with input '{action_input}'\n"
            f"Observation: {observation}\n"
            "Provide the final comprehensive response to the user."
        )

        gemma_response = self.client.generate(final_prompt, system_instruction=system_instruction)
        answer_text = gemma_response.get("text", "").strip()

        # Seamlessly inject generated multimodal artifact if not already in answer
        if action == "image_generator" and observation and "![" in observation:
            if "![" not in answer_text:
                answer_text = f"{observation}\n\n{answer_text}"
        elif action == "diagram_generator" and observation and "```mermaid" in observation:
            if "```mermaid" not in answer_text:
                answer_text = f"{answer_text}\n\n{observation}"

        # Clean fallback if model returned blank
        if not answer_text:
            if action == "image_generator":
                answer_text = f"{observation}\n\nHere is your generated visual asset based on: *{user_prompt}*."
            elif action == "diagram_generator":
                answer_text = f"Here is the generated architecture diagram for your request:\n\n{observation}"
            else:
                answer_text = f"Executed {action} successfully.\n\nObservation: {observation}"

        execution_record = {
            "query": user_prompt,
            "agent": "Hermes Agent Harness",
            "model_engine": gemma_response.get("model", "gemma"),
            "steps": steps,
            "final_answer": answer_text,
            "duration_ms": round((time.time() - start_time) * 1000, 2),
            "status": "completed"
        }

        self.history.append(execution_record)
        return execution_record

if __name__ == "__main__":
    agent = HermesAgent()
    print("Testing Hermes Agent...")
    res = agent.run("Can you check our system GPU and analyze 500 records?")
    print("Agent steps:", json.dumps(res["steps"], indent=2))
    print("Final answer preview:", res["final_answer"][:200])
