# 📚 VITAL Expert Platform - Documentation Index

> **Complete Documentation Hub | Version 2.0 | January 2025**

**🎯 Quick Start**: [5-Minute Setup](./docs/guides/quickstart/QUICK_START_GUIDE.md) | [Architecture](./docs/architecture/) | [API Docs](./docs/api-docs/)

---

## 🚀 Quick Navigation

| I want to... | Go to... |
|--------------|----------|
| **Get started quickly** | [Quick Start Guide](./docs/guides/quickstart/QUICK_START_GUIDE.md) |
| **Understand the architecture** | [Architecture Docs](./docs/architecture/) |
| **Deploy to production** | [Deployment Guide](./docs/guides/deployment/) |
| **Fix an issue** | [Troubleshooting](./docs/guides/troubleshooting/) |
| **Check project status** | [Status Reports](./docs/status-reports/) |
| **Learn the APIs** | [API Documentation](./docs/api-docs/) |
| **Run migrations** | [Migration Logs](./docs/migration-logs/) |
| **Import data** | [Data Import Scripts](./scripts/data-import/) |

---

## 📂 Documentation Structure

### 📚 [Documentation Hub](./docs/)
Complete organized documentation including architecture, guides, status reports, and historical records.

- **[Architecture](./docs/architecture/)** - System design, database schema, API design
- **[Guides](./docs/guides/)** - Quick start, development, deployment, troubleshooting
- **[Status Reports](./docs/status-reports/)** - Implementation status and completion logs
- **[Migration Logs](./docs/migration-logs/)** - Database migration history
- **[Planning](./docs/planning/)** - Roadmaps, plans, and strategies
- **[Deployment](./docs/deployment/)** - Production deployment procedures

### 🔧 [Scripts](./scripts/)
Organized scripts for migrations, data import, and utilities.

- **[Migrations](./scripts/migrations/)** - Database migration scripts (Phase 1-3)
- **[Data Import](./scripts/data-import/)** - Import scripts for personas, agents, workflows
- **[Utilities](./scripts/utilities/)** - Verification, cleanup, and utility scripts

### 🗄️ [Database Migrations](./supabase/migrations/)
Supabase migration files organized and archived.

---

## 🏗️ Platform Overview

**VITAL Expert** is an enterprise AI platform for Medical Affairs teams featuring:

- ✅ **100+ Specialized AI Agents** - Domain experts for Medical Affairs
- ✅ **PRISM™ Suites** - 10 strategic capability suites  
- ✅ **Intelligent Workflows** - Guided JTBD execution
- ✅ **Knowledge Base** - RAG-powered document search
- ✅ **Multi-Mode AI** - 4 interaction modes
- ✅ **Enterprise Security** - Multi-tenant with RLS

[→ Complete Platform Overview](./README.md)

---

## 🎨 PRISM™ Suites

| Suite | Focus | Agents |
|-------|-------|--------|
| **RULES™** | Regulatory & Compliance | 12 agents |
| **TRIALS™** | Clinical Evidence | 15 agents |
| **GUARD™** | Risk & Safety | 10 agents |
| **VALUE™** | Health Economics | 14 agents |
| **BRIDGE™** | Market Access | 13 agents |
| **PROOF™** | Real-World Evidence | 11 agents |
| **CRAFT™** | Scientific Communications | 16 agents |
| **SCOUT™** | Competitive Intelligence | 8 agents |
| **PROJECT™** | Program Management | 9 agents |
| **FORGE™** | Strategic Planning | 12 agents |

---

## 📖 Key Documentation

### Essential Reads

1. **[Main README](./README.md)** - Project overview and setup
2. **[Quick Start Guide](./docs/guides/quickstart/QUICK_START_GUIDE.md)** - 5-minute setup
3. **[Architecture Overview](./docs/architecture/)** - System design
4. **[Database Schema](./docs/architecture/DATABASE_SCHEMA.md)** - Complete schema
5. **[API Documentation](./docs/api-docs/)** - API reference

### For Developers

- [Development Setup](./docs/guides/development/) - Local environment
- [Testing Guide](./docs/guides/testing/) - Test procedures
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute
- [Code Standards](./docs/guides/development/standards.md) - Coding standards

### For Operations

- [Deployment Guide](./docs/guides/deployment/) - Production deployment
- [Monitoring Setup](./docs/deployment/monitoring.md) - Observability
- [Troubleshooting Guide](./docs/guides/troubleshooting/) - Issue resolution
- [Migration Procedures](./docs/migration-logs/) - Database updates

---

## 🛠️ Technology Stack

```
Frontend:  Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui
Backend:   Python 3.11+, FastAPI, LangGraph, LangChain
Database:  PostgreSQL 15 (Supabase), Pinecone (Vector)
AI:        OpenAI GPT-4, Anthropic Claude, Custom Embeddings
Deploy:    Docker, Vercel, Railway/Cloud Run
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+  
- Docker Desktop
- pnpm 8+
- Supabase CLI

### Quick Setup (5 minutes)

```bash
# 1. Clone & Install
git clone <repo>
cd "VITAL path"
pnpm install

# 2. Environment
cp .env.example .env.local
# Edit .env.local

# 3. Database
supabase start
supabase db push

# 4. Start
pnpm dev
```

[→ Detailed Setup Guide](./docs/guides/quickstart/QUICK_START_GUIDE.md)

---

## 📊 Project Status

**Status**: ✅ Production Ready | **Version**: 2.0 | **Last Updated**: Jan 10, 2025

| Component | Status | Quality |
|-----------|--------|---------|
| Frontend | ✅ Production | 🟢 High |
| Backend | ✅ Production | 🟢 High |
| Database | ✅ Production | 🟢 High |
| Documentation | ✅ Complete | 🟢 High |
| Tests | ✅ Passing | 🟡 Medium (65%) |

### Recent Milestones
- ✅ Multi-tenant architecture
- ✅ PRISM™ suite organization  
- ✅ Documentation organization (745→ structured)
- ✅ Script organization (110+ scripts)
- ✅ Migration cleanup (63 files)

---

## 🔄 Common Tasks

### Development
```bash
pnpm dev              # Start frontend
pnpm test             # Run tests
pnpm tsc              # Type check
```

### Database
```bash
supabase migration new <name>   # Create migration
supabase db push                # Apply migrations
supabase db reset               # Reset database
pnpm run generate-types         # Generate types
```

### Data Import
```bash
# Import personas
python3 scripts/data-import/personas/import_personas.py

# Import agents  
python3 scripts/data-import/agents/import_agents.py

# Import workflows
python3 scripts/data-import/workflows/import_workflows.py
```

---

## 🤝 Contributing

1. Create branch: `git checkout -b feature/your-feature`
2. Make changes with tests
3. Submit PR with description
4. Code review & merge
5. Auto-deploy to staging

[→ Contributing Guide](./CONTRIBUTING.md)

---

## 📞 Support

- **Documentation**: Check this index first
- **Issues**: [Troubleshooting Guide](./docs/guides/troubleshooting/)
- **Status**: [Status Reports](./docs/status-reports/)
- **Architecture**: [Architecture Docs](./docs/architecture/)

---

## 📄 License

Copyright © 2024-2025 VITAL Expert Platform. All rights reserved.

---

**Last Updated**: January 10, 2025 | **Version**: 2.0 | **Status**: Production Ready ✅

**🎉 World-Class Documentation - Ready for Enterprise**
