"""Mock RAG search results for testing"""

MOCK_RAG_SEARCH_RESPONSE = {
    "query": "What are FDA IND requirements?",
    "results": [
        {
            "id": "doc_001",
            "content": "FDA IND requirements include preclinical data, CMC information...",
            "similarity": 0.89,
            "metadata": {
                "title": "FDA IND Guidelines",
                "source": "FDA",
                "specialty": "regulatory_affairs"
            }
        }
    ],
    "context_summary": {
        "total_documents": 5,
        "high_confidence_results": 3,
        "specialties": ["regulatory_affairs"],
        "evidence_levels": ["Level 1"]
    },
    "total_results": 5,
    "processing_time_ms": 250.5
}

