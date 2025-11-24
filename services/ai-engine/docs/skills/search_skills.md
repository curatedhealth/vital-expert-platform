# Search Skills

## Overview
Search skills provide hybrid search capabilities across multiple data sources using GraphRAG (PostgreSQL + Pinecone + Neo4j).

## Skills

### Search Agents
**ID**: `search_agents`  
**Type**: `custom`  
**Category**: `search`  
**Complexity**: `advanced`

**Description**: Search for agents by capability, domain, or keywords using hybrid GraphRAG (PostgreSQL 30% + Pinecone 50% + Neo4j 20%).

**Usage Example**:
```python
result = await execute_skill(
    skill_id="search_agents",
    context={
        "query": "clinical trial expert with biostatistics",
        "max_results": 5
    }
)
```

**Returns**: Ranked list of matching agents with confidence scores

---

### Search Knowledge Base
**ID**: `search_knowledge_base`  
**Type**: `custom`  
**Category**: `search`  
**Complexity**: `intermediate`

**Description**: Search regulatory knowledge base using vector similarity and full-text search.

**Usage**: Finding relevant regulations, guidelines, and compliance documents

---

### Literature Search
**ID**: `literature_search`  
**Type**: `custom`  
**Category**: `search`  
**Complexity**: `advanced`

**Description**: Search medical/scientific literature via PubMed, clinical trial databases.

**Usage**: Evidence-based research and citation gathering

**Best Practices**:
- Use specific medical terminology
- Filter by date range for current information
- Include MeSH terms when available
- Verify sources and citations

---

## Integration
Search skills integrate with:
- **GraphRAG Service**: Hybrid search orchestration
- **Pinecone**: Vector embeddings
- **Neo4j**: Knowledge graph traversal
- **PostgreSQL**: Full-text search

## See Also
- [Data Retrieval Skills](./data_retrieval_skills.md)
- [Analysis Skills](./analysis_skills.md)

