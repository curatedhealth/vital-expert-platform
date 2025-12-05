# Prompt Starter Quality Standards

## Overview

This document defines quality standards for agent prompt starters across all levels of the VITAL platform hierarchy.

## Quality Requirements by Level

### L2 Expert Starters (Strategic)

**Characteristics:**
- Length: 120-200 characters minimum
- Scope: Comprehensive, multi-faceted
- Language: Strategic, leadership-oriented
- Outcome: Framework, strategy, roadmap

**Patterns:**
```
✅ "Develop a comprehensive [strategy/framework] for [context] including [components], [stakeholders], and [outcomes]"
✅ "Create an integrated [plan/approach] addressing [multiple areas] while [consideration]"
✅ "Design a [program/system] that [achieves goal] through [methods]"
✅ "Evaluate our current [function/process] and recommend [improvements]"
✅ "Build a [model/framework] with [elements] to demonstrate [value/impact]"
```

**Example:**
```
"Develop a comprehensive medical affairs strategy for our oncology portfolio launch,
including KOL mapping, publication planning, and MSL deployment priorities"
```

**Anti-patterns:**
```
❌ "Create strategy" (too short)
❌ "Analyze the market" (too vague)
❌ "Help with planning" (not specific)
```

---

### L3 Specialist Starters (Focused Tasks)

**Characteristics:**
- Length: 80-150 characters minimum
- Scope: Single task, specific deliverable
- Language: Action-oriented, domain-specific
- Outcome: Document, analysis, report

**Patterns:**
```
✅ "Draft a [document type] for [purpose] including [specific elements]"
✅ "Analyze the [data/situation] to identify [insights/trends/issues]"
✅ "Prepare a [deliverable] addressing [requirements] for [audience]"
✅ "Review [content/data] for [quality criteria] and [compliance]"
✅ "Create a [specific output] summarizing [information] for [use case]"
```

**Example:**
```
"Draft a medical inquiry response to an HCP question about off-label use
with appropriate disclaimers and references"
```

**Anti-patterns:**
```
❌ "Write document" (too generic)
❌ "System prompt for Medical Writer" (placeholder garbage)
❌ "Analyze this" (no context)
```

---

### L4 Worker Starters (Repetitive Tasks)

**Characteristics:**
- Length: 60-100 characters
- Scope: Single repetitive operation
- Language: Process-oriented, standardized
- Outcome: Processed output, status update

**Patterns:**
```
✅ "Track [items/status] and report [metrics/issues] requiring [action]"
✅ "Process the [input data] according to [standard/template]"
✅ "Generate a [report type] showing [metrics] for [period/scope]"
✅ "Format the [content] following [guidelines/template]"
✅ "Validate [data/documents] against [criteria] and flag [issues]"
```

**Example:**
```
"Track pending approvals for all medical affairs materials
in the MLR review queue"
```

**Anti-patterns:**
```
❌ "Process data" (too vague)
❌ "Track stuff" (unprofessional)
❌ "Do the report" (no specificity)
```

---

### L5 Tool Starters (Tool Functions)

**Characteristics:**
- Length: 50-100 characters
- Scope: Specific tool capability
- Language: Function-oriented, direct
- Outcome: Tool output, search results, calculation

**Patterns:**
```
✅ "Search [database/source] for [query criteria] and return [output]"
✅ "Calculate [metric] using [inputs/parameters]"
✅ "Compare [item A] and [item B] highlighting [differences]"
✅ "Convert [input format] to [output format] maintaining [quality]"
✅ "Extract [data type] from [source] into [output format]"
```

**Example:**
```
"Search PubMed for recent publications on [drug] mechanism of action
in [indication]"
```

**Anti-patterns:**
```
❌ "Search stuff" (too vague)
❌ "Calculate" (missing parameters)
❌ "Do conversion" (no specifics)
```

---

## Quality Checklist

Before adding prompt starters, verify:

### Content Quality
- [ ] Minimum character length met for level
- [ ] Specific, actionable language used
- [ ] Domain-appropriate terminology
- [ ] Clear expected outcome implied
- [ ] No placeholder text ("System prompt for...")

### Level Alignment
- [ ] Complexity matches agent level
- [ ] Language style appropriate for role
- [ ] Scope aligns with responsibilities
- [ ] Deliverable type matches capabilities

### Technical Requirements
- [ ] 4-6 starters per agent
- [ ] Unique starters (no duplicates)
- [ ] Appropriate category assigned
- [ ] Sequence order set correctly
- [ ] Icon assigned (optional)

---

## Bad Starter Examples (What to Avoid)

| Bad Starter | Problem | Better Version |
|-------------|---------|----------------|
| "Analyze pricing strategies our top" | Incomplete sentence | "Analyze pricing strategies for our top 5 competitors with market share impact" |
| "System prompt for Medical Writer" | Placeholder, not a starter | "Draft a clinical study report following ICH E3 guidelines" |
| "Help me" | Too vague | "Help me prepare a KOL engagement plan for our advisory board" |
| "Summarize" | No context | "Summarize the Phase 3 efficacy results for the upcoming investor presentation" |
| "Review this" | No specificity | "Review this manuscript draft for scientific accuracy and ICMJE compliance" |

---

## Category Definitions

| Category | Description | Example Use |
|----------|-------------|-------------|
| `clinical` | Clinical development, trials, data | CSRs, protocols, clinical data |
| `regulatory` | Regulatory submissions, compliance | INDs, NDAs, regulatory strategy |
| `safety` | Pharmacovigilance, adverse events | AE reports, signal evaluation |
| `publications` | Scientific publications, congress | Manuscripts, posters, abstracts |
| `education` | Medical education, training | CME programs, training materials |
| `strategy` | Strategic planning, business | Medical strategy, KOL plans |
| `compliance` | Quality, SOPs, audits | MLR review, quality systems |
| `market-access` | HEOR, payer, access | Value dossiers, payer evidence |
| `communications` | Medical communications | Slide decks, messaging |
| `policy` | Healthcare policy, advocacy | Policy analysis, advocacy |
