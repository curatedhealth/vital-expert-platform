"""
VITAL Path AI Services - VITAL L4 Design Thinking Workers

Design Thinking & Service Design Workers: User Researcher, Journey Mapper,
Ideation Facilitator, Prototype Evaluator, Service Blueprint Builder
5 workers for human-centered design and service innovation tasks.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: DesignThinkingL4Worker
- Factory: create_design_thinking_worker(worker_key)
"""

from typing import Dict, Any, List
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory
import structlog

logger = structlog.get_logger()


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
DESIGN_THINKING_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "user_researcher": WorkerConfig(
        id="L4-USR",
        name="User Researcher",
        description="Conduct and synthesize user research for healthcare solutions",
        category=WorkerCategory.DESIGN_THINKING,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "pubmed", "web_search"
        ],
        task_types=[
            "create_interview_guide", "synthesize_interviews", "identify_personas",
            "map_user_needs", "analyze_pain_points", "create_empathy_map",
            "stakeholder_analysis", "contextual_inquiry_planning"
        ],
    ),

    "journey_mapper": WorkerConfig(
        id="L4-JMP",
        name="Journey Mapper",
        description="Map patient and user journeys across touchpoints",
        category=WorkerCategory.DESIGN_THINKING,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "web_search"
        ],
        task_types=[
            "map_patient_journey", "map_hcp_journey", "identify_touchpoints",
            "analyze_moments_of_truth", "find_opportunity_spaces",
            "map_emotional_journey", "cross_channel_mapping"
        ],
    ),

    "ideation_facilitator": WorkerConfig(
        id="L4-IDF",
        name="Ideation Facilitator",
        description="Facilitate ideation sessions and creative problem solving",
        category=WorkerCategory.DESIGN_THINKING,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "web_search", "pubmed"
        ],
        task_types=[
            "generate_how_might_we", "brainstorm_solutions", "crazy_eights",
            "concept_clustering", "idea_prioritization", "design_sprint_planning",
            "innovation_workshop_design", "creative_matrix"
        ],
    ),

    "prototype_evaluator": WorkerConfig(
        id="L4-PTE",
        name="Prototype Evaluator",
        description="Evaluate prototypes and gather feedback",
        category=WorkerCategory.DESIGN_THINKING,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "calculator"
        ],
        task_types=[
            "create_test_plan", "analyze_usability_results", "synthesize_feedback",
            "calculate_sus_score", "heuristic_evaluation", "a_b_test_analysis",
            "accessibility_assessment", "prototype_iteration_recommendations"
        ],
    ),

    "service_blueprint_builder": WorkerConfig(
        id="L4-SBB",
        name="Service Blueprint Builder",
        description="Create service blueprints and ecosystem maps",
        category=WorkerCategory.DESIGN_THINKING,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "web_search"
        ],
        task_types=[
            "create_service_blueprint", "map_frontstage_backstage",
            "identify_support_processes", "map_ecosystem", "value_chain_analysis",
            "service_concept_design", "touchpoint_optimization"
        ],
    ),
}


class DesignThinkingL4Worker(L4BaseWorker):
    """L4 Worker class for design thinking and service design tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in DESIGN_THINKING_WORKER_CONFIGS:
            raise ValueError(f"Unknown design thinking worker: {worker_key}")
        
        config = DESIGN_THINKING_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        """Route to appropriate task handler."""
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_create_empathy_map(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create empathy map for a user persona."""
        persona_name = params.get("persona_name", "")
        context = params.get("context", "")
        insights = params.get("insights", {})
        
        empathy_map = {
            "persona": persona_name,
            "context": context,
            "says": insights.get("says", [
                "[What does the user say out loud?]",
                "[Direct quotes from interviews]",
            ]),
            "thinks": insights.get("thinks", [
                "[What might they be thinking?]",
                "[Beliefs and assumptions]",
            ]),
            "does": insights.get("does", [
                "[Observable behaviors]",
                "[Actions taken]",
            ]),
            "feels": insights.get("feels", [
                "[Emotional state]",
                "[Frustrations and delights]",
            ]),
            "pains": insights.get("pains", [
                "[Challenges faced]",
                "[Obstacles to goals]",
            ]),
            "gains": insights.get("gains", [
                "[Desired outcomes]",
                "[Success metrics]",
            ]),
        }
        
        return {
            "empathy_map": empathy_map,
            "key_insights": self._extract_key_insights(insights),
            "design_opportunities": [
                "Address pain points through...",
                "Amplify gains by...",
            ],
        }
    
    def _extract_key_insights(self, insights: Dict[str, Any]) -> List[str]:
        """Extract key insights from empathy map data."""
        key_insights = []
        
        if insights.get("pains"):
            key_insights.append(f"Primary pain: {insights['pains'][0] if insights['pains'] else 'Not identified'}")
        if insights.get("gains"):
            key_insights.append(f"Primary gain: {insights['gains'][0] if insights['gains'] else 'Not identified'}")
        
        return key_insights
    
    async def _task_map_patient_journey(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Map patient journey across healthcare experience."""
        condition = params.get("condition", "")
        stages = params.get("stages", ["awareness", "diagnosis", "treatment", "ongoing_care"])
        
        journey_map = {
            "condition": condition,
            "stages": [],
        }
        
        stage_templates = {
            "awareness": {
                "name": "Awareness & Symptoms",
                "activities": ["Noticing symptoms", "Self-research", "Discussing with family"],
                "touchpoints": ["Search engines", "Health websites", "Family/friends"],
                "emotions": ["Concern", "Uncertainty", "Hope"],
                "pain_points": ["Confusing information", "Fear of unknown"],
                "opportunities": ["Clear educational content", "Symptom checker tools"],
            },
            "diagnosis": {
                "name": "Seeking Diagnosis",
                "activities": ["Visiting PCP", "Referrals", "Testing"],
                "touchpoints": ["Primary care", "Specialists", "Labs"],
                "emotions": ["Anxiety", "Frustration", "Relief when diagnosed"],
                "pain_points": ["Wait times", "Multiple appointments", "Unclear next steps"],
                "opportunities": ["Streamlined referrals", "Patient portals"],
            },
            "treatment": {
                "name": "Treatment Decision & Initiation",
                "activities": ["Treatment options discussion", "Insurance navigation", "Starting treatment"],
                "touchpoints": ["Specialist", "Insurance", "Pharmacy", "Infusion center"],
                "emotions": ["Overwhelmed", "Hopeful", "Determined"],
                "pain_points": ["Complex regimens", "Side effects", "Cost concerns"],
                "opportunities": ["Patient support programs", "Digital adherence tools"],
            },
            "ongoing_care": {
                "name": "Ongoing Management",
                "activities": ["Regular check-ups", "Monitoring", "Lifestyle adjustments"],
                "touchpoints": ["Care team", "Lab work", "Digital health tools"],
                "emotions": ["Acceptance", "Vigilance", "Quality of life focus"],
                "pain_points": ["Treatment fatigue", "Coordination challenges"],
                "opportunities": ["Remote monitoring", "Care coordination platforms"],
            },
        }
        
        for stage_key in stages:
            template = stage_templates.get(stage_key, {
                "name": stage_key.replace("_", " ").title(),
                "activities": [],
                "touchpoints": [],
                "emotions": [],
                "pain_points": [],
                "opportunities": [],
            })
            journey_map["stages"].append(template)
        
        return journey_map
    
    async def _task_generate_how_might_we(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate How Might We questions from insights."""
        problem_statement = params.get("problem", "")
        user_needs = params.get("user_needs", [])
        constraints = params.get("constraints", [])
        
        hmw_questions = []
        
        # Generate from problem statement
        if problem_statement:
            hmw_questions.append(f"How might we help users {problem_statement.lower()}?")
        
        # Generate from user needs
        for need in user_needs:
            hmw_questions.extend([
                f"How might we make it easier to {need.lower()}?",
                f"How might we eliminate the need to {need.lower()}?",
                f"How might we make {need.lower()} more enjoyable?",
            ])
        
        # Generate constraint-focused questions
        for constraint in constraints:
            hmw_questions.append(f"How might we achieve this despite {constraint.lower()}?")
        
        return {
            "problem_statement": problem_statement,
            "user_needs": user_needs,
            "constraints": constraints,
            "hmw_questions": hmw_questions,
            "prioritization_criteria": [
                "Impact on user need",
                "Feasibility",
                "Innovation potential",
                "Strategic alignment",
            ],
        }
    
    async def _task_calculate_sus_score(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate System Usability Scale score."""
        responses = params.get("responses", [])
        
        if len(responses) != 10:
            return {"error": "SUS requires exactly 10 responses (1-5 scale)"}
        
        # SUS calculation: odd items (1,3,5,7,9) subtract 1, even items (2,4,6,8,10) subtract from 5
        adjusted_scores = []
        for i, score in enumerate(responses):
            if (i + 1) % 2 == 1:  # Odd items
                adjusted_scores.append(score - 1)
            else:  # Even items
                adjusted_scores.append(5 - score)
        
        sus_score = sum(adjusted_scores) * 2.5
        
        # Interpretation
        if sus_score >= 85:
            grade = "A+"
            interpretation = "Excellent - Best imaginable"
        elif sus_score >= 80:
            grade = "A"
            interpretation = "Excellent"
        elif sus_score >= 70:
            grade = "B"
            interpretation = "Good"
        elif sus_score >= 60:
            grade = "C"
            interpretation = "OK - Marginal"
        elif sus_score >= 50:
            grade = "D"
            interpretation = "Poor"
        else:
            grade = "F"
            interpretation = "Awful - Needs significant improvement"
        
        return {
            "sus_score": round(sus_score, 1),
            "grade": grade,
            "interpretation": interpretation,
            "percentile": self._sus_to_percentile(sus_score),
            "item_analysis": [
                {"item": i+1, "raw": responses[i], "adjusted": adjusted_scores[i]}
                for i in range(10)
            ],
        }
    
    def _sus_to_percentile(self, score: float) -> int:
        """Convert SUS score to percentile."""
        if score >= 90: return 99
        if score >= 85: return 96
        if score >= 80: return 91
        if score >= 75: return 85
        if score >= 70: return 75
        if score >= 65: return 62
        if score >= 60: return 50
        if score >= 55: return 38
        if score >= 50: return 25
        if score >= 45: return 15
        return 5
    
    async def _task_create_service_blueprint(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create service blueprint structure."""
        service_name = params.get("service_name", "")
        stages = params.get("stages", [])
        
        blueprint = {
            "service_name": service_name,
            "stages": [],
        }
        
        for stage in stages:
            blueprint["stages"].append({
                "name": stage.get("name", ""),
                "customer_actions": stage.get("customer_actions", []),
                "frontstage_actions": stage.get("frontstage", []),
                "backstage_actions": stage.get("backstage", []),
                "support_processes": stage.get("support", []),
                "physical_evidence": stage.get("evidence", []),
            })
        
        blueprint["lines"] = {
            "line_of_interaction": "Between customer actions and frontstage",
            "line_of_visibility": "Between frontstage and backstage",
            "line_of_internal_interaction": "Between backstage and support processes",
        }
        
        return blueprint
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task handler."""
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_design_thinking_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> DesignThinkingL4Worker:
    return DesignThinkingL4Worker(worker_key, l5_tools)

DESIGN_THINKING_WORKER_KEYS = list(DESIGN_THINKING_WORKER_CONFIGS.keys())
