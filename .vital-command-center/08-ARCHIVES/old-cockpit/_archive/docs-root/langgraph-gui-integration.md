# LangGraph GUI Integration

This document describes the LangGraph GUI integration across the VITAL platform's backend, frontend, and engine components.

## Architecture Overview

The LangGraph GUI is integrated across three main components:

1. **Backend (Python AI Engine)**: Custom LangGraph GUI implementation in `services/ai-engine/src/langgraph_gui/`
2. **API Gateway (Node.js)**: Proxy routes to forward LangGraph GUI requests to the AI Engine
3. **Frontend (Next.js)**: React components and API proxy routes for the workflow builder UI

## Request Flow

```
Frontend (Next.js)
    ↓
/api/langgraph-gui/* (Next.js API Route)
    ↓
AI Engine (Python FastAPI)
    OR
API Gateway (Node.js)
    ↓
/api/langgraph-gui/* (API Gateway Proxy)
    ↓
AI Engine (Python FastAPI)
```

## Components

### 1. Backend (Python AI Engine)

**Location**: `services/ai-engine/src/langgraph_gui/`

**Key Files**:
- `api/routes.py`: Main API routes for workflow management
- `api/panels.py`: Panel execution endpoints
- `storage/file_storage.py`: Workflow persistence
- `engine/executor.py`: Workflow execution engine
- `integration/pharma_intelligence.py`: Pharma Intelligence integration

**Endpoints**:
- `GET /api/langgraph-gui/workflows` - List all workflows
- `GET /api/langgraph-gui/workflows/{id}` - Get workflow by ID
- `POST /api/langgraph-gui/workflows` - Create workflow
- `PUT /api/langgraph-gui/workflows/{id}` - Update workflow
- `DELETE /api/langgraph-gui/workflows/{id}` - Delete workflow
- `POST /api/langgraph-gui/workflows/{id}/execute` - Execute workflow
- `POST /api/langgraph-gui/execute` - Execute Pharma Intelligence research
- `GET /api/langgraph-gui/panels/types` - Get panel types
- `GET /api/langgraph-gui/panels/schema/{type}` - Get panel schema
- `POST /api/langgraph-gui/panels/execute` - Execute panel workflow

**Configuration**:
- Workflows are stored in `services/ai-engine/workflows/` directory
- Environment variable: `LANGGRAPH_GUI_WORKFLOWS_PATH` (default: `./workflows`)

### 2. API Gateway (Node.js)

**Location**: `services/api-gateway/src/index.js`

**Route**: `app.all('/api/langgraph-gui/*', ...)`

**Features**:
- Proxies all HTTP methods (GET, POST, PUT, DELETE, etc.)
- Handles streaming responses (Server-Sent Events)
- Forwards tenant ID headers
- 5-minute timeout for long-running workflow executions
- Error handling and logging

### 3. Frontend (Next.js)

**Location**: `apps/digital-health-startup/src/`

**Key Files**:
- `app/api/langgraph-gui/[...route]/route.ts`: API proxy route
- `components/langgraph-gui/WorkflowBuilder.tsx`: Main workflow builder component
- `lib/langgraph-gui/config/api.ts`: API configuration

**API Base URL**: `/api/langgraph-gui` (proxies to AI Engine)

**Features**:
- Visual workflow builder with drag-and-drop interface
- Real-time workflow execution with streaming
- Panel workflow support
- Workflow import/export

## Environment Variables

### AI Engine
```bash
LANGGRAPH_GUI_WORKFLOWS_PATH=/app/workflows  # Path to workflows directory
```

### Frontend
```bash
AI_ENGINE_URL=http://localhost:8000  # AI Engine URL for direct connection
NEXT_PUBLIC_LANGGRAPH_GUI_API_URL=/api/langgraph-gui  # Optional: override API base URL
```

### API Gateway
```bash
AI_ENGINE_URL=http://python-ai-engine:8000  # AI Engine URL (Docker) or http://localhost:8000 (local)
```

## Docker Configuration

The `docker-compose.yml` includes:
- Volume mount for workflows directory: `./services/ai-engine/workflows:/app/workflows`
- Environment variable: `LANGGRAPH_GUI_WORKFLOWS_PATH=/app/workflows`

## Usage

### Accessing the UI

1. Start all services:
   ```bash
   docker-compose up
   ```

2. Navigate to the workflow builder:
   - Frontend: `http://localhost:3000/ask-panel-v1`
   - Or use the API directly: `http://localhost:8000/api/langgraph-gui/workflows`

### Creating a Workflow

1. Use the visual workflow builder in the frontend
2. Or use the API directly:
   ```bash
   curl -X POST http://localhost:8000/api/langgraph-gui/workflows \
     -H "Content-Type: application/json" \
     -d '{
       "name": "My Workflow",
       "description": "A test workflow",
       "nodes": [],
       "edges": []
     }'
   ```

### Executing a Workflow

```bash
curl -X POST http://localhost:8000/api/langgraph-gui/workflows/{id}/execute \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {
      "query": "What is the mechanism of action of aspirin?"
    }
  }'
```

## Testing

### Health Check
```bash
curl http://localhost:8000/api/langgraph-gui/health
```

### List Workflows
```bash
curl http://localhost:8000/api/langgraph-gui/workflows
```

### Test Import
```bash
curl http://localhost:8000/api/langgraph-gui/test-import
```

## Troubleshooting

### Workflows Directory Not Found
- Ensure `services/ai-engine/workflows/` directory exists
- Check `LANGGRAPH_GUI_WORKFLOWS_PATH` environment variable

### API Gateway Not Routing
- Verify `AI_ENGINE_URL` is set correctly in API Gateway
- Check that the route `app.all('/api/langgraph-gui/*', ...)` is before the 404 handler

### Frontend Not Connecting
- Verify `AI_ENGINE_URL` is set in Next.js environment
- Check that the API proxy route exists at `app/api/langgraph-gui/[...route]/route.ts`
- Ensure CORS is configured correctly in the AI Engine

## Future Enhancements

- [ ] WebSocket support for real-time workflow updates
- [ ] Workflow versioning and history
- [ ] Workflow templates library
- [ ] Multi-user workflow collaboration
- [ ] Workflow scheduling and automation

