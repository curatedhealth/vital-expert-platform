"""
VITAL Platform - Test Configuration
====================================
Pytest fixtures and configuration.
"""

import pytest
import sys

# Add src to path
sys.path.insert(0, '/Users/hichamnaim/Downloads/Cursor/VITAL/src')

# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture
def supabase_config():
    """Supabase configuration."""
    return {
        "url": "https://bomltkhixeatxuoxmolq.supabase.co",
        "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
    }


@pytest.fixture
def pinecone_config():
    """Pinecone configuration."""
    return {
        "api_key": "pcsk_3sLEoE_F3XwTFxNkzmWcEtJGS3PNrwB4VBLmZUnuFwvoUTz7NkZ9GGTsBvJfFrgypddFEi",
        "index": "vital-knowledge",
        "agent_namespace": "ont-agents",
        "persona_namespace": "personas"
    }


@pytest.fixture
def neo4j_config():
    """Neo4j configuration."""
    return {
        "uri": "neo4j+s://13067bdb.databases.neo4j.io",
        "user": "neo4j",
        "password": "kkCxQgpcanSUDv-dKzOzDPcYIhvJHRQRa4tuiNa2Mek"
    }


@pytest.fixture
def sample_query():
    """Sample user query for testing."""
    return "What are effective KOL engagement strategies for MSLs in oncology?"


@pytest.fixture
def sample_persona_types():
    """MECE persona archetypes."""
    return ["AUTOMATOR", "ORCHESTRATOR", "LEARNER", "SKEPTIC"]


@pytest.fixture
def expected_counts():
    """Expected data counts for validation."""
    return {
        "functions": 26,
        "departments": 136,
        "roles": 858,
        "personas": 3432,  # 858 * 4
        "agents": 1138
    }
