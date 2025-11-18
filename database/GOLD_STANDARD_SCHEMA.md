# Gold Standard Database Schema
**Date**: 2025-11-14
**Purpose**: Reference schema for all data transformations and migrations

---

## Platform Resource Tables

### 1. `tools` Table

**Purpose**: Platform-level tools available across all tenants

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | uuid | NO | Primary key |
| `tenant_id` | uuid | YES | Platform tenant (`00000000-0000-0000-0000-000000000000`) or NULL |
| `name` | text | NO | Tool display name |
| `slug` | text | NO | URL-friendly identifier |
| `description` | text | YES | Tool description |
| `tool_type` | text | YES | Type: `statistical`, `edc`, `ctms`, `api`, `research_tool` |
| `integration_name` | text | YES | Integration identifier (e.g., `r-lang`, `sas`, `pubmed-api`) |
| `endpoint_url` | text | YES | API endpoint or documentation URL |
| `authentication_type` | text | YES | Auth method if applicable |
| `configuration` | jsonb | YES | Tool-specific configuration |
| `function_spec` | jsonb | YES | Function signature for AI tools |
| `usage_count` | integer | YES | Number of times used |
| `average_response_time_ms` | integer | YES | Performance metric |
| `success_rate` | numeric | YES | Success rate (0.0-1.0) |
| `is_active` | boolean | YES | Active status (default: true) |
| `requires_approval` | boolean | YES | Requires approval to use |
| `tags` | text[] | YES | Array of tags for categorization |
| `metadata` | jsonb | YES | Additional flexible data (vendor, version, license, use_cases, etc.) |
| `created_at` | timestamp with time zone | NO | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | Last update timestamp |
| `deleted_at` | timestamp with time zone | YES | Soft delete timestamp |

**Unique Constraints:**
- `(tenant_id, slug)` - Each tool must have unique slug per tenant

**Metadata JSON Structure:**
```json
{
  "vendor": "Vendor Name",
  "version": "1.0.0",
  "license": "Commercial|Open Source|Free|GPL-3|Apache-2.0",
  "deployment": "Cloud (SaaS)|Self-hosted|Desktop",
  "use_cases": ["Use case 1", "Use case 2"],
  "key_packages": ["package1", "package2"],
  "compliance": ["21 CFR Part 11", "CDISC", "GCP"],
  "documentation_url": "https://...",
  "tier": 1,
  "priority": "critical|high|medium|low"
}
```

---

### 2. `prompts` Table

**Purpose**: Reusable prompt templates for AI workflows

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | uuid | NO | Primary key |
| `tenant_id` | uuid | YES | Platform tenant or NULL for platform-wide |
| `name` | text | NO | Prompt identifier (e.g., `PRM-CD-002-1.1-INTENDED-USE`) |
| `slug` | text | NO | URL-friendly identifier |
| `description` | text | YES | Prompt description |
| `content` | text | NO | The actual prompt text/template |
| `role_type` | message_role | YES | ENUM: `system`, `user`, `assistant`, `function`, `tool` |
| `category` | text | YES | Category for grouping (e.g., `digital_biomarker_validation`) |
| `complexity` | complexity_type | YES | ENUM: `simple`, `moderate`, `complex`, `expert`, `low`, `medium`, `high`, `very_high` |
| `variables` | jsonb | YES | Variable schema for template interpolation |
| `version` | text | YES | Version number (e.g., `1.0.0`) |
| `is_current_version` | boolean | YES | Is this the current version? |
| `usage_count` | integer | YES | Number of times used |
| `average_rating` | numeric | YES | User rating (0.0-5.0) |
| `success_rate` | numeric | YES | Success rate (0.0-1.0) |
| `is_active` | boolean | YES | Active status (default: true) |
| `validation_status` | validation_status | YES | ENUM: `pending`, `in_review`, `approved`, `rejected`, `requires_update`, `draft`, `needs_revision` |
| `tags` | text[] | YES | Array of tags |
| `metadata` | jsonb | YES | Additional data (model_requirements, temperature, max_tokens, etc.) |
| `created_at` | timestamp with time zone | NO | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | Last update timestamp |
| `deleted_at` | timestamp with time zone | YES | Soft delete timestamp |

**ENUM Types:**
- `message_role`: `system`, `user`, `assistant`, `function`, `tool`
- `complexity_type`: `simple`, `moderate`, `complex`, `expert`, `low`, `medium`, `high`, `very_high`
- `validation_status`: `pending`, `in_review`, `approved`, `rejected`, `requires_update`, `draft`, `needs_revision`

**Unique Constraints:**
- `(tenant_id, slug)` - Each prompt must have unique slug per tenant

**Variables JSON Structure:**
```json
{
  "biomarker_name": {
    "type": "string",
    "required": true,
    "description": "Name of the biomarker"
  },
  "technology_type": {
    "type": "string",
    "required": true,
    "description": "Technology or sensor type"
  }
}
```

**Metadata JSON Structure:**
```json
{
  "prompt_id": "1.1",
  "use_case": "UC_CD_002",
  "workflow_phase": "V1_Verification",
  "task_code": "TSK-CD-002-P1-01",
  "estimated_duration": "2-4 hours",
  "pattern": "CoT|ReAct|Chain|Tree",
  "recommended_model": "claude-3-5-sonnet",
  "temperature": 0.7,
  "max_tokens": 4000,
  "required_capabilities": ["reasoning", "analysis"],
  "related_personas": ["P06_DTXCMO", "P04_REGDIR"]
}
```

---

### 3. `knowledge_domains` Table

**Purpose**: Hierarchical knowledge domain organization

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | uuid | NO | Primary key |
| `tenant_id` | uuid | YES | Platform tenant or NULL for platform-wide |
| `name` | text | NO | Domain name |
| `slug` | text | NO | URL-friendly identifier |
| `description` | text | YES | Domain description |
| `parent_id` | uuid | YES | Parent domain (for hierarchy) |
| `domain_path` | ltree | YES | PostgreSQL ltree path (e.g., `pharma.regulatory.submissions`) |
| `depth_level` | integer | YES | Depth in hierarchy (0 = root) |
| `domain_type` | text | YES | Type: `industry`, `function`, `specialty`, `topic` |
| `icon` | text | YES | Icon identifier for UI |
| `color` | text | YES | Color hex code for UI |
| `is_active` | boolean | YES | Active status (default: true) |
| `created_at` | timestamp with time zone | NO | Creation timestamp |
| `updated_at` | timestamp with time zone | NO | Last update timestamp |
| `deleted_at` | timestamp with time zone | YES | Soft delete timestamp |

**Special Types:**
- `ltree`: PostgreSQL extension for hierarchical labels (e.g., `pharma.regulatory.submissions`)

**Unique Constraints:**
- `(tenant_id, slug)` - Each domain must have unique slug per tenant

**Hierarchy Examples:**
```
Root Level (depth_level = 0):
- Pharmaceuticals
- Digital Health
- Biotechnology

Level 1 (depth_level = 1):
- Pharmaceuticals → Regulatory Affairs
- Pharmaceuticals → Clinical Development
- Pharmaceuticals → Market Access

Level 2 (depth_level = 2):
- Regulatory Affairs → Submissions
- Regulatory Affairs → Labeling
- Clinical Development → Phase 1
```

---

## Data Transformation Guidelines

### 1. From Old `dh_tool` Schema

**Old columns → New columns:**
```
unique_id           → id (UUID)
code                → slug (slugified)
name                → name
tool_description    → description
tool_type           → tool_type
implementation_path → integration_name
category            → tags[] (as array element)
capabilities        → tags[] (merge with category)
vendor              → metadata.vendor
version             → metadata.version
notes               → metadata.notes or description
documentation_url   → endpoint_url OR metadata.documentation_url
```

### 2. From Old Prompts Schema

**Old columns → New columns:**
```
display_name              → name
name                      → slug (if unique) or generate from name
system_prompt             → content (if role_type = 'system')
user_prompt_template      → content (if role_type = 'user')
domain                    → category
complexity_level          → complexity (map to ENUM)
model_requirements        → metadata.recommended_model
input_schema              → variables
prerequisite_capabilities → metadata.required_capabilities
related_capabilities      → metadata.related_personas
status                    → validation_status (map to ENUM)
```

### 3. From Old Knowledge Domains Schema

**Old columns → New columns:**
```
domain_id         → slug (slugified)
domain_name       → name
code              → slug (if different from domain_id)
function_id       → domain_type = 'function'
function_name     → name (for function-type domains)
parent_domain_id  → parent_id (UUID lookup)
tier              → metadata.tier
tier_label        → metadata.tier_label
maturity_level    → metadata.maturity_level
```

**Discard (not in new schema):**
- `tenants_primary`, `tenants_secondary` → Use `tenant_id` instead
- `is_cross_tenant` → Implied by `tenant_id = NULL` (platform-wide)
- `domain_scope`, `enterprise_id`, `owner_user_id` → Not needed
- `regulatory_exposure`, `pii_sensitivity` → Move to metadata if needed
- `lifecycle_stage`, `governance_owner`, `last_review_owner_role` → Move to metadata if needed
- `embedding_model`, `rag_priority_weight`, `access_policy` → Move to metadata if needed

---

## Platform-Level vs Tenant-Specific

**Platform-Level Resources** (shared across all tenants):
- Set `tenant_id` = `00000000-0000-0000-0000-000000000000` (platform tenant)
- OR set `tenant_id` = `NULL` (truly platform-wide)

**Tenant-Specific Resources**:
- Set `tenant_id` to specific tenant UUID
- Examples:
  - Pharmaceuticals: `f7aa6fd4-0af9-4706-8b31-034f1f7accda`
  - Digital Health Startups: `590d9e40-b628-4678-8cec-839d0b4fe968`

---

## Next Steps

1. **Transform Tool Seed Files**: Convert remaining `dh_tool` SQL files to new schema
2. **Transform Prompt Seed Files**: Convert old prompt SQL to new schema
3. **Transform Knowledge Seed Files**: Convert old knowledge domain SQL to new simple hierarchical structure
4. **Create Migration Scripts**: Python scripts to read old data and generate new SQL
5. **Import All Data**: Execute transformed SQL files sequentially

---

## Example Transformations

### Tools Example
**Old:**
```sql
INSERT INTO dh_tool (unique_id, code, name, tool_description, category, vendor, version)
VALUES ('TL-R-STATS', 'TOOL-R-STATS', 'R Statistical Software', 'Statistical computing', 'STATISTICAL_SOFTWARE', 'R Foundation', '4.3+');
```

**New:**
```sql
INSERT INTO tools (id, tenant_id, name, slug, description, tool_type, integration_name, tags, metadata)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'R Statistical Software',
    'r-statistical-software',
    'Statistical computing environment',
    'statistical',
    'r-lang',
    ARRAY['statistical_software', 'open_source'],
    jsonb_build_object('vendor', 'R Foundation', 'version', '4.3+', 'license', 'GPL-3')
);
```

### Prompts Example
**Old:**
```sql
INSERT INTO prompts (name, display_name, system_prompt, complexity_level, domain)
VALUES ('PRM-001', 'Analysis Prompt', 'You are an analyst...', 'INTERMEDIATE', 'clinical_development');
```

**New:**
```sql
INSERT INTO prompts (id, tenant_id, name, slug, content, role_type, complexity, category, metadata)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'PRM-001',
    'prm-001-analysis',
    'You are an analyst...',
    'system',
    'moderate',
    'clinical_development',
    jsonb_build_object('temperature', 0.7, 'max_tokens', 2000)
);
```

### Knowledge Domains Example
**Old:**
```sql
INSERT INTO knowledge_domains (domain_id, domain_name, function_id, tier, maturity_level)
VALUES ('regulatory_affairs', 'Regulatory Affairs', 'reg_compliance', 1, 'Established');
```

**New:**
```sql
INSERT INTO knowledge_domains (id, tenant_id, name, slug, domain_type, depth_level, is_active)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'Regulatory Affairs',
    'regulatory-affairs',
    'function',
    0,
    true
);
```
