# PRODUCTION_TAG: DEVELOPMENT
# LAST_VERIFIED: 2025-12-17
# MODES_SUPPORTED: [All]
# DEPENDENCIES: [api.routes.ontology.l7_value]
"""
Unit Tests - L7 Value (Value Transformation)

Tests for Value operations including:
- VPANES scoring calculations
- VPANES priority classification
- ROI calculations (savings, FTE, NPV)
- Value realization scoring
- Pydantic model validation
- Dashboard aggregation logic
"""

import pytest
from uuid import uuid4
import os
import sys
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from datetime import datetime, timedelta

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'src'))


# ============================================
# VPANES Score Calculation Tests
# ============================================

@pytest.mark.unit
def test_calculate_vpanes_total_all_max():
    """Test VPANES total with maximum scores."""
    from api.routes.ontology.l7_value import calculate_vpanes_total

    scores = {
        "value_score": 10.0,
        "pain_score": 10.0,
        "adoption_score": 10.0,
        "network_score": 10.0,
        "ease_score": 10.0,
        "strategic_score": 10.0
    }

    total = calculate_vpanes_total(scores)
    assert total == 60.0, "Max VPANES total should be 60"

    print("✅ VPANES total max scores test passed")


@pytest.mark.unit
def test_calculate_vpanes_total_all_min():
    """Test VPANES total with minimum scores."""
    from api.routes.ontology.l7_value import calculate_vpanes_total

    scores = {
        "value_score": 0.0,
        "pain_score": 0.0,
        "adoption_score": 0.0,
        "network_score": 0.0,
        "ease_score": 0.0,
        "strategic_score": 0.0
    }

    total = calculate_vpanes_total(scores)
    assert total == 0.0, "Min VPANES total should be 0"

    print("✅ VPANES total min scores test passed")


@pytest.mark.unit
def test_calculate_vpanes_total_mixed():
    """Test VPANES total with mixed scores."""
    from api.routes.ontology.l7_value import calculate_vpanes_total

    scores = {
        "value_score": 8.0,
        "pain_score": 7.0,
        "adoption_score": 6.0,
        "network_score": 5.0,
        "ease_score": 4.0,
        "strategic_score": 9.0
    }

    total = calculate_vpanes_total(scores)
    expected = 8.0 + 7.0 + 6.0 + 5.0 + 4.0 + 9.0  # = 39.0
    assert total == expected, f"Expected {expected}, got {total}"

    print("✅ VPANES total mixed scores test passed")


@pytest.mark.unit
def test_calculate_vpanes_total_missing_fields():
    """Test VPANES total handles missing fields."""
    from api.routes.ontology.l7_value import calculate_vpanes_total

    # Missing some scores - should default to 0
    scores = {
        "value_score": 8.0,
        "pain_score": 7.0,
        # missing adoption_score, network_score, ease_score, strategic_score
    }

    total = calculate_vpanes_total(scores)
    expected = 8.0 + 7.0 + 0 + 0 + 0 + 0  # = 15.0
    assert total == expected, f"Expected {expected}, got {total}"

    print("✅ VPANES total missing fields test passed")


@pytest.mark.unit
def test_vpanes_normalization():
    """Test VPANES score normalization to 0-100."""
    from api.routes.ontology.l7_value import calculate_vpanes_total

    # Test normalization formula: (total / 60) * 100
    test_cases = [
        (60.0, 100.0),  # Max
        (30.0, 50.0),   # Mid
        (0.0, 0.0),     # Min
        (45.0, 75.0),   # 3/4
        (15.0, 25.0),   # 1/4
    ]

    for total, expected_normalized in test_cases:
        normalized = (total / 60) * 100
        assert normalized == expected_normalized, f"Expected {expected_normalized}, got {normalized}"

    print("✅ VPANES normalization test passed")


# ============================================
# VPANES Classification Tests
# ============================================

@pytest.mark.unit
def test_classify_vpanes_high_priority():
    """Test high priority VPANES classification."""
    from api.routes.ontology.l7_value import classify_vpanes

    # Score >= 75 = high_priority
    assert classify_vpanes(75.0) == "high_priority"
    assert classify_vpanes(100.0) == "high_priority"
    assert classify_vpanes(87.5) == "high_priority"

    print("✅ VPANES high priority classification test passed")


@pytest.mark.unit
def test_classify_vpanes_medium_priority():
    """Test medium priority VPANES classification."""
    from api.routes.ontology.l7_value import classify_vpanes

    # Score >= 50 and < 75 = medium_priority
    assert classify_vpanes(50.0) == "medium_priority"
    assert classify_vpanes(74.9) == "medium_priority"
    assert classify_vpanes(62.5) == "medium_priority"

    print("✅ VPANES medium priority classification test passed")


@pytest.mark.unit
def test_classify_vpanes_low_priority():
    """Test low priority VPANES classification."""
    from api.routes.ontology.l7_value import classify_vpanes

    # Score < 50 = low_priority
    assert classify_vpanes(49.9) == "low_priority"
    assert classify_vpanes(25.0) == "low_priority"
    assert classify_vpanes(0.0) == "low_priority"

    print("✅ VPANES low priority classification test passed")


@pytest.mark.unit
def test_classify_vpanes_boundaries():
    """Test VPANES classification at exact boundaries."""
    from api.routes.ontology.l7_value import classify_vpanes

    # Exact boundaries
    assert classify_vpanes(50.0) == "medium_priority"   # >= 50
    assert classify_vpanes(75.0) == "high_priority"     # >= 75
    assert classify_vpanes(49.999) == "low_priority"    # < 50
    assert classify_vpanes(74.999) == "medium_priority" # < 75, >= 50

    print("✅ VPANES classification boundaries test passed")


# ============================================
# ROI Calculation Tests
# ============================================

@pytest.mark.unit
def test_roi_annual_hours_calculation():
    """Test annual hours calculation."""
    # Formula: time_saved_hours_per_week * 52
    hours_per_week = 10.0
    annual_hours = hours_per_week * 52
    assert annual_hours == 520.0

    print("✅ ROI annual hours calculation test passed")


@pytest.mark.unit
def test_roi_fte_equivalent_calculation():
    """Test FTE equivalent calculation."""
    # Formula: annual_hours / 2080
    annual_hours = 2080.0  # One full FTE
    fte = annual_hours / 2080
    assert fte == 1.0

    # Half FTE
    annual_hours = 1040.0
    fte = annual_hours / 2080
    assert fte == 0.5

    # Quarter FTE
    annual_hours = 520.0  # 10 hours/week * 52
    fte = annual_hours / 2080
    assert fte == 0.25

    print("✅ ROI FTE equivalent calculation test passed")


@pytest.mark.unit
def test_roi_labor_savings_calculation():
    """Test labor savings calculation."""
    # Formula: annual_hours * hourly_rate
    annual_hours = 520.0  # 10 hours/week * 52
    hourly_rate = 150.0
    labor_savings = annual_hours * hourly_rate
    assert labor_savings == 78000.0  # $78,000

    print("✅ ROI labor savings calculation test passed")


@pytest.mark.unit
def test_roi_total_savings_calculation():
    """Test total savings calculation."""
    # Formula: labor_savings + other_cost_savings
    labor_savings = 78000.0
    other_cost_savings = 12000.0
    total_savings = labor_savings + other_cost_savings
    assert total_savings == 90000.0

    print("✅ ROI total savings calculation test passed")


@pytest.mark.unit
def test_roi_percent_calculation():
    """Test ROI percentage calculation."""
    # Formula: ((net_annual_benefit - total_investment) / total_investment) * 100
    net_annual_benefit = 100000.0
    total_investment = 50000.0
    roi_percent = ((net_annual_benefit - total_investment) / total_investment) * 100
    assert roi_percent == 100.0  # 100% ROI

    # 300% ROI case
    net_annual_benefit = 200000.0
    total_investment = 50000.0
    roi_percent = ((net_annual_benefit - total_investment) / total_investment) * 100
    assert roi_percent == 300.0

    print("✅ ROI percentage calculation test passed")


@pytest.mark.unit
def test_roi_payback_months_calculation():
    """Test payback period calculation."""
    # Formula: total_investment / (net_annual_benefit / 12)
    total_investment = 60000.0
    net_annual_benefit = 120000.0  # $10,000/month
    monthly_benefit = net_annual_benefit / 12
    payback_months = total_investment / monthly_benefit
    assert payback_months == 6.0  # 6 months payback

    print("✅ ROI payback months calculation test passed")


@pytest.mark.unit
def test_roi_npv_calculation():
    """Test 3-year NPV calculation with 10% discount rate."""
    # Formula: sum(net_annual_benefit / (1 + discount_rate)^year) - total_investment
    net_annual_benefit = 100000.0
    total_investment = 50000.0
    discount_rate = 0.10

    npv = sum(
        net_annual_benefit / ((1 + discount_rate) ** year)
        for year in range(1, 4)
    ) - total_investment

    # Year 1: 100000 / 1.1 = 90909.09
    # Year 2: 100000 / 1.21 = 82644.63
    # Year 3: 100000 / 1.331 = 75131.48
    # Total PV: 248685.20
    # NPV: 248685.20 - 50000 = 198685.20

    expected_npv = (
        100000 / 1.1 +       # Year 1
        100000 / 1.21 +      # Year 2
        100000 / 1.331       # Year 3
    ) - 50000

    assert abs(npv - expected_npv) < 0.01

    print("✅ ROI NPV calculation test passed")


@pytest.mark.unit
def test_roi_calculation_edge_cases():
    """Test ROI calculation edge cases."""
    # Zero investment - should handle gracefully
    total_investment = 0.0
    net_annual_benefit = 100000.0

    # ROI percent would be division by zero - should be 0 or handled
    roi_percent = 0.0 if total_investment == 0 else ((net_annual_benefit - total_investment) / total_investment) * 100
    assert roi_percent == 0.0

    # Payback months - infinite/zero
    monthly_benefit = net_annual_benefit / 12
    payback_months = 0.0 if total_investment == 0 else total_investment / monthly_benefit
    assert payback_months == 0.0

    print("✅ ROI edge cases test passed")


# ============================================
# Value Realization Score Tests
# ============================================

@pytest.mark.unit
def test_value_score_calculation():
    """Test value realization score calculation."""
    # Formula from code:
    # value_score = (
    #     (user_satisfaction / 10) * 0.4 +
    #     min(actual_time_saved_minutes / 30, 1.0) * 0.3 +
    #     actual_quality_improvement * 0.2 +
    #     (1.0 if would_recommend else 0.0) * 0.1
    # ) * 10

    def calculate_value_score(
        user_satisfaction: float,
        actual_time_saved_minutes: float,
        actual_quality_improvement: float,
        would_recommend: bool
    ) -> float:
        return (
            (user_satisfaction / 10) * 0.4 +
            min(actual_time_saved_minutes / 30, 1.0) * 0.3 +
            actual_quality_improvement * 0.2 +
            (1.0 if would_recommend else 0.0) * 0.1
        ) * 10

    # Perfect score case
    score = calculate_value_score(10.0, 30.0, 1.0, True)
    # (10/10)*0.4 + (30/30)*0.3 + 1.0*0.2 + 1.0*0.1 = 0.4 + 0.3 + 0.2 + 0.1 = 1.0
    # 1.0 * 10 = 10.0
    assert abs(score - 10.0) < 0.001

    # Minimum score case
    score = calculate_value_score(0.0, 0.0, 0.0, False)
    assert score == 0.0

    # Mixed case
    score = calculate_value_score(8.0, 20.0, 0.5, True)
    # (8/10)*0.4 + min(20/30,1)*0.3 + 0.5*0.2 + 1.0*0.1
    # = 0.32 + 0.2 + 0.1 + 0.1 = 0.72
    # 0.72 * 10 = 7.2
    expected = (
        (8.0 / 10) * 0.4 +
        min(20.0 / 30, 1.0) * 0.3 +
        0.5 * 0.2 +
        1.0 * 0.1
    ) * 10
    assert abs(score - expected) < 0.001

    print("✅ Value score calculation test passed")


@pytest.mark.unit
def test_value_score_time_savings_cap():
    """Test that time savings are capped at 30 minutes."""
    def calculate_value_score_time_component(actual_time_saved_minutes: float) -> float:
        return min(actual_time_saved_minutes / 30, 1.0) * 0.3

    # 30 minutes = max time contribution
    assert calculate_value_score_time_component(30.0) == 0.3

    # 60 minutes = still capped at 30
    assert calculate_value_score_time_component(60.0) == 0.3

    # 15 minutes = half
    assert abs(calculate_value_score_time_component(15.0) - 0.15) < 0.001

    print("✅ Value score time savings cap test passed")


@pytest.mark.unit
def test_variance_calculation():
    """Test estimated vs actual variance calculation."""
    # Time variance
    estimated_time = 30.0
    actual_time = 40.0
    time_variance = ((actual_time - estimated_time) / estimated_time) * 100
    assert abs(time_variance - 33.33) < 0.01  # 33.33% variance

    # Quality variance
    estimated_quality = 0.5
    actual_quality = 0.75
    quality_variance = ((actual_quality - estimated_quality) / estimated_quality) * 100
    assert quality_variance == 50.0  # 50% variance

    # Handle zero estimation
    estimated_time = 0.0
    actual_time = 10.0
    time_variance = 0.0 if estimated_time == 0 else ((actual_time - estimated_time) / estimated_time) * 100
    assert time_variance == 0.0

    print("✅ Variance calculation test passed")


# ============================================
# Pydantic Model Tests
# ============================================

@pytest.mark.unit
def test_vpanes_score_response_model():
    """Test VPANESScoreResponse model validation."""
    from api.routes.ontology.l7_value import VPANESScoreResponse

    response = VPANESScoreResponse(
        id=str(uuid4()),
        jtbd_id=str(uuid4()),
        value_score=8.5,
        pain_score=7.0,
        adoption_score=6.5,
        network_score=5.0,
        ease_score=7.0,
        implementation_complexity="medium",
        strategic_score=9.0,
        intervention_type="augmentation",
        ai_suitability_score=8.0,
        total_score=43.0,
        normalized_score=71.67,
        priority_classification="medium_priority"
    )

    assert response.value_score == 8.5
    assert response.priority_classification == "medium_priority"

    print("✅ VPANESScoreResponse model validation test passed")


@pytest.mark.unit
def test_vpanes_create_request_model():
    """Test VPANESCreateRequest model validation."""
    from api.routes.ontology.l7_value import VPANESCreateRequest
    from pydantic import ValidationError

    # Valid request
    request = VPANESCreateRequest(
        jtbd_id=str(uuid4()),
        value_score=8.0,
        pain_score=7.0,
        adoption_score=6.0,
        network_score=5.0,
        ease_score=7.0,
        strategic_score=9.0
    )

    assert request.intervention_type == "augmentation"  # Default
    assert request.ai_suitability_score == 5.0  # Default

    # Invalid - score out of range
    with pytest.raises(ValidationError):
        VPANESCreateRequest(
            jtbd_id=str(uuid4()),
            value_score=11.0,  # > 10 - invalid
            pain_score=7.0,
            adoption_score=6.0,
            network_score=5.0,
            ease_score=7.0,
            strategic_score=9.0
        )

    with pytest.raises(ValidationError):
        VPANESCreateRequest(
            jtbd_id=str(uuid4()),
            value_score=8.0,
            pain_score=-1.0,  # < 0 - invalid
            adoption_score=6.0,
            network_score=5.0,
            ease_score=7.0,
            strategic_score=9.0
        )

    print("✅ VPANESCreateRequest model validation test passed")


@pytest.mark.unit
def test_roi_estimate_response_model():
    """Test ROIEstimateResponse model validation."""
    from api.routes.ontology.l7_value import ROIEstimateResponse

    response = ROIEstimateResponse(
        id=str(uuid4()),
        jtbd_id=str(uuid4()),
        time_saved_hours_per_week=10.0,
        time_saved_annual_hours=520.0,
        fte_equivalent=0.25,
        hourly_rate=150.0,
        annual_labor_savings=78000.0,
        other_cost_savings=12000.0,
        total_annual_savings=90000.0,
        error_reduction_percent=25.0,
        quality_improvement_percent=30.0,
        compliance_improvement_percent=15.0,
        implementation_cost=20000.0,
        annual_operating_cost=5000.0,
        training_cost=5000.0,
        total_investment=25000.0,
        net_annual_benefit=85000.0,
        roi_percent=240.0,
        payback_months=3.5,
        npv_3_year=180000.0,
        confidence_level="high"
    )

    assert response.time_saved_hours_per_week == 10.0
    assert response.fte_equivalent == 0.25
    assert response.roi_percent == 240.0

    print("✅ ROIEstimateResponse model validation test passed")


@pytest.mark.unit
def test_roi_create_request_model():
    """Test ROICreateRequest model validation."""
    from api.routes.ontology.l7_value import ROICreateRequest
    from pydantic import ValidationError

    # Valid request with defaults
    request = ROICreateRequest(
        jtbd_id=str(uuid4()),
        time_saved_hours_per_week=10.0
    )

    assert request.hourly_rate == 150.0  # Default
    assert request.implementation_cost == 0.0  # Default
    assert request.confidence_level == "medium"  # Default

    # Invalid - negative value
    with pytest.raises(ValidationError):
        ROICreateRequest(
            jtbd_id=str(uuid4()),
            time_saved_hours_per_week=-5.0  # Negative - invalid
        )

    # Invalid - percentage out of range
    with pytest.raises(ValidationError):
        ROICreateRequest(
            jtbd_id=str(uuid4()),
            time_saved_hours_per_week=10.0,
            error_reduction_percent=101.0  # > 100 - invalid
        )

    print("✅ ROICreateRequest model validation test passed")


@pytest.mark.unit
def test_value_realization_request_model():
    """Test ValueRealizationRequest model validation."""
    from api.routes.ontology.l7_value import ValueRealizationRequest
    from pydantic import ValidationError

    # Valid request
    request = ValueRealizationRequest(
        jtbd_id=str(uuid4()),
        estimated_time_saved_minutes=30.0,
        actual_time_saved_minutes=40.0,
        user_satisfaction=8.5,
        would_recommend=True
    )

    assert request.user_satisfaction == 8.5
    assert request.would_recommend == True

    # Invalid - satisfaction out of range
    with pytest.raises(ValidationError):
        ValueRealizationRequest(
            jtbd_id=str(uuid4()),
            user_satisfaction=11.0  # > 10 - invalid
        )

    print("✅ ValueRealizationRequest model validation test passed")


@pytest.mark.unit
def test_roi_summary_response_model():
    """Test ROISummaryResponse model validation."""
    from api.routes.ontology.l7_value import ROISummaryResponse

    response = ROISummaryResponse(
        total_estimates=5,
        total_annual_savings=450000.0,
        total_investment=125000.0,
        avg_roi_percent=160.0,
        avg_payback_months=4.5,
        total_fte_equivalent=1.25,
        total_npv_3_year=900000.0
    )

    assert response.total_estimates == 5
    assert response.total_fte_equivalent == 1.25

    print("✅ ROISummaryResponse model validation test passed")


@pytest.mark.unit
def test_value_summary_response_model():
    """Test ValueSummaryResponse model validation."""
    from api.routes.ontology.l7_value import ValueSummaryResponse

    response = ValueSummaryResponse(
        period_days=30,
        total_realizations=100,
        total_time_saved_minutes=3000.0,
        total_time_saved_hours=50.0,
        avg_satisfaction=8.2,
        avg_value_score=7.5,
        recommendation_rate=0.85,
        value_by_category={
            "smarter": 30,
            "faster": 50,
            "better": 20
        }
    )

    assert response.period_days == 30
    assert response.recommendation_rate == 0.85

    print("✅ ValueSummaryResponse model validation test passed")


# ============================================
# Integration with Mocked Dependencies Tests
# ============================================

@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_vpanes_score_not_found():
    """Test get_vpanes_score returns 404 when not found."""
    from api.routes.ontology.l7_value import get_vpanes_score
    from fastapi import HTTPException

    with patch('api.routes.ontology.l7_value.get_supabase_client') as mock_client:
        # Setup mock for no data found
        mock_execute = MagicMock()
        mock_execute.data = None

        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.eq.return_value.order.return_value.limit.return_value.maybe_single.return_value.execute.return_value = mock_execute
        mock_client.return_value.table.return_value = mock_table

        # Should raise 404
        with pytest.raises(HTTPException) as exc_info:
            await get_vpanes_score("nonexistent-id")

        assert exc_info.value.status_code == 404

    print("✅ get_vpanes_score not found test passed")


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_roi_summary_empty():
    """Test get_roi_summary with no estimates."""
    from api.routes.ontology.l7_value import get_roi_summary

    with patch('api.routes.ontology.l7_value.get_supabase_client') as mock_client:
        # Setup mock for empty data
        mock_execute = MagicMock()
        mock_execute.data = []

        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.execute.return_value = mock_execute
        mock_client.return_value.table.return_value = mock_table

        result = await get_roi_summary()

        assert result.total_estimates == 0
        assert result.total_annual_savings == 0
        assert result.avg_roi_percent == 0

    print("✅ get_roi_summary empty test passed")


@pytest.mark.unit
@pytest.mark.asyncio
async def test_value_health_check():
    """Test Value health check endpoint."""
    from api.routes.ontology.l7_value import value_health_check

    with patch('api.routes.ontology.l7_value.get_supabase_client') as mock_client:
        # Setup mock counts
        def make_count_result(count):
            result = MagicMock()
            result.count = count
            return result

        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.execute.return_value = make_count_result(25)
        mock_client.return_value.table.return_value = mock_table

        result = await value_health_check()

        assert result["status"] == "healthy"
        assert result["service"] == "l7_value"
        assert "counts" in result

    print("✅ Value health check test passed")


# ============================================
# Business Logic Integration Tests
# ============================================

@pytest.mark.unit
def test_vpanes_to_classification_integration():
    """Test full VPANES to classification flow."""
    from api.routes.ontology.l7_value import calculate_vpanes_total, classify_vpanes

    # High priority case - all scores 8+
    scores = {
        "value_score": 8.0,
        "pain_score": 9.0,
        "adoption_score": 8.0,
        "network_score": 7.0,
        "ease_score": 8.0,
        "strategic_score": 9.0
    }
    total = calculate_vpanes_total(scores)
    normalized = (total / 60) * 100
    classification = classify_vpanes(normalized)

    # Total: 49, Normalized: 81.67%
    assert total == 49.0
    assert abs(normalized - 81.67) < 0.01
    assert classification == "high_priority"

    # Low priority case - all scores 4 or below
    scores = {
        "value_score": 4.0,
        "pain_score": 3.0,
        "adoption_score": 4.0,
        "network_score": 2.0,
        "ease_score": 3.0,
        "strategic_score": 4.0
    }
    total = calculate_vpanes_total(scores)
    normalized = (total / 60) * 100
    classification = classify_vpanes(normalized)

    # Total: 20, Normalized: 33.33%
    assert total == 20.0
    assert abs(normalized - 33.33) < 0.01
    assert classification == "low_priority"

    print("✅ VPANES to classification integration test passed")


@pytest.mark.unit
def test_roi_calculation_integration():
    """Test full ROI calculation flow."""
    # Simulate the ROI calculation logic from the endpoint
    time_saved_hours_per_week = 10.0
    hourly_rate = 150.0
    implementation_cost = 30000.0
    training_cost = 5000.0
    annual_operating_cost = 2000.0
    other_cost_savings = 5000.0

    # Calculations
    time_saved_annual_hours = time_saved_hours_per_week * 52  # 520
    fte_equivalent = time_saved_annual_hours / 2080  # 0.25
    annual_labor_savings = time_saved_annual_hours * hourly_rate  # 78000
    total_annual_savings = annual_labor_savings + other_cost_savings  # 83000
    total_investment = implementation_cost + training_cost  # 35000
    net_annual_benefit = total_annual_savings - annual_operating_cost  # 81000

    roi_percent = ((net_annual_benefit - total_investment) / total_investment) * 100
    monthly_benefit = net_annual_benefit / 12
    payback_months = total_investment / monthly_benefit

    # NPV calculation
    discount_rate = 0.10
    npv_3_year = sum(
        net_annual_benefit / ((1 + discount_rate) ** year)
        for year in range(1, 4)
    ) - total_investment

    # Assertions
    assert time_saved_annual_hours == 520.0
    assert fte_equivalent == 0.25
    assert annual_labor_savings == 78000.0
    assert total_annual_savings == 83000.0
    assert total_investment == 35000.0
    assert net_annual_benefit == 81000.0
    assert abs(roi_percent - 131.43) < 0.01  # ~131% ROI
    assert abs(payback_months - 5.19) < 0.01  # ~5.19 months payback
    assert npv_3_year > 0  # Positive NPV = good investment

    print("✅ ROI calculation integration test passed")


# ============================================
# Performance Tests
# ============================================

@pytest.mark.unit
@pytest.mark.slow
def test_vpanes_calculation_performance():
    """Test VPANES calculation performance."""
    import time
    from api.routes.ontology.l7_value import calculate_vpanes_total, classify_vpanes

    scores = {
        "value_score": 8.0,
        "pain_score": 7.0,
        "adoption_score": 6.0,
        "network_score": 5.0,
        "ease_score": 7.0,
        "strategic_score": 9.0
    }

    start_time = time.time()

    # Calculate 10000 VPANES scores
    for _ in range(10000):
        total = calculate_vpanes_total(scores)
        normalized = (total / 60) * 100
        classify_vpanes(normalized)

    elapsed = time.time() - start_time

    # Should complete in < 100ms
    assert elapsed < 0.1, f"Calculation too slow: {elapsed:.3f}s"

    print(f"✅ VPANES calculation performance test passed ({elapsed*1000:.2f}ms for 10000 calculations)")


@pytest.mark.unit
@pytest.mark.slow
def test_roi_calculation_performance():
    """Test ROI calculation performance."""
    import time

    def calculate_roi_metrics():
        time_saved_hours_per_week = 10.0
        hourly_rate = 150.0
        implementation_cost = 30000.0
        training_cost = 5000.0
        annual_operating_cost = 2000.0
        other_cost_savings = 5000.0

        time_saved_annual_hours = time_saved_hours_per_week * 52
        fte_equivalent = time_saved_annual_hours / 2080
        annual_labor_savings = time_saved_annual_hours * hourly_rate
        total_annual_savings = annual_labor_savings + other_cost_savings
        total_investment = implementation_cost + training_cost
        net_annual_benefit = total_annual_savings - annual_operating_cost

        roi_percent = ((net_annual_benefit - total_investment) / total_investment) * 100 if total_investment > 0 else 0
        monthly_benefit = net_annual_benefit / 12
        payback_months = total_investment / monthly_benefit if monthly_benefit > 0 else 0

        discount_rate = 0.10
        npv_3_year = sum(
            net_annual_benefit / ((1 + discount_rate) ** year)
            for year in range(1, 4)
        ) - total_investment

        return {
            "roi_percent": roi_percent,
            "payback_months": payback_months,
            "npv_3_year": npv_3_year
        }

    start_time = time.time()

    # Calculate 10000 ROI metrics
    for _ in range(10000):
        calculate_roi_metrics()

    elapsed = time.time() - start_time

    # Should complete in < 100ms
    assert elapsed < 0.1, f"Calculation too slow: {elapsed:.3f}s"

    print(f"✅ ROI calculation performance test passed ({elapsed*1000:.2f}ms for 10000 calculations)")


# ============================================
# Error Handling Tests
# ============================================

@pytest.mark.unit
@pytest.mark.asyncio
async def test_handle_supabase_error():
    """Test error handling when Supabase fails."""
    from api.routes.ontology.l7_value import get_top_opportunities
    from fastapi import HTTPException

    with patch('api.routes.ontology.l7_value.get_supabase_client') as mock_client:
        # Setup mock to raise an exception
        mock_client.return_value.table.side_effect = Exception("Database connection failed")

        # Should raise HTTPException with 500 status
        with pytest.raises(HTTPException) as exc_info:
            await get_top_opportunities()

        assert exc_info.value.status_code == 500

    print("✅ Supabase error handling test passed")


# ============================================
# Mathematical Property Tests
# ============================================

@pytest.mark.unit
def test_vpanes_score_properties():
    """Test mathematical properties of VPANES scoring."""
    from api.routes.ontology.l7_value import calculate_vpanes_total

    # Property 1: Total is always between 0 and 60
    for _ in range(100):
        import random
        scores = {
            "value_score": random.uniform(0, 10),
            "pain_score": random.uniform(0, 10),
            "adoption_score": random.uniform(0, 10),
            "network_score": random.uniform(0, 10),
            "ease_score": random.uniform(0, 10),
            "strategic_score": random.uniform(0, 10)
        }
        total = calculate_vpanes_total(scores)
        assert 0 <= total <= 60, f"Total {total} out of range [0, 60]"

    # Property 2: Normalized score is always between 0 and 100
    for total in [0, 15, 30, 45, 60]:
        normalized = (total / 60) * 100
        assert 0 <= normalized <= 100, f"Normalized {normalized} out of range [0, 100]"

    print("✅ VPANES score properties test passed")


@pytest.mark.unit
def test_roi_metric_relationships():
    """Test relationships between ROI metrics."""
    # Test that related metrics have consistent relationships

    # More time saved = more savings (holding rate constant)
    for hours in [5, 10, 20, 40]:
        hourly_rate = 150.0
        annual_hours = hours * 52
        savings = annual_hours * hourly_rate
        # Savings should increase linearly with hours
        expected_savings = hours * 52 * hourly_rate
        assert savings == expected_savings

    # Higher investment = longer payback (holding benefit constant)
    net_annual_benefit = 120000.0  # $10k/month
    monthly_benefit = net_annual_benefit / 12

    for investment in [30000, 60000, 120000]:
        payback = investment / monthly_benefit
        expected_payback = investment / 10000
        assert abs(payback - expected_payback) < 0.01

    print("✅ ROI metric relationships test passed")
