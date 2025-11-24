"""
Constitutional AI Pattern

Implements Constitutional AI for self-critique and harmlessness alignment.

Paper: "Constitutional AI: Harmlessness from AI Feedback" (Bai et al., 2022)

Algorithm:
1. Generate initial response
2. Critique response against constitution (set of principles)
3. Revise response based on critique
4. Repeat if needed
5. Return aligned response

Constitution:
A set of principles/rules that guide the AI's behavior, such as:
- Be helpful, harmless, and honest
- Avoid harmful or unethical content
- Respect privacy and confidentiality
- Acknowledge uncertainty
- Follow medical/legal regulations

Use cases:
- Safety-critical applications (medical, legal)
- Content moderation
- Ethical AI alignment
- Regulatory compliance
"""

from typing import List, Dict, Any, Optional
from uuid import UUID
from dataclasses import dataclass
from enum import Enum
import openai

from ...graphrag.utils.logger import get_logger

logger = get_logger(__name__)


class CritiqueSeverity(str, Enum):
    """Severity of constitutional violation"""
    NONE = "none"           # No violations
    LOW = "low"             # Minor issues
    MEDIUM = "medium"       # Notable concerns
    HIGH = "high"           # Serious violations
    CRITICAL = "critical"   # Critical safety issues


@dataclass
class ConstitutionalPrinciple:
    """A single principle in the constitution"""
    id: str
    title: str
    description: str
    category: str  # e.g., "safety", "privacy", "accuracy", "ethics"
    is_required: bool = True  # If False, treated as guideline


@dataclass
class CritiqueResult:
    """Result of constitutional critique"""
    principle_id: str
    principle_title: str
    passes: bool
    severity: CritiqueSeverity
    issue_description: Optional[str] = None
    suggested_revision: Optional[str] = None


@dataclass
class ConstitutionalReview:
    """Complete constitutional review of a response"""
    original_response: str
    critiques: List[CritiqueResult]
    overall_passes: bool
    max_severity: CritiqueSeverity
    revised_response: Optional[str] = None
    revision_count: int = 0
    
    def get_failing_principles(self) -> List[CritiqueResult]:
        """Get all failing critiques"""
        return [c for c in self.critiques if not c.passes]
        
    def get_summary(self) -> str:
        """Get human-readable summary"""
        failing = self.get_failing_principles()
        if not failing:
            return "✅ All constitutional principles satisfied"
            
        issues = "\n".join([
            f"- [{c.severity.value}] {c.principle_title}: {c.issue_description}"
            for c in failing
        ])
        return f"⚠️ {len(failing)} constitutional issues found:\n{issues}"


class ConstitutionalAgent:
    """
    Implements Constitutional AI pattern for self-critique and alignment.
    
    This agent:
    1. Generates initial response
    2. Critiques against constitution
    3. Revises based on critique
    4. Iterates until aligned or max iterations
    """
    
    def __init__(
        self,
        agent_id: UUID,
        model: str = "gpt-4",
        constitution: List[ConstitutionalPrinciple] = None,
        critique_mode: str = "iterative",  # "iterative" or "single"
        max_revisions: int = 3,
        temperature: float = 0.3  # Lower temp for critique
    ):
        """
        Initialize Constitutional AI agent.
        
        Args:
            agent_id: Agent UUID
            model: LLM model to use
            constitution: List of principles to enforce
            critique_mode: "iterative" (revise multiple times) or "single" (one pass)
            max_revisions: Maximum revision iterations
            temperature: LLM temperature
        """
        self.agent_id = agent_id
        self.model = model
        self.constitution = constitution or self._default_constitution()
        self.critique_mode = critique_mode
        self.max_revisions = max_revisions
        self.temperature = temperature
        
        # Initialize OpenAI client
        from ...graphrag.config import get_embedding_config
        config = get_embedding_config()
        self.openai_client = openai.AsyncOpenAI(api_key=config.openai_api_key)
        
    async def critique(
        self,
        output: str,
        context: str = "",
        criteria: List[str] = None
    ) -> ConstitutionalReview:
        """
        Critique output against constitution.
        
        Args:
            output: Text to critique
            context: Context for evaluation
            criteria: Additional criteria beyond constitution
            
        Returns:
            ConstitutionalReview with critiques and revisions
        """
        logger.info(f"Constitutional critique started for agent {self.agent_id}")
        
        # Initialize review
        review = ConstitutionalReview(
            original_response=output,
            critiques=[],
            overall_passes=True,
            max_severity=CritiqueSeverity.NONE
        )
        
        current_output = output
        
        for iteration in range(self.max_revisions + 1):
            # Critique current output
            critiques = await self._critique_against_constitution(
                current_output,
                context,
                criteria
            )
            
            # Update review
            review.critiques = critiques
            review.overall_passes = all([c.passes for c in critiques])
            review.max_severity = self._get_max_severity(critiques)
            
            # If passes or single-pass mode, done
            if review.overall_passes or self.critique_mode == "single":
                if iteration > 0:
                    review.revised_response = current_output
                    review.revision_count = iteration
                break
                
            # Otherwise, revise
            if iteration < self.max_revisions:
                current_output = await self._revise_output(
                    current_output,
                    critiques,
                    context
                )
            else:
                # Max revisions reached
                review.revised_response = current_output
                review.revision_count = iteration
                logger.warning(
                    f"Constitutional alignment did not converge after {self.max_revisions} revisions"
                )
                
        logger.info(
            f"Constitutional critique completed: "
            f"passes={review.overall_passes}, severity={review.max_severity.value}, "
            f"revisions={review.revision_count}"
        )
        
        return review
        
    async def _critique_against_constitution(
        self,
        output: str,
        context: str,
        additional_criteria: List[str] = None
    ) -> List[CritiqueResult]:
        """Critique output against each constitutional principle"""
        critiques = []
        
        for principle in self.constitution:
            critique = await self._critique_principle(
                output,
                context,
                principle,
                additional_criteria
            )
            critiques.append(critique)
            
        return critiques
        
    async def _critique_principle(
        self,
        output: str,
        context: str,
        principle: ConstitutionalPrinciple,
        additional_criteria: List[str] = None
    ) -> CritiqueResult:
        """Critique output against a single principle"""
        criteria_text = ""
        if additional_criteria:
            criteria_text = "\nAdditional criteria:\n" + "\n".join(
                [f"- {c}" for c in additional_criteria]
            )
            
        prompt = f"""
Evaluate the following AI response against this constitutional principle:

Principle: {principle.title}
Description: {principle.description}
Category: {principle.category}
Required: {principle.is_required}
{criteria_text}

Context: {context}

AI Response:
{output}

Evaluate whether this response adheres to the principle. Provide:
1. "PASS" or "FAIL"
2. Severity: "none", "low", "medium", "high", or "critical"
3. Issue description (if any)
4. Suggested revision (if needed)

Format your response as JSON:
{{
  "passes": true/false,
  "severity": "none|low|medium|high|critical",
  "issue": "description of issue or null",
  "revision": "suggested revision or null"
}}
"""
        
        try:
            response = await self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at evaluating AI responses for constitutional alignment."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                response_format={"type": "json_object"}
            )
            
            result_json = json.loads(response.choices[0].message.content)
            
            return CritiqueResult(
                principle_id=principle.id,
                principle_title=principle.title,
                passes=result_json.get("passes", True),
                severity=CritiqueSeverity(result_json.get("severity", "none")),
                issue_description=result_json.get("issue"),
                suggested_revision=result_json.get("revision")
            )
            
        except Exception as e:
            logger.error(f"Error critiquing principle {principle.id}: {e}")
            # Default to passing on error to avoid false blocks
            return CritiqueResult(
                principle_id=principle.id,
                principle_title=principle.title,
                passes=True,
                severity=CritiqueSeverity.NONE
            )
            
    async def _revise_output(
        self,
        output: str,
        critiques: List[CritiqueResult],
        context: str
    ) -> str:
        """Revise output based on critiques"""
        failing_critiques = [c for c in critiques if not c.passes]
        
        if not failing_critiques:
            return output
            
        # Build revision prompt
        issues_text = "\n".join([
            f"- {c.principle_title}: {c.issue_description}"
            for c in failing_critiques
        ])
        
        suggestions_text = "\n".join([
            f"- {c.principle_title}: {c.suggested_revision}"
            for c in failing_critiques
            if c.suggested_revision
        ])
        
        prompt = f"""
The following AI response has constitutional alignment issues:

Original Response:
{output}

Context: {context}

Issues identified:
{issues_text}

Suggested revisions:
{suggestions_text}

Please revise the response to address all issues while maintaining helpfulness and accuracy.

Provide ONLY the revised response, no explanations.
"""
        
        try:
            response = await self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at revising AI responses for constitutional alignment."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error revising output: {e}")
            return output  # Return original on error
            
    def _get_max_severity(self, critiques: List[CritiqueResult]) -> CritiqueSeverity:
        """Get maximum severity from critiques"""
        severity_order = [
            CritiqueSeverity.NONE,
            CritiqueSeverity.LOW,
            CritiqueSeverity.MEDIUM,
            CritiqueSeverity.HIGH,
            CritiqueSeverity.CRITICAL
        ]
        
        max_severity = CritiqueSeverity.NONE
        for critique in critiques:
            if severity_order.index(critique.severity) > severity_order.index(max_severity):
                max_severity = critique.severity
                
        return max_severity
        
    def _default_constitution(self) -> List[ConstitutionalPrinciple]:
        """Default constitution for medical AI"""
        return [
            ConstitutionalPrinciple(
                id="medical_accuracy",
                title="Medical Accuracy",
                description="Information must be medically accurate and evidence-based. Cite sources when possible.",
                category="accuracy",
                is_required=True
            ),
            ConstitutionalPrinciple(
                id="safety_first",
                title="Patient Safety",
                description="Never provide advice that could harm patients. Always recommend consulting healthcare professionals for medical decisions.",
                category="safety",
                is_required=True
            ),
            ConstitutionalPrinciple(
                id="privacy",
                title="Privacy & Confidentiality",
                description="Respect patient privacy. Never request or disclose personal health information inappropriately.",
                category="privacy",
                is_required=True
            ),
            ConstitutionalPrinciple(
                id="acknowledge_limits",
                title="Acknowledge Limitations",
                description="Acknowledge when information is uncertain or outside scope. Don't overstate confidence.",
                category="honesty",
                is_required=True
            ),
            ConstitutionalPrinciple(
                id="regulatory_compliance",
                title="Regulatory Compliance",
                description="Adhere to medical regulations and guidelines (FDA, EMA, etc.). Note off-label uses.",
                category="compliance",
                is_required=True
            ),
            ConstitutionalPrinciple(
                id="no_diagnosis",
                title="No Remote Diagnosis",
                description="Do not diagnose conditions remotely. Explain that diagnosis requires professional evaluation.",
                category="safety",
                is_required=True
            ),
            ConstitutionalPrinciple(
                id="cultural_sensitivity",
                title="Cultural Sensitivity",
                description="Be respectful of diverse cultural backgrounds and healthcare beliefs.",
                category="ethics",
                is_required=False  # Guideline
            ),
            ConstitutionalPrinciple(
                id="clarity",
                title="Clear Communication",
                description="Use clear, accessible language. Explain medical terms when used.",
                category="helpfulness",
                is_required=False  # Guideline
            )
        ]
        
    def add_principle(self, principle: ConstitutionalPrinciple) -> None:
        """Add a principle to the constitution"""
        self.constitution.append(principle)
        logger.info(f"Principle '{principle.title}' added to constitution")
        
    def remove_principle(self, principle_id: str) -> None:
        """Remove a principle from the constitution"""
        self.constitution = [p for p in self.constitution if p.id != principle_id]
        logger.info(f"Principle '{principle_id}' removed from constitution")

