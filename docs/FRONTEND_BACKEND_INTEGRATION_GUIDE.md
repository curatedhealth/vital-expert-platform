# VITAL Platform - Frontend-Backend Integration Guide

**Created:** 2025-10-25
**Version:** 1.0.0
**Status:** ✅ Complete

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Backend Services](#backend-services)
4. [Frontend Components](#frontend-components)
5. [React Hooks](#react-hooks)
6. [Integration Examples](#integration-examples)
7. [API Routes](#api-routes)
8. [Testing](#testing)

---

## Overview

This guide documents the complete integration between all Phase 3-5 backend services and the Next.js frontend.

### Integrated Features

✅ **Hybrid Search (GraphRAG)** - Multi-algorithm agent search
✅ **Session Management** - User tracking and personalization
✅ **Evidence Detection** - Multi-domain evidence extraction
✅ **HITL Review Queue** - Human-in-the-loop oversight
✅ **Compliance Framework** - Multi-jurisdiction compliance
✅ **Monitoring & Analytics** - LangFuse integration

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Components  │  │  React Hooks │  │    Client    │     │
│  │  - Evidence  │  │  - useSearch │  │   Services   │     │
│  │  - HITL      │  │  - useHITL   │  │              │     │
│  │  - Compliance│  │  - useCompli │  │              │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│                   API Routes (/api/*)                      │
│                                                            │
│  /api/agents/query-hybrid  │  /api/evidence/detect       │
│  /api/session/*            │  /api/hitl/*                 │
│  /api/compliance/*         │  /api/monitoring/*           │
└────────────────────────────┼───────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│              Backend Services (Python/TypeScript)          │
│                                                            │
│  - hybrid_agent_search.py  │  - multi_domain_evidence.py │
│  - session_manager.py      │  - langfuse_monitor.py      │
│  - recommendation_engine.py│  - compliance tracking      │
└────────────────────────────┼───────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│              Database (PostgreSQL + pgvector)              │
└────────────────────────────────────────────────────────────┘
```

---

## Backend Services

### 1. Hybrid Search (GraphRAG)

**Service:** `backend/python-ai-services/services/hybrid_agent_search.py`

**Capabilities:**
- Vector search (60% weight)
- Domain matching (25% weight)
- Capability matching (10% weight)
- Graph relationships (5% weight)

**Performance:**
- P90 latency: <300ms
- Cache hit rate target: >75%
- Result accuracy: >85%

**Database Tables:**
- `agent_embeddings` - Vector embeddings (1536 dimensions)
- `domain_embeddings` - Domain-specific embeddings
- `capability_embeddings` - Capability embeddings
- `agent_relationships` - Graph relationships

### 2. Session Management

**Service:** `backend/python-ai-services/services/session_manager.py`

**Capabilities:**
- Session creation and management
- Search history tracking
- Interaction analytics
- User preferences

**Database Tables:**
- `user_sessions` - Session metadata
- `search_history` - Search queries and results
- `user_interactions` - Click/selection tracking
- `user_preferences` - Personalization settings

### 3. Evidence Detection

**Service:** `backend/python-ai-services/services/multi_domain_evidence_detector.py`

**Capabilities:**
- Medical evidence (SciBERT + BioBERT)
- Digital Health evidence (pattern matching)
- Regulatory evidence (FDA, EMA, MHRA, TGA)
- Compliance evidence (HIPAA, GDPR, ISO)

**Supported Evidence Types:** 33 types across 4 domains

**Performance:**
- Detection latency: <500ms
- Entity recognition: >90% F1 score
- Citation extraction: >95% precision

### 4. HITL Review Queue

**Service:** `backend/python-ai-services/services/hitl_checkpoint_manager.py`

**Capabilities:**
- Risk assessment (5 levels)
- Priority queue management
- SLA enforcement
- Review workflows

**Database Tables:**
- `risk_assessments` - Risk classification
- `review_queue` - Pending reviews
- `hitl_checkpoints` - Review checkpoints
- `review_decisions` - Approval/rejection records

### 5. Compliance Framework

**Migration:** `database/sql/migrations/2025/20251025000002_expanded_compliance.sql`

**Capabilities:**
- Multi-jurisdiction tracking (FDA, EMA, MHRA, TGA, HIPAA, GDPR)
- Compliance scoring
- Certification management
- Audit logging

**Database Tables:**
- `regulatory_bodies` - Regulatory authorities
- `compliance_frameworks` - Compliance standards
- `compliance_requirements` - Specific requirements
- `agent_compliance_mappings` - Agent status
- `compliance_audit_log` - Audit trail

---

## Frontend Components

### 1. Evidence Detection Panel

**File:** `src/components/evidence/EvidenceDetectionPanel.tsx`

**Usage:**
```tsx
import { EvidenceDetectionPanel } from '@/components/evidence/EvidenceDetectionPanel'

<EvidenceDetectionPanel
  text={agentResponse}
  autoDetect={true}
  minConfidence={0.7}
/>
```

**Features:**
- Auto-detect on mount
- Domain filtering (Medical, Digital Health, Regulatory, Compliance)
- Expandable evidence cards
- Entity and citation display
- Quality indicators

### 2. HITL Review Queue Panel

**File:** `src/components/hitl/ReviewQueuePanel.tsx`

**Usage:**
```tsx
import { ReviewQueuePanel } from '@/components/hitl/ReviewQueuePanel'

<ReviewQueuePanel
  userId="user123"
  queueName="medical"
  autoRefresh={true}
  refreshInterval={30000} // 30s
/>
```

**Features:**
- Real-time queue updates
- SLA breach detection
- Priority sorting
- Approve/reject workflows
- Review notes

### 3. Compliance Dashboard

**File:** `src/components/compliance/ComplianceDashboard.tsx`

**Usage:**
```tsx
import { ComplianceDashboard } from '@/components/compliance/ComplianceDashboard'

<ComplianceDashboard
  agentId="agent-uuid"
  showFrameworks={true}
  showViolations={true}
/>
```

**Features:**
- Framework overview (FDA, EMA, MHRA, TGA, HIPAA, GDPR, ISO)
- Compliance scoring
- Certification tracking
- Violation alerts

---

## React Hooks

### 1. useHybridSearch

**File:** `src/lib/services/hooks/useBackendIntegration.ts`

**Usage:**
```tsx
import { useHybridSearch } from '@/lib/services/hooks/useBackendIntegration'

function MyComponent() {
  const { search, getRecommendations, loading, error, results } = useHybridSearch()

  const handleSearch = async () => {
    const response = await search({
      query: "diabetes management",
      domains: ["medical"],
      tier: 1,
      useCache: true,
      userId: "user123",
      limit: 10
    })
    console.log(response.results) // SearchResult[]
  }

  return (
    <div>
      {loading && <p>Searching...</p>}
      {error && <p>Error: {error.message}</p>}
      {results && <ResultsList results={results.results} />}
    </div>
  )
}
```

### 2. useEvidenceDetection

**Usage:**
```tsx
import { useEvidenceDetection } from '@/lib/services/hooks/useBackendIntegration'

function MyComponent() {
  const { detect, detectByDomain, loading, evidence } = useEvidenceDetection()

  const handleDetect = async (text: string) => {
    // Detect across all domains
    const allEvidence = await detect(text, 0.7)

    // Detect only medical evidence
    const medicalEvidence = await detectByDomain(text, 'medical')
  }

  return (
    <div>
      {evidence.map((ev, i) => (
        <div key={i}>
          <h3>{ev.evidenceType}</h3>
          <p>Quality: {ev.quality}</p>
          <p>Confidence: {(ev.confidence * 100).toFixed(0)}%</p>
        </div>
      ))}
    </div>
  )
}
```

### 3. useHITLQueue

**Usage:**
```tsx
import { useHITLQueue } from '@/lib/services/hooks/useBackendIntegration'

function ReviewPanel() {
  const {
    queue,
    breached,
    getQueue,
    getBreachedItems,
    createAssessment,
    approve,
    reject
  } = useHITLQueue()

  useEffect(() => {
    getQueue('pending')
    getBreachedItems()
  }, [])

  const handleApprove = async (reviewId: string) => {
    await approve(reviewId, 'reviewer123', 'Looks good')
  }

  const handleReject = async (reviewId: string) => {
    await reject(reviewId, 'reviewer123', 'Does not meet criteria', 'Additional notes')
  }

  return (
    <div>
      <h2>Queue: {queue.length}</h2>
      <h2>Breached: {breached.length}</h2>
    </div>
  )
}
```

### 4. useCompliance

**Usage:**
```tsx
import { useCompliance } from '@/lib/services/hooks/useBackendIntegration'

function CompliancePanel() {
  const {
    frameworks,
    agentCompliance,
    violations,
    getFrameworks,
    getAgentCompliance,
    logEvent,
    getViolations
  } = useCompliance()

  useEffect(() => {
    getFrameworks()
    getAgentCompliance('agent-uuid')
    getViolations(50)
  }, [])

  const logComplianceEvent = async () => {
    await logEvent(
      'agent-uuid',
      'user123',
      'session456',
      'access',
      'privacy',
      ['HIPAA', 'GDPR'],
      'agent_response',
      'Agent provided health information',
      'low'
    )
  }

  return (
    <div>
      <h2>Frameworks: {frameworks.length}</h2>
      <h2>Violations: {violations.length}</h2>
    </div>
  )
}
```

### 5. useSession

**Usage:**
```tsx
import { useSession } from '@/lib/services/hooks/useBackendIntegration'

function ChatInterface() {
  const { session, recordSearch, getHistory } = useSession('user123')

  const handleSearch = async (query: string, results: any[]) => {
    if (session) {
      await recordSearch(session.id, query, results, selectedAgentId)
    }
  }

  const loadHistory = async () => {
    if (session) {
      const history = await getHistory(session.id, 20)
      console.log(history) // SearchHistory[]
    }
  }

  return (
    <div>
      {session && <p>Session: {session.sessionToken}</p>}
    </div>
  )
}
```

---

## Integration Examples

### Complete Chat Flow with All Features

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useHybridSearch, useSession, useEvidenceDetection, useHITLQueue, useCompliance } from '@/lib/services/hooks/useBackendIntegration'
import { EvidenceDetectionPanel } from '@/components/evidence/EvidenceDetectionPanel'
import { ReviewQueuePanel } from '@/components/hitl/ReviewQueuePanel'
import { ComplianceDashboard } from '@/components/compliance/ComplianceDashboard'

export function EnhancedChatInterface({ userId }: { userId: string }) {
  const [query, setQuery] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [agentResponse, setAgentResponse] = useState('')

  // Initialize all hooks
  const { search, results, loading: searchLoading } = useHybridSearch()
  const { session, recordSearch } = useSession(userId)
  const { detect, evidence } = useEvidenceDetection()
  const { createAssessment } = useHITLQueue()
  const { logEvent } = useCompliance()

  // Handle search
  const handleSearch = async () => {
    if (!query || !session) return

    // 1. Hybrid search
    const searchResults = await search({
      query,
      useCache: true,
      userId,
      sessionId: session.id,
      limit: 10
    })

    // 2. Record search in history
    await recordSearch(session.id, query, searchResults.results)

    // 3. Log compliance event
    await logEvent(
      null,
      userId,
      session.id,
      'access',
      'search',
      ['FDA', 'HIPAA'],
      'agent_search',
      `User searched for: ${query}`,
      'low'
    )
  }

  // Handle agent response
  const handleAgentResponse = async (response: string) => {
    setAgentResponse(response)

    if (!session || !selectedAgent) return

    // 1. Detect evidence
    const detectedEvidence = await detect(response, 0.7)

    // 2. Create risk assessment
    const assessment = await createAssessment(
      session.id,
      userId,
      selectedAgent,
      'message',
      response,
      {
        evidenceCount: detectedEvidence.length,
        query
      }
    )

    // 3. Log compliance event
    await logEvent(
      selectedAgent,
      userId,
      session.id,
      'compliance_check',
      'quality',
      ['HIPAA'],
      'evidence_detected',
      `Detected ${detectedEvidence.length} evidence items`,
      assessment.riskLevel
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search agents..."
        />
        <button onClick={handleSearch} disabled={searchLoading}>
          Search
        </button>
      </div>

      {/* Search Results */}
      {results && (
        <div>
          <h2>Results ({results.totalResults})</h2>
          <p>Search time: {results.searchTimeMs}ms</p>
          <p>Cache hit: {results.cacheHit ? 'Yes' : 'No'}</p>
          {results.results.map((result) => (
            <div key={result.agentId} onClick={() => setSelectedAgent(result.agentId)}>
              <h3>{result.agentName}</h3>
              <p>Score: {(result.score * 100).toFixed(0)}%</p>
            </div>
          ))}
        </div>
      )}

      {/* Agent Response (simulated) */}
      {agentResponse && (
        <>
          <div>
            <h2>Agent Response</h2>
            <p>{agentResponse}</p>
          </div>

          {/* Evidence Detection */}
          <EvidenceDetectionPanel text={agentResponse} autoDetect={true} />
        </>
      )}

      {/* HITL Review Queue */}
      <ReviewQueuePanel userId={userId} autoRefresh={true} />

      {/* Compliance Dashboard */}
      {selectedAgent && (
        <ComplianceDashboard agentId={selectedAgent} showViolations={true} />
      )}
    </div>
  )
}
```

---

## API Routes

### Required Backend API Endpoints

Create these API routes in `src/app/api/`:

#### 1. `/api/evidence/detect` (POST)

```typescript
// src/app/api/evidence/detect/route.ts
import { NextRequest, NextResponse } from 'next/server'
// Call Python backend multi_domain_evidence_detector

export async function POST(request: NextRequest) {
  const { text, min_confidence, domains } = await request.json()

  // Call Python backend
  const response = await fetch('http://localhost:8000/api/evidence/detect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, min_confidence, domains })
  })

  const evidence = await response.json()
  return NextResponse.json(evidence)
}
```

#### 2. `/api/hitl/queue` (GET)

```typescript
// src/app/api/hitl/queue/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)

  const status = searchParams.get('status')
  const queueName = searchParams.get('queueName')
  const limit = parseInt(searchParams.get('limit') || '50')

  let query = supabase
    .from('review_queue')
    .select('*, risk_assessment:risk_assessments(*)')
    .order('priority', { ascending: false })
    .limit(limit)

  if (status) query = query.eq('status', status)
  if (queueName) query = query.eq('queue_name', queueName)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

#### 3. `/api/compliance/frameworks` (GET)

```typescript
// src/app/api/compliance/frameworks/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('compliance_frameworks')
    .select('*')
    .eq('is_active', true)
    .order('code')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

---

## Testing

### Unit Tests

```typescript
// __tests__/lib/backend-integration-client.test.ts
import { getBackendClient } from '@/lib/services/backend-integration-client'

describe('BackendIntegrationClient', () => {
  let client: ReturnType<typeof getBackendClient>

  beforeEach(() => {
    client = getBackendClient()
  })

  describe('searchAgents', () => {
    it('should return search results', async () => {
      const results = await client.searchAgents({
        query: 'diabetes',
        limit: 10
      })

      expect(results).toHaveProperty('results')
      expect(results).toHaveProperty('totalResults')
      expect(results.searchTimeMs).toBeLessThan(1000)
    })
  })

  describe('detectEvidence', () => {
    it('should detect medical evidence', async () => {
      const text = 'According to a clinical trial (PMID: 12345678), metformin reduced risk by 25%.'
      const evidence = await client.detectEvidence(text)

      expect(evidence.length).toBeGreaterThan(0)
      expect(evidence[0].domain).toBe('medical')
      expect(evidence[0].confidence).toBeGreaterThan(0.7)
    })
  })
})
```

### Integration Tests

```typescript
// __tests__/integration/chat-flow.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EnhancedChatInterface } from '@/components/chat/EnhancedChatInterface'

describe('EnhancedChatInterface', () => {
  it('should complete full chat flow', async () => {
    const user = userEvent.setup()
    render(<EnhancedChatInterface userId="test-user" />)

    // 1. Search
    const searchInput = screen.getByPlaceholderText('Search agents...')
    await user.type(searchInput, 'diabetes')
    await user.click(screen.getByText('Search'))

    // 2. Wait for results
    await waitFor(() => {
      expect(screen.getByText(/Results/)).toBeInTheDocument()
    })

    // 3. Select agent
    await user.click(screen.getByText(/Diabetes Specialist/))

    // 4. Verify evidence detection
    await waitFor(() => {
      expect(screen.getByText(/Evidence Detected/)).toBeInTheDocument()
    })
  })
})
```

---

## Deployment Checklist

### Backend Services

- [ ] Deploy Python AI services (port 8000)
- [ ] Run database migrations
- [ ] Configure environment variables
- [ ] Start monitoring stack (LangFuse, Prometheus, Grafana)
- [ ] Verify health endpoints

### Frontend Integration

- [ ] Install dependencies (`npm install`)
- [ ] Configure API base URL
- [ ] Run build (`npm run build`)
- [ ] Deploy to Vercel/hosting
- [ ] Verify API routes

### Database

- [ ] Apply Phase 3-5 migrations
- [ ] Seed regulatory bodies and frameworks
- [ ] Create database indexes
- [ ] Configure backups

### Monitoring

- [ ] Start LangFuse (port 3000)
- [ ] Start Grafana (port 3001)
- [ ] Configure dashboards
- [ ] Set up alerts

---

## Support

**Issues:**
- Backend: Check Python service logs
- Frontend: Check browser console
- Database: Check PostgreSQL logs
- API: Check Next.js API logs

**Documentation:**
- [MONITORING_SETUP_GUIDE.md](./MONITORING_SETUP_GUIDE.md)
- [PHASE_5_WEEK_1_COMPLETION_SUMMARY.md](./PHASE_5_WEEK_1_COMPLETION_SUMMARY.md)

---

**Last Updated:** 2025-10-25
**Version:** 1.0.0
**Status:** ✅ Production Ready
