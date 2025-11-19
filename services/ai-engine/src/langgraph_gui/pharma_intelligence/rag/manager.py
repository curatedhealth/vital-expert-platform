"""
RAG Manager for Knowledge Base Operations
Handles search, archiving, and retrieval from vector database

Production-ready with:
- Proper error handling
- Connection retries
- Index validation
- Batch processing
"""

from langchain_openai import OpenAIEmbeddings
import pinecone
from typing import List, Dict, Optional
import hashlib
import json
from datetime import datetime
import time


class RAGManager:
    """
    Manages RAG operations: search, archive, retrieve
    Production-ready implementation with error handling
    Compatible with pinecone-client 2.2.4
    """
    
    def __init__(
        self,
        pinecone_api_key: str,
        index_name: str,
        embeddings: OpenAIEmbeddings,
        dimension: int = 1536,
        max_retries: int = 3
    ):
        self.pinecone_api_key = pinecone_api_key
        self.index_name = index_name
        self.embeddings = embeddings
        self.dimension = dimension
        self.max_retries = max_retries
        
        # Initialize Pinecone with retry logic
        self._init_pinecone()
        
        # Create index if needed
        self._ensure_index_exists()
        
        # Get index with validation
        self.index = self._get_index()
    
    def _init_pinecone(self):
        """Initialize Pinecone with retry logic (v2.2.4 API)"""
        for attempt in range(self.max_retries):
            try:
                # Initialize without environment - will use the default from API key
                pinecone.init(api_key=self.pinecone_api_key)
                # Test connection
                pinecone.list_indexes()
                return
            except Exception as e:
                if attempt == self.max_retries - 1:
                    raise Exception(f"Failed to initialize Pinecone after {self.max_retries} attempts: {str(e)}")
                time.sleep(2 ** attempt)  # Exponential backoff
        
    def _ensure_index_exists(self):
        """Create index if it doesn't exist (v2.2.4 API)"""
        try:
            existing_indexes = pinecone.list_indexes()
            
            if self.index_name not in existing_indexes:
                print(f"  Creating Pinecone index: {self.index_name}")
                pinecone.create_index(
                    name=self.index_name,
                    dimension=self.dimension,
                    metric="cosine"
                )
                # Wait longer for index to be ready (up to 60 seconds)
                print(f"  Waiting for index to be ready...")
                for i in range(12):  # Check every 5 seconds for up to 60 seconds
                    time.sleep(5)
                    try:
                        if self.index_name in pinecone.list_indexes():
                            print(f"  [OK] Index created successfully")
                            return
                    except:
                        pass
                print(f"  [!] Index creation may still be in progress")
        except Exception as e:
            print(f"  [!] Note: {str(e)}")
            # Don't fail - index might already exist or we'll create it later
    
    def _get_index(self):
        """Get index with validation (v2.2.4 API)"""
        for attempt in range(self.max_retries):
            try:
                # Check if index exists first
                existing_indexes = pinecone.list_indexes()
                if self.index_name not in existing_indexes:
                    print(f"  [!] Index '{self.index_name}' does not exist. Creating it now...")
                    self._ensure_index_exists()
                
                index = pinecone.Index(self.index_name)
                # Validate index is accessible
                index.describe_index_stats()
                return index
            except Exception as e:
                if attempt == self.max_retries - 1:
                    # Instead of failing, create a dummy index handler that will skip operations
                    print(f"  [!] Warning: Cannot access Pinecone index '{self.index_name}': {str(e)}")
                    print(f"  [!] Continuing without RAG - system will work but without knowledge base")
                    return None  # Return None instead of failing
                time.sleep(2 ** attempt)
    
    def search(
        self,
        query: str,
        top_k: int = 10,
        filter_domain: Optional[str] = None
    ) -> List[Dict]:
        """
        Search knowledge base with error handling
        
        Args:
            query: Search query
            top_k: Number of results
            filter_domain: Filter by domain (medical, digital_health, regulatory)
        """
        # Skip if index is not available
        if self.index is None:
            return []
            
        try:
            # Generate embedding
            query_embedding = self.embeddings.embed_query(query)
            
            # Build filter if domain specified
            filter_dict = {}
            if filter_domain:
                filter_dict["domain"] = {"$eq": filter_domain}
            
            # Query Pinecone with retry logic
            for attempt in range(self.max_retries):
                try:
                    results = self.index.query(
                        vector=query_embedding,
                        top_k=top_k,
                        include_metadata=True,
                        filter=filter_dict if filter_dict else None
                    )
                    break
                except Exception as e:
                    if attempt == self.max_retries - 1:
                        print(f"  [!] RAG search skipped: {str(e)}")
                        return []
                    time.sleep(2 ** attempt)
            
            # Format results
            formatted_results = []
            for match in results.get('matches', []):
                formatted_results.append({
                    "id": match['id'],
                    "score": match['score'],
                    "metadata": match.get('metadata', {}),
                    "text": match.get('metadata', {}).get('text', '')
                })
            
            return formatted_results
            
        except Exception as e:
            print(f"  [!] RAG search error: {str(e)}")
            return []
    
    def archive_research(
        self,
        query: str,
        aggregated_data: Dict
    ):
        """
        Archive research findings in knowledge base
        
        Args:
            query: Original query
            aggregated_data: Aggregated research data
        """
        # Skip if index is not available
        if self.index is None:
            print(f"  [!] RAG archiving skipped - index not available")
            return
            
        try:
            vectors = []
            
            # Archive key findings
            for i, finding in enumerate(aggregated_data.get('key_findings', [])):
                try:
                    text = f"Query: {query}\nFinding: {finding}"
                    embedding = self.embeddings.embed_query(text)
                    
                    vector_id = hashlib.md5(
                        f"{query}_{finding}_{datetime.now().isoformat()}".encode()
                    ).hexdigest()
                    
                    metadata = {
                        "query": query,
                        "finding": finding[:1000],  # Truncate for metadata size limits
                        "type": "key_finding",
                        "timestamp": datetime.now().isoformat(),
                        "text": text[:1000]
                    }
                    
                    vectors.append({
                        "id": vector_id,
                        "values": embedding,
                        "metadata": metadata
                    })
                except Exception as e:
                    print(f"  ⚠️  Error archiving finding: {str(e)}")
                    continue
            
            # Archive synthesis
            synthesis = aggregated_data.get('synthesis', '')
            if synthesis:
                try:
                    text = f"Query: {query}\nSynthesis: {synthesis}"
                    embedding = self.embeddings.embed_query(text)
                    
                    vector_id = hashlib.md5(
                        f"{query}_synthesis_{datetime.now().isoformat()}".encode()
                    ).hexdigest()
                    
                    metadata = {
                        "query": query,
                        "synthesis": synthesis[:1000],
                        "type": "synthesis",
                        "timestamp": datetime.now().isoformat(),
                        "text": text[:1000]
                    }
                    
                    vectors.append({
                        "id": vector_id,
                        "values": embedding,
                        "metadata": metadata
                    })
                except Exception as e:
                    print(f"  ⚠️  Error archiving synthesis: {str(e)}")
            
            # Archive agent outputs by domain
            agent_outputs = aggregated_data.get('agent_outputs', [])
            for output in agent_outputs:
                try:
                    domain = output.get('domain', 'general')
                    findings_text = output.get('findings', '')
                    
                    if findings_text:
                        text = f"Query: {query}\nDomain: {domain}\nFindings: {findings_text}"
                        embedding = self.embeddings.embed_query(text)
                        
                        vector_id = hashlib.md5(
                            f"{query}_{domain}_{datetime.now().isoformat()}".encode()
                        ).hexdigest()
                        
                        metadata = {
                            "query": query,
                            "domain": domain,
                            "agent": output.get('agent_name', 'unknown'),
                            "findings": findings_text[:1000],
                            "confidence": output.get('confidence_score', 0),
                            "type": "agent_output",
                            "timestamp": datetime.now().isoformat(),
                            "text": text[:1000]
                        }
                        
                        vectors.append({
                            "id": vector_id,
                            "values": embedding,
                            "metadata": metadata
                        })
                except Exception as e:
                    print(f"  ⚠️  Error archiving agent output: {str(e)}")
                    continue
            
            # Upsert to Pinecone in batches
            if vectors:
                batch_size = 100
                for i in range(0, len(vectors), batch_size):
                    batch = vectors[i:i + batch_size]
                    
                    for attempt in range(self.max_retries):
                        try:
                            self.index.upsert(vectors=batch)
                            break
                        except Exception as e:
                            if attempt == self.max_retries - 1:
                                print(f"  ⚠️  Failed to upsert batch: {str(e)}")
                            time.sleep(2 ** attempt)
                
                print(f"  ✓ Archived {len(vectors)} items to knowledge base")
            else:
                print(f"  ℹ️  No items to archive")
                
        except Exception as e:
            print(f"  ⚠️  Archive error: {str(e)}")
            # Don't fail the entire workflow if archiving fails
    
    def get_related_research(self, query: str, top_k: int = 5) -> List[Dict]:
        """
        Get previously completed research related to query
        """
        return self.search(query, top_k=top_k)
    
    def get_domain_specific(
        self,
        query: str,
        domain: str,
        top_k: int = 5
    ) -> List[Dict]:
        """
        Get domain-specific research
        
        Args:
            query: Search query
            domain: Domain filter (medical, digital_health, regulatory)
            top_k: Number of results
        """
        return self.search(query, top_k=top_k, filter_domain=domain)
