# PostgreSQL → Neo4j Sync Strategy

## Overview

This document outlines the CDC (Change Data Capture) / ETL strategy for synchronizing VITAL's enterprise ontology from PostgreSQL (source of truth) to Neo4j (graph analysis layer).

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VITAL Data Architecture                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────┐     CDC/ETL      ┌─────────────────┐        │
│   │   PostgreSQL    │ ──────────────── │     Neo4j       │        │
│   │   (Supabase)    │     Triggers     │  (Aura/Local)   │        │
│   │                 │     + Queue      │                 │        │
│   │  - Source of    │                  │  - Graph        │        │
│   │    Truth        │                  │    Analysis     │        │
│   │  - ACID         │                  │  - Pathfinding  │        │
│   │  - RLS/Tenancy  │                  │  - PageRank     │        │
│   └─────────────────┘                  └─────────────────┘        │
│           │                                     │                  │
│           └──────────────┬──────────────────────┘                  │
│                          │                                          │
│                          ▼                                          │
│                  ┌───────────────┐                                  │
│                  │   ai-engine   │                                  │
│                  │   (Python)    │                                  │
│                  │               │                                  │
│                  │  - GraphRAG   │                                  │
│                  │  - Ontology   │                                  │
│                  │    API        │                                  │
│                  └───────────────┘                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Sync Patterns

### Pattern 1: Trigger-Based CDC (Recommended for MVP)

PostgreSQL triggers capture changes and queue them for Neo4j sync.

```sql
-- 1. Create sync queue table
CREATE TABLE IF NOT EXISTS neo4j_sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,  -- 'function', 'department', 'role', 'jtbd', etc.
    entity_id UUID NOT NULL,
    operation TEXT NOT NULL,    -- 'INSERT', 'UPDATE', 'DELETE'
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending'  -- 'pending', 'processing', 'completed', 'failed'
);

-- 2. Create trigger function
CREATE OR REPLACE FUNCTION queue_neo4j_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO neo4j_sync_queue (entity_type, entity_id, operation, payload)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD));
        RETURN OLD;
    ELSE
        INSERT INTO neo4j_sync_queue (entity_type, entity_id, operation, payload)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW));
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach triggers to ontology tables
CREATE TRIGGER sync_org_functions_to_neo4j
    AFTER INSERT OR UPDATE OR DELETE ON org_functions
    FOR EACH ROW EXECUTE FUNCTION queue_neo4j_sync();

CREATE TRIGGER sync_org_departments_to_neo4j
    AFTER INSERT OR UPDATE OR DELETE ON org_departments
    FOR EACH ROW EXECUTE FUNCTION queue_neo4j_sync();

CREATE TRIGGER sync_org_roles_to_neo4j
    AFTER INSERT OR UPDATE OR DELETE ON org_roles
    FOR EACH ROW EXECUTE FUNCTION queue_neo4j_sync();

CREATE TRIGGER sync_personas_to_neo4j
    AFTER INSERT OR UPDATE OR DELETE ON personas
    FOR EACH ROW EXECUTE FUNCTION queue_neo4j_sync();

CREATE TRIGGER sync_jtbd_to_neo4j
    AFTER INSERT OR UPDATE OR DELETE ON jtbd
    FOR EACH ROW EXECUTE FUNCTION queue_neo4j_sync();
```

### Pattern 2: Scheduled Full Sync (For Initial Load / Recovery)

```python
# ai-engine/src/services/neo4j_sync_service.py

from neo4j import GraphDatabase
from supabase import create_client
import asyncio
from datetime import datetime
from typing import Dict, List, Any

class Neo4jSyncService:
    """
    Handles PostgreSQL → Neo4j synchronization for VITAL ontology.
    """

    def __init__(self, neo4j_uri: str, neo4j_user: str, neo4j_password: str,
                 supabase_url: str, supabase_key: str):
        self.neo4j_driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))
        self.supabase = create_client(supabase_url, supabase_key)

    async def full_sync(self, tenant_id: str = None):
        """Perform full sync of all ontology entities."""
        print(f"Starting full sync at {datetime.now()}")

        # Order matters for relationships
        await self.sync_functions(tenant_id)
        await self.sync_departments(tenant_id)
        await self.sync_roles(tenant_id)
        await self.sync_personas(tenant_id)
        await self.sync_jtbd(tenant_id)
        await self.sync_value_categories()
        await self.sync_value_drivers()

        # Sync relationships
        await self.sync_jtbd_relationships(tenant_id)

        print(f"Full sync completed at {datetime.now()}")

    async def sync_functions(self, tenant_id: str = None):
        """Sync org_functions to Neo4j Function nodes."""
        query = self.supabase.table('org_functions').select('*')
        if tenant_id:
            query = query.eq('tenant_id', tenant_id)

        functions = query.execute().data

        with self.neo4j_driver.session() as session:
            for func in functions:
                session.run("""
                    MERGE (f:Function {id: $id})
                    SET f.name = $name,
                        f.slug = $slug,
                        f.description = $description,
                        f.tenant_id = $tenant_id,
                        f.industry = $industry,
                        f.strategic_priority = $strategic_priority,
                        f.updated_at = datetime()
                """, {
                    'id': func['id'],
                    'name': func['name'],
                    'slug': func.get('slug'),
                    'description': func.get('description'),
                    'tenant_id': func.get('tenant_id'),
                    'industry': func.get('industry'),
                    'strategic_priority': func.get('strategic_priority')
                })

        print(f"Synced {len(functions)} functions")

    async def sync_departments(self, tenant_id: str = None):
        """Sync org_departments to Neo4j Department nodes."""
        query = self.supabase.table('org_departments').select('*')
        if tenant_id:
            query = query.eq('tenant_id', tenant_id)

        departments = query.execute().data

        with self.neo4j_driver.session() as session:
            for dept in departments:
                # Create Department node
                session.run("""
                    MERGE (d:Department {id: $id})
                    SET d.name = $name,
                        d.slug = $slug,
                        d.description = $description,
                        d.function_id = $function_id,
                        d.tenant_id = $tenant_id,
                        d.updated_at = datetime()
                """, {
                    'id': dept['id'],
                    'name': dept['name'],
                    'slug': dept.get('slug'),
                    'description': dept.get('description'),
                    'function_id': dept.get('function_id'),
                    'tenant_id': dept.get('tenant_id')
                })

                # Create BELONGS_TO relationship to Function
                if dept.get('function_id'):
                    session.run("""
                        MATCH (d:Department {id: $dept_id})
                        MATCH (f:Function {id: $func_id})
                        MERGE (d)-[:BELONGS_TO]->(f)
                    """, {
                        'dept_id': dept['id'],
                        'func_id': dept['function_id']
                    })

        print(f"Synced {len(departments)} departments")

    async def sync_roles(self, tenant_id: str = None):
        """Sync org_roles to Neo4j Role nodes."""
        query = self.supabase.table('org_roles').select('*')
        if tenant_id:
            query = query.eq('tenant_id', tenant_id)

        roles = query.execute().data

        with self.neo4j_driver.session() as session:
            for role in roles:
                # Create Role node
                session.run("""
                    MERGE (r:Role {id: $id})
                    SET r.name = $name,
                        r.slug = $slug,
                        r.description = $description,
                        r.role_type = $role_type,
                        r.seniority_level = $seniority_level,
                        r.department_id = $department_id,
                        r.function_id = $function_id,
                        r.tenant_id = $tenant_id,
                        r.updated_at = datetime()
                """, {
                    'id': role['id'],
                    'name': role['name'],
                    'slug': role.get('slug'),
                    'description': role.get('description'),
                    'role_type': role.get('role_type'),
                    'seniority_level': role.get('seniority_level'),
                    'department_id': role.get('department_id'),
                    'function_id': role.get('function_id'),
                    'tenant_id': role.get('tenant_id')
                })

                # Create BELONGS_TO relationship to Department
                if role.get('department_id'):
                    session.run("""
                        MATCH (r:Role {id: $role_id})
                        MATCH (d:Department {id: $dept_id})
                        MERGE (r)-[:BELONGS_TO]->(d)
                    """, {
                        'role_id': role['id'],
                        'dept_id': role['department_id']
                    })

        print(f"Synced {len(roles)} roles")

    async def sync_jtbd_relationships(self, tenant_id: str = None):
        """Sync JTBD junction table relationships."""

        # JTBD → Functions
        jtbd_funcs = self.supabase.table('jtbd_functions').select('*').execute().data
        with self.neo4j_driver.session() as session:
            for jf in jtbd_funcs:
                session.run("""
                    MATCH (j:JTBD {id: $jtbd_id})
                    MATCH (f:Function {id: $func_id})
                    MERGE (j)-[r:PERFORMED_BY_FUNCTION]->(f)
                    SET r.relevance_score = $relevance,
                        r.is_primary = $is_primary
                """, {
                    'jtbd_id': jf['jtbd_id'],
                    'func_id': jf['function_id'],
                    'relevance': jf.get('relevance_score'),
                    'is_primary': jf.get('is_primary')
                })

        # JTBD → Roles
        jtbd_roles = self.supabase.table('jtbd_roles').select('*').execute().data
        with self.neo4j_driver.session() as session:
            for jr in jtbd_roles:
                session.run("""
                    MATCH (j:JTBD {id: $jtbd_id})
                    MATCH (r:Role {id: $role_id})
                    MERGE (j)-[rel:PERFORMED_BY_ROLE]->(r)
                    SET rel.relevance_score = $relevance,
                        rel.importance = $importance,
                        rel.frequency = $frequency
                """, {
                    'jtbd_id': jr['jtbd_id'],
                    'role_id': jr['role_id'],
                    'relevance': jr.get('relevance_score'),
                    'importance': jr.get('importance'),
                    'frequency': jr.get('frequency')
                })

        # JTBD → Value Categories
        jtbd_vc = self.supabase.table('jtbd_value_categories').select('*').execute().data
        with self.neo4j_driver.session() as session:
            for jv in jtbd_vc:
                session.run("""
                    MATCH (j:JTBD {id: $jtbd_id})
                    MATCH (vc:ValueCategory {id: $cat_id})
                    MERGE (j)-[r:DELIVERS_VALUE]->(vc)
                    SET r.relevance_score = $relevance,
                        r.is_primary = $is_primary
                """, {
                    'jtbd_id': jv['jtbd_id'],
                    'cat_id': jv['category_id'],
                    'relevance': jv.get('relevance_score'),
                    'is_primary': jv.get('is_primary')
                })

        print("Synced JTBD relationships")

    async def process_queue(self, batch_size: int = 100):
        """Process pending items from sync queue (CDC pattern)."""

        # Get pending items
        pending = self.supabase.table('neo4j_sync_queue') \
            .select('*') \
            .eq('status', 'pending') \
            .order('created_at') \
            .limit(batch_size) \
            .execute().data

        for item in pending:
            try:
                # Mark as processing
                self.supabase.table('neo4j_sync_queue') \
                    .update({'status': 'processing'}) \
                    .eq('id', item['id']) \
                    .execute()

                # Process based on entity type
                await self._process_sync_item(item)

                # Mark as completed
                self.supabase.table('neo4j_sync_queue') \
                    .update({
                        'status': 'completed',
                        'processed_at': datetime.now().isoformat()
                    }) \
                    .eq('id', item['id']) \
                    .execute()

            except Exception as e:
                # Mark as failed
                self.supabase.table('neo4j_sync_queue') \
                    .update({
                        'status': 'failed',
                        'payload': {**item.get('payload', {}), 'error': str(e)}
                    }) \
                    .eq('id', item['id']) \
                    .execute()

        return len(pending)

    async def _process_sync_item(self, item: Dict[str, Any]):
        """Process a single sync queue item."""
        entity_type = item['entity_type']
        operation = item['operation']
        payload = item['payload']

        with self.neo4j_driver.session() as session:
            if operation == 'DELETE':
                # Remove node by ID
                label = self._get_neo4j_label(entity_type)
                session.run(f"MATCH (n:{label} {{id: $id}}) DETACH DELETE n",
                           {'id': item['entity_id']})
            else:
                # Upsert based on entity type
                if entity_type == 'org_functions':
                    await self._upsert_function(session, payload)
                elif entity_type == 'org_departments':
                    await self._upsert_department(session, payload)
                elif entity_type == 'org_roles':
                    await self._upsert_role(session, payload)
                # Add more entity types as needed

    def _get_neo4j_label(self, table_name: str) -> str:
        """Map PostgreSQL table name to Neo4j node label."""
        mapping = {
            'org_functions': 'Function',
            'org_departments': 'Department',
            'org_roles': 'Role',
            'personas': 'Persona',
            'jtbd': 'JTBD',
            'value_categories': 'ValueCategory',
            'value_drivers': 'ValueDriver'
        }
        return mapping.get(table_name, table_name.title())
```

## Neo4j Graph Model

```cypher
-- Node Labels
(:Function)
(:Department)
(:Role)
(:Persona)
(:JTBD)
(:ValueCategory)
(:ValueDriver)
(:Skill)
(:Tool)
(:Tenant)

-- Relationships
(Department)-[:BELONGS_TO]->(Function)
(Role)-[:BELONGS_TO]->(Department)
(Role)-[:REPORTS_TO]->(Role)
(Persona)-[:HAS_ROLE]->(Role)
(JTBD)-[:PERFORMED_BY_FUNCTION]->(Function)
(JTBD)-[:PERFORMED_BY_ROLE]->(Role)
(JTBD)-[:DELIVERS_VALUE]->(ValueCategory)
(JTBD)-[:IMPACTS]->(ValueDriver)
(Role)-[:REQUIRES_SKILL]->(Skill)
(Role)-[:USES_TOOL]->(Tool)
```

## Implementation Phases

### Phase 1: MVP (Week 1)
- [ ] Create `neo4j_sync_queue` table in PostgreSQL
- [ ] Add triggers to core ontology tables
- [ ] Implement basic `Neo4jSyncService` with full sync
- [ ] Create Neo4j schema constraints and indexes

### Phase 2: CDC Integration (Week 2)
- [ ] Implement queue processor in ai-engine
- [ ] Add background job for continuous sync
- [ ] Create monitoring/alerting for sync failures

### Phase 3: Advanced Features (Week 3+)
- [ ] Add Graph Data Science (GDS) algorithms
- [ ] Implement similarity recommendations
- [ ] Create graph-based insights API

## Configuration

```python
# ai-engine/.env
NEO4J_URI=bolt://localhost:7687  # or neo4j+s://xxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password
NEO4J_DATABASE=vital

SYNC_BATCH_SIZE=100
SYNC_INTERVAL_SECONDS=30
```

## Monitoring

```sql
-- Check sync queue status
SELECT
    status,
    COUNT(*) as count,
    MIN(created_at) as oldest,
    MAX(created_at) as newest
FROM neo4j_sync_queue
GROUP BY status;

-- Failed syncs
SELECT * FROM neo4j_sync_queue
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

## Recovery Procedures

```bash
# Full resync (use sparingly)
python -m ai_engine.scripts.neo4j_full_sync --tenant-id <tenant_id>

# Process stuck queue items
python -m ai_engine.scripts.neo4j_process_queue --batch-size 500

# Reset failed items for retry
UPDATE neo4j_sync_queue SET status = 'pending' WHERE status = 'failed';
```
