# VITAL Knowledge Domains

## 30 Healthcare Knowledge Domains

Your Supabase database contains 30 predefined knowledge domains organized in 3 tiers.

### TIER 1: CORE DOMAINS (15) - Mission Critical

| Code | Domain Name | Slug | Use For |
|------|-------------|------|---------|
| REG_AFFAIRS | Regulatory Affairs | `regulatory_affairs` | FDA, EMA, submissions, compliance |
| CLIN_DEV | Clinical Development | `clinical_development` | Clinical trial design, protocols |
| PHARMACOVIG | Pharmacovigilance | `pharmacovigilance` | Drug safety, adverse events |
| QUALITY_MGMT | Quality Assurance | `quality_assurance` | GMP, validation, manufacturing |
| MED_AFFAIRS | Medical Affairs | `medical_affairs` | MSL, KOL engagement, publications |
| DRUG_SAFETY | Drug Safety | `drug_safety` | Safety surveillance, causality |
| CLIN_OPS | Clinical Operations | `clinical_operations` | Site management, monitoring |
| MED_WRITING | Medical Writing | `medical_writing` | CSRs, protocols, documents |
| BIOSTAT | Biostatistics | `biostatistics` | Statistical analysis, SAP |
| DATA_MGMT | Data Management | `data_management` | CDM, CDISC, SDTM |
| TRANS_MED | Translational Medicine | `translational_medicine` | Biomarkers, precision medicine |
| MARKET_ACCESS | Market Access | `market_access` | Pricing, reimbursement, HTA |
| LABELING_ADV | Labeling & Advertising | `labeling_advertising` | Product labels, promotion |
| POST_MARKET | Post-Market Surveillance | `post_market_surveillance` | Post-approval monitoring |
| PATIENT_ENG | Patient Engagement | `patient_engagement` | Recruitment, PROs |

### TIER 2: SPECIALIZED DOMAINS (10) - High Value

| Code | Domain Name | Slug | Use For |
|------|-------------|------|---------|
| SCI_PUB | Scientific Publications | `scientific_publications` | Manuscript writing, journals |
| NONCLIN_SCI | Nonclinical Sciences | `nonclinical_sciences` | Preclinical, toxicology |
| RISK_MGMT | Risk Management | `risk_management` | Risk assessment, RMP |
| SUBMISSIONS | Submissions & Filings | `submissions_and_filings` | IND, NDA, BLA, dossiers |
| HEOR | Health Economics | `health_economics` | Health economics, outcomes |
| MED_DEVICES | Medical Devices | `medical_devices` | 510k, PMA, device regs |
| BIOINFORMATICS | Bioinformatics | `bioinformatics` | Genomics, proteomics |
| COMP_DIAG | Companion Diagnostics | `companion_diagnostics` | CDx development |
| REG_INTEL | Regulatory Intelligence | `regulatory_intelligence` | Competitive intelligence |
| LIFECYCLE_MGMT | Lifecycle Management | `lifecycle_management` | Portfolio strategy |

### TIER 3: EMERGING DOMAINS (5) - Future-Focused

| Code | Domain Name | Slug | Use For |
|------|-------------|------|---------|
| DIGITAL_HEALTH | Digital Health | `digital_health` | mHealth, wearables, DTx |
| PRECISION_MED | Precision Medicine | `precision_medicine` | Genetic profiling, targeted therapy |
| AI_ML_HEALTH | AI/ML in Healthcare | `ai_ml_healthcare` | ML models, clinical decision support |
| TELEMEDICINE | Telemedicine | `telemedicine` | Remote healthcare, virtual visits |
| SUSTAINABILITY | Sustainability | `sustainability` | Environmental, green pharma |

## How to Use in Knowledge Pipeline

### 1. **Use the correct slug in your configuration:**

```json
{
  "sources": [
    {
      "url": "https://www.fda.gov/...",
      "domain": "regulatory_affairs",  // Use slug from table
      "category": "fda_guidelines",
      "tags": ["fda", "regulatory"],
      "priority": "high"
    },
    {
      "url": "https://clinicaltrials.gov/...",
      "domain": "clinical_development",  // Use slug
      "category": "trial_design",
      "tags": ["trials", "protocols"],
      "priority": "medium"
    }
  ]
}
```

### 2. **In the UI Component:**

The dropdown should show all 30 domains:

```tsx
const DOMAIN_OPTIONS = [
  // Tier 1
  { value: 'regulatory_affairs', label: 'Regulatory Affairs', tier: 1 },
  { value: 'clinical_development', label: 'Clinical Development', tier: 1 },
  { value: 'pharmacovigilance', label: 'Pharmacovigilance', tier: 1 },
  // ... all 30 domains
];
```

### 3. **Namespace Mapping:**

Each domain slug maps to a Pinecone namespace:

- `regulatory_affairs` → namespace: `regulatory-affairs`
- `clinical_development` → namespace: `clinical-development`
- `medical_devices` → namespace: `medical-devices`

### 4. **Auto-Creation:**

If you use a domain not in the list, it will be auto-created in `knowledge_domains_new` table with:
- `slug`: your domain name
- `domain_name`: Capitalized version
- `is_active`: true

## Example Configurations by Domain

### Regulatory Affairs
```json
{
  "url": "https://www.fda.gov/...",
  "domain": "regulatory_affairs",
  "category": "fda_guidance",
  "tags": ["fda", "510k", "pma", "regulatory"],
  "priority": "high"
}
```

### Clinical Development
```json
{
  "url": "https://clinicaltrials.gov/...",
  "domain": "clinical_development",
  "category": "trial_protocols",
  "tags": ["phase-3", "rct", "study-design"],
  "priority": "high"
}
```

### Medical Devices
```json
{
  "url": "https://www.iso.org/...",
  "domain": "medical_devices",
  "category": "device_standards",
  "tags": ["iso", "ivd", "class-ii"],
  "priority": "medium"
}
```

### Pharmacovigilance
```json
{
  "url": "https://www.ema.europa.eu/safety/...",
  "domain": "pharmacovigilance",
  "category": "safety_monitoring",
  "tags": ["adverse-events", "signal-detection", "psur"],
  "priority": "high"
}
```

### Digital Health
```json
{
  "url": "https://www.fda.gov/digital-health/...",
  "domain": "digital_health",
  "category": "digital_therapeutics",
  "tags": ["dtx", "mobile-health", "samd"],
  "priority": "medium"
}
```

## Query by Domain

Once content is uploaded, you can query by domain:

```python
# Via RAG service
results = await rag_service.retrieve(
    query="510k clearance requirements",
    domain_id="regulatory_affairs",  # Filters to this namespace
    max_results=10
)
```

## Benefits of Using Correct Domains

1. ✅ **Proper Namespace Routing** - Content goes to correct Pinecone namespace
2. ✅ **Domain-Specific Search** - Filter queries by domain
3. ✅ **Organized Knowledge Base** - Clear categorization
4. ✅ **Access Control** - Future domain-level permissions
5. ✅ **Analytics** - Track usage by domain

## Check Your Domains

Query Supabase to see all domains:

```sql
SELECT slug, domain_name, tier, priority, is_active
FROM knowledge_domains
WHERE is_active = true
ORDER BY tier, priority;
```

Or via API:

```typescript
const { data } = await supabase
  .from('knowledge_domains')
  .select('slug, name, tier')
  .eq('is_active', true)
  .order('tier')
  .order('priority');
```

---

**Total Domains**: 30
**Tier 1 (Core)**: 15 domains
**Tier 2 (Specialized)**: 10 domains
**Tier 3 (Emerging)**: 5 domains

