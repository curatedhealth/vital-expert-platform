"""
Utils Package

Shared utilities for the AI Engine.
"""

from utils.optional_imports import (
    SPACY_AVAILABLE,
    TORCH_AVAILABLE,
    TRANSFORMERS_AVAILABLE,
    spacy,
    torch,
    transformers,
    Doc,
    load_spacy_model,
    get_device,
    check_optional_dependencies,
    log_dependency_status,
)

__all__ = [
    "SPACY_AVAILABLE",
    "TORCH_AVAILABLE",
    "TRANSFORMERS_AVAILABLE",
    "spacy",
    "torch",
    "transformers",
    "Doc",
    "load_spacy_model",
    "get_device",
    "check_optional_dependencies",
    "log_dependency_status",
]
