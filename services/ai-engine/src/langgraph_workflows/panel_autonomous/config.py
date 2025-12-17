"""
Panel Autonomous Workflow - Configuration

This module defines configuration for panel types, including
default settings that can be overridden from database or environment.
"""

from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field
from enum import Enum


class PanelTypeEnum(str, Enum):
    """Enumeration of supported panel types."""
    STRUCTURED = "structured"
    OPEN = "open"
    SOCRATIC = "socratic"
    ADVERSARIAL = "adversarial"
    DELPHI = "delphi"
    HYBRID = "hybrid"


@dataclass
class PanelTypeConfig:
    """Configuration for a specific panel type."""
    name: str
    description: str
    default_expert_count: int
    min_experts: int
    max_experts: int
    default_rounds: int
    min_rounds: int
    max_rounds: int
    supports_consensus: bool = True
    supports_checkpoints: bool = True
    requires_positions: bool = False  # True for adversarial
    positions: List[str] = field(default_factory=list)  # e.g., ["pro", "con", "moderator"]

    # Expert selection preferences
    expert_selection_method: str = "fusion"  # fusion, keyword, hybrid
    diversity_weight: float = 0.3  # How much to weight expert diversity

    # Consensus settings
    default_consensus_threshold: float = 0.7
    early_termination_enabled: bool = True

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "default_expert_count": self.default_expert_count,
            "min_experts": self.min_experts,
            "max_experts": self.max_experts,
            "default_rounds": self.default_rounds,
            "min_rounds": self.min_rounds,
            "max_rounds": self.max_rounds,
            "supports_consensus": self.supports_consensus,
            "supports_checkpoints": self.supports_checkpoints,
            "requires_positions": self.requires_positions,
            "positions": self.positions,
            "expert_selection_method": self.expert_selection_method,
            "diversity_weight": self.diversity_weight,
            "default_consensus_threshold": self.default_consensus_threshold,
            "early_termination_enabled": self.early_termination_enabled,
        }


# =============================================================================
# DEFAULT PANEL TYPE CONFIGURATIONS
# =============================================================================

PANEL_TYPE_CONFIGS: Dict[str, PanelTypeConfig] = {
    "structured": PanelTypeConfig(
        name="Structured Panel",
        description="Formal structured analysis with clear roles and systematic coverage",
        default_expert_count=4,
        min_experts=2,
        max_experts=8,
        default_rounds=2,
        min_rounds=1,
        max_rounds=5,
        supports_consensus=True,
        supports_checkpoints=True,
        requires_positions=False,
        expert_selection_method="fusion",
        diversity_weight=0.4,
        default_consensus_threshold=0.7,
    ),

    "open": PanelTypeConfig(
        name="Open Panel",
        description="Free-form brainstorming with creative exploration",
        default_expert_count=5,
        min_experts=3,
        max_experts=10,
        default_rounds=2,
        min_rounds=1,
        max_rounds=4,
        supports_consensus=True,
        supports_checkpoints=False,
        requires_positions=False,
        expert_selection_method="hybrid",
        diversity_weight=0.5,  # Higher diversity for creativity
        default_consensus_threshold=0.6,
    ),

    "socratic": PanelTypeConfig(
        name="Socratic Panel",
        description="Dialectical questioning to explore assumptions and reasoning",
        default_expert_count=3,
        min_experts=2,
        max_experts=6,
        default_rounds=3,
        min_rounds=2,
        max_rounds=5,
        supports_consensus=True,
        supports_checkpoints=True,
        requires_positions=False,
        expert_selection_method="fusion",
        diversity_weight=0.3,
        default_consensus_threshold=0.65,
    ),

    "adversarial": PanelTypeConfig(
        name="Adversarial Panel",
        description="Pro/con debate format with structured rebuttals",
        default_expert_count=6,  # 2-3 PRO, 2-3 CON, 1 MODERATOR
        min_experts=3,
        max_experts=9,
        default_rounds=2,
        min_rounds=1,
        max_rounds=4,
        supports_consensus=True,
        supports_checkpoints=True,
        requires_positions=True,
        positions=["pro", "con", "moderator"],
        expert_selection_method="fusion",
        diversity_weight=0.2,  # Lower diversity - we want experts on each side
        default_consensus_threshold=0.5,  # Lower threshold - disagreement expected
    ),

    "delphi": PanelTypeConfig(
        name="Delphi Panel",
        description="Anonymous expert consensus with iterative voting",
        default_expert_count=5,
        min_experts=3,
        max_experts=12,
        default_rounds=3,
        min_rounds=2,
        max_rounds=5,
        supports_consensus=True,
        supports_checkpoints=True,
        requires_positions=False,
        expert_selection_method="fusion",
        diversity_weight=0.5,  # High diversity for independent views
        default_consensus_threshold=0.75,  # Higher threshold for true consensus
        early_termination_enabled=True,
    ),

    "hybrid": PanelTypeConfig(
        name="Hybrid Panel",
        description="Combined AI-human collaboration with HITL checkpoints",
        default_expert_count=4,
        min_experts=2,
        max_experts=8,
        default_rounds=2,
        min_rounds=1,
        max_rounds=4,
        supports_consensus=True,
        supports_checkpoints=True,  # Always has checkpoints
        requires_positions=False,
        expert_selection_method="hybrid",
        diversity_weight=0.4,
        default_consensus_threshold=0.7,
    ),
}


def get_panel_config(panel_type: str) -> PanelTypeConfig:
    """Get configuration for a panel type."""
    return PANEL_TYPE_CONFIGS.get(panel_type, PANEL_TYPE_CONFIGS["structured"])


def get_all_panel_types() -> List[str]:
    """Get list of all supported panel types."""
    return list(PANEL_TYPE_CONFIGS.keys())


# =============================================================================
# ADVERSARIAL POSITION CONFIGURATION
# =============================================================================

@dataclass
class PositionConfig:
    """Configuration for a position in an adversarial debate."""
    name: str
    role: str
    expert_count: int  # Number of experts in this position
    speaks_in_round: List[int]  # Which rounds this position speaks in (1-indexed)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "role": self.role,
            "expert_count": self.expert_count,
            "speaks_in_round": self.speaks_in_round,
        }


ADVERSARIAL_POSITIONS: Dict[str, PositionConfig] = {
    "pro": PositionConfig(
        name="PRO/Advocate",
        role="Present and defend arguments IN FAVOR of the proposition",
        expert_count=2,
        speaks_in_round=[1, 2, 3, 4],  # Speaks in all rounds
    ),
    "con": PositionConfig(
        name="CON/Critic",
        role="Present and defend arguments AGAINST the proposition",
        expert_count=2,
        speaks_in_round=[1, 2, 3, 4],  # Speaks in all rounds
    ),
    "moderator": PositionConfig(
        name="Moderator/Synthesizer",
        role="Synthesize arguments and provide balanced assessment",
        expert_count=1,
        speaks_in_round=[2, 3, 4],  # Speaks after initial arguments
    ),
}


def get_position_config(position: str) -> PositionConfig:
    """Get configuration for an adversarial position."""
    return ADVERSARIAL_POSITIONS.get(position, ADVERSARIAL_POSITIONS["pro"])


# =============================================================================
# COST CONFIGURATION
# =============================================================================

@dataclass
class ModelCostConfig:
    """Cost configuration for LLM models."""
    model_id: str
    input_cost_per_1k: float  # $ per 1000 input tokens
    output_cost_per_1k: float  # $ per 1000 output tokens
    context_window: int

    def estimate_cost(self, input_tokens: int, output_tokens: int) -> float:
        """Estimate cost for a request."""
        input_cost = (input_tokens / 1000) * self.input_cost_per_1k
        output_cost = (output_tokens / 1000) * self.output_cost_per_1k
        return input_cost + output_cost


MODEL_COSTS: Dict[str, ModelCostConfig] = {
    "gpt-4-turbo": ModelCostConfig(
        model_id="gpt-4-turbo",
        input_cost_per_1k=0.01,
        output_cost_per_1k=0.03,
        context_window=128000,
    ),
    "gpt-4o": ModelCostConfig(
        model_id="gpt-4o",
        input_cost_per_1k=0.005,
        output_cost_per_1k=0.015,
        context_window=128000,
    ),
    "gpt-4o-mini": ModelCostConfig(
        model_id="gpt-4o-mini",
        input_cost_per_1k=0.00015,
        output_cost_per_1k=0.0006,
        context_window=128000,
    ),
    "gpt-3.5-turbo": ModelCostConfig(
        model_id="gpt-3.5-turbo",
        input_cost_per_1k=0.0005,
        output_cost_per_1k=0.0015,
        context_window=16000,
    ),
    "claude-3-opus": ModelCostConfig(
        model_id="claude-3-opus",
        input_cost_per_1k=0.015,
        output_cost_per_1k=0.075,
        context_window=200000,
    ),
    "claude-3-sonnet": ModelCostConfig(
        model_id="claude-3-sonnet",
        input_cost_per_1k=0.003,
        output_cost_per_1k=0.015,
        context_window=200000,
    ),
}


def get_model_cost_config(model_id: str) -> ModelCostConfig:
    """Get cost configuration for a model."""
    # Default to gpt-4o-mini if model not found
    return MODEL_COSTS.get(model_id, MODEL_COSTS["gpt-4o-mini"])
