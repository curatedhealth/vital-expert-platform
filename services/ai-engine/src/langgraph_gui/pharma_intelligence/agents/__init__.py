"""
Specialized AI agents for pharmaceutical research domains.

This module contains all specialized agents:
- OrchestratorAgent: Plans research and reviews quality
- MedicalResearchAgent: Clinical trials and medical research
- DigitalHealthAgent: Health tech and digital therapeutics
- RegulatoryAgent: FDA/EMA approvals and compliance
- AggregatorAgent: Synthesizes findings and archives to RAG
- CopywriterAgent: Generates professional reports
"""

from .orchestrator import OrchestratorAgent
from .medical import MedicalResearchAgent
from .digital_health import DigitalHealthAgent
from .regulatory import RegulatoryAgent
from .aggregator import AggregatorAgent
from .copywriter import CopywriterAgent

__all__ = [
    'OrchestratorAgent',
    'MedicalResearchAgent',
    'DigitalHealthAgent',
    'RegulatoryAgent',
    'AggregatorAgent',
    'CopywriterAgent',
]

