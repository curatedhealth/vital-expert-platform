# 🏗️ VITAL Unified Intelligence - Complete System Architecture

## Overview

This document provides a comprehensive view of the complete VITAL platform architecture after implementing Phases A, B, and C.

---

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          VITAL PLATFORM                                      │
│                   (Next.js 14 + React 19 + TypeScript)                      │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
   ┌────────────────┐ ┌────────────┐ ┌──────────────┐
   │  User Apps     │ │  Admin     │ │  Analytics   │
   │  (End Users)   │ │  Dashboard │ │  Dashboards  │
   └────────┬───────┘ └─────┬──────┘ └──────┬───────┘
            │               │                │
            └───────────────┼────────────────┘
                            ▼
              ┌─────────────────────────┐
              │   API Layer             │
              │   /api/ask-expert       │
              │   /api/knowledge        │
              │   /api/metrics          │
              └────────┬────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
   ┌───────────┐ ┌──────────┐ ┌────────────┐
   │ Agents    │ │ Workflows│ │ Analytics  │
   │ (LangChain│ │(LangGraph│ │ Service    │
   │  /OpenAI) │ │)         │ │(TimescaleDB│
   └─────┬─────┘ └────┬─────┘ └─────┬──────┘
         │            │              │
         └────────────┼──────────────┘
                      ▼
        ┌─────────────────────────────┐
        │   Data & Storage Layer      │
        │   - Supabase (PostgreSQL)   │
        │   - TimescaleDB (Analytics) │
        │   - Pinecone (Vector Store) │
        │   - Redis (Caching)         │
        └──────────┬──────────────────┘
                   │
                   ▼
     ┌──────────────────────────────┐
     │   Monitoring & Observability │
     │   - Prometheus (Metrics)     │
     │   - Grafana (Visualization)  │
     │   - Alertmanager (Alerts)    │
     │   - LangFuse (LLM Tracing)   │
     └──────────────────────────────┘
```

---

## 🔄 Data Flow Architecture

### 1. User Query Flow (Ask Expert)

```
User → Ask Expert UI → /api/ask-expert
                           │
                           ├→ Analytics: trackEvent('query_submitted')
                           │
                           ├→ LangGraph Workflow
                           │     │
                           │     ├→ RAG Agent
                           │     │    ├→ Pinecone (Vector Search)
                           │     │    ├→ Supabase (Document Retrieval)
                           │     │    └→ OpenAI (LLM)
                           │     │
                           │     └→ Response Generation
                           │
                           ├→ Analytics: trackLLMUsage(tokens, cost)
                           ├→ Analytics: trackAgentExecution(success, time)
                           ├→ Prometheus: recordAgentExecution()
                           │
                           └→ Stream Response to User
```

### 2. Analytics Data Flow

```
Application Events
    │
    ├→ UnifiedAnalyticsService (Buffering)
    │     │
    │     ├→ Batch Insert (every 5s)
    │     │     │
    │     │     └→ TimescaleDB Hypertables
    │     │           │
    │     │           ├→ platform_events
    │     │           ├→ tenant_cost_events
    │     │           └→ agent_executions
    │     │
    │     └→ Continuous Aggregates
    │           │
    │           ├→ tenant_daily_summary
    │           ├→ tenant_cost_summary
    │           └→ agent_performance_summary
    │
    └→ Dashboards
          │
          ├→ Rate Limiting Dashboard
          ├→ Abuse Detection Dashboard
          ├→ Cost Analytics Dashboard
          └→ Executive Dashboard
```

### 3. Monitoring Flow

```
Application Metrics
    │
    ├→ prom-client (Instrumentation)
    │     │
    │     └→ /api/metrics (Prometheus format)
    │
    └→ Prometheus (Scraping)
          │
          ├→ Alert Rules Evaluation
          │     │
          │     └→ Alertmanager
          │           │
          │           ├→ Slack (#vital-alerts)
          │           ├→ PagerDuty (Critical)
          │           └→ Email
          │
          └→ Grafana (Visualization)
                │
                ├→ System Health Dashboard
                ├→ Cost Analytics Dashboard
                ├→ Agent Performance Dashboard
                └→ User Analytics Dashboard
```

---

## 🗄️ Database Architecture

### Supabase (PostgreSQL)

```
┌─────────────────────────────────────────────────────────┐
│                    Supabase PostgreSQL                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Core Tables:                                            │
│  ├─ users                 (Authentication & profiles)    │
│  ├─ tenants               (Multi-tenant organizations)   │
│  ├─ agents                (AI agents & configurations)   │
│  ├─ prompts               (Prompt templates)             │
│  ├─ tools                 (Tool registry)                │
│  ├─ workflows             (Workflow definitions)         │
│  ├─ documents             (Knowledge base)               │
│  └─ conversations         (Chat history)                 │
│                                                           │
│  Organizational Structure:                               │
│  ├─ org_functions         (Business functions)           │
│  ├─ org_departments       (Departments)                  │
│  ├─ org_roles             (Roles)                        │
│  └─ personas              (User personas)                │
│                                                           │
│  Rate Limiting & Quotas:                                 │
│  ├─ quota_limits          (Quota definitions)            │
│  └─ quota_usage           (Usage tracking)               │
│                                                           │
│  Audit & Compliance:                                     │
│  └─ audit_logs            (Activity tracking)            │
└─────────────────────────────────────────────────────────┘
```

### TimescaleDB (Analytics)

```
┌─────────────────────────────────────────────────────────┐
│              TimescaleDB Analytics Schema                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Hypertables (Time-Series):                              │
│  ├─ platform_events       (User behavior, queries)       │
│  ├─ tenant_cost_events    (LLM costs, tokens)           │
│  └─ agent_executions      (Performance, quality)         │
│                                                           │
│  Continuous Aggregates:                                  │
│  ├─ tenant_daily_summary     (Daily rollups)            │
│  ├─ tenant_cost_summary      (Cost rollups)             │
│  ├─ agent_performance_summary (Agent metrics)           │
│  ├─ tenant_metrics_realtime   (5-min rollups)           │
│  └─ cost_metrics_realtime     (5-min cost rollups)      │
│                                                           │
│  Helper Functions:                                       │
│  ├─ get_tenant_cost()                                   │
│  ├─ get_agent_success_rate()                           │
│  └─ get_tenant_engagement()                             │
│                                                           │
│  Policies:                                               │
│  ├─ Compression (30-90 days)                            │
│  └─ Retention (3-7 years)                               │
└─────────────────────────────────────────────────────────┘
```

### Vector Database (Pinecone)

```
┌─────────────────────────────────────────────────────────┐
│                   Pinecone Vector DB                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Indexes:                                                │
│  └─ vital-knowledge-base  (Document embeddings)         │
│      ├─ Dimension: 1536 (text-embedding-ada-002)       │
│      ├─ Metric: Cosine similarity                       │
│      └─ Metadata:                                        │
│          ├─ document_id                                  │
│          ├─ tenant_id                                    │
│          ├─ source                                       │
│          └─ created_at                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📈 Analytics & Monitoring Stack

### Phase A: Analytics Foundation

```
┌─────────────────────────────────────────────────────────┐
│              Unified Analytics Service                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Features:                                               │
│  ├─ Event Buffering (5s batches)                        │
│  ├─ Automatic Cost Calculation                          │
│  ├─ Quality Score Tracking (RAGAS)                      │
│  ├─ Tenant Health Scoring                               │
│  └─ Error Tracking                                       │
│                                                           │
│  Methods:                                                │
│  ├─ trackEvent()                                         │
│  ├─ trackLLMUsage()                                      │
│  ├─ trackAgentExecution()                                │
│  ├─ trackWorkflowExecution()                             │
│  └─ flush()                                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                Analytics Dashboards                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ├─ Rate Limiting Dashboard                              │
│  │    ├─ Quota utilization                              │
│  │    ├─ Top consumers                                   │
│  │    └─ Violation alerts                               │
│  │                                                        │
│  ├─ Abuse Detection Dashboard                            │
│  │    ├─ Anomaly detection                              │
│  │    ├─ Suspicious IPs                                  │
│  │    └─ Usage patterns                                  │
│  │                                                        │
│  └─ Cost Analytics Dashboard                             │
│       ├─ Daily/monthly costs                             │
│       ├─ Cost by service/agent                           │
│       └─ Budget tracking                                 │
└─────────────────────────────────────────────────────────┘
```

### Phase C: Real-Time Monitoring

```
┌─────────────────────────────────────────────────────────┐
│                 Prometheus Stack                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Exporters:                                              │
│  ├─ Node Exporter          (System metrics)             │
│  ├─ PostgreSQL Exporter    (Database metrics)           │
│  └─ Next.js /api/metrics   (Application metrics)        │
│                                                           │
│  Metrics Collected:                                      │
│  ├─ HTTP: requests, latency, errors                     │
│  ├─ LLM: tokens, cost, latency                          │
│  ├─ Agents: success, failures, duration                 │
│  ├─ Users: sessions, queries, errors                    │
│  └─ System: CPU, memory, disk                           │
│                                                           │
│  Alert Rules: 30+ rules                                  │
│  ├─ System health                                        │
│  ├─ Database performance                                 │
│  ├─ Application errors                                   │
│  ├─ Cost monitoring                                      │
│  ├─ Agent performance                                    │
│  └─ Security threats                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  Grafana Dashboards                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Pre-configured:                                         │
│  ├─ System Overview        (CPU, memory, disk)          │
│  ├─ Database Performance   (Queries, connections)       │
│  ├─ Application Performance (Requests, latency)         │
│  ├─ Cost Analytics         (Daily, monthly trends)      │
│  ├─ Agent Performance      (Success rates, latency)     │
│  └─ User Analytics         (Sessions, engagement)       │
│                                                           │
│  Datasources:                                            │
│  ├─ Prometheus             (Default)                     │
│  └─ Analytics DB           (TimescaleDB)                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   Alertmanager                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Routing:                                                │
│  ├─ Critical    → PagerDuty (immediate)                 │
│  ├─ Warning     → Slack (#vital-warnings)               │
│  ├─ Cost        → Slack (#vital-finance)                │
│  ├─ Security    → Slack (#vital-security)               │
│  └─ Engineering → Slack (#vital-engineering)            │
│                                                           │
│  Features:                                               │
│  ├─ Alert grouping                                       │
│  ├─ Deduplication                                        │
│  ├─ Inhibition rules                                     │
│  └─ Silencing                                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                     LangFuse                             │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  LLM Observability:                                      │
│  ├─ Request tracing                                      │
│  ├─ Token usage tracking                                 │
│  ├─ Cost attribution                                     │
│  ├─ Latency monitoring                                   │
│  └─ Error tracking                                       │
│                                                           │
│  Integration Points:                                     │
│  ├─ OpenAI calls                                         │
│  ├─ LangChain agents                                     │
│  └─ LangGraph workflows                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Admin Dashboard Architecture

```
┌─────────────────────────────────────────────────────────┐
│              VITAL Admin Dashboard                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Overview:                                               │
│  ├─ Executive Dashboard    (Real-time system health)    │
│  └─ Admin Dashboard        (Statistics & quick access)  │
│                                                           │
│  User & Access:                                          │
│  └─ User Management        (CRUD, roles, permissions)   │
│                                                           │
│  AI Resources:                                           │
│  ├─ Agent Management       (CRUD, configurations)       │
│  ├─ Prompt Management      (Templates, versions)        │
│  └─ Tool Management        (Registry, health)           │
│                                                           │
│  Analytics & Monitoring:                                 │
│  ├─ Agent Analytics        (Performance, quality)       │
│  ├─ Feedback Analytics     (Satisfaction, issues)       │
│  ├─ Services Analytics     (Usage patterns)             │
│  └─ System Metrics         (Real-time monitoring)       │
│                                                           │
│  LLM Management:                                         │
│  ├─ Provider Dashboard     (Status, health)             │
│  ├─ Usage Analytics        (Token consumption)          │
│  ├─ OpenAI Usage           (Specific tracking)          │
│  └─ LLM Cost Tracking      (Cost breakdown)             │
│                                                           │
│  Organization Management:                                │
│  ├─ Organizations          (Tenants)                    │
│  ├─ Functions              (Business functions)         │
│  ├─ Roles                  (Organizational roles)       │
│  └─ Personas               (User personas)              │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security & Compliance

```
┌─────────────────────────────────────────────────────────┐
│              Security Architecture                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Authentication:                                         │
│  ├─ Supabase Auth          (JWT-based)                  │
│  ├─ Row-Level Security     (Database)                   │
│  └─ Session Management     (Server-side)                │
│                                                           │
│  Authorization:                                          │
│  ├─ Role-Based Access Control (RBAC)                    │
│  ├─ Tenant Isolation       (Multi-tenancy)              │
│  └─ API Key Management     (Service auth)               │
│                                                           │
│  Rate Limiting:                                          │
│  ├─ Per-user quotas                                      │
│  ├─ Per-tenant quotas                                    │
│  └─ IP-based rate limits                                │
│                                                           │
│  Monitoring:                                             │
│  ├─ Audit logs             (All actions)                │
│  ├─ Security alerts        (Suspicious activity)        │
│  └─ Abuse detection        (Anomaly detection)          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 Production Deployment                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Application Layer:                                      │
│  └─ Next.js App            (Vercel/Self-hosted)         │
│                                                           │
│  Data Layer:                                             │
│  ├─ Supabase               (Managed PostgreSQL)         │
│  ├─ TimescaleDB            (Analytics)                  │
│  ├─ Pinecone               (Vector search)              │
│  └─ Redis/Upstash          (Caching, sessions)          │
│                                                           │
│  Monitoring Layer:                                       │
│  ├─ Prometheus             (Docker Compose)             │
│  ├─ Grafana                (Docker Compose)             │
│  ├─ Alertmanager           (Docker Compose)             │
│  └─ LangFuse               (Docker Compose)             │
│                                                           │
│  External Services:                                      │
│  ├─ OpenAI                 (LLM provider)               │
│  ├─ Slack                  (Alerting)                   │
│  ├─ PagerDuty              (Incident management)        │
│  └─ Sentry                 (Error tracking)             │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Key Metrics Summary

### Tracked Metrics (40+)

**Application Metrics:**
- HTTP requests (rate, latency, errors)
- User sessions (active, total, duration)
- Queries (volume, success rate)

**LLM Metrics:**
- Token usage (prompt, completion, total)
- Cost (by model, provider, agent)
- Latency (request duration)
- Quality scores (RAGAS metrics)

**Agent Metrics:**
- Executions (total, success, failures)
- Performance (latency, throughput)
- Quality (response quality, citations)

**System Metrics:**
- CPU, Memory, Disk usage
- Database connections & queries
- Network I/O

**Business Metrics:**
- Daily/monthly costs
- User engagement
- Tenant health scores
- Feature usage

---

## 🎯 Integration Status

| Component | Phase A | Phase B | Phase C | Status |
|-----------|---------|---------|---------|--------|
| Analytics Schema | ✅ | - | - | Complete |
| Analytics Service | ✅ | - | - | Complete |
| Cost Dashboards | ✅ | - | - | Complete |
| Ask Expert Integration | - | ✅ | - | Complete |
| Prometheus Stack | - | - | ✅ | Complete |
| Grafana Dashboards | - | - | ✅ | Complete |
| Alertmanager | - | - | ✅ | Complete |
| LangFuse | - | - | ✅ | Ready |
| Executive Dashboard | - | - | ✅ | Complete |

---

## 📈 System Capabilities

**Real-Time:**
- ✅ Live system health monitoring
- ✅ Active user sessions tracking
- ✅ Cost burn rate monitoring
- ✅ Agent performance metrics
- ✅ Alert notifications (30s delay)

**Historical:**
- ✅ 3-7 years data retention
- ✅ Time-series analytics
- ✅ Trend analysis
- ✅ Cost attribution
- ✅ Compliance reporting

**Predictive:**
- ⚠️ Anomaly detection (basic)
- ⏳ Cost forecasting (Phase D)
- ⏳ Churn prediction (Phase D)
- ⏳ Capacity planning (Phase D)

---

## 🎯 Next Phase: Phase D

**Business Intelligence & Advanced Analytics:**

1. Tenant Health Scoring
2. Churn Prediction Models
3. Cost Optimization Engine
4. Revenue Analytics
5. ML-based Anomaly Detection
6. Automated Remediation
7. Executive BI Dashboards

---

**Status:** Phases A, B, C Complete ✅  
**Total Components:** 60+  
**Total Metrics:** 40+  
**Total Alerts:** 30+  
**Production Ready:** ✅

