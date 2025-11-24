# Generation Skills

## Overview
Generation skills enable agents to create content, documents, and structured outputs.

## Skills

### Scientific Writing
**ID**: `scientific_writing`  
**Type**: `built_in`  
**Category**: `generation`  
**Complexity**: `advanced`

**Description**: Generate scientific and medical documents with proper structure and terminology.

**Usage**: Creating protocols, reports, publications, regulatory submissions

---

### Report Generation
**ID**: `report_generation`  
**Type**: `custom`  
**Category**: `generation`  
**Complexity**: `intermediate`

**Description**: Generate structured reports from data and analysis.

**Usage Example**:
```python
result = await execute_skill(
    skill_id="report_generation",
    context={
        "data": analysis_results,
        "format": "executive_summary",
        "include_visualizations": True
    }
)
```

---

### Code Generation
**ID**: `code_generation`  
**Type**: `built_in`  
**Category**: `generation`  
**Complexity**: `advanced`

**Description**: Generate code snippets, scripts, or complete modules.

**Usage**: Automation, tooling, analysis scripts

**Best Practices**:
- Include error handling
- Add documentation
- Follow language conventions
- Test generated code

---

## See Also
- [Communication Skills](./communication_skills.md)
- [Validation Skills](./validation_skills.md)

