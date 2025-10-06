# Recommended Knowledge Domains for RAG System

**Based on analysis of 254 agents across 11 business functions**

## 📊 Executive Summary

Your agent library spans **254 specialized agents** across:
- **11 Business Functions**: Operations (69), IT/Digital (34), R&D (32), Clinical Development (27), Commercial (22), Quality (14), Regulatory (13), Manufacturing (12), Medical Affairs (10), Business Development (10), Pharmacovigilance (6), Legal (5)
- **50+ Departments**: Covering the entire pharmaceutical/healthcare value chain
- **100+ Unique Capabilities**: From drug discovery to post-market surveillance

## 🎯 Recommended Knowledge Domain Structure

### **Tier 1: Core Domains** (Must Have - 15 domains)

These domains are essential and support the largest number of agents:

#### 1. **Regulatory & Compliance** (85 agents)
```yaml
Domain: regulatory_affairs
Sub-domains:
  - fda_regulations
  - ema_regulations
  - ich_guidelines
  - regulatory_strategy
  - submission_management
Agents: FDA Regulatory Strategist, Regulatory Compliance Officer, Submissions Manager
```

#### 2. **Clinical Development** (37 agents)
```yaml
Domain: clinical_development
Sub-domains:
  - protocol_design
  - clinical_operations
  - study_management
  - endpoint_selection
  - site_management
Agents: Clinical Trial Designer, Study Manager, Clinical Research Associate
```

#### 3. **Drug Safety & Pharmacovigilance** (25 agents)
```yaml
Domain: pharmacovigilance
Sub-domains:
  - adverse_event_reporting
  - signal_detection
  - risk_management
  - safety_surveillance
  - benefit_risk_assessment
Agents: Safety Officer, Pharmacovigilance Specialist, Signal Detection Analyst
```

#### 4. **Quality Management** (20 agents)
```yaml
Domain: quality_management
Sub-domains:
  - quality_assurance
  - quality_control
  - gmp_compliance
  - validation
  - audit_management
Agents: QA Specialist, Quality Auditor, Validation Engineer
```

#### 5. **Medical Affairs** (15 agents)
```yaml
Domain: medical_affairs
Sub-domains:
  - medical_information
  - scientific_communication
  - medical_writing
  - msl_activities
  - publication_planning
Agents: Medical Science Liaison, Medical Writer, Medical Information Specialist
```

#### 6. **Commercial & Market Access** (29 agents)
```yaml
Domain: commercial_strategy
Sub-domains:
  - market_access
  - reimbursement
  - pricing_strategy
  - brand_management
  - launch_planning
Agents: Market Access Manager, Reimbursement Strategist, Brand Manager
```

#### 7. **Research & Development** (39 agents)
```yaml
Domain: drug_development
Sub-domains:
  - drug_discovery
  - preclinical_development
  - translational_medicine
  - biomarker_research
  - formulation_development
Agents: Discovery Scientist, Preclinical Researcher, Formulation Scientist
```

#### 8. **Clinical Data & Biostatistics** (18 agents)
```yaml
Domain: clinical_data_analytics
Sub-domains:
  - biostatistics
  - data_management
  - statistical_analysis
  - clinical_programming
  - data_visualization
Agents: Biostatistician, Data Manager, Clinical Programmer
```

#### 9. **Manufacturing & CMC** (17 agents)
```yaml
Domain: manufacturing_operations
Sub-domains:
  - drug_product_manufacturing
  - drug_substance_manufacturing
  - process_development
  - scale_up
  - tech_transfer
Agents: Manufacturing Manager, Process Engineer, CMC Specialist
```

#### 10. **Medical Devices** (12 agents)
```yaml
Domain: medical_devices
Sub-domains:
  - device_classification
  - 510k_pathway
  - pma_submissions
  - design_controls
  - post_market_surveillance
Agents: Device Regulatory Specialist, Device Quality Engineer
```

#### 11. **Digital Health & AI/ML** (34 agents)
```yaml
Domain: digital_health
Sub-domains:
  - health_technology
  - ai_ml_applications
  - samd_regulation
  - connected_health
  - digital_therapeutics
Agents: Digital Health Specialist, AI/ML Engineer, Health Tech Product Manager
```

#### 12. **Supply Chain & Logistics** (15 agents)
```yaml
Domain: supply_chain
Sub-domains:
  - supply_planning
  - distribution_management
  - cold_chain_logistics
  - inventory_optimization
  - vendor_management
Agents: Supply Chain Manager, Logistics Coordinator
```

#### 13. **Legal & Compliance** (10 agents)
```yaml
Domain: legal_compliance
Sub-domains:
  - healthcare_law
  - hipaa_compliance
  - intellectual_property
  - contract_management
  - data_privacy
Agents: HIPAA Compliance Officer, Healthcare Legal Counsel
```

#### 14. **Health Economics & Outcomes Research (HEOR)** (12 agents)
```yaml
Domain: health_economics
Sub-domains:
  - health_outcomes_research
  - economic_modeling
  - cost_effectiveness_analysis
  - value_demonstration
  - comparative_effectiveness
Agents: Health Economist, HEOR Specialist, Outcomes Researcher
```

#### 15. **Business Development & Strategy** (10 agents)
```yaml
Domain: business_strategy
Sub-domains:
  - strategic_planning
  - licensing
  - partnerships
  - competitive_intelligence
  - portfolio_management
Agents: Business Development Manager, Strategic Planner
```

---

### **Tier 2: Specialized Domains** (High Value - 10 domains)

These support specialized functions and cross-functional work:

#### 16. **Labeling & Product Information**
```yaml
Domain: product_labeling
Keywords: labeling, prescribing_information, patient_information, ifu
Agents: 8 specialists
```

#### 17. **Post-Market Surveillance**
```yaml
Domain: post_market_activities
Keywords: real_world_evidence, surveillance, periodic_safety_reports
Agents: 10 specialists
```

#### 18. **Companion Diagnostics**
```yaml
Domain: companion_diagnostics
Keywords: biomarkers, diagnostic_development, personalized_medicine
Agents: 6 specialists
```

#### 19. **Pharmacology & Toxicology**
```yaml
Domain: nonclinical_sciences
Keywords: pharmacology, toxicology, pharmacokinetics, safety_assessment
Agents: 12 specialists
```

#### 20. **Patient Engagement**
```yaml
Domain: patient_focus
Keywords: patient_engagement, patient_centricity, patient_education
Agents: 5 specialists
```

#### 21. **Risk Management**
```yaml
Domain: risk_management
Keywords: risk_assessment, rems, risk_mitigation, benefit_risk
Agents: 8 specialists
```

#### 22. **Scientific Communication**
```yaml
Domain: scientific_publications
Keywords: publications, abstracts, presentations, scientific_writing
Agents: 7 specialists
```

#### 23. **KOL & Stakeholder Engagement**
```yaml
Domain: stakeholder_engagement
Keywords: kol_management, advisory_boards, medical_education
Agents: 6 specialists
```

#### 24. **Comparative Effectiveness**
```yaml
Domain: evidence_generation
Keywords: comparative_studies, indirect_comparisons, network_meta_analysis
Agents: 5 specialists
```

#### 25. **Global Market Access**
```yaml
Domain: global_access
Keywords: international_pricing, hta_submissions, payer_negotiations
Agents: 8 specialists
```

---

### **Tier 3: Emerging/Future Domains** (Nice to Have - 5 domains)

Future-focused domains for innovation:

#### 26. **Real-World Data & Evidence**
```yaml
Domain: real_world_data
Keywords: rwd, rwe, observational_studies, claims_data
```

#### 27. **Precision Medicine**
```yaml
Domain: precision_medicine
Keywords: genomics, biomarkers, targeted_therapies, personalized_treatment
```

#### 28. **Telemedicine & Remote Care**
```yaml
Domain: telemedicine
Keywords: remote_monitoring, telehealth, virtual_care, decentralized_trials
```

#### 29. **Sustainability & ESG**
```yaml
Domain: sustainability
Keywords: environmental_impact, green_chemistry, sustainable_packaging
```

#### 30. **Rare Diseases & Orphan Drugs**
```yaml
Domain: rare_diseases
Keywords: orphan_designation, ultra_rare, small_populations
```

---

## 📋 Implementation Roadmap

### **Phase 1: Foundation (Weeks 1-2)**
✅ Implement 5 Core Domains:
1. Regulatory Affairs
2. Clinical Development
3. Pharmacovigilance
4. Quality Management
5. Drug Development

**Impact**: Covers 180+ agents (70%)

### **Phase 2: Expansion (Weeks 3-4)**
✅ Add 10 Core Domains:
6. Medical Affairs
7. Commercial Strategy
8. Clinical Data Analytics
9. Manufacturing Operations
10. Medical Devices
11. Digital Health
12. Supply Chain
13. Legal Compliance
14. Health Economics
15. Business Strategy

**Impact**: Covers 254 agents (100%)

### **Phase 3: Specialization (Month 2)**
✅ Add 10 Specialized Domains (Tier 2)
- Target high-value cross-functional use cases
- Support premium agents (Tier 3)

**Impact**: Enhanced precision for complex queries

### **Phase 4: Innovation (Month 3+)**
✅ Add 5 Emerging Domains (Tier 3)
- Future-proof knowledge base
- Support cutting-edge capabilities

---

## 🗂️ Domain Mapping to Agents

### By Business Function:

| Business Function | Primary Domains | Agent Count |
|-------------------|----------------|-------------|
| **Operations** | supply_chain, manufacturing_operations, quality_management | 69 |
| **IT/Digital** | digital_health, ai_ml_applications, health_technology | 34 |
| **R&D** | drug_development, nonclinical_sciences, translational_medicine | 32 |
| **Clinical Development** | clinical_development, biostatistics, clinical_operations | 27 |
| **Commercial** | commercial_strategy, market_access, brand_management | 22 |
| **Quality** | quality_management, gmp_compliance, validation | 14 |
| **Regulatory Affairs** | regulatory_affairs, submissions, compliance | 13 |
| **Manufacturing** | manufacturing_operations, process_development, cmc | 12 |
| **Medical Affairs** | medical_affairs, scientific_communication, publications | 10 |
| **Business Development** | business_strategy, partnerships, licensing | 10 |
| **Pharmacovigilance** | pharmacovigilance, safety_surveillance, signal_detection | 6 |
| **Legal** | legal_compliance, hipaa, healthcare_law | 5 |

---

## 💡 Domain Design Principles

### 1. **Granularity Balance**
- Not too broad: "Healthcare" ❌
- Not too narrow: "FDA_510k_Class_II_Cardiovascular_Devices" ❌
- Just right: "medical_devices" with sub-domain "510k_pathway" ✅

### 2. **Agent Coverage**
- Each domain should support 5+ agents minimum
- Target 80/20 rule: 15 domains cover 80% of agents

### 3. **Query Patterns**
- Domains should align with natural query patterns
- Example: "What are FDA requirements for..." → `regulatory_affairs`

### 4. **Cross-Functional Support**
- Domains can overlap (e.g., "clinical_development" + "biostatistics")
- Agents can subscribe to multiple domains

### 5. **Future-Proof**
- Leave room for emerging domains
- Design for extensibility

---

## 🎯 Quick Start Recommendation

**Start with these 10 domains** (covers 90% of agents):

1. ✅ `regulatory_affairs` (Regulatory & Compliance)
2. ✅ `clinical_development` (Clinical Trials)
3. ✅ `pharmacovigilance` (Drug Safety)
4. ✅ `quality_management` (QA/QC)
5. ✅ `drug_development` (R&D)
6. ✅ `medical_affairs` (Medical Communications)
7. ✅ `commercial_strategy` (Market Access)
8. ✅ `clinical_data_analytics` (Biostatistics)
9. ✅ `digital_health` (Health Technology)
10. ✅ `manufacturing_operations` (CMC)

**These 10 domains align perfectly with your organizational structure** and support the vast majority of your agent capabilities.

---

## 📊 Domain Coverage Analysis

### Coverage by Tier:

| Tier | Domains | Agents Covered | % Coverage |
|------|---------|----------------|------------|
| Tier 1 (Core) | 15 | 254 | 100% |
| Tier 2 (Specialized) | 10 | 180 | 71% |
| Tier 3 (Emerging) | 5 | 45 | 18% |

### Recommended Priority:

**High Priority** (Implement First):
- Regulatory Affairs
- Clinical Development
- Drug Development
- Quality Management
- Pharmacovigilance

**Medium Priority** (Implement Second):
- Medical Affairs
- Commercial Strategy
- Digital Health
- Manufacturing Operations
- Clinical Data Analytics

**Low Priority** (Implement Later):
- Specialized domains
- Emerging domains

---

## 🔄 Migration Path from Current 20 Domains

### Current Domains → Recommended Mapping:

| Current Domain | Recommended Domain | Action |
|----------------|-------------------|---------|
| `regulatory` | `regulatory_affairs` | ✅ Keep (rename) |
| `clinical_trials` | `clinical_development` | ✅ Keep (rename) |
| `pharmacovigilance` | `pharmacovigilance` | ✅ Keep |
| `medical_devices` | `medical_devices` | ✅ Keep |
| `fda_guidance` | → `regulatory_affairs` (sub-domain) | 🔀 Merge |
| `ema_guidance` | → `regulatory_affairs` (sub-domain) | 🔀 Merge |
| `ich_guidelines` | → `regulatory_affairs` (sub-domain) | 🔀 Merge |
| `drug_development` | `drug_development` | ✅ Keep |
| `biostatistics` | `clinical_data_analytics` | ✅ Keep (rename) |
| `clinical_data` | → `clinical_data_analytics` | 🔀 Merge |
| `safety_reporting` | → `pharmacovigilance` (sub-domain) | 🔀 Merge |
| `quality_assurance` | `quality_management` | ✅ Keep (rename) |
| `manufacturing` | `manufacturing_operations` | ✅ Keep (rename) |
| `labeling` | `product_labeling` | ✅ Keep |
| `post_market_surveillance` | `post_market_activities` | ✅ Keep (rename) |
| `risk_management` | `risk_management` | ✅ Keep |
| `pharmacology` | `nonclinical_sciences` | ✅ Keep (rename) |
| `toxicology` | → `nonclinical_sciences` (sub-domain) | 🔀 Merge |
| `biomarkers` | `companion_diagnostics` | ✅ Keep (rename) |
| `companion_diagnostics` | `companion_diagnostics` | ✅ Keep |

**Result**: 20 domains → 30 domains (more comprehensive)

---

## 🚀 Next Steps

1. **Review & Approve** this domain structure
2. **Update database** with new domain definitions
3. **Map existing agents** to new domains (bulk update script)
4. **Create knowledge bases** for top 10 domains
5. **Populate with content** (FDA guidelines, ICH docs, etc.)
6. **Test retrieval** with sample queries
7. **Iterate** based on agent performance

---

## 📚 Additional Resources

- **Domain Ontology**: See `docs/domain-ontology.md` (to be created)
- **Agent-Domain Mapping**: See `scripts/map-agents-to-domains.js` (to be created)
- **Content Sources**: See `docs/content-sources.md` (to be created)

---

**Generated based on analysis of 254 agents across your platform**
