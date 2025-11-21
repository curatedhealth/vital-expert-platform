"""
Unified Panel Executor
Routes to appropriate panel workflow based on type detection
Supports both metadata-based and task ID-based detection
Uses panel registry for extensible panel type support
"""

from typing import Dict, Any, Optional, AsyncGenerator, List
from langgraph_gui.nodes.base import Workflow, NodeConfig
from .base import PanelType, PanelConfig
from .registry import panel_registry
# Import panels to register them
from .structured_panel import StructuredPanelWorkflow
from .open_panel import OpenPanelWorkflow


class PanelExecutor:
    """Unified executor for panel workflows using registry system"""
    
    def __init__(
        self, 
        openai_api_key: Optional[str] = None, 
        task_executor: Optional[Any] = None,
        log_callback: Optional[callable] = None
    ):
        """Initialize panel executor"""
        self.openai_api_key = openai_api_key
        self.task_executor = task_executor  # Store for model override
        self.log_callback = log_callback
        # Panels are now registered via decorators, no need to instantiate here
    
    @staticmethod
    def detect_panel_type(workflow: Workflow) -> Optional[PanelType]:
        """
        Detect panel type from workflow using both methods:
        1. Check metadata for panel_type
        2. Check task IDs in nodes
        """
        # Method 1: Check metadata
        if workflow.metadata and workflow.metadata.get("panel_type"):
            try:
                return PanelType(workflow.metadata["panel_type"])
            except ValueError:
                pass
        
        # Method 2: Check task IDs in nodes
        task_ids = []
        for node in workflow.nodes:
            # Check if node has task data
            node_data = node.data or {}
            task = node_data.get("task", {})
            if isinstance(task, dict):
                task_id = task.get("id")
                if task_id:
                    task_ids.append(task_id)
        
        # Check for panel-specific tasks
        if "moderator" in task_ids and "expert_agent" in task_ids:
            # Check for structured panel tasks
            if "opening_statements" in task_ids or "discussion_round" in task_ids:
                return PanelType.STRUCTURED
            # Default to open panel if moderator + expert but no structured tasks
            return PanelType.OPEN
        
        return None
    
    @staticmethod
    def extract_tasks_from_workflow(workflow: Workflow) -> List[Dict[str, Any]]:
        """Extract task configurations from workflow nodes"""
        tasks = []
        
        for node in workflow.nodes:
            node_data = node.data or {}
            task = node_data.get("task", {})
            
            if isinstance(task, dict) and task.get("id"):
                task_config = {
                    "id": node.id,
                    "task_id": task.get("id"),
                    "name": task.get("name", task.get("id")),
                    "config": task.get("config", {}),
                    "context": node_data.get("context", {})
                }
                tasks.append(task_config)
            elif node.type == "task" or node_data.get("_original_type") == "task":
                # Fallback: if node is marked as task but no task data, create a minimal task
                # This handles cases where task data might be structured differently
                task_config = {
                    "id": node.id,
                    "task_id": node_data.get("task_id", "unknown"),
                    "name": node.label or node.id,
                    "config": node_data.get("config", {}),
                    "context": node_data.get("context", {})
                }
                tasks.append(task_config)
        
        return tasks
    
    def build_panel_config(
        self,
        workflow: Workflow,
        query: str,
        additional_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Build panel configuration from workflow"""
        # Detect panel type
        panel_type = PanelExecutor.detect_panel_type(workflow)
        if not panel_type:
            raise ValueError("Could not detect panel type from workflow")
        
        # Extract tasks (these are the task nodes like moderator, expert_agent)
        tasks = PanelExecutor.extract_tasks_from_workflow(workflow)
        
        # Override model in task configs with the selected model from settings
        # This ensures all workflows use the model chosen in Settings, regardless of what's in the workflow definition
        if self.task_executor:
            selected_model = self.task_executor.default_model
            provider = self.task_executor.provider
            
            # Update model in all task configs to use the selected model from settings
            for task in tasks:
                task_config = task.get("config", {})
                if task_config:
                    current_model = task_config.get("model", "gpt-4o")
                    task_config["model"] = selected_model
                    if self.log_callback:
                        self.log_callback(f"Updated task '{task.get('task_id')}' model from '{current_model}' to '{selected_model}' (provider: {provider})", "info")
        
        # Log task extraction
        if self.log_callback:
            self.log_callback(f"Extracted {len(tasks)} tasks from workflow", "info")
            task_ids = [t.get("task_id") for t in tasks]
            self.log_callback(f"Task IDs: {task_ids}", "info")
        
        # Extract expert tasks
        expert_tasks = [t for t in tasks if t.get("task_id") == "expert_agent"]
        moderator_task = next((t for t in tasks if t.get("task_id") == "moderator"), None)
        
        if self.log_callback:
            self.log_callback(f"Found {len(expert_tasks)} expert tasks and {'1' if moderator_task else '0'} moderator task", "info")
        
        # Get system prompt from metadata
        system_prompt = workflow.metadata.get("system_prompt")
        
        # Extract workflow phase nodes/edges from metadata (if provided by frontend)
        # These define the workflow structure (initialize, opening_statements, etc.)
        workflow_nodes = workflow.metadata.get("workflow_nodes", [])
        workflow_edges = workflow.metadata.get("workflow_edges", [])
        
        if self.log_callback:
            if workflow_nodes:
                self.log_callback(f"Found {len(workflow_nodes)} workflow phase nodes from frontend", "info")
            if workflow_edges:
                self.log_callback(f"Found {len(workflow_edges)} workflow phase edges from frontend", "info")
        
        # Build config
        config = {
            "panel_id": workflow.id,
            "user_id": "user",  # Default, should come from request
            "query": query,
            "panel_type": panel_type.value,
            "system_prompt": system_prompt,
            "tasks": tasks,
            "experts": expert_tasks,
            "rounds": workflow.metadata.get("rounds", 3),
            "consensus_threshold": workflow.metadata.get("consensus_threshold", 0.75),
            "time_budget": workflow.metadata.get("time_budget", 600),
            "intervention_mode": workflow.metadata.get("intervention_mode", "ai_simulated"),
            "context": workflow.metadata.get("context", {}),
            # Add workflow phase nodes/edges if provided
            "nodes": workflow_nodes,  # Workflow phase nodes (initialize, opening_statements, etc.)
            "edges": workflow_edges,  # Workflow phase edges
        }
        
        # Merge additional config
        if additional_config:
            config.update(additional_config)
        
        return config
    
    async def execute_panel(
        self,
        workflow: Workflow,
        query: str,
        tenant_id: str = "default",
        additional_config: Optional[Dict[str, Any]] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Execute panel workflow with automatic type detection
        
        Args:
            workflow: Workflow definition
            query: Panel query/question
            tenant_id: Tenant identifier
            additional_config: Additional configuration to merge
            
        Yields:
            SSE events as dictionaries
        """
        # Detect panel type
        panel_type = self.detect_panel_type(workflow)
        if not panel_type:
            raise ValueError("Could not detect panel type from workflow")
        
        # Build config
        if self.log_callback:
            self.log_callback("Building panel configuration from workflow...", "info")
        config = self.build_panel_config(workflow, query, additional_config)
        
        if self.log_callback:
            self.log_callback(f"Panel config built: {len(config.get('tasks', []))} tasks, {config.get('rounds', 3)} rounds", "info")
        
        # Route to appropriate workflow using registry
        panel_type_str = panel_type.value if isinstance(panel_type, PanelType) else str(panel_type)
        
        if self.log_callback:
            self.log_callback(f"Routing to {panel_type_str} Panel workflow...", "info")
        
        # Ensure panels are imported (decorators run on import)
        # This is a safety check - panels should already be imported
        if not panel_registry.list_types():
            # Force import if not already registered
            from .structured_panel import StructuredPanelWorkflow
            from .open_panel import OpenPanelWorkflow
        
        # Create panel workflow instance from registry
        panel_workflow = panel_registry.create(
            panel_type_str,
            openai_api_key=self.openai_api_key,
            task_executor=self.task_executor,
            log_callback=self.log_callback
        )
        
        if not panel_workflow:
            available_types = panel_registry.list_types()
            error_msg = (
                f"Unsupported panel type: {panel_type_str}. "
                f"Available types: {available_types}. "
                f"Make sure panel classes are imported."
            )
            if self.log_callback:
                self.log_callback(f"ERROR: {error_msg}", "error")
            raise ValueError(error_msg)
        
        # Execute panel workflow
        async for event in panel_workflow.execute(config, tenant_id):
            yield event

