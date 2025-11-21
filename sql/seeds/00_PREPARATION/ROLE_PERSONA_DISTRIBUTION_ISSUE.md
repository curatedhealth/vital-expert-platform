# ⚠️ Role-to-Persona Distribution Issue

**Date**: 2025-11-17
**Issue**: Roles not properly granular - many roles have more than 5 personas
**Expected**: Each role should have 3-5 persona variations (as designed in source JSON)
**Actual**: Roles combined too broadly, resulting in 1-13 personas per role

---

## 📊 Current State Analysis

### Market Access - Distribution Summary

| Personas per Role | Number of Roles | Status |
|-------------------|-----------------|---------|
| **1 persona** | 1 role | ❌ Too few |
| **2 personas** | 8 roles | ❌ Too few |
| **3 personas** | 5 roles | ✅ Good |
| **4 personas** | 8 roles | ✅ Good |
| **5 personas** | 1 role | ✅ Good |
| **6 personas** | 7 roles | ❌ Too many |
| **8 personas** | 3 roles | ❌ Too many |
| **9 personas** | 1 role | ❌ Too many |
| **13 personas** | 1 role | ❌ Too many |

**Summary:**
- ✅ **14 roles** with 3-5 personas (40% - as designed)
- ❌ **21 roles** with incorrect distribution (60% - need refinement)

---

## 🔍 Specific Examples

### Example 1: "Head of HEOR" - 13 personas (Should be 3-5)

**Current Database State:**
- 1 role: "Head of HEOR"
- 13 personas mapped to it

**Source JSON Structure (How it should be):**
The 13 personas likely represent:
1. Head of HEOR - Global (Strategic)
2. Head of HEOR - Global (Operational)
3. Head of HEOR - Global (Commercial)
4. Head of HEOR - US (Strategic)
5. Head of HEOR - US (Operational)
6. Head of HEOR - US (Payer Relations)
7. Head of HEOR - US (Launch)
8. Head of HEOR - EU (Strategic)
9. Head of HEOR - EU (Operational)
10. Head of HEOR - EU (HTA Focus)
11. Head of HEOR - EU/APAC
12. Head of HEOR - Emerging Markets
13. Head of HEOR - Digital/Innovation

**Recommended Split:**
Should create 3-4 more granular roles:
- "Head of HEOR - Global" (3-4 personas)
- "Head of HEOR - US" (3-4 personas)
- "Head of HEOR - EU" (3-4 personas)
- "Head of HEOR - Regional" (2-3 personas)

---

### Example 2: "VP Market Access" - 8 personas (Should be 3-5)

**Current Database State:**
- 1 role: "VP Market Access"
- 8 personas mapped to it

**Source JSON Structure:**
1. VP Market Access - Global (Strategic)
2. VP Market Access - Global (Operations)
3. VP Market Access - Global (Commercial)
4. VP Market Access - Global (Regional Director)
5. VP Market Access - US (National Accounts)
6. VP Market Access - US (Specialty Pharma)
7. VP Market Access - US (Launch Leader)
8. VP Market Access - US (Portfolio Management)

**Recommended Split:**
- "VP Market Access - Global" (4 personas)
- "VP Market Access - US" (4 personas)

---

### Example 3: "Pricing Director" - 9 personas (Should be 3-5)

**Current Database State:**
- 1 role: "Pricing Director"
- 9 personas mapped to it

**Source JSON Structure:**
1. Pricing Director - Launch (Senior)
2. Pricing Director - Launch (Mid)
3. Pricing Director - Launch (Junior)
4. Pricing Director - Lifecycle (Senior)
5. Pricing Director - Lifecycle (Mid)
6. Pricing Director - Lifecycle (Junior)
7. Pricing Director - Global Markets (Expert)
8. Pricing Director - Global Markets (Mid)
9. Pricing Director - Global Markets (Junior)

**Recommended Split:**
- "Pricing Director - Launch" (3 personas)
- "Pricing Director - Lifecycle" (3 personas)
- "Pricing Director - Global Markets" (3 personas)

---

## 🎯 Root Cause

The issue occurred because my mapping script used **simplified pattern matching** on titles:

```sql
-- Current mapping (TOO BROAD)
UPDATE personas p
SET role_id = r.id
WHERE r.slug = 'heor-heor-director'
  AND p.title ILIKE '%HEOR director%'
```

This catches ALL HEOR directors regardless of:
- Geographic scope (Global, US, EU)
- Specialization (Modeling, RWE, Strategic)
- Experience level (Senior, Mid, Junior)

**What should have happened:**
Each specialized variation should map to its own role:
- `heor-director-global-strategic`
- `heor-director-global-operational`
- `heor-director-us-strategic`
- `heor-director-modeling-expert`
- etc.

---

## 📋 Roles Currently Meeting 3-5 Persona Standard

✅ **Perfect Distribution (14 roles):**

1. **Hub Services Manager** (5 personas)
2. **Chief Market Access Officer** (4 personas)
3. **Head of VEO** (4 personas)
4. **Head of Pricing Strategy** (4 personas)
5. **Head of Payer Relations** (4 personas)
6. **Head of Patient Access** (4 personas)
7. **Government Affairs Director** (4 personas)
8. **Trade Director** (4 personas)
9. **Head of MA Analytics** (4 personas)
10. **Senior Pricing Manager** (3 personas)
11. **Contracting Director** (3 personas)
12. **Head of Government Affairs** (3 personas)
13. **Head of Trade & Distribution** (3 personas)
14. **Head of MA Operations** (3 personas)

---

## 📋 Roles Needing Refinement (21 roles)

### Too Many Personas (12 roles need to be split):

| Role | Current Count | Should Be |
|------|---------------|-----------|
| Head of HEOR | 13 | 3-4 sub-roles with 3-4 personas each |
| Pricing Director | 9 | 3 sub-roles with 3 personas each |
| VP Market Access | 8 | 2 sub-roles with 4 personas each |
| HEOR Director | 8 | 2-3 sub-roles with 3-4 personas each |
| Senior Health Economist | 8 | 2-3 sub-roles with 3-4 personas each |
| VEO Director | 6 | 2 sub-roles with 3 personas each |
| RWE Lead | 6 | 2 sub-roles with 3 personas each |
| Reimbursement Director | 6 | 2 sub-roles with 3 personas each |
| Payer Director | 6 | 2 sub-roles with 3 personas each |
| Regional Payer Director | 6 | 2 sub-roles with 3 personas each |
| Patient Services Director | 6 | 2 sub-roles with 3 personas each |
| Senior MA Analyst | 6 | 2 sub-roles with 3 personas each |

### Too Few Personas (9 roles need additional personas or consolidation):

| Role | Current Count | Issue |
|------|---------------|-------|
| MA Business Analyst | 1 | Need 2-4 more variations |
| Evidence Synthesis Lead | 2 | Need 1-3 more variations |
| Reimbursement Support Manager | 2 | Need 1-3 more variations |
| Medicare & Medicaid Director | 2 | Need 1-3 more variations |
| MA Analyst | 2 | Need 1-3 more variations |
| MA Operations Director | 2 | Need 1-3 more variations |
| MA Strategy Manager | 2 | Need 1-3 more variations |
| MA Process Improvement Manager | 2 | Need 1-3 more variations |
| MA Project Manager | 2 | Need 1-3 more variations |

---

## 🔧 Recommended Solution

### Option 1: Create More Granular Roles (Preferred)

**Pros:**
- Matches source JSON design intent
- Better persona differentiation
- More precise role definitions
- Easier to maintain 3-5 persona standard

**Cons:**
- More roles to create (~30-40 additional roles)
- More complex role taxonomy

**Implementation:**
1. Create specialized role variants:
   - Geographic variants (Global, US, EU, APAC)
   - Functional variants (Strategic, Operational, Launch)
   - Specialization variants (Modeling, RWE, HTA)
2. Re-map personas to more specific roles
3. Target: ~80-90 total roles with 3-5 personas each

---

### Option 2: Accept Current Distribution

**Pros:**
- Less work
- Simpler role structure
- Still functional for queries

**Cons:**
- Doesn't match original design intent
- Some roles too broad (13 personas)
- Less precise persona categorization

---

## 📊 Impact Assessment

### Current State
- **Total Roles in Use**: 35
- **Roles Meeting Standard (3-5 personas)**: 14 (40%)
- **Roles Needing Refinement**: 21 (60%)
- **Average Personas per Role**: 4.5

### If We Implement Option 1
- **Estimated Total Roles**: 80-90
- **Roles Meeting Standard**: ~85% (68-77 roles)
- **Average Personas per Role**: 3.8

---

## 🎯 Decision Required

**Question for User:**

Should we:

1. **Refine the role taxonomy** to create more granular roles (matching 3-5 persona design)?
2. **Accept current distribution** and move forward?
3. **Hybrid approach** - refine only the most problematic roles (those with 6+ personas)?

---

**Status**: Issue Identified - Awaiting decision on remediation approach
**Priority**: MEDIUM - Functional but not optimal
**Affected Records**: 21 roles (60% of total)
**Recommended Action**: Option 1 (Create more granular roles)
