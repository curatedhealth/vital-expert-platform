# 🎯 Legacy Content Extraction Summary

## What We're Extracting

From the legacy `ask-panel-v1` WorkflowBuilder, we have:

### 1. **Task Library (Node Templates)** - 148 Items
Located in: `TaskLibrary.tsx` → `TASK_DEFINITIONS`

**Categories**:
- **Research** (5 items): PubMed Search, Clinical Trials, FDA Search, Web Search, arXiv Search
- **Regulatory** (1 item): FDA Database Search  
- **Data** (5 items): RAG Query, RAG Archive, Cache Lookup, Data Extraction, Text Analysis
- **Control Flow** (6 items): If/Else, Switch, Loop, For Each, Parallel, Merge
- **Panel** (40+ items): Moderator, Expert Agents, Specialized domain experts
- **Panel Workflow** (10 items): Initialize, Consensus Building, Opening Rounds, etc.
- **Mode 1 Workflow** (8 items): Agent Profile, Conversation History, RAG Search, etc.
- **Mode 2 Workflow** (10 items): Multi-Expert workflows
- **Mode 3 Workflow** (14 items): Autonomous execution workflows
- **Mode 4 Workflow** (14 items): Team collaboration workflows
- **Agent** (1 item): Generic AI Agent node

Each template includes:
- `id`: Unique identifier
- `name`: Display name
- `description`: Detailed description
- `icon`: Emoji icon
- `category`: Grouping category
- `config`: 
  - `model`: AI model (GPT-4, GPT-4-mini, etc.)
  - `temperature`: 0.0 - 0.8
  - `tools`: Array of tool names
  - `systemPrompt`: Complete system prompt text

### 2. **Panel Workflow Templates** - 10 Complete Workflows
Located in: `panel-workflows/panel-definitions.ts`

**Panel Workflows (6)**:
1. **Structured Panel**: Sequential moderated discussion
   - 2 experts, moderator
   - Opening statements → Discussion → Consensus → Q&A → Documentation
   
2. **Open Panel**: Parallel collaborative exploration
   - 3 experts, moderator
   - Opening round → Free dialogue → Theme clustering → Synthesis
   
3. **Socratic Panel**: Iterative questioning methodology
   - 4 experts, Socratic moderator
   - Formulate questions → Collect responses → Analyze → Test assumptions
   
4. **Adversarial Panel**: Structured debate format
   - 5 experts (2 pro, 2 con, 1 neutral)
   - Opening arguments → Cross-examination → Rebuttals → Synthesis
   
5. **Delphi Panel**: Anonymous iterative consensus
   - 5 anonymous experts, moderator
   - Round 1 → Consensus → Round 2 → Consensus → Round 3 → Final
   
6. **Hybrid Human-AI Panel**: Combined human + AI experts
   - 4 experts (2 human, 2 AI)
   - Human phase → AI phase → Synthesis → Human review

**Ask Expert Modes (4)**:
7. **Mode 1**: Single expert with RAG and tools
8. **Mode 2**: Auto-selected multi-expert with hybrid RAG
9. **Mode 3**: Autonomous goal execution
10. **Mode 4**: Multi-expert team collaboration

Each workflow includes:
- `id`: Unique workflow identifier
- `name`: Display name
- `description`: Purpose and use case
- `icon`: Lucide icon component
- `defaultQuery`: Example query
- `experts`: Array of expert configurations
- `nodes`: Complete node definitions with positions
- `edges`: Edge connections between nodes
- `phases`: Workflow phase definitions

### 3. **Ask Expert Mode Workflows** - 4 Specialized Modes
Located in: `panel-workflows/mode*-ask-expert.ts`

- Mode 1: Quick Response with RAG
- Mode 2: Context + Multi-Expert with Auto-Selection
- Mode 3: Autonomous Goal Execution
- Mode 4: Multi-Expert Team Collaboration

---

## Migration Strategy

We need to seed this data into:

### Tables to Populate:

1. **`node_library`**: All 148 task definitions as reusable nodes
2. **`template_library`**: All 10 panel workflows as templates
3. **`workflows`**: Full workflow definitions for all 10 templates
4. **`workflow_templates`**: Template metadata

### Data Mapping:

```
TaskLibrary.tsx (148 items)
  └─> node_library table
       - node_slug: task.id
       - node_name: task.name
       - display_name: task.name
       - description: task.description
       - node_type: 'task' | 'control' | 'agent'
       - category: task.category
       - icon: task.icon
       - is_builtin: true
       - config: task.config (jsonb)

panel-definitions.ts (10 workflows)
  └─> template_library + workflows tables
       - template_slug: workflow.id
       - template_name: workflow.name
       - workflow definition: full nodes + edges
       - template_category: 'panel_discussion' | 'ask_expert'
```

---

## Next Steps

1. ✅ Extract all 148 task definitions
2. ✅ Extract all 10 panel workflow templates  
3. ⏳ Generate SQL migration script
4. ⏳ Seed to `node_library` table
5. ⏳ Seed to `template_library` + `workflows` tables
6. ⏳ Verify in Supabase dashboard
7. ⏳ Test loading in modern designer

---

## File Locations

```
apps/vital-system/src/components/langgraph-gui/
├── TaskLibrary.tsx                    # 148 task templates
└── panel-workflows/
    ├── panel-definitions.ts           # 6 panel workflows
    ├── mode1-ask-expert.ts           # Mode 1 workflow
    ├── mode2-ask-expert.ts           # Mode 2 workflow
    ├── mode3-ask-expert.ts           # Mode 3 workflow
    └── mode4-ask-expert.ts           # Mode 4 workflow
```

---

## Total Content to Migrate

- **148 Node Templates** (all categories)
- **10 Complete Workflow Templates** (6 panels + 4 expert modes)
- **All System Prompts** (preserved in config)
- **All Tool Configurations** (preserved in config)
- **All Expert Definitions** (embedded in workflows)
- **All Position Data** (for visual layout)

This represents the **complete legacy library** from Ask Panel V1! 🎉

