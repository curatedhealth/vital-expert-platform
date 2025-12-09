# Mode 1 Streaming Fixes - December 2025

## Executive Summary

This document details critical fixes applied to resolve Mode 1 streaming issues where SSE events were delayed 90+ seconds and arrived batched instead of progressively streaming.

## Issues Addressed

### Issue 1: Delayed SSE Events (90+ second delay)
**Root Cause:** LangGraph `stream_mode` was set as a list `["updates", "messages"]` which batches events until ALL modes have data to emit.

**Solution:** Changed to string `stream_mode="updates"` for immediate event emission.

**File:** `src/langgraph_workflows/ask_expert/mode1/mode1_manual_interactive.py`

```python
# BEFORE (problematic)
stream_mode=["updates", "messages"]

# AFTER (fixed)
stream_mode="updates"
```

### Issue 2: RAG Returns 0 Documents, No Web Search Fallback
**Root Cause:** When RAG/vector search returned insufficient documents, the expert responded without any sources.

**Solution:** Added automatic web search fallback using Tavily API when RAG returns < 3 documents.

**File:** `src/langgraph_workflows/ask_expert/shared/nodes/rag_retriever.py`

```python
# Key constants
MIN_RAG_DOCS_THRESHOLD = 3  # Trigger web fallback below this count

# New fallback function
async def _web_search_fallback(query, max_results=5, request_id="unknown"):
    """
    Fallback to web search when RAG returns insufficient documents.
    Uses Tavily API via WebSearchTool for real-time web results.
    """
    from tools.web_tools import WebSearchTool
    web_tool = WebSearchTool()
    results = await web_tool.search(query=query, max_results=max_results)
    # Process results into document format with metadata marking them as fallback
    ...
```

### Issue 3: tools_enabled Field Type Inconsistency
**Root Cause:** Database field `tools_enabled` could be None, a comma-separated string, or a list, causing type errors.

**Solution:** Added normalization function to always convert to list.

**File:** `src/infrastructure/database/agent_loader.py`

```python
def _normalize_to_list(value: Union[None, str, List[str]]) -> List[str]:
    """
    Normalize a value that could be None, string, or list to always be a list.

    Database fields may be stored as:
    - None -> []
    - "tool1,tool2" -> ["tool1", "tool2"]
    - ["tool1", "tool2"] -> ["tool1", "tool2"]
    """
    if value is None:
        return []
    if isinstance(value, str):
        if "," in value:
            return [v.strip() for v in value.split(",") if v.strip()]
        return [value.strip()] if value.strip() else []
    if isinstance(value, list):
        return value
    return []
```

## Technical Details

### LangGraph Stream Mode Behavior

| Mode | Behavior |
|------|----------|
| `stream_mode="updates"` (string) | Emits events immediately as nodes complete |
| `stream_mode=["updates", "messages"]` (list) | Batches events until ALL modes have data |

**Insight:** When using list mode, LangGraph waits for all requested stream types to have data before emitting any events. This is designed for synchronized multi-stream consumption but causes perceived delays in single-consumer SSE scenarios.

### Web Search Fallback Flow

```
┌─────────────────┐
│  RAG Retrieval  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     Yes
│ docs < 3?       │────────────┐
└────────┬────────┘            │
         │ No                  ▼
         │            ┌─────────────────┐
         │            │ Web Search      │
         │            │ (Tavily API)    │
         │            └────────┬────────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────────┐
│  Merge RAG + Web Results            │
│  Mark web results with fallback=True│
└─────────────────────────────────────┘
```

### Web Search Result Format

```json
{
  "content": "Article content...",
  "score": 0.5,
  "source": "https://example.com/article",
  "title": "Article Title",
  "metadata": {
    "source_type": "web_search",
    "url": "https://example.com/article",
    "published_date": "2025-01-15",
    "fallback": true
  }
}
```

The `fallback: true` flag allows the frontend to distinguish between RAG-sourced and web-sourced documents.

## Files Modified

| File | Change Type | Lines Changed |
|------|-------------|---------------|
| `mode1_manual_interactive.py` | Configuration | ~5 |
| `rag_retriever.py` | New function + logic | ~100 |
| `agent_loader.py` | New helper + usage | ~25 |

## Testing

### Verify Streaming
```bash
curl -s -N -X POST "http://localhost:8000/api/expert/stream" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: YOUR_TENANT_ID" \
  -d '{"mode": 1, "message": "What is FDA 510k?", "expert_id": "YOUR_AGENT_ID"}' \
  | head -50
```

Expected: SSE events should appear progressively within 2-5 seconds.

### Verify Web Search Fallback
Check backend logs for:
```
ask_expert_rag_insufficient_docs  (when RAG returns < 3 docs)
ask_expert_web_search_fallback_started
ask_expert_web_search_fallback_completed
ask_expert_rag_web_fallback_added
```

## Dependencies

- **Tavily API**: Web search fallback requires `TAVILY_API_KEY` environment variable
- **LangGraph**: Version supporting `stream_mode` parameter
- **structlog**: For structured logging

## Known Limitations

1. **Tavily API Rate Limits**: Web search fallback subject to Tavily API rate limits
2. **Web Search Quality**: Web results may be less domain-specific than RAG results
3. **Latency**: Web search adds ~1-2 seconds when triggered

## Rollback Instructions

If issues arise, revert each fix:

### Revert Streaming Mode
```python
# In mode1_manual_interactive.py
stream_mode=["updates", "messages"]  # Restore list mode
```

### Disable Web Fallback
```python
# In rag_retriever.py
MIN_RAG_DOCS_THRESHOLD = 0  # Never triggers fallback
```

### Revert tools_enabled Normalization
```python
# In agent_loader.py
tools_enabled=agent_data.get("tools_enabled") or []  # Original behavior
```

## Related Documentation

- [LangGraph Streaming Documentation](https://python.langchain.com/docs/langgraph)
- [Tavily API Documentation](https://docs.tavily.com/)
- [SSE Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)

## Author

Claude Code - December 2025
