# Mode 1 & Mode 3 L4/L5 Architecture Specification

## Overview

This document defines the detailed architecture for Mode 1 (Manual-Interactive) and Mode 3 (Manual-Autonomous) with L4 Context Engineer and L5 Tool Agents. **All configuration values are sourced from agent metadata or user input - nothing is hardcoded.**

---

## Configuration Sources

### 1. Agent Metadata (Database: `agents` table)

```sql
-- Core agent configuration
agents.model                -- LLM model (gpt-4, claude-3-opus, etc.)
agents.temperature          -- Model temperature (0.0-2.0)
agents.max_tokens          -- Max response tokens
agents.context_window      -- Context window size
agents.tier                -- Agent tier (1=Foundational, 2=Specialist, 3=Ultra)

-- L4/L5 Configuration (stored in metadata JSONB)
agents.metadata.l4_config.enabled                -- Enable L4 Context Engineer
agents.metadata.l4_config.max_l5_tools           -- Max parallel L5 tools (2-5)
agents.metadata.l4_config.token_budget           -- Context budget for findings
agents.metadata.l4_config.aggregation_strategy   -- "synthesized" | "ranked_list"

agents.metadata.l5_config.rag_enabled            -- Enable L5 RAG Tool
agents.metadata.l5_config.websearch_enabled      -- Enable L5 WebSearch Tool
agents.metadata.l5_config.pubmed_enabled         -- Enable L5 PubMed Tool
agents.metadata.l5_config.fda_enabled            -- Enable L5 FDA Tool
agents.metadata.l5_config.max_findings_per_tool  -- Max findings per L5 tool (3-10)
agents.metadata.l5_config.timeout_ms             -- L5 tool timeout

-- Existing fields used
agents.knowledge_namespaces -- RAG namespaces for L5 RAG Tool
agents.tools_enabled        -- Available tools for L5 agents

-- Hierarchy permissions
agents.metadata.hierarchy.can_spawn_l3
agents.metadata.hierarchy.can_spawn_l4
agents.metadata.hierarchy.can_use_l4_context_engineer
```

### 2. User Input (Frontend: `ResponsePreferences` + Request)

```typescript
// From response-preferences-panel.tsx
interface ResponsePreferences {
  format: 'structured' | 'narrative' | 'executive' | 'technical';
  depth: 'concise' | 'standard' | 'comprehensive';
  includeCitations: boolean;
  includeInsights: boolean;
  includeKeyTakeaways: boolean;
  includeNextSteps: boolean;
}

// From enhanced-chat-input.tsx
interface UserPromptInput {
  selectedModel: string;           // Model override from user
  maxLength: number;               // Character limit
}

// Extended for Mode 3
interface Mode3UserInput extends ResponsePreferences {
  maxResearchRounds: number;       // ReAct loop iterations (1-10)
  researchDepth: 'quick' | 'standard' | 'deep' | 'exhaustive';
  enabledTools: string[];          // User-selected L5 tools
  maxFindingsPerSource: number;    // User-specified findings limit
}
```

### 3. Request Parameters (Backend: `AgentQueryRequest`)

```python
# From models/requests.py - Extended for L4/L5
class AgentQueryRequest(BaseModel):
    # Existing fields
    model: Optional[str]                    # LLM model override
    temperature: Optional[float]            # Temperature override
    max_tokens: Optional[int]               # Max tokens override
    enable_rag: Optional[bool]              # Enable RAG
    enable_tools: Optional[bool]            # Enable tools
    max_context_docs: Optional[int]         # RAG document limit

    # NEW: L4/L5 Configuration from user input
    l4_config: Optional[L4ConfigRequest] = None
    l5_config: Optional[L5ConfigRequest] = None
    response_preferences: Optional[ResponsePreferencesRequest] = None

class L4ConfigRequest(BaseModel):
    """User-configurable L4 Context Engineer settings"""
    enabled: bool = True
    max_l5_tools: int = Field(3, ge=1, le=5)
    token_budget: int = Field(4000, ge=1000, le=16000)
    aggregation_strategy: str = "synthesized"  # or "ranked_list"

class L5ConfigRequest(BaseModel):
    """User-configurable L5 Tool settings"""
    enabled_tools: List[str] = ["rag", "websearch"]
    max_findings_per_tool: int = Field(5, ge=1, le=10)
    timeout_ms: int = Field(3000, ge=500, le=10000)

class ResponsePreferencesRequest(BaseModel):
    """User response preferences from frontend"""
    format: str = "structured"
    depth: str = "standard"
    include_citations: bool = True
    include_insights: bool = True
    include_key_takeaways: bool = True
    include_next_steps: bool = False
```

---

## Mode 1: Manual-Interactive (FAST PATH)

### Objective
- Response time: **3-5 seconds**
- User is waiting at screen
- Quick, conversational responses

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MODE 1 FAST PATH                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User Query + ResponsePreferences                                           │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    L2 EXPERT AGENT                                   │   │
│  │  Config loaded from: agents.metadata, user ResponsePreferences       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       │  [SKIP L4 - Too slow for chat]                                     │
│       │                                                                     │
│       ├──────────────────────────────────────────────────────────────┐     │
│       │  IF agent.metadata.l5_config.rag_enabled                     │     │
│       │  AND user.enable_rag == true                                 │     │
│       ▼                                                              │     │
│  ┌─────────────────────────────────────────┐                         │     │
│  │         L5 RAG TOOL (OPTIONAL)          │                         │     │
│  │                                          │                         │     │
│  │  namespaces: agent.knowledge_namespaces │                         │     │
│  │  max_findings: MIN(                     │                         │     │
│  │    agent.metadata.l5_config.max_findings_per_tool,               │     │
│  │    3  // Mode 1 fast limit              │                         │     │
│  │  )                                      │                         │     │
│  │  timeout: 500ms (hard limit for chat)   │                         │     │
│  └─────────────────────────────────────────┘                         │     │
│       │                                                              │     │
│       └──────────────────────────────────────────────────────────────┘     │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    LLM RESPONSE GENERATION                           │   │
│  │                                                                       │   │
│  │  model: user.selectedModel OR agent.model                            │   │
│  │  temperature: agent.temperature                                       │   │
│  │  max_tokens: agent.max_tokens                                        │   │
│  │  response_format: user.ResponsePreferences.format                    │   │
│  │  depth: user.ResponsePreferences.depth                               │   │
│  │  include_citations: user.ResponsePreferences.includeCitations        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       ▼                                                                     │
│  Stream Response to User (token by token)                                   │
│                                                                             │
│  Total Time Target: 3-5 seconds                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Configuration Resolution (Mode 1)

```python
class Mode1ConfigResolver:
    """
    Resolves configuration for Mode 1 from agent metadata + user input.
    Priority: User Input > Request Override > Agent Metadata > Defaults
    """

    def resolve(
        self,
        agent: AgentRecord,
        request: AgentQueryRequest,
        user_preferences: ResponsePreferences
    ) -> Mode1Config:

        # LLM Configuration
        model = request.model or agent.model or "gpt-4"
        temperature = agent.temperature or 0.7
        max_tokens = agent.max_tokens or 2000

        # L5 RAG Configuration (Mode 1: Limited for speed)
        l5_rag_enabled = (
            request.enable_rag is not False and  # User didn't disable
            agent.metadata.get('l5_config', {}).get('rag_enabled', True)
        )

        # Mode 1 Hard Limits (for responsiveness)
        mode1_max_findings = min(
            agent.metadata.get('l5_config', {}).get('max_findings_per_tool', 5),
            3  # Mode 1 cap for speed
        )
        mode1_timeout_ms = 500  # Hard limit for chat responsiveness

        # Response Format from user preferences
        response_format = user_preferences.format or "structured"
        response_depth = user_preferences.depth or "standard"
        include_citations = user_preferences.includeCitations

        return Mode1Config(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            l5_rag_enabled=l5_rag_enabled,
            l5_namespaces=agent.knowledge_namespaces or [],
            l5_max_findings=mode1_max_findings,
            l5_timeout_ms=mode1_timeout_ms,
            response_format=response_format,
            response_depth=response_depth,
            include_citations=include_citations,
            include_insights=user_preferences.includeInsights,
            include_key_takeaways=user_preferences.includeKeyTakeaways,
        )
```

---

## Mode 3: Manual-Autonomous (DEEP PATH)

### Objective
- Response time: **30 seconds - 5 minutes** (acceptable)
- User submits task and can wait/do other work
- Thorough, comprehensive research and response

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MODE 3 DEEP PATH                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User Task + Mode3UserInput + ResponsePreferences                           │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    L2 EXPERT AGENT                                   │   │
│  │  Config loaded from: agents.metadata, user Mode3UserInput            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       │  [Complexity Analysis]                                             │
│       │  IF complexity > agent.metadata.l3_spawn_threshold                 │
│       │     AND agent.metadata.hierarchy.can_spawn_l3 == true              │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    L3 SPECIALIST (Optional)                          │   │
│  │  Spawned if complex sub-domain expertise needed                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       │  [IF agent.metadata.l4_config.enabled == true                      │
│       │   AND user.Mode3UserInput.researchDepth != "quick"]                │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    L4 CONTEXT ENGINEER                               │   │
│  │                                                                       │   │
│  │  max_l5_tools: user.Mode3UserInput.enabledTools.length               │   │
│  │               OR agent.metadata.l4_config.max_l5_tools               │   │
│  │                                                                       │   │
│  │  token_budget: agent.metadata.l4_config.token_budget                 │   │
│  │               SCALED BY user.ResponsePreferences.depth:              │   │
│  │               - concise: 0.5x                                        │   │
│  │               - standard: 1.0x                                       │   │
│  │               - comprehensive: 1.5x                                  │   │
│  │                                                                       │   │
│  │  aggregation_strategy: agent.metadata.l4_config.aggregation_strategy │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       │  PARALLEL L5 EXECUTION                                             │
│       │                                                                     │
│       ├───────────────────┬───────────────────┬───────────────────┐        │
│       ▼                   ▼                   ▼                   ▼        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │  L5 RAG     │    │ L5 WebSearch│    │  L5 PubMed  │    │   L5 FDA    │ │
│  │             │    │             │    │             │    │             │ │
│  │ namespaces: │    │ domains:    │    │ mesh_terms: │    │ endpoints:  │ │
│  │ agent.      │    │ filtered by │    │ extracted   │    │ based on    │ │
│  │ knowledge_  │    │ agent.tier  │    │ from query  │    │ query       │ │
│  │ namespaces  │    │             │    │             │    │             │ │
│  │             │    │             │    │             │    │             │ │
│  │ max_findings│    │ max_findings│    │ max_findings│    │ max_findings│ │
│  │ FROM:       │    │ FROM:       │    │ FROM:       │    │ FROM:       │ │
│  │ user.max    │    │ user.max    │    │ user.max    │    │ user.max    │ │
│  │ Findings    │    │ Findings    │    │ Findings    │    │ Findings    │ │
│  │ PerSource   │    │ PerSource   │    │ PerSource   │    │ PerSource   │ │
│  │ OR agent.   │    │ OR agent.   │    │ OR agent.   │    │ OR agent.   │ │
│  │ l5_config   │    │ l5_config   │    │ l5_config   │    │ l5_config   │ │
│  │             │    │             │    │             │    │             │ │
│  │ timeout:    │    │ timeout:    │    │ timeout:    │    │ timeout:    │ │
│  │ agent.      │    │ agent.      │    │ agent.      │    │ agent.      │ │
│  │ l5_config.  │    │ l5_config.  │    │ l5_config.  │    │ l5_config.  │ │
│  │ timeout_ms  │    │ timeout_ms  │    │ timeout_ms  │    │ timeout_ms  │ │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘ │
│       │                   │                   │                   │        │
│       └───────────────────┴───────────────────┴───────────────────┘        │
│                           │                                                 │
│                           ▼                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                L4 AGGREGATION & CONTEXT ENGINEERING                  │   │
│  │                                                                       │   │
│  │  1. Deduplicate findings (semantic similarity > 0.85)                │   │
│  │  2. Rank by relevance score                                          │   │
│  │  3. Format citations per user.ResponsePreferences.format             │   │
│  │  4. Compress to token_budget                                         │   │
│  │  5. Return to L2/L3                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    REACT LOOP (Mode 3 Only)                          │   │
│  │                                                                       │   │
│  │  max_iterations: user.Mode3UserInput.maxResearchRounds               │   │
│  │                  OR agent.metadata.react_config.max_iterations       │   │
│  │                  OR depth_to_iterations(user.researchDepth):         │   │
│  │                     quick: 1                                         │   │
│  │                     standard: 3                                      │   │
│  │                     deep: 5                                          │   │
│  │                     exhaustive: 10                                   │   │
│  │                                                                       │   │
│  │  [Each iteration can invoke L4 Context Engineer again]               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    FINAL RESPONSE GENERATION                         │   │
│  │                                                                       │   │
│  │  model: user.selectedModel OR agent.model                            │   │
│  │  temperature: agent.temperature                                       │   │
│  │  max_tokens: agent.max_tokens * depth_multiplier                     │   │
│  │                                                                       │   │
│  │  response_format: user.ResponsePreferences.format                    │   │
│  │  include_citations: user.ResponsePreferences.includeCitations        │   │
│  │  include_insights: user.ResponsePreferences.includeInsights          │   │
│  │  include_key_takeaways: user.ResponsePreferences.includeKeyTakeaways │   │
│  │  include_next_steps: user.ResponsePreferences.includeNextSteps       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       ▼                                                                     │
│  Stream Progress Events + Final Response                                    │
│                                                                             │
│  Total Time: 30 seconds - 5 minutes (user expects this)                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Configuration Resolution (Mode 3)

```python
class Mode3ConfigResolver:
    """
    Resolves configuration for Mode 3 from agent metadata + user input.
    Priority: User Input > Request Override > Agent Metadata > Defaults
    """

    # Depth to iterations mapping
    DEPTH_TO_ITERATIONS = {
        "quick": 1,
        "standard": 3,
        "deep": 5,
        "exhaustive": 10
    }

    # Depth to token budget multiplier
    DEPTH_TO_BUDGET_MULTIPLIER = {
        "concise": 0.5,
        "standard": 1.0,
        "comprehensive": 1.5
    }

    def resolve(
        self,
        agent: AgentRecord,
        request: AgentQueryRequest,
        user_preferences: ResponsePreferences,
        mode3_input: Mode3UserInput
    ) -> Mode3Config:

        # L4 Context Engineer Configuration
        l4_enabled = (
            agent.metadata.get('l4_config', {}).get('enabled', True) and
            mode3_input.researchDepth != "quick"
        )

        # Determine enabled L5 tools
        # Priority: User selection > Agent config
        if mode3_input.enabledTools:
            enabled_l5_tools = mode3_input.enabledTools
        else:
            l5_config = agent.metadata.get('l5_config', {})
            enabled_l5_tools = []
            if l5_config.get('rag_enabled', True):
                enabled_l5_tools.append("rag")
            if l5_config.get('websearch_enabled', True):
                enabled_l5_tools.append("websearch")
            if l5_config.get('pubmed_enabled', False):
                enabled_l5_tools.append("pubmed")
            if l5_config.get('fda_enabled', False):
                enabled_l5_tools.append("fda")

        # Max L5 tools (capped by agent config)
        max_l5_tools = min(
            len(enabled_l5_tools),
            agent.metadata.get('l4_config', {}).get('max_l5_tools', 5)
        )

        # Token budget calculation
        base_budget = agent.metadata.get('l4_config', {}).get('token_budget', 4000)
        depth_multiplier = self.DEPTH_TO_BUDGET_MULTIPLIER.get(
            user_preferences.depth, 1.0
        )
        token_budget = int(base_budget * depth_multiplier)

        # Max findings per tool
        # Priority: User input > Agent config > Default
        max_findings = (
            mode3_input.maxFindingsPerSource or
            agent.metadata.get('l5_config', {}).get('max_findings_per_tool', 5)
        )

        # L5 timeout (from agent config)
        l5_timeout = agent.metadata.get('l5_config', {}).get('timeout_ms', 3000)

        # ReAct iterations
        # Priority: User input > Depth mapping > Agent config > Default
        if mode3_input.maxResearchRounds:
            max_iterations = mode3_input.maxResearchRounds
        else:
            max_iterations = self.DEPTH_TO_ITERATIONS.get(
                mode3_input.researchDepth,
                agent.metadata.get('react_config', {}).get('max_iterations', 3)
            )

        # Aggregation strategy
        aggregation_strategy = agent.metadata.get('l4_config', {}).get(
            'aggregation_strategy', 'synthesized'
        )

        return Mode3Config(
            # LLM Config
            model=request.model or agent.model or "gpt-4",
            temperature=agent.temperature or 0.7,
            max_tokens=agent.max_tokens or 4000,

            # L4 Config
            l4_enabled=l4_enabled,
            l4_token_budget=token_budget,
            l4_aggregation_strategy=aggregation_strategy,

            # L5 Config
            l5_enabled_tools=enabled_l5_tools[:max_l5_tools],
            l5_max_findings=max_findings,
            l5_timeout_ms=l5_timeout,
            l5_namespaces=agent.knowledge_namespaces or [],

            # ReAct Config
            max_react_iterations=max_iterations,
            research_depth=mode3_input.researchDepth,

            # Response Config (from user preferences)
            response_format=user_preferences.format,
            response_depth=user_preferences.depth,
            include_citations=user_preferences.includeCitations,
            include_insights=user_preferences.includeInsights,
            include_key_takeaways=user_preferences.includeKeyTakeaways,
            include_next_steps=user_preferences.includeNextSteps,
        )
```

---

## Database Schema Extension

### Agent Metadata Schema for L4/L5

```sql
-- Add to agents.metadata JSONB field
UPDATE agents SET metadata = metadata || '{
  "l4_config": {
    "enabled": true,
    "max_l5_tools": 3,
    "token_budget": 4000,
    "aggregation_strategy": "synthesized"
  },
  "l5_config": {
    "rag_enabled": true,
    "websearch_enabled": true,
    "pubmed_enabled": false,
    "fda_enabled": false,
    "max_findings_per_tool": 5,
    "timeout_ms": 3000
  },
  "react_config": {
    "max_iterations": 3,
    "confidence_threshold": 0.8
  },
  "hierarchy": {
    "can_spawn_l3": true,
    "can_spawn_l4": true,
    "can_use_l4_context_engineer": true,
    "l3_spawn_threshold": 0.7
  }
}'::jsonb
WHERE tier IN (2, 3);  -- Specialists and Ultra-Specialists
```

### Default Values by Tier

| Config | Tier 1 (Foundational) | Tier 2 (Specialist) | Tier 3 (Ultra) |
|--------|----------------------|---------------------|----------------|
| `l4_config.enabled` | false | true | true |
| `l4_config.max_l5_tools` | 1 | 3 | 5 |
| `l4_config.token_budget` | 2000 | 4000 | 8000 |
| `l5_config.max_findings_per_tool` | 3 | 5 | 10 |
| `l5_config.timeout_ms` | 1000 | 3000 | 5000 |
| `react_config.max_iterations` | 1 | 3 | 10 |

---

## Frontend Extension

### Mode 3 User Input Component

```typescript
// New component: mode3-research-preferences.tsx

interface Mode3ResearchPreferences {
  researchDepth: 'quick' | 'standard' | 'deep' | 'exhaustive';
  maxResearchRounds: number;
  enabledTools: string[];
  maxFindingsPerSource: number;
}

const RESEARCH_DEPTHS = [
  { id: 'quick', label: 'Quick', iterations: 1, description: 'Fast overview' },
  { id: 'standard', label: 'Standard', iterations: 3, description: 'Balanced depth' },
  { id: 'deep', label: 'Deep', iterations: 5, description: 'Thorough research' },
  { id: 'exhaustive', label: 'Exhaustive', iterations: 10, description: 'Comprehensive analysis' },
];

const L5_TOOLS = [
  { id: 'rag', label: 'Knowledge Base', description: 'Internal documents' },
  { id: 'websearch', label: 'Web Search', description: 'Live web results' },
  { id: 'pubmed', label: 'PubMed', description: 'Medical literature' },
  { id: 'fda', label: 'FDA Database', description: 'Regulatory data' },
  { id: 'clinicaltrials', label: 'Clinical Trials', description: 'Trial registry' },
];
```

---

## Summary Comparison

| Aspect | Mode 1 (Interactive) | Mode 3 (Autonomous) |
|--------|---------------------|---------------------|
| **Target Time** | 3-5 seconds | 30s - 5 minutes |
| **L4 Context Engineer** | ❌ Skip | ✅ Full Use |
| **L5 Tools** | 0-1 (RAG only) | 1-5 (parallel) |
| **Max Findings** | MIN(agent.l5_config.max_findings, 3) | user.maxFindingsPerSource OR agent.l5_config.max_findings |
| **L5 Timeout** | 500ms (hard limit) | agent.l5_config.timeout_ms |
| **Token Budget** | N/A | agent.l4_config.token_budget × depth_multiplier |
| **ReAct Loops** | ❌ None | user.maxResearchRounds OR depth_to_iterations |
| **Config Sources** | Agent metadata + ResponsePreferences | Agent metadata + Mode3UserInput + ResponsePreferences |

---

## Implementation Files

```
services/ai-engine/src/
├── services/
│   ├── l4_context_engineer.py      # L4 Context Engineer service
│   ├── l5_rag_tool.py              # L5 RAG Tool Agent
│   ├── l5_websearch_tool.py        # L5 WebSearch Tool Agent
│   ├── l5_pubmed_tool.py           # L5 PubMed Tool Agent
│   ├── l5_fda_tool.py              # L5 FDA Tool Agent
│   └── config_resolvers/
│       ├── mode1_config_resolver.py
│       └── mode3_config_resolver.py
├── langgraph_workflows/
│   ├── mode1_manual_interactive.py  # Updated with L5 optional path
│   └── mode3_manual_autonomous.py   # Updated with L4/L5 full path
└── models/
    └── l4_l5_config.py             # Config models

apps/vital-system/src/
├── features/chat/components/
│   ├── mode3-research-preferences.tsx  # New Mode 3 input panel
│   └── enhanced-chat-input.tsx         # Updated to pass L4/L5 config
```
