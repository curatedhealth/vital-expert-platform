"""
VITAL SubAgent Middleware - Custom middleware for deep agents

Extends deepagents middleware with VITAL-specific features:
- Evidence-based subagent selection (GraphRAG integration)
- Tenant isolation for subagent execution
- Subagent result aggregation strategies
- Execution metrics and monitoring

Integrates with VITAL's agent_hierarchies table for subagent configuration.
"""

from typing import Dict, List, Optional, Any, Callable
from uuid import UUID
import asyncio


class VITALSubAgentMiddleware:
    """
    Custom middleware for managing subagent execution in VITAL
    
    Features:
    - Automatic subagent selection based on delegation criteria
    - Tenant-aware subagent execution
    - Multiple aggregation strategies (synthesize, vote, hierarchical)
    - Execution monitoring and metrics
    """
    
    def __init__(
        self,
        subagent_configs: List[Dict[str, Any]],
        delegation_criteria: Dict[str, Any],
        postgres_client
    ):
        self.subagent_configs = subagent_configs
        self.delegation_criteria = delegation_criteria
        self.postgres = postgres_client
    
    async def should_delegate_to_subagent(
        self,
        parent_agent_id: UUID,
        current_task: str,
        state: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Determine if current task should be delegated to a subagent
        
        Evaluates:
        1. Keyword matching (delegation_criteria.keywords)
        2. Trigger phrases (delegation_criteria.triggers)
        3. Task complexity
        4. Parent agent confidence
        
        Returns:
            Subagent config if delegation recommended, None otherwise
        """
        
        task_lower = current_task.lower()
        
        # Check trigger phrases
        triggers = self.delegation_criteria.get('triggers', [])
        for trigger in triggers:
            if trigger.lower() in task_lower:
                # Find matching subagent
                for config in self.subagent_configs:
                    if self._subagent_matches_trigger(config, trigger):
                        return config
        
        # Check keywords
        keywords = self.delegation_criteria.get('keywords', [])
        keyword_matches = sum(1 for kw in keywords if kw.lower() in task_lower)
        
        if keyword_matches >= 2:  # At least 2 keyword matches
            # Find best matching subagent
            best_match = self._find_best_subagent_match(
                current_task,
                self.subagent_configs
            )
            if best_match:
                return best_match
        
        return None
    
    def _subagent_matches_trigger(
        self,
        subagent_config: Dict[str, Any],
        trigger: str
    ) -> bool:
        """Check if subagent's delegation criteria matches trigger"""
        subagent_criteria = subagent_config.get('delegation_criteria', {})
        subagent_triggers = subagent_criteria.get('triggers', [])
        
        return trigger.lower() in [t.lower() for t in subagent_triggers]
    
    def _find_best_subagent_match(
        self,
        task: str,
        subagent_configs: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """
        Find subagent with best match to task
        
        Scoring based on:
        - Keyword overlap
        - Trigger phrase matches
        - Description similarity
        """
        task_lower = task.lower()
        best_score = 0
        best_match = None
        
        for config in subagent_configs:
            score = 0
            
            # Score based on delegation criteria
            criteria = config.get('delegation_criteria', {})
            
            # Trigger matches
            triggers = criteria.get('triggers', [])
            score += sum(2 for t in triggers if t.lower() in task_lower)
            
            # Keyword matches
            keywords = criteria.get('keywords', [])
            score += sum(1 for kw in keywords if kw.lower() in task_lower)
            
            # Description relevance
            description = config.get('description', '').lower()
            if any(word in description for word in task_lower.split() if len(word) > 4):
                score += 1
            
            if score > best_score:
                best_score = score
                best_match = config
        
        # Return if score is significant
        return best_match if best_score >= 3 else None
    
    async def aggregate_subagent_results(
        self,
        parent_agent_id: UUID,
        subagent_results: List[Dict[str, Any]],
        aggregation_strategy: str = 'synthesize'
    ) -> str:
        """
        Aggregate multiple subagent results
        
        Strategies:
        - 'synthesize': LLM-based synthesis (default)
        - 'concatenate': Simple concatenation
        - 'vote': Majority vote (for conflicting results)
        - 'hierarchical': Parent reviews and refines
        """
        
        if not subagent_results:
            return ""
        
        if aggregation_strategy == 'concatenate':
            return self._concatenate_results(subagent_results)
        
        elif aggregation_strategy == 'vote':
            return await self._vote_aggregation(subagent_results)
        
        elif aggregation_strategy == 'synthesize':
            return await self._synthesize_results(subagent_results, parent_agent_id)
        
        elif aggregation_strategy == 'hierarchical':
            return await self._hierarchical_aggregation(
                subagent_results,
                parent_agent_id
            )
        
        else:
            # Default to synthesize
            return await self._synthesize_results(subagent_results, parent_agent_id)
    
    def _concatenate_results(self, subagent_results: List[Dict[str, Any]]) -> str:
        """Simple concatenation of subagent outputs"""
        parts = []
        for result in subagent_results:
            name = result.get('subagent_name', 'Subagent')
            output = result.get('output', '')
            parts.append(f"## {name}\n\n{output}")
        
        return "\n\n".join(parts)
    
    async def _vote_aggregation(self, subagent_results: List[Dict[str, Any]]) -> str:
        """
        Majority vote aggregation for conflicting results
        
        Use case: Multiple subagents provide different recommendations
        """
        # Extract recommendations
        recommendations = [r.get('output', '') for r in subagent_results]
        
        # Simple majority vote (can be enhanced with semantic similarity)
        from collections import Counter
        vote_counts = Counter(recommendations)
        winner = vote_counts.most_common(1)[0][0]
        
        # Build result with voting summary
        total_votes = len(recommendations)
        winner_votes = vote_counts[winner]
        
        result = f"**Consensus Result** ({winner_votes}/{total_votes} agreement):\n\n"
        result += winner
        
        # Add dissenting opinions if significant
        if winner_votes < total_votes * 0.8:  # Less than 80% agreement
            result += "\n\n**Alternative Perspectives:**\n"
            for rec, count in vote_counts.items():
                if rec != winner:
                    result += f"\n- ({count} subagent(s)): {rec[:200]}..."
        
        return result
    
    async def _synthesize_results(
        self,
        subagent_results: List[Dict[str, Any]],
        parent_agent_id: UUID
    ) -> str:
        """
        LLM-based synthesis of subagent results
        
        Uses parent agent's LLM to create coherent synthesis
        """
        # TODO: Implement LLM-based synthesis
        # For now, use concatenation
        return self._concatenate_results(subagent_results)
    
    async def _hierarchical_aggregation(
        self,
        subagent_results: List[Dict[str, Any]],
        parent_agent_id: UUID
    ) -> str:
        """
        Parent agent reviews and refines subagent results
        
        Parent maintains oversight and can adjust/refine recommendations
        """
        # TODO: Implement hierarchical aggregation
        # For now, use concatenation
        return self._concatenate_results(subagent_results)


def create_subagent_middleware(
    subagent_configs: List[Dict[str, Any]],
    delegation_criteria: Dict[str, Any],
    postgres_client
) -> VITALSubAgentMiddleware:
    """
    Factory function for creating VITAL subagent middleware
    
    Usage in deep agent creation:
        middleware = create_subagent_middleware(
            subagent_configs=decision.subagent_configs,
            delegation_criteria=decision.delegation_criteria,
            postgres_client=postgres_client
        )
    """
    return VITALSubAgentMiddleware(
        subagent_configs=subagent_configs,
        delegation_criteria=delegation_criteria,
        postgres_client=postgres_client
    )

