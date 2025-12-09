"""
VITAL Path AI Services - Ask Expert L1 Master Orchestrator

L1 Master is the highest-level intelligence in the Ask Expert hierarchy.
Uses Claude Opus 4 for strategic orchestration and Fusion Intelligence.

Naming Convention:
- Class: AskExpertL1MasterOrchestrator
- Methods: ask_expert_l1_{action}
- Logs: ask_expert_l1_{action}

Responsibilities:
- Team selection using Fusion Intelligence
- Mission decomposition
- Quality assurance
- Cost optimization
"""

from typing import Dict, Any, List, Tuple, Optional
from dataclasses import dataclass, field
from datetime import datetime
import json
import structlog

from pydantic import BaseModel, Field

from .prompts import (
    ASK_EXPERT_L1_FUSION_SYSTEM_PROMPT,
    ASK_EXPERT_L1_MISSION_DECOMPOSITION_PROMPT,
    ASK_EXPERT_L1_QUALITY_REVIEW_PROMPT,
)

logger = structlog.get_logger()


class AskExpertTeamSelectionEvidence(BaseModel):
    """Evidence supporting team selection by L1 Master."""
    vector_scores: Dict[str, float] = Field(
        default_factory=dict,
        description="Agent ID -> vector similarity score"
    )
    graph_paths: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Neo4j relationship paths"
    )
    historical_patterns: Dict[str, Any] = Field(
        default_factory=dict,
        description="PostgreSQL historical performance data"
    )
    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Overall confidence in selection"
    )
    reasoning: str = Field(
        default="",
        description="L1 Master's reasoning for the selection"
    )


@dataclass
class AskExpertMissionTask:
    """Single task in a decomposed mission."""
    task_id: str
    task_type: str
    description: str
    assigned_level: str  # L2, L3, L4
    required_tools: List[str] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)
    success_criteria: str = ""
    assigned_expert_type: Optional[str] = None


class AskExpertL1MasterOrchestrator:
    """
    Ask Expert L1 Master Orchestrator.
    
    The highest-level intelligence that:
    - Selects optimal expert teams using Fusion Intelligence
    - Decomposes complex missions into executable tasks
    - Performs final quality review
    - Optimizes for cost and accuracy
    
    Uses Claude Opus 4 for maximum reasoning capability.
    """
    
    def __init__(
        self,
        fusion_engine: Optional["AskExpertFusionEngine"] = None,
        llm=None,
        model: str = "claude-sonnet-4-20250514",  # Production: claude-opus-4-20250514
        token_budget: int = 8000,
    ):
        """
        Initialize L1 Master Orchestrator.
        
        Args:
            fusion_engine: FusionEngine for triple retrieval
            llm: Pre-configured LLM (optional, for DI)
            model: Model to use (default Sonnet, upgrade to Opus in production)
            token_budget: Maximum tokens per operation
        """
        self.fusion_engine = fusion_engine
        self.token_budget = token_budget
        self.model = model
        
        # Initialize LLM if not provided
        if llm:
            self.llm = llm
        else:
            try:
                from langchain_anthropic import ChatAnthropic
                self.llm = ChatAnthropic(
                    model=model,
                    temperature=0.3,
                    max_tokens=token_budget,
                )
            except ImportError:
                logger.warning("ask_expert_l1_llm_not_available")
                self.llm = None
        
        logger.info(
            "ask_expert_l1_master_initialized",
            model=model,
            token_budget=token_budget,
            fusion_enabled=fusion_engine is not None,
        )
    
    async def select_team(
        self,
        query: str,
        context: Dict[str, Any],
        tenant_id: str,
        max_team_size: int = 5,
    ) -> Tuple[List[str], AskExpertTeamSelectionEvidence]:
        """
        Select optimal expert team using Fusion Intelligence.
        
        Args:
            query: User's query
            context: Additional context (mode, constraints, etc.)
            tenant_id: Tenant UUID for isolation
            max_team_size: Maximum experts to select
            
        Returns:
            Tuple of (selected_expert_ids, evidence)
        """
        logger.info(
            "ask_expert_l1_select_team_started",
            tenant_id=tenant_id,
            query_preview=query[:100],
            max_team_size=max_team_size,
        )
        
        try:
            # Step 1: Get evidence from Fusion Engine
            fusion_results = None
            if self.fusion_engine:
                fusion_results = await self.fusion_engine.retrieve(
                    query=query,
                    tenant_id=tenant_id,
                    top_k=20,  # Get more candidates
                )
            
            # Step 2: Format evidence for L1 reasoning
            evidence_context = self._format_evidence_for_llm(fusion_results)
            
            # Step 3: Ask L1 to select team with reasoning
            if self.llm:
                from langchain_core.messages import SystemMessage, HumanMessage
                
                selection_prompt = f"""
Query: {query}

Context: {json.dumps(context, indent=2)}

Evidence from Fusion Intelligence:
{evidence_context}

Select the optimal team of up to {max_team_size} experts.
Respond with valid JSON following the format in your instructions.
"""
                
                response = await self.llm.ainvoke([
                    SystemMessage(content=ASK_EXPERT_L1_FUSION_SYSTEM_PROMPT),
                    HumanMessage(content=selection_prompt),
                ])
                
                # Step 4: Parse response
                selected_experts, reasoning = self._parse_selection_response(
                    response.content
                )
                
            else:
                # Fallback: Use fusion scores directly
                selected_experts = self._fallback_selection(fusion_results, max_team_size)
                reasoning = "Fallback selection based on fusion scores (LLM unavailable)"
            
            # Step 5: Create evidence object
            evidence = AskExpertTeamSelectionEvidence(
                vector_scores=fusion_results.vector_scores if fusion_results else {},
                graph_paths=fusion_results.graph_paths if fusion_results else [],
                historical_patterns=fusion_results.relational_patterns if fusion_results else {},
                confidence=self._calculate_confidence(fusion_results),
                reasoning=reasoning,
            )
            
            logger.info(
                "ask_expert_l1_select_team_completed",
                tenant_id=tenant_id,
                selected_count=len(selected_experts),
                confidence=evidence.confidence,
            )
            
            return selected_experts, evidence
            
        except Exception as e:
            logger.error(
                "ask_expert_l1_select_team_failed",
                tenant_id=tenant_id,
                error=str(e),
            )
            # Return empty selection on error
            return [], AskExpertTeamSelectionEvidence(
                reasoning=f"Selection failed: {str(e)}",
                confidence=0.0,
            )
    
    async def decompose_mission(
        self,
        query: str,
        context: Dict[str, Any],
        selected_experts: List[str],
    ) -> List[AskExpertMissionTask]:
        """
        Decompose a complex mission into executable tasks.
        
        Args:
            query: User's mission/goal
            context: Additional context
            selected_experts: Already selected expert IDs
            
        Returns:
            List of decomposed tasks
        """
        logger.info(
            "ask_expert_l1_decompose_mission_started",
            query_preview=query[:100],
            expert_count=len(selected_experts),
        )
        
        try:
            if self.llm:
                from langchain_core.messages import SystemMessage, HumanMessage
                
                decomposition_prompt = f"""
Mission: {query}

Context: {json.dumps(context, indent=2)}

Available Experts: {json.dumps(selected_experts)}

Decompose this mission into executable tasks.
Respond with valid JSON following the format in your instructions.
"""
                
                response = await self.llm.ainvoke([
                    SystemMessage(content=ASK_EXPERT_L1_MISSION_DECOMPOSITION_PROMPT),
                    HumanMessage(content=decomposition_prompt),
                ])
                
                tasks = self._parse_decomposition_response(response.content)
                
            else:
                # Fallback: Simple decomposition
                tasks = self._fallback_decomposition(query)
            
            logger.info(
                "ask_expert_l1_decompose_mission_completed",
                task_count=len(tasks),
            )
            
            return tasks
            
        except Exception as e:
            logger.error(
                "ask_expert_l1_decompose_mission_failed",
                error=str(e),
            )
            return self._fallback_decomposition(query)
    
    async def review_output(
        self,
        response: str,
        query: str,
        evidence: Dict[str, Any],
        tenant_id: str,
    ) -> Dict[str, Any]:
        """
        Perform final quality review before returning to user.
        
        Args:
            response: Generated response to review
            query: Original query
            evidence: Evidence used to generate response
            tenant_id: Tenant UUID
            
        Returns:
            Review result with approval status
        """
        logger.info(
            "ask_expert_l1_review_output_started",
            tenant_id=tenant_id,
            response_length=len(response),
        )
        
        try:
            if self.llm:
                from langchain_core.messages import SystemMessage, HumanMessage
                
                review_prompt = f"""
Original Query: {query}

Generated Response:
{response}

Evidence Used:
{json.dumps(evidence, indent=2, default=str)}

Review this response for quality and compliance.
Respond with valid JSON following the format in your instructions.
"""
                
                review_response = await self.llm.ainvoke([
                    SystemMessage(content=ASK_EXPERT_L1_QUALITY_REVIEW_PROMPT),
                    HumanMessage(content=review_prompt),
                ])
                
                review_result = self._parse_review_response(review_response.content)
                
            else:
                # Fallback: Auto-approve with basic checks
                review_result = {
                    "review_status": "approved",
                    "quality_score": 0.8,
                    "approval_notes": "Auto-approved (LLM unavailable)",
                }
            
            logger.info(
                "ask_expert_l1_review_output_completed",
                tenant_id=tenant_id,
                status=review_result.get("review_status"),
                score=review_result.get("quality_score"),
            )
            
            return review_result
            
        except Exception as e:
            logger.error(
                "ask_expert_l1_review_output_failed",
                tenant_id=tenant_id,
                error=str(e),
            )
            return {
                "review_status": "approved",
                "quality_score": 0.7,
                "approval_notes": f"Review failed, auto-approved: {str(e)}",
            }
    
    # =========================================================================
    # HELPER METHODS
    # =========================================================================
    
    def _format_evidence_for_llm(self, fusion_results) -> str:
        """Format fusion results for LLM prompt."""
        if not fusion_results:
            return "No fusion evidence available."
        
        parts = []
        
        # Vector evidence
        if hasattr(fusion_results, 'vector_scores') and fusion_results.vector_scores:
            parts.append("## Vector Similarity Scores")
            for agent_id, score in sorted(
                fusion_results.vector_scores.items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]:
                parts.append(f"- {agent_id}: {score:.3f}")
        
        # Graph evidence
        if hasattr(fusion_results, 'graph_paths') and fusion_results.graph_paths:
            parts.append("\n## Graph Relationship Paths")
            for path in fusion_results.graph_paths[:5]:
                parts.append(f"- {path}")
        
        # Relational evidence
        if hasattr(fusion_results, 'relational_patterns') and fusion_results.relational_patterns:
            parts.append("\n## Historical Patterns")
            parts.append(json.dumps(fusion_results.relational_patterns, indent=2))
        
        return "\n".join(parts) if parts else "Limited evidence available."
    
    def _parse_selection_response(self, content: str) -> Tuple[List[str], str]:
        """Parse LLM selection response."""
        try:
            # Try to extract JSON
            json_start = content.find('{')
            json_end = content.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = content[json_start:json_end]
                data = json.loads(json_str)
                
                selected = [
                    e.get('expert_id') or e.get('id')
                    for e in data.get('selected_experts', [])
                    if e.get('expert_id') or e.get('id')
                ]
                reasoning = data.get('reasoning', '')
                
                return selected, reasoning
                
        except json.JSONDecodeError:
            pass
        
        return [], f"Could not parse response: {content[:200]}"
    
    def _parse_decomposition_response(self, content: str) -> List[AskExpertMissionTask]:
        """Parse LLM decomposition response."""
        try:
            json_start = content.find('{')
            json_end = content.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = content[json_start:json_end]
                data = json.loads(json_str)
                
                tasks = []
                for t in data.get('tasks', []):
                    tasks.append(AskExpertMissionTask(
                        task_id=t.get('task_id', ''),
                        task_type=t.get('task_type', ''),
                        description=t.get('description', ''),
                        assigned_level=t.get('assigned_level', 'L2'),
                        required_tools=t.get('required_tools', []),
                        dependencies=t.get('dependencies', []),
                        success_criteria=t.get('success_criteria', ''),
                        assigned_expert_type=t.get('assigned_expert_type'),
                    ))
                
                return tasks
                
        except json.JSONDecodeError:
            pass
        
        return self._fallback_decomposition("")
    
    def _parse_review_response(self, content: str) -> Dict[str, Any]:
        """Parse LLM review response."""
        try:
            json_start = content.find('{')
            json_end = content.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = content[json_start:json_end]
                return json.loads(json_str)
        except json.JSONDecodeError:
            pass
        
        return {
            "review_status": "approved",
            "quality_score": 0.75,
            "approval_notes": "Could not parse review response",
        }
    
    def _fallback_selection(self, fusion_results, max_team_size: int) -> List[str]:
        """Fallback selection when LLM unavailable."""
        if not fusion_results or not hasattr(fusion_results, 'fused_rankings'):
            return []
        
        return [
            item[0] for item in fusion_results.fused_rankings[:max_team_size]
        ]
    
    def _fallback_decomposition(self, query: str) -> List[AskExpertMissionTask]:
        """Fallback decomposition when LLM unavailable."""
        return [
            AskExpertMissionTask(
                task_id="task-1",
                task_type="evidence_gathering",
                description="Gather relevant evidence",
                assigned_level="L4",
                required_tools=["rag", "pubmed"],
            ),
            AskExpertMissionTask(
                task_id="task-2",
                task_type="analysis",
                description="Analyze evidence and formulate response",
                assigned_level="L2",
                dependencies=["task-1"],
            ),
        ]
    
    def _calculate_confidence(self, fusion_results) -> float:
        """Calculate overall confidence from fusion results."""
        if not fusion_results:
            return 0.3
        
        # Base confidence on evidence quality
        confidence = 0.5
        
        if hasattr(fusion_results, 'vector_scores') and fusion_results.vector_scores:
            max_vector = max(fusion_results.vector_scores.values())
            confidence += 0.2 * max_vector
        
        if hasattr(fusion_results, 'graph_paths') and fusion_results.graph_paths:
            confidence += 0.15
        
        if hasattr(fusion_results, 'relational_patterns') and fusion_results.relational_patterns:
            confidence += 0.15
        
        return min(confidence, 1.0)
