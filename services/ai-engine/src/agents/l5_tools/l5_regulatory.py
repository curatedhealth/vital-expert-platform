"""
VITAL Path AI Services - VITAL L5 Regulatory Tools

Regulatory tools: OpenFDA, MedDRA, Docubridge, TrackWise
4 tools for FDA data, medical terminology, and compliance.

Naming Convention:
- Class: RegulatoryL5Tool
- Factory: create_regulatory_tool(tool_key)
"""

from typing import Dict, Any, List, Optional
from .l5_base import L5BaseTool, ToolConfig, AdapterType, AuthType
import structlog

logger = structlog.get_logger()


# ============================================================================
# TOOL CONFIGURATIONS
# ============================================================================

REGULATORY_TOOL_CONFIGS: Dict[str, ToolConfig] = {
    
    "openfda": ToolConfig(
        id="L5-FDA",
        name="OpenFDA",
        slug="openfda",
        description="FDA drug labels, adverse events, recalls, and enforcement data",
        category="regulatory",
        tier=1,
        priority="critical",
        adapter_type=AdapterType.REST_API,
        base_url="https://api.fda.gov",
        auth_type=AuthType.API_KEY,
        auth_env_var="FDA_API_KEY",
        rate_limit=40,
        cost_per_call=0.002,
        cache_ttl=86400,
        tags=["fda", "drug_labels", "adverse_events", "regulatory", "faers"],
        vendor="FDA",
        license="Free",
        documentation_url="https://open.fda.gov/apis/",
    ),
    
    "meddra": ToolConfig(
        id="L5-MEDDRA",
        name="MedDRA",
        slug="meddra",
        description="Medical Dictionary for Regulatory Activities - standard medical terminology",
        category="regulatory",
        tier=1,
        priority="high",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.LICENSE_KEY,
        auth_env_var="MEDDRA_LICENSE",
        rate_limit=100,
        cost_per_call=0.001,
        cache_ttl=604800,  # 1 week
        tags=["medical_terminology", "regulatory", "safety", "adverse_events"],
        vendor="MedDRA MSSO",
        license="Subscription required",
        documentation_url="https://www.meddra.org/",
    ),
    
    "docubridge": ToolConfig(
        id="L5-DOCUBRIDGE",
        name="Lorenz Docubridge",
        slug="lorenz-docubridge",
        description="eCTD publishing and validation for regulatory submissions",
        category="regulatory",
        tier=3,
        priority="low",
        adapter_type=AdapterType.LOCAL,
        auth_type=AuthType.NONE,
        rate_limit=10,
        cost_per_call=0.01,
        cache_ttl=0,
        tags=["regulatory", "ectd", "validation", "submission"],
        vendor="Lorenz Life Sciences",
        license="Commercial",
    ),
    
    "trackwise": ToolConfig(
        id="L5-TRACKWISE",
        name="TrackWise",
        slug="trackwise",
        description="Quality management and compliance tracking system",
        category="regulatory",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.REST_API,
        auth_type=AuthType.OAUTH2,
        auth_env_var="TRACKWISE_CLIENT_SECRET",
        rate_limit=20,
        cost_per_call=0.005,
        cache_ttl=3600,
        tags=["quality_management", "compliance", "capa", "deviations"],
        vendor="Sparta Systems",
        license="Commercial",
    ),
}


# ============================================================================
# REGULATORY TOOL CLASS
# ============================================================================

class RegulatoryL5Tool(L5BaseTool):
    """
    L5 Tool class for Regulatory sources.
    Handles OpenFDA, MedDRA, Docubridge, TrackWise.
    """
    
    def __init__(self, tool_key: str):
        if tool_key not in REGULATORY_TOOL_CONFIGS:
            raise ValueError(f"Unknown regulatory tool: {tool_key}")
        
        config = REGULATORY_TOOL_CONFIGS[tool_key]
        super().__init__(config)
        self.tool_key = tool_key
    
    async def _execute_impl(self, params: Dict[str, Any]) -> Any:
        """Route to appropriate handler."""
        handler = getattr(self, f"_execute_{self.tool_key}", None)
        if handler:
            return await handler(params)
        raise NotImplementedError(f"No handler for {self.tool_key}")
    
    # ========================================================================
    # OPENFDA
    # ========================================================================
    
    async def _execute_openfda(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Query OpenFDA APIs.
        
        Params:
            endpoint: str - drug/label, drug/event, drug/enforcement
            query: str - Search query
            search_field: str - Field to search
            max_results: int - Maximum results
            count_field: str - Optional field to count/aggregate
        """
        endpoint = params.get("endpoint", "drug/label")
        query = params.get("query", "")
        search_field = params.get("search_field")
        max_results = params.get("max_results", 20)
        count_field = params.get("count_field")
        
        # Build search query
        if search_field:
            search = f'{search_field}:"{query}"'
        else:
            search = f'openfda.brand_name:"{query}" OR openfda.generic_name:"{query}"'
        
        api_params = {
            'search': search,
            'limit': max_results,
        }
        
        if count_field:
            api_params['count'] = count_field
        
        data = await self._get(
            f"{self.config.base_url}/{endpoint}.json",
            params=api_params
        )
        
        return {
            "results": data.get('results', []),
            "meta": data.get('meta', {}),
        }
    
    async def search_drug_labels(self, query: str, max_results: int = 20) -> Dict[str, Any]:
        """Search drug labels."""
        return await self._execute_openfda({
            "endpoint": "drug/label",
            "query": query,
            "max_results": max_results,
        })
    
    async def search_adverse_events(self, query: str, max_results: int = 100) -> Dict[str, Any]:
        """Search FAERS adverse events."""
        return await self._execute_openfda({
            "endpoint": "drug/event",
            "query": query,
            "search_field": "patient.drug.medicinalproduct",
            "max_results": max_results,
        })
    
    async def get_adverse_event_counts(self, drug: str) -> Dict[str, Any]:
        """Get adverse event reaction counts for a drug."""
        return await self._execute_openfda({
            "endpoint": "drug/event",
            "query": drug,
            "search_field": "patient.drug.medicinalproduct",
            "count_field": "patient.reaction.reactionmeddrapt.exact",
            "max_results": 1,
        })
    
    # ========================================================================
    # MEDDRA
    # ========================================================================
    
    async def _execute_meddra(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Search MedDRA terminology.
        
        Params:
            query: str - Term to search
            level: str - pt (preferred term), llt, hlt, hlgt, soc
            exact: bool - Exact match only
        """
        query = params.get("query", "")
        level = params.get("level", "pt")
        exact = params.get("exact", False)
        
        import os
        if not os.getenv("MEDDRA_LICENSE"):
            # Return mock response - MedDRA requires license
            return self._meddra_fallback(query)
        
        # MedDRA SDK implementation would go here
        # This is a placeholder for the actual SDK integration
        return self._meddra_fallback(query)
    
    def _meddra_fallback(self, query: str) -> Dict[str, Any]:
        """Fallback MedDRA search using local data or public sources."""
        # Common MedDRA SOCs for reference
        socs = [
            "Blood and lymphatic system disorders",
            "Cardiac disorders",
            "Congenital, familial and genetic disorders",
            "Ear and labyrinth disorders",
            "Endocrine disorders",
            "Eye disorders",
            "Gastrointestinal disorders",
            "General disorders and administration site conditions",
            "Hepatobiliary disorders",
            "Immune system disorders",
            "Infections and infestations",
            "Injury, poisoning and procedural complications",
            "Investigations",
            "Metabolism and nutrition disorders",
            "Musculoskeletal and connective tissue disorders",
            "Neoplasms benign, malignant and unspecified",
            "Nervous system disorders",
            "Pregnancy, puerperium and perinatal conditions",
            "Psychiatric disorders",
            "Renal and urinary disorders",
            "Reproductive system and breast disorders",
            "Respiratory, thoracic and mediastinal disorders",
            "Skin and subcutaneous tissue disorders",
            "Social circumstances",
            "Surgical and medical procedures",
            "Vascular disorders",
        ]
        
        # Simple matching
        query_lower = query.lower()
        matches = [s for s in socs if query_lower in s.lower()]
        
        return {
            "terms": [{"term": m, "level": "soc"} for m in matches],
            "total": len(matches),
            "note": "Limited results - MedDRA license required for full access",
        }
    
    # ========================================================================
    # DOCUBRIDGE
    # ========================================================================
    
    async def _execute_docubridge(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Lorenz Docubridge eCTD operations.
        
        Params:
            operation: str - validate, publish, check_status
            document_path: str - Path to document
        """
        operation = params.get("operation", "validate")
        document_path = params.get("document_path")
        
        # Docubridge is typically installed locally
        # This would integrate with the local installation
        return {
            "status": "not_implemented",
            "message": "Docubridge integration requires local installation",
            "operation": operation,
        }
    
    # ========================================================================
    # TRACKWISE
    # ========================================================================
    
    async def _execute_trackwise(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        TrackWise QMS operations.
        
        Params:
            operation: str - search, get_record, create_record
            record_type: str - deviation, capa, complaint
            query: str - Search query
        """
        operation = params.get("operation", "search")
        record_type = params.get("record_type", "deviation")
        query = params.get("query")
        
        import os
        if not os.getenv("TRACKWISE_CLIENT_SECRET"):
            return {
                "status": "not_configured",
                "message": "TrackWise OAuth credentials required",
            }
        
        # TrackWise API integration would go here
        return {
            "status": "not_implemented",
            "message": "TrackWise integration pending",
            "operation": operation,
            "record_type": record_type,
        }


# ============================================================================
# FACTORY FUNCTION
# ============================================================================

def create_regulatory_tool(tool_key: str) -> RegulatoryL5Tool:
    """Factory function to create regulatory tools."""
    return RegulatoryL5Tool(tool_key)


REGULATORY_TOOL_KEYS = list(REGULATORY_TOOL_CONFIGS.keys())
