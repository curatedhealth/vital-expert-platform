# 🚀 QUICK START: Knowledge Graph Backend

## ✅ The Problem Was Fixed!

I just created the missing file:
- **File:** `services/ai-engine/src/api/routes/knowledge_graph.py`
- **Status:** ✅ Created with mock data for testing

## 🎯 How to Start the Backend (Step-by-Step)

### 1. Open Terminal and Navigate to AI Engine Directory

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"
```

**Important:** You MUST be in the `services/ai-engine` directory, not the root!

### 2. Activate Virtual Environment

```bash
source venv/bin/activate
```

You should see `(venv)` appear in your terminal prompt.

### 3. Start the Server

```bash
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Look for This Success Message

```
✅ Knowledge Graph routes registered (Neo4j + Pinecone + Supabase)
```

If you see this line, the Knowledge Graph API is ready! 🎉

## 🧪 Test the API

Open a **NEW terminal** (keep the server running) and run:

```bash
# Test 1: Health check
curl http://localhost:8000/v1/knowledge-graph/health

# Test 2: Get agent stats
curl http://localhost:8000/v1/agents/00000000-0000-0000-0000-000000000000/knowledge-graph/stats

# Test 3: Query knowledge graph
curl -X POST http://localhost:8000/v1/agents/00000000-0000-0000-0000-000000000000/knowledge-graph/query \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "00000000-0000-0000-0000-000000000000",
    "search_mode": "hybrid",
    "max_hops": 2,
    "limit": 50
  }'
```

## 📊 Expected Output

### Health Check Response:
```json
{
  "status": "ok",
  "service": "knowledge-graph",
  "mode": "mock",
  "timestamp": "2025-11-23T23:00:00.000000",
  "message": "Knowledge Graph API is operational (using mock data)"
}
```

### Stats Response:
```json
{
  "agent_id": "00000000-0000-0000-0000-000000000000",
  "node_count": 5,
  "edge_count": 5,
  "node_types": {
    "Agent": 1,
    "Skill": 2,
    "Tool": 1,
    "Knowledge": 1
  },
  "edge_types": {
    "HAS_SKILL": 2,
    "USES_TOOL": 1,
    "KNOWS": 1,
    "REQUIRES": 1
  }
}
```

## 🌐 View in Browser

Once the backend is running:

1. **Open:** `http://localhost:3000/agents`
2. **Click:** Grid or List tab
3. **Select:** Any agent
4. **Click:** Knowledge Graph tab
5. **See:** Interactive graph visualization! 🎉

## ⚠️ Common Issues

### Issue: "command not found: python"
**Solution:** You're in the wrong directory!
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"
```

### Issue: "No such file or directory: src/main.py"
**Solution:** You're still in the wrong directory!
```bash
pwd  # Should show: /Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine
```

### Issue: Server crashes immediately
**Solution:** Check for port conflicts
```bash
lsof -ti:8000 | xargs kill -9
```

### Issue: "✅ Knowledge Graph routes registered" NOT showing
**Solution:** The file was missing. I just created it! Restart the server.

## 📁 What I Created

### New File: `knowledge_graph.py`
Location: `services/ai-engine/src/api/routes/knowledge_graph.py`

**Features:**
- ✅ 3 endpoints: query, stats, neighbors
- ✅ Mock data for testing (no database required)
- ✅ Full Pydantic models
- ✅ Error handling
- ✅ Structured logging

**Endpoints:**
1. `POST /v1/agents/{agent_id}/knowledge-graph/query` - Query the graph
2. `GET /v1/agents/{agent_id}/knowledge-graph/stats` - Get statistics
3. `GET /v1/agents/{agent_id}/knowledge-graph/neighbors` - Get neighbors
4. `GET /v1/knowledge-graph/health` - Health check

## 🎊 Success Criteria

✅ Server starts without errors
✅ You see "Knowledge Graph routes registered"
✅ Health check returns 200 OK
✅ Stats endpoint returns JSON with 5 nodes
✅ Frontend shows Knowledge Graph tab
✅ Clicking agent shows interactive graph

## 🚀 Ready to Go!

Just run these 3 commands:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"
source venv/bin/activate
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Look for:** ✅ Knowledge Graph routes registered

Then open your browser to `http://localhost:3000/agents` and enjoy! 🎉

---

**Status:** ✅ Complete - File Created - Ready to Run
**Created:** November 24, 2025, 12:00 AM


