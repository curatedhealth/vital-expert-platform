# Medical Affairs Personas - Deployment Guide

## Overview

This folder contains comprehensive SQL seed files to deploy **8 Medical Affairs personas** based on the MECE framework:

| Role | Archetypes | Status |
|------|------------|--------|
| Medical Science Liaison (MSL) | Automator, Orchestrator, Learner, Skeptic | ✅ Ready |
| Medical Director | Automator, Orchestrator, Learner, Skeptic | ✅ Ready |

## Files

| File | Description | Run Order |
|------|-------------|-----------|
| `00_medical_affairs_roles_reference.sql` | Reference only (no SQL executed) | N/A |
| `01_msl_personas_complete_FIXED.sql` | ⭐ 4 MSL personas | **1st** |
| `02_medical_director_personas_FIXED.sql` | ⭐ 4 Medical Director personas | **2nd** |
| `01_msl_personas_complete.sql` | OLD - Has schema mismatch errors | ❌ Don't use |
| `02_medical_director_personas.sql` | OLD - Has schema mismatch errors | ❌ Don't use |

## ⭐ Correct Deployment Sequence

Run these files **in order**:

```
1. 01_msl_personas_complete_FIXED.sql      (4 MSL personas)
2. 02_medical_director_personas_FIXED.sql  (4 Medical Director personas)
```

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `DEPLOY_NOW.sql`
4. Click **Run**

### Option 2: Via psql

```bash
# Set your database URL
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"

# Deploy
psql $DATABASE_URL -f DEPLOY_NOW.sql
```

### Option 3: Via Supabase CLI

```bash
supabase db push --db-url $DATABASE_URL
```

## Data Included Per Persona

Each persona includes:

| Junction Table | Records | Description |
|----------------|---------|-------------|
| `persona_motivations` | 3-5 | What drives them |
| `persona_frustrations` | 3-5 | Pain points |
| `persona_goals` | 3-4 | Short/medium/long term goals |
| `persona_typical_day_activities` | 7-10 | Daily activities |
| `persona_skills` | 6-8 | Technical and soft skills |
| `persona_tools_used` | 6-8 | Software and tools |
| `persona_success_metrics` | 3-4 | KPIs and targets |

## Persona Summary

### MSL Personas

| Name | Archetype | AI Maturity | Work Complexity | Service Layer |
|------|-----------|-------------|-----------------|---------------|
| Dr. Sarah Chen | AUTOMATOR | 75 | 35 | WORKFLOWS |
| Dr. Michael Rodriguez | ORCHESTRATOR | 82 | 75 | SOLUTION_BUILDER |
| Dr. Emily Park | LEARNER | 32 | 28 | ASK_EXPERT |
| Dr. James Thompson | SKEPTIC | 28 | 78 | ASK_EXPERT |

### Medical Director Personas

| Name | Archetype | AI Maturity | Work Complexity | Service Layer |
|------|-----------|-------------|-----------------|---------------|
| Dr. Amanda Foster | AUTOMATOR | 78 | 45 | WORKFLOWS |
| Dr. Robert Martinez | ORCHESTRATOR | 85 | 82 | SOLUTION_BUILDER |
| Dr. Jennifer Lee | LEARNER | 35 | 42 | ASK_EXPERT |
| Dr. William Chen | SKEPTIC | 25 | 80 | ASK_EXPERT |

## VPANES Scores

Each persona has VPANES scores for AI product-market fit prediction:

- **V**isibility: Awareness of problems AI can solve (1-10)
- **P**ain: Intensity of pain points (1-10)
- **A**ctions: Active steps taken to find solutions (1-10)
- **N**eeds: Budget and decision authority (1-10)
- **E**motions: Emotional investment in solving problems (1-10)
- **S**cenarios: Frequency of encountering use cases (1-10)

## Verification

After deployment, run:

```sql
-- Check personas created
SELECT name, archetype, role_name, ai_maturity_score, work_complexity_score
FROM personas 
WHERE function_name = 'Medical Affairs'
ORDER BY role_name, archetype;

-- Check junction tables
SELECT 'motivations' as table_name, COUNT(*) as records
FROM persona_motivations pm
JOIN personas p ON pm.persona_id = p.id
WHERE p.function_name = 'Medical Affairs'
UNION ALL
SELECT 'frustrations', COUNT(*)
FROM persona_frustrations pf
JOIN personas p ON pf.persona_id = p.id
WHERE p.function_name = 'Medical Affairs'
UNION ALL
SELECT 'goals', COUNT(*)
FROM persona_goals pg
JOIN personas p ON pg.persona_id = p.id
WHERE p.function_name = 'Medical Affairs';
```

## Troubleshooting

### Connection Timeout
If you get connection timeout errors:
1. Check if your Supabase project is paused (free tier projects pause after inactivity)
2. Go to Supabase Dashboard → Settings → Pause/Resume project
3. Wait 1-2 minutes for the project to resume

### Missing Tables
If junction tables don't exist, run the schema migration first:
```sql
-- Check if persona_motivations table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'persona_motivations'
);
```

### Duplicate Key Errors
The scripts use `ON CONFLICT DO NOTHING` or `ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()` to handle re-runs safely.

## Next Steps

To complete all 60 Medical Affairs personas, create similar files for:
- Chief Medical Officer (CMO)
- VP Medical Affairs
- Field Medical Director
- Medical Information Director
- HEOR Director
- Medical Affairs Manager
- KOL Manager
- Evidence Generation Manager
- Medical Communications Manager
- Medical Information Specialist
- HEOR Specialist
- Medical Writer
- Clinical Trial Liaison

## Data Sources

Persona data was compiled from:
- Medical Affairs Professional Society (MAPS) Competency Framework
- MSL Society role definitions
- Industry salary data (2024)
- Pharmaceutical industry job descriptions
- KOL engagement best practices
- Web search for current Medical Affairs trends

