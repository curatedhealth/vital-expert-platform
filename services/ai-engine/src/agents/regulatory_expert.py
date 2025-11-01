"""
Regulatory Expert Agent
Specialized regulatory affairs agent for FDA, EMA, and global compliance
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

class RegulatoryExpertAgent:
    """Regulatory expert agent with comprehensive regulatory affairs expertise"""
    
    def __init__(self):
        self.agent_id = "regulatory_expert"
        self.name = "Regulatory Expert"
        self.tier = 1  # Tier 1 specialist (regulatory is critical)
        self.specialties = [
            "fda_regulatory",
            "ema_regulatory",
            "ich_guidelines",
            "quality_assurance",
            "compliance_monitoring"
        ]
        self.llm = None
        self.confidence_calculator = get_confidence_calculator()
        self.system_prompt = """You are a Regulatory Expert AI with comprehensive expertise in global regulatory affairs for medical devices and pharmaceuticals. Your role is to provide accurate regulatory guidance and ensure compliance with FDA, EMA, ICH, and other global regulatory requirements.

## CORE IDENTITY
You have 20+ years of experience in regulatory affairs with expertise in:
- FDA 510(k), PMA, De Novo, and IDE submissions
- EU MDR 2017/745 and IVDR 2017/746 compliance
- ICH guidelines and global harmonization
- Quality management systems (ISO 13485, 21 CFR 820)
- Post-market surveillance and vigilance

## EXPERTISE AREAS:
### FDA Regulatory Affairs
- 510(k) Premarket Notifications
- Premarket Approval (PMA) applications
- De Novo classification requests
- Investigational Device Exemptions (IDE)
- Quality System Regulation (21 CFR 820)
- Post-market surveillance requirements

### EU Regulatory Affairs
- Medical Device Regulation (MDR 2017/745)
- In Vitro Diagnostic Regulation (IVDR 2017/746)
- CE Marking and Declaration of Conformity
- Notified Body interactions
- EUDAMED database management
- Post-market surveillance (PMS)

### Global Regulatory Strategy
- ICH guidelines and harmonization
- Health Canada requirements
- TGA (Australia) submissions
- PMDA (Japan) regulatory pathway
- NMPA (China) registration
- ANVISA (Brazil) requirements

### Quality and Compliance
- ISO 13485 Quality Management Systems
- ISO 14971 Risk Management
- FDA 21 CFR Part 11 Electronic Records
- HIPAA compliance for medical devices
- Good Manufacturing Practice (GMP)
- Good Clinical Practice (GCP)

## OPERATING PRINCIPLES:
1. **Regulatory Accuracy**: Ensure all guidance is current and accurate
2. **Compliance Focus**: Prioritize regulatory compliance in all recommendations
3. **Risk Mitigation**: Identify and address regulatory risks proactively
4. **Global Perspective**: Consider multiple regulatory jurisdictions
5. **Documentation Excellence**: Maintain comprehensive regulatory documentation

## RESPONSE GUIDELINES:
- Always reference specific regulations and guidance documents
- Provide regulatory timelines and requirements
- Include risk assessments and mitigation strategies
- Suggest regulatory consultation when appropriate
- Maintain audit trail for regulatory decisions"""

    async def initialize(self):
        """Initialize the regulatory expert agent"""
        try:
            self.llm = ChatOpenAI(
                openai_api_key=os.getenv("OPENAI_API_KEY"),
                model="gpt-4-turbo-preview",
                temperature=0.05,  # Lower temperature for regulatory accuracy
                max_tokens=4000
            )
            logger.info("✅ Regulatory Expert Agent initialized")
        except Exception as e:
            logger.error("❌ Failed to initialize Regulatory Expert Agent", error=str(e))
            raise

    async def process_query(self, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process a regulatory query with expert guidance"""
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
                    "temperature": 0.05,
                    "max_tokens": 4000,
                    "tier": self.tier
                }
            }
            
            logger.info("✅ Regulatory Expert query processed", 
                       query_length=len(query),
                       response_length=len(response.content))
            
            return result
            
        except Exception as e:
            logger.error("❌ Regulatory Expert query failed", error=str(e))
            raise

    async def assess_regulatory_pathway(self, device_info: Dict[str, Any]) -> Dict[str, Any]:
        """Assess regulatory pathway for medical device"""
        try:
            prompt = f"""Assess the regulatory pathway for the following medical device:

Device Information:
{json.dumps(device_info, indent=2)}

Please provide:
1. FDA classification and pathway (510(k), PMA, De Novo, etc.)
2. EU MDR classification and conformity assessment procedure
3. Required documentation and testing
4. Timeline estimates for each jurisdiction
5. Risk assessment and mitigation strategies
6. Cost estimates for regulatory activities
7. Post-market surveillance requirements

Consider all applicable regulations and provide specific guidance."""

            response = await self.process_query(prompt)
            return response
            
        except Exception as e:
            logger.error("❌ Regulatory pathway assessment failed", error=str(e))
            raise

    async def review_submission_document(self, document: str, submission_type: str) -> Dict[str, Any]:
        """Review regulatory submission document"""
        try:
            prompt = f"""Review the following {submission_type} submission document:

Document:
{document}

Please provide:
1. Completeness assessment
2. Regulatory compliance review
3. Identified deficiencies and recommendations
4. Required additional information
5. Risk assessment for submission success
6. Timeline for addressing issues
7. Best practices and optimization suggestions

Focus on regulatory requirements and submission success factors."""

            response = await self.process_query(prompt)
            return response
            
        except Exception as e:
            logger.error("❌ Submission document review failed", error=str(e))
            raise

    async def develop_compliance_strategy(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Develop regulatory compliance strategy"""
        try:
            prompt = f"""Develop a comprehensive regulatory compliance strategy based on the following requirements:

Requirements:
{json.dumps(requirements, indent=2)}

Please provide:
1. Regulatory landscape analysis
2. Compliance roadmap and timeline
3. Resource requirements and budget
4. Risk mitigation strategies
5. Quality management system requirements
6. Documentation and record-keeping plan
7. Training and competency requirements
8. Monitoring and audit schedule

Ensure comprehensive coverage of all applicable regulations."""

            response = await self.process_query(prompt)
            return response
            
        except Exception as e:
            logger.error("❌ Compliance strategy development failed", error=str(e))
            raise

    async def assess_post_market_requirements(self, device_info: Dict[str, Any]) -> Dict[str, Any]:
        """Assess post-market surveillance requirements"""
        try:
            prompt = f"""Assess post-market surveillance requirements for the following device:

Device Information:
{json.dumps(device_info, indent=2)}

Please provide:
1. FDA post-market requirements (MDR, Field Safety Notices, etc.)
2. EU MDR post-market surveillance (PMS) requirements
3. Vigilance reporting obligations
4. Periodic Safety Update Reports (PSUR)
5. Post-Market Clinical Follow-up (PMCF) requirements
6. Quality management system updates
7. Regulatory reporting timelines and procedures

Include specific regulatory references and requirements."""

            response = await self.process_query(prompt)
            return response
            
        except Exception as e:
            logger.error("❌ Post-market requirements assessment failed", error=str(e))
            raise

    def get_capabilities(self) -> List[str]:
        """Get agent capabilities"""
        return [
            "Regulatory pathway assessment",
            "Submission document review",
            "Compliance strategy development",
            "Post-market requirements analysis",
            "FDA regulatory guidance",
            "EU MDR compliance support",
            "ICH guidelines interpretation",
            "Quality system guidance"
        ]

    def get_specialties(self) -> List[str]:
        """Get agent specialties"""
        return self.specialties
