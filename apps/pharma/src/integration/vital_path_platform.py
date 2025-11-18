#!/usr/bin/env python3
"""
VITAL Path Platform Integration
Unified interface integrating all Master Orchestrator components

PROMPT 2.10: Complete System Integration - Unified Platform
- Centralized orchestration and coordination
- Unified API interface for all capabilities
- Cross-component data flow and integration
- Comprehensive analytics and monitoring
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple, Union
from dataclasses import dataclass, field, asdict
from enum import Enum
import uuid

# Import all orchestrator components
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PlatformCapability(Enum):
    """Available platform capabilities"""
    INTELLIGENT_TRIAGE = "intelligent_triage"
    AGENT_ORCHESTRATION = "agent_orchestration"
    PROMPT_MANAGEMENT = "prompt_management"
    CONVERSATIONAL_AI = "conversational_ai"
    ADVISORY_BOARD = "advisory_board"
    WORKFLOW_AUTOMATION = "workflow_automation"
    OUTCOME_MAPPING = "outcome_mapping"
    ANALYTICS_INSIGHTS = "analytics_insights"

class RequestType(Enum):
    """Types of platform requests"""
    SINGLE_QUERY = "single_query"
    CONVERSATION = "conversation"
    WORKFLOW_EXECUTION = "workflow_execution"
    ADVISORY_CONSULTATION = "advisory_consultation"
    OUTCOME_DISCOVERY = "outcome_discovery"
    COMPREHENSIVE_ANALYSIS = "comprehensive_analysis"

class IntegrationLevel(Enum):
    """Levels of system integration"""
    BASIC = "basic"                 # Single component usage
    COLLABORATIVE = "collaborative" # Multi-component coordination
    ORCHESTRATED = "orchestrated"   # Full orchestration with workflows
    INTELLIGENT = "intelligent"     # AI-driven component selection

@dataclass
class PlatformRequest:
    """Unified request structure for the platform"""
    request_id: str
    request_type: RequestType
    query: str
    context: Dict[str, Any]
    user_profile: Dict[str, Any]
    session_metadata: Dict[str, Any]
    required_capabilities: List[PlatformCapability]
    integration_level: IntegrationLevel
    priority: str
    deadline: Optional[datetime]
    stakeholders: List[str]
    deliverable_format: str

@dataclass
class PlatformResponse:
    """Unified response structure from the platform"""
    request_id: str
    response_id: str
    status: str
    primary_answer: str
    supporting_evidence: List[Dict[str, Any]]
    recommendations: List[str]
    next_steps: List[str]
    confidence_score: float
    quality_metrics: Dict[str, float]
    component_contributions: Dict[str, Any]
    follow_up_opportunities: List[str]
    analytics_summary: Dict[str, Any]
    generated_at: datetime
    processing_time: float

@dataclass
class IntegrationFlow:
    """Flow definition for component integration"""
    flow_id: str
    name: str
    description: str
    trigger_conditions: Dict[str, Any]
    component_sequence: List[str]
    data_flow_mapping: Dict[str, str]
    decision_points: List[str]
    success_criteria: List[str]
    fallback_strategy: str

@dataclass
class PlatformAnalytics:
    """Comprehensive platform analytics"""
    total_requests: int
    capability_usage: Dict[str, int]
    integration_patterns: Dict[str, int]
    performance_metrics: Dict[str, float]
    user_satisfaction: Dict[str, float]
    component_health: Dict[str, str]
    optimization_opportunities: List[str]

class VitalPathPlatform:
    """
    VITAL Path Master Orchestrator Platform

    Unified interface integrating all components:
    - Master Orchestrator & Triage Classification
    - Agent Selection & Routing
    - Prompt Library & Injection Engine
    - Conversational AI & Virtual Advisory Board
    - Orchestrated Workflows & Jobs-to-be-Done Framework

    Capabilities:
    - Intelligent request routing and orchestration
    - Cross-component data flow and coordination
    - Unified analytics and performance monitoring
    - Adaptive system optimization and learning
    """

    def __init__(self):
        # Initialize component registry
        self.components = {}
        self.integration_flows = {}
        self.active_requests = {}
        self.request_history = []
        self.platform_analytics = None

        # Component health tracking
        self.component_health = {}
        self.performance_metrics = {}

        # Initialize the unified platform
        asyncio.create_task(self._initialize_platform())

    async def _initialize_platform(self):
        """Initialize the unified VITAL Path platform"""
        logger.info("Initializing VITAL Path Master Orchestrator Platform...")

        # Initialize all components
        await self._initialize_components()

        # Setup integration flows
        await self._setup_integration_flows()

        # Initialize analytics system
        await self._initialize_analytics()

        # Setup health monitoring
        await self._setup_health_monitoring()

        # Initialize optimization engine
        await self._setup_optimization_engine()

        logger.info("VITAL Path Platform fully initialized and operational")

    async def _initialize_components(self):
        """Initialize all orchestrator components"""

        # Simulated component initialization
        # In a real implementation, these would import and initialize actual components

        self.components = {
            "master_orchestrator": {
                "status": "operational",
                "capabilities": ["triage", "classification", "routing_decisions"],
                "initialized_at": datetime.now(),
                "health_score": 0.95
            },
            "triage_classifier": {
                "status": "operational",
                "capabilities": ["domain_classification", "complexity_assessment", "urgency_detection"],
                "initialized_at": datetime.now(),
                "health_score": 0.92
            },
            "agent_router": {
                "status": "operational",
                "capabilities": ["agent_selection", "load_balancing", "performance_optimization"],
                "initialized_at": datetime.now(),
                "health_score": 0.89
            },
            "prompt_library": {
                "status": "operational",
                "capabilities": ["prompt_management", "versioning", "optimization"],
                "initialized_at": datetime.now(),
                "health_score": 0.93
            },
            "prompt_injection_engine": {
                "status": "operational",
                "capabilities": ["context_enhancement", "safety_validation", "compliance_checking"],
                "initialized_at": datetime.now(),
                "health_score": 0.91
            },
            "conversational_ai": {
                "status": "operational",
                "capabilities": ["multi_turn_dialogue", "context_retention", "expert_escalation"],
                "initialized_at": datetime.now(),
                "health_score": 0.88
            },
            "virtual_advisory_board": {
                "status": "operational",
                "capabilities": ["expert_consultation", "consensus_building", "strategic_advice"],
                "initialized_at": datetime.now(),
                "health_score": 0.94
            },
            "workflow_orchestrator": {
                "status": "operational",
                "capabilities": ["process_automation", "workflow_management", "quality_gates"],
                "initialized_at": datetime.now(),
                "health_score": 0.87
            },
            "jtbd_framework": {
                "status": "operational",
                "capabilities": ["outcome_mapping", "opportunity_assessment", "innovation_guidance"],
                "initialized_at": datetime.now(),
                "health_score": 0.90
            }
        }

        logger.info(f"Initialized {len(self.components)} platform components")

    async def _setup_integration_flows(self):
        """Setup integration flows between components"""

        # Standard Query Flow
        standard_query_flow = IntegrationFlow(
            flow_id="standard_query",
            name="Standard Query Processing",
            description="Standard single-query processing with intelligent routing",
            trigger_conditions={"request_type": "single_query", "complexity": "<0.7"},
            component_sequence=[
                "triage_classifier",
                "prompt_injection_engine",
                "agent_router",
                "prompt_library"
            ],
            data_flow_mapping={
                "query": "triage_classifier.input",
                "triage_result": "agent_router.routing_input",
                "routing_decision": "prompt_library.context",
                "enhanced_prompt": "final_response.input"
            },
            decision_points=["complexity_threshold", "safety_validation", "quality_check"],
            success_criteria=["response_generated", "quality_score>0.8", "safety_validated"],
            fallback_strategy="basic_agent_response"
        )

        # Complex Consultation Flow
        complex_consultation_flow = IntegrationFlow(
            flow_id="complex_consultation",
            name="Complex Multi-Expert Consultation",
            description="Complex queries requiring multiple experts and advisory board input",
            trigger_conditions={"complexity": ">0.8", "stakeholders": ">1", "strategic_importance": "high"},
            component_sequence=[
                "triage_classifier",
                "agent_router",
                "virtual_advisory_board",
                "prompt_injection_engine",
                "workflow_orchestrator"
            ],
            data_flow_mapping={
                "query": "triage_classifier.input",
                "complexity_analysis": "virtual_advisory_board.consultation_input",
                "expert_consensus": "workflow_orchestrator.process_input",
                "workflow_result": "final_response.input"
            },
            decision_points=["expert_agreement", "consensus_threshold", "implementation_feasibility"],
            success_criteria=["expert_consensus", "actionable_recommendations", "implementation_plan"],
            fallback_strategy="senior_expert_consultation"
        )

        # Conversational AI Flow
        conversational_flow = IntegrationFlow(
            flow_id="conversational_ai",
            name="Multi-turn Conversational Processing",
            description="Multi-turn conversation with context retention and dynamic routing",
            trigger_conditions={"request_type": "conversation", "session_active": True},
            component_sequence=[
                "conversational_ai",
                "triage_classifier",
                "agent_router",
                "prompt_injection_engine"
            ],
            data_flow_mapping={
                "conversation_context": "triage_classifier.context_input",
                "turn_analysis": "agent_router.dynamic_routing",
                "agent_response": "conversational_ai.response_integration",
                "conversation_state": "next_turn.context"
            },
            decision_points=["escalation_needed", "context_sufficient", "conversation_complete"],
            success_criteria=["user_satisfaction", "context_maintained", "progress_made"],
            fallback_strategy="expert_handoff"
        )

        # Workflow Automation Flow
        workflow_flow = IntegrationFlow(
            flow_id="workflow_automation",
            name="End-to-End Workflow Automation",
            description="Automated workflow execution with quality gates and expert input",
            trigger_conditions={"request_type": "workflow_execution", "process_defined": True},
            component_sequence=[
                "workflow_orchestrator",
                "agent_router",
                "virtual_advisory_board",
                "prompt_library",
                "jtbd_framework"
            ],
            data_flow_mapping={
                "workflow_definition": "workflow_orchestrator.input",
                "step_requirements": "agent_router.assignment_input",
                "expert_input": "workflow_orchestrator.step_execution",
                "outcome_validation": "jtbd_framework.success_measurement"
            },
            decision_points=["quality_gates", "expert_approval", "outcome_achievement"],
            success_criteria=["workflow_completed", "quality_validated", "outcomes_achieved"],
            fallback_strategy="manual_intervention"
        )

        # Innovation Discovery Flow
        innovation_flow = IntegrationFlow(
            flow_id="innovation_discovery",
            name="Jobs-to-be-Done Innovation Discovery",
            description="Outcome-driven innovation opportunity discovery and development",
            trigger_conditions={"request_type": "outcome_discovery", "innovation_focus": True},
            component_sequence=[
                "jtbd_framework",
                "triage_classifier",
                "virtual_advisory_board",
                "workflow_orchestrator",
                "agent_router"
            ],
            data_flow_mapping={
                "job_statement": "jtbd_framework.job_analysis",
                "opportunity_assessment": "virtual_advisory_board.strategic_input",
                "innovation_plan": "workflow_orchestrator.execution_planning",
                "implementation_strategy": "final_response.input"
            },
            decision_points=["opportunity_validation", "feasibility_assessment", "resource_allocation"],
            success_criteria=["opportunities_identified", "innovation_plan_created", "implementation_roadmap"],
            fallback_strategy="traditional_innovation_approach"
        )

        self.integration_flows = {
            "standard_query": standard_query_flow,
            "complex_consultation": complex_consultation_flow,
            "conversational_ai": conversational_flow,
            "workflow_automation": workflow_flow,
            "innovation_discovery": innovation_flow
        }

    async def _initialize_analytics(self):
        """Initialize comprehensive analytics system"""

        self.platform_analytics = PlatformAnalytics(
            total_requests=0,
            capability_usage={cap.value: 0 for cap in PlatformCapability},
            integration_patterns={flow_id: 0 for flow_id in self.integration_flows.keys()},
            performance_metrics={
                "average_response_time": 0.0,
                "average_confidence_score": 0.0,
                "success_rate": 0.0,
                "user_satisfaction": 0.0
            },
            user_satisfaction={
                "overall": 0.0,
                "by_capability": {cap.value: 0.0 for cap in PlatformCapability}
            },
            component_health={comp: "healthy" for comp in self.components.keys()},
            optimization_opportunities=[]
        )

    async def _setup_health_monitoring(self):
        """Setup health monitoring for all components"""

        for component_name in self.components.keys():
            self.component_health[component_name] = {
                "status": "healthy",
                "last_check": datetime.now(),
                "response_time": 0.0,
                "error_rate": 0.0,
                "availability": 1.0
            }

    async def _setup_optimization_engine(self):
        """Setup optimization engine for continuous improvement"""

        self.optimization_rules = {
            "route_optimization": {
                "trigger": "response_time > 5.0",
                "action": "optimize_agent_routing",
                "frequency": "hourly"
            },
            "prompt_optimization": {
                "trigger": "confidence_score < 0.8",
                "action": "enhance_prompt_selection",
                "frequency": "daily"
            },
            "workflow_optimization": {
                "trigger": "workflow_failure_rate > 0.1",
                "action": "optimize_workflow_steps",
                "frequency": "weekly"
            }
        }

    # Core Platform Methods

    async def process_request(
        self,
        request: PlatformRequest
    ) -> PlatformResponse:
        """Main entry point for processing platform requests"""

        logger.info(f"Processing platform request {request.request_id}: {request.request_type.value}")
        start_time = datetime.now()

        try:
            # Store active request
            self.active_requests[request.request_id] = request

            # Determine integration flow
            flow = await self._select_integration_flow(request)

            # Execute integration flow
            response = await self._execute_integration_flow(request, flow)

            # Update analytics
            await self._update_analytics(request, response, start_time)

            # Store in history
            self.request_history.append({
                "request": request,
                "response": response,
                "flow_used": flow.flow_id,
                "processing_time": response.processing_time
            })

            # Cleanup active request
            if request.request_id in self.active_requests:
                del self.active_requests[request.request_id]

            logger.info(f"Request {request.request_id} completed in {response.processing_time:.2f}s")
            return response

        except Exception as e:
            logger.error(f"Error processing request {request.request_id}: {e}")

            # Generate error response
            error_response = PlatformResponse(
                request_id=request.request_id,
                response_id=str(uuid.uuid4()),
                status="error",
                primary_answer=f"I apologize, but I encountered an error processing your request: {str(e)}",
                supporting_evidence=[],
                recommendations=["Please try rephrasing your question", "Contact support if the issue persists"],
                next_steps=["Retry with different parameters"],
                confidence_score=0.0,
                quality_metrics={"error": 1.0},
                component_contributions={"error_handler": "Generated fallback response"},
                follow_up_opportunities=[],
                analytics_summary={"error": str(e)},
                generated_at=datetime.now(),
                processing_time=(datetime.now() - start_time).total_seconds()
            )

            return error_response

    async def _select_integration_flow(
        self,
        request: PlatformRequest
    ) -> IntegrationFlow:
        """Select the optimal integration flow for the request"""

        # Evaluate trigger conditions for each flow
        for flow_id, flow in self.integration_flows.items():
            if await self._evaluate_flow_conditions(request, flow):
                logger.info(f"Selected integration flow: {flow_id}")
                return flow

        # Default to standard query flow
        logger.info("Using default standard query flow")
        return self.integration_flows["standard_query"]

    async def _evaluate_flow_conditions(
        self,
        request: PlatformRequest,
        flow: IntegrationFlow
    ) -> bool:
        """Evaluate if a flow's trigger conditions are met"""

        conditions = flow.trigger_conditions

        # Check request type
        if "request_type" in conditions:
            if request.request_type.value != conditions["request_type"]:
                return False

        # Check complexity (simulated)
        complexity = request.context.get("complexity_score", 0.5)
        if "complexity" in conditions:
            complexity_condition = conditions["complexity"]
            if complexity_condition.startswith(">"):
                threshold = float(complexity_condition[1:])
                if complexity <= threshold:
                    return False
            elif complexity_condition.startswith("<"):
                threshold = float(complexity_condition[1:])
                if complexity >= threshold:
                    return False

        # Check stakeholder count
        if "stakeholders" in conditions:
            stakeholder_condition = conditions["stakeholders"]
            stakeholder_count = len(request.stakeholders)
            if stakeholder_condition.startswith(">"):
                threshold = int(stakeholder_condition[1:])
                if stakeholder_count <= threshold:
                    return False

        # Check strategic importance
        if "strategic_importance" in conditions:
            importance = request.context.get("strategic_importance", "medium")
            if importance != conditions["strategic_importance"]:
                return False

        return True

    async def _execute_integration_flow(
        self,
        request: PlatformRequest,
        flow: IntegrationFlow
    ) -> PlatformResponse:
        """Execute the selected integration flow"""

        logger.info(f"Executing integration flow: {flow.name}")

        # Initialize flow context
        flow_context = {
            "request": request,
            "flow": flow,
            "component_outputs": {},
            "decision_results": {},
            "quality_checks": {}
        }

        # Execute component sequence
        for component_name in flow.component_sequence:
            result = await self._execute_component(component_name, flow_context)
            flow_context["component_outputs"][component_name] = result

            # Check decision points
            if component_name in flow.decision_points:
                decision = await self._evaluate_decision_point(component_name, flow_context)
                flow_context["decision_results"][component_name] = decision

                # Handle flow control based on decision
                if not decision.get("continue", True):
                    break

        # Generate final response
        response = await self._generate_integrated_response(flow_context)
        return response

    async def _execute_component(
        self,
        component_name: str,
        flow_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a specific component in the flow"""

        logger.info(f"Executing component: {component_name}")

        # Simulate component execution
        # In a real implementation, this would call actual component methods

        component_result = {
            "component": component_name,
            "status": "completed",
            "execution_time": 0.5,  # Simulated
            "output": f"Output from {component_name}",
            "confidence": 0.85,
            "metadata": {"simulated": True}
        }

        # Component-specific simulation
        if component_name == "triage_classifier":
            component_result.update({
                "classification": {
                    "domains": ["medical", "regulatory"],
                    "complexity_score": 0.7,
                    "urgency_level": "standard",
                    "safety_critical": False
                }
            })

        elif component_name == "agent_router":
            component_result.update({
                "routing_decision": {
                    "selected_agents": ["regulatory_specialist", "clinical_researcher"],
                    "routing_strategy": "collaborative_team",
                    "confidence": 0.82
                }
            })

        elif component_name == "virtual_advisory_board":
            component_result.update({
                "consultation_result": {
                    "expert_consensus": "Proceed with recommended approach",
                    "confidence_level": 0.89,
                    "implementation_recommendations": [
                        "Develop phased implementation plan",
                        "Engage stakeholders early",
                        "Monitor success metrics"
                    ]
                }
            })

        elif component_name == "prompt_injection_engine":
            component_result.update({
                "enhanced_prompt": {
                    "injections_applied": ["medical_context", "safety_wrapper"],
                    "safety_validated": True,
                    "compliance_checked": True,
                    "enhancement_score": 0.91
                }
            })

        elif component_name == "conversational_ai":
            component_result.update({
                "conversation_state": {
                    "context_maintained": True,
                    "turn_analysis": "Information gathering phase",
                    "next_action": "Provide detailed response"
                }
            })

        elif component_name == "workflow_orchestrator":
            component_result.update({
                "workflow_status": {
                    "steps_completed": 3,
                    "current_step": "Quality review",
                    "estimated_completion": "2 days",
                    "quality_gates_passed": True
                }
            })

        elif component_name == "jtbd_framework":
            component_result.update({
                "outcome_analysis": {
                    "opportunities_identified": 5,
                    "top_opportunity_score": 15.2,
                    "innovation_pathways": ["AI-powered automation", "Workflow optimization"],
                    "feasibility_score": 0.78
                }
            })

        elif component_name == "prompt_library":
            component_result.update({
                "prompt_selection": {
                    "selected_prompt": "medical_consultation_expert",
                    "version": "2.1",
                    "customization_applied": True,
                    "optimization_score": 0.88
                }
            })

        return component_result

    async def _evaluate_decision_point(
        self,
        component_name: str,
        flow_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Evaluate decision points in the flow"""

        component_result = flow_context["component_outputs"].get(component_name, {})

        # Simulate decision evaluation
        decision = {
            "decision_point": component_name,
            "continue": True,
            "confidence": 0.8,
            "rationale": f"Quality criteria met for {component_name}"
        }

        # Component-specific decision logic
        if component_name == "triage_classifier":
            complexity = component_result.get("classification", {}).get("complexity_score", 0.5)
            if complexity > 0.9:
                decision.update({
                    "continue": True,
                    "escalate": True,
                    "rationale": "High complexity requires expert consultation"
                })

        elif component_name == "virtual_advisory_board":
            consensus = component_result.get("consultation_result", {}).get("confidence_level", 0.5)
            if consensus < 0.7:
                decision.update({
                    "continue": False,
                    "action": "additional_consultation",
                    "rationale": "Low consensus requires additional expert input"
                })

        return decision

    async def _generate_integrated_response(
        self,
        flow_context: Dict[str, Any]
    ) -> PlatformResponse:
        """Generate the final integrated response"""

        request = flow_context["request"]
        component_outputs = flow_context["component_outputs"]

        # Synthesize component outputs
        primary_answer = "Based on comprehensive analysis across multiple expert systems, here are the key insights and recommendations:"

        supporting_evidence = []
        recommendations = []
        next_steps = []

        # Aggregate outputs from each component
        for component_name, output in component_outputs.items():
            if "recommendations" in output:
                recommendations.extend(output["recommendations"])

            supporting_evidence.append({
                "source": component_name,
                "confidence": output.get("confidence", 0.8),
                "key_finding": output.get("output", ""),
                "metadata": output.get("metadata", {})
            })

        # Generate specific recommendations based on flow type
        flow = flow_context["flow"]
        if "consultation" in flow.flow_id:
            recommendations.extend([
                "Engage multidisciplinary team for implementation",
                "Develop comprehensive project plan with milestones",
                "Establish success metrics and monitoring framework"
            ])
            next_steps.extend([
                "Schedule stakeholder alignment meeting",
                "Create detailed implementation timeline",
                "Identify resource requirements and constraints"
            ])

        elif "workflow" in flow.flow_id:
            recommendations.extend([
                "Implement quality gates at each workflow stage",
                "Establish clear escalation procedures",
                "Monitor workflow performance metrics"
            ])
            next_steps.extend([
                "Initiate workflow execution",
                "Set up monitoring and alerting",
                "Schedule regular progress reviews"
            ])

        elif "innovation" in flow.flow_id:
            recommendations.extend([
                "Prioritize highest-value opportunities",
                "Develop proof-of-concept for validation",
                "Create innovation roadmap with clear milestones"
            ])
            next_steps.extend([
                "Validate opportunity assumptions",
                "Develop technical feasibility assessment",
                "Create business case and resource plan"
            ])

        # Calculate overall confidence and quality metrics
        confidences = [output.get("confidence", 0.8) for output in component_outputs.values()]
        overall_confidence = sum(confidences) / len(confidences) if confidences else 0.8

        quality_metrics = {
            "component_success_rate": len([o for o in component_outputs.values() if o.get("status") == "completed"]) / len(component_outputs),
            "average_component_confidence": overall_confidence,
            "integration_completeness": 1.0,
            "response_coherence": 0.9
        }

        # Generate follow-up opportunities
        follow_up_opportunities = [
            "Schedule follow-up consultation for implementation planning",
            "Request detailed analysis of specific recommendations",
            "Explore additional innovation opportunities",
            "Connect with subject matter experts for deep dive"
        ]

        # Create analytics summary
        analytics_summary = {
            "flow_executed": flow.flow_id,
            "components_used": len(component_outputs),
            "decision_points_evaluated": len(flow_context.get("decision_results", {})),
            "overall_success": True,
            "optimization_opportunities": await self._identify_optimization_opportunities(flow_context)
        }

        response = PlatformResponse(
            request_id=request.request_id,
            response_id=str(uuid.uuid4()),
            status="completed",
            primary_answer=primary_answer,
            supporting_evidence=supporting_evidence,
            recommendations=list(set(recommendations)),  # Remove duplicates
            next_steps=list(set(next_steps)),
            confidence_score=overall_confidence,
            quality_metrics=quality_metrics,
            component_contributions={comp: output.get("output", "") for comp, output in component_outputs.items()},
            follow_up_opportunities=follow_up_opportunities,
            analytics_summary=analytics_summary,
            generated_at=datetime.now(),
            processing_time=(datetime.now() - request.context.get("start_time", datetime.now())).total_seconds()
        )

        return response

    async def _identify_optimization_opportunities(
        self,
        flow_context: Dict[str, Any]
    ) -> List[str]:
        """Identify optimization opportunities from flow execution"""

        opportunities = []

        component_outputs = flow_context["component_outputs"]

        # Check for slow components
        slow_components = [
            comp for comp, output in component_outputs.items()
            if output.get("execution_time", 0) > 2.0
        ]
        if slow_components:
            opportunities.append(f"Optimize performance for components: {', '.join(slow_components)}")

        # Check for low confidence
        low_confidence_components = [
            comp for comp, output in component_outputs.items()
            if output.get("confidence", 1.0) < 0.7
        ]
        if low_confidence_components:
            opportunities.append(f"Improve confidence for components: {', '.join(low_confidence_components)}")

        # Check for decision point failures
        decision_results = flow_context.get("decision_results", {})
        failed_decisions = [
            point for point, result in decision_results.items()
            if not result.get("continue", True)
        ]
        if failed_decisions:
            opportunities.append(f"Review decision criteria for: {', '.join(failed_decisions)}")

        return opportunities

    async def _update_analytics(
        self,
        request: PlatformRequest,
        response: PlatformResponse,
        start_time: datetime
    ):
        """Update platform analytics"""

        # Update request count
        self.platform_analytics.total_requests += 1

        # Update capability usage
        for capability in request.required_capabilities:
            self.platform_analytics.capability_usage[capability.value] += 1

        # Update performance metrics
        processing_time = response.processing_time
        confidence_score = response.confidence_score

        # Update running averages
        n = self.platform_analytics.total_requests
        old_avg_time = self.platform_analytics.performance_metrics["average_response_time"]
        old_avg_confidence = self.platform_analytics.performance_metrics["average_confidence_score"]

        self.platform_analytics.performance_metrics["average_response_time"] = (
            (old_avg_time * (n-1) + processing_time) / n
        )
        self.platform_analytics.performance_metrics["average_confidence_score"] = (
            (old_avg_confidence * (n-1) + confidence_score) / n
        )

        # Update success rate
        success = 1 if response.status == "completed" else 0
        old_success_rate = self.platform_analytics.performance_metrics["success_rate"]
        self.platform_analytics.performance_metrics["success_rate"] = (
            (old_success_rate * (n-1) + success) / n
        )

    # Platform Management Methods

    async def create_unified_request(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None,
        user_profile: Optional[Dict[str, Any]] = None,
        request_type: RequestType = RequestType.SINGLE_QUERY,
        integration_level: IntegrationLevel = IntegrationLevel.INTELLIGENT
    ) -> PlatformRequest:
        """Create a unified platform request"""

        request = PlatformRequest(
            request_id=str(uuid.uuid4()),
            request_type=request_type,
            query=query,
            context=context or {},
            user_profile=user_profile or {},
            session_metadata={"created_at": datetime.now().isoformat()},
            required_capabilities=await self._determine_required_capabilities(query, context),
            integration_level=integration_level,
            priority="standard",
            deadline=None,
            stakeholders=[],
            deliverable_format="comprehensive_response"
        )

        return request

    async def _determine_required_capabilities(
        self,
        query: str,
        context: Optional[Dict[str, Any]]
    ) -> List[PlatformCapability]:
        """Determine required capabilities based on query analysis"""

        capabilities = [PlatformCapability.INTELLIGENT_TRIAGE]  # Always needed

        query_lower = query.lower()

        # Add capabilities based on query content
        if any(term in query_lower for term in ["conversation", "discuss", "chat"]):
            capabilities.append(PlatformCapability.CONVERSATIONAL_AI)

        if any(term in query_lower for term in ["expert", "advice", "consultation", "board"]):
            capabilities.append(PlatformCapability.ADVISORY_BOARD)

        if any(term in query_lower for term in ["workflow", "process", "automation"]):
            capabilities.append(PlatformCapability.WORKFLOW_AUTOMATION)

        if any(term in query_lower for term in ["outcome", "job", "innovation", "opportunity"]):
            capabilities.append(PlatformCapability.OUTCOME_MAPPING)

        if any(term in query_lower for term in ["analytics", "metrics", "performance"]):
            capabilities.append(PlatformCapability.ANALYTICS_INSIGHTS)

        # Always include core capabilities
        capabilities.extend([
            PlatformCapability.AGENT_ORCHESTRATION,
            PlatformCapability.PROMPT_MANAGEMENT
        ])

        return list(set(capabilities))  # Remove duplicates

    async def get_platform_status(self) -> Dict[str, Any]:
        """Get comprehensive platform status"""

        return {
            "platform_health": "operational",
            "total_components": len(self.components),
            "operational_components": len([c for c in self.components.values() if c["status"] == "operational"]),
            "component_health": {name: comp["health_score"] for name, comp in self.components.items()},
            "active_requests": len(self.active_requests),
            "total_requests_processed": self.platform_analytics.total_requests if self.platform_analytics else 0,
            "integration_flows_available": len(self.integration_flows),
            "platform_capabilities": [cap.value for cap in PlatformCapability],
            "last_health_check": datetime.now().isoformat(),
            "performance_summary": self.platform_analytics.performance_metrics if self.platform_analytics else {}
        }

    async def get_platform_analytics(self) -> Dict[str, Any]:
        """Get comprehensive platform analytics"""

        if not self.platform_analytics:
            return {"message": "Analytics not initialized yet"}

        return {
            "total_requests": self.platform_analytics.total_requests,
            "capability_usage": self.platform_analytics.capability_usage,
            "integration_patterns": self.platform_analytics.integration_patterns,
            "performance_metrics": self.platform_analytics.performance_metrics,
            "user_satisfaction": self.platform_analytics.user_satisfaction,
            "component_health": self.platform_analytics.component_health,
            "optimization_opportunities": self.platform_analytics.optimization_opportunities,
            "recent_requests": [
                {
                    "request_id": item["request"].request_id,
                    "type": item["request"].request_type.value,
                    "flow_used": item["flow_used"],
                    "processing_time": item["processing_time"]
                }
                for item in self.request_history[-10:]  # Last 10 requests
            ]
        }

# Factory function
def create_vital_path_platform() -> VitalPathPlatform:
    """Create and return a configured VitalPathPlatform instance"""
    return VitalPathPlatform()

# Example usage
if __name__ == "__main__":
    async def test_vital_path_platform():
        """Test the unified VITAL Path platform"""

        platform = create_vital_path_platform()

        # Wait for initialization
        await asyncio.sleep(2)

        # Test 1: Simple query
        print("=== Test 1: Simple Query ===")
        request1 = await platform.create_unified_request(
            query="What are the FDA requirements for digital therapeutics?",
            context={"therapeutic_area": "digital_health", "complexity_score": 0.6},
            request_type=RequestType.SINGLE_QUERY
        )

        response1 = await platform.process_request(request1)
        print(f"Response confidence: {response1.confidence_score:.2f}")
        print(f"Processing time: {response1.processing_time:.2f}s")
        print(f"Components used: {list(response1.component_contributions.keys())}")

        # Test 2: Complex consultation
        print("\n=== Test 2: Complex Consultation ===")
        request2 = await platform.create_unified_request(
            query="Develop a comprehensive strategy for launching a novel digital therapeutic in diabetes management",
            context={
                "complexity_score": 0.9,
                "strategic_importance": "high",
                "therapeutic_area": "diabetes"
            },
            request_type=RequestType.COMPREHENSIVE_ANALYSIS,
            integration_level=IntegrationLevel.ORCHESTRATED
        )
        request2.stakeholders = ["clinical_team", "regulatory_team", "commercial_team"]

        response2 = await platform.process_request(request2)
        print(f"Response confidence: {response2.confidence_score:.2f}")
        print(f"Number of recommendations: {len(response2.recommendations)}")
        print(f"Flow used: {response2.analytics_summary['flow_executed']}")

        # Test 3: Innovation discovery
        print("\n=== Test 3: Innovation Discovery ===")
        request3 = await platform.create_unified_request(
            query="Identify innovation opportunities for improving patient medication adherence",
            context={"innovation_focus": True, "complexity_score": 0.7},
            request_type=RequestType.OUTCOME_DISCOVERY
        )

        response3 = await platform.process_request(request3)
        print(f"Follow-up opportunities: {len(response3.follow_up_opportunities)}")
        print(f"Quality metrics: {response3.quality_metrics}")

        # Get platform status and analytics
        print("\n=== Platform Status ===")
        status = await platform.get_platform_status()
        print(f"Platform health: {status['platform_health']}")
        print(f"Total requests processed: {status['total_requests_processed']}")

        analytics = await platform.get_platform_analytics()
        print(f"Performance metrics: {analytics['performance_metrics']}")

    # Run test
    asyncio.run(test_vital_path_platform())