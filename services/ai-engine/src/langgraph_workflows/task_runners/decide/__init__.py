"""
DECIDE Category - Strategic Choice Runners

This category contains atomic cognitive operations for structuring,
generating, analyzing, and making strategic decisions.

Runners:
    - FrameRunner: Structure decision (decision tree construction)
    - OptionGenRunner: Generate alternatives (divergent exploration)
    - TradeoffRunner: Analyze trade-offs (Pareto frontier analysis)
    - RecommendRunner: Make recommendation (utility maximization)

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
]
