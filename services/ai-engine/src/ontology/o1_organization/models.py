"""
L1 Organization Models

Data structures for organizational hierarchy including functions,
departments, roles, teams, and geographies.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class BusinessFunction(BaseModel):
    """Business function classification (e.g., Medical Affairs, Commercial)."""
    id: str
    tenant_id: str
    code: str = Field(..., description="Unique code (e.g., 'MEDICAL_AFFAIRS')")
    name: str
    description: Optional[str] = None

    # Hierarchy
    parent_id: Optional[str] = None
    level: int = Field(default=1, description="Hierarchy level (1=top)")

    # Configuration
    typical_team_size: Optional[int] = None
    budget_range: Optional[str] = None

    # Status
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Department(BaseModel):
    """Department within a business function."""
    id: str
    tenant_id: str
    function_id: str
    code: str
    name: str
    description: Optional[str] = None

    # Hierarchy
    parent_id: Optional[str] = None
    level: int = Field(default=1)

    # Configuration
    headcount: Optional[int] = None

    # Status
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Role(BaseModel):
    """Role within a department."""
    id: str
    tenant_id: str
    department_id: str
    code: str
    name: str
    description: Optional[str] = None

    # Classification
    seniority_level: str = Field(default="mid", description="entry, mid, senior, director, executive")
    role_type: str = Field(default="individual", description="individual, manager, executive")

    # Requirements
    typical_experience_years: Optional[int] = None
    required_skills: List[str] = Field(default_factory=list)
    required_certifications: List[str] = Field(default_factory=list)

    # Status
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Team(BaseModel):
    """Team structure."""
    id: str
    tenant_id: str
    department_id: str
    name: str
    description: Optional[str] = None

    # Structure
    team_lead_role_id: Optional[str] = None
    member_count: int = Field(default=0)

    # Status
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Geography(BaseModel):
    """Geographic structure."""
    id: str
    tenant_id: str
    code: str = Field(..., description="ISO code or region identifier")
    name: str
    description: Optional[str] = None

    # Hierarchy
    parent_id: Optional[str] = None
    level: str = Field(default="country", description="global, region, country, sub-region")

    # Configuration
    timezone: Optional[str] = None
    currency_code: Optional[str] = None
    language_codes: List[str] = Field(default_factory=list)

    # Status
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrganizationContext(BaseModel):
    """Resolved organization context."""
    function: Optional[BusinessFunction] = None
    department: Optional[Department] = None
    role: Optional[Role] = None
    team: Optional[Team] = None
    geography: Optional[Geography] = None

    # Derived
    function_hierarchy: List[BusinessFunction] = Field(default_factory=list)
    peer_roles: List[Role] = Field(default_factory=list)

    # Confidence
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)
