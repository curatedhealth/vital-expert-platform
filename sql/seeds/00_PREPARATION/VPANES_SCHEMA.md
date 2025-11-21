# VPANES Scoring Schema - Actual Database Structure

**Date**: 2025-11-16

---

## persona_vpanes_scoring Table

**Columns**: 14 total

### Identity Columns
- `id` (uuid) - Primary key
- `persona_id` (uuid) - Foreign key to personas
- `tenant_id` (uuid) - Tenant isolation

### VPANES Dimension Scores (6 scores)
- `value_score` (numeric) - Value dimension (0-10)
- `priority_score` (numeric) - Priority dimension (0-10)
- `addressability_score` (numeric) - Addressability dimension (0-10)
- `need_score` (numeric) - Need dimension (0-10)
- `engagement_score` (numeric) - Engagement dimension (0-10)
- `scale_score` (numeric) - Scale dimension (0-10)

### Aggregate Scores
- `total_score` (numeric) - **Sum or average of dimension scores**
- `priority_tier` (text) - **Categorization (e.g., 'high', 'medium', 'low')**

### Supporting Data
- `scoring_rationale` (text) - Explanation of scores

### Timestamps
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

---

## Important Notes

### Column Names
- ✅ Use `total_score` (NOT `overall_score`)
- ✅ Use `priority_tier` for categorization

### VPANES Framework
**V**alue - How valuable is solving this persona's problem?
**P**riority - How urgent is this for the persona?
**A**ddressability - How well can we address this need?
**N**eed - How strong is the persona's need?
**E**ngagement - How engaged is the persona?
**S**cale - How many personas share this profile?

---

## Sample Queries

### Get VPANES Scores for a Persona
```sql
SELECT
    p.name,
    p.title,
    v.value_score,
    v.priority_score,
    v.addressability_score,
    v.need_score,
    v.engagement_score,
    v.scale_score,
    v.total_score,
    v.priority_tier,
    v.scoring_rationale
FROM personas p
JOIN persona_vpanes_scoring v ON v.persona_id = p.id
WHERE p.slug = 'your-persona-slug';
```

### Find High-Priority Personas
```sql
SELECT
    p.name,
    p.title,
    v.total_score,
    v.priority_tier
FROM personas p
JOIN persona_vpanes_scoring v ON v.persona_id = p.id
WHERE v.priority_tier = 'high'
ORDER BY v.total_score DESC;
```

### Get Top Personas by Total Score
```sql
SELECT
    p.name,
    p.title,
    p.seniority_level,
    v.total_score,
    v.priority_tier
FROM personas p
JOIN persona_vpanes_scoring v ON v.persona_id = p.id
ORDER BY v.total_score DESC
LIMIT 10;
```

### Calculate Average Scores by Function
```sql
SELECT
    f.name as function_name,
    COUNT(DISTINCT p.id) as persona_count,
    ROUND(AVG(v.value_score), 2) as avg_value,
    ROUND(AVG(v.priority_score), 2) as avg_priority,
    ROUND(AVG(v.addressability_score), 2) as avg_addressability,
    ROUND(AVG(v.need_score), 2) as avg_need,
    ROUND(AVG(v.engagement_score), 2) as avg_engagement,
    ROUND(AVG(v.scale_score), 2) as avg_scale,
    ROUND(AVG(v.total_score), 2) as avg_total
FROM org_functions f
JOIN personas p ON p.function_id = f.id
JOIN persona_vpanes_scoring v ON v.persona_id = p.id
GROUP BY f.id, f.name
ORDER BY avg_total DESC;
```

---

## JSON Template Structure

When creating persona JSON, use this structure for VPANES:

```json
{
  "vpanes_scoring": {
    "value_score": 8.5,
    "priority_score": 9.0,
    "addressability_score": 7.5,
    "need_score": 8.0,
    "engagement_score": 7.0,
    "scale_score": 6.5,
    "total_score": 46.5,
    "priority_tier": "high",
    "scoring_rationale": "High priority due to strong need and priority scores..."
  }
}
```

---

## Priority Tiers

Common values for `priority_tier`:
- `critical` - Must address immediately
- `high` - Important, address soon
- `medium` - Moderate priority
- `low` - Nice to have
- `deferred` - Future consideration

---

**Schema Version**: Current as of 2025-11-16
**Source**: Database query of persona_vpanes_scoring table
