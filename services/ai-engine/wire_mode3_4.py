#!/usr/bin/env python3
"""
Script to wire Mode 3 and 4 endpoints to LangGraph workflows
"""

# New Mode 3 implementation
MODE3_CODE = '''# Mode 3: Autonomous-Automatic
@app.post("/api/mode3/autonomous-automatic", response_model=Mode3AutonomousAutomaticResponse)
async def execute_mode3_autonomous_automatic(
    request: Mode3AutonomousAutomaticRequest,
    tenant_id: str = Depends(get_tenant_id)
):
    """Execute Mode 3 autonomous-automatic workflow via LangGraph"""
    REQUEST_COUNT.labels(method="POST", endpoint="/api/mode3/autonomous-automatic").inc()

    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase client not initialized")
    
    await set_tenant_context_in_db(tenant_id, supabase_client)
    start_time = asyncio.get_event_loop().time()

    try:
        logger.info("🚀 [Mode 3] Executing via LangGraph workflow (Autonomous + Auto agent selection)")
        
        # Initialize LangGraph workflow with autonomous capabilities
        workflow = Mode3AutonomousAutoWorkflow(
            supabase_client=supabase_client,
            agent_selector_service=get_agent_selector_service() if agent_orchestrator else None,
            rag_service=unified_rag_service,
            agent_orchestrator=agent_orchestrator,
            conversation_manager=None
        )
        await workflow.initialize()
        
        # Execute workflow
        result = await workflow.execute(
            tenant_id=tenant_id,
            query=request.message,
            session_id=request.session_id,
            user_id=request.user_id,
            enable_rag=request.enable_rag,
            enable_tools=request.enable_tools,
            model=request.model or "gpt-4",
            max_iterations=request.max_iterations or 10,
            confidence_threshold=request.confidence_threshold or 0.95,
            conversation_history=[]
        )
        
        processing_time_ms = (asyncio.get_event_loop().time() - start_time) * 1000
        
        # Extract results
        content = result.get('response', '') or result.get('final_response', '')
        confidence = result.get('confidence', 0.90)
        sources = result.get('sources', [])
        reasoning_steps = result.get('reasoning_steps', [])
        selected_agent_id = result.get('selected_agent_id', '') or result.get('agent_id', '')
        
        # Convert sources to citations
        citations = []
        for idx, source in enumerate(sources, 1):
            citations.append({
                "id": f"citation_{idx}",
                "title": source.get('title', f'Source {idx}'),
                "content": source.get('content', source.get('excerpt', '')),
                "url": source.get('url', ''),
                "similarity_score": source.get('similarity_score', 0.0),
                "metadata": source.get('metadata', {})
            })
        
        # Autonomous reasoning metadata
        autonomous_reasoning_metadata = {
            "iterations": result.get('iterations', 0),
            "tools_used": result.get('tools_used', []),
            "reasoning_steps": reasoning_steps,
            "confidence_threshold": request.confidence_threshold or 0.95,
            "max_iterations": request.max_iterations or 10,
            "strategy": result.get('strategy', 'react'),
        }
        
        # Agent selection metadata
        agent_selection_metadata = {
            "selected_agent_id": selected_agent_id,
            "selected_agent_name": result.get('selected_agent_name', 'Auto-selected'),
            "selection_method": "langgraph_ml_selection",
            "selection_confidence": result.get('selection_confidence', 0.85),
        }
        
        metadata: Dict[str, Any] = {
            "langgraph_execution": True,
            "workflow": "Mode3AutonomousAutoWorkflow",
            "nodes_executed": result.get('nodes_executed', []),
            "request": {
                "enable_rag": request.enable_rag,
                "enable_tools": request.enable_tools,
                "max_iterations": request.max_iterations,
                "confidence_threshold": request.confidence_threshold,
            },
        }
        
        logger.info(
            "✅ [Mode 3] LangGraph workflow completed",
            content_length=len(content),
            citations=len(citations),
            reasoning_steps=len(reasoning_steps),
            iterations=autonomous_reasoning_metadata['iterations'],
            confidence=confidence
        )
        
        return Mode3AutonomousAutomaticResponse(
            agent_id=selected_agent_id,
            content=content,
            confidence=confidence,
            citations=citations,
            reasoning=reasoning_steps,
            autonomous_reasoning=autonomous_reasoning_metadata,
            agent_selection=agent_selection_metadata,
            metadata=metadata,
            processing_time_ms=processing_time_ms,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("❌ Mode 3 LangGraph execution failed", error=str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Mode 3 execution failed: {str(exc)}")
'''

# New Mode 4 implementation
MODE4_CODE = '''# Mode 4: Autonomous-Manual
@app.post("/api/mode4/autonomous-manual", response_model=Mode4AutonomousManualResponse)
async def execute_mode4_autonomous_manual(
    request: Mode4AutonomousManualRequest,
    tenant_id: str = Depends(get_tenant_id)
):
    """Execute Mode 4 autonomous-manual workflow via LangGraph"""
    REQUEST_COUNT.labels(method="POST", endpoint="/api/mode4/autonomous-manual").inc()

    if not supabase_client:
        raise HTTPException(status_code=503, detail="Supabase client not initialized")
    
    await set_tenant_context_in_db(tenant_id, supabase_client)
    start_time = asyncio.get_event_loop().time()

    try:
        logger.info("🚀 [Mode 4] Executing via LangGraph workflow (Autonomous + Manual agent selection)", agent_id=request.agent_id)
        
        # Initialize LangGraph workflow with autonomous capabilities
        workflow = Mode4AutonomousManualWorkflow(
            supabase_client=supabase_client,
            rag_service=unified_rag_service,
            agent_orchestrator=agent_orchestrator,
            conversation_manager=None
        )
        await workflow.initialize()
        
        # Execute workflow
        result = await workflow.execute(
            tenant_id=tenant_id,
            query=request.message,
            agent_id=request.agent_id,
            session_id=request.session_id,
            user_id=request.user_id,
            enable_rag=request.enable_rag,
            enable_tools=request.enable_tools,
            model=request.model or "gpt-4",
            max_iterations=request.max_iterations or 10,
            confidence_threshold=request.confidence_threshold or 0.95,
            conversation_history=[]
        )
        
        processing_time_ms = (asyncio.get_event_loop().time() - start_time) * 1000
        
        # Extract results
        content = result.get('response', '') or result.get('final_response', '')
        confidence = result.get('confidence', 0.90)
        sources = result.get('sources', [])
        reasoning_steps = result.get('reasoning_steps', [])
        
        # Convert sources to citations
        citations = []
        for idx, source in enumerate(sources, 1):
            citations.append({
                "id": f"citation_{idx}",
                "title": source.get('title', f'Source {idx}'),
                "content": source.get('content', source.get('excerpt', '')),
                "url": source.get('url', ''),
                "similarity_score": source.get('similarity_score', 0.0),
                "metadata": source.get('metadata', {})
            })
        
        # Autonomous reasoning metadata
        autonomous_reasoning_metadata = {
            "iterations": result.get('iterations', 0),
            "tools_used": result.get('tools_used', []),
            "reasoning_steps": reasoning_steps,
            "confidence_threshold": request.confidence_threshold or 0.95,
            "max_iterations": request.max_iterations or 10,
            "strategy": result.get('strategy', 'react'),
            "final_answer_validated": result.get('validated', True),
        }
        
        metadata: Dict[str, Any] = {
            "langgraph_execution": True,
            "workflow": "Mode4AutonomousManualWorkflow",
            "nodes_executed": result.get('nodes_executed', []),
            "request": {
                "enable_rag": request.enable_rag,
                "enable_tools": request.enable_tools,
                "max_iterations": request.max_iterations,
                "confidence_threshold": request.confidence_threshold,
            },
        }
        
        logger.info(
            "✅ [Mode 4] LangGraph workflow completed",
            content_length=len(content),
            citations=len(citations),
            reasoning_steps=len(reasoning_steps),
            iterations=autonomous_reasoning_metadata['iterations'],
            confidence=confidence
        )
        
        return Mode4AutonomousManualResponse(
            agent_id=request.agent_id,
            content=content,
            confidence=confidence,
            citations=citations,
            reasoning=reasoning_steps,
            autonomous_reasoning=autonomous_reasoning_metadata,
            metadata=metadata,
            processing_time_ms=processing_time_ms,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("❌ Mode 4 LangGraph execution failed", error=str(exc), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Mode 4 execution failed: {str(exc)}")
'''

print("Mode 3 implementation:")
print(MODE3_CODE)
print("\n" + "="*80 + "\n")
print("Mode 4 implementation:")
print(MODE4_CODE)

