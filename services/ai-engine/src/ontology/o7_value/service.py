"""
L7 Value Transformation Service

Service for managing VPANES scoring, ROI analysis,
value realization tracking, and business value metrics.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from ..base import OntologyLayerService
from .models import (
    VPANESScore,
    ROIEstimate,
    ValueRealization,
    ValueContext,
    ValueCategory,
    ValueDriverType,
    AIInterventionType,
)


class L7ValueService(OntologyLayerService[VPANESScore]):
    """
    Service for L7 Value Transformation layer.

    Provides operations for:
    - VPANES opportunity scoring
    - ROI estimation and tracking
    - Value realization measurement
    - Business value aggregation
    """

    @property
    def layer_name(self) -> str:
        return "l7_value"

    @property
    def primary_table(self) -> str:
        return "vpanes_scores"

    def _to_model(self, data: Dict[str, Any]) -> VPANESScore:
        return VPANESScore(**data)

    # -------------------------------------------------------------------------
    # VPANES Scoring
    # -------------------------------------------------------------------------

    async def get_vpanes_score(
        self,
        jtbd_id: str
    ) -> Optional[VPANESScore]:
        """Get VPANES score for a JTBD."""
        try:
            result = await self.supabase.table(self.primary_table)\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("jtbd_id", jtbd_id)\
                .order("created_at", desc=True)\
                .limit(1)\
                .maybe_single()\
                .execute()

            if result.data:
                return self._to_model(result.data)
        except Exception as e:
            print(f"Error fetching VPANES score: {e}")
        return None

    async def create_vpanes_score(
        self,
        jtbd_id: str,
        value_score: float,
        pain_score: float,
        adoption_score: float,
        network_score: float,
        ease_score: float,
        strategic_score: float,
        value_rationale: Optional[str] = None,
        value_category: Optional[ValueCategory] = None,
        intervention_type: AIInterventionType = AIInterventionType.AUGMENTATION,
        ai_suitability_score: float = 5.0,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[VPANESScore]:
        """Create or update VPANES score for a JTBD."""
        try:
            score_data = {
                "tenant_id": self.tenant_id,
                "jtbd_id": jtbd_id,
                "value_score": value_score,
                "value_rationale": value_rationale,
                "value_category": value_category.value if value_category else None,
                "pain_score": pain_score,
                "adoption_score": adoption_score,
                "network_score": network_score,
                "ease_score": ease_score,
                "strategic_score": strategic_score,
                "intervention_type": intervention_type.value,
                "ai_suitability_score": ai_suitability_score,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }

            result = await self.supabase.table(self.primary_table)\
                .upsert(score_data, on_conflict="tenant_id,jtbd_id")\
                .execute()

            if result.data:
                return self._to_model(result.data[0])
        except Exception as e:
            print(f"Error creating VPANES score: {e}")
        return None

    async def get_top_opportunities(
        self,
        limit: int = 10,
        min_score: float = 0.0,
        value_category: Optional[ValueCategory] = None
    ) -> List[VPANESScore]:
        """Get top VPANES opportunities."""
        try:
            query = self.supabase.table(self.primary_table)\
                .select("*")\
                .eq("tenant_id", self.tenant_id)

            if value_category:
                query = query.eq("value_category", value_category.value)

            result = await query.execute()

            # Filter and sort by total score
            scores = [self._to_model(row) for row in result.data]
            scores = [s for s in scores if s.total_score >= min_score]
            scores.sort(key=lambda s: s.total_score, reverse=True)

            return scores[:limit]
        except Exception as e:
            print(f"Error fetching top opportunities: {e}")
            return []

    async def get_opportunities_by_category(
        self,
        value_category: ValueCategory,
        limit: int = 20
    ) -> List[VPANESScore]:
        """Get opportunities filtered by value category."""
        try:
            result = await self.supabase.table(self.primary_table)\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("value_category", value_category.value)\
                .limit(limit)\
                .execute()

            scores = [self._to_model(row) for row in result.data]
            scores.sort(key=lambda s: s.total_score, reverse=True)
            return scores
        except Exception as e:
            print(f"Error fetching opportunities by category: {e}")
            return []

    # -------------------------------------------------------------------------
    # ROI Estimation
    # -------------------------------------------------------------------------

    async def get_roi_estimate(
        self,
        jtbd_id: Optional[str] = None,
        workflow_id: Optional[str] = None
    ) -> Optional[ROIEstimate]:
        """Get ROI estimate for a JTBD or workflow."""
        try:
            query = self.supabase.table("roi_estimates")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)

            if jtbd_id:
                query = query.eq("jtbd_id", jtbd_id)
            elif workflow_id:
                query = query.eq("workflow_id", workflow_id)
            else:
                return None

            result = await query.order("created_at", desc=True)\
                .limit(1)\
                .maybe_single()\
                .execute()

            if result.data:
                return ROIEstimate(**result.data)
        except Exception as e:
            print(f"Error fetching ROI estimate: {e}")
        return None

    async def create_roi_estimate(
        self,
        time_saved_hours_per_week: float,
        hourly_rate: float = 150.0,
        implementation_cost: float = 0.0,
        annual_operating_cost: float = 0.0,
        training_cost: float = 0.0,
        other_cost_savings: float = 0.0,
        error_reduction_percent: float = 0.0,
        quality_improvement_percent: float = 0.0,
        compliance_improvement_percent: float = 0.0,
        jtbd_id: Optional[str] = None,
        workflow_id: Optional[str] = None,
        assumptions: Optional[List[str]] = None,
        confidence_level: str = "medium"
    ) -> Optional[ROIEstimate]:
        """Create ROI estimate with calculated metrics."""
        try:
            # Calculate derived metrics
            time_saved_annual_hours = time_saved_hours_per_week * 52
            fte_equivalent = time_saved_annual_hours / 2080
            annual_labor_savings = time_saved_annual_hours * hourly_rate
            total_annual_savings = annual_labor_savings + other_cost_savings
            total_investment = implementation_cost + training_cost
            net_annual_benefit = total_annual_savings - annual_operating_cost

            roi_percent = 0.0
            payback_months = 0.0
            if total_investment > 0:
                roi_percent = ((net_annual_benefit - total_investment) / total_investment) * 100
                monthly_benefit = net_annual_benefit / 12
                if monthly_benefit > 0:
                    payback_months = total_investment / monthly_benefit

            # NPV calculation (simplified, 10% discount rate)
            discount_rate = 0.10
            npv_3_year = sum(
                net_annual_benefit / ((1 + discount_rate) ** year)
                for year in range(1, 4)
            ) - total_investment

            roi_data = {
                "tenant_id": self.tenant_id,
                "jtbd_id": jtbd_id,
                "workflow_id": workflow_id,
                "time_saved_hours_per_week": time_saved_hours_per_week,
                "time_saved_annual_hours": time_saved_annual_hours,
                "fte_equivalent": fte_equivalent,
                "hourly_rate": hourly_rate,
                "annual_labor_savings": annual_labor_savings,
                "other_cost_savings": other_cost_savings,
                "total_annual_savings": total_annual_savings,
                "error_reduction_percent": error_reduction_percent,
                "quality_improvement_percent": quality_improvement_percent,
                "compliance_improvement_percent": compliance_improvement_percent,
                "implementation_cost": implementation_cost,
                "annual_operating_cost": annual_operating_cost,
                "training_cost": training_cost,
                "total_investment": total_investment,
                "net_annual_benefit": net_annual_benefit,
                "roi_percent": roi_percent,
                "payback_months": payback_months,
                "npv_3_year": npv_3_year,
                "confidence_level": confidence_level,
                "assumptions": assumptions or [],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }

            result = await self.supabase.table("roi_estimates")\
                .insert(roi_data)\
                .execute()

            if result.data:
                return ROIEstimate(**result.data[0])
        except Exception as e:
            print(f"Error creating ROI estimate: {e}")
        return None

    async def get_total_roi_summary(self) -> Dict[str, Any]:
        """Get aggregated ROI summary for all estimates."""
        try:
            result = await self.supabase.table("roi_estimates")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .execute()

            estimates = [ROIEstimate(**row) for row in result.data]

            if not estimates:
                return {
                    "total_estimates": 0,
                    "total_annual_savings": 0,
                    "total_investment": 0,
                    "avg_roi_percent": 0,
                    "avg_payback_months": 0,
                    "total_fte_equivalent": 0
                }

            return {
                "total_estimates": len(estimates),
                "total_annual_savings": sum(e.total_annual_savings for e in estimates),
                "total_investment": sum(e.total_investment for e in estimates),
                "avg_roi_percent": sum(e.roi_percent for e in estimates) / len(estimates),
                "avg_payback_months": sum(e.payback_months for e in estimates) / len(estimates),
                "total_fte_equivalent": sum(e.fte_equivalent for e in estimates),
                "total_npv_3_year": sum(e.npv_3_year for e in estimates)
            }
        except Exception as e:
            print(f"Error getting ROI summary: {e}")
            return {}

    # -------------------------------------------------------------------------
    # Value Realization
    # -------------------------------------------------------------------------

    async def record_value_realization(
        self,
        jtbd_id: str,
        mission_id: Optional[str] = None,
        estimated_time_saved_minutes: float = 0.0,
        actual_time_saved_minutes: float = 0.0,
        estimated_quality_improvement: float = 0.0,
        actual_quality_improvement: float = 0.0,
        user_satisfaction: float = 0.0,
        would_recommend: bool = False,
        user_feedback: Optional[str] = None,
        value_categories: Optional[List[ValueCategory]] = None
    ) -> Optional[ValueRealization]:
        """Record actual value realized from an AI interaction."""
        try:
            # Calculate variances
            time_variance = 0.0
            if estimated_time_saved_minutes > 0:
                time_variance = ((actual_time_saved_minutes - estimated_time_saved_minutes) / estimated_time_saved_minutes) * 100

            quality_variance = 0.0
            if estimated_quality_improvement > 0:
                quality_variance = ((actual_quality_improvement - estimated_quality_improvement) / estimated_quality_improvement) * 100

            # Calculate value score (composite)
            value_score = (
                (user_satisfaction / 10) * 0.4 +
                min(actual_time_saved_minutes / 30, 1.0) * 0.3 +  # Normalize to 30 min max
                actual_quality_improvement * 0.2 +
                (1.0 if would_recommend else 0.0) * 0.1
            ) * 10  # Scale to 0-10

            realization_data = {
                "tenant_id": self.tenant_id,
                "jtbd_id": jtbd_id,
                "mission_id": mission_id,
                "estimated_time_saved_minutes": estimated_time_saved_minutes,
                "actual_time_saved_minutes": actual_time_saved_minutes,
                "time_variance_percent": time_variance,
                "estimated_quality_improvement": estimated_quality_improvement,
                "actual_quality_improvement": actual_quality_improvement,
                "quality_variance_percent": quality_variance,
                "user_satisfaction": user_satisfaction,
                "would_recommend": would_recommend,
                "user_feedback": user_feedback,
                "value_score": value_score,
                "value_categories": [v.value for v in (value_categories or [])],
                "created_at": datetime.utcnow().isoformat(),
                "measured_at": datetime.utcnow().isoformat()
            }

            result = await self.supabase.table("value_realizations")\
                .insert(realization_data)\
                .execute()

            if result.data:
                return ValueRealization(**result.data[0])
        except Exception as e:
            print(f"Error recording value realization: {e}")
        return None

    async def get_value_realizations(
        self,
        jtbd_id: Optional[str] = None,
        days: int = 30,
        limit: int = 100
    ) -> List[ValueRealization]:
        """Get value realization records."""
        try:
            since = (datetime.utcnow() - timedelta(days=days)).isoformat()

            query = self.supabase.table("value_realizations")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .gte("created_at", since)\
                .order("created_at", desc=True)\
                .limit(limit)

            if jtbd_id:
                query = query.eq("jtbd_id", jtbd_id)

            result = await query.execute()
            return [ValueRealization(**row) for row in result.data]
        except Exception as e:
            print(f"Error fetching value realizations: {e}")
            return []

    async def get_value_summary(
        self,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get aggregated value summary."""
        try:
            realizations = await self.get_value_realizations(days=days, limit=1000)

            if not realizations:
                return {
                    "period_days": days,
                    "total_realizations": 0,
                    "total_time_saved_minutes": 0,
                    "avg_satisfaction": 0,
                    "avg_value_score": 0,
                    "recommendation_rate": 0
                }

            total_time = sum(r.actual_time_saved_minutes for r in realizations)
            avg_satisfaction = sum(r.user_satisfaction for r in realizations) / len(realizations)
            avg_value = sum(r.value_score for r in realizations) / len(realizations)
            recommend_count = sum(1 for r in realizations if r.would_recommend)

            # Value by category
            category_counts: Dict[str, int] = {}
            for r in realizations:
                for cat in r.value_categories:
                    cat_name = cat.value if isinstance(cat, ValueCategory) else cat
                    category_counts[cat_name] = category_counts.get(cat_name, 0) + 1

            return {
                "period_days": days,
                "total_realizations": len(realizations),
                "total_time_saved_minutes": total_time,
                "total_time_saved_hours": total_time / 60,
                "avg_satisfaction": avg_satisfaction,
                "avg_value_score": avg_value,
                "recommendation_rate": recommend_count / len(realizations),
                "value_by_category": category_counts
            }
        except Exception as e:
            print(f"Error getting value summary: {e}")
            return {}

    # -------------------------------------------------------------------------
    # Context Resolution
    # -------------------------------------------------------------------------

    async def resolve_value(
        self,
        jtbd_ids: Optional[List[str]] = None
    ) -> ValueContext:
        """
        Resolve value context for JTBDs.

        Args:
            jtbd_ids: Optional list of JTBD IDs to get value for

        Returns:
            ValueContext with scores, ROI, and realizations
        """
        context = ValueContext()

        # Get VPANES scores
        if jtbd_ids:
            for jtbd_id in jtbd_ids:
                score = await self.get_vpanes_score(jtbd_id)
                if score:
                    context.vpanes_scores.append(score)

                roi = await self.get_roi_estimate(jtbd_id=jtbd_id)
                if roi:
                    context.roi_estimates.append(roi)
        else:
            # Get top opportunities
            context.vpanes_scores = await self.get_top_opportunities(limit=10)

        # Get recent value realizations
        context.value_realizations = await self.get_value_realizations(days=30, limit=50)

        # Calculate aggregated metrics
        if context.vpanes_scores:
            context.avg_vpanes_score = sum(s.normalized_score for s in context.vpanes_scores) / len(context.vpanes_scores)
            context.top_opportunity_jtbd_ids = [s.jtbd_id for s in context.vpanes_scores[:5]]

        if context.roi_estimates:
            context.total_estimated_savings = sum(r.total_annual_savings for r in context.roi_estimates)

        if context.value_realizations:
            context.total_realized_value = sum(r.value_score for r in context.value_realizations)

            # Value by category
            for r in context.value_realizations:
                for cat in r.value_categories:
                    cat_name = cat.value if isinstance(cat, ValueCategory) else cat
                    context.value_by_category[cat_name] = context.value_by_category.get(cat_name, 0) + r.value_score

        # Calculate confidence
        confidence = 0.0
        if context.vpanes_scores:
            confidence += 0.3
        if context.roi_estimates:
            confidence += 0.3
        if context.value_realizations:
            confidence += 0.4
        context.confidence_score = confidence

        return context

    # -------------------------------------------------------------------------
    # Business Value Metrics
    # -------------------------------------------------------------------------

    async def get_business_value_dashboard(self) -> Dict[str, Any]:
        """Get comprehensive business value dashboard data."""
        try:
            # VPANES opportunities
            top_opportunities = await self.get_top_opportunities(limit=10)

            # ROI summary
            roi_summary = await self.get_total_roi_summary()

            # Value realization summary
            value_summary = await self.get_value_summary(days=30)

            # By category breakdown
            category_breakdown = {}
            for category in ValueCategory:
                scores = await self.get_opportunities_by_category(category, limit=5)
                if scores:
                    category_breakdown[category.value] = {
                        "count": len(scores),
                        "avg_score": sum(s.normalized_score for s in scores) / len(scores),
                        "top_jtbd_ids": [s.jtbd_id for s in scores[:3]]
                    }

            return {
                "top_opportunities": [
                    {
                        "jtbd_id": s.jtbd_id,
                        "total_score": s.total_score,
                        "normalized_score": s.normalized_score,
                        "priority": s.priority_classification,
                        "value_category": s.value_category.value if s.value_category else None
                    }
                    for s in top_opportunities
                ],
                "roi_summary": roi_summary,
                "value_summary": value_summary,
                "by_category": category_breakdown,
                "generated_at": datetime.utcnow().isoformat()
            }
        except Exception as e:
            print(f"Error getting business value dashboard: {e}")
            return {}
