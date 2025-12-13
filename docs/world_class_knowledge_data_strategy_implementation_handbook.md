# World‑Class Knowledge Data Strategy & Implementation Handbook

> **Purpose**  
This handbook is a single, comprehensive, implementation‑ready reference for designing and deploying a **fully normalized, scalable, enterprise‑grade knowledge platform** for RAG + ontology‑driven systems (pharma, life sciences, digital health).  
It consolidates **all prior content without omission**, structured as a practical strategy + execution guide.

---

## Executive Summary — What “World‑Class” Looks Like

- A world‑class knowledge architecture is **multi‑axial**:  
  one **canonical domain hierarchy** for governance and navigation, plus **orthogonal, fully normalized dimensions** (e.g., therapy area, evidence type, regulation, product, geography).
- `knowledge_domains` is the **single source of truth** for taxonomy: unique slug, typed, hierarchical, lifecycle‑aware.
- All associations (agents, tasks, documents, sources, namespaces) are handled via **FK‑based junction tables** — no free text.
- Knowledge quality is operationalized through **lifecycle states, evaluation metrics, test queries, and monitoring tables**.
- Operational retrieval (Pinecone namespaces) is **derived from domains**, never hard‑coded into agents or prompts.

---

# PART I — Current Schema Review (What Must Change to Be Fully Normalized)

## A. Free‑Text Instead of Foreign Keys (Core Blocker)

- `agent_knowledge_domains` stores `domain_name TEXT` instead of a FK to canonical domains.
- `knowledge_documents` contains both `domain TEXT` and `domain_id TEXT` (not enforced as FK).

**Implication**: taxonomy drift, broken analytics, inconsistent RAG routing.

---

## B. Domain ↔ Knowledge Linking Is Asymmetric

- `knowledge_domain_mapping(source_id, domain_id, …)` links to `knowledge_domains`.
- FK integrity to `sources(id)` is missing or unenforced.

**Implication**: orphan mappings, weak provenance, unreliable governance.

---

## C. Duplicate / Overlapping “Document” Concepts

- Audit flags **three parallel document tables**.
- Present in schema: `knowledge_documents`, `knowledge_base`, `documents`.

**Implication**: unclear source of truth, duplicated embeddings, fractured analytics.

---

## D. Two Competing Chunk Models

- `document_chunks` stores embeddings per document.
- `knowledge_chunks` independently stores chunk‑level embeddings.

**Implication**: ambiguous retrieval path, double indexing, operational risk.

---

## E. Direction Is Already Correct

Your strategy documents clearly state the intended north star:

- `knowledge_domains` as the **single canonical lookup**
- Replace free‑text relationships with FK junctions
- Keep RAG sources separate but explicitly linked

This handbook operationalizes that direction.

---

# PART II — World‑Class Knowledge Domain Hierarchy

## 1. Design Principle

Use **one canonical tree** for governance + navigation, and attach **linked dimensions** for everything else.

Do **not** encode therapy area, geography, document type, or product into the domain tree.

---

## 2. Canonical Knowledge Domain Tree

### Level 0 — Enterprise Knowledge Pillars

- Regulatory
- Clinical
- Safety
- Quality
- Manufacturing & Supply
- Medical Affairs
- HEOR & Market Access
- Commercial
- Digital Health
- R&D (Discovery / Preclinical / Translational)
- Cross‑Cutting (Methods, Standards, Analytics)
- Operating Model (Ways of Working, Playbooks)

### Level 1–2 — Subdomains (Examples)

**Regulatory**
- Authorities & Regions (FDA, EMA, MHRA, PMDA)
- Frameworks (NDA, BLA, 510(k), PMA, MDR/IVDR)
- ICH (Q / E / S)

**Clinical**
- Trial Design
- Clinical Operations
- Biostatistics
- Data Standards (CDISC)

**Safety**
- Pharmacovigilance

**Medical Affairs**
- MSL
- Medical Information
- Medical Education
- Scientific Communications

**Digital Health**
- SaMD
- Interoperability (FHIR / HL7)
- Cybersecurity & Data Protection
- Digital Foundations

---

## 3. Why This Works With Your Current Stack

- Supabase “business domains” map cleanly to **Level 0 / 1**.
- Pinecone namespaces map to **Level 1 / 2**.
- No duplication between ontology, storage, and retrieval layers.

---

# PART III — Fully Normalized Knowledge Data Layer (Tables & Junctions)

> This section defines the **authoritative table list** for implementation.

---

## 3.1 Canonical Taxonomy

### 1) `knowledge_domains` (Canonical)

- `id (PK)`
- `tenant_id (FK)`
- `name`
- `slug (UNIQUE, NOT NULL)`
- `description`
- `domain_type (NOT NULL)`
- `parent_id (FK self)`
- `depth_level`
- `tier`
- `embedding_model`
- `quality_threshold`
- `status` (draft → building → active → deprecated)
- `last_sync_at`
- `sync_frequency_hours`

---

### 2) `domain_hierarchies` (Optional)

- `parent_domain_id (FK)`
- `child_domain_id (FK)`
- `relationship_type` (e.g., related_to)
- `depth`

---

### 3) `domain_namespaces`

- `id (PK)`
- `domain_id (FK)`
- `namespace_key` (e.g., knowledge‑reg‑fda)
- `is_default`
- `weight`
- `created_at`

---

### 4) `domain_metadata_fields`

- `id (PK)`
- `domain_id (FK)`
- `field_key`
- `data_type`
- `is_required`
- `allowed_values`
- `validation_regex`
- `display_order`

---

## 3.2 Sources & Provenance

### 5) `source_categories`

- `id`
- `name (UNIQUE)`
- `description`
- `rag_priority_weight`

### 6) `sources`

- `id`
- `code (UNIQUE)`
- `name`
- `category_id (FK)`
- `authority_level`
- `rag_priority_weight`

### 7) `document_source_links`

- `document_id (FK)`
- `source_id (FK)`
- `source_type`
- `citation_text`
- `page_references`
- `confidence_score`

### 8) `knowledge_domain_mapping`

- `source_id (FK → sources)`
- `domain_id (FK → knowledge_domains)`
- `relevance_score`
- `is_primary`

UNIQUE `(source_id, domain_id)`

---

## 3.3 Documents (Single Source of Truth)

### 9) `knowledge_documents`

- `id`
- `tenant_id`
- `title`
- `content`
- `file_name`
- `file_type`
- `publication_date`
- `language`
- `document_type_id (FK)`
- `document_format_id (FK)`
- `source_id (FK)`

❌ Remove: `domain TEXT`, `domain_id TEXT`

---

### 10) `document_domains`

- `id`
- `document_id (FK)`
- `domain_id (FK)`
- `is_primary`
- `relevance_score`
- `created_at`

UNIQUE `(document_id, domain_id)`

---

### 11) `document_types`

- `id`, `name`, `description`

### 12) `document_formats`

- `id`, `name`, `mime_type`

---

### 13) `document_versions`

- `id`
- `document_id (FK)`
- `version`
- `content`
- `metadata`
- `created_by`
- `created_at`

---

### 14) `document_tags`

- `document_id (FK)`
- `tag_id (FK)`
- `created_at`

UNIQUE `(document_id, tag_id)`

---

## 3.4 Chunks & Embeddings

### 15) `document_chunks` (Only Chunk Table)

- `id`
- `document_id (FK)`
- `chunk_index`
- `content`
- `embedding`
- `metadata`
- `token_count`
- `start_char`
- `end_char`
- `embedding_model`
- `embedding_dim`
- `chunk_hash`
- `created_at`

❌ Deprecate `knowledge_chunks` (or convert to VIEW)

---

### 16) `chunk_analytics`

- `chunk_id (FK)`
- `retrieval_count`
- `avg_relevance_score`
- `last_retrieved_at`
- `feedback_positive`
- `feedback_negative`
- `quality_score`

---

## 3.5 Entities & Ontology

### 17) `extracted_entities`

- `id`
- `tenant_id`
- `document_id (FK)`
- `chunk_id (FK)`
- `entity_type`
- `entity_text`
- `confidence`
- `verification_status`

### 18) `entity_relationships`

- `id`
- `source_entity_id (FK)`
- `target_entity_id (FK)`
- `relationship_type`
- `confidence`
- `created_at`

### 19) `entity_types`

- `code (UNIQUE)`
- `name`
- `description`
- `is_active`

---

## 3.6 Lifecycle, Evaluation & Monitoring

### 20) `knowledge_test_queries`

- `tenant_id`
- `domain_id`
- `query`
- `expected_sources[]`
- `min_relevance_score`
- `pass_rate`
- `last_result`

### 21) `knowledge_test_suites`

- `id`
- `tenant_id`
- `name`
- `domains[]`
- `schedule_cron`
- `is_active`

### 22) `knowledge_test_runs`

- `suite_id`
- `status`
- `total_queries`
- `passed_queries`
- `avg_latency_ms`
- `results`

### 23) `search_logs`

- `tenant_id`
- `user_id`
- `agent_id`
- `query`
- `strategy`
- `domain_id`
- `result_count`
- `latency_ms`
- `created_at`

---

## 3.7 Agent & Task Knowledge Routing

### 24) `agent_domain_assignments`

- `agent_id (FK)`
- `domain_id (FK)`
- `proficiency_level`
- `expertise_level`
- `is_primary_domain`
- `created_at`

UNIQUE `(agent_id, domain_id)`

### 25) `agent_knowledge`

- `agent_id (FK)`
- `source_id (FK)`
- `relevance_score`
- `is_primary`

### 26) Task Junctions

- `task_knowledge(task_id, source_id, relevance_score, is_required)`
- `task_domains(task_id, domain_id, priority, usage_mode)`

---

# PART IV — What to Deprecate / Consolidate

- **Documents**: deprecate `knowledge_base`, `documents`, legacy `knowledge_base_documents`
- **Chunks**: keep `document_chunks`; retire `knowledge_chunks`
- **Domains**: enforce `slug UNIQUE`, `domain_type NOT NULL`

---

# PART V — Hard Constraints (Non‑Negotiable)

- No free‑text domain references
- All domain usage via FK junctions
- Enforced uniqueness:
  - `(document_id, domain_id)`
  - `(agent_id, domain_id)`
  - `(document_id, tag_id)`
  - `(domain_id, namespace_key)`
- Enforced FK integrity on all mappings

---

# PART VI — Golden Rule for Maintainability

> **Canonical domains + junction tables. Never free text. Never duplicated semantics.**

This rule alone determines whether your system scales cleanly or collapses under entropy.

---

## Next High‑Leverage Steps

1. Freeze the canonical domain tree.
2. Add missing junction tables.
3. Backfill FKs from free‑text fields.
4. Enforce constraints.
5. Migrate agents and tasks to domain‑driven routing.

---

If you want next:
- A **phased SQL migration plan** (safe, reversible)
- A **domain tree instantiation** for your exact Supabase + Pinecone setup
- A **governance playbook** (who owns what, how changes are approved)

Say the word and I’ll generate it.



---

# PART VII — Phased SQL Migration Plan (Supabase/Postgres)

> Goal: migrate to a **fully normalized** schema with minimal downtime, reversible steps, and strict FK integrity.
>
> **Guiding constraints from current schema** (observed):
> - `knowledge_documents` currently includes `domain TEXT` and `domain_id TEXT` (not a FK) fileciteturn4file10L25-L57
> - `knowledge_domain_mapping` has FK to `knowledge_domains` but **no FK** shown to `sources(id)` fileciteturn4file10L58-L67
> - `knowledge_chunks` exists as a separate chunk table keyed by `source_id` fileciteturn4file10L6-L24
> - `knowledge_base` exists as a parallel knowledge table (content + vector_ids) fileciteturn4file15L11-L43
> - Normalization strategy already recommends: enforce `knowledge_domains.slug` unique + domain_type not null; add `domain_id` to `agent_knowledge_domains` and backfill; validate `agent_knowledge.source_id` fileciteturn4file1L5-L27
>
## Phase 0 — Safety Rails (Pre-migration)

### 0.1 Backups + observability
- Create a full DB backup and enable point-in-time restore.
- Add a migration journal table (if you don’t already have one) to record each phase:

```sql
CREATE TABLE IF NOT EXISTS migration_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase text NOT NULL,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'started',
  notes text
);
```

### 0.2 Prevent new drift during migration
- Add a feature flag: freeze UI actions that create new domains / modify domain strings.
- If you can’t freeze writes, create write triggers that populate both old + new structures during transition (dual-write).

---

## Phase 1 — Canonical Domain Hygiene (constraints-first)

### 1.1 Ensure `knowledge_domains` has canonical constraints
Current schema shows `slug` is NOT NULL but not necessarily UNIQUE, and `domain_type` is nullable fileciteturn4file10L68-L80.

```sql
-- 1) enforce slug uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS uq_knowledge_domains_slug
  ON knowledge_domains (lower(slug));

-- 2) enforce domain_type NOT NULL (after backfill)
-- First: backfill missing domain_type
UPDATE knowledge_domains
SET domain_type = COALESCE(domain_type, 'business_function')
WHERE domain_type IS NULL;

ALTER TABLE knowledge_domains
  ALTER COLUMN domain_type SET NOT NULL;
```

### 1.2 Upsert missing domains from free-text agent domains
This is explicitly recommended in your knowledge data strategy fileciteturn4file1L5-L12.

```sql
-- Pseudocode approach: insert unknown domain names into knowledge_domains
-- Adjust table name/column if your agent free-text table differs.
INSERT INTO knowledge_domains (name, slug, domain_type)
SELECT DISTINCT akd.domain_name,
       regexp_replace(lower(akd.domain_name), '[^a-z0-9]+', '-', 'g') AS slug,
       'business_function' AS domain_type
FROM agent_knowledge_domains akd
LEFT JOIN knowledge_domains kd
  ON lower(kd.name) = lower(akd.domain_name)
  OR lower(kd.slug) = regexp_replace(lower(akd.domain_name), '[^a-z0-9]+', '-', 'g')
WHERE kd.id IS NULL;
```

---

## Phase 2 — Domain ↔ Namespace Normalization (Pinecone routing)

### 2.1 Create `domain_namespaces`
This avoids embedding namespace strings in agent profiles and aligns operational isolation with domain governance.

```sql
CREATE TABLE IF NOT EXISTS domain_namespaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id uuid NOT NULL REFERENCES knowledge_domains(id) ON DELETE CASCADE,
  namespace_key text NOT NULL,
  is_default boolean DEFAULT false,
  weight numeric DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
  created_at timestamptz DEFAULT now(),
  UNIQUE(domain_id, lower(namespace_key))
);

-- Optional: enforce max one default namespace per domain
CREATE UNIQUE INDEX IF NOT EXISTS uq_domain_namespaces_default
  ON domain_namespaces(domain_id)
  WHERE is_default = true;
```

### 2.2 Seed `domain_namespaces`
Seed from your known Pinecone namespaces list (REGULATORY, DIGITAL HEALTH, etc.)

---

## Phase 3 — Agent ↔ Domain: eliminate free-text

### 3.1 Add `domain_id` to `agent_knowledge_domains` and backfill
This is explicitly recommended fileciteturn4file1L9-L12.

```sql
ALTER TABLE agent_knowledge_domains
  ADD COLUMN IF NOT EXISTS domain_id uuid;

-- Backfill by matching case-insensitive on name/slug
UPDATE agent_knowledge_domains akd
SET domain_id = kd.id
FROM knowledge_domains kd
WHERE akd.domain_id IS NULL
  AND (
    lower(kd.name) = lower(akd.domain_name)
    OR lower(kd.slug) = regexp_replace(lower(akd.domain_name), '[^a-z0-9]+', '-', 'g')
  );

-- Enforce FK and non-null once backfilled
ALTER TABLE agent_knowledge_domains
  ADD CONSTRAINT agent_knowledge_domains_domain_id_fkey
  FOREIGN KEY (domain_id) REFERENCES knowledge_domains(id);

ALTER TABLE agent_knowledge_domains
  ALTER COLUMN domain_id SET NOT NULL;

-- Optional: prevent drift by freezing domain_name updates
-- (or drop domain_name once you confirm no dependency)
```

### 3.2 Optional: enforce only one primary domain per agent

```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_agent_primary_domain
  ON agent_knowledge_domains(agent_id)
  WHERE is_primary_domain = true;
```

---

## Phase 4 — Document ↔ Domain: replace `domain TEXT` + `domain_id TEXT`

### 4.1 Create `document_domains`

```sql
CREATE TABLE IF NOT EXISTS document_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  domain_id uuid NOT NULL REFERENCES knowledge_domains(id) ON DELETE RESTRICT,
  is_primary boolean DEFAULT false,
  relevance_score numeric DEFAULT 1.0 CHECK (relevance_score >= 0 AND relevance_score <= 1),
  created_at timestamptz DEFAULT now(),
  UNIQUE(document_id, domain_id)
);

-- Optional: one primary domain per document
CREATE UNIQUE INDEX IF NOT EXISTS uq_document_primary_domain
  ON document_domains(document_id)
  WHERE is_primary = true;
```

### 4.2 Backfill `document_domains` from existing `knowledge_documents.domain` / `domain_id`
Current schema includes `domain TEXT` and `domain_id TEXT` fileciteturn4file10L25-L57.

**Backfill approach (robust):**
- If `knowledge_documents.domain_id` contains a UUID-like value, map directly.
- Else map `knowledge_documents.domain` string to `knowledge_domains` by name/slug.

```sql
-- 1) Backfill from domain_id when it is a UUID
INSERT INTO document_domains (document_id, domain_id, is_primary)
SELECT kd.id as document_id,
       kd2.id as domain_id,
       true
FROM knowledge_documents kd
JOIN knowledge_domains kd2
  ON kd.domain_id ~* '^[0-9a-f\-]{36}$'
 AND kd2.id::text = kd.domain_id
ON CONFLICT DO NOTHING;

-- 2) Backfill from domain name when domain_id is not usable
INSERT INTO document_domains (document_id, domain_id, is_primary)
SELECT d.id,
       dom.id,
       true
FROM knowledge_documents d
JOIN knowledge_domains dom
  ON lower(dom.name) = lower(d.domain)
   OR lower(dom.slug) = regexp_replace(lower(d.domain), '[^a-z0-9]+', '-', 'g')
WHERE d.domain IS NOT NULL
ON CONFLICT DO NOTHING;
```

### 4.3 Freeze old columns (then drop later)
Once production reads from `document_domains`, you can drop `domain` and `domain_id`.

---

## Phase 5 — Chunk Layer Consolidation: choose canonical chunk table

You currently have a distinct `knowledge_chunks` table keyed by `source_id` fileciteturn4file10L6-L24.

### 5.1 Decide canonical chunk table
- **Recommended**: canonicalize on `document_chunks` (already present in your larger schema; used by entity extraction and document-based ingestion patterns).
- Convert `knowledge_chunks` into a compatibility **VIEW** or migrate records into `document_chunks`.

### 5.2 Migration option A: Create `document_chunks` if not present

```sql
CREATE TABLE IF NOT EXISTS document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  embedding USER-DEFINED,
  token_count integer,
  start_char integer,
  end_char integer,
  embedding_model text,
  embedding_dim integer,
  chunk_hash text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(document_id, chunk_index)
);
```

### 5.3 Backfill from `knowledge_chunks`
If `knowledge_chunks.source_id` corresponds to `knowledge_documents.source_id`, you can join that way.

```sql
INSERT INTO document_chunks (document_id, chunk_index, content, embedding, token_count, start_char, end_char, metadata)
SELECT d.id,
       kc.chunk_index,
       kc.content,
       kc.embedding,
       kc.token_count,
       kc.start_position,
       kc.end_position,
       kc.metadata
FROM knowledge_chunks kc
JOIN knowledge_documents d
  ON d.source_id = kc.source_id
ON CONFLICT DO NOTHING;
```

### 5.4 Replace `knowledge_chunks` with a view (optional)

```sql
-- After migration, if any legacy code still queries knowledge_chunks,
-- replace with a view over document_chunks.

-- 1) Rename table
ALTER TABLE knowledge_chunks RENAME TO knowledge_chunks_legacy;

-- 2) Create view
CREATE VIEW knowledge_chunks AS
SELECT dc.id,
       kd.source_id,
       dc.content,
       dc.chunk_index,
       dc.start_char AS start_position,
       dc.end_char AS end_position,
       dc.embedding,
       NULL::text AS heading,
       NULL::text AS context_before,
       NULL::text AS context_after,
       NULL::integer AS word_count,
       dc.token_count,
       NULL::numeric AS quality_score,
       dc.metadata,
       dc.created_at,
       dc.updated_at
FROM document_chunks dc
JOIN knowledge_documents kd ON kd.id = dc.document_id;
```

---

## Phase 6 — Provenance Integrity: fix missing FKs

`knowledge_domain_mapping` currently shows FK to `knowledge_domains` but not to `sources` fileciteturn4file10L58-L67.

```sql
ALTER TABLE knowledge_domain_mapping
  ADD CONSTRAINT knowledge_domain_mapping_source_id_fkey
  FOREIGN KEY (source_id) REFERENCES sources(id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_knowledge_domain_mapping
  ON knowledge_domain_mapping(source_id, domain_id);
```

---

## Phase 7 — Deprecate / Consolidate parallel tables

You have a parallel `knowledge_base` table with content, tags, vector_ids and metadata fileciteturn4file15L11-L43.

### 7.1 Choose canonical documents table
- Recommended canonical: `knowledge_documents` (already FK-linked to `sources`, document_types/formats). fileciteturn4file10L25-L57

### 7.2 Migration patterns
- **Option A (fast)**: migrate `knowledge_base.content` → `knowledge_documents.content` with a generated `source_id` (or a “placeholder internal source”).
- **Option B (clean)**: treat `knowledge_base` as a “collection” layer and map it to `knowledge_documents` via a junction `knowledge_base_documents(base_id, document_id)`.

---

## Phase 8 — Post-migration: enforce “no drift” rules

- Remove/lock old columns (`knowledge_documents.domain`, `knowledge_documents.domain_id`) after successful cutover.
- Remove/lock free-text `agent_knowledge_domains.domain_name` after successful cutover.
- Ensure all ingestion pipelines write **only** to:
  - `knowledge_documents`
  - `document_domains`
  - `document_chunks`
  - `document_source_links`
  - `extracted_entities`

---

# PART VIII — Instantiated Canonical Domain Tree (Your Exact Setup)

> This section operationalizes your current two-layer reality:
> - Supabase “business domains” (16) from migration schema
> - Pinecone “knowledge-*” namespaces (24) in `vital-knowledge` index
>
> **Rule**: each canonical domain node can map to **one or more** Pinecone namespaces via `domain_namespaces`.

## Level 0 — Enterprise Knowledge Pillars

1. Regulatory
2. Clinical
3. Safety
4. Quality
5. Manufacturing & Supply
6. Medical Affairs
7. HEOR & Market Access
8. Commercial
9. Digital Health
10. R&D
11. Cross-Cutting
12. Operating Model

## Level 1/2 — Mapped to Your Pinecone Namespaces

### Regulatory
- Regulatory Affairs (business domain)
  - FDA Regulatory Guidance → `knowledge-reg-fda`
  - EMA Regulatory Guidance → `knowledge-reg-ema`
  - ICH Guidelines → `knowledge-reg-ich`
  - Regulatory (General) → `knowledge-reg-general`
- Regulatory Compliance (business domain)
  - Regulatory (General) → `knowledge-reg-general`

### Digital Health
- SaMD → `knowledge-dh-samd`
- Interoperability (FHIR/HL7) → `knowledge-dh-interop`
- Cybersecurity & Data Protection → `knowledge-dh-cybersec`
- Digital Health Foundations → `knowledge-dh-general`

### Clinical
- Clinical Development (business domain)
  - Clinical Trials → `knowledge-clinical-trials`
  - Clinical Operations → `knowledge-clinical-ops`
  - Biostatistics → `knowledge-clinical-biostat`

### Medical Affairs
- Medical Affairs (business domain)
  - MSL → `knowledge-ma-msl`
  - Medical Information → `knowledge-ma-info`
  - Medical Education → `knowledge-ma-education`
  - Scientific Communications → `knowledge-ma-comms`

### HEOR & Market Access
- Market Access (business domain)
  - RWE → `knowledge-heor-rwe`
  - HEOR Economics → `knowledge-heor-econ`
  - Access / Pricing / Reimbursement → `knowledge-heor-access`

### Safety
- Pharmacovigilance (business domain)
  - PV / Drug Safety → `knowledge-safety-pv`
- Drug Safety (business domain)  
  - PV / Drug Safety → `knowledge-safety-pv`  
  **Normalization note**: treat Drug Safety as a synonym/alias or a child node under Safety.

### Manufacturing & Supply
- Manufacturing (business domain)
- Supply Chain (business domain)
  - Industry (ops content) → `knowledge-industry`
  - Best Practices → `knowledge-best-practices`

### Commercial
- Commercial Operations (business domain)
  - Industry → `knowledge-industry`
  - Best Practices → `knowledge-best-practices`

### R&D
- Research & Development (business domain)
- Preclinical Research (business domain)
  - General (methods) → `knowledge-general`
  - Industry (context) → `knowledge-industry`

### Cross-Cutting
- General Pharmaceutical
- Evidence-Based Medicine
  - General Knowledge → `knowledge-general`
  - Industry Reports → `knowledge-industry`

### Operating Model
- Best Practices → `knowledge-best-practices`
- Futures Thinking / Innovation → `knowledge-futures`
- Coaching / Professional Development → `knowledge-coaching`

---

# PART IX — Governance & Operating Model Appendix (How to Keep This Clean)

## 1) Ownership Model (RACI)

Define ownership at three levels:

### A. Domain Owner (Business)
- Owns domain scope, boundaries, and lifecycle transitions.
- Approves: new subdomains, deprecations, major scope changes.

### B. Knowledge Steward (Content)
- Owns ingestion standards, metadata completeness, source hygiene.
- Runs: freshness reviews, gap remediation, content cleanup.

### C. Platform Owner (Engineering)
- Owns schema, connectors, retrieval configs, and performance.
- Runs: migrations, indexing, eval automation, alerting.

## 2) Change Control (No Taxonomy Drift)

### What requires a controlled change request
- Adding a new domain or moving a domain in hierarchy
- Renaming a domain (slug changes)
- Changing domain_type
- Changing domain→namespace mapping
- Changing required metadata fields for a domain

### What can be self-service
- Adding documents that meet metadata requirements
- Adding sources to an existing source category
- Adding non-breaking tags

## 3) Lifecycle Gates (CREATE → BUILD → EVALUATE → DEPLOY → MONITOR)

Align lifecycle to your domain lifecycle framework (draft → building → ready_for_evaluation → approved → active → optimizing → deprecated).

### Gate 1 — CREATE
- Domain created with: name, slug, domain_type, scope, metadata schema.
- Domain namespaces configured.

### Gate 2 — BUILD
- Documents ingested with required metadata.
- Chunking + embeddings completed.
- Entities extracted (where applicable).

### Gate 3 — EVALUATE
- Test suite exists.
- Precision/Recall/MRR/latency thresholds met.

### Gate 4 — DEPLOY
- Connected to agents via domain mappings.
- Retrieval config stored per agent (strategy, thresholds).

### Gate 5 — MONITOR
- Search logs + alerts enabled.
- Freshness and gap detection operational.

## 4) KPI Set (Executive + Operational)

### Quality
- Precision@K, Recall, MRR
- Entity match rate
- No-results rate

### Performance
- Latency P50/P95
- Error rate

### Governance
- % docs meeting required metadata
- # stale docs
- # unresolved gaps

### Cost
- Query cost per domain
- Vector footprint per namespace

## 5) Release Checklist (Production Safety)

- Schema migrations applied and validated
- Backfill complete
- Constraints enforced
- Legacy columns/tables read-only
- Evaluation suite passes
- Monitoring/alerts enabled
- Rollback tested

---

# PART X — Implementation Deliverables (What to Build Next)

1) **SQL migration scripts** per phase (Phase 1–8)
2) **Seed scripts** for canonical domain tree + namespaces
3) **Data quality dashboards** (metadata completeness, freshness, search quality)
4) **Operational runbooks** (on-call, incident response, rollback)

---

# END OF HANDBOOK
## Additional Suggestions (Dec 2025)
- Generate a staged migration blueprint from this handbook (non-breaking: add columns/junctions, backfill, then enforce constraints) to move agents/domains/sources onto the canonical FK model.
- Instantiate a concrete domain tree using current domains and Pinecone namespaces; assign `domain_type`, lifecycle defaults, and namespace mappings up front.
- Define governance ops: domain ownership + change control + quality gates (evaluation suites, stale-content alerts, namespace health checks).
- Consolidate knowledge document storage to one canonical table with chunk/embedding pipeline; deprecate legacy tables via views until cutover.
- Add Pinecone namespace map table (domain → namespace, optional weights) to keep namespace strings out of agents/documents and avoid drift.

---

## Staged Migration Blueprint (non-breaking, backfill-safe)
1) **Schema prep (no data changes)**
   - `knowledge_domains`: add `slug UNIQUE NOT NULL`, `domain_type NOT NULL` (temporary default allowed), and lifecycle columns if missing (`status`, `last_sync_at`, `sync_frequency_hours`).
   - `agent_knowledge_domains`: add `domain_id UUID NULL` (FK to `knowledge_domains`), keep `domain_name` temporarily.
   - `document_domains` (new): `document_id FK → knowledge_documents`, `domain_id FK → knowledge_domains`, `is_primary`, `relevance_score`, UNIQUE(document_id, domain_id).
   - `domain_namespaces` (new): `domain_id FK → knowledge_domains`, `namespace_key`, `is_default`, `weight`.
   - Enforce FK on `knowledge_domain_mapping.source_id → sources(id)` if not already.

2) **Backfill domains**
   - Generate slugs for existing `knowledge_domains.name` where missing.
   - Insert any `domain_name` in `agent_knowledge_domains` not found by slug/name into `knowledge_domains` with a default `domain_type` (e.g., `business_function`), and create slugs.
   - (Optional) Fold specialized tables (diseases, therapeutic areas, evidence types, regulatory frameworks) into `knowledge_domains` or link via FK `knowledge_domain_id`.

3) **Backfill junctions**
   - Set `agent_knowledge_domains.domain_id` by case-insensitive match on `domain_name` to `knowledge_domains.name/slug`.
   - Populate `document_domains` from any legacy `domain/domain_id` fields on `knowledge_documents` (text → FK).
   - Populate `domain_namespaces` from known Pinecone namespaces (one-to-many; mark defaults).

4) **Tighten constraints**
   - `agent_knowledge_domains.domain_id` NOT NULL; drop/ignore `domain_name`.
   - `knowledge_domains.slug` UNIQUE, `domain_type` NOT NULL.
   - Add UNIQUEs: `(document_id, domain_id)` on `document_domains`; `(domain_id, namespace_key)` on `domain_namespaces`; `(source_id, domain_id)` on `knowledge_domain_mapping`.
   - Add partial unique if desired: one primary domain per agent `(agent_id) WHERE is_primary_domain`.

5) **Deprecate duplicates**
   - Consolidate document storage to `knowledge_documents`; create views on legacy tables until cutover.
   - Choose one chunk table (`document_chunks`) and convert others (`knowledge_chunks`) to views or drop after cutover.

6) **Validation**
   - Report agents with unresolved `domain_id` and resolve manually.
   - Report `agent_knowledge` rows with invalid `source_id` (missing in `sources`); null or create placeholder sources.
   - Run counts: agents with domains, documents per domain, chunks per document, namespaces per domain.

---

## Concrete Domain Tree + Namespace Mapping (seed suggestion)
> Align Level 0/1 with business pillars; map Level 1/2 to Pinecone namespaces.

**Level 0 (pillars / domain_type examples)**
- Regulatory (`regulatory`)
- Clinical (`clinical`)
- Safety (`safety`)
- Quality (`quality`)
- Manufacturing & Supply (`manufacturing`)
- Medical Affairs (`medical_affairs`)
- HEOR & Market Access (`market_access`)
- Commercial (`commercial`)
- Digital Health (`digital_health`)
- Cross-Cutting / Methods & Standards (`cross_cutting`)
- Operating Model / Playbooks (`operating_model`)

**Level 1/2 (map your namespaces)**
- Examples: `knowledge-reg-fda`, `knowledge-ma-msl`, `knowledge-dh-samd`, `knowledge-commercial`, etc.
- Assign `domain_type` aligned to pillar (e.g., `knowledge-reg-fda` → Regulatory; `knowledge-ma-msl` → Medical Affairs; `knowledge-dh-samd` → Digital Health).
- Seed `domain_namespaces`:
  - `domain_id` (FK to kd)
  - `namespace_key` (e.g., `knowledge-reg-fda`)
  - `is_default` (true/false)
  - `weight` (optional for fusion)

**Status/lifecycle defaults**
- New domains: `status = 'draft'`, `sync_frequency_hours` as per ingestion cadence (e.g., 24–168h), `last_sync_at` null.

---

## Front-End Alignment (current wiring)
- `/api/knowledge-domains` now returns live `knowledge_domains` (id/name/slug/domain_type/is_active). UI consumers should fetch this instead of static constants.
- `/app/(app)/knowledge` uses the live domain list for filters (falls back to static constants if the API is empty).
- `/features/knowledge/knowledge-viewer` pulls domains from the same API for search filters, with a guarded fallback.
- `/app/(app)/knowledge/documents` now sources domains from the API rather than legacy `knowledge_domains_new`, so filter values align to `slug`.
- `/api/knowledge/bases` now serves marketplace data from `knowledge_sources`; if empty, it falls back to `knowledge_documents` + `document_domains` (slug-based). Ensure at least one of these tables is populated to avoid an empty marketplace.
- Next step: replace mocked RAG data in `/knowledge/page.tsx` with real knowledge base data (done via `/api/knowledge/bases`); consider richer aggregation (docs/chunks per base) via a dedicated `knowledge_bases` view.
- UX split: `/knowledge` is the marketplace (browse/use), `/designer/knowledge` is the builder (create/manage domains, sources, documents, evals). Keep filters/components shared and driven by `/api/knowledge-domains` to avoid divergence.
- Pinecone namespaces ↔ Supabase domains: seed `knowledge_domains` slugs matching namespaces (e.g., reg-fda, dh-samd) and map them in `domain_namespaces` for cross-link; seed `knowledge_sources` with at least (id, title, file_name, domain, chunk_count, metadata) so `/knowledge` has entries even before documents are linked.

---

## Governance & Operating Model (appendix)
- **Ownership:** Assign domain owners; require approvals for domain merges/splits and namespace changes.
- **Change control:** PRD-style change requests for taxonomy changes; migration scripts for slug changes (with redirects/aliases if needed).
- **Quality gates:** Evaluation suites per domain (precision/recall/MRR/latency targets); stale-content alerts; namespace health checks (missing embeddings, drift).
- **Access:** Use `visibility` (public/tenant/private) and RLS on domain-linked tables; restrict write access to domain and namespace tables.
- **Audit readiness:** Track `created_by/updated_by`, log search queries (`search_logs`), and maintain document version history.
