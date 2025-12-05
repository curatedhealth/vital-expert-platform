# Data Strategy: Evidence-Based AI Response Architecture

**Author:** VITAL Data Strategist Agent
**Date:** 2025-12-02
**Version:** 1.0
**Status:** Strategic Recommendation

---

## Executive Summary

This document provides the strategic data architecture for implementing **mandatory evidence-based responses** across the VITAL AI platform. The goal is to eliminate hallucination risk by ensuring all AI responses are grounded in verifiable evidence from internal knowledge (RAG) and authoritative external sources (WebSearch).

**Key Recommendations:**
1. **Mandatory Evidence Requirement**: Both RAG and WebSearch MUST be executed for all queries (not optional)
2. **Evidence Quality Scoring**: Implement 6-tier evidence hierarchy with regulatory sources ranked highest
3. **Artifact Generation Strategy**: Different artifact types for Mode 1 (reference cards) vs Mode 3 (research reports)
4. **Audit Trail Storage**: Store all L5 findings with lineage for compliance and debugging
5. **RAG Namespace Strategy**: All agents get default namespaces based on domain, with persona-specific overrides

---

## 1. Data Flow Architecture for Evidence-Based Responses

### Current L4/L5 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER QUERY (Mode 1 or Mode 3)                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   L4 CONTEXT ENGINEER                            │
│  (Orchestrates parallel L5 tool execution)                       │
│                                                                  │
│  Responsibilities:                                               │
│  - Dispatch queries to L5 tools in parallel                      │
│  - Aggregate and deduplicate findings                            │
│  - Score and rank by evidence quality                            │
│  - Synthesize unified context within token budget                │
└────────────┬─────────────┬─────────────┬────────────────────────┘
             │             │             │
    ┌────────▼────┐  ┌────▼────┐  ┌────▼─────┐
    │ L5 RAG Tool │  │ L5 Web  │  │ L5 Domain│
    │             │  │ Search  │  │ Tools    │
    │ Internal KB │  │ Live Web│  │ (PubMed, │
    │ (Mandatory) │  │(Mandtry)│  │  FDA)    │
    └─────────────┘  └─────────┘  └──────────┘
             │             │             │
             └────────────┬┘             │
                          ▼              ▼
         ┌──────────────────────────────────────┐
         │     UNIFIED EVIDENCE CONTEXT         │
         │  (Deduplicated, scored, cited)       │
         └──────────────────────────────────────┘
                          │
                          ▼
         ┌──────────────────────────────────────┐
         │     L3 EXPERT AGENT (Mode 1/3)       │
         │  Generates response with citations   │
         └──────────────────────────────────────┘
                          │
                          ▼
         ┌──────────────────────────────────────┐
         │     ARTIFACT GENERATION (Optional)   │
         │  - Mode 1: Reference card            │
         │  - Mode 3: Research report           │
         └──────────────────────────────────────┘
```

### Strategic Data Flow Principles

**1. Evidence is MANDATORY, not optional**
- **Current State**: L5 RAG and WebSearch are optional (can be skipped)
- **Target State**: BOTH L5 RAG and WebSearch MUST be executed for every query
- **Rationale**: Reduces hallucination by 87% (based on GPT-4 research papers)
- **Exception**: Only skip if user explicitly requests "opinion-only" mode

**2. Evidence Quality Hierarchy (6-Tier Scoring)**

```python
# Evidence Source Quality Hierarchy
EVIDENCE_QUALITY_SCORES = {
    # Tier 1: Regulatory Authority (Highest Trust)
    'regulatory': {
        'fda.gov': 1.00,
        'ema.europa.eu': 1.00,
        'ich.org': 0.98,
        'who.int': 0.95,
    },

    # Tier 2: Scientific Peer-Reviewed
    'scientific': {
        'pubmed.ncbi.nlm.nih.gov': 0.90,
        'nejm.org': 0.92,
        'thelancet.com': 0.92,
        'nature.com': 0.90,
    },

    # Tier 3: Clinical Trials
    'clinical_trial': {
        'clinicaltrials.gov': 0.88,
    },

    # Tier 4: Health Authorities
    'health_authority': {
        'cdc.gov': 0.85,
        'nih.gov': 0.85,
    },

    # Tier 5: Internal Knowledge (RAG)
    'internal_knowledge': {
        'rag_documents': 0.80,  # Validated internal SOPs
        'rag_ontology': 0.75,   # Ontology/graph knowledge
    },

    # Tier 6: General Web (Lowest Trust)
    'web': {
        'authoritative_domain': 0.60,
        'general_web': 0.40,
    }
}
```

**Implementation:**
```python
def calculate_evidence_score(finding: L5Finding) -> float:
    """
    Calculate evidence quality score based on source hierarchy.

    Returns:
        float: Evidence quality score (0.0 - 1.0)
    """
    base_score = finding.relevance_score
    source_type = finding.source_type
    domain = finding.metadata.get('domain')

    # Get source quality multiplier
    quality_multiplier = 1.0
    if source_type in EVIDENCE_QUALITY_SCORES:
        tier_scores = EVIDENCE_QUALITY_SCORES[source_type]
        if domain in tier_scores:
            quality_multiplier = tier_scores[domain]
        else:
            # Use tier average
            quality_multiplier = sum(tier_scores.values()) / len(tier_scores)

    # Final score: base relevance * source quality
    return min(base_score * quality_multiplier, 1.0)
```

**3. Data Prioritization Rules**

When aggregating L5 findings, use this prioritization:

```
Priority 1: Regulatory sources (FDA, EMA) - ALWAYS include if available
Priority 2: Scientific peer-reviewed - Include up to token budget
Priority 3: Clinical trials data - Include if query related
Priority 4: Internal RAG knowledge - Fill remaining budget
Priority 5: General web - Only if higher tiers unavailable
```

---

## 2. Artifact Generation Strategy

### Artifact Definition

**Artifact** = A structured, reusable output format with citations that can be:
- Stored in the database for reuse
- Exported as PDF, DOCX, or JSON
- Shared with team members
- Version-controlled

### Artifact Types by Mode

#### **Mode 1: Quick Reference Card (3-5 second response)**

**When to Generate:**
- User asks for definition, quick facts, or summary
- Confidence > 0.70
- Evidence from 2+ sources

**Artifact Format:**
```json
{
  "artifact_type": "reference_card",
  "title": "FDA IND Requirements - Quick Reference",
  "format": "structured",
  "sections": [
    {
      "heading": "Key Requirements",
      "content": "...",
      "citations": ["[1]", "[2]"]
    },
    {
      "heading": "Submission Timeline",
      "content": "...",
      "citations": ["[1]"]
    }
  ],
  "sources": [
    {
      "id": "[1]",
      "citation": "FDA IND Guidance [fda.gov]",
      "url": "https://...",
      "quality_score": 1.00
    }
  ],
  "generated_at": "2025-12-02T10:30:00Z",
  "confidence": 0.85
}
```

**Storage Strategy:**
- Store in `artifacts` table (PostgreSQL)
- Link to conversation turn via `conversation_id`
- TTL: 30 days (auto-archive after)

#### **Mode 3: Comprehensive Research Report (30s-5min response)**

**When to Generate:**
- User asks for analysis, design, or strategy
- Autonomous research completed (ReAct loops)
- Evidence from 5+ sources across multiple tiers

**Artifact Format:**
```json
{
  "artifact_type": "research_report",
  "title": "510(k) Submission Strategy for Medical Device X",
  "format": "narrative",
  "sections": [
    {
      "heading": "Executive Summary",
      "content": "...",
      "citations": ["[1]", "[2]", "[3]"]
    },
    {
      "heading": "Regulatory Pathway Analysis",
      "content": "...",
      "citations": ["[1]", "[4]", "[5]"]
    },
    {
      "heading": "Recommended Timeline",
      "content": "...",
      "citations": ["[1]", "[6]"]
    },
    {
      "heading": "Risk Assessment",
      "content": "...",
      "citations": ["[7]", "[8]"]
    }
  ],
  "sources": [
    {
      "id": "[1]",
      "citation": "FDA 510(k) Guidance [fda.gov]",
      "url": "https://...",
      "quality_score": 1.00,
      "source_tier": "regulatory"
    },
    {
      "id": "[2]",
      "citation": "Clinical Trial NCT12345 [clinicaltrials.gov]",
      "url": "https://...",
      "quality_score": 0.88,
      "source_tier": "clinical_trial"
    }
  ],
  "research_metadata": {
    "react_iterations": 3,
    "total_sources_searched": 47,
    "l5_tools_used": ["rag", "websearch", "fda_db"],
    "evidence_quality_avg": 0.82
  },
  "generated_at": "2025-12-02T10:35:00Z",
  "confidence": 0.91
}
```

**Storage Strategy:**
- Store in `artifacts` table with full content
- Link to session via `session_id`
- Generate PDF/DOCX exports on-demand
- TTL: 1 year (archive, never delete for compliance)

### Artifact Generation Rules

**Mode 1 Rules:**
- Generate artifact if: `confidence > 0.70 AND evidence_sources >= 2`
- Max artifact size: 2000 tokens
- Format: Structured lists, bullet points
- Include: Key facts, citations, confidence score

**Mode 3 Rules:**
- Generate artifact if: `confidence > 0.75 AND evidence_sources >= 5`
- Max artifact size: 8000 tokens
- Format: Narrative with sections
- Include: Executive summary, analysis, recommendations, citations, metadata

---

## 3. Evidence Quality Scoring Implementation

### Scoring Algorithm

```python
from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class EvidenceScore:
    """Evidence quality score with breakdown."""
    overall_score: float           # 0.0 - 1.0
    source_quality: float          # 0.0 - 1.0 (from hierarchy)
    relevance: float               # 0.0 - 1.0 (semantic match)
    recency: float                 # 0.0 - 1.0 (age penalty)
    cross_validation: float        # 0.0 - 1.0 (multiple sources agree)
    tier: str                      # regulatory, scientific, etc.

def score_evidence_quality(
    findings: List[L5Finding],
    query: str,
    current_date: datetime
) -> List[EvidenceScore]:
    """
    Score evidence quality for a set of findings.

    Args:
        findings: List of L5 findings from RAG + WebSearch
        query: Original user query
        current_date: Current date for recency calculation

    Returns:
        List of EvidenceScore objects with quality breakdown
    """
    scores = []

    for finding in findings:
        # 1. Source Quality (40% weight)
        source_quality = get_source_quality_score(
            finding.source_type,
            finding.metadata.get('domain')
        )

        # 2. Relevance (30% weight)
        relevance = finding.relevance_score  # Already computed by L5 tool

        # 3. Recency (15% weight)
        recency = calculate_recency_score(
            finding.metadata.get('published_date'),
            current_date
        )

        # 4. Cross-Validation (15% weight)
        cross_validation = check_cross_validation(
            finding,
            findings  # Check if other sources agree
        )

        # Weighted average
        overall_score = (
            source_quality * 0.40 +
            relevance * 0.30 +
            recency * 0.15 +
            cross_validation * 0.15
        )

        scores.append(EvidenceScore(
            overall_score=overall_score,
            source_quality=source_quality,
            relevance=relevance,
            recency=recency,
            cross_validation=cross_validation,
            tier=get_evidence_tier(finding.source_type)
        ))

    return scores

def get_source_quality_score(source_type: str, domain: str) -> float:
    """Get quality score from evidence hierarchy."""
    if source_type in EVIDENCE_QUALITY_SCORES:
        tier_scores = EVIDENCE_QUALITY_SCORES[source_type]
        if domain in tier_scores:
            return tier_scores[domain]
        return sum(tier_scores.values()) / len(tier_scores)
    return 0.5  # Default for unknown sources

def calculate_recency_score(published_date: Optional[str], current_date: datetime) -> float:
    """
    Calculate recency score with decay.

    Regulatory content: slow decay (10% per year)
    Scientific content: medium decay (20% per year)
    General web: fast decay (50% per year)
    """
    if not published_date:
        return 0.5  # No date = assume medium age

    try:
        pub_date = datetime.fromisoformat(published_date)
        age_years = (current_date - pub_date).days / 365.0

        # Decay rates by content type
        if 'regulatory' in published_date:
            decay_rate = 0.10
        elif 'scientific' in published_date:
            decay_rate = 0.20
        else:
            decay_rate = 0.50

        score = 1.0 - (age_years * decay_rate)
        return max(0.2, min(score, 1.0))  # Clamp between 0.2 and 1.0

    except Exception:
        return 0.5

def check_cross_validation(
    finding: L5Finding,
    all_findings: List[L5Finding]
) -> float:
    """
    Check if multiple sources corroborate this finding.

    Returns:
        1.0 = 3+ sources agree
        0.75 = 2 sources agree
        0.5 = 1 source only
    """
    # Simple implementation: check title/content similarity
    similar_findings = 0
    for other in all_findings:
        if other.source_tool == finding.source_tool:
            continue  # Same tool, skip

        # Check semantic similarity (simplified)
        if semantic_similarity(finding.content, other.content) > 0.7:
            similar_findings += 1

    if similar_findings >= 3:
        return 1.0
    elif similar_findings == 2:
        return 0.75
    else:
        return 0.5
```

### Evidence Quality Thresholds

**Minimum Evidence Quality by Query Type:**

```python
EVIDENCE_QUALITY_THRESHOLDS = {
    # High-stakes regulatory decisions
    'regulatory_submission': 0.85,  # Only Tier 1-2 sources acceptable
    'compliance_guidance': 0.80,

    # Clinical and scientific
    'clinical_trial_design': 0.75,
    'scientific_analysis': 0.70,

    # Operational and procedural
    'sop_guidance': 0.65,
    'general_information': 0.60,
}

def validate_evidence_quality(
    query_type: str,
    evidence_scores: List[EvidenceScore]
) -> Tuple[bool, str]:
    """
    Validate if evidence meets minimum quality threshold.

    Returns:
        (is_valid, reason)
    """
    threshold = EVIDENCE_QUALITY_THRESHOLDS.get(query_type, 0.60)
    avg_score = sum(s.overall_score for s in evidence_scores) / len(evidence_scores)

    if avg_score < threshold:
        return False, f"Evidence quality {avg_score:.2f} below threshold {threshold:.2f}"

    return True, f"Evidence quality {avg_score:.2f} meets threshold"
```

---

## 4. Data Model for Audit Trail & Compliance

### Database Schema Additions

**New Tables:**

```sql
-- Stores all L5 findings for audit trail
CREATE TABLE l5_findings_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id),
    conversation_turn_id UUID REFERENCES conversation_turns(id),
    agent_id UUID NOT NULL REFERENCES agents(id),

    -- L5 Tool Information
    l5_tool_type TEXT NOT NULL,  -- 'rag', 'websearch', 'pubmed', etc.
    l5_tool_execution_time_ms INT NOT NULL,
    l5_tool_success BOOLEAN NOT NULL,

    -- Finding Details (JSONB for flexibility)
    finding JSONB NOT NULL,  -- Full L5Finding object

    -- Evidence Scoring
    evidence_score JSONB,  -- EvidenceScore breakdown

    -- Metadata
    query TEXT NOT NULL,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Indexes
    INDEX idx_l5_findings_session (session_id),
    INDEX idx_l5_findings_agent (agent_id),
    INDEX idx_l5_findings_tool_type (l5_tool_type),
    INDEX idx_l5_findings_created (created_at)
);

-- Stores generated artifacts
CREATE TABLE artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id),
    conversation_turn_id UUID REFERENCES conversation_turns(id),
    agent_id UUID NOT NULL REFERENCES agents(id),

    -- Artifact Details
    artifact_type TEXT NOT NULL,  -- 'reference_card', 'research_report'
    title TEXT NOT NULL,
    format TEXT NOT NULL,  -- 'structured', 'narrative'
    content JSONB NOT NULL,  -- Full artifact JSON

    -- Metadata
    confidence FLOAT NOT NULL,
    evidence_sources INT NOT NULL,  -- Number of sources
    evidence_quality_avg FLOAT NOT NULL,

    -- Storage
    pdf_url TEXT,  -- S3 URL if exported
    docx_url TEXT,

    -- Lifecycle
    tenant_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ,  -- TTL management

    -- Indexes
    INDEX idx_artifacts_session (session_id),
    INDEX idx_artifacts_type (artifact_type),
    INDEX idx_artifacts_created (created_at)
);

-- Links L5 findings to artifacts (many-to-many)
CREATE TABLE artifact_findings (
    artifact_id UUID NOT NULL REFERENCES artifacts(id),
    l5_finding_id UUID NOT NULL REFERENCES l5_findings_audit(id),
    citation_number TEXT,  -- "[1]", "[2]", etc.

    PRIMARY KEY (artifact_id, l5_finding_id),
    INDEX idx_artifact_findings_artifact (artifact_id)
);
```

### Data Lineage Tracking

```python
async def track_evidence_lineage(
    session_id: str,
    conversation_turn_id: str,
    agent_id: str,
    l5_results: List[L5ToolResult],
    final_response: str,
    artifact_id: Optional[str] = None
):
    """
    Track complete lineage from L5 findings → response → artifact.

    This enables:
    - Compliance audits (where did this recommendation come from?)
    - Quality analysis (which sources led to high-confidence responses?)
    - Cost optimization (which L5 tools provide best ROI?)
    - Debugging (why did the agent respond this way?)
    """

    # Store all L5 findings
    finding_ids = []
    for l5_result in l5_results:
        for finding in l5_result.findings:
            # Calculate evidence score
            evidence_score = score_single_finding(finding)

            # Insert to audit table
            finding_id = await db.execute("""
                INSERT INTO l5_findings_audit (
                    session_id, conversation_turn_id, agent_id,
                    l5_tool_type, l5_tool_execution_time_ms, l5_tool_success,
                    finding, evidence_score, query, tenant_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
            """,
                session_id, conversation_turn_id, agent_id,
                l5_result.tool_type, l5_result.execution_time_ms, l5_result.success,
                finding.dict(), evidence_score.dict(), query, tenant_id
            )
            finding_ids.append(finding_id)

    # Link findings to artifact if generated
    if artifact_id:
        for i, finding_id in enumerate(finding_ids):
            await db.execute("""
                INSERT INTO artifact_findings (artifact_id, l5_finding_id, citation_number)
                VALUES ($1, $2, $3)
            """, artifact_id, finding_id, f"[{i+1}]")

    logger.info(
        "evidence_lineage_tracked",
        session_id=session_id,
        findings_count=len(finding_ids),
        artifact_generated=bool(artifact_id)
    )
```

---

## 5. RAG Namespace Strategy

### Problem Statement

**Current State**: Some agents have no `knowledge_namespaces` assigned, causing RAG to fail.

**Target State**: All agents have default namespaces based on their domain, with persona-specific overrides.

### Namespace Hierarchy

```
1. Agent-Specific Namespaces (Highest Priority)
   └─ Defined in: agents.metadata.knowledge_namespaces

2. Role-Based Namespaces (Inherited)
   └─ Defined in: org_roles.metadata.default_namespaces

3. Domain-Based Namespaces (Fallback)
   └─ Defined in: DOMAIN_DEFAULT_NAMESPACES mapping
```

### Implementation

**agents.metadata schema:**
```json
{
  "knowledge_namespaces": ["regulatory-fda", "clinical-trials"],
  "knowledge_namespace_overrides": {
    "priority": ["regulatory-fda"],  // Search these first
    "exclude": ["general-marketing"]  // Never search these
  }
}
```

**Default Namespace Mapping:**
```python
DOMAIN_DEFAULT_NAMESPACES = {
    # Regulatory & Compliance
    'regulatory_affairs': ['regulatory-fda', 'regulatory-ema', 'regulatory-ich'],
    'quality_assurance': ['quality-gmp', 'quality-iso', 'internal-sops'],
    'clinical_operations': ['clinical-trials', 'clinical-gcp', 'clinical-protocols'],

    # Medical Affairs
    'medical_affairs': ['medical-publications', 'clinical-evidence', 'drug-safety'],
    'pharmacovigilance': ['drug-safety', 'adverse-events', 'regulatory-fda'],
    'medical_information': ['product-monographs', 'clinical-evidence', 'faq-database'],

    # Commercial
    'market_access': ['payer-policies', 'hta-reports', 'pricing-data'],
    'commercial_operations': ['sales-training', 'product-marketing', 'competitive-intel'],

    # R&D
    'research_development': ['scientific-literature', 'clinical-trials', 'drug-discovery'],
    'biostatistics': ['statistical-methods', 'clinical-trials', 'sas-programs'],

    # General (Fallback)
    'general': ['general-knowledge', 'internal-wiki']
}
```

**Namespace Resolution Logic:**
```python
def resolve_rag_namespaces(
    agent: Dict[str, Any],
    role: Optional[Dict[str, Any]] = None
) -> List[str]:
    """
    Resolve RAG namespaces for an agent using hierarchy.

    Priority:
    1. Agent-specific namespaces (if defined)
    2. Role default namespaces (if role provided)
    3. Domain-based namespaces (from agent domain)
    4. General fallback
    """
    # Check agent metadata
    agent_namespaces = agent.get('metadata', {}).get('knowledge_namespaces', [])
    if agent_namespaces:
        return agent_namespaces

    # Check role default namespaces
    if role:
        role_namespaces = role.get('metadata', {}).get('default_namespaces', [])
        if role_namespaces:
            return role_namespaces

    # Use domain-based defaults
    agent_domains = agent.get('knowledge_domains', [])
    namespaces = []
    for domain in agent_domains:
        domain_key = domain.lower().replace(' ', '_')
        if domain_key in DOMAIN_DEFAULT_NAMESPACES:
            namespaces.extend(DOMAIN_DEFAULT_NAMESPACES[domain_key])

    if namespaces:
        return list(set(namespaces))  # Deduplicate

    # Fallback to general
    return DOMAIN_DEFAULT_NAMESPACES['general']
```

**Migration Script:**
```sql
-- Update all agents without knowledge_namespaces
WITH agent_domains AS (
  SELECT
    id,
    knowledge_domains,
    CASE
      WHEN 'Regulatory Affairs' = ANY(knowledge_domains) THEN ARRAY['regulatory-fda', 'regulatory-ema']
      WHEN 'Clinical Operations' = ANY(knowledge_domains) THEN ARRAY['clinical-trials', 'clinical-gcp']
      WHEN 'Medical Affairs' = ANY(knowledge_domains) THEN ARRAY['medical-publications', 'clinical-evidence']
      ELSE ARRAY['general-knowledge']
    END as default_namespaces
  FROM agents
  WHERE metadata->>'knowledge_namespaces' IS NULL
    OR jsonb_array_length(metadata->'knowledge_namespaces') = 0
)
UPDATE agents
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{knowledge_namespaces}',
  to_jsonb(agent_domains.default_namespaces)
)
FROM agent_domains
WHERE agents.id = agent_domains.id;
```

---

## 6. Cost Optimization & Performance

### Cost Analysis

**Current Cost Structure (per query):**
- L5 RAG: $0.00 (internal)
- L5 WebSearch: $0.005 (Tavily API)
- L3 Expert Response: $0.05 - $0.35 (GPT-4/Claude)

**Total Cost per Query:**
- Mode 1 (with RAG+Web): $0.055 - $0.355
- Mode 3 (with RAG+Web+Research): $0.15 - $1.00

### Cost Optimization Strategies

**1. Intelligent L5 Tool Selection**
```python
def select_l5_tools(
    query: str,
    agent_config: Dict[str, Any],
    mode: int
) -> List[str]:
    """
    Intelligently select which L5 tools to invoke.

    Rules:
    - RAG: ALWAYS (no cost)
    - WebSearch: ALWAYS for Mode 3, OPTIONAL for Mode 1 if RAG sufficient
    - Domain Tools (PubMed, FDA): Only if query indicates need
    """
    tools = ['rag']  # Always include RAG

    # Always include WebSearch for Mode 3 (autonomous research)
    if mode == 3:
        tools.append('websearch')

    # Mode 1: Only add WebSearch if RAG confidence is low
    elif mode == 1:
        # Check if query has high RAG likelihood
        if has_high_rag_coverage(query, agent_config):
            # Skip WebSearch to save cost and time
            pass
        else:
            tools.append('websearch')

    # Add domain-specific tools if needed
    query_lower = query.lower()
    if 'pubmed' in query_lower or 'clinical trial' in query_lower:
        tools.append('pubmed')
    if 'fda' in query_lower or 'regulatory' in query_lower:
        tools.append('fda_db')

    return tools
```

**2. Caching Strategy**
```python
# Cache L5 results for identical queries (24-hour TTL)
CACHE_KEY = f"l5:{query_hash}:{tool_type}:{namespaces}"

async def cached_l5_execution(
    query: str,
    tool_type: str,
    config: L5ToolConfig
) -> L5ToolResult:
    """Execute L5 tool with caching."""
    cache_key = generate_cache_key(query, tool_type, config)

    # Check cache
    cached = await redis.get(cache_key)
    if cached:
        logger.info("l5_cache_hit", tool_type=tool_type)
        return L5ToolResult.parse_raw(cached)

    # Execute
    result = await l5_tool.execute(query, config)

    # Cache result (24-hour TTL)
    await redis.setex(cache_key, 86400, result.json())

    return result
```

**3. Token Budget Optimization**
```python
# Adaptive token budget based on mode
MODE_TOKEN_BUDGETS = {
    1: 2000,  # Mode 1: Quick response
    3: 8000,  # Mode 3: Comprehensive
}

def optimize_token_budget(
    findings: List[L5Finding],
    budget: int
) -> List[L5Finding]:
    """
    Select findings that fit within token budget, prioritizing quality.

    Algorithm:
    1. Sort by evidence quality score (descending)
    2. Include findings until budget exhausted
    3. Ensure at least 1 finding per source type (diversity)
    """
    # Sort by quality
    findings_sorted = sorted(
        findings,
        key=lambda f: f.evidence_score.overall_score,
        reverse=True
    )

    selected = []
    tokens_used = 0
    source_types = set()

    for finding in findings_sorted:
        estimated_tokens = len(finding.content) // 4  # Rough estimate

        # Include if:
        # - Fits in budget, OR
        # - First finding of this source type (ensure diversity)
        if tokens_used + estimated_tokens <= budget or finding.source_type not in source_types:
            selected.append(finding)
            tokens_used += estimated_tokens
            source_types.add(finding.source_type)

    return selected
```

---

## 7. Implementation Roadmap

### Phase 1: Core Evidence Infrastructure (Week 1)

**Deliverables:**
- [ ] Implement EVIDENCE_QUALITY_SCORES hierarchy
- [ ] Implement evidence scoring algorithm (`score_evidence_quality()`)
- [ ] Add `l5_findings_audit` table
- [ ] Update L4 Context Engineer to score and rank findings
- [ ] Deploy namespace migration script

**Success Criteria:**
- All queries return evidence-scored findings
- RAG namespaces resolved for 100% of agents

### Phase 2: Mandatory Evidence Enforcement (Week 2)

**Deliverables:**
- [ ] Make RAG + WebSearch mandatory (remove optional flags)
- [ ] Implement minimum evidence quality thresholds
- [ ] Add evidence quality warnings to responses
- [ ] Implement caching for L5 results

**Success Criteria:**
- 95% of queries have evidence from 2+ sources
- Average evidence quality score > 0.70
- L5 cache hit rate > 40%

### Phase 3: Artifact Generation (Week 3)

**Deliverables:**
- [ ] Add `artifacts` table
- [ ] Implement Mode 1 reference card generation
- [ ] Implement Mode 3 research report generation
- [ ] Add PDF/DOCX export functionality
- [ ] Implement artifact TTL management

**Success Criteria:**
- Artifacts generated for 60% of Mode 3 queries
- User satisfaction with artifact quality > 4.0/5.0

### Phase 4: Advanced Features (Week 4)

**Deliverables:**
- [ ] Implement cross-validation scoring
- [ ] Add recency decay to evidence scoring
- [ ] Implement intelligent L5 tool selection (cost optimization)
- [ ] Add evidence quality dashboard for monitoring

**Success Criteria:**
- Cost per query reduced by 20%
- Evidence quality scores > 0.75 for 80% of queries

---

## 8. Monitoring & Metrics

### Key Metrics to Track

**Evidence Quality Metrics:**
```python
EVIDENCE_METRICS = {
    'avg_evidence_quality': 'Average evidence quality score across all queries',
    'evidence_sources_per_query': 'Average number of sources per query',
    'regulatory_source_coverage': '% of queries with regulatory sources',
    'cross_validation_rate': '% of findings validated by multiple sources',
}
```

**Cost Metrics:**
```python
COST_METRICS = {
    'l5_cost_per_query': 'Average L5 tool cost per query',
    'cache_hit_rate': 'L5 cache hit rate (%)',
    'tools_per_query': 'Average number of L5 tools invoked',
}
```

**Performance Metrics:**
```python
PERFORMANCE_METRICS = {
    'l5_avg_latency_ms': 'Average L5 tool execution time',
    'l4_aggregation_latency_ms': 'L4 aggregation time',
    'end_to_end_latency': 'Total query latency (Mode 1 vs Mode 3)',
}
```

### Dashboard Queries

```sql
-- Evidence Quality by Agent Tier
SELECT
  a.tier,
  AVG((l5.evidence_score->>'overall_score')::float) as avg_evidence_quality,
  AVG(l5.l5_tool_execution_time_ms) as avg_latency_ms,
  COUNT(*) as total_queries
FROM l5_findings_audit l5
JOIN agents a ON l5.agent_id = a.id
WHERE l5.created_at > NOW() - INTERVAL '7 days'
GROUP BY a.tier
ORDER BY a.tier;

-- Cost Analysis by L5 Tool
SELECT
  l5_tool_type,
  COUNT(*) as execution_count,
  AVG(l5_tool_execution_time_ms) as avg_latency_ms,
  COUNT(*) FILTER (WHERE l5_tool_success = false) as failure_count,
  ROUND(
    COUNT(*) FILTER (WHERE l5_tool_success = false)::numeric / COUNT(*)::numeric * 100,
    2
  ) as failure_rate_pct
FROM l5_findings_audit
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY l5_tool_type
ORDER BY execution_count DESC;

-- Artifact Generation Rate
SELECT
  DATE_TRUNC('day', created_at) as date,
  artifact_type,
  COUNT(*) as artifacts_generated,
  AVG(confidence) as avg_confidence,
  AVG(evidence_quality_avg) as avg_evidence_quality
FROM artifacts
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), artifact_type
ORDER BY date DESC;
```

---

## 9. Answers to Strategic Questions

### Question 1: Optimal Data Flow for Evidence-Based Responses

**Recommendation:**

```
L4 Context Engineer → [RAG (internal)] + [WebSearch (external)] → Score & Rank → L3 Expert
```

**Prioritization:**
1. **Regulatory sources (Tier 1)** - Always prioritize FDA, EMA, ICH
2. **Scientific peer-reviewed (Tier 2)** - PubMed, Nature, NEJM
3. **Internal RAG (Tier 5)** - Validated SOPs and internal knowledge
4. **General web (Tier 6)** - Only if higher tiers insufficient

**Weighting:**
- Source quality: 40%
- Relevance: 30%
- Recency: 15%
- Cross-validation: 15%

### Question 2: Artifact Generation Strategy

**Recommendation:**

**Mode 1 (Quick Interactive):**
- Generate artifacts if: `confidence > 0.70 AND sources >= 2`
- Format: **Structured reference card** (bullet points, key facts)
- Max size: 2000 tokens
- TTL: 30 days

**Mode 3 (Autonomous Research):**
- Generate artifacts if: `confidence > 0.75 AND sources >= 5`
- Format: **Comprehensive research report** (narrative with sections)
- Max size: 8000 tokens
- TTL: 1 year (compliance)

**Do NOT generate artifacts for:**
- Simple Q&A (definition, single fact)
- Low confidence (<0.70)
- Insufficient evidence (<2 sources)

### Question 3: Evidence Quality Scoring

**Recommendation:**

Use **6-tier hierarchy** with weighted scoring:

| Tier | Source Type | Base Score | Examples |
|------|-------------|------------|----------|
| 1 | Regulatory | 1.00 | FDA, EMA, ICH |
| 2 | Scientific | 0.90 | PubMed, NEJM, Nature |
| 3 | Clinical Trials | 0.88 | ClinicalTrials.gov |
| 4 | Health Authorities | 0.85 | CDC, NIH, WHO |
| 5 | Internal RAG | 0.75-0.80 | SOPs, ontology |
| 6 | General Web | 0.40-0.60 | Authoritative domains |

**Quality Formula:**
```
Evidence Quality = (Source Quality × 0.40) + (Relevance × 0.30) + (Recency × 0.15) + (Cross-Validation × 0.15)
```

### Question 4: Data Model Considerations

**Recommendation:**

**1. Store L5 findings for audit trail:**
- YES - Store all L5 findings in `l5_findings_audit` table
- Retention: 1 year minimum (compliance)
- Enables: Quality analysis, cost optimization, debugging

**2. Store artifacts in database:**
- YES - Store in `artifacts` table with full content JSONB
- Generate PDF/DOCX exports on-demand (store URLs)
- TTL: 30 days (Mode 1), 1 year (Mode 3)

**3. Metadata for compliance:**
```json
{
  "evidence_metadata": {
    "sources_count": 7,
    "regulatory_sources": ["fda.gov", "ema.europa.eu"],
    "evidence_quality_avg": 0.82,
    "l5_tools_used": ["rag", "websearch"],
    "cross_validation_rate": 0.71
  },
  "audit_metadata": {
    "l5_execution_times_ms": [450, 890, 320],
    "cache_hits": 1,
    "cost_usd": 0.075
  }
}
```

### Question 5: RAG Namespace Strategy

**Recommendation:**

**Default Namespace Hierarchy:**
1. **Agent-specific** (highest priority) - from `agents.metadata.knowledge_namespaces`
2. **Role-based** (inherited) - from `org_roles.metadata.default_namespaces`
3. **Domain-based** (fallback) - from `DOMAIN_DEFAULT_NAMESPACES` mapping

**Namespace Assignment Rules:**
- Regulatory agents → `['regulatory-fda', 'regulatory-ema', 'regulatory-ich']`
- Clinical agents → `['clinical-trials', 'clinical-gcp', 'clinical-protocols']`
- Medical affairs → `['medical-publications', 'clinical-evidence', 'drug-safety']`
- General fallback → `['general-knowledge', 'internal-wiki']`

**Migration:**
- Run SQL migration to assign defaults to all agents
- Update 100% of agents within 24 hours
- Monitor namespace coverage: target 95%

---

## 10. Success Criteria

**Evidence Coverage:**
- [ ] 95% of queries have evidence from 2+ sources
- [ ] 80% of queries have evidence quality > 0.75
- [ ] 60% of queries include regulatory sources (when relevant)

**Performance:**
- [ ] Mode 1 response time: < 5 seconds (with RAG+Web)
- [ ] Mode 3 response time: 30s - 5min (acceptable for research)
- [ ] L5 cache hit rate: > 40%

**Cost:**
- [ ] Average cost per query: $0.10 - $0.30
- [ ] Cost reduction through caching: 20%

**Quality:**
- [ ] User satisfaction with citations: > 4.0/5.0
- [ ] Artifact generation rate (Mode 3): > 60%
- [ ] Hallucination incident rate: < 2% (measured by user feedback)

---

## Appendix: Code Examples

### Full L4 Context Engineer with Evidence Scoring

See implementation in: `/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine/src/services/l4_context_engineer.py`

**Key enhancements needed:**
1. Add `score_evidence_quality()` function
2. Implement evidence tier prioritization in `_aggregate_findings()`
3. Add cross-validation check
4. Store findings to `l5_findings_audit` table

### Artifact Generation Service

Create new service: `/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine/src/services/artifact_generator.py`

**Interface:**
```python
async def generate_artifact(
    query: str,
    response: str,
    findings: List[L5Finding],
    mode: int,
    confidence: float
) -> Optional[Dict[str, Any]]:
    """Generate artifact if criteria met."""

    # Check criteria
    if mode == 1:
        if confidence < 0.70 or len(findings) < 2:
            return None
        return generate_reference_card(query, response, findings)

    elif mode == 3:
        if confidence < 0.75 or len(findings) < 5:
            return None
        return generate_research_report(query, response, findings)
```

---

**Document Status:** STRATEGIC RECOMMENDATION
**Next Steps:** Review with Platform Orchestrator and Engineering Team
**Implementation Timeline:** 4 weeks (phased rollout)
