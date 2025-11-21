# Comprehensive Database Table Fix Summary

## Issue Found
The application code is trying to use tables that don't exist after the RAG schema migration:
- Code expects: `knowledge_sources` and `document_chunks`
- Database has: `rag_knowledge_sources` and `rag_knowledge_chunks`

## Column Mapping Required

### knowledge_sources → rag_knowledge_sources
- `knowledge_source_id` → `id` (FK reference)
- `is_public` → NOT EXIST (remove, use tenant-based access)
- `access_level` → NOT EXIST (remove)
- `category` → NOT EXIST (remove)
- `authors` → NOT EXIST (remove)
- `publication_date` → NOT EXIST (remove)
- Keep: name, title, description, file_path, file_size, mime_type, content_hash, domain, processing_status, processed_at, tags

### document_chunks → rag_knowledge_chunks
- `knowledge_source_id` → `source_id`
- `embedding_openai` → `embedding`
- `content_length` → `word_count` (or calculate)
- `keywords` → store in `medical_context` JSONB
- `chunk_quality_score` → `quality_score`

## Files That Need Updates
1. `/src/features/chat/services/langchain-service.ts` - Multiple table references
2. `/src/app/api/knowledge/documents/route.ts` - Fixed ✅
3. `/database/sql/migrations/2025/20250930000000_create_match_documents_function.sql` - Fixed ✅
4. `/supabase/migrations/20250930000001_fix_match_documents_table.sql` - Created, needs apply

## Next Steps
1. Apply match_documents function fix
2. Update LangChain service to use rag_ tables with correct columns
3. Test upload
4. Verify embeddings