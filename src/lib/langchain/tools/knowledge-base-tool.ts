import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xazinxsiglqokwfmogyk.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.YourServiceRoleKeyHere'
);

const KnowledgeBaseSchema = z.object({
  query: z.string().describe("Search query for knowledge base"),
  max_results: z.number().min(1).max(20).default(5).describe("Maximum number of results to return"),
  similarity_threshold: z.number().min(0).max(1).default(0.7).describe("Minimum similarity score for results"),
  include_metadata: z.boolean().default(true).describe("Whether to include document metadata"),
  document_types: z.array(z.string()).optional().describe("Filter by specific document types")
});

export const knowledgeBaseTool = new DynamicStructuredTool({
  name: "search_knowledge_base",
  description: "Search internal knowledge base and documents using RAG (Retrieval-Augmented Generation) with vector similarity search",
  schema: KnowledgeBaseSchema,
  func: async ({ query, max_results = 5, similarity_threshold = 0.7, include_metadata = true, document_types }) => {
    try {
      console.log(`🔍 Searching knowledge base for: ${query}`);
      
      // Use existing RAG system for vector search
      const { data: documents, error } = await supabaseAdmin
        .from('documents')
        .select(`
          id,
          title,
          content,
          metadata,
          document_type,
          created_at,
          updated_at,
          embedding
        `)
        .textSearch('content', query, {
          type: 'websearch',
          config: 'english'
        })
        .limit(max_results * 2); // Get more results for filtering
      
      if (error) {
        console.error('❌ Knowledge base search error:', error);
        throw new Error(`Database search failed: ${error.message}`);
      }
      
      if (!documents || documents.length === 0) {
        return JSON.stringify({
          query,
          total_results: 0,
          results: [],
          search_metadata: {
            searched_at: new Date().toISOString(),
            similarity_threshold,
            max_results_applied: max_results,
            message: "No documents found matching the query"
          }
        });
      }
      
      // Filter by document types if specified
      let filteredDocuments = documents;
      if (document_types && document_types.length > 0) {
        filteredDocuments = documents.filter(doc => 
          document_types.includes(doc.document_type || 'unknown')
        );
      }
      
      // Calculate similarity scores (simplified - in production, use proper vector similarity)
      const scoredDocuments = filteredDocuments.map(doc => {
        const content = doc.content || '';
        const title = doc.title || '';
        
        // Simple text similarity calculation
        const queryLower = query.toLowerCase();
        const contentLower = content.toLowerCase();
        const titleLower = title.toLowerCase();
        
        let similarity = 0;
        
        // Title match gets higher weight
        if (titleLower.includes(queryLower)) {
          similarity += 0.4;
        }
        
        // Content match
        const contentWords = contentLower.split(/\s+/);
        const queryWords = queryLower.split(/\s+/);
        const matchingWords = queryWords.filter(word => 
          contentWords.some(contentWord => contentWord.includes(word))
        );
        similarity += (matchingWords.length / queryWords.length) * 0.6;
        
        return {
          ...doc,
          similarity_score: Math.min(similarity, 1.0)
        };
      });
      
      // Filter by similarity threshold and sort by score
      const relevantDocuments = scoredDocuments
        .filter(doc => doc.similarity_score >= similarity_threshold)
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, max_results);
      
      // Format results
      const results = relevantDocuments.map(doc => {
        const result: any = {
          id: doc.id,
          title: doc.title,
          content: doc.content,
          similarity_score: doc.similarity_score,
          document_type: doc.document_type,
          created_at: doc.created_at,
          updated_at: doc.updated_at
        };
        
        if (include_metadata && doc.metadata) {
          result.metadata = doc.metadata;
        }
        
        // Extract relevant snippets
        const content = doc.content || '';
        const queryWords = query.toLowerCase().split(/\s+/);
        const sentences = content.split(/[.!?]+/);
        
        const relevantSentences = sentences
          .filter(sentence => 
            queryWords.some(word => sentence.toLowerCase().includes(word))
          )
          .slice(0, 3); // Get top 3 relevant sentences
        
        if (relevantSentences.length > 0) {
          result.snippets = relevantSentences.map(s => s.trim());
        }
        
        return result;
      });
      
      const response = {
        query,
        total_results: results.length,
        results,
        search_metadata: {
          searched_at: new Date().toISOString(),
          similarity_threshold,
          max_results_applied: max_results,
          document_types_filter: document_types || null,
          include_metadata,
          total_documents_searched: documents.length
        }
      };
      
      console.log(`✅ Found ${results.length} knowledge base results`);
      return JSON.stringify(response, null, 2);
      
    } catch (error) {
      console.error('❌ Knowledge base search failed:', error);
      return JSON.stringify({
        error: "Failed to search knowledge base",
        message: error instanceof Error ? error.message : "Unknown error",
        query
      });
    }
  }
});

export default knowledgeBaseTool;
