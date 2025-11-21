# VITAL Platform Structure - Correct Organization

**Last Updated**: November 21, 2024  
**Status**: ✅ Correct Structure Confirmed

---

## 🎯 Core Principle

**APPLICATION CODE = ROOT**  
**DOCUMENTATION & OPS = .vital-cockpit/**

---

## ✅ Correct Structure

```
VITAL path/                          🏠 PROJECT ROOT
│
├── apps/                            ✅ Frontend Applications (ROOT)
│   ├── pharma/                      - Pharma app
│   ├── vital-system/                - Main system app
│   ├── digital-health-startup/      - Startup app
│   ├── payers/                      - Payers app
│   ├── marketing/                   - Marketing app
│   ├── consulting/                  - Consulting app
│   └── web/                         - Web app
│
├── services/                        ✅ Backend Services (ROOT)
│   ├── ai-engine/                   - Main AI engine
│   ├── api-gateway/                 - API gateway
│   ├── ai-engine-services/          - AI services
│   ├── shared-kernel/               - Shared code
│   └── vital-ai-services/           - Additional services
│
├── tests/                           ✅ Test Suites (ROOT)
│   ├── additional/                  - Additional tests
│   ├── test-prompt-starters-api.js
│   └── test_supabase_connection.js
│
├── database/                        ✅ Active Database (ROOT)
│   ├── migrations/                  - Production migrations
│   ├── seeds/                       - Database seeds
│   └── ...
│
├── package.json                     ✅ Workspace Config (ROOT)
├── pnpm-workspace.yaml              ✅ pnpm Workspace (ROOT)
├── pnpm-lock.yaml                   ✅ Lock File (ROOT)
├── tsconfig.json                    ✅ TypeScript Config (ROOT)
├── next-env.d.ts                    ✅ Next.js Types (ROOT)
├── vercel.json                      ✅ Deployment Config (ROOT)
├── LICENSE                          ✅ License (ROOT)
│
└── .vital-cockpit/                  📚 Documentation & Ops ONLY
    ├── vital-expert-docs/           - Technical documentation
    │   ├── 01-strategy/
    │   ├── 02-goals/
    │   ├── 03-product/
    │   ├── 04-services/
    │   ├── 05-assets/
    │   ├── 06-architecture/
    │   ├── 07-integrations/
    │   ├── 08-implementation/
    │   ├── 10-api/
    │   ├── 11-data-schema/
    │   ├── 14-compliance/
    │   ├── 15-training/
    │   └── 16-releases/
    │
    └── .vital-ops/                  - DevOps Tools & Scripts
        ├── bin/                     - Quick commands
        ├── scripts/                 - Automation scripts
        ├── config/                  - Config templates
        ├── docs/                    - Operational docs
        ├── tools/                   - Utilities
        ├── lib/                     - Shared libraries
        ├── infrastructure/          - IaC (Terraform, K8s)
        ├── database/                - Database utilities
        │   └── queries/             - Diagnostic queries only
        ├── docker/                  - Docker configs
        └── _archive/                - Archived content
```

---

## ❌ What Should NEVER Be in .vital-cockpit/

- ❌ Backend code (`services/`)
- ❌ Frontend code (`apps/`)
- ❌ Test suites (`tests/`)
- ❌ Active database migrations
- ❌ `package.json` / `pnpm-workspace.yaml`
- ❌ `node_modules/`
- ❌ Build outputs
- ❌ Source code of any kind

---

## ✅ What SHOULD Be in .vital-cockpit/

### vital-expert-docs/
- 📖 Product documentation
- 📖 Technical architecture docs
- 📖 API documentation
- 📖 Data schema docs
- 📖 Implementation guides
- 📖 Strategy & planning docs

### .vital-ops/
- 🔧 DevOps scripts and tools
- 🔧 Infrastructure as Code (Terraform, K8s)
- 🔧 Configuration templates
- 🔧 Operational runbooks
- 🔧 Monitoring tools
- 🔧 Database diagnostic queries (not migrations)
- 🔧 Deployment automation

---

## 🏗️ Why This Structure?

### Root Contains Application
1. **pnpm workspace** expects code at root
2. **Vercel/Railway** deploy from root
3. **IDE** and **linters** work with root
4. **Git workflows** assume code at root
5. **Standard practice** in monorepos

### .vital-cockpit/ Contains Documentation & Ops
1. **Keeps root clean** - Only code visible
2. **Clear separation** - Docs vs code
3. **Easy to exclude** - Can `.gitignore` if needed
4. **Organized knowledge** - All docs in one place
5. **DevOps tools** - Scripts don't clutter root

---

## 🚨 Recent Fix Applied

On November 21, 2024, we corrected an error where:
- ❌ `services/` was incorrectly moved to `.vital-cockpit/.vital-ops/services/`
- ❌ `tests/` was incorrectly moved to `.vital-cockpit/.vital-ops/tests/`

These have been moved back to root where they belong.

**Commits:**
- `de7f0cda`: Initial restructure (incorrect)
- `1ee871bd`: Fix - moved services and tests back to root (correct)

---

## 📋 Quick Verification

### Check if structure is correct:

```bash
# Application code should be at root
ls -la apps/          # ✅ Should exist at root
ls -la services/      # ✅ Should exist at root  
ls -la tests/         # ✅ Should exist at root
ls -la database/      # ✅ Should exist at root

# Documentation should be in .vital-cockpit
ls -la .vital-cockpit/vital-expert-docs/   # ✅ Should exist
ls -la .vital-cockpit/.vital-ops/          # ✅ Should exist

# These should NOT exist
ls -la .vital-cockpit/.vital-ops/services/ # ❌ Should NOT exist
ls -la .vital-cockpit/.vital-ops/tests/    # ❌ Should NOT exist
ls -la .vital-cockpit/.vital-ops/apps/     # ❌ Should NOT exist
```

---

## 🎓 Rules to Remember

### Golden Rule #1
**Never put application code in .vital-cockpit/**

Application code = `apps/`, `services/`, `tests/`, `database/migrations/`

### Golden Rule #2
**Never put documentation in root (except README.md)**

Documentation = guides, runbooks, architecture docs

### Golden Rule #3
**DevOps scripts can reference code, but code shouldn't be in .vital-ops/**

Scripts can call `../../services/ai-engine/deploy.sh`, but shouldn't contain the service itself.

---

## 📞 When in Doubt

**Ask yourself:**
- Is this file **executable source code**? → **ROOT**
- Is this file **documentation or tooling**? → **.vital-cockpit/**

**Examples:**
- `services/ai-engine/main.py` → **ROOT** (it's source code)
- `docs/architecture/ai-engine-architecture.md` → **.vital-cockpit/** (it's docs)
- `.vital-ops/scripts/deploy-ai-engine.sh` → **.vital-cockpit/** (it's tooling)
- `tests/integration/test-ai-engine.ts` → **ROOT** (it's test code)

---

## ✅ Current Status

**Structure**: ✅ CORRECT  
**Application Code**: ✅ At root  
**Documentation**: ✅ In .vital-cockpit/  
**Workspace**: ✅ Functional  
**Deployments**: ✅ Will work correctly  

---

**This structure is now correct and production-ready! 🎉**


