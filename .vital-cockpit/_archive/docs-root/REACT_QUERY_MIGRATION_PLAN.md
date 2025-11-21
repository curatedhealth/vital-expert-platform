# React Query Migration Plan

## Overview

This document outlines the plan to migrate remaining components from direct `fetch` calls to React Query hooks for improved caching, performance, and developer experience.

## Benefits of Migration

1. **Automatic Caching**: Reduce redundant API calls by 60%
2. **Optimistic Updates**: Instant UI feedback
3. **Background Refetching**: Keep data fresh
4. **Error Handling**: Built-in retry logic
5. **Loading States**: Consistent UX patterns
6. **Request Deduplication**: Multiple components share one request
7. **Cache Invalidation**: Automatic cache updates on mutations

## Migration Status

### ✅ Already Migrated

- [x] Agent data fetching (`useAgentsQuery`, `useAgentQuery`)
- [x] Chat data fetching (`useChatsQuery`, `useChatQuery`)
- [x] Agent mutations (create, update, delete)
- [x] Chat mutations (create, add message, delete)
- [x] Icon selection modal (optimized with images)

### 🔄 High Priority Components (Migrate First)

These components are used frequently and will benefit most from caching:

#### 1. Agent Board (`src/features/agents/components/agents-board.tsx`)

**Current Pattern:**
```typescript
const [agents, setAgents] = useState([]);
useEffect(() => {
  fetch('/api/agents').then(r => r.json()).then(data => setAgents(data));
}, []);
```

**Migration:**
```typescript
import { useAgentsQuery } from '@/lib/hooks/use-agents-query';

const { data, isLoading, error } = useAgentsQuery({ status: 'active' });
const agents = data?.agents || [];
```

**Impact:**
- Cache duration: 1 hour
- Shared across all agent list views
- Automatic background refetch on reconnect

#### 2. Chat Page (`src/app/(app)/chat/page.tsx`)

**Current Pattern:**
```typescript
const [chats, setChats] = useState([]);
const [currentChat, setCurrentChat] = useState(null);
// Manual state management
```

**Migration:**
```typescript
import { useChatsQuery, useChatQuery } from '@/lib/hooks/use-chat-query';

const { data: chatsData } = useChatsQuery(userId);
const { data: chatData } = useChatQuery(selectedChatId);
```

**Impact:**
- Cache duration: 30 min for history, 5 min for active
- Optimistic message updates
- Automatic sync across tabs

#### 3. Agent Creator (`src/features/chat/components/agent-creator.tsx`)

**Current Pattern:**
```typescript
const handleCreate = async () => {
  await fetch('/api/agents', { method: 'POST', body: ... });
  // Manual refetch or state update
};
```

**Migration:**
```typescript
import { useCreateAgentMutation } from '@/lib/hooks/use-agents-query';

const createMutation = useCreateAgentMutation();
const handleCreate = () => {
  createMutation.mutate(newAgent);
  // Cache automatically invalidated
};
```

**Impact:**
- Automatic cache invalidation
- Loading states built-in
- Error handling with retry

#### 4. Knowledge Uploader (`src/features/knowledge/components/knowledge-uploader.tsx`)

**Create Hook:** `lib/hooks/use-knowledge-query.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useKnowledgeDocuments(filters?: { category?: string }) {
  return useQuery({
    queryKey: ['knowledge', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/knowledge?${params}`);
      return response.json();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useUploadDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
    },
  });
}
```

#### 5. Knowledge Analytics (`src/features/knowledge/components/knowledge-analytics-dashboard.tsx`)

**Create Hook:** `lib/hooks/use-analytics-query.ts`

```typescript
export function useKnowledgeAnalytics(timeRange?: string) {
  return useQuery({
    queryKey: ['analytics', 'knowledge', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/knowledge?range=${timeRange}`);
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### 📋 Medium Priority Components

#### 6. Ask Panel Page (`src/app/(app)/ask-panel/page.tsx`)

**Create Hook:** `lib/hooks/use-panel-query.ts`

```typescript
export function usePanelQuery(panelId: string) {
  return useQuery({
    queryKey: ['panel', panelId],
    queryFn: async () => {
      const response = await fetch(`/api/panels/${panelId}`);
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreatePanelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (panel) => {
      const response = await fetch('/api/panels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(panel),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panels'] });
    },
  });
}
```

#### 7. Knowledge Domains (`src/app/(app)/knowledge-domains/page.tsx`)

**Create Hook:** `lib/hooks/use-domains-query.ts`

```typescript
export function useKnowledgeDomainsQuery() {
  return useQuery({
    queryKey: ['knowledge-domains'],
    queryFn: async () => {
      const response = await fetch('/api/knowledge-domains');
      return response.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour (rarely changes)
  });
}
```

#### 8. Prompt Library (`src/shared/components/prompts/PromptLibrary.tsx`)

**Create Hook:** `lib/hooks/use-prompts-query.ts`

```typescript
export function usePromptsQuery(category?: string) {
  return useQuery({
    queryKey: ['prompts', category],
    queryFn: async () => {
      const params = category ? `?category=${category}` : '';
      const response = await fetch(`/api/prompts${params}`);
      return response.json();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useCreatePromptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prompt) => {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}
```

### 🔽 Lower Priority Components

#### 9. Medical Models Dashboard (`src/shared/components/llm/MedicalModelsDashboard.tsx`)

Dashboard with infrequent updates - can use longer cache times (1 hour).

#### 10. OpenAI Usage Dashboard (`src/shared/components/llm/OpenAIUsageDashboard.tsx`)

Analytics data - cache for 15 minutes, refetch in background.

#### 11. Batch Upload Panel (`src/features/admin/components/batch-upload-panel.tsx`)

Admin tool - less critical for performance, but mutation benefits apply.

## Migration Steps

### Step 1: Create Hook (Example)

Create `lib/hooks/use-knowledge-query.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

interface DocumentsResponse {
  success: boolean;
  documents: Document[];
  count: number;
}

export function useKnowledgeDocuments(filters?: {
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['knowledge-documents', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`/api/knowledge?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json() as Promise<DocumentsResponse>;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useUploadDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch document list
      queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] });
    },
  });
}

export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/knowledge/${documentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] });
    },
  });
}
```

### Step 2: Update Component

**Before:**
```typescript
'use client';

import { useState, useEffect } from 'react';

export function KnowledgeUploader() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/knowledge');
      const data = await response.json();
      setDocuments(data.documents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    await fetch('/api/knowledge/upload', {
      method: 'POST',
      body: formData,
    });
    loadDocuments(); // Manually refetch
  };

  // ... render
}
```

**After:**
```typescript
'use client';

import {
  useKnowledgeDocuments,
  useUploadDocumentMutation
} from '@/lib/hooks/use-knowledge-query';

export function KnowledgeUploader() {
  // Data fetching with automatic caching
  const { data, isLoading, error, refetch } = useKnowledgeDocuments();
  const documents = data?.documents || [];

  // Upload mutation with automatic cache invalidation
  const uploadMutation = useUploadDocumentMutation();

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await uploadMutation.mutateAsync(formData);
      // Cache automatically invalidated - no manual refetch needed!
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return <div>Loading documents...</div>;
  }

  // Error state
  if (error) {
    return (
      <div>
        Error: {error.message}
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  // ... render with documents
}
```

### Step 3: Test

1. **Check loading states work**
2. **Verify data loads and caches**
3. **Test mutations invalidate cache**
4. **Check error handling**
5. **Verify optimistic updates (if applicable)**

### Step 4: Remove Old Code

1. Delete unused `useState` hooks
2. Delete manual `fetch` calls
3. Delete custom loading/error state management
4. Delete manual cache invalidation logic

## Cache Duration Guidelines

| Data Type | Cache Duration | Rationale |
|-----------|----------------|-----------|
| Static configuration | 1 hour | Rarely changes |
| User-generated content | 30 minutes | Changes occasionally |
| Real-time data | 5 minutes | May update frequently |
| Analytics data | 15 minutes | Background updates acceptable |
| Auth session | 1 hour | Validated on actions |

## Testing Checklist

For each migrated component:

- [ ] Data loads correctly on mount
- [ ] Loading states display properly
- [ ] Error states handle failures
- [ ] Mutations work and invalidate cache
- [ ] Optimistic updates work (if applicable)
- [ ] Cache persists across navigation
- [ ] Multiple instances share cache
- [ ] Network requests are deduplicated
- [ ] TypeScript types are correct
- [ ] No console errors

## Performance Monitoring

### Before Migration
```typescript
// Measure: Time from mount to data display
console.time('data-load');
fetch('/api/data').then(() => {
  console.timeEnd('data-load');
});
```

### After Migration
React Query DevTools will show:
- Cache hits vs misses
- Request deduplication
- Background refetch activity
- Stale data usage

### Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Redundant API calls | 100% | 40% | -60% |
| Time to interactive | Baseline | -20% | 20% faster |
| Perceived performance | Baseline | Much better | Instant updates |

## Migration Timeline

### Week 1: High Priority
- [ ] Create knowledge hooks
- [ ] Migrate agents-board
- [ ] Migrate chat page
- [ ] Migrate agent-creator
- [ ] Test and validate

### Week 2: Medium Priority
- [ ] Create panel hooks
- [ ] Create domains hooks
- [ ] Create prompts hooks
- [ ] Migrate respective components
- [ ] Test and validate

### Week 3: Lower Priority
- [ ] Migrate dashboard components
- [ ] Migrate admin tools
- [ ] Final testing
- [ ] Performance measurements

## Rollback Plan

If issues arise:

1. **Keep old code temporarily:**
   ```typescript
   // Keep old implementation as fallback
   const USE_REACT_QUERY = true;

   if (USE_REACT_QUERY) {
     // New React Query code
   } else {
     // Old fetch code
   }
   ```

2. **Monitor errors in production**
3. **Quick rollback via feature flag**
4. **Fix and redeploy**

## Resources

- **React Query Docs**: https://tanstack.com/query/latest/docs/react/overview
- **Example Components**: `src/examples/agent-list-with-query.tsx`, `chat-with-query.tsx`
- **Existing Hooks**: `lib/hooks/use-agents-query.ts`, `use-chat-query.ts`
- **DevTools**: Included in QueryProvider (dev mode only)

## Summary

**Total Components to Migrate: ~15**
- High Priority: 5 components
- Medium Priority: 4 components
- Lower Priority: 6 components

**Expected Overall Impact:**
- API calls: -60%
- Perceived performance: +50%
- Developer experience: Significantly improved
- Code maintainability: Much better

**Start with high-priority components and measure impact before proceeding to lower priority items.**
