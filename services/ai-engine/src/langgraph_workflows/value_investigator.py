"""
Value Investigator AI Companion
LangGraph workflow for intelligent value analysis and ROI insights

Uses LATEST REASONING MODELS (2025) for deep analytical capabilities:
- Primary: Claude Opus 4.5 (best reasoning, extended thinking)
- Secondary: OpenAI o1 (chain-of-thought reasoning)
- Tertiary: Gemini 2.5 Pro (multimodal reasoning)

Capabilities:
- Value gap analysis with extended reasoning
- ROI optimization recommendations
- Strategic value insights with citations
- Cross-functional value mapping
"""

import logging
import json
import os
from typing import Dict, List, Any, Optional, Literal, Annotated
from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID

from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage

# Try to import Anthropic, fallback to OpenAI if not available
try:
    from langchain_anthropic import ChatAnthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    ChatAnthropic = None

from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

# Try to import Google GenAI for Gemini 2.5 Pro
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    ChatGoogleGenerativeAI = None

# Try to import HuggingFace for open-source reasoning models
try:
    from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace
    HUGGINGFACE_AVAILABLE = True
except ImportError:
    try:
        from langchain_community.llms import HuggingFaceEndpoint
        from langchain_community.chat_models.huggingface import ChatHuggingFace
        HUGGINGFACE_AVAILABLE = True
    except ImportError:
        HUGGINGFACE_AVAILABLE = False
        HuggingFaceEndpoint = None
        ChatHuggingFace = None

# HuggingFace Model Configuration (2025 Open-Source Reasoning Models)
HUGGINGFACE_MODELS = {
    # ================================================================
    # MEDICAL/CLINICAL REASONING MODELS (Priority for pharma queries)
    # ================================================================
    "meditron-70b": {
        "repo_id": "CuratedHealth/meditron70b-qlora-1gpu",
        "description": "Medical reasoning specialist, 70B parameters",
        "use_case": "pharma_medical_analysis",
        "confidence": 0.88,
        "domain": "medical"
    },
    "meditron-7b-chat": {
        "repo_id": "CuratedHealth/meditron7b-lora-chat",
        "description": "Clinical chat model, 7B parameters",
        "use_case": "clinical_conversations",
        "confidence": 0.82,
        "domain": "medical"
    },
    "qwen3-medical": {
        "repo_id": "CuratedHealth/Qwen3-8B-SFT-20250917123923",
        "description": "Medical fine-tuned Qwen3, 8B parameters",
        "use_case": "medical_research",
        "confidence": 0.84,
        "domain": "medical"
    },

    # ================================================================
    # GOOGLE GEMMA MODELS (2025 - Excellent Medical Capabilities)
    # ================================================================
    "gemma2-27b": {
        "repo_id": "google/gemma-2-27b-it",
        "description": "Gemma 2 27B instruction-tuned, strong medical reasoning",
        "use_case": "complex_medical_reasoning",
        "confidence": 0.89,
        "domain": "medical"
    },
    "gemma2-9b": {
        "repo_id": "google/gemma-2-9b-it",
        "description": "Gemma 2 9B instruction-tuned, efficient medical analysis",
        "use_case": "efficient_medical_analysis",
        "confidence": 0.85,
        "domain": "medical"
    },
    "medgemma-27b": {
        "repo_id": "google/medgemma-27b-text-it",
        "description": "MedGemma 27B - Medical specialist Gemma, healthcare-focused",
        "use_case": "clinical_medical_specialist",
        "confidence": 0.91,
        "domain": "medical"
    },
    "medgemma-4b": {
        "repo_id": "google/medgemma-4b-it",
        "description": "MedGemma 4B - Lightweight medical specialist",
        "use_case": "fast_medical_queries",
        "confidence": 0.83,
        "domain": "medical"
    },
    "biogemma-2b": {
        "repo_id": "google/biogemma-2b-it",
        "description": "BioGemma 2B - Biomedical specialist, PubMed trained",
        "use_case": "biomedical_research",
        "confidence": 0.82,
        "domain": "medical"
    },

    # ================================================================
    # GENERAL REASONING MODELS (2025 Latest)
    # ================================================================
    "deepseek-r1": {
        "repo_id": "deepseek-ai/DeepSeek-R1",
        "description": "DeepSeek R1 reasoning model, chain-of-thought",
        "use_case": "general_reasoning",
        "confidence": 0.87,
        "domain": "general"
    },
    "qwen2.5-72b": {
        "repo_id": "Qwen/Qwen2.5-72B-Instruct",
        "description": "Qwen 2.5 72B, excellent reasoning",
        "use_case": "complex_analysis",
        "confidence": 0.85,
        "domain": "general"
    },
    "llama3.3-70b": {
        "repo_id": "meta-llama/Llama-3.3-70B-Instruct",
        "description": "LLaMA 3.3 70B, strong reasoning",
        "use_case": "general_analysis",
        "confidence": 0.83,
        "domain": "general"
    },
    "mistral-large": {
        "repo_id": "mistralai/Mistral-Large-Instruct-2411",
        "description": "Mistral Large 2411, strong multilingual reasoning",
        "use_case": "multilingual_analysis",
        "confidence": 0.84,
        "domain": "general"
    }
}

# Medical/Pharma keywords for context-aware model selection
MEDICAL_KEYWORDS = [
    "medical", "clinical", "drug", "pharma", "therapeutic", "patient",
    "treatment", "dosage", "adverse", "efficacy", "safety", "regulatory",
    "fda", "ema", "trial", "indication", "contraindication", "mechanism",
    "hcp", "physician", "healthcare", "biomarker", "endpoint", "protocol",
    "disease", "therapy", "medication", "prescription", "compliance",
    "medical affairs", "msl", "kol", "evidence", "literature", "publications"
]


def select_best_huggingface_model(query: str, analysis_type: str) -> list:
    """
    Intelligently select HuggingFace models based on query context.
    Returns ordered list of (model_name, repo_id, confidence) tuples.

    Medical queries prioritize: MedGemma > Gemma2 > Meditron > Qwen-Medical
    General queries prioritize: DeepSeek-R1 > Qwen2.5 > LLaMA > Gemma2
    """
    query_lower = query.lower()

    # Check if query is medical/pharma related
    is_medical_context = any(kw in query_lower for kw in MEDICAL_KEYWORDS)

    # Also check analysis type
    medical_analysis_types = ["jtbd_value_analysis", "role_value_analysis", "driver_analysis"]
    if analysis_type in medical_analysis_types:
        is_medical_context = True

    if is_medical_context:
        # Prioritize medical-specialized models for pharma/healthcare queries
        # MedGemma is specifically designed for healthcare - highest priority
        logger.info("Detected medical/pharma context - prioritizing MedGemma and medical models")
        return [
            # Google MedGemma - Healthcare specialist (highest priority for medical)
            ("medgemma-27b", HUGGINGFACE_MODELS["medgemma-27b"]["repo_id"], 0.91),
            # Gemma 2 - Strong medical reasoning capabilities
            ("gemma2-27b", HUGGINGFACE_MODELS["gemma2-27b"]["repo_id"], 0.89),
            # CuratedHealth Meditron - Pharma specialist
            ("meditron-70b", HUGGINGFACE_MODELS["meditron-70b"]["repo_id"], 0.88),
            # Gemma 2 smaller variant - efficient
            ("gemma2-9b", HUGGINGFACE_MODELS["gemma2-9b"]["repo_id"], 0.85),
            # BioGemma - Biomedical/PubMed trained
            ("biogemma-2b", HUGGINGFACE_MODELS["biogemma-2b"]["repo_id"], 0.82),
            # CuratedHealth Qwen3 Medical
            ("qwen3-medical", HUGGINGFACE_MODELS["qwen3-medical"]["repo_id"], 0.84),
            # MedGemma lightweight for fast queries
            ("medgemma-4b", HUGGINGFACE_MODELS["medgemma-4b"]["repo_id"], 0.83),
            # General fallback
            ("deepseek-r1", HUGGINGFACE_MODELS["deepseek-r1"]["repo_id"], 0.85),
        ]
    else:
        # General reasoning queries - use general-purpose models first
        logger.info("Using general-purpose reasoning models")
        return [
            # DeepSeek R1 - Excellent chain-of-thought reasoning
            ("deepseek-r1", HUGGINGFACE_MODELS["deepseek-r1"]["repo_id"], 0.87),
            # Qwen 2.5 - Strong across benchmarks
            ("qwen2.5-72b", HUGGINGFACE_MODELS["qwen2.5-72b"]["repo_id"], 0.85),
            # LLaMA 3.3 - Reliable general purpose
            ("llama3.3-70b", HUGGINGFACE_MODELS["llama3.3-70b"]["repo_id"], 0.83),
            # Gemma 2 - Good balance of capability
            ("gemma2-27b", HUGGINGFACE_MODELS["gemma2-27b"]["repo_id"], 0.85),
            # Mistral Large - Strong multilingual
            ("mistral-large", HUGGINGFACE_MODELS["mistral-large"]["repo_id"], 0.84),
            # Gemma 2 smaller - efficient fallback
            ("gemma2-9b", HUGGINGFACE_MODELS["gemma2-9b"]["repo_id"], 0.82),
        ]

from services.supabase_client import get_supabase_client
from services.roi_calculator_service import get_roi_calculator

logger = logging.getLogger(__name__)


# ============================================================
# STATE SCHEMA
# ============================================================

class ValueInvestigatorState(BaseModel):
    """State for Value Investigator workflow"""

    # Input
    query: str = Field(default="", description="User's value-related question")
    tenant_id: Optional[str] = Field(default=None, description="Tenant context")
    context_type: Optional[str] = Field(default=None, description="jtbd|role|function|category|driver")
    context_id: Optional[str] = Field(default=None, description="ID of context entity")

    # Analysis state
    analysis_type: Optional[str] = Field(default=None, description="Determined analysis type")
    retrieved_data: Dict[str, Any] = Field(default_factory=dict, description="Data from value framework")
    domain_context: Dict[str, Any] = Field(default_factory=dict, description="L0 domain context")

    # Reasoning state
    reasoning_steps: List[str] = Field(default_factory=list, description="Chain of thought steps")
    insights: List[Dict[str, Any]] = Field(default_factory=list, description="Generated insights")
    recommendations: List[Dict[str, Any]] = Field(default_factory=list, description="Action recommendations")

    # Output
    response: str = Field(default="", description="Final response to user")
    confidence: float = Field(default=0.0, description="Confidence in analysis")
    citations: List[Dict[str, Any]] = Field(default_factory=list, description="Data citations")

    # Messages for chat history
    messages: Annotated[List[BaseMessage], add_messages] = Field(default_factory=list)

    # Metadata
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    model_used: str = Field(default="claude-opus-4-5-20251101")  # Latest Claude Opus 4.5

    class Config:
        arbitrary_types_allowed = True


# ============================================================
# TOOLS / DATA RETRIEVAL
# ============================================================

async def get_value_dashboard_data(tenant_id: Optional[str] = None) -> Dict[str, Any]:
    """Retrieve comprehensive value dashboard data"""
    try:
        calculator = get_roi_calculator()
        tenant_uuid = UUID(tenant_id) if tenant_id else None
        dashboard = await calculator.get_value_dashboard(tenant_uuid)

        return {
            "tenant_name": dashboard.tenant_name,
            "total_jtbds": dashboard.total_jtbds,
            "coverage_percentage": dashboard.coverage_percentage,
            "category_distribution": dashboard.category_distribution,
            "driver_distribution": dashboard.driver_distribution,
            "top_drivers": dashboard.top_drivers[:5],
            "total_time_savings": dashboard.total_time_savings_potential,
            "total_cost_savings": dashboard.total_cost_savings_potential
        }
    except Exception as e:
        logger.error(f"Error getting dashboard data: {e}")
        return {}


async def get_category_data(category_code: str) -> Dict[str, Any]:
    """Get detailed data for a value category"""
    try:
        calculator = get_roi_calculator()
        return await calculator.get_category_insights(category_code.upper())
    except Exception as e:
        logger.error(f"Error getting category data: {e}")
        return {}


async def get_driver_data(driver_code: str) -> Dict[str, Any]:
    """Get detailed data for a value driver"""
    try:
        calculator = get_roi_calculator()
        return await calculator.get_driver_insights(driver_code.upper())
    except Exception as e:
        logger.error(f"Error getting driver data: {e}")
        return {}


async def get_jtbd_value_data(jtbd_id: str) -> Dict[str, Any]:
    """Get value data for a specific JTBD"""
    try:
        calculator = get_roi_calculator()
        roi = await calculator.calculate_jtbd_roi(UUID(jtbd_id))
        if roi:
            return {
                "entity_name": roi.entity_name,
                "total_value_score": roi.total_value_score,
                "primary_category": roi.primary_category,
                "category_breakdown": roi.category_breakdown,
                "driver_breakdown": roi.driver_breakdown,
                "hours_saved_monthly": roi.estimated_hours_saved_per_month,
                "cost_savings_yearly": roi.estimated_cost_savings_per_year,
                "confidence": roi.confidence_level
            }
        return {}
    except Exception as e:
        logger.error(f"Error getting JTBD value data: {e}")
        return {}


async def get_role_value_data(role_id: str) -> Dict[str, Any]:
    """Get aggregated value data for a role"""
    try:
        calculator = get_roi_calculator()
        roi = await calculator.calculate_role_roi(UUID(role_id))
        if roi:
            return {
                "role_name": roi.entity_name,
                "total_value_score": roi.total_value_score,
                "primary_category": roi.primary_category,
                "category_breakdown": roi.category_breakdown,
                "driver_breakdown": roi.driver_breakdown,
                "hours_saved_monthly": roi.estimated_hours_saved_per_month,
                "cost_savings_yearly": roi.estimated_cost_savings_per_year,
                "confidence": roi.confidence_level
            }
        return {}
    except Exception as e:
        logger.error(f"Error getting role value data: {e}")
        return {}


async def get_domain_context() -> Dict[str, Any]:
    """Get L0 domain context for enrichment"""
    try:
        supabase = get_supabase_client()

        # Get therapeutic areas
        ta_response = supabase.table("domain_therapeutic_areas").select("code, name").execute()

        # Get evidence types
        ev_response = supabase.table("domain_evidence_types").select(
            "code, name, evidence_level, regulatory_acceptance"
        ).execute()

        # Get regulatory frameworks summary
        rf_response = supabase.table("domain_regulatory_frameworks").select(
            "region, agency, framework_type"
        ).execute()

        return {
            "therapeutic_areas": [ta["name"] for ta in (ta_response.data or [])],
            "evidence_types": ev_response.data or [],
            "regulatory_regions": list(set(rf["region"] for rf in (rf_response.data or [])))
        }
    except Exception as e:
        logger.error(f"Error getting domain context: {e}")
        return {}


# ============================================================
# WORKFLOW NODES
# ============================================================

async def classify_query(state: ValueInvestigatorState) -> ValueInvestigatorState:
    """Classify the user's query to determine analysis type"""

    query_lower = state.query.lower()

    # Determine analysis type based on query patterns
    if any(kw in query_lower for kw in ["dashboard", "overview", "summary", "overall"]):
        state.analysis_type = "dashboard_analysis"
    elif any(kw in query_lower for kw in ["category", "smarter", "faster", "better", "efficient", "safer", "scalable"]):
        state.analysis_type = "category_deep_dive"
    elif any(kw in query_lower for kw in ["driver", "cost reduction", "decision quality", "compliance"]):
        state.analysis_type = "driver_analysis"
    elif any(kw in query_lower for kw in ["jtbd", "job", "task"]):
        state.analysis_type = "jtbd_value_analysis"
    elif any(kw in query_lower for kw in ["role", "persona", "user"]):
        state.analysis_type = "role_value_analysis"
    elif any(kw in query_lower for kw in ["gap", "opportunity", "improve", "optimize"]):
        state.analysis_type = "gap_analysis"
    elif any(kw in query_lower for kw in ["roi", "savings", "impact", "benefit"]):
        state.analysis_type = "roi_deep_dive"
    else:
        state.analysis_type = "general_value_inquiry"

    state.reasoning_steps.append(f"Query classified as: {state.analysis_type}")
    return state


async def retrieve_value_data(state: ValueInvestigatorState) -> ValueInvestigatorState:
    """Retrieve relevant value framework data based on analysis type"""

    data = {}

    # Always get dashboard data for context
    data["dashboard"] = await get_value_dashboard_data(state.tenant_id)

    # Get domain context
    state.domain_context = await get_domain_context()

    # Retrieve specific data based on analysis type
    if state.analysis_type == "category_deep_dive":
        # Extract category from query
        categories = ["smarter", "faster", "better", "efficient", "safer", "scalable"]
        for cat in categories:
            if cat in state.query.lower():
                data["category"] = await get_category_data(cat)
                break

    elif state.analysis_type == "driver_analysis":
        # Map common driver keywords to codes
        driver_map = {
            "cost": "COST_REDUCTION",
            "decision": "DECISION_QUALITY",
            "compliance": "COMPLIANCE",
            "knowledge": "KNOWLEDGE_MANAGEMENT",
            "efficiency": "OPERATIONAL_EFFICIENCY",
            "scientific": "SCIENTIFIC_QUALITY",
            "patient": "PATIENT_IMPACT",
            "hcp": "HCP_EXPERIENCE",
            "market": "MARKET_ACCESS"
        }
        for keyword, code in driver_map.items():
            if keyword in state.query.lower():
                data["driver"] = await get_driver_data(code)
                break

    elif state.analysis_type == "jtbd_value_analysis" and state.context_id:
        data["jtbd"] = await get_jtbd_value_data(state.context_id)

    elif state.analysis_type == "role_value_analysis" and state.context_id:
        data["role"] = await get_role_value_data(state.context_id)

    state.retrieved_data = data
    state.reasoning_steps.append(f"Retrieved {len(data)} data sources for analysis")

    return state


async def analyze_with_reasoning(state: ValueInvestigatorState) -> ValueInvestigatorState:
    """Use LATEST reasoning models to analyze value data and generate insights

    Model Priority (2025 Reasoning Models):
    1. Claude Opus 4.5 - Best extended thinking & reasoning
    2. OpenAI o1 - Chain-of-thought reasoning specialist
    3. Gemini 2.5 Pro - Multimodal reasoning
    4. GPT-4o - Reliable fallback
    """

    # Build analysis prompt optimized for reasoning models
    system_prompt = """You are the Value Investigator, an elite AI companion specialized in analyzing
pharmaceutical value frameworks and ROI optimization. You leverage advanced reasoning capabilities for:

- Jobs-to-be-Done (JTBD) value mapping and gap analysis
- Value Categories: Smarter, Faster, Better, Efficient, Safer, Scalable
- Value Drivers: Internal (cost reduction, compliance, efficiency) and External (patient impact, HCP experience)
- ROI calculation, business case development, and strategic planning
- Medical Affairs, Commercial, Market Access, and R&D value creation

REASONING APPROACH:
Think step-by-step through the analysis:
1. UNDERSTAND: Parse the question and identify what value metrics matter
2. ANALYZE: Examine the data for patterns, anomalies, and opportunities
3. CONNECT: Link findings to business impact and strategic implications
4. QUANTIFY: Provide specific numbers and percentages where data exists
5. RECOMMEND: Generate actionable, prioritized recommendations
6. ASSESS: Evaluate confidence based on data completeness

Always structure your response with:
- KEY FINDINGS (2-3 bullets with specific metrics)
- ANALYSIS (detailed chain-of-thought reasoning)
- RECOMMENDATIONS (specific, prioritized actions with expected impact)
- CONFIDENCE ASSESSMENT (based on data quality and completeness)"""

    # Build context from retrieved data
    context_parts = []

    if "dashboard" in state.retrieved_data:
        dash = state.retrieved_data["dashboard"]
        context_parts.append(f"""
ENTERPRISE VALUE DASHBOARD:
- Total JTBDs: {dash.get('total_jtbds', 0)}
- Coverage: {dash.get('coverage_percentage', 0):.1f}%
- Category Distribution: {json.dumps(dash.get('category_distribution', {}), indent=2)}
- Top Drivers: {json.dumps(dash.get('top_drivers', []), indent=2)}
- Estimated Annual Savings: ${dash.get('total_cost_savings', 0):,.0f}
- Estimated Monthly Time Savings: {dash.get('total_time_savings', 0):,.0f} hours
""")

    if "category" in state.retrieved_data:
        cat = state.retrieved_data["category"]
        context_parts.append(f"\nCATEGORY DEEP DIVE:\n{json.dumps(cat, indent=2)}")

    if "driver" in state.retrieved_data:
        drv = state.retrieved_data["driver"]
        context_parts.append(f"\nDRIVER ANALYSIS:\n{json.dumps(drv, indent=2)}")

    if "jtbd" in state.retrieved_data:
        jtbd = state.retrieved_data["jtbd"]
        context_parts.append(f"\nJTBD VALUE ANALYSIS:\n{json.dumps(jtbd, indent=2)}")

    if "role" in state.retrieved_data:
        role = state.retrieved_data["role"]
        context_parts.append(f"\nROLE VALUE ANALYSIS:\n{json.dumps(role, indent=2)}")

    # Add domain context
    if state.domain_context:
        context_parts.append(f"""
DOMAIN CONTEXT:
- Therapeutic Areas: {', '.join(state.domain_context.get('therapeutic_areas', [])[:5])}
- Regulatory Regions: {', '.join(state.domain_context.get('regulatory_regions', []))}
""")

    user_prompt = f"""
Analysis Type: {state.analysis_type}

User Question: {state.query}

Available Data:
{''.join(context_parts)}

Please provide a comprehensive analysis addressing the user's question.
"""

    # Generate analysis using reasoning model with 4-tier fallback
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt)
    ]

    # ============================================================
    # TIER 1: Claude Opus 4.5 (Primary - Best Reasoning)
    # ============================================================
    try:
        logger.info("Attempting Claude Opus 4.5 for value analysis...")
        opus_llm = ChatAnthropic(
            model="claude-opus-4-5-20251101",
            temperature=0.1,
            max_tokens=8000,  # Extended for deep reasoning
            # Enable extended thinking for complex analysis
        )
        response = await opus_llm.ainvoke(messages)
        state.response = response.content
        state.model_used = "claude-opus-4-5-20251101"
        state.confidence = 0.95  # Highest confidence with Opus 4.5
        state.reasoning_steps.append("Generated analysis using Claude Opus 4.5 (extended reasoning)")
        return state

    except Exception as e1:
        logger.warning(f"Claude Opus 4.5 failed: {e1}")

        # ============================================================
        # TIER 2: OpenAI o1 (Secondary - Chain-of-Thought Specialist)
        # ============================================================
        try:
            logger.info("Attempting OpenAI o1 for value analysis...")
            o1_llm = ChatOpenAI(
                model="o1",  # OpenAI's reasoning model
                temperature=1.0,  # o1 requires temperature=1
                max_tokens=8000
            )
            # o1 doesn't use system messages - combine into user message
            combined_prompt = f"{system_prompt}\n\n---\n\n{user_prompt}"
            o1_messages = [HumanMessage(content=combined_prompt)]
            response = await o1_llm.ainvoke(o1_messages)
            state.response = response.content
            state.model_used = "o1"
            state.confidence = 0.92  # High confidence with o1 reasoning
            state.reasoning_steps.append("Generated analysis using OpenAI o1 (chain-of-thought)")
            return state

        except Exception as e2:
            logger.warning(f"OpenAI o1 failed: {e2}")

            # ============================================================
            # TIER 3: Gemini 2.5 Pro (Tertiary - Multimodal Reasoning)
            # ============================================================
            if GEMINI_AVAILABLE and os.getenv("GOOGLE_API_KEY"):
                try:
                    logger.info("Attempting Gemini 2.5 Pro for value analysis...")
                    gemini_llm = ChatGoogleGenerativeAI(
                        model="gemini-2.5-pro-preview-05-06",
                        temperature=0.1,
                        max_output_tokens=8000
                    )
                    response = await gemini_llm.ainvoke(messages)
                    state.response = response.content
                    state.model_used = "gemini-2.5-pro"
                    state.confidence = 0.88  # High confidence with Gemini
                    state.reasoning_steps.append("Generated analysis using Gemini 2.5 Pro (multimodal reasoning)")
                    return state

                except Exception as e3:
                    logger.warning(f"Gemini 2.5 Pro failed: {e3}")

            # ============================================================
            # TIER 4: HuggingFace Open-Source Reasoning Models
            # Context-aware: Medical queries use Meditron, general use DeepSeek
            # ============================================================
            if HUGGINGFACE_AVAILABLE and os.getenv("HUGGINGFACE_API_KEY"):
                # Intelligently select models based on query context
                hf_models_to_try = select_best_huggingface_model(
                    state.query,
                    state.analysis_type or "general"
                )
                logger.info(f"Selected HuggingFace models order: {[m[0] for m in hf_models_to_try]}")

                for model_name, repo_id, confidence in hf_models_to_try:
                    try:
                        logger.info(f"Attempting HuggingFace {model_name} for value analysis...")
                        hf_endpoint = HuggingFaceEndpoint(
                            repo_id=repo_id,
                            huggingfacehub_api_token=os.getenv("HUGGINGFACE_API_KEY"),
                            task="text-generation",
                            max_new_tokens=4000,
                            temperature=0.1,
                        )

                        # Format prompt for HuggingFace models
                        hf_prompt = f"""<|system|>
{system_prompt}
<|user|>
{user_prompt}
<|assistant|>"""

                        response_text = await hf_endpoint.ainvoke(hf_prompt)
                        state.response = response_text
                        state.model_used = f"huggingface/{model_name}"
                        state.confidence = confidence
                        state.reasoning_steps.append(f"Generated analysis using HuggingFace {model_name} (open-source)")
                        return state

                    except Exception as hf_err:
                        logger.warning(f"HuggingFace {model_name} failed: {hf_err}")
                        continue  # Try next model

            # ============================================================
            # TIER 5: GPT-4o (Final Fallback)
            # ============================================================
            try:
                logger.info("Attempting GPT-4o as final fallback...")
                gpt4o_llm = ChatOpenAI(
                    model="gpt-4o",
                    temperature=0.1,
                    max_tokens=4000
                )
                response = await gpt4o_llm.ainvoke(messages)
                state.response = response.content
                state.model_used = "gpt-4o"
                state.confidence = 0.82
                state.reasoning_steps.append("Generated analysis using GPT-4o (fallback)")
                return state

            except Exception as e4:
                logger.error(f"All reasoning models failed. Final error: {e4}")
                state.response = """I apologize, but I encountered errors with all available reasoning models.

Please ensure API keys are configured:
- ANTHROPIC_API_KEY for Claude Opus 4.5
- OPENAI_API_KEY for o1/GPT-4o
- GOOGLE_API_KEY for Gemini 2.5 Pro
- HUGGINGFACE_API_KEY for open-source models (DeepSeek, Qwen, Meditron, LLaMA)

Try again or contact support if the issue persists."""
                state.confidence = 0.0
                state.reasoning_steps.append("All reasoning models failed")
                return state


async def generate_recommendations(state: ValueInvestigatorState) -> ValueInvestigatorState:
    """Extract structured recommendations from the analysis"""

    # Parse recommendations from response
    recommendations = []

    # Simple extraction of recommendation patterns
    response_lines = state.response.split('\n')
    in_recommendations = False

    for line in response_lines:
        line_lower = line.lower()
        if 'recommendation' in line_lower or 'action' in line_lower:
            in_recommendations = True
        elif in_recommendations and line.strip().startswith(('-', '•', '*', '1', '2', '3')):
            recommendations.append({
                "text": line.strip().lstrip('-•*123456789. '),
                "priority": "high" if len(recommendations) < 2 else "medium",
                "category": state.analysis_type
            })

    state.recommendations = recommendations[:5]  # Top 5 recommendations
    state.reasoning_steps.append(f"Extracted {len(state.recommendations)} actionable recommendations")

    return state


async def add_citations(state: ValueInvestigatorState) -> ValueInvestigatorState:
    """Add data citations to support the analysis"""

    citations = []

    if "dashboard" in state.retrieved_data:
        citations.append({
            "source": "Value Framework Dashboard",
            "type": "internal_data",
            "timestamp": state.created_at
        })

    if "category" in state.retrieved_data:
        citations.append({
            "source": f"Category Analysis: {state.retrieved_data['category'].get('category', {}).get('name', 'Unknown')}",
            "type": "category_metrics"
        })

    if "driver" in state.retrieved_data:
        citations.append({
            "source": f"Driver Analysis: {state.retrieved_data['driver'].get('driver', {}).get('name', 'Unknown')}",
            "type": "driver_metrics"
        })

    state.citations = citations
    state.reasoning_steps.append(f"Added {len(citations)} citations to analysis")

    return state


# ============================================================
# BUILD WORKFLOW GRAPH
# ============================================================

def build_value_investigator_graph() -> StateGraph:
    """Build the Value Investigator LangGraph workflow"""

    # Create graph with state schema
    workflow = StateGraph(ValueInvestigatorState)

    # Add nodes
    workflow.add_node("classify", classify_query)
    workflow.add_node("retrieve", retrieve_value_data)
    workflow.add_node("analyze", analyze_with_reasoning)
    workflow.add_node("recommend", generate_recommendations)
    workflow.add_node("cite", add_citations)

    # Define edges
    workflow.set_entry_point("classify")
    workflow.add_edge("classify", "retrieve")
    workflow.add_edge("retrieve", "analyze")
    workflow.add_edge("analyze", "recommend")
    workflow.add_edge("recommend", "cite")
    workflow.add_edge("cite", END)

    return workflow.compile()


# ============================================================
# MAIN INTERFACE
# ============================================================

# Singleton graph instance
_value_investigator_graph = None


def get_value_investigator():
    """Get or create the Value Investigator graph"""
    global _value_investigator_graph
    if _value_investigator_graph is None:
        _value_investigator_graph = build_value_investigator_graph()
    return _value_investigator_graph


async def investigate_value(
    query: str,
    tenant_id: Optional[str] = None,
    context_type: Optional[str] = None,
    context_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main entry point for Value Investigator queries

    Args:
        query: User's value-related question
        tenant_id: Optional tenant context
        context_type: Optional context (jtbd, role, function, category, driver)
        context_id: Optional ID of context entity

    Returns:
        Dict with response, insights, recommendations, citations
    """

    graph = get_value_investigator()

    initial_state = ValueInvestigatorState(
        query=query,
        tenant_id=tenant_id,
        context_type=context_type,
        context_id=context_id
    )

    try:
        # Run the graph
        final_state = await graph.ainvoke(initial_state)

        return {
            "success": True,
            "response": final_state.response,
            "analysis_type": final_state.analysis_type,
            "recommendations": final_state.recommendations,
            "citations": final_state.citations,
            "confidence": final_state.confidence,
            "model_used": final_state.model_used,
            "reasoning_steps": final_state.reasoning_steps,
            "timestamp": final_state.created_at
        }

    except Exception as e:
        logger.error(f"Value investigation failed: {e}")
        return {
            "success": False,
            "error": str(e),
            "response": "I encountered an error during the value analysis. Please try rephrasing your question.",
            "confidence": 0.0
        }
