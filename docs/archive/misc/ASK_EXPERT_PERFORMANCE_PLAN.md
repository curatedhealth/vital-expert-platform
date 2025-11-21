# Ask Expert Performance Optimization Plan

## 🎯 Objectives
1. **Eliminate full page reloads** - Use optimistic updates
2. **Add toast notifications** - Better user feedback
3. **Improve loading states** - Skeleton loaders and smooth transitions
4. **Optimize re-renders** - useMemo, useCallback, React Query
5. **Better error handling** - User-friendly error messages

---

## 🚀 Implementation Strategy

### **Phase 1: Toast Notification System** ✅
- Use existing `@vital/ui` toast (Sonner)
- Add success/error/info toasts for all operations
- Show feedback for: conversation create/delete, message send, agent selection

### **Phase 2: Optimistic UI Updates**
#### Conversations:
- ✅ **Create**: Show immediately with temp ID, update on success
- ✅ **Delete**: Remove immediately, rollback on error
- ✅ **Switch**: Instant navigation, no reload
- ✅ **Update**: Real-time title/message updates

#### Messages:
- ✅ **Send**: Show user message immediately
- ✅ **Stream**: Update AI response in real-time
- ✅ **Regenerate**: Clear and restart without flicker

#### Agents:
- ✅ **Select**: Instant feedback with loading indicator
- ✅ **Stats**: Progressive loading with skeleton
- ✅ **Multi-select**: Smooth add/remove animations

### **Phase 3: Loading States & Animations**
- ✅ Skeleton loaders for conversations list
- ✅ Message send animation (fade-in)
- ✅ Streaming indicator (typing animation)
- ✅ Agent card hover states
- ✅ Smooth transitions for mode changes

### **Phase 4: Performance Optimizations**
- ✅ **useMemo**: Memoize filtered conversations, computed values
- ✅ **useCallback**: Stable function references
- ✅ **React Query**: Better caching and background updates
- ✅ **Lazy Loading**: Load messages on scroll
- ✅ **Debounce**: Input and search operations

### **Phase 5: Error Handling**
- ✅ Network error detection and retry
- ✅ Offline mode detection
- ✅ Rate limit handling
- ✅ Graceful degradation

---

## 📊 Expected Results

### Before:
- ❌ Full page reload on conversation switch
- ❌ No feedback on actions
- ❌ Stuttering on agent selection
- ❌ Silent failures
- ❌ Re-fetches on every navigation

### After:
- ✅ Instant conversation switching
- ✅ Toast notifications for all actions
- ✅ Smooth agent selection
- ✅ Clear error messages
- ✅ Intelligent caching

---

## 🔧 Key Improvements

### 1. **useConversations Hook Enhancement**
```typescript
// Add optimistic updates
const createConversationOptimistic = (title: string) => {
  const tempId = `temp_${Date.now()}`;
  const optimisticConv = { id: tempId, title, messages: [], createdAt: Date.now() };
  
  // Update UI immediately
  setConversations(prev => [optimisticConv, ...prev]);
  setActiveConversationId(tempId);
  
  // Persist to DB in background
  createMutation.mutate(optimisticConv, {
    onSuccess: (created) => {
      // Replace temp with real ID
      setConversations(prev => prev.map(c => c.id === tempId ? created : c));
      setActiveConversationId(created.id);
      toast.success('Conversation created');
    },
    onError: () => {
      // Rollback on error
      setConversations(prev => prev.filter(c => c.id !== tempId));
      toast.error('Failed to create conversation');
    }
  });
};
```

### 2. **Message Streaming Optimization**
```typescript
// Stream directly to UI state
const handleStream = (chunk: string) => {
  setStreamingMessage(prev => prev + chunk);
  // No re-renders until complete
};

// Batch updates
const flushStream = () => {
  setMessages(prev => [...prev, {
    id: generateId(),
    role: 'assistant',
    content: streamingMessage,
    timestamp: Date.now()
  }]);
  setStreamingMessage('');
};
```

### 3. **Smart Caching with React Query**
```typescript
const { data: conversations, isLoading } = useQuery({
  queryKey: ['conversations', userId],
  queryFn: () => fetchConversations(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: false,
});
```

### 4. **Skeleton Loaders**
```typescript
{isLoading ? (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
) : (
  <ConversationsList />
)}
```

---

## 🎨 UX Enhancements

### **Micro-interactions:**
- Button press states
- Hover feedback
- Success checkmarks
- Error shake animations

### **Transitions:**
- Fade in/out for messages
- Slide in for sidebars
- Scale animations for modals
- Smooth scroll to new messages

### **Feedback:**
- Loading spinners
- Progress bars for streaming
- Toast notifications
- Inline validation

---

## 📈 Performance Metrics

### Target Improvements:
- **Page Load**: < 1s (vs 3s+)
- **Conversation Switch**: < 100ms (vs 1s+)
- **Message Send**: Instant feedback (vs 500ms delay)
- **Agent Selection**: < 200ms (vs 1s)
- **Re-render Count**: -70% (via memoization)

---

## 🔄 Migration Path

1. **Week 1**: Toast notifications + Optimistic updates
2. **Week 2**: Loading states + Animations
3. **Week 3**: Performance optimizations
4. **Week 4**: Error handling + Testing
5. **Week 5**: Polish + Documentation

---

## ✅ Success Criteria

- [ ] No full page reloads on any operation
- [ ] Toast feedback for all user actions
- [ ] < 100ms perceived latency for UI updates
- [ ] Graceful error handling with retry options
- [ ] Smooth animations throughout
- [ ] < 50ms input response time
- [ ] Zero janky scrolling
- [ ] Offline mode support

---

**Status**: Ready for implementation
**Priority**: HIGH - Directly impacts user experience
**Effort**: Medium (2-3 days of focused work)

