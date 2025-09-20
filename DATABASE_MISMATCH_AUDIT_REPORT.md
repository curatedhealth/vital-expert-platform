# VITAL Path Database Schema Mismatch Audit Report

**Generated:** 2025-09-19
**System:** VITAL Path Digital Health AI Agent System
**Database:** Supabase (Local Development)

## Executive Summary

This audit identifies mismatches between the Supabase database schema and the backend/frontend interface code. The analysis reveals several critical inconsistencies that need to be addressed for proper system functionality.

## 🔍 Audit Scope

- **Database Tables Analyzed:** 8 tables (agents, capabilities, prompts, etc.)
- **API Routes Analyzed:** 28 API endpoints
- **TypeScript Interfaces:** 5 type definition files
- **Frontend Components:** 15+ React components

---

## 🚨 Critical Mismatches Identified

### 1. AGENTS Table Schema Mismatches

#### **Database Schema (Actual)**
```typescript
// Database agents table (from audit)
{
  id: string,
  name: string,
  display_name: string,
  domain_expertise: string,  // ⚠️ MISMATCH
  business_function: string,
  role: string,
  tier: number,
  priority: number,
  // ... 80+ other fields
}
```

#### **Frontend Interface (Expected)**
```typescript
// src/lib/stores/agents-store.ts
interface Agent {
  id: string,
  name: string,
  display_name: string,
  domain?: string,  // ⚠️ MISMATCH - different field name
  business_function?: string | null,  // ⚠️ MISMATCH - nullable in frontend
  role?: string | null,  // ⚠️ MISMATCH - nullable in frontend
  // ... different field structure
}
```

#### **Digital Health Agent Types (Expected)**
```typescript
// src/types/digital-health-agent.types.ts
interface DigitalHealthAgentConfig {
  name: string,
  display_name: string,
  model: ModelType,  // ⚠️ MISMATCH - enum vs string
  capabilities_list: string[],  // ⚠️ MISMATCH - different field name
  metadata: AgentMetadata,  // ⚠️ MISMATCH - not in DB
}
```

---

### 2. CAPABILITIES Table Schema Mismatches

#### **Database Schema (Actual)**
```typescript
{
  id: string,
  name: string,
  display_name: string,
  category: string,
  domain: string,
  medical_domain: object,  // ⚠️ Additional field not in types
  pharma_protocol: object,  // ⚠️ Additional field not in types
  verify_protocol: object,  // ⚠️ Additional field not in types
  fda_classification: object,  // ⚠️ Additional field not in types
}
```

#### **TypeScript Interface (Expected)**
```typescript
// src/types/digital-health-agent.types.ts
interface Capability {
  capability_id: string,  // ⚠️ MISMATCH - field name
  title: string,  // ⚠️ MISMATCH - vs display_name
  methodology: object,
  required_knowledge: string[],  // ⚠️ MISMATCH - not in DB
  quality_metrics: object,  // ⚠️ MISMATCH - different structure
}
```

#### **Healthcare Compliance Interface (Expected)**
```typescript
// src/types/healthcare-compliance.ts
interface MedicalCapability {
  medical_domain: string,  // ✅ MATCHES DB
  pharma_protocol: PHARMAProtocol | null,  // ⚠️ MISMATCH - structure
  verify_protocol: VERIFYProtocol | null,  // ⚠️ MISMATCH - structure
}
```

---

### 3. PROMPTS Table Schema Mismatches

#### **Database Schema (Actual)**
```typescript
{
  id: string,
  name: string,
  display_name: string,
  system_prompt: string,
  user_prompt_template: object,  // ⚠️ MISMATCH - object vs string
  execution_instructions: object,
  model_requirements: object,
}
```

#### **TypeScript Interface (Expected)**
```typescript
// src/types/digital-health-agent.types.ts
interface PromptTemplate {
  prompt_id: string,  // ⚠️ MISMATCH - field name
  prompt_starter: string,  // ⚠️ MISMATCH - vs display_name
  detailed_prompt: string,  // ⚠️ MISMATCH - vs system_prompt
  input_requirements: string[],  // ⚠️ MISMATCH - not in DB
  output_specification: string,  // ⚠️ MISMATCH - not in DB
}
```

---

### 4. API Interface Mismatches

#### **Agents API Route (src/app/api/agents/route.ts)**
```typescript
// API returns hardcoded values
agents: agentStatuses.map(agent => ({
  tier: 1,  // ⚠️ HARDCODED - should come from DB
  priority: 100,  // ⚠️ HARDCODED - should come from DB
  domain: 'regulatory' as any,  // ⚠️ HARDCODED - should come from DB
}))
```

#### **Capabilities API Route (src/app/api/capabilities/route.ts)**
```typescript
// API queries for fields that may not exist
.eq('medical_domain', domain)  // ⚠️ May not match frontend expectations
.eq('clinical_validation_status', validationStatus)  // ⚠️ Extra field
```

---

### 5. Missing Tables Referenced in Code

#### **Referenced but Missing Tables**
```typescript
❌ jobs: Table not accessible
❌ jtbd_core: Table not accessible
```

#### **Code References to Missing Tables**
- API routes expect `jobs` table for workflow execution
- JTBD (Jobs-to-be-Done) core functionality references missing table
- Several migration files reference these tables but they don't exist

---

## 📊 Field Mapping Mismatches

### Agents Table Field Mapping

| Database Field | Frontend Field | Status | Impact |
|---|---|---|---|
| `domain_expertise` | `domain` | ❌ Mismatch | High |
| `capabilities` (array) | `capabilities` (array) | ✅ Match | Low |
| `business_function` (string) | `business_function` (string\|null) | ⚠️ Nullability | Medium |
| `role` (string) | `role` (string\|null) | ⚠️ Nullability | Medium |
| `tier` (number) | `tier` (number) | ✅ Match | Low |
| `priority` (number) | `priority` (number) | ✅ Match | Low |

### Capabilities Table Field Mapping

| Database Field | Frontend Field | Status | Impact |
|---|---|---|---|
| `name` | `capability_id` | ❌ Mismatch | High |
| `display_name` | `title` | ❌ Mismatch | High |
| `medical_domain` | N/A | ⚠️ Extra | Medium |
| `pharma_protocol` | `pharma_protocol` | ⚠️ Structure | Medium |
| `verify_protocol` | `verify_protocol` | ⚠️ Structure | Medium |

### Prompts Table Field Mapping

| Database Field | Frontend Field | Status | Impact |
|---|---|---|---|
| `name` | `prompt_id` | ❌ Mismatch | High |
| `display_name` | `prompt_starter` | ❌ Mismatch | High |
| `system_prompt` | `detailed_prompt` | ❌ Mismatch | High |
| `user_prompt_template` (object) | N/A | ⚠️ Extra | Low |

---

## 🔧 Recommended Fixes

### Priority 1: Critical Field Name Mismatches

1. **Align Agent Domain Field**
   ```sql
   -- Option 1: Rename database field
   ALTER TABLE agents RENAME COLUMN domain_expertise TO domain;

   -- Option 2: Update frontend to use domain_expertise
   ```

2. **Align Capability ID Fields**
   ```sql
   -- Option 1: Add capability_id field as alias
   ALTER TABLE capabilities ADD COLUMN capability_id VARCHAR(50)
   GENERATED ALWAYS AS (name) STORED;

   -- Option 2: Update all frontend references to use 'name'
   ```

3. **Align Prompt ID Fields**
   ```sql
   -- Option 1: Add prompt_id field as alias
   ALTER TABLE prompts ADD COLUMN prompt_id VARCHAR(50)
   GENERATED ALWAYS AS (name) STORED;

   -- Option 2: Update all frontend references to use 'name'
   ```

### Priority 2: API Route Fixes

1. **Fix Hardcoded Values in Agents API**
   ```typescript
   // src/app/api/agents/route.ts
   agents: agentStatuses.map(agent => ({
     tier: agent.tier,  // Use actual DB value
     priority: agent.priority,  // Use actual DB value
     domain: agent.domain_expertise,  // Use actual DB value
   }))
   ```

2. **Add Missing Table Support**
   ```sql
   -- Create missing jobs table
   CREATE TABLE jobs (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     -- Add fields based on API usage
   );

   -- Create missing jtbd_core table
   CREATE TABLE jtbd_core (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     -- Add fields based on API usage
   );
   ```

### Priority 3: Type Safety Improvements

1. **Update TypeScript Interfaces**
   ```typescript
   // Align all interfaces with actual database schema
   // Add proper optional/nullable field handling
   // Use consistent field naming conventions
   ```

2. **Add Database Type Generation**
   ```bash
   # Use Supabase CLI to generate types
   npx supabase gen types typescript --local > src/types/database.types.ts
   ```

---

## 📈 Impact Assessment

### High Impact Issues (4 found)
- Agent domain field mismatch
- Capability ID field mismatch
- Prompt ID field mismatch
- Missing tables referenced in API

### Medium Impact Issues (6 found)
- Nullable field mismatches
- Extra database fields not used in frontend
- API hardcoded values
- Structure mismatches in complex fields

### Low Impact Issues (3 found)
- Minor field naming inconsistencies
- Optional field presence differences
- Type casting requirements

---

## 🚀 Implementation Plan

### Phase 1: Critical Fixes (Week 1)
1. Fix agent domain field alignment
2. Create missing jobs and jtbd_core tables
3. Fix API hardcoded values
4. Update capability and prompt ID handling

### Phase 2: Structure Alignment (Week 2)
1. Align all TypeScript interfaces with database
2. Fix nullable field handling
3. Update API responses to match frontend expectations
4. Add proper error handling for missing fields

### Phase 3: Optimization (Week 3)
1. Generate types from database schema
2. Add database validation
3. Implement comprehensive testing
4. Add migration scripts for future changes

---

## 🔒 Security & Compliance Notes

- Healthcare compliance fields are properly structured in database
- HIPAA relevant flags are consistently implemented
- Audit trail fields exist but need frontend integration
- Medical validation status tracking is implemented

---

## ✅ Next Steps

1. **Prioritize Critical Fixes**: Address field name mismatches first
2. **Update API Routes**: Fix hardcoded values and missing table references
3. **Align TypeScript Interfaces**: Ensure consistency across all layers
4. **Add Comprehensive Testing**: Verify fixes don't break existing functionality
5. **Documentation Update**: Update API documentation to reflect actual schema

---

**Report Generated By:** Database Audit System
**Contact:** Development Team
**Review Date:** 2025-09-19