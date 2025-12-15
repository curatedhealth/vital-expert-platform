"""
Clinical Researcher Agent
Specialized clinical research agent for trial design and execution
"""

import asyncio
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
import structlog
from services.confidence_calculator import get_confidence_calculator

logger = structlog.get_logger()

class ClinicalResearcherAgent:
    """Clinical researcher agent with expertise in clinical trial design and execution"""
    
    def __init__(self):
        self.agent_id = "clinical_researcher"
        self.name = "Clinical Researcher"
        self.tier = 2  # Tier 2 specialist
        self.specialties = [
            "clinical_trial_design",
            "biostatistics",
            "clinical_operations",
            "data_management",
            "regulatory_compliance"
        ]
        self.llm = None
        self.confidence_calculator = get_confidence_calculator()
        self.system_prompt = """You are a Clinical Researcher AI with comprehensive expertise in clinical trial design, execution, and management. Your role is to provide evidence-based clinical research guidance while ensuring compliance with Good Clinical Practice (GCP) and regulatory requirements.

## CORE IDENTITY
You have 15+ years of experience in clinical research with expertise in:
- Clinical trial design and protocol development
- Biostatistics and data analysis
- Clinical operations and project management
- Regulatory compliance and GCP
- Data management and quality assurance

## EXPERTISE AREAS:
### Clinical Trial Design
- Study design selection (RCT, observational, adaptive)
- Endpoint selection and validation
- Sample size calculation and power analysis
- Randomization and blinding strategies
- Statistical analysis plans
- Adaptive trial designs and interim analyses

### Clinical Operations
- Site selection and qualification
- Investigator and coordinator training
- Monitoring and data quality assurance
- Protocol deviation management
- Adverse event reporting and management
- Clinical trial supply management

### Biostatistics and Data Analysis
- Statistical methodology selection
- Sample size and power calculations
- Interim analysis planning
- Missing data handling strategies
- Subgroup analysis and multiplicity
- Bayesian statistical methods

### Regulatory Compliance
- ICH-GCP guidelines compliance
- FDA 21 CFR Part 11 electronic records
- EU Clinical Trials Regulation compliance
- Data privacy and protection (GDPR, HIPAA)
- Clinical trial registration requirements
- Regulatory submission support

### Data Management
- Electronic Data Capture (EDC) systems
- Data validation and quality control
- Query management and resolution
- Database lock procedures
- Data export and archiving
- Clinical data standards (CDISC)

## OPERATING PRINCIPLES:
1. **Scientific Rigor**: Maintain highest standards of scientific methodology
2. **Patient Safety**: Prioritize patient safety in all research activities
3. **Regulatory Compliance**: Ensure adherence to GCP and regulatory requirements
4. **Data Integrity**: Maintain data quality and integrity throughout trials
5. **Evidence-Based**: Base all recommendations on scientific evidence

## RESPONSE GUIDELINES:
- Always reference relevant guidelines and regulations
- Provide statistical justification for recommendations
- Include risk assessments and mitigation strategies
- Suggest consultation with qualified professionals when appropriate
- Maintain audit trail for clinical decisions"""

    async def initialize(self):
        """Initialize the clinical researcher agent"""
        try:
            self.llm = ChatOpenAI(
                openai_api_key=os.getenv("OPENAI_API_KEY"),
                model="gpt-4-turbo-preview",
                temperature=0.2,
                max_tokens=4000
            )
            logger.info("✅ Clinical Researcher Agent initialized")
        except Exception as e:
            logger.error("❌ Failed to initialize Clinical Researcher Agent", error=str(e))
            raise


# Backwards-compatible alias expected by legacy tests
class ClinicalResearcher(ClinicalResearcherAgent):
    """Alias for ClinicalResearcherAgent for legacy imports"""
    pass

    async def process_query(self, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process a clinical research query with expert guidance"""
        try:
            # Build conversation context
            messages = [
                SystemMessage(content=self.system_prompt),
                HumanMessage(content=query)
            ]
            
            # Add context if provided
            if context:
                context_msg = f"Additional context: {json.dumps(context, indent=2)}"
                messages.append(HumanMessage(content=context_msg))
            
            # Get response from LLM
            response = await self.llm.ainvoke(messages)

            # Calculate dynamic confidence
            agent_metadata = {
                "name": self.name,
                "tier": self.tier,
                "specialties": self.specialties
            }

            rag_results = context.get("rag_results") if context else None

            confidence_data = await self.confidence_calculator.calculate_confidence(
                query=query,
                response=response.content,
                agent_metadata=agent_metadata,
                rag_results=rag_results,
                context=context
            )

            # Process response
            result = {
                "agent_id": self.agent_id,
                "agent_name": self.name,
                "response": response.content,
                "confidence": confidence_data["confidence"],  # Dynamic confidence
                "confidence_breakdown": confidence_data["breakdown"],
                "confidence_reasoning": confidence_data["reasoning"],
                "quality_level": confidence_data["quality_level"],
                "specialties_used": self.specialties,
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "model": "gpt-4-turbo-preview",
                    "temperature": 0.2,
                    "max_tokens": 4000,
                    "tier": self.tier
                }
            }
            
            logger.info("✅ Clinical Researcher query processed", 
                       query_length=len(query),
                       response_length=len(response.content))
            
            return result
            
        except Exception as e:
            logger.error("❌ Clinical Researcher query failed", error=str(e))
            raise

    async def design_clinical_trial(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Design clinical trial based on requirements"""
        try:
            prompt = f"""Design a comprehensive clinical trial based on the following requirements:

Requirements:
{json.dumps(requirements, indent=2)}

Please provide:
1. Study design and methodology
2. Primary and secondary endpoints
3. Inclusion/exclusion criteria
4. Sample size calculation and justification
5. Randomization and blinding strategy
6. Statistical analysis plan
7. Safety monitoring plan
8. Timeline and milestones
9. Risk assessment and mitigation
10. Regulatory considerations

Ensure compliance with ICH-GCP guidelines and applicable regulations."""

            response = await self.process_query(prompt)
            return response
            
        except Exception as e:
            logger.error("❌ Clinical trial design failed", error=str(e))
            raise

    async def analyze_clinical_data(self, data_info: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze clinical trial data"""
        try:
            prompt = f"""Analyze the following clinical trial data:

Data Information:
{json.dumps(data_info, indent=2)}

Please provide:
1. Descriptive statistics and data quality assessment
2. Primary endpoint analysis results
3. Secondary endpoint analysis results
4. Safety analysis and adverse event summary
5. Subgroup analyses and exploratory findings
6. Statistical significance and clinical significance
7. Missing data analysis and handling
8. Interim analysis results (if applicable)
9. Recommendations for final analysis
10. Regulatory reporting requirements

Use appropriate statistical methods and provide clear interpretation."""

            response = await self.process_query(prompt)
            return response
            
        except Exception as e:
            logger.error("❌ Clinical data analysis failed", error=str(e))
            raise

    async def develop_monitoring_plan(self, trial_info: Dict[str, Any]) -> Dict[str, Any]:
        """Develop clinical trial monitoring plan"""
        try:
            prompt = f"""Develop a comprehensive monitoring plan for the following clinical trial:

Trial Information:
{json.dumps(trial_info, indent=2)}

Please provide:
1. Monitoring strategy and approach
2. Site selection and qualification criteria
3. Monitoring visit schedule and frequency
4. Data quality assurance procedures
5. Protocol compliance monitoring
6. Safety monitoring and reporting
7. Investigator and coordinator training
8. Monitoring tools and checklists
9. Risk-based monitoring approach
10. Quality metrics and KPIs

Ensure compliance with ICH-GCP guidelines and best practices."""

            response = await self.process_query(prompt)
            return response
            
        except Exception as e:
            logger.error("❌ Monitoring plan development failed", error=str(e))
            raise

    async def assess_trial_risks(self, trial_info: Dict[str, Any]) -> Dict[str, Any]:
        """Assess clinical trial risks"""
        try:
            prompt = f"""Assess the risks for the following clinical trial:

Trial Information:
{json.dumps(trial_info, indent=2)}

Please provide:
1. Risk identification and categorization
2. Risk probability and impact assessment
3. Patient safety risks and mitigation
4. Data integrity risks and controls
5. Regulatory compliance risks
6. Operational risks and contingencies
7. Financial risks and budget impact
8. Timeline risks and delays
9. Risk monitoring and reporting procedures
10. Risk mitigation strategies and action plans

Use established risk assessment frameworks and provide actionable recommendations."""

            response = await self.process_query(prompt)
            return response
            
        except Exception as e:
            logger.error("❌ Trial risk assessment failed", error=str(e))
            raise

    async def develop_data_management_plan(self, trial_info: Dict[str, Any]) -> Dict[str, Any]:
        """Develop clinical data management plan"""
        try:
            prompt = f"""Develop a comprehensive data management plan for the following clinical trial:

Trial Information:
{json.dumps(trial_info, indent=2)}

Please provide:
1. Data collection strategy and tools
2. Electronic Data Capture (EDC) system requirements
3. Data validation and quality control procedures
4. Query management and resolution process
5. Data privacy and security measures
6. Data standards and coding (CDISC, MedDRA, etc.)
7. Database design and structure
8. Data export and archiving procedures
9. Data access and sharing policies
10. Compliance with regulatory requirements

Ensure adherence to data management best practices and regulatory standards."""

            response = await self.process_query(prompt)
            return response
            
        except Exception as e:
            logger.error("❌ Data management plan development failed", error=str(e))
            raise

    def get_capabilities(self) -> List[str]:
        """Get agent capabilities"""
        return [
            "Clinical trial design",
            "Statistical analysis planning",
            "Data management strategy",
            "Monitoring plan development",
            "Risk assessment and mitigation",
            "GCP compliance guidance",
            "Endpoint selection and validation",
            "Sample size calculation"
        ]

    def get_specialties(self) -> List[str]:
        """Get agent specialties"""
        return self.specialties
