"""
DECIDE Category - Strategic Choice Runners

This category contains atomic cognitive operations for structuring,
generating, analyzing, and making strategic decisions.

Runners (8 total):
    - FrameRunner: Structure decision (decision tree construction)
    - OptionGenRunner: Generate alternatives (divergent exploration)
    - TradeoffRunner: Analyze trade-offs (Pareto frontier analysis)
    - RecommendRunner: Make recommendation (utility maximization)
    - InvestmentRecommenderRunner: Recommend investments
    - PriceStrategistRunner: Develop pricing strategy
    - StudyPrioritizerRunner: Prioritize studies
    - EvidenceBudgetAllocatorRunner: Allocate evidence budget

Core Logic: Game Theory / Decision Trees / Expected Utility Maximization

Each runner is designed for:
    - 60-120 second execution time
    - Single decision operation
    - Stateless operation (no memory between invocations)
    - Composable: Frame → Generate → Tradeoff → Recommend
"""

from .frame_runner import (
    FrameRunner,
    FrameInput,
    FrameOutput,
    DecisionNode,
)
from .option_gen_runner import (
    OptionGenRunner,
    OptionGenInput,
    OptionGenOutput,
    GeneratedOption,
)
from .tradeoff_runner import (
    TradeoffRunner,
    TradeoffInput,
    TradeoffOutput,
    OptionTradeoff,
)
from .recommend_runner import (
    RecommendRunner,
    RecommendInput,
    RecommendOutput,
    OptionRecommendation,
)
from .investment_recommender_runner import (
    InvestmentRecommenderRunner,
    InvestmentRecommenderInput,
    InvestmentRecommenderOutput,
    InvestmentRecommendation,
)
from .price_strategist_runner import (
    PriceStrategistRunner,
    PriceStrategistInput,
    PriceStrategistOutput,
    PriceRecommendation,
)
from .study_prioritizer_runner import (
    StudyPrioritizerRunner,
    StudyPrioritizerInput,
    StudyPrioritizerOutput,
    StudyPriority,
)
from .evidence_budget_runner import (
    EvidenceBudgetAllocatorRunner,
    EvidenceBudgetInput,
    EvidenceBudgetOutput,
    BudgetAllocation,
)

__all__ = [
    # Runners
    "FrameRunner",
    "OptionGenRunner",
    "TradeoffRunner",
    "RecommendRunner",
    # Frame schemas
    "FrameInput",
    "FrameOutput",
    "DecisionNode",
    # OptionGen schemas
    "OptionGenInput",
    "OptionGenOutput",
    "GeneratedOption",
    # Tradeoff schemas
    "TradeoffInput",
    "TradeoffOutput",
    "OptionTradeoff",
    # Recommend schemas
    "RecommendInput",
    "RecommendOutput",
    "OptionRecommendation",
    # Investment Recommender
    "InvestmentRecommenderRunner",
    "InvestmentRecommenderInput",
    "InvestmentRecommenderOutput",
    "InvestmentRecommendation",
    # Price Strategist
    "PriceStrategistRunner",
    "PriceStrategistInput",
    "PriceStrategistOutput",
    "PriceRecommendation",
    # Study Prioritizer
    "StudyPrioritizerRunner",
    "StudyPrioritizerInput",
    "StudyPrioritizerOutput",
    "StudyPriority",
    # Evidence Budget Allocator
    "EvidenceBudgetAllocatorRunner",
    "EvidenceBudgetInput",
    "EvidenceBudgetOutput",
    "BudgetAllocation",
]
