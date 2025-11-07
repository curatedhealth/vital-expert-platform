# Knowledge Pipeline - Automated Content Scraping & Upload

A comprehensive Python script for automating the process of scraping web content, organizing it by domain, and uploading to Supabase and Pinecone for your VITAL AI platform.

## Features

✅ **Web Scraping**
- Robust scraping with retry logic and backoff
- CSS selector support for targeted extraction
- Clean text extraction with metadata
- Link and image extraction
- Content hashing for deduplication

✅ **Content Curation**
- Automatic organization by domain/category
- Markdown file generation with frontmatter
- Directory structure creation
- Content quality validation

✅ **Database Integration**
- Supabase metadata upload
- Pinecone vector embeddings
- Duplicate detection and handling
- Batch processing support

✅ **Reporting**
- Comprehensive execution reports
- Success/failure statistics
- Domain-wise breakdowns
- Failed URLs tracking

## Prerequisites

### Required Packages

```bash
pip install supabase-py pinecone-client langchain sentence-transformers torch beautifulsoup4 aiohttp python-dotenv backoff
```

**Note:** Uses Hugging Face `sentence-transformers` for embeddings (no OpenAI API key required!)

### Environment Variables

Create a `.env` file or set these environment variables:

```bash
# Required
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional (for Pinecone vector upload)
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=your_environment
```

**No OpenAI API key needed!** This pipeline uses free Hugging Face models for embeddings.

## Quick Start

### 1. Create Configuration File

Create a JSON file (e.g., `sources.json`) with your source URLs and metadata:

```json
{
  "sources": [
    {
      "url": "https://www.fda.gov/medical-devices/overview",
      "domain": "regulatory",
      "category": "fda_guidelines",
      "tags": ["medical-devices", "fda", "regulatory"],
      "priority": "high",
      "css_selector": null,
      "description": "FDA Medical Devices Overview"
    },
    {
      "url": "https://example.com/article",
      "domain": "research",
      "category": "clinical_trials",
      "tags": ["research", "trials"],
      "priority": "medium",
      "css_selector": ".article-content",
      "description": "Research article on clinical trials"
    }
  ],
  "output_settings": {
    "create_subdirectories": true,
    "include_metadata": true,
    "markdown_format": true
  }
}
```

### 2. Run the Pipeline

```bash
# Basic usage (uses default Hugging Face model)
python scripts/knowledge-pipeline.py --config sources.json

# Use a specific embedding model
python scripts/knowledge-pipeline.py --config sources.json \
  --embedding-model sentence-transformers/all-mpnet-base-v2

# Dry run (test without uploading)
python scripts/knowledge-pipeline.py --config sources.json --dry-run

# Custom output directory
python scripts/knowledge-pipeline.py --config sources.json --output-dir ./my-knowledge

# Medical content with specialized model
python scripts/knowledge-pipeline.py --config medical-sources.json \
  --embedding-model pritamdeka/BioBERT-mnli-snli-scinli-scitail-mednli-stsb
```

## Configuration Reference

### Source Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | URL to scrape |
| `domain` | string | No | Domain category (e.g., "regulatory", "research") |
| `category` | string | No | Specific category (e.g., "fda_guidelines") |
| `tags` | array | No | Tags for categorization |
| `priority` | string | No | Priority level: "high", "medium", "low" |
| `css_selector` | string | No | CSS selector for targeted content extraction |
| `description` | string | No | Human-readable description |

### Example Configurations

#### Medical Device Regulatory Content

```json
{
  "sources": [
    {
      "url": "https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance",
      "domain": "regulatory",
      "category": "fda_guidance",
      "tags": ["fda", "medical-devices", "510k", "pma"],
      "priority": "high"
    },
    {
      "url": "https://www.ema.europa.eu/en/medical-devices-sector",
      "domain": "regulatory",
      "category": "ema_guidance",
      "tags": ["ema", "medical-devices", "europe", "mdr"],
      "priority": "high"
    }
  ]
}
```

#### Clinical Research Papers

```json
{
  "sources": [
    {
      "url": "https://pubmed.ncbi.nlm.nih.gov/12345678/",
      "domain": "research",
      "category": "clinical_research",
      "tags": ["pubmed", "clinical-trial", "rct"],
      "priority": "medium",
      "css_selector": ".article-content"
    }
  ]
}
```

#### Industry Standards

```json
{
  "sources": [
    {
      "url": "https://www.iso.org/standard/59752.html",
      "domain": "standards",
      "category": "iso_standards",
      "tags": ["iso-13485", "quality-management", "medical-devices"],
      "priority": "high"
    }
  ]
}
```

## Output Structure

The pipeline creates the following directory structure:

```
knowledge/
├── regulatory/
│   ├── FDA_Medical_Devices_Overview_a1b2c3d4.md
│   └── EMA_Regulatory_Framework_e5f6g7h8.md
├── research/
│   ├── Clinical_Trial_Study_Design_i9j0k1l2.md
│   └── Statistical_Analysis_Methods_m3n4o5p6.md
├── standards/
│   └── ISO_13485_Requirements_q7r8s9t0.md
└── pipeline_report_20251105_143022.md
```

Each markdown file includes:
- Frontmatter with metadata (title, URL, domain, tags, etc.)
- Full content extracted from the source
- Word count and scraping timestamp
- Content hash for deduplication

## Pipeline Flow

```
1. Load Configuration
   ↓
2. Validate Config & Environment
   ↓
3. For Each Source:
   ├── Scrape Content (with retry)
   ├── Extract & Clean Text
   ├── Save to Knowledge Folder
   ├── Upload Metadata to Supabase
   └── Upload Vectors to Pinecone
   ↓
4. Generate Comprehensive Report
```

## Database Schema

### Supabase Table: `knowledge_documents`

The pipeline expects a table with these columns:

```sql
CREATE TABLE knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT UNIQUE,
  domain TEXT,
  category TEXT,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_knowledge_domain ON knowledge_documents(domain);
CREATE INDEX idx_knowledge_category ON knowledge_documents(category);
CREATE INDEX idx_knowledge_tags ON knowledge_documents USING GIN(tags);
```

### Pinecone Index

Vectors are stored with this metadata structure:

```json
{
  "title": "Document Title",
  "url": "https://...",
  "domain": "regulatory",
  "category": "fda_guidelines",
  "chunk_index": 0,
  "chunk_text": "Preview of chunk content...",
  "scraped_at": "2025-11-05T14:30:22Z"
}
```

## Embedding Models

The pipeline uses **Hugging Face sentence-transformers** for generating embeddings. No OpenAI API key required!

### Available Models

**Default:** `sentence-transformers/all-MiniLM-L6-v2`
- Fast, efficient, good quality
- 384 dimensions
- ~14,000 sentences/sec on CPU

**High Quality:** `sentence-transformers/all-mpnet-base-v2`
- Best quality embeddings
- 768 dimensions
- ~2,800 sentences/sec on CPU

**Q&A Optimized:** `sentence-transformers/multi-qa-mpnet-base-dot-v1`
- Perfect for RAG/Ask Expert
- 768 dimensions
- Optimized for question-answer matching

**Medical/Healthcare:** `pritamdeka/BioBERT-mnli-snli-scinli-scitail-mednli-stsb`
- Specialized for medical content
- Better understanding of clinical terms
- Trained on biomedical literature

See `EMBEDDING_MODELS_GUIDE.md` for complete comparison and recommendations.

### GPU Acceleration

The pipeline automatically uses GPU if available (via PyTorch/CUDA):
- 3-5x faster embedding generation
- Recommended for large-scale processing

Check GPU availability:
```bash
python -c "import torch; print(f'GPU: {torch.cuda.is_available()}')"
```

## Advanced Usage

### Batch Processing Multiple Config Files

```bash
# Process multiple domains
for config in configs/*.json; do
  python scripts/knowledge-pipeline.py --config "$config"
done
```

### Scheduled Execution (Cron)

```bash
# Add to crontab for daily execution at 2 AM
0 2 * * * cd /path/to/project && python scripts/knowledge-pipeline.py --config daily-sources.json
```

### Custom Integration

```python
from knowledge_pipeline import KnowledgePipeline

# Create custom pipeline
pipeline = KnowledgePipeline(
    config_path='sources.json',
    output_dir='./knowledge',
    dry_run=False
)

# Run asynchronously
await pipeline.run()
```

## Error Handling

The pipeline includes robust error handling:

- **Network Errors**: Automatic retry with exponential backoff
- **Parsing Errors**: Graceful failure with detailed logging
- **Upload Errors**: Continues processing, tracks failures
- **Validation Errors**: Early detection with clear error messages

Failed URLs are tracked and included in the final report.

## Performance

- **Concurrent Scraping**: Async/await for efficient I/O
- **Batch Processing**: Optimized database operations
- **Rate Limiting**: Configurable delays between requests
- **Resource Management**: Automatic cleanup of connections

Typical performance:
- 10-15 URLs per minute (depending on content size)
- ~1-2 seconds per page including upload
- Minimal memory footprint with streaming

## Monitoring

Check the logs:

```bash
# Real-time monitoring
tail -f knowledge-pipeline.log

# View recent errors
grep "ERROR" knowledge-pipeline.log
```

## Troubleshooting

### Common Issues

**"Missing required environment variables"**
- Ensure `.env` file exists with required variables
- Or export variables in your shell

**"Pinecone index not found"**
- Create the index in Pinecone dashboard first
- Or set `PINECONE_API_KEY` to empty to skip vector upload

**"Failed to upload to Supabase"**
- Check service role key permissions
- Verify table schema matches expected structure

**"Connection timeout"**
- Increase timeout in config: `"timeout": 60`
- Check network connectivity

### Debug Mode

Enable detailed logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Future Enhancements

Planned features:
- [ ] Recursive crawling (follow links)
- [ ] PDF and document parsing
- [ ] Multi-language support
- [ ] Custom post-processing hooks
- [ ] Webhook notifications
- [ ] Web UI for configuration

## Support

For issues or questions:
1. Check the logs in `knowledge-pipeline.log`
2. Review the execution report
3. Verify configuration against examples
4. Check environment variables

## License

Part of the VITAL AI Platform - Internal Use

---

**Last Updated**: 2025-11-05
**Version**: 1.0.0

