# Execution Skills

## Overview
Execution skills enable agents to perform actions, run processes, and execute workflows.

## Skills

### Workflow Execution
**ID**: `execute_workflow`  
**Type**: `custom`  
**Category**: `execution`  
**Complexity**: `advanced`

**Description**: Execute multi-step workflows with state management and error handling.

**Usage Example**:
```python
result = await execute_skill(
    skill_id="execute_workflow",
    context={
        "workflow_id": "regulatory_submission",
        "parameters": {...},
        "async_execution": True
    }
)
```

**Returns**: Workflow execution status and results

---

### Task Execution
**ID**: `execute_task`  
**Type**: `built_in`  
**Category**: `execution`  
**Complexity**: `intermediate`

**Description**: Execute individual tasks with input validation and result verification.

**Usage**: Running scripts, calling APIs, performing calculations

---

### Parallel Execution
**ID**: `parallel_execution`  
**Type**: `custom`  
**Category**: `execution`  
**Complexity**: `advanced`

**Description**: Execute multiple tasks in parallel for improved performance.

**Usage Example**:
```python
result = await execute_skill(
    skill_id="parallel_execution",
    context={
        "tasks": [task1, task2, task3],
        "max_concurrent": 5,
        "fail_fast": False
    }
)
```

**Best Practices**:
- Set appropriate concurrency limits
- Handle partial failures gracefully
- Aggregate results correctly
- Monitor resource usage

---

### Scheduled Execution
**ID**: `scheduled_execution`  
**Type**: `custom`  
**Category**: `execution`  
**Complexity**: `intermediate`

**Description**: Schedule tasks for future execution with cron-like syntax.

**Usage**: Batch jobs, periodic reports, automated workflows

---

## Error Handling
All execution skills include:
- Retry logic with exponential backoff
- Error logging and alerting
- Rollback capabilities
- Status tracking

## See Also
- [Planning Skills](./planning_skills.md)
- [Delegation Skills](./delegation_skills.md)
- [Validation Skills](./validation_skills.md)

