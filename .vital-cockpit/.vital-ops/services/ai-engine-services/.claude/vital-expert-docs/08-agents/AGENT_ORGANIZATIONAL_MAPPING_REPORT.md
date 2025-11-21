# Agent Organizational Mapping Report

**Generated:** 2025-11-17
**Total Agents Mapped:** 319

---

## Distribution by Department

| Department | Agents | Percentage |
|------------|--------|------------|
| Clinical Development | 115 | 36.1% |
| Commercial | 14 | 4.4% |
| Manufacturing & CMC | 29 | 9.1% |
| Market Access & HEOR | 45 | 14.1% |
| Medical Affairs | 28 | 8.8% |
| Operations & Project Management | 16 | 5.0% |
| Regulatory Affairs | 59 | 18.5% |
| Research & Development | 13 | 4.1% |

---

## Distribution by Persona

| Persona | Agents | Percentage |
|---------|--------|------------|
| Senior Expert | 172 | 53.9% |
| Specialist | 94 | 29.5% |
| Functional Manager | 19 | 6.0% |
| Coordinator | 12 | 3.8% |
| Executive Leader | 10 | 3.1% |
| Strategist | 7 | 2.2% |
| Analyst | 5 | 1.6% |

---

## Distribution by Tier

| Tier | Agents | Percentage |
|------|--------|------------|
| MASTER | 1 | 0.3% |
| EXPERT | 239 | 74.9% |
| SPECIALIST | 75 | 23.5% |
| WORKER | 4 | 1.3% |

---

## Distribution by Tenant

| Tenant | Agents | Percentage | Description |
|--------|--------|------------|-------------|
| Pharma Only | 303 | 95.0% | Pharmaceutical/biotech specific |
| Digital Health Only | 1 | 0.3% | Digital health specific |
| Multi-Tenant (Both) | 15 | 4.7% | Works for both pharma and digital health |

**Total:** 319 agents

---

## Organizational Hierarchy

```
TENANTS (pharma, digital_health)
    └── AGENTS (M:M relationship)

DEPARTMENTS
    └── FUNCTIONS
            └── ROLES
                    └── AGENTS (M:M relationship)

PERSONAS → ROLES → AGENTS (M:M relationship)
```

**Key Points:**
- Agents can belong to multiple tenants (e.g., "Workflow Orchestration" works for both pharma and digital health)
- Agents can have multiple roles (though typically one primary role)
- Tenants enable filtering agents based on customer type

---

## Sample Mappings

<details>
<summary>Click to expand sample mappings by department</summary>


### Clinical Development

- **Expert - Biostatistician**
  - Role: Biostatistician
  - Function: data management
  - Persona: Senior Expert
  - Tier: EXPERT
  - Tenants: pharma

- **Expert - Clinical Study Liaison**
  - Role: Clinical Study Liaison
  - Function: Clinical trials, data management, safety
  - Persona: Senior Expert
  - Tier: EXPERT
  - Tenants: pharma

- **Expert - Medical Monitor**
  - Role: Medical Monitor
  - Function: Clinical trials, data management, safety
  - Persona: Senior Expert
  - Tier: EXPERT
  - Tenants: pharma

- **EXPERT - Clinical Data Manager**
  - Role: Clinical Data Manager
  - Function: data management
  - Persona: Senior Expert
  - Tier: EXPERT
  - Tenants: pharma

- **Expert - Therapeutic Area Expert**
  - Role: Therapeutic Area Expert
  - Function: Clinical trials, data management, safety
  - Persona: Senior Expert
  - Tier: EXPERT
  - Tenants: pharma


### Commercial

- **Expert - Brand Strategy Director**
  - Role: Brand Strategy Director
  - Function: Brand
  - Persona: Executive Leader
  - Tier: EXPERT
  - Tenants: pharma

- **WORKER - Brand Manager**
  - Role: Brand Manager
  - Function: Brand
  - Persona: Functional Manager
  - Tier: WORKER
  - Tenants: pharma

- **EXPERT - Digital Strategy Director**
  - Role: Digital Strategy Director
  - Function: Brand
  - Persona: Executive Leader
  - Tier: EXPERT
  - Tenants: pharma, digital_health

- **EXPERT - Marketing Analytics Director**
  - Role: Marketing Analytics Director
  - Function: marketing
  - Persona: Senior Expert
  - Tier: EXPERT
  - Tenants: pharma, digital_health

- **SPECIALIST - Promotional Material Developer**
  - Role: Promotional Material Developer
  - Function: marketing
  - Persona: Specialist
  - Tier: SPECIALIST
  - Tenants: pharma


### Manufacturing & CMC

- **EXPERT - Medical Quality Assurance Manager**
  - Role: Medical Quality Assurance Manager
  - Function: quality
  - Persona: Functional Manager
  - Tier: EXPERT
  - Tenants: pharma

- **SPECIALIST - formulation_development_scientist**
  - Role: Formulation Development Scientist
  - Function: CMC, quality, manufacturing
  - Persona: Specialist
  - Tier: SPECIALIST
  - Tenants: pharma

- **Expert - Validation Specialist**
  - Role: Validation Specialist
  - Function: CMC, quality, manufacturing
  - Persona: Specialist
  - Tier: EXPERT
  - Tenants: pharma

- **Expert - Quality Systems Auditor**
  - Role: Quality Systems Auditor
  - Function: quality
  - Persona: Senior Expert
  - Tier: EXPERT
  - Tenants: pharma

- **EXPERT - Supplier Quality Manager**
  - Role: Supplier Quality Manager
  - Function: quality
  - Persona: Functional Manager
  - Tier: EXPERT
  - Tenants: pharma


### Market Access & HEOR

- **Expert - HEOR Director**
  - Role: HEOR Director
  - Function: HEOR, payer strategy, pricing, patient access
  - Persona: Executive Leader
  - Tier: EXPERT
  - Tenants: pharma

- **EXPERT - Health Economics Manager**
  - Role: Health Economics Manager
  - Function: HEOR, payer strategy, pricing, patient access
  - Persona: Functional Manager
  - Tier: EXPERT
  - Tenants: pharma

- **EXPERT - Outcomes Research Specialist**
  - Role: Outcomes Research Specialist
  - Function: HEOR
  - Persona: Senior Expert
  - Tier: EXPERT
  - Tenants: pharma

- **EXPERT - HTA Submission Specialist**
  - Role: HTA Submission Specialist
  - Function: payer strategy
  - Persona: Specialist
  - Tier: EXPERT
  - Tenants: pharma

- **EXPERT - Evidence Synthesis Lead**
  - Role: Evidence Synthesis Lead
  - Function: payer strategy
  - Persona: Senior Expert
  - Tier: EXPERT
  - Tenants: pharma


### Medical Affairs

- **EXPERT - Medical Science Liaison Advisor**
  - Role: Medical Science Liaison
  - Function: MSL
  - Persona: Senior Expert
  - Tier: EXPERT
  - Tenants: pharma

- **EXPERT - Regional Medical Director**
  - Role: Regional Medical Director
  - Function: Medical strategy, MSL, medical education
  - Persona: Executive Leader
  - Tier: EXPERT
  - Tenants: pharma

- **EXPERT - Therapeutic Area MSL Lead**
  - Role: Medical Science Liaison
  - Function: MSL
  - Persona: Senior Expert
  - Tier: EXPERT
  - Tenants: pharma

- **SPECIALIST - Field Medical Trainer**
  - Role: Field Medical Trainer
  - Function: medical education
  - Persona: Specialist
  - Tier: SPECIALIST
  - Tenants: pharma

- **SPECIALIST - Medical Librarian**
  - Role: Medical Librarian
  - Function: medical education
  - Persona: Specialist
  - Tier: SPECIALIST
  - Tenants: pharma


### Operations & Project Management

- **SPECIALIST - Contract Analyst**
  - Role: Contract Analyst
  - Function: Project management, orchestration
  - Persona: Specialist
  - Tier: SPECIALIST
  - Tenants: pharma

- **WORKER - Hub Services Manager**
  - Role: Hub Services Manager
  - Function: Project management
  - Persona: Coordinator
  - Tier: WORKER
  - Tenants: pharma, digital_health

- **SPECIALIST - Congress & Events Manager**
  - Role: Congress & Events Manager
  - Function: Project management
  - Persona: Specialist
  - Tier: SPECIALIST
  - Tenants: pharma

- **MASTER - Workflow Orchestration Agent**
  - Role: Project Coordinator
  - Function: orchestration
  - Persona: Coordinator
  - Tier: MASTER
  - Tenants: pharma, digital_health

- **WORKER - Project Coordination Agent**
  - Role: Project Coordinator
  - Function: Project management
  - Persona: Coordinator
  - Tier: WORKER
  - Tenants: pharma, digital_health


### Regulatory Affairs

- **EXPERT - Government Affairs Manager**
  - Role: Government Affairs Manager
  - Function: Regulatory submissions, compliance
  - Persona: Functional Manager
  - Tier: EXPERT
  - Tenants: pharma

- **EXPERT - Healthcare Policy Analyst**
  - Role: Healthcare Policy Analyst
  - Function: Regulatory submissions, compliance
  - Persona: Analyst
  - Tier: EXPERT
  - Tenants: pharma

- **EXPERT - Medical Information Specialist**
  - Role: Medical Information Specialist
  - Function: Regulatory submissions, compliance
  - Persona: Senior Expert
  - Tier: EXPERT
  - Tenants: pharma

- **EXPERT - Medical Writer - Regulatory**
  - Role: Medical Writer - Regulatory
  - Function: Regulatory submissions, compliance
  - Persona: Senior Expert
  - Tier: EXPERT
  - Tenants: pharma

- **EXPERT - Clinical Trial Disclosure Manager**
  - Role: Clinical Trial Disclosure Manager
  - Function: Regulatory submissions, compliance
  - Persona: Senior Expert
  - Tier: EXPERT
  - Tenants: pharma


### Research & Development

- **EXPERT - Epidemiologist**
  - Role: Epidemiologist
  - Function: translational medicine
  - Persona: Senior Expert
  - Tier: EXPERT
  - Tenants: pharma

- **EXPERT - AI Drug Discovery Specialist**
  - Role: AI Drug Discovery Specialist
  - Function: Drug discovery
  - Persona: Senior Expert
  - Tier: EXPERT
  - Tenants: pharma

- **EXPERT - Evidence Generation Planner**
  - Role: Evidence Generation Planner
  - Function: Drug discovery, translational medicine
  - Persona: Senior Expert
  - Tier: EXPERT
  - Tenants: pharma

- **SPECIALIST - Machine Learning Engineer**
  - Role: Machine Learning Engineer
  - Function: Drug discovery, translational medicine
  - Persona: Specialist
  - Tier: SPECIALIST
  - Tenants: pharma, digital_health

- **SPECIALIST - Data Visualization Specialist**
  - Role: Data Visualization Specialist
  - Function: data management
  - Persona: Specialist
  - Tier: SPECIALIST
  - Tenants: pharma, digital_health


</details>

---

## Next Steps

1. ✅ Review organizational mappings
2. ✅ Validate agent name updates
3. Run migration: `python3 scripts/run_migration.py --migration 007`
4. Verify all agents mapped correctly
5. Update frontend to use organizational filters
