"""
Mode 3: Autonomous-Automatic Workflow (Gold Standard)

One-shot autonomous reasoning with automatic agent selection.
Uses ReAct (Reasoning + Acting) pattern with Chain-of-Thought.

Frontend Mapping:
- isAutomatic: true (Automatic agent selection)
- isAutonomous: true (Autonomous reasoning)
- selectedAgents: [] (System selects)

Golden Rules Compliance:
✅ #1: LangGraph StateGraph
✅ #2: Caching integrated
✅ #3: Tenant isolation
✅ #4: RAG/Tools enforcement
✅ #5: Feedback & Memory integration

Features:
- One-shot query (no multi-turn conversation)
- Chain-of-Thought goal understanding
- Task decomposition and planning
- ReAct loop with configurable iterations
- Automatic agent selection per iteration
- Streaming of all reasoning steps
- Complete feedback/memory/enrichment pipeline

Usage:
    >>> workflow = Mode3AutonomousAutoWorkflow()
    >>> await workflow.initialize()
    >>> result = await workflow.execute(
    ...     tenant_id="550e8400-e29b-41d4-a716-446655440000",
    ...     query="Create comprehensive FDA IND submission plan",
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
from langgraph_workflows.tool_chain_mixin import ToolChainMixin  # NEW: Tool chaining via mixin
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
from langgraph_workflows.tool_chain_executor import ToolChainExecutor

# Services
from services.enhanced_agent_selector import EnhancedAgentSelector
from services.unified_rag_service import UnifiedRAGService
from services.feedback_manager import FeedbackManager
from services.agent_enrichment_service import AgentEnrichmentService
from services.cache_manager import CacheManager
from services.tool_registry import get_tool_registry
from services.autonomous_controller import AutonomousController  # Phase 3: Goal-based continuation
from tools.rag_tool import RAGTool
from tools.web_tools import WebSearchTool, WebScrapeTool

logger = structlog.get_logger()


class Mode3AutonomousAutoWorkflow(BaseWorkflow, ToolChainMixin):
    """
    Mode 3: Autonomous-Automatic Workflow (Gold Standard)
    
    One-shot autonomous reasoning with ReAct + CoT + Tool Chaining.
    
    Golden Rules Compliance:
    - ✅ #1: LangGraph StateGraph with ReAct loop + Tool chaining
    - ✅ #2: Caching at all steps
    - ✅ #3: Tenant isolation enforced
    - ✅ #4: RAG/Tools enforced in ReAct actions + Tool chains
    - ✅ #5: Feedback & learning integrated
    
    NEW: Refactored with ToolChainMixin (Phase 1.1 consistency)
    - Uses shared tool chain decision logic
    - Consistent implementation across all modes
    - DRY principle applied
    
    ReAct Loop:
    1. Thought: What to do next and why
    2. Action: Execute (RAG, Tool, or Answer)
    3. Observation: What was learned
    4. Reflection: Analyze iteration
    5. Reassess: Check if goal achieved
    6. Iterate or Synthesize
    """
    
    def __init__(
        self,
        supabase_client,
        cache_manager=None,
        agent_selector=None,
        rag_service=None,
        feedback_manager=None,
        enrichment_service=None,
        react_engine=None
    ):
        """Initialize Mode 3 workflow."""
        super().__init__(
            workflow_name="Mode3_Autonomous_Automatic",
            mode=WorkflowMode.MODE_1_MANUAL,  # Using enum
            enable_checkpoints=True
        )
        
        # Core services
        self.supabase = supabase_client
        self.cache_manager = cache_manager or CacheManager()
        self.agent_selector = agent_selector or EnhancedAgentSelector(
            supabase_client=supabase_client,
            cache_manager=self.cache_manager
        )
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
        
        # Tool chaining (Phase 1.1 refactor) - Use mixin for consistency
        self.init_tool_chaining(self.rag_service)
        
        # Autonomous controller (Phase 3: Goal-based continuation)
        self.autonomous_controller = None  # Created per execution with specific goals
        
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
        
        logger.info("✅ Mode3AutonomousAutoWorkflow initialized with tool chaining")
    
    def build_graph(self) -> StateGraph:
        """
        Build Mode 3 autonomous workflow with ReAct loop.
        
        Flow:
        1. Validate tenant
        2. Understand goal (CoT)
        3. Create task plan
        4. Initialize ReAct state
        5. ReAct Loop (configurable iterations):
           a. Generate thought
           b. Select agent for this iteration
           c. Execute action (RAG/Tool)
           d. Generate observation
           e. Generate reflection
           f. Reassess goal
           g. → Continue or Finish
        6. Synthesize final answer
        7. Feedback/Memory/Enrichment pipeline
        8. Format output
        
        Returns:
            Configured StateGraph
        """
        graph = StateGraph(UnifiedWorkflowState)
        
        # Core workflow nodes
        graph.add_node("validate_tenant", self.validate_tenant_node)
        graph.add_node("understand_goal", self.understand_goal_cot_node)
        graph.add_node("create_plan", self.create_task_plan_node)
        graph.add_node("initialize_react", self.initialize_react_state_node)
        
        # ReAct loop nodes
        graph.add_node("generate_thought", self.generate_thought_node)
        graph.add_node("select_agent_for_iteration", self.select_agent_for_iteration_node)
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
        graph.add_edge("validate_tenant", "understand_goal")
        graph.add_edge("understand_goal", "create_plan")
        graph.add_edge("create_plan", "initialize_react")
        graph.add_edge("initialize_react", "generate_thought")
        
        # ReAct loop
        graph.add_edge("generate_thought", "select_agent_for_iteration")
        graph.add_edge("select_agent_for_iteration", "execute_action")
        graph.add_edge("execute_action", "generate_observation")
        graph.add_edge("generate_observation", "generate_reflection")
        graph.add_edge("generate_reflection", "reassess_goal")
        
        # BRANCH: Continue ReAct loop or finish
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
    # MODE 3 SPECIFIC NODES
    # =========================================================================
    
    @trace_node("mode3_understand_goal_cot")
    async def understand_goal_cot_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Chain-of-Thought goal understanding.
        
        Uses ReAct Engine to deeply understand the goal.
        """
        query = state['query']
        model = state.get('model', 'gpt-4')
        
        logger.info("Understanding goal with CoT", query_preview=query[:100])
        
        try:
            goal_understanding = await self.react_engine.understand_goal(query, model)
            
            logger.info(
                "✅ Goal understood",
                complexity=goal_understanding.estimated_complexity,
                sub_goals=len(goal_understanding.sub_goals),
                confidence=goal_understanding.confidence
            )
            
            return {
                **state,
                'goal_understanding': goal_understanding.model_dump(),
                'understood_goal': goal_understanding.understood_goal,
                'sub_goals': goal_understanding.sub_goals,
                'success_criteria': goal_understanding.success_criteria,
                'current_node': 'understand_goal'
            }
            
        except Exception as e:
            logger.error("❌ Goal understanding failed", error=str(e))
            return {
                **state,
                'understood_goal': query,
                'sub_goals': [],
                'success_criteria': ["User confirms goal is met"],
                'errors': state.get('errors', []) + [f'Goal understanding failed: {str(e)}'],
                'current_node': 'understand_goal'
            }
    
    @trace_node("mode3_create_task_plan")
    async def create_task_plan_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Create task plan for goal achievement."""
        from langgraph_workflows.react_engine import GoalUnderstanding
        
        goal_understanding_dict = state.get('goal_understanding', {})
        goal_understanding = GoalUnderstanding(**goal_understanding_dict)
        model = state.get('model', 'gpt-4')
        
        logger.info("Creating task plan")
        
        try:
            task_plan = await self.react_engine.create_task_plan(goal_understanding, model)
            
            logger.info(
                "✅ Task plan created",
                tasks_count=len(task_plan.tasks),
                estimated_iterations=task_plan.estimated_iterations
            )
            
            return {
                **state,
                'task_plan': task_plan.tasks,
                'estimated_iterations': task_plan.estimated_iterations,
                'max_iterations': state.get('max_iterations', task_plan.estimated_iterations),
                'current_node': 'create_plan'
            }
            
        except Exception as e:
            logger.error("❌ Task planning failed", error=str(e))
            return {
                **state,
                'task_plan': ["Analyze", "Research", "Synthesize"],
                'estimated_iterations': 3,
                'max_iterations': state.get('max_iterations', 5),
                'errors': state.get('errors', []) + [f'Task planning failed: {str(e)}'],
                'current_node': 'create_plan'
            }
    
    @trace_node("mode3_initialize_react")
    async def initialize_react_state_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Initialize ReAct loop state + Autonomous Controller."""
        # Create autonomous controller for this execution
        from pydantic import UUID4
        goal = state.get('understood_goal', state['query'])
        session_id = state.get('session_id', f"mode3_{state['tenant_id']}_{datetime.now().timestamp()}")
        
        self.autonomous_controller = AutonomousController(
            session_id=session_id,
            tenant_id=UUID4(state['tenant_id']),
            goal=goal,
            supabase_client=self.supabase,
            cost_limit_usd=state.get('cost_limit_usd', 10.0),
            runtime_limit_minutes=state.get('runtime_limit_minutes', 30)
        )
        
        logger.info("✅ Autonomous controller initialized", session_id=session_id, goal_preview=goal[:50])
        
        return {
            **state,
            'current_iteration': 0,
            'iteration_history': [],
            'goal_achieved': False,
            'total_cost_usd': 0.0,
            'session_id': session_id,
            'current_node': 'initialize_react'
        }
    
    @trace_node("mode3_generate_thought")
    async def generate_thought_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Generate next thought in ReAct loop."""
        goal = state.get('understood_goal', state['query'])
        task_plan = state.get('task_plan', [])
        iteration_history = state.get('iteration_history', [])
        model = state.get('model', 'gpt-4')
        
        current_iteration = state.get('current_iteration', 0)
        logger.info(f"Generating thought (iteration {current_iteration + 1})")
        
        try:
            thought = await self.react_engine.generate_thought(
                goal=goal,
                task_plan=task_plan,
                iteration_history=iteration_history,
                model=model
            )
            
            logger.info(
                "✅ Thought generated",
                next_action=thought.next_action_type,
                preview=thought.thought[:100]
            )
            
            return {
                **state,
                'current_thought': thought.model_dump(),
                'current_iteration': current_iteration + 1,
                'current_node': 'generate_thought'
            }
            
        except Exception as e:
            logger.error("❌ Thought generation failed", error=str(e))
            return {
                **state,
                'current_thought': {
                    'thought': 'Retrieve information',
                    'reasoning': 'Fallback',
                    'next_action_type': 'rag'
                },
                'current_iteration': current_iteration + 1,
                'errors': state.get('errors', []) + [f'Thought generation failed: {str(e)}'],
                'current_node': 'generate_thought'
            }
    
    @trace_node("mode3_select_agent_for_iteration")
    async def select_agent_for_iteration_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Select best agent for current iteration (ML-powered)."""
        from services.enhanced_agent_selector import AgentSelectionRequest
        from pydantic import UUID4
        
        current_thought = state.get('current_thought', {})
        thought_text = current_thought.get('thought', state['query'])
        
        try:
            request = AgentSelectionRequest(
                query=thought_text,
                tenant_id=UUID4(state['tenant_id']),
                correlation_id=state.get('correlation_id'),
                max_candidates=5,
                enable_ml_selection=True
            )
            
            selected_agent = await self.agent_selector.select_agent(request)
            
            logger.info(
                "✅ Agent selected for iteration",
                agent_id=selected_agent.agent_id,
                score=selected_agent.score
            )
            
            return {
                **state,
                'selected_agents': state.get('selected_agents', []) + [selected_agent.agent_id],
                'current_agent': selected_agent.agent_id,
                'current_node': 'select_agent_for_iteration'
            }
            
        except Exception as e:
            logger.error("❌ Agent selection failed", error=str(e))
            return {
                **state,
                'current_agent': 'regulatory_expert',  # Fallback
                'errors': state.get('errors', []) + [f'Agent selection failed: {str(e)}'],
                'current_node': 'select_agent_for_iteration'
            }
    
    @trace_node("mode3_execute_action")
    async def execute_action_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Execute action based on thought.
        
        NEW: With Tool Chaining Support (AutoGPT capability)
        
        Golden Rule Compliance:
        ✅ #1: LangGraph node (Python only)
        ✅ #2: Caching integrated
        ✅ #3: Tenant-aware
        ✅ #4: RAG/Tools enforced (uses tool chain)
        
        Decides whether to use:
        - Tool chain (multi-step execution in ONE iteration)
        - Single action (RAG, Tool, or Answer)
        """
        from langgraph_workflows.react_engine import ThoughtOutput
        
        current_thought_dict = state.get('current_thought', {})
        thought = ThoughtOutput(**current_thought_dict)
        query = state['query']
        tenant_id = state['tenant_id']
        agent_id = state.get('current_agent', 'unknown')
        enable_rag = state.get('enable_rag', True)
        enable_tools = state.get('enable_tools', False)
        model = state.get('model', 'gpt-4')
        
        tools = state.get('selected_tools', []) if enable_tools else []
        
        logger.info(f"Executing action: {thought.next_action_type}")
        
        try:
            # Check if tool chain should be used (AutoGPT capability)
            if self.should_use_tool_chain_react(current_thought_dict, state):
                logger.info("🔗 Using tool chain for multi-step execution")
                
                # Execute tool chain
                chain_result = await self.tool_chain_executor.execute_tool_chain(
                    task=thought.thought,  # Use thought as task
                    tenant_id=str(tenant_id),
                    available_tools=['rag_search', 'web_search', 'web_scrape'],
                    context={
                        'agent_id': agent_id,
                        'rag_domains': state.get('selected_rag_domains', []),
                        'query': query
                    },
                    max_steps=3  # Limit steps per ReAct iteration
                )
                
                # Update cost tracking
                total_cost = state.get('total_cost_usd', 0.0) + chain_result.total_cost_usd
                
                logger.info(
                    "✅ Tool chain executed",
                    steps=chain_result.steps_executed,
                    cost=chain_result.total_cost_usd,
                    success=chain_result.success
                )
                
                # Return as action result
                from langgraph_workflows.react_engine import ActionResult
                action_result = ActionResult(
                    action_type='tool_chain',
                    action_description=f"Executed {chain_result.steps_executed}-step tool chain",
                    result=chain_result.synthesis,  # Use synthesized result
                    success=chain_result.success,
                    metadata={
                        'tool_chain': True,
                        'steps_executed': chain_result.steps_executed,
                        'step_results': [
                            {
                                'tool': sr.tool_name,
                                'success': sr.success
                            }
                            for sr in chain_result.step_results
                        ]
                    },
                    sources=[]  # Tool chain handles sources internally
                )
                
                return {
                    **state,
                    'current_action': action_result.model_dump(),
                    'total_cost_usd': total_cost,
                    'tool_chain_used': True,
                    'current_node': 'execute_action'
                }
            
            # Otherwise, use single action (existing ReAct logic)
            action_result = await self.react_engine.execute_action(
                thought=thought,
                query=query,
                tenant_id=tenant_id,
                agent_id=agent_id,
                available_tools=tools,
                enable_rag=enable_rag,
                model=model
            )
            
            logger.info(
                "✅ Action executed",
                action_type=action_result.action_type,
                success=action_result.success
            )
            
            # Track tool outputs for Golden Rule #4
            tool_outputs = state.get('tool_outputs', {})
            if action_result.action_type in ['rag', 'tool']:
                tool_outputs[action_result.action_type] = action_result.result
            
            return {
                **state,
                'current_action': action_result.model_dump(),
                'tool_outputs': tool_outputs,
                'tools_used': state.get('tools_used', []) + [action_result.action_type],
                'current_node': 'execute_action'
            }
            
        except Exception as e:
            logger.error("❌ Action execution failed", error=str(e))
            return {
                **state,
                'current_action': {
                    'action_type': 'none',
                    'success': False,
                    'error': str(e)
                },
                'errors': state.get('errors', []) + [f'Action execution failed: {str(e)}'],
                'current_node': 'execute_action'
            }
    
    @trace_node("mode3_generate_observation")
    async def generate_observation_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Generate observation from action result."""
        from langgraph_workflows.react_engine import ActionResult
        
        current_action_dict = state.get('current_action', {})
        action_result = ActionResult(**current_action_dict)
        model = state.get('model', 'gpt-4')
        
        logger.info("Generating observation")
        
        try:
            observation = await self.react_engine.generate_observation(action_result, model)
            
            logger.info("✅ Observation generated", preview=observation[:100])
            
            return {
                **state,
                'current_observation': observation,
                'current_node': 'generate_observation'
            }
            
        except Exception as e:
            logger.error("❌ Observation generation failed", error=str(e))
            return {
                **state,
                'current_observation': f"Observed: {action_result.action_description}",
                'errors': state.get('errors', []) + [f'Observation generation failed: {str(e)}'],
                'current_node': 'generate_observation'
            }
    
    @trace_node("mode3_generate_reflection")
    async def generate_reflection_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Reflect on thought-action-observation."""
        from langgraph_workflows.react_engine import ActionResult
        
        current_thought = state.get('current_thought', {})
        thought_text = current_thought.get('thought', '')
        
        current_action_dict = state.get('current_action', {})
        action_result = ActionResult(**current_action_dict)
        
        observation = state.get('current_observation', '')
        model = state.get('model', 'gpt-4')
        
        logger.info("Generating reflection")
        
        try:
            reflection = await self.react_engine.generate_reflection(
                thought=thought_text,
                action=action_result,
                observation=observation,
                model=model
            )
            
            logger.info("✅ Reflection generated", confidence=reflection.confidence)
            
            return {
                **state,
                'current_reflection': reflection.model_dump(),
                'current_node': 'generate_reflection'
            }
            
        except Exception as e:
            logger.error("❌ Reflection generation failed", error=str(e))
            return {
                **state,
                'current_reflection': {
                    'reflection': 'Iteration completed',
                    'confidence': 0.5
                },
                'errors': state.get('errors', []) + [f'Reflection generation failed: {str(e)}'],
                'current_node': 'generate_reflection'
            }
    
    @trace_node("mode3_reassess_goal")
    async def reassess_goal_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Reassess if goal has been achieved."""
        goal = state.get('understood_goal', state['query'])
        success_criteria = state.get('success_criteria', [])
        iteration_history = state.get('iteration_history', [])
        model = state.get('model', 'gpt-4')
        
        # Add current iteration to history
        current_iteration_data = {
            'thought': state.get('current_thought', {}).get('thought', ''),
            'action_description': state.get('current_action', {}).get('action_description', ''),
            'observation': state.get('current_observation', ''),
            'reflection': state.get('current_reflection', {}).get('reflection', '')
        }
        iteration_history = iteration_history + [current_iteration_data]
        
        logger.info("Reassessing goal")
        
        try:
            assessment = await self.react_engine.reassess_goal(
                goal=goal,
                success_criteria=success_criteria,
                iteration_history=iteration_history,
                model=model
            )
            
            logger.info(
                "✅ Goal reassessed",
                achieved=assessment.achieved,
                confidence=assessment.confidence
            )
            
            return {
                **state,
                'goal_achieved': assessment.achieved,
                'goal_assessment': assessment.model_dump(),
                'iteration_history': iteration_history,
                'current_node': 'reassess_goal'
            }
            
        except Exception as e:
            logger.error("❌ Goal reassessment failed", error=str(e))
            return {
                **state,
                'goal_achieved': False,
                'iteration_history': iteration_history,
                'errors': state.get('errors', []) + [f'Goal reassessment failed: {str(e)}'],
                'current_node': 'reassess_goal'
            }
    
    @trace_node("mode3_synthesize_answer")
    async def synthesize_final_answer_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Node: Synthesize final answer from all iterations."""
        goal = state.get('understood_goal', state['query'])
        iteration_history = state.get('iteration_history', [])
        model = state.get('model', 'gpt-4')
        
        logger.info("Synthesizing final answer", iterations=len(iteration_history))
        
        try:
            # Format iteration history for synthesis
            history_text = "\n\n".join([
                f"Iteration {i+1}:\n"
                f"Thought: {it.get('thought', 'N/A')}\n"
                f"Action: {it.get('action_description', 'N/A')}\n"
                f"Observation: {it.get('observation', 'N/A')}\n"
                f"Reflection: {it.get('reflection', 'N/A')}"
                for i, it in enumerate(iteration_history)
            ])
            
            # Synthesize using LLM
            from openai import OpenAI
            openai_client = OpenAI(api_key=settings.openai_api_key)
            
            response = await openai_client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert synthesizer. Create comprehensive final answers from iterative reasoning."
                    },
                    {
                        "role": "user",
                        "content": f"""GOAL: {goal}

REASONING ITERATIONS:
{history_text}

Synthesize a comprehensive, well-structured final answer that addresses the goal."""
                    }
                ],
                temperature=0.3,
                max_tokens=2000,
                timeout=30.0
            )
            
            final_answer = response.choices[0].message.content.strip()
            
            logger.info("✅ Final answer synthesized", length=len(final_answer))
            
            return {
                **state,
                'agent_response': final_answer,
                'synthesis_complete': True,
                'current_node': 'synthesize_answer'
            }
            
        except Exception as e:
            logger.error("❌ Answer synthesis failed", error=str(e))
            return {
                **state,
                'agent_response': f"Based on analysis: {iteration_history[-1].get('observation', 'No conclusion') if iteration_history else 'Unable to synthesize'}",
                'synthesis_complete': False,
                'errors': state.get('errors', []) + [f'Synthesis failed: {str(e)}'],
                'current_node': 'synthesize_answer'
            }
    
    async def format_output_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Format final output."""
        return {
            **state,
            'response': state.get('agent_response', ''),
            'confidence': state.get('response_confidence', 0.0),
            'status': ExecutionStatus.COMPLETED,
            'iterations_used': state.get('current_iteration', 0),
            'goal_achieved': state.get('goal_achieved', False),
            'feedback_data': state.get('feedback_collection_data', {}),
            'current_node': 'format_output'
        }
    
    # =========================================================================
    # CONDITIONAL EDGE FUNCTIONS
    # =========================================================================
    
    async def should_continue_react(self, state: UnifiedWorkflowState) -> str:
        """
        Determine if ReAct loop should continue.
        
        Phase 3: Uses AutonomousController for intelligent goal-based decisions
        instead of hard max_iterations limit.
        """
        # Quick check: goal already achieved
        if state.get('goal_achieved'):
            logger.info("✅ Goal achieved, stopping ReAct loop")
            return "achieved"
        
        if not self.autonomous_controller:
            logger.warning("No autonomous controller, falling back to iteration limit")
            # Fallback to old logic if controller not initialized
            current_iter = state.get('current_iteration', 0)
            max_iter = state.get('max_iterations', 5)
            if current_iter >= max_iter:
                return "max_iterations"
            return "iterate"
        
        # Get current state
        current_iter = state.get('current_iteration', 0)
        current_cost = state.get('total_cost_usd', 0.0)
        goal_progress = self._calculate_goal_progress(state)
        
        # Ask controller for decision
        decision = await self.autonomous_controller.should_continue(
            current_cost_usd=current_cost,
            goal_progress=goal_progress,
            iteration_count=current_iter,
            error_occurred=len(state.get('errors', [])) > 0
        )
        
        logger.info(
            f"Autonomous decision: {'CONTINUE' if decision.should_continue else 'STOP'}",
            reason=decision.reason,
            progress=f"{decision.goal_progress:.0%}",
            cost=f"${current_cost:.2f}",
            remaining_budget=f"${decision.remaining_budget_usd:.2f}",
            remaining_time=f"{decision.remaining_minutes:.1f}min"
        )
        
        # Map decision to routing
        if decision.should_continue:
            return "iterate"
        elif decision.reason == "GOAL_ACHIEVED":
            return "achieved"
        else:
            # Any stop reason other than goal achievement
            return "max_iterations"  # Reuse this path for synthesis
    
    def _calculate_goal_progress(self, state: UnifiedWorkflowState) -> float:
        """
        Calculate goal progress based on ReAct history and observations.
        
        Heuristic based on:
        - Goal reassessment scores
        - Quality of observations
        - Completeness of task plan
        """
        # Check if we have explicit progress from reassessment
        goal_assessment = state.get('goal_assessment', {})
        if goal_assessment:
            return goal_assessment.get('progress', 0.0)
        
        # Heuristic: estimate from iteration history
        iteration_history = state.get('iteration_history', [])
        if not iteration_history:
            return 0.0
        
        # Simple heuristic: progress based on successful iterations
        total_iterations = len(iteration_history)
        task_plan = state.get('task_plan', [])
        expected_iterations = len(task_plan) if task_plan else 5
        
        # Cap progress at 0.9 unless explicitly achieved
        progress = min(0.9, total_iterations / expected_iterations)
        
        return progress

