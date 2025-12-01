# Value View Architecture - Visual Diagrams

**Last Updated**: December 1, 2025

---

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        UI[Value View Dashboard<br/>React + TypeScript]
        Filters[Filter Panel<br/>Cascading Filters]
    end

    subgraph "Application Layer"
        API[GraphQL API<br/>Apollo Server]
        Cache[Redis Cache<br/>5min-24h TTL]
        Loader[DataLoader<br/>Batch Entity Loading]
    end

    subgraph "Database Layer"
        Primary[(PostgreSQL Primary<br/>Writes + Transactions)]
        Replica1[(Read Replica 1<br/>Analytics Queries)]
        Replica2[(Read Replica 2<br/>Analytics Queries)]
    end

    subgraph "Materialized Views"
        MV1[mv_odi_heatmap<br/>30K rows]
        MV2[mv_persona_dashboard<br/>43 rows]
        MV3[mv_workflow_analytics<br/>400 rows]
        MV4[mv_strategic_alignment<br/>7 rows]
        MV5[mv_value_realization<br/>5K rows]
        MV6[mv_jtbd_summary<br/>700 rows]
    end

    subgraph "Base Tables (8 Ontology Layers)"
        L0[L0: Domain Knowledge<br/>Industries, TAs, Products]
        L1[L1: Strategic Pillars<br/>SP01-SP07]
        L2[L2: Org Structure<br/>Functions, Depts, Roles]
        L3[L3: Personas<br/>43 Profiles, Archetypes]
        L4[L4: JTBDs<br/>700+ Jobs]
        L5[L5: Outcomes ODI<br/>Importance, Satisfaction]
        L6[L6: Workflows<br/>400+ Templates]
        L7[L7: Value Metrics<br/>Time, Cost, Quality]
    end

    UI --> Filters
    Filters --> API
    API --> Cache
    Cache --> Loader
    Loader --> Replica1
    Loader --> Replica2
    Primary --> Replica1
    Primary --> Replica2

    Replica1 --> MV1
    Replica1 --> MV2
    Replica1 --> MV3
    Replica1 --> MV4
    Replica1 --> MV5
    Replica1 --> MV6

    MV1 --> L0
    MV1 --> L1
    MV1 --> L2
    MV1 --> L3
    MV1 --> L4
    MV1 --> L5
    MV1 --> L6
    MV1 --> L7
```

---

## 2. Ontology Layer Relationships

```mermaid
graph TD
    L0[L0: Domain Knowledge<br/>Therapeutic Areas<br/>Products, Diseases]
    L1[L1: Strategic Pillars<br/>SP01-SP07<br/>OKRs, Themes]
    L2[L2: Org Structure<br/>Functions → Departments → Roles]
    L3[L3: Personas<br/>43 Profiles<br/>MECE Archetypes]
    L4[L4: Jobs-to-be-Done<br/>700+ Jobs<br/>Complexity, Frequency]
    L5[L5: Outcomes ODI<br/>Importance 0-10<br/>Satisfaction 0-10<br/>Opportunity 0-20]
    L6[L6: Workflows<br/>400+ Templates<br/>Phases → Tasks]
    L7[L7: Value Metrics<br/>Time Savings<br/>Cost Reduction<br/>Quality, Risk]

    L0 -->|contextualizes| L1
    L1 -->|guides| L2
    L2 -->|employs| L3
    L3 -->|performs| L4
    L4 -->|produces| L5
    L5 -->|drives| L6
    L6 -->|delivers| L7

    style L0 fill:#e1f5ff
    style L1 fill:#fff3e0
    style L2 fill:#f3e5f5
    style L3 fill:#e8f5e9
    style L4 fill:#fff9c4
    style L5 fill:#ffe0b2
    style L6 fill:#f1f8e9
    style L7 fill:#ffccbc
```

---

## 3. Cascading Filter Flow

```mermaid
graph LR
    A[Tenant Selection] --> B[Industry Filter]
    B --> C[Function Filter]
    C --> D[Department Filter]
    D --> E[Role Filter]
    E --> F[Persona Filter]
    F --> G[Archetype Filter]
    G --> H{JTBD Filters}
    H --> I[Complexity]
    H --> J[Frequency]
    H --> K[Strategic Pillars]
    H --> L[Service Layer]
    I --> M[Results: ODI Heatmap]
    J --> M
    K --> M
    L --> M

    style A fill:#ff6b6b
    style M fill:#51cf66
```

---

## 4. Data Flow: Query Execution Path

```mermaid
sequenceDiagram
    participant User
    participant UI as Value View UI
    participant API as GraphQL API
    participant Cache as Redis Cache
    participant Loader as DataLoader
    participant DB as Read Replica
    participant MV as Materialized View

    User->>UI: Apply Filters (Archetype=AUTOMATOR)
    UI->>API: Query ODI Heatmap
    API->>Cache: Check Cache (key: value_view:tenant:odi:filters)

    alt Cache Hit
        Cache-->>API: Return Cached Data
        API-->>UI: Return Results (50ms)
    else Cache Miss
        Cache-->>API: Not Found
        API->>Loader: Batch Load Entities
        Loader->>DB: SELECT FROM mv_value_view_odi_heatmap
        DB->>MV: Query Materialized View
        MV-->>DB: Return Rows (150ms)
        DB-->>Loader: Return Data
        Loader-->>API: Batched Results
        API->>Cache: Store in Cache (TTL: 24h)
        API-->>UI: Return Results (200ms)
    end

    UI-->>User: Display Heatmap
```

---

## 5. Materialized View Refresh Schedule

```mermaid
gantt
    title Materialized View Refresh Schedule
    dateFormat HH:mm
    axisFormat %H:%M

    section Daily
    Strategic Alignment (Weekly)   :milestone, 01:00, 0m
    ODI Heatmap                     :crit, 02:00, 5m
    Persona Dashboard               :crit, 03:00, 1m
    Workflow Analytics              :crit, 04:00, 3m
    Value Realization               :crit, 05:00, 2m

    section Hourly
    JTBD Summary                    :active, 00:00, 1m
    JTBD Summary                    :active, 01:00, 1m
    JTBD Summary                    :active, 02:00, 1m
    JTBD Summary                    :active, 03:00, 1m
    JTBD Summary                    :active, 04:00, 1m
    JTBD Summary                    :active, 05:00, 1m
```

---

## 6. ODI Scoring Calculation

```mermaid
graph TD
    A[JTBD: Regulatory Submission] --> B{Persona Context}
    B -->|Medical Affairs Manager| C[Importance Score: 9.2]
    B -->|Medical Affairs Manager| D[Satisfaction Score: 4.5]

    C --> E[Calculate Opportunity Score]
    D --> E

    E --> F[Formula:<br/>Importance + MAX Importance - Satisfaction, 0]
    F --> G[9.2 + MAX 9.2 - 4.5, 0]
    G --> H[9.2 + 4.7 = 13.9]

    H --> I{Classify}
    I -->|Score > 15| J[Highly Underserved<br/>CRITICAL]
    I -->|Score 10-15| K[Underserved<br/>HIGH PRIORITY]
    I -->|Score < 10| L[Adequately Served<br/>MONITOR]

    H -.->|13.9| K

    style H fill:#ffeb3b
    style K fill:#ff9800
```

---

## 7. MECE Persona Framework

```mermaid
graph TD
    A[Personas: 43 Total] --> B{AI Maturity}

    B -->|High AI Maturity| C{Work Complexity}
    B -->|Low AI Maturity| D{Work Complexity}

    C -->|Low Complexity<br/>Routine Work| E[AUTOMATOR<br/>10 Personas<br/>Loves automation]
    C -->|High Complexity<br/>Strategic Work| F[ORCHESTRATOR<br/>12 Personas<br/>Multi-agent coordination]

    D -->|Low Complexity<br/>Routine Work| G[LEARNER<br/>8 Personas<br/>Building AI skills]
    D -->|High Complexity<br/>Strategic Work| H[SKEPTIC<br/>13 Personas<br/>Prefers human expertise]

    style E fill:#4caf50
    style F fill:#2196f3
    style G fill:#ff9800
    style H fill:#f44336
```

---

## 8. Service Layer Routing

```mermaid
graph TD
    A[JTBD: Analyze Trial Data] --> B{Complexity Assessment}

    B -->|Low Complexity<br/>Routine Query| C[ASK_ME<br/>Quick Answer<br/>GPT-3.5-Turbo]
    B -->|Medium Complexity<br/>Expert Needed| D[ASK_EXPERT<br/>Single Specialist<br/>GPT-4]
    B -->|High Complexity<br/>Multi-Discipline| E[ASK_PANEL<br/>Expert Panel<br/>Multi-Agent Reasoning]
    B -->|Very High Complexity<br/>Multi-Step Process| F[WORKFLOWS<br/>Automated Workflow<br/>Orchestrated Tasks]

    C --> G{AI Suitability Score}
    D --> G
    E --> G
    F --> G

    G -->|Score >= 0.8| H[High AI Readiness<br/>Automate]
    G -->|Score 0.6-0.8| I[Medium AI Readiness<br/>Augment Human]
    G -->|Score < 0.6| J[Low AI Readiness<br/>Human-Led, AI-Assisted]

    style C fill:#81c784
    style D fill:#64b5f6
    style E fill:#ba68c8
    style F fill:#ffb74d
```

---

## 9. Value Realization Tracking

```mermaid
graph LR
    A[Opportunity Identified] --> B[ODI Score: 13.5<br/>Classification: Underserved]
    B --> C[AI Opportunity Created<br/>Automation: 0.85<br/>Time Savings: 10h/week]
    C --> D[ROI Projected<br/>Cost: $15K<br/>Benefit: $120K/year<br/>Payback: 1.5 months]
    D --> E[Implementation<br/>Status: In Progress]
    E --> F[Benefit Tracking<br/>Baseline: 20h/week<br/>Current: 12h/week<br/>Improvement: 40%]
    F --> G[Value Realized<br/>Actual ROI: 750%<br/>FTE Saved: 0.5]

    style A fill:#e3f2fd
    style B fill:#fff9c4
    style C fill:#f3e5f5
    style D fill:#e8f5e9
    style E fill:#fff3e0
    style F fill:#fce4ec
    style G fill:#c8e6c9
```

---

## 10. Database Partitioning Strategy

```mermaid
graph TD
    A[JTBD Table] --> B{Partition by tenant_id}

    B --> C[jtbd_tenant_pharma<br/>Tenant: Pharmaceuticals<br/>~400 JTBDs]
    B --> D[jtbd_tenant_digital_health<br/>Tenant: Digital Health<br/>~200 JTBDs]
    B --> E[jtbd_tenant_biotech<br/>Tenant: Biotechnology<br/>~100 JTBDs]

    C --> F[Indexes:<br/>- code<br/>- complexity<br/>- frequency]
    D --> F
    E --> F

    F --> G[Query Performance:<br/>50ms average<br/>99% cache hit rate]

    style A fill:#ffeb3b
    style C fill:#81c784
    style D fill:#64b5f6
    style E fill:#ba68c8
    style G fill:#4caf50
```

---

## 11. Caching Strategy (3-Tier)

```mermaid
graph TD
    A[User Request] --> B{Check Browser Cache}

    B -->|Hit| C[Return Cached Data<br/>< 10ms]
    B -->|Miss| D{Check Redis Cache}

    D -->|Hit| E[Return Cached Data<br/>< 50ms]
    D -->|Miss| F{Check Materialized View}

    F -->|View Exists| G[Query PostgreSQL<br/>100-500ms]
    F -->|Stale/Missing| H[Fallback to Base Tables<br/>1-5 seconds]

    G --> I[Update Redis Cache<br/>TTL: 5min-24h]
    H --> I

    I --> J[Update Browser Cache<br/>TTL: 15min-1h]
    J --> K[Return to User]

    style C fill:#4caf50
    style E fill:#8bc34a
    style G fill:#ffeb3b
    style H fill:#ff9800
```

---

## 12. Performance Optimization Layers

```mermaid
graph LR
    subgraph "Database Layer"
        A1[Covering Indexes]
        A2[Materialized Views]
        A3[Partitioning]
        A4[Parallel Queries]
    end

    subgraph "Application Layer"
        B1[DataLoader Batching]
        B2[GraphQL Caching]
        B3[Connection Pooling]
        B4[Query Optimization]
    end

    subgraph "Cache Layer"
        C1[Redis Cluster]
        C2[TTL Strategy]
        C3[Cache Warming]
        C4[Invalidation Logic]
    end

    subgraph "Infrastructure Layer"
        D1[Read Replicas]
        D2[Load Balancer]
        D3[CDN for Static Assets]
        D4[Auto-Scaling]
    end

    A1 --> B1
    A2 --> B2
    A3 --> B3
    A4 --> B4

    B1 --> C1
    B2 --> C2
    B3 --> C3
    B4 --> C4

    C1 --> D1
    C2 --> D2
    C3 --> D3
    C4 --> D4

    D1 --> E[Target Performance:<br/>Dashboard Load < 2s<br/>Query Response < 500ms<br/>Cache Hit Rate > 80%]

    style E fill:#4caf50
```

---

**Last Updated**: December 1, 2025
**Maintained By**: VITAL Data Strategist Agent
