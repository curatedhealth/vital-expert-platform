"""
L0 Domain Knowledge Service

Service for managing domain knowledge layer operations including
therapeutic area resolution, evidence type lookup, and RAG configuration.
"""

from typing import Optional, List, Dict, Any
from ..base import OntologyLayerService
from .models import (
    TherapeuticArea,
    EvidenceType,
    Disease,
    Product,
    StakeholderType,
    Jurisdiction,
    DomainContext,
)


class L0DomainService(OntologyLayerService[TherapeuticArea]):
    """
    Service for L0 Domain Knowledge layer.

    Provides operations for:
    - Therapeutic area classification and lookup
    - Evidence type management
    - Disease and product catalogs
    - RAG namespace configuration
    - Regulatory jurisdiction context
    """

    @property
    def layer_name(self) -> str:
        return "l0_domain"

    @property
    def primary_table(self) -> str:
        return "l0_therapeutic_areas"

    def _to_model(self, data: Dict[str, Any]) -> TherapeuticArea:
        return TherapeuticArea(**data)

    # -------------------------------------------------------------------------
    # Therapeutic Area Operations
    # -------------------------------------------------------------------------

    async def get_therapeutic_areas(
        self,
        include_inactive: bool = False
    ) -> List[TherapeuticArea]:
        """
        Get all therapeutic areas for the tenant.

        Args:
            include_inactive: Whether to include inactive areas

        Returns:
            List of therapeutic areas
        """
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
            print(f"Error fetching therapeutic areas: {e}")
            return []

    async def get_therapeutic_area_by_code(
        self,
        code: str
    ) -> Optional[TherapeuticArea]:
        """Get therapeutic area by code."""
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
            print(f"Error fetching therapeutic area by code: {e}")
        return None

    async def classify_therapeutic_area(
        self,
        query: str
    ) -> Optional[TherapeuticArea]:
        """
        Classify a query into a therapeutic area using text matching.

        This is a simple implementation that can be enhanced with ML classification.

        Args:
            query: User query to classify

        Returns:
            Best matching therapeutic area or None
        """
        # Get all therapeutic areas
        areas = await self.get_therapeutic_areas()

        if not areas:
            return None

        query_lower = query.lower()

        # Simple keyword matching (can be enhanced with embeddings)
        best_match = None
        best_score = 0

        for area in areas:
            score = 0
            area_name_lower = area.name.lower()
            area_code_lower = area.code.lower()

            # Check name match
            if area_name_lower in query_lower:
                score += 10
            elif any(word in query_lower for word in area_name_lower.split()):
                score += 5

            # Check code match
            if area_code_lower in query_lower:
                score += 8

            # Check MeSH terms
            for term in area.mesh_terms:
                if term.lower() in query_lower:
                    score += 7

            if score > best_score:
                best_score = score
                best_match = area

        return best_match if best_score > 0 else None

    # -------------------------------------------------------------------------
    # Evidence Type Operations
    # -------------------------------------------------------------------------

    async def get_evidence_types(self) -> List[EvidenceType]:
        """Get all evidence types for the tenant."""
        try:
            result = await self.supabase.table("l0_evidence_types")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("is_active", True)\
                .order("level")\
                .execute()

            return [EvidenceType(**row) for row in result.data]
        except Exception as e:
            print(f"Error fetching evidence types: {e}")
            return []

    async def get_relevant_evidence_types(
        self,
        query: str,
        therapeutic_area_id: Optional[str] = None
    ) -> List[EvidenceType]:
        """
        Get evidence types relevant to a query.

        Args:
            query: User query
            therapeutic_area_id: Optional therapeutic area filter

        Returns:
            List of relevant evidence types
        """
        # Get all evidence types
        all_types = await self.get_evidence_types()

        # Keywords that suggest specific evidence needs
        query_lower = query.lower()

        relevant = []
        for et in all_types:
            # Clinical trial queries need RCT evidence
            if any(kw in query_lower for kw in ["trial", "clinical", "efficacy", "safety"]):
                if et.level.value in ["1a", "1b", "2a", "2b"]:
                    relevant.append(et)

            # Systematic review queries
            elif any(kw in query_lower for kw in ["review", "meta-analysis", "systematic"]):
                if et.level.value in ["1a", "2a", "3a"]:
                    relevant.append(et)

            # Real-world evidence
            elif any(kw in query_lower for kw in ["real-world", "rwe", "observational"]):
                if et.level.value in ["2b", "3b", "4"]:
                    relevant.append(et)

        # If no specific matches, return top-tier evidence types
        if not relevant:
            relevant = [et for et in all_types if et.level.value in ["1a", "1b", "2a"]]

        return relevant[:5]  # Limit to top 5

    # -------------------------------------------------------------------------
    # Jurisdiction Operations
    # -------------------------------------------------------------------------

    async def get_jurisdictions(self) -> List[Jurisdiction]:
        """Get all regulatory jurisdictions."""
        try:
            result = await self.supabase.table("l0_jurisdictions")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("is_active", True)\
                .order("name")\
                .execute()

            return [Jurisdiction(**row) for row in result.data]
        except Exception as e:
            print(f"Error fetching jurisdictions: {e}")
            return []

    async def get_jurisdiction_by_code(
        self,
        code: str
    ) -> Optional[Jurisdiction]:
        """Get jurisdiction by code (e.g., 'US', 'EU')."""
        try:
            result = await self.supabase.table("l0_jurisdictions")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("code", code.upper())\
                .maybe_single()\
                .execute()

            if result.data:
                return Jurisdiction(**result.data)
        except Exception as e:
            print(f"Error fetching jurisdiction: {e}")
        return None

    async def detect_jurisdiction(
        self,
        query: str
    ) -> Optional[Jurisdiction]:
        """
        Detect regulatory jurisdiction from query.

        Args:
            query: User query to analyze

        Returns:
            Detected jurisdiction or None
        """
        query_lower = query.lower()

        # Jurisdiction keywords
        jurisdiction_keywords = {
            "US": ["fda", "united states", "usa", "american", "us market"],
            "EU": ["ema", "european", "europe", "eu market", "ce mark"],
            "JP": ["pmda", "japan", "japanese"],
            "CN": ["nmpa", "china", "chinese"],
            "UK": ["mhra", "united kingdom", "uk", "british"],
        }

        for code, keywords in jurisdiction_keywords.items():
            if any(kw in query_lower for kw in keywords):
                return await self.get_jurisdiction_by_code(code)

        return None

    # -------------------------------------------------------------------------
    # Domain Context Resolution
    # -------------------------------------------------------------------------

    async def resolve_domain(
        self,
        query: str,
        therapeutic_area_id: Optional[str] = None,
        jurisdiction_code: Optional[str] = None
    ) -> DomainContext:
        """
        Resolve full domain context for a query.

        This is the main entry point for L0 layer resolution.

        Args:
            query: User query
            therapeutic_area_id: Optional explicit therapeutic area
            jurisdiction_code: Optional explicit jurisdiction

        Returns:
            DomainContext with all relevant domain information
        """
        context = DomainContext()

        # Resolve therapeutic area
        if therapeutic_area_id:
            context.therapeutic_area = await self.get_by_id(therapeutic_area_id)
        else:
            context.therapeutic_area = await self.classify_therapeutic_area(query)

        # Resolve evidence types
        context.evidence_types = await self.get_relevant_evidence_types(
            query,
            context.therapeutic_area.id if context.therapeutic_area else None
        )

        # Resolve jurisdiction
        if jurisdiction_code:
            context.jurisdiction = await self.get_jurisdiction_by_code(jurisdiction_code)
        else:
            context.jurisdiction = await self.detect_jurisdiction(query)

        # Build RAG namespaces
        if context.therapeutic_area:
            if context.therapeutic_area.rag_namespace:
                context.rag_namespaces.append(context.therapeutic_area.rag_namespace)
            if context.therapeutic_area.neo4j_label:
                context.neo4j_labels.append(context.therapeutic_area.neo4j_label)

        # Add jurisdiction-specific namespace
        if context.jurisdiction:
            context.rag_namespaces.append(f"regulatory_{context.jurisdiction.code.lower()}")

        # Calculate confidence
        confidence = 0.0
        if context.therapeutic_area:
            confidence += 0.4
        if context.evidence_types:
            confidence += 0.3
        if context.jurisdiction:
            confidence += 0.3
        context.confidence_score = min(confidence, 1.0)

        return context

    # -------------------------------------------------------------------------
    # RAG Configuration
    # -------------------------------------------------------------------------

    async def get_rag_namespaces(
        self,
        therapeutic_area_id: Optional[str] = None,
        jurisdiction_code: Optional[str] = None
    ) -> List[str]:
        """
        Get RAG namespaces for given context.

        Args:
            therapeutic_area_id: Optional therapeutic area
            jurisdiction_code: Optional jurisdiction

        Returns:
            List of Pinecone namespace identifiers
        """
        namespaces = []

        # Add therapeutic area namespace
        if therapeutic_area_id:
            ta = await self.get_by_id(therapeutic_area_id)
            if ta and ta.rag_namespace:
                namespaces.append(ta.rag_namespace)

        # Add jurisdiction namespace
        if jurisdiction_code:
            namespaces.append(f"regulatory_{jurisdiction_code.lower()}")

        # Always include general namespace
        namespaces.append("general")

        return list(set(namespaces))  # Deduplicate
