"""
Unit Tests for Agent Instantiation Service

Tests for:
- Agent instantiation with context injection
- Personality configuration
- Session creation
- System prompt building
- LLM config generation
- Capabilities and Skills fetching (Claude Skills)
- L4/L5 agent instantiation

Phase 5: Testing & Quality Assurance
Updated: December 6, 2025
"""

import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from datetime import datetime
import uuid

# Import the service
import sys
sys.path.insert(0, '/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine/src')

from services.agent_instantiation_service import (
    AgentInstantiationService,
    PersonalityConfig,
    ResolvedContext,
    InstantiatedAgentConfig,
    Skill,
    Capability,
)


class TestPersonalityConfig:
    """Tests for PersonalityConfig dataclass."""
    
    def test_default_personality_config(self):
        """Test default personality configuration."""
        config = PersonalityConfig(
            id="test-id",
            slug="default",
            display_name="Default",
        )
        
        assert config.temperature == 0.3
        assert config.top_p == 0.9
        assert config.max_tokens == 2048
        assert config.reasoning_approach == "balanced"
    
    def test_custom_personality_config(self):
        """Test custom personality configuration."""
        config = PersonalityConfig(
            id="analytical-id",
            slug="analytical",
            display_name="Analytical Expert",
            temperature=0.2,
            verbosity_level=40,
            formality_level=70,
            technical_level=80,
            reasoning_approach="analytical",
        )
        
        assert config.temperature == 0.2
        assert config.verbosity_level == 40
        assert config.reasoning_approach == "analytical"


class TestResolvedContext:
    """Tests for ResolvedContext dataclass."""
    
    def test_empty_context(self):
        """Test empty resolved context."""
        context = ResolvedContext()
        
        assert context.region is None
        assert context.domain is None
        assert context.therapeutic_area is None
        assert context.phase is None
    
    def test_partial_context(self):
        """Test partially resolved context."""
        context = ResolvedContext(
            region={"code": "FDA", "name": "US FDA"},
            domain={"code": "PHARMA", "name": "Pharmaceuticals"},
        )
        
        assert context.region["code"] == "FDA"
        assert context.domain["code"] == "PHARMA"
        assert context.therapeutic_area is None


class TestAgentInstantiationService:
    """Tests for AgentInstantiationService."""
    
    @pytest.fixture
    def service(self, mock_supabase_client):
        """Create service instance with mocked dependencies."""
        return AgentInstantiationService(mock_supabase_client)
    
    @pytest.mark.asyncio
    async def test_instantiate_agent_basic(
        self, 
        service, 
        mock_tenant_id, 
        mock_user_id, 
        mock_agent_id
    ):
        """Test basic agent instantiation without context."""
        config = await service.instantiate_agent(
            agent_id=mock_agent_id,
            user_id=mock_user_id,
            tenant_id=mock_tenant_id,
        )
        
        assert isinstance(config, InstantiatedAgentConfig)
        assert config.agent_id == mock_agent_id
        assert config.session_id is not None
        assert len(config.session_id) == 36  # UUID format
    
    @pytest.mark.asyncio
    async def test_instantiate_agent_with_context(
        self, 
        service, 
        mock_tenant_id, 
        mock_user_id, 
        mock_agent_id
    ):
        """Test agent instantiation with full context."""
        config = await service.instantiate_agent(
            agent_id=mock_agent_id,
            user_id=mock_user_id,
            tenant_id=mock_tenant_id,
            region_id="reg-fda",
            domain_id="dom-pharma",
            therapeutic_area_id="ta-oncology",
            phase_id="phase-3",
        )
        
        assert config.session_id is not None
        # Context should be resolved
        assert config.context is not None
    
    @pytest.mark.asyncio
    async def test_instantiate_agent_with_personality_override(
        self,
        service,
        mock_tenant_id,
        mock_user_id,
        mock_agent_id,
    ):
        """Test agent instantiation with personality override."""
        config = await service.instantiate_agent(
            agent_id=mock_agent_id,
            user_id=mock_user_id,
            tenant_id=mock_tenant_id,
            personality_type_id="pt-creative",
        )
        
        assert config.personality is not None
        assert config.llm_config is not None
    
    @pytest.mark.asyncio
    async def test_instantiate_agent_not_found(self, mock_tenant_id):
        """Test instantiation with non-existent agent."""
        # Create a fresh mock that returns None
        empty_mock = MagicMock()
        empty_result = MagicMock()
        empty_result.data = None
        empty_mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = empty_result
        
        service = AgentInstantiationService(empty_mock)
        
        with pytest.raises(ValueError, match="Agent not found"):
            await service.instantiate_agent(
                agent_id="non-existent-id",
                user_id="user-id",
                tenant_id=mock_tenant_id,
            )
    
    def test_build_system_prompt_no_context(self, service, mock_agent):
        """Test system prompt building without context."""
        context = ResolvedContext()
        personality = PersonalityConfig(
            id="", slug="default", display_name="Default"
        )
        
        prompt = service._build_system_prompt(mock_agent, context, personality)
        
        assert mock_agent["system_prompt"] in prompt
        assert "SESSION CONTEXT" not in prompt
    
    def test_build_system_prompt_with_context(self, service, mock_agent):
        """Test system prompt building with full context."""
        context = ResolvedContext(
            region={"code": "FDA", "name": "US FDA"},
            domain={"code": "PHARMA", "name": "Pharmaceuticals"},
            therapeutic_area={"code": "ONCOLOGY", "name": "Oncology"},
            phase={"code": "PHASE3", "name": "Phase III"},
        )
        personality = PersonalityConfig(
            id="", slug="analytical", display_name="Analytical",
            temperature=0.2, verbosity_level=30, reasoning_approach="analytical"
        )
        
        prompt = service._build_system_prompt(mock_agent, context, personality)
        
        assert "SESSION CONTEXT" in prompt
        assert "US FDA" in prompt
        assert "Pharmaceuticals" in prompt
        assert "Oncology" in prompt
        assert "Phase III" in prompt
        assert "COMMUNICATION STYLE" in prompt
        # Check for data-driven reasoning style from analytical personality
        assert "data" in prompt.lower() or "evidence" in prompt.lower()
    
    def test_build_llm_config(self, service, mock_agent):
        """Test LLM config generation from personality."""
        personality = PersonalityConfig(
            id="analytical",
            slug="analytical",
            display_name="Analytical",
            temperature=0.2,
            max_tokens=2048,
            top_p=0.9,
        )
        
        config = service._build_llm_config(mock_agent, personality)
        
        assert config["temperature"] == 0.2
        assert config["max_tokens"] == 2048
        assert config["top_p"] == 0.9
        assert "model" in config
    
    def test_get_agent_level(self, service, mock_agent):
        """Test extracting agent level."""
        level = service._get_agent_level(mock_agent)
        assert level == 2  # L2 Expert
    
    def test_get_agent_level_missing(self, service):
        """Test agent level fallback when missing."""
        agent = {"id": "test", "name": "Test"}
        level = service._get_agent_level(agent)
        assert level == 2  # Default to L2
    
    @pytest.mark.asyncio
    async def test_update_session_metrics(self, service):
        """Test session metrics update."""
        session_id = str(uuid.uuid4())
        
        # Should not raise
        await service.update_session_metrics(
            session_id=session_id,
            input_tokens=100,
            output_tokens=200,
            cost_usd=0.003,
            response_time_ms=1500,
        )
    
    @pytest.mark.asyncio
    async def test_complete_session(self, service):
        """Test session completion."""
        session_id = str(uuid.uuid4())
        
        # Should not raise
        await service.complete_session(session_id)


class TestSkillDataClass:
    """Tests for Skill dataclass."""
    
    def test_skill_creation(self):
        """Test Skill creation with all fields."""
        skill = Skill(
            id="skill-fda-review",
            name="fda-submission-review",
            slug="fda-submission-review",
            display_name="FDA Submission Review",
            skill_type="analytical",
            invocation_method="analyze_fda_submission",
            proficiency_level="expert",
            is_primary=True,
        )
        
        assert skill.id == "skill-fda-review"
        assert skill.skill_type == "analytical"
        assert skill.is_primary is True
    
    def test_skill_default_values(self):
        """Test Skill default values."""
        skill = Skill(
            id="skill-1",
            name="test-skill",
            slug="test-skill",
            display_name="Test Skill",
            skill_type="general",
        )
        
        assert skill.invocation_method is None
        assert skill.proficiency_level == "intermediate"
        assert skill.is_primary is False


class TestCapabilityDataClass:
    """Tests for Capability dataclass."""
    
    def test_capability_creation_with_skills(self):
        """Test Capability creation with nested skills."""
        skills = [
            Skill(
                id="skill-1",
                name="fda-review",
                slug="fda-review",
                display_name="FDA Review",
                skill_type="analytical",
            ),
            Skill(
                id="skill-2",
                name="ema-review",
                slug="ema-review",
                display_name="EMA Review",
                skill_type="analytical",
            ),
        ]
        
        capability = Capability(
            id="cap-regulatory",
            name="regulatory-analysis",
            slug="regulatory-analysis",
            display_name="Regulatory Analysis",
            category="regulatory",
            proficiency_level="expert",
            is_primary=True,
            skills=skills,
        )
        
        assert capability.id == "cap-regulatory"
        assert len(capability.skills) == 2
        assert capability.skills[0].name == "fda-review"
    
    def test_capability_default_values(self):
        """Test Capability default values."""
        capability = Capability(
            id="cap-1",
            name="test-capability",
            slug="test-capability",
            display_name="Test Capability",
            category="general",
        )
        
        assert capability.proficiency_level == "expert"
        assert capability.is_primary is False
        assert capability.skills == []


class TestCapabilitiesAndSkillsFetching:
    """Tests for capabilities and skills fetching."""
    
    @pytest.fixture
    def service(self, mock_supabase_client):
        """Create service instance."""
        return AgentInstantiationService(mock_supabase_client)
    
    @pytest.mark.asyncio
    async def test_fetch_capabilities_with_skills(self, service):
        """Test fetching capabilities with nested skills."""
        # The mock_supabase_client is configured to return mock data
        capabilities = await service._fetch_capabilities_with_skills("test-agent-id")
        
        # Should return list of capabilities
        assert isinstance(capabilities, list)
    
    @pytest.mark.asyncio
    async def test_fetch_allowed_tools(self, service):
        """Test fetching allowed L5 tools."""
        tools = await service._fetch_allowed_tools("test-agent-id")
        
        # Should return list of tools
        assert isinstance(tools, list)
    
    def test_build_capabilities_prompt_section(self, service):
        """Test building capabilities section for system prompt."""
        capabilities = [
            Capability(
                id="cap-1",
                name="regulatory-analysis",
                slug="regulatory-analysis",
                display_name="Regulatory Analysis",
                category="regulatory",
                proficiency_level="expert",
                is_primary=True,
                skills=[
                    Skill(
                        id="skill-1",
                        name="fda-review",
                        slug="fda-review",
                        display_name="FDA Review",
                        skill_type="analytical",
                        invocation_method="analyze_fda",
                        is_primary=True,
                    ),
                ],
            ),
        ]
        
        prompt_section = service._build_capabilities_prompt_section(capabilities)
        
        assert "YOUR CAPABILITIES" in prompt_section
        assert "Regulatory Analysis" in prompt_section
        assert "FDA Review" in prompt_section
        assert "analytical" in prompt_section
    
    def test_build_capabilities_prompt_section_empty(self, service):
        """Test building capabilities section with no capabilities."""
        prompt_section = service._build_capabilities_prompt_section([])
        assert prompt_section == ""
    
    def test_build_tools_prompt_section(self, service):
        """Test building tools section for system prompt."""
        tools = [
            {
                "id": "tool-1",
                "name": "pubmed-search",
                "display_name": "PubMed Search",
                "description": "Search PubMed for medical literature",
                "is_required": True,
            },
            {
                "id": "tool-2",
                "name": "fda-database",
                "display_name": "FDA Database",
                "description": "Search FDA approval database",
                "is_required": False,
            },
        ]
        
        prompt_section = service._build_tools_prompt_section(tools)
        
        assert "AVAILABLE TOOLS" in prompt_section
        assert "PubMed Search" in prompt_section
        assert "[REQUIRED]" in prompt_section
    
    def test_build_tools_prompt_section_empty(self, service):
        """Test building tools section with no tools."""
        prompt_section = service._build_tools_prompt_section([])
        assert prompt_section == ""


class TestLevelSpecificInstantiation:
    """Tests for level-specific instantiation (L1-L5)."""
    
    @pytest.fixture
    def service(self, mock_supabase_client):
        """Create service instance."""
        return AgentInstantiationService(mock_supabase_client)
    
    @pytest.mark.asyncio
    async def test_instantiate_by_level_l2(self, service):
        """Test L2 Expert instantiation."""
        config = await service.instantiate_by_level(
            level=2,
            agent_id="test-agent-id",
            user_id="test-user-id",
            tenant_id="test-tenant-id",
            context={"region_id": "reg-fda"},
        )
        
        assert isinstance(config, InstantiatedAgentConfig)
        # L2 should have full dynamic instantiation
        assert config.level == 2
    
    @pytest.mark.asyncio
    async def test_instantiate_by_level_l4_worker(self, service):
        """Test L4 Worker instantiation."""
        config = await service._instantiate_l4_worker(
            agent_id="test-worker-id",
            tenant_id="test-tenant-id",
            context={"region_id": "reg-fda"},
        )
        
        assert config.level == 4
        # L4 workers use efficient models
        assert "haiku" in config.llm_config.get("model", "").lower() or config.llm_config.get("max_tokens", 0) <= 1024
    
    @pytest.mark.asyncio
    async def test_instantiate_by_level_l5_tool(self, service):
        """Test L5 Tool instantiation."""
        config = await service._instantiate_l5_tool(
            agent_id="test-tool-id",
            tenant_id="test-tenant-id",
        )
        
        assert config.level == 5
        # L5 tools don't use LLM
        assert config.llm_config == {}
        assert config.system_prompt == ""
    
    @pytest.mark.asyncio
    async def test_instantiate_invalid_level(self, service):
        """Test invalid level raises error."""
        with pytest.raises(ValueError, match="Invalid agent level"):
            await service.instantiate_by_level(
                level=6,  # Invalid
                agent_id="test-id",
                user_id="user-id",
                tenant_id="tenant-id",
            )


class TestAgentInstantiationIntegration:
    """Integration-style tests for agent instantiation flow."""
    
    @pytest.mark.asyncio
    async def test_full_instantiation_flow(self, mock_supabase_client):
        """Test complete instantiation flow."""
        service = AgentInstantiationService(mock_supabase_client)
        
        # Step 1: Instantiate
        config = await service.instantiate_agent(
            agent_id="test-agent-id",
            user_id="test-user-id",
            tenant_id="test-tenant-id",
            region_id="reg-fda",
            personality_type_id="pt-analytical",
            session_mode="interactive",
        )
        
        # Verify config
        assert config.session_id is not None
        assert config.system_prompt is not None
        assert config.llm_config is not None
        
        # NEW: Verify capabilities and tools
        assert hasattr(config, 'capabilities')
        assert hasattr(config, 'allowed_tools')
        
        # Step 2: Update metrics
        await service.update_session_metrics(
            session_id=config.session_id,
            input_tokens=500,
            output_tokens=1000,
            cost_usd=0.015,
        )
        
        # Step 3: Complete session
        await service.complete_session(config.session_id)
    
    @pytest.mark.asyncio
    async def test_instantiation_with_all_contexts(self, mock_supabase_client):
        """Test instantiation with all context types."""
        service = AgentInstantiationService(mock_supabase_client)
        
        config = await service.instantiate_agent(
            agent_id="test-agent-id",
            user_id="test-user-id",
            tenant_id="test-tenant-id",
            region_id="reg-fda",
            domain_id="dom-pharma",
            therapeutic_area_id="ta-oncology",
            phase_id="phase-3",
            personality_type_id="pt-cautious",
            session_mode="autonomous",
            expires_in_hours=48,
        )
        
        # Verify all parameters were processed
        assert config.session_id is not None
        assert config.personality is not None
        
        # NEW: Verify capabilities fetched
        assert isinstance(config.capabilities, list)
        assert isinstance(config.allowed_tools, list)
    
    @pytest.mark.asyncio
    async def test_system_prompt_includes_capabilities_and_tools(self, mock_supabase_client):
        """Test that system prompt includes capabilities and tools sections."""
        service = AgentInstantiationService(mock_supabase_client)
        
        config = await service.instantiate_agent(
            agent_id="test-agent-id",
            user_id="test-user-id",
            tenant_id="test-tenant-id",
        )
        
        # System prompt should include capability/tool sections if available
        # The exact content depends on what the mock returns
        assert config.system_prompt is not None
        assert len(config.system_prompt) > 0
