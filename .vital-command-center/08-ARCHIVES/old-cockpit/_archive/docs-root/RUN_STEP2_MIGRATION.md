# Run Step 2 Migration - Map Critical Domains

## ✅ Step 1 Complete!

Your `knowledge_domains_new` table is created. Now run Step 2 to map your Digital Health and Regulatory Affairs domains.

---

## Option 1: Supabase Dashboard SQL Editor (Easiest) ⭐ Recommended

1. **Open Supabase Dashboard**
   - Go to your project → SQL Editor

2. **Open Migration File**
   - File: `database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql`

3. **Copy ALL SQL** (Ctrl+A, Ctrl+C)

4. **Paste into SQL Editor**

5. **Click Run** or press `Ctrl+Enter` / `Cmd+Enter`

**Wait for**: `✅ Critical Domains Mapping Complete!`

---

## Option 2: Supabase CLI

If your project is linked:

```bash
# From project root
supabase db execute -f database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql
```

Or use the script:

```bash
./scripts/run-step2-migration.sh
```

---

## Option 3: Direct SQL Execution (if CLI linked)

```bash
supabase db push --db-url "$SUPABASE_DB_URL" < database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql
```

---

## ✅ What Step 2 Does

1. ✅ Creates `digital_health` domain in `knowledge_domains_new`
2. ✅ Creates `regulatory_affairs` domain in `knowledge_domains_new`
3. ✅ Maps your existing documents (sets `domain_id`)
4. ✅ Maps your existing chunks (sets `domain_id`)
5. ✅ Sets security: `access_policy = 'enterprise_confidential'`
6. ✅ Sets priority: `rag_priority_weight = 0.95`
7. ✅ Creates verification function

---

## 🔍 Verify After Step 2

Run this in SQL Editor:

```sql
-- Quick check
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

-- Check chunks
SELECT 
  domain_id,
  COUNT(*) as chunk_count
FROM public.document_chunks
WHERE domain_id IN ('digital_health', 'regulatory_affairs')
GROUP BY domain_id;
```

**Expected Result:**
- 2 domains in `knowledge_domains_new`
- Your document counts preserved
- Your chunk counts preserved
- Both domains secured with `enterprise_confidential`

---

## 🚨 If You Get Errors

### Error: "column access_policy does not exist"
→ **Solution**: The migration updates `knowledge_documents` and `document_chunks`. These columns should have been added in Step 1. Check if Step 1 fully completed.

**Check Step 1 completion:**
```sql
-- Check if knowledge_documents has new columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'knowledge_documents'
  AND column_name IN ('domain_id', 'access_policy', 'rag_priority_weight');
```

If missing, you may need to complete Step 1 first (the full migration, not just minimal).

---

## ✅ Quick Start (Recommended)

**Just use Option 1 (Supabase Dashboard SQL Editor)** - It's the easiest and most reliable!

1. Copy Step 2 migration SQL
2. Paste into SQL Editor
3. Run
4. Verify

---

**Your domains will be secure after Step 2!** 🔒

