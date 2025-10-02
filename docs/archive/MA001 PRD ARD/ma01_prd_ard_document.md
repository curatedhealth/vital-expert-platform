# MA01: Emerging Scientific Trends Detection
## Product Requirements Document (PRD) & Architecture Requirements Document (ARD)

---

## 1. Executive Summary

This document defines the technical architecture and requirements for MA01: Emerging Scientific Trends & Unmet Needs Detection system, incorporating RAG (Retrieval-Augmented Generation), multi-agent orchestration, and pharmaceutical-specific compliance frameworks.

---

## 2. Core Architecture Components

### 2.1 RAG (Retrieval-Augmented Generation) System

```yaml
rag_architecture:
  knowledge_base:
    name: "PharmaKnowledge RAG"
    type: "Hybrid RAG with Temporal Awareness"
    
  components:
    document_store:
      primary: "Weaviate Vector Database"
      capacity: "10M+ documents"
      embedding_model: "text-embedding-3-large"
      dimensions: 3072
      
    chunking_strategy:
      method: "Semantic chunking with overlap"
      chunk_size: 512 tokens
      overlap: 128 tokens
      metadata_preserved:
        - source_id
        - publication_date
        - authors
        - journal
        - doi
        - confidence_score
        - validation_status
        
    retrieval_pipeline:
      stage_1_retrieval:
        method: "Hybrid search"
        components:
          - dense_retrieval: "KNN with cosine similarity"
          - sparse_retrieval: "BM25"
          - graph_retrieval: "Knowledge graph traversal"
        fusion: "Reciprocal Rank Fusion (RRF)"
        
      stage_2_reranking:
        model: "cross-encoder/ms-marco-MiniLM-L-12-v2"
        top_k: 20
        
      stage_3_filtering:
        temporal_relevance: "Exponential decay by age"
        source_authority: "Impact factor weighting"
        verification_status: "VERIFY protocol compliance"
        
    generation_pipeline:
      context_assembly:
        max_context: 32000 tokens
        prioritization:
          - exact_matches
          - high_confidence_sources
          - recent_publications
          - peer_reviewed
          
      response_generation:
        model: "claude-3-opus"
        temperature: 0.3
        system_prompt: "PHARMA_COMPLIANT_GENERATION"
        
    chat_interface:
      session_management:
        context_window: "Last 10 interactions"
        memory_type: "Episodic + Semantic"
        
      capabilities:
        - factual_qa: "Answer questions from knowledge base"
        - comparative_analysis: "Compare trends across time"
        - hypothesis_generation: "Suggest research directions"
        - report_compilation: "Generate retrospective reports"
```

### 2.2 Source Database Architecture

```yaml
source_database:
  schema:
    sources_table:
      source_id: "UUID PRIMARY KEY"
      source_type: "ENUM('journal', 'trial', 'patent', 'conference', 'preprint', 'rwe')"
      source_name: "VARCHAR(500)"
      authority_score: "FLOAT (0-1)"
      access_method: "ENUM('api', 'scrape', 'manual', 'subscription')"
      
    source_metadata:
      source_id: "FK sources_table"
      impact_factor: "FLOAT"
      h_index: "INTEGER"
      country: "VARCHAR(100)"
      language: "VARCHAR(50)"
      update_frequency: "INTERVAL"
      
    source_credentials:
      source_id: "FK sources_table"
      api_endpoint: "VARCHAR(500) ENCRYPTED"
      api_key: "VARCHAR(500) ENCRYPTED"
      rate_limit: "INTEGER"
      quota_remaining: "INTEGER"
      
    source_quality_metrics:
      source_id: "FK sources_table"
      accuracy_score: "FLOAT"
      completeness_score: "FLOAT"
      timeliness_score: "FLOAT"
      relevance_score: "FLOAT"
      last_audit: "TIMESTAMP"
      
  configured_sources:
    tier_1_primary:
      - name: "PubMed Central"
        type: "journal"
        api: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
        update_frequency: "2 hours"
        authority_score: 0.95
        
      - name: "ClinicalTrials.gov"
        type: "trial"
        api: "https://clinicaltrials.gov/api/"
        update_frequency: "daily"
        authority_score: 0.98
        
      - name: "EMA Clinical Data"
        type: "regulatory"
        api: "https://clinicaldata.ema.europa.eu/api/"
        update_frequency: "weekly"
        authority_score: 1.0
        
    tier_2_supplementary:
      - name: "bioRxiv"
        type: "preprint"
        api: "https://api.biorxiv.org/"
        update_frequency: "daily"
        authority_score: 0.70
        
      - name: "Patent Databases"
        type: "patent"
        apis:
          - "USPTO"
          - "EPO"
          - "WIPO"
        update_frequency: "weekly"
        authority_score: 0.85
```

---

## 3. Multi-Agent System Architecture

### 3.1 Agent Definitions and Prompts

```python
agents = {
    "orchestrator_agent": {
        "model": "claude-3-opus",
        "role": "Master Coordinator with PHARMA Framework",
        "temperature": 0.3,
        "max_tokens": 4096,
        
        "system_prompt": """
You are the Master Orchestrator for pharmaceutical intelligence gathering, operating under the PHARMA framework.

PHARMA FRAMEWORK REQUIREMENTS:
P - PURPOSE: Every analysis must align with clear pharmaceutical business objectives:
  • R&D portfolio decisions
  • Competitive intelligence
  • Market opportunity identification
  • Risk mitigation strategies

H - HYPOTHESES: For each signal detected, formulate testable hypotheses:
  • Primary hypothesis about the trend
  • Alternative explanations
  • Required evidence to validate/invalidate

A - AUDIENCE: Tailor all outputs for specific stakeholders:
  • C-Suite: Strategic implications and ROI
  • R&D: Technical feasibility and innovation potential
  • Medical Affairs: Clinical relevance and KOL perspectives
  • Regulatory: Compliance implications and pathway considerations

R - REQUIREMENTS: Ensure all outputs meet:
  • FDA/EMA regulatory standards
  • GxP compliance where applicable
  • Data privacy regulations (HIPAA, GDPR)
  • Company SOPs for medical information

M - METRICS: Define success criteria for each insight:
  • Quantifiable impact measures
  • Timeline for validation
  • ROI projections where applicable

A - ACTIONS: Every output must enable clear next steps:
  • Specific recommendations with owners
  • Resource requirements
  • Risk-benefit analysis
  • Go/no-go decision criteria

ORCHESTRATION RESPONSIBILITIES:
1. Decompose incoming queries into specialized tasks
2. Route tasks to appropriate specialist agents
3. Synthesize multi-agent outputs ensuring PHARMA compliance
4. Trigger VERIFY protocol for all factual claims
5. Escalate to human experts when confidence <0.8

CONTEXT:
- Therapeutic Areas: {therapeutic_areas}
- Regulatory Jurisdictions: {jurisdictions}
- Competitive Landscape: {competitors}
- Current Pipeline: {pipeline_stage}

For each query:
1. First, identify the PURPOSE and AUDIENCE
2. Decompose into agent-specific tasks
3. Apply VERIFY protocol to all gathered information
4. Synthesize according to PHARMA framework
5. Generate action-oriented outputs
""",
        
        "task_prompt_template": """
Query: {user_query}
Therapeutic Context: {therapeutic_area}
Business Context: {business_objective}

Please orchestrate the following:
1. Identify which specialist agents are needed
2. Define specific tasks for each agent
3. Set validation requirements using VERIFY protocol
4. Specify synthesis approach for final output
5. Define success metrics per PHARMA framework

Output structured JSON with agent_tasks and validation_criteria.
"""
    },
    
    "literature_analysis_agent": {
        "model": "gpt-4-turbo",
        "role": "Scientific Literature Specialist with VERIFY Protocol",
        "temperature": 0.2,
        "max_tokens": 8192,
        
        "system_prompt": """
You are a Scientific Literature Analysis Expert operating under the VERIFY protocol for pharmaceutical intelligence.

VERIFY PROTOCOL IMPLEMENTATION:
V - VALIDATE sources before acceptance:
  • Check journal impact factor (threshold: >3.0)
  • Verify author credentials and affiliations
  • Confirm publication is peer-reviewed
  • Check for retractions or corrections

E - EVIDENCE must be explicitly cited:
  • Every claim requires [PMID:12345678] format citation
  • Include page numbers for specific quotes
  • Note confidence level for each citation
  • Distinguish primary vs secondary sources

R - REQUEST confidence levels for all claims:
  • High (>90%): Multiple independent sources confirm
  • Medium (70-90%): Single high-quality source or multiple lower-quality
  • Low (<70%): Limited evidence, requires further validation
  • Flag all low-confidence findings for human review

I - IDENTIFY gaps rather than fill with assumptions:
  • Explicitly state "No data found for..." when applicable
  • List search parameters that yielded no results
  • Suggest alternative search strategies
  • Never interpolate or extrapolate without marking as speculation

F - FACT-CHECK against multiple sources:
  • Minimum 2 independent sources for key claims
  • Cross-reference with clinical trial data when available
  • Verify against regulatory databases
  • Check for contradictory evidence

Y - YIELD to human expertise on ambiguous points:
  • Flag complex interpretations for expert review
  • Mark statistical analyses requiring biostatistician validation
  • Highlight regulatory ambiguities for legal review
  • Queue clinical relevance questions for medical experts

ANALYSIS FRAMEWORK:
1. Temporal Analysis:
   - Track publication velocity over time
   - Identify acceleration/deceleration patterns
   - Note seasonal or conference-driven spikes

2. Network Analysis:
   - Map author collaboration networks
   - Identify institutional clusters
   - Track funding sources and conflicts of interest

3. Content Analysis:
   - Extract key findings with confidence scores
   - Identify methodological strengths/limitations
   - Assess clinical relevance and applicability

4. Quality Assessment:
   - Study design quality (RCT > cohort > case series)
   - Sample size and statistical power
   - External validity and generalizability

For each literature search:
- Return maximum 20 most relevant papers
- Provide structured evidence table
- Include quality scores and confidence levels
- Highlight gaps and contradictions
""",
        
        "task_prompt_template": """
Search Parameters:
- Keywords: {keywords}
- Date Range: {date_range}
- Inclusion Criteria: {inclusion}
- Exclusion Criteria: {exclusion}
- Databases: {databases}

Analysis Required:
1. Retrieve relevant literature
2. Apply VERIFY protocol validation
3. Extract key findings with confidence scores
4. Identify trends and patterns
5. Highlight evidence gaps
6. Flag items for expert review

Return structured JSON with:
- validated_sources[]
- key_findings[]
- confidence_scores{}
- evidence_gaps[]
- expert_review_queue[]
"""
    },
    
    "clinical_trials_agent": {
        "model": "claude-3-sonnet",
        "role": "Clinical Development Intelligence",
        "temperature": 0.2,
        
        "system_prompt": """
You are a Clinical Trials Intelligence Specialist focusing on trial landscape analysis.

RESPONSIBILITIES:
1. Monitor trial registrations and updates
2. Analyze trial designs and endpoints
3. Track enrollment and completion rates
4. Identify competitive trial strategies
5. Assess regulatory implications

VERIFY PROTOCOL for Clinical Trials:
- Validate registration numbers against official databases
- Cross-check sponsor information
- Verify endpoint definitions against regulatory guidance
- Confirm site locations and principal investigators
- Check for protocol amendments and safety reports

ANALYSIS OUTPUTS:
- Trial velocity by indication
- Endpoint evolution over time
- Competitive trial strategies
- Enrollment feasibility assessments
- Regulatory pathway implications

Always cite specific NCT numbers and registration dates.
Never speculate on unpublished results.
Flag terminated trials with reason analysis.
""",
        
        "task_prompt_template": """
Analyze trials for:
- Indication: {indication}
- Intervention Type: {intervention}
- Phase: {phase}
- Geography: {geography}
- Timeframe: {timeframe}

Required Analysis:
1. Trial landscape overview
2. Endpoint trends
3. Competitive activity
4. Enrollment patterns
5. Success/failure patterns

Return structured data with NCT numbers and confidence scores.
"""
    },
    
    "signal_detection_agent": {
        "model": "custom-ensemble-model",
        "role": "Weak Signal Detection and Validation",
        
        "system_prompt": """
You are a Signal Detection Specialist using advanced pattern recognition.

SIGNAL DETECTION FRAMEWORK:
1. Velocity Signals:
   - Publication rate changes >30% MoM
   - Citation acceleration patterns
   - Social media momentum shifts

2. Network Signals:
   - New collaboration clusters
   - Geographic expansion patterns
   - Funding flow redirections

3. Semantic Signals:
   - Novel concept combinations
   - Terminology evolution
   - Hypothesis shifts

4. Competitive Signals:
   - Patent filing patterns
   - Clinical trial pivots
   - Partnership formations

SCORING METHODOLOGY:
- Base Score = (Velocity × 0.3) + (Network × 0.2) + (Semantic × 0.3) + (Competitive × 0.2)
- Confidence Adjustment = Base Score × Source Authority × Temporal Relevance
- Final Score = 0.0 to 1.0 scale

VALIDATION REQUIREMENTS:
- Score >0.7: Automatic validation trigger
- Score 0.5-0.7: Add to watch list
- Score <0.5: Archive for pattern learning

Output includes:
- Signal strength (0-1)
- Confidence level (%)
- Supporting evidence count
- Contradictory evidence count
- Time to mainstream projection
"""
    },
    
    "insight_synthesis_agent": {
        "model": "claude-3-opus",
        "role": "Strategic Insight Generation with PHARMA Compliance",
        
        "system_prompt": """
You are the Strategic Insight Synthesizer, creating actionable intelligence from validated signals.

SYNTHESIS FRAMEWORK aligned with PHARMA:

PURPOSE-DRIVEN SYNTHESIS:
- Every insight must link to strategic objectives
- Quantify business impact where possible
- Prioritize by potential value creation

HYPOTHESIS FORMULATION:
- Generate 3 testable hypotheses per major trend
- Include validation criteria
- Specify required evidence
- Set timeline for testing

AUDIENCE-SPECIFIC OUTPUTS:
For C-Suite:
- Executive summary (max 500 words)
- Strategic implications
- Investment requirements
- Risk-opportunity matrix

For R&D:
- Technical feasibility assessment
- Resource requirements
- Timeline projections
- Success probability

For Medical Affairs:
- KOL engagement opportunities
- Medical education implications
- Publication strategy recommendations

REQUIREMENTS COMPLIANCE:
- All outputs include regulatory considerations
- Data privacy compliance verified
- IP landscape assessed
- Ethical considerations addressed

METRICS DEFINITION:
- Lead indicators for trend validation
- Lag indicators for impact measurement
- Success criteria clearly defined
- ROI projections with assumptions

ACTION ENABLEMENT:
- Specific next steps with owners
- Decision trees for different scenarios
- Resource allocation recommendations
- Go/no-go criteria specified

Never present insights without:
1. Confidence scores
2. Evidence citations
3. Assumptions stated
4. Alternative interpretations
5. Risk factors identified
"""
    },
    
    "rwe_analysis_agent": {
        "model": "med-palm-2",
        "role": "Real-World Evidence Specialist",
        
        "system_prompt": """
You are a Real-World Evidence Analyst specializing in healthcare data analysis.

RWE ANALYSIS FRAMEWORK:
1. Data Source Validation:
   - Verify data provenance
   - Assess population representativeness
   - Check for selection bias
   - Evaluate data completeness

2. Outcomes Analysis:
   - Treatment patterns
   - Safety signals
   - Effectiveness measures
   - Healthcare utilization

3. Compliance Requirements:
   - HIPAA compliance verification
   - De-identification confirmation
   - Appropriate use validation
   - Audit trail maintenance

VERIFY Protocol for RWE:
- Validate data sources are approved
- Evidence linkage explicitly documented
- Request statistical review for complex analyses
- Identify confounders and limitations
- Fact-check against clinical trial data
- Yield to epidemiologist for study design

Output Requirements:
- Patient population characteristics
- Outcome measures with confidence intervals
- Limitations and biases identified
- Regulatory acceptability assessment
"""
    }
}
```

---

## 4. User Configuration Interface

### 4.1 Job Configuration Schema

```yaml
job_configuration:
  metadata:
    job_id: "UUID"
    job_name: "User-defined name"
    created_by: "User ID"
    created_date: "ISO 8601"
    last_modified: "ISO 8601"
    version: "Semantic versioning"
    
  scope_definition:
    therapeutic_areas:
      primary:
        - area: "Oncology"
          sub_areas: ["CAR-T", "Checkpoint Inhibitors", "ADCs"]
          excluded: ["Radiation therapy"]
      secondary:
        - area: "Rare Diseases"
          sub_areas: ["Gene Therapy", "Enzyme Replacement"]
          
    geographic_focus:
      included: ["US", "EU5", "Japan", "China"]
      excluded: ["Russia", "India"]
      
    time_horizon:
      retrospective_window: "24 months"
      prospective_monitoring: "ongoing"
      update_frequency: "daily"
      
  search_configuration:
    keywords:
      primary_terms:
        - term: "CAR-T"
          synonyms: ["Chimeric Antigen Receptor", "CART"]
          weight: 1.0
          
      negative_terms:
        - term: "veterinary"
          action: "exclude"
          
      boolean_logic: "(CAR-T OR CART) AND (solid tumor*) NOT veterinary"
      
    sources:
      enabled_sources:
        - source_id: "pubmed"
          custom_filters:
            publication_types: ["Clinical Trial", "RCT"]
            languages: ["English", "Japanese"]
            date_range: "2020-01-01 TO present"
            
      custom_sources:
        - name: "Internal Research DB"
          type: "database"
          connection_string: "${ENCRYPTED_CONNECTION}"
          query_template: "SELECT * FROM research WHERE {conditions}"
          
      source_weights:
        peer_reviewed: 1.0
        preprint: 0.7
        conference: 0.6
        social_media: 0.3
        
  agent_configuration:
    agent_overrides:
      literature_agent:
        model: "gpt-4-turbo"  # or "claude-3-opus"
        temperature: 0.2  # 0.1-1.0
        max_tokens: 8192
        custom_instructions: "Focus on translational research"
        
      signal_detection:
        sensitivity_threshold: 0.6  # 0.0-1.0
        minimum_evidence_count: 3
        time_decay_factor: 0.95
        
    agent_enablement:
      enabled: ["literature", "trials", "signal", "synthesis"]
      disabled: ["social_media", "patent"]
      
    custom_agents:
      - name: "Regulatory Intelligence"
        model: "custom-fine-tuned"
        endpoint: "https://api.company.com/regulatory"
        prompt_template: "custom_regulatory_prompt.txt"
        
  validation_rules:
    pharma_compliance:
      enable_pharma_framework: true
      purpose_categories: ["R&D", "Commercial", "Medical Affairs"]
      hypothesis_requirement: "mandatory"
      audience_types: ["C-Suite", "Technical", "Regulatory"]
      
    verify_protocol:
      minimum_sources: 2
      authority_threshold: 0.7
      confidence_requirement: "explicit"
      gap_reporting: "mandatory"
      expert_review_triggers:
        - "confidence < 0.7"
        - "conflicting_evidence"
        - "safety_signal"
        
  output_configuration:
    report_templates:
      - template_id: "executive_brief"
        format: "PDF"
        sections: ["summary", "key_findings", "recommendations"]
        max_length: 5000
        
      - template_id: "technical_deep_dive"
        format: "HTML"
        include_raw_data: true
        include_visualizations: true
        
    delivery_channels:
      - channel: "email"
        recipients: ["team@company.com"]
        frequency: "weekly"
        
      - channel: "slack"
        webhook: "${SLACK_WEBHOOK}"
        alert_level: "critical_only"
        
      - channel: "dashboard"
        auto_refresh: true
        refresh_interval: "1 hour"
        
  monitoring_configuration:
    alerting_rules:
      - name: "High Impact Signal"
        condition: "signal_score > 0.9"
        action: "immediate_notification"
        recipients: ["medical.director@company.com"]
        
      - name: "Competitive Activity"
        condition: "competitor_mentioned AND trial_phase >= 2"
        action: "daily_digest"
        
    performance_monitoring:
      track_metrics:
        - "signals_detected_count"
        - "validation_accuracy"
        - "time_to_insight"
        - "false_positive_rate"
        
      sla_requirements:
        signal_detection_time: "<24 hours"
        validation_completion: "<48 hours"
        report_generation: "<1 hour"
```

### 4.2 User Configuration Interface

```typescript
interface JobConfiguration {
  // Basic Settings
  basicSettings: {
    jobName: string;
    description: string;
    therapeuticAreas: TherapeuticArea[];
    businessObjective: BusinessObjective;
    updateFrequency: UpdateFrequency;
  };

  // Search Configuration
  searchConfig: {
    keywords: Keyword[];
    booleanQuery: string;
    dateRange: DateRange;
    sources: DataSource[];
    excludedSources: string[];
  };

  // Agent Settings
  agentSettings: {
    enabledAgents: AgentType[];
    agentOverrides: Map<AgentType, AgentConfig>;
    customAgents: CustomAgent[];
  };

  // Validation Rules
  validationRules: {
    pharmaFramework: PharmaConfig;
    verifyProtocol: VerifyConfig;
    confidenceThresholds: Map<string, number>;
  };

  // Output Settings
  outputSettings: {
    reportFormats: ReportFormat[];
    deliveryChannels: DeliveryChannel[];
    exportFormats: ExportFormat[];
  };

  // Monitoring
  monitoring: {
    alerts: AlertRule[];
    metrics: Metric[];
    slaTargets: SLATarget[];
  };
}
```

---

## 5. Execution Monitoring System

### 5.1 Job Execution Dashboard

```yaml
execution_monitoring:
  real_time_dashboard:
    status_indicators:
      overall_health:
        - status: "ENUM(healthy, degraded, critical)"
        - uptime: "99.95%"
        - active_jobs: 12
        - queued_jobs: 3
        
    job_status_view:
      columns:
        - job_id: "UUID"
        - job_name: "String"
        - status: "ENUM(running, paused, completed, failed)"
        - progress: "Percentage"
        - started: "Timestamp"
        - eta: "Timestamp"
        - alerts: "Count"
        
    execution_timeline:
      visualization: "Gantt chart"
      shows:
        - data_ingestion_phase
        - agent_processing_phase
        - validation_phase
        - synthesis_phase
        - delivery_phase
        
  detailed_job_view:
    execution_stages:
      stage_1_data_collection:
        status: "completed"
        duration: "45 minutes"
        records_processed: 1847
        errors: 0
        sources_queried:
          - PubMed: "500 papers retrieved"
          - ClinicalTrials: "47 trials found"
          - Patents: "12 relevant patents"
          
      stage_2_agent_processing:
        status: "in_progress"
        progress: "67%"
        active_agents:
          - literature_agent: "Analyzing 500 papers"
          - signal_detection: "Computing scores"
          - trials_agent: "Extracting endpoints"
          
      stage_3_validation:
        status: "pending"
        estimated_start: "14:30 UTC"
        validation_queue: 23
        expert_reviewers_assigned: 2
        
  performance_metrics:
    latency_tracking:
      - ingestion_latency: "p50: 100ms, p95: 500ms, p99: 2s"
      - processing_latency: "p50: 2s, p95: 10s, p99: 30s"
      - end_to_end: "p50: 5min, p95: 15min, p99: 30min"
      
    quality_metrics:
      - signal_detection_precision: "0.87"
      - signal_detection_recall: "0.92"
      - false_positive_rate: "0.08"
      - expert_agreement_rate: "0.84"
      
    resource_utilization:
      - cpu_usage: "45%"
      - memory_usage: "8.2GB / 16GB"
      - api_quota_remaining:
          PubMed: "8,543 / 10,000"
          GPT4: "892,341 / 1,000,000 tokens"
          Claude: "445,123 / 500,000 tokens"
          
  alert_management:
    active_alerts:
      - alert_id: "ALT-001"
        severity: "HIGH"
        type: "Data Quality"
        message: "PubMed API returning incomplete results"
        triggered: "2025-09-18T14:23:00Z"
        action_required: "Review and potentially re-run"
        
    alert_history:
      retention: "90 days"
      categories:
        - data_quality_alerts
        - performance_alerts
        - compliance_alerts
        - system_health_alerts
        
  audit_log:
    tracked_events:
      - job_created
      - configuration_changed
      - manual_override
      - expert_validation
      - report_generated
      - data_exported
      
    log_format:
      timestamp: "ISO 8601"
      user_id: "UUID"
      action: "String"
      details: "JSON"
      ip_address: "String"
      session_id: "UUID"
```

---

## 6. Logic Flow Diagrams

### 6.1 Main RAG Pipeline Logic Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     RAG PIPELINE EXECUTION FLOW                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │   User Query Input    │
                        │  "What are emerging   │
                        │   CAR-T trends?"      │
                        └───────────┬───────────┘
                                    │
                        ┌───────────▼───────────┐
                        │   Query Analysis      │
                        │ • Intent Classification│
                        │ • Entity Extraction   │
                        │ • Temporal Context    │
                        └───────────┬───────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼
        ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
        │Dense Retrieval│   │Sparse Search │   │Graph Traversal│
        │  (Embeddings) │   │   (BM25)     │   │   (Neo4j)     │
        └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
                │                   │                   │
                └───────────────────┼───────────────────┘
                                    ▼
                        ┌───────────────────────┐
                        │  Reciprocal Rank     │
                        │  Fusion (RRF)        │
                        │  Score = Σ(1/(k+r))  │
                        └───────────┬───────────┘
                                    │
                        ┌───────────▼───────────┐
                        │  Cross-Encoder       │
                        │  Reranking           │
                        │  Top 20 Documents    │
                        └───────────┬───────────┘
                                    │
                        ┌───────────▼───────────┐
                        │  VERIFY Protocol     │
                        ├───────────────────────┤
                        │ ✓ Source Validation  │
                        │ ✓ Authority Check    │
                        │ ✓ Recency Filter     │
                        │ ✓ Confidence Score   │
                        └───────────┬───────────┘
                                    │
                            ┌───────┴───────┐
                            │  Confidence?  │
                            └───────┬───────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼                               ▼
            ┌──────────────┐               ┌──────────────┐
            │  High (>0.8) │               │  Low (<0.8)  │
            │  Auto Process│               │ Human Review │
            └──────┬───────┘               └──────┬───────┘
                   │                               │
                   └───────────┬───────────────────┘
                               ▼
                    ┌───────────────────────┐
                    │  Context Assembly     │
                    │  Max: 32K tokens      │
                    │  Prioritize by:       │
                    │  • Relevance          │
                    │  • Authority          │
                    │  • Recency            │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │  PHARMA Framework     │
                    │  Response Generation  │
                    ├───────────────────────┤
                    │ P: Purpose aligned    │
                    │ H: Hypotheses formed  │
                    │ A: Audience targeted  │
                    │ R: Requirements met   │
                    │ M: Metrics defined    │
                    │ A: Actions specified  │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Response with:       │
                    │  • Citations          │
                    │  • Confidence Scores  │
                    │  • Evidence Gaps      │
                    │  • Next Actions       │
                    └───────────────────────┘
```

### 6.2 Agent Orchestration Logic Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MULTI-AGENT ORCHESTRATION LOGIC                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                        ┌───────────▼───────────┐
                        │  Orchestrator Agent   │
                        │  Receives User Query  │
                        └───────────┬───────────┘
                                    │
                        ┌───────────▼───────────┐
                        │  Task Decomposition   │
                        ├───────────────────────┤
                        │ If query contains:    │
                        │ • "trends" → Signal   │
                        │ • "papers" → Literature│
                        │ • "trials" → Clinical │
                        │ • "safety" → RWE     │
                        └───────────┬───────────┘
                                    │
                ┌───────────────────┼───────────────────────┐
                ▼                   ▼                       ▼
    ┌────────────────────┐ ┌────────────────┐ ┌────────────────┐
    │ PARALLEL EXECUTION │ │ SEQUENTIAL     │ │ CONDITIONAL    │
    │                    │ │ EXECUTION      │ │ EXECUTION      │
    ├────────────────────┤ ├────────────────┤ ├────────────────┤
    │ Literature + Trials│ │ Signal → Valid │ │ If confidence  │
    │ Can run together   │ │ Must complete  │ │ low → Expert   │
    └────────┬───────────┘ └───────┬────────┘ └───────┬────────┘
             │                      │                    │
             ▼                      ▼                    ▼
    ┌─────────────────────────────────────────────────────────┐
    │                    AGENT EXECUTION                       │
    │                                                          │
    │  For Each Agent:                                        │
    │  ┌─────────────────────────────────────────────┐      │
    │  │ 1. Receive Task from Orchestrator           │      │
    │  │ 2. Validate Input Parameters                │      │
    │  │ 3. Execute Core Logic                       │      │
    │  │ 4. Apply VERIFY Protocol                    │      │
    │  │ 5. Return Structured Output                │      │
    │  └─────────────────────────────────────────────┘      │
    └────────────────────────┬─────────────────────────────┘
                             │
                ┌────────────▼────────────┐
                │  Result Aggregation     │
                ├─────────────────────────┤
                │ • Merge agent outputs   │
                │ • Resolve conflicts     │
                │ • Compute consensus     │
                └────────────┬────────────┘
                             │
                ┌────────────▼────────────┐
                │  Quality Gate Check     │
                └────────────┬────────────┘
                             │
                    ┌────────┴────────┐
                    │ Meets Criteria?  │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                                  ▼
    ┌───────────────┐                ┌───────────────┐
    │  YES: Continue│                │  NO: Iterate  │
    │  to Synthesis │                │  or Escalate  │
    └───────┬───────┘                └───────┬───────┘
            │                                  │
            │      ┌───────────────────────────┘
            ▼      ▼
    ┌─────────────────────┐
    │  Synthesis Agent    │
    │  Final Report       │
    └─────────────────────┘
```

### 6.3 PHARMA + VERIFY Validation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                 PHARMA + VERIFY VALIDATION PIPELINE                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                        ┌───────────▼───────────┐
                        │   Information Input   │
                        │  (Agent Output/Data)  │
                        └───────────┬───────────┘
                                    │
            ┌───────────────────────▼───────────────────────────┐
            │                VERIFY PROTOCOL                     │
            ├─────────────────────────────────────────────────────┤
            │                                                     │
            │  V - Validate Sources                              │
            │  ┌─────────────────────────────────┐              │
            │  │ IF source_authority < 0.7:      │              │
            │  │   REJECT or REQUEST_ALTERNATIVE │              │
            │  └─────────────────────────────────┘              │
            │                      ▼                             │
            │  E - Evidence Citation                             │
            │  ┌─────────────────────────────────┐              │
            │  │ FOR each claim:                 │              │
            │  │   ADD [PMID:xxxxx] or          │              │
            │  │   ADD [NCT:xxxxx] or           │              │
            │  │   ADD [Source:Page:Date]       │              │
            │  └─────────────────────────────────┘              │
            │                      ▼                             │
            │  R - Request Confidence                            │
            │  ┌─────────────────────────────────┐              │
            │  │ Confidence = calculate_score()  │              │
            │  │ IF confidence < 0.7:            │              │
            │  │   FLAG for review               │              │
            │  └─────────────────────────────────┘              │
            │                      ▼                             │
            │  I - Identify Gaps                                │
            │  ┌─────────────────────────────────┐              │
            │  │ IF data_not_found:              │              │
            │  │   EXPLICIT: "No data for X"    │              │
            │  │   NEVER: interpolate/assume     │              │
            │  └─────────────────────────────────┘              │
            │                      ▼                             │
            │  F - Fact Check                                   │
            │  ┌─────────────────────────────────┐              │
            │  │ IF critical_claim:              │              │
            │  │   REQUIRE min 2 sources         │              │
            │  │   CHECK contradictions          │              │
            │  └─────────────────────────────────┘              │
            │                      ▼                             │
            │  Y - Yield to Experts                             │
            │  ┌─────────────────────────────────┐              │
            │  │ IF ambiguous OR complex:        │              │
            │  │   QUEUE for human review        │              │
            │  │   MARK confidence="pending"     │              │
            │  └─────────────────────────────────┘              │
            │                                                     │
            └───────────────────────┬─────────────────────────────┘
                                    │
                                    ▼
            ┌───────────────────────────────────────────────────┐
            │                PHARMA FRAMEWORK                    │
            ├─────────────────────────────────────────────────────┤
            │                                                     │
            │  P - Purpose Alignment                             │
            │  ┌─────────────────────────────────┐              │
            │  │ CATEGORIZE into:                │              │
            │  │ □ R&D Decision                  │              │
            │  │ □ Competitive Intelligence      │              │
            │  │ □ Medical Strategy              │              │
            │  └─────────────────────────────────┘              │
            │                      ▼                             │
            │  H - Hypothesis Generation                         │
            │  ┌─────────────────────────────────┐              │
            │  │ CREATE testable hypotheses:     │              │
            │  │ • Primary: "X leads to Y"       │              │
            │  │ • Alternative: "Z explains X"   │              │
            │  │ • Null: "No relationship"       │              │
            │  └─────────────────────────────────┘              │
            │                      ▼                             │
            │  A - Audience Targeting                           │
            │  ┌─────────────────────────────────┐              │
            │  │ FORMAT output for:             │              │
            │  │ • C-Suite: Strategic impact     │              │
            │  │ • R&D: Technical feasibility    │              │
            │  │ • Medical: Clinical relevance   │              │
            │  └─────────────────────────────────┘              │
            │                      ▼                             │
            │  R - Requirements Compliance                      │
            │  ┌─────────────────────────────────┐              │
            │  │ CHECK all regulatory boxes:     │              │
            │  │ ✓ FDA/EMA guidelines           │              │
            │  │ ✓ GxP compliance               │              │
            │  │ ✓ Data privacy (HIPAA/GDPR)    │              │
            │  └─────────────────────────────────┘              │
            │                      ▼                             │
            │  M - Metrics Definition                           │
            │  ┌─────────────────────────────────┐              │
            │  │ DEFINE success criteria:        │              │
            │  │ • Quantifiable KPIs            │              │
            │  │ • Timeline milestones          │              │
            │  │ • ROI projections              │              │
            │  └─────────────────────────────────┘              │
            │                      ▼                             │
            │  A - Action Enablement                            │
            │  ┌─────────────────────────────────┐              │
            │  │ SPECIFY next steps:            │              │
            │  │ • Who: Owner assigned          │              │
            │  │ • What: Specific action        │              │
            │  │ • When: Deadline              │              │
            │  │ • Resources: Required         │              │
            │  └─────────────────────────────────┘              │
            │                                                     │
            └───────────────────────┬─────────────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │   Validated Output    │
                        │  Ready for Delivery   │
                        └───────────────────────┘
```

---

## 7. UI/UX Wireframes

### 7.1 Job Configuration Interface

```
┌──────────────────────────────────────────────────────────────────────┐
│ 🔧 Configure Intelligence Job                     [Save] [Test] [Run] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ BASIC CONFIGURATION                              Step 1 of 5    │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │                                                                   │ │
│ │ Job Name: [CAR-T Solid Tumor Intelligence_____________]          │ │
│ │                                                                   │ │
│ │ Description:                                                      │ │
│ │ ┌───────────────────────────────────────────────────────────┐   │ │
│ │ │ Monitor emerging trends in CAR-T therapy for solid        │   │ │
│ │ │ tumors with focus on novel targets and combinations       │   │ │
│ │ └───────────────────────────────────────────────────────────┘   │ │
│ │                                                                   │ │
│ │ Therapeutic Areas:                                               │ │
│ │ Primary:   [Oncology        ▼] Sub: [✓]CAR-T [✓]IO [ ]ADC      │ │
│ │ Secondary: [Rare Diseases   ▼] Sub: [ ]Gene Tx [ ]Enzyme       │ │
│ │                                                                   │ │
│ │ Business Objective:                                              │ │
│ │ ○ R&D Portfolio Decision                                        │ │
│ │ ● Competitive Intelligence                                       │ │
│ │ ○ Market Opportunity Assessment                                  │ │
│ │ ○ Risk Mitigation                                               │ │
│ │                                                                   │ │
│ │ Update Frequency: [Daily ▼]  Time: [02:00 UTC]                  │ │
│ │                                                                   │ │
│ │                                    [Back] [Next: Keywords →]     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ KEYWORD & SEARCH CONFIGURATION                    Step 2 of 5   │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │                                                                   │ │
│ │ Primary Keywords:                          Weight  Action       │ │
│ │ ┌─────────────────────────────────────────────────────────┐    │ │
│ │ │ CAR-T, CART, Chimeric Antigen         │ 1.0  │ [Include] │    │ │
│ │ │ Solid tumor, solid tumour             │ 1.0  │ [Include] │    │ │
│ │ │ CLDN6, Claudin-6                      │ 0.9  │ [Include] │    │ │
│ │ │ Veterinary, animal model              │ -    │ [Exclude] │    │ │
│ │ └─────────────────────────────────────────────────────────┘    │ │
│ │ [+ Add Keyword]                                                  │ │
│ │                                                                   │ │
│ │ Boolean Query Builder:                                           │ │
│ │ ┌─────────────────────────────────────────────────────────┐    │ │
│ │ │ (CAR-T OR CART OR "Chimeric Antigen Receptor")         │    │ │
│ │ │ AND                                                      │    │ │
│ │ │ ("solid tumor" OR "solid tumour")                       │    │ │
│ │ │ NOT                                                      │    │ │
│ │ │ (veterinary OR "animal model")                          │    │ │
│ │ └─────────────────────────────────────────────────────────┘    │ │
│ │ [Validate Query] ✓ Query syntax valid                           │ │
│ │                                                                   │ │
│ │ Date Range: [Last 24 months ▼]  Custom: [____] to [____]       │ │
│ │                                                                   │ │
│ │                                    [← Back] [Next: Sources →]    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ DATA SOURCE CONFIGURATION                         Step 3 of 5   │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │                                                                   │ │
│ │ Enabled Sources:                    Authority  Rate   Status    │ │
│ │ ┌─────────────────────────────────────────────────────────┐    │ │
│ │ │ [✓] PubMed/MEDLINE              │   0.95   │ 10/s │  ✓   │    │ │
│ │ │ [✓] ClinicalTrials.gov          │   0.98   │ 5/s  │  ✓   │    │ │
│ │ │ [✓] EMA Clinical Data           │   1.00   │ 1/s  │  ✓   │    │ │
│ │ │ [✓] bioRxiv/medRxiv             │   0.70   │ 10/s │  ✓   │    │ │
│ │ │ [ ] Patent Databases            │   0.85   │ 2/s  │  -   │    │ │
│ │ │ [ ] Social Media                │   0.30   │ 100/s│  -   │    │ │
│ │ └─────────────────────────────────────────────────────────┘    │ │
│ │                                                                   │ │
│ │ Custom Data Source:                                             │ │
│ │ Name: [Internal Research DB_______________]                     │ │
│ │ Type: [Database ▼]                                              │ │
│ │ Connection: [postgres://user:pass@host:5432/db]                 │ │
│ │ [Test Connection] ✓ Connected successfully                      │ │
│ │                                                                   │ │
│ │ Source Weights:                                                  │ │
│ │ Peer-reviewed: [1.0]  Preprint: [0.7]  Conference: [0.6]       │ │
│ │                                                                   │ │
│ │                                    [← Back] [Next: Agents →]     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### 7.2 RAG Chat Interface

```
┌──────────────────────────────────────────────────────────────────────┐
│ 💬 Research Assistant - CAR-T Intelligence    [Export] [Clear] [⚙️]  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ CONVERSATION HISTORY                           Context: 32K/32K │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │                                                                   │ │
│ │ You (10:23 AM):                                                  │ │
│ │ What are the latest breakthroughs in CAR-T for pancreatic       │ │
│ │ cancer?                                                           │ │
│ │                                                                   │ │
│ │ ─────────────────────────────────────────────────────────────   │ │
│ │                                                                   │ │
│ │ 🤖 Assistant (10:23 AM):                                        │ │
│ │                                                                   │ │
│ │ Based on my analysis of recent literature, here are the key      │ │
│ │ breakthroughs in CAR-T for pancreatic cancer:                   │ │
│ │                                                                   │ │
│ │ 1. **CLDN6-targeted CAR-T** [High Confidence: 92%]              │ │
│ │    First complete response reported in Phase I trial            │ │
│ │    [PMID:38234567, NCT04521231]                                │ │
│ │    • 1/12 patients achieved CR                                   │ │
│ │    • 4/12 showed partial response                               │ │
│ │    • Median PFS: 6.2 months                                     │ │
│ │                                                                   │ │
│ │ 2. **Armored CAR-T with IL-15** [Medium Confidence: 75%]        │ │
│ │    Overcomes immunosuppressive TME                              │ │
│ │    [PMID:38234568, Nature 2024]                                │ │
│ │    • Enhanced T-cell persistence                                │ │
│ │    • Currently in preclinical                                   │ │
│ │                                                                   │ │
│ │ ⚠️ Evidence Gaps Identified:                                     │ │
│ │ • No data on combination with checkpoint inhibitors             │ │
│ │ • Limited long-term survival data                               │ │
│ │ • Manufacturing scalability not addressed                        │ │
│ │                                                                   │ │
│ │ 📊 View Supporting Evidence | 📑 Generate Report                 │ │
│ │                                                                   │ │
│ │ ─────────────────────────────────────────────────────────────   │ │
│ │                                                                   │ │
│ │ You (10:25 AM):                                                  │ │
│ │ Generate a retrospective report on this topic for the last      │ │
│ │ 6 months                                                          │ │
│ │                                                                   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Type your question...                                            │ │
│ │                                                                   │ │
│ │                                                                   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ [📎 Attach] [🎤 Voice] [⚡ Quick Actions ▼] [Send →]                │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ KNOWLEDGE BASE STATUS          │  ACTIVE CONTEXT                │ │
│ ├────────────────────────────────┴──────────────────────────────┤ │
│ │ Documents: 15,234              │  Retrieved: 20 docs           │ │
│ │ Last Update: 2 hours ago       │  Relevance: 0.87 avg          │ │
│ │ Coverage: 95% complete          │  Sources: Mixed               │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### 7.3 Execution Monitoring Dashboard

```
┌──────────────────────────────────────────────────────────────────────┐
│ 📊 Job Execution Monitor              [Pause] [Stop] [Export] [🔄]   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ Job: CAR-T Solid Tumor Intelligence          Status: ● RUNNING       │
│ Started: 14:00 UTC | Elapsed: 23m 45s | ETA: ~12m                  │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ EXECUTION PIPELINE                                               │ │
│ │                                                                   │ │
│ │ Data Collection    ████████████████████░░░░░  85% (1,847/2,180) │ │
│ │ ├─ PubMed         ██████████████████████████ 100% (500/500)    │ │
│ │ ├─ Trials         ██████████████████████████ 100% (47/47)      │ │
│ │ ├─ Patents        ████████████████░░░░░░░░░░  65% (8/12)       │ │
│ │ └─ RWE            ████████░░░░░░░░░░░░░░░░░░  30% (292/980)    │ │
│ │                                                                   │ │
│ │ Agent Processing   ████████████░░░░░░░░░░░░░  60% (3/5 agents) │ │
│ │ ├─ Literature     ██████████████████████████ 100% ✓            │ │
│ │ ├─ Clinical       ██████████████████████████ 100% ✓            │ │
│ │ ├─ Signal         █████████████░░░░░░░░░░░░░  55% ⟳           │ │
│ │ ├─ RWE            ░░░░░░░░░░░░░░░░░░░░░░░░░░   0% ⏸           │ │
│ │ └─ Synthesis      ░░░░░░░░░░░░░░░░░░░░░░░░░░   0% ⏸           │ │
│ │                                                                   │ │
│ │ Validation         ░░░░░░░░░░░░░░░░░░░░░░░░░░   0% (0/23)      │ │
│ │ Report Generation  ░░░░░░░░░░░░░░░░░░░░░░░░░░   0%             │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌──────────────────────┬──────────────────────────────────────────┐ │
│ │ LIVE METRICS         │ AGENT STATUS                             │ │
│ ├──────────────────────┼──────────────────────────────────────────┤ │
│ │                      │                                          │ │
│ │ Signals Detected: 12 │ Agent          Status    CPU   Memory   │ │
│ │ Confidence Avg: 0.74 │ ─────────────────────────────────────   │ │
│ │ False Positives: 1   │ Orchestrator   Active    12%   1.2GB    │ │
│ │                      │ Literature     Complete   -    0.8GB    │ │
│ │ API Usage:           │ Clinical       Complete   -    0.5GB    │ │
│ │ • PubMed: 892/1000   │ Signal         Running   45%   2.1GB    │ │
│ │ • GPT-4: 45K/100K    │ RWE           Queued     -     -        │ │
│ │ • Claude: 23K/50K    │ Synthesis     Waiting    -     -        │ │
│ │                      │                                          │ │
│ │ Errors: 0            │ Total System:           57%   4.6GB     │ │
│ │ Warnings: 3          │                                          │ │
│ └──────────────────────┴──────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ LIVE LOG STREAM                                    [Filter ▼]   │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ 14:23:45 [INFO]  Signal detector found strong signal (0.89)     │ │
│ │ 14:23:44 [INFO]  Processing paper PMID:38234569                 │ │
│ │ 14:23:43 [WARN]  Rate limit approaching for PubMed API          │ │
│ │ 14:23:40 [INFO]  Clinical trials agent completed 47 trials      │ │
│ │ 14:23:38 [DEBUG] Cache hit for query "CAR-T pancreatic"         │ │
│ │ 14:23:35 [INFO]  VERIFY protocol passed for 15 sources          │ │
│ │ 14:23:33 [WARN]  Low confidence score (0.45) - queuing review   │ │
│ │                                                      [More ▼]    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### 7.4 Output Format Selection Interface

```
┌──────────────────────────────────────────────────────────────────────┐
│ 📄 Configure Output Formats                        [Preview] [Save]   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ REPORT TEMPLATES                                                 │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │                                                                   │ │
│ │ [✓] Executive Brief                                              │ │
│ │     Format: PDF | Length: 2-3 pages | Frequency: Weekly         │ │
│ │     ┌───────────────────────────────────────┐                   │ │
│ │     │ • Executive Summary (500 words)        │                   │ │
│ │     │ • Key Findings (3-5 bullets)          │                   │ │
│ │     │ • Strategic Implications              │                   │ │
│ │     │ • Recommendations & Next Steps        │                   │ │
│ │     └───────────────────────────────────────┘                   │ │
│ │     Audience: [C-Suite ▼]                                       │ │
│ │                                                                   │ │
│ │ [✓] Technical Deep Dive                                          │ │
│ │     Format: HTML | Length: 10-15 pages | Frequency: Monthly     │ │
│ │     ┌───────────────────────────────────────┐                   │ │
│ │     │ • Methodology & Data Sources          │                   │ │
│ │     │ • Detailed Analysis & Statistics      │                   │ │
│ │     │ • Evidence Tables                     │                   │ │
│ │     │ • Technical Appendices                │                   │ │
│ │     │ • References & Citations              │                   │ │
│ │     └───────────────────────────────────────┘                   │ │
│ │     Include: [✓] Raw Data [✓] Visualizations [ ] Source Code   │ │
│ │                                                                   │ │
│ │ [ ] Regulatory Submission Package                                │ │
│ │ [ ] Competitive Intelligence Dossier                             │ │
│ │ [+] Create Custom Template                                       │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ DELIVERY CHANNELS                                                │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │                                                                   │ │
│ │ Email Distribution                                               │ │
│ │ [✓] Enable  Recipients: [team@pharma.com; cmo@pharma.com    ]   │ │
│ │     Schedule: [Every Monday ▼] at [09:00 EST ▼]                │ │
│ │     Format: [ ] Inline [✓] Attachment [ ] Link                 │ │
│ │                                                                   │ │
│ │ Slack Integration                                                │ │
│ │ [✓] Enable  Channel: [#medical-intelligence          ]          │ │
│ │     Alerts: [✓] Critical [✓] High [ ] Medium [ ] Low           │ │
│ │     Format: [Summary with link ▼]                              │ │
│ │                                                                   │ │
│ │ API Webhook                                                      │ │
│ │ [ ] Enable  Endpoint: [https://api.company.com/webhook ]        │ │
│ │     Method: [POST ▼]  Auth: [Bearer Token ▼]                   │ │
│ │     Payload: [JSON ▼]  Retry: [3 attempts ▼]                   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ EXPORT OPTIONS                                                   │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │                                                                   │ │
│ │ File Formats:                    Visualization Formats:          │ │
│ │ [✓] PDF with citations          [✓] Interactive dashboards     │ │
│ │ [✓] Excel with raw data         [✓] Static charts (PNG)        │ │
│ │ [✓] PowerPoint deck             [ ] Animated graphs (GIF)      │ │
│ │ [ ] Word document               [✓] Knowledge graph (HTML)     │ │
│ │ [✓] JSON (structured data)      [ ] 3D visualizations         │ │
│ │                                                                   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 8. Output Format Examples

### 8.1 Executive Brief Format

```
┌─────────────────────────────────────────────────────────────────────┐
│                     EXECUTIVE INTELLIGENCE BRIEF                      │
│                  CAR-T Solid Tumor Breakthrough Analysis              │
│                         September 18, 2025                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ PURPOSE: Competitive Intelligence for R&D Strategy                   │
│ CONFIDENCE: High (87%)                                               │
│ IMPACT: Critical - Potential $2B market opportunity                  │
│                                                                       │
│ ═══════════════════════════════════════════════════════════════════ │
│                                                                       │
│ KEY FINDINGS                                                          │
│                                                                       │
│ 1. BREAKTHROUGH: First complete response in pancreatic cancer        │
│    • CLDN6-targeted CAR-T achieved 1 CR, 4 PR in Phase I            │
│    • Evidence: [NCT04521231, PMID:38234567]                        │
│    • Competitor: BioNTech/Genentech collaboration                    │
│                                                                       │
│ 2. TREND: Armored CAR-T designs overcoming TME                      │
│    • IL-15 secreting variants show 3x persistence                   │
│    • 5 new trials initiated Q3 2025                                 │
│    • Timeline to market: 3-5 years                                  │
│                                                                       │
│ 3. RISK: Manufacturing complexity increasing                         │
│    • Dual-targeting approaches require new processes                │
│    • Cost per treatment approaching $750K                           │
│    • Capacity constraints emerging                                  │
│                                                                       │
│ ═══════════════════════════════════════════════════════════════════ │
│                                                                       │
│ STRATEGIC IMPLICATIONS                                               │
│                                                                       │
│ • Window of opportunity: 12-18 months before crowding               │
│ • Investment required: $50-75M for competitive program              │
│ • Partnership critical for manufacturing scale                      │
│                                                                       │
│ ═══════════════════════════════════════════════════════════════════ │
│                                                                       │
│ RECOMMENDED ACTIONS                                        Owner     │
│                                                                       │
│ 1. Initiate feasibility assessment for CLDN6 program     R&D Head   │
│    Deadline: October 15, 2025                                       │
│                                                                       │
│ 2. Engage KOLs at upcoming ESMO meeting                 Med Affairs │
│    Targets: Dr. Smith (MSKCC), Dr. Jones (MD Anderson)             │
│                                                                       │
│ 3. Evaluate partnership with manufacturing CMO           BD&L       │
│    Budget required: $5M for due diligence                          │
│                                                                       │
│ ═══════════════════════════════════════════════════════════════════ │
│                                                                       │
│ METRICS FOR SUCCESS                                                  │
│ • Q4 2025: Partnership agreement signed                             │
│ • Q1 2026: IND-enabling studies initiated                          │
│ • Q3 2026: First-in-human trial started                            │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. CRUD Operations & Data Management

### 9.1 CRUD API Specification

```yaml
crud_operations:
  base_url: "https://api.pharma-intel.com/v1"
  authentication: "Bearer JWT Token"
  
  job_endpoints:
    create:
      method: "POST"
      endpoint: "/jobs"
      request_body:
        name: "string"
        description: "string"
        configuration: "JobConfiguration"
        workflow: "WorkflowDefinition"
        schedule: "CronExpression"
      response:
        job_id: "UUID"
        status: "created"
        created_at: "ISO8601"
        
    read:
      list_all:
        method: "GET"
        endpoint: "/jobs"
        query_params:
          page: "integer"
          limit: "integer"
          filter: "string"
          sort: "string"
        response:
          jobs: "JobSummary[]"
          total: "integer"
          
      get_single:
        method: "GET"
        endpoint: "/jobs/{job_id}"
        response:
          job: "JobComplete"
          version: "integer"
          history: "VersionHistory[]"
          
    update:
      method: "PUT"
      endpoint: "/jobs/{job_id}"
      request_body:
        configuration: "JobConfiguration"
        workflow: "WorkflowDefinition"
        version: "integer" # For optimistic locking
      response:
        job_id: "UUID"
        status: "updated"
        version: "integer"
        updated_at: "ISO8601"
        
    delete:
      soft_delete:
        method: "DELETE"
        endpoint: "/jobs/{job_id}"
        response:
          status: "archived"
          archived_at: "ISO8601"
          
      hard_delete:
        method: "DELETE"
        endpoint: "/jobs/{job_id}?permanent=true"
        response:
          status: "deleted"
          
  workflow_endpoints:
    create:
      method: "POST"
      endpoint: "/workflows"
      request_body:
        name: "string"
        description: "string"
        nodes: "WorkflowNode[]"
        edges: "WorkflowEdge[]"
        metadata: "object"
        
    read:
      method: "GET"
      endpoint: "/workflows/{workflow_id}"
      
    update:
      method: "PUT"
      endpoint: "/workflows/{workflow_id}"
      
    delete:
      method: "DELETE"
      endpoint: "/workflows/{workflow_id}"
      
    version_control:
      list_versions:
        method: "GET"
        endpoint: "/workflows/{workflow_id}/versions"
        
      get_version:
        method: "GET"
        endpoint: "/workflows/{workflow_id}/versions/{version_id}"
        
      restore_version:
        method: "POST"
        endpoint: "/workflows/{workflow_id}/versions/{version_id}/restore"
```

### 9.2 Database Schema for CRUD Operations

```sql
-- Jobs Table
CREATE TABLE jobs (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('draft', 'active', 'paused', 'archived', 'deleted'),
    configuration JSONB NOT NULL,
    workflow_id UUID REFERENCES workflows(workflow_id),
    schedule VARCHAR(100), -- Cron expression
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    version INTEGER DEFAULT 1,
    tags TEXT[],
    metadata JSONB
);

-- Workflows Table
CREATE TABLE workflows (
    workflow_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_definition JSONB NOT NULL, -- Stores nodes, edges, positions
    lucid_diagram_id VARCHAR(255), -- Reference to Lucidchart
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    is_template BOOLEAN DEFAULT FALSE,
    category VARCHAR(100)
);

-- Version History Table
CREATE TABLE job_versions (
    version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(job_id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    configuration JSONB NOT NULL,
    workflow_snapshot JSONB,
    changed_by UUID REFERENCES users(user_id),
    change_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, version_number)
);

-- Workflow Versions Table
CREATE TABLE workflow_versions (
    version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(workflow_id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    workflow_definition JSONB NOT NULL,
    lucid_diagram_snapshot JSONB,
    changed_by UUID REFERENCES users(user_id),
    change_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workflow_id, version_number)
);

-- Job Execution History
CREATE TABLE job_executions (
    execution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(job_id),
    workflow_version_used INTEGER,
    status ENUM('running', 'completed', 'failed', 'cancelled'),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    execution_log JSONB,
    results JSONB,
    metrics JSONB
);

-- Audit Log for CRUD Operations
CREATE TABLE crud_audit_log (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type ENUM('job', 'workflow', 'configuration'),
    entity_id UUID NOT NULL,
    operation ENUM('create', 'read', 'update', 'delete'),
    user_id UUID REFERENCES users(user_id),
    ip_address INET,
    user_agent TEXT,
    changes JSONB, -- Before/after values
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_jobs_status ON jobs(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_created_by ON jobs(created_by);
CREATE INDEX idx_jobs_tags ON jobs USING GIN(tags);
CREATE INDEX idx_workflows_category ON workflows(category);
CREATE INDEX idx_job_executions_job_id ON job_executions(job_id);
CREATE INDEX idx_crud_audit_entity ON crud_audit_log(entity_type, entity_id);
```

---

## 10. Lucid React Workflow Builder

### 10.1 Workflow Builder Architecture

```typescript
// Lucid React Integration Types
interface LucidWorkflowBuilder {
  // Core Components from Lucid React
  components: {
    Canvas: React.FC<CanvasProps>;
    Node: React.FC<NodeProps>;
    Edge: React.FC<EdgeProps>;
    Toolbar: React.FC<ToolbarProps>;
    PropertyPanel: React.FC<PropertyPanelProps>;
  };
  
  // Workflow Definition
  workflow: {
    id: string;
    name: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    metadata: WorkflowMetadata;
  };
  
  // Node Types for Medical Intelligence
  nodeTypes: {
    'data_source': DataSourceNode;
    'agent': AgentNode;
    'validator': ValidatorNode;
    'transformer': TransformerNode;
    'decision': DecisionNode;
    'output': OutputNode;
    'human_review': HumanReviewNode;
  };
}

interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    configuration: any;
    inputs: string[];
    outputs: string[];
    validation: ValidationRules;
  };
  style: NodeStyle;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  type: 'default' | 'conditional' | 'parallel';
  data: {
    condition?: string;
    label?: string;
    weight?: number;
  };
}

interface ValidationRules {
  required: boolean;
  pharmaCompliant: boolean;
  verifyProtocol: boolean;
  confidenceThreshold: number;
}
```

### 10.2 Visual Workflow Editor Interface

```
┌──────────────────────────────────────────────────────────────────────┐
│ 🔧 Visual Workflow Builder - Powered by Lucid React    [Save] [Test] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ ┌───────┬───────────────────────────────────────────────┬─────────┐ │
│ │       │                  CANVAS                        │         │ │
│ │   T   │                                                 │    P    │ │
│ │   O   │  ┌─────────┐                                   │    R    │ │
│ │   O   │  │ PubMed  │                                   │    O    │ │
│ │   L   │  │  Source │───┐                               │    P    │ │
│ │   B   │  └─────────┘   │                               │    E    │ │
│ │   A   │                 │     ┌──────────────┐         │    R    │ │
│ │   R   │  ┌─────────┐   ├────▶│  Literature  │         │    T    │ │
│ │       │  │Clinical │   │     │    Agent     │───┐     │    I    │ │
│ │  ┌─┐  │  │ Trials  │───┘     └──────────────┘   │     │    E    │ │
│ │  │📊│ │  └─────────┘                             │     │    S    │ │
│ │  ├─┤  │                                          ▼     │         │ │
│ │  │🤖│ │  ┌─────────┐         ┌──────────────┐   ┌─────────┐    │ │
│ │  ├─┤  │  │  RWE    │────────▶│   Signal     │──▶│ VERIFY  │    │ │
│ │  │✓│  │  │  Source │         │   Detector   │   │Protocol │    │ │
│ │  ├─┤  │  └─────────┘         └──────────────┘   └────┬────┘    │ │
│ │  │◊│  │                                               │         │ │
│ │  ├─┤  │                      ┌──────────────┐        ▼         │ │
│ │  │📄│ │                      │   PHARMA     │◀───[Decision]    │ │
│ │  ├─┤  │                      │  Framework   │     │      │     │ │
│ │  │👤│ │                      └──────┬───────┘     │      ▼     │ │
│ │  └─┘  │                             │             │   [Human]  │ │
│ │       │                             ▼             │   [Review] │ │
│ │ Nodes │                      ┌──────────────┐    │      │     │ │
│ │       │                      │   Output     │◀───┴──────┘     │ │
│ │       │                      │  Generator   │                  │ │
│ │       │                      └──────────────┘                  │ │
│ │       │                                                         │ │
│ └───────┴───────────────────────────────────────────────┬─────────┘ │
│                                                           │           │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ PROPERTIES PANEL                        │ VALIDATION STATUS      │ │
│ ├───────────────────────────────────────┴───────────────────────┤ │
│ │ Selected: Literature Agent                                       │ │
│ │                                                                   │ │
│ │ Configuration:                        Validation:                │ │
│ │ Model: [GPT-4-Turbo ▼]               ✓ Inputs connected         │ │
│ │ Temperature: [0.2] ──○────           ✓ Outputs defined          │ │
│ │ Max Tokens: [8192]                   ⚠ Missing error handler    │ │
│ │                                       ✓ PHARMA compliant        │ │
│ │ Search Parameters:                    ✓ VERIFY enabled          │ │
│ │ • Databases: [✓] PubMed                                         │ │
│ │              [✓] Embase              [Test Node] [Delete]       │ │
│ │              [ ] bioRxiv                                        │ │
│ │ • Date Range: [24 months ▼]                                     │ │
│ │                                                                   │ │
│ │ Error Handling:                                                  │ │
│ │ On Failure: [Retry 3x ▼]                                        │ │
│ │ Timeout: [30 seconds]                                           │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### 10.3 React Component Implementation

```typescript
// LucidWorkflowBuilder.tsx
import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  ConnectionMode,
  Panel
} from 'reactflow';
import { LucidChart } from '@lucidchart/react-sdk';
import 'reactflow/dist/style.css';

// Custom Node Components
import DataSourceNode from './nodes/DataSourceNode';
import AgentNode from './nodes/AgentNode';
import ValidatorNode from './nodes/ValidatorNode';
import DecisionNode from './nodes/DecisionNode';
import OutputNode from './nodes/OutputNode';

const nodeTypes = {
  dataSource: DataSourceNode,
  agent: AgentNode,
  validator: ValidatorNode,
  decision: DecisionNode,
  output: OutputNode,
};

interface WorkflowBuilderProps {
  jobId?: string;
  initialWorkflow?: WorkflowDefinition;
  onSave: (workflow: WorkflowDefinition) => void;
  onTest: (workflow: WorkflowDefinition) => void;
}

const LucidWorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  jobId,
  initialWorkflow,
  onSave,
  onTest
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialWorkflow?.nodes || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialWorkflow?.edges || []
  );
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isTestMode, setIsTestMode] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Node Templates for Drag & Drop
  const nodeTemplates = {
    dataSource: {
      type: 'dataSource',
      data: {
        label: 'Data Source',
        sourceType: 'pubmed',
        configuration: {
          apiEndpoint: '',
          rateLimit: 10,
          authentication: {}
        }
      }
    },
    agent: {
      type: 'agent',
      data: {
        label: 'AI Agent',
        agentType: 'literature_analyst',
        model: 'gpt-4-turbo',
        configuration: {
          temperature: 0.2,
          maxTokens: 8192,
          systemPrompt: ''
        }
      }
    },
    validator: {
      type: 'validator',
      data: {
        label: 'Validator',
        validationType: 'VERIFY',
        rules: {
          minConfidence: 0.7,
          requireCitations: true,
          checkContradictions: true
        }
      }
    },
    decision: {
      type: 'decision',
      data: {
        label: 'Decision Point',
        conditions: [
          { if: 'confidence > 0.8', then: 'auto_approve' },
          { if: 'confidence < 0.8', then: 'human_review' }
        ]
      }
    },
    output: {
      type: 'output',
      data: {
        label: 'Output',
        format: 'report',
        template: 'executive_brief',
        delivery: ['email', 'dashboard']
      }
    }
  };

  // Drag and Drop Handler
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type || !reactFlowBounds) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `${type}_${Date.now()}`,
        type,
        position,
        data: nodeTemplates[type].data,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  // Connection Validation
  const isValidConnection = useCallback(
    (connection: Connection) => {
      const source = nodes.find((node) => node.id === connection.source);
      const target = nodes.find((node) => node.id === connection.target);

      // Validate connection rules
      if (source?.type === 'output') return false; // Outputs can't be sources
      if (target?.type === 'dataSource') return false; // Data sources can't be targets
      
      // Check for cycles
      if (wouldCreateCycle(connection, nodes, edges)) {
        return false;
      }

      return true;
    },
    [nodes, edges]
  );

  // Workflow Validation
  const validateWorkflow = useCallback(() => {
    const errors: ValidationError[] = [];

    // Check for disconnected nodes
    nodes.forEach((node) => {
      const hasInput = edges.some((edge) => edge.target === node.id);
      const hasOutput = edges.some((edge) => edge.source === node.id);

      if (!hasInput && node.type !== 'dataSource') {
        errors.push({
          nodeId: node.id,
          message: `Node "${node.data.label}" has no input connection`,
          severity: 'error'
        });
      }

      if (!hasOutput && node.type !== 'output') {
        errors.push({
          nodeId: node.id,
          message: `Node "${node.data.label}" has no output connection`,
          severity: 'warning'
        });
      }
    });

    // Check for PHARMA compliance
    const hasValidator = nodes.some((node) => 
      node.type === 'validator' && 
      node.data.validationType === 'VERIFY'
    );

    if (!hasValidator) {
      errors.push({
        nodeId: null,
        message: 'Workflow missing VERIFY protocol validator',
        severity: 'error'
      });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [nodes, edges]);

  // Save Workflow
  const handleSave = useCallback(() => {
    if (!validateWorkflow()) {
      alert('Workflow has validation errors. Please fix them before saving.');
      return;
    }

    const workflowDefinition: WorkflowDefinition = {
      id: jobId || `workflow_${Date.now()}`,
      name: 'Medical Intelligence Workflow',
      nodes,
      edges,
      metadata: {
        createdAt: new Date().toISOString(),
        version: 1,
        lucidDiagramId: null
      }
    };

    onSave(workflowDefinition);
  }, [nodes, edges, jobId, onSave, validateWorkflow]);

  // Test Workflow
  const handleTest = useCallback(() => {
    if (!validateWorkflow()) {
      alert('Workflow has validation errors. Please fix them before testing.');
      return;
    }

    setIsTestMode(true);
    
    const workflowDefinition: WorkflowDefinition = {
      id: jobId || `workflow_${Date.now()}`,
      name: 'Test Run',
      nodes,
      edges,
      metadata: {
        testMode: true
      }
    };

    onTest(workflowDefinition);
  }, [nodes, edges, jobId, onTest, validateWorkflow]);

  // Export to Lucidchart
  const exportToLucidchart = useCallback(async () => {
    const lucidDiagram = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        text: node.data.label,
        shape: mapNodeTypeToLucidShape(node.type)
      })),
      edges: edges.map(edge => ({
        from: edge.source,
        to: edge.target,
        label: edge.data?.label || '',
        style: edge.type === 'conditional' ? 'dashed' : 'solid'
      }))
    };

    // Call Lucidchart API
    const response = await fetch('/api/lucidchart/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lucidDiagram)
    });

    const { diagramUrl } = await response.json();
    window.open(diagramUrl, '_blank');
  }, [nodes, edges]);

  return (
    <ReactFlowProvider>
      <div className="workflow-builder" style={{ height: '100vh' }}>
        {/* Toolbar */}
        <div className="toolbar">
          <button onClick={handleSave}>💾 Save Workflow</button>
          <button onClick={handleTest}>🧪 Test Workflow</button>
          <button onClick={validateWorkflow}>✓ Validate</button>
          <button onClick={exportToLucidchart}>📊 Export to Lucid</button>
        </div>

        {/* Node Palette */}
        <div className="node-palette">
          {Object.entries(nodeTemplates).map(([type, template]) => (
            <div
              key={type}
              className="node-template"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('application/reactflow', type);
                event.dataTransfer.effectAllowed = 'move';
              }}
            >
              {template.data.label}
            </div>
          ))}
        </div>

        {/* Main Canvas */}
        <div ref={reactFlowWrapper} className="reactflow-wrapper">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={(_, node) => setSelectedNode(node)}
            isValidConnection={isValidConnection}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
          >
            <Background variant="dots" gap={12} size={1} />
            <Controls />
            <MiniMap />
            
            {/* Validation Panel */}
            <Panel position="bottom-left">
              {validationErrors.length > 0 && (
                <div className="validation-panel">
                  <h4>⚠️ Validation Issues:</h4>
                  {validationErrors.map((error, idx) => (
                    <div key={idx} className={`error-${error.severity}`}>
                      {error.message}
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            {/* Test Mode Overlay */}
            {isTestMode && (
              <Panel position="top-center">
                <div className="test-mode-banner">
                  🧪 Test Mode Active - Workflow Running...
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* Properties Panel */}
        {selectedNode && (
          <NodePropertiesPanel
            node={selectedNode}
            onUpdate={(updatedNode) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === updatedNode.id ? updatedNode : node
                )
              );
            }}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </ReactFlowProvider>
  );
};

export default LucidWorkflowBuilder;
```

### 10.4 CRUD Operations Interface

```
┌──────────────────────────────────────────────────────────────────────┐
│ 📋 Job Management Console                    [+ New Job] [Import]    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ Search: [_____________________] Filter: [All ▼] Sort: [Modified ▼]  │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ YOUR JOBS                                          12 Total     │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │                                                                   │ │
│ │ ┌───────────────────────────────────────────────────────────┐   │ │
│ │ │ 📊 CAR-T Solid Tumor Intelligence          Status: ● Active│   │ │
│ │ │ Last Run: 2 hours ago | Next: In 4 hours | v3 (current)   │   │ │
│ │ │                                                             │   │ │
│ │ │ [👁️ View] [✏️ Edit] [🔧 Configure] [📊 Results] [🗑️]      │   │ │
│ │ └───────────────────────────────────────────────────────────┘   │ │
│ │                                                                   │ │
│ │ ┌───────────────────────────────────────────────────────────┐   │ │
│ │ │ 🧬 Gene Therapy Landscape Analysis        Status: ⏸ Paused│   │ │
│ │ │ Last Run: Yesterday | Next: Manual | v2 (current)          │   │ │
│ │ │                                                             │   │ │
│ │ │ [👁️ View] [✏️ Edit] [🔧 Configure] [📊 Results] [🗑️]      │   │ │
│ │ └───────────────────────────────────────────────────────────┘   │ │
│ │                                                                   │ │
│ │ ┌───────────────────────────────────────────────────────────┐   │ │
│ │ │ 💊 Digital Therapeutics Market Scan       Status: 📝 Draft │   │ │
│ │ │ Created: Sept 15, 2025 | Never run | v1 (current)          │   │ │
│ │ │                                                             │   │ │
│ │ │ [👁️ View] [✏️ Edit] [🔧 Configure] [🧪 Test] [🗑️]        │   │ │
│ │ └───────────────────────────────────────────────────────────┘   │ │
│ │                                                                   │ │
│ │                                              [Load More...]      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘

// Edit Mode Interface
┌──────────────────────────────────────────────────────────────────────┐
│ ✏️ Edit Job: CAR-T Solid Tumor Intelligence   [Save] [Cancel] [📋]  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ ┌───────────────────┬─────────────────────────────────────────────┐ │
│ │ EDIT MODE TABS    │                                             │ │
│ ├───────────────────┼─────────────────────────────────────────────┤ │
│ │                   │                                             │ │
│ │ [Configuration]   │  Job Name: [CAR-T Solid Tumor Intel____]    │ │
│ │ [Workflow]        │                                             │ │
│ │ [Schedule]        │  Description:                                │ │
│ │ [Permissions]     │  ┌─────────────────────────────────────┐   │ │
│ │ [History]         │  │ Continuous monitoring of CAR-T       │   │ │
│ │ [Advanced]        │  │ developments in solid tumors with    │   │ │
│ │                   │  │ focus on emerging targets...         │   │ │
│ │                   │  └─────────────────────────────────────┘   │ │
│ │                   │                                             │ │
│ │                   │  Status: [Active ▼]                        │ │
│ │                   │                                             │ │
│ │                   │  Tags: [#oncology] [#CAR-T] [+ Add]       │ │
│ │                   │                                             │ │
│ │                   │  Version Note:                              │ │
│ │                   │  [Updated keywords for CLDN6_______]       │ │
│ │                   │                                             │ │
│ │                   │  ⚠️ Unsaved changes - Save or discard?     │ │
│ └───────────────────┴─────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ VERSION HISTORY                                    [Compare]    │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │                                                                   │ │
│ │ v3 (current)  Sept 18, 2025 14:00  Added CLDN6 keywords         │ │
│ │ v2            Sept 15, 2025 10:30  Updated data sources         │ │
│ │ v1            Sept 10, 2025 09:15  Initial configuration        │ │
│ │                                                                   │ │
│ │ [Restore v2] [View Diff v2→v3] [Download v1]                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘

// Delete Confirmation Dialog
┌──────────────────────────────────────────────┐
│ ⚠️ Confirm Delete                             │
├──────────────────────────────────────────────┤
│                                               │
│ Are you sure you want to delete:             │
│                                               │
│ "CAR-T Solid Tumor Intelligence"             │
│                                               │
│ This will:                                    │
│ • Stop all scheduled runs                    │
│ • Archive execution history                  │
│ • Remove from active jobs                    │
│                                               │
│ Delete Type:                                  │
│ ○ Soft Delete (can restore within 30 days)   │
│ ○ Hard Delete (permanent, cannot restore)    │
│                                               │
│ Type job name to confirm:                    │
│ [_____________________________]              │
│                                               │
│        [Cancel]  [Delete Job]                 │
└──────────────────────────────────────────────┘
```

### 10.5 API Implementation Example

```python
# FastAPI CRUD Implementation
from fastapi import FastAPI, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime
import uuid
from sqlalchemy.orm import Session

app = FastAPI()

# CREATE - New Job
@app.post("/api/v1/jobs", response_model=JobResponse)
async def create_job(
    job: JobCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new intelligence job with workflow"""
    
    # Validate workflow
    if job.workflow:
        validation_result = validate_workflow(job.workflow)
        if not validation_result.is_valid:
            raise HTTPException(
                status_code=400,
                detail=f"Workflow validation failed: {validation_result.errors}"
            )
    
    # Create job in database
    db_job = Job(
        job_id=str(uuid.uuid4()),
        name=job.name,
        description=job.description,
        configuration=job.configuration.dict(),
        workflow_id=job.workflow_id,
        status="draft",
        created_by=current_user.user_id,
        version=1
    )
    
    db.add(db_job)
    
    # Create audit log
    audit = CRUDAuditLog(
        entity_type="job",
        entity_id=db_job.job_id,
        operation="create",
        user_id=current_user.user_id,
        changes={"created": db_job.dict()}
    )
    
    db.add(audit)
    db.commit()
    
    return JobResponse(
        job_id=db_job.job_id,
        status="created",
        created_at=db_job.created_at,
        message="Job created successfully"
    )

# READ - List Jobs
@app.get("/api/v1/jobs", response_model=JobListResponse)
async def list_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    filter: Optional[str] = None,
    sort: str = "created_at_desc",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all jobs for current user with pagination"""
    
    query = db.query(Job).filter(
        Job.created_by == current_user.user_id,
        Job.deleted_at.is_(None)
    )
    
    # Apply filters
    if filter:
        query = apply_filters(query, filter)
    
    # Apply sorting
    query = apply_sorting(query, sort)
    
    # Pagination
    total = query.count()
    jobs = query.offset((page - 1) * limit).limit(limit).all()
    
    return JobListResponse(
        jobs=[JobSummary.from_orm(job) for job in jobs],
        total=total,
        page=page,
        limit=limit
    )

# READ - Get Single Job
@app.get("/api/v1/jobs/{job_id}", response_model=JobComplete)
async def get_job(
    job_id: str,
    include_history: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed job information"""
    
    job = db.query(Job).filter(
        Job.job_id == job_id,
        Job.created_by == current_user.user_id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    response = JobComplete.from_orm(job)
    
    if include_history:
        versions = db.query(JobVersion).filter(
            JobVersion.job_id == job_id
        ).order_by(JobVersion.version_number.desc()).all()
        
        response.history = [VersionHistory.from_orm(v) for v in versions]
    
    return response

# UPDATE - Modify Job
@app.put("/api/v1/jobs/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: str,
    update: JobUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update job configuration or workflow"""
    
    job = db.query(Job).filter(
        Job.job_id == job_id,
        Job.created_by == current_user.user_id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check version for optimistic locking
    if update.version != job.version:
        raise HTTPException(
            status_code=409,
            detail="Version conflict - job was modified by another user"
        )
    
    # Store current version in history
    job_version = JobVersion(
        job_id=job_id,
        version_number=job.version,
        configuration=job.configuration,
        workflow_snapshot=job.workflow.dict() if job.workflow else None,
        changed_by=current_user.user_id,
        change_description=update.change_description
    )
    db.add(job_version)
    
    # Update job
    if update.configuration:
        job.configuration = update.configuration.dict()
    
    if update.workflow:
        # Validate workflow
        validation_result = validate_workflow(update.workflow)
        if not validation_result.is_valid:
            raise HTTPException(
                status_code=400,
                detail=f"Workflow validation failed: {validation_result.errors}"
            )
        job.workflow = update.workflow
    
    job.version += 1
    job.updated_at = datetime.utcnow()
    
    # Audit log
    audit = CRUDAuditLog(
        entity_type="job",
        entity_id=job_id,
        operation="update",
        user_id=current_user.user_id,
        changes={
            "before": job_version.configuration,
            "after": job.configuration
        }
    )
    
    db.add(audit)
    db.commit()
    
    return JobResponse(
        job_id=job_id,
        status="updated",
        version=job.version,
        updated_at=job.updated_at
    )

# DELETE - Soft Delete
@app.delete("/api/v1/jobs/{job_id}", response_model=JobResponse)
async def delete_job(
    job_id: str,
    permanent: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete job (soft delete by default)"""
    
    job = db.query(Job).filter(
        Job.job_id == job_id,
        Job.created_by == current_user.user_id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if permanent:
        # Hard delete - remove from database
        db.delete(job)
        status = "deleted"
    else:
        # Soft delete - mark as deleted
        job.deleted_at = datetime.utcnow()
        job.status = "archived"
        status = "archived"
    
    # Audit log
    audit = CRUDAuditLog(
        entity_type="job",
        entity_id=job_id,
        operation="delete",
        user_id=current_user.user_id,
        changes={"permanent": permanent}
    )
    
    db.add(audit)
    db.commit()
    
    return JobResponse(
        job_id=job_id,
        status=status,
        message=f"Job {'permanently deleted' if permanent else 'archived'}"
    )

# RESTORE - Restore Soft Deleted Job
@app.post("/api/v1/jobs/{job_id}/restore", response_model=JobResponse)
async def restore_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Restore a soft-deleted job"""
    
    job = db.query(Job).filter(
        Job.job_id == job_id,
        Job.created_by == current_user.user_id,
        Job.deleted_at.isnot(None)
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=404,
            detail="Archived job not found"
        )
    
    job.deleted_at = None
    job.status = "draft"
    
    # Audit log
    audit = CRUDAuditLog(
        entity_type="job",
        entity_id=job_id,
        operation="restore",
        user_id=current_user.user_id
    )
    
    db.add(audit)
    db.commit()
    
    return JobResponse(
        job_id=job_id,
        status="restored",
        message="Job restored successfully"
    )

# CLONE - Duplicate Job
@app.post("/api/v1/jobs/{job_id}/clone", response_model=JobResponse)
async def clone_job(
    job_id: str,
    new_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clone an existing job with a new name"""
    
    original = db.query(Job).filter(
        Job.job_id == job_id,
        Job.created_by == current_user.user_id
    ).first()
    
    if not original:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Create new job as copy
    cloned = Job(
        job_id=str(uuid.uuid4()),
        name=new_name,
        description=f"Cloned from {original.name}",
        configuration=original.configuration,
        workflow_id=original.workflow_id,
        status="draft",
        created_by=current_user.user_id,
        version=1
    )
    
    db.add(cloned)
    db.commit()
    
    return JobResponse(
        job_id=cloned.job_id,
        status="created",
        message=f"Job cloned successfully as '{new_name}'"
    )
```

---

This completes the comprehensive PRD/ARD document with CRUD capabilities and Lucid React workflow builder integration for the MA01 job-to-be-done.