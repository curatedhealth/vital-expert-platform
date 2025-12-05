"""
Mode 1 Config Resolver - Manual-Interactive Fast Path

Resolves configuration for Mode 1 from:
1. Agent metadata (database)
2. User ResponsePreferences (frontend)
3. Request overrides

Priority: User Input > Request Override > Agent Metadata > Defaults

Mode 1 Characteristics:
- Response time: 3-5 seconds
- MANDATORY: L5 RAG + L5 WebSearch (parallel execution)
- Total timeout: 3 seconds for parallel L5 execution
- Streaming: Required
- Evidence-Based: All responses grounded in retrieved sources

Architecture: See MODE_1_MODE_3_L4_L5_ARCHITECTURE.md

Created: 2025-12-02
Updated: 2025-12-02 - Made RAG + WebSearch mandatory for evidence-based responses
"""

from typing import Dict, Any, Optional, List
import structlog

from models.l4_l5_config import (
    Mode1Config,
    ResponsePreferencesRequest,
    L5ToolConfig
)

logger = structlog.get_logger()


class Mode1ConfigResolver:
    """
    Resolves configuration for Mode 1 (Manual-Interactive) from agent metadata + user input.

    Priority: User Input > Request Override > Agent Metadata > Defaults

    Mode 1 Evidence Requirements (NO HALLUCINATION):
    - L5 RAG: MANDATORY (internal knowledge base)
    - L5 WebSearch: MANDATORY (live authoritative sources)
    - Parallel execution: 3-second total timeout
    - Max findings per tool: 3 (for speed)
    - Graceful degradation: Continue if one tool fails
    """

    # Mode 1 Evidence Settings (optimized for speed + quality)
    # NOTE: 5 seconds allows Postgres+Pinecone hybrid search to complete reliably
    # RAG typically takes 3-4 seconds with hybrid strategy
    MODE1_PARALLEL_TIMEOUT_MS = 5000    # 5 seconds total for parallel execution
    MODE1_MAX_FINDINGS_PER_TOOL = 3     # Cap per tool for speed
    MODE1_MIN_EVIDENCE_SOURCES = 1      # At least 1 source required

    def resolve(
        self,
        agent_model: str,
        agent_temperature: Optional[float],
        agent_max_tokens: Optional[int],
        agent_metadata: Dict[str, Any],
        knowledge_namespaces: Optional[List[str]],
        request_model: Optional[str],
        user_preferences: Optional[ResponsePreferencesRequest]
    ) -> Mode1Config:
        """
        Resolve Mode 1 configuration from all sources.

        IMPORTANT: RAG and WebSearch are MANDATORY for evidence-based responses.
        Both tools run in parallel with a shared 3-second timeout.

        Args:
            agent_model: Agent's configured model
            agent_temperature: Agent's configured temperature
            agent_max_tokens: Agent's configured max_tokens
            agent_metadata: Agent's metadata JSONB field
            knowledge_namespaces: Agent's assigned RAG namespaces
            request_model: Model override from request
            user_preferences: User response preferences from frontend

        Returns:
            Mode1Config with resolved values
        """
        logger.info(
            "mode1_config_resolver.resolving",
            agent_model=agent_model,
            has_request_model=bool(request_model),
            has_user_preferences=bool(user_preferences),
            mandatory_evidence=True
        )

        # Initialize user preferences with defaults if not provided
        prefs = user_preferences or ResponsePreferencesRequest()

        # LLM Configuration
        # Priority: request > agent > default
        model = request_model or agent_model or "gpt-4"
        temperature = agent_temperature or 0.7
        max_tokens = agent_max_tokens or 2000

        # L5 Configuration from agent metadata
        l5_config = agent_metadata.get('l5_config', {})

        # RAG and WebSearch are MANDATORY - no option to disable
        # This ensures ALL responses are evidence-based (no hallucination)
        l5_rag_enabled = True       # ALWAYS enabled
        l5_websearch_enabled = True  # ALWAYS enabled

        # Max findings per tool (capped for Mode 1 speed)
        l5_max_findings = min(
            l5_config.get('max_findings_per_tool', 5),
            self.MODE1_MAX_FINDINGS_PER_TOOL
        )

        # Parallel timeout (shared budget for both tools running together)
        l5_parallel_timeout = self.MODE1_PARALLEL_TIMEOUT_MS

        # Evidence quality settings
        require_evidence = True  # ALWAYS require evidence
        min_evidence_sources = self.MODE1_MIN_EVIDENCE_SOURCES
        graceful_degradation = l5_config.get('graceful_degradation', True)

        # Response Format from user preferences
        response_format = prefs.format or "structured"
        response_depth = prefs.depth or "standard"

        config = Mode1Config(
            # LLM Config
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,

            # L5 Evidence Config (MANDATORY)
            l5_rag_enabled=l5_rag_enabled,
            l5_websearch_enabled=l5_websearch_enabled,
            l5_namespaces=knowledge_namespaces or [],
            l5_max_findings_per_tool=l5_max_findings,
            l5_parallel_timeout_ms=l5_parallel_timeout,

            # Evidence Quality Settings
            require_evidence=require_evidence,
            min_evidence_sources=min_evidence_sources,
            graceful_degradation=graceful_degradation,

            # Response Config
            response_format=response_format,
            response_depth=response_depth,
            include_citations=prefs.include_citations,
            include_insights=prefs.include_insights,
            include_key_takeaways=prefs.include_key_takeaways
        )

        logger.info(
            "mode1_config_resolver.resolved",
            model=config.model,
            l5_rag_enabled=config.l5_rag_enabled,
            l5_websearch_enabled=config.l5_websearch_enabled,
            l5_max_findings_per_tool=config.l5_max_findings_per_tool,
            l5_parallel_timeout_ms=config.l5_parallel_timeout_ms,
            require_evidence=config.require_evidence,
            response_format=config.response_format
        )

        return config

    def create_l5_configs(
        self,
        config: Mode1Config
    ) -> Dict[str, L5ToolConfig]:
        """
        Create L5 tool configs from Mode1Config.

        Both RAG and WebSearch configs are created since both are MANDATORY.

        Args:
            config: Resolved Mode1Config

        Returns:
            Dict mapping tool type to L5ToolConfig
        """
        l5_configs: Dict[str, L5ToolConfig] = {}

        # RAG Config (MANDATORY)
        l5_configs["rag"] = L5ToolConfig(
            tool_type="rag",
            enabled=True,
            max_findings=config.l5_max_findings_per_tool,
            timeout_ms=config.l5_parallel_timeout_ms,  # Shared timeout budget
            namespaces=config.l5_namespaces
        )

        # WebSearch Config (MANDATORY)
        l5_configs["websearch"] = L5ToolConfig(
            tool_type="websearch",
            enabled=True,
            max_findings=config.l5_max_findings_per_tool,
            timeout_ms=config.l5_parallel_timeout_ms,  # Shared timeout budget
            domains=None  # Use default authoritative domains
        )

        return l5_configs

    def create_l5_rag_config(
        self,
        config: Mode1Config
    ) -> L5ToolConfig:
        """
        Create L5 RAG tool config from Mode1Config.

        Note: RAG is MANDATORY in Mode 1, so this always returns a config.

        Args:
            config: Resolved Mode1Config

        Returns:
            L5ToolConfig for RAG tool
        """
        return L5ToolConfig(
            tool_type="rag",
            enabled=True,
            max_findings=config.l5_max_findings_per_tool,
            timeout_ms=config.l5_parallel_timeout_ms,
            namespaces=config.l5_namespaces
        )

    def create_l5_websearch_config(
        self,
        config: Mode1Config
    ) -> L5ToolConfig:
        """
        Create L5 WebSearch tool config from Mode1Config.

        Note: WebSearch is MANDATORY in Mode 1, so this always returns a config.

        Args:
            config: Resolved Mode1Config

        Returns:
            L5ToolConfig for WebSearch tool
        """
        return L5ToolConfig(
            tool_type="websearch",
            enabled=True,
            max_findings=config.l5_max_findings_per_tool,
            timeout_ms=config.l5_parallel_timeout_ms,
            domains=None  # Use default authoritative domains
        )


# =============================================================================
# Factory Functions
# =============================================================================

_mode1_resolver: Optional[Mode1ConfigResolver] = None


def get_mode1_config_resolver() -> Mode1ConfigResolver:
    """Get or create Mode1ConfigResolver singleton."""
    global _mode1_resolver
    if _mode1_resolver is None:
        _mode1_resolver = Mode1ConfigResolver()
    return _mode1_resolver


def resolve_mode1_config(
    agent: Dict[str, Any],
    request_model: Optional[str] = None,
    user_preferences: Optional[Dict[str, Any]] = None
) -> Mode1Config:
    """
    Convenience function to resolve Mode 1 config from agent dict.

    Note: RAG and WebSearch are MANDATORY in Mode 1 - no option to disable.
    This ensures all responses are evidence-based (no hallucination).

    Args:
        agent: Agent record dict (from database)
        request_model: Model override from request
        user_preferences: User preferences dict

    Returns:
        Mode1Config with resolved values
    """
    resolver = get_mode1_config_resolver()

    # Convert user_preferences dict to Pydantic model
    prefs = None
    if user_preferences:
        prefs = ResponsePreferencesRequest(
            format=user_preferences.get('format', 'structured'),
            depth=user_preferences.get('depth', 'standard'),
            include_citations=user_preferences.get('includeCitations', True),
            include_insights=user_preferences.get('includeInsights', True),
            include_key_takeaways=user_preferences.get('includeKeyTakeaways', True),
            include_next_steps=user_preferences.get('includeNextSteps', False)
        )

    return resolver.resolve(
        agent_model=agent.get('model', 'gpt-4'),
        agent_temperature=agent.get('temperature'),
        agent_max_tokens=agent.get('max_tokens'),
        agent_metadata=agent.get('metadata', {}),
        knowledge_namespaces=agent.get('knowledge_namespaces'),
        request_model=request_model,
        user_preferences=prefs
    )
