"""
Work Products Services

Business deliverable generation and compliance services.

Components:
- Compliance checking
- Copyright verification
- ROI calculation
- A/B testing framework
"""

from .compliance_service import ComplianceService
from .copyright_checker import CopyrightChecker
from .roi_calculator_service import ROICalculatorService
from .ab_testing_framework import ABTestingFramework

__all__ = [
    "ComplianceService",
    "CopyrightChecker",
    "ROICalculatorService",
    "ABTestingFramework",
]
