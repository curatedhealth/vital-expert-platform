# Agent Data Model - Complete Reference

> Comprehensive documentation for the complete AI Agent data model
> Version: 2.1
> Date: October 6, 2025

---

## 📋 Overview

This document provides complete reference for the AI Agent data model, which includes **80+ fields** organized across 15 categories. The data model supports:

- ✅ Full agent lifecycle management
- ✅ Tier-based configuration (1, 2, 3)
- ✅ Domain-specific customization (Medical, Legal, Commercial, Reimbursement)
- ✅ Production-grade safety & compliance
- ✅ Performance monitoring & optimization
- ✅ Import/Export for bulk operations

---

## 🗂️ Quick Navigation

### For Developers
- [Complete JSON Schema](#json-schema) → `docs/AGENT_DATA_MODEL_SCHEMA_V2.1.json`
- [Database vs Schema Comparison](#database-comparison) → `docs/DATABASE_VS_SCHEMA_COMPARISON.md`
- [Import/Export Guide](#import-export) → `docs/AGENT_IMPORT_EXPORT_GUIDE.md`

### For Agent Creators
- [Example Templates](#example-templates) → `examples/tier*-agent-template.json`
- [Field Categories](#field-categories)
- [Tier-Specific Configurations](#tier-configurations)

### For Administrators
- [Required vs Optional Fields](#required-fields)
- [Auto-Generated Fields](#auto-generated-fields)
- [Validation Rules](#validation-rules)

---

## 📊 Data Model Summary

### Field Count by Category

| Category | Fields | Required | Optional | Auto-Generated |
|----------|--------|----------|----------|----------------|
| Core Identity | 6 | 4 | 2 | 0 |
| Visual & Branding | 3 | 0 | 3 | 0 |
| Model Configuration | 6 | 1 | 5 | 0 |
| Knowledge & RAG | 6 | 0 | 6 | 0 |
| Tools | 2 | 0 | 2 | 0 |
| Organizational | 8 | 0 | 8 | 0 |
| Compliance & Security | 8 | 0 | 8 | 0 |
| Medical Domain | 3 | 0 | 3 | 0 |
| Legal Domain | 4 | 0 | 4 | 0 |
| Commercial Domain | 4 | 0 | 4 | 0 |
| Reimbursement Domain | 4 | 0 | 4 | 0 |
| Lifecycle & Validation | 9 | 0 | 3 | 6 |
| Performance & Monitoring | 10 | 0 | 0 | 10 |
| Cost & Business | 2 | 0 | 2 | 0 |
| Agent Relationships | 5 | 0 | 5 | 0 |
| Operational Config | 6 | 0 | 6 | 0 |
| Testing | 1 | 0 | 1 | 0 |
| Metadata (comprehensive) | 1 | 0 | 1 | 0 |
| Prompt Starters | 1 | 0 | 1 | 0 |
| Audit & Timestamps | 4 | 0 | 2 | 2 |
| **TOTAL** | **80+** | **4** | **60+** | **18** |

---

## 🔑 Required Fields

Only **4 fields are strictly required** for agent creation:

```json
{
  "name": "agent-name",           // Machine-readable identifier
  "display_name": "Agent Name",   // Human-readable name
  "tier": 1,                      // Complexity tier (1, 2, or 3)
  "status": "active"              // Deployment status
}
```

---

## 🎯 Tier-Specific Configurations {#tier-configurations}

### Tier 1 (Foundational)
**Use Case**: High-volume, general-purpose, accessible

```json
{
  "tier": 1,
  "model": "gpt-4-turbo-preview",
  "temperature": 0.6,
  "metadata": {
    "architecture_pattern": "REACTIVE",
    "reasoning_method": "DIRECT",
    "performance_targets": {
      "accuracy_target": 85,
      "response_time_target": 2,
      "escalation_rate_target": 15
    }
  },
  "rate_limits": {
    "per_hour": 500
  }
}
```

### Tier 2 (Specialist)
**Use Case**: Moderate-volume, domain-specific

```json
{
  "tier": 2,
  "model": "gpt-4-turbo-preview",
  "temperature": 0.5,
  "metadata": {
    "architecture_pattern": "HYBRID",
    "reasoning_method": "COT",
    "performance_targets": {
      "accuracy_target": 90,
      "response_time_target": 5,
      "escalation_rate_target": 10
    }
  },
  "rate_limits": {
    "per_hour": 200
  }
}
```

### Tier 3 (Expert)
**Use Case**: Low-volume, safety-critical, highly specialized

```json
{
  "tier": 3,
  "model": "gpt-4o",
  "temperature": 0.3,
  "metadata": {
    "architecture_pattern": "DELIBERATIVE",
    "reasoning_method": "REACT",
    "performance_targets": {
      "accuracy_target": 99,
      "response_time_target": 10,
      "escalation_rate_target": 5
    }
  },
  "rate_limits": {
    "per_hour": 100
  },
  "evidence_required": true,
  "regulatory_context": {
    "is_regulated": true
  }
}
```

---

## 📁 Field Categories {#field-categories}

### 1. Core Identity (Required)

```json
{
  "id": "uuid",                   // Auto-generated
  "name": "agent-name",           // REQUIRED: lowercase-hyphenated
  "display_name": "Agent Name",   // REQUIRED: Human-readable
  "description": "Brief desc",    // Recommended
  "tier": 1,                      // REQUIRED: 1, 2, or 3
  "status": "active",             // REQUIRED: active|beta|deprecated|draft
  "priority": 5                   // 1-10, higher = more critical
}
```

### 2. Visual & Branding

```json
{
  "avatar": "url or path",        // Icon/avatar URL
  "color": "#3F51B5",            // Hex color code
  "version": "1.0.0"             // Semantic version
}
```

### 3. Model Configuration

```json
{
  "model": "gpt-4-turbo-preview", // LLM model
  "system_prompt": "...",         // Full system prompt (or auto-generated)
  "temperature": 0.6,             // 0.0-2.0
  "max_tokens": 4000,            // Max response tokens
  "context_window": 16000,        // Context window size
  "response_format": "markdown"   // text|markdown|json|html
}
```

### 4. Knowledge & RAG

```json
{
  "rag_enabled": true,
  "capabilities": [...],          // Min 4-5 items
  "knowledge_domains": [...],
  "domain_expertise": "specialist", // general|specialist|expert
  "competency_levels": {...},
  "knowledge_sources": {...}
}
```

### 5. Tools & Integrations

```json
{
  "tools": [
    {
      "name": "Tool Name",
      "description": "What it does",
      "type": "retrieval"  // retrieval|action|computation|integration
    }
  ],
  "tool_configurations": {...}
}
```

### 6. Organizational Structure

```json
{
  "business_function": "Clinical Development",
  "business_function_id": "uuid",
  "department": "Clinical Operations",
  "department_id": "uuid",
  "role": "Protocol Designer",
  "role_id": "uuid",
  "agent_role": "Senior Specialist",
  "agent_role_id": "uuid"
}
```

### 7. Compliance & Security

```json
{
  "evidence_required": true,
  "regulatory_context": {...},
  "compliance_tags": [...],
  "hipaa_compliant": true,
  "gdpr_compliant": true,
  "audit_trail_enabled": true,
  "data_classification": "confidential"  // public|internal|confidential|restricted
}
```

### 8. Domain-Specific: Medical

```json
{
  "medical_specialty": "Oncology",
  "pharma_enabled": true,
  "verify_enabled": true
}
```

### 9. Domain-Specific: Legal

```json
{
  "jurisdiction_coverage": ["US", "EU"],
  "legal_domains": ["Regulatory", "IP"],
  "bar_admissions": ["NY", "CA"],
  "legal_specialties": ["Pharmaceutical Law"]
}
```

### 10. Domain-Specific: Commercial

```json
{
  "market_segments": ["Healthcare Providers"],
  "customer_segments": ["Physicians"],
  "sales_methodology": "Consultative",
  "geographic_focus": ["North America"]
}
```

### 11. Domain-Specific: Reimbursement

```json
{
  "payer_types": ["Commercial", "Medicare"],
  "reimbursement_models": ["Fee-for-Service"],
  "coverage_determination_types": ["LCD"],
  "hta_experience": true
}
```

### 12. Lifecycle & Validation

```json
{
  "implementation_phase": "deployed",  // planning|development|testing|deployed|retired
  "is_custom": false,
  "is_library_agent": true,
  "validation_status": "validated",    // pending|validated|rejected|expired
  "validation_metadata": {...},
  "validation_history": [...],
  "reviewer_id": "uuid",
  "last_validation_date": "timestamp",
  "validation_expiry_date": "timestamp"
}
```

### 13. Performance & Monitoring (Auto-Generated)

```json
{
  "performance_metrics": {...},       // Real-time metrics
  "performance_benchmarks": {...},
  "accuracy_score": 0.92,            // 0.0-1.0
  "error_rate": 0.02,
  "average_response_time": 1500,     // milliseconds
  "total_interactions": 1234,
  "last_interaction": "timestamp",
  "last_health_check": "timestamp",
  "availability_status": "available"  // available|busy|offline|maintenance
}
```

### 14. Cost & Business

```json
{
  "cost_per_query": 0.015,           // USD
  "target_users": ["Clinicians", "Researchers"]
}
```

### 15. Agent Relationships

```json
{
  "parent_agent_id": "uuid",
  "compatible_agents": ["uuid1", "uuid2"],
  "incompatible_agents": [],
  "prerequisite_agents": [],
  "workflow_positions": ["initial", "review"]
}
```

### 16. Operational Configuration

```json
{
  "escalation_rules": {...},
  "confidence_thresholds": {
    "low": 0.7,
    "medium": 0.85,
    "high": 0.95
  },
  "input_validation_rules": {...},
  "output_format_rules": {...},
  "citation_requirements": {...},
  "rate_limits": {
    "per_minute": 60,
    "per_hour": 1000
  }
}
```

### 17. Testing

```json
{
  "test_scenarios": [
    {
      "name": "Test Case 1",
      "input": "Sample input",
      "expected_output": "Expected result",
      "validation_criteria": [...]
    }
  ]
}
```

### 18. Comprehensive Metadata

```json
{
  "metadata": {
    "architecture_pattern": "REACTIVE",        // REACTIVE|DELIBERATIVE|HYBRID|MULTI_AGENT
    "reasoning_method": "DIRECT",              // DIRECT|COT|REACT
    "communication_tone": "Friendly",
    "communication_style": "Clear",
    "primary_mission": "...",
    "value_proposition": "...",
    "safety_compliance": {
      "prohibitions": [...],
      "mandatory_protections": [...],
      "regulatory_standards": [...],
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
    "model_justification": "...",
    "model_citation": "...",
    "evidence_based": true
  }
}
```

### 19. Prompt Starters

```json
{
  "prompt_starters": [
    {
      "text": "Example prompt",
      "icon": "🔍"
    }
  ]
}
```

### 20. Audit & Timestamps

```json
{
  "created_at": "timestamp",         // Auto-generated
  "updated_at": "timestamp",         // Auto-generated
  "created_by": "user_uuid",
  "updated_by": "user_uuid"
}
```

---

## 🚫 Auto-Generated Fields {#auto-generated-fields}

**DO NOT include these in import files** - they are automatically managed:

```json
{
  "id": "...",                       // UUID assigned on creation
  "created_at": "...",               // Timestamp on creation
  "updated_at": "...",               // Timestamp on update
  "search_vector": "...",            // Full-text search index
  "total_interactions": 0,           // Usage counter
  "error_rate": 0,                   // Calculated from logs
  "average_response_time": null,     // Calculated from logs
  "accuracy_score": null,            // Calculated from validations
  "last_interaction": null,          // Updated on each use
  "last_health_check": null,         // Updated by health monitor
  "performance_metrics": {},         // Populated by monitoring
  "performance_benchmarks": {},      // Populated by benchmarking
  "validation_history": []           // Populated by validation system
}
```

---

## ✅ Validation Rules {#validation-rules}

### Name Pattern

```regex
^[a-z0-9-_]+$
```

**Valid**: `clinical-trial-designer`, `patient_education`, `fda-strategist`
**Invalid**: `Clinical Designer`, `agent#1`, `my agent`

### Tier-Based Requirements

| Tier | Min Capabilities | Min Accuracy | Max Response Time | Max Escalation Rate |
|------|-----------------|--------------|-------------------|---------------------|
| 1    | 4-5             | 85%          | 2s                | 15%                 |
| 2    | 5-7             | 90%          | 5s                | 10%                 |
| 3    | 7-10            | 99%          | 10s               | 5%                  |

### Model Selection by Tier

| Tier | Recommended Models |
|------|-------------------|
| 1    | `gpt-4-turbo-preview`, `gpt-4` |
| 2    | `gpt-4-turbo-preview`, `gpt-4o` |
| 3    | `gpt-4o`, `claude-3-opus` |

### Safety Compliance (Production)

All `status: "active"` agents must include:

```json
{
  "metadata": {
    "safety_compliance": {
      "prohibitions": [/* minimum 4 items */],
      "mandatory_protections": [/* minimum 4 items */],
      "regulatory_standards": [/* at least 1 */],
      "confidence_thresholds": {
        "minimum_confidence": 75,      // Tier 1
        "escalation_threshold": 70,
        "defer_to_human": 60
      }
    }
  }
}
```

---

## 📦 Example Templates {#example-templates}

### Complete Examples Available

1. **Tier 1**: `examples/tier1-agent-template.json`
   - Patient Education Assistant
   - Foundational configuration
   - High-volume optimized

2. **Tier 2**: `examples/tier2-agent-template.json`
   - Medical Literature Analyst
   - Specialist configuration
   - Domain-focused

3. **Tier 3**: `examples/tier3-agent-template.json`
   - Pharmacovigilance Signal Analyst
   - Expert configuration
   - Safety-critical, regulatory compliant

---

## 🔗 Related Documentation {#import-export}

### JSON Schema
- **File**: `docs/AGENT_DATA_MODEL_SCHEMA_V2.1.json`
- **Purpose**: Complete JSON schema with all 80+ fields
- **Use**: Validation, IDE autocomplete, documentation

### Database Comparison {#database-comparison}
- **File**: `docs/DATABASE_VS_SCHEMA_COMPARISON.md`
- **Purpose**: Maps database fields to JSON schema
- **Use**: Understanding field sources, database design

### Import/Export Guide
- **File**: `docs/AGENT_IMPORT_EXPORT_GUIDE.md`
- **Purpose**: Step-by-step guide for bulk operations
- **Use**: Importing/exporting agents, cloning, bulk updates

### Tier 1 Update Summary
- **File**: `docs/TIER1_GOLD_STANDARD_UPDATE_SUMMARY.md`
- **Purpose**: Documents the gold standard update process
- **Use**: Understanding update methodology, quality standards

---

## 🎓 Common Use Cases

### Creating a New Agent

**Minimal**:
```json
{
  "name": "my-new-agent",
  "display_name": "My New Agent",
  "tier": 1,
  "status": "draft"
}
```

**Production-Ready**:
```json
{
  "name": "my-new-agent",
  "display_name": "My New Agent",
  "description": "Clear description",
  "tier": 1,
  "status": "active",
  "model": "gpt-4-turbo-preview",
  "capabilities": [/* 5+ items */],
  "metadata": {
    "architecture_pattern": "REACTIVE",
    "reasoning_method": "DIRECT",
    "safety_compliance": {...},
    "performance_targets": {...}
  }
}
```

### Cloning an Agent

1. Export existing agent
2. Remove `id`, `created_at`, `updated_at`
3. Change `name` and `display_name`
4. Modify as needed
5. Import

### Bulk Updating Agents

1. Export agents by tier/filter
2. Modify JSON array
3. Re-import with `--update` flag

---

## 📊 Field Usage Statistics

Based on analysis of existing agents:

| Field | Usage % | Purpose |
|-------|---------|---------|
| name, display_name, tier, status | 100% | Core identity (required) |
| model, capabilities | 100% | Essential configuration |
| metadata.architecture_pattern | 100% | System behavior |
| metadata.safety_compliance | 100% | Production safety |
| avatar, color | 95% | UI/UX |
| knowledge_domains | 80% | RAG configuration |
| business_function, department | 75% | Organization mapping |
| medical_specialty | 30% | Medical domain only |
| legal_domains | 5% | Legal domain only |
| test_scenarios | 20% | QA/validation |

---

## 🔄 Schema Version History

| Version | Date | Changes | Breaking? |
|---------|------|---------|-----------|
| 2.1 | Oct 2025 | Added all 80+ database fields | No |
| 2.0 | Oct 2025 | Gold standard metadata structure | No |
| 1.0 | Sep 2025 | Initial schema with core fields | N/A |

---

## 💡 Best Practices

### ✅ DO

- Always include the 4 required fields
- Provide meaningful descriptions and capabilities
- Set tier-appropriate configurations
- Include comprehensive safety_compliance for production
- Use semantic versioning
- Validate against schema before import
- Test with sample queries before deployment

### ❌ DON'T

- Include auto-generated fields in imports
- Use invalid name patterns
- Skip safety rules for production agents
- Set unrealistic performance targets
- Mix tier-inappropriate configurations
- Deploy without validation

---

## 📞 Support Resources

- **Schema File**: `docs/AGENT_DATA_MODEL_SCHEMA_V2.1.json`
- **Import Guide**: `docs/AGENT_IMPORT_EXPORT_GUIDE.md`
- **Examples**: `examples/tier*.json`
- **Database Docs**: `docs/DATABASE_VS_SCHEMA_COMPARISON.md`

---

*Last Updated: October 6, 2025*
*Schema Version: 2.1*
*Documentation Version: 1.0*
