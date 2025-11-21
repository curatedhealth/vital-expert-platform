/**
 * Drizzle ORM Schema for Workers
 *
 * TypeScript-first database schema for AWS ECS workers.
 * Provides type-safe database access with native pgvector support.
 *
 * Features:
 * - Full TypeScript type inference
 * - Native pgvector operations
 * - Zod schema validation
 * - Type-safe relations
 *
 * @module lib/db/drizzle/schema
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, date, numeric, pgEnum, index, uniqueIndex, check } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

// Import pgvector extension type
import { vector } from 'pgvector/drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const orchestrationModeEnum = pgEnum('orchestration_mode', [
  'query_automatic',
  'query_manual',
  'chat_automatic',
  'chat_manual',
  'agent',
]);

export const agentTierEnum = pgEnum('agent_tier', ['tier_1', 'tier_2', 'tier_3']);

export const agentStatusEnum = pgEnum('agent_status', ['active', 'inactive', 'testing']);

export const complianceLevelEnum = pgEnum('compliance_level', [
  'standard',
  'hipaa',
  'gdpr',
  'fda',
  'soc2',
  'ccpa',
]);

export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant', 'system']);

export const conversationStatusEnum = pgEnum('conversation_status', ['active', 'archived', 'deleted']);

export const intentTypeEnum = pgEnum('intent_type', [
  'question',
  'task',
  'consultation',
  'analysis',
  'generation',
]);

export const complexityLevelEnum = pgEnum('complexity_level', ['low', 'medium', 'high', 'very_high']);

export const urgencyLevelEnum = pgEnum('urgency_level', ['low', 'standard', 'high', 'urgent']);

export const checkpointTypeEnum = pgEnum('checkpoint_type', ['approval', 'review', 'decision', 'safety']);

export const checkpointStatusEnum = pgEnum('checkpoint_status', ['pending', 'approved', 'rejected']);

export const dsrTypeEnum = pgEnum('dsr_type', ['access', 'deletion', 'portability', 'rectification']);

export const dsrStatusEnum = pgEnum('dsr_status', ['pending', 'processing', 'completed', 'rejected']);

export const regulationTypeEnum = pgEnum('regulation_type', ['GDPR', 'CCPA', 'HIPAA']);

export const validationStatusEnum = pgEnum('validation_status', ['draft', 'pending_review', 'validated', 'archived']);

// ============================================================================
// TABLES
// ============================================================================

// Tenants
export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 50 }).notNull().unique(),
    domain: varchar('domain', { length: 255 }).unique(),
    complianceLevel: complianceLevelEnum('compliance_level').notNull().default('standard'),
    isActive: boolean('is_active').notNull().default(true),
    settings: jsonb('settings').notNull().default({}),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('idx_tenants_slug').on(table.slug),
    domainIdx: index('idx_tenants_domain').on(table.domain),
    activeIdx: index('idx_tenants_active').on(table.isActive),
  })
);

// Personas
export const personas = pgTable(
  'personas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    title: text('title'),
    tagline: text('tagline'),
    roleId: uuid('role_id'), // No references for now
    functionId: uuid('function_id'), // No references for now
    departmentId: uuid('department_id'), // No references for now
    roleSlug: text('role_slug'),
    functionSlug: text('function_slug'),
    departmentSlug: text('role_slug'),
    seniorityLevel: text('seniority_level'),
    yearsOfExperience: integer('years_of_experience'),
    yearsInCurrentRole: integer('years_in_current_role'),
    yearsInIndustry: integer('years_in_industry'),
    yearsInFunction: integer('years_in_function'),
    typicalOrganizationSize: text('typical_organization_size'),
    organizationType: text('organization_type'),
    keyResponsibilities: text('key_responsibilities').array().default([]),
    geographicScope: text('geographic_scope'),
    reportingTo: text('reporting_to'),
    teamSize: text('team_size'),
    teamSizeTypical: integer('team_size_typical'),
    directReports: integer('direct_reports'),
    spanOfControl: text('span_of_control'),
    budgetAuthority: text('budget_authority'),
    workStyle: text('work_style'),
    workStylePreference: text('work_style_preference'),
    workArrangement: text('work_arrangement'),
    learningStyle: text('learning_style'),
    technologyAdoption: text('technology_adoption'),
    riskTolerance: text('risk_tolerance'),
    changeReadiness: text('change_readiness'),
    decisionMakingStyle: text('decision_making_style'),
    ageRange: text('age_range'),
    educationLevel: text('education_level'),
    locationType: text('location_type'),
    painPoints: jsonb('pain_points').default([]),
    goals: jsonb('goals').default([]),
    challenges: jsonb('challenges').default([]),
    communicationPreferences: jsonb('communication_preferences').default({}),
    preferredTools: text('preferred_tools').array().default([]),
    tags: text('tags').array().default([]),
    metadata: jsonb('metadata').notNull().default({}),
    avatarUrl: text('avatar_url'),
    avatarDescription: text('avatar_description'),
    colorCode: text('color_code'),
    icon: text('icon'),
    personaType: text('persona_type'),
    segment: text('segment'),
    archetype: text('archetype'),
    journeyStage: text('journey_stage'),
    section: text('section'),
    backgroundStory: text('background_story'),
    aDayInTheLife: text('a_day_in_the_life'),
    oneLiner: text('one_liner'),
    salaryMinUsd: integer('salary_min_usd'),
    salaryMaxUsd: integer('salary_max_usd'),
    salaryMedianUsd: integer('salary_median_usd'),
    salaryCurrency: text('salary_currency').default('USD'),
    salaryYear: integer('salary_year'),
    salarySources: text('salary_sources'),
    geographicBenchmarkScope: text('geographic_benchmark_scope'),
    sampleSize: text('sample_size'),
    confidenceLevel: text('confidence_level'),
    dataRecency: text('data_recency'),
    notes: text('notes'),
    isActive: boolean('is_active').notNull().default(true),
    validationStatus: validationStatusEnum('validation_status').notNull().default('draft'),
    validatedBy: uuid('validated_by').references(() => users.id, { onDelete: 'set null' }),
    validatedAt: timestamp('validated_at', { withTimezone: true }),
    personaNumber: integer('persona_number'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    tenantIdIdx: index('idx_personas_tenant_id').on(table.tenantId),
    slugIdx: uniqueIndex('idx_personas_slug').on(table.slug),
    isActiveIdx: index('idx_personas_is_active').on(table.isActive),
    validationStatusIdx: index('idx_personas_validation_status').on(table.validationStatus),
    roleIdIdx: index('idx_personas_role_id').on(table.roleId),
    functionIdIdx: index('idx_personas_function_id').on(table.functionId),
    departmentIdIdx: index('idx_personas_department_id').on(table.departmentId),
  })
);

// Users
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey(), // References auth.users
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull(),
    fullName: varchar('full_name', { length: 100 }),
    avatarUrl: text('avatar_url'),
    role: varchar('role', { length: 50 }).notNull().default('user'),
    preferences: jsonb('preferences').notNull().default({}),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  },
  (table) => ({
    tenantIdIdx: index('idx_users_tenant_id').on(table.tenantId),
    emailIdx: index('idx_users_email').on(table.email),
    roleIdx: index('idx_users_role').on(table.role),
  })
);

// Agents
export const agents = pgTable(
  'agents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    displayName: varchar('display_name', { length: 100 }).notNull(),
    description: text('description').notNull(),
    systemPrompt: text('system_prompt').notNull(),
    tier: agentTierEnum('tier').notNull().default('tier_3'),
    status: agentStatusEnum('status').notNull().default('active'),
    knowledgeDomains: text('knowledge_domains').array().notNull().default([]),
    capabilities: text('capabilities').array().notNull().default([]),
    avatarUrl: text('avatar_url'),
    priority: integer('priority').notNull().default(0),
    embedding: vector('embedding', { dimensions: 1536 }), // OpenAI text-embedding-3-large
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantIdIdx: index('idx_agents_tenant_id').on(table.tenantId),
    statusIdx: index('idx_agents_status').on(table.status),
    tierIdx: index('idx_agents_tier').on(table.tier),
    embeddingIdx: index('idx_agents_embedding').using('ivfflat', table.embedding.op('vector_cosine_ops')),
  })
);

// Conversations
export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 200 }).notNull(),
    mode: orchestrationModeEnum('mode').notNull(),
    status: conversationStatusEnum('status').notNull().default('active'),
    complianceLevel: complianceLevelEnum('compliance_level').notNull().default('standard'),
    persistentAgentId: uuid('persistent_agent_id').references(() => agents.id, { onDelete: 'set null' }),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    tenantIdIdx: index('idx_conversations_tenant_id').on(table.tenantId),
    userIdIdx: index('idx_conversations_user_id').on(table.userId),
    statusIdx: index('idx_conversations_status').on(table.status),
    modeIdx: index('idx_conversations_mode').on(table.mode),
    createdAtIdx: index('idx_conversations_created_at').on(table.createdAt),
  })
);

// Messages
export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    role: messageRoleEnum('role').notNull(),
    content: text('content').notNull(),
    agentId: uuid('agent_id').references(() => agents.id, { onDelete: 'set null' }),
    reasoning: text('reasoning').array(),
    citations: text('citations').array(),
    confidence: numeric('confidence', { precision: 3, scale: 2 }),
    tokensPrompt: integer('tokens_prompt'),
    tokensCompletion: integer('tokens_completion'),
    tokensTotal: integer('tokens_total'),
    estimatedCost: numeric('estimated_cost', { precision: 10, scale: 6 }),
    latencyMs: integer('latency_ms'),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    conversationIdIdx: index('idx_messages_conversation_id').on(table.conversationId),
    agentIdIdx: index('idx_messages_agent_id').on(table.agentId),
    roleIdx: index('idx_messages_role').on(table.role),
    createdAtIdx: index('idx_messages_created_at').on(table.createdAt),
  })
);

// Sources
export const sources = pgTable(
  'sources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    messageId: uuid('message_id')
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 500 }).notNull(),
    url: text('url').notNull(),
    excerpt: text('excerpt').notNull(),
    similarity: numeric('similarity', { precision: 5, scale: 4 }).notNull(),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    messageIdIdx: index('idx_sources_message_id').on(table.messageId),
    similarityIdx: index('idx_sources_similarity').on(table.similarity),
  })
);

// Agent Metrics
export const agentMetrics = pgTable(
  'agent_metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => agents.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    usageCount: integer('usage_count').notNull().default(0),
    averageLatencyMs: integer('average_latency_ms'),
    satisfactionScore: numeric('satisfaction_score', { precision: 3, scale: 2 }),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    date: date('date').notNull().defaultNow(),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    agentIdIdx: index('idx_agent_metrics_agent_id').on(table.agentId),
    tenantIdIdx: index('idx_agent_metrics_tenant_id').on(table.tenantId),
    dateIdx: index('idx_agent_metrics_date').on(table.date),
    uniqueDailyIdx: uniqueIndex('agent_metrics_unique_daily').on(table.agentId, table.tenantId, table.date),
  })
);

// Intent Classifications
export const intentClassifications = pgTable(
  'intent_classifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    query: text('query').notNull(),
    primaryIntent: intentTypeEnum('primary_intent').notNull(),
    primaryDomain: varchar('primary_domain', { length: 100 }).notNull(),
    domains: text('domains').array().notNull(),
    confidence: numeric('confidence', { precision: 3, scale: 2 }).notNull(),
    complexity: complexityLevelEnum('complexity').notNull(),
    urgency: urgencyLevelEnum('urgency').notNull(),
    requiresMultipleExperts: boolean('requires_multiple_experts').notNull().default(false),
    reasoning: text('reasoning').notNull(),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    conversationIdIdx: index('idx_intent_classifications_conversation_id').on(table.conversationId),
    primaryIntentIdx: index('idx_intent_classifications_primary_intent').on(table.primaryIntent),
    complexityIdx: index('idx_intent_classifications_complexity').on(table.complexity),
  })
);

// Checkpoints
export const checkpoints = pgTable(
  'checkpoints',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    type: checkpointTypeEnum('type').notNull(),
    description: text('description').notNull(),
    status: checkpointStatusEnum('status').notNull().default('pending'),
    approvedBy: uuid('approved_by').references(() => users.id, { onDelete: 'set null' }),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  },
  (table) => ({
    conversationIdIdx: index('idx_checkpoints_conversation_id').on(table.conversationId),
    statusIdx: index('idx_checkpoints_status').on(table.status),
    typeIdx: index('idx_checkpoints_type').on(table.type),
  })
);

// Task Plans
export const taskPlans = pgTable(
  'task_plans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    goal: text('goal').notNull(),
    currentStep: integer('current_step').notNull().default(0),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => ({
    conversationIdIdx: index('idx_task_plans_conversation_id').on(table.conversationId),
    createdAtIdx: index('idx_task_plans_created_at').on(table.createdAt),
  })
);

// Task Steps
export const taskSteps = pgTable(
  'task_steps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    taskPlanId: uuid('task_plan_id')
      .notNull()
      .references(() => taskPlans.id, { onDelete: 'cascade' }),
    stepNumber: integer('step_number').notNull(),
    description: text('description').notNull(),
    status: varchar('status', { length: 50 }).notNull().default('pending'),
    requiresApproval: boolean('requires_approval').notNull().default(false),
    checkpointId: uuid('checkpoint_id').references(() => checkpoints.id, { onDelete: 'set null' }),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => ({
    taskPlanIdIdx: index('idx_task_steps_task_plan_id').on(table.taskPlanId),
    statusIdx: index('idx_task_steps_status').on(table.status),
    uniqueStepIdx: uniqueIndex('task_steps_unique_step').on(table.taskPlanId, table.stepNumber),
  })
);

// Audit Logs
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    action: varchar('action', { length: 100 }).notNull(),
    resource: varchar('resource', { length: 100 }).notNull(),
    resourceId: varchar('resource_id', { length: 100 }).notNull(),
    ipAddress: varchar('ip_address', { length: 45 }).notNull(), // IPv6 compatible
    userAgent: text('user_agent').notNull(),
    phiAccessed: text('phi_accessed').array().notNull().default([]),
    piiAccessed: text('pii_accessed').array().notNull().default([]),
    complianceLevel: complianceLevelEnum('compliance_level').notNull(),
    justification: text('justification'),
    sessionId: uuid('session_id').notNull(),
    requestId: uuid('request_id').notNull(),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantIdIdx: index('idx_audit_logs_tenant_id').on(table.tenantId),
    userIdIdx: index('idx_audit_logs_user_id').on(table.userId),
    createdAtIdx: index('idx_audit_logs_created_at').on(table.createdAt),
    actionIdx: index('idx_audit_logs_action').on(table.action),
    resourceIdx: index('idx_audit_logs_resource').on(table.resource),
  })
);

// Data Subject Requests
export const dataSubjectRequests = pgTable(
  'data_subject_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: dsrTypeEnum('type').notNull(),
    status: dsrStatusEnum('status').notNull().default('pending'),
    regulation: regulationTypeEnum('regulation').notNull(),
    requestedAt: timestamp('requested_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    metadata: jsonb('metadata').notNull().default({}),
  },
  (table) => ({
    tenantIdIdx: index('idx_dsr_tenant_id').on(table.tenantId),
    userIdIdx: index('idx_dsr_user_id').on(table.userId),
    statusIdx: index('idx_dsr_status').on(table.status),
  })
);

// Consent Records
export const consentRecords = pgTable(
  'consent_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    purpose: varchar('purpose', { length: 200 }).notNull(),
    granted: boolean('granted').notNull(),
    regulation: regulationTypeEnum('regulation').notNull(),
    version: varchar('version', { length: 20 }).notNull(),
    grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    metadata: jsonb('metadata').notNull().default({}),
  },
  (table) => ({
    tenantIdIdx: index('idx_consent_records_tenant_id').on(table.tenantId),
    userIdIdx: index('idx_consent_records_user_id').on(table.userId),
    purposeIdx: index('idx_consent_records_purpose').on(table.purpose),
  })
);

// ============================================================================
// RELATIONS
// ============================================================================

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  agents: many(agents),
  conversations: many(conversations),
  agentMetrics: many(agentMetrics),
  auditLogs: many(auditLogs),
  personas: many(personas), // Add relation to personas table
}));

export const personasRelations = relations(personas, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [personas.tenantId],
    references: [tenants.id],
  }),
  validatedByUser: one(users, {
    fields: [personas.validatedBy],
    references: [users.id],
  }),
  // Add relations for junction tables here later
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  conversations: many(conversations),
  checkpointsApproved: many(checkpoints),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [agents.tenantId],
    references: [tenants.id],
  }),
  messages: many(messages),
  metrics: many(agentMetrics),
  persistentConversations: many(conversations),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [conversations.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  persistentAgent: one(agents, {
    fields: [conversations.persistentAgentId],
    references: [agents.id],
  }),
  messages: many(messages),
  intentClassifications: many(intentClassifications),
  checkpoints: many(checkpoints),
  taskPlans: many(taskPlans),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  agent: one(agents, {
    fields: [messages.agentId],
    references: [agents.id],
  }),
  sources: many(sources),
}));

export const sourcesRelations = relations(sources, ({ one }) => ({
  message: one(messages, {
    fields: [sources.messageId],
    references: [messages.id],
  }),
}));

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type Tenant = InferSelectModel<typeof tenants>;
export type InsertTenant = InferInsertModel<typeof tenants>;

export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

export type Agent = InferSelectModel<typeof agents>;
export type InsertAgent = InferInsertModel<typeof agents>;

export type Conversation = InferSelectModel<typeof conversations>;
export type InsertConversation = InferInsertModel<typeof conversations>;

export type Message = InferSelectModel<typeof messages>;
export type InsertMessage = InferInsertModel<typeof messages>;

export type Source = InferSelectModel<typeof sources>;
export type InsertSource = InferInsertModel<typeof sources>;

export type AgentMetric = InferSelectModel<typeof agentMetrics>;
export type InsertAgentMetric = InferInsertModel<typeof agentMetrics>;

export type IntentClassification = InferSelectModel<typeof intentClassifications>;
export type InsertIntentClassification = InferInsertModel<typeof intentClassifications>;

export type Checkpoint = InferSelectModel<typeof checkpoints>;
export type InsertCheckpoint = InferInsertModel<typeof checkpoints>;

export type TaskPlan = InferSelectModel<typeof taskPlans>;
export type InsertTaskPlan = InferInsertModel<typeof taskPlans>;

export type TaskStep = InferSelectModel<typeof taskSteps>;
export type InsertTaskStep = InferInsertModel<typeof taskSteps>;

export type AuditLog = InferSelectModel<typeof auditLogs>;
export type InsertAuditLog = InferInsertModel<typeof auditLogs>;

export type DataSubjectRequest = InferSelectModel<typeof dataSubjectRequests>;
export type InsertDataSubjectRequest = InferInsertModel<typeof dataSubjectRequests>;

export type ConsentRecord = InferSelectModel<typeof consentRecords>;
export type InsertConsentRecord = InferInsertModel<typeof consentRecords>;

export type Persona = InferSelectModel<typeof personas>;
export type InsertPersona = InferInsertModel<typeof personas>;


// ============================================================================
// ZOD SCHEMAS (Runtime Validation)
// ============================================================================

export const insertTenantSchema = createInsertSchema(tenants);
export const selectTenantSchema = createSelectSchema(tenants);

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertAgentSchema = createInsertSchema(agents);
export const selectAgentSchema = createSelectSchema(agents);

export const insertConversationSchema = createInsertSchema(conversations);
export const selectConversationSchema = createSelectSchema(conversations);

export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages);

export const insertSourceSchema = createInsertSchema(sources);
export const selectSourceSchema = createSelectSchema(sources);

export const insertAgentMetricSchema = createInsertSchema(agentMetrics);
export const selectAgentMetricSchema = createSelectSchema(agentMetrics);

export const insertIntentClassificationSchema = createInsertSchema(intentClassifications);
export const selectIntentClassificationSchema = createSelectSchema(intentClassifications);

export const insertCheckpointSchema = createInsertSchema(checkpoints);
export const selectCheckpointSchema = createSelectSchema(checkpoints);

export const insertTaskPlanSchema = createInsertSchema(taskPlans);
export const selectTaskPlanSchema = createSelectSchema(taskPlans);

export const insertTaskStepSchema = createInsertSchema(taskSteps);
export const selectTaskStepSchema = createSelectSchema(taskSteps);

export const insertAuditLogSchema = createInsertSchema(auditLogs);
export const selectAuditLogSchema = createSelectSchema(auditLogs);

export const insertDataSubjectRequestSchema = createInsertSchema(dataSubjectRequests);
export const selectDataSubjectRequestSchema = createSelectSchema(dataSubjectRequests);

export const insertConsentRecordSchema = createInsertSchema(consentRecords);
export const selectConsentRecordSchema = createSelectSchema(consentRecords);

export const insertPersonaSchema = createInsertSchema(personas);
export const selectPersonaSchema = createSelectSchema(personas);