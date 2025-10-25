"""
VITAL Path Security Framework
Comprehensive security implementation for healthcare AI platform
"""

from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass, asdict, field
from enum import Enum
from datetime import datetime, timedelta
import asyncio
import json
import logging
import hashlib
import uuid
import hmac
import secrets
import jwt
from abc import ABC, abstractmethod
import ipaddress
import re
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.serialization import Encoding, PrivateFormat, NoEncryption, PublicFormat
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import os
import time

logger = logging.getLogger(__name__)

class SecurityEventType(str, Enum):
    AUTHENTICATION_SUCCESS = "auth_success"
    AUTHENTICATION_FAILURE = "auth_failure"
    AUTHORIZATION_SUCCESS = "authz_success"
    AUTHORIZATION_FAILURE = "authz_failure"
    SESSION_CREATED = "session_created"
    SESSION_TERMINATED = "session_terminated"
    PRIVILEGE_ESCALATION = "privilege_escalation"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    SECURITY_BREACH = "security_breach"
    DATA_ACCESS_ANOMALY = "data_access_anomaly"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    MALICIOUS_REQUEST = "malicious_request"

class ThreatLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class UserRole(str, Enum):
    PATIENT = "patient"
    PHYSICIAN = "physician"
    NURSE = "nurse"
    ADMIN = "admin"
    RESEARCHER = "researcher"
    SYSTEM = "system"
    AUDITOR = "auditor"

class Permission(str, Enum):
    READ_PATIENT_DATA = "read_patient_data"
    WRITE_PATIENT_DATA = "write_patient_data"
    DELETE_PATIENT_DATA = "delete_patient_data"
    EXPORT_DATA = "export_data"
    ADMIN_SYSTEM = "admin_system"
    AUDIT_LOGS = "audit_logs"
    MANAGE_USERS = "manage_users"
    CLINICAL_VALIDATION = "clinical_validation"
    AI_MODEL_ACCESS = "ai_model_access"

@dataclass
class SecurityEvent:
    event_id: str
    event_type: SecurityEventType
    timestamp: datetime
    user_id: Optional[str]
    session_id: Optional[str]
    ip_address: str
    user_agent: str
    resource: Optional[str]
    action: str
    outcome: str
    threat_level: ThreatLevel
    details: Dict[str, Any]
    geographic_location: Optional[str] = None
    device_fingerprint: Optional[str] = None

@dataclass
class User:
    user_id: str
    username: str
    email: str
    role: UserRole
    permissions: List[Permission]
    created_at: datetime
    last_login: Optional[datetime]
    failed_login_attempts: int = 0
    account_locked: bool = False
    mfa_enabled: bool = False
    password_hash: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class Session:
    session_id: str
    user_id: str
    created_at: datetime
    expires_at: datetime
    ip_address: str
    user_agent: str
    active: bool = True
    last_activity: Optional[datetime] = None
    security_level: str = "standard"
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class AccessAttempt:
    attempt_id: str
    user_id: Optional[str]
    ip_address: str
    timestamp: datetime
    resource: str
    action: str
    success: bool
    failure_reason: Optional[str] = None
    risk_score: float = 0.0

class PasswordValidator:
    def __init__(self):
        self.min_length = 12
        self.require_uppercase = True
        self.require_lowercase = True
        self.require_numbers = True
        self.require_special = True
        self.common_passwords = self._load_common_passwords()

    def _load_common_passwords(self) -> set:
        """Load common passwords to check against"""
        return {
            "password123", "123456789", "qwerty123", "password1",
            "admin123", "welcome123", "changeme123", "healthcare123"
        }

    def validate_password(self, password: str, username: str = None) -> Tuple[bool, List[str]]:
        """Validate password strength"""
        issues = []

        if len(password) < self.min_length:
            issues.append(f"Password must be at least {self.min_length} characters long")

        if self.require_uppercase and not re.search(r'[A-Z]', password):
            issues.append("Password must contain at least one uppercase letter")

        if self.require_lowercase and not re.search(r'[a-z]', password):
            issues.append("Password must contain at least one lowercase letter")

        if self.require_numbers and not re.search(r'\d', password):
            issues.append("Password must contain at least one number")

        if self.require_special and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            issues.append("Password must contain at least one special character")

        if password.lower() in self.common_passwords:
            issues.append("Password is too common")

        if username and username.lower() in password.lower():
            issues.append("Password cannot contain username")

        return len(issues) == 0, issues

class MFAManager:
    def __init__(self):
        self.totp_secrets: Dict[str, str] = {}

    def generate_totp_secret(self, user_id: str) -> str:
        """Generate TOTP secret for user"""
        secret = secrets.token_urlsafe(32)
        self.totp_secrets[user_id] = secret
        return secret

    def verify_totp(self, user_id: str, token: str, window: int = 1) -> bool:
        """Verify TOTP token"""
        if user_id not in self.totp_secrets:
            return False

        secret = self.totp_secrets[user_id]
        current_time = int(time.time() // 30)

        for i in range(-window, window + 1):
            test_time = current_time + i
            expected_token = self._generate_totp_token(secret, test_time)
            if hmac.compare_digest(token, expected_token):
                return True

        return False

    def _generate_totp_token(self, secret: str, time_step: int) -> str:
        """Generate TOTP token for given time step"""
        key = secret.encode('utf-8')
        time_bytes = time_step.to_bytes(8, 'big')

        hmac_hash = hmac.new(key, time_bytes, hashlib.sha1).digest()
        offset = hmac_hash[-1] & 0x0f
        token_int = int.from_bytes(hmac_hash[offset:offset+4], 'big') & 0x7fffffff
        token = str(token_int % 1000000).zfill(6)

        return token

class RiskAssessment:
    def __init__(self):
        self.ip_whitelist = set()
        self.ip_blacklist = set()
        self.known_bad_user_agents = {
            'sqlmap', 'nikto', 'burpsuite', 'nmap', 'masscan'
        }

    def assess_login_risk(self, user_id: str, ip_address: str, user_agent: str,
                         previous_logins: List[AccessAttempt]) -> float:
        """Assess risk for login attempt"""
        risk_score = 0.0

        # Check IP reputation
        if ip_address in self.ip_blacklist:
            risk_score += 0.8

        if ip_address in self.ip_whitelist:
            risk_score -= 0.2

        # Check geographic location consistency
        if previous_logins:
            recent_ips = {attempt.ip_address for attempt in previous_logins[-10:]}
            if ip_address not in recent_ips:
                risk_score += 0.3

        # Check user agent
        if any(bad_agent in user_agent.lower() for bad_agent in self.known_bad_user_agents):
            risk_score += 0.6

        # Check time patterns
        if previous_logins:
            last_login = max(previous_logins, key=lambda x: x.timestamp)
            time_diff = (datetime.now() - last_login.timestamp).total_seconds()

            # Suspicious if login immediately after failed attempt
            if time_diff < 60 and not last_login.success:
                risk_score += 0.4

            # Suspicious if login at unusual hours
            current_hour = datetime.now().hour
            if current_hour < 6 or current_hour > 22:  # Outside business hours
                risk_score += 0.2

        # Check failure rate
        recent_failures = sum(1 for attempt in previous_logins[-20:]
                            if not attempt.success and attempt.user_id == user_id)
        if recent_failures > 3:
            risk_score += min(0.5, recent_failures * 0.1)

        return min(1.0, max(0.0, risk_score))

    def detect_anomalies(self, user_id: str, current_session: Session,
                        historical_sessions: List[Session]) -> List[str]:
        """Detect behavioral anomalies"""
        anomalies = []

        if not historical_sessions:
            return anomalies

        # Check for unusual IP addresses
        usual_ips = {session.ip_address for session in historical_sessions[-50:]}
        if current_session.ip_address not in usual_ips:
            anomalies.append("login_from_new_ip")

        # Check for unusual user agents
        usual_agents = {session.user_agent for session in historical_sessions[-20:]}
        if current_session.user_agent not in usual_agents:
            anomalies.append("new_user_agent")

        # Check session duration patterns
        avg_duration = sum((s.expires_at - s.created_at).total_seconds()
                         for s in historical_sessions[-10:]) / min(10, len(historical_sessions))

        expected_duration = (current_session.expires_at - current_session.created_at).total_seconds()
        if expected_duration > avg_duration * 2:
            anomalies.append("unusually_long_session")

        # Check login frequency
        recent_sessions = [s for s in historical_sessions
                         if (datetime.now() - s.created_at).days <= 7]
        avg_daily_logins = len(recent_sessions) / 7

        today_sessions = [s for s in historical_sessions
                         if s.created_at.date() == datetime.now().date()]
        if len(today_sessions) > avg_daily_logins * 3:
            anomalies.append("unusual_login_frequency")

        return anomalies

class SecurityManager:
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.sessions: Dict[str, Session] = {}
        self.access_attempts: List[AccessAttempt] = []
        self.security_events: List[SecurityEvent] = []
        self.password_validator = PasswordValidator()
        self.mfa_manager = MFAManager()
        self.risk_assessment = RiskAssessment()
        self.failed_attempts: Dict[str, List[datetime]] = {}
        self.locked_accounts: Dict[str, datetime] = {}

    async def create_user(self, username: str, email: str, password: str,
                         role: UserRole) -> Tuple[bool, str]:
        """Create a new user account"""
        try:
            # Validate password
            is_valid, issues = self.password_validator.validate_password(password, username)
            if not is_valid:
                return False, f"Password validation failed: {'; '.join(issues)}"

            # Check if user already exists
            existing_user = next((u for u in self.users.values()
                                if u.username == username or u.email == email), None)
            if existing_user:
                return False, "User already exists"

            # Hash password
            password_hash = self._hash_password(password)

            # Create user
            user_id = str(uuid.uuid4())
            permissions = self._get_role_permissions(role)

            user = User(
                user_id=user_id,
                username=username,
                email=email,
                role=role,
                permissions=permissions,
                created_at=datetime.now(),
                last_login=None,
                password_hash=password_hash,
                mfa_enabled=role in [UserRole.ADMIN, UserRole.PHYSICIAN]  # Require MFA for high-privilege roles
            )

            self.users[user_id] = user

            await self._log_security_event(
                SecurityEventType.AUTHENTICATION_SUCCESS,
                user_id=user_id,
                details={"action": "user_created", "role": role.value}
            )

            return True, user_id

        except Exception as e:
            logger.error(f"User creation failed: {e}")
            return False, str(e)

    async def authenticate(self, username: str, password: str, ip_address: str,
                          user_agent: str, mfa_token: Optional[str] = None) -> Tuple[bool, Optional[str], str]:
        """Authenticate user and create session"""
        try:
            # Find user
            user = next((u for u in self.users.values() if u.username == username), None)
            if not user:
                await self._log_security_event(
                    SecurityEventType.AUTHENTICATION_FAILURE,
                    ip_address=ip_address,
                    details={"reason": "user_not_found", "username": username}
                )
                return False, None, "Invalid credentials"

            # Check account lock
            if user.account_locked or user.user_id in self.locked_accounts:
                await self._log_security_event(
                    SecurityEventType.AUTHENTICATION_FAILURE,
                    user_id=user.user_id,
                    ip_address=ip_address,
                    details={"reason": "account_locked"}
                )
                return False, None, "Account locked"

            # Verify password
            if not self._verify_password(password, user.password_hash):
                await self._handle_failed_login(user.user_id, ip_address, user_agent)
                return False, None, "Invalid credentials"

            # Check MFA if enabled
            if user.mfa_enabled:
                if not mfa_token:
                    return False, None, "MFA token required"
                if not self.mfa_manager.verify_totp(user.user_id, mfa_token):
                    await self._handle_failed_login(user.user_id, ip_address, user_agent)
                    return False, None, "Invalid MFA token"

            # Risk assessment
            previous_attempts = [a for a in self.access_attempts if a.user_id == user.user_id]
            risk_score = self.risk_assessment.assess_login_risk(
                user.user_id, ip_address, user_agent, previous_attempts
            )

            # High-risk logins may require additional verification
            if risk_score > 0.7:
                await self._log_security_event(
                    SecurityEventType.SUSPICIOUS_ACTIVITY,
                    user_id=user.user_id,
                    ip_address=ip_address,
                    details={"risk_score": risk_score, "action": "high_risk_login"}
                )
                return False, None, "Additional verification required for high-risk login"

            # Create session
            session = await self._create_session(user, ip_address, user_agent)

            # Update user login info
            user.last_login = datetime.now()
            user.failed_login_attempts = 0

            # Clear failed attempts for this user
            if user.user_id in self.failed_attempts:
                del self.failed_attempts[user.user_id]

            await self._log_security_event(
                SecurityEventType.AUTHENTICATION_SUCCESS,
                user_id=user.user_id,
                session_id=session.session_id,
                ip_address=ip_address,
                details={"risk_score": risk_score}
            )

            return True, session.session_id, "Authentication successful"

        except Exception as e:
            logger.error(f"Authentication error: {e}")
            await self._log_security_event(
                SecurityEventType.AUTHENTICATION_FAILURE,
                ip_address=ip_address,
                details={"error": str(e)}
            )
            return False, None, "Authentication error"

    async def authorize(self, session_id: str, resource: str, action: str) -> Tuple[bool, str]:
        """Authorize user access to resource"""
        try:
            session = self.sessions.get(session_id)
            if not session or not session.active:
                return False, "Invalid or expired session"

            if session.expires_at <= datetime.now():
                session.active = False
                return False, "Session expired"

            user = self.users.get(session.user_id)
            if not user:
                return False, "User not found"

            # Check permissions
            required_permission = self._get_required_permission(resource, action)
            if required_permission and required_permission not in user.permissions:
                await self._log_security_event(
                    SecurityEventType.AUTHORIZATION_FAILURE,
                    user_id=user.user_id,
                    session_id=session_id,
                    details={"resource": resource, "action": action, "required_permission": required_permission.value}
                )
                return False, "Insufficient permissions"

            # Update session activity
            session.last_activity = datetime.now()

            await self._log_security_event(
                SecurityEventType.AUTHORIZATION_SUCCESS,
                user_id=user.user_id,
                session_id=session_id,
                details={"resource": resource, "action": action}
            )

            return True, "Access authorized"

        except Exception as e:
            logger.error(f"Authorization error: {e}")
            return False, str(e)

    async def terminate_session(self, session_id: str) -> bool:
        """Terminate user session"""
        session = self.sessions.get(session_id)
        if session:
            session.active = False
            await self._log_security_event(
                SecurityEventType.SESSION_TERMINATED,
                user_id=session.user_id,
                session_id=session_id,
                details={"reason": "manual_termination"}
            )
            return True
        return False

    def _get_role_permissions(self, role: UserRole) -> List[Permission]:
        """Get permissions for user role"""
        role_permissions = {
            UserRole.PATIENT: [Permission.READ_PATIENT_DATA],
            UserRole.PHYSICIAN: [
                Permission.READ_PATIENT_DATA,
                Permission.WRITE_PATIENT_DATA,
                Permission.CLINICAL_VALIDATION,
                Permission.AI_MODEL_ACCESS
            ],
            UserRole.NURSE: [
                Permission.READ_PATIENT_DATA,
                Permission.WRITE_PATIENT_DATA
            ],
            UserRole.ADMIN: [
                Permission.READ_PATIENT_DATA,
                Permission.WRITE_PATIENT_DATA,
                Permission.DELETE_PATIENT_DATA,
                Permission.EXPORT_DATA,
                Permission.ADMIN_SYSTEM,
                Permission.MANAGE_USERS,
                Permission.AI_MODEL_ACCESS
            ],
            UserRole.RESEARCHER: [
                Permission.READ_PATIENT_DATA,
                Permission.EXPORT_DATA,
                Permission.AI_MODEL_ACCESS
            ],
            UserRole.AUDITOR: [
                Permission.AUDIT_LOGS,
                Permission.READ_PATIENT_DATA
            ],
            UserRole.SYSTEM: [
                Permission.READ_PATIENT_DATA,
                Permission.WRITE_PATIENT_DATA,
                Permission.AI_MODEL_ACCESS,
                Permission.CLINICAL_VALIDATION
            ]
        }
        return role_permissions.get(role, [])

    def _get_required_permission(self, resource: str, action: str) -> Optional[Permission]:
        """Get required permission for resource action"""
        permission_map = {
            ("patient_data", "read"): Permission.READ_PATIENT_DATA,
            ("patient_data", "write"): Permission.WRITE_PATIENT_DATA,
            ("patient_data", "delete"): Permission.DELETE_PATIENT_DATA,
            ("patient_data", "export"): Permission.EXPORT_DATA,
            ("system", "admin"): Permission.ADMIN_SYSTEM,
            ("users", "manage"): Permission.MANAGE_USERS,
            ("audit", "read"): Permission.AUDIT_LOGS,
            ("clinical", "validate"): Permission.CLINICAL_VALIDATION,
            ("ai_model", "access"): Permission.AI_MODEL_ACCESS,
        }
        return permission_map.get((resource, action))

    def _hash_password(self, password: str) -> str:
        """Hash password using secure method"""
        salt = secrets.token_hex(16)
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return f"{salt}:{password_hash.hex()}"

    def _verify_password(self, password: str, stored_hash: str) -> bool:
        """Verify password against stored hash"""
        try:
            salt, hash_hex = stored_hash.split(':')
            password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
            return hmac.compare_digest(password_hash.hex(), hash_hex)
        except Exception:
            return False

    async def _create_session(self, user: User, ip_address: str, user_agent: str) -> Session:
        """Create new user session"""
        session_id = str(uuid.uuid4())
        expires_at = datetime.now() + timedelta(hours=8)  # 8-hour sessions

        # Determine security level based on role and risk
        security_level = "high" if user.role in [UserRole.ADMIN, UserRole.PHYSICIAN] else "standard"

        session = Session(
            session_id=session_id,
            user_id=user.user_id,
            created_at=datetime.now(),
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent,
            security_level=security_level,
            last_activity=datetime.now()
        )

        self.sessions[session_id] = session

        await self._log_security_event(
            SecurityEventType.SESSION_CREATED,
            user_id=user.user_id,
            session_id=session_id,
            ip_address=ip_address,
            details={"security_level": security_level, "expires_at": expires_at.isoformat()}
        )

        return session

    async def _handle_failed_login(self, user_id: str, ip_address: str, user_agent: str):
        """Handle failed login attempt"""
        now = datetime.now()

        # Track failed attempts
        if user_id not in self.failed_attempts:
            self.failed_attempts[user_id] = []

        self.failed_attempts[user_id].append(now)

        # Clean old attempts (older than 1 hour)
        self.failed_attempts[user_id] = [
            attempt for attempt in self.failed_attempts[user_id]
            if (now - attempt).total_seconds() < 3600
        ]

        # Lock account after 5 failed attempts in 1 hour
        if len(self.failed_attempts[user_id]) >= 5:
            self.locked_accounts[user_id] = now + timedelta(hours=1)
            user = self.users.get(user_id)
            if user:
                user.account_locked = True

            await self._log_security_event(
                SecurityEventType.SUSPICIOUS_ACTIVITY,
                user_id=user_id,
                ip_address=ip_address,
                details={"action": "account_locked", "failed_attempts": len(self.failed_attempts[user_id])}
            )

        await self._log_security_event(
            SecurityEventType.AUTHENTICATION_FAILURE,
            user_id=user_id,
            ip_address=ip_address,
            details={"failed_attempts": len(self.failed_attempts[user_id])}
        )

    async def _log_security_event(self, event_type: SecurityEventType, user_id: str = None,
                                session_id: str = None, ip_address: str = "unknown",
                                user_agent: str = "unknown", details: Dict[str, Any] = None):
        """Log security event"""
        event = SecurityEvent(
            event_id=str(uuid.uuid4()),
            event_type=event_type,
            timestamp=datetime.now(),
            user_id=user_id,
            session_id=session_id,
            ip_address=ip_address,
            user_agent=user_agent,
            resource=details.get("resource") if details else None,
            action=details.get("action", "unknown") if details else "unknown",
            outcome=details.get("outcome", "unknown") if details else "unknown",
            threat_level=self._calculate_threat_level(event_type, details),
            details=details or {}
        )

        self.security_events.append(event)
        logger.info(f"Security event: {event_type} for user {user_id}")

    def _calculate_threat_level(self, event_type: SecurityEventType, details: Dict[str, Any] = None) -> ThreatLevel:
        """Calculate threat level for security event"""
        high_threat_events = {
            SecurityEventType.SECURITY_BREACH,
            SecurityEventType.PRIVILEGE_ESCALATION,
            SecurityEventType.MALICIOUS_REQUEST
        }

        medium_threat_events = {
            SecurityEventType.SUSPICIOUS_ACTIVITY,
            SecurityEventType.DATA_ACCESS_ANOMALY,
            SecurityEventType.AUTHORIZATION_FAILURE
        }

        if event_type in high_threat_events:
            return ThreatLevel.CRITICAL

        if event_type in medium_threat_events:
            return ThreatLevel.HIGH

        if event_type == SecurityEventType.AUTHENTICATION_FAILURE:
            if details and details.get("failed_attempts", 0) > 3:
                return ThreatLevel.HIGH
            return ThreatLevel.MEDIUM

        return ThreatLevel.LOW

    async def get_security_dashboard(self) -> Dict[str, Any]:
        """Get security dashboard data"""
        recent_events = [e for e in self.security_events
                        if (datetime.now() - e.timestamp).days <= 7]

        return {
            "active_sessions": len([s for s in self.sessions.values() if s.active]),
            "total_users": len(self.users),
            "locked_accounts": len(self.locked_accounts),
            "recent_events": len(recent_events),
            "threat_levels": {
                "critical": len([e for e in recent_events if e.threat_level == ThreatLevel.CRITICAL]),
                "high": len([e for e in recent_events if e.threat_level == ThreatLevel.HIGH]),
                "medium": len([e for e in recent_events if e.threat_level == ThreatLevel.MEDIUM]),
                "low": len([e for e in recent_events if e.threat_level == ThreatLevel.LOW])
            },
            "authentication_stats": {
                "successful": len([e for e in recent_events
                                 if e.event_type == SecurityEventType.AUTHENTICATION_SUCCESS]),
                "failed": len([e for e in recent_events
                             if e.event_type == SecurityEventType.AUTHENTICATION_FAILURE])
            },
            "generated_at": datetime.now()
        }

# Global security manager instance
security_manager = SecurityManager()