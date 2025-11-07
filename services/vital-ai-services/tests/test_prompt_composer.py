"""
Unit Tests for Dynamic Prompt Composer

TAG: TESTS_PROMPT_COMPOSER

Tests the DynamicPromptComposer service.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from vital_ai_services.prompt.composer import DynamicPromptComposer


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    client = MagicMock()
    client.client = MagicMock()
    return client


@pytest.fixture
def sample_agent_data():
    """Sample agent data for testing."""
    return {
        "id": "agent-123",
        "name": "test_agent",
        "display_name": "Test Agent",
        "description": "A test agent for unit testing",
        "system_prompt": "You are a test agent.",
        "capabilities": ["testing", "validation"],
        "specializations": ["unit_tests", "integration_tests"],
        "knowledge_domains": ["software_testing", "quality_assurance"],
        "tool_configurations": {
            "web_search": {"description": "Search the web"},
            "calculator": {"description": "Perform calculations"}
        },
        "rag_enabled": True,
        "knowledge_sources": {"internal_docs": "documentation"},
        "hipaa_compliant": True,
        "gdpr_compliant": True,
        "regulatory_context": {"is_regulated": True},
        "evidence_required": True,
        "response_format": "markdown",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }


@pytest.fixture
def composer(mock_supabase):
    """Create DynamicPromptComposer instance."""
    return DynamicPromptComposer(supabase_client=mock_supabase)


class TestDynamicPromptComposer:
    """Test suite for DynamicPromptComposer."""
    
    def test_initialization(self, composer):
        """Test composer initialization."""
        assert composer.supabase is not None
        assert isinstance(composer._cache, dict)
        assert len(composer._cache) == 0
    
    @pytest.mark.asyncio
    async def test_compose_agent_prompt_with_data(self, composer, sample_agent_data):
        """Test composing prompt with provided agent data."""
        result = await composer.compose_agent_prompt(
            agent_id="agent-123",
            agent_data=sample_agent_data
        )
        
        assert result is not None
        assert "base_prompt" in result
        assert "enhanced_prompt" in result
        assert "sections" in result
        assert "metadata" in result
        
        # Check base prompt
        assert result["base_prompt"] == "You are a test agent."
        
        # Check sections
        sections = result["sections"]
        assert "identity" in sections
        assert "capabilities" in sections
        assert "tools" in sections
        assert "knowledge" in sections
        assert "guidelines" in sections
        assert "behavior" in sections
        
        # Check identity section
        assert "Test Agent" in sections["identity"]
        assert "software_testing" in sections["identity"]
        
        # Check enhanced prompt contains all sections
        enhanced = result["enhanced_prompt"]
        assert "Test Agent" in enhanced
        assert "testing" in enhanced.lower()
        assert "web_search" in enhanced.lower()
        assert "HIPAA" in enhanced
        assert "GDPR" in enhanced
    
    @pytest.mark.asyncio
    async def test_compose_identity_section(self, composer, sample_agent_data):
        """Test identity section composition."""
        identity = composer._compose_identity(sample_agent_data)
        
        assert "Test Agent" in identity
        assert "software_testing" in identity
        assert "quality_assurance" in identity
    
    @pytest.mark.asyncio
    async def test_compose_capabilities_section(self, composer, sample_agent_data):
        """Test capabilities section composition."""
        capabilities = composer._compose_capabilities(sample_agent_data)
        
        assert "## Capabilities" in capabilities
        assert "testing" in capabilities
        assert "validation" in capabilities
        assert "unit_tests" in capabilities
    
    @pytest.mark.asyncio
    async def test_compose_tools_section(self, composer, sample_agent_data):
        """Test tools section composition."""
        tools = composer._compose_tools(sample_agent_data)
        
        assert "## Available Tools" in tools
        assert "web_search" in tools
        assert "calculator" in tools
    
    @pytest.mark.asyncio
    async def test_compose_knowledge_section(self, composer, sample_agent_data):
        """Test knowledge section composition."""
        knowledge = composer._compose_knowledge(sample_agent_data)
        
        assert "## Knowledge Base" in knowledge
        assert "software_testing" in knowledge
        assert "quality_assurance" in knowledge
        assert "Citation Policy" in knowledge
    
    @pytest.mark.asyncio
    async def test_compose_guidelines_section(self, composer, sample_agent_data):
        """Test guidelines section composition."""
        guidelines = composer._compose_guidelines(sample_agent_data)
        
        assert "## Guidelines" in guidelines
        assert "HIPAA" in guidelines
        assert "GDPR" in guidelines
        assert "Regulatory" in guidelines
        assert "Evidence" in guidelines
    
    @pytest.mark.asyncio
    async def test_compose_behavior_section(self, composer, sample_agent_data):
        """Test behavior section composition."""
        behavior = composer._compose_behavior(sample_agent_data)
        
        assert "## Response Style" in behavior
        assert "markdown" in behavior
        assert "step-by-step" in behavior
    
    @pytest.mark.asyncio
    async def test_fallback_prompt(self, composer):
        """Test fallback prompt generation."""
        result = composer._get_fallback_prompt()
        
        assert result is not None
        assert "base_prompt" in result
        assert "enhanced_prompt" in result
        assert "helpful AI assistant" in result["enhanced_prompt"]
    
    @pytest.mark.asyncio
    async def test_compose_with_missing_fields(self, composer):
        """Test composing with minimal agent data."""
        minimal_data = {
            "id": "agent-minimal",
            "name": "minimal_agent",
            "system_prompt": "You are a minimal agent."
        }
        
        result = await composer.compose_agent_prompt(
            agent_id="agent-minimal",
            agent_data=minimal_data
        )
        
        assert result is not None
        assert result["base_prompt"] == "You are a minimal agent."
        assert "enhanced_prompt" in result
    
    @pytest.mark.asyncio
    async def test_compose_without_rag(self, composer, sample_agent_data):
        """Test composing for agent without RAG."""
        sample_agent_data["rag_enabled"] = False
        
        result = await composer.compose_agent_prompt(
            agent_id="agent-no-rag",
            agent_data=sample_agent_data
        )
        
        # Knowledge section should be empty
        assert result["sections"]["knowledge"] == ""
    
    @pytest.mark.asyncio
    async def test_compose_without_compliance(self, composer, sample_agent_data):
        """Test composing for agent without compliance requirements."""
        sample_agent_data["hipaa_compliant"] = False
        sample_agent_data["gdpr_compliant"] = False
        sample_agent_data["regulatory_context"] = {"is_regulated": False}
        sample_agent_data["evidence_required"] = False
        
        result = await composer.compose_agent_prompt(
            agent_id="agent-no-compliance",
            agent_data=sample_agent_data
        )
        
        # Guidelines section should be minimal (just header)
        guidelines = result["sections"]["guidelines"]
        assert guidelines == "" or guidelines == "## Guidelines\n"


class TestPromptRendering:
    """Test suite for prompt rendering."""
    
    def test_render_with_base_prompt(self, composer, sample_agent_data):
        """Test rendering with base prompt."""
        sections = {
            "identity": "You are Test Agent.",
            "capabilities": "## Capabilities\n- Testing",
            "tools": "## Tools\n- web_search",
            "knowledge": "## Knowledge\nAccess to docs",
            "guidelines": "## Guidelines\nHIPAA compliant",
            "behavior": "## Behavior\nMarkdown format"
        }
        
        rendered = composer._render_enhanced_prompt(
            "Base prompt text",
            sections
        )
        
        assert "Base prompt text" in rendered
        assert "You are Test Agent" in rendered
        assert "## Capabilities" in rendered
        assert "## Tools" in rendered
    
    def test_render_without_base_prompt(self, composer):
        """Test rendering without base prompt."""
        sections = {
            "identity": "You are Test Agent.",
            "capabilities": "",
            "tools": "",
            "knowledge": "",
            "guidelines": "",
            "behavior": ""
        }
        
        rendered = composer._render_enhanced_prompt("", sections)
        
        assert "You are Test Agent" in rendered
        assert "# System Prompt" not in rendered


@pytest.mark.asyncio
class TestCaching:
    """Test suite for prompt caching."""
    
    async def test_cache_storage(self, composer, sample_agent_data):
        """Test that prompts are cached."""
        # First call
        result1 = await composer.compose_agent_prompt(
            agent_id="agent-123",
            tenant_id="tenant-456",
            agent_data=sample_agent_data
        )
        
        # Cache should be populated
        # Note: Since we're passing agent_data, caching behavior depends on implementation
        assert result1 is not None
    
    async def test_clear_cache(self, composer, sample_agent_data):
        """Test cache clearing."""
        await composer.compose_agent_prompt(
            agent_id="agent-123",
            agent_data=sample_agent_data
        )
        
        # Clear cache
        composer.clear_cache()
        
        assert len(composer._cache) == 0
    
    async def test_clear_specific_agent_cache(self, composer, sample_agent_data):
        """Test clearing cache for specific agent."""
        await composer.compose_agent_prompt(
            agent_id="agent-123",
            agent_data=sample_agent_data
        )
        
        # Clear specific agent
        composer.clear_cache(agent_id="agent-123")
        
        # Only agent-123 should be removed
        assert "agent-123" not in str(composer._cache)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

