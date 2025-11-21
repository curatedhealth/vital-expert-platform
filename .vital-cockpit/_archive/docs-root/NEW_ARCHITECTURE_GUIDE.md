# Unified RAG Domain Architecture - Setup Guide

## ✅ Architecture Status

The new unified RAG domain architecture is set up and ready to use. This document explains the structure and how to use it when uploading documents.

## 📋 Architecture Components

### 1. **Core Table: `knowledge_domains_new`**

This is the new domain table with enhanced features:

**Key Features:**
- **Hierarchical Structure**: `parent_domain_id` for inheritance
- **Multi-Scope Support**: `domain_scope` = `global`, `enterprise`, or `user`
- **Access Control**: `access_policy` = `public`, `enterprise_confidential`, `team_confidential`, `personal_draft`
- **Priority Weighting**: `rag_priority_weight` (0-1) for retrieval ranking
- **Compliance**: `regulatory_exposure` and `pii_sensitivity` levels

**Key Columns:**
- `domain_id` (TEXT PRIMARY KEY) - e.g., "regulatory_affairs"
- `parent_domain_id` (TEXT) - References another domain_id
- `domain_scope` - global/enterprise/user
- `access_policy` - Security level
- `rag_priority_weight` - Retrieval priority (0-1)
- `function_id` - Function classification
- `tier` - 1=Core, 2=Specialized, 3=Emerging
- `maturity_level` - Established/Specialized/Emerging/Draft

### 2. **Document Tables Updated**

Both `knowledge_documents` and `document_chunks` now have:

**New Columns:**
- `domain_id` (TEXT) - Links to `knowledge_domains_new.domain_id`
- `enterprise_id` (TEXT) - For enterprise-scoped documents
- `owner_user_id` (TEXT) - For user-scoped documents
- `access_policy` - Inherited from domain or custom
- `rag_priority_weight` - Inherited from domain or custom
- `pii_sensitivity` - Data sensitivity level
- `regulatory_exposure` - Regulatory risk level

## 🚀 How to Upload Documents

### Option 1: Using Domain ID (Recommended)

When uploading a document, set the `domain_id` field:

```sql
INSERT INTO public.knowledge_documents (
  title,
  content,
  domain_id,  -- ✅ Use domain_id from knowledge_domains_new
  access_policy,
  rag_priority_weight
)
VALUES (
  'My Document Title',
  'Document content...',
  'regulatory_affairs',  -- Domain ID
  'enterprise_confidential',  -- Optional: Override domain default
  0.95  -- Optional: Override domain default
);
```

### Option 2: Using Legacy Domain Field

If your application still uses the `domain` field, it will work but should be migrated:

```sql
INSERT INTO public.knowledge_documents (
  title,
  content,
  domain  -- Legacy field
)
VALUES (
  'My Document Title',
  'Document content...',
  'regulatory_affairs'  -- Will work but should migrate to domain_id
);
```

The system can auto-link `domain` → `domain_id` if domains exist in `knowledge_domains_new` with matching slugs.

## 📝 Creating Domains

### Create a Global Domain

```sql
INSERT INTO public.knowledge_domains_new (
  domain_id,
  domain_name,
  function_id,
  function_name,
  domain_scope,
  tier,
  maturity_level,
  access_policy,
  rag_priority_weight
)
VALUES (
  'my_new_domain',  -- Unique domain ID
  'My New Domain',  -- Display name
  'regulatory_compliance',  -- Function ID
  'Regulatory & Compliance',  -- Function name
  'global',  -- Scope
  1,  -- Tier (1=Core, 2=Specialized, 3=Emerging)
  'Established'::maturity_level,  -- Maturity
  'public'::access_policy_level,  -- Access policy
  0.9  -- Priority weight
);
```

### Create a Child Domain (Subdomain)

```sql
INSERT INTO public.knowledge_domains_new (
  domain_id,
  parent_domain_id,  -- ✅ Link to parent
  domain_name,
  function_id,
  function_name,
  domain_scope,
  tier,
  maturity_level,
  access_policy,
  rag_priority_weight
)
VALUES (
  'my_subdomain',
  'my_new_domain',  -- Parent domain
  'My Subdomain',
  'regulatory_compliance',
  'Regulatory & Compliance',
  'global',
  2,  -- Specialized tier
  'Specialized'::maturity_level,
  'public'::access_policy_level,
  0.85
);
```

## 🔍 Querying Domains

### Get Domain Hierarchy

```sql
-- Get domain with its parent
SELECT 
  d.domain_id,
  d.domain_name,
  p.domain_name as parent_name
FROM public.knowledge_domains_new d
LEFT JOIN public.knowledge_domains_new p ON d.parent_domain_id = p.domain_id
ORDER BY d.domain_id;
```

### Get Domains by Scope

```sql
-- Global domains
SELECT * FROM public.knowledge_domains_new 
WHERE domain_scope = 'global';

-- Enterprise-specific domains
SELECT * FROM public.knowledge_domains_new 
WHERE domain_scope = 'enterprise' 
  AND enterprise_id = 'your_enterprise_id';
```

### Get Domains by Function

```sql
-- All regulatory domains
SELECT * FROM public.knowledge_domains_new 
WHERE function_id = 'regulatory_compliance';
```

## 🔐 Access Control

The `access_policy` field controls who can access documents:

- **`public`**: Anyone can access
- **`enterprise_confidential`**: Only enterprise members
- **`team_confidential`**: Only team members
- **`personal_draft`**: Only document owner

### Enforce Access Policy in Queries

```sql
-- Only get documents user can access
SELECT *
FROM public.knowledge_documents
WHERE domain_id IN (
  SELECT domain_id 
  FROM public.knowledge_domains_new
  WHERE access_policy = 'public'
     OR (access_policy = 'enterprise_confidential' AND enterprise_id = $1)
);
```

## 🎯 Priority Weighting

The `rag_priority_weight` (0-1) affects retrieval ranking:

- **0.95**: Very high priority (core, authoritative content)
- **0.9**: High priority (standard authoritative content)
- **0.8**: Medium priority (supporting content)
- **0.7**: Lower priority (background context)

Documents with higher `rag_priority_weight` will be ranked higher in RAG retrieval, even if cosine similarity is slightly lower.

## ✅ Verification

Run the verification script to check everything is set up:

```sql
-- Run: database/sql/migrations/2025/VERIFY_ARCHITECTURE.sql
```

This will check:
- ✅ All ENUM types exist
- ✅ `knowledge_domains_new` table exists with all columns
- ✅ All indexes are created
- ✅ `knowledge_documents` has new columns
- ✅ `document_chunks` has new columns
- ✅ Foreign keys are set up correctly

## 📚 Next Steps

1. **Verify Architecture**: Run `VERIFY_ARCHITECTURE.sql`
2. **Seed Domains**: Optionally seed domains from `RAG-Domains.json` (if needed)
3. **Update Upload Logic**: Modify your document upload code to use `domain_id`
4. **Implement Access Control**: Add RLS policies or application-level checks
5. **Use Priority Weighting**: Update RAG retrieval to use `rag_priority_weight`

Your architecture is ready! 🎉

