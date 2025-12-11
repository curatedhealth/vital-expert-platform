"""
VITAL Path - Application Business Rules (Modules)

This layer contains the "glue" that connects the domain logic to the outside world.
Each module represents a distinct business capability.

Modules:
- translator: React Flow ↔ LangGraph bridge
- execution: Workflow runtime engine
- expert: Ask Expert modes (1-4)
- panels: Multi-agent panel orchestration
- knowledge: RAG and document ingestion
- ontology: AI opportunity discovery
- companion: AI assistant observer
- solutions: Solution builder and marketplace
"""

__all__ = [
    "translator",
    "execution",
    "expert",
    "panels",
    "knowledge",
    "ontology",
    "companion",
    "solutions",
]






