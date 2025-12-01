# Agent 0S: Visual Guide with Mermaid Diagrams

**VITAL Platform - Intelligent Agent Orchestration System**

**Version:** 1.0  
**Last Updated:** December 2025  
**Companion Document to:** AGENT_0S_BUSINESS_GUIDE.md

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Agent Selection Flow](#2-agent-selection-flow)
3. [Escalation Patterns](#3-escalation-patterns)
4. [Delegation Patterns](#4-delegation-patterns)
5. [Service Modes](#5-service-modes)
6. [Agent Enrichment](#6-agent-enrichment)
7. [Hybrid Search Architecture](#7-hybrid-search-architecture)
8. [Workflow Integration](#8-workflow-integration)
9. [End-to-End Scenarios](#9-end-to-end-scenarios)

---

## 1. System Overview

### 1.1 Agent 0S High-Level Architecture

```mermaid
flowchart TB
    subgraph Users["👥 Users"]
        U1[Business User]
        U2[Medical Professional]
        U3[Regulatory Expert]
    end

    subgraph Frontend["🖥️ Frontend Layer"]
        AM[Ask Me]
        AE[Ask Expert]
        AP[Ask Panel]
        WF[Workflows]
    end

    subgraph AgentOS["🤖 Agent 0S Core"]
        direction TB
        IB[Intelligence Broker]
        EBS[Evidence-Based Selector]
        DE[Delegation Engine]
        HM[Hierarchy Manager]
    end

    subgraph Agents["👔 1,000+ Agents"]
        L1[L1: Master<br/>25+ Agents]
        L2[L2: Expert<br/>850+ Agents]
        L3[L3: Specialist<br/>100+ Agents]
        L4[L4: Worker<br/>25+ Agents]
        L5[L5: Tool<br/>100+ Tools]
    end

    subgraph Data["💾 Data Layer"]
        PG[(PostgreSQL)]
        PC[(Pinecone)]
        N4[(Neo4j)]
        SB[(Supabase)]
    end

    Users --> Frontend
    Frontend --> AgentOS
    AgentOS --> Agents
    AgentOS <--> Data
    Agents --> Data

    style AgentOS fill:#e1f5fe
    style Agents fill:#fff3e0
    style Data fill:#f3e5f5
```

### 1.2 The 5-Level Agent Hierarchy

```mermaid
flowchart TB
    subgraph Human["👤 Human-in-the-Loop"]
        HITL[Human Oversight<br/>Final Authority]
    end

    subgraph L1["Level 1: MASTER"]
        M1[Master Clinical<br/>Orchestrator]
        M2[Master Regulatory<br/>Planner]
        M3[Master Market Access<br/>Director]
    end

    subgraph L2["Level 2: EXPERT ⭐"]
        E1[Medical Affairs<br/>Expert]
        E2[Regulatory<br/>Expert]
        E3[Clinical Development<br/>Expert]
        E4[Market Access<br/>Expert]
        EN[... 850+ more]
    end

    subgraph L3["Level 3: SPECIALIST"]
        S1[FDA 510k<br/>Specialist]
        S2[HEOR<br/>Analyst]
        S3[Biostatistics<br/>Specialist]
        SN[... 100+ more]
    end

    subgraph L4["Level 4: WORKER"]
        W1[Data Extraction<br/>Worker]
        W2[Document<br/>Processor]
        W3[Analysis<br/>Worker]
    end

    subgraph L5["Level 5: TOOL"]
        T1[PubMed<br/>Search]
        T2[FDA<br/>Database]
        T3[Clinical Trials<br/>API]
        TN[... 100+ tools]
    end

    HITL <-.->|Escalation| L1
    L1 <-->|Delegate/Escalate| L2
    L2 <-->|Delegate/Escalate| L3
    L3 <-->|Delegate/Escalate| L4
    L4 -->|Execute| L5

    style L2 fill:#fff9c4,stroke:#f9a825,stroke-width:3px
    style Human fill:#ffcdd2
```

---

## 2. Agent Selection Flow

### 2.1 Evidence-Based Agent Selection (8-Factor Scoring)

```mermaid
flowchart TB
    subgraph Input["📥 Input"]
        Q[User Query]
        CTX[Context<br/>Tenant, History]
    end

    subgraph Assessment["🔍 Query Assessment"]
        QA[Query Analyzer<br/>LLM-based]
        QA --> COMP[Complexity<br/>Low/Medium/High]
        QA --> RISK[Risk Level<br/>Low/Medium/High]
        QA --> ACC[Required Accuracy<br/>85-98%]
        QA --> TRIG[Escalation<br/>Triggers]
    end

    subgraph TierDet["📊 Tier Determination"]
        T1[Tier 1<br/>Rapid Response]
        T2[Tier 2<br/>Expert Analysis]
        T3[Tier 3<br/>Deep + HITL]
    end

    subgraph Search["🔎 Multi-Modal Search"]
        direction LR
        VS[Vector Search<br/>Pinecone 50%]
        FS[Full-Text Search<br/>Postgres 30%]
        GS[Graph Search<br/>Neo4j 20%]
    end

    subgraph Scoring["⚖️ 8-Factor Scoring"]
        F1[1. Semantic Similarity 30%]
        F2[2. Domain Expertise 25%]
        F3[3. Historical Performance 15%]
        F4[4. Keyword Relevance 10%]
        F5[5. Graph Proximity 10%]
        F6[6. User Preference 5%]
        F7[7. Availability 3%]
        F8[8. Tier Compatibility 2%]
    end

    subgraph Output["📤 Selection Result"]
        SA[Selected Agent(s)]
        CONF[Confidence Score]
        REASON[Recommendation<br/>Reason]
    end

    Input --> Assessment
    Assessment --> TierDet
    TierDet --> Search
    Search --> Scoring
    Scoring --> Output

    style Scoring fill:#e8f5e9
    style Output fill:#e3f2fd
```

### 2.2 Agent Selection Decision Tree

```mermaid
flowchart TD
    START([User Query Received]) --> ASSESS{Assess Query<br/>Complexity}
    
    ASSESS -->|Simple| T1[Tier 1<br/>Rapid Response]
    ASSESS -->|Medium| T2[Tier 2<br/>Expert Analysis]
    ASSESS -->|Complex/Critical| T3[Tier 3<br/>Deep + HITL]
    
    T1 --> SEARCH1[Single Vector<br/>Search]
    T2 --> SEARCH2[Hybrid Search<br/>Vector + Graph]
    T3 --> SEARCH3[Full Hybrid<br/>+ Panel Mode]
    
    SEARCH1 --> SCORE1[Quick Score<br/>Top 1 Agent]
    SEARCH2 --> SCORE2[8-Factor Score<br/>Top 1-3 Agents]
    SEARCH3 --> SCORE3[8-Factor Score<br/>+ Diversity Check]
    
    SCORE1 --> GATE1{Confidence<br/>> 85%?}
    SCORE2 --> GATE2{Confidence<br/>> 90%?}
    SCORE3 --> GATE3{Confidence<br/>> 94%?}
    
    GATE1 -->|Yes| SELECT1[Select Agent]
    GATE1 -->|No| FALLBACK1[Use Fallback<br/>Agent]
    
    GATE2 -->|Yes| SELECT2[Select Agent(s)]
    GATE2 -->|No| ESCALATE2[Escalate to<br/>Tier 3]
    
    GATE3 -->|Yes| SELECT3[Select Panel]
    GATE3 -->|No| HITL[Request Human<br/>Oversight]
    
    SELECT1 --> EXECUTE([Execute Query])
    SELECT2 --> EXECUTE
    SELECT3 --> EXECUTE
    FALLBACK1 --> EXECUTE
    ESCALATE2 --> T3
    HITL --> EXECUTE

    style T1 fill:#c8e6c9
    style T2 fill:#fff9c4
    style T3 fill:#ffcdd2
```

### 2.3 Service-Specific Agent Selection

```mermaid
flowchart LR
    subgraph Services["VITAL Services"]
        ASK_ME[Ask Me]
        ASK_EXP[Ask Expert]
        ASK_PAN[Ask Panel]
        WORK[Workflows]
    end

    subgraph Selection["Selection Rules"]
        R1[Single Agent<br/>Auto-Selected]
        R2[Single Expert<br/>Manual or Auto]
        R3[3-5 Diverse<br/>Experts]
        R4[Task-Specific<br/>Agent Chain]
    end

    subgraph Constraints["Service Constraints"]
        C1[Tier 1 Only<br/>No Spawning]
        C2[Tier 2/3<br/>Optional Spawning]
        C3[Tier 3 Required<br/>Diversity Enforced]
        C4[Full Hierarchy<br/>Available]
    end

    ASK_ME --> R1 --> C1
    ASK_EXP --> R2 --> C2
    ASK_PAN --> R3 --> C3
    WORK --> R4 --> C4

    style ASK_ME fill:#e8f5e9
    style ASK_EXP fill:#e3f2fd
    style ASK_PAN fill:#fff3e0
    style WORK fill:#fce4ec
```

---

## 3. Escalation Patterns

### 3.1 Escalation Decision Flow

```mermaid
flowchart TD
    START([Agent Processing<br/>Query]) --> CHECK1{Confidence<br/>> 75%?}
    
    CHECK1 -->|Yes| CHECK2{Within<br/>Domain?}
    CHECK1 -->|No| ESC1[ESCALATE:<br/>Low Confidence]
    
    CHECK2 -->|Yes| CHECK3{Complexity<br/>Manageable?}
    CHECK2 -->|No| ESC2[ESCALATE:<br/>Out of Domain]
    
    CHECK3 -->|Yes| CHECK4{Risk Level<br/>Acceptable?}
    CHECK3 -->|No| ESC3[ESCALATE:<br/>High Complexity]
    
    CHECK4 -->|Yes| CHECK5{Policy<br/>Compliant?}
    CHECK4 -->|No| ESC4[ESCALATE:<br/>Safety/Risk]
    
    CHECK5 -->|Yes| PROCESS([Process<br/>Normally])
    CHECK5 -->|No| ESC5[ESCALATE:<br/>Policy Violation]
    
    ESC1 --> TARGET{Determine<br/>Target}
    ESC2 --> TARGET
    ESC3 --> TARGET
    ESC4 --> TARGET
    ESC5 --> TARGET
    
    TARGET -->|L3 Agent| PARENT_L2[Escalate to<br/>L2 Expert]
    TARGET -->|L2 Agent| PARENT_L1[Escalate to<br/>L1 Master]
    TARGET -->|L1 Agent| PARENT_HITL[Escalate to<br/>Human]
    TARGET -->|Critical| PARENT_HITL

    style ESC1 fill:#ffcdd2
    style ESC2 fill:#ffcdd2
    style ESC3 fill:#ffcdd2
    style ESC4 fill:#ffcdd2
    style ESC5 fill:#ffcdd2
    style PARENT_HITL fill:#ef5350,color:#fff
```

### 3.2 Escalation Hierarchy

```mermaid
flowchart BT
    subgraph L5["Level 5: TOOL"]
        TOOL[Tool Agent<br/>Execution Failed]
    end

    subgraph L4["Level 4: WORKER"]
        WORKER[Worker Agent<br/>Resource Limit]
    end

    subgraph L3["Level 3: SPECIALIST"]
        SPEC[Specialist Agent<br/>Out of Scope]
    end

    subgraph L2["Level 2: EXPERT"]
        EXP[Expert Agent<br/>Cross-Domain Need]
    end

    subgraph L1["Level 1: MASTER"]
        MASTER[Master Agent<br/>Strategic Decision]
    end

    subgraph Human["Human-in-the-Loop"]
        HITL[Human Reviewer<br/>Final Authority]
    end

    TOOL -->|"Tool Failure"| WORKER
    WORKER -->|"Resource Exceeded"| SPEC
    SPEC -->|"Beyond Specialization"| EXP
    EXP -->|"Cross-Domain/Complex"| MASTER
    MASTER -->|"Critical Decision"| HITL

    style Human fill:#ffcdd2,stroke:#c62828,stroke-width:2px
    style L1 fill:#fff9c4
    style L2 fill:#c8e6c9
```

### 3.3 HITL (Human-in-the-Loop) Triggers

```mermaid
flowchart TB
    subgraph Triggers["🚨 HITL Triggers"]
        direction TB
        SAFETY[Patient Safety<br/>Concern]
        COMPLY[Compliance<br/>Critical]
        BUSINESS[Business<br/>Critical]
        EXCEPT[Exception<br/>Request]
    end

    subgraph Examples["📋 Examples"]
        E1[Drug dosing<br/>recommendations]
        E2[Regulatory<br/>submissions]
        E3[Contract<br/>approvals]
        E4[Policy<br/>exceptions]
    end

    subgraph Actions["✅ Human Actions"]
        APPROVE[Approve<br/>Response]
        MODIFY[Modify &<br/>Approve]
        REJECT[Reject &<br/>Reassign]
        OVERRIDE[Override<br/>Decision]
    end

    SAFETY --> E1
    COMPLY --> E2
    BUSINESS --> E3
    EXCEPT --> E4

    E1 --> APPROVE
    E2 --> MODIFY
    E3 --> REJECT
    E4 --> OVERRIDE

    style Triggers fill:#ffcdd2
    style Actions fill:#c8e6c9
```

---

## 4. Delegation Patterns

### 4.1 Delegation Decision Flow

```mermaid
flowchart TD
    START([Agent Receives<br/>Complex Task]) --> ANALYZE{Analyze Task<br/>Complexity}
    
    ANALYZE -->|Simple| SELF[Handle<br/>Internally]
    ANALYZE -->|Complex| DECOMPOSE[Decompose<br/>into Sub-tasks]
    
    DECOMPOSE --> CHECK_SUB{Sub-agents<br/>Available?}
    
    CHECK_SUB -->|Yes| MATCH[Match Sub-tasks<br/>to Sub-agents]
    CHECK_SUB -->|No| SPAWN{Can Spawn<br/>Sub-agents?}
    
    SPAWN -->|Yes| CREATE[Create<br/>Sub-agents]
    SPAWN -->|No| SELF
    
    MATCH --> CONTEXT[Prepare Context<br/>for Each]
    CREATE --> CONTEXT
    
    CONTEXT --> PATTERN{Execution<br/>Pattern?}
    
    PATTERN -->|Sequential| SEQ[Execute<br/>Sequentially]
    PATTERN -->|Parallel| PAR[Execute<br/>in Parallel]
    PATTERN -->|Hierarchical| HIER[Execute<br/>Hierarchically]
    
    SEQ --> AGGREGATE[Aggregate<br/>Results]
    PAR --> AGGREGATE
    HIER --> AGGREGATE
    
    AGGREGATE --> SYNTHESIZE[Synthesize<br/>Final Response]
    SELF --> SYNTHESIZE
    
    SYNTHESIZE --> RESPOND([Return<br/>Response])

    style DECOMPOSE fill:#e3f2fd
    style CONTEXT fill:#fff3e0
    style AGGREGATE fill:#e8f5e9
```

### 4.2 Delegation Patterns

```mermaid
flowchart TB
    subgraph Sequential["Pattern 1: Sequential"]
        direction LR
        S_EXP[Expert] --> S_SP1[Specialist 1<br/>completes] --> S_SP2[Specialist 2<br/>completes] --> S_SYN[Synthesize]
    end

    subgraph Parallel["Pattern 2: Parallel"]
        P_EXP[Expert] --> P_SP1[Specialist 1]
        P_EXP --> P_SP2[Specialist 2]
        P_EXP --> P_SP3[Specialist 3]
        P_SP1 --> P_AGG[Aggregate]
        P_SP2 --> P_AGG
        P_SP3 --> P_AGG
    end

    subgraph Hierarchical["Pattern 3: Hierarchical"]
        H_EXP[Expert] --> H_SP1[Specialist A]
        H_EXP --> H_SP2[Specialist B]
        H_SP1 --> H_W1[Worker 1]
        H_SP1 --> H_W2[Worker 2]
        H_W1 --> H_T1[Tool X]
        H_W2 --> H_T2[Tool Y]
        H_SP2 --> H_T3[Tool Z]
    end

    subgraph Panel["Pattern 4: Panel Discussion"]
        PAN_M[Master] --> PAN_E1[Expert 1]
        PAN_M --> PAN_E2[Expert 2]
        PAN_M --> PAN_E3[Expert 3]
        PAN_E1 --> PAN_D[Discussion &<br/>Debate]
        PAN_E2 --> PAN_D
        PAN_E3 --> PAN_D
        PAN_D --> PAN_C[Consensus]
    end

    style Sequential fill:#e8f5e9
    style Parallel fill:#e3f2fd
    style Hierarchical fill:#fff3e0
    style Panel fill:#fce4ec
```

### 4.3 Context Engineering for Delegation

```mermaid
flowchart TB
    subgraph Parent["👔 Parent Agent"]
        FULL_CTX[Full Context<br/>Query + History + RAG]
    end

    subgraph Engineering["⚙️ Context Engineering"]
        FILTER[Filter Relevant<br/>Information]
        FORMAT[Format for<br/>Sub-task]
        CRITERIA[Add Delegation<br/>Criteria]
        CONSTRAINTS[Define<br/>Constraints]
    end

    subgraph SubAgent["👷 Sub-Agent Receives"]
        TASK[Task Description<br/>What to do]
        REL_CTX[Relevant Context<br/>Filtered info]
        ESC_CRIT[Escalation Criteria<br/>When to escalate]
        OUTPUT[Output Format<br/>How to respond]
        LIMITS[Constraints<br/>Boundaries]
    end

    FULL_CTX --> FILTER
    FILTER --> FORMAT
    FORMAT --> CRITERIA
    CRITERIA --> CONSTRAINTS

    CONSTRAINTS --> TASK
    CONSTRAINTS --> REL_CTX
    CONSTRAINTS --> ESC_CRIT
    CONSTRAINTS --> OUTPUT
    CONSTRAINTS --> LIMITS

    style Engineering fill:#fff9c4
    style SubAgent fill:#e8f5e9
```

---

## 5. Service Modes

### 5.1 The 4-Mode Architecture

```mermaid
quadrantChart
    title VITAL 4-Mode Architecture
    x-axis Manual Selection --> Auto Selection
    y-axis Conversational --> Agentic
    quadrant-1 Mode 2: Auto + Interactive
    quadrant-2 Mode 1: Manual + Interactive
    quadrant-3 Mode 3: Manual + Agentic
    quadrant-4 Mode 4: Auto + Agentic
    Mode 1: [0.25, 0.75]
    Mode 2: [0.75, 0.75]
    Mode 3: [0.25, 0.25]
    Mode 4: [0.75, 0.25]
```

### 5.2 Service Mode Selection

```mermaid
flowchart TD
    START([User Query]) --> TYPE{Query Type?}
    
    TYPE -->|Simple Question| ASK_ME[Ask Me<br/>Tier 1]
    TYPE -->|Domain Expertise| EXPERT{Agent<br/>Selection?}
    TYPE -->|Multi-Perspective| PANEL[Ask Panel<br/>Tier 3]
    TYPE -->|Multi-Step Task| WORKFLOW[Workflows<br/>Full Hierarchy]
    
    EXPERT -->|User Chooses| MODE1[Mode 1<br/>Manual + Interactive]
    EXPERT -->|System Chooses| MODE2[Mode 2<br/>Auto + Interactive]
    
    PANEL --> MODE4[Mode 4<br/>Auto + Panel]
    
    WORKFLOW -->|User Chooses Agent| MODE3[Mode 3<br/>Manual + Agentic]
    WORKFLOW -->|System Chooses| MODE4
    
    ASK_ME --> RESP1[< 5 sec<br/>85-92% accuracy]
    MODE1 --> RESP2[< 30 sec<br/>90-96% accuracy]
    MODE2 --> RESP2
    MODE3 --> RESP3[< 120 sec<br/>94-98% accuracy]
    MODE4 --> RESP3

    style ASK_ME fill:#c8e6c9
    style MODE1 fill:#e3f2fd
    style MODE2 fill:#e3f2fd
    style MODE3 fill:#fff9c4
    style MODE4 fill:#ffcdd2
```

### 5.3 Ask Expert Flow (Modes 1 & 2)

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as API Gateway
    participant WF as LangGraph Workflow
    participant SEL as Agent Selector
    participant AG as Expert Agent
    participant RAG as RAG Service
    participant DB as Database

    U->>FE: Submit Query
    FE->>API: POST /ask-expert
    API->>WF: Initialize Workflow
    
    alt Mode 1 (Manual)
        WF->>DB: Load User-Selected Agent
    else Mode 2 (Auto)
        WF->>SEL: Select Best Agent
        SEL->>DB: Search Agents (8-factor)
        DB-->>SEL: Ranked Agents
        SEL-->>WF: Selected Agent
    end
    
    WF->>AG: Load Agent Profile
    AG->>RAG: Retrieve Context
    RAG-->>AG: Relevant Documents
    AG->>AG: Generate Response
    
    alt Confidence < Threshold
        AG->>WF: Request Escalation
        WF->>WF: Escalate to Higher Level
    end
    
    AG-->>WF: Response + Confidence
    WF-->>API: Final Response
    API-->>FE: Stream Response
    FE-->>U: Display Answer
```

### 5.4 Ask Panel Flow (Mode 4)

```mermaid
sequenceDiagram
    participant U as User
    participant WF as Workflow
    participant SEL as Selector
    participant E1 as Expert 1
    participant E2 as Expert 2
    participant E3 as Expert 3
    participant AGG as Aggregator
    participant HITL as Human (if needed)

    U->>WF: Complex Query
    WF->>SEL: Select Diverse Panel
    SEL-->>WF: 3-5 Experts
    
    par Parallel Execution
        WF->>E1: Query + Context
        WF->>E2: Query + Context
        WF->>E3: Query + Context
    end
    
    E1-->>WF: Response 1
    E2-->>WF: Response 2
    E3-->>WF: Response 3
    
    WF->>AGG: Aggregate Responses
    
    alt Consensus Reached
        AGG-->>WF: Synthesized Response
    else Disagreement
        AGG->>WF: Highlight Differences
        WF->>HITL: Request Review
        HITL-->>WF: Final Decision
    end
    
    WF-->>U: Panel Response
```

---

## 6. Agent Enrichment

### 6.1 Agent Enrichment Data Model

```mermaid
erDiagram
    AGENT ||--o{ AGENT_CAPABILITIES : has
    AGENT ||--o{ AGENT_SKILLS : has
    AGENT ||--o{ AGENT_TOOLS : assigned
    AGENT ||--o{ AGENT_ROLES : mapped_to
    AGENT ||--o{ AGENT_DOMAINS : expert_in
    
    AGENT {
        uuid id PK
        string name
        string display_name
        text system_prompt
        string model
        float temperature
        int tier
        string status
    }
    
    CAPABILITIES ||--o{ AGENT_CAPABILITIES : defines
    CAPABILITIES {
        uuid id PK
        string name
        string category
        string complexity
    }
    
    SKILLS ||--o{ AGENT_SKILLS : defines
    SKILLS {
        uuid id PK
        string name
        string category
    }
    
    TOOLS ||--o{ AGENT_TOOLS : defines
    TOOLS {
        uuid id PK
        string name
        string tool_key
        boolean is_active
    }
    
    ORG_ROLES ||--o{ AGENT_ROLES : defines
    ORG_ROLES {
        uuid id PK
        string name
        uuid department_id
        uuid function_id
    }
    
    KNOWLEDGE_DOMAINS ||--o{ AGENT_DOMAINS : defines
    KNOWLEDGE_DOMAINS {
        uuid id PK
        string name
        string code
    }
    
    AGENT_CAPABILITIES {
        uuid agent_id FK
        uuid capability_id FK
        string proficiency_level
        float proficiency_score
    }
    
    AGENT_SKILLS {
        uuid agent_id FK
        uuid skill_id FK
        string proficiency_level
        boolean is_primary
    }
    
    AGENT_TOOLS {
        uuid agent_id FK
        uuid tool_id FK
        boolean is_enabled
        boolean auto_use
        int priority
    }
```

### 6.2 Agent Loading & Enrichment Flow

```mermaid
flowchart TB
    subgraph Load["1️⃣ Load Core Agent"]
        L1[Query agents table]
        L2[Get name, model, prompt]
    end

    subgraph Capabilities["2️⃣ Load Capabilities"]
        C1[Query agent_capabilities]
        C2[Join capabilities table]
        C3[Get proficiency levels]
    end

    subgraph Skills["3️⃣ Load Skills"]
        S1[Query agent_skills]
        S2[Join skills table]
        S3[Identify primary skills]
    end

    subgraph Tools["4️⃣ Load Tools"]
        T1[Query agent_tool_assignments]
        T2[Filter enabled tools]
        T3[Sort by priority]
    end

    subgraph Org["5️⃣ Load Organization"]
        O1[Get department_name]
        O2[Get function_name]
        O3[Get role_name]
    end

    subgraph Hierarchy["6️⃣ Load Hierarchy"]
        H1[Query agent_hierarchies]
        H2[Get parent/children]
        H3[Get spawn permissions]
    end

    subgraph Profile["7️⃣ Build Profile"]
        P1[Combine all data]
        P2[Create AgentProfile]
        P3[Ready for execution]
    end

    Load --> Capabilities --> Skills --> Tools --> Org --> Hierarchy --> Profile

    style Profile fill:#c8e6c9
```

### 6.3 Persona & Communication Style

```mermaid
flowchart LR
    subgraph Archetypes["10 Persona Archetypes"]
        A1[Clinical Expert]
        A2[Regulatory Authority]
        A3[Data Analyst]
        A4[Safety Officer]
        A5[Research Specialist]
        A6[Business Strategist]
        A7[Operations Manager]
        A8[Compliance Guardian]
        A9[Innovation Advisor]
        A10[Patient Advocate]
    end

    subgraph Attributes["Persona Attributes"]
        AT1[Tone: Formal/Professional/Accessible]
        AT2[Formality: 0-100%]
        AT3[Empathy: 0-100%]
        AT4[Directness: 0-100%]
    end

    subgraph Styles["8 Communication Styles"]
        S1[Concise Technical]
        S2[Detailed Technical]
        S3[Concise Accessible]
        S4[Detailed Accessible]
        S5[Balanced]
        S6[Executive Summary]
        S7[Educational]
        S8[Data-Driven]
    end

    Archetypes --> Attributes
    Attributes --> Styles
```

---

## 7. Hybrid Search Architecture

### 7.1 Intelligence Broker Flow

```mermaid
flowchart TB
    subgraph Input["📥 Query Input"]
        Q[User Query]
        M[Metadata<br/>Tenant, Mode]
    end

    subgraph Analysis["🔍 Query Analysis"]
        CA[Complexity<br/>Analysis]
        SS[Strategy<br/>Selection]
        NS[Namespace<br/>Determination]
    end

    subgraph Search["🔎 Parallel Search"]
        direction LR
        subgraph Vector["Pinecone (50%)"]
            V1[Generate<br/>Embedding]
            V2[Similarity<br/>Search]
        end
        subgraph FullText["PostgreSQL (30%)"]
            F1[Parse<br/>Keywords]
            F2[Full-Text<br/>Search]
        end
        subgraph Graph["Neo4j (20%)"]
            G1[Entity<br/>Extraction]
            G2[Graph<br/>Traversal]
        end
    end

    subgraph Fusion["⚡ Result Fusion"]
        RRF[Reciprocal Rank<br/>Fusion]
        RANK[Re-ranking]
        ENRICH[Ontology<br/>Enrichment]
    end

    subgraph Output["📤 Output"]
        CTX[Context<br/>Chunks]
        CONF[Confidence<br/>Score]
        EVID[Evidence<br/>Summary]
    end

    Input --> Analysis
    Analysis --> Search
    Vector --> RRF
    FullText --> RRF
    Graph --> RRF
    RRF --> RANK --> ENRICH --> Output

    style Fusion fill:#fff9c4
    style Output fill:#c8e6c9
```

### 7.2 L0-L7 Ontology Layers

```mermaid
flowchart TB
    subgraph Ontology["Knowledge Graph Ontology"]
        L0[L0: Domain Knowledge<br/>Diseases, Products, Therapies]
        L1[L1: Functions<br/>Medical Affairs, Commercial, R&D]
        L2[L2: Departments<br/>Medical Info, Field Medical]
        L3[L3: Roles<br/>MSL, Medical Director]
        L4[L4: Personas<br/>User Profiles]
        L5[L5: JTBDs<br/>Jobs-To-Be-Done]
        L6[L6: JTBD-Role Mappings<br/>Task Assignments]
        L7[L7: Agents<br/>AI Agent Mappings]
    end

    L0 --> L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7

    style L7 fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
```

### 7.3 Reciprocal Rank Fusion (RRF)

```mermaid
flowchart LR
    subgraph Sources["Search Results"]
        V[Vector Results<br/>Rank 1,2,3...]
        F[Full-Text Results<br/>Rank 1,2,3...]
        G[Graph Results<br/>Rank 1,2,3...]
    end

    subgraph RRF["RRF Formula"]
        FORM["score(d) = Σ 1/(k + rank(d))"]
        K["k = 60 (constant)"]
    end

    subgraph Weights["Apply Weights"]
        W1["Vector × 0.50"]
        W2["Full-Text × 0.30"]
        W3["Graph × 0.20"]
    end

    subgraph Output["Final Ranking"]
        SORT[Sort by<br/>Combined Score]
        TOP[Return Top-K<br/>Results]
    end

    V --> W1 --> RRF
    F --> W2 --> RRF
    G --> W3 --> RRF
    RRF --> SORT --> TOP

    style RRF fill:#e3f2fd
```

---

## 8. Workflow Integration

### 8.1 LangGraph Workflow Structure

```mermaid
stateDiagram-v2
    [*] --> TenantValidation
    TenantValidation --> CacheCheck
    
    CacheCheck --> CacheHit: Cache Found
    CacheCheck --> AgentSelection: Cache Miss
    
    CacheHit --> Response
    
    AgentSelection --> RAGRetrieval
    RAGRetrieval --> AgentExecution
    
    AgentExecution --> ConfidenceCheck
    
    ConfidenceCheck --> Escalation: Low Confidence
    ConfidenceCheck --> DelegationCheck: High Confidence
    
    Escalation --> AgentExecution: Escalated
    
    DelegationCheck --> Delegation: Complex Task
    DelegationCheck --> ResponseGeneration: Simple Task
    
    Delegation --> SubAgentExecution
    SubAgentExecution --> Aggregation
    Aggregation --> ResponseGeneration
    
    ResponseGeneration --> FeedbackCapture
    FeedbackCapture --> Response
    
    Response --> [*]
```

### 8.2 Golden Rules Compliance

```mermaid
flowchart TB
    subgraph Rule1["Rule #1: LangGraph StateGraph"]
        R1[All workflows use<br/>typed state graphs]
    end

    subgraph Rule2["Rule #2: Caching"]
        R2[Cache at every<br/>stage]
    end

    subgraph Rule3["Rule #3: Tenant Isolation"]
        R3[RLS policies<br/>tenant_id validation]
    end

    subgraph Rule4["Rule #4: RAG/Tools"]
        R4[Mandatory context<br/>retrieval]
    end

    subgraph Rule5["Rule #5: Feedback Learning"]
        R5[Long-term memory<br/>metrics logging]
    end

    WF[Every Workflow] --> Rule1
    WF --> Rule2
    WF --> Rule3
    WF --> Rule4
    WF --> Rule5

    style WF fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
```

### 8.3 Workflow Execution Tracking

```mermaid
erDiagram
    WORKFLOW_INSTANCE ||--o{ WORKFLOW_STEP : contains
    WORKFLOW_INSTANCE ||--o{ AGENT_ASSIGNMENT : has
    WORKFLOW_STEP ||--o{ AGENT_ASSIGNMENT : executes
    
    WORKFLOW_INSTANCE {
        uuid id PK
        uuid tenant_id FK
        string workflow_type
        int workflow_mode
        jsonb input_data
        string status
        timestamp started_at
        timestamp completed_at
    }
    
    WORKFLOW_STEP {
        uuid id PK
        uuid workflow_instance_id FK
        int step_number
        string step_type
        uuid assigned_agent_id FK
        string status
        int duration_seconds
    }
    
    AGENT_ASSIGNMENT {
        uuid id PK
        uuid workflow_instance_id FK
        uuid workflow_step_id FK
        uuid agent_id FK
        string assignment_role
        jsonb agent_response
        float confidence_score
    }
```

---

## 9. End-to-End Scenarios

### 9.1 Scenario: Simple Query (Ask Me)

```mermaid
sequenceDiagram
    participant U as User
    participant AM as Ask Me
    participant SEL as Selector
    participant AG as Agent
    participant RAG as RAG

    Note over U,RAG: "What is a 510(k) submission?"
    
    U->>AM: Simple Query
    AM->>SEL: Tier 1 Selection
    SEL->>SEL: Quick Vector Search
    SEL-->>AM: General Expert
    AM->>AG: Load Agent
    AG->>RAG: Basic Search
    RAG-->>AG: Top 3 Documents
    AG->>AG: Generate Response
    AG-->>AM: Response (90% conf)
    AM-->>U: Answer in < 5 sec
```

### 9.2 Scenario: Expert Consultation (Ask Expert)

```mermaid
sequenceDiagram
    participant U as User
    participant AE as Ask Expert
    participant SEL as Selector
    participant EXP as Regulatory Expert
    participant SPEC as FDA Specialist
    participant RAG as RAG
    participant TOOLS as Tools

    Note over U,TOOLS: "What are the FDA requirements for a Class II medical device 510(k)?"
    
    U->>AE: Domain Query
    AE->>SEL: Tier 2 Selection
    SEL->>SEL: 8-Factor Scoring
    SEL-->>AE: Regulatory Expert (95%)
    
    AE->>EXP: Load + Enrich Agent
    EXP->>RAG: Hybrid Search
    RAG-->>EXP: Regulatory Docs
    
    EXP->>EXP: Assess Complexity
    Note over EXP: Complex - Delegate
    
    EXP->>SPEC: Spawn FDA Specialist
    SPEC->>TOOLS: FDA Database Query
    TOOLS-->>SPEC: 510(k) Requirements
    SPEC-->>EXP: Detailed Requirements
    
    EXP->>EXP: Synthesize Response
    EXP-->>AE: Comprehensive Answer
    AE-->>U: Evidence-Based Response
```

### 9.3 Scenario: Panel Discussion (Ask Panel)

```mermaid
sequenceDiagram
    participant U as User
    participant AP as Ask Panel
    participant SEL as Selector
    participant REG as Regulatory Expert
    participant CLI as Clinical Expert
    participant MA as Market Access Expert
    participant AGG as Aggregator

    Note over U,AGG: "Should we pursue FDA or EMA first for our new oncology drug?"
    
    U->>AP: Strategic Query
    AP->>SEL: Tier 3 Panel Selection
    SEL->>SEL: Diversity Check
    SEL-->>AP: 3 Diverse Experts
    
    par Parallel Execution
        AP->>REG: Regulatory Perspective
        AP->>CLI: Clinical Perspective
        AP->>MA: Market Access Perspective
    end
    
    REG-->>AP: FDA First (regulatory path)
    CLI-->>AP: EMA First (trial design)
    MA-->>AP: FDA First (market size)
    
    AP->>AGG: Aggregate Perspectives
    AGG->>AGG: Identify Consensus
    Note over AGG: 2/3 recommend FDA first
    
    AGG->>AGG: Synthesize with Caveats
    AGG-->>AP: Panel Recommendation
    AP-->>U: Consensus + Dissent
```

### 9.4 Scenario: Complex Workflow with Escalation

```mermaid
sequenceDiagram
    participant U as User
    participant WF as Workflow
    participant M as Master Agent
    participant E as Expert Agent
    participant S as Specialist
    participant HITL as Human Reviewer

    Note over U,HITL: "Create a complete IND submission strategy for our novel CAR-T therapy"
    
    U->>WF: Complex Task
    WF->>M: Route to Master
    
    M->>M: Decompose Task
    Note over M: 5 sub-tasks identified
    
    M->>E: Delegate to Expert
    E->>S: Spawn Specialist
    
    S->>S: Process Sub-task
    Note over S: Patient Safety Concern
    
    S->>E: Escalate (Safety)
    E->>M: Escalate (Cross-Domain)
    M->>HITL: Escalate (Critical)
    
    HITL->>HITL: Review & Approve
    HITL-->>M: Approved with Notes
    
    M->>M: Continue Workflow
    M-->>WF: Final Strategy
    WF-->>U: IND Strategy Document
```

---

## Quick Reference: Key Flows

### Agent Selection Summary

```mermaid
flowchart LR
    Q[Query] --> A[Assess] --> T[Tier] --> S[Search] --> R[Rank] --> G[Gate] --> E[Execute]
    
    style Q fill:#e3f2fd
    style E fill:#c8e6c9
```

### Escalation Summary

```mermaid
flowchart LR
    L5[Tool] -->|Failure| L4[Worker] -->|Limit| L3[Specialist] -->|Scope| L2[Expert] -->|Complex| L1[Master] -->|Critical| H[Human]
    
    style H fill:#ffcdd2
```

### Delegation Summary

```mermaid
flowchart LR
    L1[Master] -->|Route| L2[Expert] -->|Spawn| L3[Specialist] -->|Assign| L4[Worker] -->|Execute| L5[Tool]
    
    style L1 fill:#fff9c4
```

---

*This visual guide complements the Agent 0S Business Guide. For detailed explanations, refer to AGENT_0S_BUSINESS_GUIDE.md*

