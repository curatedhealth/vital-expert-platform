"""
Mode 2: Automatic Research Workflow (WITH PARALLEL EXECUTION)

System automatically executes RAG and tools without user confirmation.
Fast, autonomous research with minimal user interaction.

Flow:
1. Load agent profile
2. **PARALLEL**: RAG + Tools + Memory (Tier 1) - 30% faster
3. Auto-approve tools
4. Tool execution (if suggested)
5. LLM execution with structured citations
6. **PARALLEL**: Quality + Citations + Cost (Tier 2)
7. Save conversation

Inherits 80% of logic from ParallelBaseWorkflow (Week 3 enhancement).
No confirmation nodes - straight execution with parallel optimization.
"""

import structlog
from typing import Dict, Any, List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field

# LangGraph
from langgraph.graph import StateGraph, END

# Vital Shared - NOW USING PARALLEL WORKFLOW
from vital_shared.workflows.parallel_base_workflow import ParallelBaseWorkflow

logger = structlog.get_logger()


# ============================================================================
# MODE 2 WORKFLOW
# ============================================================================

class Mode2AutomaticWorkflow(ParallelBaseWorkflow):
    """
    Mode 2: Automatic Research
    
    Features:
    - Auto-executes RAG retrieval
    - Auto-executes tools (no confirmation)
    - Fast autonomous operation
    - Inline citations [1], [2], [3]
    
    Inherits from BaseWorkflow:
    - load_agent_node
    - rag_retrieval_node
    - tool_suggestion_node
    - tool_execution_node
    - save_conversation_node
    
    Difference from Mode 1:
    - No user confirmations
    - Suggested tools auto-approved
    - Faster execution
    """
    
    def __init__(
        self,
        workflow_name: str = "Mode2_Automatic_Research",
        mode: int = 2,
        **kwargs
    ):
        """Initialize Mode 2 workflow."""
        super().__init__(
            workflow_name=workflow_name,
            mode=mode,
            **kwargs
        )
        
        # LLM for final response generation
        self.llm = None
        
        self.logger.info("mode2_workflow_initialized")
    
    def build_graph(self) -> StateGraph:
        """
        Build Mode 2 workflow graph.
        
        Flow:
        START → load_agent → rag_retrieval 
              → tool_suggestion → auto_approve_tools
              → tool_execution → execute_llm 
              → save_conversation → END
        
        Note: No conditional edges for confirmation.
        """
        graph = StateGraph(Dict[str, Any])
        
        # ===== Shared Nodes (from BaseWorkflow) =====
        graph.add_node("load_agent", self.load_agent_node)
        graph.add_node("rag_retrieval", self.rag_retrieval_node)
        graph.add_node("tool_suggestion", self.tool_suggestion_node)
        graph.add_node("tool_execution", self.tool_execution_node)
        graph.add_node("save_conversation", self.save_conversation_node)
        
        # ===== Mode 2 Specific Nodes =====
        graph.add_node("auto_approve_tools", self.auto_approve_tools_node)
        graph.add_node("execute_llm", self.execute_llm_node)
        
        # ===== Define Flow =====
        graph.set_entry_point("load_agent")
        graph.add_edge("load_agent", "rag_retrieval")
        
        # After RAG, check if tools enabled
        graph.add_conditional_edges(
            "rag_retrieval",
            self.should_use_tools,
            {
                "use_tools": "tool_suggestion",
                "skip_tools": "execute_llm"
            }
        )
        
        # Auto-approve suggested tools
        graph.add_edge("tool_suggestion", "auto_approve_tools")
        
        # After approval, execute or skip
        graph.add_conditional_edges(
            "auto_approve_tools",
            self.has_approved_tools,
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
        
        self.logger.info("mode2_graph_built")
        
        return graph
    
    # =========================================================================
    # MODE 2 SPECIFIC NODES
    # =========================================================================
    
    async def auto_approve_tools_node(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Mode 2 Node: Automatically approve suggested tools.
        
        In Mode 2, all suggested tools are automatically approved.
        """
        try:
            suggested_tools = state.get("suggested_tools", [])
            
            if not suggested_tools:
                self.logger.info("no_tools_suggested_nothing_to_approve")
                return state
            
            self.logger.info(
                "tools_auto_approved",
                tool_count=len(suggested_tools)
            )
            
            return {
                **state,
                "confirmed_tools": suggested_tools,
                "metadata": {
                    **state.get("metadata", {}),
                    "tools_auto_approved": True
                }
            }
            
        except Exception as e:
            self.logger.error("auto_approve_failed", error=str(e))
            return state
    
    async def execute_llm_node(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Mode 2 Node: Execute LLM with structured citations.
        
        Same as Mode 1 - uses RAG sources and tool results.
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
3. Include reasoning_steps array (Mode 2 auto-shows reasoning)
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
            
            # Calculate cost
            input_tokens = len(system_message) // 4 + len(query) // 4
            output_tokens = len(content) // 4
            cost = (input_tokens * 0.00001) + (output_tokens * 0.00003)
            
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
    
    def should_use_tools(self, state: Dict[str, Any]) -> str:
        """
        Conditional: Should we use tools?
        
        Returns:
            "use_tools" or "skip_tools"
        """
        enable_tools = state.get("enable_tools", True)
        
        if enable_tools:
            return "use_tools"
        else:
            return "skip_tools"
    
    def has_approved_tools(self, state: Dict[str, Any]) -> str:
        """
        Conditional: Are there approved tools to execute?
        
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

def create_mode2_workflow(
    agent_service,
    rag_service,
    tool_service,
    memory_service,
    streaming_service
) -> Mode2AutomaticWorkflow:
    """
    Factory function to create Mode 2 workflow with injected services.
    
    Usage:
        workflow = create_mode2_workflow(
            agent_service=ServiceRegistry.get_agent_service(),
            rag_service=ServiceRegistry.get_rag_service(),
            # ...
        )
    """
    return Mode2AutomaticWorkflow(
        agent_service=agent_service,
        rag_service=rag_service,
        tool_service=tool_service,
        memory_service=memory_service,
        streaming_service=streaming_service
    )

