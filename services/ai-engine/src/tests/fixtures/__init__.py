"""
Test fixtures package for VITAL Path AI Services
Provides mock data and utilities for testing
"""

# Export all fixtures for easy import
from .mock_llm_responses import *
from .mock_medical_docs import *
from .mock_agents import *
from .mock_rag_results import *
from .mock_embeddings import *
from .data_generators import *

__all__ = [
    # LLM Responses
    "MOCK_MODE1_RESPONSE",
    "MOCK_MODE2_RESPONSE",
    "MOCK_MODE3_RESPONSE",
    "MOCK_QUERY_ANALYSIS",
    
    # Medical Documents
    "MOCK_REGULATORY_DOC",
    "MOCK_CLINICAL_DOC",
    "MOCK_PHARMACOVIG_DOC",
    
    # Agents
    "MOCK_REGULATORY_AGENT",
    "MOCK_MEDICAL_AGENT",
    "MOCK_CLINICAL_AGENT",
    
    # RAG Results
    "MOCK_RAG_SEARCH_RESPONSE",
    
    # Embeddings
    "MOCK_EMBEDDING_1536",
    
    # Generators
    "generate_mock_embedding",
    "generate_mock_medical_query",
    "generate_tenant_id",
    "generate_mock_agent",
    "generate_mock_document",
]

