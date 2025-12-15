#!/usr/bin/env python3
"""
VITAL Path Agent Router
Intelligent agent selection and routing for optimized query handling

PROMPT 2.3: Agent Selection and Routing
- Intelligent agent matching based on expertise and availability
- Dynamic team formation for complex queries
- Load balancing and performance optimization
- Context-aware routing decisions
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple
from dataclasses import dataclass, field
from enum import Enum
import re
import hashlib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentType(Enum):
    """Available agent types in the VITAL Path ecosystem"""
    REGULATORY_SPECIALIST = "regulatory_specialist"
    CLINICAL_RESEARCHER = "clinical_researcher"
    DIGITAL_HEALTH_EXPERT = "digital_health_expert"
    MARKET_ACCESS_ANALYST = "market_access_analyst"
    MEDICAL_WRITER = "medical_writer"
    BIOSTATISTICIAN = "biostatistician"
    PHARMACOVIGILANCE_EXPERT = "pharmacovigilance_expert"
    HEALTH_ECONOMIST = "health_economist"
    COMPETITIVE_ANALYST = "competitive_analyst"
    STRATEGIC_CONSULTANT = "strategic_consultant"
    GENERALIST = "generalist"

class RoutingStrategy(Enum):
    """Routing strategies for different query types"""
    SINGLE_EXPERT = "single_expert"        # One specialist agent
    COLLABORATIVE_TEAM = "collaborative_team"  # Multiple agents working together
    SEQUENTIAL_PIPELINE = "sequential_pipeline"  # Agents in sequence
    PARALLEL_CONSENSUS = "parallel_consensus"  # Multiple agents, consensus required
    ADVISORY_BOARD = "advisory_board"      # Full board consultation
    ESCALATION_CHAIN = "escalation_chain"  # Hierarchical escalation

class AgentStatus(Enum):
    """Current status of agents"""
    AVAILABLE = "available"
    BUSY = "busy"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"

@dataclass
class AgentCapabilities:
    """Agent capabilities and expertise areas"""
    agent_id: str
    agent_type: AgentType
    expertise_domains: List[str]
    therapeutic_areas: List[str]
    prism_suites: List[str]
    experience_level: int  # 1-10 scale
    language_capabilities: List[str]
    specialized_tools: List[str]
    certification_level: str
    performance_metrics: Dict[str, float]

@dataclass
class AgentWorkload:
    """Current workload and availability metrics"""
    agent_id: str
    current_sessions: int
    max_capacity: int
    average_response_time: float
    queue_length: int
    last_activity: datetime
    status: AgentStatus
    estimated_availability: Optional[datetime] = None

@dataclass
class RoutingDecision:
    """Result of the routing decision process"""
    strategy: RoutingStrategy
    selected_agents: List[str]
    primary_agent: Optional[str]
    backup_agents: List[str]
    estimated_response_time: float
    confidence_score: float
    routing_rationale: str
    team_composition: Dict[str, str]
    expected_workflow: List[str]
    fallback_plan: Optional[str] = None

class AgentRouter:
    """
    Intelligent agent routing system for VITAL Path

    Capabilities:
    - Smart agent matching based on query analysis
    - Dynamic team formation for complex scenarios
    - Load balancing and performance optimization
    - Context-aware routing decisions
    - Real-time availability tracking
    """

    def __init__(self):
        self.agents_registry: Dict[str, AgentCapabilities] = {}
        self.workload_tracker: Dict[str, AgentWorkload] = {}
        self.routing_history: List[Dict[str, Any]] = []
        self.performance_cache: Dict[str, Any] = {}

        # Initialize with default agent configurations
        self._initialize_agent_registry()

    def _initialize_agent_registry(self):
        """Initialize the agent registry with VITAL Path specialists"""

        # Regulatory Specialists
        self.agents_registry["reg_001"] = AgentCapabilities(
            agent_id="reg_001",
            agent_type=AgentType.REGULATORY_SPECIALIST,
            expertise_domains=["fda_guidance", "ema_regulation", "ich_guidelines", "regulatory_strategy"],
            therapeutic_areas=["oncology", "cardiology", "neurology", "digital_therapeutics"],
            prism_suites=["RULES", "GUARD", "PROOF"],
            experience_level=9,
            language_capabilities=["english", "medical_terminology"],
            specialized_tools=["regulatory_database", "guidance_tracker", "submission_optimizer"],
            certification_level="senior",
            performance_metrics={"accuracy": 0.95, "response_time": 120, "satisfaction": 0.92}
        )

        # Clinical Research Specialists
        self.agents_registry["clin_001"] = AgentCapabilities(
            agent_id="clin_001",
            agent_type=AgentType.CLINICAL_RESEARCHER,
            expertise_domains=["clinical_trial_design", "adaptive_trials", "biomarkers", "endpoint_selection"],
            therapeutic_areas=["oncology", "rare_diseases", "digital_health"],
            prism_suites=["TRIALS", "PROOF", "SCOUT"],
            experience_level=8,
            language_capabilities=["english", "statistical_terminology"],
            specialized_tools=["trial_simulator", "biostatistics_engine", "protocol_optimizer"],
            certification_level="senior",
            performance_metrics={"accuracy": 0.93, "response_time": 150, "satisfaction": 0.89}
        )

        # Digital Health Experts
        self.agents_registry["dh_001"] = AgentCapabilities(
            agent_id="dh_001",
            agent_type=AgentType.DIGITAL_HEALTH_EXPERT,
            expertise_domains=["digital_therapeutics", "mhealth", "ai_ml_medical", "digital_biomarkers"],
            therapeutic_areas=["mental_health", "diabetes", "cardiology", "general_wellness"],
            prism_suites=["RULES", "TRIALS", "VALUE", "SCOUT"],
            experience_level=7,
            language_capabilities=["english", "technical_terminology"],
            specialized_tools=["digital_health_analyzer", "app_evaluator", "tech_validator"],
            certification_level="intermediate",
            performance_metrics={"accuracy": 0.91, "response_time": 100, "satisfaction": 0.87}
        )

        # Market Access Specialists
        self.agents_registry["ma_001"] = AgentCapabilities(
            agent_id="ma_001",
            agent_type=AgentType.MARKET_ACCESS_ANALYST,
            expertise_domains=["health_economics", "payer_strategy", "reimbursement", "health_technology_assessment"],
            therapeutic_areas=["oncology", "cardiology", "rare_diseases"],
            prism_suites=["VALUE", "BRIDGE", "SCOUT"],
            experience_level=8,
            language_capabilities=["english", "economic_terminology"],
            specialized_tools=["economic_modeler", "payer_analyzer", "reimbursement_tracker"],
            certification_level="senior",
            performance_metrics={"accuracy": 0.94, "response_time": 180, "satisfaction": 0.91}
        )

        # Medical Writers
        self.agents_registry["mw_001"] = AgentCapabilities(
            agent_id="mw_001",
            agent_type=AgentType.MEDICAL_WRITER,
            expertise_domains=["regulatory_writing", "clinical_documentation", "scientific_communication"],
            therapeutic_areas=["all_areas"],
            prism_suites=["CRAFT", "PROOF", "BRIDGE"],
            experience_level=7,
            language_capabilities=["english", "medical_writing_standards"],
            specialized_tools=["document_analyzer", "compliance_checker", "style_optimizer"],
            certification_level="intermediate",
            performance_metrics={"accuracy": 0.96, "response_time": 200, "satisfaction": 0.94}
        )

        # Generalist Agent (fallback)
        self.agents_registry["gen_001"] = AgentCapabilities(
            agent_id="gen_001",
            agent_type=AgentType.GENERALIST,
            expertise_domains=["general_medical", "basic_regulatory", "general_consulting"],
            therapeutic_areas=["all_areas"],
            prism_suites=["all_suites"],
            experience_level=5,
            language_capabilities=["english"],
            specialized_tools=["general_knowledge_base"],
            certification_level="junior",
            performance_metrics={"accuracy": 0.85, "response_time": 80, "satisfaction": 0.80}
        )

        # Initialize workload tracking
        for agent_id in self.agents_registry.keys():
            self.workload_tracker[agent_id] = AgentWorkload(
                agent_id=agent_id,
                current_sessions=0,
                max_capacity=5,
                average_response_time=120.0,
                queue_length=0,
                last_activity=datetime.now(),
                status=AgentStatus.AVAILABLE
            )

    async def route_query(
        self,
        query: str,
        triage_result: Dict[str, Any],
        user_context: Dict[str, Any],
        session_id: Optional[str] = None
    ) -> RoutingDecision:
        """
        Main routing method - determines optimal agent(s) for query

        Args:
            query: User query text
            triage_result: Output from triage classifier
            user_context: User context and preferences
            session_id: Optional session identifier

        Returns:
            RoutingDecision with selected agents and strategy
        """
        logger.info(f"Starting agent routing for query: {query[:100]}...")

        try:
            # Step 1: Analyze query requirements
            query_requirements = await self._analyze_query_requirements(
                query, triage_result, user_context
            )

            # Step 2: Determine routing strategy
            strategy = await self._determine_routing_strategy(
                query_requirements, triage_result
            )

            # Step 3: Select candidate agents
            candidate_agents = await self._select_candidate_agents(
                query_requirements, strategy
            )

            # Step 4: Apply load balancing and availability filtering
            available_agents = await self._filter_by_availability(
                candidate_agents, strategy
            )

            # Step 5: Optimize agent selection
            selected_agents = await self._optimize_agent_selection(
                available_agents, query_requirements, strategy
            )

            # Step 6: Create routing decision
            routing_decision = await self._create_routing_decision(
                selected_agents, strategy, query_requirements
            )

            # Step 7: Record routing decision
            await self._record_routing_decision(routing_decision, query, session_id)

            logger.info(f"Routing completed: {strategy.value} with {len(selected_agents)} agents")
            return routing_decision

        except Exception as e:
            logger.error(f"Error in query routing: {str(e)}")
            # Fallback to generalist agent
            return await self._create_fallback_routing()

    async def _analyze_query_requirements(
        self,
        query: str,
        triage_result: Dict[str, Any],
        user_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze query to determine agent requirements"""

        requirements = {
            "domains": triage_result.get("domains", []),
            "complexity": triage_result.get("complexity_score", 0.5),
            "urgency": triage_result.get("urgency_level", "standard"),
            "therapeutic_areas": [],
            "prism_suites": [],
            "required_expertise": [],
            "language_requirements": ["english"],
            "specialized_tools": [],
            "team_size_preference": 1
        }

        # Extract therapeutic areas from query
        therapeutic_patterns = {
            "oncology": r"\b(cancer|oncology|tumor|chemotherapy|radiation|immunotherapy)\b",
            "cardiology": r"\b(heart|cardiac|cardiovascular|hypertension|coronary)\b",
            "neurology": r"\b(brain|neuro|alzheimer|parkinson|stroke|epilepsy)\b",
            "diabetes": r"\b(diabetes|diabetic|insulin|glucose|blood sugar)\b",
            "mental_health": r"\b(depression|anxiety|mental health|psychiatry|behavioral)\b",
            "rare_diseases": r"\b(rare disease|orphan drug|ultra-rare|genetic disorder)\b",
            "digital_therapeutics": r"\b(digital therapeutic|dtx|app-based|mobile health|mhealth)\b"
        }

        for area, pattern in therapeutic_patterns.items():
            if re.search(pattern, query, re.IGNORECASE):
                requirements["therapeutic_areas"].append(area)

        # Extract PRISM suite hints
        prism_patterns = {
            "RULES": r"\b(regulatory|fda|ema|approval|submission|compliance)\b",
            "TRIALS": r"\b(clinical trial|study design|protocol|endpoint|biomarker)\b",
            "GUARD": r"\b(safety|adverse event|pharmacovigilance|risk|monitoring)\b",
            "VALUE": r"\b(health economics|cost|reimbursement|payer|hta)\b",
            "BRIDGE": r"\b(stakeholder|communication|engagement|partnership)\b",
            "PROOF": r"\b(evidence|systematic review|meta-analysis|literature)\b",
            "CRAFT": r"\b(writing|document|manuscript|publication|report)\b",
            "SCOUT": r"\b(competitive|market|intelligence|landscape|analysis)\b"
        }

        for suite, pattern in prism_patterns.items():
            if re.search(pattern, query, re.IGNORECASE):
                requirements["prism_suites"].append(suite)

        # Determine team size based on complexity and domains
        if requirements["complexity"] > 0.8 or len(requirements["domains"]) > 2:
            requirements["team_size_preference"] = 3
        elif requirements["complexity"] > 0.6 or len(requirements["domains"]) > 1:
            requirements["team_size_preference"] = 2

        # Map domains to required expertise
        domain_expertise_map = {
            "regulatory_compliance": ["regulatory_strategy", "fda_guidance", "submission_planning"],
            "clinical_research": ["clinical_trial_design", "biostatistics", "endpoint_selection"],
            "digital_health": ["digital_therapeutics", "mhealth", "ai_ml_medical"],
            "market_access": ["health_economics", "payer_strategy", "reimbursement"],
            "medical_writing": ["regulatory_writing", "scientific_communication"],
            "pharmacovigilance": ["safety_monitoring", "adverse_event_analysis"]
        }

        for domain in requirements["domains"]:
            if domain in domain_expertise_map:
                requirements["required_expertise"].extend(domain_expertise_map[domain])

        return requirements

    async def _determine_routing_strategy(
        self,
        requirements: Dict[str, Any],
        triage_result: Dict[str, Any]
    ) -> RoutingStrategy:
        """Determine the optimal routing strategy"""

        complexity = requirements["complexity"]
        domain_count = len(requirements["domains"])
        urgency = requirements["urgency"]
        team_size = requirements["team_size_preference"]

        # High-complexity, multi-domain queries
        if complexity > 0.9 and domain_count > 2:
            return RoutingStrategy.ADVISORY_BOARD

        # Safety-critical or regulatory-urgent queries
        if urgency in ["safety_critical", "regulatory_urgent"]:
            if domain_count > 1:
                return RoutingStrategy.PARALLEL_CONSENSUS
            else:
                return RoutingStrategy.SINGLE_EXPERT

        # Complex multi-domain queries
        if complexity > 0.7 and domain_count > 1:
            return RoutingStrategy.COLLABORATIVE_TEAM

        # Sequential processing needed (e.g., research -> analysis -> writing)
        if "PROOF" in requirements["prism_suites"] and "CRAFT" in requirements["prism_suites"]:
            return RoutingStrategy.SEQUENTIAL_PIPELINE

        # Multi-perspective needed for strategic decisions
        if team_size > 2 and complexity > 0.6:
            return RoutingStrategy.PARALLEL_CONSENSUS

        # Standard collaborative work
        if team_size > 1:
            return RoutingStrategy.COLLABORATIVE_TEAM

        # Single expert sufficient
        return RoutingStrategy.SINGLE_EXPERT

    async def _select_candidate_agents(
        self,
        requirements: Dict[str, Any],
        strategy: RoutingStrategy
    ) -> List[str]:
        """Select candidate agents based on requirements"""

        candidates = []

        for agent_id, capabilities in self.agents_registry.items():
            score = await self._calculate_agent_match_score(capabilities, requirements)

            if score > 0.3:  # Minimum threshold
                candidates.append((agent_id, score))

        # Sort by match score
        candidates.sort(key=lambda x: x[1], reverse=True)

        # Return agent IDs based on strategy requirements
        if strategy == RoutingStrategy.ADVISORY_BOARD:
            return [agent_id for agent_id, _ in candidates[:8]]  # Up to 8 agents
        elif strategy in [RoutingStrategy.COLLABORATIVE_TEAM, RoutingStrategy.PARALLEL_CONSENSUS]:
            return [agent_id for agent_id, _ in candidates[:4]]  # Up to 4 agents
        elif strategy == RoutingStrategy.SEQUENTIAL_PIPELINE:
            return [agent_id for agent_id, _ in candidates[:3]]  # Up to 3 agents in sequence
        else:
            return [agent_id for agent_id, _ in candidates[:2]]  # Primary + backup

    async def _calculate_agent_match_score(
        self,
        capabilities: AgentCapabilities,
        requirements: Dict[str, Any]
    ) -> float:
        """Calculate how well an agent matches the requirements"""

        score = 0.0

        # Domain expertise match (40% weight)
        domain_match = 0.0
        for domain in requirements["domains"]:
            if domain in capabilities.expertise_domains:
                domain_match += 1.0
        if requirements["domains"]:
            domain_match = domain_match / len(requirements["domains"])
        score += domain_match * 0.4

        # Therapeutic area match (20% weight)
        therapeutic_match = 0.0
        if requirements["therapeutic_areas"]:
            for area in requirements["therapeutic_areas"]:
                if area in capabilities.therapeutic_areas or "all_areas" in capabilities.therapeutic_areas:
                    therapeutic_match += 1.0
            therapeutic_match = therapeutic_match / len(requirements["therapeutic_areas"])
        else:
            therapeutic_match = 1.0  # No specific requirement
        score += therapeutic_match * 0.2

        # PRISM suite compatibility (20% weight)
        prism_match = 0.0
        if requirements["prism_suites"]:
            for suite in requirements["prism_suites"]:
                if suite in capabilities.prism_suites or "all_suites" in capabilities.prism_suites:
                    prism_match += 1.0
            prism_match = prism_match / len(requirements["prism_suites"])
        else:
            prism_match = 1.0  # No specific requirement
        score += prism_match * 0.2

        # Experience level bonus (10% weight)
        experience_bonus = capabilities.experience_level / 10.0
        score += experience_bonus * 0.1

        # Performance metrics (10% weight)
        performance_score = (
            capabilities.performance_metrics.get("accuracy", 0.5) * 0.5 +
            capabilities.performance_metrics.get("satisfaction", 0.5) * 0.3 +
            (1.0 - min(capabilities.performance_metrics.get("response_time", 120) / 300, 1.0)) * 0.2
        )
        score += performance_score * 0.1

        return min(score, 1.0)

    async def _filter_by_availability(
        self,
        candidate_agents: List[str],
        strategy: RoutingStrategy
    ) -> List[str]:
        """Filter agents by current availability and load"""

        available_agents = []

        for agent_id in candidate_agents:
            workload = self.workload_tracker.get(agent_id)

            if not workload:
                continue

            # Check basic availability
            if workload.status != AgentStatus.AVAILABLE:
                continue

            # Check capacity
            if workload.current_sessions >= workload.max_capacity:
                continue

            # Check queue length for urgent queries
            if strategy in [RoutingStrategy.SINGLE_EXPERT] and workload.queue_length > 2:
                continue

            available_agents.append(agent_id)

        return available_agents

    async def _optimize_agent_selection(
        self,
        available_agents: List[str],
        requirements: Dict[str, Any],
        strategy: RoutingStrategy
    ) -> List[str]:
        """Optimize final agent selection based on strategy"""

        if not available_agents:
            # Fallback to generalist if available
            if "gen_001" in self.workload_tracker:
                return ["gen_001"]
            return []

        if strategy == RoutingStrategy.SINGLE_EXPERT:
            return available_agents[:1]

        elif strategy == RoutingStrategy.COLLABORATIVE_TEAM:
            # Select complementary agents
            return await self._select_complementary_team(
                available_agents, requirements, max_size=3
            )

        elif strategy == RoutingStrategy.SEQUENTIAL_PIPELINE:
            # Select agents for sequential processing
            return await self._select_sequential_team(
                available_agents, requirements
            )

        elif strategy == RoutingStrategy.PARALLEL_CONSENSUS:
            # Select diverse perspectives
            return await self._select_diverse_team(
                available_agents, requirements, min_size=2
            )

        elif strategy == RoutingStrategy.ADVISORY_BOARD:
            # Select full advisory board
            return await self._select_advisory_board(
                available_agents, requirements
            )

        else:
            return available_agents[:2]  # Primary + backup

    async def _select_complementary_team(
        self,
        available_agents: List[str],
        requirements: Dict[str, Any],
        max_size: int = 3
    ) -> List[str]:
        """Select complementary agents for collaborative work"""

        selected = []
        covered_domains = set()

        # Prioritize by match score and domain coverage
        agent_scores = []
        for agent_id in available_agents:
            capabilities = self.agents_registry[agent_id]
            score = await self._calculate_agent_match_score(capabilities, requirements)
            agent_scores.append((agent_id, score, set(capabilities.expertise_domains)))

        agent_scores.sort(key=lambda x: x[1], reverse=True)

        for agent_id, score, domains in agent_scores:
            if len(selected) >= max_size:
                break

            # Add agent if they bring new domain coverage
            new_domains = domains - covered_domains
            if new_domains or len(selected) == 0:
                selected.append(agent_id)
                covered_domains.update(domains)

        return selected

    async def _select_sequential_team(
        self,
        available_agents: List[str],
        requirements: Dict[str, Any]
    ) -> List[str]:
        """Select agents for sequential pipeline processing"""

        # Define typical pipeline stages
        pipeline_stages = [
            ["clinical_researcher", "biostatistician"],  # Research/Analysis
            ["regulatory_specialist", "market_access_analyst"],  # Strategy
            ["medical_writer"]  # Documentation
        ]

        selected = []

        for stage_types in pipeline_stages:
            for agent_id in available_agents:
                if agent_id in selected:
                    continue

                capabilities = self.agents_registry[agent_id]
                agent_type_str = capabilities.agent_type.value

                if agent_type_str in stage_types:
                    selected.append(agent_id)
                    break

            if len(selected) >= 3:  # Limit pipeline length
                break

        return selected

    async def _select_diverse_team(
        self,
        available_agents: List[str],
        requirements: Dict[str, Any],
        min_size: int = 2
    ) -> List[str]:
        """Select diverse team for consensus building"""

        selected = []
        agent_types_used = set()

        # Sort by match score
        agent_scores = []
        for agent_id in available_agents:
            capabilities = self.agents_registry[agent_id]
            score = await self._calculate_agent_match_score(capabilities, requirements)
            agent_scores.append((agent_id, score, capabilities.agent_type))

        agent_scores.sort(key=lambda x: x[1], reverse=True)

        # Select diverse agent types
        for agent_id, score, agent_type in agent_scores:
            if agent_type not in agent_types_used or len(selected) < min_size:
                selected.append(agent_id)
                agent_types_used.add(agent_type)

                if len(selected) >= 4:  # Maximum for consensus
                    break

        return selected

    async def _select_advisory_board(
        self,
        available_agents: List[str],
        requirements: Dict[str, Any]
    ) -> List[str]:
        """Select full advisory board for complex queries"""

        # Try to include one agent from each major type
        priority_types = [
            AgentType.REGULATORY_SPECIALIST,
            AgentType.CLINICAL_RESEARCHER,
            AgentType.MARKET_ACCESS_ANALYST,
            AgentType.MEDICAL_WRITER,
            AgentType.DIGITAL_HEALTH_EXPERT
        ]

        selected = []
        types_covered = set()

        # First pass: one from each priority type
        for agent_id in available_agents:
            capabilities = self.agents_registry[agent_id]

            if (capabilities.agent_type in priority_types and
                capabilities.agent_type not in types_covered):
                selected.append(agent_id)
                types_covered.add(capabilities.agent_type)

        # Second pass: fill remaining slots with best matches
        for agent_id in available_agents:
            if agent_id not in selected and len(selected) < 8:
                selected.append(agent_id)

        return selected

    async def _create_routing_decision(
        self,
        selected_agents: List[str],
        strategy: RoutingStrategy,
        requirements: Dict[str, Any]
    ) -> RoutingDecision:
        """Create the final routing decision object"""

        if not selected_agents:
            return await self._create_fallback_routing()

        primary_agent = selected_agents[0] if selected_agents else None
        backup_agents = selected_agents[1:] if len(selected_agents) > 1 else []

        # Calculate estimated response time
        response_times = []
        for agent_id in selected_agents:
            workload = self.workload_tracker.get(agent_id)
            if workload:
                response_times.append(workload.average_response_time)

        if strategy == RoutingStrategy.SEQUENTIAL_PIPELINE:
            estimated_time = sum(response_times)  # Sequential
        else:
            estimated_time = max(response_times) if response_times else 120  # Parallel

        # Calculate confidence score
        confidence_score = await self._calculate_routing_confidence(
            selected_agents, requirements, strategy
        )

        # Create team composition description
        team_composition = {}
        for agent_id in selected_agents:
            capabilities = self.agents_registry[agent_id]
            team_composition[agent_id] = capabilities.agent_type.value

        # Create expected workflow
        workflow = await self._create_expected_workflow(strategy, selected_agents)

        # Generate routing rationale
        rationale = await self._generate_routing_rationale(
            strategy, selected_agents, requirements
        )

        return RoutingDecision(
            strategy=strategy,
            selected_agents=selected_agents,
            primary_agent=primary_agent,
            backup_agents=backup_agents,
            estimated_response_time=estimated_time,
            confidence_score=confidence_score,
            routing_rationale=rationale,
            team_composition=team_composition,
            expected_workflow=workflow,
            fallback_plan="gen_001" if "gen_001" not in selected_agents else None
        )

    async def _calculate_routing_confidence(
        self,
        selected_agents: List[str],
        requirements: Dict[str, Any],
        strategy: RoutingStrategy
    ) -> float:
        """Calculate confidence in the routing decision"""

        if not selected_agents:
            return 0.1

        # Base confidence from agent match scores
        match_scores = []
        for agent_id in selected_agents:
            capabilities = self.agents_registry[agent_id]
            score = await self._calculate_agent_match_score(capabilities, requirements)
            match_scores.append(score)

        avg_match_score = sum(match_scores) / len(match_scores)

        # Availability confidence
        availability_score = 1.0
        for agent_id in selected_agents:
            workload = self.workload_tracker.get(agent_id)
            if workload and workload.current_sessions > 0:
                availability_score *= 0.9  # Slight reduction for busy agents

        # Strategy appropriateness
        strategy_confidence = 0.8  # Default
        complexity = requirements.get("complexity", 0.5)
        domain_count = len(requirements.get("domains", []))

        if strategy == RoutingStrategy.SINGLE_EXPERT and complexity < 0.6:
            strategy_confidence = 0.95
        elif strategy == RoutingStrategy.COLLABORATIVE_TEAM and 0.6 <= complexity <= 0.8:
            strategy_confidence = 0.9
        elif strategy == RoutingStrategy.ADVISORY_BOARD and complexity > 0.8:
            strategy_confidence = 0.95

        return min(avg_match_score * 0.5 + availability_score * 0.3 + strategy_confidence * 0.2, 1.0)

    async def _create_expected_workflow(
        self,
        strategy: RoutingStrategy,
        selected_agents: List[str]
    ) -> List[str]:
        """Create expected workflow steps"""

        if strategy == RoutingStrategy.SINGLE_EXPERT:
            return [
                "Query analysis and response generation",
                "Quality review and finalization",
                "Response delivery"
            ]

        elif strategy == RoutingStrategy.COLLABORATIVE_TEAM:
            return [
                "Parallel analysis by team members",
                "Cross-consultation and knowledge sharing",
                "Consensus building and response synthesis",
                "Final review and delivery"
            ]

        elif strategy == RoutingStrategy.SEQUENTIAL_PIPELINE:
            return [
                "Initial analysis by primary expert",
                "Sequential processing by specialized agents",
                "Integration and synthesis",
                "Final review and delivery"
            ]

        elif strategy == RoutingStrategy.PARALLEL_CONSENSUS:
            return [
                "Independent analysis by all agents",
                "Consensus building session",
                "Conflict resolution if needed",
                "Unified response generation"
            ]

        elif strategy == RoutingStrategy.ADVISORY_BOARD:
            return [
                "Individual expert analysis",
                "Board consultation session",
                "Multi-perspective discussion",
                "Consensus building",
                "Comprehensive response synthesis"
            ]

        else:
            return ["Analysis", "Response generation", "Delivery"]

    async def _generate_routing_rationale(
        self,
        strategy: RoutingStrategy,
        selected_agents: List[str],
        requirements: Dict[str, Any]
    ) -> str:
        """Generate human-readable routing rationale"""

        agent_types = [
            self.agents_registry[agent_id].agent_type.value.replace('_', ' ').title()
            for agent_id in selected_agents
        ]

        domains = requirements.get("domains", [])
        complexity = requirements.get("complexity", 0.5)

        base = f"Selected {strategy.value.replace('_', ' ')} strategy with {len(selected_agents)} agent(s): {', '.join(agent_types)}."

        if domains:
            domain_text = ', '.join(domains).replace('_', ' ').title()
            base += f" Query spans {domain_text} domain(s)."

        if complexity > 0.8:
            base += " High complexity requires expert collaboration."
        elif complexity > 0.6:
            base += " Moderate complexity benefits from specialized knowledge."
        else:
            base += " Standard complexity suitable for focused expertise."

        return base

    async def _create_fallback_routing(self) -> RoutingDecision:
        """Create fallback routing decision when optimal routing fails"""

        return RoutingDecision(
            strategy=RoutingStrategy.SINGLE_EXPERT,
            selected_agents=["gen_001"],
            primary_agent="gen_001",
            backup_agents=[],
            estimated_response_time=120.0,
            confidence_score=0.3,
            routing_rationale="Fallback to generalist agent due to unavailability of specialized agents.",
            team_composition={"gen_001": "generalist"},
            expected_workflow=["General analysis", "Best-effort response", "Delivery"],
            fallback_plan=None
        )

    async def _record_routing_decision(
        self,
        decision: RoutingDecision,
        query: str,
        session_id: Optional[str]
    ):
        """Record routing decision for analytics"""

        record = {
            "timestamp": datetime.now().isoformat(),
            "session_id": session_id,
            "query_hash": hashlib.md5(query.encode()).hexdigest(),
            "strategy": decision.strategy.value,
            "selected_agents": decision.selected_agents,
            "confidence_score": decision.confidence_score,
            "estimated_response_time": decision.estimated_response_time
        }

        self.routing_history.append(record)

        # Keep only last 1000 records
        if len(self.routing_history) > 1000:
            self.routing_history = self.routing_history[-1000:]

    # Agent Management Methods

    async def update_agent_availability(
        self,
        agent_id: str,
        status: AgentStatus,
        estimated_availability: Optional[datetime] = None
    ):
        """Update agent availability status"""

        if agent_id in self.workload_tracker:
            self.workload_tracker[agent_id].status = status
            self.workload_tracker[agent_id].estimated_availability = estimated_availability
            self.workload_tracker[agent_id].last_activity = datetime.now()

    async def update_agent_workload(
        self,
        agent_id: str,
        current_sessions: int,
        queue_length: int,
        average_response_time: float
    ):
        """Update agent workload metrics"""

        if agent_id in self.workload_tracker:
            workload = self.workload_tracker[agent_id]
            workload.current_sessions = current_sessions
            workload.queue_length = queue_length
            workload.average_response_time = average_response_time
            workload.last_activity = datetime.now()

    async def get_agent_status(self, agent_id: str) -> Optional[AgentWorkload]:
        """Get current status of an agent"""
        return self.workload_tracker.get(agent_id)

    async def get_available_agents(self) -> List[str]:
        """Get list of currently available agents"""
        available = []
        for agent_id, workload in self.workload_tracker.items():
            if (workload.status == AgentStatus.AVAILABLE and
                workload.current_sessions < workload.max_capacity):
                available.append(agent_id)
        return available

    async def get_routing_analytics(self) -> Dict[str, Any]:
        """Get routing analytics and performance metrics"""

        if not self.routing_history:
            return {"message": "No routing history available"}

        # Strategy distribution
        strategies = [record["strategy"] for record in self.routing_history]
        strategy_dist = {strategy: strategies.count(strategy) for strategy in set(strategies)}

        # Average confidence
        confidences = [record["confidence_score"] for record in self.routing_history]
        avg_confidence = sum(confidences) / len(confidences)

        # Agent utilization
        all_agents = []
        for record in self.routing_history:
            all_agents.extend(record["selected_agents"])
        agent_usage = {agent: all_agents.count(agent) for agent in set(all_agents)}

        # Response time estimates
        response_times = [record["estimated_response_time"] for record in self.routing_history]
        avg_response_time = sum(response_times) / len(response_times)

        return {
            "total_routings": len(self.routing_history),
            "strategy_distribution": strategy_dist,
            "average_confidence": round(avg_confidence, 3),
            "agent_utilization": agent_usage,
            "average_estimated_response_time": round(avg_response_time, 1),
            "available_agents": await self.get_available_agents()
        }

# Factory function for easy instantiation
def create_agent_router() -> AgentRouter:
    """Create and return a configured AgentRouter instance"""
    return AgentRouter()

# Example usage and testing
if __name__ == "__main__":
    async def test_agent_router():
        """Test the agent router functionality"""
        router = create_agent_router()

        # Test query
        test_query = "What are the FDA requirements for digital therapeutics approval in oncology?"

        # Mock triage result
        triage_result = {
            "domains": ["regulatory_compliance", "digital_health"],
            "complexity_score": 0.8,
            "urgency_level": "regulatory_urgent",
            "safety_critical": False
        }

        # Mock user context
        user_context = {
            "user_type": "regulatory_professional",
            "expertise_level": "intermediate",
            "therapeutic_focus": ["oncology"]
        }

        # Test routing
        print("Testing Agent Router...")
        decision = await router.route_query(test_query, triage_result, user_context)

        print(f"Strategy: {decision.strategy.value}")
        print(f"Selected Agents: {decision.selected_agents}")
        print(f"Primary Agent: {decision.primary_agent}")
        print(f"Confidence: {decision.confidence_score:.2f}")
        print(f"Estimated Time: {decision.estimated_response_time:.1f}s")
        print(f"Rationale: {decision.routing_rationale}")
        print(f"Team: {decision.team_composition}")

        # Test analytics
        analytics = await router.get_routing_analytics()
        print(f"\nAnalytics: {analytics}")

    # Run test
    asyncio.run(test_agent_router())