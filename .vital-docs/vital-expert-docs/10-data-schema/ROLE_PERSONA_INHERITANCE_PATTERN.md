# Role-Persona Inheritance & Override Pattern

## Core Design Principle

**Roles define the baseline structure. Personas add behavioral variation.**

```
ROLE (Structural Truth)
   ↓ inherits
PERSONA (Behavioral Delta)
```

## How It Works

### 1. Default Behavior: Inheritance
By default, a persona **inherits everything** from its role:
- Responsibilities
- Tools
- Skills
- Stakeholders
- AI Maturity
- VPANES Scores
- JTBDs

### 2. Override Pattern: Three Scenarios

#### Scenario A: Pure Inheritance (Default)
```
Role has: "Write Reports" responsibility
Persona: (nothing in persona_responsibilities table)
Result: Persona inherits "Write Reports" from role
```

#### Scenario B: Addition (`is_additional = TRUE`)
```
Role has: "Write Reports"
Persona has: "Train AI Models" (is_additional = TRUE, overrides_role = FALSE)
Result: Persona has BOTH "Write Reports" (from role) + "Train AI Models" (added)
```

#### Scenario C: Override (`overrides_role = TRUE`)
```
Role has: "Excel" tool with proficiency "intermediate"
Persona has: "Excel" tool with proficiency "expert" (overrides_role = TRUE, is_additional = FALSE)
Result: Persona uses "expert" proficiency, NOT "intermediate"
```

## Junction Table Schema Pattern

All persona junction tables with override capability have:

```sql
CREATE TABLE persona_* (
    id UUID PRIMARY KEY,
    persona_id UUID REFERENCES personas(id),
    
    -- Reference to master data OR denormalized text
    *_id UUID REFERENCES *(id),        -- Optional FK to reference table
    *_text TEXT,                        -- Denormalized text fallback
    
    -- Attributes
    [specific attributes for this junction],
    
    -- Override Pattern Fields (KEY!)
    is_additional BOOLEAN DEFAULT false,    -- New item not in role
    overrides_role BOOLEAN DEFAULT false,   -- Replaces role item
    sequence_order INTEGER,
    
    timestamps...
);
```

## Query Pattern: Effective View

To get the **effective** (combined) data for a persona:

```sql
-- Example: Effective Responsibilities for a Persona
SELECT 
    CASE 
        WHEN pr.is_additional THEN 'persona_only'
        WHEN pr.overrides_role THEN 'persona_override'
        WHEN pr.persona_id IS NULL THEN 'role_inherited'
        ELSE 'both'
    END as source,
    
    COALESCE(pr.responsibility_text, rr.responsibility_text) as responsibility,
    COALESCE(pr.time_allocation_percent, rr.time_allocation_percent) as time_allocation
    
FROM personas p
JOIN org_roles r ON p.role_id = r.id

-- Role baseline responsibilities
LEFT JOIN role_responsibilities rr ON rr.role_id = r.id

-- Persona overrides/additions
LEFT JOIN persona_responsibilities pr ON 
    pr.persona_id = p.id 
    AND (
        pr.is_additional = TRUE  -- Persona-specific additions
        OR (pr.overrides_role = TRUE AND pr.responsibility_id = rr.responsibility_id)  -- Overrides
    )

WHERE p.id = :persona_id
  -- Exclude role items that are overridden by persona
  AND NOT EXISTS (
      SELECT 1 FROM persona_responsibilities pr2
      WHERE pr2.persona_id = p.id
        AND pr2.overrides_role = TRUE
        AND pr2.responsibility_id = rr.responsibility_id
  )

ORDER BY COALESCE(pr.sequence_order, rr.sequence_order);
```

## Real-World Example

### Role: Medical Science Liaison (MSL)

**Role Baseline (`role_responsibilities`):**
1. Engage with KOLs - 40% time
2. Answer Medical Inquiries - 30% time
3. Support Clinical Trials - 20% time
4. Report to Manager - 10% time

**Role Baseline (`role_tools`):**
1. Veeva CRM - daily, intermediate
2. Email - daily, expert
3. PowerPoint - weekly, advanced

### Persona A: "Dr. Sarah Chen - MSL Oncology Specialist"
**Archetype:** Orchestrator (High AI maturity, High complexity)

**Persona Overrides (`persona_responsibilities`):**
- "Engage with KOLs" → 50% time (**overrides_role = TRUE**)
- "Develop AI-Powered Insights" → 15% time (**is_additional = TRUE**)

**Persona Additions (`persona_tools`):**
- "Python" - weekly, intermediate (**is_additional = TRUE**)
- "Veeva CRM" → daily, **expert** (**overrides_role = TRUE**)

**Effective Result:**
- Responsibilities: 50% KOLs, 30% Inquiries, 20% Trials, 10% Reports (inherited), **15% AI Insights** (added)  
  *(Total may exceed 100% due to overlapping activities)*
- Tools: Veeva (expert, overridden), Email (expert, inherited), PowerPoint (advanced, inherited), **Python (intermediate, added)**

### Persona B: "Dr. Mike Rodriguez - MSL Rare Disease"
**Archetype:** Learner (Low AI maturity, Low complexity)

**No Overrides - Pure Inheritance**
- All responsibilities: 100% inherited from role
- All tools: 100% inherited from role

**Effective Result:**
- Exact same as role baseline

## Benefits of This Pattern

### 1. **Data Efficiency**
- Don't duplicate role data for every persona
- Only store what's different
- Typical persona has 0-5 override records vs 20-50 inherited items

### 2. **Maintainability**
- Update role baseline → automatically affects all personas (unless overridden)
- Change "Excel" requirement for MSL role → affects 1000s of personas instantly

### 3. **Clear Distinction**
- Role = Job structure (what the job requires)
- Persona = Individual variation (how this person does it)

### 4. **Behavioral Insight**
- Overrides show where personas diverge from standard
- Additions show unique persona capabilities
- Pure inheritance shows conformity to role

### 5. **AI Personalization**
- System can adapt to persona-specific tools/skills
- Can recommend based on persona additions
- Can identify personas ready for new capabilities

## Implementation Checklist

✅ **Role Tables (Baseline)**
- [x] `role_responsibilities`
- [x] `role_tools`
- [x] `role_skills`
- [x] `role_stakeholders`
- [x] `role_ai_maturity`
- [x] `role_vpanes_scores`
- [x] `role_jtbd`

✅ **Persona Tables (Delta)**
- [x] `persona_responsibilities` (with override pattern)
- [x] `persona_tools` (with override pattern)
- [x] `persona_skills` (with override pattern)
- [x] `persona_stakeholders` (with override pattern)
- [x] `persona_ai_maturity` (with override flag)
- [x] `persona_vpanes_scores` (with override flag)

✅ **Effective Views (Combined)**
- [ ] `v_effective_persona_responsibilities`
- [ ] `v_effective_persona_tools`
- [ ] `v_effective_persona_skills`
- [ ] `v_effective_persona_stakeholders`
- [ ] `v_effective_persona_ai_maturity`
- [ ] `v_effective_persona_vpanes`
- [ ] `v_persona_complete_context`

## Next Steps

1. ✅ Create role junction tables → **DONE**
2. ✅ Create persona junction tables → **DONE**
3. ⏳ Create effective views → **NEXT**
4. ⏳ Populate role baselines with data
5. ⏳ Generate personas with selective overrides
6. ⏳ Build UI to show inherited vs override data

---

*This pattern ensures personas are lightweight behavioral overlays on role structure, not duplicated data silos.*

