"""Utility functions for generating test data"""

import numpy as np
import uuid
import random
from typing import List, Dict, Any
from datetime import datetime, timedelta

def generate_mock_embedding(dimension: int = 1536) -> List[float]:
    """Generate random normalized embedding for testing"""
    embedding = np.random.randn(dimension)
    # Normalize to unit length
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm
    return embedding.tolist()

def generate_mock_medical_query() -> str:
    """Generate realistic medical query for testing"""
    queries = [
        "What are the adverse event reporting requirements for clinical trials?",
        "Explain the drug approval process for biologics",
        "What are the FDA requirements for Phase 3 clinical trials?",
        "Describe the EU MDR compliance requirements",
        "How do I submit a 510(k) application?",
        "What are ICH-GCP guidelines for clinical research?",
        "Explain post-market surveillance requirements",
        "What is required for an IND application?",
        "Describe regulatory requirements for medical device classification",
        "What are the requirements for clinical trial monitoring?"
    ]
    return random.choice(queries)

def generate_tenant_id() -> str:
    """Generate valid UUID for tenant"""
    return str(uuid.uuid4())

def generate_mock_agent(agent_type: str = "regulatory_expert", tier: int = 1) -> Dict[str, Any]:
    """Generate mock agent configuration"""
    return {
        "id": f"agent_{uuid.uuid4().hex[:8]}",
        "name": f"{agent_type.replace('_', ' ').title()}",
        "type": agent_type,
        "tier": tier,
        "specialties": [agent_type, "general"],
        "status": "active",
        "tenant_id": generate_tenant_id(),
        "created_at": datetime.now().isoformat()
    }

def generate_mock_document(specialty: str = "regulatory_affairs") -> Dict[str, Any]:
    """Generate mock medical document"""
    return {
        "id": f"doc_{uuid.uuid4().hex[:8]}",
        "content": f"Mock content for {specialty} document with relevant medical information...",
        "metadata": {
            "title": f"{specialty.replace('_', ' ').title()} Document",
            "specialty": specialty,
            "document_type": "guidance",
            "source": "FDA",
            "authors": "Medical Experts",
            "publication_year": 2024,
            "journal": "Medical Journal",
            "doi": f"10.1234/test.{random.randint(1000, 9999)}",
            "impact_factor": round(random.uniform(3.0, 6.0), 1),
            "peer_reviewed": True,
            "evidence_level": f"Level {random.randint(1, 3)}",
            "phase": random.choice(["vision", "integrate", "test", "activate", "learn"]),
            "tenant_id": generate_tenant_id()
        },
        "embedding": generate_mock_embedding(),
        "similarity_score": round(random.uniform(0.7, 0.95), 2)
    }

def generate_mock_conversation_history(num_turns: int = 3) -> List[Dict[str, str]]:
    """Generate mock conversation history"""
    history = []
    for i in range(num_turns):
        history.append({"role": "user", "content": generate_mock_medical_query()})
        history.append({"role": "assistant", "content": f"Response to query {i + 1}..."})
    return history

def generate_mock_citation() -> Dict[str, Any]:
    """Generate mock citation"""
    return {
        "source": "FDA Guidelines",
        "url": "https://www.fda.gov/...",
        "authors": "FDA",
        "publication_year": 2024,
        "evidence_level": "Level 1",
        "doi": f"10.1234/fda.{random.randint(1000, 9999)}",
        "confidence_score": round(random.uniform(0.8, 0.95), 2)
    }

def generate_mock_session_id() -> str:
    """Generate mock session ID"""
    return f"session_{uuid.uuid4().hex[:16]}"

def generate_mock_user_id() -> str:
    """Generate mock user ID"""
    return f"user_{uuid.uuid4().hex[:12]}"

def generate_mock_timestamp(days_ago: int = 0) -> str:
    """Generate mock timestamp"""
    return (datetime.now() - timedelta(days=days_ago)).isoformat()

