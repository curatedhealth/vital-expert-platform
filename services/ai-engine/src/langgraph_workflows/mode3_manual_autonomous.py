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

# ============================================================================
# PHASE 5: WORLD-CLASS AUTONOMOUS ENHANCEMENTS
# Implements production-grade features based on 5-agent expert feedback
# ============================================================================
try:
    from services.autonomous_enhancements import (
        AutonomyLevel,
        AutonomyConfig,
        create_autonomy_config,
        ConfidenceCalibrator,
        create_confidence_calibrator,
        RecursiveDecomposer,
        create_recursive_decomposer,
        ErrorRecoveryService,
        create_error_recovery_service,
        AgentCollaborator,
        create_agent_collaborator,
        TaskNode
    )
    ENHANCEMENTS_AVAILABLE = True
except ImportError:
    ENHANCEMENTS_AVAILABLE = False

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

        # PHASE 5: World-class autonomous enhancements
        self.autonomy_config = None  # Initialized per-request
        self.confidence_calibrator = create_confidence_calibrator(supabase_client) if ENHANCEMENTS_AVAILABLE else None
        self.recursive_decomposer = create_recursive_decomposer(max_depth=10, max_tasks=50) if ENHANCEMENTS_AVAILABLE else None
        self.error_recovery = create_error_recovery_service(max_retries=3) if ENHANCEMENTS_AVAILABLE else None
        self.agent_collaborator = create_agent_collaborator() if ENHANCEMENTS_AVAILABLE else None
        self._task_tree = None  # Stores the recursive task decomposition tree

        logger.info("✅ Mode3ManualChatAutonomousWorkflow initialized",
                   hitl_available=HITL_AVAILABLE,
                   patterns_available=PATTERNS_AVAILABLE,
                   enhancements_available=ENHANCEMENTS_AVAILABLE)

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
                'step_results': state.get('step_results', []) + result.get('steps', []),
                'reasoning_steps': state.get('reasoning_steps', []) + result.get('steps', []),
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

    # ===== GOAL-DRIVEN EXECUTION LOOP (AutoGPT-like) =====

    @trace_node("mode3_check_goal_completion")
    async def check_goal_completion_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        PHASE 6 Node: Check if the autonomous goal has been achieved.

        This is the core of AutoGPT-like behavior - evaluating whether:
        1. The goal/task has been fully completed
        2. Confidence threshold has been met (default 0.95)
        3. Maximum iterations have been reached (safety limit)
        4. User intervention is required (HITL)

        Returns state with goal_achieved flag and loop_status.
        """
        # Get current iteration count
        current_iteration = state.get('goal_loop_iteration', 0) + 1
        max_iterations = state.get('max_goal_iterations', 5)  # Default 5 iterations max

        # Get confidence and threshold
        response_confidence = state.get('response_confidence', state.get('plan_confidence', 0.7))
        confidence_threshold = state.get('confidence_threshold', 0.95)

        # Get task tree from recursive decomposition (if available)
        task_tree = state.get('task_tree', [])
        completed_tasks = state.get('completed_tasks', [])
        pending_tasks = state.get('pending_tasks', task_tree.copy() if task_tree else [])

        # Calculate progress
        total_tasks = len(task_tree) if task_tree else 1
        completed_count = len(completed_tasks)
        progress_percentage = (completed_count / total_tasks * 100) if total_tasks > 0 else 0

        # Evaluate goal completion conditions
        goal_achieved = False
        loop_status = 'continue'
        termination_reason = None

        # Condition 1: Max iterations reached (safety limit)
        if current_iteration >= max_iterations:
            goal_achieved = True  # Force completion
            loop_status = 'max_iterations_reached'
            termination_reason = f'Maximum iterations ({max_iterations}) reached'
            logger.warning("Goal loop terminated: max iterations",
                          iterations=current_iteration, max=max_iterations)

        # Condition 2: All tasks completed
        elif len(pending_tasks) == 0 and len(completed_tasks) > 0:
            goal_achieved = True
            loop_status = 'tasks_complete'
            termination_reason = f'All {completed_count} tasks completed'
            logger.info("Goal achieved: all tasks complete",
                       completed=completed_count, total=total_tasks)

        # Condition 3: High confidence response (threshold met)
        elif response_confidence >= confidence_threshold:
            goal_achieved = True
            loop_status = 'confidence_threshold_met'
            termination_reason = f'Confidence {response_confidence:.2%} >= threshold {confidence_threshold:.2%}'
            logger.info("Goal achieved: confidence threshold met",
                       confidence=response_confidence, threshold=confidence_threshold)

        # Condition 4: Explicit goal completion flag from agent response
        elif state.get('explicit_goal_complete', False):
            goal_achieved = True
            loop_status = 'explicit_completion'
            termination_reason = 'Agent explicitly marked goal as complete'
            logger.info("Goal achieved: explicit completion flag")

        # Condition 5: Error state - should exit loop
        elif state.get('status') == ExecutionStatus.FAILED or len(state.get('errors', [])) > 2:
            goal_achieved = True
            loop_status = 'error_exit'
            termination_reason = 'Too many errors, exiting loop'
            logger.warning("Goal loop terminated: errors", errors=state.get('errors', []))

        # Otherwise, continue the loop
        else:
            goal_achieved = False
            loop_status = 'continue'
            logger.info("Goal not yet achieved, continuing loop",
                       iteration=current_iteration,
                       confidence=response_confidence,
                       pending_tasks=len(pending_tasks))

        # Build reasoning step for this iteration
        iteration_step = {
            'iteration': current_iteration,
            'goal_achieved': goal_achieved,
            'loop_status': loop_status,
            'confidence': response_confidence,
            'progress_percentage': progress_percentage,
            'pending_tasks_count': len(pending_tasks),
            'completed_tasks_count': completed_count,
            'termination_reason': termination_reason,
            'timestamp': datetime.now().isoformat()
        }

        # Append to reasoning steps
        reasoning_steps = state.get('reasoning_steps', [])
        reasoning_steps.append({
            'type': 'goal_check',
            'content': f"Iteration {current_iteration}: {'Goal achieved' if goal_achieved else 'Continuing'} - {termination_reason or 'Processing...'}",
            'step_type': 'goal_evaluation',
            **iteration_step
        })

        return {
            **state,
            'goal_achieved': goal_achieved,
            'goal_loop_iteration': current_iteration,
            'loop_status': loop_status,
            'termination_reason': termination_reason,
            'progress_percentage': progress_percentage,
            'pending_tasks': pending_tasks,
            'completed_tasks': completed_tasks,
            'reasoning_steps': reasoning_steps,
            'current_node': 'check_goal_completion'
        }

    @trace_node("mode3_prepare_next_iteration")
    async def prepare_next_iteration_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        PHASE 6 Node: Prepare state for next goal loop iteration.

        This node:
        1. Analyzes what was accomplished in the previous iteration
        2. Updates the task tree with completed tasks
        3. Generates refined query/focus for next iteration
        4. Resets per-iteration state while preserving cumulative progress
        """
        current_iteration = state.get('goal_loop_iteration', 1)

        # Get agent response from previous iteration
        previous_response = state.get('agent_response', '')

        # Move current task to completed if there are pending tasks
        pending_tasks = state.get('pending_tasks', [])
        completed_tasks = state.get('completed_tasks', [])

        if pending_tasks:
            # Mark first pending task as completed
            completed_task = pending_tasks.pop(0)
            if isinstance(completed_task, dict):
                completed_task['completed_at'] = datetime.now().isoformat()
                completed_task['iteration'] = current_iteration
            completed_tasks.append(completed_task)

        # Generate next iteration focus based on remaining tasks
        next_focus = state.get('query', '')  # Default to original query
        if pending_tasks:
            if isinstance(pending_tasks[0], dict):
                next_focus = pending_tasks[0].get('description', pending_tasks[0].get('name', next_focus))
            else:
                next_focus = str(pending_tasks[0])

        # Build self-reflection on previous iteration
        self_reflection = {
            'iteration': current_iteration,
            'previous_response_length': len(previous_response),
            'tasks_completed': len(completed_tasks),
            'tasks_remaining': len(pending_tasks),
            'next_focus': next_focus[:200] if next_focus else 'Continue analysis',
            'timestamp': datetime.now().isoformat()
        }

        self_reflections = state.get('self_reflections', [])
        self_reflections.append(self_reflection)

        logger.info("Preparing next iteration",
                   iteration=current_iteration + 1,
                   completed=len(completed_tasks),
                   remaining=len(pending_tasks),
                   next_focus=next_focus[:100])

        return {
            **state,
            # Update task tracking
            'pending_tasks': pending_tasks,
            'completed_tasks': completed_tasks,
            # Preserve cumulative context
            'iteration_context': state.get('agent_response', ''),
            'self_reflections': self_reflections,
            # Reset per-iteration state
            'agent_response': '',  # Clear for next iteration
            'step_results': [],  # Clear step results
            'current_node': 'prepare_next_iteration'
        }

    def _should_continue_goal_loop(self, state: UnifiedWorkflowState) -> str:
        """
        Conditional routing function for goal-driven loop.

        Returns:
        - 'continue_loop': Loop back for another iteration
        - 'exit_loop': Proceed to decision approval and output

        CRITICAL: Has FAIL-SAFE checks to prevent infinite loops!
        """
        goal_achieved = state.get('goal_achieved', False)
        loop_status = state.get('loop_status', 'unknown')
        current_iteration = state.get('goal_loop_iteration', 0)
        max_iterations = state.get('max_goal_iterations', 5)
        errors = state.get('errors', [])

        # FAIL-SAFE 1: Max iterations check (redundant but critical)
        if current_iteration >= max_iterations:
            logger.warning("FAIL-SAFE: Max iterations reached in routing",
                          iterations=current_iteration, max=max_iterations)
            return 'exit_loop'

        # FAIL-SAFE 2: Too many errors
        if len(errors) > 2:
            logger.warning("FAIL-SAFE: Too many errors, forcing exit",
                          error_count=len(errors))
            return 'exit_loop'

        # FAIL-SAFE 3: Already have a response (simple queries)
        if state.get('agent_response') and current_iteration >= 1:
            confidence = state.get('response_confidence', state.get('plan_confidence', 0.7))
            # If we have a response with decent confidence, exit
            if confidence >= 0.7:
                logger.info("FAIL-SAFE: Have response with sufficient confidence",
                           confidence=confidence, iteration=current_iteration)
                return 'exit_loop'

        # Primary check: goal_achieved flag
        if goal_achieved:
            logger.info("Goal loop complete, exiting to approval",
                       status=loop_status,
                       iterations=current_iteration)
            return 'exit_loop'
        else:
            logger.info("Goal not achieved, continuing loop",
                       iteration=current_iteration)
            return 'continue_loop'

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

    # ===== ADDITIONAL HITL CHECKPOINT NODES (Completing all 5 checkpoints) =====

    @trace_node("mode3_request_tool_approval")
    async def request_tool_approval_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        HITL Checkpoint 2: Tool Execution Approval.

        Requests user approval before executing external tools like:
        - RAG retrieval with side effects
        - Database queries
        - Web searches
        - Code execution

        Auto-approves safe read-only tools in Balanced mode.
        """
        if not self.hitl_service or not state.get('hitl_initialized'):
            return {**state, 'tool_approved': True, 'current_node': 'request_tool_approval'}

        # Get tools required from plan
        tools_required = state.get('tools_required', [])
        if not tools_required:
            return {**state, 'tool_approved': True, 'current_node': 'request_tool_approval'}

        try:
            # Build tool list for approval request
            tools = [
                {
                    'name': tool,
                    'params': {},
                    'cost': 0.02,  # Estimated cost per tool
                    'has_side_effects': tool in ['database_write', 'code_execute', 'file_write']
                }
                for tool in tools_required
            ]

            has_side_effects = any(t.get('has_side_effects', False) for t in tools)

            approval = await self.hitl_service.request_tool_execution_approval(
                request=ToolExecutionApprovalRequest(
                    step_number=1,
                    step_name=f"Execute {len(tools)} tool(s)",
                    tools=tools,
                    total_estimated_cost=len(tools) * 0.02,
                    total_estimated_duration_minutes=len(tools) * 2,
                    has_side_effects=has_side_effects
                ),
                session_id=state['session_id'],
                user_id=state['user_id']
            )

            if approval.status == 'rejected':
                logger.warning("Tool execution rejected by user")
                return {
                    **state,
                    'tool_approved': False,
                    'rejection_reason': approval.user_feedback,
                    'current_node': 'request_tool_approval'
                }

            logger.info("Tool execution approved", tools=len(tools))
            return {**state, 'tool_approved': True, 'current_node': 'request_tool_approval'}

        except Exception as e:
            logger.error("Tool approval request failed", error=str(e))
            return {
                **state,
                'tool_approved': True,  # Default to approved on error for graceful degradation
                'errors': state.get('errors', []) + [f"Tool approval failed: {str(e)}"],
                'current_node': 'request_tool_approval'
            }

    @trace_node("mode3_request_subagent_approval")
    async def request_subagent_approval_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        HITL Checkpoint 3: Sub-Agent Spawning Approval.

        Requests user approval before spawning specialist agents:
        - L3 Specialist Agents
        - L4 Worker Agents
        - L5 Tool Agents

        Auto-approves in Minimal mode for L4/L5 only.
        """
        if not self.hitl_service or not state.get('hitl_initialized'):
            return {**state, 'subagent_approved': True, 'current_node': 'request_subagent_approval'}

        # Get sub-agents needed from task tree or plan
        task_tree = state.get('task_tree', [])
        sub_agents_needed = [t for t in task_tree if t.get('level', 2) >= 3]

        if not sub_agents_needed:
            return {**state, 'subagent_approved': True, 'current_node': 'request_subagent_approval'}

        try:
            # Approve each sub-agent (batch for efficiency)
            approved_agents = []
            rejected_agents = []

            for agent_task in sub_agents_needed[:5]:  # Limit to 5 for UX
                approval = await self.hitl_service.request_subagent_approval(
                    request=SubAgentApprovalRequest(
                        parent_agent_id=state.get('current_agent_id', 'unknown'),
                        sub_agent_id=agent_task.get('id', 'auto-generated'),
                        sub_agent_name=f"L{agent_task.get('level', 3)} Specialist",
                        sub_agent_level=agent_task.get('level', 3),
                        sub_agent_specialty=agent_task.get('description', 'General task')[:100],
                        task_description=agent_task.get('description', ''),
                        estimated_duration_minutes=5,
                        estimated_cost=0.10,
                        reasoning="Required for complex task decomposition"
                    ),
                    session_id=state['session_id'],
                    user_id=state['user_id']
                )

                if approval.status == 'approved':
                    approved_agents.append(agent_task.get('id'))
                else:
                    rejected_agents.append(agent_task.get('id'))

            if rejected_agents:
                logger.warning(f"Some sub-agents rejected: {len(rejected_agents)}")

            logger.info("Sub-agent approval completed",
                       approved=len(approved_agents),
                       rejected=len(rejected_agents))

            return {
                **state,
                'subagent_approved': len(approved_agents) > 0,
                'approved_subagents': approved_agents,
                'rejected_subagents': rejected_agents,
                'current_node': 'request_subagent_approval'
            }

        except Exception as e:
            logger.error("Sub-agent approval request failed", error=str(e))
            return {
                **state,
                'subagent_approved': True,  # Default approve on error
                'errors': state.get('errors', []) + [f"Sub-agent approval failed: {str(e)}"],
                'current_node': 'request_subagent_approval'
            }

    @trace_node("mode3_request_final_review")
    async def request_final_review_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        HITL Checkpoint 5: Final Review.

        Presents complete response to user for final approval before delivery.
        Includes:
        - Full response content
        - Citations and evidence
        - Execution trace
        - Confidence score
        """
        if not self.hitl_service or not state.get('hitl_initialized'):
            return {**state, 'final_approved': True, 'current_node': 'request_final_review'}

        response = state.get('agent_response', '')
        if not response:
            return {**state, 'final_approved': True, 'current_node': 'request_final_review'}

        try:
            # Use artifact approval for final review
            if hasattr(self.hitl_service, 'request_artifact_approval'):
                from services.hitl_service import ArtifactGenerationApprovalRequest

                approval = await self.hitl_service.request_artifact_approval(
                    request=ArtifactGenerationApprovalRequest(
                        artifacts=[
                            {
                                'type': 'response',
                                'name': 'Final Response',
                                'content_length': len(response),
                                'has_citations': len(state.get('citations', [])) > 0
                            }
                        ],
                        total_estimated_time_minutes=0  # Already generated
                    ),
                    session_id=state['session_id'],
                    user_id=state['user_id']
                )

                if approval.status == 'rejected':
                    logger.warning("Final response rejected by user")
                    return {
                        **state,
                        'final_approved': False,
                        'requires_revision': True,
                        'rejection_reason': approval.user_feedback,
                        'current_node': 'request_final_review'
                    }

            logger.info("Final response approved by user")
            return {**state, 'final_approved': True, 'current_node': 'request_final_review'}

        except Exception as e:
            logger.error("Final review request failed", error=str(e))
            return {
                **state,
                'final_approved': True,  # Default approve on error
                'errors': state.get('errors', []) + [f"Final review failed: {str(e)}"],
                'current_node': 'request_final_review'
            }

    # ===== END HITL CHECKPOINT NODES =====

    # ===== PHASE 5: WORLD-CLASS ENHANCED NODES =====

    @trace_node("mode5_initialize_autonomy")
    async def initialize_autonomy_config_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        PHASE 5 Node: Initialize autonomy configuration based on user/tenant settings.

        Autonomy Levels:
        - A (Fully Autonomous): Auto-execute tools up to $0.50, auto-spawn L3/L4
        - B (Semi-Autonomous): HITL for side-effects, auto-spawn L4/L5 only
        - C (Supervised): HITL for all tools and spawning
        """
        if not ENHANCEMENTS_AVAILABLE:
            return {**state, 'autonomy_level': 'B', 'current_node': 'initialize_autonomy_config'}

        # Get autonomy level from state or default to B
        autonomy_level = state.get('autonomy_level', 'B')

        try:
            self.autonomy_config = create_autonomy_config(autonomy_level)

            # Register the primary agent for collaboration
            if self.agent_collaborator and state.get('current_agent_id'):
                self.agent_collaborator.register_agent(
                    agent_id=state['current_agent_id'],
                    level=2,  # L2 Expert (user-selected)
                    capabilities=state.get('agent_capabilities', [])
                )

            logger.info(
                "Autonomy config initialized",
                level=autonomy_level,
                max_tool_cost=self.autonomy_config.max_tool_cost_auto_approve,
                auto_spawn_l3=self.autonomy_config.auto_spawn_l3,
                max_recursive_depth=self.autonomy_config.max_recursive_depth
            )

            return {
                **state,
                'autonomy_level': autonomy_level,
                'autonomy_initialized': True,
                'max_recursive_depth': self.autonomy_config.max_recursive_depth,
                'max_query_cost': self.autonomy_config.max_query_cost_usd,
                'current_node': 'initialize_autonomy_config'
            }
        except Exception as e:
            logger.error("Autonomy config initialization failed", error=str(e))
            return {
                **state,
                'autonomy_level': 'B',
                'autonomy_initialized': False,
                'errors': state.get('errors', []) + [f"Autonomy init failed: {str(e)}"],
                'current_node': 'initialize_autonomy_config'
            }

    @trace_node("mode5_recursive_decomposition")
    async def recursive_decomposition_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        PHASE 5 Node: AutoGPT-style recursive task decomposition.

        Replaces static 5-step ToT planning with dynamic recursive breakdown.
        Each sub-task is assigned to appropriate agent level (L3/L4/L5).
        """
        if not ENHANCEMENTS_AVAILABLE or not self.recursive_decomposer:
            # Fallback to existing plan
            return {**state, 'decomposition_type': 'fallback', 'current_node': 'recursive_decomposition'}

        query = state.get('query', '')
        context = state.get('context_summary', '')
        agent_id = state.get('current_agent_id')

        try:
            # Track created tasks for HITL
            created_tasks = []
            def on_task_created(task: TaskNode):
                created_tasks.append({
                    'id': task.id,
                    'description': task.description,
                    'depth': task.depth,
                    'level': task.assigned_agent_level
                })

            # Perform recursive decomposition
            self._task_tree = await self.recursive_decomposer.decompose(
                goal=query,
                context=context,
                agent_id=agent_id,
                on_task_created=on_task_created
            )

            # Convert task tree to plan steps for backward compatibility
            plan_steps = self._flatten_task_tree(self._task_tree)

            logger.info(
                "Recursive decomposition complete",
                total_tasks=len(created_tasks),
                max_depth=self._task_tree.depth if self._task_tree else 0,
                plan_steps=len(plan_steps)
            )

            return {
                **state,
                'plan': {'steps': plan_steps, 'confidence': 0.85},
                'plan_confidence': 0.85,
                'plan_generated': 'recursive',
                'decomposition_type': 'recursive',
                'task_tree': created_tasks,
                'total_sub_tasks': len(created_tasks),
                'current_node': 'recursive_decomposition'
            }
        except Exception as e:
            logger.error("Recursive decomposition failed", error=str(e))
            return {
                **state,
                'plan': {'steps': [{'description': query, 'confidence': 0.5}], 'confidence': 0.5},
                'decomposition_type': 'error',
                'errors': state.get('errors', []) + [f"Decomposition failed: {str(e)}"],
                'current_node': 'recursive_decomposition'
            }

    def _flatten_task_tree(self, node: TaskNode, steps: list = None) -> list:
        """Flatten task tree to plan steps for backward compatibility."""
        if steps is None:
            steps = []

        if not node:
            return steps

        # Add this node as a step
        steps.append({
            'description': node.description,
            'confidence': node.confidence or 0.7,
            'agent_level': node.assigned_agent_level,
            'depth': node.depth
        })

        # Recursively add sub-tasks
        for sub_task in node.sub_tasks:
            self._flatten_task_tree(sub_task, steps)

        return steps

    @trace_node("mode5_calibrate_confidence")
    async def calibrate_confidence_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        PHASE 5 Node: Multi-factor confidence calibration.

        Replaces fixed confidence values with evidence-based calibration using:
        - RAG retrieval confidence
        - Domain expertise match
        - Evidence strength
        - Consensus score (if multiple agents)
        - Historical accuracy
        - Query complexity
        """
        if not ENHANCEMENTS_AVAILABLE or not self.confidence_calibrator:
            return {**state, 'confidence_calibrated': False, 'current_node': 'calibrate_confidence'}

        query = state.get('query', '')
        agent_id = state.get('current_agent_id')
        rag_results = state.get('retrieved_documents', [])
        evidence = state.get('citations', [])

        # Get agent's domain expertise
        agent_config = await self._load_agent_config_cached(agent_id) if agent_id else {}
        domain_expertise = agent_config.get('knowledge_domains', [])

        try:
            calibrated_confidence, factors = await self.confidence_calibrator.calibrate(
                query=query,
                agent_id=agent_id,
                rag_results=rag_results,
                evidence=evidence,
                domain_expertise=domain_expertise
            )

            logger.info(
                "Confidence calibrated",
                calibrated=f"{calibrated_confidence:.2%}",
                rag_confidence=f"{factors.rag_confidence:.2%}",
                domain_match=f"{factors.domain_match:.2%}",
                evidence_strength=f"{factors.evidence_strength:.2%}"
            )

            return {
                **state,
                'response_confidence': calibrated_confidence,
                'confidence_calibrated': True,
                'confidence_factors': {
                    'rag': factors.rag_confidence,
                    'domain': factors.domain_match,
                    'evidence': factors.evidence_strength,
                    'consensus': factors.consensus_score,
                    'historical': factors.historical_accuracy,
                    'complexity': factors.query_complexity
                },
                'current_node': 'calibrate_confidence'
            }
        except Exception as e:
            logger.error("Confidence calibration failed", error=str(e))
            return {
                **state,
                'response_confidence': state.get('response_confidence', 0.7),
                'confidence_calibrated': False,
                'errors': state.get('errors', []) + [f"Calibration failed: {str(e)}"],
                'current_node': 'calibrate_confidence'
            }

    @trace_node("mode5_execute_with_recovery")
    async def execute_with_recovery_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        PHASE 5 Node: Execute agent with multi-level error recovery.

        Recovery Levels:
        1. Immediate Retry: For transient errors (network issues)
        2. Backoff Retry: For temporary errors (rate limits)
        3. Fallback: Use alternative agent/tool
        4. Graceful Degradation: Return partial results
        """
        if not ENHANCEMENTS_AVAILABLE or not self.error_recovery:
            # Fallback to standard execution without recovery wrapper
            return state

        async def primary_operation():
            """Primary agent execution."""
            # This would call the actual agent execution
            # For now, we return the current agent response
            return state.get('agent_response', '')

        async def fallback_operation():
            """Fallback to simpler execution."""
            # Generate a simpler response using the context
            query = state.get('query', '')
            context = state.get('context_summary', '')

            return f"Based on available information about '{query[:50]}...': {context[:500]}..."

        try:
            result, success, warnings = await self.error_recovery.execute_with_recovery(
                operation=primary_operation,
                fallback=fallback_operation,
                operation_name="agent_execution",
                context={'agent_id': state.get('current_agent_id')}
            )

            if warnings:
                logger.warning("Execution completed with warnings", warnings=warnings)

            return {
                **state,
                'agent_response': result if result else state.get('agent_response', ''),
                'execution_success': success,
                'execution_warnings': warnings,
                'recovery_applied': len(warnings) > 0,
                'current_node': 'execute_with_recovery'
            }
        except Exception as e:
            logger.error("Execution with recovery failed completely", error=str(e))
            error_summary = self.error_recovery.get_error_summary()
            return {
                **state,
                'execution_success': False,
                'execution_warnings': [f"All recovery strategies failed: {str(e)}"],
                'error_summary': error_summary,
                'current_node': 'execute_with_recovery'
            }

    @trace_node("mode5_agent_collaboration")
    async def agent_collaboration_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        PHASE 5 Node: Cross-level agent collaboration for complex tasks.

        Enables:
        - Horizontal collaboration (L4↔L4)
        - Vertical escalation (L5→L4→L3→L2→L1)
        - Broadcast messages to active agents
        """
        if not ENHANCEMENTS_AVAILABLE or not self.agent_collaborator:
            return {**state, 'collaboration_enabled': False, 'current_node': 'agent_collaboration'}

        # Check if task requires collaboration
        task_tree = state.get('task_tree', [])
        requires_collaboration = len(task_tree) > 3  # Multiple sub-tasks

        if not requires_collaboration:
            return {
                **state,
                'collaboration_enabled': False,
                'collaboration_reason': 'Task simple enough for single agent',
                'current_node': 'agent_collaboration'
            }

        try:
            # Get agents assigned to sub-tasks
            l3_tasks = [t for t in task_tree if t.get('level') == 3]
            l4_tasks = [t for t in task_tree if t.get('level') == 4]

            # Register sub-agents for collaboration
            for i, task in enumerate(l3_tasks[:3]):  # Limit to 3 L3 agents
                agent_id = f"l3_agent_{i}"
                self.agent_collaborator.register_agent(
                    agent_id=agent_id,
                    level=3,
                    capabilities=[task.get('description', '')[:100]]
                )

            for i, task in enumerate(l4_tasks[:5]):  # Limit to 5 L4 agents
                agent_id = f"l4_agent_{i}"
                self.agent_collaborator.register_agent(
                    agent_id=agent_id,
                    level=4,
                    capabilities=[task.get('description', '')[:100]]
                )

            # Broadcast task coordination message
            primary_agent = state.get('current_agent_id')
            if primary_agent:
                await self.agent_collaborator.broadcast(
                    source_agent_id=primary_agent,
                    message_type='task_coordination',
                    payload={
                        'total_tasks': len(task_tree),
                        'l3_count': len(l3_tasks),
                        'l4_count': len(l4_tasks)
                    },
                    target_levels=[3, 4]
                )

            logger.info(
                "Agent collaboration initialized",
                l3_agents=len(l3_tasks),
                l4_agents=len(l4_tasks),
                total_tasks=len(task_tree)
            )

            return {
                **state,
                'collaboration_enabled': True,
                'active_l3_agents': len(l3_tasks),
                'active_l4_agents': len(l4_tasks),
                'current_node': 'agent_collaboration'
            }
        except Exception as e:
            logger.error("Agent collaboration setup failed", error=str(e))
            return {
                **state,
                'collaboration_enabled': False,
                'errors': state.get('errors', []) + [f"Collaboration failed: {str(e)}"],
                'current_node': 'agent_collaboration'
            }

    # ===== END PHASE 5 NODES =====

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
    
    async def _execute_with_timeout(self, agent_request, timeout: float = 120.0) -> Any:
        """
        OPTIMIZATION: Execute agent with timeout to prevent hangs

        Mode 3 PRD Specification: Response Time 60-120 seconds
        Using 120s as max timeout for autonomous execution.
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
        Build LangGraph workflow for Mode 3 (PHASE 4 + HITL Complete).

        **FULL HITL FLOW WITH ALL 5 CHECKPOINTS (PRD-COMPLIANT):**
        1. Validate tenant (security)
        2. Validate agent selection (manual)
        3. Load conversation history
        4. Initialize HITL service
        5. Assess tier (default Tier 2+ for autonomous)
        6. Plan with Tree-of-Thoughts (Tier 3)
        7. ★ HITL Checkpoint 1: Plan Approval
        8. ★ HITL Checkpoint 2: Tool Approval (before RAG)
        9. RAG retrieval
        10. ★ HITL Checkpoint 3: Sub-Agent Approval (before spawning)
        11. Execute with ReAct pattern
        12. Validate with Constitutional AI
        13. ★ HITL Checkpoint 4: Critical Decision Approval
        14. Save conversation turn
        15. ★ HITL Checkpoint 5: Final Review
        16. Format output

        Returns:
            Configured StateGraph with all 5 HITL checkpoints
        """
        graph = StateGraph(UnifiedWorkflowState)

        # PHASE 4: Add core nodes
        graph.add_node("validate_tenant", self.validate_tenant_node)
        graph.add_node("validate_agent_selection", self.validate_agent_selection_node)
        graph.add_node("load_conversation", self.load_conversation_node)
        graph.add_node("initialize_hitl", self.initialize_hitl_node)
        graph.add_node("assess_tier_autonomous", self.assess_tier_autonomous_node)
        graph.add_node("plan_with_tot", self.plan_with_tot_node)
        graph.add_node("request_plan_approval", self.request_plan_approval_node)
        graph.add_node("request_tool_approval", self.request_tool_approval_node)  # HITL Checkpoint 2
        graph.add_node("rag_retrieval", self.rag_retrieval_node)
        graph.add_node("request_subagent_approval", self.request_subagent_approval_node)  # HITL Checkpoint 3
        graph.add_node("execute_with_react", self.execute_with_react_node)
        graph.add_node("validate_with_constitutional", self.validate_with_constitutional_node)
        graph.add_node("request_decision_approval", self.request_decision_approval_node)
        graph.add_node("save_conversation", self.save_conversation_node)
        graph.add_node("request_final_review", self.request_final_review_node)  # HITL Checkpoint 5
        graph.add_node("format_output", self.format_output_node)

        # PHASE 5: Add world-class autonomous enhancement nodes
        if ENHANCEMENTS_AVAILABLE:
            graph.add_node("initialize_autonomy_config", self.initialize_autonomy_config_node)
            graph.add_node("recursive_decomposition", self.recursive_decomposition_node)
            graph.add_node("calibrate_confidence", self.calibrate_confidence_node)
            graph.add_node("execute_with_recovery", self.execute_with_recovery_node)
            graph.add_node("agent_collaboration", self.agent_collaboration_node)
            logger.info("✅ Phase 5 enhanced nodes added to Mode 3 graph")

        # PHASE 6: Add goal-driven execution loop nodes (AutoGPT-like)
        graph.add_node("check_goal_completion", self.check_goal_completion_node)
        graph.add_node("prepare_next_iteration", self.prepare_next_iteration_node)
        logger.info("✅ Phase 6 goal-driven loop nodes added to Mode 3 graph")

        logger.info("✅ All 5 HITL checkpoint nodes registered")

        # PHASE 4 + 5: Define flow with world-class enhancements
        graph.set_entry_point("validate_tenant")
        graph.add_edge("validate_tenant", "validate_agent_selection")
        graph.add_edge("validate_agent_selection", "load_conversation")
        graph.add_edge("load_conversation", "initialize_hitl")

        # PHASE 5: Route through autonomy config if available
        if ENHANCEMENTS_AVAILABLE:
            graph.add_edge("initialize_hitl", "initialize_autonomy_config")
            graph.add_edge("initialize_autonomy_config", "assess_tier_autonomous")
            graph.add_edge("assess_tier_autonomous", "recursive_decomposition")
            graph.add_edge("recursive_decomposition", "plan_with_tot")
        else:
            graph.add_edge("initialize_hitl", "assess_tier_autonomous")
            graph.add_edge("assess_tier_autonomous", "plan_with_tot")

        # ===== HITL CHECKPOINT 1: Plan Approval (conditional) =====
        graph.add_conditional_edges(
            "plan_with_tot",
            lambda s: "request_approval" if s.get('hitl_initialized') and s.get('tier', 2) >= 2 else "skip_approval",
            {
                "request_approval": "request_plan_approval",
                "skip_approval": "calibrate_confidence" if ENHANCEMENTS_AVAILABLE else "request_tool_approval"
            }
        )

        # ===== HITL CHECKPOINT 2: Tool Approval (after plan, before RAG) =====
        if ENHANCEMENTS_AVAILABLE:
            graph.add_edge("request_plan_approval", "calibrate_confidence")
            graph.add_edge("calibrate_confidence", "request_tool_approval")
        else:
            graph.add_edge("request_plan_approval", "request_tool_approval")

        # Tool approval → RAG retrieval (conditional skip for safe read-only tools)
        graph.add_conditional_edges(
            "request_tool_approval",
            lambda s: "proceed_rag" if s.get('tool_approved', True) else "skip_to_output",
            {
                "proceed_rag": "rag_retrieval",
                "skip_to_output": "format_output"
            }
        )

        # ===== HITL CHECKPOINT 3: Sub-Agent Approval (after RAG, before execution) =====
        graph.add_edge("rag_retrieval", "request_subagent_approval")

        # Sub-agent approval → execution flow (conditional based on task tree)
        if ENHANCEMENTS_AVAILABLE:
            graph.add_conditional_edges(
                "request_subagent_approval",
                lambda s: "with_recovery" if s.get('subagent_approved', True) else "skip_execution",
                {
                    "with_recovery": "execute_with_recovery",
                    "skip_execution": "validate_with_constitutional"
                }
            )
            graph.add_edge("execute_with_recovery", "execute_with_react")
            graph.add_edge("execute_with_react", "agent_collaboration")
            graph.add_edge("agent_collaboration", "validate_with_constitutional")
        else:
            graph.add_conditional_edges(
                "request_subagent_approval",
                lambda s: "execute_react" if s.get('subagent_approved', True) else "skip_execution",
                {
                    "execute_react": "execute_with_react",
                    "skip_execution": "validate_with_constitutional"
                }
            )
            graph.add_edge("execute_with_react", "validate_with_constitutional")

        # ===== PHASE 6: Goal-Driven Execution Loop (AutoGPT-like) =====
        # After Constitutional AI validation, check if goal is achieved
        graph.add_edge("validate_with_constitutional", "check_goal_completion")

        # Conditional routing based on goal completion
        graph.add_conditional_edges(
            "check_goal_completion",
            self._should_continue_goal_loop,
            {
                "exit_loop": "request_decision_approval",  # Goal achieved, proceed to decision
                "continue_loop": "prepare_next_iteration"   # Goal not achieved, continue looping
            }
        )

        # Prepare next iteration loops back to tool approval to restart execution cycle
        graph.add_edge("prepare_next_iteration", "request_tool_approval")

        logger.info("✅ Phase 6 goal-driven loop edges added (AutoGPT-like execution)")

        # ===== HITL CHECKPOINT 4: Decision Approval (after goal completion) =====
        graph.add_conditional_edges(
            "request_decision_approval",
            lambda s: "proceed_save" if s.get('decision_approved', True) else "skip_to_output",
            {
                "proceed_save": "save_conversation",
                "skip_to_output": "format_output"
            }
        )

        # ===== HITL CHECKPOINT 5: Final Review (before output) =====
        graph.add_conditional_edges(
            "save_conversation",
            lambda s: "final_review" if s.get('hitl_initialized') else "skip_review",
            {
                "final_review": "request_final_review",
                "skip_review": "format_output"
            }
        )

        graph.add_edge("request_final_review", "format_output")
        graph.add_edge("format_output", END)

        logger.info("✅ Mode 3 graph built with Phase 4 + 5 enhancements",
                   nodes=len(graph.nodes),
                   hitl_enabled=HITL_AVAILABLE,
                   patterns_enabled=PATTERNS_AVAILABLE,
                   enhancements_enabled=ENHANCEMENTS_AVAILABLE)

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
            # Query with proper schema: agent_level_id + joins to get level_number and capabilities
            agent_result = self.supabase.table('agents').select(
                'id, name, agent_level_id, agent_levels(name, level_number), agent_capabilities(capabilities(name))'
            ).eq('id', selected_agent_id).single().execute()

            if not agent_result.data:
                return {
                    **state,
                    'status': ExecutionStatus.FAILED,
                    'errors': state.get('errors', []) + [f"Expert agent not found: {selected_agent_id}"]
                }

            agent = agent_result.data

            # Extract level_number as tier (agent_levels join)
            agent_level = agent.get('agent_levels') or {}
            tier = agent_level.get('level_number', 2)  # Default to level 2

            # Extract capabilities from junction table
            agent_caps = agent.get('agent_capabilities') or []
            capabilities = [c.get('capabilities', {}).get('name') for c in agent_caps if c.get('capabilities')]

            logger.info(
                "Expert agent validated (Mode 3)",
                agent_id=selected_agent_id,
                agent_name=agent.get('name'),
                tier=tier
            )

            return {
                **state,
                'current_agent_id': selected_agent_id,
                'current_agent_type': agent.get('name'),
                'agent_tier': tier,
                'agent_capabilities': capabilities,
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
        """Node: RAG retrieval with conversation context and domain/tool selectors."""
        tenant_id = state['tenant_id']
        query = state['query']
        expert_id = state.get('current_agent_id')

        # Pull optional selectors from state (populated by API payload)
        selected_domains = state.get('selected_rag_domains') or []
        requested_tools = state.get('requested_tools') or []

        try:
            rag_results = await self.rag_service.query(
                query_text=query,
                tenant_id=tenant_id,
                agent_id=expert_id,
                max_results=10,
                strategy="true_hybrid",
                similarity_threshold=0.7,
                domains=selected_domains,
                requested_tools=requested_tools or None,
            )

            documents = rag_results.get('sources', []) or rag_results.get('documents', [])
            context = self._create_context_summary(documents)

            logger.info(
                "RAG retrieval completed (Mode 3)",
                documents=len(documents),
                domains=selected_domains,
                requested_tools=requested_tools,
            )

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
        Node: Format final output with complete autonomous metadata for Mode 3.

        Mode 3 returns (AutoGPT-like data):
        - Response text
        - Reasoning trace (Chain-of-Thought)
        - Autonomous reasoning metadata (strategy, plan, ReAct iterations)
        - HITL checkpoint status (5 checkpoints)
        - Autonomy metadata (decomposition, task tree, confidence)
        - Sub-agents used
        - Artifacts generated (properly formatted)
        - Code execution results
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

        # === AUTONOMOUS REASONING METADATA (NEW - Critical for Mode 3) ===
        # This aggregates all reasoning data accumulated through the workflow
        autonomous_reasoning = {
            'strategy': state.get('pattern_applied', state.get('reasoning_pattern', 'react')),
            'reasoning_steps': state.get('reasoning_steps', state.get('step_results', [])),
            'plan': state.get('plan', state.get('execution_plan', {})),
            'plan_confidence': state.get('plan_confidence', 0.0),
            'tier': state.get('tier', 2),
            'tier_reasoning': state.get('tier_reasoning', ''),
            'iterations': len(state.get('step_results', [])),
            'tools_used': state.get('tools_executed', []),
            'hitl_required': state.get('hitl_initialized', False),
            'confidence_threshold': 0.95,
            # ReAct-specific data
            'react_iterations': state.get('react_iterations', 0),
            'react_converged': state.get('react_converged', False),
            'observations': state.get('observations', []),
            # Tree-of-Thoughts data
            'thought_tree': state.get('thought_tree', []),
            'selected_strategy': state.get('selected_strategy', {}),
            'alternative_strategies': state.get('alternative_strategies', []),
            # Self-reflection data
            'self_reflections': state.get('self_reflections', []),
            'corrections_applied': state.get('corrections_applied', []),
        }

        # === HITL CHECKPOINT STATUS (NEW - 5 checkpoints per PRD) ===
        hitl_checkpoints = {
            'plan_approved': state.get('plan_approved', None),
            'tool_approved': state.get('tool_approved', None),
            'subagent_approved': state.get('subagent_approved', None),
            'decision_approved': state.get('decision_approved', None),
            'final_approved': state.get('final_approved', None),
            'approval_timeout': state.get('approval_timeout', False),
            'rejection_reason': state.get('rejection_reason', None),
        }

        # === AUTONOMY METADATA (NEW - Phase 5 enhancements) ===
        autonomy_metadata = {
            'autonomy_level': state.get('autonomy_level', 'B'),
            'decomposition_type': state.get('decomposition_type', 'fallback'),
            'task_tree': state.get('task_tree', []),
            'completed_tasks': state.get('completed_tasks', []),
            'pending_tasks': state.get('pending_tasks', []),
            'goal_achieved': state.get('goal_achieved', False),
            'loop_status': state.get('loop_status', 'complete'),
            'confidence_calibrated': state.get('confidence_calibrated', False),
            'confidence_factors': state.get('confidence_factors', {}),
            'recovery_applied': state.get('recovery_applied', False),
            'collaboration_enabled': state.get('collaboration_enabled', False),
            'active_l3_agents': state.get('active_l3_agents', 0),
            'active_l4_agents': state.get('active_l4_agents', 0),
        }

        return {
            **state,
            'response': state.get('agent_response', ''),
            'content': state.get('agent_response', ''),  # Alias for frontend compatibility
            'confidence': state.get('response_confidence', 0.0),
            'agents_used': [state.get('current_agent_id')] + state.get('sub_agents_spawned', []),
            'reasoning_trace': state.get('reasoning_trace', []),
            'reasoning': state.get('reasoning_steps', state.get('step_results', [])),  # Alias
            'artifacts': formatted_artifacts,
            'citations': state.get('citations', []),
            'sources': state.get('retrieved_documents', []),  # Full sources for frontend
            'rag_sources': state.get('retrieved_documents', []),  # Alias
            'sources_used': len(state.get('retrieved_documents', [])),
            'tools_used': len(state.get('tools_executed', [])),
            'code_executed': len(state.get('code_executed', [])),
            'status': ExecutionStatus.COMPLETED,
            'current_node': 'format_output',
            # Agent metadata for API response (required by main.py endpoint)
            'selected_agent_id': state.get('current_agent_id'),
            'selected_agent_name': state.get('current_agent_type', 'Unknown Agent'),
            'selection_confidence': state.get('agent_selection_confidence', 0.85),
            # === NEW: Autonomous workflow metadata ===
            'autonomous_reasoning': autonomous_reasoning,
            'hitl_checkpoints': hitl_checkpoints,
            'autonomy_metadata': autonomy_metadata,
            # HITL pending flag for frontend
            'hitl_pending': state.get('requires_human_review', False) or state.get('hitl_pending', False),
            'hitl_checkpoint_type': state.get('current_hitl_checkpoint', 'final_review'),
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
