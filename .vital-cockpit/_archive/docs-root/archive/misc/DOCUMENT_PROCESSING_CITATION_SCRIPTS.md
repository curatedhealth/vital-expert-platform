# 📚 **Document Processing & Citation Scripts - Complete Guide**

**Date**: 2025-11-06 14:30 UTC  
**Status**: ✅ **SCRIPTS DOCUMENTED**

---

## **🔍 Scripts You Built**

### **1. Document Reprocessing Script**
**File**: `services/ai-engine/src/scripts/reprocess_documents.py`

**Purpose**: Reprocess existing documents with proper metadata, chunking, and embeddings

**Features**:
- ✅ Chunks documents into overlapping segments (default: 1000 chars, 200 overlap)
- ✅ Generates embeddings (text-embedding-3-small for Supabase, text-embedding-3-large for Pinecone)
- ✅ Maps domain names to domain_id UUIDs
- ✅ Updates document status to 'active'
- ✅ Syncs to both Supabase and Pinecone
- ✅ Handles domain namespace mapping for Pinecone

**Usage**:
```bash
# Reprocess specific domains
python reprocess_documents.py --domains "Digital Health" "Regulatory Affairs"

# Reprocess all documents
python reprocess_documents.py --all

# Custom chunk size
python reprocess_documents.py --chunk-size 1500 --chunk-overlap 300
```

**Key Functions**:
- `get_domain_mapping()`: Maps domain names to UUIDs
- `get_documents_to_process()`: Fetches documents by domain
- `chunk_document()`: Splits content into chunks
- `process_document()`: Full pipeline (chunk → embed → store → sync)

---

### **2. Comprehensive Metadata Mapper**
**File**: `scripts/comprehensive_metadata_mapper.py`

**Purpose**: Map source configuration and scraped data to **85+ metadata fields**

**Features**:
- ✅ **Core Identification**: title, abstract, content
- ✅ **Source & Publication**: firm, authors, publication_date, year, version
- ✅ **Document Properties**: file_type, page_count, word_count, language
- ✅ **Access & Retrieval**: URL, PDF link, paywall status, download date
- ✅ **Quality & Vetting**: quality_score, credibility_score, peer_reviewed, citation_count
- ✅ **Taxonomy**: domain, category, tags, industry sectors, geographic scope
- ✅ **RAG/AI Metadata**: priority, rag_priority_weight, embedding_model, chunk_strategy
- ✅ **Provenance & Citation**: DOI, ISBN, citation_format, related documents
- ✅ **Compliance**: data classification, retention policy, PII sensitivity

**Usage**:
```python
from scripts.comprehensive_metadata_mapper import map_source_to_metadata

metadata = map_source_to_metadata(source_config, scraped_data)
```

**Citation-Related Fields**:
- `citation_format`: Stores citation style (e.g., "Chicago 17th", "APA 7th")
- `citation_count`: Number of times cited
- `authors`: List of authors
- `publication_date`: Publication date
- `doi`: Digital Object Identifier
- `isbn`: International Standard Book Number

---

### **3. Metadata Auto-Calculator**
**File**: `scripts/metadata_auto_calculator.py`

**Purpose**: Automatically calculate quality scores, freshness, readability, and credibility

**Features**:
- ✅ **Quality Score** (0-10): Weighted by firm reputation, peer review, citations, data richness, freshness
- ✅ **Credibility Score** (0-10): Based on firm, peer review, editorial status
- ✅ **Freshness Score** (0-10): Age-based decay (0-3 months = 10, 5+ years = 1)
- ✅ **Readability Score** (0-100): Flesch Reading Ease algorithm
- ✅ **Technical Complexity**: Classifies as beginner/intermediate/advanced/expert
- ✅ **Data Richness**: Based on tables, charts, word count, page count

**Usage**:
```python
from scripts.metadata_auto_calculator import enrich_metadata

enriched = enrich_metadata(base_metadata, content)
```

**Firm Reputation Scores**:
- McKinsey & Company: 9.9
- BCG: 9.8
- Bain: 9.7
- Deloitte: 9.0
- Gartner: 8.9
- PwC: 8.8
- Default: 7.0

---

### **4. HuggingFace Document Processor**
**File**: `services/ai-engine/src/scripts/process_documents_huggingface.py`

**Purpose**: Process documents using HuggingFace embeddings (to avoid OpenAI API limits)

**Features**:
- ✅ Uses HuggingFace `sentence-transformers/all-MiniLM-L6-v2`
- ✅ No API costs
- ✅ Same pipeline as reprocess_documents.py
- ✅ Syncs to Supabase and Pinecone

---

## **🎨 Chicago-Style Citation Formatter**

### **What You Need**:
A script to format citations in **Chicago 17th Edition** style.

### **Chicago Style Format**:

**For Articles/Reports**:
```
Author(s). "Title." Publisher, Publication Date. URL.

Example:
Boston Consulting Group. "AI at Work: Momentum Builds, but Gaps Remain." BCG, January 15, 2025. https://www.bcg.com/publications/2025/ai-at-work.
```

**For Books**:
```
Author(s). Title. Edition. Publisher, Year.

Example:
Smith, John, and Jane Doe. Digital Health Innovation. 2nd ed. MIT Press, 2024.
```

**For Web Pages**:
```
Author/Organization. "Title." Website Name. Publication Date. URL.

Example:
FDA. "Software as a Medical Device (SaMD): Clinical Evaluation." U.S. Food and Drug Administration. December 8, 2017. https://www.fda.gov/samd.
```

---

## **📝 Creating Chicago-Style Citation Script**

I'll create a new script that formats citations in Chicago style:

**File**: `scripts/chicago_citation_formatter.py`

**Features**:
- ✅ Formats citations from metadata
- ✅ Supports multiple document types (article, book, report, web page)
- ✅ Handles multiple authors
- ✅ Includes URL and DOI
- ✅ Proper capitalization and punctuation

---

## **🔧 How to Use All Scripts Together**

### **Workflow**:

```
1. Web Scraping
   ↓
2. Metadata Mapping (comprehensive_metadata_mapper.py)
   ↓
3. Metadata Enrichment (metadata_auto_calculator.py)
   ↓
4. Document Processing (reprocess_documents.py)
   ↓
5. Citation Formatting (chicago_citation_formatter.py) ← NEW
   ↓
6. Display in UI with proper citations
```

### **Example**:

```python
# 1. Map metadata
from scripts.comprehensive_metadata_mapper import map_source_to_metadata
metadata = map_source_to_metadata(source_config, scraped_data)

# 2. Enrich with auto-calculated scores
from scripts.metadata_auto_calculator import enrich_metadata
enriched = enrich_metadata(metadata, content)

# 3. Format citation
from scripts.chicago_citation_formatter import format_citation
citation = format_citation(enriched)
# Output: "Boston Consulting Group. "AI at Work." BCG, 2025. https://www.bcg.com/..."

# 4. Store with citation format
enriched['citation_format'] = citation
enriched['citation_style'] = 'Chicago 17th'
```

---

## **✅ What's Missing**

### **1. Chicago-Style Citation Formatter** ⚠️ NOT CREATED YET

You mentioned you had this, but I don't see it in the codebase. I'll create it now.

---

## **🚀 Next Steps**

1. ✅ Create `chicago_citation_formatter.py`
2. ✅ Update `reprocess_documents.py` to use citation formatter
3. ✅ Update `comprehensive_metadata_mapper.py` to include formatted citation
4. ✅ Test citation display in UI

---

**Creating the Chicago-style citation formatter now...**

