"""
VITAL Path AI Services - VITAL L5 EHR Tools

EHR & Interoperability: OpenEMR, OpenMRS, Synthea, OpenHIM, EHRbase
5 tools for electronic health records and data exchange.

Naming Convention:
- Class: EHRL5Tool
- Factory: create_ehr_tool(tool_key)
"""

from typing import Dict, Any
from .l5_base import L5BaseTool, ToolConfig, AdapterType, AuthType

EHR_TOOL_CONFIGS: Dict[str, ToolConfig] = {
    
    "openemr": ToolConfig(
        id="L5-OPENEMR",
        name="OpenEMR",
        slug="openemr",
        description="Open source electronic health records and practice management",
        category="ehr",
        tier=3,
        priority="low",
        adapter_type=AdapterType.REST_API,
        auth_type=AuthType.OAUTH2,
        rate_limit=50,
        cost_per_call=0.001,
        tags=["emr", "open_source", "onc_certified", "fhir"],
        vendor="OpenEMR",
        license="GPL-3.0",
        documentation_url="https://www.open-emr.org/",
    ),
    
    "openmrs": ToolConfig(
        id="L5-OPENMRS",
        name="OpenMRS",
        slug="openmrs",
        description="Open source medical record system for resource-limited settings",
        category="ehr",
        tier=3,
        priority="low",
        adapter_type=AdapterType.REST_API,
        base_url="https://demo.openmrs.org/openmrs/ws/rest/v1",
        auth_type=AuthType.BASIC,
        rate_limit=50,
        cost_per_call=0.001,
        tags=["emr", "open_source", "global_health", "fhir"],
        vendor="OpenMRS",
        license="MPL-2.0",
        documentation_url="https://wiki.openmrs.org/display/docs/",
    ),
    
    "synthea": ToolConfig(
        id="L5-SYNTHEA",
        name="Synthea Patient Generator",
        slug="synthea",
        description="Synthetic patient data generator with realistic medical histories",
        category="ehr",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.JAVA_BRIDGE,
        auth_type=AuthType.NONE,
        rate_limit=10,
        timeout=120,
        cost_per_call=0.01,
        tags=["synthetic_data", "test_data", "fhir", "c_cda"],
        vendor="MITRE",
        license="Apache-2.0",
        documentation_url="https://synthetichealth.github.io/synthea/",
    ),
    
    "openhim": ToolConfig(
        id="L5-OPENHIM",
        name="OpenHIM",
        slug="openhim",
        description="Health information mediator for interoperability",
        category="ehr",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.REST_API,
        auth_type=AuthType.BASIC,
        rate_limit=100,
        cost_per_call=0.001,
        tags=["interoperability", "hie", "fhir", "middleware"],
        vendor="Jembi",
        license="MPL-2.0",
        documentation_url="http://openhim.org/docs/",
    ),
    
    "ehrbase": ToolConfig(
        id="L5-EHRBASE",
        name="EHRbase",
        slug="ehrbase",
        description="OpenEHR clinical data repository",
        category="ehr",
        tier=3,
        priority="low",
        adapter_type=AdapterType.REST_API,
        auth_type=AuthType.BASIC,
        rate_limit=50,
        cost_per_call=0.002,
        tags=["openehr", "clinical_data", "archetype", "aql"],
        vendor="Open Source",
        license="Apache-2.0",
        documentation_url="https://ehrbase.org/",
    ),
}


class EHRL5Tool(L5BaseTool):
    """L5 Tool class for EHR & Interoperability."""
    
    def __init__(self, tool_key: str):
        if tool_key not in EHR_TOOL_CONFIGS:
            raise ValueError(f"Unknown EHR tool: {tool_key}")
        super().__init__(EHR_TOOL_CONFIGS[tool_key])
        self.tool_key = tool_key
    
    async def _execute_impl(self, params: Dict[str, Any]) -> Any:
        handler = getattr(self, f"_execute_{self.tool_key}", None)
        if handler:
            return await handler(params)
        raise NotImplementedError(f"No handler for {self.tool_key}")
    
    async def _execute_openmrs(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Query OpenMRS REST API."""
        resource = params.get("resource", "patient")
        query = params.get("query", "")
        
        # OpenMRS demo server
        data = await self._get(
            f"{self.config.base_url}/{resource}",
            params={"q": query} if query else None,
            headers={"Authorization": "Basic YWRtaW46QWRtaW4xMjM="}  # demo creds
        )
        return {"results": data.get("results", [])}
    
    async def _execute_synthea(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate synthetic patients."""
        population = params.get("population", 10)
        state = params.get("state", "Massachusetts")
        output_format = params.get("format", "fhir")
        
        return {
            "status": "requires_java",
            "message": "Synthea requires Java runtime",
            "command": f"java -jar synthea.jar -p {population} -s 42 {state}",
            "output_formats": ["fhir", "ccda", "csv", "text"],
            "modules": [
                "allergies", "asthma", "breast_cancer", "copd",
                "diabetes", "heart", "lung_cancer", "metabolic_syndrome",
            ],
        }
    
    async def _execute_openemr(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "status": "requires_oauth",
            "message": "OpenEMR requires local installation and OAuth setup",
            "fhir_resources": ["Patient", "Encounter", "Observation", "Condition"],
        }
    
    async def _execute_openhim(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "status": "requires_setup",
            "message": "OpenHIM requires mediator configuration",
            "features": [
                "Message routing",
                "Protocol translation",
                "Audit logging",
                "Channel management",
            ],
        }
    
    async def _execute_ehrbase(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "status": "requires_setup",
            "message": "EHRbase requires server configuration",
            "query_languages": ["AQL (Archetype Query Language)"],
            "standards": ["openEHR", "HL7 FHIR (via mapping)"],
        }


def create_ehr_tool(tool_key: str) -> EHRL5Tool:
    return EHRL5Tool(tool_key)

EHR_TOOL_KEYS = list(EHR_TOOL_CONFIGS.keys())
