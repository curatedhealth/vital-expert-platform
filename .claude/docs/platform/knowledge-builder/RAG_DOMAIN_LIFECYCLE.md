# RAG Domain Lifecycle

> **Complete Guide**: Create, Build, Evaluate, Deploy, and Monitor Knowledge Domains
>
> This document provides step-by-step workflows for managing RAG domains throughout their lifecycle.

---

## Overview

Every RAG domain in VITAL follows a structured lifecycle that ensures quality, reliability, and continuous improvement:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RAG Domain Lifecycle                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌─────────┐     ┌─────────┐     ┌──────────┐     ┌────────┐     ┌─────────┐│
│   │ CREATE  │────▶│  BUILD  │────▶│ EVALUATE │────▶│ DEPLOY │────▶│ MONITOR ││
│   └─────────┘     └─────────┘     └──────────┘     └────────┘     └─────────┘│
│       │               │                │               │               │      │
│       ▼               ▼                ▼               ▼               ▼      │
│   Define &        Process &        Test &          Connect &       Track &    │
│   Configure       Embed            Validate        Activate        Optimize   │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: CREATE

**Purpose**: Define and configure a new knowledge domain with proper metadata, scope, and structure.

### 1.1 Domain Definition

Navigate to **Knowledge Builder → Domains** and click **Create New Domain**.

#### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Human-readable domain name | "FDA Regulatory Guidance" |
| **Slug** | URL-safe identifier | `fda-regulatory-guidance` |
| **Description** | Purpose and scope | "FDA guidance documents for drug approvals..." |
| **Domain Type** | Category of knowledge | `regulatory`, `clinical`, `commercial`, etc. |
| **Status** | Lifecycle stage | `draft` → `building` → `active` → `deprecated` |

#### Configuration Options

```typescript
interface DomainConfig {
  // Identity
  name: string;
  slug: string;
  description: string;
  domain_type: 'regulatory' | 'clinical' | 'research' | 'commercial' | 'internal';

  // Scope
  therapeutic_areas: string[];      // e.g., ['oncology', 'cardiology']
  geographic_regions: string[];     // e.g., ['us', 'eu', 'global']
  document_types: string[];         // e.g., ['guidance', 'protocol', 'sop']

  // Processing
  embedding_model: 'text-embedding-3-small' | 'text-embedding-3-large';
  chunk_size: number;               // Default: 500 tokens
  chunk_overlap: number;            // Default: 50 tokens

  // Access
  visibility: 'public' | 'tenant' | 'private';
  tenant_id?: string;
  allowed_roles?: string[];
}
```

### 1.2 Namespace Configuration

Each domain maps to a **Pinecone namespace** for vector isolation:

```
Namespace Pattern: {tenant_slug}_{domain_slug}
Example: pharma_co_fda_regulatory_guidance
```

**Benefits of Namespaces:**
- Query isolation per domain
- Tenant-level data separation
- Efficient vector pruning
- Cost optimization (query only relevant vectors)

### 1.3 Metadata Schema

Define domain-specific metadata fields for better retrieval:

```typescript
interface DomainMetadataSchema {
  // Standard fields (always present)
  source_name: string;
  document_type: string;
  year: number;

  // Domain-specific (configurable)
  regulatory_body?: string;         // For regulatory domains
  therapeutic_area?: string;        // For clinical domains
  drug_name?: string;               // For pharmaceutical domains
  trial_phase?: string;             // For clinical trial domains
  compliance_status?: string;       // For compliance domains
}
```

### 1.4 Create Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│                    CREATE Phase Workflow                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Define Domain Identity                                        │
│     └─▶ Name, slug, description, type                            │
│                                                                   │
│  2. Configure Scope                                               │
│     └─▶ Therapeutic areas, regions, document types               │
│                                                                   │
│  3. Set Processing Parameters                                     │
│     └─▶ Embedding model, chunk size, overlap                     │
│                                                                   │
│  4. Define Metadata Schema                                        │
│     └─▶ Required fields, optional fields, validation rules      │
│                                                                   │
│  5. Configure Access Control                                      │
│     └─▶ Visibility, tenant, roles                                │
│                                                                   │
│  6. Create Pinecone Namespace                                     │
│     └─▶ Auto-generated: {tenant}_{domain}                        │
│                                                                   │
│  Status: draft → ready_for_build                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Phase 2: BUILD

**Purpose**: Process documents, extract entities, generate embeddings, and populate the vector store.

### 2.1 Document Upload

Use the **Enhanced Upload Mode** for best results:

```typescript
// Document processing pipeline
async function buildDomain(domainId: string, files: File[]) {
  for (const file of files) {
    // 1. Extract metadata from filename
    const filenameMeta = await smartMetadataExtractor.extractFromFilename(file.name);

    // 2. Read and parse document content
    const content = await parseDocument(file);

    // 3. Extract metadata from content (optional AI enhancement)
    const contentMeta = await smartMetadataExtractor.extractFromContent(content, file.name);

    // 4. Merge metadata sources
    const metadata = smartMetadataExtractor.mergeMetadata(filenameMeta, contentMeta);

    // 5. Generate standardized filename
    const cleanFilename = fileRenamer.generateFilename(metadata);

    // 6. Store document record
    const docId = await createDocumentRecord(domainId, metadata, content);

    // 7. Chunk and embed
    await processDocumentChunks(docId, content, metadata);
  }
}
```

### 2.2 Chunking Strategy

Configure chunking based on document type:

| Document Type | Chunk Size | Overlap | Strategy |
|--------------|------------|---------|----------|
| **Regulatory Guidance** | 500 tokens | 50 | Semantic boundaries |
| **Research Papers** | 400 tokens | 40 | Section-aware |
| **Clinical Protocols** | 600 tokens | 60 | Paragraph-based |
| **SOPs** | 300 tokens | 30 | Step-based |
| **General Documents** | 500 tokens | 50 | Recursive split |

### 2.3 Entity Extraction

Use **LangExtract** pipeline for medical entity extraction:

```typescript
import { getLangExtractPipeline } from '@/lib/services/extraction/langextract-pipeline';

async function extractEntities(documentId: string, content: string) {
  const langExtract = getLangExtractPipeline();

  const extraction = await langExtract.extract(content, 'clinical_protocol');

  // Entities extracted:
  // - Medications (drug names, dosages)
  // - Diagnoses (conditions, diseases)
  // - Procedures (treatments, interventions)
  // - Protocol steps (sequential actions)
  // - Patient populations (inclusion/exclusion)
  // - Adverse events (safety signals)
  // - Regulatory requirements (compliance items)

  await storeExtractedEntities(documentId, extraction.entities);
  await storeRelationships(documentId, extraction.relationships);
}
```

### 2.4 Embedding Generation

```typescript
import { unifiedRAGService } from '@/lib/services/rag/unified-rag-service';

async function generateEmbeddings(chunks: TextChunk[], domain: string) {
  for (const chunk of chunks) {
    await unifiedRAGService.addDocument({
      title: chunk.source_title,
      content: chunk.text,
      domain: domain,
      source_name: chunk.metadata.source_name,
      document_type: chunk.metadata.document_type,
      // ... comprehensive metadata
    });
  }
}
```

### 2.5 Build Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│                    BUILD Phase Workflow                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Upload Documents                                              │
│     └─▶ Drag & drop or API upload                                │
│                                                                   │
│  2. Extract Metadata                                              │
│     └─▶ SmartMetadataExtractor (filename + content + AI)         │
│                                                                   │
│  3. Standardize Filenames                                         │
│     └─▶ FileRenamer: {Source}_{Type}_{Year}_{Title}              │
│                                                                   │
│  4. Parse & Chunk                                                 │
│     └─▶ Domain-specific chunking strategy                        │
│                                                                   │
│  5. Extract Entities                                              │
│     └─▶ LangExtract pipeline (medications, diagnoses, etc.)      │
│                                                                   │
│  6. Generate Embeddings                                           │
│     └─▶ OpenAI text-embedding-3-small/large                      │
│                                                                   │
│  7. Store in Vector DB                                            │
│     └─▶ Pinecone namespace: {tenant}_{domain}                    │
│                                                                   │
│  Status: building → ready_for_evaluation                          │
└──────────────────────────────────────────────────────────────────┘
```

### 2.6 Build Progress Tracking

```typescript
interface BuildProgress {
  total_documents: number;
  processed_documents: number;
  total_chunks: number;
  embedded_chunks: number;
  entities_extracted: number;
  errors: BuildError[];
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimated_completion: Date;
}
```

---

## Phase 3: EVALUATE

**Purpose**: Test retrieval quality, accuracy, and relevance before deployment.

### 3.1 Benchmark Queries

Create a **Query Test Suite** for each domain:

```typescript
interface QueryTestSuite {
  domain_id: string;
  name: string;
  queries: BenchmarkQuery[];
}

interface BenchmarkQuery {
  query: string;
  expected_sources: string[];      // Document IDs that should be retrieved
  expected_entities: string[];     // Entities that should be detected
  min_relevance_score: number;     // Threshold (0-1)
  ground_truth_answer?: string;    // For answer accuracy testing
}
```

### 3.2 Evaluation Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **Precision@K** | Relevant results in top K | > 80% |
| **Recall** | % of relevant docs retrieved | > 70% |
| **MRR** | Mean Reciprocal Rank | > 0.6 |
| **Entity Match Rate** | Query entities found in results | > 85% |
| **Latency P50** | Median query time | < 500ms |
| **Latency P95** | 95th percentile query time | < 2000ms |

### 3.3 Evaluation Workflow

```typescript
async function evaluateDomain(domainId: string, testSuite: QueryTestSuite) {
  const results: EvaluationResult[] = [];

  for (const benchmark of testSuite.queries) {
    // Execute search
    const searchResults = await entityAwareHybridSearch.search({
      text: benchmark.query,
      domain: domainId,
      maxResults: 10,
      strategy: 'hybrid',
    });

    // Calculate precision
    const retrieved = searchResults.map(r => r.document_id);
    const relevant = benchmark.expected_sources;
    const precision = calculatePrecision(retrieved, relevant);

    // Check entity detection
    const detectedEntities = searchResults.flatMap(r => r.matched_entities);
    const entityMatchRate = calculateEntityMatch(detectedEntities, benchmark.expected_entities);

    // Record result
    results.push({
      query: benchmark.query,
      precision,
      entityMatchRate,
      latency: searchResults.latency,
      passed: precision >= benchmark.min_relevance_score,
    });
  }

  return generateEvaluationReport(results);
}
```

### 3.4 A/B Testing Strategies

Compare retrieval strategies before deployment:

```typescript
interface ABTest {
  domain_id: string;
  strategy_a: 'vector' | 'hybrid' | 'entity-aware';
  strategy_b: 'vector' | 'hybrid' | 'entity-aware';
  test_queries: string[];
  metrics: ('precision' | 'recall' | 'latency')[];
}

// Example: Compare hybrid vs entity-aware
const abTest = await runABTest({
  domain_id: 'fda-regulatory',
  strategy_a: 'hybrid',
  strategy_b: 'entity-aware',
  test_queries: benchmarkQueries,
  metrics: ['precision', 'recall', 'latency'],
});
```

### 3.5 Evaluation Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│                 Domain Evaluation Report                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Domain: FDA Regulatory Guidance                                  │
│  Test Suite: regulatory_benchmark_v1                              │
│  Queries Tested: 50                                               │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ METRICS SUMMARY                                              │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ Precision@5:     87.2%  ████████████████████░░░░  Target: 80%│ │
│  │ Recall:          72.5%  ███████████████░░░░░░░░░  Target: 70%│ │
│  │ MRR:             0.68   ██████████████░░░░░░░░░░  Target: 0.6│ │
│  │ Entity Match:    91.3%  ████████████████████████  Target: 85%│ │
│  │ Latency P50:     342ms  ███████░░░░░░░░░░░░░░░░░  Target:<500│ │
│  │ Latency P95:    1.2s    ████████████████░░░░░░░░  Target:<2s │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ✅ PASSED: Ready for deployment                                  │
│                                                                   │
│  Failed Queries (3):                                              │
│  - "biosimilar FDA guidance 2024" - low precision (62%)          │
│  - "REMS requirements for opioids" - missing entity detection     │
│  - "accelerated approval pathway" - wrong document ranking        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 3.6 Evaluation Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│                  EVALUATE Phase Workflow                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Create Benchmark Query Suite                                  │
│     └─▶ Define queries with expected results                     │
│                                                                   │
│  2. Run Automated Evaluation                                      │
│     └─▶ Execute all benchmark queries                            │
│                                                                   │
│  3. Calculate Metrics                                             │
│     └─▶ Precision, Recall, MRR, Entity Match, Latency            │
│                                                                   │
│  4. Review Failed Queries                                         │
│     └─▶ Analyze why specific queries failed                      │
│                                                                   │
│  5. A/B Test Strategies (optional)                                │
│     └─▶ Compare retrieval approaches                             │
│                                                                   │
│  6. Iterate if Needed                                             │
│     └─▶ Add documents, adjust chunking, tune weights             │
│                                                                   │
│  7. Generate Evaluation Report                                    │
│     └─▶ Summary with pass/fail status                            │
│                                                                   │
│  Status: ready_for_evaluation → approved_for_deployment           │
└──────────────────────────────────────────────────────────────────┘
```

---

## Phase 4: DEPLOY

**Purpose**: Connect the domain to agents and activate for production use.

### 4.1 Agent Connection

Link domains to agents that will use the knowledge:

```typescript
interface AgentDomainMapping {
  agent_id: string;
  domain_id: string;
  priority: number;           // 1 = primary, 2+ = secondary
  usage_mode: 'required' | 'optional' | 'fallback';
  query_quota?: number;       // Optional rate limiting
}

// Example: Connect domain to multiple agents
await connectDomainToAgents('fda-regulatory', [
  { agent_id: 'regulatory-advisor', priority: 1, usage_mode: 'required' },
  { agent_id: 'compliance-checker', priority: 2, usage_mode: 'optional' },
  { agent_id: 'general-assistant', priority: 3, usage_mode: 'fallback' },
]);
```

### 4.2 Retrieval Configuration

Fine-tune retrieval settings per agent:

```typescript
interface AgentRetrievalConfig {
  agent_id: string;
  domain_id: string;

  // Search settings
  strategy: 'vector' | 'hybrid' | 'entity-aware';
  max_results: number;
  similarity_threshold: number;

  // Fusion weights (for hybrid)
  vector_weight: number;
  keyword_weight: number;
  entity_weight: number;

  // Reranking
  enable_reranking: boolean;
  rerank_model?: string;

  // Context integration
  context_window: number;
  include_metadata: boolean;
  citation_format: 'apa' | 'vancouver' | 'chicago';
}
```

### 4.3 Deployment Checklist

Before activating a domain:

- [ ] Evaluation metrics meet targets (Precision > 80%, Recall > 70%)
- [ ] Entity extraction validated
- [ ] Latency acceptable (P95 < 2s)
- [ ] Agent connections configured
- [ ] Retrieval settings tuned
- [ ] Access control verified
- [ ] Backup created
- [ ] Rollback plan documented

### 4.4 Activation Process

```typescript
async function deployDomain(domainId: string) {
  // 1. Validate evaluation passed
  const evaluation = await getLatestEvaluation(domainId);
  if (!evaluation.passed) {
    throw new Error('Domain has not passed evaluation');
  }

  // 2. Create deployment snapshot
  await createDeploymentSnapshot(domainId);

  // 3. Update domain status
  await updateDomainStatus(domainId, 'active');

  // 4. Enable agent connections
  await activateAgentConnections(domainId);

  // 5. Initialize monitoring
  await initializeMonitoring(domainId);

  // 6. Log deployment event
  await logDeploymentEvent(domainId, {
    deployed_at: new Date(),
    deployed_by: currentUser.id,
    evaluation_id: evaluation.id,
    agent_count: await getConnectedAgentCount(domainId),
  });
}
```

### 4.5 Deploy Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│                   DEPLOY Phase Workflow                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Verify Evaluation Passed                                      │
│     └─▶ Check all metrics meet targets                           │
│                                                                   │
│  2. Configure Agent Connections                                   │
│     └─▶ Map domain to agents with priority                       │
│                                                                   │
│  3. Set Retrieval Parameters                                      │
│     └─▶ Strategy, thresholds, fusion weights                     │
│                                                                   │
│  4. Complete Deployment Checklist                                 │
│     └─▶ Access control, backup, rollback plan                    │
│                                                                   │
│  5. Create Deployment Snapshot                                    │
│     └─▶ Version control for rollback                             │
│                                                                   │
│  6. Activate Domain                                               │
│     └─▶ Status: active                                           │
│                                                                   │
│  7. Enable Agent Connections                                      │
│     └─▶ Agents can now query this domain                         │
│                                                                   │
│  8. Initialize Monitoring                                         │
│     └─▶ Start tracking queries, latency, errors                  │
│                                                                   │
│  Status: approved_for_deployment → active                         │
└──────────────────────────────────────────────────────────────────┘
```

---

## Phase 5: MONITOR

**Purpose**: Track performance, detect issues, and optimize over time.

### 5.1 Monitoring Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│              Domain Monitoring: FDA Regulatory Guidance           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────┐  ┌─────────────────────────────────┐│
│  │ QUERY VOLUME (24h)      │  │ LATENCY (24h)                   ││
│  │                         │  │                                  ││
│  │  ████████████████       │  │  P50: 312ms  ████████░░░░░░░░░  ││
│  │  ████████████           │  │  P95: 892ms  ████████████████░  ││
│  │  ██████████████████     │  │  P99: 1.4s   ███████████████████││
│  │  ████████████████████   │  │                                  ││
│  │                         │  │  ⚠️  3 queries > 2s threshold    ││
│  │  Total: 2,847 queries   │  │                                  ││
│  └─────────────────────────┘  └─────────────────────────────────┘│
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ TOP QUERIES (by frequency)                                   │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ 1. "FDA guidance biologics 2024"          127 queries       │ │
│  │ 2. "accelerated approval requirements"     98 queries       │ │
│  │ 3. "biosimilar interchangeability"         87 queries       │ │
│  │ 4. "REMS program requirements"             72 queries       │ │
│  │ 5. "breakthrough therapy designation"      68 queries       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ ALERTS                                                       │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ ⚠️  LOW PRECISION: "orphan drug" queries (67% vs 80% target) │ │
│  │ ⚠️  STALE CONTENT: 12 documents > 2 years old               │ │
│  │ ✅ No errors in last 24 hours                               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 Key Metrics

```typescript
interface DomainMetrics {
  // Volume
  query_count_24h: number;
  query_count_7d: number;
  query_count_30d: number;
  unique_users: number;

  // Performance
  latency_p50: number;
  latency_p95: number;
  latency_p99: number;
  error_rate: number;

  // Quality
  average_relevance_score: number;
  user_feedback_positive_rate: number;
  no_results_rate: number;

  // Coverage
  total_documents: number;
  total_chunks: number;
  documents_added_30d: number;
  stale_documents_count: number;
}
```

### 5.3 Alerting Rules

Configure alerts for proactive monitoring:

```typescript
interface AlertRule {
  metric: string;
  condition: 'above' | 'below';
  threshold: number;
  window: string;           // e.g., '1h', '24h'
  severity: 'warning' | 'critical';
  notify: string[];         // Email, Slack, etc.
}

const defaultAlertRules: AlertRule[] = [
  { metric: 'error_rate', condition: 'above', threshold: 0.05, window: '1h', severity: 'critical', notify: ['ops-team'] },
  { metric: 'latency_p95', condition: 'above', threshold: 2000, window: '1h', severity: 'warning', notify: ['eng-team'] },
  { metric: 'no_results_rate', condition: 'above', threshold: 0.10, window: '24h', severity: 'warning', notify: ['content-team'] },
  { metric: 'average_relevance_score', condition: 'below', threshold: 0.7, window: '24h', severity: 'warning', notify: ['ml-team'] },
];
```

### 5.4 Query Analytics

Track what users are searching for:

```typescript
interface QueryAnalytics {
  // Popular queries
  top_queries: { query: string; count: number }[];

  // Failed queries (no results or low relevance)
  failed_queries: { query: string; reason: string; count: number }[];

  // Entity distribution
  entity_frequency: { entity: string; type: string; count: number }[];

  // Strategy performance
  strategy_usage: { strategy: string; count: number; avg_precision: number }[];

  // Time patterns
  queries_by_hour: { hour: number; count: number }[];
  queries_by_day: { day: string; count: number }[];
}
```

### 5.5 Content Freshness

Monitor document currency:

```typescript
interface ContentFreshnessReport {
  total_documents: number;

  // Age distribution
  documents_by_age: {
    '< 6 months': number;
    '6-12 months': number;
    '1-2 years': number;
    '> 2 years': number;
  };

  // Stale content alerts
  stale_documents: {
    id: string;
    title: string;
    last_updated: Date;
    age_days: number;
    query_count: number;  // How often it's retrieved
  }[];

  // Recommended actions
  recommendations: {
    action: 'update' | 'archive' | 'review';
    document_ids: string[];
    reason: string;
  }[];
}
```

### 5.6 Reindexing Schedule

Set up periodic reindexing for optimization:

```typescript
interface ReindexSchedule {
  domain_id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;             // Cron expression
  scope: 'full' | 'incremental';

  // Incremental options
  include_new_documents: boolean;
  include_updated_documents: boolean;
  regenerate_entities: boolean;
}

// Example: Weekly incremental reindex
const schedule: ReindexSchedule = {
  domain_id: 'fda-regulatory',
  frequency: 'weekly',
  time: '0 2 * * 0',        // Sunday 2am
  scope: 'incremental',
  include_new_documents: true,
  include_updated_documents: true,
  regenerate_entities: false,
};
```

### 5.7 Monitor Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│                  MONITOR Phase Workflow                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Real-time Metrics Collection                                  │
│     └─▶ Query volume, latency, errors                            │
│                                                                   │
│  2. Quality Tracking                                              │
│     └─▶ Relevance scores, user feedback                          │
│                                                                   │
│  3. Query Analytics                                               │
│     └─▶ Popular queries, failed queries, patterns                │
│                                                                   │
│  4. Alert Management                                              │
│     └─▶ Configure rules, receive notifications                   │
│                                                                   │
│  5. Content Freshness Review                                      │
│     └─▶ Identify stale documents, schedule updates               │
│                                                                   │
│  6. Performance Optimization                                      │
│     └─▶ Tune retrieval settings, adjust weights                  │
│                                                                   │
│  7. Scheduled Reindexing                                          │
│     └─▶ Incremental updates, full rebuilds                       │
│                                                                   │
│  Continuous: active → optimizing → active                         │
└──────────────────────────────────────────────────────────────────┘
```

---

## Complete Lifecycle Summary

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        RAG DOMAIN LIFECYCLE                                 │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────┐     ┌─────────┐     ┌──────────┐     ┌────────┐     ┌────────┐│
│  │ CREATE  │────▶│  BUILD  │────▶│ EVALUATE │────▶│ DEPLOY │────▶│MONITOR ││
│  │         │     │         │     │          │     │        │     │        ││
│  │ Define  │     │ Process │     │ Test &   │     │Connect │     │ Track  ││
│  │ Config  │     │ Embed   │     │ Validate │     │Activate│     │Optimize││
│  └─────────┘     └─────────┘     └──────────┘     └────────┘     └────────┘│
│       │               │                │               │               │    │
│       ▼               ▼                ▼               ▼               ▼    │
│   • Domain ID     • Chunking      • Precision      • Agent        • Metrics │
│   • Metadata      • Entities      • Recall         Mapping       • Alerts  │
│   • Namespace     • Embeddings    • Latency        • Config       • Query  │
│   • Access        • Storage       • A/B Test       • Activate     Analytics│
│                                                                             │
│  Status Flow:                                                               │
│  draft → building → ready_for_evaluation → approved → active → optimizing  │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## API Reference

### Domain Management

```typescript
// Create domain
POST /api/knowledge-domains
Body: DomainConfig

// Get domain
GET /api/knowledge-domains/:id

// Update domain
PATCH /api/knowledge-domains/:id
Body: Partial<DomainConfig>

// Delete domain (soft delete)
DELETE /api/knowledge-domains/:id

// List domains
GET /api/knowledge-domains?status=active&type=regulatory
```

### Build Operations

```typescript
// Upload documents
POST /api/knowledge-domains/:id/documents
Body: FormData (files + metadata)

// Get build progress
GET /api/knowledge-domains/:id/build-status

// Trigger reindex
POST /api/knowledge-domains/:id/reindex
Body: { scope: 'full' | 'incremental' }
```

### Evaluation

```typescript
// Create test suite
POST /api/knowledge-domains/:id/test-suites
Body: QueryTestSuite

// Run evaluation
POST /api/knowledge-domains/:id/evaluate
Body: { test_suite_id: string }

// Get evaluation results
GET /api/knowledge-domains/:id/evaluations/:eval_id
```

### Deployment

```typescript
// Connect to agent
POST /api/knowledge-domains/:id/agent-connections
Body: AgentDomainMapping

// Deploy domain
POST /api/knowledge-domains/:id/deploy

// Rollback
POST /api/knowledge-domains/:id/rollback
Body: { snapshot_id: string }
```

### Monitoring

```typescript
// Get metrics
GET /api/knowledge-domains/:id/metrics?period=24h

// Get query analytics
GET /api/knowledge-domains/:id/analytics/queries?period=7d

// Get alerts
GET /api/knowledge-domains/:id/alerts?status=active

// Configure alerts
POST /api/knowledge-domains/:id/alerts
Body: AlertRule
```

---

## Best Practices

### Domain Design

1. **Single Responsibility**: Each domain should cover one coherent topic area
2. **Appropriate Scope**: Not too narrow (few docs) or too broad (low precision)
3. **Clear Boundaries**: Document types and sources should be consistent
4. **Metadata Consistency**: All documents should have the same required fields

### Build Quality

1. **Chunk Thoughtfully**: Match chunk size to document structure
2. **Extract Entities**: Enable entity extraction for medical/pharma domains
3. **Validate Uploads**: Check metadata quality before processing
4. **Monitor Progress**: Track build status and handle errors

### Evaluation Rigor

1. **Representative Queries**: Use real user queries as benchmarks
2. **Diverse Coverage**: Test edge cases, not just common queries
3. **Continuous Testing**: Re-evaluate after content updates
4. **A/B Test Changes**: Compare before/after for retrieval changes

### Deployment Safety

1. **Staged Rollout**: Deploy to test agents before production
2. **Rollback Plan**: Always have a way to revert
3. **Monitor Closely**: Watch metrics for 24-48 hours post-deploy
4. **Document Changes**: Log what changed and why

### Monitoring Discipline

1. **Set Alerts Early**: Configure alerts before issues occur
2. **Review Regularly**: Weekly analytics review for each domain
3. **Act on Insights**: Use query analytics to improve content
4. **Refresh Content**: Remove stale documents, add new ones

---

## Troubleshooting

### Common Issues

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Low Precision** | Irrelevant results | Tune similarity threshold, add domain-specific entities |
| **Low Recall** | Missing expected docs | Increase max_results, check chunking strategy |
| **High Latency** | Slow queries | Reduce chunk count, enable caching, use smaller embeddings |
| **No Results** | Empty result sets | Check namespace, verify embeddings exist |
| **Entity Miss** | Entities not detected | Update entity dictionary, retrain extraction |

### Debug Queries

```typescript
// Check domain health
const health = await checkDomainHealth(domainId);
// Returns: { vector_count, entity_count, last_updated, error_rate }

// Test specific query
const debug = await debugQuery(domainId, query);
// Returns: { vector_results, keyword_results, entity_matches, fusion_scores }

// Compare strategies
const comparison = await compareStrategies(domainId, query);
// Returns: { vector: [...], hybrid: [...], entity_aware: [...] }
```

---

## Related Documentation

- [Knowledge Builder README](./README.md)
- [Knowledge Builder Enhancements](./KNOWLEDGE_BUILDER_ENHANCEMENTS.md)
- [Existing Components](./KNOWLEDGE_BUILDER_EXISTING_COMPONENTS.md)
- [Implementation Plan](./KNOWLEDGE_BUILDER_IMPLEMENTATION_PLAN.md)
