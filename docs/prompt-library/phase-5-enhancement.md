# ⚡ PHASE 5: ENHANCEMENT & VALIDATION PROMPTS

## PROMPT 5.1: Clinical Performance Optimization
```markdown
@workspace Optimize platform for healthcare scale:

PERFORMANCE TARGETS:
- <2 second response for medical queries (P95)
- Support 10,000 concurrent clinicians
- 99.95% uptime for critical systems
- Real-time adverse event monitoring (<100ms)
- Batch processing for cohorts (1M patients/hour)
- Sub-second autocomplete for medical terms
- 60 FPS for data visualizations
- <1 second page load time

OPTIMIZATION AREAS:

1. Medical Knowledge Caching
   - Multi-tier cache strategy (Redis, CDN, browser)
   - Smart cache invalidation for guideline updates
   - Precomputed common queries
   - Edge caching for global deployment
   - Differential updates for large datasets

2. Query Optimization
   - Query result precomputation for common patterns
   - Materialized views for complex aggregations
   - Parallel query execution
   - Query plan optimization
   - Connection pooling optimization

3. LLM Performance
   - Response streaming for long outputs
   - Model quantization for edge deployment
   - Batch inference for multiple queries
   - Caching of embeddings
   - Fallback to smaller models for simple queries

4. Database Optimization
   - Partitioning strategy for time-series data
   - Read replicas for analytics
   - Columnar storage for reporting
   - Index optimization based on query patterns
   - Vacuum and analyze scheduling

5. Infrastructure Scaling
   - Auto-scaling policies based on load
   - Geographic distribution of services
   - Circuit breakers for service resilience
   - Load balancing algorithms
   - Resource allocation optimization

Implementation with code:
```python
# Cache strategy implementation
class MedicalKnowledgeCache:
    def __init__(self):
        self.redis_client = redis.Redis(
            connection_pool=redis.BlockingConnectionPool(
                max_connections=100,
                socket_keepalive=True
            ))
        self.local_cache = TTLCache(maxsize=10000, ttl=300)
    
    async def get_with_fallback(self, key: str) -> Any:
        # L1: Local memory cache
        if key in self.local_cache:
            return self.local_cache[key]
        
        # L2: Redis cache
        value = await self.redis_client.get(key)
        if value:
            self.local_cache[key] = value
            return value
        
        # L3: Database query
        value = await self.fetch_from_database(key)
        
        # Populate caches
        await self.redis_client.setex(key, 3600, value)
        self.local_cache[key] = value
        
        return value
    
    def invalidate_medical_guideline(self, guideline_id: str):
        """Smart invalidation for medical content updates"""
        # Invalidate related cache entries
        pattern = f"guideline:{guideline_id}:*"
        for key in self.redis_client.scan_iter(match=pattern):
            self.redis_client.delete(key)
```

Include:
- Performance benchmarking suite
- Load testing scenarios (JMeter/Locust)
- APM integration (DataDog/New Relic)
- Database query analysis
- Memory profiling
- Network optimization
- CDN configuration
- Edge computing deployment
- Monitoring dashboards
- SLA tracking
```

## PROMPT 5.2: Medical Edge Cases
```markdown
@workspace Handle medical edge cases and safety:

CRITICAL EDGE CASES TO HANDLE:

1. Contradictory Clinical Evidence
   - Detection: Identify conflicting recommendations
   - Resolution: Present both views with evidence quality
   - Safety: Default to more conservative approach
   - Documentation: Record reasoning for audit

2. Off-Label Medication Use
   - Detection: Compare indication to approved uses
   - Handling: Clearly mark as off-label
   - Evidence: Provide supporting literature
   - Warnings: Include regulatory disclaimers

3. Pediatric vs Adult Dosing
   - Detection: Age/weight-based calculations
   - Validation: Check against standard references
   - Safety margins: Conservative dosing for edge weights
   - Alerts: Flag unusual doses for review

4. Rare Disease Information Gaps
   - Detection: Identify limited evidence scenarios
   - Handling: Aggregate case reports and expert opinions
   - Referrals: Connect to rare disease networks
   - Transparency: Clearly communicate uncertainty

5. Emergency Protocol Activation
   - Triggers: Define emergency criteria
   - Response: Immediate escalation pathways
   - Override: Allow breaking normal constraints
   - Documentation: Detailed audit trail

6. Drug-Drug Interactions
   - Severity levels: Contraindicated, Major, Moderate, Minor
   - Polypharmacy: Handle >10 medications
   - Alternative suggestions: Provide safer options
   - Clinical significance: Context-aware warnings

7. Allergy and Contraindications
   - Cross-reactivity: Check related compounds
   - Severity assessment: Differentiate intolerance vs allergy
   - Documentation: Detailed reaction history
   - Alternatives: Suggest safe substitutions

8. Pregnancy and Lactation
   - FDA categories: Legacy (A-X) and new PLLR
   - Trimester-specific risks
   - Risk-benefit analysis
   - Lactation compatibility

Implementation code:
```python
class MedicalSafetyHandler:
    def __init__(self):
        self.contradiction_detector = ContradictionDetector()
        self.dosing_calculator = DosingCalculator()
        self.interaction_checker = DrugInteractionChecker()
        self.emergency_protocol = EmergencyProtocol()
    
    async def handle_medical_query(self, query: MedicalQuery) -> SafeResponse:
        """Process query with comprehensive safety checks"""
        
        # Check for contradictions in evidence
        contradictions = await self.contradiction_detector.analyze(
            query.evidence_sources
        )
        if contradictions:
            return self.handle_contradictory_evidence(contradictions)
        
        # Validate dosing if medication query
        if query.involves_medication():
            dosing_validation = await self.validate_dosing(
                drug=query.drug,
                patient=query.patient,
                indication=query.indication
            )
            if not dosing_validation.is_safe:
                return self.escalate_to_expert(dosing_validation)
        
        # Check for emergency conditions
        if self.is_emergency(query):
            return await self.emergency_protocol.activate(query)
        
        # Drug interaction checking
        if query.medication_list:
            interactions = await self.check_interactions(
                medications=query.medication_list,
                patient_conditions=query.patient.conditions
            )
            if interactions.severity == 'CONTRAINDICATED':
                return self.handle_contraindication(interactions)
        
        # Pregnancy/lactation considerations
        if query.patient.is_pregnant or query.patient.is_lactating:
            safety = await self.check_pregnancy_safety(
                intervention=query.intervention,
                trimester=query.patient.pregnancy_trimester
            )
            if safety.risk_category in ['D', 'X']:
                return self.provide_safer_alternatives(safety)
        
        # Process normally with safety checks passed
        response = await self.process_query(query)
        response.safety_checks_passed = True
        return response
    
    def escalate_to_expert(self, issue: SafetyIssue) -> SafeResponse:
        """Escalate to human expert when needed"""
        return SafeResponse(
            requires_expert_review=True,
            reason=issue.description,
            interim_guidance=self.get_conservative_guidance(issue),
            escalation_priority=issue.severity
        )
```

Include comprehensive test suites:
- Edge case scenarios database
- Regression tests for safety issues
- Clinical validation protocols
- Expert review workflows
- Incident reporting system
- Continuous monitoring for safety signals
```

## PROMPT 5.3: Clinical Validation Suite
```markdown
@workspace Create comprehensive clinical validation:

VALIDATION AREAS:

1. Medical Accuracy Validation (>95% target)
   - Diagnostic accuracy assessment
   - Treatment recommendation validation
   - Drug information correctness
   - Guideline compliance checking
   - Literature interpretation accuracy

2. Citation Correctness (100% target)
   - PMID verification
   - DOI resolution
   - Citation context checking
   - Quote accuracy validation
   - Reference completeness

3. Clinical Guideline Compliance
   - Guideline adherence scoring
   - Recommendation consistency
   - Update tracking
   - Deviation documentation
   - Version control

4. Drug Information Accuracy
   - Dosing validation
   - Interaction checking
   - Contraindication verification
   - Side effect completeness
   - Pharmacokinetic data accuracy

5. Safety Signal Detection
   - Adverse event identification
   - Signal strength assessment
   - Causality evaluation
   - Reporting compliance
   - Trend analysis

VALIDATION METHODS:

1. Expert Physician Review Panels
   ```python
   class ExpertReviewPanel:
       def __init__(self):
           self.reviewers = {
               'cardiology': [...],
               'oncology': [...],
               'neurology': [...],
               'infectious_disease': [...]
           }
           self.review_queue = PriorityQueue()
           self.consensus_threshold = 0.8
       
       async def submit_for_review(self, 
                                   content: MedicalContent,
                                   specialty: str,
                                   priority: Priority) -> ReviewResult:
           """Submit content for expert review"""
           review_task = ReviewTask(
               content=content,
               specialty=specialty,
               required_reviewers=3,
               consensus_threshold=self.consensus_threshold
           )
           
           # Assign to reviewers
           assigned_reviewers = self.assign_reviewers(
               specialty=specialty,
               availability=True,
               expertise_match=content.topics
           )
           
           # Collect reviews
           reviews = await self.collect_reviews(
               task=review_task,
               reviewers=assigned_reviewers,
               deadline=timedelta(hours=48)
           )
           
           # Calculate consensus
           consensus = self.calculate_consensus(reviews)
           
           return ReviewResult(
               accuracy_score=consensus.accuracy,
               recommendations=consensus.recommendations,
               corrections=consensus.corrections,
               confidence=consensus.confidence
           )
   ```

2. Comparison with Gold Standard Databases
   ```python
   class GoldStandardValidator:
       def __init__(self):
           self.databases = {
               'drugs': DrugBankAPI(),
               'interactions': StockleyAPI(),
               'guidelines': UpToDateAPI(),
               'trials': ClinicalTrialsAPI()
           }
       
       async def validate_against_gold_standard(self,
                                               claim: MedicalClaim) -> ValidationResult:
           """Validate medical claims against authoritative sources"""
           
           # Identify claim type and relevant database
           claim_type = self.classify_claim(claim)
           gold_standard = self.databases[claim_type]
           
           # Fetch authoritative information
           reference_data = await gold_standard.fetch(
               query=claim.structured_query,
               context=claim.context
           )
           
           # Compare claim to reference
           comparison = self.compare_claim_to_reference(
               claim=claim,
               reference=reference_data
           )
           
           return ValidationResult(
               is_accurate=comparison.match_score > 0.95,
               match_score=comparison.match_score,
               discrepancies=comparison.discrepancies,
               reference_source=gold_standard.name,
               evidence_quality=reference_data.quality_score
           )
   ```

3. Clinical Case Testing
   ```python
   class ClinicalCaseValidator:
       def __init__(self):
           self.test_cases = self.load_test_cases()
           self.scoring_rubric = self.load_scoring_rubric()
       
       async def run_clinical_cases(self) -> TestReport:
           """Run system through clinical test cases"""
           results = []
           
           for case in self.test_cases:
               # Generate system response
               response = await self.system.process(case.presentation)
               
               # Score against expected outcomes
               score = self.score_response(
                   response=response,
                   expected=case.expected_outcomes,
                   rubric=self.scoring_rubric
               )
               
               results.append({
                   'case_id': case.id,
                   'category': case.category,
                   'score': score,
                   'errors': score.errors,
                   'correct_diagnosis': score.diagnosis_match,
                   'correct_treatment': score.treatment_match,
                   'safety_issues': score.safety_violations
               })
           
           return TestReport(
               results=results,
               overall_accuracy=self.calculate_accuracy(results),
               category_breakdown=self.analyze_by_category(results),
               recommendations=self.generate_recommendations(results)
           )
   ```

Output CLINICAL_VALIDATION_SUITE.py with:
- Automated test scenarios (1000+ cases)
- Expert review workflow
- Validation metrics dashboard
- Continuous monitoring system
- Regulatory reporting generators
- Performance tracking
- Regression detection
- A/B testing framework
- Clinical trial simulation
- Real-world evidence validation
```
