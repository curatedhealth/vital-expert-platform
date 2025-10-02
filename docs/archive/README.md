# Documentation Archive

This folder contains historical documentation that provides context for past architectural decisions and development phases.

## Important Historical Documents

### Core Documentation
- **CHANGELOG.md** - Project changelog and version history
- **CONTRIBUTING.md** - Contributing guidelines
- **SECURITY.md** - Security policy and vulnerability reporting

### Reference Documentation
- **AGENTS_QUICK_REFERENCE.md** - Quick reference guide for agents
- **PLATFORM_ARCHITECTURE.md** - Historical architecture decisions
- **README-HYBRID-ARCHITECTURE.md** - Hybrid architecture approach
- **VITAL_AI_PLATFORM_PRD.md** - Original Product Requirements Document
- **VITAL_AI_CHAT_SYSTEM.md** - Chat system design documentation
- **MINIMAL_IMPLEMENTATION_PLAN.md** - Historical implementation planning

## Archive Policy

This archive contains documents that:
1. Provide historical context for architectural decisions
2. Document the evolution of the platform
3. Serve as reference for understanding past implementations

## Finding Deleted Documentation

If you're looking for temporary implementation reports (migrations, fixes, audits), they have been removed to reduce clutter. The work they documented is complete and preserved in git history:

```bash
# View commit history for specific topics
git log --all --grep="migration"
git log --all --grep="implementation"

# Search for deleted files
git log --all --full-history -- "docs/archive/DELETED_FILE.md"

# Restore a deleted file
git checkout <commit-hash> -- "docs/archive/DELETED_FILE.md"
```

## Archive Backup

A backup of the full archive (before cleanup) is available:
- **docs-archive-backup-20251002.tar.gz** (in project root)

---

**Note**: For current, active documentation, see the main [docs/README.md](../README.md) file.
