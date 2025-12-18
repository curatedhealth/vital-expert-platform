"""
AgentFactory: hydrate agents from DB using archetype_code -> class mapping.
"""

import asyncio
from typing import Any, Dict, Optional, Type

from agents.base_agent import AgentConfig, BaseAgent
from agents.orchestrators.l1_master import L1MasterOrchestrator
from agents.experts.l2_domain_lead import L2DomainLead
from agents.specialists.l3_context_specialist import L3ContextSpecialist
from agents.specialists.l3_domain_analyst import L3DomainAnalyst
from agents.workers.l4_evidence import L4EvidenceSynthesizer
from agents.workers.l4_data_processor import L4DataProcessor
from agents.tools.tool_registry import ToolRegistry


class L5ToolRunner(BaseAgent):
    """
    Lightweight wrapper to execute deterministic L5 tools via registry.
    """

    def __init__(self, config: AgentConfig, registry: Optional[ToolRegistry] = None):
        super().__init__(config)
        self.registry = registry or ToolRegistry()

    async def execute(self, task: str, params: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        tool_id = params.get("tool_id") or task
        allowed = self.get_allowed_tools()
        if allowed and tool_id not in allowed:
            raise ValueError(f"Tool {tool_id} not in allowed list for agent {self.config.id}")
        result = await self.registry.execute_tool(tool_id, params)
        citations = []
        data = result.get("data") if isinstance(result, dict) else None
        if data and isinstance(data, dict):
            citations = data.get("citations", [])
        return {"output": result, "citations": citations, "tool_id": tool_id}


ARCHETYPE_MAP: Dict[str, Type] = {
    "ARCH_ORCHESTRATOR": L1MasterOrchestrator,
    "ARCH_REVIEWER": L2DomainLead,
    "ARCH_STRATEGIST": L3ContextSpecialist,
    "ARCH_ANALYST": L3DomainAnalyst,
    "ARCH_RETRIEVER": L4EvidenceSynthesizer,
    "ARCH_PROCESSOR": L4DataProcessor,
    "ARCH_TOOL": L5ToolRunner,
}

# Fallback mapping: infer archetype from agent level when archetype_code is null
# This allows existing agents without archetype_code to work properly
LEVEL_TO_ARCHETYPE: Dict[str, str] = {
    # L1 Masters → Orchestrators
    "L1": "ARCH_ORCHESTRATOR",
    "MASTER": "ARCH_ORCHESTRATOR",
    # L2 Experts → Domain Leads (default for domain expertise)
    "L2": "ARCH_REVIEWER",
    "EXPERT": "ARCH_REVIEWER",
    # L3 Specialists → Context Specialists
    "L3": "ARCH_STRATEGIST",
    "SPECIALIST": "ARCH_STRATEGIST",
    # L4 Workers → Evidence Synthesizers
    "L4": "ARCH_RETRIEVER",
    "WORKER": "ARCH_RETRIEVER",
    # L5 Tools → Tool Runners
    "L5": "ARCH_TOOL",
    "TOOL": "ARCH_TOOL",
}


class AgentFactory:
    def __init__(self, db_client, tool_registry: Optional[ToolRegistry] = None):
        """
        Args:
            db_client: async-aware repo or Supabase client. Must support one of:
                - get_agent_by_id(agent_id)
                - fetch_agent(agent_id)
                - supabase table API (table/from_)
        """
        self.db = db_client
        self.tool_registry = tool_registry or ToolRegistry()

    async def load_agent(self, agent_id: str, overrides: Optional[Dict[str, Any]] = None, health_check: bool = True):
        """
        1) Fetch agent row (archetype_code, config, metadata).
        2) Map to class and instantiate with merged config + overrides.
        3) Validate allowed tools (optional).

        If archetype_code is null, infers from agent level using LEVEL_TO_ARCHETYPE mapping.
        Uses level_code (L1, L2, etc.) or level name (Expert, Master, etc.) from agent_levels table.
        """
        row = await self._fetch_agent(agent_id)
        archetype = row.get("archetype_code")

        # Smart fallback: infer archetype from level when archetype_code is null
        if not archetype:
            # Priority: level_code (L1, L2) > level (Expert, Master) > default
            level_code = row.get("level_code") or ""  # e.g., "L1", "L2"
            level_name = row.get("level") or ""  # e.g., "Expert", "Master"

            # Try level_code first (most reliable)
            if level_code:
                archetype = LEVEL_TO_ARCHETYPE.get(level_code.upper())

            # Fall back to level name
            if not archetype and level_name:
                archetype = LEVEL_TO_ARCHETYPE.get(level_name.upper())

            # Default to L2 Expert (ARCH_REVIEWER) for Ask Expert service
            if not archetype:
                archetype = "ARCH_REVIEWER"

        cls = ARCHETYPE_MAP.get(archetype)
        if cls is None:
            raise ValueError(f"No class mapped for archetype_code={archetype}")

        cfg = AgentConfig.from_row(row, overrides=overrides)

        allowed_tools = self._translate_tools(cfg.allowed_tools)
        cfg.allowed_tools = allowed_tools

        if health_check and allowed_tools:
            for tool_id in allowed_tools:
                self.tool_registry.get_tool(tool_id)  # raises if unknown

        agent = cls(cfg) if cls is not L5ToolRunner else cls(cfg, registry=self.tool_registry)
        return agent

    async def _fetch_agent(self, agent_id: str) -> Dict[str, Any]:
        if not self.db:
            raise NotImplementedError("No db_client provided for AgentFactory")

        # Async repo support
        if hasattr(self.db, "get_agent_by_id"):
            return await self.db.get_agent_by_id(agent_id)

        if hasattr(self.db, "fetch_agent"):
            return await self.db.fetch_agent(agent_id)

        # Supabase python client (sync) support
        if hasattr(self.db, "table") or hasattr(self.db, "from_"):
            def _sync_fetch():
                client = self.db
                # Join with agent_levels to get level name for archetype resolution
                select_fields = "*,agent_levels(id,name,level_number)"
                if hasattr(client, "table"):
                    query = client.table("agents").select(select_fields).eq("id", agent_id).single()
                else:
                    query = client.from_("agents").select(select_fields).eq("id", agent_id).single()
                res = query.execute()
                data = getattr(res, "data", None) or getattr(res, "model", None) or {}
                # Supabase may wrap single in list
                if isinstance(data, list) and data:
                    data = data[0]

                # Extract level name from joined agent_levels for archetype resolution
                agent_levels = data.get("agent_levels") if isinstance(data, dict) else None
                if agent_levels and isinstance(agent_levels, dict):
                    level_name = agent_levels.get("name", "")
                    level_number = agent_levels.get("level_number")
                    # Add level fields that LEVEL_TO_ARCHETYPE expects
                    data["level"] = level_name  # e.g., "Expert", "Master", "Specialist"
                    data["level_number"] = level_number  # e.g., 1, 2, 3, 4, 5
                    # Also add L-prefixed version for flexibility
                    if level_number:
                        data["level_code"] = f"L{level_number}"  # e.g., "L1", "L2"

                return data

            return await asyncio.to_thread(_sync_fetch)

        raise NotImplementedError("db_client missing get_agent_by_id/fetch_agent or supabase table/from_")

    @staticmethod
    def _translate_tools(allowed_tools: Optional[list]) -> Optional[list]:
        if not allowed_tools:
            return allowed_tools

        mapping = {
            "pubmed": "L5-PM",
            "clinicaltrials": "L5-CT",
            "openfda": "L5-OPENFDA",
            "web": "L5-WEB",
            "web_search": "L5-WEB",
            "rag": "L5-RAG",
            "calculator": "L5-CALC",
            "validator": "L5-FMT",
            "formatter": "L5-FMT",
            "visualizer": "L5-VIZ",
        }

        translated = []
        for tool in allowed_tools:
            translated.append(mapping.get(tool, tool))

        seen = set()
        unique = []
        for t in translated:
            if t in seen:
                continue
            seen.add(t)
            unique.append(t)
        return unique
