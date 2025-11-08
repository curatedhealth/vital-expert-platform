"""
Tool Metadata and Registry System

Provides comprehensive metadata for all available tools including:
- Cost information
- Execution speed
- Confirmation requirements
- Usage statistics
- Display information

This enables intelligent tool selection and user-friendly tool execution.
"""

from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from enum import Enum
from datetime import datetime


class ToolCategory(str, Enum):
    """Tool categories for organization and filtering"""
    SEARCH = "search"  # Web, PubMed, FDA searches
    COMPUTATION = "computation"  # Calculator, data analysis
    RETRIEVAL = "retrieval"  # RAG, database queries
    GENERATION = "generation"  # Image, document, code generation
    COMMUNICATION = "communication"  # Email, notifications


class ToolCostTier(str, Enum):
    """Cost tiers for budget control and user transparency"""
    FREE = "free"  # No cost (local computation)
    LOW = "low"  # < $0.01 per call
    MEDIUM = "medium"  # $0.01 - $0.10
    HIGH = "high"  # > $0.10


class ToolExecutionSpeed(str, Enum):
    """Expected execution speed for user expectations"""
    INSTANT = "instant"  # < 1 second
    FAST = "fast"  # 1-5 seconds
    MEDIUM = "medium"  # 5-15 seconds
    SLOW = "slow"  # > 15 seconds


class ToolParameter(BaseModel):
    """Tool parameter definition"""
    name: str
    description: str
    type: str  # "string", "number", "boolean", "array"
    required: bool = False
    default: Optional[Any] = None
    example: Optional[Any] = None


class ToolMetadata(BaseModel):
    """
    Comprehensive tool metadata for intelligent tool orchestration
    
    Used for:
    - Smart tool suggestion (LLM analyzes query → suggests tools)
    - User confirmation flow (expensive/slow tools require approval)
    - Result formatting (tool-specific display logic)
    - Usage tracking and analytics
    """
    
    # Identity
    name: str = Field(..., description="Tool name (lowercase, snake_case)")
    display_name: str = Field(..., description="Human-readable name")
    description: str = Field(..., description="What the tool does (1-2 sentences)")
    long_description: Optional[str] = Field(None, description="Detailed description for help docs")
    icon: str = Field(default="tool", description="Icon identifier (lucide-react icon name)")
    
    # Classification
    category: ToolCategory
    tags: List[str] = Field(default_factory=list, description="Searchable tags")
    
    # Cost & Performance
    cost_tier: ToolCostTier
    estimated_cost_per_call: float = Field(default=0.0, description="Estimated cost in USD")
    speed: ToolExecutionSpeed
    estimated_duration_seconds: float = Field(
        default=5.0,
        description="Typical execution time"
    )
    
    # Requirements
    requires_confirmation: bool = Field(
        default=False,
        description="Require user approval before execution (expensive/slow tools)"
    )
    
    requires_api_key: bool = Field(
        default=False,
        description="Requires API key configuration"
    )
    
    requires_auth: bool = Field(
        default=False,
        description="Requires user authentication"
    )
    
    # Capabilities
    supports_streaming: bool = Field(
        default=False,
        description="Can stream results progressively"
    )
    
    supports_batch: bool = Field(
        default=False,
        description="Can process multiple inputs at once"
    )
    
    # Limits
    rate_limit_per_minute: Optional[int] = Field(
        None,
        description="Max calls per minute (None = no limit)"
    )
    
    max_input_length: Optional[int] = Field(
        None,
        description="Max input characters (None = no limit)"
    )
    
    max_concurrent: int = Field(
        default=1,
        description="Max concurrent executions"
    )
    
    # Parameters
    parameters: List[ToolParameter] = Field(
        default_factory=list,
        description="Tool parameters with types and defaults"
    )
    
    # Examples
    example_usage: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Example use cases with inputs and expected outputs"
    )
    
    # Status
    is_enabled: bool = Field(default=True, description="Tool is available for use")
    is_beta: bool = Field(default=False, description="Tool is in beta testing")
    is_deprecated: bool = Field(default=False, description="Tool is deprecated")
    
    deprecation_message: Optional[str] = Field(
        None,
        description="Message shown if tool is deprecated"
    )
    
    # Usage Statistics (tracked at runtime)
    total_executions: int = Field(default=0, description="Total times executed")
    successful_executions: int = Field(default=0, description="Successful executions")
    failed_executions: int = Field(default=0, description="Failed executions")
    avg_duration_seconds: float = Field(default=0.0, description="Average execution time")
    last_executed_at: Optional[datetime] = Field(None, description="Last execution timestamp")
    
    # Computed properties
    @property
    def success_rate(self) -> float:
        """Calculate success rate"""
        if self.total_executions == 0:
            return 0.0
        return self.successful_executions / self.total_executions
    
    @property
    def success_rate_display(self) -> str:
        """Human-readable success rate"""
        return f"{self.success_rate * 100:.1f}%"
    
    def to_display_format(self) -> Dict[str, Any]:
        """Format for frontend display"""
        return {
            "name": self.name,
            "displayName": self.display_name,
            "description": self.description,
            "icon": self.icon,
            "category": self.category.value,
            "tags": self.tags,
            "costTier": self.cost_tier.value,
            "estimatedCost": f"${self.estimated_cost_per_call:.3f}" if self.estimated_cost_per_call > 0 else "Free",
            "speed": self.speed.value,
            "estimatedDuration": self.estimated_duration_seconds,
            "requiresConfirmation": self.requires_confirmation,
            "requiresApiKey": self.requires_api_key,
            "requiresAuth": self.requires_auth,
            "supportsStreaming": self.supports_streaming,
            "supportsBatch": self.supports_batch,
            "isEnabled": self.is_enabled,
            "isBeta": self.is_beta,
            "isDeprecated": self.is_deprecated,
            "deprecationMessage": self.deprecation_message,
            "parameters": [
                {
                    "name": p.name,
                    "description": p.description,
                    "type": p.type,
                    "required": p.required,
                    "default": p.default,
                    "example": p.example
                }
                for p in self.parameters
            ],
            "examples": self.example_usage,
            "stats": {
                "totalExecutions": self.total_executions,
                "successRate": self.success_rate_display,
                "avgDuration": f"{self.avg_duration_seconds:.1f}s",
                "lastExecuted": self.last_executed_at.isoformat() if self.last_executed_at else None
            }
        }
    
    def to_llm_description(self) -> str:
        """Format for LLM tool selection"""
        parts = [
            f"{self.display_name}: {self.description}",
            f"Cost: {self.cost_tier.value}",
            f"Speed: {self.speed.value}",
        ]
        
        if self.requires_confirmation:
            parts.append("⚠️ Requires user confirmation")
        
        if self.tags:
            parts.append(f"Tags: {', '.join(self.tags)}")
        
        return " | ".join(parts)
    
    def increment_execution(self, success: bool, duration: float):
        """Update execution statistics"""
        self.total_executions += 1
        if success:
            self.successful_executions += 1
        else:
            self.failed_executions += 1
        
        # Update average duration (running average)
        if self.total_executions == 1:
            self.avg_duration_seconds = duration
        else:
            self.avg_duration_seconds = (
                (self.avg_duration_seconds * (self.total_executions - 1) + duration) 
                / self.total_executions
            )
        
        self.last_executed_at = datetime.now()


class ToolRegistry:
    """
    Central registry for all available tools
    
    Provides:
    - Tool lookup by name
    - Tool filtering by category, cost, etc.
    - Tool recommendation for queries
    - Usage statistics
    """
    
    def __init__(self):
        self._tools: Dict[str, ToolMetadata] = {}
        self._initialize_default_tools()
    
    def _initialize_default_tools(self):
        """Initialize default tool set"""
        
        # Web Search Tool
        self.register(ToolMetadata(
            name="web_search",
            display_name="Web Search",
            description="Search the web for current information using Brave Search API",
            long_description="""
                Searches the web for up-to-date information on any topic.
                Particularly useful for:
                - Current events and news
                - Latest guidelines and regulations
                - Recent research and publications
                - Real-time data and statistics
            """,
            icon="globe",
            category=ToolCategory.SEARCH,
            tags=["web", "search", "current", "realtime", "news"],
            cost_tier=ToolCostTier.LOW,
            estimated_cost_per_call=0.005,
            speed=ToolExecutionSpeed.FAST,
            estimated_duration_seconds=3.0,
            requires_confirmation=True,  # Costs money
            requires_api_key=True,
            parameters=[
                ToolParameter(
                    name="query",
                    description="Search query",
                    type="string",
                    required=True,
                    example="FDA medical device regulations 2024"
                ),
                ToolParameter(
                    name="max_results",
                    description="Maximum number of results",
                    type="number",
                    required=False,
                    default=5,
                    example=10
                ),
                ToolParameter(
                    name="search_depth",
                    description="Search depth (basic or advanced)",
                    type="string",
                    required=False,
                    default="basic",
                    example="advanced"
                )
            ],
            example_usage=[
                {
                    "description": "Search for FDA regulations",
                    "input": {"query": "FDA medical device regulations 2024", "max_results": 5},
                    "output_summary": "5 web results from FDA.gov and related sources"
                },
                {
                    "description": "Find latest COVID guidelines",
                    "input": {"query": "latest COVID-19 treatment guidelines", "max_results": 3},
                    "output_summary": "3 results from CDC, WHO, and medical journals"
                }
            ]
        ))
        
        # PubMed Search Tool
        self.register(ToolMetadata(
            name="pubmed_search",
            display_name="PubMed Search",
            description="Search PubMed for peer-reviewed medical literature",
            long_description="""
                Searches the PubMed database for peer-reviewed medical and scientific literature.
                Best for:
                - Clinical studies and trials
                - Medical research papers
                - Evidence-based medicine
                - Scientific publications
            """,
            icon="book-medical",
            category=ToolCategory.SEARCH,
            tags=["pubmed", "medical", "research", "literature", "papers", "studies"],
            cost_tier=ToolCostTier.FREE,
            speed=ToolExecutionSpeed.MEDIUM,
            estimated_duration_seconds=5.0,
            requires_confirmation=False,
            requires_api_key=False,
            parameters=[
                ToolParameter(
                    name="query",
                    description="Search query",
                    type="string",
                    required=True,
                    example="CRISPR gene therapy clinical trials"
                ),
                ToolParameter(
                    name="max_results",
                    description="Maximum number of results",
                    type="number",
                    required=False,
                    default=10,
                    example=20
                ),
                ToolParameter(
                    name="publication_date_min",
                    description="Minimum publication year",
                    type="number",
                    required=False,
                    example=2020
                )
            ],
            example_usage=[
                {
                    "description": "Search for CRISPR clinical trials",
                    "input": {"query": "CRISPR gene therapy clinical trials", "max_results": 10},
                    "output_summary": "10 peer-reviewed articles from medical journals"
                }
            ]
        ))
        
        # FDA Database Tool
        self.register(ToolMetadata(
            name="fda_database",
            display_name="FDA Database",
            description="Query FDA databases for drug approvals, device clearances, and adverse events",
            long_description="""
                Queries official FDA databases including:
                - 510(k) device clearances
                - Drug approvals (NDA, ANDA)
                - Adverse event reports (FAERS)
                - Recalls and safety alerts
            """,
            icon="shield-check",
            category=ToolCategory.RETRIEVAL,
            tags=["fda", "regulatory", "drugs", "devices", "510k", "approvals"],
            cost_tier=ToolCostTier.FREE,
            speed=ToolExecutionSpeed.MEDIUM,
            estimated_duration_seconds=6.0,
            requires_confirmation=False,
            requires_api_key=False,
            parameters=[
                ToolParameter(
                    name="query_type",
                    description="Type of FDA query",
                    type="string",
                    required=True,
                    example="device_510k"
                ),
                ToolParameter(
                    name="search_term",
                    description="Search term",
                    type="string",
                    required=True,
                    example="insulin pump"
                ),
                ToolParameter(
                    name="limit",
                    description="Maximum number of results",
                    type="number",
                    required=False,
                    default=10,
                    example=20
                )
            ],
            example_usage=[
                {
                    "description": "Search for insulin pump 510(k) clearances",
                    "input": {"query_type": "device_510k", "search_term": "insulin pump"},
                    "output_summary": "List of FDA 510(k) clearances for insulin pumps"
                }
            ]
        ))
        
        # Calculator Tool
        self.register(ToolMetadata(
            name="calculator",
            display_name="Calculator",
            description="Perform mathematical calculations and unit conversions",
            long_description="""
                Performs calculations including:
                - Basic arithmetic
                - Scientific calculations
                - Unit conversions
                - Dosage calculations
                - Statistical computations
            """,
            icon="calculator",
            category=ToolCategory.COMPUTATION,
            tags=["math", "calculation", "conversion", "arithmetic", "units"],
            cost_tier=ToolCostTier.FREE,
            speed=ToolExecutionSpeed.INSTANT,
            estimated_duration_seconds=0.1,
            requires_confirmation=False,
            requires_api_key=False,
            parameters=[
                ToolParameter(
                    name="expression",
                    description="Mathematical expression or conversion",
                    type="string",
                    required=True,
                    example="150 * 0.5 + 20"
                )
            ],
            example_usage=[
                {
                    "description": "Calculate dosage",
                    "input": {"expression": "150 * 0.5 + 20"},
                    "output_summary": "Result: 95"
                },
                {
                    "description": "Convert units",
                    "input": {"expression": "convert 5 feet to meters"},
                    "output_summary": "1.524 meters"
                }
            ]
        ))
    
    def register(self, tool: ToolMetadata):
        """Register a tool"""
        self._tools[tool.name] = tool
    
    def get(self, name: str) -> Optional[ToolMetadata]:
        """Get tool by name"""
        return self._tools.get(name)
    
    def list_all(self) -> List[ToolMetadata]:
        """List all tools"""
        return list(self._tools.values())
    
    def list_enabled(self) -> List[ToolMetadata]:
        """List enabled tools only"""
        return [t for t in self._tools.values() if t.is_enabled and not t.is_deprecated]
    
    def list_by_category(self, category: ToolCategory) -> List[ToolMetadata]:
        """List tools in a category"""
        return [t for t in self.list_enabled() if t.category == category]
    
    def list_expensive(self) -> List[ToolMetadata]:
        """List tools requiring confirmation"""
        return [t for t in self.list_enabled() if t.requires_confirmation]
    
    def search(self, query: str) -> List[ToolMetadata]:
        """Search tools by name, description, or tags"""
        query_lower = query.lower()
        results = []
        
        for tool in self.list_enabled():
            # Check name
            if query_lower in tool.name.lower():
                results.append(tool)
                continue
            
            # Check display name
            if query_lower in tool.display_name.lower():
                results.append(tool)
                continue
            
            # Check description
            if query_lower in tool.description.lower():
                results.append(tool)
                continue
            
            # Check tags
            if any(query_lower in tag.lower() for tag in tool.tags):
                results.append(tool)
                continue
        
        return results
    
    def get_stats(self) -> Dict[str, Any]:
        """Get registry statistics"""
        tools = self.list_all()
        enabled = self.list_enabled()
        
        return {
            "total_tools": len(tools),
            "enabled_tools": len(enabled),
            "disabled_tools": len(tools) - len(enabled),
            "categories": {
                category.value: len(self.list_by_category(category))
                for category in ToolCategory
            },
            "expensive_tools": len(self.list_expensive()),
            "total_executions": sum(t.total_executions for t in tools),
            "avg_success_rate": sum(t.success_rate for t in tools if t.total_executions > 0) / 
                               max(len([t for t in tools if t.total_executions > 0]), 1)
        }


# Global registry instance
_registry = ToolRegistry()


# Convenience functions
def get_tool_metadata(name: str) -> Optional[ToolMetadata]:
    """Get tool metadata by name"""
    return _registry.get(name)


def get_all_tools() -> List[ToolMetadata]:
    """Get all enabled tools"""
    return _registry.list_enabled()


def get_tools_by_category(category: ToolCategory) -> List[ToolMetadata]:
    """Get tools in a category"""
    return _registry.list_by_category(category)


def get_expensive_tools() -> List[ToolMetadata]:
    """Get list of tools requiring confirmation"""
    return _registry.list_expensive()


def search_tools(query: str) -> List[ToolMetadata]:
    """Search for tools"""
    return _registry.search(query)


def get_registry_stats() -> Dict[str, Any]:
    """Get registry statistics"""
    return _registry.get_stats()


def register_tool(tool: ToolMetadata):
    """Register a new tool"""
    _registry.register(tool)

