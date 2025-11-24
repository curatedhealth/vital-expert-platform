# Validation Skills

## Overview
Validation skills ensure quality, compliance, and correctness of outputs and processes.

## Skills

### Regulatory Compliance Check
**ID**: `regulatory_compliance_check`  
**Type**: `custom`  
**Category**: `validation`  
**Complexity**: `expert`

**Description**: Validate content and processes against regulatory requirements.

**Usage Example**:
```python
result = await execute_skill(
    skill_id="regulatory_compliance_check",
    context={
        "content": document,
        "regulations": ["FDA 21 CFR Part 11", "GxP"],
        "jurisdiction": "US"
    }
)
```

**Returns**: Compliance status with identified issues

---

### Data Quality Check
**ID**: `data_quality_check`  
**Type**: `custom`  
**Category**: `validation`  
**Complexity**: `intermediate`

**Description**: Validate data completeness, accuracy, and consistency.

**Usage**: Data validation, ETL processes, quality assurance

---

### Fact Verification
**ID**: `fact_verification`  
**Type**: `built_in`  
**Category**: `validation`  
**Complexity**: `advanced`

**Description**: Verify factual claims against authoritative sources.

**Usage**: Content review, medical claims validation, citation checking

**Best Practices**:
- Use authoritative sources only
- Provide evidence for findings
- Flag uncertain or conflicting information
- Include source citations

---

## See Also
- [Analysis Skills](./analysis_skills.md)
- [Search Skills](./search_skills.md)

