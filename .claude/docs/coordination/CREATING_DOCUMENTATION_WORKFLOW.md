# Creating Documentation Workflow

**Version**: 1.0.0
**Last Updated**: November 23, 2025
**Status**: Active
**Purpose**: Step-by-step guide for agents and developers creating new documentation in the VITAL Platform

---

## 📋 Quick Reference

**When to use this workflow**: Creating any new documentation file (PRD, ARD, guide, README, specification, etc.)

**Key principle**: Quality through systematic review - every document goes through QA Lead approval and Librarian integration

**Time estimate**:
- Simple docs (< 5 pages): 30-60 minutes
- Complex docs (PRD/ARD): 2-4 hours
- Major strategic docs: 4-8 hours (includes stakeholder review)

---

## Workflow Overview

```
Plan → Create → Review → Integrate → Publish
  ↓      ↓        ↓         ↓          ↓
 30m    1-4h     30m       15m        5m
```

---

## Step 1: Plan (Before You Write)

### 1.1 Determine Document Category

**Choose the correct category** for your documentation:

| Category | Location | Purpose | Examples |
|----------|----------|---------|----------|
| **Strategy** | `.claude/docs/strategy/` | Business strategy, vision, roadmap | PRD, ARD, strategic plans |
| **Platform** | `.claude/docs/platform/` | Platform architecture, infrastructure | System architecture, API specs |
| **Services** | `.claude/docs/services/` | Service-specific documentation | Ask Expert, Ask Panel, BYOAI |
| **Architecture** | `.claude/docs/architecture/` | Technical architecture | Data schema, backend, frontend |
| **Coordination** | `.claude/docs/coordination/` | Agent coordination, workflows | Agent guides, workflow processes |
| **Workflows** | `.claude/docs/workflows/` | Workflow templates, LangGraph | Workflow specifications |

**❓ Unsure?** → Invoke the Librarian agent to help categorize

### 1.2 Check for Existing Documentation

**CRITICAL**: Never duplicate existing documentation

```bash
# Search by topic
grep -r "your topic" .claude/docs/

# Search CATALOGUE.md
cat .claude/CATALOGUE.md | grep "keyword"

# Ask the Librarian
"Does documentation already exist about [topic]?"
```

**If similar docs exist**:
- Consider updating the existing doc instead of creating new
- If creating new, add cross-references to related docs
- Document why a separate file is needed

### 1.3 Choose Naming Convention

**Follow [NAMING_CONVENTION.md](../../NAMING_CONVENTION.md)**:

| Document Type | Pattern | Example |
|--------------|---------|---------|
| **Strategic docs** (PRD/ARD) | `UPPERCASE_TYPE.md` | `VITAL_Ask_Expert_PRD.md` |
| **Major guides** | `UPPERCASE_GUIDE.md` | `AGENT_QUICK_START.md` |
| **Service docs** | `lowercase-service-type.md` | `ask-expert-implementation-guide.md` |
| **README files** | `README.md` | `README.md` (in each directory) |
| **Technical specs** | `lowercase-with-hyphens.md` | `multi-tenant-architecture.md` |

**Filename checklist**:
- [ ] No spaces (use `-` or `_`)
- [ ] No special characters except `-` and `_`
- [ ] Descriptive and specific
- [ ] Consistent with category pattern
- [ ] Under 50 characters

### 1.4 Identify Cross-References

**Before writing, identify related documentation**:

```markdown
Related docs to link:
- [Core concept doc]
- [Related feature spec]
- [Technical implementation guide]
```

This ensures your new doc integrates well with existing knowledge.

---

## Step 2: Create (Write the Document)

### 2.1 Use the Version Header Template

**MANDATORY**: All documentation must start with a version header

```markdown
# [Document Title]

**Version**: 1.0.0
**Last Updated**: [Month DD, YYYY]
**Status**: Draft | Review | Active | Deprecated
**Purpose**: [One sentence describing what this document covers]

---
```

**Version numbering**:
- Start at **1.0.0** for all new documents
- Use semantic versioning: MAJOR.MINOR.PATCH
- Status: Start with "Draft" → "Review" → "Active"

### 2.2 Follow Document Structure Standards

**Use the appropriate template from [DOCUMENTATION_STYLE_GUIDE.md](DOCUMENTATION_STYLE_GUIDE.md)**:

#### For Strategic Documents (PRD/ARD):
```markdown
# [Product/Feature Name]

**Version**: 1.0.0
**Last Updated**: [Date]
**Status**: Draft
**Purpose**: [Purpose]

---

## Executive Summary
[2-3 paragraphs]

## Problem Statement
[What problem are we solving?]

## Solution Overview
[How do we solve it?]

## Requirements
### Functional Requirements
### Non-Functional Requirements

## Technical Architecture
[Architecture decisions]

## Success Metrics
[How we measure success]

## Risks and Mitigations
[What could go wrong?]

---

## Related Documentation
- [Link 1]
- [Link 2]

**Maintained By**: [Agent/Team]
**Questions?**: See [CATALOGUE.md](../../CATALOGUE.md)
```

#### For Guides and Process Documentation:
```markdown
# [Guide Title]

**Version**: 1.0.0
**Last Updated**: [Date]
**Status**: Draft
**Purpose**: [Purpose]

---

## Overview
[What this guide covers]

## Prerequisites
[What you need to know/have first]

## Step-by-Step Instructions
### Step 1: [Action]
[Details]

### Step 2: [Action]
[Details]

## Examples
[Real-world examples]

## Troubleshooting
[Common issues and solutions]

---

## Related Documentation
- [Link 1]

**Maintained By**: [Agent/Team]
```

### 2.3 Write Following Style Standards

**Apply [DOCUMENTATION_STYLE_GUIDE.md](DOCUMENTATION_STYLE_GUIDE.md) standards**:

✅ **Do**:
- Use active voice: "We implement" not "It is implemented"
- Use first-person plural: "We designed" not "The system was designed"
- Use approved terminology: "VITAL Platform" not "VITAL" or "Vital"
- Use Oxford commas: "agents, personas, and JTBDs"
- Be concise and specific
- Include code examples where relevant
- Add diagrams for complex concepts

❌ **Don't**:
- Use passive voice excessively
- Use deprecated terms (see DOCUMENTATION_STYLE_GUIDE.md)
- Create walls of text (use headings, lists, tables)
- Include unverified claims without evidence
- Skip cross-references to related docs

### 2.4 Add Cross-References

**Link to related documentation**:

```markdown
## Related Documentation

- [Core concept](../path/to/doc.md) - Brief description
- [Implementation guide](../path/to/guide.md) - Brief description
- [Technical spec](../architecture/spec.md) - Brief description

**See also**:
- [CATALOGUE.md](../../CATALOGUE.md) for complete documentation index
- [NAMING_CONVENTION.md](../../NAMING_CONVENTION.md) for file standards
```

**Relative path format**:
- Same directory: `[Link](filename.md)`
- Parent directory: `[Link](../filename.md)`
- From `.claude/docs/`: `[Link](../category/filename.md)`
- From `.claude/`: `[Link](../../filename.md)`

---

## Step 3: Self-Review (Before Submitting)

### 3.1 Quality Checklist

**Before invoking Documentation QA Lead, verify**:

- [ ] **Version header** present and complete
- [ ] **Status** set to "Draft"
- [ ] **Purpose** is clear and one sentence
- [ ] **Naming convention** followed (check NAMING_CONVENTION.md)
- [ ] **Writing style** follows DOCUMENTATION_STYLE_GUIDE.md
- [ ] **Active voice** used throughout
- [ ] **Approved terminology** used (no deprecated terms)
- [ ] **Headings** are hierarchical and descriptive
- [ ] **Lists** have parallel structure
- [ ] **Code examples** formatted correctly with syntax highlighting
- [ ] **Cross-references** added to related docs
- [ ] **No broken links** (verify all hyperlinks work)
- [ ] **Spell check** complete
- [ ] **Grammar check** complete
- [ ] **Factual accuracy** verified

### 3.2 Category Verification

**Confirm file is in correct location**:

```bash
# Expected path format:
.claude/docs/[category]/[filename].md

# Example for strategy doc:
.claude/docs/strategy/prd/VITAL_Ask_Expert_PRD.md

# Example for coordination guide:
.claude/docs/coordination/CREATING_DOCUMENTATION_WORKFLOW.md
```

---

## Step 4: Request Documentation QA Review

### 4.1 Invoke Documentation QA Lead

**Use this exact prompt template**:

```
Task: Review new documentation for quality and consistency

Document: [Full path to file]
Purpose: [What this document covers]
Category: [strategy/platform/services/architecture/coordination/workflows]
Target audience: [Developers/Agents/Stakeholders/All]

Please review for:
- Writing quality and clarity
- Consistency with existing documentation
- Adherence to DOCUMENTATION_STYLE_GUIDE.md
- Completeness and accuracy
- Cross-reference validation

Status: Draft (ready for review)
```

### 4.2 Address Feedback

**Documentation QA Lead will provide**:
- Required changes (MUST address before approval)
- Recommended improvements (SHOULD address)
- Optional enhancements (MAY address for future versions)

**Response process**:
1. Read all feedback carefully
2. Address all required changes
3. Address recommended improvements where possible
4. Document any skipped recommendations with rationale
5. Update "Last Updated" date
6. Keep status as "Draft" until approved

### 4.3 Request Final Approval

**After revisions, request re-review**:

```
Task: Final review of revised documentation

Document: [Full path to file]
Changes made:
- [Change 1]
- [Change 2]
- [Change 3]

Please provide final approval or additional feedback.
```

**Documentation QA Lead will**:
- ✅ **Approve**: Change status to "Review"
- 🔄 **Request revision**: Provide additional feedback
- ❌ **Reject**: Explain fundamental issues (rare)

### 4.4 Update Status to "Review"

**Once approved by QA Lead**:

```markdown
**Status**: Review
```

This signals the document is quality-approved and ready for integration.

---

## Step 5: Request Librarian Integration

### 5.1 Invoke Librarian Agent

**Use this exact prompt template**:

```
Task: Integrate new documentation into navigation system

Document: [Full path to file]
Category: [category]
Purpose: [One sentence purpose]
Status: Review (QA-approved, ready for integration)

Please:
1. Add to CATALOGUE.md
2. Update relevant INDEX.md files
3. Verify cross-references
4. Check for duplicates
5. Ensure discoverability

Related docs: [List any related documentation]
```

### 5.2 Librarian Integration Tasks

**Librarian will perform**:

1. **CATALOGUE.md Update**
   - Add new entry with full path, purpose, owner
   - Ensure correct category placement
   - Update file count statistics

2. **INDEX.md Updates**
   - Add to category-specific INDEX.md
   - Add to role-specific navigation (if applicable)
   - Update topic-based indexes

3. **Cross-Reference Validation**
   - Verify all links in new doc work
   - Add back-links from related docs (if needed)
   - Check for orphan documentation

4. **Duplicate Check**
   - Confirm no similar doc exists
   - If similar exists, recommend consolidation or differentiation

5. **Discoverability Verification**
   - Ensure doc is findable via INDEX.md
   - Ensure doc is findable via CATALOGUE.md
   - Ensure doc is findable via search keywords

### 5.3 Integration Approval

**Librarian will respond with**:
- ✅ **Integration complete**: List of updated files
- 🔄 **Action required**: Need clarification or categorization
- ⚠️ **Issues found**: Duplicate detection or navigation conflicts

**If action required**:
1. Address Librarian's feedback
2. Make necessary changes
3. Request re-integration

---

## Step 6: Publish

### 6.1 Update Status to "Active"

**Once Librarian integration is complete**:

```markdown
**Status**: Active
```

This signals the document is:
- ✅ Quality-approved (by Documentation QA Lead)
- ✅ Integrated into navigation (by Librarian)
- ✅ Ready for public use

### 6.2 Commit to Version Control

**Create a descriptive commit message**:

```bash
git add .claude/docs/[category]/[filename].md
git commit -m "docs: Add [document name] - [brief description]

- Created [filename].md in [category]
- Reviewed by Documentation QA Lead
- Integrated by Librarian
- Status: Active

Related: #[issue number if applicable]
"
```

### 6.3 Notify Relevant Agents (If Applicable)

**For high-impact documentation, notify**:

- Agents who will use this doc (add to required_reading)
- Agents who maintain related systems
- Stakeholders who requested the doc

**Notification format**:

```
New documentation available: [Document Name]

Location: .claude/docs/[category]/[filename].md
Purpose: [One sentence]
Audience: [Who should read this]
Status: Active

Quick link: [Relative path]
```

---

## Quick Command Reference

### Self-Service Quality Checks

```bash
# Check naming convention compliance
ls .claude/docs/[category]/ | grep -v "^[A-Z_]*.md$\|^[a-z-]*.md$"

# Search for existing similar docs
grep -r "keyword" .claude/docs/

# Validate all links in a file (manual check)
# Open file, verify each [link](path) resolves

# Check version header exists
head -n 10 [filename].md | grep "Version:"
```

### Common Locations

```
Strategy docs:     .claude/docs/strategy/
PRDs:              .claude/docs/strategy/prd/
ARDs:              .claude/docs/strategy/ard/
Platform docs:     .claude/docs/platform/
Service docs:      .claude/docs/services/
Architecture docs: .claude/docs/architecture/
Coordination docs: .claude/docs/coordination/
Workflow docs:     .claude/docs/workflows/
```

---

## Troubleshooting

### "I don't know which category to use"

**Solution**: Invoke the Librarian agent

```
Task: Help categorize new documentation

Document topic: [Your topic]
Content summary: [2-3 sentences]
Target audience: [Who will read this]

Which category should this go in?
```

### "Documentation QA Lead requested changes I don't understand"

**Solution**: Ask for clarification

```
Task: Clarify review feedback

Document: [filename]
Feedback item: [Quote the specific feedback]

Could you please explain this feedback in more detail?
What specific changes are you recommending?
```

### "My document doesn't fit the standard templates"

**Solution**: Consult Documentation QA Lead before writing

```
Task: Review custom document structure

Document type: [What kind of doc]
Purpose: [What it covers]
Proposed structure: [Your outline]

Does this structure work, or should I use a standard template?
```

### "I created the doc in the wrong location"

**Solution**: Move it and notify Librarian

```
Task: Relocate documentation

Current location: [old path]
Correct location: [new path]
Reason: [Why it needs to move]

Please move the file and update all navigation references.
```

---

## Examples

### Example 1: Creating a New PRD

**Scenario**: Creating PRD for new "Ask Panel" feature

**Step 1: Plan**
- Category: Strategy (PRD subcategory)
- Location: `.claude/docs/strategy/prd/`
- Filename: `VITAL_Ask_Panel_PRD.md` (follows UPPERCASE pattern)
- Check existing: No similar PRD exists

**Step 2: Create**
```markdown
# VITAL Platform - Ask Panel Service PRD

**Version**: 1.0.0
**Last Updated**: November 23, 2025
**Status**: Draft
**Purpose**: Product requirements for multi-agent panel consultation feature

---

## Executive Summary
[Content...]

## Related Documentation
- [Ask Expert PRD](VITAL_Ask_Expert_PRD.md) - Related consultation feature
- [Multi-Agent Orchestration](../architecture/multi-agent-orchestration.md)
```

**Step 3: Self-Review**
- [x] Version header ✅
- [x] UPPERCASE naming ✅
- [x] Cross-references ✅
- [x] Active voice ✅

**Step 4: Request Review**
```
Task: Review new documentation for quality and consistency

Document: .claude/docs/strategy/prd/VITAL_Ask_Panel_PRD.md
Purpose: Product requirements for multi-agent panel consultation feature
Category: strategy/prd
Target audience: Product team, developers, stakeholders

Please review for quality and consistency.
Status: Draft
```

**Step 5: Integration**
```
Task: Integrate new documentation into navigation system

Document: .claude/docs/strategy/prd/VITAL_Ask_Panel_PRD.md
Category: strategy/prd
Purpose: Product requirements for multi-agent panel consultation feature
Status: Review (QA-approved)

Please integrate into CATALOGUE.md and INDEX.md files.
```

**Step 6: Publish**
- Update status to "Active"
- Commit with message: `docs: Add Ask Panel PRD - Product requirements for multi-agent consultation`

### Example 2: Creating a Technical Guide

**Scenario**: Creating guide for database schema design

**Step 1: Plan**
- Category: Architecture
- Location: `.claude/docs/architecture/data-schema/`
- Filename: `schema-design-guide.md` (lowercase pattern for guides)
- Check existing: `GOLD_STANDARD_SCHEMA.md` exists but focuses on standards, not design process

**Step 2: Create**
```markdown
# Database Schema Design Guide

**Version**: 1.0.0
**Last Updated**: November 23, 2025
**Status**: Draft
**Purpose**: Step-by-step guide for designing normalized, scalable database schemas for VITAL Platform

---

## Overview
This guide explains our schema design philosophy and provides step-by-step instructions for creating new tables, relationships, and constraints.

## Prerequisites
- Read [GOLD_STANDARD_SCHEMA.md](GOLD_STANDARD_SCHEMA.md)
- Understand multi-tenant architecture
- Familiarity with PostgreSQL and Supabase

[Continue with content...]
```

**Step 3-6**: Same review, integration, and publish process

---

## Related Documentation

- [DOCUMENTATION_GOVERNANCE_PLAN.md](../../DOCUMENTATION_GOVERNANCE_PLAN.md) - Overall governance framework
- [UPDATING_DOCUMENTATION_WORKFLOW.md](UPDATING_DOCUMENTATION_WORKFLOW.md) - How to update existing docs
- [REVIEWING_DOCUMENTATION_WORKFLOW.md](REVIEWING_DOCUMENTATION_WORKFLOW.md) - Review process details
- [DOCUMENTATION_STYLE_GUIDE.md](DOCUMENTATION_STYLE_GUIDE.md) - Writing and formatting standards
- [NAMING_CONVENTION.md](../../NAMING_CONVENTION.md) - File naming rules
- [CATALOGUE.md](../../CATALOGUE.md) - Master documentation index

---

**Maintained By**: Documentation QA Lead
**Questions?**: Invoke the Documentation QA Lead or Librarian agent
**Version History**:
- 1.0.0 (November 23, 2025): Initial workflow documentation (Phase 2 Week 3)
