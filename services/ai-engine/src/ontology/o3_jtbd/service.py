"""
L3 JTBD Service - Jobs-to-be-Done Operations

Service for managing JTBD definitions, pain points, desired outcomes,
and ODI scoring.
"""

from typing import Optional, List, Dict, Any
from ..base import OntologyLayerService
from .models import (
    JTBD,
    PainPoint,
    DesiredOutcome,
    SuccessCriteria,
    JTBDContext,
)


class L3JTBDService(OntologyLayerService[JTBD]):
    """
    Service for L3 JTBD (Jobs-to-be-Done) layer.

    Provides operations for:
    - JTBD definitions and lookups
    - Pain point management
    - Desired outcome tracking
    - ODI opportunity scoring
    - Job-to-runner mapping
    """

    @property
    def layer_name(self) -> str:
        return "l3_jtbd"

    @property
    def primary_table(self) -> str:
        return "jtbds"

    def _to_model(self, data: Dict[str, Any]) -> JTBD:
        return JTBD(**data)

    # -------------------------------------------------------------------------
    # JTBD Operations
    # -------------------------------------------------------------------------

    async def get_jtbds(
        self,
        function_id: Optional[str] = None,
        role_id: Optional[str] = None,
        limit: int = 100
    ) -> List[JTBD]:
        """Get JTBDs, optionally filtered by function or role."""
        try:
            query = self.supabase.table(self.primary_table)\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("is_active", True)\
                .limit(limit)

            result = await query.execute()
            jtbds = [self._to_model(row) for row in result.data]

            # Filter by function or role (using denormalized IDs)
            if function_id:
                jtbds = [j for j in jtbds if function_id in j.function_ids]
            if role_id:
                jtbds = [j for j in jtbds if role_id in j.role_ids]

            return jtbds
        except Exception as e:
            print(f"Error fetching JTBDs: {e}")
            return []

    async def find_relevant_jtbds(
        self,
        query: str,
        role_id: Optional[str] = None,
        function_id: Optional[str] = None,
        department_id: Optional[str] = None,
        limit: int = 10
    ) -> List[JTBD]:
        """
        Find JTBDs relevant to a query and organizational context.

        Uses text matching and organizational filtering to find
        the most relevant jobs for the user's request.
        """
        try:
            # Get all JTBDs for context
            all_jtbds = await self.get_jtbds(
                function_id=function_id,
                role_id=role_id,
                limit=200
            )

            if not all_jtbds:
                return []

            query_lower = query.lower()
            scored_jtbds = []

            for jtbd in all_jtbds:
                score = 0

                # Job statement match
                if any(word in query_lower for word in jtbd.job_statement.lower().split()):
                    score += 5

                # Name match
                if jtbd.name.lower() in query_lower:
                    score += 10
                elif any(word in query_lower for word in jtbd.name.lower().split()):
                    score += 4

                # Desired outcome match
                if any(word in query_lower for word in jtbd.desired_outcome.lower().split()):
                    score += 3

                # Situation match
                if any(word in query_lower for word in jtbd.when_situation.lower().split()):
                    score += 2

                # Boost by opportunity score (prioritize underserved jobs)
                score += jtbd.opportunity_score / 10

                if score > 0:
                    scored_jtbds.append((score, jtbd))

            # Sort by score and return top N
            scored_jtbds.sort(key=lambda x: x[0], reverse=True)
            return [j for _, j in scored_jtbds[:limit]]

        except Exception as e:
            print(f"Error finding relevant JTBDs: {e}")
            return []

    # -------------------------------------------------------------------------
    # Pain Point Operations
    # -------------------------------------------------------------------------

    async def get_pain_points(self, jtbd_id: str) -> List[PainPoint]:
        """Get pain points for a JTBD."""
        try:
            result = await self.supabase.table("jtbd_pain_points")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("jtbd_id", jtbd_id)\
                .eq("is_active", True)\
                .execute()

            return [PainPoint(**row) for row in result.data]
        except Exception as e:
            print(f"Error fetching pain points: {e}")
            return []

    # -------------------------------------------------------------------------
    # Desired Outcome Operations
    # -------------------------------------------------------------------------

    async def get_desired_outcomes(self, jtbd_id: str) -> List[DesiredOutcome]:
        """Get desired outcomes for a JTBD."""
        try:
            result = await self.supabase.table("jtbd_desired_outcomes")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("jtbd_id", jtbd_id)\
                .eq("is_active", True)\
                .execute()

            return [DesiredOutcome(**row) for row in result.data]
        except Exception as e:
            print(f"Error fetching desired outcomes: {e}")
            return []

    # -------------------------------------------------------------------------
    # Success Criteria Operations
    # -------------------------------------------------------------------------

    async def get_success_criteria(self, jtbd_id: str) -> List[SuccessCriteria]:
        """Get success criteria for a JTBD."""
        try:
            result = await self.supabase.table("jtbd_success_criteria")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("jtbd_id", jtbd_id)\
                .eq("is_active", True)\
                .execute()

            return [SuccessCriteria(**row) for row in result.data]
        except Exception as e:
            print(f"Error fetching success criteria: {e}")
            return []

    # -------------------------------------------------------------------------
    # ODI Scoring
    # -------------------------------------------------------------------------

    async def calculate_opportunity_scores(
        self,
        jtbd_ids: List[str]
    ) -> Dict[str, float]:
        """Calculate opportunity scores for multiple JTBDs."""
        scores = {}
        jtbds = await self.get_by_ids(jtbd_ids)

        for jtbd in jtbds:
            scores[jtbd.id] = jtbd.opportunity_score

        return scores

    async def get_top_opportunities(
        self,
        function_id: Optional[str] = None,
        limit: int = 10
    ) -> List[JTBD]:
        """Get JTBDs with highest opportunity scores."""
        jtbds = await self.get_jtbds(function_id=function_id, limit=100)

        # Sort by opportunity score
        sorted_jtbds = sorted(jtbds, key=lambda j: j.opportunity_score, reverse=True)
        return sorted_jtbds[:limit]

    # -------------------------------------------------------------------------
    # Context Resolution
    # -------------------------------------------------------------------------

    async def resolve_jtbd_context(
        self,
        query: str,
        role_id: Optional[str] = None,
        function_id: Optional[str] = None
    ) -> JTBDContext:
        """
        Resolve full JTBD context for a query.

        Args:
            query: User query
            role_id: Optional role filter
            function_id: Optional function filter

        Returns:
            JTBDContext with relevant JTBDs, pain points, and outcomes
        """
        context = JTBDContext()

        # Find relevant JTBDs
        jtbds = await self.find_relevant_jtbds(
            query=query,
            role_id=role_id,
            function_id=function_id,
            limit=5
        )
        context.relevant_jtbds = [j.model_dump() for j in jtbds]

        # Get pain points and outcomes for top JTBD
        if jtbds:
            top_jtbd = jtbds[0]

            pain_points = await self.get_pain_points(top_jtbd.id)
            context.pain_points = [p.model_dump() for p in pain_points]

            outcomes = await self.get_desired_outcomes(top_jtbd.id)
            context.desired_outcomes = [o.model_dump() for o in outcomes]

            criteria = await self.get_success_criteria(top_jtbd.id)
            context.success_criteria = [c.model_dump() for c in criteria]

            # Set top opportunity
            context.top_opportunity_jtbd_id = top_jtbd.id
            context.max_opportunity_score = top_jtbd.opportunity_score

            # Recommend runner family
            if top_jtbd.runner_family:
                context.recommended_runner_family = top_jtbd.runner_family

        # Calculate aggregated scores
        if jtbds:
            context.avg_importance = sum(j.importance_score for j in jtbds) / len(jtbds)
            context.avg_satisfaction = sum(j.satisfaction_score for j in jtbds) / len(jtbds)

        # Calculate confidence
        confidence = 0.0
        if context.relevant_jtbds:
            confidence += 0.4
        if context.pain_points:
            confidence += 0.2
        if context.desired_outcomes:
            confidence += 0.2
        if context.success_criteria:
            confidence += 0.2
        context.confidence_score = confidence

        return context
