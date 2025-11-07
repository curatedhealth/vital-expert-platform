"""
Mode 1: Manual Agent Selection Workflow (Clean Production Implementation)

This is a clean, minimal implementation focused on working correctly.
Features:
- User manually selects agent
- RAG retrieval from selected domains
- Tool execution (optional)
- Agent response generation
- Proper error handling

Flow:
1. Validate inputs
2. Retrieve RAG context (if enabled)
3. Execute agent with context
4. Format response
"""

import structlog
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

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
from services.agent_orchestrator import AgentOrchestrator
from services.cache_manager import CacheManager
from services.supabase_client import SupabaseClient

# Models
from models.requests import AgentQueryRequest

logger = structlog.get_logger()


class Mode1ManualWorkflow(BaseWorkflow):
    """
    Mode 1: Manual Agent Selection Workflow
    
    Clean, production-ready implementation.
    Focuses on core functionality: Validate → RAG → Execute → Format
    """
    
    def __init__(
        self,
        supabase_client: SupabaseClient,
        cache_manager: Optional[CacheManager] = None,
        rag_service: Optional[UnifiedRAGService] = None,
        agent_orchestrator: Optional[AgentOrchestrator] = None,
        **kwargs
    ):
        """Initialize Mode 1 workflow."""
        super().__init__(
            workflow_name="Mode1_Manual",
            mode=WorkflowMode.MODE_1_MANUAL,
            enable_checkpoints=True
        )
        
        # Core services
        self.supabase = supabase_client
        self.cache_manager = cache_manager or CacheManager()
        self.rag_service = rag_service or UnifiedRAGService(supabase_client)
        self.agent_orchestrator = agent_orchestrator or AgentOrchestrator()
        
        logger.info("✅ Mode1ManualWorkflow initialized (clean implementation)")
    
    def build_graph(self) -> StateGraph:
        """
        Build simple workflow graph.
        
        Flow:
        START → validate_inputs → rag_retrieval → execute_agent → format_output → END
        """
        graph = StateGraph(UnifiedWorkflowState)
        
        # Add nodes
        graph.add_node("validate_inputs", self.validate_inputs_node)
        graph.add_node("rag_retrieval", self.rag_retrieval_node)
        graph.add_node("execute_agent", self.execute_agent_node)
        graph.add_node("format_output", self.format_output_node)
        
        # Define linear flow
        graph.set_entry_point("validate_inputs")
        
        # Conditional: Skip RAG if disabled
        graph.add_conditional_edges(
            "validate_inputs",
            self.should_use_rag,
            {
                "use_rag": "rag_retrieval",
                "skip_rag": "execute_agent"
            }
        )
        
        graph.add_edge("rag_retrieval", "execute_agent")
        graph.add_edge("execute_agent", "format_output")
        graph.add_edge("format_output", END)
        
        return graph
    
    # =========================================================================
    # NODES
    # =========================================================================
    
    @trace_node("mode1_validate_inputs")
    async def validate_inputs_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Validate required inputs.
        
        Checks:
        - selected_agents exists and not empty
        - query exists
        - agent exists in database and is active
        """
        tenant_id = state.get('tenant_id')
        selected_agents = state.get('selected_agents', [])
        query = state.get('query', '')
        
        logger.info(
            "🔍 [Mode 1] Validating inputs",
            tenant_id=tenant_id[:8] if tenant_id else None,
            agents_count=len(selected_agents),
            query_length=len(query)
        )
        
        # Validation errors
        errors = []
        
        if not selected_agents or len(selected_agents) == 0:
            errors.append("No agent selected")
        
        if not query or len(query.strip()) == 0:
            errors.append("Empty query")
        
        # If basic validation fails, return early
        if errors:
            logger.error("❌ Validation failed", errors=errors)
            return {
                **state,
                'validation_errors': errors,
                'status': ExecutionStatus.FAILED,
                'current_node': 'validate_inputs'
            }
        
        # Validate agent exists and is active
        try:
            agent_id = selected_agents[0]
            
            # Query database (synchronous - no await)
            response = self.supabase.client.from_('agents').select('id, name, is_active').eq(
                'id', agent_id
            ).eq('is_active', True).execute()
            
            if not response.data or len(response.data) == 0:
                errors.append(f"Agent not found or inactive: {agent_id}")
                logger.error("❌ Agent not found", agent_id=agent_id)
                return {
                    **state,
                    'validation_errors': errors,
                    'status': ExecutionStatus.FAILED,
                    'current_node': 'validate_inputs'
                }
            
            agent_data = response.data[0]
            logger.info("✅ Agent validated", agent_id=agent_id, agent_name=agent_data.get('name'))
            
            return {
                **state,
                'validated_agent': agent_data,
                'validation_errors': [],
                'current_node': 'validate_inputs'
            }
            
        except Exception as e:
            logger.error("❌ Agent validation error", error=str(e))
            return {
                **state,
                'validation_errors': [f"Validation error: {str(e)}"],
                'status': ExecutionStatus.FAILED,
                'current_node': 'validate_inputs'
            }
    
    @trace_node("mode1_rag_retrieval")
    async def rag_retrieval_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Retrieve RAG context from selected domains.
        
        Uses UnifiedRAGService to query Pinecone and Supabase.
        """
        tenant_id = state.get('tenant_id')
        query = state.get('query', '')
        selected_domains = state.get('selected_rag_domains', [])
        agent_id = state.get('selected_agents', [None])[0]
        
        logger.info(
            "📚 [Mode 1] RAG retrieval",
            query_length=len(query),
            domains_count=len(selected_domains),
            domains=selected_domains
        )
        
        try:
            # Call RAG service
            rag_results = await self.rag_service.query(
                query_text=query,
                strategy="hybrid",  # Use hybrid search for best results
                domain_ids=selected_domains if selected_domains else None,
                max_results=10,
                similarity_threshold=0.7,
                agent_id=agent_id,
                tenant_id=tenant_id
            )
            
            # Extract sources
            sources = rag_results.get('sources', [])
            context = rag_results.get('context', '')
            
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
            # Don't fail the workflow, just continue without RAG
            return {
                **state,
                'retrieved_documents': [],
                'context_summary': '',
                'total_documents': 0,
                'errors': state.get('errors', []) + [f"RAG failed: {str(e)}"],
                'current_node': 'rag_retrieval'
            }
    
    @trace_node("mode1_execute_agent")
    async def execute_agent_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Execute agent with context.
        
        Calls AgentOrchestrator.process_query() to get agent response.
        """
        tenant_id = state.get('tenant_id')
        query = state.get('query', '')
        agent_id = state.get('selected_agents', [None])[0]
        context_summary = state.get('context_summary', '')
        model = state.get('model', 'gpt-4')
        
        logger.info(
            "🤖 [Mode 1] Executing agent",
            agent_id=agent_id[:8] if agent_id else None,
            query_length=len(query),
            has_context=bool(context_summary)
        )
        
        try:
            # Build full query with context
            full_query = query
            if context_summary:
                full_query = f"{query}\n\n=== Context from Knowledge Base ===\n{context_summary}"
            
            # Create agent request
            agent_request = AgentQueryRequest(
                agent_id=agent_id,
                agent_type='general',
                query=full_query,
                user_id=state.get('user_id'),
                organization_id=tenant_id,
                max_context_docs=0,  # Already retrieved via RAG
                similarity_threshold=0.7,
                include_citations=True,
                include_confidence_scores=True,
                response_format="detailed"
            )
            
            # Execute agent
            agent_response = await self.agent_orchestrator.process_query(agent_request)
            
            # Extract response data
            response_text = getattr(agent_response, 'response', '') or ''
            confidence = getattr(agent_response, 'confidence', 0.0) or 0.0
            citations = getattr(agent_response, 'citations', []) or []
            
            logger.info(
                "✅ Agent executed",
                response_length=len(response_text),
                confidence=confidence,
                citations_count=len(citations)
            )
            
            return {
                **state,
                'agent_response': response_text,
                'response_confidence': confidence,
                'citations': citations,
                'model_used': model,
                'current_node': 'execute_agent'
            }
            
        except Exception as e:
            logger.error("❌ Agent execution failed", error=str(e), exc_info=True)
            return {
                **state,
                'agent_response': '',
                'response_confidence': 0.0,
                'citations': [],
                'errors': state.get('errors', []) + [f"Agent execution failed: {str(e)}"],
                'current_node': 'execute_agent'
            }
    
    @trace_node("mode1_format_output")
    async def format_output_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Format final output for API response.
        
        Ensures all required fields are present.
        """
        agent_response = state.get('agent_response', '')
        confidence = state.get('response_confidence', 0.0)
        citations = state.get('citations', [])
        retrieved_documents = state.get('retrieved_documents', [])
        errors = state.get('errors', [])
        
        # If agent response is empty and we have errors, mark as failed
        if not agent_response and errors:
            logger.warning("⚠️ No agent response, workflow failed", errors=errors)
            return {
                **state,
                'response': '',
                'agent_response': '',
                'confidence': 0.0,
                'sources': [],
                'status': ExecutionStatus.FAILED,
                'error': '; '.join(errors),
                'current_node': 'format_output'
            }
        
        # Convert retrieved documents to sources format if no citations
        sources = citations
        if not sources and retrieved_documents:
            sources = []
            for idx, doc in enumerate(retrieved_documents[:10], 1):
                # Format sources for frontend display with proper fields
                sources.append({
                    'id': doc.get('id', f'source_{idx}'),
                    'number': idx,  # For [Source N] citation format
                    'title': doc.get('title', doc.get('source', f'Source {idx}')),
                    'content': doc.get('content', '')[:500],
                    'excerpt': doc.get('content', '')[:200],  # For hover preview in UI
                    'url': doc.get('url', ''),
                    'similarity': doc.get('similarity', 0.0),  # Renamed from similarity_score
                    'domain': doc.get('domain', doc.get('metadata', {}).get('domain', 'General')),
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
            'response_confidence': confidence,
            'citations': sources,
            'sources': sources,
            'status': ExecutionStatus.COMPLETED,
            'current_node': 'format_output'
        }
    
    # =========================================================================
    # CONDITIONAL EDGES
    # =========================================================================
    
    def should_use_rag(self, state: UnifiedWorkflowState) -> str:
        """Determine if RAG should be used."""
        enable_rag = state.get('enable_rag', True)
        
        if enable_rag:
            logger.info("🔀 Routing to RAG retrieval")
            return "use_rag"
        else:
            logger.info("🔀 Skipping RAG retrieval")
            return "skip_rag"
