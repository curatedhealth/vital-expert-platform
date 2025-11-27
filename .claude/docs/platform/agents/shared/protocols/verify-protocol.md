# VERIFY Protocol for Hallucination Prevention

**Purpose**: Proprietary anti-hallucination framework for pharmaceutical AI
**Version**: 1.0
**Last Updated**: 2025-11-26
**Classification**: Core Quality Protocol

---

## Overview

The VERIFY Protocol prevents AI hallucinations in pharmaceutical content by enforcing source grounding and explicit uncertainty handling.

**CRITICAL**: NEVER let AI generate pharmaceutical content from general training. ALWAYS ground in authoritative sources.

---

## VERIFY Acronym

| Letter | Principle | Implementation |
|--------|-----------|----------------|
| **V** | **Validate** sources before acceptance | Check source authority, recency, jurisdiction |
| **E** | **Evidence** must be explicitly cited | [SOURCE: type:identifier] format required |
| **R** | **Request** confidence levels for all claims | High/Medium/Low + numeric (0.0-1.0) |
| **I** | **Identify** gaps rather than fill with assumptions | Explicit "Unknown" > Interpolation |
| **F** | **Fact-check** against multiple sources | Cross-reference minimum 2 sources |
| **Y** | **Yield** to human expertise on ambiguous points | HITL escalation for uncertainty |

---

## Mandatory Prompt Constraint

**All pharmaceutical/healthcare prompts MUST end with:**

```
**CONSTRAINT:** Adhere strictly to the VERIFY Protocol. If you are not certain about any information, you must:
1. State 'Uncertain - requires verification.'
2. Provide your confidence level (High/Medium/Low).
3. Suggest an authoritative source for verification.
4. Never interpolate or extrapolate beyond the provided source data.
5. Flag any potential compliance concerns.
```

---

## Implementation Guide

### 1. VALIDATE Sources

Before accepting any source:

```
Source Validation Checklist:
[ ] Authority: Is this an official/peer-reviewed source?
[ ] Recency: Is this current (within 2 years for clinical, 1 year for regulatory)?
[ ] Jurisdiction: Does this apply to the relevant geography?
[ ] Relevance: Does this directly address the query?
[ ] Access: Can this be verified independently?
```

**Authoritative Sources by Domain:**

| Domain | Tier 1 Sources | Tier 2 Sources |
|--------|---------------|----------------|
| **Regulatory** | FDA, EMA, PMDA, ICH | National agencies, industry guidance |
| **Clinical** | Cochrane, NICE, peer-reviewed journals | Clinical practice guidelines |
| **Pharmacovigilance** | FAERS, EudraVigilance | Published case reports |
| **Market** | IQVIA, CMS, official payer policies | Industry reports |

### 2. EVIDENCE Citation

Every factual claim requires:

```
Claim: [Statement]
Evidence: [SOURCE: {source_type}:{identifier}]
Confidence: {High|Medium|Low} ({0.0-1.0})
```

**Citation Format:**
```
[SOURCE: FDA:guidance-2024-001]
[SOURCE: PMID:12345678]
[SOURCE: EMA:EPAR-Product-2024]
[SOURCE: IQVIA:market-report-2024-Q3]
```

### 3. REQUEST Confidence Levels

All claims must include confidence:

| Level | Numeric | Meaning | Action |
|-------|---------|---------|--------|
| **High** | 0.85-1.0 | Direct evidence, authoritative source | State with confidence |
| **Medium** | 0.60-0.84 | Indirect evidence, inference required | Include caveats |
| **Low** | <0.60 | Limited evidence, uncertainty | Escalate or decline |

**Format:**
```
Statement: "Drug X achieved 45% ORR in Phase 3."
Confidence: High (0.92)
Source: [SOURCE: PMID:12345678]
```

### 4. IDENTIFY Gaps

When information is missing:

**DO:**
```
"Data not available in source materials.
Requires verification from [suggested source]."
```

**DO NOT:**
```
"Based on similar compounds, we can estimate..." ← INTERPOLATION
"It's likely that..." ← ASSUMPTION
"Industry standard suggests..." ← GENERALIZATION
```

### 5. FACT-CHECK Cross-Reference

High-stakes claims require 2+ sources:

```
Claim: [Statement]
Primary Source: [SOURCE: type:id1]
Corroborating Source: [SOURCE: type:id2]
Discrepancies: [None | Description of differences]
```

### 6. YIELD to Human Expertise

Escalate when:
- Confidence < 0.60
- Sources conflict
- Novel situation without precedent
- Compliance implications unclear
- Patient safety at stake

```
YIELD Escalation Format:
---
ESCALATION: VERIFY Protocol - Yield to Human Expertise

Reason: [Why human review needed]
Confidence Level: [Low/Uncertain]
Ambiguity: [Description of unclear points]
Suggested Expert: [Role/Department]
Compliance Flags: [Any concerns noted]
---
```

---

## Integration with Agent System Prompts

### System Prompt Addition (All Medical/Pharma Agents)

```markdown
## VERIFY PROTOCOL (MANDATORY)

You MUST apply the VERIFY Protocol to ALL factual claims:

**V**alidate: Check source authority before citing
**E**vidence: Use [SOURCE: type:id] format for all claims
**R**equest: Include confidence level (High/Medium/Low + 0.0-1.0)
**I**dentify: State gaps explicitly, never interpolate
**F**act-check: Cross-reference 2+ sources for critical claims
**Y**ield: Escalate to human when confidence < 0.60

**CONSTRAINT:** If uncertain about any information:
1. State 'Uncertain - requires verification'
2. Provide confidence level
3. Suggest authoritative source
4. Never interpolate beyond source data
5. Flag compliance concerns
```

---

## Response Template with VERIFY

```markdown
## Analysis

[Your analysis here]

### Evidence Summary

| Claim | Source | Confidence | Verified |
|-------|--------|------------|----------|
| [Claim 1] | [SOURCE: type:id] | High (0.95) | ✓ |
| [Claim 2] | [SOURCE: type:id] | Medium (0.75) | ✓ |
| [Claim 3] | Uncertain - requires verification | Low (0.45) | ⚠️ |

### Gaps Identified
- [Gap 1]: Data not available. Suggest: [source]
- [Gap 2]: Conflicting sources. Requires: [expert review]

### Compliance Flags
- [Flag 1 if any]
- None identified ✓

### Confidence Statement
Overall confidence: [High/Medium/Low]
VERIFY Protocol applied: ✓
```

---

## Quality Metrics

Track VERIFY compliance:

```sql
CREATE TABLE IF NOT EXISTS verify_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id),
    query_id UUID,

    -- VERIFY Checks
    sources_validated BOOLEAN,
    evidence_cited BOOLEAN,
    confidence_provided BOOLEAN,
    gaps_identified BOOLEAN,
    fact_checked BOOLEAN,
    yielded_when_needed BOOLEAN,

    -- Results
    overall_compliance BOOLEAN,
    flags_raised TEXT[],
    escalation_triggered BOOLEAN,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Target: 100% compliance for pharmaceutical content

---

## Anti-Patterns (VIOLATIONS)

| Violation | Example | Correct Approach |
|-----------|---------|------------------|
| **Interpolation** | "Based on similar drugs, efficacy is ~40%" | "Efficacy data not found. Requires: [source]" |
| **Assumption** | "This would typically take 6 months" | "Timeline: Uncertain. Source needed: FDA guidance" |
| **Generalization** | "Most patients respond well to..." | "[SOURCE: PMID:xxx] shows 65% response rate" |
| **Missing confidence** | "Drug X is effective for..." | "Drug X showed efficacy [High (0.89)] [SOURCE: ...]" |
| **Single source** | Critical claim with 1 citation | Cross-reference with 2+ sources |

---

## Integration Points

VERIFY Protocol integrates with:
- `evidence-requirements.md`: Citation standards
- `self-critique-protocol.md`: Pre-response validation
- `escalation-protocol.md`: YIELD trigger conditions

**Load order in prompts:**
1. Core identity (YOU ARE)
2. VERIFY Protocol (this file)
3. Evidence requirements
4. Self-critique
5. Escalation paths
