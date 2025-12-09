"""
Panel Router - Routes questions to appropriate panel configurations.

This module determines which experts should be included in a panel
based on the question topic, required expertise, and available agents.
"""

from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class PanelType(str, Enum):
    """Types of panel discussions."""
    DEBATE = "debate"  # Opposing viewpoints
    ROUNDTABLE = "roundtable"  # Collaborative discussion
    INTERVIEW = "interview"  # Q&A format
    BRAINSTORM = "brainstorm"  # Idea generation
    ADVISORY = "advisory"  # Expert recommendations


@dataclass
class PanelTemplate:
    """Template for a panel configuration."""
    name: str
    panel_type: PanelType
    min_members: int
    max_members: int
    required_expertise: List[str]
    optional_expertise: List[str]
    description: str


# Default panel templates
DEFAULT_TEMPLATES: Dict[str, PanelTemplate] = {
    "clinical_trial": PanelTemplate(
        name="Clinical Trial Advisory Panel",
        panel_type=PanelType.ADVISORY,
        min_members=3,
        max_members=5,
        required_expertise=["clinical_research", "regulatory_affairs"],
        optional_expertise=["biostatistics", "medical_writing", "pharmacology"],
        description="Expert panel for clinical trial design and execution",
    ),
    "regulatory_strategy": PanelTemplate(
        name="Regulatory Strategy Panel",
        panel_type=PanelType.ROUNDTABLE,
        min_members=3,
        max_members=4,
        required_expertise=["regulatory_affairs", "quality_assurance"],
        optional_expertise=["legal", "medical_affairs"],
        description="Panel for regulatory submission strategies",
    ),
    "medical_affairs": PanelTemplate(
        name="Medical Affairs Review Panel",
        panel_type=PanelType.DEBATE,
        min_members=3,
        max_members=5,
        required_expertise=["medical_affairs", "clinical_research"],
        optional_expertise=["pharmacovigilance", "health_economics"],
        description="Panel for medical affairs strategy and MSL activities",
    ),
    "market_access": PanelTemplate(
        name="Market Access Strategy Panel",
        panel_type=PanelType.ADVISORY,
        min_members=3,
        max_members=5,
        required_expertise=["health_economics", "market_access"],
        optional_expertise=["pricing", "payer_relations", "regulatory_affairs"],
        description="Panel for market access and reimbursement strategies",
    ),
    "general_pharma": PanelTemplate(
        name="Pharmaceutical Expert Panel",
        panel_type=PanelType.ROUNDTABLE,
        min_members=3,
        max_members=6,
        required_expertise=["pharmaceutical"],
        optional_expertise=["clinical_research", "regulatory_affairs", "commercial"],
        description="General pharmaceutical industry expert panel",
    ),
}


class PanelRouter:
    """
    Routes questions to appropriate panel configurations.
    
    Analyzes the question and context to determine:
    - Which panel template to use
    - Which experts to include
    - How to configure the discussion
    """
    
    def __init__(
        self,
        templates: Optional[Dict[str, PanelTemplate]] = None,
    ):
        self.templates = templates or DEFAULT_TEMPLATES
        self._expertise_keywords = self._build_expertise_keywords()
    
    def _build_expertise_keywords(self) -> Dict[str, List[str]]:
        """Build keyword mapping for expertise detection."""
        return {
            "clinical_research": [
                "clinical trial", "phase 1", "phase 2", "phase 3", "phase 4",
                "protocol", "endpoint", "efficacy", "safety", "enrollment",
                "randomization", "blinding", "placebo", "control group",
            ],
            "regulatory_affairs": [
                "fda", "ema", "submission", "approval", "ind", "nda", "bla",
                "regulatory", "compliance", "dossier", "ctd", "briefing",
            ],
            "medical_affairs": [
                "msl", "kol", "medical education", "medical information",
                "publications", "congress", "advisory board", "peer review",
            ],
            "health_economics": [
                "heor", "cost-effectiveness", "qaly", "icer", "budget impact",
                "health technology assessment", "hta", "value dossier",
            ],
            "market_access": [
                "reimbursement", "payer", "formulary", "coverage", "pricing",
                "market access", "national accounts", "managed care",
            ],
            "pharmacovigilance": [
                "adverse event", "safety signal", "risk management", "rems",
                "pharmacovigilance", "post-marketing", "surveillance",
            ],
            "biostatistics": [
                "statistics", "analysis", "sample size", "power calculation",
                "interim analysis", "futility", "efficacy boundary",
            ],
            "quality_assurance": [
                "gcp", "gmp", "quality", "audit", "inspection", "deviation",
                "capa", "sop", "validation",
            ],
        }
    
    def route(
        self,
        question: str,
        context: Optional[Dict[str, Any]] = None,
        available_agents: Optional[List[Dict[str, Any]]] = None,
    ) -> Tuple[PanelTemplate, List[str]]:
        """
        Route a question to the appropriate panel configuration.
        
        Args:
            question: The question to route
            context: Optional context (user preferences, history)
            available_agents: Optional list of available agent definitions
            
        Returns:
            Tuple of (panel template, list of recommended expertise areas)
        """
        # Detect required expertise from question
        detected_expertise = self._detect_expertise(question)
        
        # Find best matching template
        best_template = self._find_best_template(detected_expertise)
        
        # Determine recommended expertise
        recommended = self._recommend_expertise(
            best_template, detected_expertise, available_agents
        )
        
        logger.info(
            f"Routed question to template '{best_template.name}' "
            f"with expertise: {recommended}"
        )
        
        return best_template, recommended
    
    def _detect_expertise(self, question: str) -> Dict[str, float]:
        """Detect expertise areas mentioned in the question."""
        question_lower = question.lower()
        scores: Dict[str, float] = {}
        
        for expertise, keywords in self._expertise_keywords.items():
            score = 0.0
            for keyword in keywords:
                if keyword in question_lower:
                    score += 1.0
            if score > 0:
                scores[expertise] = score / len(keywords)
        
        return scores
    
    def _find_best_template(
        self,
        detected_expertise: Dict[str, float],
    ) -> PanelTemplate:
        """Find the best matching panel template."""
        best_score = -1
        best_template = self.templates.get("general_pharma")
        
        for name, template in self.templates.items():
            score = 0
            
            # Score based on required expertise match
            for req in template.required_expertise:
                if req in detected_expertise:
                    score += detected_expertise[req] * 2
            
            # Score based on optional expertise match
            for opt in template.optional_expertise:
                if opt in detected_expertise:
                    score += detected_expertise[opt]
            
            if score > best_score:
                best_score = score
                best_template = template
        
        return best_template
    
    def _recommend_expertise(
        self,
        template: PanelTemplate,
        detected: Dict[str, float],
        available_agents: Optional[List[Dict[str, Any]]],
    ) -> List[str]:
        """Recommend expertise areas for the panel."""
        recommended = list(template.required_expertise)
        
        # Add optional expertise if detected in question
        for opt in template.optional_expertise:
            if opt in detected and len(recommended) < template.max_members:
                recommended.append(opt)
        
        # If we have available agents, prioritize matching ones
        if available_agents:
            available_expertise = set()
            for agent in available_agents:
                available_expertise.update(agent.get("expertise", []))
            
            # Filter to only available expertise
            recommended = [e for e in recommended if e in available_expertise]
        
        return recommended[:template.max_members]
    
    def get_template(self, template_name: str) -> Optional[PanelTemplate]:
        """Get a specific panel template by name."""
        return self.templates.get(template_name)
    
    def list_templates(self) -> List[Dict[str, Any]]:
        """List all available panel templates."""
        return [
            {
                "name": template.name,
                "type": template.panel_type.value,
                "description": template.description,
                "required_expertise": template.required_expertise,
            }
            for template in self.templates.values()
        ]
    
    def register_template(
        self,
        key: str,
        template: PanelTemplate,
    ) -> None:
        """Register a new panel template."""
        self.templates[key] = template
        logger.info(f"Registered new panel template: {template.name}")


