# Reviewing Documentation Workflow

**Version**: 1.0.0
**Last Updated**: November 23, 2025
**Status**: Active
**Purpose**: Step-by-step guide for the two-agent quality review model (Documentation QA Lead + Librarian)

---

## 📋 Quick Reference

**Who uses this workflow**:
- **Documentation QA Lead** - Quality, consistency, and style guardian
- **Librarian** (Implementation Compliance & QA Agent) - Organization, navigation, and discovery guardian
- **Human reviewers** - Stakeholders reviewing strategic documents

**Review types**:
- **Quality Review** (QA Lead): All new/updated documentation
- **Integration Review** (Librarian): New docs and MAJOR updates
- **Dual Review** (Both): Breaking changes, major strategic docs, reorganizations

---

## The Two-Agent Review Model

### Separation of Concerns

```
┌─────────────────────────────────────────┐
│      Documentation QA Lead              │
│                                         │
│  ✓ Writing quality and clarity         │
│  ✓ Consistency with style guide        │
│  ✓ Accuracy and completeness           │
│  ✓ Terminology compliance               │
│  ✓ Cross-reference accuracy             │
│  ✓ Final polish and professionalism    │
└─────────────────────────────────────────┘
                    ↓
           Quality Approved
                    ↓
┌─────────────────────────────────────────┐
│          Librarian Agent                │
│                                         │
│  ✓ Navigation integration               │
│  ✓ CATALOGUE.md updates                 │
│  ✓ INDEX.md updates                     │
│  ✓ Cross-reference validation           │
│  ✓ Duplicate detection                  │
│  ✓ Discoverability verification         │
│  ✓ PRD/ARD compliance (if applicable)   │
└─────────────────────────────────────────┘
                    ↓
        Integration Complete
                    ↓
              Published ✅
```

**Why separate roles?**
- **Quality focus**: QA Lead focuses solely on content quality without navigation concerns
- **Organization focus**: Librarian focuses solely on discoverability without style concerns
- **Scalability**: Each agent can work independently, reviewing different docs in parallel
- **Accountability**: Clear ownership - quality issues → QA Lead, findability issues → Librarian

---

## Review Type Matrix

| Document Change | QA Lead Review | Librarian Review | Approval Required |
|----------------|----------------|------------------|-------------------|
| **New document** | ✅ Required | ✅ Required | Both |
| **MAJOR update** (breaking) | ✅ Required | ✅ Required | Both |
| **MINOR update** (new content) | ✅ Required | ❌ Optional | QA Lead only |
| **PATCH update** (typos/fixes) | ❌ Skip | ❌ Skip | None |
| **PRD/ARD update** | ✅ Required | ✅ Required | Both + Stakeholder |
| **Documentation reorganization** | ✅ Required | ✅ Required | Both |

---

## Part 1: Documentation QA Lead Review

### When You're Invoked

**Typical invocation**:

```
Task: Review new documentation for quality and consistency

Document: [Full path to file]
Purpose: [What this document covers]
Category: [strategy/platform/services/architecture/coordination/workflows]
Target audience: [Developers/Agents/Stakeholders/All]
Update type: [New | MINOR | MAJOR]

Please review for:
- Writing quality and clarity
- Consistency with existing documentation
- Adherence to DOCUMENTATION_STYLE_GUIDE.md
- Completeness and accuracy
- Cross-reference validation

Status: [Draft | Review]
```

### Step 1: Initial Assessment

**First, verify basic requirements**:

- [ ] **Version header present** and complete
  ```markdown
  **Version**: [number]
  **Last Updated**: [date]
  **Status**: [status]
  **Purpose**: [one sentence]
  ```

- [ ] **Naming convention** followed (check [NAMING_CONVENTION.md](../../NAMING_CONVENTION.md))
  - Strategic docs: `UPPERCASE_PATTERN.md`
  - Guides: `UPPERCASE_GUIDE.md`
  - Technical docs: `lowercase-with-hyphens.md`

- [ ] **Correct category placement**
  - Does location match content type?
  - Is this in the right subdirectory?

**If basic requirements fail**:
```
⚠️  REVIEW BLOCKED: Basic requirements not met

Issues found:
- [Issue 1: e.g., No version header]
- [Issue 2: e.g., Wrong naming convention]
- [Issue 3: e.g., Incorrect category placement]

Please address these issues before requesting quality review.
```

**If basic requirements pass**: Proceed to Step 2

### Step 2: Quality Review Checklist

**Review against [DOCUMENTATION_STYLE_GUIDE.md](DOCUMENTATION_STYLE_GUIDE.md)**:

#### 2.1 Writing Quality

- [ ] **Active voice** used throughout
  - ✅ "We implement multi-tenancy"
  - ❌ "Multi-tenancy is implemented"

- [ ] **First-person plural** for VITAL team perspective
  - ✅ "We designed the system..."
  - ❌ "The system was designed..."

- [ ] **Present tense** for current state
  - ✅ "The platform supports..."
  - ❌ "The platform will support..." (unless future roadmap)

- [ ] **Clarity and conciseness**
  - No jargon without explanation
  - No unnecessarily complex sentences
  - Clear and specific language

- [ ] **Consistent tone** (professional, collaborative, authoritative)

#### 2.2 Structure and Organization

- [ ] **Logical flow** and hierarchy
  - Introduction → Body → Conclusion
  - Headings in logical order
  - Content grouped appropriately

- [ ] **Heading hierarchy** correct
  - Only one `#` (h1) per document
  - `##` (h2) for major sections
  - `###` (h3) for subsections
  - No skipped levels (e.g., `#` → `###`)

- [ ] **Parallel structure** in lists
  - ✅ "Create docs, Review content, Update versions"
  - ❌ "Create docs, Reviewing content, Versions should be updated"

- [ ] **Appropriate use** of lists, tables, code blocks
  - Lists for series of items
  - Tables for structured comparisons
  - Code blocks with proper syntax highlighting

#### 2.3 Terminology and Consistency

- [ ] **Approved terminology** used (check [DOCUMENTATION_STYLE_GUIDE.md](DOCUMENTATION_STYLE_GUIDE.md))
  - ✅ "VITAL Platform" (not "VITAL" or "Vital")
  - ✅ "Ask Expert" (not "ask-expert" or "AskExpert")
  - ✅ "Multi-Tenant" (hyphenated)

- [ ] **No deprecated terms**
  - ❌ "AI replacement" → ✅ "Human Amplification"
  - ❌ "Chatbot" → ✅ "Expert Agent" or "AI Agent"

- [ ] **Consistent capitalization**
  - Feature names: Consistent case
  - Technical terms: Consistent style

- [ ] **Consistent formatting**
  - Bold, italics, code formatting used uniformly
  - Same pattern for similar elements

#### 2.4 Technical Accuracy

- [ ] **Claims supported** by evidence
  - No unverified performance claims
  - No unsupported feature statements
  - Citations where appropriate

- [ ] **Code examples** correct and runnable
  - Syntax valid
  - Examples tested (if possible)
  - Proper language tags for highlighting

- [ ] **Accuracy** of technical details
  - API signatures correct
  - Schema references accurate
  - Configuration examples valid

- [ ] **No contradictions** with other documentation
  - Cross-check related docs
  - Verify consistency with PRD/ARD

#### 2.5 Cross-References and Links

- [ ] **All hyperlinks** functional
  - Internal links use correct relative paths
  - External links are accessible
  - Section anchors match actual headings

- [ ] **Appropriate cross-references** to related docs
  - Mentions related concepts? Link to them
  - References other features? Link to their docs
  - Uses terminology defined elsewhere? Link to glossary/guide

- [ ] **"Related Documentation"** section present and complete
  - At least 2-3 related doc links
  - Links include brief descriptions
  - Links to governance docs (CATALOGUE.md, etc.)

#### 2.6 Completeness

- [ ] **Purpose achieved**: Does the doc accomplish what it claims?

- [ ] **Target audience** needs met
  - Developers: Technical depth sufficient?
  - Agents: Clear actionable steps?
  - Stakeholders: Executive summary present?

- [ ] **No orphan sections**: Every section has content

- [ ] **Examples provided** where helpful

- [ ] **Troubleshooting** included (if applicable)

### Step 3: Provide Structured Feedback

**Use this feedback template**:

```markdown
## Documentation QA Review: [Filename]

**Reviewer**: Documentation QA Lead
**Review Date**: November 23, 2025
**Document Version**: [version]
**Review Status**: ✅ Approved | 🔄 Revision Required | ❌ Rejected

---

### Summary
[2-3 sentence overall assessment]

---

### Required Changes (MUST address before approval)

1. **[Issue Category]**: [Issue description]
   - **Location**: [Section or line reference]
   - **Problem**: [What's wrong]
   - **Fix**: [Specific correction needed]

2. **[Issue Category]**: [Issue description]
   - **Location**: [Section or line reference]
   - **Problem**: [What's wrong]
   - **Fix**: [Specific correction needed]

---

### Recommended Improvements (SHOULD address)

1. **[Improvement Category]**: [Description]
   - **Suggestion**: [Specific improvement]
   - **Why**: [Benefit of this change]

2. **[Improvement Category]**: [Description]
   - **Suggestion**: [Specific improvement]
   - **Why**: [Benefit of this change]

---

### Optional Enhancements (MAY address for future versions)

1. **[Enhancement]**: [Description]
2. **[Enhancement]**: [Description]

---

### Positive Highlights

- ✅ [What was done exceptionally well]
- ✅ [What demonstrates best practices]

---

### Next Steps

[For author]:
- Address all required changes
- Consider recommended improvements
- Re-request review when ready

[For reviewer]:
- [If approved] Forward to Librarian for integration (if applicable)
- [If revision required] Available for clarification questions

---

**Approval Status**: [APPROVED / REQUIRES REVISION / REJECTED]
**Estimated revision time**: [time estimate]
```

### Step 4: Handle Edge Cases

#### If Document is Truly Excellent

**Approve immediately with positive feedback**:

```markdown
## Documentation QA Review: [Filename]

**Review Status**: ✅ APPROVED

### Summary
Exceptional documentation that exceeds quality standards. Ready for integration.

### Highlights
- ✅ Clear, concise, and well-structured
- ✅ Perfect adherence to style guide
- ✅ Comprehensive cross-references
- ✅ Excellent examples and troubleshooting

### Required Changes
None

### Next Steps
- ✅ Quality approved
- Recommend forwarding to Librarian for integration
```

#### If Document Has Fundamental Issues

**Provide constructive criticism with clear path forward**:

```markdown
## Documentation QA Review: [Filename]

**Review Status**: 🔄 MAJOR REVISION REQUIRED

### Summary
This document has fundamental structural and quality issues that require significant revision before approval.

### Core Issues

1. **Structure**: Document organization does not match standard templates
   - **Fix**: Restructure using [template link] as reference

2. **Clarity**: Unclear purpose and audience
   - **Fix**: Define specific purpose and target audience in header

3. **Completeness**: Missing critical sections
   - **Fix**: Add [missing sections]

### Recommendation
Consider scheduling a review session to clarify requirements before continuing revisions.

### Next Steps
- Address core issues
- Consider consulting [DOCUMENTATION_STYLE_GUIDE.md](DOCUMENTATION_STYLE_GUIDE.md)
- Request preliminary feedback before full revision
```

#### If Document is PRD or ARD

**Apply specialized review criteria**:

```markdown
## PRD/ARD QA Review: [Filename]

**Review Status**: [Status]

### Strategic Document Review

**Additional checks for PRD/ARD**:
- [ ] Executive Summary present and comprehensive
- [ ] Problem Statement clear and evidence-based
- [ ] Success Metrics measurable and specific
- [ ] Risk assessment realistic and thorough
- [ ] Stakeholder review completed (if required)

**PRD-ARD Alignment**:
- [ ] Corresponding ARD exists and references this PRD
- [ ] Technical architecture aligns with requirements
- [ ] Both documents at compatible versions

[Continue with standard review template...]
```

---

## Part 2: Librarian Integration Review

### When You're Invoked

**Typical invocation**:

```
Task: Integrate new documentation into navigation system

Document: [Full path to file]
Category: [category]
Purpose: [One sentence purpose]
Status: Review (QA-approved, ready for integration)
Update type: [New | MAJOR]

Please:
1. Add to CATALOGUE.md
2. Update relevant INDEX.md files
3. Verify cross-references
4. Check for duplicates
5. Ensure discoverability

Related docs: [List any related documentation]
```

### Step 1: Pre-Integration Checks

**Verify document is ready**:

- [ ] **Status is "Review"** (QA-approved)
  - If status is "Draft": Return for QA Lead review first

- [ ] **Version header complete**
  ```markdown
  **Version**: [semantic version]
  **Last Updated**: [recent date]
  **Status**: Review
  **Purpose**: [clear purpose]
  ```

- [ ] **File in correct location**
  - Matches category claim
  - Follows naming convention

**If not ready**:
```
⚠️  INTEGRATION BLOCKED: Document not ready

Issues:
- Status: [current status] (should be "Review")
- Missing: [missing elements]

Please complete Quality Review before requesting integration.
```

### Step 2: Duplicate Detection

**Search for existing similar documentation**:

```bash
# Search by filename pattern
find .claude/docs/ -name "*[similar-name]*"

# Search by topic keywords
grep -r "[topic keyword]" .claude/docs/

# Check CATALOGUE.md
grep "[topic]" .claude/CATALOGUE.md
```

**If duplicate or very similar doc found**:

```
⚠️  POTENTIAL DUPLICATE DETECTED

Existing document found:
- Path: [existing-doc-path]
- Purpose: [existing doc purpose]
- Version: [version]

New document:
- Path: [new-doc-path]
- Purpose: [new doc purpose]

Recommendation:
1. Consolidate into existing doc, OR
2. Differentiate purposes clearly, OR
3. Deprecate old doc and replace with new

Please clarify the relationship between these documents before integration.
```

**If no duplicates**: Proceed to Step 3

### Step 3: CATALOGUE.md Integration

**Add entry to appropriate category in CATALOGUE.md**:

#### 3.1 Locate Correct Category Section

```markdown
## 📚 Documentation by Category

### Strategy Documents (X files)
[Existing entries...]

### Platform Documentation (X files)
[Existing entries...]

### [Find correct category]
```

#### 3.2 Add Entry Following Format

```markdown
### [Category Name] (X files)  ← Update count

| Document | Purpose | Owner | Version |
|----------|---------|-------|---------|
[Existing entries...]
| [New Doc](path/to/new-doc.md) | [One sentence purpose] | [Owner] | [Version] |
```

**Entry format rules**:
- Alphabetical order within category (unless chronological makes more sense)
- Relative path from `.claude/`
- Purpose matches document header
- Owner from "Maintained By" section
- Current version number

#### 3.3 Update Category Statistics

```markdown
### Strategy Documents (15 files)  ← Increment count
```

**Update in multiple places**:
- Category heading count
- Table of contents summary
- Overall statistics at top of CATALOGUE.md

### Step 4: INDEX.md Updates

**Determine which INDEX.md files need updates**:

| Document Type | INDEX.md Locations to Update |
|---------------|------------------------------|
| Strategy docs | `.claude/docs/strategy/INDEX.md` |
| Platform docs | `.claude/docs/platform/INDEX.md` |
| Service docs | `.claude/docs/services/INDEX.md` |
| Architecture | `.claude/docs/architecture/INDEX.md` |
| Coordination | `.claude/docs/coordination/INDEX.md` |
| Workflows | `.claude/docs/workflows/INDEX.md` |

#### 4.1 Update Category-Specific INDEX.md

**Add to appropriate section**:

```markdown
## [Section Name]

- [New Doc](./new-doc.md) - [Brief purpose]
[Existing entries...]
```

**Maintain organization**:
- Alphabetical or chronological order
- Grouped by subsection if applicable
- Consistent formatting with existing entries

#### 4.2 Update Main INDEX.md (If High-Impact Doc)

**For major strategic docs, update `.claude/docs/INDEX.md`**:

```markdown
## Quick Navigation by Role

### For All Agents
- [Core doc 1](...)
- [New major doc](path/to/doc.md) - [Why all agents need this]
[Existing entries...]
```

### Step 5: Cross-Reference Validation

**Verify all cross-references work**:

#### 5.1 Internal References (Same Document)

```markdown
Check patterns like:
[Link to section](#section-name)

Verify:
- Anchor matches actual heading
- Heading exists in document
- No typos in anchor format
```

#### 5.2 External References (Other Documents)

```markdown
Check patterns like:
[Related doc](../path/to/doc.md)
[Guide](../../NAMING_CONVENTION.md)

Verify:
- File exists at specified path
- Relative path is correct
- No broken links
```

**Test process**:
1. Open document in Markdown viewer
2. Click each hyperlink
3. Verify destination loads correctly

**If broken links found**:
```
⚠️  BROKEN LINKS DETECTED

Broken links in [filename]:
1. [Link text](broken-path.md) - File not found
2. [Link text](path.md#wrong-anchor) - Anchor doesn't exist

Please fix these links before integration.
```

#### 5.3 Back-References (Other Docs Linking Here)

**For NEW documents, consider adding back-references**:

```markdown
Example:
If new doc is "advanced-workflow-patterns.md"
And existing doc "basic-workflows.md" mentions advanced patterns
Consider adding link:

In basic-workflows.md:
"For advanced patterns, see [Advanced Workflow Patterns](../advanced-workflow-patterns.md)"
```

**Identify candidates**:
```bash
# Find docs that might benefit from linking to new doc
grep -r "[topic keyword]" .claude/docs/ | grep -v "[new-doc-name]"
```

### Step 6: Discoverability Verification

**Ensure document can be found in multiple ways**:

#### 6.1 Via CATALOGUE.md

- [ ] Entry added to correct category
- [ ] Purpose is clear and searchable
- [ ] Keywords in purpose match likely search terms

#### 6.2 Via INDEX.md

- [ ] Listed in category-specific INDEX.md
- [ ] Listed in role-specific navigation (if applicable)
- [ ] Listed in topic-specific index (if applicable)

#### 6.3 Via Search

**Verify document is findable by key terms**:

```bash
# Test searches that users might try
grep -r "keyword1" .claude/CATALOGUE.md
grep -r "keyword2" .claude/docs/INDEX.md
grep -r "topic" .claude/docs/[category]/INDEX.md
```

**If not findable by obvious keywords**:
```
💡 DISCOVERABILITY IMPROVEMENT SUGGESTED

Current purpose: [current purpose]
Suggested: [purpose with better keywords]

Reason: Users searching for [X] won't find this doc
Recommendation: Update purpose to include [keyword]
```

### Step 7: PRD/ARD Compliance Check (If Applicable)

**For feature/service documentation, verify alignment with PRD/ARD**:

#### 7.1 Locate Corresponding PRD/ARD

```bash
# Find related PRD
find .claude/docs/strategy/prd/ -name "*[feature-name]*"

# Find related ARD
find .claude/docs/strategy/ard/ -name "*[feature-name]*"
```

#### 7.2 Verify Implementation Matches Spec

**Check that documentation describes what PRD/ARD specified**:

- [ ] Requirements from PRD are addressed
- [ ] Architecture from ARD is reflected
- [ ] No undocumented features
- [ ] No missing requirements

**If misalignment found**:
```
⚠️  PRD/ARD ALIGNMENT ISSUE

PRD: [requirement from PRD]
Documentation: [what's described in new doc]

Discrepancy: [describe the mismatch]

Recommendation:
- Update documentation to match PRD, OR
- Update PRD to reflect actual implementation (with review), OR
- Document the variance as an intentional deviation

Please clarify before integration.
```

### Step 8: Provide Integration Summary

**Use this template**:

```markdown
## Librarian Integration Summary: [Filename]

**Reviewer**: Librarian (Implementation Compliance & QA Agent)
**Review Date**: November 23, 2025
**Document Version**: [version]
**Integration Status**: ✅ Integrated | 🔄 Action Required | ❌ Blocked

---

### Integration Complete

**Files updated**:
- ✅ [CATALOGUE.md](../../CATALOGUE.md) - Added to [category] section
- ✅ [docs/[category]/INDEX.md](../[category]/INDEX.md) - Added to [section]
- ✅ [Other INDEX.md if applicable]

**Navigation verified**:
- ✅ Findable via CATALOGUE.md search
- ✅ Findable via category INDEX.md
- ✅ Findable via role-based navigation (if applicable)

**Cross-references checked**:
- ✅ All internal links functional
- ✅ All external links functional
- ✅ Back-references added to [related-doc-1], [related-doc-2]

**Duplicates**:
- ✅ No duplicates found
- ℹ️ [If similar doc exists]: Differentiated by [how they differ]

**PRD/ARD Compliance** (if applicable):
- ✅ Aligned with [PRD-name]
- ✅ Matches architecture in [ARD-name]

---

### Next Steps

[For author]:
- ✅ Update status to "Active"
- ✅ Commit changes
- ✅ Notify relevant stakeholders (if applicable)

[For Documentation QA Lead]:
- ✅ Quality approved
- ✅ Integration complete
- ✅ Ready for publication

---

**Integration Status**: COMPLETE
**Document is now discoverable**: Yes
```

---

## Part 3: Dual Review Workflow

### When Both Agents Review Simultaneously

**Scenarios requiring dual review**:
1. New strategic documents (PRD/ARD)
2. MAJOR updates with breaking changes
3. Documentation reorganizations
4. New documentation categories

### Coordination Protocol

**Step-by-step coordination**:

```
1. Author requests review from BOTH agents in single prompt:

   "Task: Dual review - new strategic document

   Document: [path]
   Type: PRD
   Status: Draft

   @Documentation-QA-Lead: Please review for quality
   @Librarian: Please review for integration planning

   Both reviews requested in parallel."

2. Documentation QA Lead reviews FIRST (quality gate)
   - Provides quality feedback
   - Author revises based on feedback
   - QA Lead approves

3. Librarian reviews SECOND (integration gate)
   - Assumes quality is approved
   - Focuses on navigation and discoverability
   - Provides integration feedback
   - Author addresses integration concerns
   - Librarian approves and integrates

4. Both agents confirm in joint summary:

   "✅ DUAL REVIEW COMPLETE

   Documentation QA Lead: Approved for quality
   Librarian: Integrated into navigation

   Status: Ready for publication"
```

### Conflict Resolution

**If agents have conflicting feedback**:

#### Example Conflict

```
QA Lead: "Rename document to use UPPERCASE pattern"
Librarian: "Keep lowercase pattern for consistency with category"
```

#### Resolution Process

1. **Agents discuss** (if both invoked simultaneously):
   ```
   QA Lead: [Rationale for UPPERCASE]
   Librarian: [Rationale for lowercase]

   Joint decision: [Agreed approach]
   ```

2. **Escalate to human** (if agents can't resolve):
   ```
   ⚠️  REVIEWER CONFLICT

   QA Lead position: [position + rationale]
   Librarian position: [position + rationale]

   Human decision needed: Which approach should we take?
   ```

---

## Review Metrics and Quality Standards

### Documentation QA Lead Success Metrics

**Quality targets**:
- **First-pass approval rate**: >60% (indicates clear standards)
- **Required revisions**: <3 per document average
- **Review turnaround**: <24 hours for standard docs, <48h for complex
- **Post-publication issues**: <5% of documents have quality issues reported

### Librarian Success Metrics

**Integration targets**:
- **Broken links**: 0% (all links functional)
- **Discoverability**: >95% (users find docs in <2 searches)
- **Duplicate prevention**: 100% (no unintentional duplicates)
- **Integration turnaround**: <1 hour for standard docs

### Combined Quality Standards

**Gold standard documentation**:
- ✅ Zero required revisions (approved first pass)
- ✅ Zero broken links
- ✅ Comprehensive cross-references
- ✅ Perfect adherence to style guide
- ✅ Immediately discoverable via multiple paths

---

## Troubleshooting for Reviewers

### "Document seems good but I have a bad feeling"

**Trust your instincts and investigate**:

```
Analysis required:
- What specifically feels off?
- Is it structure, tone, accuracy, completeness?
- Compare to similar documents - how does it differ?
- Check if it matches target audience needs

Provide specific feedback even if hard to articulate:
"This document feels incomplete. Specifically, [section] needs [what's missing]."
```

### "Author disagrees with my feedback"

**Collaborative resolution**:

```
Response to author:
"I understand your perspective. Let me clarify my rationale:

[Explain why feedback was given]
[Reference specific standards or precedent]
[Provide examples]

If you still disagree, we can:
1. Consult [DOCUMENTATION_STYLE_GUIDE.md] for precedent
2. Request human review for final decision
3. Document this as an exception with rationale

What would you prefer?"
```

### "This document breaks the mold - is that okay?"

**Innovation vs. consistency balance**:

```
Evaluation questions:
- Does breaking the mold serve a clear purpose?
- Will this confuse users familiar with standard docs?
- Could this become a new template for similar docs?
- Is the innovation justified by improved clarity?

Decision framework:
✅ Approve if: Clear improvement over standard template
🔄 Revise if: Innovation creates confusion
💡 Document if: This could be a new standard pattern
```

---

## Examples

### Example 1: QA Lead Approves with Minor Suggestions

```markdown
## Documentation QA Review: VITAL_Ask_Expert_PRD.md

**Review Status**: ✅ APPROVED (with optional enhancements)

### Summary
Excellent strategic document that meets all quality standards. Ready for integration with Librarian.

### Required Changes
None

### Recommended Improvements
1. **Executive Summary**: Consider adding quantified business impact
   - Suggestion: "Expected to reduce expert consultation time by 40%"
   - Why: Makes business value more concrete for stakeholders

2. **Success Metrics**: Add baseline measurements
   - Suggestion: Include current state metrics for comparison
   - Why: Makes success evaluation more objective

### Positive Highlights
- ✅ Perfect structure following PRD template
- ✅ Clear, evidence-based problem statement
- ✅ Comprehensive technical architecture section
- ✅ Realistic risk assessment

### Next Steps
- ✅ Quality approved - forward to Librarian for integration
- Consider optional enhancements for future version

**Approval Status**: APPROVED
```

### Example 2: Librarian Integrates New Document

```markdown
## Librarian Integration Summary: CREATING_DOCUMENTATION_WORKFLOW.md

**Integration Status**: ✅ COMPLETE

### Files Updated
- ✅ [CATALOGUE.md](../../CATALOGUE.md) - Added to Coordination section (line 142)
- ✅ [docs/coordination/INDEX.md](../coordination/INDEX.md) - Added to Workflow Guides section

### Navigation Verification
- ✅ Findable via CATALOGUE.md → Coordination → Workflow Guides
- ✅ Findable via docs/coordination/INDEX.md → Process Documentation
- ✅ Findable via search: "creating documentation", "workflow", "new docs"

### Cross-References
- ✅ All 15 hyperlinks functional
- ✅ Back-references added to:
  - DOCUMENTATION_GOVERNANCE_PLAN.md (line 182)
  - UPDATING_DOCUMENTATION_WORKFLOW.md (Related docs section)
  - REVIEWING_DOCUMENTATION_WORKFLOW.md (Related docs section)

### Duplicates
- ✅ No duplicates
- ℹ️ Related to DOCUMENTATION_CONVENTION.md but serves different purpose
  - CONVENTION: General best practices
  - WORKFLOW: Step-by-step process

### Next Steps
- ✅ Update document status to "Active"
- ✅ Ready for publication

**Integration Status**: COMPLETE ✅
```

### Example 3: Dual Review with Feedback

```markdown
## DUAL REVIEW: VITAL_Ask_Panel_PRD.md

---

### Part 1: Documentation QA Lead Review

**Status**: 🔄 REVISION REQUIRED

**Required Changes**:
1. **Executive Summary**: Needs quantified business impact
   - Add: Expected cost savings, efficiency gains

2. **Technical Architecture**: Multi-agent orchestration needs detail
   - Add: How agents coordinate, conflict resolution, consensus mechanism

**Timeline**: Estimated 2 hours for revisions

---

### Part 2: Librarian Review (Conditional)

**Status**: ⏸️ PENDING QA APPROVAL

**Pre-Integration Notes**:
- ✅ No duplicates detected
- ✅ Proper category (strategy/prd)
- ℹ️ Will need back-reference from Ask Expert PRD (similar features)

**Next**: Await QA Lead approval before full integration review

---

### Joint Status
- QA Lead: Revision required
- Librarian: Awaiting QA approval
- Author: Please address QA feedback, then re-request dual review
```

---

## Related Documentation

- [CREATING_DOCUMENTATION_WORKFLOW.md](CREATING_DOCUMENTATION_WORKFLOW.md) - How to create new docs
- [UPDATING_DOCUMENTATION_WORKFLOW.md](UPDATING_DOCUMENTATION_WORKFLOW.md) - How to update existing docs
- [DOCUMENTATION_STYLE_GUIDE.md](DOCUMENTATION_STYLE_GUIDE.md) - Writing and formatting standards
- [DOCUMENTATION_GOVERNANCE_PLAN.md](../../DOCUMENTATION_GOVERNANCE_PLAN.md) - Overall governance framework
- [NAMING_CONVENTION.md](../../NAMING_CONVENTION.md) - File naming and versioning rules
- [CATALOGUE.md](../../CATALOGUE.md) - Master documentation index

---

**Maintained By**: Documentation QA Lead + Librarian (joint ownership)
**Questions?**:
- Quality issues → Invoke Documentation QA Lead
- Navigation issues → Invoke Librarian
- Process questions → See [DOCUMENTATION_GOVERNANCE_PLAN.md](../../DOCUMENTATION_GOVERNANCE_PLAN.md)

**Version History**:
- 1.0.0 (November 23, 2025): Initial workflow documentation (Phase 2 Week 3)
