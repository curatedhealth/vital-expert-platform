"""
VITAL Shared Registry

Service registry for dependency injection.
"""

from vital_shared.registry.service_registry import ServiceRegistry, initialize_services

__all__ = [
    "ServiceRegistry",
    "initialize_services",
]

