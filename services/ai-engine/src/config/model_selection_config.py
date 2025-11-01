"""
LLM Model Selection Configuration
Defines rules and preferences for intelligent model selection

Configure model selection based on:
- Content type and complexity
- Domain specialization
- Cost vs Quality tradeoffs
- Performance requirements
"""

from typing import Dict, Any
from enum import Enum


class ModelSelectionStrategy(str, Enum):
    """Model selection strategy"""
    QUALITY_FIRST = "quality_first"       # Always use best model
    COST_OPTIMIZED = "cost_optimized"     # Prefer cost-effective models
    BALANCED = "balanced"                  # Balance cost and quality (default)
    DOMAIN_SPECIFIC = "domain_specific"   # Optimize per domain


# ============================================================================
# MODEL SELECTION RULES
# ============================================================================

MODEL_SELECTION_RULES = {
    # MEDICAL DOMAIN
    "medical": {
        "complex": {
            "regulation": "gpt-4-turbo-preview",      # Critical accuracy needed
            "guideline": "gpt-4-turbo-preview",
            "procedure": "gpt-4-turbo-preview",
            "case_study": "gpt-4o-mini",              # Good balance
            "fact": "gpt-4o-mini",
            "definition": "gpt-3.5-turbo"             # Simple lookups
        },
        "moderate": {
            "regulation": "gpt-4o-mini",
            "guideline": "gpt-4o-mini",
            "procedure": "gpt-4o-mini",
            "case_study": "gpt-3.5-turbo",
            "fact": "gpt-3.5-turbo",
            "definition": "gpt-3.5-turbo"
        },
        "simple": {
            "default": "gpt-3.5-turbo"
        }
    },
    
    # REGULATORY DOMAIN
    "regulatory": {
        "complex": {
            "regulation": "gpt-4-turbo-preview",      # Maximum accuracy
            "guideline": "gpt-4-turbo-preview",
            "procedure": "gpt-4-turbo-preview",
            "default": "gpt-4o-mini"
        },
        "moderate": {
            "regulation": "gpt-4-turbo-preview",      # Still critical
            "guideline": "gpt-4o-mini",
            "default": "gpt-4o-mini"
        },
        "simple": {
            "default": "gpt-4o-mini"                  # Regulatory = never use cheapest
        }
    },
    
    # TECHNICAL DOMAIN
    "technical": {
        "complex": {
            "procedure": "gpt-4o-mini",
            "default": "gpt-4o-mini"
        },
        "moderate": {
            "default": "gpt-3.5-turbo"
        },
        "simple": {
            "default": "gpt-3.5-turbo"
        }
    },
    
    # GENERAL DOMAIN
    "general": {
        "complex": {
            "default": "gpt-4o-mini"
        },
        "moderate": {
            "default": "gpt-3.5-turbo"
        },
        "simple": {
            "default": "gpt-3.5-turbo"
        }
    }
}


# ============================================================================
# COST OPTIMIZATION OVERRIDES
# ============================================================================

# When prefer_cost=True, use these more cost-effective alternatives
COST_OPTIMIZED_ALTERNATIVES = {
    "gpt-4-turbo-preview": "gpt-4o-mini",
    "gpt-4": "gpt-4o-mini",
    "gpt-4o-mini": "gpt-3.5-turbo",
    "gpt-3.5-turbo": "gpt-3.5-turbo"  # Already cheapest
}


# ============================================================================
# MODEL CAPABILITIES
# ============================================================================

MODEL_CAPABILITIES = {
    "gpt-4-turbo-preview": {
        "quality_score": 10,
        "speed_score": 6,
        "cost_score": 1,  # Higher cost = lower score
        "max_tokens": 4096,
        "best_for": [
            "complex_medical_analysis",
            "regulatory_compliance",
            "research_synthesis",
            "clinical_decision_support"
        ],
        "strengths": [
            "Highest accuracy",
            "Best reasoning",
            "Medical knowledge depth",
            "Complex context handling"
        ]
    },
    
    "gpt-4": {
        "quality_score": 10,
        "speed_score": 5,
        "cost_score": 0.5,
        "max_tokens": 8192,
        "best_for": [
            "complex_medical_analysis",
            "regulatory_compliance"
        ],
        "strengths": [
            "Highest accuracy",
            "Best reasoning"
        ]
    },
    
    "gpt-4o-mini": {
        "quality_score": 8,
        "speed_score": 9,
        "cost_score": 8,
        "max_tokens": 4096,
        "best_for": [
            "moderate_medical_tasks",
            "general_extraction",
            "fact_verification",
            "entity_extraction"
        ],
        "strengths": [
            "Good accuracy",
            "Fast response",
            "Cost-effective",
            "Balanced performance"
        ]
    },
    
    "gpt-3.5-turbo": {
        "quality_score": 7,
        "speed_score": 10,
        "cost_score": 10,
        "max_tokens": 4096,
        "best_for": [
            "simple_extraction",
            "general_queries",
            "basic_summarization",
            "simple_classification"
        ],
        "strengths": [
            "Very fast",
            "Very cost-effective",
            "Good for simple tasks"
        ]
    }
}


# ============================================================================
# DOMAIN-SPECIFIC REQUIREMENTS
# ============================================================================

DOMAIN_REQUIREMENTS = {
    "medical": {
        "min_quality_score": 8,
        "prefer_accuracy": True,
        "critical_content_types": ["regulation", "guideline", "procedure"]
    },
    
    "regulatory": {
        "min_quality_score": 9,
        "prefer_accuracy": True,
        "critical_content_types": ["regulation", "guideline", "procedure", "compliance"]
    },
    
    "technical": {
        "min_quality_score": 7,
        "prefer_accuracy": False,
        "critical_content_types": ["procedure", "algorithm"]
    },
    
    "general": {
        "min_quality_score": 7,
        "prefer_accuracy": False,
        "critical_content_types": []
    }
}


# ============================================================================
# QUALITY THRESHOLDS
# ============================================================================

QUALITY_THRESHOLDS = {
    # Content types that require high-quality models
    "high_quality_required": [
        "regulation",
        "guideline",
        "procedure",
        "clinical_protocol"
    ],
    
    # Content types that can use cost-effective models
    "cost_effective_ok": [
        "definition",
        "fact",
        "general_info"
    ],
    
    # Minimum confidence scores per model
    "min_confidence": {
        "gpt-4-turbo-preview": 0.9,
        "gpt-4": 0.9,
        "gpt-4o-mini": 0.85,
        "gpt-3.5-turbo": 0.80
    }
}


# ============================================================================
# ADAPTIVE LEARNING (Future Enhancement)
# ============================================================================

# Configuration for future ML-based model selection
ADAPTIVE_LEARNING_CONFIG = {
    "enabled": False,  # Set to True when ML model is ready
    "model_path": None,
    "features": [
        "content_length",
        "domain_keywords_count",
        "complexity_score",
        "historical_model_success_rate"
    ],
    "fallback_to_rules": True  # Fall back to rules if ML fails
}


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_model_for_content(
    domain: str,
    complexity: str,
    content_type: str,
    prefer_cost: bool = False
) -> str:
    """
    Get optimal model based on configuration rules.
    
    Args:
        domain: Domain type
        complexity: Complexity level
        content_type: Content type
        prefer_cost: Whether to prefer cost
        
    Returns:
        Model name
    """
    # Get domain rules
    domain_rules = MODEL_SELECTION_RULES.get(domain, MODEL_SELECTION_RULES["general"])
    
    # Get complexity rules
    complexity_rules = domain_rules.get(complexity, domain_rules.get("simple", {}))
    
    # Get specific model or default
    model = complexity_rules.get(content_type, complexity_rules.get("default", "gpt-4o-mini"))
    
    # Apply cost optimization if requested
    if prefer_cost and model in COST_OPTIMIZED_ALTERNATIVES:
        model = COST_OPTIMIZED_ALTERNATIVES[model]
    
    return model


def get_model_config(model: str) -> Dict[str, Any]:
    """
    Get configuration for model.
    
    Args:
        model: Model name
        
    Returns:
        Configuration dict
    """
    base_config = {
        "temperature": 0.3,
        "timeout": 30.0
    }
    
    if model in MODEL_CAPABILITIES:
        capabilities = MODEL_CAPABILITIES[model]
        base_config["max_tokens"] = capabilities.get("max_tokens", 4096)
        
        # Adjust timeout based on speed score
        if capabilities["speed_score"] < 6:
            base_config["timeout"] = 60.0
    
    return base_config


def should_use_high_quality_model(
    domain: str,
    content_type: str,
    complexity: str
) -> bool:
    """
    Determine if high-quality model is required.
    
    Args:
        domain: Domain type
        content_type: Content type
        complexity: Complexity level
        
    Returns:
        True if high-quality model required
    """
    # Check domain requirements
    if domain in DOMAIN_REQUIREMENTS:
        requirements = DOMAIN_REQUIREMENTS[domain]
        if content_type in requirements.get("critical_content_types", []):
            return True
    
    # Check content type requirements
    if content_type in QUALITY_THRESHOLDS["high_quality_required"]:
        return True
    
    # Check complexity
    if complexity == "complex":
        return True
    
    return False

