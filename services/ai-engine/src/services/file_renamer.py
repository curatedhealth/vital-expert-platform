"""
File Renaming Service
Renames files based on consistent taxonomy and extracted metadata
"""

import re
from typing import Dict, Any, Optional
from datetime import datetime
import structlog

logger = structlog.get_logger()

class FileRenamer:
    """Renames files based on taxonomy and extracted metadata"""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = {
            'template': config.get('template', '{Source}_{Type}_{Year}_{Title}') if config else '{Source}_{Type}_{Year}_{Title}',
            'separator': config.get('separator', '_') if config else '_',
            'max_length': {
                'source': config.get('max_length', {}).get('source', 30) if config else 30,
                'type': config.get('max_length', {}).get('type', 40) if config else 40,
                'title': config.get('max_length', {}).get('title', 80) if config else 80,
            } if config else {
                'source': 30,
                'type': 40,
                'title': 80,
            },
            'include_missing': config.get('include_missing', False) if config else False,
        }

    def generate_filename(
        self,
        metadata: Dict[str, Any],
        original_filename: Optional[str] = None
    ) -> str:
        """Generate new filename based on taxonomy and metadata"""
        try:
            parts = []

            # Extract components
            source = self._format_source(metadata.get('source_name')) if metadata.get('source_name') else None
            doc_type = self._format_type(metadata.get('document_type')) if metadata.get('document_type') else None
            year = str(metadata.get('year')) if metadata.get('year') else None
            
            # Get title
            title = (metadata.get('clean_title') or 
                    metadata.get('title') or 
                    (original_filename.rsplit('.', 1)[0] if original_filename and '.' in original_filename else original_filename) or 
                    'Document')

            # Remove extension from title if present
            title = title.rsplit('.', 1)[0] if '.' in title else title

            # Build filename according to template
            if source or self.config['include_missing']:
                parts.append(source or 'UnknownSource')
            
            if doc_type or self.config['include_missing']:
                parts.append(doc_type or 'Document')
            
            if year or self.config['include_missing']:
                parts.append(year or str(datetime.now().year))
            
            if title:
                parts.append(self._format_title(title))

            # Join with separator
            filename = self.config['separator'].join(parts)

            # Add extension
            extension = (metadata.get('extension') or 
                        (original_filename.rsplit('.', 1)[1].lower() if original_filename and '.' in original_filename else ''))
            if extension:
                filename += f'.{extension}'

            # Ensure it's not too long (Windows has 255 char limit)
            max_length = 200  # Leave room for path
            if len(filename) > max_length:
                title_length = max(0, max_length - (len(filename) - len(title)))
                truncated_title = title[:title_length - 3] + '...' if title_length > 3 else title
                parts_without_title = parts[:-1] if parts else []
                filename = self.config['separator'].join(parts_without_title + [truncated_title])
                if extension:
                    filename += f'.{extension}'

            logger.info("✅ Filename generated",
                       original=original_filename,
                       new=filename)

            return filename

        except Exception as e:
            logger.error("❌ Failed to generate filename", error=str(e))
            return original_filename or 'Document'

    def _format_source(self, source: str) -> str:
        """Format source name"""
        # If it's already an acronym (all caps, short), keep it
        if source == source.upper() and len(source) <= 10:
            return source
        
        # Otherwise, format as TitleCase
        formatted = self._sanitize(source)
        return ''.join(word.capitalize() for word in re.split(r'[\s-_]+', formatted))

    def _format_type(self, doc_type: str) -> str:
        """Format document type"""
        # Remove common words and format
        formatted = re.sub(r'\b(guide|guidance|document|report|paper)\b', '', doc_type, flags=re.IGNORECASE)
        formatted = formatted.strip()
        
        # Format as CamelCase
        formatted = ''.join(word.capitalize() for word in re.split(r'[\s-_]+', formatted))
        
        # Truncate if too long
        max_len = self.config['max_length']['type']
        if len(formatted) > max_len:
            formatted = formatted[:max_len]
        
        return formatted

    def _format_title(self, title: str) -> str:
        """Format title"""
        # Clean up: remove special chars, normalize spaces
        clean = re.sub(r'[^\w\s-]', ' ', title)  # Remove special chars
        clean = re.sub(r'\s+', ' ', clean)  # Normalize spaces
        clean = clean.strip()
        
        # Truncate if too long
        max_len = self.config['max_length']['title']
        if len(clean) > max_len:
            clean = clean[:max_len - 3] + '...'
        
        return clean

    def _sanitize(self, value: str) -> str:
        """Sanitize string for filename"""
        # Remove invalid filename chars
        sanitized = re.sub(r'[<>:"/\\|?*]', '', value)
        # Normalize spaces
        sanitized = re.sub(r'\s+', ' ', sanitized).strip()
        return sanitized

    def generate_with_template(
        self,
        template: str,
        metadata: Dict[str, Any],
        original_filename: Optional[str] = None
    ) -> str:
        """Generate filename with custom template"""
        try:
            filename = template

            # Replace placeholders
            filename = filename.replace('{Source}', self._format_source(metadata.get('source_name', 'UnknownSource')))
            filename = filename.replace('{Type}', self._format_type(metadata.get('document_type', 'Document')))
            filename = filename.replace('{Year}', str(metadata.get('year', datetime.now().year)))
            filename = filename.replace('{Title}', metadata.get('clean_title') or metadata.get('title') or 
                                      (original_filename.rsplit('.', 1)[0] if original_filename and '.' in original_filename else 'Document'))
            
            extension = (metadata.get('extension') or 
                        (original_filename.rsplit('.', 1)[1].lower() if original_filename and '.' in original_filename else ''))
            filename = filename.replace('{Ext}', extension)

            # Clean up extra separators
            separator = self.config['separator']
            filename = re.sub(rf'[{separator}-]{{2,}}', separator, filename)
            filename = re.sub(rf'^[{separator}-]+|[{separator}-]+$', '', filename)

            # Add extension if not in template
            if '.' not in filename and extension:
                filename += f'.{extension}'

            return filename

        except Exception as e:
            logger.error("❌ Failed to generate filename with template", error=str(e))
            return original_filename or 'Document'


# Default instance with standard healthcare/pharma taxonomy
default_file_renamer = FileRenamer({
    'template': '{Source}_{Type}_{Year}_{Title}',
    'separator': '_',
    'max_length': {
        'source': 30,
        'type': 40,
        'title': 80,
    },
})

