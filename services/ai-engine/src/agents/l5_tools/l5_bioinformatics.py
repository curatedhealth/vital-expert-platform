"""
VITAL Path AI Services - VITAL L5 Bioinformatics Tools

Bioinformatics tools: BLAST, BioPython, GATK, ENSEMBL, STRING, Cytoscape
6 tools for genomics, proteomics, and molecular biology.

Naming Convention:
- Class: BioinfoL5Tool
- Factory: create_bioinfo_tool(tool_key)
"""

import os
from typing import Dict, Any, List
from .l5_base import L5BaseTool, ToolConfig, AdapterType, AuthType
import structlog

logger = structlog.get_logger()


BIOINFO_TOOL_CONFIGS: Dict[str, ToolConfig] = {
    
    "blast": ToolConfig(
        id="L5-BLAST",
        name="BLAST",
        slug="blast",
        description="Basic Local Alignment Search Tool for sequence similarity",
        category="bioinformatics",
        tier=1,
        priority="high",
        adapter_type=AdapterType.REST_API,
        base_url="https://blast.ncbi.nlm.nih.gov/Blast.cgi",
        auth_type=AuthType.NONE,
        rate_limit=3,
        timeout=120,
        cost_per_call=0.005,
        cache_ttl=86400,
        tags=["bioinformatics", "sequence_alignment", "ncbi", "genomics"],
        vendor="NCBI",
        license="Free",
        documentation_url="https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Web&PAGE_TYPE=BlastDocs",
    ),
    
    "biopython": ToolConfig(
        id="L5-BIOPYTHON",
        name="BioPython",
        slug="biopython",
        description="Python tools for computational molecular biology",
        category="bioinformatics",
        tier=1,
        priority="high",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.NONE,
        rate_limit=1000,
        cost_per_call=0.0001,
        cache_ttl=0,
        tags=["bioinformatics", "python", "molecular_biology", "sequences"],
        vendor="Open Source",
        license="BSD",
        documentation_url="https://biopython.org/",
    ),
    
    "gatk": ToolConfig(
        id="L5-GATK",
        name="GATK",
        slug="gatk",
        description="Genome Analysis Toolkit for variant discovery",
        category="bioinformatics",
        tier=1,
        priority="high",
        adapter_type=AdapterType.JAVA_BRIDGE,
        auth_type=AuthType.NONE,
        rate_limit=5,
        timeout=600,
        cost_per_call=0.01,
        cache_ttl=0,
        tags=["bioinformatics", "genomics", "variant_calling", "ngs"],
        vendor="Broad Institute",
        license="BSD-3-Clause",
        documentation_url="https://gatk.broadinstitute.org/",
    ),
    
    "ensembl": ToolConfig(
        id="L5-ENSEMBL",
        name="ENSEMBL",
        slug="ensembl",
        description="Genome browser and annotation database",
        category="bioinformatics",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.REST_API,
        base_url="https://rest.ensembl.org",
        auth_type=AuthType.NONE,
        rate_limit=15,
        cost_per_call=0.002,
        cache_ttl=86400,
        tags=["bioinformatics", "genomics", "annotation", "genes"],
        vendor="EBI/WTSI",
        license="Free",
        documentation_url="https://rest.ensembl.org/",
    ),
    
    "string": ToolConfig(
        id="L5-STRING",
        name="STRING",
        slug="string-db",
        description="Protein-protein interaction networks",
        category="bioinformatics",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.REST_API,
        base_url="https://string-db.org/api",
        auth_type=AuthType.NONE,
        rate_limit=10,
        cost_per_call=0.002,
        cache_ttl=86400,
        tags=["bioinformatics", "proteomics", "ppi", "networks"],
        vendor="STRING Consortium",
        license="CC BY 4.0",
        documentation_url="https://string-db.org/cgi/help",
    ),
    
    "cytoscape": ToolConfig(
        id="L5-CYTOSCAPE",
        name="Cytoscape",
        slug="cytoscape",
        description="Network visualization and analysis platform",
        category="bioinformatics",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.REST_API,
        base_url=os.getenv("CYTOSCAPE_URL"),
        auth_type=AuthType.NONE,
        rate_limit=100,
        cost_per_call=0.001,
        cache_ttl=0,
        tags=["bioinformatics", "networks", "visualization", "analysis"],
        vendor="Open Source",
        license="LGPL",
        documentation_url="https://cytoscape.org/",
    ),
}


class BioinfoL5Tool(L5BaseTool):
    """L5 Tool class for Bioinformatics sources."""
    
    def __init__(self, tool_key: str):
        if tool_key not in BIOINFO_TOOL_CONFIGS:
            raise ValueError(f"Unknown bioinfo tool: {tool_key}")
        super().__init__(BIOINFO_TOOL_CONFIGS[tool_key])
        self.tool_key = tool_key
    
    async def _execute_impl(self, params: Dict[str, Any]) -> Any:
        handler = getattr(self, f"_execute_{self.tool_key}", None)
        if handler:
            return await handler(params)
        raise NotImplementedError(f"No handler for {self.tool_key}")
    
    async def _execute_blast(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Submit BLAST search."""
        sequence = params.get("sequence", "")
        program = params.get("program", "blastn")  # blastn, blastp, blastx
        database = params.get("database", "nt")
        
        # BLAST requires async job submission
        return {
            "status": "submit_job",
            "message": "BLAST searches are asynchronous. Submit job and poll for results.",
            "sequence_length": len(sequence),
            "program": program,
            "database": database,
        }
    
    async def _execute_biopython(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute BioPython operations."""
        operation = params.get("operation", "parse_sequence")
        sequence = params.get("sequence", "")
        
        try:
            from Bio.Seq import Seq
            from Bio.SeqUtils import gc_fraction
            
            if operation == "parse_sequence":
                seq = Seq(sequence)
                return {
                    "length": len(seq),
                    "gc_content": gc_fraction(seq) * 100,
                    "complement": str(seq.complement()),
                    "reverse_complement": str(seq.reverse_complement()),
                    "transcribe": str(seq.transcribe()) if set(sequence.upper()) <= set("ATGC") else None,
                }
            
            return {"operation": operation, "status": "supported"}
            
        except ImportError:
            return {"error": "BioPython not installed. Run: pip install biopython"}
    
    async def _execute_ensembl(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Query Ensembl REST API."""
        endpoint = params.get("endpoint", "lookup/symbol/homo_sapiens")
        symbol = params.get("symbol", "")
        
        if symbol:
            data = await self._get(
                f"{self.config.base_url}/{endpoint}/{symbol}",
                headers={"Content-Type": "application/json"}
            )
            return {"gene_info": data}
        
        return {"error": "Gene symbol required"}
    
    async def _execute_string(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Query STRING protein interactions."""
        proteins = params.get("proteins", [])
        species = params.get("species", 9606)  # Human
        
        if not proteins:
            return {"error": "Proteins list required"}
        
        data = await self._get(
            f"{self.config.base_url}/json/network",
            params={
                "identifiers": "%0d".join(proteins),
                "species": species,
            }
        )
        
        return {"interactions": data}
    
    async def _execute_gatk(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return {"status": "requires_java", "message": "GATK requires Java runtime and BAM files"}
    
    async def _execute_cytoscape(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return {"status": "requires_local", "message": "Cytoscape must be running locally on port 1234"}


def create_bioinfo_tool(tool_key: str) -> BioinfoL5Tool:
    return BioinfoL5Tool(tool_key)

BIOINFO_TOOL_KEYS = list(BIOINFO_TOOL_CONFIGS.keys())
