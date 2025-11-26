# 🎭 ASK PANEL USER JOURNEY MOCKUP
## Complete End-to-End User Flows

**Document Version:** 1.0  
**Date:** November 2, 2025  
**Location:** `/apps/digital-health-startup/src/app/(app)/ask-panel/`

---

## 📋 TABLE OF CONTENTS

1. [User Context & Authentication](#user-context--authentication)
2. [Journey 1: First-Time User - Creating a Panel](#journey-1-first-time-user---creating-a-panel)
3. [Journey 2: Power User - Custom Panel Creation](#journey-2-power-user---custom-panel-creation)
4. [Journey 3: Consulting an Active Panel](#journey-3-consulting-an-active-panel)
5. [Journey 4: Real-Time Panel Streaming](#journey-4-real-time-panel-streaming)
6. [Journey 5: Panel History & Analytics](#journey-5-panel-history--analytics)
7. [Journey 6: Sidebar Navigation](#journey-6-sidebar-navigation)
8. [Backend Integration Points](#backend-integration-points)
9. [State Management Flow](#state-management-flow)
10. [Error Handling & Edge Cases](#error-handling--edge-cases)

---

## 🔐 USER CONTEXT & AUTHENTICATION

### Current Implementation
```typescript
// Available via useAuth() hook
{
  user: {
    id: "uuid-v4",           // Supabase user ID
    email: "user@example.com"
  },
  userProfile: {
    role: "user" | "admin" | "super_admin"
  }
}

// Available via useTenantContext() hook
{
  currentTenant: {
    id: "uuid-v4",           // Tenant ID
    name: "Acme Pharma",
    slug: "acme-pharma",
    settings: { ... }
  },
  userRole: "owner" | "admin" | "member"
}
```

### Required Headers for Backend
```typescript
{
  'X-Tenant-ID': currentTenant.id,
  'X-User-ID': user.id,
  'Authorization': `Bearer ${session.access_token}`,
  'Content-Type': 'application/json'
}
```

---

## 🎯 JOURNEY 1: FIRST-TIME USER - CREATING A PANEL

### Step 1: Landing on Ask Panel Page
**URL:** `/ask-panel`  
**State:** No active panels, empty sidebar

```
┌────────────────────────────────────────────────────────────┐
│ SIDEBAR (Collapsed)      │  MAIN CONTENT AREA              │
├────────────────────────────────────────────────────────────┤
│                          │  🏛️ Select Board Archetype       │
│  [≡] Menu               │                                  │
│                          │  Choose the type of advisory    │
│  [+] New                │  board that best fits your       │
│                          │  decision-making needs          │
│  [👥] Panels            │                                  │
│                          │  ┌──────┐ ┌──────┐ ┌──────┐   │
│  [🔍] Search            │  │ SAB  │ │ CAB  │ │Market│   │
│                          │  │ 🧬   │ │ 🏥   │ │ 💰   │   │
│                          │  └──────┘ └──────┘ └──────┘   │
│                          │  ┌──────┐ ┌──────┐ ┌──────┐   │
│                          │  │Ethics│ │Innov │ │ Risk │   │
│                          │  │ ⚖️    │ │ 💡   │ │ 🛡️   │   │
│                          │  └──────┘ └──────┘ └──────┘   │
└────────────────────────────────────────────────────────────┘
```

**User Action:** Click "Scientific Advisory Board (SAB)"

**Frontend Logic:**
```typescript
const handleArchetypeSelection = (archetype: BoardArchetype) => {
  setSelectedArchetype(archetype);
  // No backend call yet - just UI state
};
```

---

### Step 2: Selecting Fusion Model
**State:** Archetype selected (SAB)

```
┌────────────────────────────────────────────────────────────┐
│ SIDEBAR                  │  MAIN CONTENT AREA              │
├────────────────────────────────────────────────────────────┤
│                          │  🤝 Select Fusion Model         │
│  [≡] Advisory Panels     │                                  │
│                          │  Choose how humans and AI       │
│  [Search...]            │  collaborate in your advisory    │
│                          │  board                          │
│  [+ New Advisory Panel] │                                  │
│                          │  ┌───────┐ ┌───────┐ ┌───────┐│
│  📊 Quick Start          │  │Human  │ │Agent  │ │Symbi- ││
│     Templates            │  │Led    │ │Facil. │ │otic   ││
│                          │  │ 👤    │ │ 🤖    │ │ 🤝    ││
│     (No panels yet)      │  │✓ SELECTED │       │       ││
│                          │  └───────┘ └───────┘ └───────┘│
└────────────────────────────────────────────────────────────┘
```

**User Action:** Click "Symbiotic" (default recommended)

**Frontend Logic:**
```typescript
const handleFusionModelSelection = (model: FusionModel) => {
  setSelectedFusionModel(model);
  // Still no backend call - preparing panel config
};
```

---

### Step 3: Domain Selection
**State:** Archetype (SAB) + Fusion Model (Symbiotic) selected

```
┌────────────────────────────────────────────────────────────┐
│ SIDEBAR                  │  MAIN CONTENT AREA              │
├────────────────────────────────────────────────────────────┤
│                          │  ⭐ Select Panel Domain         │
│  [≡] Advisory Panels     │                                  │
│                          │  [All Domains] → ...            │
│  [Search...]            │                                  │
│                          │  Choose your area of focus      │
│  [+ New Advisory Panel] │                                  │
│                          │  ┌──────────────────────────┐  │
│  📊 Quick Start          │  │ 🧬 Regulatory Affairs    │  │
│     Templates            │  │ FDA guidance, strategy   │  │
│                          │  │ 5 subdomains →           │  │
│  • Regulatory Advisory   │  └──────────────────────────┘  │
│  • Clinical Trial Design │  ┌──────────────────────────┐  │
│  • Market Access         │  │ 🏥 Clinical Research     │  │
│  • Digital Health        │  │ Trial design, safety     │  │
│                          │  │ 3 subdomains →           │  │
│                          │  └──────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

**User Action:** Click "Regulatory Affairs"

---

### Step 4: Subdomain Selection
**State:** Domain (Regulatory Affairs) selected

```
┌────────────────────────────────────────────────────────────┐
│ SIDEBAR                  │  MAIN CONTENT AREA              │
├────────────────────────────────────────────────────────────┤
│                          │  [All Domains] → [🧬 Regulatory│
│  [≡] Advisory Panels     │   Affairs]                      │
│                          │                                  │
│  [Search...]            │  Select a subdomain to see       │
│                          │  specific use cases             │
│  [+ New Advisory Panel] │                                  │
│                          │  ┌──────────────────────────┐  │
│  📊 Quick Start          │  │ Regulatory Submissions   │  │
│     Templates            │  │ FDA, EMA, global         │  │
│                          │  │ 4 use cases →            │  │
│  🕐 Recent Panels        │  └──────────────────────────┘  │
│     (No panels yet)      │  ┌──────────────────────────┐  │
│                          │  │ Quality & Compliance     │  │
│                          │  │ QMS, ISO standards       │  │
│                          │  │ 4 use cases →            │  │
│                          │  └──────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

**User Action:** Click "Regulatory Submissions"

---

### Step 5: Use Case Selection & Panel Creation
**State:** Subdomain (Regulatory Submissions) selected

```
┌────────────────────────────────────────────────────────────┐
│ SIDEBAR                  │  MAIN CONTENT AREA              │
├────────────────────────────────────────────────────────────┤
│                          │  [All] → [🧬 Reg] → [Reg Sub]  │
│  [≡] Advisory Panels     │                                  │
│                          │  Regulatory Submissions         │
│  [Search...]            │  FDA, EMA, and global            │
│                          │  regulatory submissions         │
│  [+ New Advisory Panel] │                                  │
│                          │  ┌──────────────────────────┐  │
│  📊 Quick Start          │  │ 510(k) Clearance Strategy│  │
│     Templates            │  │          [Create Panel →]│  │
│                          │  └──────────────────────────┘  │
│  🕐 Recent Panels        │  ┌──────────────────────────┐  │
│     (Loading...)         │  │ PMA Submission Support   │  │
│                          │  │          [Create Panel →]│  │
│                          │  └──────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

**User Action:** Click "510(k) Clearance Strategy" → [Create Panel]

**Frontend Logic:**
```typescript
const handleUseCaseClick = async (useCase: UseCase) => {
  setIsLoading(true);
  
  try {
    // 1. Load matching agents from local agents-store
    const { agents } = useAgentsStore.getState();
    const matchedAgents = agents.filter(agent =>
      useCase.experts.some(expertTag =>
        agent.name.toLowerCase().includes(expertTag.toLowerCase()) ||
        agent.capabilities?.includes(expertTag)
      )
    );

    // 2. Create panel configuration
    const panelConfig = {
      name: useCase.name,
      description: `Expert panel for ${useCase.name}`,
      archetype: selectedArchetype,
      fusionModel: selectedFusionModel,
      domain: selectedDomain.id,
      subdomain: selectedSubdomain.id,
      useCase: useCase.id,
      members: matchedAgents.map(agent => ({
        agent,
        role: 'expert' as const,
        weight: 1
      })),
      configuration: {
        panel_type: 'structured',
        orchestration_mode: orchestrationMode,
        consensus_threshold: 0.7
      }
    };

    // 3. Call NEW BACKEND to create panel
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AI_ENGINE_URL}/api/v1/panels/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': currentTenant.id,
          'X-User-ID': user.id,
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          query: '', // Empty initially, user will add later
          panel_type: 'structured',
          configuration: panelConfig.configuration,
          agents: panelConfig.members.map(m => ({
            id: m.agent.id,
            name: m.agent.display_name,
            role: m.role,
            weight: m.weight
          }))
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create panel');
    }

    const createdPanel = await response.json();

    // 4. Update local state
    setPanelAgents(matchedAgents);
    setCurrentPanelId(createdPanel.id);
    setShowExpertPanelSelector(false);

    // 5. Navigate to panel consultation view
    // (stay on same page, but show consultation interface)

  } catch (error) {
    console.error('Failed to create panel:', error);
    toast.error('Failed to create panel. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

**Backend Call:**
```http
POST /api/v1/panels/
Headers:
  X-Tenant-ID: {tenant_id}
  X-User-ID: {user_id}
  Content-Type: application/json

Body:
{
  "query": "",
  "panel_type": "structured",
  "configuration": {
    "orchestration_mode": "parallel",
    "consensus_threshold": 0.7,
    "archetype": "SAB",
    "fusion_model": "symbiotic",
    "domain": "regulatory",
    "subdomain": "reg-submissions",
    "use_case": "fda-510k"
  },
  "agents": [
    {
      "id": "agent_123",
      "name": "Dr. Sarah Chen - Regulatory Strategist",
      "role": "expert",
      "weight": 1
    },
    // ... more agents
  ]
}

Response 201:
{
  "id": "panel_uuid",
  "tenant_id": "tenant_uuid",
  "user_id": "user_uuid",
  "query": "",
  "panel_type": "structured",
  "status": "created",
  "configuration": { ... },
  "agents": [ ... ],
  "created_at": "2025-11-02T10:00:00Z",
  "updated_at": "2025-11-02T10:00:00Z"
}
```

**Sidebar Updates:**
```typescript
// Sidebar now shows new panel in "Recent Panels"
```

---

## 🎯 JOURNEY 2: POWER USER - CUSTOM PANEL CREATION

### Step 1: Click "Create Custom Panel" Button
**Location:** Top-right header or sidebar

```
┌────────────────────────────────────────────────────────────┐
│ [🎭 Ask Panel]          │ [+ Create Custom Panel]         │
└────────────────────────────────────────────────────────────┘
```

**User Action:** Click "Create Custom Panel"

**Frontend Logic:**
```typescript
const handleCustomPanelClick = () => {
  setShowExpertPanelSelector(true);
  setSelectedDomain(null); // Bypass domain selection
  setSelectedUseCase(null);
};
```

---

### Step 2: Expert Panel Selector Modal Opens
**State:** Modal overlay displayed

```
┌────────────────────────────────────────────────────────────┐
│                      MODAL: Create Expert Panel            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [Search experts...]                    [Filter: All ▾]   │
│                                                            │
│  Available Experts (136):                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ☐ Dr. Sarah Chen - Regulatory Strategist          │  │
│  │    FDA 510(k), PMA, Clinical • Regulatory          │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ ☑ Dr. Michael Park - Clinical Trial Expert        │  │
│  │    Phase II/III, Protocol Design • Clinical        │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ ☑ Dr. Lisa Wang - Health Economist                │  │
│  │    HEOR, Pricing, Market Access • Commercial      │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  Selected: 2 experts                                       │
│  [Cancel]                         [Create Panel (2) →]    │
└────────────────────────────────────────────────────────────┘
```

**User Action:** 
1. Search/filter experts
2. Select 3-5 experts
3. Click "Create Panel"

**Frontend Logic:**
```typescript
const handleCreateExpertPanel = async (selectedExperts: Agent[]) => {
  setIsLoading(true);
  
  try {
    // Create panel with custom expert selection
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AI_ENGINE_URL}/api/v1/panels/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': currentTenant.id,
          'X-User-ID': user.id,
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          query: '',
          panel_type: 'open', // Custom panel type
          configuration: {
            orchestration_mode: orchestrationMode,
            consensus_threshold: 0.7,
            custom_selection: true
          },
          agents: selectedExperts.map(agent => ({
            id: agent.id,
            name: agent.display_name,
            role: 'expert',
            weight: 1
          }))
        })
      }
    );

    const createdPanel = await response.json();
    
    setPanelAgents(selectedExperts);
    setCurrentPanelId(createdPanel.id);
    setShowExpertPanelSelector(false);
    
  } catch (error) {
    console.error('Failed to create custom panel:', error);
    toast.error('Failed to create panel');
  } finally {
    setIsLoading(false);
  }
};
```

---

## 🎯 JOURNEY 3: CONSULTING AN ACTIVE PANEL

### Step 1: Panel Created - Consultation Interface Appears
**State:** Active panel with 3 experts loaded

```
┌────────────────────────────────────────────────────────────┐
│ SIDEBAR                  │  MAIN CONTENT AREA              │
├────────────────────────────────────────────────────────────┤
│                          │  🎭 Active Panel (3 Experts)    │
│  [≡] Advisory Panels     │                                  │
│                          │  ┌──────┐ ┌──────┐ ┌──────┐   │
│  [Search...]            │  │  SC  │ │  MP  │ │  LW  │   │
│                          │  │ 🧬   │ │ 🔬   │ │ 💰   │   │
│  [+ New Advisory Panel] │  │Sarah │ │Michael│ │Lisa  │   │
│                          │  └──────┘ └──────┘ └──────┘   │
│  ⭐ Quick Start          │                                  │
│     Templates            │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                          │                                  │
│  🕐 Recent Panels        │  💬 Consult Panel               │
│                          │                                  │
│  • ⚡ 510(k) Strategy    │  ⚙️ Orchestration Mode:         │
│    (Active NOW)          │  [Parallel Polling ▾]           │
│    3 experts             │  All experts respond            │
│    Just now              │  simultaneously                 │
│                          │                                  │
│                          │  ┌──────────────────────────┐  │
│                          │  │ Enter your question...   │  │
│                          │  │                          │  │
│                          │  └──────────────────────────┘  │
│                          │           [🚀 Ask Panel]       │
└────────────────────────────────────────────────────────────┘
```

**User Action:** Type question and click "Ask Panel"

**Example Question:**
```
"What regulatory pathway should we pursue for our AI-powered 
diagnostic tool that analyzes retinal images to detect 
diabetic retinopathy?"
```

---

### Step 2: Panel Consultation Submitted
**Frontend Logic:**
```typescript
const handleAskPanel = async () => {
  if (!query.trim() || !currentPanelId) return;
  
  setIsLoading(true);
  setStreamingResponses([]);
  
  try {
    // Execute panel with query
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AI_ENGINE_URL}/api/v1/panels/${currentPanelId}/execute`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': currentTenant.id,
          'X-User-ID': user.id,
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          query: query,
          stream: false // For now, no streaming
        })
      }
    );

    if (!response.ok) {
      throw new Error('Panel execution failed');
    }

    const result = await response.json();
    
    // Update UI with results
    setPanelResponse({
      question: query,
      recommendation: result.recommendation,
      consensus: result.consensus,
      expertResponses: result.expert_responses,
      timestamp: new Date()
    });
    
    setQuery(''); // Clear input
    
  } catch (error) {
    console.error('Panel consultation error:', error);
    toast.error('Failed to consult panel');
  } finally {
    setIsLoading(false);
  }
};
```

**Backend Call:**
```http
POST /api/v1/panels/{panel_id}/execute
Headers:
  X-Tenant-ID: {tenant_id}
  X-User-ID: {user_id}
  Content-Type: application/json

Body:
{
  "query": "What regulatory pathway should we pursue for our AI-powered diagnostic tool...",
  "stream": false
}

Response 200:
{
  "panel_id": "panel_uuid",
  "status": "completed",
  "query": "What regulatory pathway...",
  "recommendation": "Based on the panel's analysis, we recommend pursuing the FDA's De Novo classification pathway...",
  "consensus": {
    "consensus_level": 0.85,
    "agreement_points": [
      "De Novo pathway is most appropriate for novel AI/ML devices",
      "Strong clinical validation data required",
      "Post-market surveillance plan essential"
    ],
    "disagreement_points": [
      "Timeline estimates vary (12-18 months vs 18-24 months)"
    ],
    "key_themes": ["de novo", "clinical validation", "post-market"]
  },
  "expert_responses": [
    {
      "expert_id": "agent_123",
      "expert_name": "Dr. Sarah Chen",
      "content": "I strongly recommend the De Novo pathway...",
      "confidence": 0.9,
      "reasoning": "Based on FDA's recent AI/ML guidance..."
    },
    // ... more expert responses
  ],
  "created_at": "2025-11-02T10:05:30Z",
  "completed_at": "2025-11-02T10:06:15Z",
  "execution_time_ms": 45000
}
```

---

### Step 3: Results Displayed
**State:** Panel consultation complete

```
┌────────────────────────────────────────────────────────────┐
│ SIDEBAR                  │  MAIN CONTENT AREA              │
├────────────────────────────────────────────────────────────┤
│                          │  📋 Question:                    │
│  [≡] Advisory Panels     │  "What regulatory pathway       │
│                          │   should we pursue for our      │
│  [Search...]            │   AI-powered diagnostic tool..." │
│                          │                                  │
│  🕐 Recent Panels        │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                          │                                  │
│  • ⚡ 510(k) Strategy    │  ✅ Panel Recommendation         │
│    (Completed)           │  [85% agreement]                │
│    3 experts             │                                  │
│    2 mins ago            │  Based on the panel's analysis, │
│    1 consultation        │  we recommend pursuing the FDA's│
│                          │  De Novo classification pathway │
│  [View Results →]        │  for your AI-powered diagnostic │
│                          │  tool because:                  │
│                          │                                  │
│                          │  1. **Novel Device Class**: Your│
│                          │     AI/ML-based retinal image   │
│                          │     analyzer represents a new   │
│                          │     type of device...           │
│                          │                                  │
│                          │  [Show Expert Details ▾]        │
│                          │                                  │
│                          │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                          │                                  │
│                          │  💬 Ask Follow-up Question      │
│                          │  [What clinical data do we need?]│
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 JOURNEY 4: REAL-TIME PANEL STREAMING

### Enhanced UX with Server-Sent Events (SSE)

**Frontend Enhancement:**
```typescript
const handleAskPanelWithStreaming = async () => {
  setIsLoading(true);
  setStreamingState('connecting');
  
  try {
    // Establish SSE connection
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_AI_ENGINE_URL}/api/v1/panels/${currentPanelId}/stream?` +
      `query=${encodeURIComponent(query)}` +
      `&tenant_id=${currentTenant.id}` +
      `&user_id=${user.id}`
    );

    eventSource.addEventListener('expert_start', (e) => {
      const data = JSON.parse(e.data);
      // Show "Dr. Sarah is thinking..." indicator
      setActiveExpert(data.expert_name);
    });

    eventSource.addEventListener('expert_response', (e) => {
      const data = JSON.parse(e.data);
      // Stream expert response token by token
      setStreamingResponses(prev => [
        ...prev,
        {
          expertId: data.expert_id,
          expertName: data.expert_name,
          content: data.content,
          confidence: data.confidence
        }
      ]);
    });

    eventSource.addEventListener('consensus_update', (e) => {
      const data = JSON.parse(e.data);
      // Update consensus meter in real-time
      setConsensusLevel(data.consensus_level);
    });

    eventSource.addEventListener('panel_complete', (e) => {
      const data = JSON.parse(e.data);
      setPanelResponse(data);
      eventSource.close();
      setIsLoading(false);
      setStreamingState('complete');
    });

    eventSource.addEventListener('error', (e) => {
      console.error('SSE error:', e);
      eventSource.close();
      setIsLoading(false);
      setStreamingState('error');
      toast.error('Connection lost. Please try again.');
    });

  } catch (error) {
    console.error('Streaming error:', error);
    setIsLoading(false);
  }
};
```

**Visual During Streaming:**
```
┌────────────────────────────────────────────────────────────┐
│  🎭 Panel Discussion in Progress...                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ⚡ Dr. Sarah Chen is responding...                        │
│  ┌──────────────────────────────────────────────────────┐│
│  │ "I recommend the De Novo pathway because your device  ││
│  │  represents a novel classification. The FDA has       ││
│  │  established clear guidance for AI/ML-based           ││
│  │  diagnostics, and..." [typing indicator...]           ││
│  └──────────────────────────────────────────────────────┘│
│                                                            │
│  ⏳ Dr. Michael Park is analyzing...                       │
│  ┌──────────────────────────────────────────────────────┐│
│  │  [Waiting for response...]                            ││
│  └──────────────────────────────────────────────────────┘│
│                                                            │
│  📊 Consensus Meter: ▰▰▰▰▰▰▱▱▱▱ 65% (updating...)        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 JOURNEY 5: PANEL HISTORY & ANALYTICS

### Step 1: Viewing Panel History
**User Action:** Click on a completed panel in sidebar

```
┌────────────────────────────────────────────────────────────┐
│ SIDEBAR                  │  MAIN CONTENT AREA              │
├────────────────────────────────────────────────────────────┤
│                          │  📊 Panel Analytics             │
│  [≡] Advisory Panels     │                                  │
│                          │  510(k) Strategy Panel          │
│  [Search...]            │  Created 2 hours ago             │
│                          │                                  │
│  🕐 Recent Panels        │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                          │                                  │
│  • ✅ 510(k) Strategy    │  📈 Usage Statistics            │
│    (Completed)           │  • Consultations: 3             │
│    3 experts  [SELECTED] │  • Avg Consensus: 82%           │
│    2 hours ago           │  • Total Tokens: 15,234         │
│    3 consultations       │  • Cost: $0.47                  │
│                          │  • Avg Response Time: 12s       │
│  • ✅ Market Access      │                                  │
│    (Completed)           │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│    4 experts             │                                  │
│    Yesterday             │  📝 Consultation History        │
│    5 consultations       │                                  │
│                          │  1. "What regulatory pathway..." │
│  • 🔄 Clinical Trial     │     85% consensus               │
│    (Running)             │     [View Full Response]        │
│    5 experts             │                                  │
│    10 mins ago           │  2. "What clinical data..."     │
│    1 consultation        │     78% consensus               │
│                          │     [View Full Response]        │
│                          │                                  │
│                          │  3. "How should we structure..." │
│                          │     90% consensus               │
│                          │     [View Full Response]        │
│                          │                                  │
│                          │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                          │                                  │
│                          │  [Export All (PDF)] [Delete]   │
└────────────────────────────────────────────────────────────┘
```

**Backend Calls:**
```http
# Get panel details
GET /api/v1/panels/{panel_id}
Headers:
  X-Tenant-ID: {tenant_id}
  X-User-ID: {user_id}

Response 200:
{
  "id": "panel_uuid",
  "tenant_id": "tenant_uuid",
  "query": "What regulatory pathway...",
  "panel_type": "structured",
  "status": "completed",
  "configuration": { ... },
  "agents": [ ... ],
  "created_at": "2025-11-02T08:00:00Z",
  "completed_at": "2025-11-02T08:01:00Z",
  "metadata": {
    "total_consultations": 3,
    "avg_consensus": 0.82,
    "total_cost_usd": 0.47
  }
}

# Get panel responses
GET /api/v1/panels/{panel_id}/responses
Response 200:
{
  "responses": [
    {
      "id": "response_uuid",
      "agent_id": "agent_123",
      "agent_name": "Dr. Sarah Chen",
      "content": "...",
      "confidence_score": 0.9,
      "created_at": "2025-11-02T08:00:30Z"
    }
  ]
}

# Get consensus analysis
GET /api/v1/panels/{panel_id}/consensus
Response 200:
{
  "consensus": {
    "consensus_level": 0.85,
    "agreement_points": [ ... ],
    "disagreement_points": [ ... ],
    "recommendation": "..."
  }
}
```

---

## 🎯 JOURNEY 6: SIDEBAR NAVIGATION

### Enhanced Sidebar with New Features

```
┌─────────────────────────────────────────┐
│  [≡] ADVISORY PANELS                    │
├─────────────────────────────────────────┤
│                                         │
│  [🔍 Search panels...]                  │
│                                         │
│  [+ New Advisory Panel]                 │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                         │
│  ⭐ QUICK START TEMPLATES               │
│                                         │
│  • 🧬 Regulatory Advisory               │
│    FDA submissions & strategy           │
│    [Use Template]                       │
│                                         │
│  • 🔬 Clinical Trial Design             │
│    Protocol & endpoints                 │
│    [Use Template]                       │
│                                         │
│  • 💰 Market Access Advisory            │
│    Pricing & reimbursement              │
│    [Use Template]                       │
│                                         │
│  [View All Templates →]                 │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                         │
│  🕐 RECENT PANELS                       │
│                                         │
│  • ⚡ 510(k) Strategy                   │
│    [Active] 3 experts                   │
│    ┌─────────────────────────┐         │
│    │ 👤 👤 👤                │         │
│    └─────────────────────────┘         │
│    Just now • 1 consultation            │
│                                         │
│  • ✅ Market Access Board               │
│    [Completed] 4 experts                │
│    Yesterday • 5 consultations          │
│    📊 82% avg consensus                 │
│                                         │
│  • 🔄 Clinical Phase II                 │
│    [Running] 5 experts                  │
│    10 mins ago • In progress            │
│                                         │
│  [View All Panels →]                    │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                         │
│  📊 USAGE & ANALYTICS                   │
│                                         │
│  This Month:                            │
│  • 12 panels created                    │
│  • 47 consultations                     │
│  • $12.34 total cost                    │
│  • 85% avg consensus                    │
│                                         │
│  [View Detailed Analytics →]            │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                         │
│  ⚙️ SETTINGS                            │
│                                         │
│  • Panel Preferences                    │
│  • Expert Library                       │
│  • Billing & Usage                      │
│  • Team Management                      │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔌 BACKEND INTEGRATION POINTS

### API Endpoints to Implement

```typescript
// 1. Create Panel
POST /api/v1/panels/
Body: { query, panel_type, configuration, agents }
Returns: Panel object

// 2. Execute Panel (Synchronous)
POST /api/v1/panels/{panel_id}/execute
Body: { query, stream: false }
Returns: { recommendation, consensus, expert_responses }

// 3. Stream Panel (SSE)
GET /api/v1/panels/{panel_id}/stream?query=...&tenant_id=...&user_id=...
Returns: Server-Sent Events stream

// 4. Get Panel Details
GET /api/v1/panels/{panel_id}
Returns: Panel object with metadata

// 5. List Panels
GET /api/v1/panels/?status=active&limit=10
Returns: { panels: [], total: 123 }

// 6. Get Panel Responses
GET /api/v1/panels/{panel_id}/responses
Returns: { responses: [] }

// 7. Get Panel Consensus
GET /api/v1/panels/{panel_id}/consensus
Returns: { consensus: {...} }

// 8. Get Usage Analytics
GET /api/v1/analytics/usage?tenant_id=...&start_date=...&end_date=...
Returns: { total_panels, total_consultations, total_cost, ... }
```

---

## 📊 STATE MANAGEMENT FLOW

### Frontend State Architecture

```typescript
// Component State (page.tsx)
{
  // UI Navigation State
  selectedArchetype: BoardArchetype | null,
  selectedFusionModel: FusionModel,
  selectedDomain: Domain | null,
  selectedSubdomain: Subdomain | null,
  selectedUseCase: UseCase | null,
  
  // Panel State
  currentPanelId: UUID | null,
  panelAgents: Agent[],
  orchestrationMode: OrchestrationMode,
  
  // Consultation State
  query: string,
  isLoading: boolean,
  panelResponse: PanelResponse | null,
  
  // Streaming State
  streamingState: 'idle' | 'connecting' | 'streaming' | 'complete' | 'error',
  streamingResponses: StreamingResponse[],
  activeExpert: string | null,
  consensusLevel: number,
  
  // UI State
  showExpertPanelSelector: boolean,
  showExpertDetails: boolean
}

// Zustand Store (panel-store.ts) - TO BE ENHANCED
{
  panels: Panel[],           // List of all panels
  currentPanel: Panel | null, // Currently active panel
  templates: PanelTemplate[], // Available templates
  isLoading: boolean,
  error: string | null,
  
  // NEW METHODS TO ADD:
  createPanelFromBackend: (backendPanel) => void,
  syncPanelWithBackend: (panelId) => void,
  addConsultationToPanel: (panelId, consultation) => void,
  updatePanelAnalytics: (panelId, analytics) => void
}
```

---

## ⚠️ ERROR HANDLING & EDGE CASES

### 1. Network Errors
```typescript
try {
  const response = await fetch(...);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
} catch (error) {
  if (error instanceof TypeError) {
    // Network error (offline, DNS failure, etc.)
    toast.error('Network error. Please check your connection.');
  } else {
    // HTTP error
    toast.error('Failed to connect to panel service.');
  }
}
```

### 2. Tenant/User Context Missing
```typescript
const { currentTenant } = useTenantContext();
const { user } = useAuth();

if (!currentTenant || !user) {
  return (
    <div className="p-8 text-center">
      <p>Unable to load panel. Please refresh the page.</p>
    </div>
  );
}
```

### 3. Panel Creation Failures
```typescript
// Fallback to local-only panel if backend fails
catch (error) {
  console.error('Backend panel creation failed, creating local panel:', error);
  
  // Create panel in local store only
  const localPanel = panelStore.createPanel({
    name: useCase.name,
    members: matchedAgents.map(agent => ({ agent, role: 'expert', weight: 1 })),
    status: 'draft'
  });
  
  toast.warning('Panel created offline. Sync when online.');
  setPanelAgents(matchedAgents);
}
```

### 4. Empty Expert Selection
```typescript
if (matchedAgents.length === 0) {
  toast.info('No experts found for this use case. Please select manually.');
  setShowExpertPanelSelector(true);
  return;
}

if (matchedAgents.length < 3) {
  toast.warning(`Only ${matchedAgents.length} experts found. Consider adding more.`);
}
```

### 5. SSE Connection Drop
```typescript
eventSource.addEventListener('error', (e) => {
  console.error('SSE connection lost:', e);
  
  // Attempt reconnection with exponential backoff
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    setTimeout(() => {
      reconnectAttempts++;
      establishSSEConnection();
    }, Math.pow(2, reconnectAttempts) * 1000);
    
    toast.info('Connection lost. Reconnecting...');
  } else {
    toast.error('Unable to maintain connection. Please refresh.');
    eventSource.close();
  }
});
```

### 6. Stale Panel Data
```typescript
// Refresh panel data before executing
const refreshPanelData = async (panelId: UUID) => {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/panels/${panelId}`,
      { headers: getAuthHeaders() }
    );
    const latestPanel = await response.json();
    
    // Check if panel status allows execution
    if (latestPanel.status === 'running') {
      toast.warning('Panel is already running. Please wait.');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to refresh panel:', error);
    return true; // Proceed anyway
  }
};
```

---

## 📝 IMPLEMENTATION CHECKLIST

### Phase 1: API Client Setup
- [ ] Create `lib/api/panel-client.ts` with all endpoint methods
- [ ] Add environment variable `NEXT_PUBLIC_AI_ENGINE_URL`
- [ ] Implement auth header injection using `useTenantContext()` and `useAuth()`
- [ ] Add TypeScript types for all request/response payloads

### Phase 2: Update Existing Page
- [ ] Refactor `page.tsx` to use new API client
- [ ] Replace `/api/panel/orchestrate` with new backend endpoints
- [ ] Add panel creation on use-case selection
- [ ] Implement synchronous panel execution
- [ ] Display results from new backend format

### Phase 3: Enhance Sidebar
- [ ] Fetch panels from backend (`GET /api/v1/panels/`)
- [ ] Show panel status (created, running, completed, failed)
- [ ] Display usage analytics
- [ ] Add "View All Panels" link
- [ ] Show template usage count

### Phase 4: Real-Time Streaming (Optional Enhancement)
- [ ] Implement SSE connection
- [ ] Add streaming UI components
- [ ] Handle connection drops gracefully
- [ ] Show real-time consensus updates

### Phase 5: Panel History & Analytics
- [ ] Implement panel detail view
- [ ] Fetch responses and consensus
- [ ] Display consultation history
- [ ] Add export functionality

### Phase 6: Testing & Polish
- [ ] Test all user journeys end-to-end
- [ ] Handle error cases gracefully
- [ ] Add loading states and skeletons
- [ ] Implement offline fallback
- [ ] Add analytics tracking

---

## 🎯 SUCCESS CRITERIA

✅ **Core Functionality:**
- User can create panels via domain/subdomain/use-case navigation
- User can create custom panels with manual expert selection
- User can consult panel and receive consensus recommendation
- Panel history is persisted and retrievable

✅ **Backend Integration:**
- All API calls go to new FastAPI backend
- Tenant and user IDs are correctly injected
- Authentication works seamlessly
- Error handling provides good UX

✅ **Enhanced Features:**
- Sidebar shows recent panels with status
- Usage analytics displayed
- Templates are functional
- Real-time streaming works (if implemented)

---

**END OF USER JOURNEY MOCKUP**

