# Unified AI Companion Service Architecture

> **Version**: 1.1.0
> **Status**: Design Complete
> **Created**: December 17, 2025
> **Updated**: December 17, 2025
> **Author**: VITAL Architecture Team

## Related Documents

| Document | Description |
|----------|-------------|
| [UNIFIED_AI_COMPANION_BACKEND_STRUCTURE.md](./UNIFIED_AI_COMPANION_BACKEND_STRUCTURE.md) | Backend code structure and patterns |
| [UNIFIED_AI_COMPANION_ONTOLOGY_INTEGRATION.md](./UNIFIED_AI_COMPANION_ONTOLOGY_INTEGRATION.md) | 8-layer ontology integration analysis |
| [ONTOLOGY_DRIVEN_BACKEND_STRUCTURE.md](./ONTOLOGY_DRIVEN_BACKEND_STRUCTURE.md) | Full backend restructuring proposal |
| [BACKEND_SERVICE_REORGANIZATION.md](./BACKEND_SERVICE_REORGANIZATION.md) | Service migration guide (85 files) |

---

## Executive Summary

The Unified AI Companion Service (UACS) consolidates all AI-powered enhancement, generation, and recommendation services into a single, coherent platform service. This eliminates duplication, creates a consistent API surface, and enables intelligent cross-service orchestration.

---

## Current State Analysis

### Discovered AI Services (12 Total)

| Service | Location | Purpose | Issues |
|---------|----------|---------|--------|
| **PromptEnhancer** | `lib/shared/components/chat/prompt-enhancer.tsx` | Enhances prompts with PRISM structure | Frontend-only, limited to prompt enhancement |
| **AgentCreationWizard** | `features/agents/components/agent-creation-wizard.tsx` | 6-step agent creation | No shared AI services, standalone |
| **AIInterviewWizard** | `features/ask-expert/components/autonomous/AIInterviewWizard.tsx` | Mode 4 progressive disclosure | Separate question generation |
| **generate-system-prompt API** | `api/generate-system-prompt/route.ts` | Build/enhance agent prompts | Duplicate domain detection |
| **classify API** | `api/classify/route.ts` | Intent classification | Duplicate domain/complexity logic |
| **agents/recommend API** | `api/agents/recommend/route.ts` | Agent recommendation | Duplicate domain detection |
| **PRISM API** | `api/prism/route.ts` | Prompt suites/templates | Data service only |
| **CitationPromptEnhancer** | `services/citation_prompt_enhancer.py` | Citation requirements | Narrow scope |
| **ArtifactGenerator** | `services/artifact_generator.py` | Quick refs/reports | Standalone generator |
| **AgentEnrichmentService** | `services/agent_enrichment_service.py` | Knowledge enrichment | Complex, good patterns |
| **OntologyInvestigator** | `api/routers/enterprise_ontology/ontology.py` | Org hierarchy | Data endpoints only |
| **context_enricher** | `modules/expert/services/context_enricher.py` | Context enrichment | Expert module specific |

### Key Problems

1. **Duplicate Domain Detection** - 3 services independently detect domains (classify, recommend, generate-system-prompt)
2. **Fragmented Prompt Enhancement** - CitationPromptEnhancer, PromptEnhancer, generate-system-prompt all enhance prompts differently
3. **No Unified Interface** - Each service has its own API contract
4. **Separate Wizards** - AgentCreationWizard, AIInterviewWizard don't share AI capabilities
5. **No Cross-Service Context** - Services don't share learned context or state

---

## Unified Architecture Design

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        UNIFIED AI COMPANION SERVICE                         │
│                              (Python Backend)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   AI Gateway    │  │  Context Store  │  │  Model Router   │             │
│  │  (Orchestrator) │  │   (Shared)      │  │  (Intelligent)  │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
│           │                    │                    │                      │
│           └────────────────────┼────────────────────┘                      │
│                                │                                           │
│  ┌─────────────────────────────┴─────────────────────────────────────┐    │
│  │                      CORE CAPABILITIES                             │    │
│  │                                                                    │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │    │
│  │  │  Domain      │  │  Prompt      │  │  Artifact    │             │    │
│  │  │  Intelligence│  │  Engineering │  │  Generation  │             │    │
│  │  │              │  │              │  │              │             │    │
│  │  │ • Detection  │  │ • Enhance    │  │ • Cards      │             │    │
│  │  │ • Classify   │  │ • Build      │  │ • Reports    │             │    │
│  │  │ • Recommend  │  │ • Citations  │  │ • Summaries  │             │    │
│  │  │ • Complexity │  │ • Variables  │  │ • Exports    │             │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │    │
│  │                                                                    │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │    │
│  │  │  Wizard      │  │  Enrichment  │  │  Ontology    │             │    │
│  │  │  Support     │  │  Engine      │  │  Navigator   │             │    │
│  │  │              │  │              │  │              │             │    │
│  │  │ • Questions  │  │ • Feedback   │  │ • Functions  │             │    │
│  │  │ • Validation │  │ • Tools      │  │ • Roles      │             │    │
│  │  │ • Guidance   │  │ • Learning   │  │ • Personas   │             │    │
│  │  │ • Progress   │  │ • Scoring    │  │ • Hierarchy  │             │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │    │
│  │                                                                    │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
          ┌─────────▼─────────┐   ┌─▼─┐   ┌────────▼────────┐
          │  Frontend Hooks   │   │SSE│   │  WebSocket      │
          │  (useAICompanion) │   └─┬─┘   │  (Real-time)    │
          └─────────┬─────────┘     │     └────────┬────────┘
                    │               │              │
          ┌─────────▼───────────────┴──────────────▼─────────┐
          │              FRONTEND COMPONENTS                  │
          │                                                   │
          │  • PromptEnhancer → uses UACS.prompt.*           │
          │  • AgentCreationWizard → uses UACS.wizard.*      │
          │  • AIInterviewWizard → uses UACS.wizard.*        │
          │  • OntologyExplorer → uses UACS.ontology.*       │
          │  • ValueViewBuilder → uses UACS.ontology.*       │
          └───────────────────────────────────────────────────┘
```

---

## Core Capabilities

### 1. Domain Intelligence Module

**Purpose**: Unified domain detection, classification, and recommendation engine.

```python
# services/ai-engine/src/services/unified_ai_companion/domain_intelligence.py

from typing import List, Dict, Optional
from pydantic import BaseModel
from enum import Enum

class Domain(str, Enum):
    REGULATORY = "regulatory"
    CLINICAL = "clinical"
    MARKET_ACCESS = "market_access"
    DIGITAL_HEALTH = "digital_health"
    COMMERCIAL = "commercial"
    SAFETY = "safety"
    RESEARCH = "research"
    OPERATIONS = "operations"
    GENERAL = "general"

class Complexity(str, Enum):
    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"
    EXPERT = "expert"

class DomainIntelligenceResult(BaseModel):
    """Unified domain intelligence result."""
    primary_domain: Domain
    secondary_domains: List[Domain]
    complexity: Complexity
    confidence: float
    stakeholder: str  # researcher, regulatory, clinical, commercial, executive
    phase: str        # discovery, preclinical, clinical, regulatory, commercial
    urgency: str      # low, medium, high, critical
    key_terms: List[str]
    recommended_agents: List[Dict]  # Top 3 agent recommendations
    suggested_suite: str  # PRISM suite suggestion

class DomainIntelligenceService:
    """
    Unified domain intelligence service.

    Consolidates:
    - /api/classify detection
    - /api/agents/recommend domain detection
    - generate-system-prompt domain detection
    """

    async def analyze(
        self,
        query: str,
        context: Optional[Dict] = None,
        tenant_id: Optional[str] = None
    ) -> DomainIntelligenceResult:
        """
        Analyze query to determine domain, complexity, and recommendations.

        Single source of truth for all domain-related intelligence.
        """
        # Step 1: Fast keyword detection (no LLM)
        detected_domains = self._detect_domains_fast(query)
        complexity = self._assess_complexity_fast(query)

        # Step 2: Context enrichment (if provided)
        if context:
            detected_domains = self._enrich_with_context(detected_domains, context)

        # Step 3: Agent recommendations (cached)
        recommendations = await self._get_agent_recommendations(
            query, detected_domains, tenant_id
        )

        # Step 4: Suite mapping
        suite = self._map_to_prism_suite(detected_domains[0])

        return DomainIntelligenceResult(
            primary_domain=detected_domains[0],
            secondary_domains=detected_domains[1:],
            complexity=complexity,
            confidence=self._calculate_confidence(detected_domains),
            stakeholder=self._detect_stakeholder(query),
            phase=self._detect_phase(query),
            urgency=self._detect_urgency(query),
            key_terms=self._extract_key_terms(query),
            recommended_agents=recommendations,
            suggested_suite=suite
        )
```

### 2. Prompt Engineering Module

**Purpose**: All prompt enhancement, building, and variable processing.

```python
# services/ai-engine/src/services/unified_ai_companion/prompt_engineering.py

class PromptEngineeringResult(BaseModel):
    """Unified prompt engineering result."""
    enhanced_prompt: str
    original_prompt: str
    enhancement_type: str  # auto, rewrite, build, citation
    variables_detected: List[str]
    variables_filled: Dict[str, str]
    domain_context: str
    prism_structure_applied: bool
    citation_requirements_added: bool
    confidence: float

class PromptEngineeringService:
    """
    Unified prompt engineering service.

    Consolidates:
    - PromptEnhancer (frontend)
    - CitationPromptEnhancer
    - generate-system-prompt API
    - PRISM template processing
    """

    async def enhance(
        self,
        prompt: str,
        mode: str = "auto",  # auto, rewrite, build, citation
        suite: Optional[str] = None,
        complexity: Optional[str] = None,
        agent_context: Optional[Dict] = None,
        domain_intelligence: Optional[DomainIntelligenceResult] = None
    ) -> PromptEngineeringResult:
        """
        Enhance a prompt with multiple modes.

        Modes:
        - auto: Intelligent enhancement based on domain
        - rewrite: Full PRISM structure rewrite
        - build: Build system prompt from scratch
        - citation: Add citation requirements
        """
        # Use domain intelligence if provided
        if domain_intelligence is None:
            domain_intelligence = await self.domain_service.analyze(prompt)

        # Apply appropriate enhancement
        if mode == "auto":
            enhanced = await self._auto_enhance(prompt, domain_intelligence)
        elif mode == "rewrite":
            enhanced = await self._rewrite_prism(prompt, suite, complexity)
        elif mode == "build":
            enhanced = await self._build_system_prompt(prompt, agent_context)
        elif mode == "citation":
            enhanced = await self._add_citations(prompt, agent_context)
        else:
            enhanced = prompt

        # Detect and fill variables
        variables = self._detect_variables(enhanced)

        return PromptEngineeringResult(
            enhanced_prompt=enhanced,
            original_prompt=prompt,
            enhancement_type=mode,
            variables_detected=variables,
            variables_filled={},
            domain_context=domain_intelligence.primary_domain.value,
            prism_structure_applied=mode in ["auto", "rewrite"],
            citation_requirements_added=mode == "citation",
            confidence=0.85
        )

    async def build_agent_prompt(
        self,
        name: str,
        tagline: str,
        description: str,
        tier: int,
        domain: Optional[str] = None
    ) -> Dict:
        """
        Build complete agent profile with system prompt.

        Returns both the system prompt and suggested metadata.
        """
        # Detect domain from name/description if not provided
        if not domain:
            intel = await self.domain_service.analyze(f"{name} {description}")
            domain = intel.primary_domain.value

        # Get domain template
        template = self._get_pharma_template(domain)

        # Generate 6-section system prompt
        system_prompt = await self._generate_6_section_prompt(
            name=name,
            tagline=tagline,
            description=description,
            tier=tier,
            template=template
        )

        return {
            "system_prompt": system_prompt,
            "suggested_capabilities": template.get("capabilities", []),
            "knowledge_domains": template.get("knowledge_domains", []),
            "hipaa_required": template.get("hipaa_required", False),
            "audit_trail": tier >= 2,
            "model_suggestion": self._suggest_model_for_tier(tier)
        }
```

### 3. Wizard Support Module

**Purpose**: Shared wizard functionality for all multi-step wizards.

```python
# services/ai-engine/src/services/unified_ai_companion/wizard_support.py

class WizardQuestionResult(BaseModel):
    """AI-generated wizard question."""
    question_id: str
    category: str  # goal, scope, depth, timeline, constraints, preferences
    question_text: str
    input_type: str  # text, select, multiselect, slider
    options: Optional[List[Dict]] = None
    required: bool = True
    help_text: Optional[str] = None

class WizardValidationResult(BaseModel):
    """Wizard step validation result."""
    valid: bool
    errors: List[str]
    warnings: List[str]
    suggestions: List[str]
    ai_feedback: Optional[str] = None

class WizardSupportService:
    """
    Unified wizard support service.

    Supports:
    - AgentCreationWizard
    - AIInterviewWizard (Mode 4)
    - Future: WorkflowDesigner, OnboardingWizard, etc.
    """

    async def generate_questions(
        self,
        wizard_type: str,
        step: int,
        context: Dict,
        domain_intelligence: Optional[DomainIntelligenceResult] = None
    ) -> List[WizardQuestionResult]:
        """
        Generate AI-powered questions for any wizard.

        Wizard types:
        - agent_creation: Agent building wizard
        - mission_config: Mode 4 mission configuration
        - workflow_design: Workflow designer
        - onboarding: User onboarding
        """
        # Get wizard definition
        wizard_def = self._get_wizard_definition(wizard_type)

        # Generate questions based on step and context
        questions = await self._generate_step_questions(
            wizard_def=wizard_def,
            step=step,
            context=context,
            domain_intelligence=domain_intelligence
        )

        return questions

    async def validate_step(
        self,
        wizard_type: str,
        step: int,
        data: Dict,
        context: Dict
    ) -> WizardValidationResult:
        """
        Validate wizard step data with AI assistance.
        """
        # Basic validation
        errors = self._basic_validation(wizard_type, step, data)

        # AI-powered validation (suggestions, improvements)
        ai_feedback = await self._ai_validation(wizard_type, step, data, context)

        return WizardValidationResult(
            valid=len(errors) == 0,
            errors=errors,
            warnings=ai_feedback.get("warnings", []),
            suggestions=ai_feedback.get("suggestions", []),
            ai_feedback=ai_feedback.get("feedback")
        )

    async def generate_guidance(
        self,
        wizard_type: str,
        step: int,
        user_input: str,
        context: Dict
    ) -> str:
        """
        Generate contextual guidance for wizard step.
        """
        return await self._generate_contextual_help(
            wizard_type, step, user_input, context
        )
```

### 4. Artifact Generation Module

**Purpose**: Unified artifact generation (cards, reports, summaries).

```python
# services/ai-engine/src/services/unified_ai_companion/artifact_generation.py

class ArtifactGenerationService:
    """
    Unified artifact generation service.

    Artifact types:
    - quick_reference: Mode 1 quick reference cards
    - research_report: Mode 3 comprehensive reports
    - executive_summary: High-level summaries
    - export_package: Multi-format exports
    """

    async def generate(
        self,
        artifact_type: str,
        content: str,
        evidence_context: Dict,
        tenant_id: str,
        options: Optional[Dict] = None
    ) -> ArtifactResult:
        """Generate artifact based on type."""

        if artifact_type == "quick_reference":
            return await self._generate_quick_reference(content, evidence_context)
        elif artifact_type == "research_report":
            return await self._generate_research_report(content, evidence_context)
        elif artifact_type == "executive_summary":
            return await self._generate_executive_summary(content, evidence_context)
        elif artifact_type == "export_package":
            return await self._generate_export_package(content, evidence_context, options)
```

---

## API Design

### Unified REST Endpoints

```
/v1/ai-companion/
├── analyze/                    # Domain intelligence
│   └── POST /                  # Analyze query for domain/complexity
│
├── prompt/                     # Prompt engineering
│   ├── POST /enhance           # Enhance prompt (all modes)
│   ├── POST /build-agent       # Build agent system prompt
│   └── POST /fill-variables    # Fill prompt variables
│
├── wizard/                     # Wizard support
│   ├── POST /questions         # Generate wizard questions
│   ├── POST /validate          # Validate wizard step
│   └── POST /guidance          # Get contextual guidance
│
├── artifact/                   # Artifact generation
│   ├── POST /generate          # Generate any artifact type
│   └── GET /{id}               # Retrieve generated artifact
│
├── enrichment/                 # Knowledge enrichment
│   ├── POST /from-feedback     # Enrich from user feedback
│   └── POST /from-tool         # Enrich from tool output
│
└── ontology/                   # Ontology navigation
    ├── GET /hierarchy          # Full hierarchy
    ├── GET /functions          # Functions list
    ├── GET /roles              # Roles with filters
    └── GET /suggest            # Suggest ontology path
```

### Frontend Hook

```typescript
// apps/vital-system/src/hooks/useAICompanion.ts

import { useState, useCallback } from 'react';

interface AICompanionOptions {
  tenantId?: string;
  agentContext?: Record<string, unknown>;
}

export function useAICompanion(options: AICompanionOptions = {}) {
  const [loading, setLoading] = useState(false);

  // Domain Intelligence
  const analyze = useCallback(async (query: string) => {
    setLoading(true);
    const response = await fetch('/api/ai-companion/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, tenant_id: options.tenantId })
    });
    setLoading(false);
    return response.json();
  }, [options.tenantId]);

  // Prompt Engineering
  const enhancePrompt = useCallback(async (
    prompt: string,
    mode: 'auto' | 'rewrite' | 'build' | 'citation' = 'auto',
    suite?: string
  ) => {
    setLoading(true);
    const response = await fetch('/api/ai-companion/prompt/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, mode, suite, ...options })
    });
    setLoading(false);
    return response.json();
  }, [options]);

  // Wizard Support
  const generateWizardQuestions = useCallback(async (
    wizardType: string,
    step: number,
    context: Record<string, unknown>
  ) => {
    const response = await fetch('/api/ai-companion/wizard/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wizard_type: wizardType, step, context })
    });
    return response.json();
  }, []);

  const validateWizardStep = useCallback(async (
    wizardType: string,
    step: number,
    data: Record<string, unknown>,
    context: Record<string, unknown>
  ) => {
    const response = await fetch('/api/ai-companion/wizard/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wizard_type: wizardType, step, data, context })
    });
    return response.json();
  }, []);

  // Artifact Generation
  const generateArtifact = useCallback(async (
    type: string,
    content: string,
    evidenceContext: Record<string, unknown>
  ) => {
    const response = await fetch('/api/ai-companion/artifact/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artifact_type: type,
        content,
        evidence_context: evidenceContext,
        tenant_id: options.tenantId
      })
    });
    return response.json();
  }, [options.tenantId]);

  return {
    loading,
    // Domain Intelligence
    analyze,
    // Prompt Engineering
    enhancePrompt,
    buildAgentPrompt: () => {}, // TODO
    fillVariables: () => {},    // TODO
    // Wizard Support
    generateWizardQuestions,
    validateWizardStep,
    getGuidance: () => {},      // TODO
    // Artifact Generation
    generateArtifact,
    // Enrichment
    enrichFromFeedback: () => {}, // TODO
    // Ontology
    getHierarchy: () => {},     // TODO
    suggestOntologyPath: () => {} // TODO
  };
}
```

---

## Migration Path

### Phase 1: Backend Consolidation (Week 1-2)

1. Create `unified_ai_companion/` module structure
2. Implement DomainIntelligenceService (consolidate classify + recommend + generate-system-prompt)
3. Implement PromptEngineeringService (consolidate all prompt enhancement)
4. Create unified FastAPI router

### Phase 2: Frontend Integration (Week 3)

1. Create `useAICompanion` hook
2. Update PromptEnhancer to use new hook
3. Update AgentCreationWizard to use new hook
4. Update AIInterviewWizard to use new hook

### Phase 3: Feature Completion (Week 4)

1. Implement WizardSupportService
2. Migrate ArtifactGenerator to unified service
3. Migrate AgentEnrichmentService to unified service
4. Add streaming support via SSE

### Phase 4: Deprecation (Week 5+)

1. Deprecate old individual endpoints
2. Update all consumers to use unified API
3. Remove deprecated code
4. Performance optimization

---

## Benefits

| Benefit | Description |
|---------|-------------|
| **Single Source of Truth** | Domain detection done once, shared across all services |
| **Consistent API** | One hook, one API pattern for all AI companion features |
| **Reduced Duplication** | No more 3 implementations of domain detection |
| **Shared Context** | Wizards share context, enabling smarter AI responses |
| **Easier Testing** | Test one service instead of 12 |
| **Better Caching** | Cache domain intelligence, reuse across requests |
| **Simpler Frontend** | One hook instead of multiple service calls |
| **Extensible** | Easy to add new AI capabilities |

---

## File Structure

```
services/ai-engine/src/services/unified_ai_companion/
├── __init__.py
├── gateway.py                    # Main orchestrator
├── domain_intelligence.py        # Domain detection & recommendations
├── prompt_engineering.py         # All prompt enhancement
├── wizard_support.py             # Wizard question/validation
├── artifact_generation.py        # Artifact generation
├── enrichment_engine.py          # Knowledge enrichment
├── ontology_navigator.py         # Ontology navigation
├── model_router.py               # Intelligent model selection
├── context_store.py              # Shared context management
└── constants.py                  # Domain patterns, templates

apps/vital-system/src/
├── hooks/
│   └── useAICompanion.ts         # Unified frontend hook
└── app/api/ai-companion/
    ├── analyze/route.ts          # Proxy to Python backend
    ├── prompt/
    │   ├── enhance/route.ts
    │   └── build-agent/route.ts
    ├── wizard/
    │   ├── questions/route.ts
    │   └── validate/route.ts
    └── artifact/
        └── generate/route.ts
```

---

## Conclusion

The Unified AI Companion Service represents a significant architectural improvement that will:

1. **Eliminate 60%+ code duplication** across AI services
2. **Provide consistent UX** across all AI-enhanced features
3. **Enable smarter AI** through shared context and learning
4. **Simplify development** with a single hook for all AI features
5. **Improve performance** through centralized caching and optimization

This design maintains backward compatibility during migration while establishing a clear path to a cleaner, more maintainable architecture.

---

## Related Architecture

The Unified AI Companion Service is part of a broader backend restructuring initiative:

### Ontology-Driven Architecture

The companion service integrates with the 8-layer Enterprise Ontology:
- **L0**: Domain Knowledge (therapeutic areas, diseases, evidence types)
- **L1**: Organizational Structure (functions, departments, roles)
- **L2-L3**: Process & JTBD (workflows, jobs-to-be-done)
- **L4**: Agent Coordination (agent registry, selection)
- **L5**: Execution (sessions, missions)
- **L6**: Analytics (metrics, quality)
- **L7**: Value Transformation (VPANES, ODI, ROI)

See [ONTOLOGY_DRIVEN_BACKEND_STRUCTURE.md](./ONTOLOGY_DRIVEN_BACKEND_STRUCTURE.md) for the full restructuring proposal.

### Service Reorganization

The current 85 files in `services/` will be reorganized into ontology-aligned modules:
- 14 files → `ontology/l0_domain/`
- 14 files → `ontology/l4_agents/`
- 15 files → `ontology/l5_execution/`
- 8 files → `ontology/l6_analytics/`
- New files → `ontology/l7_value/`

See [BACKEND_SERVICE_REORGANIZATION.md](./BACKEND_SERVICE_REORGANIZATION.md) for the migration guide.

---

*Last Updated: December 17, 2025*
