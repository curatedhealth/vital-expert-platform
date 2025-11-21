# VITAL Ops - Operations & Development Resources

**Last Updated**: November 21, 2024  
**Version**: 3.0  
**Status**: Production Ready  
**Location**: `.vital-cockpit/.vital-ops/`

---

## Overview

This directory contains **ALL operational resources**, scripts, migrations, services, and DevOps documentation for the VITAL Platform. Everything needed to run, deploy, and maintain the platform is consolidated here.

---

## 📂 Complete Directory Structure

```
.vital-ops/
├── README.md                           ← This file
├── REORGANIZATION_PLAN.md              ← Original reorganization plan
├── .claude.md                          ← AI agent coordination file
│
├── database/                           ← Database Operations
│   ├── sql-additional/                 ← Additional SQL scripts (177 files)
│   └── sql-standalone/                 ← Standalone SQL queries (10 files)
│       ├── diagnose_personas_in_database.sql
│       ├── get_all_pharma_org_structure.sql
│       ├── map_all_personas_to_departments.sql
│       ├── map_all_personas_to_functions.sql
│       ├── map_all_personas_to_roles.sql
│       ├── map_medical_affairs_roles_to_personas.sql
│       ├── map_personas_by_role_name.sql
│       ├── map_pharma_roles_to_personas_from_json.sql
│       ├── verify_medical_affairs_mapping_from_json.sql
│       └── verify_pharma_roles_personas_mapping.sql
│
├── scripts/                            ← Shell Script Collections
│   ├── setup/                          ← Setup & initialization scripts
│   │   ├── install-observability.sh
│   │   ├── setup-env.sh
│   │   └── setup-subdomains.sh
│   ├── startup/                        ← Service startup scripts
│   │   └── start-all-services.sh
│   └── utilities/                      ← Utility scripts
│       └── fix-subdomains.sh
│
├── scripts-root/                       ← Root Scripts Collection
│   ├── README.md                       ← Scripts documentation
│   ├── archive/                        ← Archived scripts
│   ├── core/                           ← Core system scripts
│   ├── data/                           ← Data processing scripts
│   ├── data-management/                ← Data management utilities
│   ├── database/                       ← Database automation
│   ├── deployment/                     ← Deployment automation
│   ├── development/                    ← Development tools
│   ├── maintenance/                    ← Maintenance scripts
│   ├── testing/                        ← Testing utilities
│   ├── utilities/                      ← General utilities
│   ├── validation/                     ← Validation scripts
│   └── [package.json, requirements.txt, etc.]
│
├── services/                           ← Backend Services
│   └── [All backend service code]
│
├── docker/                             ← Docker Configuration
│   ├── docker-compose.backend.yml
│   ├── docker-compose.dev.yml
│   ├── docker-compose.neo4j.yml
│   ├── docker-compose.python-only.yml
│   └── docker-compose.yml
│
├── monitoring-config/                  ← Monitoring Setup
│   ├── README.md
│   ├── alertmanager/
│   ├── grafana/
│   ├── prometheus/
│   └── deploy.sh
│
├── infrastructure/                     ← Infrastructure as Code
│   ├── k8s/                            ← Kubernetes configs
│   ├── terraform/                      ← Terraform configs
│   └── monitoring/
│
├── tests/                              ← Test Files & Utilities
│   ├── test_supabase_connection.js
│   ├── test-prompt-starters-api.js
│   └── additional/                     ← Additional tests from root
│
├── supabase/                           ← Supabase Configuration
│   └── [Supabase project files]
│
├── Makefile                            ← Build automation
├── package.json                        ← Node.js dependencies
├── requirements.txt                    ← Python dependencies
├── tsconfig.json                       ← TypeScript config
├── tsconfig.tsbuildinfo                ← TypeScript build info
├── pnpm-lock.yaml                      ← Lockfile
├── pnpm-workspace.yaml                 ← Workspace config
├── vercel.json                         ← Vercel deployment config
├── next-env.d.ts                       ← Next.js types
└── LICENSE                             ← Project license

```

---

## 🎯 Quick Access

### Database Operations
```bash
# Standalone SQL queries
cd .vital-cockpit/.vital-ops/database/sql-standalone/

# Additional SQL scripts
cd .vital-cockpit/.vital-ops/database/sql-additional/
```

### Scripts & Automation
```bash
# Setup environment
.vital-cockpit/.vital-ops/scripts/setup/setup-env.sh

# Start all services
.vital-cockpit/.vital-ops/scripts/startup/start-all-services.sh

# Root scripts collection
cd .vital-cockpit/.vital-ops/scripts-root/
```

### Services & Deployment
```bash
# Backend services
cd .vital-cockpit/.vital-ops/services/

# Docker operations
cd .vital-cockpit/.vital-ops/docker/
docker-compose -f docker-compose.yml up

# Supabase
cd .vital-cockpit/.vital-ops/supabase/
```

### Monitoring & Infrastructure
```bash
# Monitoring setup
cd .vital-cockpit/.vital-ops/monitoring-config/
./deploy.sh

# Infrastructure
cd .vital-cockpit/.vital-ops/infrastructure/
```

---

## 🚀 Common Tasks

### Environment Setup
```bash
cd .vital-cockpit/.vital-ops/scripts/setup
./setup-env.sh
./setup-subdomains.sh
./install-observability.sh
```

### Start Services
```bash
cd .vital-cockpit/.vital-ops

# Start all services
./scripts/startup/start-all-services.sh

# Or use Docker
cd docker
docker-compose up -d
```

### Run Database Queries
```bash
cd .vital-cockpit/.vital-ops/database/sql-standalone

# Run a specific query
psql $DATABASE_URL -f diagnose_personas_in_database.sql
```

### Deploy Monitoring
```bash
cd .vital-cockpit/.vital-ops/monitoring-config
./deploy.sh
```

### Run Tests
```bash
cd .vital-cockpit/.vital-ops/tests
node test_supabase_connection.js
node test-prompt-starters-api.js
```

---

## 📚 Related Documentation

### Within .vital-cockpit/
- **Cockpit Home**: [`../README.md`](../README.md)
- **Master Index**: [`../INDEX.md`](../INDEX.md)
- **Expert Docs**: [`../vital-expert-docs/`](../vital-expert-docs/)
- **Deployment Guide**: [`../vital-expert-docs/09-deployment/`](../vital-expert-docs/09-deployment/)
- **Operations Docs**: [`../vital-expert-docs/13-operations/`](../vital-expert-docs/13-operations/)

### Platform Root
- **Platform Overview**: [`../../README.md`](../../README.md)
- **Project Structure**: [`../../STRUCTURE.md`](../../STRUCTURE.md)

---

## 🔗 Integration with Platform

This `.vital-ops/` directory is part of `.vital-cockpit/` and supports:

- **`../vital-expert-docs/`**: All documentation and knowledge base
- **`../../apps/`**: Frontend applications
- **`../../packages/`**: Shared packages
- **`../../database/`**: Production database files

---

## 📊 What's Inside

| Category | Count | Location |
|----------|-------|----------|
| SQL Scripts | 187 files | `database/` |
| Shell Scripts | 20+ files | `scripts/` + `scripts-root/` |
| Backend Services | Full codebase | `services/` |
| Docker Configs | 5 files | `docker/` |
| Test Files | 3+ files | `tests/` |
| Monitoring Configs | Grafana, Prometheus, etc. | `monitoring-config/` |
| Infrastructure | Terraform, K8s | `infrastructure/` |
| Config Files | 10+ files | Root of `.vital-ops/` |

---

## 🎯 Why Everything is Here

### Single Operations Hub
- All DevOps resources in one place
- Clear separation from documentation
- Easy to find anything operational

### Better Organization
- Scripts organized by purpose
- Database queries by type
- Services consolidated
- Infrastructure centralized

### Cleaner Project Root
- Root directory now contains only active code
- All operational artifacts consolidated
- Clear separation of concerns

---

## 🔍 Finding Things

### Need a script?
- **Setup/Install**: `scripts/setup/`
- **Startup**: `scripts/startup/`
- **Utilities**: `scripts/utilities/` or `scripts-root/utilities/`

### Need database stuff?
- **Queries**: `database/sql-standalone/`
- **Scripts**: `database/sql-additional/`

### Need to deploy?
- **Docker**: `docker/`
- **Infrastructure**: `infrastructure/`
- **Monitoring**: `monitoring-config/`

### Need a service?
- **All services**: `services/`

---

**For complete platform documentation, see**: [`../INDEX.md`](../INDEX.md)

**For platform overview, see**: [`../../README.md`](../../README.md)
