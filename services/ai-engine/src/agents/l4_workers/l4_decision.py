"""
VITAL Path AI Services - VITAL L4 Decision Making Workers

Decision Making Workers: Decision Tree Builder, Multi-Criteria Analyzer,
Risk-Benefit Assessor, Scenario Evaluator, Consensus Builder
5 workers for structured decision support tasks.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: DecisionL4Worker
- Factory: create_decision_worker(worker_key)
"""

from typing import Dict, Any, List
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory
import structlog

logger = structlog.get_logger()


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
DECISION_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "decision_tree_builder": WorkerConfig(
        id="L4-DTB",
        name="Decision Tree Builder",
        description="Build and analyze decision trees for clinical and business decisions",
        category=WorkerCategory.DECISION_MAKING,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator", "r_stats", "pubmed"
        ],
        task_types=[
            "build_decision_tree", "calculate_expected_value",
            "sensitivity_analysis", "tornado_diagram",
            "identify_optimal_path", "rollback_analysis"
        ],
    ),

    "multi_criteria_analyzer": WorkerConfig(
        id="L4-MCA",
        name="Multi-Criteria Analyzer",
        description="Perform multi-criteria decision analysis (MCDA)",
        category=WorkerCategory.DECISION_MAKING,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator"
        ],
        task_types=[
            "weight_criteria", "score_alternatives", "calculate_weighted_scores",
            "sensitivity_to_weights", "rank_alternatives", "visualize_tradeoffs"
        ],
    ),

    "risk_benefit_assessor": WorkerConfig(
        id="L4-RBA",
        name="Risk-Benefit Assessor",
        description="Assess risk-benefit balance for treatments and decisions",
        category=WorkerCategory.DECISION_MAKING,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "pubmed", "openfda", "cochrane", "calculator"
        ],
        task_types=[
            "quantify_benefits", "quantify_risks", "calculate_nnt_nnh",
            "incremental_analysis", "patient_preference_elicitation",
            "regulatory_benefit_risk"
        ],
    ),

    "scenario_evaluator": WorkerConfig(
        id="L4-SCE",
        name="Scenario Evaluator",
        description="Evaluate multiple scenarios and their outcomes",
        category=WorkerCategory.DECISION_MAKING,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator", "r_stats"
        ],
        task_types=[
            "define_scenarios", "estimate_probabilities",
            "calculate_outcomes", "monte_carlo_simulation",
            "best_worst_case", "probabilistic_analysis"
        ],
    ),

    "consensus_builder": WorkerConfig(
        id="L4-CNS",
        name="Consensus Builder",
        description="Facilitate structured consensus building",
        category=WorkerCategory.DECISION_MAKING,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator"
        ],
        task_types=[
            "aggregate_opinions", "delphi_round", "identify_agreement",
            "highlight_disagreements", "convergence_analysis",
            "nominal_group_technique"
        ],
    ),
}


class DecisionL4Worker(L4BaseWorker):
    """L4 Worker class for decision making tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in DECISION_WORKER_CONFIGS:
            raise ValueError(f"Unknown decision worker: {worker_key}")
        
        config = DECISION_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        """Route to appropriate task handler."""
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_build_decision_tree(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Build a decision tree structure."""
        decision_name = params.get("name", "")
        alternatives = params.get("alternatives", [])
        
        tree = {
            "name": decision_name,
            "type": "decision",
            "branches": [],
        }
        
        for alt in alternatives:
            branch = {
                "name": alt.get("name"),
                "type": "chance" if alt.get("has_uncertainty", True) else "terminal",
                "probability": alt.get("probability", 1.0),
                "outcomes": [],
            }
            
            for outcome in alt.get("outcomes", []):
                branch["outcomes"].append({
                    "name": outcome.get("name"),
                    "probability": outcome.get("probability", 0),
                    "value": outcome.get("value", 0),
                    "expected_value": outcome.get("probability", 0) * outcome.get("value", 0),
                })
            
            # Calculate branch expected value
            branch["expected_value"] = sum(o["expected_value"] for o in branch["outcomes"])
            tree["branches"].append(branch)
        
        # Identify optimal path
        if tree["branches"]:
            optimal = max(tree["branches"], key=lambda x: x["expected_value"])
            tree["optimal_decision"] = optimal["name"]
            tree["optimal_expected_value"] = optimal["expected_value"]
        
        return tree
    
    async def _task_weight_criteria(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Weight criteria for MCDA."""
        criteria = params.get("criteria", [])
        method = params.get("method", "swing")
        
        if not criteria:
            return {"error": "No criteria provided"}
        
        # Normalize weights
        total_weight = sum(c.get("raw_weight", 1) for c in criteria)
        
        weighted_criteria = []
        for criterion in criteria:
            raw_weight = criterion.get("raw_weight", 1)
            normalized_weight = raw_weight / total_weight if total_weight > 0 else 1 / len(criteria)
            
            weighted_criteria.append({
                "name": criterion.get("name"),
                "raw_weight": raw_weight,
                "normalized_weight": round(normalized_weight, 4),
                "direction": criterion.get("direction", "maximize"),
            })
        
        return {
            "method": method,
            "criteria_count": len(criteria),
            "weighted_criteria": weighted_criteria,
            "weights_sum": round(sum(c["normalized_weight"] for c in weighted_criteria), 4),
        }
    
    async def _task_score_alternatives(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Score alternatives against weighted criteria."""
        alternatives = params.get("alternatives", [])
        criteria = params.get("criteria", [])
        
        results = []
        for alt in alternatives:
            scores = alt.get("scores", {})
            weighted_score = 0
            
            score_breakdown = []
            for criterion in criteria:
                criterion_name = criterion.get("name")
                weight = criterion.get("normalized_weight", 0)
                raw_score = scores.get(criterion_name, 0)
                weighted = raw_score * weight
                weighted_score += weighted
                
                score_breakdown.append({
                    "criterion": criterion_name,
                    "raw_score": raw_score,
                    "weight": weight,
                    "weighted_score": round(weighted, 4),
                })
            
            results.append({
                "alternative": alt.get("name"),
                "total_weighted_score": round(weighted_score, 4),
                "score_breakdown": score_breakdown,
            })
        
        # Rank alternatives
        results.sort(key=lambda x: x["total_weighted_score"], reverse=True)
        for i, r in enumerate(results):
            r["rank"] = i + 1
        
        return {
            "alternatives_count": len(alternatives),
            "criteria_count": len(criteria),
            "ranked_results": results,
            "recommended": results[0]["alternative"] if results else None,
        }
    
    async def _task_calculate_nnt_nnh(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate NNT and NNH for risk-benefit."""
        treatment_benefit_rate = params.get("treatment_benefit_rate", 0)
        control_benefit_rate = params.get("control_benefit_rate", 0)
        treatment_harm_rate = params.get("treatment_harm_rate", 0)
        control_harm_rate = params.get("control_harm_rate", 0)
        
        # Absolute risk reduction (benefit)
        arr = treatment_benefit_rate - control_benefit_rate
        nnt = 1 / arr if arr != 0 else float('inf')
        
        # Absolute risk increase (harm)
        ari = treatment_harm_rate - control_harm_rate
        nnh = 1 / ari if ari != 0 else float('inf')
        
        # Likelihood to be helped vs harmed
        lhh = abs(nnh / nnt) if nnt != float('inf') and nnh != float('inf') and nnt != 0 else None
        
        return {
            "benefit_analysis": {
                "treatment_rate": treatment_benefit_rate,
                "control_rate": control_benefit_rate,
                "absolute_risk_reduction": round(arr, 4),
                "nnt": round(nnt, 1) if nnt != float('inf') else "Not calculable",
            },
            "harm_analysis": {
                "treatment_rate": treatment_harm_rate,
                "control_rate": control_harm_rate,
                "absolute_risk_increase": round(ari, 4),
                "nnh": round(nnh, 1) if nnh != float('inf') else "Not calculable",
            },
            "likelihood_helped_vs_harmed": round(lhh, 2) if lhh else "Not calculable",
            "interpretation": self._interpret_nnt_nnh(nnt, nnh),
        }
    
    def _interpret_nnt_nnh(self, nnt: float, nnh: float) -> str:
        """Interpret NNT/NNH ratio."""
        if nnt == float('inf'):
            return "No significant benefit detected"
        if nnh == float('inf'):
            return f"Favorable: NNT={round(nnt,1)}, no significant harm"
        if nnh > nnt:
            return f"Favorable benefit-risk: {round(nnh/nnt, 1)} patients helped for each harmed"
        if nnt > nnh:
            return f"Unfavorable benefit-risk: {round(nnt/nnh, 1)} patients harmed for each helped"
        return "Balanced benefit-risk profile"
    
    async def _task_monte_carlo_simulation(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Run Monte Carlo simulation."""
        variables = params.get("variables", [])
        iterations = params.get("iterations", 1000)
        
        import random
        
        results = []
        for _ in range(iterations):
            sampled_values = {}
            for var in variables:
                dist = var.get("distribution", "uniform")
                if dist == "uniform":
                    value = random.uniform(var.get("min", 0), var.get("max", 1))
                elif dist == "normal":
                    value = random.gauss(var.get("mean", 0), var.get("std", 1))
                elif dist == "triangular":
                    value = random.triangular(var.get("min", 0), var.get("max", 1), var.get("mode", 0.5))
                else:
                    value = var.get("value", 0)
                
                sampled_values[var.get("name")] = value
            
            # Calculate outcome (simplified - would use formula in real implementation)
            outcome = sum(sampled_values.values())
            results.append(outcome)
        
        # Calculate statistics
        results.sort()
        mean = sum(results) / len(results)
        median = results[len(results) // 2]
        p5 = results[int(len(results) * 0.05)]
        p95 = results[int(len(results) * 0.95)]
        
        return {
            "iterations": iterations,
            "variables": len(variables),
            "statistics": {
                "mean": round(mean, 4),
                "median": round(median, 4),
                "min": round(min(results), 4),
                "max": round(max(results), 4),
                "percentile_5": round(p5, 4),
                "percentile_95": round(p95, 4),
            },
        }
    
    async def _task_aggregate_opinions(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Aggregate expert opinions for consensus."""
        opinions = params.get("opinions", [])
        question = params.get("question", "")
        
        if not opinions:
            return {"error": "No opinions provided"}
        
        # Extract numeric values if present
        numeric_opinions = [o.get("value") for o in opinions if isinstance(o.get("value"), (int, float))]
        
        result = {
            "question": question,
            "total_respondents": len(opinions),
        }
        
        if numeric_opinions:
            mean = sum(numeric_opinions) / len(numeric_opinions)
            variance = sum((x - mean) ** 2 for x in numeric_opinions) / len(numeric_opinions)
            std = variance ** 0.5
            
            result["numeric_analysis"] = {
                "mean": round(mean, 4),
                "median": sorted(numeric_opinions)[len(numeric_opinions) // 2],
                "std": round(std, 4),
                "range": [min(numeric_opinions), max(numeric_opinions)],
                "coefficient_of_variation": round(std / mean * 100, 2) if mean != 0 else None,
            }
            
            # Assess consensus
            cv = std / mean * 100 if mean != 0 else 100
            if cv < 15:
                consensus = "Strong consensus"
            elif cv < 30:
                consensus = "Moderate consensus"
            else:
                consensus = "Low consensus - consider another round"
            
            result["consensus_level"] = consensus
        
        return result
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task handler."""
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_decision_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> DecisionL4Worker:
    return DecisionL4Worker(worker_key, l5_tools)

DECISION_WORKER_KEYS = list(DECISION_WORKER_CONFIGS.keys())
