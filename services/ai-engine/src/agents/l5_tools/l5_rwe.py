"""
VITAL Path AI Services - VITAL L5 Real World Evidence Tools

RWE tools: OMOP CDM, HADES, ACHILLES, CohortDiagnostics, White Rabbit
6 tools for observational data analysis and OHDSI ecosystem.

Naming Convention:
- Class: RWEL5Tool
- Factory: create_rwe_tool(tool_key)
"""

from typing import Dict, Any, List
from .l5_base import L5BaseTool, ToolConfig, AdapterType, AuthType
import structlog

logger = structlog.get_logger()


# ============================================================================
# TOOL CONFIGURATIONS
# ============================================================================

RWE_TOOL_CONFIGS: Dict[str, ToolConfig] = {
    
    "omop": ToolConfig(
        id="L5-OMOP",
        name="OMOP CDM",
        slug="omop-cdm",
        description="OMOP Common Data Model for observational health data",
        category="real_world_evidence",
        tier=1,
        priority="critical",
        adapter_type=AdapterType.DATABASE,
        auth_type=AuthType.NONE,
        rate_limit=100,
        cost_per_call=0.005,
        cache_ttl=3600,
        tags=["rwe", "omop", "observational_data", "ohdsi", "cdm"],
        vendor="OHDSI",
        license="Apache-2.0",
        documentation_url="https://ohdsi.github.io/CommonDataModel/",
    ),
    
    "hades": ToolConfig(
        id="L5-HADES",
        name="HADES",
        slug="hades",
        description="Health Analytics Data-to-Evidence Suite - OHDSI R packages",
        category="real_world_evidence",
        tier=1,
        priority="high",
        adapter_type=AdapterType.R_BRIDGE,
        auth_type=AuthType.NONE,
        rate_limit=10,
        timeout=300,
        cost_per_call=0.01,
        cache_ttl=3600,
        tags=["rwe", "omop", "analytics", "ohdsi", "r"],
        vendor="OHDSI",
        license="Apache-2.0",
        documentation_url="https://ohdsi.github.io/Hades/",
    ),
    
    "achilles": ToolConfig(
        id="L5-ACHILLES",
        name="ACHILLES",
        slug="achilles",
        description="Data characterization and quality analysis for OMOP CDM",
        category="real_world_evidence",
        tier=2,
        priority="high",
        adapter_type=AdapterType.R_BRIDGE,
        auth_type=AuthType.NONE,
        rate_limit=5,
        timeout=600,
        cost_per_call=0.01,
        cache_ttl=86400,
        tags=["rwe", "omop", "data_quality", "characterization", "ohdsi"],
        vendor="OHDSI",
        license="Apache-2.0",
        documentation_url="https://ohdsi.github.io/Achilles/",
    ),
    
    "cohort_diagnostics": ToolConfig(
        id="L5-COHORTDIAG",
        name="CohortDiagnostics",
        slug="cohort-diagnostics",
        description="Cohort phenotype evaluation and diagnostics",
        category="real_world_evidence",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.R_BRIDGE,
        auth_type=AuthType.NONE,
        rate_limit=5,
        timeout=600,
        cost_per_call=0.01,
        cache_ttl=3600,
        tags=["rwe", "omop", "phenotyping", "cohort", "ohdsi"],
        vendor="OHDSI",
        license="Apache-2.0",
        documentation_url="https://ohdsi.github.io/CohortDiagnostics/",
    ),
    
    "white_rabbit": ToolConfig(
        id="L5-WHITERABBIT",
        name="White Rabbit",
        slug="white-rabbit",
        description="ETL profiling tool for OMOP CDM mapping",
        category="real_world_evidence",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.JAVA_BRIDGE,
        auth_type=AuthType.NONE,
        rate_limit=10,
        timeout=300,
        cost_per_call=0.005,
        cache_ttl=86400,
        tags=["rwe", "etl", "omop", "profiling", "ohdsi"],
        vendor="OHDSI",
        license="Apache-2.0",
        documentation_url="https://ohdsi.github.io/WhiteRabbit/",
    ),
    
    "rabbit_in_a_hat": ToolConfig(
        id="L5-RABBITHAT",
        name="Rabbit-In-a-Hat",
        slug="rabbit-in-a-hat",
        description="ETL mapping specification tool for OMOP CDM",
        category="real_world_evidence",
        tier=3,
        priority="low",
        adapter_type=AdapterType.LOCAL,
        auth_type=AuthType.NONE,
        rate_limit=20,
        cost_per_call=0.002,
        cache_ttl=0,
        tags=["rwe", "etl", "mapping", "omop", "ohdsi"],
        vendor="OHDSI",
        license="Apache-2.0",
        documentation_url="https://ohdsi.github.io/WhiteRabbit/",
    ),
}


# ============================================================================
# RWE TOOL CLASS
# ============================================================================

class RWEL5Tool(L5BaseTool):
    """
    L5 Tool class for Real World Evidence sources.
    Handles OMOP, HADES, ACHILLES, and other OHDSI tools.
    """
    
    def __init__(self, tool_key: str):
        if tool_key not in RWE_TOOL_CONFIGS:
            raise ValueError(f"Unknown RWE tool: {tool_key}")
        
        config = RWE_TOOL_CONFIGS[tool_key]
        super().__init__(config)
        self.tool_key = tool_key
    
    async def _execute_impl(self, params: Dict[str, Any]) -> Any:
        """Route to appropriate handler."""
        handler = getattr(self, f"_execute_{self.tool_key}", None)
        if handler:
            return await handler(params)
        raise NotImplementedError(f"No handler for {self.tool_key}")
    
    # ========================================================================
    # OMOP CDM
    # ========================================================================
    
    async def _execute_omop(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Query OMOP CDM database.
        
        Params:
            operation: str - query, concept_search, cohort_count
            query: str - SQL query or search term
            concept_ids: List[int] - OMOP concept IDs
            connection_string: str - Database connection
        """
        operation = params.get("operation", "concept_search")
        query = params.get("query", "")
        concept_ids = params.get("concept_ids", [])
        
        # OMOP concept search (using Athena vocabulary)
        if operation == "concept_search":
            return await self._search_omop_concepts(query)
        
        # Cohort count
        elif operation == "cohort_count":
            return {
                "status": "requires_connection",
                "message": "Database connection required for cohort queries",
            }
        
        return {"status": "unknown_operation", "operation": operation}
    
    async def _search_omop_concepts(self, query: str) -> Dict[str, Any]:
        """Search OMOP/Athena vocabulary."""
        # Athena OHDSI vocabulary browser API
        try:
            data = await self._get(
                "https://athena.ohdsi.org/api/v1/concepts",
                params={
                    "query": query,
                    "pageSize": 25,
                }
            )
            
            concepts = []
            for item in data.get("content", []):
                concepts.append({
                    "concept_id": item.get("id"),
                    "concept_name": item.get("name"),
                    "domain": item.get("domain"),
                    "vocabulary": item.get("vocabulary"),
                    "concept_class": item.get("conceptClass"),
                    "standard_concept": item.get("standardConcept"),
                })
            
            return {
                "concepts": concepts,
                "total": data.get("totalElements", len(concepts)),
            }
            
        except Exception as e:
            return {"error": str(e), "concepts": []}
    
    # ========================================================================
    # HADES
    # ========================================================================
    
    async def _execute_hades(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute HADES R package functions.
        
        Params:
            package: str - HADES package (CohortMethod, PatientLevelPrediction, etc.)
            function: str - Function to execute
            args: Dict - Function arguments
        """
        package = params.get("package", "")
        function = params.get("function", "")
        args = params.get("args", {})
        
        # HADES requires R bridge
        return {
            "status": "requires_r_bridge",
            "message": "HADES execution requires R environment",
            "package": package,
            "function": function,
            "available_packages": [
                "CohortMethod",
                "PatientLevelPrediction",
                "SelfControlledCaseSeries",
                "SelfControlledCohort",
                "CaseControl",
                "CaseCrossover",
                "EvidenceSynthesis",
                "FeatureExtraction",
            ],
        }
    
    # ========================================================================
    # ACHILLES
    # ========================================================================
    
    async def _execute_achilles(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run ACHILLES data characterization.
        
        Params:
            operation: str - run, get_results, get_heel
            cdm_database_schema: str - CDM schema name
            results_database_schema: str - Results schema
        """
        operation = params.get("operation", "get_results")
        
        return {
            "status": "requires_r_bridge",
            "message": "ACHILLES requires R environment and database connection",
            "operation": operation,
            "analyses_available": [
                "person_demographics",
                "visit_occurrence",
                "condition_occurrence",
                "drug_exposure",
                "procedure_occurrence",
                "measurement",
                "observation",
            ],
        }
    
    # ========================================================================
    # COHORT DIAGNOSTICS
    # ========================================================================
    
    async def _execute_cohort_diagnostics(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run CohortDiagnostics for phenotype evaluation.
        
        Params:
            cohort_definition: Dict - Cohort definition JSON
            operation: str - run, compare, visualize
        """
        operation = params.get("operation", "run")
        cohort_definition = params.get("cohort_definition")
        
        return {
            "status": "requires_r_bridge",
            "message": "CohortDiagnostics requires R environment",
            "operation": operation,
            "diagnostics_available": [
                "incidence_rate",
                "time_distribution",
                "cohort_overlap",
                "index_event_breakdown",
                "visit_context",
                "cohort_characterization",
            ],
        }
    
    # ========================================================================
    # WHITE RABBIT
    # ========================================================================
    
    async def _execute_white_rabbit(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run White Rabbit ETL profiling.
        
        Params:
            source_connection: str - Source database connection
            tables: List[str] - Tables to profile
        """
        tables = params.get("tables", [])
        
        return {
            "status": "requires_java",
            "message": "White Rabbit requires Java runtime",
            "tables_to_profile": tables,
            "output_files": [
                "ScanReport.xlsx",
                "SourceFields.csv",
            ],
        }
    
    # ========================================================================
    # RABBIT IN A HAT
    # ========================================================================
    
    async def _execute_rabbit_in_a_hat(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate ETL mapping specification.
        
        Params:
            scan_report: str - Path to White Rabbit scan report
            target_cdm: str - Target CDM version
        """
        scan_report = params.get("scan_report", "")
        target_cdm = params.get("target_cdm", "5.4")
        
        return {
            "status": "requires_java",
            "message": "Rabbit-In-a-Hat is a GUI application",
            "target_cdm": target_cdm,
            "output_files": [
                "ETL_Specification.json",
                "ETL_Specification.md",
            ],
        }


# ============================================================================
# FACTORY FUNCTION
# ============================================================================

def create_rwe_tool(tool_key: str) -> RWEL5Tool:
    """Factory function to create RWE tools."""
    return RWEL5Tool(tool_key)


RWE_TOOL_KEYS = list(RWE_TOOL_CONFIGS.keys())
