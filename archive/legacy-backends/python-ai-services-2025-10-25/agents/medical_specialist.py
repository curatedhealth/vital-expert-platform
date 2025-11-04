"""
Medical Specialist Agent
Specialized medical AI agent for clinical and regulatory expertise
"""

import asyncio
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage, AIMessage
import structlog
from services.confidence_calculator import get_confidence_calculator

logger = structlog.get_logger()

class MedicalSpecialistAgent:
    """Medical specialist agent with clinical and regulatory expertise"""
    
    def __init__(self):
        self.agent_id = "medical_specialist"
        self.name = "Medical Specialist"
        self.tier = 1  # Tier 1 specialist
        self.specialties = [
            "clinical_research",
            "regulatory_affairs",
            "medical_writing",
            "pharmacovigilance"
        ]
        self.llm = None
        self.confidence_calculator = get_confidence_calculator()
        self.system_prompt = """You are a Medical Specialist AI with comprehensive expertise in clinical research, regulatory affairs, and medical writing. Your role is to provide accurate, evidence-based medical guidance while ensuring regulatory compliance.

## CORE IDENTITY
You have 15+ years of experience in medical device and pharmaceutical development with expertise in:
- Clinical trial design and execution
- Regulatory submissions (FDA, EMA, ICH)
- Medical writing and documentation
- Pharmacovigilance and safety monitoring
- Quality assurance and compliance

## EXPERTISE AREAS:
### Clinical Research
- Protocol development and study design
- Clinical trial management and monitoring
- Data analysis and statistical interpretation
- Good Clinical Practice (GCP) compliance
- Clinical endpoint selection and validation

### Regulatory Affairs
- FDA 510(k), PMA, and De Novo submissions
- EU MDR and IVDR compliance
- ICH guidelines and harmonization
- Regulatory strategy and planning
- Post-market surveillance requirements

### Medical Writing
- Clinical study reports and protocols
- Regulatory submission documents
- Scientific publications and manuscripts
- Patient information and labeling
- Medical device documentation

## OPERATING PRINCIPLES:
1. **Evidence-Based**: All recommendations must be supported by scientific evidence
2. **Regulatory Compliance**: Ensure adherence to applicable regulations
3. **Patient Safety**: Prioritize patient safety in all recommendations
4. **Scientific Rigor**: Maintain highest standards of scientific accuracy
5. **Clear Communication**: Provide clear, actionable guidance

## RESPONSE GUIDELINES:
- Always cite relevant regulations and guidelines
- Provide confidence levels for recommendations
- Include disclaimers for medical advice
- Suggest consultation with qualified professionals when appropriate
- Maintain audit trail for regulatory compliance"""

    async def initialize(self):
        """Initialize the medical specialist agent"""
        try:
            self.llm = ChatOpenAI(
                openai_api_key=os.getenv("OPENAI_API_KEY"),
                model="gpt-4-turbo-preview",
                temperature=0.1,
                max_tokens=4000
            )
            logger.info("✅ Medical Specialist Agent initialized")
        except Exception as e:
            logger.error("❌ Failed to initialize Medical Specialist Agent", error=str(e))
            raise

    async def process_query(self, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process a medical query with specialist expertise"""
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
                    "temperature": 0.1,
                    "max_tokens": 4000,
                    "tier": self.tier
                }
            }
            
            logger.info("✅ Medical Specialist query processed", 
                       query_length=len(query),
                       response_length=len(response.content))
            
            return result
            
        except Exception as e:
            logger.error("❌ Medical Specialist query failed", error=str(e))
            raise

    async def generate_clinical_protocol(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Generate clinical protocol based on requirements"""
        try:
            prompt = f"""Generate a comprehensive clinical protocol based on the following requirements:

Requirements:
{json.dumps(requirements, indent=2)}

Please include:
1. Study objectives and endpoints
2. Study design and methodology
3. Inclusion/exclusion criteria
4. Safety monitoring plan
5. Statistical analysis plan
6. Regulatory considerations
7. Timeline and milestones

Ensure compliance with ICH-GCP guidelines and applicable regulations."""

            response = await self.process_query(prompt)
            return response
            
        except Exception as e:
            logger.error("❌ Clinical protocol generation failed", error=str(e))
            raise

    async def review_regulatory_document(self, document: str, document_type: str) -> Dict[str, Any]:
        """Review regulatory document for compliance"""
        try:
            prompt = f"""Review the following {document_type} for regulatory compliance:

Document:
{document}

Please provide:
1. Compliance assessment
2. Identified issues and recommendations
3. Regulatory references
4. Risk assessment
5. Action items for improvement

Focus on FDA, EMA, and ICH guidelines as applicable."""

            response = await self.process_query(prompt)
            return response
            
        except Exception as e:
            logger.error("❌ Regulatory document review failed", error=str(e))
            raise

    async def assess_medical_risk(self, scenario: str) -> Dict[str, Any]:
        """Assess medical risk for given scenario"""
        try:
            prompt = f"""Assess the medical risk for the following scenario:

Scenario:
{scenario}

Please provide:
1. Risk identification and analysis
2. Risk level assessment (Low/Medium/High/Critical)
3. Mitigation strategies
4. Monitoring requirements
5. Regulatory reporting obligations
6. Patient safety considerations

Use established risk assessment frameworks and regulatory guidelines."""

            response = await self.process_query(prompt)
            return response
            
        except Exception as e:
            logger.error("❌ Medical risk assessment failed", error=str(e))
            raise

    def get_capabilities(self) -> List[str]:
        """Get agent capabilities"""
        return [
            "Clinical protocol development",
            "Regulatory document review",
            "Medical risk assessment",
            "Clinical trial design",
            "Regulatory strategy planning",
            "Medical writing support",
            "Compliance assessment",
            "Safety monitoring guidance"
        ]

    def get_specialties(self) -> List[str]:
        """Get agent specialties"""
        return self.specialties
