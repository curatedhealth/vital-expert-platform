# Planning Skills

## Overview
Planning skills enable agents to create structured plans, break down complex tasks, and coordinate multi-step workflows. These skills are essential for Master and Expert level agents that need to delegate and orchestrate work.

## Skills

### Write TODOs
**ID**: `write_todos`  
**Type**: `built_in`  
**Category**: `planning`  
**Complexity**: `advanced`

**Description**: Create and manage structured task lists with todos for complex workflows. This skill helps agents plan multi-step tasks and track progress.

**Usage Example**:
```python
result = await execute_skill(
    skill_id="write_todos",
    context={
        "query": "Implement user authentication system",
        "state": current_state
    }
)
```

**Parameters**:
- `task_description`: Main task to break down
- `context`: Additional context for planning
- `max_todos`: Maximum number of todos to create (default: 10)

**Returns**:
```json
{
  "success": true,
  "todos": [
    {
      "id": "1",
      "title": "Design database schema",
      "status": "pending",
      "priority": "high"
    },
    {
      "id": "2",
      "title": "Implement password hashing",
      "status": "pending",
      "priority": "high"
    }
  ],
  "total_count": 5
}
```

**Best Practices**:
- Use for complex tasks requiring 3+ steps
- Create specific, actionable todos
- Set realistic priorities
- Include dependencies when relevant

**Limitations**:
- Limited to planning; doesn't execute tasks
- Requires clear task description
- May need human review for complex scenarios

---

### Create Plan
**ID**: `create_plan`  
**Type**: `built_in`  
**Category**: `planning`  
**Complexity**: `expert`

**Description**: Generate comprehensive execution plans with steps, dependencies, and resource requirements.

**Usage Example**:
```python
result = await execute_skill(
    skill_id="create_plan",
    context={
        "objective": "Launch new product feature",
        "constraints": {"timeline": "2 weeks", "team_size": 3}
    }
)
```

**Parameters**:
- `objective`: Goal to achieve
- `constraints`: Resource and time constraints
- `stakeholders`: List of involved parties

**Returns**:
```json
{
  "success": true,
  "plan": {
    "phases": [...],
    "dependencies": [...],
    "resources_needed": [...]
  }
}
```

**Best Practices**:
- Consider dependencies between tasks
- Account for resource availability
- Include milestones and checkpoints
- Plan for contingencies

**Limitations**:
- Assumes resources are available
- May not account for all edge cases
- Requires domain expertise for specialized plans

---

## Integration

Planning skills are typically used by:
- **Master Agents** (Level 1): Strategic planning and delegation
- **Expert Agents** (Level 2): Tactical planning for specialized domains
- **Workflows**: Multi-step task orchestration

## See Also
- [Delegation Skills](./delegation_skills.md) - For task assignment
- [Execution Skills](./execution_skills.md) - For plan execution
- [Validation Skills](./validation_skills.md) - For plan verification

