# Before You Start - Check Your Current Data

## ⚠️ Important: Check What You Have First

Before running any migrations, verify your current data exists.

---

## ✅ Step 0: Check Your Current Data

Run this in Supabase SQL Editor:

```sql
-- Check if your domains exist
SELECT 
  slug,
  name,
  tier,
  priority,
  is_active
FROM public.knowledge_domains
WHERE slug IN ('digital_health', 'regulatory_affairs');

-- Check your documents
SELECT 
  domain,
  COUNT(*) as document_count
FROM public.knowledge_documents
WHERE domain IN ('digital_health', 'regulatory_affairs')
GROUP BY domain;
```

**Expected Result:**
- Should see `digital_health` domain (if it exists)
- Should see `regulatory_affairs` domain (if it exists)
- Should see your document counts

---

## 🚨 If You Get Error: "relation knowledge_domains does not exist"

This means:
- Your old `knowledge_domains` table doesn't exist
- OR you're using a different table name

**Check what tables you have:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%domain%'
ORDER BY table_name;
```

---

## 📋 Migration Steps (In Order)

### Step 1: Create Table Structure
**MUST RUN FIRST** - Creates `knowledge_domains_new` table

**File**: `database/sql/migrations/2025/20250131000001_unified_rag_domain_architecture.sql`

Run this first!

---

### Step 2: Map Critical Domains  
**RUN SECOND** - Creates your domains in the new table

**File**: `database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql`

Run this after Step 1 completes!

---

## 🔍 After Step 1 (Table Creation)

Once Step 1 completes, you can check:

```sql
-- Check if new table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'knowledge_domains_new';
```

Should return 1 row if successful.

---

## 🔍 After Step 2 (Domain Mapping)

Once Step 2 completes, you can check:

```sql
-- Check your domains in new table
SELECT 
  domain_id,
  domain_name,
  access_policy,
  rag_priority_weight
FROM public.knowledge_domains_new
WHERE domain_id IN ('digital_health', 'regulatory_affairs');
```

Should show 2 rows with your domains secured.

---

## ⚠️ Common Errors

### Error: "relation knowledge_domains_new does not exist"
→ **Solution**: Run Step 1 migration first!

### Error: "type domain_scope does not exist"  
→ **Solution**: Run Step 1 migration first!

### Error: "column access_policy does not exist"
→ **Solution**: Run Step 1 migration first!

---

## ✅ Quick Checklist

Before starting migrations:
- [ ] I can see my domains in `knowledge_domains` table
- [ ] I can see my documents in `knowledge_documents` table
- [ ] I know my document counts

After Step 1:
- [ ] `knowledge_domains_new` table exists
- [ ] ENUM types created (no errors)

After Step 2:
- [ ] Domains exist in `knowledge_domains_new`
- [ ] Documents are linked
- [ ] Access policy is set

---

**Start with checking your current data, then run Step 1!** 🚀

