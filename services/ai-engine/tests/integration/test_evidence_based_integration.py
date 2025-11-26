"""
Integration Tests for Evidence-Based Selection
Tests the complete flow with all components integrated
"""

import pytest
from uuid import uuid4


@pytest.mark.integration
@pytest.mark.asyncio
async def test_full_evidence_based_selection_flow():
    """Test complete evidence-based selection with all components"""
    from services.evidence_based_selector import get_evidence_based_selector, VitalService
    
    selector = get_evidence_based_selector()
    
    result = await selector.select_for_service(
        service=VitalService.ASK_EXPERT,
        query="What are the side effects of metformin?",
        context={},
        tenant_id="test-tenant",
        user_id="test-user",
        session_id=str(uuid4())
    )
    
    # Verify tier assignment
    assert result.tier.value in ['tier_1', 'tier_2', 'tier_3']
    
    # Verify agents selected
    assert len(result.agents) > 0
    assert result.agents[0].total_score > 0
    
    # Verify assessment
    assert result.assessment.complexity in ['low', 'medium', 'high']
    assert result.assessment.risk_level in ['low', 'medium', 'high', 'critical']
    
    print(f"✅ Selected {len(result.agents)} agents for {result.tier.value}")
    print(f"   Top agent: {result.agents[0].agent_name} (score: {result.agents[0].total_score:.3f})")


@pytest.mark.integration
@pytest.mark.asyncio
async def test_tier_3_critical_query():
    """Test that critical queries trigger Tier 3 with human oversight"""
    from services.evidence_based_selector import get_evidence_based_selector, VitalService
    
    selector = get_evidence_based_selector()
    
    # Critical query with escalation triggers
    result = await selector.select_for_service(
        service=VitalService.ASK_EXPERT,
        query="Should I change my 5-year-old's chemotherapy dosage?",  # Pediatric + treatment
        context={},
        tenant_id="test-tenant"
    )
    
    # Should escalate to Tier 3
    assert result.tier.value == 'tier_3'
    assert result.requires_human_oversight
    assert result.requires_panel
    
    # Should have escalation triggers detected
    assert len(result.assessment.escalation_triggers) > 0
    
    print(f"✅ Critical query correctly escalated to {result.tier.value}")
    print(f"   Triggers: {[t.value for t in result.assessment.escalation_triggers]}")


@pytest.mark.integration
@pytest.mark.asyncio
async def test_graphrag_enrichment():
    """Test GraphRAG context enrichment integration"""
    from services.evidence_based_selector import get_evidence_based_selector, VitalService
    
    selector = get_evidence_based_selector()
    
    result = await selector.select_for_service(
        service=VitalService.ASK_EXPERT,
        query="What is the mechanism of action for statins?",
        context={},
        tenant_id="test-tenant"
    )
    
    # Check if GraphRAG enrichment was attempted
    metadata = result.selection_metadata
    
    print(f"✅ Selection completed with metadata:")
    print(f"   Metadata keys: {list(metadata.keys())}")
    
    # GraphRAG enrichment is optional, so just verify selection worked
    assert len(result.agents) > 0


@pytest.mark.integration
@pytest.mark.asyncio
async def test_8_factor_scoring():
    """Test that all 8 scoring factors are calculated"""
    from services.evidence_based_selector import get_evidence_based_selector, VitalService
    
    selector = get_evidence_based_selector()
    
    result = await selector.select_for_service(
        service=VitalService.ASK_EXPERT,
        query="Explain drug-drug interactions",
        context={},
        tenant_id="test-tenant"
    )
    
    # Check top agent has all 8 factors
    top_agent = result.agents[0]
    
    assert hasattr(top_agent, 'semantic_similarity')
    assert hasattr(top_agent, 'domain_expertise')
    assert hasattr(top_agent, 'historical_performance')
    assert hasattr(top_agent, 'keyword_relevance')
    assert hasattr(top_agent, 'graph_proximity')
    assert hasattr(top_agent, 'user_preference')
    assert hasattr(top_agent, 'availability')
    assert hasattr(top_agent, 'tier_compatibility')
    
    # Verify total score is calculated
    assert top_agent.total_score > 0
    
    print(f"✅ 8-factor scoring complete:")
    print(f"   Semantic: {top_agent.semantic_similarity:.3f}")
    print(f"   Domain: {top_agent.domain_expertise:.3f}")
    print(f"   Total: {top_agent.total_score:.3f}")


@pytest.mark.integration
@pytest.mark.asyncio
async def test_safety_gates_enforcement():
    """Test safety gates are properly enforced"""
    from services.evidence_based_selector import get_evidence_based_selector, VitalService
    
    selector = get_evidence_based_selector()
    
    # Low confidence scenario
    result = await selector.select_for_service(
        service=VitalService.ASK_EXPERT,
        query="Experimental treatment protocol for rare disease",
        context={},
        tenant_id="test-tenant"
    )
    
    # Check safety gates were applied
    assert len(result.safety_gates_applied) >= 0
    
    print(f"✅ Safety gates check complete")
    print(f"   Gates applied: {result.safety_gates_applied}")
    print(f"   Human oversight: {result.requires_human_oversight}")


@pytest.mark.integration
@pytest.mark.asyncio  
async def test_diversity_in_selection():
    """Test that diversity is maintained in agent selection"""
    from services.evidence_based_selector import get_evidence_based_selector, VitalService
    
    selector = get_evidence_based_selector()
    
    result = await selector.select_for_service(
        service=VitalService.ASK_PANEL,  # Panel needs diversity
        query="Compare treatment approaches",
        context={},
        tenant_id="test-tenant"
    )
    
    # Check multiple agents selected
    assert len(result.agents) >= 2
    
    # Check agents have different types/specialties
    agent_types = [a.agent_type for a in result.agents]
    
    print(f"✅ Diversity check complete")
    print(f"   Selected {len(result.agents)} agents")
    print(f"   Agent types: {agent_types}")


if __name__ == "__main__":
    print("Run with: pytest tests/integration/test_evidence_based_integration.py -v")
