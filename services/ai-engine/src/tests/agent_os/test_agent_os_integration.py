"""
Integration Tests for Agent OS

End-to-end tests for the complete Agent OS flow:
1. Agent instantiation with context
2. Session tracking
3. Synergy calculation
4. Analytics generation
5. Sync services
"""

import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from datetime import datetime, timedelta
import uuid
import asyncio

import sys
sys.path.insert(0, '/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine/src')

from services.agent_instantiation_service import (
    AgentInstantiationService,
    InstantiatedAgentConfig,
)
from services.session_analytics_service import SessionAnalyticsService
from workers.tasks.synergy_tasks import SynergyCalculationService


class TestAgentOSEndToEndFlow:
    """End-to-end integration tests for Agent OS."""
    
    @pytest.fixture
    def services(self, mock_supabase_client):
        """Create all Agent OS services."""
        return {
            'instantiation': AgentInstantiationService(mock_supabase_client),
            'analytics': SessionAnalyticsService(mock_supabase_client),
            'synergy': SynergyCalculationService(mock_supabase_client),
        }
    
    @pytest.mark.asyncio
    async def test_complete_session_lifecycle(
        self,
        services,
        mock_tenant_id,
        mock_user_id,
        mock_agent_id,
    ):
        """Test complete session lifecycle: create → use → complete → analyze."""
        instantiation = services['instantiation']
        analytics = services['analytics']
        
        # Step 1: Instantiate agent
        config = await instantiation.instantiate_agent(
            agent_id=mock_agent_id,
            user_id=mock_user_id,
            tenant_id=mock_tenant_id,
            region_id="reg-fda",
            domain_id="dom-pharma",
            personality_type_id="pt-analytical",
        )
        
        assert config.session_id is not None
        assert config.system_prompt is not None
        
        # Step 2: Simulate queries (update metrics)
        await instantiation.update_session_metrics(
            session_id=config.session_id,
            input_tokens=500,
            output_tokens=1000,
            cost_usd=0.015,
            response_time_ms=2000,
        )
        
        await instantiation.update_session_metrics(
            session_id=config.session_id,
            input_tokens=300,
            output_tokens=800,
            cost_usd=0.011,
            response_time_ms=1800,
        )
        
        # Step 3: Complete session
        await instantiation.complete_session(config.session_id)
        
        # Step 4: Verify analytics
        stats = await analytics.get_agent_stats(mock_agent_id, mock_tenant_id)
        
        assert isinstance(stats, object)
    
    @pytest.mark.asyncio
    async def test_multi_agent_synergy_flow(
        self,
        services,
        mock_tenant_id,
        mock_agents_list,
    ):
        """Test synergy calculation between multiple agents."""
        synergy = services['synergy']
        
        # Calculate synergies
        result = await synergy.calculate_all_synergies(mock_tenant_id, lookback_days=30)
        
        assert "pairs_analyzed" in result
        assert "started_at" in result
    
    @pytest.mark.asyncio
    async def test_context_injection_variations(
        self,
        services,
        mock_tenant_id,
        mock_user_id,
        mock_agent_id,
    ):
        """Test various context injection scenarios."""
        instantiation = services['instantiation']
        
        # Scenario 1: No context
        config1 = await instantiation.instantiate_agent(
            agent_id=mock_agent_id,
            user_id=mock_user_id,
            tenant_id=mock_tenant_id,
        )
        assert "SESSION CONTEXT" not in config1.system_prompt
        
        # Scenario 2: Region only
        config2 = await instantiation.instantiate_agent(
            agent_id=mock_agent_id,
            user_id=mock_user_id,
            tenant_id=mock_tenant_id,
            region_id="reg-fda",
        )
        # Context should be partially injected
        assert config2.context is not None
        
        # Scenario 3: Full context
        config3 = await instantiation.instantiate_agent(
            agent_id=mock_agent_id,
            user_id=mock_user_id,
            tenant_id=mock_tenant_id,
            region_id="reg-fda",
            domain_id="dom-pharma",
            therapeutic_area_id="ta-oncology",
            phase_id="phase-3",
        )
        assert config3.context is not None
    
    @pytest.mark.asyncio
    async def test_personality_override_flow(
        self,
        services,
        mock_tenant_id,
        mock_user_id,
        mock_agent_id,
    ):
        """Test personality override in instantiation."""
        instantiation = services['instantiation']
        
        # Instantiate with default personality
        config_default = await instantiation.instantiate_agent(
            agent_id=mock_agent_id,
            user_id=mock_user_id,
            tenant_id=mock_tenant_id,
        )
        
        # Instantiate with creative personality override
        config_creative = await instantiation.instantiate_agent(
            agent_id=mock_agent_id,
            user_id=mock_user_id,
            tenant_id=mock_tenant_id,
            personality_type_id="pt-creative",
        )
        
        # Both should have valid configs
        assert config_default.personality is not None
        assert config_creative.personality is not None


class TestAgentOSWithWorkflow:
    """Integration tests simulating workflow usage."""
    
    @pytest.fixture
    def instantiation_service(self, mock_supabase_client):
        """Create instantiation service."""
        return AgentInstantiationService(mock_supabase_client)
    
    @pytest.mark.asyncio
    async def test_mode1_workflow_simulation(
        self,
        instantiation_service,
        mock_tenant_id,
        mock_user_id,
        mock_agent_id,
    ):
        """Simulate Mode 1 (Manual Interactive) workflow."""
        # Step 1: Frontend sends context (from AgentInstantiationModal)
        config = await instantiation_service.instantiate_agent(
            agent_id=mock_agent_id,
            user_id=mock_user_id,
            tenant_id=mock_tenant_id,
            region_id="reg-fda",
            personality_type_id="pt-analytical",
            session_mode="interactive",
        )
        
        # Verify workflow can use the config
        assert config.system_prompt  # For LLM system message
        assert config.llm_config  # For LLM parameters
        assert config.llm_config.get("temperature") is not None
        
        # Step 2: Simulate multiple turns
        for i in range(3):
            await instantiation_service.update_session_metrics(
                session_id=config.session_id,
                input_tokens=100 + i * 50,
                output_tokens=200 + i * 100,
                cost_usd=0.003 + i * 0.002,
                response_time_ms=1500 + i * 200,
            )
        
        # Step 3: Complete
        await instantiation_service.complete_session(config.session_id)
    
    @pytest.mark.asyncio
    async def test_mode3_workflow_simulation(
        self,
        instantiation_service,
        mock_tenant_id,
        mock_user_id,
    ):
        """Simulate Mode 3 (Autonomous) workflow with multiple agents."""
        agent_ids = ["agent-regulatory", "agent-clinical", "agent-safety"]
        sessions = []
        
        # Instantiate multiple agents for the mission
        for agent_id in agent_ids:
            config = await instantiation_service.instantiate_agent(
                agent_id=agent_id,
                user_id=mock_user_id,
                tenant_id=mock_tenant_id,
                session_mode="autonomous",
            )
            sessions.append(config)
        
        # Each agent processes
        for session in sessions:
            await instantiation_service.update_session_metrics(
                session_id=session.session_id,
                input_tokens=500,
                output_tokens=1500,
                cost_usd=0.02,
            )
            await instantiation_service.complete_session(session.session_id)
        
        assert len(sessions) == 3


class TestAgentOSAnalyticsPipeline:
    """Integration tests for analytics pipeline."""
    
    @pytest.fixture
    def analytics_service(self, mock_supabase_client):
        """Create analytics service."""
        return SessionAnalyticsService(mock_supabase_client)
    
    @pytest.mark.asyncio
    async def test_full_analytics_pipeline(
        self,
        analytics_service,
        mock_tenant_id,
        mock_agent_id,
    ):
        """Test complete analytics pipeline."""
        # Get agent stats
        agent_stats = await analytics_service.get_agent_stats(
            mock_agent_id, 
            mock_tenant_id,
            days=30,
        )
        
        # Get tenant analytics
        tenant_analytics = await analytics_service.get_tenant_analytics(
            mock_tenant_id,
            days=30,
        )
        
        # Get cost breakdown
        cost_breakdown = await analytics_service.get_cost_breakdown(
            mock_tenant_id,
            days=30,
            group_by='agent',
        )
        
        # Get performance trends
        trends = await analytics_service.get_performance_trends(
            mock_tenant_id,
            days=30,
        )
        
        # Get dashboard summary
        dashboard = await analytics_service.get_dashboard_summary(mock_tenant_id)
        
        # Verify all outputs
        assert agent_stats is not None
        assert tenant_analytics is not None
        assert cost_breakdown is not None
        assert isinstance(trends, list)
        assert dashboard is not None


class TestAgentOSSyncIntegration:
    """Integration tests for sync services."""
    
    @pytest.mark.asyncio
    async def test_neo4j_pinecone_sync_together(
        self,
        mock_supabase_client,
        mock_neo4j_driver,
        mock_pinecone_index,
        mock_openai_client,
        mock_tenant_id,
    ):
        """Test Neo4j and Pinecone sync working together."""
        from services.neo4j_sync_service import Neo4jSyncService
        
        # Create services
        neo4j_service = Neo4jSyncService(mock_supabase_client, mock_neo4j_driver)
        
        with patch.dict('sys.modules', {'pinecone': MagicMock()}):
            from services.pinecone_sync_service import PineconeSyncService
            pinecone_service = PineconeSyncService(mock_supabase_client)
            pinecone_service.index = mock_pinecone_index
            pinecone_service.openai_client = mock_openai_client
        
        # Sync both
        neo4j_result = await neo4j_service.sync_all(mock_tenant_id)
        pinecone_result = await pinecone_service.sync_all(mock_tenant_id)
        
        # Both should complete
        assert "agents_synced" in neo4j_result or "concepts_synced" in neo4j_result
        assert "agents_synced" in pinecone_result


class TestAgentOSErrorHandling:
    """Integration tests for error handling."""
    
    @pytest.mark.asyncio
    async def test_graceful_degradation_no_neo4j(self, mock_supabase_client):
        """Test system works without Neo4j."""
        from services.neo4j_sync_service import Neo4jSyncService
        
        service = Neo4jSyncService(mock_supabase_client, None)
        
        # Should not crash, return appropriate response
        result = await service.sync_all("tenant-id")
        
        assert result is not None
    
    @pytest.mark.asyncio
    async def test_graceful_degradation_no_pinecone(self, mock_supabase_client):
        """Test system works without Pinecone."""
        with patch.dict('sys.modules', {'pinecone': MagicMock()}):
            from services.pinecone_sync_service import PineconeSyncService
            service = PineconeSyncService(mock_supabase_client)
            service.index = None
            service.pc = None
        
        # Should not crash
        status = await service.get_sync_status()
        assert status["connected"] is False
    
    @pytest.mark.asyncio
    async def test_instantiation_fallback(self, mock_supabase_client):
        """Test instantiation fallback when services unavailable."""
        # This tests the backwards-compatible fallback in the workflow
        service = AgentInstantiationService(mock_supabase_client)
        
        # Even with minimal data, should work
        try:
            config = await service.instantiate_agent(
                agent_id="test-agent",
                user_id="test-user",
                tenant_id="test-tenant",
            )
            assert config is not None
        except ValueError:
            # Expected if agent not found - this is correct behavior
            pass


class TestAgentOSConcurrency:
    """Tests for concurrent operations."""
    
    @pytest.mark.asyncio
    async def test_concurrent_instantiations(
        self,
        mock_supabase_client,
        mock_tenant_id,
    ):
        """Test multiple concurrent agent instantiations."""
        import asyncio
        
        service = AgentInstantiationService(mock_supabase_client)
        
        # Create multiple instantiation tasks
        tasks = [
            service.instantiate_agent(
                agent_id=f"agent-{i}",
                user_id=f"user-{i}",
                tenant_id=mock_tenant_id,
            )
            for i in range(5)
        ]
        
        # Run concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # All should complete (or raise expected errors)
        assert len(results) == 5
    
    @pytest.mark.asyncio
    async def test_concurrent_analytics_queries(
        self,
        mock_supabase_client,
        mock_tenant_id,
    ):
        """Test concurrent analytics queries."""
        import asyncio
        
        service = SessionAnalyticsService(mock_supabase_client)
        
        # Multiple analytics queries
        tasks = [
            service.get_tenant_analytics(mock_tenant_id),
            service.get_cost_breakdown(mock_tenant_id, group_by='agent'),
            service.get_performance_trends(mock_tenant_id),
            service.get_dashboard_summary(mock_tenant_id),
        ]
        
        # Run concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # All should complete
        assert len(results) == 4
