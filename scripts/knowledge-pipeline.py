#!/usr/bin/env python3
"""
Knowledge Pipeline: Automated Content Scraping, Curation & Upload
==================================================================

Production-ready script for scraping web content and uploading to Supabase/Pinecone
via the Unified RAG Service.

Usage:
    python knowledge-pipeline.py --config config.json
    python knowledge-pipeline.py --config config.json --dry-run
    python knowledge-pipeline.py --config config.json --legacy-upload

Author: VITAL AI Platform
Date: 2025-11-05
Version: 2.0.0
"""

import argparse
import asyncio
import json
import logging
import os
import sys
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
from urllib.parse import urlparse

# Try to import enhanced scraper, fall back to basic if not available
try:
    from enhanced_web_scraper import EnhancedWebScraper
    ENHANCED_SCRAPER = True
    logger = logging.getLogger(__name__)
    logger.info("✅ Using Enhanced Web Scraper (PDF + Playwright support enabled)")
except ImportError:
    EnhancedWebScraper = None  # type: ignore
    ENHANCED_SCRAPER = False
    logger = logging.getLogger(__name__)
    logger.info("ℹ️  Using Basic Web Scraper (install PyPDF2, pdfplumber, playwright for full support)")

import aiohttp
from bs4 import BeautifulSoup, NavigableString, Tag
from dotenv import load_dotenv

# Add parent directory to path for RAG service imports
sys.path.insert(0, str(Path(__file__).parent.parent / "services" / "ai-engine" / "src"))

# Import auto-calculation and metadata mapping modules
from metadata_auto_calculator import enrich_metadata
from comprehensive_metadata_mapper import map_source_to_metadata

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('knowledge-pipeline.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


# ============================================================================
# CONFIGURATION & VALIDATION
# ============================================================================

class PipelineConfig:
    """Configuration and validation for the knowledge pipeline."""
    
    def __init__(self, config_path: str, dry_run: bool = False):
        self.config_path = config_path
        self.config: Dict[str, Any] = {}
        self.dry_run = dry_run
        self.load_config()
        self.validate_config()
        if not dry_run:
            self.validate_env()
        else:
            logger.info("🔍 Dry run mode - skipping environment validation")
    
    def load_config(self) -> None:
        """Load JSON configuration file."""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
            logger.info(f"✅ Loaded configuration from {self.config_path}")
        except FileNotFoundError:
            logger.error(f"❌ Configuration file not found: {self.config_path}")
            sys.exit(1)
        except json.JSONDecodeError as e:
            logger.error(f"❌ Invalid JSON in configuration file: {e}")
            sys.exit(1)
    
    def validate_config(self) -> None:
        """Validate required fields in configuration."""
        required_fields = ['sources', 'output_settings']
        for field in required_fields:
            if field not in self.config:
                logger.error(f"❌ Missing required field in config: {field}")
                sys.exit(1)
        
        # Validate sources
        if not isinstance(self.config['sources'], list) or len(self.config['sources']) == 0:
            logger.error("❌ 'sources' must be a non-empty list")
            sys.exit(1)
        
        for idx, source in enumerate(self.config['sources']):
            if 'url' not in source:
                logger.error(f"❌ Source at index {idx} missing 'url' field")
                sys.exit(1)
        
        logger.info("✅ Configuration validated")
    
    def validate_env(self) -> None:
        """Validate required environment variables."""
        required_vars = [
            'SUPABASE_URL',
            'SUPABASE_SERVICE_ROLE_KEY'
        ]
        
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        
        if missing_vars:
            logger.error(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
            sys.exit(1)
        
        # Pinecone is optional
        if os.getenv('PINECONE_API_KEY'):
            logger.info("✅ Pinecone configuration found")
        else:
            logger.warning("⚠️  Pinecone API key not found - vector upload will be skipped")
        
        logger.info("✅ Environment variables validated")


# ============================================================================
# WEB SCRAPER
# ============================================================================

class BasicWebScraper:
    """Basic web scraper with retry logic and content extraction (fallback)."""
    
    def __init__(self, timeout: int = 45, max_retries: int = 3, **kwargs):
        # Accept and ignore extra kwargs for compatibility with EnhancedWebScraper
        self.timeout = timeout
        self.max_retries = max_retries
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self) -> 'BasicWebScraper':
        # Create SSL context that doesn't verify certificates (for corporate proxies)
        import ssl
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=self.timeout),
            headers={
                'User-Agent': 'Mozilla/5.0 (compatible; VITAL-AI-Bot/1.0)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            connector=aiohttp.TCPConnector(ssl=ssl_context)
        )
        return self
    
    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        if self.session:
            await self.session.close()
    
    async def scrape_url(self, url: str, css_selector: Optional[str] = None) -> Dict[str, Any]:
        """
        Scrape content from a URL with retry logic.
        
        Args:
            url: URL to scrape
            css_selector: Optional CSS selector for targeted extraction
        
        Returns:
            Dictionary with scraped content and metadata
        """
        for attempt in range(self.max_retries):
            try:
                logger.info(f"🔍 Scraping: {url} (attempt {attempt + 1}/{self.max_retries})")
                
                if not self.session:
                    raise RuntimeError("Session not initialized")
                
                async with self.session.get(url) as response:
                    if response.status != 200:
                        logger.error(f"❌ Failed to fetch {url}: HTTP {response.status}")
                        if attempt < self.max_retries - 1:
                            await asyncio.sleep(2 ** attempt)  # Exponential backoff
                            continue
                        return {
                            'url': url,
                            'success': False,
                            'error': f"HTTP {response.status}",
                            'content': None
                        }
                    
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Extract metadata
                    title_tag = soup.find('title')
                    title_text = title_tag.get_text(strip=True) if title_tag else urlparse(url).path
                    
                    # Extract main content
                    if css_selector:
                        content_elem = soup.select_one(css_selector)
                        content = content_elem.get_text(strip=True, separator='\n') if content_elem else ""
                    else:
                        # Remove script and style elements
                        for script in soup(["script", "style", "nav", "footer", "header"]):
                            script.decompose()
                        
                        # Get text from main content areas
                        main_content = soup.find('main') or soup.find('article') or soup.find('body')
                        content = main_content.get_text(strip=True, separator='\n') if main_content else ""
                    
                    # Extract links
                    links = []
                    for a_tag in soup.find_all('a', href=True):
                        if isinstance(a_tag, Tag):
                            href = a_tag.get('href')
                            if href:
                                links.append(str(href))
                    
                    # Extract meta description
                    description = ''
                    meta_desc = soup.find('meta', attrs={'name': 'description'})
                    if meta_desc and isinstance(meta_desc, Tag):
                        content_attr = meta_desc.get('content')
                        if content_attr:
                            description = str(content_attr)
                    
                    result = {
                        'url': url,
                        'success': True,
                        'title': title_text,
                        'content': content,
                        'description': description,
                        'links': links,
                        'word_count': len(content.split()),
                        'scraped_at': datetime.utcnow().isoformat(),
                        'content_hash': hashlib.sha256(content.encode()).hexdigest()
                    }
                    
                    logger.info(f"✅ Scraped {url} - {result['word_count']} words")
                    return result
                    
            except asyncio.TimeoutError:
                logger.warning(f"⏱️ Timeout scraping {url}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
                    continue
            except Exception as e:
                logger.error(f"❌ Error scraping {url}: {str(e)}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
                    continue
        
        # All retries failed
        return {
            'url': url,
            'success': False,
            'error': 'Max retries exceeded',
            'content': None
        }


# ============================================================================
# CONTENT CURATOR
# ============================================================================

class ContentCurator:
    """Organize and structure scraped content by domain."""
    
    def __init__(self, output_dir: str):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.domains: Dict[str, List[Dict[str, Any]]] = {}
    
    def add_content(self, scraped_data: Dict[str, Any], metadata: Dict[str, Any]) -> None:
        """Add scraped content to appropriate domain folder."""
        domain = metadata.get('domain', 'uncategorized')
        
        if domain not in self.domains:
            self.domains[domain] = []
            # Create domain folder
            domain_dir = self.output_dir / domain
            domain_dir.mkdir(exist_ok=True)
        
        # Combine scraped data with metadata
        content_entry = {
            **scraped_data,
            **metadata,
            'domain': domain
        }
        
        self.domains[domain].append(content_entry)
        
        # Save individual file
        if scraped_data.get('success') and scraped_data.get('content'):
            self._save_content_file(domain, content_entry)
    
    def _save_content_file(self, domain: str, content: Dict[str, Any]) -> None:
        """Save content to individual markdown file."""
        domain_dir = self.output_dir / domain
        
        # Create safe filename
        safe_title = "".join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in content.get('title', 'untitled'))
        safe_title = safe_title[:100]  # Limit length
        content_hash = content.get('content_hash', 'unknown')[:8]
        filename = f"{safe_title}_{content_hash}.md"
        
        filepath = domain_dir / filename
        
        # Create markdown content
        md_content = f"""---
title: {content.get('title', 'Untitled')}
url: {content.get('url', '')}
domain: {domain}
category: {content.get('category', 'general')}
tags: {', '.join(content.get('tags', []))}
word_count: {content.get('word_count', 0)}
scraped_at: {content.get('scraped_at', '')}
content_hash: {content_hash}
---

# {content.get('title', 'Untitled')}

**Source:** {content.get('url', '')}
**Domain:** {domain}
**Category:** {content.get('category', 'general')}

## Description

{content.get('description', 'No description available')}

## Content

{content.get('content', '')}

---
*Scraped by VITAL Knowledge Pipeline on {content.get('scraped_at', '')}*
"""
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(md_content)
        
        logger.info(f"💾 Saved: {filepath}")
    
    def get_summary(self) -> Dict[str, Any]:
        """Get summary statistics of curated content."""
        return {
            'total_domains': len(self.domains),
            'domains': {
                domain: {
                    'count': len(items),
                    'total_words': sum(item.get('word_count', 0) for item in items),
                    'successful': sum(1 for item in items if item.get('success', False))
                }
                for domain, items in self.domains.items()
            }
        }


# ============================================================================
# RAG SERVICE UPLOADER (PRODUCTION)
# ============================================================================

class RAGServiceUploader:
    """
    Upload content using the Unified RAG Service.
    Uses the same standard RAG integration as the knowledge upload page.
    """
    
    def __init__(self, embedding_model: str):
        self.embedding_model = embedding_model
        self.uploaded_count = 0
        self.failed_count = 0
        self.chunks_created = 0
        self.rag_integration: Optional[Any] = None
        self.langgraph_processor: Optional[Any] = None
        self.use_langgraph = False  # Disabled - use standard RAG integration like upload page
    
    async def initialize(self) -> None:
        """Initialize the RAG integration service with LangGraph support."""
        try:
            if self.use_langgraph:
                # Try to use advanced LangGraph workflow
                try:
                    from services.knowledge_pipeline_langgraph import create_knowledge_processor
                    self.langgraph_processor = await create_knowledge_processor(
                        embedding_model=self.embedding_model
                    )
                    logger.info("✅ LangGraph processor initialized - using advanced workflow 🚀")
                    logger.info("   📋 Workflow stages: metadata enrichment → validation → chunking → embeddings → storage")
                    return
                except ImportError as e:
                    logger.warning(f"⚠️ LangGraph not available: {e}")
                    logger.info("📦 Falling back to standard RAG integration")
                    self.use_langgraph = False
            
            # Fallback to standard RAG integration
            from services.knowledge_pipeline_integration import RAGIntegrationUploader
            
            self.rag_integration = RAGIntegrationUploader(embedding_model=self.embedding_model)
            await self.rag_integration.initialize()
            logger.info("✅ RAG Service uploader initialized (standard mode)")
            
        except ImportError as e:
            logger.error(f"❌ Failed to import RAG integration: {e}")
            logger.error("💡 Make sure you're running from the project root")
            raise
        except Exception as e:
            logger.error(f"❌ Failed to initialize RAG Service: {e}")
            raise
    
    async def upload_content(self, content: Dict[str, Any]) -> bool:
        """Upload content via LangGraph workflow or standard RAG integration."""
        try:
            logger.info(f"🔄 Upload method check: use_langgraph={self.use_langgraph}, processor={self.langgraph_processor is not None}, rag={self.rag_integration is not None}")
            
            if self.use_langgraph and self.langgraph_processor:
                # Use advanced LangGraph workflow
                logger.info(f"🔄 Processing with LangGraph workflow: {content.get('title', content.get('url'))[:60]}...")
                
                result = await self.langgraph_processor.process_document(
                    raw_content=content.get('content', ''),
                    source_url=content.get('url', ''),
                    source_metadata={
                        'title': content.get('title', ''),
                        'domain': content.get('domain', 'uncategorized'),
                        'category': content.get('category', 'general'),
                        'tags': content.get('tags', []),
                        'description': content.get('description', ''),
                        'firm': content.get('firm', ''),
                        **{k: v for k, v in content.items() if k not in ['content']}  # All metadata except content
                    }
                )
                
                # Extract statistics from LangGraph result
                if result and result.get('success'):
                    self.uploaded_count += 1
                    self.chunks_created += result.get('chunk_count', 0)
                    
                    logger.info(f"✅ LangGraph processing complete:")
                    logger.info(f"   📊 Quality Score: {result.get('quality_score', 0):.2f}")
                    logger.info(f"   ✂️ Chunks: {result.get('chunk_count', 0)}")
                    logger.info(f"   📤 Vectors uploaded: {result.get('pinecone_vectors_uploaded', 0)}")
                    logger.info(f"   💾 Supabase: {'✅' if result.get('supabase_stored') else '❌'}")
                    
                    if result.get('warnings'):
                        for warning in result['warnings']:
                            logger.warning(f"   ⚠️ {warning}")
                    
                    return True
                else:
                    self.failed_count += 1
                    errors = result.get('errors', ['Unknown error']) if result else ['Processing failed']
                    logger.error(f"   ❌ LangGraph processing failed for: {content.get('url', 'unknown')}")
                    logger.error(f"   📄 Full result: {result}")
                    for error in errors:
                        logger.error(f"   ❌ {error}")
                    return False
            
            elif self.rag_integration:
                # Fallback to standard integration
                success = await self.rag_integration.upload_content(content)
                if success:
                    self.uploaded_count += 1
                    stats = self.rag_integration.get_stats()
                    self.chunks_created = stats.get('chunks_created', 0)
                else:
                    self.failed_count += 1
                return success
            
            else:
                logger.error("❌ No upload method available")
                self.failed_count += 1
                return False
                
        except Exception as e:
            logger.error(f"❌ Error uploading content: {str(e)}")
            logger.error(f"   URL: {content.get('url', 'unknown')}")
            logger.error(f"   Exception type: {type(e).__name__}")
            import traceback
            logger.error(f"   Traceback: {traceback.format_exc()}")
            self.failed_count += 1
            return False
    
    async def close(self) -> None:
        """Cleanup resources."""
        if self.rag_integration:
            await self.rag_integration.close()
        # LangGraph processor doesn't need explicit closing
    
    def get_stats(self) -> Dict[str, int]:
        """Get upload statistics."""
        return {
            'uploaded': self.uploaded_count,
            'failed': self.failed_count
        }


# ============================================================================
# REPORT GENERATOR
# ============================================================================

class ReportGenerator:
    """Generate comprehensive pipeline execution report."""
    
    def __init__(self, output_dir: str):
        self.output_dir = Path(output_dir)
        self.start_time = datetime.utcnow()
        self.end_time: Optional[datetime] = None
    
    def generate_report(
        self,
        curator: ContentCurator,
        uploader_stats: Dict[str, int],
        failed_urls: List[str]
    ) -> str:
        """Generate and save comprehensive report."""
        self.end_time = datetime.utcnow()
        duration = (self.end_time - self.start_time).total_seconds()
        
        curation_summary = curator.get_summary()
        
        report = f"""
# Knowledge Pipeline Execution Report
Generated: {self.end_time.isoformat()}

## Execution Summary
- **Start Time:** {self.start_time.isoformat()}
- **End Time:** {self.end_time.isoformat()}
- **Duration:** {duration:.2f} seconds ({duration/60:.2f} minutes)

## Content Curation
- **Total Domains:** {curation_summary['total_domains']}
- **Total Documents:** {sum(d['count'] for d in curation_summary['domains'].values())}
- **Total Words:** {sum(d['total_words'] for d in curation_summary['domains'].values()):,}

### By Domain:
"""
        
        for domain, stats in curation_summary['domains'].items():
            report += f"""
#### {domain.upper()}
- Documents: {stats['count']}
- Successful: {stats['successful']}
- Total Words: {stats['total_words']:,}
"""
        
        total_uploads = uploader_stats['uploaded'] + uploader_stats['failed']
        success_rate = (uploader_stats['uploaded'] / total_uploads * 100) if total_uploads > 0 else 0
        
        report += f"""

## Upload Results
- **Uploaded:** {uploader_stats['uploaded']}
- **Failed:** {uploader_stats['failed']}
- **Success Rate:** {success_rate:.1f}%

## Failed URLs ({len(failed_urls)})
"""
        
        if failed_urls:
            for url in failed_urls:
                report += f"- {url}\n"
        else:
            report += "None ✅\n"
        
        report += f"""

## Output Location
- **Knowledge Folder:** {self.output_dir.absolute()}

## Next Steps
1. Review scraped content in the knowledge folder
2. Verify uploads in Supabase dashboard
3. Test RAG search functionality
4. Update any failed URLs and re-run pipeline

---
*Generated by VITAL Knowledge Pipeline v2.0.0*
"""
        
        # Save report
        report_path = self.output_dir / f"pipeline_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.md"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        logger.info(f"📊 Report saved: {report_path}")
        
        return report


# ============================================================================
# MAIN PIPELINE
# ============================================================================

class KnowledgePipeline:
    """Main pipeline orchestrator."""
    
    def __init__(
        self, 
        config_path: str, 
        output_dir: str, 
        dry_run: bool = False,
        embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2",
        use_rag_service: bool = True
    ):
        self.config = PipelineConfig(config_path, dry_run=dry_run)
        self.output_dir = output_dir
        self.dry_run = dry_run
        self.use_rag_service = use_rag_service
        
        self.curator = ContentCurator(output_dir)
        self.uploader: Optional[RAGServiceUploader] = None
        
        if use_rag_service:
            logger.info("🔄 Using Unified RAG Service for content ingestion")
            self.uploader = RAGServiceUploader(embedding_model=embedding_model)
        else:
            logger.warning("⚠️  Direct upload mode deprecated, using RAG service")
            self.uploader = RAGServiceUploader(embedding_model=embedding_model)
        
        self.report_generator = ReportGenerator(output_dir)
        self.failed_urls: List[str] = []
        
        logger.info(f"🤗 Using embedding model: {embedding_model}")
    
    async def run(self) -> None:
        """Execute the complete pipeline."""
        logger.info("🚀 Starting Knowledge Pipeline")
        logger.info(f"📁 Output directory: {self.output_dir}")
        
        if self.dry_run:
            logger.info("🔍 DRY RUN MODE - No uploads will be performed")
        
        # Initialize uploader if not dry run
        if not self.dry_run and self.uploader:
            logger.info("🔄 Initializing RAG Service...")
            await self.uploader.initialize()
        
        sources = self.config.config['sources']
        logger.info(f"📋 Processing {len(sources)} sources")
        
        # Initialize scraper - use Enhanced if available, otherwise Basic
        scraper_kwargs = {}
        if ENHANCED_SCRAPER and EnhancedWebScraper:
            scraper_kwargs['use_playwright'] = True
            logger.info("🎭 Playwright enabled for anti-bot bypass")
            WebScraperClass = EnhancedWebScraper
        else:
            WebScraperClass = BasicWebScraper
        
        async with WebScraperClass(**scraper_kwargs) as scraper:
            for idx, source in enumerate(sources, 1):
                logger.info(f"\n{'='*60}")
                logger.info(f"Processing source {idx}/{len(sources)}")
                logger.info(f"{'='*60}")
                
                url = source['url']
                
                # Scrape content
                scraped_data = await scraper.scrape_url(
                    url,
                    css_selector=source.get('css_selector')
                )
                
                if not scraped_data.get('success'):
                    self.failed_urls.append(url)
                    # Still add to curator for reporting
                    simple_metadata = {
                        'domain': source.get('domain', 'uncategorized'),
                        'category': source.get('category', 'general'),
                        'tags': source.get('tags', []),
                        'priority': source.get('priority', 'medium'),
                        'description': source.get('description', '')
                    }
                    self.curator.add_content(scraped_data, simple_metadata)
                    continue
                
                # Map to comprehensive metadata (85+ fields)
                logger.info("🔄 Mapping to comprehensive metadata schema...")
                comprehensive_metadata = map_source_to_metadata(source, scraped_data)
                
                # Auto-calculate quality scores and enrichment
                logger.info("✨ Enriching metadata with auto-calculated scores...")
                enriched_metadata = enrich_metadata(
                    comprehensive_metadata, 
                    content=scraped_data.get('content', '')
                )
                
                logger.info(f"✅ Metadata enriched - Quality: {enriched_metadata.get('quality_score', 'N/A')}, "
                           f"Credibility: {enriched_metadata.get('credibility_score', 'N/A')}, "
                           f"Freshness: {enriched_metadata.get('freshness_score', 'N/A')}")
                
                # Add to curator
                self.curator.add_content(scraped_data, enriched_metadata)
                
                # Upload if not dry run
                if not self.dry_run and self.uploader:
                    combined_data = {**scraped_data, **enriched_metadata}
                    
                    # Add domain_ids if provided in source config
                    if 'domain_ids' in source and source['domain_ids']:
                        combined_data['domain_ids'] = source['domain_ids']
                        logger.info(f"📂 Domain IDs: {source['domain_ids']}")
                    
                    await self.uploader.upload_content(combined_data)
                
                # Small delay between requests
                await asyncio.sleep(1)
        
        # Cleanup
        if self.uploader:
            await self.uploader.close()
        
        # Generate report
        uploader_stats = self.uploader.get_stats() if self.uploader else {'uploaded': 0, 'failed': 0}
        report = self.report_generator.generate_report(
            self.curator,
            uploader_stats,
            self.failed_urls
        )
        
        logger.info("\n" + "="*60)
        logger.info("✅ PIPELINE COMPLETE")
        logger.info("="*60)
        print(report)


# ============================================================================
# CLI
# ============================================================================

def main() -> None:
    parser = argparse.ArgumentParser(
        description='VITAL Knowledge Pipeline - Automated content scraping and upload',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run with config file (uses RAG service by default)
  python knowledge-pipeline.py --config sources.json
  
  # Dry run (no uploads)
  python knowledge-pipeline.py --config sources.json --dry-run
  
  # Custom output directory
  python knowledge-pipeline.py --config sources.json --output-dir ./my-knowledge
        """
    )
    
    parser.add_argument(
        '--config',
        required=True,
        help='Path to JSON configuration file with source URLs and metadata'
    )
    
    parser.add_argument(
        '--output-dir',
        default='./knowledge',
        help='Output directory for downloaded content (default: ./knowledge)'
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Run without uploading to Supabase/Pinecone'
    )
    
    parser.add_argument(
        '--embedding-model',
        default='sentence-transformers/all-MiniLM-L6-v2',
        help='Hugging Face embedding model to use (default: all-MiniLM-L6-v2)'
    )
    
    args = parser.parse_args()
    
    # Run pipeline
    pipeline = KnowledgePipeline(
        config_path=args.config,
        output_dir=args.output_dir,
        dry_run=args.dry_run,
        embedding_model=args.embedding_model,
        use_rag_service=True
    )
    
    asyncio.run(pipeline.run())


if __name__ == '__main__':
    main()
