"""
Mock LLM responses for testing
Provides realistic LLM response structures for various scenarios
"""

from datetime import datetime
from typing import Dict, List, Any

# Mock Mode 1 Response (Manual Interactive)
MOCK_MODE1_RESPONSE = {
    "content": """Based on the regulatory requirements for clinical trials, you must comply with FDA 21 CFR Part 312 for Investigational New Drug (IND) applications.

## Key Requirements

1. **Preclinical Data**: Comprehensive toxicology and pharmacology studies
2. **Chemistry, Manufacturing, and Controls (CMC)**: Detailed manufacturing processes
3. **Clinical Protocol**: Well-defined study objectives, design, and methodology
4. **Investigator's Brochure**: Complete summary of drug information

## Regulatory Timeline

- IND Submission: 30-day FDA review period
- FDA Feedback: Potential clinical hold if deficiencies identified
- Study Initiation: Upon FDA clearance or automatic approval after 30 days

## Compliance Considerations

All documentation must comply with:
- FDA 21 CFR Part 11 (Electronic Records)
- ICH-GCP guidelines
- Good Laboratory Practice (GLP)
- Good Manufacturing Practice (GMP)

**Confidence Level**: High (based on FDA regulations)
**Evidence Level**: Level 1 (Regulatory Guidance)""",
    "confidence": 0.92,
    "citations": [
        {
            "source": "FDA Clinical Trial Guidelines",
            "url": "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/ind-application",
            "authors": "FDA",
            "publication_year": 2024,
            "evidence_level": "Level 1",
            "regulatory_relevance": "High"
        },
        {
            "source": "21 CFR Part 312 - Investigational New Drug Application",
            "url": "https://www.ecfr.gov/current/title-21/chapter-I/subchapter-D/part-312",
            "authors": "FDA",
            "publication_year": 2024,
            "evidence_level": "Level 1",
            "regulatory_relevance": "High"
        }
    ],
    "metadata": {
        "model": "gpt-4-turbo-preview",
        "temperature": 0.1,
        "tokens_used": 450,
        "processing_time_ms": 1250
    }
}

# Mock Mode 2 Response (Automatic Agent Selection)
MOCK_MODE2_RESPONSE = {
    "agent_selected": "regulatory_expert",
    "selection_confidence": 0.95,
    "content": "For your query about FDA regulatory pathways, I've selected the Regulatory Expert agent with 95% confidence. This agent specializes in FDA submissions and compliance...",
    "confidence": 0.89,
    "citations": [
        {
            "source": "FDA Device Classification",
            "url": "https://www.fda.gov/medical-devices/classify-your-medical-device",
            "authors": "FDA",
            "publication_year": 2024,
            "evidence_level": "Level 1"
        }
    ]
}

# Mock Mode 3 Response (Autonomous Multi-Agent)
MOCK_MODE3_RESPONSE = {
    "agents_used": ["regulatory_expert", "clinical_researcher", "medical_specialist"],
    "collaboration_summary": "Three agents collaborated to provide comprehensive guidance",
    "content": """## Comprehensive Analysis

### Regulatory Perspective (Regulatory Expert)
The device requires 510(k) clearance with substantial equivalence determination.

### Clinical Perspective (Clinical Researcher)
Recommend single-arm prospective study with 100 subjects, primary endpoint at 6 months.

### Medical Perspective (Medical Specialist)
Clinical validation should include real-world evidence and post-market surveillance.

### Consolidated Recommendation
Combined expertise suggests a phased approach with regulatory consultation at each milestone.""",
    "confidence": 0.91,
    "agent_contributions": [
        {"agent": "regulatory_expert", "confidence": 0.93, "weight": 0.4},
        {"agent": "clinical_researcher", "confidence": 0.88, "weight": 0.3},
        {"agent": "medical_specialist", "confidence": 0.92, "weight": 0.3}
    ],
    "citations": [
        {"source": "FDA 510(k) Guidelines", "evidence_level": "Level 1"},
        {"source": "Clinical Trial Design Principles", "evidence_level": "Level 2"},
        {"source": "Real-World Evidence Framework", "evidence_level": "Level 2"}
    ]
}

# Mock Query Analysis (for Agent Selector)
MOCK_QUERY_ANALYSIS = {
    "intent": "regulatory",
    "domains": ["regulatory_affairs", "clinical_research"],
    "complexity": "high",
    "keywords": ["clinical trials", "FDA", "regulatory requirements", "IND"],
    "medical_terms": ["IND", "NDA", "Phase 3", "efficacy", "safety"],
    "confidence": 0.87,
    "recommended_agent": "regulatory_expert",
    "reasoning": "Query focuses on FDA regulatory requirements and clinical trial compliance, indicating regulatory expertise is primary need."
}

# Mock Confidence Calculation
MOCK_CONFIDENCE_CALCULATION = {
    "confidence": 0.89,
    "breakdown": {
        "rag_similarity": 0.85,
        "query_alignment": 0.92,
        "response_completeness": 0.90,
        "agent_tier_bonus": 0.05
    },
    "reasoning": "High confidence due to strong RAG matches (0.85) and excellent query-agent alignment (0.92). Response completeness is strong (0.90) with relevant regulatory citations.",
    "quality_level": "High"
}

# Mock Streaming Response Chunks
MOCK_STREAMING_CHUNKS = [
    {"content": "Based on", "is_partial": True},
    {"content": " the regulatory", "is_partial": True},
    {"content": " requirements for", "is_partial": True},
    {"content": " clinical trials,", "is_partial": True},
    {"content": " you must comply", "is_partial": True},
    {"content": " with FDA", "is_partial": True},
    {"content": " 21 CFR Part 312...", "is_partial": False}
]

# Mock Error Response
MOCK_ERROR_RESPONSE = {
    "error": "RateLimitError",
    "message": "Rate limit exceeded for OpenAI API",
    "retry_after": 60,
    "request_id": "req_123abc",
    "timestamp": datetime.now().isoformat()
}

# Mock Timeout Response
MOCK_TIMEOUT_RESPONSE = {
    "error": "TimeoutError",
    "message": "Request timed out after 30 seconds",
    "service": "openai",
    "timestamp": datetime.now().isoformat()
}

