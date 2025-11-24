# Database Schema vs JSON Schema Comparison

> Comprehensive comparison of actual database fields vs. the JSON schema for agent import/export
> Date: October 6, 2025

---

## Database Fields Present in Actual Schema

### ✅ Core Fields (Matched in JSON Schema)
- `id` - UUID
- `name` - string
- `display_name` - string
- `description` - string
- `tier` - integer (1, 2, 3)
- `status` - string (active, beta, deprecated, draft)
- `priority` - integer
- `avatar` - string
- `model` - string
- `system_prompt` - text
- `capabilities` - array
- `metadata` - jsonb object
- `created_at` - timestamp
- `updated_at` - timestamp

### ⚠️ Additional Database Fields (Not in JSON Schema)

**Visual & Branding**:
- `color` - string (hex color code)
- `version` - string (semver)

**Model Configuration**:
- `temperature` - float (0.0-2.0)
- `max_tokens` - integer
- `context_window` - integer
- `response_format` - string (markdown, json, etc.)

**RAG & Knowledge**:
- `rag_enabled` - boolean
- `knowledge_domains` - array
- `domain_expertise` - string (general, specialist, expert)
- `competency_levels` - jsonb
- `knowledge_sources` - jsonb
- `tool_configurations` - jsonb

**Organizational Structure**:
- `business_function` - string
- `business_function_id` - UUID (FK)
- `department` - string
- `department_id` - UUID (FK)
- `role` - string
- `role_id` - UUID (FK)
- `agent_role_id` - UUID (FK)
- `agent_role` - string

**Lifecycle & Validation**:
- `implementation_phase` - string
- `is_custom` - boolean
- `validation_status` - string (pending, validated, rejected)
- `validation_metadata` - jsonb
- `validation_history` - array
- `reviewer_id` - UUID
- `last_validation_date` - timestamp
- `validation_expiry_date` - timestamp

**Performance & Monitoring**:
- `performance_metrics` - jsonb
- `performance_benchmarks` - jsonb
- `accuracy_score` - float
- `error_rate` - float
- `average_response_time` - float
- `total_interactions` - integer
- `last_interaction` - timestamp
- `last_health_check` - timestamp
- `availability_status` - string (available, busy, offline)

**Compliance & Security**:
- `evidence_required` - boolean
- `regulatory_context` - jsonb
- `compliance_tags` - array
- `hipaa_compliant` - boolean
- `gdpr_compliant` - boolean
- `audit_trail_enabled` - boolean
- `data_classification` - string (public, internal, confidential)

**Domain-Specific (Medical)**:
- `medical_specialty` - string
- `pharma_enabled` - boolean
- `verify_enabled` - boolean

**Domain-Specific (Legal)**:
- `jurisdiction_coverage` - array
- `legal_domains` - array
- `bar_admissions` - array
- `legal_specialties` - array

**Domain-Specific (Commercial)**:
- `market_segments` - array
- `customer_segments` - array
- `sales_methodology` - string
- `geographic_focus` - array

**Domain-Specific (Reimbursement)**:
- `payer_types` - array
- `reimbursement_models` - array
- `coverage_determination_types` - array
- `hta_experience` - boolean

**Cost & Business**:
- `cost_per_query` - decimal
- `target_users` - array

**Agent Relationships**:
- `parent_agent_id` - UUID
- `compatible_agents` - array
- `incompatible_agents` - array
- `prerequisite_agents` - array
- `workflow_positions` - array

**Operational Rules**:
- `escalation_rules` - jsonb
- `confidence_thresholds` - jsonb
- `input_validation_rules` - jsonb
- `output_format_rules` - jsonb
- `citation_requirements` - jsonb
- `rate_limits` - jsonb

**Testing**:
- `test_scenarios` - array

**Audit & Ownership**:
- `created_by` - UUID
- `updated_by` - UUID

**Full-Text Search**:
- `search_vector` - tsvector

**Public Access**:
- `is_public` - boolean
- `is_library_agent` - boolean

**Agent Architecture (Duplicates)**:
Note: These are duplicated from metadata
- `architecture_pattern` - string
- `reasoning_method` - string
- `communication_tone` - string
- `communication_style` - string
- `complexity_level` - string
- `primary_mission` - string
- `value_proposition` - string

---

## Recommendations

### 1. Update JSON Schema to Include All Fields
Add the missing ~40 fields to the JSON schema for complete import/export support.

### 2. Mark Optional vs Required Fields
- **Required**: id, name, display_name, tier, status
- **Recommended**: model, system_prompt, capabilities, metadata
- **Optional**: All domain-specific and advanced configuration fields

### 3. Handle Derived/Computed Fields
Some fields should NOT be in import files (auto-generated):
- `search_vector` - auto-generated from content
- `created_at`, `updated_at` - auto-generated timestamps
- Performance metrics - calculated from usage data

### 4. Organize Fields by Category
Create separate sections in schema:
- Core Identity
- Model Configuration
- Knowledge & RAG
- Organizational Structure
- Compliance & Security
- Performance & Monitoring
- Domain-Specific Extensions
- Operational Configuration

---

## Next Steps

1. ✅ Create comprehensive JSON schema v2.1 with all database fields
2. ✅ Update example templates to include commonly used optional fields
3. ⚠️ Document which fields should be in import files vs. auto-generated
4. ⚠️ Create import validation script to check schema compliance
