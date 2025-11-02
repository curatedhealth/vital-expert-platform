"""
Panel Domain Types and Enums

Type-safe enums matching the existing Supabase schema.
These are the valid values in the database.
"""

from enum import Enum
from typing import Literal


class PanelType(str, Enum):
    """
    Panel types from panels.panel_type column.
    Matches existing database enum.
    """
    STRUCTURED = "structured"
    OPEN = "open"
    SOCRATIC = "socratic"
    ADVERSARIAL = "adversarial"
    DELPHI = "delphi"
    HYBRID = "hybrid"


class PanelStatus(str, Enum):
    """
    Panel status from panels.status column.
    Matches existing database enum.
    """
    CREATED = "created"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class ResponseType(str, Enum):
    """
    Response types from panel_responses.response_type column.
    Matches existing database enum.
    """
    ANALYSIS = "analysis"
    STATEMENT = "statement"
    REBUTTAL = "rebuttal"
    QUESTION = "question"


class TenantStatus(str, Enum):
    """
    Tenant status from tenants.status column.
    """
    ACTIVE = "active"
    SUSPENDED = "suspended"
    TRIAL = "trial"
    CANCELLED = "cancelled"


class SubscriptionTier(str, Enum):
    """
    Subscription tiers from tenants.subscription_tier column.
    """
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class UserRole(str, Enum):
    """
    User roles from tenant_users.role column.
    """
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    GUEST = "guest"


class UserStatus(str, Enum):
    """
    User status from tenant_users.status column.
    """
    ACTIVE = "active"
    INACTIVE = "inactive"
    INVITED = "invited"


# Type aliases for better readability
PanelTypeStr = Literal["structured", "open", "socratic", "adversarial", "delphi", "hybrid"]
PanelStatusStr = Literal["created", "running", "completed", "failed"]
ResponseTypeStr = Literal["analysis", "statement", "rebuttal", "question"]

