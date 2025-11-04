# Repository Archive

**Last Updated**: November 4, 2025  
**Purpose**: Organized archive of historical documentation, scripts, and SQL files

---

## 📁 Directory Structure

```
archive/
├── docs/                       # All documentation (80+ files)
│   ├── tools/                  # Tool registry documentation
│   ├── ask-panel/             # Ask Panel feature docs
│   ├── deployment/            # Deployment guides
│   ├── testing/               # Testing documentation
│   ├── audits/                # Audit reports
│   ├── guides/                # Integration guides
│   └── *.md                   # General docs
├── scripts/                   # Shell scripts (20+ files)
├── sql/                       # SQL migration files (10+ files)
└── legacy/                    # Legacy config files
```

---

## 📚 Documentation Categories

### 🛠️ Tools Documentation (`docs/tools/`)
**Tool registry, integration, and management**:
- Complete tool registry documentation
- Healthcare & Pharma tools
- Academic & Medical literature tools
- Strategic intelligence tools
- Tool lifecycle management
- Tool migration guides
- Frontend-backend tool integration

**Key Files**:
- Tool registry expansion guides
- Tool metadata updates
- Tool usage and feedback
- LangChain tool integration

### 🎯 Ask Panel Documentation (`docs/ask-panel/`)
**Ask Panel feature development**:
- Agent selector implementation
- Database inventory
- Railway integration
- User journey documentation
- Test execution reports
- Unit tests ready

### 🚀 Deployment Documentation (`docs/deployment/`)
**Deployment guides and processes**:
- Railway deployment guides
- RLS deployment
- Production deployment
- Manual deployment steps
- Deployment verification

### 🧪 Testing Documentation (`docs/testing/`)
**Testing guides and reports**:
- Testing guides (100% coverage)
- Test execution reports
- Integration testing
- Deployment testing

### 🔍 Audit Documentation (`docs/audits/`)
**Quality and compliance audits**:
- Pre-deployment audits
- Honest audit reviews
- Code quality audits
- RAG audit summaries

### 📖 Integration Guides (`docs/guides/`)
**Integration and setup guides**:
- LangChain integration guides
- LangFuse setup
- Quick reference guides
- Integration execution plans

### 📄 General Documentation (`docs/*.md`)
**Project-wide documentation**:
- Architecture summaries
- Project status reports
- Session progress
- Cleanup documentation
- Organization complete
- Final project status

---

## 🔧 Scripts (`scripts/`)

### Deployment Scripts
- `deploy-railway.sh` - Railway deployment
- `deploy-ai-engine-fresh.sh` - Fresh AI Engine deploy
- `deploy-ask-panel-railway.sh` - Ask Panel Railway deploy
- `deploy-both-cli.sh` - Deploy both services
- `deploy-marketing-cli.sh` - Marketing site deploy
- `deploy-platform-cli.sh` - Platform deploy
- `verify_railway_deployment.sh` - Deployment verification

### Server Management
- `COMPLETE_RESTART.sh` - Complete server restart
- `RESTART_SERVER_CLEAN.sh` - Clean server restart
- `KILL_ALL_SERVERS.sh` - Kill all running servers
- `CLEANUP_AND_RESTART.sh` - Cleanup and restart
- `FRESH_RESTART.sh` - Fresh restart
- `restart-digital-health.sh` - Restart digital health app

### Setup Scripts
- `create-test-user.sh` - Create test users
- `setup_tools_database.sh` - Setup tools database
- `setup-tenant-access.sh` - Setup tenant access
- `install_langchain_tools.sh` - Install LangChain tools

### Fix Scripts
- `FIX_ALL_ISSUES.sh` - Fix all issues
- `FIX_DEV_USER_ISSUE.sh` - Fix dev user issues
- `fix-import-paths.sh` - Fix import paths
- `MONOREPO_PACKAGE_FIX.sh` - Fix monorepo packages

### Testing Scripts
- `test-all-modes.sh` - Test all modes
- `test-ask-expert-modes.sh` - Test Ask Expert modes
- `quick_start_phase2_3.sh` - Quick start phases

### Diagnostic Scripts
- `QUICK_DIAGNOSTIC.sh` - Quick diagnostic
- `cleanup-non-critical-files.sh` - Cleanup files

### Cleanup Scripts
- `NUCLEAR_CLEANUP.sh` - Nuclear cleanup (use with caution!)
- `ADD_HOSTS_ENTRIES.sh` - Add hosts entries

---

## 📊 SQL Files (`sql/`)

### Setup SQL
- `ADD_SECOND_SUPERADMIN.sql` - Add superadmin
- `SETUP_SUPERADMIN_SIMPLE.sql` - Simple superadmin setup

### Migration SQL
- `drop_old_tools.sql` - Drop old tools
- `PRISM_PROMPT_TABLE_IDENTIFICATION.sql` - Prism prompts
- `VERIFY_AGENT_METRICS_MIGRATION.sql` - Verify migrations

---

## 🗂️ Legacy Files (`legacy/`)

**Historical configuration files**:
- `RAG-Domains.json` - RAG domain configuration
- `RAG_AUDIT_SUMMARY.txt` - RAG audit
- `requirements-literature-tools.txt` - Requirements
- `next-env.d.ts` - Next.js types (moved back to root)

---

## 📦 File Count Summary

| Category | Count | Description |
|----------|-------|-------------|
| **Tools Docs** | ~30 | Tool registry and integration |
| **Ask Panel Docs** | ~8 | Feature documentation |
| **Deployment Docs** | ~5 | Deployment guides |
| **Testing Docs** | ~5 | Testing documentation |
| **Audit Docs** | ~5 | Quality audits |
| **Guide Docs** | ~10 | Integration guides |
| **General Docs** | ~15 | Project documentation |
| **Scripts** | ~30 | Shell scripts |
| **SQL Files** | ~5 | SQL migrations |

**Total Archived**: ~115 files from root directory

---

## 🎯 Active Files (Root Directory)

Only **essential files** remain in root:

### Configuration
- `package.json` - NPM configuration
- `pnpm-workspace.yaml` - PNPM workspace
- `pnpm-lock.yaml` - Dependency lock
- `tsconfig.json` - TypeScript config
- `vercel.json` - Vercel config
- `railway.toml` - Railway config

### Docker
- `docker-compose.yml` - Main compose file
- `docker-compose.dev.yml` - Dev environment
- `docker-compose.backend.yml` - Backend only
- `docker-compose.python-only.yml` - Python services

### Documentation
- `README.md` - Main project documentation

### Other
- `Makefile` - Build automation
- `LICENSE` - Project license
- `CODEOWNERS` - Code ownership
- `.gitignore`, `.env*` - Git and env configs

---

## 🔍 Finding Specific Documentation

### By Topic:
```bash
# Find tool documentation
find archive/docs/tools -name "*"

# Find deployment docs
find archive/docs/deployment -name "*"

# Find testing docs
find archive/docs/testing -name "*"
```

### By Keyword:
```bash
# Search all archived docs
grep -r "keyword" archive/docs/

# Search specific category
grep -r "Railway" archive/docs/deployment/

# Search tool docs
grep -r "LangChain" archive/docs/tools/
```

### Scripts:
```bash
# List all scripts
ls archive/scripts/

# Find specific script
ls archive/scripts/ | grep deploy

# Find restart scripts
ls archive/scripts/ | grep -i restart
```

---

## 📝 Notes

1. **All files preserved** - Nothing deleted, only organized
2. **Scripts still functional** - Can run from archive if needed
3. **SQL files available** - For reference or reapplication
4. **Searchable** - Use grep/find to locate specific content
5. **Version controlled** - All in git for history

---

## 🚀 Quick Reference

**Need tool docs?** → `archive/docs/tools/`  
**Need deployment help?** → `archive/docs/deployment/`  
**Need to run script?** → `archive/scripts/`  
**Need SQL migration?** → `archive/sql/`  
**Need audit history?** → `archive/docs/audits/`

---

## 🎉 Result

**Before**: 95+ files in root directory (messy!)  
**After**: 11 essential config files (clean!)  
**Reduction**: **88%** cleanup

**Status**: ✅ Clean, organized, professional repository

