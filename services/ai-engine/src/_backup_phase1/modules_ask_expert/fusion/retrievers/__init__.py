"""
VITAL Path AI Services - Ask Expert Fusion Retrievers

Three retrieval sources for Fusion Intelligence:
- Vector: Semantic similarity (pgvector/Pinecone)
- Graph: Relationship paths (Neo4j)
- Relational: Historical patterns (PostgreSQL)

Naming Convention:
- Classes: AskExpert{Source}Retriever
- Methods: retrieve, search
- Logs: ask_expert_{source}_retriever_{action}
"""

from .ask_expert_vector_retriever import AskExpertVectorRetriever
from .ask_expert_graph_retriever import AskExpertGraphRetriever
from .ask_expert_relational_retriever import AskExpertRelationalRetriever

__all__ = [
    "AskExpertVectorRetriever",
    "AskExpertGraphRetriever",
    "AskExpertRelationalRetriever",
]
