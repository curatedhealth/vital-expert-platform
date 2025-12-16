"""
Task Runners - 88 Core Cognitive Operations

Categories (22):
    UNDERSTAND (4): Scan, Explore, GapDetect, Extract
    EVALUATE (4): Critique, Compare, Score, Benchmark
    DECIDE (4): Frame, OptionGen, Tradeoff, Recommend
    INVESTIGATE (4): Detect, Hypothesize, Evidence, Conclude
    WATCH (4): Baseline, Delta, Alert, Trend
    SOLVE (4): Diagnose, Pathfind, Alternative, Unblock
    PREPARE (4): Context, Anticipate, Brief, TalkingPoint
    CREATE (4): Draft, Expand, Format, Citation
    REFINE (4): Critic, Mutate, Verify, Select
    VALIDATE (4): ComplianceCheck, FactCheck, CitationCheck, ConsistencyCheck
    SYNTHESIZE (4): Collect, Theme, Resolve, Narrate
    PLAN (4): Decompose, Dependency, Schedule, Resource
    PREDICT (4): TrendAnalyze, Scenario, Project, Uncertainty
    ENGAGE (4): Profile, Interest, Touchpoint, Message
    ALIGN (4): Position, CommonGround, Objection, Consensus
    INFLUENCE (4): AudienceAnalyze, PositionCalc, Argument, Counter
    ADAPT (4): Localize, AudienceAdapt, FormatConvert, RegAdapt
    DISCOVER (4): WhiteSpace, Differentiate, Repurpose, OpportunityScore
    DESIGN (4): PanelDesign, WorkflowDesign, EvalDesign, ResearchDesign
    GOVERN (4): PolicyCheck, Sanitize, AuditLog, PermissionCheck
    SECURE (4): Observe, Orient, ThreatDecide, Contain
    EXECUTE (4): StateRead, Transition, Action, Escalate

Total: 88 core runners
"""

from .base_task_runner import (
    TaskRunner,
    TaskRunnerInput,
    TaskRunnerOutput,
    TaskRunnerCategory,
)
from .registry import TaskRunnerRegistry, register_task_runner

__all__ = [
    "TaskRunner",
    "TaskRunnerInput",
    "TaskRunnerOutput",
    "TaskRunnerCategory",
    "TaskRunnerRegistry",
    "register_task_runner",
]
