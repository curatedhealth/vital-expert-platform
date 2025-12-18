"""
L2 Process & Workflow Service

Service for managing workflow templates, stages, and task definitions.
"""

from typing import Optional, List, Dict, Any
from ..base import OntologyLayerService
from .models import (
    WorkflowTemplate,
    WorkflowStage,
    WorkflowTask,
    ProcessContext,
)


class L2ProcessService(OntologyLayerService[WorkflowTemplate]):
    """
    Service for L2 Process & Workflow layer.

    Provides operations for:
    - Workflow template management
    - Stage definitions
    - Task specifications
    - Process recommendations
    """

    @property
    def layer_name(self) -> str:
        return "l2_process"

    @property
    def primary_table(self) -> str:
        return "workflow_templates"

    def _to_model(self, data: Dict[str, Any]) -> WorkflowTemplate:
        return WorkflowTemplate(**data)

    # -------------------------------------------------------------------------
    # Workflow Template Operations
    # -------------------------------------------------------------------------

    async def get_workflow_templates(
        self,
        function_id: Optional[str] = None,
        category: Optional[str] = None
    ) -> List[WorkflowTemplate]:
        """Get workflow templates, optionally filtered."""
        try:
            query = self.supabase.table(self.primary_table)\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("is_active", True)\
                .eq("is_template", True)

            if category:
                query = query.eq("category", category)

            result = await query.order("name").execute()
            templates = [self._to_model(row) for row in result.data]

            # Filter by function if specified
            if function_id:
                templates = [t for t in templates if function_id in t.function_ids]

            return templates
        except Exception as e:
            print(f"Error fetching workflow templates: {e}")
            return []

    async def find_relevant_templates(
        self,
        query: str,
        function_id: Optional[str] = None,
        limit: int = 5
    ) -> List[WorkflowTemplate]:
        """Find workflow templates relevant to a query."""
        try:
            # Get all templates
            templates = await self.get_workflow_templates(function_id=function_id)

            if not templates:
                return []

            query_lower = query.lower()
            scored_templates = []

            for template in templates:
                score = 0

                # Name match
                if template.name.lower() in query_lower:
                    score += 10
                elif any(word in query_lower for word in template.name.lower().split()):
                    score += 5

                # Description match
                if template.description:
                    if any(word in query_lower for word in template.description.lower().split()[:20]):
                        score += 3

                # Category match
                if template.category.lower() in query_lower:
                    score += 4

                if score > 0:
                    scored_templates.append((score, template))

            # Sort by score and return top N
            scored_templates.sort(key=lambda x: x[0], reverse=True)
            return [t for _, t in scored_templates[:limit]]

        except Exception as e:
            print(f"Error finding relevant templates: {e}")
            return []

    # -------------------------------------------------------------------------
    # Stage Operations
    # -------------------------------------------------------------------------

    async def get_workflow_stages(
        self,
        workflow_template_id: str
    ) -> List[WorkflowStage]:
        """Get stages for a workflow template."""
        try:
            result = await self.supabase.table("workflow_stages")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("workflow_template_id", workflow_template_id)\
                .eq("is_active", True)\
                .order("sequence_order")\
                .execute()

            return [WorkflowStage(**row) for row in result.data]
        except Exception as e:
            print(f"Error fetching workflow stages: {e}")
            return []

    # -------------------------------------------------------------------------
    # Task Operations
    # -------------------------------------------------------------------------

    async def get_stage_tasks(
        self,
        stage_id: str
    ) -> List[WorkflowTask]:
        """Get tasks for a workflow stage."""
        try:
            result = await self.supabase.table("workflow_tasks")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("stage_id", stage_id)\
                .eq("is_active", True)\
                .order("sequence_order")\
                .execute()

            return [WorkflowTask(**row) for row in result.data]
        except Exception as e:
            print(f"Error fetching stage tasks: {e}")
            return []

    # -------------------------------------------------------------------------
    # Context Resolution
    # -------------------------------------------------------------------------

    async def resolve_process(
        self,
        query: str,
        function_id: Optional[str] = None,
        role_id: Optional[str] = None
    ) -> ProcessContext:
        """
        Resolve process context for a query.

        Args:
            query: User query
            function_id: Optional function filter
            role_id: Optional role filter

        Returns:
            ProcessContext with relevant workflows and tasks
        """
        context = ProcessContext()

        # Find relevant templates
        context.workflow_templates = await self.find_relevant_templates(
            query=query,
            function_id=function_id,
            limit=3
        )

        # If we have templates, get their stages
        if context.workflow_templates:
            recommended = context.workflow_templates[0]
            context.recommended_workflow_id = recommended.id

            stages = await self.get_workflow_stages(recommended.id)
            context.relevant_stages = stages

            # Get tasks for first stage
            if stages:
                tasks = await self.get_stage_tasks(stages[0].id)
                context.relevant_tasks = tasks

                # Recommend runner family from first AI task
                for task in tasks:
                    if task.runner_family:
                        context.recommended_runner_family = task.runner_family
                        break

        # Calculate confidence
        confidence = 0.0
        if context.workflow_templates:
            confidence += 0.5
        if context.relevant_stages:
            confidence += 0.3
        if context.relevant_tasks:
            confidence += 0.2
        context.confidence_score = confidence

        return context
