# Neo4j Graph Database Assets

**Purpose:** Neo4j graph database schemas, queries, and migrations  
**Status:** Structure created - schemas and queries to be documented

---

## Structure

```
neo4j/
├── schemas/            # Cypher schema definitions
├── queries/            # Common Cypher queries
└── migrations/        # Graph migrations (if versioned)
```

---

## Current Implementation

Neo4j is currently configured via:
- Environment variables: `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`
- Client code: `services/ai-engine/src/services/neo4j_client.py`
- Sync scripts: `database/sync/sync_to_neo4j.py`

---

## Next Steps

1. Document Neo4j schemas in `schemas/`
2. Document common queries in `queries/`
3. Extract graph patterns from code

---

**See Also:**
- [Multi-Database Organization Standard](../../docs/architecture/MULTI_DATABASE_ORGANIZATION_STANDARD.md)
- Neo4j Client: `services/ai-engine/src/services/neo4j_client.py`
