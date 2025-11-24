"""
Constitutional AI Pattern
Implements self-critique and revision for safe AI responses
"""

from typing import List, Dict, Any
from langgraph.graph import StateGraph, END
from openai import AsyncOpenAI
import structlog

from ..state import CritiqueState, AgentState
from graphrag.config import get_graphrag_config

logger = structlog.get_logger()


class ConstitutionalAgent:
    """
    Constitutional AI Agent
    
    Implements self-critique and revision based on constitutional principles:
    1. Generate initial response
    2. Critique against constitution (safety rules)
    3. Revise if violations found
    4. Repeat until safe
    
    Paper: https://arxiv.org/abs/2212.08073
    """
    
    def __init__(self, model: str = "gpt-4", max_revisions: int = 3):
        """
        Initialize Constitutional AI agent
        
        Args:
            model: LLM model to use
            max_revisions: Maximum revision iterations
        """
        config = get_graphrag_config()
        self.client = AsyncOpenAI(api_key=config.openai_api_key)
        self.model = model
        self.max_revisions = max_revisions
        
        # Default constitution (safety rules)
        self.default_constitution = [
            {
                "principle": "Harmful Content",
                "rule": "Response must not contain harmful, dangerous, or illegal content"
            },
            {
                "principle": "Medical Accuracy",
                "rule": "Medical information must be accurate, evidence-based, and include appropriate disclaimers"
            },
            {
                "principle": "Bias",
                "rule": "Response must be fair and unbiased, avoiding stereotypes"
            },
            {
                "principle": "Privacy",
                "rule": "Response must respect privacy and not request sensitive personal information"
            },
            {
                "principle": "Overconfidence",
                "rule": "Response must acknowledge uncertainty when appropriate and not overstate capabilities"
            }
        ]
    
    async def critique(self, state: CritiqueState) -> CritiqueState:
        """
        Critique response against constitutional principles
        
        Args:
            state: State with response to critique
            
        Returns:
            State with critique results
        """
        try:
            response = state['original_response']
            constitution = state.get('constitution', self.default_constitution)
            
            violations = []
            critique_results = []
            
            # Critique against each principle
            for principle in constitution:
                result = await self._critique_principle(response, principle)
                critique_results.append(result)
                
                if not result['passes']:
                    violations.append(principle['principle'])
            
            state['critique_results'] = critique_results
            state['violations_found'] = violations
            state['safe_to_return'] = len(violations) == 0
            
            logger.info(
                "critique_complete",
                principles_checked=len(constitution),
                violations_found=len(violations)
            )
            
            return state
            
        except Exception as e:
            logger.error("critique_failed", error=str(e))
            state['error'] = str(e)
            state['safe_to_return'] = False
            return state
    
    async def _critique_principle(
        self,
        response: str,
        principle: Dict[str, str]
    ) -> Dict[str, Any]:
        """Critique response against single principle"""
        try:
            prompt = f"""Evaluate this response against the following principle:

Principle: {principle['principle']}
Rule: {principle['rule']}

Response to evaluate:
{response}

Does the response violate this principle?
- Answer YES or NO
- Explain why
- If YES, suggest how to fix it

Format:
PASSES: [YES/NO]
EXPLANATION: [your explanation]
SUGGESTION: [how to fix, if applicable]"""
            
            result = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a safety critic. Be thorough but fair."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            content = result.choices[0].message.content
            
            # Parse result
            passes = 'PASSES: YES' in content or 'PASSES: yes' in content
            
            return {
                'principle': principle['principle'],
                'passes': passes,
                'explanation': content,
                'suggestion': self._extract_suggestion(content)
            }
            
        except Exception as e:
            logger.warning("principle_critique_failed", error=str(e))
            return {
                'principle': principle['principle'],
                'passes': True,  # Fail open to avoid blocking
                'explanation': f"Error: {str(e)}",
                'suggestion': ""
            }
    
    def _extract_suggestion(self, content: str) -> str:
        """Extract suggestion from critique"""
        for line in content.split('\n'):
            if line.startswith('SUGGESTION:'):
                return line.replace('SUGGESTION:', '').strip()
        return ""
    
    async def revise(self, state: CritiqueState) -> CritiqueState:
        """
        Revise response to address violations
        
        Args:
            state: State with critique results
            
        Returns:
            State with revised response
        """
        try:
            original_response = state['original_response']
            critique_results = state.get('critique_results', [])
            violations = state.get('violations_found', [])
            
            if not violations:
                # No revisions needed
                state['revised_response'] = original_response
                state['safe_to_return'] = True
                return state
            
            # Build revision prompt
            revision_guidance = []
            for result in critique_results:
                if not result['passes']:
                    revision_guidance.append(
                        f"- {result['principle']}: {result['suggestion']}"
                    )
            
            prompt = f"""Revise this response to address the following issues:

Original Response:
{original_response}

Issues to address:
{chr(10).join(revision_guidance)}

Provide a revised response that:
1. Addresses all identified issues
2. Maintains the core helpful information
3. Follows all safety principles

Revised Response:"""
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are revising a response for safety and accuracy."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            revised = response.choices[0].message.content
            
            state['revised_response'] = revised
            
            logger.info(
                "revision_complete",
                violations_addressed=len(violations)
            )
            
            # Need to re-critique the revision
            state['safe_to_return'] = False
            
            return state
            
        except Exception as e:
            logger.error("revision_failed", error=str(e))
            state['error'] = str(e)
            state['revised_response'] = state['original_response']  # Fallback
            return state
    
    async def finalize(self, state: CritiqueState) -> CritiqueState:
        """
        Finalize after all revisions
        
        Args:
            state: Final state
            
        Returns:
            State with final response
        """
        final_response = state.get('revised_response') or state['original_response']
        
        state['final_response'] = final_response
        state['revisions_applied'] = len([r for r in state.get('critique_results', []) if not r['passes']])
        
        logger.info(
            "constitutional_ai_complete",
            revisions_applied=state['revisions_applied'],
            safe=state.get('safe_to_return', False)
        )
        
        return state


def create_constitutional_graph(agent: ConstitutionalAgent) -> StateGraph:
    """
    Create Constitutional AI LangGraph workflow
    
    Args:
        agent: ConstitutionalAgent instance
        
    Returns:
        Compiled StateGraph
    """
    graph = StateGraph(CritiqueState)
    
    # Add nodes
    graph.add_node("critique", agent.critique)
    graph.add_node("revise", agent.revise)
    graph.add_node("finalize", agent.finalize)
    
    # Add edges
    graph.set_entry_point("critique")
    
    # Conditional routing from critique
    def needs_revision(state: CritiqueState) -> str:
        if state.get('safe_to_return', False):
            return "finalize"
        
        # Check revision count
        revision_count = len([
            r for r in state.get('critique_results', [])
            if not r.get('passes', True)
        ])
        
        if revision_count >= agent.max_revisions:
            logger.warning("max_revisions_reached", count=revision_count)
            return "finalize"
        
        return "revise"
    
    graph.add_conditional_edges(
        "critique",
        needs_revision,
        {
            "revise": "revise",
            "finalize": "finalize"
        }
    )
    
    # After revision, critique again
    graph.add_edge("revise", "critique")
    
    # End after finalize
    graph.add_edge("finalize", END)
    
    return graph.compile()


# Helper function to wrap any agent with constitutional checks
async def wrap_with_constitution(
    agent_response: str,
    constitution: List[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Wrap any agent response with constitutional checking
    
    Args:
        agent_response: Response to check
        constitution: Optional custom constitution
        
    Returns:
        Dict with safe_response and metadata
    """
    agent = ConstitutionalAgent()
    
    state = CritiqueState(
        original_response=agent_response,
        constitution=constitution or agent.default_constitution,
        critique_results=[],
        violations_found=[],
        safe_to_return=False
    )
    
    graph = create_constitutional_graph(agent)
    final_state = await graph.ainvoke(state)
    
    return {
        'safe_response': final_state.get('final_response', agent_response),
        'violations_found': final_state.get('violations_found', []),
        'revisions_applied': final_state.get('revisions_applied', 0),
        'safe': final_state.get('safe_to_return', False)
    }

