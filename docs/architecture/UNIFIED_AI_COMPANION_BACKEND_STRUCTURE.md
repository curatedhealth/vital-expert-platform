# Unified AI Companion - Backend Code Structure

> **Version**: 1.1.0
> **Status**: Design Complete
> **Created**: December 17, 2025
> **Updated**: December 17, 2025

## Related Documents

| Document | Description |
|----------|-------------|
| [UNIFIED_AI_COMPANION_SERVICE.md](./UNIFIED_AI_COMPANION_SERVICE.md) | Main architecture and API design |
| [UNIFIED_AI_COMPANION_ONTOLOGY_INTEGRATION.md](./UNIFIED_AI_COMPANION_ONTOLOGY_INTEGRATION.md) | 8-layer ontology integration |
| [ONTOLOGY_DRIVEN_BACKEND_STRUCTURE.md](./ONTOLOGY_DRIVEN_BACKEND_STRUCTURE.md) | Full backend restructuring proposal |
| [BACKEND_SERVICE_REORGANIZATION.md](./BACKEND_SERVICE_REORGANIZATION.md) | Service migration guide (85 files) |

---

## Directory Structure

```
services/ai-engine/src/
├── services/
│   └── unified_ai_companion/           # 🆕 New unified service
│       ├── __init__.py                 # Package exports
│       ├── gateway.py                  # Main orchestrator/facade
│       ├── config.py                   # Service configuration
│       │
│       ├── core/                       # Core infrastructure
│       │   ├── __init__.py
│       │   ├── context_store.py        # Shared context management
│       │   ├── model_router.py         # Intelligent model selection
│       │   ├── cache_layer.py          # Redis/in-memory caching
│       │   └── metrics.py              # Service metrics & telemetry
│       │
│       ├── capabilities/               # Core AI capabilities
│       │   ├── __init__.py
│       │   ├── domain_intelligence.py  # Domain detection & classification
│       │   ├── prompt_engineering.py   # Prompt enhancement & building
│       │   ├── wizard_support.py       # Wizard questions & validation
│       │   ├── artifact_generation.py  # Cards, reports, summaries
│       │   ├── enrichment_engine.py    # Knowledge enrichment
│       │   └── ontology_navigator.py   # Org hierarchy navigation
│       │
│       ├── templates/                  # Domain templates & patterns
│       │   ├── __init__.py
│       │   ├── pharma_domains.py       # Pharmaceutical domain configs
│       │   ├── prism_structures.py     # PRISM 6-section templates
│       │   ├── wizard_definitions.py   # Wizard step definitions
│       │   └── prompt_patterns.py      # Reusable prompt patterns
│       │
│       └── schemas/                    # Pydantic models
│           ├── __init__.py
│           ├── requests.py             # API request models
│           ├── responses.py            # API response models
│           └── internal.py             # Internal data models
│
├── api/
│   └── routers/
│       └── ai_companion/               # 🆕 New API router
│           ├── __init__.py
│           ├── router.py               # Main router aggregator
│           ├── analyze.py              # /analyze endpoints
│           ├── prompt.py               # /prompt endpoints
│           ├── wizard.py               # /wizard endpoints
│           ├── artifact.py             # /artifact endpoints
│           ├── enrichment.py           # /enrichment endpoints
│           └── ontology.py             # /ontology endpoints
│
└── models/                             # Shared models (existing)
    └── ai_companion.py                 # 🆕 AI Companion models
```

---

## File Contents

### 1. Package Entry Point

```python
# services/unified_ai_companion/__init__.py
"""
Unified AI Companion Service
============================

Single entry point for all AI-powered platform assistance:
- Domain Intelligence (detection, classification, recommendations)
- Prompt Engineering (enhancement, building, variables)
- Wizard Support (questions, validation, guidance)
- Artifact Generation (cards, reports, exports)
- Enrichment Engine (feedback learning, tool capture)
- Ontology Navigator (hierarchy, suggestions)

Usage:
    from services.unified_ai_companion import AICompanionGateway

    gateway = AICompanionGateway()
    result = await gateway.analyze("What are FDA 510k requirements?")
"""

from .gateway import AICompanionGateway
from .config import AICompanionConfig

# Capability imports for direct access
from .capabilities.domain_intelligence import DomainIntelligenceService
from .capabilities.prompt_engineering import PromptEngineeringService
from .capabilities.wizard_support import WizardSupportService
from .capabilities.artifact_generation import ArtifactGenerationService
from .capabilities.enrichment_engine import EnrichmentEngineService
from .capabilities.ontology_navigator import OntologyNavigatorService

__all__ = [
    "AICompanionGateway",
    "AICompanionConfig",
    "DomainIntelligenceService",
    "PromptEngineeringService",
    "WizardSupportService",
    "ArtifactGenerationService",
    "EnrichmentEngineService",
    "OntologyNavigatorService",
]
```

---

### 2. Main Gateway (Orchestrator)

```python
# services/unified_ai_companion/gateway.py
"""
AI Companion Gateway - Main Orchestrator
========================================

Central facade for all AI companion capabilities.
Manages service lifecycle, caching, and cross-service coordination.
"""

from typing import Optional, Dict, Any
import structlog

from .config import AICompanionConfig
from .core.context_store import ContextStore
from .core.model_router import ModelRouter
from .core.cache_layer import CacheLayer
from .core.metrics import MetricsCollector

from .capabilities.domain_intelligence import DomainIntelligenceService
from .capabilities.prompt_engineering import PromptEngineeringService
from .capabilities.wizard_support import WizardSupportService
from .capabilities.artifact_generation import ArtifactGenerationService
from .capabilities.enrichment_engine import EnrichmentEngineService
from .capabilities.ontology_navigator import OntologyNavigatorService

from .schemas.responses import (
    DomainIntelligenceResult,
    PromptEngineeringResult,
    WizardQuestionsResult,
    WizardValidationResult,
    ArtifactResult,
)

logger = structlog.get_logger()


class AICompanionGateway:
    """
    Unified AI Companion Gateway.

    This is the main entry point for all AI companion functionality.
    It orchestrates between specialized services and manages shared context.

    Architecture:
    ┌─────────────────────────────────────────────────────┐
    │                  AICompanionGateway                 │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
    │  │ContextStore │  │ ModelRouter │  │ CacheLayer  │ │
    │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
    │         └────────────────┼────────────────┘        │
    │                          │                         │
    │  ┌───────────────────────┴───────────────────────┐ │
    │  │              Capability Services              │ │
    │  │  Domain | Prompt | Wizard | Artifact | ...    │ │
    │  └───────────────────────────────────────────────┘ │
    └─────────────────────────────────────────────────────┘

    Example:
        gateway = AICompanionGateway()

        # Analyze a query
        intel = await gateway.analyze("FDA 510k submission timeline")

        # Enhance a prompt using the analysis
        enhanced = await gateway.enhance_prompt(
            prompt="Help me understand FDA requirements",
            domain_intelligence=intel
        )

        # Generate wizard questions
        questions = await gateway.generate_wizard_questions(
            wizard_type="agent_creation",
            step=1,
            context={"domain": intel.primary_domain}
        )
    """

    def __init__(
        self,
        config: Optional[AICompanionConfig] = None,
        supabase_client: Optional[Any] = None,
        openai_client: Optional[Any] = None,
    ):
        """
        Initialize the AI Companion Gateway.

        Args:
            config: Optional configuration override
            supabase_client: Optional Supabase client for database access
            openai_client: Optional OpenAI client for LLM calls
        """
        self.config = config or AICompanionConfig()

        # Initialize core infrastructure
        self._context_store = ContextStore()
        self._model_router = ModelRouter(config=self.config)
        self._cache = CacheLayer(config=self.config)
        self._metrics = MetricsCollector()

        # Initialize capability services (lazy loading)
        self._domain_intelligence: Optional[DomainIntelligenceService] = None
        self._prompt_engineering: Optional[PromptEngineeringService] = None
        self._wizard_support: Optional[WizardSupportService] = None
        self._artifact_generation: Optional[ArtifactGenerationService] = None
        self._enrichment_engine: Optional[EnrichmentEngineService] = None
        self._ontology_navigator: Optional[OntologyNavigatorService] = None

        # External clients
        self._supabase = supabase_client
        self._openai = openai_client

        logger.info("ai_companion_gateway.initialized", config=self.config.dict())

    # =========================================================================
    # CAPABILITY SERVICE ACCESSORS (Lazy Loading)
    # =========================================================================

    @property
    def domain_intelligence(self) -> DomainIntelligenceService:
        """Get or create Domain Intelligence service."""
        if self._domain_intelligence is None:
            self._domain_intelligence = DomainIntelligenceService(
                model_router=self._model_router,
                cache=self._cache,
                supabase=self._supabase,
            )
        return self._domain_intelligence

    @property
    def prompt_engineering(self) -> PromptEngineeringService:
        """Get or create Prompt Engineering service."""
        if self._prompt_engineering is None:
            self._prompt_engineering = PromptEngineeringService(
                model_router=self._model_router,
                domain_service=self.domain_intelligence,
                openai=self._openai,
            )
        return self._prompt_engineering

    @property
    def wizard_support(self) -> WizardSupportService:
        """Get or create Wizard Support service."""
        if self._wizard_support is None:
            self._wizard_support = WizardSupportService(
                model_router=self._model_router,
                domain_service=self.domain_intelligence,
                openai=self._openai,
            )
        return self._wizard_support

    @property
    def artifact_generation(self) -> ArtifactGenerationService:
        """Get or create Artifact Generation service."""
        if self._artifact_generation is None:
            self._artifact_generation = ArtifactGenerationService(
                model_router=self._model_router,
            )
        return self._artifact_generation

    @property
    def enrichment_engine(self) -> EnrichmentEngineService:
        """Get or create Enrichment Engine service."""
        if self._enrichment_engine is None:
            self._enrichment_engine = EnrichmentEngineService(
                model_router=self._model_router,
                supabase=self._supabase,
                openai=self._openai,
            )
        return self._enrichment_engine

    @property
    def ontology_navigator(self) -> OntologyNavigatorService:
        """Get or create Ontology Navigator service."""
        if self._ontology_navigator is None:
            self._ontology_navigator = OntologyNavigatorService(
                supabase=self._supabase,
                cache=self._cache,
            )
        return self._ontology_navigator

    # =========================================================================
    # HIGH-LEVEL API METHODS
    # =========================================================================

    async def analyze(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None,
        tenant_id: Optional[str] = None,
        use_cache: bool = True,
    ) -> DomainIntelligenceResult:
        """
        Analyze a query for domain, complexity, and recommendations.

        This is the primary entry point for understanding user intent.
        Results are cached and can be reused across other operations.

        Args:
            query: User query to analyze
            context: Optional additional context
            tenant_id: Tenant ID for multi-tenant isolation
            use_cache: Whether to use cached results

        Returns:
            DomainIntelligenceResult with domain, complexity, recommendations

        Example:
            result = await gateway.analyze("FDA 510k requirements for SaMD")
            print(result.primary_domain)  # "regulatory"
            print(result.complexity)       # "complex"
            print(result.recommended_agents)  # [{"id": "...", "score": 95}]
        """
        with self._metrics.measure("analyze"):
            # Check cache first
            if use_cache:
                cache_key = f"analyze:{hash(query)}:{tenant_id}"
                cached = await self._cache.get(cache_key)
                if cached:
                    logger.debug("analyze.cache_hit", query_preview=query[:50])
                    return DomainIntelligenceResult(**cached)

            # Perform analysis
            result = await self.domain_intelligence.analyze(
                query=query,
                context=context,
                tenant_id=tenant_id,
            )

            # Store in context for cross-service use
            self._context_store.set("last_analysis", result.dict())

            # Cache result
            if use_cache:
                await self._cache.set(cache_key, result.dict(), ttl=300)

            return result

    async def enhance_prompt(
        self,
        prompt: str,
        mode: str = "auto",
        suite: Optional[str] = None,
        complexity: Optional[str] = None,
        agent_context: Optional[Dict[str, Any]] = None,
        domain_intelligence: Optional[DomainIntelligenceResult] = None,
    ) -> PromptEngineeringResult:
        """
        Enhance a prompt using various modes.

        Modes:
        - auto: Intelligent enhancement based on detected domain
        - rewrite: Full PRISM 6-section structure rewrite
        - build: Build complete system prompt from scratch
        - citation: Add citation requirements only

        Args:
            prompt: Original prompt to enhance
            mode: Enhancement mode
            suite: PRISM suite code (RULES, TRIALS, VALUE, etc.)
            complexity: Target complexity level
            agent_context: Optional agent context for personalization
            domain_intelligence: Pre-computed domain analysis (saves LLM call)

        Returns:
            PromptEngineeringResult with enhanced prompt and metadata

        Example:
            enhanced = await gateway.enhance_prompt(
                prompt="Help me with regulatory strategy",
                mode="rewrite",
                suite="RULES"
            )
            print(enhanced.enhanced_prompt)
        """
        with self._metrics.measure("enhance_prompt"):
            # Use cached domain intelligence if available
            if domain_intelligence is None:
                cached = self._context_store.get("last_analysis")
                if cached:
                    domain_intelligence = DomainIntelligenceResult(**cached)
                else:
                    domain_intelligence = await self.analyze(prompt)

            return await self.prompt_engineering.enhance(
                prompt=prompt,
                mode=mode,
                suite=suite or domain_intelligence.suggested_suite,
                complexity=complexity or domain_intelligence.complexity.value,
                agent_context=agent_context,
                domain_intelligence=domain_intelligence,
            )

    async def build_agent_prompt(
        self,
        name: str,
        tagline: str,
        description: str,
        tier: int,
        domain: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Build a complete agent profile with system prompt.

        Args:
            name: Agent name
            tagline: Short tagline
            description: Agent description
            tier: Agent tier (1-3)
            domain: Optional domain override

        Returns:
            Dict with system_prompt, capabilities, knowledge_domains, etc.

        Example:
            agent = await gateway.build_agent_prompt(
                name="FDA Regulatory Strategist",
                tagline="Expert in FDA submission pathways",
                description="Guides 510k, PMA, and De Novo submissions",
                tier=3
            )
            print(agent["system_prompt"])
        """
        with self._metrics.measure("build_agent_prompt"):
            return await self.prompt_engineering.build_agent_prompt(
                name=name,
                tagline=tagline,
                description=description,
                tier=tier,
                domain=domain,
            )

    async def generate_wizard_questions(
        self,
        wizard_type: str,
        step: int,
        context: Dict[str, Any],
        domain_intelligence: Optional[DomainIntelligenceResult] = None,
    ) -> WizardQuestionsResult:
        """
        Generate AI-powered questions for a wizard step.

        Wizard types:
        - agent_creation: Agent building wizard
        - mission_config: Mode 4 mission configuration
        - workflow_design: Workflow designer
        - onboarding: User onboarding

        Args:
            wizard_type: Type of wizard
            step: Current step (0-indexed)
            context: Wizard context with previous answers
            domain_intelligence: Optional pre-computed analysis

        Returns:
            WizardQuestionsResult with generated questions

        Example:
            questions = await gateway.generate_wizard_questions(
                wizard_type="agent_creation",
                step=2,
                context={"name": "My Agent", "tier": 2}
            )
            for q in questions.questions:
                print(f"{q.question_text} ({q.input_type})")
        """
        with self._metrics.measure("generate_wizard_questions"):
            return await self.wizard_support.generate_questions(
                wizard_type=wizard_type,
                step=step,
                context=context,
                domain_intelligence=domain_intelligence,
            )

    async def validate_wizard_step(
        self,
        wizard_type: str,
        step: int,
        data: Dict[str, Any],
        context: Dict[str, Any],
    ) -> WizardValidationResult:
        """
        Validate wizard step data with AI assistance.

        Args:
            wizard_type: Type of wizard
            step: Current step
            data: Step data to validate
            context: Full wizard context

        Returns:
            WizardValidationResult with errors, warnings, suggestions

        Example:
            validation = await gateway.validate_wizard_step(
                wizard_type="agent_creation",
                step=2,
                data={"system_prompt": "You are..."},
                context={"name": "My Agent"}
            )
            if not validation.valid:
                print(validation.errors)
        """
        with self._metrics.measure("validate_wizard_step"):
            return await self.wizard_support.validate_step(
                wizard_type=wizard_type,
                step=step,
                data=data,
                context=context,
            )

    async def generate_artifact(
        self,
        artifact_type: str,
        content: str,
        evidence_context: Dict[str, Any],
        tenant_id: str,
        options: Optional[Dict[str, Any]] = None,
    ) -> ArtifactResult:
        """
        Generate an artifact from content.

        Artifact types:
        - quick_reference: Mode 1 quick reference cards
        - research_report: Mode 3 comprehensive reports
        - executive_summary: High-level summaries
        - export_package: Multi-format exports

        Args:
            artifact_type: Type of artifact to generate
            content: Source content
            evidence_context: Evidence and citations
            tenant_id: Tenant ID
            options: Additional options (format, depth, etc.)

        Returns:
            ArtifactResult with generated artifact

        Example:
            artifact = await gateway.generate_artifact(
                artifact_type="quick_reference",
                content="FDA 510k requires...",
                evidence_context={"sources": [...]},
                tenant_id="tenant-123"
            )
            print(artifact.title)
        """
        with self._metrics.measure("generate_artifact"):
            return await self.artifact_generation.generate(
                artifact_type=artifact_type,
                content=content,
                evidence_context=evidence_context,
                tenant_id=tenant_id,
                options=options,
            )

    # =========================================================================
    # HEALTH & METRICS
    # =========================================================================

    async def health_check(self) -> Dict[str, Any]:
        """Check health of all services."""
        return {
            "status": "healthy",
            "services": {
                "domain_intelligence": "ready",
                "prompt_engineering": "ready",
                "wizard_support": "ready",
                "artifact_generation": "ready",
                "enrichment_engine": "ready",
                "ontology_navigator": "ready",
            },
            "metrics": self._metrics.get_summary(),
        }

    def get_metrics(self) -> Dict[str, Any]:
        """Get service metrics."""
        return self._metrics.get_detailed()


# =============================================================================
# SINGLETON FACTORY
# =============================================================================

_gateway_instance: Optional[AICompanionGateway] = None


def get_ai_companion_gateway(
    config: Optional[AICompanionConfig] = None,
    supabase_client: Optional[Any] = None,
    openai_client: Optional[Any] = None,
) -> AICompanionGateway:
    """
    Get or create the AI Companion Gateway singleton.

    Args:
        config: Optional configuration
        supabase_client: Optional Supabase client
        openai_client: Optional OpenAI client

    Returns:
        AICompanionGateway instance
    """
    global _gateway_instance

    if _gateway_instance is None:
        _gateway_instance = AICompanionGateway(
            config=config,
            supabase_client=supabase_client,
            openai_client=openai_client,
        )

    return _gateway_instance
```

---

### 3. Configuration

```python
# services/unified_ai_companion/config.py
"""
AI Companion Configuration
==========================

Centralized configuration for all AI companion services.
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class ModelTier(str, Enum):
    """Model tier for cost/quality tradeoff."""
    FAST = "fast"       # GPT-3.5-turbo, fast responses
    BALANCED = "balanced"  # GPT-4-mini, good balance
    QUALITY = "quality"    # GPT-4-turbo, highest quality


class AICompanionConfig(BaseModel):
    """Configuration for AI Companion services."""

    # Model selection defaults
    default_model_tier: ModelTier = Field(
        default=ModelTier.BALANCED,
        description="Default model tier for operations"
    )

    # Domain Intelligence
    domain_detection_use_llm: bool = Field(
        default=False,
        description="Use LLM for domain detection (slower but more accurate)"
    )
    agent_recommendation_limit: int = Field(
        default=3,
        description="Number of agents to recommend"
    )

    # Prompt Engineering
    prism_default_suite: str = Field(
        default="VALUE",
        description="Default PRISM suite"
    )
    citation_threshold: float = Field(
        default=0.7,
        description="Confidence threshold for adding citations"
    )

    # Wizard Support
    max_questions_per_step: int = Field(
        default=5,
        description="Maximum questions to generate per wizard step"
    )
    validation_strictness: str = Field(
        default="moderate",
        description="Validation strictness: lenient, moderate, strict"
    )

    # Caching
    cache_enabled: bool = Field(default=True)
    cache_ttl_seconds: int = Field(default=300)
    cache_prefix: str = Field(default="ai_companion")

    # Rate limiting
    rate_limit_enabled: bool = Field(default=True)
    rate_limit_requests_per_minute: int = Field(default=60)

    # Model-specific settings
    model_settings: Dict[str, Any] = Field(
        default_factory=lambda: {
            "fast": {
                "model": "gpt-3.5-turbo",
                "temperature": 0.3,
                "max_tokens": 500,
                "timeout": 15.0,
            },
            "balanced": {
                "model": "gpt-4o-mini",
                "temperature": 0.3,
                "max_tokens": 800,
                "timeout": 30.0,
            },
            "quality": {
                "model": "gpt-4-turbo-preview",
                "temperature": 0.2,
                "max_tokens": 1200,
                "timeout": 60.0,
            },
        }
    )

    class Config:
        env_prefix = "AI_COMPANION_"
```

---

### 4. Domain Intelligence Service

```python
# services/unified_ai_companion/capabilities/domain_intelligence.py
"""
Domain Intelligence Service
===========================

Unified domain detection, classification, and recommendation engine.
Consolidates: /api/classify, /api/agents/recommend, generate-system-prompt detection
"""

from typing import List, Dict, Any, Optional, Tuple
from enum import Enum
import structlog
import re

from ..schemas.responses import DomainIntelligenceResult
from ..templates.pharma_domains import DOMAIN_PATTERNS, DOMAIN_AGENT_MAPPING

logger = structlog.get_logger()


class Domain(str, Enum):
    """Pharmaceutical domain categories."""
    REGULATORY = "regulatory"
    CLINICAL = "clinical"
    MARKET_ACCESS = "market_access"
    DIGITAL_HEALTH = "digital_health"
    COMMERCIAL = "commercial"
    SAFETY = "safety"
    RESEARCH = "research"
    OPERATIONS = "operations"
    MEDICAL_AFFAIRS = "medical_affairs"
    QUALITY = "quality"
    GENERAL = "general"


class Complexity(str, Enum):
    """Query complexity levels."""
    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"
    EXPERT = "expert"


class DomainIntelligenceService:
    """
    Unified domain intelligence service.

    Provides:
    - Fast keyword-based domain detection
    - Complexity assessment
    - Stakeholder/phase detection
    - Agent recommendations
    - PRISM suite mapping

    Architecture Decision:
    - Fast path: Keyword matching (no LLM, <10ms)
    - Enhanced path: LLM-powered semantic analysis (optional)
    - Hybrid: Keyword + LLM for ambiguous cases
    """

    # Domain detection patterns (consolidated from 3 services)
    DOMAIN_PATTERNS: Dict[Domain, Dict[str, Any]] = {
        Domain.REGULATORY: {
            "keywords": [
                "fda", "ema", "regulatory", "approval", "submission",
                "510k", "pma", "premarket", "clearance", "nda", "bla",
                "ide", "guidance", "registration", "compliance"
            ],
            "patterns": [
                r"\b510\(?k\)?\b",
                r"\bfda\b",
                r"\bema\b",
                r"\b(pre)?market\s*(approval|clearance)\b",
                r"\bregulatory\s+(strategy|pathway|submission)\b",
            ],
            "weight": 0.95,
            "prism_suite": "RULES",
        },
        Domain.CLINICAL: {
            "keywords": [
                "clinical", "trial", "study", "protocol", "endpoint",
                "recruitment", "phase", "patients", "efficacy", "safety",
                "randomized", "placebo", "arm", "cohort"
            ],
            "patterns": [
                r"\bphase\s+[1-4]\b",
                r"\bclinical\s+trial\b",
                r"\bstudy\s+protocol\b",
                r"\bprimary\s+endpoint\b",
            ],
            "weight": 0.90,
            "prism_suite": "TRIALS",
        },
        Domain.MARKET_ACCESS: {
            "keywords": [
                "reimbursement", "payer", "coverage", "pricing", "heor",
                "health economics", "formulary", "hta", "value dossier",
                "market access", "cost-effectiveness"
            ],
            "patterns": [
                r"\b(market\s+)?access\b",
                r"\breimbursement\b",
                r"\bpayer\b",
                r"\bpricing\s+strategy\b",
            ],
            "weight": 0.85,
            "prism_suite": "VALUE",
        },
        Domain.DIGITAL_HEALTH: {
            "keywords": [
                "digital", "app", "software", "algorithm", "samd", "dtx",
                "digital therapeutic", "ai", "ml", "mobile health",
                "telehealth", "remote monitoring", "wearable"
            ],
            "patterns": [
                r"\bdigital\s+(health|therapeutic)\b",
                r"\bsoftware.*medical\s+device\b",
                r"\bsamd\b",
                r"\b(ai|ml)\s+(algorithm|model)\b",
            ],
            "weight": 0.88,
            "prism_suite": "BRIDGE",
        },
        Domain.SAFETY: {
            "keywords": [
                "safety", "adverse", "side effect", "pharmacovigilance",
                "monitoring", "susar", "adr", "signal detection",
                "risk management", "rems"
            ],
            "patterns": [
                r"\badverse\s+event\b",
                r"\bpharmacovigilance\b",
                r"\bsafety\s+(signal|monitoring)\b",
            ],
            "weight": 0.90,
            "prism_suite": "GUARD",
        },
        # ... additional domains
    }

    def __init__(
        self,
        model_router: Any = None,
        cache: Any = None,
        supabase: Any = None,
    ):
        """Initialize Domain Intelligence service."""
        self._model_router = model_router
        self._cache = cache
        self._supabase = supabase
        logger.info("domain_intelligence_service.initialized")

    async def analyze(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None,
        tenant_id: Optional[str] = None,
        use_llm: bool = False,
    ) -> DomainIntelligenceResult:
        """
        Analyze query for domain intelligence.

        Args:
            query: User query
            context: Optional context
            tenant_id: Tenant ID for agent recommendations
            use_llm: Whether to use LLM for enhanced analysis

        Returns:
            DomainIntelligenceResult
        """
        # Step 1: Fast keyword detection
        domains, confidence = self._detect_domains_fast(query)

        # Step 2: Complexity assessment
        complexity = self._assess_complexity(query, domains[0] if domains else Domain.GENERAL)

        # Step 3: Context detection
        stakeholder = self._detect_stakeholder(query)
        phase = self._detect_phase(query)
        urgency = self._detect_urgency(query)

        # Step 4: Extract key terms
        key_terms = self._extract_key_terms(query)

        # Step 5: Agent recommendations (if tenant provided)
        recommended_agents = []
        if tenant_id and self._supabase:
            recommended_agents = await self._get_agent_recommendations(
                query=query,
                domains=domains,
                tenant_id=tenant_id,
            )

        # Step 6: Map to PRISM suite
        primary_domain = domains[0] if domains else Domain.GENERAL
        suite = self._map_to_prism_suite(primary_domain)

        return DomainIntelligenceResult(
            primary_domain=primary_domain.value,
            secondary_domains=[d.value for d in domains[1:]],
            complexity=complexity.value,
            confidence=confidence,
            stakeholder=stakeholder,
            phase=phase,
            urgency=urgency,
            key_terms=key_terms,
            recommended_agents=recommended_agents,
            suggested_suite=suite,
        )

    def _detect_domains_fast(self, query: str) -> Tuple[List[Domain], float]:
        """
        Fast keyword-based domain detection.
        No LLM call - runs in <10ms.
        """
        query_lower = query.lower()
        scores: Dict[Domain, float] = {}

        for domain, config in self.DOMAIN_PATTERNS.items():
            score = 0.0

            # Keyword matching
            for keyword in config["keywords"]:
                if keyword in query_lower:
                    score += 0.1

            # Pattern matching (more weight)
            for pattern in config["patterns"]:
                if re.search(pattern, query_lower, re.IGNORECASE):
                    score += 0.25

            # Apply domain weight
            scores[domain] = min(score * config["weight"], config["weight"])

        # Sort by score
        sorted_domains = sorted(scores.items(), key=lambda x: x[1], reverse=True)

        # Filter to domains with meaningful scores
        detected = [d for d, s in sorted_domains if s > 0.1]

        if not detected:
            return [Domain.GENERAL], 0.3

        # Return top domains and confidence
        top_confidence = sorted_domains[0][1] if sorted_domains else 0.3
        return detected[:3], min(top_confidence, 0.95)

    def _assess_complexity(self, query: str, primary_domain: Domain) -> Complexity:
        """Assess query complexity based on multiple factors."""
        score = 0.0
        query_lower = query.lower()

        # Length factor
        word_count = len(query.split())
        if word_count > 100:
            score += 0.3
        elif word_count > 50:
            score += 0.2
        elif word_count > 25:
            score += 0.1

        # Technical terms
        complex_terms = [
            "pharmacokinetics", "pharmacodynamics", "bioequivalence",
            "randomization", "stratification", "biomarker", "surrogate endpoint",
            "non-inferiority", "adaptive design", "bayesian"
        ]
        score += sum(0.1 for term in complex_terms if term in query_lower)

        # Multi-domain queries are more complex
        domains, _ = self._detect_domains_fast(query)
        if len(domains) > 2:
            score += 0.2

        # Multiple questions
        if query.count("?") > 1:
            score += 0.15

        # Domain-specific complexity boost
        if primary_domain in [Domain.REGULATORY, Domain.CLINICAL]:
            score += 0.1

        # Map to complexity level
        if score >= 0.6:
            return Complexity.EXPERT
        elif score >= 0.4:
            return Complexity.COMPLEX
        elif score >= 0.2:
            return Complexity.MODERATE
        else:
            return Complexity.SIMPLE

    def _detect_stakeholder(self, query: str) -> str:
        """Detect primary stakeholder from query."""
        query_lower = query.lower()

        patterns = {
            "regulatory": ["fda", "ema", "regulatory", "submission", "approval"],
            "clinical": ["trial", "protocol", "patient", "clinical", "study"],
            "commercial": ["market", "launch", "sales", "pricing", "commercial"],
            "executive": ["strategy", "investment", "roi", "budget", "decision"],
            "researcher": ["research", "study", "analyze", "investigate"],
        }

        for stakeholder, keywords in patterns.items():
            if any(kw in query_lower for kw in keywords):
                return stakeholder

        return "researcher"

    def _detect_phase(self, query: str) -> str:
        """Detect development phase from query."""
        query_lower = query.lower()

        if any(kw in query_lower for kw in ["discovery", "target", "lead"]):
            return "discovery"
        elif any(kw in query_lower for kw in ["preclinical", "animal", "tox"]):
            return "preclinical"
        elif any(kw in query_lower for kw in ["phase", "clinical", "trial"]):
            return "clinical"
        elif any(kw in query_lower for kw in ["approval", "submission", "regulatory"]):
            return "regulatory"
        elif any(kw in query_lower for kw in ["launch", "market", "commercial"]):
            return "commercial"

        return "discovery"

    def _detect_urgency(self, query: str) -> str:
        """Detect urgency level from query."""
        query_lower = query.lower()

        if any(kw in query_lower for kw in ["urgent", "asap", "emergency", "immediately"]):
            return "critical"
        elif any(kw in query_lower for kw in ["soon", "deadline", "timeline", "quickly"]):
            return "high"
        elif any(kw in query_lower for kw in ["planning", "future", "eventually"]):
            return "low"

        return "medium"

    def _extract_key_terms(self, query: str) -> List[str]:
        """Extract key terms from query."""
        # Simple extraction - in production use NLP
        stopwords = {"the", "a", "an", "is", "are", "what", "how", "when", "where", "why"}
        words = re.findall(r'\b[a-zA-Z]{3,}\b', query.lower())
        return [w for w in words if w not in stopwords][:10]

    def _map_to_prism_suite(self, domain: Domain) -> str:
        """Map domain to PRISM suite code."""
        mapping = {
            Domain.REGULATORY: "RULES",
            Domain.CLINICAL: "TRIALS",
            Domain.SAFETY: "GUARD",
            Domain.MARKET_ACCESS: "VALUE",
            Domain.DIGITAL_HEALTH: "BRIDGE",
            Domain.RESEARCH: "PROOF",
            Domain.MEDICAL_AFFAIRS: "CRAFT",
            Domain.OPERATIONS: "PROJECT",
        }
        return mapping.get(domain, "VALUE")

    async def _get_agent_recommendations(
        self,
        query: str,
        domains: List[Domain],
        tenant_id: str,
    ) -> List[Dict[str, Any]]:
        """Get agent recommendations based on domain and query."""
        # This would query the database for matching agents
        # Simplified version for structure demonstration
        return []
```

---

### 5. API Router

```python
# api/routers/ai_companion/router.py
"""
AI Companion API Router
=======================

FastAPI router for unified AI companion endpoints.
"""

from fastapi import APIRouter

from .analyze import router as analyze_router
from .prompt import router as prompt_router
from .wizard import router as wizard_router
from .artifact import router as artifact_router
from .enrichment import router as enrichment_router
from .ontology import router as ontology_router

# Main router
router = APIRouter(prefix="/v1/ai-companion", tags=["AI Companion"])

# Include sub-routers
router.include_router(analyze_router, prefix="/analyze")
router.include_router(prompt_router, prefix="/prompt")
router.include_router(wizard_router, prefix="/wizard")
router.include_router(artifact_router, prefix="/artifact")
router.include_router(enrichment_router, prefix="/enrichment")
router.include_router(ontology_router, prefix="/ontology")


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    from services.unified_ai_companion import get_ai_companion_gateway

    gateway = get_ai_companion_gateway()
    return await gateway.health_check()
```

```python
# api/routers/ai_companion/analyze.py
"""
Analyze Endpoints
=================

Domain intelligence analysis endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from pydantic import BaseModel

from services.unified_ai_companion import get_ai_companion_gateway
from services.unified_ai_companion.schemas.responses import DomainIntelligenceResult

router = APIRouter()


class AnalyzeRequest(BaseModel):
    """Request model for analyze endpoint."""
    query: str
    context: Optional[dict] = None
    tenant_id: Optional[str] = None
    use_cache: bool = True


@router.post("/", response_model=DomainIntelligenceResult)
async def analyze_query(request: AnalyzeRequest):
    """
    Analyze a query for domain intelligence.

    Returns domain classification, complexity assessment,
    stakeholder detection, and agent recommendations.
    """
    gateway = get_ai_companion_gateway()

    result = await gateway.analyze(
        query=request.query,
        context=request.context,
        tenant_id=request.tenant_id,
        use_cache=request.use_cache,
    )

    return result
```

```python
# api/routers/ai_companion/prompt.py
"""
Prompt Engineering Endpoints
============================

Prompt enhancement and building endpoints.
"""

from fastapi import APIRouter
from typing import Optional
from pydantic import BaseModel

from services.unified_ai_companion import get_ai_companion_gateway
from services.unified_ai_companion.schemas.responses import PromptEngineeringResult

router = APIRouter()


class EnhanceRequest(BaseModel):
    """Request model for prompt enhancement."""
    prompt: str
    mode: str = "auto"  # auto, rewrite, build, citation
    suite: Optional[str] = None
    complexity: Optional[str] = None
    agent_context: Optional[dict] = None


class BuildAgentRequest(BaseModel):
    """Request model for building agent prompt."""
    name: str
    tagline: str
    description: str
    tier: int
    domain: Optional[str] = None


@router.post("/enhance", response_model=PromptEngineeringResult)
async def enhance_prompt(request: EnhanceRequest):
    """
    Enhance a prompt using various modes.

    Modes:
    - auto: Intelligent enhancement based on domain
    - rewrite: Full PRISM structure rewrite
    - build: Build system prompt from scratch
    - citation: Add citation requirements
    """
    gateway = get_ai_companion_gateway()

    result = await gateway.enhance_prompt(
        prompt=request.prompt,
        mode=request.mode,
        suite=request.suite,
        complexity=request.complexity,
        agent_context=request.agent_context,
    )

    return result


@router.post("/build-agent")
async def build_agent_prompt(request: BuildAgentRequest):
    """
    Build a complete agent profile with system prompt.

    Returns system prompt, capabilities, knowledge domains,
    and other suggested metadata.
    """
    gateway = get_ai_companion_gateway()

    result = await gateway.build_agent_prompt(
        name=request.name,
        tagline=request.tagline,
        description=request.description,
        tier=request.tier,
        domain=request.domain,
    )

    return result
```

---

### 6. Schemas

```python
# services/unified_ai_companion/schemas/responses.py
"""
Response Schemas
================

Pydantic models for API responses.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class DomainIntelligenceResult(BaseModel):
    """Result from domain intelligence analysis."""

    primary_domain: str = Field(..., description="Primary detected domain")
    secondary_domains: List[str] = Field(default_factory=list)
    complexity: str = Field(..., description="Query complexity level")
    confidence: float = Field(..., ge=0, le=1)
    stakeholder: str = Field(..., description="Detected stakeholder type")
    phase: str = Field(..., description="Development phase")
    urgency: str = Field(..., description="Urgency level")
    key_terms: List[str] = Field(default_factory=list)
    recommended_agents: List[Dict[str, Any]] = Field(default_factory=list)
    suggested_suite: str = Field(..., description="Suggested PRISM suite")


class PromptEngineeringResult(BaseModel):
    """Result from prompt engineering."""

    enhanced_prompt: str
    original_prompt: str
    enhancement_type: str
    variables_detected: List[str] = Field(default_factory=list)
    variables_filled: Dict[str, str] = Field(default_factory=dict)
    domain_context: str
    prism_structure_applied: bool = False
    citation_requirements_added: bool = False
    confidence: float = Field(default=0.85, ge=0, le=1)


class WizardQuestion(BaseModel):
    """A single wizard question."""

    question_id: str
    category: str
    question_text: str
    input_type: str  # text, select, multiselect, slider
    options: Optional[List[Dict[str, Any]]] = None
    required: bool = True
    help_text: Optional[str] = None
    validation_rules: Optional[Dict[str, Any]] = None


class WizardQuestionsResult(BaseModel):
    """Result from wizard question generation."""

    questions: List[WizardQuestion]
    step: int
    total_steps: int
    context_summary: Optional[str] = None


class WizardValidationResult(BaseModel):
    """Result from wizard step validation."""

    valid: bool
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    ai_feedback: Optional[str] = None


class ArtifactResult(BaseModel):
    """Result from artifact generation."""

    artifact_id: str
    artifact_type: str
    title: str
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    evidence_sources: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    ttl_days: int = 30
```

---

## Visual Summary

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    UNIFIED AI COMPANION BACKEND                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  📁 services/unified_ai_companion/                                       │
│  │                                                                       │
│  ├── 🚪 gateway.py              Main orchestrator (AICompanionGateway)  │
│  ├── ⚙️  config.py               Service configuration                   │
│  │                                                                       │
│  ├── 📁 core/                    Infrastructure                          │
│  │   ├── context_store.py       Shared context management               │
│  │   ├── model_router.py        Intelligent model selection             │
│  │   ├── cache_layer.py         Redis/in-memory caching                 │
│  │   └── metrics.py             Telemetry & metrics                     │
│  │                                                                       │
│  ├── 📁 capabilities/            AI Capabilities                         │
│  │   ├── domain_intelligence.py Domain detection (consolidates 3 svcs)  │
│  │   ├── prompt_engineering.py  Prompt enhancement (consolidates 4 svcs)│
│  │   ├── wizard_support.py      Wizard questions & validation           │
│  │   ├── artifact_generation.py Cards, reports, summaries               │
│  │   ├── enrichment_engine.py   Knowledge enrichment                    │
│  │   └── ontology_navigator.py  Org hierarchy navigation                │
│  │                                                                       │
│  ├── 📁 templates/               Domain Templates                        │
│  │   ├── pharma_domains.py      Pharma domain configs                   │
│  │   ├── prism_structures.py    PRISM 6-section templates               │
│  │   └── wizard_definitions.py  Wizard step definitions                 │
│  │                                                                       │
│  └── 📁 schemas/                 Pydantic Models                         │
│      ├── requests.py            API request models                      │
│      └── responses.py           API response models                     │
│                                                                          │
│  📁 api/routers/ai_companion/                                            │
│  │                                                                       │
│  ├── router.py                  Main router (/v1/ai-companion)          │
│  ├── analyze.py                 POST /analyze                           │
│  ├── prompt.py                  POST /prompt/enhance, /prompt/build-agent│
│  ├── wizard.py                  POST /wizard/questions, /wizard/validate│
│  ├── artifact.py                POST /artifact/generate                 │
│  └── ontology.py                GET /ontology/*                         │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

API Endpoints:
┌─────────────────────────────────────────────────────┐
│  /v1/ai-companion/                                  │
│  ├── POST /analyze           → DomainIntelligence  │
│  ├── POST /prompt/enhance    → PromptEngineering   │
│  ├── POST /prompt/build-agent→ PromptEngineering   │
│  ├── POST /wizard/questions  → WizardSupport       │
│  ├── POST /wizard/validate   → WizardSupport       │
│  ├── POST /artifact/generate → ArtifactGeneration  │
│  ├── GET  /ontology/hierarchy→ OntologyNavigator   │
│  └── GET  /health            → HealthCheck         │
└─────────────────────────────────────────────────────┘
```

---

## Key Design Patterns Used

| Pattern | Usage | Benefit |
|---------|-------|---------|
| **Gateway/Facade** | `AICompanionGateway` orchestrates all services | Single entry point, simplified API |
| **Lazy Loading** | Services initialized on first access | Faster startup, lower memory |
| **Singleton** | `get_ai_companion_gateway()` factory | Shared state, consistent behavior |
| **Strategy** | `ModelRouter` selects models dynamically | Cost/quality optimization |
| **Template Method** | Domain templates for different pharma areas | Consistent structure, easy extension |
| **Dependency Injection** | Services receive clients via constructor | Testable, mockable |

---

This structure provides a clean separation of concerns while consolidating the 12 fragmented services into one coherent system.

---

## Integration with Ontology Architecture

The Unified AI Companion backend structure is designed to work within the broader **ontology-aligned backend architecture**:

```
services/ai-engine/src/
├── ontology/                           # Ontology-aligned modules (NEW)
│   ├── l0_domain/                      # Domain knowledge services
│   ├── l1_organization/                # Organizational structure
│   ├── l2_process/                     # Process & workflow
│   ├── l3_jtbd/                        # Jobs to be done
│   ├── l4_agents/                      # Agent coordination
│   ├── l5_execution/                   # Execution layer
│   ├── l6_analytics/                   # Analytics layer
│   └── l7_value/                       # Value transformation
│
├── services/
│   └── unified_ai_companion/           # AI Companion (this doc)
│       ├── gateway.py                  # Main orchestrator
│       ├── capabilities/               # AI capabilities
│       └── core/                       # Infrastructure
│           └── ontology_context.py     # Uses ontology/ modules
```

The AI Companion uses the ontology modules for:
- **L0**: Domain detection via `ontology/l0_domain/`
- **L1**: Organization-aware recommendations via `ontology/l1_organization/`
- **L3**: JTBD-based wizard questions via `ontology/l3_jtbd/`
- **L4**: Agent selection via `ontology/l4_agents/`
- **L7**: Value tracking via `ontology/l7_value/`

See [ONTOLOGY_DRIVEN_BACKEND_STRUCTURE.md](./ONTOLOGY_DRIVEN_BACKEND_STRUCTURE.md) for the complete ontology module architecture.

---

*Last Updated: December 17, 2025*
