# Quick Start: Secure Critical Domains

## ⚠️ Important: Run Migrations in Order

You must run **TWO migrations** in sequence:

---

## Step 1: Create Table Structure

**File**: `database/sql/migrations/2025/20250131000001_unified_rag_domain_architecture.sql`

**What it does**:
- Creates `knowledge_domains_new` table
- Creates ENUM types
- Updates `knowledge_documents` and `document_chunks` tables

**How to run**:
1. Open Supabase Dashboard → SQL Editor
2. Open the file: `database/sql/migrations/2025/20250131000001_unified_rag_domain_architecture.sql`
3. Copy ALL SQL content (Ctrl+A, Ctrl+C)
4. Paste into SQL Editor
5. Click **Run** or press `Ctrl+Enter`

**Wait for**: `✅ Unified RAG Domain Architecture migration completed!`

---

## Step 2: Map Your Critical Domains

**File**: `database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql`

**What it does**:
- Creates `digital_health` and `regulatory_affairs` domains
- Maps your existing documents
- Sets security (enterprise_confidential access)
- Preserves all your uploaded content

**How to run**:
1. In the same SQL Editor (or new query)
2. Open the file: `database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql`
3. Copy ALL SQL content
4. Paste into SQL Editor
5. Click **Run**

**Wait for**: `✅ Critical Domains Mapping Complete!`

---

## Step 3: Verify

Run this in SQL Editor:

```sql
SELECT * FROM verify_critical_domains_mapping();
```

You should see:
- `digital_health` domain with your document counts
- `regulatory_affairs` domain with your document counts
- Both showing `enterprise_confidential` access policy

---

## 🚨 If You Get Errors

### Error: "relation knowledge_domains_new does not exist"
→ **Solution**: Run Step 1 first!

### Error: "type domain_scope does not exist"
→ **Solution**: Run Step 1 first!

### Error: "column access_policy does not exist"
→ **Solution**: Run Step 1 first!

---

## ✅ What Gets Secured

After both migrations:
- ✅ `digital_health` domain exists and is secured
- ✅ `regulatory_affairs` domain exists and is secured
- ✅ All your documents are preserved and linked
- ✅ All your chunks are preserved and linked
- ✅ Access policy: `enterprise_confidential` 🔒
- ✅ Priority weight: `0.95` (High Authority)

---

**Run Step 1 first, then Step 2!** 🚀

