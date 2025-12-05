"""
Config Resolvers for Mode 1 and Mode 3

Resolves configuration from agent metadata, user input, and request parameters.
All configuration values are dynamic - nothing is hardcoded.

Architecture: See MODE_1_MODE_3_L4_L5_ARCHITECTURE.md
"""

from services.config_resolvers.mode1_config_resolver import (
    Mode1ConfigResolver,
    get_mode1_config_resolver,
    resolve_mode1_config
)

from services.config_resolvers.mode3_config_resolver import (
    Mode3ConfigResolver,
    get_mode3_config_resolver,
    resolve_mode3_config
)

__all__ = [
    "Mode1ConfigResolver",
    "get_mode1_config_resolver",
    "resolve_mode1_config",
    "Mode3ConfigResolver",
    "get_mode3_config_resolver",
    "resolve_mode3_config"
]
