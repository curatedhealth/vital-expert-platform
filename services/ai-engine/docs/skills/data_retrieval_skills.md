# Data Retrieval Skills

## Overview
Data retrieval skills provide access to external databases, APIs, and specialized data sources.

## Skills

### FDA Database Search
**ID**: `fda_database_search`  
**Type**: `custom`  
**Category**: `data_retrieval`  
**Complexity**: `advanced`

**Description**: Search FDA databases (510k, PMA, recalls, guidances) for regulatory information.

**Usage Example**:
```python
result = await execute_skill(
    skill_id="fda_database_search",
    context={
        "query": "cardiac stents",
        "database": "510k",
        "date_range": {"start": "2020-01-01", "end": "2024-01-01"}
    }
)
```

**Returns**: FDA records with metadata and links

---

### EMA Database Search
**ID**: `ema_database_search`  
**Type**: `custom`  
**Category**: `data_retrieval`  
**Complexity**: `advanced`

**Description**: Search EMA databases for European regulatory information and guidances.

**Usage**: European market approval, guidelines, safety information

---

### PMDA Database Search
**ID**: `pmda_database_search`  
**Type**: `custom`  
**Category**: `data_retrieval`  
**Complexity**: `advanced`

**Description**: Search PMDA databases for Japanese regulatory requirements.

**Usage**: Japan market access, regulatory compliance

---

### Clinical Trials Database
**ID**: `clinical_trials_search`  
**Type**: `custom`  
**Category**: `data_retrieval`  
**Complexity**: `intermediate`

**Description**: Search ClinicalTrials.gov and other trial registries.

**Usage**: Competitive intelligence, research planning, evidence gathering

**Best Practices**:
- Use specific inclusion/exclusion criteria
- Filter by trial status and phase
- Check for recent updates
- Verify data currency

---

## Integration
Data retrieval skills connect to:
- **External APIs**: FDA, EMA, PMDA, ClinicalTrials.gov
- **Authentication**: Handled by tool registry
- **Rate Limiting**: Automatic throttling
- **Caching**: Results cached for performance

## See Also
- [Search Skills](./search_skills.md)
- [Analysis Skills](./analysis_skills.md)

