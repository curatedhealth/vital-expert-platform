# GraphRAG Citation System v2.0

**Date:** November 28, 2025
**Status:** PRODUCTION READY
**Version:** 2.0.0

---

## Overview

The GraphRAG Citation System provides comprehensive citation management for the VITAL AI Platform's retrieval-augmented generation workflows. It supports **7 academic citation styles** and integrates seamlessly with both document-based RAG and web search results.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Citation Data Flow                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │   Agent      │───▶│  GraphRAG    │───▶│  Citation Enricher   │  │
│  │  Metadata    │    │   Service    │    │                      │  │
│  │              │    │              │    │  ┌────────────────┐  │  │
│  │ citation_    │    │  include_    │    │  │ CitationData   │  │  │
│  │ style: "ama" │    │  citations   │    │  │ ─────────────  │  │  │
│  │              │    │              │    │  │ - title        │  │  │
│  └──────────────┘    └──────────────┘    │  │ - authors      │  │  │
│                                          │  │ - journal      │  │  │
│  ┌──────────────┐    ┌──────────────┐    │  │ - doi          │  │  │
│  │  Supabase    │───▶│  knowledge_  │───▶│  │ - pub_date     │  │  │
│  │  Database    │    │  documents   │    │  └────────────────┘  │  │
│  │              │    │  (metadata)  │    │                      │  │
│  └──────────────┘    └──────────────┘    └──────────────────────┘  │
│                                                     │               │
│                                                     ▼               │
│                              ┌─────────────────────────────────┐   │
│                              │     Formatted Citation          │   │
│                              │  ───────────────────────────    │   │
│                              │  APA | AMA | Vancouver |        │   │
│                              │  ICMJE | Chicago | Harvard | MLA │   │
│                              └─────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Supported Citation Styles

### 1. APA (American Psychological Association)
**Use Case:** Academic papers, psychology, social sciences

```
Smith, J. A., & Jones, M. B. (2024). Understanding drug interactions
in clinical trials. Journal of Clinical Research, 45(3), 123-145.
https://doi.org/10.1000/jcr.2024.0123
```

### 2. AMA (American Medical Association)
**Use Case:** Medical journals, biomedical research

```
Smith JA, Jones MB. Understanding drug interactions in clinical trials.
J Clin Res. 2024;45(3):123-145. doi:10.1000/jcr.2024.0123
```

### 3. Vancouver
**Use Case:** Biomedical publications, ICMJE-compliant journals

```
Smith JA, Jones MB. Understanding drug interactions in clinical trials.
J Clin Res. 2024;45(3):123-145.
```

### 4. ICMJE (International Committee of Medical Journal Editors)
**Use Case:** Medical manuscript submissions

```
Smith JA, Jones MB. Understanding drug interactions in clinical trials.
J Clin Res. 2024 Mar;45(3):123-145. doi: 10.1000/jcr.2024.0123
```

### 5. Chicago
**Use Case:** Humanities, history, social sciences

```
Smith, John A., and Mary B. Jones. "Understanding Drug Interactions
in Clinical Trials." Journal of Clinical Research 45, no. 3 (2024): 123-145.
https://doi.org/10.1000/jcr.2024.0123.
```

### 6. Harvard
**Use Case:** UK academic publications

```
Smith, J.A. and Jones, M.B. (2024) 'Understanding drug interactions
in clinical trials', Journal of Clinical Research, 45(3), pp. 123-145.
doi: 10.1000/jcr.2024.0123.
```

### 7. MLA (Modern Language Association)
**Use Case:** Literature, arts, humanities

```
Smith, John A., and Mary B. Jones. "Understanding Drug Interactions
in Clinical Trials." Journal of Clinical Research, vol. 45, no. 3,
2024, pp. 123-145. DOI: 10.1000/jcr.2024.0123.
```

---

## Core Components

### 1. CitationStyle Enum

**Location:** `graphrag/citation_enricher.py`

```python
class CitationStyle(str, Enum):
    """Supported citation formatting styles."""
    APA = "apa"
    AMA = "ama"
    CHICAGO = "chicago"
    HARVARD = "harvard"
    VANCOUVER = "vancouver"
    ICMJE = "icmje"
    MLA = "mla"

    @classmethod
    def from_string(cls, value: str) -> "CitationStyle":
        """Convert string to CitationStyle enum."""
        try:
            return cls(value.lower())
        except ValueError:
            return cls.APA  # Default to APA
```

### 2. CitationData Model

**Location:** `graphrag/citation_enricher.py`

```python
class CitationData(BaseModel):
    """Citation metadata for a document."""
    doc_id: str
    title: str
    authors: Optional[List[str]] = None
    journal: Optional[str] = None
    publication_date: Optional[datetime] = None
    volume: Optional[str] = None
    issue: Optional[str] = None
    pages: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    source_type: Optional[str] = None  # peer_review, guideline, textbook, etc.
    publisher: Optional[str] = None

    def format_citation(self, style: CitationStyle = CitationStyle.APA) -> str:
        """Format citation according to specified style."""
        # Style-specific formatting logic
```

### 3. WebCitationData Model

**Location:** `graphrag/citation_enricher.py`

```python
class WebCitationData(BaseModel):
    """Citation metadata for web search results."""
    title: str
    url: str
    published_date: Optional[str] = None
    site_name: Optional[str] = None
    accessed_date: Optional[datetime] = None

    def format_citation(self, style: CitationStyle = CitationStyle.APA) -> str:
        """Format web citation according to specified style."""
```

### 4. CitationEnricher Service

**Location:** `graphrag/citation_enricher.py`

```python
class CitationEnricher:
    """Enriches RAG results with citation metadata from database."""

    async def enrich_citations(
        self,
        doc_ids: List[str]
    ) -> Dict[str, CitationData]:
        """
        Fetch citation metadata for documents.

        Args:
            doc_ids: List of document IDs to enrich

        Returns:
            Dictionary mapping doc_id to CitationData
        """
```

---

## Integration Points

### 1. GraphRAG Service Integration

**Location:** `graphrag/service.py`

The GraphRAG service enriches citations during query processing:

```python
# Step 6.5: Enrich citations from Supabase
if request.include_citations and fused_chunks:
    try:
        citation_enricher = await get_citation_enricher()
        doc_ids = [chunk.metadata.get('doc_id')
                   for chunk in fused_chunks if chunk.metadata.get('doc_id')]
        citation_data = await citation_enricher.enrich_citations(doc_ids)

        # Convert citation style string to enum
        citation_style = CitationStyle.from_string(request.citation_style)

        for chunk in fused_chunks:
            doc_id = chunk.metadata.get('doc_id')
            if doc_id and doc_id in citation_data:
                cd = citation_data[doc_id]
                chunk.source.url = cd.to_url()
                chunk.source.citation = cd.format_citation(style=citation_style)
                chunk.source.title = cd.title
```

### 2. Web Search Tool Integration

**Location:** `tools/web_tools.py`

```python
class WebSearchTool(BaseTool):
    async def execute(self, tool_input: ToolInput) -> ToolOutput:
        # ...
        citation_style = tool_input.context.get('citation_style', 'apa')
        include_citations = tool_input.context.get('include_citations', True)

        if include_citations and result.get('results'):
            result['results'] = self.format_results_with_citations(
                result['results'],
                citation_style=citation_style
            )

    def format_results_with_citations(
        self,
        results: List[Dict[str, Any]],
        citation_style: str = "apa"
    ) -> List[Dict[str, Any]]:
        from graphrag.citation_enricher import format_web_citations
        return format_web_citations(results, citation_style)
```

### 3. Ask Expert Workflow Integration

All 4 Ask Expert modes pass citation preferences through the workflow:

```python
# In main.py - Mode 1 example
citation_prefs = await get_agent_citation_preferences(supabase_client, request.agent_id)

initial_state = create_initial_state(
    # ... other params
    citation_style=citation_prefs.citation_style,
    include_citations=citation_prefs.include_citations
)
```

---

## Database Schema

### knowledge_documents Table

Citations are derived from these fields in the `knowledge_documents` table:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Document identifier |
| `title` | TEXT | Document title |
| `author` | TEXT | Primary author |
| `source_url` | TEXT | Original URL |
| `source_type` | TEXT | peer_review, guideline, textbook, etc. |
| `publication_date` | TIMESTAMP | Publication date |
| `citation` | TEXT | Pre-formatted citation (if available) |
| `metadata` | JSONB | Additional citation fields |

### metadata JSONB Structure

```json
{
  "authors": ["Smith, J.A.", "Jones, M.B."],
  "journal": "Journal of Clinical Research",
  "volume": "45",
  "issue": "3",
  "pages": "123-145",
  "doi": "10.1000/jcr.2024.0123",
  "publisher": "Medical Publishing Inc.",
  "source_type": "peer_review"
}
```

---

## API Reference

### GraphRAGRequest

```python
class GraphRAGRequest(BaseModel):
    query: str
    agent_id: UUID
    session_id: UUID
    # ...
    include_citations: bool = True
    citation_style: str = "apa"  # apa, ama, vancouver, icmje, chicago, harvard, mla
```

### GraphRAGResponse

```python
class GraphRAGResponse(BaseModel):
    query: str
    context_chunks: List[ContextChunk]
    evidence_chain: Optional[List[EvidenceNode]]
    citations: Dict[str, str]  # citation_id -> formatted_citation
    metadata: GraphRAGMetadata
```

---

## Helper Functions

### format_web_citations

Formats web search results with proper citations:

```python
def format_web_citations(
    results: List[Dict[str, Any]],
    citation_style: str = "apa"
) -> List[Dict[str, Any]]:
    """
    Add formatted citations to web search results.

    Args:
        results: List of search result dicts
        citation_style: Citation style name

    Returns:
        Results with 'citation' field added
    """
```

### get_citation_enricher

Factory function to get singleton enricher instance:

```python
async def get_citation_enricher() -> CitationEnricher:
    """Get or create CitationEnricher singleton."""
```

---

## Configuration

### Agent Metadata Configuration

Store citation preferences in agent metadata:

```sql
UPDATE agents
SET metadata = jsonb_set(
    COALESCE(metadata, '{}'),
    '{citation_style}',
    '"ama"'
)
WHERE id = 'agent-id';
```

### Environment Variables

No specific environment variables required. Uses existing Supabase configuration.

---

## Usage Examples

### 1. GraphRAG Query with Citations

```python
from graphrag import get_graphrag_service, GraphRAGRequest

service = await get_graphrag_service()

request = GraphRAGRequest(
    query="What are the FDA requirements for 510(k) submissions?",
    agent_id=agent_uuid,
    session_id=session_uuid,
    include_citations=True,
    citation_style="ama"
)

response = await service.query(request)

# Response includes formatted citations
for chunk in response.context_chunks:
    print(f"Source: {chunk.source.title}")
    print(f"Citation: {chunk.source.citation}")
```

### 2. Web Search with Citations

```python
from tools.web_tools import web_search

results = await web_search(
    query="latest FDA 510k guidance 2024",
    max_results=5
)

# Results include citation field
for result in results['results']:
    print(f"Title: {result['title']}")
    print(f"Citation: {result.get('citation', 'N/A')}")
```

### 3. Custom Citation Formatting

```python
from graphrag.citation_enricher import CitationData, CitationStyle

citation = CitationData(
    doc_id="doc-123",
    title="Clinical Trial Design",
    authors=["Smith, J.", "Jones, M."],
    journal="Medical Research Quarterly",
    publication_date=datetime(2024, 3, 15),
    volume="12",
    issue="3",
    pages="45-67",
    doi="10.1000/mrq.2024.0045"
)

# Format in different styles
apa = citation.format_citation(CitationStyle.APA)
ama = citation.format_citation(CitationStyle.AMA)
vancouver = citation.format_citation(CitationStyle.VANCOUVER)
```

---

## Performance Considerations

1. **Batch Citation Lookup**: Enricher fetches all doc_ids in a single query
2. **Caching**: Consider implementing Redis cache for frequently accessed citations
3. **Lazy Loading**: Citations only enriched when `include_citations=True`
4. **Pre-computed Citations**: Use `citation` field in documents for pre-formatted citations

---

## Testing

```bash
# Test citation formatting
cd services/ai-engine
PYTHONPATH=src .venv/bin/python -c "
from graphrag.citation_enricher import CitationData, CitationStyle
from datetime import datetime

cd = CitationData(
    doc_id='test',
    title='Test Article',
    authors=['Smith, J.'],
    journal='Test Journal',
    publication_date=datetime(2024, 1, 15),
    volume='1',
    issue='1',
    pages='1-10',
    doi='10.1000/test'
)

for style in CitationStyle:
    print(f'{style.value}: {cd.format_citation(style)}')
"
```

---

## Troubleshooting

### Citation Not Appearing

1. Verify `include_citations=True` in request
2. Check document has required metadata (title, authors, etc.)
3. Ensure `citation_style` is valid enum value

### Wrong Citation Format

1. Verify agent metadata has correct `citation_style` setting
2. Check `CitationStyle.from_string()` fallback behavior
3. Ensure document metadata fields match expected format

### Missing Authors/Journal

1. Check `knowledge_documents.metadata` JSONB for additional fields
2. Verify `author` field or `metadata.authors` array exists
3. Fallback formatting used when fields are missing

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | Nov 2025 | Multi-style support (7 styles), WebCitationData, Agent preferences |
| 1.0.0 | Oct 2025 | Initial implementation with APA only |

---

## Related Documentation

- [WORKFLOW_ENHANCEMENT_GUIDE.md](./ask-expert/WORKFLOW_ENHANCEMENT_GUIDE.md) - Ask Expert workflow docs
- [GraphRAG Package](../../services/ai-engine/src/graphrag/__init__.py) - Python package
- [Web Tools](../../services/ai-engine/src/tools/web_tools.py) - Web search integration
