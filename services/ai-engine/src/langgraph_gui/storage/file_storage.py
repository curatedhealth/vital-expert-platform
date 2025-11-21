"""
File-based workflow storage
Save/load workflows as JSON files
"""

import json
import os
from pathlib import Path
from typing import List, Optional
from datetime import datetime

from ..nodes.base import Workflow, WorkflowMetadata


class WorkflowStorage:
    """File-based workflow storage"""
    
    def __init__(self, base_path: str = "./workflows"):
        """
        Initialize storage
        
        Args:
            base_path: Directory to store workflow files
        """
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    def save(self, workflow: Workflow) -> str:
        """
        Save workflow to file
        
        Args:
            workflow: Workflow to save
            
        Returns:
            Workflow ID
        """
        # Update timestamp
        workflow.updated_at = datetime.now().isoformat()
        if not workflow.created_at:
            workflow.created_at = workflow.updated_at
        
        # Save to file
        file_path = self.base_path / f"{workflow.id}.workflow.json"
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(workflow.dict(), f, indent=2)
        
        return workflow.id
    
    def load(self, workflow_id: str) -> Optional[Workflow]:
        """
        Load workflow from file
        
        Args:
            workflow_id: Workflow ID
            
        Returns:
            Workflow or None if not found
        """
        file_path = self.base_path / f"{workflow_id}.workflow.json"
        
        if not file_path.exists():
            return None
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Convert node types - handle "task" type which isn't in NodeType enum
        # Convert "task" to "input" for validation, but preserve in data field
        from ..nodes.base import NodeType
        for node in data.get('nodes', []):
            node_type = node.get('type', '')
            # If it's "task", convert to INPUT for validation but keep original in data
            if node_type == 'task':
                node['type'] = NodeType.INPUT.value
                # Preserve original type in data
                if 'data' not in node:
                    node['data'] = {}
                node['data']['_original_type'] = 'task'
        
        return Workflow(**data)
    
    def delete(self, workflow_id: str) -> bool:
        """
        Delete workflow file
        
        Args:
            workflow_id: Workflow ID
            
        Returns:
            True if deleted, False if not found
        """
        file_path = self.base_path / f"{workflow_id}.workflow.json"
        
        if file_path.exists():
            file_path.unlink()
            return True
        
        return False
    
    def list_all(self) -> List[WorkflowMetadata]:
        """
        List all workflows
        
        Returns:
            List of workflow metadata
        """
        workflows = []
        
        for file_path in self.base_path.glob("*.workflow.json"):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                workflows.append(WorkflowMetadata(
                    id=data['id'],
                    name=data['name'],
                    description=data.get('description'),
                    node_count=len(data.get('nodes', [])),
                    created_at=data.get('created_at'),
                    updated_at=data.get('updated_at')
                ))
            except Exception as e:
                print(f"Error loading workflow {file_path}: {e}")
                continue
        
        # Sort by updated_at (most recent first)
        workflows.sort(key=lambda w: w.updated_at or "", reverse=True)
        
        return workflows
    
    def exists(self, workflow_id: str) -> bool:
        """
        Check if workflow exists
        
        Args:
            workflow_id: Workflow ID
            
        Returns:
            True if exists, False otherwise
        """
        file_path = self.base_path / f"{workflow_id}.workflow.json"
        return file_path.exists()

