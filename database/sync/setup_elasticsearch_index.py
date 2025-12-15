#!/usr/bin/env python3
"""
Setup Elasticsearch Index for VITAL Medical Documents

Creates the vital-medical-docs index with semantic_text field type
for ML-powered semantic search + BM25 keyword search.

Usage:
    cd services/ai-engine
    python ../../database/sync/setup_elasticsearch_index.py
"""

import os
import sys
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Load env from ai-engine
load_dotenv(Path(__file__).parent.parent.parent / 'services' / 'ai-engine' / '.env')

from elasticsearch import Elasticsearch

print("=" * 70)
print(" SETUP ELASTICSEARCH INDEX FOR VITAL")
print(f" {datetime.now().isoformat()}")
print("=" * 70)

# Get credentials from environment
ES_HOST = os.getenv('ELASTICSEARCH_HOSTS')
ES_API_KEY = os.getenv('ELASTICSEARCH_API_KEY')
ES_INDEX = os.getenv('ELASTICSEARCH_INDEX', 'vital-medical-docs')

if not ES_HOST or not ES_API_KEY:
    print("ERROR: ELASTICSEARCH_HOSTS and ELASTICSEARCH_API_KEY must be set")
    sys.exit(1)

print(f"Host: {ES_HOST}")
print(f"Index: {ES_INDEX}")

# Connect to Elasticsearch
client = Elasticsearch(
    ES_HOST,
    api_key=ES_API_KEY
)

# Verify connection
info = client.info()
print(f"Connected to Elasticsearch {info['version']['number']}")
print(f"Cluster: {info['cluster_name']}")

# Check if index exists
if client.indices.exists(index=ES_INDEX):
    print(f"\nIndex '{ES_INDEX}' already exists.")

    # Get current stats
    stats = client.indices.stats(index=ES_INDEX)
    doc_count = stats['_all']['primaries']['docs']['count']
    size_bytes = stats['_all']['primaries']['store']['size_in_bytes']
    print(f"  Documents: {doc_count}")
    print(f"  Size: {size_bytes / 1024 / 1024:.2f} MB")

    # Ask user if they want to delete and recreate
    response = input("\nDo you want to delete and recreate the index? (y/N): ")
    if response.lower() != 'y':
        print("Keeping existing index.")
        sys.exit(0)

    print("Deleting existing index...")
    client.indices.delete(index=ES_INDEX)
    print("Index deleted.")

# Create index with mappings
print(f"\nCreating index '{ES_INDEX}' with semantic_text mappings...")

mappings = {
    "properties": {
        # Main text field with semantic search (ML-powered)
        "text": {
            "type": "semantic_text"
        },
        # Additional searchable fields
        "title": {
            "type": "text",
            "analyzer": "standard"
        },
        "content": {
            "type": "text",
            "analyzer": "standard"
        },
        # Identifiers
        "chunk_id": {
            "type": "keyword"
        },
        "document_id": {
            "type": "keyword"
        },
        "namespace": {
            "type": "keyword"
        },
        # Source information
        "source_type": {
            "type": "keyword"
        },
        "source_name": {
            "type": "keyword"
        },
        "source_url": {
            "type": "keyword"
        },
        # Domain/category
        "knowledge_domain": {
            "type": "keyword"
        },
        "domain_path": {
            "type": "keyword"
        },
        # Timestamps
        "created_at": {
            "type": "date"
        },
        "publication_date": {
            "type": "date"
        },
        # Metadata as nested object
        "metadata": {
            "type": "object",
            "enabled": True
        }
    }
}

settings = {
    "number_of_shards": 1,
    "number_of_replicas": 1,
    "analysis": {
        "analyzer": {
            "medical_analyzer": {
                "type": "custom",
                "tokenizer": "standard",
                "filter": ["lowercase", "stop", "snowball"]
            }
        }
    }
}

create_response = client.indices.create(
    index=ES_INDEX,
    mappings=mappings,
    settings=settings
)

print(f"Index created: {create_response['acknowledged']}")

# Verify index was created
if client.indices.exists(index=ES_INDEX):
    print(f"\n Index '{ES_INDEX}' is ready!")

    # Show mapping
    mapping = client.indices.get_mapping(index=ES_INDEX)
    print("\nIndex mappings:")
    for field, config in mapping[ES_INDEX]['mappings']['properties'].items():
        field_type = config.get('type', 'object')
        print(f"  - {field}: {field_type}")

print("\n" + "=" * 70)
print(" SETUP COMPLETE")
print("=" * 70)
print(f"""
Next steps:
1. Sync documents from Pinecone/Supabase to Elasticsearch
2. Run: python ../../database/sync/sync_chunks_to_elasticsearch.py

The index supports:
- Semantic search (ML-powered via semantic_text)
- BM25 keyword search (traditional full-text)
- Filtering by namespace, domain, source_type
""")
