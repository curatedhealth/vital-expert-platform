"""
RAG Evaluation and A/B Testing Harness
Systematic evaluation of RAG strategies with metrics collection
"""

import time
import json
from typing import List, Dict, Optional, Any, Tuple
from dataclasses import dataclass, field, asdict
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum
import structlog

from .models import GraphRAGRequest, GraphRAGResponse, ContextChunk
from .strategies import RAGStrategy, RAGStrategyType, get_strategy_registry

logger = structlog.get_logger()


# ============================================================================
# Evaluation Models
# ============================================================================

class EvaluationMetricType(str, Enum):
    """Types of evaluation metrics"""
    PRECISION_AT_K = "precision_at_k"
    RECALL = "recall"
    MRR = "mrr"  # Mean Reciprocal Rank
    NDCG = "ndcg"  # Normalized Discounted Cumulative Gain
    LATENCY_MS = "latency_ms"
    CONTEXT_RELEVANCE = "context_relevance"
    ANSWER_QUALITY = "answer_quality"


@dataclass
class EvaluationQuery:
    """A query in the evaluation dataset"""
    id: str
    query: str
    expected_doc_ids: List[str]  # Ground truth document IDs
    query_type: str = "general"  # regulatory, clinical, research, etc.
    difficulty: str = "medium"   # easy, medium, hard
    metadata: Dict = field(default_factory=dict)


@dataclass
class EvaluationResult:
    """Result of evaluating a single query"""
    query_id: str
    strategy_type: str
    retrieved_doc_ids: List[str]
    expected_doc_ids: List[str]

    # Metrics
    precision_at_5: float = 0.0
    precision_at_10: float = 0.0
    recall: float = 0.0
    mrr: float = 0.0
    ndcg: float = 0.0
    latency_ms: float = 0.0

    # Additional info
    total_results: int = 0
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    metadata: Dict = field(default_factory=dict)


@dataclass
class StrategyEvaluationSummary:
    """Summary of a strategy's performance across all queries"""
    strategy_type: str
    strategy_name: str
    total_queries: int

    # Aggregated metrics
    avg_precision_at_5: float = 0.0
    avg_precision_at_10: float = 0.0
    avg_recall: float = 0.0
    avg_mrr: float = 0.0
    avg_ndcg: float = 0.0
    avg_latency_ms: float = 0.0
    p95_latency_ms: float = 0.0

    # Per-query-type breakdown
    metrics_by_query_type: Dict[str, Dict] = field(default_factory=dict)

    # Raw results
    individual_results: List[EvaluationResult] = field(default_factory=list)


@dataclass
class ABTestResult:
    """Result of an A/B test between two strategies"""
    test_id: str
    strategy_a: str
    strategy_b: str
    total_queries: int
    winner: str

    # Comparative metrics
    precision_improvement: float  # (B - A) / A
    recall_improvement: float
    mrr_improvement: float
    latency_change: float

    # Statistical significance
    is_significant: bool = False
    p_value: float = 1.0

    strategy_a_summary: StrategyEvaluationSummary = None
    strategy_b_summary: StrategyEvaluationSummary = None
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())


# ============================================================================
# Evaluation Metrics Calculator
# ============================================================================

class MetricsCalculator:
    """Calculate retrieval evaluation metrics"""

    @staticmethod
    def precision_at_k(retrieved: List[str], relevant: List[str], k: int) -> float:
        """
        Calculate precision@k

        Precision@k = (# of relevant docs in top k) / k
        """
        if k <= 0 or not relevant:
            return 0.0

        retrieved_k = retrieved[:k]
        relevant_set = set(relevant)
        relevant_in_k = sum(1 for doc in retrieved_k if doc in relevant_set)

        return relevant_in_k / k

    @staticmethod
    def recall(retrieved: List[str], relevant: List[str]) -> float:
        """
        Calculate recall

        Recall = (# of relevant docs retrieved) / (# of relevant docs)
        """
        if not relevant:
            return 0.0

        relevant_set = set(relevant)
        retrieved_set = set(retrieved)
        relevant_retrieved = len(relevant_set.intersection(retrieved_set))

        return relevant_retrieved / len(relevant)

    @staticmethod
    def mrr(retrieved: List[str], relevant: List[str]) -> float:
        """
        Calculate Mean Reciprocal Rank

        MRR = 1 / (rank of first relevant result)
        """
        if not relevant:
            return 0.0

        relevant_set = set(relevant)
        for i, doc_id in enumerate(retrieved):
            if doc_id in relevant_set:
                return 1.0 / (i + 1)

        return 0.0

    @staticmethod
    def ndcg(retrieved: List[str], relevant: List[str], k: int = 10) -> float:
        """
        Calculate Normalized Discounted Cumulative Gain

        NDCG = DCG / IDCG
        """
        import math

        if not relevant:
            return 0.0

        relevant_set = set(relevant)

        # Calculate DCG
        dcg = 0.0
        for i, doc_id in enumerate(retrieved[:k]):
            if doc_id in relevant_set:
                # Relevance is binary (1 if relevant, 0 otherwise)
                rel = 1.0
                dcg += rel / math.log2(i + 2)  # +2 because i starts at 0

        # Calculate IDCG (ideal DCG - all relevant docs at top)
        idcg = 0.0
        for i in range(min(len(relevant), k)):
            idcg += 1.0 / math.log2(i + 2)

        if idcg == 0:
            return 0.0

        return dcg / idcg

    def calculate_all(
        self,
        retrieved: List[str],
        relevant: List[str],
        latency_ms: float = 0.0
    ) -> Dict[str, float]:
        """Calculate all metrics"""
        return {
            "precision_at_5": self.precision_at_k(retrieved, relevant, 5),
            "precision_at_10": self.precision_at_k(retrieved, relevant, 10),
            "recall": self.recall(retrieved, relevant),
            "mrr": self.mrr(retrieved, relevant),
            "ndcg": self.ndcg(retrieved, relevant),
            "latency_ms": latency_ms
        }


# ============================================================================
# RAG Evaluation Harness
# ============================================================================

class RAGEvaluationHarness:
    """
    Comprehensive RAG evaluation harness

    Features:
    - Run evaluations against multiple strategies
    - Calculate retrieval metrics (precision, recall, MRR, NDCG)
    - A/B testing between strategies
    - Performance benchmarking
    - Result persistence
    """

    def __init__(self, graphrag_service=None):
        self.graphrag_service = graphrag_service
        self.metrics_calculator = MetricsCalculator()
        self.strategy_registry = get_strategy_registry()
        self._evaluation_dataset: List[EvaluationQuery] = []

    def load_evaluation_dataset(self, queries: List[Dict]) -> None:
        """
        Load evaluation dataset

        Args:
            queries: List of query dicts with keys:
                - query: The query string
                - expected_doc_ids: List of relevant document IDs
                - query_type: Optional query type classification
        """
        self._evaluation_dataset = [
            EvaluationQuery(
                id=str(i),
                query=q["query"],
                expected_doc_ids=q.get("expected_doc_ids", []),
                query_type=q.get("query_type", "general"),
                difficulty=q.get("difficulty", "medium"),
                metadata=q.get("metadata", {})
            )
            for i, q in enumerate(queries)
        ]
        logger.info(
            "evaluation_dataset_loaded",
            query_count=len(self._evaluation_dataset)
        )

    async def evaluate_strategy(
        self,
        strategy_type: RAGStrategyType,
        agent_id: UUID,
        session_id: UUID,
        limit: Optional[int] = None
    ) -> StrategyEvaluationSummary:
        """
        Evaluate a single strategy against the dataset

        Args:
            strategy_type: Strategy to evaluate
            agent_id: Agent ID for queries
            session_id: Session ID for queries
            limit: Optional limit on number of queries

        Returns:
            StrategyEvaluationSummary with all metrics
        """
        strategy = self.strategy_registry.get_strategy(strategy_type)
        queries = self._evaluation_dataset[:limit] if limit else self._evaluation_dataset

        results: List[EvaluationResult] = []
        metrics_by_type: Dict[str, List[Dict]] = {}

        for eval_query in queries:
            result = await self._evaluate_single_query(
                eval_query, strategy, agent_id, session_id
            )
            results.append(result)

            # Group by query type
            qtype = eval_query.query_type
            if qtype not in metrics_by_type:
                metrics_by_type[qtype] = []
            metrics_by_type[qtype].append({
                "precision_at_5": result.precision_at_5,
                "recall": result.recall,
                "mrr": result.mrr,
                "latency_ms": result.latency_ms
            })

        # Calculate summary
        summary = self._calculate_summary(strategy, results, metrics_by_type)

        logger.info(
            "strategy_evaluation_complete",
            strategy=strategy_type.value,
            queries=len(results),
            avg_precision=summary.avg_precision_at_5,
            avg_recall=summary.avg_recall
        )

        return summary

    async def _evaluate_single_query(
        self,
        eval_query: EvaluationQuery,
        strategy: RAGStrategy,
        agent_id: UUID,
        session_id: UUID
    ) -> EvaluationResult:
        """Evaluate a single query"""

        start_time = time.time()

        # Build request
        request = GraphRAGRequest(
            query=eval_query.query,
            agent_id=agent_id,
            session_id=session_id,
            top_k=strategy.top_k,
            min_score=strategy.similarity_threshold,
            include_citations=True,
            include_graph_evidence=strategy.enable_graph_search
        )

        # Execute query
        try:
            response = await self.graphrag_service.query(request)
            latency_ms = (time.time() - start_time) * 1000

            # Extract retrieved doc IDs
            retrieved_ids = [
                chunk.source.document_id
                for chunk in response.context_chunks
                if chunk.source and chunk.source.document_id
            ]

        except Exception as e:
            logger.error("query_evaluation_failed", query=eval_query.query[:50], error=str(e))
            latency_ms = (time.time() - start_time) * 1000
            retrieved_ids = []

        # Calculate metrics
        metrics = self.metrics_calculator.calculate_all(
            retrieved=retrieved_ids,
            relevant=eval_query.expected_doc_ids,
            latency_ms=latency_ms
        )

        return EvaluationResult(
            query_id=eval_query.id,
            strategy_type=strategy.strategy_type.value,
            retrieved_doc_ids=retrieved_ids,
            expected_doc_ids=eval_query.expected_doc_ids,
            precision_at_5=metrics["precision_at_5"],
            precision_at_10=metrics["precision_at_10"],
            recall=metrics["recall"],
            mrr=metrics["mrr"],
            ndcg=metrics["ndcg"],
            latency_ms=metrics["latency_ms"],
            total_results=len(retrieved_ids),
            metadata={"query_type": eval_query.query_type}
        )

    def _calculate_summary(
        self,
        strategy: RAGStrategy,
        results: List[EvaluationResult],
        metrics_by_type: Dict[str, List[Dict]]
    ) -> StrategyEvaluationSummary:
        """Calculate summary statistics"""

        if not results:
            return StrategyEvaluationSummary(
                strategy_type=strategy.strategy_type.value,
                strategy_name=strategy.name,
                total_queries=0
            )

        # Calculate averages
        n = len(results)
        avg_p5 = sum(r.precision_at_5 for r in results) / n
        avg_p10 = sum(r.precision_at_10 for r in results) / n
        avg_recall = sum(r.recall for r in results) / n
        avg_mrr = sum(r.mrr for r in results) / n
        avg_ndcg = sum(r.ndcg for r in results) / n
        avg_latency = sum(r.latency_ms for r in results) / n

        # Calculate p95 latency
        latencies = sorted([r.latency_ms for r in results])
        p95_idx = int(0.95 * len(latencies))
        p95_latency = latencies[min(p95_idx, len(latencies) - 1)]

        # Calculate per-type metrics
        type_summaries = {}
        for qtype, type_metrics in metrics_by_type.items():
            n_type = len(type_metrics)
            type_summaries[qtype] = {
                "count": n_type,
                "avg_precision_at_5": sum(m["precision_at_5"] for m in type_metrics) / n_type,
                "avg_recall": sum(m["recall"] for m in type_metrics) / n_type,
                "avg_mrr": sum(m["mrr"] for m in type_metrics) / n_type,
                "avg_latency_ms": sum(m["latency_ms"] for m in type_metrics) / n_type
            }

        return StrategyEvaluationSummary(
            strategy_type=strategy.strategy_type.value,
            strategy_name=strategy.name,
            total_queries=n,
            avg_precision_at_5=avg_p5,
            avg_precision_at_10=avg_p10,
            avg_recall=avg_recall,
            avg_mrr=avg_mrr,
            avg_ndcg=avg_ndcg,
            avg_latency_ms=avg_latency,
            p95_latency_ms=p95_latency,
            metrics_by_query_type=type_summaries,
            individual_results=results
        )

    async def ab_test(
        self,
        strategy_a: RAGStrategyType,
        strategy_b: RAGStrategyType,
        agent_id: UUID,
        session_id: UUID,
        limit: Optional[int] = None
    ) -> ABTestResult:
        """
        Run A/B test between two strategies

        Args:
            strategy_a: First strategy (control)
            strategy_b: Second strategy (treatment)
            agent_id: Agent ID for queries
            session_id: Session ID for queries
            limit: Optional limit on queries

        Returns:
            ABTestResult with comparison
        """
        # Evaluate both strategies
        summary_a = await self.evaluate_strategy(strategy_a, agent_id, session_id, limit)
        summary_b = await self.evaluate_strategy(strategy_b, agent_id, session_id, limit)

        # Calculate improvements (B vs A)
        def safe_improvement(a_val: float, b_val: float) -> float:
            if a_val == 0:
                return 0.0 if b_val == 0 else 1.0
            return (b_val - a_val) / a_val

        precision_imp = safe_improvement(summary_a.avg_precision_at_5, summary_b.avg_precision_at_5)
        recall_imp = safe_improvement(summary_a.avg_recall, summary_b.avg_recall)
        mrr_imp = safe_improvement(summary_a.avg_mrr, summary_b.avg_mrr)
        latency_change = safe_improvement(summary_a.avg_latency_ms, summary_b.avg_latency_ms)

        # Determine winner (based on MRR as primary metric)
        winner = strategy_b.value if summary_b.avg_mrr > summary_a.avg_mrr else strategy_a.value

        # TODO: Add statistical significance testing (t-test or Mann-Whitney)
        is_significant = False
        p_value = 1.0

        result = ABTestResult(
            test_id=str(uuid4()),
            strategy_a=strategy_a.value,
            strategy_b=strategy_b.value,
            total_queries=summary_a.total_queries,
            winner=winner,
            precision_improvement=precision_imp,
            recall_improvement=recall_imp,
            mrr_improvement=mrr_imp,
            latency_change=latency_change,
            is_significant=is_significant,
            p_value=p_value,
            strategy_a_summary=summary_a,
            strategy_b_summary=summary_b
        )

        logger.info(
            "ab_test_complete",
            strategy_a=strategy_a.value,
            strategy_b=strategy_b.value,
            winner=winner,
            precision_improvement=f"{precision_imp:.2%}",
            mrr_improvement=f"{mrr_imp:.2%}"
        )

        return result

    async def benchmark_all_strategies(
        self,
        agent_id: UUID,
        session_id: UUID,
        limit: Optional[int] = None
    ) -> Dict[str, StrategyEvaluationSummary]:
        """
        Benchmark all registered strategies

        Returns:
            Dict mapping strategy type to evaluation summary
        """
        results = {}

        for strategy in self.strategy_registry.list_strategies():
            try:
                summary = await self.evaluate_strategy(
                    strategy.strategy_type,
                    agent_id,
                    session_id,
                    limit
                )
                results[strategy.strategy_type.value] = summary
            except Exception as e:
                logger.error(
                    "strategy_benchmark_failed",
                    strategy=strategy.strategy_type.value,
                    error=str(e)
                )

        # Log comparison
        if results:
            best_mrr = max(results.values(), key=lambda s: s.avg_mrr)
            best_precision = max(results.values(), key=lambda s: s.avg_precision_at_5)
            fastest = min(results.values(), key=lambda s: s.avg_latency_ms)

            logger.info(
                "benchmark_complete",
                strategies_tested=len(results),
                best_mrr=best_mrr.strategy_type,
                best_precision=best_precision.strategy_type,
                fastest=fastest.strategy_type
            )

        return results

    def export_results(
        self,
        summary: StrategyEvaluationSummary,
        filepath: str = None
    ) -> str:
        """Export evaluation results to JSON"""
        data = {
            "strategy_type": summary.strategy_type,
            "strategy_name": summary.strategy_name,
            "total_queries": summary.total_queries,
            "metrics": {
                "avg_precision_at_5": summary.avg_precision_at_5,
                "avg_precision_at_10": summary.avg_precision_at_10,
                "avg_recall": summary.avg_recall,
                "avg_mrr": summary.avg_mrr,
                "avg_ndcg": summary.avg_ndcg,
                "avg_latency_ms": summary.avg_latency_ms,
                "p95_latency_ms": summary.p95_latency_ms
            },
            "metrics_by_query_type": summary.metrics_by_query_type,
            "individual_results": [asdict(r) for r in summary.individual_results]
        }

        json_str = json.dumps(data, indent=2)

        if filepath:
            with open(filepath, "w") as f:
                f.write(json_str)

        return json_str


# ============================================================================
# Sample Evaluation Dataset
# ============================================================================

def get_sample_evaluation_queries() -> List[Dict]:
    """
    Get sample evaluation queries for digital health domain

    These should be replaced with real evaluation data
    """
    return [
        {
            "query": "What are the FDA requirements for AI/ML medical device submission?",
            "expected_doc_ids": [],  # Fill with actual doc IDs
            "query_type": "regulatory",
            "difficulty": "medium"
        },
        {
            "query": "How does HIPAA apply to telemedicine platforms?",
            "expected_doc_ids": [],
            "query_type": "regulatory",
            "difficulty": "medium"
        },
        {
            "query": "What are the key components of a digital health startup pitch deck?",
            "expected_doc_ids": [],
            "query_type": "startup",
            "difficulty": "easy"
        },
        {
            "query": "Compare randomized controlled trials vs real-world evidence for DTx",
            "expected_doc_ids": [],
            "query_type": "clinical",
            "difficulty": "hard"
        },
        {
            "query": "What is the difference between Class I and Class II medical devices?",
            "expected_doc_ids": [],
            "query_type": "regulatory",
            "difficulty": "easy"
        },
        {
            "query": "How do I design a clinical study for a mental health app?",
            "expected_doc_ids": [],
            "query_type": "clinical",
            "difficulty": "hard"
        },
        {
            "query": "What are best practices for remote patient monitoring?",
            "expected_doc_ids": [],
            "query_type": "clinical",
            "difficulty": "medium"
        },
        {
            "query": "How to achieve SOC 2 compliance for a health tech company?",
            "expected_doc_ids": [],
            "query_type": "regulatory",
            "difficulty": "medium"
        },
        {
            "query": "What is the reimbursement landscape for digital therapeutics?",
            "expected_doc_ids": [],
            "query_type": "startup",
            "difficulty": "hard"
        },
        {
            "query": "How does interoperability work with FHIR and HL7?",
            "expected_doc_ids": [],
            "query_type": "technical",
            "difficulty": "hard"
        }
    ]


# Factory function
def get_evaluation_harness(graphrag_service=None) -> RAGEvaluationHarness:
    """Get evaluation harness instance"""
    return RAGEvaluationHarness(graphrag_service)
