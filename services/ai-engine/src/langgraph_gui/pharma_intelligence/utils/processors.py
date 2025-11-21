"""
Data Processing and Pinecone Upsert Components
Compatible with pinecone-client 2.2.4
"""

from langchain_core.language_models import BaseChatModel
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import OpenAIEmbeddings
# Conditional pinecone import - only import when needed
try:
    import pinecone
    from pinecone import Pinecone, ServerlessSpec
    PINECONE_AVAILABLE = True
except ImportError:
    pinecone = None
    Pinecone = None
    ServerlessSpec = None
    PINECONE_AVAILABLE = False
from typing import List, Dict
import hashlib
import json
from datetime import datetime


class PharmaNewsCleanerSummarizer:
    """
    Cleans and summarizes pharma news articles using LLM
    """
    
    def __init__(self, llm: BaseChatModel):
        self.llm = llm
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert pharmaceutical news analyst. Your task is to clean and summarize pharmaceutical news articles.

For each article, provide:
1. A clean, corrected title (fix any encoding issues, typos)
2. A concise 2-3 sentence summary highlighting:
   - Key drug/therapy mentioned
   - Company/organization involved
   - Main finding or announcement
   - Clinical or regulatory significance

3. Extract key entities:
   - Drug names
   - Company names
   - Therapeutic areas
   - Clinical trial phases (if mentioned)
   - Regulatory actions (approval, rejection, etc.)

Return JSON format:
{{
    "clean_title": "...",
    "summary": "...",
    "entities": {{
        "drugs": [...],
        "companies": [...],
        "therapeutic_areas": [...],
        "trial_phases": [...],
        "regulatory_actions": [...]
    }},
    "relevance_score": 0-10
}}"""),
            ("human", """Title: {title}
Description: {description}
Source: {source}

Clean and summarize this article.""")
        ])
        
        self.chain = self.prompt | self.llm
    
    def process(self, articles: List[Dict]) -> List[Dict]:
        """Process list of articles"""
        processed = []
        
        for i, article in enumerate(articles):
            print(f"    Processing article {i+1}/{len(articles)}...", end="\r")
            
            try:
                # Invoke LLM
                result = self.chain.invoke({
                    "title": article.get("title", ""),
                    "description": article.get("description", ""),
                    "source": article.get("source", "")
                })
                
                # Parse JSON response
                content = result.content
                
                # Try to extract JSON from markdown code blocks if present
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0].strip()
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0].strip()
                
                analysis = json.loads(content)
                
                # Combine original and processed data
                processed_article = {
                    **article,
                    "clean_title": analysis.get("clean_title", article.get("title")),
                    "summary": analysis.get("summary", ""),
                    "entities": analysis.get("entities", {}),
                    "relevance_score": analysis.get("relevance_score", 5),
                    "processed_at": datetime.now().isoformat()
                }
                
                # Only keep articles with relevance >= 5
                if processed_article["relevance_score"] >= 5:
                    processed.append(processed_article)
            
            except Exception as e:
                print(f"\n    Error processing article: {str(e)}")
                # Keep original if processing fails
                processed.append({
                    **article,
                    "clean_title": article.get("title", ""),
                    "summary": article.get("description", "")[:200],
                    "entities": {},
                    "relevance_score": 5,
                    "processed_at": datetime.now().isoformat()
                })
        
        print(f"\n    ✓ Processed {len(processed)} relevant articles")
        return processed


class DataProcessorPinecone:
    """
    Process data and upsert to Pinecone vector database
    """
    
    def __init__(
        self,
        pinecone_api_key: str,
        index_name: str,
        embeddings: OpenAIEmbeddings,
        dimension: int = 1536,
        metric: str = "cosine"
    ):
        if not PINECONE_AVAILABLE:
            raise ImportError("Pinecone module is not installed. Please install it with: pip install pinecone-client")
        
        self.pinecone_api_key = pinecone_api_key
        self.index_name = index_name
        self.embeddings = embeddings
        self.dimension = dimension
        self.metric = metric
        
        # Initialize Pinecone
        self.pc = Pinecone(api_key=pinecone_api_key)
        
        # Create index if it doesn't exist
        self._ensure_index_exists()
        
        # Get index
        self.index = self.pc.Index(index_name)
    
    def _ensure_index_exists(self):
        """Create index if it doesn't exist"""
        existing_indexes = [idx.name for idx in self.pc.list_indexes()]
        
        if self.index_name not in existing_indexes:
            print(f"  Creating Pinecone index: {self.index_name}")
            self.pc.create_index(
                name=self.index_name,
                dimension=self.dimension,
                metric=self.metric,
                spec=ServerlessSpec(
                    cloud='aws',
                    region='us-east-1'
                )
            )
    
    def _generate_id(self, article: Dict) -> str:
        """Generate unique ID for article"""
        # Use URL if available, otherwise hash content
        if article.get("link"):
            return hashlib.md5(article["link"].encode()).hexdigest()
        
        content = f"{article.get('title', '')}{article.get('source', '')}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def upsert(self, articles: List[Dict]) -> Dict:
        """Upsert articles to Pinecone"""
        vectors = []
        
        for article in articles:
            # Create text for embedding
            text_to_embed = f"""
            Title: {article.get('clean_title', article.get('title', ''))}
            Summary: {article.get('summary', '')}
            Source: {article.get('source', '')}
            """.strip()
            
            # Generate embedding
            embedding = self.embeddings.embed_query(text_to_embed)
            
            # Create metadata
            metadata = {
                "title": article.get("clean_title", article.get("title", "")),
                "summary": article.get("summary", ""),
                "source": article.get("source", ""),
                "link": article.get("link", ""),
                "published_date": article.get("published_date", ""),
                "scraped_at": article.get("scraped_at", ""),
                "processed_at": article.get("processed_at", ""),
                "relevance_score": article.get("relevance_score", 5),
                "entities": json.dumps(article.get("entities", {})),
                "text": text_to_embed
            }
            
            # Create vector
            vector_id = self._generate_id(article)
            vectors.append({
                "id": vector_id,
                "values": embedding,
                "metadata": metadata
            })
        
        # Upsert in batches
        batch_size = 100
        upserted_count = 0
        
        for i in range(0, len(vectors), batch_size):
            batch = vectors[i:i + batch_size]
            self.index.upsert(vectors=batch)
            upserted_count += len(batch)
            print(f"    Upserted {upserted_count}/{len(vectors)} vectors...", end="\r")
        
        print()
        
        return {
            "count": len(vectors),
            "index": self.index_name,
            "timestamp": datetime.now().isoformat()
        }
