# 🎯 5-DAY PRODUCTION-READY IMPLEMENTATION PLAN
**Start Date:** November 2, 2025  
**Target Deploy:** November 7, 2025  
**Strategy:** Fix critical issues before deploying

---

## 📅 DAY-BY-DAY BREAKDOWN

### **DAY 1: Replace Web Tool Mocks (Saturday)**

#### Morning (4 hours)
**Task 1.1: Integrate Brave Search API**
- [ ] Sign up for Brave Search API key
- [ ] Replace mock `web_search()` implementation
- [ ] Add error handling and rate limiting
- [ ] Test with 10+ queries
- [ ] Update documentation

**Files to modify:**
- `services/ai-engine/src/tools/web_tools.py`
- `services/ai-engine/src/core/config.py` (add BRAVE_API_KEY)

**Success Criteria:**
- Real search results returned
- No mock warnings in logs
- Handle API errors gracefully

#### Afternoon (4 hours)
**Task 1.2: Implement Web Scraping**
- [ ] Install BeautifulSoup4 + requests
- [ ] Replace mock `web_scrape()` implementation
- [ ] Add user-agent rotation
- [ ] Implement rate limiting (respect robots.txt)
- [ ] Test with 5+ websites

**Success Criteria:**
- Extract text content from URLs
- Handle timeouts and errors
- Sanitize HTML properly

---

### **DAY 2: Complete WHO Integration + Start Testing (Sunday)**

#### Morning (4 hours)
**Task 2.1: WHO Guidelines Integration**
- [ ] Research WHO IRIS API/scraping options
- [ ] Implement WHO guidelines search
- [ ] Cache results (24 hour TTL)
- [ ] Test with medical queries
- [ ] OR: Create curated WHO dataset

**Alternative:** If no API:
- [ ] Build local WHO guidelines index
- [ ] Use semantic search over cached documents

#### Afternoon (4 hours)
**Task 2.2: Start Mode 3/4 Testing**
- [ ] Write unit tests for `AutonomousController`
- [ ] Test state transitions
- [ ] Test continuation logic
- [ ] Test error handling
- [ ] Mock LLM responses for speed

**Target:** 20+ tests written

---

### **DAY 3: Complete Mode 3/4 + Tool Chain Testing (Monday)**

#### Morning (4 hours)
**Task 3.1: Mode 3/4 Integration Tests**
- [ ] Write integration test for Mode 3 (autonomous-auto)
- [ ] Write integration test for Mode 4 (autonomous-manual)
- [ ] Test with real OpenAI/Claude API
- [ ] Verify memory persistence
- [ ] Test tool chaining in autonomous mode

**Target:** 15+ integration tests

#### Afternoon (4 hours)
**Task 3.2: Tool Chain Testing**
- [ ] Write tests for `ToolChainExecutor`
- [ ] Test multi-tool sequences
- [ ] Test tool error recovery
- [ ] Test tool result caching
- [ ] Verify tool registry lookups

**Target:** 15+ tests

---

### **DAY 4: Security + Performance (Tuesday)**

#### Morning (4 hours)
**Task 4.1: Implement Rate Limiting**
- [ ] Install `slowapi` or `fastapi-limiter`
- [ ] Add Redis-based rate limiting
- [ ] Set limits: 10/min (free), 100/min (premium)
- [ ] Test with load tool (Apache Bench)
- [ ] Add 429 error responses

**Files:**
- `services/ai-engine/src/middleware/rate_limiting.py` (enhance)
- `services/ai-engine/src/api/routes/hybrid_search.py` (apply)

#### Afternoon (4 hours)
**Task 4.2: Fix Admin Authentication**
- [ ] Implement JWT token verification
- [ ] Add admin role checks (database)
- [ ] Create admin middleware
- [ ] Test with valid/invalid tokens
- [ ] Document admin setup

**Alternative:** Disable admin endpoints if complex

---

### **DAY 5: Final Testing + Deployment (Wednesday)**

#### Morning (4 hours)
**Task 5.1: Security Audit**
- [ ] Review all environment variables
- [ ] Set up secrets in Railway/Modal
- [ ] Verify RLS policies active
- [ ] Test cross-tenant isolation
- [ ] Scan for security vulnerabilities
- [ ] Review OWASP Top 10 compliance

**Tools:**
- `bandit` for Python security scan
- `safety` for dependency vulnerabilities
- Manual RLS testing

#### Afternoon (4 hours)
**Task 5.2: Deploy + Smoke Test**
- [ ] Build Docker image
- [ ] Push to Railway/Modal
- [ ] Verify all services start
- [ ] Run smoke test suite:
  - [ ] Health check
  - [ ] Mode 1 query
  - [ ] Mode 2 query
  - [ ] Mode 3 query
  - [ ] Mode 4 query
  - [ ] Agent search
  - [ ] RAG query
  - [ ] Panel orchestration
- [ ] Monitor logs for 1 hour
- [ ] Load test (50 concurrent users)

---

## 📋 DETAILED TASK BREAKDOWN

### Priority 1: Web Tools (CRITICAL)

**Current State:**
```python
# tools/web_tools.py - MOCK
async def web_search(query: str) -> Dict[str, Any]:
    logger.warning("⚠️ Using MOCK web search")
    return {"results": [{"title": "Mock"}], "mock": True}
```

**Target State:**
```python
# tools/web_tools.py - REAL
async def web_search(query: str) -> Dict[str, Any]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.search.brave.com/res/v1/web/search",
            headers={"X-Subscription-Token": settings.BRAVE_API_KEY},
            params={"q": query, "count": 10}
        )
        return response.json()
```

**Implementation Steps:**
1. Add to `requirements.txt`: `httpx==0.25.0`, `beautifulsoup4==4.12.2`
2. Add to `.env`: `BRAVE_API_KEY=your_key_here`
3. Update `web_search()` function
4. Add error handling (timeout, rate limit, API errors)
5. Add retry logic (3 attempts)
6. Write 5+ tests

---

### Priority 2: Mode 3/4 Testing (HIGH)

**Test Coverage Needed:**

**Unit Tests (20+):**
- `test_autonomous_controller.py`:
  - Test initialization
  - Test `should_continue()` logic
  - Test max iterations limit
  - Test goal completion detection
  - Test error threshold handling
  - Test state persistence
  
- `test_mode3_workflow.py`:
  - Test workflow initialization
  - Test node execution order
  - Test agent selection in autonomous mode
  - Test tool execution
  - Test memory integration

**Integration Tests (15+):**
- `test_mode3_integration.py`:
  - Test full Mode 3 execution
  - Test with multi-step goal
  - Test tool chaining
  - Test error recovery
  - Test timeout handling

---

### Priority 3: Rate Limiting (MEDIUM)

**Implementation:**

```python
# middleware/rate_limiting.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}"
)

# Apply to routes
@app.post("/api/agents/query")
@limiter.limit("10/minute")  # Free tier
async def query_agent(...):
    ...
```

**Configuration:**
- Free tier: 10 requests/minute
- Premium tier: 100 requests/minute
- Burst allowance: 2x rate
- 429 error with Retry-After header

---

### Priority 4: Admin Auth (MEDIUM)

**Two Options:**

**Option A: Full JWT (Complex, 4+ hours)**
- Implement JWT verification
- Add admin role in database
- Create admin middleware
- Test thoroughly

**Option B: Disable Admin (Simple, 30 mins)**
- Comment out admin endpoints
- Add TODO for future implementation
- Document decision

**Recommendation:** Option B for MVP, Option A for v2

---

## 🧪 TESTING STRATEGY

### Test Pyramid
```
           /\
          /  \     E2E Tests (5)
         /____\    
        /      \   Integration Tests (30)
       /________\  
      /          \ Unit Tests (60+)
     /____________\
```

### Test Priorities
1. **Unit Tests (60+):** Fast, mock everything
2. **Integration Tests (30):** Real DB, real LLM
3. **E2E Tests (5):** Full user workflows

### Coverage Target
- Overall: 60%+
- Critical paths: 90%+
- New code: 80%+

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All tests pass (`pytest`)
- [ ] No critical TODOs in code
- [ ] Dependencies updated (`pip freeze`)
- [ ] Docker builds successfully
- [ ] Environment variables documented
- [ ] Security scan passed
- [ ] Load test passed (50 concurrent)

### Deployment
- [ ] Deploy to Railway/Modal
- [ ] Verify health endpoint
- [ ] Run smoke tests
- [ ] Monitor logs (no errors)
- [ ] Check response times (<2s)
- [ ] Verify caching working

### Post-Deployment
- [ ] Monitor for 24 hours
- [ ] Check error rates (<1%)
- [ ] Review performance metrics
- [ ] User acceptance testing
- [ ] Documentation updated

---

## 📊 SUCCESS METRICS

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Test Coverage | 60%+ | `pytest --cov` |
| Response Time | <2s P95 | Load testing |
| Error Rate | <1% | Log analysis |
| Uptime | 99%+ | Monitoring |
| Cache Hit Rate | 50%+ | Redis stats |

---

## 🛠️ TOOLS NEEDED

### Development
- [ ] Brave Search API account
- [ ] Redis (for caching + rate limiting)
- [ ] pytest + coverage
- [ ] Docker
- [ ] httpx (HTTP client)
- [ ] BeautifulSoup4 (scraping)

### Testing
- [ ] pytest-asyncio
- [ ] pytest-mock
- [ ] Apache Bench (load testing)
- [ ] bandit (security)
- [ ] safety (dependencies)

### Deployment
- [ ] Railway account
- [ ] Environment secrets
- [ ] Monitoring (Sentry/Langfuse)

---

## 🎯 RISK MITIGATION

| Risk | Mitigation |
|------|------------|
| Brave API rate limits | Cache aggressively, fallback to DuckDuckGo |
| Mode 3/4 still broken | Deploy without autonomous modes initially |
| Tests take too long | Parallelize with pytest-xdist |
| Deployment fails | Keep old version, quick rollback |
| API costs spike | Set OpenAI rate limits, monitor spend |

---

## 📝 DAILY STANDUP FORMAT

**Every day at 9am:**
- What did I complete yesterday?
- What will I complete today?
- Any blockers?
- Test coverage percentage?

---

**Status:** Plan Created, Ready to Execute  
**Next Step:** Start Day 1 - Replace Web Tool Mocks  
**Confidence:** 85% (realistic timeline, clear tasks)

