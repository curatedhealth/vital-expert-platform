/**
 * Comprehensive Backend Integration Client
 *
 * Provides typed frontend access to all Phase 3-5 backend services:
 * - Hybrid Search (GraphRAG)
 * - Session Management & Personalization
 * - Evidence Detection (Multi-Domain)
 * - HITL Review Queue
 * - Compliance & Audit
 * - Monitoring (LangFuse)
 *
 * Created: 2025-10-25
 * Phase: Frontend Integration
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

// Search Types
export interface SearchRequest {
  query: string
  domains?: string[]
  capabilities?: string[]
  tier?: number | null
  useCache?: boolean
  userId?: string
  sessionId?: string
  limit?: number
  offset?: number
}

export interface SearchResult {
  agentId: string
  agentName: string
  score: number
  scores: {
    vector: number
    domain: number
    capability: number
    graph: number
  }
  reasoning: string
  capabilities: string[]
  tier: number
}

export interface SearchResponse {
  query: string
  results: SearchResult[]
  totalResults: number
  searchTimeMs: number
  cacheHit: boolean
  metadata: {
    vectorMatches: number
    domainMatches: number
    capabilityMatches: number
    graphMatches: number
  }
}

// Session Types
export interface UserSession {
  id: string
  userId: string
  sessionToken: string
  isActive: boolean
  totalSearches: number
  totalInteractions: number
  avgSearchScore: number
  createdAt: string
  expiresAt: string
}

export interface SearchHistory {
  id: string
  sessionId: string
  query: string
  selectedAgentId: string | null
  resultsCount: number
  timeToSelectionMs: number | null
  createdAt: string
}

export interface AgentRecommendation {
  agentId: string
  agentName: string
  score: number
  algorithm: string
  reasoning: string
  metadata: Record<string, any>
}

// Evidence Types
export type EvidenceDomain = 'medical' | 'digital_health' | 'regulatory' | 'compliance'

export interface Evidence {
  domain: EvidenceDomain
  evidenceType: string
  text: string
  quality: 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW'
  confidence: number
  entities: Array<{
    text: string
    entityType: string
    domain: EvidenceDomain
    confidence: number
  }>
  citations: Array<{
    citationType: string
    value: string
    source?: string
    year?: number
  }>
  reasoning: string
  metadata: Record<string, any>
}

// HITL Types
export interface RiskAssessment {
  id: string
  sessionId: string
  userId: string
  agentId: string
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'minimal'
  riskCategory: string
  riskScore: number
  riskFactors: Record<string, any>
  requiresReview: boolean
  autoApproved: boolean
  autoRejected: boolean
  contentType: string
  contentText: string
  assessedAt: string
}

export interface ReviewQueueItem {
  id: string
  riskAssessmentId: string
  sessionId: string
  userId: string
  agentId: string
  priority: number
  queueName: string
  assignedTo: string | null
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'escalated'
  reviewType: 'safety' | 'accuracy' | 'compliance' | 'quality'
  slaMinutes: number
  slaBreached: boolean
  createdAt: string
  reviewedAt: string | null
}

// Compliance Types
export interface ComplianceFramework {
  id: string
  code: string
  name: string
  fullName: string
  frameworkType: 'privacy' | 'security' | 'quality' | 'safety' | 'medical' | 'data_protection'
  applicableRegions: string[]
  certificationRequired: boolean
}

export interface AgentCompliance {
  agentId: string
  frameworkCode: string
  frameworkName: string
  complianceStatus: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable' | 'pending_review'
  complianceScore: number | null
  isCertified: boolean
  certificationExpiry: string | null
  nextAssessmentDue: string | null
  gapsCount: number
}

export interface ComplianceAuditEvent {
  id: string
  agentId: string | null
  userId: string | null
  sessionId: string | null
  eventType: string
  eventCategory: string
  complianceTags: string[]
  action: string
  description: string
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'minimal' | null
  compliant: boolean
  occurredAt: string
}

// ============================================================================
// BACKEND INTEGRATION CLIENT
// ============================================================================

export class BackendIntegrationClient {
  private baseUrl: string
  private supabase = createClient()

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  // ==========================================================================
  // HYBRID SEARCH (GraphRAG)
  // ==========================================================================

  /**
   * Perform hybrid search across agents
   */
  async searchAgents(request: SearchRequest): Promise<SearchResponse> {
    const response = await fetch(`${this.baseUrl}/agents/query-hybrid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get search recommendations based on user history
   */
  async getSearchRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<AgentRecommendation[]> {
    const { data, error } = await this.supabase
      .rpc('get_personalized_recommendations', {
        p_user_id: userId,
        p_limit: limit
      })

    if (error) throw error
    return data || []
  }

  // ==========================================================================
  // SESSION MANAGEMENT
  // ==========================================================================

  /**
   * Create or get active session
   */
  async getOrCreateSession(userId: string): Promise<UserSession> {
    const { data, error } = await this.supabase
      .rpc('get_or_create_session', {
        p_user_id: userId,
        p_session_duration_hours: 24
      })

    if (error) throw error
    return data
  }

  /**
   * Record search interaction
   */
  async recordSearch(
    sessionId: string,
    query: string,
    results: SearchResult[],
    selectedAgentId?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('search_history')
      .insert({
        session_id: sessionId,
        query,
        results_count: results.length,
        selected_agent_id: selectedAgentId,
        created_at: new Date().toISOString()
      })

    if (error) throw error
  }

  /**
   * Get session analytics
   */
  async getSessionAnalytics(sessionId: string): Promise<any> {
    const { data, error } = await this.supabase
      .rpc('get_session_analytics', { p_session_id: sessionId })

    if (error) throw error
    return data
  }

  /**
   * Get search history
   */
  async getSearchHistory(
    sessionId: string,
    limit: number = 20
  ): Promise<SearchHistory[]> {
    const { data, error } = await this.supabase
      .from('search_history')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  // ==========================================================================
  // EVIDENCE DETECTION
  // ==========================================================================

  /**
   * Detect evidence in text across all domains
   */
  async detectEvidence(
    text: string,
    minConfidence: number = 0.7,
    domains?: EvidenceDomain[]
  ): Promise<Evidence[]> {
    const response = await fetch(`${this.baseUrl}/evidence/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        min_confidence: minConfidence,
        domains
      })
    })

    if (!response.ok) {
      throw new Error(`Evidence detection failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get evidence by domain
   */
  async getEvidenceByDomain(
    text: string,
    domain: EvidenceDomain
  ): Promise<Evidence[]> {
    return this.detectEvidence(text, 0.7, [domain])
  }

  // ==========================================================================
  // HITL REVIEW QUEUE
  // ==========================================================================

  /**
   * Create risk assessment
   */
  async createRiskAssessment(
    sessionId: string,
    userId: string,
    agentId: string,
    contentType: string,
    contentText: string,
    metadata?: Record<string, any>
  ): Promise<RiskAssessment> {
    const { data, error } = await this.supabase
      .rpc('create_risk_assessment', {
        p_session_id: sessionId,
        p_user_id: userId,
        p_agent_id: agentId,
        p_content_type: contentType,
        p_content_text: contentText,
        p_metadata: metadata || {}
      })

    if (error) throw error
    return data
  }

  /**
   * Get review queue items
   */
  async getReviewQueue(
    status?: string,
    queueName?: string,
    limit: number = 50
  ): Promise<ReviewQueueItem[]> {
    let query = this.supabase
      .from('review_queue')
      .select(`
        *,
        risk_assessment:risk_assessments(*)
      `)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    if (queueName) {
      query = query.eq('queue_name', queueName)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  /**
   * Get SLA breached items
   */
  async getSLABreachedItems(): Promise<ReviewQueueItem[]> {
    const { data, error } = await this.supabase
      .from('review_queue')
      .select('*')
      .eq('sla_breached', true)
      .in('status', ['pending', 'in_review'])
      .order('priority', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Approve review item
   */
  async approveReview(
    reviewId: string,
    reviewerId: string,
    notes?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .rpc('approve_review', {
        p_review_id: reviewId,
        p_reviewer_id: reviewerId,
        p_notes: notes
      })

    if (error) throw error
  }

  /**
   * Reject review item
   */
  async rejectReview(
    reviewId: string,
    reviewerId: string,
    reason: string,
    notes?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .rpc('reject_review', {
        p_review_id: reviewId,
        p_reviewer_id: reviewerId,
        p_reason: reason,
        p_notes: notes
      })

    if (error) throw error
  }

  // ==========================================================================
  // COMPLIANCE
  // ==========================================================================

  /**
   * Get compliance frameworks
   */
  async getComplianceFrameworks(): Promise<ComplianceFramework[]> {
    const { data, error } = await this.supabase
      .from('compliance_frameworks')
      .select('*')
      .eq('is_active', true)
      .order('code')

    if (error) throw error
    return data || []
  }

  /**
   * Get agent compliance status
   */
  async getAgentCompliance(agentId: string): Promise<AgentCompliance[]> {
    const { data, error } = await this.supabase
      .rpc('get_agent_compliance_status', { p_agent_id: agentId })

    if (error) throw error
    return data || []
  }

  /**
   * Get compliant agents by framework
   */
  async getCompliantAgents(frameworkCode: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .rpc('get_compliant_agents', { p_framework_code: frameworkCode })

    if (error) throw error
    return data || []
  }

  /**
   * Log compliance event
   */
  async logComplianceEvent(
    agentId: string | null,
    userId: string | null,
    sessionId: string | null,
    eventType: string,
    eventCategory: string,
    complianceTags: string[],
    action: string,
    description: string,
    riskLevel: string = 'low',
    metadata?: Record<string, any>
  ): Promise<string> {
    const { data, error } = await this.supabase
      .rpc('log_compliance_event', {
        p_agent_id: agentId,
        p_user_id: userId,
        p_session_id: sessionId,
        p_event_type: eventType,
        p_event_category: eventCategory,
        p_compliance_tags: JSON.stringify(complianceTags),
        p_action: action,
        p_description: description,
        p_actor_id: userId || 'system',
        p_actor_type: userId ? 'user' : 'system',
        p_risk_level: riskLevel,
        p_metadata: metadata || {}
      })

    if (error) throw error
    return data
  }

  /**
   * Get compliance audit log
   */
  async getComplianceAuditLog(
    filters?: {
      agentId?: string
      userId?: string
      sessionId?: string
      complianceTags?: string[]
      eventType?: string
      startDate?: string
      endDate?: string
    },
    limit: number = 100
  ): Promise<ComplianceAuditEvent[]> {
    let query = this.supabase
      .from('compliance_audit_log')
      .select('*')
      .order('occurred_at', { ascending: false })
      .limit(limit)

    if (filters?.agentId) query = query.eq('agent_id', filters.agentId)
    if (filters?.userId) query = query.eq('user_id', filters.userId)
    if (filters?.sessionId) query = query.eq('session_id', filters.sessionId)
    if (filters?.eventType) query = query.eq('event_type', filters.eventType)
    if (filters?.startDate) query = query.gte('occurred_at', filters.startDate)
    if (filters?.endDate) query = query.lte('occurred_at', filters.endDate)

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  /**
   * Get compliance violations
   */
  async getComplianceViolations(
    limit: number = 50
  ): Promise<ComplianceAuditEvent[]> {
    const { data, error } = await this.supabase
      .from('compliance_audit_log')
      .select('*')
      .eq('compliant', false)
      .order('occurred_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  // ==========================================================================
  // MONITORING & ANALYTICS
  // ==========================================================================

  /**
   * Get search performance metrics
   */
  async getSearchMetrics(timeRange: '1h' | '24h' | '7d' = '24h'): Promise<any> {
    const { data, error } = await this.supabase
      .rpc('get_search_performance_metrics', {
        p_time_range: timeRange
      })

    if (error) throw error
    return data
  }

  /**
   * Get evidence detection metrics
   */
  async getEvidenceMetrics(timeRange: '1h' | '24h' | '7d' = '24h'): Promise<any> {
    const { data, error } = await this.supabase
      .rpc('get_evidence_detection_metrics', {
        p_time_range: timeRange
      })

    if (error) throw error
    return data
  }

  /**
   * Get HITL queue metrics
   */
  async getHITLMetrics(): Promise<any> {
    const { data, error } = await this.supabase
      .rpc('get_hitl_queue_metrics')

    if (error) throw error
    return data
  }

  /**
   * Get compliance summary
   */
  async getComplianceSummary(): Promise<any> {
    const { data, error } = await this.supabase
      .from('v_agent_compliance_summary')
      .select('*')
      .order('avg_compliance_score', { ascending: false })

    if (error) throw error
    return data || []
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let backendClient: BackendIntegrationClient | null = null

export function getBackendClient(): BackendIntegrationClient {
  if (!backendClient) {
    backendClient = new BackendIntegrationClient()
  }
  return backendClient
}

// ============================================================================
// REACT HOOKS
// ============================================================================
// TODO: Implement these React hooks when needed
// export { useBackendIntegration } from './hooks/useBackendIntegration'
// export { useHybridSearch } from './hooks/useHybridSearch'
// export { useEvidenceDetection } from './hooks/useEvidenceDetection'
// export { useHITLQueue } from './hooks/useHITLQueue'
// export { useCompliance } from './hooks/useCompliance'
