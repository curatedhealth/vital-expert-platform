# Archive Directory

**Version:** 1.0  
**Date:** December 14, 2025  
**Last Updated:** December 14, 2025  
**Purpose:** Centralized archive for all historical and internal documentation

---

## Overview

This directory contains **all archived content** from across the codebase, consolidated into a single location for easy management and reference.

**Archive Policy:** Historical records, internal assessments, superseded documents, and reference materials.

---

## Directory Structure

```
archive/
├── audits/                          # Audit reports (17 files)
│   ├── frontend/                   # Frontend audits (6 files)
│   ├── deployment/                 # Deployment audits (3 files)
│   ├── backend/                    # Backend audits (2 files)
│   ├── ask-expert/                 # Ask Expert audits (2 files)
│   ├── agents/                     # Agents audit (1 file)
│   ├── assets/                     # Assets audit (1 file)
│   ├── ontology/                   # Ontology audit (1 file)
│   └── structure/                  # Structure audit (1 file)
│
├── database/                        # Database archives
│   ├── _archive/                   # Database archive files
│   └── migrations-archived/        # Archived migrations
│
├── scripts/                         # Script archives
│   └── _archive/                   # Archived scripts
│
├── apps/                            # Application archives
│   └── vital-system-archive/       # Vital system archive
│
├── services/                        # Service archives
│   └── ai-engine-archive/          # AI engine archive
│
├── supabase/                        # Supabase archives
│   └── migrations-archived-20251116/ # Archived migrations
│
├── claude/                          # Claude documentation archives
│   ├── .archive/                   # Claude archive
│   └── docs-archive/               # Claude docs archive
│
├── frontend-archive/                # Frontend archive
│
├── 2025-11-19-root-cleanup/         # Root cleanup archive (Nov 2025)
├── 2025-12-12/                      # Dated archive (Dec 12, 2025)
└── 2025-12-13-misleading-audit-files/ # Dated archive (Dec 13, 2025)
```

---

## Categories

### 1. Audits (`/archive/audits/`)

**Contents:** All internal audit reports organized by category  
**Total Files:** 17 audit reports  
**See:** [audits/README.md](./audits/README.md)

**Categories:**
- Frontend (6 files)
- Deployment (3 files)
- Backend (2 files)
- Ask Expert (2 files)
- Agents (1 file)
- Assets (1 file)
- Ontology (1 file)
- Structure (1 file)

---

### 2. Database Archives (`/archive/database/`)

**Contents:** Archived database files and migrations

**Subdirectories:**
- `_archive/` - Database archive files
- `migrations-archived/` - Archived SQL migrations

---

### 3. Script Archives (`/archive/scripts/`)

**Contents:** Archived utility scripts

**Subdirectories:**
- `_archive/` - Temporary and archived scripts

---

### 4. Application Archives (`/archive/apps/`)

**Contents:** Archived application code

**Subdirectories:**
- `vital-system-archive/` - Archived vital-system files

---

### 5. Service Archives (`/archive/services/`)

**Contents:** Archived service code

**Subdirectories:**
- `ai-engine-archive/` - Archived AI engine files

---

### 6. Supabase Archives (`/archive/supabase/`)

**Contents:** Archived Supabase migrations

**Subdirectories:**
- `migrations-archived-20251116/` - Migrations archived Nov 16, 2025

---

### 7. Claude Archives (`/archive/claude/`)

**Contents:** Archived Claude documentation

**Subdirectories:**
- `.archive/` - Claude archive
- `docs-archive/` - Claude docs archive

---

### 8. Frontend Archive (`/archive/frontend-archive/`)

**Contents:** Archived frontend files

---

### 9. Dated Archives

**Contents:** Date-specific archives

- `2025-11-19-root-cleanup/` - Root cleanup from Nov 19, 2025
- `2025-12-12/` - Archive from Dec 12, 2025
- `2025-12-13-misleading-audit-files/` - Archive from Dec 13, 2025

---

## Archive Policy

### What Gets Archived
- ✅ Internal audit reports
- ✅ Historical documentation
- ✅ Superseded plans and implementations
- ✅ Reference materials
- ✅ Deprecated code
- ✅ Old migrations
- ✅ Temporary scripts

### What Stays in Active Locations
- ❌ Public developer documentation (`/docs/`)
- ❌ Current architecture docs (`/docs/architecture/`)
- ❌ Active deployment guides (`/docs/guides/`)
- ❌ Current standards and references
- ❌ Active code

---

## Maintenance

- **Review Frequency:** Quarterly
- **Retention Policy:** Keep for historical reference
- **Cleanup:** Remove only if completely obsolete (after 2+ years)
- **Organization:** Maintain category structure

---

## Quick Reference

| Category | Location | Files |
|----------|----------|-------|
| **Audits** | `/archive/audits/` | 17 |
| **Database** | `/archive/database/` | Various |
| **Scripts** | `/archive/scripts/` | Various |
| **Apps** | `/archive/apps/` | Various |
| **Services** | `/archive/services/` | Various |
| **Supabase** | `/archive/supabase/` | Various |
| **Claude** | `/archive/claude/` | Various |
| **Frontend** | `/archive/frontend-archive/` | Various |
| **Dated** | `/archive/2025-*/` | Various |

---

## Consolidation Date

**Consolidated:** December 14, 2025  
**Reason:** Centralize all archive folders into single location  
**Source Locations:**
- `/docs/audits/` → `/archive/audits/`
- `/database/_archive` → `/archive/database/_archive`
- `/scripts/_archive` → `/archive/scripts/_archive`
- `/apps/vital-system/_archive` → `/archive/apps/vital-system-archive`
- `/services/ai-engine/archive` → `/archive/services/ai-engine-archive`
- `/supabase/migrations_ARCHIVED_*` → `/archive/supabase/`
- `/.claude/.archive` → `/archive/claude/.archive`
- `/archive/frontend/_archive` → `/archive/frontend-archive`

---

**Maintained By:** Platform Team  
**Status:** ✅ Consolidated and Organized
