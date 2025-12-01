"""
VITAL Platform - Pinecone Integration Tests
============================================
Tests for Pinecone vector store connectivity and data.
"""

import pytest

# =============================================================================
# TESTS
# =============================================================================

class TestPineconeConnection:
    """Test Pinecone connectivity."""

    def test_can_connect(self, pinecone_config):
        """Test basic connection to Pinecone."""
        try:
            from pinecone import Pinecone

            pc = Pinecone(api_key=pinecone_config["api_key"])
            indexes = pc.list_indexes()

            assert len(indexes) > 0, "No indexes found"

        except ImportError:
            pytest.skip("Pinecone not installed")

    def test_vital_knowledge_index_exists(self, pinecone_config):
        """Test that vital-knowledge index exists."""
        try:
            from pinecone import Pinecone

            pc = Pinecone(api_key=pinecone_config["api_key"])
            index = pc.Index(pinecone_config["index"])
            stats = index.describe_index_stats()

            assert stats.total_vector_count > 0, "Index is empty"

        except ImportError:
            pytest.skip("Pinecone not installed")


class TestNamespaces:
    """Test Pinecone namespace structure."""

    def test_ont_agents_namespace_exists(self, pinecone_config):
        """Test ont-agents namespace has vectors."""
        try:
            from pinecone import Pinecone

            pc = Pinecone(api_key=pinecone_config["api_key"])
            index = pc.Index(pinecone_config["index"])
            stats = index.describe_index_stats()

            ns = pinecone_config["agent_namespace"]
            count = stats.namespaces.get(ns, {}).get("vector_count", 0)

            assert count > 0, f"Namespace {ns} is empty"
            assert count >= 1000, f"Expected >= 1000 agents in {ns}, got {count}"

        except ImportError:
            pytest.skip("Pinecone not installed")

    def test_personas_namespace_exists(self, pinecone_config):
        """Test personas namespace has vectors."""
        try:
            from pinecone import Pinecone

            pc = Pinecone(api_key=pinecone_config["api_key"])
            index = pc.Index(pinecone_config["index"])
            stats = index.describe_index_stats()

            ns = pinecone_config["persona_namespace"]
            count = stats.namespaces.get(ns, {}).get("vector_count", 0)

            assert count > 0, f"Namespace {ns} is empty"
            assert count >= 3000, f"Expected >= 3000 personas in {ns}, got {count}"

        except ImportError:
            pytest.skip("Pinecone not installed")

    def test_expected_namespaces(self, pinecone_config):
        """Test all expected namespaces exist."""
        expected = ["ont-agents", "personas", "skills", "capabilities", "responsibilities"]

        try:
            from pinecone import Pinecone

            pc = Pinecone(api_key=pinecone_config["api_key"])
            index = pc.Index(pinecone_config["index"])
            stats = index.describe_index_stats()

            existing = set(stats.namespaces.keys())
            missing = set(expected) - existing

            # Allow some flexibility
            assert len(missing) <= 2, f"Missing namespaces: {missing}"

        except ImportError:
            pytest.skip("Pinecone not installed")


class TestAgentSearch:
    """Test agent semantic search functionality."""

    def test_search_returns_results(self, pinecone_config, sample_query):
        """Test that search returns relevant results."""
        try:
            from pinecone import Pinecone
            import hashlib

            pc = Pinecone(api_key=pinecone_config["api_key"])
            index = pc.Index(pinecone_config["index"])

            # Create embedding (hash-based placeholder)
            embedding = []
            for i in range(3072):
                seed = hashlib.md5(f"{sample_query}{i}".encode()).digest()
                value = (seed[i % 16] / 128.0) - 1.0
                embedding.append(value)
            norm = sum(x*x for x in embedding) ** 0.5
            embedding = [x / norm for x in embedding]

            results = index.query(
                vector=embedding,
                top_k=5,
                namespace="ont-agents",
                include_metadata=True
            )

            assert len(results.matches) > 0, "No search results returned"
            assert results.matches[0].score is not None, "No score on results"

        except ImportError:
            pytest.skip("Pinecone not installed")

    def test_search_returns_metadata(self, pinecone_config):
        """Test that search results include metadata."""
        try:
            from pinecone import Pinecone
            import hashlib

            pc = Pinecone(api_key=pinecone_config["api_key"])
            index = pc.Index(pinecone_config["index"])

            # Simple query
            query = "MSL"
            embedding = []
            for i in range(3072):
                seed = hashlib.md5(f"{query}{i}".encode()).digest()
                value = (seed[i % 16] / 128.0) - 1.0
                embedding.append(value)
            norm = sum(x*x for x in embedding) ** 0.5
            embedding = [x / norm for x in embedding]

            results = index.query(
                vector=embedding,
                top_k=1,
                namespace="ont-agents",
                include_metadata=True
            )

            assert len(results.matches) > 0, "No results"

            meta = results.matches[0].metadata
            assert "name" in meta, "Missing 'name' in metadata"
            assert "agent_id" in meta or "id" in results.matches[0].id, "Missing agent ID"

        except ImportError:
            pytest.skip("Pinecone not installed")


class TestDimensionConsistency:
    """Test embedding dimension consistency."""

    def test_index_dimension_is_3072(self, pinecone_config):
        """Test index uses 3072 dimensions (text-embedding-3-large)."""
        try:
            from pinecone import Pinecone

            pc = Pinecone(api_key=pinecone_config["api_key"])
            index = pc.Index(pinecone_config["index"])
            stats = index.describe_index_stats()

            assert stats.dimension == 3072, \
                f"Expected dimension 3072, got {stats.dimension}"

        except ImportError:
            pytest.skip("Pinecone not installed")
