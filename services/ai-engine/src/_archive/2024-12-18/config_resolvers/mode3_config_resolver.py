"""
Mode 3 Config Resolver - Manual-Autonomous Deep Path

Resolves configuration for Mode 3 from:
1. Agent metadata (database)
2. User ResponsePreferences (frontend)
3. Mode3UserInput (research preferences)
4. Request overrides

Priority: User Input > Request Override > Agent Metadata > Defaults

Mode 3 Characteristics:
- Response time: 30s - 5 minutes (acceptable)
- L4 Context Engineer: ENABLED (full orchestration)
- L5 Tools: Multiple in parallel (1-5)
- ReAct loops: Configurable iterations

Architecture: See MODE_1_MODE_3_L4_L5_ARCHITECTURE.md

Created: 2025-12-02
"""

from typing import Dict, Any, Optional, List
import structlog

from models.l4_l5_config import (
    Mode3Config,
    Mode3UserInput,
    ResponsePreferencesRequest,
    L4ContextEngineerConfig,
    L5ToolConfig,
    ResearchDepth,
    AggregationStrategy
)

logger = structlog.get_logger()


class Mode3ConfigResolver:
    """
    Resolves configuration for Mode 3 (Manual-Autonomous) from agent metadata + user input.

    Priority: User Input > Request Override > Agent Metadata > Defaults
    """

    # Depth to iterations mapping
    DEPTH_TO_ITERATIONS = {
        "quick": 1,
        "standard": 3,
        "deep": 5,
        "exhaustive": 10
    }

    # Depth to token budget multiplier
    # Increased multipliers for world-class comprehensive research outputs
    DEPTH_TO_BUDGET_MULTIPLIER = {
        "concise": 1.0,       # Was 0.5 - still produce complete thoughts
        "standard": 2.0,      # Was 1.0 - comprehensive by default
        "comprehensive": 3.0  # Was 1.5 - full research depth
    }

    def resolve(
        self,
        agent_model: str,
        agent_temperature: Optional[float],
        agent_max_tokens: Optional[int],
        agent_metadata: Dict[str, Any],
        knowledge_namespaces: Optional[List[str]],
        request_model: Optional[str],
        user_preferences: Optional[ResponsePreferencesRequest],
        mode3_input: Optional[Mode3UserInput]
    ) -> Mode3Config:
        """
        Resolve Mode 3 configuration from all sources.

        Args:
            agent_model: Agent's configured model
            agent_temperature: Agent's configured temperature
            agent_max_tokens: Agent's configured max_tokens
            agent_metadata: Agent's metadata JSONB field
            knowledge_namespaces: Agent's assigned RAG namespaces
            request_model: Model override from request
            user_preferences: User response preferences from frontend
            mode3_input: Mode 3 specific user input (research depth, tools, etc.)

        Returns:
            Mode3Config with resolved values
        """
        logger.info(
            "mode3_config_resolver.resolving",
            agent_model=agent_model,
            has_request_model=bool(request_model),
            has_mode3_input=bool(mode3_input)
        )

        # Initialize with defaults if not provided
        prefs = user_preferences or ResponsePreferencesRequest()
        m3_input = mode3_input or Mode3UserInput()

        l4_config = agent_metadata.get('l4_config', {})
        l5_config = agent_metadata.get('l5_config', {})
        react_config = agent_metadata.get('react_config', {})

        # LLM Configuration
        # Increased defaults for world-class research outputs
        model = request_model or agent_model or "gpt-4"
        temperature = agent_temperature or 0.7
        # Mode 3 deep research requires higher token limits (8000 default)
        max_tokens = agent_max_tokens or 8000

        # L4 Context Engineer Configuration
        l4_enabled = (
            l4_config.get('enabled', True) and
            m3_input.research_depth != ResearchDepth.QUICK
        )

        # Determine enabled L5 tools
        # Priority: User selection > Agent config
        if m3_input.enabled_tools:
            enabled_l5_tools = m3_input.enabled_tools
        else:
            enabled_l5_tools = []
            if l5_config.get('rag_enabled', True):
                enabled_l5_tools.append("rag")
            if l5_config.get('websearch_enabled', True):
                enabled_l5_tools.append("websearch")
            if l5_config.get('pubmed_enabled', False):
                enabled_l5_tools.append("pubmed")
            if l5_config.get('fda_enabled', False):
                enabled_l5_tools.append("fda")

        # Max L5 tools (capped by agent config)
        max_l5_tools = l4_config.get('max_l5_tools', 5)
        enabled_l5_tools = enabled_l5_tools[:max_l5_tools]

        # Token budget calculation
        base_budget = l4_config.get('token_budget', 4000)
        depth_multiplier = self.DEPTH_TO_BUDGET_MULTIPLIER.get(
            prefs.depth, 1.0
        )
        token_budget = int(base_budget * depth_multiplier)

        # Max findings per tool
        # Priority: User input > Agent config > Default
        max_findings = (
            m3_input.max_findings_per_source or
            l5_config.get('max_findings_per_tool', 5)
        )

        # L5 timeout (from agent config)
        l5_timeout = l5_config.get('timeout_ms', 3000)

        # ReAct iterations
        # Priority: User input > Depth mapping > Agent config > Default
        if m3_input.max_research_rounds:
            max_iterations = m3_input.max_research_rounds
        else:
            max_iterations = self.DEPTH_TO_ITERATIONS.get(
                m3_input.research_depth.value,
                react_config.get('max_iterations', 3)
            )

        # Aggregation strategy
        aggregation_strategy = l4_config.get('aggregation_strategy', 'synthesized')

        config = Mode3Config(
            # LLM Config
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,

            # L4 Config
            l4_enabled=l4_enabled,
            l4_token_budget=token_budget,
            l4_aggregation_strategy=aggregation_strategy,

            # L5 Config
            l5_enabled_tools=enabled_l5_tools,
            l5_max_findings=max_findings,
            l5_timeout_ms=l5_timeout,
            l5_namespaces=knowledge_namespaces or [],

            # ReAct Config
            max_react_iterations=max_iterations,
            research_depth=m3_input.research_depth.value,

            # Response Config
            response_format=prefs.format,
            response_depth=prefs.depth,
            include_citations=prefs.include_citations,
            include_insights=prefs.include_insights,
            include_key_takeaways=prefs.include_key_takeaways,
            include_next_steps=prefs.include_next_steps
        )

        logger.info(
            "mode3_config_resolver.resolved",
            model=config.model,
            l4_enabled=config.l4_enabled,
            l4_token_budget=config.l4_token_budget,
            l5_enabled_tools=config.l5_enabled_tools,
            l5_max_findings=config.l5_max_findings,
            max_react_iterations=config.max_react_iterations,
            research_depth=config.research_depth
        )

        return config

    def create_l4_config(
        self,
        config: Mode3Config
    ) -> L4ContextEngineerConfig:
        """
        Create L4ContextEngineerConfig from Mode3Config.

        Args:
            config: Resolved Mode3Config

        Returns:
            L4ContextEngineerConfig
        """
        try:
            aggregation_strategy = AggregationStrategy(config.l4_aggregation_strategy)
        except ValueError:
            aggregation_strategy = AggregationStrategy.SYNTHESIZED

        return L4ContextEngineerConfig(
            enabled=config.l4_enabled,
            max_l5_tools=len(config.l5_enabled_tools),
            token_budget=config.l4_token_budget,
            aggregation_strategy=aggregation_strategy
        )

    def create_l5_configs(
        self,
        config: Mode3Config
    ) -> Dict[str, L5ToolConfig]:
        """
        Create L5ToolConfig dict from Mode3Config.

        Args:
            config: Resolved Mode3Config

        Returns:
            Dict mapping tool type to L5ToolConfig
        """
        l5_configs: Dict[str, L5ToolConfig] = {}

        for tool_type in config.l5_enabled_tools:
            tool_config = L5ToolConfig(
                tool_type=tool_type,
                enabled=True,
                max_findings=config.l5_max_findings,
                timeout_ms=config.l5_timeout_ms
            )

            # Add namespaces for RAG tool
            if tool_type == "rag":
                tool_config.namespaces = config.l5_namespaces

            l5_configs[tool_type] = tool_config

        return l5_configs


# =============================================================================
# Factory Functions
# =============================================================================

_mode3_resolver: Optional[Mode3ConfigResolver] = None


def get_mode3_config_resolver() -> Mode3ConfigResolver:
    """Get or create Mode3ConfigResolver singleton."""
    global _mode3_resolver
    if _mode3_resolver is None:
        _mode3_resolver = Mode3ConfigResolver()
    return _mode3_resolver


def resolve_mode3_config(
    agent: Dict[str, Any],
    request_model: Optional[str] = None,
    user_preferences: Optional[Dict[str, Any]] = None,
    mode3_input: Optional[Dict[str, Any]] = None
) -> Mode3Config:
    """
    Convenience function to resolve Mode 3 config from agent dict.

    Args:
        agent: Agent record dict (from database)
        request_model: Model override from request
        user_preferences: User preferences dict
        mode3_input: Mode 3 specific input dict

    Returns:
        Mode3Config with resolved values
    """
    resolver = get_mode3_config_resolver()

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

    # Convert mode3_input dict to Pydantic model
    m3_input = None
    if mode3_input:
        # Handle research_depth conversion
        depth_str = mode3_input.get('researchDepth', 'standard')
        try:
            research_depth = ResearchDepth(depth_str)
        except ValueError:
            research_depth = ResearchDepth.STANDARD

        m3_input = Mode3UserInput(
            research_depth=research_depth,
            max_research_rounds=mode3_input.get('maxResearchRounds'),
            enabled_tools=mode3_input.get('enabledTools'),
            max_findings_per_source=mode3_input.get('maxFindingsPerSource')
        )

    return resolver.resolve(
        agent_model=agent.get('model', 'gpt-4'),
        agent_temperature=agent.get('temperature'),
        agent_max_tokens=agent.get('max_tokens'),
        agent_metadata=agent.get('metadata', {}),
        knowledge_namespaces=agent.get('knowledge_namespaces'),
        request_model=request_model,
        user_preferences=prefs,
        mode3_input=m3_input
    )
