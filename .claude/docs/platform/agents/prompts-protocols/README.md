# VITAL Agent Prompts & Protocols

**Purpose**: Gold standard system prompt templates and shared protocols for AgentOS 3.0
**Version**: 2.0
**Last Updated**: 2025-11-26

---

## Directory Structure

```
prompts-protocols/
├── README.md                          # This file
├── protocols/
│   ├── verify-protocol.md            # VERIFY anti-hallucination (MANDATORY)
│   ├── evidence-requirements.md       # Citation standards
│   ├── escalation-protocol.md         # L3→L2→L1→HITL paths
│   ├── self-critique-protocol.md      # Quality assurance
│   └── tool-registry.md               # Worker pool tools
├── templates/
│   ├── L1-MASTER-template.md          # Strategic coordinators (2000-2500 tokens)
│   ├── L2-EXPERT-template.md          # Domain experts (1500-2000 tokens)
│   ├── L3-SPECIALIST-template.md      # Task specialists (1000-1500 tokens)
│   ├── L4-WORKER-template.md          # Shared pool workers (300-500 tokens)
│   └── L5-TOOL-template.md            # Deterministic tools (100-200 tokens)
└── examples/
    └── [agent-specific examples]
```

---

## Token Budgets by Level

| Level | Role | Token Budget | Model Tier | Temperature |
|-------|------|--------------|------------|-------------|
| **L1** | MASTER | 2000-2500 | Tier 3 (GPT-4/Claude) | 0.2 |
| **L2** | EXPERT | 1500-2000 | Tier 2/3 (GPT-4/BioGPT) | 0.4 |
| **L3** | SPECIALIST | 1000-1500 | Tier 2 (GPT-4-Turbo) | 0.4 |
| **L4** | WORKER | 300-500 | Tier 1 (GPT-3.5) | 0.6 |
| **L5** | TOOL | 100-200 | Code/API | 0.0 |

---

## 6-Section Framework (Mandatory for L1-L3)

All L1-L3 agents MUST include these sections:

1. **YOU ARE** - Identity, role, expertise level
2. **YOU DO** - Capabilities with measurable outcomes
3. **YOU NEVER** - Hard boundaries with rationale
4. **SUCCESS CRITERIA** - Performance metrics
5. **WHEN UNSURE** - Escalation triggers and paths
6. **EVIDENCE REQUIREMENTS** - Citation standards (VERIFY Protocol)

---

## Protocol Loading Order

1. Core identity (YOU ARE) - Always in prompt
2. VERIFY Protocol - Mandatory for pharma/healthcare
3. Evidence requirements - Mandatory for L1-L3
4. Self-critique protocol - Mandatory for L1-L3
5. Escalation protocol - Mandatory for L1-L3
6. Tool registry - On-demand

---

## Usage

### Creating a New Agent

1. Choose the appropriate level template
2. Fill in placeholders (marked with `{{PLACEHOLDER}}`)
3. Add domain-specific context
4. Validate against protocols
5. Test with representative queries

### Placeholder Guide

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{AGENT_NAME}}` | Display name | "Regulatory Strategy Advisor" |
| `{{AGENT_ROLE}}` | Functional role | "FDA submission strategist" |
| `{{DOMAIN}}` | Primary domain | "Regulatory Affairs" |
| `{{EXPERTISE_YEARS}}` | Experience level | "15+ years" |
| `{{CAPABILITIES}}` | List of 3-7 capabilities | See template |
| `{{BOUNDARIES}}` | List of 3-5 restrictions | See template |
| `{{ESCALATION_TARGET}}` | Higher level agent | "L1 Master Orchestrator" |
| `{{KNOWLEDGE_DOMAINS}}` | Array of domains | ["FDA", "EMA", "ICH"] |

---

## Validation Checklist

Before deploying any agent:

- [ ] Template matches agent level
- [ ] All placeholders filled
- [ ] Token count within budget
- [ ] VERIFY Protocol included (pharma/healthcare)
- [ ] Evidence requirements defined
- [ ] Escalation paths specified
- [ ] Tested with 5+ representative queries
