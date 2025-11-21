# Python Services Integration Guide ✅

## 🎯 Overview

All Python backend services have been integrated with the Next.js frontend via the API Gateway. This guide documents the integration points and how to use them.

---

## 📦 Integration Points

### **1. Document Upload Flow**

**Location:** `apps/digital-health-startup/src/features/chat/services/langchain-service.ts`

**Changes:**
- ✅ Now calls Python services via API Gateway for:
  - Metadata extraction (`/api/metadata/process`)
  - Copyright checking (`/api/metadata/copyright-check`)
  - Data sanitization (`/api/metadata/sanitize`)
- ✅ Falls back to TypeScript services if Python services unavailable
- ✅ Unified processing endpoint (`/api/metadata/process`) processes all at once

**Code Example:**
```typescript
import { pythonServicesClient } from '@/lib/services/python-services/python-services-client';

// Process file with all Python services
const processingResult = await pythonServicesClient.processFileMetadata(
  file.name,
  content,
  {
    extract_from_content: true,
    sanitize: true,
    check_copyright: true,
    remove_pii: true,
    remove_phi: true,
  }
);
```

---

### **2. RAG Queries**

**Location:** `apps/digital-health-startup/src/lib/services/python-services/python-services-client.ts`

**Available Methods:**
- `queryRAG()` - Query RAG service with multiple strategies

**Routes:**
- Next.js → API Gateway (`/api/rag/query`) → Python AI Engine (`/api/rag/query`)

**Code Example:**
```typescript
import { pythonServicesClient } from '@/lib/services/python-services/python-services-client';

const result = await pythonServicesClient.queryRAG(
  query,
  {
    strategy: 'hybrid',
    domain_ids: ['regulatory_affairs'],
    max_results: 10,
    similarity_threshold: 0.7,
  }
);
```

---

### **3. Python Services Client**

**Location:** `apps/digital-health-startup/src/lib/services/python-services/python-services-client.ts`

**Available Methods:**

#### **Metadata Processing**
- `processFileMetadata()` - Process file with all services (recommended)
- `extractMetadata()` - Extract metadata only
- `sanitizeContent()` - Sanitize content only
- `checkCopyright()` - Check copyright only
- `generateFilename()` - Generate filename only

#### **RAG Queries**
- `queryRAG()` - Unified RAG query

---

## 🔧 Configuration

### **Environment Variables**

Add to `.env.local` or `.env`:

```bash
# API Gateway URL (for Python services)
API_GATEWAY_URL=http://localhost:3001
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3001

# Python AI Engine URL (used by API Gateway)
AI_ENGINE_URL=http://localhost:8000
```

### **Environment Validation**

Updated `apps/digital-health-startup/src/lib/env/validate.ts`:
- ✅ Added `API_GATEWAY_URL` (optional)
- ✅ Added `NEXT_PUBLIC_API_GATEWAY_URL` (optional)

---

## 🔄 Request Flow

### **Document Upload:**

```
User Uploads File
    ↓
Next.js Route: /api/knowledge/upload
    ↓
LangChain Service: langchain-service.ts
    ↓
Python Services Client: python-services-client.ts
    ↓
API Gateway: http://localhost:3001/api/metadata/process
    ↓
Python AI Engine: http://localhost:8000/api/metadata/process
    ↓
Returns: { metadata, sanitization, copyright_check }
```

### **RAG Query:**

```
User Query
    ↓
Frontend Component
    ↓
Python Services Client: python-services-client.ts
    ↓
API Gateway: http://localhost:3001/api/rag/query
    ↓
Python AI Engine: http://localhost:8000/api/rag/query
    ↓
Returns: { sources, context, metadata }
```

---

## ⚠️ Fallback Behavior

The integration includes **automatic fallback** to TypeScript services if Python services are unavailable:

```typescript
try {
  // Try Python services first
  const result = await pythonServicesClient.processFileMetadata(...);
} catch (error) {
  // Fallback to TypeScript services
  const result = await metadataExtractionService.processFile(...);
}
```

This ensures:
- ✅ **Zero downtime** if Python services are down
- ✅ **Gradual migration** - can test Python services while TypeScript still works
- ✅ **Development flexibility** - can develop without Python services running

---

## 📋 Service Endpoints

### **Python AI Engine** (`http://localhost:8000`)

#### **Metadata Services:**
- `POST /api/metadata/process` - Full processing
- `POST /api/metadata/extract` - Metadata extraction
- `POST /api/metadata/sanitize` - Content sanitization
- `POST /api/metadata/copyright-check` - Copyright checking
- `POST /api/metadata/generate-filename` - Filename generation

#### **RAG Services:**
- `POST /api/rag/query` - Unified RAG query

### **API Gateway** (`http://localhost:3001`)

All Python endpoints are proxied through the API Gateway:
- `POST /api/metadata/*` → Python AI Engine
- `POST /api/rag/query` → Python AI Engine

---

## ✅ Integration Checklist

- [x] Python Services Client created
- [x] Document upload flow updated to use Python services
- [x] Fallback to TypeScript services implemented
- [x] Environment variables added
- [x] API Gateway routing configured
- [x] RAG query integration ready
- [ ] Frontend components updated (if needed)
- [ ] End-to-end testing completed
- [ ] Production deployment

---

## 🚀 Usage Examples

### **1. Process Document Upload**

```typescript
import { pythonServicesClient } from '@/lib/services/python-services/python-services-client';

const result = await pythonServicesClient.processFileMetadata(
  'FDA_Regulatory_Guidance_2024.pdf',
  content,
  {
    extract_from_content: true,
    sanitize: true,
    check_copyright: true,
    remove_pii: true,
    remove_phi: true,
  }
);

// Use results
const metadata = result.metadata;
const sanitizedContent = result.sanitization?.sanitized_content || content;
const copyrightRisk = result.copyright_check?.has_copyright_risk;
```

### **2. Query RAG**

```typescript
import { pythonServicesClient } from '@/lib/services/python-services/python-services-client';

const result = await pythonServicesClient.queryRAG(
  'What are the FDA requirements for clinical trials?',
  {
    strategy: 'hybrid',
    domain_ids: ['regulatory_affairs'],
    max_results: 10,
  }
);

// Use results
const sources = result.sources;
const context = result.context;
```

### **3. Extract Metadata Only**

```typescript
const metadata = await pythonServicesClient.extractMetadata(
  'FDA_Regulatory_Guidance_2024.pdf',
  content
);
```

### **4. Sanitize Content Only**

```typescript
const sanitized = await pythonServicesClient.sanitizeContent(
  content,
  {
    remove_pii: true,
    remove_phi: true,
    redaction_mode: 'mask',
  }
);
```

---

## 🔍 Testing

### **Test Python Services:**

```bash
# Start Python AI Engine
cd services/ai-engine/src
python -m uvicorn main:app --reload --port 8000

# Start API Gateway
cd services/api-gateway/src
npm start

# Test metadata processing
curl -X POST http://localhost:3001/api/metadata/process \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test.pdf",
    "content": "Test content with email@example.com",
    "options": {
      "sanitize": true,
      "check_copyright": true
    }
  }'
```

---

## 📚 References

- **Python Services:** `docs/PYTHON_SERVICES_MIGRATION.md`
- **RAG Migration:** `docs/RAG_PYTHON_MIGRATION.md`
- **HuggingFace Embeddings:** `docs/HUGGINGFACE_EMBEDDINGS_PYTHON.md`

---

**All Python services are now integrated!** 🎉

