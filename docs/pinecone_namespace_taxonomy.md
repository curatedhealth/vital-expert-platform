# VITAL Platform - Pinecone Namespace Taxonomy

## Index: `vital-knowledge` (3072 dimensions)

**Total Vectors: 21,613**

### Architecture
```
vital-knowledge
├── ONTOLOGY (ont-*)           7,191 vectors
│   ├── ont-agents             2,547
│   ├── personas               2,142
│   ├── ont-personas           1,400
│   ├── skills                   455
│   ├── capabilities             369
│   └── responsibilities         278
│
└── KNOWLEDGE DOMAINS (KD-*)  14,422 vectors
    ├── Digital Health
    │   ├── KD-dh-samd         3,934
    │   ├── KD-dh-general      3,010
    │   └── KD-dh-cybersec        63
    ├── Regulatory
    │   ├── KD-reg-ema         1,627
    │   ├── KD-reg-fda         1,300
    │   ├── KD-reg-general       511
    │   └── KD-reg-ich             5
    ├── Clinical
    │   └── KD-clinical-trials 1,147
    ├── Business
    │   └── KD-business-strategy 2,488
    └── General
        ├── KD-best-practices    274
        └── KD-industry           63
```

---

## L0: Domain Knowledge Namespaces (53 total)

### Therapeutic Areas (15 namespaces)
| Namespace | Description |
|-----------|-------------|
| `ta-oncology` | Cancer therapeutics, immuno-oncology |
| `ta-immunology` | Autoimmune diseases, inflammation |
| `ta-neurology` | CNS disorders, neurodegenerative |
| `ta-cardiology` | Cardiovascular diseases |
| `ta-rare-diseases` | Orphan drugs, rare conditions |
| `ta-infectious` | Anti-infectives, vaccines |
| `ta-respiratory` | Pulmonary, asthma, COPD |
| `ta-dermatology` | Skin conditions |
| `ta-endocrinology` | Diabetes, metabolic |
| `ta-gastroenterology` | GI disorders |
| `ta-hematology` | Blood disorders |
| `ta-ophthalmology` | Eye diseases |
| `ta-nephrology` | Kidney diseases |
| `ta-psychiatry` | Mental health |
| `ta-gene-therapy` | Gene/cell therapies, ATMPs |

### Regulatory Jurisdictions (10 namespaces)
| Namespace | Description |
|-----------|-------------|
| `reg-fda` | US FDA regulations, guidance |
| `reg-ema` | EU EMA regulations |
| `reg-pmda` | Japan PMDA |
| `reg-nmpa` | China NMPA |
| `reg-health-canada` | Health Canada |
| `reg-tga` | Australia TGA |
| `reg-anvisa` | Brazil ANVISA |
| `reg-ich` | ICH guidelines (global) |
| `reg-who` | WHO guidelines |
| `reg-mhra` | UK MHRA (post-Brexit) |

### Functional Domains (12 namespaces)
| Namespace | Description |
|-----------|-------------|
| `func-medical-affairs` | MSL, medical information, publications |
| `func-clinical-dev` | Clinical trials, protocols |
| `func-regulatory-affairs` | Submissions, labeling |
| `func-pharmacovigilance` | Drug safety, AE reporting |
| `func-commercial` | Marketing, sales, market access |
| `func-heor` | Health economics, outcomes research |
| `func-manufacturing` | GMP, CMC, supply chain |
| `func-quality` | QA/QC, validation |
| `func-legal-compliance` | Legal, ethics, compliance |
| `func-hr-talent` | Talent, training, org development |
| `func-it-digital` | Digital health, IT systems |
| `func-finance` | Financial planning, budgeting |

### Technology Domains (8 namespaces)
| Namespace | Description |
|-----------|-------------|
| `tech-ai-ml` | AI/ML in pharma, algorithms |
| `tech-digital-health` | Digital therapeutics, SaMD |
| `tech-real-world-data` | RWE, EHR, claims data |
| `tech-clinical-systems` | EDC, CTMS, eTMF |
| `tech-data-analytics` | BI, dashboards, reporting |
| `tech-cloud-infra` | Cloud, DevOps, architecture |
| `tech-cybersecurity` | Security, privacy, HIPAA |
| `tech-interoperability` | FHIR, HL7, data standards |

### Business Domains (8 namespaces)
| Namespace | Description |
|-----------|-------------|
| `biz-strategy` | Corporate strategy, M&A |
| `biz-market-access` | Pricing, reimbursement, payers |
| `biz-competitive-intel` | Competitive landscape |
| `biz-portfolio` | Pipeline, portfolio management |
| `biz-partnerships` | BD, licensing, collaborations |
| `biz-investor-relations` | Financials, investor comms |
| `biz-sustainability` | ESG, CSR |
| `biz-innovation` | R&D strategy, emerging tech |

---

## L1-L4: Ontology Namespaces (6 total)

| Namespace | Layer | Description |
|-----------|-------|-------------|
| `personas` | L2 | MECE persona archetypes (3,442) |
| `agents` | L2 | AI agent definitions |
| `skills` | L4 | Skill taxonomy |
| `capabilities` | L4 | Capability definitions |
| `responsibilities` | L3 | JTBD, responsibilities |
| `roles` | L1 | Role embeddings (optional) |

---

## L5-L7: Operational Namespaces (4 total)

| Namespace | Layer | Description |
|-----------|-------|-------------|
| `workflows` | L5 | Process templates, SOPs |
| `templates` | L5 | Document templates |
| `metrics` | L7 | KPIs, benchmarks |
| `best-practices` | L5 | Implementation guides |

---

## Total: 63 Namespaces

### Query Patterns

```python
# Single domain query
results = index.query(vector, namespace="ta-oncology", top_k=10)

# Cross-domain query (all namespaces)
results = index.query(vector, namespace=None, top_k=10)

# Multi-domain query (filter by metadata)
results = index.query(
    vector,
    filter={"domain": {"$in": ["oncology", "immunology"]}},
    top_k=10
)
```

---

## Migration Plan

### Phase 1: Reorganize existing data
1. Rename `(default)` → `knowledge-general`
2. Move domain-specific chunks to proper namespaces
3. Keep `personas`, `agents`, `skills`, `capabilities`, `responsibilities`

### Phase 2: Merge vital-rag-production
1. `digital-health` → `tech-digital-health`
2. `business-strategy` → `biz-strategy`
3. `regulatory-affairs` → `func-regulatory-affairs`

### Phase 3: Delete unused indexes
1. Delete `vital` (empty)
2. Delete `vital-rag-production` (merged)
3. Keep `vital-medical-agents` (different dimension)
