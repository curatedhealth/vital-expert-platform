"""
Skill Node Compiler
Compiles executable skill nodes for LangGraph

Integrates with production skills database with dynamic execution support.
"""

from typing import Dict, Any, Callable
from uuid import UUID
import importlib
import inspect
import structlog

from graphrag.clients.postgres_client import get_postgres_client
from ..state import AgentState

logger = structlog.get_logger()


async def compile_skill_node(node_config: Dict[str, Any]) -> Callable:
    """
    Compile skill node from configuration
    
    Skill nodes execute specific, well-defined tasks:
    - Data analysis
    - Document summarization
    - Entity extraction
    - Classification
    - etc.
    
    Args:
        node_config: Node configuration from database
        
    Returns:
        Async callable node function
    """
    skill_id = node_config.get('skill_id')
    config = node_config.get('config', {})
    node_name = node_config['node_name']
    
    # Load skill configuration
    pg = await get_postgres_client()
    skill_data = await _load_skill(pg, skill_id)
    
    if not skill_data:
        raise ValueError(f"Skill not found: {skill_id}")
    
    async def skill_node(state: AgentState) -> AgentState:
        """Execute skill node"""
        try:
            logger.info(
                "skill_node_executing",
                node_name=node_name,
                skill_id=str(skill_id),
                skill_name=skill_data['name']
            )
            
            # Track execution
            state['execution_path'].append(node_name)
            state['current_step'] = node_name
            
            # Execute skill based on type
            skill_type = skill_data.get('skill_type', 'general')
            category = skill_data.get('category', 'general')
            
            # Try dynamic execution first if skill is executable
            if skill_data.get('is_executable') and skill_data.get('python_module'):
                logger.info(
                    "executing_skill_dynamically",
                    skill_name=skill_data['name'],
                    module=skill_data['python_module']
                )
                result = await _execute_skill_dynamic(state, skill_data, config)
            # Fall back to category-based execution
            elif category == 'analysis':
                result = await _execute_analysis_skill(state, skill_data, config)
            elif category == 'search':
                result = await _execute_search_skill(state, skill_data, config)
            elif skill_type == 'summarization':
                result = await _execute_summarization_skill(state, skill_data, config)
            elif category == 'data_retrieval' or skill_type == 'extraction':
                result = await _execute_extraction_skill(state, skill_data, config)
            elif skill_type == 'classification':
                result = await _execute_classification_skill(state, skill_data, config)
            else:
                result = await _execute_general_skill(state, skill_data, config)
            
            # Update state with result
            state['metadata'][f'{node_name}_result'] = result
            state['reasoning'].append(f"{node_name}: {skill_data['name']} executed")
            
            logger.info(
                "skill_node_complete",
                node_name=node_name,
                result_type=type(result).__name__
            )
            
            return state
            
        except Exception as e:
            logger.error(
                "skill_node_failed",
                node_name=node_name,
                error=str(e)
            )
            state['error'] = str(e)
            return state
    
    return skill_node


async def _load_skill(pg, skill_id: UUID) -> Dict[str, Any]:
    """Load executable skill configuration from database"""
    query = """
    SELECT
        id,
        name,
        slug,
        description,
        category,
        skill_type,
        complexity_level,
        is_executable,
        python_module,
        callable_name,
        requires_context,
        is_stateful,
        parameters_schema,
        metadata
    FROM skills
    WHERE id = $1 AND is_active = true AND deleted_at IS NULL
    """
    
    return await pg.fetchrow(query, skill_id)


async def _execute_skill_dynamic(
    state: AgentState,
    skill_data: Dict,
    config: Dict
) -> Dict[str, Any]:
    """
    Execute skill dynamically using python_module and callable_name from database
    
    This enables database-driven skill execution without hardcoding logic.
    """
    python_module = skill_data.get('python_module')
    callable_name = skill_data.get('callable_name')
    
    if not python_module or not callable_name:
        logger.warning(
            "skill_missing_execution_info",
            skill=skill_data['name'],
            has_module=bool(python_module),
            has_callable=bool(callable_name)
        )
        return {
            "success": False,
            "skill_type": "dynamic",
            "error": "Missing python_module or callable_name"
        }
    
    try:
        # Dynamically import module
        module = importlib.import_module(python_module)
        skill_func = getattr(module, callable_name)
        
        # Build skill context
        skill_context = {
            "query": state.get('query'),
            "context": state.get('context'),
            "user_id": state.get('user_id'),
            "session_id": state.get('session_id'),
            "tenant_id": state.get('tenant_id'),
            "agent_id": state.get('agent_id'),
            "state": state if skill_data.get('requires_context') else None
        }
        
        # Execute (handle both async and sync functions)
        if inspect.iscoroutinefunction(skill_func):
            result = await skill_func(skill_context)
        else:
            result = skill_func(skill_context)
        
        logger.info(
            "skill_dynamic_execution_success",
            skill=skill_data['name'],
            module=python_module
        )
        
        return {
            "success": True,
            "skill_type": "dynamic",
            "skill_name": skill_data['name'],
            "module": python_module,
            "result": result
        }
        
    except ImportError as e:
        logger.error(
            "skill_module_import_failed",
            skill=skill_data['name'],
            module=python_module,
            error=str(e)
        )
        return {
            "success": False,
            "skill_type": "dynamic",
            "error": f"Module import failed: {str(e)}"
        }
    except AttributeError as e:
        logger.error(
            "skill_callable_not_found",
            skill=skill_data['name'],
            callable=callable_name,
            error=str(e)
        )
        return {
            "success": False,
            "skill_type": "dynamic",
            "error": f"Callable not found: {str(e)}"
        }
    except Exception as e:
        logger.error(
            "skill_dynamic_execution_failed",
            skill=skill_data['name'],
            error=str(e)
        )
        return {
            "success": False,
            "skill_type": "dynamic",
            "error": str(e)
        }


async def _execute_search_skill(
    state: AgentState,
    skill_data: Dict,
    config: Dict
) -> Dict[str, Any]:
    """Execute search skill using GraphRAG"""
    try:
        from graphrag import get_graphrag_service, GraphRAGRequest
        
        graphrag_service = await get_graphrag_service()
        
        # Build search request
        search_query = config.get('query') or state.get('query', '')
        
        rag_request = GraphRAGRequest(
            query=search_query,
            agent_id=state.get('agent_id'),
            session_id=state['session_id'],
            user_id=state.get('user_id'),
            tenant_id=state.get('tenant_id'),
            include_graph_evidence=True,
            include_citations=True
        )
        
        # Execute search
        rag_response = await graphrag_service.query(rag_request)
        
        return {
            "skill_type": "search",
            "skill_name": skill_data['name'],
            "success": True,
            "results": [chunk.model_dump() for chunk in rag_response.context_chunks],
            "citations": {k: v.model_dump() for k, v in rag_response.citations.items()}
        }
        
    except Exception as e:
        logger.error("search_skill_failed", error=str(e))
        return {
            "skill_type": "search",
            "success": False,
            "error": str(e)
        }


async def _load_skill(pg, skill_id: UUID) -> Dict[str, Any]:
    """Load skill from database"""
    # Placeholder implementation
    return {
        "skill_id": str(skill_id),
        "name": "Example Skill",
        "type": "analysis"
    }


async def _execute_analysis_skill(
    state: AgentState,
    skill_data: Dict,
    config: Dict
) -> Dict[str, Any]:
    """Execute analysis skill"""
    # Placeholder: Implement actual analysis logic
    return {
        "skill_type": "analysis",
        "analyzed": True,
        "insights": "Analysis complete"
    }


async def _execute_summarization_skill(
    state: AgentState,
    skill_data: Dict,
    config: Dict
) -> Dict[str, Any]:
    """Execute summarization skill"""
    # Use context or response for summarization
    text_to_summarize = state.get('context') or state.get('response', '')
    
    # Placeholder: Implement actual summarization
    summary = text_to_summarize[:500] + "..." if len(text_to_summarize) > 500 else text_to_summarize
    
    return {
        "skill_type": "summarization",
        "summary": summary,
        "original_length": len(text_to_summarize),
        "summary_length": len(summary)
    }


async def _execute_extraction_skill(
    state: AgentState,
    skill_data: Dict,
    config: Dict
) -> Dict[str, Any]:
    """Execute extraction skill"""
    # Extract entities from context
    entities = []
    
    # Placeholder: Use NER service
    from graphrag.ner_service import get_ner_service
    
    try:
        ner_service = await get_ner_service()
        text = state.get('context') or state.get('query', '')
        
        if text:
            result = await ner_service.extract_entities(text)
            entities = [
                {
                    "text": e.text,
                    "type": e.entity_type,
                    "confidence": e.confidence
                }
                for e in result.entities
            ]
    except Exception as e:
        logger.warning("entity_extraction_failed", error=str(e))
    
    return {
        "skill_type": "extraction",
        "entities": entities,
        "entity_count": len(entities)
    }


async def _execute_classification_skill(
    state: AgentState,
    skill_data: Dict,
    config: Dict
) -> Dict[str, Any]:
    """Execute classification skill"""
    # Placeholder: Implement actual classification
    return {
        "skill_type": "classification",
        "category": "general",
        "confidence": 0.85
    }


async def _execute_general_skill(
    state: AgentState,
    skill_data: Dict,
    config: Dict
) -> Dict[str, Any]:
    """Execute general skill"""
    return {
        "skill_type": "general",
        "executed": True,
        "skill_name": skill_data['name']
    }

