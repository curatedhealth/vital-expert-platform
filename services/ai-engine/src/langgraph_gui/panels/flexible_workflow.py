"""
Flexible Panel Workflow Builder
Builds LangGraph workflows from frontend-defined node configurations
"""

from typing import Dict, Any, List, Optional, AsyncGenerator, Callable
from langgraph.graph import StateGraph, END
from datetime import datetime
import json

from .base import PanelState, PanelStatus, PanelType
from langgraph_gui.integration.panel_nodes import create_panel_node, NODE_REGISTRY
from langgraph_gui.integration.panel_tasks import PanelTaskExecutor


class FlexiblePanelWorkflow:
    """
    Flexible panel workflow that builds graph from frontend configuration
    Nodes and edges are defined in the workflow configuration
    """
    
    def __init__(
        self,
        openai_api_key: Optional[str] = None,
        task_executor: Optional[PanelTaskExecutor] = None,
        log_callback: Optional[Callable] = None
    ):
        """Initialize flexible panel workflow"""
        self.openai_api_key = openai_api_key
        self.task_executor = task_executor or PanelTaskExecutor(openai_api_key=openai_api_key)
        self.log_callback = log_callback
        self.graph = None  # Will be built from config
        self.node_instances: Dict[str, Any] = {}
    
    def _log(self, message: str, level: str = "info"):
        """Log message using callback or print"""
        if self.log_callback:
            self.log_callback(message, level)
        else:
            print(f"[FlexiblePanel] {message}")
    
    def build_graph_from_config(self, nodes_config: List[Dict[str, Any]], edges_config: List[Dict[str, Any]]) -> StateGraph:
        """
        Build LangGraph workflow from node and edge configurations
        
        Args:
            nodes_config: List of node configurations from frontend
                Example: [
                    {"id": "init", "type": "initialize", "config": {}},
                    {"id": "opening", "type": "opening_statements", "config": {}},
                    ...
                ]
            edges_config: List of edge configurations from frontend
                Example: [
                    {"source": "init", "target": "opening"},
                    {"source": "opening", "target": "discussion"},
                    ...
                ]
        """
        workflow = StateGraph(PanelState)
        
        # Create node instances
        self.node_instances = {}
        for node_config in nodes_config:
            node_id = node_config.get("id")
            node_type = node_config.get("type")
            node_config_data = node_config.get("config", {})
            
            if not node_id or not node_type:
                self._log(f"⚠️ Skipping invalid node config: {node_config}", "warning")
                continue
            
            if node_type not in NODE_REGISTRY:
                self._log(f"⚠️ Unknown node type '{node_type}' for node '{node_id}'. Skipping.", "warning")
                continue
            
            # Create node instance
            node_instance = create_panel_node(
                node_type,
                node_id,
                node_config_data,
                self.task_executor,
                self.log_callback
            )
            
            # Add to workflow
            workflow.add_node(node_id, node_instance.execute)
            self.node_instances[node_id] = node_instance
            
            self._log(f"✅ Added node: {node_id} (type: {node_type})")
        
        # Set entry point (first node or node with id "initialize")
        entry_node = next((n["id"] for n in nodes_config if n.get("id") == "initialize"), None)
        if not entry_node and nodes_config:
            entry_node = nodes_config[0].get("id")
        
        if entry_node:
            workflow.set_entry_point(entry_node)
            self._log(f"✅ Set entry point: {entry_node}")
        else:
            raise ValueError("No entry point found. At least one node is required.")
        
        # Add edges
        for edge_config in edges_config:
            source = edge_config.get("source")
            target = edge_config.get("target")
            condition = edge_config.get("condition")  # Optional condition for conditional edges
            
            if not source or not target:
                self._log(f"⚠️ Skipping invalid edge config: {edge_config}", "warning")
                continue
            
            # Check if nodes exist
            if source not in self.node_instances or target not in self.node_instances:
                self._log(f"⚠️ Edge references non-existent node(s): {source} -> {target}", "warning")
                continue
            
            if condition:
                # Conditional edge - need to handle this differently
                # For now, we'll use a simple conditional function
                self._log(f"⚠️ Conditional edges not yet fully supported. Using simple edge.", "warning")
                workflow.add_edge(source, target)
            elif target == "END":
                workflow.add_edge(source, END)
            else:
                workflow.add_edge(source, target)
            
            self._log(f"✅ Added edge: {source} -> {target}")
        
        return workflow.compile()
    
    async def execute(
        self,
        config: Dict[str, Any],
        tenant_id: str = "default"
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Execute flexible panel workflow with streaming
        
        Args:
            config: Panel configuration including:
                - nodes: List of node configurations
                - edges: List of edge configurations
                - query: Panel query
                - tasks: Task configurations
                - Other panel settings
            tenant_id: Tenant identifier
            
        Yields:
            SSE events as dictionaries
        """
        # Extract node and edge configurations
        nodes_config = config.get("nodes", [])
        edges_config = config.get("edges", [])
        
        # If no nodes/edges provided, use default structure based on panel type
        panel_type = config.get("panel_type", PanelType.STRUCTURED.value)
        if not nodes_config or not edges_config:
            self._log("⚠️ No nodes/edges in config, using default structure", "warning")
            nodes_config, edges_config = self._get_default_structure(panel_type)
        
        # Build graph from configuration
        self._log(f"Building workflow graph from {len(nodes_config)} nodes and {len(edges_config)} edges...")
        self.graph = self.build_graph_from_config(nodes_config, edges_config)
        
        # Build initial state
        initial_state: PanelState = {
            "panel_id": config.get("panel_id", f"panel-{datetime.now().timestamp()}"),
            "tenant_id": tenant_id,
            "user_id": config.get("user_id", "user"),
            "panel_type": panel_type,
            "intervention_mode": config.get("intervention_mode", "ai_simulated"),
            "query": config["query"],
            "context": config.get("context", {}),
            "tasks": config.get("tasks", []),
            "max_rounds": config.get("rounds", 3),
            "consensus_threshold": config.get("consensus_threshold", 0.75),
            "time_budget": config.get("time_budget", 600),
            "workflow_system_prompt": config.get("system_prompt"),
            "status": PanelStatus.CREATED.value,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }
        
        # Execute workflow
        last_emitted_id = 0
        
        # Yield immediate feedback
        yield {
            "event": "log",
            "data": {"message": "Starting flexible panel workflow execution...", "level": "info"}
        }
        
        self._log(f"Initial state prepared:")
        self._log(f"  - Query: {initial_state.get('query', 'N/A')[:50]}...")
        self._log(f"  - Tasks: {len(initial_state.get('tasks', []))}")
        self._log(f"  - Nodes: {len(nodes_config)}")
        self._log(f"  - Edges: {len(edges_config)}")
        
        yield {
            "event": "log",
            "data": {"message": f"Initial state: {len(initial_state.get('tasks', []))} tasks, {len(nodes_config)} workflow nodes", "level": "info"}
        }
        
        try:
            import asyncio
            last_update_time = asyncio.get_event_loop().time()
            first_yield_time = None
            
            self._log("Creating astream iterator...")
            astream_iter = self.graph.astream(initial_state)
            self._log("Astream iterator created, starting iteration...")
            
            yield {
                "event": "log",
                "data": {"message": "LangGraph iterator created, waiting for first state update...", "level": "info"}
            }
            
            node_count = 0
            final_state = None
            last_state_update = None
            
            async for state_update in astream_iter:
                if first_yield_time is None:
                    first_yield_time = asyncio.get_event_loop().time()
                    wait_time = first_yield_time - last_update_time
                    self._log(f"✅ First state update received after {wait_time:.2f} seconds")
                    yield {
                        "event": "log",
                        "data": {"message": f"✅ First state update received after {wait_time:.2f} seconds", "level": "success"}
                    }
                
                current_time = asyncio.get_event_loop().time()
                if current_time - last_update_time > 30:
                    self._log(f"⚠️ WARNING: No state updates for {int(current_time - last_update_time)} seconds", "warning")
                    yield {
                        "event": "log",
                        "data": {"message": f"⚠️ WARNING: No state updates for {int(current_time - last_update_time)} seconds", "level": "warning"}
                    }
                
                last_update_time = current_time
                node_count += 1
                self._log(f"Received state update #{node_count}")
                
                yield {
                    "event": "log",
                    "data": {"message": f"Processing state update #{node_count}...", "level": "info"}
                }
                
                # LangGraph's astream can return different formats
                if isinstance(state_update, dict):
                    keys = list(state_update.keys())
                    # Check if it's a node mapping
                    if keys and all(k in self.node_instances for k in keys):
                        # It's a node mapping - get the last node's state
                        last_node = keys[-1]
                        node_state = state_update[last_node]
                        
                        if isinstance(node_state, dict):
                            events = node_state.get("events_emitted", [])
                            
                            # Yield only new events
                            for event in events:
                                event_id = event.get("id", 0)
                                if event_id > last_emitted_id:
                                    yield {
                                        "event": event["type"],
                                        "data": event["data"]
                                    }
                                    last_emitted_id = event_id
                            
                            final_state = node_state
                            last_state_update = node_state
                    else:
                        # It's a direct state dict
                        events = state_update.get("events_emitted", [])
                        
                        # Yield only new events
                        for event in events:
                            event_id = event.get("id", 0)
                            if event_id > last_emitted_id:
                                yield {
                                    "event": event["type"],
                                    "data": event["data"]
                                }
                                last_emitted_id = event_id
                        
                        final_state = state_update
                        last_state_update = state_update
        except Exception as e:
            import traceback
            error_msg = str(e)
            traceback_str = traceback.format_exc()
            self._log(f"❌ LangGraph execution error: {error_msg}", "error")
            print(f"LangGraph execution error: {error_msg}")
            print(f"Traceback: {traceback_str}")
            yield {
                "event": "log",
                "data": {"message": f"❌ LangGraph execution error: {error_msg}", "level": "error"}
            }
            yield {
                "event": "error",
                "data": {"message": f"LangGraph execution failed: {error_msg}", "traceback": traceback_str}
            }
            return
        
        self._log(f"Graph execution completed. Processed {node_count} state updates")
        yield {
            "event": "log",
            "data": {"message": f"Graph execution completed. Processed {node_count} state updates", "level": "info"}
        }
        
        # Use last_state_update if final_state is None
        state_to_use = final_state or last_state_update
        
        # Yield final state - always emit complete event even if no final_report
        yield {
            "event": "complete",
            "data": {
                "final_report": state_to_use.get("final_report") if state_to_use else None,
                "consensus_level": state_to_use.get("consensus_level", 0.0) if state_to_use else 0.0,
                "status": state_to_use.get("status", "completed") if state_to_use else "completed",
                "node_count": node_count
            }
        }
    
    def _get_default_structure(self, panel_type: str) -> tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """Get default node/edge structure for panel type (fallback) - uses customizable workflow phase nodes"""
        if panel_type == PanelType.STRUCTURED.value:
            return (
                [
                    {"id": "initialize", "type": "initialize", "config": {}},
                    {"id": "opening_statements_node", "type": "opening_statements", "config": {}},
                    {"id": "discussion_round", "type": "discussion_round", "config": {}},
                    {"id": "consensus_building", "type": "consensus_building", "config": {}},
                    {"id": "documentation", "type": "documentation", "config": {}},
                ],
                [
                    {"source": "initialize", "target": "opening_statements_node"},
                    {"source": "opening_statements_node", "target": "discussion_round"},
                    {"source": "discussion_round", "target": "consensus_building"},
                    {"source": "consensus_building", "target": "documentation"},
                    {"source": "documentation", "target": "END"},
                ]
            )
        else:  # OPEN
            return (
                [
                    {"id": "initialize", "type": "initialize", "config": {}},
                    {"id": "opening_round", "type": "opening_round", "config": {}},
                    {"id": "free_dialogue", "type": "free_dialogue", "config": {"num_turns": 3}},
                    {"id": "theme_clustering", "type": "theme_clustering", "config": {}},
                    {"id": "final_perspectives", "type": "final_perspectives", "config": {}},
                    {"id": "synthesis", "type": "synthesis", "config": {}},
                ],
                [
                    {"source": "initialize", "target": "opening_round"},
                    {"source": "opening_round", "target": "free_dialogue"},
                    {"source": "free_dialogue", "target": "theme_clustering"},
                    {"source": "theme_clustering", "target": "final_perspectives"},
                    {"source": "final_perspectives", "target": "synthesis"},
                    {"source": "synthesis", "target": "END"},
                ]
            )

