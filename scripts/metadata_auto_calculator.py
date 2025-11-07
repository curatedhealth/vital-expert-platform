#!/usr/bin/env python3
"""
Metadata Auto-Calculation Module
=================================

Automatically calculate quality scores, freshness scores, readability scores,
and other derived metadata fields for knowledge documents.

Author: VITAL AI Platform
Date: 2025-11-05
Version: 1.0.0
"""

import re
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

# ============================================================================
# FIRM REPUTATION SCORES (Pre-configured)
# ============================================================================

FIRM_REPUTATION_SCORES = {
    'McKinsey & Company': 9.9,
    'McKinsey': 9.9,
    'Boston Consulting Group': 9.8,
    'BCG': 9.8,
    'Bain & Company': 9.7,
    'Bain': 9.7,
    'Deloitte': 9.0,
    'Deloitte Consulting': 9.0,
    'Gartner': 8.9,
    'PwC': 8.8,
    'PricewaterhouseCoopers': 8.8,
    'EY': 8.7,
    'Ernst & Young': 8.7,
    'Forrester': 8.6,
    'Accenture': 8.5,
    'KPMG': 8.3,
    'default': 7.0
}


# ============================================================================
# QUALITY SCORE CALCULATOR
# ============================================================================

class QualityScoreCalculator:
    """
    Calculate quality score based on multiple weighted factors:
    - Firm reputation (30%)
    - Peer review status (20%)
    - Citation count (15%)
    - Data richness (20%)
    - Freshness (15%)
    """
    
    WEIGHTS = {
        'firm_reputation': 0.30,
        'peer_review': 0.20,
        'citation_count': 0.15,
        'data_richness': 0.20,
        'freshness': 0.15
    }
    
    @staticmethod
    def calculate(metadata: Dict[str, Any]) -> float:
        """
        Calculate overall quality score (0-10).
        
        Args:
            metadata: Document metadata dictionary
        
        Returns:
            Float between 0 and 10
        """
        try:
            # 1. Firm Reputation Score (0-10)
            firm = metadata.get('firm', 'default')
            firm_score = FIRM_REPUTATION_SCORES.get(firm, FIRM_REPUTATION_SCORES['default'])
            
            # 2. Peer Review Bonus (0-10)
            peer_reviewed = metadata.get('peer_reviewed', False)
            peer_review_score = 10.0 if peer_reviewed else 5.0
            
            # 3. Citation Count Score (0-10)
            citation_count = metadata.get('citation_count', 0)
            citation_score = min(10.0, citation_count / 5.0)  # 50+ citations = 10.0
            
            # 4. Data Richness Score (0-10)
            data_richness = metadata.get('data_richness_score')
            if data_richness is None:
                data_richness = QualityScoreCalculator._calculate_data_richness(metadata)
            
            # 5. Freshness Score (0-10)
            freshness = metadata.get('freshness_score')
            if freshness is None:
                freshness = FreshnessScoreCalculator.calculate(metadata)
            
            # Calculate weighted score
            quality_score = (
                firm_score * QualityScoreCalculator.WEIGHTS['firm_reputation'] +
                peer_review_score * QualityScoreCalculator.WEIGHTS['peer_review'] +
                citation_score * QualityScoreCalculator.WEIGHTS['citation_count'] +
                data_richness * QualityScoreCalculator.WEIGHTS['data_richness'] +
                freshness * QualityScoreCalculator.WEIGHTS['freshness']
            )
            
            # Ensure within bounds
            quality_score = max(0.0, min(10.0, quality_score))
            
            logger.debug(f"Quality score calculated: {quality_score:.2f} (firm={firm_score}, peer={peer_review_score}, citations={citation_score}, data={data_richness}, freshness={freshness})")
            
            return round(quality_score, 2)
            
        except Exception as e:
            logger.error(f"Error calculating quality score: {e}")
            return 7.0  # Default fallback
    
    @staticmethod
    def _calculate_data_richness(metadata: Dict[str, Any]) -> float:
        """Calculate data richness based on content features."""
        score = 5.0  # Base score
        
        # Bonus for data tables
        if metadata.get('has_data_tables'):
            score += 1.5
        
        # Bonus for charts/graphs
        if metadata.get('has_charts_graphs'):
            score += 1.5
        
        # Bonus for substantial word count
        word_count = metadata.get('word_count', 0)
        if word_count > 10000:
            score += 2.0
        elif word_count > 5000:
            score += 1.0
        
        # Bonus for page count
        page_count = metadata.get('page_count', 0)
        if page_count > 50:
            score += 1.0
        elif page_count > 25:
            score += 0.5
        
        return min(10.0, score)


# ============================================================================
# CREDIBILITY SCORE CALCULATOR
# ============================================================================

class CredibilityScoreCalculator:
    """Calculate credibility score based on source reputation and review status."""
    
    @staticmethod
    def calculate(metadata: Dict[str, Any]) -> float:
        """
        Calculate credibility score (0-10).
        
        Factors:
        - Firm reputation (50%)
        - Peer review status (30%)
        - Editorial review status (20%)
        """
        try:
            # 1. Firm Reputation (0-10)
            firm = metadata.get('firm', 'default')
            firm_score = FIRM_REPUTATION_SCORES.get(firm, FIRM_REPUTATION_SCORES['default'])
            
            # 2. Peer Review (0-10)
            peer_reviewed = metadata.get('peer_reviewed', False)
            peer_review_score = 10.0 if peer_reviewed else 5.0
            
            # 3. Editorial Review Status (0-10)
            editorial_status = metadata.get('editorial_review_status', 'draft')
            editorial_scores = {
                'published': 10.0,
                'approved': 9.0,
                'reviewed': 7.5,
                'in_review': 5.0,
                'draft': 3.0
            }
            editorial_score = editorial_scores.get(editorial_status, 5.0)
            
            # Calculate weighted credibility
            credibility_score = (
                firm_score * 0.50 +
                peer_review_score * 0.30 +
                editorial_score * 0.20
            )
            
            credibility_score = max(0.0, min(10.0, credibility_score))
            
            logger.debug(f"Credibility score calculated: {credibility_score:.2f}")
            
            return round(credibility_score, 2)
            
        except Exception as e:
            logger.error(f"Error calculating credibility score: {e}")
            return 7.0


# ============================================================================
# FRESHNESS SCORE CALCULATOR
# ============================================================================

class FreshnessScoreCalculator:
    """Calculate freshness score based on publication date and content age."""
    
    @staticmethod
    def calculate(metadata: Dict[str, Any]) -> float:
        """
        Calculate freshness score (0-10) based on publication date.
        
        Scoring:
        - 0-3 months old: 10.0
        - 3-6 months old: 9.0
        - 6-12 months old: 8.0
        - 1-2 years old: 6.0
        - 2-3 years old: 4.0
        - 3-5 years old: 2.0
        - 5+ years old: 1.0
        """
        try:
            # Get publication date
            pub_date_str = metadata.get('publication_date')
            if not pub_date_str:
                # Fallback to publication year
                pub_year = metadata.get('publication_year')
                if pub_year:
                    pub_date_str = f"{pub_year}-01-01"
                else:
                    logger.warning("No publication date found, using default freshness score")
                    return 5.0
            
            # Parse date
            try:
                if isinstance(pub_date_str, str):
                    pub_date = datetime.fromisoformat(pub_date_str.replace('Z', '+00:00'))
                else:
                    pub_date = pub_date_str
            except (ValueError, AttributeError):
                # Try alternative formats
                from dateutil import parser
                pub_date = parser.parse(str(pub_date_str))
            
            # Calculate age in days
            now = datetime.now(pub_date.tzinfo) if pub_date.tzinfo else datetime.now()
            age_days = (now - pub_date).days
            
            # Calculate freshness score
            if age_days < 90:  # 0-3 months
                score = 10.0
            elif age_days < 180:  # 3-6 months
                score = 9.0
            elif age_days < 365:  # 6-12 months
                score = 8.0
            elif age_days < 730:  # 1-2 years
                score = 6.0
            elif age_days < 1095:  # 2-3 years
                score = 4.0
            elif age_days < 1825:  # 3-5 years
                score = 2.0
            else:  # 5+ years
                score = 1.0
            
            # Adjust for time-sensitive content
            if metadata.get('is_time_sensitive', False):
                # Decay faster for time-sensitive content
                score = max(1.0, score - 1.0)
            
            logger.debug(f"Freshness score calculated: {score:.2f} (age: {age_days} days)")
            
            return round(score, 2)
            
        except Exception as e:
            logger.error(f"Error calculating freshness score: {e}")
            return 5.0


# ============================================================================
# READABILITY SCORE CALCULATOR
# ============================================================================

class ReadabilityScoreCalculator:
    """Calculate readability score using Flesch-Kincaid algorithm."""
    
    @staticmethod
    def calculate(content: str) -> float:
        """
        Calculate Flesch Reading Ease score (0-100).
        
        Higher score = easier to read
        - 90-100: Very easy
        - 80-90: Easy
        - 70-80: Fairly easy
        - 60-70: Standard
        - 50-60: Fairly difficult
        - 30-50: Difficult
        - 0-30: Very difficult
        
        Formula: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
        """
        try:
            if not content or len(content.strip()) == 0:
                return 50.0  # Default for empty content
            
            # Count sentences
            sentences = re.split(r'[.!?]+', content)
            sentence_count = len([s for s in sentences if s.strip()])
            if sentence_count == 0:
                sentence_count = 1
            
            # Count words
            words = content.split()
            word_count = len(words)
            if word_count == 0:
                return 50.0
            
            # Count syllables (approximation)
            syllable_count = ReadabilityScoreCalculator._count_syllables(content)
            
            # Calculate Flesch Reading Ease
            if sentence_count > 0 and word_count > 0:
                score = 206.835 - 1.015 * (word_count / sentence_count) - 84.6 * (syllable_count / word_count)
            else:
                score = 50.0
            
            # Clamp to 0-100
            score = max(0.0, min(100.0, score))
            
            logger.debug(f"Readability score calculated: {score:.2f} (words={word_count}, sentences={sentence_count}, syllables={syllable_count})")
            
            return round(score, 2)
            
        except Exception as e:
            logger.error(f"Error calculating readability score: {e}")
            return 50.0
    
    @staticmethod
    def _count_syllables(text: str) -> int:
        """Approximate syllable count."""
        text = text.lower()
        syllable_count = 0
        vowels = 'aeiouy'
        words = text.split()
        
        for word in words:
            word = re.sub(r'[^a-z]', '', word)
            if len(word) == 0:
                continue
            
            # Simple syllable counting heuristic
            syllable_count += len(re.findall(r'[aeiouy]+', word))
            
            # Adjust for silent e
            if word.endswith('e') and len(word) > 2:
                syllable_count -= 1
            
            # Each word has at least one syllable
            if syllable_count == 0:
                syllable_count = 1
        
        return max(1, syllable_count)


# ============================================================================
# TECHNICAL COMPLEXITY CALCULATOR
# ============================================================================

class TechnicalComplexityCalculator:
    """Determine technical complexity level based on content analysis."""
    
    # Technical term indicators
    EXPERT_TERMS = [
        'algorithm', 'methodology', 'quantitative', 'statistical', 'regression',
        'hypothesis', 'empirical', 'correlation', 'variance', 'optimization',
        'framework', 'paradigm', 'infrastructure', 'architecture', 'integration'
    ]
    
    @staticmethod
    def calculate(content: str, metadata: Dict[str, Any]) -> str:
        """
        Determine technical complexity level.
        
        Returns: 'beginner', 'intermediate', 'advanced', 'expert', or 'mixed'
        """
        try:
            if not content:
                return 'intermediate'  # Default
            
            content_lower = content.lower()
            
            # Count technical terms
            term_count = sum(1 for term in TechnicalComplexityCalculator.EXPERT_TERMS if term in content_lower)
            
            # Get word count
            word_count = metadata.get('word_count', len(content.split()))
            
            # Calculate technical density
            technical_density = (term_count / word_count * 100) if word_count > 0 else 0
            
            # Check readability
            readability = metadata.get('readability_score', 50.0)
            
            # Determine complexity
            if readability > 70 and technical_density < 1.0:
                return 'beginner'
            elif readability > 60 and technical_density < 2.0:
                return 'intermediate'
            elif readability > 50 and technical_density < 4.0:
                return 'advanced'
            elif readability <= 50 or technical_density >= 4.0:
                return 'expert'
            else:
                return 'mixed'
                
        except Exception as e:
            logger.error(f"Error calculating technical complexity: {e}")
            return 'intermediate'


# ============================================================================
# COMPREHENSIVE METADATA ENRICHER
# ============================================================================

class MetadataEnricher:
    """Enrich document metadata with auto-calculated fields."""
    
    @staticmethod
    def enrich(metadata: Dict[str, Any], content: str = "") -> Dict[str, Any]:
        """
        Enrich metadata with auto-calculated scores and fields.
        
        Args:
            metadata: Base metadata dictionary
            content: Document content for analysis
        
        Returns:
            Enriched metadata dictionary with all calculated fields
        """
        enriched = metadata.copy()
        
        try:
            logger.info(f"🔄 Enriching metadata for: {metadata.get('title', 'Untitled')}")
            
            # 1. Calculate Word Count if not present
            if 'word_count' not in enriched and content:
                enriched['word_count'] = len(content.split())
            
            # 2. Calculate Readability Score
            if 'readability_score' not in enriched and content:
                enriched['readability_score'] = ReadabilityScoreCalculator.calculate(content)
            
            # 3. Calculate Technical Complexity
            if 'technical_complexity' not in enriched:
                enriched['technical_complexity'] = TechnicalComplexityCalculator.calculate(content, enriched)
            
            # 4. Calculate Freshness Score
            if 'freshness_score' not in enriched:
                enriched['freshness_score'] = FreshnessScoreCalculator.calculate(enriched)
            
            # 5. Calculate Data Richness Score
            if 'data_richness_score' not in enriched:
                enriched['data_richness_score'] = QualityScoreCalculator._calculate_data_richness(enriched)
            
            # 6. Calculate Credibility Score
            if 'credibility_score' not in enriched:
                enriched['credibility_score'] = CredibilityScoreCalculator.calculate(enriched)
            
            # 7. Calculate Quality Score (must be last as it depends on other scores)
            if 'quality_score' not in enriched:
                enriched['quality_score'] = QualityScoreCalculator.calculate(enriched)
            
            # 8. Set default values for boolean fields
            enriched.setdefault('peer_reviewed', False)
            enriched.setdefault('contains_pii', False)
            enriched.setdefault('requires_consent', False)
            enriched.setdefault('is_time_sensitive', False)
            
            # 9. Set editorial status if not present
            enriched.setdefault('editorial_review_status', 'draft')
            
            # 10. Set confidence level based on metadata completeness
            completeness = MetadataEnricher._calculate_completeness(enriched)
            if 'confidence_level' not in enriched:
                if completeness > 0.8:
                    enriched['confidence_level'] = 'high'
                elif completeness > 0.5:
                    enriched['confidence_level'] = 'medium'
                else:
                    enriched['confidence_level'] = 'low'
            
            # 11. Add timestamps
            now = datetime.utcnow().isoformat() + 'Z'
            enriched.setdefault('download_date', now)
            enriched.setdefault('last_verified_date', now)
            
            logger.info(f"✅ Metadata enriched: quality={enriched.get('quality_score'):.2f}, credibility={enriched.get('credibility_score'):.2f}, freshness={enriched.get('freshness_score'):.2f}")
            
            return enriched
            
        except Exception as e:
            logger.error(f"Error enriching metadata: {e}")
            return enriched
    
    @staticmethod
    def _calculate_completeness(metadata: Dict[str, Any]) -> float:
        """Calculate metadata completeness ratio."""
        key_fields = [
            'title', 'firm', 'publication_date', 'abstract', 'authors',
            'report_type', 'industry_sectors', 'target_audience',
            'practice_areas', 'domain', 'tags', 'topics'
        ]
        
        present_count = sum(1 for field in key_fields if metadata.get(field))
        return present_count / len(key_fields)


# ============================================================================
# CONVENIENCE FUNCTION
# ============================================================================

def enrich_metadata(metadata: Dict[str, Any], content: str = "") -> Dict[str, Any]:
    """
    Convenience function to enrich metadata.
    
    Args:
        metadata: Base metadata dictionary
        content: Document content
    
    Returns:
        Enriched metadata with auto-calculated scores
    """
    return MetadataEnricher.enrich(metadata, content)


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    # Example metadata
    example_metadata = {
        'title': 'AI at Work: Momentum Builds, but Gaps Remain',
        'firm': 'Boston Consulting Group',
        'publication_date': '2025-01-15',
        'publication_year': 2025,
        'peer_reviewed': False,
        'citation_count': 5,
        'has_data_tables': True,
        'has_charts_graphs': True,
        'word_count': 12500,
        'page_count': 45
    }
    
    example_content = """
    Artificial intelligence continues to transform the workplace at an unprecedented pace.
    Organizations are implementing AI solutions across various domains, from customer service
    to operations optimization. However, significant gaps remain in adoption and implementation.
    """
    
    # Enrich metadata
    enriched = enrich_metadata(example_metadata, example_content)
    
    print("\n=== Enriched Metadata ===")
    print(f"Quality Score: {enriched['quality_score']}")
    print(f"Credibility Score: {enriched['credibility_score']}")
    print(f"Freshness Score: {enriched['freshness_score']}")
    print(f"Readability Score: {enriched['readability_score']}")
    print(f"Technical Complexity: {enriched['technical_complexity']}")
    print(f"Data Richness Score: {enriched['data_richness_score']}")
    print(f"Confidence Level: {enriched['confidence_level']}")

