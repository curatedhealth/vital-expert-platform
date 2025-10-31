# Migration Order - Critical Domains Setup

## ⚠️ Important: Run Migrations in Order

You need to run **TWO migrations** in sequence:

### Step 1: Create Table Structure (MUST RUN FIRST)
**File**: `database/sql/migrations/2025/20250131000001_unified_rag_domain_architecture.sql`

This creates:
- `knowledge_domains_new` table
- ENUM types (domain_scope, access_policy_level, etc.)
- Helper functions
- Updated knowledge_documents and document_chunks columns

### Step 2: Map Critical Domains (RUN SECOND)
**File**: `database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql`

This:
- Creates digital_health and regulatory_affairs domains
- Maps existing documents
- Sets security settings

---

## 📋 Quick Start (Supabase SQL Editor)

### Step 1: Run Table Creation Migration

1. Open Supabase Dashboard → SQL Editor
2. Open file: `database/sql/migrations/2025/20250131000001_unified_rag_domain_architecture.sql`
3. Copy ALL SQL content (Ctrl+A, Ctrl+C)
4. Paste into SQL Editor
5. Click **Run**

**Wait for success message:**
```
✅ Unified RAG Domain Architecture migration completed!
```

### Step 2: Run Domain Mapping Migration

1. In the same SQL Editor (or new query)
2. Open file: `database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql`
3. Copy ALL SQL content
4. Paste into SQL Editor
5. Click **Run**

**Wait for success message:**
```
✅ Critical Domains Mapping Complete!
```

---

## ✅ Verify After Both Migrations

Run this in SQL Editor:

```sql
SELECT * FROM verify_critical_domains_mapping();
```

You should see:
- `digital_health` domain with document/chunk counts
- `regulatory_affairs` domain with document/chunk counts

---

## 🚨 If You Get Errors

### Error: "relation knowledge_domains_new does not exist"
→ **Solution**: Run Step 1 migration first

### Error: "type domain_scope does not exist"
→ **Solution**: Run Step 1 migration first

### Error: "column access_policy does not exist"
→ **Solution**: Run Step 1 migration first

---

## 📝 Alternative: Combined Script

If you want to run everything at once, you can:
1. Copy Step 1 migration SQL
2. Copy Step 2 migration SQL
3. Paste both into SQL Editor in order
4. Run together

