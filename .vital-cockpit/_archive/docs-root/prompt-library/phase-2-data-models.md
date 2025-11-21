# 🏛️ PHASE 2: DATA MODELS & STRUCTURE PROMPTS

## PROMPT 2.1: Healthcare Data Models
```markdown
@workspace Create healthcare-specific data models:

CORE ENTITIES:
1. Patient
   - Demographics (FHIR compliant)
   - Medical history
   - Consent records
   - PHI markers

2. ClinicalTrial
   - NCT ID
   - Phases (I, II, III, IV)
   - Primary/secondary endpoints
   - Inclusion/exclusion criteria
   - Study results
   - Adverse events

3. RegulatorySubmission
   - Submission type (IND, NDA, 510k, PMA)
   - Status workflow
   - Documents and attachments
   - Review timeline
   - Approval history

4. MedicalEvidence
   - PMID/DOI
   - Study type (RCT, observational, meta-analysis)
   - Quality score (Jadad, GRADE)
   - Citations and references
   - Extracted data points

5. ReimbursementPathway
   - Payer information
   - CPT/HCPCS codes
   - Coverage requirements
   - Prior authorization rules
   - Appeal processes

6. AdverseEvent
   - MedDRA coding
   - Severity (Grade 1-5)
   - Frequency
   - Causality assessment
   - Reporter information

For each entity include:
- Full schema with healthcare-specific fields
- Relationships to other entities (foreign keys)
- Audit fields (created_by, created_at, modified_by, modified_at)
- Versioning strategy (temporal tables)
- PHI/PII field marking
- Encryption requirements
- Validation rules
- Indexes for query optimization

Follow HL7 FHIR R4 standards where applicable.
Use PostgreSQL with appropriate extensions.
Include migration scripts with rollback capability.

Output as HEALTHCARE_MODELS.sql with:
- CREATE TABLE statements
- Index definitions
- Constraint definitions
- Trigger functions for audit
- Sample data for testing
- Performance optimization hints
```

## PROMPT 2.2: Medical Knowledge Base Structure
```markdown
@workspace Implement medical knowledge base:

KNOWLEDGE SOURCES:
1. PubMed/MEDLINE articles (25M+ articles)
2. ClinicalTrials.gov data (400K+ trials)
3. FDA approval documents (Orange Book, Purple Book)
4. Clinical practice guidelines (1000+ guidelines)
5. Real-world evidence studies
6. Drug databases (RxNorm, DrugBank)
7. Disease databases (OMIM, OrphaNet)

IMPLEMENTATION REQUIREMENTS:
- Document ingestion pipeline (batch and streaming)
- Medical NER extraction (diseases, drugs, procedures)
- Semantic chunking for medical texts (context preservation)
- Embedding generation with medical models (BioBERT, PubMedBERT)
- Citation extraction and linking
- Quality scoring for evidence
- Deduplication at scale
- Incremental updates
- Version control for documents

Create KNOWLEDGE_PIPELINE.py with:
- Ingestion services for each source
  - PubMed API client with rate limiting
  - ClinicalTrials.gov bulk download handler
  - FDA database scrapers
  - PDF processing for guidelines
- Medical entity recognition using:
  - spaCy with scispaCy models
  - BioBERT for named entities
  - UMLS concept extraction
- Quality scoring algorithms:
  - Journal impact factor integration
  - Study design classification
  - Sample size extraction
  - P-value and confidence interval parsing
- Update scheduling system:
  - Daily incremental updates
  - Weekly full refreshes
  - Change detection mechanisms
- Deduplication logic:
  - Fuzzy matching for titles
  - DOI/PMID resolution
  - Author name disambiguation

Include async processing with Celery/RabbitMQ.
Use Apache Airflow for orchestration.
Implement with error handling and retry logic.
```

## PROMPT 2.3: Compliance Data Layer
```markdown
@workspace Build compliance-focused data layer:

REQUIREMENTS:
- Immutable audit log (blockchain-style)
- Encrypted PHI storage (field-level encryption)
- Consent tracking (granular permissions)
- Data lineage tracking (full transformation history)
- Right to erasure support (GDPR Article 17)
- Data residency controls
- Retention automation
- Access logging

COMPONENTS TO CREATE:

1. AuditLog table
   - Event type, user, timestamp, IP address
   - Before/after values for changes
   - Digital signatures for integrity
   - Immutable with append-only design

2. ConsentRecords
   - Patient ID (encrypted)
   - Consent types and versions
   - Granted/revoked timestamps
   - Purpose of use
   - Data sharing agreements

3. DataLineage
   - Source system and timestamp
   - Transformation operations
   - Validation results
   - Quality metrics
   - Downstream consumers

4. EncryptedPHI
   - Separated PHI storage with encryption
   - Key rotation support
   - Access control lists
   - Audit trail references

5. RetentionPolicies
   - Data categories and retention periods
   - Automated deletion jobs
   - Legal hold capabilities
   - Disposal certificates

Implement with:
- Row-level security (PostgreSQL RLS)
- Column-level encryption (pgcrypto)
- Audit triggers on all tables
- Soft delete for compliance (deleted_at timestamp)
- Data masking functions for non-production
- Backup encryption and testing
- Point-in-time recovery capability

Output COMPLIANCE_DATA_LAYER.sql with:
- Table definitions with constraints
- Encryption functions and procedures
- Audit trigger implementations
- Security policies
- Test data generators (with PHI masking)
- Performance benchmarks
- Disaster recovery procedures
```
