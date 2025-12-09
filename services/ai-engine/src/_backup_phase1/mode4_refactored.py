"""
Mode 4: Automatic Autonomous - Background Mission (REFACTORED)

Phase 1 Refactoring: Task 1.3.4
Target: <500 lines (original: 1,785 lines)

Mode 4 Specifics:
- System AUTOMATICALLY selects agent(s)
- AUTONOMOUS multi-step execution
- Full autopilot with self-correction
- Background processing via Celery
- Cost gates and circuit breakers
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import structlog

from langgraph.graph import StateGraph, END

from langgraph_workflows.base_workflow import BaseWorkflow
from langgraph_workflows.state_schemas import (
    UnifiedWorkflowState,
    WorkflowMode,
    ExecutionStatus,
)
from langgraph_workflows.observability import trace_node

# Shared Kernel imports
from langgraph_workflows.shared import (
    StateFactory,
    process_input_node,
    create_rag_retriever_node,
    format_response_node,
    StreamingMixin,
    WorkflowError,
    WorkflowErrorType,
)

logger = structlog.get_logger()


class Mode4AutomaticAutonomousWorkflowRefactored(BaseWorkflow, StreamingMixin):
    """
    Mode 4: Automatic Autonomous - Background Mission (Refactored)
    
    Combines:
    - Mode 2: Automatic agent selection
    - Mode 3: Autonomous execution
    
    Key features:
    - Full autopilot
    - Self-correction
    - Background Celery tasks
    - Cost gates
    - Circuit breakers
    """
    
    def __init__(
        self,
        supabase_client,
        rag_service=None,
        agent_orchestrator=None,
        agent_selector=None,
        **kwargs
    ):
        """Initialize Mode 4 workflow."""
        super().__init__(
            workflow_name="Mode4_Automatic_Autonomous_Refactored",
            mode=WorkflowMode.MODE_4_STREAMING,
            enable_checkpoints=True
        )
        
        self.supabase = supabase_client
        self.rag_service = rag_service
        self.agent_orchestrator = agent_orchestrator
        self.agent_selector = agent_selector
        
        # Create RAG node
        self.rag_node = create_rag_retriever_node(
            rag_service=rag_service,
            top_k=15,
        ) if rag_service else None
        
        logger.info("Mode4 workflow initialized with shared kernel")
    
    def build_graph(self) -> StateGraph:
        """Build LangGraph workflow for Mode 4."""
        graph = StateGraph(UnifiedWorkflowState)
        
        # Shared nodes
        graph.add_node("process_input", process_input_node)
        graph.add_node("format_output", format_response_node)
        
        # Mode 4 specific nodes
        graph.add_node("validate_tenant", self._validate_tenant_node)
        graph.add_node("select_agent", self._select_agent_node)
        graph.add_node("check_budget", self._check_budget_node)
        graph.add_node("create_plan", self._create_plan_node)
        graph.add_node("rag_retrieval", self._rag_retrieval_node)
        graph.add_node("execute_step", self._execute_step_node)
        graph.add_node("self_correct", self._self_correct_node)
        graph.add_node("check_goal", self._check_goal_node)
        graph.add_node("circuit_breaker", self._circuit_breaker_node)
        graph.add_node("synthesize", self._synthesize_node)
        
        # Define flow
        graph.set_entry_point("process_input")
        graph.add_edge("process_input", "validate_tenant")
        graph.add_edge("validate_tenant", "select_agent")
        graph.add_edge("select_agent", "check_budget")
        
        # Budget gate
        graph.add_conditional_edges(
            "check_budget",
            self._route_budget_check,
            {
                "proceed": "create_plan",
                "exceeded": "format_output",
            }
        )
        
        graph.add_edge("create_plan", "rag_retrieval")
        graph.add_edge("rag_retrieval", "execute_step")
        graph.add_edge("execute_step", "self_correct")
        graph.add_edge("self_correct", "circuit_breaker")
        
        # Circuit breaker check
        graph.add_conditional_edges(
            "circuit_breaker",
            self._route_circuit_breaker,
            {
                "continue": "check_goal",
                "break": "synthesize",
            }
        )
        
        # Goal check loop
        graph.add_conditional_edges(
            "check_goal",
            self._route_goal_check,
            {
                "achieved": "synthesize",
                "continue": "execute_step",
                "max_iterations": "synthesize",
            }
        )
        
        graph.add_edge("synthesize", "format_output")
        graph.add_edge("format_output", END)
        
        return graph
    
    # =========================================================================
    # MODE 4 SPECIFIC NODES
    # =========================================================================
    
    @trace_node("mode4_validate_tenant")
    async def _validate_tenant_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Validate tenant isolation."""
        if not state.get('tenant_id'):
            raise WorkflowError(
                WorkflowErrorType.TENANT_ERROR,
                "tenant_id is required",
            )
        return {
            'nodes_executed': ['validate_tenant'],
            'updated_at': datetime.utcnow(),
        }
    
    @trace_node("mode4_select_agent")
    async def _select_agent_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Automatic agent selection (from Mode 2)."""
        query = state.get('query', '')
        tenant_id = state.get('tenant_id')
        
        # Check if agent pre-selected
        if state.get('selected_agents'):
            return {
                'selection_method': 'pre_selected',
                'nodes_executed': ['select_agent'],
            }
        
        try:
            if self.agent_selector:
                selection = await self.agent_selector.select_agent(
                    query=query,
                    tenant_id=tenant_id,
                )
                return {
                    'selected_agents': [selection.agent_id],
                    'selection_confidence': selection.confidence,
                    'selection_method': 'automatic',
                    'nodes_executed': ['select_agent'],
                    'updated_at': datetime.utcnow(),
                }
            
            # Fallback
            return {
                'selected_agents': ['default-agent'],
                'selection_method': 'fallback',
                'nodes_executed': ['select_agent'],
            }
            
        except Exception as e:
            logger.error("Agent selection failed", error=str(e))
            return {
                'selected_agents': ['default-agent'],
                'errors': [str(e)],
                'nodes_executed': ['select_agent'],
            }
    
    @trace_node("mode4_check_budget")
    async def _check_budget_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Cost gate - check if within budget."""
        tenant_id = state.get('tenant_id')
        
        # In production, query budget from database
        # For now, assume within budget
        budget_remaining = 100.0  # Placeholder
        estimated_cost = 1.0
        
        return {
            'budget_check': {
                'remaining': budget_remaining,
                'estimated': estimated_cost,
                'within_budget': budget_remaining >= estimated_cost,
            },
            'nodes_executed': ['check_budget'],
            'updated_at': datetime.utcnow(),
        }
    
    @trace_node("mode4_create_plan")
    async def _create_plan_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Create autonomous execution plan."""
        query = state.get('query', '')
        
        plan = {
            'goal': query,
            'steps': [
                {'step': 1, 'action': 'analyze'},
                {'step': 2, 'action': 'gather_evidence'},
                {'step': 3, 'action': 'reason'},
                {'step': 4, 'action': 'synthesize'},
            ],
            'max_iterations': state.get('max_goal_iterations', 10),
        }
        
        return {
            'plan': plan,
            'goal_loop_iteration': 0,
            'nodes_executed': ['create_plan'],
            'updated_at': datetime.utcnow(),
        }
    
    @trace_node("mode4_rag_retrieval")
    async def _rag_retrieval_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """RAG retrieval."""
        if self.rag_node:
            return await self.rag_node(state)
        return {
            'retrieved_documents': [],
            'nodes_executed': ['rag_retrieval'],
        }
    
    @trace_node("mode4_execute_step")
    async def _execute_step_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Execute autonomous step."""
        from langchain_core.messages import HumanMessage, SystemMessage
        
        iteration = state.get('goal_loop_iteration', 0)
        query = state.get('query', '')
        documents = state.get('retrieved_documents', [])
        
        context = "\n".join([doc.get('content', '')[:300] for doc in documents[:5]])
        
        try:
            if self.agent_orchestrator and self.agent_orchestrator.llm:
                messages = [
                    SystemMessage(content=f"Execute step {iteration + 1}. Context: {context}"),
                    HumanMessage(content=query),
                ]
                response = await self.agent_orchestrator.llm.ainvoke(messages)
                
                return {
                    'reasoning_steps': [{
                        'iteration': iteration,
                        'response': response.content[:500],
                    }],
                    'goal_loop_iteration': iteration + 1,
                    'nodes_executed': ['execute_step'],
                    'updated_at': datetime.utcnow(),
                }
                
        except Exception as e:
            logger.error("Step execution failed", error=str(e))
        
        return {
            'goal_loop_iteration': iteration + 1,
            'nodes_executed': ['execute_step'],
        }
    
    @trace_node("mode4_self_correct")
    async def _self_correct_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Self-correction for autonomous execution."""
        errors = state.get('errors', [])
        
        # Simple self-correction logic
        if errors:
            logger.info("Self-correction triggered", error_count=len(errors))
            return {
                'corrections_applied': [{
                    'type': 'error_recovery',
                    'timestamp': datetime.utcnow().isoformat(),
                }],
                'nodes_executed': ['self_correct'],
            }
        
        return {
            'nodes_executed': ['self_correct'],
            'updated_at': datetime.utcnow(),
        }
    
    @trace_node("mode4_circuit_breaker")
    async def _circuit_breaker_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Circuit breaker to prevent runaway execution."""
        iteration = state.get('goal_loop_iteration', 0)
        max_iterations = state.get('max_goal_iterations', 10)
        errors = state.get('errors', [])
        
        # Trip circuit breaker conditions
        should_break = (
            iteration >= max_iterations or
            len(errors) >= 3  # Too many errors
        )
        
        return {
            'circuit_breaker_tripped': should_break,
            'nodes_executed': ['circuit_breaker'],
            'updated_at': datetime.utcnow(),
        }
    
    @trace_node("mode4_check_goal")
    async def _check_goal_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Check if goal achieved."""
        iteration = state.get('goal_loop_iteration', 0)
        max_iterations = state.get('max_goal_iterations', 10)
        confidence = state.get('response_confidence', 0.0)
        threshold = state.get('confidence_threshold', 0.95)
        
        goal_achieved = confidence >= threshold
        
        return {
            'goal_achieved': goal_achieved,
            'nodes_executed': ['check_goal'],
            'updated_at': datetime.utcnow(),
        }
    
    @trace_node("mode4_synthesize")
    async def _synthesize_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Synthesize final response."""
        reasoning_steps = state.get('reasoning_steps', [])
        
        synthesis = f"Autonomous execution completed with {len(reasoning_steps)} steps.\n\n"
        for step in reasoning_steps[-3:]:  # Last 3 steps
            synthesis += f"- {step.get('response', '')[:200]}\n"
        
        return {
            'agent_response': synthesis,
            'response_confidence': 0.85,
            'autonomous_reasoning': {
                'total_steps': len(reasoning_steps),
                'mode': 'automatic_autonomous',
            },
            'nodes_executed': ['synthesize'],
            'updated_at': datetime.utcnow(),
        }
    
    # =========================================================================
    # ROUTING FUNCTIONS
    # =========================================================================
    
    def _route_budget_check(self, state: UnifiedWorkflowState) -> str:
        """Route based on budget check."""
        check = state.get('budget_check', {})
        return "proceed" if check.get('within_budget', True) else "exceeded"
    
    def _route_circuit_breaker(self, state: UnifiedWorkflowState) -> str:
        """Route based on circuit breaker."""
        return "break" if state.get('circuit_breaker_tripped', False) else "continue"
    
    def _route_goal_check(self, state: UnifiedWorkflowState) -> str:
        """Route based on goal check."""
        if state.get('goal_achieved', False):
            return "achieved"
        if state.get('goal_loop_iteration', 0) >= state.get('max_goal_iterations', 10):
            return "max_iterations"
        return "continue"
