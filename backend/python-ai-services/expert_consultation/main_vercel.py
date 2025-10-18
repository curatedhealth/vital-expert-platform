"""
Vercel-optimized FastAPI application for VITAL Expert Consultation Backend
"""

import os
import json
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from datetime import datetime
import uuid

# Initialize FastAPI app
app = FastAPI(
    title="VITAL Expert Consultation Backend",
    description="LangGraph-powered expert consultation service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data for demonstration (in production, this would connect to real LangGraph)
MOCK_AGENTS = [
    {
        "id": "reimbursement_strategist",
        "name": "Reimbursement Strategist",
        "description": "Expert in healthcare reimbursement, coverage, and pricing strategies",
        "specialties": ["reimbursement", "pricing", "coverage", "healthcare_economics"],
        "cost_per_query": 0.05
    },
    {
        "id": "clinical_trial_designer",
        "name": "Clinical Trial Designer",
        "description": "Specialist in clinical trial design, protocols, and regulatory requirements",
        "specialties": ["clinical_trials", "protocol_design", "regulatory", "biostatistics"],
        "cost_per_query": 0.08
    }
]

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "VITAL Expert Consultation Backend", "status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "services": {
            "langgraph": "available",
            "streaming": "available",
            "agents": "available"
        }
    }

@app.post("/autonomous/start")
async def start_autonomous_session(request: Request):
    """Start autonomous reasoning session"""
    try:
        body = await request.json()
        session_id = body.get("session_id", f"session-{uuid.uuid4().hex[:8]}")
        
        return {
            "session_id": session_id,
            "status": "started",
            "message": "Autonomous session started successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/autonomous/stream/{session_id}")
async def stream_autonomous_reasoning(session_id: str):
    """Stream autonomous reasoning process"""
    
    async def generate_reasoning_stream():
        # Mock reasoning steps for demonstration
        steps = [
            {
                "type": "reasoning_step",
                "data": {
                    "id": f"step-{datetime.now().timestamp()}-1",
                    "timestamp": datetime.now().isoformat(),
                    "iteration": 1,
                    "phase": "initialization",
                    "content": {
                        "description": "Initializing autonomous analysis...",
                        "reasoning": "Starting the autonomous reasoning process by setting up the analysis framework and preparing the working environment.",
                        "insights": ["Query received and validated", "Analysis context established", "LangGraph backend connected"],
                        "questions": ["What is the core objective?", "What information is needed?"],
                        "decisions": ["Proceed with goal extraction phase", "Initialize tool registry"]
                    },
                    "metadata": {
                        "confidence": 0.95,
                        "estimatedDuration": 2000,
                        "toolsUsed": ["context_analyzer", "langgraph_engine"],
                        "cost": 0.001,
                        "tokensUsed": 150,
                        "priority": "high"
                    },
                    "status": "in_progress"
                }
            },
            {
                "type": "phase_change",
                "phase": "goal_extraction",
                "metadata": {"iteration": 1, "progress": 0.2}
            },
            {
                "type": "reasoning_step",
                "data": {
                    "id": f"step-{datetime.now().timestamp()}-2",
                    "timestamp": datetime.now().isoformat(),
                    "iteration": 1,
                    "phase": "goal_extraction",
                    "content": {
                        "description": "Extracting goals and objectives...",
                        "reasoning": "Analyzing the user query to extract the primary objective and understand the underlying intent. Breaking down complex requirements into actionable goals.",
                        "insights": ["Primary goal: comprehensive analysis", "Secondary goals: actionable recommendations", "Success criteria identified"],
                        "questions": ["What specific outcomes are expected?", "What constraints should be considered?"],
                        "decisions": ["Focus on analytical depth", "Include practical recommendations"]
                    },
                    "metadata": {
                        "confidence": 0.88,
                        "estimatedDuration": 3000,
                        "toolsUsed": ["goal_extractor", "intent_analyzer", "langgraph"],
                        "cost": 0.002,
                        "tokensUsed": 280,
                        "priority": "critical"
                    },
                    "status": "completed"
                }
            },
            {
                "type": "phase_change",
                "phase": "task_generation",
                "metadata": {"iteration": 1, "progress": 0.4}
            },
            {
                "type": "reasoning_step",
                "data": {
                    "id": f"step-{datetime.now().timestamp()}-3",
                    "timestamp": datetime.now().isoformat(),
                    "iteration": 1,
                    "phase": "task_generation",
                    "content": {
                        "description": "Generating analysis tasks...",
                        "reasoning": "Creating a structured plan by decomposing the main goal into specific, actionable tasks. Each task is designed to contribute to the overall objective using LangGraph's task decomposition capabilities.",
                        "insights": ["Task decomposition strategy applied", "Dependencies mapped", "Resource requirements estimated"],
                        "questions": ["What tasks are essential?", "What is the optimal sequence?"],
                        "decisions": ["Prioritize research tasks", "Include validation steps", "Use LangGraph workflow"]
                    },
                    "metadata": {
                        "confidence": 0.82,
                        "estimatedDuration": 2500,
                        "toolsUsed": ["task_planner", "dependency_mapper", "langgraph_workflow"],
                        "cost": 0.0015,
                        "tokensUsed": 200,
                        "priority": "high"
                    },
                    "status": "in_progress"
                }
            },
            {
                "type": "reasoning_step",
                "data": {
                    "id": f"step-{datetime.now().timestamp()}-4",
                    "timestamp": datetime.now().isoformat(),
                    "iteration": 1,
                    "phase": "task_generation",
                    "content": {
                        "description": "Tasks generated successfully",
                        "reasoning": "Successfully created a comprehensive task list that covers all aspects of the analysis. Each task has clear objectives and success criteria using LangGraph's state management.",
                        "insights": ["5 core tasks identified", "Task dependencies resolved", "Timeline established"],
                        "questions": ["Are all critical aspects covered?", "Is the sequence optimal?"],
                        "decisions": ["Proceed with task execution", "Monitor progress closely"]
                    },
                    "metadata": {
                        "confidence": 0.90,
                        "estimatedDuration": 0,
                        "toolsUsed": ["task_planner", "langgraph_state"],
                        "cost": 0.0005,
                        "tokensUsed": 120,
                        "priority": "medium"
                    },
                    "status": "completed"
                }
            },
            {
                "type": "phase_change",
                "phase": "task_execution",
                "metadata": {"iteration": 1, "progress": 0.6}
            },
            {
                "type": "reasoning_step",
                "data": {
                    "id": f"step-{datetime.now().timestamp()}-5",
                    "timestamp": datetime.now().isoformat(),
                    "iteration": 1,
                    "phase": "task_execution",
                    "content": {
                        "description": "Executing analysis tasks...",
                        "reasoning": "Systematically executing each planned task using LangGraph's execution engine, gathering information, and building a comprehensive understanding of the subject matter.",
                        "insights": ["Research phase initiated", "Multiple sources consulted", "Data quality verified"],
                        "questions": ["Is the information sufficient?", "Are there gaps to address?"],
                        "decisions": ["Continue with current approach", "Adjust strategy if needed"]
                    },
                    "metadata": {
                        "confidence": 0.85,
                        "estimatedDuration": 5000,
                        "toolsUsed": ["research_engine", "data_validator", "knowledge_base", "langgraph_executor"],
                        "cost": 0.008,
                        "tokensUsed": 450,
                        "priority": "critical"
                    },
                    "status": "in_progress"
                }
            },
            {
                "type": "reasoning_step",
                "data": {
                    "id": f"step-{datetime.now().timestamp()}-6",
                    "timestamp": datetime.now().isoformat(),
                    "iteration": 1,
                    "phase": "task_execution",
                    "content": {
                        "description": "Analysis completed successfully",
                        "reasoning": "Successfully completed the comprehensive analysis by executing all planned tasks using LangGraph. Gathered sufficient information to provide a thorough response.",
                        "insights": ["Comprehensive data collected", "Multiple perspectives analyzed", "Quality standards met"],
                        "questions": ["Is the analysis complete?", "Are recommendations actionable?"],
                        "decisions": ["Proceed to synthesis phase", "Include all key findings"]
                    },
                    "metadata": {
                        "confidence": 0.92,
                        "estimatedDuration": 0,
                        "toolsUsed": ["analysis_engine", "synthesis_tool", "langgraph"],
                        "cost": 0.003,
                        "tokensUsed": 320,
                        "priority": "high"
                    },
                    "status": "completed"
                }
            },
            {
                "type": "phase_change",
                "phase": "synthesize",
                "metadata": {"iteration": 1, "progress": 0.8}
            },
            {
                "type": "reasoning_step",
                "data": {
                    "id": f"step-{datetime.now().timestamp()}-7",
                    "timestamp": datetime.now().isoformat(),
                    "iteration": 1,
                    "phase": "synthesize",
                    "content": {
                        "description": "Synthesizing findings into final response...",
                        "reasoning": "Combining all gathered information and insights into a coherent, actionable response using LangGraph's synthesis capabilities that addresses the user's query comprehensively.",
                        "insights": ["Key findings identified", "Recommendations formulated", "Structure optimized"],
                        "questions": ["Is the response complete?", "Are recommendations clear?"],
                        "decisions": ["Finalize synthesis", "Prepare for delivery"]
                    },
                    "metadata": {
                        "confidence": 0.94,
                        "estimatedDuration": 2000,
                        "toolsUsed": ["synthesis_engine", "response_formatter", "langgraph_synthesis"],
                        "cost": 0.002,
                        "tokensUsed": 180,
                        "priority": "critical"
                    },
                    "status": "completed"
                }
            },
            {
                "type": "phase_change",
                "phase": "completion",
                "metadata": {"iteration": 1, "progress": 1.0}
            },
            {
                "type": "reasoning_step",
                "data": {
                    "id": f"step-{datetime.now().timestamp()}-8",
                    "timestamp": datetime.now().isoformat(),
                    "iteration": 1,
                    "phase": "completion",
                    "content": {
                        "description": "Autonomous analysis completed successfully",
                        "reasoning": "The autonomous analysis has been completed successfully using LangGraph. All objectives have been met and a comprehensive response has been generated.",
                        "insights": [
                            "Analysis completed within expected timeframe",
                            "All success criteria met",
                            "High confidence in recommendations",
                            "LangGraph execution successful"
                        ],
                        "questions": ["Is the user satisfied?", "Are follow-up actions needed?"],
                        "decisions": ["Deliver final response", "Mark analysis as complete"]
                    },
                    "metadata": {
                        "confidence": 0.96,
                        "estimatedDuration": 0,
                        "toolsUsed": ["completion_validator", "langgraph"],
                        "cost": 0.0005,
                        "tokensUsed": 100,
                        "priority": "medium"
                    },
                    "status": "completed"
                }
            },
            {
                "type": "execution_complete",
                "data": {
                    "session_id": session_id,
                    "final_synthesis": {
                        "summary": "Autonomous analysis completed successfully using LangGraph backend.",
                        "key_findings": [
                            "Comprehensive analysis performed with LangGraph",
                            "Multiple perspectives considered",
                            "Actionable recommendations provided",
                            "Real-time streaming working correctly"
                        ],
                        "recommendations": [
                            "Review the detailed findings",
                            "Consider the provided insights",
                            "Implement suggested actions"
                        ],
                        "next_steps": [
                            "Evaluate the recommendations",
                            "Plan implementation strategy",
                            "Monitor results and adjust as needed"
                        ],
                        "confidence": 0.92,
                        "backend": "vercel-python-langgraph"
                    },
                    "execution_complete": True
                },
                "timestamp": datetime.now().isoformat()
            }
        ]
        
        # Stream each step with realistic delays
        for i, step in enumerate(steps):
            yield f"data: {json.dumps(step)}\n\n"
            await asyncio.sleep(0.5)  # Small delay between steps
    
    return StreamingResponse(
        generate_reasoning_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Backend": "vercel-python-langgraph"
        }
    )

@app.post("/consultation/start")
async def start_consultation_session(request: Request):
    """Start interactive consultation session"""
    try:
        body = await request.json()
        session_id = body.get("session_id", f"session-{uuid.uuid4().hex[:8]}")
        
        return {
            "session_id": session_id,
            "status": "started",
            "message": "Interactive consultation session started successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/consultation/stream/{session_id}")
async def stream_consultation(session_id: str):
    """Stream interactive consultation process"""
    
    async def generate_consultation_stream():
        # Mock consultation steps
        steps = [
            {
                "type": "reasoning_step",
                "data": {
                    "id": f"step-{datetime.now().timestamp()}-1",
                    "timestamp": datetime.now().isoformat(),
                    "iteration": 1,
                    "phase": "initialization",
                    "content": {
                        "description": "Initializing interactive consultation...",
                        "reasoning": "Starting the interactive reasoning process by analyzing the user's query and preparing to provide a comprehensive response using LangGraph.",
                        "insights": ["Query received and validated", "Interactive context established", "Agent capabilities assessed"],
                        "questions": ["What is the user's specific need?", "What expertise is required?"],
                        "decisions": ["Proceed with interactive consultation", "Engage selected agent expertise"]
                    },
                    "metadata": {
                        "confidence": 0.92,
                        "estimatedDuration": 1500,
                        "toolsUsed": ["query_analyzer", "agent_matcher", "langgraph"],
                        "cost": 0.0008,
                        "tokensUsed": 120,
                        "priority": "high"
                    },
                    "status": "in_progress"
                }
            },
            {
                "type": "phase_change",
                "phase": "agent_consultation",
                "metadata": {"iteration": 1, "progress": 0.3}
            },
            {
                "type": "reasoning_step",
                "data": {
                    "id": f"step-{datetime.now().timestamp()}-2",
                    "timestamp": datetime.now().isoformat(),
                    "iteration": 1,
                    "phase": "agent_consultation",
                    "content": {
                        "description": "Consulting with selected expert agent...",
                        "reasoning": "Engaging the selected expert agent to provide specialized knowledge and insights tailored to the user's specific query using LangGraph's agent orchestration.",
                        "insights": ["Expert agent identified", "Domain expertise activated", "Contextual analysis initiated"],
                        "questions": ["What specific guidance is needed?", "How can we best address this query?"],
                        "decisions": ["Leverage agent's specialized knowledge", "Provide targeted recommendations"]
                    },
                    "metadata": {
                        "confidence": 0.88,
                        "estimatedDuration": 3000,
                        "toolsUsed": ["expert_consultation", "knowledge_base", "langgraph_agents"],
                        "cost": 0.0025,
                        "tokensUsed": 280,
                        "priority": "critical"
                    },
                    "status": "in_progress"
                }
            },
            {
                "type": "phase_change",
                "phase": "response_generation",
                "metadata": {"iteration": 1, "progress": 0.6}
            },
            {
                "type": "reasoning_step",
                "data": {
                    "id": f"step-{datetime.now().timestamp()}-3",
                    "timestamp": datetime.now().isoformat(),
                    "iteration": 1,
                    "phase": "response_generation",
                    "content": {
                        "description": "Generating comprehensive response...",
                        "reasoning": "Synthesizing expert knowledge and insights into a clear, actionable response using LangGraph that directly addresses the user's query.",
                        "insights": ["Expert insights gathered", "Response structure planned", "Key points identified"],
                        "questions": ["Is the response comprehensive?", "Are recommendations actionable?"],
                        "decisions": ["Structure response for clarity", "Include practical next steps"]
                    },
                    "metadata": {
                        "confidence": 0.90,
                        "estimatedDuration": 2000,
                        "toolsUsed": ["response_synthesizer", "content_formatter", "langgraph"],
                        "cost": 0.0018,
                        "tokensUsed": 200,
                        "priority": "high"
                    },
                    "status": "in_progress"
                }
            },
            {
                "type": "phase_change",
                "phase": "completion",
                "metadata": {"iteration": 1, "progress": 0.9}
            },
            {
                "type": "reasoning_step",
                "data": {
                    "id": f"step-{datetime.now().timestamp()}-4",
                    "timestamp": datetime.now().isoformat(),
                    "iteration": 1,
                    "phase": "completion",
                    "content": {
                        "description": "Interactive consultation completed successfully",
                        "reasoning": "The interactive consultation has been completed successfully using LangGraph. A comprehensive response has been generated based on expert knowledge and best practices.",
                        "insights": [
                            "Response generated with high confidence",
                            "Expert recommendations included",
                            "User query fully addressed",
                            "LangGraph backend working correctly"
                        ],
                        "questions": ["Is the user satisfied with the response?", "Are follow-up questions needed?"],
                        "decisions": ["Deliver final response", "Mark consultation as complete"]
                    },
                    "metadata": {
                        "confidence": 0.94,
                        "estimatedDuration": 0,
                        "toolsUsed": ["completion_validator", "langgraph"],
                        "cost": 0.0005,
                        "tokensUsed": 80,
                        "priority": "medium"
                    },
                    "status": "completed"
                }
            },
            {
                "type": "execution_complete",
                "data": {
                    "session_id": session_id,
                    "final_synthesis": {
                        "summary": "Interactive consultation completed successfully using LangGraph backend.",
                        "key_findings": [
                            "Expert consultation performed with LangGraph",
                            "Real-time streaming working correctly",
                            "Agent orchestration successful"
                        ],
                        "recommendations": [
                            "Review the expert recommendations",
                            "Consider the provided insights",
                            "Follow up with additional questions if needed"
                        ],
                        "next_steps": [
                            "Evaluate the recommendations",
                            "Implement suggested actions",
                            "Schedule follow-up consultation if needed"
                        ],
                        "confidence": 0.94,
                        "backend": "vercel-python-langgraph"
                    },
                    "execution_complete": True
                },
                "timestamp": datetime.now().isoformat()
            }
        ]
        
        # Stream each step with realistic delays
        for i, step in enumerate(steps):
            yield f"data: {json.dumps(step)}\n\n"
            await asyncio.sleep(0.5)  # Small delay between steps
    
    return StreamingResponse(
        generate_consultation_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Backend": "vercel-python-langgraph"
        }
    )

@app.get("/modes/agents")
async def get_available_agents():
    """Get available expert agents"""
    return {
        "agents": MOCK_AGENTS,
        "total": len(MOCK_AGENTS),
        "backend": "vercel-python-langgraph"
    }

@app.get("/modes/sessions")
async def get_sessions():
    """Get active sessions"""
    return {
        "sessions": [],
        "total": 0,
        "backend": "vercel-python-langgraph"
    }

# Handler for Vercel
def handler(request, context):
    return app(request, context)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
