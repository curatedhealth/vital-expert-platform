"""
L0 Domain Knowledge Models

Data structures for domain knowledge layer including therapeutic areas,
evidence types, diseases, products, and regulatory jurisdictions.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime


class EvidenceLevel(str, Enum):
    """Evidence hierarchy levels (Oxford Centre for Evidence-Based Medicine)."""
    LEVEL_1A = "1a"  # Systematic reviews of RCTs
    LEVEL_1B = "1b"  # Individual RCTs
    LEVEL_2A = "2a"  # Systematic reviews of cohort studies
    LEVEL_2B = "2b"  # Individual cohort studies
    LEVEL_3A = "3a"  # Systematic reviews of case-control studies
    LEVEL_3B = "3b"  # Individual case-control studies
    LEVEL_4 = "4"    # Case series
    LEVEL_5 = "5"    # Expert opinion


class TherapeuticArea(BaseModel):
    """Therapeutic area classification."""
    id: str
    tenant_id: str
    code: str = Field(..., description="Unique code (e.g., 'ONCOLOGY')")
    name: str = Field(..., description="Display name")
    description: Optional[str] = None
    parent_id: Optional[str] = Field(None, description="Parent therapeutic area for hierarchy")

    # RAG Configuration
    rag_namespace: Optional[str] = Field(None, description="Pinecone namespace for this TA")
    neo4j_label: Optional[str] = Field(None, description="Neo4j node label")

    # Metadata
    icd10_codes: List[str] = Field(default_factory=list)
    mesh_terms: List[str] = Field(default_factory=list)

    # Status
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EvidenceType(BaseModel):
    """Evidence type classification."""
    id: str
    tenant_id: str
    code: str = Field(..., description="Unique code (e.g., 'RCT', 'META_ANALYSIS')")
    name: str
    description: Optional[str] = None

    # Evidence classification
    level: EvidenceLevel = Field(default=EvidenceLevel.LEVEL_5)
    category: str = Field(default="primary", description="primary, secondary, tertiary")

    # Source configuration
    typical_sources: List[str] = Field(default_factory=list, description="PubMed, Cochrane, etc.")
    quality_indicators: List[str] = Field(default_factory=list)

    # Status
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Disease(BaseModel):
    """Disease/condition classification."""
    id: str
    tenant_id: str
    code: str = Field(..., description="Unique code")
    name: str
    description: Optional[str] = None

    # Classification
    therapeutic_area_id: Optional[str] = None
    icd10_code: Optional[str] = None
    snomed_code: Optional[str] = None
    mesh_term: Optional[str] = None

    # Hierarchy
    parent_id: Optional[str] = None

    # Prevalence data
    prevalence_global: Optional[float] = None
    prevalence_us: Optional[float] = None

    # Status
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Product(BaseModel):
    """Pharmaceutical product classification."""
    id: str
    tenant_id: str
    code: str
    name: str
    generic_name: Optional[str] = None
    brand_name: Optional[str] = None
    description: Optional[str] = None

    # Classification
    therapeutic_area_id: Optional[str] = None
    product_type: str = Field(default="drug", description="drug, biologic, device, diagnostic")

    # Regulatory
    ndc_code: Optional[str] = None
    ema_number: Optional[str] = None
    approval_status: Optional[str] = None

    # Status
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StakeholderType(BaseModel):
    """Stakeholder type classification."""
    id: str
    tenant_id: str
    code: str = Field(..., description="Unique code (e.g., 'HCP', 'PAYER', 'PATIENT')")
    name: str
    description: Optional[str] = None

    # Classification
    category: str = Field(default="external", description="internal, external")
    influence_level: str = Field(default="medium", description="low, medium, high")

    # Communication preferences
    preferred_channels: List[str] = Field(default_factory=list)
    key_concerns: List[str] = Field(default_factory=list)

    # Status
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Jurisdiction(BaseModel):
    """Regulatory jurisdiction classification."""
    id: str
    tenant_id: str
    code: str = Field(..., description="ISO country code or region (e.g., 'US', 'EU', 'JP')")
    name: str
    description: Optional[str] = None

    # Regulatory bodies
    regulatory_authority: str = Field(..., description="FDA, EMA, PMDA, etc.")
    regulatory_authority_full: Optional[str] = None

    # Requirements
    language_requirements: List[str] = Field(default_factory=list)
    submission_formats: List[str] = Field(default_factory=list)
    typical_review_days: Optional[int] = None

    # Hierarchy
    parent_id: Optional[str] = Field(None, description="Parent region (e.g., EU for Germany)")

    # Status
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DomainContext(BaseModel):
    """Resolved domain context for a query."""
    therapeutic_area: Optional[TherapeuticArea] = None
    evidence_types: List[EvidenceType] = Field(default_factory=list)
    diseases: List[Disease] = Field(default_factory=list)
    products: List[Product] = Field(default_factory=list)
    stakeholders: List[StakeholderType] = Field(default_factory=list)
    jurisdiction: Optional[Jurisdiction] = None

    # RAG configuration
    rag_namespaces: List[str] = Field(default_factory=list)
    neo4j_labels: List[str] = Field(default_factory=list)

    # Confidence
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)

    def to_rag_config(self) -> Dict[str, Any]:
        """Convert to RAG configuration dictionary."""
        return {
            "namespaces": self.rag_namespaces,
            "neo4j_labels": self.neo4j_labels,
            "therapeutic_area": self.therapeutic_area.code if self.therapeutic_area else None,
            "jurisdiction": self.jurisdiction.code if self.jurisdiction else None,
        }
