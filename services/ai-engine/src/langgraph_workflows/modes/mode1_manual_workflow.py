"""
Mode 1: Manual Interactive Research Workflow

User explicitly confirms RAG and tools before execution.
Full transparency with reasoning steps visible.

Flow:
1. Load agent profile
2. RAG retrieval (with user confirmation option)
3. Tool suggestion (with user confirmation)
4. Tool execution (if approved)
5. LLM execution with structured citations
6. Save conversation

Inherits 80% of logic from BaseWorkflow.
Only implements mode-specific confirmation nodes.
"""

import structlog
from typing import Dict, Any, List, Optional
from datetime import datetime
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field

# LangGraph
from langgraph.graph import StateGraph, END

# Vital Shared
from vital_shared.workflows.base_workflow import BaseWorkflow
from vital_shared.models.citation import Citation
from vital_shared.models.workflow_state import Mode1State

logger = structlog.get_logger()


# ============================================================================
# STRUCTURED OUTPUT MODELS
# ============================================================================

class AgentResponseWithCitations(BaseModel):
    """
    Structured LLM response with inline citations.
    
    Format: "FDA requires validation [1] for SaMD devices [2,3]."
    """
    content: str = Field(
        description=(
            "Response with inline [1], [2], [3] citation markers. "
            "Place citations immediately after facts, not at sentence end."
        )
    )
    citations: List[Dict[str, Any]] = Field(
        description="List of cited sources, numbered 1-N",
        default_factory=list
    )
    reasoning_steps: List[str] = Field(
        description="Step-by-step reasoning process",
        default_factory=list
    )


# ============================================================================
# MODE 1 WORKFLOW
# ============================================================================

class Mode1ManualWorkflow(BaseWorkflow):
    """
    Mode 1: Manual Interactive Research
    
    Features:
    - User confirms RAG retrieval
    - User confirms tool execution
    - Full reasoning transparency
    - Inline citations [1], [2], [3]
    
    Inherits from BaseWorkflow:
    - load_agent_node
    - rag_retrieval_node
    - tool_suggestion_node
    - tool_execution_node
    - save_conversation_node
    """
    
    def __init__(
        self,
        workflow_name: str = "Mode1_Manual_Interactive",
        mode: int = 1,
        **kwargs
    ):
        """Initialize Mode 1 workflow."""
        super().__init__(
            workflow_name=workflow_name,
            mode=mode,
            **kwargs
        )
        
        # LLM for final response generation
        self.llm = None
        
        self.logger.info("mode1_workflow_initialized")
    
    def build_graph(self) -> StateGraph:
        """
        Build Mode 1 workflow graph.
        
        Flow:
        START → load_agent → rag_retrieval 
              → [confirm_rag] → tool_suggestion 
              → [confirm_tools] → tool_execution 
              → execute_llm → save_conversation → END
        """
        graph = StateGraph(Dict[str, Any])  # Use Dict for LangGraph compatibility
        
        # ===== Shared Nodes (from BaseWorkflow) =====
        graph.add_node("load_agent", self.load_agent_node)
        graph.add_node("rag_retrieval", self.rag_retrieval_node)
        graph.add_node("tool_suggestion", self.tool_suggestion_node)
        graph.add_node("tool_execution", self.tool_execution_node)
        graph.add_node("save_conversation", self.save_conversation_node)
        
        # ===== Mode 1 Specific Nodes =====
        graph.add_node("execute_llm", self.execute_llm_node)
        
        # ===== Define Flow =====
        graph.set_entry_point("load_agent")
        graph.add_edge("load_agent", "rag_retrieval")
        
        # After RAG, check if tools needed
        graph.add_conditional_edges(
            "rag_retrieval",
            self.should_suggest_tools,
            {
                "suggest_tools": "tool_suggestion",
                "skip_tools": "execute_llm"
            }
        )
        
        # After tool suggestion, check if approved
        graph.add_conditional_edges(
            "tool_suggestion",
            self.tools_confirmed,
            {
                "execute": "tool_execution",
                "skip": "execute_llm"
            }
        )
        
        # After tool execution, go to LLM
        graph.add_edge("tool_execution", "execute_llm")
        
        # After LLM, save and end
        graph.add_edge("execute_llm", "save_conversation")
        graph.add_edge("save_conversation", END)
        
        self.logger.info("mode1_graph_built")
        
        return graph
    
    # =========================================================================
    # MODE 1 SPECIFIC NODES
    # =========================================================================
    
    async def execute_llm_node(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Mode 1 Node: Execute LLM with structured citations.
        
        Uses RAG sources and tool results to generate response.
        """
        try:
            self.logger.info("llm_execution_started")
            
            # Get context
            query = state["query"]
            agent_system_prompt = state.get("agent_system_prompt", "")
            rag_citations = state.get("rag_citations", [])
            tool_results = state.get("tool_results", [])
            
            # Initialize LLM if needed
            if not self.llm:
                model = state.get("metadata", {}).get("agent_model", "gpt-4-turbo-preview")
                temperature = state.get("metadata", {}).get("agent_temperature", 0.7)
                self.llm = ChatOpenAI(
                    model=model,
                    temperature=temperature,
                    model_kwargs={"response_format": {"type": "json_object"}}
                )
            
            # Build context from RAG
            rag_context = ""
            if rag_citations:
                rag_context = "Retrieved Sources:\n"
                for i, citation in enumerate(rag_citations, 1):
                    rag_context += f"[{i}] {citation.get('title', 'Unknown')}\n"
                    if citation.get('excerpt'):
                        rag_context += f"   {citation['excerpt']}\n"
            
            # Build context from tools
            tool_context = ""
            if tool_results:
                tool_context = "\nTool Results:\n"
                for result in tool_results:
                    tool_context += f"- {result.get('tool_name', 'Unknown')}: {result.get('result', 'N/A')}\n"
            
            # Build system message
            system_message = f"""{agent_system_prompt}

{rag_context}

{tool_context}

CRITICAL INSTRUCTIONS:
1. Respond in JSON format with keys: "content", "citations", "reasoning_steps"
2. Use inline citations [1], [2], [3] IMMEDIATELY after facts
3. Include reasoning_steps array showing your thought process
4. Citations must reference the sources provided above
"""
            
            # Execute LLM
            messages = [
                SystemMessage(content=system_message),
                HumanMessage(content=query)
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # Parse response
            import json
            try:
                parsed = json.loads(response.content)
                content = parsed.get("content", response.content)
                reasoning_steps = parsed.get("reasoning_steps", [])
            except:
                content = response.content
                reasoning_steps = []
            
            # Calculate cost (approximate)
            input_tokens = len(system_message) // 4 + len(query) // 4
            output_tokens = len(content) // 4
            cost = (input_tokens * 0.00001) + (output_tokens * 0.00003)  # GPT-4 Turbo pricing
            
            self.logger.info(
                "llm_execution_completed",
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                cost_usd=cost
            )
            
            return {
                **state,
                "response": content,
                "reasoning_steps": reasoning_steps,
                "total_cost_usd": cost,
                "metadata": {
                    **state.get("metadata", {}),
                    "llm_executed": True,
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens
                }
            }
            
        except Exception as e:
            self.logger.error("llm_execution_failed", error=str(e))
            return {
                **state,
                "error": f"LLM execution failed: {str(e)}",
                "error_code": "LLM_EXECUTION_ERROR"
            }
    
    # =========================================================================
    # CONDITIONAL EDGE FUNCTIONS
    # =========================================================================
    
    def should_suggest_tools(self, state: Dict[str, Any]) -> str:
        """
        Conditional: Should we suggest tools?
        
        Returns:
            "suggest_tools" or "skip_tools"
        """
        enable_tools = state.get("enable_tools", True)
        has_sources = state.get("rag_total_sources", 0) > 0
        
        # Only suggest tools if enabled and we have some sources
        if enable_tools and has_sources:
            return "suggest_tools"
        else:
            return "skip_tools"
    
    def tools_confirmed(self, state: Dict[str, Any]) -> str:
        """
        Conditional: Are tools confirmed for execution?
        
        In Mode 1, user must explicitly approve tools.
        Frontend sends confirmed_tools in state.
        
        Returns:
            "execute" or "skip"
        """
        confirmed_tools = state.get("confirmed_tools", [])
        
        if confirmed_tools and len(confirmed_tools) > 0:
            return "execute"
        else:
            return "skip"


# ============================================================================
# FACTORY FUNCTION
# ============================================================================

def create_mode1_workflow(
    agent_service,
    rag_service,
    tool_service,
    memory_service,
    streaming_service
) -> Mode1ManualWorkflow:
    """
    Factory function to create Mode 1 workflow with injected services.
    
    Usage:
        workflow = create_mode1_workflow(
            agent_service=ServiceRegistry.get_agent_service(),
            rag_service=ServiceRegistry.get_rag_service(),
            # ...
        )
    """
    return Mode1ManualWorkflow(
        agent_service=agent_service,
        rag_service=rag_service,
        tool_service=tool_service,
        memory_service=memory_service,
        streaming_service=streaming_service
    )

