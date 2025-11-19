## LangGraph GUI Integration

This document explains how the LangGraph GUI is wired through the VITAL stack—from the React workflow builder, through the API proxies, down to the Python AI Engine that executes panel workflows.

---

### What LangGraph GUI Does

- Provides a **visual workflow builder** (`WorkflowBuilder`) that lets users assemble multi‑expert panel flows with drag‑and‑drop tasks, AI chat assistance, and live phase tracking.
- Stores compiled workflow JSON in the AI Engine (`services/ai-engine/workflows`) so the backend can re‑run or export repeatable panel sessions.
- Streams execution results (SSE) back into the builder’s **AIChatbot** for realtime moderator/expert dialog.

---

### High-Level Architecture

1. **Frontend (Next.js)**
   - Component entry point: `apps/digital-health-startup/src/components/langgraph-gui/WorkflowBuilder.tsx`
   - Helper libs: `src/lib/langgraph-gui/*` provide layout, identity, and API helpers.
   - API proxy: `apps/digital-health-startup/src/app/api/langgraph-gui/[...route]/route.ts` forwards browser calls to the AI Engine.

2. **API Gateway (Node.js Express)**
   - `services/api-gateway/src/index.js` exposes `ALL /api/langgraph-gui/*` and pipes requests to the AI Engine for multi-tenant deployments or when the frontend calls the gateway instead of Next.js directly.

3. **AI Engine (FastAPI/Uvicorn)**
   - LangGraph package lives in `services/ai-engine/src/langgraph_gui/`.
   - Routes are registered inside `services/ai-engine/src/api/main.py` via `init_langgraph_routes(...)`, exposing `/api/langgraph-gui/...`.
   - Workflows persist under `services/ai-engine/workflows` (mounted in Docker via `LANGGRAPH_GUI_WORKFLOWS_PATH`).

4. **Documentation**
   - `docs/langgraph-gui-integration.md` offers a deep dive and troubleshooting tips.

---

### Request Flow

```text
WorkflowBuilder (React) 
   ⤷ fetch /api/langgraph-gui/... (Next.js proxy)
        ⤷ forwards to AI_ENGINE_URL/api/langgraph-gui/... (FastAPI)
            ⤷ executes via langgraph_gui modules
            ⤷ streams results (SSE) back to WorkflowBuilder
```

When the standalone API Gateway is used (Docker or multi-service deployments), the flow is identical except the browser calls `http://gateway:3001/api/langgraph-gui/...` which in turn proxies to the AI Engine.

---

### Configuration & Environment Variables

| Variable | Location | Purpose |
| --- | --- | --- |
| `AI_ENGINE_URL` | `.env` for Next.js & API gateway | Points the proxy to the Python service (`http://localhost:8000` by default). |
| `LANGGRAPH_GUI_WORKFLOWS_PATH` | AI Engine env or `docker-compose.yml` | Directory used for persisting workflow JSON (`./services/ai-engine/workflows`). |
| `NEXT_PUBLIC_LANGGRAPH_GUI_API_URL` (optional) | Frontend `.env` | Overrides the default `/api/langgraph-gui` path if the builder needs to hit a remote gateway directly. |
| `OPENAI_API_KEY`, `PINECONE_API_KEY`, etc. | AI Engine / WorkflowBuilder inputs | Required for actual panel execution. |

> **Tip:** When running locally without Docker, make sure to export `PYTHONPATH="${PWD}/src"` before launching `uvicorn` so the `langgraph_gui` package resolves correctly.

---

### Running the Stack Locally

```bash
# 1. Python AI Engine (FastAPI)
cd services/ai-engine
source venv/bin/activate
export PYTHONPATH="${PWD}/src:${PYTHONPATH}"
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

# 2. Node API Gateway (optional for local dev)
cd services/api-gateway
PORT=3001 node src/index.js

# 3. Next.js Frontend
cd /Users/amine/Desktop/vital
pnpm --filter @vital/digital-health-startup dev
```

Visit `http://localhost:3000/ask-panel-v1` (or any page that mounts `WorkflowBuilder`) to design and execute workflows.

---

### Key Features Inside `WorkflowBuilder`

- **Task Library & Custom Tasks**: `TaskLibrary.tsx`, `TaskBuilder.tsx`, and `TaskCombiner.tsx` let users create or combine mission templates.
- **Panel Workflow Presets**: `panel-workflows/` generates structured vs. open panels with helper factories.
- **AI Chat Companion**: `AIChatbot.tsx` plus `components/langgraph-gui/ai/*` handle conversation rendering, reasoning traces, and evidence links.
- **Auto Layout**: `workflowLayout.ts` arranges nodes and edges for readability.
- **Expert Identity**: `expertIdentity.ts` seeds panel participants and display metadata.

---

### Troubleshooting Checklist

1. **`Failed to fetch` in builder**
   - Verify `AI_ENGINE_URL` is reachable.
   - Check `services/ai-engine/logs` for exceptions (missing API keys).

2. **`Unexpected token` during login/workflow save**
   - Ensure Next.js dev server was restarted after editing `.env`.

3. **No workflows persisted**
   - Confirm the AI Engine logs mention `✓ LangGraph GUI initialized (workflows: /app/workflows)` and the host path `services/ai-engine/workflows` exists (Docker volume or local folder with `.gitkeep`).

For deeper debugging, refer to `docs/langgraph-gui-integration.md` or inspect the files listed in `project-structure.md`.

