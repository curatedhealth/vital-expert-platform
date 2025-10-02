# VITAL Path Database Architecture Analysis Report

## Executive Summary

The VITAL path application is a comprehensive healthcare AI platform with a sophisticated multi-tenant database architecture built on PostgreSQL with Supabase. The system implements advanced healthcare compliance features including HIPAA, FDA 21 CFR Part 11, and clinical validation standards. The database contains 20+ core tables with extensive relationship mapping, vector search capabilities, and comprehensive audit trails.

## Database Technology Stack

- **Primary Database**: PostgreSQL via Supabase
- **Extensions**: UUID-OSSP, pgvector for embeddings
- **ORM/Client**: Supabase JavaScript SDK (@supabase/supabase-js v2.57.4)
- **Vector Database**: pgvector with multiple embedding models
- **Knowledge Base**: RAG (Retrieval-Augmented Generation) implementation
- **Migration System**: Custom SQL-based migration runner

## Complete Database Schema Inventory

### Core Business Tables

#### 1. Organizations (Multi-tenant Foundation)
```sql
TABLE: organizations
PRIMARY KEY: id (UUID)
COLUMNS:
- id: UUID (Primary Key)
- name: TEXT NOT NULL
- slug: TEXT UNIQUE NOT NULL
- subscription_tier: TEXT ('starter', 'professional', 'enterprise')
- subscription_status: TEXT ('active', 'inactive', 'trial', 'cancelled')
- trial_ends_at: TIMESTAMPTZ
- max_projects: INTEGER DEFAULT 3
- max_users: INTEGER DEFAULT 5
- settings: JSONB DEFAULT '{}'
- metadata: JSONB DEFAULT '{}'
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ DEFAULT NOW()

CONSTRAINTS:
- CHECK subscription_tier IN ('starter', 'professional', 'enterprise')
- CHECK subscription_status IN ('active', 'inactive', 'trial', 'cancelled')
- UNIQUE constraint on slug
```

#### 2. Users (Extended Auth)
```sql
TABLE: users / user_profiles
PRIMARY KEY: id (UUID)
FOREIGN KEYS:
- auth.users(id) ON DELETE CASCADE
- organizations(id) ON DELETE CASCADE
COLUMNS:
- id: UUID REFERENCES auth.users(id) PRIMARY KEY
- organization_id: UUID REFERENCES organizations(id)
- email: TEXT UNIQUE NOT NULL
- full_name: TEXT
- role: TEXT ('admin', 'clinician', 'researcher', 'member')
- avatar_url: TEXT
- job_title: VARCHAR(255)
- department: VARCHAR(255)
- preferences: JSONB DEFAULT '{}'
- settings: JSONB DEFAULT '{}'
- last_seen_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ DEFAULT NOW()
```

#### 3. Projects (VITAL Journey Management)
```sql
TABLE: projects
PRIMARY KEY: id (UUID)
FOREIGN KEYS:
- organizations(id) ON DELETE CASCADE
- auth.users(id) created_by
COLUMNS:
- id: UUID PRIMARY KEY
- organization_id: UUID NOT NULL
- name: TEXT NOT NULL
- description: TEXT
- project_type: TEXT CHECK IN ('digital_therapeutic', 'ai_diagnostic', 'clinical_decision_support', 'remote_monitoring', 'telemedicine_platform', 'health_analytics')
- current_phase: TEXT ('vision', 'integrate', 'test', 'activate', 'learn')
- status: VARCHAR(50) ('active', 'paused', 'completed', 'archived')
- target_market: VARCHAR(255)
- regulatory_pathway: VARCHAR(100)
- timeline_start: DATE
- timeline_end: DATE
- budget_allocated: DECIMAL(12,2)
- budget_spent: DECIMAL(12,2) DEFAULT 0
- phase_progress: JSONB DEFAULT '{"vision": 0, "integrate": 0, "test": 0, "activate": 0, "learn": 0}'
- metadata: JSONB DEFAULT '{}'
- created_by: UUID
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ DEFAULT NOW()
```

### AI Agent Architecture

#### 4. Agents (Core AI Framework)
```sql
TABLE: agents / ai_agents
PRIMARY KEY: id (UUID)
FOREIGN KEYS:
- organizations(id)
- auth.users(id) created_by
COLUMNS:
- id: UUID PRIMARY KEY
- organization_id: UUID
- name: VARCHAR(255) NOT NULL UNIQUE
- display_name: VARCHAR(255) NOT NULL UNIQUE
- description: TEXT NOT NULL
- avatar: VARCHAR(255) DEFAULT '🤖'
- color: VARCHAR(50) DEFAULT 'text-trust-blue'
- system_prompt: TEXT NOT NULL
- model: VARCHAR(100) DEFAULT 'gpt-4'
- temperature: DECIMAL(3,2) DEFAULT 0.7
- max_tokens: INTEGER DEFAULT 2000
- capabilities: JSONB DEFAULT '[]'
- specializations: JSONB DEFAULT '[]'
- tools: JSONB DEFAULT '[]'
- tier: INTEGER CHECK (tier >= 1 AND tier <= 5)
- priority: INTEGER DEFAULT 1
- implementation_phase: INTEGER DEFAULT 1
- rag_enabled: BOOLEAN DEFAULT true
- knowledge_domains: JSONB DEFAULT '[]'
- data_sources: JSONB DEFAULT '[]'
- roi_metrics: JSONB DEFAULT '{}'
- use_cases: JSONB DEFAULT '[]'
- target_users: JSONB DEFAULT '[]'
- required_integrations: JSONB DEFAULT '[]'
- security_level: VARCHAR(50) DEFAULT 'standard'
- compliance_requirements: JSONB DEFAULT '[]'
- status: VARCHAR(20) CHECK IN ('active', 'inactive', 'development', 'deprecated')
- is_custom: BOOLEAN DEFAULT false
- is_public: BOOLEAN DEFAULT false
- created_by: UUID
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ DEFAULT NOW()

ENHANCED HEALTHCARE FIELDS:
- medical_specialty: VARCHAR(100)
- clinical_validation_status: VARCHAR(50) CHECK IN ('pending', 'validated', 'expired', 'under_review')
- medical_accuracy_score: DECIMAL(3,2) CHECK (>= 0 AND <= 1)
- citation_accuracy: DECIMAL(3,2) CHECK (>= 0 AND <= 1)
- hallucination_rate: DECIMAL(5,4) CHECK (>= 0 AND <= 1)
- medical_error_rate: DECIMAL(5,4) CHECK (>= 0 AND <= 1)
- fda_samd_class: VARCHAR(10) ('I', 'IIa', 'IIb', 'III')
- hipaa_compliant: BOOLEAN DEFAULT false
- pharma_enabled: BOOLEAN DEFAULT false
- verify_enabled: BOOLEAN DEFAULT false
- last_clinical_review: TIMESTAMPTZ
- medical_reviewer_id: UUID REFERENCES auth.users(id)
- cost_per_query: DECIMAL(10,4) DEFAULT 0.0000
- average_latency_ms: INTEGER DEFAULT 0
- audit_trail: JSONB DEFAULT '{}'
```

#### 5. Capabilities (Medical Capability System)
```sql
TABLE: capabilities
PRIMARY KEY: id (UUID)
COLUMNS:
- id: UUID PRIMARY KEY
- name: VARCHAR(255) NOT NULL UNIQUE
- display_name: VARCHAR(255) NOT NULL
- description: TEXT NOT NULL
- category: VARCHAR(100) DEFAULT 'general'
- domain: VARCHAR(100) DEFAULT 'general'
- icon: VARCHAR(10) DEFAULT '⚡'
- color: VARCHAR(50) DEFAULT 'text-trust-blue'
- complexity_level: VARCHAR(20) CHECK IN ('basic', 'intermediate', 'advanced', 'expert')
- prerequisites: JSONB DEFAULT '[]'
- usage_count: INTEGER DEFAULT 0
- success_rate: DECIMAL(5,2) DEFAULT 0.0
- average_execution_time: INTEGER DEFAULT 0
- is_premium: BOOLEAN DEFAULT false
- requires_training: BOOLEAN DEFAULT false
- requires_api_access: BOOLEAN DEFAULT false
- status: VARCHAR(20) CHECK IN ('active', 'inactive', 'beta', 'deprecated')
- version: VARCHAR(20) DEFAULT '1.0.0'
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ DEFAULT NOW()

HEALTHCARE COMPLIANCE FIELDS:
- medical_domain: VARCHAR(100)
- accuracy_threshold: DECIMAL(3,2) DEFAULT 0.95 CHECK (>= 0 AND <= 1)
- citation_required: BOOLEAN DEFAULT true
- pharma_protocol: JSONB DEFAULT NULL
- verify_protocol: JSONB DEFAULT NULL
- fda_classification: VARCHAR(50)
- hipaa_relevant: BOOLEAN DEFAULT false
- validation_rules: JSONB DEFAULT '{}'
- clinical_validation_status: VARCHAR(50) DEFAULT 'pending'
- last_clinical_review: TIMESTAMPTZ
- system_prompt_template: TEXT
- audit_trail: JSONB DEFAULT '{}'
```

#### 6. Agent-Capability Mapping
```sql
TABLE: agent_capabilities
PRIMARY KEY: id (UUID)
FOREIGN KEYS:
- agents(id) ON DELETE CASCADE
- capabilities(id) ON DELETE CASCADE
COLUMNS:
- id: UUID PRIMARY KEY
- agent_id: UUID NOT NULL
- capability_id: UUID NOT NULL
- proficiency_level: VARCHAR(20) CHECK IN ('basic', 'intermediate', 'advanced', 'expert')
- custom_config: JSONB DEFAULT '{}'
- is_primary: BOOLEAN DEFAULT false
- usage_count: INTEGER DEFAULT 0
- success_rate: DECIMAL(5,2) DEFAULT 0.0
- last_used_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ DEFAULT NOW()

HEALTHCARE ENHANCEMENTS:
- competency_ids: UUID[] DEFAULT '{}'
- medical_validation_required: BOOLEAN DEFAULT true
- clinical_accuracy_threshold: DECIMAL(3,2) DEFAULT 0.95
- pharma_config: JSONB DEFAULT NULL
- verify_config: JSONB DEFAULT NULL
- validated_by: UUID REFERENCES auth.users(id)
- validation_date: TIMESTAMPTZ

CONSTRAINTS:
- UNIQUE(agent_id, capability_id)
```

### Knowledge Management & RAG System

#### 7. Knowledge Sources
```sql
TABLE: knowledge_sources
PRIMARY KEY: id (UUID)
COLUMNS:
- id: UUID PRIMARY KEY
- name: VARCHAR(255) NOT NULL
- source_type: VARCHAR(100) NOT NULL
- source_url: TEXT
- file_path: TEXT
- file_size: BIGINT
- mime_type: VARCHAR(100)
- title: TEXT NOT NULL
- description: TEXT
- authors: TEXT[]
- publication_date: DATE
- last_updated: DATE
- version: VARCHAR(50)
- domain: VARCHAR(100) NOT NULL
- category: VARCHAR(100) NOT NULL
- tags: TEXT[] DEFAULT '{}'
- content_hash: VARCHAR(64) UNIQUE
- processing_status: VARCHAR(50) DEFAULT 'pending'
- processed_at: TIMESTAMPTZ
- confidence_score: DECIMAL(3,2) DEFAULT 1.0
- relevance_score: DECIMAL(3,2) DEFAULT 1.0
- is_public: BOOLEAN DEFAULT true
- access_level: VARCHAR(50) DEFAULT 'public'
- restricted_to_agents: UUID[] DEFAULT '{}'
- status: VARCHAR(20) CHECK IN ('active', 'inactive', 'archived', 'deprecated')
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ DEFAULT NOW()
```

#### 8. Document Chunks (Vector Storage)
```sql
TABLE: document_chunks
PRIMARY KEY: id (UUID)
FOREIGN KEYS:
- knowledge_sources(id) ON DELETE CASCADE
COLUMNS:
- id: UUID PRIMARY KEY
- knowledge_source_id: UUID NOT NULL
- content: TEXT NOT NULL
- content_length: INTEGER NOT NULL
- chunk_index: INTEGER NOT NULL
- section_title: TEXT
- page_number: INTEGER
- table_data: JSONB
- figure_captions: TEXT[]

EMBEDDINGS (Multiple Models):
- embedding_openai: vector(1536)     -- text-embedding-ada-002
- embedding_clinical: vector(768)    -- ClinicalBERT/PubMedBERT
- embedding_legal: vector(768)       -- Legal-BERT
- embedding_scientific: vector(768)  -- SciBERT

METADATA:
- embedding_model_versions: JSONB DEFAULT '{}'
- embedding_created_at: TIMESTAMPTZ DEFAULT NOW()
- keywords: TEXT[] DEFAULT '{}'
- entities: JSONB DEFAULT '{}'
- sentiment_score: DECIMAL(3,2)
- chunk_quality_score: DECIMAL(3,2) DEFAULT 1.0
- retrieval_count: INTEGER DEFAULT 0
- feedback_score: DECIMAL(3,2)
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ DEFAULT NOW()

CONSTRAINTS:
- UNIQUE(knowledge_source_id, chunk_index)

VECTOR INDEXES:
- ivfflat (embedding_openai vector_cosine_ops) WITH (lists = 100)
- ivfflat (embedding_clinical vector_cosine_ops) WITH (lists = 100)
- ivfflat (embedding_legal vector_cosine_ops) WITH (lists = 100)
- ivfflat (embedding_scientific vector_cosine_ops) WITH (lists = 100)
```

#### 9. Knowledge Domains
```sql
TABLE: knowledge_domains
PRIMARY KEY: id (UUID)
COLUMNS:
- id: UUID PRIMARY KEY
- name: VARCHAR(100) NOT NULL UNIQUE
- display_name: VARCHAR(255) NOT NULL
- description: TEXT
- preferred_embedding_model: VARCHAR(100) NOT NULL
- retrieval_strategy: VARCHAR(50) DEFAULT 'semantic'
- total_sources: INTEGER DEFAULT 0
- total_chunks: INTEGER DEFAULT 0
- total_size_mb: DECIMAL(10,2) DEFAULT 0.0
- last_updated: TIMESTAMPTZ
- average_quality_score: DECIMAL(3,2) DEFAULT 0.0
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ DEFAULT NOW()

PREDEFINED DOMAINS:
- regulatory-affairs
- clinical-research
- market-access
- medical-communications
- digital-health
- quality-assurance
- business-intelligence
- research
```

### Healthcare Compliance & Validation

#### 10. Competencies (Medical Sub-capabilities)
```sql
TABLE: competencies
PRIMARY KEY: id (UUID)
FOREIGN KEYS:
- capabilities(id) ON DELETE CASCADE
COLUMNS:
- id: UUID PRIMARY KEY
- capability_id: UUID NOT NULL
- name: VARCHAR(255) NOT NULL
- description: TEXT
- prompt_snippet: TEXT
- medical_accuracy_requirement: DECIMAL(3,2) DEFAULT 0.95
- evidence_level: VARCHAR(50)
- clinical_guidelines_reference: TEXT[]
- required_knowledge: JSONB DEFAULT '{}'
- quality_metrics: JSONB DEFAULT '{}'
- icd_codes: TEXT[]
- snomed_codes: TEXT[]
- order_priority: INTEGER DEFAULT 0
- is_required: BOOLEAN DEFAULT false
- requires_medical_review: BOOLEAN DEFAULT false
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ DEFAULT NOW()
- audit_log: JSONB DEFAULT '{}'
```

#### 11. Medical Validations
```sql
TABLE: medical_validations
PRIMARY KEY: id (UUID)
FOREIGN KEYS:
- auth.users(id) validator_id
COLUMNS:
- id: UUID PRIMARY KEY
- entity_type: VARCHAR(50) NOT NULL ('agent', 'capability', 'competency')
- entity_id: UUID NOT NULL
- validation_type: VARCHAR(50)
- validation_result: JSONB DEFAULT '{}'
- accuracy_score: DECIMAL(3,2)
- validator_id: UUID
- validator_credentials: TEXT
- validation_date: TIMESTAMPTZ DEFAULT NOW()
- expiration_date: TIMESTAMPTZ
- notes: TEXT
- audit_trail: JSONB DEFAULT '{}'
```

#### 12. System Prompts (FDA 21 CFR Part 11 Compliant)
```sql
TABLE: system_prompts
PRIMARY KEY: id (UUID)
FOREIGN KEYS:
- agents(id) ON DELETE CASCADE
- auth.users(id) generated_by
- auth.users(id) approved_by
COLUMNS:
- id: UUID PRIMARY KEY
- agent_id: UUID NOT NULL
- generated_prompt: TEXT NOT NULL
- capability_contributions: JSONB DEFAULT '{}'
- tool_configurations: JSONB DEFAULT '{}'
- pharma_protocol_included: BOOLEAN DEFAULT true
- verify_protocol_included: BOOLEAN DEFAULT true
- medical_disclaimers: TEXT[] DEFAULT '{}'
- version: INTEGER DEFAULT 1
- clinical_validation_status: VARCHAR(50) DEFAULT 'pending'
- is_active: BOOLEAN DEFAULT true
- generated_at: TIMESTAMPTZ DEFAULT NOW()
- generated_by: UUID
- approved_by: UUID
- approval_date: TIMESTAMPTZ
- audit_log: JSONB DEFAULT '{}'
```

#### 13. PHI Access Log (HIPAA Compliance)
```sql
TABLE: phi_access_log
PRIMARY KEY: id (UUID)
FOREIGN KEYS:
- agents(id)
- auth.users(id) user_id
COLUMNS:
- id: UUID PRIMARY KEY
- agent_id: UUID
- user_id: UUID
- access_type: VARCHAR(50) ('read', 'write', 'process')
- data_classification: VARCHAR(50) ('PHI', 'De-identified')
- purpose: TEXT
- patient_id_hash: VARCHAR(255)
- timestamp: TIMESTAMPTZ DEFAULT NOW()
- ip_address: INET
- session_id: UUID
- audit_metadata: JSONB DEFAULT '{}'
```

### Chat & Communication System

#### 14. Chat Conversations
```sql
TABLE: chat_conversations
PRIMARY KEY: id (UUID)
FOREIGN KEYS:
- organizations(id)
- projects(id)
- auth.users(id) user_id
- ai_agents(id) agent_id
COLUMNS:
- id: UUID PRIMARY KEY
- organization_id: UUID
- project_id: UUID
- user_id: UUID NOT NULL
- agent_id: UUID
- title: VARCHAR(500)
- message_count: INTEGER DEFAULT 0
- last_message: TEXT
- metadata: JSONB DEFAULT '{}'
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ DEFAULT NOW()
```

#### 15. Chat Messages
```sql
TABLE: chat_messages
PRIMARY KEY: id (UUID)
FOREIGN KEYS:
- chat_conversations(id) ON DELETE CASCADE
- auth.users(id) user_id
- ai_agents(id) agent_id
COLUMNS:
- id: UUID PRIMARY KEY
- conversation_id: UUID NOT NULL
- user_id: UUID
- agent_id: UUID
- content: TEXT NOT NULL
- role: VARCHAR(20) CHECK IN ('user', 'assistant', 'system')
- attachments: JSONB DEFAULT '[]'
- metadata: JSONB DEFAULT '{}'
- is_loading: BOOLEAN DEFAULT false
- has_error: BOOLEAN DEFAULT false
- created_at: TIMESTAMPTZ DEFAULT NOW()
```

### Workflow & Process Management

#### 16. Workflow Templates
```sql
TABLE: workflow_templates
PRIMARY KEY: id (UUID)
FOREIGN KEYS:
- auth.users(id) created_by
COLUMNS:
- id: UUID PRIMARY KEY
- name: TEXT NOT NULL
- description: TEXT
- category: TEXT CHECK IN ('Regulatory', 'Clinical', 'Market Access', 'Medical Affairs', 'Custom')
- industry_tags: TEXT[] DEFAULT '{}'
- complexity_level: TEXT CHECK IN ('Low', 'Medium', 'High')
- estimated_duration: INTEGER
- template_data: JSONB NOT NULL
- usage_count: INTEGER DEFAULT 0
- rating: DECIMAL(3,2) CHECK (>= 0 AND <= 5)
- created_by: UUID
- is_public: BOOLEAN DEFAULT false
- version: TEXT DEFAULT '1.0'
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ DEFAULT NOW()
```

#### 17. JTBD Process Steps (Enhanced)
```sql
TABLE: jtbd_process_steps
PRIMARY KEY: id (UUID)
COLUMNS:
- id: UUID PRIMARY KEY
- [existing columns]
- conditional_next: JSONB
- parallel_steps: TEXT[]
- required_capabilities: TEXT[]
- agent_selection_strategy: JSONB
- validation_rules: JSONB
- retry_config: JSONB
- timeout_config: JSONB
- position: JSONB  -- For visual positioning
```

### Supporting Tables

#### 18. Icons Management
```sql
TABLE: icons
PRIMARY KEY: id (UUID)
COLUMNS:
- id: UUID PRIMARY KEY
- name: VARCHAR(255) NOT NULL UNIQUE
- display_name: VARCHAR(255) NOT NULL
- category: VARCHAR(50) CHECK IN ('avatar', 'prompt', 'process', 'medical', 'regulatory', 'general')
- subcategory: VARCHAR(100)
- description: TEXT
- file_path: TEXT NOT NULL
- file_url: TEXT NOT NULL
- svg_content: TEXT
- tags: TEXT[]
- is_active: BOOLEAN DEFAULT true
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ DEFAULT NOW()
```

#### 19. Business Functions & Roles
```sql
TABLE: business_functions
PRIMARY KEY: id (UUID)
COLUMNS:
- id: UUID PRIMARY KEY
- name: VARCHAR(255) NOT NULL UNIQUE
- department: VARCHAR(100)
- healthcare_category: VARCHAR(100)
- description: TEXT
- regulatory_requirements: TEXT[]
- created_at: TIMESTAMPTZ DEFAULT NOW()

TABLE: roles
PRIMARY KEY: id (UUID)
COLUMNS:
- id: UUID PRIMARY KEY
- name: VARCHAR(255) NOT NULL UNIQUE
- clinical_title: VARCHAR(100)
- seniority_level: VARCHAR(50)
- department: VARCHAR(100)
- requires_medical_license: BOOLEAN DEFAULT false
- default_capabilities: JSONB DEFAULT '[]'
- compliance_requirements: TEXT[]
- created_at: TIMESTAMPTZ DEFAULT NOW()
```

#### 20. Tools Registry
```sql
TABLE: tools
PRIMARY KEY: id (UUID)
COLUMNS:
- id: UUID PRIMARY KEY
- name: VARCHAR(255) NOT NULL UNIQUE
- tool_type: VARCHAR(100)
- api_endpoint: TEXT
- configuration: JSONB DEFAULT '{}'
- medical_database: VARCHAR(100)
- data_classification: VARCHAR(50)
- hipaa_compliant: BOOLEAN DEFAULT false
- required_permissions: JSONB DEFAULT '{}'
- rate_limits: JSONB DEFAULT '{}'
- validation_endpoint: TEXT
- is_active: BOOLEAN DEFAULT true
- last_validation_check: TIMESTAMPTZ
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ DEFAULT NOW()
```

## Relationship Mapping

### Primary Relationships

1. **Multi-tenant Hierarchy**:
   - `organizations` → `users` (1:N)
   - `organizations` → `projects` (1:N)
   - `organizations` → `chat_conversations` (1:N)
   - `organizations` → `documents/knowledge_sources` (1:N)

2. **Agent System**:
   - `agents` → `agent_capabilities` → `capabilities` (M:N)
   - `capabilities` → `competencies` (1:N)
   - `capabilities` → `capability_tools` → `tools` (M:N)

3. **Knowledge & RAG**:
   - `knowledge_sources` → `document_chunks` (1:N)
   - `knowledge_domains` → `knowledge_sources` (1:N via domain field)
   - `agents` → `agent_knowledge_access` → `knowledge_sources` (M:N)

4. **Chat System**:
   - `users` → `chat_conversations` (1:N)
   - `agents` → `chat_conversations` (1:N)
   - `chat_conversations` → `chat_messages` (1:N)

5. **Compliance & Validation**:
   - `agents/capabilities/competencies` → `medical_validations` (1:N polymorphic)
   - `agents` → `system_prompts` (1:N)
   - `agents/users` → `phi_access_log` (1:N)

### Foreign Key Constraints

All tables implement proper cascading rules:
- `ON DELETE CASCADE` for mandatory dependencies
- `ON DELETE SET NULL` for optional references
- `REFERENCES auth.users(id)` for user relationships

## Data Types and Constraints

### Custom Data Types
- **UUIDs**: Primary keys using `uuid_generate_v4()`
- **JSONB**: Flexible metadata storage with GIN indexes
- **TEXT[]**: Array fields for tags, capabilities, etc.
- **VECTOR**: Multiple embedding types (1536, 768 dimensions)
- **DECIMAL**: Precision scoring (accuracy, confidence, etc.)
- **CHECK Constraints**: Enumerated values for status fields

### Validation Rules
- Medical accuracy scores: DECIMAL(3,2) CHECK (>= 0 AND <= 1)
- Agent tiers: INTEGER CHECK (tier >= 1 AND tier <= 5)
- Status enumerations with strict CHECK constraints
- UNIQUE constraints on business keys (names, emails, slugs)

## Performance Optimization

### Indexing Strategy

#### Performance Indexes
```sql
-- Multi-tenant isolation
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_projects_organization ON projects(organization_id);
CREATE INDEX idx_documents_organization ON documents(organization_id);

-- Query performance
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_queries_created_at ON queries(created_at DESC);

-- Agent performance
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_tier ON agents(tier);
CREATE INDEX idx_capabilities_medical_domain ON capabilities(medical_domain);

-- Vector search optimization
CREATE INDEX document_chunks_embedding_openai_idx ON document_chunks
  USING ivfflat (embedding_openai vector_cosine_ops) WITH (lists = 100);
```

#### GIN Indexes for JSONB
```sql
CREATE INDEX idx_audit_trail_agents ON agents USING GIN(audit_trail);
CREATE INDEX idx_knowledge_sources_tags ON knowledge_sources USING GIN(tags);
CREATE INDEX idx_document_chunks_entities ON document_chunks USING GIN(entities);
```

## Row Level Security (RLS) Implementation

### Multi-tenant Security
Every table implements RLS with organization-based isolation:

```sql
-- Example: Users can only see data from their organization
CREATE POLICY "org_isolation_policy" ON table_name
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
    )
  );
```

### Healthcare Compliance Policies
- **PHI Access**: Users can only see their own access logs
- **Medical Validations**: Read-only access for authenticated users
- **Admin Functions**: Write access restricted to verified admin emails

## Database Functions and Triggers

### Automated Functions

#### 1. Vector Search Function
```sql
search_knowledge_by_embedding(
  query_embedding vector(1536),
  domain_filter text DEFAULT NULL,
  embedding_model text DEFAULT 'openai',
  max_results integer DEFAULT 10,
  similarity_threshold decimal DEFAULT 0.7
)
```

#### 2. Agent-Optimized Search
```sql
search_knowledge_for_agent(
  agent_id_param uuid,
  query_text_param text,
  query_embedding_param vector(1536),
  max_results integer DEFAULT 10
)
```

#### 3. Updated At Triggers
Automatic timestamp updates on all core tables using `update_updated_at_column()` function.

#### 4. User Registration Handler
```sql
handle_new_user() -- Creates user_profiles entry on auth.users insert
```

## Configuration and Environment

### Supabase Configuration
- **URL**: https://xazinxsiglqokwfmogyk.supabase.co
- **Authentication**: JWT-based with RLS
- **Extensions**: UUID-OSSP, pgvector enabled
- **Connection**: Service role for admin operations, anon key for client

### Vector Database Configuration
- **pgvector extension** for embeddings
- **Multiple embedding models** supported:
  - OpenAI ada-002 (1536 dimensions)
  - ClinicalBERT (768 dimensions)
  - Legal-BERT (768 dimensions)
  - SciBERT (768 dimensions)

## Migration System

### Migration Files Structure
```
database/migrations/
├── 20240101000000_initial_schema.sql
├── 20240101000001_rls_policies.sql
├── 20240102000000_agents_schema.sql
├── 20240102000002_capabilities_schema.sql
├── 20240102000003_capabilities_seed.sql
├── 20240102000005_rag_vector_schema.sql
├── 20241218000000_create_icons_table.sql
├── 20250120000000_healthcare_compliance_enhancement.sql
├── 20250120000001_healthcare_capabilities_seed.sql
├── 20250918_enhance_workflow_system.sql
├── fix_avatar_column_size.sql
├── fix-tier-constraint.sql
├── langchain-setup.sql
├── schema.sql (consolidated)
├── seed.sql
└── vector-search-function.sql
```

### Migration Management
- Custom TypeScript-based migration runner
- SQL-first approach with validation
- Support for rollbacks and status checking

## Data Consistency and Integrity Issues

### Identified Inconsistencies

1. **Table Name Variations**:
   - `users` vs `user_profiles` - Both schemas exist
   - `ai_agents` vs `agents` - Same table, different references

2. **Foreign Key Mismatches**:
   - Some capability references use `agents(id)` instead of `ai_agents(id)`
   - Inconsistent organization_id patterns

3. **Data Type Variations**:
   - VARCHAR vs TEXT inconsistencies
   - Different precision for DECIMAL fields across similar use cases

4. **Index Naming**:
   - Inconsistent naming conventions for similar indexes
   - Some indexes reference non-existent columns

## Healthcare Compliance Features

### HIPAA Compliance
- PHI access logging in `phi_access_log`
- Data classification fields throughout
- User access audit trails
- De-identification tracking

### FDA 21 CFR Part 11 Compliance
- Complete audit trails in JSONB fields
- Electronic signature tracking in `system_prompts`
- Version control for all medical content
- Change history preservation

### Clinical Validation
- Medical accuracy scoring
- Clinical reviewer approval workflows
- Evidence-level tracking
- Guideline adherence monitoring

## Current Data Model Architecture

The VITAL path application implements a **Multi-tenant SaaS Architecture** with:

1. **Hierarchical Data Organization**: Organizations → Users → Projects → Content
2. **Agent-Centric AI System**: Configurable agents with medical capabilities
3. **Vector-Based Knowledge Management**: Multiple embedding models for different domains
4. **Healthcare Compliance Framework**: HIPAA, FDA, and clinical validation standards
5. **Workflow Orchestration**: Template-based process management
6. **Comprehensive Audit System**: Full traceability for regulatory compliance

The architecture supports 50+ healthcare AI agents with dynamic capability selection, real-time chat interactions, and sophisticated knowledge retrieval across multiple medical domains.

## Data Model Complexity Analysis

### Scale Metrics
- **Total Tables**: 20+ core business tables
- **Relationships**: 50+ foreign key relationships
- **Vector Dimensions**: 4 different embedding models (1536, 768×3)
- **JSONB Fields**: 30+ flexible metadata fields
- **Array Fields**: 15+ for tags, capabilities, specializations
- **Index Count**: 25+ performance and vector indexes

### Storage Patterns
- **Hierarchical**: Multi-tenant organization structure
- **Graph-like**: Agent-capability many-to-many relationships
- **Vector**: High-dimensional embeddings for semantic search
- **Audit**: Comprehensive tracking for regulatory compliance
- **Polymorphic**: Medical validations across multiple entity types

### Query Complexity
- **Multi-join Queries**: Agent capabilities with competencies and validations
- **Vector Similarity**: Semantic search across multiple embedding models
- **RLS Filtering**: Organization-based row-level security on all queries
- **JSONB Operations**: Complex filtering on metadata and configuration fields
- **Array Operations**: Tag-based filtering and capability matching