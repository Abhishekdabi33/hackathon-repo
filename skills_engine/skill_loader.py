import os
import re
import yaml
from typing import Dict, List, Any, Optional

class SkillManager:
    """
    Implements the Agent Skill Open Standard and Progressive Disclosure pattern.
    - Startup: Discovers available skills and parses YAML frontmatter metadata.
    - Activation: Loads full SKILL.md body on-demand when matched.
    """
    def __init__(self, skills_dir: str = "skills"):
        self.skills_dir = skills_dir
        self._skills_cache: Dict[str, Dict[str, Any]] = {}
        self.discover_skills()

    def discover_skills(self) -> List[Dict[str, Any]]:
        """Scans directory and indexes YAML frontmatter without loading full bodies."""
        self._skills_cache.clear()
        if not os.path.exists(self.skills_dir):
            os.makedirs(self.skills_dir, exist_ok=True)
            return []

        discovered = []
        for item in os.listdir(self.skills_dir):
            item_path = os.path.join(self.skills_dir, item)
            skill_md_path = os.path.join(item_path, "SKILL.md")
            if os.path.isdir(item_path) and os.path.exists(skill_md_path):
                metadata = self._parse_frontmatter(skill_md_path)
                if metadata:
                    skill_name = metadata.get("name", item)
                    self._skills_cache[skill_name] = {
                        "name": skill_name,
                        "description": metadata.get("description", ""),
                        "version": metadata.get("version", "1.0.0"),
                        "tags": metadata.get("tags", []),
                        "file_path": skill_md_path
                    }
                    discovered.append(self._skills_cache[skill_name])
        return discovered

    def _parse_frontmatter(self, file_path: str) -> Optional[Dict[str, Any]]:
        """Extracts YAML frontmatter enclosed between triple hyphens."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
            if match:
                frontmatter_str = match.group(1)
                return yaml.safe_load(frontmatter_str)
        except Exception as e:
            print(f"Error parsing frontmatter in {file_path}: {e}")
        return None

    def get_skill(self, skill_name: str) -> Optional[Dict[str, Any]]:
        """Loads the full skill instructions on-demand (Progressive Disclosure)."""
        if skill_name not in self._skills_cache:
            return None

        skill_info = self._skills_cache[skill_name].copy()
        file_path = skill_info["file_path"]
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            # Strip YAML frontmatter to get instructions body
            body = re.sub(r"^---\s*\n.*?\n---\s*\n", "", content, flags=re.DOTALL).strip()
            skill_info["instructions"] = body
            return skill_info
        except Exception as e:
            print(f"Error reading skill {skill_name}: {e}")
            return None

    def list_skills_summary(self) -> List[Dict[str, Any]]:
        """Returns lightweight skill list for API consumers or agent context."""
        return [
            {
                "name": s["name"],
                "description": s["description"],
                "version": s["version"],
                "tags": s["tags"]
            }
            for s in self._skills_cache.values()
        ]

if __name__ == "__main__":
    manager = SkillManager()
    skills = manager.discover_skills()
    print("Discovered Skills:", [s["name"] for s in skills])
    if skills:
        sample = manager.get_skill(skills[0]["name"])
        print("Sample Skill Body Preview:", sample["instructions"][:150], "...")
