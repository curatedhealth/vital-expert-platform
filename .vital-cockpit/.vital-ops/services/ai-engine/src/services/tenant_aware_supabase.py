"""
Tenant-Aware Supabase Client Wrapper
Automatically filters all database queries by tenant_id using the shared-kernel TenantContext.
"""

from typing import Any, Dict, List, Optional
from contextlib import asynccontextmanager
import structlog

# Import from shared-kernel
from vital_shared_kernel.multi_tenant import TenantId, TenantContext, TenantContextNotSetError

from services.supabase_client import SupabaseClient

logger = structlog.get_logger()


class TenantAwareSupabaseClient:
    """
    Wrapper around SupabaseClient that automatically applies tenant filtering.
    
    This client:
    1. Retrieves current tenant from TenantContext
    2. Automatically adds tenant_id filters to queries
    3. Prevents cross-tenant data leakage
    4. Works seamlessly with RLS policies
    
    Usage:
        client = TenantAwareSupabaseClient(supabase_client)
        
        # Automatically filtered by current tenant
        result = await client.query("board_session").select("*").execute()
        
        # Insert with automatic tenant_id
        await client.insert("board_session", {...})
    """
    
    def __init__(self, supabase_client: SupabaseClient):
        """
        Initialize tenant-aware client.
        
        Args:
            supabase_client: The underlying Supabase client
        """
        self._client = supabase_client
        self._current_tenant: Optional[TenantId] = None
    
    @property
    def raw_client(self) -> SupabaseClient:
        """Access underlying client (use with caution - bypasses tenant filtering)"""
        return self._client
    
    def _get_current_tenant(self) -> TenantId:
        """
        Get current tenant from context.
        
        Returns:
            Current TenantId
            
        Raises:
            TenantContextNotSetError: If no tenant context is set
        """
        try:
            return TenantContext.get()
        except TenantContextNotSetError:
            logger.error("Attempted database operation without tenant context")
            raise
    
    @asynccontextmanager
    async def tenant_context(self, tenant_id: TenantId):
        """
        Temporarily set tenant context for operations.
        
        Args:
            tenant_id: Tenant to use for operations
            
        Usage:
            async with client.tenant_context(tenant_id):
                result = await client.query("board_session").execute()
        """
        previous = TenantContext.get_optional()
        try:
            TenantContext.set(tenant_id)
            yield
        finally:
            if previous:
                TenantContext.set(previous)
            else:
                TenantContext.clear()
    
    async def set_tenant_context_in_db(self, tenant_id: Optional[TenantId] = None):
        """
        Set tenant context in database for RLS.
        
        Args:
            tenant_id: Optional tenant ID. If None, uses current context.
        """
        tid = tenant_id or self._get_current_tenant()
        await self._client.set_tenant_context(str(tid))
        logger.debug("Database tenant context set", tenant_id=str(tid))
    
    def query(self, table: str):
        """
        Create a query builder with automatic tenant filtering.
        
        Args:
            table: Table name to query
            
        Returns:
            Query builder with tenant filter applied
        """
        tenant_id = self._get_current_tenant()
        
        # Start query with tenant filter
        query = self._client.client.table(table).select("*")
        
        # Add tenant_id filter for multi-tenant tables
        # Skip for tables that don't have tenant_id column
        TABLES_WITHOUT_TENANT = {"users", "system_config"}
        
        if table not in TABLES_WITHOUT_TENANT:
            query = query.eq("tenant_id", str(tenant_id))
            logger.debug(
                "Query with tenant filter",
                table=table,
                tenant_id=str(tenant_id)
            )
        
        return query
    
    async def insert(self, table: str, data: Dict[str, Any], tenant_id: Optional[TenantId] = None) -> Dict:
        """
        Insert record with automatic tenant_id.
        
        Args:
            table: Table name
            data: Record data
            tenant_id: Optional tenant ID override
            
        Returns:
            Inserted record
        """
        tid = tenant_id or self._get_current_tenant()
        
        # Add tenant_id to data
        data_with_tenant = {**data, "tenant_id": str(tid)}
        
        result = self._client.client.table(table).insert(data_with_tenant).execute()
        
        logger.info(
            "Record inserted",
            table=table,
            tenant_id=str(tid),
            record_id=result.data[0].get("id") if result.data else None
        )
        
        return result.data[0] if result.data else None
    
    async def update(
        self,
        table: str,
        record_id: str,
        data: Dict[str, Any],
        tenant_id: Optional[TenantId] = None
    ) -> Dict:
        """
        Update record with tenant validation.
        
        Args:
            table: Table name
            record_id: Record ID to update
            data: Updated data
            tenant_id: Optional tenant ID override
            
        Returns:
            Updated record
            
        Raises:
            ValueError: If record doesn't belong to tenant
        """
        tid = tenant_id or self._get_current_tenant()
        
        # Verify record belongs to tenant (security check)
        existing = self._client.client.table(table)\
            .select("id")\
            .eq("id", record_id)\
            .eq("tenant_id", str(tid))\
            .execute()
        
        if not existing.data:
            logger.warning(
                "Update attempted on non-existent or wrong-tenant record",
                table=table,
                record_id=record_id,
                tenant_id=str(tid)
            )
            raise ValueError(f"Record {record_id} not found for tenant {tid}")
        
        # Perform update
        result = self._client.client.table(table)\
            .update(data)\
            .eq("id", record_id)\
            .eq("tenant_id", str(tid))\
            .execute()
        
        logger.info(
            "Record updated",
            table=table,
            record_id=record_id,
            tenant_id=str(tid)
        )
        
        return result.data[0] if result.data else None
    
    async def delete(
        self,
        table: str,
        record_id: str,
        tenant_id: Optional[TenantId] = None
    ) -> bool:
        """
        Delete record with tenant validation.
        
        Args:
            table: Table name
            record_id: Record ID to delete
            tenant_id: Optional tenant ID override
            
        Returns:
            True if deleted, False otherwise
        """
        tid = tenant_id or self._get_current_tenant()
        
        result = self._client.client.table(table)\
            .delete()\
            .eq("id", record_id)\
            .eq("tenant_id", str(tid))\
            .execute()
        
        success = bool(result.data)
        
        logger.info(
            "Record deletion attempted",
            table=table,
            record_id=record_id,
            tenant_id=str(tid),
            success=success
        )
        
        return success
    
    async def get_by_id(
        self,
        table: str,
        record_id: str,
        tenant_id: Optional[TenantId] = None
    ) -> Optional[Dict]:
        """
        Get record by ID with tenant validation.
        
        Args:
            table: Table name
            record_id: Record ID
            tenant_id: Optional tenant ID override
            
        Returns:
            Record data or None if not found
        """
        tid = tenant_id or self._get_current_tenant()
        
        result = self._client.client.table(table)\
            .select("*")\
            .eq("id", record_id)\
            .eq("tenant_id", str(tid))\
            .execute()
        
        return result.data[0] if result.data else None
    
    async def list_all(
        self,
        table: str,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
        limit: Optional[int] = None,
        tenant_id: Optional[TenantId] = None
    ) -> List[Dict]:
        """
        List all records for tenant with optional filters.
        
        Args:
            table: Table name
            filters: Additional filters to apply
            order_by: Column to order by
            limit: Max records to return
            tenant_id: Optional tenant ID override
            
        Returns:
            List of records
        """
        tid = tenant_id or self._get_current_tenant()
        
        query = self._client.client.table(table).select("*").eq("tenant_id", str(tid))
        
        # Apply additional filters
        if filters:
            for key, value in filters.items():
                query = query.eq(key, value)
        
        # Apply ordering
        if order_by:
            query = query.order(order_by)
        
        # Apply limit
        if limit:
            query = query.limit(limit)
        
        result = query.execute()
        
        logger.debug(
            "List query executed",
            table=table,
            tenant_id=str(tid),
            count=len(result.data) if result.data else 0
        )
        
        return result.data or []
    
    async def count(
        self,
        table: str,
        filters: Optional[Dict[str, Any]] = None,
        tenant_id: Optional[TenantId] = None
    ) -> int:
        """
        Count records for tenant with optional filters.
        
        Args:
            table: Table name
            filters: Additional filters to apply
            tenant_id: Optional tenant ID override
            
        Returns:
            Record count
        """
        tid = tenant_id or self._get_current_tenant()
        
        query = self._client.client.table(table)\
            .select("id", count="exact")\
            .eq("tenant_id", str(tid))
        
        # Apply additional filters
        if filters:
            for key, value in filters.items():
                query = query.eq(key, value)
        
        result = query.execute()
        
        return result.count or 0


# Factory function
def create_tenant_aware_client(supabase_client: SupabaseClient) -> TenantAwareSupabaseClient:
    """
    Create a tenant-aware Supabase client.
    
    Args:
        supabase_client: Base Supabase client
        
    Returns:
        Tenant-aware wrapper client
    """
    return TenantAwareSupabaseClient(supabase_client)

