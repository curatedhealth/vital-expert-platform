"""
Smart Metadata Extraction Service
Extracts comprehensive metadata from filenames and content using AI and pattern matching
"""

import re
import os
from typing import Dict, Any, Optional, List
from datetime import datetime
import structlog
from openai import OpenAI
import hashlib

from core.config import get_settings

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
            # Extract extension
            _, ext = os.path.splitext(filename)
            extension = ext.lower().lstrip('.')
            name_without_ext = filename.rsplit('.', 1)[0] if '.' in filename else filename

            # Extract source name
            source_match = self._extract_source(name_without_ext)
            if source_match:
                metadata['source_name'] = source_match['name']
                metadata['confidence']['source'] = source_match['confidence']

            # Extract year (4-digit years 1900-2099)
            year_match = re.search(r'\b(19|20)\d{2}\b', name_without_ext)
            if year_match:
                year = int(year_match.group())
                current_year = datetime.now().year
                if 1900 <= year <= current_year + 1:
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
            # Extract from first 5000 characters (usually header/metadata section)
            preview = content[:5000]

            # Extract source from content
            source_match = self._extract_source(preview)
            if source_match:
                metadata['source_name'] = source_match['name']
                metadata['confidence']['source'] = source_match['confidence']

            # Extract year from content
            year_match = re.search(r'\b(19|20)\d{2}\b', preview)
            if year_match:
                year = int(year_match.group())
                current_year = datetime.now().year
                if 1900 <= year <= current_year + 1:
                    metadata['year'] = year
                    metadata['confidence']['year'] = 0.8

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

            # Extract keywords (first 50 words)
            keywords = self._extract_keywords(content[:2000])
            if keywords:
                metadata['keywords'] = keywords

            # Word count
            metadata['word_count'] = len(content.split())

            # Language detection (simple - can be enhanced)
            metadata['language'] = self._detect_language(content[:1000])

            # Use AI for advanced extraction if enabled
            if self.use_ai and self.openai_client:
                ai_metadata = await self._extract_with_ai(content[:5000])
                if ai_metadata:
                    metadata.update(ai_metadata)

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
            # Merge, preferring filename metadata for conflicts
            for key, value in content_metadata.items():
                if key not in metadata or metadata.get('confidence', {}).get(key, 0) < content_metadata.get('confidence', {}).get(key, 0):
                    metadata[key] = value

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
        """Simple language detection (can be enhanced with langdetect library)"""
        # Check for common English words
        english_words = ['the', 'and', 'is', 'are', 'for', 'with', 'from', 'this', 'that']
        english_count = sum(1 for word in text.lower().split() if word in english_words)
        
        if english_count > len(text.split()) * 0.1:
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

Content (first 5000 chars):
{content[:5000]}
"""

            response = self.openai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are a metadata extraction assistant. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=500,
            )

            # Parse JSON response
            import json
            ai_metadata = json.loads(response.choices[0].message.content)
            return ai_metadata

        except Exception as e:
            logger.warning("⚠️ AI metadata extraction failed", error=str(e))
            return None


# Export singleton instance
def create_metadata_extractor(use_ai: bool = False, openai_api_key: Optional[str] = None) -> SmartMetadataExtractor:
    """Create metadata extractor instance"""
    return SmartMetadataExtractor(use_ai=use_ai, openai_api_key=openai_api_key)

