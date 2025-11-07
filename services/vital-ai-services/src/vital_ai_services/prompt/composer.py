"""
Dynamic Agent Prompt Composer - Shared AI Service

TAG: SHARED_AI_SERVICES_LIBRARY

Automatically composes rich, structured system prompts from all agent dimensions:
- Agent identity (name, role, expertise)
- Capabilities & specializations
- Available tools
- RAG sources & knowledge domains
- Guardrails & compliance

Usage:
    from vital_ai_services.prompt import DynamicPromptComposer
    
    composer = DynamicPromptComposer(supabase_client)
    
    # Compose full system prompt for agent
    prompt_data = await composer.compose_agent_prompt(
        agent_id="agent-123",
        tenant_id="tenant-456"
    )
    
    # Get rendered prompt for LangGraph
    system_prompt = prompt_data["rendered_prompt"]
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import structlog

logger = structlog.get_logger()


class DynamicPromptComposer:
    """
    Composes dynamic agent prompts from structured data.
    
    TAG: DYNAMIC_PROMPT_COMPOSER
    """
    
    def __init__(self, supabase_client=None):
        """Initialize prompt composer."""
        self.supabase = supabase_client
        self._cache: Dict[str, Dict[str, Any]] = {}
        logger.info("✅ DynamicPromptComposer initialized")
    
    async def compose_agent_prompt(
        self,
        agent_id: str,
        tenant_id: Optional[str] = None,
        agent_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Compose full agent prompt from all dimensions.
        
        Args:
            agent_id: Agent identifier
            tenant_id: Tenant identifier
            agent_data: Optional pre-fetched agent data
            
        Returns:
            {
                "base_prompt": "User's input prompt",
                "enhanced_prompt": "Full composed prompt with all dimensions",
                "sections": {...},  # Individual sections
                "metadata": {...}
            }
        """
        try:
            # Fetch agent data if not provided
            if not agent_data:
                agent_data = await self._fetch_agent_data(agent_id, tenant_id)
            
            if not agent_data:
                return self._get_fallback_prompt()
            
            # Extract base prompt
            base_prompt = agent_data.get("system_prompt", "")
            
            # Compose sections
            sections = {
                "identity": self._compose_identity(agent_data),
                "capabilities": self._compose_capabilities(agent_data),
                "tools": self._compose_tools(agent_data),
                "knowledge": self._compose_knowledge(agent_data),
                "guidelines": self._compose_guidelines(agent_data),
                "behavior": self._compose_behavior(agent_data)
            }
            
            # Render full enhanced prompt
            enhanced_prompt = self._render_enhanced_prompt(base_prompt, sections)
            
            return {
                "base_prompt": base_prompt,
                "enhanced_prompt": enhanced_prompt,
                "sections": sections,
                "metadata": {
                    "agent_id": agent_id,
                    "agent_name": agent_data.get("name"),
                    "composed_at": datetime.utcnow().isoformat()
                }
            }
        
        except Exception as e:
            logger.error(f"Failed to compose agent prompt", error=str(e))
            return self._get_fallback_prompt()
    
    async def _fetch_agent_data(self, agent_id: str, tenant_id: Optional[str]) -> Dict[str, Any]:
        """Fetch agent data from database."""
        if not self.supabase:
            return {}
        
        try:
            result = await self.supabase.client.table('agents') \
                .select('*') \
                .eq('id', agent_id) \
                .single() \
                .execute()
            
            return result.data if result.data else {}
        
        except Exception as e:
            logger.error(f"Failed to fetch agent data", error=str(e))
            return {}
    
    def _compose_identity(self, agent_data: Dict[str, Any]) -> str:
        """Compose identity section."""
        role = agent_data.get("display_name", agent_data.get("name", "AI Assistant"))
        description = agent_data.get("description", "")
        expertise = agent_data.get("knowledge_domains", [])
        
        parts = [f"You are **{role}**."]
        
        if description:
            parts.append(description)
        
        if expertise:
            parts.append(f"\n**Areas of Expertise:** {', '.join(expertise)}")
        
        return " ".join(parts)
    
    def _compose_capabilities(self, agent_data: Dict[str, Any]) -> str:
        """Compose capabilities section."""
        capabilities = agent_data.get("capabilities", [])
        specializations = agent_data.get("specializations", [])
        
        if not capabilities and not specializations:
            return ""
        
        parts = ["## Capabilities\n\n**Core Skills:**"]
        
        if capabilities:
            parts.append("\n".join(f"- {cap}" for cap in capabilities))
        
        if specializations:
            parts.append("\n\n**Specializations:**")
            parts.append("\n".join(f"- {spec}" for spec in specializations))
        
        return "\n".join(parts)
    
    def _compose_tools(self, agent_data: Dict[str, Any]) -> str:
        """Compose tools section."""
        tools = agent_data.get("tool_configurations", {})
        
        if not tools or (isinstance(tools, dict) and not tools):
            return ""
        
        parts = ["## Available Tools\n"]
        
        if isinstance(tools, dict):
            for tool_name, tool_config in tools.items():
                parts.append(f"- **{tool_name}**: {tool_config.get('description', 'Available for use')}")
        elif isinstance(tools, list):
            for tool in tools:
                if isinstance(tool, dict):
                    parts.append(f"- **{tool.get('name', 'Tool')}**: {tool.get('description', '')}")
                else:
                    parts.append(f"- {tool}")
        
        return "\n".join(parts)
    
    def _compose_knowledge(self, agent_data: Dict[str, Any]) -> str:
        """Compose knowledge/RAG section."""
        rag_enabled = agent_data.get("rag_enabled", True)
        domains = agent_data.get("knowledge_domains", [])
        sources = agent_data.get("knowledge_sources", {})
        
        if not rag_enabled:
            return ""
        
        parts = ["## Knowledge Base\n"]
        parts.append("You have access to a comprehensive knowledge base.")
        
        if domains:
            parts.append(f"\n**Primary Domains:** {', '.join(domains)}")
        
        if sources and isinstance(sources, dict):
            parts.append(f"\n**Data Sources:** {', '.join(sources.keys())}")
        
        parts.append("\n\n**Citation Policy:** Always cite sources using [1], [2], etc. format.")
        
        return "\n".join(parts)
    
    def _compose_guidelines(self, agent_data: Dict[str, Any]) -> str:
        """Compose guidelines section."""
        parts = ["## Guidelines\n"]
        
        # Compliance
        compliance = []
        if agent_data.get("hipaa_compliant"):
            compliance.append("HIPAA")
        if agent_data.get("gdpr_compliant"):
            compliance.append("GDPR")
        
        if compliance:
            parts.append(f"**Compliance:** Must adhere to {', '.join(compliance)} standards.")
        
        # Regulatory context
        reg_context = agent_data.get("regulatory_context", {})
        if reg_context and reg_context.get("is_regulated"):
            parts.append("**Regulatory:** This agent operates in a regulated environment.")
        
        # Evidence requirements
        if agent_data.get("evidence_required"):
            parts.append("**Evidence:** All claims must be supported by evidence and citations.")
        
        return "\n".join(parts)
    
    def _compose_behavior(self, agent_data: Dict[str, Any]) -> str:
        """Compose behavior section."""
        response_format = agent_data.get("response_format", "markdown")
        
        parts = ["## Response Style\n"]
        parts.append(f"- **Format:** {response_format}")
        parts.append("- **Reasoning:** Provide step-by-step reasoning")
        parts.append("- **Tone:** Professional and evidence-based")
        
        return "\n".join(parts)
    
    def _render_enhanced_prompt(self, base_prompt: str, sections: Dict[str, str]) -> str:
        """Render full enhanced prompt."""
        parts = []
        
        # Start with base prompt if provided
        if base_prompt:
            parts.append("# System Prompt\n")
            parts.append(base_prompt)
            parts.append("\n---\n")
        
        # Add sections
        for section_name, section_content in sections.items():
            if section_content:
                parts.append(section_content)
                parts.append("\n")
        
        return "\n".join(parts)
    
    def _get_fallback_prompt(self) -> Dict[str, Any]:
        """Get fallback prompt."""
        return {
            "base_prompt": "",
            "enhanced_prompt": "You are a helpful AI assistant. Provide accurate, evidence-based responses.",
            "sections": {},
            "metadata": {
                "agent_id": None,
                "agent_name": "Default Assistant",
                "composed_at": datetime.utcnow().isoformat()
            }
        }
    
    def clear_cache(self, agent_id: Optional[str] = None):
        """Clear prompt cache."""
        if agent_id:
            keys_to_remove = [k for k in self._cache if agent_id in k]
            for key in keys_to_remove:
                del self._cache[key]
            logger.info(f"Cleared cache for agent: {agent_id}")
        else:
            self._cache.clear()
            logger.info("Cleared all prompt cache")
