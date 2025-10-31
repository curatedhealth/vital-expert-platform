# Quick Run Step 2 Migration

## ⚠️ Supabase CLI Limitation

Supabase CLI doesn't have a direct `db execute` command. Here are your options:

---

## ✅ Option 1: Supabase Dashboard SQL Editor (EASIEST) ⭐ Recommended

### Steps:

1. **Open Supabase Dashboard**
   - Go to your project
   - Click **SQL Editor** in the left sidebar

2. **Open Migration File**
   - File: `database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql`

3. **Copy ALL SQL** (Ctrl+A, Ctrl+C)

4. **Paste into SQL Editor**

5. **Click Run** or press `Ctrl+Enter` / `Cmd+Enter`

**Wait for**: `✅ Critical Domains Mapping Complete!`

---

## ✅ Option 2: Direct Database Connection (psql)

If you have `psql` installed:

```bash
# For local Supabase
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  -f database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql

# For production (replace with your connection string)
psql "postgresql://postgres:[password]@[host]:5432/postgres" \
  -f database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql
```

---

## ✅ Option 3: Use Supabase Migrations System

Add migration to Supabase migrations folder and apply:

```bash
# Copy to supabase/migrations folder
cp database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql \
   supabase/migrations/$(date +%Y%m%d%H%M%S)_preserve_and_secure_critical_domains.sql

# Apply migration
supabase db reset  # This applies all migrations
# OR
supabase migration up  # If available
```

---

## ✅ Option 4: Node.js Script (if needed)

```bash
node scripts/run-step2-migration.js
```

**Note**: Supabase JS client doesn't support raw SQL execution, so this won't work directly. Use Option 1 instead.

---

## 🎯 **RECOMMENDED: Use Option 1 (SQL Editor)**

It's the simplest and most reliable:

1. ✅ No CLI setup needed
2. ✅ Visual feedback
3. ✅ See errors immediately
4. ✅ Works for local and production

---

## ✅ After Running - Verify

Run this in SQL Editor:

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

**Just use Option 1 - it's the easiest!** 🚀

