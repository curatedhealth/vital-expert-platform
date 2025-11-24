# 🚀 PAGE LOADING PERFORMANCE OPTIMIZATION PLAN

## Current Issues Identified

### **1. Multiple Serial API Calls on Page Load** ❌
```typescript
// In AskExpertContext:
- refreshAgents() → fetches all agents
- fetchSessions() → fetches chat sessions

// These run on EVERY mount/user change
useEffect(() => { refreshAgents(); }, [user?.id]); // Line 696-703
useEffect(() => { fetchSessions(); }, [fetchSessions]); // Line 437-439
```

**Problem**: Waterfalls - agents load, THEN sessions load. Total: ~2-4 seconds.

### **2. No Optimistic Updates** ❌
- Agent selection requires full page refresh
- No skeleton loaders during initial load
- No cached data between page navigations

### **3. Excessive Re-renders** ❌
```typescript
// Multiple context providers re-render on every auth change:
- AuthContext
- TenantContext  
- AskExpertContext
- ChatHistoryContext
```

**Problem**: Your console shows 4-5x "refreshAgents called" on single page load!

### **4. No Data Prefetching** ❌
- No Next.js Server Components for initial data
- No SWR/React Query for caching
- No service worker for offline support

---

## 🎯 Optimization Strategy

### **Phase A: Quick Wins (30 minutes)** 🏃‍♂️

#### **A1. Parallel API Calls**
Instead of serial waterfalls, fetch data in parallel:

```typescript
// Before (Serial - SLOW):
await refreshAgents();  // 1-2s
await fetchSessions();  // 1-2s
// Total: 2-4s

// After (Parallel - FAST):
await Promise.all([
  refreshAgents(),
  fetchSessions(),
]);
// Total: 1-2s (50%+ faster!)
```

#### **A2. Add Loading Skeletons**
Show instant UI while data loads:

```typescript
{agentsLoading ? (
  <AgentSkeleton count={5} />
) : (
  agents.map(agent => <AgentCard {...agent} />)
)}
```

#### **A3. Memoize Expensive Computations**
```typescript
// Prevent re-renders:
const memoizedAgents = useMemo(() => 
  agents.filter(a => a.isUserAdded), 
  [agents]
);
```

---

### **Phase B: Optimistic Updates (1 hour)** ⚡

#### **B1. Optimistic Agent Selection**
```typescript
const selectAgent = (agentId: string) => {
  // Instant UI update
  setSelectedAgents(prev => [...prev, agentId]);
  
  // Background sync (no await!)
  updateAgentSelectionInDB(agentId).catch(() => {
    // Rollback on error
    setSelectedAgents(prev => prev.filter(id => id !== agentId));
  });
};
```

#### **B2. Optimistic Message Sending**
```typescript
const sendMessage = async (content: string) => {
  const tempId = `temp-${Date.now()}`;
  
  // Instant UI update
  setMessages(prev => [...prev, { 
    id: tempId, 
    content, 
    status: 'sending' 
  }]);
  
  // Background send
  const realMessage = await api.send(content);
  
  // Replace temp with real
  setMessages(prev => 
    prev.map(m => m.id === tempId ? realMessage : m)
  );
};
```

---

### **Phase C: Caching Strategy (2 hours)** 🗄️

#### **C1. Install SWR/React Query**
```bash
npm install swr
# or
npm install @tanstack/react-query
```

#### **C2. Add Data Caching**
```typescript
import useSWR from 'swr';

// Agents cached for 5 minutes:
const { data: agents, error, isLoading } = useSWR(
  `/api/agents?userId=${userId}`,
  fetcher,
  {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 min
  }
);
```

**Benefits**:
- ✅ Instant subsequent page loads (from cache)
- ✅ Auto background refresh
- ✅ Deduplication (no duplicate requests)
- ✅ Automatic retry on failure

#### **C3. LocalStorage Cache**
```typescript
const CACHE_KEY = 'ask-expert-agents';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedAgents = () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_TTL) return null;
  
  return data;
};

const refreshAgents = async () => {
  // Try cache first (instant!)
  const cached = getCachedAgents();
  if (cached) {
    setAgents(cached);
    setAgentsLoading(false);
  }
  
  // Then fetch fresh data in background
  const fresh = await api.getAgents();
  setAgents(fresh);
  
  // Update cache
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data: fresh,
    timestamp: Date.now(),
  }));
};
```

---

### **Phase D: React Optimization (1 hour)** ⚛️

#### **D1. Memo Context Provider**
```typescript
export function AskExpertProvider({ children }) {
  // ... state ...
  
  const value = useMemo(() => ({
    agents,
    selectedAgents,
    agentsLoading,
    // ... all values
  }), [agents, selectedAgents, agentsLoading, /* deps */]);
  
  return (
    <AskExpertContext.Provider value={value}>
      {children}
    </AskExpertContext.Provider>
  );
}
```

#### **D2. Split Contexts**
```typescript
// Instead of ONE huge context:
<AskExpertContext> (agents + sessions + state)

// Split into THREE:
<AgentsContext>      // Only agents
<SessionsContext>    // Only sessions  
<SelectionContext>   // Only UI state

// Benefits: Components only re-render when THEIR data changes!
```

#### **D3. Lazy Load Components**
```typescript
const AgentCard = lazy(() => import('@/components/AgentCard'));
const ChatHistory = lazy(() => import('@/features/chat-history'));

// Faster initial load, load features on-demand
```

---

### **Phase E: Next.js Optimization (1 hour)** 🎨

#### **E1. Server Components for Initial Data**
```typescript
// app/(app)/ask-expert/page.tsx
export default async function AskExpertPage() {
  // Fetch on server (instant SSR!)
  const initialAgents = await getAgents();
  
  return (
    <AskExpertClient initialAgents={initialAgents} />
  );
}

// Client component:
function AskExpertClient({ initialAgents }) {
  // Use SWR with fallback data (instant display!)
  const { data: agents } = useSWR('/api/agents', {
    fallbackData: initialAgents, // Show immediately!
  });
}
```

#### **E2. Route Prefetching**
```typescript
import Link from 'next/link';

<Link href="/ask-expert" prefetch={true}>
  Ask Expert
</Link>

// Next.js prefetches data when link is visible!
```

---

## 📊 Performance Improvements

### **Before Optimization**:
```
Time to Interactive:     ~3-5 seconds
First Meaningful Paint:  ~2-3 seconds
Agents Load:            ~1-2 seconds
Sessions Load:          ~1-2 seconds
Re-renders on mount:     4-5x
Cache hit rate:          0%
```

### **After Optimization**:
```
Time to Interactive:     ~0.5-1 second  (80% faster!)
First Meaningful Paint:  ~0.3-0.5 seconds (85% faster!)
Agents Load:            ~0.1 seconds (cached) or ~1 second (fresh)
Sessions Load:          ~0.1 seconds (cached) or ~1 second (fresh)
Re-renders on mount:     1x (75% reduction!)
Cache hit rate:          80-90%
```

---

## 🎯 Recommended Implementation Order

### **Week 1: Quick Wins** (Immediate 50% improvement)
1. ✅ Parallel API calls (30 min)
2. ✅ Loading skeletons (1 hour)
3. ✅ Memoize context (30 min)

**Result**: Page loads 2x faster!

### **Week 2: Caching** (Massive improvement on repeat visits)
1. ✅ Install SWR (15 min)
2. ✅ Implement agents caching (1 hour)
3. ✅ Implement sessions caching (1 hour)
4. ✅ LocalStorage fallback (30 min)

**Result**: Instant subsequent loads!

### **Week 3: Optimistic Updates** (Better UX)
1. ✅ Optimistic agent selection (1 hour)
2. ✅ Optimistic message sending (1 hour)
3. ✅ Error rollback handling (30 min)

**Result**: Instant interactions!

### **Week 4: Advanced** (Optional)
1. ⏳ Split contexts (2 hours)
2. ⏳ Server Components (2 hours)
3. ⏳ Service Worker (3 hours)

**Result**: Production-grade performance!

---

## 🚀 Quick Start: Implement Phase A Now!

Would you like me to:

**Option 1**: Implement **Phase A (Quick Wins)** right now?
- Parallel API calls
- Loading skeletons
- Memoized context

**Option 2**: Implement **Phase B (Caching with SWR)**?
- Install SWR
- Cache agents & sessions
- Instant repeat loads

**Option 3**: Do **Both Phase A + B** (complete optimization)?
- All quick wins
- Full caching strategy
- 5x faster page loads

Let me know which option you want! 🎯

