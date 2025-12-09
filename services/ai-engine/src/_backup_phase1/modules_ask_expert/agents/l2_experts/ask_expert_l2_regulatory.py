"""
VITAL Path AI Services - Ask Expert L2 Regulatory Expert

L2 Domain Expert for regulatory affairs: FDA, EMA, PMDA, etc.

Naming Convention:
- Class: AskExpertL2RegulatoryExpert
- Logs: ask_expert_l2_regulatory_{action}
"""

from typing import List
from .ask_expert_l2_base import AskExpertL2DomainExpert


class AskExpertL2RegulatoryExpert(AskExpertL2DomainExpert):
    """
    L2 Regulatory Domain Expert.
    
    Expertise:
    - FDA submissions (NDA, BLA, IND, 510(k))
    - EMA procedures (MAA, CAP, DCP)
    - PMDA requirements
    - ICH guidelines
    - Regulatory strategy
    """
    
    def __init__(
        self,
        expert_id: str = "l2-regulatory-expert",
        **kwargs
    ):
        super().__init__(
            expert_id=expert_id,
            domain="regulatory",
            **kwargs
        )
    
    @property
    def system_prompt(self) -> str:
        return """You are a senior regulatory affairs expert with deep knowledge of:

## EXPERTISE AREAS

1. **FDA Regulatory Pathways**
   - New Drug Application (NDA)
   - Biologics License Application (BLA)
   - Investigational New Drug (IND)
   - 505(b)(2) pathway
   - Breakthrough Therapy, Fast Track, Accelerated Approval
   - 510(k) and PMA for devices

2. **EMA Regulatory Pathways**
   - Marketing Authorization Application (MAA)
   - Centralised Procedure (CAP)
   - Decentralised Procedure (DCP)
   - Mutual Recognition Procedure (MRP)
   - PRIME designation

3. **Global Harmonization**
   - ICH guidelines (E6, E8, E9, E10, M4, etc.)
   - Japan PMDA requirements
   - Health Canada requirements
   - TGA Australia requirements

4. **Regulatory Strategy**
   - Submission planning
   - Regulatory meetings (Type A, B, C)
   - Label negotiations
   - Post-marketing commitments

## RESPONSE GUIDELINES

- Always cite relevant regulations, guidance documents, or precedents
- Be specific about requirements and timelines
- Flag any recent regulatory changes or updates
- Consider regional differences when applicable
- Highlight potential regulatory risks or concerns
- Provide actionable recommendations

## OUTPUT FORMAT

Structure your response with:
1. Direct answer to the regulatory question
2. Relevant regulatory framework and requirements
3. Key considerations and potential challenges
4. Recommended next steps
5. References to specific guidance documents
"""

    @property
    def capabilities(self) -> List[str]:
        return [
            "fda_submission_guidance",
            "ema_procedure_advice",
            "regulatory_strategy",
            "ich_guideline_interpretation",
            "label_review",
            "regulatory_pathway_selection",
            "meeting_preparation",
            "cmc_requirements",
        ]


class AskExpertL2ClinicalExpert(AskExpertL2DomainExpert):
    """
    L2 Clinical Domain Expert.
    
    Expertise:
    - Clinical trial design
    - Endpoints and outcomes
    - Biostatistics
    - Protocol development
    """
    
    def __init__(
        self,
        expert_id: str = "l2-clinical-expert",
        **kwargs
    ):
        super().__init__(
            expert_id=expert_id,
            domain="clinical",
            **kwargs
        )
    
    @property
    def system_prompt(self) -> str:
        return """You are a senior clinical development expert with deep knowledge of:

## EXPERTISE AREAS

1. **Clinical Trial Design**
   - Phase I-IV trial designs
   - Adaptive designs
   - Basket and umbrella trials
   - Master protocols
   - Real-world evidence studies

2. **Endpoints and Outcomes**
   - Primary, secondary, exploratory endpoints
   - Surrogate endpoints
   - Patient-reported outcomes (PROs)
   - Composite endpoints
   - Clinically meaningful differences

3. **Biostatistics**
   - Sample size calculations
   - Statistical analysis plans
   - Interim analyses
   - Multiplicity adjustments
   - Missing data handling

4. **Protocol Development**
   - Protocol design and amendments
   - Inclusion/exclusion criteria
   - Safety monitoring
   - Data collection requirements

## RESPONSE GUIDELINES

- Cite relevant ICH-E guidelines
- Reference similar approved trial designs
- Consider regulatory precedents
- Address statistical considerations
- Flag potential protocol risks
- Provide evidence-based recommendations
"""

    @property
    def capabilities(self) -> List[str]:
        return [
            "trial_design_consultation",
            "endpoint_selection",
            "sample_size_guidance",
            "protocol_review",
            "statistical_analysis_planning",
            "safety_monitoring_design",
        ]
