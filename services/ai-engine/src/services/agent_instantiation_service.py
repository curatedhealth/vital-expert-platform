"""
Agent Instantiation Service

Dynamic agent instantiation from Supabase for ALL levels (L1-L5).

Architecture:
- L1-L3: Dynamic LLM calls with DB-driven prompts and personality
- L4 Workers: Python code + DB config (hybrid)
- L5 Tools: Python code + DB registry (hybrid)

Key Principle:
- Configuration lives in Supabase (prompts, personality, capabilities)
- Execution code lives in Python (L4 workers, L5 tools)
- This service bridges both worlds

Level Usage:
- L1: Master Orchestrator (agent selector, solution builder)
- L2: Expert (user/system selectable for Mode 1-4)
- L3: Specialist (user/system selectable for Mode 1-4)
- L4: Workers (shared pool, invoked by L1-L3)
- L5: Tools (shared registry, invoked by L1-L3)

Reference:
- AGENT_OS_GOLD_STANDARD.md
- AGENT_BACKEND_INTEGRATION_SPEC.md
"""

from typing import Dict, Any, Optional, Tuple, List
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import structlog
import uuid

from infrastructure.llm.config_service import get_llm_config_for_level

logger = structlog.get_logger()

# Get default max_tokens from L2 config (most common agent level for personalities)
_DEFAULT_MAX_TOKENS = get_llm_config_for_level("L2").max_tokens


# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class Skill:
    """Individual skill (Claude skill) - child of capability."""
    id: str
    name: str
    slug: str
    display_name: str
    skill_type: str  # 'analytical', 'creative', 'technical', 'communication'
    invocation_method: Optional[str] = None  # How to invoke this skill
    proficiency_level: str = 'intermediate'  # 'beginner', 'intermediate', 'expert', 'master'
    is_primary: bool = False


@dataclass
class Capability:
    """Agent capability with child skills."""
    id: str
    name: str
    slug: str
    display_name: str
    category: str
    proficiency_level: str = 'expert'
    is_primary: bool = False
    skills: List[Skill] = field(default_factory=list)  # Child skills


@dataclass
class PersonalityConfig:
    """Configuration from personality_types table."""
    id: str
    slug: str
    display_name: str
    temperature: float = 0.3
    top_p: float = 0.9
    frequency_penalty: float = 0.0
    presence_penalty: float = 0.0
    max_tokens: Optional[int] = None  # Falls back to _DEFAULT_MAX_TOKENS at runtime
    verbosity_level: int = 50
    formality_level: int = 50
    directness_level: int = 50
    warmth_level: int = 50
    technical_level: int = 50
    reasoning_approach: str = "balanced"
    proactivity_level: int = 50
    tone_keywords: list = field(default_factory=list)


@dataclass
class ResolvedContext:
    """Resolved context names from IDs."""
    region: Optional[Dict[str, str]] = None  # {"code": "FDA", "name": "..."}
    domain: Optional[Dict[str, str]] = None
    therapeutic_area: Optional[Dict[str, str]] = None
    phase: Optional[Dict[str, str]] = None


@dataclass
class InstantiatedAgentConfig:
    """Full configuration for an instantiated agent session."""
    session_id: str
    agent_id: str
    agent_name: str
    agent_display_name: Optional[str]
    level: int
    system_prompt: str
    personality: PersonalityConfig
    context: ResolvedContext
    llm_config: Dict[str, Any]
    created_at: datetime
    # New: Capabilities with child skills (Claude skills)
    capabilities: List[Capability] = field(default_factory=list)
    # New: Allowed L5 tools (for L1-L3 agents)
    allowed_tools: List[Dict[str, Any]] = field(default_factory=list)


class AgentInstantiationService:
    """
    Service for instantiating agents with context injection.
    
    This is called by LangGraph workflows to get fully configured agents
    instead of directly querying the agents table.
    
    Flow:
    1. Workflow calls instantiate_agent()
    2. Service queries agent, personality_type, context tables
    3. Service creates agent_session record
    4. Service builds context-injected system prompt
    5. Returns InstantiatedAgentConfig with all LLM settings
    """
    
    def __init__(self, supabase_client):
        """
        Initialize the service.
        
        Args:
            supabase_client: Supabase client for database queries
        """
        self.supabase = supabase_client
        logger.info("agent_instantiation_service_initialized")
    
    async def instantiate_agent(
        self,
        agent_id: str,
        user_id: str,
        tenant_id: str,
        region_id: Optional[str] = None,
        domain_id: Optional[str] = None,
        therapeutic_area_id: Optional[str] = None,
        phase_id: Optional[str] = None,
        personality_type_id: Optional[str] = None,
        session_mode: str = "interactive",
        expires_in_hours: int = 24,
    ) -> InstantiatedAgentConfig:
        """
        Instantiate an agent with context injection.
        
        This is the main method that workflows call.
        
        Args:
            agent_id: UUID of the agent to instantiate
            user_id: UUID of the user
            tenant_id: UUID of the tenant
            region_id: Optional regulatory region context
            domain_id: Optional product domain context
            therapeutic_area_id: Optional therapeutic area context
            phase_id: Optional development phase context
            personality_type_id: Optional personality override
            session_mode: interactive, autonomous, or batch
            expires_in_hours: Session TTL
            
        Returns:
            InstantiatedAgentConfig with full configuration
        """
        logger.info(
            "instantiate_agent_started",
            agent_id=agent_id,
            tenant_id=tenant_id,
            has_context=bool(region_id or domain_id or therapeutic_area_id or phase_id),
            has_personality_override=bool(personality_type_id),
        )
        
        # 1. Fetch agent
        agent = await self._fetch_agent(agent_id)
        if not agent:
            raise ValueError(f"Agent not found: {agent_id}")
        
        # 2. Resolve context IDs to names
        context = await self._resolve_context(
            region_id, domain_id, therapeutic_area_id, phase_id
        )
        
        # 3. Get personality configuration
        effective_personality_id = personality_type_id or agent.get('personality_type_id')
        personality = await self._fetch_personality(effective_personality_id)
        
        # 4. Create session record
        session_id = await self._create_session(
            agent_id=agent_id,
            user_id=user_id,
            tenant_id=tenant_id,
            region_id=region_id,
            domain_id=domain_id,
            therapeutic_area_id=therapeutic_area_id,
            phase_id=phase_id,
            personality_type_id=effective_personality_id,
            session_mode=session_mode,
            expires_in_hours=expires_in_hours,
        )
        
        # 5. Fetch capabilities with child skills (Claude skills)
        capabilities = await self._fetch_capabilities_with_skills(agent_id)
        
        # 6. Fetch allowed L5 tools for this agent
        allowed_tools = await self._fetch_allowed_tools(agent_id)
        
        # 7. Build context-injected system prompt (with capabilities & tools)
        system_prompt = self._build_system_prompt(
            agent=agent,
            context=context,
            personality=personality,
            capabilities=capabilities,
            tools=allowed_tools,
        )
        
        # 8. Build LLM config from personality
        llm_config = self._build_llm_config(agent, personality)
        
        # 9. Return full configuration
        config = InstantiatedAgentConfig(
            session_id=session_id,
            agent_id=agent_id,
            agent_name=agent.get('name', 'Unknown'),
            agent_display_name=agent.get('display_name'),
            level=self._get_agent_level(agent),
            system_prompt=system_prompt,
            personality=personality,
            context=context,
            llm_config=llm_config,
            created_at=datetime.utcnow(),
            capabilities=capabilities,
            allowed_tools=allowed_tools,
        )
        
        logger.info(
            "instantiate_agent_completed",
            session_id=session_id,
            agent_id=agent_id,
            personality_slug=personality.slug if personality else None,
            capabilities_count=len(capabilities),
            skills_count=sum(len(c.skills) for c in capabilities),
            tools_count=len(allowed_tools),
        )
        
        return config
    
    async def _fetch_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Fetch agent from database."""
        try:
            result = self.supabase.table('agents') \
                .select('*, agent_levels(*)') \
                .eq('id', agent_id) \
                .single() \
                .execute()
            return result.data
        except Exception as e:
            logger.error("fetch_agent_failed", agent_id=agent_id, error=str(e))
            return None
    
    async def _resolve_context(
        self,
        region_id: Optional[str],
        domain_id: Optional[str],
        therapeutic_area_id: Optional[str],
        phase_id: Optional[str],
    ) -> ResolvedContext:
        """Resolve context IDs to human-readable names."""
        context = ResolvedContext()
        
        try:
            if region_id:
                result = self.supabase.table('context_regions') \
                    .select('code, name') \
                    .eq('id', region_id) \
                    .single() \
                    .execute()
                if result.data:
                    context.region = result.data
            
            if domain_id:
                result = self.supabase.table('context_domains') \
                    .select('code, name') \
                    .eq('id', domain_id) \
                    .single() \
                    .execute()
                if result.data:
                    context.domain = result.data
            
            if therapeutic_area_id:
                result = self.supabase.table('context_therapeutic_areas') \
                    .select('code, name') \
                    .eq('id', therapeutic_area_id) \
                    .single() \
                    .execute()
                if result.data:
                    context.therapeutic_area = result.data
            
            if phase_id:
                result = self.supabase.table('context_phases') \
                    .select('code, name') \
                    .eq('id', phase_id) \
                    .single() \
                    .execute()
                if result.data:
                    context.phase = result.data
                    
        except Exception as e:
            logger.warning("resolve_context_partial_failure", error=str(e))
        
        return context
    
    async def _fetch_personality(
        self,
        personality_type_id: Optional[str]
    ) -> PersonalityConfig:
        """Fetch personality configuration."""
        if not personality_type_id:
            # Return default personality
            return PersonalityConfig(
                id="",
                slug="default",
                display_name="Default",
                temperature=0.3,
            )
        
        try:
            result = self.supabase.table('personality_types') \
                .select('*') \
                .eq('id', personality_type_id) \
                .single() \
                .execute()
            
            if result.data:
                data = result.data
                return PersonalityConfig(
                    id=data.get('id', ''),
                    slug=data.get('slug', 'default'),
                    display_name=data.get('display_name', 'Default'),
                    temperature=data.get('temperature', 0.3),
                    top_p=data.get('top_p', 0.9),
                    frequency_penalty=data.get('frequency_penalty', 0.0),
                    presence_penalty=data.get('presence_penalty', 0.0),
                    max_tokens=data.get('default_max_tokens') or _DEFAULT_MAX_TOKENS,
                    verbosity_level=data.get('verbosity_level', 50),
                    formality_level=data.get('formality_level', 50),
                    directness_level=data.get('directness_level', 50),
                    warmth_level=data.get('warmth_level', 50),
                    technical_level=data.get('technical_level', 50),
                    reasoning_approach=data.get('reasoning_approach', 'balanced'),
                    proactivity_level=data.get('proactivity_level', 50),
                    tone_keywords=data.get('tone_keywords', []),
                )
        except Exception as e:
            logger.warning("fetch_personality_failed", error=str(e))
        
        return PersonalityConfig(
            id="",
            slug="default",
            display_name="Default",
        )
    
    async def _create_session(
        self,
        agent_id: str,
        user_id: str,
        tenant_id: str,
        region_id: Optional[str],
        domain_id: Optional[str],
        therapeutic_area_id: Optional[str],
        phase_id: Optional[str],
        personality_type_id: Optional[str],
        session_mode: str,
        expires_in_hours: int,
    ) -> str:
        """Create agent session record."""
        session_id = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(hours=expires_in_hours)
        
        try:
            self.supabase.table('agent_sessions').insert({
                'id': session_id,
                'agent_id': agent_id,
                'user_id': user_id,
                'tenant_id': tenant_id,
                'context_region_id': region_id,
                'context_domain_id': domain_id,
                'context_therapeutic_area_id': therapeutic_area_id,
                'context_phase_id': phase_id,
                'personality_type_id': personality_type_id,
                'session_mode': session_mode,
                'status': 'active',
                'started_at': datetime.utcnow().isoformat(),
                'expires_at': expires_at.isoformat(),
            }).execute()
            
            logger.info("session_created", session_id=session_id)
            return session_id
            
        except Exception as e:
            logger.error("create_session_failed", error=str(e))
            # Return UUID even if DB insert fails (graceful degradation)
            return session_id
    
    def _build_system_prompt(
        self,
        agent: Dict[str, Any],
        context: ResolvedContext,
        personality: PersonalityConfig,
        capabilities: Optional[List[Capability]] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
    ) -> str:
        """Build system prompt with context, personality, capabilities and skills injection."""
        base_prompt = agent.get('system_prompt', '')
        
        # Build context section
        context_parts = []
        
        if context.region:
            context_parts.append(
                f"REGULATORY CONTEXT: You are operating under {context.region['name']} "
                f"({context.region['code']}) regulatory framework."
            )
        
        if context.domain:
            context_parts.append(
                f"PRODUCT DOMAIN: Focus on {context.domain['name']} products."
            )
        
        if context.therapeutic_area:
            context_parts.append(
                f"THERAPEUTIC AREA: Specialize in {context.therapeutic_area['name']}."
            )
        
        if context.phase:
            context_parts.append(
                f"DEVELOPMENT PHASE: Consider requirements for {context.phase['name']} stage."
            )
        
        # Build personality section
        personality_hints = []
        
        if personality.verbosity_level < 30:
            personality_hints.append("Be concise and to the point.")
        elif personality.verbosity_level > 70:
            personality_hints.append("Provide detailed, comprehensive responses.")
        
        if personality.formality_level > 70:
            personality_hints.append("Use formal, professional language.")
        elif personality.formality_level < 30:
            personality_hints.append("Use conversational, accessible language.")
        
        if personality.technical_level > 70:
            personality_hints.append("Include technical details and terminology.")
        elif personality.technical_level < 30:
            personality_hints.append("Simplify technical concepts.")
        
        if personality.reasoning_approach == "analytical":
            personality_hints.append("Focus on data and evidence-based reasoning.")
        elif personality.reasoning_approach == "creative":
            personality_hints.append("Consider innovative approaches and alternatives.")
        elif personality.reasoning_approach == "cautious":
            personality_hints.append("Emphasize risks and conservative approaches.")
        
        # Combine into final prompt
        prompt_parts = [base_prompt]
        
        if context_parts:
            prompt_parts.append("\n\n## SESSION CONTEXT\n" + "\n".join(context_parts))
        
        if personality_hints:
            prompt_parts.append("\n\n## COMMUNICATION STYLE\n" + "\n".join(personality_hints))
        
        # Add capabilities and skills section
        if capabilities:
            capabilities_section = self._build_capabilities_prompt_section(capabilities)
            if capabilities_section:
                prompt_parts.append("\n\n" + capabilities_section)
        
        # Add tools section
        if tools:
            tools_section = self._build_tools_prompt_section(tools)
            if tools_section:
                prompt_parts.append("\n\n" + tools_section)
        
        return "\n".join(prompt_parts)
    
    def _build_llm_config(
        self,
        agent: Dict[str, Any],
        personality: PersonalityConfig,
    ) -> Dict[str, Any]:
        """
        Build LLM configuration from agent and personality.

        Priority (database-driven):
        1. Agent's base_model, temperature, max_tokens from Supabase
        2. Personality overrides where specified
        3. System defaults as fallback
        """
        # Get base model from agent (database-driven, not hardcoded)
        base_model = agent.get('base_model') or 'gpt-4'

        # Temperature: personality > agent > default
        temperature = personality.temperature
        if temperature is None or temperature == 0.7:  # Default personality temp
            temperature = agent.get('temperature', 0.7)

        # Max tokens: agent > personality > default
        max_tokens = agent.get('max_tokens') or personality.max_tokens or 4000

        return {
            'model': base_model,
            'temperature': temperature,
            'max_tokens': max_tokens,
            'top_p': personality.top_p,
            'frequency_penalty': personality.frequency_penalty,
            'presence_penalty': personality.presence_penalty,
            # Include agent-specific settings for downstream use
            'context_window': agent.get('context_window', 8000),
        }
    
    def _get_agent_level(self, agent: Dict[str, Any]) -> int:
        """Extract agent level from agent data."""
        if agent.get('agent_levels'):
            return agent['agent_levels'].get('level_number', 2)
        return 2  # Default to L2 Expert
    
    # =========================================================================
    # CAPABILITIES & SKILLS FETCHING (Claude Skills)
    # =========================================================================
    
    async def _fetch_capabilities_with_skills(
        self,
        agent_id: str,
    ) -> List[Capability]:
        """
        Fetch agent capabilities with their child skills (Claude skills).
        
        Schema:
        - agent_capabilities: Links agent to capabilities
        - capabilities: High-level capability categories
        - capability_skills: Links capabilities to skills
        - skills: Granular task-level skills (Claude skills)
        - agent_skills: Direct agent-skill assignments with proficiency
        
        Returns:
            List of Capability objects with nested Skill objects
        """
        capabilities = []
        
        try:
            # Step 1: Get agent's capabilities with proficiency
            cap_result = self.supabase.table('agent_capabilities') \
                .select('''
                    capability_id,
                    proficiency_level,
                    is_primary,
                    capabilities(
                        id,
                        capability_name,
                        capability_slug,
                        display_name,
                        category,
                        description
                    )
                ''') \
                .eq('agent_id', agent_id) \
                .execute()
            
            if not cap_result.data:
                logger.debug("no_capabilities_found", agent_id=agent_id)
                return capabilities
            
            # Step 2: For each capability, get its child skills
            for cap_row in cap_result.data:
                cap_data = cap_row.get('capabilities', {})
                if not cap_data:
                    continue
                
                capability_id = cap_data.get('id')
                
                # Get skills linked to this capability via capability_skills
                skills_result = self.supabase.table('capability_skills') \
                    .select('''
                        skill_id,
                        importance_level,
                        skills(
                            id,
                            skill_name,
                            skill_slug,
                            display_name,
                            category,
                            skill_type,
                            invocation_method,
                            description
                        )
                    ''') \
                    .eq('capability_id', capability_id) \
                    .execute()
                
                # Also get agent-specific skill proficiency
                agent_skills_result = self.supabase.table('agent_skills') \
                    .select('skill_id, proficiency_level, is_primary, usage_count') \
                    .eq('agent_id', agent_id) \
                    .execute()
                
                # Build skill proficiency lookup
                skill_proficiency = {}
                if agent_skills_result.data:
                    for s in agent_skills_result.data:
                        skill_proficiency[s['skill_id']] = {
                            'proficiency': s.get('proficiency_level', 'intermediate'),
                            'is_primary': s.get('is_primary', False),
                            'usage_count': s.get('usage_count', 0),
                        }
                
                # Build skill objects
                skills = []
                if skills_result.data:
                    for skill_row in skills_result.data:
                        skill_data = skill_row.get('skills', {})
                        if not skill_data:
                            continue
                        
                        skill_id = skill_data.get('id')
                        agent_skill_info = skill_proficiency.get(skill_id, {})
                        
                        skill = Skill(
                            id=skill_id,
                            name=skill_data.get('skill_name', ''),
                            slug=skill_data.get('skill_slug', ''),
                            display_name=skill_data.get('display_name', ''),
                            skill_type=skill_data.get('skill_type', 'general'),
                            invocation_method=skill_data.get('invocation_method'),
                            proficiency_level=agent_skill_info.get('proficiency', 'intermediate'),
                            is_primary=agent_skill_info.get('is_primary', False),
                        )
                        skills.append(skill)
                
                # Build capability object with skills
                capability = Capability(
                    id=cap_data.get('id', ''),
                    name=cap_data.get('capability_name', ''),
                    slug=cap_data.get('capability_slug', ''),
                    display_name=cap_data.get('display_name', ''),
                    category=cap_data.get('category', 'general'),
                    proficiency_level=cap_row.get('proficiency_level', 'expert'),
                    is_primary=cap_row.get('is_primary', False),
                    skills=skills,
                )
                capabilities.append(capability)
            
            logger.info(
                "capabilities_fetched",
                agent_id=agent_id,
                capability_count=len(capabilities),
                total_skills=sum(len(c.skills) for c in capabilities),
            )
            
        except Exception as e:
            logger.error("fetch_capabilities_failed", agent_id=agent_id, error=str(e))
        
        return capabilities
    
    async def _fetch_allowed_tools(
        self,
        agent_id: str,
    ) -> List[Dict[str, Any]]:
        """
        Fetch L5 tools allowed for this agent.
        
        Uses agent_tool_assignments (or agent_tools) junction table.
        
        Returns:
            List of tool configurations
        """
        tools = []
        
        try:
            # Try agent_tool_assignments first (per schema spec)
            try:
                result = self.supabase.table('agent_tool_assignments') \
                    .select('''
                        tool_id,
                        is_enabled,
                        priority,
                        is_required,
                        tools(
                            id,
                            name,
                            display_name,
                            description,
                            tool_type,
                            input_schema,
                            output_schema,
                            api_endpoint,
                            rate_limit
                        )
                    ''') \
                    .eq('agent_id', agent_id) \
                    .eq('is_enabled', True) \
                    .order('priority', desc=False) \
                    .execute()
            except Exception:
                # Fallback to agent_tools if agent_tool_assignments doesn't exist
                result = self.supabase.table('agent_tools') \
                    .select('tool_id, tools(*)') \
                    .eq('agent_id', agent_id) \
                    .execute()
            
            if result.data:
                for row in result.data:
                    tool_data = row.get('tools')
                    if tool_data:
                        tools.append({
                            'id': tool_data.get('id'),
                            'name': tool_data.get('name'),
                            'display_name': tool_data.get('display_name'),
                            'description': tool_data.get('description'),
                            'tool_type': tool_data.get('tool_type'),
                            'input_schema': tool_data.get('input_schema'),
                            'output_schema': tool_data.get('output_schema'),
                            'api_endpoint': tool_data.get('api_endpoint'),
                            'is_required': row.get('is_required', False),
                            'priority': row.get('priority', 0),
                        })
            
            logger.debug("tools_fetched", agent_id=agent_id, tool_count=len(tools))
            
        except Exception as e:
            logger.warning("fetch_tools_failed", agent_id=agent_id, error=str(e))
        
        return tools
    
    def _build_capabilities_prompt_section(
        self,
        capabilities: List[Capability],
    ) -> str:
        """
        Build a prompt section describing agent capabilities and skills.
        
        This can be injected into the system prompt to inform the agent
        of its available skills.
        """
        if not capabilities:
            return ""
        
        sections = ["## YOUR CAPABILITIES & SKILLS\n"]
        
        for cap in capabilities:
            primary_marker = " ⭐" if cap.is_primary else ""
            sections.append(f"### {cap.display_name or cap.name}{primary_marker}")
            sections.append(f"Category: {cap.category} | Proficiency: {cap.proficiency_level}")
            
            if cap.skills:
                sections.append("\n**Available Skills:**")
                for skill in cap.skills:
                    skill_marker = "★" if skill.is_primary else "•"
                    invocation = f" (invoke: {skill.invocation_method})" if skill.invocation_method else ""
                    sections.append(
                        f"  {skill_marker} {skill.display_name or skill.name} "
                        f"[{skill.skill_type}]{invocation}"
                    )
            sections.append("")
        
        return "\n".join(sections)
    
    def _build_tools_prompt_section(
        self,
        tools: List[Dict[str, Any]],
    ) -> str:
        """
        Build a prompt section describing available L5 tools.
        """
        if not tools:
            return ""
        
        sections = ["## AVAILABLE TOOLS (L5)\n"]
        
        for tool in tools:
            required_marker = " [REQUIRED]" if tool.get('is_required') else ""
            sections.append(f"• **{tool.get('display_name', tool.get('name'))}**{required_marker}")
            if tool.get('description'):
                sections.append(f"  {tool['description']}")
        
        return "\n".join(sections)
    
    async def update_session_metrics(
        self,
        session_id: str,
        input_tokens: int,
        output_tokens: int,
        cost_usd: float,
        response_time_ms: Optional[int] = None,
    ) -> None:
        """
        Update session metrics after a query.
        
        Call this after each LLM response.
        """
        try:
            # Update using RPC function if available
            self.supabase.rpc('update_session_metrics', {
                'p_session_id': session_id,
                'p_input_tokens': input_tokens,
                'p_output_tokens': output_tokens,
                'p_cost_usd': cost_usd,
                'p_response_time_ms': response_time_ms,
            }).execute()
            
            logger.debug(
                "session_metrics_updated",
                session_id=session_id,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
            )
        except Exception as e:
            # Non-critical - log and continue
            logger.warning("update_session_metrics_failed", error=str(e))
    
    async def complete_session(self, session_id: str) -> None:
        """Mark session as completed."""
        try:
            self.supabase.table('agent_sessions') \
                .update({
                    'status': 'completed',
                    'completed_at': datetime.utcnow().isoformat(),
                }) \
                .eq('id', session_id) \
                .execute()
            
            logger.info("session_completed", session_id=session_id)
        except Exception as e:
            logger.warning("complete_session_failed", error=str(e))

    # =========================================================================
    # LEVEL-SPECIFIC INSTANTIATION (L1-L5)
    # =========================================================================

    async def instantiate_by_level(
        self,
        level: int,
        agent_id: str,
        user_id: str,
        tenant_id: str,
        context: Optional[Dict[str, str]] = None,
        personality_type_id: Optional[str] = None,
    ) -> InstantiatedAgentConfig:
        """
        Instantiate agent by level with appropriate configuration.
        
        Args:
            level: Agent level (1-5)
            agent_id: UUID of the agent
            user_id: UUID of the user
            tenant_id: UUID of the tenant
            context: Optional context dict {region_id, domain_id, therapeutic_area_id, phase_id}
            personality_type_id: Optional personality override
            
        Returns:
            InstantiatedAgentConfig for L1-L3
            For L4/L5, returns config with attached worker/tool implementations
        """
        context = context or {}
        
        if level in [1, 2, 3]:
            # L1-L3: Full dynamic instantiation
            return await self.instantiate_agent(
                agent_id=agent_id,
                user_id=user_id,
                tenant_id=tenant_id,
                region_id=context.get('region_id'),
                domain_id=context.get('domain_id'),
                therapeutic_area_id=context.get('therapeutic_area_id'),
                phase_id=context.get('phase_id'),
                personality_type_id=personality_type_id,
            )
        elif level == 4:
            # L4: Hybrid - DB config + Python worker
            return await self._instantiate_l4_worker(
                agent_id=agent_id,
                tenant_id=tenant_id,
                context=context,
            )
        elif level == 5:
            # L5: Hybrid - DB registry + Python tool
            return await self._instantiate_l5_tool(
                agent_id=agent_id,
                tenant_id=tenant_id,
            )
        else:
            raise ValueError(f"Invalid agent level: {level}")

    async def _instantiate_l4_worker(
        self,
        agent_id: str,
        tenant_id: str,
        context: Dict[str, str],
    ) -> InstantiatedAgentConfig:
        """
        Instantiate L4 Worker with DB config + Python implementation.
        
        L4 Workers are stateless task executors:
        - Config from Supabase (temperature, allowed tools, capabilities, skills)
        - Execution code from Python files (l4_workers/*.py)
        """
        # Fetch worker config from DB
        agent = await self._fetch_agent(agent_id)
        if not agent:
            raise ValueError(f"L4 Worker not found: {agent_id}")
        
        # Get worker personality (usually low temperature for determinism)
        personality = await self._fetch_personality(agent.get('personality_type_id'))
        
        # Get capabilities with skills for this worker
        capabilities = await self._fetch_capabilities_with_skills(agent_id)
        
        # Get allowed L5 tools for this worker
        allowed_tools = await self._fetch_allowed_tools(agent_id)
        
        # Build minimal system prompt for worker (with capabilities & tools)
        system_prompt = self._build_worker_prompt(agent, context, capabilities, allowed_tools)
        
        # Build LLM config (L4 uses efficient models)
        llm_config = {
            'model': agent.get('base_model', 'claude-3-5-haiku-20241022'),
            'temperature': personality.temperature if personality else 0.2,
            'max_tokens': 1024,  # L4 budget: 300-500
        }
        
        return InstantiatedAgentConfig(
            session_id=str(uuid.uuid4()),  # No session for stateless workers
            agent_id=agent_id,
            agent_name=agent.get('name', 'Unknown Worker'),
            agent_display_name=agent.get('display_name'),
            level=4,
            system_prompt=system_prompt,
            personality=personality,
            context=ResolvedContext(),  # Workers are context-agnostic
            llm_config=llm_config,
            created_at=datetime.utcnow(),
            capabilities=capabilities,
            allowed_tools=allowed_tools,
        )

    async def _instantiate_l5_tool(
        self,
        agent_id: str,
        tenant_id: str,
    ) -> InstantiatedAgentConfig:
        """
        Instantiate L5 Tool with DB registry + Python implementation.
        
        L5 Tools are deterministic functions:
        - Registry from Supabase (schema, permissions, rate limits, capabilities)
        - Implementation from Python files (l5_tools/*.py)
        """
        # Fetch tool config from DB
        agent = await self._fetch_agent(agent_id)
        if not agent:
            raise ValueError(f"L5 Tool not found: {agent_id}")
        
        # L5 tools can also have capabilities (what they can do)
        capabilities = await self._fetch_capabilities_with_skills(agent_id)
        
        # L5 tools don't use LLM - return minimal config
        return InstantiatedAgentConfig(
            session_id=str(uuid.uuid4()),
            agent_id=agent_id,
            agent_name=agent.get('name', 'Unknown Tool'),
            agent_display_name=agent.get('display_name'),
            level=5,
            system_prompt='',  # L5 tools don't need prompts
            personality=PersonalityConfig(id='', slug='tool', display_name='Tool'),
            context=ResolvedContext(),
            llm_config={},  # No LLM for L5
            created_at=datetime.utcnow(),
            capabilities=capabilities,
            allowed_tools=[],  # L5 tools don't invoke other tools
        )

    def _build_worker_prompt(
        self,
        agent: Dict[str, Any],
        context: Dict[str, str],
        capabilities: Optional[List[Capability]] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
    ) -> str:
        """Build minimal prompt for L4 worker with capabilities and tools."""
        base_prompt = agent.get('system_prompt', '')
        
        # Workers are focused - add only essential context
        prompt_parts = [
            f"""You are a specialized worker agent.
        
{base_prompt}

WORKER GUIDELINES:
- Execute the assigned task efficiently
- Return structured output
- Do not make decisions beyond your scope
- Report any blockers or uncertainties"""
        ]
        
        # Add capabilities if present
        if capabilities:
            cap_section = self._build_capabilities_prompt_section(capabilities)
            if cap_section:
                prompt_parts.append("\n\n" + cap_section)
        
        # Add tools if present
        if tools:
            tools_section = self._build_tools_prompt_section(tools)
            if tools_section:
                prompt_parts.append("\n\n" + tools_section)
        
        return "\n".join(prompt_parts)

    # =========================================================================
    # AGENT SELECTION (L1 Master Role)
    # =========================================================================

    async def select_agents_for_query(
        self,
        query: str,
        tenant_id: str,
        target_level: int = 2,  # Default to L2 experts
        max_agents: int = 3,
        context: Optional[Dict[str, str]] = None,
    ) -> list:
        """
        Select best agents for a query using Fusion Intelligence.
        
        This is the L1 Master's agent selection capability.
        
        Args:
            query: User query
            tenant_id: Tenant UUID
            target_level: Level to select from (2 or 3)
            max_agents: Maximum agents to return
            context: Optional context for filtering
            
        Returns:
            List of agent configs with confidence scores
        """
        from fusion import FusionEngine
        
        try:
            fusion_engine = FusionEngine()
            result = await fusion_engine.retrieve(
                query=query,
                tenant_id=tenant_id,
                context=context or {},
            )
            
            # Filter by target level
            selected = []
            for agent_id, score, metadata in result.fused_rankings:
                agent = await self._fetch_agent(agent_id)
                if agent and self._get_agent_level(agent) == target_level:
                    selected.append({
                        'agent_id': agent_id,
                        'name': agent.get('name'),
                        'display_name': agent.get('display_name'),
                        'level': target_level,
                        'confidence': round(score * 100),  # Normalized to 0-100
                        'domain': agent.get('business_function'),
                    })
                    if len(selected) >= max_agents:
                        break
            
            return selected
            
        except Exception as e:
            logger.error("agent_selection_failed", error=str(e))
            return []

    async def get_available_agents(
        self,
        tenant_id: str,
        level: Optional[int] = None,
        domain: Optional[str] = None,
    ) -> list:
        """
        Get list of available agents for user selection.
        
        Used in Mode 1 (manual selection) and Mode 3.
        
        Args:
            tenant_id: Tenant UUID
            level: Filter by level (2 or 3)
            domain: Filter by business function
            
        Returns:
            List of available agents
        """
        try:
            query = self.supabase.table('agents') \
                .select('id, name, display_name, description, avatar, business_function, agent_levels(level_number)') \
                .eq('status', 'active') \
                .eq('is_available', True)
            
            if level:
                query = query.eq('agent_levels.level_number', level)
            
            if domain:
                query = query.eq('business_function', domain)
            
            result = query.execute()
            
            return [{
                'id': a['id'],
                'name': a['name'],
                'display_name': a['display_name'],
                'description': a['description'],
                'avatar': a['avatar'],
                'domain': a['business_function'],
                'level': a.get('agent_levels', {}).get('level_number', 2),
            } for a in result.data]
            
        except Exception as e:
            logger.error("get_available_agents_failed", error=str(e))
            return []
