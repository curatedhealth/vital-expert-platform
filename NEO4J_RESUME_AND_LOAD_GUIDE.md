# Neo4j Aura Resume & Load Instructions

## Step 1: Resume Neo4j Aura Database

### Option A: Via Web Console (Recommended)

1. **Go to Neo4j Aura Console**:
   - Open: https://console.neo4j.io/
   - Login with your credentials

2. **Find Your Database**:
   - Look for database with ID: `f2601ba0`
   - Or URI: `f2601ba0.databases.neo4j.io`
   - Status will likely show: "Paused" or "Stopped"

3. **Resume the Database**:
   - Click on the database
   - Click the "Resume" button
   - Wait 1-2 minutes for it to start
   - Status should change to "Running"

4. **Verify Connection Details**:
   - URI: `neo4j+s://f2601ba0.databases.neo4j.io`
   - Username: `neo4j`
   - Database: `neo4j`
   - Password: (already in your .env.local)

### Option B: Via Neo4j Aura API (Alternative)

If you prefer command line:

```bash
# Set your Aura credentials
AURA_CLIENT_ID="your_client_id"
AURA_CLIENT_SECRET="your_secret"
INSTANCE_ID="f2601ba0"

# Resume the instance
curl -X POST \
  "https://api.neo4j.io/v1/instances/$INSTANCE_ID/resume" \
  -H "Authorization: Bearer $AURA_CLIENT_SECRET" \
  -H "Content-Type: application/json"
```

---

## Step 2: Verify Neo4j is Running

Once resumed, test the connection:

```bash
cd /Users/hichamnaim/.cursor/worktrees/VITAL_path/YXdjF/services/ai-engine
source venv/bin/activate

# Load environment
export $(cat "/Users/hichamnaim/Downloads/Cursor/VITAL path/.env.local" | grep -v '^#' | xargs)

# Test connection with Python
python3 -c "
from neo4j import GraphDatabase
import os

uri = os.getenv('NEO4J_URI')
user = os.getenv('NEO4J_USER')
password = os.getenv('NEO4J_PASSWORD')

try:
    driver = GraphDatabase.driver(uri, auth=(user, password))
    with driver.session() as session:
        result = session.run('RETURN 1 as test')
        print('✅ Neo4j connection successful!')
        print(f'   URI: {uri}')
    driver.close()
except Exception as e:
    print(f'❌ Connection failed: {e}')
"
```

---

## Step 3: Load Agents to Neo4j

Once Neo4j is running and connection is verified:

```bash
cd /Users/hichamnaim/.cursor/worktrees/VITAL_path/YXdjF/services/ai-engine
source venv/bin/activate

# Load environment variables
export $(cat "/Users/hichamnaim/Downloads/Cursor/VITAL path/.env.local" | grep -v '^#' | xargs)
export SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_ROLE_KEY
export SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL

# Run the Neo4j loading script
python3 scripts/load_agents_to_neo4j.py --clear-existing
```

### Expected Output

```
[info] Initializing clients...
[info] ✅ All clients initialized
[info] ============================================================
[info] 🚀 Agent Graph Loading Pipeline Starting
[info] ============================================================
[info] Clearing existing graph data...
[info] ✅ Graph cleared
[info] Creating Agent nodes...
[info] ✅ Created 319 Agent nodes
[info] Creating Skill nodes...
[info] ✅ Created 58 Skill nodes
[info] Creating Tool nodes...
[info] ✅ Created [X] Tool nodes
[info] Creating Knowledge Domain nodes...
[info] ✅ Created [X] Knowledge Domain nodes
[info] Creating HAS_SKILL relationships...
[info] ✅ Created 66,391 HAS_SKILL relationships
[info] Creating USES_TOOL relationships...
[info] ✅ Created [X] USES_TOOL relationships
[info] Creating KNOWS_ABOUT relationships...
[info] ✅ Created [X] KNOWS_ABOUT relationships
[info] Creating DELEGATES_TO relationships...
[info] ✅ Created 0 DELEGATES_TO relationships  ⚠️
[info] Verifying graph data...
[info] ============================================================
[info] 📊 Graph Verification Results:
[info]    Nodes:
[info]      - Agents: 319
[info]      - Skills: 58
[info]      - Tools: [X]
[info]      - Knowledge Domains: [X]
[info]    Relationships:
[info]      - HAS_SKILL: 66,391
[info]      - USES_TOOL: [X]
[info]      - KNOWS_ABOUT: [X]
[info]      - DELEGATES_TO: 0  ⚠️ (agent_hierarchies table is empty)
[info] ============================================================
[info] ✅ Pipeline Complete!
[info]    Total Nodes: 377+
[info]    Total Relationships: 66,391+
[info]    Time Elapsed: [X]s
[info] ============================================================
```

**Note**: DELEGATES_TO will be 0 because we haven't created agent hierarchies yet. That's Step 4.

---

## Step 4: Verify Neo4j Graph

After loading, verify in Neo4j Browser:

1. **Open Neo4j Browser**:
   - Go to https://console.neo4j.io/
   - Click "Open with Neo4j Browser" on your database

2. **Run Verification Queries**:

```cypher
// Count all nodes by type
MATCH (n) 
RETURN labels(n)[0] as NodeType, count(n) as Count
ORDER BY Count DESC

// Count all relationships by type
MATCH ()-[r]->() 
RETURN type(r) as RelationshipType, count(r) as Count
ORDER BY Count DESC

// Sample: Agent with their skills
MATCH (a:Agent)-[:HAS_SKILL]->(s:Skill)
RETURN a.name as Agent, 
       a.role as Role,
       collect(s.name)[0..5] as Skills
LIMIT 5

// Check for delegation relationships (should be 0 for now)
MATCH (p:Agent)-[r:DELEGATES_TO]->(c:Agent)
RETURN count(r) as DelegationCount
```

---

## Troubleshooting

### If Connection Still Fails

**1. Check DNS Resolution**:
```bash
nslookup f2601ba0.databases.neo4j.io
```

If this fails, your database might be:
- Still starting (wait 2-3 minutes)
- Deleted or expired
- Network issue

**2. Check Neo4j Status**:
```bash
curl -I https://f2601ba0.databases.neo4j.io:7473
```

Should return HTTP 200 if running.

**3. Check Firewall/VPN**:
- Some corporate networks block Neo4j ports (7687, 7473)
- Try disconnecting from VPN if applicable

**4. Verify Credentials**:
```bash
# Test with neo4j CLI (if installed)
cypher-shell -a neo4j+s://f2601ba0.databases.neo4j.io \
  -u neo4j \
  -p "GMdaD0qT3b0S9JPxW1mWMM84APxg6yTji_XDD2n2P3k" \
  "RETURN 1"
```

### If Database is Expired/Deleted

Free tier Neo4j Aura databases expire after 30 days of inactivity. If yours is gone:

**Option 1**: Create New Neo4j Aura Instance
1. Go to https://console.neo4j.io/
2. Click "New Instance"
3. Choose Free tier
4. Note the new URI and password
5. Update your `.env.local` with new credentials
6. Re-run the loading script

**Option 2**: Use Local Neo4j
```bash
# Install Neo4j Desktop or use Docker
docker run \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/yourpassword \
  neo4j:latest
  
# Update .env.local
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=yourpassword
```

---

## What Happens Next

Once Neo4j loading completes:

### You'll Have:
✅ 319 Agent nodes in Neo4j
✅ 58 Skill nodes
✅ Tool nodes (if tools table has data)
✅ Knowledge Domain nodes (if table has data)
✅ 66,391+ HAS_SKILL relationships
✅ USES_TOOL relationships
✅ KNOWS_ABOUT relationships

### Still Missing:
⚠️ Agent hierarchy relationships (DELEGATES_TO)
- Need to create `agent_hierarchies` data first
- Then reload Neo4j to include those relationships

---

## Quick Commands Reference

```bash
# Navigate to ai-engine directory
cd /Users/hichamnaim/.cursor/worktrees/VITAL_path/YXdjF/services/ai-engine

# Activate virtual environment
source venv/bin/activate

# Load all environment variables
export $(cat "/Users/hichamnaim/Downloads/Cursor/VITAL path/.env.local" | grep -v '^#' | xargs)
export SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_ROLE_KEY
export SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL

# Test Neo4j connection
python3 -c "from neo4j import GraphDatabase; import os; driver = GraphDatabase.driver(os.getenv('NEO4J_URI'), auth=(os.getenv('NEO4J_USER'), os.getenv('NEO4J_PASSWORD'))); print('✅ Connected'); driver.close()"

# Load to Neo4j
python3 scripts/load_agents_to_neo4j.py --clear-existing

# Check results
python3 -c "from neo4j import GraphDatabase; import os; driver = GraphDatabase.driver(os.getenv('NEO4J_URI'), auth=(os.getenv('NEO4J_USER'), os.getenv('NEO4J_PASSWORD'))); session = driver.session(); result = session.run('MATCH (n) RETURN labels(n)[0] as type, count(n) as count'); [print(f\"{r['type']}: {r['count']}\") for r in result]; driver.close()"
```

---

**Ready to proceed?**

1. Resume Neo4j Aura at https://console.neo4j.io/
2. Wait 1-2 minutes for it to start
3. Run the loading script
4. Let me know the results!


