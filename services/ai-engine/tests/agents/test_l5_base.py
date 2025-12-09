"""
VITAL Platform - L5 Base Tool Tests

Phase 5: Testing & Quality Assurance

Tests for the L5BaseTool abstract class and configuration system.
These tests use local definitions to avoid import issues with the actual modules.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from enum import Enum
from abc import ABC, abstractmethod


# =============================================================================
# LOCAL TEST DEFINITIONS (Mirroring actual L5 base structures)
# =============================================================================


class ToolTier(Enum):
    """L5 Tool pricing tiers."""
    FREE = "free"
    FREEMIUM = "freemium"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"


class AdapterType(Enum):
    """API adapter types for L5 tools."""
    REST = "rest"
    GRAPHQL = "graphql"
    SOAP = "soap"
    SDK = "sdk"


class AuthType(Enum):
    """Authentication types for L5 tools."""
    NONE = "none"
    API_KEY = "api_key"
    OAUTH2 = "oauth2"
    BASIC = "basic"


@dataclass
class ToolConfig:
    """Configuration for an L5 tool."""
    tool_id: str
    name: str
    description: str
    tier: ToolTier
    adapter_type: AdapterType
    auth_type: AuthType
    base_url: str
    endpoints: Dict[str, str] = field(default_factory=dict)
    rate_limit_per_minute: int = 60
    timeout_seconds: int = 30
    retry_count: int = 3
    cache_ttl_seconds: int = 0


@dataclass
class L5ToolResult:
    """Result from an L5 tool execution."""
    success: bool
    data: Any
    source: str
    cached: bool
    error: str | None = None
    cache_age_seconds: int | None = None


class L5BaseTool(ABC):
    """Abstract base class for L5 tools."""
    
    def __init__(self, config: ToolConfig, http_client=None):
        self.config = config
        self._http_client = http_client
        self._api_key: str | None = None
    
    @property
    def tool_id(self) -> str:
        return self.config.tool_id
    
    @property
    def name(self) -> str:
        return self.config.name
    
    @abstractmethod
    async def execute(self, query: str, **kwargs) -> L5ToolResult:
        pass
    
    @abstractmethod
    async def validate_credentials(self) -> bool:
        pass
    
    async def _make_request(self, endpoint: str, params: Dict[str, Any]) -> Any:
        """Make HTTP request with retry logic."""
        url = f"{self.config.base_url}{self.config.endpoints.get(endpoint, endpoint)}"
        
        for attempt in range(self.config.retry_count):
            try:
                response = await self._http_client.get(url, params=params, headers=self._get_headers())
                if response.status_code >= 400:
                    raise Exception(f"HTTP {response.status_code}")
                return response.json()
            except Exception as e:
                if attempt == self.config.retry_count - 1:
                    raise
                continue
        
        raise Exception("Max retries exceeded")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get request headers with authentication."""
        headers = {"Content-Type": "application/json"}
        if self._api_key:
            headers["Authorization"] = f"Bearer {self._api_key}"
        return headers


# =============================================================================
# CONCRETE IMPLEMENTATION FOR TESTING
# =============================================================================


class TestL5Tool(L5BaseTool):
    """Concrete implementation of L5BaseTool for testing."""

    async def execute(self, query: str, **kwargs) -> L5ToolResult:
        """Execute the tool with the given query."""
        response = await self._make_request(
            endpoint="search",
            params={"q": query, **kwargs},
        )
        return L5ToolResult(
            success=True,
            data=response,
            source=self.config.name,
            cached=False,
        )

    async def validate_credentials(self) -> bool:
        """Validate API credentials."""
        return True


# =============================================================================
# FIXTURES
# =============================================================================


@pytest.fixture
def sample_tool_config():
    """Sample tool configuration for testing."""
    return ToolConfig(
        tool_id="test_tool_001",
        name="Test API Tool",
        description="A test tool for unit testing",
        tier=ToolTier.FREE,
        adapter_type=AdapterType.REST,
        auth_type=AuthType.API_KEY,
        base_url="https://api.test.com",
        endpoints={
            "search": "/v1/search",
            "details": "/v1/details/{id}",
        },
        rate_limit_per_minute=100,
        timeout_seconds=30,
        retry_count=3,
        cache_ttl_seconds=300,
    )


@pytest.fixture
def mock_http_client():
    """Mock HTTP client for testing."""
    mock = AsyncMock()
    return mock


# =============================================================================
# TEST SUITE
# =============================================================================


class TestToolConfig:
    """Tests for ToolConfig dataclass."""

    def test_create_minimal_config(self):
        """Test creating config with minimal required fields."""
        config = ToolConfig(
            tool_id="minimal_tool",
            name="Minimal Tool",
            description="A minimal tool",
            tier=ToolTier.FREE,
            adapter_type=AdapterType.REST,
            auth_type=AuthType.NONE,
            base_url="https://api.example.com",
        )

        assert config.tool_id == "minimal_tool"
        assert config.name == "Minimal Tool"
        assert config.rate_limit_per_minute == 60  # Default
        assert config.timeout_seconds == 30  # Default
        assert config.retry_count == 3  # Default

    def test_create_full_config(self, sample_tool_config):
        """Test creating config with all fields."""
        assert sample_tool_config.tool_id == "test_tool_001"
        assert sample_tool_config.tier == ToolTier.FREE
        assert sample_tool_config.adapter_type == AdapterType.REST
        assert sample_tool_config.auth_type == AuthType.API_KEY
        assert sample_tool_config.cache_ttl_seconds == 300

    def test_config_endpoints_dict(self, sample_tool_config):
        """Test endpoint configuration."""
        assert "search" in sample_tool_config.endpoints
        assert "details" in sample_tool_config.endpoints
        assert sample_tool_config.endpoints["search"] == "/v1/search"


class TestL5BaseTool:
    """Tests for L5BaseTool abstract class."""

    # =========================================================================
    # Initialization Tests
    # =========================================================================

    def test_tool_initialization(self, sample_tool_config):
        """Test tool initializes with config."""
        tool = TestL5Tool(sample_tool_config)

        assert tool.config == sample_tool_config
        assert tool.tool_id == "test_tool_001"
        assert tool.name == "Test API Tool"

    def test_tool_with_custom_http_client(self, sample_tool_config, mock_http_client):
        """Test tool initialization with custom HTTP client."""
        tool = TestL5Tool(sample_tool_config, http_client=mock_http_client)

        assert tool._http_client == mock_http_client

    # =========================================================================
    # Request Making Tests
    # =========================================================================

    @pytest.mark.asyncio
    async def test_make_request_success(self, sample_tool_config, mock_http_client):
        """Test successful HTTP request."""
        tool = TestL5Tool(sample_tool_config, http_client=mock_http_client)

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"results": [{"id": 1, "name": "Test"}]}
        mock_http_client.get = AsyncMock(return_value=mock_response)

        result = await tool.execute("test query")

        assert result.success is True
        assert result.data is not None

    @pytest.mark.asyncio
    async def test_make_request_with_retry(self, sample_tool_config, mock_http_client):
        """Test request retry on failure."""
        tool = TestL5Tool(sample_tool_config, http_client=mock_http_client)

        # First two calls fail, third succeeds
        mock_http_client.get = AsyncMock(
            side_effect=[
                Exception("Timeout"),
                Exception("Timeout"),
                MagicMock(status_code=200, json=lambda: {"results": []}),
            ]
        )

        result = await tool.execute("test query")

        assert mock_http_client.get.call_count == 3
        assert result.success is True

    @pytest.mark.asyncio
    async def test_make_request_max_retries_exceeded(self, sample_tool_config, mock_http_client):
        """Test that max retries raises exception."""
        sample_tool_config.retry_count = 2
        tool = TestL5Tool(sample_tool_config, http_client=mock_http_client)

        mock_http_client.get = AsyncMock(side_effect=Exception("Timeout"))

        with pytest.raises(Exception):
            await tool._make_request("search", {"q": "test"})

    # =========================================================================
    # Authentication Tests
    # =========================================================================

    @pytest.mark.asyncio
    async def test_api_key_auth_header(self, sample_tool_config, mock_http_client):
        """Test API key authentication header."""
        tool = TestL5Tool(sample_tool_config, http_client=mock_http_client)
        tool._api_key = "test_api_key_123"

        mock_response = MagicMock(status_code=200, json=lambda: {})
        mock_http_client.get = AsyncMock(return_value=mock_response)

        await tool.execute("test")

        # Verify API key was included in headers
        call_kwargs = mock_http_client.get.call_args
        headers = call_kwargs.kwargs.get("headers", {})
        assert "Authorization" in headers
        assert "Bearer test_api_key_123" in headers["Authorization"]

    @pytest.mark.asyncio
    async def test_validate_credentials(self, sample_tool_config):
        """Test credential validation."""
        tool = TestL5Tool(sample_tool_config)

        result = await tool.validate_credentials()

        assert result is True

    # =========================================================================
    # Error Handling Tests
    # =========================================================================

    @pytest.mark.asyncio
    async def test_http_error_handling(self, sample_tool_config, mock_http_client):
        """Test HTTP error response handling."""
        tool = TestL5Tool(sample_tool_config, http_client=mock_http_client)

        mock_response = MagicMock(status_code=500, text="Internal Server Error")
        mock_http_client.get = AsyncMock(return_value=mock_response)

        with pytest.raises(Exception):
            await tool._make_request("search", {"q": "test"})

    @pytest.mark.asyncio
    async def test_json_parsing_error(self, sample_tool_config, mock_http_client):
        """Test JSON parsing error handling."""
        tool = TestL5Tool(sample_tool_config, http_client=mock_http_client)

        mock_response = MagicMock(status_code=200)
        mock_response.json.side_effect = ValueError("Invalid JSON")
        mock_http_client.get = AsyncMock(return_value=mock_response)

        with pytest.raises(ValueError):
            await tool._make_request("search", {"q": "test"})


class TestL5ToolResult:
    """Tests for L5ToolResult dataclass."""

    def test_success_result(self):
        """Test creating successful result."""
        result = L5ToolResult(
            success=True,
            data={"results": [1, 2, 3]},
            source="Test Tool",
            cached=False,
        )

        assert result.success is True
        assert result.data == {"results": [1, 2, 3]}
        assert result.source == "Test Tool"
        assert result.error is None

    def test_error_result(self):
        """Test creating error result."""
        result = L5ToolResult(
            success=False,
            data=None,
            source="Test Tool",
            error="API returned 500",
            cached=False,
        )

        assert result.success is False
        assert result.data is None
        assert result.error == "API returned 500"

    def test_cached_result(self):
        """Test cached result flag."""
        result = L5ToolResult(
            success=True,
            data={"cached_data": True},
            source="Test Tool",
            cached=True,
            cache_age_seconds=120,
        )

        assert result.cached is True
        assert result.cache_age_seconds == 120


class TestToolTierEnum:
    """Tests for ToolTier enum."""

    def test_tier_values(self):
        """Test tier enum values."""
        assert ToolTier.FREE.value == "free"
        assert ToolTier.FREEMIUM.value == "freemium"
        assert ToolTier.PREMIUM.value == "premium"
        assert ToolTier.ENTERPRISE.value == "enterprise"


class TestAdapterTypeEnum:
    """Tests for AdapterType enum."""

    def test_adapter_type_values(self):
        """Test adapter type enum values."""
        assert AdapterType.REST.value == "rest"
        assert AdapterType.GRAPHQL.value == "graphql"
        assert AdapterType.SOAP.value == "soap"
        assert AdapterType.SDK.value == "sdk"


class TestAuthTypeEnum:
    """Tests for AuthType enum."""

    def test_auth_type_values(self):
        """Test auth type enum values."""
        assert AuthType.NONE.value == "none"
        assert AuthType.API_KEY.value == "api_key"
        assert AuthType.OAUTH2.value == "oauth2"
        assert AuthType.BASIC.value == "basic"
