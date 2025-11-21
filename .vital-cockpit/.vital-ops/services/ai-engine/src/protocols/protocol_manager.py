"""
Protocol Manager - Integrates PHARMA & VERIFY with Template Registry
================================================================================
Orchestrates protocol validation, compliance checking, and template-based
document generation for pharmaceutical AI workflows.
"""

from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timezone
from dataclasses import dataclass, field
from enum import Enum
import structlog
import json

from .pharma_protocol import PHARMAProtocol, PHARMAValidationResult
from .verify_protocol import VERIFYProtocol, VERIFYValidationResult

logger = structlog.get_logger()


class ProtocolViolation(Exception):
    """Exception raised when protocol compliance fails"""
    pass


class DocumentType(Enum):
    """Pharmaceutical document types"""
    VALUE_DOSSIER = "value_dossier"
    REGULATORY_SUBMISSION = "regulatory_submission"
    CLINICAL_STUDY_REPORT = "clinical_study_report"
    PROTOCOL = "protocol"
    INVESTIGATOR_BROCHURE = "investigator_brochure"
    CLINICAL_OVERVIEW = "clinical_overview"
    SUMMARY_OF_CLINICAL_EFFICACY = "summary_clinical_efficacy"
    SUMMARY_OF_CLINICAL_SAFETY = "summary_clinical_safety"
    RISK_MANAGEMENT_PLAN = "risk_management_plan"
    PERIODIC_SAFETY_UPDATE = "periodic_safety_update"
    HEALTH_ECONOMICS_DOSSIER = "health_economics_dossier"
    MARKET_ACCESS_SUBMISSION = "market_access_submission"
    PAYER_DOSSIER = "payer_dossier"
    HTA_SUBMISSION = "hta_submission"
    MEDICAL_INFORMATION_RESPONSE = "medical_information_response"
    PUBLICATION_PLAN = "publication_plan"
    CONGRESS_MATERIALS = "congress_materials"


class RegulatoryRegion(Enum):
    """Regulatory regions"""
    FDA_US = "fda_us"
    EMA_EU = "ema_eu"
    PMDA_JAPAN = "pmda_japan"
    NMPA_CHINA = "nmpa_china"
    MHRA_UK = "mhra_uk"
    ANVISA_BRAZIL = "anvisa_brazil"
    TGA_AUSTRALIA = "tga_australia"
    HEALTH_CANADA = "health_canada"
    ICH = "ich"  # International harmonization


@dataclass
class DocumentTemplate:
    """Pharmaceutical document template with PHARMA framework"""
    id: str
    name: str
    document_type: DocumentType
    regulatory_region: Optional[RegulatoryRegion]
    
    # PHARMA Framework
    purpose: str  # P: Clear pharmaceutical business objective
    hypotheses: List[str]  # H: Expected outcomes to validate
    audience: List[str]  # A: Target stakeholders
    requirements: Dict[str, Any]  # R: Regulatory & compliance needs
    metrics: Dict[str, Any]  # M: Success criteria & SOPs
    actions: List[str]  # A: Next steps enabled by output
    
    # Template structure
    sections: List[Dict[str, Any]]
    required_data_fields: List[str]
    optional_data_fields: List[str]
    
    # Compliance
    compliance_protocols: List[str]  # ["PHARMA", "VERIFY", "GxP"]
    review_requirements: Dict[str, Any]
    
    # Metadata
    version: str
    last_updated: datetime
    created_by: str
    tags: List[str]
    
    # Usage instructions
    instructions: str
    examples: List[str]


@dataclass
class ProtocolExecutionResult:
    """Combined result of protocol execution"""
    pharma_result: Optional[PHARMAValidationResult]
    verify_result: Optional[VERIFYValidationResult]
    overall_compliant: bool
    compliance_score: float
    requires_review: bool
    template_applied: Optional[str]
    recommendations: List[str]
    audit_trail: Dict[str, Any]
    execution_timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class TemplateRegistry:
    """
    Registry of pharmaceutical document templates linked to PHARMA framework
    """
    
    def __init__(self):
        """Initialize template registry"""
        self.logger = structlog.get_logger()
        self.templates: Dict[str, DocumentTemplate] = {}
        self._initialize_templates()
    
    def _initialize_templates(self):
        """Initialize standard pharmaceutical templates"""
        
        # Value Dossier Template
        self.register_template(DocumentTemplate(
            id="value-dossier-v1",
            name="Value Dossier - Global Template",
            document_type=DocumentType.VALUE_DOSSIER,
            regulatory_region=None,  # Global
            
            # PHARMA Framework
            purpose="Create comprehensive value proposition demonstrating clinical, economic, and humanistic outcomes for payers and HTA bodies",
            hypotheses=[
                "Product demonstrates superior clinical outcomes vs standard of care",
                "Economic value justifies premium pricing or reimbursement",
                "Real-world evidence supports clinical trial findings",
                "Budget impact is manageable for health systems"
            ],
            audience=[
                "Payers (national, regional, private)",
                "HTA bodies (NICE, IQWiG, HAS, CADTH)",
                "Medical directors",
                "Pharmacy & therapeutics committees",
                "Health economists"
            ],
            requirements={
                "regulatory": ["Marketing authorization in target region"],
                "data": ["Phase 3 RCT data", "Health economics analysis", "Real-world evidence"],
                "compliance": ["ISPOR guidelines", "Regional HTA requirements"],
                "format": ["Executive summary", "Full dossier", "Slide deck"],
                "review": ["Medical review", "HE review", "Market access review"]
            },
            metrics={
                "sops": [
                    "SOP-MA-001: Value Dossier Development",
                    "SOP-HE-002: Economic Model Validation",
                    "SOP-MA-003: HTA Submission Standards"
                ],
                "success_criteria": {
                    "completeness": ">95% of required sections",
                    "evidence_quality": "High (Level 1-2)",
                    "review_time": "<30 days to approval",
                    "resubmission_rate": "<10%"
                }
            },
            actions=[
                "Submit to payers for formulary review",
                "Present to P&T committees",
                "Support pricing negotiations",
                "Enable market access strategy execution"
            ],
            
            sections=[
                {
                    "id": "exec_summary",
                    "title": "Executive Summary",
                    "required": True,
                    "max_pages": 2,
                    "key_messages": 3
                },
                {
                    "id": "disease_overview",
                    "title": "Disease Overview & Unmet Need",
                    "required": True,
                    "subsections": ["Epidemiology", "Burden of disease", "Current treatment landscape"]
                },
                {
                    "id": "product_profile",
                    "title": "Product Profile",
                    "required": True,
                    "subsections": ["Mechanism of action", "Clinical data", "Safety profile", "Place in therapy"]
                },
                {
                    "id": "clinical_value",
                    "title": "Clinical Value Proposition",
                    "required": True,
                    "subsections": ["Efficacy vs comparators", "Safety advantages", "Quality of life impact"]
                },
                {
                    "id": "economic_value",
                    "title": "Economic Value Proposition",
                    "required": True,
                    "subsections": ["Cost-effectiveness", "Budget impact", "Resource utilization"]
                },
                {
                    "id": "real_world_evidence",
                    "title": "Real-World Evidence",
                    "required": False,
                    "subsections": ["Observational studies", "Registry data", "Patient outcomes"]
                },
                {
                    "id": "patient_perspective",
                    "title": "Patient & Caregiver Perspective",
                    "required": True,
                    "subsections": ["Patient preferences", "Quality of life", "Treatment burden"]
                },
                {
                    "id": "budget_impact",
                    "title": "Budget Impact Analysis",
                    "required": True,
                    "subsections": ["Cost model", "Sensitivity analysis", "Affordability scenarios"]
                },
                {
                    "id": "implementation",
                    "title": "Implementation Considerations",
                    "required": True,
                    "subsections": ["Patient identification", "Monitoring requirements", "Healthcare resource needs"]
                }
            ],
            
            required_data_fields=[
                "product_name",
                "indication",
                "target_population",
                "comparator",
                "primary_endpoint_results",
                "safety_data",
                "pricing_strategy",
                "economic_model_results"
            ],
            
            optional_data_fields=[
                "real_world_data",
                "patient_reported_outcomes",
                "subgroup_analyses",
                "long_term_outcomes"
            ],
            
            compliance_protocols=["PHARMA", "VERIFY", "ISPOR", "AMCP"],
            
            review_requirements={
                "medical_review": {"required": True, "reviewer_qualification": "MD or PharmD"},
                "health_economics_review": {"required": True, "reviewer_qualification": "Health economist"},
                "market_access_review": {"required": True, "reviewer_qualification": "Market access director"},
                "legal_review": {"required": True, "reviewer_qualification": "Regulatory affairs"},
                "turnaround_time": "10 business days per review"
            },
            
            version="1.0",
            last_updated=datetime.now(timezone.utc),
            created_by="VITAL Path System",
            tags=["value_dossier", "market_access", "payer", "hta", "reimbursement"],
            
            instructions="""
            VALUE DOSSIER DEVELOPMENT GUIDE (PHARMA Framework)
            
            PURPOSE: Demonstrate comprehensive product value to secure optimal market access
            
            PROCESS:
            1. Gather all clinical, economic, and real-world data
            2. Conduct stakeholder interviews (payers, HTA, clinicians)
            3. Develop core value messages aligned with audience priorities
            4. Build evidence base with VERIFY protocol validation
            5. Create tailored versions for each payer/HTA body
            6. Conduct internal review cycle (medical → HE → market access → legal)
            7. Pilot test with friendly payers
            8. Finalize and distribute
            
            PHARMA COMPLIANCE CHECKPOINTS:
            - Precision: All clinical data with exact statistics and CIs
            - HIPAA: No patient-level data, only aggregated results
            - Accuracy: Every claim backed by peer-reviewed evidence
            - Regulatory: Align with marketing authorization and label
            - Medical Validation: MD/PharmD sign-off required
            - Audit Trail: Version control and approval chain
            
            VERIFY PROTOCOL REQUIREMENTS:
            - All efficacy claims must cite pivotal trial data
            - Economic model must be validated by external expert
            - Comparative claims require head-to-head data or NMA
            - Confidence levels stated for all projections
            - Gaps identified upfront (e.g., "Long-term RWE pending")
            """,
            
            examples=[
                "Example: Oncology value dossier for NICE appraisal",
                "Example: Rare disease value dossier with burden of illness focus",
                "Example: Biosimilar value dossier emphasizing cost savings"
            ]
        ))
        
        # Regulatory Submission Template
        self.register_template(DocumentTemplate(
            id="regulatory-submission-fda-nda",
            name="FDA NDA Submission - Module 2",
            document_type=DocumentType.REGULATORY_SUBMISSION,
            regulatory_region=RegulatoryRegion.FDA_US,
            
            purpose="Prepare comprehensive FDA NDA submission demonstrating safety and efficacy for market authorization",
            hypotheses=[
                "Product meets substantial evidence standard for efficacy",
                "Safety profile is acceptable for indication",
                "Risk-benefit ratio is favorable",
                "Manufacturing quality is assured"
            ],
            audience=[
                "FDA review team (medical, clinical, statistical, CMC)",
                "CDER leadership",
                "Advisory committee (if required)",
                "Internal regulatory affairs team"
            ],
            requirements={
                "regulatory": ["IND completion", "Pre-NDA meeting", "21 CFR Part 314"],
                "data": ["Phase 1-3 clinical data", "Nonclinical studies", "CMC data", "Labeling"],
                "compliance": ["GCP", "GLP", "GMP", "ICH guidelines"],
                "format": ["eCTD format", "FDA Electronic Submission Gateway"],
                "review": ["Medical review", "Statistical review", "Nonclinical review", "CMC review"]
            },
            metrics={
                "sops": [
                    "SOP-REG-001: NDA Preparation and Submission",
                    "SOP-QA-002: Document Quality Review",
                    "SOP-REG-003: Response to FDA Information Requests"
                ],
                "success_criteria": {
                    "acceptance_for_review": "100%",
                    "complete_response_letter_avoidance": ">80%",
                    "approval_rate": ">85%",
                    "review_time": "Standard 10 months or Priority 6 months"
                }
            },
            actions=[
                "Submit to FDA for review",
                "Respond to information requests",
                "Prepare for advisory committee if needed",
                "Plan post-approval commitments"
            ],
            
            sections=[
                {"id": "m2_2", "title": "Introduction", "required": True},
                {"id": "m2_3", "title": "Quality Overall Summary", "required": True},
                {"id": "m2_4", "title": "Nonclinical Overview", "required": True},
                {"id": "m2_5", "title": "Clinical Overview", "required": True},
                {"id": "m2_6", "title": "Nonclinical Written and Tabulated Summaries", "required": True},
                {"id": "m2_7", "title": "Clinical Summary", "required": True}
            ],
            
            required_data_fields=[
                "drug_substance",
                "drug_product",
                "manufacturing_process",
                "control_methods",
                "stability_data",
                "pharmacology_studies",
                "toxicology_studies",
                "phase_1_data",
                "phase_2_data",
                "phase_3_data",
                "integrated_safety_summary",
                "integrated_efficacy_summary",
                "proposed_labeling"
            ],
            
            optional_data_fields=[
                "pediatric_data",
                "special_populations",
                "pharmacogenomics",
                "abuse_potential"
            ],
            
            compliance_protocols=["PHARMA", "VERIFY", "GCP", "21CFR11"],
            
            review_requirements={
                "medical_review": {"required": True, "reviewer_qualification": "MD with regulatory experience"},
                "statistical_review": {"required": True, "reviewer_qualification": "PhD Biostatistician"},
                "regulatory_review": {"required": True, "reviewer_qualification": "RAC certified"},
                "quality_assurance": {"required": True, "reviewer_qualification": "QA specialist"},
                "turnaround_time": "60 business days for complete review cycle"
            },
            
            version="1.0",
            last_updated=datetime.now(timezone.utc),
            created_by="VITAL Path System",
            tags=["regulatory", "fda", "nda", "submission", "ectd"],
            
            instructions="""
            FDA NDA SUBMISSION GUIDE (PHARMA Framework)
            
            PURPOSE: Secure FDA marketing authorization through rigorous demonstration of safety and efficacy
            
            eCTD REQUIREMENTS:
            - Module 1: Regional administrative info
            - Module 2: Common Technical Document summaries (THIS TEMPLATE)
            - Module 3: Quality (CMC)
            - Module 4: Nonclinical study reports
            - Module 5: Clinical study reports
            
            PHARMA COMPLIANCE:
            - Precision: All study results reported per ICH E3
            - HIPAA: Patient data de-identified per HIPAA Safe Harbor
            - Accuracy: All data traceable to source, audit trail complete
            - Regulatory: Full compliance with 21 CFR 314 and ICH M4
            - Medical Validation: Independent medical monitor review
            - Audit Trail: 21 CFR Part 11 electronic records compliance
            
            VERIFY PROTOCOL:
            - Every efficacy claim must cite specific study, timepoint, analysis population
            - Safety data must include all SAEs, deaths, discontinuations
            - Statistical analyses pre-specified in protocol/SAP
            - Confidence intervals and p-values reported for all comparisons
            - Any post-hoc analyses clearly labeled
            - Limitations acknowledged (e.g., open-label design, missing data)
            """,
            
            examples=[
                "Example: NDA for novel small molecule in oncology (accelerated approval pathway)",
                "Example: NDA for biologic with orphan designation",
                "Example: 505(b)(2) application with bridge to listed drug"
            ]
        ))
        
        # Clinical Study Report
        self.register_template(DocumentTemplate(
            id="clinical-study-report-ich-e3",
            name="Clinical Study Report (ICH E3)",
            document_type=DocumentType.CLINICAL_STUDY_REPORT,
            regulatory_region=RegulatoryRegion.ICH,
            
            purpose="Document complete clinical study design, conduct, results, and interpretation per ICH E3 guidelines",
            hypotheses=[
                "Study met primary endpoint(s)",
                "Safety profile is acceptable",
                "Results support regulatory submission"
            ],
            audience=[
                "Regulatory authorities (FDA, EMA, etc.)",
                "Internal medical/clinical teams",
                "Regulatory affairs",
                "Medical writers"
            ],
            requirements={
                "regulatory": ["ICH E3 compliance", "GCP compliance"],
                "data": ["All study data", "Statistical analysis", "Safety data", "Protocol"],
                "compliance": ["ICH-GCP", "Declaration of Helsinki"],
                "format": ["ICH E3 format", "Word/PDF"],
                "review": ["Medical review", "Statistical review", "Data management review"]
            },
            metrics={
                "sops": [
                    "SOP-CL-001: Clinical Study Report Preparation",
                    "SOP-DM-002: Data Lock and Analysis",
                    "SOP-QC-003: CSR Quality Control"
                ],
                "success_criteria": {
                    "ich_e3_compliance": "100%",
                    "data_consistency": "100% match to datasets",
                    "completion_time": "<90 days from database lock"
                }
            },
            actions=[
                "Include in regulatory submission modules",
                "Support labeling discussions",
                "Enable publications",
                "Archive per regulatory requirements"
            ],
            
            sections=[
                {"id": "title_page", "title": "Title Page", "required": True},
                {"id": "synopsis", "title": "Synopsis", "required": True, "max_pages": 5},
                {"id": "toc", "title": "Table of Contents", "required": True},
                {"id": "ethics", "title": "Ethics", "required": True},
                {"id": "investigators", "title": "Investigators and Study Administrative Structure", "required": True},
                {"id": "introduction", "title": "Introduction", "required": True},
                {"id": "objectives", "title": "Study Objectives", "required": True},
                {"id": "design", "title": "Study Design", "required": True},
                {"id": "population", "title": "Study Population", "required": True},
                {"id": "treatments", "title": "Treatments", "required": True},
                {"id": "efficacy", "title": "Efficacy Evaluation", "required": True},
                {"id": "safety", "title": "Safety Evaluation", "required": True},
                {"id": "statistics", "title": "Statistical Methods", "required": True},
                {"id": "results", "title": "Results and Analysis", "required": True},
                {"id": "discussion", "title": "Discussion and Conclusions", "required": True},
                {"id": "appendices", "title": "Appendices", "required": True}
            ],
            
            required_data_fields=[
                "protocol_number",
                "study_title",
                "indication",
                "phase",
                "primary_objective",
                "primary_endpoint",
                "sample_size",
                "study_duration",
                "treatment_arms",
                "demographics",
                "efficacy_results",
                "safety_results",
                "statistical_methods",
                "conclusions"
            ],
            
            optional_data_fields=[
                "pharmacokinetics",
                "biomarker_data",
                "quality_of_life",
                "health_economics"
            ],
            
            compliance_protocols=["PHARMA", "VERIFY", "GCP", "ICH"],
            
            review_requirements={
                "medical_review": {"required": True, "reviewer_qualification": "MD, clinical trial experience"},
                "statistical_review": {"required": True, "reviewer_qualification": "PhD Biostatistician"},
                "data_management_review": {"required": True, "reviewer_qualification": "Data manager"},
                "quality_control": {"required": True, "reviewer_qualification": "Medical writer with QC training"},
                "turnaround_time": "30 business days for full review cycle"
            },
            
            version="1.0",
            last_updated=datetime.now(timezone.utc),
            created_by="VITAL Path System",
            tags=["clinical", "csr", "ich_e3", "study_report", "gcp"],
            
            instructions="""
            CLINICAL STUDY REPORT GUIDE (ICH E3 / PHARMA Framework)
            
            PURPOSE: Create comprehensive, regulatory-grade documentation of clinical trial
            
            STRUCTURE (per ICH E3):
            - Synopsis: Concise summary (3-5 pages) covering all key elements
            - Main body: Detailed presentation per E3 sections
            - Appendices: Protocol, SAP, sample CRFs, listings, etc.
            
            PHARMA COMPLIANCE:
            - Precision: All data reported with exact values, no rounding
            - HIPAA: All patient data de-identified, coded by subject ID
            - Accuracy: 100% traceability to source data and datasets
            - Regulatory: Full ICH E3 and GCP compliance
            - Medical Validation: Independent medical reviewer sign-off
            - Audit Trail: Complete version control and approval documentation
            
            VERIFY PROTOCOL CRITICAL POINTS:
            - Primary endpoint analysis must match pre-specified SAP exactly
            - All protocol deviations documented and assessed for impact
            - Missing data handled per pre-specified methods
            - Sensitivity analyses performed if >10% missing primary endpoint data
            - Safety narratives required for all deaths, SAEs, and discontinuations
            - Confidence intervals reported for all key efficacy analyses
            - Multiplicity adjustments applied per protocol
            - Any post-hoc analyses clearly labeled and interpreted cautiously
            """,
            
            examples=[
                "Example: Phase 3 RCT CSR for NDA submission",
                "Example: Phase 2 dose-finding study CSR",
                "Example: Pediatric efficacy and safety study CSR"
            ]
        ))
        
        self.logger.info(
            "Template registry initialized",
            template_count=len(self.templates)
        )
    
    def register_template(self, template: DocumentTemplate):
        """Register a new template"""
        self.templates[template.id] = template
        self.logger.info(f"Registered template: {template.name} ({template.id})")
    
    def get_template(self, template_id: str) -> Optional[DocumentTemplate]:
        """Retrieve template by ID"""
        return self.templates.get(template_id)
    
    def search_templates(
        self,
        document_type: Optional[DocumentType] = None,
        regulatory_region: Optional[RegulatoryRegion] = None,
        tags: Optional[List[str]] = None
    ) -> List[DocumentTemplate]:
        """Search templates by criteria"""
        results = list(self.templates.values())
        
        if document_type:
            results = [t for t in results if t.document_type == document_type]
        
        if regulatory_region:
            results = [t for t in results if t.regulatory_region == regulatory_region]
        
        if tags:
            results = [t for t in results if any(tag in t.tags for tag in tags)]
        
        return results
    
    def list_all_templates(self) -> Dict[str, str]:
        """List all available templates"""
        return {
            tid: template.name
            for tid, template in self.templates.items()
        }


class ProtocolManager:
    """
    Manages PHARMA and VERIFY protocol validation with template integration
    """
    
    def __init__(
        self,
        enable_pharma: bool = True,
        enable_verify: bool = True,
        strict_mode: bool = False
    ):
        """
        Initialize Protocol Manager
        
        Args:
            enable_pharma: Enable PHARMA protocol validation
            enable_verify: Enable VERIFY protocol validation
            strict_mode: Block on any violations
        """
        self.logger = structlog.get_logger()
        self.enable_pharma = enable_pharma
        self.enable_verify = enable_verify
        self.strict_mode = strict_mode
        
        self.pharma_protocol = PHARMAProtocol(strict_mode=strict_mode) if enable_pharma else None
        self.verify_protocol = VERIFYProtocol(strict_mode=strict_mode) if enable_verify else None
        self.template_registry = TemplateRegistry()
        
        self.logger.info(
            "Protocol Manager initialized",
            pharma_enabled=enable_pharma,
            verify_enabled=enable_verify,
            strict_mode=strict_mode,
            templates_available=len(self.template_registry.templates)
        )
    
    def validate_response(
        self,
        response: str,
        context: Dict[str, Any],
        agent_type: Optional[str] = None,
        template_id: Optional[str] = None
    ) -> ProtocolExecutionResult:
        """
        Validate AI response against enabled protocols
        
        Args:
            response: AI-generated response
            context: Request and response context
            agent_type: Type of agent for specialized checks
            template_id: Optional template to apply
            
        Returns:
            ProtocolExecutionResult with combined validation
        """
        pharma_result = None
        verify_result = None
        recommendations = []
        
        # Apply template if specified
        template = None
        if template_id:
            template = self.template_registry.get_template(template_id)
            if template:
                self.logger.info(f"Applying template: {template.name}")
                context['template'] = template
                recommendations.append(f"Template applied: {template.name}")
        
        # Run PHARMA validation
        if self.enable_pharma and self.pharma_protocol:
            pharma_result = self.pharma_protocol.validate(response, context, agent_type)
            self.logger.info(
                "PHARMA validation complete",
                compliant=pharma_result.is_compliant,
                score=pharma_result.compliance_score
            )
        
        # Run VERIFY validation
        if self.enable_verify and self.verify_protocol:
            verify_result = self.verify_protocol.validate(response, context)
            self.logger.info(
                "VERIFY validation complete",
                verified=verify_result.is_verified,
                score=verify_result.confidence_score
            )
        
        # Calculate overall compliance
        overall_compliant = True
        compliance_scores = []
        
        if pharma_result:
            overall_compliant = overall_compliant and pharma_result.is_compliant
            compliance_scores.append(pharma_result.compliance_score)
        
        if verify_result:
            overall_compliant = overall_compliant and verify_result.is_verified
            compliance_scores.append(verify_result.confidence_score)
        
        compliance_score = sum(compliance_scores) / len(compliance_scores) if compliance_scores else 1.0
        
        # Determine if human review required
        requires_review = False
        if verify_result and verify_result.requires_human_review:
            requires_review = True
            recommendations.append("⚠️  Human expert review required before use")
        
        if pharma_result and pharma_result.compliance_score < 0.8:
            requires_review = True
            recommendations.append("⚠️  PHARMA compliance below 80% - review recommended")
        
        if verify_result and verify_result.confidence_score < 0.7:
            requires_review = True
            recommendations.append("⚠️  VERIFY confidence below 70% - verification needed")
        
        # Generate recommendations
        if pharma_result and pharma_result.violations:
            recommendations.append(f"Address {len(pharma_result.violations)} PHARMA violations")
        
        if verify_result and verify_result.unverified_claims:
            recommendations.append(f"Verify {len(verify_result.unverified_claims)} unverified claims")
        
        if template and template.review_requirements:
            for review_type, requirements in template.review_requirements.items():
                if isinstance(requirements, dict) and requirements.get("required"):
                    recommendations.append(
                        f"Required: {review_type} by {requirements.get('reviewer_qualification', 'qualified reviewer')}"
                    )
        
        # Build audit trail
        audit_trail = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "protocols_enabled": {
                "pharma": self.enable_pharma,
                "verify": self.enable_verify
            },
            "template_applied": template.id if template else None,
            "agent_type": agent_type,
            "compliance_score": compliance_score,
            "requires_review": requires_review,
            "user_id": context.get("user_id"),
            "organization_id": context.get("organization_id"),
            "request_id": context.get("request_id")
        }
        
        return ProtocolExecutionResult(
            pharma_result=pharma_result,
            verify_result=verify_result,
            overall_compliant=overall_compliant,
            compliance_score=compliance_score,
            requires_review=requires_review,
            template_applied=template.id if template else None,
            recommendations=recommendations,
            audit_trail=audit_trail
        )
    
    def generate_comprehensive_report(self, result: ProtocolExecutionResult) -> str:
        """Generate comprehensive protocol validation report"""
        report = []
        report.append("=" * 80)
        report.append("PHARMACEUTICAL AI COMPLIANCE REPORT")
        report.append("=" * 80)
        report.append(f"Timestamp: {result.execution_timestamp.isoformat()}")
        report.append(f"Overall Status: {'✅ COMPLIANT' if result.overall_compliant else '❌ NON-COMPLIANT'}")
        report.append(f"Compliance Score: {result.compliance_score:.2%}")
        report.append(f"Requires Review: {'⚠️  YES' if result.requires_review else '✅ NO'}")
        if result.template_applied:
            report.append(f"Template: {result.template_applied}")
        report.append("")
        
        # PHARMA section
        if result.pharma_result:
            report.append("=" * 80)
            report.append("PHARMA PROTOCOL RESULTS")
            report.append("=" * 80)
            report.append(self.pharma_protocol.generate_compliance_report(result.pharma_result))
        
        # VERIFY section
        if result.verify_result:
            report.append("=" * 80)
            report.append("VERIFY PROTOCOL RESULTS")
            report.append("=" * 80)
            report.append(self.verify_protocol.generate_verification_report(result.verify_result))
        
        # Recommendations
        if result.recommendations:
            report.append("=" * 80)
            report.append("RECOMMENDATIONS")
            report.append("=" * 80)
            for i, rec in enumerate(result.recommendations, 1):
                report.append(f"{i}. {rec}")
            report.append("")
        
        # Audit trail
        report.append("=" * 80)
        report.append("AUDIT TRAIL")
        report.append("=" * 80)
        report.append(json.dumps(result.audit_trail, indent=2))
        report.append("=" * 80)
        
        return "\n".join(report)
    
    def get_template(self, template_id: str) -> Optional[DocumentTemplate]:
        """Get template from registry"""
        return self.template_registry.get_template(template_id)
    
    def search_templates(self, **kwargs) -> List[DocumentTemplate]:
        """Search templates in registry"""
        return self.template_registry.search_templates(**kwargs)
    
    def list_templates(self) -> Dict[str, str]:
        """List all available templates"""
        return self.template_registry.list_all_templates()

