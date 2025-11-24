# Unified RAG Domain Architecture - Gap Analysis

## 📊 Executive Summary

This document compares the **current RAG domain implementation** with the **new unified architecture** specification.

**Current State**: Basic 30-domain structure with tier/priority classification  
**Target State**: Multi-scope hierarchy (global/enterprise/user) with governance, access control, and priority weighting

---

## 🔍 Schema Comparison

### Knowledge Domains Table

| Field | Current | Target | Gap | Priority |
|-------|---------|--------|-----|----------|
| Primary Key | `id` (UUID) | `domain_id` (TEXT) | ❌ Different type | 🔴 Critical |
| Parent | `parent_id` (exists but unused) | `parent_domain_id` (TEXT FK) | ⚠️ Exists but not implemented | 🔴 Critical |
| Scope | None | `domain_scope` (enum) | ❌ Missing | 🔴 Critical |
| Access Control | None | `access_policy` (enum) | ❌ Missing | 🔴 Critical |
| Priority Weight | None | `rag_priority_weight` (decimal) | ❌ Missing | 🟡 High |
| Enterprise | None | `enterprise_id` (TEXT) | ❌ Missing | 🔴 Critical |
| Owner | None | `owner_user_id` (TEXT) | ❌ Missing | 🔴 Critical |
| Function | None | `function_id`, `function_name` | ❌ Missing | 🟡 Medium |
| LLM Description | `description` (generic) | `domain_description_llm` | ⚠️ Generic field exists | 🟡 Medium |
| Tenants | None | `tenants_primary`, `tenants_secondary`, `is_cross_tenant` | ❌ Missing | 🟡 Medium |
| Maturity | None | `maturity_level` (enum) | ❌ Missing | 🟢 Low |
| Compliance | None | `regulatory_exposure`, `pii_sensitivity` | ❌ Missing | 🟡 Medium |
| Lifecycle | None | `lifecycle_stage` (array) | ❌ Missing | 🟢 Low |
| Governance | None | `governance_owner`, `last_review_owner_role` | ❌ Missing | 🟢 Low |
| Tier | ✅ `tier` (INT) | ✅ `tier` (INT) | ✅ Match | - |
| Priority | ✅ `priority` (INT) | ✅ `priority` (INT) | ✅ Match | - |
| Keywords | ✅ `keywords` (TEXT[]) | ✅ `keywords` (TEXT[]) | ✅ Match | - |
| Metadata | ✅ `metadata` (JSONB) | ✅ `metadata` (JSONB) | ✅ Match | - |
| Timestamps | ✅ `created_at`, `updated_at` | ✅ `created_at`, `updated_at`, `last_reviewed_at` | ⚠️ Missing `last_reviewed_at` | 🟢 Low |

**Summary**: 12 critical gaps, 6 medium gaps, 3 low gaps

---

## 🗄️ Knowledge Documents Table

| Field | Current | Target | Gap | Priority |
|-------|---------|--------|-----|----------|
| Domain Link | `domain` (TEXT slug) | `domain_id` (TEXT FK) | ⚠️ TEXT exists but not FK | 🔴 Critical |
| Enterprise | None | `enterprise_id` (TEXT) | ❌ Missing | 🔴 Critical |
| Owner | None | `owner_user_id` (TEXT) | ❌ Missing | 🟡 High |
| Access Policy | None | `access_policy` (enum) | ❌ Missing | 🔴 Critical |
| Priority Weight | None | `rag_priority_weight` (decimal) | ❌ Missing | 🟡 High |
| Compliance | None | `pii_sensitivity`, `regulatory_exposure` | ❌ Missing | 🟡 Medium |

**Summary**: 4 critical gaps, 3 high gaps, 1 medium gap

---

## 📊 Document Chunks Table

| Field | Current | Target | Gap | Priority |
|-------|---------|--------|-----|----------|
| Domain | Inherited via JOIN | `domain_id` (denormalized) | ⚠️ Not denormalized | 🟡 High |
| Enterprise | None | `enterprise_id` (denormalized) | ❌ Missing | 🟡 High |
| Access Policy | None | `access_policy` (denormalized) | ❌ Missing | 🟡 High |
| Priority Weight | None | `rag_priority_weight` (denormalized) | ❌ Missing | 🟡 Medium |

**Summary**: 4 high gaps, 1 medium gap

---

## 🔍 Pinecone Metadata Structure

| Field | Current | Target | Gap | Priority |
|-------|---------|--------|-----|----------|
| Domain | `domain` (TEXT slug) | `domain_id` (TEXT) | ⚠️ Name mismatch | 🟡 High |
| Parent Domain | None | `parent_domain_id` | ❌ Missing | 🟡 Medium |
| Scope | None | `domain_scope` | ❌ Missing | 🔴 Critical |
| Enterprise | None | `enterprise_id` | ❌ Missing | 🔴 Critical |
| Owner | None | `owner_user_id` | ❌ Missing | 🟡 Medium |
| Access Policy | None | `access_policy` | ❌ Missing | 🔴 Critical |
| Priority Weight | None | `rag_priority_weight` | ❌ Missing | 🔴 Critical |
| Tier | None | `tier` | ❌ Missing | 🟡 Medium |
| Maturity | None | `maturity_level` | ❌ Missing | 🟢 Low |
| Compliance | None | `pii_sensitivity`, `regulatory_exposure` | ❌ Missing | 🟡 Medium |

**Summary**: 4 critical gaps, 5 high gaps, 2 medium gaps, 1 low gap

---

## 🔐 Access Control & RBAC

| Feature | Current | Target | Gap | Priority |
|---------|---------|--------|-----|----------|
| Access Policy Levels | None | 4 levels (public, enterprise, team, personal) | ❌ Missing | 🔴 Critical |
| Enterprise Isolation | None | `enterprise_id` filtering | ❌ Missing | 🔴 Critical |
| User Ownership | None | `owner_user_id` filtering | ❌ Missing | 🟡 High |
| RLS Policies | Basic (public read) | Multi-tenant RLS | ⚠️ Needs upgrade | 🔴 Critical |
| Access Helper Functions | None | `get_accessible_domains()` | ❌ Missing | 🔴 Critical |

**Summary**: 4 critical gaps, 1 high gap

---

## 🔗 Domain Hierarchy & Inheritance

| Feature | Current | Target | Gap | Priority |
|---------|---------|--------|-----|----------|
| Parent-Child Links | `parent_id` exists but unused | `parent_domain_id` with FK | ⚠️ Exists but not used | 🔴 Critical |
| Hierarchy Queries | None | Recursive CTE functions | ❌ Missing | 🔴 Critical |
| Fallback Logic | None | Query parent chain | ❌ Missing | 🔴 Critical |
| Scope Inheritance | None | global → enterprise → user | ❌ Missing | 🔴 Critical |

**Summary**: 4 critical gaps

---

## 🎯 Priority-Weighted Retrieval

| Feature | Current | Target | Gap | Priority |
|---------|---------|--------|-----|----------|
| Priority Weight | None | `rag_priority_weight` (0-1) | ❌ Missing | 🔴 Critical |
| Ranking Algorithm | Similarity only | Similarity + Priority + Tier | ❌ Missing | 🔴 Critical |
| Maturity Filtering | None | Filter by `maturity_level` | ❌ Missing | 🟡 Medium |
| Tier Boosting | None | Tier-based ranking | ❌ Missing | 🟡 Medium |

**Summary**: 2 critical gaps, 2 medium gaps

---

## 🧭 Domain Routing & Selection

| Feature | Current | Target | Gap | Priority |
|---------|---------|--------|-----|----------|
| LLM Routing | Basic domain selection | Domain selector with hierarchy | ⚠️ Basic exists | 🟡 High |
| Function Classification | None | Route by `function_id` | ❌ Missing | 🟡 Medium |
| Tenant-Aware Routing | None | Filter by tenant type | ❌ Missing | 🟡 Medium |
| Scope-Aware Routing | None | Prefer enterprise over global | ❌ Missing | 🟡 Medium |

**Summary**: 1 high gap, 3 medium gaps

---

## 📈 Summary Statistics

### Gap Severity Breakdown

| Severity | Count | Percentage |
|----------|-------|------------|
| 🔴 Critical | 29 | 63% |
| 🟡 High | 10 | 22% |
| 🟡 Medium | 9 | 19% |
| 🟢 Low | 2 | 4% |
| **Total** | **50** | **100%** |

### Implementation Priority

**Phase 1 (Critical - 29 gaps)**:
- Schema migration (primary key, hierarchy, scope, access)
- RBAC implementation
- Priority-weighted retrieval
- Pinecone metadata updates

**Phase 2 (High - 10 gaps)**:
- Denormalization for chunks
- Enhanced routing
- User ownership
- Compliance fields

**Phase 3 (Medium - 9 gaps)**:
- Function classification
- Tenant mapping
- Lifecycle stages
- Governance fields

**Phase 4 (Low - 2 gaps)**:
- Maturity tracking
- Review timestamps

---

## ✅ What's Already Working

1. ✅ **Basic domain structure**: 30 domains with tier/priority
2. ✅ **Domain-specific RAG service**: `DomainSpecificRAGService` exists
3. ✅ **Cross-domain queries**: Multi-domain search works
4. ✅ **Pinecone integration**: Vector storage and retrieval functional
5. ✅ **Metadata filtering**: Domain filtering via metadata works
6. ✅ **Indexes**: Performance indexes exist

---

## 🚨 Critical Path Items

1. **Schema Migration** (🔴 Critical)
   - Primary key change (UUID → TEXT)
   - Add hierarchy support
   - Add scope enum
   - Add access policy enum

2. **RBAC Implementation** (🔴 Critical)
   - Access policy levels
   - Enterprise isolation
   - User ownership
   - RLS policies

3. **Priority Weighting** (🔴 Critical)
   - Add `rag_priority_weight` field
   - Implement ranking algorithm
   - Update retrieval logic

4. **Pinecone Updates** (🔴 Critical)
   - Update metadata structure
   - Add new filter fields
   - Implement hierarchy queries

5. **Domain Hierarchy** (🔴 Critical)
   - Implement parent-child links
   - Create fallback queries
   - Update routing logic

---

## 📋 Migration Readiness

### Ready ✅
- Migration SQL file created
- Implementation guide written
- Gap analysis complete

### Pending ⏳
- JSON data extraction script
- Seed script for domains
- Service implementations
- Code updates
- Testing

---

## 🎯 Next Actions

1. **Extract domains from RAG-Domains.json** → Create seed script
2. **Run migration in development** → Test schema changes
3. **Migrate existing data** → Preserve current domains
4. **Seed new domains** → Import from JSON
5. **Update Pinecone sync** → Add new metadata fields
6. **Implement services** → DomainAccessService, DomainHierarchyService
7. **Update retrieval logic** → Priority-weighted ranking
8. **Update routing** → LangGraph domain selector
9. **Test thoroughly** → All access patterns
10. **Deploy to production** → Gradual rollout

---

**Status**: 🟡 **Ready for Implementation** - Migration created, pending data migration and code updates.

