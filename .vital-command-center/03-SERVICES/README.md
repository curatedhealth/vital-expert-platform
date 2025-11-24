# Services

**Purpose**: Service-specific documentation for each VITAL platform service

**Owner**: Implementation Compliance & QA Agent

**Last Updated**: 2025-11-22

---

## Overview

This section contains detailed documentation for each service in the VITAL platform. Each service has its own subdirectory with specifications, implementation guides, and operational documentation.

---

## Directory Structure

```
03-SERVICES/
├── ask-expert/              Ask Expert service (1-on-1 AI consultation)
├── ask-panel/               Ask Panel service (multi-expert collaboration)
├── ask-committee/           Ask Committee service (AI advisory board)
└── byoai-orchestration/     BYOAI service (customer AI integration)
```

---

## Ask Expert

**Location**: `ask-expert/`
**Status**: ✅ Modes 1-2 Complete (95%), Modes 3-4 Planned (Q1 2026)
**Priority**: P0 (Core Service)

**Description**: 1-on-1 AI consultation service where users submit questions to a single expert agent and receive expert-quality responses.

**Modes**:
- **Mode 1 (Manual Selection - Query)**: ✅ Complete - User selects expert, submits query (20-30s response)
- **Mode 2 (Auto Selection - Query)**: ✅ Complete - AI selects best 3 experts (30-45s response)
- **Mode 3 (Manual + Autonomous Chat)**: ⏳ Q1 2026 - Multi-turn chat with autonomous reasoning
- **Mode 4 (Auto + Autonomous Chat)**: ⏳ Q2 2026 - Multi-expert autonomous collaboration

**Key Documents**:
- Service PRD (Product Requirements)
- Service Architecture Design
- API Documentation
- Workflow Specifications
- Performance Benchmarks

**Implementation**:
- Frontend: `apps/vital-system/src/app/(app)/ask-expert/`
- API: `apps/vital-system/src/app/api/ask-expert/`
- Feature: `apps/vital-system/src/features/ask-expert/`

**Migrated From**: `.vital-cockpit/vital-expert-docs/04-services/ask-expert/`

**Related**:
- PRD: `00-STRATEGIC/prd/ask-expert/`
- ARD: `00-STRATEGIC/ard/ask-expert/`
- Platform Assets: `02-PLATFORM-ASSETS/agents/`
- Technical Docs: `04-TECHNICAL/api/ask-expert/`

---

## Ask Panel

**Location**: `ask-panel/`
**Status**: ✅ Complete (90%)
**Priority**: P0 (Core Service)

**Description**: Multi-expert collaboration service where 2-5 expert agents work together to provide comprehensive answers with consensus tracking.

**Features**:
- Custom panel creation (select 2-5 experts)
- Panel templates (10+ pre-configured archetypes)
- Parallel and sequential execution modes
- Consensus/dissent visualization
- Multi-perspective synthesis

**Panel Archetypes**:
- Clinical Advisory Panel (3 experts)
- Safety Review Panel (4 experts)
- Regulatory Strategy Panel (5 experts)
- Medical Writing Panel (3 experts)

**Key Documents**:
- Panel workflow specifications (19+ workflows)
- Panel archetype library
- Execution orchestration design
- Consensus algorithms

**Implementation**:
- Frontend: `apps/vital-system/src/app/(app)/ask-panel/`
- API: `apps/vital-system/src/app/api/panel/`
- Feature: `apps/vital-system/src/features/ask-panel/`

**Migrated From**: `.vital-cockpit/vital-expert-docs/04-services/ask-panel/`

**Related**:
- PRD: `00-STRATEGIC/prd/ask-panel/`
- Platform Assets: `02-PLATFORM-ASSETS/workflows/`

---

## Ask Committee

**Location**: `ask-committee/`
**Status**: ⏳ Planned for Q3 2026
**Priority**: P2 (Future Enhancement)

**Description**: AI advisory board service for complex questions requiring multi-phase deliberation by 5-12 expert agents over 8-24 hours.

**Planned Features**:
- 4-phase workflow (orientation, deliberation, synthesis, recommendation)
- Chairperson AI orchestration
- 15-20 page comprehensive report generation
- Evidence synthesis across multiple sources
- Dissenting opinion capture

**Rationale for Deferral**: Focus on proven value (Ask Expert, Ask Panel) before building complex 24-hour multi-phase workflows.

**Roadmap**:
- **Q1 2026**: Design & architecture
- **Q3 2026**: MVP release
- **Q4 2026**: Enhancements

**Migrated From**: `.vital-cockpit/vital-expert-docs/04-services/ask-committee/`

**Related**:
- PRD: `00-STRATEGIC/prd/`
- Platform Assets: `02-PLATFORM-ASSETS/workflows/`

---

## BYOAI Orchestration

**Location**: `byoai-orchestration/`
**Status**: ⏳ Planned for Q2 2026
**Priority**: P1 (Enterprise Feature)

**Description**: Bring Your Own AI (BYOAI) service enabling customers to integrate their proprietary AI agents seamlessly into the VITAL platform.

**Planned Features**:
- OpenAPI spec validation
- Custom agent registration console
- Integration testing framework
- Security sandboxing
- BYOAI marketplace
- Partner certification program

**Rationale for Deferral**: Build core platform value (136+ VITAL agents) first, then enable extensibility.

**Roadmap**:
- **Q2 2026**: BYOAI registration console
- **Q3 2026**: BYOAI marketplace
- **Q4 2026**: Partner certification program

**Migrated From**: `.vital-cockpit/vital-expert-docs/04-services/byoai-orchestration/`

**Related**:
- PRD: `00-STRATEGIC/prd/`
- Technical Docs: `04-TECHNICAL/api/byoai/`

---

## Service Development Guidelines

### Adding a New Service

1. **Create subdirectory**: `03-SERVICES/{service-name}/`
2. **Add service README**: Describe purpose, status, features
3. **Add PRD**: Product requirements in `00-STRATEGIC/prd/{service-name}/`
4. **Add ARD**: Architecture design in `00-STRATEGIC/ard/{service-name}/`
5. **Add API docs**: API specification in `04-TECHNICAL/api/{service-name}/`
6. **Update CATALOGUE.md**: Add service to master navigation

### Service Documentation Structure

Each service subdirectory should contain:
```
{service-name}/
├── README.md                     Service overview
├── SERVICE_PRD.md                Product requirements
├── SERVICE_ARD.md                Architecture design
├── WORKFLOWS.md                  Workflow specifications
├── API_SPEC.md                   API documentation
├── PERFORMANCE_BENCHMARKS.md     Performance metrics
├── DEPLOYMENT_GUIDE.md           Deployment instructions
└── examples/                     Usage examples
```

### Service Naming Conventions

- **Service names**: lowercase-with-hyphens (e.g., `ask-expert`)
- **Documents**: UPPERCASE_WITH_UNDERSCORES.md (e.g., `SERVICE_PRD.md`)
- **Workflows**: descriptive-workflow-name.md (e.g., `multi-expert-consensus.md`)

---

## Service Status Legend

- ✅ **Complete**: Service is production-ready and deployed
- ⏳ **Planned**: Service is designed but not yet implemented
- 🚧 **In Progress**: Service is actively being developed
- ⚠️ **Deprecated**: Service is being sunset

---

## Cross-References

- **Strategic Requirements**: `00-STRATEGIC/prd/`
- **Architecture Design**: `00-STRATEGIC/ard/`
- **Platform Assets**: `02-PLATFORM-ASSETS/`
- **Technical Implementation**: `04-TECHNICAL/`
- **Operations**: `05-OPERATIONS/`

---

## Metrics & Performance

### Ask Expert (Modes 1-2)
- **P50 Latency**: 22s (Mode 1), 35s (Mode 2) ✅
- **P95 Latency**: 28s (Mode 1), 42s (Mode 2) ✅
- **Accuracy**: 96% (Mode 1), 92% (Mode 2) ✅
- **Uptime**: 99.95% ✅

### Ask Panel
- **P50 Latency**: ~45s (5 experts) ✅
- **Consensus Quality**: 94% user approval ✅
- **Uptime**: 99.9% ✅

---

## Related Documentation

- **Service PRDs**: `00-STRATEGIC/prd/`
- **Service ARDs**: `00-STRATEGIC/ard/`
- **API Documentation**: `04-TECHNICAL/api/`
- **Database Schema**: `04-TECHNICAL/data-schema/`
- **Deployment Guides**: `05-OPERATIONS/deployment/`
- **Master Navigation**: `CATALOGUE.md`

---

**Maintained By**: Implementation Compliance & QA Agent
**Questions?**: Check `CATALOGUE.md` or ask Implementation Compliance & QA Agent
