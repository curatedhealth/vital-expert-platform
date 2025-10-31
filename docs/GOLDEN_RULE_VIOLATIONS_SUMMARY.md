# Golden Rule Violations - Quick Summary

## 🎯 Golden Rule

**ALL AI/ML related services MUST be in Python and accessed via API Gateway**

---

## 📊 Summary

**Total Violations:** 23+ files

- 🔴 **CRITICAL:** 11 files
- 🟠 **HIGH:** 7 files  
- 🟡 **MEDIUM:** 5+ files

---

## 🔴 CRITICAL VIOLATIONS (Must Fix Immediately)

1. **`agent-selector-service.ts`** - Direct OpenAI API calls (4 violations)
   - Lines: 91, 110, 142-169, 790-800
   
2. **`ask-expert/chat/route.ts`** - Direct OpenAI calls (3+ violations)
   - Lines: 13, 21-23, 152-156, +more

3. **`openai-embedding-service.ts`** - Direct OpenAI embedding calls
   - Lines: 6, 31, 91-95

4. **`huggingface-embedding-service.ts`** - Direct HF API calls
   - Lines: 211, 284-287

5. **`supabase-rag-service.ts`** - Direct OpenAI embedding fallback
   - Lines: 340-368, 356-360

6. **`intelligent-agent-router.ts`** - Direct OpenAI calls
   - Lines: 15, 110

7. **`generate-system-prompt/route.ts`** - Direct OpenAI calls
   - Lines: 2, 5-7, 61-69

8. **`generate-persona/route.ts`** - Direct OpenAI calls
   - Lines: 2, 5-7, 119-128

9. **`knowledge/process/route.ts`** - Direct OpenAI embedding calls
   - Lines: 5, 10-12, 263-266

10. **`react-engine.ts`** - LangChain OpenAI usage
    - Lines: 8, 29, 35-39

11. **`chain-of-thought-engine.ts`** - LangChain OpenAI usage
    - Lines: 8, 69, 72-76

---

## 🟠 HIGH PRIORITY VIOLATIONS (Fix Soon)

12. **`unified-rag-service.ts`** - Uses TypeScript embedding factory (not Python)
    - Lines: 11, 380, 867

13. **`pinecone-vector-service.ts`** - Uses TypeScript embedding service (not Python)
    - Line: 9

14. **`llm-provider.service.ts`** - Direct API calls
    - Lines: 595-647, 649-698

15. **`unified-langgraph-orchestrator.ts`** - LangChain usage

16. **`simplified-langgraph-orchestrator.ts`** - LangChain usage

17. **`enhanced-langchain-service.ts`** - LangChain usage

18. **`cloud-rag-service.ts`** - LangChain usage

---

## 🟡 MEDIUM PRIORITY (Review and Migrate)

19. **`rag/search-hybrid/route.ts`** - Needs audit

20. **`master-orchestrator.ts`** - Needs audit

21. **`agent-ranker.ts`** - Needs audit

22. **`knowledge-domain-detector.ts`** - Needs audit

23. **Shared RAG services** - Needs audit

24. **`agent-graphrag-service.ts`** - Needs audit

25. **`agent-embedding-service.ts`** - Needs audit

---

## 📝 Full Details

See `docs/GOLDEN_RULE_VIOLATIONS_COMPLETE.md` for detailed line-by-line violations.

---

**Last Updated:** 2025-01-31

