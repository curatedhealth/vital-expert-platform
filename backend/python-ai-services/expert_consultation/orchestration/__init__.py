"""
Intelligent Orchestration Layer for VITAL Ask Expert Service

This module provides the core intelligence that powers all 4 interaction modes:
- Agent Selection Algorithm
- LLM Selection Algorithm  
- Query Intent Classification
- Context Loading (RAG Selection)
- Prompt Selection & Construction
"""

from .agent_selector import AgentSelector, AutomaticAgentSelector, ManualAgentSelector
from .llm_selector import LLMSelector, ModelRouter
from .query_classifier import QueryClassifier, IntentDetector, ComplexityScorer
from .context_loader import ContextLoader, DomainSelector, RAGSelector
from .prompt_builder import PromptBuilder, PromptLibrary, DynamicPromptBuilder

__all__ = [
    "AgentSelector",
    "AutomaticAgentSelector", 
    "ManualAgentSelector",
    "LLMSelector",
    "ModelRouter",
    "QueryClassifier",
    "IntentDetector",
    "ComplexityScorer",
    "ContextLoader",
    "DomainSelector",
    "RAGSelector",
    "PromptBuilder",
    "PromptLibrary",
    "DynamicPromptBuilder"
]
