## LangGraph GUI – File Map

The tables below group every file that participates in the LangGraph GUI experience. Use this as a quick reference when navigating the repo.

---

### 1. Frontend Components (`apps/digital-health-startup/src/components/langgraph-gui/`)

| Path | Purpose |
| --- | --- |
| `WorkflowBuilder.tsx` | Main ReactFlow-based editor with execution controls, chat sidebar, and task orchestration logic. |
| `WorkflowCodeView.tsx` | JSON inspector/export for the currently assembled workflow. |
| `WorkflowCreator.tsx` | Wizard for seeding new workflows from templates. |
| `WorkflowPhaseEditor.tsx` | Advanced phase/round editor for structured panels. |
| `TaskLibrary.tsx` | Catalog of predefined tasks (search PubMed, FDA, etc.). |
| `TaskNode.tsx`, `NodePalette.tsx`, `NodePropertiesPanel.tsx` | Custom node rendering, palette, and property inspector for ReactFlow. |
| `TaskBuilder.tsx`, `TaskCombiner.tsx` | UI for creating/editing reusable tasks. |
| `TaskFlowModal.tsx`, `DrillDownFlowDiagram.tsx` | Auxiliary views for step-by-step flows and visual explanations. |
| `AIChatbot.tsx` | Chat surface that renders streamed moderator/expert messages. |
| `ai/*` | Presentational subcomponents (messages, phase status, prompt input, reasoning cards, evidence sources, etc.). |
| `panel-workflows/*` | Factories, definitions, and graph builders for open vs. structured panel presets. |
| `ui/*` | Local copy of shadcn-based primitives used by the builder. |
| `MultiSelect.tsx`, `MultiSelect.css`, `vital-styles.css` | Styling helpers unique to the LangGraph GUI. |
| `WorkflowBuilder-full.tsx.tmp` | Snapshot of an earlier builder variant (kept for reference). |

---

### 2. Frontend Libraries (`apps/digital-health-startup/src/lib/langgraph-gui/`)

| Path | Purpose |
| --- | --- |
| `config/api.ts` | Centralized API endpoint builder (`/api/langgraph-gui` by default) with runtime overrides. |
| `expertIdentity.ts` | Seeds moderator/expert personas for panel simulations. |
| `taskHierarchy.ts` | Defines task categories & relationships for palette organization. |
| `workflowLayout.ts` | Auto-layout utilities for arranging ReactFlow nodes. |

---

### 3. Next.js API Proxy & Pages

| Path | Purpose |
| --- | --- |
| `src/app/api/langgraph-gui/[...route]/route.ts` | Catch-all route that forwards GET/POST/PUT/DELETE to the AI Engine (`AI_ENGINE_URL`). Handles SSE passthrough. |
| `src/app/(app)/ask-panel-v1/page.tsx` | Example page that mounts the LangGraph GUI experience. |

---

### 4. API Gateway (Node.js Express)

| Path | Purpose |
| --- | --- |
| `services/api-gateway/src/index.js` | Adds `app.all('/api/langgraph-gui/*', ...)` proxy with tenant awareness, timeout handling, and SSE piping. |

---

### 5. Python AI Engine (`services/ai-engine/`)

| Path | Purpose |
| --- | --- |
| `src/api/main.py` | Imports `WorkflowStorage`, `PharmaIntelligenceIntegration`, and `init_langgraph_routes` to register `/api/langgraph-gui` endpoints. |
| `src/langgraph_gui/api/*` | FastAPI routers (`routes.py`, `panels.py`, `integration_router.py`, etc.) that expose panels, workflows, and execution endpoints. |
| `src/langgraph_gui/engine/*` | Core executor + validator for workflow graphs. |
| `src/langgraph_gui/integration/*` | Panel task definitions, pharma workflows, and node implementations. |
| `src/langgraph_gui/panels/*` | Panel templates (structured, open, flexible) plus registries/executors. |
| `src/langgraph_gui/nodes/*` | Base node objects and registry hooks. |
| `src/langgraph_gui/storage/*` | File-based persistence for workflow JSON (respects `LANGGRAPH_GUI_WORKFLOWS_PATH`). |
| `src/langgraph_gui/templates/*` | Default workflow definitions bundled with the engine. |
| `src/langgraph_gui/pharma_intelligence/*` | Agents, tools, cache, and RAG helpers used by default templates. |
| `workflows/.gitkeep` | Ensures the workflows directory exists (mounted into the container for persistence). |

---

### 6. Documentation & Supporting Files

| Path | Purpose |
| --- | --- |
| `docs/langgraph-gui/README.md` | Overview, architecture, and setup guide (this repo addition). |
| `docs/langgraph-gui/project-structure.md` | You are here. |
| `docs/langgraph-gui-integration.md` | Legacy but detailed narrative doc covering architecture, env vars, and troubleshooting. |
| `apps/digital-health-startup/tailwind.config.ts` | Registers LangGraph GUI design tokens/classes used in `vital-styles.css`. |

Use this map together with the README to quickly locate the relevant code paths when extending LangGraph GUI functionality.

