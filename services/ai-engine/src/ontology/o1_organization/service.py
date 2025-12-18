"""
L1 Organization Service

Service for managing organizational structure including functions,
departments, roles, teams, and geographies.
"""

from typing import Optional, List, Dict, Any
from ..base import OntologyLayerService
from .models import (
    BusinessFunction,
    Department,
    Role,
    Team,
    Geography,
    OrganizationContext,
)


class L1OrganizationService(OntologyLayerService[BusinessFunction]):
    """
    Service for L1 Organizational Structure layer.

    Provides operations for:
    - Business function hierarchy
    - Department management
    - Role definitions and lookups
    - Team structures
    - Geographic context
    """

    @property
    def layer_name(self) -> str:
        return "l1_organization"

    @property
    def primary_table(self) -> str:
        return "org_business_functions"

    def _to_model(self, data: Dict[str, Any]) -> BusinessFunction:
        return BusinessFunction(**data)

    # -------------------------------------------------------------------------
    # Business Function Operations
    # -------------------------------------------------------------------------

    async def get_business_functions(
        self,
        include_inactive: bool = False
    ) -> List[BusinessFunction]:
        """Get all business functions for the tenant."""
        try:
            query = self.supabase.table(self.primary_table)\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .order("name")

            if not include_inactive:
                query = query.eq("is_active", True)

            result = await query.execute()
            return [self._to_model(row) for row in result.data]
        except Exception as e:
            print(f"Error fetching business functions: {e}")
            return []

    async def get_function_by_code(self, code: str) -> Optional[BusinessFunction]:
        """Get business function by code."""
        try:
            result = await self.supabase.table(self.primary_table)\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("code", code.upper())\
                .maybe_single()\
                .execute()

            if result.data:
                return self._to_model(result.data)
        except Exception as e:
            print(f"Error fetching function by code: {e}")
        return None

    # -------------------------------------------------------------------------
    # Department Operations
    # -------------------------------------------------------------------------

    async def get_departments(
        self,
        function_id: Optional[str] = None
    ) -> List[Department]:
        """Get departments, optionally filtered by function."""
        try:
            query = self.supabase.table("org_departments")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("is_active", True)

            if function_id:
                query = query.eq("function_id", function_id)

            result = await query.order("name").execute()
            return [Department(**row) for row in result.data]
        except Exception as e:
            print(f"Error fetching departments: {e}")
            return []

    async def get_department_by_id(self, department_id: str) -> Optional[Department]:
        """Get department by ID."""
        try:
            result = await self.supabase.table("org_departments")\
                .select("*")\
                .eq("id", department_id)\
                .eq("tenant_id", self.tenant_id)\
                .maybe_single()\
                .execute()

            if result.data:
                return Department(**result.data)
        except Exception as e:
            print(f"Error fetching department: {e}")
        return None

    # -------------------------------------------------------------------------
    # Role Operations
    # -------------------------------------------------------------------------

    async def get_roles(
        self,
        department_id: Optional[str] = None,
        function_id: Optional[str] = None
    ) -> List[Role]:
        """Get roles, optionally filtered by department or function."""
        try:
            if function_id and not department_id:
                # Get all departments for function first
                departments = await self.get_departments(function_id)
                dept_ids = [d.id for d in departments]

                if not dept_ids:
                    return []

                result = await self.supabase.table("org_roles")\
                    .select("*")\
                    .eq("tenant_id", self.tenant_id)\
                    .eq("is_active", True)\
                    .in_("department_id", dept_ids)\
                    .order("name")\
                    .execute()
            else:
                query = self.supabase.table("org_roles")\
                    .select("*")\
                    .eq("tenant_id", self.tenant_id)\
                    .eq("is_active", True)

                if department_id:
                    query = query.eq("department_id", department_id)

                result = await query.order("name").execute()

            return [Role(**row) for row in result.data]
        except Exception as e:
            print(f"Error fetching roles: {e}")
            return []

    async def get_role_by_id(self, role_id: str) -> Optional[Role]:
        """Get role by ID."""
        try:
            result = await self.supabase.table("org_roles")\
                .select("*")\
                .eq("id", role_id)\
                .eq("tenant_id", self.tenant_id)\
                .maybe_single()\
                .execute()

            if result.data:
                return Role(**result.data)
        except Exception as e:
            print(f"Error fetching role: {e}")
        return None

    # -------------------------------------------------------------------------
    # Context Resolution
    # -------------------------------------------------------------------------

    async def resolve_organization(
        self,
        user_role_id: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> OrganizationContext:
        """
        Resolve full organization context for a user.

        Args:
            user_role_id: Optional explicit role ID
            user_id: Optional user ID to look up role

        Returns:
            OrganizationContext with full organizational hierarchy
        """
        context = OrganizationContext()

        # Get role
        if user_role_id:
            context.role = await self.get_role_by_id(user_role_id)
        elif user_id:
            # Look up user's role from user profile
            # TODO: Implement user profile lookup
            pass

        # Build hierarchy from role
        if context.role:
            # Get department
            context.department = await self.get_department_by_id(context.role.department_id)

            if context.department:
                # Get function
                context.function = await self.get_by_id(context.department.function_id)

                # Get peer roles
                peer_roles = await self.get_roles(department_id=context.department.id)
                context.peer_roles = [r for r in peer_roles if r.id != context.role.id]

            # Build function hierarchy
            if context.function:
                hierarchy = [context.function]
                current = context.function

                while current.parent_id:
                    parent = await self.get_by_id(current.parent_id)
                    if parent:
                        hierarchy.insert(0, parent)
                        current = parent
                    else:
                        break

                context.function_hierarchy = hierarchy

        # Calculate confidence
        confidence = 0.0
        if context.role:
            confidence += 0.4
        if context.department:
            confidence += 0.3
        if context.function:
            confidence += 0.3
        context.confidence_score = confidence

        return context

    async def get_function_for_role(self, role_id: str) -> Optional[BusinessFunction]:
        """Get the business function for a role."""
        role = await self.get_role_by_id(role_id)
        if not role:
            return None

        department = await self.get_department_by_id(role.department_id)
        if not department:
            return None

        return await self.get_by_id(department.function_id)
