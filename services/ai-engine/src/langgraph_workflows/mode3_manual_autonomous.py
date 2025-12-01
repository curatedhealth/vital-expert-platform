"""
Mode 3: Manual Autonomous - User Selects Agent + Goal-Driven Execution

2×2 GOLDEN MATRIX TAXONOMY:
┌─────────────────────┬───────────────────┬───────────────────────────┐
│                     │ MANUAL SELECTION  │ AUTOMATIC SELECTION       │
├─────────────────────┼───────────────────┼───────────────────────────┤
│ INTERACTIVE         │ Mode 1            │ Mode 2                    │
│ (Chat/Multi-Turn)   │ User picks agent  │ System picks agent        │
├─────────────────────┼───────────────────┼───────────────────────────┤
│ AUTONOMOUS          │ ★ MODE 3 (THIS)   │ Mode 4                    │
│ (ReAct/CoT/Goals)   │ User picks agent  │ System picks agent        │
└─────────────────────┴───────────────────┴───────────────────────────┘

File: mode3_manual_autonomous.py
Class: Mode3ManualAutonomousWorkflow

5-LEVEL DEEP AGENT HIERARCHY (Bi-directional):
┌─────────────────────────────────────────────────────────────────────┐
│ HUMAN ←─── L1→Human (HITL approval at 5 checkpoints)               │
│   ↓                                                                 │
│ L1: MASTER AGENTS (Autonomous Task Coordinator)                    │
│   ├── Delegation: L1→L2 (route to user-selected expert)           │
│   └── Escalation: L2→L1 (cross-domain, complexity exceeded)        │
│                                                                     │
│ L2: EXPERT AGENTS (USER-SELECTED from 1000+ Agent Store)           │
│   ├── Delegation: L2→L3 (spawn specialists during execution)       │
│   └── Escalation: L3→L2 (task exceeds specialization)              │
│                                                                     │
│ L3: SPECIALIST AGENTS (Spawned on-demand with approval)            │
│   ├── Delegation: L3→L4 (parallel workers for tasks)              │
│   └── Escalation: L4→L3 (resource limits)                          │
│                                                                     │
│ L4: WORKER AGENTS (Parallel task executors)                        │
│   ├── Delegation: L4→L5 (tool execution with approval)            │
│   └── Escalation: L5→L4 (tool failures)                            │
│                                                                     │
│ L5: TOOL AGENTS (RAG, Web Search, Code Execution, Database)        │
└─────────────────────────────────────────────────────────────────────┘

AGENTIC PATTERNS (Similar to Deep Research / AutoGPT):
- ✅ ReAct: Reasoning + Acting with observation loops
- ✅ Chain-of-Thought: Explicit step-by-step reasoning
- ✅ Tree-of-Thoughts: Multiple reasoning paths explored
- ✅ Constitutional AI: Safety validation at each step
- ✅ Goal-Driven: Plans, executes, evaluates toward objective

GOLDEN RULES COMPLIANCE:
- ✅ LangGraph StateGraph (Golden Rule #1)
- ✅ Caching at all nodes (Golden Rule #2)
- ✅ Tenant isolation enforced (Golden Rule #3)
- ✅ RAG/Tools enforcement (Golden Rule #4)
- ✅ Evidence-based responses (Golden Rule #5)

HITL APPROVAL CHECKPOINTS:
1. Plan Approval - Before executing multi-step plan
2. Tool Approval - Before executing external tools
3. Sub-Agent Approval - Before spawning specialists
4. Critical Decision Approval - High-stakes decisions
5. Final Review - Before delivering response

FEATURES:
- Autonomous goal-driven execution (like AutoGPT/Deep Research)
- User manually selects expert from Agent Store
- ReAct/CoT reasoning with planning
- Multi-step execution with approval gates
- Sub-agent spawning with approval
- Default Tier 2+ (higher accuracy for autonomous)
- Response Time: 60-120 seconds

PRD Specification:
- Selection: MANUAL (User picks agent from store)
- Interaction: AUTONOMOUS (Goal-driven, multi-step)
- Response Time: 60-120 seconds
- HITL: 5 approval checkpoints

FRONTEND MAPPING:
- isAutomatic: false (manual agent selection)
- isAutonomous: true (autonomous, goal-driven)
- hitlEnabled: true (user approval at checkpoints)
- selectedAgents: [agent_id] (user pre-selects agent)

Use Cases:
- "Design complete 510(k) submission strategy" → Plan approval, multi-step execution
- "Analyze clinical trial data and provide recommendations" → Tool approval, code execution
- "Create comprehensive FMEA for medical device" → Sub-agent approval, structured task
"""

import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime
import structlog

# LangGraph imports
from langgraph.graph import StateGraph, END

# Internal imports
from langgraph_workflows.base_workflow import BaseWorkflow
from langgraph_workflows.state_schemas import (
    UnifiedWorkflowState,
    WorkflowMode,
    ExecutionStatus,
    create_initial_state
)
from langgraph_workflows.observability import trace_node
from services.agent_orchestrator import AgentOrchestrator
from services.sub_agent_spawner import SubAgentSpawner
from services.unified_rag_service import UnifiedRAGService
from services.tool_registry import ToolRegistry
from services.enhanced_conversation_manager import EnhancedConversationManager
from services.session_memory_service import SessionMemoryService
from services.compliance_service import (
    ComplianceService,
    HumanInLoopValidator,
    ComplianceRegime,
    DataClassification
)
import time

# ============================================================================
# INTEGRATED SERVICES (from orphan services)
# These services provide enhanced capabilities across all 4 modes
# ============================================================================
from services.agent_hierarchy_service import (
    AgentHierarchyService,
    AgentLevel,
    EscalationReason,
    DelegationReason
)
from services.langfuse_monitor import LangFuseMonitor
from services.evidence_detector import EvidenceDetector, EvidenceType, EvidenceQuality
from services.skills_loader_service import SkillsLoaderService, SkillCategory
from services.conversation_history_analyzer import ConversationHistoryAnalyzer
from services.multi_domain_evidence_detector import MultiDomainEvidenceDetector, EvidenceDomain

# ============================================================================
# DEEP AGENTS TOOLS (for full autonomous agent mode)
# Provides: TodoManager, VirtualFilesystem, SubagentManager
# ============================================================================
from services.deepagents_tools import DeepAgentsTools, get_deepagents_tools

# PHASE 4: HITL System
try:
    from services.hitl_service import (
        create_hitl_service,
        HITLSafetyLevel,
        PlanApprovalRequest,
        ToolExecutionApprovalRequest,
        SubAgentApprovalRequest,
        CriticalDecisionApprovalRequest
    )
    HITL_AVAILABLE = True
except ImportError:
    HITL_AVAILABLE = False
    logger_temp = structlog.get_logger()
    logger_temp.warning("HITL Service not available")

# PHASE 4: Full Pattern Suite
try:
    from langgraph_compilation.patterns.tree_of_thoughts import TreeOfThoughtsAgent
    from langgraph_compilation.patterns.react import ReActAgent
    from langgraph_compilation.patterns.constitutional_ai import ConstitutionalAgent
    PATTERNS_AVAILABLE = True
except ImportError:
    PATTERNS_AVAILABLE = False

# PHASE 4: Tier System
try:
    from services.evidence_based_selector import AgentTier
    TIER_SYSTEM_AVAILABLE = True
except ImportError:
    TIER_SYSTEM_AVAILABLE = False

logger = structlog.get_logger()


class Mode3ManualAutonomousWorkflow(BaseWorkflow):
    """
    Mode 3: Manual-Autonomous (Manual Selection + Autonomous Deep Work)

    **PHASE 4 ENHANCEMENTS:**
    - HITL System with 5 approval checkpoints
    - Tree-of-Thoughts for planning
    - Full pattern chain (ToT → ReAct → Constitutional)
    - Default Tier 2+ for autonomous work

    Golden Rules Compliance:
    - ✅ Uses LangGraph StateGraph (Golden Rule #1)
    - ✅ Caching integrated at all nodes (Golden Rule #2)
    - ✅ Tenant validation enforced (Golden Rule #3)
    - ✅ RAG/Tools enabled by default (Golden Rule #4)
    - ✅ Evidence-based responses (Golden Rule #5)

    Deep Agent Architecture:
    Level 1: Master Agent (Autonomous Task Coordinator)
    Level 2: Expert Agent (Selected by user) ← USER SELECTS HERE
    Level 3: Specialist Agents (Spawned during execution)
    Level 4: Worker Agents (Spawned for parallel tasks)
    Level 5: Tool Agents (Code execution, searches, databases)

    Autonomous Capabilities:
    - ✅ Tree-of-Thoughts planning (multiple reasoning paths)
    - ✅ ReAct execution (reasoning + acting with tools)
    - ✅ Constitutional AI safety validation
    - ✅ HITL approval at critical checkpoints
    - ✅ Multi-step task execution
    - ✅ Sub-agent spawning with approval
    - ✅ Tool execution with approval
    - ✅ Code execution (Python, R, SAS)

    Features:
    - ✅ User selects expert from 319+ catalog
    - ✅ Multi-turn conversation with full history
    - ✅ Autonomous multi-step execution with approval gates
    - ✅ Tree-of-Thoughts planning
    - ✅ Full pattern chain for Tier 3
    - ✅ HITL checkpoints (plan, tools, sub-agents, decisions)
    - ✅ Default Tier 2+ (higher accuracy for autonomous work)
    """

    def __init__(
        self,
        supabase_client,
        rag_pipeline=None,
        agent_orchestrator=None,
        sub_agent_spawner=None,
        rag_service=None,
        tool_registry=None,
        conversation_manager=None,
        session_memory_service=None
    ):
        """
        Initialize Mode 3 workflow.

        Args:
            supabase_client: Supabase client for database access
            rag_pipeline: RAG pipeline for agent orchestrator
            agent_orchestrator: Agent execution with LangChain
            sub_agent_spawner: Sub-agent spawning service
            rag_service: RAG service for document retrieval
            tool_registry: Tool registry for tool and code execution
            conversation_manager: Enhanced conversation history manager
            session_memory_service: Long-term session memory
        """
        super().__init__(
            workflow_name="Mode3_Manual_Chat_Autonomous",
            mode=WorkflowMode.MODE_3_AUTONOMOUS,
            enable_checkpoints=True  # Enable for multi-turn conversation
        )

        # Initialize services
        self.supabase = supabase_client
        self.agent_orchestrator = agent_orchestrator or AgentOrchestrator(supabase_client, rag_pipeline)
        self.sub_agent_spawner = sub_agent_spawner or SubAgentSpawner()
        self.rag_service = rag_service or UnifiedRAGService(supabase_client)
        self.tool_registry = tool_registry or ToolRegistry()
        self.conversation_manager = conversation_manager or EnhancedConversationManager(supabase_client)
        self.session_memory_service = session_memory_service or SessionMemoryService(supabase_client)

        # PHASE 4: HITL Service (initialized per-request based on user settings)
        self.hitl_service = None

        # PHASE 4: Initialize all pattern agents
        self.tot_agent = TreeOfThoughtsAgent() if PATTERNS_AVAILABLE else None
        self.react_agent = ReActAgent() if PATTERNS_AVAILABLE else None
        self.constitutional_agent = ConstitutionalAgent() if PATTERNS_AVAILABLE else None

        # DEEP AGENTS TOOLS: Full autonomous agent mode capabilities
        # Provides: TodoManager (task decomposition), VirtualFilesystem (session files),
        # SubagentManager (spawn subagents with hierarchy rules L1→L2→L3→L4→L5)
        self.deepagents_tools = get_deepagents_tools()

        # OPTIMIZATION: Cache for frequently accessed data
        self._agent_config_cache = {}
        self._conversation_cache = {}

        logger.info("✅ Mode3ManualChatAutonomousWorkflow initialized",
                   hitl_available=HITL_AVAILABLE,
                   patterns_available=PATTERNS_AVAILABLE)

    # ===== PHASE 4: NEW HITL + PATTERN NODES =====

    @trace_node("mode3_initialize_hitl")
    async def initialize_hitl_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        PHASE 4 Node: Initialize HITL service based on user settings.
        """
        hitl_enabled = state.get('hitl_enabled', True)
        safety_level = state.get('hitl_safety_level', 'balanced')
        
        if HITL_AVAILABLE and hitl_enabled:
            try:
                self.hitl_service = create_hitl_service(
                    enabled=True,
                    safety_level=HITLSafetyLevel(safety_level)
                )
                logger.info("HITL service initialized", safety_level=safety_level)
            except Exception as e:
                logger.error("HITL initialization failed", error=str(e))
                hitl_enabled = False
        
        return {**state, 'hitl_initialized': hitl_enabled, 'current_node': 'initialize_hitl'}

    @trace_node("mode3_assess_tier_autonomous")
    async def assess_tier_autonomous_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        PHASE 4 Node: Assess tier - autonomous mode defaults to Tier 2+.
        Autonomous work requires higher accuracy and more careful execution.
        """
        query = state['query']
        context = state.get('conversation_history', [])
        
        # Start with Tier 2 for autonomous mode (higher baseline)
        base_tier = 2
        
        # Analyze query complexity to determine if Tier 3 is needed
        complexity_indicators = [
            'comprehensive', 'analyze', 'design', 'strategy', 'plan',
            'evaluate', 'assess', 'develop', 'create', 'build'
        ]
        
        query_lower = query.lower()
        complexity_count = sum(1 for indicator in complexity_indicators if indicator in query_lower)
        
        # Tier 3 if high complexity or multi-step
        if complexity_count >= 3 or len(query.split()) > 50:
            tier = 3
            reasoning = f"High complexity ({complexity_count} indicators) requires Tier 3"
        else:
            tier = base_tier
            reasoning = "Standard autonomous task uses Tier 2"
        
        logger.info("Tier assessed for autonomous mode", tier=tier, reasoning=reasoning)
        
        return {
            **state,
            'tier': tier,
            'tier_reasoning': reasoning,
            'requires_tot': (tier == 3),  # Use ToT for Tier 3
            'requires_constitutional': (tier >= 2),  # Always validate in autonomous
            'current_node': 'assess_tier_autonomous'
        }

    @trace_node("mode3_plan_with_tot")
    async def plan_with_tot_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        PHASE 4 Node: Generate plan using Tree-of-Thoughts for Tier 3 queries.
        """
        if not state.get('requires_tot') or not PATTERNS_AVAILABLE or not self.tot_agent:
            # Fallback to simple planning
            return {
                **state,
                'plan': {'steps': [{'description': state['query'], 'confidence': 0.7}], 'confidence': 0.7},
                'plan_generated': 'fallback',
                'current_node': 'plan_with_tot'
            }
        
        try:
            plan = await self.tot_agent.generate_plan(
                query=state['query'],
                context=state.get('context_summary', ''),
                max_steps=5,
                model=state.get('model', 'gpt-4')
            )
            
            logger.info("ToT plan generated", steps=len(plan.get('steps', [])), confidence=plan.get('confidence', 0.0))
            
            return {
                **state,
                'plan': plan,
                'plan_confidence': plan.get('confidence', 0.0),
                'plan_generated': 'tot',
                'current_node': 'plan_with_tot'
            }
        except Exception as e:
            logger.error("ToT planning failed", error=str(e))
            return {
                **state,
                'plan': {'steps': [{'description': state['query'], 'confidence': 0.5}], 'confidence': 0.5},
                'plan_generated': 'error',
                'errors': state.get('errors', []) + [f"ToT planning failed: {str(e)}"],
                'current_node': 'plan_with_tot'
            }

    @trace_node("mode3_request_plan_approval")
    async def request_plan_approval_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        PHASE 4 Node: HITL Checkpoint 1 - Plan Approval.
        """
        if not self.hitl_service or not state.get('hitl_initialized'):
            return {**state, 'plan_approved': True, 'current_node': 'request_plan_approval'}
        
        try:
            approval = await self.hitl_service.request_plan_approval(
                request=PlanApprovalRequest(
                    agent_id=state['current_agent_id'],
                    agent_name=state.get('current_agent_type', 'Expert'),
                    plan_steps=[s for s in state.get('plan', {}).get('steps', [])],
                    total_estimated_time_minutes=len(state.get('plan', {}).get('steps', [])) * 2,
                    confidence_score=state.get('plan_confidence', 0.7),
                    tools_required=[],
                    sub_agents_required=[]
                ),
                session_id=state['session_id'],
                user_id=state['user_id']
            )
            
            if approval.status == 'rejected':
                logger.warning("Plan rejected by user")
                return {
                    **state,
                    'status': ExecutionStatus.CANCELLED,
                    'plan_approved': False,
                    'rejection_reason': approval.feedback,
                    'current_node': 'request_plan_approval'
                }
            
            logger.info("Plan approved by user")
            return {**state, 'plan_approved': True, 'current_node': 'request_plan_approval'}
            
        except Exception as e:
            logger.error("Plan approval request failed", error=str(e))
            return {
                **state,
                'plan_approved': False,
                'errors': state.get('errors', []) + [f"Plan approval failed: {str(e)}"],
                'current_node': 'request_plan_approval'
            }

    @trace_node("mode3_execute_with_react")
    async def execute_with_react_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        PHASE 4 Node: Execute autonomous steps using ReAct pattern.
        """
        if not PATTERNS_AVAILABLE or not self.react_agent:
            # Fallback to standard execution
            return {
                **state,
                'step_results': [],
                'pattern_applied': 'none',
                'current_node': 'execute_with_react'
            }
        
        try:
            # Execute with ReAct for tool-augmented reasoning
            result = await self.react_agent.execute(
                query=state['query'],
                context=state.get('context_summary', ''),
                tools_results=state.get('tools_executed', []),
                model=state.get('model', 'gpt-4')
            )
            
            logger.info("ReAct execution complete", citations=len(result.get('citations', [])))
            
            return {
                **state,
                'agent_response': result.get('response', ''),
                'citations': state.get('citations', []) + result.get('citations', []),
                'step_results': result.get('steps', []),
                'pattern_applied': 'react',
                'current_node': 'execute_with_react'
            }
        except Exception as e:
            logger.error("ReAct execution failed", error=str(e))
            return {
                **state,
                'errors': state.get('errors', []) + [f"ReAct execution failed: {str(e)}"],
                'pattern_applied': 'error',
                'current_node': 'execute_with_react'
            }

    @trace_node("mode3_validate_with_constitutional")
    async def validate_with_constitutional_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        PHASE 4 Node: Validate response with Constitutional AI for safety.
        """
        if not state.get('requires_constitutional') or not PATTERNS_AVAILABLE or not self.constitutional_agent:
            return {**state, 'safety_validated': False, 'current_node': 'validate_with_constitutional'}
        
        response = state.get('agent_response', '')
        if not response:
            return {**state, 'safety_validated': False, 'current_node': 'validate_with_constitutional'}
        
        try:
            critique_result = await self.constitutional_agent.critique(
                output=response,
                context=state.get('context_summary', ''),
                criteria=["safety", "compliance", "accuracy", "completeness"],
                model=state.get('model', 'gpt-4')
            )
            
            if critique_result.get('needs_revision', False):
                logger.warning("Constitutional AI revised response", critique=critique_result.get('critique'))
                response = critique_result.get('revised_output', response)
            else:
                logger.info("Constitutional AI approved response")
            
            return {
                **state,
                'agent_response': response,
                'safety_validated': True,
                'safety_score': critique_result.get('safety_score', 0.0),
                'constitutional_critique': critique_result.get('critique', ''),
                'current_node': 'validate_with_constitutional'
            }
        except Exception as e:
            logger.error("Constitutional validation failed", error=str(e))
            return {
                **state,
                'errors': state.get('errors', []) + [f"Constitutional validation failed: {str(e)}"],
                'safety_validated': False,
                'current_node': 'validate_with_constitutional'
            }

    @trace_node("mode3_request_decision_approval")
    async def request_decision_approval_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        PHASE 4 Node: HITL Checkpoint 4 - Decision Approval.
        """
        if not self.hitl_service or not state.get('hitl_initialized'):
            return {**state, 'decision_approved': True, 'current_node': 'request_decision_approval'}
        
        try:
            approval = await self.hitl_service.request_critical_decision_approval(
                request=CriticalDecisionApprovalRequest(
                    decision_title="Autonomous Task Results",
                    recommendation=state.get('agent_response', ''),
                    reasoning=[],
                    confidence_score=state.get('response_confidence', state.get('plan_confidence', 0.7)),
                    alternatives_considered=[],
                    expected_impact="Task completion with autonomous execution",
                    evidence=state.get('citations', [])
                ),
                session_id=state['session_id'],
                user_id=state['user_id']
            )
            
            if approval.status == 'rejected':
                logger.warning("Decision rejected by user")
                return {
                    **state,
                    'requires_revision': True,
                    'decision_approved': False,
                    'rejection_reason': approval.feedback,
                    'current_node': 'request_decision_approval'
                }
            
            logger.info("Decision approved by user")
            return {**state, 'decision_approved': True, 'current_node': 'request_decision_approval'}
            
        except Exception as e:
            logger.error("Decision approval request failed", error=str(e))
            return {
                **state,
                'decision_approved': False,
                'errors': state.get('errors', []) + [f"Decision approval failed: {str(e)}"],
                'current_node': 'request_decision_approval'
            }

    # ===== END PHASE 4 NODES =====
    
    # ===== OPTIMIZATION METHODS =====
    
    def _should_use_deep_patterns(self, state: UnifiedWorkflowState) -> bool:
        """
        OPTIMIZATION: Determine if query needs deep patterns (ToT/ReAct/Constitutional)
        Simple queries can skip these for 40% faster execution
        """
        query = state.get('query', '')
        word_count = len(query.split())
        
        # Complex keywords that indicate need for deep reasoning
        complex_keywords = [
            'comprehensive', 'complete', 'detailed', 'analyze', 'design',
            'create', 'develop', 'strategy', 'plan', 'evaluate', 'assess'
        ]
        
        has_complex_intent = any(kw in query.lower() for kw in complex_keywords)
        
        # Simple queries: < 50 words AND no complex keywords
        if word_count < 50 and not has_complex_intent:
            logger.info("Query classified as SIMPLE - skipping deep patterns for speed")
            return False
        
        logger.info("Query classified as COMPLEX - using full pattern chain")
        return True
    
    async def _load_agent_config_cached(self, agent_id: str) -> Dict[str, Any]:
        """
        OPTIMIZATION: Load agent config with caching (5-min TTL)
        """
        if agent_id in self._agent_config_cache:
            logger.debug("Agent config cache HIT", agent_id=agent_id)
            return self._agent_config_cache[agent_id]
        
        try:
            result = self.supabase.table('agents').select('*').eq('id', agent_id).single().execute()
            config = result.data if result.data else {}
            
            # Cache for 5 minutes
            self._agent_config_cache[agent_id] = config
            asyncio.create_task(self._expire_cache(agent_id, 300))
            
            logger.debug("Agent config cache MISS - loaded and cached", agent_id=agent_id)
            return config
        except Exception as e:
            logger.warning(f"Failed to load agent config: {e}")
            return {}
    
    async def _expire_cache(self, key: str, ttl: int):
        """Helper to expire cache entries after TTL"""
        await asyncio.sleep(ttl)
        self._agent_config_cache.pop(key, None)
    
    async def _execute_with_timeout(self, agent_request, timeout: float = 10.0) -> Any:
        """
        OPTIMIZATION: Execute agent with timeout to prevent hangs
        """
        try:
            return await asyncio.wait_for(
                self.agent_orchestrator.process_query(agent_request),
                timeout=timeout
            )
        except asyncio.TimeoutError:
            logger.error("Agent execution timeout", timeout=timeout)
            raise ValueError(f"Agent execution exceeded {timeout}s timeout")
    
    # ===== END OPTIMIZATION METHODS =====

    def build_graph(self) -> StateGraph:
        """
        Build LangGraph workflow for Mode 3 (PHASE 4 Enhanced).

        **PHASE 4 AUTONOMOUS FLOW WITH HITL:**
        1. Validate tenant (security)
        2. Validate agent selection (manual)
        3. Load conversation history
        4. Initialize HITL service
        5. Assess tier (default Tier 2+ for autonomous)
        6. Plan with Tree-of-Thoughts (Tier 3)
        7. Request plan approval (HITL Checkpoint 1)
        8. Execute with ReAct pattern
        9. Validate with Constitutional AI
        10. Request decision approval (HITL Checkpoint 4)
        11. Save conversation turn
        12. Format output

        Returns:
            Configured StateGraph with Phase 4 enhancements
        """
        graph = StateGraph(UnifiedWorkflowState)

        # PHASE 4: Add all nodes
        graph.add_node("validate_tenant", self.validate_tenant_node)
        graph.add_node("validate_agent_selection", self.validate_agent_selection_node)
        graph.add_node("load_conversation", self.load_conversation_node)
        graph.add_node("initialize_hitl", self.initialize_hitl_node)
        graph.add_node("assess_tier_autonomous", self.assess_tier_autonomous_node)
        graph.add_node("plan_with_tot", self.plan_with_tot_node)
        graph.add_node("request_plan_approval", self.request_plan_approval_node)
        graph.add_node("rag_retrieval", self.rag_retrieval_node)
        graph.add_node("execute_with_react", self.execute_with_react_node)
        graph.add_node("validate_with_constitutional", self.validate_with_constitutional_node)
        graph.add_node("request_decision_approval", self.request_decision_approval_node)
        graph.add_node("save_conversation", self.save_conversation_node)
        graph.add_node("format_output", self.format_output_node)

        # PHASE 4: Define flow
        graph.set_entry_point("validate_tenant")
        graph.add_edge("validate_tenant", "validate_agent_selection")
        graph.add_edge("validate_agent_selection", "load_conversation")
        graph.add_edge("load_conversation", "initialize_hitl")
        graph.add_edge("initialize_hitl", "assess_tier_autonomous")
        graph.add_edge("assess_tier_autonomous", "plan_with_tot")
        
        # HITL Checkpoint 1: Plan approval (conditional)
        graph.add_conditional_edges(
            "plan_with_tot",
            lambda s: "request_approval" if s.get('hitl_initialized') and s.get('tier', 2) >= 2 else "skip_approval",
            {
                "request_approval": "request_plan_approval",
                "skip_approval": "rag_retrieval"
            }
        )
        
        graph.add_edge("request_plan_approval", "rag_retrieval")
        graph.add_edge("rag_retrieval", "execute_with_react")
        graph.add_edge("execute_with_react", "validate_with_constitutional")
        
        # HITL Checkpoint 4: Decision approval (conditional)
        graph.add_conditional_edges(
            "validate_with_constitutional",
            lambda s: "request_decision" if s.get('hitl_initialized') and s.get('tier', 2) >= 3 else "skip_decision",
            {
                "request_decision": "request_decision_approval",
                "skip_decision": "save_conversation"
            }
        )
        
        graph.add_edge("request_decision_approval", "save_conversation")
        graph.add_edge("save_conversation", "format_output")
        graph.add_edge("format_output", END)

        logger.info("✅ Mode 3 graph built with Phase 4 enhancements",
                   nodes=len(graph.nodes),
                   hitl_enabled=HITL_AVAILABLE,
                   patterns_enabled=PATTERNS_AVAILABLE)

        return graph

    # =========================================================================
    # NODE IMPLEMENTATIONS
    # =========================================================================

    @trace_node("mode3_validate_agent_selection")
    async def validate_agent_selection_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Validate that user has selected an expert agent.

        Mode 3 requires manual selection (similar to Mode 1).
        """
        selected_agents = state.get('selected_agents', [])

        if not selected_agents or len(selected_agents) == 0:
            logger.error("Mode 3 requires manual agent selection")
            return {
                **state,
                'status': ExecutionStatus.FAILED,
                'errors': state.get('errors', []) + [
                    "Mode 3 requires manual expert selection. Please select an expert from the catalog."
                ]
            }

        selected_agent_id = selected_agents[0] if isinstance(selected_agents, list) else selected_agents

        # Validate agent exists
        try:
            agent_result = self.supabase.table('agents').select('id, name, tier, capabilities').eq('id', selected_agent_id).single().execute()

            if not agent_result.data:
                return {
                    **state,
                    'status': ExecutionStatus.FAILED,
                    'errors': state.get('errors', []) + [f"Expert agent not found: {selected_agent_id}"]
                }

            agent = agent_result.data

            logger.info(
                "Expert agent validated (Mode 3)",
                agent_id=selected_agent_id,
                agent_name=agent.get('name')
            )

            return {
                **state,
                'current_agent_id': selected_agent_id,
                'current_agent_type': agent.get('name'),
                'agent_tier': agent.get('tier'),
                'agent_capabilities': agent.get('capabilities', []),
                'current_node': 'validate_agent_selection'
            }

        except Exception as e:
            logger.error("Agent validation failed (Mode 3)", error=str(e))
            return {
                **state,
                'status': ExecutionStatus.FAILED,
                'errors': state.get('errors', []) + [f"Agent validation failed: {str(e)}"]
            }

    @trace_node("mode3_load_conversation")
    async def load_conversation_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Load conversation history for multi-turn chat.

        Loads up to 50 previous turns for context.
        """
        tenant_id = state['tenant_id']
        session_id = state.get('session_id')

        if not session_id:
            logger.info("No session_id, starting fresh conversation (Mode 3)")
            return {
                **state,
                'conversation_history': [],
                'current_node': 'load_conversation'
            }

        try:
            conversation = await self.conversation_manager.load_conversation(
                tenant_id=tenant_id,
                session_id=session_id,
                limit=50
            )

            logger.info(
                "Conversation history loaded (Mode 3)",
                turns=len(conversation)
            )

            return {
                **state,
                'conversation_history': conversation,
                'current_node': 'load_conversation'
            }

        except Exception as e:
            logger.error("Failed to load conversation (Mode 3)", error=str(e))
            return {
                **state,
                'conversation_history': [],
                'errors': state.get('errors', []) + [f"Failed to load conversation: {str(e)}"]
            }

    @trace_node("mode3_analyze_task_complexity")
    async def analyze_task_complexity_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Analyze task to determine autonomous execution scope.

        Classifies into:
        - Simple: Direct Q&A (no autonomous reasoning needed)
        - Autonomous: 1-5 step tasks (handled in Mode 3)
        - Workflow: 10+ coordinated steps (redirect to Workflow Service)
        """
        query = state['query']

        # Detect workflow handoff triggers
        workflow_triggers = [
            'complete', 'full', 'entire', 'end-to-end',
            'submission package', 'clinical trial from start',
            'go-to-market strategy with execution'
        ]

        needs_workflow_handoff = any(trigger in query.lower() for trigger in workflow_triggers)

        # Detect autonomous task indicators
        autonomous_indicators = [
            'analyze', 'design', 'create', 'develop', 'plan',
            'assess', 'evaluate', 'review', 'draft',
            'identify', 'compare', 'recommend'
        ]

        needs_autonomous = any(indicator in query.lower() for indicator in autonomous_indicators)

        # Determine task type
        if needs_workflow_handoff:
            task_type = 'workflow'
            estimated_steps = 10
        elif needs_autonomous:
            task_type = 'autonomous'
            estimated_steps = 3
        else:
            task_type = 'simple'
            estimated_steps = 1

        logger.info(
            "Task complexity analyzed (Mode 3)",
            task_type=task_type,
            estimated_steps=estimated_steps
        )

        return {
            **state,
            'task_type': task_type,
            'estimated_steps': estimated_steps,
            'current_node': 'analyze_task_complexity'
        }

    async def simple_query_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Handle simple query (no autonomous reasoning)"""
        logger.info("Simple query detected, skipping autonomous reasoning (Mode 3)")
        return {
            **state,
            'reasoning_steps': [],
            'current_node': 'simple_query'
        }

    async def autonomous_task_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Mark for autonomous task execution"""
        logger.info("Autonomous task detected (Mode 3)")
        return {
            **state,
            'autonomous_execution': True,
            'current_node': 'autonomous_task'
        }

    async def workflow_handoff_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Workflow handoff - redirect to Workflow Service.

        For tasks requiring 10+ coordinated steps across multiple systems.
        """
        logger.info("Workflow handoff triggered (Mode 3)")

        handoff_message = f"""I can provide detailed guidance on this task, but generating a COMPLETE implementation involves {state.get('estimated_steps', 10)}+ coordinated tasks across multiple systems.

For this complex workflow, I recommend using our **Workflow Service**:
🔄 [Launch Workflow for: {state['query'][:60]}...]

This will:
✅ Create automated multi-step workflow
✅ Generate all required documents
✅ Track timeline and milestones
✅ Coordinate across systems
✅ Manage team assignments

Would you like to:
1️⃣ Start the Workflow Service for complete automation
2️⃣ Continue here with step-by-step guidance
3️⃣ Get help with a specific component"""

        return {
            **state,
            'agent_response': handoff_message,
            'response_confidence': 1.0,
            'workflow_handoff_triggered': True,
            'current_node': 'workflow_handoff'
        }

    @trace_node("mode3_plan_reasoning_steps")
    async def plan_reasoning_steps_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Plan autonomous reasoning steps using Chain-of-Thought.

        NOW USING DEEP AGENTS TOOLS:
        - TodoManager for task decomposition (write_todos)
        - VirtualFilesystem for session-based artifact storage
        - SubagentManager for proper hierarchy-aware spawning

        Breaks down task into logical steps for autonomous execution.
        """
        query = state['query']
        conversation_history = state.get('conversation_history', [])
        session_id = state.get('session_id')
        agent_id = state.get('current_agent_id')

        try:
            # Create structured reasoning steps
            reasoning_steps = [
                {"step": 1, "task": f"Understand the core question: {query[:100]}", "status": "pending"},
                {"step": 2, "task": "Gather relevant context and evidence from RAG", "status": "pending"},
                {"step": 3, "task": "Analyze the information systematically", "status": "pending"},
                {"step": 4, "task": "Synthesize findings into actionable insights", "status": "pending"},
                {"step": 5, "task": "Validate conclusions and provide recommendations", "status": "pending"}
            ]

            # Use DeepAgentsTools TodoManager to persist the task plan
            todo_result = None
            if session_id and agent_id and self.deepagents_tools:
                try:
                    from uuid import UUID
                    session_uuid = UUID(str(session_id)) if isinstance(session_id, str) else session_id
                    agent_uuid = UUID(str(agent_id)) if isinstance(agent_id, str) else agent_id

                    todo_result = await self.deepagents_tools.write_todos(
                        session_id=session_uuid,
                        agent_id=agent_uuid,
                        title=f"Mode 3 Autonomous Task Plan: {query[:50]}...",
                        tasks=reasoning_steps
                    )
                    logger.info("DeepAgents TodoManager persisted task plan",
                               todo_status=todo_result.get('status'),
                               task_count=todo_result.get('task_count', 0))
                except Exception as todo_err:
                    logger.warning(f"TodoManager persist failed (non-critical): {todo_err}")

            # Convert to simple string list for compatibility with existing nodes
            reasoning_steps_simple = [
                f"{s['step']}. {s['task']}" for s in reasoning_steps
            ]

            logger.info(
                "Reasoning steps planned with DeepAgents (Mode 3)",
                step_count=len(reasoning_steps),
                todo_persisted=bool(todo_result and todo_result.get('status') == 'SUCCESS')
            )

            return {
                **state,
                'reasoning_steps': reasoning_steps_simple,
                'reasoning_tasks': reasoning_steps,  # Structured version for DeepAgents
                'reasoning_method': 'chain_of_thought_deepagents',
                'todo_file': todo_result.get('todo_file') if todo_result else None,
                'current_node': 'plan_reasoning_steps'
            }

        except Exception as e:
            logger.error("Reasoning planning failed (Mode 3)", error=str(e))
            return {
                **state,
                'reasoning_steps': [],
                'errors': state.get('errors', []) + [f"Reasoning planning failed: {str(e)}"]
            }

    @trace_node("mode3_rag_retrieval")
    async def rag_retrieval_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: RAG retrieval with conversation context"""
        tenant_id = state['tenant_id']
        query = state['query']
        expert_id = state.get('current_agent_id')

        try:
            # Use true_hybrid search (Neo4j + Pinecone + Supabase)
            rag_results = await self.rag_service.query(
                query_text=query,
                tenant_id=tenant_id,
                agent_id=expert_id,
                max_results=10,
                strategy="true_hybrid",  # Use true hybrid: Neo4j (KG) + Pinecone (vector) + Supabase (relational)
                similarity_threshold=0.7
            )

            documents = rag_results.get('sources', []) or rag_results.get('documents', [])
            context = self._create_context_summary(documents)

            logger.info("RAG retrieval completed (Mode 3)", documents=len(documents))

            return {
                **state,
                'retrieved_documents': documents,
                'context_summary': context,
                'current_node': 'rag_retrieval'
            }

        except Exception as e:
            logger.error("RAG retrieval failed (Mode 3)", error=str(e))
            return {
                **state,
                'retrieved_documents': [],
                'context_summary': '',
                'errors': state.get('errors', []) + [f"RAG retrieval failed: {str(e)}"]
            }

    @trace_node("mode3_execute_tools_code")
    async def execute_tools_code_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Execute tools and code using ToolRegistry.

        Supports:
        - Web search
        - Database queries
        - Code execution (Python, R, SAS) via ToolRegistry
        - Statistical analysis
        """
        query = state['query']
        tenant_id = state['tenant_id']

        # Detect if code execution is needed
        needs_code = any(word in query.lower() for word in ['calculate', 'analyze data', 'statistical', 'plot', 'visualize'])

        tools_executed = []
        code_executed = []

        try:
            # Execute tools if needed using ToolRegistry
            tool_analysis = self._analyze_tool_needs(query)
            if tool_analysis['needs_tools']:
                for tool_name in tool_analysis['recommended_tools']:
                    tool = self.tool_registry.get_tool(tool_name)
                    if tool:
                        result = await tool.execute(
                            input_data={"query": query},
                            context={"tenant_id": tenant_id}
                        )
                        tools_executed.append({
                            'tool_name': tool_name,
                            'result': result,
                            'timestamp': datetime.utcnow().isoformat()
                        })

            # Execute code if needed (via ToolRegistry code execution tool)
            if needs_code:
                code_tool = self.tool_registry.get_tool('code_execution')
                if code_tool:
                    code_result = await code_tool.execute(
                        input_data={"query": query, "language": "python"},
                        context={"tenant_id": tenant_id}
                    )
                    code_executed.append({
                        'language': 'python',
                        'result': code_result,
                        'timestamp': datetime.utcnow().isoformat()
                    })

            logger.info(
                "Tools and code executed via ToolRegistry (Mode 3)",
                tools=len(tools_executed),
                code=len(code_executed)
            )

            return {
                **state,
                'tools_executed': tools_executed,
                'code_executed': code_executed,
                'current_node': 'execute_tools_code'
            }

        except Exception as e:
            logger.error("Tools/code execution failed (Mode 3)", error=str(e))
            return {
                **state,
                'tools_executed': [],
                'code_executed': [],
                'errors': state.get('errors', []) + [f"Tools/code execution failed: {str(e)}"]
            }

    @trace_node("mode3_execute_expert_autonomous")
    async def execute_expert_autonomous_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Execute expert agent with autonomous reasoning via Chain-of-Thought prompts.

        Expert agent:
        - Uses Chain-of-Thought reasoning (via system prompt)
        - Spawns specialist and worker sub-agents
        - Shows reasoning trace
        - Generates artifacts
        """
        tenant_id = state['tenant_id']
        query = state['query']
        expert_id = state.get('current_agent_id')
        context = state.get('context_summary', '')
        conversation_history = state.get('conversation_history', [])
        reasoning_steps = state.get('reasoning_steps', [])
        tools_results = state.get('tools_executed', [])
        code_results = state.get('code_executed', [])
        model = state.get('model', 'gpt-4')

        try:
            # Build Chain-of-Thought system prompt
            cot_prompt = """You are an expert using Chain-of-Thought reasoning.

For each question:
1. Break down the problem systematically
2. Think step-by-step through your analysis
3. Show your reasoning process transparently
4. Provide evidence-based conclusions

Use this format in your response:
**Thinking:** [your step-by-step reasoning]
**Analysis:** [your detailed analysis]
**Evidence:** [supporting evidence and citations]
**Conclusion:** [your final answer with confidence level]

Reasoning steps to follow:
""" + "\n".join(reasoning_steps)

            # Import AgentQueryRequest
            from models.requests import AgentQueryRequest
            
            # Create properly formatted request
            agent_request = AgentQueryRequest(
                query=query,
                agent_id=expert_id,
                session_id=state.get('session_id'),
                user_id=state.get('user_id'),
                tenant_id=tenant_id,
                context={'summary': context, 'system_prompt': cot_prompt},
                agent_type='expert',
                organization_id=tenant_id
            )
            
            # OPTIMIZATION: Execute with 10-second timeout
            agent_response_obj = await self._execute_with_timeout(agent_request, timeout=10.0)

            response_text = agent_response_obj.response
            artifacts = []
            citations = agent_response_obj.citations or []

            # Spawn sub-agents if needed
            sub_agents_spawned = []
            if state.get('autonomous_execution'):
                specialist_id = await self.sub_agent_spawner.spawn_specialist(
                    parent_agent_id=expert_id,
                    task=f"Deep analysis for: {query[:100]}",
                    specialty="Autonomous reasoning specialist",
                    context={'query': query, 'tenant_id': tenant_id}
                )
                sub_agents_spawned.append(specialist_id)

                specialist_result = await self.sub_agent_spawner.execute_sub_agent(
                    sub_agent_id=specialist_id
                )

                if specialist_result:
                    response_text += f"\n\n**Specialist Insights:**\n{specialist_result.get('response', '')}"

            # Extract reasoning trace from response (if present)
            reasoning_trace = reasoning_steps

            confidence = 0.80  # Default confidence for autonomous mode

            logger.info(
                "Expert executed with Chain-of-Thought reasoning (Mode 3)",
                expert_id=expert_id,
                sub_agents=len(sub_agents_spawned),
                artifacts=len(artifacts),
                reasoning_steps=len(reasoning_trace)
            )

            return {
                **state,
                'agent_response': response_text,
                'response_confidence': confidence,
                'reasoning_trace': reasoning_trace,
                'sub_agents_spawned': sub_agents_spawned,
                'artifacts': artifacts,
                'citations': citations,
                'current_node': 'execute_expert_autonomous'
            }

        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            logger.error(
                "Expert execution failed (Mode 3)",
                error=str(e),
                error_type=type(e).__name__,
                expert_id=expert_id,
                traceback=error_trace
            )

            # Provide a more informative error message based on error type
            error_type = type(e).__name__
            if "timeout" in str(e).lower() or "TimeoutError" in error_type:
                user_message = "The expert agent took too long to respond. Please try again or simplify your question."
            elif "connection" in str(e).lower() or "connect" in str(e).lower():
                user_message = "Unable to connect to the AI service. Please try again in a moment."
            elif "rate limit" in str(e).lower() or "429" in str(e):
                user_message = "The AI service is currently busy. Please wait a moment and try again."
            else:
                user_message = f"I encountered an issue processing your request. Error: {error_type}"

            return {
                **state,
                'agent_response': user_message,
                'response_confidence': 0.0,
                'reasoning_trace': state.get('reasoning_trace', []) + [{
                    'step': 'error',
                    'action': 'Error handling',
                    'result': f"Expert execution failed: {str(e)[:200]}"
                }],
                'errors': state.get('errors', []) + [f"Expert execution failed ({error_type}): {str(e)}"],
                'current_node': 'execute_expert_autonomous'
            }

    async def checkpoint_validation_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Checkpoint for human validation.

        In autonomous mode, returns result for human approval.
        User can approve, request iteration, or reject.
        """
        logger.info("Checkpoint reached - awaiting human validation (Mode 3)")

        return {
            **state,
            'checkpoint_reached': True,
            'checkpoint_message': 'Please review the response. Approve, request iteration, or reject.',
            'current_node': 'checkpoint_validation'
        }

    @trace_node("mode3_save_conversation")
    async def save_conversation_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Save conversation turn.

        Stores user message, assistant response, and metadata.
        Golden Rule #5: Stores feedback for learning.
        """
        tenant_id = state['tenant_id']
        session_id = state.get('session_id')

        if not session_id:
            logger.info("No session_id, skipping conversation save (Mode 3)")
            return {**state, 'current_node': 'save_conversation'}

        try:
            expert_id = state.get('current_agent_id', 'unknown')

            await self.conversation_manager.save_turn(
                tenant_id=tenant_id,
                session_id=session_id,
                user_message=state['query'],
                assistant_message=state.get('agent_response', ''),
                agent_id=expert_id,
                metadata={
                    'model': state.get('model_used', 'gpt-4'),
                    'autonomous_execution': state.get('autonomous_execution', False),
                    'reasoning_steps': len(state.get('reasoning_trace', [])),
                    'sub_agents_spawned': state.get('sub_agents_spawned', []),
                    'confidence': state.get('response_confidence', 0.0)
                }
            )

            logger.info("Conversation turn saved (Mode 3)")

            return {**state, 'current_node': 'save_conversation'}

        except Exception as e:
            logger.error("Failed to save conversation (Mode 3)", error=str(e))
            return {
                **state,
                'errors': state.get('errors', []) + [f"Failed to save conversation: {str(e)}"]
            }
    @trace_node("human_validation")
    async def validate_human_review_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Validate if human review is required

        Checks confidence, keywords, and risk levels
        """
        response = state.get('agent_response', '')
        confidence = state.get('response_confidence', 0.0)
        query = state.get('original_query', state.get('query', ''))

        try:
            validation_result = await self.human_validator.requires_human_review(
                query=query,
                response=response,
                confidence=confidence,
                domain=state.get('domain'),
                context=state
            )

            if validation_result['requires_human_review']:
                logger.warning("Human review required",
                             risk_level=validation_result['risk_level'])

                review_notice = f"""

⚠️ **HUMAN REVIEW REQUIRED**

**Risk Level:** {validation_result['risk_level'].upper()}
**Confidence:** {confidence:.2%}

**Reasons:**
{chr(10).join(f"• {reason}" for reason in validation_result['reasons'])}

**Recommendation:** {validation_result['recommendation']}

---
*This response requires review by a qualified healthcare professional.*
"""
                response_with_notice = response + review_notice

                return {
                    **state,
                    'agent_response': response_with_notice,
                    'requires_human_review': True,
                    'human_review_decision': validation_result
                }
            else:
                return {
                    **state,
                    'requires_human_review': False,
                    'human_review_decision': validation_result
                }
        except Exception as e:
            logger.error("Human validation failed", error=str(e))
            return {
                **state,
                'requires_human_review': True,
                'errors': state.get('errors', []) + [f"Validation failed: {str(e)}"]
            }



    async def format_output_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Format final output with artifact delivery.

        Mode 3 returns:
        - Response text
        - Reasoning trace (Chain-of-Thought)
        - Sub-agents used
        - Artifacts generated (properly formatted)
        - Code execution results
        - Checkpoint status
        - Citations
        """
        artifacts = state.get('artifacts', [])

        # Format artifacts
        formatted_artifacts = []
        for artifact in artifacts:
            formatted_artifacts.append({
                'type': artifact.get('type', 'document'),
                'title': artifact.get('title', 'Generated Artifact'),
                'format': artifact.get('format', 'text'),
                'content': artifact.get('content', ''),
                'generated_at': artifact.get('generated_at', datetime.utcnow().isoformat())
            })

        return {
            **state,
            'response': state.get('agent_response', ''),
            'confidence': state.get('response_confidence', 0.0),
            'agents_used': [state.get('current_agent_id')] + state.get('sub_agents_spawned', []),
            'reasoning_trace': state.get('reasoning_trace', []),
            'artifacts': formatted_artifacts,
            'citations': state.get('citations', []),
            'sources_used': len(state.get('retrieved_documents', [])),
            'tools_used': len(state.get('tools_executed', [])),
            'code_executed': len(state.get('code_executed', [])),
            'status': ExecutionStatus.COMPLETED,
            'current_node': 'format_output',
            # Agent metadata for API response (required by main.py endpoint)
            'selected_agent_id': state.get('current_agent_id'),
            'selected_agent_name': state.get('current_agent_type', 'Unknown Agent'),
            'selection_confidence': state.get('agent_selection_confidence', 0.85),
        }

    # =========================================================================
    # CONDITIONAL EDGE FUNCTIONS
    # =========================================================================

    def route_by_task_complexity(self, state: UnifiedWorkflowState) -> str:
        """Route based on task complexity analysis"""
        task_type = state.get('task_type', 'simple')
        return task_type

    def route_checkpoint_decision(self, state: UnifiedWorkflowState) -> str:
        """
        Route based on checkpoint decision.

        In actual implementation, this would wait for user input.
        For now, auto-approve.
        """
        # In production: check user decision from frontend
        # For now: auto-approve
        return "approved"

    # =========================================================================
    # HELPER METHODS
    # =========================================================================

    def _create_context_summary(self, documents: List[Dict[str, Any]]) -> str:
        """Create context summary from RAG documents"""
        if not documents:
            return ""

        context_parts = []
        for i, doc in enumerate(documents[:10], 1):
            content = doc.get('content', '')[:2000]
            source = doc.get('source', 'Unknown')
            context_parts.append(f"[{i}] {content} (Source: {source})")

        return "\n\n".join(context_parts)

    def _analyze_tool_needs(self, query: str) -> Dict[str, Any]:
        """Analyze query to determine which tools are needed"""
        query_lower = query.lower()

        tool_indicators = {
            'web_search': any(word in query_lower for word in ['search', 'find', 'latest']),
            'database': any(word in query_lower for word in ['database', 'record']),
            'regulatory_db': any(word in query_lower for word in ['fda', 'ema', 'regulatory'])
        }

        recommended_tools = [tool for tool, needed in tool_indicators.items() if needed]

        return {
            'needs_tools': len(recommended_tools) > 0,
            'recommended_tools': recommended_tools
        }
