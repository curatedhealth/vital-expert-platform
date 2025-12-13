"""
Input Validation for VITAL AI Engine.

Production-grade validation for:
- UUIDs (agent_id, session_id, organization_id, user_id)
- Tool names and configurations
- Domain/namespace identifiers
- Message content and structure
- Request payloads

This module provides:
- Validators with detailed error messages
- Decorators for automatic validation
- Pydantic-compatible validators
- Async validation support

SECURITY: All user inputs should pass through these validators
before being used in database queries or LLM calls.
"""

from typing import Any, Callable, Dict, List, Optional, Set, TypeVar, Union
from dataclasses import dataclass, field
from enum import Enum
from functools import wraps
import re
import uuid
import structlog

logger = structlog.get_logger()

T = TypeVar("T")


# ============================================================================
# Validation Exceptions
# ============================================================================

class ValidationError(Exception):
    """Base validation error with structured details."""

    def __init__(
        self,
        message: str,
        field: Optional[str] = None,
        value: Optional[Any] = None,
        code: str = "VALIDATION_ERROR",
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.field = field
        self.value = value
        self.code = code
        self.details = details or {}
        super().__init__(message)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to API response format."""
        return {
            "error": self.code,
            "message": self.message,
            "field": self.field,
            "details": self.details,
        }


class InvalidUUIDError(ValidationError):
    """Invalid UUID format."""

    def __init__(self, field: str, value: Any):
        super().__init__(
            message=f"Invalid UUID format for '{field}': {value}",
            field=field,
            value=value,
            code="INVALID_UUID",
        )


class InvalidToolError(ValidationError):
    """Invalid tool name or configuration."""

    def __init__(self, tool_name: str, reason: str):
        super().__init__(
            message=f"Invalid tool '{tool_name}': {reason}",
            field="tool",
            value=tool_name,
            code="INVALID_TOOL",
            details={"reason": reason},
        )


class InvalidDomainError(ValidationError):
    """Invalid domain/namespace identifier."""

    def __init__(self, domain: str, allowed: Optional[List[str]] = None):
        details = {"allowed_domains": allowed} if allowed else {}
        super().__init__(
            message=f"Invalid domain: '{domain}'",
            field="domain",
            value=domain,
            code="INVALID_DOMAIN",
            details=details,
        )


class InvalidMessageError(ValidationError):
    """Invalid message content or structure."""

    def __init__(self, reason: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=f"Invalid message: {reason}",
            field="message",
            code="INVALID_MESSAGE",
            details=details or {},
        )


class RateLimitError(ValidationError):
    """Rate limit exceeded."""

    def __init__(self, limit: int, window: str, retry_after: Optional[int] = None):
        details = {"limit": limit, "window": window}
        if retry_after:
            details["retry_after_seconds"] = retry_after
        super().__init__(
            message=f"Rate limit exceeded: {limit} requests per {window}",
            code="RATE_LIMIT_EXCEEDED",
            details=details,
        )


class ContentPolicyError(ValidationError):
    """Content violates policy."""

    def __init__(self, reason: str, policy_code: str):
        super().__init__(
            message=f"Content policy violation: {reason}",
            code="CONTENT_POLICY_VIOLATION",
            details={"policy_code": policy_code},
        )


# ============================================================================
# UUID Validation
# ============================================================================

UUID_PATTERN = re.compile(
    r'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
    re.IGNORECASE
)


def is_valid_uuid(value: Any) -> bool:
    """
    Check if value is a valid UUID.

    Accepts:
    - UUID objects
    - Valid UUID strings (with or without hyphens)

    Rejects:
    - None (Python None)
    - "None" (string literal - common serialization artifact)
    - "null" (JSON null serialized as string)
    - "undefined" (JavaScript undefined serialized as string)
    - Empty strings
    """
    if value is None:
        return False

    if isinstance(value, uuid.UUID):
        return True

    if not isinstance(value, str):
        return False

    # Reject common string representations of null values
    if value in ("None", "null", "undefined", ""):
        return False

    # Remove hyphens and check format
    clean = value.replace("-", "")
    if len(clean) != 32:
        return False

    try:
        uuid.UUID(value)
        return True
    except (ValueError, AttributeError):
        return False


def validate_uuid(value: Any, field_name: str = "id") -> uuid.UUID:
    """
    Validate and convert to UUID.

    Args:
        value: Value to validate (string or UUID)
        field_name: Field name for error messages

    Returns:
        uuid.UUID object

    Raises:
        InvalidUUIDError: If value is not a valid UUID
    """
    if value is None:
        raise InvalidUUIDError(field_name, value)

    if isinstance(value, uuid.UUID):
        return value

    if not isinstance(value, str):
        raise InvalidUUIDError(field_name, value)

    try:
        return uuid.UUID(value)
    except (ValueError, AttributeError):
        raise InvalidUUIDError(field_name, value)


def validate_uuid_optional(value: Any, field_name: str = "id") -> Optional[uuid.UUID]:
    """Validate UUID, returning None if value is None or empty."""
    if value is None or (isinstance(value, str) and not value.strip()):
        return None
    return validate_uuid(value, field_name)


def validate_uuids(values: List[Any], field_name: str = "ids") -> List[uuid.UUID]:
    """Validate a list of UUIDs."""
    if not values:
        return []
    return [validate_uuid(v, f"{field_name}[{i}]") for i, v in enumerate(values)]


# ============================================================================
# Tool Validation
# ============================================================================

# Allowed tool categories
class ToolCategory(str, Enum):
    RAG = "rag"
    WEB_SEARCH = "web_search"
    DATABASE = "database"
    CODE = "code"
    ANALYSIS = "analysis"
    COMMUNICATION = "communication"
    DOCUMENT = "document"
    EXTERNAL_API = "external_api"


# Built-in tool names (whitelisted)
BUILTIN_TOOLS: Set[str] = {
    # RAG tools
    "vector_search",
    "semantic_search",
    "knowledge_base_query",
    "document_retrieval",

    # Web search tools
    "tavily_search",
    "web_search",
    "pubmed_search",
    "clinicaltrials_search",
    "google_scholar_search",

    # Database tools
    "sql_query",
    "structured_query",

    # Analysis tools
    "data_analysis",
    "statistical_analysis",
    "summarization",
    "entity_extraction",

    # Document tools
    "pdf_parser",
    "document_generator",
    "citation_formatter",

    # Code tools
    "code_interpreter",
    "python_executor",
}

# Tool name pattern (alphanumeric, underscore, hyphen)
TOOL_NAME_PATTERN = re.compile(r'^[a-z][a-z0-9_-]{1,63}$', re.IGNORECASE)


def is_valid_tool_name(name: str) -> bool:
    """Check if tool name follows naming conventions."""
    if not name or not isinstance(name, str):
        return False
    return bool(TOOL_NAME_PATTERN.match(name))


def validate_tool_name(name: str, allow_custom: bool = True) -> str:
    """
    Validate tool name.

    Args:
        name: Tool name to validate
        allow_custom: Whether to allow custom (non-builtin) tools

    Returns:
        Validated tool name (lowercase)

    Raises:
        InvalidToolError: If tool name is invalid
    """
    if not name or not isinstance(name, str):
        raise InvalidToolError(str(name), "Tool name must be a non-empty string")

    name = name.strip().lower()

    if not TOOL_NAME_PATTERN.match(name):
        raise InvalidToolError(
            name,
            "Tool name must start with a letter and contain only letters, "
            "numbers, underscores, and hyphens (max 64 chars)"
        )

    if not allow_custom and name not in BUILTIN_TOOLS:
        raise InvalidToolError(name, f"Unknown tool. Allowed: {', '.join(sorted(BUILTIN_TOOLS))}")

    return name


def validate_tool_config(config: Dict[str, Any], tool_name: str) -> Dict[str, Any]:
    """
    Validate tool configuration.

    Args:
        config: Tool configuration dictionary
        tool_name: Name of the tool

    Returns:
        Validated configuration

    Raises:
        InvalidToolError: If configuration is invalid
    """
    if not isinstance(config, dict):
        raise InvalidToolError(tool_name, "Configuration must be a dictionary")

    # Check for dangerous keys (prevent injection)
    dangerous_keys = {"__class__", "__import__", "eval", "exec", "compile"}
    found = dangerous_keys.intersection(config.keys())
    if found:
        raise InvalidToolError(tool_name, f"Forbidden configuration keys: {found}")

    # Validate nested objects depth (prevent DoS via deeply nested objects)
    def check_depth(obj: Any, depth: int = 0, max_depth: int = 10) -> None:
        if depth > max_depth:
            raise InvalidToolError(tool_name, f"Configuration too deeply nested (max {max_depth} levels)")
        if isinstance(obj, dict):
            for v in obj.values():
                check_depth(v, depth + 1, max_depth)
        elif isinstance(obj, list):
            for v in obj:
                check_depth(v, depth + 1, max_depth)

    check_depth(config)

    return config


# ============================================================================
# Domain/Namespace Validation
# ============================================================================

# Valid knowledge domains for VITAL
VALID_DOMAINS: Set[str] = {
    # Medical Affairs
    "medical_affairs",
    "medical_information",
    "medical_education",
    "field_medical",
    "publications",
    "scientific_communications",
    "kol_engagement",

    # Regulatory
    "regulatory_affairs",
    "regulatory_strategy",
    "regulatory_submissions",
    "labeling",
    "pharmacovigilance",

    # Clinical
    "clinical_operations",
    "clinical_trials",
    "clinical_data",
    "biostatistics",

    # Commercial
    "commercial",
    "market_access",
    "health_economics",
    "pricing_reimbursement",

    # Research
    "research_development",
    "discovery",
    "preclinical",

    # Quality & Compliance
    "quality_assurance",
    "compliance",
    "legal",

    # General
    "general",
    "cross_functional",
}

DOMAIN_PATTERN = re.compile(r'^[a-z][a-z0-9_]{1,63}$')


def is_valid_domain(domain: str) -> bool:
    """Check if domain identifier is valid."""
    if not domain or not isinstance(domain, str):
        return False
    return bool(DOMAIN_PATTERN.match(domain.lower()))


def validate_domain(
    domain: str,
    allowed: Optional[Set[str]] = None,
    strict: bool = False
) -> str:
    """
    Validate domain/namespace identifier.

    Args:
        domain: Domain to validate
        allowed: Set of allowed domains (defaults to VALID_DOMAINS)
        strict: If True, domain must be in allowed set

    Returns:
        Validated domain (lowercase)

    Raises:
        InvalidDomainError: If domain is invalid
    """
    if not domain or not isinstance(domain, str):
        raise InvalidDomainError(str(domain))

    domain = domain.strip().lower()

    if not DOMAIN_PATTERN.match(domain):
        raise InvalidDomainError(domain)

    allowed_domains = allowed or VALID_DOMAINS

    if strict and domain not in allowed_domains:
        raise InvalidDomainError(domain, list(allowed_domains))

    return domain


def validate_domains(
    domains: List[str],
    allowed: Optional[Set[str]] = None,
    strict: bool = False
) -> List[str]:
    """Validate a list of domains."""
    if not domains:
        return []
    return [validate_domain(d, allowed, strict) for d in domains]


# ============================================================================
# Message Content Validation
# ============================================================================

@dataclass
class MessageLimits:
    """Configuration for message validation limits."""
    min_length: int = 1
    max_length: int = 100_000  # ~25K tokens at 4 chars/token
    max_messages: int = 100
    max_role_length: int = 50
    allowed_roles: Set[str] = field(default_factory=lambda: {"user", "assistant", "system", "tool"})


DEFAULT_MESSAGE_LIMITS = MessageLimits()


def validate_message_content(
    content: str,
    limits: Optional[MessageLimits] = None
) -> str:
    """
    Validate message content.

    Args:
        content: Message content to validate
        limits: Validation limits

    Returns:
        Validated content (stripped)

    Raises:
        InvalidMessageError: If content is invalid
    """
    limits = limits or DEFAULT_MESSAGE_LIMITS

    if not isinstance(content, str):
        raise InvalidMessageError("Content must be a string")

    content = content.strip()

    if len(content) < limits.min_length:
        raise InvalidMessageError(
            f"Message too short (min {limits.min_length} characters)",
            {"actual_length": len(content), "min_length": limits.min_length}
        )

    if len(content) > limits.max_length:
        raise InvalidMessageError(
            f"Message too long (max {limits.max_length} characters)",
            {"actual_length": len(content), "max_length": limits.max_length}
        )

    return content


def validate_message(
    message: Dict[str, Any],
    limits: Optional[MessageLimits] = None
) -> Dict[str, Any]:
    """
    Validate a single message object.

    Expected format: {"role": "user", "content": "..."}

    Args:
        message: Message dictionary
        limits: Validation limits

    Returns:
        Validated message

    Raises:
        InvalidMessageError: If message is invalid
    """
    limits = limits or DEFAULT_MESSAGE_LIMITS

    if not isinstance(message, dict):
        raise InvalidMessageError("Message must be a dictionary")

    # Validate role
    role = message.get("role")
    if not role:
        raise InvalidMessageError("Message must have a 'role' field")

    if not isinstance(role, str):
        raise InvalidMessageError("Role must be a string")

    role = role.strip().lower()
    if len(role) > limits.max_role_length:
        raise InvalidMessageError(f"Role too long (max {limits.max_role_length} chars)")

    if role not in limits.allowed_roles:
        raise InvalidMessageError(
            f"Invalid role '{role}'",
            {"allowed_roles": list(limits.allowed_roles)}
        )

    # Validate content
    content = message.get("content")
    if content is None:
        raise InvalidMessageError("Message must have 'content' field")

    # Content can be string or list (for multimodal)
    if isinstance(content, str):
        content = validate_message_content(content, limits)
    elif isinstance(content, list):
        # Multimodal content: list of content blocks
        for i, block in enumerate(content):
            if isinstance(block, dict):
                if "text" in block:
                    block["text"] = validate_message_content(block["text"], limits)
            elif isinstance(block, str):
                content[i] = validate_message_content(block, limits)
    else:
        raise InvalidMessageError("Content must be a string or list")

    return {
        "role": role,
        "content": content,
        **{k: v for k, v in message.items() if k not in ("role", "content")}
    }


def validate_messages(
    messages: List[Dict[str, Any]],
    limits: Optional[MessageLimits] = None
) -> List[Dict[str, Any]]:
    """
    Validate a list of messages.

    Args:
        messages: List of message dictionaries
        limits: Validation limits

    Returns:
        List of validated messages

    Raises:
        InvalidMessageError: If any message is invalid
    """
    limits = limits or DEFAULT_MESSAGE_LIMITS

    if not isinstance(messages, list):
        raise InvalidMessageError("Messages must be a list")

    if len(messages) > limits.max_messages:
        raise InvalidMessageError(
            f"Too many messages (max {limits.max_messages})",
            {"actual_count": len(messages), "max_count": limits.max_messages}
        )

    return [validate_message(m, limits) for m in messages]


# ============================================================================
# Request Payload Validation
# ============================================================================

@dataclass
class AskExpertRequest:
    """Validated Ask Expert request."""
    agent_id: uuid.UUID
    message: str
    session_id: Optional[uuid.UUID] = None
    organization_id: Optional[uuid.UUID] = None
    user_id: Optional[uuid.UUID] = None
    enable_rag: bool = True
    enable_web_search: bool = False
    domains: List[str] = field(default_factory=list)
    tools: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


def validate_ask_expert_request(payload: Dict[str, Any]) -> AskExpertRequest:
    """
    Validate Ask Expert request payload.

    Args:
        payload: Raw request payload

    Returns:
        Validated AskExpertRequest

    Raises:
        ValidationError: If payload is invalid
    """
    if not isinstance(payload, dict):
        raise ValidationError("Request payload must be a dictionary")

    # Required: agent_id
    agent_id = validate_uuid(payload.get("agent_id"), "agent_id")

    # Required: message
    message = payload.get("message")
    if not message:
        raise ValidationError("Message is required", field="message")
    message = validate_message_content(message)

    # Optional UUIDs
    session_id = validate_uuid_optional(payload.get("session_id"), "session_id")
    organization_id = validate_uuid_optional(
        payload.get("organization_id") or payload.get("tenant_id"),
        "organization_id"
    )
    user_id = validate_uuid_optional(payload.get("user_id"), "user_id")

    # Optional booleans
    enable_rag = bool(payload.get("enable_rag", True))
    enable_web_search = bool(payload.get("enable_web_search", False))

    # Optional domains
    domains_raw = payload.get("domains") or payload.get("knowledge_namespaces") or []
    if isinstance(domains_raw, str):
        domains_raw = [domains_raw]
    domains = validate_domains(domains_raw, strict=False) if domains_raw else []

    # Optional tools
    tools_raw = payload.get("tools") or []
    if isinstance(tools_raw, str):
        tools_raw = [tools_raw]
    tools = [validate_tool_name(t) for t in tools_raw] if tools_raw else []

    # Optional metadata (shallow validation)
    metadata = payload.get("metadata") or {}
    if not isinstance(metadata, dict):
        raise ValidationError("Metadata must be a dictionary", field="metadata")

    return AskExpertRequest(
        agent_id=agent_id,
        message=message,
        session_id=session_id,
        organization_id=organization_id,
        user_id=user_id,
        enable_rag=enable_rag,
        enable_web_search=enable_web_search,
        domains=domains,
        tools=tools,
        metadata=metadata,
    )


# ============================================================================
# Validation Decorators
# ============================================================================

def validate_request(
    *,
    agent_id: bool = False,
    session_id: bool = False,
    message: bool = False,
    organization_id: bool = False,
    user_id: bool = False,
) -> Callable:
    """
    Decorator to validate request parameters.

    Usage:
        @validate_request(agent_id=True, message=True)
        async def handle_request(agent_id: str, message: str):
            # agent_id is now guaranteed to be a valid UUID string
            # message is validated for length and content
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Validate specified fields
            if agent_id and "agent_id" in kwargs:
                kwargs["agent_id"] = str(validate_uuid(kwargs["agent_id"], "agent_id"))

            if session_id and "session_id" in kwargs:
                val = kwargs.get("session_id")
                if val:
                    kwargs["session_id"] = str(validate_uuid(val, "session_id"))

            if message and "message" in kwargs:
                kwargs["message"] = validate_message_content(kwargs["message"])

            if organization_id:
                val = kwargs.get("organization_id") or kwargs.get("tenant_id")
                if val:
                    validated = str(validate_uuid(val, "organization_id"))
                    kwargs["organization_id"] = validated
                    if "tenant_id" in kwargs:
                        kwargs["tenant_id"] = validated

            if user_id and "user_id" in kwargs:
                val = kwargs.get("user_id")
                if val:
                    kwargs["user_id"] = str(validate_uuid(val, "user_id"))

            return await func(*args, **kwargs)

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            # Validate specified fields
            if agent_id and "agent_id" in kwargs:
                kwargs["agent_id"] = str(validate_uuid(kwargs["agent_id"], "agent_id"))

            if session_id and "session_id" in kwargs:
                val = kwargs.get("session_id")
                if val:
                    kwargs["session_id"] = str(validate_uuid(val, "session_id"))

            if message and "message" in kwargs:
                kwargs["message"] = validate_message_content(kwargs["message"])

            if organization_id:
                val = kwargs.get("organization_id") or kwargs.get("tenant_id")
                if val:
                    validated = str(validate_uuid(val, "organization_id"))
                    kwargs["organization_id"] = validated
                    if "tenant_id" in kwargs:
                        kwargs["tenant_id"] = validated

            if user_id and "user_id" in kwargs:
                val = kwargs.get("user_id")
                if val:
                    kwargs["user_id"] = str(validate_uuid(val, "user_id"))

            return func(*args, **kwargs)

        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper

    return decorator


# ============================================================================
# Sanitization Utilities
# ============================================================================

def sanitize_string(
    value: str,
    max_length: int = 10000,
    allow_newlines: bool = True,
    strip: bool = True
) -> str:
    """
    Sanitize string input.

    - Strips leading/trailing whitespace (if strip=True)
    - Truncates to max_length
    - Optionally removes newlines
    - Removes null bytes and other control characters
    """
    if not isinstance(value, str):
        return ""

    if strip:
        value = value.strip()

    # Remove null bytes and most control characters (keep newlines, tabs)
    if allow_newlines:
        value = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', value)
    else:
        value = re.sub(r'[\x00-\x1f\x7f]', '', value)

    # Truncate
    if len(value) > max_length:
        value = value[:max_length]

    return value


def sanitize_dict(
    data: Dict[str, Any],
    max_string_length: int = 10000,
    max_depth: int = 10,
    current_depth: int = 0
) -> Dict[str, Any]:
    """
    Recursively sanitize dictionary values.

    - Sanitizes all string values
    - Limits nesting depth
    - Returns clean copy
    """
    if current_depth > max_depth:
        return {}

    result = {}
    for key, value in data.items():
        # Sanitize key
        if isinstance(key, str):
            key = sanitize_string(key, max_length=256, allow_newlines=False)

        # Sanitize value
        if isinstance(value, str):
            result[key] = sanitize_string(value, max_length=max_string_length)
        elif isinstance(value, dict):
            result[key] = sanitize_dict(value, max_string_length, max_depth, current_depth + 1)
        elif isinstance(value, list):
            result[key] = [
                sanitize_dict(v, max_string_length, max_depth, current_depth + 1)
                if isinstance(v, dict)
                else sanitize_string(v, max_length=max_string_length) if isinstance(v, str)
                else v
                for v in value
            ]
        else:
            result[key] = value

    return result


# ============================================================================
# Pydantic-Compatible Validators
# ============================================================================

def uuid_validator(value: Any) -> str:
    """Pydantic validator for UUID fields."""
    return str(validate_uuid(value))


def uuid_optional_validator(value: Any) -> Optional[str]:
    """Pydantic validator for optional UUID fields."""
    result = validate_uuid_optional(value)
    return str(result) if result else None


def domain_validator(value: Any) -> str:
    """Pydantic validator for domain fields."""
    if not isinstance(value, str):
        raise ValueError("Domain must be a string")
    return validate_domain(value)


def tool_name_validator(value: Any) -> str:
    """Pydantic validator for tool name fields."""
    if not isinstance(value, str):
        raise ValueError("Tool name must be a string")
    return validate_tool_name(value)


# ============================================================================
# Exports
# ============================================================================

__all__ = [
    # Exceptions
    "ValidationError",
    "InvalidUUIDError",
    "InvalidToolError",
    "InvalidDomainError",
    "InvalidMessageError",
    "RateLimitError",
    "ContentPolicyError",

    # UUID validation
    "is_valid_uuid",
    "validate_uuid",
    "validate_uuid_optional",
    "validate_uuids",

    # Tool validation
    "ToolCategory",
    "BUILTIN_TOOLS",
    "is_valid_tool_name",
    "validate_tool_name",
    "validate_tool_config",

    # Domain validation
    "VALID_DOMAINS",
    "is_valid_domain",
    "validate_domain",
    "validate_domains",

    # Message validation
    "MessageLimits",
    "validate_message_content",
    "validate_message",
    "validate_messages",

    # Request validation
    "AskExpertRequest",
    "validate_ask_expert_request",

    # Decorators
    "validate_request",

    # Sanitization
    "sanitize_string",
    "sanitize_dict",

    # Pydantic validators
    "uuid_validator",
    "uuid_optional_validator",
    "domain_validator",
    "tool_name_validator",
]
