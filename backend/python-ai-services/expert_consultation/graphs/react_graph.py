from typing import Dict, Any, List
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.tools import Tool
from datetime import datetime
import uuid
import asyncio

from state import (
    AutonomousAgentState, 
    ReasoningStep, 
    add_reasoning_step,
    update_working_memory,
    add_evidence,
    update_goal_progress,
    should_continue_execution
)

class EnhancedReActGraph:
    """Enhanced ReAct pattern with full transparency and streaming"""
    
    def __init__(self, llm, tool_registry, strategic_selector, streamer):
        self.llm = llm
        self.tool_registry = tool_registry
        self.strategic_selector = strategic_selector
        self.streamer = streamer
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the ReAct graph with all nodes"""
        workflow = StateGraph(AutonomousAgentState)
        
        # Add nodes
        workflow.add_node("think", self.think_node)
        workflow.add_node("plan", self.plan_node)
        workflow.add_node("act", self.act_node)
        workflow.add_node("execute_tools", self.execute_tools_node)
        workflow.add_node("observe", self.observe_node)
        workflow.add_node("reflect", self.reflect_node)
        workflow.add_node("synthesize", self.synthesize_node)
        workflow.add_node("check_continuation", self.check_continuation_node)
        
        # Define edges
        workflow.set_entry_point("think")
        
        workflow.add_edge("think", "plan")
        workflow.add_edge("plan", "act")
        workflow.add_edge("act", "execute_tools")
        workflow.add_edge("execute_tools", "observe")
        workflow.add_edge("observe", "reflect")
        workflow.add_edge("reflect", "check_continuation")
        
        # Conditional edges from check_continuation
        workflow.add_conditional_edges(
            "check_continuation",
            self.should_continue,
            {
                "continue": "think",
                "synthesize": "synthesize",
                "end": END
            }
        )
        
        workflow.add_edge("synthesize", END)
        
        return workflow.compile()
    
    async def think_node(self, state: AutonomousAgentState) -> Dict[str, Any]:
        """Think: Analyze the situation and current state"""
        step_id = str(uuid.uuid4())
        
        # Create thinking prompt
        thinking_prompt = f"""
        You are an expert consultant analyzing a complex query.
        
        Current Query: {state['original_query']}
        Expert Type: {state['expert_type']}
        Business Context: {state['business_context']}
        Current Iteration: {state['current_iteration']}
        Previous Steps: {len(state['reasoning_steps'])}
        
        Working Memory:
        {state['working_memory']}
        
        Evidence Chain:
        {state['evidence_chain']}
        
        Think through:
        1. What is the core question being asked?
        2. What information do we already have?
        3. What additional information do we need?
        4. What are the key considerations and constraints?
        5. What domains of knowledge are most relevant?
        
        Provide your analysis in a structured format.
        """
        
        # Get LLM response
        response = await self.llm.ainvoke(thinking_prompt)
        
        # Create reasoning step
        reasoning_step = ReasoningStep(
            id=step_id,
            timestamp=datetime.now(),
            iteration=state['current_iteration'],
            phase="think",
            content={
                "analysis": response.content if hasattr(response, 'content') else str(response),
                "query_analysis": {
                    "core_question": "Extracted from analysis",
                    "information_gaps": "Identified gaps",
                    "key_considerations": "Key factors"
                }
            },
            metadata={
                "cost": 0.001,  # Mock cost
                "tokens": 150,  # Mock token count
                "confidence": 0.8
            }
        )
        
        # Update state
        state = add_reasoning_step(state, reasoning_step)
        state = update_working_memory(state, "current_analysis", reasoning_step["content"])
        state["current_phase"] = "think"
        
        # Stream the step
        await self.streamer.stream_reasoning_step(state['session_id'], reasoning_step)
        
        return state
    
    async def plan_node(self, state: AutonomousAgentState) -> Dict[str, Any]:
        """Plan: Create action plan based on thinking"""
        step_id = str(uuid.uuid4())
        
        # Get current analysis from working memory
        current_analysis = state['working_memory'].get('current_analysis', {})
        
        # Create planning prompt
        planning_prompt = f"""
        Based on your analysis, create a detailed action plan.
        
        Analysis: {current_analysis}
        Available Tools: {list(self.tool_registry.tools.keys())}
        
        Create a plan that:
        1. Identifies specific actions to take
        2. Selects appropriate tools for each action
        3. Defines success criteria
        4. Considers potential challenges
        5. Prioritizes actions by importance
        
        Format as a structured plan with clear steps.
        """
        
        # Get LLM response
        response = await self.llm.ainvoke(planning_prompt)
        
        # Create reasoning step
        reasoning_step = ReasoningStep(
            id=step_id,
            timestamp=datetime.now(),
            iteration=state['current_iteration'],
            phase="plan",
            content={
                "action_plan": response.content if hasattr(response, 'content') else str(response),
                "planned_actions": [
                    "Action 1: Research regulatory requirements",
                    "Action 2: Analyze clinical data",
                    "Action 3: Review market landscape"
                ],
                "success_criteria": [
                    "Comprehensive regulatory overview",
                    "Clinical evidence summary",
                    "Market analysis"
                ]
            },
            metadata={
                "cost": 0.001,
                "tokens": 120,
                "confidence": 0.85
            }
        )
        
        # Update state
        state = add_reasoning_step(state, reasoning_step)
        state = update_working_memory(state, "action_plan", reasoning_step["content"])
        state["current_phase"] = "plan"
        
        # Stream the step
        await self.streamer.stream_reasoning_step(state['session_id'], reasoning_step)
        
        return state
    
    async def act_node(self, state: AutonomousAgentState) -> Dict[str, Any]:
        """Act: Select tools and prepare for execution"""
        step_id = str(uuid.uuid4())
        
        # Get action plan
        action_plan = state['working_memory'].get('action_plan', {})
        
        # Use strategic selector to choose tools
        detected_domains = await self.strategic_selector.rag.get_domain_recommendations(
            state['original_query'], max_domains=3
        )
        
        selected_tools = await self.strategic_selector.select_optimal_tools(
            state['original_query'],
            detected_domains,
            max_tools=5
        )
        
        # Create reasoning step
        reasoning_step = ReasoningStep(
            id=step_id,
            timestamp=datetime.now(),
            iteration=state['current_iteration'],
            phase="act",
            content={
                "selected_tools": selected_tools,
                "detected_domains": detected_domains,
                "tool_rationale": f"Selected tools based on query analysis and domain detection",
                "execution_plan": {
                    "parallel_execution": True,
                    "tool_sequence": selected_tools,
                    "expected_outcomes": "Comprehensive research results"
                }
            },
            metadata={
                "cost": 0.0005,
                "tokens": 80,
                "confidence": 0.9
            }
        )
        
        # Update state
        state = add_reasoning_step(state, reasoning_step)
        state["available_tools"] = selected_tools
        state["current_phase"] = "act"
        
        # Stream the step
        await self.streamer.stream_reasoning_step(state['session_id'], reasoning_step)
        
        return state
    
    async def execute_tools_node(self, state: AutonomousAgentState) -> Dict[str, Any]:
        """Execute selected tools"""
        step_id = str(uuid.uuid4())
        
        tool_results = []
        tool_calls = []
        
        # Execute tools in parallel
        tasks = []
        for tool_name in state['available_tools']:
            tool = self.tool_registry.get_tool(tool_name)
            if tool:
                task = self._execute_single_tool(tool, state['original_query'])
                tasks.append((tool_name, task))
        
        # Wait for all tools to complete
        results = await asyncio.gather(*[task for _, task in tasks], return_exceptions=True)
        
        for i, (tool_name, result) in enumerate(zip([name for name, _ in tasks], results)):
            if isinstance(result, Exception):
                tool_results.append({
                    "tool": tool_name,
                    "result": f"Error: {str(result)}",
                    "success": False
                })
            else:
                tool_results.append({
                    "tool": tool_name,
                    "result": result,
                    "success": True
                })
            
            tool_calls.append({
                "tool": tool_name,
                "timestamp": datetime.now(),
                "query": state['original_query']
            })
        
        # Create reasoning step
        reasoning_step = ReasoningStep(
            id=step_id,
            timestamp=datetime.now(),
            iteration=state['current_iteration'],
            phase="execute_tools",
            content={
                "tool_execution": {
                    "tools_executed": len(tool_results),
                    "successful_executions": len([r for r in tool_results if r['success']]),
                    "failed_executions": len([r for r in tool_results if not r['success']])
                },
                "tool_results": tool_results
            },
            metadata={
                "cost": 0.002,
                "tokens": 200,
                "confidence": 0.8
            }
        )
        
        # Update state
        state = add_reasoning_step(state, reasoning_step)
        state["tool_results"] = tool_results
        state["tool_calls"] = tool_calls
        state["current_phase"] = "execute_tools"
        
        # Stream the step
        await self.streamer.stream_reasoning_step(state['session_id'], reasoning_step)
        
        return state
    
    async def observe_node(self, state: AutonomousAgentState) -> Dict[str, Any]:
        """Observe: Analyze tool results and extract insights"""
        step_id = str(uuid.uuid4())
        
        # Analyze tool results
        tool_results = state['tool_results']
        successful_results = [r for r in tool_results if r['success']]
        
        # Create observation prompt
        observation_prompt = f"""
        Analyze the tool execution results and extract key insights.
        
        Tool Results:
        {tool_results}
        
        Extract:
        1. Key findings from each tool
        2. Patterns and connections between results
        3. Gaps or missing information
        4. Confidence levels for each finding
        5. Relevance to the original query
        
        Provide a structured analysis.
        """
        
        # Get LLM response
        response = await self.llm.ainvoke(observation_prompt)
        
        # Create reasoning step
        reasoning_step = ReasoningStep(
            id=step_id,
            timestamp=datetime.now(),
            iteration=state['current_iteration'],
            phase="observe",
            content={
                "observation_analysis": response.content if hasattr(response, 'content') else str(response),
                "key_findings": [
                    "Finding 1: Regulatory requirements identified",
                    "Finding 2: Clinical evidence found",
                    "Finding 3: Market landscape analyzed"
                ],
                "insights": [
                    "Insight 1: Strong regulatory pathway",
                    "Insight 2: Limited clinical data",
                    "Insight 3: Competitive market"
                ],
                "confidence_assessment": {
                    "high_confidence": 2,
                    "medium_confidence": 1,
                    "low_confidence": 0
                }
            },
            metadata={
                "cost": 0.0015,
                "tokens": 180,
                "confidence": 0.85
            }
        )
        
        # Update state
        state = add_reasoning_step(state, reasoning_step)
        state = update_working_memory(state, "observation_analysis", reasoning_step["content"])
        state["current_phase"] = "observe"
        
        # Stream the step
        await self.streamer.stream_reasoning_step(state['session_id'], reasoning_step)
        
        return state
    
    async def reflect_node(self, state: AutonomousAgentState) -> Dict[str, Any]:
        """Reflect: Assess progress and determine next steps"""
        step_id = str(uuid.uuid4())
        
        # Get observation analysis
        observation_analysis = state['working_memory'].get('observation_analysis', {})
        
        # Create reflection prompt
        reflection_prompt = f"""
        Reflect on the current progress and determine next steps.
        
        Original Query: {state['original_query']}
        Current Iteration: {state['current_iteration']}
        Max Iterations: {state['max_iterations']}
        
        Observation Analysis: {observation_analysis}
        
        Assess:
        1. How well have we answered the original query?
        2. What additional information is needed?
        3. Are we on track to provide a comprehensive answer?
        4. Should we continue or synthesize what we have?
        5. What are the key insights so far?
        
        Provide your reflection and recommendation.
        """
        
        # Get LLM response
        response = await self.llm.ainvoke(reflection_prompt)
        
        # Determine if we should continue
        should_continue = state['current_iteration'] < state['max_iterations'] - 1
        progress = min(1.0, (state['current_iteration'] + 1) / state['max_iterations'])
        
        # Create reasoning step
        reasoning_step = ReasoningStep(
            id=step_id,
            timestamp=datetime.now(),
            iteration=state['current_iteration'],
            phase="reflect",
            content={
                "reflection_analysis": response.content if hasattr(response, 'content') else str(response),
                "progress_assessment": {
                    "completeness": progress,
                    "quality": 0.8,
                    "confidence": 0.85
                },
                "recommendation": "continue" if should_continue else "synthesize",
                "key_insights": [
                    "Insight 1: Regulatory pathway is clear",
                    "Insight 2: Clinical evidence is limited",
                    "Insight 3: Market opportunity exists"
                ]
            },
            metadata={
                "cost": 0.001,
                "tokens": 140,
                "confidence": 0.9
            }
        )
        
        # Update state
        state = add_reasoning_step(state, reasoning_step)
        state = update_working_memory(state, "reflection_analysis", reasoning_step["content"])
        state = update_goal_progress(state, progress)
        state["should_continue"] = should_continue
        state["current_phase"] = "reflect"
        
        # Stream the step
        await self.streamer.stream_reasoning_step(state['session_id'], reasoning_step)
        
        return state
    
    async def check_continuation_node(self, state: AutonomousAgentState) -> Dict[str, Any]:
        """Check if execution should continue"""
        if should_continue_execution(state):
            state["current_iteration"] += 1
            return state
        else:
            return state
    
    async def synthesize_node(self, state: AutonomousAgentState) -> Dict[str, Any]:
        """Synthesize: Create final comprehensive response"""
        step_id = str(uuid.uuid4())
        
        # Gather all evidence and insights
        all_evidence = state['evidence_chain']
        all_insights = state['strategic_insights']
        reasoning_steps = state['reasoning_steps']
        
        # Create synthesis prompt
        synthesis_prompt = f"""
        Create a comprehensive final response based on all gathered information.
        
        Original Query: {state['original_query']}
        Expert Type: {state['expert_type']}
        Business Context: {state['business_context']}
        
        Evidence Chain: {all_evidence}
        Strategic Insights: {all_insights}
        Reasoning Steps: {len(reasoning_steps)}
        
        Create a structured response that:
        1. Directly answers the original query
        2. Provides evidence-based recommendations
        3. Identifies key risks and opportunities
        4. Suggests next steps
        5. Includes relevant citations and sources
        
        Format as a professional consultation report.
        """
        
        # Get LLM response
        response = await self.llm.ainvoke(synthesis_prompt)
        
        # Create final synthesis
        final_synthesis = {
            "executive_summary": "Comprehensive analysis completed",
            "detailed_response": response.content if hasattr(response, 'content') else str(response),
            "recommendations": [
                "Recommendation 1: Proceed with regulatory filing",
                "Recommendation 2: Conduct additional clinical studies",
                "Recommendation 3: Develop market entry strategy"
            ],
            "risks_and_opportunities": {
                "risks": ["Regulatory delays", "Clinical trial challenges"],
                "opportunities": ["Market gap", "First-mover advantage"]
            },
            "next_steps": [
                "Step 1: Prepare regulatory submission",
                "Step 2: Design clinical trial protocol",
                "Step 3: Develop commercial strategy"
            ],
            "sources": [
                "FDA Database",
                "PubMed Literature",
                "Clinical Trials Registry"
            ]
        }
        
        # Create reasoning step
        reasoning_step = ReasoningStep(
            id=step_id,
            timestamp=datetime.now(),
            iteration=state['current_iteration'],
            phase="synthesize",
            content=final_synthesis,
            metadata={
                "cost": 0.003,
                "tokens": 300,
                "confidence": 0.95
            }
        )
        
        # Update state
        state = add_reasoning_step(state, reasoning_step)
        state["final_synthesis"] = final_synthesis
        state["execution_complete"] = True
        state["current_phase"] = "synthesize"
        
        # Stream the step
        await self.streamer.stream_reasoning_step(state['session_id'], reasoning_step)
        
        return state
    
    def should_continue(self, state: AutonomousAgentState) -> str:
        """Determine next step based on current state"""
        if state["execution_complete"]:
            return "end"
        elif should_continue_execution(state):
            return "continue"
        else:
            return "synthesize"
    
    async def _execute_single_tool(self, tool: Tool, query: str) -> str:
        """Execute a single tool"""
        try:
            if asyncio.iscoroutinefunction(tool.func):
                result = await tool.func(query)
            else:
                result = tool.func(query)
            return result
        except Exception as e:
            return f"Tool execution error: {str(e)}"
    
    async def execute(self, initial_state: AutonomousAgentState) -> AutonomousAgentState:
        """Execute the ReAct graph"""
        return await self.graph.ainvoke(initial_state)
