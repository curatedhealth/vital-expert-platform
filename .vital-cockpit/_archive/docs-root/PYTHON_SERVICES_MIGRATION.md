# Python Services Migration - Complete Guide

## ✅ COMPLETED: All AI/ML Services Migrated to Python

All core AI/ML services and tools have been migrated to Python and are now running in the FastAPI ai-engine service.

---

## 📦 Python Services Created

### **1. Unified RAG Service** (`unified_rag_service.py`)
- ✅ **Pinecone Integration**: Vector search with metadata filtering
- ✅ **Supabase Integration**: Metadata enrichment and fallback search
- ✅ **Multiple Strategies**: semantic, hybrid, agent-optimized, keyword
- ✅ **Domain Support**: Domain-specific filtering with new architecture
- ✅ **Priority Weighting**: RAG priority weight for ranking
- ✅ **Agent Optimization**: Agent-specific relevance boosting

**Endpoints:**
- `POST /api/rag/query` - Unified RAG query endpoint

### **2. Smart Metadata Extractor** (`smart_metadata_extractor.py`)
- ✅ **Pattern Matching**: Extracts metadata from filenames and content
- ✅ **AI-Enhanced Extraction**: Optional OpenAI-based metadata extraction
- ✅ **Source Detection**: Recognizes regulatory bodies, journals, consultancies, pharma companies
- ✅ **Document Classification**: Detects document types automatically
- ✅ **Year/Date Extraction**: Extracts publication years and dates
- ✅ **Therapeutic Area Detection**: Identifies medical specialties
- ✅ **Keyword Extraction**: Extracts key terms from content
- ✅ **Language Detection**: Simple language detection

**Endpoints:**
- `POST /api/metadata/extract` - Extract metadata from filename and/or content

### **3. File Renamer** (`file_renamer.py`)
- ✅ **Taxonomy-Based Naming**: Consistent filename generation based on metadata
- ✅ **Template Support**: Customizable filename templates
- ✅ **Smart Formatting**: Handles acronyms, titles, types correctly
- ✅ **Length Management**: Ensures filenames don't exceed system limits
- ✅ **Extension Handling**: Preserves file extensions

**Endpoints:**
- `POST /api/metadata/generate-filename` - Generate new filename based on metadata

### **4. Copyright Checker** (`copyright_checker.py`)
- ✅ **Copyright Notice Detection**: Detects copyright notices in content
- ✅ **Attribution Checking**: Verifies proper attribution
- ✅ **Watermark Detection**: Identifies draft/watermark markings
- ✅ **Proprietary Content Detection**: Flags confidential/proprietary content
- ✅ **License Validation**: Checks if source is licensed/public domain
- ✅ **Risk Assessment**: Calculates copyright risk levels
- ✅ **Recommendations**: Provides actionable recommendations

**Endpoints:**
- `POST /api/metadata/copyright-check` - Check document for copyright compliance

### **5. Data Sanitizer** (`data_sanitizer.py`)
- ✅ **PII Removal**: Removes emails, phone numbers, SSN, credit cards
- ✅ **PHI Removal**: Removes MRN, DOB, and other protected health information
- ✅ **Address Removal**: Detects and removes physical addresses
- ✅ **IP Address Removal**: Removes IP addresses (excluding local)
- ✅ **Multiple Redaction Modes**: mask, remove, hash
- ✅ **Risk Assessment**: Calculates sanitization risk levels
- ✅ **Audit Trail**: Logs all removed content for compliance

**Endpoints:**
- `POST /api/metadata/sanitize` - Sanitize content to remove PII/PHI

### **6. Metadata Processing Orchestrator** (`metadata_processing_service.py`)
- ✅ **Orchestrates All Services**: Coordinates all metadata services
- ✅ **Combined Processing**: Process file with all services at once
- ✅ **Individual Services**: Can call services individually if needed
- ✅ **Error Handling**: Comprehensive error handling with fallbacks

**Endpoints:**
- `POST /api/metadata/process` - Process file with all metadata services (extraction, sanitization, copyright, renaming)

---

## 🔄 API Gateway Routing

The API Gateway (`services/api-gateway/src/index.js`) routes all requests to Python:

```javascript
// RAG Services
POST /api/rag/query → ${AI_ENGINE_URL}/api/rag/query

// Metadata Services
POST /api/metadata/process → ${AI_ENGINE_URL}/api/metadata/process
POST /api/metadata/extract → ${AI_ENGINE_URL}/api/metadata/extract
POST /api/metadata/sanitize → ${AI_ENGINE_URL}/api/metadata/sanitize
POST /api/metadata/copyright-check → ${AI_ENGINE_URL}/api/metadata/copyright-check
POST /api/metadata/generate-filename → ${AI_ENGINE_URL}/api/metadata/generate-filename
```

---

## 📋 Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  API Gateway (Node.js)                       │
│  • Authentication/Authorization                              │
│  • Rate Limiting                                           │
│  • Request Routing                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Python AI Engine (FastAPI)                      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Unified RAG Service                                │    │
│  │  • Pinecone Vector Search                           │    │
│  │  • Supabase Metadata                                │    │
│  │  • Multiple Strategies                              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Metadata Processing Service                       │    │
│  │  ┌────────────────────────────────────────────┐  │    │
│  │  │  Smart Metadata Extractor                   │  │    │
│  │  │  • Pattern Matching                          │  │    │
│  │  │  • AI Extraction                            │  │    │
│  │  └────────────────────────────────────────────┘  │    │
│  │  ┌────────────────────────────────────────────┐  │    │
│  │  │  File Renamer                               │  │    │
│  │  │  • Taxonomy-Based Naming                   │  │    │
│  │  │  • Template Support                         │  │    │
│  │  └────────────────────────────────────────────┘  │    │
│  │  ┌────────────────────────────────────────────┐  │    │
│  │  │  Copyright Checker                         │  │    │
│  │  │  • Notice Detection                         │  │    │
│  │  │  • Risk Assessment                          │  │    │
│  │  └────────────────────────────────────────────┘  │    │
│  │  ┌────────────────────────────────────────────┐  │    │
│  │  │  Data Sanitizer                            │  │    │
│  │  │  • PII/PHI Removal                         │  │    │
│  │  │  • Multiple Redaction Modes                │  │    │
│  │  └────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Agent Orchestrator                                 │    │
│  │  • LLM Invocation                                  │    │
│  │  • Tool Conversion                                 │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
    ┌─────────┐  ┌─────────┐  ┌──────────┐
    │ Pinecone│  │ Supabase │  │  OpenAI  │
    │ Vectors │  │ Metadata │  │   LLMs   │
    └─────────┘  └─────────┘  └──────────┘
```

---

## 🚀 Usage Examples

### **1. Process File with All Services**

```python
# Python ai-engine endpoint
POST /api/metadata/process
{
  "filename": "FDA_Regulatory_Guidance_2024.pdf",
  "content": "Document content here...",
  "options": {
    "extract_from_content": true,
    "sanitize": true,
    "check_copyright": true,
    "rename_file": false,
    "remove_pii": true,
    "remove_phi": true,
    "check_watermarks": true
  }
}

# Response
{
  "metadata": {
    "source_name": "FDA",
    "document_type": "Regulatory Guidance",
    "year": 2024,
    "regulatory_body": "FDA",
    "clean_title": "Regulatory Guidance",
    "extraction_confidence": 0.85
  },
  "new_filename": "FDA_RegulatoryGuidance_2024_RegulatoryGuidance.pdf",
  "sanitization": {
    "sanitized": false,
    "pii_detected": [],
    "risk_level": "none"
  },
  "copyright_check": {
    "has_copyright_risk": false,
    "risk_level": "none",
    "requires_approval": false
  },
  "processing_summary": {
    "extraction_confidence": 0.85,
    "sanitized": false,
    "copyright_risk": false,
    "requires_review": false
  }
}
```

### **2. Extract Metadata Only**

```python
POST /api/metadata/extract
{
  "filename": "Nature_Research_Paper_2023.pdf",
  "content": "Paper content..." // Optional
}
```

### **3. Sanitize Content**

```python
POST /api/metadata/sanitize
{
  "content": "Patient email: john@example.com, Phone: 555-1234...",
  "options": {
    "remove_email": true,
    "remove_phone": true,
    "redaction_mode": "mask"
  }
}
```

### **4. Check Copyright**

```python
POST /api/metadata/copyright-check
{
  "content": "Document content...",
  "filename": "document.pdf",
  "metadata": {
    "source_name": "McKinsey"
  },
  "options": {
    "strict_mode": true,
    "check_watermarks": true
  }
}
```

### **5. Generate Filename**

```python
POST /api/metadata/generate-filename
{
  "metadata": {
    "source_name": "FDA",
    "document_type": "Regulatory Guidance",
    "year": 2024,
    "clean_title": "Medical Device Regulations"
  },
  "original_filename": "doc.pdf"
}
```

---

## 📦 Dependencies

### **Python Requirements** (`requirements.txt`)

```txt
# Core FastAPI
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0

# LangChain Ecosystem
langchain==0.1.0
langchain-openai==0.0.5
langchain-community==0.0.10
langgraph==0.0.25

# Database & Vector Store
supabase==2.3.0
pinecone-client==2.2.4
openai==1.0.0

# HTTP & Utilities
httpx==0.25.2
python-dotenv==1.0.0
numpy==1.24.3
```

---

## 🔧 Configuration

### **Environment Variables:**

```bash
# Python ai-engine
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=pcsk-...
PINECONE_INDEX_NAME=vital-knowledge
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=postgresql://...

# API Gateway
AI_ENGINE_URL=http://localhost:8000

# Next.js
API_GATEWAY_URL=http://localhost:3001
```

---

## ✅ Benefits

1. **Language Consistency**: All AI/ML services in Python
2. **Better Performance**: Python's async capabilities for processing
3. **Easier Maintenance**: Centralized services easier to update
4. **Scalability**: Python services can scale independently
5. **Better Testing**: Python services easier to unit test
6. **Compliance**: All compliance services (copyright, sanitization) in one place

---

## 📝 Next Steps

1. ✅ All Python services created
2. ✅ API endpoints added
3. ✅ API Gateway routing configured
4. ⏳ Update Next.js routes to call Python via gateway
5. ⏳ Remove TypeScript implementations
6. ⏳ Test end-to-end flow
7. ⏳ Deploy to production

---

## 🎯 Summary

**All services migrated to Python:**
- ✅ Unified RAG Service (with Pinecone)
- ✅ Smart Metadata Extractor
- ✅ File Renamer
- ✅ Copyright Checker
- ✅ Data Sanitizer
- ✅ Metadata Processing Orchestrator

**All endpoints available via API Gateway:**
- ✅ `/api/rag/query` - RAG retrieval
- ✅ `/api/metadata/process` - Full metadata processing
- ✅ `/api/metadata/extract` - Metadata extraction
- ✅ `/api/metadata/sanitize` - Content sanitization
- ✅ `/api/metadata/copyright-check` - Copyright checking
- ✅ `/api/metadata/generate-filename` - Filename generation

