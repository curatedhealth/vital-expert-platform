"""
Analytics Package for VITAL Expert Consultation

Provides comprehensive post-execution analysis, metrics collection,
and insights generation for autonomous agent performance.
"""

from .execution_analyzer import ExecutionAnalyzer, ExecutionMetrics, PerformanceInsights, PatternAnalysis

__all__ = ["ExecutionAnalyzer", "ExecutionMetrics", "PerformanceInsights", "PatternAnalysis"]
