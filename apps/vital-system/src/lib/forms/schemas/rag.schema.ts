/**
 * RAG Knowledge Base Schema
 *
 * Zod validation schema for RAG (Retrieval-Augmented Generation) knowledge bases.
 * Includes organizational context, therapeutic areas, lifecycle management, and agent assignments.
 */
import { z } from 'zod';
import {
  uuidSchema,
  nameSchema,
  displayNameSchema,
  descriptionSchema,
  statusSchema,
  organizationContextSchema,
  agentAssociationSchema,
  metadataSchema,
  tagsSchema,
} from './common.schema';

// =============================================================================
// RAG Type Options
// =============================================================================

export const RAG_TYPE_OPTIONS = ['global', 'agent-specific', 'tenant'] as const;
export type RagType = typeof RAG_TYPE_OPTIONS[number];

export const EMBEDDING_MODEL_OPTIONS = [
  'text-embedding-ada-002',
  'text-embedding-3-small',
  'text-embedding-3-large',
  'voyage-large-2',
  'voyage-code-2',
] as const;
export type EmbeddingModel = typeof EMBEDDING_MODEL_OPTIONS[number];

export const ACCESS_LEVEL_OPTIONS = ['public', 'organization', 'private', 'confidential'] as const;
export type AccessLevel = typeof ACCESS_LEVEL_OPTIONS[number];

export const LIFECYCLE_STATUS_OPTIONS = ['draft', 'active', 'review', 'deprecated', 'archived'] as const;
export type LifecycleStatus = typeof LIFECYCLE_STATUS_OPTIONS[number];

// =============================================================================
// Sub-Schemas
// =============================================================================

/** Embedding configuration */
const embeddingConfigSchema = z.object({
  model: z.enum(EMBEDDING_MODEL_OPTIONS).default('text-embedding-ada-002'),
  chunk_size: z.number().min(100).max(4000).default(1000),
  chunk_overlap: z.number().min(0).max(1000).default(200),
  similarity_threshold: z.number().min(0).max(1).default(0.7),
});

/** Compliance and security settings */
const complianceSettingsSchema = z.object({
  hipaa_compliant: z.boolean().default(true),
  contains_phi: z.boolean().default(false),
  requires_audit_trail: z.boolean().default(false),
  data_classification: z.enum(['public', 'internal', 'confidential', 'restricted']).default('internal'),
});

/** Agent assignment with priority */
const agentAssignmentSchema = z.object({
  agent_id: z.string().uuid(),
  agent_name: z.string().optional(),
  priority: z.number().min(0).max(100).default(50),
  is_primary: z.boolean().default(false),
});

/** Document statistics (read-only, computed) */
const documentStatsSchema = z.object({
  document_count: z.number().default(0),
  total_chunks: z.number().default(0),
  total_tokens: z.number().default(0),
  quality_score: z.number().min(0).max(1).optional(),
  last_indexed_at: z.string().datetime().optional(),
});

// =============================================================================
// Main RAG Schema
// =============================================================================

export const ragSchema = z.object({
  // Identity
  id: uuidSchema,
  name: nameSchema,
  display_name: displayNameSchema,
  slug: z.string().optional(),

  // Description & Purpose
  description: descriptionSchema,
  purpose_description: z.string().max(2000).optional(),

  // Classification
  rag_type: z.enum(RAG_TYPE_OPTIONS).default('global'),
  access_level: z.enum(ACCESS_LEVEL_OPTIONS).default('organization'),
  status: z.enum(LIFECYCLE_STATUS_OPTIONS).default('draft'),

  // Knowledge Domains (multi-select)
  knowledge_domains: z.array(z.string()).default([]),

  // Therapeutic & Disease Areas (for filtering and relevance)
  therapeutic_areas: z.array(z.string()).default([]),
  disease_areas: z.array(z.string()).default([]),

  // Drug Lifecycle Phase (optional)
  lifecycle_phase: z.string().optional(),

  // Organizational Context (Function → Department → Role)
  function_id: uuidSchema,
  function_name: z.string().optional(),
  department_id: uuidSchema,
  department_name: z.string().optional(),
  role_id: uuidSchema,
  role_name: z.string().optional(),

  // Tenant (for multi-tenant support)
  tenant_id: uuidSchema,
  tenant_name: z.string().optional(),

  // Embedding Configuration
  embedding_config: embeddingConfigSchema.default({
    model: 'text-embedding-ada-002',
    chunk_size: 1000,
    chunk_overlap: 200,
    similarity_threshold: 0.7,
  }),

  // Pinecone/Vector DB Configuration
  pinecone_namespace: z.string().optional(),
  pinecone_index: z.string().optional(),

  // Compliance & Security
  compliance: complianceSettingsSchema.default({
    hipaa_compliant: true,
    contains_phi: false,
    requires_audit_trail: false,
    data_classification: 'internal',
  }),

  // Agent Assignments (which agents can access this RAG)
  assigned_agents: z.array(agentAssignmentSchema).default([]),

  // Document Stats (read-only)
  stats: documentStatsSchema.optional(),

  // Tags for discovery
  tags: tagsSchema,

  // Flags
  is_active: z.boolean().default(true),
  is_public: z.boolean().default(false),
  auto_index: z.boolean().default(true),

  // Version control
  version: z.string().default('1.0'),

  // Metadata for extensibility
  metadata: metadataSchema,

  // Timestamps
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
});

// =============================================================================
// Type Exports
// =============================================================================

export type Rag = z.infer<typeof ragSchema>;
export type RagEmbeddingConfig = z.infer<typeof embeddingConfigSchema>;
export type RagComplianceSettings = z.infer<typeof complianceSettingsSchema>;
export type RagAgentAssignment = z.infer<typeof agentAssignmentSchema>;
export type RagDocumentStats = z.infer<typeof documentStatsSchema>;

// =============================================================================
// Partial Schema for Updates
// =============================================================================

export const ragUpdateSchema = ragSchema.partial().extend({
  id: z.string().uuid(), // ID is required for updates
});

export type RagUpdate = z.infer<typeof ragUpdateSchema>;

// =============================================================================
// Create Schema (excludes computed fields)
// =============================================================================

export const ragCreateSchema = ragSchema.omit({
  id: true,
  stats: true,
  created_at: true,
  updated_at: true,
  created_by: true,
  updated_by: true,
});

export type RagCreate = z.infer<typeof ragCreateSchema>;
