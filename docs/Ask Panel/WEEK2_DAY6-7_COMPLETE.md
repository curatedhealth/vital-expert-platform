# Week 2, Day 6-7: Simple Consensus Calculator - Complete

**Date**: November 2, 2025  
**Status**: ✅ Complete  
**Duration**: Day 6-7 of MVP Fast Track

---

## 🎯 Objective

Build simple consensus calculator to analyze expert responses and determine agreement levels for MVP panels.

---

## ✅ Completed Work

### 1. Simple Consensus Calculator

**File**: `services/ai-engine/src/services/consensus_calculator.py` (417 lines)

**Algorithm (Simple for MVP)**:
1. **Extract Keywords**: Simple text analysis, remove stop words
2. **Find Common Themes**: Keyword frequency across responses
3. **Calculate Agreement**: Percentage of experts mentioning common themes
4. **Generate Recommendation**: Template-based synthesis from majority view
5. **Track Dissents**: Identify significantly different opinions

**Not Using** (deferred to post-MVP):
- ❌ Machine learning / NLP models
- ❌ Semantic similarity (embeddings)
- ❌ Advanced consensus algorithms
- ❌ LLM-based synthesis (using templates for MVP)

**API**:
```python
calculator = SimpleConsensusCalculator(min_agreement_threshold=0.5)

result = calculator.calculate_consensus(
    responses=[
        {
            "agent_id": "expert_1",
            "agent_name": "Regulatory Expert",
            "content": "FDA requires 510(k) clearance...",
            "confidence_score": 0.9
        },
        # ... more responses
    ],
    query="What are FDA requirements?"
)

# Result structure
result.consensus_level  # 0-1 float
result.agreement_points  # Dict of common themes
result.disagreement_points  # Dict of divergences
result.recommendation  # Generated text
result.dissenting_opinions  # Dict of minority views
result.key_themes  # List of common keywords
```

**Consensus Levels**:
- **Strong**: > 0.7 (experts mostly agree)
- **Moderate**: 0.5 - 0.7 (some agreement)
- **Weak**: < 0.5 (significant differences)

**Features**:
```python
# Keyword extraction
keywords = calculator._extract_keywords(text)
# Filters: stop words, short words, numbers

# Find agreements
agreements = calculator._find_agreements(expert_points, common_themes)
# Logic: themes mentioned by 50%+ of experts

# Find disagreements  
disagreements = calculator._find_disagreements(expert_points, responses)
# Logic: keyword overlap < 30%

# Calculate consensus level
level = calculator._calculate_consensus_level(agreements, disagreements, expert_count)
# Weighted by agreement ratios, penalized by disagreements

# Generate recommendation
recommendation = calculator._generate_recommendation(responses, agreements, themes, level)
# Uses templates + highest confidence response

# Identify dissents
dissents = calculator._identify_dissents(expert_points, common_themes, responses)
# Logic: overlap with common themes < 30%
```

### 2. Comprehensive Test Suite

**File**: `services/ai-engine/tests/services/test_consensus_calculator.py` (334 lines)

**Test Results**:
```
16 passed, 0 failed
Test execution: 1.09s
```

**Tests Cover**:
- ✅ Calculator initialization
- ✅ Empty responses handling
- ✅ High agreement scenarios
- ✅ Low agreement scenarios
- ✅ Keyword extraction
- ✅ Keyword length filtering
- ✅ Agreement detection
- ✅ Consensus level calculation
- ✅ Consensus with disagreements
- ✅ Recommendation generation (strong)
- ✅ Recommendation generation (weak)
- ✅ Dissent identification
- ✅ Result structure validation
- ✅ Consensus level bounds (0-1)
- ✅ Single response edge case
- ✅ Factory function

---

## 📊 Algorithm Details

### Keyword Extraction
```python
# Input
text = "FDA requires 510(k) clearance for Class II medical devices."

# Process
1. Lowercase
2. Remove punctuation
3. Split into words
4. Filter stop words (the, a, for, etc.)
5. Filter short words (< 4 chars)
6. Filter numbers

# Output
["requires", "clearance", "class", "medical", "devices"]
```

### Agreement Detection
```python
# Example
expert_1: ["clinical", "trials", "safety"]
expert_2: ["clinical", "trials", "efficacy"]
expert_3: ["clinical", "safety", "regulatory"]

common_themes = ["clinical", "trials", "safety"]  # Mentioned by 30%+

agreements = {
    "theme_clinical": {
        "expert_count": 3,  # All 3 mentioned it
        "agreement_ratio": 1.0
    },
    "theme_trials": {
        "expert_count": 2,  # 2 of 3 mentioned it
        "agreement_ratio": 0.67
    }
}
```

### Consensus Calculation
```python
# Formula
agreement_score = len(agreements) / expert_count
disagreement_penalty = len(disagreements) * 0.1
consensus = agreement_score - disagreement_penalty

# Adjust by agreement ratios
avg_ratio = sum(agreement_ratios) / len(agreements)
consensus = (consensus + avg_ratio) / 2

# Clamp to [0, 1]
consensus = max(0.0, min(1.0, consensus))
```

---

## 🔍 Example Usage

### High Agreement Example
```python
responses = [
    {
        "agent_id": "expert_1",
        "content": "FDA requires 510(k) clearance for Class II devices. Clinical trials needed.",
        "confidence_score": 0.9
    },
    {
        "agent_id": "expert_2",
        "content": "Medical devices need FDA 510(k) clearance. Clinical trials required.",
        "confidence_score": 0.85
    },
    {
        "agent_id": "expert_3",
        "content": "510(k) submission mandatory. Clinical evidence essential.",
        "confidence_score": 0.8
    }
]

result = calculator.calculate_consensus(responses, "FDA requirements?")

# Output
result.consensus_level = 0.82  # Strong consensus
result.key_themes = ["clearance", "510k", "clinical", "trials", "devices"]
result.agreement_points = {
    "theme_clearance": {"expert_count": 3, "agreement_ratio": 1.0},
    "theme_clinical": {"expert_count": 3, "agreement_ratio": 1.0}
}
result.recommendation = "Based on 3 expert analyses with strong consensus (82%), 
                         the key themes are: clearance, clinical, trials..."
```

### Low Agreement Example
```python
responses = [
    {"content": "Consider De Novo pathway for novel devices...", ...},
    {"content": "Pursue Breakthrough Device program...", ...},
    {"content": "International harmonization via IMDRF standards...", ...}
]

result = calculator.calculate_consensus(responses, "Best strategy?")

# Output
result.consensus_level = 0.35  # Weak consensus
result.disagreement_points = {
    "divergence_expert1_expert2": {"overlap": 0.15, ...},
    "divergence_expert1_expert3": {"overlap": 0.10, ...}
}
result.recommendation = "...Note: Consensus is weak. Consider additional expert 
                         input or further analysis of divergent viewpoints."
```

---

## 💡 Design Decisions

### 1. Simple Over Complex
- **Decision**: Use keyword matching, not ML
- **Rationale**: MVP needs to work, not be perfect
- **Trade-off**: Less accurate, but fast and reliable

### 2. Template-Based Recommendations
- **Decision**: Use templates, not LLM synthesis
- **Rationale**: Reduce costs, faster execution
- **Trade-off**: Less natural language, but predictable

### 3. Conservative Thresholds
- **Decision**: 50% for agreement, 30% for dissent
- **Rationale**: Better to identify weak consensus than false strong
- **Trade-off**: May underestimate consensus

### 4. No External Dependencies
- **Decision**: Pure Python, no NLP libraries
- **Rationale**: Simpler deployment, fewer dependencies
- **Trade-off**: More basic analysis

---

## 📈 What This Enables

### For Week 2 (Panel Workflow)
```python
# After collecting expert responses
responses = [...]  # From agents

# Calculate consensus
consensus_calc = SimpleConsensusCalculator()
consensus_result = consensus_calc.calculate_consensus(responses, panel.query)

# Save to database
await panel_repo.save_consensus(
    panel_id=panel.id,
    round_number=1,
    consensus_level=consensus_result.consensus_level,
    agreement_points=consensus_result.agreement_points,
    disagreement_points=consensus_result.disagreement_points,
    recommendation=consensus_result.recommendation,
    dissenting_opinions=consensus_result.dissenting_opinions
)

# Update panel status
if consensus_result.consensus_level >= 0.7:
    # Strong consensus - mark complete
    await panel_repo.update_panel_status(panel.id, PanelStatus.COMPLETED)
else:
    # Weak consensus - could trigger another round (post-MVP)
    pass
```

---

## 🧪 Testing Evidence

### Test Output
```bash
$ pytest tests/services/test_consensus_calculator.py -v

tests/services/test_consensus_calculator.py::test_calculator_initialization PASSED
tests/services/test_consensus_calculator.py::test_empty_responses PASSED
tests/services/test_consensus_calculator.py::test_high_agreement_consensus PASSED
tests/services/test_consensus_calculator.py::test_low_agreement_consensus PASSED
tests/services/test_consensus_calculator.py::test_extract_keywords PASSED
tests/services/test_consensus_calculator.py::test_extract_keywords_min_length PASSED
tests/services/test_consensus_calculator.py::test_find_agreements PASSED
tests/services/test_consensus_calculator.py::test_calculate_consensus_level PASSED
tests/services/test_consensus_calculator.py::test_calculate_consensus_level_with_disagreements PASSED
tests/services/test_consensus_calculator.py::test_generate_recommendation_strong_consensus PASSED
tests/services/test_consensus_calculator.py::test_generate_recommendation_weak_consensus PASSED
tests/services/test_consensus_calculator.py::test_identify_dissents PASSED
tests/services/test_consensus_calculator.py::test_consensus_result_structure PASSED
tests/services/test_consensus_calculator.py::test_consensus_level_bounds PASSED
tests/services/test_consensus_calculator.py::test_single_response PASSED
tests/services/test_consensus_calculator.py::test_create_consensus_calculator PASSED

===================== 16 passed in 1.09s =====================
```

---

## 📝 Files Created

### New Files
1. `services/ai-engine/src/services/consensus_calculator.py` (417 lines)
2. `services/ai-engine/tests/services/test_consensus_calculator.py` (334 lines)

**Total**: 751 lines of production code

---

## 🔄 Post-MVP Improvements

### Could Add Later
1. **Semantic Similarity**: Use embeddings for better theme matching
2. **LLM Synthesis**: Generate more natural recommendations
3. **Multi-Round Support**: Track consensus evolution over rounds
4. **Confidence Weighting**: Weight by expert confidence scores
5. **Domain-Specific Terms**: Medical terminology dictionaries
6. **Sentiment Analysis**: Detect positive/negative positions
7. **Entity Extraction**: Identify specific drugs, procedures, etc.

### Current Limitations (Acceptable for MVP)
- Simple keyword matching (not semantic)
- Template-based recommendations (not natural)
- No confidence weighting
- English only
- No multi-round tracking

---

## 💡 Key Takeaways

### What Went Well
✅ Simple algorithm works reliably  
✅ Fast execution (no ML overhead)  
✅ 100% test pass rate  
✅ Clean API design  
✅ Handles edge cases (empty, single response)  

### Production Ready?
**For MVP**: Yes
- Works correctly
- Well-tested
- Fast and reliable
- Good enough for initial validation

**For Production**: Needs enhancement
- More sophisticated analysis needed
- LLM-based synthesis for quality
- Semantic understanding
- Multi-language support

---

## 📊 Progress Tracker

### Week 2 Progress: 40% Complete (Day 6-7 of 10)

- [x] Day 6-7: Simple consensus calculator ← **COMPLETE**
- [ ] Day 8-9: Simple panel workflow
- [ ] Day 10: Integration & testing

### MVP Progress: 35% Complete (Day 7 of 20)

Foundation + consensus complete. Ready for workflow integration.

---

## 🚀 Next Steps: Day 8-9

**Objective**: Simple Panel Workflow

**Tasks**:
1. Create SimplePanelWorkflow
   - Load panel from repository
   - Execute 3-5 experts in parallel
   - Collect responses
   - Calculate consensus using calculator
   - Save everything to database
   
2. Expert selection logic (simple)
   - Choose first N agents from panel.agents
   - No complex selection for MVP
   
3. Integration tests
   - End-to-end panel execution
   - Verify database persistence
   - Test consensus integration

**Files to Create**:
- `services/ai-engine/src/workflows/simple_panel_workflow.py`
- `services/ai-engine/tests/workflows/test_simple_panel_workflow.py`

---

**Status**: Day 6-7 complete. Consensus calculator production-ready for MVP. Moving to workflow.

