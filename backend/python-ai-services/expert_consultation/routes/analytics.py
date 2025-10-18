from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

router = APIRouter()

class AnalyticsResponse(BaseModel):
    session_id: str
    metrics: Dict[str, Any]
    insights: List[str]
    recommendations: List[str]

class PerformanceMetrics(BaseModel):
    total_sessions: int
    average_cost: float
    average_iterations: float
    success_rate: float
    average_duration: float

@router.get("/{session_id}", response_model=AnalyticsResponse)
async def get_session_analytics(session_id: str):
    """Get analytics for a specific session"""
    try:
        # In production, calculate from database
        metrics = {
            "cost_efficiency": 0.85,
            "iteration_efficiency": 0.78,
            "evidence_quality": 0.92,
            "goal_achievement": 0.88,
            "reasoning_quality": 0.90
        }
        
        insights = [
            "High-quality evidence gathered from multiple sources",
            "Efficient tool selection and execution",
            "Strong reasoning chain with clear progression"
        ]
        
        recommendations = [
            "Consider reducing iterations for similar queries",
            "Tool selection was optimal for this domain",
            "Reasoning pattern could be applied to similar cases"
        ]
        
        return AnalyticsResponse(
            session_id=session_id,
            metrics=metrics,
            insights=insights,
            recommendations=recommendations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")

@router.get("/performance/overview", response_model=PerformanceMetrics)
async def get_performance_overview(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """Get overall performance metrics"""
    try:
        # In production, calculate from database
        return PerformanceMetrics(
            total_sessions=150,
            average_cost=3.25,
            average_iterations=4.2,
            success_rate=0.94,
            average_duration=180.5  # seconds
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get performance metrics: {str(e)}")

@router.get("/costs/breakdown")
async def get_cost_breakdown(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """Get cost breakdown by phase and domain"""
    try:
        # In production, calculate from database
        return {
            "total_cost": 487.50,
            "cost_by_phase": {
                "think": 45.20,
                "plan": 38.75,
                "act": 125.30,
                "observe": 89.45,
                "reflect": 52.80,
                "synthesize": 136.00
            },
            "cost_by_domain": {
                "regulatory_affairs": 156.20,
                "clinical_development": 134.80,
                "medical_affairs": 98.45,
                "commercial_strategy": 97.05
            },
            "average_cost_per_session": 3.25
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cost breakdown: {str(e)}")

@router.get("/patterns/insights")
async def get_pattern_insights():
    """Get insights from pattern analysis"""
    try:
        # In production, calculate from historical data
        return {
            "common_query_patterns": [
                "Regulatory pathway questions",
                "Clinical trial design queries",
                "Market access strategies"
            ],
            "optimal_tool_combinations": [
                ["fda_database", "pubmed_search", "rag_search"],
                ["clinical_trials", "study_design", "rag_search"],
                ["web_search", "budget_calculator", "rag_search"]
            ],
            "efficiency_recommendations": [
                "Use parallel tool execution for faster results",
                "RAG search should be included in most queries",
                "Domain detection accuracy is 92%"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get pattern insights: {str(e)}")
