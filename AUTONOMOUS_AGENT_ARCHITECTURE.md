< # Autonomous Agent Architecture - Complete Integration

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AUTONOMOUS EXPERT AGENT                           │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────┐
        │          AGENT PROMPT BUILDER (NEW!)               │
        │  Combines all prompts from database + capabilities  │
        └────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌───────────────────┐                 ┌───────────────────┐
│  DATABASE         │                 │  CODE-BASED       │
│  PROMPTS          │                 │  CAPABILITIES     │
└───────────────────┘                 └───────────────────┘
        │                                       │
        ▼                                       ▼
┌─────────────────────────────────────────────────────────┐
│  agents table:                                          │
│  - name, display_name, description                      │
│  - system_prompt (core identity)                        │
│  - model, temperature, max_tokens                       │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│  capabilities table:                                    │
│  - name, description, category                          │
│  - domain, stage, VITAL_component                       │
│  - priority, complexity_level                           │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│  prompts table:                                         │
│  - name, content, category, type                        │
│  - agents[] (relation), use_cases[]                     │
│  - type: starter | template | example | guide           │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│  COMBINED SYSTEM PROMPT                                 │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 1. Identity (from agent.system_prompt)            │ │
│  │ 2. Capabilities (from capabilities table)         │ │
│  │ 3. Tools (from code: FDA, clinical, research)     │ │
│  │ 4. RAG Strategy (if enabled)                      │ │
│  │ 5. Output Format (if structured)                  │ │
│  │ 6. Behavior Guidelines                            │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              LANGCHAIN REACT AGENT                      │
│  Uses combined prompt + tools + memory + RAG            │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Complete Data Flow

### 1. **Agent Creation** (Database → Code)

```typescript
// 1. Agent profile stored in database
INSERT INTO agents (name, display_name, description, system_prompt, model) VALUES (
  'regulatory-expert',
  'Dr. Regulatory Expert',
  'FDA pathway specialist with 20+ years experience',
  'You are a senior regulatory affairs expert specializing in FDA 510(k) and PMA pathways...',
  'gpt-4-turbo-preview'
);

// 2. Agent capabilities linked
INSERT INTO agent_capabilities (agent_id, capability_id) VALUES
  ('regulatory-expert', 'fda-pathway-analysis'),
  ('regulatory-expert', 'predicate-device-search'),
  ('regulatory-expert', 'regulatory-cost-estimation');

// 3. Starter prompts added
INSERT INTO prompts (name, content, category, type, agents) VALUES (
  'FDA 510k Assessment',
  'Can you analyze the regulatory pathway for my {device_type}?',
  'Regulatory',
  'starter',
  ['regulatory-expert']
);
```

### 2. **Runtime: Prompt Building** (Code)

```typescript
// User makes request to autonomous agent
POST /api/chat/autonomous
{
  "message": "What pathway should I use for my glucose monitor?",
  "agent": { "id": "regulatory-expert" },
  "options": { "outputFormat": "regulatory" }
}

// AgentPromptBuilder kicks in:
const promptBuilder = await createAgentPromptBuilder('regulatory-expert');

const systemPrompt = await promptBuilder.buildSystemPrompt({
  includeCapabilities: true,  // ✅ Pulls from capabilities table
  includeTools: true,          // ✅ Adds FDA, clinical, research tools
  includeRAGStrategy: true,    // ✅ Adds knowledge base instructions
  outputFormat: 'regulatory',  // ✅ Adds RegulatoryAnalysis schema
});
```

### 3. **Generated System Prompt** (Example Output)

```markdown
# Dr. Regulatory Expert

FDA pathway specialist with 20+ years experience

## Role and Expertise

You are a senior regulatory affairs expert specializing in FDA 510(k) and PMA pathways. You guide medical device companies through regulatory submissions with deep knowledge of FDA requirements, clinical evidence standards, and quality system regulations.

## Your Capabilities

You have been configured with the following specialized capabilities:

### Regulatory
- **FDA Pathway Analysis**: Determine optimal regulatory pathway (510k, PMA, De Novo) based on device characteristics
- **Predicate Device Search**: Find and analyze substantially equivalent predicate devices
- **Regulatory Cost Estimation**: Calculate timeline and cost estimates for regulatory submissions

### Clinical
- **Clinical Evidence Strategy**: Design clinical studies meeting FDA requirements
- **Study Endpoint Selection**: Identify appropriate primary and secondary endpoints

## Available Tools

You have access to the following tools for autonomous research:

### FDA & Regulatory
- **fda_database_search**: Search FDA database for 510k, PMA, De Novo, guidance documents
- **fda_guidance_lookup**: Retrieve specific FDA guidance documents
- **regulatory_calculator**: Calculate timelines, costs, sample sizes, power analysis

### Clinical Research
- **clinical_trials_search**: Search ClinicalTrials.gov for relevant studies
- **study_design_helper**: Generate study design recommendations
- **endpoint_selector**: Recommend appropriate clinical endpoints

### External Research
- **tavily_search**: Real-time web search for current information
- **pubmed_literature_search**: Search peer-reviewed medical literature
- **arxiv_research_search**: Search recent research papers

**Important Guidelines:**
- Use tools proactively to gather comprehensive information
- Combine multiple tools for thorough analysis
- Always cite sources from tool results

## Knowledge Retrieval

You have access to a curated knowledge base of:
- FDA guidance documents and regulatory pathways
- Clinical trial protocols and study designs
- Medical device regulations (US, EU, international)

## Output Format Requirements

Your response MUST follow this structured format:

{
  "recommendedPathway": "510k | pma | de_novo | exempt",
  "deviceClass": "I | II | III",
  "timeline": {
    "preparation": number,
    "submission": number,
    "review": number,
    "total": number
  },
  "estimatedCost": {
    "preparation": number,
    "testing": number,
    "submission_fees": number,
    "total": number
  },
  "predicateDevices": [...],
  "risks": [...],
  "recommendations": [...]
}

## Behavioral Guidelines

**Autonomy:**
- Take initiative to gather information using available tools
- Execute multi-step research plans autonomously

**Quality:**
- Provide comprehensive, evidence-based answers
- Cite specific sources and references
```

### 4. **Agent Execution** (LangChain)

```typescript
// React Agent receives this complete prompt
const agent = await createReactAgent({
  llm: gpt4,
  tools: [fdaDatabaseTool, clinicalTrialsTool, ...],
  prompt: completePromptTemplate, // ← Built from database + code
});

// Agent executes autonomously:
// 1. Reads user query: "glucose monitor pathway?"
// 2. Plans: "I need to search FDA database for predicate devices"
// 3. Calls: fda_database_search("continuous glucose monitor")
// 4. Analyzes: Finds Dexcom G6, Abbott Freestyle
// 5. Plans: "I need regulatory calculator for timeline"
// 6. Calls: regulatory_calculator({type: "timeline", pathway: "510k"})
// 7. Synthesizes: Combines findings into RegulatoryAnalysis format
// 8. Returns: Structured JSON response
```

---

## 🔗 How Everything Connects

### Database Tables → Prompt Builder

```typescript
// AgentPromptBuilder pulls from database:

class AgentPromptBuilder {
  async loadAgentData() {
    // 1. Load agent profile
    const agent = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();
    // Gets: name, description, system_prompt, model, temperature

    // 2. Load agent capabilities
    const capabilities = await supabase
      .from('agent_capabilities')
      .select('capability_id, capabilities(*)')
      .eq('agent_id', agentId);
    // Gets: All capabilities linked to this agent

    // 3. Load prompt templates
    const prompts = await supabase
      .from('prompts')
      .select('*')
      .contains('agents', [agentId]);
    // Gets: Starter prompts, examples, templates
  }

  buildIdentitySection() {
    return `# ${agent.display_name}\n${agent.description}\n\n${agent.system_prompt}`;
  }

  buildCapabilitiesSection() {
    return capabilities.map(cap =>
      `- **${cap.name}**: ${cap.description}`
    ).join('\n');
  }

  buildToolsSection() {
    return tools.map(tool =>
      `- **${tool.name}**: ${tool.description}`
    ).join('\n');
  }
}
```

### Code Tools → Agent

```typescript
// Tools are defined in code with DynamicStructuredTool:

export const fdaDatabaseTool = new DynamicStructuredTool({
  name: 'fda_database_search',
  description: 'Search FDA database for 510k, PMA, De Novo clearances...',
  schema: z.object({
    query: z.string(),
    searchType: z.enum(['510k', 'pma', 'de_novo']),
  }),
  func: async ({ query, searchType }) => {
    // Implementation
  },
});

// These tools are automatically added to agent:
const tools = [
  fdaDatabaseTool,
  clinicalTrialsSearchTool,
  tavilySearchTool,
  // ...
];

const agent = createReactAgent({ llm, tools, prompt });
```

### Parsers → Structured Output

```typescript
// Output format specified in request:
{
  "options": {
    "outputFormat": "regulatory"
  }
}

// Prompt builder adds format instructions:
const formatInstructions = getFormatInstructions('regulatory');
// Returns: Zod schema as markdown for LLM

// Agent generates response following schema
// Parser validates and fixes if needed:
const parsedOutput = await parseRegulatoryAnalysis(llmOutput);
```

---

## 📊 Example: Complete Request Flow

### User Request:
```json
POST /api/chat/autonomous
{
  "message": "Analyze regulatory pathway for SmartGlucose CGM",
  "agent": { "id": "regulatory-expert" },
  "userId": "user-123",
  "sessionId": "session-456",
  "options": {
    "enableRAG": true,
    "retrievalStrategy": "rag_fusion",
    "memoryStrategy": "research",
    "outputFormat": "regulatory"
  }
}
```

### System Processing:

**Step 1: Long-Term Memory Retrieval**
```
🧠 Retrieving user context...
Found facts:
- "User is developing continuous glucose monitor"
- "User prefers 510(k) pathway for speed"
- "User target: Submit by Q3 2025"

Active projects:
- "SmartGlucose CGM - continuous glucose monitoring device"
```

**Step 2: Prompt Building**
```
📚 Building agent prompt from database...
Loaded:
- Agent: Dr. Regulatory Expert
- System prompt: "You are a senior regulatory affairs expert..."
- Capabilities: 5 (FDA pathway analysis, predicate search, ...)
- Prompts: 3 starter prompts
- Tools: 15 (FDA, clinical, research tools)

Generated system prompt: 2,500 tokens
```

**Step 3: Agent Initialization**
```
🚀 Initializing autonomous agent...
✅ Memory initialized (research strategy)
✅ RAG retriever initialized (rag_fusion)
✅ 15 tools loaded
✅ Prompt template created from database
✅ React agent ready
```

**Step 4: Autonomous Execution**
```
🔄 Agent executing query...

Step 1: Agent plans
"I need to search FDA database for similar CGM devices"

Step 2: Tool call
🔧 Tool executing: fda_database_search
Input: { query: "continuous glucose monitor", searchType: "510k" }
✅ Tool complete: Found 12 predicate devices

Step 3: Agent analyzes
"Dexcom G6 (K181496) is most similar. Let me calculate timeline."

Step 4: Tool call
🔧 Tool executing: regulatory_calculator
Input: { calculationType: "timeline", pathway: "510k", deviceClass: "II" }
✅ Tool complete: 12 months total

Step 5: Agent synthesizes
"Let me search for clinical evidence requirements..."

Step 6: Tool call
🔧 Tool executing: fda_guidance_lookup
Input: { guidanceType: "CGM", topic: "clinical_data" }
✅ Tool complete: FDA guidance document retrieved

Step 7: Agent formats output
"Generating RegulatoryAnalysis format..."
```

**Step 5: Response Generation**
```
✅ Agent execution complete

Tokens used:
- Prompt: 2,100
- Completion: 1,400
- Total: 3,500

Auto-learning:
🧠 Learned 2 new facts:
- "User chose Dexcom G6 as predicate device"
- "User estimated timeline: 12 months for 510(k)"
```

### Final Response:
```json
{
  "success": true,
  "response": "Based on comprehensive analysis...",
  "parsedOutput": {
    "recommendedPathway": "510k",
    "deviceClass": "II",
    "timeline": { "total": 12 },
    "predicateDevices": [
      {
        "name": "Dexcom G6",
        "k_number": "K181496",
        "similarity_score": 92
      }
    ],
    "estimatedCost": { "total": 145000 },
    "risks": [...],
    "recommendations": [...]
  },
  "tokenUsage": { "total": 3500 },
  "personalizedContext": {
    "factsUsed": 3,
    "activeProjects": 1
  }
}
```

---

## 🎯 Key Integration Points

### 1. **Database Drives Agent Identity**
- Agent name, description, role → From `agents` table
- Core system prompt → From `agents.system_prompt`
- Model, temperature, max tokens → From `agents` table

### 2. **Capabilities Add Context**
- Linked via `agent_capabilities` junction table
- Each capability has name, description, category
- Automatically formatted into prompt

### 3. **Prompts Provide Templates**
- Starter prompts → For UI suggestion chips
- Example prompts → For user guidance
- Templates → For specific workflows

### 4. **Tools Enable Autonomy**
- Defined in code for flexibility
- Automatically discovered and added
- Descriptions included in prompt

### 5. **Everything is Dynamic**
- Change agent prompt in database → Immediately affects behavior
- Add new capability → Auto-included in prompt
- Add new tool in code → Auto-available to agent

---

## ✅ Complete Integration Checklist

- ✅ Agent prompts from database (`agents.system_prompt`)
- ✅ Capabilities from database (`capabilities` table)
- ✅ Starter prompts from database (`prompts` table)
- ✅ Tools from code (FDA, clinical, research)
- ✅ Retrievers from code (Multi-Query, RAG Fusion, etc.)
- ✅ Parsers from code (Regulatory, Clinical, etc.)
- ✅ Memory from database + code (short-term + long-term)
- ✅ Token tracking to database
- ✅ Budget enforcement from database
- ✅ Auto-learning to database

**Result:** 100% integrated autonomous system where database controls agent behavior and code provides capabilities.
