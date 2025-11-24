"""
Tree-of-Thoughts (ToT) Agent Pattern

Implements the Tree-of-Thoughts reasoning strategy for complex problem-solving.

Paper: "Tree of Thoughts: Deliberate Problem Solving with Large Language Models"
(Yao et al., 2023)

Algorithm:
1. Generate multiple thought branches from current state
2. Evaluate each branch for promise/validity
3. Select best branches to expand
4. Repeat until solution or max depth
5. Return best path through thought tree

Use cases:
- Strategic planning requiring multi-step reasoning
- Complex decision-making with multiple options
- Problems requiring exploration of solution space
"""

from typing import List, Dict, Any, Optional, Tuple
from uuid import UUID
from dataclasses import dataclass, field
from enum import Enum
import json
import openai

from ...graphrag.utils.logger import get_logger

logger = get_logger(__name__)


class ThoughtEvaluationMode(str, Enum):
    """Evaluation strategy for thought branches"""
    VALUE = "value"  # Rate each thought on a scale (e.g., 1-10)
    VOTE = "vote"    # Vote on the most promising thought
    COMPARISON = "comparison"  # Pairwise comparison


@dataclass
class Thought:
    """Represents a single thought in the tree"""
    id: str
    content: str
    parent_id: Optional[str] = None
    depth: int = 0
    score: float = 0.0
    is_terminal: bool = False
    children: List['Thought'] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ThoughtPath:
    """Represents a path through the thought tree"""
    thoughts: List[Thought]
    total_score: float
    is_complete: bool
    
    def get_path_text(self) -> str:
        """Get concatenated text of all thoughts in path"""
        return "\n→ ".join([t.content for t in self.thoughts])


class TreeOfThoughtsAgent:
    """
    Implements Tree-of-Thoughts reasoning pattern.
    
    This agent:
    1. Generates multiple reasoning paths (thoughts)
    2. Evaluates each path's promise
    3. Expands the most promising paths
    4. Prunes unpromising branches
    5. Returns the best solution path
    """
    
    def __init__(
        self,
        agent_id: UUID,
        model: str = "gpt-4",
        system_prompt: str = "",
        max_depth: int = 3,
        branching_factor: int = 3,
        evaluation_mode: ThoughtEvaluationMode = ThoughtEvaluationMode.VALUE,
        min_score_threshold: float = 0.5,
        temperature: float = 0.7
    ):
        """
        Initialize ToT agent.
        
        Args:
            agent_id: Agent UUID
            model: LLM model to use
            system_prompt: System prompt for the agent
            max_depth: Maximum depth of thought tree
            branching_factor: Number of thoughts to generate per node
            evaluation_mode: How to evaluate thoughts
            min_score_threshold: Minimum score to continue expanding
            temperature: LLM temperature for thought generation
        """
        self.agent_id = agent_id
        self.model = model
        self.system_prompt = system_prompt
        self.max_depth = max_depth
        self.branching_factor = branching_factor
        self.evaluation_mode = evaluation_mode
        self.min_score_threshold = min_score_threshold
        self.temperature = temperature
        
        # Initialize OpenAI client
        from ...graphrag.config import get_embedding_config
        config = get_embedding_config()
        self.openai_client = openai.AsyncOpenAI(api_key=config.openai_api_key)
        
        # Thought tree
        self.root: Optional[Thought] = None
        self.all_thoughts: Dict[str, Thought] = {}
        self.thought_counter = 0
        
    async def plan(
        self,
        query: str,
        context: str = "",
        constraints: List[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a plan using Tree-of-Thoughts reasoning.
        
        Args:
            query: Problem to solve
            context: Additional context
            constraints: List of constraints to consider
            
        Returns:
            Dict with plan, thought tree, and best path
        """
        logger.info(f"ToT planning started for agent {self.agent_id}")
        
        constraints = constraints or []
        
        # Initialize root thought
        self.root = self._create_thought(
            content=f"Problem: {query}",
            parent_id=None,
            depth=0
        )
        
        # Build thought tree iteratively
        await self._build_tree(query, context, constraints)
        
        # Find best path
        best_path = self._find_best_path()
        
        # Extract plan from best path
        plan = self._extract_plan(best_path)
        
        logger.info(
            f"ToT planning completed: {len(self.all_thoughts)} thoughts generated, "
            f"best path score: {best_path.total_score:.2f}"
        )
        
        return {
            "plan": plan,
            "best_path": best_path.get_path_text(),
            "tree_stats": {
                "total_thoughts": len(self.all_thoughts),
                "max_depth_reached": max([t.depth for t in self.all_thoughts.values()]),
                "best_score": best_path.total_score
            }
        }
        
    async def _build_tree(
        self,
        query: str,
        context: str,
        constraints: List[str]
    ) -> None:
        """Build thought tree using BFS or DFS"""
        # Use BFS to explore level by level
        current_level = [self.root]
        
        for depth in range(self.max_depth):
            next_level = []
            
            for parent_thought in current_level:
                # Generate children thoughts
                children = await self._generate_thoughts(
                    parent_thought,
                    query,
                    context,
                    constraints
                )
                
                if not children:
                    continue
                    
                # Evaluate children
                scored_children = await self._evaluate_thoughts(
                    children,
                    query,
                    context
                )
                
                # Filter by score threshold
                promising_children = [
                    child for child in scored_children
                    if child.score >= self.min_score_threshold
                ]
                
                # Add to tree
                parent_thought.children = promising_children
                for child in promising_children:
                    self.all_thoughts[child.id] = child
                    
                # Add to next level if not at max depth
                if depth < self.max_depth - 1:
                    next_level.extend(promising_children)
                    
            current_level = next_level
            
            if not current_level:
                logger.info(f"ToT tree building stopped at depth {depth}: no promising thoughts")
                break
                
    async def _generate_thoughts(
        self,
        parent: Thought,
        query: str,
        context: str,
        constraints: List[str]
    ) -> List[Thought]:
        """Generate branching factor number of thoughts from parent"""
        # Build prompt for thought generation
        prompt = self._build_generation_prompt(
            parent,
            query,
            context,
            constraints
        )
        
        try:
            response = await self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                n=self.branching_factor  # Generate multiple completions
            )
            
            thoughts = []
            for choice in response.choices:
                thought_content = choice.message.content.strip()
                thought = self._create_thought(
                    content=thought_content,
                    parent_id=parent.id,
                    depth=parent.depth + 1
                )
                thoughts.append(thought)
                
            return thoughts
            
        except Exception as e:
            logger.error(f"Error generating thoughts: {e}")
            return []
            
    async def _evaluate_thoughts(
        self,
        thoughts: List[Thought],
        query: str,
        context: str
    ) -> List[Thought]:
        """Evaluate thoughts and assign scores"""
        if self.evaluation_mode == ThoughtEvaluationMode.VALUE:
            return await self._evaluate_by_value(thoughts, query, context)
        elif self.evaluation_mode == ThoughtEvaluationMode.VOTE:
            return await self._evaluate_by_vote(thoughts, query, context)
        else:
            return await self._evaluate_by_comparison(thoughts, query, context)
            
    async def _evaluate_by_value(
        self,
        thoughts: List[Thought],
        query: str,
        context: str
    ) -> List[Thought]:
        """Evaluate thoughts by scoring each on a scale"""
        for thought in thoughts:
            prompt = f"""
Evaluate the following reasoning step for solving the problem.

Problem: {query}
Context: {context}

Reasoning step: {thought.content}

Rate this reasoning step on a scale of 0.0 to 1.0 based on:
- Logical soundness
- Progress toward solution
- Feasibility
- Alignment with constraints

Provide ONLY a number between 0.0 and 1.0.
"""
            
            try:
                response = await self.openai_client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are an expert evaluator of reasoning steps."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.0,  # Deterministic for evaluation
                    max_tokens=10
                )
                
                score_text = response.choices[0].message.content.strip()
                thought.score = float(score_text)
                
            except Exception as e:
                logger.warning(f"Error evaluating thought: {e}, assigning default score")
                thought.score = 0.5  # Default neutral score
                
        return thoughts
        
    async def _evaluate_by_vote(
        self,
        thoughts: List[Thought],
        query: str,
        context: str
    ) -> List[Thought]:
        """Evaluate thoughts by voting on the most promising"""
        if not thoughts:
            return []
            
        # Create voting prompt
        thought_options = "\n".join([
            f"{i+1}. {t.content}"
            for i, t in enumerate(thoughts)
        ])
        
        prompt = f"""
Problem: {query}
Context: {context}

Which of the following reasoning steps is most promising? Vote by number.

{thought_options}

Provide ONLY the number of the best option.
"""
        
        try:
            response = await self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert at evaluating reasoning steps."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0,
                max_tokens=5
            )
            
            vote_text = response.choices[0].message.content.strip()
            winner_idx = int(vote_text) - 1
            
            # Assign scores: winner gets 1.0, others get 0.5
            for i, thought in enumerate(thoughts):
                thought.score = 1.0 if i == winner_idx else 0.5
                
        except Exception as e:
            logger.warning(f"Error in voting evaluation: {e}, assigning uniform scores")
            for thought in thoughts:
                thought.score = 0.7  # Default moderate score
                
        return thoughts
        
    async def _evaluate_by_comparison(
        self,
        thoughts: List[Thought],
        query: str,
        context: str
    ) -> List[Thought]:
        """Evaluate thoughts by pairwise comparison"""
        # Simple implementation: compare to first thought
        if not thoughts:
            return []
            
        # For simplicity, use value-based evaluation
        # Full implementation would do all pairwise comparisons
        return await self._evaluate_by_value(thoughts, query, context)
        
    def _find_best_path(self) -> ThoughtPath:
        """Find the best path through the thought tree"""
        if not self.root:
            return ThoughtPath(thoughts=[], total_score=0.0, is_complete=False)
            
        # DFS to find all paths to leaf nodes
        all_paths = []
        self._dfs_paths(self.root, [], all_paths)
        
        if not all_paths:
            return ThoughtPath(thoughts=[self.root], total_score=0.0, is_complete=False)
            
        # Find path with highest average score
        best_path = max(all_paths, key=lambda p: p.total_score / len(p.thoughts))
        
        return best_path
        
    def _dfs_paths(
        self,
        node: Thought,
        current_path: List[Thought],
        all_paths: List[ThoughtPath]
    ) -> None:
        """DFS to collect all paths to leaf nodes"""
        current_path.append(node)
        
        if not node.children:
            # Leaf node - create path
            path = ThoughtPath(
                thoughts=current_path.copy(),
                total_score=sum([t.score for t in current_path]),
                is_complete=node.is_terminal
            )
            all_paths.append(path)
        else:
            # Continue DFS
            for child in node.children:
                self._dfs_paths(child, current_path, all_paths)
                
        current_path.pop()
        
    def _extract_plan(self, best_path: ThoughtPath) -> Dict[str, Any]:
        """Extract structured plan from best path"""
        steps = []
        for i, thought in enumerate(best_path.thoughts[1:], 1):  # Skip root
            steps.append({
                "step": i,
                "action": thought.content,
                "score": thought.score,
                "depth": thought.depth
            })
            
        return {
            "steps": steps,
            "total_steps": len(steps),
            "confidence": best_path.total_score / len(best_path.thoughts),
            "is_complete": best_path.is_complete
        }
        
    def _create_thought(
        self,
        content: str,
        parent_id: Optional[str],
        depth: int
    ) -> Thought:
        """Create a new thought node"""
        thought_id = f"thought_{self.thought_counter}"
        self.thought_counter += 1
        
        thought = Thought(
            id=thought_id,
            content=content,
            parent_id=parent_id,
            depth=depth
        )
        
        self.all_thoughts[thought_id] = thought
        return thought
        
    def _build_generation_prompt(
        self,
        parent: Thought,
        query: str,
        context: str,
        constraints: List[str]
    ) -> str:
        """Build prompt for generating next thoughts"""
        constraints_text = "\n".join([f"- {c}" for c in constraints]) if constraints else "None"
        
        # Get path to parent
        path = []
        current = parent
        while current is not None:
            path.insert(0, current.content)
            parent_obj = self.all_thoughts.get(current.parent_id)
            current = parent_obj
            
        path_text = "\n→ ".join(path)
        
        return f"""
Problem: {query}
Context: {context}
Constraints: {constraints_text}

Current reasoning path:
{path_text}

Generate the next logical step in solving this problem. Think carefully about:
1. What progress have we made so far?
2. What remains to be solved?
3. What is the most promising next step?

Provide ONLY the next reasoning step, not the full solution.
"""
        
    def get_tree(self) -> Dict[str, Any]:
        """Get serialized thought tree for debugging/visualization"""
        if not self.root:
            return {}
            
        return {
            "root": self._serialize_thought(self.root),
            "total_thoughts": len(self.all_thoughts),
            "max_depth": max([t.depth for t in self.all_thoughts.values()])
        }
        
    def _serialize_thought(self, thought: Thought) -> Dict[str, Any]:
        """Recursively serialize thought tree"""
        return {
            "id": thought.id,
            "content": thought.content,
            "depth": thought.depth,
            "score": thought.score,
            "is_terminal": thought.is_terminal,
            "children": [self._serialize_thought(child) for child in thought.children]
        }

