"""
Tree-of-Thoughts Pattern
Implements deliberate planning and exploration for complex reasoning tasks
"""

from typing import List, Dict, Any
from langgraph.graph import StateGraph, END
from openai import AsyncOpenAI
import structlog

from ..state import PlanState, AgentState
from graphrag.config import get_graphrag_config

logger = structlog.get_logger()


class TreeOfThoughtsAgent:
    """
    Tree-of-Thoughts (ToT) Agent
    
    Implements deliberate search through a tree of reasoning steps:
    1. Generate multiple thought branches
    2. Evaluate each branch
    3. Select best path
    4. Execute chosen plan
    
    Paper: https://arxiv.org/abs/2305.10601
    """
    
    def __init__(self, model: str = "gpt-4"):
        """
        Initialize ToT agent
        
        Args:
            model: LLM model to use
        """
        config = get_graphrag_config()
        self.client = AsyncOpenAI(api_key=config.openai_api_key)
        self.model = model
        self.max_thoughts = 3  # Generate 3 thoughts per node
        self.max_depth = 3  # Maximum tree depth
    
    async def generate_thoughts(self, state: PlanState) -> PlanState:
        """
        Generate multiple thought branches for current step
        
        Args:
            state: Current plan state
            
        Returns:
            Updated state with new thoughts
        """
        try:
            query = state['original_query']
            current_thought = state.get('current_thought_id', 'root')
            
            # Build prompt for thought generation
            prompt = f"""Generate {self.max_thoughts} different approaches to solve this problem:

Problem: {query}

For each approach, provide:
1. A clear reasoning step
2. Why this approach might work
3. Potential challenges

Format as JSON array of thoughts."""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a strategic planner. Generate diverse approaches."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.9,  # Higher temperature for diversity
                response_format={"type": "json_object"}
            )
            
            import json
            thoughts_data = json.loads(response.choices[0].message.content)
            
            # Add thoughts to tree
            if 'thought_tree' not in state:
                state['thought_tree'] = {}
            
            thoughts = []
            for i, thought in enumerate(thoughts_data.get('thoughts', [])[:self.max_thoughts]):
                thought_id = f"{current_thought}_t{i}"
                thoughts.append({
                    'id': thought_id,
                    'content': thought.get('reasoning', ''),
                    'rationale': thought.get('why', ''),
                    'challenges': thought.get('challenges', ''),
                    'parent': current_thought,
                    'score': None
                })
                state['thought_tree'][thought_id] = thoughts[-1]
            
            logger.info(
                "thoughts_generated",
                query=query[:50],
                thought_count=len(thoughts)
            )
            
            state['metadata'] = state.get('metadata', {})
            state['metadata']['generated_thoughts'] = thoughts
            
            return state
            
        except Exception as e:
            logger.error("thought_generation_failed", error=str(e))
            state['error'] = str(e)
            return state
    
    async def evaluate_thoughts(self, state: PlanState) -> PlanState:
        """
        Evaluate quality of each thought branch
        
        Args:
            state: Plan state with thoughts
            
        Returns:
            State with scored thoughts
        """
        try:
            thoughts = state['metadata'].get('generated_thoughts', [])
            
            evaluated = []
            for thought in thoughts:
                # Evaluate thought with LLM
                score = await self._evaluate_single_thought(
                    state['original_query'],
                    thought['content']
                )
                
                thought['score'] = score
                evaluated.append(thought)
                
                # Update in tree
                state['thought_tree'][thought['id']]['score'] = score
            
            # Sort by score
            evaluated.sort(key=lambda x: x['score'], reverse=True)
            
            state['evaluated_thoughts'] = evaluated
            
            logger.info(
                "thoughts_evaluated",
                thought_count=len(evaluated),
                best_score=evaluated[0]['score'] if evaluated else 0
            )
            
            return state
            
        except Exception as e:
            logger.error("thought_evaluation_failed", error=str(e))
            state['error'] = str(e)
            return state
    
    async def _evaluate_single_thought(self, query: str, thought: str) -> float:
        """Evaluate single thought quality (0-1)"""
        try:
            prompt = f"""Evaluate this reasoning approach for solving the problem.

Problem: {query}

Approach: {thought}

Rate from 0.0 to 1.0 based on:
- Logical soundness
- Feasibility
- Completeness

Return only the numeric score."""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an objective evaluator. Return only a number between 0.0 and 1.0."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            score_text = response.choices[0].message.content.strip()
            return float(score_text)
            
        except Exception as e:
            logger.warning("thought_eval_failed", error=str(e))
            return 0.5  # Default score
    
    async def select_best_path(self, state: PlanState) -> PlanState:
        """
        Select best path through thought tree
        
        Args:
            state: State with evaluated thoughts
            
        Returns:
            State with selected path
        """
        try:
            evaluated = state.get('evaluated_thoughts', [])
            
            if not evaluated:
                state['best_path'] = []
                return state
            
            # Select highest scoring thought
            best_thought = evaluated[0]
            
            # Build path from root to best thought
            path = []
            current = best_thought
            
            while current.get('parent') and current['parent'] != 'root':
                path.insert(0, current['id'])
                parent_id = current['parent']
                current = state['thought_tree'].get(parent_id, {})
            
            path.insert(0, best_thought['id'])
            
            state['best_path'] = path
            state['current_thought_id'] = best_thought['id']
            
            logger.info(
                "best_path_selected",
                path_length=len(path),
                final_score=best_thought['score']
            )
            
            return state
            
        except Exception as e:
            logger.error("path_selection_failed", error=str(e))
            state['error'] = str(e)
            return state
    
    async def execute_plan(self, state: PlanState) -> PlanState:
        """
        Execute the selected plan
        
        Args:
            state: State with selected path
            
        Returns:
            State with execution results
        """
        try:
            best_path = state.get('best_path', [])
            
            if not best_path:
                logger.warning("no_path_to_execute")
                return state
            
            # Build execution steps from path
            steps = []
            for thought_id in best_path:
                thought = state['thought_tree'].get(thought_id, {})
                steps.append({
                    'step_id': thought_id,
                    'action': thought.get('content', ''),
                    'status': 'pending'
                })
            
            state['plan_steps'] = steps
            
            # Execute each step (placeholder)
            results = []
            for step in steps:
                result = await self._execute_step(step, state['original_query'])
                results.append(result)
                step['status'] = 'completed' if result.get('success') else 'failed'
            
            state['execution_results'] = results
            
            logger.info(
                "plan_executed",
                steps_count=len(steps),
                success_count=sum(1 for r in results if r.get('success'))
            )
            
            return state
            
        except Exception as e:
            logger.error("plan_execution_failed", error=str(e))
            state['error'] = str(e)
            return state
    
    async def _execute_step(self, step: Dict, query: str) -> Dict[str, Any]:
        """Execute single plan step"""
        # Placeholder: Actual execution would call tools, agents, etc.
        return {
            'success': True,
            'step_id': step['step_id'],
            'result': f"Executed: {step['action']}"
        }


def create_tot_graph(agent: TreeOfThoughtsAgent) -> StateGraph:
    """
    Create Tree-of-Thoughts LangGraph workflow
    
    Args:
        agent: TreeOfThoughtsAgent instance
        
    Returns:
        Compiled StateGraph
    """
    graph = StateGraph(PlanState)
    
    # Add nodes
    graph.add_node("generate", agent.generate_thoughts)
    graph.add_node("evaluate", agent.evaluate_thoughts)
    graph.add_node("select", agent.select_best_path)
    graph.add_node("execute", agent.execute_plan)
    
    # Add edges
    graph.set_entry_point("generate")
    graph.add_edge("generate", "evaluate")
    graph.add_edge("evaluate", "select")
    graph.add_edge("select", "execute")
    graph.add_edge("execute", END)
    
    return graph.compile()

