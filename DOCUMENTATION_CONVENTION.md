# Documentation Naming Convention

This document defines the standard naming convention for all documentation files in the VITAL Platform monorepo.

## File Naming Standards

### 1. Core Documentation Files

Located at the root of each project/package:

| File Name | Purpose | Example Path |
|-----------|---------|--------------|
| `README.md` | **Main entry point** for the project/package | `/README.md`, `/apps/vital-system/README.md` |
| `CHANGELOG.md` | Version history and release notes | `/CHANGELOG.md` |
| `CONTRIBUTING.md` | Contribution guidelines | `/CONTRIBUTING.md` |
| `LICENSE.md` | License information | `/LICENSE.md` |

**Rule**: Use **UPPERCASE** for core documentation files at root level.

### 2. Feature/Component Documentation

Located within feature/component directories:

| Pattern | Purpose | Example |
|---------|---------|---------|
| `README.md` | Overview of the feature/component | `src/features/workflow-designer/README.md` |
| `ARCHITECTURE.md` | Architecture and design decisions | `src/features/workflow-designer/ARCHITECTURE.md` |
| `API.md` | API documentation | `src/features/workflow-designer/API.md` |
| `USAGE.md` | Usage guide and examples | `src/features/workflow-designer/USAGE.md` |

**Rule**: Use **UPPERCASE** with descriptive suffixes for specialized docs.

### 3. Topic-Specific Documentation

For specific topics, features, or guides:

| Pattern | Purpose | Example |
|---------|---------|---------|
| `{TOPIC}-GUIDE.md` | Step-by-step guide | `DEPLOYMENT-GUIDE.md`, `TESTING-GUIDE.md` |
| `{FEATURE}-SPEC.md` | Feature specification | `MODE1-ENHANCED-SPEC.md` |
| `{INTEGRATION}-INTEGRATION.md` | Integration documentation | `LANGGRAPH-INTEGRATION.md` |
| `{TOPIC}-REFERENCE.md` | Reference documentation | `API-REFERENCE.md` |

**Rule**: Use **UPPERCASE** with descriptive **SUFFIX** separated by hyphens.

### 4. Special Documentation Files

For utility or process documentation:

| Pattern | Purpose | Example |
|---------|---------|---------|
| `MIGRATION-{VERSION}.md` | Migration guides | `MIGRATION-V1-TO-V2.md` |
| `TROUBLESHOOTING.md` | Common issues and solutions | `TROUBLESHOOTING.md` |
| `FAQ.md` | Frequently asked questions | `FAQ.md` |
| `GLOSSARY.md` | Terms and definitions | `GLOSSARY.md` |

### 5. Archived/Legacy Documentation

For deprecated or archived documentation:

| Pattern | Purpose | Example |
|---------|---------|---------|
| `README.{date}.md` | Archived main docs | `README.2024-11-20.md` |
| `{TOPIC}.ARCHIVED.md` | Archived topic docs | `OLD-WORKFLOW.ARCHIVED.md` |
| `archive/{date}/README.md` | Archived in directory | `archive/2025-11-19-root-cleanup/README.md` |

**Rule**: Use `.ARCHIVED` suffix or `archive/` directory with date.

## Directory Structure for Documentation

### Recommended Structure

```
project-root/
├── README.md                           # Main project documentation
├── DOCUMENTATION_CONVENTION.md         # This file
├── CHANGELOG.md                        # Version history
├── CONTRIBUTING.md                     # How to contribute
├── LICENSE.md                          # License
│
├── docs/                               # Main documentation directory
│   ├── README.md                       # Docs index
│   ├── ARCHITECTURE.md                 # System architecture
│   ├── API-REFERENCE.md                # API documentation
│   ├── DEPLOYMENT-GUIDE.md             # Deployment instructions
│   ├── TESTING-GUIDE.md                # Testing instructions
│   ├── TROUBLESHOOTING.md              # Common issues
│   ├── guides/                         # Step-by-step guides
│   │   ├── GETTING-STARTED.md
│   │   ├── WORKFLOW-DESIGNER-GUIDE.md
│   │   └── AGENT-SETUP-GUIDE.md
│   ├── specs/                          # Feature specifications
│   │   ├── MODE1-ENHANCED-SPEC.md
│   │   └── AGENT-SELECTION-SPEC.md
│   └── integrations/                   # Integration docs
│       ├── LANGGRAPH-INTEGRATION.md
│       ├── SUPABASE-INTEGRATION.md
│       └── OPENAI-INTEGRATION.md
│
├── apps/
│   └── vital-system/
│       ├── README.md                   # App-specific docs
│       └── src/
│           └── features/
│               └── workflow-designer/
│                   ├── README.md       # Feature overview
│                   ├── ARCHITECTURE.md # Feature architecture
│                   └── API.md          # Feature API
│
└── services/
    └── ai-engine/
        ├── README.md                   # Service docs
        └── docs/
            ├── API-REFERENCE.md
            └── DEPLOYMENT-GUIDE.md
```

## Current Documentation Cleanup Plan

### Files to Rename/Consolidate

| Current Location | Issue | Recommended Action |
|-----------------|-------|-------------------|
| `apps/vital-system/README_WORKFLOW_DESIGNER.md` | Inconsistent naming | **Rename to**: `docs/WORKFLOW-DESIGNER-GUIDE.md` |
| `apps/vital-system/scripts/README-NOTION-SYNC.md` | Inconsistent separator | **Rename to**: `scripts/NOTION-SYNC-GUIDE.md` |
| `apps/vital-system/scripts/README-MCP-VS-REST.md` | Not a README | **Rename to**: `scripts/MCP-VS-REST-COMPARISON.md` |
| `services/ai-engine/archive/docs/deployment/README_DOCKER_BUILD_CLOUD.md` | Underscore separator | **Keep in archive** (old file) |
| `services/ai-engine/archive/docs/deployment/README_DEPLOYMENT.md` | Underscore separator | **Keep in archive** (old file) |
| `supabase/migrations_ARCHIVED_20251116/README_APPLY_MIGRATIONS.md` | Underscore separator | **Keep in archive** (old file) |

### Documentation to Create

Based on current codebase features:

1. **`docs/ARCHITECTURE.md`** - Overall system architecture
2. **`docs/API-REFERENCE.md`** - Complete API documentation
3. **`docs/DEPLOYMENT-GUIDE.md`** - Production deployment guide
4. **`docs/TESTING-GUIDE.md`** - Testing procedures
5. **`docs/TROUBLESHOOTING.md`** - Common issues and solutions
6. **`docs/integrations/LANGGRAPH-INTEGRATION.md`** - LangGraph setup
7. **`docs/integrations/SUPABASE-INTEGRATION.md`** - Database setup
8. **`docs/guides/WORKFLOW-DESIGNER-GUIDE.md`** - Designer usage guide
9. **`docs/guides/AGENT-SETUP-GUIDE.md`** - Agent configuration
10. **`docs/specs/MODE1-ENHANCED-SPEC.md`** - Mode 1 specification
11. **`docs/specs/AGENT-SELECTION-SPEC.md`** - Agent selection feature

## Naming Rules Summary

### ✅ DO

- Use **UPPERCASE** for main documentation files
- Use **hyphens** (`-`) to separate words
- Use descriptive **suffixes** for specialized docs:
  - `-GUIDE` for step-by-step instructions
  - `-SPEC` for specifications
  - `-INTEGRATION` for integration docs
  - `-REFERENCE` for reference documentation
  - `-API` for API documentation
- Use `README.md` as the **entry point** for any directory
- Use dates in `YYYY-MM-DD` format for archived files
- Keep file names **concise but descriptive**

### ❌ DON'T

- Use underscores (`_`) - use hyphens (`-`) instead
- Use lowercase for core documentation files at root
- Create `README-{TOPIC}.md` - use `{TOPIC}-GUIDE.md` instead
- Mix naming conventions within the same directory
- Create deeply nested documentation structures
- Duplicate documentation across multiple locations

## Migration Script

To rename existing files according to this convention:

```bash
#!/bin/bash
# Run from project root

# Rename inconsistent files
mv apps/vital-system/README_WORKFLOW_DESIGNER.md docs/WORKFLOW-DESIGNER-GUIDE.md
mv apps/vital-system/scripts/README-NOTION-SYNC.md apps/vital-system/scripts/NOTION-SYNC-GUIDE.md
mv apps/vital-system/scripts/README-MCP-VS-REST.md apps/vital-system/scripts/MCP-VS-REST-COMPARISON.md

# Similarly for other apps
mv apps/pharma/scripts/README-NOTION-SYNC.md apps/pharma/scripts/NOTION-SYNC-GUIDE.md
mv apps/pharma/scripts/README-MCP-VS-REST.md apps/pharma/scripts/MCP-VS-REST-COMPARISON.md

echo "Documentation files renamed according to convention"
```

## Examples

### Good Examples ✅

```
README.md                           # Main project docs
CHANGELOG.md                        # Version history
docs/ARCHITECTURE.md                # System architecture
docs/API-REFERENCE.md               # API docs
docs/DEPLOYMENT-GUIDE.md            # Deployment guide
docs/guides/GETTING-STARTED.md      # Getting started guide
docs/specs/MODE1-ENHANCED-SPEC.md   # Feature specification
docs/integrations/LANGGRAPH-INTEGRATION.md  # Integration
src/features/workflow-designer/README.md    # Feature entry point
```

### Bad Examples ❌

```
README_WORKFLOW_DESIGNER.md         # Use: WORKFLOW-DESIGNER-GUIDE.md
readme.md                           # Use: README.md (uppercase)
workflow-designer-readme.md         # Use: README.md or WORKFLOW-DESIGNER-GUIDE.md
README-NOTION-SYNC.md               # Use: NOTION-SYNC-GUIDE.md
documentation.md                    # Use: README.md or specific name
workflow_designer_docs.md           # Use: WORKFLOW-DESIGNER-GUIDE.md (hyphens)
```

## Documentation Content Guidelines

### Every README.md Should Include

1. **Title/Overview** - What is this?
2. **Features** - What does it do?
3. **Installation/Setup** - How to get started?
4. **Usage** - How to use it?
5. **API/Reference** - Detailed reference (or link to it)
6. **Examples** - Practical examples
7. **Troubleshooting** - Common issues
8. **Contributing** - How to contribute (if applicable)
9. **License** - License information (if applicable)

### Every Guide Should Include

1. **Objective** - What will you learn?
2. **Prerequisites** - What do you need?
3. **Step-by-Step Instructions** - Numbered steps
4. **Screenshots/Examples** - Visual aids
5. **Verification** - How to verify it worked?
6. **Troubleshooting** - What if it doesn't work?
7. **Next Steps** - Where to go from here?

## Review Checklist

Before committing documentation:

- [ ] File name follows naming convention
- [ ] File is in the correct directory
- [ ] Content follows content guidelines
- [ ] Links are working and use relative paths
- [ ] Code examples are tested
- [ ] Screenshots are up-to-date (if applicable)
- [ ] No sensitive information (API keys, passwords)
- [ ] Grammar and spelling checked
- [ ] Markdown renders correctly

## Tools

### Recommended Tools for Documentation

- **VS Code Extensions**:
  - Markdown All in One
  - Markdown Preview Enhanced
  - markdownlint
  - Code Spell Checker

- **Online Tools**:
  - [Markdown Tables Generator](https://www.tablesgenerator.com/markdown_tables)
  - [Shields.io](https://shields.io/) for badges
  - [Carbon](https://carbon.now.sh/) for code screenshots

## Questions?

If you're unsure about naming:

1. Check this convention guide
2. Look at existing well-named documentation
3. Follow the pattern: `{TOPIC}-{TYPE}.md`
   - TOPIC: What it's about (WORKFLOW-DESIGNER, MODE1, API)
   - TYPE: What kind of doc (GUIDE, SPEC, REFERENCE, INTEGRATION)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-11-23 | Initial documentation convention |

---

**Last Updated**: 2024-11-23  
**Maintained By**: VITAL Platform Team









