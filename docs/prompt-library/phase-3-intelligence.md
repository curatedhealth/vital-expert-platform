# ⚙️ PHASE 3: CORE INTELLIGENCE PROMPTS

## PROMPT 3.1: Medical Agent Orchestration
```markdown
@workspace Implement medical agent orchestration system:

AGENTS TO CREATE:

1. ClinicalTrialAgent
   - Analyzes trial designs and protocols
   - Evaluates inclusion/exclusion criteria
   - Assesses statistical power
   - Predicts enrollment challenges
   - Recommends protocol optimizations

2. RegulatoryAgent
   - Interprets FDA/EMA guidance
   - Generates submission strategies
   - Tracks regulatory changes
   - Predicts review timelines
   - Identifies compliance gaps

3. LiteratureAgent
   - Synthesizes medical literature
   - Performs systematic reviews
   - Grades evidence quality
   - Detects contradictions
   - Tracks citation networks

4. ReimbursementAgent
   - Analyzes payer policies
   - Optimizes coding strategies
   - Predicts coverage decisions
   - Generates appeals
   - Calculates cost-effectiveness

5. SafetyAgent
   - Monitors adverse events
   - Detects safety signals
   - Assesses causality
   - Generates safety reports
   - Predicts risk patterns

6. DiagnosticAgent
   - Differential diagnosis generation
   - Diagnostic test recommendations
   - Result interpretation
   - Clinical pathway guidance

ORCHESTRATION REQUIREMENTS:
- Query classification by medical domain
- Agent selection based on expertise scores
- Parallel execution with dependency management
- Result synthesis with conflict resolution
- Confidence scoring and uncertainty quantification
- Human expert escalation triggers

Include PHARMA framework:
P - Purpose alignment with medical objectives
  Example: "Ensure query aligns with clinical trial optimization"
H - Hypothesis generation for clinical questions
  Example: "Generate 3-5 testable hypotheses"
A - Audience-specific formatting (clinician vs regulator)
  Example: "Format for FDA reviewer with regulatory citations"
R - Requirements compliance checking
  Example: "Verify GCP compliance in recommendations"
M - Metrics for medical accuracy
  Example: "Achieve >95% accuracy with citations"
A - Actionable medical insights
  Example: "Provide specific next steps with timelines"

Output MEDICAL_AGENTS.py with:
- Base agent class with common functionality
- Specialized agent implementations
- Router class with domain detection
- Orchestrator with execution strategies
- Synthesis engine for multi-agent responses
- Medical prompt templates for each agent
- Validation frameworks with medical rules
- Error handling for medical safety
- Performance monitoring
- A/B testing framework for agents

Include LangChain/AutoGen integration examples.
Use asyncio for parallel execution.
Implement circuit breakers for resilience.
```

## PROMPT 3.2: RAG Pipeline for Medical Literature
```markdown
@workspace Build medical-specific RAG pipeline:

MEDICAL RAG REQUIREMENTS:
- Semantic search across 25M+ medical documents
- Citation accuracy 100% (no hallucinations)
- Evidence quality scoring (GRADE methodology)
- Contradiction detection across sources
- Temporal relevance (newer evidence weighted)
- Multi-language medical content support
- Abbreviation and acronym handling
- Dosage and unit normalization

PIPELINE COMPONENTS:

1. Document Processing
   - Medical document chunking (preserve clinical context)
   - Section identification (abstract, methods, results)
   - Table and figure extraction
   - Reference parsing and linking
   - Metadata extraction (authors, journal, date)

2. Embedding Generation
   - Use PubMedBERT for medical texts
   - BioClinicalBERT for clinical notes
   - Separate embeddings for different sections
   - Multi-lingual medical embeddings

3. Retrieval Strategy
   - Hybrid search (keyword + semantic)
   - BM25 for exact medical terms
   - Dense retrieval for concepts
   - Metadata filtering (date, journal quality)
   - Relevance feedback loop

4. Reranking
   - Cross-encoder for medical relevance
   - Evidence quality scoring
   - Recency weighting
   - Source credibility factors
   - Contradiction detection

5. Generation
   - Prompt engineering for medical accuracy
   - Citation injection
   - Confidence scoring
   - Uncertainty expression

Include VERIFY protocol:
V - Validate medical sources (impact factor >3.0)
  Check: Journal in PubMed, peer-reviewed status
E - Evidence must have PMID/NCT citations
  Format: [PMID: 12345678] or [NCT04567890]
R - Request confidence levels for all medical claims
  Scale: High (>90%), Moderate (70-90%), Low (<70%)
I - Identify knowledge gaps explicitly
  Output: "No evidence found for [specific aspect]"
F - Fact-check against clinical guidelines
  Verify: Cross-reference with UpToDate, NCCN, etc.
Y - Yield to medical expert review when confidence <0.8
  Escalate: Flag for human review with explanation

Create MEDICAL_RAG.py with:
- Document chunking strategies
- Embedding pipeline with batching
- Vector store management (Pinecone/Weaviate)
- Hybrid search implementation
- Reranking algorithms
- Prompt templates for different query types
- Citation formatting utilities
- Evaluation metrics and benchmarks
- A/B testing framework
- Performance optimization techniques

Include integration with:
- OpenAI GPT-4 for generation
- Anthropic Claude for validation
- Local Medical LLMs for specific tasks
```

## PROMPT 3.3: Clinical Validation System
```markdown
@workspace Implement clinical validation framework:

VALIDATION REQUIREMENTS:
- Medical claim accuracy checking (>95% target)
- Drug interaction validation (DDI checking)
- Dosage range verification (pediatric/adult)
- Contraindication checking
- Clinical guideline compliance
- Lab value interpretation
- Allergy cross-reactivity
- Pregnancy/lactation safety

VALIDATION COMPONENTS:

1. Medical Fact Checker
   - Claim extraction from generated content
   - Evidence lookup in knowledge base
   - Contradiction detection
   - Confidence scoring
   - Source attribution

2. Drug Safety Validator
   - Drug-drug interaction checking
   - Dosage validation (weight-based, renal adjustment)
   - Contraindication screening
   - Allergy checking with cross-reactivity
   - Pregnancy categories (FDA/Australian)
   - Pediatric/geriatric considerations

3. Clinical Calculator Integration
   - GFR/CrCl calculation
   - BMI and BSA
   - Risk scores (CHADS-VASc, HAS-BLED, etc.)
   - Drug dosing calculators
   - Unit conversions

4. Guideline Compliance Checker
   - Guideline database integration
   - Recommendation extraction
   - Compliance scoring
   - Deviation documentation
   - Version tracking

5. Laboratory Validator
   - Reference range checking
   - Critical value identification
   - Trend analysis
   - Unit standardization
   - Panic value alerts

6. Expert Review Queue
   - Automatic escalation rules
   - Priority scoring
   - Expert assignment
   - Review workflow
   - Feedback incorporation

Output CLINICAL_VALIDATION.py with:
- Validation rules engine with medical logic
- Medical database connectors:
  - DrugBank API integration
  - RxNorm lookup service
  - LOINC lab code mapping
  - ICD-10 diagnosis validation
- Confidence scoring system:
  - Multi-model consensus
  - Source quality weighting
  - Recency factors
- Expert review workflow:
  - Case preparation
  - Review interface
  - Feedback collection
  - Model retraining triggers
- Error handling for medical safety:
  - Fail-safe defaults
  - Conservative recommendations
  - Clear uncertainty communication
  - Audit trail for decisions
- Performance metrics:
  - Accuracy by medical domain
  - False positive/negative rates
  - Time to validation
  - Expert agreement scores

Include comprehensive test suites:
- Known drug interactions
- Dosing edge cases
- Guideline compliance scenarios
- Lab value interpretations
```
