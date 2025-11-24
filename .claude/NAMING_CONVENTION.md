# VITAL Platform - Naming Convention & Versioning Guide

**Version**: 1.0.0
**Last Updated**: November 23, 2025
**Status**: Official Standard

---

## 📋 Table of Contents

1. [File Naming Standards](#file-naming-standards)
2. [Versioning System](#versioning-system)
3. [Directory Naming](#directory-naming)
4. [Special Files](#special-files)
5. [Examples](#examples)

---

## 📝 File Naming Standards

### Core Documentation Files (Root Level)

**Format**: `UPPERCASE.md`

| File Name | Purpose | Location | Version Required |
|-----------|---------|----------|------------------|
| `README.md` | Main entry point | Root of directory | ✅ Yes |
| `INDEX.md` | Navigation index | Documentation root | ✅ Yes |
| `STRUCTURE.md` | Directory structure | `.claude/` | ✅ Yes |
| `CHANGELOG.md` | Version history | Project root | ✅ Yes |
| `CONTRIBUTING.md` | Contribution guide | Project root | No |
| `LICENSE.md` | License information | Project root | No |

**Versioning in Headers**:
```markdown
# Document Title

**Version**: 1.0.0
**Last Updated**: November 23, 2025
**Status**: Active | Draft | Deprecated
```

---

### Topic Documentation Files

**Format**: `TOPIC_NAME_TYPE.md` or `TOPIC-NAME-TYPE.md`

**Use underscores or hyphens consistently within a directory.**

#### Pattern Options:

**Option 1 - Underscores** (Recommended for Technical Docs):
```
ASK_EXPERT_SERVICE_PRD.md
DATA_SCHEMA_MIGRATION_GUIDE.md
AGENT_COORDINATION_GUIDE.md
```

**Option 2 - Hyphens** (Recommended for User-Facing Docs):
```
ask-expert-service-prd.md
data-schema-migration-guide.md
workflow-designer-guide.md
```

**Prefixes**:
- `VITAL_` - Platform-wide documents
- `SERVICE_` - Service-specific documents
- `AGENT_` - Agent-related documents

#### Document Type Suffixes:

| Suffix | Purpose | Example |
|--------|---------|---------|
| `_PRD` | Product Requirements | `ASK_EXPERT_SERVICE_PRD.md` |
| `_ARD` | Architecture Requirements | `ASK_EXPERT_SERVICE_ARD.md` |
| `_GUIDE` | How-to guide | `DEPLOYMENT_GUIDE.md` |
| `_SPEC` | Technical specification | `API_SPEC.md` |
| `_REFERENCE` | Reference documentation | `API_REFERENCE.md` |
| `_ARCHITECTURE` | Architecture documentation | `SYSTEM_ARCHITECTURE.md` |
| `_DESIGN` | Design documentation | `UI_DESIGN.md` |
| `_PLAN` | Planning documentation | `MIGRATION_PLAN.md` |
| `_REPORT` | Status/analysis report | `AUDIT_REPORT.md` |
| `_INDEX` | Index/catalog | `DOCUMENTATION_INDEX.md` |

---

## 🔢 Versioning System

### Semantic Versioning (SemVer)

**Format**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes, major rewrites
- **MINOR**: New features, significant additions
- **PATCH**: Bug fixes, minor updates, clarifications

#### Examples:
- `1.0.0` - Initial release
- `1.1.0` - Added new section
- `1.1.1` - Fixed typos, clarified wording
- `2.0.0` - Complete restructure

### Version Header Format

```markdown
# Document Title

**Version**: 1.2.3
**Last Updated**: November 23, 2025
**Status**: Active
**Previous Version**: 1.2.2 (Link to changelog)
**Next Review**: December 23, 2025

---

## Version History

### Version 1.2.3 (November 23, 2025)
- Fixed: Typos in section 3
- Updated: API endpoint examples
- Added: Security considerations

### Version 1.2.0 (November 15, 2025)
- Added: New deployment workflow section
- Updated: Architecture diagrams

### Version 1.0.0 (November 1, 2025)
- Initial release
```

### Status Values

| Status | Description | When to Use |
|--------|-------------|-------------|
| `Draft` | Work in progress | Document being written |
| `Review` | Under review | Awaiting feedback |
| `Active` | Current official version | Production use |
| `Deprecated` | Outdated, use newer version | Being phased out |
| `Archived` | Historical reference only | No longer applicable |

---

## 📁 Directory Naming

### Standards

1. **Lowercase with hyphens**: `ask-expert`, `data-schema`, `workflow-designer`
2. **Clear, descriptive names**: Avoid abbreviations unless widely understood
3. **Consistent depth**: Keep directory hierarchy shallow (max 3-4 levels)

### Directory Structure Pattern

```
docs/
├── strategy/              ← Category (singular or plural, be consistent)
│   ├── vision/            ← Subcategory (lowercase, hyphens)
│   ├── prd/              ← Acronyms lowercase
│   └── ard/
│
├── services/             ← Plural for collections
│   ├── ask-expert/        ← Hyphenated service names
│   └── ask-panel/
│
└── architecture/         ← Singular for type
    ├── data-schema/       ← Hyphenated compound names
    └── api/
```

---

## 📄 Special Files

### README Files

**Always**: `README.md` (exact case)

**Required In**:
- Every major directory
- Every service directory
- Every category in docs/

**Must Include**:
- Version number
- Last updated date
- Purpose/Overview
- Quick navigation
- Contact/Maintainer info (if applicable)

**Template**:
```markdown
# [Directory Name]

**Version**: 1.0.0
**Last Updated**: November 23, 2025
**Purpose**: Brief description

---

## Overview

[What this directory contains]

## Quick Navigation

- [Link 1](path/to/doc)
- [Link 2](path/to/doc)

## Getting Started

[How to use these documents]

---

**Maintainer**: [Team/Person]
**Last Review**: [Date]
```

### INDEX Files

**Always**: `INDEX.md` (exact case)

**Purpose**: Quick navigation
**Location**: Documentation roots only

---

## 📐 Examples

### Good Examples ✅

**Strategy Documents**:
```
/docs/strategy/
├── README.md                          (v1.0.0)
├── vision/
│   ├── README.md                      (v1.0.0)
│   ├── VITAL_PLATFORM_VISION.md       (v2.1.0)
│   └── COMPETITIVE_ANALYSIS.md        (v1.3.0)
└── prd/
    ├── README.md                      (v1.0.0)
    ├── ASK_EXPERT_SERVICE_PRD.md      (v3.2.1)
    └── ASK_PANEL_SERVICE_PRD.md       (v2.0.0)
```

**Service Documents**:
```
/docs/services/ask-expert/
├── README.md                          (v1.1.0)
├── ASK_EXPERT_PRD.md                  (v3.2.1)
├── ASK_EXPERT_ARD.md                  (v3.1.0)
├── ASK_EXPERT_IMPLEMENTATION_GUIDE.md (v2.0.0)
└── ASK_EXPERT_API_REFERENCE.md        (v2.5.0)
```

**Architecture Documents**:
```
/docs/architecture/data-schema/
├── README.md                          (v1.0.0)
├── DATABASE_SCHEMA_OVERVIEW.md        (v4.1.0)
├── MIGRATION_GUIDE.md                 (v2.3.0)
└── agents/
    ├── README.md                      (v1.0.0)
    └── AGENT_SCHEMA_SPEC.md           (v1.2.0)
```

### Bad Examples ❌

```
❌ readme.md                    → Use README.md
❌ Readme.MD                    → Use README.md
❌ askExpert_prd.md             → Use ASK_EXPERT_PRD.md
❌ ask expert service.md        → Use ASK_EXPERT_SERVICE.md
❌ doc_v2.md                    → Version in header, not filename
❌ temp_notes.md                → No temp files in docs
❌ DRAFT_architecture.md        → Status in header, not filename
```

---

## 🔄 Migration Guide

### Renaming Existing Files

1. **Check current name**: `old-file-name.md`
2. **Apply convention**: `NEW_FILE_NAME.md` or `new-file-name.md`
3. **Add version header** if missing
4. **Update all references** in other documents
5. **Update INDEX.md** if applicable

### Adding Versions to Existing Docs

```markdown
# Existing Document Title

<!-- Add at top, after title -->
**Version**: 1.0.0
**Last Updated**: November 23, 2025
**Status**: Active

---

<!-- Rest of document -->
```

---

## ✅ Checklist for New Documents

- [ ] Follow naming convention (UPPERCASE or lowercase-with-hyphens)
- [ ] Include version header
- [ ] Include last updated date
- [ ] Include status
- [ ] Add to INDEX.md if applicable
- [ ] Add README.md to new directories
- [ ] Use consistent naming within directory
- [ ] No spaces in filenames
- [ ] No special characters except `-` and `_`
- [ ] Descriptive, not cryptic names

---

## 📚 Quick Reference

### File Naming Pattern
```
[PREFIX_][TOPIC_NAME_][TYPE].md
```

### Version Header Template
```markdown
**Version**: X.Y.Z
**Last Updated**: Month DD, YYYY
**Status**: Active | Draft | Deprecated
```

### Directory Pattern
```
lowercase-with-hyphens/
```

---

**Official Standard**: All new documents must follow this convention
**Effective Date**: November 23, 2025
**Review Cycle**: Quarterly
