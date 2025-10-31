# Unified RAG Domain Architecture - Implementation Guide

## 📋 Overview

This guide implements the unified RAG domain architecture supporting:
- **Multi-scope domains**: Global → Enterprise → User hierarchy
- **Inheritance**: Child domains fall back to parent domains
- **Access control**: RBAC with `access_policy` levels
- **Priority weighting**: `rag_priority_weight` for authoritative ranking
- **Compliance**: PII sensitivity, regulatory exposure tracking

---

## 🗄️ Database Schema Changes

### Migration Status

✅ **Migration Created**: `20250131000001_unified_rag_domain_architecture.sql`

**Key Changes:**
1. New table: `knowledge_domains_new` with TEXT primary key (`domain_id`)
2. Added `parent_domain_id` for hierarchy
3. Added `domain_scope` enum: `global`, `enterprise`, `user`
4. Added `access_policy` enum: `public`, `enterprise_confidential`, `team_confidential`, `personal_draft`
5. Added `rag_priority_weight` (0-1) for retrieval ranking
6. Added compliance fields: `pii_sensitivity`, `regulatory_exposure`, `maturity_level`
7. Added governance fields: `governance_owner`, `last_review_owner_role`
8. Added tenant classification: `tenants_primary`, `tenants_secondary`, `is_cross_tenant`

### Current Schema Gaps

| Required Field | Current Status | Gap |
|---------------|----------------|-----|
| `domain_id` (TEXT PK) | ❌ Uses UUID `id` | Need TEXT primary key |
| `parent_domain_id` | ❌ Not implemented | Need FK hierarchy |
| `domain_scope` | ❌ Not implemented | Need enum support |
| `access_policy` | ❌ Not implemented | Need RBAC |
| `rag_priority_weight` | ❌ Not implemented | Need ranking |
| `enterprise_id` | ❌ Not implemented | Need multi-tenancy |
| `owner_user_id` | ❌ Not implemented | Need user ownership |
| `function_id` | ❌ Not implemented | Need function classification |
| `domain_description_llm` | ❌ Has `description` | Need LLM-specific field |
| `tenants_primary/secondary` | ❌ Not implemented | Need tenant mapping |

---

## 🔄 Data Migration Strategy

### Step 1: Migrate Existing Domains

```sql
-- Migrate from old knowledge_domains to new structure
INSERT INTO public.knowledge_domains_new (
  domain_id,
  parent_domain_id,
  function_id,
  function_name,
  domain_name,
  domain_description_llm,
  domain_scope,
  tier,
  tier_label,
  priority,
  maturity_level,
  regulatory_exposure,
  pii_sensitivity,
  embedding_model,
  rag_priority_weight,
  access_policy,
  slug,
  name,
  description,
  keywords,
  is_active,
  created_at,
  updated_at
)
SELECT 
  slug AS domain_id,  -- Use slug as domain_id
  NULL AS parent_domain_id,  -- No parent initially
  'general' AS function_id,  -- Default function
  'General' AS function_name,
  name AS domain_name,
  description AS domain_description_llm,
  'global' AS domain_scope,  -- All existing are global
  tier,
  CASE 
    WHEN tier = 1 THEN 'Core / High Authority'
    WHEN tier = 2 THEN 'Specialized / High Value'
    WHEN tier = 3 THEN 'Emerging / Future-Focused'
  END AS tier_label,
  priority,
  'Established' AS maturity_level,  -- Default for existing
  'Medium' AS regulatory_exposure,
  'Low' AS pii_sensitivity,
  'text-embedding-3-large' AS embedding_model,
  0.9 AS rag_priority_weight,  -- Default high priority
  'public' AS access_policy,
  slug,
  name,
  description,
  keywords,
  is_active,
  created_at,
  updated_at
FROM public.knowledge_domains
WHERE is_active = true;
```

### Step 2: Seed from RAG-Domains.json

See `scripts/seed-unified-rag-domains.js` for JSON import script.

---

## 📊 Pinecone Metadata Updates

### Current Structure

```typescript
{
  id: 'chunk-uuid',
  values: [0.123, ...],
  metadata: {
    chunk_id: 'chunk-uuid',
    document_id: 'doc-uuid',
    content: 'chunk text...',
    domain: 'regulatory_affairs',  // ❌ OLD: TEXT slug
    source_title: 'FDA Regulations 2024',
    timestamp: '2024-01-15T10:30:00Z'
  }
}
```

### New Structure

```typescript
{
  id: 'chunk-uuid',
  values: [0.123, ...],
  metadata: {
    chunk_id: 'chunk-uuid',
    document_id: 'doc-uuid',
    content: 'chunk text...',
    
    // Domain hierarchy
    domain_id: 'regulatory_affairs',  // ✅ NEW: Primary domain
    parent_domain_id: null,  // ✅ NEW: For fallback queries
    domain_scope: 'global',  // ✅ NEW: Scope filter
    
    // Access control
    enterprise_id: null,  // ✅ NEW: NULL for global
    owner_user_id: null,  // ✅ NEW: NULL for global/enterprise
    access_policy: 'public',  // ✅ NEW: RBAC level
    
    // Ranking
    rag_priority_weight: 0.95,  // ✅ NEW: Priority for ranking
    tier: 1,  // ✅ NEW: Tier (1=Core, 2=Specialized, 3=Emerging)
    maturity_level: 'Established',  // ✅ NEW: Maturity filter
    
    // Compliance
    pii_sensitivity: 'Low',  // ✅ NEW: PII level
    regulatory_exposure: 'High',  // ✅ NEW: Regulatory level
    
    // Legacy
    domain: 'regulatory_affairs',  // Keep for backward compatibility
    source_title: 'FDA Regulations 2024',
    timestamp: '2024-01-15T10:30:00Z'
  }
}
```

### Pinecone Query Updates

**Old Query:**
```typescript
await pineconeVectorService.search({
  text: 'FDA regulations',
  filter: { domain: { '$eq': 'regulatory_affairs' } },
  topK: 10
});
```

**New Query (with hierarchy fallback):**
```typescript
// Get domain hierarchy for fallback
const hierarchy = await getDomainHierarchy('regulatory_affairs');
// Returns: ['regulatory_affairs', parent1, parent2, ...]

await pineconeVectorService.search({
  text: 'FDA regulations',
  filter: {
    domain_id: { '$in': hierarchy },  // Query domain + parents
    domain_scope: { '$in': ['global', 'enterprise'] },  // Scope filter
    access_policy: { '$lte': userAccessLevel },  // RBAC filter
    enterprise_id: { '$in': [null, userEnterpriseId] }  // Multi-tenant
  },
  topK: 10
});

// Re-rank results by rag_priority_weight
results.sort((a, b) => {
  // Primary: priority weight (higher first)
  if (a.rag_priority_weight !== b.rag_priority_weight) {
    return b.rag_priority_weight - a.rag_priority_weight;
  }
  // Secondary: tier (lower first: Tier 1 > Tier 3)
  if (a.tier !== b.tier) {
    return a.tier - b.tier;
  }
  // Tertiary: similarity score (higher first)
  return b.similarity - a.similarity;
});
```

---

## 🔐 Access Control Implementation

### RBAC Service

```typescript
// lib/services/rag/domain-access-service.ts

export interface UserAccessContext {
  enterprise_id?: string;
  user_id: string;
  access_level: 'public' | 'enterprise_confidential' | 'team_confidential' | 'personal_draft';
  tenant_type?: 'Pharmaceutical' | 'Payer' | 'Digital Health Startup' | 'Healthcare Provider';
}

export class DomainAccessService {
  /**
   * Get accessible domains for a user
   */
  async getAccessibleDomains(context: UserAccessContext): Promise<string[]> {
    const { data } = await supabase
      .rpc('get_accessible_domains', {
        p_enterprise_id: context.enterprise_id || null,
        p_user_id: context.user_id,
        p_user_access_level: context.access_level
      });
    
    return data?.map(d => d.domain_id) || [];
  }

  /**
   * Check if user can access a domain
   */
  async canAccessDomain(domainId: string, context: UserAccessContext): Promise<boolean> {
    const accessibleDomains = await this.getAccessibleDomains(context);
    return accessibleDomains.includes(domainId);
  }

  /**
   * Filter domains by tenant type
   */
  filterByTenant(domains: Domain[], tenantType: string): Domain[] {
    return domains.filter(d => 
      d.tenants_primary.includes(tenantType) || 
      d.tenants_secondary.includes(tenantType) ||
      d.is_cross_tenant
    );
  }
}
```

---

## 🎯 Domain Selection (LangGraph Routing)

### Domain Selector Node

```typescript
// features/ask-expert/mode-1/nodes/domain-selector-node.ts

export async function domainSelectorNode(state: AskExpertState) {
  const { query, userContext } = state;
  
  // Step 1: Get accessible domains
  const accessService = new DomainAccessService();
  const accessibleDomainIds = await accessService.getAccessibleDomains({
    enterprise_id: userContext.enterprise_id,
    user_id: userContext.user_id,
    access_level: userContext.access_level,
    tenant_type: userContext.tenant_type
  });

  // Step 2: Fetch domain metadata for routing
  const { data: domains } = await supabase
    .from('knowledge_domains_new')
    .select('domain_id, domain_name, domain_description_llm, function_id, tier')
    .in('domain_id', accessibleDomainIds)
    .eq('is_active', true)
    .order('rag_priority_weight', { ascending: false })
    .order('tier', { ascending: true });

  // Step 3: Use LLM to select best domain
  const routingPrompt = `
Given the user's question, select the single most relevant domain_id from the list below.
If unsure, choose the parent domain that best matches the topic rather than a very narrow child.

User Question: "${query}"

Available Domains:
${domains.map(d => `
- domain_id: ${d.domain_id}
  name: ${d.domain_name}
  description: ${d.domain_description_llm}
  function: ${d.function_id}
  tier: ${d.tier}
`).join('\n')}

Respond with JSON: {"domain_id": "...", "confidence": 0.0-1.0, "reasoning": "..."}
`;

  const llmResponse = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: routingPrompt }],
    response_format: { type: 'json_object' }
  });

  const selection = JSON.parse(llmResponse.choices[0].message.content);
  
  // Step 4: Get hierarchy for fallback
  const { data: hierarchy } = await supabase
    .rpc('get_domain_hierarchy', { domain_id_text: selection.domain_id });

  return {
    primary_domain_id: selection.domain_id,
    fallback_domain_ids: hierarchy.slice(1).map(h => h.domain_id),
    confidence: selection.confidence,
    reasoning: selection.reasoning
  };
}
```

---

## 🔍 Priority-Weighted Retrieval

### Enhanced RAG Service

```typescript
// lib/services/rag/unified-rag-service-v2.ts

export class UnifiedRAGServiceV2 {
  /**
   * Priority-weighted retrieval with domain hierarchy fallback
   */
  async retrieveWithPriority(
    query: string,
    primaryDomainId: string,
    fallbackDomainIds: string[],
    userContext: UserAccessContext,
    options: {
      topK?: number;
      minScore?: number;
    } = {}
  ): Promise<RetrievalResult[]> {
    const allDomainIds = [primaryDomainId, ...fallbackDomainIds];
    
    // Query Pinecone with domain hierarchy
    const results = await pineconeVectorService.search({
      text: query,
      filter: {
        domain_id: { '$in': allDomainIds },
        domain_scope: { 
          '$in': this.getAccessibleScopes(userContext) 
        },
        access_policy: { 
          '$lte': userContext.access_level 
        },
        enterprise_id: { 
          '$in': [null, userContext.enterprise_id] 
        }
      },
      topK: (options.topK || 10) * 3,  // Get more candidates for re-ranking
      minScore: (options.minScore || 0.7) - 0.1  // Lower threshold
    });

    // Re-rank by priority weight
    const ranked = results
      .map(result => ({
        ...result,
        final_score: this.calculateFinalScore(result)
      }))
      .sort((a, b) => b.final_score - a.final_score)
      .slice(0, options.topK || 10);

    return ranked;
  }

  /**
   * Calculate final score combining similarity and priority
   */
  private calculateFinalScore(result: any): number {
    const similarityWeight = 0.6;
    const priorityWeight = 0.4;
    
    return (
      result.similarity * similarityWeight +
      (result.rag_priority_weight || 0.9) * priorityWeight
    );
  }

  /**
   * Get accessible scopes for user
   */
  private getAccessibleScopes(context: UserAccessContext): string[] {
    const scopes: string[] = ['global'];
    
    if (context.enterprise_id) {
      scopes.push('enterprise');
    }
    
    if (context.access_level === 'personal_draft') {
      scopes.push('user');
    }
    
    return scopes;
  }
}
```

---

## 📝 Implementation Checklist

### Phase 1: Database Migration ✅
- [x] Create migration file
- [ ] Run migration in development
- [ ] Migrate existing domain data
- [ ] Seed from RAG-Domains.json
- [ ] Validate data integrity
- [ ] Rename `knowledge_domains_new` → `knowledge_domains`

### Phase 2: Pinecone Updates
- [ ] Update metadata structure in sync scripts
- [ ] Add new fields to vector upsert
- [ ] Update query filters
- [ ] Implement priority-weighted ranking
- [ ] Test hierarchy fallback queries

### Phase 3: Application Code
- [ ] Create `DomainAccessService`
- [ ] Create `DomainHierarchyService`
- [ ] Update `UnifiedRAGService` with priority weighting
- [ ] Create LangGraph domain selector node
- [ ] Update document upload to set new fields
- [ ] Update RAG query endpoints

### Phase 4: Testing
- [ ] Unit tests for domain hierarchy
- [ ] Unit tests for access control
- [ ] Integration tests for retrieval
- [ ] End-to-end tests for routing
- [ ] Performance testing for queries

### Phase 5: Documentation
- [ ] Update API documentation
- [ ] Create domain management guide
- [ ] Create troubleshooting guide
- [ ] Update architecture diagrams

---

## 🚨 Migration Risks & Mitigation

### Risk 1: Breaking Existing Queries
**Impact**: High  
**Mitigation**: 
- Keep `domain` field in metadata for backward compatibility
- Gradual migration: support both old and new queries
- Feature flag for new retrieval logic

### Risk 2: Data Loss During Migration
**Impact**: Critical  
**Mitigation**:
- Full database backup before migration
- Test migration on staging first
- Rollback plan ready

### Risk 3: Performance Degradation
**Impact**: Medium  
**Mitigation**:
- Add indexes for all new filter fields
- Monitor query performance
- Optimize Pinecone filter queries

### Risk 4: Access Control Bugs
**Impact**: High (Security)  
**Mitigation**:
- Comprehensive RBAC unit tests
- Audit logging for all access checks
- Security review before production

---

## 📚 Next Steps

1. **Review migration**: `database/sql/migrations/2025/20250131000001_unified_rag_domain_architecture.sql`
2. **Create seed script**: Extract domains from RAG-Domains.json
3. **Implement services**: DomainAccessService, DomainHierarchyService
4. **Update Pinecone sync**: Add new metadata fields
5. **Update retrieval logic**: Priority-weighted ranking
6. **Test thoroughly**: All access patterns and edge cases

---

**Status**: 🟡 **In Progress** - Migration created, implementation pending.

