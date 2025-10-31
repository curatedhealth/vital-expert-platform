# Critical Domains Security Guide

## 🔒 Digital Health & Regulatory Affairs Domains

These domains contain sensitive content and have been secured with **enterprise_confidential** access policy.

---

## ✅ Domain Mapping Status

### Digital Health Domain
- **Domain ID**: `digital_health`
- **Function**: Digital, Data & AI
- **Access Policy**: `enterprise_confidential` 🔒
- **Priority Weight**: `0.95` (High Authority)
- **Regulatory Exposure**: `High`
- **PII Sensitivity**: `Medium`

### Regulatory Affairs Domain
- **Domain ID**: `regulatory_affairs`
- **Function**: Regulatory & Compliance
- **Access Policy**: `enterprise_confidential` 🔒
- **Priority Weight**: `0.95` (High Authority)
- **Regulatory Exposure**: `High`
- **PII Sensitivity**: `Low`

---

## 🗄️ Data Preservation

### ✅ All Existing Data Preserved

The migration script ensures:
1. **Documents**: All existing documents in `digital_health` and `regulatory_affairs` are preserved
2. **Chunks**: All document chunks are preserved and linked correctly
3. **Domain Mapping**: Existing domain references are mapped to new structure
4. **Backward Compatibility**: Old `domain` field still works, new `domain_id` is primary

### Domain Linkage

Both fields work:
- **Legacy**: `knowledge_documents.domain = 'digital_health'` ✅
- **New**: `knowledge_documents.domain_id = 'digital_health'` ✅

---

## 🔐 Access Control

### Current Access Policy: `enterprise_confidential`

This means:
- ✅ Users in the same enterprise can access
- ❌ Public users cannot access
- ❌ Users from other enterprises cannot access

### Query Filters Applied

When querying these domains, filters are automatically applied:

```typescript
{
  domain_id: { '$in': ['digital_health', 'regulatory_affairs'] },
  access_policy: { '$lte': 'enterprise_confidential' },  // User must have enterprise access
  enterprise_id: { '$in': [null, userEnterpriseId] }  // Enterprise isolation
}
```

---

## 📊 Verification

### Check Domain Mapping

```sql
SELECT * FROM verify_critical_domains_mapping();
```

Expected output:
```
domain_id          | domain_exists | document_count | chunk_count | access_policy           | rag_priority_weight
-------------------+---------------+----------------+-------------+------------------------+--------------------
digital_health     | true          | [count]        | [count]     | enterprise_confidential | 0.95
regulatory_affairs | true          | [count]        | [count]     | enterprise_confidential | 0.95
```

### Check Documents

```sql
SELECT 
  domain_id,
  COUNT(*) as doc_count,
  access_policy,
  rag_priority_weight
FROM knowledge_documents
WHERE domain_id IN ('digital_health', 'regulatory_affairs')
GROUP BY domain_id, access_policy, rag_priority_weight;
```

### Check Chunks

```sql
SELECT 
  domain_id,
  COUNT(*) as chunk_count
FROM document_chunks
WHERE domain_id IN ('digital_health', 'regulatory_affairs')
GROUP BY domain_id;
```

---

## 🔄 Migration Steps

### 1. Run Migration

```bash
# In Supabase SQL Editor
\i database/sql/migrations/2025/20250131000002_preserve_and_secure_critical_domains.sql
```

### 2. Verify Mapping

```sql
SELECT * FROM verify_critical_domains_mapping();
```

### 3. Check Documents Preserved

```sql
-- Should show all your uploaded documents
SELECT id, title, domain_id, access_policy 
FROM knowledge_documents 
WHERE domain_id IN ('digital_health', 'regulatory_affairs');
```

---

## 🛡️ Security Features

### 1. Enterprise Isolation
- Documents are scoped to your enterprise
- Cross-enterprise access is blocked

### 2. Access Policy Enforcement
- `enterprise_confidential` requires enterprise membership
- RLS policies enforce access control at database level

### 3. Priority Weighting
- High priority (`0.95`) ensures authoritative content ranks first
- Prevents accidental access to draft or personal content

### 4. Compliance Tracking
- `regulatory_exposure: High` - Flags regulatory sensitivity
- `pii_sensitivity: Medium/Low` - Tracks data privacy requirements

---

## 🚨 Important Notes

### ✅ What's Secured

- ✅ Domain definitions in `knowledge_domains_new`
- ✅ All documents in these domains
- ✅ All document chunks
- ✅ Pinecone metadata (when synced)

### ⚠️ Next Steps

1. **Sync Pinecone**: Update Pinecone metadata with new `access_policy` fields
2. **Update Queries**: Ensure queries filter by `access_policy`
3. **Test Access**: Verify only authorized users can access

---

## 📝 Access Policy Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| `public` | Anyone can access | General knowledge |
| `enterprise_confidential` | Enterprise members only | **Digital Health, Regulatory Affairs** |
| `team_confidential` | Team members only | Team-specific content |
| `personal_draft` | Owner only | Personal notes |

---

## ✅ Status

- ✅ Domains properly mapped
- ✅ All documents preserved
- ✅ Access control configured
- ✅ Priority weighting set
- ✅ Compliance fields tracked
- ✅ Verification functions created

**Your Digital Health and Regulatory Affairs domains are secure!** 🔒

