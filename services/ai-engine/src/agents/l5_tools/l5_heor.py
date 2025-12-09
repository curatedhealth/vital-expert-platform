"""
VITAL Path AI Services - VITAL L5 HEOR Tools

Health Economics & Outcomes Research: CMS Medicare, NICE DSU,
IQVIA HEOR, Stata, Visible Analytics, Excel HEOR Models
6 tools for health economic modeling and HTA.

Naming Convention:
- Class: HEORL5Tool
- Factory: create_heor_tool(tool_key)
"""

from typing import Dict, Any, List
from .l5_base import L5BaseTool, ToolConfig, AdapterType, AuthType
import structlog

logger = structlog.get_logger()


HEOR_TOOL_CONFIGS: Dict[str, ToolConfig] = {
    
    "cms_medicare": ToolConfig(
        id="L5-CMSMEDICARE",
        name="CMS Medicare Data",
        slug="cms-medicare-data",
        description="CMS public use files and provider data",
        category="heor",
        tier=1,
        priority="high",
        adapter_type=AdapterType.REST_API,
        base_url="https://data.cms.gov/provider-data/api/1",
        auth_type=AuthType.NONE,
        rate_limit=20,
        cost_per_call=0.002,
        cache_ttl=86400,
        tags=["heor", "medicare", "claims", "pricing", "utilization"],
        vendor="CMS",
        license="Public Domain",
        documentation_url="https://data.cms.gov/",
    ),
    
    "nice_dsu": ToolConfig(
        id="L5-NICEDSU",
        name="NICE DSU Templates",
        slug="nice-dsu-templates",
        description="NICE Decision Support Unit economic model templates",
        category="heor",
        tier=1,
        priority="high",
        adapter_type=AdapterType.LOCAL,
        auth_type=AuthType.NONE,
        rate_limit=100,
        cost_per_call=0.001,
        cache_ttl=604800,
        tags=["heor", "hta", "nice", "uk", "cost_effectiveness"],
        vendor="NICE",
        license="Free",
        documentation_url="http://nicedsu.org.uk/",
    ),
    
    "iqvia_heor": ToolConfig(
        id="L5-IQVIAHEOR",
        name="IQVIA HEOR Analytics",
        slug="iqvia-heor",
        description="IQVIA real-world data and analytics platform",
        category="heor",
        tier=1,
        priority="high",
        adapter_type=AdapterType.REST_API,
        auth_type=AuthType.OAUTH2,
        auth_env_var="IQVIA_CLIENT_SECRET",
        rate_limit=10,
        cost_per_call=0.01,
        cache_ttl=3600,
        tags=["heor", "analytics", "commercial", "rwd"],
        vendor="IQVIA",
        license="Commercial",
    ),
    
    "stata": ToolConfig(
        id="L5-STATA",
        name="Stata",
        slug="stata-statistical-software",
        description="Statistical software for health economics analysis",
        category="heor",
        tier=2,
        priority="high",
        adapter_type=AdapterType.LOCAL,
        auth_type=AuthType.LICENSE_KEY,
        rate_limit=10,
        cost_per_call=0.01,
        cache_ttl=0,
        tags=["heor", "statistics", "epidemiology", "econometrics"],
        vendor="StataCorp",
        license="Commercial",
        documentation_url="https://www.stata.com/",
    ),
    
    "visible_analytics": ToolConfig(
        id="L5-VISIBLE",
        name="Visible Analytics",
        slug="visible-analytics",
        description="Economic modeling and value demonstration platform",
        category="heor",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.REST_API,
        auth_type=AuthType.OAUTH2,
        rate_limit=10,
        cost_per_call=0.005,
        cache_ttl=3600,
        tags=["heor", "modeling", "value_demonstration"],
        vendor="Evidera",
        license="Commercial",
    ),
    
    "excel_heor": ToolConfig(
        id="L5-EXCELHEOR",
        name="Excel HEOR Models",
        slug="excel-heor-models",
        description="Excel-based economic models (budget impact, Markov)",
        category="heor",
        tier=2,
        priority="high",
        adapter_type=AdapterType.LOCAL,
        auth_type=AuthType.NONE,
        rate_limit=100,
        cost_per_call=0.001,
        cache_ttl=0,
        tags=["heor", "excel", "budget_impact", "markov", "cea"],
        vendor="Various",
        license="Various",
    ),
}


class HEORL5Tool(L5BaseTool):
    """L5 Tool class for Health Economics & Outcomes Research."""
    
    def __init__(self, tool_key: str):
        if tool_key not in HEOR_TOOL_CONFIGS:
            raise ValueError(f"Unknown HEOR tool: {tool_key}")
        super().__init__(HEOR_TOOL_CONFIGS[tool_key])
        self.tool_key = tool_key
    
    async def _execute_impl(self, params: Dict[str, Any]) -> Any:
        handler = getattr(self, f"_execute_{self.tool_key}", None)
        if handler:
            return await handler(params)
        raise NotImplementedError(f"No handler for {self.tool_key}")
    
    async def _execute_cms_medicare(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Query CMS Medicare public data."""
        dataset = params.get("dataset", "physician-compare")
        search = params.get("search", "")
        limit = params.get("limit", 100)
        
        # CMS Data API
        data = await self._get(
            f"{self.config.base_url}/dataset/{dataset}/data",
            params={"$limit": limit, "$q": search} if search else {"$limit": limit}
        )
        
        return {
            "dataset": dataset,
            "records": data if isinstance(data, list) else data.get("data", []),
            "count": len(data) if isinstance(data, list) else data.get("count", 0),
        }
    
    async def _execute_nice_dsu(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Get NICE DSU templates and guidance."""
        template_type = params.get("template_type", "technical_support_documents")
        
        # NICE DSU templates are typically downloaded documents
        templates = {
            "technical_support_documents": [
                "TSD1: Guide to methods of technology appraisal",
                "TSD2: A general linear modelling framework",
                "TSD3: Methods for indirect and mixed treatment comparisons",
                "TSD4: Inconsistency in networks",
                "TSD5: Evidence synthesis for binary outcomes",
                "TSD6: Evidence synthesis for time-to-event outcomes",
                "TSD14: Survival analysis for economic evaluations",
                "TSD15: Cost-effectiveness modelling methods",
                "TSD17: Network meta-analysis",
                "TSD18: Methods for population-adjusted indirect comparisons",
                "TSD21: Flexible methods for survival analysis",
            ],
            "models": [
                "Partitioned survival model",
                "Markov model",
                "Budget impact model",
                "Patient flow model",
            ],
        }
        
        return {
            "template_type": template_type,
            "available": templates.get(template_type, []),
            "documentation_url": "http://nicedsu.org.uk/technical-support-documents/",
        }
    
    async def _execute_iqvia_heor(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Query IQVIA HEOR platform."""
        import os
        if not os.getenv("IQVIA_CLIENT_SECRET"):
            return {"error": "IQVIA credentials required", "status": "not_configured"}
        
        return {
            "status": "requires_oauth",
            "message": "IQVIA HEOR requires OAuth2 authentication flow",
        }
    
    async def _execute_stata(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute Stata commands."""
        command = params.get("command", "")
        
        return {
            "status": "requires_local",
            "message": "Stata requires local installation and license",
            "command": command,
            "common_commands": [
                "reg y x1 x2 x3",
                "logit y x1 x2",
                "stcox x1 x2, efron",
                "margins, dydx(*)",
                "icc outcome group",
            ],
        }
    
    async def _execute_visible_analytics(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "status": "requires_oauth",
            "message": "Visible Analytics requires commercial license",
        }
    
    async def _execute_excel_heor(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Provide HEOR Excel model templates."""
        model_type = params.get("model_type", "budget_impact")
        
        models = {
            "budget_impact": {
                "sheets": ["Inputs", "Market Data", "Costs", "Utilization", "Results"],
                "time_horizon": "1-5 years",
                "perspective": "Payer",
            },
            "markov": {
                "sheets": ["Inputs", "Transition Probabilities", "Costs", "Utilities", "Results"],
                "states": ["Healthy", "Sick", "Dead"],
                "cycle_length": "1 month or 1 year",
            },
            "partitioned_survival": {
                "sheets": ["Inputs", "Survival Curves", "Costs", "Utilities", "Results"],
                "curves": ["PFS", "OS", "TTD"],
            },
        }
        
        return {
            "model_type": model_type,
            "template": models.get(model_type, {}),
            "available_models": list(models.keys()),
        }


def create_heor_tool(tool_key: str) -> HEORL5Tool:
    return HEORL5Tool(tool_key)

HEOR_TOOL_KEYS = list(HEOR_TOOL_CONFIGS.keys())
