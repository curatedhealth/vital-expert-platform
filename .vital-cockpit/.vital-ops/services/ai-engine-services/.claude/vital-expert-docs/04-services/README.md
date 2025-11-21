# VITAL Services Documentation

## 📋 Overview

This directory contains comprehensive documentation for all VITAL platform services. Each service represents a distinct user-facing capability with specific workflows, architectures, and implementations.

---

## 🎯 Service Portfolio

### 1. Ask Expert Service
**Directory:** [`ask-expert/`](./ask-expert/)
**Status:** ✅ Production Ready
**Documentation:** 306KB across 4 modes

**Description:**
VITAL's flagship conversational AI service providing intelligent access to expert knowledge through natural language. Operates across 4 distinct modes (2×2 matrix) offering different interaction patterns and expert selection strategies.

**Modes:**
- **Mode 1**: Interactive Manual (Chat-Manual) - Deep dive with chosen expert
- **Mode 2**: Query Manual (Query-Manual) - Quick answer from specific expert
- **Mode 3**: Query Automatic (Query-Auto) - Multi-expert synthesis
- **Mode 4**: Chat Auto (Chat-Auto) - Dynamic expert orchestration

**Use Cases:**
- Expert consultation and advice
- Domain-specific Q&A
- Multi-perspective analysis
- Strategic decision support

---

### 2. Ask Panel Service
**Directory:** [`ask-panel/`](./ask-panel/)
**Status:** 🚧 Planned

**Description:**
Structured panel discussions with 3-7 expert agents providing diverse perspectives on complex questions. Simulates expert panel meetings with moderated discussion and consensus building.

**Key Features:**
- Moderator-led discussion
- Parallel expert contributions
- Consensus identification
- Dissenting opinions captured
- Executive summary generation

**Use Cases:**
- Strategic planning
- Complex decision-making
- Policy development
- Multi-stakeholder analysis

**Differentiators vs Ask Expert:**
- Fixed panel composition (3-7 experts vs 1-5 dynamic)
- Structured discussion format
- Moderated synthesis
- Higher cost but deeper insights

---

### 3. Ask Committee Service
**Directory:** [`ask-committee/`](./ask-committee/)
**Status:** 🚧 Planned

**Description:**
Large-scale expert committee simulations with 5-12+ agents engaging in multi-round deliberations. Mirrors real-world committee processes with formal procedures, voting, and comprehensive documentation.

**Key Features:**
- Multi-round deliberation
- Formal voting mechanisms
- Subcommittee formation
- Minority reports
- Comprehensive documentation
- Process governance

**Use Cases:**
- Regulatory reviews
- Standards development
- Major strategic decisions
- Governance processes

**Differentiators vs Ask Panel:**
- Larger scale (5-12+ vs 3-7 experts)
- Formal procedures
- Multiple deliberation rounds
- Voting and consensus tracking
- Higher complexity and cost

---

### 4. BYOAI Orchestration Service
**Directory:** [`byoai-orchestration/`](./byoai-orchestration/)
**Status:** 🚧 Planned

**Description:**
Bring Your Own AI - Advanced service allowing users to create custom multi-agent workflows by combining VITAL agents with their own AI models, external APIs, and proprietary systems.

**Key Features:**
- Custom workflow builder
- External model integration
- API orchestration
- Data transformation pipelines
- Custom logic injection
- Workflow templates

**Use Cases:**
- Enterprise integration
- Custom AI applications
- Proprietary model deployment
- Complex automation workflows

**Differentiators:**
- User-defined workflows (vs pre-built services)
- External system integration
- Maximum flexibility
- Advanced users only
- Highest complexity

---

## 📊 Service Comparison Matrix

| Aspect | Ask Expert | Ask Panel | Ask Committee | BYOAI |
|--------|------------|-----------|---------------|-------|
| **Experts** | 1-5 (dynamic) | 3-7 (fixed) | 5-12+ (fixed) | Custom |
| **Workflow** | Linear/Dynamic | Parallel + Synthesis | Multi-round | Custom |
| **Interaction** | Query/Chat | Structured discussion | Formal deliberation | User-defined |
| **Complexity** | LOW-VERY HIGH | MODERATE-HIGH | HIGH-VERY HIGH | VERY HIGH |
| **Response Time** | <1.5s - 5s | 5-10s | 10-30s | Variable |
| **Cost per Query** | $0.05 - $0.30 | $0.50 - $1.00 | $1.00 - $3.00 | Custom |
| **Use Case** | Quick answers, Deep dives | Strategic planning | Major decisions | Custom workflows |
| **User Control** | Mode selection | Panel composition | Committee formation | Full control |
| **Automation** | Full | Moderate | Moderate | Custom |
| **Status** | ✅ Production | 🚧 Planned | 🚧 Planned | 🚧 Planned |

---

## 🎯 Service Selection Guide

### When to Use Ask Expert
✅ **Choose Ask Expert when:**
- Quick answers needed (<5s response)
- Single or few experts sufficient
- Standard workflows acceptable
- Cost optimization important
- User may not know which expert to ask

### When to Use Ask Panel
✅ **Choose Ask Panel when:**
- Need structured expert discussion
- Multiple perspectives required (3-7)
- Moderate complexity questions
- Consensus building important
- Budget allows for panel consultation

### When to Use Ask Committee
✅ **Choose Ask Committee when:**
- Formal deliberation required
- Large expert group needed (5-12+)
- Multiple review rounds necessary
- Voting/consensus tracking critical
- High-stakes decision making
- Comprehensive documentation needed

### When to Use BYOAI
✅ **Choose BYOAI when:**
- Standard services insufficient
- Custom workflow required
- External system integration needed
- Proprietary models to integrate
- Maximum flexibility required
- Advanced technical capabilities available

---

## 🛠 Technical Architecture

### Common Infrastructure

All services share:
- **Frontend**: Next.js 14 + TypeScript + React
- **Backend**: FastAPI + Python 3.11+
- **AI Orchestration**: LangGraph + LangChain
- **Database**: PostgreSQL 15 + pgvector
- **Caching**: Redis 7.x
- **Search**: Pinecone vector database
- **Monitoring**: Prometheus + Grafana
- **Logging**: Structured JSON logs

### Service-Specific Components

**Ask Expert:**
- 4 distinct mode implementations
- Dynamic agent orchestration (Mode 4)
- Conversation state management
- Multi-agent synthesis (Mode 3)

**Ask Panel:**
- Panel moderator agent
- Discussion orchestration
- Consensus algorithms
- Dissent tracking

**Ask Committee:**
- Committee chair agent
- Voting mechanisms
- Multi-round state management
- Subcommittee formation
- Report generation

**BYOAI:**
- Visual workflow builder
- External API connectors
- Custom model integration
- Data transformation engine
- Workflow execution runtime

---

## 📈 Performance Targets

| Service | P50 Response | P95 Response | Throughput | Availability |
|---------|-------------|-------------|------------|--------------|
| **Ask Expert** | <2s | <4s | 500+ QPS | 99.9% |
| **Ask Panel** | <7s | <12s | 100 QPS | 99.9% |
| **Ask Committee** | <20s | <40s | 50 QPS | 99.9% |
| **BYOAI** | Variable | Variable | Variable | 99.5% |

---

## 💰 Cost Structure

### Ask Expert
- **Mode 1 (Chat-Manual)**: ~$0.10 per turn
- **Mode 2 (Query-Manual)**: ~$0.05 per query
- **Mode 3 (Query-Auto)**: ~$0.15-0.30 per query
- **Mode 4 (Chat-Auto)**: ~$0.15 per turn

### Ask Panel
- **Panel Session**: ~$0.50-1.00 per query
- **Cost Factors**: Panel size, discussion rounds, synthesis depth

### Ask Committee
- **Committee Session**: ~$1.00-3.00 per query
- **Cost Factors**: Committee size, deliberation rounds, voting rounds

### BYOAI
- **Custom Pricing**: Based on workflow complexity
- **Cost Factors**: Number of agents, external API calls, custom models

---

## 🚀 Implementation Priority

### Phase 1: Foundation (COMPLETE ✅)
- ✅ Ask Expert - All 4 modes fully documented

### Phase 2: Structured Collaboration (Q1 2026)
- 🚧 Ask Panel - Design and specification
- 🚧 Initial panel orchestration

### Phase 3: Formal Governance (Q2 2026)
- 🚧 Ask Committee - Design and specification
- 🚧 Multi-round deliberation system

### Phase 4: Advanced Integration (Q3-Q4 2026)
- 🚧 BYOAI - Visual builder and runtime
- 🚧 External system integration

---

## 📖 Documentation Structure

Each service directory contains:

```
service-name/
├── README.md                          # Service overview and guide
├── MODE_X_DESCRIPTION.md              # Mode-specific documentation (Ask Expert only)
├── architecture/
│   ├── system-design.md
│   ├── data-flow.md
│   └── api-specification.md
├── implementation/
│   ├── backend/
│   ├── frontend/
│   └── infrastructure/
├── testing/
│   ├── test-strategy.md
│   └── test-cases/
└── deployment/
    ├── kubernetes/
    └── configuration/
```

---

## 🔗 Related Documentation

- **Architecture**: [`../05-architecture/`](../05-architecture/) - Platform architecture
- **Agents**: [`../08-agents/`](../08-agents/) - Agent team structure
- **API**: [`../09-api/`](../09-api/) - API specifications
- **Workflows**: [`../06-workflows/`](../06-workflows/) - Service workflows
- **Product**: [`../03-product/`](../03-product/) - Product requirements

---

## 📞 Getting Started

### For Product Managers
1. Review service comparison matrix above
2. Read individual service READMEs
3. Understand use cases and differentiators
4. Plan service rollout strategy

### For Engineers
1. Start with Ask Expert (most mature)
2. Study MODE documentation for implementation patterns
3. Review architecture documents
4. Follow implementation guides
5. Use provided test suites

### For Architects
1. Review common infrastructure
2. Understand service-specific components
3. Study inter-service integration points
4. Plan scaling and performance strategies

---

**Last Updated**: November 17, 2025
**Version**: 1.0
**Total Services**: 4 (1 production, 3 planned)
**Documentation Status**: Ask Expert complete (306KB), others in planning
