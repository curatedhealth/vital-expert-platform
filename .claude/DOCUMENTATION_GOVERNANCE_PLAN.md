# Documentation Governance & Agent Coordination Plan

**Version**: 1.0.0
**Date**: November 23, 2025
**Status**: Active
**Purpose**: Systematic framework to prevent documentation mess and ensure all agents follow standards

---

## Executive Summary

This plan establishes a systematic governance model ensuring:
1. **Quality Control**: Two-agent system prevents documentation decay
2. **Agent Awareness**: All agents know what they need to know
3. **Standard Compliance**: Automated enforcement of naming/versioning conventions
4. **Sustainable Maintenance**: Clear workflows for creating, updating, reviewing docs

---

## The Two-Agent Governance Model

### Agent 1: Documentation QA Lead
**Role**: Quality & Consistency Guardian

**Responsibilities**:
- Review all new/updated documentation for quality
- Enforce style guide and writing standards
- Ensure consistency across documents
- Final polish before publication
- Create and maintain style guide

**When to Invoke**:
- ✅ After creating any new documentation file
- ✅ After major updates to existing docs
- ✅ Before finalizing PRD/ARD/major strategic docs
- ✅ Quarterly documentation audits

### Agent 2: Implementation Compliance & QA (Librarian)
**Role**: Organization & Discovery Guardian

**Responsibilities**:
- Maintain CATALOGUE.md (master navigation)
- Update INDEX.md files when docs are added/moved
- Verify all cross-references are valid
- Ensure PRD/ARD specs match implementation
- Help agents find existing documentation

**When to Invoke**:
- ✅ After creating new documentation in new category
- ✅ After moving/reorganizing documentation
- ✅ When agents can't find existing docs
- ✅ Before major releases (compliance verification)
- ✅ Monthly navigation audit

---

## Required Reading for All Agents

Every agent (when invoked) should be aware of these core documents:

### Tier 1: Critical (Must Read First)
1. **CLAUDE.md** - How Claude Code should operate
2. **VITAL.md** - VITAL Platform standards
3. **EVIDENCE_BASED_RULES.md** - Evidence-based operation requirements
4. **NAMING_CONVENTION.md** - File naming & versioning standards

**Location**: `.claude/` root

### Tier 2: Navigation (Know Where Things Are)
1. **README.md** - Command center overview
2. **STRUCTURE.md** - Directory structure
3. **docs/INDEX.md** - Quick navigation by category/role/topic
4. **CATALOGUE.md** - Complete master catalog

**Location**: `.claude/`

### Tier 3: Coordination (How to Work Together)
1. **AGENT_COORDINATION_GUIDE.md** - Agent collaboration protocols
2. **RECOMMENDED_AGENT_STRUCTURE.md** - Agent design patterns
3. **DOCUMENTATION_CONVENTION.md** - Documentation best practices

**Location**: `.claude/docs/coordination/`

### Tier 4: Specialized (Role-Specific)
- **Data agents**: `SQL_SUPABASE_SPECIALIST_GUIDE.md`
- **Service agents**: PRD/ARD for their service
- **Platform agents**: Relevant platform documentation

**Location**: `.claude/docs/coordination/` and service-specific folders

---

## Agent Awareness System

### How to Ensure Agents Know What They Need

#### Option 1: Updated Agent Frontmatter (Recommended)
Add required reading to each agent's YAML frontmatter:

```yaml
---
name: data-architecture-expert
description: Elite Data Architecture Expert...
model: sonnet
tools: ["*"]
color: "#10B981"
required_reading:
  - .claude/CLAUDE.md
  - .claude/VITAL.md
  - .claude/EVIDENCE_BASED_RULES.md
  - .claude/NAMING_CONVENTION.md
  - .claude/docs/coordination/SQL_SUPABASE_SPECIALIST_GUIDE.md
---
```

#### Option 2: Pre-Invocation Checklist
Before invoking any agent, include in your prompt:

```markdown
Please review these documents first:
- CLAUDE.md (operational rules)
- VITAL.md (platform standards)
- NAMING_CONVENTION.md (file naming/versioning)

Then proceed with: [your task]
```

#### Option 3: Agent Initialization Protocol (Best Practice)
Create initialization snippet agents should execute:

```markdown
**Agent Initialization Checklist**:
- [ ] Read CLAUDE.md for operational rules
- [ ] Read VITAL.md for platform standards
- [ ] Read EVIDENCE_BASED_RULES.md for evidence requirements
- [ ] Read NAMING_CONVENTION.md for file standards
- [ ] Check docs/INDEX.md for navigation
- [ ] Review role-specific guides if applicable
```

---

## Documentation Workflow

### Creating New Documentation

**Step 1: Plan**
```
1. Determine correct category (strategy/platform/services/architecture/etc.)
2. Choose naming convention (UPPERCASE or lowercase-with-hyphens)
3. Check if similar doc already exists (ask Librarian agent)
```

**Step 2: Create**
```
1. Use NAMING_CONVENTION.md template
2. Add version header (Version, Last Updated, Status, Purpose)
3. Follow category-specific structure
4. Include cross-references to related docs
```

**Step 3: Review**
```
1. Self-review against NAMING_CONVENTION.md checklist
2. Invoke Documentation QA Lead for quality review
3. Address feedback and revise
4. Get final approval
```

**Step 4: Integrate**
```
1. Invoke Librarian to update CATALOGUE.md
2. Update relevant INDEX.md files
3. Add cross-references from related docs
4. Verify all links work
```

**Step 5: Publish**
```
1. Commit with clear message
2. Update version history
3. Notify relevant agents (if needed)
```

### Updating Existing Documentation

**Minor Updates** (typos, clarifications):
```
1. Make changes directly
2. Update "Last Updated" date
3. Increment PATCH version (1.0.0 → 1.0.1)
```

**Major Updates** (new sections, significant changes):
```
1. Make changes
2. Update "Last Updated" date
3. Increment MINOR version (1.0.0 → 1.1.0)
4. Add to version history section
5. Invoke Documentation QA Lead for review
```

**Breaking Changes** (restructure, major rewrite):
```
1. Create new version
2. Update "Last Updated" date
3. Increment MAJOR version (1.0.0 → 2.0.0)
4. Document migration path from old version
5. Invoke both QA Lead and Librarian for review
6. Update all cross-references
```

---

## Systematic Quality Checks

### Weekly Checks (Automated where possible)
- [ ] No broken links (Librarian runs validation)
- [ ] All new files have version headers
- [ ] CATALOGUE.md is up to date
- [ ] INDEX.md files are current

### Monthly Checks
- [ ] Documentation QA Lead: Consistency audit
- [ ] Librarian: Navigation audit
- [ ] Review deprecated docs for archival
- [ ] Update version histories

### Quarterly Checks
- [ ] Full documentation review by QA Lead
- [ ] Naming convention compliance audit
- [ ] Cross-reference validation
- [ ] Agent awareness survey (are agents finding what they need?)

---

## Prevention Strategies

### Preventing Documentation Mess

#### 1. **Single Source of Truth**
✅ **Rule**: All documentation in `.claude/docs/` only
❌ **Forbidden**: Documentation scattered in multiple locations

**Enforcement**: Librarian agent validates during monthly audits

#### 2. **Mandatory Versioning**
✅ **Rule**: All README and major docs have version headers
❌ **Forbidden**: Documents without Version, Last Updated, Status

**Enforcement**: Pre-commit hook checks (future enhancement)

#### 3. **Naming Convention Compliance**
✅ **Rule**: All files follow NAMING_CONVENTION.md
❌ **Forbidden**: Random file names, spaces, special characters

**Enforcement**: QA Lead reviews during document creation

#### 4. **Required Cross-Referencing**
✅ **Rule**: Related docs link to each other
❌ **Forbidden**: Orphan documents with no context

**Enforcement**: Librarian validates during integration

#### 5. **Deprecation Protocol**
✅ **Rule**: Old docs marked as "Deprecated" with migration path
❌ **Forbidden**: Deleting docs without archival/migration

**Enforcement**: Version control + Librarian approval required

---

## Agent Coordination Protocols

### Protocol 1: Creating Documentation
```
Developer/Agent → Creates Draft
    ↓
Documentation QA Lead → Reviews Quality
    ↓
Developer/Agent → Revises based on feedback
    ↓
Documentation QA Lead → Final Approval
    ↓
Librarian → Updates Navigation (CATALOGUE.md, INDEX.md)
    ↓
Published ✅
```

### Protocol 2: Finding Documentation
```
Agent Needs Info → Checks docs/INDEX.md
    ↓
Not Found → Asks Librarian
    ↓
Librarian → Searches CATALOGUE.md + provides location
    ↓
Agent Reads → Proceeds with task
```

### Protocol 3: Updating Major Docs (PRD/ARD)
```
Agent → Makes Changes
    ↓
Documentation QA Lead → Quality Review
    ↓
Librarian → Compliance Check (matches implementation?)
    ↓
Both Approve → Published ✅
```

### Protocol 4: Reorganizing Documentation
```
Agent → Proposes reorganization
    ↓
Librarian → Reviews impact on navigation
    ↓
Documentation QA Lead → Reviews quality implications
    ↓
Both Approve → Execute reorganization
    ↓
Librarian → Updates all indexes and cross-references
    ↓
Complete ✅
```

---

## Implementation Checklist

### Phase 1: Foundation (Complete)
- [x] Create NAMING_CONVENTION.md
- [x] Standardize all README files
- [x] Create DOCUMENTATION_GOVERNANCE_PLAN.md
- [x] Configure Documentation QA Lead agent
- [x] Configure Librarian agent

### Phase 2: Integration (Next Steps)
- [ ] Create DOCUMENTATION_STYLE_GUIDE.md (QA Lead creates)
- [ ] Update CATALOGUE.md (Librarian maintains)
- [ ] Add required_reading to agent frontmatter
- [ ] Create agent initialization protocol
- [ ] Document workflows in agent guides

### Phase 3: Enforcement (Future)
- [ ] Pre-commit hooks for version headers
- [ ] Automated link checking (CI/CD)
- [ ] Monthly audit automation
- [ ] Agent awareness metrics

### Phase 4: Optimization (Ongoing)
- [ ] Gather feedback from agents
- [ ] Refine workflows based on usage
- [ ] Update standards as needed
- [ ] Continuous improvement

---

## Quick Reference Cards

### For Developers: "Creating New Documentation"
```
1. Check category: strategy/platform/services/architecture/etc.
2. Name file: UPPERCASE_TYPE.md or lowercase-type.md
3. Add header: Version, Last Updated, Status, Purpose
4. Write content
5. Invoke Documentation QA Lead
6. Revise based on feedback
7. Invoke Librarian to update navigation
8. Publish
```

### For Agents: "Before Starting Any Task"
```
1. Read CLAUDE.md (how to operate)
2. Read VITAL.md (platform standards)
3. Read NAMING_CONVENTION.md (file standards)
4. Check docs/INDEX.md (find relevant docs)
5. Read role-specific guides
6. Proceed with task following standards
```

### For QA Lead: "Reviewing Documentation"
```
1. Check version header present
2. Verify naming convention compliance
3. Review quality (clarity, accuracy, completeness)
4. Check consistency with other docs
5. Validate cross-references
6. Provide feedback or approve
7. Update review log
```

### For Librarian: "Integrating New Documentation"
```
1. Verify correct category placement
2. Add to CATALOGUE.md
3. Update relevant INDEX.md
4. Validate cross-references
5. Check for duplicates
6. Ensure discoverability
7. Update navigation guides
```

---

## Success Metrics

### Documentation Quality
- **Target**: 100% of README files have version headers
- **Current**: 100% ✅
- **Measure**: Quarterly audit

### Documentation Discoverability
- **Target**: Agents find docs in <2 searches
- **Measure**: Track "doc not found" incidents
- **Goal**: <5% failure rate

### Standard Compliance
- **Target**: 95% compliance with NAMING_CONVENTION.md
- **Measure**: Monthly compliance scan
- **Current**: 100% for README files ✅

### Agent Awareness
- **Target**: All agents know required reading
- **Measure**: Survey agents (do you know where X is?)
- **Goal**: 90% awareness rate

### Documentation Freshness
- **Target**: No docs older than 6 months without review
- **Measure**: "Last Updated" tracking
- **Action**: Quarterly review cycle

---

## Escalation Matrix

### Issue: Documentation Conflict (two docs contradict)
**Severity**: High
**Owner**: Documentation QA Lead
**Process**:
1. Review both docs
2. Identify source of truth
3. Update conflicting doc
4. Add cross-reference

### Issue: Can't Find Documentation
**Severity**: Medium
**Owner**: Librarian
**Process**:
1. Search CATALOGUE.md
2. If exists: Update INDEX.md for discoverability
3. If not exists: Create gap tracking ticket
4. Update navigation

### Issue: Naming Convention Violation
**Severity**: Low
**Owner**: Documentation QA Lead
**Process**:
1. Identify violation
2. Rename following NAMING_CONVENTION.md
3. Update all cross-references
4. Notify Librarian to update indexes

### Issue: Broken Links
**Severity**: Medium
**Owner**: Librarian
**Process**:
1. Identify broken link
2. Find correct target
3. Update link
4. Run full link validation

---

## Governance Roles & Responsibilities

### Human Oversight
- **Approves**: Major governance changes
- **Reviews**: Quarterly audit reports
- **Decides**: Standards updates, major reorganizations

### Documentation QA Lead (Agent)
- **Owns**: Quality standards, style guide
- **Reviews**: All new/updated documentation
- **Enforces**: Writing quality, consistency, polish

### Librarian (Agent)
- **Owns**: Navigation system (CATALOGUE.md, INDEX.md)
- **Maintains**: Cross-references, discoverability
- **Validates**: PRD/ARD compliance

### All Agents
- **Follow**: NAMING_CONVENTION.md, CLAUDE.md, VITAL.md
- **Create**: Documentation following standards
- **Invoke**: QA Lead and Librarian when needed

---

## Communication Channels

### When to Invoke Documentation QA Lead
```
Task: "Review this new PRD for quality"
Task: "Polish this documentation for executive review"
Task: "Check consistency across these 3 documents"
Task: "Create documentation style guide"
```

### When to Invoke Librarian
```
Task: "Update CATALOGUE.md with new service docs"
Task: "Help me find documentation about X"
Task: "Verify this implementation matches the ARD"
Task: "Check if we already have docs about Y"
```

### When to Invoke Both
```
Task: "Major documentation reorganization planned"
Task: "Creating new documentation category"
Task: "Quarterly documentation audit"
Task: "Launching new major feature with docs"
```

---

## Continuous Improvement

### Feedback Loop
1. **Gather**: Agent feedback on documentation findability
2. **Analyze**: What's working, what's not
3. **Improve**: Update standards, navigation, processes
4. **Communicate**: Share improvements with all agents
5. **Repeat**: Monthly cycle

### Standards Evolution
- **Review**: Standards every 6 months
- **Update**: Based on lessons learned
- **Version**: Increment NAMING_CONVENTION.md version
- **Migrate**: Update existing docs gradually

### Automation Opportunities
- Pre-commit hooks for version headers
- Automated link checking (CI/CD)
- Index generation from file metadata
- Compliance scanning

---

## Appendix A: Agent Required Reading Matrix

| Agent Type | Tier 1 (Critical) | Tier 2 (Navigation) | Tier 3 (Coordination) | Tier 4 (Specialized) |
|------------|-------------------|---------------------|----------------------|---------------------|
| **All Agents** | CLAUDE.md, VITAL.md, EVIDENCE_BASED_RULES.md, NAMING_CONVENTION.md | README.md, STRUCTURE.md, INDEX.md | AGENT_COORDINATION_GUIDE.md | N/A |
| **Service Agents** | ↑ Same | ↑ Same + CATALOGUE.md | RECOMMENDED_AGENT_STRUCTURE.md | Service-specific PRD/ARD |
| **Data Agents** | ↑ Same | ↑ Same + CATALOGUE.md | SQL_SUPABASE_SPECIALIST_GUIDE.md | Data schema docs |
| **Leadership Agents** | ↑ Same | ↑ Same + CATALOGUE.md | All coordination docs | Strategy/Vision docs |
| **Platform Agents** | ↑ Same | ↑ Same + CATALOGUE.md | AGENT_IMPLEMENTATION_GUIDE.md | Platform-specific docs |

---

## Appendix B: Documentation Creation Template

```markdown
# [Document Title]

**Version**: 1.0.0
**Last Updated**: [Month DD, YYYY]
**Status**: Draft | Review | Active | Deprecated
**Purpose**: [One sentence description]

---

## Overview

[What this document covers]

---

## [Main Content Sections]

[Your content here]

---

## Related Documentation

- [Link to related doc 1]
- [Link to related doc 2]

---

**Maintained By**: [Agent or team name]
**Questions?**: See [CATALOGUE.md] or ask [relevant agent]
```

---

**This governance plan ensures systematic quality and prevents documentation decay through clear roles, workflows, and enforcement mechanisms.**

**Effective Date**: November 23, 2025
**Review Cycle**: Quarterly
**Next Review**: February 23, 2026
