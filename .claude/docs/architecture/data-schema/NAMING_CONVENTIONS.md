# Database Naming Conventions

## Core Principle
All reference tables use a consistent naming pattern: `{table_singular}_name` for the primary name field.

## Reference Table Naming Patterns

### Organizational Entities
- `tenants.tenant_name`
- `org_functions.function_name`
- `org_departments.department_name`
- `org_roles.role_name`
- `personas.persona_name`

### Reference Tables
- `jtbd.jtbd_name` (Job To Be Done)
- `tools.tool_name`
- `skills.skill_name`
- `responsibilities.responsibility_name`
- `stakeholders.stakeholder_name`
- `success_metrics.metric_name`
- `communication_channels.channel_name`
- `geographies.geography_name`

### Specialized Reference Tables
- `ai_maturity_levels.ai_maturity_level_name` or `level_name` (legacy)
- `vpanes_dimensions.dimension_name`

### Agents & Knowledge
- `agents.agent_name`
- `prompts.prompt_name`
- `knowledge_base.knowledge_name`
- `capabilities.capability_name`
- `workflows.workflow_name`

## Rationale

1. **Consistency**: Every table follows the same pattern, making queries predictable
2. **Clarity**: The field name explicitly indicates what entity it describes
3. **Avoid Ambiguity**: No generic `name` fields that could be confused in joins
4. **Self-Documenting**: Code is easier to read when field names are specific
5. **Future-Proof**: Adding new fields or relationships is clearer

## Examples

### Good Practice
```sql
SELECT 
    r.role_name,
    d.department_name,
    f.function_name
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id;
```

### Bad Practice (Avoid)
```sql
SELECT 
    r.name,  -- Which name? Role name? Person name?
    d.name,  -- Ambiguous
    f.name   -- Unclear
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON d.function_id = f.id;
```

## Special Cases

### Legacy Tables
Some existing tables may still use generic `name` fields. When encountered:
- Check if `{table}_name` exists
- If not, add it via ALTER TABLE
- Maintain backward compatibility when possible

### Level/Hierarchy Tables
For tables with hierarchical levels:
- `ai_maturity_levels.ai_maturity_level_name` (or `level_name` for legacy)
- `seniority_levels.seniority_level_name`

### Junction Tables
Junction tables inherit naming from their parent tables:
- `role_tools.tool_name` (denormalized from `tools.tool_name`)
- `persona_skills.skill_name` (denormalized from `skills.skill_name`)

## Migration Strategy

When updating existing tables:
1. Check if table uses legacy `name` field
2. Add new `{table}_name` column if missing
3. Copy data from `name` to `{table}_name`
4. Update all references
5. Optionally deprecate old `name` column (don't drop immediately)

## Enforcement

- All new tables MUST follow this convention
- All CREATE TABLE scripts should use specific naming
- All ALTER TABLE scripts should check for both patterns
- Code reviews should flag generic `name` fields

