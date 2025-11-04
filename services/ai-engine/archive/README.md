# AI Engine Archive

**Last Updated**: November 4, 2025  
**Purpose**: Organized archive of development documentation, scripts, and historical files

---

## 📁 Directory Structure

```
archive/
├── docs/                    # All documentation
│   ├── deployment/          # Deployment guides (Railway, Modal, Docker, etc.)
│   ├── audits/             # Code quality, compliance, and security audits
│   ├── implementation/      # Feature implementation docs
│   ├── planning/           # Project plans, phases, and execution guides
│   └── status/             # Status reports, summaries, and checklists
├── scripts/                # Legacy deployment and utility scripts
└── tests/                  # Root-level test files (organized tests in tests/ dir)
```

---

## 📚 Documentation Categories

### 🚀 Deployment (`docs/deployment/`)
**144+ files** covering:
- Railway deployment guides and troubleshooting
- Docker build and containerization
- Modal serverless deployment
- Cloud Run deployment
- Nixpacks configuration
- Multi-environment setup

**Key Files**:
- RLS deployment scripts and guides
- Railway environment variable setup
- Docker build troubleshooting
- Service linking issues

### 🔍 Audits (`docs/audits/`)
**Quality and compliance documentation**:
- Code quality audits
- Security audits (RLS, tenant isolation)
- Compliance reports (Phase 0, 1, 2)
- Gap analyses vs. world-class standards
- Honest feedback and assessments

**Key Files**:
- Final compliance audits
- World-class guide gap analysis
- RLS testing documentation
- Code quality audit reports

### 🛠️ Implementation (`docs/implementation/`)
**Feature-specific documentation**:
- Mode 1-4 implementation docs
- Agent configuration and orchestration
- LangGraph workflow integration
- RAG tools enforcement
- Redis caching
- Feedback system
- Autonomous controller
- Billing system
- CLI actions

### 📋 Planning (`docs/planning/`)
**Project planning and execution**:
- 5-day implementation plan
- Phase 0, 1, 2 execution plans
- Day 1, 2, 3 execution guides
- Pre-deployment gap fix plans
- Milestone tracking

### 📊 Status (`docs/status/`)
**Progress tracking and reports**:
- Completion reports (Phase, Day)
- Status updates
- Verification checklists
- Testing progress reports
- Deployment status
- Startup debugging logs

---

## 🔧 Scripts (`scripts/`)

### Deployment Scripts
- `deploy-railway.sh` - Railway deployment
- `deploy-to-railway.sh` - Alternative Railway deploy
- `deploy-modal.sh` - Modal serverless deploy
- `deploy-cloud-run.sh` - GCP Cloud Run deploy
- `deploy-frameworks.sh` - Framework-specific deployment
- `modal_deploy.py` - Python Modal deployment script

### Build Scripts
- `build-cloud.sh` - Cloud build script
- `build-with-hub.sh` - Docker Hub build script

### Setup Scripts
- `set-env-vars.sh` - Environment variable setup
- `setup-local-infrastructure.sh` - Local dev setup
- `start-full-engine-test.sh` - Full engine test runner

### Utility Scripts
- `verify_deployment.py` - Deployment verification
- `wire_mode3_4.py` - Mode 3/4 wiring script
- `security_audit.py` - Security audit runner

---

## 🧪 Tests (`tests/`)

**Root-level test files** (moved from main directory):
- `test_full_engine_modes.py` - All modes integration test
- `test_langgraph_end_to_end.py` - LangGraph E2E test
- `test_langgraph_structure.py` - LangGraph structure validation
- `test_redis_caching.py` - Redis caching tests
- `test-frameworks.py` - Framework tests

**Note**: Organized test suite remains in `tests/` directory at project root.

---

## 📦 Migration Organization

Migrations are organized in `database/migrations/`:

```
database/migrations/
├── rls/                    # Row-Level Security migrations
├── seeds/
│   ├── use-cases/         # UC_RA_001-010, UC_CD_001-010, etc.
│   ├── tools/             # Tool registry seeds (35+ tools)
│   └── workflows/         # Workflow and prompt seeds
└── archived/              # Historical/deprecated migrations
```

---

## 🗂️ File Count Summary

| Category | Count | Description |
|----------|-------|-------------|
| Deployment Docs | ~50 | Railway, Docker, Modal, Cloud Run |
| Audit Docs | ~30 | Quality, compliance, security |
| Implementation Docs | ~40 | Features, modes, integrations |
| Planning Docs | ~20 | Phases, days, execution plans |
| Status Docs | ~20 | Reports, summaries, checklists |
| Scripts | ~15 | Deploy, build, setup, utility |
| Root Tests | ~5 | Integration and E2E tests |

**Total Archived**: ~180 files  
**Total Cleaned from Root**: ~170 markdown files + scripts + tests

---

## 🎯 Active Documentation (Root Level)

Only **2 active docs** remain in `services/ai-engine/`:

1. **`README.md`** - Main AI Engine documentation
2. **`FRONTEND_BACKEND_CONNECTION.md`** - Current setup status

**Everything else is archived here** for reference.

---

## 🔍 Finding Specific Documentation

### By Topic:
```bash
# Find deployment docs
find archive/docs/deployment -name "*railway*" -o -name "*docker*"

# Find audit reports
find archive/docs/audits -name "*audit*" -o -name "*compliance*"

# Find implementation docs for specific feature
find archive/docs/implementation -name "*langgraph*" -o -name "*mode*"

# Find planning docs
find archive/docs/planning -name "*phase*" -o -name "*day*"
```

### By Keyword:
```bash
# Search all archived docs for keyword
grep -r "keyword" archive/docs/

# Search specific category
grep -r "Railway" archive/docs/deployment/
```

---

## 🧹 Archive Maintenance

### When to Archive:
- ✅ Completed implementation documentation
- ✅ Historical status reports
- ✅ Deprecated deployment guides
- ✅ Legacy scripts replaced by new ones
- ✅ Old audit reports (keep latest in root)

### When to Keep in Root:
- ✅ Active README
- ✅ Current connection/setup status
- ✅ Active configuration files
- ✅ Current scripts in use

---

## 📝 Notes

1. **All docs are preserved** - Nothing was deleted, only organized
2. **Scripts are functional** - Archived scripts still work if needed
3. **Tests are supplementary** - Main test suite in `tests/` directory
4. **Searchable** - Use grep/find to locate specific docs
5. **Version controlled** - All in git for historical tracking

---

## 🚀 Quick Reference

**Need deployment help?** → `archive/docs/deployment/`  
**Need audit history?** → `archive/docs/audits/`  
**Need feature implementation details?** → `archive/docs/implementation/`  
**Need planning docs?** → `archive/docs/planning/`  
**Need status reports?** → `archive/docs/status/`  
**Need scripts?** → `archive/scripts/`  

---

**Archived on**: November 4, 2025  
**Reason**: Clean up repository, organize historical documentation  
**Status**: ✅ Complete - 170+ files organized

