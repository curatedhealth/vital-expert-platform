# Tool Registry (AgentOS 3.0)

**Purpose**: Canonical registry of tools available via worker pool
**Version**: 2.0
**Last Updated**: 2025-11-26

---

## Overview

Tools are accessed via `execute_worker_task()` - agents do NOT spawn tools directly.

```python
# Correct usage
result = await execute_worker_task(
    worker_type="data_extraction",
    task={"tool": "extract_table", "params": {...}},
    context={"session_id": session_id}
)
```

---

## Worker Types

### 1. Data Extraction (`data_extraction`)

| Tool | Description | Input | Output |
|------|-------------|-------|--------|
| `extract_table` | Extract tables from documents | `{document_url, page_range}` | `{tables: [...]}` |
| `extract_entities` | NER from text | `{text, entity_types}` | `{entities: [...]}` |
| `parse_pdf` | Parse PDF to structured text | `{document_url}` | `{pages: [...]}` |
| `ocr_image` | OCR text from images | `{image_url, language}` | `{text: "..."}` |

**Example:**
```json
{
  "worker_type": "data_extraction",
  "task": {
    "tool": "extract_table",
    "params": {
      "document_url": "https://...",
      "page_range": [1, 5],
      "output_format": "json"
    }
  }
}
```

---

### 2. Computation (`computation`)

| Tool | Description | Input | Output |
|------|-------------|-------|--------|
| `calculate_statistics` | Statistical analysis | `{data, operations}` | `{results: {...}}` |
| `run_model` | Execute ML model | `{model_id, inputs}` | `{predictions: [...]}` |
| `transform_data` | Data transformation | `{data, transformations}` | `{transformed: {...}}` |
| `generate_chart` | Create visualization | `{data, chart_type}` | `{chart_url: "..."}` |

**Example:**
```json
{
  "worker_type": "computation",
  "task": {
    "tool": "calculate_statistics",
    "params": {
      "data": [1, 2, 3, 4, 5],
      "operations": ["mean", "std", "median"]
    }
  }
}
```

---

### 3. File Processing (`file_processing`)

| Tool | Description | Input | Output |
|------|-------------|-------|--------|
| `convert_format` | Convert file formats | `{file_url, target_format}` | `{converted_url: "..."}` |
| `merge_documents` | Merge multiple docs | `{document_urls}` | `{merged_url: "..."}` |
| `compress_file` | Compress files | `{file_url, format}` | `{compressed_url: "..."}` |
| `split_document` | Split by pages/sections | `{document_url, split_by}` | `{parts: [...]}` |

---

### 4. Web Search (`web_search`)

| Tool | Description | Input | Output |
|------|-------------|-------|--------|
| `search_web` | General web search | `{query, num_results}` | `{results: [...]}` |
| `search_pubmed` | PubMed search | `{query, filters}` | `{articles: [...]}` |
| `search_clinical_trials` | ClinicalTrials.gov | `{conditions, status}` | `{trials: [...]}` |
| `search_fda` | FDA database search | `{query, doc_type}` | `{documents: [...]}` |

**Example:**
```json
{
  "worker_type": "web_search",
  "task": {
    "tool": "search_pubmed",
    "params": {
      "query": "pembrolizumab NSCLC",
      "filters": {"publication_date": "2023-2024"},
      "num_results": 20
    }
  }
}
```

---

### 5. API Integration (`api_integration`)

| Tool | Description | Input | Output |
|------|-------------|-------|--------|
| `fetch_sec_filing` | SEC EDGAR filings | `{ticker, filing_type}` | `{filing: {...}}` |
| `fetch_drug_label` | FDA drug labels | `{drug_name}` | `{label: {...}}` |
| `fetch_ema_document` | EMA documents | `{product_name}` | `{document: {...}}` |
| `fetch_patent` | Patent lookup | `{patent_number}` | `{patent: {...}}` |

---

### 6. Knowledge Graph (`knowledge_graph`)

| Tool | Description | Input | Output |
|------|-------------|-------|--------|
| `query_neo4j` | Query knowledge graph | `{cypher_query}` | `{results: [...]}` |
| `find_relationships` | Find entity connections | `{entity_id, depth}` | `{paths: [...]}` |
| `get_entity_context` | Full entity context | `{entity_id}` | `{entity: {...}}` |
| `similarity_search` | Vector similarity | `{query_text, top_k}` | `{similar: [...]}` |

---

## Tool Availability by Level

| Level | Direct Tool Access | Worker Pool Access |
|-------|-------------------|-------------------|
| L1 MASTER | All tools | All workers |
| L2 EXPERT | Domain tools | All workers |
| L3 SPECIALIST | Limited tools | All workers |
| L4 WORKER | Assigned tools only | N/A (is worker) |
| L5 TOOL | Self only | N/A (is tool) |

---

## Error Handling

```json
{
  "status": "error",
  "error_type": "tool_execution_failed|timeout|invalid_input|rate_limited",
  "message": "Human-readable error description",
  "retry_after": 30,
  "fallback_suggestion": "Alternative approach if available"
}
```

### Error Response Pattern
```python
result = await execute_worker_task(...)

if result.status == "error":
    if result.error_type == "timeout":
        # Retry with longer timeout
        pass
    elif result.error_type == "rate_limited":
        # Wait and retry
        await asyncio.sleep(result.retry_after)
    else:
        # Log and escalate
        await escalate_to_higher_level(reason=result.message)
```

---

## Rate Limits

| Worker Type | Requests/Minute | Max Concurrent |
|-------------|-----------------|----------------|
| data_extraction | 30 | 5 |
| computation | 60 | 10 |
| file_processing | 20 | 3 |
| web_search | 20 | 5 |
| api_integration | 30 | 5 |
| knowledge_graph | 100 | 20 |

---

## Context Passing

Always include session context:

```json
{
  "worker_type": "...",
  "task": {...},
  "context": {
    "session_id": "{{session_id}}",
    "requesting_agent": "{{agent_id}}",
    "tenant_id": "{{tenant_id}}",
    "priority": "normal|high|critical"
  }
}
```

---

## Adding New Tools

New tools are added via the tool registry table:

```sql
INSERT INTO tool_registry (
    tool_name,
    worker_type,
    description,
    input_schema,
    output_schema,
    rate_limit_per_minute,
    timeout_seconds,
    is_active
) VALUES (...);
```

Contact Platform team to register new tools.
