"""
Data Sanitization Service
Removes PII, PHI, and sensitive data to ensure compliance
"""

import re
import hashlib
from typing import Dict, Any, List, Optional
import structlog

logger = structlog.get_logger()

class DataSanitizer:
    """Sanitizes content to remove PII, PHI, and sensitive data"""

    def __init__(self):
        # PII Patterns
        self.email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
        self.phone_pattern = re.compile(r'\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b')
        self.ssn_pattern = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')
        self.credit_card_pattern = re.compile(r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b')
        self.ip_address_pattern = re.compile(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b')

        # PHI Patterns (Healthcare)
        self.mrn_pattern = re.compile(r'\bMRN:?\s*\d{6,}\b', re.IGNORECASE)
        self.dob_pattern = re.compile(r'\b(?:dob|date of birth|birth date):\s*\d{1,2}[-/]\d{1,2}[-/]\d{4}\b', re.IGNORECASE)
        self.license_plate_pattern = re.compile(r'\b[A-Z]{1,3}\s?\d{1,4}\s?[A-Z]{0,2}\b')

        # Address Patterns
        self.address_pattern = re.compile(r'\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Plaza|Pl|Way)\b', re.IGNORECASE)

        # Name Patterns
        self.name_pattern = re.compile(r'\b(?:Mr|Ms|Mrs|Dr|Prof)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b')

    async def sanitize_content(
        self,
        content: str,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Sanitize content to remove PII, PHI, and sensitive data"""
        options = options or {}
        
        remove_pii = options.get('remove_pii', True)
        remove_phi = options.get('remove_phi', True)
        remove_credit_cards = options.get('remove_credit_cards', True)
        remove_ssn = options.get('remove_ssn', True)
        remove_email = options.get('remove_email', True)
        remove_phone = options.get('remove_phone', True)
        remove_address = options.get('remove_address', True)
        remove_names = options.get('remove_names', False)  # More conservative
        redaction_mode = options.get('redaction_mode', 'mask')
        log_removals = options.get('log_removals', True)

        sanitized_content = content
        removed_content: List[Dict[str, Any]] = []
        pii_detected: List[Dict[str, Any]] = []
        risk_level = 'none'

        # Detect and remove emails
        if remove_email or remove_pii:
            email_matches = self.email_pattern.findall(content)
            for email in email_matches:
                pii_detected.append({
                    'type': 'email',
                    'confidence': 0.95,
                    'location': self._find_location(content, email),
                    'snippet': email,
                    'severity': 'medium',
                })
                sanitized_content = self._redact_content(
                    sanitized_content, email, '[EMAIL REDACTED]', redaction_mode,
                    removed_content, 'email'
                )

        # Detect and remove phone numbers
        if remove_phone or remove_pii:
            phone_matches = self.phone_pattern.findall(content)
            for phone_match in phone_matches:
                phone = ''.join(phone_match) if isinstance(phone_match, tuple) else phone_match
                pii_detected.append({
                    'type': 'phone',
                    'confidence': 0.9,
                    'location': self._find_location(content, phone),
                    'snippet': phone,
                    'severity': 'medium',
                })
                sanitized_content = self._redact_content(
                    sanitized_content, phone, '[PHONE REDACTED]', redaction_mode,
                    removed_content, 'phone'
                )

        # Detect and remove SSN
        if remove_ssn or remove_pii:
            ssn_matches = self.ssn_pattern.findall(content)
            for ssn in ssn_matches:
                pii_detected.append({
                    'type': 'ssn',
                    'confidence': 0.98,
                    'location': self._find_location(content, ssn),
                    'snippet': ssn,
                    'severity': 'critical',
                })
                sanitized_content = self._redact_content(
                    sanitized_content, ssn, '[SSN REDACTED]', redaction_mode,
                    removed_content, 'ssn'
                )

        # Detect and remove credit cards
        if remove_credit_cards or remove_pii:
            card_matches = self.credit_card_pattern.findall(content)
            for card in card_matches:
                pii_detected.append({
                    'type': 'credit_card',
                    'confidence': 0.85,
                    'location': self._find_location(content, card),
                    'snippet': self._mask_card(card),
                    'severity': 'critical',
                })
                sanitized_content = self._redact_content(
                    sanitized_content, card, '[CREDIT CARD REDACTED]', redaction_mode,
                    removed_content, 'credit_card'
                )

        # Detect and remove MRN (Medical Record Number) - PHI
        if remove_phi:
            mrn_matches = self.mrn_pattern.findall(content)
            for mrn in mrn_matches:
                pii_detected.append({
                    'type': 'mrn',
                    'confidence': 0.95,
                    'location': self._find_location(content, mrn),
                    'snippet': mrn,
                    'severity': 'critical',
                })
                sanitized_content = self._redact_content(
                    sanitized_content, mrn, '[MRN REDACTED]', redaction_mode,
                    removed_content, 'phi'
                )

            # Detect and remove DOB
            dob_matches = self.dob_pattern.findall(content)
            for dob in dob_matches:
                pii_detected.append({
                    'type': 'dob',
                    'confidence': 0.9,
                    'location': self._find_location(content, dob),
                    'snippet': dob,
                    'severity': 'high',
                })
                sanitized_content = self._redact_content(
                    sanitized_content, dob, '[DATE OF BIRTH REDACTED]', redaction_mode,
                    removed_content, 'phi'
                )

        # Detect and remove IP addresses
        if remove_pii:
            ip_matches = self.ip_address_pattern.findall(content)
            for ip in ip_matches:
                # Filter out common non-PII IPs
                if not (ip.startswith('127.') or ip.startswith('192.168.') or ip.startswith('10.')):
                    pii_detected.append({
                        'type': 'ip_address',
                        'confidence': 0.8,
                        'location': self._find_location(content, ip),
                        'snippet': ip,
                        'severity': 'medium',
                    })
                    sanitized_content = self._redact_content(
                        sanitized_content, ip, '[IP ADDRESS REDACTED]', redaction_mode,
                        removed_content, 'ip_address'
                    )

        # Detect and remove addresses
        if remove_address or remove_pii:
            address_matches = self.address_pattern.findall(content)
            for address in address_matches:
                pii_detected.append({
                    'type': 'address',
                    'confidence': 0.75,
                    'location': self._find_location(content, address),
                    'snippet': address,
                    'severity': 'high',
                })
                sanitized_content = self._redact_content(
                    sanitized_content, address, '[ADDRESS REDACTED]', redaction_mode,
                    removed_content, 'address'
                )

        # Detect names (optional)
        if remove_names:
            name_matches = self.name_pattern.findall(content)
            for name in name_matches:
                # Don't redact common titles in citations
                if not any(title in name for title in ['Dr.', 'Prof.', 'Mr.', 'Ms.']):
                    sanitized_content = self._redact_content(
                        sanitized_content, name, '[NAME REDACTED]', redaction_mode,
                        removed_content, 'name'
                    )

        # Determine risk level
        critical_count = len([p for p in pii_detected if p['severity'] == 'critical'])
        high_count = len([p for p in pii_detected if p['severity'] == 'high'])

        if critical_count > 0:
            risk_level = 'critical'
        elif high_count > 2:
            risk_level = 'high'
        elif len(pii_detected) > 5:
            risk_level = 'medium'
        elif pii_detected:
            risk_level = 'low'

        needs_review = risk_level in ['critical', 'high'] or critical_count > 0

        return {
            'sanitized': len(removed_content) > 0,
            'original_length': len(content),
            'sanitized_length': len(sanitized_content),
            'removed_content': removed_content if log_removals else [],
            'pii_detected': pii_detected,
            'risk_level': risk_level,
            'sanitized_content': sanitized_content,
            'needs_review': needs_review,
        }

    def _redact_content(
        self,
        content: str,
        original: str,
        replacement: str,
        mode: str,
        removed_content: List[Dict[str, Any]],
        pii_type: str
    ) -> str:
        """Redact content based on mode"""
        final_replacement = replacement

        if mode == 'remove':
            final_replacement = ''
        elif mode == 'hash':
            final_replacement = f'[{pii_type.upper()}_HASH:{self._hash_string(original)}]'

        new_content = content.replace(original, final_replacement)

        removed_content.append({
            'type': pii_type,
            'location': self._find_location(content, original),
            'original_text': original[:50] + '...' if len(original) > 50 else original,
            'replacement': final_replacement,
            'severity': self._get_severity_for_type(pii_type),
        })

        return new_content

    def _find_location(self, content: str, text: str) -> str:
        """Find approximate location of text in content"""
        index = content.find(text)
        if index == -1:
            return 'unknown'

        # Calculate approximate line number
        line_number = content[:index].count('\n') + 1
        char_in_line = index - content[:index].rfind('\n')

        return f'Line {line_number}, character {char_in_line}'

    def _get_severity_for_type(self, pii_type: str) -> str:
        """Get severity for PII type"""
        critical_types = ['ssn', 'credit_card', 'mrn', 'phi']
        high_types = ['address', 'dob']
        medium_types = ['email', 'phone']

        if pii_type in critical_types:
            return 'critical'
        if pii_type in high_types:
            return 'high'
        if pii_type in medium_types:
            return 'medium'
        return 'low'

    def _mask_card(self, card: str) -> str:
        """Mask credit card (show only last 4 digits)"""
        digits = re.sub(r'\D', '', card)
        if len(digits) >= 4:
            return '****-****-****-' + digits[-4:]
        return '****'

    def _hash_string(self, text: str) -> str:
        """Hash string for reference tracking"""
        # Simple hash - in production, use hashlib for better security
        hash_obj = hashlib.md5(text.encode())
        return hash_obj.hexdigest()[:8]


# Export singleton instance
def create_data_sanitizer() -> DataSanitizer:
    """Create data sanitizer instance"""
    return DataSanitizer()

