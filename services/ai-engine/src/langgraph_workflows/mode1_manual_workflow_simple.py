"""
Mode 1: Simple Manual Agent Selection Workflow

SIMPLIFIED FLOW:
1. Fetch agent from database (with system_prompt)
2. Retrieve RAG context
3. Execute with LangGraph
4. Return response

NO AgentOrchestrator, NO complex medical protocols!
"""

import structlog
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

# LangGraph imports
from langgraph.graph import StateGraph, END

# Internal imports
from langgraph_workflows.base_workflow import BaseWorkflow
from langgraph_workflows.state_schemas import (
    UnifiedWorkflowState,
    WorkflowMode,
    ExecutionStatus,
)
from langgraph_workflows.observability import trace_node

# Services
from services.unified_rag_service import UnifiedRAGService
from services.cache_manager import CacheManager
from services.supabase_client import SupabaseClient

logger = structlog.get_logger()


class Mode1ManualWorkflow(BaseWorkflow):
    """
    Mode 1: Simple Manual Agent Selection
    
    User selects agent → Fetch agent's system_prompt → Execute with RAG
    """
    
    def __init__(
        self,
        supabase_client: SupabaseClient,
        cache_manager: Optional[CacheManager] = None,
        rag_service: Optional[UnifiedRAGService] = None,
        **kwargs
    ):
        """Initialize Mode 1 workflow."""
        super().__init__(
            workflow_name="Mode1_Manual_Simple",
            mode=WorkflowMode.MODE_1_MANUAL,
            enable_checkpoints=True
        )
        
        # Core services
        self.supabase = supabase_client
        self.cache_manager = cache_manager or CacheManager()
        self.rag_service = rag_service or UnifiedRAGService(supabase_client)
        self.llm = None
        
        logger.info("✅ Mode1ManualWorkflow initialized (simple implementation)")
    
    def build_graph(self) -> StateGraph:
        """
        Build simple workflow graph.
        
        Flow:
        START → validate → fetch_agent → rag_retrieval → execute → format → END
        """
        graph = StateGraph(UnifiedWorkflowState)
        
        # Add nodes
        graph.add_node("validate_inputs", self.validate_inputs_node)
        graph.add_node("fetch_agent", self.fetch_agent_node)
        graph.add_node("rag_retrieval", self.rag_retrieval_node)
        graph.add_node("execute_agent", self.execute_agent_node)
        graph.add_node("format_output", self.format_output_node)
        
        # Define edges
        graph.set_entry_point("validate_inputs")
        graph.add_edge("validate_inputs", "fetch_agent")
        graph.add_edge("fetch_agent", "rag_retrieval")
        graph.add_edge("rag_retrieval", "execute_agent")
        graph.add_edge("execute_agent", "format_output")
        graph.add_edge("format_output", END)
        
        return graph
    
    # =========================================================================
    # WORKFLOW NODES
    # =========================================================================
    
    @trace_node("mode1_validate")
    async def validate_inputs_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Validate inputs."""
        tenant_id = state.get('tenant_id')
        query = state.get('query')
        selected_agents = state.get('selected_agents', [])
        
        if not tenant_id or not query or not selected_agents:
            logger.error("❌ Missing required inputs")
            return {
                **state,
                'validation_passed': False,
                'errors': ['Missing tenant_id, query, or selected_agents'],
                'current_node': 'validate'
            }
        
        logger.info("✅ Validation passed")
        
        return {
            **state,
            'validation_passed': True,
            'current_node': 'validate'
        }
    
    @trace_node("mode1_fetch_agent")
    async def fetch_agent_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Fetch agent from database with system_prompt."""
        agent_id = state.get('selected_agents', [None])[0]
        
        logger.info(f"📥 Fetching agent from database", agent_id=agent_id[:8] if agent_id else None)
        
        try:
            # Fetch agent from Supabase
            agent = await self.supabase.get_agent_by_id(agent_id)
            
            if not agent:
                logger.error("❌ Agent not found", agent_id=agent_id)
                return {
                    **state,
                    'agent_data': None,
                    'errors': state.get('errors', []) + [f"Agent {agent_id} not found"],
                    'current_node': 'fetch_agent'
                }
            
            logger.info(
                "✅ Agent fetched",
                agent_name=agent.get('name'),
                has_system_prompt=bool(agent.get('system_prompt'))
            )
            
            return {
                **state,
                'agent_data': agent,
                'current_node': 'fetch_agent'
            }
            
        except Exception as e:
            logger.error("❌ Failed to fetch agent", error=str(e))
            return {
                **state,
                'agent_data': None,
                'errors': state.get('errors', []) + [f"Failed to fetch agent: {str(e)}"],
                'current_node': 'fetch_agent'
            }
    
    @trace_node("mode1_rag")
    async def rag_retrieval_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Retrieve RAG context."""
        enable_rag = state.get('enable_rag', True)
        
        if not enable_rag:
            logger.info("⏭️ RAG disabled, skipping")
            return {
                **state,
                'retrieved_documents': [],
                'context_summary': '',
                'total_documents': 0,
                'current_node': 'rag_retrieval'
            }
        
        query = state.get('query', '')
        selected_rag_domains = state.get('selected_rag_domains', [])
        tenant_id = state.get('tenant_id')
        
        logger.info(
            "🔍 [Mode 1] Retrieving RAG context",
            query_length=len(query),
            domains=selected_rag_domains
        )
        
        try:
            # Retrieve from RAG service
            sources = await self.rag_service.hybrid_search(
                query=query,
                domain_ids=selected_rag_domains,
                tenant_id=str(tenant_id),
                max_results=10,
                similarity_threshold=0.3
            )
            
            # Build context summary
            context = self._build_context_summary(sources)
            
            logger.info(
                "✅ RAG retrieval completed",
                sources_count=len(sources),
                context_length=len(context)
            )
            
            return {
                **state,
                'retrieved_documents': sources,
                'context_summary': context,
                'total_documents': len(sources),
                'current_node': 'rag_retrieval'
            }
            
        except Exception as e:
            logger.error("❌ RAG retrieval failed", error=str(e))
            return {
                **state,
                'retrieved_documents': [],
                'context_summary': '',
                'total_documents': 0,
                'errors': state.get('errors', []) + [f"RAG failed: {str(e)}"],
                'current_node': 'rag_retrieval'
            }
    
    @trace_node("mode1_execute")
    async def execute_agent_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Execute agent with LangGraph using agent's system_prompt."""
        agent_data = state.get('agent_data')
        query = state.get('query', '')
        context_summary = state.get('context_summary', '')
        model = state.get('model', 'gpt-4')
        
        logger.info("🤖 [Mode 1] Executing agent with system prompt")
        
        try:
            # Get agent's system prompt
            system_prompt = agent_data.get('system_prompt', '')
            
            if not system_prompt:
                logger.warning("⚠️ No system_prompt found, using default")
                system_prompt = f"""You are {agent_data.get('name', 'an AI assistant')}.

{agent_data.get('description', '')}

CRITICAL: Always cite sources from the knowledge base using [Source 1], [Source 2] format."""
            
            # Build messages
            messages = []
            
            # Add system prompt
            messages.append(SystemMessage(content=system_prompt))
            
            # Add context if available
            if context_summary:
                user_message = f"""## Knowledge Base Context (MUST CITE):

{context_summary}

## User Question:
{query}

Remember: Cite sources as [Source 1], [Source 2] in your response!"""
            else:
                user_message = query
            
            messages.append(HumanMessage(content=user_message))
            
            # Initialize LLM if needed
            if not self.llm:
                from core.config import get_settings
                settings = get_settings()
                self.llm = ChatOpenAI(
                    model=model,
                    temperature=agent_data.get('temperature', 0.7),
                    max_tokens=agent_data.get('max_tokens', 2000)
                )
            
            # Execute
            response = await self.llm.ainvoke(messages)
            
            logger.info(
                "✅ Agent executed",
                response_length=len(response.content)
            )
            
            return {
                **state,
                'agent_response': response.content,
                'response_confidence': 0.8,  # Default confidence
                'model_used': model,
                'current_node': 'execute_agent'
            }
            
        except Exception as e:
            logger.error("❌ Agent execution failed", error=str(e), exc_info=True)
            return {
                **state,
                'agent_response': '',
                'response_confidence': 0.0,
                'errors': state.get('errors', []) + [f"Execution failed: {str(e)}"],
                'current_node': 'execute_agent'
            }
    
    @trace_node("mode1_format")
    async def format_output_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Format final output."""
        agent_response = state.get('agent_response', '')
        confidence = state.get('response_confidence', 0.0)
        retrieved_documents = state.get('retrieved_documents', [])
        errors = state.get('errors', [])
        
        # Check for errors
        if not agent_response and errors:
            logger.warning("⚠️ No response, workflow failed", errors=errors)
            return {
                **state,
                'response': '',
                'sources': [],
                'status': ExecutionStatus.FAILED,
                'error': '; '.join(errors),
                'current_node': 'format_output'
            }
        
        # Format sources for frontend
        sources = []
        for idx, doc in enumerate(retrieved_documents[:10], 1):
            sources.append({
                'id': doc.get('id', f'source_{idx}'),
                'number': idx,
                'title': doc.get('title', f'Source {idx}'),
                'content': doc.get('content', '')[:500],
                'excerpt': doc.get('content', '')[:200],
                'url': doc.get('url', ''),
                'similarity': doc.get('similarity', 0.0),
                'domain': doc.get('domain', 'General'),
                'metadata': {
                    **doc.get('metadata', {}),
                    'year': doc.get('metadata', {}).get('year', 'N/A'),
                    'document_type': doc.get('metadata', {}).get('document_type', 'document')
                }
            })
        
        logger.info(
            "✅ [Mode 1] Workflow completed",
            response_length=len(agent_response),
            sources_count=len(sources),
            confidence=confidence
        )
        
        return {
            **state,
            'response': agent_response,
            'agent_response': agent_response,
            'confidence': confidence,
            'sources': sources,
            'citations': sources,
            'status': ExecutionStatus.COMPLETED,
            'current_node': 'format_output'
        }
    
    # =========================================================================
    # HELPER METHODS
    # =========================================================================
    
    def _build_context_summary(self, sources: List[Dict[str, Any]]) -> str:
        """Build context summary from RAG sources."""
        if not sources:
            return ""
        
        context_parts = []
        for i, source in enumerate(sources[:10], 1):
            metadata = source.get('metadata', {})
            context_parts.append(f"""
[Source {i}]
Title: {source.get('title', 'Unknown')}
Year: {metadata.get('year', 'N/A')}
Domain: {source.get('domain', 'General')}
Relevance: {source.get('similarity', 0.0):.2f}
Content: {source.get('content', '')[:1000]}...
""")
        
        return "\n".join(context_parts)

