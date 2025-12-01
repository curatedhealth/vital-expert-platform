"""
VITAL Platform - API Tests
===========================
Tests for REST and GraphQL API endpoints.
"""

import pytest


class TestRESTAPI:
    """Test REST API endpoints."""

    def test_health_endpoint(self):
        """Test health check endpoint."""
        try:
            from fastapi.testclient import TestClient
            from src.api.main import app

            client = TestClient(app)
            response = client.get("/health")

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"

        except ImportError:
            pytest.skip("FastAPI/TestClient not installed")

    def test_root_endpoint(self):
        """Test root endpoint returns API info."""
        try:
            from fastapi.testclient import TestClient
            from src.api.main import app

            client = TestClient(app)
            response = client.get("/")

            assert response.status_code == 200
            data = response.json()
            assert "endpoints" in data
            assert "graphql" in data["endpoints"]

        except ImportError:
            pytest.skip("FastAPI/TestClient not installed")

    def test_agents_list_endpoint(self):
        """Test agents list endpoint."""
        try:
            from fastapi.testclient import TestClient
            from src.api.main import app

            client = TestClient(app)
            response = client.get("/api/v1/agents?limit=10")

            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            assert len(data) <= 10

        except ImportError:
            pytest.skip("FastAPI/TestClient not installed")

    def test_personas_list_endpoint(self):
        """Test personas list endpoint."""
        try:
            from fastapi.testclient import TestClient
            from src.api.main import app

            client = TestClient(app)
            response = client.get("/api/v1/personas?limit=10")

            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)

        except ImportError:
            pytest.skip("FastAPI/TestClient not installed")

    def test_ontology_hierarchy_endpoint(self):
        """Test ontology hierarchy endpoint."""
        try:
            from fastapi.testclient import TestClient
            from src.api.main import app

            client = TestClient(app)
            response = client.get("/api/v1/ontology/hierarchy")

            assert response.status_code == 200
            data = response.json()
            assert "functions" in data
            assert "roles_count" in data

        except ImportError:
            pytest.skip("FastAPI/TestClient not installed")

    def test_workflow_execute_endpoint(self):
        """Test workflow execution endpoint."""
        try:
            from fastapi.testclient import TestClient
            from src.api.main import app

            client = TestClient(app)
            response = client.post(
                "/api/v1/workflow/execute",
                json={
                    "query": "What is an MSL?",
                    "user_persona_type": "AUTOMATOR"
                }
            )

            assert response.status_code == 200
            data = response.json()
            assert "response" in data
            assert "session_id" in data

        except ImportError:
            pytest.skip("FastAPI/TestClient not installed")


class TestGraphQL:
    """Test GraphQL endpoint."""

    def test_graphql_endpoint_exists(self):
        """Test GraphQL endpoint is accessible."""
        try:
            from fastapi.testclient import TestClient
            from src.api.main import app

            client = TestClient(app)

            # GraphQL introspection query
            response = client.post(
                "/graphql",
                json={
                    "query": "{ __schema { types { name } } }"
                }
            )

            assert response.status_code == 200
            data = response.json()
            assert "data" in data

        except ImportError:
            pytest.skip("FastAPI/TestClient not installed")

    def test_graphql_functions_query(self):
        """Test GraphQL functions query."""
        try:
            from fastapi.testclient import TestClient
            from src.api.main import app

            client = TestClient(app)

            response = client.post(
                "/graphql",
                json={
                    "query": "{ functions { id name slug } }"
                }
            )

            assert response.status_code == 200
            data = response.json()
            assert "data" in data
            assert "functions" in data["data"]
            assert len(data["data"]["functions"]) > 0

        except ImportError:
            pytest.skip("FastAPI/TestClient not installed")

    def test_graphql_agents_query(self):
        """Test GraphQL agents query."""
        try:
            from fastapi.testclient import TestClient
            from src.api.main import app

            client = TestClient(app)

            response = client.post(
                "/graphql",
                json={
                    "query": "{ agents(limit: 5) { id name expertiseLevel } }"
                }
            )

            assert response.status_code == 200
            data = response.json()
            assert "data" in data
            assert "agents" in data["data"]

        except ImportError:
            pytest.skip("FastAPI/TestClient not installed")

    def test_graphql_ontology_stats(self):
        """Test GraphQL ontology stats query."""
        try:
            from fastapi.testclient import TestClient
            from src.api.main import app

            client = TestClient(app)

            response = client.post(
                "/graphql",
                json={
                    "query": """
                    {
                        ontologyStats {
                            functionsCount
                            departmentsCount
                            rolesCount
                            personasCount
                            agentsCount
                        }
                    }
                    """
                }
            )

            assert response.status_code == 200
            data = response.json()
            assert "data" in data
            stats = data["data"]["ontologyStats"]
            assert stats["functionsCount"] > 0
            assert stats["rolesCount"] > 0

        except ImportError:
            pytest.skip("FastAPI/TestClient not installed")
