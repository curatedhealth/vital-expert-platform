# Ask Panel Type 2: Open Panel - Mermaid Workflow Diagrams

**Panel Type**: Open Panel - Visual Workflow Documentation  
**Version**: 1.0  
**Date**: November 11, 2025  
**Status**: Production Ready  
**Document Type**: Visual Architecture & Flows

---

## 📋 DOCUMENT OVERVIEW

This document provides comprehensive Mermaid diagrams illustrating the complete end-to-end workflow for **Ask Panel Type 2: Open Panel**. Each phase of execution is visualized with detailed state transitions, decision points, and data flows.

**What's Included:**
- ✅ High-level orchestration flow
- ✅ Phase-by-phase detailed diagrams  
- ✅ State machine visualization
- ✅ Data flow diagrams
- ✅ Integration patterns
- ✅ Error handling flows

---

## 🔄 DIAGRAM 1: HIGH-LEVEL ORCHESTRATION FLOW

```mermaid
graph TB
    Start([User Creates Open Panel]) --> Init[Initialize Panel]
    Init --> LoadExperts[Load 5-8 Expert Agents]
    LoadExperts --> LoadContext[Load Context Documents]
    LoadContext --> StartSSE[Initialize SSE Stream]
    
    StartSSE --> Phase1[Phase 1: Opening Round<br/>90 seconds]
    
    Phase1 --> Opening1[Expert 1: Opening Statement]
    Opening1 --> Opening2[Expert 2: Opening Statement]
    Opening2 --> Opening3[Expert 3-8: Sequential Statements]
    Opening3 --> ExtractIdeas1[Extract Idea Units]
    
    ExtractIdeas1 --> Phase2[Phase 2: Free Dialogue<br/>3 minutes]
    
    Phase2 --> SelectSpeaker{Select Next<br/>Speaker}
    SelectSpeaker --> DetermineTurn[Determine Turn Type:<br/>Building/New/Connecting]
    DetermineTurn --> GenerateResponse[Generate Expert Response]
    GenerateResponse --> ExtractIdeas2[Extract Idea Units]
    ExtractIdeas2 --> CheckContinue{Continue<br/>Dialogue?}
    
    CheckContinue -->|Yes| SelectSpeaker
    CheckContinue -->|No| Phase3[Phase 3: Theme Clustering<br/>1.5 minutes]
    
    Phase3 --> ClusterIdeas[Cluster Ideas by Similarity]
    ClusterIdeas --> IdentifyThemes[Identify 4-6 Major Themes]
    IdentifyThemes --> FindConvergence[Find Convergence Points]
    FindConvergence --> FindDivergence[Find Divergence Points]
    
    FindDivergence --> Phase4[Phase 4: Final Perspectives<br/>2 minutes]
    
    Phase4 --> Final1[Expert 1: Final Perspective]
    Final1 --> Final2[Expert 2-8: Final Perspectives]
    
    Final2 --> Phase5[Phase 5: Synthesis<br/>1 minute]
    
    Phase5 --> Synthesize[AI Moderator Synthesizes]
    Synthesize --> CalcConsensus[Calculate Consensus Level]
    CalcConsensus --> CreateMap[Create Innovation Map]
    
    CreateMap --> GenDocs[Generate Deliverables]
    GenDocs --> SaveDB[(Save to Database)]
    SaveDB --> Complete([Panel Complete])
    
    style Start fill:#e1f5e1
    style Complete fill:#e1f5e1
    style Phase1 fill:#fff4e6
    style Phase2 fill:#e3f2fd
    style Phase3 fill:#f3e5f5
    style Phase4 fill:#fff9c4
    style Phase5 fill:#ffebee
```

---

## 🚀 DIAGRAM 2: PHASE 0 - INITIALIZATION

```mermaid
graph TB
    subgraph "Phase 0: Panel Initialization"
        Start([API Request:<br/>POST /api/v1/panels]) --> ValidateTenant{Valid<br/>X-Tenant-ID?}
        
        ValidateTenant -->|No| Error1[403 Forbidden:<br/>Invalid Tenant]
        ValidateTenant -->|Yes| ValidateAuth{Valid<br/>Auth Token?}
        
        ValidateAuth -->|No| Error2[401 Unauthorized]
        ValidateAuth -->|Yes| ValidateRequest{Valid<br/>Request Body?}
        
        ValidateRequest -->|No| Error3[400 Bad Request:<br/>Invalid Query/Agents]
        ValidateRequest -->|Yes| CreatePanelDB[(Create Panel Record<br/>in Supabase)]
        
        CreatePanelDB --> SetTenantCtx[Set Tenant Context<br/>in ContextVar]
        SetTenantCtx --> LoadAgents[Load Agent Catalog<br/>Filter by Tenant]
        
        LoadAgents --> SelectExperts{Agents<br/>Specified?}
        SelectExperts -->|Yes| ValidateAgents[Validate Agent IDs<br/>Exist for Tenant]
        SelectExperts -->|No| AutoSelect[Auto-Select 6-8 Experts<br/>Based on Query]
        
        ValidateAgents --> LoadAgentModels[Load Agent Configurations<br/>Prompts, Tools, Memory]
        AutoSelect --> LoadAgentModels
        
        LoadAgentModels --> LoadContextDocs{Context<br/>Documents?}
        LoadContextDocs -->|Yes| FetchDocs[Fetch from Supabase<br/>Filter by Tenant]
        LoadContextDocs -->|No| InitSSE[Initialize SSE Stream]
        
        FetchDocs --> EmbedDocs[Create Vector Embeddings<br/>Store in pgvector]
        EmbedDocs --> InitSSE
        
        InitSSE --> CreateSSEConn[Create Server-Sent Events<br/>Connection]
        CreateSSEConn --> InitRedis[Initialize Redis Session<br/>Store Panel State]
        
        InitRedis --> StreamInit[Stream Event:<br/>panel_initialized]
        StreamInit --> Ready([Panel Ready<br/>for Execution])
    end
    
    style Start fill:#e1f5e1
    style Ready fill:#e1f5e1
    style Error1 fill:#ffebee
    style Error2 fill:#ffebee
    style Error3 fill:#ffebee
```

---

## 🎤 DIAGRAM 3: PHASE 1 - OPENING ROUND

```mermaid
sequenceDiagram
    participant User
    participant API
    participant Orchestrator
    participant Expert1 as Dr. Sarah Chen
    participant Expert2 as Alex Rivera
    participant ExpertN as Experts 3-8
    participant IdeaExtractor
    participant StreamSSE
    
    User->>API: POST /panels/{id}/stream
    API->>Orchestrator: Start Opening Round
    
    Note over Orchestrator: Phase 1: Opening Statements<br/>Sequential, No Context Passing
    
    Orchestrator->>Expert1: Generate opening statement<br/>Query: "Innovation for teen mental health"<br/>Mode: opening_statement<br/>Max: 150 tokens
    
    activate Expert1
    Expert1-->>Expert1: Analyze query<br/>Apply clinical psychology expertise<br/>Generate perspective
    Expert1-->>Orchestrator: "The key challenge is bridging<br/>efficacy gap between face-to-face<br/>and digital interventions..."
    deactivate Expert1
    
    Orchestrator->>IdeaExtractor: Extract idea units from statement
    activate IdeaExtractor
    IdeaExtractor-->>Orchestrator: Ideas: ["therapeutic alliance",<br/>"hybrid model", "always-on support"]
    deactivate IdeaExtractor
    
    Orchestrator->>StreamSSE: Event: expert_speaking
    StreamSSE->>User: Stream expert content in real-time
    
    Note over Orchestrator: Brief 0.5s pause between speakers
    
    Orchestrator->>Expert2: Generate opening statement<br/>Query + No prior context<br/>Mode: opening_statement
    
    activate Expert2
    Expert2-->>Expert2: Analyze from AI/ML perspective<br/>Consider technical possibilities
    Expert2-->>Orchestrator: "We have technology for genuinely<br/>responsive AI that adapts<br/>conversation style..."
    deactivate Expert2
    
    Orchestrator->>IdeaExtractor: Extract idea units
    IdeaExtractor-->>Orchestrator: Ideas: ["AI companion",<br/>"peer-like design", "emotion detection"]
    
    Orchestrator->>StreamSSE: Event: expert_speaking
    StreamSSE->>User: Stream expert content
    
    loop For Experts 3-8
        Orchestrator->>ExpertN: Generate opening statement
        ExpertN-->>Orchestrator: Statement with perspective
        Orchestrator->>IdeaExtractor: Extract ideas
        IdeaExtractor-->>Orchestrator: Idea units
        Orchestrator->>StreamSSE: Event: expert_speaking
        StreamSSE->>User: Stream content
    end
    
    Note over Orchestrator: All 8 opening statements complete<br/>~90 seconds elapsed<br/>25-35 initial ideas generated
    
    Orchestrator->>StreamSSE: Event: phase_complete
    StreamSSE->>User: Opening round done,<br/>starting free dialogue
```

---

## 💬 DIAGRAM 4: PHASE 2 - FREE DIALOGUE FLOW

```mermaid
graph TB
    subgraph "Phase 2: Free Dialogue (3 minutes)"
        Start([Begin Free Dialogue]) --> InitContext[Initialize Conversation Context:<br/>Topics, Speak Counts, Building Patterns]
        
        InitContext --> TurnLoop{Turn Number<br/>< Max Turns?}
        
        TurnLoop -->|No| EndDialogue[End Dialogue Phase]
        TurnLoop -->|Yes| SelectSpeaker[Select Next Speaker Algorithm]
        
        SelectSpeaker --> CalcFairness[Calculate Fairness Score:<br/>Inverse of Speak Count]
        CalcFairness --> CalcRelevance[Calculate Relevance Score:<br/>Expertise Match to Topics]
        CalcRelevance --> CalcRandom[Add Random Element:<br/>20% Weight]
        
        CalcRandom --> ChooseSpeaker[Select Highest Scored<br/>Expert]
        
        ChooseSpeaker --> DetermineTurnType{What Turn<br/>Type?}
        
        DetermineTurnType -->|Building| BuildingTurn[Building on Previous Idea:<br/>Reference specific statement]
        DetermineTurnType -->|New| NewTurn[Introducing New Perspective:<br/>Fresh angle on query]
        DetermineTurnType -->|Connecting| ConnectingTurn[Connecting Multiple Ideas:<br/>Synthesis across statements]
        
        BuildingTurn --> BuildContext[Build Dialogue Context:<br/>Include Recent 3-5 Turns]
        NewTurn --> BuildContext
        ConnectingTurn --> BuildContext
        
        BuildContext --> GenerateResp[Generate Expert Response:<br/>LLM with Full Context]
        
        GenerateResp --> ExtractIdeas[Extract Idea Units:<br/>NLP Analysis]
        ExtractIdeas --> FindConnections[Identify Connections:<br/>Links to Previous Ideas]
        
        FindConnections --> UpdateContext[Update Conversation Context:<br/>Topics, Counts, Connections]
        
        UpdateContext --> StreamEvent[Stream SSE Event:<br/>expert_speaking]
        
        StreamEvent --> CheckStop{Should<br/>Continue?}
        
        CheckStop -->|Turn < 8| TurnLoop
        CheckStop -->|Turn >= 8| AssessContinue[Assess Dialogue Quality:<br/>New Ideas? Theme Saturation?]
        
        AssessContinue -->|Continue| TurnLoop
        AssessContinue -->|Natural Stop| EndDialogue
        
        EndDialogue --> Summary[Dialogue Summary:<br/>15-20 turns<br/>40-50 total ideas<br/>High cross-pollination]
        
        Summary --> NextPhase([Proceed to<br/>Theme Clustering])
    end
    
    style Start fill:#e3f2fd
    style NextPhase fill:#f3e5f5
```

---

## 🧩 DIAGRAM 5: PHASE 3 - THEME CLUSTERING

```mermaid
graph TB
    subgraph "Phase 3: Theme Identification & Clustering"
        Start([All Dialogue Complete]) --> CollectIdeas[Collect All Idea Units:<br/>Opening + Dialogue + Connections]
        
        CollectIdeas --> EmbedIdeas[Generate Embeddings:<br/>Semantic Vector Representation]
        
        EmbedIdeas --> ClusterAlgo{Clustering<br/>Algorithm}
        
        ClusterAlgo -->|DBSCAN| DBSCAN[Density-Based Clustering:<br/>Identify Dense Regions]
        ClusterAlgo -->|K-Means| KMeans[K-Means Clustering:<br/>Target 5-7 Clusters]
        ClusterAlgo -->|Hierarchical| Hierarchical[Hierarchical Clustering:<br/>Build Dendrogram]
        
        DBSCAN --> ValidateClusters{Valid<br/>Clusters?}
        KMeans --> ValidateClusters
        Hierarchical --> ValidateClusters
        
        ValidateClusters -->|No| AdjustParams[Adjust Parameters:<br/>Min Size, Distance Threshold]
        AdjustParams --> ClusterAlgo
        
        ValidateClusters -->|Yes| NameClusters[Generate Theme Names:<br/>LLM Summarization]
        
        NameClusters --> AnalyzeCluster1[Cluster 1: Core Product Architecture]
        NameClusters --> AnalyzeCluster2[Cluster 2: Safety & Clinical Integrity]
        NameClusters --> AnalyzeCluster3[Cluster 3: Go-to-Market Strategy]
        NameClusters --> AnalyzeCluster4[Cluster 4: Community & Peer Support]
        NameClusters --> AnalyzeCluster5[Cluster 5: Business Model Evolution]
        
        AnalyzeCluster1 --> CalcConfidence1[Calculate Confidence:<br/>Embedding Similarity]
        AnalyzeCluster2 --> CalcConfidence2[Calculate Confidence]
        AnalyzeCluster3 --> CalcConfidence3[Calculate Confidence]
        AnalyzeCluster4 --> CalcConfidence4[Calculate Confidence]
        AnalyzeCluster5 --> CalcConfidence5[Calculate Confidence]
        
        CalcConfidence1 --> IdentifyContrib1[Identify Contributors:<br/>Which Experts]
        CalcConfidence2 --> IdentifyContrib2[Identify Contributors]
        CalcConfidence3 --> IdentifyContrib3[Identify Contributors]
        CalcConfidence4 --> IdentifyContrib4[Identify Contributors]
        CalcConfidence5 --> IdentifyContrib5[Identify Contributors]
        
        IdentifyContrib1 --> FindConvergence[Find Convergence Points:<br/>High Expert Agreement]
        IdentifyContrib2 --> FindConvergence
        IdentifyContrib3 --> FindConvergence
        IdentifyContrib4 --> FindConvergence
        IdentifyContrib5 --> FindConvergence
        
        FindConvergence --> Conv1[Convergence 1:<br/>Ambient Therapy Model<br/>87% Agreement]
        FindConvergence --> Conv2[Convergence 2:<br/>Predictive Safety<br/>91% Agreement]
        FindConvergence --> Conv3[Convergence 3:<br/>School Distribution<br/>83% Agreement]
        
        Conv1 --> FindDivergence[Find Divergence Points:<br/>Creative Tension]
        Conv2 --> FindDivergence
        Conv3 --> FindDivergence
        
        FindDivergence --> Div1[Divergence 1:<br/>Clinical vs Wellness Positioning]
        FindDivergence --> Div2[Divergence 2:<br/>Community Feature Priority]
        
        Div1 --> StreamThemes[Stream Event: theme_analysis]
        Div2 --> StreamThemes
        
        StreamThemes --> Complete([Clustering Complete:<br/>5 Major Themes<br/>3 Convergence Areas<br/>2 Divergence Points])
    end
    
    style Start fill:#f3e5f5
    style Complete fill:#fff9c4
```

---

## 🎯 DIAGRAM 6: PHASE 4 & 5 - SYNTHESIS

```mermaid
graph TB
    subgraph "Phase 4: Final Perspectives"
        P4Start([Begin Final Round]) --> P4Loop[Sequential Final Statements]
        
        P4Loop --> Expert1Final[Expert 1: 30-second<br/>Final Perspective]
        Expert1Final --> Expert2Final[Expert 2-8:<br/>Quick Final Input]
        
        Expert2Final --> StreamFinal[Stream All Final<br/>Perspectives to User]
        
        StreamFinal --> P4Complete([Final Perspectives<br/>Complete])
    end
    
    subgraph "Phase 5: Synthesis & Deliverables"
        P5Start([Begin Synthesis]) --> GatherAll[Gather All Data:<br/>Opening, Dialogue, Final,<br/>Clusters, Convergence]
        
        GatherAll --> SynthPrompt[Build Synthesis Prompt:<br/>Comprehensive Context]
        
        SynthPrompt --> LLMSynth[LLM Generate Synthesis:<br/>GPT-4 with Extended Context]
        
        LLMSynth --> SynthOutput[Synthesis Output:<br/>Core Concept<br/>Key Innovations<br/>Business Model<br/>Technical Architecture<br/>Success Metrics<br/>Risks & Mitigation]
        
        SynthOutput --> CalcConsensus[Calculate Consensus Level:<br/>Convergence vs Divergence<br/>Expert Alignment Scores]
        
        CalcConsensus --> ConsensusScore[Consensus: 84%<br/>Strong Alignment]
        
        ConsensusScore --> CreateMap[Create Innovation Map:<br/>Visual Node-Link Diagram]
        
        CreateMap --> GenExecSummary[Generate Executive Summary<br/>250 words, C-suite ready]
        CreateMap --> GenFullReport[Generate Full Report<br/>12 pages, detailed spec]
        CreateMap --> GenInnoMap[Export Innovation Map<br/>JSON + Visual PNG]
        CreateMap --> GenClustersDoc[Generate Clusters Doc<br/>Breakdown of each theme]
        CreateMap --> GenContribLog[Generate Contributions Log<br/>Attribution tracking]
        
        GenExecSummary --> PackageFiles[Package All Deliverables<br/>ZIP Archive]
        GenFullReport --> PackageFiles
        GenInnoMap --> PackageFiles
        GenClustersDoc --> PackageFiles
        GenContribLog --> PackageFiles
        
        PackageFiles --> SaveDB[(Save to Supabase:<br/>Panel Results<br/>Deliverables<br/>Metadata)]
        
        SaveDB --> UpdateRedis[(Update Redis Cache:<br/>Panel Status: Complete<br/>Consensus Level<br/>Deliverable URLs)]
        
        UpdateRedis --> StreamComplete[Stream Event:<br/>panel_complete]
        
        StreamComplete --> CloseSSE[Close SSE Connection]
        
        CloseSSE --> P5Complete([Panel Complete:<br/>All Deliverables Ready])
    end
    
    P4Complete --> P5Start
    
    style P4Start fill:#fff9c4
    style P4Complete fill:#ffebee
    style P5Start fill:#ffebee
    style P5Complete fill:#e1f5e1
```

---

## 🔄 DIAGRAM 7: LANGGRAPH STATE MACHINE

```mermaid
stateDiagram-v2
    [*] --> Initialize: API Request
    
    Initialize --> OpeningRound: Panel Created
    
    state OpeningRound {
        [*] --> Expert1
        Expert1 --> Expert2
        Expert2 --> Expert3
        Expert3 --> Expert4
        Expert4 --> Expert5
        Expert5 --> Expert6
        Expert6 --> Expert7
        Expert7 --> Expert8
        Expert8 --> ExtractIdeas1
        ExtractIdeas1 --> [*]
    }
    
    OpeningRound --> FreeDialogue: Opening Complete
    
    state FreeDialogue {
        [*] --> SelectSpeaker
        SelectSpeaker --> DetermineTurnType
        DetermineTurnType --> GenerateResponse
        GenerateResponse --> ExtractIdeas2
        ExtractIdeas2 --> FindConnections
        FindConnections --> UpdateContext
        UpdateContext --> CheckContinue
        CheckContinue --> SelectSpeaker: Turn < Max
        CheckContinue --> [*]: Natural Stop
    }
    
    FreeDialogue --> ThemeClustering: Dialogue Complete
    
    state ThemeClustering {
        [*] --> CollectIdeas
        CollectIdeas --> EmbedIdeas
        EmbedIdeas --> ClusterAlgorithm
        ClusterAlgorithm --> NameClusters
        NameClusters --> FindConvergence
        FindConvergence --> FindDivergence
        FindDivergence --> [*]
    }
    
    ThemeClustering --> FinalPerspectives: Themes Identified
    
    state FinalPerspectives {
        [*] --> FinalExpert1
        FinalExpert1 --> FinalExpert2
        FinalExpert2 --> FinalExpertN
        FinalExpertN --> [*]
    }
    
    FinalPerspectives --> Synthesis: Final Input Complete
    
    state Synthesis {
        [*] --> GatherAllData
        GatherAllData --> GenerateSynthesis
        GenerateSynthesis --> CalculateConsensus
        CalculateConsensus --> CreateInnovationMap
        CreateInnovationMap --> [*]
    }
    
    Synthesis --> GenerateDeliverables: Synthesis Complete
    
    state GenerateDeliverables {
        [*] --> ExecSummary
        [*] --> FullReport
        [*] --> InnovationMap
        [*] --> ClustersDoc
        [*] --> ContribLog
        ExecSummary --> PackageFiles
        FullReport --> PackageFiles
        InnovationMap --> PackageFiles
        ClustersDoc --> PackageFiles
        ContribLog --> PackageFiles
        PackageFiles --> SaveToDatabase
        SaveToDatabase --> [*]
    }
    
    GenerateDeliverables --> [*]: Panel Complete
    
    note right of Initialize
        Tenant Context Set
        Agents Loaded
        SSE Initialized
    end note
    
    note right of FreeDialogue
        15-20 dynamic turns
        Idea cross-pollination
        Real-time streaming
    end note
    
    note right of ThemeClustering
        Semantic clustering
        Pattern identification
        Convergence analysis
    end note
    
    note right of Synthesis
        LLM-powered synthesis
        Consensus calculation
        Visual mapping
    end note
```

---

## 📡 DIAGRAM 8: STREAMING ARCHITECTURE (SSE)

```mermaid
sequenceDiagram
    participant Client as User Browser
    participant API as FastAPI Server
    participant Orchestrator
    participant Redis
    participant LLM as OpenAI/Anthropic
    
    Client->>API: POST /panels/{id}/stream<br/>Headers: Authorization, X-Tenant-ID
    
    API->>API: Validate Tenant & Auth
    API->>Redis: Check Panel Status
    Redis-->>API: Panel: ready_for_stream
    
    API->>Client: 200 OK<br/>Content-Type: text/event-stream<br/>Connection: keep-alive
    
    Note over API,Client: SSE Connection Established
    
    API->>Orchestrator: Start Panel Execution<br/>panel_id, tenant_id
    
    Orchestrator->>Redis: Update Status: executing
    Orchestrator->>API: Event: panel_initialized
    API->>Client: event: panel_initialized<br/>data: {panel_id, experts, duration}
    
    loop Opening Round (8 experts)
        Orchestrator->>LLM: Generate opening statement
        LLM-->>Orchestrator: Expert statement (150 tokens)
        Orchestrator->>Redis: Cache statement
        Orchestrator->>API: Event: expert_speaking
        API->>Client: event: expert_speaking<br/>data: {agent_name, content, phase: "opening"}
        Note over Client: User sees expert appear<br/>in real-time
    end
    
    Orchestrator->>API: Event: phase_complete
    API->>Client: event: phase_complete<br/>data: {phase: "opening", next: "dialogue"}
    
    loop Free Dialogue (15-20 turns)
        Orchestrator->>LLM: Generate dialogue response
        LLM-->>Orchestrator: Expert response (200 tokens)
        Orchestrator->>Redis: Cache response + ideas
        Orchestrator->>API: Event: expert_speaking
        API->>Client: event: expert_speaking<br/>data: {agent_name, content, turn_type, building_on}
        Note over Client: User sees conversation<br/>build naturally
    end
    
    Orchestrator->>API: Event: phase_complete
    API->>Client: event: phase_complete<br/>data: {phase: "dialogue", turns: 18}
    
    Orchestrator->>Orchestrator: Cluster ideas<br/>(Internal processing)
    Orchestrator->>API: Event: theme_analysis
    API->>Client: event: theme_analysis<br/>data: {clusters, convergence, divergence}
    Note over Client: User sees themes<br/>emerging from discussion
    
    loop Final Perspectives (8 experts)
        Orchestrator->>LLM: Generate final perspective
        LLM-->>Orchestrator: Final statement (100 tokens)
        Orchestrator->>API: Event: expert_speaking
        API->>Client: event: expert_speaking<br/>data: {agent_name, content, phase: "final"}
    end
    
    Orchestrator->>LLM: Generate comprehensive synthesis
    LLM-->>Orchestrator: Full synthesis (2000+ tokens)
    Orchestrator->>API: Event: synthesis_complete
    API->>Client: event: synthesis_complete<br/>data: {synthesis, consensus_level}
    
    Orchestrator->>Orchestrator: Generate deliverables<br/>(Documents, maps, reports)
    Orchestrator->>Redis: Update Status: complete
    Orchestrator->>API: Event: panel_complete
    API->>Client: event: panel_complete<br/>data: {duration, deliverables, download_urls}
    
    API->>Client: Close SSE connection
    
    Note over Client: Panel complete<br/>Download deliverables
```

---

## 🔐 DIAGRAM 9: MULTI-TENANT SECURITY FLOW

```mermaid
graph TB
    subgraph "Multi-Tenant Security Validation"
        Request([API Request]) --> Layer1{Layer 1:<br/>API Gateway}
        
        Layer1 -->|Missing Header| Reject1[403: X-Tenant-ID Required]
        Layer1 -->|Present| Layer2{Layer 2:<br/>Application Layer}
        
        Layer2 --> ValidateTenant[(Query Supabase:<br/>SELECT * FROM tenants<br/>WHERE id = tenant_id<br/>AND status = 'active')]
        
        ValidateTenant -->|Not Found| Reject2[403: Invalid Tenant]
        ValidateTenant -->|Inactive| Reject3[403: Tenant Inactive]
        ValidateTenant -->|Valid| SetContext[Set Tenant Context:<br/>ContextVar tenant_id]
        
        SetContext --> Layer3{Layer 3:<br/>Domain Layer}
        
        Layer3 --> CheckOwnership[Verify Resource Ownership:<br/>panel.tenant_id == context.tenant_id]
        
        CheckOwnership -->|Mismatch| Reject4[403: Cross-Tenant Access Denied]
        CheckOwnership -->|Match| Layer4{Layer 4:<br/>Database Layer}
        
        Layer4 --> RLS[Row-Level Security:<br/>Automatic Tenant Filtering]
        
        RLS --> PolicyCheck[Check RLS Policy:<br/>CREATE POLICY tenant_isolation<br/>USING tenant_id = current_user_tenant()]
        
        PolicyCheck -->|Fail| Reject5[403: RLS Policy Violation]
        PolicyCheck -->|Pass| AllowAccess[✓ Access Granted]
        
        AllowAccess --> AuditLog[(Audit Log:<br/>INSERT INTO audit_logs<br/>tenant_id, action, timestamp)]
        
        AuditLog --> ProcessRequest[Process Request<br/>with Tenant Context]
        
        ProcessRequest --> Success([✓ Successful Response<br/>Tenant Data Only])
    end
    
    style Request fill:#e1f5e1
    style Success fill:#e1f5e1
    style Reject1 fill:#ffebee
    style Reject2 fill:#ffebee
    style Reject3 fill:#ffebee
    style Reject4 fill:#ffebee
    style Reject5 fill:#ffebee
```

---

## ⚠️ DIAGRAM 10: ERROR HANDLING & RECOVERY

```mermaid
graph TB
    subgraph "Error Handling Flows"
        Execute([Panel Execution]) --> TryExec{Try<br/>Execute}
        
        TryExec -->|Success| Continue[Continue Execution]
        TryExec -->|Error| ErrorType{Error<br/>Type?}
        
        ErrorType -->|Timeout| TimeoutHandler[Timeout Handler]
        ErrorType -->|LLM Failure| LLMHandler[LLM Failure Handler]
        ErrorType -->|Database Error| DBHandler[Database Error Handler]
        ErrorType -->|Network Error| NetworkHandler[Network Error Handler]
        ErrorType -->|Validation Error| ValidationHandler[Validation Error Handler]
        
        TimeoutHandler --> CheckRetries{Retries<br/>< Max?}
        CheckRetries -->|Yes| RetryExec[Retry with<br/>Exponential Backoff]
        CheckRetries -->|No| FailPanel[Mark Panel as Failed]
        
        RetryExec --> TryExec
        
        LLMHandler --> CheckLLMRetries{LLM Retries<br/>< 3?}
        CheckLLMRetries -->|Yes| SwitchProvider[Try Alternative Provider:<br/>OpenAI ↔ Anthropic]
        CheckLLMRetries -->|No| FailPanel
        
        SwitchProvider --> TryExec
        
        DBHandler --> CheckDBHealth{Database<br/>Healthy?}
        CheckDBHealth -->|No| WaitAndRetry[Wait 5s, Retry]
        CheckDBHealth -->|Yes| CheckQuery[Review Query]
        
        WaitAndRetry --> TryExec
        CheckQuery --> FailPanel
        
        NetworkHandler --> RetryNetwork[Retry with<br/>Circuit Breaker]
        RetryNetwork --> TryExec
        
        ValidationHandler --> LogError[Log Validation Error]
        LogError --> ReturnBadRequest[Return 400<br/>Bad Request]
        
        FailPanel --> SaveError[(Save Error to DB:<br/>panel_errors table)]
        SaveError --> NotifyUser[Stream Error Event:<br/>panel_failed]
        NotifyUser --> CleanupResources[Cleanup Resources:<br/>Close connections<br/>Clear cache]
        
        CleanupResources --> ErrorComplete([Error Handled:<br/>User Notified])
        
        Continue --> Success([✓ Execution<br/>Successful])
    end
    
    style Execute fill:#e3f2fd
    style Success fill:#e1f5e1
    style ErrorComplete fill:#fff9c4
    style FailPanel fill:#ffebee
```

---

## 🔗 DIAGRAM 11: INTEGRATION WITH OTHER SERVICES

```mermaid
graph TB
    subgraph "Ask Panel Type 2 Integration Ecosystem"
        OpenPanel[Open Panel Service] --> SharedKernel[Shared Kernel Package]
        
        SharedKernel --> AgentRegistry[Agent Registry:<br/>136+ Healthcare Experts]
        SharedKernel --> RAGEngine[RAG Engine:<br/>Context Retrieval]
        SharedKernel --> PromptLibrary[Prompt Library:<br/>Templates & Patterns]
        SharedKernel --> ToolsRegistry[Tools Registry:<br/>FDA Search, PubMed, etc]
        
        OpenPanel --> AskExpert[Ask Expert Service:<br/>$2K Tier]
        OpenPanel --> JTBD[JTBD Workflow Service:<br/>$15K Tier]
        OpenPanel --> SolutionBuilder[Solution Builder Service:<br/>$50K+ Tier]
        
        AskExpert -->|Escalate Complex Query| OpenPanel
        OpenPanel -->|Execute Recommendation| JTBD
        OpenPanel -->|Build Solution| SolutionBuilder
        
        OpenPanel --> Supabase[(Supabase Database:<br/>PostgreSQL + pgvector)]
        OpenPanel --> Redis[(Redis Cache:<br/>Session State)]
        OpenPanel --> Modal[Modal.com:<br/>Serverless Deployment]
        
        Supabase -->|Store| PanelResults[Panel Results]
        Supabase -->|Store| Deliverables[Deliverables]
        Supabase -->|Store| AuditLogs[Audit Logs]
        
        Redis -->|Cache| AgentConfigs[Agent Configs]
        Redis -->|Cache| SessionState[Session State]
        Redis -->|Cache| ConsensusData[Consensus Data]
        
        Modal -->|Deploy| FastAPIApp[FastAPI Application]
        Modal -->|Scale| GPUResources[GPU Resources for LLMs]
        
        OpenPanel --> ExternalAPIs[External APIs]
        
        ExternalAPIs --> OpenAI[OpenAI GPT-4]
        ExternalAPIs --> Anthropic[Anthropic Claude]
        ExternalAPIs --> PubMed[PubMed Search]
        ExternalAPIs --> FDA[FDA MAUDE Database]
        
        OpenPanel --> FrontendApp[Next.js Frontend:<br/>Tenant-Specific UI]
        
        FrontendApp --> TenantA[Tenant A Interface]
        FrontendApp --> TenantB[Tenant B Interface]
        FrontendApp --> TenantC[Tenant C Interface]
    end
    
    style OpenPanel fill:#e3f2fd
    style SharedKernel fill:#fff4e6
```

---

## 📊 DIAGRAM 12: DATA FLOW ARCHITECTURE

```mermaid
flowchart LR
    subgraph Input
        UserQuery[User Query]
        ContextDocs[Context Documents]
        AgentSelection[Selected Agents]
        TenantConfig[Tenant Configuration]
    end
    
    subgraph Processing
        direction TB
        
        Init[Initialize Panel] --> LoadAgents[Load Agent Models]
        LoadAgents --> LoadContext[Load Context Embeddings]
        LoadContext --> OpeningRound[Opening Round:<br/>Sequential Statements]
        
        OpeningRound --> ExtractIdeas1[Extract Ideas:<br/>NLP Pipeline]
        ExtractIdeas1 --> FreeDialogue[Free Dialogue:<br/>Dynamic Turns]
        
        FreeDialogue --> ExtractIdeas2[Extract Ideas:<br/>Continuous Extraction]
        ExtractIdeas2 --> BuildContext[Build Conversation<br/>Context]
        
        BuildContext --> FreeDialogue
        
        FreeDialogue --> ClusterEngine[Clustering Engine:<br/>Semantic Similarity]
        ClusterEngine --> ThemeGen[Theme Generation:<br/>LLM Summarization]
        
        ThemeGen --> FinalRound[Final Perspectives:<br/>Quick Input]
        FinalRound --> Synthesizer[Synthesis Engine:<br/>Comprehensive LLM]
        
        Synthesizer --> ConsensusCalc[Consensus Calculator:<br/>Agreement Analysis]
        ConsensusCalc --> MapCreator[Innovation Map Creator:<br/>Visual Generation]
    end
    
    subgraph Output
        ExecSummary[Executive Summary<br/>250 words]
        FullReport[Full Report<br/>12 pages]
        InnoMap[Innovation Map<br/>Visual JSON]
        ClusterDoc[Clusters Document<br/>Theme Breakdown]
        ContribLog[Contributions Log<br/>Attribution Tracking]
    end
    
    subgraph Storage
        SupabaseDB[(Supabase:<br/>Panel Results)]
        RedisCache[(Redis:<br/>Session State)]
        S3Storage[(S3/CDN:<br/>Deliverables)]
    end
    
    UserQuery --> Init
    ContextDocs --> LoadContext
    AgentSelection --> LoadAgents
    TenantConfig --> Init
    
    MapCreator --> ExecSummary
    MapCreator --> FullReport
    MapCreator --> InnoMap
    MapCreator --> ClusterDoc
    MapCreator --> ContribLog
    
    ExecSummary --> SupabaseDB
    FullReport --> S3Storage
    InnoMap --> S3Storage
    ClusterDoc --> S3Storage
    ContribLog --> SupabaseDB
    
    BuildContext --> RedisCache
    ThemeGen --> RedisCache
    ConsensusCalc --> SupabaseDB
```

---

## 📈 DIAGRAM 13: CONSENSUS CALCULATION FLOW

```mermaid
graph TB
    subgraph "Consensus Calculation Algorithm"
        Start([All Clusters Identified]) --> CollectStatements[Collect All Expert Statements:<br/>Opening + Dialogue + Final]
        
        CollectStatements --> AnalyzeCluster1[Analyze Cluster 1:<br/>Core Product Architecture]
        CollectStatements --> AnalyzeCluster2[Analyze Cluster 2:<br/>Safety Model]
        CollectStatements --> AnalyzeCluster3[Analyze Cluster 3:<br/>Distribution Strategy]
        CollectStatements --> AnalyzeCluster4[Analyze Cluster 4:<br/>Community Features]
        CollectStatements --> AnalyzeCluster5[Analyze Cluster 5:<br/>Business Model]
        
        AnalyzeCluster1 --> MapExperts1[Map Experts to Cluster:<br/>Who contributed?]
        AnalyzeCluster2 --> MapExperts2[Map Experts]
        AnalyzeCluster3 --> MapExperts3[Map Experts]
        AnalyzeCluster4 --> MapExperts4[Map Experts]
        AnalyzeCluster5 --> MapExperts5[Map Experts]
        
        MapExperts1 --> CalcAgreement1[Calculate Agreement:<br/>Semantic Similarity<br/>of Statements]
        MapExperts2 --> CalcAgreement2[Calculate Agreement]
        MapExperts3 --> CalcAgreement3[Calculate Agreement]
        MapExperts4 --> CalcAgreement4[Calculate Agreement]
        MapExperts5 --> CalcAgreement5[Calculate Agreement]
        
        CalcAgreement1 --> Score1[Cluster 1 Score:<br/>87% consensus]
        CalcAgreement2 --> Score2[Cluster 2 Score:<br/>91% consensus]
        CalcAgreement3 --> Score3[Cluster 3 Score:<br/>83% consensus]
        CalcAgreement4 --> Score4[Cluster 4 Score:<br/>76% consensus]
        CalcAgreement5 --> Score5[Cluster 5 Score:<br/>88% consensus]
        
        Score1 --> WeightByImportance[Weight by Importance:<br/>Critical themes weighted higher]
        Score2 --> WeightByImportance
        Score3 --> WeightByImportance
        Score4 --> WeightByImportance
        Score5 --> WeightByImportance
        
        WeightByImportance --> CalculateOverall[Calculate Overall Consensus:<br/>Weighted Average]
        
        CalculateOverall --> IdentifyOutliers[Identify Dissenting Opinions:<br/>Statements < 70% agreement]
        
        IdentifyOutliers --> PreserveMinority[Preserve Minority Perspectives:<br/>Flag for separate documentation]
        
        PreserveMinority --> FinalConsensus[Final Consensus Level:<br/>84% Strong Alignment]
        
        FinalConsensus --> GenerateReport[Generate Consensus Report:<br/>- Overall level<br/>- Cluster-by-cluster<br/>- Dissenting opinions<br/>- Expert alignments]
        
        GenerateReport --> Complete([Consensus Calculated])
    end
    
    style Start fill:#f3e5f5
    style Complete fill:#e1f5e1
```

---

## 🎯 DIAGRAM 14: REAL-TIME PROGRESS TRACKING

```mermaid
gantt
    title Open Panel Execution Timeline (8 minutes)
    dateFormat  mm:ss
    axisFormat  %M:%S
    
    section Phase 0
    Initialize Panel           :init, 00:00, 02:00
    Load Agents & Context      :load, after init, 01:30
    
    section Phase 1
    Expert 1 Opening           :e1, 02:00, 00:12
    Expert 2 Opening           :e2, after e1, 00:12
    Expert 3-8 Opening         :e38, after e2, 00:66
    Extract Ideas              :ideas1, after e38, 00:10
    
    section Phase 2
    Free Dialogue Turn 1-5     :d1, 03:00, 00:45
    Free Dialogue Turn 6-10    :d2, after d1, 00:45
    Free Dialogue Turn 11-18   :d3, after d2, 00:90
    
    section Phase 3
    Cluster Ideas              :cluster, 06:00, 00:30
    Identify Themes            :themes, after cluster, 00:30
    Find Convergence/Divergence:conv, after themes, 00:30
    
    section Phase 4
    Final Perspectives         :final, 07:00, 02:00
    
    section Phase 5
    Generate Synthesis         :synth, 07:30, 00:30
    Create Deliverables        :deliver, after synth, 00:40
    Save to Database           :save, after deliver, 00:10
```

---

## 💡 DIAGRAM 15: IDEA GENERATION FLOW

```mermaid
graph LR
    subgraph "Idea Generation & Cross-Pollination"
        Opening[Opening Statements] --> Ideas1[Initial Ideas:<br/>25-35 units]
        
        Ideas1 --> Expert1Turn[Expert 1 Dialogue Turn]
        Expert1Turn --> NewIdea1[New Idea:<br/>"Ambient Therapy"]
        
        NewIdea1 --> Expert2Turn[Expert 2 Builds On It]
        Expert2Turn --> ExpandedIdea[Expanded Idea:<br/>"Micro-moment Interventions"]
        
        ExpandedIdea --> Expert3Turn[Expert 3 Adds Layer]
        Expert3Turn --> ConnectedIdea[Connected Idea:<br/>"Context-aware Support"]
        
        ConnectedIdea --> Expert4Turn[Expert 4 New Angle]
        Expert4Turn --> NewIdea2[New Idea:<br/>"Peer Community"]
        
        NewIdea2 --> Expert5Turn[Expert 5 Builds]
        Expert5Turn --> ExpandedIdea2[Expanded:<br/>"AI-moderated Community"]
        
        ExpandedIdea2 --> Expert6Turn[Expert 6 Connects]
        Expert6Turn --> Synthesis1[Synthesis:<br/>"Ambient + Community"]
        
        Synthesis1 --> MoreTurns[Additional Turns<br/>12-18 total]
        
        MoreTurns --> FinalIdeas[Final Idea Count:<br/>40-50 units<br/>15-20 clusters]
    end
    
    style Opening fill:#fff4e6
    style FinalIdeas fill:#e1f5e1
```

---

## 🔄 DIAGRAM 16: PANEL TYPE COMPARISON

```mermaid
graph TB
    subgraph "Panel Type Selection Decision Tree"
        Query([User Query]) --> DecisionType{What Type<br/>of Decision?}
        
        DecisionType -->|Explore Options| Exploratory{How Many<br/>Valid Paths?}
        DecisionType -->|Need Consensus| Consensus[Use Delphi Panel]
        DecisionType -->|Evaluate Risk| Risk[Use Adversarial Panel]
        DecisionType -->|Deep Analysis| Analysis[Use Socratic Panel]
        DecisionType -->|Regulatory| Regulatory[Use Structured Panel]
        
        Exploratory -->|Many Unknown| OpenPanel[✓ Use Open Panel<br/>Type 2]
        Exploratory -->|Few Known Options| Structured[Use Structured Panel]
        
        OpenPanel --> Characteristics1[Characteristics:<br/>• 5-8 experts<br/>• 5-10 minutes<br/>• Parallel exploration<br/>• Multiple perspectives]
        
        Characteristics1 --> UseCases1[Best For:<br/>• Innovation brainstorming<br/>• Strategy exploration<br/>• Technology assessment<br/>• Opportunity identification]
        
        UseCases1 --> Output1[Output:<br/>• 40-50 ideas<br/>• 4-6 innovation clusters<br/>• Multiple viable paths<br/>• Innovation map]
    end
    
    style OpenPanel fill:#e3f2fd
    style Characteristics1 fill:#e1f5e1
    style UseCases1 fill:#fff9c4
```

---

## 📝 IMPLEMENTATION NOTES

### Mermaid Rendering

All diagrams in this document use Mermaid syntax and can be:
- **Rendered in GitHub**: Automatically displayed in GitHub markdown
- **Used in Documentation Sites**: Supported by most modern doc platforms
- **Converted to Images**: Use Mermaid CLI or online tools
- **Embedded in Presentations**: Export as PNG/SVG

### Diagram Update Workflow

1. **Code Changes**: When implementation changes, update corresponding diagram
2. **Version Control**: Track diagram changes alongside code changes
3. **Documentation Sync**: Keep diagrams synchronized with architecture docs
4. **Review Process**: Include diagram reviews in PR process

### Interactive Diagrams

For production deployments, consider:
- **Interactive Flowcharts**: Use D3.js or Cytoscape.js for clickable diagrams
- **Real-time Status**: Overlay actual execution data on state diagrams
- **Performance Metrics**: Add timing data to sequence diagrams
- **User Journey Maps**: Create interactive panel execution visualizations

---

## 🎬 CONCLUSION

These Mermaid diagrams provide comprehensive visual documentation of the Ask Panel Type 2 (Open Panel) orchestration workflow. Each diagram serves a specific purpose:

**For Developers:**
- Understand system architecture
- Implement state machines correctly
- Debug execution flows
- Design integrations

**For Product Managers:**
- Visualize user experience flow
- Understand timing and phases
- Plan feature roadmaps
- Communicate with stakeholders

**For Operations:**
- Monitor execution progress
- Identify bottlenecks
- Troubleshoot issues
- Optimize performance

**Next Steps:**
1. Review diagrams alongside code implementation
2. Use state machine diagram to build LangGraph workflow
3. Implement SSE streaming per architecture diagram
4. Validate multi-tenant security flows
5. Test error handling scenarios

---

**Document Version**: 1.0  
**Last Updated**: November 11, 2025  
**Status**: Production Ready  
**Format**: Mermaid Markdown  
**Maintainer**: VITAL Platform Team

**Related Documents**:
- [ASK_PANEL_TYPE2_OPEN_WORKFLOW_COMPLETE.md]
- [ASK_PANEL_TYPE2_LANGGRAPH_ARCHITECTURE.md]
- [ASK_PANEL_COMPREHENSIVE_DOCUMENTATION.md]
