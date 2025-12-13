## Knowledge Data Strategy (RAG + Ontology)

### Objectives
- Unify domain taxonomy and RAG sources so agents and tasks share one canonical graph.
- Replace free-text agent domain links with FK-based junctions.
- Keep RAG sources (Pinecone/Docs) separate but linked to agents/tasks and domains.
- Enable ontology/visualization layers to traverse the same normalized schema.

### Proposed Schema (ASCII)
```
                 +--------------------+
                 |   knowledge_domains|
                 |--------------------|
                 | id (PK)            |
                 | slug (UNIQUE)      |
                 | name               |
                 | domain_type        |
                 | parent_id -> self  |
                 | depth_level        |
                 +--------------------+
                          ^
                          | (classifies)
                          |
+--------------+   +----------------------+   +------------------+
| domain_*     |   | agent_knowledge_dom |   | domain_hierarchies|
| (disease,    |   |----------------------|   |------------------|
| therapeutic, |   | id (PK)              |   | parent_domain_id |
| evidence,    |   | agent_id -> agents   |   | child_domain_id  |
| regulatory)  |   | domain_id -> kd      |   | relationship_type|
| [optionally  |   | proficiency_level    |   | depth            |
| mapped into  |   | expertise_level      |   +------------------+
| kd or linked]|   | is_primary_domain    |
| via fk]      |   +----------------------+


+------------------+      +------------------+      +------------------+
|      agents      |      |   agent_knowledge|      |     sources      |
|------------------|      |------------------|      |------------------|
| id (PK)          |<-----| agent_id         |----->| id (PK)          |
| agent_level_id   |      | source_id -> src |      | code, name, etc. |
| ...              |      | relevance_score  |      | rag_priority     |
|                  |      | is_primary       |      +------------------+
|                  |      | can_cite         |
|                  |      +------------------+
|                  |
| (tasks, workflows) can link similarly via task_knowledge/task_domains
```

### Key Normalization Steps
1) **Canonical domains**  
   - `knowledge_domains` becomes the single lookup.  
   - Add `slug UNIQUE`, ensure `domain_type` is populated (e.g., business_function, therapeutic_area, disease, evidence_type, regulatory_framework).  
   - Ingest unmatched `domain_name` values from `agent_knowledge_domains` into `knowledge_domains` with slugs.

2) **Agent ↔ Domain junction**  
   - Add `domain_id` FK to `agent_knowledge_domains` and backfill by matching `domain_name` to `knowledge_domains.name/slug` (case-insensitive).  
   - Keep `proficiency_level`, `expertise_level`, `is_primary_domain`.  
   - Optionally drop/ignore `domain_name` after migration to prevent drift.

3) **RAG sources**  
   - `sources` remains the RAG reference (Pinecone namespaces/docs).  
   - Validate `agent_knowledge.source_id` → `sources.id`; report/null invalid references.  
   - If tasks/workflows need RAG, mirror with `task_knowledge` (task_id ↔ source_id).

4) **Specialized domain tables**  
   - Option A: Map `domain_diseases`, `domain_therapeutic_areas`, `domain_evidence_types`, `domain_regulatory_frameworks` into `knowledge_domains` (set `domain_type` accordingly), and link existing rows to the canonical table.  
   - Option B: Keep them separate but add a `knowledge_domain_id` FK so they participate in the same graph.

### Immediate SQL Actions (recommended)
1) Add unique slug and default domain_type to `knowledge_domains`; upsert unmatched domain names:  
   - Generate slugs for all `knowledge_domains.name` where missing.  
   - Insert any domain_name from `agent_knowledge_domains` not found in `knowledge_domains` as new rows with a default `domain_type` (e.g., `'business_function'`), slugified name.
2) Add `domain_id` to `agent_knowledge_domains` and backfill:  
   - Match on LOWER(name/slug) to set `domain_id`.  
   - Enforce FK to `knowledge_domains`.  
   - Optionally drop/ignore `domain_name`.
3) Validate `agent_knowledge.source_id`:  
   - Report `agent_knowledge` rows whose `source_id` is missing in `sources`.  
   - Decide whether to null them or create placeholder sources.

### Data Hygiene / Constraints
- `knowledge_domains.slug` UNIQUE, NOT NULL; `domain_type` NOT NULL.  
- `agent_knowledge_domains.domain_id` NOT NULL, FK to `knowledge_domains`.  
- `agent_knowledge.source_id` FK to `sources`.  
- Optional: enforce one primary domain per agent (`is_primary_domain`) with a partial unique index.

### Migration Outline (SQL to prepare)
1) Upsert missing domains and set slugs/domain_type.  
2) Add `domain_id` to `agent_knowledge_domains` and backfill from names/slugs.  
3) Add constraints (unique slug, FK).  
4) Validate `agent_knowledge.source_id` and report/null invalid.

### Open Decisions
- What `domain_type` to assign to the unmatched free-text names (e.g., default `'business_function'`)?  
- Should `domain_name` be dropped after `domain_id` backfill?  
- For invalid `source_id` in `agent_knowledge`, null them or create placeholders?  
- Should specialized domain tables be folded into `knowledge_domains` now or just linked via FK?

