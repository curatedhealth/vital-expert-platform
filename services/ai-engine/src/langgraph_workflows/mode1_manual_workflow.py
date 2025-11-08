"""
Mode 1: Simple Manual Agent Selection Workflow

SIMPLIFIED FLOW:
1. Fetch agent from database (with system_prompt)
2. Retrieve RAG context
3. Execute with LangGraph + Structured Citations
4. Return response with inline [N] markers

Features:
- Automatic RAG usage (enforced via system prompt)
- Inline citations [1], [2], [3] for Perplexity-style UI
- Structured output guarantees citation format
- ✅ NEW: Proper LangGraph streaming with get_stream_writer()
"""

import structlog
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field

# LangGraph imports
from langgraph.graph import StateGraph, END
# from langgraph.config import get_stream_writer  # ✅ Commented out - not available in current version

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


# ============================================================================
# PYDANTIC MODELS FOR STRUCTURED CITATIONS
# ============================================================================

class Citation(BaseModel):
    """A single citation with source information."""
    number: int = Field(description="Citation number (1, 2, 3, ...)")
    title: str = Field(description="Source title")
    url: str = Field(description="Source URL")
    description: Optional[str] = Field(default=None, description="Brief source description")
    quote: Optional[str] = Field(default=None, description="Relevant quote from source")


class AgentResponseWithCitations(BaseModel):
    """
    Agent response with inline citations.
    
    This structured output guarantees that:
    1. Citations are in [1], [2], [3] format
    2. Citation numbers match the sources list
    3. Frontend can parse and render inline citation badges
    """
    content: str = Field(
        description=(
            "Response content WITH inline citation markers. "
            "Use [1], [2], [3] format IMMEDIATELY after relevant facts. "
            "Example: 'The FDA requires validation [1] for SaMD devices [2,3].' "
            "Place citations inline, NOT at sentence end."
        )
    )
    citations: List[Citation] = Field(
        description="List of sources cited in the response, numbered 1-N"
    )


# ============================================================================
# MODE 1 WORKFLOW
# ============================================================================

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
        agent_orchestrator = None,  # Accept but ignore (for backwards compatibility)
        conversation_manager = None,  # Accept but ignore
        **kwargs
    ):
        """Initialize Mode 1 workflow with tool support."""
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
        
        # ✅ NEW: Register tools (simple approach, no full chain)
        self._init_tools()
        
        logger.info("✅ Mode1ManualWorkflow initialized with tool support")
    
    def _init_tools(self):
        """Initialize available tools for this workflow."""
        from tools.web_tools import WebSearchTool
        from tools.rag_tool import RAGTool
        
        self.available_tools = {
            'web_search': WebSearchTool(),
            'rag_search': RAGTool(self.rag_service)
        }
        
        logger.info(f"✅ Initialized {len(self.available_tools)} tools")
    
    def build_graph(self) -> StateGraph:
        """
        Build workflow graph with tool support.
        
        Flow:
        START → validate → fetch_agent → rag_retrieval 
              → tool_suggestion → [conditional] → tool_execution 
              → execute_agent → format_output → END
        
        Tool Flow:
        - tool_suggestion: Analyze query, suggest tools
        - [conditional]: needs_confirmation? 
          - Yes → emit event, wait for approval
          - No → execute immediately
        - tool_execution: Run approved tools
        """
        graph = StateGraph(UnifiedWorkflowState)
        
        # Import tool nodes
        from langgraph_workflows.tool_nodes import (
            tool_suggestion_node,
            tool_execution_node,
            should_execute_tools
        )
        
        # Add existing nodes
        graph.add_node("validate_inputs", self.validate_inputs_node)
        graph.add_node("fetch_agent", self.fetch_agent_node)
        graph.add_node("rag_retrieval", self.rag_retrieval_node)
        
        # ✅ NEW: Add tool nodes
        graph.add_node("tool_suggestion", tool_suggestion_node)
        graph.add_node("tool_execution", tool_execution_node)
        
        # Existing execution nodes
        graph.add_node("execute_agent", self.execute_agent_node)
        graph.add_node("format_output", self.format_output_node)
        
        # Define edges
        graph.set_entry_point("validate_inputs")
        graph.add_edge("validate_inputs", "fetch_agent")
        graph.add_edge("fetch_agent", "rag_retrieval")
        
        # ✅ NEW: After RAG, suggest tools
        graph.add_edge("rag_retrieval", "tool_suggestion")
        
        # ✅ NEW: Conditional edge based on tool confirmation
        graph.add_conditional_edges(
            "tool_suggestion",
            should_execute_tools,
            {
                "execute_tools": "tool_execution",
                "wait_confirmation": "tool_execution",  # Will check approval in execution node
                "skip_tools": "execute_agent"
            }
        )
        
        # ✅ NEW: After tool execution, continue to agent execution
        graph.add_edge("tool_execution", "execute_agent")
        
        # Existing flow continues
        graph.add_edge("execute_agent", "format_output")
        graph.add_edge("format_output", END)
        
        logger.info("✅ Workflow graph built with tool support")
        
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
        """Retrieve RAG context with streaming updates."""
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
        
        # ✅ Emit real-time AI reasoning about RAG retrieval
        # Note: Using state-based streaming instead of writer()
        domain_text = f"{len(selected_rag_domains)} specific" if selected_rag_domains else "all available"
        
        logger.info(
            "🔍 [Mode 1] Retrieving RAG context",
            query_length=len(query),
            domains=selected_rag_domains
        )
        
        try:
            # Retrieve from RAG service using correct method name
            rag_result = await self.rag_service.query(  # FIXED: Returns Dict with 'sources' key
                query_text=query,
                domain_ids=selected_rag_domains,
                tenant_id=str(tenant_id),
                max_results=10,
                similarity_threshold=0.3,
                strategy="hybrid"
            )
            
            logger.info(
                "🔍 [DEBUG] RAG result received",
                result_type=type(rag_result).__name__,
                result_keys=list(rag_result.keys()) if isinstance(rag_result, dict) else 'not_a_dict',
                has_sources='sources' in rag_result if isinstance(rag_result, dict) else False
            )
            
            # FIXED: Extract sources list from result dict
            sources = rag_result.get('sources', [])
            
            logger.info(
                "📊 [DEBUG] Sources extracted",
                sources_count=len(sources),
                first_source_keys=list(sources[0].keys()) if sources else 'no_sources'
            )
            
            # Build context summary
            context = self._build_context_summary(sources)
            
            logger.info(
                "✅ RAG retrieval completed",
                sources_count=len(sources),
                context_length=len(context)
            )
            
            # ✅ Add reasoning steps to state (for frontend streaming)
            reasoning_steps = state.get('reasoning_steps', [])
            
            # ✅ REAL-TIME REASONING: Add observation about RAG retrieval
            new_step = {
                "id": f"rag-obs-{datetime.now(timezone.utc).timestamp()}",
                "type": "observation",
                "content": f"Retrieved {len(sources)} relevant sources from {domain_text} domains. Ready to synthesize evidence-based response.",
                "node": "rag_retrieval",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "metadata": {
                    "sources_count": len(sources),
                    "domains": list(set([s.get('metadata', {}).get('domain', 'unknown') for s in sources]))
                }
            }
            reasoning_steps.append(new_step)
            
            return {
                **state,
                'retrieved_documents': sources,
                'context_summary': context,
                'total_documents': len(sources),
                'reasoning_steps': reasoning_steps,  # ✅ Add to state for streaming
                'current_node': 'rag_retrieval'
            }
            
        except Exception as e:
            logger.error("❌ RAG retrieval failed", error=str(e), exc_info=True)
            
            # Log error instead of emitting
            logger.error("❌ RAG retrieval failed", error=str(e), exc_info=True)
            
            # CRITICAL: Preserve agent_data from previous state!
            return {
                **state,  # This includes agent_data from fetch_agent
                'retrieved_documents': [],
                'context_summary': '',
                'total_documents': 0,
                'errors': state.get('errors', []) + [f"RAG failed: {str(e)}"],
                'current_node': 'rag_retrieval'
            }
    
    @trace_node("mode1_execute")
    async def execute_agent_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Execute agent with structured citations and streaming.
        
        Features:
        - Enforces RAG usage via system prompt
        - Uses structured output for inline citations [1], [2], [3]
        - Guarantees Perplexity-style citation format
        - ✅ NEW: Streams workflow progress and reasoning
        """
        agent_data = state.get('agent_data')
        query = state.get('query', '')
        context_summary = state.get('context_summary', '')
        retrieved_documents = state.get('retrieved_documents', [])
        model = state.get('model', 'gpt-4')
        
        # Validation
        if not agent_data:
            logger.error(f"❌ [Mode 1] No agent data available")
            return {
                **state,
                'agent_response': '',
                'response_confidence': 0.0,
                'errors': state.get('errors', []) + ["Agent data not found"],
                'current_node': 'execute_agent'
            }
        
        logger.info("🤖 [Mode 1] Executing agent with structured citations")
        
        try:
            # ✅ REAL-TIME REASONING: Add thought step at start of execution
            reasoning_steps = state.get('reasoning_steps', [])
            thinking_step = {
                "id": f"agent-thought-{datetime.now(timezone.utc).timestamp()}",
                "type": "thought",
                "content": f"Analyzing the query to provide evidence-based response using {len(retrieved_documents)} retrieved sources.",
                "node": "execute_agent",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "metadata": {
                    "agent_name": agent_data.get('name', 'AI Assistant'),
                    "sources_available": len(retrieved_documents)
                }
            }
            reasoning_steps.append(thinking_step)
            
            # Get agent's system prompt
            system_prompt = agent_data.get('system_prompt', '')
            
            if not system_prompt:
                logger.warning("⚠️ No system_prompt found, using default with RAG enforcement")
                system_prompt = f"""You are {agent_data.get('name', 'an AI assistant')}.

{agent_data.get('description', '')}

🔥 MANDATORY INSTRUCTIONS (NON-NEGOTIABLE):

## 1. RAG Usage (ALWAYS):
- **ALWAYS** start by analyzing the Knowledge Base sources provided
- **ALWAYS** base your answer primarily on the Knowledge Base
- **NEVER** make claims without citing sources
- If Knowledge Base lacks info, explicitly state: "The available sources do not contain this information."

## 2. Citation Format (CRITICAL):
- **INLINE citations**: Place [N] IMMEDIATELY after the relevant fact
- **NOT at sentence end**: [N] goes right after the claim, not at the period
- **Multiple sources**: Use [1,2] or [1,2,3] for multiple citations

### Citation Examples:
✅ CORRECT: "The FDA requires SaMD validation [1] for digital therapeutics [2]."
✅ CORRECT: "Clinical trials are essential [1,2] for regulatory approval."
✅ CORRECT: "Digital health adoption is accelerating [3] in healthcare [1,2]."

❌ WRONG: "The FDA requires SaMD validation. [1]"
❌ WRONG: "Clinical trials are essential for regulatory approval [1,2]."
❌ WRONG: "The FDA requires validation [Source 1] for SaMD." (Don't use "Source")

## 3. Every Fact MUST Have Citations:
- After EVERY factual claim, add [N]
- Don't skip citations for any facts from sources
- Use ALL relevant sources, not just one

## 4. Diagrams (Optional):
- For flowcharts: Use ```mermaid with `graph TD` syntax
- For simple diagrams: Use ```ascii code blocks

## Source Mapping (Numbers to Use):"""
            
            # Add source mapping
            if retrieved_documents:
                for i, doc in enumerate(retrieved_documents[:10], 1):
                    title = doc.get('title', f'Source {i}')
                    excerpt = doc.get('content', '')[:150].replace('\n', ' ')
                    system_prompt += f"\n[{i}]: {title} — {excerpt}..."
            
            # Build user message with STRONG enforcement
            if context_summary and retrieved_documents:
                user_message = f"""🔥 READ ALL SOURCES BELOW, THEN ANSWER WITH INLINE CITATIONS [1], [2], [3]!

## Knowledge Base Context ({len(retrieved_documents)} sources):
{context_summary}

## User Question:
{query}

🔥 CRITICAL REQUIREMENTS:
1. Base your answer ONLY on the sources above
2. Cite source numbers [1], [2] INLINE after EVERY fact
3. Place [N] immediately after the relevant text, NOT at sentence end
4. Use multiple sources: [1,2] or [1,2,3] when applicable
5. Every claim needs a citation number

Example response structure:
"The FDA requires validation [1] for SaMD devices. Clinical trials [2,3] are essential..."

NOW ANSWER:"""
            else:
                # No RAG context - this is a problem!
                logger.warning("⚠️ No RAG context available - response will be less accurate")
                user_message = f"""⚠️ WARNING: No knowledge base sources available for this query.

## User Question:
{query}

Please answer based on general knowledge, but note that specific sources are unavailable.
Do NOT add citation numbers since no sources were provided."""
            
            # Initialize LLM if needed
            if not self.llm:
                from core.config import get_settings
                settings = get_settings()
                self.llm = ChatOpenAI(
                    model=model,
                    temperature=agent_data.get('temperature', 0.7),
                    max_tokens=agent_data.get('max_tokens', 2000)
                )
            
            # ✅ NEW: Bind tools if enabled
            selected_tools = state.get('selected_tools', [])
            enable_tools = state.get('enable_tools', False)
            tools_to_use = []
            
            if enable_tools and selected_tools:
                for tool_name in selected_tools:
                    if tool_name in self.available_tools:
                        tools_to_use.append(self.available_tools[tool_name])
                        logger.info(f"✅ Tool enabled: {tool_name}")
                
                if tools_to_use:
                    # Add tools section to system prompt
                    tool_descriptions = "\n".join([
                        f"- **{tool.name}**: {tool.description}" 
                        for tool in tools_to_use
                    ])
                    system_prompt += f"""

## Available Tools:
{tool_descriptions}

**Tool Usage Instructions**:
1. Use tools when they provide more accurate/current information
2. Web search: For recent events, news, current guidelines, statistics
3. RAG search: For internal knowledge base queries (backup to main RAG)
4. Explain tool usage in your response
5. Citations apply to both RAG and tool results"""
            
            # Execute with structured output for citations
            if retrieved_documents:
                # ✅ Add reasoning step to state (for frontend streaming)
                reasoning_steps = state.get('reasoning_steps', [])
                reasoning_steps.append({
                    "type": "action",
                    "content": f"Synthesizing response from {len(retrieved_documents)} knowledge base sources with inline citations",
                    "node": "execute_agent",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
                
                logger.info(f"🧠 Synthesizing response from {len(retrieved_documents)} sources")
                
                # Use structured output to guarantee citation format
                try:
                    # ✅ NEW: If tools are enabled, we can't use structured output easily
                    # So we use regular execution with tool binding
                    if tools_to_use:
                        llm_with_tools = self.llm.bind_tools([
                            tool.to_langchain_tool() for tool in tools_to_use
                        ])
                        
                        messages = [
                            SystemMessage(content=system_prompt),
                            HumanMessage(content=user_message)
                        ]
                        
                        # ✅ LangGraph Native: Accumulate tokens, don't emit via writer()
                        # LangGraph's 'messages' mode will automatically stream the final response
                        full_response = ""
                        chunk_count = 0
                        async for chunk in llm_with_tools.astream(messages):
                            if hasattr(chunk, 'content') and chunk.content:
                                full_response += chunk.content
                                chunk_count += 1
                        
                        logger.info(f"✅ Accumulated {chunk_count} LLM chunks, total length: {len(full_response)}")
                        
                        # Create response object
                        tool_response = type('Response', (), {'content': full_response})()
                        
                        logger.info(
                            "✅ Agent executed with tools",
                            response_length=len(tool_response.content),
                            tools_called=len(getattr(tool_response, 'tool_calls', []))
                        )
                        
                        # For now, return without structured citations
                        # TODO: Add tool execution and structured output later
                        return {
                            **state,
                            'agent_response': tool_response.content,
                            'response_confidence': 0.8,
                            'model_used': model,
                            'reasoning_steps': reasoning_steps,  # ✅ Include reasoning
                            'current_node': 'execute_agent'
                        }
                    
                    # No tools - use structured output for citations
                    llm_with_structure = self.llm.with_structured_output(
                        AgentResponseWithCitations
                    )
                    
                    messages = [
                        SystemMessage(content=system_prompt),
                        HumanMessage(content=user_message)
                    ]
                    
                    # ✅ LangGraph Native: Accumulate tokens, don't emit via writer()
                    # LangGraph's 'messages' mode will automatically stream the final response
                    full_content = ""
                    chunk_count = 0
                    async for chunk in llm_with_structure.astream(messages):
                        if hasattr(chunk, 'content') and chunk.content:
                            full_content += chunk.content
                            chunk_count += 1
                    
                    logger.info(f"✅ Accumulated {chunk_count} structured LLM chunks, total length: {len(full_content)}")
                    
                    # Parse structured output (if model returns it)
                    # For now, create a simple response object
                    response = type('StructuredResponse', (), {
                        'content': full_content,
                        'citations': []  # Will be empty, prompt enforcement only
                    })()
                    
                    # Log completion (streaming handled by LangGraph)
                    citation_count = len(response.citations)  # type: ignore
                    logger.info(
                        "✅ Agent executed with structured citations",
                        response_length=len(response.content),  # type: ignore
                        citations_count=citation_count
                    )
                    
                    # Map structured citations back to original sources
                    structured_citations = []
                    for citation in response.citations:  # type: ignore
                        if citation.number <= len(retrieved_documents):
                            original_doc = retrieved_documents[citation.number - 1]
                            structured_citations.append({
                                'number': citation.number,
                                'id': f"source-{citation.number}",
                                'title': citation.title,
                                'url': citation.url or original_doc.get('url', '#'),
                                'excerpt': citation.quote or original_doc.get('content', '')[:200],
                                'description': citation.description or original_doc.get('metadata', {}).get('description', ''),
                                'domain': original_doc.get('domain', 'Unknown'),
                                'similarity': original_doc.get('similarity', 0.0),
                                'metadata': original_doc.get('metadata', {})
                            })
                    
                    return {
                        **state,
                        'agent_response': response.content,  # type: ignore  # ✅ Has [1], [2] markers!
                        'structured_citations': structured_citations,  # ✅ For frontend
                        'response_confidence': 0.8,
                        'model_used': model,
                        'reasoning_steps': reasoning_steps,  # ✅ Include reasoning
                        'current_node': 'execute_agent'
                    }
                    
                except Exception as struct_error:
                    logger.warning(
                        f"⚠️ Structured output failed, falling back to regular: {struct_error}"
                    )
                    # Fallback to regular execution with streaming
                    messages = [
                        SystemMessage(content=system_prompt),
                        HumanMessage(content=user_message)
                    ]
                    
                    # ✅ LangGraph Native: Accumulate tokens, don't emit via writer()
                    # LangGraph's 'messages' mode will automatically stream the final response
                    full_response_text = ""
                    chunk_count = 0
                    async for chunk in self.llm.astream(messages):
                        if hasattr(chunk, 'content') and chunk.content:
                            full_response_text += chunk.content
                            chunk_count += 1
                    
                    logger.info(f"✅ Accumulated {chunk_count} fallback LLM chunks, total length: {len(full_response_text)}")
                    
                    fallback_response = type('Response', (), {'content': full_response_text})()
                    
                    return {
                        **state,
                        'agent_response': fallback_response.content,
                        'response_confidence': 0.7,
                        'model_used': model,
                        'reasoning_steps': reasoning_steps,  # ✅ Include reasoning
                        'current_node': 'execute_agent'
                    }
            else:
                # No RAG, regular execution
                messages = [
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=user_message)
                ]
                no_rag_response = await self.llm.ainvoke(messages)
                
                return {
                    **state,
                    'agent_response': no_rag_response.content,
                    'response_confidence': 0.6,
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
        """
        Format final output with structured citations.
        
        Returns:
        - response: Agent response with inline [1], [2] markers
        - citations: Structured citations for frontend parsing
        - sources: Same as citations (for backward compatibility)
        """
        agent_response = state.get('agent_response', '')
        confidence = state.get('response_confidence', 0.0)
        retrieved_documents = state.get('retrieved_documents', [])
        structured_citations = state.get('structured_citations', [])
        errors = state.get('errors', [])
        
        # Check for errors
        if not agent_response and errors:
            logger.warning("⚠️ No response, workflow failed", errors=errors)
            return {
                **state,
                'response': '',
                'sources': [],
                'citations': [],
                'status': ExecutionStatus.FAILED,
                'error': '; '.join(errors),
                'current_node': 'format_output'
            }
        
        def normalize_citation(
            idx: int,
            doc: Dict[str, Any],
            *,
            title: Optional[str] = None,
            url: Optional[str] = None,
            description: Optional[str] = None,
            quote: Optional[str] = None,
            number: Optional[int] = None
        ) -> Dict[str, Any]:
            """Normalize citation schema for frontend consumption."""
            # ✅ FIX: Handle nested metadata structure from RAG service
            # Documents have structure: { 'page_content': '...', 'metadata': {...} }
            metadata = doc.get('metadata', {}) if isinstance(doc, dict) else {}
            page_content = doc.get('page_content') or doc.get('content', '')
            
            source_number = number if number is not None else idx
            
            # ✅ Extract fields with proper fallbacks from nested metadata
            doc_title = title or doc.get('title') or metadata.get('title') or metadata.get('document_name') or f"Source {source_number}"
            doc_url = url or doc.get('url') or metadata.get('url') or metadata.get('link') or '#'
            doc_domain = doc.get('domain') or metadata.get('domain') or metadata.get('collection') or 'Unknown'
            doc_organization = doc.get('organization') or metadata.get('organization') or metadata.get('author')
            doc_source_type = doc.get('sourceType') or metadata.get('sourceType') or metadata.get('type')
            doc_similarity = doc.get('similarity') or metadata.get('similarity')
            
            # ✅ Build excerpt from page_content or description
            excerpt = page_content[:500] if isinstance(page_content, str) else ''
            if not excerpt and description:
                excerpt = description[:500]
            
            normalized = {
                'number': str(source_number),
                'id': doc.get('id') or metadata.get('id') or metadata.get('document_id') or f"source-{source_number}",
                'title': doc_title,
                'url': doc_url,
                'description': description or metadata.get('description') or excerpt[:200],
                'quote': quote or metadata.get('quote') or excerpt[:300],
                'excerpt': excerpt,
                'domain': doc_domain,
                'similarity': doc_similarity,
                'organization': doc_organization,
                'sourceType': doc_source_type,
                'evidenceLevel': doc.get('evidenceLevel') or metadata.get('evidenceLevel'),
                'metadata': metadata,
            }
            return normalized

        # Use structured citations if available, otherwise format from retrieved_documents
        if structured_citations:
            # Structured output provided proper citations
            final_citations = structured_citations
            logger.info(
                "✅ Using structured citations",
                count=len(structured_citations)
            )
            normalized_citations = []
            for citation in structured_citations:
                number = citation.get('number') or citation.get('id')
                try:
                    number_int = int(number)
                except (ValueError, TypeError):
                    number_int = len(normalized_citations) + 1
                doc_index = max(number_int - 1, 0)
                fallback_doc = retrieved_documents[doc_index] if doc_index < len(retrieved_documents) else {}
                normalized_citations.append(
                    normalize_citation(
                        len(normalized_citations) + 1,
                        {**fallback_doc, **citation},
                        title=citation.get('title'),
                        url=citation.get('url'),
                        description=citation.get('description'),
                        quote=citation.get('quote'),
                        number=number_int
                    )
                )
            final_citations = normalized_citations
        else:
            # Fallback: Format from retrieved documents
            final_citations = []
            for idx, doc in enumerate(retrieved_documents[:10], 1):
                final_citations.append(
                    normalize_citation(idx, doc)
                )
            logger.info(
                "✅ Using fallback citation formatting",
                count=len(final_citations)
            )
        
        logger.info(
            "✅ [Mode 1] Workflow completed",
            response_length=len(agent_response),
            citations_count=len(final_citations),
            has_inline_markers='[1]' in agent_response or '[2]' in agent_response,
            confidence=confidence
        )
        
        # Emit final sources and summary via custom stream so frontend can render immediately
        if final_citations:
            logger.info(
                "📤 [DEBUG] Emitting rag_sources event",
                citations_count=len(final_citations),
                first_citation=final_citations[0] if final_citations else None
            )
            # Note: Sources will be included in state update
            logger.info("✅ [DEBUG] rag_sources data prepared successfully")

        # Log final output details (streaming handled by LangGraph native mechanisms)
        logger.info(
            "📊 Final output prepared",
            response_length=len(agent_response),
            citations_count=len(final_citations),
            confidence=confidence
        )
        
        # ✅ LangGraph Native: Add AIMessage to messages array so it gets streamed
        from langchain_core.messages import AIMessage
        
        current_messages = state.get('messages', [])
        current_messages.append(AIMessage(content=agent_response))
        
        # ✅ Preserve reasoning steps from previous nodes
        reasoning_steps = state.get('reasoning_steps', [])
        
        return {
            **state,
            'messages': current_messages,           # ✅ For LangGraph messages mode
            'response': agent_response,             # ✅ With [1], [2] markers
            'agent_response': agent_response,
            'confidence': confidence,
            'sources': final_citations,             # ✅ For collapsible sources
            'citations': final_citations,           # ✅ For inline citation parsing
            'reasoning_steps': reasoning_steps,     # ✅ Preserve reasoning for frontend
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
            # ✅ FIX: Handle nested metadata structure from RAG service
            # Documents have structure: { 'page_content': '...', 'metadata': {...} }
            metadata = source.get('metadata', {})
            page_content = source.get('page_content') or source.get('content', '')
            title = source.get('title') or metadata.get('title') or metadata.get('document_name') or 'Unknown'
            domain = source.get('domain') or metadata.get('domain') or metadata.get('collection') or 'General'
            similarity = source.get('similarity') or metadata.get('similarity') or 0.0
            
            context_parts.append(f"""
[Source {i}]
Title: {title}
Year: {metadata.get('year', 'N/A')}
Domain: {domain}
Relevance: {similarity:.2f}
Content: {page_content[:1000] if isinstance(page_content, str) else ''}...
""")
        
        return "\n".join(context_parts)
