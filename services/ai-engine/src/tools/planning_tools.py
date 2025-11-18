"""
Planning Tools for Deep Agent Architecture

Provides LangChain tools for task decomposition and delegation:
- write_todos: Break down complex tasks into actionable sub-tasks
- delegate_task: Delegate tasks to spawned sub-agents

These tools enable deep agents to:
1. Analyze task complexity
2. Decompose into specialized sub-tasks
3. Spawn appropriate sub-agents (specialist, worker, tool)
4. Execute tasks in parallel or sequence
5. Aggregate and synthesize results
"""

from langchain.tools import BaseTool
from typing import List, Dict, Optional
import structlog
import json
from pydantic import Field

logger = structlog.get_logger()


class WriteToDosTool(BaseTool):
    """
    Planning tool for breaking down complex tasks into sub-tasks.

    Enables deep agents to decompose work and spawn sub-agents.

    Use cases:
    - Multi-step regulatory submissions
    - Comprehensive clinical trial designs
    - Complex market access strategies
    - Multi-jurisdictional regulatory analysis
    """

    name: str = "write_todos"
    description: str = """Break down a complex task into actionable sub-tasks.

Use this when you encounter a multi-step problem that requires:
- Multiple specialist sub-agents with different expertise
- Parallel execution of independent tasks
- Sequential dependencies between tasks
- Coordination of different domain experts

Input: Task description and context
Output: Structured task breakdown with sub-tasks, types, dependencies, and execution plan

Example:
Input: "Prepare FDA 510(k) submission for Class II medical device"
Output: {
  "sub_tasks": [
    {
      "id": "task_1",
      "description": "Identify predicate devices",
      "type": "specialist",
      "specialty": "FDA 510(k) Predicate Search",
      "dependencies": [],
      "priority": "high"
    },
    {
      "id": "task_2",
      "description": "Substantial equivalence analysis",
      "type": "specialist",
      "specialty": "510(k) Substantial Equivalence",
      "dependencies": ["task_1"],
      "priority": "high"
    },
    ...
  ],
  "execution_plan": "sequential"
}
"""

    def _run(self, task: str, context: Dict = None) -> Dict:
        """Synchronous execution (not used in async workflows)."""
        raise NotImplementedError("Use async version (_arun)")

    async def _arun(
        self,
        task: str,
        context: Optional[Dict] = None
    ) -> Dict[str, any]:
        """
        Break down task using LLM to generate structured sub-tasks.

        Args:
            task: Complex task to decompose
            context: Additional context (query, session data, etc.)

        Returns:
            {
                "sub_tasks": [
                    {
                        "id": "task_1",
                        "description": "...",
                        "type": "specialist|worker|tool",
                        "specialty": "...",
                        "dependencies": [],
                        "estimated_time": "...",
                        "priority": "high|medium|low",
                        "tools": []  # For tool agents
                    },
                    ...
                ],
                "execution_plan": "sequential|parallel|hybrid",
                "estimated_total_time": "...",
                "complexity_score": 0-10
            }
        """
        from langchain_openai import ChatOpenAI

        logger.info(
            "Task decomposition started",
            task_preview=task[:100]
        )

        llm = ChatOpenAI(model="gpt-4", temperature=0.3)

        prompt = f"""Analyze this complex task and break it down into structured sub-tasks for a deep agent system.

**Task:** {task}

**Context:** {json.dumps(context or {}, indent=2)}

**Available Sub-Agent Types:**
1. **Specialist** (Level 3): Domain-specific experts for specialized sub-tasks
   - Examples: "FDA 510(k) Predicate Search", "Clinical Endpoint Selection", "EMA MDR Classification"

2. **Worker** (Level 4): Parallel task executors for independent work
   - Examples: "Literature search", "Data analysis", "Document generation"

3. **Tool** (Level 5): Specialized tool agents
   - Examples: "PubMed search + analysis", "Statistical calculations", "Regulatory database queries"

**Instructions:**
1. Identify 3-8 key sub-tasks needed to complete the overall task
2. For each sub-task, specify:
   - Clear, actionable description
   - Type (specialist/worker/tool)
   - Specialty area (for specialists)
   - Dependencies on other tasks (by task_id)
   - Estimated completion time
   - Priority level (high/medium/low)
   - Required tools (for tool agents)

3. Determine execution plan:
   - **Sequential**: Tasks must run in order (dependencies exist)
   - **Parallel**: Tasks can run simultaneously (no dependencies)
   - **Hybrid**: Mix of sequential and parallel execution

4. Assess overall complexity (0-10 scale):
   - 0-3: Simple, few dependencies
   - 4-7: Moderate, some coordination needed
   - 8-10: Complex, extensive coordination required

**Output Format:**
Return ONLY valid JSON matching this exact structure:
{{
  "sub_tasks": [
    {{
      "id": "task_1",
      "description": "Specific, actionable description",
      "type": "specialist|worker|tool",
      "specialty": "Domain specialty (for specialists)",
      "dependencies": ["task_id1", "task_id2"],
      "estimated_time": "5 minutes|30 minutes|2 hours",
      "priority": "high|medium|low",
      "tools": ["tool1", "tool2"]
    }}
  ],
  "execution_plan": "sequential|parallel|hybrid",
  "estimated_total_time": "Overall time estimate",
  "complexity_score": 0-10,
  "rationale": "Brief explanation of the breakdown"
}}
"""

        try:
            response = await llm.ainvoke([{"role": "user", "content": prompt}])

            # Extract JSON from response
            content = response.content.strip()

            # Remove markdown code blocks if present
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]

            task_breakdown = json.loads(content.strip())

            logger.info(
                "Task decomposition completed",
                subtask_count=len(task_breakdown.get("sub_tasks", [])),
                execution_plan=task_breakdown.get("execution_plan"),
                complexity=task_breakdown.get("complexity_score")
            )

            return task_breakdown

        except json.JSONDecodeError as e:
            logger.error(
                "Failed to parse task breakdown JSON",
                error=str(e),
                response_content=response.content[:500]
            )
            # Return fallback structure
            return {
                "sub_tasks": [],
                "execution_plan": "sequential",
                "estimated_total_time": "unknown",
                "complexity_score": 5,
                "error": "Failed to parse task breakdown"
            }

        except Exception as e:
            logger.error(
                "Task decomposition failed",
                error=str(e),
                error_type=type(e).__name__
            )
            return {
                "sub_tasks": [],
                "execution_plan": "sequential",
                "estimated_total_time": "unknown",
                "complexity_score": 5,
                "error": str(e)
            }


class DelegateTaskTool(BaseTool):
    """
    Tool for delegating tasks to sub-agents.

    Works in conjunction with write_todos to spawn appropriate sub-agents
    and execute delegated tasks.
    """

    name: str = "delegate_task"
    description: str = """Delegate a sub-task to a specialist sub-agent.

Use this after breaking down a complex task with write_todos.
Spawns the appropriate sub-agent type (specialist/worker/tool) and executes the delegated task.

Input: Sub-task definition from write_todos
Output: Sub-agent execution result

Example:
Input: {
  "id": "task_1",
  "description": "Identify FDA 510(k) predicate devices",
  "type": "specialist",
  "specialty": "FDA 510(k) Predicate Search"
}
Output: {
  "sub_task_id": "task_1",
  "result": {...},
  "confidence": 0.92,
  "execution_time_ms": 3500
}
"""

    # Sub-agent spawner injected at initialization
    spawner: any = Field(default=None, exclude=True)

    def __init__(self, sub_agent_spawner=None):
        """
        Initialize delegate task tool.

        Args:
            sub_agent_spawner: SubAgentSpawner instance
        """
        super().__init__()
        self.spawner = sub_agent_spawner

        # Lazy load spawner if not provided
        if self.spawner is None:
            from services.sub_agent_spawner import get_sub_agent_spawner
            self.spawner = get_sub_agent_spawner()

    def _run(
        self,
        sub_task: Dict,
        parent_agent_id: str,
        context: Dict
    ) -> Dict:
        """Synchronous execution (not used)."""
        raise NotImplementedError("Use async version (_arun)")

    async def _arun(
        self,
        sub_task: Dict,
        parent_agent_id: str,
        context: Dict
    ) -> Dict:
        """
        Delegate task to spawned sub-agent.

        Args:
            sub_task: Task definition from write_todos
            parent_agent_id: ID of delegating agent (Level 2)
            context: Execution context

        Returns:
            {
                "sub_task_id": "task_1",
                "result": Sub-agent response,
                "confidence": Confidence score,
                "execution_time_ms": Execution time
            }
        """
        logger.info(
            "Delegating task to sub-agent",
            sub_task_id=sub_task.get("id"),
            task_type=sub_task.get("type"),
            specialty=sub_task.get("specialty")
        )

        try:
            # Spawn appropriate sub-agent type
            sub_agent_id = None

            if sub_task["type"] == "specialist":
                sub_agent_id = await self.spawner.spawn_specialist(
                    parent_agent_id=parent_agent_id,
                    task=sub_task["description"],
                    specialty=sub_task["specialty"],
                    context=context
                )

            elif sub_task["type"] == "worker":
                [sub_agent_id] = await self.spawner.spawn_workers(
                    parent_agent_id=parent_agent_id,
                    tasks=[sub_task["description"]],
                    context=context
                )

            elif sub_task["type"] == "tool":
                sub_agent_id = await self.spawner.spawn_tool_agent(
                    parent_agent_id=parent_agent_id,
                    task=sub_task["description"],
                    tools=sub_task.get("tools", []),
                    context=context
                )
            else:
                raise ValueError(f"Unknown sub-agent type: {sub_task['type']}")

            # Execute sub-agent
            result = await self.spawner.execute_sub_agent(sub_agent_id)

            # Cleanup (terminate sub-agent)
            await self.spawner.terminate_sub_agent(sub_agent_id)

            logger.info(
                "Task delegation completed",
                sub_task_id=sub_task.get("id"),
                sub_agent_id=sub_agent_id,
                success=result.success,
                execution_time_ms=result.execution_time_ms
            )

            return {
                "sub_task_id": sub_task.get("id"),
                "result": result.result,
                "confidence": result.confidence,
                "execution_time_ms": result.execution_time_ms,
                "success": result.success,
                "error": result.error
            }

        except Exception as e:
            logger.error(
                "Task delegation failed",
                sub_task_id=sub_task.get("id"),
                error=str(e),
                error_type=type(e).__name__
            )

            return {
                "sub_task_id": sub_task.get("id"),
                "result": {},
                "confidence": 0.0,
                "execution_time_ms": 0,
                "success": False,
                "error": str(e)
            }


# Tool instances for export
def get_planning_tools(sub_agent_spawner=None) -> List[BaseTool]:
    """
    Get planning tools for deep agent workflows.

    Args:
        sub_agent_spawner: Optional SubAgentSpawner instance

    Returns:
        List of planning tools [write_todos, delegate_task]
    """
    return [
        WriteToDosTool(),
        DelegateTaskTool(sub_agent_spawner)
    ]
