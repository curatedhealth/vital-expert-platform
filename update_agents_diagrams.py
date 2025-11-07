"""
Update all agents to support Mermaid and ASCII diagram creation
"""
import os
import sys
from supabase import create_client, Client

# Load environment from .env.vercel
env_file = '.env.vercel'
with open(env_file, 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            os.environ[key] = value.strip('"').strip("'")

# Initialize Supabase
url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
key = os.environ.get('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY')

if not url or not key:
    print("❌ Missing Supabase credentials")
    sys.exit(1)

supabase: Client = create_client(url, key)

# Diagram capabilities to add to all agents
DIAGRAM_CAPABILITIES = """

## 📊 DIAGRAM CREATION CAPABILITIES

You MUST support creating visual diagrams when requested:

### Mermaid Diagrams (REQUIRED):
Use Mermaid syntax for flowcharts, sequence diagrams, and process flows.

**Supported Types**:
1. **Flowcharts**: Use `graph TD` or `graph LR`
2. **Sequence Diagrams**: Use `sequenceDiagram`
3. **Gantt Charts**: Use `gantt`
4. **State Diagrams**: Use `stateDiagram-v2`

**Syntax Rules**:
- Always use ```mermaid code blocks
- Node format: `A[Label]` for boxes, `A(Label)` for rounded, `A{Label}` for diamonds
- Arrows: `-->` for solid, `-.->` for dotted, `==>` for thick
- Labels on arrows: `-->|text|` or `--text-->`
- Keep diagrams under 20 nodes for clarity
- Test syntax validity before generating

**Example Flowchart**:
```mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Success]
    B -->|No| D[Retry]
    D --> A
```

**Example Sequence**:
```mermaid
sequenceDiagram
    User->>System: Request
    System->>Database: Query
    Database-->>System: Data
    System-->>User: Response
```

### ASCII Diagrams (REQUIRED):
Use ASCII art for simple diagrams when Mermaid is not suitable.

**Format**:
```ascii
    ┌─────────────┐
    │   Start     │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │   Process   │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │     End     │
    └─────────────┘
```

**Guidelines**:
1. ALWAYS create diagrams when asked
2. Use Mermaid for complex workflows
3. Use ASCII for simple structures
4. Explain the diagram after showing it
5. Offer to modify or create alternative diagrams
6. NEVER say you cannot create diagrams

**When to Use**:
- User asks for "flowchart", "diagram", "visualization", "process flow"
- Explaining complex processes
- Showing workflows or decision trees
- Illustrating relationships or hierarchies
"""

print("=" * 80)
print("🔍 Fetching all agents...")
print("=" * 80)

# Get all agents
agents_response = supabase.table('agents').select('id, name, system_prompt').execute()
agents = agents_response.data

print(f"\n✅ Found {len(agents)} agents")

print("\n" + "=" * 80)
print("🔧 Updating agents with diagram capabilities...")
print("=" * 80)

updated_count = 0
skipped_count = 0

for agent in agents:
    agent_id = agent['id']
    agent_name = agent.get('name', 'Unknown')
    current_prompt = agent.get('system_prompt', '')
    
    # Check if already has diagram capabilities
    if 'DIAGRAM CREATION CAPABILITIES' in current_prompt or 'Mermaid Diagrams' in current_prompt:
        print(f"⏭️  {agent_name}: Already has diagram capabilities")
        skipped_count += 1
        continue
    
    # Append diagram capabilities to existing prompt
    updated_prompt = current_prompt + DIAGRAM_CAPABILITIES if current_prompt else DIAGRAM_CAPABILITIES
    
    # Update agent
    try:
        update_response = supabase.table('agents').update({
            'system_prompt': updated_prompt
        }).eq('id', agent_id).execute()
        
        print(f"✅ {agent_name}: Added diagram capabilities")
        updated_count += 1
    except Exception as e:
        print(f"❌ {agent_name}: Failed - {str(e)}")

print("\n" + "=" * 80)
print(f"🎉 Update Complete!")
print("=" * 80)
print(f"\n📊 Summary:")
print(f"   - Total agents: {len(agents)}")
print(f"   - Updated: {updated_count}")
print(f"   - Skipped (already had): {skipped_count}")
print(f"   - Failed: {len(agents) - updated_count - skipped_count}")

print("\n✅ All agents can now create Mermaid and ASCII diagrams!")
print("\n💡 Restart AI Engine to apply changes.")
