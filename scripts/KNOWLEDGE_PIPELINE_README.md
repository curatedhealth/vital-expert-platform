# VITAL Knowledge Pipeline

## 🚀 Production-Ready Setup

### Installation

```bash
# 1. Install dependencies
cd scripts
pip install -r requirements.txt

# 2. Set up environment variables
cp ../.env.local .env
# Or manually create .env with required keys

# 3. Verify setup
python knowledge-pipeline.py --help
```

### Quick Start

```bash
# Run with default settings (RAG service integration)
python knowledge-pipeline.py --config config.json

# Test without uploading
python knowledge-pipeline.py --config config.json --dry-run

# Custom embedding model
python knowledge-pipeline.py \
  --config config.json \
  --embedding-model sentence-transformers/all-mpnet-base-v2
```

### Configuration File Format

Create a `config.json` file:

```json
{
  "sources": [
    {
      "url": "https://www.fda.gov/medical-devices/overview",
      "domain": "regulatory",
      "category": "fda_guidelines",
      "tags": ["fda", "medical-devices"],
      "priority": "high",
      "description": "FDA Medical Devices Overview"
    }
  ],
  "output_settings": {
    "create_subdirectories": true,
    "include_metadata": true,
    "markdown_format": true
  }
}
```

### Environment Variables

Required in `.env` file:

```bash
# Supabase (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Pinecone (Optional)
PINECONE_API_KEY=your_pinecone_key
PINECONE_RAG_INDEX_NAME=vital-rag-production
```

### Features

✅ **Production-Ready**
- Full type hints
- Comprehensive error handling
- Retry logic with exponential backoff
- Clean logging

✅ **RAG Service Integration**
- Uses unified RAG service
- Consistent chunking & embedding
- Domain/namespace routing
- Automatic metadata enrichment

✅ **Clean Architecture**
- Modular design
- Easy to test
- Well-documented
- PEP 8 compliant

### Usage Examples

#### Basic Usage
```bash
python knowledge-pipeline.py --config my-sources.json
```

#### Dry Run (Test Mode)
```bash
python knowledge-pipeline.py --config my-sources.json --dry-run
```

#### Custom Output Directory
```bash
python knowledge-pipeline.py \
  --config my-sources.json \
  --output-dir ./my-knowledge
```

#### Different Embedding Model
```bash
python knowledge-pipeline.py \
  --config my-sources.json \
  --embedding-model sentence-transformers/multi-qa-mpnet-base-dot-v1
```

### Output

The pipeline creates:

```
knowledge/
├── regulatory/
│   ├── FDA_Medical_Devices_abc123.md
│   └── EMA_Guidelines_def456.md
├── research/
│   └── Clinical_Trial_xyz789.md
└── pipeline_report_20251105_143022.md
```

### Monitoring

Check logs:
```bash
tail -f knowledge-pipeline.log
```

View report:
```bash
cat knowledge/pipeline_report_*.md
```

### Troubleshooting

**Import Error:**
```bash
# Make sure you're in the project root
cd /path/to/VITAL\ path
python scripts/knowledge-pipeline.py --config config.json
```

**Missing Dependencies:**
```bash
pip install -r scripts/requirements.txt
```

**RAG Service Connection:**
```bash
# Verify environment variables
python -c "
from dotenv import load_dotenv
import os
load_dotenv()
print('✅ SUPABASE_URL:', os.getenv('SUPABASE_URL')[:30] + '...')
"
```

### Documentation

- **Full Guide**: [KNOWLEDGE_PIPELINE_README.md](KNOWLEDGE_PIPELINE_README.md)
- **RAG Integration**: [RAG_INTEGRATION_GUIDE.md](RAG_INTEGRATION_GUIDE.md)
- **Embedding Models**: [EMBEDDING_MODELS_GUIDE.md](EMBEDDING_MODELS_GUIDE.md)
- **Environment Setup**: [KNOWLEDGE_PIPELINE_ENV_SETUP.md](KNOWLEDGE_PIPELINE_ENV_SETUP.md)

---

**Version:** 2.0.0 (Production Ready)
**Python:** 3.8+
**Status:** ✅ Ready for Production Use
