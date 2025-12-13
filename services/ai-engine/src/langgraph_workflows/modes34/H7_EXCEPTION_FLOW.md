# H7 Exception Flow Diagram

## Exception Handling Decision Tree

```
┌─────────────────────────────────────────────────────────────────┐
│                    Operation Executed                           │
│                   (decorated function)                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Success?     │
                    └───────┬───────┘
                            │
                ┌───────────┴───────────┐
                │                       │
              YES                      NO
                │                       │
                ▼                       ▼
        ┌───────────────┐      ┌──────────────────┐
        │ Return Result │      │ Exception Raised │
        └───────────────┘      └────────┬─────────┘
                                        │
                                        ▼
                            ┌──────────────────────────┐
                            │ Exception Classification │
                            └────────────┬─────────────┘
                                        │
        ┌───────────────────────────────┼─────────────────────────────────┐
        │                               │                                 │
        ▼                               ▼                                 ▼
┌───────────────────┐       ┌───────────────────────┐     ┌─────────────────────────┐
│ CancelledError?   │       │ WorkflowResilienceError?│    │ Generic Exception?      │
└────────┬──────────┘       └───────────┬───────────┘     └──────────┬──────────────┘
         │                               │                            │
        YES                             YES                          YES
         │                               │                            │
         ▼                               ▼                            ▼
┌──────────────────┐          ┌──────────────────┐        ┌────────────────────────┐
│ Log Warning      │          │ Re-raise As-Is   │        │ Pattern Match Domain   │
│ PROPAGATE (C5)   │          └──────────────────┘        └──────────┬─────────────┘
└──────────────────┘                                                 │
                                                                     ▼
                                        ┌────────────────────────────────────────┐
                                        │ Domain-Specific Classification         │
                                        └──────────────┬─────────────────────────┘
                                                      │
        ┌─────────────────┬──────────────────────────┼─────────────────┬───────────────────┐
        │                 │                          │                 │                   │
        ▼                 ▼                          ▼                 ▼                   ▼
  ┌──────────┐    ┌──────────────┐        ┌─────────────────┐  ┌──────────────┐  ┌──────────────┐
  │ Database │    │ Agent        │        │ Research        │  │ Template     │  │ Validation   │
  │ Error    │    │ Selection    │        │ Quality         │  │ Load         │  │ Error        │
  └────┬─────┘    └──────┬───────┘        └────────┬────────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                         │                  │                  │
       ▼                 ▼                         ▼                  ▼                  ▼
  Connection      Selection Failure        Quality Check      Template       Input Validation
  Timeout         No Agents Found          L4 Worker Fail     Not Found      Schema Error
       │                 │                         │                  │                  │
       ▼                 ▼                         ▼                  ▼                  ▼
  Recoverable=YES  Recoverable=YES          Recoverable=YES    Recoverable=NO   Recoverable=NO
  Retry=YES        Retry=YES                Retry=YES          Retry=NO         Retry=NO
       │                 │                         │                  │                  │
       └─────────────────┴─────────────────────────┴──────────────────┴──────────────────┘
                                                   │
                                                   ▼
                                    ┌──────────────────────────────┐
                                    │ Check Recovery Strategy      │
                                    └──────────────┬───────────────┘
                                                  │
                                    ┌─────────────┴──────────────┐
                                    │                            │
                                   YES                          NO
                          (Recoverable=YES AND                (Non-Recoverable OR
                           fallback_value != None)             fallback_value == None)
                                    │                            │
                                    ▼                            ▼
                        ┌──────────────────────┐    ┌────────────────────────────┐
                        │ Log Error            │    │ Log Error                  │
                        │ Use Fallback Value   │    │ Raise Specific Exception   │
                        │ Return to Caller     │    │ Propagate with Context     │
                        └──────────────────────┘    └────────────────────────────┘
```

## Exception Type Decision Matrix

### Database Domain

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Pattern Match                    │ Exception Type            │ Recoverable │
├─────────────────────────────────────────────────────────────────────────────┤
│ "connection refused"             │ DatabaseConnectionError   │ YES ✓       │
│ "connection timeout"             │ DatabaseConnectionError   │ YES ✓       │
│ "too many connections"           │ DatabaseConnectionError   │ YES ✓       │
│ "pool exhausted"                 │ DatabaseConnectionError   │ YES ✓       │
├─────────────────────────────────────────────────────────────────────────────┤
│ "SQL syntax error"               │ DatabaseQueryError        │ NO ✗        │
│ "constraint violation"           │ DatabaseQueryError        │ NO ✗        │
│ "foreign key"                    │ DatabaseQueryError        │ NO ✗        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Agent Domain

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Pattern Match                    │ Exception Type            │ Recoverable │
├─────────────────────────────────────────────────────────────────────────────┤
│ "no agents found"                │ AgentSelectionError       │ YES ✓       │
│ "agent selection failed"         │ AgentSelectionError       │ YES ✓       │
│ "GraphRAG error"                 │ AgentSelectionError       │ YES ✓       │
│ "Pinecone timeout"               │ AgentSelectionError       │ YES ✓       │
├─────────────────────────────────────────────────────────────────────────────┤
│ "agent does not exist"           │ AgentNotFoundError        │ NO ✗        │
│ "invalid agent id"               │ AgentNotFoundError        │ NO ✗        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Research Domain

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Pattern Match                    │ Exception Type            │ Recoverable │
├─────────────────────────────────────────────────────────────────────────────┤
│ "research quality error"         │ ResearchQualityError      │ YES ✓       │
│ "L4 worker timeout"              │ ResearchQualityError      │ YES ✓       │
│ "evidence gathering failed"      │ ResearchQualityError      │ YES ✓       │
├─────────────────────────────────────────────────────────────────────────────┤
│ "citation error"                 │ CitationVerificationError │ YES ✓       │
│ "PubMed unavailable"             │ CitationVerificationError │ YES ✓       │
│ "source not verifiable"          │ CitationVerificationError │ YES ✓       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Logging Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    Exception Caught                            │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
                   ┌────────────────┐
                   │ Log Error with │
                   │ Full Context   │
                   └────────┬───────┘
                            │
                            ▼
        ┌───────────────────────────────────────────┐
        │ Structured Log Entry                      │
        ├───────────────────────────────────────────┤
        │ • operation: "fetch_agents"               │
        │ • domain: "database"                      │
        │ • original_error: "Connection refused"    │
        │ • original_error_type: "ConnectionError"  │
        │ • classified_as: "DatabaseConnectionError"│
        │ • recoverable: true                       │
        │ • retry_suggested: true                   │
        │ • using_fallback: true                    │
        │ • phase: "H7_graceful_degradation"        │
        └───────────────────┬───────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
          Using Fallback           Propagating
                │                       │
                ▼                       ▼
    ┌────────────────────┐    ┌────────────────────┐
    │ Log Info:          │    │ Raise Specific     │
    │ "fallback_used"    │    │ Exception Type     │
    │ fallback_type: dict│    │ with Context       │
    └────────────────────┘    └────────────────────┘
```

## Comparison: Old vs New

### OLD: Blanket Exception Handling

```
┌─────────────────────────────────────────────┐
│ Operation Executed                          │
└──────────────┬──────────────────────────────┘
               │
               ▼
       ┌───────────────┐
       │  Success?     │
       └───────┬───────┘
               │
       ┌───────┴────────┐
       │                │
      YES              NO
       │                │
       ▼                ▼
   ┌────────┐    ┌──────────────┐
   │ Return │    │ Exception    │
   └────────┘    └──────┬───────┘
                        │
                        ▼
                ┌───────────────────┐
                │ catch Exception   │  ❌ CATCHES EVERYTHING
                │ (BLANKET CATCH)   │  ❌ Including CancelledError
                └────────┬──────────┘  ❌ Including code bugs
                         │              ❌ No classification
                         ▼              ❌ Minimal logging
                 ┌───────────────┐
                 │ Log Error     │
                 │ Return Fallback│
                 └───────────────┘
```

### NEW: Specific Exception Handling

```
┌─────────────────────────────────────────────┐
│ Operation Executed                          │
└──────────────┬──────────────────────────────┘
               │
               ▼
       ┌───────────────┐
       │  Success?     │
       └───────┬───────┘
               │
       ┌───────┴────────┐
       │                │
      YES              NO
       │                │
       ▼                ▼
   ┌────────┐    ┌──────────────────┐
   │ Return │    │ Exception        │
   └────────┘    └──────┬───────────┘
                        │
                        ├─► CancelledError ──► PROPAGATE ✓ (C5)
                        ├─► KeyboardInterrupt ──► PROPAGATE ✓
                        ├─► SystemExit ──► PROPAGATE ✓
                        │
                        ▼
                ┌───────────────────────┐
                │ Pattern Classification│  ✓ 8 domains
                └────────┬──────────────┘  ✓ 50+ patterns
                         │                 ✓ Specific types
                         ▼                 ✓ Rich logging
                 ┌───────────────────┐
                 │ Recoverable?      │
                 └────┬──────────────┘
                      │
              ┌───────┴────────┐
             YES              NO
              │                │
              ▼                ▼
      ┌─────────────┐   ┌──────────────┐
      │ Use Fallback│   │ Propagate as │
      │ Return      │   │ Specific Type│
      └─────────────┘   └──────────────┘
```

## Decorator Composition

### Recommended Pattern for Mode 3/4

```
┌─────────────────────────────────────────────────────────────┐
│              Node Error Handler (C2)                        │
│  @handle_node_errors(node_name="research_node")            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           LLM Timeout Protection (C1)                 │ │
│  │  @invoke_llm_with_timeout(timeout=30.0, retries=3)   │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │      Graceful Degradation (H7)                  │ │ │
│  │  │  @graceful_degradation(domain="research", ...)  │ │ │
│  │  │                                                 │ │ │
│  │  │  ┌───────────────────────────────────────────┐ │ │ │
│  │  │  │        Your Operation                     │ │ │ │
│  │  │  │  async def research_operation():          │ │ │ │
│  │  │  │      # Your code here                     │ │ │ │
│  │  │  │      ...                                  │ │ │ │
│  │  │  └───────────────────────────────────────────┘ │ │ │
│  │  │                                                 │ │ │
│  │  │  ✓ Classifies exceptions                       │ │ │
│  │  │  ✓ NEVER catches CancelledError                │ │ │
│  │  │  ✓ Specific exception types                    │ │ │
│  │  │  ✓ Recoverable vs non-recoverable             │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │                                                       │ │
│  │  ✓ Prevents LLM hangs                                │ │
│  │  ✓ Exponential backoff retry                         │ │
│  │  ✓ Circuit breaker pattern                           │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ✓ Node-level error tracking                               │
│  ✓ Error state management                                  │
│  ✓ Recoverable error detection                             │
└─────────────────────────────────────────────────────────────┘
```

## Real-World Example: Citation Verification

### Flow with All Resilience Layers

```
┌────────────────────────────────────────────────────────────────┐
│ verify_citations_node(state: MissionState)                     │
│                                                                │
│ @handle_node_errors(node_name="verify_citations")             │
│ async def verify_citations_node(state):                       │
└──────────────────────┬─────────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │ Call verify_citations(citations)     │
        │                                      │
        │ @research_operation(                │
        │     fallback_value={"verified": 0}  │
        │ )                                   │
        └─────────────┬────────────────────────┘
                      │
                      ▼
        ┌──────────────────────────────────────┐
        │ async with SecureHTTPClient() as c:  │
        │     for citation in citations:       │
        │         verify_single_citation(c)    │
        └─────────────┬────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
   Success Path                 Error Path
        │                            │
        ▼                            ▼
┌───────────────┐         ┌─────────────────────────┐
│ Return Results│         │ Exception Raised        │
└───────────────┘         └──────────┬──────────────┘
                                     │
                    ┌────────────────┴─────────────────┐
                    │                                  │
              TimeoutError                      HTTPStatusError
                    │                                  │
                    ▼                                  ▼
        ┌───────────────────────┐          ┌──────────────────────┐
        │ Classified: Recoverable│         │ Classified:          │
        │ Use fallback           │         │ Non-recoverable      │
        │ {"verified": 0}        │         │ Propagate as         │
        │ Retry suggested: YES   │         │ CitationError        │
        └───────────────────────┘          └──────────────────────┘
                    │                                  │
                    └──────────────┬───────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ Node Error Handler (C2)      │
                    │ Logs error to state          │
                    │ Continues workflow           │
                    └──────────────────────────────┘
```

## Key Benefits Summary

### Before H7 (Grade C)
```
❌ Blanket exception handling
❌ CancelledError could be caught
❌ No exception classification
❌ All errors treated the same
❌ Minimal logging context
❌ No recovery strategy
❌ Code bugs masked
```

### After H7 (Grade A)
```
✅ Specific exception types
✅ CancelledError NEVER caught (C5)
✅ 8-domain classification
✅ Recoverable vs non-recoverable
✅ Rich structured logging
✅ Smart recovery strategies
✅ Code bugs visible
✅ Retry suggestions
✅ Production debugging support
```

## References

- **Implementation**: `resilience/graceful_degradation.py`
- **Tests**: `tests/unit/test_graceful_degradation.py`
- **Documentation**: `H7_GRACEFUL_DEGRADATION_IMPLEMENTATION.md`
- **Summary**: `H7_IMPLEMENTATION_SUMMARY.md`
