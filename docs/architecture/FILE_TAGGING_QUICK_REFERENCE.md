# File Tagging Quick Reference

**Version:** 1.0  
**Date:** December 14, 2025  
**Purpose:** Quick reference for file tagging and organization

---

## File Header Template

### TypeScript/JavaScript
```typescript
/**
 * @production PRODUCTION_READY
 * @lastVerified 2025-12-14
 * @version 1.0.0
 * @category feature
 * @layer frontend
 * @author Team Name
 * @created 2025-12-14
 * @updated 2025-12-14
 */
```

### Python
```python
"""
PRODUCTION_TAG: PRODUCTION_READY
LAST_VERIFIED: 2025-12-14
VERSION: 1.0.0
CATEGORY: service
LAYER: domain
AUTHOR: Team Name
CREATED: 2025-12-14
UPDATED: 2025-12-14
"""
```

---

## Production Tags

| Tag | When to Use |
|-----|-------------|
| `PRODUCTION_READY` | ✅ Fully tested, deployed |
| `PRODUCTION_CORE` | ✅ Critical infrastructure |
| `NEEDS_REVIEW` | ⚠️ Works but needs improvement |
| `EXPERIMENTAL` | 🧪 Prototype/experimental |
| `DEPRECATED` | ❌ Superseded, remove after 30 days |
| `ARCHIVE` | 📦 Reference only |
| `STUB` | 🔨 Incomplete placeholder |

---

## Categories

### Frontend
- `api`, `feature`, `component`, `service`, `utility`, `type`, `config`, `hook`

### Backend
- `api`, `service`, `domain`, `infrastructure`, `worker`, `test`, `config`

### Database
- `schema`, `data`, `policy`, `function`

---

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | `PascalCase.tsx` | `UserProfile.tsx` |
| Services | `kebab-case.service.ts` | `auth.service.ts` |
| Types | `kebab-case.types.ts` | `user.types.ts` |
| Python | `snake_case.py` | `user_service.py` |
| Migrations | `YYYYMMDD_description.sql` | `20251214_add_users.sql` |

---

## File Location Rules

```
apps/vital-system/src/        → Frontend code
services/ai-engine/src/        → Backend code
packages/                      → Shared code
database/migrations/           → SQL migrations
docs/                          → Public docs
.claude/docs/                  → Internal docs
```

---

**See:** [FILE_ORGANIZATION_STANDARD.md](./FILE_ORGANIZATION_STANDARD.md) for complete details
