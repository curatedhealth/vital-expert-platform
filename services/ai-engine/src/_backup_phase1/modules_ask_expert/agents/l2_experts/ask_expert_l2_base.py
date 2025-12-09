"""
VITAL Path AI Services - Ask Expert L2 Domain Expert Base

Base class for all L2 Domain Experts in the Ask Expert hierarchy.
L2 Experts use Claude Sonnet 4 for cost-effective domain reasoning.

Naming Convention:
- Class: AskExpertL2DomainExpert
- Methods: process, spawn_specialist
- Logs: ask_expert_l2_{action}
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime
import structlog

logger = structlog.get_logger()


class AskExpertL2DomainExpert(ABC):
    """
    L2 Domain Expert - Deep expertise in a specific domain.
    
    Responsibilities:
    - Domain-specific reasoning
    - Spawning L3 specialists for sub-tasks
    - Coordinating L4 workers for evidence
    - Producing expert analysis with citations
    
    Uses Claude Sonnet 4 for cost-effective reasoning.
    """
    
    def __init__(
        self,
        expert_id: str,
        domain: str,
        llm=None,
        model: str = "claude-sonnet-4-20250514",
        token_budget: int = 4000,
    ):
        """
        Initialize L2 Domain Expert.
        
        Args:
            expert_id: Unique identifier for this expert
            domain: Domain of expertise
            llm: Pre-configured LLM (for DI)
            model: Model to use
            token_budget: Maximum tokens per operation
        """
        self.expert_id = expert_id
        self.domain = domain
        self.token_budget = token_budget
        self.model = model
        
        if llm:
            self.llm = llm
        else:
            try:
                from langchain_anthropic import ChatAnthropic
                self.llm = ChatAnthropic(
                    model=model,
                    temperature=0.2,
                    max_tokens=token_budget,
                )
            except ImportError:
                logger.warning(
                    "ask_expert_l2_llm_not_available",
                    expert_id=expert_id,
                )
                self.llm = None
        
        logger.info(
            "ask_expert_l2_expert_initialized",
            expert_id=expert_id,
            domain=domain,
            model=model,
        )
    
    @property
    @abstractmethod
    def system_prompt(self) -> str:
        """Domain-specific system prompt."""
        pass
    
    @property
    @abstractmethod
    def capabilities(self) -> List[str]:
        """List of capabilities this expert provides."""
        pass
    
    @property
    def expert_type(self) -> str:
        """Type identifier for this expert."""
        return f"l2_{self.domain}"
    
    async def process(
        self,
        query: str,
        context: Dict[str, Any],
        evidence: Dict[str, Any],
        tenant_id: str,
    ) -> Dict[str, Any]:
        """
        Process query with domain expertise.
        
        Args:
            query: User's query
            context: Retrieved context from L4 workers
            evidence: Evidence from L5 tools
            tenant_id: Tenant UUID
            
        Returns:
            Expert analysis with citations
        """
        logger.info(
            "ask_expert_l2_process_started",
            expert_id=self.expert_id,
            domain=self.domain,
            tenant_id=tenant_id,
        )
        
        try:
            if not self.llm:
                return self._fallback_response(query)
            
            from langchain_core.messages import SystemMessage, HumanMessage
            
            # Build prompt with context and evidence
            analysis_prompt = self._build_analysis_prompt(query, context, evidence)
            
            response = await self.llm.ainvoke([
                SystemMessage(content=self.system_prompt),
                HumanMessage(content=analysis_prompt),
            ])
            
            result = {
                'expert_id': self.expert_id,
                'domain': self.domain,
                'analysis': response.content,
                'citations': self._extract_citations(response.content),
                'confidence': self._assess_confidence(response.content, evidence),
                'timestamp': datetime.utcnow().isoformat(),
            }
            
            logger.info(
                "ask_expert_l2_process_completed",
                expert_id=self.expert_id,
                domain=self.domain,
                response_length=len(response.content),
            )
            
            return result
            
        except Exception as e:
            logger.error(
                "ask_expert_l2_process_failed",
                expert_id=self.expert_id,
                error=str(e),
            )
            return {
                'expert_id': self.expert_id,
                'domain': self.domain,
                'analysis': f"Error processing query: {str(e)}",
                'error': str(e),
            }
    
    def _build_analysis_prompt(
        self,
        query: str,
        context: Dict[str, Any],
        evidence: Dict[str, Any],
    ) -> str:
        """Build the analysis prompt with context and evidence."""
        prompt_parts = [
            f"## Query\n{query}",
        ]
        
        if context:
            prompt_parts.append(f"\n## Context\n{self._format_context(context)}")
        
        if evidence:
            prompt_parts.append(f"\n## Evidence\n{self._format_evidence(evidence)}")
        
        prompt_parts.append(
            "\n## Instructions\n"
            "Provide a thorough analysis based on your domain expertise.\n"
            "- Cite all sources using [1], [2], etc.\n"
            "- Be specific and actionable\n"
            "- Highlight any uncertainties or limitations\n"
            "- Use appropriate medical/regulatory terminology"
        )
        
        return "\n".join(prompt_parts)
    
    def _format_context(self, context: Dict[str, Any]) -> str:
        """Format context for prompt."""
        if isinstance(context, str):
            return context
        return str(context)[:2000]  # Limit context size
    
    def _format_evidence(self, evidence: Dict[str, Any]) -> str:
        """Format evidence for prompt."""
        if isinstance(evidence, str):
            return evidence
        
        parts = []
        for key, value in evidence.items():
            if isinstance(value, list):
                parts.append(f"### {key}")
                for i, item in enumerate(value[:5], 1):
                    parts.append(f"[{i}] {str(item)[:300]}")
            else:
                parts.append(f"### {key}\n{str(value)[:500]}")
        
        return "\n".join(parts)
    
    def _extract_citations(self, content: str) -> List[Dict[str, Any]]:
        """Extract citations from response content."""
        import re
        
        citations = []
        # Find [N] patterns
        matches = re.findall(r'\[(\d+)\]', content)
        
        for match in set(matches):
            citations.append({
                'id': int(match),
                'reference': f"[{match}]",
            })
        
        return sorted(citations, key=lambda x: x['id'])
    
    def _assess_confidence(
        self,
        content: str,
        evidence: Dict[str, Any],
    ) -> float:
        """Assess confidence level of the analysis."""
        # Base confidence
        confidence = 0.7
        
        # Increase for citations
        citation_count = content.count('[')
        if citation_count >= 5:
            confidence += 0.1
        elif citation_count >= 3:
            confidence += 0.05
        
        # Increase for evidence availability
        if evidence:
            confidence += 0.1
        
        # Check for uncertainty language
        uncertainty_words = ['uncertain', 'unclear', 'limited data', 'may', 'might']
        if any(word in content.lower() for word in uncertainty_words):
            confidence -= 0.1
        
        return min(max(confidence, 0.1), 1.0)
    
    def _fallback_response(self, query: str) -> Dict[str, Any]:
        """Fallback response when LLM unavailable."""
        return {
            'expert_id': self.expert_id,
            'domain': self.domain,
            'analysis': f"Unable to process query in {self.domain} domain. LLM not available.",
            'confidence': 0.0,
            'error': 'LLM not available',
        }
    
    async def spawn_specialist(
        self,
        task: str,
        context: Dict[str, Any],
    ) -> "AskExpertL3TaskSpecialist":
        """
        Spawn L3 specialist for specific sub-task.
        
        Args:
            task: Task description
            context: Context for the task
            
        Returns:
            L3 Task Specialist instance
        """
        from modules.ask_expert.agents.l3_specialists import AskExpertL3TaskSpecialist
        
        logger.info(
            "ask_expert_l2_spawn_specialist",
            expert_id=self.expert_id,
            task=task[:100],
        )
        
        return AskExpertL3TaskSpecialist(
            task_type="analysis",
            parent_expert_id=self.expert_id,
        )
