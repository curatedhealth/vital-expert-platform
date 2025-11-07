# Testing Guide for Knowledge Pipeline

## 📋 Test Coverage

### Unit Tests (`test_knowledge_pipeline_unit.py`)
- ✅ Configuration validation
- ✅ Web scraping functionality
- ✅ Content curation
- ✅ Report generation
- ✅ Pipeline initialization
- ✅ Error handling

### Integration Tests (`test_knowledge_pipeline_integration.py`)
- ✅ End-to-end pipeline execution
- ✅ RAG service integration
- ✅ File I/O operations
- ✅ Domain mapping
- ✅ Failed scrape handling
- ✅ Network error handling

## 🚀 Quick Start

### Install Test Dependencies

```bash
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path
pip install -r tests/test-requirements.txt
```

### Run All Tests

```bash
# Run test script (recommended)
./scripts/run-tests.sh

# Or use pytest directly
pytest tests/ -v
```

### Run Specific Test Suites

```bash
# Unit tests only
pytest tests/test_knowledge_pipeline_unit.py -v

# Integration tests only
pytest tests/test_knowledge_pipeline_integration.py -v

# Specific test class
pytest tests/test_knowledge_pipeline_unit.py::TestWebScraper -v

# Specific test function
pytest tests/test_knowledge_pipeline_unit.py::TestWebScraper::test_successful_scrape -v
```

## 📊 Coverage Report

```bash
# Generate coverage report
pytest tests/ --cov=scripts --cov-report=html --cov-report=term-missing

# View HTML report
open htmlcov/index.html
```

## 🧪 Test Details

### TestPipelineConfig
Tests configuration loading and validation:
- ✅ Valid configuration loading
- ✅ Missing config file handling
- ✅ Invalid JSON handling
- ✅ Required field validation
- ✅ Environment variable validation

### TestWebScraper
Tests web scraping functionality:
- ✅ Context manager initialization
- ✅ Successful page scraping
- ✅ HTTP error handling (404, 500, etc.)
- ✅ CSS selector extraction
- ✅ Retry logic with exponential backoff
- ✅ Timeout handling

### TestContentCurator
Tests content organization:
- ✅ Directory creation
- ✅ Domain folder creation
- ✅ Markdown file generation
- ✅ Frontmatter formatting
- ✅ Safe filename generation
- ✅ Summary statistics

### TestReportGenerator
Tests report generation:
- ✅ Comprehensive report creation
- ✅ Statistics inclusion
- ✅ Failed URLs tracking
- ✅ Report file creation

### TestKnowledgePipeline
Tests complete pipeline:
- ✅ Pipeline initialization
- ✅ Dry-run mode execution
- ✅ Upload mode execution
- ✅ Error propagation

### TestEndToEndPipeline (Integration)
Tests full pipeline flow:
- ✅ Multi-source scraping
- ✅ Domain-based organization
- ✅ Report generation
- ✅ Failed scrape handling

### TestRAGIntegration (Integration)
Tests RAG service integration:
- ✅ RAG uploader initialization
- ✅ Content upload via RAG
- ✅ Statistics tracking

### TestFileOperations (Integration)
Tests file I/O:
- ✅ Directory structure creation
- ✅ Markdown file format
- ✅ Special character handling
- ✅ Empty content handling

### TestErrorHandling (Integration)
Tests error scenarios:
- ✅ Network timeouts
- ✅ Malformed HTML
- ✅ Empty content
- ✅ Invalid URLs

## 📈 Expected Test Results

```
========================================
Test Summary
========================================
✅ Unit Tests: 25 passed
✅ Integration Tests: 15 passed
✅ Total Coverage: >85%
✅ All tests passed!
```

## 🔍 Testing Best Practices

### Running Tests During Development

```bash
# Watch mode (re-run on file changes)
pytest-watch tests/

# Run with print statements visible
pytest tests/ -v -s

# Run only failed tests from last run
pytest tests/ --lf

# Run tests in parallel (faster)
pytest tests/ -n auto
```

### Testing Specific Scenarios

```bash
# Test dry-run mode
pytest tests/ -k "dry_run" -v

# Test error handling
pytest tests/ -k "error" -v

# Test scraping
pytest tests/ -k "scrape" -v

# Test RAG integration
pytest tests/ -k "rag" -v
```

## 🐛 Debugging Failed Tests

```bash
# Show full stack traces
pytest tests/ --tb=long

# Drop into debugger on failure
pytest tests/ --pdb

# Show print statements
pytest tests/ -s

# More verbose output
pytest tests/ -vv
```

## 📊 Coverage Goals

| Component | Target Coverage |
|-----------|----------------|
| Configuration | >90% |
| Web Scraper | >85% |
| Content Curator | >90% |
| Report Generator | >85% |
| Pipeline Orchestration | >80% |
| **Overall** | **>85%** |

## 🔧 Continuous Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          pip install -r scripts/requirements.txt
          pip install -r tests/test-requirements.txt
      - name: Run tests
        run: pytest tests/ -v --cov=scripts --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## 📝 Writing New Tests

### Unit Test Template

```python
class TestNewFeature:
    """Test new feature."""
    
    def test_basic_functionality(self):
        """Test basic functionality."""
        # Arrange
        input_data = {...}
        
        # Act
        result = function_to_test(input_data)
        
        # Assert
        assert result['success'] is True
        assert result['data'] == expected_data
    
    @pytest.mark.asyncio
    async def test_async_functionality(self):
        """Test async functionality."""
        async with AsyncResource() as resource:
            result = await resource.do_something()
            assert result is not None
```

### Integration Test Template

```python
@pytest.mark.asyncio
async def test_integration_scenario(tmp_path):
    """Test integration scenario."""
    # Setup
    config = create_test_config(tmp_path)
    
    # Execute
    with patch('module.external_service'):
        result = await execute_scenario(config)
    
    # Verify
    assert result.success
    assert files_created(tmp_path)
```

## 🎯 Test Markers

```bash
# Run only unit tests
pytest -m unit

# Run only integration tests  
pytest -m integration

# Skip slow tests
pytest -m "not slow"
```

## 📚 Additional Resources

- **Pytest Documentation**: https://docs.pytest.org/
- **Coverage.py**: https://coverage.readthedocs.io/
- **pytest-asyncio**: https://pytest-asyncio.readthedocs.io/

---

**Last Updated**: 2025-11-05
**Test Framework**: pytest 7.4+
**Coverage Goal**: >85%
**Status**: ✅ All tests passing

