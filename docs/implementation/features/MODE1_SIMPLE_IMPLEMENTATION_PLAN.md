# Mode 1 - Manual Interactive Mode - Simple Implementation Plan

## Current Problems

1. **Too Complex**: Using unified-langgraph-orchestrator with too many features
2. **Too Slow**: Takes time to see agent appearing
3. **Too Many Failures**: Multiple points of failure (RAG, agent selection, etc.)
4. **Not Working**: No responses being generated

## Proposed Simple Mode 1 Flow

### What Mode 1 Should Do:
```
User selects agent manually → User sends message → Agent responds
```

**That's it.** No automatic agent selection, no RAG, no multi-agent.

### Simple Architecture:

```typescript
// Mode 1: Manual Interactive
async function handleMode1Chat(agentId: string, message: string) {
  // 1. Get the selected agent from database
  const agent = await getAgentById(agentId);
  
  // 2. Build simple prompt
  const prompt = `${agent.system_prompt}\n\nUser: ${message}\nAssistant:`;
  
  // 3. Call OpenAI directly
  const response = await openai.chat.completions.create({
    model: agent.model || 'gpt-4',
    messages: [
      { role: 'system', content: agent.system_prompt },
      { role: 'user', content: message }
    ]
  });
  
  // 4. Return response
  return response.choices[0].message.content;
}
```

### What to Remove for Mode 1:
- ❌ No RAG retrieval
- ❌ No agent selection logic
- ❌ No multi-agent coordination
- ❌ No LangGraph complexity
- ❌ No caching layers

### What to Keep:
- ✅ User manually selects ONE agent
- ✅ Direct OpenAI API call
- ✅ Simple conversation history
- ✅ Basic error handling

## Implementation Steps

1. Create `simple-mode1-handler.ts`
2. Update `/api/ask-expert/orchestrate` to detect mode
3. For mode=manual, use simple handler
4. Test with one agent

## Expected Behavior

**User Experience:**
1. Click on agent (e.g., "Clinical Trial Designer")
2. Type message: "Help me design a study"
3. Get response in < 3 seconds
4. No loading delays
5. Clear error messages if something fails

## File to Create

`apps/digital-health-startup/src/features/chat/services/simple-mode1-handler.ts`

Would you like me to create this simple implementation?
