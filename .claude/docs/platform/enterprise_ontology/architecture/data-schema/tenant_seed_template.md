# Tenant Seed Data Template

## Overview
Use this template to create seed data for a new tenant in the VITAL platform.

## Template Structure

### 1. Tenant Basic Information
```json
{
  "tenant": {
    "name": "Your Company Name",
    "slug": "your-company-slug",
    "domain": "yourcompany.com",
    "subdomain": "yourcompany",
    "tenant_type": "pharma | biotech | medtech | digital_health | healthcare_provider",
    "description": "Brief description of the organization",
    "industry": "pharmaceuticals",
    "company_size": "enterprise | mid_market | small_business",
    "region": "global | north_america | europe | asia_pacific",
    "logo_url": "https://yourdomain.com/logo.png",
    "primary_color": "#1a73e8",
    "secondary_color": "#34a853",
    "is_active": true,
    "created_at": "2025-11-21T00:00:00Z"
  }
}
```

### 2. Tenant Metadata
```json
{
  "metadata": {
    "headquarters": "City, Country",
    "founded_year": 2020,
    "employee_count": 10000,
    "annual_revenue_usd": 5000000000,
    "therapeutic_focus": ["oncology", "immunology", "rare_diseases"],
    "product_portfolio_size": 15,
    "clinical_trials_active": 25,
    "countries_operating": 50
  }
}
```

### 3. Tenant Settings
```json
{
  "settings": {
    "allow_byoai": true,
    "max_users": 1000,
    "max_agents": 50,
    "max_personas": 200,
    "enable_ask_expert": true,
    "enable_ask_panel": true,
    "enable_ask_committee": false,
    "enable_workflows": true,
    "data_retention_days": 730,
    "sso_enabled": false,
    "custom_domain_enabled": false
  }
}
```

## SQL Insertion Script

```sql
-- Insert tenant
INSERT INTO public.tenants (
    id,
    name,
    slug,
    domain,
    subdomain,
    tenant_type,
    description,
    industry,
    company_size,
    region,
    logo_url,
    primary_color,
    secondary_color,
    metadata,
    is_active,
    created_at
) VALUES (
    gen_random_uuid(),
    'Your Company Name',
    'your-company-slug',
    'yourcompany.com',
    'yourcompany',
    'pharma',
    'Brief description of the organization',
    'pharmaceuticals',
    'enterprise',
    'global',
    'https://yourdomain.com/logo.png',
    '#1a73e8',
    '#34a853',
    '{
        "headquarters": "City, Country",
        "founded_year": 2020,
        "employee_count": 10000,
        "annual_revenue_usd": 5000000000,
        "therapeutic_focus": ["oncology", "immunology", "rare_diseases"],
        "product_portfolio_size": 15,
        "clinical_trials_active": 25,
        "countries_operating": 50
    }'::jsonb,
    true,
    NOW()
) RETURNING id;

-- Note: Save the returned UUID for use in functions, departments, and roles
```

## Pharmaceutical Industry Example

### Pre-filled Template
```json
{
  "tenant": {
    "name": "Pharmaceuticals Inc",
    "slug": "pharmaceuticals",
    "domain": "pharmaceuticals.com",
    "subdomain": "pharma",
    "tenant_type": "pharma",
    "description": "Global pharmaceutical company focused on innovative therapies",
    "industry": "pharmaceuticals",
    "company_size": "enterprise",
    "region": "global"
  },
  "metadata": {
    "therapeutic_focus": [
      "oncology",
      "immunology",
      "rare_diseases",
      "cardiovascular",
      "neurology"
    ],
    "employee_count": 50000,
    "annual_revenue_usd": 25000000000
  }
}
```

## Biotech Industry Example

### Pre-filled Template
```json
{
  "tenant": {
    "name": "BioInnovate Labs",
    "slug": "bioinnovate",
    "domain": "bioinnovate.com",
    "subdomain": "bioinnovate",
    "tenant_type": "biotech",
    "description": "Cutting-edge biotechnology research and development",
    "industry": "biotechnology",
    "company_size": "mid_market",
    "region": "north_america"
  },
  "metadata": {
    "therapeutic_focus": [
      "gene_therapy",
      "cell_therapy",
      "precision_medicine"
    ],
    "employee_count": 500,
    "annual_revenue_usd": 100000000
  }
}
```

## MedTech Industry Example

### Pre-filled Template
```json
{
  "tenant": {
    "name": "MedDevice Solutions",
    "slug": "meddevice",
    "domain": "meddevicesolutions.com",
    "subdomain": "meddevice",
    "tenant_type": "medtech",
    "description": "Medical device manufacturer and distributor",
    "industry": "medical_devices",
    "company_size": "mid_market",
    "region": "europe"
  },
  "metadata": {
    "therapeutic_focus": [
      "cardiology_devices",
      "orthopedic_implants",
      "surgical_instruments"
    ],
    "employee_count": 2000,
    "annual_revenue_usd": 500000000
  }
}
```

## Next Steps

After creating a tenant:

1. **Create Functions** - Use `function_seed_template.json`
2. **Create Departments** - Use `department_seed_template.json`
3. **Create Roles** - Use `role_seed_template.json`
4. **Generate Personas** - Use `persona_seed_template.json` (4 MECE per role)

## Validation Checklist

- [ ] Tenant name is unique
- [ ] Slug is URL-friendly (lowercase, hyphens only)
- [ ] Subdomain is unique and valid
- [ ] Domain is properly formatted
- [ ] Tenant type matches industry
- [ ] Therapeutic focus is relevant
- [ ] Company size is appropriate
- [ ] Region is correct
- [ ] Logo URL is accessible
- [ ] Colors are valid hex codes

## Notes

- Tenant `id` is auto-generated (UUID)
- `slug` must be unique across all tenants
- `subdomain` must be unique for multi-tenant routing
- `metadata` is JSONB - flexible for tenant-specific attributes
- All tenants start as `is_active = true`
- Use `deleted_at` for soft delete (don't set `is_active = false`)

