# Ask Panel Services - Running Guide

## Overview

The updated Ask Panel services include:
- **Frontend**: Next.js pages and components (`apps/vital-system/src/app/(app)/ask-panel/`)
- **Backend API**: FastAPI routes (`services/ai-engine/src/api/routes/ask_panel_streaming.py`)
- **Workflow**: LangGraph workflow (`services/ai-engine/src/langgraph_workflows/ask_panel_enhanced/`)
- **Config Service**: Panel configuration (`services/ai-engine/src/services/ask_panel_config.py`)

## 🚀 How to Run

### 1. Start the Backend (AI Engine)

The backend service runs on **port 8000** by default.

```bash
# Navigate to AI Engine directory
cd services/ai-engine

# Install dependencies (if not already done)
pip install -r requirements.txt

# Set required environment variables
export OPENAI_API_KEY=your_key
export SUPABASE_URL=your_url
export SUPABASE_SERVICE_ROLE_KEY=your_key
export PORT=8000

# Start the FastAPI server
python src/main.py

# OR use uvicorn directly
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

**Backend will be available at:** `http://localhost:8000`

### 2. Start the Frontend (Next.js)

The frontend runs on **port 3000** by default.

```bash
# Navigate to frontend directory
cd apps/vital-system

# Install dependencies (if not already done)
pnpm install

# Set environment variables
export AI_ENGINE_URL=http://localhost:8000
export NEXT_PUBLIC_SUPABASE_URL=your_url
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Start the development server
pnpm dev
```

**Frontend will be available at:** `http://localhost:3000`

## 📍 Access Points

### Frontend UI Pages

1. **Main Ask Panel Page**
   - URL: `http://localhost:3000/ask-panel`
   - File: `apps/vital-system/src/app/(app)/ask-panel/page.tsx`
   - Features: Browse templates, create panels, view saved panels

2. **Panel Detail Page**
   - URL: `http://localhost:3000/ask-panel/[slug]`
   - File: `apps/vital-system/src/app/(app)/ask-panel/[slug]/page.tsx`
   - Features: View and customize specific panel templates

### Backend API Endpoints

1. **Ask Panel Enhanced Streaming** (Primary endpoint)
   - **URL**: `POST http://localhost:8000/api/ask-panel-enhanced/stream`
   - **File**: `services/ai-engine/src/api/routes/ask_panel_streaming.py`
   - **Description**: Real-time streaming for multi-expert panel consultations
   - **Request Body**:
     ```json
     {
       "question": "Your question here",
       "template_slug": "panel-template-id",
       "selected_agent_ids": ["agent-id-1", "agent-id-2"],
       "tenant_id": "tenant-uuid",
       "panel_type": "structured" // or "debate", "consensus"
     }
     ```
   - **Response**: Server-Sent Events (SSE) stream

2. **Legacy Panel Routes** (Still available)
   - **URL**: `POST http://localhost:8000/api/v1/panels/`
   - **File**: `services/ai-engine/src/api/routes/panels.py`
   - **Description**: REST API for panel management

### Frontend API Proxy Routes

1. **Ask Panel Enhanced Stream Proxy**
   - **URL**: `POST http://localhost:3000/api/ask-panel-enhanced/stream`
   - **File**: `apps/vital-system/src/app/api/ask-panel-enhanced/stream/route.ts`
   - **Description**: Next.js API route that proxies to backend
   - **Fallback**: If backend is unavailable, falls back to OpenAI directly

2. **Ask Panel Consultation**
   - **URL**: `POST http://localhost:3000/api/ask-panel/consult`
   - **File**: `apps/vital-system/src/app/api/ask-panel/consult/route.ts`
   - **Description**: Alternative consultation endpoint

## 🔧 Configuration

### Environment Variables

**Backend (AI Engine):**
```bash
# Required
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional
PORT=8000
LOG_LEVEL=info
UTILITY_LLM_MODEL=gpt-4o-mini
UTILITY_LLM_TEMPERATURE=0.7
UTILITY_LLM_MAX_TOKENS=2000
```

**Frontend (Next.js):**
```bash
# Required
AI_ENGINE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional
OPENAI_API_KEY=sk-...  # For fallback mode
OPENAI_PANEL_MODEL=gpt-4o-mini
```

## 🧪 Testing the Services

### 1. Test Backend Health

```bash
curl http://localhost:8000/health
```

### 2. Test Ask Panel Enhanced Endpoint

```bash
curl -X POST http://localhost:8000/api/ask-panel-enhanced/stream \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the latest guidelines for diabetes treatment?",
    "template_slug": "clinical-advisory",
    "selected_agent_ids": ["agent-1", "agent-2"],
    "tenant_id": "your-tenant-id",
    "panel_type": "structured"
  }'
```

### 3. Test via Frontend UI

1. Navigate to `http://localhost:3000/ask-panel`
2. Browse available panel templates
3. Click "Run Panel" on any template
4. Enter your question
5. Select agents
6. Start consultation

## 📁 Key Files

### Backend Files
- `services/ai-engine/src/api/routes/ask_panel_streaming.py` - Streaming API endpoint
- `services/ai-engine/src/langgraph_workflows/ask_panel_enhanced/workflow.py` - Workflow logic
- `services/ai-engine/src/services/ask_panel_config.py` - Configuration service
- `services/ai-engine/src/api/routes/register.py` - Route registration (updated)

### Frontend Files
- `apps/vital-system/src/app/(app)/ask-panel/page.tsx` - Main panel page
- `apps/vital-system/src/app/(app)/ask-panel/[slug]/page.tsx` - Panel detail page
- `apps/vital-system/src/app/api/ask-panel-enhanced/stream/route.ts` - API proxy
- `apps/vital-system/src/features/ask-panel/components/PanelExecutionView.tsx` - Execution UI
- `apps/vital-system/src/components/ask-panel/StreamingPanelConsultation.tsx` - Streaming component

### Database Migrations
- `database/migrations/20251212_create_ask_panel_tables.sql` - Panel tables

## 🐛 Troubleshooting

### Backend not starting
- Check Python version (3.9+)
- Verify all dependencies installed: `pip install -r requirements.txt`
- Check environment variables are set
- Check port 8000 is not in use

### Frontend can't connect to backend
- Verify `AI_ENGINE_URL` is set correctly
- Check backend is running: `curl http://localhost:8000/health`
- Check CORS settings if accessing from different origin

### Streaming not working
- Verify SSE support in browser
- Check backend logs for errors
- Verify agent IDs exist in database
- Check tenant_id is valid

### Agents not found
- Run database migrations: `database/migrations/20251212_create_ask_panel_tables.sql`
- Seed agents in database
- Verify agent status is 'active'

## 📚 Additional Resources

- **Backend README**: `services/ai-engine/README.md`
- **Frontend Documentation**: Check component files for JSDoc comments
- **API Documentation**: Available at `http://localhost:8000/docs` (Swagger UI)

## ✅ Verification Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Database migrations applied
- [ ] Agents seeded in database
- [ ] Environment variables configured
- [ ] Can access `/ask-panel` page
- [ ] Can create/run a panel consultation
- [ ] Streaming events received in UI
