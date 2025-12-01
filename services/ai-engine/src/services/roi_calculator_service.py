"""
ROI Calculator Service
Calculates Return on Investment and Value Impact for VITAL Platform

This service provides:
- ROI calculation based on JTBD value mappings
- Aggregated value metrics by role, function, and tenant
- Impact forecasting and benefit tracking
- Value realization dashboards

Value Framework:
- 6 Value Categories: Smarter, Faster, Better, Efficient, Safer, Scalable
- 13 Value Drivers: 7 Internal + 6 External
- Impact Types: time_savings, cost_reduction, quality_improvement, risk_reduction, revenue_increase
"""

import logging
from typing import Optional, Dict, List, Any
from uuid import UUID
from dataclasses import dataclass
from enum import Enum
from datetime import datetime
import asyncio

from services.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)


class ImpactType(str, Enum):
    """Types of value impact"""
    TIME_SAVINGS = "time_savings"
    COST_REDUCTION = "cost_reduction"
    QUALITY_IMPROVEMENT = "quality_improvement"
    RISK_REDUCTION = "risk_reduction"
    REVENUE_INCREASE = "revenue_increase"


class ValueCategory(str, Enum):
    """Universal value categories"""
    SMARTER = "SMARTER"
    FASTER = "FASTER"
    BETTER = "BETTER"
    EFFICIENT = "EFFICIENT"
    SAFER = "SAFER"
    SCALABLE = "SCALABLE"


@dataclass
class ROICalculation:
    """Result of ROI calculation"""
    entity_id: UUID
    entity_type: str  # 'jtbd', 'role', 'function', 'tenant'
    entity_name: str

    # Value metrics
    total_value_score: float  # 0-100
    primary_category: str
    category_breakdown: Dict[str, float]
    driver_breakdown: Dict[str, float]

    # Impact metrics
    impact_summary: Dict[str, Any]
    estimated_hours_saved_per_month: float
    estimated_cost_savings_per_year: float

    # Confidence
    confidence_level: str  # low, medium, high, validated
    data_completeness: float  # 0-1


@dataclass
class ValueDashboard:
    """Aggregated value dashboard data"""
    tenant_id: UUID
    tenant_name: str

    # Summary metrics
    total_jtbds: int
    jtbds_with_value_mapping: int
    coverage_percentage: float

    # Category distribution
    category_distribution: Dict[str, int]
    primary_category_counts: Dict[str, int]

    # Driver distribution
    driver_distribution: Dict[str, int]
    top_drivers: List[Dict[str, Any]]

    # Function breakdown
    function_value_scores: List[Dict[str, Any]]

    # Impact potential
    total_time_savings_potential: float
    total_cost_savings_potential: float

    # Timestamp
    generated_at: datetime


class ROICalculatorService:
    """
    Service for calculating ROI and value metrics
    """

    def __init__(self):
        self._supabase = None

    @property
    def supabase(self):
        if self._supabase is None:
            self._supabase = get_supabase_client()
        return self._supabase

    async def calculate_jtbd_roi(self, jtbd_id: UUID) -> Optional[ROICalculation]:
        """
        Calculate ROI for a specific JTBD

        Args:
            jtbd_id: UUID of the JTBD

        Returns:
            ROICalculation object or None if JTBD not found
        """
        try:
            # Fetch JTBD
            jtbd_response = self.supabase.table("jtbd").select(
                "id, code, name, complexity, frequency"
            ).eq("id", str(jtbd_id)).single().execute()

            if not jtbd_response.data:
                return None

            jtbd = jtbd_response.data

            # Fetch value category mappings
            cat_response = self.supabase.table("jtbd_value_categories").select(
                "category_name, relevance_score, is_primary"
            ).eq("jtbd_id", str(jtbd_id)).execute()

            categories = cat_response.data or []

            # Fetch value driver mappings
            drv_response = self.supabase.table("jtbd_value_drivers").select(
                "driver_name, impact_strength, confidence_level"
            ).eq("jtbd_id", str(jtbd_id)).execute()

            drivers = drv_response.data or []

            # Calculate category breakdown
            category_breakdown = {cat["category_name"]: float(cat.get("relevance_score", 0))
                                 for cat in categories}

            # Find primary category
            primary_category = next(
                (cat["category_name"] for cat in categories if cat.get("is_primary")),
                "Smarter"  # Default
            )

            # Calculate driver breakdown
            driver_breakdown = {drv["driver_name"]: float(drv.get("impact_strength", 0))
                               for drv in drivers}

            # Calculate total value score (weighted average)
            total_relevance = sum(category_breakdown.values())
            total_impact = sum(driver_breakdown.values())
            total_value_score = (total_relevance * 50 + total_impact * 50) / max(
                len(categories) + len(drivers), 1
            ) * 100

            # Estimate time savings based on complexity and value
            complexity_multiplier = {
                "low": 2, "medium": 5, "high": 10, "very_high": 20
            }.get(jtbd.get("complexity", "medium"), 5)

            hours_saved = (total_value_score / 100) * complexity_multiplier

            # Estimate cost savings (assuming $75/hour avg cost)
            hourly_rate = 75
            cost_savings = hours_saved * 12 * hourly_rate  # Per year

            # Determine confidence level
            data_completeness = (len(categories) + len(drivers)) / 7  # Expecting ~7 mappings
            if data_completeness >= 0.8:
                confidence = "high"
            elif data_completeness >= 0.5:
                confidence = "medium"
            else:
                confidence = "low"

            return ROICalculation(
                entity_id=jtbd_id,
                entity_type="jtbd",
                entity_name=jtbd.get("name", "Unknown"),
                total_value_score=min(total_value_score, 100),
                primary_category=primary_category,
                category_breakdown=category_breakdown,
                driver_breakdown=driver_breakdown,
                impact_summary={
                    "complexity": jtbd.get("complexity"),
                    "frequency": jtbd.get("frequency"),
                    "categories_mapped": len(categories),
                    "drivers_mapped": len(drivers)
                },
                estimated_hours_saved_per_month=round(hours_saved, 1),
                estimated_cost_savings_per_year=round(cost_savings, 2),
                confidence_level=confidence,
                data_completeness=min(data_completeness, 1.0)
            )

        except Exception as e:
            logger.error(f"Error calculating JTBD ROI: {e}")
            return None

    async def calculate_role_roi(self, role_id: UUID) -> Optional[ROICalculation]:
        """
        Calculate aggregated ROI for a role based on its JTBDs

        Args:
            role_id: UUID of the role

        Returns:
            ROICalculation object or None
        """
        try:
            # Fetch role
            role_response = self.supabase.table("org_roles").select(
                "id, name"
            ).eq("id", str(role_id)).single().execute()

            if not role_response.data:
                return None

            role = role_response.data

            # Fetch JTBDs for this role
            jtbd_roles_response = self.supabase.table("jtbd_roles").select(
                "jtbd_id"
            ).eq("role_id", str(role_id)).execute()

            jtbd_ids = [jr["jtbd_id"] for jr in (jtbd_roles_response.data or [])]

            if not jtbd_ids:
                return ROICalculation(
                    entity_id=role_id,
                    entity_type="role",
                    entity_name=role.get("name", "Unknown"),
                    total_value_score=0,
                    primary_category="N/A",
                    category_breakdown={},
                    driver_breakdown={},
                    impact_summary={"jtbds_mapped": 0},
                    estimated_hours_saved_per_month=0,
                    estimated_cost_savings_per_year=0,
                    confidence_level="low",
                    data_completeness=0
                )

            # Aggregate value categories across all JTBDs
            cat_response = self.supabase.table("jtbd_value_categories").select(
                "category_name, relevance_score, is_primary"
            ).in_("jtbd_id", jtbd_ids).execute()

            categories = cat_response.data or []

            # Aggregate value drivers
            drv_response = self.supabase.table("jtbd_value_drivers").select(
                "driver_name, impact_strength, confidence_level"
            ).in_("jtbd_id", jtbd_ids).execute()

            drivers = drv_response.data or []

            # Aggregate category scores
            category_totals = {}
            for cat in categories:
                name = cat["category_name"]
                score = float(cat.get("relevance_score", 0))
                category_totals[name] = category_totals.get(name, 0) + score

            # Average per category
            category_breakdown = {name: score / len(jtbd_ids)
                                 for name, score in category_totals.items()}

            # Find primary category (most frequent)
            primary_counts = {}
            for cat in categories:
                if cat.get("is_primary"):
                    name = cat["category_name"]
                    primary_counts[name] = primary_counts.get(name, 0) + 1

            primary_category = max(primary_counts, key=primary_counts.get) if primary_counts else "Smarter"

            # Aggregate driver scores
            driver_totals = {}
            for drv in drivers:
                name = drv["driver_name"]
                score = float(drv.get("impact_strength", 0))
                driver_totals[name] = driver_totals.get(name, 0) + score

            driver_breakdown = {name: score / len(jtbd_ids)
                               for name, score in driver_totals.items()}

            # Calculate total value score
            total_value_score = (
                sum(category_breakdown.values()) * 25 +
                sum(driver_breakdown.values()) * 25
            ) * len(jtbd_ids) / max(len(categories) + len(drivers), 1)

            # Estimate savings (role level)
            hours_saved = (total_value_score / 10) * len(jtbd_ids)
            cost_savings = hours_saved * 12 * 75

            return ROICalculation(
                entity_id=role_id,
                entity_type="role",
                entity_name=role.get("name", "Unknown"),
                total_value_score=min(total_value_score, 100),
                primary_category=primary_category,
                category_breakdown=category_breakdown,
                driver_breakdown=driver_breakdown,
                impact_summary={
                    "jtbds_mapped": len(jtbd_ids),
                    "categories_mapped": len(set(cat["category_name"] for cat in categories)),
                    "drivers_mapped": len(set(drv["driver_name"] for drv in drivers))
                },
                estimated_hours_saved_per_month=round(hours_saved, 1),
                estimated_cost_savings_per_year=round(cost_savings, 2),
                confidence_level="medium" if len(jtbd_ids) >= 5 else "low",
                data_completeness=min(len(categories) / (len(jtbd_ids) * 3), 1.0)
            )

        except Exception as e:
            logger.error(f"Error calculating role ROI: {e}")
            return None

    async def get_value_dashboard(self, tenant_id: Optional[UUID] = None) -> ValueDashboard:
        """
        Generate value dashboard with aggregated metrics

        Args:
            tenant_id: Optional tenant filter

        Returns:
            ValueDashboard object
        """
        try:
            # Get tenant info
            if tenant_id:
                tenant_response = self.supabase.table("tenants").select(
                    "id, name"
                ).eq("id", str(tenant_id)).single().execute()
                tenant_name = tenant_response.data.get("name", "Unknown") if tenant_response.data else "Unknown"
            else:
                tenant_name = "All Tenants"
                tenant_id = UUID("00000000-0000-0000-0000-000000000000")

            # Count total JTBDs
            jtbd_count_response = self.supabase.table("jtbd").select(
                "id", count="exact"
            ).execute()
            total_jtbds = jtbd_count_response.count or 0

            # Count JTBDs with value mappings
            mapped_response = self.supabase.table("jtbd_value_categories").select(
                "jtbd_id"
            ).execute()
            unique_mapped_jtbds = len(set(m["jtbd_id"] for m in (mapped_response.data or [])))

            coverage = (unique_mapped_jtbds / total_jtbds * 100) if total_jtbds > 0 else 0

            # Category distribution
            cat_response = self.supabase.table("jtbd_value_categories").select(
                "category_name, is_primary"
            ).execute()

            categories = cat_response.data or []
            category_dist = {}
            primary_counts = {}
            for cat in categories:
                name = cat["category_name"]
                category_dist[name] = category_dist.get(name, 0) + 1
                if cat.get("is_primary"):
                    primary_counts[name] = primary_counts.get(name, 0) + 1

            # Driver distribution
            drv_response = self.supabase.table("jtbd_value_drivers").select(
                "driver_name, impact_strength"
            ).execute()

            drivers = drv_response.data or []
            driver_dist = {}
            driver_scores = {}
            for drv in drivers:
                name = drv["driver_name"]
                driver_dist[name] = driver_dist.get(name, 0) + 1
                driver_scores[name] = driver_scores.get(name, 0) + float(drv.get("impact_strength", 0))

            # Top drivers by total impact
            top_drivers = sorted(
                [{"name": name, "count": driver_dist[name], "total_impact": driver_scores[name]}
                 for name in driver_dist],
                key=lambda x: x["total_impact"],
                reverse=True
            )[:5]

            # Function breakdown (simplified)
            func_response = self.supabase.table("org_functions").select(
                "id, name"
            ).limit(10).execute()

            function_scores = []
            for func in (func_response.data or []):
                function_scores.append({
                    "function_id": func["id"],
                    "function_name": func["name"],
                    "value_score": 50.0,  # Placeholder - would need deeper calculation
                    "jtbd_count": 0
                })

            # Estimate total savings potential
            time_savings = unique_mapped_jtbds * 5  # 5 hours per JTBD per month
            cost_savings = time_savings * 12 * 75  # Per year at $75/hour

            return ValueDashboard(
                tenant_id=tenant_id,
                tenant_name=tenant_name,
                total_jtbds=total_jtbds,
                jtbds_with_value_mapping=unique_mapped_jtbds,
                coverage_percentage=round(coverage, 1),
                category_distribution=category_dist,
                primary_category_counts=primary_counts,
                driver_distribution=driver_dist,
                top_drivers=top_drivers,
                function_value_scores=function_scores,
                total_time_savings_potential=time_savings,
                total_cost_savings_potential=cost_savings,
                generated_at=datetime.utcnow()
            )

        except Exception as e:
            logger.error(f"Error generating value dashboard: {e}")
            raise

    async def get_category_insights(self, category_code: str) -> Dict[str, Any]:
        """
        Get detailed insights for a specific value category

        Args:
            category_code: Value category code (SMARTER, FASTER, etc.)

        Returns:
            Dictionary with category insights
        """
        try:
            # Get category details
            cat_response = self.supabase.table("value_categories").select(
                "id, name, code, description"
            ).eq("code", category_code).single().execute()

            if not cat_response.data:
                return {"error": f"Category {category_code} not found"}

            category = cat_response.data

            # Get all JTBDs mapped to this category
            mappings_response = self.supabase.table("jtbd_value_categories").select(
                "jtbd_id, relevance_score, is_primary"
            ).eq("category_id", category["id"]).execute()

            mappings = mappings_response.data or []

            # Get JTBD details for top mappings
            top_jtbd_ids = [m["jtbd_id"] for m in sorted(
                mappings,
                key=lambda x: float(x.get("relevance_score", 0)),
                reverse=True
            )[:10]]

            if top_jtbd_ids:
                jtbd_response = self.supabase.table("jtbd").select(
                    "id, code, name, complexity"
                ).in_("id", top_jtbd_ids).execute()
                top_jtbds = jtbd_response.data or []
            else:
                top_jtbds = []

            return {
                "category": {
                    "code": category["code"],
                    "name": category["name"],
                    "description": category["description"]
                },
                "metrics": {
                    "total_mappings": len(mappings),
                    "primary_mappings": sum(1 for m in mappings if m.get("is_primary")),
                    "avg_relevance_score": sum(float(m.get("relevance_score", 0)) for m in mappings) / max(len(mappings), 1)
                },
                "top_jtbds": [
                    {
                        "id": j["id"],
                        "code": j["code"],
                        "name": j["name"],
                        "complexity": j.get("complexity")
                    }
                    for j in top_jtbds
                ],
                "distribution": {
                    "by_complexity": {},  # Would need additional query
                    "by_function": {}  # Would need additional query
                }
            }

        except Exception as e:
            logger.error(f"Error getting category insights: {e}")
            return {"error": str(e)}

    async def get_driver_insights(self, driver_code: str) -> Dict[str, Any]:
        """
        Get detailed insights for a specific value driver

        Args:
            driver_code: Value driver code

        Returns:
            Dictionary with driver insights
        """
        try:
            # Get driver details
            drv_response = self.supabase.table("value_drivers").select(
                "id, name, code, driver_type"
            ).eq("code", driver_code).single().execute()

            if not drv_response.data:
                return {"error": f"Driver {driver_code} not found"}

            driver = drv_response.data

            # Get all JTBDs mapped to this driver
            mappings_response = self.supabase.table("jtbd_value_drivers").select(
                "jtbd_id, impact_strength, confidence_level"
            ).eq("driver_id", driver["id"]).execute()

            mappings = mappings_response.data or []

            # Confidence distribution
            confidence_dist = {}
            for m in mappings:
                conf = m.get("confidence_level", "low")
                confidence_dist[conf] = confidence_dist.get(conf, 0) + 1

            return {
                "driver": {
                    "code": driver["code"],
                    "name": driver["name"],
                    "type": driver["driver_type"]
                },
                "metrics": {
                    "total_mappings": len(mappings),
                    "avg_impact_strength": sum(float(m.get("impact_strength", 0)) for m in mappings) / max(len(mappings), 1),
                    "high_confidence_count": confidence_dist.get("high", 0) + confidence_dist.get("very_high", 0)
                },
                "confidence_distribution": confidence_dist
            }

        except Exception as e:
            logger.error(f"Error getting driver insights: {e}")
            return {"error": str(e)}


# Singleton instance
_roi_calculator: Optional[ROICalculatorService] = None


def get_roi_calculator() -> ROICalculatorService:
    """Get singleton ROI Calculator service instance"""
    global _roi_calculator
    if _roi_calculator is None:
        _roi_calculator = ROICalculatorService()
    return _roi_calculator


async def calculate_jtbd_roi(jtbd_id: UUID) -> Optional[ROICalculation]:
    """Convenience function to calculate JTBD ROI"""
    return await get_roi_calculator().calculate_jtbd_roi(jtbd_id)


async def calculate_role_roi(role_id: UUID) -> Optional[ROICalculation]:
    """Convenience function to calculate role ROI"""
    return await get_roi_calculator().calculate_role_roi(role_id)


async def get_value_dashboard(tenant_id: Optional[UUID] = None) -> ValueDashboard:
    """Convenience function to get value dashboard"""
    return await get_roi_calculator().get_value_dashboard(tenant_id)
