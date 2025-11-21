# Verify Critical Domains - Simple Queries

## ✅ Quick Verification (No Function Needed)

Run these queries in Supabase SQL Editor to verify your domains:

---

### 1. Check if Domains Exist

```sql
SELECT 
  domain_id,
  domain_name,
  access_policy,
  rag_priority_weight,
  is_active
FROM public.knowledge_domains_new
WHERE domain_id IN ('digital_health', 'regulatory_affairs');
```

**Expected Result:**
- Should show 2 rows (digital_health and regulatory_affairs)
- Both should have `access_policy = 'enterprise_confidential'`
- Both should have `rag_priority_weight = 0.95`

---

### 2. Check Document Counts

```sql
SELECT 
  COALESCE(domain_id, domain) as domain_id,
  COUNT(*) as document_count
FROM public.knowledge_documents
WHERE 
  COALESCE(domain_id, domain) IN ('digital_health', 'regulatory_affairs')
GROUP BY COALESCE(domain_id, domain);
```

**Expected Result:**
- Should show your uploaded document counts per domain

---

### 3. Check Chunk Counts

```sql
SELECT 
  domain_id,
  COUNT(*) as chunk_count
FROM public.document_chunks
WHERE domain_id IN ('digital_health', 'regulatory_affairs')
GROUP BY domain_id;
```

**Expected Result:**
- Should show your chunk counts per domain

---

### 4. Check Security Settings on Documents

```sql
SELECT 
  domain_id,
  access_policy,
  rag_priority_weight,
  COUNT(*) as doc_count
FROM public.knowledge_documents
WHERE 
  COALESCE(domain_id, domain) IN ('digital_health', 'regulatory_affairs')
GROUP BY domain_id, access_policy, rag_priority_weight;
```

**Expected Result:**
- All documents should have `access_policy = 'enterprise_confidential'`
- All documents should have `rag_priority_weight = 0.95`

---

## 🚨 If Function Doesn't Exist

The function `verify_critical_domains_mapping()` is created in **Step 2 migration**. 

If you get the error:
```
ERROR: function verify_critical_domains_mapping() does not exist
```

**Solution**: Make sure Step 2 migration ran successfully. Check:
1. Did you see the success message?
2. Scroll through the migration output for any errors

**Alternative**: Use the simple queries above instead of the function.

---

## 📋 Complete Verification Checklist

After running both migrations, verify:

- [ ] Domains exist in `knowledge_domains_new`
- [ ] Documents are linked (domain_id is set)
- [ ] Chunks are linked (domain_id is set)
- [ ] Access policy is `enterprise_confidential`
- [ ] Priority weight is `0.95`
- [ ] All your documents are still accessible

---

**All these queries work without needing the function!** ✅

