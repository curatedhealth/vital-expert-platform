# Medical Affairs Personas - Seed Files

**Version**: 2.0.0
**Last Updated**: November 27, 2025
**Status**: Ready for Deployment

---

## ⚠️ CRITICAL: Verify Schema First

Before running ANY seed file, verify the actual database schema:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'personas' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

See [SCHEMA_DISCOVERY.md](../SCHEMA_DISCOVERY.md) for detailed schema information.

---

## Files in This Directory

| File | Description | Schema Version |
|------|-------------|----------------|
| `01_msl_personas_V2.sql` | 4 MSL personas (MECE) | Version B (name, description) |
| `02_medical_director_personas_V2.sql` | 4 Medical Director personas (MECE) | Version B (name, description) |
| `README.md` | This file | N/A |

---

## Deployment Instructions

### Step 1: Verify Schema

```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'personas' AND table_schema = 'public';
```

**Expected columns for V2 files**: `id`, `name`, `description`, `role_id`, `function_id`, `department_id`, `created_at`, `updated_at`

### Step 2: Run Seed Files

**Via Supabase SQL Editor:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `01_msl_personas_V2.sql`
3. Click Run
4. Copy contents of `02_medical_director_personas_V2.sql`
5. Click Run

**Via psql:**
```bash
psql $DATABASE_URL -f 01_msl_personas_V2.sql
psql $DATABASE_URL -f 02_medical_director_personas_V2.sql
```

### Step 3: Verify

```sql
SELECT name, LEFT(description, 50) as preview
FROM personas 
WHERE name LIKE '%MSL%' OR name LIKE '%Medical Director%'
ORDER BY name;
```

---

## Personas Created

### MSL Personas (4)

| Name | Archetype | AI Maturity | Work Complexity |
|------|-----------|-------------|-----------------|
| Dr. Sarah Chen | AUTOMATOR | 75/100 | 35/100 |
| Dr. Michael Rodriguez | ORCHESTRATOR | 82/100 | 75/100 |
| Dr. Emily Park | LEARNER | 32/100 | 28/100 |
| Dr. James Thompson | SKEPTIC | 28/100 | 78/100 |

### Medical Director Personas (4)

| Name | Archetype | AI Maturity | Work Complexity |
|------|-----------|-------------|-----------------|
| Dr. Amanda Foster | AUTOMATOR | 78/100 | 45/100 |
| Dr. Robert Martinez | ORCHESTRATOR | 85/100 | 82/100 |
| Dr. Jennifer Lee | LEARNER | 35/100 | 42/100 |
| Dr. William Chen | SKEPTIC | 25/100 | 80/100 |

---

## Data Stored in Description Field

Since the current schema is simplified, all rich persona data is stored in the `description` field as formatted markdown:

- **Role & Archetype**
- **Profile** (seniority, education, geographic scope)
- **AI Profile** (maturity score, complexity score, adoption level)
- **VPANES Scores** (Visibility, Pain, Actions, Needs, Emotions, Scenarios)
- **Motivations**
- **Frustrations**
- **Goals**
- **Tools Used**

---

## Remaining Roles to Create

To complete all 60 Medical Affairs personas (15 roles × 4 archetypes), create files for:

| Role | Status |
|------|--------|
| Chief Medical Officer (CMO) | ⏳ Pending |
| VP Medical Affairs | ⏳ Pending |
| Field Medical Director | ⏳ Pending |
| Medical Information Director | ⏳ Pending |
| HEOR Director | ⏳ Pending |
| Medical Affairs Manager | ⏳ Pending |
| KOL Manager | ⏳ Pending |
| Evidence Generation Manager | ⏳ Pending |
| Medical Communications Manager | ⏳ Pending |
| Medical Information Specialist | ⏳ Pending |
| HEOR Specialist | ⏳ Pending |
| Medical Writer | ⏳ Pending |
| Clinical Trial Liaison | ⏳ Pending |

---

## Related Documentation

- [Schema Discovery Guide](../SCHEMA_DISCOVERY.md)
- [Persona Seeding Complete Guide](../../PERSONA_SEEDING_COMPLETE_GUIDE.md)
- [Personas Complete Guide](../../PERSONAS_COMPLETE_GUIDE.md)
- [Persona Strategy Gold Standard](../../PERSONA_STRATEGY_GOLD_STANDARD.md)

---

**Maintained By**: VITAL Platform Team  
**Last Review**: 2025-11-27

