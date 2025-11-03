"""
TenantId Value Object

Immutable, type-safe representation of a tenant identifier.
Enforces UUID format and provides utility methods.
Keep this file in sync with services/shared-kernel/src/vital_shared_kernel/multi_tenant/tenant_id.py.
"""

from dataclasses import dataclass
import uuid


class InvalidTenantIdError(ValueError):
    """Raised when tenant ID format is invalid."""


@dataclass(frozen=True)
class TenantId:
    """Value object representing a tenant identifier."""

    value: str

    def __post_init__(self) -> None:
        if not self.value:
            raise InvalidTenantIdError("Tenant ID cannot be empty")

        try:
            uuid.UUID(self.value)
        except ValueError as exc:
            raise InvalidTenantIdError(f"Invalid tenant ID format: {self.value}") from exc

    def __str__(self) -> str:
        return self.value

    def __repr__(self) -> str:
        return f"TenantId('{self.value}')"

    def __eq__(self, other: object) -> bool:
        if isinstance(other, TenantId):
            return self.value == other.value
        return False

    def __hash__(self) -> int:
        return hash(self.value)

    @classmethod
    def from_string(cls, value: str) -> "TenantId":
        return cls(value=value)

    @classmethod
    def platform_tenant(cls) -> "TenantId":
        return cls(value="00000000-0000-0000-0000-000000000001")

    def to_dict(self) -> dict:
        return {"value": self.value}

    @classmethod
    def from_dict(cls, data: dict) -> "TenantId":
        return cls(value=data["value"])
