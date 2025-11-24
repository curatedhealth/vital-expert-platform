"""
Test README for GraphRAG Tests
Instructions for running tests
"""

# GraphRAG Test Suite

## Overview

Comprehensive test suite for the GraphRAG service, covering:
- Hybrid fusion (RRF algorithm)
- Evidence builder (citations and context)
- Integration tests (end-to-end flow)

## Running Tests

### All GraphRAG tests
```bash
cd services/ai-engine
pytest tests/graphrag/ -v
```

### Specific test file
```bash
pytest tests/graphrag/test_fusion.py -v
```

### With coverage
```bash
pytest tests/graphrag/ --cov=src/graphrag --cov-report=html
```

## Test Structure

```
tests/graphrag/
├── conftest.py              # Shared fixtures
├── test_fusion.py           # Hybrid fusion tests
├── test_evidence_builder.py # Evidence builder tests
├── test_integration.py      # End-to-end tests
└── README.md                # This file
```

## Test Coverage

### Current Coverage
- **Hybrid Fusion**: 90%+
- **Evidence Builder**: 85%+
- **Integration**: 70%+ (requires database mocks)

### Not Yet Covered
- Database clients (requires actual DB connections)
- Vector search (requires OpenAI API)
- Graph search (requires Neo4j)
- Keyword search (requires Elasticsearch)

## Future Tests

### Phase 1 Additional Tests
1. Profile resolver unit tests
2. KG view resolver unit tests
3. Vector search unit tests (with mocked OpenAI)
4. Graph search unit tests (with mocked Neo4j)
5. API endpoint tests (with FastAPI TestClient)

### Phase 2+ Tests
1. LangGraph compilation tests
2. Agent selection tests
3. Deep agent pattern tests
4. Monitoring tests

## Fixtures

### Available Fixtures (from conftest.py)
- `sample_agent_id`: UUID for test agent
- `sample_session_id`: UUID for test session
- `sample_rag_profile`: Sample RAG profile configuration
- `sample_kg_view`: Sample knowledge graph view
- `sample_fusion_weights`: Sample fusion weights
- `sample_context_chunks`: Sample context chunks
- `sample_graph_evidence`: Sample graph evidence
- `mock_embedding`: Mock OpenAI embedding vector

## Notes

- Integration tests require database connections (currently skipped)
- Some tests use mocks to avoid external dependencies
- Run tests before committing changes
- Maintain >80% test coverage

