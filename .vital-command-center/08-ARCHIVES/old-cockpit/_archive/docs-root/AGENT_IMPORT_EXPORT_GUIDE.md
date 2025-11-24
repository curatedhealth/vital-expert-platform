# Agent Import/Export Guide

> Complete guide for importing and exporting AI agents using JSON files
> Schema Version: 2.1
> Date: October 6, 2025

---

## Overview

The agent data model includes **80+ fields** across multiple categories. This guide explains which fields to include in import files and which are auto-generated or optional.

---

## Quick Start

### Minimal Import File

The absolute minimum required fields:

```json
{
  "name": "my-agent",
  "display_name": "My Agent",
  "tier": 1,
  "status": "active"
}
```

### Recommended Import File

For a production-ready agent:

```json
{
  "name": "my-agent",
  "display_name": "My Agent",
  "description": "Brief description of what this agent does",
  "tier": 1,
  "status": "active",
  "priority": 5,
  "model": "gpt-4-turbo-preview",
  "avatar": "http://..../avatar.png",
  "color": "#3F51B5",
  "capabilities": [
    "Capability 1",
    "Capability 2",
    "Capability 3",
    "Capability 4",
    "Capability 5"
  ],
  "metadata": {
    "architecture_pattern": "REACTIVE",
    "reasoning_method": "DIRECT",
    "communication_tone": "Friendly and Professional",
    "communication_style": "Clear and accessible",
    "primary_mission": "Core mission statement",
    "value_proposition": "Key value delivered",
    "safety_compliance": { ... },
    "performance_targets": { ... },
    "model_justification": "Why this model was selected",
    "evidence_based": true
  },
  "prompt_starters": [
    { "text": "Example prompt 1", "icon": "🔍" },
    { "text": "Example prompt 2", "icon": "💡" }
  ]
}
```

---

## Field Categories

### ✅ Required Fields (MUST include)

```json
{
  "name": "agent-name",           // Machine-readable (lowercase, hyphenated)
  "display_name": "Agent Name",   // Human-readable
  "tier": 1,                      // 1, 2, or 3
  "status": "active"              // active, beta, deprecated, draft
}
```

### 🟢 Highly Recommended (should include for production)

```json
{
  "description": "Brief description",
  "priority": 5,                  // 1-10
  "model": "gpt-4-turbo-preview",
  "avatar": "url or path",
  "color": "#3F51B5",
  "capabilities": [...],          // Min 4-5 items
  "metadata": {
    "architecture_pattern": "REACTIVE",
    "reasoning_method": "DIRECT",
    "safety_compliance": {...},
    "performance_targets": {...}
  }
}
```

### 🟡 Optional (include if relevant)

All other fields are optional and depend on your use case:

- **Visual/Branding**: `version`
- **Model Config**: `temperature`, `max_tokens`, `context_window`, `response_format`
- **Knowledge/RAG**: `rag_enabled`, `knowledge_domains`, `knowledge_sources`
- **Organizational**: `business_function`, `department`, `role`
- **Compliance**: `hipaa_compliant`, `gdpr_compliant`, `regulatory_context`
- **Domain-Specific**: Medical, Legal, Commercial, Reimbursement fields
- **Testing**: `test_scenarios`

### ⛔ Auto-Generated (DO NOT include in import files)

These are automatically set by the system:

```json
{
  "id": "...",                    // Auto-generated UUID
  "created_at": "...",            // Auto-generated timestamp
  "updated_at": "...",            // Auto-generated timestamp
  "search_vector": "...",         // Auto-generated for full-text search
  "total_interactions": 0,        // Calculated from usage
  "error_rate": 0,               // Calculated from monitoring
  "average_response_time": null, // Calculated from monitoring
  "last_interaction": null,      // Updated on each use
  "last_health_check": null,     // Updated by health checks
  "performance_metrics": {},      // Populated by monitoring
  "validation_history": []        // Populated by validation system
}
```

---

## Import by Tier Level

### Tier 1 (Foundational) Template

```json
{
  "name": "patient-education-assistant",
  "display_name": "Patient Education Assistant",
  "description": "Provides clear health information to patients",
  "tier": 1,
  "status": "active",
  "priority": 5,
  "model": "gpt-4-turbo-preview",
  "avatar": "http://localhost/avatars/patient-ed.png",
  "color": "#4CAF50",
  "temperature": 0.6,
  "max_tokens": 4000,
  "rag_enabled": true,
  "capabilities": [
    "General healthcare information",
    "Patient education materials",
    "Medical terminology explanation",
    "Treatment information (non-prescriptive)",
    "Healthcare navigation assistance"
  ],
  "knowledge_domains": [
    "General Health",
    "Patient Education",
    "Medical Terminology"
  ],
  "metadata": {
    "architecture_pattern": "REACTIVE",
    "reasoning_method": "DIRECT",
    "communication_tone": "Friendly and Supportive",
    "communication_style": "Clear and accessible",
    "primary_mission": "Empower patients with clear health information",
    "value_proposition": "Instant access to reliable health info in plain language",
    "safety_compliance": {
      "prohibitions": [
        "Providing definitive medical diagnoses",
        "Recommending treatments without oversight",
        "Accessing PHI",
        "Overriding medical advice"
      ],
      "mandatory_protections": [
        "Prioritize user safety",
        "Maintain privacy",
        "Evidence-based information only",
        "Escalate appropriately"
      ],
      "regulatory_standards": ["General Healthcare Standards"],
      "confidence_thresholds": {
        "minimum_confidence": 75,
        "escalation_threshold": 70,
        "defer_to_human": 60
      }
    },
    "performance_targets": {
      "accuracy_target": 85,
      "response_time_target": 2,
      "user_satisfaction_target": 4.0,
      "escalation_rate_target": 15
    },
    "model_justification": "GPT-4 Turbo for fast, cost-effective responses",
    "evidence_based": true
  },
  "rate_limits": {
    "per_minute": 50,
    "per_hour": 500
  },
  "prompt_starters": [
    { "text": "Explain my diagnosis in simple terms", "icon": "📖" },
    { "text": "What should I ask my doctor?", "icon": "💬" },
    { "text": "Help me understand my treatment", "icon": "💊" },
    { "text": "Find patient education materials", "icon": "📚" }
  ]
}
```

### Tier 2 (Specialist) Additions

Add to Tier 1 template:

```json
{
  "tier": 2,
  "model": "gpt-4-turbo-preview",
  "temperature": 0.5,
  "max_tokens": 6000,
  "domain_expertise": "specialist",
  "metadata": {
    "architecture_pattern": "HYBRID",
    "reasoning_method": "COT",
    "safety_compliance": {
      "confidence_thresholds": {
        "minimum_confidence": 80,
        "escalation_threshold": 75,
        "defer_to_human": 65
      }
    },
    "performance_targets": {
      "accuracy_target": 90,
      "response_time_target": 5,
      "user_satisfaction_target": 4.2,
      "escalation_rate_target": 10
    }
  },
  "rate_limits": {
    "per_minute": 30,
    "per_hour": 200
  }
}
```

### Tier 3 (Expert) Additions

Add to Tier 2 template:

```json
{
  "tier": 3,
  "model": "gpt-4o",
  "temperature": 0.3,
  "max_tokens": 8000,
  "domain_expertise": "expert",
  "evidence_required": true,
  "hipaa_compliant": true,
  "pharma_enabled": true,
  "verify_enabled": true,
  "metadata": {
    "architecture_pattern": "DELIBERATIVE",
    "reasoning_method": "REACT",
    "safety_compliance": {
      "confidence_thresholds": {
        "minimum_confidence": 95,
        "escalation_threshold": 90,
        "defer_to_human": 85
      }
    },
    "performance_targets": {
      "accuracy_target": 99,
      "response_time_target": 10,
      "user_satisfaction_target": 4.5,
      "escalation_rate_target": 5
    },
    "fda_samd_class": "II"
  },
  "regulatory_context": {
    "is_regulated": true,
    "regulations": ["FDA 21 CFR Part 312", "ICH-GCP", "HIPAA"]
  },
  "rate_limits": {
    "per_minute": 10,
    "per_hour": 100
  }
}
```

---

## Domain-Specific Fields

### Medical Domain

```json
{
  "medical_specialty": "Oncology",
  "pharma_enabled": true,
  "verify_enabled": true,
  "hipaa_compliant": true,
  "knowledge_domains": [
    "FDA Guidance Documents",
    "ICH-GCP Guidelines",
    "Clinical Trial Design"
  ],
  "regulatory_context": {
    "is_regulated": true,
    "regulations": ["FDA", "HIPAA", "ICH-GCP"]
  }
}
```

### Legal Domain

```json
{
  "jurisdiction_coverage": ["US", "EU", "UK"],
  "legal_domains": ["Regulatory", "IP", "Corporate"],
  "bar_admissions": ["NY", "CA"],
  "legal_specialties": ["Pharmaceutical Law", "Medical Device Regulation"]
}
```

### Commercial Domain

```json
{
  "market_segments": ["Healthcare Providers", "Hospitals"],
  "customer_segments": ["Physicians", "Nurses"],
  "sales_methodology": "Consultative",
  "geographic_focus": ["North America", "Europe"]
}
```

### Reimbursement Domain

```json
{
  "payer_types": ["Commercial", "Medicare", "Medicaid"],
  "reimbursement_models": ["Fee-for-Service", "Value-Based"],
  "coverage_determination_types": ["LCD", "NCD"],
  "hta_experience": true
}
```

---

## Organizational Structure

Link to existing organizational entities:

```json
{
  "business_function": "Clinical Development",
  "business_function_id": "uuid-here",
  "department": "Clinical Operations",
  "department_id": "uuid-here",
  "role": "Protocol Designer",
  "role_id": "uuid-here"
}
```

**Note**: If you only provide the names (not IDs), the import script should look up the IDs. If IDs are provided, they must be valid UUIDs that exist in the database.

---

## System Prompt Handling

### Option 1: Let System Generate

Don't include `system_prompt` field. The system will auto-generate based on tier and metadata:

```json
{
  "name": "my-agent",
  "tier": 1,
  "metadata": {
    "architecture_pattern": "REACTIVE",
    "reasoning_method": "DIRECT"
  }
}
```

### Option 2: Provide Custom Prompt

Include full system prompt:

```json
{
  "name": "my-agent",
  "system_prompt": "# AGENT SYSTEM PROMPT\n\n## Core Identity\n..."
}
```

---

## Validation Rules

### Name Validation

- **Pattern**: `^[a-z0-9-_]+$`
- **Examples**: ✅ `clinical-trial-designer`, `patient_education`
- **Invalid**: ❌ `Clinical Designer`, `agent#1`, `my agent`

### Tier-Specific Minimums

| Tier | Min Capabilities | Min Accuracy | Max Response Time |
|------|-----------------|--------------|-------------------|
| 1    | 4-5             | 85%          | 2s                |
| 2    | 5-7             | 90%          | 5s                |
| 3    | 7-10            | 99%          | 10s               |

### Required Metadata for Production

All production agents (`status: "active"`) should have:

```json
{
  "metadata": {
    "architecture_pattern": "...",      // Required
    "reasoning_method": "...",          // Required
    "safety_compliance": {...},         // Required
    "performance_targets": {...},       // Required
    "model_justification": "...",       // Recommended
    "evidence_based": true              // Recommended
  }
}
```

---

## Import Workflow

### 1. Prepare JSON File

Create a JSON file following the schema. Example: `my-agent.json`

### 2. Validate Schema

```bash
# Using a JSON schema validator
ajv validate -s docs/AGENT_DATA_MODEL_SCHEMA_V2.1.json -d my-agent.json
```

### 3. Import via Script

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
SUPABASE_SERVICE_ROLE_KEY=your-key \
node scripts/import-agent.js my-agent.json
```

### 4. Verify Import

```bash
# Check agent was created
curl "http://127.0.0.1:54321/rest/v1/agents?name=eq.my-agent" \
  -H "apikey: your-anon-key"
```

---

## Export Workflow

### Export Single Agent

```bash
node scripts/export-agent.js --name my-agent --output my-agent-export.json
```

### Export All Agents by Tier

```bash
node scripts/export-agents-by-tier.js --tier 1 --output tier1-agents.json
```

### Export with Options

```bash
# Minimal export (only core fields)
node scripts/export-agent.js --name my-agent --minimal

# Full export (all fields including auto-generated)
node scripts/export-agent.js --name my-agent --full

# Recommended export (excludes auto-generated, includes all configurable)
node scripts/export-agent.js --name my-agent
```

---

## Common Patterns

### Cloning an Existing Agent

1. Export the agent
2. Change `name` and `display_name`
3. Remove `id` field
4. Modify other fields as needed
5. Import as new agent

```bash
node scripts/export-agent.js --name original-agent --output clone-base.json
# Edit clone-base.json
node scripts/import-agent.js clone-base.json
```

### Bulk Update

1. Export all agents to update
2. Use a script to modify JSON files
3. Re-import with `--update` flag

```bash
node scripts/export-agents-by-tier.js --tier 1 --output tier1.json
# Edit tier1.json (it's an array)
node scripts/bulk-import-agents.js tier1.json --update
```

---

## Best Practices

### ✅ DO

- Include all required fields
- Provide meaningful descriptions
- Define at least 4-5 capabilities
- Set appropriate tier-specific configurations
- Include safety compliance rules
- Provide model justification
- Use semantic versioning for `version` field
- Test with sample queries before production

### ❌ DON'T

- Include auto-generated fields (`id`, `created_at`, etc.)
- Use invalid name patterns (uppercase, spaces, special chars)
- Skip safety_compliance for production agents
- Set unrealistic performance targets
- Omit required metadata fields
- Use placeholder/dummy data in production imports

---

## Troubleshooting

### Import Fails: "Invalid UUID"

**Problem**: Organizational ID fields contain invalid UUIDs

**Solution**: Either omit the ID fields (use names only) or ensure UUIDs are valid and exist in database

### Import Fails: "Name already exists"

**Problem**: Agent with this name already exists

**Solution**: Use different name or add `--update` flag to update existing agent

### Import Succeeds but Agent Doesn't Work

**Problem**: Missing required metadata or system prompt

**Solution**: Check that metadata includes architecture_pattern, reasoning_method, and safety_compliance

### Export Missing Fields

**Problem**: Exported JSON doesn't include some expected fields

**Solution**: Use `--full` flag to export all fields, or check field is actually set in database

---

## Schema Versions

| Version | Date | Changes |
|---------|------|---------|
| 2.1 | Oct 2025 | Complete database schema with all 80+ fields |
| 2.0 | Oct 2025 | Gold standard template with metadata structure |
| 1.0 | Sep 2025 | Initial schema with core fields |

---

## Reference Files

- **Complete Schema**: `docs/AGENT_DATA_MODEL_SCHEMA_V2.1.json`
- **Original Schema**: `docs/AGENT_DATA_MODEL_SCHEMA.json`
- **Tier 1 Template**: `examples/tier1-agent-template.json`
- **Tier 2 Template**: `examples/tier2-agent-template.json`
- **Tier 3 Template**: `examples/tier3-agent-template.json`
- **Database Comparison**: `docs/DATABASE_VS_SCHEMA_COMPARISON.md`

---

## Support

For questions or issues with agent import/export:

1. Check this guide first
2. Validate JSON against schema
3. Review example templates
4. Check database comparison doc for field details

---

*Last Updated: October 6, 2025*
*Schema Version: 2.1*
