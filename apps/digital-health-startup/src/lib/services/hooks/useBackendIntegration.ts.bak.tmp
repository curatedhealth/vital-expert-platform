/**
 * React Hooks for Backend Integration
 *
 * Provides easy-to-use hooks for all Phase 3-5 backend features
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { getBackendClient } from '../backend-integration-client'
import type {
  SearchRequest,
  SearchResponse,
  Evidence,
  RiskAssessment,
  ReviewQueueItem,
  AgentCompliance,
  ComplianceFramework
} from '../backend-integration-client'

const client = getBackendClient()

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useBackendIntegration() {
  return {
    search: useHybridSearch(),
    evidence: useEvidenceDetection(),
    hitl: useHITLQueue(),
    compliance: useCompliance(),
    session: useSession()
  }
}

// ============================================================================
// HYBRID SEARCH HOOK
// ============================================================================

export function useHybridSearch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [results, setResults] = useState<SearchResponse | null>(null)

  const search = useCallback(async (request: SearchRequest) => {
    setLoading(true)
    setError(null)

    try {
      const response = await client.searchAgents(request)
      setResults(response)
      return response
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Search failed')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const getRecommendations = useCallback(async (userId: string, limit = 10) => {
    try {
      return await client.getSearchRecommendations(userId, limit)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get recommendations')
      setError(error)
      throw error
    }
  }, [])

  return {
    search,
    getRecommendations,
    loading,
    error,
    results
  }
}

// ============================================================================
// SESSION HOOK
// ============================================================================

export function useSession(userId?: string) {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const getOrCreateSession = useCallback(async (uid: string) => {
    setLoading(true)
    try {
      const sess = await client.getOrCreateSession(uid)
      setSession(sess)
      return sess
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Session failed')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const recordSearch = useCallback(async (
    sessionId: string,
    query: string,
    results: any[],
    selectedAgentId?: string
  ) => {
    try {
      await client.recordSearch(sessionId, query, results, selectedAgentId)
    } catch (err) {
      console.error('Failed to record search:', err)
    }
  }, [])

  const getHistory = useCallback(async (sessionId: string, limit = 20) => {
    try {
      return await client.getSearchHistory(sessionId, limit)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get history')
      setError(error)
      throw error
    }
  }, [])

  // Auto-init session
  useEffect(() => {
    if (userId && !session) {
      getOrCreateSession(userId)
    }
  }, [userId, session, getOrCreateSession])

  return {
    session,
    loading,
    error,
    getOrCreateSession,
    recordSearch,
    getHistory
  }
}

// ============================================================================
// EVIDENCE DETECTION HOOK
// ============================================================================

export function useEvidenceDetection() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [evidence, setEvidence] = useState<Evidence[]>([])

  const detect = useCallback(async (
    text: string,
    minConfidence = 0.7,
    domains?: any[]
  ) => {
    setLoading(true)
    setError(null)

    try {
      const detected = await client.detectEvidence(text, minConfidence, domains)
      setEvidence(detected)
      return detected
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Detection failed')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const detectByDomain = useCallback(async (text: string, domain: any) => {
    return detect(text, 0.7, [domain])
  }, [detect])

  return {
    detect,
    detectByDomain,
    loading,
    error,
    evidence
  }
}

// ============================================================================
// HITL QUEUE HOOK
// ============================================================================

export function useHITLQueue() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [queue, setQueue] = useState<ReviewQueueItem[]>([])
  const [breached, setBreached] = useState<ReviewQueueItem[]>([])

  const getQueue = useCallback(async (
    status?: string,
    queueName?: string,
    limit = 50
  ) => {
    setLoading(true)
    setError(null)

    try {
      const items = await client.getReviewQueue(status, queueName, limit)
      setQueue(items)
      return items
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get queue')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const getBreachedItems = useCallback(async () => {
    try {
      const items = await client.getSLABreachedItems()
      setBreached(items)
      return items
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get breached items')
      setError(error)
      throw error
    }
  }, [])

  const createAssessment = useCallback(async (
    sessionId: string,
    userId: string,
    agentId: string,
    contentType: string,
    contentText: string,
    metadata?: Record<string, any>
  ): Promise<RiskAssessment> => {
    try {
      return await client.createRiskAssessment(
        sessionId,
        userId,
        agentId,
        contentType,
        contentText,
        metadata
      )
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create assessment')
      setError(error)
      throw error
    }
  }, [])

  const approve = useCallback(async (
    reviewId: string,
    reviewerId: string,
    notes?: string
  ) => {
    try {
      await client.approveReview(reviewId, reviewerId, notes)
      // Refresh queue
      await getQueue()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to approve')
      setError(error)
      throw error
    }
  }, [getQueue])

  const reject = useCallback(async (
    reviewId: string,
    reviewerId: string,
    reason: string,
    notes?: string
  ) => {
    try {
      await client.rejectReview(reviewId, reviewerId, reason, notes)
      // Refresh queue
      await getQueue()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to reject')
      setError(error)
      throw error
    }
  }, [getQueue])

  return {
    queue,
    breached,
    loading,
    error,
    getQueue,
    getBreachedItems,
    createAssessment,
    approve,
    reject
  }
}

// ============================================================================
// COMPLIANCE HOOK
// ============================================================================

export function useCompliance() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([])
  const [agentCompliance, setAgentCompliance] = useState<AgentCompliance[]>([])
  const [violations, setViolations] = useState<any[]>([])

  const getFrameworks = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const fw = await client.getComplianceFrameworks()
      setFrameworks(fw)
      return fw
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get frameworks')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const getAgentCompliance = useCallback(async (agentId: string) => {
    setLoading(true)
    setError(null)

    try {
      const compliance = await client.getAgentCompliance(agentId)
      setAgentCompliance(compliance)
      return compliance
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get compliance')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const getCompliantAgents = useCallback(async (frameworkCode: string) => {
    try {
      return await client.getCompliantAgents(frameworkCode)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get compliant agents')
      setError(error)
      throw error
    }
  }, [])

  const logEvent = useCallback(async (
    agentId: string | null,
    userId: string | null,
    sessionId: string | null,
    eventType: string,
    eventCategory: string,
    complianceTags: string[],
    action: string,
    description: string,
    riskLevel = 'low',
    metadata?: Record<string, any>
  ) => {
    try {
      return await client.logComplianceEvent(
        agentId,
        userId,
        sessionId,
        eventType,
        eventCategory,
        complianceTags,
        action,
        description,
        riskLevel,
        metadata
      )
    } catch (err) {
      console.error('Failed to log compliance event:', err)
    }
  }, [])

  const getAuditLog = useCallback(async (filters?: any, limit = 100) => {
    try {
      return await client.getComplianceAuditLog(filters, limit)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get audit log')
      setError(error)
      throw error
    }
  }, [])

  const getViolations = useCallback(async (limit = 50) => {
    try {
      const v = await client.getComplianceViolations(limit)
      setViolations(v)
      return v
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get violations')
      setError(error)
      throw error
    }
  }, [])

  // Auto-load frameworks on mount
  useEffect(() => {
    if (frameworks.length === 0) {
      getFrameworks()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    frameworks,
    agentCompliance,
    violations,
    loading,
    error,
    getFrameworks,
    getAgentCompliance,
    getCompliantAgents,
    logEvent,
    getAuditLog,
    getViolations
  }
}

// ============================================================================
// MONITORING HOOK
// ============================================================================

export function useMonitoring() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const getSearchMetrics = useCallback(async (timeRange: '1h' | '24h' | '7d' = '24h') => {
    setLoading(true)
    try {
      const m = await client.getSearchMetrics(timeRange)
      setMetrics((prev: any) => ({ ...prev, search: m }))
      return m
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get search metrics')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const getEvidenceMetrics = useCallback(async (timeRange: '1h' | '24h' | '7d' = '24h') => {
    try {
      const m = await client.getEvidenceMetrics(timeRange)
      setMetrics((prev: any) => ({ ...prev, evidence: m }))
      return m
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get evidence metrics')
      setError(error)
      throw error
    }
  }, [])

  const getHITLMetrics = useCallback(async () => {
    try {
      const m = await client.getHITLMetrics()
      setMetrics((prev: any) => ({ ...prev, hitl: m }))
      return m
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get HITL metrics')
      setError(error)
      throw error
    }
  }, [])

  const getComplianceSummary = useCallback(async () => {
    try {
      const m = await client.getComplianceSummary()
      setMetrics((prev: any) => ({ ...prev, compliance: m }))
      return m
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get compliance summary')
      setError(error)
      throw error
    }
  }, [])

  return {
    metrics,
    loading,
    error,
    getSearchMetrics,
    getEvidenceMetrics,
    getHITLMetrics,
    getComplianceSummary
  }
}
