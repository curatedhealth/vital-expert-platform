# PRODUCTION_TAG: PRODUCTION_CORE
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [All]
# DEPENDENCIES: [api.routes.*, api.frameworks, api.enhanced_features, api.auth, graphrag.api]
"""
VITAL Path AI Services - Route Registration

Registers all API routes for the FastAPI application.
Routes are organized by domain and registered with appropriate prefixes and tags.

Phase 1 Refactoring: Extracted from monolithic main.py
"""

from fastapi import FastAPI
import structlog

logger = structlog.get_logger()


def register_routes(app: FastAPI) -> None:
    """
    Register all API routes for the application.
    
    Routes are registered in the following order:
    0. Core routes (health, metrics, cache)
    1. Core routes (panels, experts)
    2. GraphRAG routes
    3. Knowledge Graph routes
    4. Framework routes
    5. Enhanced features routes
    6. Authentication routes
    7. HITL routes
    8. Value Framework routes
    9. Investigator routes
    
    Args:
        app: FastAPI application instance
    """
    # 0. Register Core routes (health, metrics, etc.)
    _register_core_routes(app)
    
    # 1. Register Ask Panel routes
    _register_panel_routes(app)
    
    # 2. Register Ask Expert routes (Phase 4 - 4-Mode System)
    _register_expert_routes(app)
    
    # 3. Register GraphRAG routes (Phase 1 - Hybrid Search)
    _register_graphrag_routes(app)
    
    # 4. Register Knowledge Graph routes
    _register_knowledge_graph_routes(app)
    
    # 5. Register Framework routes (LangGraph, AutoGen, CrewAI)
    _register_framework_routes(app)
    
    # 6. Register Enhanced Features routes
    _register_enhanced_features_routes(app)
    
    # 7. Register Authentication routes
    _register_auth_routes(app)
    
    # 8. Register HITL routes
    _register_hitl_routes(app)
    
    # 9. Register Value Framework routes
    _register_value_framework_routes(app)
    
    # 10. Register Value Investigator routes
    _register_value_investigator_routes(app)
    
    # 11. Register Ontology Investigator routes
    _register_ontology_investigator_routes(app)
    
    # 12. Register Missions/Templates routes (Autonomous Modes 3/4)
    _register_mission_routes(app)

    # 12. Register Agent Context routes (Phase 2 - Agent OS)
    _register_agent_context_routes(app)
    
    # 13. Register Agent Synergies routes (Phase 2 - Agent OS)
    _register_agent_synergies_routes(app)
    
    # 14. Register Agent Sessions routes (Phase 2 - Agent OS)
    _register_agent_sessions_routes(app)
    
    logger.info("✅ All routes registered successfully")


def _register_core_routes(app: FastAPI) -> None:
    """Register core routes (health, metrics, cache, info)."""
    try:
        from api.routes.core import router as core_router
        app.include_router(core_router, prefix="", tags=["system"])
        logger.info("✅ Core routes registered")
    except ImportError as e:
        logger.warning("core_routes_import_failed", error=str(e))


def _register_panel_routes(app: FastAPI) -> None:
    """Register Ask Panel routes."""
    try:
        from api.routes import panels as panel_routes
        app.include_router(panel_routes.router, prefix="", tags=["ask-panel"])
        logger.info("✅ Ask Panel routes registered")
    except ImportError as e:
        logger.warning("panel_routes_import_failed", error=str(e))


def _register_expert_routes(app: FastAPI) -> None:
    """Register Ask Expert routes (4-Mode System)."""
    try:
        from api.routes import expert
        app.include_router(expert.router, prefix="", tags=["ask-expert"])
        logger.info("✅ Ask Expert routes registered (unified)")
    except ImportError as e:
        logger.warning("expert_routes_import_failed", error=str(e))

    # Register Interactive routes (Mode 1 & 2 - conversations/streaming)
    try:
        from api.routes import ask_expert_interactive
        app.include_router(ask_expert_interactive.router, prefix="", tags=["ask-expert-interactive"])
        logger.info("✅ Ask Expert Interactive routes registered")
    except ImportError as e:
        logger.warning("ask_expert_interactive_routes_import_failed", error=str(e))

    # Register Autonomous routes (Mode 3 & 4 - missions/autonomous)
    try:
        from api.routes import ask_expert_autonomous
        app.include_router(ask_expert_autonomous.router, prefix="", tags=["ask-expert-autonomous"])
        logger.info("✅ Ask Expert Autonomous routes registered")
    except ImportError as e:
        logger.warning("ask_expert_autonomous_routes_import_failed", error=str(e))


def _register_graphrag_routes(app: FastAPI) -> None:
    """Register GraphRAG routes (Vector + Keyword + Graph Search)."""
    try:
        from graphrag.api.graphrag import router as graphrag_router
        app.include_router(graphrag_router, prefix="", tags=["graphrag"])
        logger.info("✅ GraphRAG routes registered")
    except ImportError as e:
        logger.warning("graphrag_routes_import_failed", error=str(e))


def _register_knowledge_graph_routes(app: FastAPI) -> None:
    """Register Knowledge Graph routes (Neo4j + Pinecone + Supabase)."""
    try:
        from api.routes.knowledge_graph import router as kg_router
        app.include_router(kg_router, prefix="/v1", tags=["knowledge-graph"])
        logger.info("✅ Knowledge Graph routes registered")
    except ImportError as e:
        logger.warning("knowledge_graph_routes_import_failed", error=str(e))
    except Exception as e:
        logger.error("knowledge_graph_routes_error", error=str(e))


def _register_framework_routes(app: FastAPI) -> None:
    """Register Shared Framework routes (LangGraph, AutoGen, CrewAI)."""
    try:
        from api.frameworks import router as frameworks_router
        app.include_router(frameworks_router, prefix="", tags=["frameworks"])
        logger.info("✅ Shared Framework routes registered")
    except ImportError as e:
        logger.warning("framework_routes_import_failed", error=str(e))
    except Exception as e:
        logger.error("framework_routes_error", error=str(e))


def _register_enhanced_features_routes(app: FastAPI) -> None:
    """Register Enhanced Features routes (agents, prompt starters, compliance)."""
    try:
        from api.enhanced_features import router as enhanced_router
        app.include_router(enhanced_router, prefix="", tags=["enhanced-features"])
        logger.info("✅ Enhanced Features routes registered")
    except ImportError as e:
        logger.warning("enhanced_features_routes_import_failed", error=str(e))
    except Exception as e:
        logger.error("enhanced_features_routes_error", error=str(e))


def _register_auth_routes(app: FastAPI) -> None:
    """Register Authentication routes (Supabase Auth integration)."""
    try:
        from api.auth import router as auth_router
        app.include_router(auth_router, prefix="/api", tags=["authentication"])
        logger.info("✅ Authentication routes registered")
    except ImportError as e:
        logger.warning("auth_routes_import_failed", error=str(e))
    except Exception as e:
        logger.error("auth_routes_error", error=str(e))


def _register_hitl_routes(app: FastAPI) -> None:
    """Register HITL routes (Human-in-the-Loop approval endpoints)."""
    try:
        from api.routes.hitl import router as hitl_router
        app.include_router(hitl_router, prefix="/api", tags=["hitl"])
        logger.info("✅ HITL routes registered")
    except ImportError as e:
        logger.warning("hitl_routes_import_failed", error=str(e))
    except Exception as e:
        logger.error("hitl_routes_error", error=str(e))


def _register_value_framework_routes(app: FastAPI) -> None:
    """Register Value Framework routes (ROI Calculator, Value Insights)."""
    try:
        from api.routes.value_framework import router as value_router
        app.include_router(value_router, prefix="", tags=["value-framework"])
        logger.info("✅ Value Framework routes registered")
    except ImportError as e:
        logger.warning("value_framework_routes_import_failed", error=str(e))
    except Exception as e:
        logger.error("value_framework_routes_error", error=str(e))


def _register_value_investigator_routes(app: FastAPI) -> None:
    """Register Value Investigator routes (AI companion for value analysis)."""
    try:
        from api.routes.value_investigator import router as value_investigator_router
        app.include_router(value_investigator_router, prefix="", tags=["value-investigator"])
        logger.info("✅ Value Investigator routes registered")
    except ImportError as e:
        logger.warning("value_investigator_routes_import_failed", error=str(e))
    except Exception as e:
        logger.error("value_investigator_routes_error", error=str(e))


def _register_ontology_investigator_routes(app: FastAPI) -> None:
    """Register Ontology Investigator routes (AI companion for enterprise ontology analysis)."""
    try:
        from api.routes.ontology_investigator import router as ontology_investigator_router
        app.include_router(ontology_investigator_router, prefix="", tags=["ontology-investigator"])
        logger.info("✅ Ontology Investigator routes registered")
    except ImportError as e:
        logger.warning("ontology_investigator_routes_import_failed", error=str(e))
    except Exception as e:
        logger.error("ontology_investigator_routes_error", error=str(e))


def _register_agent_context_routes(app: FastAPI) -> None:
    """Register Agent Context routes (personality types, regions, domains, TAs, phases)."""
    try:
        from api.routes.agent_context import router as agent_context_router
        app.include_router(agent_context_router, prefix="", tags=["agent-context"])
        logger.info("✅ Agent Context routes registered")
    except ImportError as e:
        logger.warning("agent_context_routes_import_failed", error=str(e))
    except Exception as e:
        logger.error("agent_context_routes_error", error=str(e))


def _register_agent_synergies_routes(app: FastAPI) -> None:
    """Register Agent Synergies routes (synergy scores between agent pairs)."""
    try:
        from api.routes.agent_synergies import router as agent_synergies_router
        app.include_router(agent_synergies_router, prefix="", tags=["agent-synergies"])
        logger.info("✅ Agent Synergies routes registered")
    except ImportError as e:
        logger.warning("agent_synergies_routes_import_failed", error=str(e))
    except Exception as e:
        logger.error("agent_synergies_routes_error", error=str(e))


def _register_agent_sessions_routes(app: FastAPI) -> None:
    """Register Agent Sessions routes (session management and agent instantiation)."""
    try:
        from api.routes.agent_sessions import router as agent_sessions_router
        app.include_router(agent_sessions_router, prefix="", tags=["agent-sessions"])
        logger.info("✅ Agent Sessions routes registered")
    except ImportError as e:
        logger.warning("agent_sessions_routes_import_failed", error=str(e))
    except Exception as e:
        logger.error("agent_sessions_routes_error", error=str(e))


def _register_mission_routes(app: FastAPI) -> None:
    """Register Missions and Templates routes for autonomous modes."""
    try:
        from api.routes import missions as mission_routes
        from api.routes import missions_status
        from api.routes import templates as template_routes

        app.include_router(mission_routes.router, prefix="", tags=["missions"])
        app.include_router(missions_status.router, prefix="", tags=["missions"])
        app.include_router(template_routes.router, prefix="", tags=["templates"])
        logger.info("✅ Missions and Templates routes registered")
    except ImportError as e:
        logger.warning("mission_routes_import_failed", error=str(e))
    except Exception as e:
        logger.error("mission_routes_error", error=str(e))
