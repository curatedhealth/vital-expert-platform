# Service Architecture: Modes, Templates & Reusable Nodes

## 🎯 Vision

**Design workflows in the designer → Publish to service views**

This migration creates a complete architecture where:
1. Services have configurable modes (Ask Expert: 4 modes, Ask Panel: 6 modes)
2. Templates can be linked to services and modes (many-to-many)
3. Workflows designed in the workflow designer can be published to service views
4. Reusable node library for building workflows

## 📊 New Tables Created

### 1. **`service_modes`** (Service Configurations)
Defines modes/variations for each service

**Examples**:
- Ask Expert: Mode 1-4 (Direct Expert, Expert with Tools, Specialist, Research & Analysis)
- Ask Panel: Mode 1-6 (Open Discussion, Structured Panel, Consensus, Debate, Expert Review, Multi-Phase)

**Key Fields**:
```sql
- service_id (FK to services_registry)
- mode_name, mode_code, display_name
- mode_config (JSONB) - configuration per mode
- workflow_template_id - linked workflow
- ui_config (JSONB) - UI settings
- is_default, display_order
```

### 2. **`service_mode_templates`** (Many-to-Many)
Links templates to service modes

**Use Cases**:
- Mode 1 uses Template A for system prompt
- Mode 2 uses Templates B + C for agent config
- Same template can be used in multiple modes with different configs

**Key Fields**:
```sql
- service_mode_id (FK)
- template_id (FK)
- template_role ('system_prompt', 'user_prompt', 'agent_config')
- config_override (JSONB) - mode-specific customization
```

### 3. **`node_library`** (Reusable Workflow Nodes)
Library of reusable nodes/steps for workflow designer

**Built-in Nodes Included**:
- Control Flow: Start, End, Condition, Parallel
- AI Agents: Agent, Orchestrator
- Tools: Web Search, Document Parser
- More can be added...

**Key Fields**:
```sql
- node_type ('start', 'end', 'agent', 'tool', 'condition', etc.)
- node_config (JSONB) - node configuration
- input_ports, output_ports - connection points
- visual_config - appearance in designer
- required_tools, required_services - dependencies
- is_builtin, is_featured, is_public
```

### 4. **`workflow_publications`** (Workflow → Service)
Tracks workflows published to services/modes

**Workflow**:
1. Design workflow in Workflow Designer
2. Publish to Ask Expert Mode 1
3. Record created in workflow_publications
4. Users access via service view

**Key Fields**:
```sql
- workflow_id (FK)
- service_id, service_mode_id (FK)
- publication_status ('draft', 'published', 'archived')
- workflow_snapshot (JSONB) - version at publication
- published_at, unpublished_at
```

### 5. **`node_collections`** + **`node_collection_items`** (Node Groups)
Organize related nodes into collections

**Examples**:
- "Healthcare Starter Pack" - nodes for medical workflows
- "Research Tools" - search, analysis, citation nodes
- "Compliance Suite" - validation, audit, reporting nodes

## 🎨 Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                      WORKFLOW DESIGNER                            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Node Palette                                            │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │   │
│  │  │ Start Node   │ │ Agent Node   │ │ Tool Node    │   │   │
│  │  │ (from node_  │ │ (from node_  │ │ (from node_  │   │   │
│  │  │  library)    │ │  library)    │ │  library)    │   │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  User designs workflow using reusable nodes                     │
│  Workflow saved to 'workflows' table                            │
│                                                                   │
│  [Publish Button] ──→ Select Target Service & Mode              │
└────────────────────────────│──────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                  WORKFLOW PUBLICATIONS                            │
│                                                                   │
│  workflow_publications table records:                            │
│    - workflow_id                                                 │
│    - service_id (e.g., ask_expert)                              │
│    - service_mode_id (e.g., Mode 1)                             │
│    - workflow_snapshot (frozen version)                          │
│    - publication_status: 'published'                             │
└────────────────────────────│──────────────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            │                                  │
            ▼                                  ▼
┌──────────────────────┐         ┌──────────────────────┐
│   ASK EXPERT VIEW    │         │   ASK PANEL VIEW     │
│                      │         │                       │
│  ┌────────────────┐ │         │  ┌────────────────┐  │
│  │ Mode 1         │ │         │  │ Mode 1         │  │
│  │ ← Published    │ │         │  │                │  │
│  │   Workflow     │ │         │  │                │  │
│  └────────────────┘ │         │  └────────────────┘  │
│  ┌────────────────┐ │         │  ┌────────────────┐  │
│  │ Mode 2         │ │         │  │ Mode 2         │  │
│  └────────────────┘ │         │  └────────────────┘  │
│  ┌────────────────┐ │         │  ┌────────────────┐  │
│  │ Mode 3         │ │         │  │ Mode 3         │  │
│  └────────────────┘ │         │  └────────────────┘  │
│  ┌────────────────┐ │         │         ...          │
│  │ Mode 4         │ │         │  ┌────────────────┐  │
│  └────────────────┘ │         │  │ Mode 6         │  │
└──────────────────────┘         └──────────────────────┘

Users interact with published workflows via service views
```

## 🔄 Data Flow

### 1. Design Phase
```sql
-- User builds workflow in designer using nodes from node_library
SELECT * FROM node_library 
WHERE is_public = TRUE AND is_enabled = TRUE
ORDER BY node_category, display_order;

-- Workflow saved
INSERT INTO workflows (...) VALUES (...);
```

### 2. Publication Phase
```sql
-- User publishes workflow to Ask Expert Mode 1
INSERT INTO workflow_publications (
  workflow_id,
  service_id,
  service_mode_id,
  publication_type,
  publication_status,
  workflow_snapshot
) VALUES (
  '<workflow-uuid>',
  (SELECT id FROM services_registry WHERE service_name = 'ask_expert'),
  (SELECT id FROM service_modes WHERE mode_code = 'ae_mode_1'),
  'service',
  'published',
  '<workflow-json>'::jsonb
);
```

### 3. Execution Phase
```sql
-- User accesses Ask Expert Mode 1
-- Frontend fetches published workflow
SELECT 
  wp.*,
  w.name as workflow_name,
  sm.display_name as mode_name,
  sm.mode_config
FROM workflow_publications wp
JOIN workflows w ON wp.workflow_id = w.id
JOIN service_modes sm ON wp.service_mode_id = sm.id
WHERE wp.service_mode_id = '<mode-uuid>'
  AND wp.publication_status = 'published';

-- Execute workflow...
```

## 📋 Seed Data Included

### Service Modes (10 modes created)

**Ask Expert (4 modes)**:
1. **Mode 1 - Direct Expert**: Basic 1-on-1 expert conversation
2. **Mode 2 - Expert with Tools**: Expert + web search, document parsing
3. **Mode 3 - Specialist Consultation**: Deep domain expertise + RAG
4. **Mode 4 - Research & Analysis**: Comprehensive research with citations

**Ask Panel (6 modes)**:
1. **Mode 1 - Open Discussion**: Open panel, multiple perspectives
2. **Mode 2 - Structured Panel**: Defined roles, sequential speaking
3. **Mode 3 - Consensus Building**: Consensus-driven decision making
4. **Mode 4 - Debate Panel**: Adversarial debate with rebuttals
5. **Mode 5 - Expert Review**: Comprehensive expert review
6. **Mode 6 - Multi-Phase Analysis**: Discovery → Analysis → Synthesis

### Built-in Nodes (7 nodes created)

**Control Flow**:
- Start Node
- End Node
- Condition Node

**AI Agents**:
- Agent Node (single agent execution)
- Orchestrator Node (multi-agent coordination)

**Tools**:
- Web Search Node
- Document Parser Node

## 🚀 How to Apply

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

psql "postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres" \
  -f database/migrations/023_service_modes_and_node_library.sql
```

Or via Supabase Dashboard:
1. Open SQL Editor
2. Copy contents of `023_service_modes_and_node_library.sql`
3. Run

## ✅ Verification Queries

```sql
-- 1. Check service modes
SELECT 
  s.service_name,
  COUNT(sm.id) as mode_count
FROM services_registry s
LEFT JOIN service_modes sm ON s.id = sm.service_id
WHERE sm.deleted_at IS NULL
GROUP BY s.service_name;

-- Expected:
-- ask_expert: 4 modes
-- ask_panel: 6 modes

-- 2. List all modes
SELECT 
  s.service_name,
  sm.mode_code,
  sm.display_name,
  sm.mode_type,
  sm.is_default
FROM service_modes sm
JOIN services_registry s ON sm.service_id = s.id
WHERE sm.deleted_at IS NULL
ORDER BY s.service_name, sm.display_order;

-- 3. Check built-in nodes
SELECT 
  node_type,
  node_category,
  display_name,
  framework
FROM node_library
WHERE is_builtin = TRUE
ORDER BY node_category, display_order;

-- Expected: 7 built-in nodes

-- 4. Check node collections (should be empty initially)
SELECT COUNT(*) FROM node_collections;

-- 5. Check publications (should be empty initially)
SELECT COUNT(*) FROM workflow_publications;
```

## 📚 Example Usage

### 1. Browse Modes for a Service
```sql
SELECT 
  sm.mode_code,
  sm.display_name,
  sm.description,
  sm.mode_config,
  sm.is_default
FROM service_modes sm
JOIN services_registry s ON sm.service_id = s.id
WHERE s.service_name = 'ask_expert'
  AND sm.is_enabled = TRUE
  AND sm.deleted_at IS NULL
ORDER BY sm.display_order;
```

### 2. Link Template to Mode
```sql
INSERT INTO service_mode_templates (
  service_mode_id,
  template_id,
  template_role,
  is_default
) VALUES (
  (SELECT id FROM service_modes WHERE mode_code = 'ae_mode_1'),
  (SELECT id FROM template_library WHERE template_slug = 'research-analyst'),
  'system_prompt',
  TRUE
);
```

### 3. Browse Node Library
```sql
SELECT 
  nc.display_name as category,
  nl.display_name as node_name,
  nl.description,
  nl.node_type,
  nl.visual_config->>'icon' as icon
FROM node_library nl
LEFT JOIN node_collections nc ON ... -- if using collections
WHERE nl.is_public = TRUE 
  AND nl.is_enabled = TRUE
  AND nl.deleted_at IS NULL
ORDER BY nl.node_category, nl.display_name;
```

### 4. Publish Workflow to Mode
```sql
-- Publish workflow to Ask Expert Mode 2
INSERT INTO workflow_publications (
  workflow_id,
  service_id,
  service_mode_id,
  publication_type,
  publication_status,
  workflow_snapshot,
  published_at
) VALUES (
  '<workflow-uuid>',
  (SELECT id FROM services_registry WHERE service_name = 'ask_expert'),
  (SELECT id FROM service_modes WHERE mode_code = 'ae_mode_2'),
  'mode',
  'published',
  (SELECT definition FROM workflows WHERE id = '<workflow-uuid>'),
  NOW()
);
```

### 5. Get Published Workflow for a Mode
```sql
SELECT 
  w.name as workflow_name,
  w.description,
  wp.workflow_snapshot,
  wp.publication_status,
  wp.published_at,
  sm.display_name as mode_name,
  sm.mode_config
FROM workflow_publications wp
JOIN workflows w ON wp.workflow_id = w.id
JOIN service_modes sm ON wp.service_mode_id = sm.id
WHERE sm.mode_code = 'ae_mode_2'
  AND wp.publication_status = 'published'
ORDER BY wp.published_at DESC
LIMIT 1;
```

## 🔗 Relationships

```
services_registry
  └─→ service_modes (1:many)
       ├─→ service_mode_templates (many:many) ←─ template_library
       └─→ workflow_publications (1:many) ←───── workflows

node_library
  ├─→ node_collection_items (many:many) ←─ node_collections
  └─→ Used in workflow designer to build workflows

workflows
  └─→ workflow_publications (1:many)
       └─→ Links to service_modes
```

## 🎯 Next Steps

1. **✅ Apply Migration** - Run `023_service_modes_and_node_library.sql`
2. **Create API Routes**:
   - `/api/services/:slug/modes` - List modes for service
   - `/api/modes/:id/templates` - Templates for mode
   - `/api/nodes` - Browse node library
   - `/api/workflows/:id/publish` - Publish workflow
   - `/api/services/:slug/modes/:code` - Get published workflow
3. **Update Workflow Designer**:
   - Node palette from `node_library`
   - Publish button → `workflow_publications`
   - Visual representation using `visual_config`
4. **Update Service Views**:
   - Display modes from `service_modes`
   - Load published workflows
   - Execute based on mode configuration

## 📊 Benefits

✅ **Flexible Architecture** - Services can have any number of modes
✅ **Reusable Components** - Nodes can be used across workflows
✅ **Version Control** - Workflow snapshots at publication
✅ **Template System** - Link templates to modes with customization
✅ **Separation of Concerns** - Design vs. publication vs. execution
✅ **Discoverability** - Organized node library with categories
✅ **Scalability** - Easy to add new services, modes, and nodes

---

**Migration File**: `023_service_modes_and_node_library.sql`
**Tables Created**: 6 new tables
**Seed Data**: 10 service modes + 7 built-in nodes
**Status**: Ready to apply

