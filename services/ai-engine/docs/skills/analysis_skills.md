# Analysis Skills

## Overview
Analysis skills enable agents to process, analyze, and synthesize information from multiple sources.

## Skills

### Clinical Data Analysis
**ID**: `clinical_data_analysis`  
**Type**: `custom`  
**Category**: `analysis`  
**Complexity**: `expert`

**Description**: Analyze clinical trial data, perform statistical analysis, and generate insights.

**Usage Example**:
```python
result = await execute_skill(
    skill_id="clinical_data_analysis",
    context={
        "data": clinical_data,
        "analysis_type": "efficacy",
        "parameters": {"confidence_level": 0.95}
    }
)
```

**Returns**: Statistical analysis results with confidence intervals

---

### Evidence Synthesis
**ID**: `evidence_synthesis`  
**Type**: `built_in`  
**Category**: `analysis`  
**Complexity**: `advanced`

**Description**: Synthesize evidence from multiple sources into coherent conclusions.

**Usage**: Combining research findings, expert opinions, and data

---

### Trend Analysis
**ID**: `trend_analysis`  
**Type**: `custom`  
**Category**: `analysis`  
**Complexity**: `intermediate`

**Description**: Identify patterns and trends in data over time.

**Usage**: Market analysis, safety signal detection, performance metrics

**Best Practices**:
- Use sufficient data points
- Consider seasonality and external factors
- Validate statistical significance
- Account for confounding variables

---

## See Also
- [Search Skills](./search_skills.md)
- [Validation Skills](./validation_skills.md)

