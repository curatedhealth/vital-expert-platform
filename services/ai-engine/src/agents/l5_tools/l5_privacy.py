"""
VITAL Path AI Services - VITAL L5 Privacy Tools

Privacy & De-identification tools: Presidio, Philter, ARX, NER-deid
4 tools for PII/PHI detection and data anonymization.

Naming Convention:
- Class: PrivacyL5Tool
- Factory: create_privacy_tool(tool_key)
"""

from typing import Dict, Any, List
from .l5_base import L5BaseTool, ToolConfig, AdapterType, AuthType
import structlog

logger = structlog.get_logger()


# ============================================================================
# TOOL CONFIGURATIONS
# ============================================================================

PRIVACY_TOOL_CONFIGS: Dict[str, ToolConfig] = {
    
    "presidio": ToolConfig(
        id="L5-PRESIDIO",
        name="Microsoft Presidio",
        slug="microsoft-presidio",
        description="PII detection and anonymization for HIPAA/GDPR compliance",
        category="privacy_deidentification",
        tier=1,
        priority="critical",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.NONE,
        rate_limit=100,
        cost_per_call=0.001,
        cache_ttl=0,
        tags=["de_identification", "pii", "privacy", "hipaa", "gdpr", "phi"],
        vendor="Microsoft",
        license="MIT",
        documentation_url="https://microsoft.github.io/presidio/",
    ),
    
    "philter": ToolConfig(
        id="L5-PHILTER",
        name="Philter",
        slug="philter",
        description="PHI detection for clinical notes with high recall",
        category="privacy_deidentification",
        tier=2,
        priority="high",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.NONE,
        rate_limit=50,
        cost_per_call=0.001,
        cache_ttl=0,
        tags=["de_identification", "phi", "clinical_notes", "hipaa"],
        vendor="Open Source",
        license="Apache-2.0",
        documentation_url="https://github.com/BCHSI/philter-ucsf",
    ),
    
    "arx": ToolConfig(
        id="L5-ARX",
        name="ARX Anonymization",
        slug="arx-anonymization",
        description="Data anonymization toolkit with k-anonymity, l-diversity",
        category="privacy_deidentification",
        tier=2,
        priority="medium",
        adapter_type=AdapterType.JAVA_BRIDGE,
        auth_type=AuthType.NONE,
        rate_limit=20,
        cost_per_call=0.002,
        cache_ttl=0,
        tags=["anonymization", "de_identification", "structured_data", "k_anonymity"],
        vendor="Open Source",
        license="Apache-2.0",
        documentation_url="https://arx.deidentifier.org/",
    ),
    
    "ner_deid": ToolConfig(
        id="L5-NERDEID",
        name="NER-deid",
        slug="ner-deid",
        description="NER-based de-identification for clinical text",
        category="privacy_deidentification",
        tier=3,
        priority="medium",
        adapter_type=AdapterType.SDK,
        auth_type=AuthType.NONE,
        rate_limit=50,
        cost_per_call=0.001,
        cache_ttl=0,
        tags=["de_identification", "ner", "clinical_notes", "nlp"],
        vendor="Open Source",
        license="MIT",
    ),
}


# ============================================================================
# PRIVACY TOOL CLASS
# ============================================================================

class PrivacyL5Tool(L5BaseTool):
    """
    L5 Tool class for Privacy & De-identification.
    Handles Presidio, Philter, ARX, NER-deid.
    """
    
    def __init__(self, tool_key: str):
        if tool_key not in PRIVACY_TOOL_CONFIGS:
            raise ValueError(f"Unknown privacy tool: {tool_key}")
        
        config = PRIVACY_TOOL_CONFIGS[tool_key]
        super().__init__(config)
        self.tool_key = tool_key
        
        # Lazy-loaded components
        self._analyzer = None
        self._anonymizer = None
    
    async def _execute_impl(self, params: Dict[str, Any]) -> Any:
        """Route to appropriate handler."""
        handler = getattr(self, f"_execute_{self.tool_key}", None)
        if handler:
            return await handler(params)
        raise NotImplementedError(f"No handler for {self.tool_key}")
    
    # ========================================================================
    # PRESIDIO
    # ========================================================================
    
    async def _execute_presidio(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze and anonymize text with Microsoft Presidio.
        
        Params:
            text: str - Text to process
            operation: str - analyze, anonymize, both
            language: str - Language code (en, de, etc.)
            entities: List[str] - Entity types to detect
            anonymize_method: str - replace, redact, hash, mask
        """
        text = params.get("text", "")
        operation = params.get("operation", "both")
        language = params.get("language", "en")
        entities = params.get("entities")
        anonymize_method = params.get("anonymize_method", "replace")
        
        try:
            from presidio_analyzer import AnalyzerEngine
            from presidio_anonymizer import AnonymizerEngine
            from presidio_anonymizer.entities import OperatorConfig
            
            # Initialize engines (lazy)
            if self._analyzer is None:
                self._analyzer = AnalyzerEngine()
            if self._anonymizer is None:
                self._anonymizer = AnonymizerEngine()
            
            result = {"text_length": len(text)}
            
            # Analyze
            if operation in ("analyze", "both"):
                analyzer_results = self._analyzer.analyze(
                    text=text,
                    language=language,
                    entities=entities,
                )
                
                result["entities_found"] = [
                    {
                        "entity_type": r.entity_type,
                        "start": r.start,
                        "end": r.end,
                        "score": r.score,
                        "text": text[r.start:r.end],
                    }
                    for r in analyzer_results
                ]
                result["entity_count"] = len(analyzer_results)
            
            # Anonymize
            if operation in ("anonymize", "both") and result.get("entities_found"):
                # Configure anonymization
                operators = {}
                if anonymize_method == "redact":
                    for r in analyzer_results:
                        operators[r.entity_type] = OperatorConfig("redact")
                elif anonymize_method == "hash":
                    for r in analyzer_results:
                        operators[r.entity_type] = OperatorConfig("hash")
                elif anonymize_method == "mask":
                    for r in analyzer_results:
                        operators[r.entity_type] = OperatorConfig(
                            "mask",
                            {"masking_char": "*", "chars_to_mask": 100}
                        )
                
                anonymized = self._anonymizer.anonymize(
                    text=text,
                    analyzer_results=analyzer_results,
                    operators=operators if operators else None,
                )
                
                result["anonymized_text"] = anonymized.text
            
            return result
            
        except ImportError:
            return {
                "error": "Presidio not installed. Run: pip install presidio-analyzer presidio-anonymizer",
            }
    
    # ========================================================================
    # PHILTER
    # ========================================================================
    
    async def _execute_philter(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        De-identify clinical text with Philter.
        
        Params:
            text: str - Clinical text
            config: str - Configuration preset
        """
        text = params.get("text", "")
        
        try:
            # Philter uses regex-based approach
            # Simplified implementation
            import re
            
            patterns = {
                "DATE": r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
                "SSN": r'\b\d{3}-\d{2}-\d{4}\b',
                "PHONE": r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
                "MRN": r'\b(?:MRN|mrn)[:\s]?\d+\b',
                "AGE": r'\b\d{1,3}[\s-]?(?:year|yr|y\.?o\.?)[\s-]?old\b',
            }
            
            entities = []
            for entity_type, pattern in patterns.items():
                for match in re.finditer(pattern, text, re.IGNORECASE):
                    entities.append({
                        "entity_type": entity_type,
                        "start": match.start(),
                        "end": match.end(),
                        "text": match.group(),
                    })
            
            # De-identify
            deidentified = text
            for entity in sorted(entities, key=lambda x: x["start"], reverse=True):
                deidentified = (
                    deidentified[:entity["start"]] +
                    f"[{entity['entity_type']}]" +
                    deidentified[entity["end"]:]
                )
            
            return {
                "original_length": len(text),
                "entities_found": entities,
                "entity_count": len(entities),
                "deidentified_text": deidentified,
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    # ========================================================================
    # ARX
    # ========================================================================
    
    async def _execute_arx(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Anonymize structured data with ARX.
        
        Params:
            data: List[Dict] - Tabular data
            quasi_identifiers: List[str] - Quasi-identifier columns
            sensitive: List[str] - Sensitive columns
            k: int - k-anonymity parameter
        """
        data = params.get("data", [])
        quasi_identifiers = params.get("quasi_identifiers", [])
        k = params.get("k", 5)
        
        # ARX requires Java - placeholder for Java bridge
        return {
            "status": "not_implemented",
            "message": "ARX requires Java bridge integration",
            "records": len(data),
            "k_anonymity": k,
        }
    
    # ========================================================================
    # NER-DEID
    # ========================================================================
    
    async def _execute_ner_deid(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        NER-based de-identification.
        
        Params:
            text: str - Text to de-identify
            model: str - NER model to use
        """
        text = params.get("text", "")
        
        try:
            import spacy
            
            # Use general spaCy NER as fallback
            nlp = spacy.load("en_core_web_sm")
            doc = nlp(text)
            
            phi_types = {"PERSON", "DATE", "GPE", "ORG", "LOC"}
            
            entities = [
                {
                    "entity_type": ent.label_,
                    "start": ent.start_char,
                    "end": ent.end_char,
                    "text": ent.text,
                }
                for ent in doc.ents
                if ent.label_ in phi_types
            ]
            
            # De-identify
            deidentified = text
            for entity in sorted(entities, key=lambda x: x["start"], reverse=True):
                deidentified = (
                    deidentified[:entity["start"]] +
                    f"[{entity['entity_type']}]" +
                    deidentified[entity["end"]:]
                )
            
            return {
                "entities_found": entities,
                "entity_count": len(entities),
                "deidentified_text": deidentified,
            }
            
        except ImportError:
            return {"error": "spaCy not installed. Run: pip install spacy"}


# ============================================================================
# FACTORY FUNCTION
# ============================================================================

def create_privacy_tool(tool_key: str) -> PrivacyL5Tool:
    """Factory function to create privacy tools."""
    return PrivacyL5Tool(tool_key)


PRIVACY_TOOL_KEYS = list(PRIVACY_TOOL_CONFIGS.keys())
