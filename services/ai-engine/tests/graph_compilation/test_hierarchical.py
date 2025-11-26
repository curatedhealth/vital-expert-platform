"""
Tests for Hierarchical Agent Support
"""

import pytest


@pytest.mark.asyncio
async def test_level_filtering():
    """Test agent level filtering"""
    agents = [
        {'id': '1', 'agent_level_number': 1},
        {'id': '2', 'agent_level_number': 3},
        {'id': '3', 'agent_level_number': 5}
    ]
    
    # Tier 1 should get levels 4-5
    tier1_allowed = [4, 5]
    tier1_agents = [a for a in agents if a['agent_level_number'] in tier1_allowed]
    assert len(tier1_agents) == 1
    
    # Tier 3 should get levels 1-2
    tier3_allowed = [1, 2]
    tier3_agents = [a for a in agents if a['agent_level_number'] in tier3_allowed]
    assert len(tier3_agents) == 1
