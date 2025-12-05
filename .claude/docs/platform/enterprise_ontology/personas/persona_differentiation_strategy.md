# Persona Differentiation Strategy
## Creating 4 Distinct Personas Per Role

### Current State Analysis
- **Total Personas**: 1,000
- **Attributes Populated**:
  - `seniority_level`: 33.1% (senior, mid-level, director, executive)
  - `years_of_experience`: 32.6% (ranges from 3-18 years)
  - `typical_organization_size`: 22.3% (large, mid, Emerging Biopharma, etc.)
  - `work_style`: 21.4% (hybrid, office)
  - `geographic_scope`: 1.6% (global, regional, local)

---

## Recommended Differentiation Strategy

### **Option 1: Geographic Scope + Seniority (RECOMMENDED)**
**Best for: Most pharma roles**

Creates 4 personas using a 2x2 matrix:

| | **Early/Mid-Level** | **Senior/Executive** |
|---|---|---|
| **Global/Regional** | 1. Global Mid-Level Manager | 2. Global Senior Director |
| **Local/Country** | 3. Country-Level Manager | 4. Country Senior Leader |

**Attributes to use:**
- `geographic_scope`: `global` | `regional` | `local` | `country`
- `seniority_level`: `mid-level` | `senior` | `director` | `executive`
- `years_of_experience`: 3-5 (early) | 6-10 (mid) | 11-15 (senior) | 16+ (executive)

**Why this works:**
- ✅ Highly relevant in pharma (global vs local operations)
- ✅ Clear career progression differentiation
- ✅ Reflects real organizational structure
- ✅ Easy to understand and populate

---

### **Option 2: Organization Type + Product Lifecycle**
**Best for: Commercial, Medical Affairs, Market Access roles**

| | **Big Pharma** | **Emerging Biopharma** |
|---|---|---|
| **Launch/Growth** | 1. Big Pharma Launch Manager | 2. Emerging Biopharma Launch Lead |
| **Mature/Lifecycle** | 3. Big Pharma Lifecycle Manager | 4. Emerging Biopharma Growth Manager |

**Attributes to use:**
- `typical_organization_size`: `Large Pharma` | `Emerging Biopharma` | `Specialty Pharma` | `Mid-Size Pharma`
- `metadata.product_lifecycle_stage`: `launch` | `growth` | `mature` | `lifecycle_management`

**Why this works:**
- ✅ Different challenges and priorities by company size
- ✅ Product lifecycle stage affects decision-making
- ✅ Very relevant for commercial and medical roles

---

### **Option 3: Experience Level + Work Style**
**Best for: Field-based roles (MSL, Sales, etc.)**

| | **Field-Based** | **Office/Hybrid** |
|---|---|---|
| **Early Career (3-7 yrs)** | 1. Field Rep - Early Career | 2. Office Analyst - Early Career |
| **Experienced (8+ yrs)** | 3. Field Manager - Experienced | 4. Office Manager - Experienced |

**Attributes to use:**
- `years_of_experience`: 3-7 (early) | 8-12 (mid) | 13-17 (senior) | 18+ (expert)
- `work_arrangement`: `field` | `hybrid` | `office` | `remote`

**Why this works:**
- ✅ Different work styles create different personas
- ✅ Experience level affects decision-making authority
- ✅ Good for roles with field/office split

---

### **Option 4: Single Attribute - Seniority Levels**
**Simplest approach**

1. **Entry/Early Career** (3-5 years experience)
2. **Mid-Level** (6-10 years experience)
3. **Senior** (11-15 years experience)
4. **Executive/Director** (16+ years experience)

**Attributes to use:**
- `seniority_level`: `entry` | `mid-level` | `senior` | `director` | `executive`
- `years_of_experience`: 3-5 | 6-10 | 11-15 | 16+
- `direct_reports`: 0 | 1-3 | 4-10 | 11+

**Why this works:**
- ✅ Simplest to implement
- ✅ Clear progression
- ✅ Works for all roles

---

## **My Recommendation: Option 1 (Geographic + Seniority)**

### Implementation Matrix

For each role, create 4 personas:

1. **Global Mid-Level**
   - `geographic_scope`: `global`
   - `seniority_level`: `mid-level`
   - `years_of_experience`: 5-8
   - `typical_organization_size`: `Large Pharma`
   - `work_arrangement`: `hybrid`

2. **Global Senior**
   - `geographic_scope`: `global`
   - `seniority_level`: `senior` or `director`
   - `years_of_experience`: 12-16
   - `typical_organization_size`: `Large Pharma`
   - `work_arrangement`: `office` or `hybrid`

3. **Regional/Local Mid-Level**
   - `geographic_scope`: `regional` or `local`
   - `seniority_level`: `mid-level`
   - `years_of_experience`: 5-8
   - `typical_organization_size`: `Mid-Size Pharma` or `Specialty Pharma`
   - `work_arrangement`: `field` or `hybrid`

4. **Regional/Local Senior**
   - `geographic_scope`: `regional` or `local`
   - `seniority_level`: `senior` or `director`
   - `years_of_experience`: 12-16
   - `typical_organization_size`: `Mid-Size Pharma` or `Specialty Pharma`
   - `work_arrangement`: `office` or `hybrid`

---

## Additional Differentiating Attributes (Secondary)

These can be used to add nuance within the 4 personas:

- **Technology Adoption**: `early_adopter` | `mainstream` | `late_adopter`
- **Risk Tolerance**: `conservative` | `moderate` | `aggressive`
- **Decision-Making Style**: `analytical` | `intuitive` | `collaborative` | `authoritative`
- **Team Size**: `individual_contributor` | `small_team` (1-5) | `medium_team` (6-15) | `large_team` (16+)

---

## Next Steps

1. **Choose primary differentiation strategy** (I recommend Option 1)
2. **For each role**, identify existing personas and categorize them
3. **Create missing personas** to reach 4 per role
4. **Populate attributes** consistently across all personas
5. **Verify uniqueness** - ensure each persona is meaningfully different

---

## Questions to Consider

1. **Which roles need geographic differentiation?**
   - Global roles: Medical Affairs, Regulatory, R&D
   - Local roles: Sales, Field Medical, Market Access (country-specific)

2. **Should we use the same strategy for all roles?**
   - Consider role-specific strategies (e.g., Option 2 for Commercial, Option 3 for Field roles)

3. **How do we handle roles that already have personas?**
   - Assess existing personas
   - Fill gaps to reach 4
   - Ensure differentiation is clear

