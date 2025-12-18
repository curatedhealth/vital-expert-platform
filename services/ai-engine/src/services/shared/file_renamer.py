"""
File Renaming Service
Renames files based on consistent taxonomy and extracted metadata
"""

import re
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime
import structlog
from unidecode import unidecode

# Constants
WINDOWS_MAX_PATH_LENGTH = 260  # Windows MAX_PATH is 260 characters
SAFE_FILENAME_LENGTH = 200  # Safe length leaving room for path
INVALID_FILENAME_CHARS = r'[<>:"/\\|?*\x00-\x1f]'  # Invalid chars for Windows/Linux

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
            
            # Get title using pathlib for safer filename handling
            title = (metadata.get('clean_title') or 
                    metadata.get('title') or 
                    (Path(original_filename).stem if original_filename else None) or 
                    'Document')

            # Remove extension from title if present (pathlib already handles this in .stem)

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

            # Add extension using pathlib
            extension = (metadata.get('extension') or 
                        (Path(original_filename).suffix.lstrip('.').lower() if original_filename else ''))
            if extension:
                filename += f'.{extension}'

            # Ensure it's not too long (Windows has 260 char MAX_PATH limit)
            if len(filename) > SAFE_FILENAME_LENGTH:
                # Calculate available space for title after other parts
                other_parts_length = sum(len(p) for p in parts[:-1] if p != title) + len(self.config['separator']) * (len(parts) - 2)
                extension_length = len(f'.{extension}') if extension else 0
                title_length = max(0, SAFE_FILENAME_LENGTH - other_parts_length - extension_length - 3)  # -3 for '...'
                truncated_title = title[:title_length] + '...' if title_length > 3 else title[:title_length]
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
        return ''.join(word.capitalize() for word in re.split(r'[\s_-]+', formatted))

    def _format_type(self, doc_type: str) -> str:
        """Format document type"""
        # Remove common words and format
        formatted = re.sub(r'\b(guide|guidance|document|report|paper)\b', '', doc_type, flags=re.IGNORECASE)
        formatted = formatted.strip()
        
        # Format as CamelCase
        formatted = ''.join(word.capitalize() for word in re.split(r'[\s_-]+', formatted))
        
        # Truncate if too long
        max_len = self.config['max_length']['type']
        if len(formatted) > max_len:
            formatted = formatted[:max_len]
        
        return formatted

    def _format_title(self, title: str) -> str:
        """Format title with Unicode normalization"""
        if not title:
            return ''
        
        # Normalize Unicode (e.g., convert accented characters to ASCII)
        clean = unidecode(title)
        
        # Remove special chars but keep alphanumeric, spaces, and hyphens
        clean = re.sub(r'[^\w\s-]', ' ', clean)
        
        # Normalize spaces
        clean = re.sub(r'\s+', ' ', clean).strip()
        
        # Truncate if too long (preserve word boundaries when possible)
        max_len = self.config['max_length']['title']
        if len(clean) > max_len:
            # Try to truncate at word boundary
            truncated = clean[:max_len - 3].rsplit(' ', 1)[0]
            if len(truncated) < max_len - 10:  # If truncation is too short, just cut
                clean = clean[:max_len - 3] + '...'
            else:
                clean = truncated + '...'
        
        return clean

    def _sanitize(self, value: str) -> str:
        """Sanitize string for filename using best practices"""
        if not value:
            return ''
        
        # Convert Unicode to ASCII equivalents (handles accented characters, etc.)
        # Example: "Café" -> "Cafe", "naïve" -> "naive"
        sanitized = unidecode(value)
        
        # Remove invalid filename characters (Windows/Linux compatible)
        sanitized = re.sub(INVALID_FILENAME_CHARS, '', sanitized)
        
        # Normalize whitespace
        sanitized = re.sub(r'\s+', ' ', sanitized).strip()
        
        # Remove leading/trailing dots and spaces (Windows doesn't allow these)
        sanitized = sanitized.strip('. ')
        
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

