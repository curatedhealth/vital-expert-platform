"""
VITAL Path AI Services - VITAL L1 Master Orchestrator

L1 Master is the highest-level intelligence in the VITAL hierarchy.
Uses Claude Opus 4 for strategic orchestration and Fusion Intelligence.

Architecture Pattern:
- PostgreSQL `agents` table: ALL config (model, temperature, max_tokens, system_prompt)
- Python: Execution logic only
- .env: API credentials (OPENAI_API_KEY, ANTHROPIC_API_KEY)

Naming Convention:
- Class: L1MasterOrchestrator
- Methods: l1_{action}
- Logs: l1_{action}

Responsibilities:
- Team selection using Fusion Intelligence
- Mission decomposition
- Quality assurance
- Cost optimization
"""

from typing import Dict, Any, List, Tuple, Optional
from dataclasses import dataclass, field
from datetime import datetime
import json
import structlog

from pydantic import BaseModel, Field

from ..base_agent import BaseAgent, AgentConfig
from .prompts import (
    L1_FUSION_SYSTEM_PROMPT,
    L1_MISSION_DECOMPOSITION_PROMPT,
    L1_QUALITY_REVIEW_PROMPT,
)

# Import AgentLoader for database-driven config
from infrastructure.database.agent_loader import (
    AgentLoader,
    AgentConfig as DBAgentConfig,
    get_orchestrator,
)

logger = structlog.get_logger()


class TeamSelectionEvidence(BaseModel):
    """Evidence supporting team selection by L1 Master."""
    vector_scores: Dict[str, float] = Field(
        default_factory=dict,
        description="Agent ID -> vector similarity score"
    )
    graph_paths: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Neo4j relationship paths"
    )
    historical_patterns: Dict[str, Any] = Field(
        default_factory=dict,
        description="PostgreSQL historical performance data"
    )
    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Overall confidence in selection"
    )
    reasoning: str = Field(
        default="",
        description="L1 Master's reasoning for the selection"
    )


@dataclass
class MissionTask:
    """Single task in a decomposed mission."""
    task_id: str
    task_type: str
    description: str
    assigned_level: str  # L2, L3, L4
    required_tools: List[str] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)
    success_criteria: str = ""
    assigned_expert_type: Optional[str] = None


class L1MasterOrchestrator(BaseAgent):
    """
    VITAL L1 Master Orchestrator.
    
    The highest-level intelligence that:
    - Selects optimal expert teams using Fusion Intelligence
    - Decomposes complex missions into executable tasks
    - Performs final quality review
    - Optimizes for cost and accuracy
    
    Uses Claude Opus 4 for maximum reasoning capability.
    """
    
    def __init__(
        self,
        config: AgentConfig,
        fusion_engine: Optional["AskExpertFusionEngine"] = None,
        llm=None,
        db_config: Optional[DBAgentConfig] = None,
    ):
        """
        Initialize L1 Master Orchestrator.

        Architecture: ALL config comes from PostgreSQL agents table.
        - model, temperature, max_tokens from db_config (DBAgentConfig)
        - Python provides execution logic only

        Args:
            config: Legacy AgentConfig (for backward compat)
            fusion_engine: FusionEngine for triple retrieval
            llm: Pre-configured LLM (optional, for DI)
            db_config: Database config from AgentLoader (preferred)
        """
        super().__init__(config)
        self.fusion_engine = fusion_engine
        self.db_config = db_config

        # Get model config from database (db_config) or fallback to legacy config
        if db_config:
            model = db_config.base_model
            temperature = db_config.temperature
            max_tokens = db_config.max_tokens
            self.system_prompt = db_config.get_effective_system_prompt()
        else:
            # Legacy fallback - log warning
            model = config.model or "gpt-4o"
            temperature = getattr(config, 'temperature', 0.3)
            max_tokens = getattr(config, 'max_tokens', 4000)
            self.system_prompt = None
            logger.warning(
                "l1_using_legacy_config",
                note="Config should come from PostgreSQL agents table via db_config"
            )

        self.token_budget = max_tokens

        # Initialize LLM if not provided
        if llm:
            self.llm = llm
        else:
            try:
                from langchain_openai import ChatOpenAI
                self.llm = ChatOpenAI(
                    model=model,
                    temperature=temperature,  # From DB, not hardcoded!
                    max_tokens=max_tokens,    # From DB, not hardcoded!
                )
            except ImportError:
                logger.warning("l1_llm_not_available")
                self.llm = None

        logger.info(
            "l1_master_initialized",
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            fusion_enabled=fusion_engine is not None,
            config_source="database" if db_config else "legacy",
        )

    @classmethod
    async def from_database(
        cls,
        agent_id: str,
        fusion_engine: Optional["AskExpertFusionEngine"] = None,
    ) -> "L1MasterOrchestrator":
        """
        Factory method: Create L1 Master from PostgreSQL agents table.

        This is the PREFERRED way to create L1 Masters.
        All config (model, temperature, max_tokens) comes from database.

        Args:
            agent_id: UUID of the L1 agent in agents table
            fusion_engine: Optional FusionEngine

        Returns:
            L1MasterOrchestrator configured from database
        """
        loader = AgentLoader.get_instance()
        db_config = await loader.get_agent(agent_id)

        if not db_config:
            raise ValueError(f"L1 agent not found in database: {agent_id}")

        # Create legacy AgentConfig for backward compat
        legacy_config = AgentConfig(
            name=db_config.name,
            role="l1_master",
            model=db_config.base_model,
        )

        return cls(
            config=legacy_config,
            fusion_engine=fusion_engine,
            db_config=db_config,
        )

    @classmethod
    async def for_context(
        cls,
        tenant_id: str,
        function_name: Optional[str] = None,
        department_name: Optional[str] = None,
        fusion_engine: Optional["AskExpertFusionEngine"] = None,
    ) -> Optional["L1MasterOrchestrator"]:
        """
        Factory method: Get the best L1 Master for a given context.

        Uses AgentLoader to find the optimal L1 orchestrator based on
        tenant, function, and department.

        Args:
            tenant_id: Tenant UUID
            function_name: e.g., "Medical Affairs"
            department_name: e.g., "Medical Information"
            fusion_engine: Optional FusionEngine

        Returns:
            L1MasterOrchestrator configured from database, or None
        """
        db_config = await get_orchestrator(
            tenant_id=tenant_id,
            function_name=function_name,
            department_name=department_name,
        )

        if not db_config:
            logger.warning(
                "l1_no_orchestrator_found",
                tenant_id=tenant_id,
                function=function_name,
            )
            return None

        legacy_config = AgentConfig(
            name=db_config.name,
            role="l1_master",
            model=db_config.base_model,
        )

        return cls(
            config=legacy_config,
            fusion_engine=fusion_engine,
            db_config=db_config,
        )
    
    async def select_team(
        self,
        query: str,
        context: Dict[str, Any],
        tenant_id: str,
        max_team_size: int = 5,
    ) -> Tuple[List[str], TeamSelectionEvidence]:
        """
        Select optimal expert team using Fusion Intelligence.

        Args:
            query: User's query
            context: Additional context (mode, constraints, etc.)
            tenant_id: Tenant UUID for isolation
            max_team_size: Maximum experts to select

        Returns:
            Tuple of (selected_expert_ids, evidence)
        """
        logger.info(
            "l1_select_team_started",
            tenant_id=tenant_id,
            query_preview=query[:100],
            max_team_size=max_team_size,
        )

        try:
            # Step 1: Get evidence from Fusion Engine or database fallback
            fusion_results = None
            db_candidates = []

            if self.fusion_engine:
                fusion_results = await self.fusion_engine.retrieve(
                    query=query,
                    tenant_id=tenant_id,
                    top_k=20,  # Get more candidates
                )
            else:
                # Database fallback: Get active L2 experts for this tenant
                db_candidates = await self._get_db_candidates(tenant_id, max_team_size * 4)
                logger.info(
                    "l1_using_db_fallback",
                    tenant_id=tenant_id,
                    candidates_count=len(db_candidates),
                )

            # Step 2: Format evidence for L1 reasoning
            evidence_context = self._format_evidence_for_llm(fusion_results)

            # If using database fallback, add candidates to evidence context
            if db_candidates and not fusion_results:
                candidate_info = "\n".join([
                    f"- {c['id']}: {c['name']} ({c.get('level', 'L2')}) - {c.get('description', 'No description')[:100]}"
                    for c in db_candidates[:10]
                ])
                evidence_context = f"Available Experts from Database:\n{candidate_info}"

            # Step 3: If no fusion but have DB candidates, use LLM-based selection
            if not self.fusion_engine and db_candidates:
                # Format candidates for LLM selection with level info
                def get_level_label(agent):
                    """Infer agent level from name, description, and agent_level_id."""
                    # First check the agent name for level clues
                    name = (agent.get('name') or '').lower()
                    desc = (agent.get('description') or '').lower()
                    combined = f"{name} {desc}"

                    # Check for explicit level indicators in name
                    if 'tool' in name or 'searcher' in name or 'parser' in name or 'calculator' in name:
                        return 'L5-Tool'
                    elif 'worker' in name or 'generator' in name or 'compiler' in name:
                        return 'L4-Worker'
                    elif 'specialist' in name:
                        return 'L3-Specialist'
                    elif 'expert' in name or 'director' in name or 'lead' in name or 'strategist' in name:
                        return 'L2-Expert'
                    elif 'master' in name or 'orchestrator' in name:
                        return 'L1-Master'

                    # Check description for clues
                    if 'search' in desc and 'database' in desc:
                        return 'L5-Tool'
                    elif 'execute' in desc or 'generate document' in desc:
                        return 'L4-Worker'
                    elif 'specialized' in desc or 'deep expertise' in desc:
                        return 'L3-Specialist'
                    elif 'strategic' in desc or 'advise' in desc or 'synthesize' in desc:
                        return 'L2-Expert'

                    # Check department/function for hints
                    dept = (agent.get('department_name') or '').lower()
                    func = (agent.get('function_name') or '').lower()
                    if 'heor' in dept or 'market access' in dept or func:
                        return 'L2-Expert'  # These are typically experts
                    if 'field medical' in dept or 'msl' in dept:
                        return 'L2-Expert'

                    # Default based on agent_level_id if present
                    level_id = agent.get('agent_level_id')
                    if level_id:
                        level_str = str(level_id).lower()
                        if 'l1' in level_str or 'master' in level_str:
                            return 'L1-Master'
                        elif 'l2' in level_str or 'expert' in level_str:
                            return 'L2-Expert'
                        elif 'l3' in level_str or 'specialist' in level_str:
                            return 'L3-Specialist'
                        elif 'l4' in level_str or 'worker' in level_str:
                            return 'L4-Worker'
                        elif 'l5' in level_str or 'tool' in level_str:
                            return 'L5-Tool'

                    return 'L2-Expert'  # Default to Expert if unknown

                # Include more candidates and level info
                candidate_info = "\n".join([
                    f"- ID: {c['id']}\n  Name: {c['name']}\n  Level: {get_level_label(c.get('agent_level_id'))}\n  Department: {c.get('department_name', 'N/A')}\n  Function: {c.get('function_name', 'N/A')}\n  Description: {(c.get('description') or 'No description')[:250]}"
                    for c in db_candidates[:25]  # Increase to 25 candidates for better coverage
                ])

                logger.info(
                    "l1_llm_selection_starting",
                    llm_available=self.llm is not None,
                    candidates_count=len(db_candidates),
                )

                # Use LLM to intelligently select the best expert
                if self.llm:
                    from langchain_core.messages import SystemMessage, HumanMessage

                    # Create a mapping of candidate IDs for reference
                    id_to_name = {c['id']: c['name'] for c in db_candidates[:15]}

                    selection_prompt = f"""You are the L1 Master Orchestrator analyzing a query to select the optimal agent.

USER QUERY: {query}

AVAILABLE AGENTS:
{candidate_info}

=== STEP 1: QUERY ANALYSIS ===
First, analyze the query to determine:
1. Query Type: Strategic/Advisory, Operational/Task, Research/Analysis, Data Lookup, Simple Q&A
2. Complexity: High (multi-faceted, requires synthesis), Medium, Low (simple lookup)
3. Domain: Identify the primary domain (Market Access, Regulatory, Clinical, Medical Affairs, etc.)

=== STEP 2: AGENT LEVEL SELECTION ===
Based on query type, select the appropriate agent LEVEL:

L1 (Masters): Orchestration, delegation - NOT for direct answers
L2 (Experts): Strategic advice, comprehensive analysis, synthesis - USE FOR:
   - "Develop a strategy...", "Advise on...", "Analyze...", "What are the implications..."
   - Complex questions requiring domain expertise and judgment
   - Reimbursement strategy, market access planning, regulatory strategy
L3 (Specialists): Deep domain-specific expertise, focused tasks
L4 (Workers): Execute specific workflows, document generation, operational tasks
L5 (Tools): Data retrieval, search, calculation - USE ONLY FOR:
   - "Search for...", "Find...", "Look up...", "Calculate..."
   - Simple data queries that need database/API access

=== STEP 3: SELECTION CRITERIA ===
For STRATEGIC/ADVISORY queries (like "develop a strategy", "advise", "recommend"):
→ STRONGLY PREFER L2 Experts or L3 Specialists with matching domain
→ Look for: HEOR, Market Access, Reimbursement, Strategy in name/department

For DATA LOOKUP queries:
→ L5 Tools are appropriate

=== DOMAIN MATCHING ===
- Reimbursement, pricing, HTA, payer → HEOR, Market Access, Reimbursement experts
- Clinical trials, study design → Clinical Operations, Clinical Development
- Regulatory, FDA, EMA → Regulatory Affairs
- Medical information → Medical Information Services

RESPOND WITH ONLY a JSON object:
{{"selected_ids": ["uuid1"], "reasoning": "Query type: [type]. Optimal level: [L2/L3/L4/L5]. Selected [agent name] because [domain match explanation]"}}

CRITICAL: For strategic questions like "develop a strategy" or "advise on", select L2/L3 domain experts, NOT L5 tools."""

                    try:
                        logger.info("l1_llm_invoking", prompt_length=len(selection_prompt))
                        response = await self.llm.ainvoke([
                            SystemMessage(content="You are an expert team selector. Match queries to the most relevant experts based on their descriptions and domains. Respond ONLY with valid JSON."),
                            HumanMessage(content=selection_prompt),
                        ])

                        # Parse LLM response
                        import re
                        response_text = response.content
                        logger.info("l1_llm_response_received", response_length=len(response_text), response_preview=response_text[:300])

                        # More robust JSON extraction - find the outermost { and }
                        start_idx = response_text.find('{')
                        end_idx = response_text.rfind('}')
                        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                            json_str = response_text[start_idx:end_idx + 1]
                            logger.info("l1_llm_json_extracted", json_str=json_str[:200])

                            selection_result = json.loads(json_str)
                            selected_experts = selection_result.get("selected_ids", [])[:max_team_size]
                            reasoning = selection_result.get("reasoning", "LLM-based expert selection")

                            logger.info("l1_llm_parsed", selected_ids=selected_experts, reasoning=reasoning[:100])

                            # Validate IDs exist in candidates
                            valid_ids = {c['id'] for c in db_candidates}
                            selected_experts = [eid for eid in selected_experts if eid in valid_ids]

                            logger.info("l1_llm_validated", valid_count=len(selected_experts), valid_ids=selected_experts)

                            if selected_experts:
                                # Log which expert was selected
                                selected_names = [id_to_name.get(eid, "Unknown") for eid in selected_experts]
                                evidence = TeamSelectionEvidence(
                                    vector_scores={},
                                    graph_paths=[],
                                    historical_patterns={},
                                    confidence=0.75,  # Higher confidence for LLM selection
                                    reasoning=f"LLM-based selection: {reasoning}",
                                )

                                logger.info(
                                    "l1_select_team_llm_success",
                                    tenant_id=tenant_id,
                                    selected_count=len(selected_experts),
                                    selected_ids=selected_experts,
                                    selected_names=selected_names,
                                    confidence=0.75,
                                )

                                return selected_experts, evidence
                            else:
                                logger.warning("l1_llm_no_valid_ids", raw_ids=selection_result.get("selected_ids", []))
                        else:
                            logger.warning("l1_llm_no_json_found", response_text=response_text[:500])
                    except json.JSONDecodeError as json_err:
                        logger.warning("l1_llm_json_parse_failed", error=str(json_err), response_preview=response_text[:300] if 'response_text' in dir() else "N/A")
                    except Exception as llm_err:
                        logger.warning("l1_llm_selection_failed", error=str(llm_err), error_type=type(llm_err).__name__)
                else:
                    logger.warning("l1_llm_not_available", note="self.llm is None, skipping LLM selection")

                # Final fallback: take first max_team_size agents
                selected_experts = [c['id'] for c in db_candidates[:max_team_size]]
                reasoning = f"Database fallback selection: Selected {len(selected_experts)} experts from tenant's active agent pool"

                evidence = TeamSelectionEvidence(
                    vector_scores={},
                    graph_paths=[],
                    historical_patterns={},
                    confidence=0.5,  # Medium confidence for DB fallback
                    reasoning=reasoning,
                )

                logger.info(
                    "l1_select_team_db_fallback",
                    tenant_id=tenant_id,
                    selected_count=len(selected_experts),
                    confidence=0.5,
                )

                return selected_experts, evidence

            # Step 4: Use fusion results directly for agent IDs (they have real UUIDs)
            # The LLM tends to generate placeholder UUIDs like "expert-uuid-123"
            # So we use fused_rankings for IDs, and optionally get reasoning from LLM
            if fusion_results and hasattr(fusion_results, 'fused_rankings') and fusion_results.fused_rankings:
                # ALWAYS use real UUIDs from fusion results
                selected_experts = [
                    item[0] for item in fusion_results.fused_rankings[:max_team_size]
                ]

                # Get reasoning from LLM if available (but don't use LLM-generated IDs!)
                reasoning = f"Fusion-based selection: Top {len(selected_experts)} agents by combined vector+graph+relational scores"
                if self.llm:
                    try:
                        from langchain_core.messages import SystemMessage, HumanMessage

                        # Get agent names for better reasoning
                        agent_summary = []
                        for i, (agent_id, score, meta) in enumerate(fusion_results.fused_rankings[:max_team_size]):
                            name = meta.get('name', 'Unknown') if isinstance(meta, dict) else 'Unknown'
                            agent_summary.append(f"{i+1}. {name} (ID: {agent_id[:8]}..., score: {score:.3f})")

                        reasoning_prompt = f"""Based on the fusion results, explain why these experts were selected for the query:

Query: {query}

Selected Experts (by fusion score):
{chr(10).join(agent_summary)}

Evidence Context:
{evidence_context}

Provide a 2-3 sentence reasoning explaining why these experts are optimal for this query.
Do NOT output JSON, just the reasoning text."""

                        response = await self.llm.ainvoke([
                            SystemMessage(content="You are an expert at explaining AI agent selection decisions."),
                            HumanMessage(content=reasoning_prompt),
                        ])
                        reasoning = response.content.strip()
                        logger.info("l1_fusion_reasoning_generated", reasoning_length=len(reasoning))
                    except Exception as e:
                        logger.warning("l1_reasoning_generation_failed", error=str(e))
                        # Keep default reasoning

                logger.info(
                    "l1_fusion_selection_direct",
                    selected_count=len(selected_experts),
                    selected_ids=selected_experts,
                    note="Using real UUIDs from fusion fused_rankings",
                )

            else:
                # No fusion results - use fallback
                selected_experts = []
                reasoning = "No fusion results available"

            # Step 6: Create evidence object
            evidence = TeamSelectionEvidence(
                vector_scores=fusion_results.vector_scores if fusion_results else {},
                graph_paths=fusion_results.graph_paths if fusion_results else [],
                historical_patterns=fusion_results.relational_patterns if fusion_results else {},
                confidence=self._calculate_confidence(fusion_results),
                reasoning=reasoning,
            )

            logger.info(
                "l1_select_team_completed",
                tenant_id=tenant_id,
                selected_count=len(selected_experts),
                confidence=evidence.confidence,
            )

            return selected_experts, evidence

        except Exception as e:
            logger.error(
                "l1_select_team_failed",
                tenant_id=tenant_id,
                error=str(e),
            )
            # Return empty selection on error
            return [], TeamSelectionEvidence(
                reasoning=f"Selection failed: {str(e)}",
                confidence=0.0,
            )

    async def _get_db_candidates(self, tenant_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get agent candidates from database when Fusion Engine is unavailable.

        Strategy: Get ALL active agents (no level filter) and let LLM select the best match.
        This ensures Market Access, HEOR, and other specialized agents are included.
        """
        try:
            from services.supabase_client import SupabaseClient

            client = SupabaseClient()
            await client.initialize()

            candidates = []
            seen_ids = set()

            # Use larger limit for LLM selection - we want diverse candidates
            effective_limit = min(limit * 3, 50)  # Get up to 50 candidates for LLM to choose from

            # Step 1: Get ALL active agents for this tenant (no level filter)
            if tenant_id:
                response = client.client.from_("agents").select(
                    "id, name, description, agent_level_id, function_name, department_name"
                ).eq(
                    "status", "active"
                ).eq(
                    "tenant_id", tenant_id
                ).not_.is_(
                    "description", "null"  # Prefer agents with descriptions
                ).limit(effective_limit).execute()

                if response.data:
                    for agent in response.data:
                        if agent['id'] not in seen_ids:
                            candidates.append(agent)
                            seen_ids.add(agent['id'])
                    logger.info("l1_db_tenant_candidates", tenant_id=tenant_id, count=len(response.data))

            # Step 2: Add global agents (tenant_id IS NULL) - these are shared across tenants
            if len(candidates) < effective_limit:
                remaining = effective_limit - len(candidates)
                response = client.client.from_("agents").select(
                    "id, name, description, agent_level_id, function_name, department_name"
                ).eq(
                    "status", "active"
                ).is_(
                    "tenant_id", "null"
                ).not_.is_(
                    "description", "null"
                ).limit(remaining).execute()

                if response.data:
                    for agent in response.data:
                        if agent['id'] not in seen_ids:
                            candidates.append(agent)
                            seen_ids.add(agent['id'])
                    logger.info("l1_db_global_candidates", count=len(response.data))

            # Step 3: If still not enough, get ANY active agent (even without descriptions)
            if len(candidates) < 10:  # Need minimum 10 for good selection
                remaining = effective_limit - len(candidates)
                response = client.client.from_("agents").select(
                    "id, name, description, agent_level_id, function_name, department_name"
                ).eq(
                    "status", "active"
                ).limit(remaining).execute()

                if response.data:
                    for agent in response.data:
                        if agent['id'] not in seen_ids:
                            candidates.append(agent)
                            seen_ids.add(agent['id'])
                    logger.info("l1_db_any_active_candidates", count=len(response.data))

            logger.info(
                "l1_db_candidates_result",
                tenant_id=tenant_id,
                total_candidates=len(candidates),
            )

            return candidates

        except Exception as e:
            logger.warning(
                "l1_db_candidates_failed",
                tenant_id=tenant_id,
                error=str(e),
            )
            return []
    
    async def decompose_mission(
        self,
        query: str,
        context: Dict[str, Any],
        selected_experts: List[str],
    ) -> List[MissionTask]:
        """
        Decompose a complex mission into executable tasks.
        
        Args:
            query: User's mission/goal
            context: Additional context
            selected_experts: Already selected expert IDs
            
        Returns:
            List of decomposed tasks
        """
        logger.info(
            "l1_decompose_mission_started",
            query_preview=query[:100],
            expert_count=len(selected_experts),
        )
        
        try:
            if self.llm:
                from langchain_core.messages import SystemMessage, HumanMessage
                
                decomposition_prompt = f"""
Mission: {query}

Context: {json.dumps(context, indent=2)}

Available Experts: {json.dumps(selected_experts)}

Decompose this mission into executable tasks.
Respond with valid JSON following the format in your instructions.
"""
                
                response = await self.llm.ainvoke([
                    SystemMessage(content=L1_MISSION_DECOMPOSITION_PROMPT),
                    HumanMessage(content=decomposition_prompt),
                ])
                
                tasks = self._parse_decomposition_response(response.content)
                
            else:
                # Fallback: Simple decomposition
                tasks = self._fallback_decomposition(query)
            
            logger.info(
                "l1_decompose_mission_completed",
                task_count=len(tasks),
            )
            
            return tasks
            
        except Exception as e:
            logger.error(
                "l1_decompose_mission_failed",
                error=str(e),
            )
            return self._fallback_decomposition(query)
    
    async def review_output(
        self,
        response: str,
        query: str,
        evidence: Dict[str, Any],
        tenant_id: str,
    ) -> Dict[str, Any]:
        """
        Perform final quality review before returning to user.
        
        Args:
            response: Generated response to review
            query: Original query
            evidence: Evidence used to generate response
            tenant_id: Tenant UUID
            
        Returns:
            Review result with approval status
        """
        logger.info(
            "l1_review_output_started",
            tenant_id=tenant_id,
            response_length=len(response),
        )
        
        try:
            if self.llm:
                from langchain_core.messages import SystemMessage, HumanMessage
                
                review_prompt = f"""
Original Query: {query}

Generated Response:
{response}

Evidence Used:
{json.dumps(evidence, indent=2, default=str)}

Review this response for quality and compliance.
Respond with valid JSON following the format in your instructions.
"""
                
                review_response = await self.llm.ainvoke([
                    SystemMessage(content=L1_QUALITY_REVIEW_PROMPT),
                    HumanMessage(content=review_prompt),
                ])
                
                review_result = self._parse_review_response(review_response.content)
                
            else:
                # Fallback: Auto-approve with basic checks
                review_result = {
                    "review_status": "approved",
                    "quality_score": 0.8,
                    "approval_notes": "Auto-approved (LLM unavailable)",
                }
            
            logger.info(
                "l1_review_output_completed",
                tenant_id=tenant_id,
                status=review_result.get("review_status"),
                score=review_result.get("quality_score"),
            )
            
            return review_result
            
        except Exception as e:
            logger.error(
                "l1_review_output_failed",
                tenant_id=tenant_id,
                error=str(e),
            )
            return {
                "review_status": "approved",
                "quality_score": 0.7,
                "approval_notes": f"Review failed, auto-approved: {str(e)}",
            }
    
    # =========================================================================
    # HELPER METHODS
    # =========================================================================
    
    def _format_evidence_for_llm(self, fusion_results) -> str:
        """Format fusion results for LLM prompt."""
        if not fusion_results:
            return "No fusion evidence available."
        
        parts = []
        
        # Vector evidence
        if hasattr(fusion_results, 'vector_scores') and fusion_results.vector_scores:
            parts.append("## Vector Similarity Scores")
            for agent_id, score in sorted(
                fusion_results.vector_scores.items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]:
                parts.append(f"- {agent_id}: {score:.3f}")
        
        # Graph evidence
        if hasattr(fusion_results, 'graph_paths') and fusion_results.graph_paths:
            parts.append("\n## Graph Relationship Paths")
            for path in fusion_results.graph_paths[:5]:
                parts.append(f"- {path}")
        
        # Relational evidence
        if hasattr(fusion_results, 'relational_patterns') and fusion_results.relational_patterns:
            parts.append("\n## Historical Patterns")
            parts.append(json.dumps(fusion_results.relational_patterns, indent=2))
        
        return "\n".join(parts) if parts else "Limited evidence available."
    
    def _parse_selection_response(self, content: str) -> Tuple[List[str], str]:
        """Parse LLM selection response."""
        try:
            # Try to extract JSON
            json_start = content.find('{')
            json_end = content.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = content[json_start:json_end]
                data = json.loads(json_str)
                
                selected = [
                    e.get('expert_id') or e.get('id')
                    for e in data.get('selected_experts', [])
                    if e.get('expert_id') or e.get('id')
                ]
                reasoning = data.get('reasoning', '')
                
                return selected, reasoning
                
        except json.JSONDecodeError:
            pass
        
        return [], f"Could not parse response: {content[:200]}"
    
    def _parse_decomposition_response(self, content: str) -> List[MissionTask]:
        """Parse LLM decomposition response."""
        try:
            json_start = content.find('{')
            json_end = content.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = content[json_start:json_end]
                data = json.loads(json_str)
                
                tasks = []
                for t in data.get('tasks', []):
                    tasks.append(MissionTask(
                        task_id=t.get('task_id', ''),
                        task_type=t.get('task_type', ''),
                        description=t.get('description', ''),
                        assigned_level=t.get('assigned_level', 'L2'),
                        required_tools=t.get('required_tools', []),
                        dependencies=t.get('dependencies', []),
                        success_criteria=t.get('success_criteria', ''),
                        assigned_expert_type=t.get('assigned_expert_type'),
                    ))
                
                return tasks
                
        except json.JSONDecodeError:
            pass
        
        return self._fallback_decomposition("")
    
    def _parse_review_response(self, content: str) -> Dict[str, Any]:
        """Parse LLM review response."""
        try:
            json_start = content.find('{')
            json_end = content.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = content[json_start:json_end]
                return json.loads(json_str)
        except json.JSONDecodeError:
            pass
        
        return {
            "review_status": "approved",
            "quality_score": 0.75,
            "approval_notes": "Could not parse review response",
        }
    
    def _fallback_selection(self, fusion_results, max_team_size: int) -> List[str]:
        """Fallback selection when LLM unavailable."""
        if not fusion_results or not hasattr(fusion_results, 'fused_rankings'):
            return []
        
        return [
            item[0] for item in fusion_results.fused_rankings[:max_team_size]
        ]
    
    def _fallback_decomposition(self, query: str) -> List[MissionTask]:
        """Fallback decomposition when LLM unavailable."""
        return [
            MissionTask(
                task_id="task-1",
                task_type="evidence_gathering",
                description="Gather relevant evidence",
                assigned_level="L4",
                required_tools=["rag", "pubmed"],
            ),
            MissionTask(
                task_id="task-2",
                task_type="analysis",
                description="Analyze evidence and formulate response",
                assigned_level="L2",
                dependencies=["task-1"],
            ),
        ]
    
    def _calculate_confidence(self, fusion_results) -> float:
        """Calculate overall confidence from fusion results."""
        if not fusion_results:
            return 0.3
        
        # Base confidence on evidence quality
        confidence = 0.5
        
        if hasattr(fusion_results, 'vector_scores') and fusion_results.vector_scores:
            max_vector = max(fusion_results.vector_scores.values())
            confidence += 0.2 * max_vector
        
        if hasattr(fusion_results, 'graph_paths') and fusion_results.graph_paths:
            confidence += 0.15
        
        if hasattr(fusion_results, 'relational_patterns') and fusion_results.relational_patterns:
            confidence += 0.15
        
        return min(confidence, 1.0)
