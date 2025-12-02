# Agent Level Remapping Complete

**Date:** 2025-12-02  
**Status:** ✅ CORRECTED

## Problem Identified

The previous agent level assignment logic was **INCORRECT**:

| Previous Logic (WRONG) | What It Did |
|------------------------|-------------|
| Directors/VPs → L1 Master | Assigned senior leaders as department heads |
| Managers → L3 Specialist | Demoted managers to mid-level |
| Most agents → L1 Master | Created too many "masters" |

## Correct Hierarchy (Based on VITAL Architecture)

| Level | Type | Who Should Be Here | Expected Count |
|-------|------|-------------------|----------------|
| **L1 (MASTER)** | Department Heads | CMO, Department Masters (one per dept) | ~9 |
| **L2 (EXPERT)** | Senior/Director | Directors, VPs, Senior roles, Leads, Scientists | ~45-50 |
| **L3 (SPECIALIST)** | Mid/Entry | Managers, MSLs, Coordinators, Specialists | ~50-60 |
| **L4 (WORKER)** | Task Executors | Analysts, Associates, Assistants | ~18-20 |
| **L5 (TOOL)** | API Wrappers | Bots, APIs, Calculators, Automation | ~50+ |

## Files Updated

### 1. SQL Script (Primary)
**File:** `database/data/agents/assign_agent_levels.sql`

**Key Changes:**
- L1 Master: Now only matches `%Master%`, `%CMO%`, `%Chief Medical Officer%`, `%Department Head%`
- L2 Expert: Now includes Directors, VPs, Senior roles, Leads, Scientists, Strategists
- L3 Specialist: Managers, MSLs, Coordinators, Writers, Specialists
- L4 Worker: Analysts, Associates, Assistants, task-oriented roles
- L5 Tool: APIs, Bots, Calculators, atomic operations

### 2. Corrected SQL Script (Backup)
**File:** `database/data/agents/assign_agent_levels_corrected.sql`

A clean version with detailed comments explaining the correct hierarchy.

### 3. JavaScript Import Script
**File:** `.vital-command-center/07-TOOLING/scripts/import-agents-from-registry.js`

Updated `determineTier()` function with corrected logic.

### 4. JavaScript Tier Assignment Script
**File:** `.vital-command-center/07-TOOLING/scripts/assign-agent-tiers.js`

Completely rewritten with:
- New `determineTier()` function
- Pattern-based tier detection
- Expected vs actual distribution reporting

## How to Apply the Fix

### Option 1: Run SQL Migration
```bash
# Connect to your Supabase database and run:
psql $DATABASE_URL -f database/data/agents/assign_agent_levels.sql
```

### Option 2: Run JavaScript Script
```bash
cd .vital-command-center/07-TOOLING/scripts
node assign-agent-tiers.js
```

## Verification Queries

After running the migration, verify the distribution:

```sql
-- Check distribution
SELECT 
    al.name as level,
    al.level_number,
    COUNT(a.id) as agent_count,
    ROUND(COUNT(a.id) * 100.0 / SUM(COUNT(a.id)) OVER(), 1) as percentage
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
GROUP BY al.id, al.name, al.level_number
ORDER BY al.level_number;

-- Verify Masters are department heads only
SELECT name, slug 
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.level_number = 1;
```

## Expected Results

After remapping:
- **L1 Masters:** ~9 agents (department heads only)
- **L2 Experts:** ~45-50 agents (senior leadership)
- **L3 Specialists:** ~50-60 agents (mid-level)
- **L4 Workers:** ~18-20 agents (task executors)
- **L5 Tools:** ~50+ agents (API wrappers)

## Key Principle

**Masters (L1) are NOT senior leaders - they are DEPARTMENT HEADS.**

- A "Director of Medical Affairs" is an **Expert (L2)**, not a Master
- A "VP of Regulatory" is an **Expert (L2)**, not a Master
- Only "Medical Affairs Master" or "CMO" (as department head) is a **Master (L1)**

This aligns with the VITAL architecture where:
- **L1-L3** are organizational hierarchy (department-specific)
- **L4-L5** are universal support (department-agnostic)

---

*Reference: `.vital-command-center/04-TECHNICAL/data-schema/seeds/REVISED_5_LEVEL_ARCHITECTURE.md`*

