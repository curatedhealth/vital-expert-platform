"""
Named Entity Recognition (NER) Service
Extracts medical entities from text using spaCy or LLM
"""

from typing import List, Optional
import structlog

from ..models import EntityExtractionResult, ExtractedEntity

logger = structlog.get_logger()


class NERService:
    """
    Production-ready NER service
    
    Supports:
    - spaCy biomedical models (scispaCy)
    - OpenAI GPT-4 for entity extraction
    - Fallback to keyword matching
    """
    
    def __init__(self, provider: str = "spacy"):
        """
        Initialize NER service
        
        Args:
            provider: NER provider ("spacy", "openai", "fallback")
        """
        self.provider = provider
        self._nlp = None
        self._openai_client = None
    
    async def initialize(self):
        """Initialize NER model"""
        if self.provider == "spacy":
            await self._initialize_spacy()
        elif self.provider == "openai":
            await self._initialize_openai()
        else:
            logger.info("ner_using_fallback_mode")
    
    async def _initialize_spacy(self):
        """Initialize spaCy model"""
        try:
            import spacy  # type: ignore
            
            # Try to load biomedical model (scispaCy)
            try:
                self._nlp = spacy.load("en_core_sci_md")
                logger.info("spacy_scisci_loaded", model="en_core_sci_md")
            except:
                # Fallback to standard spaCy model
                try:
                    self._nlp = spacy.load("en_core_web_sm")
                    logger.info("spacy_standard_loaded", model="en_core_web_sm")
                except:
                    logger.warning("spacy_model_not_found")
                    
        except ImportError:
            logger.warning("spacy_not_installed")
    
    async def _initialize_openai(self):
        """Initialize OpenAI client"""
        try:
            from openai import AsyncOpenAI
            from ..config import get_graphrag_config
            
            config = get_graphrag_config()
            if config.openai_api_key:
                self._openai_client = AsyncOpenAI(api_key=config.openai_api_key)
                logger.info("openai_ner_initialized")
            else:
                logger.warning("openai_api_key_not_configured")
                
        except ImportError:
            logger.warning("openai_library_not_installed")
    
    async def extract_entities(
        self,
        text: str,
        entity_types: Optional[List[str]] = None
    ) -> EntityExtractionResult:
        """
        Extract entities from text
        
        Args:
            text: Input text
            entity_types: Specific entity types to extract (None = all)
            
        Returns:
            EntityExtractionResult with extracted entities
        """
        if self.provider == "spacy" and self._nlp:
            return await self._extract_with_spacy(text, entity_types)
        elif self.provider == "openai" and self._openai_client:
            return await self._extract_with_openai(text, entity_types)
        else:
            return self._extract_with_fallback(text)
    
    async def _extract_with_spacy(
        self,
        text: str,
        entity_types: Optional[List[str]]
    ) -> EntityExtractionResult:
        """Extract entities using spaCy"""
        try:
            doc = self._nlp(text)
            
            entities = []
            for ent in doc.ents:
                # Filter by entity type if specified
                if entity_types and ent.label_ not in entity_types:
                    continue
                
                entities.append(ExtractedEntity(
                    text=ent.text,
                    entity_type=ent.label_,
                    confidence=0.9,  # spaCy doesn't provide confidence scores by default
                    start_pos=ent.start_char,
                    end_pos=ent.end_char
                ))
            
            logger.info(
                "spacy_ner_complete",
                text_length=len(text),
                entities_count=len(entities)
            )
            
            return EntityExtractionResult(
                query=text,
                entities=entities,
                processed_query=text
            )
            
        except Exception as e:
            logger.error("spacy_ner_failed", error=str(e))
            return self._extract_with_fallback(text)
    
    async def _extract_with_openai(
        self,
        text: str,
        entity_types: Optional[List[str]]
    ) -> EntityExtractionResult:
        """Extract entities using OpenAI GPT-4"""
        try:
            # Build prompt
            entity_types_str = ", ".join(entity_types) if entity_types else "any medical entities"
            
            prompt = f"""Extract {entity_types_str} from the following text. Return a JSON array of entities with text, type, and confidence (0-1).

Text: {text}

Format:
[
  {{"text": "entity name", "type": "Drug", "confidence": 0.95}},
  ...
]"""
            
            response = await self._openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a medical entity extraction assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0,
                response_format={"type": "json_object"}
            )
            
            # Parse response
            import json
            result = json.loads(response.choices[0].message.content)
            
            entities = []
            for item in result.get("entities", []):
                # Find entity position in text
                start_pos = text.lower().find(item["text"].lower())
                
                entities.append(ExtractedEntity(
                    text=item["text"],
                    entity_type=item["type"],
                    confidence=item.get("confidence", 0.9),
                    start_pos=start_pos if start_pos >= 0 else 0,
                    end_pos=start_pos + len(item["text"]) if start_pos >= 0 else len(item["text"])
                ))
            
            logger.info(
                "openai_ner_complete",
                text_length=len(text),
                entities_count=len(entities)
            )
            
            return EntityExtractionResult(
                query=text,
                entities=entities,
                processed_query=text
            )
            
        except Exception as e:
            logger.error("openai_ner_failed", error=str(e))
            return self._extract_with_fallback(text)
    
    def _extract_with_fallback(self, text: str) -> EntityExtractionResult:
        """Fallback: Simple keyword matching"""
        medical_keywords = {
            'diabetes': 'Disease',
            'type 2 diabetes': 'Disease',
            'metformin': 'Drug',
            'insulin': 'Drug',
            'hypertension': 'Disease',
            'cancer': 'Disease',
            'breast cancer': 'Disease',
            'chemotherapy': 'Treatment',
            'radiation': 'Treatment',
            'cardiovascular': 'Disease',
            'aspirin': 'Drug',
            'statin': 'Drug',
            'antibiotic': 'Drug',
            'pneumonia': 'Disease',
            'covid-19': 'Disease',
            'vaccine': 'Drug'
        }
        
        entities = []
        text_lower = text.lower()
        
        # Sort keywords by length (longest first) to catch multi-word entities
        sorted_keywords = sorted(medical_keywords.items(), key=lambda x: len(x[0]), reverse=True)
        
        for keyword, entity_type in sorted_keywords:
            if keyword in text_lower:
                start_pos = text_lower.find(keyword)
                entities.append(ExtractedEntity(
                    text=keyword,
                    entity_type=entity_type,
                    confidence=0.7,  # Lower confidence for keyword matching
                    start_pos=start_pos,
                    end_pos=start_pos + len(keyword)
                ))
        
        logger.info(
            "fallback_ner_complete",
            text_length=len(text),
            entities_count=len(entities),
            note="Using keyword matching fallback"
        )
        
        return EntityExtractionResult(
            query=text,
            entities=entities,
            processed_query=text
        )


# Singleton instance
_ner_service: Optional[NERService] = None


async def get_ner_service(provider: str = "spacy") -> NERService:
    """Get or create NER service singleton"""
    global _ner_service
    
    if _ner_service is None:
        _ner_service = NERService(provider=provider)
        await _ner_service.initialize()
    
    return _ner_service

