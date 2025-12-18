"""
VITAL Path AI Services - VITAL L5 NLP Tools

NLP & Text Processing tools: UMLS, cTAKES, scispaCy, MedCAT, 
MetaMap, ClinicalBERT, BioBERT, Haystack
8 tools for biomedical NLP, concept extraction, and text analysis.

Naming Convention:
- Class: NLPL5Tool
- Factory: create_nlp_tool(tool_key)
"""

from typing import Dict, Any, List, Optional
from .l5_base import L5BaseTool, ToolConfig, AdapterType, AuthType
import structlog

logger = structlog.get_logger()


# ============================================================================
# TOOL CONFIGURATIONS
# ============================================================================

NLP_TOOL_CONFIGS: Dict[str, ToolConfig] = {
    
    "umls": ToolConfig(
        id="L5-UMLS",
        name="UMLS Metathesaurus",
        slug="umls-metathesaurus",
        description="Unified Medical Language System - biomedical terminology and concept mapping",
        category="nlp_text",
        tier=1,
        priority="high",
        adapter_type=AdapterType.REST_API,
        base_url="https://uts-ws.nlm.nih.gov/rest",
        auth_type=AuthType.API_KEY,
        auth_env_var="UMLS_API_KEY",
        rate_limit=20,
        cost_per_call=0.001,
        cache_ttl=86400,
        tags=["medical_terminology", "concept_mapping", "nlp", "umls", "cui"],
        vendor="NLM",
        license="Free (requires UMLS license)",
        documentation_url="https://documentation.uts.nlm.nih.gov/rest/home.html",
    ),
    
    "ctakes": ToolConfig(
        id="L5-CTAKES",
        name="Apache cTAKES",
        slug="apache-ctakes",
        description="Clinical text NLP: concept extraction, negation detection, temporal relations",
        category="nlp_text",
        tier=1,
        priority="high",
        adapter_type=AdapterType.JAVA_BRIDGE,
        auth_type=AuthType.NONE,
        rate_limit=10,
        cost_per_call=0.002,
        cache_ttl=3600,
        tags=["clinical_nlp", "concept_extraction", "negation", "umls", "ner"],
        vendor="Apache Software Foundation",
        license="Apache-2.0",
        documentation_url="https://ctakes.apache.org/",
    ),
    
    "scispacy": ToolConfig(
        id="L5-SCISPACY",
        name="scispaCy",
        slug="scispacy",
        description="Biomedical spaCy models for NER, parsing, and scientific text",
        category="nlp_text",
        tier=1,
        priority="high",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.NONE,
        rate_limit=100,
        cost_per_call=0.0001,
        cache_ttl=0,  # No caching for local models
        tags=["nlp", "ner", "biomedical", "spacy", "python"],
        vendor="Allen AI",
        license="Apache-2.0",
        documentation_url="https://allenai.github.io/scispacy/",
    ),
    
    "medcat": ToolConfig(
        id="L5-MEDCAT",
        name="MedCAT",
        slug="medcat",
        description="Medical Concept Annotation Tool - links text to SNOMED/UMLS",
        category="nlp_text",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.NONE,
        rate_limit=50,
        cost_per_call=0.001,
        cache_ttl=0,
        tags=["nlp", "snomed", "umls", "concept_annotation", "clinical"],
        vendor="Open Source",
        license="MIT",
        documentation_url="https://github.com/CogStack/MedCAT",
    ),
    
    "metamap": ToolConfig(
        id="L5-METAMAP",
        name="MetaMap",
        slug="metamap",
        description="NLM tool for mapping biomedical text to UMLS concepts",
        category="nlp_text",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.REST_API,
        base_url="https://ii.nlm.nih.gov/metamap-rest",
        auth_type=AuthType.NONE,
        rate_limit=10,
        timeout=60,
        cost_per_call=0.002,
        cache_ttl=3600,
        tags=["nlp", "umls", "concept_mapping", "nlm"],
        vendor="NLM",
        license="Free",
        documentation_url="https://metamap.nlm.nih.gov/",
    ),
    
    "clinicalbert": ToolConfig(
        id="L5-CLINICALBERT",
        name="ClinicalBERT",
        slug="clinicalbert",
        description="BERT model pre-trained on clinical notes for NLU tasks",
        category="nlp_text",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.NONE,
        rate_limit=20,
        cost_per_call=0.001,
        cache_ttl=0,
        tags=["nlp", "bert", "clinical_notes", "embeddings", "transformer"],
        vendor="Open Source",
        license="MIT",
        documentation_url="https://huggingface.co/emilyalsentzer/Bio_ClinicalBERT",
    ),
    
    "biobert": ToolConfig(
        id="L5-BIOBERT",
        name="BioBERT",
        slug="biobert",
        description="BERT pre-trained on biomedical literature (PubMed)",
        category="nlp_text",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.NONE,
        rate_limit=20,
        cost_per_call=0.001,
        cache_ttl=0,
        tags=["nlp", "bert", "biomedical", "pubmed", "embeddings"],
        vendor="DMIS Lab",
        license="Apache-2.0",
        documentation_url="https://github.com/dmis-lab/biobert",
    ),
    
    "haystack": ToolConfig(
        id="L5-HAYSTACK",
        name="Haystack",
        slug="haystack",
        description="End-to-end NLP framework for search, QA, and RAG",
        category="nlp_text",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.NONE,
        rate_limit=50,
        cost_per_call=0.001,
        cache_ttl=0,
        tags=["nlp", "rag", "search", "qa", "retrieval"],
        vendor="deepset",
        license="Apache-2.0",
        documentation_url="https://haystack.deepset.ai/",
    ),
}


# ============================================================================
# NLP TOOL CLASS
# ============================================================================

class NLPL5Tool(L5BaseTool):
    """
    L5 Tool class for NLP & Text Processing sources.
    One class handles all 8 NLP tools based on configuration.
    """
    
    def __init__(self, tool_key: str):
        if tool_key not in NLP_TOOL_CONFIGS:
            raise ValueError(f"Unknown NLP tool: {tool_key}")
        
        config = NLP_TOOL_CONFIGS[tool_key]
        super().__init__(config)
        self.tool_key = tool_key
        
        # Lazy-loaded models
        self._spacy_model = None
        self._bert_model = None
        self._bert_tokenizer = None
    
    async def _execute_impl(self, params: Dict[str, Any]) -> Any:
        """Route to appropriate handler based on tool_key."""
        handler = getattr(self, f"_execute_{self.tool_key}", None)
        if handler:
            return await handler(params)
        return await self._execute_generic(params)
    
    # ========================================================================
    # UMLS
    # ========================================================================
    
    async def _execute_umls(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Search UMLS Metathesaurus.
        
        Params:
            query: str - Term to search
            search_type: str - words, exact, normalizedString
            source: str - Filter by source vocabulary (SNOMEDCT_US, ICD10CM, etc.)
            max_results: int - Maximum results
        """
        import os
        
        query = params.get("query", "")
        search_type = params.get("search_type", "words")
        source = params.get("source")
        max_results = params.get("max_results", 25)
        
        api_key = os.getenv("UMLS_API_KEY")
        if not api_key:
            return {"error": "UMLS_API_KEY not configured", "concepts": []}
        
        api_params = {
            "string": query,
            "searchType": search_type,
            "returnIdType": "concept",
            "pageSize": max_results,
            "apiKey": api_key,
        }
        
        if source:
            api_params["sabs"] = source
        
        data = await self._get(
            f"{self.config.base_url}/search/current",
            params=api_params
        )
        
        results = data.get("result", {}).get("results", [])
        
        concepts = []
        for r in results:
            concepts.append({
                "cui": r.get("ui"),
                "name": r.get("name"),
                "semantic_types": r.get("semanticTypes", []),
                "source": r.get("rootSource"),
                "uri": r.get("uri"),
            })
        
        return {
            "concepts": concepts,
            "total": len(concepts),
            "query": query,
        }
    
    # ========================================================================
    # SCISPACY
    # ========================================================================
    
    async def _execute_scispacy(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process text with scispaCy models.
        
        Params:
            text: str - Text to process
            model: str - Model name (en_core_sci_sm, en_core_sci_lg, en_ner_bc5cdr_md)
            operations: List[str] - Operations: ner, parse, embed, sentences
        """
        text = params.get("text", "")
        model_name = params.get("model", "en_core_sci_sm")
        operations = params.get("operations", ["ner"])
        
        try:
            import spacy
            
            # Load model (cached by spaCy)
            if self._spacy_model is None or self._spacy_model.meta["name"] != model_name:
                self._spacy_model = spacy.load(model_name)
            
            doc = self._spacy_model(text)
            
            result = {"text": text, "model": model_name}
            
            if "ner" in operations:
                result["entities"] = [
                    {
                        "text": ent.text,
                        "label": ent.label_,
                        "start": ent.start_char,
                        "end": ent.end_char,
                    }
                    for ent in doc.ents
                ]
            
            if "parse" in operations:
                result["tokens"] = [
                    {
                        "text": token.text,
                        "lemma": token.lemma_,
                        "pos": token.pos_,
                        "dep": token.dep_,
                        "head": token.head.text,
                    }
                    for token in doc
                ][:100]  # Limit tokens
            
            if "sentences" in operations:
                result["sentences"] = [sent.text for sent in doc.sents]
            
            if "embed" in operations and doc.has_vector:
                result["embedding_dim"] = len(doc.vector)
                # Don't return full embedding to save space
                result["has_embedding"] = True
            
            return result
            
        except ImportError:
            return {"error": "scispaCy not installed. Run: pip install scispacy"}
        except OSError as e:
            return {"error": f"Model not found: {model_name}. Install with: pip install {model_name}"}
    
    # ========================================================================
    # CLINICALBERT / BIOBERT
    # ========================================================================
    
    async def _execute_clinicalbert(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate embeddings with ClinicalBERT."""
        return await self._execute_bert(
            params,
            model_name="emilyalsentzer/Bio_ClinicalBERT"
        )
    
    async def _execute_biobert(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate embeddings with BioBERT."""
        return await self._execute_bert(
            params,
            model_name="dmis-lab/biobert-base-cased-v1.2"
        )
    
    async def _execute_bert(
        self,
        params: Dict[str, Any],
        model_name: str
    ) -> Dict[str, Any]:
        """
        Generate embeddings or classify with BERT models.
        
        Params:
            text: str - Text to process
            task: str - embed, classify
            return_embedding: bool - Whether to return full embedding
        """
        text = params.get("text", "")
        task = params.get("task", "embed")
        return_embedding = params.get("return_embedding", False)
        
        try:
            from transformers import AutoTokenizer, AutoModel
            import torch
            
            # Load model (lazy)
            if self._bert_model is None:
                self._bert_tokenizer = AutoTokenizer.from_pretrained(model_name)
                self._bert_model = AutoModel.from_pretrained(model_name)
            
            inputs = self._bert_tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                max_length=512
            )
            
            with torch.no_grad():
                outputs = self._bert_model(**inputs)
            
            # Get [CLS] token embedding
            cls_embedding = outputs.last_hidden_state[:, 0, :].squeeze()
            
            result = {
                "text": text[:200],
                "model": model_name,
                "embedding_dim": cls_embedding.shape[0],
                "task": task,
            }
            
            if return_embedding:
                result["embedding"] = cls_embedding.numpy().tolist()
            
            return result
            
        except ImportError:
            return {"error": "transformers not installed. Run: pip install transformers torch"}
    
    # ========================================================================
    # CTAKES
    # ========================================================================
    
    async def _execute_ctakes(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process clinical text with Apache cTAKES.
        
        Params:
            text: str - Clinical text
            pipelines: List[str] - Pipelines to run
        """
        text = params.get("text", "")
        pipelines = params.get("pipelines", ["clinical"])
        
        # cTAKES requires Java and local installation
        # This is a placeholder for the Java bridge implementation
        return {
            "status": "not_implemented",
            "message": "cTAKES requires Java bridge. Use REST service or local installation.",
            "text_length": len(text),
        }
    
    # ========================================================================
    # METAMAP
    # ========================================================================
    
    async def _execute_metamap(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Map text to UMLS concepts with MetaMap.
        
        Params:
            text: str - Text to process
            semantic_types: List[str] - Filter by semantic types
        """
        text = params.get("text", "")
        semantic_types = params.get("semantic_types", [])
        
        try:
            # MetaMap REST API
            data = await self._post(
                f"{self.config.base_url}/semantic/search",
                json_data={"text": text}
            )
            
            return {
                "concepts": data.get("concepts", []),
                "total": len(data.get("concepts", [])),
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "message": "MetaMap REST service may be unavailable",
            }
    
    # ========================================================================
    # MEDCAT
    # ========================================================================
    
    async def _execute_medcat(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Annotate text with MedCAT.
        
        Params:
            text: str - Text to annotate
            model_path: str - Path to MedCAT model
        """
        text = params.get("text", "")
        
        try:
            from medcat.cat import CAT
            
            # MedCAT requires a trained model
            return {
                "status": "requires_model",
                "message": "MedCAT requires a pre-trained model pack (e.g., SNOMED)",
                "text_length": len(text),
            }
            
        except ImportError:
            return {"error": "MedCAT not installed. Run: pip install medcat"}
    
    # ========================================================================
    # HAYSTACK
    # ========================================================================
    
    async def _execute_haystack(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use Haystack for retrieval/QA.
        
        Params:
            query: str - Question or query
            documents: List[str] - Documents to search
            top_k: int - Number of results
        """
        query = params.get("query", "")
        documents = params.get("documents", [])
        top_k = params.get("top_k", 5)
        
        try:
            # Haystack 2.0+ API
            from haystack import Pipeline
            from haystack.components.retrievers import InMemoryBM25Retriever
            from haystack.document_stores.in_memory import InMemoryDocumentStore
            from haystack import Document
            
            # Create document store
            doc_store = InMemoryDocumentStore()
            docs = [Document(content=d) for d in documents]
            doc_store.write_documents(docs)
            
            # Simple BM25 retrieval
            retriever = InMemoryBM25Retriever(document_store=doc_store)
            results = retriever.run(query=query, top_k=top_k)
            
            return {
                "query": query,
                "documents": [
                    {"content": d.content[:500], "score": d.score}
                    for d in results.get("documents", [])
                ],
            }
            
        except ImportError:
            return {"error": "Haystack not installed. Run: pip install haystack-ai"}
    
    # ========================================================================
    # GENERIC
    # ========================================================================
    
    async def _execute_generic(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic handler for tools without custom implementation."""
        return {
            "status": "not_implemented",
            "tool": self.tool_key,
            "message": f"Tool {self.tool_key} requires custom implementation",
        }


# ============================================================================
# FACTORY FUNCTION
# ============================================================================

def create_nlp_tool(tool_key: str) -> NLPL5Tool:
    """Factory function to create NLP tools."""
    return NLPL5Tool(tool_key)


NLP_TOOL_KEYS = list(NLP_TOOL_CONFIGS.keys())
