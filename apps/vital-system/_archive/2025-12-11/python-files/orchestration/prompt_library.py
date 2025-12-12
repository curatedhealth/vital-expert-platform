#!/usr/bin/env python3
"""
VITAL Path Dynamic Prompt Library Management System
Advanced prompt management, versioning, and optimization for the PRISM framework

PROMPT 2.4: Dynamic Prompt Library Management System
- Intelligent prompt curation and versioning
- Dynamic prompt adaptation based on context
- Performance analytics and optimization
- Multi-language and domain-specific prompts
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple, Union
from dataclasses import dataclass, field, asdict
from enum import Enum
import re
import hashlib
import yaml
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PromptType(Enum):
    """Types of prompts in the library"""
    SYSTEM_PROMPT = "system_prompt"
    USER_PROMPT = "user_prompt"
    CONTEXT_PROMPT = "context_prompt"
    CHAIN_PROMPT = "chain_prompt"
    TEMPLATE_PROMPT = "template_prompt"
    VALIDATION_PROMPT = "validation_prompt"

class PromptStatus(Enum):
    """Status of prompts in the library"""
    DRAFT = "draft"
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"
    TESTING = "testing"

class OptimizationStrategy(Enum):
    """Strategies for prompt optimization"""
    PERFORMANCE_BASED = "performance_based"
    CONTEXT_ADAPTIVE = "context_adaptive"
    A_B_TESTING = "a_b_testing"
    REINFORCEMENT_LEARNING = "reinforcement_learning"
    HUMAN_FEEDBACK = "human_feedback"

@dataclass
class PromptTemplate:
    """Template structure for prompts"""
    template_id: str
    name: str
    description: str
    template_text: str
    variables: List[str]
    required_variables: List[str]
    optional_variables: List[str]
    validation_rules: Dict[str, Any]
    example_values: Dict[str, str]
    usage_context: List[str]

@dataclass
class PromptVersion:
    """Version information for prompt tracking"""
    version_id: str
    version_number: str
    created_at: datetime
    created_by: str
    change_description: str
    parent_version: Optional[str]
    performance_metrics: Dict[str, float]
    is_active: bool
    rollback_safe: bool

@dataclass
class PromptMetadata:
    """Comprehensive metadata for prompt management"""
    prompt_id: str
    name: str
    display_name: str
    description: str
    category: str
    subcategory: str
    prompt_type: PromptType
    status: PromptStatus
    prism_suite: str
    domain: str
    therapeutic_areas: List[str]
    language: str
    difficulty_level: int  # 1-10
    estimated_tokens: int
    max_tokens: int
    temperature_recommendation: float
    tags: List[str]
    dependencies: List[str]
    created_at: datetime
    updated_at: datetime
    version_info: PromptVersion
    usage_analytics: Dict[str, Any]

@dataclass
class PromptContent:
    """Actual prompt content and configurations"""
    system_prompt: str
    user_prompt: str
    context_template: str
    example_inputs: List[Dict[str, str]]
    example_outputs: List[str]
    validation_criteria: List[str]
    optimization_notes: str
    performance_benchmarks: Dict[str, float]

@dataclass
class PromptLibraryEntry:
    """Complete prompt library entry"""
    metadata: PromptMetadata
    content: PromptContent
    template: PromptTemplate
    versions: List[PromptVersion]
    analytics: Dict[str, Any]

@dataclass
class PromptOptimizationResult:
    """Result of prompt optimization analysis"""
    original_prompt_id: str
    optimized_prompt_id: str
    optimization_strategy: OptimizationStrategy
    improvements: Dict[str, float]
    confidence_score: float
    recommendations: List[str]
    a_b_test_plan: Optional[Dict[str, Any]]
    rollout_strategy: str

class PromptLibraryManager:
    """
    Advanced prompt library management system for VITAL Path

    Capabilities:
    - Dynamic prompt creation and versioning
    - Context-aware prompt selection and adaptation
    - Performance analytics and optimization
    - Multi-language and domain support
    - A/B testing and continuous improvement
    """

    def __init__(self, library_path: Optional[str] = None):
        self.library_path = Path(library_path) if library_path else Path("./prompt_library")
        self.prompts: Dict[str, PromptLibraryEntry] = {}
        self.templates: Dict[str, PromptTemplate] = {}
        self.optimization_history: List[PromptOptimizationResult] = []
        self.active_experiments: Dict[str, Dict[str, Any]] = {}
        self.performance_cache: Dict[str, Dict[str, float]] = {}

        # Initialize library
        asyncio.create_task(self._initialize_library())

    async def _initialize_library(self):
        """Initialize the prompt library with default PRISM prompts"""
        logger.info("Initializing VITAL Path Prompt Library...")

        # Create library directory structure
        await self._create_library_structure()

        # Load existing prompts or create default PRISM library
        await self._load_or_create_default_library()

        # Initialize templates
        await self._initialize_templates()

        logger.info(f"Prompt library initialized with {len(self.prompts)} prompts")

    async def _create_library_structure(self):
        """Create the directory structure for the prompt library"""
        directories = [
            self.library_path,
            self.library_path / "prism_suites",
            self.library_path / "templates",
            self.library_path / "versions",
            self.library_path / "analytics",
            self.library_path / "experiments",
            self.library_path / "backups"
        ]

        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)

    async def _load_or_create_default_library(self):
        """Load existing library or create default PRISM prompts"""

        # Check if library exists
        library_file = self.library_path / "library_index.json"

        if library_file.exists():
            await self._load_existing_library()
        else:
            await self._create_default_prism_library()

    async def _create_default_prism_library(self):
        """Create default PRISM framework prompt library"""

        default_prompts = {
            # RULES™ Suite
            "rules_regulatory_guidance": {
                "name": "Regulatory Guidance Analysis",
                "prism_suite": "RULES",
                "domain": "regulatory_compliance",
                "system_prompt": """You are a regulatory affairs expert specializing in FDA, EMA, and ICH guidelines. Your expertise includes:

- FDA guidance documents and regulatory pathways
- EMA centralized procedures and scientific advice
- ICH guidelines (E1-E20) and implementation
- Regulatory strategy development
- Submission planning and optimization

Provide comprehensive, accurate regulatory guidance based on current requirements and best practices. Always cite relevant guidance documents and highlight any recent updates or emerging requirements.""",
                "user_prompt": """Analyze the following regulatory query and provide detailed guidance:

**Query:** {query}

**Context:** {context}

**Therapeutic Area:** {therapeutic_area}

**Region/Authority:** {regulatory_authority}

Please provide:
1. Applicable regulatory requirements and guidance
2. Recommended regulatory pathway
3. Key considerations and potential challenges
4. Timeline estimates and critical milestones
5. Relevant guidance documents and citations
6. Next steps and action items

Ensure all recommendations align with current regulatory expectations and highlight any areas requiring further clarification with authorities."""
            },

            "rules_compliance_assessment": {
                "name": "Compliance Assessment Framework",
                "prism_suite": "RULES",
                "domain": "regulatory_compliance",
                "system_prompt": """You are a compliance assessment specialist with expertise in:

- GxP compliance (GCP, GLP, GMP, GDP)
- Quality management systems (ICH Q8-Q12)
- Risk management and quality assurance
- Regulatory compliance auditing
- Deviation investigation and CAPA

Conduct thorough compliance assessments and provide actionable recommendations for maintaining regulatory standards.""",
                "user_prompt": """Conduct a compliance assessment for the following scenario:

**Scenario:** {scenario}

**Regulatory Framework:** {framework}

**Quality Requirements:** {quality_requirements}

**Assessment Scope:** {scope}

Provide:
1. Compliance gap analysis
2. Risk assessment and prioritization
3. Corrective and preventive actions (CAPA)
4. Implementation timeline and resources
5. Monitoring and validation plan
6. Documentation requirements

Ensure assessment covers all relevant GxP requirements and industry best practices."""
            },

            # TRIALS™ Suite
            "trials_study_design": {
                "name": "Clinical Trial Design Optimization",
                "prism_suite": "TRIALS",
                "domain": "clinical_research",
                "system_prompt": """You are a clinical trial design expert with specialization in:

- Protocol development and optimization
- Adaptive trial designs and statistical methodology
- Endpoint selection and biomarker strategy
- Patient population definition and recruitment
- Regulatory interaction and agency feedback

Design robust, efficient clinical trials that meet regulatory requirements while optimizing for speed, cost, and scientific rigor.""",
                "user_prompt": """Design an optimal clinical trial for the following indication:

**Indication:** {indication}

**Therapeutic Area:** {therapeutic_area}

**Development Phase:** {phase}

**Primary Objective:** {objective}

**Patient Population:** {population}

**Available Resources:** {resources}

Provide:
1. Study design recommendation with rationale
2. Primary and secondary endpoints
3. Statistical considerations and sample size
4. Patient inclusion/exclusion criteria
5. Biomarker and companion diagnostic strategy
6. Regulatory pathway and interaction plan
7. Risk mitigation strategies
8. Timeline and milestone projections

Ensure design optimizes for regulatory acceptance, feasibility, and commercial success."""
            },

            "trials_endpoint_strategy": {
                "name": "Clinical Endpoint Strategy",
                "prism_suite": "TRIALS",
                "domain": "clinical_research",
                "system_prompt": """You are a clinical endpoint strategist with expertise in:

- FDA and EMA endpoint qualification programs
- Biomarker validation and regulatory acceptance
- Patient-reported outcomes (PRO) development
- Digital endpoints and remote monitoring
- Composite endpoint design and validation

Develop scientifically sound and regulatorily acceptable endpoint strategies for clinical development programs.""",
                "user_prompt": """Develop an endpoint strategy for the following clinical program:

**Program:** {program}

**Indication:** {indication}

**Target Population:** {population}

**Mechanism of Action:** {mechanism}

**Development Stage:** {stage}

**Regulatory Requirements:** {requirements}

Provide:
1. Primary endpoint recommendation and justification
2. Secondary and exploratory endpoints
3. Biomarker strategy (predictive, prognostic, pharmacodynamic)
4. Patient-reported outcome considerations
5. Digital endpoint opportunities
6. Regulatory qualification pathway
7. Validation requirements and timeline
8. Risk assessment and mitigation strategies

Ensure endpoints align with regulatory guidance and support commercial labeling goals."""
            },

            # GUARD™ Suite
            "guard_safety_monitoring": {
                "name": "Safety Monitoring Framework",
                "prism_suite": "GUARD",
                "domain": "pharmacovigilance",
                "system_prompt": """You are a pharmacovigilance and safety expert specializing in:

- ICH E2A-E2F safety reporting guidelines
- Signal detection and risk management
- Periodic safety update reports (PSURs/PBRERs)
- Risk evaluation and mitigation strategies (REMS)
- Safety database management and compliance

Develop comprehensive safety monitoring strategies that ensure patient safety while supporting regulatory compliance and commercial success.""",
                "user_prompt": """Develop a safety monitoring strategy for:

**Product:** {product}

**Indication:** {indication}

**Development Phase:** {phase}

**Known Safety Profile:** {safety_profile}

**Patient Population:** {population}

**Special Considerations:** {considerations}

Provide:
1. Safety monitoring plan and surveillance strategy
2. Signal detection methodology and thresholds
3. Risk management and mitigation measures
4. Adverse event classification and reporting procedures
5. Periodic safety reporting schedule
6. Risk-benefit assessment framework
7. REMS considerations and implementation
8. Post-market surveillance strategy

Ensure plan complies with global pharmacovigilance requirements and supports risk minimization."""
            },

            # VALUE™ Suite
            "value_health_economics": {
                "name": "Health Economic Value Proposition",
                "prism_suite": "VALUE",
                "domain": "health_economics",
                "system_prompt": """You are a health economics and outcomes research expert with expertise in:

- Health technology assessment (HTA) requirements
- Economic modeling (Markov, discrete event simulation)
- Cost-effectiveness and budget impact analysis
- Real-world evidence generation and analysis
- Payer value proposition development

Develop compelling economic evidence and value propositions that support market access and reimbursement decisions.""",
                "user_prompt": """Develop a health economic value proposition for:

**Intervention:** {intervention}

**Indication:** {indication}

**Target Population:** {population}

**Comparators:** {comparators}

**Payer Context:** {payer_context}

**Budget Considerations:** {budget}

Provide:
1. Economic model structure and rationale
2. Cost-effectiveness analysis approach
3. Budget impact assessment methodology
4. Real-world evidence requirements
5. Value proposition messaging and positioning
6. HTA submission strategy by jurisdiction
7. Pricing and reimbursement considerations
8. Market access timeline and milestones

Ensure approach aligns with HTA requirements and payer priorities across key markets."""
            },

            # PROOF™ Suite
            "proof_evidence_synthesis": {
                "name": "Evidence Synthesis and Meta-Analysis",
                "prism_suite": "PROOF",
                "domain": "evidence_synthesis",
                "system_prompt": """You are an evidence synthesis expert specializing in:

- Systematic review methodology (PRISMA guidelines)
- Meta-analysis and network meta-analysis
- Real-world evidence study design
- Evidence quality assessment (GRADE methodology)
- Regulatory evidence packages

Conduct rigorous evidence synthesis that meets the highest scientific and regulatory standards.""",
                "user_prompt": """Conduct evidence synthesis for the following research question:

**Research Question:** {research_question}

**Population:** {population}

**Intervention:** {intervention}

**Comparator:** {comparator}

**Outcomes:** {outcomes}

**Study Types:** {study_types}

**Context:** {context}

Provide:
1. Systematic review protocol and methodology
2. Search strategy and inclusion/exclusion criteria
3. Data extraction and quality assessment plan
4. Statistical analysis approach
5. Evidence synthesis and meta-analysis methods
6. GRADE evidence quality assessment
7. Publication and dissemination strategy
8. Regulatory and commercial implications

Ensure methodology follows PRISMA guidelines and meets regulatory evidence standards."""
            },

            # CRAFT™ Suite
            "craft_medical_writing": {
                "name": "Medical Writing Excellence",
                "prism_suite": "CRAFT",
                "domain": "medical_writing",
                "system_prompt": """You are a medical writing expert with specialization in:

- Regulatory writing (CTD, eCTD, investigator brochures)
- Clinical study reports and protocols
- Scientific publications and manuscripts
- Medical communication materials
- Regulatory correspondence and responses

Create clear, accurate, and compelling medical documents that meet regulatory requirements and scientific publishing standards.""",
                "user_prompt": """Develop medical writing content for:

**Document Type:** {document_type}

**Therapeutic Area:** {therapeutic_area}

**Target Audience:** {audience}

**Key Messages:** {key_messages}

**Regulatory Context:** {regulatory_context}

**Scientific Data:** {data}

Provide:
1. Document structure and outline
2. Key content sections and messaging
3. Scientific writing approach and style
4. Regulatory compliance considerations
5. Quality review and approval process
6. Timeline and resource requirements
7. Risk assessment and mitigation
8. Publication and dissemination strategy

Ensure content meets regulatory standards and effectively communicates scientific value."""
            },

            # SCOUT™ Suite
            "scout_competitive_intelligence": {
                "name": "Competitive Intelligence Analysis",
                "prism_suite": "SCOUT",
                "domain": "competitive_intelligence",
                "system_prompt": """You are a competitive intelligence analyst specializing in:

- Pharmaceutical and biotech landscape analysis
- Pipeline assessment and threat analysis
- Market dynamics and opportunity identification
- Patent landscape and intellectual property analysis
- Strategic planning and scenario modeling

Provide comprehensive competitive intelligence that informs strategic decision-making and market positioning.""",
                "user_prompt": """Conduct competitive intelligence analysis for:

**Market/Indication:** {market}

**Therapeutic Area:** {therapeutic_area}

**Competitive Set:** {competitors}

**Analysis Scope:** {scope}

**Strategic Question:** {strategic_question}

**Time Horizon:** {time_horizon}

Provide:
1. Competitive landscape overview and key players
2. Pipeline analysis and threat assessment
3. Market dynamics and growth drivers
4. Competitive positioning and differentiation
5. Scenario analysis and strategic implications
6. Opportunity identification and recommendations
7. Risk assessment and mitigation strategies
8. Strategic planning recommendations

Ensure analysis provides actionable insights for strategic planning and market positioning."""
            }
        }

        # Create prompt entries
        for prompt_key, prompt_data in default_prompts.items():
            await self._create_prompt_entry(prompt_key, prompt_data)

        logger.info(f"Created {len(default_prompts)} default PRISM prompts")

    async def _create_prompt_entry(self, prompt_id: str, prompt_data: Dict[str, Any]):
        """Create a complete prompt library entry"""

        # Generate metadata
        metadata = PromptMetadata(
            prompt_id=prompt_id,
            name=prompt_data["name"],
            display_name=prompt_data["name"],
            description=prompt_data.get("description", ""),
            category="prism_framework",
            subcategory=prompt_data["prism_suite"].lower(),
            prompt_type=PromptType.TEMPLATE_PROMPT,
            status=PromptStatus.ACTIVE,
            prism_suite=prompt_data["prism_suite"],
            domain=prompt_data["domain"],
            therapeutic_areas=prompt_data.get("therapeutic_areas", []),
            language="english",
            difficulty_level=prompt_data.get("difficulty_level", 7),
            estimated_tokens=len(prompt_data.get("system_prompt", "").split()) +
                           len(prompt_data.get("user_prompt", "").split()),
            max_tokens=prompt_data.get("max_tokens", 4000),
            temperature_recommendation=prompt_data.get("temperature", 0.3),
            tags=prompt_data.get("tags", []),
            dependencies=prompt_data.get("dependencies", []),
            created_at=datetime.now(),
            updated_at=datetime.now(),
            version_info=PromptVersion(
                version_id=f"{prompt_id}_v1.0",
                version_number="1.0",
                created_at=datetime.now(),
                created_by="system",
                change_description="Initial creation",
                parent_version=None,
                performance_metrics={},
                is_active=True,
                rollback_safe=True
            ),
            usage_analytics={}
        )

        # Generate content
        content = PromptContent(
            system_prompt=prompt_data.get("system_prompt", ""),
            user_prompt=prompt_data.get("user_prompt", ""),
            context_template=prompt_data.get("context_template", ""),
            example_inputs=prompt_data.get("example_inputs", []),
            example_outputs=prompt_data.get("example_outputs", []),
            validation_criteria=prompt_data.get("validation_criteria", []),
            optimization_notes=prompt_data.get("optimization_notes", ""),
            performance_benchmarks=prompt_data.get("performance_benchmarks", {})
        )

        # Generate template
        template = await self._extract_template_from_content(content, prompt_id)

        # Create library entry
        library_entry = PromptLibraryEntry(
            metadata=metadata,
            content=content,
            template=template,
            versions=[metadata.version_info],
            analytics={}
        )

        self.prompts[prompt_id] = library_entry

    async def _extract_template_from_content(
        self,
        content: PromptContent,
        prompt_id: str
    ) -> PromptTemplate:
        """Extract template structure from prompt content"""

        # Find variables in curly braces
        variable_pattern = r'\{(\w+)\}'

        system_variables = re.findall(variable_pattern, content.system_prompt)
        user_variables = re.findall(variable_pattern, content.user_prompt)

        all_variables = list(set(system_variables + user_variables))

        # Common required variables
        required_vars = ["query", "context"]
        optional_vars = [var for var in all_variables if var not in required_vars]

        template = PromptTemplate(
            template_id=f"{prompt_id}_template",
            name=f"{prompt_id} Template",
            description=f"Template for {prompt_id}",
            template_text=content.user_prompt,
            variables=all_variables,
            required_variables=required_vars,
            optional_variables=optional_vars,
            validation_rules={
                "min_length": {"query": 10, "context": 5},
                "max_length": {"query": 1000, "context": 2000}
            },
            example_values={
                "query": "Sample query text",
                "context": "Sample context information"
            },
            usage_context=["clinical_research", "regulatory_affairs"]
        )

        self.templates[template.template_id] = template
        return template

    # Core Prompt Management Methods

    async def get_prompt(
        self,
        prompt_id: str,
        version: Optional[str] = None
    ) -> Optional[PromptLibraryEntry]:
        """Retrieve a prompt by ID and optional version"""

        if prompt_id not in self.prompts:
            return None

        entry = self.prompts[prompt_id]

        if version:
            # Find specific version
            for v in entry.versions:
                if v.version_number == version and v.is_active:
                    # Create temporary entry with specific version
                    versioned_entry = PromptLibraryEntry(
                        metadata=entry.metadata,
                        content=entry.content,
                        template=entry.template,
                        versions=[v],
                        analytics=entry.analytics
                    )
                    return versioned_entry
            return None

        return entry

    async def search_prompts(
        self,
        query: str,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[PromptLibraryEntry]:
        """Search prompts using text query and filters"""

        results = []
        query_lower = query.lower()

        for prompt_id, entry in self.prompts.items():
            score = 0.0

            # Text matching
            if query_lower in entry.metadata.name.lower():
                score += 1.0
            if query_lower in entry.metadata.description.lower():
                score += 0.8
            if any(query_lower in tag.lower() for tag in entry.metadata.tags):
                score += 0.6
            if query_lower in entry.content.system_prompt.lower():
                score += 0.4
            if query_lower in entry.content.user_prompt.lower():
                score += 0.4

            # Apply filters
            if filters:
                if "prism_suite" in filters and entry.metadata.prism_suite != filters["prism_suite"]:
                    continue
                if "domain" in filters and entry.metadata.domain != filters["domain"]:
                    continue
                if "status" in filters and entry.metadata.status != filters["status"]:
                    continue
                if "therapeutic_areas" in filters:
                    if not any(area in entry.metadata.therapeutic_areas
                             for area in filters["therapeutic_areas"]):
                        continue

            if score > 0:
                results.append((entry, score))

        # Sort by relevance score
        results.sort(key=lambda x: x[1], reverse=True)
        return [entry for entry, _ in results]

    async def create_prompt(
        self,
        prompt_data: Dict[str, Any],
        created_by: str = "user"
    ) -> str:
        """Create a new prompt in the library"""

        prompt_id = prompt_data.get("prompt_id") or self._generate_prompt_id(prompt_data["name"])

        if prompt_id in self.prompts:
            raise ValueError(f"Prompt {prompt_id} already exists")

        await self._create_prompt_entry(prompt_id, {**prompt_data, "created_by": created_by})
        await self._save_prompt_to_file(prompt_id)

        logger.info(f"Created new prompt: {prompt_id}")
        return prompt_id

    async def update_prompt(
        self,
        prompt_id: str,
        updates: Dict[str, Any],
        updated_by: str = "user",
        create_version: bool = True
    ) -> str:
        """Update an existing prompt"""

        if prompt_id not in self.prompts:
            raise ValueError(f"Prompt {prompt_id} not found")

        entry = self.prompts[prompt_id]

        if create_version:
            # Create new version
            new_version_number = self._get_next_version_number(entry.versions)
            new_version = PromptVersion(
                version_id=f"{prompt_id}_v{new_version_number}",
                version_number=new_version_number,
                created_at=datetime.now(),
                created_by=updated_by,
                change_description=updates.get("change_description", "Updated prompt"),
                parent_version=entry.metadata.version_info.version_id,
                performance_metrics={},
                is_active=True,
                rollback_safe=True
            )

            # Deactivate current version
            entry.metadata.version_info.is_active = False
            entry.versions.append(new_version)
            entry.metadata.version_info = new_version

        # Apply updates
        if "system_prompt" in updates:
            entry.content.system_prompt = updates["system_prompt"]
        if "user_prompt" in updates:
            entry.content.user_prompt = updates["user_prompt"]
        if "description" in updates:
            entry.metadata.description = updates["description"]
        if "tags" in updates:
            entry.metadata.tags = updates["tags"]

        entry.metadata.updated_at = datetime.now()

        await self._save_prompt_to_file(prompt_id)

        logger.info(f"Updated prompt: {prompt_id} (version {entry.metadata.version_info.version_number})")
        return entry.metadata.version_info.version_id

    async def compile_prompt(
        self,
        prompt_id: str,
        variables: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, str]:
        """Compile a prompt template with provided variables"""

        entry = await self.get_prompt(prompt_id)
        if not entry:
            raise ValueError(f"Prompt {prompt_id} not found")

        # Validate required variables
        template = entry.template
        missing_vars = [var for var in template.required_variables if var not in variables]
        if missing_vars:
            raise ValueError(f"Missing required variables: {missing_vars}")

        # Compile system prompt
        compiled_system = entry.content.system_prompt
        for var, value in variables.items():
            compiled_system = compiled_system.replace(f"{{{var}}}", str(value))

        # Compile user prompt
        compiled_user = entry.content.user_prompt
        for var, value in variables.items():
            compiled_user = compiled_user.replace(f"{{{var}}}", str(value))

        # Record usage
        await self._record_prompt_usage(prompt_id, variables, context)

        return {
            "system_prompt": compiled_system,
            "user_prompt": compiled_user,
            "metadata": {
                "prompt_id": prompt_id,
                "version": entry.metadata.version_info.version_number,
                "compiled_at": datetime.now().isoformat(),
                "estimated_tokens": entry.metadata.estimated_tokens,
                "temperature_recommendation": entry.metadata.temperature_recommendation
            }
        }

    async def optimize_prompt(
        self,
        prompt_id: str,
        optimization_strategy: OptimizationStrategy,
        performance_data: Dict[str, float],
        context: Optional[Dict[str, Any]] = None
    ) -> PromptOptimizationResult:
        """Optimize a prompt based on performance data"""

        entry = await self.get_prompt(prompt_id)
        if not entry:
            raise ValueError(f"Prompt {prompt_id} not found")

        # Analyze current performance
        current_performance = entry.metadata.version_info.performance_metrics

        # Generate optimization recommendations
        recommendations = await self._generate_optimization_recommendations(
            entry, performance_data, optimization_strategy
        )

        # Create optimized version if significant improvement possible
        improvement_threshold = 0.1  # 10% improvement
        potential_improvement = recommendations.get("potential_improvement", 0.0)

        if potential_improvement > improvement_threshold:
            optimized_prompt_id = await self._create_optimized_version(
                prompt_id, recommendations, optimization_strategy
            )
        else:
            optimized_prompt_id = prompt_id

        result = PromptOptimizationResult(
            original_prompt_id=prompt_id,
            optimized_prompt_id=optimized_prompt_id,
            optimization_strategy=optimization_strategy,
            improvements=recommendations.get("improvements", {}),
            confidence_score=recommendations.get("confidence", 0.5),
            recommendations=recommendations.get("action_items", []),
            a_b_test_plan=recommendations.get("a_b_test_plan"),
            rollout_strategy=recommendations.get("rollout_strategy", "gradual")
        )

        self.optimization_history.append(result)
        return result

    # Advanced Features

    async def create_a_b_test(
        self,
        prompt_a_id: str,
        prompt_b_id: str,
        test_config: Dict[str, Any]
    ) -> str:
        """Create an A/B test between two prompts"""

        test_id = f"ab_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        experiment = {
            "test_id": test_id,
            "prompt_a": prompt_a_id,
            "prompt_b": prompt_b_id,
            "config": test_config,
            "status": "active",
            "created_at": datetime.now().isoformat(),
            "results": {
                "prompt_a": {"uses": 0, "performance": {}},
                "prompt_b": {"uses": 0, "performance": {}}
            },
            "traffic_split": test_config.get("traffic_split", 0.5),
            "success_metrics": test_config.get("success_metrics", ["accuracy", "response_time"]),
            "min_sample_size": test_config.get("min_sample_size", 100)
        }

        self.active_experiments[test_id] = experiment

        logger.info(f"Created A/B test: {test_id}")
        return test_id

    async def get_optimal_prompt_for_context(
        self,
        context: Dict[str, Any],
        prism_suite: Optional[str] = None,
        domain: Optional[str] = None
    ) -> Optional[str]:
        """Get the optimal prompt for a given context"""

        # Filter prompts by criteria
        candidates = []

        for prompt_id, entry in self.prompts.items():
            if entry.metadata.status != PromptStatus.ACTIVE:
                continue

            if prism_suite and entry.metadata.prism_suite != prism_suite:
                continue

            if domain and entry.metadata.domain != domain:
                continue

            # Calculate context match score
            score = await self._calculate_context_match_score(entry, context)
            candidates.append((prompt_id, score))

        if not candidates:
            return None

        # Sort by score and return best match
        candidates.sort(key=lambda x: x[1], reverse=True)
        return candidates[0][0]

    async def get_library_analytics(self) -> Dict[str, Any]:
        """Get comprehensive library analytics"""

        total_prompts = len(self.prompts)

        # Status distribution
        status_dist = {}
        for entry in self.prompts.values():
            status = entry.metadata.status.value
            status_dist[status] = status_dist.get(status, 0) + 1

        # PRISM suite distribution
        suite_dist = {}
        for entry in self.prompts.values():
            suite = entry.metadata.prism_suite
            suite_dist[suite] = suite_dist.get(suite, 0) + 1

        # Domain distribution
        domain_dist = {}
        for entry in self.prompts.values():
            domain = entry.metadata.domain
            domain_dist[domain] = domain_dist.get(domain, 0) + 1

        # Version statistics
        total_versions = sum(len(entry.versions) for entry in self.prompts.values())
        avg_versions = total_versions / total_prompts if total_prompts > 0 else 0

        # Performance statistics
        performance_metrics = await self._calculate_aggregate_performance()

        return {
            "library_size": total_prompts,
            "total_versions": total_versions,
            "average_versions_per_prompt": round(avg_versions, 2),
            "status_distribution": status_dist,
            "prism_suite_distribution": suite_dist,
            "domain_distribution": domain_dist,
            "active_experiments": len(self.active_experiments),
            "optimization_history": len(self.optimization_history),
            "performance_metrics": performance_metrics,
            "last_updated": max(
                (entry.metadata.updated_at for entry in self.prompts.values()),
                default=datetime.now()
            ).isoformat()
        }

    # Helper Methods

    def _generate_prompt_id(self, name: str) -> str:
        """Generate a unique prompt ID from name"""
        base_id = re.sub(r'[^a-zA-Z0-9_]', '_', name.lower())
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        return f"{base_id}_{timestamp}"

    def _get_next_version_number(self, versions: List[PromptVersion]) -> str:
        """Get the next version number"""
        if not versions:
            return "1.0"

        latest_version = max(versions, key=lambda v: v.created_at)
        major, minor = map(int, latest_version.version_number.split('.'))
        return f"{major}.{minor + 1}"

    async def _record_prompt_usage(
        self,
        prompt_id: str,
        variables: Dict[str, Any],
        context: Optional[Dict[str, Any]]
    ):
        """Record prompt usage for analytics"""

        if prompt_id in self.prompts:
            entry = self.prompts[prompt_id]

            if "usage_count" not in entry.analytics:
                entry.analytics["usage_count"] = 0
            entry.analytics["usage_count"] += 1

            if "last_used" not in entry.analytics:
                entry.analytics["last_used"] = datetime.now().isoformat()
            entry.analytics["last_used"] = datetime.now().isoformat()

    async def _calculate_context_match_score(
        self,
        entry: PromptLibraryEntry,
        context: Dict[str, Any]
    ) -> float:
        """Calculate how well a prompt matches the given context"""

        score = 0.0

        # Domain match
        if context.get("domain") == entry.metadata.domain:
            score += 0.3

        # Therapeutic area match
        context_areas = context.get("therapeutic_areas", [])
        entry_areas = entry.metadata.therapeutic_areas
        if context_areas and entry_areas:
            overlap = len(set(context_areas) & set(entry_areas))
            score += (overlap / len(context_areas)) * 0.2

        # Complexity match
        context_complexity = context.get("complexity", 0.5)
        prompt_difficulty = entry.metadata.difficulty_level / 10.0
        complexity_diff = abs(context_complexity - prompt_difficulty)
        score += (1.0 - complexity_diff) * 0.2

        # Performance bonus
        performance = entry.metadata.version_info.performance_metrics
        if performance:
            avg_performance = sum(performance.values()) / len(performance)
            score += avg_performance * 0.3

        return min(score, 1.0)

    async def _generate_optimization_recommendations(
        self,
        entry: PromptLibraryEntry,
        performance_data: Dict[str, float],
        strategy: OptimizationStrategy
    ) -> Dict[str, Any]:
        """Generate optimization recommendations based on strategy"""

        recommendations = {
            "improvements": {},
            "action_items": [],
            "confidence": 0.5,
            "potential_improvement": 0.0,
            "rollout_strategy": "gradual"
        }

        current_performance = entry.metadata.version_info.performance_metrics

        # Analyze performance gaps
        for metric, current_value in current_performance.items():
            target_value = performance_data.get(metric, current_value)
            if target_value > current_value:
                improvement = (target_value - current_value) / current_value
                recommendations["improvements"][metric] = improvement

        # Strategy-specific recommendations
        if strategy == OptimizationStrategy.PERFORMANCE_BASED:
            recommendations["action_items"].extend([
                "Optimize prompt length for better token efficiency",
                "Improve clarity and specificity of instructions",
                "Add more detailed examples and context"
            ])

        elif strategy == OptimizationStrategy.A_B_TESTING:
            recommendations["a_b_test_plan"] = {
                "variations": ["original", "optimized"],
                "metrics": ["accuracy", "response_time", "user_satisfaction"],
                "sample_size": 200,
                "confidence_level": 0.95
            }

        # Calculate overall potential improvement
        if recommendations["improvements"]:
            recommendations["potential_improvement"] = (
                sum(recommendations["improvements"].values()) /
                len(recommendations["improvements"])
            )

        return recommendations

    async def _create_optimized_version(
        self,
        original_prompt_id: str,
        recommendations: Dict[str, Any],
        strategy: OptimizationStrategy
    ) -> str:
        """Create an optimized version of a prompt"""

        # This would implement actual optimization logic
        # For now, return the original prompt ID
        return original_prompt_id

    async def _calculate_aggregate_performance(self) -> Dict[str, float]:
        """Calculate aggregate performance metrics across the library"""

        all_metrics = {}

        for entry in self.prompts.values():
            metrics = entry.metadata.version_info.performance_metrics
            for metric, value in metrics.items():
                if metric not in all_metrics:
                    all_metrics[metric] = []
                all_metrics[metric].append(value)

        # Calculate averages
        return {
            metric: sum(values) / len(values)
            for metric, values in all_metrics.items()
            if values
        }

    async def _save_prompt_to_file(self, prompt_id: str):
        """Save prompt to file system"""

        if prompt_id not in self.prompts:
            return

        entry = self.prompts[prompt_id]
        file_path = self.library_path / "prism_suites" / f"{prompt_id}.json"

        # Convert to dict for JSON serialization
        entry_dict = {
            "metadata": asdict(entry.metadata),
            "content": asdict(entry.content),
            "template": asdict(entry.template),
            "versions": [asdict(v) for v in entry.versions],
            "analytics": entry.analytics
        }

        # Handle datetime serialization
        def json_serial(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            raise TypeError(f"Type {type(obj)} not serializable")

        with open(file_path, 'w') as f:
            json.dump(entry_dict, f, indent=2, default=json_serial)

    async def _load_existing_library(self):
        """Load existing library from files"""

        library_files = list((self.library_path / "prism_suites").glob("*.json"))

        for file_path in library_files:
            try:
                with open(file_path, 'r') as f:
                    entry_dict = json.load(f)

                # Reconstruct objects (simplified for example)
                prompt_id = entry_dict["metadata"]["prompt_id"]
                # Full reconstruction would be implemented here

            except Exception as e:
                logger.warning(f"Failed to load prompt from {file_path}: {e}")

# Factory function
def create_prompt_library_manager(library_path: Optional[str] = None) -> PromptLibraryManager:
    """Create and return a configured PromptLibraryManager"""
    return PromptLibraryManager(library_path)

# Example usage
if __name__ == "__main__":
    async def test_prompt_library():
        """Test the prompt library functionality"""

        manager = create_prompt_library_manager()

        # Wait for initialization
        await asyncio.sleep(1)

        # Test search
        print("Testing prompt search...")
        results = await manager.search_prompts("regulatory guidance", {"prism_suite": "RULES"})
        print(f"Found {len(results)} RULES prompts")

        # Test compilation
        if results:
            prompt_id = results[0].metadata.prompt_id
            compiled = await manager.compile_prompt(
                prompt_id,
                {
                    "query": "What are FDA requirements for digital therapeutics?",
                    "context": "Medical device regulatory pathway",
                    "therapeutic_area": "Digital Health",
                    "regulatory_authority": "FDA"
                }
            )
            print(f"Compiled prompt length: {len(compiled['user_prompt'])} characters")

        # Test analytics
        analytics = await manager.get_library_analytics()
        print(f"Library analytics: {analytics}")

    # Run test
    asyncio.run(test_prompt_library())