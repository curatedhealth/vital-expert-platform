# VITAL Ask Expert Service - Comprehensive Fix Plan

**Version:** 1.0
**Date:** November 27, 2025
**Status:** APPROVED - Ready for Implementation
**Owner:** Engineering Team

---

## Executive Summary

This plan addresses all critical issues identified in the comprehensive audit. Key clarifications from stakeholders:
- **Observability**: Using **Langfuse** (not LangSmith)
- **Neo4j**: Already set up with data, needs integration into agent selection
- **Target**: Full Phase 1 launch readiness

### Fix Priority Matrix

| Priority | Component | Current State | Target State | Effort |
|----------|-----------|---------------|--------------|--------|
| P0 | Agent Activation | 6 active | 136+ active | 1 day |
| P0 | User Context Middleware | Not deployed | Operational | 2 days |
| P1 | Neo4j Integration | Data ready, not integrated | Full GraphRAG | 3 days |
| P1 | 3-Method Hybrid Selection | Pinecone only | PostgreSQL + Pinecone + Neo4j | 4 days |
| P1 | Langfuse Observability | Not integrated | Full tracing | 2 days |
| P2 | PostgreSQL Full-Text RPC | Not implemented | Operational | 1 day |
| P2 | Evidence Scoring | Not implemented | Basic scoring | 3 days |
| P3 | HITL Checkpoints | Designed, not tested | Production tested | 2 days |

**Total Estimated Effort**: 18 engineering days (2-3 weeks with parallel work)

---

## Phase 1: Critical Blockers (Days 1-3)

### 1.1 Agent Activation (P0) - Day 1

**Problem**: Only 6 agents active in database (need 136+)

**Solution**:
```sql
-- Step 1: Check current state
SELECT status, COUNT(*) as count
FROM agents
GROUP BY status;

-- Step 2: Activate Medical Affairs agents (core for Phase 1)
UPDATE agents
SET
    status = 'active',
    updated_at = NOW()
WHERE
    function_name IN ('Medical Affairs', 'Regulatory Affairs', 'Clinical Development')
    AND status = 'inactive'
    AND validation_status IN ('validated', 'pending')
RETURNING id, name, function_name, status;

-- Step 3: Verify minimum 136+ active
SELECT COUNT(*) as active_count FROM agents WHERE status = 'active';

-- Step 4: Create activation audit log
INSERT INTO agent_activation_log (
    activated_at,
    activated_by,
    agent_count,
    reason
) VALUES (
    NOW(),
    'system-phase1-launch',
    (SELECT COUNT(*) FROM agents WHERE status = 'active'),
    'Phase 1 launch preparation'
);
```

**Acceptance Criteria**:
- [ ] 136+ agents with `status = 'active'`
- [ ] All activated agents have valid `system_prompt`
- [ ] Activation logged for audit trail

**Owner**: Database Team
**Due**: Day 1

---

### 1.2 User Context Middleware (P0) - Days 1-2

**Problem**: RLS policies require user context but middleware not deployed

**Solution**: Create middleware to extract and set user/tenant context

```typescript
// File: services/api-gateway/src/middleware/user-context.ts

import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

interface UserContext {
  userId: string;
  tenantId: string;
  roles: string[];
}

export async function userContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Extract from headers (set by auth layer)
    const userId = req.headers['x-user-id'] as string;
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!userId || !tenantId) {
      return res.status(401).json({
        error: 'Missing user context',
        message: 'x-user-id and x-tenant-id headers required'
      });
    }

    // Validate user exists and belongs to tenant
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data: user, error } = await supabase
      .from('users')
      .select('id, tenant_id, roles')
      .eq('id', userId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !user) {
      return res.status(403).json({
        error: 'Invalid user context',
        message: 'User not found or tenant mismatch'
      });
    }

    // Set RLS context for database queries
    await supabase.rpc('set_user_context', { user_id: userId });
    await supabase.rpc('set_tenant_context', { tenant_id: tenantId });

    // Attach to request for downstream use
    req.userContext = {
      userId,
      tenantId,
      roles: user.roles || []
    } as UserContext;

    next();
  } catch (error) {
    console.error('User context middleware error:', error);
    return res.status(500).json({
      error: 'Context initialization failed'
    });
  }
}

// Type augmentation for Express
declare global {
  namespace Express {
    interface Request {
      userContext?: UserContext;
    }
  }
}
```

**Frontend Integration**:
```typescript
// File: apps/web/src/lib/api-client.ts

export function createApiClient() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  return {
    async askExpert(request: AskExpertRequest) {
      const session = await getSession();

      return fetch(`${baseUrl}/api/ask-expert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': session.user.id,
          'x-tenant-id': session.user.tenant_id,
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(request)
      });
    }
  };
}
```

**Acceptance Criteria**:
- [ ] Middleware extracts user/tenant from headers
- [ ] RLS context set before database queries
- [ ] Unauthorized requests return 401/403
- [ ] Frontend sends required headers

**Owner**: Backend Team
**Due**: Day 2

---

## Phase 2: Neo4j Integration (Days 3-6)

### 2.1 Neo4j Connection Service

**Problem**: Neo4j has data but not integrated into selection

**Solution**: Create Neo4j service with connection pooling

```typescript
// File: services/ai-engine/src/services/neo4j-service.ts

import neo4j, { Driver, Session, QueryResult } from 'neo4j-driver';

interface Neo4jConfig {
  uri: string;
  username: string;
  password: string;
  database: string;
  maxConnectionPoolSize: number;
}

export class Neo4jService {
  private driver: Driver;
  private config: Neo4jConfig;

  constructor(config: Neo4jConfig) {
    this.config = config;
    this.driver = neo4j.driver(
      config.uri,
      neo4j.auth.basic(config.username, config.password),
      {
        maxConnectionPoolSize: config.maxConnectionPoolSize || 50,
        connectionAcquisitionTimeout: 30000,
        connectionTimeout: 30000,
      }
    );
  }

  async verifyConnection(): Promise<boolean> {
    const session = this.driver.session({ database: this.config.database });
    try {
      await session.run('RETURN 1 as connected');
      console.log('✅ Neo4j connection verified');
      return true;
    } catch (error) {
      console.error('❌ Neo4j connection failed:', error);
      return false;
    } finally {
      await session.close();
    }
  }

  async searchAgentsByGraph(
    query: string,
    queryEmbedding: number[],
    tenantId: string,
    limit: number = 20
  ): Promise<GraphSearchResult[]> {
    const session = this.driver.session({ database: this.config.database });

    try {
      const result = await session.run(`
        // Find agents through capability and skill relationships
        MATCH (a:Agent {tenant_id: $tenantId, is_active: true})

        // Get capabilities
        OPTIONAL MATCH (a)-[hc:HAS_CAPABILITY]->(cap:Capability)

        // Get skills
        OPTIONAL MATCH (a)-[hs:HAS_SKILL]->(skill:Skill)

        // Get domain expertise
        OPTIONAL MATCH (a)-[:BELONGS_TO_DOMAIN]->(domain:Domain)

        // Get collaboration relationships
        OPTIONAL MATCH (a)-[:COLLABORATES_WITH]-(peer:Agent)
        OPTIONAL MATCH (a)-[:ORCHESTRATES]->(subordinate:Agent)

        // Calculate relationship scores
        WITH a,
             COLLECT(DISTINCT cap.name) AS capabilities,
             COLLECT(DISTINCT skill.name) AS skills,
             COLLECT(DISTINCT domain.name) AS domains,
             COUNT(DISTINCT peer) AS collaboration_score,
             COUNT(DISTINCT subordinate) AS orchestration_score,
             AVG(COALESCE(hc.proficiency, 0.5)) AS avg_capability_proficiency,
             AVG(COALESCE(hs.proficiency, 0.5)) AS avg_skill_proficiency

        // Calculate graph centrality score
        WITH a, capabilities, skills, domains,
             (collaboration_score * 0.3 +
              orchestration_score * 0.2 +
              avg_capability_proficiency * 0.25 +
              avg_skill_proficiency * 0.25) AS graph_score

        // Apply tier boost
        WITH a, capabilities, skills, domains, graph_score,
             CASE a.tier
               WHEN 'tier1' THEN 1.0
               WHEN 'tier2' THEN 0.9
               WHEN 'tier3' THEN 0.8
               ELSE 0.7
             END AS tier_boost

        RETURN
          a.agent_id AS agent_id,
          a.name AS name,
          a.display_name AS display_name,
          a.tier AS tier,
          capabilities,
          skills,
          domains,
          graph_score * tier_boost AS score

        ORDER BY score DESC
        LIMIT $limit
      `, {
        tenantId,
        limit: neo4j.int(limit)
      });

      return result.records.map(record => ({
        agentId: record.get('agent_id'),
        name: record.get('name'),
        displayName: record.get('display_name'),
        tier: record.get('tier'),
        capabilities: record.get('capabilities'),
        skills: record.get('skills'),
        domains: record.get('domains'),
        score: record.get('score'),
        source: 'neo4j'
      }));
    } finally {
      await session.close();
    }
  }

  async getAgentRelationships(agentId: string): Promise<AgentRelationships> {
    const session = this.driver.session({ database: this.config.database });

    try {
      const result = await session.run(`
        MATCH (a:Agent {agent_id: $agentId})

        // Get orchestration hierarchy
        OPTIONAL MATCH (a)-[:ORCHESTRATES]->(subordinate:Agent)
        OPTIONAL MATCH (parent:Agent)-[:ORCHESTRATES]->(a)

        // Get collaboration network
        OPTIONAL MATCH (a)-[:COLLABORATES_WITH]-(peer:Agent)

        // Get delegation targets
        OPTIONAL MATCH (a)-[:DELEGATES_TO]->(delegate:Agent)

        RETURN
          a.agent_id AS agent_id,
          COLLECT(DISTINCT subordinate.agent_id) AS subordinates,
          COLLECT(DISTINCT parent.agent_id) AS parents,
          COLLECT(DISTINCT peer.agent_id) AS peers,
          COLLECT(DISTINCT delegate.agent_id) AS delegates
      `, { agentId });

      const record = result.records[0];
      return {
        agentId: record.get('agent_id'),
        subordinates: record.get('subordinates') || [],
        parents: record.get('parents') || [],
        peers: record.get('peers') || [],
        delegates: record.get('delegates') || []
      };
    } finally {
      await session.close();
    }
  }

  async close(): Promise<void> {
    await this.driver.close();
  }
}

interface GraphSearchResult {
  agentId: string;
  name: string;
  displayName: string;
  tier: string;
  capabilities: string[];
  skills: string[];
  domains: string[];
  score: number;
  source: 'neo4j';
}

interface AgentRelationships {
  agentId: string;
  subordinates: string[];
  parents: string[];
  peers: string[];
  delegates: string[];
}
```

**Environment Variables**:
```env
# Neo4j Configuration
NEO4J_URI=bolt://your-neo4j-instance:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password
NEO4J_DATABASE=vital
NEO4J_MAX_POOL_SIZE=50
```

**Acceptance Criteria**:
- [ ] Neo4j connection pooling implemented
- [ ] Graph traversal query returns ranked agents
- [ ] Relationship data accessible for orchestration
- [ ] Connection health check endpoint

**Owner**: AI Engine Team
**Due**: Day 4

---

### 2.2 Hybrid Agent Selector (3-Method)

**Problem**: Only Pinecone search working, need full hybrid

**Solution**: Implement RRF fusion with all three methods

```typescript
// File: services/ai-engine/src/services/hybrid-agent-selector.ts

import { Pool } from 'pg';
import { Pinecone } from '@pinecone-database/pinecone';
import { Neo4jService } from './neo4j-service';
import { OpenAIEmbeddings } from '@langchain/openai';
import Redis from 'ioredis';

interface HybridSelectorConfig {
  postgresUrl: string;
  pineconeApiKey: string;
  pineconeIndex: string;
  neo4jService: Neo4jService;
  redisUrl: string;
  weights: {
    postgres: number;  // 0.30
    pinecone: number;  // 0.50
    neo4j: number;     // 0.20
  };
}

interface SelectionResult {
  agentId: string;
  name: string;
  displayName: string;
  tier: string;
  scores: {
    postgres: number;
    pinecone: number;
    neo4j: number;
    combined: number;
    evidenceBoost: number;
  };
  confidence: number;
  source: string;
  evidence: Evidence[];
}

interface Evidence {
  type: string;
  description: string;
  strength: 'high' | 'medium' | 'low';
}

export class HybridAgentSelector {
  private postgres: Pool;
  private pinecone: Pinecone;
  private pineconeIndex: string;
  private neo4j: Neo4jService;
  private redis: Redis;
  private embeddings: OpenAIEmbeddings;
  private weights: HybridSelectorConfig['weights'];

  constructor(config: HybridSelectorConfig) {
    this.postgres = new Pool({ connectionString: config.postgresUrl });
    this.pinecone = new Pinecone({ apiKey: config.pineconeApiKey });
    this.pineconeIndex = config.pineconeIndex;
    this.neo4j = config.neo4jService;
    this.redis = new Redis(config.redisUrl);
    this.weights = config.weights;
    this.embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small'
    });
  }

  /**
   * Main entry point for automatic agent selection (Modes 2 & 4)
   */
  async selectAgents(
    query: string,
    options: {
      tenantId: string;
      maxAgents: number;
      minConfidence?: number;
      mode: 'interactive' | 'autonomous';
    }
  ): Promise<SelectionResult[]> {
    const startTime = Date.now();

    // Check cache first
    const cacheKey = this.getCacheKey(query, options);
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for query: ${query.substring(0, 50)}...`);
      return JSON.parse(cached);
    }

    // Generate query embedding
    const queryEmbedding = await this.embeddings.embedQuery(query);

    // Execute all three search methods in parallel
    const [postgresResults, pineconeResults, neo4jResults] = await Promise.all([
      this.postgresFullTextSearch(query, options.tenantId),
      this.pineconeVectorSearch(queryEmbedding, options.tenantId),
      this.neo4j.searchAgentsByGraph(query, queryEmbedding, options.tenantId)
    ]);

    // Fuse results using Reciprocal Rank Fusion (RRF)
    const fusedResults = this.rrfFusion({
      postgres: { results: postgresResults, weight: this.weights.postgres },
      pinecone: { results: pineconeResults, weight: this.weights.pinecone },
      neo4j: { results: neo4jResults, weight: this.weights.neo4j }
    });

    // Apply evidence-based scoring boost
    const scoredResults = await this.applyEvidenceScoring(fusedResults, query);

    // Filter by minimum confidence
    const minConf = options.minConfidence || 0.5;
    const filteredResults = scoredResults.filter(r => r.confidence >= minConf);

    // Take top N results
    const topResults = filteredResults.slice(0, options.maxAgents);

    // Cache results (5 minute TTL)
    await this.redis.setex(cacheKey, 300, JSON.stringify(topResults));

    const duration = Date.now() - startTime;
    console.log(`Hybrid selection completed in ${duration}ms for ${topResults.length} agents`);

    return topResults;
  }

  /**
   * PostgreSQL Full-Text Search (30% weight)
   */
  private async postgresFullTextSearch(
    query: string,
    tenantId: string
  ): Promise<SearchResult[]> {
    const result = await this.postgres.query(`
      SELECT
        a.id as agent_id,
        a.name,
        a.display_name,
        a.tier,
        ts_rank(
          to_tsvector('english',
            COALESCE(a.name, '') || ' ' ||
            COALESCE(a.description, '') || ' ' ||
            COALESCE(a.title, '') || ' ' ||
            COALESCE(array_to_string(a.capabilities, ' '), '')
          ),
          plainto_tsquery('english', $1)
        ) as score
      FROM agents a
      WHERE
        a.tenant_id = $2
        AND a.status = 'active'
        AND to_tsvector('english',
          COALESCE(a.name, '') || ' ' ||
          COALESCE(a.description, '')
        ) @@ plainto_tsquery('english', $1)
      ORDER BY score DESC
      LIMIT 20
    `, [query, tenantId]);

    return result.rows.map(row => ({
      agentId: row.agent_id,
      name: row.name,
      displayName: row.display_name,
      tier: row.tier,
      score: parseFloat(row.score) || 0,
      source: 'postgres'
    }));
  }

  /**
   * Pinecone Vector Search (50% weight)
   */
  private async pineconeVectorSearch(
    queryEmbedding: number[],
    tenantId: string
  ): Promise<SearchResult[]> {
    const index = this.pinecone.Index(this.pineconeIndex);

    const results = await index.query({
      vector: queryEmbedding,
      topK: 20,
      namespace: `tenant-${tenantId}`,
      includeMetadata: true,
      filter: { is_active: true }
    });

    return results.matches?.map(match => ({
      agentId: match.id,
      name: match.metadata?.name as string || '',
      displayName: match.metadata?.display_name as string || '',
      tier: match.metadata?.tier as string || 'tier2',
      score: match.score || 0,
      source: 'pinecone'
    })) || [];
  }

  /**
   * Reciprocal Rank Fusion (RRF) Algorithm
   * Combines rankings from multiple sources
   */
  private rrfFusion(sources: {
    [key: string]: { results: SearchResult[]; weight: number }
  }): FusedResult[] {
    const k = 60; // RRF constant
    const agentScores = new Map<string, FusedResult>();

    for (const [sourceName, { results, weight }] of Object.entries(sources)) {
      for (let rank = 0; rank < results.length; rank++) {
        const result = results[rank];
        const rrfScore = weight / (k + rank + 1);

        if (!agentScores.has(result.agentId)) {
          agentScores.set(result.agentId, {
            agentId: result.agentId,
            name: result.name,
            displayName: result.displayName,
            tier: result.tier,
            scores: { postgres: 0, pinecone: 0, neo4j: 0, combined: 0, evidenceBoost: 0 },
            confidence: 0,
            source: sourceName,
            evidence: []
          });
        }

        const agent = agentScores.get(result.agentId)!;
        agent.scores[sourceName as keyof typeof agent.scores] = result.score;
        agent.scores.combined += rrfScore;
      }
    }

    // Calculate confidence from combined score
    const results = Array.from(agentScores.values());
    const maxScore = Math.max(...results.map(r => r.scores.combined));

    for (const result of results) {
      result.confidence = result.scores.combined / maxScore;
    }

    // Sort by combined score
    return results.sort((a, b) => b.scores.combined - a.scores.combined);
  }

  /**
   * Apply evidence-based scoring boost
   */
  private async applyEvidenceScoring(
    results: FusedResult[],
    query: string
  ): Promise<SelectionResult[]> {
    const agentIds = results.map(r => r.agentId);

    // Fetch evidence data from database
    const evidenceResult = await this.postgres.query(`
      SELECT
        a.id as agent_id,
        a.evidence_score,
        COALESCE(
          (SELECT AVG(proficiency) FROM agent_capabilities WHERE agent_id = a.id),
          0.5
        ) as avg_capability,
        COALESCE(
          (SELECT AVG(proficiency) FROM agent_skills WHERE agent_id = a.id),
          0.5
        ) as avg_skill,
        a.years_of_experience
      FROM agents a
      WHERE a.id = ANY($1)
    `, [agentIds]);

    const evidenceMap = new Map(
      evidenceResult.rows.map(row => [row.agent_id, row])
    );

    return results.map(result => {
      const evidence = evidenceMap.get(result.agentId);
      const evidenceBoost = evidence ? this.calculateEvidenceBoost(evidence, query) : 0;

      return {
        ...result,
        scores: {
          ...result.scores,
          evidenceBoost
        },
        confidence: Math.min(result.confidence * (1 + evidenceBoost), 1.0),
        evidence: this.generateEvidenceBadges(evidence)
      };
    }).sort((a, b) => b.confidence - a.confidence);
  }

  private calculateEvidenceBoost(evidence: any, query: string): number {
    let boost = 0;

    // Evidence score boost (0-10 points = 0-0.1 boost)
    if (evidence.evidence_score) {
      boost += Math.min(evidence.evidence_score / 100, 0.1);
    }

    // Capability proficiency boost
    if (evidence.avg_capability > 0.7) {
      boost += 0.05;
    }

    // Skill proficiency boost
    if (evidence.avg_skill > 0.7) {
      boost += 0.05;
    }

    // Experience boost
    if (evidence.years_of_experience > 10) {
      boost += 0.03;
    }

    return boost;
  }

  private generateEvidenceBadges(evidence: any): Evidence[] {
    const badges: Evidence[] = [];

    if (evidence?.years_of_experience > 15) {
      badges.push({
        type: 'experience',
        description: `${evidence.years_of_experience}+ years experience`,
        strength: 'high'
      });
    }

    if (evidence?.avg_capability > 0.8) {
      badges.push({
        type: 'capability',
        description: 'Expert-level capabilities',
        strength: 'high'
      });
    }

    if (evidence?.evidence_score > 80) {
      badges.push({
        type: 'performance',
        description: 'High historical accuracy',
        strength: 'high'
      });
    }

    return badges;
  }

  private getCacheKey(query: string, options: any): string {
    const hash = Buffer.from(query).toString('base64').substring(0, 32);
    return `agent-selection:${options.tenantId}:${options.mode}:${hash}`;
  }
}

interface SearchResult {
  agentId: string;
  name: string;
  displayName: string;
  tier: string;
  score: number;
  source: string;
}

interface FusedResult extends Omit<SelectionResult, 'evidence'> {
  evidence: Evidence[];
}
```

**Acceptance Criteria**:
- [ ] All 3 methods execute in parallel
- [ ] RRF fusion combines rankings correctly
- [ ] Evidence boost applied to final scores
- [ ] Results cached in Redis (5 min TTL)
- [ ] P95 latency < 450ms

**Owner**: AI Engine Team
**Due**: Day 6

---

## Phase 3: Langfuse Observability (Days 5-6)

### 3.1 Langfuse Integration

**Problem**: No observability for debugging autonomous reasoning

**Solution**: Integrate Langfuse for full tracing

```typescript
// File: services/ai-engine/src/observability/langfuse-client.ts

import { Langfuse } from 'langfuse';

interface LangfuseConfig {
  publicKey: string;
  secretKey: string;
  baseUrl?: string;
}

export class LangfuseObservability {
  private langfuse: Langfuse;

  constructor(config: LangfuseConfig) {
    this.langfuse = new Langfuse({
      publicKey: config.publicKey,
      secretKey: config.secretKey,
      baseUrl: config.baseUrl || 'https://cloud.langfuse.com'
    });
  }

  /**
   * Create a trace for an Ask Expert session
   */
  createTrace(options: {
    sessionId: string;
    userId: string;
    mode: 'mode1' | 'mode2' | 'mode3' | 'mode4';
    query: string;
    metadata?: Record<string, any>;
  }) {
    return this.langfuse.trace({
      id: options.sessionId,
      name: `ask-expert-${options.mode}`,
      userId: options.userId,
      input: { query: options.query },
      metadata: {
        mode: options.mode,
        ...options.metadata
      }
    });
  }

  /**
   * Create a span for agent selection
   */
  createAgentSelectionSpan(
    trace: any,
    options: {
      query: string;
      method: 'postgres' | 'pinecone' | 'neo4j' | 'hybrid';
    }
  ) {
    return trace.span({
      name: `agent-selection-${options.method}`,
      input: { query: options.query }
    });
  }

  /**
   * Create a generation span for LLM calls
   */
  createGeneration(
    trace: any,
    options: {
      name: string;
      model: string;
      input: any;
      output?: any;
      usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    }
  ) {
    return trace.generation({
      name: options.name,
      model: options.model,
      input: options.input,
      output: options.output,
      usage: options.usage
    });
  }

  /**
   * Log agent execution
   */
  logAgentExecution(
    trace: any,
    options: {
      agentId: string;
      agentName: string;
      input: string;
      output: string;
      duration: number;
      tokens?: number;
    }
  ) {
    return trace.span({
      name: `agent-execution-${options.agentName}`,
      input: { query: options.input, agentId: options.agentId },
      output: { response: options.output },
      metadata: {
        duration_ms: options.duration,
        tokens: options.tokens
      }
    });
  }

  /**
   * Log HITL checkpoint
   */
  logCheckpoint(
    trace: any,
    options: {
      checkpointType: string;
      content: any;
      approved?: boolean;
      feedback?: string;
    }
  ) {
    return trace.event({
      name: 'hitl-checkpoint',
      input: options.content,
      metadata: {
        type: options.checkpointType,
        approved: options.approved,
        feedback: options.feedback
      }
    });
  }

  /**
   * Flush all pending events
   */
  async flush(): Promise<void> {
    await this.langfuse.flushAsync();
  }
}

// Singleton instance
let langfuseInstance: LangfuseObservability | null = null;

export function getLangfuse(): LangfuseObservability {
  if (!langfuseInstance) {
    langfuseInstance = new LangfuseObservability({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
      secretKey: process.env.LANGFUSE_SECRET_KEY!,
      baseUrl: process.env.LANGFUSE_BASE_URL
    });
  }
  return langfuseInstance;
}
```

**Integration with Mode Workflows**:
```typescript
// File: services/ai-engine/src/workflows/mode2-workflow.ts

import { getLangfuse } from '../observability/langfuse-client';

export async function executeMode2(
  query: string,
  context: WorkflowContext
): Promise<Mode2Response> {
  const langfuse = getLangfuse();

  // Create trace for this session
  const trace = langfuse.createTrace({
    sessionId: context.sessionId,
    userId: context.userId,
    mode: 'mode2',
    query,
    metadata: { tenantId: context.tenantId }
  });

  try {
    // Agent selection with tracing
    const selectionSpan = langfuse.createAgentSelectionSpan(trace, {
      query,
      method: 'hybrid'
    });

    const selectedAgents = await hybridSelector.selectAgents(query, {
      tenantId: context.tenantId,
      maxAgents: 2,
      mode: 'interactive'
    });

    selectionSpan.end({
      output: selectedAgents.map(a => ({
        id: a.agentId,
        name: a.name,
        confidence: a.confidence
      }))
    });

    // Execute agents with tracing
    const responses = await Promise.all(
      selectedAgents.map(async (agent) => {
        const startTime = Date.now();

        const generation = langfuse.createGeneration(trace, {
          name: `agent-${agent.name}`,
          model: agent.model || 'gpt-4',
          input: { query, agentContext: agent }
        });

        const response = await executeAgent(agent, query);

        generation.end({
          output: response,
          usage: response.usage
        });

        langfuse.logAgentExecution(trace, {
          agentId: agent.agentId,
          agentName: agent.name,
          input: query,
          output: response.content,
          duration: Date.now() - startTime,
          tokens: response.usage?.totalTokens
        });

        return response;
      })
    );

    // Synthesize response
    const synthesized = await synthesizeResponses(responses);

    trace.update({
      output: synthesized,
      metadata: { agentCount: selectedAgents.length }
    });

    return synthesized;
  } catch (error) {
    trace.update({
      output: { error: error.message },
      metadata: { error: true }
    });
    throw error;
  } finally {
    await langfuse.flush();
  }
}
```

**Environment Variables**:
```env
# Langfuse Configuration
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_BASE_URL=https://cloud.langfuse.com
```

**Acceptance Criteria**:
- [ ] All mode executions create traces
- [ ] Agent selection spans recorded
- [ ] LLM generations tracked with token usage
- [ ] HITL checkpoints logged
- [ ] Traces visible in Langfuse dashboard

**Owner**: AI Engine Team
**Due**: Day 6

---

## Phase 4: PostgreSQL Full-Text RPC (Day 7)

### 4.1 Create Search RPC Function

```sql
-- File: supabase/migrations/20251127_add_agent_search_rpc.sql

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_agents_fulltext
ON agents USING gin(
  to_tsvector('english',
    COALESCE(name, '') || ' ' ||
    COALESCE(description, '') || ' ' ||
    COALESCE(title, '')
  )
);

-- Create trigram extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create search RPC function
CREATE OR REPLACE FUNCTION search_agents_fulltext(
  search_query TEXT,
  tenant_filter UUID,
  result_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  display_name TEXT,
  tier TEXT,
  text_rank FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.name,
    a.display_name,
    a.tier,
    (
      ts_rank(
        to_tsvector('english',
          COALESCE(a.name, '') || ' ' ||
          COALESCE(a.description, '') || ' ' ||
          COALESCE(a.title, '')
        ),
        plainto_tsquery('english', search_query)
      ) * 0.7 +
      similarity(
        LOWER(a.name || ' ' || COALESCE(a.description, '')),
        LOWER(search_query)
      ) * 0.3
    )::FLOAT AS text_rank
  FROM agents a
  WHERE
    a.tenant_id = tenant_filter
    AND a.status = 'active'
    AND (
      to_tsvector('english',
        COALESCE(a.name, '') || ' ' ||
        COALESCE(a.description, '')
      ) @@ plainto_tsquery('english', search_query)
      OR
      similarity(LOWER(a.name), LOWER(search_query)) > 0.3
    )
  ORDER BY text_rank DESC
  LIMIT result_limit;
END;
$$;

-- Grant access
GRANT EXECUTE ON FUNCTION search_agents_fulltext TO authenticated;
GRANT EXECUTE ON FUNCTION search_agents_fulltext TO service_role;
```

**Acceptance Criteria**:
- [ ] Full-text index created
- [ ] Trigram extension enabled
- [ ] RPC function deployed and callable
- [ ] Results match expected ranking

**Owner**: Database Team
**Due**: Day 7

---

## Phase 5: Evidence Scoring (Days 8-10)

### 5.1 Create Evidence Score Tables

```sql
-- File: supabase/migrations/20251127_add_evidence_scoring.sql

-- Agent performance metrics table
CREATE TABLE IF NOT EXISTS agent_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL,
  metric_value DECIMAL(5,2) NOT NULL,
  sample_size INT DEFAULT 0,
  measured_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',

  CONSTRAINT valid_metric_type CHECK (
    metric_type IN ('accuracy', 'satisfaction', 'response_time', 'citation_quality')
  )
);

-- Create index for performance queries
CREATE INDEX idx_agent_performance_metrics
ON agent_performance_metrics(agent_id, metric_type, measured_at DESC);

-- Agent usage statistics table
CREATE TABLE IF NOT EXISTS agent_usage_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  query_count INT DEFAULT 0,
  selection_count INT DEFAULT 0,
  success_count INT DEFAULT 0,
  avg_confidence DECIMAL(5,4) DEFAULT 0,

  UNIQUE(agent_id, period_start, period_end)
);

-- Create computed evidence score column
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS computed_evidence_score DECIMAL(5,2) DEFAULT 0;

-- Function to update evidence scores
CREATE OR REPLACE FUNCTION update_agent_evidence_score(agent_uuid UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
  new_score DECIMAL;
BEGIN
  SELECT
    COALESCE(
      (
        -- Base capability score (30%)
        (SELECT AVG(proficiency) * 100 * 0.3
         FROM agent_capabilities WHERE agent_id = agent_uuid)
        +
        -- Skill proficiency (25%)
        (SELECT AVG(proficiency) * 100 * 0.25
         FROM agent_skills WHERE agent_id = agent_uuid)
        +
        -- Performance metrics (25%)
        (SELECT AVG(metric_value) * 0.25
         FROM agent_performance_metrics
         WHERE agent_id = agent_uuid
         AND measured_at > NOW() - INTERVAL '30 days')
        +
        -- Usage popularity (20%)
        (SELECT LEAST(query_count::DECIMAL / 100, 1) * 20
         FROM agent_usage_statistics
         WHERE agent_id = agent_uuid
         AND period_end > NOW() - INTERVAL '30 days')
      ),
      50  -- Default score if no data
    )
  INTO new_score;

  UPDATE agents
  SET computed_evidence_score = new_score
  WHERE id = agent_uuid;

  RETURN new_score;
END;
$$;
```

**Acceptance Criteria**:
- [ ] Performance metrics table created
- [ ] Usage statistics table created
- [ ] Evidence score computation function works
- [ ] Initial scores populated for all active agents

**Owner**: Database Team
**Due**: Day 10

---

## Phase 6: HITL Production Testing (Days 11-12)

### 6.1 HITL Checkpoint Tests

```typescript
// File: services/ai-engine/src/__tests__/hitl-checkpoints.test.ts

import { describe, it, expect, beforeAll } from 'vitest';
import { Mode3Workflow } from '../workflows/mode3-workflow';
import { Mode4Workflow } from '../workflows/mode4-workflow';

describe('HITL Checkpoint System', () => {
  describe('Mode 3 - Autonomous + Manual', () => {
    it('should pause for approval at critical checkpoints', async () => {
      const workflow = new Mode3Workflow({
        agentId: 'test-agent-id',
        userId: 'test-user',
        tenantId: 'test-tenant'
      });

      const checkpoints: any[] = [];
      workflow.onCheckpoint((cp) => {
        checkpoints.push(cp);
        // Simulate user approval
        cp.approve();
      });

      await workflow.execute('Create a 510k submission strategy');

      expect(checkpoints.length).toBeGreaterThan(0);
      expect(checkpoints[0]).toHaveProperty('type');
      expect(checkpoints[0]).toHaveProperty('content');
    });

    it('should handle rejection and re-plan', async () => {
      const workflow = new Mode3Workflow({
        agentId: 'test-agent-id',
        userId: 'test-user',
        tenantId: 'test-tenant'
      });

      let rejectionCount = 0;
      workflow.onCheckpoint((cp) => {
        if (rejectionCount === 0) {
          rejectionCount++;
          cp.reject('Please include more detail on predicate devices');
        } else {
          cp.approve();
        }
      });

      const result = await workflow.execute('Create a 510k submission strategy');

      expect(rejectionCount).toBe(1);
      expect(result.revisions).toBe(1);
    });

    it('should timeout after configured duration', async () => {
      const workflow = new Mode3Workflow({
        agentId: 'test-agent-id',
        userId: 'test-user',
        tenantId: 'test-tenant',
        checkpointTimeout: 100 // 100ms for test
      });

      // Don't approve - let it timeout
      workflow.onCheckpoint(() => {
        // Do nothing - simulate user not responding
      });

      await expect(
        workflow.execute('Create a 510k submission strategy')
      ).rejects.toThrow('Checkpoint timeout');
    });
  });

  describe('Mode 4 - Autonomous + Automatic', () => {
    it('should coordinate multiple agents with HITL', async () => {
      const workflow = new Mode4Workflow({
        userId: 'test-user',
        tenantId: 'test-tenant',
        maxAgents: 4
      });

      const agentCheckpoints: Map<string, any[]> = new Map();

      workflow.onCheckpoint((cp) => {
        const agentId = cp.agentId;
        if (!agentCheckpoints.has(agentId)) {
          agentCheckpoints.set(agentId, []);
        }
        agentCheckpoints.get(agentId)!.push(cp);
        cp.approve();
      });

      await workflow.execute('Create comprehensive FDA submission package');

      expect(agentCheckpoints.size).toBeGreaterThanOrEqual(2);
    });
  });
});
```

**Acceptance Criteria**:
- [ ] Checkpoint approval flow tested
- [ ] Checkpoint rejection triggers re-planning
- [ ] Timeout handling verified
- [ ] Multi-agent coordination tested
- [ ] All tests pass in CI

**Owner**: QA Team
**Due**: Day 12

---

## Implementation Timeline

```
Week 1 (Days 1-5)
─────────────────────────────────────────────────────────────────────
Day 1:  [P0] Agent Activation (136+ active)
Day 2:  [P0] User Context Middleware
Day 3:  [P1] Neo4j Connection Service
Day 4:  [P1] Neo4j Graph Search Implementation
Day 5:  [P1] Hybrid Selector Integration

Week 2 (Days 6-10)
─────────────────────────────────────────────────────────────────────
Day 6:  [P1] Langfuse Integration
Day 7:  [P2] PostgreSQL Full-Text RPC
Day 8:  [P2] Evidence Scoring Tables
Day 9:  [P2] Evidence Score Computation
Day 10: [P2] Evidence Integration into Selector

Week 3 (Days 11-14)
─────────────────────────────────────────────────────────────────────
Day 11: [P3] HITL Checkpoint Production Tests
Day 12: [P3] End-to-End Integration Testing
Day 13: Buffer / Bug Fixes
Day 14: Documentation Update / Sign-off
```

---

## Success Metrics

### Technical KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Active Agents | ≥136 | Database query |
| Selection Accuracy | ≥90% | A/B testing |
| P95 Latency | <450ms | Langfuse metrics |
| Cache Hit Rate | >70% | Redis metrics |
| Neo4j Query Time | <100ms | Langfuse spans |
| Error Rate | <0.5% | Monitoring |

### Operational KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| HITL Response Rate | >95% | Langfuse events |
| Trace Coverage | 100% | Langfuse dashboard |
| RLS Enforcement | 100% | Security audit |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Neo4j integration complexity | Medium | High | Start with simple queries, iterate |
| Performance degradation | Low | High | Monitor with Langfuse, have rollback plan |
| Agent activation issues | Low | Medium | Test thoroughly in staging first |
| Langfuse rate limits | Low | Low | Batch events, use sampling if needed |

---

## Rollback Plan

If critical issues are discovered:

1. **Agent Selection**: Fall back to Pinecone-only (100% weight)
2. **Neo4j Issues**: Disable graph search, use 2-method hybrid
3. **Langfuse Issues**: Disable tracing (fire-and-forget)
4. **HITL Issues**: Auto-approve all checkpoints

---

## Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Engineering Lead | | | ☐ |
| Product Owner | | | ☐ |
| QA Lead | | | ☐ |
| DevOps Lead | | | ☐ |

---

**Document Version**: 1.0
**Created**: November 27, 2025
**Last Updated**: November 27, 2025
**Owner**: Engineering Team
