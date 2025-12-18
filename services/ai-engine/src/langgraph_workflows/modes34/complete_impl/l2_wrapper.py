# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [agents.experts]
"""
L2ExpertWrapper - Enhanced wrapper for L2 Domain Experts with runner integration.

This wrapper:
1. Delegates to existing L2 agents from the agent hierarchy
2. Integrates with the runner registry for cognitive operations
3. Persists results to VirtualFilesystem
4. Tracks token usage and costs
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional, Protocol
from uuid import uuid4

logger = logging.getLogger(__name__)


# ============================================================================
# PROTOCOLS
# ============================================================================

class L2Agent(Protocol):
    """Protocol for L2 agent classes."""
    async def execute(
        self, 
        query: str, 
        context: dict | None = None
    ) -> dict: ...


class RunnerProtocol(Protocol):
    """Protocol for runner classes."""
    async def execute(
        self, 
        input_data: dict, 
        agent_context: dict
    ) -> dict: ...


# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class DelegationResult:
    """Result from L2 expert delegation."""
    expert_type: str
    expert_class: str
    task: str
    summary: str
    full_response: str
    detail_path: str
    sources: list[dict] = field(default_factory=list)
    confidence_score: float = 0.0
    tokens_used: int = 0
    cost_usd: float = 0.0
    runners_used: list[str] = field(default_factory=list)
    l3_specialists: list[str] = field(default_factory=list)
    l4_workers: list[str] = field(default_factory=list)
    l5_tools: list[str] = field(default_factory=list)
    execution_time_ms: int = 0
    metadata: dict = field(default_factory=dict)


@dataclass
class RunnerResult:
    """Result from runner execution."""
    runner_code: str
    output: str
    sources: list[dict] = field(default_factory=list)
    confidence: float = 0.0
    tokens_used: int = 0
    execution_time_ms: int = 0


# ============================================================================
# EXPERT REGISTRY
# ============================================================================

# Map expert types to their classes
# These imports should point to your actual L2 agent implementations
EXPERT_REGISTRY: dict[str, type] = {}

def register_expert(expert_type: str):
    """Decorator to register L2 expert classes."""
    def decorator(cls):
        EXPERT_REGISTRY[expert_type] = cls
        return cls
    return decorator

def _lazy_load_experts():
    """Lazy load expert classes to avoid circular imports."""
    global EXPERT_REGISTRY
    if EXPERT_REGISTRY:
        return
    
    try:
        # Import your actual L2 experts here
        from ...agents.experts.l2_domain_lead import L2DomainLead
        from ...agents.experts.l2_regulatory import L2RegulatoryExpert
        from ...agents.experts.l2_clinical import L2ClinicalExpert
        from ...agents.experts.l2_safety import L2SafetyExpert
        from ...agents.experts.l2_market_access import L2MarketAccessExpert
        from ...agents.experts.l2_medical_affairs import L2MedicalAffairsExpert
        from ...agents.experts.l2_competitive_intel import L2CompetitiveIntelExpert
        
        EXPERT_REGISTRY.update({
            "domain_lead": L2DomainLead,
            "regulatory": L2RegulatoryExpert,
            "clinical": L2ClinicalExpert,
            "safety": L2SafetyExpert,
            "market_access": L2MarketAccessExpert,
            "medical_affairs": L2MedicalAffairsExpert,
            "competitive_intel": L2CompetitiveIntelExpert,
        })
    except ImportError as e:
        logger.warning(f"Could not import some L2 experts: {e}")
        # Fallback to domain lead only
        try:
            from ...agents.experts.l2_domain_lead import L2DomainLead
            EXPERT_REGISTRY["domain_lead"] = L2DomainLead
        except ImportError:
            pass


# ============================================================================
# L2 EXPERT WRAPPER
# ============================================================================

class L2ExpertWrapper:
    """
    Wrapper for L2 Domain Experts in Modes 3/4.
    
    Provides:
    - Expert instantiation and caching
    - Runner integration for cognitive operations
    - Result persistence to VirtualFilesystem
    - Token/cost tracking
    - Detailed execution logging
    """
    
    def __init__(
        self,
        vfs: Any | None = None,  # VirtualFilesystem
        runner_registry: Any | None = None,  # RunnerRegistry
        db: Any | None = None  # Database connection
    ):
        self.vfs = vfs
        self.runner_registry = runner_registry
        self.db = db
        self._expert_cache: dict[str, L2Agent] = {}
        
        # Lazy load experts
        _lazy_load_experts()
    
    # -------------------------------------------------------------------------
    # EXPERT MANAGEMENT
    # -------------------------------------------------------------------------
    
    def _get_expert(self, expert_type: str) -> L2Agent:
        """Get or create expert instance."""
        if expert_type not in self._expert_cache:
            expert_class = EXPERT_REGISTRY.get(expert_type)
            
            if not expert_class:
                # Fallback to domain lead
                logger.warning(f"Unknown expert type '{expert_type}', using domain_lead")
                expert_class = EXPERT_REGISTRY.get("domain_lead")
            
            if not expert_class:
                raise ValueError(f"No expert class available for '{expert_type}'")
            
            self._expert_cache[expert_type] = expert_class()
        
        return self._expert_cache[expert_type]
    
    def get_available_experts(self) -> list[str]:
        """Get list of available expert types."""
        _lazy_load_experts()
        return list(EXPERT_REGISTRY.keys())
    
    # -------------------------------------------------------------------------
    # EXECUTION
    # -------------------------------------------------------------------------
    
    async def execute(
        self,
        expert_type: str,
        task: str,
        context: dict | None = None,
        runners: list[str] | None = None
    ) -> DelegationResult:
        """
        Execute a task via L2 expert.
        
        Args:
            expert_type: Type of expert (regulatory, clinical, etc.)
            task: Task description
            context: Additional context (mission_id, workspace_path, etc.)
            runners: Optional list of runner codes to use
        
        Returns:
            DelegationResult with summary, sources, and metadata
        """
        context = context or {}
        mission_id = context.get("mission_id", str(uuid4()))
        workspace_path = context.get("workspace_path", f"/missions/{mission_id}")
        
        start_time = datetime.utcnow()
        logger.info(f"L2 Delegation: {expert_type} executing '{task[:50]}...'")
        
        # Get expert
        expert = self._get_expert(expert_type)
        expert_class_name = expert.__class__.__name__
        
        # Prepare context for expert
        expert_context = {
            **context,
            "mission_id": mission_id,
            "workspace_path": workspace_path,
            "delegation_source": "modes34_wrapper",
        }
        
        # Execute runners first if specified
        runner_results = []
        if runners and self.runner_registry:
            runner_results = await self._execute_runners(runners, task, expert_context)
            # Add runner outputs to context
            expert_context["runner_outputs"] = [
                {"code": r.runner_code, "output": r.output}
                for r in runner_results
            ]
        
        try:
            # Execute via expert
            result = await expert.execute(query=task, context=expert_context)
            
            # Extract data from result
            full_response = result.get("response", "")
            summary = self._extract_summary(full_response, max_words=500)
            sources = self._normalize_sources(result.get("sources", []))
            
            # Calculate execution time
            execution_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            # Persist to workspace
            detail_path = await self._persist_result(
                workspace_path=workspace_path,
                expert_type=expert_type,
                task=task,
                response=full_response,
                sources=sources,
                runner_results=runner_results,
                metadata=result.get("metadata", {})
            )
            
            # Build result
            delegation_result = DelegationResult(
                expert_type=expert_type,
                expert_class=expert_class_name,
                task=task,
                summary=summary,
                full_response=full_response,
                detail_path=detail_path,
                sources=sources,
                confidence_score=result.get("confidence", 0.0),
                tokens_used=result.get("tokens_used", 0) + sum(r.tokens_used for r in runner_results),
                cost_usd=result.get("cost_usd", 0.0),
                runners_used=[r.runner_code for r in runner_results],
                l3_specialists=result.get("specialists_used", []),
                l4_workers=result.get("workers_used", []),
                l5_tools=result.get("tools_used", []),
                execution_time_ms=execution_time_ms,
                metadata={
                    "expert_class": expert_class_name,
                    "context_keys": list(context.keys()),
                    "runner_count": len(runner_results),
                }
            )
            
            logger.info(
                f"L2 Delegation complete: {expert_type} | "
                f"{len(sources)} sources | {execution_time_ms}ms"
            )
            
            return delegation_result
            
        except Exception as e:
            logger.error(f"L2 Delegation failed: {expert_type} - {e}")
            
            # Persist error
            await self._persist_error(
                workspace_path=workspace_path,
                expert_type=expert_type,
                task=task,
                error=str(e)
            )
            
            raise
    
    # -------------------------------------------------------------------------
    # RUNNER INTEGRATION
    # -------------------------------------------------------------------------
    
    async def _execute_runners(
        self,
        runner_codes: list[str],
        task: str,
        context: dict
    ) -> list[RunnerResult]:
        """Execute specified runners before expert."""
        results = []
        
        for code in runner_codes:
            try:
                runner = await self.runner_registry.get(code)
                if not runner:
                    logger.warning(f"Runner '{code}' not found")
                    continue
                
                start = datetime.utcnow()
                output = await runner.execute(
                    input_data={"task": task, "context": context},
                    agent_context={"level": "L2", "expert_type": context.get("expert_type")}
                )
                
                results.append(RunnerResult(
                    runner_code=code,
                    output=output.get("result", ""),
                    sources=output.get("sources", []),
                    confidence=output.get("confidence", 0.0),
                    tokens_used=output.get("tokens_used", 0),
                    execution_time_ms=int((datetime.utcnow() - start).total_seconds() * 1000)
                ))
                
            except Exception as e:
                logger.error(f"Runner '{code}' failed: {e}")
        
        return results
    
    # -------------------------------------------------------------------------
    # PERSISTENCE
    # -------------------------------------------------------------------------
    
    async def _persist_result(
        self,
        workspace_path: str,
        expert_type: str,
        task: str,
        response: str,
        sources: list[dict],
        runner_results: list[RunnerResult],
        metadata: dict
    ) -> str:
        """Persist full result to workspace."""
        if not self.vfs:
            return f"{workspace_path}/{expert_type}_result.md"
        
        timestamp = datetime.utcnow().strftime("%H%M%S")
        filename = f"{expert_type}_{timestamp}.md"
        filepath = f"{workspace_path}/{filename}"
        
        # Format sources
        source_list = "\n".join([
            f"- [{s.get('title', 'Source')}]({s.get('url', '#')})"
            for s in sources
        ]) if sources else "No sources cited"
        
        # Format runner outputs
        runner_section = ""
        if runner_results:
            runner_outputs = "\n\n".join([
                f"### Runner: {r.runner_code}\n{r.output}"
                for r in runner_results
            ])
            runner_section = f"\n\n## Runner Outputs\n\n{runner_outputs}"
        
        content = f"""# {expert_type.replace('_', ' ').title()} Analysis

**Task:** {task}

**Generated:** {datetime.utcnow().isoformat()}

---

## Response

{response}
{runner_section}

---

## Sources ({len(sources)})

{source_list}

---

## Metadata

- Expert Type: {expert_type}
- Runners Used: {', '.join(r.runner_code for r in runner_results) or 'None'}
- Total Tokens: {sum(r.tokens_used for r in runner_results)}

"""
        
        await self.vfs.write_file(filepath, content)
        return filepath
    
    async def _persist_error(
        self,
        workspace_path: str,
        expert_type: str,
        task: str,
        error: str
    ) -> str:
        """Persist error to workspace."""
        if not self.vfs:
            return ""
        
        filepath = f"{workspace_path}/error_{expert_type}.md"
        
        content = f"""# Error in {expert_type.title()} Expert

**Task:** {task}

**Timestamp:** {datetime.utcnow().isoformat()}

## Error

```
{error}
```
"""
        
        await self.vfs.write_file(filepath, content)
        return filepath
    
    # -------------------------------------------------------------------------
    # HELPERS
    # -------------------------------------------------------------------------
    
    def _extract_summary(self, text: str, max_words: int = 500) -> str:
        """Extract summary from full response."""
        if not text:
            return ""
        words = text.split()
        if len(words) <= max_words:
            return text
        return " ".join(words[:max_words]) + "..."
    
    def _normalize_sources(self, sources: Any) -> list[dict]:
        """Normalize sources to consistent format."""
        if not sources:
            return []
        
        normalized = []
        for s in sources:
            if isinstance(s, dict):
                normalized.append({
                    "title": s.get("title", "Unknown"),
                    "url": s.get("url"),
                    "source_type": s.get("source_type", s.get("type")),
                    "relevance_score": s.get("relevance_score"),
                })
            elif isinstance(s, str):
                normalized.append({"title": s})
        
        return normalized


# ============================================================================
# FACTORY
# ============================================================================

def create_l2_wrapper(
    vfs: Any | None = None,
    runner_registry: Any | None = None,
    db: Any | None = None
) -> L2ExpertWrapper:
    """Factory function to create L2ExpertWrapper."""
    return L2ExpertWrapper(
        vfs=vfs,
        runner_registry=runner_registry,
        db=db
    )
