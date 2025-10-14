# Chat Components

## AgentSelectionPanel
- **Purpose**: Manual agent selection interface
- **Features**: Search, categories, recent agents, loading states
- **Props**: agents, selectedAgent, onSelectAgent, isLoading
- **Performance**: Memoized cards, debounced search (300ms), debounced selection (100ms)

## ChatHeader
- **Purpose**: Display current agent and mode
- **Features**: Mode badges, change agent button, settings
- **Props**: selectedAgent, interactionMode, autonomousMode, callbacks

## ChatInput
- **Purpose**: Message input with validation
- **Features**: Keyboard shortcuts (Enter/Shift+Enter), validation warnings
- **Props**: value, onChange, onSubmit, interactionMode, hasSelectedAgent

## ChatContainer
- **Purpose**: Main message display area
- **Features**: Auto-scroll, loading states, error handling, reasoning display
- **Props**: className

## Integration Example
```typescript
<div className="flex h-screen">
  {interactionMode === 'manual' && (
    <AgentSelectionPanel {...agentProps} />
  )}
  <div className="flex-1 flex flex-col">
    <ChatHeader {...headerProps} />
    <ChatContainer />
    <ChatInput {...inputProps} />
  </div>
</div>
```

## Performance Optimizations
- **Search Debounce**: 300ms delay for search input
- **Selection Debounce**: 100ms delay to prevent double-clicks
- **Memoization**: Agent cards are memoized with React.memo
- **Cleanup**: Proper AbortController cleanup on unmount
- **Async Acknowledgment**: Proper async/await pattern for agent selection

## Validation Layers
1. **Store Layer**: Validates before creating messages
2. **UI Layer**: Disables input and shows warnings
3. **Backend Layer**: Final validation in workflow

## Error Handling
- **Retry Logic**: Exponential backoff for failed requests
- **Clear Messages**: Actionable error messages
- **Graceful Degradation**: Fallbacks for missing data
