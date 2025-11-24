# Communication Skills

## Overview
Communication skills enable agents to interact effectively with users, stakeholders, and other agents.

## Skills

### Scientific Communication
**ID**: `scientific_communication`  
**Type**: `built_in`  
**Category**: `communication`  
**Complexity**: `advanced`

**Description**: Present complex scientific information clearly to various audiences.

**Usage Example**:
```python
result = await execute_skill(
    skill_id="scientific_communication",
    context={
        "content": technical_data,
        "audience": "non-technical stakeholders",
        "format": "executive_summary"
    }
)
```

---

### Stakeholder Reporting
**ID**: `stakeholder_reporting`  
**Type**: `custom`  
**Category**: `communication`  
**Complexity**: `intermediate`

**Description**: Create reports tailored to specific stakeholder needs and expertise levels.

**Usage**: Executive summaries, board presentations, team updates

---

### Meeting Facilitation
**ID**: `meeting_facilitation`  
**Type**: `custom`  
**Category**: `communication`  
**Complexity**: `intermediate`

**Description**: Structure and facilitate productive meetings and discussions.

**Usage**: Panel discussions, consensus building, decision-making sessions

**Best Practices**:
- Set clear objectives
- Create structured agendas
- Manage time effectively
- Document decisions and action items
- Follow up on commitments

---

## See Also
- [Generation Skills](./generation_skills.md)
- [Delegation Skills](./delegation_skills.md)

