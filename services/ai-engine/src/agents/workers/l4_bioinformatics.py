"""
VITAL Path AI Services - VITAL L4 Bioinformatics Workers

Bioinformatics Workers: Sequence Analyzer, Variant Annotator,
Pathway Analyst, Genomics Processor, Protein Structure Analyst
5 workers for bioinformatics and computational biology tasks.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: BioinfoL4Worker
- Factory: create_bioinfo_worker(worker_key)
"""

from typing import Dict, Any, List
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory
import structlog

logger = structlog.get_logger()


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
BIOINFO_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "sequence_analyzer": WorkerConfig(
        id="L4-SEQ",
        name="Sequence Analyzer",
        description="Analyze DNA, RNA, and protein sequences",
        category=WorkerCategory.BIOINFORMATICS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "blast", "biopython", "ensembl"
        ],
        task_types=[
            "align_sequences", "find_homologs", "calculate_identity",
            "identify_motifs", "predict_secondary_structure", "translate_sequence"
        ],
    ),

    "variant_annotator": WorkerConfig(
        id="L4-VAR",
        name="Variant Annotator",
        description="Annotate genetic variants and predict effects",
        category=WorkerCategory.BIOINFORMATICS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "ensembl", "gatk", "biopython"
        ],
        task_types=[
            "annotate_variant", "predict_impact", "classify_pathogenicity",
            "find_population_frequency", "check_clinvar", "assess_acmg"
        ],
    ),

    "pathway_analyst": WorkerConfig(
        id="L4-PWY",
        name="Pathway Analyst",
        description="Analyze biological pathways and gene networks",
        category=WorkerCategory.BIOINFORMATICS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "string", "cytoscape", "ensembl", "biopython"
        ],
        task_types=[
            "enrichment_analysis", "pathway_mapping", "network_analysis",
            "find_interactions", "identify_hubs", "functional_annotation"
        ],
    ),

    "genomics_processor": WorkerConfig(
        id="L4-GEN",
        name="Genomics Processor",
        description="Process and analyze genomic data",
        category=WorkerCategory.BIOINFORMATICS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "gatk", "biopython", "ensembl"
        ],
        task_types=[
            "call_variants", "filter_variants", "calculate_coverage",
            "detect_cnv", "assess_quality", "generate_vcf_stats"
        ],
    ),

    "protein_structure_analyst": WorkerConfig(
        id="L4-PSA",
        name="Protein Structure Analyst",
        description="Analyze protein structures and predict function",
        category=WorkerCategory.BIOINFORMATICS,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "blast", "biopython", "string"
        ],
        task_types=[
            "predict_structure", "find_domains", "analyze_binding_sites",
            "calculate_properties", "compare_structures", "identify_drug_targets"
        ],
    ),
}


class BioinfoL4Worker(L4BaseWorker):
    """L4 Worker class for bioinformatics tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in BIOINFO_WORKER_CONFIGS:
            raise ValueError(f"Unknown bioinformatics worker: {worker_key}")
        
        config = BIOINFO_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        """Route to appropriate task handler."""
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_align_sequences(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Align sequences using BLAST."""
        query_sequence = params.get("sequence", "")
        database = params.get("database", "nr")
        program = params.get("program", "blastp")  # blastn, blastp, blastx, etc.
        
        result = await self.call_l5_tool("blast", {
            "sequence": query_sequence,
            "database": database,
            "program": program,
            "max_hits": params.get("max_hits", 10),
        })
        
        return {
            "query_length": len(query_sequence),
            "database": database,
            "program": program,
            "hits": result.get("data", {}).get("hits", []),
            "best_hit": result.get("data", {}).get("hits", [{}])[0] if result.get("data", {}).get("hits") else None,
        }
    
    async def _task_find_homologs(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Find homologous sequences."""
        sequence = params.get("sequence", "")
        e_value_threshold = params.get("e_value", 1e-5)
        
        result = await self.call_l5_tool("blast", {
            "sequence": sequence,
            "database": params.get("database", "nr"),
            "program": "blastp" if self._is_protein(sequence) else "blastn",
            "e_value": e_value_threshold,
        })
        
        hits = result.get("data", {}).get("hits", [])
        
        # Filter by e-value
        homologs = [h for h in hits if h.get("e_value", 1) <= e_value_threshold]
        
        return {
            "query_type": "protein" if self._is_protein(sequence) else "nucleotide",
            "homologs_found": len(homologs),
            "homologs": homologs,
            "e_value_threshold": e_value_threshold,
        }
    
    def _is_protein(self, sequence: str) -> bool:
        """Determine if sequence is protein or nucleotide."""
        protein_chars = set("ACDEFGHIKLMNPQRSTVWY")
        nucleotide_chars = set("ACGTU")
        
        seq_chars = set(sequence.upper().replace(" ", "").replace("\n", ""))
        
        # If contains only nucleotide chars, it's DNA/RNA
        if seq_chars.issubset(nucleotide_chars):
            return False
        return True
    
    async def _task_annotate_variant(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Annotate genetic variant."""
        chromosome = params.get("chromosome", "")
        position = params.get("position", 0)
        reference = params.get("reference", "")
        alternate = params.get("alternate", "")
        
        # Get gene/transcript information from Ensembl
        ensembl_result = await self.call_l5_tool("ensembl", {
            "operation": "variant_annotation",
            "chromosome": chromosome,
            "position": position,
            "reference": reference,
            "alternate": alternate,
        })
        
        annotation = ensembl_result.get("data", {})
        
        return {
            "variant": f"{chromosome}:{position}{reference}>{alternate}",
            "gene": annotation.get("gene_symbol"),
            "transcript": annotation.get("transcript_id"),
            "consequence": annotation.get("consequence"),
            "protein_change": annotation.get("protein_change"),
            "population_frequency": annotation.get("gnomad_af"),
            "clinical_significance": annotation.get("clinical_significance"),
        }
    
    async def _task_enrichment_analysis(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Perform pathway enrichment analysis."""
        gene_list = params.get("genes", [])
        species = params.get("species", "human")
        
        # Use STRING for enrichment
        result = await self.call_l5_tool("string", {
            "operation": "enrichment",
            "proteins": gene_list,
            "species": species,
        })
        
        enrichments = result.get("data", {}).get("enrichments", [])
        
        # Group by category
        grouped = {}
        for e in enrichments:
            category = e.get("category", "unknown")
            if category not in grouped:
                grouped[category] = []
            grouped[category].append({
                "term": e.get("term"),
                "p_value": e.get("p_value"),
                "fdr": e.get("fdr"),
                "genes": e.get("genes"),
            })
        
        return {
            "input_genes": len(gene_list),
            "enrichment_categories": list(grouped.keys()),
            "enrichments_by_category": grouped,
            "top_terms": enrichments[:10],
        }
    
    async def _task_find_interactions(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Find protein-protein interactions."""
        proteins = params.get("proteins", [])
        confidence_threshold = params.get("confidence", 0.7)
        
        result = await self.call_l5_tool("string", {
            "operation": "interactions",
            "proteins": proteins,
            "required_score": int(confidence_threshold * 1000),
        })
        
        interactions = result.get("data", {}).get("interactions", [])
        
        return {
            "query_proteins": proteins,
            "interactions_found": len(interactions),
            "interactions": interactions,
            "confidence_threshold": confidence_threshold,
        }
    
    async def _task_translate_sequence(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Translate DNA/RNA to protein."""
        sequence = params.get("sequence", "")
        frame = params.get("reading_frame", 1)
        
        result = await self.call_l5_tool("biopython", {
            "operation": "translate",
            "sequence": sequence,
            "reading_frame": frame,
        })
        
        return {
            "nucleotide_length": len(sequence),
            "reading_frame": frame,
            "protein_sequence": result.get("data", {}).get("protein"),
            "protein_length": len(result.get("data", {}).get("protein", "")),
        }
    
    async def _task_calculate_identity(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate sequence identity between two sequences."""
        seq1 = params.get("sequence1", "")
        seq2 = params.get("sequence2", "")
        
        # Simple identity calculation
        if len(seq1) != len(seq2):
            return {"error": "Sequences must be aligned (same length)"}
        
        matches = sum(1 for a, b in zip(seq1.upper(), seq2.upper()) if a == b)
        identity = matches / len(seq1) * 100 if seq1 else 0
        
        return {
            "sequence1_length": len(seq1),
            "sequence2_length": len(seq2),
            "identical_positions": matches,
            "percent_identity": round(identity, 2),
        }
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task handler."""
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_bioinfo_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> BioinfoL4Worker:
    return BioinfoL4Worker(worker_key, l5_tools)

BIOINFO_WORKER_KEYS = list(BIOINFO_WORKER_CONFIGS.keys())
