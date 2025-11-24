"""
Tests for Evidence-Based Agent Selector

Test Coverage:
- Query assessment (complexity, risk, escalation triggers)
- Tier determination (Tier 1/2/3)
- 8-factor scoring matrix
- Safety gates and escalation
- Service-specific constraints
- Integration with GraphRAG
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch
from datetime import datetime

from services.evidence_based_selector import (
    EvidenceBasedAgentSelector,
    VitalService,
    AgentTier,
    EscalationTrigger,
    QueryAssessment,
    AgentScore,
    EvidenceBasedSelection,
    TIER_DEFINITIONS
)


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def selector():
    """Create selector instance"""
    with patch('services.evidence_based_selector.AsyncOpenAI'), \
         patch('services.evidence_based_selector.get_supabase_client'):
        return EvidenceBasedAgentSelector()


@pytest.fixture
def mock_graphrag_candidates():
    """Mock GraphRAG search results"""
    return [
        {
            'agent_id': 'agent-1',
            'agent_name': 'Regulatory Expert',
            'agent_type': 'expert',
            'tier': 2,
            'confidence': {
                'overall': 85.0,
                'breakdown': {
                    'postgres': 70.0,
                    'pinecone': 90.0,
                    'neo4j': 60.0
                }
            }
        },
        {
            'agent_id': 'agent-2',
            'agent_name': 'Clinical Specialist',
            'agent_type': 'specialist',
            'tier': 2,
            'confidence': {
                'overall': 80.0,
                'breakdown': {
                    'postgres': 75.0,
                    'pinecone': 85.0,
                    'neo4j': 55.0
                }
            }
        },
        {
            'agent_id': 'agent-3',
            'agent_name': 'General Assistant',
            'agent_type': 'general',
            'tier': 1,
            'confidence': {
                'overall': 70.0,
                'breakdown': {
                    'postgres': 65.0,
                    'pinecone': 75.0,
                    'neo4j': 50.0
                }
            }
        }
    ]


# ============================================================================
# TIER DETERMINATION TESTS
# ============================================================================

def test_tier_definitions():
    """Test that all tier definitions are properly configured"""
    assert len(TIER_DEFINITIONS) == 3
    assert AgentTier.TIER_1 in TIER_DEFINITIONS
    assert AgentTier.TIER_2 in TIER_DEFINITIONS
    assert AgentTier.TIER_3 in TIER_DEFINITIONS
    
    tier1 = TIER_DEFINITIONS[AgentTier.TIER_1]
    assert tier1.name == "Rapid Response"
    assert tier1.max_response_time_seconds == 5
    assert not tier1.requires_human_oversight
    
    tier3 = TIER_DEFINITIONS[AgentTier.TIER_3]
    assert tier3.name == "Deep Reasoning + Human Oversight"
    assert tier3.requires_human_oversight
    assert tier3.requires_panel
    assert tier3.requires_critic


def test_tier_1_determination(selector):
    """Test Tier 1 determination (low complexity, low risk)"""
    assessment = QueryAssessment(
        query="What is the FDA?",
        complexity='low',
        risk_level='low',
        required_accuracy=0.85,
        medical_context=False,
        escalation_triggers=[],
        confidence=0.9,
        reasoning="Simple factual question"
    )
    
    tier = selector._determine_tier(assessment, VitalService.ASK_EXPERT)
    assert tier == AgentTier.TIER_1


def test_tier_2_determination(selector):
    """Test Tier 2 determination (medium complexity)"""
    assessment = QueryAssessment(
        query="Compare FDA and EMA approval processes",
        complexity='medium',
        risk_level='medium',
        required_accuracy=0.92,
        medical_context=True,
        escalation_triggers=[],
        confidence=0.9,
        reasoning="Comparison question"
    )
    
    tier = selector._determine_tier(assessment, VitalService.ASK_EXPERT)
    assert tier == AgentTier.TIER_2


def test_tier_3_determination_high_complexity(selector):
    """Test Tier 3 determination (high complexity)"""
    assessment = QueryAssessment(
        query="Complex clinical decision question",
        complexity='high',
        risk_level='high',
        required_accuracy=0.95,
        medical_context=True,
        escalation_triggers=[],
        confidence=0.9,
        reasoning="Complex clinical scenario"
    )
    
    tier = selector._determine_tier(assessment, VitalService.ASK_EXPERT)
    assert tier == AgentTier.TIER_3


def test_tier_3_determination_escalation_trigger(selector):
    """Test Tier 3 mandatory for escalation triggers"""
    assessment = QueryAssessment(
        query="Simple question with escalation trigger",
        complexity='low',
        risk_level='low',
        required_accuracy=0.85,
        medical_context=True,
        escalation_triggers=[EscalationTrigger.TREATMENT_MODIFICATION],
        confidence=0.9,
        reasoning="Escalation trigger present"
    )
    
    tier = selector._determine_tier(assessment, VitalService.ASK_EXPERT)
    assert tier == AgentTier.TIER_3


def test_tier_3_determination_high_accuracy(selector):
    """Test Tier 3 for high accuracy requirement"""
    assessment = QueryAssessment(
        query="Question requiring very high accuracy",
        complexity='medium',
        risk_level='medium',
        required_accuracy=0.96,
        medical_context=True,
        escalation_triggers=[],
        confidence=0.9,
        reasoning="High accuracy required"
    )
    
    tier = selector._determine_tier(assessment, VitalService.ASK_EXPERT)
    assert tier == AgentTier.TIER_3


# ============================================================================
# 8-FACTOR SCORING TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_8_factor_scoring(selector, mock_graphrag_candidates):
    """Test 8-factor scoring matrix"""
    assessment = QueryAssessment(
        query="Test query",
        complexity='medium',
        risk_level='medium',
        required_accuracy=0.90,
        medical_context=True,
        escalation_triggers=[],
        confidence=0.9,
        reasoning="Test"
    )
    
    # Mock database calls
    selector.supabase.client.table = Mock()
    selector.supabase.client.table.return_value.select.return_value.eq.return_value.single.return_value.execute = AsyncMock(
        return_value=Mock(data={'specialization': 'regulatory', 'metadata': {}})
    )
    
    scored = await selector._score_with_8_factors(
        candidates=mock_graphrag_candidates,
        query="Test query",
        context={},
        assessment=assessment,
        tier=AgentTier.TIER_2,
        user_id="user-1",
        tenant_id="tenant-1"
    )
    
    assert len(scored) == 3
    assert all(isinstance(agent, AgentScore) for agent in scored)
    
    # Check that scores are sorted (highest first)
    for i in range(len(scored) - 1):
        assert scored[i].total_score >= scored[i + 1].total_score
    
    # Check all 8 factors are present
    top_agent = scored[0]
    assert 0.0 <= top_agent.semantic_similarity <= 1.0
    assert 0.0 <= top_agent.domain_expertise <= 1.0
    assert 0.0 <= top_agent.historical_performance <= 1.0
    assert 0.0 <= top_agent.keyword_relevance <= 1.0
    assert 0.0 <= top_agent.graph_proximity <= 1.0
    assert 0.0 <= top_agent.user_preference <= 1.0
    assert 0.0 <= top_agent.availability <= 1.0
    assert 0.0 <= top_agent.tier_compatibility <= 1.0
    
    # Check total score is within valid range
    assert 0.0 <= top_agent.total_score <= 1.0
    assert 0.0 <= top_agent.confidence_score <= 1.0


def test_recommendation_reason_generation(selector):
    """Test recommendation reason generation"""
    reason = selector._generate_recommendation_reason(
        semantic=0.9,
        domain=0.85,
        performance=0.8,
        keyword=0.75,
        graph=0.7,
        tier=0.9
    )
    
    assert isinstance(reason, str)
    assert len(reason) > 0
    assert "strong semantic match" in reason.lower()
    assert "excellent domain expertise" in reason.lower()


# ============================================================================
# SAFETY GATES TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_confidence_threshold_gate(selector):
    """Test confidence threshold safety gate"""
    agents = [
        AgentScore(
            agent_id='agent-1',
            agent_name='High Confidence',
            agent_type='expert',
            total_score=0.85,
            confidence_score=0.85,
            recommendation_reason='Test'
        ),
        AgentScore(
            agent_id='agent-2',
            agent_name='Low Confidence',
            agent_type='general',
            total_score=0.70,
            confidence_score=0.70,
            recommendation_reason='Test'
        )
    ]
    
    assessment = QueryAssessment(
        query="Test",
        complexity='low',
        risk_level='low',
        required_accuracy=0.85,
        medical_context=False,
        escalation_triggers=[],
        confidence=0.9,
        reasoning="Test"
    )
    
    filtered, gates = await selector._apply_safety_gates(
        agents=agents,
        assessment=assessment,
        tier=AgentTier.TIER_1,
        service=VitalService.ASK_EXPERT
    )
    
    # Tier 1 min confidence is 0.75, so agent-2 should pass
    assert len(filtered) == 2
    assert "confidence_threshold" in gates[0]


@pytest.mark.asyncio
async def test_escalation_trigger_gate(selector):
    """Test escalation trigger safety gate"""
    agents = [
        AgentScore(
            agent_id='agent-1',
            agent_name='Test Agent',
            agent_type='expert',
            total_score=0.85,
            confidence_score=0.85,
            recommendation_reason='Test'
        )
    ]
    
    assessment = QueryAssessment(
        query="Test",
        complexity='low',
        risk_level='low',
        required_accuracy=0.85,
        medical_context=True,
        escalation_triggers=[EscalationTrigger.EMERGENCY_SYMPTOMS],
        confidence=0.9,
        reasoning="Emergency detected"
    )
    
    filtered, gates = await selector._apply_safety_gates(
        agents=agents,
        assessment=assessment,
        tier=AgentTier.TIER_3,
        service=VitalService.ASK_EXPERT
    )
    
    assert "escalation_triggers_detected" in gates
    assert "human_oversight_required" in gates
    assert "critic_required" in gates


# ============================================================================
# SERVICE CONSTRAINTS TESTS
# ============================================================================

def test_ask_expert_constraints(selector):
    """Test Ask Expert service constraints (single agent)"""
    agents = [
        AgentScore(
            agent_id=f'agent-{i}',
            agent_name=f'Agent {i}',
            agent_type='expert',
            total_score=0.9 - (i * 0.1),
            confidence_score=0.9 - (i * 0.1),
            recommendation_reason='Test'
        )
        for i in range(5)
    ]
    
    filtered = selector._apply_service_constraints(
        scored_agents=agents,
        service=VitalService.ASK_EXPERT,
        max_agents=1,
        tier=AgentTier.TIER_1
    )
    
    assert len(filtered) == 1
    assert filtered[0].agent_id == 'agent-0'  # Highest score


def test_ask_panel_constraints(selector):
    """Test Ask Panel service constraints (multiple agents)"""
    agents = [
        AgentScore(
            agent_id=f'agent-{i}',
            agent_name=f'Agent {i}',
            agent_type='expert',
            total_score=0.9 - (i * 0.05),
            confidence_score=0.9 - (i * 0.05),
            recommendation_reason='Test'
        )
        for i in range(10)
    ]
    
    filtered = selector._apply_service_constraints(
        scored_agents=agents,
        service=VitalService.ASK_PANEL,
        max_agents=5,
        tier=AgentTier.TIER_2
    )
    
    assert len(filtered) == 5
    assert filtered[0].total_score >= filtered[1].total_score


# ============================================================================
# INTEGRATION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_select_for_service_ask_expert(selector, mock_graphrag_candidates):
    """Test complete flow for Ask Expert service"""
    # Mock LLM query assessment
    selector.openai.chat.completions.create = AsyncMock(
        return_value=Mock(
            choices=[
                Mock(
                    message=Mock(
                        content='{"complexity": "medium", "risk_level": "medium", "required_accuracy": 0.90, "medical_context": true, "escalation_triggers": [], "reasoning": "Standard regulatory question"}'
                    )
                )
            ]
        )
    )
    
    # Mock GraphRAG search
    selector.select_agents = AsyncMock(return_value=mock_graphrag_candidates)
    
    # Mock database calls
    selector.supabase.client.table = Mock()
    selector.supabase.client.table.return_value.select.return_value.eq.return_value.single.return_value.execute = AsyncMock(
        return_value=Mock(data={'specialization': 'regulatory', 'metadata': {}})
    )
    
    selector.supabase.client.table.return_value.insert.return_value.execute = AsyncMock(
        return_value=Mock(data={})
    )
    
    result = await selector.select_for_service(
        service=VitalService.ASK_EXPERT,
        query="What are FDA 510(k) requirements?",
        context={},
        tenant_id="tenant-123",
        user_id="user-456",
        session_id="session-789",
        max_agents=1
    )
    
    assert isinstance(result, EvidenceBasedSelection)
    assert result.service == VitalService.ASK_EXPERT
    assert result.tier in [AgentTier.TIER_1, AgentTier.TIER_2, AgentTier.TIER_3]
    assert len(result.agents) >= 1
    assert isinstance(result.assessment, QueryAssessment)
    assert result.selection_metadata['operation_id']
    assert result.selection_metadata['duration_ms'] >= 0


@pytest.mark.asyncio
async def test_select_for_service_ask_panel(selector, mock_graphrag_candidates):
    """Test complete flow for Ask Panel service"""
    # Mock LLM query assessment
    selector.openai.chat.completions.create = AsyncMock(
        return_value=Mock(
            choices=[
                Mock(
                    message=Mock(
                        content='{"complexity": "high", "risk_level": "high", "required_accuracy": 0.95, "medical_context": true, "escalation_triggers": [], "reasoning": "Complex clinical question"}'
                    )
                )
            ]
        )
    )
    
    # Mock GraphRAG search
    selector.select_agents = AsyncMock(return_value=mock_graphrag_candidates)
    
    # Mock database calls
    selector.supabase.client.table = Mock()
    selector.supabase.client.table.return_value.select.return_value.eq.return_value.single.return_value.execute = AsyncMock(
        return_value=Mock(data={'specialization': 'clinical', 'metadata': {}})
    )
    
    selector.supabase.client.table.return_value.insert.return_value.execute = AsyncMock(
        return_value=Mock(data={})
    )
    
    result = await selector.select_for_service(
        service=VitalService.ASK_PANEL,
        query="Complex clinical question requiring panel",
        context={},
        tenant_id="tenant-123",
        max_agents=5
    )
    
    assert isinstance(result, EvidenceBasedSelection)
    assert result.service == VitalService.ASK_PANEL
    assert result.tier == AgentTier.TIER_3  # High complexity -> Tier 3
    assert result.requires_human_oversight
    assert result.requires_panel
    assert len(result.agents) <= 5


# ============================================================================
# ERROR HANDLING TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_fallback_assessment_on_llm_failure(selector):
    """Test fallback assessment when LLM fails"""
    # Mock LLM failure
    selector.openai.chat.completions.create = AsyncMock(
        side_effect=Exception("LLM API error")
    )
    
    assessment = await selector._assess_query(
        query="Test query",
        context={},
        service=VitalService.ASK_EXPERT
    )
    
    assert isinstance(assessment, QueryAssessment)
    assert assessment.complexity == 'medium'  # Fallback default
    assert assessment.risk_level == 'medium'  # Fallback default
    assert assessment.confidence == 0.5  # Low confidence for fallback


# ============================================================================
# PERFORMANCE TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_selection_performance(selector, mock_graphrag_candidates):
    """Test that selection completes within reasonable time"""
    import time
    
    # Mock all async calls
    selector.openai.chat.completions.create = AsyncMock(
        return_value=Mock(
            choices=[
                Mock(
                    message=Mock(
                        content='{"complexity": "medium", "risk_level": "medium", "required_accuracy": 0.90, "medical_context": true, "escalation_triggers": [], "reasoning": "Test"}'
                    )
                )
            ]
        )
    )
    
    selector.select_agents = AsyncMock(return_value=mock_graphrag_candidates)
    
    selector.supabase.client.table = Mock()
    selector.supabase.client.table.return_value.select.return_value.eq.return_value.single.return_value.execute = AsyncMock(
        return_value=Mock(data={'specialization': 'test', 'metadata': {}})
    )
    
    selector.supabase.client.table.return_value.insert.return_value.execute = AsyncMock(
        return_value=Mock(data={})
    )
    
    start = time.time()
    
    result = await selector.select_for_service(
        service=VitalService.ASK_EXPERT,
        query="Performance test query",
        context={},
        tenant_id="tenant-123",
        max_agents=1
    )
    
    duration = time.time() - start
    
    assert duration < 5.0  # Should complete within 5 seconds (with mocks)
    assert result.selection_metadata['duration_ms'] < 5000

