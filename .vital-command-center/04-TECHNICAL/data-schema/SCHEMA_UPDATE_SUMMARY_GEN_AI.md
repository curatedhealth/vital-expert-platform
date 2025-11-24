# Persona Schema Update Summary - Gen AI Attributes
## Version 4.0 → 4.1 Migration

**Date**: 2025-01-27  
**Migration File**: `migrate_persona_schema_gen_ai_attributes.sql`  
**Purpose**: Add Gen AI opportunity discovery and mapping capabilities

---

## 📋 Overview

This migration adds comprehensive Gen AI opportunity attributes to the existing normalized persona schema, enabling:

1. **Gen AI Opportunity Discovery** - Identify opportunities from pain points, goals, and JTBDs
2. **Archetype-Specific Mapping** - Map opportunities to archetypes with different scores
3. **Service Layer Routing** - Determine which service layers are needed for each opportunity
4. **Usage Tracking** - Track actual service layer usage by personas
5. **Readiness Assessment** - Auto-calculate Gen AI readiness levels

---

## 🆕 New Enumerations

### 1. `gen_ai_opportunity_type`
Types of Gen AI opportunities:
- `automation` - Workflow automation, template generation
- `augmentation` - Intelligence augmentation, multi-agent reasoning
- `learning` - Guided learning, progressive complexity
- `transparency` - Trust building, validation, citations
- `integration` - Cross-functional, multi-service layer

### 2. `service_layer_preference`
Preferred service layer for personas:
- `ASK_EXPERT` - Single-agent Q&A
- `ASK_PANEL` - Multi-agent reasoning
- `WORKFLOWS` - Automated workflows
- `SOLUTION_BUILDER` - Integrated solutions
- `MIXED` - Uses multiple service layers

### 3. `gen_ai_readiness_level`
Gen AI readiness assessment:
- `not_ready` (0-25) - Low readiness
- `exploring` (26-50) - Exploring, learning
- `ready` (51-75) - Ready for adoption
- `advanced` (76-100) - Advanced user

---

## 📊 New Columns Added

### `personas` Table (8 new columns)

| Column | Type | Purpose |
|---|---|---|
| `gen_ai_readiness_level` | `gen_ai_readiness_level` | Auto-calculated readiness level |
| `preferred_service_layer` | `service_layer_preference` | Inferred from archetype |
| `gen_ai_adoption_score` | `DECIMAL(5,2)` | 0-100: Likelihood to adopt |
| `gen_ai_usage_frequency` | `VARCHAR(50)` | 'never', 'rarely', 'weekly', 'daily', 'constant' |
| `gen_ai_trust_score` | `DECIMAL(5,2)` | 0-100: Trust level in Gen AI |
| `gen_ai_primary_use_case` | `VARCHAR(100)` | 'automation', 'research', 'analysis', etc. |
| `gen_ai_barriers` | `TEXT[]` | Array of barriers |
| `gen_ai_enablers` | `TEXT[]` | Array of enablers |

### `opportunities` Table (6 new columns)

| Column | Type | Purpose |
|---|---|---|
| `gen_ai_opportunity_type` | `gen_ai_opportunity_type` | Type of Gen AI opportunity |
| `estimated_roi_multiplier` | `DECIMAL(5,2)` | ROI multiplier by archetype |
| `implementation_complexity` | `VARCHAR(50)` | 'low', 'medium', 'high', 'very_high' |
| `time_to_value_weeks` | `INTEGER` | Weeks to see value |
| `requires_training` | `BOOLEAN` | Whether training is needed |
| `requires_approval` | `BOOLEAN` | Whether approval is needed |

### `persona_pain_points` Table (4 new columns)

| Column | Type | Purpose |
|---|---|---|
| `gen_ai_opportunity_type` | `gen_ai_opportunity_type` | Opportunity type from pain point |
| `gen_ai_addressability_score` | `DECIMAL(5,2)` | 0-100: How well Gen AI can address |
| `recommended_service_layer` | `service_layer` | Recommended service layer |
| `estimated_time_savings_hours` | `DECIMAL(8,2)` | Estimated time savings |

### `persona_goals` Table (4 new columns)

| Column | Type | Purpose |
|---|---|---|
| `gen_ai_assistance_type` | `gen_ai_opportunity_type` | Type of Gen AI assistance |
| `gen_ai_assistance_score` | `DECIMAL(5,2)` | 0-100: How much Gen AI can help |
| `recommended_service_layer` | `service_layer` | Recommended service layer |
| `estimated_goal_achievement_improvement` | `DECIMAL(5,2)` | 0-100: Improvement percentage |

---

## 🗄️ New Tables

### 1. `opportunity_archetypes`
Maps opportunities to archetypes with archetype-specific scoring.

**Key Columns:**
- `opportunity_id` + `archetype` (unique)
- `priority_score` (0-100): How important for this archetype
- `estimated_adoption_rate` (0-100): % likely to adopt
- `estimated_roi_multiplier`: ROI multiplier (e.g., 1.5x for Automators)
- `primary_service_layer`: Primary service layer for this combination

**Use Case:**
```sql
-- Find top opportunities for Automators
SELECT o.opportunity_name, oa.priority_score, oa.estimated_adoption_rate
FROM opportunities o
JOIN opportunity_archetypes oa ON o.opportunity_id = oa.opportunity_id
WHERE oa.archetype = 'AUTOMATOR'
ORDER BY oa.priority_score DESC;
```

### 2. `opportunity_service_layers`
Maps opportunities to required/optional service layers.

**Key Columns:**
- `opportunity_id` + `service_layer` (unique)
- `is_primary`: Primary service layer
- `is_required`: Required vs optional
- `priority`: 1-4 (higher = more important)
- `implementation_effort`: 'low', 'medium', 'high'

**Use Case:**
```sql
-- Find all service layers needed for an opportunity
SELECT service_layer, is_primary, is_required, priority
FROM opportunity_service_layers
WHERE opportunity_id = '...'
ORDER BY priority;
```

### 3. `persona_service_layer_usage`
Tracks actual service layer usage by personas.

**Key Columns:**
- `persona_id` + `service_layer` (unique)
- `usage_frequency`: 'never', 'rarely', 'weekly', 'daily', 'constant'
- `usage_count_last_30_days`: Actual usage count
- `satisfaction_score`: 0-5 stars
- `barriers_encountered`: Array of barriers

**Use Case:**
```sql
-- Find service layer adoption by archetype
SELECT p.archetype, psl.service_layer, 
       COUNT(*) as persona_count,
       AVG(psl.satisfaction_score) as avg_satisfaction
FROM personas p
JOIN persona_service_layer_usage psl ON p.persona_id = psl.persona_id
WHERE psl.usage_frequency != 'never'
GROUP BY p.archetype, psl.service_layer;
```

### 4. `gen_ai_opportunity_discovery`
Tracks how opportunities were discovered.

**Key Columns:**
- `opportunity_id`
- `discovery_source`: 'pain_point', 'goal', 'challenge', 'jtbd', etc.
- `source_id`: ID of the source
- `discovery_method`: 'automated', 'manual', 'ai_analysis'
- `discovery_confidence`: 0-100

**Use Case:**
```sql
-- Find how opportunities were discovered
SELECT discovery_source, COUNT(*) as count
FROM gen_ai_opportunity_discovery
GROUP BY discovery_source
ORDER BY count DESC;
```

---

## ⚙️ Helper Functions

### 1. `calculate_gen_ai_readiness_level()`
Auto-calculates Gen AI readiness level from persona attributes.

**Parameters:**
- `p_ai_maturity_score` (DECIMAL)
- `p_technology_adoption` (technology_adoption)
- `p_risk_tolerance` (risk_tolerance)
- `p_change_readiness` (change_readiness)

**Returns:** `gen_ai_readiness_level`

**Usage:**
```sql
SELECT calculate_gen_ai_readiness_level(
    75.0,  -- ai_maturity_score
    'early_adopter',  -- technology_adoption
    'moderate',  -- risk_tolerance
    'high'  -- change_readiness
);
-- Returns: 'ready'
```

### 2. `infer_preferred_service_layer()`
Infers preferred service layer from archetype and work pattern.

**Parameters:**
- `p_archetype` (archetype_type)
- `p_work_pattern` (work_pattern)

**Returns:** `service_layer_preference`

**Usage:**
```sql
SELECT infer_preferred_service_layer('AUTOMATOR', 'routine');
-- Returns: 'WORKFLOWS'
```

---

## 🔄 Triggers

### `trigger_update_gen_ai_readiness`
Auto-calculates Gen AI readiness level and preferred service layer when persona attributes change.

**Triggered on:**
- INSERT on `personas`
- UPDATE of: `ai_maturity_score`, `technology_adoption`, `risk_tolerance`, `change_readiness`, `archetype`, `work_pattern`

**What it does:**
1. Calculates `gen_ai_readiness_level` using `calculate_gen_ai_readiness_level()`
2. Sets `preferred_service_layer` using `infer_preferred_service_layer()` if not already set

---

## 📈 Analytics Views

### 1. `v_gen_ai_opportunities_by_archetype`
Gen AI opportunities grouped by archetype and type.

**Columns:**
- `archetype`
- `gen_ai_opportunity_type`
- `opportunity_count`
- `avg_priority_score`
- `avg_adoption_rate`
- `avg_roi_multiplier`
- `deployed_count`

**Usage:**
```sql
SELECT * FROM v_gen_ai_opportunities_by_archetype
WHERE archetype = 'AUTOMATOR';
```

### 2. `v_persona_gen_ai_readiness`
Persona Gen AI readiness dashboard by archetype.

**Columns:**
- `archetype`
- `gen_ai_readiness_level`
- `persona_count`
- `avg_adoption_score`
- `avg_trust_score`
- `service_layers_used`
- `preferred_layers`

**Usage:**
```sql
SELECT * FROM v_persona_gen_ai_readiness
ORDER BY persona_count DESC;
```

---

## 🚀 Migration Steps

1. **Backup Database**
   ```sql
   -- Create backup before migration
   pg_dump -Fc database_name > backup_before_gen_ai_migration.dump
   ```

2. **Run Migration**
   ```sql
   -- Execute migration script
   \i migrate_persona_schema_gen_ai_attributes.sql
   ```

3. **Verify Migration**
   ```sql
   -- Check new columns exist
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'personas' 
     AND column_name LIKE 'gen_ai%';
   
   -- Check new tables exist
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_name IN (
     'opportunity_archetypes',
     'opportunity_service_layers',
     'persona_service_layer_usage',
     'gen_ai_opportunity_discovery'
   );
   ```

4. **Populate Initial Data**
   ```sql
   -- Update existing personas with Gen AI readiness
   UPDATE personas 
   SET gen_ai_readiness_level = calculate_gen_ai_readiness_level(
     ai_maturity_score,
     technology_adoption,
     risk_tolerance,
     change_readiness
   )
   WHERE gen_ai_readiness_level IS NULL;
   
   -- Set preferred service layer
   UPDATE personas
   SET preferred_service_layer = infer_preferred_service_layer(
     archetype,
     work_pattern
   )
   WHERE preferred_service_layer IS NULL;
   ```

---

## 📝 Example Queries

### Find Gen AI Opportunities for a Specific Archetype
```sql
SELECT 
    o.opportunity_name,
    o.gen_ai_opportunity_type,
    oa.priority_score,
    oa.estimated_adoption_rate,
    osl.service_layer
FROM opportunities o
JOIN opportunity_archetypes oa ON o.opportunity_id = oa.opportunity_id
JOIN opportunity_service_layers osl ON o.opportunity_id = osl.opportunity_id
WHERE oa.archetype = 'AUTOMATOR'
  AND o.is_active = TRUE
ORDER BY oa.priority_score DESC;
```

### Analyze Service Layer Adoption by Archetype
```sql
SELECT 
    p.archetype,
    psl.service_layer,
    COUNT(*) as persona_count,
    AVG(psl.satisfaction_score) as avg_satisfaction,
    COUNT(CASE WHEN psl.usage_frequency IN ('daily', 'constant') THEN 1 END) as active_users
FROM personas p
JOIN persona_service_layer_usage psl ON p.persona_id = psl.persona_id
WHERE p.is_active = TRUE
GROUP BY p.archetype, psl.service_layer
ORDER BY p.archetype, persona_count DESC;
```

### Discover Opportunities from Pain Points
```sql
SELECT 
    pp.pain_point_text,
    pp.gen_ai_opportunity_type,
    pp.gen_ai_addressability_score,
    pp.recommended_service_layer,
    p.archetype
FROM persona_pain_points pp
JOIN personas p ON pp.persona_id = p.persona_id
WHERE pp.gen_ai_addressability_score >= 70
  AND pp.gen_ai_opportunity_type IS NOT NULL
ORDER BY pp.gen_ai_addressability_score DESC
LIMIT 20;
```

---

## ✅ Next Steps

1. **Run Migration** - Execute `migrate_persona_schema_gen_ai_attributes.sql`
2. **Populate Initial Data** - Update existing personas with Gen AI attributes
3. **Analyze Opportunities** - Use `identify_gen_ai_opportunities_from_personas.sql` to discover opportunities
4. **Map Opportunities** - Create entries in `opportunity_archetypes` and `opportunity_service_layers`
5. **Track Usage** - Start tracking service layer usage in `persona_service_layer_usage`
6. **Monitor Analytics** - Use the views to monitor Gen AI readiness and adoption

---

## 📚 Related Documents

- `GEN_AI_OPPORTUNITY_ALIGNMENT.md` - Strategic alignment with archetypes
- `identify_gen_ai_opportunities_from_personas.sql` - Opportunity discovery queries
- `.claude/vital-expert-docs/personas/PERSONA_STRATEGY_GOLD_STANDARD.md` - Full strategy document
- `.claude/vital-expert-docs/personas/PERSONA_DATABASE_SCHEMA_NORMALIZED.sql` - Base schema

---

**Migration Complete!** The schema is now ready for Gen AI opportunity discovery and mapping.

