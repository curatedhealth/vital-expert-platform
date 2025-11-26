"""
Tests for Postgres Checkpointer
"""

import pytest


def test_checkpointer_initialization():
    """Test checkpointer initialization"""
    from langgraph_workflows.postgres_checkpointer import TenantAwarePostgresCheckpointer
    
    checkpointer = TenantAwarePostgresCheckpointer("postgresql://test")
    assert checkpointer.connection_string == "postgresql://test"
    assert len(checkpointer._checkpointers) == 0


@pytest.mark.asyncio
async def test_tenant_isolation():
    """Test tenant isolation in checkpointer"""
    from langgraph_workflows.postgres_checkpointer import TenantAwarePostgresCheckpointer
    
    checkpointer = TenantAwarePostgresCheckpointer("postgresql://test")
    
    tenant1_saver = await checkpointer.get_checkpointer("tenant-1")
    tenant2_saver = await checkpointer.get_checkpointer("tenant-2")
    
    assert tenant1_saver is not tenant2_saver
    assert len(checkpointer._checkpointers) == 2
