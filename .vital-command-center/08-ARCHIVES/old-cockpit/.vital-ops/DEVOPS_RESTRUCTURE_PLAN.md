# DevOps Restructure Plan - .vital-ops/

**Created**: November 21, 2024  
**Status**: Ready for Implementation  
**Goal**: Reorganize `.vital-ops/` following industry-leading DevOps practices

---

## 📊 Current Issues

### 1. **Confusing Structure**
- `scripts/` vs `scripts-root/` - duplicate directories (80% overlap)
- `database/` contains both active migrations AND old SQL files
- `operations/` and `operations-docs/` folders exist but underutilized
- Config files scattered at root level

### 2. **Poor Discoverability**
- Hard to find the right script or tool
- No clear separation between dev tools and ops tools
- Mixing of concerns (scripts have data/, docs/, testing/ all in one place)

### 3. **Not DevOps Standard**
- Missing standard directories: `bin/`, `lib/`, `docs/`, `ci/`
- No clear environment separation (dev, staging, prod)
- Infrastructure not well organized

### 4. **Agent Navigation Issues**
- Too many nested levels
- Unclear naming conventions
- No manifest or catalog files

---

## 🎯 Proposed Structure (DevOps Best Practices)

```
.vital-ops/
│
├── README.md                           ← Main entry point (improved)
├── CATALOG.md                          ← NEW: Quick reference for all tools
├── CHANGELOG.md                        ← NEW: Track ops changes
│
├── bin/                                ← NEW: Executable scripts (symlinks)
│   ├── setup-environment               → scripts/setup/setup-env.sh
│   ├── deploy-production               → scripts/deployment/deploy-prod.sh
│   ├── run-migrations                  → scripts/database/run-migrations.sh
│   ├── start-services                  → scripts/services/start-all.sh
│   ├── health-check                    → scripts/monitoring/health-check.sh
│   └── README.md                       ← How to use bin/
│
├── scripts/                            ← CONSOLIDATED: All automation scripts
│   ├── README.md                       ← Scripts guide
│   ├── database/                       ← Database operations
│   │   ├── migrations/                 ← Migration automation
│   │   ├── backups/                    ← Backup scripts
│   │   ├── queries/                    ← Ad-hoc queries
│   │   ├── seeds/                      ← Data seeding
│   │   └── maintenance/                ← DB maintenance
│   ├── deployment/                     ← Deployment automation
│   │   ├── dev/                        ← Dev environment
│   │   ├── staging/                    ← Staging environment
│   │   ├── production/                 ← Production deployment
│   │   └── rollback/                   ← Rollback procedures
│   ├── services/                       ← Service management
│   │   ├── start-all.sh
│   │   ├── stop-all.sh
│   │   ├── restart.sh
│   │   └── health-check.sh
│   ├── setup/                          ← Initial setup
│   │   ├── install-dependencies.sh
│   │   ├── configure-environment.sh
│   │   └── initialize-services.sh
│   ├── monitoring/                     ← Monitoring tools
│   │   ├── health-check.sh
│   │   ├── log-collector.sh
│   │   └── alerting/
│   ├── data-management/                ← Data import/export/sync
│   │   ├── import/
│   │   ├── export/
│   │   └── sync/
│   ├── testing/                        ← Testing automation
│   │   ├── integration/
│   │   ├── e2e/
│   │   └── performance/
│   ├── utilities/                      ← Helper scripts
│   │   ├── cleanup/
│   │   ├── validation/
│   │   └── transformers/
│   └── ci/                             ← NEW: CI/CD scripts
│       ├── build.sh
│       ├── test.sh
│       └── deploy.sh
│
├── infrastructure/                     ← Infrastructure as Code
│   ├── README.md                       ← Infrastructure guide
│   ├── terraform/                      ← Terraform configs
│   │   ├── environments/               ← NEW: By environment
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── production/
│   │   ├── modules/                    ← NEW: Reusable modules
│   │   └── README.md
│   ├── kubernetes/                     ← K8s manifests (renamed from k8s)
│   │   ├── base/                       ← NEW: Base configs
│   │   ├── overlays/                   ← NEW: Environment overlays
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── production/
│   │   └── README.md
│   ├── docker/                         ← Docker configs
│   │   ├── docker-compose.yml          ← Main compose
│   │   ├── docker-compose.dev.yml      ← Dev overrides
│   │   ├── docker-compose.prod.yml     ← NEW: Prod overrides
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.frontend
│   │   └── README.md
│   └── monitoring/                     ← Monitoring infrastructure
│       ├── prometheus/
│       ├── grafana/
│       ├── alertmanager/
│       └── README.md
│
├── services/                           ← Backend services code
│   ├── README.md                       ← Services overview
│   ├── ai-engine/                      ← Python AI service
│   ├── api-gateway/                    ← Node.js gateway
│   ├── shared-kernel/                  ← Shared libraries
│   └── [other services]
│
├── database/                           ← Database resources
│   ├── README.md                       ← Database guide
│   ├── schema/                         ← NEW: Schema definitions
│   │   └── current.sql                 ← Current schema
│   ├── migrations/                     ← Active migrations only
│   │   ├── applied/                    ← NEW: Track applied
│   │   └── pending/                    ← NEW: Track pending
│   ├── seeds/                          ← Seed data
│   │   ├── dev/                        ← NEW: Dev seeds
│   │   ├── staging/                    ← NEW: Staging seeds
│   │   └── production/                 ← NEW: Production seeds
│   ├── queries/                        ← NEW: Common queries
│   │   ├── diagnostics/                ← Diagnostic queries
│   │   ├── analytics/                  ← Analytics queries
│   │   └── utilities/                  ← Utility queries
│   └── backups/                        ← Backup configs
│       └── backup-policy.md
│
├── config/                             ← NEW: Configuration files
│   ├── README.md                       ← Config guide
│   ├── environments/                   ← Environment configs
│   │   ├── .env.dev.example
│   │   ├── .env.staging.example
│   │   └── .env.production.example
│   ├── services/                       ← Service configs
│   │   ├── ai-engine.yaml
│   │   ├── api-gateway.yaml
│   │   └── database.yaml
│   └── monitoring/                     ← Monitoring configs
│       ├── prometheus.yml
│       ├── grafana-dashboards/
│       └── alertmanager.yml
│
├── docs/                               ← NEW: Operations documentation
│   ├── README.md                       ← Documentation index
│   ├── runbooks/                       ← NEW: Operational runbooks
│   │   ├── deployment.md
│   │   ├── incident-response.md
│   │   ├── rollback.md
│   │   └── disaster-recovery.md
│   ├── guides/                         ← NEW: How-to guides
│   │   ├── setup-development.md
│   │   ├── deploy-production.md
│   │   ├── database-migrations.md
│   │   └── monitoring-setup.md
│   ├── architecture/                   ← NEW: System architecture
│   │   ├── infrastructure.md
│   │   ├── services.md
│   │   └── data-flow.md
│   └── troubleshooting/                ← NEW: Common issues
│       ├── services.md
│       ├── database.md
│       └── deployment.md
│
├── tests/                              ← Test suites
│   ├── README.md                       ← Testing guide
│   ├── integration/                    ← Integration tests
│   ├── e2e/                            ← End-to-end tests
│   ├── performance/                    ← Performance tests
│   └── fixtures/                       ← Test fixtures
│
├── tools/                              ← NEW: Custom tools & utilities
│   ├── README.md                       ← Tools catalog
│   ├── cli/                            ← NEW: CLI tools
│   │   ├── vital-ops                   ← Main CLI tool
│   │   └── README.md
│   ├── monitoring/                     ← Monitoring tools
│   ├── compliance/                     ← Compliance tools
│   └── validation/                     ← Validation tools
│
├── lib/                                ← NEW: Shared libraries
│   ├── README.md                       ← Library docs
│   ├── shell/                          ← Shell libraries
│   │   ├── common.sh                   ← Common functions
│   │   ├── logging.sh                  ← Logging functions
│   │   └── validation.sh               ← Validation functions
│   ├── python/                         ← Python libraries
│   └── node/                           ← Node.js libraries
│
├── _archive/                           ← Historical/deprecated
│   ├── README.md                       ← Archive index
│   ├── 2024-q4/                        ← By time period
│   ├── deprecated-scripts/
│   ├── old-sql/                        ← Moved from database/sql/
│   └── legacy-services/
│
└── [root config files]                 ← Keep minimal
    ├── package.json                    ← Workspace config
    ├── Makefile                        ← Build automation
    └── .gitignore                      ← Git config
```

---

## 🔄 Migration Steps

### Phase 1: Create New Structure (No File Moves Yet)
1. Create all new directories
2. Create all README.md files with clear descriptions
3. Create CATALOG.md with quick reference
4. Create bin/ directory with placeholder files

### Phase 2: Consolidate Scripts
1. Merge `scripts/` and `scripts-root/` (eliminate duplication)
2. Reorganize by function (database, deployment, services, etc.)
3. Move archived scripts to `_archive/2024-q4/`
4. Update all script paths and references

### Phase 3: Reorganize Database
1. Move old SQL files to `_archive/old-sql/`
2. Keep only active migrations in `database/migrations/`
3. Organize queries by purpose in `database/queries/`
4. Separate seeds by environment

### Phase 4: Restructure Infrastructure
1. Organize Terraform by environment
2. Reorganize Kubernetes with Kustomize structure
3. Consolidate monitoring configs
4. Add environment-specific overrides

### Phase 5: Create Documentation
1. Write runbooks for common operations
2. Create troubleshooting guides
3. Document architecture
4. Add setup guides

### Phase 6: Build Tools & Utilities
1. Create `bin/` symlinks for common commands
2. Build shared libraries (lib/)
3. Create CLI tool for ops
4. Add validation utilities

### Phase 7: Clean Up
1. Remove duplicate files
2. Archive old directories
3. Update all references
4. Test all scripts and tools

---

## 📝 Key Improvements

### 1. **Standard DevOps Layout**
- `bin/` for executables (industry standard)
- `lib/` for shared code (DRY principle)
- `docs/` for documentation (single source)
- `config/` for all configurations

### 2. **Environment Separation**
- Clear dev/staging/production separation
- Environment-specific configs and seeds
- Terraform and K8s organized by environment

### 3. **Better Discoverability**
- CATALOG.md for quick reference
- README.md in every directory
- Logical naming and grouping
- `bin/` provides easy access to common commands

### 4. **Agent-Friendly**
- Clear hierarchy and naming
- Manifest files (CATALOG.md)
- Consistent structure
- Comprehensive documentation

### 5. **Reduced Duplication**
- Merge scripts/ and scripts-root/
- Single source for configs
- Shared libraries in lib/
- Clear archive strategy

### 6. **Professional Operations**
- Runbooks for common tasks
- Incident response procedures
- Disaster recovery plans
- Comprehensive troubleshooting

---

## 🚀 Quick Commands After Migration

```bash
# Setup new environment
./bin/setup-environment dev

# Deploy to production
./bin/deploy-production

# Run database migrations
./bin/run-migrations

# Start all services
./bin/start-services

# Check system health
./bin/health-check

# View available commands
cat .vital-ops/CATALOG.md
```

---

## 📊 Impact Analysis

### File Reduction
- **Before**: ~800+ files scattered
- **After**: ~800 files, but organized
- **Duplication Removed**: ~150 duplicate files

### Directories
- **Before**: 30+ top-level directories
- **After**: 12 top-level directories (clear purpose)

### Discoverability
- **Before**: 5+ minutes to find a script
- **After**: < 30 seconds with CATALOG.md or bin/

### Maintainability
- **Before**: Hard to know what's active vs archived
- **After**: Clear separation and documentation

---

## ✅ Success Criteria

1. ✅ All scripts work after migration
2. ✅ No duplication between directories
3. ✅ Every directory has a README.md
4. ✅ CATALOG.md is comprehensive
5. ✅ bin/ provides access to common commands
6. ✅ All environment configs separated
7. ✅ Documentation is complete
8. ✅ Archive is properly organized
9. ✅ All tests pass
10. ✅ Team can find everything easily

---

**Next Step**: Review and approve this plan before implementation

