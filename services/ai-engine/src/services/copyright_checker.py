"""
Copyright Detection and Compliance Service
Detects potential copyright violations and ensures proper attribution
"""

import re
from typing import Dict, Any, List, Optional
from datetime import datetime
import structlog

logger = structlog.get_logger()

class CopyrightChecker:
    """Detects copyright notices and ensures compliance"""

    def __init__(self):
        self.copyright_keywords = [
            'copyright',
            '©',
            'all rights reserved',
            'proprietary',
            'confidential',
            'do not distribute',
            'unauthorized copying',
            'protected by copyright',
            'copyright notice',
        ]

        self.attribution_keywords = [
            'attribution required',
            'credit required',
            'must cite',
            'source:',
            'reference:',
            'citation',
            'reproduced with permission',
        ]

        self.watermark_patterns = [
            re.compile(r'watermark', re.IGNORECASE),
            re.compile(r'draft', re.IGNORECASE),
            re.compile(r'confidential', re.IGNORECASE),
            re.compile(r'internal use only', re.IGNORECASE),
            re.compile(r'proprietary', re.IGNORECASE),
        ]

        self.known_licensed_sources = [
            'FDA',
            'EMA',
            'WHO',
            'NIH',
            'government',
            'public domain',
            'open access',
            'creative commons',
            'CC-BY',
            'CC-BY-SA',
        ]

    async def check_copyright(
        self,
        content: str,
        filename: str,
        metadata: Optional[Dict[str, Any]] = None,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Check document for copyright compliance"""
        options = options or {}
        
        issues: List[Dict[str, Any]] = []
        recommendations: List[str] = []
        risk_level = 'none'
        requires_approval = False

        # Check for copyright notices
        copyright_notice = self._detect_copyright_notice(content)
        has_copyright_notice = bool(copyright_notice)

        # Check for missing attribution
        if options.get('require_attribution', True):
            attribution_check = self._check_attribution(content, metadata)
            if not attribution_check['has_attribution'] and not self._is_public_domain(metadata):
                issues.append({
                    'type': 'missing_attribution',
                    'severity': 'medium',
                    'description': 'Document may require attribution but none found',
                    'recommendation': 'Add proper attribution or source citation',
                })

        # Check for watermarks or draft marks
        if options.get('check_watermarks', True):
            watermark_check = self._detect_watermarks(content, filename)
            if watermark_check['has_watermark']:
                issues.append({
                    'type': 'watermark',
                    'severity': 'high',
                    'description': 'Watermark or draft marking detected',
                    'location': watermark_check.get('location'),
                    'detected_text': watermark_check.get('text'),
                    'recommendation': 'Verify document is final version and not restricted',
                })
                requires_approval = True

        # Check for proprietary/confidential content
        proprietary_check = self._detect_proprietary_content(content)
        if proprietary_check['is_proprietary']:
            issues.append({
                'type': 'proprietary_content',
                'severity': 'critical',
                'description': 'Proprietary or confidential content detected',
                'recommendation': 'Do not upload - requires explicit permission',
            })
            risk_level = 'critical'
            requires_approval = True

        # Check if source is known licensed source
        is_licensed = self._is_licensed_source(metadata.get('source_name') if metadata else None,
                                              options.get('exclude_known_sources', []))

        # Determine overall risk level
        if issues:
            critical_issues = [i for i in issues if i['severity'] == 'critical']
            high_issues = [i for i in issues if i['severity'] == 'high']

            if critical_issues:
                risk_level = 'critical'
            elif high_issues:
                risk_level = 'high'
            elif len(issues) > 2:
                risk_level = 'medium'
            else:
                risk_level = 'low'

        # Build recommendations
        if has_copyright_notice and not is_licensed:
            recommendations.append('Document contains copyright notice - ensure proper licensing')

        if not (metadata and (metadata.get('source_name') or metadata.get('source_url'))):
            recommendations.append('Add source information for proper attribution')

        if has_copyright_notice and metadata and metadata.get('source_name'):
            recommendations.append(f"Verify license/permission from {metadata['source_name']}")

        # Calculate confidence
        confidence = self._calculate_confidence(issues, has_copyright_notice, is_licensed)

        return {
            'has_copyright_risk': risk_level != 'none',
            'risk_level': risk_level,
            'detected_issues': issues,
            'recommendations': recommendations,
            'copyright_notice': copyright_notice,
            'attribution_required': not is_licensed and has_copyright_notice,
            'requires_approval': requires_approval,
            'confidence': confidence,
        }

    def _detect_copyright_notice(self, content: str) -> Optional[str]:
        """Detect copyright notice in content"""
        lines = content.split('\n')[:50]  # Check first 50 lines

        for keyword in self.copyright_keywords:
            pattern = re.compile(keyword, re.IGNORECASE)
            for line in lines:
                if pattern.search(line):
                    # Extract copyright notice (typically 1-3 lines)
                    line_index = lines.index(line)
                    notice = ' '.join(lines[max(0, line_index - 1):line_index + 3])
                    return notice.strip()

        return None

    def _check_attribution(
        self,
        content: str,
        metadata: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Check if document has proper attribution"""
        # Check for attribution keywords in content
        for keyword in self.attribution_keywords:
            if keyword.lower() in content.lower():
                return {'has_attribution': True}

        # Check if metadata provides attribution
        if metadata and (metadata.get('source_name') or metadata.get('author')):
            return {'has_attribution': True}

        return {'has_attribution': False}

    def _detect_watermarks(self, content: str, filename: str) -> Dict[str, Any]:
        """Detect watermarks or draft markings"""
        # Check filename
        for pattern in self.watermark_patterns:
            if pattern.search(filename):
                return {'has_watermark': True, 'location': 'filename', 'text': filename}

        # Check first and last few lines (typical watermark locations)
        lines = content.split('\n')
        header_lines = lines[:10]
        footer_lines = lines[-10:]

        for pattern in self.watermark_patterns:
            for line in header_lines + footer_lines:
                if pattern.search(line):
                    location = 'header' if line in header_lines else 'footer'
                    return {'has_watermark': True, 'location': location, 'text': line}

        return {'has_watermark': False}

    def _detect_proprietary_content(self, content: str) -> Dict[str, Any]:
        """Detect proprietary or confidential content"""
        proprietary_patterns = [
            re.compile(r'\b(proprietary|confidential|internal use only|do not distribute|restricted)\b', re.IGNORECASE),
            re.compile(r'\b(©|copyright)\s+\d{4}\s+(?:all\s+rights\s+reserved|unauthorized)\b', re.IGNORECASE),
        ]

        matches = []
        is_proprietary = False

        for pattern in proprietary_patterns:
            found = pattern.findall(content)
            if found:
                matches.extend(found)
                is_proprietary = True

        return {'is_proprietary': is_proprietary, 'matches': matches}

    def _is_licensed_source(self, source_name: Optional[str], exclude_list: List[str] = None) -> bool:
        """Check if source is a known licensed/public domain source"""
        if not source_name:
            return False

        source_lower = source_name.lower()
        all_licensed = self.known_licensed_sources + (exclude_list or [])

        return any(licensed.lower() in source_lower for licensed in all_licensed)

    def _is_public_domain(self, metadata: Optional[Dict[str, Any]]) -> bool:
        """Check if content is likely public domain"""
        if metadata and metadata.get('license'):
            license_lower = metadata['license'].lower()
            if 'public domain' in license_lower or 'cc0' in license_lower:
                return True

        # Government sources are often public domain
        if metadata and metadata.get('source_name'):
            gov_sources = ['government', 'gov', 'federal', 'public domain']
            return any(gov in metadata['source_name'].lower() for gov in gov_sources)

        return False

    def _calculate_confidence(
        self,
        issues: List[Dict[str, Any]],
        has_copyright_notice: bool,
        is_licensed: bool
    ) -> float:
        """Calculate confidence score for copyright check"""
        if not issues and not has_copyright_notice:
            return 0.9  # High confidence if no issues

        if is_licensed and not issues:
            return 0.85  # High confidence for licensed sources

        if has_copyright_notice and not is_licensed and issues:
            return 0.4  # Low confidence - needs review

        # Default confidence based on issue count
        base_confidence = max(0.3, 1 - len(issues) * 0.15)
        return min(0.8, base_confidence)

    def generate_copyright_notice(
        self,
        source_name: str,
        year: Optional[int] = None,
        license: Optional[str] = None
    ) -> str:
        """Generate copyright notice text for metadata"""
        year_str = str(year) if year else str(datetime.now().year)

        if license:
            return f"© {year_str} {source_name}. Licensed under {license}."

        return f"© {year_str} {source_name}. All rights reserved."

