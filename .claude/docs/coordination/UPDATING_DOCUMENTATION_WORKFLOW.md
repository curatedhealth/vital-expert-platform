# Updating Documentation Workflow

**Version**: 1.0.0
**Last Updated**: November 23, 2025
**Status**: Active
**Purpose**: Step-by-step guide for agents and developers updating existing documentation in the VITAL Platform

---

## 📋 Quick Reference

**When to use this workflow**: Updating any existing documentation file (corrections, additions, significant changes)

**Key principle**: Preserve history, increment versions correctly, maintain quality through review

**Update types and review requirements**:
- **Minor updates** (typos, small clarifications): No review needed
- **Major updates** (new sections, significant changes): Documentation QA Lead review required
- **Breaking changes** (restructure, major rewrites): Both QA Lead + Librarian review required

---

## Workflow Overview

```
Assess → Update → Version → Review → Integration Check → Publish
   ↓       ↓        ↓        ↓            ↓               ↓
  5m     15m-2h    2m     15-30m         5m              5m
```

---

## Step 1: Assess the Update

### 1.1 Classify Update Type

**Determine the scope of your changes**:

| Update Type | Definition | Examples | Version Change | Review Required |
|-------------|------------|----------|----------------|-----------------|
| **PATCH** | Minor fixes, no new content | Typo fixes, broken link repairs, formatting corrections | 1.0.0 → 1.0.1 | ❌ No |
| **MINOR** | New content, backward compatible | New sections, additional examples, expanded explanations | 1.0.0 → 1.1.0 | ✅ QA Lead |
| **MAJOR** | Breaking changes, restructure | Complete rewrite, structure changes, deprecated content | 1.0.0 → 2.0.0 | ✅ QA Lead + Librarian |

**Decision tree**:

```
Does this change the document structure? → Yes → MAJOR
                                        ↓
                                       No
                                        ↓
Does this add new information? → Yes → MINOR
                              ↓
                             No
                              ↓
Is this just a correction/fix? → Yes → PATCH
```

### 1.2 Check Document Status

**Read the current version header**:

```markdown
# [Document Title]

**Version**: 1.2.3
**Last Updated**: October 15, 2025
**Status**: Active | Deprecated
```

**Status meanings**:
- **Active**: Current, maintained documentation (update freely)
- **Deprecated**: Old documentation (create new version instead of updating)
- **Review**: Currently under review (coordinate with reviewer before editing)
- **Draft**: Work in progress (confirm ownership before editing)

**If status is "Deprecated"**:
- ⚠️ Don't update deprecated docs
- Create a new document following [CREATING_DOCUMENTATION_WORKFLOW.md](CREATING_DOCUMENTATION_WORKFLOW.md)
- Add migration path from old to new

### 1.3 Verify You Have the Right File

**Common mistake**: Editing a copy instead of the canonical version

**Verify canonical location**:

```bash
# Search for all files with this name
find .claude/docs/ -name "[filename].md"

# Expected: Only ONE result
# If multiple results: Check CATALOGUE.md for canonical location
```

**Check CATALOGUE.md**:

```bash
grep "[filename]" .claude/CATALOGUE.md
```

---

## Step 2: Make Your Updates

### 2.1 Read the Full Document First

**CRITICAL**: Understand context before editing

```markdown
Reading checklist:
- [ ] Understand document purpose
- [ ] Note existing structure and organization
- [ ] Identify related sections that might need updates
- [ ] Check cross-references to other docs
- [ ] Note any dependencies or prerequisites
```

**Why this matters**: Isolated edits can break coherence, create contradictions, or miss related sections that need updating.

### 2.2 Edit Following Style Standards

**Apply [DOCUMENTATION_STYLE_GUIDE.md](DOCUMENTATION_STYLE_GUIDE.md) standards**:

✅ **Consistency requirements**:
- Match existing tone and voice
- Follow existing heading hierarchy
- Use consistent terminology
- Maintain parallel structure in lists
- Preserve formatting patterns

❌ **Don't**:
- Change writing style arbitrarily
- Add new terminology without checking approved terms
- Mix formatting styles (e.g., `**bold**` vs `__bold__`)
- Break existing cross-reference patterns

### 2.3 Update Type-Specific Guidelines

#### For PATCH Updates (Typos, Small Fixes):

**Examples**:
- Fix typo: "teh" → "the"
- Repair broken link: `[Link](old-path.md)` → `[Link](correct-path.md)`
- Correct formatting: Missing code fence, bullet point fix

**Process**:
1. Make the correction
2. Update "Last Updated" date ONLY
3. Increment PATCH version (1.0.0 → 1.0.1)
4. No review required
5. Commit immediately

**Commit message format**:
```bash
git commit -m "fix(docs): Fix typo in [filename]"
```

#### For MINOR Updates (New Content):

**Examples**:
- Add new section
- Expand existing section with additional examples
- Add new troubleshooting items
- Clarify ambiguous content

**Process**:
1. Add new content
2. Update "Last Updated" date
3. Increment MINOR version (1.0.0 → 1.1.0)
4. Update version history section (if it exists)
5. ✅ Request Documentation QA Lead review
6. Address feedback
7. Commit after approval

**Commit message format**:
```bash
git commit -m "docs: Add [description] to [filename]

- Added new section on [topic]
- Expanded [section] with examples
- Reviewed by Documentation QA Lead

Version: 1.0.0 → 1.1.0
"
```

#### For MAJOR Updates (Breaking Changes):

**Examples**:
- Complete document restructure
- Change document purpose or scope
- Remove deprecated sections
- Major rewrite

**Process**:
1. Make changes
2. Update "Last Updated" date
3. Increment MAJOR version (1.0.0 → 2.0.0)
4. Add version history section (if doesn't exist)
5. Document migration path from v1 → v2
6. ✅ Request Documentation QA Lead review
7. ✅ Request Librarian integration check
8. Address all feedback
9. Commit after both approvals

**Commit message format**:
```bash
git commit -m "docs(breaking): Restructure [filename] - v2.0.0

BREAKING CHANGES:
- Restructured document organization
- Removed deprecated section on [X]
- Added new section on [Y]

Migration: See version history section
Reviewed by: Documentation QA Lead + Librarian

Version: 1.x.x → 2.0.0
"
```

### 2.4 Update Cross-References

**If you rename, move, or restructure sections**:

1. **Update internal links** (same document):
   ```markdown
   # Old heading
   [Link](#old-heading)

   # New heading
   [Link](#new-heading)
   ```

2. **Update external references** (other documents linking here):
   ```bash
   # Find files linking to this doc
   grep -r "filename.md" .claude/docs/

   # Update each file with new section links
   ```

3. **Update CATALOGUE.md references** (if applicable):
   - Librarian handles this for MAJOR updates
   - For MINOR updates, note in review request

---

## Step 3: Update Version Header

### 3.1 Version Number Rules

**Follow semantic versioning (SemVer)**:

```
MAJOR.MINOR.PATCH
  ↓     ↓     ↓
  2  .  1  .  3

MAJOR: Breaking changes, restructure
MINOR: New content, backward compatible
PATCH: Bug fixes, typos, small corrections
```

**Version increment logic**:

```
Current: 1.2.3

PATCH update:  1.2.3 → 1.2.4
MINOR update:  1.2.3 → 1.3.0  (reset PATCH to 0)
MAJOR update:  1.2.3 → 2.0.0  (reset MINOR and PATCH to 0)
```

### 3.2 Update "Last Updated" Date

**Always update** for any change (PATCH, MINOR, MAJOR):

```markdown
**Last Updated**: November 23, 2025
```

**Format**: `Month DD, YYYY` (e.g., "November 23, 2025")

### 3.3 Update Version History (For MINOR/MAJOR)

**If version history section exists**:

```markdown
## Version History

### Version 2.0.0 (November 23, 2025)
- **BREAKING**: Restructured document organization
- Removed deprecated section on legacy workflows
- Added new section on agent coordination
- Migration guide added

### Version 1.1.0 (October 15, 2025)
- Added troubleshooting section
- Expanded examples with real-world scenarios

### Version 1.0.0 (September 1, 2025)
- Initial release
```

**If version history doesn't exist** and you're making a MAJOR update:

**Add version history section** before "Related Documentation":

```markdown
---

## Version History

### Version 2.0.0 (November 23, 2025)
- **BREAKING**: [Your changes]
- Migration: [Migration path]

### Version 1.0.0 (September 1, 2025)
- Original release

---

## Related Documentation
[Existing links...]
```

---

## Step 4: Request Review (If Required)

### 4.1 PATCH Updates (No Review)

**Skip to Step 6 (Publish)**

PATCH updates don't require review. Commit and publish immediately.

### 4.2 MINOR Updates (QA Lead Review)

**Invoke Documentation QA Lead**:

```
Task: Review updated documentation

Document: [Full path]
Update type: MINOR (new content, backward compatible)
Version: [Old version] → [New version]
Changes made:
- [Change 1]
- [Change 2]
- [Change 3]

Please review for:
- Quality and clarity of new content
- Consistency with existing sections
- Adherence to DOCUMENTATION_STYLE_GUIDE.md
- Cross-reference accuracy

Status: Review (ready for QA approval)
```

**QA Lead will**:
- ✅ **Approve**: Proceed to Step 6 (Publish)
- 🔄 **Request changes**: Address feedback, re-request review
- ❌ **Recommend MAJOR version**: If changes are more significant than anticipated

### 4.3 MAJOR Updates (QA Lead + Librarian Review)

**First, invoke Documentation QA Lead**:

```
Task: Review major documentation update

Document: [Full path]
Update type: MAJOR (breaking changes)
Version: [Old version] → [New version]
Changes made:
- [Change 1]
- [Change 2]
- [Change 3]

Migration path: [How users transition from old to new]

Please review for:
- Quality and accuracy
- Migration path completeness
- Version history documentation
- Breaking change justification

Status: Review (ready for QA approval)
```

**After QA Lead approval, invoke Librarian**:

```
Task: Review major documentation update - integration impact

Document: [Full path]
Update type: MAJOR (breaking changes)
Version: [Old version] → [New version]
QA Lead: Approved
Changes made:
- [Summary of structural changes]

Please check:
- CATALOGUE.md entry (update version, note breaking changes)
- INDEX.md entries (verify navigation still works)
- Cross-references from other docs (may need updates)
- Duplicate detection (if document was split or merged)

Status: Review (ready for Librarian approval)
```

**Librarian will**:
- ✅ **Approve**: Proceed to Step 6 (Publish)
- 🔄 **Request updates**: Update navigation, then re-request
- ⚠️ **Flag issues**: Broken references, orphaned sections, etc.

---

## Step 5: Integration Check (MAJOR Updates Only)

### 5.1 Verify Navigation Updates

**Librarian will update**:

1. **CATALOGUE.md**:
   ```markdown
   | Document | Version | Category | Purpose |
   |----------|---------|----------|---------|
   | [Filename](path.md) | 2.0.0 | [Cat] | [Purpose] |
   ```

2. **INDEX.md** files:
   - Update any structural references
   - Note breaking changes if significant

3. **Cross-references**:
   - Update docs that link to changed sections
   - Verify all hyperlinks still work

### 5.2 Confirm Migration Path

**For MAJOR updates, ensure users can transition**:

```markdown
## Migration from v1.x to v2.0

**What changed**:
- [Old structure] → [New structure]
- [Removed section] → [Replacement or rationale]

**Action required**:
- If you were using [X], now use [Y]
- Old workflows deprecated, see [new-workflow.md]

**Backward compatibility**:
- [What still works from v1]
- [What's no longer supported]
```

---

## Step 6: Publish

### 6.1 Final Status Check

**Ensure status is correct**:

| Update Type | Final Status | Notes |
|-------------|-------------|-------|
| **PATCH** | Active | No status change |
| **MINOR** | Active | No status change |
| **MAJOR** | Active | Mark old version as "Deprecated" if you created a new file |

**If you rewrote in place** (same file, MAJOR version):
- Status remains "Active"
- Version history documents the change

**If you created a new file** (deprecated old, created new):
- New file: Status "Active"
- Old file: Status "Deprecated" + link to new version

### 6.2 Commit to Version Control

**PATCH commit**:
```bash
git add .claude/docs/[category]/[filename].md
git commit -m "fix(docs): Fix [description] in [filename]

Version: [old] → [new]
"
```

**MINOR commit**:
```bash
git add .claude/docs/[category]/[filename].md
git commit -m "docs: Add [description] to [filename]

- Added [section/content]
- Updated [section/content]
- Reviewed by Documentation QA Lead

Version: [old] → [new]
"
```

**MAJOR commit**:
```bash
git add .claude/docs/[category]/[filename].md
git add .claude/CATALOGUE.md
git add .claude/docs/INDEX.md
git commit -m "docs(breaking): Major update to [filename] - v[new]

BREAKING CHANGES:
- [Change 1]
- [Change 2]

Migration: [migration details or link to section]
Reviewed by: Documentation QA Lead + Librarian

Version: [old] → [new]
"
```

### 6.3 Notify Affected Users (MAJOR Only)

**For breaking changes, notify**:

- Agents who reference this doc in `required_reading`
- Teams who depend on this documentation
- Stakeholders who approved the original version

**Notification format**:

```
Documentation update: [Document Name] v[old] → v[new]

BREAKING CHANGES:
- [Change 1]
- [Change 2]

Migration: [Link to migration section or guide]
Location: .claude/docs/[category]/[filename].md
Status: Active

Please review and update any workflows or references.
```

---

## Special Cases

### Updating PRD or ARD

**Product Requirements Documents (PRD) and Architecture Requirements Documents (ARD) have special rules**:

1. **Version Alignment**:
   - Keep PRD and ARD versions in sync
   - If updating PRD to 2.0, update ARD to 2.0 (even if changes are minor)

2. **Dual Review**:
   - **PRD updates**: Documentation QA Lead + Product Owner
   - **ARD updates**: Documentation QA Lead + Technical Architect

3. **Implementation Tracking**:
   - After MAJOR PRD/ARD updates, notify Librarian to verify implementation matches specs
   - Librarian checks code/configs against new requirements

**PRD update workflow**:
```
1. Update PRD content
2. Review with Documentation QA Lead
3. Review with Product Owner
4. Update corresponding ARD (if needed)
5. Review ARD with Documentation QA Lead
6. Review ARD with Technical Architect
7. Notify Librarian to validate implementation alignment
8. Publish both PRD and ARD
```

### Updating Deprecated Documentation

**If a document is marked "Deprecated"**:

❌ **Don't**: Update the deprecated version
✅ **Do**: Create a new version following [CREATING_DOCUMENTATION_WORKFLOW.md](CREATING_DOCUMENTATION_WORKFLOW.md)

**Exception**: Critical security or factual correction
- Update the deprecated doc with correction
- Add prominent warning at top: "⚠️ This document is deprecated. See [new-version.md](link)"

### Updating Auto-Generated Documentation

**Some docs are auto-generated** (e.g., API specs, schema references):

❌ **Don't**: Manually edit auto-generated sections
✅ **Do**:
1. Update the source (code, schema, config)
2. Re-run the generation script
3. Review and commit the updated doc

**Identify auto-generated docs** by header comment:
```markdown
<!-- AUTO-GENERATED: Do not edit directly. Source: [location] -->
```

### Updating README Files

**README files have special update rules**:

1. **Keep them concise**: README = overview, not comprehensive guide
2. **Offload detail**: Link to detailed guides, don't duplicate content
3. **Update frequently**: READMEs should always reflect current state
4. **Version carefully**: Most README updates are PATCH or MINOR

**README update pattern**:
```markdown
# [Category] Documentation

**Version**: 1.2.0
**Last Updated**: November 23, 2025

Quick overview and links to detailed documentation.

## What's in this category
- [Doc 1](doc1.md) - Purpose
- [Doc 2](doc2.md) - Purpose

## Quick Start
[Brief instructions with link to full guide]

## Complete Documentation
See [INDEX.md](INDEX.md) for full category index.
```

---

## Quick Command Reference

### Pre-Update Checks

```bash
# Find current version
head -n 10 [filename].md | grep "Version:"

# Find all references to this doc
grep -r "[filename]" .claude/docs/

# Check CATALOGUE.md entry
grep "[filename]" .claude/CATALOGUE.md

# Check document status
head -n 10 [filename].md | grep "Status:"
```

### Post-Update Validation

```bash
# Verify version incremented correctly
head -n 10 [filename].md | grep "Version:"

# Verify date updated
head -n 10 [filename].md | grep "Last Updated:"

# Check for broken links (manual - open file and verify)
```

---

## Troubleshooting

### "I'm not sure if this is MINOR or MAJOR"

**Ask Documentation QA Lead**:

```
Task: Classify documentation update

Document: [filename]
Changes planned:
- [Change 1]
- [Change 2]

Should this be classified as MINOR or MAJOR?
```

### "I updated the file but don't see changes in navigation"

**Likely causes**:

1. **CATALOGUE.md not updated**: Invoke Librarian to update
2. **INDEX.md not updated**: Invoke Librarian to update
3. **Cached version**: Clear browser cache or re-read file

**Solution**:

```
Task: Update navigation for modified documentation

Document: [filename]
Version: [old] → [new]
Update type: [MINOR/MAJOR]

Please update CATALOGUE.md and INDEX.md references.
```

### "Documentation QA Lead requested MAJOR version but I thought it was MINOR"

**This happens when**:
- Structural changes are more significant than anticipated
- Content changes affect other dependent documentation
- Changes break existing workflows or references

**Solution**:
1. Accept the MAJOR version classification
2. Increment version accordingly (reset MINOR and PATCH to 0)
3. Add version history section documenting breaking changes
4. Request Librarian review for integration impact

### "I made a PATCH update but broke something"

**If a small fix caused issues**:

1. **Immediately revert** the commit:
   ```bash
   git revert [commit-hash]
   ```

2. **Investigate** what broke
3. **Create proper fix** following full workflow
4. **Classify correctly** (probably MINOR if it needs more thought)

---

## Examples

### Example 1: PATCH Update (Typo Fix)

**Scenario**: Fix typo in AGENT_QUICK_START.md

**Before**:
```markdown
**Version**: 1.0.0
**Last Updated**: September 1, 2025

Agents should check teh documentation before starting.
```

**After**:
```markdown
**Version**: 1.0.1
**Last Updated**: November 23, 2025

Agents should check the documentation before starting.
```

**Process**:
1. Fix typo: "teh" → "the"
2. Update version: 1.0.0 → 1.0.1
3. Update date: November 23, 2025
4. No review needed
5. Commit: `git commit -m "fix(docs): Fix typo in AGENT_QUICK_START.md - Version 1.0.0 → 1.0.1"`

### Example 2: MINOR Update (New Section)

**Scenario**: Add troubleshooting section to workflow guide

**Before**:
```markdown
**Version**: 1.0.0
**Last Updated**: October 1, 2025

## Step 1: [content]
## Step 2: [content]

## Related Documentation
[links]
```

**After**:
```markdown
**Version**: 1.1.0
**Last Updated**: November 23, 2025

## Step 1: [content]
## Step 2: [content]

## Troubleshooting

### Issue 1: [problem]
**Solution**: [fix]

### Issue 2: [problem]
**Solution**: [fix]

## Related Documentation
[links]
```

**Process**:
1. Add new "Troubleshooting" section
2. Update version: 1.0.0 → 1.1.0
3. Update date: November 23, 2025
4. Request Documentation QA Lead review
5. Address feedback
6. Commit after approval: `git commit -m "docs: Add troubleshooting section to [filename] - Version 1.0.0 → 1.1.0"`

### Example 3: MAJOR Update (Restructure)

**Scenario**: Restructure DOCUMENTATION_GOVERNANCE_PLAN.md

**Before** (v1.0.0):
```markdown
**Version**: 1.0.0
**Last Updated**: September 1, 2025

## Overview
## Agents
## Workflows
## Standards
```

**After** (v2.0.0):
```markdown
**Version**: 2.0.0
**Last Updated**: November 23, 2025

## Executive Summary
## Governance Model
  ### Documentation QA Lead
  ### Librarian
## Workflows
  ### Creating Documentation
  ### Updating Documentation
  ### Reviewing Documentation
## Standards and Conventions
## Enforcement and Audits

---

## Version History

### Version 2.0.0 (November 23, 2025)
- **BREAKING**: Complete document restructure
- Separated agent roles into dedicated subsections
- Reorganized workflows into clear hierarchy
- Added new "Enforcement and Audits" section
- Migration: Old "Agents" section split into "Governance Model" subsections

### Version 1.0.0 (September 1, 2025)
- Initial governance plan

---

## Related Documentation
[links, updated with new section anchors]
```

**Process**:
1. Restructure content with new organization
2. Update version: 1.0.0 → 2.0.0 (MAJOR)
3. Update date: November 23, 2025
4. Add version history section
5. Document migration path
6. Request Documentation QA Lead review
7. Request Librarian integration check
8. Address all feedback
9. Commit after both approvals: `git commit -m "docs(breaking): Restructure DOCUMENTATION_GOVERNANCE_PLAN.md - v2.0.0"`

---

## Related Documentation

- [CREATING_DOCUMENTATION_WORKFLOW.md](CREATING_DOCUMENTATION_WORKFLOW.md) - How to create new docs
- [REVIEWING_DOCUMENTATION_WORKFLOW.md](REVIEWING_DOCUMENTATION_WORKFLOW.md) - Review process details
- [DOCUMENTATION_STYLE_GUIDE.md](DOCUMENTATION_STYLE_GUIDE.md) - Writing and formatting standards
- [DOCUMENTATION_GOVERNANCE_PLAN.md](../../DOCUMENTATION_GOVERNANCE_PLAN.md) - Overall governance framework
- [NAMING_CONVENTION.md](../../NAMING_CONVENTION.md) - File naming and versioning rules
- [CATALOGUE.md](../../CATALOGUE.md) - Master documentation index

---

**Maintained By**: Documentation QA Lead
**Questions?**: Invoke the Documentation QA Lead or Librarian agent
**Version History**:
- 1.0.0 (November 23, 2025): Initial workflow documentation (Phase 2 Week 3)
