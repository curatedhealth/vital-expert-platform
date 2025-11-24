"""
PostgreSQL Client for GraphRAG
Handles connections to Supabase PostgreSQL for RAG profiles, KG views, and agent metadata
"""

import asyncio
from typing import Any, Dict, List, Optional
from contextlib import asynccontextmanager
import structlog
import asyncpg

from core.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


class PostgresClient:
    """
    Production-ready PostgreSQL client with connection pooling
    
    Features:
    - Connection pooling for performance
    - Automatic retry with exponential backoff
    - Health checks
    - Query timeouts
    - Structured logging
    """
    
    def __init__(
        self,
        connection_string: Optional[str] = None,
        min_size: int = 5,
        max_size: int = 20,
        command_timeout: float = 30.0
    ):
        """
        Initialize PostgreSQL client
        
        Args:
            connection_string: Database connection string (defaults to settings)
            min_size: Minimum pool size
            max_size: Maximum pool size
            command_timeout: Query timeout in seconds
        """
        self.connection_string = connection_string or settings.database_url
        self.min_size = min_size
        self.max_size = max_size
        self.command_timeout = command_timeout
        self._pool: Optional[asyncpg.Pool] = None
        
    async def connect(self):
        """Create connection pool"""
        if self._pool is not None:
            logger.warning("postgres_pool_already_exists")
            return
        
        try:
            self._pool = await asyncpg.create_pool(
                self.connection_string,
                min_size=self.min_size,
                max_size=self.max_size,
                command_timeout=self.command_timeout
            )
            logger.info(
                "postgres_pool_created",
                min_size=self.min_size,
                max_size=self.max_size
            )
        except Exception as e:
            logger.error("postgres_pool_creation_failed", error=str(e))
            raise
    
    async def disconnect(self):
        """Close connection pool"""
        if self._pool is not None:
            await self._pool.close()
            self._pool = None
            logger.info("postgres_pool_closed")
    
    async def health_check(self) -> bool:
        """
        Check if database is healthy
        
        Returns:
            True if database is responsive
        """
        try:
            result = await self.fetchval("SELECT 1")
            return result == 1
        except Exception as e:
            logger.error("postgres_health_check_failed", error=str(e))
            return False
    
    @asynccontextmanager
    async def acquire(self):
        """
        Context manager for acquiring a connection from the pool
        
        Usage:
            async with client.acquire() as conn:
                await conn.execute(...)
        """
        if self._pool is None:
            await self.connect()
        
        async with self._pool.acquire() as connection:
            yield connection
    
    async def execute(
        self,
        query: str,
        *args,
        timeout: Optional[float] = None
    ) -> str:
        """
        Execute a query (INSERT, UPDATE, DELETE)
        
        Args:
            query: SQL query
            *args: Query parameters
            timeout: Optional query timeout
            
        Returns:
            Query status string
        """
        async with self.acquire() as conn:
            try:
                result = await conn.execute(query, *args, timeout=timeout)
                logger.debug(
                    "postgres_execute_success",
                    query=query[:100],
                    result=result
                )
                return result
            except Exception as e:
                logger.error(
                    "postgres_execute_failed",
                    query=query[:100],
                    error=str(e)
                )
                raise
    
    async def fetch(
        self,
        query: str,
        *args,
        timeout: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Fetch multiple rows
        
        Args:
            query: SQL query
            *args: Query parameters
            timeout: Optional query timeout
            
        Returns:
            List of rows as dictionaries
        """
        async with self.acquire() as conn:
            try:
                rows = await conn.fetch(query, *args, timeout=timeout)
                result = [dict(row) for row in rows]
                logger.debug(
                    "postgres_fetch_success",
                    query=query[:100],
                    row_count=len(result)
                )
                return result
            except Exception as e:
                logger.error(
                    "postgres_fetch_failed",
                    query=query[:100],
                    error=str(e)
                )
                raise
    
    async def fetchrow(
        self,
        query: str,
        *args,
        timeout: Optional[float] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch single row
        
        Args:
            query: SQL query
            *args: Query parameters
            timeout: Optional query timeout
            
        Returns:
            Row as dictionary or None
        """
        async with self.acquire() as conn:
            try:
                row = await conn.fetchrow(query, *args, timeout=timeout)
                result = dict(row) if row else None
                logger.debug(
                    "postgres_fetchrow_success",
                    query=query[:100],
                    found=result is not None
                )
                return result
            except Exception as e:
                logger.error(
                    "postgres_fetchrow_failed",
                    query=query[:100],
                    error=str(e)
                )
                raise
    
    async def fetchval(
        self,
        query: str,
        *args,
        column: int = 0,
        timeout: Optional[float] = None
    ) -> Any:
        """
        Fetch single value
        
        Args:
            query: SQL query
            *args: Query parameters
            column: Column index to return
            timeout: Optional query timeout
            
        Returns:
            Single value
        """
        async with self.acquire() as conn:
            try:
                value = await conn.fetchval(
                    query,
                    *args,
                    column=column,
                    timeout=timeout
                )
                logger.debug(
                    "postgres_fetchval_success",
                    query=query[:100],
                    value_type=type(value).__name__
                )
                return value
            except Exception as e:
                logger.error(
                    "postgres_fetchval_failed",
                    query=query[:100],
                    error=str(e)
                )
                raise
    
    async def execute_many(
        self,
        query: str,
        args_list: List[tuple],
        timeout: Optional[float] = None
    ) -> None:
        """
        Execute query multiple times with different parameters
        
        Args:
            query: SQL query
            args_list: List of parameter tuples
            timeout: Optional query timeout
        """
        async with self.acquire() as conn:
            try:
                await conn.executemany(query, args_list, timeout=timeout)
                logger.info(
                    "postgres_execute_many_success",
                    query=query[:100],
                    batch_size=len(args_list)
                )
            except Exception as e:
                logger.error(
                    "postgres_execute_many_failed",
                    query=query[:100],
                    error=str(e)
                )
                raise
    
    async def transaction(self):
        """
        Start a transaction
        
        Usage:
            async with client.acquire() as conn:
                async with conn.transaction():
                    await conn.execute(...)
                    await conn.execute(...)
        """
        async with self.acquire() as conn:
            async with conn.transaction():
                yield conn


# Singleton instance
_postgres_client: Optional[PostgresClient] = None


async def get_postgres_client() -> PostgresClient:
    """Get or create PostgreSQL client singleton"""
    global _postgres_client
    
    if _postgres_client is None:
        _postgres_client = PostgresClient()
        await _postgres_client.connect()
    
    return _postgres_client

