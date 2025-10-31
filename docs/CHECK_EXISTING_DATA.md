# Check Existing Document Data

## Situation
The migration successfully created and secured the domains, but no documents are linked to them. This could mean:

1. **No documents exist yet** - You haven't uploaded any documents
2. **Documents exist but use different domain values** - Documents might use different identifiers
3. **Documents are linked via old structure** - Documents might reference the old `knowledge_domains` table with UUIDs

## Run Diagnostic Queries

Run these queries in your Supabase SQL Editor to understand your data structure:

### 1. Check if ANY documents exist:
```sql
SELECT COUNT(*) as total_documents FROM public.knowledge_documents;
```

### 2. See what domain values are actually used:
```sql
SELECT 
  domain,
  domain_id,
  COUNT(*) as document_count
FROM public.knowledge_documents
GROUP BY domain, domain_id
ORDER BY document_count DESC;
```

### 3. Check if documents are linked to OLD knowledge_domains table:
```sql
SELECT 
  kd.id,
  kd.title,
  kd.domain,
  kd.domain_id,
  kd_old.slug as old_domain_slug,
  kd_old.name as old_domain_name
FROM public.knowledge_documents kd
LEFT JOIN public.knowledge_domains kd_old ON kd.domain_id = kd_old.id::text
WHERE kd.domain_id IS NOT NULL
LIMIT 10;
```

### 4. Check what slugs exist in OLD knowledge_domains:
```sql
SELECT 
  id,
  name,
  slug,
  is_active
FROM public.knowledge_domains
WHERE slug LIKE '%digital%' 
   OR slug LIKE '%regulatory%'
   OR slug LIKE '%health%'
ORDER BY slug;
```

### 5. See sample documents:
```sql
SELECT 
  id,
  title,
  domain,
  domain_id,
  created_at
FROM public.knowledge_documents
ORDER BY created_at DESC
LIMIT 10;
```

## Next Steps

Based on the diagnostic results:

### If NO documents exist:
✅ **You're all set!** The domains are secured. When you upload documents:
- Use `domain = 'digital_health'` or `domain = 'regulatory_affairs'`
- Or use `domain_id = 'digital_health'` or `domain_id = 'regulatory_affairs'`
- The system will automatically apply security settings

### If documents EXIST but use different domain values:
You'll need to update them. Share the diagnostic results and I'll help create a migration script to link them.

### If documents are linked to OLD knowledge_domains table:
We'll need to create a migration that:
1. Maps old domain UUIDs to new domain slugs
2. Updates documents to use new `domain_id` values
3. Applies security settings

