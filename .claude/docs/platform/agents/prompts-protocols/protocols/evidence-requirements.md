# Evidence Requirements Protocol

**Purpose**: Standard evidence citation requirements for all VITAL agents
**Version**: 2.0
**Last Updated**: 2025-11-26
**Integrates With**: [VERIFY Protocol](./verify-protocol.md)

---

## VERIFY Protocol Integration

This protocol implements the **E** (Evidence) and **R** (Request confidence) components of the VERIFY Protocol. All pharmaceutical/healthcare agents MUST apply VERIFY alongside these requirements.

---

## Evidence Level Hierarchy

| Level | Description | Use For |
|-------|-------------|---------|
| **1A** | Systematic reviews, meta-analyses, official regulatory guidance | Regulatory decisions, clinical claims |
| **1B** | Randomized controlled trials, official documentation | Treatment recommendations |
| **2A** | Cohort studies, industry reports (IQVIA, Gartner) | Market analysis, trends |
| **2B** | Case-control studies, expert consensus | Supporting evidence |
| **3** | Case reports, opinion, internal data | Context only, not primary evidence |

---

## Citation Format

### Standard Citation
```
[SOURCE: {source_type}:{identifier}]
```

### Examples by Domain

**Regulatory:**
```
[SOURCE: FDA:2024-guidance-biosimilars]
[SOURCE: EMA:CHMP/123456/2024]
[SOURCE: ICH:E6(R3)]
```

**Clinical:**
```
[SOURCE: PMID:12345678]
[SOURCE: DOI:10.1016/j.example.2024]
[SOURCE: ClinicalTrials:NCT12345678]
```

**Market/Commercial:**
```
[SOURCE: IQVIA:2024-market-report]
[SOURCE: SEC-EDGAR:10-K-2024]
[SOURCE: Bloomberg:TICKER-2024]
```

**Internal:**
```
[SOURCE: INTERNAL:document-id-2024]
```

---

## Confidence Scoring

All claims require confidence score:

| Score | Meaning | Action |
|-------|---------|--------|
| **0.95-1.0** | Highly confident, direct evidence | State confidently |
| **0.80-0.94** | Confident, strong supporting evidence | Include minor caveats |
| **0.60-0.79** | Moderate confidence, indirect evidence | Explicit uncertainty |
| **<0.60** | Low confidence | Escalate or decline |

### Format
```
Claim: [Your claim]
Confidence: 0.85
Evidence: [SOURCE: type:id]
Limitations: [What this doesn't cover]
```

---

## Domain-Specific Requirements

### Regulatory Agents
- MUST cite official guidance documents
- MUST specify jurisdiction (US/EU/UK/Japan/China)
- MUST note effective dates and sunset provisions

### Clinical Agents
- MUST cite peer-reviewed sources
- MUST note study design and limitations
- MUST include patient population context

### Market Access Agents
- MUST cite HTA decisions by body (NICE, G-BA, HAS)
- MUST note geographic applicability
- MUST include currency and date for pricing data

### Compliance Agents
- MUST cite specific regulations/statutes
- MUST note enforcement history
- MUST include jurisdiction and applicability

---

## Uncertainty Acknowledgment

When confidence < 0.80, include:

```
**Note on Uncertainty:**
This assessment is based on [evidence type] with the following limitations:
- [Limitation 1]
- [Limitation 2]
Consider [escalation path] for authoritative guidance.
```

---

## Prohibited Claims

NEVER make claims without evidence for:
- Drug efficacy or safety
- Regulatory approval likelihood
- Specific patient outcomes
- Legal/compliance determinations
- Financial projections
