"""
A/B Testing Experiment Setup Script

Creates and manages A/B testing experiments for optimizing:
- Hybrid search scoring weights
- Cache TTL settings
- Maximum result counts
- Graph relationship thresholds

Created: 2025-10-24
Phase: 3 Week 5 - Testing & Optimization
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../'))

from services.ab_testing_framework import ABTestingFramework


async def setup_scoring_weights_experiment():
    """
    Experiment: Test different hybrid search scoring weights

    Control: 60/25/10/5 (vector/domain/capability/graph)
    Variants:
    - Treatment A: 70/20/5/5 (higher vector weight)
    - Treatment B: 50/30/15/5 (higher domain weight)
    - Treatment C: 55/25/15/5 (balanced capability boost)
    """
    ab_testing = ABTestingFramework()

    print("=" * 80)
    print("Creating Experiment: Hybrid Search Scoring Weights Optimization")
    print("=" * 80)

    experiment = await ab_testing.create_experiment(
        experiment_id="scoring_weights_v1",
        name="Hybrid Search Scoring Weights Optimization",
        description="""
        Test different weight combinations for hybrid search scoring to optimize
        for user satisfaction and result relevance.

        Metrics tracked:
        - Search success rate (results returned)
        - Average overall score
        - User engagement (agent selection rate)
        - Search time (performance impact)
        """,
        variants=[
            {
                "name": "control",
                "allocation": 0.25,
                "config": {
                    "weights": {
                        "vector": 0.60,
                        "domain": 0.25,
                        "capability": 0.10,
                        "graph": 0.05
                    },
                    "description": "Current production weights (60/25/10/5)"
                }
            },
            {
                "name": "treatment_a_high_vector",
                "allocation": 0.25,
                "config": {
                    "weights": {
                        "vector": 0.70,
                        "domain": 0.20,
                        "capability": 0.05,
                        "graph": 0.05
                    },
                    "description": "Higher vector similarity (70/20/5/5)"
                }
            },
            {
                "name": "treatment_b_high_domain",
                "allocation": 0.25,
                "config": {
                    "weights": {
                        "vector": 0.50,
                        "domain": 0.30,
                        "capability": 0.15,
                        "graph": 0.05
                    },
                    "description": "Higher domain expertise (50/30/15/5)"
                }
            },
            {
                "name": "treatment_c_balanced",
                "allocation": 0.25,
                "config": {
                    "weights": {
                        "vector": 0.55,
                        "domain": 0.25,
                        "capability": 0.15,
                        "graph": 0.05
                    },
                    "description": "Balanced capability boost (55/25/15/5)"
                }
            }
        ],
        minimum_sample_size=500,  # Minimum 500 users per variant
        confidence_level=0.95,
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=14)  # 2-week experiment
    )

    print(f"\n✓ Experiment created: {experiment.experiment_id}")
    print(f"  Name: {experiment.name}")
    print(f"  Variants: {len(experiment.variants)}")
    print(f"  Sample size: {experiment.minimum_sample_size} per variant")
    print(f"  Duration: {(experiment.end_date - experiment.start_date).days} days")
    print(f"  Status: {experiment.status}")

    print("\nVariants:")
    for variant in experiment.variants:
        print(f"  - {variant.name}: {variant.allocation:.0%} traffic")
        print(f"    Weights: {variant.config['weights']}")
        print(f"    {variant.config['description']}")

    return experiment


async def setup_cache_ttl_experiment():
    """
    Experiment: Test different cache TTL settings

    Control: 1 hour query cache, 24 hour embedding cache
    Variants:
    - Treatment A: 2 hour query cache, 48 hour embedding cache
    - Treatment B: 30 min query cache, 12 hour embedding cache
    """
    ab_testing = ABTestingFramework()

    print("\n" + "=" * 80)
    print("Creating Experiment: Cache TTL Optimization")
    print("=" * 80)

    experiment = await ab_testing.create_experiment(
        experiment_id="cache_ttl_v1",
        name="Cache TTL Optimization",
        description="""
        Test different cache TTL settings to optimize for:
        - Cache hit rate
        - Result freshness
        - Search performance

        Metrics tracked:
        - Cache hit rate
        - Average search latency
        - Result staleness (age of cached results)
        - User satisfaction
        """,
        variants=[
            {
                "name": "control",
                "allocation": 0.33,
                "config": {
                    "query_cache_ttl": 3600,  # 1 hour
                    "embedding_cache_ttl": 86400,  # 24 hours
                    "description": "Current production TTL (1h/24h)"
                }
            },
            {
                "name": "treatment_a_longer",
                "allocation": 0.33,
                "config": {
                    "query_cache_ttl": 7200,  # 2 hours
                    "embedding_cache_ttl": 172800,  # 48 hours
                    "description": "Longer TTL for higher hit rate (2h/48h)"
                }
            },
            {
                "name": "treatment_b_shorter",
                "allocation": 0.34,
                "config": {
                    "query_cache_ttl": 1800,  # 30 minutes
                    "embedding_cache_ttl": 43200,  # 12 hours
                    "description": "Shorter TTL for fresher results (30m/12h)"
                }
            }
        ],
        minimum_sample_size=1000,  # More samples needed for cache analysis
        confidence_level=0.95,
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=7)  # 1-week experiment
    )

    print(f"\n✓ Experiment created: {experiment.experiment_id}")
    print(f"  Variants: {len(experiment.variants)}")
    print(f"  Duration: {(experiment.end_date - experiment.start_date).days} days")

    print("\nVariants:")
    for variant in experiment.variants:
        print(f"  - {variant.name}: {variant.allocation:.0%} traffic")
        print(f"    Query TTL: {variant.config['query_cache_ttl']}s")
        print(f"    Embedding TTL: {variant.config['embedding_cache_ttl']}s")
        print(f"    {variant.config['description']}")

    return experiment


async def setup_max_results_experiment():
    """
    Experiment: Test different default max_results values

    Control: 10 results
    Variants:
    - Treatment A: 5 results (faster, more focused)
    - Treatment B: 15 results (more options)
    """
    ab_testing = ABTestingFramework()

    print("\n" + "=" * 80)
    print("Creating Experiment: Default Max Results Optimization")
    print("=" * 80)

    experiment = await ab_testing.create_experiment(
        experiment_id="max_results_v1",
        name="Default Max Results Optimization",
        description="""
        Test different default max_results values to optimize for:
        - User decision time
        - Search performance
        - Result quality perception

        Metrics tracked:
        - Agent selection rate
        - Time to selection
        - Search latency
        - User satisfaction
        """,
        variants=[
            {
                "name": "control_10",
                "allocation": 0.33,
                "config": {
                    "default_max_results": 10,
                    "description": "Current default (10 results)"
                }
            },
            {
                "name": "treatment_a_5",
                "allocation": 0.33,
                "config": {
                    "default_max_results": 5,
                    "description": "Fewer results for faster decisions (5 results)"
                }
            },
            {
                "name": "treatment_b_15",
                "allocation": 0.34,
                "config": {
                    "default_max_results": 15,
                    "description": "More results for better selection (15 results)"
                }
            }
        ],
        minimum_sample_size=300,
        confidence_level=0.95,
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=10)
    )

    print(f"\n✓ Experiment created: {experiment.experiment_id}")
    print(f"  Variants: {len(experiment.variants)}")
    print(f"  Duration: {(experiment.end_date - experiment.start_date).days} days")

    print("\nVariants:")
    for variant in experiment.variants:
        print(f"  - {variant.name}: {variant.allocation:.0%} traffic")
        print(f"    Max results: {variant.config['default_max_results']}")
        print(f"    {variant.config['description']}")

    return experiment


async def setup_graph_threshold_experiment():
    """
    Experiment: Test different graph relationship thresholds

    Control: 30% domain similarity threshold
    Variants:
    - Treatment A: 20% (more relationships)
    - Treatment B: 40% (fewer, higher quality)
    """
    ab_testing = ABTestingFramework()

    print("\n" + "=" * 80)
    print("Creating Experiment: Graph Relationship Threshold Optimization")
    print("=" * 80)

    experiment = await ab_testing.create_experiment(
        experiment_id="graph_threshold_v1",
        name="Graph Relationship Threshold Optimization",
        description="""
        Test different thresholds for creating graph relationships to optimize for:
        - Relationship quality
        - Graph density
        - Search result relevance

        Metrics tracked:
        - Average graph score
        - Number of relationships per agent
        - User engagement with related agents
        """,
        variants=[
            {
                "name": "control_30",
                "allocation": 0.33,
                "config": {
                    "domain_similarity_threshold": 0.30,
                    "description": "Current threshold (30% similarity)"
                }
            },
            {
                "name": "treatment_a_20",
                "allocation": 0.33,
                "config": {
                    "domain_similarity_threshold": 0.20,
                    "description": "Lower threshold for more relationships (20%)"
                }
            },
            {
                "name": "treatment_b_40",
                "allocation": 0.34,
                "config": {
                    "domain_similarity_threshold": 0.40,
                    "description": "Higher threshold for quality relationships (40%)"
                }
            }
        ],
        minimum_sample_size=400,
        confidence_level=0.95,
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=14)
    )

    print(f"\n✓ Experiment created: {experiment.experiment_id}")
    print(f"  Variants: {len(experiment.variants)}")
    print(f"  Duration: {(experiment.end_date - experiment.start_date).days} days")

    print("\nVariants:")
    for variant in experiment.variants:
        print(f"  - {variant.name}: {variant.allocation:.0%} traffic")
        print(f"    Threshold: {variant.config['domain_similarity_threshold']:.0%}")
        print(f"    {variant.config['description']}")

    return experiment


async def list_active_experiments():
    """List all active experiments"""
    ab_testing = ABTestingFramework()

    print("\n" + "=" * 80)
    print("Active A/B Testing Experiments")
    print("=" * 80)

    experiments = await ab_testing.get_active_experiments()

    if not experiments:
        print("\nNo active experiments found.")
        return

    for exp in experiments:
        print(f"\n{exp.name}")
        print(f"  ID: {exp.experiment_id}")
        print(f"  Status: {exp.status}")
        print(f"  Variants: {len(exp.variants)}")
        print(f"  Progress: {exp.current_sample_size}/{exp.minimum_sample_size} samples")

        if exp.end_date:
            days_remaining = (exp.end_date - datetime.utcnow()).days
            print(f"  Time remaining: {days_remaining} days")


async def analyze_experiment(experiment_id: str):
    """Analyze experiment results"""
    ab_testing = ABTestingFramework()

    print(f"\n" + "=" * 80)
    print(f"Analyzing Experiment: {experiment_id}")
    print("=" * 80)

    analysis = await ab_testing.analyze_experiment(experiment_id)

    if not analysis:
        print(f"\nExperiment '{experiment_id}' not found or has no data yet.")
        return

    print(f"\nExperiment: {analysis['experiment_name']}")
    print(f"Status: {analysis['status']}")
    print(f"Total samples: {analysis['total_samples']}")

    print("\nVariant Performance:")
    print(f"{'Variant':<30} {'Samples':<10} {'Conversion %':<15} {'Confidence'}")
    print("-" * 80)

    for variant in analysis['variants']:
        print(
            f"{variant['name']:<30} "
            f"{variant['sample_count']:<10} "
            f"{variant['conversion_rate']:<14.2%} "
            f"{variant['confidence_interval']}"
        )

    if analysis.get('winner'):
        print(f"\n🏆 Winner: {analysis['winner']['variant_name']}")
        print(f"   Confidence: {analysis['winner']['confidence']:.2%}")
        print(f"   Improvement: {analysis['winner']['improvement']:.2%}")
    else:
        print("\n⏳ No winner yet - need more data or higher statistical significance")


async def main():
    """Main function to set up all experiments"""
    import argparse

    parser = argparse.ArgumentParser(description="A/B Testing Experiment Management")
    parser.add_argument(
        "command",
        choices=["setup-all", "setup-weights", "setup-cache", "setup-results",
                 "setup-graph", "list", "analyze"],
        help="Command to execute"
    )
    parser.add_argument(
        "--experiment-id",
        help="Experiment ID for analysis"
    )

    args = parser.parse_args()

    try:
        if args.command == "setup-all":
            print("Setting up all A/B testing experiments...\n")
            await setup_scoring_weights_experiment()
            await setup_cache_ttl_experiment()
            await setup_max_results_experiment()
            await setup_graph_threshold_experiment()
            print("\n" + "=" * 80)
            print("✓ All experiments created successfully!")
            print("=" * 80)

        elif args.command == "setup-weights":
            await setup_scoring_weights_experiment()

        elif args.command == "setup-cache":
            await setup_cache_ttl_experiment()

        elif args.command == "setup-results":
            await setup_max_results_experiment()

        elif args.command == "setup-graph":
            await setup_graph_threshold_experiment()

        elif args.command == "list":
            await list_active_experiments()

        elif args.command == "analyze":
            if not args.experiment_id:
                print("Error: --experiment-id required for analysis")
                return
            await analyze_experiment(args.experiment_id)

        print("\n" + "=" * 80)
        print("Next Steps:")
        print("=" * 80)
        print("1. Monitor experiments: python scripts/setup_ab_experiments.py list")
        print("2. Analyze results: python scripts/setup_ab_experiments.py analyze --experiment-id <id>")
        print("3. Review metrics in production monitoring dashboard")
        print("4. Select winner and roll out to 100% traffic")
        print("=" * 80 + "\n")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
