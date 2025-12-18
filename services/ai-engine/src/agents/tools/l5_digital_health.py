"""
VITAL Path AI Services - VITAL L5 Digital Health Tools

Digital Health & Wearables: HealthKit, Health Connect, ResearchKit,
ResearchStack, Fitbit, Terra, MyDataHelps, Sage Bridge
8 tools for mobile health and wearable data.

Naming Convention:
- Class: DigitalHealthL5Tool
- Factory: create_digital_health_tool(tool_key)
"""

from typing import Dict, Any, List
from .l5_base import L5BaseTool, ToolConfig, AdapterType, AuthType
import structlog

logger = structlog.get_logger()


DIGITAL_HEALTH_TOOL_CONFIGS: Dict[str, ToolConfig] = {
    
    "healthkit": ToolConfig(
        id="L5-HEALTHKIT",
        name="Apple HealthKit",
        slug="apple-healthkit",
        description="iOS health and fitness data integration",
        category="digital_health",
        tier=1,
        priority="high",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.OAUTH2,
        rate_limit=100,
        cost_per_call=0.0001,
        tags=["digital_health", "wearables", "ios", "apple", "fitness"],
        vendor="Apple",
        license="Proprietary",
    ),
    
    "health_connect": ToolConfig(
        id="L5-HEALTHCONNECT",
        name="Google Health Connect",
        slug="google-health-connect",
        description="Android health and fitness data platform",
        category="digital_health",
        tier=1,
        priority="high",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.OAUTH2,
        rate_limit=100,
        cost_per_call=0.0001,
        tags=["digital_health", "wearables", "android", "google", "fitness"],
        vendor="Google",
        license="Proprietary",
    ),
    
    "researchkit": ToolConfig(
        id="L5-RESEARCHKIT",
        name="ResearchKit",
        slug="researchkit",
        description="iOS framework for medical research apps",
        category="digital_health",
        tier=1,
        priority="high",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.NONE,
        rate_limit=100,
        cost_per_call=0.0001,
        tags=["digital_health", "clinical_trials", "ios", "surveys", "consent"],
        vendor="Apple",
        license="BSD-3-Clause",
    ),
    
    "researchstack": ToolConfig(
        id="L5-RESEARCHSTACK",
        name="ResearchStack",
        slug="researchstack",
        description="Android SDK for medical research apps",
        category="digital_health",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.NONE,
        rate_limit=100,
        cost_per_call=0.0001,
        tags=["digital_health", "clinical_trials", "android", "surveys"],
        vendor="Open Source",
        license="Apache-2.0",
    ),
    
    "fitbit": ToolConfig(
        id="L5-FITBIT",
        name="Fitbit Web API",
        slug="fitbit-api",
        description="Fitbit wearable device data API",
        category="digital_health",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.REST_API,
        base_url="https://api.fitbit.com",
        auth_type=AuthType.OAUTH2,
        auth_env_var="FITBIT_CLIENT_SECRET",
        rate_limit=150,
        cost_per_call=0.001,
        tags=["digital_health", "wearables", "fitness", "sleep", "heart_rate"],
        vendor="Fitbit/Google",
        license="Proprietary",
        documentation_url="https://dev.fitbit.com/build/reference/web-api/",
    ),
    
    "terra": ToolConfig(
        id="L5-TERRA",
        name="Terra API",
        slug="terra-api",
        description="Unified API for wearable and health data",
        category="digital_health",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.REST_API,
        base_url="https://api.tryterra.co/v2",
        auth_type=AuthType.API_KEY,
        auth_env_var="TERRA_API_KEY",
        rate_limit=100,
        cost_per_call=0.002,
        tags=["digital_health", "wearables", "multi_device", "aggregation"],
        vendor="Terra",
        license="Commercial",
        documentation_url="https://docs.tryterra.co/",
    ),
    
    "mydatahelps": ToolConfig(
        id="L5-MYDATAHELPS",
        name="MyDataHelps SDK",
        slug="mydatahelps",
        description="Participant engagement platform for research",
        category="digital_health",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.OAUTH2,
        rate_limit=50,
        cost_per_call=0.001,
        tags=["digital_health", "research", "participant_engagement", "ePRO"],
        vendor="CareEvolution",
        license="Commercial",
        documentation_url="https://developer.mydatahelps.org/",
    ),
    
    "sage_bridge": ToolConfig(
        id="L5-SAGEBRIDGE",
        name="Sage Bridge Server",
        slug="sage-bridge",
        description="Backend platform for mHealth research studies",
        category="digital_health",
        tier=2,
        priority="high",
        adapter_type=AdapterType.REST_API,
        base_url="https://webservices.sagebridge.org",
        auth_type=AuthType.API_KEY,
        auth_env_var="SAGE_API_KEY",
        rate_limit=50,
        cost_per_call=0.002,
        tags=["digital_health", "mhealth", "backend", "research"],
        vendor="Sage Bionetworks",
        license="Apache-2.0",
        documentation_url="https://developer.sagebridge.org/",
    ),
}


class DigitalHealthL5Tool(L5BaseTool):
    """L5 Tool class for Digital Health & Wearables."""
    
    def __init__(self, tool_key: str):
        if tool_key not in DIGITAL_HEALTH_TOOL_CONFIGS:
            raise ValueError(f"Unknown digital health tool: {tool_key}")
        super().__init__(DIGITAL_HEALTH_TOOL_CONFIGS[tool_key])
        self.tool_key = tool_key
    
    async def _execute_impl(self, params: Dict[str, Any]) -> Any:
        handler = getattr(self, f"_execute_{self.tool_key}", None)
        if handler:
            return await handler(params)
        return self._not_implemented()
    
    def _not_implemented(self) -> Dict[str, Any]:
        return {
            "status": "requires_mobile_sdk",
            "message": f"{self.config.name} requires mobile SDK integration",
            "documentation": self.config.documentation_url,
        }
    
    async def _execute_fitbit(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Query Fitbit API."""
        import os
        if not os.getenv("FITBIT_ACCESS_TOKEN"):
            return {"error": "Fitbit OAuth token required"}
        
        endpoint = params.get("endpoint", "user/-/profile")
        data = await self._get(
            f"{self.config.base_url}/1/{endpoint}.json",
            headers={"Authorization": f"Bearer {os.getenv('FITBIT_ACCESS_TOKEN')}"}
        )
        return {"data": data}
    
    async def _execute_terra(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Query Terra API."""
        import os
        api_key = os.getenv("TERRA_API_KEY")
        if not api_key:
            return {"error": "TERRA_API_KEY required"}
        
        user_id = params.get("user_id")
        data_type = params.get("data_type", "activity")
        
        if not user_id:
            return {"error": "user_id required"}
        
        data = await self._get(
            f"{self.config.base_url}/v2/{data_type}",
            params={"user_id": user_id},
            headers={"x-api-key": api_key, "dev-id": os.getenv("TERRA_DEV_ID", "")}
        )
        return {"data": data}
    
    async def _execute_sage_bridge(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Query Sage Bridge API."""
        import os
        if not os.getenv("SAGE_API_KEY"):
            return {"error": "SAGE_API_KEY required"}
        
        endpoint = params.get("endpoint", "v3/studies")
        data = await self._get(
            f"{self.config.base_url}/{endpoint}",
            headers={"Bridge-Session": os.getenv("SAGE_API_KEY")}
        )
        return {"data": data}
    
    async def _execute_healthkit(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return self._not_implemented()
    
    async def _execute_health_connect(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return self._not_implemented()
    
    async def _execute_researchkit(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return self._not_implemented()
    
    async def _execute_researchstack(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return self._not_implemented()
    
    async def _execute_mydatahelps(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return self._not_implemented()


def create_digital_health_tool(tool_key: str) -> DigitalHealthL5Tool:
    return DigitalHealthL5Tool(tool_key)

DIGITAL_HEALTH_TOOL_KEYS = list(DIGITAL_HEALTH_TOOL_CONFIGS.keys())
