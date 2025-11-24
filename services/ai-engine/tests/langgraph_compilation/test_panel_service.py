"""
Unit Tests for Panel Service
Tests for multi-agent panel orchestration
"""

import pytest
from unittest.mock import AsyncMock, patch
from uuid import uuid4

from langgraph_compilation.panel_service import (
    PanelService,
    PanelType,
    get_panel_service
)


@pytest.mark.unit
@pytest.mark.asyncio
async def test_panel_service_parallel_execution(mock_postgres_client, sample_agent_data):
    """Test parallel panel execution"""
    
    agent_ids = [uuid4(), uuid4(), uuid4()]
    
    # Mock agent loading
    mock_postgres_client.fetch.return_value = [
        {
            'id': agent_ids[0],
            'name': 'Agent 1',
            'system_prompt': 'You are agent 1',
            'model_name': 'gpt-4',
            'graph_id': None
        },
        {
            'id': agent_ids[1],
            'name': 'Agent 2',
            'system_prompt': 'You are agent 2',
            'model_name': 'gpt-4',
            'graph_id': None
        },
        {
            'id': agent_ids[2],
            'name': 'Agent 3',
            'system_prompt': 'You are agent 3',
            'model_name': 'gpt-4',
            'graph_id': None
        }
    ]
    
    service = PanelService()
    service.pg = mock_postgres_client
    
    # Mock execute_single_agent
    async def mock_execute_single_agent(*args, **kwargs):
        return {
            'response': 'Test response',
            'confidence': 0.85
        }
    
    service._execute_single_agent = mock_execute_single_agent
    
    result = await service.execute_panel(
        query="What is the treatment for diabetes?",
        panel_type=PanelType.PARALLEL,
        agent_ids=agent_ids,
        user_id=uuid4(),
        session_id=uuid4()
    )
    
    assert result is not None
    assert result['panel_type'] == 'parallel'
    assert len(result['responses']) == 3
    assert result['panel_size'] == 3


@pytest.mark.unit
@pytest.mark.asyncio
async def test_panel_service_consensus_execution(mock_postgres_client):
    """Test consensus panel execution"""
    
    agent_ids = [uuid4(), uuid4()]
    
    mock_postgres_client.fetch.return_value = [
        {
            'id': agent_ids[0],
            'name': 'Agent 1',
            'system_prompt': 'You are agent 1',
            'model_name': 'gpt-4',
            'graph_id': None
        },
        {
            'id': agent_ids[1],
            'name': 'Agent 2',
            'system_prompt': 'You are agent 2',
            'model_name': 'gpt-4',
            'graph_id': None
        }
    ]
    
    service = PanelService()
    service.pg = mock_postgres_client
    
    # Mock execute_single_agent
    async def mock_execute_single_agent(*args, **kwargs):
        return {
            'response': 'Consensus response',
            'confidence': 0.9
        }
    
    service._execute_single_agent = mock_execute_single_agent
    
    result = await service.execute_panel(
        query="What is the consensus on treatment?",
        panel_type=PanelType.CONSENSUS,
        agent_ids=agent_ids,
        user_id=uuid4(),
        session_id=uuid4()
    )
    
    assert result['panel_type'] == 'consensus'
    assert len(result['responses']) > 0


@pytest.mark.unit
@pytest.mark.asyncio
async def test_panel_service_debate_execution(mock_postgres_client):
    """Test debate panel execution"""
    
    agent_ids = [uuid4(), uuid4()]
    
    mock_postgres_client.fetch.return_value = [
        {
            'id': agent_ids[0],
            'name': 'Agent 1',
            'system_prompt': 'You are agent 1',
            'model_name': 'gpt-4',
            'graph_id': None
        },
        {
            'id': agent_ids[1],
            'name': 'Agent 2',
            'system_prompt': 'You are agent 2',
            'model_name': 'gpt-4',
            'graph_id': None
        }
    ]
    
    service = PanelService()
    service.pg = mock_postgres_client
    
    # Mock execute_single_agent
    async def mock_execute_single_agent(*args, **kwargs):
        return {
            'response': 'Debate point',
            'confidence': 0.8
        }
    
    service._execute_single_agent = mock_execute_single_agent
    
    result = await service.execute_panel(
        query="Debate the treatment options",
        panel_type=PanelType.DEBATE,
        agent_ids=agent_ids,
        user_id=uuid4(),
        session_id=uuid4()
    )
    
    assert result['panel_type'] == 'debate'
    assert len(result['responses']) == 2
    # Check positions assigned
    assert all('position' in r for r in result['responses'])


@pytest.mark.unit
@pytest.mark.asyncio
async def test_panel_service_sequential_execution(mock_postgres_client):
    """Test sequential panel execution"""
    
    agent_ids = [uuid4(), uuid4()]
    
    mock_postgres_client.fetch.return_value = [
        {
            'id': agent_ids[0],
            'name': 'Agent 1',
            'system_prompt': 'You are agent 1',
            'model_name': 'gpt-4',
            'graph_id': None
        },
        {
            'id': agent_ids[1],
            'name': 'Agent 2',
            'system_prompt': 'You are agent 2',
            'model_name': 'gpt-4',
            'graph_id': None
        }
    ]
    
    service = PanelService()
    service.pg = mock_postgres_client
    
    # Mock execute_single_agent
    async def mock_execute_single_agent(*args, **kwargs):
        return {
            'response': 'Building on previous',
            'confidence': 0.85
        }
    
    service._execute_single_agent = mock_execute_single_agent
    
    result = await service.execute_panel(
        query="Build on each other's responses",
        panel_type=PanelType.SEQUENTIAL,
        agent_ids=agent_ids,
        user_id=uuid4(),
        session_id=uuid4()
    )
    
    assert result['panel_type'] == 'sequential'
    assert len(result['responses']) == 2
    # Check order assigned
    assert all('order' in r for r in result['responses'])


@pytest.mark.unit
@pytest.mark.asyncio
async def test_panel_service_error_handling(mock_postgres_client):
    """Test panel service handles errors"""
    
    agent_ids = [uuid4()]
    
    # Mock no agents found
    mock_postgres_client.fetch.return_value = []
    
    service = PanelService()
    service.pg = mock_postgres_client
    
    with pytest.raises(ValueError, match="No valid agents found"):
        await service.execute_panel(
            query="Test query",
            panel_type=PanelType.PARALLEL,
            agent_ids=agent_ids,
            user_id=uuid4(),
            session_id=uuid4()
        )


@pytest.mark.unit
@pytest.mark.asyncio
async def test_panel_service_agent_failure_handling(mock_postgres_client):
    """Test panel handles individual agent failures"""
    
    agent_ids = [uuid4(), uuid4()]
    
    mock_postgres_client.fetch.return_value = [
        {
            'id': agent_ids[0],
            'name': 'Agent 1',
            'system_prompt': 'You are agent 1',
            'model_name': 'gpt-4',
            'graph_id': None
        },
        {
            'id': agent_ids[1],
            'name': 'Agent 2',
            'system_prompt': 'You are agent 2',
            'model_name': 'gpt-4',
            'graph_id': None
        }
    ]
    
    service = PanelService()
    service.pg = mock_postgres_client
    
    # Mock one success, one failure
    call_count = 0
    
    async def mock_execute_single_agent(*args, **kwargs):
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            return {'response': 'Success', 'confidence': 0.9}
        else:
            raise Exception("Agent failed")
    
    service._execute_single_agent = mock_execute_single_agent
    
    result = await service.execute_panel(
        query="Test query",
        panel_type=PanelType.PARALLEL,
        agent_ids=agent_ids,
        user_id=uuid4(),
        session_id=uuid4()
    )
    
    # Should have responses from both agents (one error)
    assert len(result['responses']) == 2
    assert result['responses'][0]['error'] is False
    assert result['responses'][1]['error'] is True


@pytest.mark.unit
@pytest.mark.asyncio
async def test_get_panel_service_singleton():
    """Test panel service singleton pattern"""
    
    service1 = await get_panel_service()
    service2 = await get_panel_service()
    
    # Should return same instance
    assert service1 is service2

