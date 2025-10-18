"""
Execution Analyzer for VITAL Expert Consultation

Provides comprehensive post-execution analysis, metrics collection,
and insights generation for autonomous agent performance.
"""

from typing import Dict, List, Any, Optional, Tuple
import asyncio
import json
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from collections import defaultdict, Counter
import statistics

from ..session.session_manager import SessionManager, SessionMetadata
from ..redis.redis_manager import RedisManager


@dataclass
class ExecutionMetrics:
    """Comprehensive execution metrics"""
    session_id: str
    user_id: str
    agent_id: str
    query: str
    mode: str
    agent_selection_mode: str
    
    # Performance metrics
    total_duration: float  # seconds
    total_cost: float
    budget_utilization: float
    iterations_completed: int
    max_iterations: int
    completion_rate: float
    
    # Quality metrics
    reasoning_steps_count: int
    evidence_sources_count: int
    tools_used_count: int
    domains_accessed_count: int
    confidence_score: float
    validation_score: float
    
    # Efficiency metrics
    cost_per_iteration: float
    time_per_iteration: float
    cost_per_evidence: float
    time_per_reasoning_step: float
    
    # Error metrics
    error_count: int
    retry_count: int
    intervention_count: int
    
    # Timestamps
    started_at: datetime
    completed_at: datetime
    created_at: datetime


@dataclass
class PerformanceInsights:
    """Performance insights and recommendations"""
    session_id: str
    overall_score: float  # 0-100
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    cost_efficiency: str  # "excellent", "good", "fair", "poor"
    time_efficiency: str
    quality_score: str
    generated_at: datetime


@dataclass
class PatternAnalysis:
    """Pattern analysis across multiple sessions"""
    pattern_type: str
    frequency: int
    impact_score: float
    description: str
    examples: List[str]
    recommendations: List[str]


class ExecutionAnalyzer:
    """Analyzes execution performance and generates insights"""
    
    def __init__(
        self,
        session_manager: SessionManager,
        redis_manager: RedisManager
    ):
        self.session_manager = session_manager
        self.redis_manager = redis_manager
        
        # Analysis cache
        self.metrics_cache: Dict[str, ExecutionMetrics] = {}
        self.insights_cache: Dict[str, PerformanceInsights] = {}
    
    async def analyze_session(
        self, 
        session_id: str
    ) -> Optional[ExecutionMetrics]:
        """Analyze a single session execution"""
        try:
            # Get session metadata
            session = await self.session_manager.get_session(session_id)
            if not session:
                return None
            
            # Get reasoning steps history
            history = await self.session_manager.get_session_history(session_id)
            
            # Get execution state
            execution_state = await self.redis_manager.get_execution_state(session_id)
            
            # Calculate metrics
            metrics = await self._calculate_metrics(session, history, execution_state)
            
            # Cache metrics
            self.metrics_cache[session_id] = metrics
            
            return metrics
            
        except Exception as e:
            print(f"Error analyzing session {session_id}: {e}")
            return None
    
    async def generate_insights(
        self, 
        session_id: str
    ) -> Optional[PerformanceInsights]:
        """Generate performance insights for a session"""
        try:
            # Get or calculate metrics
            metrics = self.metrics_cache.get(session_id)
            if not metrics:
                metrics = await self.analyze_session(session_id)
                if not metrics:
                    return None
            
            # Generate insights
            insights = await self._generate_session_insights(metrics)
            
            # Cache insights
            self.insights_cache[session_id] = insights
            
            return insights
            
        except Exception as e:
            print(f"Error generating insights for session {session_id}: {e}")
            return None
    
    async def analyze_user_performance(
        self, 
        user_id: str, 
        days: int = 30
    ) -> Dict[str, Any]:
        """Analyze user's overall performance across sessions"""
        try:
            # Get user sessions
            sessions = await self.session_manager.get_user_sessions(user_id, limit=1000)
            
            # Filter by date range
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            recent_sessions = [
                s for s in sessions 
                if s.created_at >= cutoff_date
            ]
            
            if not recent_sessions:
                return {"error": "No sessions found for analysis"}
            
            # Analyze each session
            all_metrics = []
            for session in recent_sessions:
                metrics = await self.analyze_session(session.session_id)
                if metrics:
                    all_metrics.append(metrics)
            
            if not all_metrics:
                return {"error": "No metrics available for analysis"}
            
            # Calculate aggregate metrics
            return await self._calculate_aggregate_metrics(all_metrics)
            
        except Exception as e:
            print(f"Error analyzing user performance: {e}")
            return {"error": str(e)}
    
    async def analyze_agent_performance(
        self, 
        agent_id: str, 
        days: int = 30
    ) -> Dict[str, Any]:
        """Analyze agent's performance across all users"""
        try:
            # This would require querying all sessions for the agent
            # For now, return placeholder
            return {
                "agent_id": agent_id,
                "analysis_period_days": days,
                "status": "Analysis not yet implemented",
                "note": "Requires cross-user session querying"
            }
            
        except Exception as e:
            print(f"Error analyzing agent performance: {e}")
            return {"error": str(e)}
    
    async def detect_patterns(
        self, 
        user_id: str = None,
        agent_id: str = None,
        days: int = 30
    ) -> List[PatternAnalysis]:
        """Detect patterns in execution behavior"""
        try:
            # Get sessions for analysis
            if user_id:
                sessions = await self.session_manager.get_user_sessions(user_id, limit=1000)
            else:
                # This would require a method to get all sessions
                sessions = []
            
            # Filter by date range
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            recent_sessions = [
                s for s in sessions 
                if s.created_at >= cutoff_date
            ]
            
            if not recent_sessions:
                return []
            
            # Analyze patterns
            patterns = []
            
            # Pattern 1: High cost sessions
            high_cost_sessions = [
                s for s in recent_sessions 
                if s.total_cost > s.budget * 0.8
            ]
            if len(high_cost_sessions) > len(recent_sessions) * 0.3:
                patterns.append(PatternAnalysis(
                    pattern_type="high_cost_usage",
                    frequency=len(high_cost_sessions),
                    impact_score=0.8,
                    description="Frequent high-cost sessions detected",
                    examples=[s.session_id for s in high_cost_sessions[:3]],
                    recommendations=[
                        "Consider reducing budget limits",
                        "Optimize query complexity",
                        "Use more specific queries"
                    ]
                ))
            
            # Pattern 2: Frequent failures
            failed_sessions = [
                s for s in recent_sessions 
                if s.status == "failed"
            ]
            if len(failed_sessions) > len(recent_sessions) * 0.2:
                patterns.append(PatternAnalysis(
                    pattern_type="high_failure_rate",
                    frequency=len(failed_sessions),
                    impact_score=0.9,
                    description="High failure rate detected",
                    examples=[s.session_id for s in failed_sessions[:3]],
                    recommendations=[
                        "Review error logs",
                        "Check agent selection logic",
                        "Improve error handling"
                    ]
                ))
            
            # Pattern 3: Long execution times
            long_sessions = [
                s for s in recent_sessions 
                if (s.updated_at - s.created_at).total_seconds() > 300  # 5 minutes
            ]
            if len(long_sessions) > len(recent_sessions) * 0.25:
                patterns.append(PatternAnalysis(
                    pattern_type="long_execution_times",
                    frequency=len(long_sessions),
                    impact_score=0.6,
                    description="Frequent long execution times",
                    examples=[s.session_id for s in long_sessions[:3]],
                    recommendations=[
                        "Optimize reasoning algorithms",
                        "Reduce max iterations",
                        "Improve tool selection"
                    ]
                ))
            
            return patterns
            
        except Exception as e:
            print(f"Error detecting patterns: {e}")
            return []
    
    async def get_system_analytics(
        self, 
        days: int = 7
    ) -> Dict[str, Any]:
        """Get system-wide analytics"""
        try:
            # Get system metrics from Redis
            system_metrics = await self.redis_manager.get_system_metrics()
            
            # Get active sessions
            active_sessions = await self.redis_manager.get_active_sessions()
            
            # Calculate additional metrics
            total_sessions = len(active_sessions)
            running_sessions = sum(
                1 for session_id in active_sessions
                if await self._is_session_running(session_id)
            )
            
            return {
                "period_days": days,
                "total_active_sessions": total_sessions,
                "running_sessions": running_sessions,
                "paused_sessions": total_sessions - running_sessions,
                "total_cost": system_metrics.get("total_cost", 0.0),
                "total_budget": system_metrics.get("total_budget", 0.0),
                "cost_utilization": system_metrics.get("cost_utilization", 0.0),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"Error getting system analytics: {e}")
            return {"error": str(e)}
    
    async def _calculate_metrics(
        self,
        session: SessionMetadata,
        history: List[Dict[str, Any]],
        execution_state: Optional[Any]
    ) -> ExecutionMetrics:
        """Calculate comprehensive metrics for a session"""
        try:
            # Basic metrics
            total_duration = (session.updated_at - session.created_at).total_seconds()
            budget_utilization = session.total_cost / session.budget if session.budget > 0 else 0
            completion_rate = session.current_iteration / session.max_iterations if session.max_iterations > 0 else 0
            
            # Quality metrics
            reasoning_steps_count = len([h for h in history if h.get("phase") == "reason"])
            evidence_sources_count = len(set(
                h.get("metadata", {}).get("source", "unknown")
                for h in history
            ))
            tools_used_count = len(set(
                h.get("metadata", {}).get("tool", "unknown")
                for h in history
            ))
            domains_accessed_count = len(set(
                h.get("metadata", {}).get("domain", "unknown")
                for h in history
            ))
            
            # Calculate confidence and validation scores
            confidence_scores = [
                h.get("metadata", {}).get("confidence", 0.5)
                for h in history
                if h.get("metadata", {}).get("confidence")
            ]
            confidence_score = statistics.mean(confidence_scores) if confidence_scores else 0.5
            
            validation_scores = [
                h.get("metadata", {}).get("validation_score", 5)
                for h in history
                if h.get("metadata", {}).get("validation_score")
            ]
            validation_score = statistics.mean(validation_scores) if validation_scores else 5
            
            # Efficiency metrics
            cost_per_iteration = session.total_cost / session.current_iteration if session.current_iteration > 0 else 0
            time_per_iteration = total_duration / session.current_iteration if session.current_iteration > 0 else 0
            cost_per_evidence = session.total_cost / evidence_sources_count if evidence_sources_count > 0 else 0
            time_per_reasoning_step = total_duration / reasoning_steps_count if reasoning_steps_count > 0 else 0
            
            # Error metrics
            error_count = len([h for h in history if "error" in h.get("content", "").lower()])
            retry_count = len([h for h in history if "retry" in h.get("content", "").lower()])
            intervention_count = len([h for h in history if h.get("phase") == "execution_control"])
            
            return ExecutionMetrics(
                session_id=session.session_id,
                user_id=session.user_id,
                agent_id=session.agent_id,
                query=session.query,
                mode=session.mode,
                agent_selection_mode=session.agent_selection_mode,
                total_duration=total_duration,
                total_cost=session.total_cost,
                budget_utilization=budget_utilization,
                iterations_completed=session.current_iteration,
                max_iterations=session.max_iterations,
                completion_rate=completion_rate,
                reasoning_steps_count=reasoning_steps_count,
                evidence_sources_count=evidence_sources_count,
                tools_used_count=tools_used_count,
                domains_accessed_count=domains_accessed_count,
                confidence_score=confidence_score,
                validation_score=validation_score,
                cost_per_iteration=cost_per_iteration,
                time_per_iteration=time_per_iteration,
                cost_per_evidence=cost_per_evidence,
                time_per_reasoning_step=time_per_reasoning_step,
                error_count=error_count,
                retry_count=retry_count,
                intervention_count=intervention_count,
                started_at=session.created_at,
                completed_at=session.updated_at,
                created_at=datetime.utcnow()
            )
            
        except Exception as e:
            print(f"Error calculating metrics: {e}")
            # Return minimal metrics
            return ExecutionMetrics(
                session_id=session.session_id,
                user_id=session.user_id,
                agent_id=session.agent_id,
                query=session.query,
                mode=session.mode,
                agent_selection_mode=session.agent_selection_mode,
                total_duration=0.0,
                total_cost=0.0,
                budget_utilization=0.0,
                iterations_completed=0,
                max_iterations=0,
                completion_rate=0.0,
                reasoning_steps_count=0,
                evidence_sources_count=0,
                tools_used_count=0,
                domains_accessed_count=0,
                confidence_score=0.5,
                validation_score=5.0,
                cost_per_iteration=0.0,
                time_per_iteration=0.0,
                cost_per_evidence=0.0,
                time_per_reasoning_step=0.0,
                error_count=0,
                retry_count=0,
                intervention_count=0,
                started_at=session.created_at,
                completed_at=session.updated_at,
                created_at=datetime.utcnow()
            )
    
    async def _generate_session_insights(
        self, 
        metrics: ExecutionMetrics
    ) -> PerformanceInsights:
        """Generate insights for a single session"""
        try:
            strengths = []
            weaknesses = []
            recommendations = []
            
            # Analyze performance
            overall_score = 0.0
            score_components = []
            
            # Cost efficiency analysis
            if metrics.budget_utilization <= 0.5:
                cost_efficiency = "excellent"
                strengths.append("Excellent cost efficiency")
                score_components.append(25)
            elif metrics.budget_utilization <= 0.8:
                cost_efficiency = "good"
                strengths.append("Good cost efficiency")
                score_components.append(20)
            elif metrics.budget_utilization <= 1.0:
                cost_efficiency = "fair"
                weaknesses.append("Moderate cost efficiency")
                score_components.append(15)
            else:
                cost_efficiency = "poor"
                weaknesses.append("Poor cost efficiency - exceeded budget")
                recommendations.append("Consider reducing budget or optimizing query")
                score_components.append(5)
            
            # Time efficiency analysis
            if metrics.total_duration <= 60:  # 1 minute
                time_efficiency = "excellent"
                strengths.append("Very fast execution")
                score_components.append(25)
            elif metrics.total_duration <= 300:  # 5 minutes
                time_efficiency = "good"
                strengths.append("Good execution speed")
                score_components.append(20)
            elif metrics.total_duration <= 600:  # 10 minutes
                time_efficiency = "fair"
                weaknesses.append("Moderate execution speed")
                score_components.append(15)
            else:
                time_efficiency = "poor"
                weaknesses.append("Slow execution")
                recommendations.append("Consider optimizing reasoning algorithms")
                score_components.append(5)
            
            # Quality analysis
            if metrics.confidence_score >= 0.8 and metrics.validation_score >= 8:
                quality_score = "excellent"
                strengths.append("High quality reasoning")
                score_components.append(25)
            elif metrics.confidence_score >= 0.6 and metrics.validation_score >= 6:
                quality_score = "good"
                strengths.append("Good quality reasoning")
                score_components.append(20)
            elif metrics.confidence_score >= 0.4 and metrics.validation_score >= 4:
                quality_score = "fair"
                weaknesses.append("Moderate quality reasoning")
                score_components.append(15)
            else:
                quality_score = "poor"
                weaknesses.append("Low quality reasoning")
                recommendations.append("Improve reasoning algorithms or agent selection")
                score_components.append(5)
            
            # Completion analysis
            if metrics.completion_rate >= 0.9:
                strengths.append("High completion rate")
                score_components.append(25)
            elif metrics.completion_rate >= 0.7:
                score_components.append(20)
            elif metrics.completion_rate >= 0.5:
                weaknesses.append("Moderate completion rate")
                score_components.append(15)
            else:
                weaknesses.append("Low completion rate")
                recommendations.append("Increase max iterations or improve error handling")
                score_components.append(5)
            
            # Calculate overall score
            overall_score = sum(score_components) if score_components else 0
            
            # Add general recommendations
            if metrics.error_count > 0:
                recommendations.append(f"Address {metrics.error_count} errors in execution")
            
            if metrics.intervention_count > 0:
                recommendations.append(f"Consider optimizing to reduce {metrics.intervention_count} user interventions")
            
            if metrics.evidence_sources_count < 3:
                recommendations.append("Increase evidence gathering for better quality")
            
            if not strengths:
                strengths.append("Session completed successfully")
            
            if not weaknesses:
                weaknesses.append("No significant issues detected")
            
            if not recommendations:
                recommendations.append("Continue current approach")
            
            return PerformanceInsights(
                session_id=metrics.session_id,
                overall_score=overall_score,
                strengths=strengths,
                weaknesses=weaknesses,
                recommendations=recommendations,
                cost_efficiency=cost_efficiency,
                time_efficiency=time_efficiency,
                quality_score=quality_score,
                generated_at=datetime.utcnow()
            )
            
        except Exception as e:
            print(f"Error generating session insights: {e}")
            return PerformanceInsights(
                session_id=metrics.session_id,
                overall_score=0.0,
                strengths=["Analysis completed"],
                weaknesses=["Analysis error occurred"],
                recommendations=["Review system logs"],
                cost_efficiency="unknown",
                time_efficiency="unknown",
                quality_score="unknown",
                generated_at=datetime.utcnow()
            )
    
    async def _calculate_aggregate_metrics(
        self, 
        all_metrics: List[ExecutionMetrics]
    ) -> Dict[str, Any]:
        """Calculate aggregate metrics across multiple sessions"""
        try:
            if not all_metrics:
                return {"error": "No metrics available"}
            
            # Calculate averages
            avg_duration = statistics.mean([m.total_duration for m in all_metrics])
            avg_cost = statistics.mean([m.total_cost for m in all_metrics])
            avg_budget_utilization = statistics.mean([m.budget_utilization for m in all_metrics])
            avg_completion_rate = statistics.mean([m.completion_rate for m in all_metrics])
            avg_confidence = statistics.mean([m.confidence_score for m in all_metrics])
            avg_validation = statistics.mean([m.validation_score for m in all_metrics])
            
            # Calculate totals
            total_sessions = len(all_metrics)
            total_duration = sum([m.total_duration for m in all_metrics])
            total_cost = sum([m.total_cost for m in all_metrics])
            total_errors = sum([m.error_count for m in all_metrics])
            total_interventions = sum([m.intervention_count for m in all_metrics])
            
            # Calculate distributions
            cost_distribution = {
                "excellent": len([m for m in all_metrics if m.budget_utilization <= 0.5]),
                "good": len([m for m in all_metrics if 0.5 < m.budget_utilization <= 0.8]),
                "fair": len([m for m in all_metrics if 0.8 < m.budget_utilization <= 1.0]),
                "poor": len([m for m in all_metrics if m.budget_utilization > 1.0])
            }
            
            time_distribution = {
                "excellent": len([m for m in all_metrics if m.total_duration <= 60]),
                "good": len([m for m in all_metrics if 60 < m.total_duration <= 300]),
                "fair": len([m for m in all_metrics if 300 < m.total_duration <= 600]),
                "poor": len([m for m in all_metrics if m.total_duration > 600])
            }
            
            return {
                "total_sessions": total_sessions,
                "avg_duration_seconds": avg_duration,
                "avg_cost": avg_cost,
                "avg_budget_utilization": avg_budget_utilization,
                "avg_completion_rate": avg_completion_rate,
                "avg_confidence_score": avg_confidence,
                "avg_validation_score": avg_validation,
                "total_duration_seconds": total_duration,
                "total_cost": total_cost,
                "total_errors": total_errors,
                "total_interventions": total_interventions,
                "cost_efficiency_distribution": cost_distribution,
                "time_efficiency_distribution": time_distribution,
                "analysis_timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"Error calculating aggregate metrics: {e}")
            return {"error": str(e)}
    
    async def _is_session_running(self, session_id: str) -> bool:
        """Check if a session is currently running"""
        try:
            execution_state = await self.redis_manager.get_execution_state(session_id)
            return execution_state and execution_state.status == "running"
        except:
            return False
