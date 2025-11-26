"""
Agent Orchestration System for VITAL Path
Medical AI agent management with LangChain integration
"""

import asyncio
import json
from typing import List, Dict, Any, Optional, Union
from datetime import datetime, timezone
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
# LangChain 1.0+: AgentExecutor and tools moved to langchain-classic for legacy support
try:
    from langchain.agents import create_openai_tools_agent, AgentExecutor
    from langchain.tools import Tool
    from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
except ImportError:
    # Fallback for LangChain 1.0+ - use langchain-classic
    from langchain_classic.agents import create_openai_tools_agent, AgentExecutor
    from langchain_classic.tools import Tool
    from langchain_classic.prompts import ChatPromptTemplate, MessagesPlaceholder
import structlog
import uuid

from services.supabase_client import SupabaseClient
from services.medical_rag import MedicalRAGPipeline
from core.config import get_settings, AGENT_TYPES, PHARMA_PROTOCOL, VERIFY_PROTOCOL
from models.requests import (
    AgentQueryRequest,
    AgentCreationRequest,
    PromptGenerationRequest
)
from models.responses import (
    AgentQueryResponse,
    AgentCreationResponse,
    PromptGenerationResponse
)
from agents.medical_specialist import MedicalSpecialistAgent
from agents.regulatory_expert import RegulatoryExpertAgent
from agents.clinical_researcher import ClinicalResearcherAgent

logger = structlog.get_logger()

class AgentOrchestrator:
    """Orchestrates medical AI agents with enhanced capabilities"""

    def __init__(self, supabase_client: SupabaseClient, rag_pipeline: MedicalRAGPipeline):
        self.settings = get_settings()
        self.supabase = supabase_client
        self.rag = rag_pipeline
        self.active_agents: Dict[str, Any] = {}
        self.llm = None
        self.agent_classes = {
            "medical_specialist": MedicalSpecialistAgent,
            "regulatory_expert": RegulatoryExpertAgent,
            "clinical_researcher": ClinicalResearcherAgent
        }

    async def initialize(self):
        """Initialize orchestrator and base models"""
        try:
            # Initialize OpenAI LLM
            self.llm = ChatOpenAI(
                openai_api_key=self.settings.openai_api_key,
                model=self.settings.openai_model,
                temperature=0.1,
                max_tokens=4000,
                request_timeout=300
            )

            # Load active agents from database
            await self._load_active_agents()

            logger.info("✅ Agent orchestrator initialized",
                       active_agents=len(self.active_agents))

        except Exception as e:
            logger.error("❌ Failed to initialize agent orchestrator", error=str(e))
            raise

    async def _load_active_agents(self):
        """Load active agents from database"""
        try:
            # This would typically query the database for active agents
            # For now, we'll initialize with default agent types
            for agent_type in AGENT_TYPES.keys():
                agent_id = f"default_{agent_type}"
                self.active_agents[agent_id] = {
                    "id": agent_id,
                    "type": agent_type,
                    "status": "ready",
                    "last_used": None,
                    "usage_count": 0
                }

            logger.info("📚 Active agents loaded", count=len(self.active_agents))

        except Exception as e:
            logger.error("❌ Failed to load active agents", error=str(e))

    async def process_query(self, request: AgentQueryRequest) -> AgentQueryResponse:
        """Process query through appropriate medical agent"""
        start_time = datetime.now()

        try:
            logger.info("🧠 Processing agent query",
                       agent_type=request.agent_type,
                       query_length=len(request.query))

            # Get or create agent
            agent = await self._get_or_create_agent(request.agent_id, request.agent_type)

            # Get relevant context from RAG
            rag_context = await self._get_rag_context(request)

            # Process query through agent
            response = await self._execute_agent_query(agent, request, rag_context)

            # Update agent metrics
            await self._update_agent_metrics(agent["id"], response)

            # Log query for audit trail
            if request.user_id and request.organization_id:
                await self._log_query(request, response)

            processing_time = (datetime.now() - start_time).total_seconds() * 1000

            logger.info("✅ Agent query processed successfully",
                       agent_id=agent["id"],
                       confidence=response.confidence,
                       processing_time_ms=processing_time)

            return response

        except Exception as e:
            logger.error("❌ Agent query processing failed", error=str(e))
            raise

    async def _get_or_create_agent(self, agent_id: Optional[str], agent_type: str) -> Dict[str, Any]:
        """Get existing agent or create new one"""
        try:
            if agent_id and agent_id in self.active_agents:
                return self.active_agents[agent_id]

            if agent_id:
                # Try to load from database
                agent_data = await self.supabase.get_agent_by_id(agent_id)
                if agent_data:
                    agent = await self._initialize_agent_from_data(agent_data)
                    self.active_agents[agent_id] = agent
                    return agent

            # Create default agent for type
            agent = await self._create_default_agent(agent_type)
            return agent

        except Exception as e:
            logger.error("❌ Failed to get or create agent", error=str(e))
            raise

    async def _get_rag_context(self, request: AgentQueryRequest) -> Dict[str, Any]:
        """Get relevant context from RAG pipeline"""
        try:
            if request.max_context_docs == 0:
                return {"documents": [], "context_summary": {}, "total_docs": 0}

            # Prepare RAG filters based on request
            filters = {}
            if request.medical_specialty:
                filters["specialty"] = request.medical_specialty
            if request.phase:
                filters["phase"] = request.phase
            if request.organization_id:
                filters["organization_id"] = request.organization_id

            # Search for relevant documents
            rag_response = await self.rag.enhanced_search(
                query=request.query,
                filters=filters,
                max_results=request.max_context_docs or 5,
                similarity_threshold=request.similarity_threshold or 0.7
            )

            return {
                "documents": rag_response.results,
                "context_summary": rag_response.context_summary,
                "total_docs": rag_response.total_results
            }

        except Exception as e:
            logger.error("❌ Failed to get RAG context", error=str(e))
            return {"documents": [], "context_summary": {}, "total_docs": 0}

    async def _execute_agent_query(
        self,
        agent: Dict[str, Any],
        request: AgentQueryRequest,
        rag_context: Dict[str, Any]
    ) -> AgentQueryResponse:
        """Execute query through specific agent"""
        try:
            # Build system prompt with medical protocols
            system_prompt = await self._build_medical_system_prompt(agent, request)

            # Build context from RAG results
            context_text = self._build_context_text(rag_context)

            # Prepare messages
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Context:\n{context_text}\n\nQuestion: {request.query}")
            ]

            # Execute with LLM
            response = await self.llm.ainvoke(messages)

            # Extract citations from RAG context
            citations = self._extract_citations(rag_context)

            # Calculate confidence score
            confidence = self._calculate_confidence(response.content, rag_context)

            # Parse structured response if available
            structured_response = self._parse_structured_response(response.content)

            return AgentQueryResponse(
                agent_id=agent["id"],
                response=response.content,
                confidence=confidence,
                citations=citations,
                medical_context={
                    "specialty": request.medical_specialty,
                    "phase": request.phase,
                    "compliance_protocols": self._get_applied_protocols(agent),
                    "evidence_level": self._assess_evidence_level(rag_context)
                },
                processing_metadata={
                    "model_used": self.settings.openai_model,
                    "context_docs": len(rag_context.get("documents", [])),
                    "total_tokens": self._estimate_tokens(system_prompt + context_text + request.query),
                    "rag_confidence": rag_context.get("context_summary", {}).get("high_confidence_results", 0)
                },
                structured_data=structured_response
            )

        except Exception as e:
            logger.error("❌ Agent query execution failed", error=str(e))
            raise

    async def _build_medical_system_prompt(
        self,
        agent: Dict[str, Any],
        request: AgentQueryRequest
    ) -> str:
        """Build comprehensive medical system prompt"""
        agent_type = agent.get("type", "general")
        specialty = request.medical_specialty or "general"

        # Base medical AI prompt
        base_prompt = f"""You are a specialized medical AI assistant for {specialty.replace('_', ' ').title()}.

You are an expert in medical and healthcare domains with deep knowledge of:
- Clinical medicine and evidence-based practice
- Regulatory affairs and compliance (FDA, EMA, ICH-GCP)
- Medical research methodology and biostatistics
- Healthcare quality systems and risk management

Your responses must maintain the highest standards of medical accuracy and professional responsibility."""

        # Add PHARMA protocol if required
        if self._should_apply_pharma_protocol(agent, request):
            base_prompt += f"\n\n## PHARMA Protocol Framework\n"
            for key, value in PHARMA_PROTOCOL.items():
                base_prompt += f"- **{key.title()}**: {value}\n"

        # Add VERIFY protocol if required
        if self._should_apply_verify_protocol(agent, request):
            base_prompt += f"\n\n## VERIFY Protocol Framework\n"
            for key, value in VERIFY_PROTOCOL.items():
                base_prompt += f"- **{key.title()}**: {value}\n"

        # Add medical disclaimers
        base_prompt += f"""

## Medical Disclaimers and Compliance
- This AI assistant provides medical information for professional use only
- All recommendations should be verified by qualified healthcare professionals
- Clinical decisions should always consider patient-specific factors
- This system is not a substitute for professional medical judgment
- Emergency situations require immediate human medical intervention

## Response Requirements
- Provide confidence scores for medical recommendations
- Include relevant citations from authoritative medical sources
- Clearly identify limitations and areas requiring expert review
- Maintain HIPAA compliance in all interactions
- Follow FDA 21 CFR Part 11 audit trail requirements"""

        # Add agent-specific instructions
        if agent_type in AGENT_TYPES:
            agent_config = AGENT_TYPES[agent_type]
            base_prompt += f"\n\n## Agent-Specific Instructions\n"
            base_prompt += f"Temperature: {agent_config.get('temperature', 0.1)}\n"
            base_prompt += f"Specialized Models: {', '.join(agent_config.get('models', []))}\n"
            base_prompt += f"Focus Areas: {', '.join(agent_config.get('specialties', []))}\n"

        return base_prompt

    def _should_apply_pharma_protocol(self, agent: Dict[str, Any], request: Optional[AgentQueryRequest]) -> bool:
        """Determine if PHARMA protocol should be applied"""
        if request is None:
            # When no request context, check agent type only
            return agent.get("type") in ["regulatory", "safety"]
        
        return (
            request.pharma_protocol_required or
            agent.get("type") in ["regulatory", "safety"] or
            request.medical_specialty in ["regulatory_affairs", "pharmacovigilance"]
        )

    def _should_apply_verify_protocol(self, agent: Dict[str, Any], request: Optional[AgentQueryRequest]) -> bool:
        """Determine if VERIFY protocol should be applied"""
        if request is None:
            # When no request context, check agent type or global setting
            return (
                agent.get("type") in ["regulatory", "clinical", "literature"] or
                self.settings.verify_protocol_enabled
            )
        
        return (
            request.verify_protocol_required or
            agent.get("type") in ["regulatory", "clinical", "literature"] or
            self.settings.verify_protocol_enabled
        )

    def _build_context_text(self, rag_context: Dict[str, Any]) -> str:
        """Build context text from RAG results"""
        documents = rag_context.get("documents", [])
        if not documents:
            return "No specific context documents found for this query."

        context_parts = []
        for i, doc in enumerate(documents[:5], 1):  # Limit to top 5 documents
            metadata = doc.get("metadata", {})
            medical_context = doc.get("medical_context", {})

            context_part = f"""
Document {i}:
Title: {metadata.get('title', 'Unknown')}
Source: {metadata.get('source', 'Unknown')}
Evidence Level: {medical_context.get('evidence_level', 'Not specified')}
Confidence: {doc.get('final_score', doc.get('similarity', 0)):.2f}
Content: {doc.get('content', '')[:800]}...
"""
            context_parts.append(context_part.strip())

        return "\n\n".join(context_parts)

    def _extract_citations(self, rag_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract citations from RAG context"""
        citations = []
        documents = rag_context.get("documents", [])

        for doc in documents:
            metadata = doc.get("metadata", {})
            medical_context = doc.get("medical_context", {})

            citation = {
                "source": metadata.get("title", "Unknown Source"),
                "url": metadata.get("url", ""),
                "authors": metadata.get("authors", ""),
                "publication_year": metadata.get("publication_year", ""),
                "journal": metadata.get("journal", ""),
                "doi": metadata.get("doi", ""),
                "evidence_level": medical_context.get("evidence_level", ""),
                "confidence_score": doc.get("final_score", doc.get("similarity", 0)),
                "citation_format": medical_context.get("citation_format", "")
            }
            citations.append(citation)

        return citations

    def _calculate_confidence(self, response_content: str, rag_context: Dict[str, Any]) -> float:
        """Calculate confidence score for response"""
        base_confidence = 0.7  # Base confidence

        # Boost for high-quality RAG matches
        documents = rag_context.get("documents", [])
        if documents:
            avg_doc_confidence = sum(
                doc.get("final_score", doc.get("similarity", 0))
                for doc in documents
            ) / len(documents)
            base_confidence += (avg_doc_confidence - 0.7) * 0.3

        # Boost for medical terminology usage
        medical_terms = [
            "evidence", "study", "clinical", "research", "analysis",
            "statistically significant", "confidence interval", "p-value"
        ]
        term_count = sum(1 for term in medical_terms if term.lower() in response_content.lower())
        base_confidence += min(term_count * 0.02, 0.1)

        # Reduce confidence for uncertainty markers
        uncertainty_markers = [
            "uncertain", "unclear", "possibly", "might", "could be",
            "further research needed", "limited evidence"
        ]
        uncertainty_count = sum(1 for marker in uncertainty_markers if marker in response_content.lower())
        base_confidence -= min(uncertainty_count * 0.05, 0.2)

        return max(0.1, min(1.0, base_confidence))

    def _get_applied_protocols(self, agent: Dict[str, Any]) -> List[str]:
        """Get list of applied protocols"""
        protocols = []
        if self._should_apply_pharma_protocol(agent, None):
            protocols.append("PHARMA")
        if self._should_apply_verify_protocol(agent, None):
            protocols.append("VERIFY")
        return protocols

    def _assess_evidence_level(self, rag_context: Dict[str, Any]) -> str:
        """Assess overall evidence level from context"""
        documents = rag_context.get("documents", [])
        if not documents:
            return "No evidence"

        evidence_levels = []
        for doc in documents:
            medical_context = doc.get("medical_context", {})
            level = medical_context.get("evidence_level", "")
            if level and level.startswith("Level"):
                try:
                    level_num = int(level.split()[1])
                    evidence_levels.append(level_num)
                except:
                    pass

        if evidence_levels:
            avg_level = sum(evidence_levels) / len(evidence_levels)
            return f"Level {round(avg_level)}"
        else:
            return "Mixed evidence"

    def _parse_structured_response(self, response_content: str) -> Optional[Dict[str, Any]]:
        """Parse structured data from response if available"""
        try:
            # Look for JSON blocks in response
            if "```json" in response_content:
                start = response_content.find("```json") + 7
                end = response_content.find("```", start)
                if end > start:
                    json_str = response_content[start:end].strip()
                    return json.loads(json_str)

            return None

        except Exception as e:
            logger.warning("⚠️ Failed to parse structured response", error=str(e))
            return None

    def _estimate_tokens(self, text: str) -> int:
        """Estimate token count for text"""
        # Rough estimation: 1 token ≈ 4 characters
        return len(text) // 4

    async def _update_agent_metrics(self, agent_id: str, response: AgentQueryResponse):
        """Update agent performance metrics"""
        try:
            metrics = {
                "increment_usage": True,
                "average_confidence": response.confidence,
                "average_response_time": response.processing_metadata.get("processing_time_ms", 0),
                "success_rate": 1.0 if response.confidence > 0.7 else 0.8
            }

            await self.supabase.update_agent_metrics(agent_id, metrics)

        except Exception as e:
            logger.error("❌ Failed to update agent metrics", error=str(e))

    async def _log_query(self, request: AgentQueryRequest, response: AgentQueryResponse):
        """Log query for audit trail"""
        try:
            query_data = {
                "query": request.query,
                "query_type": request.agent_type,
                "phase": request.phase,
                "response": {
                    "content": response.response,
                    "confidence": response.confidence,
                    "model": response.processing_metadata.get("model_used")
                },
                "confidence": response.confidence,
                "models_used": [response.processing_metadata.get("model_used")],
                "processing_time": response.processing_metadata.get("processing_time_ms"),
                "tokens_used": response.processing_metadata.get("total_tokens"),
                "citations": response.citations
            }

            await self.supabase.log_query(
                user_id=request.user_id,
                organization_id=request.organization_id,
                query_data=query_data
            )

        except Exception as e:
            logger.error("❌ Failed to log query", error=str(e))

    async def create_agent(self, request: AgentCreationRequest) -> AgentCreationResponse:
        """Create new medical AI agent"""
        try:
            logger.info("🤖 Creating new agent", agent_name=request.name)

            # Generate agent configuration
            agent_config = {
                "id": str(uuid.uuid4()),
                "name": request.name,
                "type": request.agent_type,
                "medical_specialty": request.medical_specialty,
                "system_prompt": request.system_prompt,
                "capabilities": request.capabilities,
                "tools": request.tools or [],
                "model_config": {
                    "temperature": request.temperature or AGENT_TYPES.get(request.agent_type, {}).get("temperature", 0.1),
                    "max_tokens": request.max_tokens or 4000,
                    "model": request.model or self.settings.openai_model
                },
                "compliance": {
                    "pharma_protocol": request.pharma_protocol_required,
                    "verify_protocol": request.verify_protocol_required,
                    "hipaa_compliant": True,
                    "fda_21cfr11": True
                },
                "created_at": datetime.now(timezone.utc).isoformat(),
                "created_by": request.created_by,
                "organization_id": request.organization_id,
                "status": "active"
            }

            # Store in database
            agent_id = await self.supabase.create_agent(agent_config)

            if agent_id:
                # Add to active agents
                self.active_agents[agent_id] = agent_config

                logger.info("✅ Agent created successfully", agent_id=agent_id)

                return AgentCreationResponse(
                    agent_id=agent_id,
                    name=request.name,
                    agent_type=request.agent_type,
                    status="active",
                    capabilities=request.capabilities,
                    created_at=agent_config["created_at"]
                )
            else:
                raise Exception("Failed to store agent in database")

        except Exception as e:
            logger.error("❌ Agent creation failed", error=str(e))
            raise

    async def generate_system_prompt(
        self,
        request: PromptGenerationRequest
    ) -> PromptGenerationResponse:
        """Generate medical-grade system prompts with compliance protocols"""
        try:
            logger.info("📝 Generating system prompt", capabilities_count=len(request.selected_capabilities))

            # Build prompt components
            prompt_parts = []

            # Base medical AI identity
            base_identity = self._build_base_medical_identity(request.medical_context)
            prompt_parts.append(base_identity)

            # Add capabilities
            capabilities_section = self._build_capabilities_section(request.selected_capabilities)
            prompt_parts.append(capabilities_section)

            # Add compliance protocols
            if request.pharma_protocol_required:
                pharma_section = self._build_pharma_protocol_section()
                prompt_parts.append(pharma_section)

            if request.verify_protocol_required:
                verify_section = self._build_verify_protocol_section()
                prompt_parts.append(verify_section)

            # Add medical disclaimers
            disclaimers_section = self._build_medical_disclaimers()
            prompt_parts.append(disclaimers_section)

            # Combine all parts
            final_prompt = "\n\n".join(prompt_parts)

            # Generate metadata
            metadata = {
                "token_count": self._estimate_tokens(final_prompt),
                "capabilities": request.selected_capabilities,
                "skills": request.required_skills or [],
                "tools": request.tools or [],
                "agent_level": request.required_agent_level,
                "compliance_level": "High" if (request.pharma_protocol_required and request.verify_protocol_required) else "Medium",
                "medical_specialty": request.medical_context.get('medical_specialty') if request.medical_context else None,
                "business_function": request.medical_context.get('business_function') if request.medical_context else None,
                "generated_at": datetime.now(timezone.utc).isoformat()
            }

            logger.info("✅ System prompt generated successfully",
                       token_count=metadata["token_count"],
                       compliance_level=metadata["compliance_level"])

            return PromptGenerationResponse(
                system_prompt=final_prompt,
                metadata=metadata,
                validation_required=request.pharma_protocol_required,
                estimated_accuracy=self._calculate_estimated_accuracy(request.selected_capabilities),
                compliance_protocols=[
                    "PHARMA" if request.pharma_protocol_required else None,
                    "VERIFY" if request.verify_protocol_required else None
                ]
            )

        except Exception as e:
            logger.error("❌ System prompt generation failed", error=str(e))
            raise

    def _build_base_medical_identity(self, medical_context) -> str:
        """Build base medical AI identity"""
        specialty = medical_context.medical_specialty.replace('_', ' ').title()
        business_function = medical_context.business_function.replace('_', ' ').title()

        return f"""# Medical AI Assistant - {medical_context.role}

You are a specialized medical AI assistant for {business_function} in {specialty}.
Your expertise covers {specialty} with a focus on {medical_context.focus_area}.

You maintain the highest standards of medical accuracy and professional responsibility, ensuring all responses are:
- Evidence-based and clinically relevant
- Compliant with medical regulations and guidelines
- Appropriate for healthcare professional use
- Backed by authoritative medical sources"""

    def _build_capabilities_section(self, capabilities) -> str:
        """Build capabilities section"""
        if not capabilities:
            return ""

        section = "## Core Capabilities\n\n"
        for capability in capabilities:
            section += f"- **{capability.get('name', 'Unknown')}**: {capability.get('description', '')}\n"

        return section

    def _build_pharma_protocol_section(self) -> str:
        """Build PHARMA protocol section"""
        section = "## PHARMA Protocol Framework\n\n"
        for key, value in PHARMA_PROTOCOL.items():
            section += f"- **{key.title()}**: {value}\n"

        return section

    def _build_verify_protocol_section(self) -> str:
        """Build VERIFY protocol section"""
        section = "## VERIFY Protocol Framework\n\n"
        for key, value in VERIFY_PROTOCOL.items():
            section += f"- **{key.title()}**: {value}\n"

        return section

    def _build_medical_disclaimers(self) -> str:
        """Build medical disclaimers section"""
        return """## Medical Disclaimers and Compliance

- This AI assistant provides medical information for professional use only
- All recommendations should be verified by qualified healthcare professionals
- Clinical decisions should always consider patient-specific factors
- This system is not a substitute for professional medical judgment
- Emergency situations require immediate human medical intervention
- Maintain HIPAA compliance in all interactions
- Follow FDA 21 CFR Part 11 audit trail requirements"""

    def _calculate_estimated_accuracy(self, capabilities) -> float:
        """Calculate estimated accuracy based on capabilities"""
        if not capabilities:
            return 0.95

        accuracy_sum = sum(cap.get('accuracy_threshold', 0.95) for cap in capabilities)
        return round(accuracy_sum / len(capabilities), 2)

    async def _create_default_agent(self, agent_type: str) -> Dict[str, Any]:
        """Create default agent for type"""
        agent_id = f"default_{agent_type}_{uuid.uuid4().hex[:8]}"

        agent = {
            "id": agent_id,
            "name": f"Default {agent_type.title()} Agent",
            "type": agent_type,
            "status": "ready",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_default": True
        }

        self.active_agents[agent_id] = agent
        return agent

    async def _initialize_agent_from_data(self, agent_data: Dict[str, Any]) -> Dict[str, Any]:
        """Initialize agent from database data"""
        return {
            "id": agent_data["id"],
            "name": agent_data["name"],
            "type": agent_data.get("agent_type", "general"),
            "status": agent_data.get("status", "ready"),
            "config": agent_data,
            "loaded_at": datetime.now(timezone.utc).isoformat()
        }

    async def process_websocket_message(
        self,
        agent_id: str,
        message: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process WebSocket message for real-time agent interaction"""
        try:
            message_type = message.get("type", "query")

            if message_type == "query":
                # Convert to AgentQueryRequest
                request = AgentQueryRequest(
                    agent_id=agent_id,
                    agent_type=message.get("agent_type", "general"),
                    query=message.get("query", ""),
                    user_id=message.get("user_id"),
                    organization_id=message.get("organization_id")
                )

                response = await self.process_query(request)

                return {
                    "type": "query_response",
                    "agent_id": agent_id,
                    "response": response.response,
                    "confidence": response.confidence,
                    "citations": response.citations,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }

            elif message_type == "status":
                agent = self.active_agents.get(agent_id)
                return {
                    "type": "status_response",
                    "agent_id": agent_id,
                    "status": agent.get("status", "unknown") if agent else "not_found",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }

            else:
                return {
                    "type": "error",
                    "error": f"Unknown message type: {message_type}",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }

        except Exception as e:
            logger.error("❌ WebSocket message processing failed", error=str(e))
            return {
                "type": "error",
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

    async def get_active_agent_count(self) -> int:
        """Get count of active agents"""
        return len(self.active_agents)

    async def cleanup(self):
        """Cleanup orchestrator resources"""
        logger.info("🧹 Agent orchestrator cleanup completed")
