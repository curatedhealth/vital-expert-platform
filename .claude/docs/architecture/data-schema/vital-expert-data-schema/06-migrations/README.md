# Database Migrations - Organized Structure

**Version**: 1.0.0
**Last Updated**: November 23, 2025
**Status**: Active
**Total Migrations**: 392 SQL files

---

## 📁 Directory Structure

```
database/migrations/
├── rls/                    # Row-Level Security migrations
├── seeds/
│   ├── use-cases/         # UC_RA_*, UC_CD_*, UC_MA_* (10 regulatory + 10 clinical + 10 market access)
│   ├── tools/             # Tool registry seeds (35+ healthcare, pharma, academic tools)
│   └── workflows/         # Workflow and prompt framework seeds
└── archived/              # Historical/deprecated migrations
```

---

## 🔐 RLS Migrations (`rls/`)

**Row-Level Security** for multi-tenant isolation:

- `001_enable_rls_comprehensive.sql` - Initial RLS setup
- `001_enable_rls_comprehensive_v2.sql` - Enhanced RLS with tenant isolation

**Purpose**: Enforce tenant-level data isolation at database layer.

---

## 🎯 Use Case Seeds (`seeds/use-cases/`)

### Regulatory Affairs (UC_RA_001 - UC_RA_010)

| Use Case | Description | Parts |
|----------|-------------|-------|
| **UC_RA_001** | SaMD Classification | 2 parts |
| **UC_RA_002** | 510(k) vs De Novo Pathway | 2 parts |
| **UC_RA_003** | Predicate Device Identification | 2 parts |
| **UC_RA_004** | Pre-Submission Meeting Prep | 2 parts |
| **UC_RA_005** | Clinical Evaluation Report | 2 parts |
| **UC_RA_006** | Breakthrough Device Designation | 2 parts |
| **UC_RA_007** | International Harmonization | 2 parts |
| **UC_RA_008** | Cybersecurity Documentation | 2 parts |
| **UC_RA_009** | Software Validation | 2 parts |
| **UC_RA_010** | Post-Market Surveillance | 2 parts |

**Total**: 10 use cases, 20 parts

### Clinical Development (UC_CD_001 - UC_CD_010)

| Use Case | Description | Parts |
|----------|-------------|-------|
| **UC_CD_001** | Clinical Study Design | 2 parts |
| **UC_CD_002** | Patient Recruitment Strategy | 2 parts |
| **UC_CD_003** | RCT Design | 2 parts |
| **UC_CD_004** | Comparator Selection | 2 parts |
| **UC_CD_005** | PRO Instrument Selection | 2 parts |
| **UC_CD_006** | Adaptive Trial Design | 2 parts |
| **UC_CD_007** | Sample Size Calculation | 2 parts |
| **UC_CD_008** | Patient Engagement Metrics | 2 parts |
| **UC_CD_009** | Subgroup Analysis Planning | 2 parts |
| **UC_CD_010** | Protocol Development | 2 parts |

**Total**: 10 use cases, 20 parts

### Market Access (UC_MA_001 - UC_MA_010)

| Use Case | Description | Parts |
|----------|-------------|-------|
| **UC_MA_001** | Value Dossier Development | 2 parts |
| **UC_MA_002** | Health Economics Analysis | 2 parts |
| **UC_MA_003** | CPT/HCPCS Code Strategy | 2 parts |
| **UC_MA_004** | Formulary Positioning | 2 parts |
| **UC_MA_005** | Payer Presentation | 2 parts |
| **UC_MA_006-010** | Additional MA Use Cases | Combined |

**Total**: 10 use cases

---

## 🛠️ Tool Registry Seeds (`seeds/tools/`)

### Healthcare & Pharma Tools (35+ tools)

**Academic & Medical Literature**:
- `36_academic_medical_literature_tools.sql` - PubMed, ClinicalTrials.gov, Cochrane Library, etc.

**Healthcare & Pharma OSS Tools**:
- `37_healthcare_pharma_oss_tools_complete.sql` - 30+ open-source tools
- `37_healthcare_pharma_oss_tools_part1.sql` - First batch

**Strategic Intelligence Tools**:
- `38_strategic_intelligence_tools.sql` - Market intelligence, competitive analysis

**Tool Registry Expansion**:
- `35_expand_tool_registry_30_new_tools.sql` - Additional 30 tools

**LangChain Tools Support**:
- `add_langchain_tools_support.sql` - LangChain integration

**Verification**:
- `VERIFICATION_QUERIES.sql` - Tool registry verification queries

**Total**: 35+ tools across medical research, pharma, healthcare, and strategic intelligence.

---

## ⚙️ Workflow Seeds (`seeds/workflows/`)

### Prompt Framework
- `PROMPTS_FRAMEWORK_SEED.sql` - Base prompt framework
- `UC_RA_001_prompts.sql` - UC_RA_001 prompts
- `UC_RA_001_prompts_streamlined.sql` - Streamlined version
- `UC_CD_002_prompts.sql` - UC_CD_002 prompts
- `LEGACY_PROMPTS_MIGRATION_FORGE.sql` - Legacy prompt migration

### Workflow Configuration
- `setup_session_config.sql` - Session configuration for workflows

### Verification
- `verify_UC_RA_001.sql` - UC_RA_001 verification
- `CHECK_TABLE_CONSTRAINTS.sql` - Table constraint checks

---

## 📊 Migration Statistics

| Category | Files | Description |
|----------|-------|-------------|
| **RLS** | 2 | Multi-tenant security |
| **Use Cases (RA)** | 20 | Regulatory affairs |
| **Use Cases (CD)** | 20 | Clinical development |
| **Use Cases (MA)** | 12 | Market access |
| **Tools** | 8 | Tool registry (35+ tools) |
| **Workflows** | 8 | Prompts & workflows |
| **Verification** | 5 | Verification queries |

**Total**: ~75 organized files (from 392 total)

---

## 🚀 Usage

### Apply RLS Migration
```bash
# Apply RLS to production
psql $DATABASE_URL -f database/migrations/rls/001_enable_rls_comprehensive_v2.sql
```

### Apply Use Case Seeds
```bash
# Apply all UC_RA_001 (SaMD Classification)
psql $DATABASE_URL -f database/migrations/seeds/use-cases/26_ra_001_samd_classification_part1.sql
psql $DATABASE_URL -f database/migrations/seeds/use-cases/26_ra_001_samd_classification_part2.sql
```

### Apply Tool Registry
```bash
# Apply all tools
psql $DATABASE_URL -f database/migrations/seeds/tools/35_expand_tool_registry_30_new_tools.sql
psql $DATABASE_URL -f database/migrations/seeds/tools/36_academic_medical_literature_tools.sql
psql $DATABASE_URL -f database/migrations/seeds/tools/37_healthcare_pharma_oss_tools_complete.sql
psql $DATABASE_URL -f database/migrations/seeds/tools/38_strategic_intelligence_tools.sql
```

### Apply Workflow Seeds
```bash
# Apply prompt framework
psql $DATABASE_URL -f database/migrations/seeds/workflows/PROMPTS_FRAMEWORK_SEED.sql
psql $DATABASE_URL -f database/migrations/seeds/workflows/UC_RA_001_prompts_streamlined.sql
```

---

## 🔍 Verification

### Check Applied Migrations
```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Check use cases loaded
SELECT code, title FROM use_cases ORDER BY code;

-- Check tools loaded
SELECT name, category FROM tool_registry ORDER BY category, name;

-- Check workflows loaded
SELECT id, name FROM workflows ORDER BY name;
```

### Run Verification Scripts
```bash
# Verify UC_RA_001
psql $DATABASE_URL -f database/migrations/seeds/use-cases/verify_UC_RA_001.sql

# Check table constraints
psql $DATABASE_URL -f database/migrations/seeds/workflows/CHECK_TABLE_CONSTRAINTS.sql

# Run verification queries
psql $DATABASE_URL -f database/migrations/seeds/tools/VERIFICATION_QUERIES.sql
```

---

## 📝 Migration Naming Convention

### Use Cases
Format: `{number}_{domain}_{id}_{name}_part{n}.sql`

Examples:
- `26_ra_001_samd_classification_part1.sql`
- `27_ra_002_pathway_determination_part2.sql`
- `16_ma_001_value_dossier_part1.sql`

### Tools
Format: `{number}_{description}.sql`

Examples:
- `35_expand_tool_registry_30_new_tools.sql`
- `36_academic_medical_literature_tools.sql`
- `37_healthcare_pharma_oss_tools_complete.sql`

### Workflows
Format: `{description}.sql` or `UC_{domain}_{id}_{type}.sql`

Examples:
- `PROMPTS_FRAMEWORK_SEED.sql`
- `UC_RA_001_prompts.sql`
- `setup_session_config.sql`

---

## 🎯 Best Practices

1. **Always apply RLS first** before other migrations
2. **Apply use cases in order** (001 → 010)
3. **Apply both parts** of split migrations (part1 then part2)
4. **Run verification** after critical migrations
5. **Test on dev/preview** before production
6. **Backup database** before major migrations

---

## 🔄 Migration Order (Recommended)

```bash
# 1. RLS (Critical - Multi-tenancy)
database/migrations/rls/001_enable_rls_comprehensive_v2.sql

# 2. Tool Registry (Foundation)
database/migrations/seeds/tools/*.sql

# 3. Workflows & Prompts (Foundation)
database/migrations/seeds/workflows/PROMPTS_FRAMEWORK_SEED.sql
database/migrations/seeds/workflows/setup_session_config.sql

# 4. Use Cases (Features)
# Apply in order: UC_RA_001 → UC_RA_010, UC_CD_001 → UC_CD_010, UC_MA_001 → UC_MA_010
database/migrations/seeds/use-cases/*.sql

# 5. Verification
database/migrations/seeds/use-cases/verify_*.sql
database/migrations/seeds/tools/VERIFICATION_QUERIES.sql
```

---

## 📦 Original Location

**Original**: `database/sql/migrations/` and `database/sql/seeds/2025/`  
**Organized**: `database/migrations/` (with subdirectories)  
**Status**: Files copied (originals preserved)

---

## 🎉 Summary

- ✅ **392 total migrations** identified
- ✅ **75+ migrations** organized into categories
- ✅ **30 use cases** across 3 domains (RA, CD, MA)
- ✅ **35+ tools** in tool registry
- ✅ **RLS migrations** for multi-tenancy
- ✅ **Workflow seeds** for prompts and configuration
- ✅ **Verification scripts** for quality assurance

**Status**: Organized and ready for use 🚀

