"""
ReAct Pattern
Implements Reasoning + Acting for tool-augmented agents
"""

from typing import List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from openai import AsyncOpenAI
import structlog

from ..state import AgentState
from graphrag.config import get_graphrag_config

logger = structlog.get_logger()


class ReActAgent:
    """
    ReAct (Reasoning + Acting) Agent
    
    Implements synergistic reasoning and acting:
    1. Reason about what to do next
    2. Act by calling tools
    3. Observe tool results
    4. Repeat until task complete
    
    Paper: https://arxiv.org/abs/2210.03629
    """
    
    def __init__(self, model: str = "gpt-4", max_iterations: int = 5):
        """
        Initialize ReAct agent
        
        Args:
            model: LLM model to use
            max_iterations: Maximum reasoning loops
        """
        config = get_graphrag_config()
        self.client = AsyncOpenAI(api_key=config.openai_api_key)
        self.model = model
        self.max_iterations = max_iterations
    
    async def reason(self, state: AgentState) -> AgentState:
        """
        Reasoning step: Decide what to do next
        
        Args:
            state: Current agent state
            
        Returns:
            State with reasoning and next action
        """
        try:
            query = state['query']
            history = self._build_history(state)
            
            # Build reasoning prompt
            prompt = f"""You are solving this task: {query}

History of actions so far:
{history}

Think step-by-step:
1. What have we learned so far?
2. What information is still missing?
3. What should we do next?

Decide on next action:
- If you have enough information: ACTION = answer
- If you need more info: ACTION = search [topic]
- If you need to analyze data: ACTION = analyze [data]

Respond in format:
THOUGHT: [your reasoning]
ACTION: [chosen action]"""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a methodical problem solver. Think then act."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            
            # Parse thought and action
            thought, action = self._parse_react_output(content)
            
            state['reasoning'].append(thought)
            state['metadata']['next_action'] = action
            
            logger.info(
                "reasoning_complete",
                thought_preview=thought[:100],
                action=action
            )
            
            # Decide next node
            if action.startswith('answer'):
                state['next_node'] = 'finalize'
            elif state.get('loop_count', 0) >= self.max_iterations:
                state['next_node'] = 'finalize'
            else:
                state['next_node'] = 'act'
            
            state['loop_count'] = state.get('loop_count', 0) + 1
            
            return state
            
        except Exception as e:
            logger.error("reasoning_failed", error=str(e))
            state['error'] = str(e)
            state['next_node'] = 'finalize'
            return state
    
    async def act(self, state: AgentState) -> AgentState:
        """
        Action step: Execute chosen action
        
        Args:
            state: State with planned action
            
        Returns:
            State with action result
        """
        try:
            action = state['metadata'].get('next_action', '')
            
            # Parse action type and parameters
            action_type, action_params = self._parse_action(action)
            
            # Execute action
            if action_type == 'search':
                result = await self._execute_search(action_params, state)
            elif action_type == 'analyze':
                result = await self._execute_analyze(action_params, state)
            elif action_type == 'answer':
                result = {'type': 'final_answer', 'content': action_params}
            else:
                result = {'type': 'unknown', 'content': 'Unknown action type'}
            
            # Record action
            state['tool_calls'].append({
                'action': action,
                'action_type': action_type,
                'params': action_params
            })
            
            state['tool_results'].append(result)
            
            logger.info(
                "action_executed",
                action_type=action_type,
                result_type=result.get('type')
            )
            
            # Observe: Add result to context
            observation = f"Action Result: {result.get('content', '')}"
            state['messages'].append({
                'role': 'system',
                'content': observation
            })
            
            return state
            
        except Exception as e:
            logger.error("action_failed", error=str(e))
            state['error'] = str(e)
            return state
    
    async def finalize(self, state: AgentState) -> AgentState:
        """
        Finalize: Generate final answer
        
        Args:
            state: State after reasoning/acting loops
            
        Returns:
            State with final response
        """
        try:
            query = state['query']
            history = self._build_history(state)
            
            prompt = f"""Based on the reasoning and actions taken, provide a final answer to:

Question: {query}

History:
{history}

Provide a clear, comprehensive answer."""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Synthesize a final answer based on all gathered information."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            state['response'] = response.choices[0].message.content
            state['confidence'] = 0.85  # High confidence after multi-step reasoning
            
            logger.info(
                "finalization_complete",
                iterations=state.get('loop_count', 0)
            )
            
            return state
            
        except Exception as e:
            logger.error("finalization_failed", error=str(e))
            state['error'] = str(e)
            return state
    
    def _build_history(self, state: AgentState) -> str:
        """Build history of reasoning and actions"""
        history = []
        
        for i, (thought, tool_call, result) in enumerate(zip(
            state.get('reasoning', []),
            state.get('tool_calls', []),
            state.get('tool_results', [])
        )):
            history.append(f"Step {i+1}:")
            history.append(f"  Thought: {thought}")
            history.append(f"  Action: {tool_call.get('action', 'N/A')}")
            history.append(f"  Result: {str(result.get('content', 'N/A'))[:100]}")
        
        return "\n".join(history) if history else "No history yet"
    
    def _parse_react_output(self, content: str) -> tuple[str, str]:
        """Parse THOUGHT and ACTION from LLM output"""
        thought = ""
        action = ""
        
        for line in content.split('\n'):
            if line.startswith('THOUGHT:'):
                thought = line.replace('THOUGHT:', '').strip()
            elif line.startswith('ACTION:'):
                action = line.replace('ACTION:', '').strip()
        
        return thought or content, action or "answer"
    
    def _parse_action(self, action: str) -> tuple[str, str]:
        """Parse action into type and parameters"""
        parts = action.split(' ', 1)
        action_type = parts[0].lower()
        action_params = parts[1] if len(parts) > 1 else ""
        return action_type, action_params
    
    async def _execute_search(self, query: str, state: AgentState) -> Dict:
        """Execute search action"""
        # Placeholder: Use GraphRAG search
        return {
            'type': 'search',
            'content': f"Search results for: {query}"
        }
    
    async def _execute_analyze(self, data: str, state: AgentState) -> Dict:
        """Execute analyze action"""
        # Placeholder: Perform analysis
        return {
            'type': 'analysis',
            'content': f"Analysis of: {data}"
        }


def create_react_graph(agent: ReActAgent) -> StateGraph:
    """
    Create ReAct LangGraph workflow
    
    Args:
        agent: ReActAgent instance
        
    Returns:
        Compiled StateGraph
    """
    graph = StateGraph(AgentState)
    
    # Add nodes
    graph.add_node("reason", agent.reason)
    graph.add_node("act", agent.act)
    graph.add_node("finalize", agent.finalize)
    
    # Add edges
    graph.set_entry_point("reason")
    
    # Conditional routing from reason
    def should_continue(state: AgentState) -> str:
        return state.get('next_node', 'finalize')
    
    graph.add_conditional_edges(
        "reason",
        should_continue,
        {
            "act": "act",
            "finalize": "finalize"
        }
    )
    
    # Loop back from act to reason
    graph.add_edge("act", "reason")
    
    # End after finalize
    graph.add_edge("finalize", END)
    
    return graph.compile()

