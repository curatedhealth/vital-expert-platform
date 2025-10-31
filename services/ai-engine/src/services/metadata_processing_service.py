"""
Metadata Processing Service
Orchestrates smart metadata extraction, file renaming, copyright checking, and data sanitization
"""

import os
from typing import Dict, Any, Optional
import structlog

from services.smart_metadata_extractor import SmartMetadataExtractor, create_metadata_extractor
from services.file_renamer import FileRenamer, default_file_renamer
from services.copyright_checker import CopyrightChecker, create_copyright_checker
from services.data_sanitizer import DataSanitizer, create_data_sanitizer
from core.config import get_settings

logger = structlog.get_logger()

class MetadataProcessingService:
    """Orchestrates all metadata processing services"""

    def __init__(self, use_ai: bool = False, openai_api_key: Optional[str] = None):
        self.settings = get_settings()
        self.metadata_extractor = create_metadata_extractor(use_ai=use_ai, openai_api_key=openai_api_key)
        self.file_renamer = default_file_renamer
        self.copyright_checker = create_copyright_checker()
        self.data_sanitizer = create_data_sanitizer()

    async def process_file(
        self,
        filename: str,
        content: str,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Process file with all metadata services"""
        options = options or {}
        
        try:
            logger.info("📄 Processing file metadata", filename=filename)

            # Step 1: Extract metadata from filename and content
            extract_from_content = options.get('extract_from_content', True)
            if extract_from_content:
                metadata = await self.metadata_extractor.extract_combined(filename, content)
            else:
                metadata = await self.metadata_extractor.extract_from_filename(filename)

            # Step 2: Sanitize content (remove PII/PHI)
            sanitize = options.get('sanitize', True)
            sanitization_result = None
            processed_content = content

            if sanitize:
                sanitization_options = {
                    'remove_pii': options.get('remove_pii', True),
                    'remove_phi': options.get('remove_phi', True),
                    'remove_credit_cards': options.get('remove_credit_cards', True),
                    'remove_ssn': options.get('remove_ssn', True),
                    'remove_email': options.get('remove_email', True),
                    'remove_phone': options.get('remove_phone', True),
                    'remove_address': options.get('remove_address', True),
                    'remove_names': options.get('remove_names', False),
                    'redaction_mode': options.get('redaction_mode', 'mask'),
                    'log_removals': options.get('log_removals', True),
                }
                
                sanitization_result = await self.data_sanitizer.sanitize_content(
                    content, sanitization_options
                )
                processed_content = sanitization_result['sanitized_content']

            # Step 3: Check copyright
            check_copyright = options.get('check_copyright', True)
            copyright_result = None

            if check_copyright:
                copyright_options = {
                    'strict_mode': options.get('strict_mode', True),
                    'require_attribution': options.get('require_attribution', True),
                    'check_watermarks': options.get('check_watermarks', True),
                    'exclude_known_sources': options.get('exclude_known_sources', []),
                }
                
                copyright_result = await self.copyright_checker.check_copyright(
                    processed_content,
                    filename,
                    metadata,
                    copyright_options
                )

            # Step 4: Generate new filename
            rename_file = options.get('rename_file', False)
            new_filename = filename

            if rename_file:
                metadata['extension'] = os.path.splitext(filename)[1].lstrip('.')
                new_filename = self.file_renamer.generate_filename(metadata, filename)

            # Combine all results
            result = {
                'metadata': metadata,
                'new_filename': new_filename,
                'original_filename': filename,
                'sanitization': sanitization_result,
                'copyright_check': copyright_result,
                'processing_summary': {
                    'extraction_confidence': metadata.get('extraction_confidence', 0.5),
                    'sanitized': sanitization_result['sanitized'] if sanitization_result else False,
                    'copyright_risk': copyright_result['has_copyright_risk'] if copyright_result else False,
                    'requires_review': (
                        (sanitization_result and sanitization_result['needs_review']) or
                        (copyright_result and copyright_result['requires_approval'])
                    ),
                },
            }

            logger.info("✅ File processing completed",
                       filename=filename,
                       new_filename=new_filename,
                       extraction_confidence=metadata.get('extraction_confidence'),
                       sanitized=sanitization_result['sanitized'] if sanitization_result else False,
                       copyright_risk=copyright_result['has_copyright_risk'] if copyright_result else False)

            return result

        except Exception as e:
            logger.error("❌ File processing failed", error=str(e), filename=filename)
            raise

    async def extract_metadata_only(
        self,
        filename: str,
        content: Optional[str] = None
    ) -> Dict[str, Any]:
        """Extract metadata only (no sanitization or copyright check)"""
        if content:
            return await self.metadata_extractor.extract_combined(filename, content)
        return await self.metadata_extractor.extract_from_filename(filename)

    async def sanitize_only(
        self,
        content: str,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Sanitize content only"""
        options = options or {}
        return await self.data_sanitizer.sanitize_content(content, options)

    async def check_copyright_only(
        self,
        content: str,
        filename: str,
        metadata: Optional[Dict[str, Any]] = None,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Check copyright only"""
        options = options or {}
        return await self.copyright_checker.check_copyright(content, filename, metadata, options)

    async def generate_filename_only(
        self,
        metadata: Dict[str, Any],
        original_filename: Optional[str] = None
    ) -> str:
        """Generate filename only"""
        return self.file_renamer.generate_filename(metadata, original_filename)


# Export singleton instance
def create_metadata_processing_service(
    use_ai: bool = False,
    openai_api_key: Optional[str] = None
) -> MetadataProcessingService:
    """Create metadata processing service instance"""
    return MetadataProcessingService(use_ai=use_ai, openai_api_key=openai_api_key)

