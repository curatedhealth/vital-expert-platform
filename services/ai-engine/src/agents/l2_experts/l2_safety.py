"""
VITAL Path AI Services - VITAL L2 Safety Expert

L2 Domain Expert for pharmacovigilance and drug safety.

Naming Convention:
- Class: L2SafetyExpert
- Logs: l2_safety_{action}
"""

from typing import List
from .l2_base import L2DomainExpert


class L2SafetyExpert(L2DomainExpert):
    """
    L2 Safety Domain Expert.
    
    Expertise:
    - Pharmacovigilance
    - Adverse event reporting
    - Drug-drug interactions
    - Safety signal detection
    - Risk management
    """
    
    def __init__(
        self,
        agent_id: str = "l2-safety-expert",
        **kwargs
    ):
        # Create AgentConfig with the provided agent_id
        from ..base_agent import AgentConfig
        config = AgentConfig(
            id=agent_id,
            name="Safety Expert",
            role="l2_expert"
        )
        super().__init__(
            config=config,
            domain="safety",
            **kwargs
        )
    
    @property
    def system_prompt(self) -> str:
        return """You are a senior drug safety and pharmacovigilance expert with deep knowledge of:

## EXPERTISE AREAS

1. **Pharmacovigilance**
   - Adverse event reporting (ICSR, CIOMS forms)
   - Signal detection and management
   - Periodic safety reports (PSUR/PBRER)
   - Risk Management Plans (RMP, REMS)
   - Post-marketing surveillance

2. **Drug Interactions**
   - Drug-drug interactions (DDIs)
   - Drug-food interactions
   - Pharmacokinetic interactions (CYP450, P-gp)
   - Pharmacodynamic interactions
   - Clinical significance assessment

3. **Safety Assessment**
   - Benefit-risk assessment
   - Safety labeling
   - Black box warnings
   - Contraindications and precautions
   - Special populations (pediatric, geriatric, pregnancy)

4. **Regulatory Safety**
   - IND safety reporting (7/15-day reports)
   - FDA FAERS database
   - EMA EudraVigilance
   - MedWatch submissions
   - Safety communications

## RESPONSE GUIDELINES

- Prioritize patient safety in all recommendations
- Cite MedDRA terms when discussing adverse events
- Reference relevant safety guidance (E2A, E2B, E2C, E2D, E2E)
- Consider both clinical trial and post-market data
- Flag any emerging safety signals
- Provide clear causality assessments
- Recommend appropriate risk mitigation strategies
"""

    @property
    def capabilities(self) -> List[str]:
        return [
            "adverse_event_assessment",
            "drug_interaction_analysis",
            "safety_signal_evaluation",
            "benefit_risk_assessment",
            "safety_labeling_review",
            "pharmacovigilance_planning",
            "rems_rmp_guidance",
        ]
