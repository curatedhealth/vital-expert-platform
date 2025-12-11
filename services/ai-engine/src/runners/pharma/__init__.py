"""
Pharmaceutical Domain Runners - 6 Families (12 Runners)

Domain Families:
1. FORESIGHT - Trend analysis, forecasting, competitive intelligence
2. BRAND_STRATEGY - Commercial planning, positioning, messaging
3. DIGITAL_HEALTH - Digital therapeutics, RWE, patient engagement
4. MEDICAL_AFFAIRS - KOL engagement, MSL activities, scientific comms
5. MARKET_ACCESS - HEOR, pricing, reimbursement, HTA
6. DESIGN_THINKING - User research, ideation, service design
"""

from .market_access import MarketAccessRunner, MarketAccessAdvancedRunner
from .medical_affairs import MedicalAffairsRunner, MedicalAffairsAdvancedRunner
from .foresight import ForesightRunner, ForesightAdvancedRunner
from .brand_strategy import BrandStrategyRunner, BrandStrategyAdvancedRunner
from .digital_health import DigitalHealthRunner, DigitalHealthAdvancedRunner
from .design_thinking import DesignThinkingRunner, DesignThinkingAdvancedRunner

__all__ = [
    # Market Access
    "MarketAccessRunner",
    "MarketAccessAdvancedRunner",
    # Medical Affairs
    "MedicalAffairsRunner",
    "MedicalAffairsAdvancedRunner",
    # Foresight
    "ForesightRunner",
    "ForesightAdvancedRunner",
    # Brand Strategy
    "BrandStrategyRunner",
    "BrandStrategyAdvancedRunner",
    # Digital Health
    "DigitalHealthRunner",
    "DigitalHealthAdvancedRunner",
    # Design Thinking
    "DesignThinkingRunner",
    "DesignThinkingAdvancedRunner",
]
