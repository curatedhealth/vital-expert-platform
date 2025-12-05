# Evidence-Based Response Architecture - Visual Diagrams

**Author:** VITAL Data Strategist Agent
**Date:** 2025-12-02

---

## 1. High-Level Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER QUERY                                       │
│  "What are FDA IND requirements for a Phase 2 clinical trial?"          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    L3 EXPERT AGENT                                       │
│  (User-selected Regulatory Affairs Expert)                              │
│                                                                          │
│  Delegates to L4 Context Engineer for evidence gathering                │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    L4 CONTEXT ENGINEER                                   │
│  (Evidence Aggregation & Quality Scoring)                               │
│                                                                          │
│  Responsibilities:                                                       │
│  1. Dispatch queries to L5 tools in PARALLEL                            │
│  2. Apply 6-tier evidence quality scoring                               │
│  3. Deduplicate and rank findings                                       │
│  4. Synthesize unified context within token budget                      │
│  5. Store audit trail to l5_findings_audit table                        │
└──────────┬────────────────────┬────────────────────┬────────────────────┘
           │                    │                    │
           │ PARALLEL           │ PARALLEL           │ PARALLEL
           │ MANDATORY          │ MANDATORY          │ OPTIONAL
           ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  L5 RAG TOOL     │  │  L5 WEBSEARCH    │  │  L5 DOMAIN TOOLS │
│                  │  │  TOOL            │  │                  │
│  Internal KB     │  │                  │  │  - PubMed        │
│  - Regulatory    │  │  Authoritative   │  │  - FDA Database  │
│    SOPs          │  │  Domains:        │  │  - ClinTrials.gov│
│  - Clinical      │  │  - fda.gov       │  │  - EMA Database  │
│    Protocols     │  │  - ema.europa.eu │  │                  │
│  - Product       │  │  - pubmed.gov    │  │  (Query-specific)│
│    Monographs    │  │  - ich.org       │  │                  │
│                  │  │  - who.int       │  │                  │
│  Cost: $0       │  │  Cost: $0.005    │  │  Cost: Varies    │
│  Latency: 200ms  │  │  Latency: 500ms  │  │  Latency: 1-3s   │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         │ Findings            │ Findings            │ Findings
         │ with scores         │ with scores         │ with scores
         └─────────────────────┴─────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 EVIDENCE QUALITY SCORING                                 │
│                                                                          │
│  6-TIER HIERARCHY:                                                       │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ Tier 1: Regulatory (Score: 1.00)    ← FDA IND Guidance         │    │
│  │ Tier 2: Scientific (Score: 0.90)    ← PubMed Clinical Trial    │    │
│  │ Tier 3: Clinical Trial (Score: 0.88)← ClinicalTrials.gov       │    │
│  │ Tier 4: Health Authority (Score: 0.85)← CDC Guidelines          │    │
│  │ Tier 5: Internal RAG (Score: 0.80)  ← Internal SOP             │    │
│  │ Tier 6: General Web (Score: 0.40)   ← Industry Blog            │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  SCORING FORMULA:                                                        │
│  Evidence Score = (Source Quality × 0.40) +                             │
│                   (Relevance × 0.30) +                                   │
│                   (Recency × 0.15) +                                     │
│                   (Cross-Validation × 0.15)                              │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  RANKED EVIDENCE CONTEXT                                 │
│  (Deduplicated, scored, within token budget)                            │
│                                                                          │
│  [1] FDA IND Guidance (Quality: 0.97) ← Tier 1                          │
│  [2] PubMed Phase 2 Protocol (Quality: 0.88) ← Tier 2                   │
│  [3] Internal Phase 2 SOP (Quality: 0.81) ← Tier 5                      │
│  [4] ClinicalTrials.gov Examples (Quality: 0.85) ← Tier 3               │
│  [5] EMA IND Comparison (Quality: 0.95) ← Tier 1                        │
│                                                                          │
│  Total Evidence Quality: 0.89 (Excellent)                               │
│  Cross-Validation Rate: 80% (4/5 sources corroborate)                   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    L3 EXPERT RESPONSE                                    │
│  (Generated with citations and confidence score)                        │
│                                                                          │
│  "Based on FDA guidance [1] and recent clinical trial protocols [2],    │
│   Phase 2 IND requirements include:                                     │
│                                                                          │
│   1. Detailed protocol with endpoints [1][3]                            │
│   2. Investigator's brochure [1][5]                                     │
│   3. Manufacturing information [1]                                      │
│   4. Institutional review board approval [1][2]                         │
│   5. Informed consent procedures [1][4]                                 │
│                                                                          │
│   Confidence: 91% | Evidence Quality: 0.89 | Sources: 5                 │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   ARTIFACT GENERATION (Optional)                         │
│  (Mode 3 only: confidence > 0.75 AND sources >= 5)                      │
│                                                                          │
│  Artifact Type: Research Report                                         │
│  Title: "FDA Phase 2 IND Requirements - Comprehensive Guide"            │
│  Format: Narrative with sections                                        │
│  Export: PDF, DOCX available                                            │
│  Storage: artifacts table + S3                                          │
│  TTL: 1 year (compliance retention)                                     │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      AUDIT TRAIL STORAGE                                 │
│  (l5_findings_audit table for compliance)                               │
│                                                                          │
│  - All L5 findings stored with quality scores                           │
│  - Lineage: Query → Findings → Response → Artifact                      │
│  - Retention: 1 year minimum                                            │
│  - Enables: Audits, quality analysis, debugging                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Evidence Quality Scoring Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    L5 FINDING (Raw)                                      │
│  {                                                                       │
│    "source_tool": "websearch",                                          │
│    "title": "FDA IND Guidance",                                         │
│    "content": "The investigational new drug...",                        │
│    "relevance_score": 0.95,                                             │
│    "source_url": "https://www.fda.gov/...",                             │
│    "metadata": {"domain": "fda.gov", "published": "2024-01-15"}         │
│  }                                                                       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              STEP 1: SOURCE QUALITY ASSESSMENT (40%)                     │
│                                                                          │
│  Domain: fda.gov                                                         │
│  Source Type: regulatory                                                 │
│  Lookup in EVIDENCE_QUALITY_SCORES:                                     │
│    EVIDENCE_QUALITY_SCORES['regulatory']['fda.gov'] = 1.00              │
│                                                                          │
│  Source Quality Score: 1.00 × 0.40 = 0.40                               │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              STEP 2: RELEVANCE ASSESSMENT (30%)                          │
│                                                                          │
│  Relevance Score (from L5 tool): 0.95                                   │
│  (Semantic similarity between query and content)                        │
│                                                                          │
│  Relevance Contribution: 0.95 × 0.30 = 0.285                            │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              STEP 3: RECENCY ASSESSMENT (15%)                            │
│                                                                          │
│  Published: 2024-01-15                                                   │
│  Current: 2025-12-02                                                     │
│  Age: ~2 years                                                           │
│                                                                          │
│  Decay Rate (regulatory): 10% per year                                  │
│  Recency Score: 1.0 - (2 × 0.10) = 0.80                                 │
│                                                                          │
│  Recency Contribution: 0.80 × 0.15 = 0.12                               │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│          STEP 4: CROSS-VALIDATION ASSESSMENT (15%)                       │
│                                                                          │
│  Check if other L5 findings corroborate this information:               │
│  - L5 RAG Tool: Internal SOP mentions same requirements ✓               │
│  - L5 WebSearch: EMA guidance has similar requirements ✓                │
│  - L5 PubMed: Clinical trial protocols align ✓                          │
│                                                                          │
│  Corroborating Sources: 3                                               │
│  Cross-Validation Score: 1.0 (3+ sources)                               │
│                                                                          │
│  Cross-Validation Contribution: 1.0 × 0.15 = 0.15                       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 FINAL EVIDENCE QUALITY SCORE                             │
│                                                                          │
│  Overall Score = Source Quality + Relevance + Recency + Cross-Validation│
│                = 0.40 + 0.285 + 0.12 + 0.15                             │
│                = 0.955                                                   │
│                                                                          │
│  Evidence Quality: 0.96 (EXCELLENT)                                     │
│  Tier: 1 (Regulatory)                                                   │
│  Confidence: Use this source with high confidence                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. RAG Namespace Resolution Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AGENT QUERY                                         │
│  Agent: "FDA Regulatory Strategist" (agent_id: abc-123)                 │
│  Query: "What are GMP requirements for sterile manufacturing?"          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│       STEP 1: CHECK AGENT-SPECIFIC NAMESPACES (Highest Priority)        │
│                                                                          │
│  Query: agents.metadata.knowledge_namespaces WHERE id = 'abc-123'       │
│                                                                          │
│  Result: ['regulatory-fda', 'regulatory-ema', 'quality-gmp']            │
│                                                                          │
│  ✓ FOUND → USE THESE NAMESPACES                                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼ (if not found)
┌─────────────────────────────────────────────────────────────────────────┐
│       STEP 2: CHECK ROLE-BASED NAMESPACES (Inherited)                   │
│                                                                          │
│  Query: org_roles.metadata.default_namespaces                           │
│    WHERE role_id = (SELECT role_id FROM agent_roles WHERE agent_id...)  │
│                                                                          │
│  Result: ['regulatory-fda', 'regulatory-ich']                           │
│                                                                          │
│  ✓ FOUND → USE THESE NAMESPACES                                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼ (if not found)
┌─────────────────────────────────────────────────────────────────────────┐
│       STEP 3: DOMAIN-BASED NAMESPACES (Fallback)                        │
│                                                                          │
│  Agent Knowledge Domains: ['Regulatory Affairs', 'Quality Assurance']   │
│                                                                          │
│  Lookup in DOMAIN_DEFAULT_NAMESPACES:                                   │
│    'Regulatory Affairs' → ['regulatory-fda', 'regulatory-ema',          │
│                            'regulatory-ich']                             │
│    'Quality Assurance' → ['quality-gmp', 'quality-iso',                 │
│                           'internal-sops']                               │
│                                                                          │
│  Merged Result: ['regulatory-fda', 'regulatory-ema', 'regulatory-ich',  │
│                  'quality-gmp', 'quality-iso', 'internal-sops']         │
│                                                                          │
│  ✓ USE THESE NAMESPACES                                                 │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼ (if still not found)
┌─────────────────────────────────────────────────────────────────────────┐
│       STEP 4: GENERAL FALLBACK                                          │
│                                                                          │
│  Default: ['general-knowledge', 'internal-wiki']                        │
│                                                                          │
│  ⚠️  WARNING: Agent should have more specific namespaces assigned       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                  FINAL RESOLVED NAMESPACES                               │
│                                                                          │
│  Used for L5 RAG Tool:                                                  │
│  ['regulatory-fda', 'regulatory-ema', 'quality-gmp']                    │
│                                                                          │
│  Priority: Agent-Specific (Step 1)                                      │
│  Confidence: High (exact match to agent domain)                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Artifact Generation Decision Tree

```
                        ┌──────────────┐
                        │ Mode 1 Query │
                        └──────┬───────┘
                               │
                ┌──────────────▼──────────────┐
                │ Is confidence > 0.70?       │
                └──────┬──────────────┬───────┘
                       │              │
                     YES             NO
                       │              │
                ┌──────▼───────┐      └──────► NO ARTIFACT
                │ Are sources  │
                │   >= 2?      │
                └──────┬───────┘
                       │
                ┌──────▼──────┐
                │ Evidence    │
                │ Quality     │
                │ > 0.70?     │
                └──────┬──────┘
                       │
                      YES
                       │
         ┌─────────────▼─────────────┐
         │  GENERATE REFERENCE CARD  │
         │  - Format: Structured     │
         │  - Max: 2000 tokens       │
         │  - TTL: 30 days           │
         └───────────────────────────┘


                        ┌──────────────┐
                        │ Mode 3 Query │
                        └──────┬───────┘
                               │
                ┌──────────────▼──────────────┐
                │ Is confidence > 0.75?       │
                └──────┬──────────────┬───────┘
                       │              │
                     YES             NO
                       │              │
                ┌──────▼───────┐      └──────► NO ARTIFACT
                │ Are sources  │
                │   >= 5?      │
                └──────┬───────┘
                       │
                ┌──────▼──────┐
                │ Evidence    │
                │ Quality     │
                │ > 0.75?     │
                └──────┬──────┘
                       │
                      YES
                       │
                ┌──────▼──────────┐
                │ Is query type   │
                │ research-worthy?│
                │ (analysis,      │
                │  strategy,      │
                │  design)        │
                └──────┬──────────┘
                       │
                      YES
                       │
         ┌─────────────▼──────────────┐
         │  GENERATE RESEARCH REPORT  │
         │  - Format: Narrative       │
         │  - Max: 8000 tokens        │
         │  - TTL: 1 year             │
         │  - Export: PDF, DOCX       │
         └────────────────────────────┘
```

---

## 5. Database Schema - Audit Trail

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      l5_findings_audit                                   │
├──────────────────┬──────────────────┬───────────────────────────────────┤
│ Column           │ Type             │ Description                        │
├──────────────────┼──────────────────┼───────────────────────────────────┤
│ id               │ UUID             │ Primary key                        │
│ session_id       │ UUID             │ FK → sessions.id                   │
│ conversation_id  │ UUID             │ FK → conversation_turns.id         │
│ agent_id         │ UUID             │ FK → agents.id                     │
│ l5_tool_type     │ TEXT             │ 'rag', 'websearch', 'pubmed'       │
│ l5_exec_time_ms  │ INT              │ Tool execution time                │
│ l5_success       │ BOOLEAN          │ Tool execution success             │
│ finding          │ JSONB            │ Full L5Finding object              │
│ evidence_score   │ JSONB            │ EvidenceScore breakdown            │
│ query            │ TEXT             │ Original query                     │
│ tenant_id        │ UUID             │ Tenant ID                          │
│ created_at       │ TIMESTAMPTZ      │ Timestamp                          │
└──────────────────┴──────────────────┴───────────────────────────────────┘
                               │
                               │ 1:N relationship
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         artifacts                                        │
├──────────────────┬──────────────────┬───────────────────────────────────┤
│ Column           │ Type             │ Description                        │
├──────────────────┼──────────────────┼───────────────────────────────────┤
│ id               │ UUID             │ Primary key                        │
│ session_id       │ UUID             │ FK → sessions.id                   │
│ conversation_id  │ UUID             │ FK → conversation_turns.id         │
│ agent_id         │ UUID             │ FK → agents.id                     │
│ artifact_type    │ TEXT             │ 'reference_card', 'research_report'│
│ title            │ TEXT             │ Artifact title                     │
│ format           │ TEXT             │ 'structured', 'narrative'          │
│ content          │ JSONB            │ Full artifact JSON                 │
│ confidence       │ FLOAT            │ Generation confidence              │
│ evidence_sources │ INT              │ Number of sources                  │
│ evidence_quality │ FLOAT            │ Average quality score              │
│ pdf_url          │ TEXT             │ S3 URL for PDF export              │
│ docx_url         │ TEXT             │ S3 URL for DOCX export             │
│ tenant_id        │ UUID             │ Tenant ID                          │
│ created_at       │ TIMESTAMPTZ      │ Creation timestamp                 │
│ archived_at      │ TIMESTAMPTZ      │ Archive timestamp (TTL)            │
└──────────────────┴──────────────────┴───────────────────────────────────┘
                               │
                               │ M:N relationship
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      artifact_findings                                   │
├──────────────────┬──────────────────┬───────────────────────────────────┤
│ Column           │ Type             │ Description                        │
├──────────────────┼──────────────────┼───────────────────────────────────┤
│ artifact_id      │ UUID             │ FK → artifacts.id                  │
│ l5_finding_id    │ UUID             │ FK → l5_findings_audit.id          │
│ citation_number  │ TEXT             │ "[1]", "[2]", etc.                 │
└──────────────────┴──────────────────┴───────────────────────────────────┘

QUERY EXAMPLE:
-- Get all evidence sources for an artifact
SELECT
  af.citation_number,
  l5.l5_tool_type,
  l5.finding->>'title' as title,
  l5.finding->>'source_url' as url,
  l5.evidence_score->>'overall_score' as quality
FROM artifact_findings af
JOIN l5_findings_audit l5 ON af.l5_finding_id = l5.id
WHERE af.artifact_id = 'artifact-uuid-here'
ORDER BY af.citation_number;
```

---

## 6. Cost Optimization Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      QUERY RECEIVED                                      │
│  "What are FDA 510(k) requirements?"                                    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              STEP 1: CHECK L5 RESULT CACHE                               │
│                                                                          │
│  Cache Key: l5:query_hash:rag:namespaces                               │
│  TTL: 24 hours                                                          │
│                                                                          │
│  ┌─────────────┐                                                         │
│  │ Cache Hit?  │                                                         │
│  └──────┬──────┘                                                         │
│         │                                                                │
│    YES  │  NO                                                            │
│     ↓   │   ↓                                                            │
│  RETURN │ EXECUTE L5 TOOL                                                │
│  CACHED │ (Save to cache)                                                │
│         │                                                                │
│  COST: $0.00   COST: $0.005 (WebSearch)                                │
│  TIME: 50ms    TIME: 500ms                                              │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              STEP 2: INTELLIGENT TOOL SELECTION                          │
│                                                                          │
│  Query Analysis:                                                        │
│  - Contains "FDA" → High RAG likelihood                                 │
│  - Regulatory query → Likely in internal knowledge base                 │
│                                                                          │
│  Decision:                                                              │
│  ┌────────────────────────────────────────┐                             │
│  │ If Mode 1 + High RAG Coverage:        │                             │
│  │   - Run RAG only (skip WebSearch)     │                             │
│  │   - Save $0.005 per query              │                             │
│  │   - Reduce latency by 500ms            │                             │
│  └────────────────────────────────────────┘                             │
│                                                                          │
│  ┌────────────────────────────────────────┐                             │
│  │ If Mode 3 OR Low RAG Coverage:        │                             │
│  │   - Run RAG + WebSearch (both)         │                             │
│  │   - Cost: $0.005                        │                             │
│  │   - Higher evidence quality             │                             │
│  └────────────────────────────────────────┘                             │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              STEP 3: TOKEN BUDGET OPTIMIZATION                           │
│                                                                          │
│  Total Findings: 15 (from RAG + WebSearch)                              │
│  Token Budget: 4000 tokens                                              │
│                                                                          │
│  Prioritization:                                                        │
│  1. Sort by evidence quality score (descending)                         │
│  2. Include findings until budget exhausted                             │
│  3. Ensure diversity (1+ finding per source type)                       │
│                                                                          │
│  Selected Findings: 8 (fits in 4000 tokens)                             │
│  Dropped Findings: 7 (low quality or redundant)                         │
│                                                                          │
│  SAVINGS: Reduced LLM input tokens by 40%                               │
│           Reduced L3 agent cost by $0.02                                │
└─────────────────────────────────────────────────────────────────────────┘

TOTAL SAVINGS PER QUERY:
- Cache Hit: $0.005 + 500ms latency
- Smart Tool Selection: $0.005 + 500ms latency (Mode 1 only)
- Token Optimization: $0.02 in LLM cost

AGGREGATE SAVINGS (10,000 queries/month):
- Cache (40% hit rate): $20/month
- Smart Tools (30% of Mode 1): $15/month
- Token Optimization: $200/month
- TOTAL: $235/month (20% reduction)
```

---

## 7. Monitoring Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  EVIDENCE QUALITY DASHBOARD                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │ EVIDENCE QUALITY BY TIER (Last 7 Days)                        │     │
│  │                                                                │     │
│  │  Tier 1 (Regulatory):    ████████████████ 0.95 (450 queries)  │     │
│  │  Tier 2 (Scientific):    ███████████████  0.88 (320 queries)  │     │
│  │  Tier 3 (Clinical):      ██████████████   0.85 (210 queries)  │     │
│  │  Tier 4 (Health Auth):   ███████████      0.82 (180 queries)  │     │
│  │  Tier 5 (Internal RAG):  ██████████       0.78 (890 queries)  │     │
│  │  Tier 6 (General Web):   ████████         0.65 (110 queries)  │     │
│  │                                                                │     │
│  │  Overall Average: 0.82 (Target: > 0.75) ✓                     │     │
│  └────────────────────────────────────────────────────────────────     │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │ L5 TOOL PERFORMANCE                                            │     │
│  │                                                                │     │
│  │  RAG Tool:                                                     │     │
│  │    - Avg Latency: 220ms                                        │     │
│  │    - Success Rate: 98.5%                                       │     │
│  │    - Cost: $0.00                                               │     │
│  │    - Cache Hit Rate: 42%                                       │     │
│  │                                                                │     │
│  │  WebSearch Tool:                                               │     │
│  │    - Avg Latency: 480ms                                        │     │
│  │    - Success Rate: 95.2%                                       │     │
│  │    - Cost: $0.005/query                                        │     │
│  │    - Cache Hit Rate: 38%                                       │     │
│  │                                                                │     │
│  │  PubMed Tool:                                                  │     │
│  │    - Avg Latency: 1200ms                                       │     │
│  │    - Success Rate: 92.0%                                       │     │
│  │    - Cost: $0.008/query                                        │     │
│  └────────────────────────────────────────────────────────────────     │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │ ARTIFACT GENERATION                                            │     │
│  │                                                                │     │
│  │  Mode 1 Reference Cards:  45/day (avg confidence: 0.78)       │     │
│  │  Mode 3 Research Reports: 18/day (avg confidence: 0.86)       │     │
│  │                                                                │     │
│  │  Artifact Quality (User Ratings):                             │     │
│  │    5 stars: 65%                                                │     │
│  │    4 stars: 28%                                                │     │
│  │    3 stars:  5%                                                │     │
│  │    < 3 stars: 2%                                               │     │
│  │                                                                │     │
│  │  Avg Quality: 4.6/5.0 (Target: > 4.0) ✓                       │     │
│  └────────────────────────────────────────────────────────────────     │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │ COST ANALYSIS                                                  │     │
│  │                                                                │     │
│  │  Total Queries: 12,450/month                                  │     │
│  │  Total Cost: $1,247/month                                     │     │
│  │  Avg Cost/Query: $0.10                                        │     │
│  │                                                                │     │
│  │  Savings from Caching: $235/month (20% reduction)             │     │
│  │                                                                │     │
│  │  Cost Breakdown:                                               │     │
│  │    - L5 Tools: $125 (10%)                                      │     │
│  │    - L3 Agents: $1,122 (90%)                                   │     │
│  └────────────────────────────────────────────────────────────────     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

**Document Status:** Visual Architecture Diagrams
**Companion Documents:**
- `DATA_STRATEGY_EVIDENCE_BASED_RESPONSES.md` (Full strategy)
- `EVIDENCE_STRATEGY_EXECUTIVE_SUMMARY.md` (Executive summary)
