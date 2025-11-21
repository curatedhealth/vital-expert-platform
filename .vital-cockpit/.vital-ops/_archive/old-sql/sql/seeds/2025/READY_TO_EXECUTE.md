# 🚀 READY TO EXECUTE: Regulatory Affairs Use Cases

PostgreSQL client (`psql`) is now installed! ✅

---

## 📋 Quick Start

### Step 1: Get Your Database Password

1. Go to: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/settings/database
2. Find "Database password"
3. Click "Show" to reveal it
4. Copy the password

### Step 2: Execute the Script

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025"
./execute_all_ra_usecases_psql.sh
```

The script will:
- ✅ Prompt you for your database password (securely, no echo)
- ✅ Execute all 10 SQL files in order
- ✅ Show you success/failure for each file
- ✅ Display verification output from each use case

---

## 🔍 What You'll See

For each successfully executed file, you'll see output like:

```
NOTICE:  ✓ Using tenant_id: b8026534-02a7-4d24-bf4c-344591964e02
NOTICE:  
NOTICE:  ========================================
NOTICE:  UC_RA_001: FDA Software Classification (SaMD)
NOTICE:  ========================================
NOTICE:  Tasks: 6, Agents: 11, Personas: 7, Tools: 3, RAGs: 5
NOTICE:  ========================================
NOTICE:  ✓ UC_RA_001 seeded successfully!
```

---

## 📁 Files to Execute

All 10 files are ready:
1. UC_RA_001.sql - FDA Software Classification (6 tasks)
2. UC_RA_002.sql - 510(k) vs De Novo Pathway (6 tasks)
3. UC_RA_003.sql - Predicate Device Identification (5 tasks)
4. UC_RA_004.sql - Pre-Submission Meeting Prep (7 tasks)
5. UC_RA_005.sql - Clinical Evaluation Report (8 tasks)
6. UC_RA_006.sql - FDA Breakthrough Designation (6 tasks)
7. UC_RA_007.sql - International Harmonization (9 tasks)
8. UC_RA_008.sql - Cybersecurity Documentation (7 tasks)
9. UC_RA_009.sql - Software Validation (8 tasks)
10. UC_RA_010.sql - Post-Market Surveillance (6 tasks)

**Total: 68 tasks across 10 use cases**

---

## 🔧 Alternative: Manual Execution

If you prefer to run files individually:

```bash
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025"

# Get your password first
DB_PASSWORD="your-password-here"

# Then execute each file
psql "postgresql://postgres:${DB_PASSWORD}@db.xazinxsiglqokwfmogyk.supabase.co:5432/postgres" -f UC_RA_001.sql
psql "postgresql://postgres:${DB_PASSWORD}@db.xazinxsiglqokwfmogyk.supabase.co:5432/postgres" -f UC_RA_002.sql
# ... etc
```

---

## ⚠️ Prerequisites Check

Before running, make sure:
- ✅ PostgreSQL is installed (`psql` is in PATH)
- ✅ You have your Supabase database password
- ✅ The tenant `digital-health-startup` exists in your database
- ✅ Foundation data is seeded (agents, personas, tools, RAG sources, domain 'RA')

---

## 💡 Troubleshooting

**"Tenant not found" error:**
```sql
-- Check if tenant exists:
SELECT * FROM tenants WHERE slug = 'digital-health-startup';
```

**Foreign key errors:**
Make sure foundation tables are populated:
- `dh_agent` (agents like AGT-REGULATORY-STRATEGY)
- `dh_persona` (personas like P03_REGDIR)
- `dh_tool` (tools like TOOL-REGULATORY-DB)
- `dh_rag_source` (RAG sources like RAG-FDA-GUIDANCE)
- `dh_domain` (domain 'RA' must exist)

---

## 🎯 Ready to Go!

Run the script now:
```bash
./execute_all_ra_usecases_psql.sh
```

🚀 Let's seed those use cases!

