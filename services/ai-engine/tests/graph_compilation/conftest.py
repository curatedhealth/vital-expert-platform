"""
Shared fixtures for graph compilation tests
"""

import pytest
from uuid import uuid4
from typing import Dict, Any


@pytest.fixture
def sample_graph_data() -> Dict[str, Any]:
    """Sample graph data for testing"""
    agent_id = uuid4()
    skill_id = uuid4()
    
    return {
        'id': uuid4(),
        'name': 'Test Graph',
        'description': 'Test orchestration graph',
        'version': '1.0.0',
        'entry_point_node_key': 'select_expert',
        'nodes': [
            {
                'id': uuid4(),
                'node_key': 'select_expert',
                'node_type': 'router',
                'label': 'Select Expert',
                'config': {
                    'routing_logic': {
                        'type': 'tier_based',
                        'route_key': 'expert_route'
                    }
                }
            },
            {
                'id': uuid4(),
                'node_key': 'execute_agent',
                'node_type': 'agent',
                'label': 'Execute Agent',
                'agent_id': agent_id,
                'config': {
                    'temperature': 0.7,
                    'max_tokens': 2000
                }
            },
            {
                'id': uuid4(),
                'node_key': 'execute_skill',
                'node_type': 'skill',
                'label': 'Execute Skill',
                'skill_id': skill_id,
                'config': {}
            }
        ],
        'edges': [
            {
                'source_node_key': 'select_expert',
                'target_node_key': 'execute_agent',
                'edge_type': 'conditional',
                'condition_key': 'expert_route',
                'condition_value': 'tier_1'
            },
            {
                'source_node_key': 'execute_agent',
                'target_node_key': 'execute_skill',
                'edge_type': 'direct'
            }
        ]
    }


@pytest.fixture
def mock_postgres_client():
    """Mock PostgreSQL client"""
    class MockPostgresClient:
        async def fetchrow(self, query, *args):
            return {'id': uuid4(), 'name': 'Test Agent', 'system_prompt': 'Test'}
        
        async def fetch(self, query, *args):
            return []
    
    return MockPostgresClient()


@pytest.fixture
def mock_checkpoint_manager():
    """Mock checkpoint manager"""
    class MockCheckpointManager:
        async def get_checkpointer(self, tenant_id):
            return None
    
    return MockCheckpointManager()
