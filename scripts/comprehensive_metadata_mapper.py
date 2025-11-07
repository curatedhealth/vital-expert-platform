#!/usr/bin/env python3
"""
Enhanced Metadata Mapper for Knowledge Pipeline
================================================

Maps scraped content and source configuration to comprehensive metadata schema
with all 85+ fields for knowledge documents.

Author: VITAL AI Platform
Date: 2025-11-05
Version: 1.0.0
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


class ComprehensiveMetadataMapper:
    """Map source configuration and scraped data to full metadata schema."""
    
    @staticmethod
    def map_metadata(source: Dict[str, Any], scraped_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Map source config and scraped data to comprehensive metadata.
        
        Args:
            source: Source configuration from JSON
            scraped_data: Data returned from web scraper
        
        Returns:
            Complete metadata dictionary with all fields
        """
        now = datetime.utcnow().isoformat() + 'Z'
        
        # Extract from source or use defaults
        metadata = {
            # ===== CORE IDENTIFICATION =====
            'title': source.get('title') or scraped_data.get('title', 'Untitled'),
            'abstract': source.get('abstract') or scraped_data.get('description', ''),
            'content': scraped_data.get('content', ''),
            
            # ===== SOURCE & PUBLICATION =====
            'firm': source.get('firm', ''),
            'firm_id': source.get('firm_id'),  # UUID reference to firms table
            'authors': source.get('authors', []),
            'publication_date': source.get('publication_date'),
            'publication_year': source.get('publication_year') or source.get('year'),
            'publication_month': source.get('publication_month'),
            'version': source.get('version', '1.0'),
            'edition': source.get('edition'),
            'series_name': source.get('series_name'),
            
            # ===== DOCUMENT PROPERTIES =====
            'file_type': source.get('file_type', 'html'),
            'content_file_type': source.get('content_file_type', 'html'),
            'file_size': scraped_data.get('file_size'),
            'page_count': source.get('page_count'),
            'word_count': scraped_data.get('word_count', 0),
            'language_code': source.get('language_code') or source.get('language', 'en'),
            
            # ===== ACCESS & RETRIEVAL =====
            'url': source.get('url') or source.get('source_url', ''),
            'source_url': source.get('source_url') or source.get('url', ''),
            'pdf_link': source.get('pdf_link'),
            'direct_download': source.get('direct_download', False),
            'access_type': source.get('access_type', 'public'),
            'registration_required': source.get('registration_required', False),
            'paywall_status': source.get('paywall_status', 'free'),
            'download_date': source.get('download_date') or now,
            'last_verified_date': source.get('last_verified_date') or now,
            
            # ===== QUALITY & VETTING (will be auto-calculated if not provided) =====
            'quality_score': source.get('quality_score'),  # Auto-calc if None
            'credibility_score': source.get('credibility_score'),  # Auto-calc if None
            'peer_reviewed': source.get('peer_reviewed', False),
            'editorial_review_status': source.get('editorial_review_status', 'draft'),
            'last_reviewed_date': source.get('last_reviewed_date'),
            'reviewed_by_user_id': source.get('reviewed_by_user_id'),
            'confidence_level': source.get('confidence_level'),  # Auto-calc if None
            'citation_count': source.get('citation_count', 0),
            
            # ===== TAXONOMY & CLASSIFICATION =====
            'domain': source.get('domain', 'uncategorized'),
            'category': source.get('category', 'general'),
            'report_type': source.get('report_type'),
            'tags': source.get('tags', []),
            'topics': source.get('topics') or source.get('tags', []),
            'industry_sectors': source.get('industry_sectors', []),
            'geographic_scope': source.get('geographic_scope'),
            'geographic_regions': source.get('geographic_regions', []),
            'target_audience': source.get('target_audience', []),
            'practice_areas': source.get('practice_areas', []),
            'seniority_level': source.get('seniority_level'),
            'use_case_category': source.get('use_case_category'),
            
            # ===== TEMPORAL & CONTEXT =====
            'temporal_coverage': source.get('temporal_coverage'),
            'forecast_year': source.get('forecast_year'),
            'historical_period': source.get('historical_period'),
            'is_time_sensitive': source.get('is_time_sensitive', False),
            
            # ===== DOCUMENT STRUCTURE =====
            'has_executive_summary': source.get('has_executive_summary', False),
            'has_table_of_contents': source.get('has_table_of_contents', False),
            'has_appendices': source.get('has_appendices', False),
            'has_data_tables': source.get('has_data_tables', False),
            'has_charts_graphs': source.get('has_charts_graphs', False),
            'section_count': source.get('section_count'),
            'document_structure': source.get('document_structure', {}),
            
            # ===== RAG/AI METADATA =====
            'priority': source.get('priority', 'medium'),
            'rag_priority_weight': source.get('rag_priority_weight', 0.9),
            'embedding_model_version': source.get('embedding_model_version', 'sentence-transformers/all-MiniLM-L6-v2'),
            'chunk_strategy': source.get('chunk_strategy', 'semantic'),
            'context_window_tokens': source.get('context_window_tokens', 8192),
            'summarization_available': source.get('summarization_available', False),
            'query_history_count': 0,  # Starts at 0
            'last_retrieved_at': None,  # Not yet retrieved
            
            # ===== PROVENANCE & CITATION =====
            'doi': source.get('doi'),
            'isbn': source.get('isbn'),
            'permanent_id': source.get('permanent_id'),
            'citation_format': source.get('citation_format'),
            'related_document_ids': source.get('related_document_ids', []),
            'supersedes_document_id': source.get('supersedes_document_id'),
            'superseded_by_document_id': source.get('superseded_by_document_id'),
            
            # ===== COMPLIANCE & CLASSIFICATION =====
            'access_policy': source.get('access_policy', 'public'),
            'data_classification': source.get('data_classification', 'public'),
            'retention_policy': source.get('retention_policy', 'permanent'),
            'compliance_tags': source.get('compliance_tags', []),
            'pii_sensitivity': source.get('pii_sensitivity', 'Low'),
            'regulatory_exposure': source.get('regulatory_exposure', 'Low'),
            'contains_pii': source.get('contains_pii', False),
            'requires_consent': source.get('requires_consent', False),
            
            # ===== ENGAGEMENT TRACKING (starts at 0) =====
            'view_count': 0,
            'download_count': 0,
            'share_count': 0,
            'bookmark_count': 0,
            'average_read_time_seconds': None,
            'completion_rate': None,
            
            # ===== CONTENT QUALITY (will be auto-calculated if not provided) =====
            'readability_score': source.get('readability_score'),  # Auto-calc if None
            'technical_complexity': source.get('technical_complexity'),  # Auto-calc if None
            'data_richness_score': source.get('data_richness_score'),  # Auto-calc if None
            'visual_content_ratio': source.get('visual_content_ratio'),
            'freshness_score': source.get('freshness_score'),  # Auto-calc if None
            
            # ===== DESCRIPTION =====
            'description': source.get('description') or scraped_data.get('description', ''),
            
            # ===== ADDITIONAL METADATA (JSONB) =====
            'metadata': {
                **(source.get('metadata', {})),
                'scraping_timestamp': scraped_data.get('scraped_at', now),
                'scraping_method': 'web_scraper_tool',
                'content_hash': scraped_data.get('content_hash'),
                'original_url': scraped_data.get('url'),
            },
            
            # ===== SOURCE METADATA (JSONB) =====
            'source_metadata': {
                **(source.get('source_metadata', {})),
                'original_url': scraped_data.get('url'),
                'scraping_timestamp': scraped_data.get('scraped_at'),
                'scraping_method': 'web_scraper_tool',
                'content_hash': scraped_data.get('content_hash'),
                'scraped_word_count': scraped_data.get('word_count'),
            }
        }
        
        # Remove None values to let database defaults apply
        metadata = {k: v for k, v in metadata.items() if v is not None and v != ''}
        
        logger.debug(f"✅ Mapped metadata for: {metadata['title']}")
        
        return metadata
    
    @staticmethod
    def validate_metadata(metadata: Dict[str, Any]) -> tuple[bool, List[str]]:
        """
        Validate metadata has required fields.
        
        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        errors = []
        
        # Required fields
        required_fields = ['title', 'url', 'domain']
        for field in required_fields:
            if not metadata.get(field):
                errors.append(f"Missing required field: {field}")
        
        # Validate enums
        if metadata.get('access_type') and metadata['access_type'] not in ['public', 'paid', 'registration_required', 'restricted', 'gated', 'freemium']:
            errors.append(f"Invalid access_type: {metadata['access_type']}")
        
        if metadata.get('report_type') and metadata['report_type'] not in [
            'strategic_insight', 'research_study', 'point_of_view', 'case_study',
            'white_paper', 'infographic', 'market_report', 'trend_analysis',
            'framework', 'implementation_guide', 'other'
        ]:
            errors.append(f"Invalid report_type: {metadata['report_type']}")
        
        # Validate numeric ranges
        if metadata.get('quality_score') is not None:
            if not 0 <= metadata['quality_score'] <= 10:
                errors.append(f"quality_score must be 0-10, got {metadata['quality_score']}")
        
        if metadata.get('rag_priority_weight') is not None:
            if not 0 <= metadata['rag_priority_weight'] <= 1:
                errors.append(f"rag_priority_weight must be 0-1, got {metadata['rag_priority_weight']}")
        
        is_valid = len(errors) == 0
        return is_valid, errors
    
    @staticmethod
    def set_rag_priority_by_firm(metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Set RAG priority weight based on firm reputation."""
        firm = metadata.get('firm', '')
        
        # Tier 1 firms (McKinsey, BCG, Bain)
        tier1_firms = ['McKinsey & Company', 'McKinsey', 'Boston Consulting Group', 'BCG', 'Bain & Company', 'Bain']
        if any(firm.startswith(f) or f in firm for f in tier1_firms):
            metadata['rag_priority_weight'] = 0.98
        
        # Tier 2 firms (Gartner, Big 4)
        elif any(firm.startswith(f) or f in firm for f in ['Gartner', 'Deloitte', 'PwC', 'EY', 'Forrester']):
            metadata['rag_priority_weight'] = 0.95
        
        # Tier 3 firms
        elif any(firm.startswith(f) or f in firm for f in ['Accenture', 'KPMG', 'Capgemini']):
            metadata['rag_priority_weight'] = 0.92
        
        # Default
        else:
            metadata.setdefault('rag_priority_weight', 0.90)
        
        return metadata


# ============================================================================
# CONVENIENCE FUNCTION
# ============================================================================

def map_source_to_metadata(source: Dict[str, Any], scraped_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convenience function to map source + scraped data to comprehensive metadata.
    
    Args:
        source: Source configuration from JSON
        scraped_data: Scraped data from WebScraper
    
    Returns:
        Complete metadata dictionary
    """
    metadata = ComprehensiveMetadataMapper.map_metadata(source, scraped_data)
    metadata = ComprehensiveMetadataMapper.set_rag_priority_by_firm(metadata)
    
    # Validate
    is_valid, errors = ComprehensiveMetadataMapper.validate_metadata(metadata)
    if not is_valid:
        logger.warning(f"Metadata validation warnings for {metadata.get('title')}: {errors}")
    
    return metadata


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    # Example source configuration
    source_config = {
        'title': 'AI at Work: Momentum Builds, but Gaps Remain',
        'firm': 'Boston Consulting Group',
        'url': 'https://www.bcg.com/publications/2025/ai-at-work-momentum-builds-but-gaps-remain',
        'domain': 'ai_ml_healthcare',
        'publication_date': '2025-01-15',
        'publication_year': 2025,
        'report_type': 'strategic_insight',
        'industry_sectors': ['Healthcare', 'Technology'],
        'target_audience': ['C-Suite', 'CIO'],
        'practice_areas': ['AI', 'Digital Transformation'],
        'tags': ['AI adoption', 'generative AI'],
        'has_data_tables': True,
        'has_charts_graphs': True
    }
    
    # Example scraped data
    scraped_data = {
        'url': 'https://www.bcg.com/publications/2025/ai-at-work-momentum-builds-but-gaps-remain',
        'success': True,
        'title': 'AI at Work: Momentum Builds, but Gaps Remain',
        'content': 'Full article content here...',
        'description': 'BCG analysis of AI adoption',
        'word_count': 12500,
        'scraped_at': '2025-11-05T10:30:00Z',
        'content_hash': 'abc123...'
    }
    
    # Map to comprehensive metadata
    metadata = map_source_to_metadata(source_config, scraped_data)
    
    print("\n=== Comprehensive Metadata ===")
    print(f"Title: {metadata['title']}")
    print(f"Firm: {metadata['firm']}")
    print(f"RAG Priority: {metadata['rag_priority_weight']}")
    print(f"Domain: {metadata['domain']}")
    print(f"Report Type: {metadata.get('report_type')}")
    print(f"Industry Sectors: {metadata.get('industry_sectors')}")
    print(f"Target Audience: {metadata.get('target_audience')}")
    print(f"Has Data Tables: {metadata['has_data_tables']}")
    print(f"Has Charts: {metadata['has_charts_graphs']}")

