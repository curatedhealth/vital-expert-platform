/**
 * RAG Component Type Definitions
 * 
 * Unified type definitions for RAG knowledge base components.
 * These types represent the UI/data model used by RAG management components.
 */

/**
 * RAG Knowledge Base - represents a knowledge base used for RAG
 * This is the primary type used across all RAG management components
 */
export interface RagKnowledgeBase {
  id: string;
  name?: string; // Optional internal name/slug
  display_name: string; // User-facing name
  description: string; // General description
  purpose_description: string; // When/how to use this RAG
  rag_type: 'global' | 'agent_specific'; // Type of RAG
  knowledge_domains: string[]; // Array of domain tags
  document_count: number; // Number of documents indexed
  total_chunks?: number; // Total chunks/embeddings
  quality_score?: number; // Quality score (0-1)
  is_assigned?: boolean; // Whether assigned to an agent
  assignment_priority?: number; // Priority level (1-100)
  usage_context?: string; // Context for when to use
  custom_prompt_instructions?: string; // Custom instructions
  is_primary?: boolean; // Whether this is the primary RAG
  last_used_at?: string; // ISO date string
}

/**
 * Agent RAG Assignment - represents an assignment of RAG to an agent
 */
export interface AgentRagAssignment {
  id: string;
  name: string;
  display_name: string;
  description: string;
  purpose_description: string;
  rag_type: 'global' | 'agent_specific';
  knowledge_domains: string[];
  document_count: number;
  is_assigned?: boolean;
  assignment_priority?: number;
  usage_context?: string;
  is_primary?: boolean;
  last_used_at?: string;
  custom_prompt_instructions?: string;
}

/**
 * Type guard to check if an object is a RagKnowledgeBase
 */
export function isRagKnowledgeBase(obj: unknown): obj is RagKnowledgeBase {
  if (typeof obj !== 'object' || obj === null) return false;
  const rag = obj as Record<string, unknown>;
  return (
    typeof rag.id === 'string' &&
    typeof rag.display_name === 'string' &&
    typeof rag.description === 'string' &&
    typeof rag.purpose_description === 'string' &&
    (rag.rag_type === 'global' || rag.rag_type === 'agent_specific') &&
    Array.isArray(rag.knowledge_domains) &&
    typeof rag.document_count === 'number'
  );
}

/**
 * Convert KnowledgeSource (database type) to RagKnowledgeBase (UI type)
 * This is a helper for when we need to adapt database types to UI types
 */
export function adaptKnowledgeSourceToRag(
  source: { id: string; title: string; [key: string]: unknown }
): Partial<RagKnowledgeBase> {
  return {
    id: source.id,
    display_name: source.title,
    description: typeof source.description === 'string' ? source.description : '',
    purpose_description: typeof source.purpose_description === 'string' ? source.purpose_description : '',
    rag_type: typeof source.rag_type === 'string' && (source.rag_type === 'global' || source.rag_type === 'agent_specific')
      ? source.rag_type
      : 'global',
    knowledge_domains: Array.isArray(source.knowledge_domains) ? source.knowledge_domains as string[] : [],
    document_count: typeof source.document_count === 'number' ? source.document_count : 0,
  };
}
