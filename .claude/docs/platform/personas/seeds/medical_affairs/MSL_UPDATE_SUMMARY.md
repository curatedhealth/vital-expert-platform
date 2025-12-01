# MSL Personas - Update Summary

## Overview

**File**: `.claude/docs/platform/personas/seeds/medical_affairs/MSL_PERSONAS_SEED.sql`  
**Version**: 2.0.0  
**Status**: Ready for deployment  
**Date**: November 28, 2025

---

## What's New in v2.0

### Enhanced Core Persona Data

All 4 personas now include:

| Field Category | New Fields Added |
|----------------|------------------|
| **Identity** | `one_liner` - Quick persona summary |
| **Scores** | `archetype_confidence` (0.80-0.88) |
| **Professional** | `years_in_current_role`, `years_in_industry`, `years_in_function`, `direct_reports` |
| **Behavioral** | `decision_making_style`, `learning_style`, `work_arrangement` |
| **Gen AI** | `gen_ai_trust_score`, `gen_ai_primary_use_case` (detailed) |
| **Narrative** | Rich `background_story` and detailed `a_day_in_the_life` |
| **Salary** | Realistic salary ranges with source year |
| **Status** | Set to `validation_status: 'validated'` |

### Junction Table Data Added

| Table | Records per Persona | Total Records |
|-------|---------------------|---------------|
| **persona_pain_points** | 4 | 16 |
| **persona_goals** | 3 | 12 |
| **persona_motivations** | 3 | 12 |
| **persona_vpanes_scoring** | 1 | 4 |
| **persona_success_metrics** | 3 | 12 |
| **TOTAL** | **14** | **56** |

---

## The 4 MSL Personas

### 1. Dr. Sarah Chen - AUTOMATOR ⚡
- **AI Maturity**: 75 | **Work Complexity**: 35
- **Service Layer**: WORKFLOWS
- **Seniority**: Mid-level (6 years experience)
- **Focus**: Efficiency, automation, freeing time for KOLs
- **Key Pain**: Manual CRM data entry (8+ hours/week)
- **Key Goal**: Automate call notes to save 10+ hours/week
- **VPANES Score**: 43/60 (Tier 2 - High Priority)

**Sample Pain Points**:
- Manual CRM data entry consumes 8+ hours weekly
- Repetitive literature searches for each KOL meeting
- Manual slide deck creation for presentations
- Difficulty tracking which KOLs need follow-up

### 2. Dr. Michael Rodriguez - ORCHESTRATOR 🎯
- **AI Maturity**: 82 | **Work Complexity**: 75
- **Service Layer**: ASK_PANEL
- **Seniority**: Senior (12 years experience)
- **Focus**: Strategic transformation, global coordination
- **Key Pain**: Fragmented KOL data across systems
- **Key Goal**: Build AI-powered KOL network analysis system
- **VPANES Score**: 48/60 (Tier 1 - Ideal Target)

**Sample Pain Points**:
- Fragmented KOL data across multiple systems
- Difficulty identifying emerging thought leaders
- Time zone coordination for global team
- Competitive intelligence gathering is manual

### 3. Dr. Emily Park - LEARNER 📚
- **AI Maturity**: 32 | **Work Complexity**: 28
- **Service Layer**: ASK_EXPERT
- **Seniority**: Entry-level (2 years experience)
- **Focus**: Building confidence, learning safely
- **Key Pain**: Overwhelmed by volume of new publications
- **Key Goal**: Gain confidence using basic AI tools safely
- **VPANES Score**: 36/60 (Tier 3 - Medium Priority)

**Sample Pain Points**:
- Overwhelmed by volume of new publications
- Unsure which AI tools to trust
- Lack of time for structured AI training
- Fear of making mistakes with new technology

### 4. Dr. James Thompson - SKEPTIC 🛡️
- **AI Maturity**: 28 | **Work Complexity**: 78
- **Service Layer**: ASK_PANEL (for validated Q&A only)
- **Seniority**: Senior/Principal (18 years experience)
- **Focus**: Compliance, risk mitigation, proven methods
- **Key Pain**: Manual processes extremely time-consuming (CRITICAL)
- **Key Goal**: Ensure all AI usage meets regulatory standards
- **VPANES Score**: 39/60 (Tier 2 - High Priority)

**Sample Pain Points**:
- Manual processes are extremely time-consuming (CRITICAL)
- Regulatory concerns about AI-generated content (CRITICAL)
- Team pressure to adopt unfamiliar technology
- Difficulty maintaining quality control at scale

---

## VPANES Analysis

| Persona | V | P | A | N | E | S | Total | Tier |
|---------|---|---|---|---|---|---|-------|------|
| **Orchestrator** | 9 | 6 | 9 | 8 | 7 | 9 | **48** | Tier 1 (Ideal) |
| **Automator** | 8 | 7 | 8 | 5 | 6 | 9 | **43** | Tier 2 (High) |
| **Skeptic** | 7 | 9 | 3 | 6 | 8 | 6 | **39** | Tier 2 (High) |
| **Learner** | 5 | 8 | 4 | 7 | 7 | 5 | **36** | Tier 3 (Medium) |

**Key Insights**:
- **Orchestrator** is the ideal initial target - high visibility, very high action readiness
- **Automator** has highest pain + action combo - strong quick-win potential
- **Skeptic** has critical pain (9/10) but lowest action readiness (3/10) - needs compliance validation
- **Learner** needs guided onboarding and simple tools first

---

## Success Metrics by Persona

### Automator
1. Time saved on admin tasks: 10+ hours/week target
2. KOL meeting frequency: 30+ quality interactions/month
3. Literature monitoring: <1 hour/week

### Orchestrator
1. Global KOL coverage: 95% of tier 1 KOLs engaged quarterly
2. Team AI adoption: 80% using AI tools daily
3. Strategic insights: 20 actionable insights/month from AI

### Learner
1. AI tool proficiency: 3 tools used confidently within 6 months
2. Admin time reduction: 25% within 1 year
3. Manager satisfaction: meets/exceeds expectations quarterly

### Skeptic
1. Regulatory compliance: 100% of AI usage meeting standards
2. Team output quality: maintain 9/10 average
3. Process efficiency: 15% time reduction while maintaining quality

---

## How to Deploy

### Option 1: Direct Execution (Recommended)
```bash
# From project root
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Execute the seed file
mcp_supabase_execute_sql --query "$(cat '.claude/docs/platform/personas/seeds/medical_affairs/MSL_PERSONAS_SEED.sql')"
```

### Option 2: Supabase CLI
```bash
supabase db exec --file .claude/docs/platform/personas/seeds/medical_affairs/MSL_PERSONAS_SEED.sql
```

### Option 3: Supabase Dashboard
1. Copy contents of `MSL_PERSONAS_SEED.sql`
2. Go to Supabase Dashboard > SQL Editor
3. Paste and execute

---

## Verification

After deployment, run these checks:

```sql
-- Check personas were created
SELECT 
    name,
    archetype,
    ai_maturity_score,
    work_complexity_score,
    preferred_service_layer
FROM personas
WHERE slug LIKE '%msl-%'
ORDER BY archetype;

-- Check junction table population
SELECT 
    'Pain Points' as table_name,
    COUNT(*) as count
FROM persona_pain_points pp
JOIN personas p ON pp.persona_id = p.id
WHERE p.slug LIKE '%msl-%'

UNION ALL

SELECT 'Goals', COUNT(*)
FROM persona_goals pg
JOIN personas p ON pg.persona_id = p.id
WHERE p.slug LIKE '%msl-%'

UNION ALL

SELECT 'VPANES Scores', COUNT(*)
FROM persona_vpanes_scoring pv
JOIN personas p ON pv.persona_id = p.id
WHERE p.slug LIKE '%msl-%';
```

**Expected Results**:
- 4 personas (1 of each archetype)
- 16 pain points (4 per persona)
- 12 goals (3 per persona)
- 12 motivations (3 per persona)
- 4 VPANES scores (1 per persona)
- 12 success metrics (3 per persona)

---

## Next Steps

1. ✅ Deploy updated MSL personas
2. ⏭️ Add remaining junction tables:
   - `persona_typical_day` (8-12 activities per persona)
   - `persona_tools_used` (5-8 tools per persona)
   - `persona_stakeholders` (4-6 stakeholders per persona)
   - `persona_education` (1-3 degrees per persona)
   - `persona_certifications` (0-5 certs per persona)
3. ⏭️ Use as template for other Medical Affairs roles
4. ⏭️ Update `validation_status` to `'published'` when ready

---

## Files Modified

| File | Change |
|------|--------|
| `MSL_PERSONAS_SEED.sql` | ✅ Complete rewrite with v2.0 |
| `PERSONA_SEED_TEMPLATE.sql` | ✅ Created comprehensive template |
| `PERSONA_README.md` | ✅ Created seeding guide |
| Database | ⏳ Pending deployment |

---

## Database Impact

**Operation**: UPDATE (Idempotent)  
**Tables Affected**: 
- `personas` (DELETE + INSERT 4 rows)
- `persona_pain_points` (INSERT 16 rows)
- `persona_goals` (INSERT 12 rows)
- `persona_motivations` (INSERT 12 rows)
- `persona_vpanes_scoring` (INSERT 4 rows)
- `persona_success_metrics` (INSERT 12 rows)

**Total Records**: 60 records (4 personas + 56 junction records)

**Safety**: 
- ✅ Wrapped in transaction
- ✅ Idempotent (deletes existing MSL personas first)
- ✅ Trigger-safe (disables/re-enables problematic trigger)
- ✅ Includes verification queries

---

**Ready to deploy!** 🚀







