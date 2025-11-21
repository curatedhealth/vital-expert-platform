# 💾 **Mode 1: Memory/Conversation History Implementation Guide**

**Estimated Time**: 1-2 hours  
**Complexity**: Medium  
**Priority**: Medium (Improves UX, not blocking)

---

## 📋 **Overview**

Add conversation history loading to Mode 1, allowing:
- Multi-turn conversations with context
- Agent remembers previous messages
- Better continuity in user interactions

---

## 🎯 **Implementation Steps**

### **Step 1: Add History Loading to Validation** (30 min)

**File**: `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`

**Location**: `validate_inputs_node` method, after line 160

```python
    @trace_node("mode1_validate")
    async def validate_inputs_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Validate inputs and load conversation history."""
        tenant_id = state.get('tenant_id')
        query = state.get('query')
        selected_agents = state.get('selected_agents', [])
        
        # Existing validation...
        # (keep all existing code)
        
        # NEW: Load conversation history
        conversation_id = state.get('conversation_id')
        conversation_history = []
        
        if conversation_id:
            logger.info(
                "📜 [Mode 1] Loading conversation history",
                conversation_id=conversation_id
            )
            
            try:
                # Query Supabase for previous messages
                result = await self.supabase.client.table('conversations')\
                    .select('id, messages')\
                    .eq('id', conversation_id)\
                    .eq('tenant_id', tenant_id)\
                    .single()\
                    .execute()
                
                if result.data:
                    # Extract last N messages for context
                    messages = result.data.get('messages', [])
                    conversation_history = messages[-5:]  # Last 5 messages
                    
                    logger.info(
                        "✅ [Mode 1] Loaded conversation history",
                        messages_count=len(conversation_history)
                    )
                else:
                    logger.warning("⚠️  Conversation not found", conversation_id=conversation_id)
                    
            except Exception as e:
                logger.error("❌ Failed to load conversation history", error=str(e))
                # Don't fail workflow, just continue without history
        
        return {
            **state,
            'tenant_id': tenant_id,
            'conversation_id': conversation_id,
            'conversation_history': conversation_history,  # NEW
            'validation_passed': True,
            'current_node': 'validate'
        }
```

---

### **Step 2: Include History in Agent Context** (20 min)

**File**: Same file, `execute_agent_node` method

**Location**: After line 277, before building `full_query`

```python
    async def execute_agent_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Execute agent with RAG context and conversation history."""
        tenant_id = state.get('tenant_id')
        query = state.get('query', '')
        agent_id = state.get('selected_agents', [None])[0]
        context_summary = state.get('context_summary', '')
        conversation_history = state.get('conversation_history', [])  # NEW
        model = state.get('model', 'gpt-4')
        
        logger.info(
            "🤖 [Mode 1] Executing agent",
            agent_id=agent_id[:8] if agent_id else None,
            query_length=len(query),
            has_context=bool(context_summary),
            history_length=len(conversation_history)  # NEW
        )
        
        try:
            # Build full query with context AND history
            full_query = query
            
            # Add conversation history if available
            if conversation_history:
                history_text = self._format_conversation_history(conversation_history)
                full_query = f"{history_text}\n\n{query}"
            
            # Add RAG context if available
            if context_summary:
                full_query = f"{full_query}\n\n=== Context from Knowledge Base ===\n{context_summary}"
            
            # Create agent request
            agent_request = AgentQueryRequest(
                agent_id=agent_id,
                agent_type='general',
                query=full_query,
                user_id=state.get('user_id'),
                organization_id=tenant_id,
                max_context_docs=0,
                similarity_threshold=0.7,
                include_citations=True,
                include_confidence_scores=True,
                response_format="detailed"
            )
            
            # ... rest of existing code ...
```

---

### **Step 3: Add History Formatter** (10 min)

**File**: Same file, add new method after `format_output_node`

```python
    def _format_conversation_history(self, history: List[Dict[str, Any]]) -> str:
        """
        Format conversation history for context.
        
        Args:
            history: List of messages with 'role' and 'content'
        
        Returns:
            Formatted history string
        """
        if not history:
            return ""
        
        formatted_lines = ["=== Previous Conversation ==="]
        
        for msg in history:
            role = msg.get('role', 'unknown')
            content = msg.get('content', '')
            
            # Truncate very long messages
            if len(content) > 200:
                content = content[:200] + "..."
            
            if role == 'user':
                formatted_lines.append(f"User: {content}")
            elif role == 'assistant':
                formatted_lines.append(f"Assistant: {content}")
        
        formatted_lines.append("=== End Previous Conversation ===\n")
        
        return "\n".join(formatted_lines)
```

---

### **Step 4: Save Response to History** (30 min)

**File**: Same file, `format_output_node` method

**Location**: After line 376, before return statement

```python
    async def format_output_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Format output and save to conversation history."""
        agent_response = state.get('agent_response', '')
        confidence = state.get('response_confidence', 0.0)
        citations = state.get('citations', [])
        retrieved_documents = state.get('retrieved_documents', [])
        errors = state.get('errors', [])
        conversation_id = state.get('conversation_id')
        
        # ... existing formatting code ...
        
        # NEW: Save to conversation history
        if conversation_id and agent_response:
            logger.info("💾 [Mode 1] Saving response to history", conversation_id=conversation_id)
            
            try:
                # Get current conversation
                result = await self.supabase.client.table('conversations')\
                    .select('messages')\
                    .eq('id', conversation_id)\
                    .single()\
                    .execute()
                
                current_messages = result.data.get('messages', []) if result.data else []
                
                # Add new user message
                current_messages.append({
                    'id': f"{conversation_id}_{len(current_messages)}",
                    'role': 'user',
                    'content': state.get('query', ''),
                    'timestamp': datetime.now(timezone.utc).isoformat()
                })
                
                # Add assistant response
                current_messages.append({
                    'id': f"{conversation_id}_{len(current_messages)}",
                    'role': 'assistant',
                    'content': agent_response,
                    'timestamp': datetime.now(timezone.utc).isoformat(),
                    'metadata': {
                        'sources_count': len(sources),
                        'confidence': confidence,
                        'model': state.get('model_used', 'gpt-4')
                    }
                })
                
                # Update conversation
                await self.supabase.client.table('conversations')\
                    .update({
                        'messages': current_messages,
                        'updated_at': datetime.now(timezone.utc).isoformat()
                    })\
                    .eq('id', conversation_id)\
                    .execute()
                
                logger.info("✅ [Mode 1] Saved to history", total_messages=len(current_messages))
                
            except Exception as e:
                logger.error("❌ Failed to save to history", error=str(e))
                # Don't fail workflow, just log the error
        
        return {
            **state,
            'response': agent_response,
            # ... rest of existing code ...
        }
```

---

## 🗄️ **Database Schema Requirements**

### **Conversations Table**

```sql
-- Check if conversations table has correct schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'conversations';

-- Should have:
-- id: uuid (primary key)
-- tenant_id: uuid
-- user_id: uuid
-- messages: jsonb[]
-- created_at: timestamp
-- updated_at: timestamp
```

### **Message Format**

```typescript
interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: {
    sources_count?: number
    confidence?: number
    model?: string
    [key: string]: any
  }
}
```

---

## 🧪 **Testing Plan**

### **Test 1: First Message** (No History)
```
User: "What are FDA guidelines for digital therapeutics?"
Expected: Normal response, history saved
```

### **Test 2: Follow-up Message** (With History)
```
User: "What about cybersecurity requirements?"
Expected: Agent references previous FDA context, history loaded
```

### **Test 3: Multi-turn Conversation**
```
User: "Tell me about clinical trials"
User: "What are the phases?"
User: "How long does phase 3 take?"
Expected: Each response builds on previous context
```

---

## 🔍 **Verification Checklist**

- [ ] Conversation history loads from Supabase
- [ ] Last 5 messages included in agent context
- [ ] History formatted correctly for LLM
- [ ] Agent responses reference previous messages
- [ ] New messages saved to database
- [ ] Message timestamps accurate
- [ ] Metadata (sources, confidence) saved
- [ ] Errors handled gracefully (no workflow failures)

---

## 🐛 **Common Issues & Solutions**

### **Issue 1**: Conversation not found
**Solution**: Create conversation first in frontend before sending messages

### **Issue 2**: Messages not saving
**Solution**: Check Supabase RLS policies allow insert/update on conversations

### **Issue 3**: History too long, context overflow
**Solution**: Already limited to last 5 messages. Can reduce to 3 if needed.

### **Issue 4**: Timestamps in wrong format
**Solution**: Use `datetime.now(timezone.utc).isoformat()` for consistency

---

## 🎨 **Frontend Integration**

### **Create Conversation**
```typescript
const conversation = await supabase
  .from('conversations')
  .insert({
    tenant_id: tenantId,
    user_id: userId,
    messages: [],
    created_at: new Date().toISOString()
  })
  .select()
  .single()

// Use conversation.id in API requests
```

### **Pass Conversation ID**
```typescript
const response = await fetch('/api/ask-expert/orchestrate', {
  method: 'POST',
  body: JSON.stringify({
    mode: 'manual',
    query: userMessage,
    conversationId: conversation.id,  // Add this
    // ... other params
  })
})
```

---

## 📊 **Expected Result**

After implementation, multi-turn conversations work:

**Turn 1**:
```
User: "What are the phases of clinical trials?"
AI: "Clinical trials have 4 phases: Phase 1 tests safety..."
```

**Turn 2** (with history):
```
User: "How long does phase 3 usually take?"
AI: "Building on the clinical trial phases we discussed, Phase 3 typically takes 1-4 years..."
```

Notice AI references "phases we discussed" from history! ✅

---

## 🚀 **Deployment**

After testing:
1. Verify Supabase schema matches requirements
2. Test with multiple conversations
3. Commit: "feat: Add conversation history to Mode 1"
4. Deploy AI Engine
5. Test in production

---

## 📚 **Reference Files**

- **Mode 2 Memory**: `services/ai-engine/src/langgraph_workflows/mode2_automatic_workflow.py`
- **Memory Mixin**: `services/ai-engine/src/langgraph_workflows/memory_integration_mixin.py`
- **Supabase Client**: `services/ai-engine/src/services/supabase_client.py`

---

**TOTAL TIME**: 1-2 hours (including testing)
**PRIORITY**: Medium (Improves UX significantly)

