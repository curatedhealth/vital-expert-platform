"""
VITAL Path AI Services - VITAL L4 Innovation Workers

Innovation Workers: Trend Scanner, Technology Assessor,
Innovation Portfolio Manager, Disruption Analyzer, Venture Scout
5 workers for innovation management and technology scouting tasks.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: InnovationL4Worker
- Factory: create_innovation_worker(worker_key)
"""

from typing import Dict, Any, List
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory
import structlog

logger = structlog.get_logger()


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
INNOVATION_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "trend_scanner": WorkerConfig(
        id="L4-TRS",
        name="Trend Scanner",
        description="Scan and analyze emerging trends in healthcare and pharma",
        category=WorkerCategory.INNOVATION,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "pubmed", "arxiv", "clinicaltrials", "web_search", "google_scholar"
        ],
        task_types=[
            "scan_technology_trends", "scan_scientific_trends", "horizon_scanning",
            "weak_signal_detection", "trend_impact_assessment", "megatrend_analysis",
            "innovation_radar", "future_scenarios"
        ],
    ),

    "technology_assessor": WorkerConfig(
        id="L4-TCA",
        name="Technology Assessor",
        description="Assess emerging technologies for strategic fit",
        category=WorkerCategory.INNOVATION,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "pubmed", "arxiv", "clinicaltrials", "web_search"
        ],
        task_types=[
            "technology_readiness", "strategic_fit_assessment", "build_buy_partner",
            "technology_landscape", "platform_evaluation", "ip_landscape",
            "competitor_technology_watch", "technology_roadmap"
        ],
    ),

    "innovation_portfolio_manager": WorkerConfig(
        id="L4-IPM",
        name="Innovation Portfolio Manager",
        description="Manage and optimize innovation portfolios",
        category=WorkerCategory.INNOVATION,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator"
        ],
        task_types=[
            "portfolio_balance", "stage_gate_assessment", "resource_allocation",
            "project_prioritization", "innovation_metrics", "portfolio_risk",
            "horizon_mapping", "kill_criteria_evaluation"
        ],
    ),

    "disruption_analyzer": WorkerConfig(
        id="L4-DIS",
        name="Disruption Analyzer",
        description="Analyze potential disruptions and competitive threats",
        category=WorkerCategory.INNOVATION,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "web_search", "pubmed", "clinicaltrials"
        ],
        task_types=[
            "disruption_mapping", "competitive_threat_assessment", "new_entrant_analysis",
            "business_model_innovation", "value_chain_disruption", "scenario_planning",
            "response_strategy", "disruption_playbook"
        ],
    ),

    "venture_scout": WorkerConfig(
        id="L4-VSC",
        name="Venture Scout",
        description="Scout and evaluate startup and venture opportunities",
        category=WorkerCategory.INNOVATION,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "web_search", "clinicaltrials", "pubmed"
        ],
        task_types=[
            "startup_landscape", "due_diligence_prep", "investment_thesis",
            "partnership_screening", "accelerator_scouting", "ecosystem_mapping",
            "deal_flow_analysis", "strategic_fit_scoring"
        ],
    ),
}


class InnovationL4Worker(L4BaseWorker):
    """L4 Worker class for innovation management tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in INNOVATION_WORKER_CONFIGS:
            raise ValueError(f"Unknown innovation worker: {worker_key}")
        
        config = INNOVATION_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        """Route to appropriate task handler."""
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_scan_technology_trends(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Scan emerging technology trends."""
        domain = params.get("domain", "healthcare")
        time_horizon = params.get("time_horizon", "3-5 years")
        
        # Search recent publications and preprints
        pubmed_result = await self.call_l5_tool("pubmed", {
            "query": f"{domain} emerging technology innovation",
            "max_results": 50,
            "date_range": "2y",
        })
        
        arxiv_result = await self.call_l5_tool("arxiv", {
            "query": f"{domain} AI machine learning",
            "max_results": 30,
        })
        
        # Categorize trends
        trend_categories = {
            "ai_ml": {
                "name": "AI & Machine Learning",
                "signals": ["deep learning", "NLP", "computer vision", "predictive analytics"],
                "maturity": "early_majority",
            },
            "digital_therapeutics": {
                "name": "Digital Therapeutics",
                "signals": ["DTx", "digital therapy", "prescription digital"],
                "maturity": "early_adopters",
            },
            "precision_medicine": {
                "name": "Precision Medicine",
                "signals": ["biomarker", "personalized", "genomics", "companion diagnostic"],
                "maturity": "early_majority",
            },
            "decentralized_trials": {
                "name": "Decentralized Clinical Trials",
                "signals": ["DCT", "remote monitoring", "virtual trial", "hybrid trial"],
                "maturity": "early_adopters",
            },
            "real_world_data": {
                "name": "Real-World Data & Evidence",
                "signals": ["RWD", "RWE", "pragmatic trial", "EHR"],
                "maturity": "early_majority",
            },
        }
        
        return {
            "domain": domain,
            "time_horizon": time_horizon,
            "trend_categories": trend_categories,
            "sources_analyzed": {
                "pubmed_articles": len(pubmed_result.get("data", {}).get("articles", [])),
                "arxiv_preprints": len(arxiv_result.get("data", {}).get("papers", [])),
            },
            "recommendations": [
                "Prioritize trends in early_majority stage for near-term investment",
                "Monitor early_adopters trends for strategic positioning",
                "Build capabilities in AI/ML as foundational enabler",
            ],
        }
    
    async def _task_technology_readiness(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Assess Technology Readiness Level (TRL)."""
        technology = params.get("technology", "")
        evidence = params.get("evidence", {})
        
        # TRL definitions adapted for pharma/healthcare
        trl_definitions = {
            1: "Basic principles observed and reported",
            2: "Technology concept formulated",
            3: "Proof of concept demonstrated in lab",
            4: "Technology validated in laboratory",
            5: "Technology validated in relevant environment (preclinical)",
            6: "Technology demonstrated in relevant environment (early clinical)",
            7: "System prototype demonstration (Phase 2/3)",
            8: "System complete and qualified (Phase 3/regulatory)",
            9: "Actual system proven in operational environment (commercial)",
        }
        
        # Score based on evidence
        trl_score = 1
        
        if evidence.get("basic_research"):
            trl_score = max(trl_score, 1)
        if evidence.get("concept_formulated"):
            trl_score = max(trl_score, 2)
        if evidence.get("poc_lab"):
            trl_score = max(trl_score, 3)
        if evidence.get("validated_lab"):
            trl_score = max(trl_score, 4)
        if evidence.get("preclinical"):
            trl_score = max(trl_score, 5)
        if evidence.get("phase1"):
            trl_score = max(trl_score, 6)
        if evidence.get("phase2_3"):
            trl_score = max(trl_score, 7)
        if evidence.get("phase3_regulatory"):
            trl_score = max(trl_score, 8)
        if evidence.get("commercial"):
            trl_score = max(trl_score, 9)
        
        return {
            "technology": technology,
            "trl_score": trl_score,
            "trl_description": trl_definitions[trl_score],
            "evidence_provided": evidence,
            "next_milestone": trl_definitions.get(trl_score + 1, "Fully mature"),
            "risk_level": "High" if trl_score <= 3 else "Medium" if trl_score <= 6 else "Low",
        }
    
    async def _task_portfolio_balance(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze innovation portfolio balance."""
        projects = params.get("projects", [])
        
        if not projects:
            return {"error": "No projects provided"}
        
        # Categorize by horizon
        horizons = {"h1": [], "h2": [], "h3": []}
        risk_levels = {"low": 0, "medium": 0, "high": 0}
        
        for project in projects:
            horizon = project.get("horizon", "h1")
            risk = project.get("risk", "medium")
            
            if horizon in horizons:
                horizons[horizon].append(project.get("name"))
            
            risk_levels[risk] = risk_levels.get(risk, 0) + 1
        
        # Calculate balance metrics
        total = len(projects)
        balance = {
            "horizon_distribution": {
                "h1_core": len(horizons["h1"]) / total * 100 if total else 0,
                "h2_adjacent": len(horizons["h2"]) / total * 100 if total else 0,
                "h3_transformational": len(horizons["h3"]) / total * 100 if total else 0,
            },
            "risk_distribution": {
                "low": risk_levels["low"] / total * 100 if total else 0,
                "medium": risk_levels["medium"] / total * 100 if total else 0,
                "high": risk_levels["high"] / total * 100 if total else 0,
            },
        }
        
        # Recommendations based on 70-20-10 rule
        recommendations = []
        h1_pct = balance["horizon_distribution"]["h1_core"]
        h2_pct = balance["horizon_distribution"]["h2_adjacent"]
        h3_pct = balance["horizon_distribution"]["h3_transformational"]
        
        if h1_pct > 80:
            recommendations.append("Consider increasing H2/H3 investments for future growth")
        if h3_pct < 5:
            recommendations.append("Portfolio may lack transformational bets")
        if h3_pct > 20:
            recommendations.append("High transformational allocation - ensure adequate risk management")
        
        return {
            "total_projects": total,
            "projects_by_horizon": horizons,
            "balance_analysis": balance,
            "target_allocation": {"h1": "70%", "h2": "20%", "h3": "10%"},
            "recommendations": recommendations,
        }
    
    async def _task_disruption_mapping(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Map potential disruptions in a sector."""
        sector = params.get("sector", "pharmaceutical")
        current_model = params.get("current_model", "")
        
        disruption_vectors = {
            "business_model": {
                "name": "Business Model Innovation",
                "examples": [
                    "Subscription/outcomes-based pricing",
                    "Platform business models",
                    "Direct-to-consumer models",
                ],
                "threat_level": "high",
            },
            "technology": {
                "name": "Technological Disruption",
                "examples": [
                    "AI-driven drug discovery",
                    "Gene therapy/cell therapy",
                    "Digital therapeutics",
                ],
                "threat_level": "high",
            },
            "regulatory": {
                "name": "Regulatory Change",
                "examples": [
                    "Accelerated approval pathways",
                    "RWE for regulatory decisions",
                    "International harmonization",
                ],
                "threat_level": "medium",
            },
            "new_entrants": {
                "name": "New Market Entrants",
                "examples": [
                    "Big Tech (Google, Amazon, Apple)",
                    "Well-funded biotech startups",
                    "Generic/biosimilar manufacturers",
                ],
                "threat_level": "high",
            },
            "customer_expectations": {
                "name": "Changing Customer Expectations",
                "examples": [
                    "Patient empowerment and consumerism",
                    "Demand for transparency",
                    "Value-based healthcare",
                ],
                "threat_level": "medium",
            },
        }
        
        return {
            "sector": sector,
            "current_model": current_model,
            "disruption_vectors": disruption_vectors,
            "highest_threats": [k for k, v in disruption_vectors.items() if v["threat_level"] == "high"],
            "strategic_responses": [
                "Build internal innovation capabilities",
                "Establish venture/partnership programs",
                "Develop scenario-based strategies",
                "Invest in digital transformation",
            ],
        }
    
    async def _task_startup_landscape(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Map startup landscape in a therapeutic area."""
        therapeutic_area = params.get("therapeutic_area", "")
        technology_focus = params.get("technology_focus", [])
        
        # Search for clinical trials from startups
        trials_result = await self.call_l5_tool("clinicaltrials", {
            "query": therapeutic_area,
            "sponsor_type": "industry",
        })
        
        landscape_categories = {
            "discovery": {
                "stage": "Early Discovery",
                "typical_funding": "$5M-$20M",
                "partnership_type": "Research collaboration",
            },
            "preclinical": {
                "stage": "Preclinical",
                "typical_funding": "$20M-$50M",
                "partnership_type": "Option/license",
            },
            "phase1": {
                "stage": "Phase 1",
                "typical_funding": "$50M-$150M",
                "partnership_type": "Co-development",
            },
            "phase2_plus": {
                "stage": "Phase 2+",
                "typical_funding": "$150M+",
                "partnership_type": "Acquisition/major partnership",
            },
        }
        
        return {
            "therapeutic_area": therapeutic_area,
            "technology_focus": technology_focus,
            "landscape_categories": landscape_categories,
            "screening_criteria": [
                "Scientific differentiation",
                "IP position",
                "Team experience",
                "Clinical data quality",
                "Strategic fit",
                "Valuation reasonableness",
            ],
            "deal_structures": [
                "Equity investment",
                "Option to acquire",
                "License agreement",
                "Research collaboration",
                "Joint venture",
            ],
        }
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task handler."""
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_innovation_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> InnovationL4Worker:
    return InnovationL4Worker(worker_key, l5_tools)

INNOVATION_WORKER_KEYS = list(INNOVATION_WORKER_CONFIGS.keys())
