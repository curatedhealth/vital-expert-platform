"""
Unit Tests for Neo4j Sync Service

Tests for:
- Full sync operations
- Single agent sync
- Concept syncing (regions, domains, TAs, phases)
- Relationship syncing
- Synergy syncing
"""

import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from datetime import datetime

import sys
sys.path.insert(0, '/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine/src')

from services.neo4j_sync_service import Neo4jSyncService


class TestNeo4jSyncServiceInit:
    """Tests for Neo4jSyncService initialization."""
    
    def test_init_with_driver(self, mock_supabase_client, mock_neo4j_driver):
        """Test initialization with pre-configured driver."""
        service = Neo4jSyncService(
            supabase_client=mock_supabase_client,
            neo4j_driver=mock_neo4j_driver,
        )
        
        assert service.driver is not None
        assert service.supabase is not None
    
    def test_init_without_driver(self, mock_supabase_client):
        """Test initialization without driver (graceful degradation)."""
        service = Neo4jSyncService(
            supabase_client=mock_supabase_client,
            neo4j_driver=None,
        )
        
        assert service.driver is None
        assert service.supabase is not None


class TestNeo4jSyncConcepts:
    """Tests for concept syncing."""
    
    @pytest.fixture
    def service(self, mock_supabase_client, mock_neo4j_driver):
        """Create service with mocked dependencies."""
        return Neo4jSyncService(mock_supabase_client, mock_neo4j_driver)
    
    @pytest.mark.asyncio
    async def test_sync_concepts(self, service):
        """Test syncing all concept types."""
        result = await service._sync_concepts()
        
        assert "total" in result
        assert result["total"] >= 0
    
    @pytest.mark.asyncio
    async def test_sync_concepts_no_driver(self, mock_supabase_client):
        """Test concept sync without Neo4j driver."""
        service = Neo4jSyncService(mock_supabase_client, None)
        
        result = await service._sync_concepts()
        
        assert result["total"] == 0


class TestNeo4jSyncAgents:
    """Tests for agent syncing."""
    
    @pytest.fixture
    def service(self, mock_supabase_client, mock_neo4j_driver):
        """Create service with mocked dependencies."""
        return Neo4jSyncService(mock_supabase_client, mock_neo4j_driver)
    
    @pytest.mark.asyncio
    async def test_sync_agents(self, service, mock_tenant_id):
        """Test syncing agents."""
        result = await service._sync_agents(mock_tenant_id)
        
        assert "total" in result
    
    @pytest.mark.asyncio
    async def test_sync_agents_all_tenants(self, service):
        """Test syncing agents for all tenants."""
        result = await service._sync_agents(None)
        
        assert "total" in result
    
    @pytest.mark.asyncio
    async def test_sync_single_agent(self, service, mock_agent_id):
        """Test syncing a single agent."""
        result = await service.sync_single_agent(mock_agent_id)
        
        assert "success" in result
    
    @pytest.mark.asyncio
    async def test_sync_single_agent_no_driver(self, mock_supabase_client, mock_agent_id):
        """Test single agent sync without driver."""
        service = Neo4jSyncService(mock_supabase_client, None)
        
        result = await service.sync_single_agent(mock_agent_id)
        
        assert result["success"] is False
        assert "Neo4j not available" in result["error"]


class TestNeo4jSyncRelationships:
    """Tests for relationship syncing."""
    
    @pytest.fixture
    def service(self, mock_supabase_client, mock_neo4j_driver):
        """Create service with mocked dependencies."""
        return Neo4jSyncService(mock_supabase_client, mock_neo4j_driver)
    
    @pytest.mark.asyncio
    async def test_sync_agent_relationships(self, service, mock_tenant_id):
        """Test syncing agent-concept relationships."""
        result = await service._sync_agent_relationships(mock_tenant_id)
        
        assert "total" in result


class TestNeo4jSyncSynergies:
    """Tests for synergy syncing."""
    
    @pytest.fixture
    def service(self, mock_supabase_client, mock_neo4j_driver):
        """Create service with mocked dependencies."""
        return Neo4jSyncService(mock_supabase_client, mock_neo4j_driver)
    
    @pytest.mark.asyncio
    async def test_sync_synergies(self, service, mock_tenant_id):
        """Test syncing agent synergies."""
        result = await service._sync_synergies(mock_tenant_id)
        
        assert "total" in result


class TestNeo4jSyncAll:
    """Tests for full sync operation."""
    
    @pytest.fixture
    def service(self, mock_supabase_client, mock_neo4j_driver):
        """Create service with mocked dependencies."""
        return Neo4jSyncService(mock_supabase_client, mock_neo4j_driver)
    
    @pytest.mark.asyncio
    async def test_sync_all(self, service, mock_tenant_id):
        """Test full sync operation."""
        result = await service.sync_all(mock_tenant_id)
        
        assert "agents_synced" in result
        assert "concepts_synced" in result
        assert "relationships_synced" in result
        assert "synergies_synced" in result
        assert "started_at" in result
    
    @pytest.mark.asyncio
    async def test_sync_all_no_tenant(self, service):
        """Test full sync for all tenants."""
        result = await service.sync_all(None)
        
        assert "success" in result


class TestNeo4jSyncStatus:
    """Tests for sync status queries."""
    
    @pytest.fixture
    def service(self, mock_supabase_client, mock_neo4j_driver):
        """Create service with mocked dependencies."""
        return Neo4jSyncService(mock_supabase_client, mock_neo4j_driver)
    
    @pytest.mark.asyncio
    async def test_get_sync_status(self, service):
        """Test getting sync status."""
        result = await service.get_sync_status()
        
        assert "connected" in result
    
    @pytest.mark.asyncio
    async def test_get_sync_status_no_driver(self, mock_supabase_client):
        """Test sync status without driver."""
        service = Neo4jSyncService(mock_supabase_client, None)
        
        result = await service.get_sync_status()
        
        assert result["connected"] is False


class TestNeo4jDeleteAgent:
    """Tests for agent deletion."""
    
    @pytest.fixture
    def service(self, mock_supabase_client, mock_neo4j_driver):
        """Create service with mocked dependencies."""
        return Neo4jSyncService(mock_supabase_client, mock_neo4j_driver)
    
    @pytest.mark.asyncio
    async def test_delete_agent(self, service, mock_agent_id):
        """Test deleting an agent from Neo4j."""
        result = await service.delete_agent(mock_agent_id)
        
        assert "success" in result
    
    @pytest.mark.asyncio
    async def test_delete_agent_no_driver(self, mock_supabase_client, mock_agent_id):
        """Test agent deletion without driver."""
        service = Neo4jSyncService(mock_supabase_client, None)
        
        result = await service.delete_agent(mock_agent_id)
        
        assert result["success"] is False
