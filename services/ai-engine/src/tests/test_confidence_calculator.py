"""
Smoke tests for ConfidenceCalculator aligned with current implementation.
"""

import pytest

from services.confidence_calculator import ConfidenceCalculator, get_confidence_calculator


@pytest.mark.unit
def test_singleton():
    assert get_confidence_calculator() is get_confidence_calculator()


@pytest.mark.unit
def test_weights_present():
    calc = ConfidenceCalculator()
    assert isinstance(calc.weights, dict)
    assert calc.weights


@pytest.mark.unit
def test_calculator_has_public_methods():
    calc = ConfidenceCalculator()
    assert hasattr(calc, "calculate_confidence")
