"""
Mock medical documents with comprehensive metadata
Provides realistic medical document structures for testing
"""

from datetime import datetime

# Mock Regulatory Affairs Document
MOCK_REGULATORY_DOC = {
    "id": "doc_reg_001",
    "content": """FDA guidelines for Investigational New Drug (IND) applications require comprehensive preclinical data including:

## Preclinical Requirements
- Toxicology studies in at least two mammalian species
- Pharmacology studies demonstrating proof of mechanism
- Pharmacokinetic and bioavailability data
- Safety pharmacology assessment

## Chemistry, Manufacturing, and Controls (CMC)
- Drug substance characterization
- Drug product composition and formulation
- Manufacturing process description
- Quality control specifications and test methods
- Stability data supporting proposed clinical duration

## Clinical Protocol Design
- Clear primary and secondary endpoints
- Inclusion/exclusion criteria with scientific justification
- Dose escalation strategy with safety monitoring
- Statistical analysis plan with power calculations

## Regulatory Submission Requirements
All IND applications must include:
1. Cover letter (Form FDA 1571)
2. Table of contents
3. Introductory statement and general investigational plan
4. Investigator's brochure
5. Clinical protocol(s)
6. CMC information
7. Pharmacology and toxicology information
8. Previous human experience
9. Additional information as applicable""",
    "metadata": {
        "title": "FDA Clinical Trial Guidelines - IND Application Requirements",
        "specialty": "regulatory_affairs",
        "document_type": "guidance",
        "source": "FDA",
        "authors": "FDA Center for Drug Evaluation and Research (CDER)",
        "publication_year": 2024,
        "journal": "Federal Register",
        "doi": "10.21234/fda.2024.001",
        "impact_factor": 5.2,
        "peer_reviewed": True,
        "regulatory_approved": True,
        "evidence_level": "Level 1",
        "phase": "integrate",
        "tenant_id": "550e8400-e29b-41d4-a716-446655440000"
    },
    "embedding": [0.1] * 1536,  # Placeholder - should be generated
    "similarity_score": 0.89
}

# Mock Clinical Research Document
MOCK_CLINICAL_DOC = {
    "id": "doc_clinical_002",
    "content": """Design principles for Phase 3 randomized controlled trials in medical device clinical research:

## Study Design Considerations
- Randomization: Computer-generated randomization with stratification by site and baseline risk
- Blinding: Double-blind design whenever feasible; single-blind for surgical interventions
- Control Group: Standard of care or sham procedure, ethically justified
- Sample Size: Powered for primary endpoint with 90% power, alpha=0.05

## Endpoint Selection
Primary endpoint should be:
- Clinically meaningful
- Objective and measurable
- Time-specific (e.g., 12-month follow-up)
- Agreed upon by regulatory agencies

## Statistical Considerations
- Intent-to-treat (ITT) analysis as primary
- Per-protocol analysis as sensitivity
- Handling of missing data: Multiple imputation
- Interim analyses: Alpha spending function to control Type I error

## Safety Monitoring
- Data Safety Monitoring Board (DSMB) for pivotal trials
- Regular safety reporting per ICH-GCP
- Serious Adverse Event (SAE) reporting within 24 hours
- Annual safety reports to regulatory agencies""",
    "metadata": {
        "title": "Phase 3 Clinical Trial Design for Medical Devices",
        "specialty": "clinical_research",
        "document_type": "study",
        "source": "Journal of Clinical Research",
        "authors": "Smith J, Johnson M, Williams K",
        "publication_year": 2023,
        "journal": "Clinical Trials Journal",
        "doi": "10.1234/ctj.2023.456",
        "impact_factor": 4.8,
        "peer_reviewed": True,
        "study_type": "randomized controlled trial",
        "evidence_level": "Level 2",
        "phase": "test",
        "tenant_id": "550e8400-e29b-41d4-a716-446655440000"
    },
    "embedding": [0.2] * 1536,
    "similarity_score": 0.85
}

# Mock Pharmacovigilance Document
MOCK_PHARMACOVIG_DOC = {
    "id": "doc_pharma_003",
    "content": """Post-market surveillance and pharmacovigilance requirements for medical devices under EU MDR 2017/745:

## Post-Market Surveillance (PMS) Plan
Manufacturers must establish a systematic PMS plan including:
- Collection and review of device performance data
- Analysis of complaints and adverse events
- Trending analysis for safety signals
- Post-Market Clinical Follow-up (PMCF) where applicable

## Vigilance Reporting
### Serious Incidents
Must be reported to competent authority within:
- Immediately: Death or unanticipated serious deterioration in health
- 30 days: Other serious incidents

### Field Safety Corrective Actions (FSCA)
- Immediate notification to competent authority
- Field Safety Notice (FSN) to users and patients
- Root cause analysis and corrective action plan

## Periodic Safety Update Report (PSUR)
Submit annually or as specified:
- Summary of PMS data
- Analysis of benefit-risk profile
- Field safety corrective actions taken
- Sales and distribution data
- Results of PMCF activities

## Quality Management System Integration
PMS activities must be integrated into QMS per ISO 13485:
- Management review of PMS data
- Risk management file updates
- Technical documentation updates
- Training based on lessons learned""",
    "metadata": {
        "title": "EU MDR Post-Market Surveillance Requirements",
        "specialty": "pharmacovigilance",
        "document_type": "guidance",
        "source": "EMA",
        "authors": "European Medicines Agency",
        "publication_year": 2024,
        "journal": "EU Medical Device Regulation",
        "doi": "10.5678/eumdr.2024.789",
        "impact_factor": 5.5,
        "peer_reviewed": False,
        "regulatory_approved": True,
        "evidence_level": "Level 1",
        "phase": "learn",
        "tenant_id": "550e8400-e29b-41d4-a716-446655440000"
    },
    "embedding": [0.3] * 1536,
    "similarity_score": 0.87
}

# Mock Medical Writing Document
MOCK_MEDICAL_WRITING_DOC = {
    "id": "doc_medwrite_004",
    "content": """Best practices for writing Clinical Study Reports (CSR) per ICH E3 guidelines:

## CSR Structure (ICH E3)
1. Title Page
2. Synopsis (max 3000 words)
3. Table of Contents
4. List of Abbreviations
5. Ethics
6. Investigators and Study Administrative Structure
7. Introduction
8. Study Objectives
9. Investigational Plan
10. Study Patients
11. Efficacy Evaluation
12. Safety Evaluation
13. Discussion and Overall Conclusions
14. Tables, Figures, and Graphs
15. Reference List
16. Appendices

## Key Requirements
- Objective, factual presentation of results
- Clear description of statistical methods
- Complete safety data presentation
- All protocol deviations documented
- Quality control of data and analyses

## Timeline Considerations
- CSR completion within 1 year of study completion
- Regulatory submission requires complete CSR
- Synopsis may be submitted earlier for preliminary review""",
    "metadata": {
        "title": "ICH E3 Guidelines for Clinical Study Reports",
        "specialty": "medical_writing",
        "document_type": "protocol",
        "source": "ICH",
        "authors": "International Council for Harmonisation",
        "publication_year": 2023,
        "journal": "ICH Guidelines",
        "doi": "10.9012/ich.e3.2023",
        "impact_factor": 6.0,
        "peer_reviewed": True,
        "regulatory_approved": True,
        "evidence_level": "Level 1",
        "phase": "activate",
        "tenant_id": "550e8400-e29b-41d4-a716-446655440000"
    },
    "embedding": [0.4] * 1536,
    "similarity_score": 0.82
}

# Collection of all mock documents
MOCK_DOCUMENTS = [
    MOCK_REGULATORY_DOC,
    MOCK_CLINICAL_DOC,
    MOCK_PHARMACOVIG_DOC,
    MOCK_MEDICAL_WRITING_DOC
]

