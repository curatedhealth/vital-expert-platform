# VITAL Platform Documentation

Welcome to the VITAL Platform developer documentation. This directory contains essential guides for developers, operators, and contributors.

---

## ⚠️ IMPORTANT: Documentation Location Rules

### This `/docs/` folder is for PUBLIC developer-facing documentation ONLY

| ✅ Allowed Here | ❌ NOT Allowed Here |
|-----------------|---------------------|
| Getting started guides | Internal PRDs/ARDs |
| API reference (OpenAPI) | Audit reports |
| Architecture overview | Implementation details |
| Deployment guides | Service-specific docs |
| Development setup | Historical documents |

### For Internal Documentation → Use `/.claude/docs/`

```
/.claude/docs/
├── services/ask-expert/     # Ask Expert PRD, ARD, implementation
├── services/ask-panel/      # Ask Panel documentation
├── platform/agents/         # Agent definitions & guides
├── architecture/            # Architecture decisions
└── operations/              # Deployment, security, monitoring
```

---

## Directory Structure

```
docs/
├── README.md                 # This file
├── api/
│   └── openapi.yaml          # OpenAPI specification
├── architecture/
│   └── overview.md           # System architecture overview
├── guides/
│   ├── getting-started.md    # Quick start guide (15 min)
│   ├── development.md        # Local development setup
│   ├── deployment.md         # Production deployment
│   ├── 01_technical_implementation.md
│   └── 02_enterprise_ontology_guide.md
└── platform/
    └── enterprise_ontology/
        └── README.md         # Enterprise ontology feature docs
```

## Quick Links

| Topic | Document | Description |
|-------|----------|-------------|
| **Getting Started** | [guides/getting-started.md](guides/getting-started.md) | Get running in 15 minutes |
| **API Reference** | [api/openapi.yaml](api/openapi.yaml) | Full OpenAPI specification |
| **Architecture** | [architecture/overview.md](architecture/overview.md) | System design overview |
| **Development** | [guides/development.md](guides/development.md) | Local dev environment |
| **Deployment** | [guides/deployment.md](guides/deployment.md) | Production deployment guide |

## Internal Documentation

Comprehensive internal platform documentation is maintained in:

| Location | Content |
|----------|---------|
| `/.claude/docs/` | Full platform documentation |
| `/.claude/docs/services/` | Service-specific PRDs & ARDs |
| `/.claude/docs/platform/` | Platform features (agents, personas, ontology) |
| `/.claude/docs/architecture/` | Architecture decisions & standards |
| `/.claude/docs/operations/` | Deployment, security, monitoring |

## Key Services Documentation

- **Ask Expert**: `/.claude/docs/services/ask-expert/`
  - `ASK_EXPERT_PRD_MASTER.md` - Product requirements
  - `ASK_EXPERT_ARD_MASTER.md` - Architecture specification
  
- **Ask Panel**: `/.claude/docs/services/ask-panel/`

- **Agent OS**: `/.claude/docs/platform/agents/`

---

**Version**: 1.1.0  
**Last Updated**: December 6, 2025
