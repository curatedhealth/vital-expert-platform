# Knowledge Pipeline Search & Import - Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         KNOWLEDGE PIPELINE                              │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │              │  │              │  │                              │ │
│  │ Configuration│  │    Queue     │  │      Search & Import         │ │
│  │              │  │              │  │                              │ │
│  └──────────────┘  └──────────────┘  └──────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                            │
                                            │ User enters query
                                            │ Selects sources
                                            ▼
                        ┌──────────────────────────────────┐
                        │  Frontend: KnowledgeSearchImport  │
                        │                                   │
                        │  • Search Input                   │
                        │  • Source Selector (7 sources)    │
                        │  • Max Results Slider             │
                        │  • Results Display                │
                        │  • Bulk Selection                 │
                        └──────────────────────────────────┘
                                            │
                                            │ POST /api/pipeline/search
                                            │ { query, sources, maxResults }
                                            ▼
                        ┌──────────────────────────────────┐
                        │   API Route: /api/pipeline/search │
                        │                                   │
                        │  1. Validate request              │
                        │  2. Execute Python subprocess     │
                        │  3. Parse JSON results            │
                        │  4. Return to frontend            │
                        └──────────────────────────────────┘
                                            │
                                            │ Execute Python script
                                            ▼
                        ┌──────────────────────────────────┐
                        │  Python: knowledge_search.py      │
                        │                                   │
                        │  class KnowledgeSearcher:         │
                        │    • search(query, source)        │
                        │    • _search_pubmed()             │
                        │    • _search_arxiv()              │
                        │    • _search_bcg()                │
                        │    • ... (7 sources)              │
                        └──────────────────────────────────┘
                                            │
                                            │ Async concurrent calls
                                            ▼
        ┌─────────────────────────────────────────────────────────────────┐
        │                     EXTERNAL APIs                               │
        │                                                                 │
        │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
        │  │  PubMed  │  │  arXiv   │  │   BCG    │  │   McKinsey   │  │
        │  │   API    │  │   API    │  │ Curated  │  │   Curated    │  │
        │  │          │  │          │  │ Results  │  │   Results    │  │
        │  │ eSearch  │  │  Atom    │  │          │  │              │  │
        │  │ eSummary │  │   XML    │  │          │  │              │  │
        │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │
        │                                                                 │
        │  Returns: JSON array of search results with metadata           │
        └─────────────────────────────────────────────────────────────────┘
                                            │
                                            │ Parse & format results
                                            ▼
                        ┌──────────────────────────────────┐
                        │    Search Results JSON            │
                        │                                   │
                        │  {                                │
                        │    "pubmed": [                    │
                        │      {                            │
                        │        "title": "...",            │
                        │        "abstract": "...",         │
                        │        "authors": [...],          │
                        │        "url": "...",              │
                        │        "pdf_link": null           │
                        │      }                            │
                        │    ],                             │
                        │    "arxiv": [...]                 │
                        │  }                                │
                        └──────────────────────────────────┘
                                            │
                                            │ Return to frontend
                                            ▼
                        ┌──────────────────────────────────┐
                        │   Display Results                 │
                        │                                   │
                        │  • Grouped by source              │
                        │  • Selectable cards               │
                        │  • Metadata badges                │
                        │  • Checkbox selection             │
                        └──────────────────────────────────┘
                                            │
                                            │ User selects results
                                            │ Clicks "Add to Queue"
                                            ▼
                        ┌──────────────────────────────────┐
                        │   handleAddImportedSources()      │
                        │                                   │
                        │  1. Convert results to Sources    │
                        │  2. Merge into config.sources     │
                        │  3. Update queueSources state     │
                        │  4. Switch to Queue tab           │
                        └──────────────────────────────────┘
                                            │
                                            │ Sources added to queue
                                            ▼
                        ┌──────────────────────────────────┐
                        │     Pipeline Queue                │
                        │                                   │
                        │  • Original sources (manual)      │
                        │  • Imported sources (search)      │
                        │                                   │
                        │  Actions:                         │
                        │  • Run All                        │
                        │  • Run Single                     │
                        │  • Retry Failed                   │
                        └──────────────────────────────────┘
                                            │
                                            │ Process sources
                                            ▼
                        ┌──────────────────────────────────┐
                        │   Knowledge Pipeline Processing   │
                        │                                   │
                        │  1. Scrape content (HTML/PDF)     │
                        │  2. Extract text                  │
                        │  3. Enrich metadata               │
                        │  4. Create chunks                 │
                        │  5. Generate embeddings           │
                        │  6. Upload to Supabase + Pinecone│
                        └──────────────────────────────────┘
                                            │
                                            │ Content uploaded
                                            ▼
        ┌─────────────────────────────────────────────────────────────────┐
        │                     KNOWLEDGE BASE                              │
        │                                                                 │
        │  ┌──────────────────────┐           ┌──────────────────────┐  │
        │  │      Supabase        │           │      Pinecone        │  │
        │  │                      │           │                      │  │
        │  │  knowledge_documents │◄─────────►│   Vector Index       │  │
        │  │                      │           │                      │  │
        │  │  • Metadata          │           │  • Embeddings        │  │
        │  │  • Content           │           │  • Semantic Search   │  │
        │  │  • Quality Scores    │           │  • RAG Retrieval     │  │
        │  └──────────────────────┘           └──────────────────────┘  │
        │                                                                 │
        └─────────────────────────────────────────────────────────────────┘
                                            │
                                            │ Content available
                                            ▼
                        ┌──────────────────────────────────┐
                        │       ASK EXPERT / RAG            │
                        │                                   │
                        │  User queries can now retrieve    │
                        │  from imported content            │
                        │                                   │
                        │  "What does the research say      │
                        │   about AI in radiology?"         │
                        │                                   │
                        │  → Returns citations from         │
                        │    imported PubMed papers         │
                        └──────────────────────────────────┘
```

## Data Flow

### 1. Search Phase
```
User Input → Frontend → API → Python → External APIs → Results → Frontend
```

### 2. Import Phase
```
Selected Results → handleAddImportedSources() → config.sources → Queue
```

### 3. Processing Phase
```
Queue → Pipeline → Scraper → Metadata Enrichment → RAG Upload → Knowledge Base
```

### 4. Retrieval Phase
```
Ask Expert Query → RAG System → Vector Search → Imported Content → Answer
```

## Component Dependencies

```
KnowledgePipelineConfig.tsx
  ├── KnowledgeSearchImport.tsx (new)
  │   └── Calls: /api/pipeline/search
  │       └── Executes: knowledge_search.py
  │           └── Calls: PubMed API, arXiv API, etc.
  │
  ├── KnowledgePipelineQueue.tsx (existing)
  │   └── Processes imported sources
  │
  └── AdvancedMetadataForm.tsx (existing)
      └── Enriches imported metadata
```

## State Management

```typescript
// Main Config State
config: {
  sources: [
    // Manual sources from JSON upload
    { url: "...", firm: "BCG", ... },
    
    // Imported sources from search
    { url: "...", firm: "PubMed", imported_from: "pubmed", ... }
  ],
  scraping_settings: { ... },
  processing_settings: { ... },
  upload_settings: { ... }
}

// Queue State
queueSources: [
  {
    id: "source-1",
    url: "...",
    status: "pending" | "processing" | "success" | "failed",
    progress: 0-100,
    result: { ... }
  }
]

// View State
currentView: "config" | "queue" | "search"
```

## Key Functions

### Frontend
```typescript
handleAddImportedSources(sources: Source[])
  → Updates config.sources
  → Switches to queue view
  → Sources appear in queue

handleRunSingleSource(sourceId: string)
  → Calls /api/pipeline/run-single
  → Updates queue item status
  → Shows progress

handleRunAllSources()
  → Iterates through pending sources
  → Calls handleRunSingleSource for each
  → Tracks overall progress
```

### Backend
```python
async def search_knowledge_sources(
    query: str,
    sources: List[SearchSource],
    max_results_per_source: int
) -> Dict[str, List[Dict]]
  → Concurrent search across sources
  → Returns organized results

class KnowledgeSearcher:
  async def _search_pubmed(...)
    → eSearch for IDs
    → eSummary for details
    → Parse and format

  async def _search_arxiv(...)
    → Query arXiv API
    → Parse Atom XML
    → Extract PDF links
```

## Error Handling

```
┌─────────────────────────────────────────────┐
│           Error Handling Flow               │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend Errors:                           │
│   • Empty query → Inline validation         │
│   • No sources → Warning message            │
│   • Network error → Alert with retry        │
│                                             │
│  API Errors:                                │
│   • Timeout (60s) → 408 status code         │
│   • Python error → Captured stderr          │
│   • Invalid JSON → Parse error message      │
│                                             │
│  Python Errors:                             │
│   • API failure → Logged + empty results    │
│   • SSL error → Context bypass              │
│   • Import error → Graceful degradation     │
│                                             │
└─────────────────────────────────────────────┘
```

## Performance Optimizations

1. **Concurrent API Calls**: All sources searched in parallel
2. **Streaming Responses**: Results shown as they arrive
3. **Cached Metadata**: Reuse parsed data when possible
4. **Batch Processing**: Queue handles multiple sources efficiently
5. **Lazy Loading**: Only load visible results
6. **Connection Pooling**: Reuse HTTP sessions

## Security Considerations

1. **API Key Protection**: Environment variables only
2. **Input Validation**: Query sanitization
3. **Rate Limiting**: Respect API quotas
4. **SSL Verification**: Bypassed for dev (enable in prod)
5. **Content Sanitization**: XSS protection on displayed content
6. **Subprocess Isolation**: Python runs in controlled environment

---

**Architecture designed for:**
- 🚀 Performance (parallel execution)
- 🛡️ Reliability (error handling at every layer)
- 📈 Scalability (easy to add new sources)
- 🔧 Maintainability (modular design)
- 🎯 Usability (seamless user experience)

