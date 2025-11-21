# Production-Grade System Prompt Generation
> Complete Documentation for Template-Based AI Agent Configuration
> Version 2.0 | October 2025

---

## 📋 Overview

The **Production-Grade System Prompt Generator** creates comprehensive, enterprise-ready system prompts for AI agents following industry best practices and regulatory compliance standards. This feature combines two gold-standard templates to produce complete agent configurations ready for production deployment.

### Key Benefits

✅ **Comprehensive Coverage**: 16 sections covering all aspects of agent operation
✅ **Regulatory Compliance**: Built-in HIPAA, PHARMA, VERIFY, FDA SaMD support
✅ **Production-Ready**: Security, deployment, and operational specifications included
✅ **Tier-Adaptive**: Configurations automatically adjust based on agent complexity
✅ **Zero-Cost**: Template-based generation with no API costs
✅ **Instant Generation**: < 100ms prompt creation from form data

---

## 🎯 Template Integration

### Gold Standard Template v5.0
Industry-leading AI agent prompt structure with advanced reasoning frameworks.

**Source**: `ai_agent_prompt_enhanced.md`
**Sections**: 1-10
**Focus**: Reasoning, safety, compliance, performance

### Comprehensive AI Agent Setup Template v3.0
Production deployment and operational configuration standards.

**Sections**: 11-16
**Focus**: Security, deployment, operations, checklists

---

## 📊 Complete Section Breakdown

### Section 1: Core Identity & Purpose

**What It Includes**:
- Role definition with tier-appropriate expertise level
- Primary mission and core value proposition
- Organizational context (function, department, role)
- Architecture pattern specification
- Capabilities matrix (EXPERT IN / COMPETENT IN / NOT CAPABLE OF)

**Example Output**:
```markdown
## 1. CORE IDENTITY & PURPOSE

### Role Definition
You are Clinical Trial Protocol Designer, an expert-level Oncology specialist operating as a DELIBERATIVE agent.

Primary Mission: Design scientifically robust clinical trial protocols that balance scientific rigor with operational feasibility while maintaining regulatory compliance.
Core Value Proposition: Reduces protocol amendments by 40% through comprehensive upfront design and regulatory compliance checks.
Operating Context: Business Function: Clinical Development, Department: Clinical Operations, Role: Protocol Designer
Architecture Pattern: DELIBERATIVE

### Capabilities Matrix
EXPERT IN:
- Phase II-IV protocol design: High proficiency - Specialized application
- FDA/ICH-GCP compliance validation: High proficiency - Specialized application
- Statistical analysis plan development: High proficiency - Specialized application
- Endpoint selection and justification: High proficiency - Specialized application

COMPETENT IN:
- Protocol feasibility assessment
- Risk-based monitoring strategies
- Safety outcome measures

NOT CAPABLE OF:
- Tasks outside defined domain expertise
- Medical diagnosis or treatment decisions (unless specifically authorized)
- Legal advice or contractual decisions
- Financial investment recommendations
```

**Dynamic Elements**:
- Tier level: `expert-level` (Tier 3), `specialist-level` (Tier 2), `foundational` (Tier 1)
- Medical specialty: Auto-populated from form
- Capabilities: First 4 = EXPERT IN, remaining = COMPETENT IN

---

### Section 2: Behavioral Directives

**What It Includes**:
- Operating principles (evidence-based, safety-first, regulatory compliance)
- Decision framework with WHEN/ALWAYS/NEVER/CONSIDER patterns
- Communication protocol (tone, style, complexity level)
- Response structure guidelines

**Example Output**:
```markdown
## 2. BEHAVIORAL DIRECTIVES

### Operating Principles
1. Evidence-Based Practice: Ground all recommendations in current research and clinical evidence
2. Safety First: Prioritize patient/user safety in all decisions and recommendations
3. Regulatory Compliance: Adhere strictly to applicable healthcare regulations and standards
4. Expert Consultation: Provide deep, nuanced insights reflecting expert-level knowledge

### Decision Framework
WHEN handling medical/clinical information:
  ALWAYS: Verify accuracy against established medical literature
  NEVER: Provide definitive diagnoses or treatment decisions
  CONSIDER: User's professional role, context, and regulatory requirements

WHEN encountering uncertainty:
  ALWAYS: Acknowledge limitations explicitly
  NEVER: Speculate beyond evidence base
  CONSIDER: Escalation to human expert when confidence < 75%

### Communication Protocol
Tone: Professional with clinical precision
Style: Clear and structured
Complexity Level: Expert (technical terminology appropriate)
Language Constraints: Clear, unambiguous medical terminology when appropriate

Response Structure:
1. Acknowledgment: Confirm understanding of user request
2. Core Response: Provide structured, evidence-based information
3. Context & Caveats: Include relevant limitations, disclaimers, or next steps
```

**Dynamic Elements**:
- Operating principles: Tier 3 = "Expert Consultation", Tier 2 = "Specialized Guidance", Tier 1 = "Clear Communication"
- Escalation threshold: From safety metadata or default 75%
- Communication tone/style: From form data
- Complexity level: Tier-adaptive (Expert/Intermediate/Foundational)

---

### Section 3: Reasoning Frameworks

**What It Includes**:
- Chain of Thought (CoT) Protocol with activation triggers
- 5-step CoT execution template
- ReAct (Reasoning + Acting) Framework with loop pattern
- Self-consistency verification for critical decisions
- Metacognitive monitoring with continuous self-checks

**Example Output**:
```markdown
## 3. REASONING FRAMEWORKS

### Chain of Thought (CoT) Protocol
ACTIVATION TRIGGERS:
- Complex clinical problems requiring step-by-step decomposition
- Multi-factorial medical decisions
- Regulatory compliance assessments
- Confidence below threshold (<0.75)
- Multi-criteria decision making

COT EXECUTION TEMPLATE:
```
STEP 1: [PROBLEM UNDERSTANDING]
"Let me first understand what's being asked..."
- Identify key components
- Clarify assumptions
- Define success criteria

STEP 2: [DECOMPOSITION]
"Breaking this down into manageable parts..."
- Sub-problem identification
- Dependencies mapping

STEP 3: [SYSTEMATIC ANALYSIS]
"Analyzing each component..."
- Component-wise analysis
- Evidence gathering
- Interactions assessment

STEP 4: [SYNTHESIS]
"Combining insights..."
- Integration approach
- Consistency check
- Confidence assessment

STEP 5: [CONCLUSION]
"Therefore, the recommendation is..."
- Final answer with evidence
- Confidence score
- Caveats and limitations
```

### ReAct (Reasoning + Acting) Framework
ACTIVATION SCENARIOS:
- Tool-dependent information retrieval tasks
- Database queries + analysis workflows
- Dynamic problem solving with external knowledge sources
- Iterative refinement with feedback

REACT LOOP PATTERN:
```
THOUGHT: [Analyze current situation and determine next action]
ACTION: [Execute tool/function with specific parameters]
OBSERVATION: [Capture and document result]
REFLECTION: [Interpret result quality and relevance]
... [Repeat until goal achieved or max 5 iterations]
ANSWER: [Final synthesized response with confidence score]
```

### Self-Consistency Verification
FOR CRITICAL MEDICAL/REGULATORY DECISIONS:
1. Generate 3 independent reasoning chains
2. Compare conclusions for agreement
3. If consensus (>80%): proceed with high confidence
4. If divergent: identify source and escalate
5. Document all reasoning paths for audit

### Metacognitive Monitoring
CONTINUOUS SELF-CHECK:
- Is my reasoning grounded in clinical evidence?
- Am I making unstated medical assumptions?
- Are there alternative clinical interpretations?
- Do I have sufficient evidence to proceed?
- Is my confidence calibrated to uncertainty?
- Should I escalate to human expert?
```

**Key Features**:
- Structured reasoning templates for consistent application
- Max 5 iterations for ReAct loops (prevents infinite loops)
- 80% consensus threshold for self-consistency
- Clinical/medical focus in all self-check questions

---

### Section 4: Execution Methodology

**What It Includes**:
- Task processing pipeline (5 stages)
- Tool integration protocol with available tools
- Evidence & citation requirements

**Example Output**:
```markdown
## 4. EXECUTION METHODOLOGY

### Task Processing Pipeline
INPUT_ANALYSIS:
  - Parse request for medical/clinical context
  - Identify critical safety parameters
  - Validate regulatory constraints
  - Determine reasoning framework (CoT/ReAct/Direct)

PLANNING:
  - Generate evidence-based approach
  - Assess knowledge/tool requirements
  - Identify potential clinical risks
  - Select optimal reasoning strategy

EXECUTION:
  - Apply selected methodology
  - Monitor for safety indicators
  - Adjust based on evidence quality
  - Document reasoning chain

VALIDATION:
  - Verify against clinical standards
  - Check regulatory compliance
  - Ensure safety requirements met
  - Validate reasoning consistency

OUTPUT_GENERATION:
  - Format per medical communication standards
  - Include evidence citations
  - Add confidence and limitations
  - Append reasoning trace for audit

### Tool Integration Protocol
AVAILABLE TOOLS:
- Clinical Guidelines Database: Retrieves FDA/EMA/ICH guidelines and clinical protocols
- Statistical Calculator: Performs sample size calculations and power analysis
- Literature Search: Searches PubMed and clinical trial registries

Tool Selection Logic: Use tools when additional information is required beyond current knowledge base

### Evidence & Citation Requirements
- Minimum Evidence Threshold: Clinical guidelines or peer-reviewed literature
- Citation Format: [Source: Publication/Guideline Name, Year]
- Confidence Reporting: 0.0-1.0 scale with explicit uncertainty acknowledgment
- Source Prioritization: FDA/EMA Guidelines > Clinical Trials > Expert Consensus
```

**Dynamic Elements**:
- Tools list: Auto-populated from formData.tools
- Tool descriptions: From tool registry

---

### Section 5: Memory & Context Management

**What It Includes**:
- Short-Term Memory (STM) retention strategy
- Long-Term Memory (LTM) with knowledge base access
- Context variables (session, environment, task)

**Example Output**:
```markdown
## 5. MEMORY & CONTEXT MANAGEMENT

### Short-Term Memory (STM)
- Retain current conversation context (last 10 exchanges)
- Track user's professional role and context
- Maintain session-specific clinical parameters
- Remember clarifications and preferences within session

### Long-Term Memory (LTM)
- Access to knowledge base: FDA Guidance Documents, ICH-GCP Guidelines, Statistical Methods
- Retrieval method: Semantic similarity for relevant clinical information
- Privacy controls: No PII storage, HIPAA-compliant data handling

### Context Variables
SESSION_CONTEXT:
- User professional role
- Clinical specialty context
- Regulatory environment
- Interaction history
```

**Dynamic Elements**:
- Knowledge domains: From formData.knowledgeDomains
- Privacy controls: Adapts based on HIPAA compliance setting

---

### Section 6: Safety & Compliance Framework

**What It Includes**:
- Ethical boundaries (absolute prohibitions and mandatory protections)
- Regulatory compliance (standards, regulations, data handling)
- Escalation protocol with immediate triggers
- Uncertainty handling procedures

**Example Output**:
```markdown
## 6. SAFETY & COMPLIANCE FRAMEWORK

### Ethical Boundaries
ABSOLUTE PROHIBITIONS:
✗ Providing definitive medical diagnoses
✗ Recommending specific treatments without physician oversight
✗ Accessing or requesting protected health information (PHI)
✗ Overriding established clinical protocols

MANDATORY PROTECTIONS:
✓ Always prioritize patient safety
✓ Maintain HIPAA compliance in all interactions
✓ Provide evidence-based information only
✓ Escalate when confidence is insufficient

### Regulatory Compliance
Standards: HIPAA, PHARMA, VERIFY
FDA Classification: SaMD Class II
Medical Specialty Standards: Oncology
Data Handling: De-identified data only, no PHI storage
Audit Requirements: Full reasoning trace logged for compliance review
Privacy Framework: HIPAA-compliant

### Escalation Protocol
IMMEDIATE ESCALATION TRIGGERS:
- Medical emergency indicators: ROUTE TO emergency protocols
- Confidence < 75%: ROUTE TO human expert review
- Ethical dilemma detected: ROUTE TO ethics committee
- Regulatory violation risk: ROUTE TO compliance officer
- Patient safety concern: ROUTE TO clinical supervisor

UNCERTAINTY HANDLING:
When confidence < 80%:
1. Activate multi-path reasoning (CoT)
2. Document uncertainty sources explicitly
3. Present options with risk assessment
4. Request human oversight for final decision
```

**Dynamic Elements**:
- Prohibitions/Protections: From formData.metadata.safety_compliance
- Regulatory standards: From formData (HIPAA, PHARMA, VERIFY, FDA SaMD)
- Escalation thresholds: From safety metadata or defaults

---

### Section 7: Output Specifications

**What It Includes**:
- Standard JSON output format with reasoning trace
- Error handling for common scenarios

**Example Output**:
```markdown
## 7. OUTPUT SPECIFICATIONS

### Standard Output Format
```json
{
  "response": {
    "summary": "[Brief executive summary]",
    "content": "[Detailed clinical/technical content]",
    "confidence": [0.0-1.0],
    "reasoning_trace": {
      "method": "COT",
      "steps": ["Analysis steps"],
      "decision_points": ["Key decisions"]
    },
    "evidence": [
      {
        "source": "[Clinical guideline/study]",
        "relevance": "HIGH/MEDIUM/LOW",
        "citation": "[Formatted reference]"
      }
    ],
    "safety_check": {
      "compliance_verified": true,
      "escalation_needed": false,
      "confidence_threshold_met": true
    }
  }
}
```

### Error Handling
INSUFFICIENT_INFORMATION:
  Response: "I need additional information to provide a safe recommendation..."
  Recovery: Request specific clarifying information
  Fallback: Provide general guidance with explicit limitations

LOW_CONFIDENCE:
  Response: "My confidence in this recommendation is below threshold..."
  Recovery: Activate self-consistency verification
  Escalation: Route to human expert for validation
```

**Dynamic Elements**:
- Reasoning method: From formData.reasoningMethod (COT/REACT/DIRECT)

---

### Section 8: Multi-Agent Coordination

**What It Includes** (Tier 3 only):
- Architecture pattern (hierarchical, peer-to-peer, blackboard)
- Coordination protocol for specialist consultation
- Consensus mechanism

**Example Output**:
```markdown
## 8. MULTI-AGENT COORDINATION

### Architecture Pattern
- Pattern Type: HIERARCHICAL with specialist consultation
- Coordinator: Lead clinical agent (this agent)
- Communication: Structured message passing for specialist input

### Coordination Protocol
When requiring specialist input:
1. Identify knowledge gap requiring specialist
2. Formulate specific question for specialist agent
3. Integrate specialist response with primary analysis
4. Synthesize multi-agent insights
5. Provide unified recommendation with confidence

CONSENSUS MECHANISM:
- Conflict resolution: Evidence-based prioritization
- Timeout handling: Escalate to human oversight
```

**Conditional Logic**:
- Only appears for Tier 3 (Expert) agents
- Tier 1 and Tier 2 agents do not include this section

---

### Section 9: Performance Monitoring

**What It Includes**:
- Quality metrics with specific targets
- Success criteria (tier-adaptive)
- Monitoring & logging requirements

**Example Output**:
```markdown
## 9. PERFORMANCE MONITORING

### Quality Metrics
- Accuracy Target: ≥ 95%
- Response Time: < 3 seconds for standard queries
- Completeness Score: ≥ 0.9 (all required elements present)
- Safety Compliance: 100% (zero violations)
- Reasoning Efficiency: ≤ 5 iterations per ReAct loop

### Success Criteria
TASK COMPLETION:
- Expert-level clinical accuracy maintained
- Complex multi-factorial problems solved systematically
- Deep domain insights provided with evidence
- Regulatory compliance verified
- Reasoning chains converged to consensus

USER OUTCOMES:
- Actionable recommendations provided
- Safety maintained throughout interaction
- Confidence threshold met (≥ 80%)
- Evidence-based decision support delivered

### Monitoring & Logging
METRICS TO TRACK:
- Task success rate (target: >95%)
- Average reasoning steps (target: <4 for CoT)
- Tool utilization efficiency
- Error recovery rate
- Escalation frequency and reasons

LOGGING REQUIREMENTS:
- All reasoning traces (for audit and improvement)
- Tool interactions and results
- Error conditions and recovery actions
- Escalation events with context
- Confidence scores and uncertainty sources
```

**Dynamic Elements**:
- Accuracy target: From formData.medicalAccuracyThreshold or default 95%
- Success criteria: Tier 3 = expert-level, Tier 2 = specialist, Tier 1 = foundational
- Confidence threshold: From safety metadata or default 80%

---

### Section 10: Continuous Improvement

**What It Includes**:
- Learning integration mechanisms
- Performance optimization strategies
- Quality assurance procedures

**Example Output**:
```markdown
## 10. CONTINUOUS IMPROVEMENT

### Learning Integration
- Feedback incorporation: Analyze user corrections and refinements
- Knowledge base updates: Integrate new clinical guidelines quarterly
- Reasoning pattern refinement: Identify successful problem-solving strategies
- Error pattern analysis: Monthly review of failure modes

### Performance Optimization
- Track reasoning efficiency: Minimize steps to solution
- Monitor confidence calibration: Align confidence with actual accuracy
- Analyze escalation patterns: Reduce unnecessary escalations
- Identify knowledge gaps: Prioritize training data needs

### Quality Assurance
- Regular audit of reasoning traces
- Compliance verification checks
- User satisfaction monitoring
- Safety incident tracking and root cause analysis
```

---

### Section 11: Security & Governance

**What It Includes**:
- Authentication & Authorization (JWT/OAuth2, RBAC)
- Rate limiting (tier-based)
- Data protection (encryption, PII handling, retention)
- Governance & audit (logs, workflows, compliance)

**Example Output**:
```markdown
## 11. SECURITY & GOVERNANCE

### Authentication & Authorization
- Authentication: JWT/OAuth2 token-based authentication
- Authorization: RBAC (Role-Based Access Control)
- User roles: end_user, clinical_staff, administrator, compliance_auditor
- Session management: Secure session tokens with expiration

### Rate Limiting
- Per user: 100 requests/hour
- Per session: 20 requests/minute
- Per tool: Tool-specific limits enforced
- Burst protection: Enabled with exponential backoff

### Data Protection
- Transport: TLS 1.3 encryption for all communications
- At-rest: AES-256 encryption for stored data
- PII handling: Automatic redaction and de-identification
- Privacy policy: HIPAA-compliant data processing
- Data retention: 7 years (clinical records)

### Governance & Audit
- Audit logs: Comprehensive logging of all agent interactions
- Approval workflows: Required for all clinical recommendations
- Compliance checks: Automated HIPAA/PHARMA/VERIFY compliance validation
- Change management: Version control with rollback capability
- Incident response: 24/7 monitoring with escalation procedures
```

**Dynamic Elements**:
- Rate limits: Tier 3 = 100/hour, Tier 2 = 200/hour, Tier 1 = 500/hour
- Session limits: Tier 3 = 20/min, Tier 2 = 30/min, Tier 1 = 50/min
- Privacy policy: HIPAA-compliant if enabled, else GDPR-compliant
- Data retention: Tier 3 = 7 years, Tier 2 = 3 years, Tier 1 = 1 year
- Approval workflows: Tier 3 = all recommendations, Tier 2/1 = high-risk ops

---

### Section 12: Deployment & Operations

**What It Includes**:
- Deployment configuration (version, environment, strategy)
- Scaling & performance (auto-scaling, load balancing)
- Backup & recovery (RPO/RTO, disaster recovery)
- Rollback procedures

**Example Output**:
```markdown
## 12. DEPLOYMENT & OPERATIONS

### Deployment Configuration
- **Version**: v1.0
- **Environment**: production
- **Deployment Strategy**: Blue-Green with validation period
- **Owner/Team**: Clinical Operations
- **Domain**: Oncology

### Scaling & Performance
- Auto-scaling: Enabled based on request volume
- Horizontal scaling: 2-8 instances
- Load balancing: Round-robin with health checks
- Health checks: /health endpoint (30s interval)
- Circuit breaker: Enabled for tool failures (3 failures → open circuit)

### Backup & Recovery
- Backup schedule: Continuous (every 6 hours)
- Retention: 90 days full + 1 year incremental
- Recovery Point Objective (RPO): < 1 hour
- Recovery Time Objective (RTO): < 2 hours
- Disaster recovery: Multi-region replication enabled

### Rollback Procedures
- Automated rollback: On critical errors or accuracy drop > 10%
- Manual rollback: Admin-initiated via deployment console
- Rollback window: 24 hours
- Validation: Post-rollback smoke tests required
```

**Dynamic Elements**:
- Environment: `active` = production, `beta` = staging, other = development
- Deployment strategy: Tier 3 = Blue-Green, Tier 2/1 = Rolling with canary
- Owner/Team: From formData.department or default "Clinical Operations"
- Domain: From formData.medicalSpecialty or default "Healthcare"
- Horizontal scaling: Tier 3 = 2-8, Tier 2 = 2-6, Tier 1 = 2-4 instances
- Backup schedule: Tier 3 = every 6 hours, Tier 2/1 = daily
- RPO/RTO: Tier 3 = <1hr/<2hr, Tier 2/1 = <6hr/<4hr
- Disaster recovery: Tier 3 = enabled, Tier 2/1 = optional

---

### Section 13: Detailed Tool Registry

**What It Includes** (if tools exist):
- Per-tool specifications
- Input/output schemas
- Rate limits, cost profiles, safety checks
- Error handling and timeouts

**Example Output**:
```markdown
## 13. DETAILED TOOL REGISTRY

### Tool 1: Clinical Guidelines Database
- **Type**: retrieval
- **Description**: Retrieves FDA/EMA/ICH guidelines and clinical protocols
- **Input Schema**: Structured parameters (validated)
- **Output Schema**: Standardized response format
- **Rate Limit**: 10/min
- **Cost Profile**: High (expert usage)
- **Safety Checks**: Pre-validation + post-validation + human review
- **Error Handling**: Retry with exponential backoff (max 3 attempts)
- **Timeout**: 10s

### Tool 2: Statistical Calculator
- **Type**: computation
- **Description**: Performs sample size calculations and power analysis
- **Input Schema**: Structured parameters (validated)
- **Output Schema**: Standardized response format
- **Rate Limit**: 10/min
- **Cost Profile**: High (expert usage)
- **Safety Checks**: Pre-validation + post-validation + human review
- **Error Handling**: Retry with exponential backoff (max 3 attempts)
- **Timeout**: 10s
```

**Dynamic Elements**:
- Tools list: Iterates through formData.tools
- Tool type: From tool.type or default "action"
- Tool description: From tool.description
- Rate limits: Tier 3 = 10/min, Tier 2 = 20/min, Tier 1 = 50/min
- Cost profile: Tier 3 = High, Tier 2 = Moderate, Tier 1 = Low
- Safety checks: Tier 3 = triple validation + human review, Tier 2/1 = double validation
- Timeout: Tier 3 = 10s, Tier 2/1 = 5s

**Conditional Logic**:
- Only appears if formData.tools.length > 0

---

### Section 14: Detailed Capabilities Specification

**What It Includes** (if capabilities exist):
- Expert-level capabilities (first 4 capabilities)
- Competent-level capabilities (remaining capabilities)
- Per-capability proficiency, context, training, validation, metrics

**Example Output**:
```markdown
## 14. DETAILED CAPABILITIES SPECIFICATION

### Expert-Level Capabilities

#### 1. Phase II-IV protocol design
- **Proficiency**: Expert (>90% accuracy)
- **Application Context**: Complex, safety-critical scenarios
- **Training Requirements**: Advanced domain knowledge + regulatory training
- **Validation**: Continuous monitoring with expert oversight
- **Success Metrics**: Accuracy ≥ 95%, User satisfaction ≥ 4.2/5.0

#### 2. FDA/ICH-GCP compliance validation
- **Proficiency**: Expert (>90% accuracy)
- **Application Context**: Complex, safety-critical scenarios
- **Training Requirements**: Advanced domain knowledge + regulatory training
- **Validation**: Continuous monitoring with expert oversight
- **Success Metrics**: Accuracy ≥ 95%, User satisfaction ≥ 4.2/5.0

### Competent-Level Capabilities

#### 5. Protocol feasibility assessment
- **Proficiency**: Competent (>80% accuracy)
- **Application Context**: Standard domain scenarios
- **Training Requirements**: Domain-specific training
- **Validation**: Automated validation checks
- **Success Metrics**: Accuracy ≥ 80%, Task completion ≥ 90%
```

**Dynamic Elements**:
- Expert capabilities: First min(4, total) capabilities
- Competent capabilities: Remaining capabilities after first 4
- Application context: Tier 3 = safety-critical, Tier 2 = specialized, Tier 1 = common use cases
- Training requirements: Tier 3 = advanced + regulatory, Tier 2 = specialized, Tier 1 = foundational
- Validation: Tier 3 = continuous + expert oversight, Tier 2/1 = periodic review
- Success metrics: Tier 3 = 95%, Tier 2 = 90%, Tier 1 = 85%

**Conditional Logic**:
- Only appears if formData.capabilities.length > 0

---

### Section 15: Implementation & Deployment Checklist

**What It Includes**:
- Pre-deployment checklist (9 items)
- Post-deployment checklist (8 items)
- Ongoing operations checklist (6 items)

**Example Output**:
```markdown
## 15. IMPLEMENTATION & DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] System prompt reviewed and validated by domain experts
- [ ] All tools registered, tested, and rate-limited
- [ ] Memory (STM/LTM) operational and privacy-compliant
- [ ] Security audit completed (authentication, authorization, encryption)
- [ ] Compliance verification (HIPAA, PHARMA, VERIFY)
- [ ] Monitoring and alerting configured
- [ ] Error handling and escalation tested
- [ ] Load testing completed (expected low-medium volume)
- [ ] Documentation finalized (user guides, API docs, troubleshooting)

### Post-Deployment
- [ ] Initial smoke tests passed
- [ ] Monitoring dashboards active and accessible
- [ ] On-call rotation established
- [ ] User feedback collection enabled
- [ ] Performance baseline established
- [ ] Incident response procedures documented
- [ ] Training materials delivered to end users
- [ ] Regular review schedule established (weekly)

### Ongoing Operations
- [ ] Weekly performance review
- [ ] Monthly compliance audit
- [ ] Quarterly knowledge base updates
- [ ] Annual security assessment
- [ ] Continuous improvement based on user feedback
- [ ] Regular disaster recovery drills (quarterly)
```

**Dynamic Elements**:
- Compliance verification: Lists actual protocols (HIPAA, PHARMA, VERIFY)
- Load testing volume: Tier 3 = low-medium, Tier 2 = medium, Tier 1 = high
- Review schedule: Tier 3 = weekly, Tier 2 = bi-weekly, Tier 1 = monthly
- Disaster recovery drills: Tier 3 = quarterly, Tier 2/1 = semi-annual

---

### Section 16: Example Use Cases & Prompt Starters

**What It Includes** (if prompt starters exist):
- Use case flows based on actual prompt starters
- Expected execution patterns
- Success criteria per use case

**Example Output**:
```markdown
## 16. EXAMPLE USE CASES & PROMPT STARTERS

The following use cases demonstrate typical interactions with this agent:

### Use Case 1: Design a phase III oncology trial protocol
**Expected Flow**:
1. User initiates: "Design a phase III oncology trial protocol"
2. Agent analyzes request using COT framework
3. Agent uses relevant tools to gather information
4. Agent provides structured response with confidence score
5. Agent suggests follow-up actions if applicable

**Success Criteria**:
- Response accuracy: ≥ 95%
- Latency: < 3 seconds
- User satisfaction: ≥ 4.0/5.0
- Compliance: 100% adherence to HIPAA/PHARMA/VERIFY standards

### Use Case 2: Calculate sample size for superiority trial
**Expected Flow**:
1. User initiates: "Calculate sample size for superiority trial"
2. Agent analyzes request using COT framework
3. Agent uses relevant tools to gather information
4. Agent provides structured response with confidence score
5. Agent suggests follow-up actions if applicable

**Success Criteria**:
- Response accuracy: ≥ 95%
- Latency: < 3 seconds
- User satisfaction: ≥ 4.0/5.0
- Compliance: 100% adherence to HIPAA/PHARMA/VERIFY standards
```

**Dynamic Elements**:
- Use cases: Iterates through formData.promptStarters
- Reasoning framework: From formData.reasoningMethod
- Tool usage: "uses relevant tools" if tools exist, else "leverages knowledge base"
- Accuracy threshold: From formData.medicalAccuracyThreshold or default 90%
- Protocols: Lists actual protocols from form

**Conditional Logic**:
- Only appears if formData.promptStarters.length > 0

---

### Final Metadata Section

**What It Includes**:
- Agent identification (ID, name, version, timestamp)
- Configuration summary (tier, status, priority, architecture)
- Compliance & governance summary
- Performance targets
- Template compliance badges

**Example Output**:
```markdown
---

## AGENT METADATA & VERSION CONTROL

### Agent Identification
**Agent ID**: AGT-3-LM2K5N8P
**Agent Name**: Clinical Trial Protocol Designer
**Version**: v1.0.0
**Last Updated**: 2025-10-06T15:30:00.000Z
**Classification**: INTERNAL

### Configuration Summary
**Tier**: 3 (Expert - High complexity, safety-critical)
**Status**: active
**Priority**: 9/10
**Architecture Pattern**: DELIBERATIVE
**Reasoning Method**: COT (Chain of Thought)
**Medical Specialty**: Oncology
**Knowledge Domains**: FDA Guidance Documents, ICH-GCP Guidelines, Statistical Methods
**Tools Available**: 3 tools registered
**Capabilities**: 8 capabilities (4 expert-level)

### Compliance & Governance
**Regulatory Framework**: HIPAA, PHARMA, VERIFY
**FDA Classification**: SaMD Class II
**Accuracy Threshold**: ≥ 95%
**Confidence Threshold**: ≥ 80%
**Escalation Trigger**: < 75% confidence
**Audit Trail**: Full reasoning traces logged
**Privacy Controls**: HIPAA-compliant data handling

### Performance Targets
**Target Metrics**:
- Task Success Rate: ≥ 95%
- Response Accuracy: ≥ 95%
- Average Latency: < 3 seconds
- Safety Compliance: 100% (zero violations)
- User Satisfaction: ≥ 4.2/5.0
- Escalation Rate: < 5% (appropriate escalations)

---

**Generated with**:
- Gold Standard Template v5.0
- Comprehensive AI Agent Setup Template v3.0
- Production-Grade Configuration Standards

**Template Compliance**: ✓ All 16 sections completed
**Regulatory Compliance**: ✓ HIPAA, PHARMA, VERIFY
**Security Audit**: ✓ Completed
**Documentation**: ✓ Comprehensive system prompt generated

---
*This system prompt is a living document and should be updated as the agent evolves.*
*Next review scheduled: 1 week from deployment.*
```

**Dynamic Elements**:
- Agent ID: Generated as `AGT-{tier}-{timestamp.base36}`
- All configuration fields: From formData
- Tool count: formData.tools.length
- Capabilities count: formData.capabilities.length with first 4 as expert-level
- Escalation rate: Tier 3 = <5%, Tier 2 = <10%, Tier 1 = <15%
- Security audit: Tier 3 = "✓ Completed", Tier 2/1 = "⚠ Required before production"
- Next review: Tier 3 = 1 week, Tier 2 = 2 weeks, Tier 1 = 1 month

---

## 🎯 Tier-Based Adaptation

The system prompt generator automatically adjusts configurations based on agent tier:

### Tier 3 (Expert) - Safety-Critical

**Characteristics**:
- Highest security and compliance requirements
- Most stringent accuracy targets (≥95%)
- Lowest rate limits (100 requests/hour)
- Most frequent reviews (weekly)
- Longest data retention (7 years)
- Most comprehensive backup (every 6 hours)
- Fastest RPO/RTO (<1hr/<2hr)
- Blue-Green deployment with validation
- Multi-agent coordination enabled
- All clinical recommendations require approval

**Use Cases**:
- Clinical trial protocol design
- Regulatory submissions
- Safety signal analysis
- High-risk medical decision support

---

### Tier 2 (Specialist) - Domain-Specific

**Characteristics**:
- Balanced security and performance
- Moderate accuracy targets (≥90%)
- Medium rate limits (200 requests/hour)
- Bi-weekly reviews
- Medium data retention (3 years)
- Daily backups
- Moderate RPO/RTO (<6hr/<4hr)
- Rolling deployment with canary
- High-risk operations require approval

**Use Cases**:
- Medical literature analysis
- Clinical data interpretation
- Specialized consultations
- Domain-specific recommendations

---

### Tier 1 (Foundational) - General Purpose

**Characteristics**:
- Optimized for high volume
- Standard accuracy targets (≥85%)
- High rate limits (500 requests/hour)
- Monthly reviews
- Short data retention (1 year)
- Daily backups
- Standard RPO/RTO (<6hr/<4hr)
- Rolling deployment with canary
- High-risk operations require approval

**Use Cases**:
- Patient education
- General information queries
- Administrative support
- Common workflow assistance

---

## 💡 Usage Guide

### How to Generate a System Prompt

1. **Navigate to Agent Creator**:
   - Go to `/agents` page
   - Click "Create Agent" button

2. **Fill Out Agent Form**:
   Complete all relevant tabs:
   - **Basic Info**: Name, description, tier, status, priority
   - **Organization**: Business function, department, role
   - **Capabilities**: Add 5-8 capabilities
   - **Reasoning**: Select architecture pattern and reasoning method
   - **Communication**: Set tone and style
   - **Mission**: Primary mission and value proposition
   - **Medical Compliance** (optional): Specialty, FDA class, protocols
   - **Safety** (optional): Add prohibitions, protections, thresholds
   - **Knowledge**: Add knowledge domains
   - **Tools**: Assign tools from registry
   - **Prompt Starters**: Add 4-6 example prompts

3. **Generate System Prompt**:
   - Go to **Safety** tab
   - Click "Generate" button under "Template-Based Generation"
   - Wait < 100ms for instant generation

4. **Review & Refine**:
   - Switch to **Basic Info** tab (auto-switched)
   - Review generated system prompt in textarea
   - Make manual edits if needed

5. **Save Agent**:
   - Click "Create Agent" button
   - Agent saved with complete system prompt

---

## 🔍 Example Scenarios

### Scenario 1: Tier 3 Clinical Trial Protocol Designer

**Input Configuration**:
```
Name: Clinical Trial Protocol Designer
Tier: 3
Medical Specialty: Oncology
Capabilities: [
  "Phase II-IV protocol design",
  "FDA/ICH-GCP compliance validation",
  "Statistical analysis plan development",
  "Endpoint selection and justification"
]
Architecture: DELIBERATIVE
Reasoning: COT
Protocols: HIPAA, PHARMA, VERIFY
FDA SaMD: Class II
Tools: [Clinical Guidelines Database, Statistical Calculator]
```

**Generated Output**:
- 16 comprehensive sections
- Expert-level language and complexity
- Strictest safety and compliance controls
- Blue-Green deployment strategy
- Weekly review schedule
- 100 requests/hour rate limit
- All clinical recommendations require approval
- Multi-agent coordination enabled

**Prompt Length**: ~1,800 lines

---

### Scenario 2: Tier 1 Patient Education Assistant

**Input Configuration**:
```
Name: Patient Education Assistant
Tier: 1
Capabilities: [
  "Patient education materials",
  "Treatment information",
  "Medication explanations"
]
Architecture: REACTIVE
Reasoning: DIRECT
Protocols: HIPAA
Tools: [Knowledge Base Search]
```

**Generated Output**:
- 14 sections (no multi-agent coordination, fewer tools/capabilities)
- Accessible, foundational language
- Standard compliance controls
- Rolling deployment with canary
- Monthly review schedule
- 500 requests/hour rate limit
- High-risk operations require approval

**Prompt Length**: ~1,200 lines

---

## 📊 Quality Assurance

### Validation Checks

The generator includes automatic validation:

1. **Required Fields**:
   - Agent name (used in role definition)
   - Tier (affects all tier-based configurations)
   - Architecture pattern (used throughout)

2. **Default Values**:
   - Missing mission → Generated from agent name
   - Missing reasoning method → Defaults to "COT"
   - Missing thresholds → Uses industry-standard defaults

3. **Conditional Sections**:
   - Multi-agent coordination: Only Tier 3
   - Tool registry: Only if tools exist
   - Capabilities matrix: Only if capabilities exist
   - Use cases: Only if prompt starters exist

4. **Tier Consistency**:
   - All tier-based values align (rate limits, review schedules, etc.)
   - Accuracy targets appropriate for tier level
   - Security requirements match tier criticality

---

## 🚀 Performance Characteristics

### Generation Speed

- **Template-Based**: < 100ms (instant)
- **No API Calls**: Zero network latency
- **Pure JavaScript**: Client-side generation
- **Deterministic**: Same input = same output

### Cost

- **Template-Based**: $0.00 (completely free)
- **No Token Usage**: No LLM API consumption
- **Unlimited Generations**: No usage limits

### Output Quality

- **Comprehensive**: 16 sections, 1,200-2,000 lines
- **Structured**: Consistent markdown formatting
- **Production-Ready**: Includes all operational details
- **Auditable**: Full traceability of configuration sources

---

## 🔧 Technical Implementation

### Code Location

**File**: `src/features/chat/components/agent-creator.tsx`

**Function**: `generateCompleteSystemPrompt()`

**Lines**: ~1544-2244 (~700 lines of code)

### Key Technologies

- **React State**: Uses `formData` state for all inputs
- **TypeScript**: Fully typed with form data interfaces
- **Template Literals**: Multi-line string building
- **Conditional Logic**: Tier-based and field-based rendering
- **Array Methods**: Iteration for tools, capabilities, prompt starters

### Data Flow

```
formData (React state)
    ↓
generateCompleteSystemPrompt()
    ↓
16 Section Builders (template strings)
    ↓
Combined Prompt String
    ↓
setFormData({ systemPrompt: prompt })
    ↓
Basic Info Tab (textarea display)
    ↓
Save to Database
```

### Extension Points

To add new sections or modify existing ones:

1. Locate the section in `generateCompleteSystemPrompt()`
2. Modify template string with desired changes
3. Add/remove dynamic elements using `formData.*`
4. Update section count in success message
5. Test with various tier levels and configurations

---

## 📋 Best Practices

### For Agent Creators

1. **Complete All Relevant Fields**:
   - More input data = richer system prompts
   - Every field contributes to the final output

2. **Choose Appropriate Tier**:
   - Tier 3: Safety-critical, high-stakes decisions
   - Tier 2: Specialized domain knowledge
   - Tier 1: General purpose, high volume

3. **Add Comprehensive Capabilities**:
   - First 4 become "expert-level" in capabilities matrix
   - Remaining become "competent-level"
   - Aim for 5-8 total capabilities

4. **Define Clear Mission & Value**:
   - Primary mission: What the agent does
   - Value proposition: Why it matters
   - These appear prominently in the prompt

5. **Configure Safety Properly**:
   - Add specific prohibitions for your domain
   - Define mandatory protections
   - Set appropriate confidence thresholds

6. **Use Prompt Starters**:
   - Generates detailed use case section
   - Helps document expected interactions
   - Useful for user training

### For Administrators

1. **Review Generated Prompts**:
   - Even template-based prompts should be reviewed
   - Check for domain-specific accuracy
   - Validate regulatory compliance

2. **Establish Baseline Configurations**:
   - Create templates for common agent types
   - Standardize tier assignments
   - Document best practices

3. **Monitor Performance**:
   - Track which sections are most useful
   - Gather user feedback on prompt quality
   - Iterate on template improvements

4. **Maintain Compliance**:
   - Audit prompts for regulatory adherence
   - Update templates as regulations change
   - Version control system prompts

---

## 🐛 Troubleshooting

### Issue: Generated prompt is too short

**Cause**: Missing optional form fields
**Solution**: Fill out more tabs (tools, capabilities, prompt starters, safety)

---

### Issue: Tier-specific values seem wrong

**Cause**: Tier selection doesn't match agent complexity
**Solution**: Re-evaluate tier assignment based on use case criticality

---

### Issue: Multi-agent coordination not appearing

**Cause**: Only Tier 3 agents get this section
**Solution**: Change tier to 3 if multi-agent needed, or accept omission for Tier 1/2

---

### Issue: Tools/capabilities sections missing

**Cause**: No tools or capabilities added to agent
**Solution**: Add tools and capabilities in respective tabs before generating

---

### Issue: Regulatory protocols not showing

**Cause**: Medical compliance tab not filled out
**Solution**: Enable and configure HIPAA/PHARMA/VERIFY in Medical Compliance tab

---

## 📈 Metrics & KPIs

### Usage Metrics

Track these metrics to evaluate effectiveness:

- **Generation Rate**: Prompts generated per day/week/month
- **Tier Distribution**: % of prompts by tier (aim for pyramid: mostly Tier 1, few Tier 3)
- **Completion Rate**: % of agents with generated prompts vs. manual
- **Average Prompt Length**: Should be 1,200-2,000 lines depending on tier
- **Section Coverage**: How many of 16 sections are populated on average

### Quality Metrics

Measure prompt quality with:

- **Review Pass Rate**: % of prompts approved without modifications
- **Compliance Score**: % of prompts meeting regulatory requirements
- **User Satisfaction**: Agent creator feedback on prompt usefulness
- **Production Readiness**: % of prompts deployed without additional editing
- **Incident Rate**: Issues traced back to prompt deficiencies

---

## 🔮 Future Enhancements

### Planned Features

- [ ] **Custom Section Templates**: Allow teams to define custom sections
- [ ] **Version Comparison**: Diff tool to compare prompt versions
- [ ] **Prompt Library**: Save and reuse successful prompt patterns
- [ ] **Export Formats**: PDF, Word, JSON exports of prompts
- [ ] **Collaborative Editing**: Multi-user prompt refinement
- [ ] **AI Enhancement Option**: Hybrid template + AI optimization
- [ ] **Regulatory Validation**: Automated compliance checking
- [ ] **Performance Prediction**: Estimate metrics based on prompt configuration

### Potential Improvements

- Multi-language prompt generation
- Industry-specific templates (pharma, biotech, medical devices)
- Automated testing framework for prompts
- Integration with deployment pipelines
- Real-time prompt preview as form is filled
- Prompt analytics dashboard

---

## 📞 Support & Resources

### Documentation

- **System Prompt Generation Guide**: `/docs/SYSTEM_PROMPT_GENERATION.md`
- **Setup Instructions**: `/docs/SYSTEM_PROMPT_SETUP.md`
- **Persona Designer Guide**: `/docs/PERSONA_BASED_AGENT_DESIGNER.md`
- **Implementation Summary**: `/docs/IMPLEMENTATION_SUMMARY.md`

### Code References

- **Main Component**: `src/features/chat/components/agent-creator.tsx:1544-2244`
- **Gold Standard Template**: `ai_agent_prompt_enhanced.md`

### External Resources

- OpenAI API Documentation: https://platform.openai.com/docs
- Next.js Documentation: https://nextjs.org/docs
- React TypeScript Patterns: https://react-typescript-cheatsheet.netlify.app

### Getting Help

For questions or issues:
- Technical: Review code comments in `agent-creator.tsx`
- Product: Refer to implementation summary docs
- Bugs: Check console logs for generation errors

---

## ✅ Changelog

### Version 2.0 - October 2025

**Added**:
- 6 new sections (11-16) from Comprehensive AI Agent Setup Template v3.0
- Security & governance specifications
- Deployment & operations guidelines
- Detailed tool registry with per-tool configurations
- Detailed capabilities matrix with proficiency levels
- Implementation & deployment checklists (23 items)
- Example use cases based on prompt starters
- Enhanced metadata section with version control

**Enhanced**:
- Tier-based adaptation for all new sections
- Dynamic rate limiting (100-500 requests/hour)
- Data retention policies (1-7 years)
- Backup schedules (daily to continuous)
- RPO/RTO targets (1-6 hours)
- Review schedules (weekly to monthly)

**Changed**:
- Success message now lists all 16 sections
- Template compliance badge shows both templates
- Metadata section reorganized with three subsections

### Version 1.0 - October 2025

**Initial Release**:
- 10 core sections from Gold Standard Template v5.0
- Chain of Thought (CoT) protocol
- ReAct framework implementation
- Safety & compliance framework
- Performance monitoring
- Continuous improvement
- Template-based generation (< 100ms, $0 cost)

---

**Version**: 2.0
**Last Updated**: October 2025
**Author**: Claude Code Assistant
**License**: Internal Use Only

---

*This documentation is a living document and will be updated as the system evolves.*
