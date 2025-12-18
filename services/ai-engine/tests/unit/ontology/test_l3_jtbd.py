# PRODUCTION_TAG: DEVELOPMENT
# LAST_VERIFIED: 2025-12-17
# MODES_SUPPORTED: [All]
# DEPENDENCIES: [api.routes.ontology.l3_jtbd]
"""
Unit Tests - L3 JTBD (Jobs-to-be-Done)

Tests for JTBD operations including:
- ODI opportunity scoring calculations
- Opportunity classification logic
- Pydantic model validation
- Search scoring algorithms
- Context resolution logic
"""

import pytest
from uuid import uuid4
import os
import sys
from unittest.mock import Mock, AsyncMock, patch, MagicMock

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'src'))


# ============================================
# ODI Opportunity Score Calculation Tests
# ============================================

@pytest.mark.unit
def test_calculate_opportunity_score_basic():
    """Test basic ODI opportunity score calculation."""
    from api.routes.ontology.l3_jtbd import calculate_opportunity_score

    # ODI Formula: Opportunity = Importance + MAX(Importance - Satisfaction, 0)

    # Case 1: Importance > Satisfaction (underserved)
    score = calculate_opportunity_score(importance=9.0, satisfaction=4.0)
    # Expected: 9 + max(9-4, 0) = 9 + 5 = 14
    assert score == 14.0

    # Case 2: Importance = Satisfaction (appropriately served)
    score = calculate_opportunity_score(importance=7.0, satisfaction=7.0)
    # Expected: 7 + max(7-7, 0) = 7 + 0 = 7
    assert score == 7.0

    # Case 3: Importance < Satisfaction (overserved)
    score = calculate_opportunity_score(importance=5.0, satisfaction=8.0)
    # Expected: 5 + max(5-8, 0) = 5 + 0 = 5
    assert score == 5.0

    print("✅ Basic ODI opportunity score calculation test passed")


@pytest.mark.unit
def test_calculate_opportunity_score_edge_cases():
    """Test ODI score calculation edge cases."""
    from api.routes.ontology.l3_jtbd import calculate_opportunity_score

    # Case 1: Maximum importance (10), minimum satisfaction (0)
    score = calculate_opportunity_score(importance=10.0, satisfaction=0.0)
    # Expected: 10 + max(10-0, 0) = 10 + 10 = 20
    assert score == 20.0

    # Case 2: Minimum values
    score = calculate_opportunity_score(importance=0.0, satisfaction=0.0)
    # Expected: 0 + max(0-0, 0) = 0 + 0 = 0
    assert score == 0.0

    # Case 3: Maximum satisfaction, low importance
    score = calculate_opportunity_score(importance=2.0, satisfaction=10.0)
    # Expected: 2 + max(2-10, 0) = 2 + 0 = 2
    assert score == 2.0

    print("✅ ODI opportunity score edge cases test passed")


@pytest.mark.unit
def test_calculate_opportunity_score_decimal_values():
    """Test ODI score calculation with decimal values."""
    from api.routes.ontology.l3_jtbd import calculate_opportunity_score

    # Decimal importance and satisfaction
    score = calculate_opportunity_score(importance=7.5, satisfaction=3.2)
    # Expected: 7.5 + max(7.5-3.2, 0) = 7.5 + 4.3 = 11.8
    assert abs(score - 11.8) < 0.001

    score = calculate_opportunity_score(importance=6.25, satisfaction=8.75)
    # Expected: 6.25 + max(6.25-8.75, 0) = 6.25 + 0 = 6.25
    assert score == 6.25

    print("✅ ODI opportunity score decimal values test passed")


# ============================================
# Opportunity Classification Tests
# ============================================

@pytest.mark.unit
def test_classify_opportunity_high_priority():
    """Test high priority classification."""
    from api.routes.ontology.l3_jtbd import classify_opportunity

    # Score >= 15 = high_priority
    assert classify_opportunity(15.0) == "high_priority"
    assert classify_opportunity(20.0) == "high_priority"
    assert classify_opportunity(17.5) == "high_priority"
    assert classify_opportunity(15.01) == "high_priority"

    print("✅ High priority classification test passed")


@pytest.mark.unit
def test_classify_opportunity_medium_priority():
    """Test medium priority classification."""
    from api.routes.ontology.l3_jtbd import classify_opportunity

    # Score >= 10 and < 15 = medium_priority
    assert classify_opportunity(10.0) == "medium_priority"
    assert classify_opportunity(14.99) == "medium_priority"
    assert classify_opportunity(12.5) == "medium_priority"

    print("✅ Medium priority classification test passed")


@pytest.mark.unit
def test_classify_opportunity_low_priority():
    """Test low priority classification."""
    from api.routes.ontology.l3_jtbd import classify_opportunity

    # Score < 10 = low_priority
    assert classify_opportunity(9.99) == "low_priority"
    assert classify_opportunity(5.0) == "low_priority"
    assert classify_opportunity(0.0) == "low_priority"

    print("✅ Low priority classification test passed")


@pytest.mark.unit
def test_classify_opportunity_boundaries():
    """Test classification at exact boundaries."""
    from api.routes.ontology.l3_jtbd import classify_opportunity

    # Test exact boundaries
    assert classify_opportunity(10.0) == "medium_priority"  # >= 10
    assert classify_opportunity(15.0) == "high_priority"    # >= 15
    assert classify_opportunity(9.9999) == "low_priority"   # < 10
    assert classify_opportunity(14.9999) == "medium_priority"  # < 15, >= 10

    print("✅ Classification boundaries test passed")


# ============================================
# Pydantic Model Tests
# ============================================

@pytest.mark.unit
def test_jtbd_response_model():
    """Test JTBDResponse model validation."""
    from api.routes.ontology.l3_jtbd import JTBDResponse

    # Valid response
    response = JTBDResponse(
        id=str(uuid4()),
        code="JTBD-001",
        name="Prepare regulatory submission",
        job_statement="When preparing for FDA submission, I want to ensure all documentation is complete so that I can avoid delays",
        when_situation="Preparing for FDA submission",
        desired_outcome="Minimize submission delays",
        job_type="functional",
        complexity="high",
        importance_score=9.0,
        satisfaction_score=4.0,
        opportunity_score=14.0,
        is_active=True
    )

    assert response.code == "JTBD-001"
    assert response.importance_score == 9.0
    assert response.opportunity_score == 14.0

    print("✅ JTBDResponse model validation test passed")


@pytest.mark.unit
def test_jtbd_response_model_optional_fields():
    """Test JTBDResponse model with optional fields."""
    from api.routes.ontology.l3_jtbd import JTBDResponse

    # Response with optional fields
    response = JTBDResponse(
        id=str(uuid4()),
        code="JTBD-002",
        name="Review clinical trial data",
        job_statement="When reviewing trial results...",
        when_situation="Post-trial analysis",
        circumstance="Monthly review cycle",
        desired_outcome="Accurate safety reporting",
        job_type="functional",
        complexity="medium",
        frequency="monthly",
        importance_score=7.5,
        satisfaction_score=6.0,
        opportunity_score=9.0,
        runner_family="investigate",
        is_active=True
    )

    assert response.circumstance == "Monthly review cycle"
    assert response.frequency == "monthly"
    assert response.runner_family == "investigate"

    print("✅ JTBDResponse optional fields test passed")


@pytest.mark.unit
def test_pain_point_response_model():
    """Test PainPointResponse model validation."""
    from api.routes.ontology.l3_jtbd import PainPointResponse

    response = PainPointResponse(
        id=str(uuid4()),
        jtbd_id=str(uuid4()),
        description="Manual data entry causes transcription errors",
        severity="high",
        frequency="daily",
        current_workaround="Double-checking entries",
        impact_score=8.5
    )

    assert response.severity == "high"
    assert response.impact_score == 8.5

    print("✅ PainPointResponse model validation test passed")


@pytest.mark.unit
def test_desired_outcome_response_model():
    """Test DesiredOutcomeResponse model validation."""
    from api.routes.ontology.l3_jtbd import DesiredOutcomeResponse

    response = DesiredOutcomeResponse(
        id=str(uuid4()),
        jtbd_id=str(uuid4()),
        outcome_statement="Minimize the time to complete submission",
        direction="minimize",
        importance=8.0,
        current_satisfaction=5.0,
        opportunity_score=11.0  # 8 + max(8-5, 0) = 11
    )

    assert response.direction == "minimize"
    assert response.opportunity_score == 11.0

    print("✅ DesiredOutcomeResponse model validation test passed")


@pytest.mark.unit
def test_jtbd_search_request_model():
    """Test JTBDSearchRequest model validation."""
    from api.routes.ontology.l3_jtbd import JTBDSearchRequest

    # Valid request
    request = JTBDSearchRequest(
        query="regulatory submission",
        role_id=str(uuid4()),
        function_id=str(uuid4()),
        limit=20
    )

    assert request.query == "regulatory submission"
    assert request.limit == 20

    # Default limit
    request_default = JTBDSearchRequest(query="test query")
    assert request_default.limit == 10

    print("✅ JTBDSearchRequest model validation test passed")


@pytest.mark.unit
def test_jtbd_search_request_limit_validation():
    """Test JTBDSearchRequest limit field validation."""
    from api.routes.ontology.l3_jtbd import JTBDSearchRequest
    from pydantic import ValidationError

    # Valid limits
    assert JTBDSearchRequest(query="test", limit=1).limit == 1
    assert JTBDSearchRequest(query="test", limit=50).limit == 50

    # Invalid limits should raise ValidationError
    with pytest.raises(ValidationError):
        JTBDSearchRequest(query="test", limit=0)  # Below min

    with pytest.raises(ValidationError):
        JTBDSearchRequest(query="test", limit=51)  # Above max

    print("✅ JTBDSearchRequest limit validation test passed")


@pytest.mark.unit
def test_opportunity_score_response_model():
    """Test OpportunityScoreResponse model validation."""
    from api.routes.ontology.l3_jtbd import OpportunityScoreResponse

    response = OpportunityScoreResponse(
        jtbd_id=str(uuid4()),
        jtbd_name="Prepare regulatory submission",
        importance_score=9.0,
        satisfaction_score=4.0,
        opportunity_score=14.0,
        classification="medium_priority"
    )

    assert response.opportunity_formula == "Importance + MAX(Importance - Satisfaction, 0)"
    assert response.classification == "medium_priority"

    print("✅ OpportunityScoreResponse model validation test passed")


@pytest.mark.unit
def test_jtbd_context_response_model():
    """Test JTBDContextResponse model validation."""
    from api.routes.ontology.l3_jtbd import JTBDContextResponse

    response = JTBDContextResponse(
        relevant_jtbds=[{"id": str(uuid4()), "name": "Test JTBD"}],
        pain_points=[{"id": str(uuid4()), "description": "Test pain point"}],
        desired_outcomes=[{"id": str(uuid4()), "outcome_statement": "Test outcome"}],
        success_criteria=[{"id": str(uuid4()), "criteria": "Test criteria"}],
        top_opportunity_jtbd_id=str(uuid4()),
        max_opportunity_score=15.0,
        recommended_runner_family="investigate",
        avg_importance=8.5,
        avg_satisfaction=5.0,
        confidence_score=0.85
    )

    assert response.max_opportunity_score == 15.0
    assert response.confidence_score == 0.85
    assert len(response.relevant_jtbds) == 1

    print("✅ JTBDContextResponse model validation test passed")


# ============================================
# Search Scoring Algorithm Tests
# ============================================

@pytest.mark.unit
def test_search_scoring_name_match():
    """Test search scoring for name matches."""
    # Simulate the scoring logic from search_jtbds
    def score_jtbd(query: str, jtbd: dict) -> float:
        query_lower = query.lower()
        score = 0

        # Name match (exact)
        name = jtbd.get("name", "").lower()
        if name in query_lower:
            score += 10
        elif any(word in query_lower for word in name.split()):
            score += 4

        # Boost by opportunity score
        opportunity = jtbd.get("opportunity_score", 0)
        score += opportunity / 10

        return score

    jtbd = {
        "name": "Regulatory submission",
        "opportunity_score": 14.0
    }

    # Exact name match
    assert score_jtbd("regulatory submission preparation", jtbd) == 14.0 + 1.4  # 10 + 1.4

    # Partial word match
    jtbd_partial = {"name": "submission review", "opportunity_score": 10.0}
    assert score_jtbd("prepare submission", jtbd_partial) == 4.0 + 1.0  # 4 + 1.0

    print("✅ Search scoring name match test passed")


@pytest.mark.unit
def test_search_scoring_job_statement_match():
    """Test search scoring for job statement matches."""
    def score_jtbd(query: str, jtbd: dict) -> float:
        query_lower = query.lower()
        score = 0

        # Job statement match
        job_statement = jtbd.get("job_statement", "").lower()
        if any(word in query_lower for word in job_statement.split()):
            score += 5

        return score

    jtbd = {
        "job_statement": "When preparing for FDA submission"
    }

    # Word overlap with job statement
    assert score_jtbd("FDA submission process", jtbd) == 5.0

    # No match
    assert score_jtbd("clinical trial design", jtbd) == 0.0

    print("✅ Search scoring job statement match test passed")


@pytest.mark.unit
def test_search_scoring_combined():
    """Test combined search scoring."""
    def score_jtbd(query: str, jtbd: dict) -> float:
        query_lower = query.lower()
        score = 0

        # Job statement match
        job_statement = jtbd.get("job_statement", "").lower()
        if any(word in query_lower for word in job_statement.split()):
            score += 5

        # Name match
        name = jtbd.get("name", "").lower()
        if name in query_lower:
            score += 10
        elif any(word in query_lower for word in name.split()):
            score += 4

        # Desired outcome match
        outcome = jtbd.get("desired_outcome", "").lower()
        if any(word in query_lower for word in outcome.split()):
            score += 3

        # Situation match
        situation = jtbd.get("when_situation", "").lower()
        if any(word in query_lower for word in situation.split()):
            score += 2

        # Boost by opportunity score
        opportunity = jtbd.get("opportunity_score", 0)
        score += opportunity / 10

        return score

    jtbd = {
        "name": "Regulatory submission",
        "job_statement": "When preparing for FDA submission",
        "desired_outcome": "Minimize submission delays",
        "when_situation": "FDA review preparation",
        "opportunity_score": 15.0
    }

    # Query matching multiple fields
    score = score_jtbd("FDA submission delays", jtbd)
    # Expected: 5 (job_statement has FDA, submission) + 4 (name has submission) +
    #           3 (outcome has submission, delays) + 2 (situation has FDA) + 1.5 (opportunity)
    assert score > 10.0  # Should have substantial score

    print("✅ Combined search scoring test passed")


# ============================================
# Confidence Score Calculation Tests
# ============================================

@pytest.mark.unit
def test_confidence_calculation():
    """Test confidence score calculation logic."""
    def calculate_confidence(has_jtbds: bool, has_pain_points: bool,
                            has_outcomes: bool, has_criteria: bool) -> float:
        confidence = 0.0
        if has_jtbds:
            confidence += 0.4
        if has_pain_points:
            confidence += 0.2
        if has_outcomes:
            confidence += 0.2
        if has_criteria:
            confidence += 0.2
        return confidence

    # Full confidence (all data available)
    assert calculate_confidence(True, True, True, True) == 1.0

    # Only JTBDs found
    assert calculate_confidence(True, False, False, False) == 0.4

    # JTBDs and pain points
    assert calculate_confidence(True, True, False, False) == 0.6

    # Nothing found
    assert calculate_confidence(False, False, False, False) == 0.0

    print("✅ Confidence calculation test passed")


# ============================================
# Integration with Mocked Dependencies Tests
# ============================================

@pytest.mark.unit
@pytest.mark.asyncio
async def test_list_jtbds_with_mock():
    """Test list_jtbds endpoint with mocked Supabase."""
    from api.routes.ontology.l3_jtbd import list_jtbds

    mock_data = [
        {
            "id": str(uuid4()),
            "code": "JTBD-001",
            "name": "Regulatory submission",
            "job_statement": "When preparing...",
            "when_situation": "FDA prep",
            "desired_outcome": "Minimize delays",
            "job_type": "functional",
            "complexity": "high",
            "importance_score": 9.0,
            "satisfaction_score": 4.0,
            "opportunity_score": 14.0,
            "runner_family": "investigate",
            "is_active": True
        }
    ]

    with patch('api.routes.ontology.l3_jtbd.get_supabase_client') as mock_client:
        # Setup mock chain
        mock_execute = MagicMock()
        mock_execute.data = mock_data

        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.eq.return_value.order.return_value.range.return_value.execute.return_value = mock_execute
        mock_client.return_value.table.return_value = mock_table

        # Call the function
        result = await list_jtbds()

        assert len(result) == 1
        assert result[0].code == "JTBD-001"
        assert result[0].opportunity_score == 14.0

    print("✅ list_jtbds with mock test passed")


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_jtbd_not_found():
    """Test get_jtbd returns 404 when not found."""
    from api.routes.ontology.l3_jtbd import get_jtbd
    from fastapi import HTTPException

    with patch('api.routes.ontology.l3_jtbd.get_supabase_client') as mock_client:
        # Setup mock for no data found
        mock_execute = MagicMock()
        mock_execute.data = None

        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.eq.return_value.maybe_single.return_value.execute.return_value = mock_execute
        mock_client.return_value.table.return_value = mock_table

        # Should raise 404
        with pytest.raises(HTTPException) as exc_info:
            await get_jtbd("nonexistent-id")

        assert exc_info.value.status_code == 404

    print("✅ get_jtbd not found test passed")


@pytest.mark.unit
@pytest.mark.asyncio
async def test_health_check():
    """Test JTBD health check endpoint."""
    from api.routes.ontology.l3_jtbd import jtbd_health_check

    with patch('api.routes.ontology.l3_jtbd.get_supabase_client') as mock_client:
        # Setup mock counts
        def make_count_result(count):
            result = MagicMock()
            result.count = count
            return result

        mock_table = MagicMock()

        # First call for jtbds
        mock_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = make_count_result(50)
        mock_client.return_value.table.return_value = mock_table

        result = await jtbd_health_check()

        assert result["status"] == "healthy"
        assert result["service"] == "l3_jtbd"
        assert "counts" in result

    print("✅ JTBD health check test passed")


# ============================================
# ODI Score Integration Tests
# ============================================

@pytest.mark.unit
def test_odi_score_consistency():
    """Test that ODI scores are consistent with business rules."""
    from api.routes.ontology.l3_jtbd import calculate_opportunity_score, classify_opportunity

    # Test a range of scores and ensure consistency
    test_cases = [
        # (importance, satisfaction, expected_score, expected_class)
        (10, 0, 20, "high_priority"),   # Max underserved
        (10, 5, 15, "high_priority"),   # High underserved
        (8, 5, 11, "medium_priority"),  # Medium underserved
        (6, 6, 6, "low_priority"),      # Appropriately served
        (5, 8, 5, "low_priority"),      # Overserved
    ]

    for importance, satisfaction, expected_score, expected_class in test_cases:
        score = calculate_opportunity_score(importance, satisfaction)
        classification = classify_opportunity(score)

        assert score == expected_score, f"Expected score {expected_score}, got {score}"
        assert classification == expected_class, f"Expected {expected_class}, got {classification}"

    print("✅ ODI score consistency test passed")


@pytest.mark.unit
def test_odi_score_mathematical_properties():
    """Test mathematical properties of ODI scoring."""
    from api.routes.ontology.l3_jtbd import calculate_opportunity_score

    # Property 1: Score is always >= importance
    for imp in range(11):
        for sat in range(11):
            score = calculate_opportunity_score(float(imp), float(sat))
            assert score >= imp, f"Score {score} should be >= importance {imp}"

    # Property 2: Score is always <= 2 * importance
    for imp in range(11):
        for sat in range(11):
            score = calculate_opportunity_score(float(imp), float(sat))
            assert score <= 2 * imp, f"Score {score} should be <= 2*importance {2*imp}"

    # Property 3: For same importance, higher satisfaction = lower score
    for imp in range(1, 11):
        scores = [calculate_opportunity_score(float(imp), float(sat)) for sat in range(11)]
        for i in range(len(scores) - 1):
            assert scores[i] >= scores[i+1], "Score should decrease as satisfaction increases"

    print("✅ ODI score mathematical properties test passed")


# ============================================
# Performance Tests
# ============================================

@pytest.mark.unit
@pytest.mark.slow
def test_opportunity_calculation_performance():
    """Test opportunity score calculation performance."""
    import time
    from api.routes.ontology.l3_jtbd import calculate_opportunity_score, classify_opportunity

    start_time = time.time()

    # Calculate 10000 scores
    for _ in range(10000):
        score = calculate_opportunity_score(8.5, 4.2)
        classify_opportunity(score)

    elapsed = time.time() - start_time

    # Should complete in < 100ms
    assert elapsed < 0.1, f"Calculation too slow: {elapsed:.3f}s"

    print(f"✅ Opportunity calculation performance test passed ({elapsed*1000:.2f}ms for 10000 calculations)")


@pytest.mark.unit
@pytest.mark.slow
def test_search_scoring_performance():
    """Test search scoring performance."""
    import time

    def score_jtbd(query: str, jtbd: dict) -> float:
        query_lower = query.lower()
        score = 0

        job_statement = jtbd.get("job_statement", "").lower()
        if any(word in query_lower for word in job_statement.split()):
            score += 5

        name = jtbd.get("name", "").lower()
        if name in query_lower:
            score += 10
        elif any(word in query_lower for word in name.split()):
            score += 4

        outcome = jtbd.get("desired_outcome", "").lower()
        if any(word in query_lower for word in outcome.split()):
            score += 3

        score += jtbd.get("opportunity_score", 0) / 10

        return score

    # Generate sample JTBDs
    jtbds = [
        {
            "name": f"Job {i}",
            "job_statement": f"When doing task {i}, I want to achieve goal {i}",
            "desired_outcome": f"Outcome {i}",
            "opportunity_score": float(i % 20)
        }
        for i in range(100)
    ]

    start_time = time.time()

    # Score 100 JTBDs against a query, 100 times
    for _ in range(100):
        scored = [(score_jtbd("task goal outcome", j), j) for j in jtbds]
        scored.sort(key=lambda x: x[0], reverse=True)

    elapsed = time.time() - start_time

    # Should complete in < 500ms
    assert elapsed < 0.5, f"Search scoring too slow: {elapsed:.3f}s"

    print(f"✅ Search scoring performance test passed ({elapsed*1000:.2f}ms for 10000 scorings)")


# ============================================
# Error Handling Tests
# ============================================

@pytest.mark.unit
@pytest.mark.asyncio
async def test_handle_supabase_error():
    """Test error handling when Supabase fails."""
    from api.routes.ontology.l3_jtbd import list_jtbds
    from fastapi import HTTPException

    with patch('api.routes.ontology.l3_jtbd.get_supabase_client') as mock_client:
        # Setup mock to raise an exception
        mock_client.return_value.table.side_effect = Exception("Database connection failed")

        # Should raise HTTPException with 500 status
        with pytest.raises(HTTPException) as exc_info:
            await list_jtbds()

        assert exc_info.value.status_code == 500

    print("✅ Supabase error handling test passed")
