"""
Base agent with persona injection and config hydration.
DB supplies archetype_code + config (model, temperature, allowed_tools, metadata).
"""

from abc import ABC
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class AgentConfig(BaseModel):
    id: str
    name: str
    level_name: str = Field(default="agent")
    base_system_prompt: str = Field(default="")
    metadata: Dict[str, Any] = Field(default_factory=dict)
    model: Optional[str] = None
    temperature: Optional[float] = None
    allowed_tools: Optional[list] = None
    config_overrides: Dict[str, Any] = Field(default_factory=dict)

    @classmethod
    def from_row(cls, row: Dict[str, Any], overrides: Optional[Dict[str, Any]] = None) -> "AgentConfig":
        """
        Create AgentConfig from a DB row and optional overrides.

        The DB row is expected to contain:
        - archetype_code
        - config (JSONB)
        - metadata (JSONB) with persona data and agent_levels
        """
        config_json = row.get("config") or {}
        overrides = overrides or {}

        def pick(key: str, *sources):
            for source in sources:
                if isinstance(source, dict) and key in source and source[key] is not None:
                    return source[key]
            return None

        # Resolve level_name with smart fallbacks:
        # 1. level_name (explicit)
        # 2. level (e.g., "EXPERT", "SPECIALIST")
        # 3. archetype_code
        # 4. Default to "agent"
        level_name = (
            row.get("level_name")
            or row.get("level")
            or row.get("archetype_code")
            or "agent"
        )

        return cls(
            id=row.get("id"),
            name=row.get("name", row.get("archetype_code", "agent")),
            level_name=level_name,
            base_system_prompt=row.get("system_prompt", ""),
            metadata=row.get("metadata") or {},
            model=pick("model", overrides, config_json) or row.get("base_model"),
            temperature=pick("temperature", overrides, config_json),
            allowed_tools=pick("allowed_tools", overrides, config_json),
            config_overrides=overrides,
        )


class BaseAgent(ABC):
    def __init__(self, config: AgentConfig):
        self.config = config
        self.years_exp, self.comm_style, self.level_number = self._resolve_persona(config.metadata)
        self.system_prompt = self._build_system_prompt(config.base_system_prompt)

    def _build_system_prompt(self, base_prompt: str) -> str:
        persona = f"""
### YOUR PERSONA
- Experience Level: {self.years_exp}+ years.
- Communication Style: {self.comm_style}.
- Role: You are a {self.config.level_name}.
"""
        if self.level_number and self.level_number in (1, 2):
            persona += "\n- Authority: You make final decisions. Focus on strategy and evidence."
        return f"{base_prompt}\n\n{persona}".strip()

    def get_model_params(self) -> Dict[str, Any]:
        return {
            "model": self.config.config_overrides.get("model") or self.config.model,
            "temperature": self.config.config_overrides.get("temperature") or self.config.temperature,
        }

    def get_allowed_tools(self) -> Optional[list]:
        return self.config.config_overrides.get("allowed_tools") or self.config.allowed_tools

    @staticmethod
    def _resolve_persona(metadata: Dict[str, Any]) -> tuple:
        """
        Resolve persona attributes from metadata/agent_levels.
        Supports legacy keys and agent_levels[{level_number, min_years_experience, default_comm_style}].
        """
        years = metadata.get("years_of_experience")
        comm_style = metadata.get("communication_style")
        level_number = metadata.get("level_number")

        agent_levels = metadata.get("agent_levels") or []
        if agent_levels and isinstance(agent_levels, list):
            # choose highest level entry with level_number present
            sorted_levels = sorted(
                [lvl for lvl in agent_levels if isinstance(lvl, dict) and lvl.get("level_number") is not None],
                key=lambda x: x.get("level_number"),
                reverse=True,
            )
            if sorted_levels:
                top = sorted_levels[0]
                years = years or top.get("min_years_experience")
                comm_style = comm_style or top.get("default_comm_style")
                level_number = level_number or top.get("level_number")

        years = years or 3
        comm_style = comm_style or "Clear, structured"
        return years, comm_style, level_number
