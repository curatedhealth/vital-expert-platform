# 🔍 Knowledge Pipeline Search & Import Feature

## Overview

The **Search & Import** feature allows you to search multiple academic and industry knowledge sources (PubMed, arXiv, BCG, McKinsey, etc.) directly from the Knowledge Pipeline interface, then select and import results into your scraping queue.

---

## 🎯 Features

### 1. **Multi-Source Search**
Search across 7+ different sources simultaneously:

| Source | Type | Description | Content |
|--------|------|-------------|---------|
| **PubMed** | Academic | NCBI medical research database | 35M+ biomedical articles |
| **arXiv** | Academic | Physics, CS, Math preprints | 2M+ research papers |
| **BCG** | Industry | Boston Consulting Group publications | Strategy reports |
| **McKinsey** | Industry | McKinsey & Company insights | Business research |
| **Accenture** | Industry | Accenture Research | Tech trends |
| **Deloitte** | Industry | Deloitte Insights | Industry analysis |
| **Bain** | Industry | Bain & Company | Management consulting |

### 2. **Advanced Filtering**
- **Max Results per Source**: Control how many results to fetch (1-50)
- **Date Filtering**: Filter PubMed results by publication year range
- **Relevance Sorting**: Results sorted by relevance score

### 3. **Batch Selection**
- Select individual results or use "Select All" for bulk import
- Preview abstracts, authors, and metadata before importing
- See PDF availability and direct download status

### 4. **Seamless Queue Integration**
- One-click import: Selected results automatically added to pipeline queue
- Auto-switch to Queue tab to see imported sources
- Imported sources retain all metadata (authors, dates, abstracts, etc.)

---

## 📖 Usage Guide

### Step 1: Navigate to Search & Import

1. Go to **Admin → Knowledge Pipeline**
2. Click the **"Search & Import"** tab

### Step 2: Configure Your Search

1. **Enter Search Query**
   ```
   Example: "artificial intelligence healthcare"
   Example: "digital transformation financial services"
   Example: "machine learning clinical trials"
   ```

2. **Select Sources**
   - Click on source cards to toggle selection
   - Multiple sources can be selected
   - Selected sources show a checkmark and highlighted border

3. **Set Max Results** (optional)
   - Default: 20 results per source
   - Range: 1-50

### Step 3: Execute Search

1. Click **"Search"** button
2. Wait for results (typically 5-30 seconds depending on sources)
3. View results organized by source

### Step 4: Select Results

1. **Review Results**
   - Each result shows:
     - Title
     - Abstract (first 2 lines)
     - Authors (up to 3, then "et al.")
     - Publication year
     - Journal/source
     - PDF availability badge

2. **Select Individual Results**
   - Click on result card to select/deselect
   - Or click the checkbox

3. **Bulk Selection**
   - Click **"Select All"** to select all results across all sources
   - Click **"Deselect All"** to clear selection

### Step 5: Import to Queue

1. Click **"Add X to Queue"** (where X is number of selected results)
2. System automatically:
   - Converts search results to pipeline sources
   - Adds them to the configuration
   - Switches to Queue tab
   - Preserves all metadata

### Step 6: Process Queue

Once in the Queue tab, you can:
- **Run All**: Process all sources sequentially
- **Run Single**: Process individual sources
- **Retry Failed**: Retry sources that failed
- Monitor progress in real-time

---

## 🔧 Technical Implementation

### Backend (Python)

**File**: `/scripts/knowledge_search.py`

```python
# Search multiple sources
results = await search_knowledge_sources(
    query='artificial intelligence healthcare',
    sources=['pubmed', 'arxiv'],
    max_results_per_source=20
)
```

**Supported APIs**:
- **PubMed**: Uses NCBI E-utilities API (eSearch + eSummary)
- **arXiv**: Uses arXiv API with Atom XML parsing
- **Consulting Firms**: Curated results (API integration pending)

### API Endpoint

**Endpoint**: `POST /api/pipeline/search`

**Request**:
```json
{
  "query": "artificial intelligence",
  "sources": ["pubmed", "arxiv", "bcg"],
  "maxResults": 20
}
```

**Response**:
```json
{
  "success": true,
  "query": "artificial intelligence",
  "sources": ["pubmed", "arxiv", "bcg"],
  "results": {
    "pubmed": [
      {
        "id": "12345678",
        "title": "AI in Clinical Diagnosis",
        "abstract": "...",
        "authors": ["Smith J", "Doe A"],
        "publication_year": 2024,
        "url": "https://pubmed.ncbi.nlm.nih.gov/12345678/",
        "pdf_link": null,
        "source": "PubMed",
        "firm": "PubMed / NCBI"
      }
    ],
    "arxiv": [...]
  },
  "totalResults": 45,
  "timestamp": "2025-11-05T..."
}
```

### Frontend Components

**Main Component**: `KnowledgeSearchImport.tsx`

Key features:
- Interactive source selection with visual feedback
- Real-time search with loading states
- Result cards with metadata display
- Bulk selection controls
- Integration with parent queue system

---

## 🎨 UI/UX Features

### Source Selection Cards
- **Visual Design**: Icon + name + description
- **Color Coding**: Each source has unique color
- **Selected State**: Highlighted border + checkmark icon
- **Interactive**: Click anywhere on card to toggle

### Search Results Display
- **Organized by Source**: Results grouped under source headers
- **Rich Metadata**: Title, abstract, authors, year, journal
- **Status Badges**: Publication year, journal, PDF availability
- **Clickable Cards**: Click card to select/deselect

### Progress Indicators
- **Search Loading**: Spinner + "Searching..." text
- **Result Count**: "Found X results • Y selected"
- **Empty State**: Icon + message when no results

---

## 🚀 Example Workflows

### Workflow 1: Research Paper Import
```
1. Search PubMed + arXiv for "machine learning radiology"
2. Get 40 results (20 from each source)
3. Select 10 most relevant papers
4. Add to queue
5. Run all → Downloads PDFs/HTML
6. Content extracted and uploaded to RAG system
```

### Workflow 2: Consulting Report Import
```
1. Search BCG + McKinsey + Accenture for "AI transformation"
2. Get 15 industry reports
3. Review abstracts and select 5 reports
4. Add to queue
5. Process individually to monitor each one
6. View extracted content in Knowledge section
```

### Workflow 3: Mixed Sources
```
1. Search all sources for "digital health"
2. Get 140 results across 7 sources
3. Filter by selecting only recent publications (2024-2025)
4. Select 25 diverse sources (academic + industry)
5. Add to queue
6. Run all overnight
7. Wake up to fully populated knowledge base
```

---

## 🔬 Advanced Features

### 1. **Auto-Metadata Enrichment**
All imported sources automatically get:
- **Quality scores** (auto-calculated based on firm reputation)
- **Credibility scores** (based on source type and authors)
- **Freshness scores** (based on publication date)
- **RAG priority** (high for Tier 1 firms, medium for others)

### 2. **Duplicate Detection**
- System checks for existing URLs in configuration
- Prevents duplicate imports
- Shows warning if duplicate detected

### 3. **Smart Field Mapping**
Search results automatically mapped to pipeline fields:
```
title → title
abstract → abstract
url → source_url
pdf_link → pdf_link (if available)
authors[] → authors[]
publication_year → publication_year
source → imported_from
```

### 4. **Queue Persistence**
- Imported sources persist in queue
- Can save configuration to JSON
- Can export to CSV/Markdown

---

## 📊 Performance

### Search Speed
- **PubMed**: ~3-5 seconds (API calls: eSearch + eSummary)
- **arXiv**: ~2-4 seconds (XML parsing)
- **Consulting Firms**: ~1 second (curated results)
- **Multiple Sources**: Parallel execution, ~5-8 seconds total

### Scalability
- **Max Results**: 50 per source (API limits)
- **Max Sources**: 7 simultaneously
- **Timeout**: 60 seconds per search request

---

## 🐛 Troubleshooting

### "Search timeout (60 seconds)"
- **Cause**: Too many sources or API slowdown
- **Fix**: Reduce max results or select fewer sources

### "No results found"
- **Cause**: Query too specific or source doesn't have relevant content
- **Fix**: Try broader keywords or different sources

### "Search failed"
- **Cause**: API error or network issue
- **Fix**: Check console logs, retry after a moment

### Missing PDF Links
- **Expected**: Not all sources provide direct PDF links
- **Solution**: System will attempt to scrape HTML content instead

---

## 🔮 Future Enhancements

### Planned Features
- [ ] **Google Scholar Integration** (requires API key)
- [ ] **IEEE Xplore Integration** (academic papers)
- [ ] **PwC, KPMG Insights** (expand consulting coverage)
- [ ] **Advanced Filters**: Date range, document type, author
- [ ] **Saved Searches**: Save and rerun common queries
- [ ] **Search History**: View and reuse previous searches
- [ ] **Auto-Import**: Schedule automatic searches
- [ ] **Citation Analysis**: Show citation counts and impact
- [ ] **Content Preview**: Preview full content before importing

### API Integrations Pending
Currently, consulting firm searches return curated results. Full API integration planned for:
- BCG Publications API
- McKinsey Insights API
- Accenture Research API
- Deloitte Insights API
- Bain Publications API

---

## 📝 Best Practices

### 1. **Start Broad, Then Narrow**
```
❌ Bad: "machine learning radiology lung cancer detection 2024"
✅ Good: "machine learning radiology"
Then: Filter results by year and keywords
```

### 2. **Use Multiple Sources**
```
Academic: PubMed + arXiv (research foundation)
Industry: BCG + McKinsey (practical applications)
Result: Comprehensive knowledge base
```

### 3. **Review Before Importing**
- Read abstracts
- Check publication dates
- Verify source credibility
- Look for PDF availability

### 4. **Batch Processing**
- Import 10-20 sources at a time
- Monitor first few for quality
- Adjust search if needed
- Then process larger batches

### 5. **Save Configurations**
- Export successful searches
- Document which sources work best
- Reuse proven search patterns

---

## 🎓 Examples by Use Case

### Healthcare Startup
**Query**: "digital health AI diagnostics"
**Sources**: PubMed, arXiv
**Expected**: 30-40 medical research papers
**Time**: 15-20 minutes to process

### Consulting Project
**Query**: "AI strategy financial services"
**Sources**: BCG, McKinsey, Accenture
**Expected**: 10-15 industry reports
**Time**: 5-10 minutes to process

### Academic Research
**Query**: "deep learning medical imaging"
**Sources**: arXiv, PubMed
**Expected**: 40-50 papers
**Time**: 20-30 minutes to process

### Market Analysis
**Query**: "digital transformation manufacturing"
**Sources**: All consulting firms
**Expected**: 20-25 reports
**Time**: 10-15 minutes to process

---

## ✅ Success Metrics

After importing and processing sources, you should see:

**Knowledge Base Metrics**:
- ✅ Documents added to Supabase `knowledge_documents`
- ✅ Vectors created in Pinecone
- ✅ Content chunked and embedded
- ✅ Metadata enriched with quality scores

**RAG System Metrics**:
- ✅ Improved answer quality in Ask Expert
- ✅ More diverse citations
- ✅ Better coverage of topics
- ✅ Higher confidence scores

**Quality Indicators**:
- ✅ Average quality score > 7.0
- ✅ Credibility score > 8.0 (Tier 1 firms)
- ✅ Successful extraction rate > 85%
- ✅ Zero duplicate imports

---

## 🎉 You're Ready!

The Search & Import feature is now live. Start by:
1. Navigate to Knowledge Pipeline
2. Click "Search & Import" tab
3. Try a test search: "artificial intelligence"
4. Select a few results
5. Add to queue
6. Process and verify

**Happy Knowledge Hunting! 🚀📚**

