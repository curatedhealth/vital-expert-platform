# 📐 PHASE 1: FOUNDATION & ARCHITECTURE PROMPTS

## PROMPT 1.1: Healthcare Platform Architecture
```markdown
@workspace Design HIPAA-compliant architecture for VITAL Path platform:

REQUIREMENTS:
- Multi-tenant with complete data isolation
- HIPAA-compliant infrastructure
- Support for 10,000 concurrent users
- Sub-2 second query response time
- 99.95% uptime SLA
- Zero-trust security model
- Global deployment capability
- Offline mode support

COMPONENTS TO DESIGN:
1. Microservices architecture with health checks
2. Event-driven communication patterns
3. CQRS for read/write optimization
4. Circuit breakers for resilience
5. Audit logging architecture
6. API gateway with rate limiting
7. Service mesh for inter-service communication
8. Message queue for async processing

Output ARCHITECTURE.md with:
- Component diagrams (C4 model)
- Data flow diagrams (PHI and non-PHI)
- Security boundaries and zones
- Service communication patterns
- Deployment architecture (multi-region)
- Scaling strategies (horizontal/vertical)
- Database sharding approach
- Cache layer design
- CDN configuration
- Load balancing strategy

Use PlantUML or Mermaid for diagrams.
Include terraform snippets for infrastructure.
```

## PROMPT 1.2: Medical Knowledge System Design
```markdown
@workspace Design the medical knowledge management system:

REQUIREMENTS:
- Support for multiple medical ontologies
- Version control for medical guidelines
- Citation tracking for all claims
- Confidence scoring for medical facts
- Temporal validity (guidelines change over time)
- Multi-language support
- Contradiction resolution
- Evidence hierarchy management

COMPONENTS:
1. Knowledge graph structure (Neo4j/Neptune)
2. Medical ontology integration layer
3. Evidence hierarchy system
4. Citation management service
5. Version control system
6. Semantic search engine
7. Inference engine
8. Quality assurance pipeline

Create KNOWLEDGE_SYSTEM.md with:
- Graph database schema (nodes, relationships, properties)
- Ontology mapping strategy (UMLS integration)
- Evidence ranking algorithm (GRADE methodology)
- Citation format standards (Vancouver/AMA)
- Update propagation system
- Query optimization strategies
- Caching mechanisms
- Backup and recovery procedures
- Data validation rules
- Performance benchmarks

Include code examples for:
- Graph traversal queries
- Ontology mapping functions
- Evidence scoring algorithms
```

## PROMPT 1.3: Compliance Framework Design
```markdown
@workspace Create comprehensive compliance framework:

COMPLIANCE REQUIREMENTS:
- HIPAA audit controls (Administrative, Physical, Technical)
- FDA 21 CFR Part 11 (Electronic signatures)
- GDPR data privacy (Right to erasure, portability)
- SOC 2 Type II (Security, Availability, Integrity)
- ISO 27001 (Information Security Management)
- HITRUST CSF (Healthcare-specific controls)
- State privacy laws (CCPA, BIPA)

FRAMEWORK COMPONENTS:
1. Audit logging system (immutable, timestamped)
2. Consent management (granular permissions)
3. Data retention policies (automated lifecycle)
4. Access control matrix (RBAC + ABAC)
5. Encryption standards (AES-256, TLS 1.3)
6. Key management service
7. Privacy impact assessments
8. Breach notification system

Document in COMPLIANCE_FRAMEWORK.md:
- Compliance control mapping (NIST 800-53)
- Audit trail schema with examples
- Consent workflow diagrams
- Data classification system (Public, Internal, Confidential, Restricted)
- Security controls checklist
- Incident response procedures
- Business associate agreements
- Validation protocols
- Regular audit schedule
- Training requirements

Include implementation code for:
- Audit log service
- Consent management API
- Encryption utilities
- Access control middleware
```
