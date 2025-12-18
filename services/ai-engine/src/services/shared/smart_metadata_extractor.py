"""
Smart Metadata Extraction Service
Extracts comprehensive metadata from filenames and content using AI and pattern matching

Architecture Pattern (LLM Config):
- Environment variables: UTILITY_LLM_MODEL, UTILITY_LLM_TEMPERATURE, UTILITY_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values
"""

import re
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime
from dateutil import parser as date_parser
import structlog
from openai import OpenAI
from langdetect import detect, LangDetectException
from unidecode import unidecode

from core.config import get_settings
from infrastructure.llm.config_service import get_llm_config_for_level

# Get UTILITY defaults from environment variables (for non-agent services)
_UTILITY_DEFAULTS = get_llm_config_for_level("UTILITY")

# Constants
TITLE_MIN_LENGTH = 10
TITLE_MAX_LENGTH = 200
TITLE_REASONABLE_MIN = 20
TITLE_REASONABLE_MAX = 150
YEAR_MIN = 1900
CONTENT_PREVIEW_LENGTH = 5000
KEYWORD_EXTRACTION_LENGTH = 2000
LANGUAGE_DETECTION_LENGTH = 1000

logger = structlog.get_logger()

class SmartMetadataExtractor:
    """Extracts metadata from filenames and content using pattern matching and AI"""

    def __init__(self, use_ai: bool = False, openai_api_key: Optional[str] = None):
        self.settings = get_settings()
        self.use_ai = use_ai
        self.openai_client = None
        
        if use_ai and (openai_api_key or self.settings.openai_api_key):
            self.openai_client = OpenAI(api_key=openai_api_key or self.settings.openai_api_key)
        
        # Initialize taxonomy patterns
        self._initialize_taxonomy()

    def _initialize_taxonomy(self):
        """Initialize taxonomy patterns for metadata extraction"""
        # Source patterns (regulatory bodies, journals, consultancies, pharma companies)
        self.source_patterns = {
            # Regulatory bodies
            'FDA': re.compile(r'fda|food.*drug.*administration', re.IGNORECASE),
            'EMA': re.compile(r'ema|european.*medicine.*agency', re.IGNORECASE),
            'WHO': re.compile(r'who|world.*health.*organization', re.IGNORECASE),
            'NIH': re.compile(r'nih|national.*institute.*health', re.IGNORECASE),
            'NICE': re.compile(r'nice|national.*institute.*excellence', re.IGNORECASE),
            'MHRA': re.compile(r'mhra|medicine.*healthcare.*agency', re.IGNORECASE),
            'PMDA': re.compile(r'pmda|pharmaceutical.*device.*agency', re.IGNORECASE),
            'CDC': re.compile(r'cdc|centers.*disease.*control', re.IGNORECASE),
            'CMS': re.compile(r'cms|centers.*medicare.*medicaid', re.IGNORECASE),
            
            # Journals & Publications
            'Nature': re.compile(r'nature', re.IGNORECASE),
            'Science': re.compile(r'science', re.IGNORECASE),
            'JAMA': re.compile(r'jama|journal.*american.*medical', re.IGNORECASE),
            'NEJM': re.compile(r'nejm|new.*england.*journal', re.IGNORECASE),
            'Lancet': re.compile(r'lancet', re.IGNORECASE),
            'BMJ': re.compile(r'bmj|british.*medical.*journal', re.IGNORECASE),
            
            # Consultancies
            'McKinsey': re.compile(r'mckinsey', re.IGNORECASE),
            'Deloitte': re.compile(r'deloitte', re.IGNORECASE),
            'BCG': re.compile(r'bcg|boston.*consulting', re.IGNORECASE),
            'PwC': re.compile(r'pwc|pricewaterhouse', re.IGNORECASE),
            'KPMG': re.compile(r'kpmg', re.IGNORECASE),
            
            # Pharma companies
            'Pfizer': re.compile(r'pfizer', re.IGNORECASE),
            'GSK': re.compile(r'gsk|glaxosmithkline', re.IGNORECASE),
            'Novartis': re.compile(r'novartis', re.IGNORECASE),
            'Roche': re.compile(r'roche', re.IGNORECASE),
            'Merck': re.compile(r'merck', re.IGNORECASE),
            'J&J': re.compile(r'johnson.*johnson|j&j', re.IGNORECASE),
        }

        # Document type patterns
        self.document_type_patterns = {
            'Regulatory Guidance': re.compile(r'guidance|guideline|regulation|regulatory.*guidance', re.IGNORECASE),
            'Research Paper': re.compile(r'research|study|paper|publication|journal.*article', re.IGNORECASE),
            'Clinical Protocol': re.compile(r'protocol|clinical.*protocol', re.IGNORECASE),
            'Market Research Report': re.compile(r'market.*research|market.*report|market.*analysis', re.IGNORECASE),
            'Government Regulation': re.compile(r'regulation|regulatory|fda.*regulation|ema.*regulation', re.IGNORECASE),
            'Industry Standard': re.compile(r'standard|iso|ich.*guideline', re.IGNORECASE),
            'Whitepaper': re.compile(r'whitepaper|white.*paper', re.IGNORECASE),
            'Best Practice Guide': re.compile(r'best.*practice|best.*practice.*guide|practice.*guideline', re.IGNORECASE),
            'Template': re.compile(r'template|form.*template', re.IGNORECASE),
            'SOP': re.compile(r'sop|standard.*operating.*procedure', re.IGNORECASE),
            'Clinical Trial': re.compile(r'clinical.*trial|trial.*protocol|study.*protocol', re.IGNORECASE),
            'Systematic Review': re.compile(r'systematic.*review|meta.*analysis', re.IGNORECASE),
            'Case Study': re.compile(r'case.*study|case.*report', re.IGNORECASE),
        }

        # Regulatory body patterns
        self.regulatory_body_patterns = {
            'FDA': re.compile(r'fda|food.*drug.*administration', re.IGNORECASE),
            'EMA': re.compile(r'ema|european.*medicine.*agency', re.IGNORECASE),
            'WHO': re.compile(r'who|world.*health.*organization', re.IGNORECASE),
            'MHRA': re.compile(r'mhra|medicine.*healthcare.*agency', re.IGNORECASE),
            'PMDA': re.compile(r'pmda|pharmaceutical.*device.*agency', re.IGNORECASE),
            'Health Canada': re.compile(r'health.*canada|hc-sc', re.IGNORECASE),
            'TGA': re.compile(r'tga|therapeutic.*goods.*administration', re.IGNORECASE),
        }

        # Therapeutic area patterns
        self.therapeutic_area_patterns = {
            'Oncology': re.compile(r'oncology|cancer|tumor|tumour|onco', re.IGNORECASE),
            'Cardiology': re.compile(r'cardiology|cardiac|cardiovascular|heart', re.IGNORECASE),
            'Neurology': re.compile(r'neurology|neurological|brain|nervous.*system', re.IGNORECASE),
            'Immunology': re.compile(r'immunology|immune|immunotherapy', re.IGNORECASE),
            'Infectious Disease': re.compile(r'infectious|infection|pathogen|bacterial|viral', re.IGNORECASE),
            'Endocrinology': re.compile(r'endocrinology|diabetes|metabolic|hormone', re.IGNORECASE),
            'Rheumatology': re.compile(r'rheumatology|rheumatoid|arthritis|autoimmune', re.IGNORECASE),
            'Respiratory': re.compile(r'respiratory|pulmonary|lung|asthma|copd', re.IGNORECASE),
            'Dermatology': re.compile(r'dermatology|skin|dermatological', re.IGNORECASE),
            'Gastroenterology': re.compile(r'gastroenterology|gastro|digestive|gi', re.IGNORECASE),
        }

    async def extract_from_filename(self, filename: str) -> Dict[str, Any]:
        """Extract metadata from filename"""
        metadata: Dict[str, Any] = {
            'title': filename,
            'confidence': {},
        }

        try:
            # Extract extension using pathlib for safer handling
            file_path = Path(filename)
            extension = file_path.suffix.lstrip('.').lower()
            name_without_ext = file_path.stem

            # Extract source name
            source_match = self._extract_source(name_without_ext)
            if source_match:
                metadata['source_name'] = source_match['name']
                metadata['confidence']['source'] = source_match['confidence']

            # Extract year (4-digit years 1900-2099) with better validation
            year_match = re.search(r'\b(19|20)\d{2}\b', name_without_ext)
            if year_match:
                year = int(year_match.group())
                current_year = datetime.now().year
                if YEAR_MIN <= year <= current_year + 1:
                    metadata['year'] = year
                    metadata['confidence']['year'] = 0.9

            # Extract document type
            type_match = self._extract_document_type(name_without_ext)
            if type_match:
                metadata['document_type'] = type_match['type']
                metadata['confidence']['type'] = type_match['confidence']

            # Extract regulatory body
            regulatory_body_match = self._extract_regulatory_body(name_without_ext)
            if regulatory_body_match:
                metadata['regulatory_body'] = regulatory_body_match['body']
                metadata['confidence']['regulatory_body'] = regulatory_body_match['confidence']

            # Extract therapeutic area
            therapeutic_area_match = self._extract_therapeutic_area(name_without_ext)
            if therapeutic_area_match:
                metadata['therapeutic_area'] = therapeutic_area_match['area']
                metadata['confidence']['therapeutic_area'] = therapeutic_area_match['confidence']

            # Generate clean title (remove source, year, etc.)
            clean_title = self._generate_clean_title(name_without_ext, metadata)
            if clean_title:
                metadata['clean_title'] = clean_title

            logger.info("✅ Metadata extracted from filename",
                       filename=filename,
                       source=metadata.get('source_name'),
                       year=metadata.get('year'),
                       document_type=metadata.get('document_type'))

        except Exception as e:
            logger.error("❌ Failed to extract metadata from filename", error=str(e), filename=filename)

        return metadata

    async def extract_from_content(self, content: str, filename: Optional[str] = None) -> Dict[str, Any]:
        """Extract metadata from document content"""
        metadata: Dict[str, Any] = {
            'confidence': {},
        }

        try:
            # Extract from first N characters (usually header/metadata section)
            preview = content[:CONTENT_PREVIEW_LENGTH]

            # Extract source from content
            source_match = self._extract_source(preview)
            if source_match:
                metadata['source_name'] = source_match['name']
                metadata['confidence']['source'] = source_match['confidence']

            # Extract year from content with better validation
            year_match = re.search(r'\b(19|20)\d{2}\b', preview)
            if year_match:
                year = int(year_match.group())
                current_year = datetime.now().year
                if YEAR_MIN <= year <= current_year + 1:
                    metadata['year'] = year
                    metadata['confidence']['year'] = 0.8
            
            # Try to extract publication date using dateutil (more robust)
            try:
                date_pattern = re.search(r'\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})\b', preview[:500])
                if date_pattern:
                    parsed_date = date_parser.parse(date_pattern.group(), fuzzy=True, default=datetime.now())
                    if parsed_date:
                        metadata['publication_date'] = parsed_date.isoformat()
                        if not metadata.get('year'):
                            metadata['year'] = parsed_date.year
                            metadata['confidence']['year'] = 0.85
            except (ValueError, TypeError):
                pass  # Date parsing failed, continue without it

            # Extract document type
            type_match = self._extract_document_type(preview)
            if type_match:
                metadata['document_type'] = type_match['type']
                metadata['confidence']['type'] = type_match['confidence']

            # Extract regulatory body
            regulatory_body_match = self._extract_regulatory_body(preview)
            if regulatory_body_match:
                metadata['regulatory_body'] = regulatory_body_match['body']
                metadata['confidence']['regulatory_body'] = regulatory_body_match['confidence']

            # Extract therapeutic area
            therapeutic_area_match = self._extract_therapeutic_area(preview)
            if therapeutic_area_match:
                metadata['therapeutic_area'] = therapeutic_area_match['area']
                metadata['confidence']['therapeutic_area'] = therapeutic_area_match['confidence']

            # Extract title from content (first few lines, headers, or AI)
            title = self._extract_title_from_content(content)
            if title:
                metadata['title'] = title
                metadata['confidence']['title'] = 0.8

            # Extract keywords (first N characters)
            keywords = self._extract_keywords(content[:KEYWORD_EXTRACTION_LENGTH])
            if keywords:
                metadata['keywords'] = keywords

            # Word count (more accurate with proper tokenization)
            metadata['word_count'] = len(content.split())

            # Language detection using langdetect library (more accurate)
            metadata['language'] = self._detect_language(content[:LANGUAGE_DETECTION_LENGTH])

            # Use AI for advanced extraction if enabled (includes title extraction)
            if self.use_ai and self.openai_client:
                ai_metadata = await self._extract_with_ai(content[:5000])
                if ai_metadata:
                    # AI extraction may provide a better title, so update if present
                    metadata.update(ai_metadata)
                    if ai_metadata.get('title'):
                        metadata['confidence']['title'] = 0.95  # Higher confidence for AI-extracted title

            logger.info("✅ Metadata extracted from content",
                       word_count=metadata.get('word_count'),
                       source=metadata.get('source_name'))

        except Exception as e:
            logger.error("❌ Failed to extract metadata from content", error=str(e))

        return metadata

    async def extract_combined(
        self,
        filename: str,
        content: Optional[str] = None
    ) -> Dict[str, Any]:
        """Extract metadata from both filename and content"""
        # Start with filename extraction
        metadata = await self.extract_from_filename(filename)

        # Enhance with content if available
        if content:
            content_metadata = await self.extract_from_content(content, filename)
            # Merge, preferring content metadata when confidence is higher
            for key, value in content_metadata.items():
                if key not in metadata:
                    metadata[key] = value
                elif key == 'confidence':
                    # Merge confidence scores
                    metadata['confidence'].update(value)
                elif metadata.get('confidence', {}).get(key, 0) < content_metadata.get('confidence', {}).get(key, 0):
                    # Use content value if confidence is higher
                    metadata[key] = value
            
            # Ensure we have a title - prefer content title over filename title
            if content_metadata.get('title') and not metadata.get('title'):
                metadata['title'] = content_metadata['title']
                if 'clean_title' not in metadata:
                    # Generate clean_title from content title if we don't have one from filename
                    metadata['clean_title'] = content_metadata['title']
            elif not metadata.get('clean_title') and metadata.get('title'):
                # Use title as clean_title if clean_title is missing
                metadata['clean_title'] = metadata['title']

        # Calculate overall confidence
        confidences = metadata.get('confidence', {})
        if confidences:
            metadata['extraction_confidence'] = sum(confidences.values()) / len(confidences)
        else:
            metadata['extraction_confidence'] = 0.5

        return metadata

    def _extract_source(self, text: str) -> Optional[Dict[str, Any]]:
        """Extract source name from text"""
        for source_name, pattern in self.source_patterns.items():
            if pattern.search(text):
                return {
                    'name': source_name,
                    'confidence': 0.9,
                }
        return None

    def _extract_document_type(self, text: str) -> Optional[Dict[str, Any]]:
        """Extract document type from text"""
        for doc_type, pattern in self.document_type_patterns.items():
            if pattern.search(text):
                return {
                    'type': doc_type,
                    'confidence': 0.85,
                }
        return None

    def _extract_regulatory_body(self, text: str) -> Optional[Dict[str, Any]]:
        """Extract regulatory body from text"""
        for body, pattern in self.regulatory_body_patterns.items():
            if pattern.search(text):
                return {
                    'body': body,
                    'confidence': 0.9,
                }
        return None

    def _extract_therapeutic_area(self, text: str) -> Optional[Dict[str, Any]]:
        """Extract therapeutic area from text"""
        for area, pattern in self.therapeutic_area_patterns.items():
            if pattern.search(text):
                return {
                    'area': area,
                    'confidence': 0.8,
                }
        return None

    def _generate_clean_title(self, filename: str, metadata: Dict[str, Any]) -> str:
        """Generate clean title by removing extracted metadata"""
        clean = filename

        # Remove source name
        if metadata.get('source_name'):
            source_pattern = re.compile(re.escape(metadata['source_name']), re.IGNORECASE)
            clean = source_pattern.sub('', clean)

        # Remove year
        if metadata.get('year'):
            year_pattern = re.compile(r'\b' + str(metadata['year']) + r'\b')
            clean = year_pattern.sub('', clean)

        # Remove document type keywords
        if metadata.get('document_type'):
            type_pattern = re.compile(r'\b' + re.escape(metadata['document_type']) + r'\b', re.IGNORECASE)
            clean = type_pattern.sub('', clean)

        # Clean up
        clean = re.sub(r'[_-]+', ' ', clean)  # Replace separators with spaces
        clean = re.sub(r'\s+', ' ', clean).strip()  # Normalize spaces

        return clean

    def _extract_title_from_content(self, content: str) -> Optional[str]:
        """Extract title from document content"""
        if not content:
            return None
        
        # Try to extract title from first few lines (common title locations)
        lines = content.split('\n')[:20]  # Check first 20 lines
        
        # Look for title patterns:
        # 1. First non-empty line that's not too short and not too long
        # 2. Lines that look like headings (all caps, title case, etc.)
        # 3. Lines before common separators or metadata markers
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            # Skip empty lines
            if not line:
                continue
            
            # Skip lines that are too short (likely not a title)
            if len(line) < TITLE_MIN_LENGTH:
                continue
            
            # Skip lines that are too long (likely body text)
            if len(line) > TITLE_MAX_LENGTH:
                continue
            
            # Skip lines that look like metadata (dates, author info, etc.)
            if re.match(r'^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}', line):  # Date patterns
                continue
            if re.match(r'^(Author|By|Prepared by|Date|Submitted):', line, re.IGNORECASE):
                continue
            
            # Skip lines that are all numbers or mostly punctuation
            if re.match(r'^[\d\s\-_/]+$', line):
                continue
            
            # Potential title found - check if it's a heading pattern
            # Check if line is all caps (common for headings)
            if line.isupper() and len(line) < 100:
                # Normalize Unicode before returning
                return unidecode(line)
            
            # Check if line is in title case (first letter of each word capitalized)
            if line == line.title() and len(line) < 100:
                # Normalize Unicode before returning
                return unidecode(line)
            
            # If it's the first substantial line and looks reasonable, use it
            if i < 5 and TITLE_REASONABLE_MIN <= len(line) <= TITLE_REASONABLE_MAX:
                # Clean up: remove common prefixes/suffixes
                title = re.sub(r'^(Title|Document|Report|Paper):\s*', '', line, flags=re.IGNORECASE)
                title = title.strip()
                if title:
                    # Normalize Unicode before returning
                    return unidecode(title)
        
        # If no title found in first lines, try to extract from PDF-like patterns
        # (common in extracted PDF text)
        title_match = re.search(r'^([A-Z][^.!?]{10,150})(?:\n|$)', content, re.MULTILINE)
        if title_match:
            title = title_match.group(1).strip()
            if TITLE_REASONABLE_MIN <= len(title) <= TITLE_REASONABLE_MAX:
                # Normalize Unicode before returning
                return unidecode(title)
        
        return None

    def _extract_keywords(self, text: str, max_keywords: int = 20) -> List[str]:
        """Extract keywords from text (simple implementation)"""
        # Simple keyword extraction based on frequency
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
        word_freq: Dict[str, int] = {}
        
        for word in words:
            if word not in ['that', 'this', 'with', 'from', 'have', 'been', 'will', 'your', 'they']:
                word_freq[word] = word_freq.get(word, 0) + 1

        # Sort by frequency and return top keywords
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, _ in sorted_words[:max_keywords]]

    def _detect_language(self, text: str) -> str:
        """Language detection using langdetect library"""
        if not text or len(text.strip()) < 10:
            return 'en'  # Default to English for short text
        
        try:
            # Use langdetect for accurate language detection
            detected_lang = detect(text)
            return detected_lang
        except LangDetectException:
            # Fallback: check for common English words if detection fails
            english_words = ['the', 'and', 'is', 'are', 'for', 'with', 'from', 'this', 'that']
            words = text.lower().split()
            if words:
                english_count = sum(1 for word in words if word in english_words)
                if english_count > len(words) * 0.1:
                    return 'en'
        
        # Default to English
        return 'en'

    async def _extract_with_ai(self, content: str) -> Optional[Dict[str, Any]]:
        """Extract metadata using OpenAI if AI extraction is enabled"""
        if not self.openai_client:
            return None

        try:
            prompt = f"""Extract metadata from this document content. Return JSON with:
- title: Document title
- author: Author name if found
- organization: Organization/publisher
- publication_date: Publication date if found
- summary: Brief summary (max 200 chars)
- keywords: List of 5-10 keywords

Content (first {CONTENT_PREVIEW_LENGTH} chars):
{content[:CONTENT_PREVIEW_LENGTH]}
"""

            response = self.openai_client.chat.completions.create(
                model=_UTILITY_DEFAULTS.model,
                messages=[
                    {"role": "system", "content": "You are a metadata extraction assistant. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=_UTILITY_DEFAULTS.temperature,
                max_tokens=_UTILITY_DEFAULTS.max_tokens,
            )

            # Parse JSON response
            import json
            ai_metadata = json.loads(response.choices[0].message.content)
            
            # Normalize Unicode in extracted strings
            if 'title' in ai_metadata and ai_metadata['title']:
                ai_metadata['title'] = unidecode(ai_metadata['title'])
            
            return ai_metadata

        except Exception as e:
            logger.warning("⚠️ AI metadata extraction failed", error=str(e))
            return None


# Export singleton instance
def create_metadata_extractor(use_ai: bool = False, openai_api_key: Optional[str] = None) -> SmartMetadataExtractor:
    """Create metadata extractor instance"""
    return SmartMetadataExtractor(use_ai=use_ai, openai_api_key=openai_api_key)

