"""
VITAL Path AI Services - VITAL L4 Communication Workers

Communication Workers: Scientific Writer, Presentation Builder,
Plain Language Summarizer, Translation Validator, Audience Adapter
5 workers for scientific communication and content adaptation tasks.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: CommunicationL4Worker
- Factory: create_communication_worker(worker_key)
"""

from typing import Dict, Any, List
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory
import structlog

logger = structlog.get_logger()


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
COMMUNICATION_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "scientific_writer": WorkerConfig(
        id="L4-SCW",
        name="Scientific Writer",
        description="Draft scientific documents and manuscripts",
        category=WorkerCategory.COMMUNICATION,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "pubmed", "cochrane", "clinicaltrials"
        ],
        task_types=[
            "draft_abstract", "draft_introduction", "draft_methods",
            "draft_results", "draft_discussion", "draft_conclusion",
            "draft_csr_section", "draft_regulatory_summary"
        ],
    ),

    "presentation_builder": WorkerConfig(
        id="L4-PRZ",
        name="Presentation Builder",
        description="Build scientific presentations and slide content",
        category=WorkerCategory.COMMUNICATION,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "pubmed", "clinicaltrials"
        ],
        task_types=[
            "create_slide_outline", "draft_slide_content",
            "create_speaker_notes", "design_data_visualization",
            "create_executive_summary", "create_poster_content"
        ],
    ),

    "plain_language_summarizer": WorkerConfig(
        id="L4-PLS",
        name="Plain Language Summarizer",
        description="Create plain language summaries for patients and public",
        category=WorkerCategory.COMMUNICATION,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "pubmed"
        ],
        task_types=[
            "lay_summary", "patient_information", "consent_language",
            "readability_assessment", "simplify_text", "create_faq"
        ],
    ),

    "translation_validator": WorkerConfig(
        id="L4-TRV",
        name="Translation Validator",
        description="Validate scientific and medical translations",
        category=WorkerCategory.COMMUNICATION,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "umls", "meddra"
        ],
        task_types=[
            "validate_medical_terms", "check_consistency",
            "back_translation_review", "cultural_adaptation",
            "terminology_alignment", "pro_linguistic_validation"
        ],
    ),

    "audience_adapter": WorkerConfig(
        id="L4-AUD",
        name="Audience Adapter",
        description="Adapt content for different audiences",
        category=WorkerCategory.COMMUNICATION,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "pubmed"
        ],
        task_types=[
            "adapt_for_hcp", "adapt_for_patient", "adapt_for_payer",
            "adapt_for_regulator", "adapt_for_investor",
            "tone_adjustment", "technical_level_adjustment"
        ],
    ),
}


class CommunicationL4Worker(L4BaseWorker):
    """L4 Worker class for communication tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in COMMUNICATION_WORKER_CONFIGS:
            raise ValueError(f"Unknown communication worker: {worker_key}")
        
        config = COMMUNICATION_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        """Route to appropriate task handler."""
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_draft_abstract(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Draft a structured abstract."""
        study_type = params.get("study_type", "RCT")
        background = params.get("background", "")
        methods = params.get("methods", "")
        results = params.get("results", "")
        conclusion = params.get("conclusion", "")
        word_limit = params.get("word_limit", 300)
        
        # Structure based on IMRAD
        abstract_sections = {
            "background": background or "[Background to be added]",
            "methods": methods or "[Methods to be added]",
            "results": results or "[Results to be added]",
            "conclusions": conclusion or "[Conclusions to be added]",
        }
        
        # Calculate current word count
        total_words = sum(len(s.split()) for s in abstract_sections.values())
        
        return {
            "study_type": study_type,
            "structured_abstract": abstract_sections,
            "word_count": total_words,
            "word_limit": word_limit,
            "within_limit": total_words <= word_limit,
            "sections_complete": all(
                "[" not in v for v in abstract_sections.values()
            ),
        }
    
    async def _task_lay_summary(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create plain language summary."""
        scientific_text = params.get("text", "")
        target_reading_level = params.get("reading_level", "8th_grade")
        include_sections = params.get("sections", ["purpose", "methods", "findings", "meaning"])
        
        # Reading level guidelines
        reading_guidelines = {
            "6th_grade": {
                "max_sentence_length": 12,
                "max_syllables_per_word": 2,
                "avoid": ["technical terms", "abbreviations", "complex numbers"],
            },
            "8th_grade": {
                "max_sentence_length": 15,
                "max_syllables_per_word": 3,
                "avoid": ["jargon", "unexplained abbreviations"],
            },
            "high_school": {
                "max_sentence_length": 20,
                "max_syllables_per_word": 3,
                "avoid": ["highly technical terms without definition"],
            },
        }
        
        guidelines = reading_guidelines.get(target_reading_level, reading_guidelines["8th_grade"])
        
        # Template structure
        lay_structure = {}
        if "purpose" in include_sections:
            lay_structure["why_was_this_study_done"] = "[Explain the problem being studied in simple terms]"
        if "methods" in include_sections:
            lay_structure["what_did_researchers_do"] = "[Explain how the study was done]"
        if "findings" in include_sections:
            lay_structure["what_did_they_find"] = "[Main findings in plain language]"
        if "meaning" in include_sections:
            lay_structure["what_does_this_mean"] = "[Why these findings matter to patients]"
        
        return {
            "target_reading_level": target_reading_level,
            "guidelines": guidelines,
            "lay_summary_template": lay_structure,
            "original_text_length": len(scientific_text.split()),
            "tips": [
                "Use short sentences",
                "Define medical terms when first used",
                "Use analogies for complex concepts",
                "Avoid abbreviations unless explained",
                "Focus on what matters to patients",
            ],
        }
    
    async def _task_readability_assessment(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Assess readability of text."""
        text = params.get("text", "")
        
        if not text:
            return {"error": "No text provided"}
        
        # Simple readability metrics
        sentences = text.replace("!", ".").replace("?", ".").split(".")
        sentences = [s.strip() for s in sentences if s.strip()]
        words = text.split()
        
        avg_sentence_length = len(words) / len(sentences) if sentences else 0
        
        # Estimate syllables (simplified)
        def count_syllables(word):
            vowels = "aeiouAEIOU"
            count = 0
            prev_vowel = False
            for char in word:
                is_vowel = char in vowels
                if is_vowel and not prev_vowel:
                    count += 1
                prev_vowel = is_vowel
            return max(1, count)
        
        total_syllables = sum(count_syllables(w) for w in words)
        avg_syllables = total_syllables / len(words) if words else 0
        
        # Flesch Reading Ease approximation
        flesch_score = 206.835 - (1.015 * avg_sentence_length) - (84.6 * (total_syllables / len(words))) if words else 0
        
        # Interpretation
        if flesch_score >= 90:
            level = "Very Easy (5th grade)"
        elif flesch_score >= 80:
            level = "Easy (6th grade)"
        elif flesch_score >= 70:
            level = "Fairly Easy (7th grade)"
        elif flesch_score >= 60:
            level = "Standard (8th-9th grade)"
        elif flesch_score >= 50:
            level = "Fairly Difficult (10th-12th grade)"
        elif flesch_score >= 30:
            level = "Difficult (College)"
        else:
            level = "Very Difficult (Professional)"
        
        return {
            "word_count": len(words),
            "sentence_count": len(sentences),
            "avg_sentence_length": round(avg_sentence_length, 1),
            "avg_syllables_per_word": round(avg_syllables, 2),
            "flesch_reading_ease": round(flesch_score, 1),
            "reading_level": level,
            "recommendations": self._get_readability_recommendations(flesch_score, avg_sentence_length),
        }
    
    def _get_readability_recommendations(self, flesch_score: float, avg_sentence_length: float) -> List[str]:
        """Generate readability improvement recommendations."""
        recommendations = []
        
        if flesch_score < 60:
            recommendations.append("Consider simplifying vocabulary")
        if avg_sentence_length > 20:
            recommendations.append("Break long sentences into shorter ones")
        if flesch_score < 50:
            recommendations.append("Use more common words instead of technical terms")
            recommendations.append("Add definitions for necessary technical terms")
        
        if not recommendations:
            recommendations.append("Readability is appropriate for general audience")
        
        return recommendations
    
    async def _task_adapt_for_hcp(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Adapt content for healthcare professionals."""
        content = params.get("content", "")
        specialty = params.get("specialty", "general")
        format_type = params.get("format", "summary")
        
        adaptation_guidelines = {
            "tone": "Professional, evidence-based",
            "technical_level": "High - use standard medical terminology",
            "include": [
                "Mechanism of action",
                "Clinical trial data with confidence intervals",
                "Safety profile with specific AE rates",
                "Dosing and administration details",
                "Drug interactions",
                "Place in therapy",
            ],
            "avoid": [
                "Oversimplification of data",
                "Promotional language",
                "Claims beyond approved indications",
            ],
            "reference_style": "Peer-reviewed citations required",
        }
        
        return {
            "target_audience": f"Healthcare Professionals ({specialty})",
            "format": format_type,
            "adaptation_guidelines": adaptation_guidelines,
            "original_content_length": len(content.split()),
            "key_elements_to_include": adaptation_guidelines["include"],
        }
    
    async def _task_adapt_for_patient(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Adapt content for patients."""
        content = params.get("content", "")
        condition = params.get("condition", "")
        
        adaptation_guidelines = {
            "tone": "Empathetic, supportive, encouraging",
            "technical_level": "Low - 6th-8th grade reading level",
            "include": [
                "What the treatment does (simple explanation)",
                "How to take/use it",
                "What to expect",
                "Possible side effects (common ones)",
                "When to contact doctor",
                "Where to get more information",
            ],
            "avoid": [
                "Medical jargon without explanation",
                "Statistics without context",
                "Alarming language about rare side effects",
                "Assumptions about medical knowledge",
            ],
            "format_tips": [
                "Use bullet points",
                "Include pictures/diagrams where helpful",
                "Provide glossary for necessary medical terms",
            ],
        }
        
        return {
            "target_audience": "Patients",
            "condition": condition,
            "adaptation_guidelines": adaptation_guidelines,
            "original_content_length": len(content.split()),
            "recommended_sections": adaptation_guidelines["include"],
        }
    
    async def _task_create_slide_outline(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create presentation slide outline."""
        topic = params.get("topic", "")
        duration_minutes = params.get("duration", 20)
        audience = params.get("audience", "scientific")
        
        # Calculate slides based on duration (2-3 min per slide)
        num_slides = max(5, duration_minutes // 2)
        
        # Standard scientific presentation structure
        outline = [
            {"slide": 1, "title": "Title Slide", "content": ["Title", "Authors", "Affiliations", "Disclosures"]},
            {"slide": 2, "title": "Background/Introduction", "content": ["Disease burden", "Unmet need", "Rationale"]},
            {"slide": 3, "title": "Objectives", "content": ["Primary objective", "Secondary objectives"]},
            {"slide": 4, "title": "Study Design", "content": ["Design schematic", "Key eligibility", "Endpoints"]},
            {"slide": 5, "title": "Patient Disposition", "content": ["CONSORT diagram", "Baseline characteristics"]},
        ]
        
        # Add results slides
        results_slides = (num_slides - 8)  # Reserve slides for intro and conclusions
        for i in range(max(1, results_slides)):
            outline.append({
                "slide": 6 + i,
                "title": f"Results ({i+1})" if results_slides > 1 else "Results",
                "content": ["Primary endpoint", "Key secondary endpoints", "Subgroup analyses"] if i == 0 else ["Additional data"],
            })
        
        # Add closing slides
        outline.extend([
            {"slide": num_slides - 2, "title": "Safety Summary", "content": ["AE overview", "SAEs", "Discontinuations"]},
            {"slide": num_slides - 1, "title": "Conclusions", "content": ["Key takeaways", "Clinical implications"]},
            {"slide": num_slides, "title": "Acknowledgments", "content": ["Study team", "Patients", "Funding"]},
        ])
        
        return {
            "topic": topic,
            "duration_minutes": duration_minutes,
            "audience": audience,
            "total_slides": num_slides,
            "minutes_per_slide": round(duration_minutes / num_slides, 1),
            "outline": outline,
        }
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task handler."""
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_communication_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> CommunicationL4Worker:
    return CommunicationL4Worker(worker_key, l5_tools)

COMMUNICATION_WORKER_KEYS = list(COMMUNICATION_WORKER_CONFIGS.keys())
