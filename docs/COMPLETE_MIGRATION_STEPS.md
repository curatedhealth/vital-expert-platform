# Complete Migration Steps - All in Order

## ✅ Current Status

- ✅ **Step 1 (Minimal)**: `knowledge_domains_new` table created
- ⏳ **Need**: Add missing columns to `knowledge_documents` and `document_chunks`
- ⏳ **Step 2**: Map your critical domains

---

## 📋 Migration Order

### Step 1a: Create Table Structure ✅ DONE
**File**: `database/sql/migrations/2025/20250131000001_unified_rag_domain_architecture_MINIMAL.sql`

**Status**: ✅ **Completed** - Table exists

---

### Step 1b: Add Missing Columns ⚠️ NEED TO RUN

**File**: `database/sql/migrations/2025/20250131000001_add_missing_columns.sql`

**What it does**:
- Adds `domain_id`, `access_policy`, `rag_priority_weight` to `knowledge_documents`
- Adds `domain_id`, `access_policy`, `rag_priority_weight` to `document_chunks`
- Creates indexes

**How to run**:
1. Open Supabase Dashboard → SQL Editor
2. Open: `database/sql/migrations/2025/20250131000001_add_missing_columns.sql`
3. Copy ALL SQL
4. Paste and Run

**OR use Supabase CLI**:
```bash
supabase db execute -f database/sql/migrations/2025/20250131000001_add_missing_columns.sql
```

---

### Step 2: Map Critical Domains ⏳ READY AFTER STEP 1B

**File**: `database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql`

**What it does**:
- Creates `digital_health` domain
- Creates `regulatory_affairs` domain
- Maps your documents
- Sets security (`enterprise_confidential`)
- Preserves all your data

**How to run**:
1. Open Supabase Dashboard → SQL Editor
2. Open: `database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql`
3. Copy ALL SQL
4. Paste and Run

**OR use Supabase CLI**:
```bash
supabase db execute -f database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql
```

---

## ✅ Quick Run (All at Once)

You can run both Step 1b and Step 2 in sequence:

1. **Run Step 1b** (`add_missing_columns.sql`)
   - Wait for success message

2. **Run Step 2** (`preserve_and_secure_critical_domains.sql`)
   - Wait for success message

---

## 🔍 Verify After Step 1b

Check columns were added:

```sql
-- Check knowledge_documents columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'knowledge_documents'
  AND column_name IN ('domain_id', 'access_policy', 'rag_priority_weight');

-- Should return 3 rows
```

---

## 🔍 Verify After Step 2

Run this:

```sql
-- Check domains
SELECT 
  domain_id,
  domain_name,
  access_policy,
  rag_priority_weight
FROM public.knowledge_domains_new
WHERE domain_id IN ('digital_health', 'regulatory_affairs');

-- Check documents
SELECT 
  COALESCE(domain_id, domain) as domain_id,
  COUNT(*) as doc_count
FROM public.knowledge_documents
WHERE COALESCE(domain_id, domain) IN ('digital_health', 'regulatory_affairs')
GROUP BY COALESCE(domain_id, domain);
```

**Expected**: 2 domains, your document counts preserved

---

## 📝 Summary

| Step | File | Status | Next Action |
|------|------|--------|-------------|
| 1a | Minimal table creation | ✅ Done | None |
| 1b | Add missing columns | ⏳ Pending | **RUN THIS** |
| 2 | Map critical domains | ⏳ Pending | Run after 1b |

---

**Run Step 1b first, then Step 2!** 🚀

