# Knowledge Builder - Existing Component Integration

> **Purpose**: Map all existing VITAL components that should be integrated into the Knowledge Builder
> **Last Updated**: December 2024

---

## Existing Components Inventory

### 1. LangExtract Pipeline
**Location**: `src/lib/services/extraction/langextract-pipeline.ts`

**Capabilities**:
- Structured entity extraction using Google Gemini
- Entity types: medication, diagnosis, procedure, protocol_step, patient_population, monitoring_requirement, adverse_event, contraindication, regulatory_requirement, validation_criteria
- Source grounding with char_start/char_end positions
- Relationship extraction between entities
- Confidence scoring and statistics
- Audit trail with model version tracking

**Integration Points**:
```typescript
// In Knowledge Builder's document processing pipeline
import { getLangExtractPipeline, LangExtractPipeline } from '@/lib/services/extraction/langextract-pipeline';

// After document chunking, extract entities
const langExtract = getLangExtractPipeline();
const extraction = await langExtract.extract(documents, 'clinical_protocol');
// Returns: entities[], relationships[], metadata, audit_trail
```

**UI Components Needed**:
- Entity visualization grid
- Relationship graph viewer
- Confidence score display
- Verification status workflow

---

### 2. GraphRAG Service (Hybrid Search)
**Location**: `src/lib/services/agents/agent-graphrag-service.ts`

**Capabilities**:
- Hybrid search: Pinecone (vector) + Supabase (metadata) + Graph traversal
- Multi-hop reasoning through agent relationships
- Embedding cache for performance
- Circuit breaker and retry logic
- Match reason explanations

**Integration Points**:
```typescript
import { agentGraphRAGService } from '@/lib/services/agents/agent-graphrag-service';

// Search with graph traversal
const results = await agentGraphRAGService.searchAgents({
  query: 'FDA regulatory guidance',
  topK: 10,
  minSimilarity: 0.7,
  filters: {
    knowledge_domain: 'regulatory_affairs',
  },
});
```

**Key Features to Leverage**:
- `traverseAgentGraph()` - Multi-hop knowledge discovery
- `mergeSearchResults()` - Fusion of vector + graph results
- Relationship-aware ranking

---

### 3. Unified RAG Service
**Location**: `src/lib/services/rag/unified-rag-service.ts`

**Capabilities**:
- Multiple search strategies: semantic, hybrid, keyword, agent-optimized, entity-aware
- Pinecone + Supabase integration
- Domain-specific embedding model selection
- In-memory caching with LRU eviction
- Cost tracking and latency monitoring
- Circuit breaker protection

**Integration Points**:
```typescript
import { unifiedRAGService } from '@/lib/services/rag/unified-rag-service';

// Query with entity-aware strategy
const result = await unifiedRAGService.query({
  text: 'What is the FDA approval process for biologics?',
  domain: 'regulatory_affairs',
  strategy: 'entity-aware',
  maxResults: 10,
});

// Add document with comprehensive metadata
await unifiedRAGService.addDocument({
  title: 'FDA BLA Guidance',
  content: documentContent,
  domain: 'regulatory_affairs',
  source_name: 'FDA',
  document_type: 'Regulatory Guidance',
  regulatory_body: 'FDA',
  // ... comprehensive metadata fields
});
```

**Strategies Available**:
| Strategy | Use Case |
|----------|----------|
| `semantic` | Pure vector similarity |
| `hybrid` | Vector + BM25 keyword |
| `keyword` | Full-text search only |
| `agent-optimized` | Agent-specific boosting |
| `entity-aware` | Triple strategy with LangExtract |

---

### 4. Entity-Aware Hybrid Search
**Location**: `src/lib/services/search/entity-aware-hybrid-search.ts`

**Capabilities**:
- Triple strategy: vector + keyword + entity search
- Query entity extraction (medications, diagnoses, procedures)
- Result fusion with configurable weights
- Reranking by entity relevance
- Entity match tracking per result

**Integration Points**:
```typescript
import { entityAwareHybridSearch } from '@/lib/services/search/entity-aware-hybrid-search';

const results = await entityAwareHybridSearch.search({
  text: 'aspirin 325mg for cardiovascular protection',
  domain: 'clinical_protocols',
  maxResults: 20,
  strategy: 'hybrid', // Uses all three strategies
});

// Results include:
// - scores.vector, scores.keyword, scores.entity, scores.combined
// - matched_entities[] with entity_type, match_type, confidence
```

**Fusion Weights** (configurable):
```typescript
{
  vectorWeight: 0.4,
  keywordWeight: 0.3,
  entityWeight: 0.3,
}
```

---

### 5. Smart Metadata Extractor
**Location**: `src/lib/services/metadata/smart-metadata-extractor.ts`

**Capabilities**:
- Extract metadata from filename patterns
- Extract metadata from document content
- AI-powered extraction (optional, uses GPT-4o-mini)
- Taxonomy patterns for sources, document types, regulatory bodies, therapeutic areas
- Confidence scoring per field

**Integration Points**:
```typescript
import { SmartMetadataExtractor } from '@/lib/services/metadata/smart-metadata-extractor';

const extractor = new SmartMetadataExtractor({ useAI: true });

// Extract from filename
const filenameMeta = await extractor.extractFromFilename('FDA_Guidance_2024_BLA_Requirements.pdf');
// Returns: source_name, year, document_type, regulatory_body, clean_title

// Extract from content
const contentMeta = await extractor.extractFromContent(documentText, fileName);
// Returns: title, author, organization, therapeutic_area, keywords, summary

// Merge from multiple sources
const finalMeta = extractor.mergeMetadata(filenameMeta, contentMeta);
```

**Pre-configured Taxonomies**:
- Sources: FDA, EMA, WHO, NIH, NICE, MHRA, Nature, JAMA, NEJM, McKinsey, etc.
- Document Types: Regulatory Guidance, Research Paper, Clinical Protocol, SOP, etc.
- Regulatory Bodies: FDA, EMA, WHO, MHRA, PMDA, Health Canada, TGA
- Therapeutic Areas: Oncology, Cardiology, Neurology, Immunology, etc.

---

### 6. File Renamer Service
**Location**: `src/lib/services/metadata/file-renamer.ts`

**Capabilities**:
- Generate consistent filenames from metadata
- Template-based renaming: `{Source}_{Type}_{Year}_{Title}`
- Configurable formatters for each component
- Max length handling with truncation
- Windows-compatible naming

**Integration Points**:
```typescript
import { defaultFileRenamer, FileRenamer } from '@/lib/services/metadata/file-renamer';

const newFilename = defaultFileRenamer.generateFilename({
  source_name: 'FDA',
  document_type: 'Regulatory Guidance',
  year: 2024,
  clean_title: 'BLA Requirements for Biologics',
  extension: 'pdf',
});
// Output: "FDA_RegulatoryGuidance_2024_BLA Requirements for Biologics.pdf"

// Custom template
const renamer = new FileRenamer({
  template: '{Year}_{Source}_{Title}',
  separator: '-',
});
```

---

### 7. Citation Display & Formatting
**Location**:
- `src/features/chat/components/citation-display.tsx`
- `src/lib/services/evidence-retrieval.ts`

**Capabilities**:
- Multiple citation styles: APA, Vancouver, Chicago
- Citation type badges with icons
- Expandable/collapsible detailed view
- Relevance score display
- Formatted citation generation

**Citation Types Supported**:
| Type | Icon | Color |
|------|------|-------|
| pubmed | FileText | Green |
| clinical-trial | FlaskConical | Purple |
| fda-approval | Shield | Red |
| ich-guideline | Shield | Orange |
| iso-standard | Shield | Blue |
| dime-resource | Activity | Pink |
| ichom-set | Activity | Teal |
| knowledge-base | Database | Indigo |
| web-source | ExternalLink | Gray |

**Integration Points**:
```typescript
import { CitationDisplay } from '@/features/chat/components/citation-display';
import { formatCitation } from '@/lib/services/evidence-retrieval';

// In UI
<CitationDisplay
  citations={citations}
  format="apa" // or 'vancouver', 'chicago'
  compact={false}
/>

// Programmatic formatting
const apaFormatted = formatCitation(citation, 'apa');
const vancouverFormatted = formatCitation(citation, 'vancouver');
```

---

### 8. Inline Citation Components
**Location**: `src/components/ai-elements/inline-citation.tsx`

**Capabilities**:
- HoverCard-based citation preview
- Carousel for multiple sources
- Source title, URL, description display
- Quote blocks for cited content

**Components**:
```typescript
import {
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationSource,
  InlineCitationQuote,
} from '@/components/ai-elements/inline-citation';
```

---

### 9. Evidence Retrieval Tools
**Location**: `src/lib/services/evidence-retrieval.ts`

**Available Tools**:
| Tool | Description |
|------|-------------|
| `search_clinical_trials` | ClinicalTrials.gov API |
| `search_fda_approvals` | OpenFDA API |
| `search_ema_authorizations` | EMA guidance (manual) |
| `search_who_essential_medicines` | WHO Essential Medicines List |
| `search_multi_region_regulatory` | Cross-region regulatory search |

**Integration for Knowledge Builder**:
```typescript
import { getAllEvidenceTools } from '@/lib/services/evidence-retrieval';

// Get all tools for LangChain integration
const evidenceTools = getAllEvidenceTools();

// Individual tool usage
import { createClinicalTrialsSearchTool } from '@/lib/services/evidence-retrieval';
const clinicalTrialsTool = createClinicalTrialsSearchTool();
```

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Knowledge Builder UI                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ Upload Tab  │  │ Browse Tab  │  │ Query Tab   │  │Analytics│ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Document Processing Pipeline                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐    ┌────────────┐ │
│  │ SmartMetadata    │ -> │ FileRenamer      │ -> │ UnifiedRAG │ │
│  │ Extractor        │    │                  │    │ (chunking) │ │
│  └──────────────────┘    └──────────────────┘    └────────────┘ │
│                                                        │        │
│                                                        ▼        │
│  ┌──────────────────┐    ┌──────────────────┐    ┌────────────┐ │
│  │ LangExtract      │ <- │ Entity-Aware     │ <- │ Pinecone   │ │
│  │ (entities)       │    │ Hybrid Search    │    │ + pgVector │ │
│  └──────────────────┘    └──────────────────┘    └────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Search & Retrieval Layer                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ GraphRAG    │  │ Evidence    │  │ Citation    │  │ Rerank  │ │
│  │ Service     │  │ Retrieval   │  │ Formatter   │  │ Engine  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Priority

### Phase 1: Core Integration (Week 1-2)
1. **Connect SmartMetadataExtractor** to Upload tab
   - Extract metadata on file upload
   - Display confidence scores
   - Allow user corrections

2. **Connect FileRenamer** to metadata flow
   - Auto-suggest renamed files
   - Apply naming convention on save

3. **Integrate UnifiedRAGService** for document processing
   - Use existing chunking and embedding
   - Connect to Pinecone namespace

### Phase 2: Search Enhancement (Week 3-4)
4. **Add EntityAwareHybridSearch** to Query tab
   - Implement triple-strategy search
   - Show entity matches in results
   - Display fusion scores

5. **Integrate LangExtractPipeline** for entity extraction
   - Extract entities on document ingest
   - Store in extracted_entities table
   - Visualize in UI

### Phase 3: Citation & Evidence (Week 5-6)
6. **Add CitationDisplay** to search results
   - Format citations in APA/Vancouver/Chicago
   - Add citation export functionality

7. **Integrate Evidence Retrieval tools**
   - Add PubMed search to Knowledge Builder
   - Add ClinicalTrials.gov integration
   - Add FDA/EMA regulatory lookup

### Phase 4: Advanced Features (Week 7-8)
8. **Connect GraphRAGService** for multi-hop search
   - Enable graph traversal for knowledge discovery
   - Show relationship paths in results

9. **Add InlineCitation components** to document viewer
   - Highlight entities with citations
   - HoverCard previews for sources

---

## Code Examples for Integration

### Upload with Metadata Extraction
```typescript
// In Knowledge Builder Upload component
const handleFileUpload = async (file: File) => {
  // 1. Extract metadata from filename
  const extractor = new SmartMetadataExtractor({ useAI: true });
  const filenameMeta = await extractor.extractFromFilename(file.name);

  // 2. Read and extract from content
  const content = await readFileContent(file);
  const contentMeta = await extractor.extractFromContent(content, file.name);

  // 3. Merge metadata
  const metadata = extractor.mergeMetadata(filenameMeta, contentMeta);

  // 4. Generate clean filename
  const cleanFileName = defaultFileRenamer.generateFilename({
    ...metadata,
    extension: file.name.split('.').pop(),
  });

  // 5. Upload to RAG system
  const documentId = await unifiedRAGService.addDocument({
    title: metadata.title || file.name,
    content,
    domain: selectedDomain,
    clean_file_name: cleanFileName,
    source_name: metadata.source_name,
    document_type: metadata.document_type,
    year: metadata.year,
    // ... all extracted metadata
  });

  return documentId;
};
```

### Search with Reranking
```typescript
// In Knowledge Builder Query component
const handleSearch = async (query: string) => {
  // Use entity-aware search for best results
  const results = await entityAwareHybridSearch.search({
    text: query,
    domain: selectedDomain,
    maxResults: 20,
    strategy: 'hybrid',
  });

  // Results already include:
  // - scores.vector, scores.keyword, scores.entity, scores.combined
  // - matched_entities with confidence

  // Format for display with citations
  const formattedResults = results.map(result => ({
    ...result,
    citation: formatCitation({
      type: 'knowledge-base',
      id: result.document_id,
      title: result.source_title,
      source: result.domain,
      url: `/knowledge/documents/${result.document_id}`,
    }, 'apa'),
  }));

  return formattedResults;
};
```

---

## Summary

The Knowledge Builder can leverage **9 existing components** that provide:
- **Metadata extraction** (SmartMetadataExtractor, FileRenamer)
- **Entity extraction** (LangExtractPipeline)
- **Hybrid search** (UnifiedRAGService, EntityAwareHybridSearch, GraphRAGService)
- **Evidence retrieval** (ClinicalTrials, FDA, EMA, WHO tools)
- **Citation formatting** (CitationDisplay, formatCitation, InlineCitation)
- **Reranking** (EntityAwareHybridSearch.rerankByEntityRelevance)

This significantly reduces development time by reusing production-ready code.
