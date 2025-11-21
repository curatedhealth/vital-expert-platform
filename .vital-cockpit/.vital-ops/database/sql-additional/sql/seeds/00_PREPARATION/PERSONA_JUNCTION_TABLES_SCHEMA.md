# Persona Junction Tables - Actual Schema

**Date**: 2025-11-16
**Source**: Database information_schema

---

## Column Naming Convention

All junction tables use `_text`, `_name`, or `_description` suffixes for main content fields.

---

## 1. persona_goals

**Columns**:
- `goal_text` (text) - The goal description
- `goal_type` (text) - Type/category of goal
- `priority` (integer) - Priority level
- `sequence_order` (integer) - Display order

**Sample Query**:
```sql
SELECT goal_text, goal_type, priority
FROM persona_goals
WHERE persona_id = '<persona_id>'
ORDER BY sequence_order;
```

---

## 2. persona_pain_points

**Columns**:
- `pain_point_text` (text) - The pain point description
- `pain_category` (text) - Category of pain point
- `pain_description` (text) - Detailed description
- `severity` (text) - Severity level (high, medium, low)
- `sequence_order` (integer)

**Sample Query**:
```sql
SELECT pain_point_text, pain_category, severity
FROM persona_pain_points
WHERE persona_id = '<persona_id>'
ORDER BY sequence_order;
```

---

## 3. persona_challenges

**Columns**:
- `challenge_text` (text) - The challenge description
- `challenge_type` (text) - Type of challenge
- `challenge_description` (text) - Detailed description
- `impact_level` (text) - Impact level
- `sequence_order` (integer)

**Sample Query**:
```sql
SELECT challenge_text, challenge_type, impact_level
FROM persona_challenges
WHERE persona_id = '<persona_id>'
ORDER BY sequence_order;
```

---

## 4. persona_responsibilities

**Columns**:
- `responsibility_text` (text) - The responsibility description
- `responsibility_type` (text) - Type of responsibility
- `time_allocation_percent` (integer) - Percentage of time spent
- `sequence_order` (integer)

**Sample Query**:
```sql
SELECT responsibility_text, responsibility_type, time_allocation_percent
FROM persona_responsibilities
WHERE persona_id = '<persona_id>'
ORDER BY sequence_order;
```

---

## 5. persona_frustrations

**Columns**:
- `frustration_text` (text) - The frustration description
- `emotional_intensity` (text) - Intensity level
- `sequence_order` (integer)

**Sample Query**:
```sql
SELECT frustration_text, emotional_intensity
FROM persona_frustrations
WHERE persona_id = '<persona_id>'
ORDER BY sequence_order;
```

---

## 6. persona_quotes

**Columns**:
- `quote_text` (text) - The quote
- `context` (text) - Context of the quote
- `emotion` (text) - Emotional tone
- `sequence_order` (integer)

**Sample Query**:
```sql
SELECT quote_text, context, emotion
FROM persona_quotes
WHERE persona_id = '<persona_id>'
ORDER BY sequence_order;
```

---

## 7. persona_tools

**Columns**:
- `tool_name` (text) - Name of the tool
- `tool_category` (text) - Category (e.g., CRM, productivity)
- `usage_frequency` (text) - How often used
- `proficiency_level` (text) - Skill level
- `satisfaction_level` (text) - Satisfaction rating
- `sequence_order` (integer)

**Sample Query**:
```sql
SELECT tool_name, tool_category, usage_frequency, proficiency_level, satisfaction_level
FROM persona_tools
WHERE persona_id = '<persona_id>'
ORDER BY sequence_order;
```

---

## 8. persona_communication_channels

**Columns**:
- `channel_name` (text) - Channel name (e.g., Email, Slack)
- `preference_level` (text) - Preference rating
- `best_time_of_day` (text) - Optimal contact time
- `best_day_of_week` (text) - Optimal contact day
- `response_time_expectation` (text) - Expected response time
- `sequence_order` (integer)

**Sample Query**:
```sql
SELECT channel_name, preference_level, best_time_of_day, response_time_expectation
FROM persona_communication_channels
WHERE persona_id = '<persona_id>'
ORDER BY sequence_order;
```

---

## 9. persona_decision_makers

**Columns**:
- `decision_maker_role` (text) - Role of decision maker
- `stakeholder_role` (text) - Stakeholder role
- `influence_level` (text) - Level of influence
- `relationship_quality` (text) - Quality of relationship
- `sequence_order` (integer)

**Sample Query**:
```sql
SELECT decision_maker_role, stakeholder_role, influence_level, relationship_quality
FROM persona_decision_makers
WHERE persona_id = '<persona_id>'
ORDER BY sequence_order;
```

---

## 10. persona_success_metrics

**Columns**:
- `metric_name` (text) - Name of metric
- `metric_description` (text) - Description of metric
- `sequence_order` (integer)

**Sample Query**:
```sql
SELECT metric_name, metric_description
FROM persona_success_metrics
WHERE persona_id = '<persona_id>'
ORDER BY sequence_order;
```

---

## Common Patterns

### All Junction Tables Have:
- `id` (uuid) - Primary key
- `persona_id` (uuid) - Foreign key to personas
- `tenant_id` (uuid) - Tenant isolation
- `sequence_order` (integer) - Display order
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

### Main Content Fields Use:
- `_text` suffix for primary content (e.g., `goal_text`, `pain_point_text`)
- `_name` suffix for names (e.g., `tool_name`, `channel_name`)
- `_description` suffix for detailed descriptions
- `_type` or `_category` for categorization
- `_level` for ratings/intensities

---

## Important Notes

### ❌ Do NOT Use:
- `goal` (use `goal_text`)
- `pain_point` (use `pain_point_text`)
- `challenge` (use `challenge_text`)
- `tool` (use `tool_name`)
- `channel` (use `channel_name`)

### ✅ Always Use:
- Full column names with suffixes
- `sequence_order` for ordering
- `persona_id` for filtering

---

## Updated Example Queries

### Get All Goals for a Persona
```sql
SELECT
    goal_text,
    goal_type,
    priority
FROM persona_goals
WHERE persona_id = (SELECT id FROM personas WHERE slug = 'your-persona-slug')
ORDER BY sequence_order;
```

### Get Tools with High Satisfaction
```sql
SELECT
    p.name as persona_name,
    t.tool_name,
    t.tool_category,
    t.satisfaction_level
FROM personas p
JOIN persona_tools t ON t.persona_id = p.id
WHERE t.satisfaction_level IN ('high', 'very high')
ORDER BY p.name, t.sequence_order;
```

### Get Top Pain Points by Severity
```sql
SELECT
    p.name as persona_name,
    pp.pain_point_text,
    pp.severity
FROM personas p
JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE pp.severity = 'high'
ORDER BY p.name, pp.sequence_order;
```

---

**Schema Version**: Current as of 2025-11-16
**Verified Against**: Database information_schema
**Status**: Production schema
