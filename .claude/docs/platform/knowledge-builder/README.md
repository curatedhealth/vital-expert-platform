# Knowledge Builder

> **Enterprise Knowledge Management Platform for VITAL AI Agents**
>
> Build, evaluate, deploy, and monitor knowledge domains that power evidence-based AI responses.

---

## Quick Links

| Document | Description |
|----------|-------------|
| [Implementation Plan](./KNOWLEDGE_BUILDER_IMPLEMENTATION_PLAN.md) | Technical roadmap and architecture |
| [Existing Components](./KNOWLEDGE_BUILDER_EXISTING_COMPONENTS.md) | Reusable VITAL components inventory |
| [Enhancements Guide](./KNOWLEDGE_BUILDER_ENHANCEMENTS.md) | All features and capabilities |
| [RAG Domain Lifecycle](./RAG_DOMAIN_LIFECYCLE.md) | Create, Evaluate, Deploy, Monitor workflow |

---

## Overview

The Knowledge Builder is VITAL's comprehensive platform for managing the knowledge that powers AI agents. It provides a unified interface for:

- **Uploading documents** with intelligent metadata extraction
- **Searching knowledge** using hybrid entity-aware retrieval
- **Managing domains** with tiered organization
- **Connecting external sources** (FDA, PubMed, ClinicalTrials.gov)
- **Monitoring performance** with analytics dashboards

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Knowledge Builder UI                         │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┬─────────┐ │
│  │ Overview │ Domains  │  Upload  │  Query   │Embeddings│Analytics│ │
│  └──────────┴──────────┴──────────┴──────────┴──────────┴─────────┘ │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                     Processing Pipeline                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐ │
│  │ SmartMetadata  │  │   LangExtract  │  │   UnifiedRAGService    │ │
│  │   Extractor    │→ │   (Entities)   │→ │  (Chunking+Embedding)  │ │
│  └────────────────┘  └────────────────┘  └────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                     Storage Layer                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │   Supabase   │  │   Pinecone   │  │   External Sources       │   │
│  │  (Metadata)  │  │  (Vectors)   │  │ (FDA, PubMed, ClinicalTrials)│
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Features

### 1. Intelligent Document Upload

**Location**: `/designer/knowledge?tab=upload`

| Feature | Description |
|---------|-------------|
| **Dual Upload Modes** | Basic (simple) or Enhanced (AI-powered) |
| **Auto Metadata Extraction** | Extracts source, type, year, therapeutic area from filenames |
| **AI-Powered Analysis** | Optional GPT-4o-mini for content-based extraction |
| **Standardized Naming** | Auto-generates clean filenames: `{Source}_{Type}_{Year}_{Title}` |
| **Confidence Scoring** | Shows extraction confidence (High/Medium/Low) per field |
| **Editable Fields** | User can correct any extracted metadata |

**Supported Formats**: PDF, Word (.docx), Excel (.xlsx), CSV, TXT, Markdown

### 2. Entity-Aware Hybrid Search

**Location**: `/designer/knowledge?tab=query`

| Strategy | Description | Best For |
|----------|-------------|----------|
| **Auto** ✅ NEW | AI-selected optimal strategy | Let system decide |
| **Hybrid** | Combines all three strategies | General queries |
| **True Hybrid** | Vector + Graph + Keyword | Complex research |
| **Vector** | Pure semantic similarity (OpenAI embeddings) | Conceptual searches |
| **Keyword** | Elasticsearch BM25 + semantic_text | Exact term matching |
| **Entity** | Medical entity matching | Drug names, diagnoses, procedures |
| **Graph** | Neo4j relationship traversal | Entity connections |

**Fusion Weights (True Hybrid)**: Vector (50%) + Graph (30%) + Keyword (20%)

### 2.1 Auto-Strategy Selection (NEW - January 2025)

The Query Classifier automatically selects optimal strategy based on query intent:

| Intent | Auto-Selected Strategy | Example Query |
|--------|----------------------|---------------|
| Regulatory | `keyword` | "FDA 510(k) submission requirements" |
| Clinical | `true_hybrid` | "Compare efficacy of metformin vs sitagliptin" |
| Research | `true_hybrid` | "Recent publications on CRISPR gene therapy" |
| Entity Lookup | `graph` | "Tell me about Pfizer's oncology pipeline" |
| Technical | `semantic` | "Structure of aspirin molecule" |
| General | `hybrid` | "What is pharmaceutical manufacturing?" |

**Entity Types Detected**:
- Medications (aspirin, metformin, insulin, etc.)
- Diagnoses (diabetes, hypertension, cancer, etc.)
- Procedures (biopsy, MRI, surgery, etc.)
- Numeric constraints (dosages, ages, percentages)

### 3. External Evidence Sources

**Location**: `/designer/knowledge?tab=connections`

| Source | API Status | Description |
|--------|------------|-------------|
| **ClinicalTrials.gov** | Connected | Clinical trial search by condition/intervention |
| **FDA OpenFDA** | Connected | Drug approvals, labels, adverse events |
| **EMA** | Manual | European Medicines Agency regulatory info |
| **WHO Essential Medicines** | Manual | WHO Model List of Essential Medicines |
| **PubMed** | Connected | Biomedical literature from NCBI/NIH |

### 4. Citation Management

**Formats Supported**:
- APA (American Psychological Association)
- Vancouver (Medical/Scientific)
- Chicago

**Citation Types**:
- `pubmed` - PubMed research articles
- `clinical-trial` - ClinicalTrials.gov entries
- `fda-approval` - FDA drug approvals
- `knowledge-base` - Internal knowledge documents
- `web-source` - External web sources

### 5. Knowledge Analytics

**Location**: `/designer/knowledge?tab=analytics`

| Metric | Description |
|--------|-------------|
| **Document Counts** | Total documents per domain |
| **Vector Chunks** | Embedded text chunks in Pinecone |
| **Search Analytics** | Query patterns and result quality |
| **Processing Status** | Pending, processing, completed, failed |

---

## Getting Started

### Prerequisites

```bash
# Required environment variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=your_index_name
```

### Access the Knowledge Builder

1. Navigate to **Designer** in the top navigation
2. Select **Knowledge Builder** from the dropdown
3. Or go directly to: `/designer/knowledge`

### Upload Your First Document

1. Go to **Upload** tab
2. Toggle to **Enhanced** mode (recommended)
3. Drag and drop or click to select files
4. Review extracted metadata
5. Click **Upload All Documents**

### Search Your Knowledge Base

1. Go to **Query** tab
2. Enter your search query
3. Select a search strategy (Hybrid recommended)
4. Optionally filter by domain
5. Review results with relevance scores and entity matches

---

## Component Integration

The Knowledge Builder integrates **9 existing VITAL components**:

| Component | Location | Integration |
|-----------|----------|-------------|
| SmartMetadataExtractor | `lib/services/metadata/` | Upload tab |
| FileRenamer | `lib/services/metadata/` | Upload tab |
| EntityAwareHybridSearch | `lib/services/search/` | Query tab |
| UnifiedRAGService | `lib/services/rag/` | Document processing |
| LangExtractPipeline | `lib/services/extraction/` | Entity extraction |
| GraphRAGService | `lib/services/agents/` | Multi-hop search |
| CitationDisplay | `features/chat/components/` | Search results |
| InlineCitation | `components/ai-elements/` | Document viewer |
| EvidenceRetrieval | `lib/services/` | External sources |

---

## File Structure

```
apps/vital-system/src/
├── app/(app)/designer/knowledge/
│   └── page.tsx                          # Main Knowledge Builder page
├── features/knowledge/components/
│   ├── knowledge-uploader.tsx            # Basic uploader
│   ├── knowledge-upload-with-metadata.tsx # Enhanced uploader
│   ├── knowledge-analytics-dashboard.tsx  # Analytics tab
│   └── DomainDetailsDialog.tsx           # Domain management
├── lib/services/
│   ├── metadata/
│   │   ├── smart-metadata-extractor.ts   # Metadata extraction
│   │   └── file-renamer.ts               # Filename standardization
│   ├── search/
│   │   └── entity-aware-hybrid-search.ts # Triple-strategy search
│   ├── rag/
│   │   └── unified-rag-service.ts        # RAG operations
│   └── evidence-retrieval.ts             # External source tools
└── api/
    ├── knowledge-domains/route.ts        # Domain CRUD
    ├── knowledge/documents/route.ts      # Document CRUD
    └── evidence/search/route.ts          # External searches
```

---

## RAG Domain Lifecycle

See [RAG_DOMAIN_LIFECYCLE.md](./RAG_DOMAIN_LIFECYCLE.md) for the complete guide on:

1. **CREATE** - Define and configure new knowledge domains
2. **BUILD** - Process documents and generate embeddings
3. **EVALUATE** - Test retrieval quality and accuracy
4. **DEPLOY** - Connect domains to agents
5. **MONITOR** - Track performance and optimize

---

## Roadmap

### Phase 1: Core Features (Completed)
- [x] SmartMetadataExtractor integration
- [x] FileRenamer integration
- [x] EntityAwareHybridSearch integration
- [x] CitationDisplay integration
- [x] External evidence sources UI

### Phase 2: Advanced Features (In Progress)
- [ ] LangExtract entity extraction on ingest
- [ ] GraphRAG multi-hop search
- [ ] Batch document processing
- [ ] Knowledge graph visualization

### Phase 3: Enterprise Features (Planned)
- [ ] Role-based access control per domain
- [ ] Audit logging for compliance
- [ ] Scheduled reindexing
- [ ] Custom embedding models
- [ ] A/B testing for retrieval strategies

---

## Support

For issues or feature requests, contact the VITAL platform team or refer to:
- `.claude/CLAUDE.md` - Project guidelines
- `.claude/docs/` - Platform documentation
