# VITAL Platform Knowledge Capabilities
## Strategic Overview and Technical Architecture

**Version:** 1.0.0
**Last Updated:** November 28, 2025
**Status:** Production Ready

---

## Executive Summary

The VITAL Platform implements a sophisticated multi-modal knowledge retrieval system called **GraphRAG** (Graph-enhanced Retrieval Augmented Generation). This system enables AI advisory agents to access, retrieve, and synthesize information from a curated digital health knowledge base with high precision and contextual relevance.

### Key Capabilities

| Capability | Status | Description |
|------------|--------|-------------|
| Vector Search | Active | Semantic similarity search via Pinecone |
| Keyword Search | Active | BM25 exact-match via Elasticsearch |
| Graph Search | Active | Knowledge graph traversal via Neo4j |
| Hybrid Fusion | Active | RRF-based multi-modal result fusion |
| Source Authority | Active | Credibility-weighted result boosting |
| Reranking | Active | Cohere neural reranking |
| Agent Profiles | Active | Customized RAG per agent type |

---

## 1. Knowledge Base Statistics

### Current State

| Metric | Count | Notes |
|--------|-------|-------|
| **Documents** | 298 | Supabase `knowledge_documents` |
| **Vector Embeddings** | 10,924 | Pinecone `vital-knowledge` index |
| **Graph Nodes** | 712 | Neo4j (Document, Domain, Source, Type) |
| **Graph Relationships** | 733 | BELONGS_TO, FROM_SOURCE, HAS_TYPE |
| **Sources** | 371 | Authoritative source registry |
| **Document Types** | 25 | Classification taxonomy |

### Domain Distribution

| Domain | Document Count |
|--------|----------------|
| Digital Health | 89 |
| Regulations & Compliance | 67 |
| Use Cases & Best Practices | 52 |
| Digital Health Foundations | 41 |
| Clinical Research | 23 |
| Startups | 15 |
| Change Management | 8 |
| Design Thinking | 3 |

---

## 2. System Architecture

### 2.1 Data Flow

```
User Query
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│                    GraphRAG Service                      │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Profile Resolver                     │    │
│  │  (Agent-specific RAG profile + KG view)          │    │
│  └─────────────────────────────────────────────────┘    │
│                         │                                │
│    ┌────────────────────┼────────────────────┐          │
│    ▼                    ▼                    ▼          │
│ ┌──────────┐     ┌──────────┐         ┌──────────┐     │
│ │  Vector  │     │ Keyword  │         │  Graph   │     │
│ │  Search  │     │  Search  │         │  Search  │     │
│ │(Pinecone)│     │(Elastic) │         │ (Neo4j)  │     │
│ └────┬─────┘     └────┬─────┘         └────┬─────┘     │
│      │                │                    │            │
│      └────────────────┼────────────────────┘            │
│                       ▼                                  │
│            ┌─────────────────────┐                      │
│            │   Hybrid Fusion    │                      │
│            │   (RRF Algorithm)   │                      │
│            └─────────┬───────────┘                      │
│                      ▼                                   │
│            ┌─────────────────────┐                      │
│            │ Authority Booster  │                      │
│            │ (Source + Type)     │                      │
│            └─────────┬───────────┘                      │
│                      ▼                                   │
│            ┌─────────────────────┐                      │
│            │    Reranker        │                      │
│            │   (Cohere v3)       │                      │
│            └─────────┬───────────┘                      │
│                      ▼                                   │
│            ┌─────────────────────┐                      │
│            │ Evidence Builder   │                      │
│            │ (Citations + Chain) │                      │
│            └─────────────────────┘                      │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
              GraphRAG Response
          (Chunks + Citations + Metadata)
```

### 2.2 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Vector DB | Pinecone | Semantic embeddings (3072-dim) |
| Graph DB | Neo4j Aura | Knowledge graph relationships |
| Relational DB | Supabase PostgreSQL | Document metadata, sources |
| Keyword Search | Elasticsearch | BM25 exact match |
| Embeddings | OpenAI text-embedding-3-large | High-quality vectors |
| Reranking | Cohere rerank-v3 | Neural relevance scoring |
| AI Engine | Python + FastAPI | Service orchestration |

---

## 3. RAG Strategies

### 3.1 Strategy Comparison Matrix

| Strategy | Vector | Keyword | Graph | Best For |
|----------|--------|---------|-------|----------|
| **Semantic Standard** | 1.0 | 0.0 | 0.0 | Conceptual questions |
| **Hybrid Enhanced** | 0.6 | 0.4 | 0.0 | General queries |
| **GraphRAG Entity** | 0.4 | 0.2 | 0.4 | Relationship queries |
| **Regulatory Precision** | 0.3 | 0.6 | 0.1 | Compliance lookups |
| **Clinical Evidence** | 0.45 | 0.35 | 0.2 | Medical evidence |
| **Research Comprehensive** | 0.5 | 0.25 | 0.25 | Literature review |
| **Startup Advisory** | 0.5 | 0.3 | 0.2 | Business guidance |

### 3.2 Strategy Details

#### Regulatory Precision
- **Fusion:** Keyword-heavy (0.6) for exact regulatory terms
- **Threshold:** 0.8 (high precision)
- **Chunk Size:** Granular (500 chars) for precise extraction
- **Authority Boost:** Maximum (1.0) - regulatory sources prioritized
- **Use Cases:** FDA submissions, HIPAA compliance, device classification

#### Clinical Evidence
- **Fusion:** Balanced with graph (0.45/0.35/0.2)
- **Threshold:** 0.7 (balanced)
- **Chunk Size:** Contextual (2000 chars) for clinical context
- **Authority Boost:** High (1.0) - peer-reviewed sources prioritized
- **Use Cases:** Clinical trials, treatment protocols, evidence review

#### Startup Advisory
- **Fusion:** Semantic-leaning (0.5/0.3/0.2)
- **Threshold:** 0.65 (broader recall)
- **Chunk Size:** Standard (1000 chars)
- **Authority Boost:** Medium (0.8) - more tolerant of industry sources
- **Use Cases:** Market entry, funding, business strategy

---

## 4. Agent-Specific RAG Profiles

### 4.1 VITAL Advisory Board Agents

| Agent | Strategy | Key Focus | Authority Preference |
|-------|----------|-----------|---------------------|
| **Regulatory Expert** | Regulatory Precision | FDA, HIPAA, compliance | Regulatory docs |
| **Clinical Advisor** | Clinical Evidence | Trials, protocols | Peer-reviewed |
| **Business Strategist** | Startup Advisory | Market, funding | Case studies |
| **Technical Architect** | Hybrid Enhanced | Standards, FHIR | Technical specs |
| **UX Lead** | Research Comprehensive | User research | Design patterns |
| **Data Scientist** | GraphRAG Entity | ML/AI, analytics | Technical papers |
| **Legal Counsel** | Regulatory Precision | IP, contracts | Legal precedents |
| **Operations Manager** | Hybrid Enhanced | Implementation | Best practices |

### 4.2 Knowledge Graph Views

Each agent has a tailored view of the knowledge graph:

**Regulatory Expert KG View:**
- Nodes: Regulation, Guideline, Agency, Requirement
- Edges: REGULATES, REQUIRES, SUPERSEDES
- Max Hops: 2

**Clinical Advisor KG View:**
- Nodes: Study, Treatment, Outcome, Condition, Drug
- Edges: TREATS, CAUSES, PREVENTS, STUDIES
- Max Hops: 3

**Technical Architect KG View:**
- Nodes: System, Standard, Protocol, API, Integration
- Edges: INTEGRATES_WITH, IMPLEMENTS, REQUIRES
- Max Hops: 3

---

## 5. Source Authority System

### 5.1 Source Credibility Weights

| Source Category | Weight | Examples |
|-----------------|--------|----------|
| **Tier 1 - Regulatory** | 1.00 | FDA, CMS, HHS, EMA |
| **Tier 2 - Academic** | 0.95 | NEJM, JAMA, Lancet |
| **Tier 3 - Professional** | 0.90 | AMA, HIMSS, AMIA |
| **Tier 4 - Industry** | 0.80 | McKinsey, Deloitte |
| **Tier 5 - General** | 0.75 | Default for unknown |
| **Tier 6 - Commentary** | 0.55 | Blogs, opinions |

### 5.2 Document Type Weights

| Document Type | Weight | Description |
|---------------|--------|-------------|
| **Peer Review** | 1.00 | Published research |
| **Guideline** | 1.00 | Official guidelines |
| **Regulatory** | 0.95 | Government regulations |
| **Technical Spec** | 0.90 | Standards documents |
| **Textbook** | 0.90 | Educational resources |
| **Case Study** | 0.85 | Real-world examples |
| **White Paper** | 0.80 | Industry analysis |
| **Presentation** | 0.70 | Conference materials |
| **Blog** | 0.55 | Commentary/opinion |

### 5.3 Authority Boost Formula

```
boosted_score = original_score * (1 + boost_delta * 0.5)
boost_delta = (combined_weight - 0.5) * 2
combined_weight = source_weight * type_weight
```

---

## 6. Chunking Strategies

### 6.1 Available Strategies

| Strategy | Chunk Size | Overlap | Use Case |
|----------|------------|---------|----------|
| **Standard** | 1000 chars | 200 | General purpose |
| **Granular** | 500 chars | 100 | Precision extraction |
| **Contextual** | 2000 chars | 400 | Long-form context |
| **Semantic** | Variable | Paragraph boundaries | Natural breaks |
| **Hybrid** | Multiple | All sizes | A/B testing |

### 6.2 Strategy Selection Guide

- **Regulatory queries:** Use Granular - precise term matching
- **Clinical evidence:** Use Contextual - maintain medical context
- **General research:** Use Standard - balanced approach
- **Relationship queries:** Use Standard with Graph search

---

## 7. Evaluation & Testing

### 7.1 Evaluation Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| **Precision@5** | Relevant docs in top 5 | > 0.6 |
| **Precision@10** | Relevant docs in top 10 | > 0.5 |
| **Recall** | Coverage of all relevant docs | > 0.7 |
| **MRR** | Mean Reciprocal Rank | > 0.5 |
| **NDCG** | Normalized DCG | > 0.6 |
| **Latency P95** | 95th percentile response | < 500ms |

### 7.2 A/B Testing Framework

The platform includes an A/B testing harness for:
- Comparing strategy performance
- Optimizing fusion weights
- Validating new configurations
- Regression testing

Usage:
```python
from graphrag.evaluation import get_evaluation_harness, RAGStrategyType

harness = get_evaluation_harness(graphrag_service)
harness.load_evaluation_dataset(queries)
result = await harness.ab_test(
    strategy_a=RAGStrategyType.SEMANTIC_STANDARD,
    strategy_b=RAGStrategyType.HYBRID_ENHANCED,
    agent_id=agent_id,
    session_id=session_id
)
```

---

## 8. Integration Points

### 8.1 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/graphrag/query` | POST | Execute GraphRAG query |
| `/graphrag/profiles` | GET | List available profiles |
| `/graphrag/strategies` | GET | List RAG strategies |
| `/graphrag/health` | GET | Service health check |

### 8.2 Request Format

```json
{
  "query": "What are FDA requirements for AI medical devices?",
  "agent_id": "uuid",
  "session_id": "uuid",
  "rag_profile_id": "optional-uuid",
  "top_k": 10,
  "min_score": 0.7,
  "include_graph_evidence": true,
  "include_citations": true
}
```

### 8.3 Response Format

```json
{
  "query": "...",
  "context_chunks": [
    {
      "chunk_id": "...",
      "text": "...",
      "score": 0.89,
      "source": {
        "document_id": "...",
        "title": "...",
        "citation": "[1]"
      },
      "search_modality": "vector",
      "metadata": {
        "authority_boost": 0.95,
        "original_fusion_score": 0.85
      }
    }
  ],
  "evidence_chain": [...],
  "citations": {
    "[1]": {"document_id": "...", "title": "..."}
  },
  "metadata": {
    "profile_used": "regulatory_precision",
    "fusion_weights": {"vector": 0.3, "keyword": 0.6, "graph": 0.1},
    "vector_results_count": 8,
    "keyword_results_count": 5,
    "graph_results_count": 2,
    "rerank_applied": true,
    "execution_time_ms": 245
  }
}
```

---

## 9. Configuration Reference

### 9.1 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PINECONE_API_KEY` | Pinecone API key | Required |
| `PINECONE_INDEX_NAME` | Index name | vital-knowledge |
| `NEO4J_URI` | Neo4j connection URI | Required |
| `NEO4J_PASSWORD` | Neo4j password | Required |
| `OPENAI_API_KEY` | OpenAI for embeddings | Required |
| `COHERE_API_KEY` | Cohere for reranking | Optional |

### 9.2 GraphRAG Config Options

```python
GraphRAGConfig(
    default_top_k=10,
    default_similarity_threshold=0.7,
    default_max_hops=2,
    default_graph_limit=50,
    enable_result_caching=True,
    cache_ttl_seconds=3600,
    max_concurrent_searches=10
)
```

---

## 10. Roadmap

### Immediate Priorities
- [ ] Elasticsearch deployment for keyword search
- [ ] Expand evaluation dataset
- [ ] Implement query expansion

### Short-term
- [ ] Add cross-encoder reranking option
- [ ] Semantic chunking with NLP boundaries
- [ ] Real-time A/B experiment tracking

### Long-term
- [ ] Multi-tenant knowledge isolation
- [ ] Automated document classification pipeline
- [ ] Graph-based query decomposition
- [ ] Federated search across external sources

---

## 11. Files Reference

| File | Purpose |
|------|---------|
| `graphrag/service.py` | Main GraphRAG orchestration |
| `graphrag/strategies.py` | RAG strategy definitions |
| `graphrag/agent_profiles.py` | Agent-specific configurations |
| `graphrag/evaluation.py` | A/B testing and metrics |
| `graphrag/chunking_service.py` | Document chunking strategies |
| `graphrag/source_authority_booster.py` | Authority-based scoring |
| `graphrag/reranker.py` | Neural reranking service |

---

*This document is auto-generated and reflects the current production configuration.*
