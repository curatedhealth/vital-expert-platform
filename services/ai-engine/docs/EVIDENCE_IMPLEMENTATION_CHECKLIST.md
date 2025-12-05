# Evidence-Based Response System - Implementation Checklist

**Project:** VITAL AI Platform - Evidence-Based Response Architecture
**Owner:** Data Strategy + Engineering Team
**Timeline:** 4 weeks (Phased rollout)
**Status:** READY FOR IMPLEMENTATION

---

## Phase 1: Core Evidence Infrastructure (Week 1)

### Database Schema

- [ ] **Create `l5_findings_audit` table**
  - File: `/database/migrations/20251202_create_l5_findings_audit.sql`
  - Columns: id, session_id, agent_id, l5_tool_type, finding, evidence_score, query, created_at
  - Indexes: session_id, agent_id, l5_tool_type, created_at
  - **Assigned to:** Database Team
  - **Estimated time:** 2 hours

- [ ] **Create `artifacts` table**
  - File: `/database/migrations/20251202_create_artifacts.sql`
  - Columns: id, session_id, artifact_type, title, content, confidence, evidence_sources, pdf_url, created_at, archived_at
  - Indexes: session_id, artifact_type, created_at
  - **Assigned to:** Database Team
  - **Estimated time:** 2 hours

- [ ] **Create `artifact_findings` junction table**
  - File: `/database/migrations/20251202_create_artifact_findings.sql`
  - Columns: artifact_id, l5_finding_id, citation_number
  - Indexes: artifact_id
  - **Assigned to:** Database Team
  - **Estimated time:** 1 hour

### Evidence Scoring Implementation

- [ ] **Implement EVIDENCE_QUALITY_SCORES hierarchy**
  - File: `/services/ai-engine/src/config/evidence_quality_scores.py`
  - 6-tier hierarchy with base scores
  - Domain-specific score mappings
  - **Assigned to:** ML Team
  - **Estimated time:** 4 hours

- [ ] **Implement evidence scoring algorithm**
  - File: `/services/ai-engine/src/services/evidence_scorer.py`
  - Function: `score_evidence_quality()`
  - Weights: Source Quality (40%), Relevance (30%), Recency (15%), Cross-Validation (15%)
  - **Assigned to:** ML Team
  - **Estimated time:** 8 hours

- [ ] **Add cross-validation checker**
  - File: `/services/ai-engine/src/services/evidence_scorer.py`
  - Function: `check_cross_validation()`
  - Semantic similarity check across L5 findings
  - **Assigned to:** ML Team
  - **Estimated time:** 6 hours

### RAG Namespace Resolution

- [ ] **Create namespace resolution logic**
  - File: `/services/ai-engine/src/services/namespace_resolver.py`
  - 3-tier hierarchy: Agent → Role → Domain
  - Function: `resolve_rag_namespaces(agent, role)`
  - **Assigned to:** Backend Team
  - **Estimated time:** 6 hours

- [ ] **Define DOMAIN_DEFAULT_NAMESPACES mapping**
  - File: `/services/ai-engine/src/config/domain_namespaces.py`
  - Map domains to default namespaces
  - Cover all agent knowledge domains
  - **Assigned to:** Data Team
  - **Estimated time:** 4 hours

- [ ] **Create namespace migration script**
  - File: `/database/migrations/20251202_assign_default_namespaces.sql`
  - Assign namespaces to all agents without them
  - Target: 100% coverage
  - **Assigned to:** Database Team
  - **Estimated time:** 3 hours

- [ ] **Run migration and verify coverage**
  - Execute migration script
  - Verify: `SELECT COUNT(*) FROM agents WHERE metadata->>'knowledge_namespaces' IS NULL`
  - Should return 0
  - **Assigned to:** Database Team
  - **Estimated time:** 1 hour

### L4 Context Engineer Updates

- [ ] **Add evidence scoring to L4 aggregation**
  - File: `/services/ai-engine/src/services/l4_context_engineer.py`
  - Import evidence scorer
  - Score all L5 findings
  - Sort by evidence quality
  - **Assigned to:** Backend Team
  - **Estimated time:** 6 hours

- [ ] **Add audit trail storage**
  - File: `/services/ai-engine/src/services/l4_context_engineer.py`
  - Store all L5 findings to `l5_findings_audit`
  - Include evidence scores
  - Link to session and agent
  - **Assigned to:** Backend Team
  - **Estimated time:** 4 hours

- [ ] **Implement tier-based prioritization**
  - File: `/services/ai-engine/src/services/l4_context_engineer.py`
  - Priority 1: Regulatory sources (always include)
  - Priority 2-6: Fill token budget by tier
  - **Assigned to:** Backend Team
  - **Estimated time:** 4 hours

### Testing

- [ ] **Unit tests for evidence scorer**
  - File: `/services/ai-engine/tests/test_evidence_scorer.py`
  - Test all scoring components
  - Test edge cases (no sources, all sources same tier)
  - **Assigned to:** QA Team
  - **Estimated time:** 6 hours

- [ ] **Integration tests for L4 Context Engineer**
  - File: `/services/ai-engine/tests/test_l4_evidence_integration.py`
  - Test end-to-end evidence scoring
  - Test audit trail storage
  - **Assigned to:** QA Team
  - **Estimated time:** 6 hours

- [ ] **Namespace resolution tests**
  - File: `/services/ai-engine/tests/test_namespace_resolver.py`
  - Test all 3 tiers of hierarchy
  - Test fallback to general
  - **Assigned to:** QA Team
  - **Estimated time:** 4 hours

**Phase 1 Total Estimated Time:** 67 hours (1.7 weeks with 2 engineers)

---

## Phase 2: Mandatory Evidence Enforcement (Week 2)

### L5 Tool Configuration

- [ ] **Make RAG mandatory for all queries**
  - File: `/services/ai-engine/src/services/mode1_config_resolver.py`
  - File: `/services/ai-engine/src/services/mode3_config_resolver.py`
  - Set `l5_rag_enabled: true` (remove optional flag)
  - **Assigned to:** Backend Team
  - **Estimated time:** 2 hours

- [ ] **Make WebSearch mandatory for Mode 3**
  - File: `/services/ai-engine/src/services/mode3_config_resolver.py`
  - Always include 'websearch' in enabled_tools
  - **Assigned to:** Backend Team
  - **Estimated time:** 2 hours

- [ ] **Implement intelligent WebSearch for Mode 1**
  - File: `/services/ai-engine/src/services/mode1_config_resolver.py`
  - Function: `should_include_websearch(query, agent_config)`
  - Skip if high RAG coverage (cost optimization)
  - **Assigned to:** ML Team
  - **Estimated time:** 6 hours

### Evidence Quality Validation

- [ ] **Implement minimum quality thresholds**
  - File: `/services/ai-engine/src/services/evidence_validator.py`
  - Define thresholds by query type
  - Function: `validate_evidence_quality(query_type, scores)`
  - **Assigned to:** Backend Team
  - **Estimated time:** 4 hours

- [ ] **Add evidence quality warnings to responses**
  - File: `/services/ai-engine/src/services/response_formatter.py`
  - Add warning banner if quality < threshold
  - Suggest alternative sources
  - **Assigned to:** Backend Team
  - **Estimated time:** 4 hours

- [ ] **Implement escalation for low-quality evidence**
  - File: `/services/ai-engine/src/services/evidence_escalator.py`
  - If quality < 0.60, suggest human expert
  - Log escalation events
  - **Assigned to:** Backend Team
  - **Estimated time:** 4 hours

### Caching Implementation

- [ ] **Set up Redis for L5 result caching**
  - Configure Redis connection
  - Set 24-hour TTL
  - **Assigned to:** DevOps Team
  - **Estimated time:** 3 hours

- [ ] **Implement cache key generation**
  - File: `/services/ai-engine/src/services/cache_manager.py`
  - Function: `generate_l5_cache_key(query, tool_type, config)`
  - Include query hash, tool type, namespaces
  - **Assigned to:** Backend Team
  - **Estimated time:** 3 hours

- [ ] **Add caching to L5 RAG Tool**
  - File: `/services/ai-engine/src/tools/rag_tool.py`
  - Check cache before execution
  - Store results on cache miss
  - **Assigned to:** Backend Team
  - **Estimated time:** 4 hours

- [ ] **Add caching to L5 WebSearch Tool**
  - File: `/services/ai-engine/src/services/l5_websearch_tool.py`
  - Check cache before API call
  - Store results on cache miss
  - **Assigned to:** Backend Team
  - **Estimated time:** 4 hours

### Testing

- [ ] **Load testing with mandatory evidence**
  - Measure latency impact
  - Target: Mode 1 < 5s, Mode 3 < 60s
  - **Assigned to:** QA Team
  - **Estimated time:** 8 hours

- [ ] **Cache performance testing**
  - Measure cache hit rate
  - Target: > 40% hit rate
  - **Assigned to:** QA Team
  - **Estimated time:** 4 hours

- [ ] **Evidence quality validation testing**
  - Test threshold enforcement
  - Test warning display
  - **Assigned to:** QA Team
  - **Estimated time:** 4 hours

**Phase 2 Total Estimated Time:** 52 hours (1.3 weeks with 2 engineers)

---

## Phase 3: Artifact Generation (Week 3)

### Artifact Generator Service

- [ ] **Create artifact generator service**
  - File: `/services/ai-engine/src/services/artifact_generator.py`
  - Class: `ArtifactGenerator`
  - **Assigned to:** Backend Team
  - **Estimated time:** 8 hours

- [ ] **Implement Mode 1 reference card generation**
  - File: `/services/ai-engine/src/services/artifact_generator.py`
  - Function: `generate_reference_card(query, response, findings)`
  - Format: Structured (bullet points)
  - Max size: 2000 tokens
  - **Assigned to:** Backend Team
  - **Estimated time:** 8 hours

- [ ] **Implement Mode 3 research report generation**
  - File: `/services/ai-engine/src/services/artifact_generator.py`
  - Function: `generate_research_report(query, response, findings)`
  - Format: Narrative with sections
  - Max size: 8000 tokens
  - **Assigned to:** Backend Team
  - **Estimated time:** 12 hours

- [ ] **Add artifact criteria checking**
  - File: `/services/ai-engine/src/services/artifact_generator.py`
  - Function: `should_generate_artifact(mode, confidence, sources)`
  - Mode 1: confidence > 0.70, sources >= 2
  - Mode 3: confidence > 0.75, sources >= 5
  - **Assigned to:** Backend Team
  - **Estimated time:** 3 hours

### Artifact Storage

- [ ] **Implement artifact storage**
  - File: `/services/ai-engine/src/services/artifact_storage.py`
  - Store to `artifacts` table
  - Link findings via `artifact_findings`
  - **Assigned to:** Backend Team
  - **Estimated time:** 6 hours

- [ ] **Add artifact retrieval endpoints**
  - File: `/services/ai-engine/src/api/routes/artifacts.py`
  - GET /artifacts/{artifact_id}
  - GET /artifacts/session/{session_id}
  - **Assigned to:** Backend Team
  - **Estimated time:** 4 hours

### Export Functionality

- [ ] **Set up S3 bucket for artifact exports**
  - Bucket: `vital-artifacts-{env}`
  - Lifecycle: 1 year retention
  - **Assigned to:** DevOps Team
  - **Estimated time:** 2 hours

- [ ] **Implement PDF export**
  - File: `/services/ai-engine/src/services/artifact_exporter.py`
  - Use library: `weasyprint` or `reportlab`
  - Generate from artifact JSON
  - Upload to S3
  - **Assigned to:** Backend Team
  - **Estimated time:** 10 hours

- [ ] **Implement DOCX export**
  - File: `/services/ai-engine/src/services/artifact_exporter.py`
  - Use library: `python-docx`
  - Generate from artifact JSON
  - Upload to S3
  - **Assigned to:** Backend Team
  - **Estimated time:** 10 hours

### TTL Management

- [ ] **Implement artifact TTL service**
  - File: `/services/ai-engine/src/services/artifact_ttl_manager.py`
  - Cron job: Daily at 2 AM
  - Archive Mode 1 artifacts > 30 days
  - Archive Mode 3 artifacts > 1 year
  - **Assigned to:** Backend Team
  - **Estimated time:** 6 hours

- [ ] **Add TTL monitoring**
  - Log archive events
  - Alert if TTL job fails
  - **Assigned to:** DevOps Team
  - **Estimated time:** 3 hours

### Integration

- [ ] **Integrate artifact generation into Mode 1 workflow**
  - File: `/services/ai-engine/src/langgraph_workflows/mode1_manual_interactive.py`
  - Add artifact generation node
  - **Assigned to:** Backend Team
  - **Estimated time:** 4 hours

- [ ] **Integrate artifact generation into Mode 3 workflow**
  - File: `/services/ai-engine/src/langgraph_workflows/mode3_manual_autonomous.py`
  - Add artifact generation node
  - **Assigned to:** Backend Team
  - **Estimated time:** 4 hours

### Testing

- [ ] **Artifact generation tests**
  - Test Mode 1 reference cards
  - Test Mode 3 research reports
  - Test criteria checking
  - **Assigned to:** QA Team
  - **Estimated time:** 8 hours

- [ ] **Export functionality tests**
  - Test PDF export
  - Test DOCX export
  - Verify S3 upload
  - **Assigned to:** QA Team
  - **Estimated time:** 6 hours

- [ ] **TTL management tests**
  - Test archive logic
  - Test different TTLs
  - **Assigned to:** QA Team
  - **Estimated time:** 4 hours

**Phase 3 Total Estimated Time:** 98 hours (2.5 weeks with 2 engineers)

---

## Phase 4: Advanced Features (Week 4)

### Recency Decay

- [ ] **Implement recency decay function**
  - File: `/services/ai-engine/src/services/evidence_scorer.py`
  - Function: `calculate_recency_score(published_date, content_type)`
  - Decay rates: Regulatory (10%/yr), Scientific (20%/yr), General (50%/yr)
  - **Assigned to:** ML Team
  - **Estimated time:** 4 hours

- [ ] **Extract publication dates from sources**
  - Add to L5 findings metadata
  - Parse from URLs and content
  - **Assigned to:** ML Team
  - **Estimated time:** 6 hours

### Cross-Validation Enhancement

- [ ] **Implement semantic similarity for cross-validation**
  - File: `/services/ai-engine/src/services/evidence_scorer.py`
  - Use embeddings to compare findings
  - Threshold: 0.70 for corroboration
  - **Assigned to:** ML Team
  - **Estimated time:** 8 hours

- [ ] **Add cross-validation to evidence scoring**
  - Update scoring algorithm
  - Weight: 15%
  - **Assigned to:** ML Team
  - **Estimated time:** 4 hours

### Cost Optimization

- [ ] **Implement token budget optimizer**
  - File: `/services/ai-engine/src/services/token_optimizer.py`
  - Function: `optimize_token_budget(findings, budget)`
  - Prioritize high-quality findings
  - Ensure diversity
  - **Assigned to:** ML Team
  - **Estimated time:** 6 hours

- [ ] **Add intelligent L5 tool selection**
  - File: `/services/ai-engine/src/services/tool_selector.py`
  - Function: `select_l5_tools(query, agent, mode)`
  - Skip WebSearch if high RAG coverage (Mode 1 only)
  - **Assigned to:** ML Team
  - **Estimated time:** 6 hours

- [ ] **Monitor cost savings from caching**
  - Track cache hit rate
  - Calculate savings
  - Alert if savings < 15%
  - **Assigned to:** DevOps Team
  - **Estimated time:** 4 hours

### Monitoring Dashboard

- [ ] **Create evidence quality dashboard**
  - Tool: Grafana or custom dashboard
  - Metrics: Quality by tier, tool performance, artifact generation
  - **Assigned to:** DevOps Team
  - **Estimated time:** 12 hours

- [ ] **Add evidence quality alerts**
  - Alert if avg quality < 0.70 for 1 hour
  - Alert if evidence sources < 2 for 30% of queries
  - **Assigned to:** DevOps Team
  - **Estimated time:** 4 hours

- [ ] **Create cost analysis dashboard**
  - Track L5 tool costs
  - Track LLM costs
  - Show savings from caching
  - **Assigned to:** DevOps Team
  - **Estimated time:** 8 hours

### Documentation

- [ ] **Update API documentation**
  - Document new artifact endpoints
  - Document evidence scoring
  - **Assigned to:** Tech Writer
  - **Estimated time:** 6 hours

- [ ] **Create user guide for artifacts**
  - How to generate artifacts
  - How to export (PDF, DOCX)
  - **Assigned to:** Tech Writer
  - **Estimated time:** 4 hours

- [ ] **Create admin guide for evidence quality**
  - How to monitor evidence quality
  - How to adjust thresholds
  - **Assigned to:** Tech Writer
  - **Estimated time:** 4 hours

### Testing

- [ ] **End-to-end testing with all features**
  - Test complete flow: Query → Evidence → Artifact
  - Verify all quality gates
  - **Assigned to:** QA Team
  - **Estimated time:** 12 hours

- [ ] **Performance testing**
  - Load test with 1000 concurrent queries
  - Measure latency, cache hit rate, cost
  - **Assigned to:** QA Team
  - **Estimated time:** 8 hours

- [ ] **User acceptance testing**
  - Test with 10 pilot users
  - Gather feedback on artifact quality
  - **Assigned to:** Product Team
  - **Estimated time:** 16 hours

**Phase 4 Total Estimated Time:** 112 hours (2.8 weeks with 2 engineers)

---

## Success Criteria (Final Verification)

### Evidence Coverage

- [ ] **Verify 95% queries have 2+ sources**
  - Query: Count queries with < 2 sources in last 7 days
  - Target: < 5%
  - **Verification method:** SQL query on `l5_findings_audit`

- [ ] **Verify 80% queries have quality > 0.75**
  - Query: AVG(evidence_score->>'overall_score') by query
  - Target: > 80% above 0.75
  - **Verification method:** SQL query on `l5_findings_audit`

- [ ] **Verify 60% regulatory queries have regulatory sources**
  - Query: Count regulatory queries with Tier 1 sources
  - Target: > 60%
  - **Verification method:** SQL query on `l5_findings_audit`

### Performance

- [ ] **Verify Mode 1 response time < 5 seconds**
  - Measure: p95 latency
  - Target: < 5s
  - **Verification method:** Grafana dashboard

- [ ] **Verify Mode 3 response time 30s-5min**
  - Measure: p95 latency
  - Target: < 5 min
  - **Verification method:** Grafana dashboard

- [ ] **Verify L5 cache hit rate > 40%**
  - Measure: Cache hits / Total requests
  - Target: > 40%
  - **Verification method:** Redis stats

### Quality

- [ ] **Verify user satisfaction > 4.0/5.0**
  - Measure: User ratings on artifacts
  - Target: > 4.0
  - **Verification method:** Feedback form

- [ ] **Verify hallucination rate < 2%**
  - Measure: User reports of incorrect information
  - Target: < 2%
  - **Verification method:** Support ticket analysis

- [ ] **Verify citation quality > 90%**
  - Measure: Valid, accessible citations
  - Target: > 90%
  - **Verification method:** Manual audit (sample 100 citations)

### Cost

- [ ] **Verify average cost $0.10-$0.30 per query**
  - Measure: Total cost / Total queries
  - Target: $0.10-$0.30
  - **Verification method:** Cost tracking dashboard

- [ ] **Verify 20% cost reduction from caching**
  - Measure: Savings from cache hits
  - Target: > 20% reduction
  - **Verification method:** Cost analysis

---

## Risk Mitigation

### High-Risk Items

1. **WebSearch latency impact on Mode 1**
   - **Mitigation:** 500ms timeout, cache results, intelligent skipping
   - **Fallback:** Gracefully continue with RAG only if WebSearch fails

2. **Storage costs for audit trail**
   - **Mitigation:** 1-year retention, auto-archive to S3 Glacier
   - **Monitor:** Alert if storage > 100GB

3. **L5 tool failures**
   - **Mitigation:** Retry logic (3 attempts), graceful degradation
   - **Fallback:** Continue with available tools

4. **Evidence quality too low**
   - **Mitigation:** Warn user, suggest alternatives, escalate to human
   - **Monitor:** Alert if quality < 0.60 for 30% of queries

---

## Deployment Plan

### Pre-Deployment

- [ ] **Code review all changes**
  - All PRs approved by 2+ engineers
  - Security review for S3 access

- [ ] **Database migration dry-run**
  - Test migrations on staging
  - Verify no data loss

- [ ] **Load testing on staging**
  - Simulate 10,000 queries
  - Verify performance targets met

### Deployment

- [ ] **Phase 1: Deploy to staging (Week 1 Friday)**
  - Deploy database migrations
  - Deploy code changes
  - Smoke test

- [ ] **Phase 2: Deploy to staging (Week 2 Friday)**
  - Deploy caching changes
  - Monitor cache hit rate

- [ ] **Phase 3: Deploy to staging (Week 3 Friday)**
  - Deploy artifact generation
  - Test exports

- [ ] **Phase 4: Deploy to staging (Week 4 Friday)**
  - Deploy monitoring dashboard
  - Final integration test

- [ ] **Production deployment (Week 5 Monday)**
  - Deploy all phases to production
  - Monitor for 24 hours
  - Rollback plan ready

### Post-Deployment

- [ ] **Monitor for 1 week**
  - Track all success metrics
  - Address any issues

- [ ] **User feedback collection**
  - Survey 50 users
  - Gather artifact quality feedback

- [ ] **Retrospective**
  - What went well
  - What to improve
  - Lessons learned

---

## Resource Allocation

### Team Assignments

**Backend Team (2 engineers):**
- L4 Context Engineer updates
- L5 tool configuration
- Artifact generation service
- API endpoints

**ML Team (1 engineer):**
- Evidence scoring algorithm
- Cross-validation
- Token optimization
- Intelligent tool selection

**Database Team (1 engineer):**
- Schema migrations
- Namespace migration
- Performance optimization

**DevOps Team (1 engineer):**
- Redis setup
- S3 bucket configuration
- Monitoring dashboard
- Alerting

**QA Team (1 engineer):**
- Unit tests
- Integration tests
- Load testing
- UAT coordination

**Total:** 7 engineers for 4 weeks

---

## Contact Information

**Project Lead:** [Name]
**Data Strategist:** VITAL Data Strategist Agent
**Engineering Manager:** [Name]
**Product Manager:** [Name]

**Slack Channels:**
- #vital-evidence-project (main channel)
- #vital-engineering (technical discussions)
- #vital-data (data strategy)

**Documentation:**
- `/services/ai-engine/docs/DATA_STRATEGY_EVIDENCE_BASED_RESPONSES.md`
- `/services/ai-engine/docs/EVIDENCE_STRATEGY_EXECUTIVE_SUMMARY.md`
- `/services/ai-engine/docs/EVIDENCE_ARCHITECTURE_DIAGRAM.md`

---

**Status:** READY FOR KICKOFF
**Next Action:** Schedule kickoff meeting with all teams
**Timeline:** 4 weeks starting [Start Date]
