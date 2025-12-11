"""
VITAL Path - Node Registry

Maps Protocol Node Types to Python handler functions.
This is the central registry that determines what code runs for each visual node.

Usage:
    @NodeRegistry.register("expert")
    async def expert_node(state: WorkflowState, config: ExpertNodeConfig) -> WorkflowState:
        # Handle expert node logic
        pass
"""

from typing import Callable, Dict, Any, TypeVar, Optional
from functools import wraps
import logging

logger = logging.getLogger(__name__)

# Type for node handler functions
NodeHandler = Callable[..., Any]
T = TypeVar("T", bound=NodeHandler)


class NodeRegistry:
    """
    Central registry for mapping visual node types to Python handlers.
    
    The registry ensures that:
    1. Every Protocol node type has a corresponding Python implementation
    2. Node handlers receive properly typed configuration
    3. Unknown node types fail fast with clear error messages
    """
    
    _nodes: Dict[str, NodeHandler] = {}
    _conditions: Dict[str, Callable[..., bool]] = {}
    _metadata: Dict[str, Dict[str, Any]] = {}
    
    @classmethod
    def register(cls, node_type: str, **metadata) -> Callable[[T], T]:
        """
        Decorator to register a node handler.
        
        Args:
            node_type: The Protocol node type (e.g., "expert", "tool", "router")
            **metadata: Optional metadata (description, version, etc.)
        
        Example:
            @NodeRegistry.register("expert", version="1.0", requires_llm=True)
            async def expert_node(state, config):
                pass
        """
        def decorator(fn: T) -> T:
            if node_type in cls._nodes:
                logger.warning(f"Overwriting existing handler for node type: {node_type}")
            
            cls._nodes[node_type] = fn
            cls._metadata[node_type] = {
                "handler": fn.__name__,
                "module": fn.__module__,
                **metadata,
            }
            
            logger.debug(f"Registered node handler: {node_type} -> {fn.__name__}")
            return fn
        
        return decorator
    
    @classmethod
    def register_condition(cls, condition_id: str) -> Callable[[Callable], Callable]:
        """
        Decorator to register a condition evaluator for Router nodes.
        
        Args:
            condition_id: Unique identifier for the condition
        
        Example:
            @NodeRegistry.register_condition("has_citations")
            def check_citations(state):
                return len(state.get("citations", [])) > 0
        """
        def decorator(fn: Callable) -> Callable:
            cls._conditions[condition_id] = fn
            logger.debug(f"Registered condition: {condition_id}")
            return fn
        
        return decorator
    
    @classmethod
    def get_handler(cls, node_type: str) -> NodeHandler:
        """
        Get the handler function for a node type.
        
        Args:
            node_type: The Protocol node type
        
        Returns:
            The registered handler function
        
        Raises:
            ValueError: If no handler is registered for the node type
        """
        if node_type not in cls._nodes:
            registered = list(cls._nodes.keys())
            raise ValueError(
                f"No handler registered for node type: '{node_type}'. "
                f"Registered types: {registered}"
            )
        return cls._nodes[node_type]
    
    @classmethod
    def get_condition(cls, condition_id: str) -> Callable[..., bool]:
        """
        Get a condition evaluator by ID.
        
        Args:
            condition_id: The condition identifier
        
        Returns:
            The condition evaluator function
        """
        if condition_id not in cls._conditions:
            raise ValueError(f"No condition registered with ID: '{condition_id}'")
        return cls._conditions[condition_id]
    
    @classmethod
    def has_handler(cls, node_type: str) -> bool:
        """Check if a handler is registered for a node type."""
        return node_type in cls._nodes
    
    @classmethod
    def list_handlers(cls) -> Dict[str, Dict[str, Any]]:
        """List all registered handlers with their metadata."""
        return cls._metadata.copy()
    
    @classmethod
    def clear(cls) -> None:
        """Clear all registered handlers (useful for testing)."""
        cls._nodes.clear()
        cls._conditions.clear()
        cls._metadata.clear()


# ============================================================================
# Built-in Node Handlers
# ============================================================================
# These handlers are registered when the module is imported.
# Additional handlers can be registered in their respective modules.
# ============================================================================

@NodeRegistry.register("start", description="Workflow entry point")
async def start_node(state: dict, config: dict) -> dict:
    """
    Start node - Entry point for workflow execution.
    
    Initializes the workflow state with any provided initial context.
    """
    initial_context = config.get("initialContext", {})
    return {
        **state,
        "started_at": __import__("datetime").datetime.utcnow().isoformat(),
        **initial_context,
    }


@NodeRegistry.register("end", description="Workflow exit point")
async def end_node(state: dict, config: dict) -> dict:
    """
    End node - Exit point for workflow execution.
    
    Handles final output based on configured output mode.
    """
    output_mode = config.get("outputMode", "return")
    
    if output_mode == "return":
        return state
    elif output_mode == "store":
        # Store result in database (implementation in infrastructure)
        pass
    elif output_mode == "webhook":
        # Call webhook URL (implementation in infrastructure)
        pass
    
    return {
        **state,
        "completed_at": __import__("datetime").datetime.utcnow().isoformat(),
    }


@NodeRegistry.register("delay", description="Add a delay before continuing")
async def delay_node(state: dict, config: dict) -> dict:
    """
    Delay node - Adds a pause in workflow execution.
    """
    import asyncio
    
    delay_ms = config.get("delayMs", 1000)
    await asyncio.sleep(delay_ms / 1000)
    
    return state


@NodeRegistry.register("log", description="Log data for debugging")
async def log_node(state: dict, config: dict) -> dict:
    """
    Log node - Outputs debug information.
    """
    level = config.get("level", "info")
    message = config.get("message", "")
    include_keys = config.get("includeKeys", [])
    
    log_data = {k: state.get(k) for k in include_keys} if include_keys else state
    
    log_fn = getattr(logger, level, logger.info)
    log_fn(f"[Workflow Log] {message}: {log_data}")
    
    return state


@NodeRegistry.register("transform", description="Transform data between nodes")
async def transform_node(state: dict, config: dict) -> dict:
    """
    Transform node - Applies a transformation to state data.
    
    Note: For security, the expression should be validated/sandboxed.
    """
    expression = config.get("expression", "")
    input_keys = config.get("inputKeys", [])
    output_key = config.get("outputKey", "transformed")
    
    # Gather input data
    input_data = {k: state.get(k) for k in input_keys}
    
    # TODO: Implement safe expression evaluation
    # For now, just pass through
    result = input_data
    
    return {
        **state,
        output_key: result,
    }


# ============================================================================
# Condition Evaluators
# ============================================================================

@NodeRegistry.register_condition("always_true")
def always_true(state: dict) -> bool:
    """Condition that always returns True."""
    return True


@NodeRegistry.register_condition("always_false")
def always_false(state: dict) -> bool:
    """Condition that always returns False."""
    return False


@NodeRegistry.register_condition("has_error")
def has_error(state: dict) -> bool:
    """Check if the state contains an error."""
    return bool(state.get("error"))


@NodeRegistry.register_condition("has_result")
def has_result(state: dict) -> bool:
    """Check if the state contains a result."""
    return bool(state.get("result"))


# ============================================================================
# Additional Node Handlers for Complete Protocol Coverage
# ============================================================================

@NodeRegistry.register("expert", description="AI expert consultation node", requires_llm=True)
async def expert_node(state: dict, config: dict) -> dict:
    """
    Expert node - Calls an AI expert agent.
    
    Wired to the ExpertService for actual execution.
    
    Config:
        - agentId: ID of the expert agent
        - mode: Mode number (1-4) or name
        - conversationId: Optional conversation context
    """
    from modules.expert import ExpertService
    
    agent_id = config.get("agentId", config.get("agent_id"))
    mode = config.get("mode", 1)
    conversation_id = config.get("conversationId")
    
    # Convert mode string to number if needed
    if isinstance(mode, str):
        mode_map = {"mode_1": 1, "mode_2": 2, "mode_3": 3, "mode_4": 4}
        mode = mode_map.get(mode, 1)
    
    # Get query from state
    query = state.get("query", state.get("input", state.get("message", "")))
    
    if not query:
        return {
            **state,
            "error": "No query found in state",
            "expert_called": False,
        }
    
    # Execute expert mode
    service = ExpertService()
    try:
        response = await service.ask(
            query=query,
            mode=mode,
            agent_ids=[agent_id] if agent_id else [],
            conversation_id=conversation_id,
        )
        
        return {
            **state,
            "expert_called": True,
            "expert_response": response.content,
            "citations": response.citations,
            "thinking": response.thinking,
            "agent_id": agent_id,
            "mode": mode,
            "is_async": response.is_async,
            "job_id": response.job_id,
        }
    except Exception as e:
        logger.exception(f"Expert node failed: {e}")
        return {
            **state,
            "error": str(e),
            "expert_called": False,
        }


@NodeRegistry.register("router", description="Conditional routing node")
async def router_node(state: dict, config: dict) -> dict:
    """
    Router node - Routes execution based on conditions.
    """
    conditions = config.get("conditions", [])
    default_target = config.get("defaultTargetNodeId")
    
    # Evaluate conditions
    for cond in conditions:
        condition_id = cond.get("conditionId")
        target = cond.get("targetNodeId")
        
        if NodeRegistry._conditions.get(condition_id, lambda s: False)(state):
            return {**state, "_next_node": target}
    
    return {**state, "_next_node": default_target}


@NodeRegistry.register("panel", description="Multi-expert panel discussion", requires_llm=True)
async def panel_node(state: dict, config: dict) -> dict:
    """
    Panel node - Orchestrates a multi-expert discussion.
    
    Wired to PanelOrchestrator for actual execution.
    
    Config:
        - panelId: Optional existing panel ID
        - panelType: structured, open, socratic, adversarial, delphi, hybrid
        - experts: List of expert agent IDs
        - maxRounds: Maximum discussion rounds (default: 5)
        - minConsensus: Minimum consensus threshold (default: 0.7)
    """
    from services.panel_orchestrator import PanelOrchestrator
    from services.agent_orchestrator import AgentOrchestrator
    from services.supabase_client import SupabaseClient
    from services.cache_manager import CacheManager
    from core.context import get_organization_id, get_user_id
    from uuid import UUID
    
    panel_type = config.get("panelType", "structured")
    experts = config.get("experts", [])
    panel_id = config.get("panelId")
    
    # Get query from state
    query = state.get("query", state.get("input", state.get("message", "")))
    
    if not query:
        return {
            **state,
            "error": "No query found in state for panel discussion",
            "panel_called": False,
        }
    
    if len(experts) < 2:
        return {
            **state,
            "error": "Panel requires at least 2 experts",
            "panel_called": False,
        }
    
    try:
        # Initialize services
        supabase = SupabaseClient()
        cache = CacheManager()
        agent_orchestrator = AgentOrchestrator(supabase, cache)
        panel_orchestrator = PanelOrchestrator(agent_orchestrator, supabase, cache)
        
        # Get context
        organization_id = get_organization_id()
        user_id = get_user_id()
        
        if not organization_id or not user_id:
            return {
                **state,
                "error": "Organization/user context required for panel",
                "panel_called": False,
            }
        
        # Create and run panel
        panel_session_id = await panel_orchestrator.create_panel(
            tenant_id=UUID(organization_id),
            user_id=UUID(user_id),
            query=query,
            panel_type=panel_type,
            agent_ids=experts,
            config={
                "max_rounds": config.get("maxRounds", 5),
                "min_consensus": config.get("minConsensus", 0.7),
            },
        )
        
        # Run the panel discussion
        result = await panel_orchestrator.run_panel_discussion(panel_session_id)
        
        return {
            **state,
            "panel_called": True,
            "panel_id": str(panel_session_id),
            "panel_type": panel_type,
            "expert_count": len(experts),
            "panel_result": result.get("consensus", ""),
            "panel_responses": result.get("individual_responses", []),
            "consensus_score": result.get("consensus_score", 0.0),
        }
        
    except Exception as e:
        logger.exception(f"Panel node failed: {e}")
        return {
            **state,
            "error": str(e),
            "panel_called": False,
        }


@NodeRegistry.register("tool", description="External tool/API call", requires_tool_registry=True)
async def tool_node(state: dict, config: dict) -> dict:
    """
    Tool node - Calls an external tool or API.
    
    Wired to ToolRegistryService for tool lookup and execution.
    
    Config:
        - toolId: Tool code/identifier (e.g., 'TOOL-AI-WEB_SEARCH')
        - toolInputs: Dict mapping input parameters to state keys
        - outputKey: Where to store the tool result in state
    """
    from services.tool_registry_service import ToolRegistryService
    from services.supabase_client import SupabaseClient
    
    tool_id = config.get("toolId", config.get("tool_id"))
    tool_inputs = config.get("toolInputs", {})
    output_key = config.get("outputKey", "tool_result")
    
    if not tool_id:
        return {
            **state,
            "error": "No toolId specified",
            "tool_called": False,
        }
    
    try:
        # Initialize tool registry
        supabase = SupabaseClient()
        tool_registry = ToolRegistryService(supabase)
        
        # Get tool configuration
        tool_config = await tool_registry.get_tool_by_code(tool_id)
        
        if not tool_config:
            return {
                **state,
                "error": f"Tool not found: {tool_id}",
                "tool_called": False,
            }
        
        # Prepare inputs from state
        inputs = {}
        for param_name, state_key in tool_inputs.items():
            inputs[param_name] = state.get(state_key, state.get(param_name))
        
        # If no explicit inputs, try to pass query
        if not inputs and state.get("query"):
            inputs["query"] = state.get("query")
        
        # Check if tool is LangGraph compatible
        if tool_config.get("langgraph_compatible"):
            # Import and execute the tool function
            impl_path = tool_config.get("implementation_path")
            func_name = tool_config.get("function_name")
            
            if impl_path and func_name:
                import importlib
                module = importlib.import_module(impl_path)
                tool_func = getattr(module, func_name)
                
                if tool_config.get("is_async"):
                    result = await tool_func(**inputs)
                else:
                    result = tool_func(**inputs)
            else:
                result = {"message": f"Tool {tool_id} not implemented"}
        else:
            # Non-LangGraph tool - return config for external handling
            result = {
                "tool_config": tool_config,
                "inputs": inputs,
                "requires_external_execution": True,
            }
        
        return {
            **state,
            "tool_called": True,
            "tool_id": tool_id,
            "tool_name": tool_config.get("tool_name"),
            output_key: result,
        }
        
    except Exception as e:
        logger.exception(f"Tool node failed: {e}")
        return {
            **state,
            "error": str(e),
            "tool_called": False,
            "tool_id": tool_id,
        }


@NodeRegistry.register("memory", description="Memory read/write operations", requires_memory=True)
async def memory_node(state: dict, config: dict) -> dict:
    """
    Memory node - Reads or writes to long-term memory.
    
    Wired to MemoryNodes for semantic memory operations.
    
    Config:
        - operation: 'read', 'write', 'extract', or 'retrieve'
        - memoryKey: Key for storing/retrieving specific memory
        - memoryType: 'conversation', 'entity', 'preference', 'fact'
        - conversationId: Required for conversation memory
    """
    from langgraph_workflows.memory_nodes import MemoryNodes
    from langgraph_workflows.state_schemas import UnifiedWorkflowState
    from services.supabase_client import SupabaseClient
    from services.cache_manager import CacheManager
    from core.context import get_organization_id, get_user_id
    
    operation = config.get("operation", "read")
    memory_key = config.get("memoryKey")
    memory_type = config.get("memoryType", "conversation")
    conversation_id = config.get("conversationId") or state.get("conversation_id")
    
    try:
        # Initialize memory nodes
        supabase = SupabaseClient()
        cache = CacheManager()
        memory_nodes = MemoryNodes(supabase, cache)
        
        # Get context
        organization_id = get_organization_id()
        user_id = get_user_id()
        
        # Create unified state for memory nodes
        unified_state = UnifiedWorkflowState(
            tenant_id=organization_id or "",
            user_id=user_id or "",
            query=state.get("query", ""),
            agent_response=state.get("expert_response", state.get("response", "")),
            conversation_id=conversation_id,
            **{k: v for k, v in state.items() if k not in ["tenant_id", "user_id", "query"]}
        )
        
        if operation == "extract":
            # Extract semantic memory from current conversation turn
            result_state = await memory_nodes.extract_semantic_memory_node(unified_state)
            return {
                **state,
                "memory_extracted": True,
                "extracted_entities": result_state.get("extracted_entities", []),
                "extracted_facts": result_state.get("extracted_facts", []),
                "extracted_preferences": result_state.get("extracted_preferences", {}),
            }
            
        elif operation == "retrieve":
            # Retrieve relevant memory for context
            result_state = await memory_nodes.retrieve_relevant_memory_node(unified_state)
            return {
                **state,
                "memory_retrieved": True,
                "relevant_memory": result_state.get("relevant_memory", []),
                "memory_context": result_state.get("memory_context", ""),
            }
            
        elif operation == "write":
            # Update conversation memory
            result_state = await memory_nodes.update_conversation_memory_node(unified_state)
            return {
                **state,
                "memory_written": True,
                "memory_key": memory_key,
            }
            
        elif operation == "read":
            # Read specific memory key
            # Default to retrieve for now
            result_state = await memory_nodes.retrieve_relevant_memory_node(unified_state)
            return {
                **state,
                "memory_read": memory_key,
                "memory_value": result_state.get("relevant_memory", []),
            }
        
        return state
        
    except Exception as e:
        logger.exception(f"Memory node failed: {e}")
        return {
            **state,
            "error": str(e),
            "memory_operation_failed": True,
        }


@NodeRegistry.register("aggregator", description="Aggregate results from parallel branches")
async def aggregator_node(state: dict, config: dict) -> dict:
    """
    Aggregator node - Combines results from parallel branches.
    
    Strategies:
        - merge: Deep merge all branch results
        - concat: Concatenate list/string results
        - vote: Take majority vote (for classification)
        - best: Select best result by confidence score
        - consensus: Find common ground across results
        - custom: Use custom aggregation function
    
    Config:
        - strategy: Aggregation strategy (default: 'merge')
        - sourceKeys: List of state keys to aggregate
        - outputKey: Where to store aggregated result
        - weights: Optional weights for weighted strategies
    """
    strategy = config.get("strategy", "merge")
    source_keys = config.get("sourceKeys", [])
    output_key = config.get("outputKey", "aggregated_result")
    weights = config.get("weights", {})
    
    # Collect results to aggregate
    results_to_aggregate = []
    
    # If source keys specified, use those
    if source_keys:
        for key in source_keys:
            if key in state:
                results_to_aggregate.append({
                    "key": key,
                    "value": state[key],
                    "weight": weights.get(key, 1.0),
                })
    else:
        # Auto-detect branch results (look for branch_* keys or lists)
        for key, value in state.items():
            if key.startswith("branch_") or key.endswith("_results"):
                results_to_aggregate.append({
                    "key": key,
                    "value": value,
                    "weight": weights.get(key, 1.0),
                })
    
    if not results_to_aggregate:
        return {
            **state,
            "aggregated": True,
            "strategy": strategy,
            output_key: None,
            "aggregation_note": "No results found to aggregate",
        }
    
    aggregated = None
    
    if strategy == "merge":
        # Deep merge dictionaries
        aggregated = {}
        for item in results_to_aggregate:
            value = item["value"]
            if isinstance(value, dict):
                aggregated = {**aggregated, **value}
            elif isinstance(value, list):
                if "items" not in aggregated:
                    aggregated["items"] = []
                aggregated["items"].extend(value)
            else:
                aggregated[item["key"]] = value
    
    elif strategy == "concat":
        # Concatenate strings or lists
        aggregated = []
        for item in results_to_aggregate:
            value = item["value"]
            if isinstance(value, list):
                aggregated.extend(value)
            elif isinstance(value, str):
                aggregated.append(value)
            else:
                aggregated.append(str(value))
        
        # If all strings, join them
        if all(isinstance(x, str) for x in aggregated):
            aggregated = "\n\n".join(aggregated)
    
    elif strategy == "vote":
        # Majority vote for classification results
        from collections import Counter
        votes = []
        for item in results_to_aggregate:
            value = item["value"]
            if isinstance(value, dict) and "classification" in value:
                votes.append(value["classification"])
            elif isinstance(value, str):
                votes.append(value)
        
        if votes:
            vote_counts = Counter(votes)
            winner, count = vote_counts.most_common(1)[0]
            aggregated = {
                "result": winner,
                "vote_count": count,
                "total_votes": len(votes),
                "confidence": count / len(votes),
            }
        else:
            aggregated = {"result": None, "error": "No votable results"}
    
    elif strategy == "best":
        # Select result with highest confidence
        best_result = None
        best_confidence = -1
        
        for item in results_to_aggregate:
            value = item["value"]
            confidence = 0
            
            if isinstance(value, dict):
                confidence = value.get("confidence", value.get("score", 0))
            
            # Apply weight
            weighted_confidence = confidence * item["weight"]
            
            if weighted_confidence > best_confidence:
                best_confidence = weighted_confidence
                best_result = value
        
        aggregated = {
            "best_result": best_result,
            "confidence": best_confidence,
        }
    
    elif strategy == "consensus":
        # Find common elements across results
        all_items = []
        for item in results_to_aggregate:
            value = item["value"]
            if isinstance(value, list):
                all_items.append(set(str(x) for x in value))
            elif isinstance(value, dict) and "items" in value:
                all_items.append(set(str(x) for x in value["items"]))
        
        if all_items:
            # Find intersection
            consensus_items = all_items[0]
            for item_set in all_items[1:]:
                consensus_items = consensus_items.intersection(item_set)
            
            aggregated = {
                "consensus_items": list(consensus_items),
                "consensus_count": len(consensus_items),
                "total_sources": len(all_items),
            }
        else:
            aggregated = {"consensus_items": [], "error": "No items to find consensus"}
    
    else:
        # Default: just collect everything
        aggregated = {
            "strategy": strategy,
            "results": [item["value"] for item in results_to_aggregate],
        }
    
    return {
        **state,
        "aggregated": True,
        "strategy": strategy,
        output_key: aggregated,
        "aggregated_count": len(results_to_aggregate),
    }


@NodeRegistry.register("iteration", description="Loop control node")
async def iteration_node(state: dict, config: dict) -> dict:
    """
    Iteration node - Controls loop iterations with break conditions.
    
    Config:
        - maxIterations: Maximum loop count (default: 10)
        - breakCondition: State key that signals break when truthy
        - incrementKey: Key to store iteration count (default: _iteration_count)
    """
    max_iterations = config.get("maxIterations", 10)
    break_condition = config.get("breakCondition")
    increment_key = config.get("incrementKey", "_iteration_count")
    
    current = state.get(increment_key, 0)
    
    # Check break condition
    should_break = False
    if break_condition and state.get(break_condition):
        should_break = True
    
    # Check max iterations
    at_limit = current >= max_iterations
    
    continue_iteration = not should_break and not at_limit
    
    return {
        **state,
        increment_key: current + 1,
        "_continue_iteration": continue_iteration,
        "_iteration_reason": "break_condition" if should_break else ("max_iterations" if at_limit else "continue"),
    }






