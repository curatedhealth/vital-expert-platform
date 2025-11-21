"""
Pharma Intelligence - Production-Ready Multi-Agent Pharmaceutical Research System

A sophisticated AI-powered research orchestrator using 6 specialized agents
to gather, synthesize, and deliver comprehensive pharmaceutical intelligence.

Now using OpenAI exclusively for all LLM operations.
Compatible with pinecone-client 2.2.4 for Python 3.13+
"""

try:
    from .__version__ import __version__, __author__, __license__
except ImportError:
    __version__ = "1.0.0"
    __author__ = "Pharma Intelligence Team"
    __license__ = "MIT"

from .orchestrator import EnhancedPharmaIntelligenceOrchestrator

__all__ = [
    '__version__',
    '__author__',
    '__license__',
    'EnhancedPharmaIntelligenceOrchestrator',
]

