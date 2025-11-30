"""
Pinecone Namespace Configuration for VITAL AI Platform

Naming Convention: {layer}-{category}-{domain}
- ont-* : Ontology Layer (L1-L4) - agents, personas, roles, capabilities, skills
- KD-* : Knowledge Domain (L0) - regulatory, clinical, medical affairs, etc.
- ops-* : Operational Layer (L5-L7) - workflows, templates, processes

This configuration maps domains and tags to appropriate namespaces for
better query filtering and retrieval performance.
"""

from typing import Dict, List, Optional, Set
from dataclasses import dataclass


@dataclass
class NamespaceMapping:
    """Configuration for a namespace."""
    namespace: str
    description: str
    domains: List[str]  # Database domains that map to this namespace
    tags: List[str]     # Tags that should route to this namespace
    priority: int = 0   # Higher priority takes precedence when multiple match


# =============================================================================
# ONTOLOGY LAYER (L1-L4) - System entities
# =============================================================================
ONTOLOGY_NAMESPACES = {
    "ont-agents": NamespaceMapping(
        namespace="ont-agents",
        description="AI Agent definitions and configurations",
        domains=["agents"],
        tags=["agent", "ai-agent"],
        priority=100
    ),
    "ont-personas": NamespaceMapping(
        namespace="ont-personas",
        description="User persona profiles and characteristics",
        domains=["personas"],
        tags=["persona", "user-profile"],
        priority=100
    ),
    "ont-roles": NamespaceMapping(
        namespace="ont-roles",
        description="Organizational roles and responsibilities",
        domains=["roles"],
        tags=["role", "job-function"],
        priority=100
    ),
    "ont-capabilities": NamespaceMapping(
        namespace="ont-capabilities",
        description="Agent and system capabilities",
        domains=["capabilities"],
        tags=["capability", "skill-set"],
        priority=100
    ),
    "ont-skills": NamespaceMapping(
        namespace="ont-skills",
        description="Individual skills and competencies",
        domains=["skills"],
        tags=["skill", "competency"],
        priority=100
    ),
    "ont-responsibilities": NamespaceMapping(
        namespace="ont-responsibilities",
        description="Role responsibilities and duties",
        domains=["responsibilities"],
        tags=["responsibility", "duty"],
        priority=100
    ),
}

# =============================================================================
# KNOWLEDGE LAYER (L0) - Domain content
# =============================================================================
KNOWLEDGE_NAMESPACES = {
    # --- REGULATORY ---
    "knowledge-reg-fda": NamespaceMapping(
        namespace="knowledge-reg-fda",
        description="FDA regulations, guidance documents, 510(k), PMA",
        domains=["Regulatory & Compliance"],
        tags=["fda", "510k", "pma", "de novo", "fda guidance"],
        priority=90
    ),
    "knowledge-reg-ema": NamespaceMapping(
        namespace="knowledge-reg-ema",
        description="EMA regulations, EU MDR, IVDR",
        domains=["Regulatory & Compliance"],
        tags=["ema", "eu mdr", "ivdr", "european", "eu"],
        priority=90
    ),
    "knowledge-reg-ich": NamespaceMapping(
        namespace="knowledge-reg-ich",
        description="ICH guidelines and harmonization",
        domains=["Regulatory & Compliance"],
        tags=["ich", "gcp", "harmonization"],
        priority=85
    ),
    "knowledge-reg-general": NamespaceMapping(
        namespace="knowledge-reg-general",
        description="General regulatory content and compliance",
        domains=["Regulatory & Compliance"],
        tags=["regulatory", "compliance", "standards"],
        priority=50
    ),

    # --- DIGITAL HEALTH ---
    "knowledge-dh-samd": NamespaceMapping(
        namespace="knowledge-dh-samd",
        description="Software as Medical Device (SaMD) regulations",
        domains=["Digital Health Foundations", "Digital Health"],
        tags=["samd", "software medical device", "ai/ml", "digital health"],
        priority=90
    ),
    "knowledge-dh-interop": NamespaceMapping(
        namespace="knowledge-dh-interop",
        description="Healthcare interoperability (FHIR, HL7, etc.)",
        domains=["Digital Health Foundations"],
        tags=["interoperability", "fhir", "hl7", "standards"],
        priority=85
    ),
    "knowledge-dh-cybersec": NamespaceMapping(
        namespace="knowledge-dh-cybersec",
        description="Healthcare cybersecurity and data protection",
        domains=["Digital Health Foundations"],
        tags=["cybersecurity", "security", "data protection"],
        priority=85
    ),
    "knowledge-dh-general": NamespaceMapping(
        namespace="knowledge-dh-general",
        description="General digital health foundations",
        domains=["Digital Health Foundations", "Digital Health"],
        tags=["digital health", "digital transformation"],
        priority=50
    ),

    # --- CLINICAL ---
    "knowledge-clinical-trials": NamespaceMapping(
        namespace="knowledge-clinical-trials",
        description="Clinical trials design, conduct, and management",
        domains=["Clinical Operations"],
        tags=["clinical trials", "protocol", "clinical", "gcp"],
        priority=90
    ),
    "knowledge-clinical-ops": NamespaceMapping(
        namespace="knowledge-clinical-ops",
        description="Clinical operations and site management",
        domains=["Clinical Operations"],
        tags=["clinical operations", "site management", "monitoring"],
        priority=85
    ),
    "knowledge-clinical-biostat": NamespaceMapping(
        namespace="knowledge-clinical-biostat",
        description="Biostatistics and data analysis",
        domains=["Clinical Operations"],
        tags=["biostatistics", "data analysis", "methodology"],
        priority=85
    ),

    # --- MEDICAL AFFAIRS ---
    "knowledge-ma-msl": NamespaceMapping(
        namespace="knowledge-ma-msl",
        description="Medical Science Liaison activities",
        domains=["Field Medical", "Medical Information"],
        tags=["msl", "field medical", "kol", "medical affairs"],
        priority=90
    ),
    "knowledge-ma-info": NamespaceMapping(
        namespace="knowledge-ma-info",
        description="Medical information and inquiry management",
        domains=["Medical Information"],
        tags=["medical information", "inquiry management", "drug information"],
        priority=85
    ),
    "knowledge-ma-education": NamespaceMapping(
        namespace="knowledge-ma-education",
        description="Medical education and HCP training",
        domains=["Medical Education"],
        tags=["medical education", "hcp education", "continuing education"],
        priority=85
    ),
    "knowledge-ma-comms": NamespaceMapping(
        namespace="knowledge-ma-comms",
        description="Scientific communications and publications",
        domains=["Scientific Communications", "Publications"],
        tags=["scientific communication", "publication planning", "medical writing"],
        priority=85
    ),

    # --- HEOR & RWE ---
    "knowledge-heor-rwe": NamespaceMapping(
        namespace="knowledge-heor-rwe",
        description="Real-world evidence and observational studies",
        domains=["HEOR & Evidence"],
        tags=["rwe", "real-world evidence", "observational studies", "epidemiology"],
        priority=90
    ),
    "knowledge-heor-econ": NamespaceMapping(
        namespace="knowledge-heor-econ",
        description="Health economics and outcomes research",
        domains=["HEOR & Evidence"],
        tags=["heor", "health economics", "pharmacoeconomics", "ebm"],
        priority=85
    ),
    "knowledge-heor-access": NamespaceMapping(
        namespace="knowledge-heor-access",
        description="Market access, pricing, and reimbursement",
        domains=["HEOR & Evidence"],
        tags=["market access", "reimbursement", "payer strategies", "value demonstration"],
        priority=85
    ),

    # --- SAFETY ---
    "knowledge-safety-pv": NamespaceMapping(
        namespace="knowledge-safety-pv",
        description="Pharmacovigilance and drug safety",
        domains=[],
        tags=["pharmacovigilance", "adverse events", "safety", "drug safety"],
        priority=90
    ),

    # --- GENERAL/CATCH-ALL ---
    "knowledge-best-practices": NamespaceMapping(
        namespace="knowledge-best-practices",
        description="Best practices and use cases",
        domains=["Best Practices & Use Cases"],
        tags=["best practices", "use cases"],
        priority=40
    ),
    "knowledge-futures": NamespaceMapping(
        namespace="knowledge-futures",
        description="Futures thinking and innovation",
        domains=["Futures Thinking"],
        tags=["futures", "innovation", "trends"],
        priority=40
    ),
    "knowledge-industry": NamespaceMapping(
        namespace="knowledge-industry",
        description="Industry reports and market intelligence",
        domains=["Industry Reports", "Startup & Investment"],
        tags=["industry", "market", "investment"],
        priority=40
    ),
    "knowledge-coaching": NamespaceMapping(
        namespace="knowledge-coaching",
        description="Coaching and professional development",
        domains=["Coaching", "Change Management"],
        tags=["coaching", "leadership", "change management"],
        priority=40
    ),
    "knowledge-general": NamespaceMapping(
        namespace="knowledge-general",
        description="General knowledge base content",
        domains=["Knowledge Base", "General"],
        tags=["general"],
        priority=10  # Lowest priority - catch-all
    ),
}

# =============================================================================
# OPERATIONAL LAYER (L5-L7) - Processes and workflows
# =============================================================================
OPERATIONAL_NAMESPACES = {
    "ops-workflows": NamespaceMapping(
        namespace="ops-workflows",
        description="Workflow definitions and process templates",
        domains=["workflows"],
        tags=["workflow", "process"],
        priority=100
    ),
    "ops-templates": NamespaceMapping(
        namespace="ops-templates",
        description="Document and output templates",
        domains=["templates"],
        tags=["template", "document template"],
        priority=100
    ),
    "ops-integrations": NamespaceMapping(
        namespace="ops-integrations",
        description="System integrations and connectors",
        domains=["integrations"],
        tags=["integration", "api", "connector"],
        priority=100
    ),
}

# =============================================================================
# COMBINED NAMESPACE REGISTRY
# =============================================================================
ALL_NAMESPACES: Dict[str, NamespaceMapping] = {
    **ONTOLOGY_NAMESPACES,
    **KNOWLEDGE_NAMESPACES,
    **OPERATIONAL_NAMESPACES,
}

# Legacy namespace to new namespace mapping (for migration)
LEGACY_NAMESPACE_MAP = {
    "agents": "ont-agents",
    "personas": "ont-personas",
    "capabilities": "ont-capabilities",
    "skills": "ont-skills",
    "responsibilities": "ont-responsibilities",
    "__default__": None,  # Will be routed based on metadata
    "": None,  # Empty string default namespace
}


def get_namespace_for_document(
    domain: Optional[str] = None,
    tags: Optional[List[str]] = None,
    source_type: Optional[str] = None
) -> str:
    """
    Determine the appropriate namespace for a document based on its metadata.

    Args:
        domain: Document domain from database
        tags: List of tags associated with the document
        source_type: Type of source (peer_review, guideline, etc.)

    Returns:
        Namespace string to use for this document
    """
    tags = tags or []
    tags_lower = {t.lower().strip() for t in tags if t}
    domain_lower = (domain or "").lower().strip()

    best_match: Optional[NamespaceMapping] = None
    best_priority = -1

    for ns_config in ALL_NAMESPACES.values():
        # Skip ontology namespaces for document routing
        if ns_config.namespace.startswith("ont-"):
            continue

        priority = 0

        # Check domain match
        for ns_domain in ns_config.domains:
            if ns_domain.lower() == domain_lower:
                priority = max(priority, ns_config.priority)
                break

        # Check tag matches (boost priority for each matching tag)
        matching_tags = 0
        for ns_tag in ns_config.tags:
            if ns_tag.lower() in tags_lower:
                matching_tags += 1

        if matching_tags > 0:
            # Boost priority based on number of matching tags
            priority = max(priority, ns_config.priority + (matching_tags * 5))

        if priority > best_priority:
            best_priority = priority
            best_match = ns_config

    # Default to general knowledge namespace
    if best_match is None:
        return "knowledge-general"

    return best_match.namespace


def get_namespaces_for_query(
    query: str,
    domains: Optional[List[str]] = None,
    tags: Optional[List[str]] = None
) -> List[str]:
    """
    Determine which namespaces to search for a given query.

    Args:
        query: User's search query
        domains: Optional list of domain filters
        tags: Optional list of tag filters

    Returns:
        List of namespace strings to search
    """
    # If specific domains/tags provided, find matching namespaces
    if domains or tags:
        namespaces = set()

        for domain in (domains or []):
            for ns_config in ALL_NAMESPACES.values():
                if domain.lower() in [d.lower() for d in ns_config.domains]:
                    namespaces.add(ns_config.namespace)

        for tag in (tags or []):
            tag_lower = tag.lower().strip()
            for ns_config in ALL_NAMESPACES.values():
                if tag_lower in [t.lower() for t in ns_config.tags]:
                    namespaces.add(ns_config.namespace)

        if namespaces:
            return list(namespaces)

    # Query analysis for namespace hints
    query_lower = query.lower()
    namespaces = set()

    # Check for regulatory keywords
    if any(kw in query_lower for kw in ["fda", "510k", "510(k)", "pma", "de novo"]):
        namespaces.add("knowledge-reg-fda")
    if any(kw in query_lower for kw in ["ema", "eu mdr", "ivdr", "european"]):
        namespaces.add("knowledge-reg-ema")
    if any(kw in query_lower for kw in ["ich", "gcp guideline"]):
        namespaces.add("knowledge-reg-ich")

    # Check for digital health keywords
    if any(kw in query_lower for kw in ["samd", "software medical", "ai/ml", "machine learning"]):
        namespaces.add("knowledge-dh-samd")
    if any(kw in query_lower for kw in ["fhir", "hl7", "interoperability"]):
        namespaces.add("knowledge-dh-interop")
    if any(kw in query_lower for kw in ["cybersecurity", "security", "hipaa"]):
        namespaces.add("knowledge-dh-cybersec")

    # Check for clinical keywords
    if any(kw in query_lower for kw in ["clinical trial", "protocol", "phase"]):
        namespaces.add("knowledge-clinical-trials")
    if any(kw in query_lower for kw in ["biostatistics", "statistical", "analysis"]):
        namespaces.add("knowledge-clinical-biostat")

    # Check for medical affairs keywords
    if any(kw in query_lower for kw in ["msl", "medical science liaison", "kol"]):
        namespaces.add("knowledge-ma-msl")
    if any(kw in query_lower for kw in ["medical information", "drug information"]):
        namespaces.add("knowledge-ma-info")

    # Check for HEOR keywords
    if any(kw in query_lower for kw in ["real world", "rwe", "observational"]):
        namespaces.add("knowledge-heor-rwe")
    if any(kw in query_lower for kw in ["health economics", "heor", "pharmacoeconomic"]):
        namespaces.add("knowledge-heor-econ")
    if any(kw in query_lower for kw in ["market access", "reimbursement", "payer"]):
        namespaces.add("knowledge-heor-access")

    # Check for safety keywords
    if any(kw in query_lower for kw in ["pharmacovigilance", "adverse event", "safety"]):
        namespaces.add("knowledge-safety-pv")

    # If no specific matches, search general + best practices
    if not namespaces:
        namespaces = {"knowledge-general", "knowledge-best-practices"}

    return list(namespaces)


def list_all_namespaces() -> List[Dict]:
    """
    List all configured namespaces with their metadata.

    Returns:
        List of namespace configurations
    """
    return [
        {
            "namespace": ns.namespace,
            "description": ns.description,
            "domains": ns.domains,
            "tags": ns.tags,
            "layer": ns.namespace.split("-")[0]  # ont, knowledge, ops
        }
        for ns in ALL_NAMESPACES.values()
    ]


# Export for use in migration scripts
__all__ = [
    "NamespaceMapping",
    "ALL_NAMESPACES",
    "ONTOLOGY_NAMESPACES",
    "KNOWLEDGE_NAMESPACES",
    "OPERATIONAL_NAMESPACES",
    "LEGACY_NAMESPACE_MAP",
    "get_namespace_for_document",
    "get_namespaces_for_query",
    "list_all_namespaces",
]
