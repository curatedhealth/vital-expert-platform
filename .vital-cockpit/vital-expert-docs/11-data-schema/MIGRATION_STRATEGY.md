# VITAL Platform Multi-Tenant Migration Strategy

## Executive Summary
After completing the multi-tenant app restructuring, we have identified critical database schema mismatches that are preventing proper data display across all three tenant applications. This document outlines a comprehensive migration strategy to align the database schema with the application requirements.

## Current State Analysis

### 1. Schema Mismatches Identified

#### A. Tools Table
**Issue**: API expects `category` column, but table has `category_id` (FK to tool_categories)
- **Current Schema**: `category_id UUID REFERENCES public.tool_categories(id)`
- **API Expectation**: `category TEXT`
- **Missing**: `tenant_id` column for multi-tenant isolation

#### B. Table Name Mismatches
| API Expects | Actual Table Name | Status |
|------------|------------------|--------|
| `chat_messages` | `chat_sessions` + `chat_messages` | Tables exist but need verification |
| `business_functions` | `suite_functions` | Needs mapping |
| `departments` | `org_departments` | Needs mapping |
| `organizational_roles` | `organizational_levels` | Needs mapping |

#### C. Missing Tenant Isolation
Most tables lack `tenant_id` columns, preventing proper multi-tenant data isolation.

### 2. Affected Tenants
1. **Platform Tenant** (00000000-0000-0000-0000-000000000001) - Port 3000
2. **Digital Health Startup** (11111111-1111-1111-1111-111111111111) - Port 3001
3. **Pharmaceuticals** (f7aa6fd4-0af9-4706-8b31-034f1f7accda) - Port 3002

## Migration Strategy

### Phase 1: Schema Alignment (Immediate)

#### 1.1 Tools Table Migration
```sql
-- Add missing columns to tools table
ALTER TABLE public.tools
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Populate category from category_id relationship
UPDATE public.tools t
SET category = tc.name
FROM public.tool_categories tc
WHERE t.category_id = tc.id;

-- Set default tenant for existing data
UPDATE public.tools
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

-- Add NOT NULL constraint after population
ALTER TABLE public.tools
ALTER COLUMN tenant_id SET NOT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tools_tenant_id ON public.tools(tenant_id);
```

#### 1.2 Create View Mappings for Table Name Compatibility
```sql
-- Map business_functions to suite_functions
CREATE OR REPLACE VIEW public.business_functions AS
SELECT * FROM public.suite_functions;

-- Map departments to org_departments
CREATE OR REPLACE VIEW public.departments AS
SELECT * FROM public.org_departments;

-- Map organizational_roles to organizational_levels
CREATE OR REPLACE VIEW public.organizational_roles AS
SELECT * FROM public.organizational_levels;
```

### Phase 2: Multi-Tenant Data Structure (Day 1-2)

#### 2.1 Add Tenant Columns to Core Tables
```sql
-- Add tenant_id to all core tables
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS tenant_id UUID;

ALTER TABLE public.prompts
ADD COLUMN IF NOT EXISTS tenant_id UUID;

ALTER TABLE public.knowledge
ADD COLUMN IF NOT EXISTS tenant_id UUID;

ALTER TABLE public.chat_sessions
ADD COLUMN IF NOT EXISTS tenant_id UUID;

ALTER TABLE public.personas
ADD COLUMN IF NOT EXISTS tenant_id UUID;

ALTER TABLE public.jobs_to_be_done
ADD COLUMN IF NOT EXISTS tenant_id UUID;
```

#### 2.2 Data Migration by Tenant

**Platform Tenant Data (Shared Resources)**
- Keep existing agents, tools, knowledge as platform-wide resources
- Mark with platform tenant ID

**Digital Health Startup Data**
- Clone subset of relevant agents (clinical trial, regulatory)
- Clone relevant tools (FDA, Clinical Trials search)
- Create tenant-specific personas

**Pharmaceuticals Tenant Data**
- Clone pharmaceutical-focused agents
- Clone drug development tools
- Create pharma-specific knowledge base

### Phase 3: Row Level Security (Day 2-3)

#### 3.1 Create RLS Policies
```sql
-- Enable RLS on all tenant-aware tables
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policies
CREATE POLICY "tenant_isolation" ON public.tools
FOR ALL USING (
  tenant_id = current_setting('app.current_tenant')::UUID
  OR tenant_id = '00000000-0000-0000-0000-000000000001'
);
```

### Phase 4: Data Seeding (Day 3-4)

#### 4.1 Seed Tenant-Specific Data
```sql
-- Digital Health Startup specific tools
INSERT INTO public.tools (name, description, category, tenant_id, ...)
SELECT name, description, category, '11111111-1111-1111-1111-111111111111', ...
FROM public.tools
WHERE category IN ('Digital Health', 'Clinical Trials')
AND tenant_id = '00000000-0000-0000-0000-000000000001';

-- Pharmaceuticals specific agents
INSERT INTO public.agents (name, description, tenant_id, ...)
SELECT name, description, 'f7aa6fd4-0af9-4706-8b31-034f1f7accda', ...
FROM public.agents
WHERE business_function IN ('Drug Development', 'Regulatory Affairs')
AND tenant_id = '00000000-0000-0000-0000-000000000001';
```

## Data Sharing Strategy

### Shared (Platform-Level) Data
- **Core Tools**: Calculator, Web Search, PubMed (read-only for all tenants)
- **Base Agents**: Platform expertise agents (cloneable templates)
- **Regulatory Standards**: ICH, ISO, FDA guidelines (read-only)

### Tenant-Specific Data
- **Custom Agents**: Tenant-created or modified agents
- **Private Knowledge**: Proprietary documents and information
- **Chat History**: Isolated per tenant
- **Custom Prompts**: Tenant-specific prompt libraries
- **Personas & JTBD**: Tenant-specific user research

## Implementation Plan

### Immediate Actions (Today)
1. **Run Phase 1.1**: Fix tools table schema mismatch
2. **Run Phase 1.2**: Create view mappings for table compatibility
3. **Test**: Verify Tools, Knowledge, and Prompts pages load data

### Day 1-2
1. **Run Phase 2**: Add tenant columns to all tables
2. **Migrate existing data** to platform tenant
3. **Test multi-tenant filtering** in APIs

### Day 2-3
1. **Implement RLS policies**
2. **Test tenant isolation**
3. **Verify no data leakage**

### Day 3-4
1. **Seed tenant-specific data**
2. **Test all three tenant apps**
3. **Performance optimization**

## Rollback Strategy

Each phase includes rollback scripts:
```sql
-- Phase 1 Rollback
ALTER TABLE public.tools DROP COLUMN IF EXISTS category;
ALTER TABLE public.tools DROP COLUMN IF EXISTS tenant_id;
DROP VIEW IF EXISTS public.business_functions;
DROP VIEW IF EXISTS public.departments;
DROP VIEW IF EXISTS public.organizational_roles;
```

## Success Metrics

1. **Functional**: All pages display correct data
2. **Isolation**: No cross-tenant data leakage
3. **Performance**: Query response times < 200ms
4. **Completeness**: All three tenants have appropriate seed data

## Risk Mitigation

1. **Backup**: Create full database backup before migration
2. **Staging**: Test on staging environment first
3. **Phased Rollout**: Migrate one tenant at a time
4. **Monitoring**: Set up query performance monitoring
5. **Validation**: Automated tests for data integrity

## Next Steps

1. Review and approve migration strategy
2. Create database backup
3. Execute Phase 1 immediately to unblock UI
4. Schedule remaining phases based on team availability