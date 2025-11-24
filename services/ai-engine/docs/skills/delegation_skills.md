# Delegation Skills

## Overview
Delegation skills enable Master and Expert agents to assign tasks to appropriate specialist and worker agents based on capabilities, workload, and domain expertise.

## Skills

### Delegate Task
**ID**: `delegate_task`  
**Type**: `custom`  
**Category**: `delegation`  
**Complexity**: `advanced`

**Description**: Delegate sub-tasks to appropriate specialist sub-agents based on their capabilities and current workload.

**Usage Example**:
```python
result = await execute_skill(
    skill_id="delegate_task",
    context={
        "task": "Analyze clinical trial data",
        "required_expertise": "biostatistics",
        "priority": "high"
    }
)
```

**Returns**: Agent assignment with delegation metadata

**Best Practices**:
- Match task complexity to agent level
- Consider agent availability
- Provide clear task specifications
- Set appropriate deadlines

---

### Spawn Specialist
**ID**: `spawn_specialist`  
**Type**: `custom`  
**Category**: `delegation`  
**Complexity**: `expert`

**Description**: Dynamically spawn specialist sub-agent (Level 3) for specific domain expertise.

**Usage**: For complex domain-specific tasks requiring specialized knowledge

---

### Spawn Worker
**ID**: `spawn_worker`  
**Type**: `custom`  
**Category**: `delegation`  
**Complexity**: `intermediate`

**Description**: Spawn worker agent (Level 4) for parallel task execution.

**Usage**: For routine, parallelizable tasks

---

## See Also
- [Planning Skills](./planning_skills.md)
- [Execution Skills](./execution_skills.md)

