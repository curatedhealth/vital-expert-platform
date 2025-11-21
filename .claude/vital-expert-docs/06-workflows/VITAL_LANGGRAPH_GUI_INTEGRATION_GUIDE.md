# VITAL LangGraph GUI Integration Guide

**Version**: 1.0
**Created**: 2025-11-19
**Category**: Workflows & Orchestration
**Status**: Production

---

## 📋 Executive Summary

The **LangGraph GUI** is VITAL Platform's visual workflow builder that enables users to design, execute, and manage multi-expert panel workflows through an intuitive drag-and-drop interface. It integrates seamlessly across the entire stack—from React frontend through API proxies to the Python AI Engine—providing real-time workflow execution with streaming results.

### Key Capabilities
- ✅ Visual workflow builder with drag-and-drop interface
- ✅ Real-time execution with Server-Sent Events (SSE) streaming
- ✅ Multi-expert panel orchestration (Ask Panel service)
- ✅ Workflow persistence and reusability
- ✅ AI chat companion for workflow guidance
- ✅ Expert identity management and panel composition

---

## 🏗️ Architecture Overview

### Three-Tier Integration

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Next.js)                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ WorkflowBuilder.tsx                                     │ │
│ │ - Task Library & Custom Tasks                           │ │
│ │ - Panel Workflow Presets                                │ │
│ │ - AI Chat Companion                                     │ │
│ │ - Auto Layout & Expert Identity                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                          ↓                                  │
│ /api/langgraph-gui/[...route] (Next.js API Proxy)          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ API GATEWAY (Node.js Express) [Optional]                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ app.all('/api/langgraph-gui/*', proxy)                  │ │
│ │ - Request forwarding                                    │ │
│ │ - SSE streaming support                                 │ │
│ │ - Multi-tenant routing                                  │ │
│ │ - 5-minute timeout for long executions                  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ AI ENGINE (Python FastAPI)                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ services/ai-engine/src/langgraph_gui/                   │ │
│ │ ├── api/routes.py (workflow management)                 │ │
│ │ ├── api/panels.py (panel execution)                     │ │
│ │ ├── storage/file_storage.py (persistence)               │ │
│ │ ├── engine/executor.py (execution engine)               │ │
│ │ └── integration/pharma_intelligence.py                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Workflows stored in: services/ai-engine/workflows/          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 What LangGraph GUI Does

### Core Functionality

1. **Visual Workflow Design**
   - Drag-and-drop interface for assembling multi-expert panel flows
   - Task library with pre-built mission templates
   - Custom task creation and combination
   - Auto-layout for node positioning

2. **Workflow Execution**
   - Real-time panel orchestration
   - Streaming results via Server-Sent Events (SSE)
   - Live phase tracking and progress updates
   - Expert dialog and moderation

3. **Workflow Persistence**
   - Stores compiled workflow JSON in AI Engine
   - Reusable workflow templates
   - Import/export capabilities
   - Version control ready

4. **AI Assistance**
   - AI chatbot for workflow guidance
   - Conversation rendering with reasoning traces
   - Evidence links and source citations
   - Interactive panel moderation

---

## 📁 Project Structure

### Frontend (Next.js)

**Location**: `apps/digital-health-startup/src/`

```
src/
├── components/langgraph-gui/
│   ├── WorkflowBuilder.tsx              # Main workflow builder component
│   ├── TaskLibrary.tsx                  # Pre-built task templates
│   ├── TaskBuilder.tsx                  # Custom task creation
│   ├── TaskCombiner.tsx                 # Task combination logic
│   ├── AIChatbot.tsx                    # AI chat companion
│   ├── ai/                              # AI conversation components
│   └── panel-workflows/                 # Panel workflow presets
│
├── lib/langgraph-gui/
│   ├── config/api.ts                    # API configuration
│   ├── workflowLayout.ts                # Auto-layout logic
│   └── expertIdentity.ts                # Expert metadata & identity
│
└── app/api/langgraph-gui/
    └── [...route]/route.ts              # API proxy route (forwards to AI Engine)
```

### API Gateway (Node.js)

**Location**: `services/api-gateway/src/index.js`

```javascript
// Proxy route for LangGraph GUI
app.all('/api/langgraph-gui/*', async (req, res) => {
  // Forwards all HTTP methods to AI Engine
  // Handles SSE streaming
  // 5-minute timeout for long executions
});
```

### AI Engine (Python FastAPI)

**Location**: `services/ai-engine/src/langgraph_gui/`

```
langgraph_gui/
├── api/
│   ├── routes.py                        # Workflow CRUD endpoints
│   └── panels.py                        # Panel execution endpoints
│
├── storage/
│   └── file_storage.py                  # Workflow persistence (JSON)
│
├── engine/
│   └── executor.py                      # Workflow execution engine
│
└── integration/
    └── pharma_intelligence.py           # Pharma Intelligence integration
```

---

## 🔌 API Endpoints

### Workflow Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/langgraph-gui/workflows` | List all workflows |
| GET | `/api/langgraph-gui/workflows/{id}` | Get workflow by ID |
| POST | `/api/langgraph-gui/workflows` | Create new workflow |
| PUT | `/api/langgraph-gui/workflows/{id}` | Update workflow |
| DELETE | `/api/langgraph-gui/workflows/{id}` | Delete workflow |
| POST | `/api/langgraph-gui/workflows/{id}/execute` | Execute workflow |

### Panel Workflows

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/langgraph-gui/execute` | Execute Pharma Intelligence research |
| GET | `/api/langgraph-gui/panels/types` | Get panel types |
| GET | `/api/langgraph-gui/panels/schema/{type}` | Get panel schema |
| POST | `/api/langgraph-gui/panels/execute` | Execute panel workflow |

### Health & Testing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/langgraph-gui/health` | Health check |
| GET | `/api/langgraph-gui/test-import` | Test import functionality |

---

## ⚙️ Configuration

### Environment Variables

#### AI Engine (Python)
```bash
# Workflow storage path
LANGGRAPH_GUI_WORKFLOWS_PATH=/app/workflows

# AI provider keys
OPENAI_API_KEY=your-openai-key
PINECONE_API_KEY=your-pinecone-key
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-key
```

#### Frontend (Next.js)
```bash
# AI Engine connection
AI_ENGINE_URL=http://localhost:8000

# Optional: Override API base URL
NEXT_PUBLIC_LANGGRAPH_GUI_API_URL=/api/langgraph-gui
```

#### API Gateway (Node.js)
```bash
# AI Engine connection (Docker)
AI_ENGINE_URL=http://python-ai-engine:8000

# Or local development
AI_ENGINE_URL=http://localhost:8000
```

### Docker Configuration

**File**: `docker-compose.yml`

```yaml
python-ai-engine:
  environment:
    - LANGGRAPH_GUI_WORKFLOWS_PATH=/app/workflows
  volumes:
    - ./services/ai-engine/workflows:/app/workflows
```

---

## 🚀 Running the Stack

### Option 1: Docker Compose (Recommended)

```bash
# Start all services (requires Docker Desktop or OrbStack)
cd /Users/amine/desktop/vital
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access Points**:
- Frontend: http://localhost:3000/ask-panel-v1
- AI Engine API: http://localhost:8000/api/langgraph-gui/workflows
- API Gateway: http://localhost:3001/api/langgraph-gui/workflows

### Option 2: Local Development (No Docker)

**Terminal 1: Python AI Engine**
```bash
cd services/ai-engine
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set Python path for module resolution
export PYTHONPATH="${PWD}/src:${PYTHONPATH}"

# Start FastAPI server
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2: API Gateway (Optional)**
```bash
cd services/api-gateway
npm install
PORT=3001 node src/index.js
```

**Terminal 3: Next.js Frontend**
```bash
cd /Users/amine/desktop/vital
pnpm install
pnpm --filter @vital/digital-health-startup dev
```

**Access**:
- Frontend: http://localhost:3000/ask-panel-v1
- AI Engine: http://localhost:8000/docs (FastAPI Swagger docs)

---

## 💡 Usage Examples

### Creating a Workflow (API)

```bash
curl -X POST http://localhost:8000/api/langgraph-gui/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Clinical Trial Analysis Panel",
    "description": "Multi-expert panel for trial protocol review",
    "nodes": [
      {
        "id": "expert-1",
        "type": "expert",
        "data": {
          "persona_id": "clinical-trial-designer",
          "mission": "Review trial protocol for scientific validity"
        }
      }
    ],
    "edges": []
  }'
```

### Executing a Workflow (API)

```bash
curl -X POST http://localhost:8000/api/langgraph-gui/workflows/{workflow-id}/execute \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {
      "query": "Evaluate the Phase III trial design for oncology drug XYZ",
      "context": {
        "indication": "Non-small cell lung cancer",
        "patient_population": "First-line treatment, PD-L1 positive"
      }
    }
  }'
```

### Using the Visual Builder (Frontend)

1. Navigate to http://localhost:3000/ask-panel-v1
2. Click "New Workflow" in the WorkflowBuilder
3. Drag tasks from the Task Library
4. Configure expert identities and missions
5. Connect nodes to define execution flow
6. Click "Execute" to run the panel
7. View streaming results in the AI Chat companion

---

## 🎨 Key Features

### 1. Task Library & Custom Tasks

**Components**:
- `TaskLibrary.tsx` - Pre-built mission templates
- `TaskBuilder.tsx` - Custom task creation interface
- `TaskCombiner.tsx` - Combine multiple tasks into complex workflows

**Usage**:
```typescript
import { TaskLibrary } from '@/components/langgraph-gui/TaskLibrary';

// Pre-built tasks for common scenarios
const tasks = [
  { id: 'clinical-review', name: 'Clinical Trial Review', template: '...' },
  { id: 'safety-analysis', name: 'Safety Analysis', template: '...' },
  { id: 'regulatory-assessment', name: 'Regulatory Assessment', template: '...' }
];
```

### 2. Panel Workflow Presets

**Location**: `src/components/langgraph-gui/panel-workflows/`

**Types**:
- **Structured Panels** - Predefined expert roles and flow
- **Open Panels** - Dynamic expert selection based on query

**Factory Functions**:
```typescript
import { createStructuredPanel, createOpenPanel } from '@/lib/langgraph-gui/panel-workflows';

const clinicalPanel = createStructuredPanel({
  name: 'Clinical Expert Panel',
  experts: ['clinical-pharmacologist', 'oncologist', 'biostatistician'],
  moderator: 'clinical-trial-designer'
});
```

### 3. AI Chat Companion

**Component**: `AIChatbot.tsx`

**Features**:
- Conversation rendering with message threading
- Reasoning trace visualization
- Evidence links and source citations
- Real-time streaming support (SSE)
- Interactive moderation controls

### 4. Auto Layout

**Module**: `src/lib/langgraph-gui/workflowLayout.ts`

**Functionality**:
- Automatic node positioning using Dagre algorithm
- Hierarchical layout for complex workflows
- Edge routing with minimal crossings
- Responsive canvas scaling

### 5. Expert Identity Management

**Module**: `src/lib/langgraph-gui/expertIdentity.ts`

**Capabilities**:
- Expert metadata (name, title, expertise)
- Avatar assignment and display
- Role-based permissions
- Panel composition logic

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Failed to fetch" in Workflow Builder

**Symptoms**: Network errors when loading workflows

**Solutions**:
```bash
# Check AI Engine is running
curl http://localhost:8000/api/langgraph-gui/health

# Verify environment variable
echo $AI_ENGINE_URL  # Should be http://localhost:8000

# Check API proxy route exists
ls apps/digital-health-startup/src/app/api/langgraph-gui/[...route]/route.ts
```

#### 2. "Unexpected token" During Login/Workflow Save

**Symptoms**: JSON parse errors in browser console

**Solutions**:
```bash
# Restart Next.js dev server after .env changes
cd /Users/amine/desktop/vital
pnpm --filter @vital/digital-health-startup dev

# Clear browser cache and cookies
# Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

#### 3. No Workflows Persisted

**Symptoms**: Workflows don't save or disappear after restart

**Solutions**:
```bash
# Ensure workflows directory exists
mkdir -p services/ai-engine/workflows
touch services/ai-engine/workflows/.gitkeep

# Check Docker volume mount (if using Docker)
docker-compose down
docker-compose up -d
docker-compose logs python-ai-engine | grep "LangGraph GUI initialized"

# Should see: ✓ LangGraph GUI initialized (workflows: /app/workflows)
```

#### 4. API Gateway Not Routing

**Symptoms**: 404 errors when calling `/api/langgraph-gui/*`

**Solutions**:
```bash
# Verify route order in services/api-gateway/src/index.js
# LangGraph route MUST be before 404 handler

# Check AI_ENGINE_URL is set
cd services/api-gateway
echo $AI_ENGINE_URL  # Should be http://python-ai-engine:8000 (Docker)
                     # Or http://localhost:8000 (local)
```

#### 5. Streaming Not Working

**Symptoms**: Workflow execution freezes, no progress updates

**Solutions**:
```bash
# Verify SSE support in browser (check Network tab)
# Headers should include: Content-Type: text/event-stream

# Check API Gateway timeout (should be 5 minutes)
# services/api-gateway/src/index.js
# timeout: 300000  // 5 minutes

# Test direct connection to AI Engine
curl -N http://localhost:8000/api/langgraph-gui/workflows/{id}/execute \
  -H "Accept: text/event-stream"
```

### Debug Checklist

- [ ] AI Engine running (port 8000)
- [ ] API Gateway running (port 3001, if used)
- [ ] Next.js dev server running (port 3000)
- [ ] Environment variables set correctly
- [ ] Workflows directory exists with write permissions
- [ ] API keys configured (OpenAI, Pinecone, Supabase)
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows successful API calls

---

## 📊 Request Flow Details

### Workflow Creation Flow

```
User clicks "Create Workflow" in WorkflowBuilder
  ↓
WorkflowBuilder.tsx calls createWorkflow()
  ↓
fetch('/api/langgraph-gui/workflows', { method: 'POST', ... })
  ↓
Next.js API route: app/api/langgraph-gui/[...route]/route.ts
  ↓
Forwards to AI_ENGINE_URL/api/langgraph-gui/workflows
  ↓
FastAPI endpoint: langgraph_gui/api/routes.py → create_workflow()
  ↓
Saves to services/ai-engine/workflows/{id}.json
  ↓
Returns workflow metadata to frontend
  ↓
WorkflowBuilder updates UI with new workflow
```

### Workflow Execution Flow

```
User clicks "Execute" with inputs
  ↓
WorkflowBuilder.tsx calls executeWorkflow()
  ↓
fetch('/api/langgraph-gui/workflows/{id}/execute', { method: 'POST', ... })
  ↓
Next.js API route forwards to AI Engine
  ↓
FastAPI endpoint: langgraph_gui/api/routes.py → execute_workflow()
  ↓
Loads workflow JSON from storage
  ↓
langgraph_gui/engine/executor.py orchestrates execution
  ↓
Streams SSE events back through proxies
  ↓
WorkflowBuilder receives events via EventSource
  ↓
AIChatbot.tsx renders messages in real-time
  ↓
Final completion event marks workflow done
```

---

## 🔐 Security Considerations

### Authentication & Authorization

- **Multi-tenant isolation**: Tenant ID passed via headers
- **RLS policies**: Database-level tenant isolation (Supabase)
- **API key rotation**: Environment-based key management
- **CORS configuration**: Restricted origins in production

### Data Privacy

- **Workflow data**: Stored in tenant-specific directories
- **Execution logs**: Separate log files per tenant
- **HIPAA compliance**: No PHI in workflow metadata
- **Audit trail**: All workflow executions logged

---

## 📈 Performance Optimization

### Caching Strategy

- **Workflow templates**: Cached in Redis (5-minute TTL)
- **Expert metadata**: Cached in browser localStorage
- **API responses**: HTTP cache headers for static data

### Scaling Considerations

- **Horizontal scaling**: Multiple AI Engine instances behind load balancer
- **Workflow queue**: Redis-based job queue for long executions
- **Connection pooling**: Database connection reuse
- **Rate limiting**: Per-tenant API rate limits

---

## 🔄 Future Enhancements

### Planned Features

- [ ] **WebSocket support** - Real-time workflow collaboration
- [ ] **Workflow versioning** - Track changes and rollback
- [ ] **Template library** - Shareable workflow templates
- [ ] **Multi-user collaboration** - Simultaneous editing
- [ ] **Workflow scheduling** - Automated execution (cron-like)
- [ ] **Advanced analytics** - Execution metrics and insights
- [ ] **Export formats** - PDF reports, JSON exports
- [ ] **Visual debugging** - Step-through execution inspector

---

## 📚 Related Documentation

### Essential Reading

- **Workflow Architecture**: `.claude/vital-expert-docs/06-workflows/`
- **Ask Panel Service**: `.claude/vital-expert-docs/04-services/ask-panel/`
- **LangGraph Integration**: `.claude/vital-expert-docs/08-agents/LANGGRAPH_INTEGRATION_GUIDE.md`
- **API Documentation**: `.claude/vital-expert-docs/09-api/`

### Code References

- **Frontend Components**: `apps/digital-health-startup/src/components/langgraph-gui/`
- **API Proxy**: `apps/digital-health-startup/src/app/api/langgraph-gui/[...route]/route.ts`
- **Python Backend**: `services/ai-engine/src/langgraph_gui/`
- **Docker Config**: `docker-compose.yml`

---

## 🎯 Success Metrics

### Key Performance Indicators

| Metric | Target | Current |
|--------|--------|---------|
| Workflow creation time | <30 seconds | TBD |
| Execution latency (p95) | <5 seconds | TBD |
| Streaming event delivery | <100ms | TBD |
| Workflow persistence success rate | >99.9% | TBD |
| UI responsiveness (LCP) | <2.5s | TBD |

### Quality Metrics

- **Code coverage**: >80% (unit + integration tests)
- **API uptime**: >99.9%
- **Error rate**: <0.1%
- **User satisfaction**: >4.5/5

---

## 🏁 Getting Started Checklist

Before using LangGraph GUI, ensure:

- [ ] Docker Desktop or OrbStack installed (for Docker approach)
- [ ] Python 3.10+ installed (for local development)
- [ ] Node.js 18+ and pnpm installed
- [ ] Environment variables configured (.env.local)
- [ ] Supabase project created and configured
- [ ] OpenAI API key obtained
- [ ] Pinecone account created (for RAG)
- [ ] Workflows directory created: `services/ai-engine/workflows/`
- [ ] All dependencies installed (`pnpm install`, `pip install -r requirements.txt`)

---

**Last Updated**: 2025-11-19
**Maintained By**: VITAL Development Team
**Contact**: See project README for support channels
