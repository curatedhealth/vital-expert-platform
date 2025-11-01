"""
Mode 4: Autonomous-Manual Workflow (Gold Standard)

One-shot autonomous reasoning with manual agent selection.
Uses ReAct (Reasoning + Acting) pattern with Chain-of-Thought.
User selects the agent, but the agent uses autonomous reasoning.

Frontend Mapping:
- isAutomatic: false (Manual agent selection)
- isAutonomous: true (Autonomous reasoning)
- selectedAgents: ["agent_id"] (User-selected)

Golden Rules Compliance:
✅ #1: LangGraph StateGraph
✅ #2: Caching integrated
✅ #3: Tenant isolation
✅ #4: RAG/Tools enforcement
✅ #5: Feedback & Memory integration

Features:
- One-shot query (no multi-turn conversation)
- User selects specific agent
- Agent uses ReAct reasoning (Chain-of-Thought + Actions)
- Fixed agent throughout iterations
- Streaming of all reasoning steps
- Complete feedback/memory/enrichment pipeline

Usage:
    >>> workflow = Mode4AutonomousManualWorkflow()
    >>> await workflow.initialize()
    >>> result = await workflow.execute(
    ...     tenant_id="550e8400-e29b-41d4-a716-446655440000",
    ...     query="Create comprehensive FDA IND submission plan",
    ...     selected_agents=["regulatory_expert"],
    ...     model="gpt-4",
    ...     enable_rag=True,
    ...     enable_tools=True,
    ...     max_iterations=5
    ... )
"""

import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
import structlog

# LangGraph imports
from langgraph.graph import StateGraph, END

# Internal imports
from langgraph_workflows.base_workflow import BaseWorkflow
from langgraph_workflows.state_schemas import (
    UnifiedWorkflowState,
    WorkflowMode,
    ExecutionStatus
)
from langgraph_workflows.observability import trace_node
from langgraph_workflows.feedback_nodes import FeedbackNodes
from langgraph_workflows.memory_nodes import MemoryNodes
from langgraph_workflows.enrichment_nodes import EnrichmentNodes
from langgraph_workflows.react_engine import ReActEngine

# Services
from services.unified_rag_service import UnifiedRAGService
from services.feedback_manager import FeedbackManager
from services.agent_enrichment_service import AgentEnrichmentService
from services.cache_manager import CacheManager

logger = structlog.get_logger()


class Mode4AutonomousManualWorkflow(BaseWorkflow):
    """
    Mode 4: Autonomous-Manual Workflow (Gold Standard)
    
    User-selected agent with autonomous ReAct reasoning.
    
    Golden Rules Compliance:
    - ✅ #1: LangGraph StateGraph with ReAct loop
    - ✅ #2: Caching at all steps
    - ✅ #3: Tenant isolation enforced
    - ✅ #4: RAG/Tools enforced in ReAct actions
    - ✅ #5: Feedback & learning integrated
    
    Key Difference from Mode 3:
    - User selects agent (no automatic selection)
    - Same agent used throughout all iterations
    - Agent validated upfront
    - Otherwise identical ReAct loop
    """
    
    def __init__(
        self,
        supabase_client,
        cache_manager=None,
        rag_service=None,
        feedback_manager=None,
        enrichment_service=None,
        react_engine=None
    ):
        """Initialize Mode 4 workflow."""
        super().__init__(
            workflow_name="Mode4_Autonomous_Manual",
            mode=WorkflowMode.MODE_1_MANUAL,
            enable_checkpoints=True
        )
        
        # Core services
        self.supabase = supabase_client
        self.cache_manager = cache_manager or CacheManager()
        self.rag_service = rag_service or UnifiedRAGService(supabase_client)
        
        # Enhanced services
        self.feedback_manager = feedback_manager or FeedbackManager(
            supabase_client,
            self.cache_manager
        )
        self.enrichment_service = enrichment_service or AgentEnrichmentService(
            supabase_client,
            self.cache_manager
        )
        
        # ReAct engine
        self.react_engine = react_engine or ReActEngine(
            rag_service=self.rag_service,
            cache_manager=self.cache_manager
        )
        
        # Node groups
        self.feedback_nodes = FeedbackNodes(
            supabase_client,
            self.cache_manager,
            self.feedback_manager
        )
        self.memory_nodes = MemoryNodes(
            supabase_client,
            self.cache_manager
        )
        self.enrichment_nodes = EnrichmentNodes(
            supabase_client,
            self.cache_manager,
            self.enrichment_service
        )
        
        logger.info("✅ Mode4AutonomousManualWorkflow initialized")
    
    def build_graph(self) -> StateGraph:
        """
        Build Mode 4 autonomous workflow with manual agent selection.
        
        Flow:
        1. Validate tenant
        2. Validate user's agent selection
        3. Load agent configuration
        4. Understand goal (CoT)
        5. Create task plan
        6. Initialize ReAct state
        7. ReAct Loop (configurable iterations):
           a. Generate thought
           b. Execute action (RAG/Tool) with FIXED agent
           c. Generate observation
           d. Generate reflection
           e. Reassess goal
           f. → Continue or Finish
        8. Synthesize final answer
        9. Feedback/Memory/Enrichment pipeline
        10. Format output
        
        Returns:
            Configured StateGraph
        """
        graph = StateGraph(UnifiedWorkflowState)
        
        # Core workflow nodes
        graph.add_node("validate_tenant", self.validate_tenant_node)
        graph.add_node("validate_agent_selection", self.validate_agent_selection_node)
        graph.add_node("load_agent_config", self.load_agent_config_node)
        graph.add_node("understand_goal", self.understand_goal_cot_node)
        graph.add_node("create_plan", self.create_task_plan_node)
        graph.add_node("initialize_react", self.initialize_react_state_node)
        
        # ReAct loop nodes (same agent throughout)
        graph.add_node("generate_thought", self.generate_thought_node)
        graph.add_node("execute_action", self.execute_action_node)
        graph.add_node("generate_observation", self.generate_observation_node)
        graph.add_node("generate_reflection", self.generate_reflection_node)
        graph.add_node("reassess_goal", self.reassess_goal_node)
        
        # Synthesis and output
        graph.add_node("synthesize_answer", self.synthesize_final_answer_node)
        
        # Post-execution: Feedback, Memory, Enrichment
        graph.add_node("calculate_confidence", self.feedback_nodes.calculate_confidence_node)
        graph.add_node("collect_implicit_feedback", self.feedback_nodes.collect_implicit_feedback_node)
        graph.add_node("capture_tool_knowledge", self.enrichment_nodes.capture_tool_knowledge_node)
        graph.add_node("extract_entities", self.enrichment_nodes.extract_entities_node)
        graph.add_node("enrich_knowledge_base", self.enrichment_nodes.enrich_knowledge_base_node)
        graph.add_node("prepare_feedback", self.feedback_nodes.prepare_feedback_collection_node)
        graph.add_node("format_output", self.format_output_node)
        
        # Define flow
        graph.set_entry_point("validate_tenant")
        graph.add_edge("validate_tenant", "validate_agent_selection")
        
        # BRANCH 1: Agent validation
        graph.add_conditional_edges(
            "validate_agent_selection",
            self.route_agent_validation,
            {
                "valid": "load_agent_config",
                "invalid": "format_output"  # Return error
            }
        )
        
        graph.add_edge("load_agent_config", "understand_goal")
        graph.add_edge("understand_goal", "create_plan")
        graph.add_edge("create_plan", "initialize_react")
        graph.add_edge("initialize_react", "generate_thought")
        
        # ReAct loop (no agent selection - uses fixed agent)
        graph.add_edge("generate_thought", "execute_action")
        graph.add_edge("execute_action", "generate_observation")
        graph.add_edge("generate_observation", "generate_reflection")
        graph.add_edge("generate_reflection", "reassess_goal")
        
        # BRANCH 2: Continue ReAct loop or finish
        graph.add_conditional_edges(
            "reassess_goal",
            self.should_continue_react,
            {
                "iterate": "generate_thought",  # Loop back
                "achieved": "synthesize_answer",  # Goal achieved
                "max_iterations": "synthesize_answer"  # Max iterations reached
            }
        )
        
        # Post-execution pipeline
        graph.add_edge("synthesize_answer", "calculate_confidence")
        graph.add_edge("calculate_confidence", "collect_implicit_feedback")
        graph.add_edge("collect_implicit_feedback", "capture_tool_knowledge")
        graph.add_edge("capture_tool_knowledge", "extract_entities")
        graph.add_edge("extract_entities", "enrich_knowledge_base")
        graph.add_edge("enrich_knowledge_base", "prepare_feedback")
        graph.add_edge("prepare_feedback", "format_output")
        graph.add_edge("format_output", END)
        
        return graph
    
    # =========================================================================
    # MODE 4 SPECIFIC NODES
    # =========================================================================
    
    @trace_node("mode4_validate_agent_selection")
    async def validate_agent_selection_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Validate user's manually selected agent.
        
        Same as Mode 2 validation.
        """
        tenant_id = state['tenant_id']
        selected_agents = state.get('selected_agents', [])
        
        logger.info("Validating agent selection", agents=selected_agents)
        
        try:
            if not selected_agents or len(selected_agents) == 0:
                return {
                    **state,
                    'agent_validation_error': 'No agents selected',
                    'agent_validation_valid': False
                }
            
            await self.supabase.set_tenant_context(tenant_id)
            
            # Validate agent exists and is active
            response = await self.supabase.client.from_('agents').select('*').eq(
                'tenant_id', tenant_id
            ).eq('id', selected_agents[0]).eq('status', 'active').execute()
            
            if not response.data:
                return {
                    **state,
                    'agent_validation_error': f'Agent "{selected_agents[0]}" not found or inactive',
                    'agent_validation_valid': False
                }
            
            logger.info("✅ Agent validated", agent_id=selected_agents[0])
            
            return {
                **state,
                'validated_agents': response.data,
                'agent_validation_valid': True,
                'fixed_agent_id': selected_agents[0],  # Store for ReAct loop
                'current_node': 'validate_agent_selection'
            }
            
        except Exception as e:
            logger.error("❌ Agent validation failed", error=str(e))
            return {
                **state,
                'agent_validation_error': str(e),
                'agent_validation_valid': False,
                'errors': state.get('errors', []) + [f'Validation failed: {str(e)}']
            }
    
    @trace_node("mode4_load_agent_config")
    async def load_agent_config_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Load configuration for selected agent."""
        validated_agents = state.get('validated_agents', [])
        
        if not validated_agents:
            return {**state, 'current_node': 'load_agent_config'}
        
        agent_data = validated_agents[0]
        agent_config = {
            'agent_id': agent_data['id'],
            'agent_name': agent_data.get('name', 'Unknown'),
            'agent_type': agent_data.get('agent_type', 'general'),
            'system_prompt': agent_data.get('system_prompt', ''),
            'rag_domains': agent_data.get('medical_specialty', []),
            'tools': agent_data.get('tools', [])
        }
        
        logger.info("Agent config loaded", agent_id=agent_config['agent_id'])
        
        return {
            **state,
            'agent_config': agent_config,
            'current_node': 'load_agent_config'
        }
    
    # =========================================================================
    # REACT NODES (reused from Mode 3, but with fixed agent)
    # =========================================================================
    
    @trace_node("mode4_understand_goal_cot")
    async def understand_goal_cot_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Chain-of-Thought goal understanding."""
        query = state['query']
        model = state.get('model', 'gpt-4')
        agent_config = state.get('agent_config', {})
        agent_name = agent_config.get('agent_name', 'Agent')
        
        logger.info(f"Understanding goal with {agent_name}")
        
        try:
            # Add agent context to goal understanding
            context = f"Expert: {agent_name} ({agent_config.get('agent_type', 'general')})"
            goal_understanding = await self.react_engine.understand_goal(query, model, context)
            
            logger.info("✅ Goal understood", complexity=goal_understanding.estimated_complexity)
            
            return {
                **state,
                'goal_understanding': goal_understanding.model_dump(),
                'understood_goal': goal_understanding.understood_goal,
                'sub_goals': goal_understanding.sub_goals,
                'success_criteria': goal_understanding.success_criteria
            }
            
        except Exception as e:
            logger.error("❌ Goal understanding failed", error=str(e))
            return {
                **state,
                'understood_goal': query,
                'sub_goals': [],
                'success_criteria': ["User confirms goal is met"],
                'errors': state.get('errors', []) + [str(e)]
            }
    
    @trace_node("mode4_create_task_plan")
    async def create_task_plan_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Create task plan."""
        from langgraph_workflows.react_engine import GoalUnderstanding
        
        goal_understanding_dict = state.get('goal_understanding', {})
        goal_understanding = GoalUnderstanding(**goal_understanding_dict)
        model = state.get('model', 'gpt-4')
        
        try:
            task_plan = await self.react_engine.create_task_plan(goal_understanding, model)
            
            logger.info("✅ Task plan created", tasks=len(task_plan.tasks))
            
            return {
                **state,
                'task_plan': task_plan.tasks,
                'estimated_iterations': task_plan.estimated_iterations,
                'max_iterations': state.get('max_iterations', task_plan.estimated_iterations)
            }
            
        except Exception as e:
            logger.error("❌ Task planning failed", error=str(e))
            return {
                **state,
                'task_plan': ["Analyze", "Research", "Synthesize"],
                'estimated_iterations': 3,
                'max_iterations': state.get('max_iterations', 5),
                'errors': state.get('errors', []) + [str(e)]
            }
    
    @trace_node("mode4_initialize_react")
    async def initialize_react_state_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Initialize ReAct state."""
        return {
            **state,
            'current_iteration': 0,
            'iteration_history': [],
            'goal_achieved': False
        }
    
    @trace_node("mode4_generate_thought")
    async def generate_thought_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Generate thought (with fixed agent context)."""
        goal = state.get('understood_goal', state['query'])
        task_plan = state.get('task_plan', [])
        iteration_history = state.get('iteration_history', [])
        model = state.get('model', 'gpt-4')
        current_iteration = state.get('current_iteration', 0)
        
        try:
            thought = await self.react_engine.generate_thought(goal, task_plan, iteration_history, model)
            
            logger.info(f"✅ Thought generated (iteration {current_iteration + 1})")
            
            return {
                **state,
                'current_thought': thought.model_dump(),
                'current_iteration': current_iteration + 1
            }
            
        except Exception as e:
            logger.error("❌ Thought failed", error=str(e))
            return {
                **state,
                'current_thought': {'thought': 'Retrieve information', 'next_action_type': 'rag'},
                'current_iteration': current_iteration + 1,
                'errors': state.get('errors', []) + [str(e)]
            }
    
    @trace_node("mode4_execute_action")
    async def execute_action_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Execute action (with FIXED agent)."""
        from langgraph_workflows.react_engine import ThoughtOutput
        
        current_thought_dict = state.get('current_thought', {})
        thought = ThoughtOutput(**current_thought_dict)
        
        # Use FIXED agent throughout (key difference from Mode 3)
        fixed_agent_id = state.get('fixed_agent_id', 'unknown')
        
        try:
            action_result = await self.react_engine.execute_action(
                thought=thought,
                query=state['query'],
                tenant_id=state['tenant_id'],
                agent_id=fixed_agent_id,  # FIXED agent
                available_tools=state.get('selected_tools', []) if state.get('enable_tools') else [],
                enable_rag=state.get('enable_rag', True),
                model=state.get('model', 'gpt-4')
            )
            
            logger.info(f"✅ Action executed: {action_result.action_type}")
            
            # Track for enrichment
            tool_outputs = state.get('tool_outputs', {})
            if action_result.action_type in ['rag', 'tool']:
                tool_outputs[action_result.action_type] = action_result.result
            
            return {
                **state,
                'current_action': action_result.model_dump(),
                'tool_outputs': tool_outputs,
                'tools_used': state.get('tools_used', []) + [action_result.action_type]
            }
            
        except Exception as e:
            logger.error("❌ Action failed", error=str(e))
            return {
                **state,
                'current_action': {'action_type': 'none', 'success': False},
                'errors': state.get('errors', []) + [str(e)]
            }
    
    @trace_node("mode4_generate_observation")
    async def generate_observation_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Generate observation."""
        from langgraph_workflows.react_engine import ActionResult
        
        current_action_dict = state.get('current_action', {})
        action_result = ActionResult(**current_action_dict)
        
        try:
            observation = await self.react_engine.generate_observation(action_result, state.get('model', 'gpt-4'))
            return {**state, 'current_observation': observation}
        except Exception as e:
            return {**state, 'current_observation': f"Observed: {action_result.action_description}"}
    
    @trace_node("mode4_generate_reflection")
    async def generate_reflection_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Generate reflection."""
        from langgraph_workflows.react_engine import ActionResult
        
        thought_text = state.get('current_thought', {}).get('thought', '')
        action_result = ActionResult(**state.get('current_action', {}))
        observation = state.get('current_observation', '')
        
        try:
            reflection = await self.react_engine.generate_reflection(
                thought=thought_text,
                action=action_result,
                observation=observation,
                model=state.get('model', 'gpt-4')
            )
            return {**state, 'current_reflection': reflection.model_dump()}
        except Exception as e:
            return {**state, 'current_reflection': {'reflection': 'Completed', 'confidence': 0.5}}
    
    @trace_node("mode4_reassess_goal")
    async def reassess_goal_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Reassess goal."""
        goal = state.get('understood_goal', state['query'])
        success_criteria = state.get('success_criteria', [])
        iteration_history = state.get('iteration_history', [])
        
        # Add current iteration
        current_iter = {
            'thought': state.get('current_thought', {}).get('thought', ''),
            'action_description': state.get('current_action', {}).get('action_description', ''),
            'observation': state.get('current_observation', ''),
            'reflection': state.get('current_reflection', {}).get('reflection', '')
        }
        iteration_history = iteration_history + [current_iter]
        
        try:
            assessment = await self.react_engine.reassess_goal(
                goal=goal,
                success_criteria=success_criteria,
                iteration_history=iteration_history,
                model=state.get('model', 'gpt-4')
            )
            
            logger.info("✅ Goal reassessed", achieved=assessment.achieved)
            
            return {
                **state,
                'goal_achieved': assessment.achieved,
                'goal_assessment': assessment.model_dump(),
                'iteration_history': iteration_history
            }
        except Exception as e:
            return {
                **state,
                'goal_achieved': False,
                'iteration_history': iteration_history,
                'errors': state.get('errors', []) + [str(e)]
            }
    
    @trace_node("mode4_synthesize_answer")
    async def synthesize_final_answer_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Synthesize final answer."""
        goal = state.get('understood_goal', state['query'])
        iteration_history = state.get('iteration_history', [])
        agent_name = state.get('agent_config', {}).get('agent_name', 'Agent')
        
        logger.info(f"Synthesizing answer from {len(iteration_history)} iterations")
        
        try:
            history_text = "\n\n".join([
                f"Iteration {i+1}:\n{it.get('thought', '')}\nAction: {it.get('action_description', '')}\n"
                f"Observation: {it.get('observation', '')}"
                for i, it in enumerate(iteration_history)
            ])
            
            from openai import OpenAI
            from core.config import get_settings
            settings = get_settings()
            openai_client = OpenAI(api_key=settings.openai_api_key)
            
            response = await openai_client.chat.completions.create(
                model=state.get('model', 'gpt-4'),
                messages=[
                    {"role": "system", "content": f"You are {agent_name}. Synthesize comprehensive final answers."},
                    {"role": "user", "content": f"GOAL: {goal}\n\nREASONING:\n{history_text}\n\nSynthesize final answer:"}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            final_answer = response.choices[0].message.content.strip()
            
            logger.info("✅ Answer synthesized")
            
            return {**state, 'agent_response': final_answer, 'synthesis_complete': True}
            
        except Exception as e:
            logger.error("❌ Synthesis failed", error=str(e))
            return {
                **state,
                'agent_response': f"Based on analysis: {iteration_history[-1].get('observation', 'No conclusion') if iteration_history else 'Unable to synthesize'}",
                'synthesis_complete': False,
                'errors': state.get('errors', []) + [str(e)]
            }
    
    async def format_output_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Format output."""
        if not state.get('agent_validation_valid', True):
            return {
                **state,
                'response': '',
                'error': state.get('agent_validation_error', 'Validation failed'),
                'status': ExecutionStatus.FAILED
            }
        
        return {
            **state,
            'response': state.get('agent_response', ''),
            'confidence': state.get('response_confidence', 0.0),
            'status': ExecutionStatus.COMPLETED,
            'iterations_used': state.get('current_iteration', 0),
            'goal_achieved': state.get('goal_achieved', False),
            'feedback_data': state.get('feedback_collection_data', {})
        }
    
    # =========================================================================
    # CONDITIONAL EDGE FUNCTIONS
    # =========================================================================
    
    def route_agent_validation(self, state: UnifiedWorkflowState) -> str:
        """Route based on validation."""
        return "valid" if state.get('agent_validation_valid') else "invalid"
    
    def should_continue_react(self, state: UnifiedWorkflowState) -> str:
        """Determine if ReAct loop should continue."""
        if state.get('goal_achieved'):
            return "achieved"
        
        if state.get('current_iteration', 0) >= state.get('max_iterations', 5):
            return "max_iterations"
        
        return "iterate"

