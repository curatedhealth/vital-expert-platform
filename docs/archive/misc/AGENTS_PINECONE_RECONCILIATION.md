# 🤖 AGENTS: SUPABASE ↔ PINECONE RECONCILIATION

**Generated**: November 8, 2025  
**Focus**: Agent embeddings synchronization

---

## 📊 EXECUTIVE SUMMARY

### Current State

| System | Count | Status | Details |
|--------|-------|--------|---------|
| **Supabase** | 151 agents | ✅ Clean | All have titles, prompts, categories |
| **Notion** | 351 agents | ✅ Synced | Historical + current agents |
| **Pinecone** | Unknown | ⚠️ Needs Verification | `vital-knowledge` index, `agent` namespace |

### System Architecture

**Pinecone Index for Agents:**
- **Index Name**: `vital-knowledge` (configurable via `PINECONE_INDEX_NAME` or `PINECONE_AGENTS_INDEX_NAME`)
- **Namespace**: `agent` (singular)
- **Purpose**: Agent discovery via semantic search (GraphRAG)
- **Embedding Model**: OpenAI `text-embedding-3-large`
- **Vector Dimension**: 3072 (for text-embedding-3-large)

---

## 🗄️ SUPABASE AGENT DATA

### Agent Table Analysis

```sql
-- Current Supabase state:
Total Agents: 151
├─ With Titles: 151 (100%) ✅
├─ With System Prompts: 151 (100%) ✅
├─ With Categories: 151 (100%) ✅
└─ Active: ~150 (99%)
```

### Agent Fields Used for Embeddings

Based on `sync_agents_to_pinecone.py`, the following fields are embedded:

| Field | Purpose | Status |
|-------|---------|--------|
| `title` | Agent name/title | ✅ All agents have this |
| `description` | Brief description | ⚠️ May be NULL for some |
| `system_prompt` | Core expertise (1000 chars) | ✅ All agents have this |
| `capabilities` (array) | List of capabilities | ⚠️ May be empty array |
| `expertise` (array) | Expertise areas | ⚠️ May be empty array |
| `specialties` (array) | Specific specialties | ⚠️ May be empty array |
| `background` | Agent background | ⚠️ Optional field |
| `personality_traits` (array) | Personality | ⚠️ Optional field |
| `communication_style` | Communication style | ⚠️ Optional field |

### Sample Agents (Recent)

```
1. Citation & Attribution Specialist
   - Category: universal_task_subagent
   - Model: gpt-4o-mini
   - Prompt Length: 168 chars

2. RAG Retrieval Specialist
   - Category: universal_task_subagent
   - Model: gpt-4o-mini
   - Prompt Length: 180 chars

3. Document Synthesis Specialist
   - Category: universal_task_subagent
   - Model: claude-sonnet-4
   - Prompt Length: 188 chars

4. Web Research Specialist
   - Category: universal_task_subagent
   - Model: gpt-4o-mini
   - Prompt Length: 207 chars

5. Quality Assurance Specialist
   - Category: universal_task_subagent
   - Model: claude-sonnet-4
   - Prompt Length: 162 chars
```

---

## 📡 PINECONE INTEGRATION

### Index Configuration

**Primary Index: `vital-knowledge`**
- **Purpose**: Agent semantic search for GraphRAG routing
- **Namespace**: `agent` (singular, as per code)
- **Environment Variables**:
  ```bash
  PINECONE_API_KEY=<required>
  PINECONE_INDEX_NAME=vital-knowledge  # Default
  # OR
  PINECONE_AGENTS_INDEX_NAME=vital-knowledge  # Alternative
  ```

### How Agents Are Embedded

#### 1. **Profile Text Generation**

The system builds a comprehensive profile text for each agent:

```python
# Example profile text format:
Agent Name: Web Research Specialist
Title: Web Research Specialist
Description: Searches the web for latest news...
Expertise: You are a web research specialist focused on finding current information...
Capabilities: web_search, source_verification, synthesis
Expertise Areas: web_research, fact_checking, current_events
Specialties: real_time_information, news_gathering
```

#### 2. **Embedding Generation**

- **Model**: OpenAI `text-embedding-3-large`
- **Input**: Profile text (limited to 8000 chars)
- **Output**: 3072-dimensional vector

#### 3. **Metadata Storage**

Each agent vector includes rich metadata:

```json
{
  "id": "<agent-uuid>",
  "values": [0.123, -0.456, ...],  // 3072 dimensions
  "metadata": {
    "agent_id": "<uuid>",
    "agent_name": "Web Research Specialist",
    "agent_title": "Web Research Specialist",
    "agent_display_name": "Web Research Specialist",
    "description": "Searches the web...",
    "capabilities": ["web_search", "synthesis"],
    "expertise": ["web_research"],
    "specialties": ["real_time_info"],
    "is_active": true,
    "model": "gpt-4o-mini",
    "temperature": 0.7,
    "max_tokens": 2000,
    "embedding_type": "agent_profile",
    "entity_type": "agent",
    "timestamp": "2025-11-08T..."
  }
}
```

---

## 🔍 RECONCILIATION REQUIREMENTS

### Priority 1: Verify Pinecone Status ⚠️

**Need to check:**
1. ✅ Is `PINECONE_API_KEY` configured?
2. ✅ Can we connect to `vital-knowledge` index?
3. ✅ How many agents are in the `agent` namespace?
4. ✅ Are all 151 Supabase agents embedded?
5. ✅ When were agents last synced?

### Priority 2: Identify Sync Gaps

**Possible scenarios:**

| Scenario | Supabase | Pinecone | Action Required |
|----------|----------|----------|-----------------|
| **Fully Synced** | 151 | 151 | ✅ No action |
| **Partial Sync** | 151 | 50-150 | 🔄 Sync missing agents |
| **No Sync** | 151 | 0 | ❌ Full sync needed |
| **Stale Data** | 151 | 151 (old) | 🔄 Re-embed updated agents |

### Priority 3: Data Quality

**Check for:**
- ✅ Agents with NULL/empty descriptions
- ✅ Agents with empty capabilities arrays
- ✅ Agents with very short system prompts
- ✅ Agents missing optional fields (background, personality)

---

## 🛠️ SYNC TOOLS AVAILABLE

### Tool 1: `sync_agents_to_pinecone.py`

**Location**: `/services/ai-engine/src/scripts/sync_agents_to_pinecone.py`

**Features**:
- ✅ Fetches all agents from Supabase
- ✅ Builds comprehensive profile text
- ✅ Generates embeddings with OpenAI
- ✅ Syncs to Pinecone in batches (10 agents/batch)
- ✅ Tracks success/failure counts
- ✅ Uses `agent` namespace (singular)

**Usage**:
```bash
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path/services/ai-engine

# Ensure environment variables are set
export PINECONE_API_KEY="<your-key>"
export OPENAI_API_KEY="<your-key>"
export SUPABASE_URL="<your-url>"
export SUPABASE_SERVICE_ROLE_KEY="<your-key>"

# Run sync
python src/scripts/sync_agents_to_pinecone.py
```

**Expected Output**:
```
🚀 Starting agent sync to Pinecone...
✅ Connected to Pinecone index: vital-knowledge
✅ OpenAI client initialized
📊 Fetching agents from Supabase...
✅ Found 151 agents to sync
🔄 Processing agent 1/151: Web Research Specialist
...
✅ Synced batch of 10 agents to Pinecone
...
🎉 Agent sync complete: 151 synced, 0 failed
✅ Final verification complete
```

### Tool 2: `verify_pinecone_agents.py`

**Location**: `/services/ai-engine/src/scripts/verify_pinecone_agents.py`

**Features**:
- ✅ Verifies Pinecone connection
- ✅ Shows namespace stats
- ✅ Queries sample agents
- ✅ Displays agent count

**Usage**:
```bash
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path/services/ai-engine

python src/scripts/verify_pinecone_agents.py
```

**Expected Output**:
```
🔍 Verifying Pinecone connection...
   Index: vital-knowledge
   Namespace: agent

✅ Connected to Pinecone index: vital-knowledge

📊 Agent Namespace Stats:
   Total Vectors: 151
   Dimension: 3072
   Index Fullness: 0.03%

🔍 Querying sample agents...
   ✅ Found 5 agents in namespace

   Sample agents:
   1. Web Research Specialist (ID: 95625bdc-1ea9-4320-966b-5a2cab6445a8)
      Similarity: 0.8234
   2. Document Synthesis Specialist (ID: eac0dec8-8213-4ecc-a8fb-38bf18ac823c)
      Similarity: 0.8156
   3. RAG Retrieval Specialist (ID: dabaffc1-49a4-454b-a98c-2a496315d4b7)
      Similarity: 0.8089

✅ Pinecone connection verified!
```

---

## 🚨 CRITICAL CONSIDERATIONS

### 1. Agent Updates Not Auto-Synced ⚠️

**Issue**: When agents are updated in Supabase, Pinecone is NOT automatically updated

**Impact**:
- Stale embeddings in Pinecone
- Agent search returns outdated information
- Agent routing may use old capabilities

**Solution**: 
- Manual sync after agent updates
- OR implement webhook/trigger to auto-sync on agent changes

### 2. No Embedding Version Tracking ⚠️

**Issue**: Supabase doesn't track which agents are embedded or when

**Impact**:
- Cannot detect missing agents in Pinecone
- Cannot identify stale embeddings
- Cannot track embedding model version

**Solution**: Add tracking fields to Supabase:
```sql
ALTER TABLE agents 
ADD COLUMN embedding_version TEXT,
ADD COLUMN embedded_at TIMESTAMPTZ,
ADD COLUMN embedding_model TEXT;
```

### 3. Large Batch Processing

**Current**: Processes 10 agents per batch
**Total Time**: ~151 agents × 2-3 seconds/agent = **5-8 minutes**
**Cost**: ~151 × $0.00013/1K tokens = **~$0.02** (negligible)

---

## 📋 VERIFICATION CHECKLIST

To complete Agent reconciliation:

- [ ] **Step 1**: Verify Pinecone API key is configured
- [ ] **Step 2**: Run `verify_pinecone_agents.py` to check current state
- [ ] **Step 3**: Get agent count in Pinecone `agent` namespace
- [ ] **Step 4**: Compare with Supabase count (151 agents)
- [ ] **Step 5**: If mismatch, run `sync_agents_to_pinecone.py`
- [ ] **Step 6**: Verify sync completed successfully
- [ ] **Step 7**: Test agent search queries
- [ ] **Step 8**: Document sync timestamp
- [ ] **Step 9**: Setup monitoring for future syncs
- [ ] **Step 10**: Consider adding auto-sync triggers

---

## 🎯 RECOMMENDED ACTIONS

### Option 1: Quick Verification (5 minutes)

```bash
# 1. Verify Pinecone connection and agent count
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path/services/ai-engine
python src/scripts/verify_pinecone_agents.py

# Expected: Should show 151 agents (or 0 if never synced)
```

### Option 2: Full Sync (10 minutes)

```bash
# 1. Sync all agents to Pinecone
python src/scripts/sync_agents_to_pinecone.py

# 2. Verify sync completed
python src/scripts/verify_pinecone_agents.py

# Expected: Should show 151 agents synced
```

### Option 3: Incremental Sync (Advanced)

Modify `sync_agents_to_pinecone.py` to:
1. Check which agents are already in Pinecone
2. Only sync new/updated agents
3. Track embedding timestamps in Supabase

---

## 💡 TECHNICAL NOTES

### Why Separate Pinecone Index for Agents?

1. **GraphRAG Architecture**:
   - Agents need semantic routing
   - Queries like "find an agent that can analyze clinical trial data"
   - Vector search returns best matching agents

2. **Performance**:
   - Separate namespace (`agent`) for fast agent-only queries
   - Avoids searching through 19,801 knowledge document chunks

3. **Different Embedding Strategy**:
   - Agents embedded as complete profiles
   - Documents embedded as chunks
   - Different metadata structures

### Agent Search Use Cases

**Example Queries**:
```python
# Find agents by capability
query = "agent that can do web research and fact checking"
# Returns: Web Research Specialist, RAG Retrieval Specialist

# Find agents by domain
query = "regulatory affairs expert for clinical trials"
# Returns: Regulatory Affairs Specialist, Clinical Development Specialist

# Find agents by communication style
query = "friendly helpful agent for customer support"
# Returns: Customer Service Agent, Support Specialist
```

---

## 🎊 NEXT STEPS

**Choose your path:**

**1️⃣ Verify Current State** (Recommended First Step)
- Run `verify_pinecone_agents.py`
- Get current agent count in Pinecone
- Assess sync gap

**2️⃣ Full Agent Sync**
- Run `sync_agents_to_pinecone.py`
- Embed all 151 agents
- Verify completion

**3️⃣ Add Embedding Tracking**
- Add tracking columns to Supabase
- Update sync script to track versions
- Enable incremental syncs

**4️⃣ Setup Auto-Sync**
- Create Supabase trigger on agent updates
- Call webhook to sync to Pinecone
- Maintain always-current embeddings

**5️⃣ Test Agent Search**
- Run sample queries
- Verify agent discovery works
- Optimize for your use cases

---

**What would you like to do?**
1. Verify current Pinecone agent count
2. Run full agent sync to Pinecone
3. Add embedding tracking to Supabase
4. Setup automated sync triggers
5. Test agent search queries


