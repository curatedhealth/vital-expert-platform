"""
Optional Imports Utility

Centralized handling of optional dependencies with graceful degradation.
This prevents recurring import issues across multiple files.

Usage:
    from utils.optional_imports import SPACY_AVAILABLE, spacy, load_spacy_model

Created: 2025-12-02
"""

import logging
from typing import Optional, Any

logger = logging.getLogger(__name__)

# ============================================================================
# SPACY - Optional NLP Library
# ============================================================================

SPACY_AVAILABLE = False
spacy: Optional[Any] = None
Doc: Optional[Any] = None

try:
    import spacy as _spacy
    from spacy.tokens import Doc as _Doc
    spacy = _spacy
    Doc = _Doc
    SPACY_AVAILABLE = True
    logger.info("spaCy is available")
except ImportError:
    logger.warning("spaCy not installed - NLP features will be limited")


def load_spacy_model(preferred_model: str = "en_core_sci_md") -> Optional[Any]:
    """
    Load a spaCy model with fallback chain.

    Args:
        preferred_model: Preferred model name (default: scispaCy medical model)

    Returns:
        Loaded spaCy model or None if unavailable

    Fallback chain:
    1. en_core_sci_md (scispaCy medical model)
    2. en_core_web_sm (standard English model)
    3. None (graceful degradation)
    """
    if not SPACY_AVAILABLE:
        logger.warning("Cannot load spaCy model - spaCy not installed")
        return None

    # Try preferred model first
    try:
        # Try direct import for scispaCy models
        if preferred_model == "en_core_sci_md":
            try:
                import en_core_sci_md
                model = en_core_sci_md.load()
                logger.info(f"Loaded spaCy model: {preferred_model} (direct import)")
                return model
            except (ImportError, ModuleNotFoundError):
                pass

        # Try standard load
        model = spacy.load(preferred_model)
        logger.info(f"Loaded spaCy model: {preferred_model}")
        return model
    except OSError as e:
        logger.warning(f"Could not load {preferred_model}: {e}")

    # Fallback to en_core_web_sm
    if preferred_model != "en_core_web_sm":
        try:
            model = spacy.load("en_core_web_sm")
            logger.info("Loaded fallback spaCy model: en_core_web_sm")
            return model
        except OSError as e:
            logger.warning(f"Could not load en_core_web_sm: {e}")

    logger.warning("No spaCy models available - NLP features will be limited")
    return None


# ============================================================================
# TORCH - Deep Learning Framework
# ============================================================================

TORCH_AVAILABLE = False
torch: Optional[Any] = None

try:
    import torch as _torch
    torch = _torch
    TORCH_AVAILABLE = True
    logger.info(f"PyTorch is available (CUDA: {_torch.cuda.is_available()})")
except ImportError:
    logger.warning("PyTorch not installed - ML features will be limited")


def get_device() -> str:
    """
    Get the best available device for ML inference.

    Returns:
        'cuda' if GPU available, otherwise 'cpu'
    """
    if TORCH_AVAILABLE and torch.cuda.is_available():
        return "cuda"
    return "cpu"


# ============================================================================
# TRANSFORMERS - Hugging Face Models
# ============================================================================

TRANSFORMERS_AVAILABLE = False
transformers: Optional[Any] = None

try:
    import transformers as _transformers
    transformers = _transformers
    TRANSFORMERS_AVAILABLE = True
    logger.info("Transformers library is available")
except ImportError:
    logger.warning("Transformers not installed - NLP models will be limited")


# ============================================================================
# STARTUP CHECK
# ============================================================================

def check_optional_dependencies() -> dict:
    """
    Check status of all optional dependencies.

    Returns:
        Dict with availability status of each dependency
    """
    status = {
        "spacy": SPACY_AVAILABLE,
        "torch": TORCH_AVAILABLE,
        "torch_cuda": TORCH_AVAILABLE and torch.cuda.is_available() if torch else False,
        "transformers": TRANSFORMERS_AVAILABLE,
    }

    # Check for specific spaCy models
    if SPACY_AVAILABLE:
        status["spacy_models"] = []
        for model_name in ["en_core_sci_md", "en_core_web_sm"]:
            try:
                spacy.load(model_name)
                status["spacy_models"].append(model_name)
            except OSError:
                pass

    return status


def log_dependency_status():
    """Log the status of all optional dependencies."""
    status = check_optional_dependencies()

    logger.info("=" * 50)
    logger.info("Optional Dependencies Status:")
    logger.info(f"  spaCy: {'Available' if status['spacy'] else 'Not installed'}")
    if status.get("spacy_models"):
        logger.info(f"  spaCy models: {', '.join(status['spacy_models'])}")
    logger.info(f"  PyTorch: {'Available' if status['torch'] else 'Not installed'}")
    if status['torch']:
        logger.info(f"  PyTorch CUDA: {'Available' if status['torch_cuda'] else 'Not available'}")
    logger.info(f"  Transformers: {'Available' if status['transformers'] else 'Not installed'}")
    logger.info("=" * 50)
