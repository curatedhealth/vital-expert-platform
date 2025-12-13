# PRODUCTION_TAG: PRODUCTION_CORE
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [agents.base_agent]
from __future__ import annotations

from agents.base_agent import AgentConfig


def make_config(agent_id: str, prompt: str) -> AgentConfig:
    return AgentConfig(
        id=agent_id,
        name=agent_id,
        base_system_prompt=prompt,
        metadata={},
    )
