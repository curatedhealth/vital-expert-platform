"""
VITAL Path AI Services - VITAL L5 AI Frameworks Tools

AI & ML Frameworks: LlamaIndex, Semantic Kernel, Haystack
3 tools for LLM orchestration and RAG pipelines.

Note: Haystack is also defined in NLP tools as it serves dual purposes.

Naming Convention:
- Class: AIFrameworksL5Tool
- Factory: create_ai_frameworks_tool(tool_key)
"""

from typing import Dict, Any, List
from .l5_base import L5BaseTool, ToolConfig, AdapterType, AuthType

AI_FRAMEWORKS_TOOL_CONFIGS: Dict[str, ToolConfig] = {
    
    "llamaindex": ToolConfig(
        id="L5-LLAMAINDEX",
        name="LlamaIndex",
        slug="llamaindex",
        description="Data framework for LLM applications with indexing and retrieval",
        category="ai_frameworks",
        tier=1,
        priority="high",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.NONE,
        rate_limit=100,
        cost_per_call=0.001,
        tags=["ai", "llm", "rag", "indexing", "retrieval"],
        vendor="LlamaIndex",
        license="MIT",
        documentation_url="https://docs.llamaindex.ai/",
    ),
    
    "semantic_kernel": ToolConfig(
        id="L5-SEMKERNEL",
        name="Semantic Kernel",
        slug="semantic-kernel",
        description="Microsoft SDK for LLM orchestration with plugins",
        category="ai_frameworks",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.NONE,
        rate_limit=100,
        cost_per_call=0.001,
        tags=["ai", "llm", "microsoft", "orchestration", "plugins"],
        vendor="Microsoft",
        license="MIT",
        documentation_url="https://learn.microsoft.com/en-us/semantic-kernel/",
    ),
    
    "haystack_ai": ToolConfig(
        id="L5-HAYSTACK-AI",
        name="Haystack (AI Framework)",
        slug="haystack-ai",
        description="End-to-end NLP framework for production LLM applications",
        category="ai_frameworks",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.NONE,
        rate_limit=50,
        cost_per_call=0.001,
        tags=["ai", "llm", "rag", "pipelines", "production"],
        vendor="deepset",
        license="Apache-2.0",
        documentation_url="https://haystack.deepset.ai/",
    ),
}


class AIFrameworksL5Tool(L5BaseTool):
    """L5 Tool class for AI & ML Frameworks."""
    
    def __init__(self, tool_key: str):
        if tool_key not in AI_FRAMEWORKS_TOOL_CONFIGS:
            raise ValueError(f"Unknown AI framework tool: {tool_key}")
        super().__init__(AI_FRAMEWORKS_TOOL_CONFIGS[tool_key])
        self.tool_key = tool_key
    
    async def _execute_impl(self, params: Dict[str, Any]) -> Any:
        handler = getattr(self, f"_execute_{self.tool_key}", None)
        if handler:
            return await handler(params)
        raise NotImplementedError(f"No handler for {self.tool_key}")
    
    async def _execute_llamaindex(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Use LlamaIndex for RAG operations."""
        operation = params.get("operation", "query")
        documents = params.get("documents", [])
        query = params.get("query", "")
        
        try:
            from llama_index.core import VectorStoreIndex, Document
            
            if operation == "index":
                if not documents:
                    return {"error": "Documents required for indexing"}
                
                docs = [Document(text=d) for d in documents]
                index = VectorStoreIndex.from_documents(docs)
                
                return {
                    "status": "indexed",
                    "document_count": len(docs),
                }
            
            elif operation == "query":
                return {
                    "status": "requires_index",
                    "message": "Create index first, then query",
                    "example": "index.as_query_engine().query('your question')",
                }
            
            return {"operation": operation, "status": "unknown"}
            
        except ImportError:
            return {"error": "llama-index not installed. Run: pip install llama-index"}
    
    async def _execute_semantic_kernel(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Use Semantic Kernel for orchestration."""
        operation = params.get("operation", "info")
        
        try:
            import semantic_kernel as sk
            
            return {
                "status": "ready",
                "version": sk.__version__ if hasattr(sk, '__version__') else "unknown",
                "features": [
                    "Prompt templates",
                    "Semantic functions",
                    "Native functions (plugins)",
                    "Memory management",
                    "Planners",
                    "Connectors (OpenAI, Azure, HuggingFace)",
                ],
            }
            
        except ImportError:
            return {"error": "semantic-kernel not installed. Run: pip install semantic-kernel"}
    
    async def _execute_haystack_ai(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Use Haystack for LLM pipelines."""
        operation = params.get("operation", "info")
        
        try:
            from haystack import Pipeline
            
            return {
                "status": "ready",
                "pipeline_types": [
                    "Indexing Pipeline",
                    "Query Pipeline",
                    "Agent Pipeline",
                ],
                "components": [
                    "DocumentStore (InMemory, Elasticsearch, Pinecone)",
                    "Retrievers (BM25, Embedding, Hybrid)",
                    "Generators (OpenAI, HuggingFace, Azure)",
                    "Readers (Extractive, Generative)",
                    "Preprocessors (Clean, Split)",
                ],
                "example": {
                    "indexing": "DocumentStore -> Preprocessor -> EmbeddingRetriever",
                    "rag": "Retriever -> PromptBuilder -> Generator",
                },
            }
            
        except ImportError:
            return {"error": "haystack-ai not installed. Run: pip install haystack-ai"}


def create_ai_frameworks_tool(tool_key: str) -> AIFrameworksL5Tool:
    return AIFrameworksL5Tool(tool_key)

AI_FRAMEWORKS_TOOL_KEYS = list(AI_FRAMEWORKS_TOOL_CONFIGS.keys())
