"""GOVERN Category - Compliance (4 runners)
Core Logic: Policy-as-Code / Constitutional AI / Zero Trust Verification

Runners:
    PolicyCheckRunner: Check against policy (OPA/Rego evaluation)
    SanitizeRunner: Remove sensitive data (PII detection + masking)
    AuditLogRunner: Log for audit (immutable logging)
    PermissionCheckRunner: Check permissions (RBAC evaluation)
"""
# TODO: Import runners when implemented
__all__ = ["PolicyCheckRunner", "SanitizeRunner", "AuditLogRunner", "PermissionCheckRunner"]
