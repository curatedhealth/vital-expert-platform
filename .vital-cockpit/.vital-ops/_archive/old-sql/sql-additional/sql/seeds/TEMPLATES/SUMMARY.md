# SQL Seed Templates - Complete Summary

## What We Have

### Production-Ready Templates (3 Total)

#### 1. Organizational Functions & Departments
**File:** `TEMPLATE_org_functions_and_departments.sql`
- **Size:** 13KB (176 lines)
- **Coverage:** 2 industries (Pharmaceuticals + Digital Health)
- **Functions:** 20 total (13 Pharma + 7 Digital Health)
- **Departments:** 28 total (17 Pharma + 11 Digital Health)

**Key Features:**
- Color-coded with emoji icons
- Hierarchical function → department relationships
- Idempotent (safe to re-run)
- Multi-tenant ready

**Pharmaceutical Functions:**
1. Research & Development (🔬)
2. Clinical (🏥)
3. Regulatory (📋)
4. Medical Affairs (⚕️)
5. Commercial (📈)
6. Market Access (💼)
7. Manufacturing (🏭)
8. Quality (✓)
9. IT/Digital (💻)
10. Legal (⚖️)
11. Business Development (🤝)
12. Finance (💰)
13. HR (👥)

**Digital Health Functions:**
1. IT/Digital - Product Engineering (💻)
2. Clinical (⚕️)
3. Regulatory (🔒)
4. Operations (⚙️)
5. Commercial - Marketing & Growth (📈)
6. Finance (💰)
7. HR (👥)

---

#### 2. Organizational Roles
**File:** `TEMPLATE_org_roles.sql`
- **Size:** 47KB (562 lines)
- **Roles:** 80+ across all departments
- **Seniority Levels:** executive, senior, mid, junior, entry
- **Coverage:** Complete hierarchy for both industries

**Key Features:**
- Dynamic department ID lookup
- Function and department linkage
- Comprehensive role descriptions
- Idempotent inserts

**Example Pharmaceutical Roles:**
- **Executive:** CEO, CMO, CFO, Head of CMC
- **Medical Affairs:** MSL Director, Medical Science Liaison, Medical Communications Manager
- **Market Access:** HEOR Director, Pricing Lead, Market Access Manager
- **Clinical:** Clinical Trials Manager, Clinical Research Associate
- **R&D:** Discovery Director, Research Scientist
- **Commercial:** Brand Manager, Sales Rep, Key Account Manager

**Example Digital Health Roles:**
- **Executive:** CEO, CTO, CPO, CMO, CDO
- **Product:** Product Manager, Product Designer, UX Researcher
- **Engineering:** Backend Engineer, Frontend Engineer, DevOps Engineer, QA Engineer
- **Data Science:** Data Scientist, ML Engineer, Analytics Engineer
- **Clinical:** Clinical Product Manager, Medical Director
- **Operations:** Customer Success Manager, Support Engineer

---

#### 3. Personas (Medical Affairs)
**File:** `TEMPLATE_personas_seed.sql`
- **Size:** 325KB (7,961 lines)
- **Personas:** 16 complete Medical Affairs personas
- **Research Sources:** 217+ citations
- **Tables Populated:** 20+ junction tables

**Key Features:**
- Fully normalized (no JSONB)
- VPANES scoring methodology
- Complete persona lifecycle data
- Research-backed with evidence sources

**16 Medical Affairs Personas:**
1. MSL Director
2. Medical Science Liaison
3. Medical Communications Manager
4. Medical Writer
5. Publications Manager
6. Evidence Synthesis Lead
7. Medical Advisor
8. Clinical Educator
9. Medical Information Specialist
10. Medical Data Analyst
11. Real-World Evidence Manager
12. Patient Advocacy Lead
13. KOL Engagement Manager
14. Medical Affairs Operations Manager
15. Outcomes Research Manager
16. Clinical Training Specialist

**Data Coverage per Persona:**
- Goals (3-5 per persona)
- Pain Points (4-6 per persona)
- Challenges (3-5 per persona)
- Responsibilities (5-8 per persona)
- Frustrations (3-5 per persona)
- Representative Quotes (2-4 per persona)
- Tools Used (5-10 per persona)
- Communication Channels (4-6 per persona)
- Decision Makers (2-4 per persona)
- Success Metrics (4-6 per persona)
- Motivations (3-5 per persona)
- Personality Traits (4-6 per persona)
- Core Values (3-5 per persona)
- Education (1-3 degrees)
- Certifications (1-4 credentials)
- Typical Day Activities (6-10 per persona)
- Organization Types (2-4 per persona)
- Work Locations (2-4 per persona)
- Evidence Sources (10-20 per persona)
- VPANES Scoring (6 dimensions)

---

## Total Content Statistics

| Metric | Count |
|--------|-------|
| **Templates** | 3 |
| **Total Lines of SQL** | 8,699 |
| **Total Size** | 385KB |
| **Industries Covered** | 2 (Pharma + Digital Health) |
| **Functions** | 20 |
| **Departments** | 28 |
| **Roles** | 80+ |
| **Personas** | 16 |
| **Junction Tables** | 20+ |
| **Research Citations** | 217+ |

---

## How to Use These Templates

### Quick Start - Complete Setup
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds"

export PGPASSWORD='your-password'
export DB_URL="postgresql://postgres:your-password@your-host:5432/postgres"

# 1. Prepare schema (first time only)
cd 00_PREPARATION
for script in *.sql; do psql $DB_URL -f "$script"; done
cd ..

# 2. Load foundation
psql $DB_URL -f "01_foundation/tenants.sql"

# 3. Load organizational structure
psql $DB_URL -c "\set ON_ERROR_STOP on" -f "TEMPLATES/TEMPLATE_org_functions_and_departments.sql"
psql $DB_URL -c "\set ON_ERROR_STOP on" -f "TEMPLATES/TEMPLATE_org_roles.sql"

# 4. Load personas
psql $DB_URL -c "\set ON_ERROR_STOP on" -f "TEMPLATES/TEMPLATE_personas_seed.sql"
```

### Creating Custom Seeds
```bash
# Copy templates
cp TEMPLATES/TEMPLATE_org_functions_and_departments.sql 02_organization/my_org.sql
cp TEMPLATES/TEMPLATE_org_roles.sql 02_organization/my_roles.sql
cp TEMPLATES/TEMPLATE_personas_seed.sql 03_content/my_personas.sql

# Edit files with your data
# Update tenant IDs, customize content

# Load in dependency order
psql $DB_URL -c "\set ON_ERROR_STOP on" -f "02_organization/my_org.sql"
psql $DB_URL -c "\set ON_ERROR_STOP on" -f "02_organization/my_roles.sql"
psql $DB_URL -c "\set ON_ERROR_STOP on" -f "03_content/my_personas.sql"
```

---

## Documentation

All templates are fully documented:

1. **README_TEMPLATES.md** (this file) - Complete template guide
2. **README_CLEAN_STRUCTURE.md** - Directory structure
3. **README_TEMPLATE.md** - Detailed persona guide
4. **QUICK_START.md** - Quick reference
5. **README_FIXES.md** - Schema preparation

---

## Quality Assurance

All templates have been:
- ✅ Tested in production
- ✅ Validated against real databases
- ✅ Made idempotent (safe to re-run)
- ✅ Multi-tenant verified
- ✅ Research-backed (personas)
- ✅ Industry-validated (org structure)

---

**Created:** 2025-11-16
**Status:** Production Ready ✅
**Location:** `/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds/TEMPLATES/`
