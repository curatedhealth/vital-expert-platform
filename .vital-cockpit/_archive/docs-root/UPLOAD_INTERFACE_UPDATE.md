# Knowledge Upload Interface - Updated for New RAG Domain Architecture

## ✅ Changes Completed

The Knowledge Upload interface at `/knowledge/upload` has been updated to work with the new unified RAG domain architecture (`knowledge_domains_new` table).

## 📋 Updated Components

### 1. **Knowledge Uploader Component** (`knowledge-uploader.tsx`)

**Changes:**
- ✅ Now fetches domains from `knowledge_domains_new` table (with fallback to `knowledge_domains`)
- ✅ Updated domain dropdown to use `domain_id` instead of `slug`
- ✅ Maps new architecture fields (`domain_id`, `domain_name`, `access_policy`, `rag_priority_weight`, etc.)
- ✅ Sends new architecture fields in upload request:
  - `domain_id` (new field)
  - `domain` (legacy field for backward compatibility)
  - `access_policy`
  - `rag_priority_weight`
  - `domain_scope`

### 2. **Upload API Route** (`/api/knowledge/upload`)

**Changes:**
- ✅ Accepts `domain_id` field (new architecture)
- ✅ Accepts `domain` field (legacy, for backward compatibility)
- ✅ Accepts new architecture fields: `access_policy`, `rag_priority_weight`, `domain_scope`
- ✅ Passes new fields to LangChain service

### 3. **LangChain RAG Service** (`langchain-service.ts`)

**Changes:**
- ✅ Handles new architecture fields in document processing
- ✅ Passes `domain_id`, `access_policy`, `rag_priority_weight`, `domain_scope` to Unified RAG Service

### 4. **Unified RAG Service** (`unified-rag-service.ts`)

**Changes:**
- ✅ Updated `addDocument()` to use `domain_id` field
- ✅ Automatically inherits missing fields from `knowledge_domains_new` table:
  - `access_policy` (if not provided)
  - `rag_priority_weight` (if not provided)
  - `domain_scope` (if not provided)
- ✅ Inserts documents with new architecture fields:
  - `domain_id` (primary field)
  - `domain` (legacy field for backward compatibility)
  - `access_policy`
  - `rag_priority_weight`
  - `domain_scope`
- ✅ Chunks inherit domain and security settings from parent document
- ✅ Pinecone metadata includes `domain_id` field

## 🔄 Data Flow

### Upload Flow:
1. **User selects domain** from dropdown (fetched from `knowledge_domains_new`)
2. **Domain metadata** is retrieved (includes `access_policy`, `rag_priority_weight`, etc.)
3. **Upload request** includes:
   - `domain_id` (from selected domain)
   - `access_policy` (from domain metadata)
   - `rag_priority_weight` (from domain metadata)
   - `domain_scope` (from domain metadata)
4. **Document inserted** with all new fields
5. **Missing fields inherited** from `knowledge_domains_new` if not provided
6. **Chunks inherit** domain and security settings from parent document
7. **Pinecone synced** with `domain_id` in metadata

## 🎯 Benefits

1. **Backward Compatible**: Still supports legacy `domain` field
2. **Automatic Inheritance**: Missing fields automatically inherited from domain configuration
3. **Security**: Access policies and priority weights applied automatically
4. **Data Consistency**: Chunks inherit settings from documents
5. **Future Ready**: Ready for multi-scope support (global/enterprise/user)

## 📝 Domain Dropdown

The domain dropdown now:
- ✅ Shows domains from `knowledge_domains_new` table
- ✅ Displays `domain_name` as the label
- ✅ Uses `domain_id` as the value
- ✅ Filters by tier (Tier 1: Core, Tier 2: Specialized, Tier 3: Emerging)
- ✅ Falls back to `knowledge_domains` if new table doesn't exist

## 🔐 Security & Access Control

When documents are uploaded:
- ✅ `access_policy` is inherited from domain (e.g., `enterprise_confidential`)
- ✅ `rag_priority_weight` is inherited from domain (0-1 scale)
- ✅ `domain_scope` is inherited from domain (`global`, `enterprise`, `user`)
- ✅ All settings automatically applied to chunks

## ✅ Testing Checklist

- [ ] Upload document with new domain architecture
- [ ] Verify domain dropdown shows domains from `knowledge_domains_new`
- [ ] Verify document is saved with `domain_id` field
- [ ] Verify `access_policy` is inherited from domain
- [ ] Verify `rag_priority_weight` is inherited from domain
- [ ] Verify chunks inherit domain and security settings
- [ ] Verify Pinecone metadata includes `domain_id`

## 🚀 Next Steps

1. Test the upload interface
2. Verify documents are saved correctly
3. Check domain inheritance works
4. Verify chunk security settings are applied

All changes are backward compatible - existing uploads will continue to work!

