"""
VITAL Path - Token Counting Utilities

Provides accurate token counting for various models.
Used for budget estimation and context window management.
"""

import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Try to import tiktoken for accurate counting
try:
    import tiktoken
    TIKTOKEN_AVAILABLE = True
except ImportError:
    TIKTOKEN_AVAILABLE = False
    logger.warning("tiktoken not available, using estimation")


# Model to encoder mapping
MODEL_ENCODINGS = {
    "gpt-4": "cl100k_base",
    "gpt-4-turbo": "cl100k_base",
    "gpt-4-turbo-preview": "cl100k_base",
    "gpt-3.5-turbo": "cl100k_base",
    "gpt-3.5-turbo-16k": "cl100k_base",
    "text-embedding-ada-002": "cl100k_base",
    "text-embedding-3-small": "cl100k_base",
    "text-embedding-3-large": "cl100k_base",
}

# Default characters per token for estimation
CHARS_PER_TOKEN = 4


def get_encoder(model: str = "gpt-4"):
    """
    Get tiktoken encoder for a model.
    
    Returns None if tiktoken is not available.
    """
    if not TIKTOKEN_AVAILABLE:
        return None
    
    encoding_name = MODEL_ENCODINGS.get(model, "cl100k_base")
    return tiktoken.get_encoding(encoding_name)


def count_tokens(text: str, model: str = "gpt-4") -> int:
    """
    Count tokens in a text string.
    
    Uses tiktoken for accurate counting if available,
    otherwise falls back to estimation.
    
    Args:
        text: The text to count tokens for
        model: The model (affects tokenization)
    
    Returns:
        Number of tokens
    """
    if not text:
        return 0
    
    encoder = get_encoder(model)
    
    if encoder:
        return len(encoder.encode(text))
    
    # Fallback: estimate based on character count
    return len(text) // CHARS_PER_TOKEN


def count_messages_tokens(
    messages: List[Dict[str, Any]],
    model: str = "gpt-4",
) -> int:
    """
    Count tokens in a list of chat messages.
    
    Accounts for message structure overhead.
    
    Args:
        messages: List of message dicts with role and content
        model: The model (affects tokenization)
    
    Returns:
        Total token count
    """
    if not messages:
        return 0
    
    # Base tokens per message (role, separators)
    tokens_per_message = 4
    
    total = 0
    for message in messages:
        total += tokens_per_message
        
        # Count content
        content = message.get("content", "")
        if content:
            total += count_tokens(content, model)
        
        # Count role
        role = message.get("role", "")
        if role:
            total += count_tokens(role, model)
        
        # Count name if present
        name = message.get("name", "")
        if name:
            total += count_tokens(name, model) + 1
    
    # Add reply priming tokens
    total += 2
    
    return total


def estimate_tokens(
    text: str = None,
    messages: List[Dict[str, Any]] = None,
    model: str = "gpt-4",
) -> int:
    """
    Estimate tokens for text or messages.
    
    Convenience function that handles both text and messages.
    
    Args:
        text: Plain text to estimate
        messages: Chat messages to estimate
        model: Model for tokenization
    
    Returns:
        Estimated token count
    """
    if messages:
        return count_messages_tokens(messages, model)
    if text:
        return count_tokens(text, model)
    return 0


def truncate_to_tokens(
    text: str,
    max_tokens: int,
    model: str = "gpt-4",
    suffix: str = "...",
) -> str:
    """
    Truncate text to fit within a token limit.
    
    Args:
        text: Text to truncate
        max_tokens: Maximum tokens allowed
        model: Model for tokenization
        suffix: Suffix to add when truncating
    
    Returns:
        Truncated text
    """
    if not text:
        return text
    
    current_tokens = count_tokens(text, model)
    
    if current_tokens <= max_tokens:
        return text
    
    encoder = get_encoder(model)
    
    if encoder:
        # Use tiktoken for precise truncation
        tokens = encoder.encode(text)
        suffix_tokens = encoder.encode(suffix) if suffix else []
        
        # Leave room for suffix
        truncated_tokens = tokens[:max_tokens - len(suffix_tokens)]
        truncated = encoder.decode(truncated_tokens)
        
        return truncated + suffix
    
    # Fallback: estimate based on character count
    chars_per_token = len(text) / current_tokens
    target_chars = int((max_tokens - len(suffix) // CHARS_PER_TOKEN) * chars_per_token)
    
    return text[:target_chars] + suffix


def get_context_window(model: str) -> int:
    """
    Get the context window size for a model.
    
    Args:
        model: Model identifier
    
    Returns:
        Context window size in tokens
    """
    CONTEXT_WINDOWS = {
        "gpt-4": 8192,
        "gpt-4-32k": 32768,
        "gpt-4-turbo": 128000,
        "gpt-4-turbo-preview": 128000,
        "gpt-3.5-turbo": 4096,
        "gpt-3.5-turbo-16k": 16384,
        "claude-3-opus": 200000,
        "claude-3-sonnet": 200000,
        "claude-3-haiku": 200000,
    }
    
    return CONTEXT_WINDOWS.get(model, 8192)


def calculate_available_tokens(
    model: str,
    messages: List[Dict[str, Any]],
    max_completion_tokens: int = 4096,
) -> int:
    """
    Calculate available tokens for completion.
    
    Args:
        model: Model identifier
        messages: Current conversation messages
        max_completion_tokens: Maximum tokens for completion
    
    Returns:
        Available tokens for completion
    """
    context_window = get_context_window(model)
    prompt_tokens = count_messages_tokens(messages, model)
    
    available = context_window - prompt_tokens
    
    # Don't exceed max_completion_tokens
    return min(available, max_completion_tokens)


