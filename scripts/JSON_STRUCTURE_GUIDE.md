# Knowledge Pipeline JSON Structure Guide

## 📋 Complete JSON Structure

The knowledge pipeline accepts JSON files with the following structure:

## Basic Structure

```json
{
  "sources": [...],              // Required: Array of source objects
  "output_settings": {...},      // Optional: Output configuration
  "scraping_settings": {...},    // Optional: Web scraping configuration
  "processing_settings": {...},  // Optional: Content processing settings
  "upload_settings": {...},      // Optional: Upload configuration
  "embedding_model": "string",   // Optional: Embedding model name
  "metadata": {...}              // Optional: Collection metadata
}
```

---

## 1. Sources (Required)

Each source object represents a URL to scrape and ingest:

```json
{
  "sources": [
    {
      "url": "https://example.com/article",           // Required: URL to scrape
      "domain": "regulatory_affairs",                 // Required: Knowledge domain
      "category": "fda_guidelines",                   // Optional: Subcategory
      "tags": ["tag1", "tag2", "tag3"],              // Optional: Tags for filtering
      "priority": "high",                            // Optional: high|medium|low
      "css_selector": ".article-content",            // Optional: Target specific content
      "description": "Human-readable description"    // Optional: Source description
    }
  ]
}
```

### Source Fields Explained

| Field | Required | Type | Description | Example |
|-------|----------|------|-------------|---------|
| `url` | ✅ Yes | string | Full URL to scrape | `"https://fda.gov/guidance"` |
| `domain` | ✅ Yes | string | Knowledge domain (see list below) | `"regulatory_affairs"` |
| `category` | ⚪ Optional | string | Subcategory or classification | `"fda_guidelines"` |
| `tags` | ⚪ Optional | string[] | Array of tags for filtering | `["fda", "medical-devices"]` |
| `priority` | ⚪ Optional | enum | Scraping priority | `"high"`, `"medium"`, `"low"` |
| `css_selector` | ⚪ Optional | string | CSS selector for content extraction | `".main-content"` |
| `description` | ⚪ Optional | string | Human-readable description | `"FDA device regulations"` |

---

## 2. Knowledge Domains

Choose from **30 healthcare domains** organized in 3 tiers:

### Tier 1: Core Domains (15)
- `regulatory_affairs`
- `clinical_development`
- `pharmacovigilance`
- `quality_assurance`
- `medical_affairs`
- `drug_safety`
- `clinical_operations`
- `medical_writing`
- `biostatistics`
- `data_management`
- `translational_medicine`
- `market_access`
- `labeling_advertising`
- `post_market_surveillance`
- `patient_engagement`

### Tier 2: Specialized Domains (10)
- `scientific_publications`
- `nonclinical_sciences`
- `risk_management`
- `submissions_and_filings`
- `health_economics`
- `medical_devices`
- `bioinformatics`
- `companion_diagnostics`
- `regulatory_intelligence`
- `lifecycle_management`

### Tier 3: Emerging Domains (5)
- `digital_health`
- `precision_medicine`
- `ai_ml_healthcare`
- `telemedicine`
- `sustainability`

---

## 3. Output Settings (Optional)

```json
{
  "output_settings": {
    "create_subdirectories": true,    // Create domain-based folders
    "include_metadata": true,         // Include metadata in markdown
    "markdown_format": true           // Save as markdown files
  }
}
```

---

## 4. Scraping Settings (Optional)

```json
{
  "scraping_settings": {
    "timeout": 60,                              // Timeout per request (seconds)
    "max_retries": 3,                          // Max retry attempts
    "delay_between_requests": 2,               // Delay between requests (seconds)
    "user_agent": "VITAL-Bot/1.0"             // Custom user agent
  }
}
```

---

## 5. Processing Settings (Optional)

```json
{
  "processing_settings": {
    "chunk_size": 1000,                // Characters per chunk
    "chunk_overlap": 200,              // Overlap between chunks
    "min_word_count": 100,             // Minimum words to process
    "max_content_length": 100000       // Maximum content length
  }
}
```

---

## 6. Upload Settings (Optional)

```json
{
  "upload_settings": {
    "enable_supabase": true,           // Upload to Supabase
    "enable_pinecone": true,           // Upload to Pinecone
    "batch_size": 10,                  // Batch size for uploads
    "skip_duplicates": true            // Skip duplicate content
  }
}
```

---

## 7. Embedding Model (Optional)

```json
{
  "embedding_model": "sentence-transformers/all-MiniLM-L6-v2"
}
```

**Popular Models:**
- `sentence-transformers/all-MiniLM-L6-v2` (Fast, 384 dim)
- `sentence-transformers/all-mpnet-base-v2` (Best quality, 768 dim)
- `sentence-transformers/multi-qa-mpnet-base-dot-v1` (Q&A optimized)
- `BAAI/bge-small-en-v1.5` (Multilingual, efficient)

---

## 8. Metadata (Optional)

```json
{
  "metadata": {
    "collection_name": "FDA Guidelines 2025",
    "collection_description": "Comprehensive FDA regulatory guidance",
    "created_by": "Your Name",
    "created_at": "2025-11-05",
    "version": "1.0",
    "total_sources": 50,
    "topics": ["regulatory", "compliance", "medical devices"]
  }
}
```

---

## 📦 Complete Example

See `genai_consulting_reports_knowledge.json` for a complete example with all fields.

## 🔄 Alternative JSON Formats

The UI also supports these simplified formats:

### Format 1: Direct Array (Auto-converted)
```json
[
  {
    "url": "https://example.com",
    "title": "Article Title",
    "topics": ["tag1", "tag2"]
  }
]
```
*Automatically mapped to: domain="uncategorized", category="general", tags=topics, description=title*

### Format 2: Single Object
```json
{
  "url": "https://example.com",
  "domain": "regulatory_affairs",
  "category": "guidelines",
  "tags": ["fda"],
  "description": "FDA guidance document"
}
```

---

## 🎯 Best Practices

### 1. **Use Specific Domains**
```json
✅ Good:  "domain": "regulatory_affairs"
❌ Avoid: "domain": "uncategorized"
```

### 2. **Add Descriptive Tags**
```json
✅ Good:  "tags": ["fda", "510k", "medical-devices", "guidance"]
❌ Avoid: "tags": ["misc", "other"]
```

### 3. **Set Priorities**
```json
✅ Good:  "priority": "high"     // For critical sources
          "priority": "medium"   // For regular sources
          "priority": "low"      // For supplementary sources
```

### 4. **Use CSS Selectors for Clean Content**
```json
✅ Good:  "css_selector": ".article-content, main"
✅ Good:  "css_selector": "#main-text"
⚪ Skip:  null  // Scrapes entire page
```

### 5. **Group Related Sources**
```json
{
  "sources": [
    // Group 1: FDA Guidelines
    { "url": "...", "domain": "regulatory_affairs", "category": "fda_guidelines" },
    { "url": "...", "domain": "regulatory_affairs", "category": "fda_guidelines" },
    
    // Group 2: EMA Guidelines
    { "url": "...", "domain": "regulatory_affairs", "category": "ema_guidelines" },
    { "url": "...", "domain": "regulatory_affairs", "category": "ema_guidelines" }
  ]
}
```

---

## 🚀 Usage

### 1. Via UI (Recommended)
1. Go to: `http://localhost:3000/admin?view=knowledge-pipeline`
2. Click "Choose File" under "Import Sources"
3. Select your JSON file
4. Sources will be imported and displayed

### 2. Via Command Line
```bash
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path
python scripts/knowledge-pipeline.py \
  --config your-config.json \
  --output ./knowledge \
  --use-rag
```

---

## 📊 Validation Checklist

Before running the pipeline:

- [ ] All sources have valid URLs
- [ ] All sources have assigned domains (not "uncategorized")
- [ ] Tags are relevant and specific
- [ ] Priorities are set appropriately
- [ ] CSS selectors tested (if used)
- [ ] Descriptions are clear and informative
- [ ] Embedding model is appropriate for use case
- [ ] Upload settings match your infrastructure

---

## 🔍 Troubleshooting

### "No sources found"
- Check that `sources` array exists and is not empty
- Verify JSON is valid (use jsonlint.com)

### "Invalid domain"
- Use one of the 30 approved domains
- Check spelling (use underscores, not hyphens)

### Sources not appearing
- Clear browser cache
- Check browser console for errors
- Verify file was uploaded (look for success message)

---

**Last Updated**: 2025-11-05
**Version**: 1.0
**Compatible With**: Knowledge Pipeline v1.0+

