# Phase 2 & 3 Deployment Guide

## 🚀 Complete Deployment Instructions for Long-Term Memory + Self-Continuation

**Date:** November 1, 2025  
**Phases:** 2 (Memory) + 3 (Self-Continuation)  
**Estimated Time:** 30 minutes

---

## ✅ WHAT YOU'RE DEPLOYING

### Phase 2: Long-Term Memory
- Semantic memory across sessions
- User preference recall
- Auto-extraction from conversations
- 768-dimensional vector search

### Phase 3: Self-Continuation
- Goal-based autonomous execution
- Budget/cost controls
- User stop capability
- Real-time monitoring

---

## 📋 PRE-DEPLOYMENT CHECKLIST

- [ ] Supabase project running
- [ ] Database migrations access (Supabase SQL Editor)
- [ ] Python environment active
- [ ] Railway/deployment platform access (if deploying)

---

## 🗄️ STEP 1: DATABASE MIGRATION

### Option A: Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your project
   - Navigate to: SQL Editor

2. **Run Migration**
   ```sql
   -- Copy and paste the contents of:
   -- database/sql/migrations/2025/20251101120000_session_memories.sql
   
   -- This will create:
   -- ✅ session_memories table
   -- ✅ Vector indexes (pgvector)
   -- ✅ RLS policies
   -- ✅ Search functions
   -- ✅ autonomous_control_state table
   ```

3. **Verify Migration**
   ```sql
   -- Check tables exist
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_name IN ('session_memories', 'autonomous_control_state');
   
   -- Should return 2 rows
   ```

### Option B: Supabase CLI

```bash
cd database/sql/migrations/2025
supabase db push 20251101120000_session_memories.sql
```

---

## 📦 STEP 2: INSTALL PYTHON DEPENDENCIES

```bash
cd services/ai-engine

# Activate your virtual environment first!
# source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate     # Windows

# Install new dependencies
pip install sentence-transformers==2.2.2
pip install faiss-cpu==1.7.4

# Verify installation
python -c "from sentence_transformers import SentenceTransformer; print('✅ sentence-transformers installed')"
```

**Expected output:**
```
✅ sentence-transformers installed
```

---

## 🔧 STEP 3: ENVIRONMENT VARIABLES

Ensure these are set in your `.env` file:

```bash
# Existing (required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-key

# Optional (Phase 2 & 3 configs)
MEMORY_CACHE_TTL=86400              # 24 hours
EMBEDDING_MODEL=all-mpnet-base-v2   # sentence-transformers model
AUTONOMOUS_COST_LIMIT=10.0          # Default $10 budget
AUTONOMOUS_RUNTIME_LIMIT=30         # Default 30 min
```

---

## 🧪 STEP 4: VERIFICATION TESTS

### Test 1: Database Schema

```sql
-- In Supabase SQL Editor
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'session_memories'
ORDER BY ordinal_position;
```

**Expected:** Should show columns including `content_embedding` (type: vector)

### Test 2: Python Services

```bash
cd services/ai-engine
python3 << 'EOF'
import asyncio
from services.embedding_service import EmbeddingService

async def test():
    service = EmbeddingService()
    result = await service.embed_text("Test memory")
    print(f"✅ Embedding generated: {len(result.embedding)} dimensions")
    assert len(result.embedding) == 768, "Wrong dimension!"
    print("✅ EmbeddingService working!")

asyncio.run(test())
EOF
```

**Expected output:**
```
✅ Embedding generated: 768 dimensions
✅ EmbeddingService working!
```

### Test 3: Memory Service (Mock)

```bash
python3 services/ai-engine/src/tests/test_phase2_memory.py
```

**Expected:** All tests pass (may show warnings about missing Supabase connection)

---

## 🚀 STEP 5: START THE SERVICE

### Local Development

```bash
cd services/ai-engine

# Start FastAPI
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Check logs for:**
```
✅ EmbeddingService initialized
✅ SessionMemoryService initialized
✅ AutonomousController ready
```

### Railway Deployment

```bash
# Ensure these are in railway.json or environment
railway up

# Or via GitHub (already pushed)
# Railway will auto-deploy from your branch
```

---

## 🧪 STEP 6: INTEGRATION TESTING

### Test A: Memory Storage

```bash
curl -X POST http://localhost:8000/api/mode1/manual \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "test-agent",
    "message": "I prefer GPT-4 for complex analysis",
    "enable_rag": true,
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Verify in Supabase:**
```sql
SELECT content, memory_type, importance
FROM session_memories
ORDER BY created_at DESC
LIMIT 5;
```

### Test B: Autonomous Execution

```bash
# Start autonomous execution (Mode 3)
curl -X POST http://localhost:8000/api/mode3/autonomous-automatic \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Create a brief FDA IND outline",
    "model": "gpt-4",
    "enable_rag": true,
    "enable_tools": true,
    "cost_limit_usd": 2.0,
    "runtime_limit_minutes": 5,
    "tenant_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Response includes:** `session_id` (save this!)

### Test C: Monitor Autonomous Execution

```bash
# Check status (replace with actual session_id)
curl http://localhost:8000/api/autonomous/status/mode3_abc123
```

**Expected response:**
```json
{
  "session_id": "mode3_abc123",
  "stop_requested": false,
  "current_cost_usd": 0.45,
  "cost_limit_usd": 2.0,
  "cost_remaining_usd": 1.55,
  "elapsed_minutes": 1.2,
  "runtime_limit_minutes": 5
}
```

### Test D: Stop Autonomous Execution

```bash
# Request stop
curl -X POST http://localhost:8000/api/autonomous/stop \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "mode3_abc123"
  }'
```

**Expected:**
```json
{
  "session_id": "mode3_abc123",
  "stop_requested": true,
  "message": "Stop request sent. Execution will halt after current iteration."
}
```

---

## 📊 STEP 7: MONITORING & OBSERVABILITY

### Database Queries

```sql
-- Memory usage by tenant
SELECT 
    tenant_id,
    COUNT(*) as memory_count,
    AVG(importance) as avg_importance
FROM session_memories
GROUP BY tenant_id;

-- Active autonomous sessions
SELECT 
    session_id,
    current_cost_usd,
    cost_limit_usd,
    stop_requested,
    started_at
FROM autonomous_control_state
WHERE expires_at > NOW();

-- Recent memory types
SELECT 
    memory_type,
    COUNT(*) as count
FROM session_memories
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY memory_type;
```

### Application Logs

```bash
# Watch for these log entries
tail -f services/ai-engine/logs/app.log | grep -E "Memory|Autonomous|Controller"

# Expected entries:
# ✅ SessionMemoryService initialized
# ✅ AutonomousController initialized
# ✅ Memory stored
# ✅ Memories recalled
# Autonomous decision: CONTINUE
```

---

## ✅ STEP 8: VERIFY COMPLETE DEPLOYMENT

Run this comprehensive check:

```sql
-- Comprehensive deployment verification
DO $$
DECLARE
    v_tables INT;
    v_functions INT;
    v_indexes INT;
BEGIN
    -- Check tables
    SELECT COUNT(*) INTO v_tables
    FROM information_schema.tables
    WHERE table_name IN ('session_memories', 'autonomous_control_state');
    
    -- Check functions
    SELECT COUNT(*) INTO v_functions
    FROM pg_proc
    WHERE proname IN ('search_memories_by_embedding', 'get_recent_memories');
    
    -- Check indexes
    SELECT COUNT(*) INTO v_indexes
    FROM pg_indexes
    WHERE tablename = 'session_memories';
    
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'DEPLOYMENT VERIFICATION';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'Tables: %/2 (%)', v_tables, 
        CASE WHEN v_tables = 2 THEN '✅ PASS' ELSE '❌ FAIL' END;
    RAISE NOTICE 'Functions: %/2 (%)', v_functions,
        CASE WHEN v_functions >= 2 THEN '✅ PASS' ELSE '❌ FAIL' END;
    RAISE NOTICE 'Indexes: % (%)', v_indexes,
        CASE WHEN v_indexes >= 2 THEN '✅ PASS' ELSE '❌ FAIL' END;
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    
    IF v_tables = 2 AND v_functions >= 2 AND v_indexes >= 2 THEN
        RAISE NOTICE '✅ PHASE 2 & 3 DEPLOYMENT SUCCESSFUL!';
    ELSE
        RAISE EXCEPTION '❌ DEPLOYMENT INCOMPLETE - Review migration';
    END IF;
END $$;
```

---

## 🎯 EXPECTED RESULTS

After successful deployment, you should have:

### Database
- ✅ 2 new tables created
- ✅ Vector indexes active
- ✅ RLS policies enforced
- ✅ Search functions available

### Python Services
- ✅ sentence-transformers loaded
- ✅ EmbeddingService operational
- ✅ SessionMemoryService running
- ✅ AutonomousController ready

### API Endpoints
- ✅ `/api/autonomous/stop` - Stop autonomous execution
- ✅ `/api/autonomous/status/{id}` - Monitor execution
- ✅ All Mode 1-4 endpoints with memory integration

### Features Enabled
- ✅ Cross-session memory recall
- ✅ Goal-based autonomous execution
- ✅ Budget/cost controls
- ✅ User intervention capability

---

## 🐛 TROUBLESHOOTING

### Issue: "Module 'sentence_transformers' not found"

**Solution:**
```bash
pip install --upgrade sentence-transformers==2.2.2
# On Mac M1/M2: May need additional setup
pip install torch torchvision torchaudio
```

### Issue: "Table 'session_memories' does not exist"

**Solution:**
```sql
-- Check if migration ran
SELECT * FROM pg_tables WHERE tablename = 'session_memories';

-- If empty, re-run migration:
\i database/sql/migrations/2025/20251101120000_session_memories.sql
```

### Issue: "Vector type not found"

**Solution:**
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### Issue: Autonomous execution doesn't stop

**Solution:**
```sql
-- Manually set stop flag
UPDATE autonomous_control_state
SET stop_requested = true
WHERE session_id = 'your-session-id';
```

---

## 📞 SUPPORT

If you encounter issues:

1. Check logs: `services/ai-engine/logs/app.log`
2. Verify database: Run verification SQL above
3. Test services: Run `test_phase2_memory.py`
4. Review commit: `bc042fa6` on GitHub

---

## 🎉 SUCCESS CRITERIA

✅ All database tables exist  
✅ Python dependencies installed  
✅ EmbeddingService generates 768-dim vectors  
✅ Memory can be stored and recalled  
✅ Autonomous execution can be started  
✅ Autonomous execution can be stopped  
✅ Status endpoint returns data  

**If all ✅ above → DEPLOYMENT SUCCESSFUL!** 🚀

---

## 📚 NEXT STEPS AFTER DEPLOYMENT

1. **Test with Real Users**
   - Run sample queries
   - Verify memory recall works
   - Test autonomous modes

2. **Monitor Performance**
   - Track embedding generation time
   - Monitor memory usage
   - Watch autonomous costs

3. **Optimize**
   - Adjust cache TTLs
   - Tune importance scoring
   - Refine progress heuristics

4. **Enhance (Optional)**
   - Add Phase 4: Real web tools
   - Add Phase 5: Code execution

---

**Deployment Time Estimate:** 30 minutes  
**Difficulty:** Medium  
**Risk Level:** Low (all backward compatible)

**Ready to deploy? Let's go! 🚀**

