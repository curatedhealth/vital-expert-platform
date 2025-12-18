"""
L5 Execution Service

Service for managing missions, execution tracking, and runner coordination.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from ..base import OntologyLayerService
from .models import (
    Mission,
    MissionEvent,
    ExecutionConfig,
    ExecutionContext,
    MissionStatus,
    MissionMode,
    RunnerFamily,
)


class L5ExecutionService(OntologyLayerService[Mission]):
    """
    Service for L5 Execution layer.

    Provides operations for:
    - Mission CRUD
    - Event tracking
    - Runner family selection
    - Execution configuration
    - Progress monitoring
    """

    @property
    def layer_name(self) -> str:
        return "l5_execution"

    @property
    def primary_table(self) -> str:
        return "missions"

    def _to_model(self, data: Dict[str, Any]) -> Mission:
        return Mission(**data)

    # -------------------------------------------------------------------------
    # Mission Operations
    # -------------------------------------------------------------------------

    async def create_mission(
        self,
        user_id: str,
        query: str,
        mode: MissionMode = MissionMode.MODE_2,
        config: Optional[ExecutionConfig] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Optional[Mission]:
        """Create a new mission."""
        try:
            config = config or ExecutionConfig(mode=mode)

            mission_data = {
                "tenant_id": self.tenant_id,
                "user_id": user_id,
                "query": query,
                "mode": mode.value,
                "status": MissionStatus.PENDING.value,
                "runner_family": config.runner_family.value if config.runner_family else None,
                "max_iterations": config.max_iterations,
                "timeout_seconds": config.timeout_seconds,
                "context": context or {},
                "created_at": datetime.utcnow().isoformat(),
            }

            result = await self.supabase.table(self.primary_table)\
                .insert(mission_data)\
                .execute()

            if result.data:
                return self._to_model(result.data[0])
        except Exception as e:
            print(f"Error creating mission: {e}")
        return None

    async def get_missions(
        self,
        user_id: Optional[str] = None,
        status: Optional[MissionStatus] = None,
        mode: Optional[MissionMode] = None,
        limit: int = 50
    ) -> List[Mission]:
        """Get missions with optional filters."""
        try:
            query = self.supabase.table(self.primary_table)\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .order("created_at", desc=True)\
                .limit(limit)

            if user_id:
                query = query.eq("user_id", user_id)
            if status:
                query = query.eq("status", status.value)
            if mode:
                query = query.eq("mode", mode.value)

            result = await query.execute()
            return [self._to_model(row) for row in result.data]
        except Exception as e:
            print(f"Error fetching missions: {e}")
            return []

    async def update_mission_status(
        self,
        mission_id: str,
        status: MissionStatus,
        progress_percent: Optional[float] = None,
        error_message: Optional[str] = None
    ) -> bool:
        """Update mission status."""
        try:
            update_data = {
                "status": status.value,
                "updated_at": datetime.utcnow().isoformat()
            }

            if progress_percent is not None:
                update_data["progress_percent"] = progress_percent

            if error_message:
                update_data["error_message"] = error_message

            if status == MissionStatus.RUNNING:
                update_data["started_at"] = datetime.utcnow().isoformat()
            elif status in [MissionStatus.COMPLETED, MissionStatus.FAILED, MissionStatus.CANCELLED]:
                update_data["completed_at"] = datetime.utcnow().isoformat()

            await self.supabase.table(self.primary_table)\
                .update(update_data)\
                .eq("id", mission_id)\
                .eq("tenant_id", self.tenant_id)\
                .execute()

            return True
        except Exception as e:
            print(f"Error updating mission status: {e}")
            return False

    async def complete_mission(
        self,
        mission_id: str,
        result: Dict[str, Any],
        artifacts: Optional[List[Dict[str, Any]]] = None,
        total_tokens: int = 0,
        total_cost: float = 0.0
    ) -> bool:
        """Complete a mission with results."""
        try:
            mission = await self.get_by_id(mission_id)
            if not mission:
                return False

            duration = None
            if mission.started_at:
                duration = (datetime.utcnow() - mission.started_at).total_seconds()

            update_data = {
                "status": MissionStatus.COMPLETED.value,
                "progress_percent": 100.0,
                "result": result,
                "artifacts": artifacts or [],
                "total_tokens_used": total_tokens,
                "total_cost": total_cost,
                "completed_at": datetime.utcnow().isoformat(),
                "duration_seconds": duration,
                "updated_at": datetime.utcnow().isoformat()
            }

            await self.supabase.table(self.primary_table)\
                .update(update_data)\
                .eq("id", mission_id)\
                .eq("tenant_id", self.tenant_id)\
                .execute()

            return True
        except Exception as e:
            print(f"Error completing mission: {e}")
            return False

    # -------------------------------------------------------------------------
    # Event Operations
    # -------------------------------------------------------------------------

    async def log_event(
        self,
        mission_id: str,
        event_type: str,
        event_data: Optional[Dict[str, Any]] = None,
        step_number: Optional[int] = None,
        step_name: Optional[str] = None,
        agent_id: Optional[str] = None,
        agent_name: Optional[str] = None,
        duration_ms: Optional[int] = None
    ) -> Optional[MissionEvent]:
        """Log a mission event."""
        try:
            event_record = {
                "tenant_id": self.tenant_id,
                "mission_id": mission_id,
                "event_type": event_type,
                "event_data": event_data or {},
                "step_number": step_number,
                "step_name": step_name,
                "agent_id": agent_id,
                "agent_name": agent_name,
                "duration_ms": duration_ms,
                "timestamp": datetime.utcnow().isoformat()
            }

            result = await self.supabase.table("mission_events")\
                .insert(event_record)\
                .execute()

            if result.data:
                return MissionEvent(**result.data[0])
        except Exception as e:
            print(f"Error logging event: {e}")
        return None

    async def get_mission_events(
        self,
        mission_id: str,
        event_type: Optional[str] = None,
        limit: int = 100
    ) -> List[MissionEvent]:
        """Get events for a mission."""
        try:
            query = self.supabase.table("mission_events")\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .eq("mission_id", mission_id)\
                .order("timestamp")\
                .limit(limit)

            if event_type:
                query = query.eq("event_type", event_type)

            result = await query.execute()
            return [MissionEvent(**row) for row in result.data]
        except Exception as e:
            print(f"Error fetching mission events: {e}")
            return []

    # -------------------------------------------------------------------------
    # Runner Family Selection
    # -------------------------------------------------------------------------

    def recommend_runner_family(
        self,
        query: str,
        jtbd_runner_hint: Optional[str] = None
    ) -> RunnerFamily:
        """Recommend a runner family based on query analysis."""
        # Use JTBD hint if provided
        if jtbd_runner_hint:
            try:
                return RunnerFamily(jtbd_runner_hint.lower())
            except ValueError:
                pass

        query_lower = query.lower()

        # Pattern matching for runner selection
        patterns = {
            RunnerFamily.INVESTIGATE: ["investigate", "research", "analyze", "find", "search", "look into"],
            RunnerFamily.SYNTHESIZE: ["synthesize", "combine", "merge", "consolidate", "summarize"],
            RunnerFamily.VALIDATE: ["validate", "verify", "check", "confirm", "audit", "review"],
            RunnerFamily.CREATE: ["create", "generate", "write", "draft", "compose", "build"],
            RunnerFamily.DESIGN: ["design", "architect", "plan layout", "structure"],
            RunnerFamily.EVALUATE: ["evaluate", "assess", "score", "rate", "compare"],
            RunnerFamily.PLAN: ["plan", "strategy", "roadmap", "outline", "schedule"],
            RunnerFamily.EXECUTE: ["execute", "implement", "run", "perform", "do"],
            RunnerFamily.DISCOVER: ["discover", "explore", "uncover", "identify"],
            RunnerFamily.DECIDE: ["decide", "choose", "select", "determine"],
            RunnerFamily.PREDICT: ["predict", "forecast", "project", "estimate future"],
            RunnerFamily.SOLVE: ["solve", "fix", "resolve", "troubleshoot"],
            RunnerFamily.UNDERSTAND: ["understand", "explain", "clarify", "interpret"],
        }

        # Score each family
        scores = {family: 0 for family in patterns}
        for family, keywords in patterns.items():
            for keyword in keywords:
                if keyword in query_lower:
                    scores[family] += 1

        # Return highest scoring family, or default
        max_family = max(scores, key=scores.get)
        if scores[max_family] > 0:
            return max_family

        # Default to INVESTIGATE for research-like queries
        return RunnerFamily.INVESTIGATE

    # -------------------------------------------------------------------------
    # Configuration
    # -------------------------------------------------------------------------

    def get_execution_config(
        self,
        mode: MissionMode,
        runner_family: Optional[RunnerFamily] = None
    ) -> ExecutionConfig:
        """Get execution configuration for a mode."""
        configs = {
            MissionMode.MODE_1: ExecutionConfig(
                mode=MissionMode.MODE_1,
                timeout_seconds=30,
                step_timeout_seconds=10,
                max_iterations=1,
                max_tokens=4000,
                max_cost=0.10,
                enable_streaming=True,
                enable_checkpointing=False,
                enable_artifacts=False,
                quality_threshold=0.6,
                require_citations=False
            ),
            MissionMode.MODE_2: ExecutionConfig(
                mode=MissionMode.MODE_2,
                timeout_seconds=120,
                step_timeout_seconds=30,
                max_iterations=5,
                max_tokens=16000,
                max_cost=0.50,
                enable_streaming=True,
                enable_checkpointing=True,
                enable_artifacts=True,
                quality_threshold=0.7,
                require_citations=False
            ),
            MissionMode.MODE_3: ExecutionConfig(
                mode=MissionMode.MODE_3,
                timeout_seconds=600,
                step_timeout_seconds=120,
                max_iterations=20,
                max_tokens=100000,
                max_cost=5.0,
                enable_streaming=True,
                enable_checkpointing=True,
                enable_artifacts=True,
                quality_threshold=0.85,
                require_citations=True
            ),
            MissionMode.MODE_4: ExecutionConfig(
                mode=MissionMode.MODE_4,
                timeout_seconds=3600,
                step_timeout_seconds=300,
                max_iterations=50,
                max_tokens=500000,
                max_cost=25.0,
                enable_streaming=True,
                enable_checkpointing=True,
                enable_artifacts=True,
                quality_threshold=0.9,
                require_citations=True
            ),
        }

        config = configs.get(mode, configs[MissionMode.MODE_2])
        if runner_family:
            config.runner_family = runner_family
        return config

    # -------------------------------------------------------------------------
    # Context Resolution
    # -------------------------------------------------------------------------

    async def resolve_execution(
        self,
        query: str,
        mode: MissionMode = MissionMode.MODE_2,
        user_id: Optional[str] = None,
        jtbd_runner_hint: Optional[str] = None
    ) -> ExecutionContext:
        """
        Resolve execution context for a query.

        Args:
            query: User query
            mode: Execution mode
            user_id: Optional user ID for history
            jtbd_runner_hint: Hint from JTBD layer

        Returns:
            ExecutionContext with configuration and estimates
        """
        context = ExecutionContext()

        # Get base config for mode
        runner_family = self.recommend_runner_family(query, jtbd_runner_hint)
        context.config = self.get_execution_config(mode, runner_family)
        context.runner_family = runner_family

        # Get recent missions for user (for adaptive config)
        if user_id:
            recent = await self.get_missions(
                user_id=user_id,
                status=MissionStatus.COMPLETED,
                limit=10
            )

            # Analyze recent mission performance
            if recent:
                avg_duration = sum(m.duration_seconds or 0 for m in recent) / len(recent)
                avg_tokens = sum(m.total_tokens_used for m in recent) / len(recent)
                avg_cost = sum(m.total_cost for m in recent) / len(recent)

                context.estimated_duration_seconds = avg_duration * 1.2  # 20% buffer
                context.estimated_tokens = int(avg_tokens * 1.1)
                context.estimated_cost = avg_cost * 1.1
            else:
                # Default estimates
                context.estimated_duration_seconds = context.config.timeout_seconds * 0.5
                context.estimated_tokens = context.config.max_tokens * 0.3
                context.estimated_cost = context.config.max_cost * 0.3

        # Calculate confidence
        confidence = 0.5  # Base confidence
        if context.runner_family:
            confidence += 0.2
        if context.estimated_duration_seconds > 0:
            confidence += 0.2
        if user_id:
            confidence += 0.1
        context.confidence_score = min(confidence, 1.0)

        return context

    # -------------------------------------------------------------------------
    # Statistics
    # -------------------------------------------------------------------------

    async def get_mission_stats(
        self,
        user_id: Optional[str] = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get mission statistics."""
        try:
            since = (datetime.utcnow() - timedelta(days=days)).isoformat()

            query = self.supabase.table(self.primary_table)\
                .select("*")\
                .eq("tenant_id", self.tenant_id)\
                .gte("created_at", since)

            if user_id:
                query = query.eq("user_id", user_id)

            result = await query.execute()
            missions = [self._to_model(row) for row in result.data]

            # Calculate stats
            total = len(missions)
            completed = len([m for m in missions if m.status == MissionStatus.COMPLETED])
            failed = len([m for m in missions if m.status == MissionStatus.FAILED])

            by_mode = {}
            for mode in MissionMode:
                mode_missions = [m for m in missions if m.mode == mode]
                by_mode[mode.value] = len(mode_missions)

            total_cost = sum(m.total_cost for m in missions)
            total_tokens = sum(m.total_tokens_used for m in missions)

            avg_duration = 0
            completed_with_duration = [m for m in missions if m.duration_seconds and m.status == MissionStatus.COMPLETED]
            if completed_with_duration:
                avg_duration = sum(m.duration_seconds for m in completed_with_duration) / len(completed_with_duration)

            return {
                "period_days": days,
                "total_missions": total,
                "completed": completed,
                "failed": failed,
                "success_rate": completed / total if total > 0 else 0,
                "by_mode": by_mode,
                "total_cost": total_cost,
                "total_tokens": total_tokens,
                "avg_duration_seconds": avg_duration
            }
        except Exception as e:
            print(f"Error getting mission stats: {e}")
            return {}
