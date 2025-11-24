# Function Seed Data Template

## Overview
Use this template to create organizational functions for a tenant. Functions are the top-level organizational divisions (e.g., Medical Affairs, Commercial, R&D).

## Template Structure

### Basic Function JSON
```json
{
  "function": {
    "tenant_id": "<tenant_uuid>",
    "name": "Function Name",
    "slug": "function-name",
    "description": "Brief description of this function's purpose and scope",
    "mission_statement": "Detailed mission statement explaining the function's strategic role",
    "category": "core | support | strategic",
    "is_revenue_generating": true,
    "is_regulatory_critical": true,
    "hierarchy_level": 1,
    "sequence_order": 1,
    "is_active": true
  }
}
```

### Full Function Template with All Attributes
```json
{
  "function": {
    "tenant_id": "<tenant_uuid>",
    "name": "Medical Affairs",
    "slug": "medical-affairs",
    "description": "Provides medical and scientific expertise to support product development and commercialization",
    "mission_statement": "To ensure the safe and effective use of medicines through evidence-based medical leadership and stakeholder engagement",
    "category": "core",
    "is_revenue_generating": false,
    "is_regulatory_critical": true,
    "hierarchy_level": 1,
    "sequence_order": 1,
    "typical_team_size_min": 50,
    "typical_team_size_max": 500,
    "typical_budget_range_min_usd": 5000000,
    "typical_budget_range_max_usd": 50000000,
    "regulatory_sensitivity": "high",
    "patient_impact_level": "direct",
    "innovation_focus_area": ["evidence_generation", "scientific_communication", "medical_education"],
    "key_stakeholders": ["healthcare_providers", "regulatory_agencies", "payers", "patients"],
    "is_active": true,
    "created_at": "2025-11-21T00:00:00Z"
  }
}
```

## Pharmaceutical Industry Standard Functions

### 1. Medical Affairs
```json
{
  "name": "Medical Affairs",
  "slug": "medical-affairs",
  "description": "Medical and scientific leadership supporting evidence generation and stakeholder engagement",
  "category": "core",
  "is_revenue_generating": false,
  "is_regulatory_critical": true,
  "typical_departments": [
    "Field Medical",
    "Medical Information Services",
    "Scientific Communications",
    "Medical Education",
    "HEOR & Evidence",
    "Publications",
    "Medical Leadership",
    "Clinical Operations Support",
    "Medical Excellence & Compliance"
  ]
}
```

### 2. Commercial Organization
```json
{
  "name": "Commercial Organization",
  "slug": "commercial-organization",
  "description": "Drives revenue through marketing, sales, and market access strategies",
  "category": "core",
  "is_revenue_generating": true,
  "is_regulatory_critical": true,
  "typical_departments": [
    "Sales Operations",
    "Marketing",
    "Market Access",
    "Customer Engagement",
    "Commercial Excellence",
    "Brand Management",
    "Sales Enablement",
    "Territory Management",
    "KAM",
    "Pricing & Contracting",
    "Commercial Analytics"
  ]
}
```

### 3. Regulatory Affairs
```json
{
  "name": "Regulatory Affairs",
  "slug": "regulatory-affairs",
  "description": "Ensures compliance with global regulatory requirements and manages submissions",
  "category": "core",
  "is_revenue_generating": false,
  "is_regulatory_critical": true,
  "typical_departments": [
    "Regulatory Leadership & Strategy",
    "Regulatory Submissions",
    "Global Regulatory Affairs",
    "Regulatory Intelligence",
    "CMC Regulatory",
    "Post-Market Surveillance"
  ]
}
```

### 4. Research & Development (R&D)
```json
{
  "name": "Research & Development (R&D)",
  "slug": "research-development-rd",
  "description": "Discovers and develops new therapeutic products",
  "category": "core",
  "is_revenue_generating": false,
  "is_regulatory_critical": true,
  "typical_departments": [
    "Discovery Research",
    "Preclinical Development",
    "Clinical Development",
    "Translational Medicine",
    "Drug Safety",
    "Biostatistics & Programming",
    "Clinical Operations",
    "Medical Writing"
  ]
}
```

### 5. Market Access
```json
{
  "name": "Market Access",
  "slug": "market-access",
  "description": "Ensures patient and payer access to therapies through evidence and value demonstration",
  "category": "core",
  "is_revenue_generating": false,
  "is_regulatory_critical": false,
  "typical_departments": [
    "HEOR (Health Economics & Outcomes Research)",
    "Payer Relations",
    "Value & Access Strategy",
    "Market Access Operations",
    "Real-World Evidence",
    "Government Affairs & Policy",
    "Pricing & Reimbursement",
    "Patient Access Programs",
    "Market Access Analytics",
    "Trade & Distribution"
  ]
}
```

### 6. Manufacturing & Supply Chain
```json
{
  "name": "Manufacturing & Supply Chain",
  "slug": "manufacturing-supply-chain",
  "description": "Produces and distributes pharmaceutical products at scale",
  "category": "core",
  "is_revenue_generating": false,
  "is_regulatory_critical": true,
  "typical_departments": [
    "Manufacturing Operations",
    "Quality Assurance & Quality Control",
    "Supply Chain Management",
    "Regulatory CMC",
    "Logistics & Distribution",
    "Packaging & Labeling"
  ]
}
```

### 7-15. Supporting Functions
```json
[
  {
    "name": "Finance & Accounting",
    "slug": "finance-accounting",
    "category": "support"
  },
  {
    "name": "Human Resources",
    "slug": "human-resources",
    "category": "support"
  },
  {
    "name": "Information Technology (IT) / Digital",
    "slug": "information-technology-it-digital",
    "category": "support"
  },
  {
    "name": "Legal & Compliance",
    "slug": "legal-compliance",
    "category": "support"
  },
  {
    "name": "Procurement",
    "slug": "procurement",
    "category": "support"
  },
  {
    "name": "Corporate Communications",
    "slug": "corporate-communications",
    "category": "strategic"
  },
  {
    "name": "Strategic Planning / Corporate Development",
    "slug": "strategic-planning-corporate-development",
    "category": "strategic"
  },
  {
    "name": "Business Intelligence / Analytics",
    "slug": "business-intelligence-analytics",
    "category": "strategic"
  },
  {
    "name": "Facilities / Workplace Services",
    "slug": "facilities-workplace-services",
    "category": "support"
  }
]
```

## SQL Insertion Script

```sql
-- Insert function and map to tenant
WITH new_function AS (
    INSERT INTO public.org_functions (
        id,
        name,
        slug,
        description,
        mission_statement,
        category,
        is_revenue_generating,
        is_regulatory_critical,
        hierarchy_level,
        sequence_order,
        is_active,
        created_at
    ) VALUES (
        gen_random_uuid(),
        'Medical Affairs',
        'medical-affairs',
        'Provides medical and scientific expertise to support product development and commercialization',
        'To ensure the safe and effective use of medicines through evidence-based medical leadership and stakeholder engagement',
        'core',
        false,
        true,
        1,
        1,
        true,
        NOW()
    ) RETURNING id, name
)
INSERT INTO public.function_tenants (
    function_id,
    tenant_id,
    is_primary,
    created_at
)
SELECT 
    nf.id,
    '<tenant_uuid>'::uuid,
    true,
    NOW()
FROM new_function nf;
```

## Complete Pharmaceutical Setup Script

See: `pharmaceutical_functions_complete.sql` for a production-ready script that creates all 15 standard pharmaceutical functions with full metadata.

## Biotech Industry Adaptations

For biotechnology companies, typical modifications:
- Combine "Medical Affairs" and "Regulatory Affairs" for smaller teams
- Emphasize "Research & Development"
- May not have "Manufacturing" (outsourced to CMOs)
- "Business Development & Licensing" is often a standalone function

## MedTech Industry Adaptations

For medical device companies:
- "Clinical Affairs" replaces "Medical Affairs"
- "Regulatory Affairs" includes device-specific requirements
- "Manufacturing" includes device assembly and testing
- "Post-Market Surveillance" is elevated in importance

## Validation Checklist

- [ ] Function name is clear and standard
- [ ] Slug is URL-friendly
- [ ] Description is concise (<200 chars)
- [ ] Mission statement is comprehensive
- [ ] Category is appropriate (core/support/strategic)
- [ ] Revenue-generating flag is correct
- [ ] Regulatory sensitivity is assessed
- [ ] Hierarchy level makes sense
- [ ] Sequence order for display is set
- [ ] Tenant mapping is created

## Next Steps

After creating functions:
1. **Create Departments** - Use `department_seed_template.md`
2. **Map departments to functions** - via `department.function_id`
3. **Create roles within departments** - Use `role_seed_template.md`

## Notes

- Functions are tenant-specific via `function_tenants` junction
- One function can be mapped to multiple tenants (reusable blueprint)
- Slug must be unique within a tenant
- `hierarchy_level` and `sequence_order` control display ordering
- Use `deleted_at` for soft delete

