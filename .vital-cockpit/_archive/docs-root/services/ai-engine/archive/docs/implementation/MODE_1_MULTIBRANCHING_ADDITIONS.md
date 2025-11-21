# Mode 1 Multi-Branching Enhancement - Additional Nodes

This document shows the additional nodes and routing functions needed for proper multi-branching in Mode 1.

These should be added to `mode1_interactive_auto_workflow.py`:

## Additional Nodes

```python
@trace_node("mode1_rag_and_tools")
async def rag_and_tools_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    Node: Retrieve both RAG context and prepare tools.
    
    Combines RAG retrieval with tool preparation.
    """
    # First, do RAG retrieval
    state_with_rag = await self.rag_retrieval_node(state)
    
    # Then, prepare tools
    selected_tools = state.get('selected_tools', [])
    logger.info(f"Preparing {len(selected_tools)} tools for execution")
    
    return {
        **state_with_rag,
        'tools_prepared': True,
        'available_tools': selected_tools,
        'current_node': 'rag_and_tools'
    }

@trace_node("mode1_tools_only")
async def tools_only_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    Node: Prepare tools without RAG.
    """
    selected_tools = state.get('selected_tools', [])
    logger.info(f"Preparing {len(selected_tools)} tools (no RAG)")
    
    return {
        **state,
        'tools_prepared': True,
        'available_tools': selected_tools,
        'retrieved_documents': [],
        'context_summary': '',
        'current_node': 'tools_only'
    }

@trace_node("mode1_direct_execution")
async def direct_execution_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    Node: Direct execution without RAG or tools.
    """
    logger.info("Direct execution (no RAG, no tools)")
    
    return {
        **state,
        'tools_prepared': False,
        'available_tools': [],
        'retrieved_documents': [],
        'context_summary': '',
        'current_node': 'direct_execution'
    }

@trace_node("mode1_retry_agent")
async def retry_agent_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    Node: Prepare for agent retry.
    
    Increments retry count and adjusts parameters.
    """
    retry_count = state.get('retry_count', 0) + 1
    
    logger.warning(
        "Retrying agent execution",
        retry_count=retry_count,
        max_retries=3
    )
    
    # Adjust parameters for retry (e.g., increase temperature)
    current_temp = state.get('temperature', 0.1)
    new_temp = min(current_temp + 0.1, 0.5)  # Increase but cap at 0.5
    
    return {
        **state,
        'retry_count': retry_count,
        'temperature': new_temp,
        'current_node': 'retry_agent'
    }

@trace_node("mode1_fallback_response")
async def fallback_response_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    Node: Generate fallback response when agent fails.
    """
    logger.error("Agent execution failed, using fallback response")
    
    fallback_message = (
        "I apologize, but I'm having difficulty processing your request at the moment. "
        "Please try rephrasing your question or contact support if the issue persists."
    )
    
    return {
        **state,
        'agent_response': fallback_message,
        'response_confidence': 0.0,
        'status': ExecutionStatus.COMPLETED,  # Still complete, but with fallback
        'current_node': 'fallback_response'
    }

@trace_node("mode1_handle_save_error")
async def handle_save_error_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    Node: Handle conversation save errors gracefully.
    """
    logger.error("Conversation save failed, continuing anyway")
    
    # Add warning to errors but don't fail the entire workflow
    return {
        **state,
        'errors': state.get('errors', []) + ["Warning: Failed to save conversation history"],
        'current_node': 'handle_save_error'
    }
```

## Routing Functions

```python
def route_conversation_type(self, state: UnifiedWorkflowState) -> str:
    """
    BRANCH 1: Route based on conversation type.
    
    Returns:
        "fresh" or "continuing"
    """
    conversation_exists = state.get('conversation_exists', False)
    return "continuing" if conversation_exists else "fresh"

def route_execution_strategy(self, state: UnifiedWorkflowState) -> str:
    """
    BRANCH 2: Route based on RAG and Tools configuration.
    
    Returns:
        "rag_and_tools" | "rag_only" | "tools_only" | "direct"
    """
    enable_rag = state.get('enable_rag', True)
    enable_tools = state.get('enable_tools', False)
    selected_tools = state.get('selected_tools', [])
    has_tools = enable_tools and len(selected_tools) > 0
    
    if enable_rag and has_tools:
        return "rag_and_tools"
    elif enable_rag and not has_tools:
        return "rag_only"
    elif not enable_rag and has_tools:
        return "tools_only"
    else:
        return "direct"

def route_agent_result(self, state: UnifiedWorkflowState) -> str:
    """
    BRANCH 3: Route based on agent execution result.
    
    Returns:
        "success" | "retry" | "fallback"
    """
    agent_response = state.get('agent_response', '')
    errors = state.get('errors', [])
    retry_count = state.get('retry_count', 0)
    max_retries = 3
    
    # Check if agent execution failed
    has_errors = len(errors) > 0
    has_response = len(agent_response) > 0
    
    if has_response and not has_errors:
        return "success"
    elif has_errors and retry_count < max_retries:
        return "retry"
    else:
        return "fallback"

def route_save_result(self, state: UnifiedWorkflowState) -> str:
    """
    BRANCH 4: Route based on save result.
    
    Returns:
        "saved" | "failed"
    """
    # Check if save_conversation added a save error
    errors = state.get('errors', [])
    save_failed = any("Failed to save conversation" in err for err in errors)
    
    return "failed" if save_failed else "saved"
```

## Integration

Add these to the Mode1InteractiveAutoWorkflow class after the existing nodes.

