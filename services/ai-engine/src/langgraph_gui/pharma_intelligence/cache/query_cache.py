"""
Query caching system with intelligent TTL and similarity matching.

Reduces costs by caching query results and returning them for similar queries.
"""

import sqlite3
import json
import time
from typing import Dict, Optional, List, Tuple
from datetime import datetime, timedelta
from pathlib import Path

from .similarity import QuerySimilarity


class QueryCache:
    """Intelligent query caching with similarity detection."""
    
    # Cache TTL by query type (in seconds)
    TTL_CONFIG = {
        'clinical_trials': 7 * 24 * 3600,      # 7 days
        'news': 1 * 24 * 3600,                 # 1 day
        'drug_info': 30 * 24 * 3600,           # 30 days
        'regulatory': 14 * 24 * 3600,          # 14 days
        'research': 14 * 24 * 3600,            # 14 days
        'default': 7 * 24 * 3600               # 7 days
    }
    
    def __init__(
        self, 
        openai_api_key: str,
        db_path: str = ".cache/query_cache.db",
        similarity_threshold: float = 0.85
    ):
        """
        Initialize query cache.
        
        Args:
            openai_api_key: OpenAI API key for embeddings
            db_path: Path to SQLite database
            similarity_threshold: Minimum similarity for cache hit (0-1)
        """
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        self.similarity = QuerySimilarity(openai_api_key, similarity_threshold)
        self._init_database()
        
        # Statistics
        self.stats = {
            'hits': 0,
            'misses': 0,
            'similar_hits': 0
        }
    
    def _init_database(self):
        """Initialize SQLite database schema."""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS query_cache (
                cache_key TEXT PRIMARY KEY,
                query TEXT NOT NULL,
                query_embedding TEXT,
                result TEXT NOT NULL,
                query_type TEXT,
                cost_saved REAL DEFAULT 0.0,
                created_at INTEGER NOT NULL,
                expires_at INTEGER NOT NULL,
                hit_count INTEGER DEFAULT 0,
                last_accessed INTEGER
            )
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_expires_at 
            ON query_cache(expires_at)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_query_type 
            ON query_cache(query_type)
        ''')
        
        conn.commit()
        conn.close()
    
    def _detect_query_type(self, query: str) -> str:
        """
        Detect query type for appropriate TTL.
        
        Args:
            query: Query text
            
        Returns:
            Query type string
        """
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['trial', 'study', 'phase', 'enrollment']):
            return 'clinical_trials'
        elif any(word in query_lower for word in ['news', 'latest', 'recent', 'announcement']):
            return 'news'
        elif any(word in query_lower for word in ['fda', 'approval', 'regulatory', 'compliance']):
            return 'regulatory'
        elif any(word in query_lower for word in ['drug', 'medication', 'treatment', 'therapy']):
            return 'drug_info'
        elif any(word in query_lower for word in ['research', 'study', 'paper', 'publication']):
            return 'research'
        else:
            return 'default'
    
    def get(self, query: str) -> Optional[Dict]:
        """
        Get cached result for query (exact or similar match).
        
        Args:
            query: Query text
            
        Returns:
            Cached result dict or None if not found/expired
        """
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        # Clean expired entries
        current_time = int(time.time())
        cursor.execute('DELETE FROM query_cache WHERE expires_at < ?', (current_time,))
        
        # Try exact match first
        cache_key = self.similarity.generate_cache_key(query)
        cursor.execute(
            'SELECT result, hit_count FROM query_cache WHERE cache_key = ? AND expires_at >= ?',
            (cache_key, current_time)
        )
        
        row = cursor.fetchone()
        if row:
            # Exact match found
            result_json, hit_count = row
            
            # Update hit count and last accessed
            cursor.execute('''
                UPDATE query_cache 
                SET hit_count = hit_count + 1, last_accessed = ?
                WHERE cache_key = ?
            ''', (current_time, cache_key))
            conn.commit()
            conn.close()
            
            self.stats['hits'] += 1
            
            result = json.loads(result_json)
            result['_cache_info'] = {
                'hit_type': 'exact',
                'hit_count': hit_count + 1,
                'from_cache': True
            }
            return result
        
        # Try similarity match
        cursor.execute(
            'SELECT query, query_embedding, result, hit_count FROM query_cache WHERE expires_at >= ?',
            (current_time,)
        )
        
        cached_queries = []
        for row in cursor.fetchall():
            cached_query, embedding_json, result_json, hit_count = row
            if embedding_json:
                embedding = json.loads(embedding_json)
                cached_queries.append((cached_query, embedding, result_json, hit_count))
        
        conn.close()
        
        if not cached_queries:
            self.stats['misses'] += 1
            return None
        
        # Find most similar
        query_emb = self.similarity.get_embedding(query)
        if query_emb is None:
            self.stats['misses'] += 1
            return None
        
        max_similarity = 0.0
        best_match = None
        
        for cached_query, cached_emb, result_json, hit_count in cached_queries:
            similarity = self.similarity.cosine_similarity(query_emb, cached_emb)
            
            if similarity > max_similarity:
                max_similarity = similarity
                best_match = (cached_query, result_json, hit_count)
        
        if best_match and max_similarity >= self.similarity.similarity_threshold:
            # Similar match found
            cached_query, result_json, hit_count = best_match
            
            # Update hit count
            cache_key = self.similarity.generate_cache_key(cached_query)
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE query_cache 
                SET hit_count = hit_count + 1, last_accessed = ?
                WHERE cache_key = ?
            ''', (current_time, cache_key))
            conn.commit()
            conn.close()
            
            self.stats['similar_hits'] += 1
            
            result = json.loads(result_json)
            result['_cache_info'] = {
                'hit_type': 'similar',
                'similarity_score': max_similarity,
                'original_query': cached_query,
                'hit_count': hit_count + 1,
                'from_cache': True
            }
            return result
        
        self.stats['misses'] += 1
        return None
    
    def set(
        self, 
        query: str, 
        result: Dict, 
        cost_saved: float = 0.0,
        query_type: Optional[str] = None
    ):
        """
        Cache query result.
        
        Args:
            query: Query text
            result: Result dictionary to cache
            cost_saved: Estimated cost saved if this is used from cache
            query_type: Optional query type, auto-detected if None
        """
        if query_type is None:
            query_type = self._detect_query_type(query)
        
        ttl = self.TTL_CONFIG.get(query_type, self.TTL_CONFIG['default'])
        
        cache_key = self.similarity.generate_cache_key(query)
        current_time = int(time.time())
        expires_at = current_time + ttl
        
        # Get embedding
        embedding = self.similarity.get_embedding(query)
        embedding_json = json.dumps(embedding) if embedding else None
        
        # Remove cache metadata if present
        result_to_cache = result.copy()
        result_to_cache.pop('_cache_info', None)
        
        result_json = json.dumps(result_to_cache)
        
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO query_cache 
            (cache_key, query, query_embedding, result, query_type, cost_saved, created_at, expires_at, hit_count, last_accessed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
        ''', (cache_key, query, embedding_json, result_json, query_type, cost_saved, current_time, expires_at, current_time))
        
        conn.commit()
        conn.close()
    
    def clear_expired(self):
        """Remove all expired cache entries."""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        current_time = int(time.time())
        cursor.execute('DELETE FROM query_cache WHERE expires_at < ?', (current_time,))
        
        deleted = cursor.rowcount
        conn.commit()
        conn.close()
        
        return deleted
    
    def get_stats(self) -> Dict:
        """Get cache statistics."""
        total_requests = self.stats['hits'] + self.stats['similar_hits'] + self.stats['misses']
        hit_rate = 0.0
        if total_requests > 0:
            hit_rate = (self.stats['hits'] + self.stats['similar_hits']) / total_requests
        
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*), SUM(cost_saved) FROM query_cache WHERE expires_at >= ?', (int(time.time()),))
        cached_count, total_saved = cursor.fetchone()
        
        cursor.execute('SELECT query_type, COUNT(*) FROM query_cache WHERE expires_at >= ? GROUP BY query_type', (int(time.time()),))
        by_type = dict(cursor.fetchall())
        
        conn.close()
        
        return {
            'exact_hits': self.stats['hits'],
            'similar_hits': self.stats['similar_hits'],
            'misses': self.stats['misses'],
            'hit_rate': hit_rate,
            'cached_queries': cached_count or 0,
            'estimated_cost_saved': total_saved or 0.0,
            'by_type': by_type
        }
    
    def clear_all(self):
        """Clear entire cache."""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        cursor.execute('DELETE FROM query_cache')
        conn.commit()
        conn.close()
        
        self.stats = {
            'hits': 0,
            'misses': 0,
            'similar_hits': 0
        }


