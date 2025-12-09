"""
VITAL Path AI Services - VITAL L5 Clinical Systems Tools

Clinical Trial Systems: Medidata Rave EDC, Veeva Vault CTMS
2 tools for clinical trial management and EDC.

Naming Convention:
- Class: ClinicalSystemsL5Tool
- Factory: create_clinical_systems_tool(tool_key)
"""

from typing import Dict, Any
from .l5_base import L5BaseTool, ToolConfig, AdapterType, AuthType

CLINICAL_SYSTEMS_TOOL_CONFIGS: Dict[str, ToolConfig] = {
    
    "medidata_rave": ToolConfig(
        id="L5-MEDIDATA",
        name="Medidata Rave EDC",
        slug="medidata-rave-edc",
        description="Electronic Data Capture for clinical trials",
        category="clinical_systems",
        tier=1,
        priority="critical",
        adapter_type=AdapterType.REST_API,
        base_url="https://api.mdsol.com",
        auth_type=AuthType.OAUTH2,
        auth_env_var="MEDIDATA_CLIENT_SECRET",
        rate_limit=20,
        cost_per_call=0.01,
        tags=["edc", "clinical_trials", "cdisc", "data_capture"],
        vendor="Medidata/Dassault",
        license="Commercial",
        documentation_url="https://developer.mdsol.com/",
    ),
    
    "veeva_ctms": ToolConfig(
        id="L5-VEEVA",
        name="Veeva Vault CTMS",
        slug="veeva-vault-ctms",
        description="Clinical Trial Management System",
        category="clinical_systems",
        tier=1,
        priority="critical",
        adapter_type=AdapterType.REST_API,
        base_url="https://api.veevavault.com",
        auth_type=AuthType.OAUTH2,
        auth_env_var="VEEVA_CLIENT_SECRET",
        rate_limit=20,
        cost_per_call=0.01,
        tags=["ctms", "clinical_trials", "site_management", "tmf"],
        vendor="Veeva",
        license="Commercial",
        documentation_url="https://developer.veevavault.com/",
    ),
}


class ClinicalSystemsL5Tool(L5BaseTool):
    """L5 Tool class for Clinical Trial Systems."""
    
    def __init__(self, tool_key: str):
        if tool_key not in CLINICAL_SYSTEMS_TOOL_CONFIGS:
            raise ValueError(f"Unknown clinical systems tool: {tool_key}")
        super().__init__(CLINICAL_SYSTEMS_TOOL_CONFIGS[tool_key])
        self.tool_key = tool_key
    
    async def _execute_impl(self, params: Dict[str, Any]) -> Any:
        handler = getattr(self, f"_execute_{self.tool_key}", None)
        if handler:
            return await handler(params)
        raise NotImplementedError(f"No handler for {self.tool_key}")
    
    async def _execute_medidata_rave(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Query Medidata Rave API."""
        import os
        if not os.getenv("MEDIDATA_CLIENT_SECRET"):
            return {
                "status": "not_configured",
                "message": "Medidata OAuth credentials required",
                "capabilities": [
                    "Study listing",
                    "Subject data extraction",
                    "Form metadata",
                    "Audit trail",
                    "Query management",
                ],
            }
        
        endpoint = params.get("endpoint", "studies")
        return {
            "status": "requires_oauth",
            "endpoint": endpoint,
        }
    
    async def _execute_veeva_ctms(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Query Veeva Vault CTMS API."""
        import os
        if not os.getenv("VEEVA_CLIENT_SECRET"):
            return {
                "status": "not_configured",
                "message": "Veeva OAuth credentials required",
                "capabilities": [
                    "Study management",
                    "Site management",
                    "Milestone tracking",
                    "Document management (eTMF)",
                    "Resource planning",
                ],
            }
        
        endpoint = params.get("endpoint", "studies")
        return {
            "status": "requires_oauth",
            "endpoint": endpoint,
        }


def create_clinical_systems_tool(tool_key: str) -> ClinicalSystemsL5Tool:
    return ClinicalSystemsL5Tool(tool_key)

CLINICAL_SYSTEMS_TOOL_KEYS = list(CLINICAL_SYSTEMS_TOOL_CONFIGS.keys())
