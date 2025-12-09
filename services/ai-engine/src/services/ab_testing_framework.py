"""
A/B Testing Framework for Search Algorithms

Enables controlled experiments to compare search algorithms and configurations.

Features:
- Multiple variant support (A/B/C/D testing)
- User-based assignment (consistent experience)
- Performance metrics tracking
- Statistical significance testing
- Automatic winner selection

Use Cases:
- Test hybrid weights (60/25/10/5 vs 70/20/5/5)
- Compare pure vector vs hybrid search
- Test different similarity thresholds
- Evaluate new ranking algorithms
"""

import asyncio
import logging
import os
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import hashlib
import json

import asyncpg
from scipy import stats
import numpy as np


logger = logging.getLogger(__name__)


class ExperimentStatus(Enum):
    """Experiment lifecycle states"""
    DRAFT = "draft"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"


@dataclass
class Variant:
    """A/B test variant configuration"""
    variant_id: str
    name: str
    description: str
    traffic_allocation: float  # 0.0 to 1.0
    config: Dict[str, Any]  # Variant-specific configuration
    is_control: bool = False


@dataclass
class ExperimentMetrics:
    """Metrics for an experiment variant"""
    variant_id: str
    impressions: int = 0
    clicks: int = 0  # User clicked on a result
    conversions: int = 0  # User confirmed agent selection
    avg_latency_ms: float = 0.0
    avg_result_score: float = 0.0
    avg_rank_clicked: float = 0.0

    # Calculated metrics
    click_through_rate: float = 0.0
    conversion_rate: float = 0.0
    success_rate: float = 0.0

    def calculate_derived_metrics(self):
        """Calculate CTR, conversion rate, etc."""
        self.click_through_rate = (
            self.clicks / self.impressions
            if self.impressions > 0 else 0.0
        )
        self.conversion_rate = (
            self.conversions / self.impressions
            if self.impressions > 0 else 0.0
        )
        self.success_rate = (
            self.conversions / self.clicks
            if self.clicks > 0 else 0.0
        )


@dataclass
class Experiment:
    """A/B test experiment definition"""
    experiment_id: str
    name: str
    description: str
    hypothesis: str
    variants: List[Variant]
    status: ExperimentStatus
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    minimum_sample_size: int = 100
    confidence_level: float = 0.95
    metadata: Dict[str, Any] = field(default_factory=dict)


class ABTestingFramework:
    """
    A/B testing framework for search algorithms
    """

    def __init__(self, database_url: Optional[str] = None):
        self.database_url = database_url or os.getenv("DATABASE_URL")
        self.db_pool: Optional[asyncpg.Pool] = None

        # In-memory cache of active experiments
        self.active_experiments: Dict[str, Experiment] = {}

    async def connect(self):
        """Connect to database"""
        if not self.db_pool:
            self.db_pool = await asyncpg.create_pool(
                self.database_url,
                min_size=2,
                max_size=10
            )
            logger.info("Connected to database for A/B testing")

            # Initialize schema if needed
            await self._initialize_schema()

            # Load active experiments
            await self._load_active_experiments()

    async def close(self):
        """Close database connection"""
        if self.db_pool:
            await self.db_pool.close()
            logger.info("Closed database connection")

    async def _initialize_schema(self):
        """Create A/B testing tables if they don't exist"""
        await self.db_pool.execute("""
            CREATE TABLE IF NOT EXISTS ab_experiments (
                experiment_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                hypothesis TEXT,
                status TEXT NOT NULL,
                start_date TIMESTAMPTZ,
                end_date TIMESTAMPTZ,
                minimum_sample_size INTEGER DEFAULT 100,
                confidence_level DECIMAL(3,2) DEFAULT 0.95,
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS ab_variants (
                variant_id TEXT PRIMARY KEY,
                experiment_id TEXT NOT NULL REFERENCES ab_experiments(experiment_id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                description TEXT,
                traffic_allocation DECIMAL(3,2) NOT NULL,
                config JSONB NOT NULL,
                is_control BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS ab_events (
                event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                experiment_id TEXT NOT NULL,
                variant_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                event_type TEXT NOT NULL,  -- 'impression', 'click', 'conversion'
                event_data JSONB DEFAULT '{}',
                latency_ms DECIMAL(10,2),
                result_score DECIMAL(5,4),
                rank_clicked INTEGER,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_ab_events_experiment ON ab_events(experiment_id);
            CREATE INDEX IF NOT EXISTS idx_ab_events_variant ON ab_events(variant_id);
            CREATE INDEX IF NOT EXISTS idx_ab_events_user ON ab_events(user_id);
            CREATE INDEX IF NOT EXISTS idx_ab_events_created ON ab_events(created_at);
        """)

        logger.info("A/B testing schema initialized")

    async def _load_active_experiments(self):
        """Load active experiments from database"""
        experiments = await self.db_pool.fetch("""
            SELECT * FROM ab_experiments
            WHERE status = 'running'
        """)

        for exp_row in experiments:
            # Load variants for this experiment
            variants_rows = await self.db_pool.fetch("""
                SELECT * FROM ab_variants
                WHERE experiment_id = $1
            """, exp_row['experiment_id'])

            variants = [
                Variant(
                    variant_id=v['variant_id'],
                    name=v['name'],
                    description=v['description'],
                    traffic_allocation=float(v['traffic_allocation']),
                    config=v['config'],
                    is_control=v['is_control']
                )
                for v in variants_rows
            ]

            experiment = Experiment(
                experiment_id=exp_row['experiment_id'],
                name=exp_row['name'],
                description=exp_row['description'],
                hypothesis=exp_row['hypothesis'],
                variants=variants,
                status=ExperimentStatus(exp_row['status']),
                start_date=exp_row['start_date'],
                end_date=exp_row['end_date'],
                minimum_sample_size=exp_row['minimum_sample_size'],
                confidence_level=float(exp_row['confidence_level']),
                metadata=exp_row['metadata']
            )

            self.active_experiments[experiment.experiment_id] = experiment

        logger.info(f"Loaded {len(self.active_experiments)} active experiments")

    async def create_experiment(
        self,
        experiment_id: str,
        name: str,
        description: str,
        hypothesis: str,
        variants: List[Variant],
        minimum_sample_size: int = 100,
        confidence_level: float = 0.95
    ) -> Experiment:
        """
        Create a new A/B test experiment.

        Args:
            experiment_id: Unique experiment identifier
            name: Human-readable name
            description: What is being tested
            hypothesis: Expected outcome
            variants: List of variants to test
            minimum_sample_size: Minimum samples before declaring winner
            confidence_level: Statistical confidence required (default 95%)

        Returns:
            Created experiment
        """
        if not self.db_pool:
            await self.connect()

        # Validate traffic allocation sums to 1.0
        total_allocation = sum(v.traffic_allocation for v in variants)
        if not (0.99 <= total_allocation <= 1.01):
            raise ValueError(f"Traffic allocation must sum to 1.0, got {total_allocation}")

        # Ensure exactly one control variant
        control_count = sum(1 for v in variants if v.is_control)
        if control_count != 1:
            raise ValueError(f"Must have exactly 1 control variant, got {control_count}")

        # Create experiment
        await self.db_pool.execute("""
            INSERT INTO ab_experiments (
                experiment_id, name, description, hypothesis,
                status, minimum_sample_size, confidence_level
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        """, experiment_id, name, description, hypothesis,
            ExperimentStatus.DRAFT.value, minimum_sample_size, confidence_level)

        # Create variants
        for variant in variants:
            await self.db_pool.execute("""
                INSERT INTO ab_variants (
                    variant_id, experiment_id, name, description,
                    traffic_allocation, config, is_control
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            """, variant.variant_id, experiment_id, variant.name, variant.description,
                variant.traffic_allocation, json.dumps(variant.config), variant.is_control)

        experiment = Experiment(
            experiment_id=experiment_id,
            name=name,
            description=description,
            hypothesis=hypothesis,
            variants=variants,
            status=ExperimentStatus.DRAFT,
            minimum_sample_size=minimum_sample_size,
            confidence_level=confidence_level
        )

        logger.info(f"Created experiment '{name}' with {len(variants)} variants")
        return experiment

    async def start_experiment(self, experiment_id: str):
        """Start an experiment"""
        if not self.db_pool:
            await self.connect()

        await self.db_pool.execute("""
            UPDATE ab_experiments
            SET status = $1, start_date = NOW()
            WHERE experiment_id = $2
        """, ExperimentStatus.RUNNING.value, experiment_id)

        # Reload active experiments
        await self._load_active_experiments()

        logger.info(f"Started experiment {experiment_id}")

    async def stop_experiment(self, experiment_id: str):
        """Stop an experiment"""
        if not self.db_pool:
            await self.connect()

        await self.db_pool.execute("""
            UPDATE ab_experiments
            SET status = $1, end_date = NOW()
            WHERE experiment_id = $2
        """, ExperimentStatus.COMPLETED.value, experiment_id)

        # Remove from active experiments
        if experiment_id in self.active_experiments:
            del self.active_experiments[experiment_id]

        logger.info(f"Stopped experiment {experiment_id}")

    def _assign_variant(self, experiment: Experiment, user_id: str) -> Variant:
        """
        Assign user to a variant consistently.

        Uses hash-based assignment for consistency across sessions.
        """
        # Hash user_id + experiment_id for consistent assignment
        hash_input = f"{user_id}:{experiment.experiment_id}"
        hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)
        assignment_value = (hash_value % 10000) / 10000.0  # 0.0 to 1.0

        # Find variant based on cumulative allocation
        cumulative = 0.0
        for variant in experiment.variants:
            cumulative += variant.traffic_allocation
            if assignment_value <= cumulative:
                return variant

        # Fallback to control
        return next((v for v in experiment.variants if v.is_control), experiment.variants[0])

    async def get_variant_for_user(
        self,
        experiment_id: str,
        user_id: str
    ) -> Optional[Variant]:
        """
        Get the assigned variant for a user.

        Args:
            experiment_id: Experiment to get variant from
            user_id: User identifier

        Returns:
            Assigned variant or None if experiment not active
        """
        experiment = self.active_experiments.get(experiment_id)

        if not experiment:
            return None

        return self._assign_variant(experiment, user_id)

    async def track_event(
        self,
        experiment_id: str,
        variant_id: str,
        user_id: str,
        event_type: str,
        latency_ms: Optional[float] = None,
        result_score: Optional[float] = None,
        rank_clicked: Optional[int] = None,
        event_data: Optional[Dict[str, Any]] = None
    ):
        """
        Track an A/B test event.

        Args:
            experiment_id: Experiment ID
            variant_id: Variant ID
            user_id: User ID
            event_type: 'impression', 'click', or 'conversion'
            latency_ms: Optional search latency
            result_score: Optional result quality score
            rank_clicked: Optional rank of result clicked (1-based)
            event_data: Optional additional data
        """
        if not self.db_pool:
            await self.connect()

        await self.db_pool.execute("""
            INSERT INTO ab_events (
                experiment_id, variant_id, user_id, event_type,
                event_data, latency_ms, result_score, rank_clicked
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        """, experiment_id, variant_id, user_id, event_type,
            json.dumps(event_data or {}), latency_ms, result_score, rank_clicked)

    async def get_experiment_metrics(
        self,
        experiment_id: str
    ) -> Dict[str, ExperimentMetrics]:
        """
        Get metrics for all variants in an experiment.

        Returns:
            Dict mapping variant_id to ExperimentMetrics
        """
        if not self.db_pool:
            await self.connect()

        # Get aggregated metrics per variant
        metrics_rows = await self.db_pool.fetch("""
            SELECT
                variant_id,
                COUNT(*) FILTER (WHERE event_type = 'impression') AS impressions,
                COUNT(*) FILTER (WHERE event_type = 'click') AS clicks,
                COUNT(*) FILTER (WHERE event_type = 'conversion') AS conversions,
                AVG(latency_ms) FILTER (WHERE latency_ms IS NOT NULL) AS avg_latency_ms,
                AVG(result_score) FILTER (WHERE result_score IS NOT NULL) AS avg_result_score,
                AVG(rank_clicked) FILTER (WHERE rank_clicked IS NOT NULL) AS avg_rank_clicked
            FROM ab_events
            WHERE experiment_id = $1
            GROUP BY variant_id
        """, experiment_id)

        metrics = {}

        for row in metrics_rows:
            m = ExperimentMetrics(
                variant_id=row['variant_id'],
                impressions=row['impressions'],
                clicks=row['clicks'],
                conversions=row['conversions'],
                avg_latency_ms=float(row['avg_latency_ms']) if row['avg_latency_ms'] else 0.0,
                avg_result_score=float(row['avg_result_score']) if row['avg_result_score'] else 0.0,
                avg_rank_clicked=float(row['avg_rank_clicked']) if row['avg_rank_clicked'] else 0.0
            )
            m.calculate_derived_metrics()
            metrics[row['variant_id']] = m

        return metrics

    async def analyze_experiment(
        self,
        experiment_id: str
    ) -> Dict[str, Any]:
        """
        Perform statistical analysis of experiment results.

        Returns:
            Analysis results including winner, p-values, confidence intervals
        """
        experiment = self.active_experiments.get(experiment_id)
        if not experiment:
            # Try to load from database
            exp_row = await self.db_pool.fetchrow(
                "SELECT * FROM ab_experiments WHERE experiment_id = $1",
                experiment_id
            )
            if not exp_row:
                raise ValueError(f"Experiment {experiment_id} not found")

        # Get metrics
        metrics = await self.get_experiment_metrics(experiment_id)

        # Find control variant
        control_variant_id = None
        for variant_id, m in metrics.items():
            variant = next((v for v in experiment.variants if v.variant_id == variant_id), None)
            if variant and variant.is_control:
                control_variant_id = variant_id
                break

        if not control_variant_id:
            raise ValueError("No control variant found")

        control_metrics = metrics[control_variant_id]

        # Analyze each variant vs control
        results = {}

        for variant_id, variant_metrics in metrics.items():
            if variant_id == control_variant_id:
                results[variant_id] = {
                    "is_control": True,
                    "metrics": variant_metrics.__dict__,
                    "vs_control": None
                }
                continue

            # Chi-square test for conversion rate
            # H0: Variant conversion rate = Control conversion rate
            observed = np.array([
                [variant_metrics.conversions, variant_metrics.impressions - variant_metrics.conversions],
                [control_metrics.conversions, control_metrics.impressions - control_metrics.conversions]
            ])

            chi2, p_value, dof, expected = stats.chi2_contingency(observed)

            # Calculate lift
            lift = (
                (variant_metrics.conversion_rate - control_metrics.conversion_rate) /
                control_metrics.conversion_rate * 100
                if control_metrics.conversion_rate > 0 else 0.0
            )

            # Statistical significance
            is_significant = p_value < (1 - experiment.confidence_level)

            # Confidence interval for conversion rate
            # Using Wilson score interval
            from statsmodels.stats.proportion import proportion_confint

            ci_low, ci_high = proportion_confint(
                variant_metrics.conversions,
                variant_metrics.impressions,
                alpha=1-experiment.confidence_level,
                method='wilson'
            )

            results[variant_id] = {
                "is_control": False,
                "metrics": variant_metrics.__dict__,
                "vs_control": {
                    "lift_percent": round(lift, 2),
                    "p_value": round(p_value, 4),
                    "is_significant": is_significant,
                    "confidence_interval": [round(ci_low, 4), round(ci_high, 4)],
                    "sample_size_adequate": variant_metrics.impressions >= experiment.minimum_sample_size
                }
            }

        # Determine winner
        winner_id = control_variant_id
        best_conversion_rate = control_metrics.conversion_rate

        for variant_id, result in results.items():
            if variant_id == control_variant_id:
                continue

            variant_metrics = metrics[variant_id]

            # Winner criteria:
            # 1. Statistically significant improvement
            # 2. Better conversion rate
            # 3. Adequate sample size
            if (
                result["vs_control"]["is_significant"] and
                variant_metrics.conversion_rate > best_conversion_rate and
                result["vs_control"]["sample_size_adequate"]
            ):
                winner_id = variant_id
                best_conversion_rate = variant_metrics.conversion_rate

        return {
            "experiment_id": experiment_id,
            "status": experiment.status.value,
            "variants": results,
            "winner": winner_id,
            "winner_name": next(
                (v.name for v in experiment.variants if v.variant_id == winner_id),
                "Unknown"
            ),
            "recommendation": (
                "Deploy winner" if winner_id != control_variant_id
                else "Keep control (no significant improvement)"
            )
        }


# ============================================================================
# Example: Testing Hybrid Search Weights
# ============================================================================

HYBRID_SEARCH_WEIGHT_EXPERIMENT = {
    "experiment_id": "hybrid_weights_test_001",
    "name": "Hybrid Search Weight Optimization",
    "description": "Test different weighting schemes for hybrid search",
    "hypothesis": "70/20/5/5 weighting will improve conversion rate by 10%",
    "variants": [
        Variant(
            variant_id="control_60_25_10_5",
            name="Control (60/25/10/5)",
            description="Current weights: 60% vector, 25% domain, 10% capability, 5% graph",
            traffic_allocation=0.34,
            config={"vector": 0.60, "domain": 0.25, "capability": 0.10, "graph": 0.05},
            is_control=True
        ),
        Variant(
            variant_id="variant_70_20_5_5",
            name="Vector Heavy (70/20/5/5)",
            description="Emphasize vector similarity more",
            traffic_allocation=0.33,
            config={"vector": 0.70, "domain": 0.20, "capability": 0.05, "graph": 0.05}
        ),
        Variant(
            variant_id="variant_50_35_10_5",
            name="Domain Heavy (50/35/10/5)",
            description="Emphasize domain expertise more",
            traffic_allocation=0.33,
            config={"vector": 0.50, "domain": 0.35, "capability": 0.10, "graph": 0.05}
        )
    ]
}


# ============================================================================
# CLI Interface
# ============================================================================

async def main():
    """CLI for A/B testing management"""
    import sys

    framework = ABTestingFramework()
    await framework.connect()

    try:
        command = sys.argv[1] if len(sys.argv) > 1 else "list"

        if command == "create-example":
            # Create example experiment
            exp = await framework.create_experiment(
                **{k: v for k, v in HYBRID_SEARCH_WEIGHT_EXPERIMENT.items() if k != "variants"},
                variants=HYBRID_SEARCH_WEIGHT_EXPERIMENT["variants"]
            )
            print(f"Created experiment: {exp.experiment_id}")

        elif command == "start":
            exp_id = sys.argv[2]
            await framework.start_experiment(exp_id)
            print(f"Started experiment: {exp_id}")

        elif command == "stop":
            exp_id = sys.argv[2]
            await framework.stop_experiment(exp_id)
            print(f"Stopped experiment: {exp_id}")

        elif command == "analyze":
            exp_id = sys.argv[2]
            results = await framework.analyze_experiment(exp_id)
            print(json.dumps(results, indent=2))

        else:
            print("Usage: python ab_testing_framework.py [create-example|start <exp_id>|stop <exp_id>|analyze <exp_id>]")

    finally:
        await framework.close()


if __name__ == "__main__":
    import logging
    logging.basicConfig(level=logging.INFO)

    asyncio.run(main())
