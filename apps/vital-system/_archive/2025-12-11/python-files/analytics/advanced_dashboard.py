"""
VITAL Path Phase 3: Advanced Analytics Dashboard
Comprehensive analytics and monitoring system for the VITAL Path platform.
"""

import asyncio
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple
from enum import Enum
import json
from datetime import datetime, timedelta
import logging
import statistics
from collections import defaultdict, Counter

class MetricType(Enum):
    PERFORMANCE = "performance"
    USAGE = "usage"
    QUALITY = "quality"
    BUSINESS = "business"
    TECHNICAL = "technical"
    USER_EXPERIENCE = "user_experience"

class DashboardSection(Enum):
    OVERVIEW = "overview"
    ORCHESTRATION = "orchestration"
    AGENTS = "agents"
    PROMPTS = "prompts"
    WORKFLOWS = "workflows"
    USERS = "users"
    SYSTEM = "system"
    BUSINESS_INTELLIGENCE = "business_intelligence"

class ChartType(Enum):
    LINE_CHART = "line_chart"
    BAR_CHART = "bar_chart"
    PIE_CHART = "pie_chart"
    HEATMAP = "heatmap"
    SCATTER_PLOT = "scatter_plot"
    GAUGE = "gauge"
    TABLE = "table"
    KPI_CARD = "kpi_card"

class TimeRange(Enum):
    LAST_HOUR = "1h"
    LAST_DAY = "24h"
    LAST_WEEK = "7d"
    LAST_MONTH = "30d"
    LAST_QUARTER = "90d"
    LAST_YEAR = "365d"
    CUSTOM = "custom"

class AlertSeverity(Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

@dataclass
class MetricDefinition:
    metric_id: str
    name: str
    description: str
    metric_type: MetricType
    unit: str
    calculation_method: str
    thresholds: Dict[str, float]
    collection_interval: str
    retention_period: str

@dataclass
class DataPoint:
    timestamp: datetime
    value: float
    dimensions: Dict[str, str] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class TimeSeries:
    metric_id: str
    data_points: List[DataPoint]
    aggregation_level: str
    time_range: TimeRange

@dataclass
class ChartWidget:
    widget_id: str
    title: str
    chart_type: ChartType
    metric_ids: List[str]
    time_range: TimeRange
    filters: Dict[str, Any]
    display_options: Dict[str, Any]
    position: Tuple[int, int]
    size: Tuple[int, int]

@dataclass
class Alert:
    alert_id: str
    metric_id: str
    severity: AlertSeverity
    condition: str
    threshold_value: float
    current_value: float
    message: str
    triggered_at: datetime
    acknowledged: bool = False
    resolved: bool = False

@dataclass
class DashboardConfiguration:
    dashboard_id: str
    name: str
    section: DashboardSection
    widgets: List[ChartWidget]
    refresh_interval: int
    auto_refresh: bool
    user_permissions: List[str]
    filters: Dict[str, Any]

@dataclass
class AnalyticsReport:
    report_id: str
    title: str
    description: str
    metrics: List[str]
    time_range: TimeRange
    insights: List[str]
    recommendations: List[str]
    generated_at: datetime
    data: Dict[str, Any]

class AdvancedAnalyticsDashboard:
    """
    Advanced analytics dashboard providing comprehensive monitoring,
    insights, and intelligence for the VITAL Path platform.
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.metrics_catalog = self._initialize_metrics_catalog()
        self.dashboard_configs = self._initialize_dashboard_configurations()
        self.data_store = defaultdict(list)  # In-memory storage for demo
        self.alerts = []
        self.active_sessions = {}

    def _initialize_metrics_catalog(self) -> Dict[str, MetricDefinition]:
        """Initialize comprehensive metrics catalog."""
        metrics = {}

        # Performance Metrics
        metrics["orchestration_response_time"] = MetricDefinition(
            metric_id="orchestration_response_time",
            name="Orchestration Response Time",
            description="Average time for orchestration to route requests",
            metric_type=MetricType.PERFORMANCE,
            unit="milliseconds",
            calculation_method="average",
            thresholds={"warning": 1000, "error": 2000, "critical": 5000},
            collection_interval="1m",
            retention_period="90d"
        )

        metrics["agent_success_rate"] = MetricDefinition(
            metric_id="agent_success_rate",
            name="Agent Success Rate",
            description="Percentage of successful agent executions",
            metric_type=MetricType.QUALITY,
            unit="percentage",
            calculation_method="ratio",
            thresholds={"warning": 95, "error": 90, "critical": 85},
            collection_interval="5m",
            retention_period="90d"
        )

        metrics["user_satisfaction_score"] = MetricDefinition(
            metric_id="user_satisfaction_score",
            name="User Satisfaction Score",
            description="Average user satisfaction rating (1-5)",
            metric_type=MetricType.USER_EXPERIENCE,
            unit="score",
            calculation_method="average",
            thresholds={"warning": 4.0, "error": 3.5, "critical": 3.0},
            collection_interval="1h",
            retention_period="365d"
        )

        metrics["prompt_effectiveness"] = MetricDefinition(
            metric_id="prompt_effectiveness",
            name="Prompt Effectiveness",
            description="Success rate of prompt-generated responses",
            metric_type=MetricType.QUALITY,
            unit="percentage",
            calculation_method="ratio",
            thresholds={"warning": 85, "error": 80, "critical": 75},
            collection_interval="10m",
            retention_period="90d"
        )

        # Usage Metrics
        metrics["daily_active_users"] = MetricDefinition(
            metric_id="daily_active_users",
            name="Daily Active Users",
            description="Number of unique users per day",
            metric_type=MetricType.USAGE,
            unit="count",
            calculation_method="distinct_count",
            thresholds={"info": 100, "warning": 50, "error": 20},
            collection_interval="1h",
            retention_period="365d"
        )

        metrics["requests_per_minute"] = MetricDefinition(
            metric_id="requests_per_minute",
            name="Requests Per Minute",
            description="Number of requests processed per minute",
            metric_type=MetricType.USAGE,
            unit="requests/min",
            calculation_method="count",
            thresholds={"info": 1000, "warning": 1500, "error": 2000},
            collection_interval="1m",
            retention_period="30d"
        )

        # Business Metrics
        metrics["cost_per_interaction"] = MetricDefinition(
            metric_id="cost_per_interaction",
            name="Cost Per Interaction",
            description="Average cost per user interaction",
            metric_type=MetricType.BUSINESS,
            unit="dollars",
            calculation_method="average",
            thresholds={"info": 0.50, "warning": 1.00, "error": 2.00},
            collection_interval="1h",
            retention_period="365d"
        )

        metrics["revenue_per_user"] = MetricDefinition(
            metric_id="revenue_per_user",
            name="Revenue Per User",
            description="Average revenue generated per user",
            metric_type=MetricType.BUSINESS,
            unit="dollars",
            calculation_method="average",
            thresholds={"info": 50, "warning": 30, "error": 20},
            collection_interval="1d",
            retention_period="365d"
        )

        # System Metrics
        metrics["cpu_utilization"] = MetricDefinition(
            metric_id="cpu_utilization",
            name="CPU Utilization",
            description="System CPU utilization percentage",
            metric_type=MetricType.TECHNICAL,
            unit="percentage",
            calculation_method="average",
            thresholds={"warning": 70, "error": 85, "critical": 95},
            collection_interval="30s",
            retention_period="7d"
        )

        metrics["memory_usage"] = MetricDefinition(
            metric_id="memory_usage",
            name="Memory Usage",
            description="System memory utilization percentage",
            metric_type=MetricType.TECHNICAL,
            unit="percentage",
            calculation_method="average",
            thresholds={"warning": 75, "error": 90, "critical": 95},
            collection_interval="30s",
            retention_period="7d"
        )

        return metrics

    def _initialize_dashboard_configurations(self) -> Dict[str, DashboardConfiguration]:
        """Initialize dashboard configurations for different sections."""
        dashboards = {}

        # Overview Dashboard
        dashboards["overview"] = DashboardConfiguration(
            dashboard_id="overview",
            name="VITAL Path Overview",
            section=DashboardSection.OVERVIEW,
            widgets=[
                ChartWidget(
                    widget_id="kpi_summary",
                    title="Key Performance Indicators",
                    chart_type=ChartType.KPI_CARD,
                    metric_ids=["daily_active_users", "agent_success_rate", "user_satisfaction_score"],
                    time_range=TimeRange.LAST_DAY,
                    filters={},
                    display_options={"layout": "grid", "size": "large"},
                    position=(0, 0),
                    size=(12, 3)
                ),
                ChartWidget(
                    widget_id="usage_trends",
                    title="Usage Trends",
                    chart_type=ChartType.LINE_CHART,
                    metric_ids=["requests_per_minute", "daily_active_users"],
                    time_range=TimeRange.LAST_WEEK,
                    filters={},
                    display_options={"show_legend": True, "colors": ["#007bff", "#28a745"]},
                    position=(0, 3),
                    size=(6, 4)
                ),
                ChartWidget(
                    widget_id="performance_metrics",
                    title="Performance Overview",
                    chart_type=ChartType.GAUGE,
                    metric_ids=["orchestration_response_time", "agent_success_rate"],
                    time_range=TimeRange.LAST_HOUR,
                    filters={},
                    display_options={"gauge_type": "arc", "thresholds": True},
                    position=(6, 3),
                    size=(6, 4)
                )
            ],
            refresh_interval=30,
            auto_refresh=True,
            user_permissions=["admin", "analyst", "viewer"],
            filters={}
        )

        # Orchestration Dashboard
        dashboards["orchestration"] = DashboardConfiguration(
            dashboard_id="orchestration",
            name="Orchestration Analytics",
            section=DashboardSection.ORCHESTRATION,
            widgets=[
                ChartWidget(
                    widget_id="triage_distribution",
                    title="Triage Classification Distribution",
                    chart_type=ChartType.PIE_CHART,
                    metric_ids=["triage_categories"],
                    time_range=TimeRange.LAST_DAY,
                    filters={},
                    display_options={"show_percentages": True},
                    position=(0, 0),
                    size=(6, 4)
                ),
                ChartWidget(
                    widget_id="routing_patterns",
                    title="Agent Routing Patterns",
                    chart_type=ChartType.HEATMAP,
                    metric_ids=["agent_routing_matrix"],
                    time_range=TimeRange.LAST_WEEK,
                    filters={},
                    display_options={"color_scale": "blues"},
                    position=(6, 0),
                    size=(6, 4)
                ),
                ChartWidget(
                    widget_id="orchestration_performance",
                    title="Orchestration Response Times",
                    chart_type=ChartType.LINE_CHART,
                    metric_ids=["orchestration_response_time"],
                    time_range=TimeRange.LAST_DAY,
                    filters={},
                    display_options={"aggregation": "avg", "show_confidence": True},
                    position=(0, 4),
                    size=(12, 4)
                )
            ],
            refresh_interval=60,
            auto_refresh=True,
            user_permissions=["admin", "analyst"],
            filters={"agent_type": "all", "complexity_level": "all"}
        )

        # Agent Performance Dashboard
        dashboards["agents"] = DashboardConfiguration(
            dashboard_id="agents",
            name="Agent Performance",
            section=DashboardSection.AGENTS,
            widgets=[
                ChartWidget(
                    widget_id="agent_success_rates",
                    title="Agent Success Rates by Type",
                    chart_type=ChartType.BAR_CHART,
                    metric_ids=["agent_success_rate"],
                    time_range=TimeRange.LAST_WEEK,
                    filters={"group_by": "agent_type"},
                    display_options={"orientation": "horizontal", "sort": "desc"},
                    position=(0, 0),
                    size=(6, 4)
                ),
                ChartWidget(
                    widget_id="agent_utilization",
                    title="Agent Utilization",
                    chart_type=ChartType.HEATMAP,
                    metric_ids=["agent_utilization"],
                    time_range=TimeRange.LAST_DAY,
                    filters={},
                    display_options={"time_buckets": "hourly"},
                    position=(6, 0),
                    size=(6, 4)
                ),
                ChartWidget(
                    widget_id="agent_performance_trends",
                    title="Agent Performance Trends",
                    chart_type=ChartType.LINE_CHART,
                    metric_ids=["agent_response_time", "agent_accuracy"],
                    time_range=TimeRange.LAST_MONTH,
                    filters={},
                    display_options={"multi_axis": True},
                    position=(0, 4),
                    size=(12, 4)
                )
            ],
            refresh_interval=120,
            auto_refresh=True,
            user_permissions=["admin", "analyst"],
            filters={"agent_type": "all", "time_period": "last_week"}
        )

        return dashboards

    async def collect_metrics(self, metric_data: Dict[str, Any]) -> None:
        """Collect and store metric data points."""
        try:
            timestamp = datetime.now()

            for metric_id, value in metric_data.items():
                if metric_id in self.metrics_catalog:
                    data_point = DataPoint(
                        timestamp=timestamp,
                        value=float(value) if isinstance(value, (int, float)) else 0.0,
                        dimensions=metric_data.get(f"{metric_id}_dimensions", {}),
                        metadata=metric_data.get(f"{metric_id}_metadata", {})
                    )

                    self.data_store[metric_id].append(data_point)

                    # Check for alert conditions
                    await self._check_alert_conditions(metric_id, data_point)

        except Exception as e:
            self.logger.error(f"Error collecting metrics: {str(e)}")

    async def _check_alert_conditions(self, metric_id: str, data_point: DataPoint) -> None:
        """Check if metric values trigger any alert conditions."""
        try:
            metric_def = self.metrics_catalog[metric_id]
            thresholds = metric_def.thresholds

            # Check critical threshold
            if "critical" in thresholds and data_point.value >= thresholds["critical"]:
                await self._create_alert(metric_id, AlertSeverity.CRITICAL,
                                       thresholds["critical"], data_point.value)

            # Check error threshold
            elif "error" in thresholds and data_point.value >= thresholds["error"]:
                await self._create_alert(metric_id, AlertSeverity.ERROR,
                                       thresholds["error"], data_point.value)

            # Check warning threshold
            elif "warning" in thresholds and data_point.value >= thresholds["warning"]:
                await self._create_alert(metric_id, AlertSeverity.WARNING,
                                       thresholds["warning"], data_point.value)

        except Exception as e:
            self.logger.error(f"Error checking alert conditions: {str(e)}")

    async def _create_alert(self, metric_id: str, severity: AlertSeverity,
                          threshold: float, current_value: float) -> None:
        """Create a new alert."""
        alert = Alert(
            alert_id=f"{metric_id}_{severity.value}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            metric_id=metric_id,
            severity=severity,
            condition=f"Value >= {threshold}",
            threshold_value=threshold,
            current_value=current_value,
            message=f"Metric {metric_id} exceeded {severity.value} threshold",
            triggered_at=datetime.now()
        )

        self.alerts.append(alert)
        self.logger.warning(f"Alert created: {alert.alert_id}")

    async def get_dashboard_data(self, dashboard_id: str,
                               time_range: Optional[TimeRange] = None) -> Dict[str, Any]:
        """Retrieve dashboard data for visualization."""
        try:
            if dashboard_id not in self.dashboard_configs:
                raise ValueError(f"Dashboard {dashboard_id} not found")

            dashboard = self.dashboard_configs[dashboard_id]
            dashboard_data = {
                "dashboard_id": dashboard_id,
                "name": dashboard.name,
                "last_updated": datetime.now().isoformat(),
                "widgets": []
            }

            for widget in dashboard.widgets:
                widget_data = await self._get_widget_data(widget, time_range)
                dashboard_data["widgets"].append(widget_data)

            return dashboard_data

        except Exception as e:
            self.logger.error(f"Error getting dashboard data: {str(e)}")
            raise

    async def _get_widget_data(self, widget: ChartWidget,
                             time_range: Optional[TimeRange] = None) -> Dict[str, Any]:
        """Get data for a specific widget."""
        try:
            effective_time_range = time_range or widget.time_range

            widget_data = {
                "widget_id": widget.widget_id,
                "title": widget.title,
                "chart_type": widget.chart_type.value,
                "position": widget.position,
                "size": widget.size,
                "data": {}
            }

            for metric_id in widget.metric_ids:
                time_series = await self._get_time_series(metric_id, effective_time_range)
                widget_data["data"][metric_id] = {
                    "values": [{"timestamp": dp.timestamp.isoformat(), "value": dp.value}
                              for dp in time_series.data_points],
                    "metadata": {
                        "unit": self.metrics_catalog[metric_id].unit,
                        "description": self.metrics_catalog[metric_id].description
                    }
                }

            # Apply chart-specific data processing
            if widget.chart_type == ChartType.KPI_CARD:
                widget_data["data"] = await self._process_kpi_data(widget_data["data"])
            elif widget.chart_type == ChartType.GAUGE:
                widget_data["data"] = await self._process_gauge_data(widget_data["data"])

            return widget_data

        except Exception as e:
            self.logger.error(f"Error getting widget data: {str(e)}")
            return {"widget_id": widget.widget_id, "error": str(e)}

    async def _get_time_series(self, metric_id: str, time_range: TimeRange) -> TimeSeries:
        """Retrieve time series data for a metric."""
        try:
            end_time = datetime.now()

            if time_range == TimeRange.LAST_HOUR:
                start_time = end_time - timedelta(hours=1)
            elif time_range == TimeRange.LAST_DAY:
                start_time = end_time - timedelta(days=1)
            elif time_range == TimeRange.LAST_WEEK:
                start_time = end_time - timedelta(weeks=1)
            elif time_range == TimeRange.LAST_MONTH:
                start_time = end_time - timedelta(days=30)
            else:
                start_time = end_time - timedelta(days=1)  # Default

            # Filter data points by time range
            all_points = self.data_store.get(metric_id, [])
            filtered_points = [dp for dp in all_points
                             if start_time <= dp.timestamp <= end_time]

            return TimeSeries(
                metric_id=metric_id,
                data_points=filtered_points,
                aggregation_level="raw",
                time_range=time_range
            )

        except Exception as e:
            self.logger.error(f"Error getting time series: {str(e)}")
            return TimeSeries(metric_id, [], "raw", time_range)

    async def _process_kpi_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process data for KPI card display."""
        processed = {}

        for metric_id, metric_data in data.items():
            values = [point["value"] for point in metric_data["values"]]
            if values:
                processed[metric_id] = {
                    "current_value": values[-1],
                    "previous_value": values[-2] if len(values) > 1 else values[-1],
                    "trend": "up" if len(values) > 1 and values[-1] > values[-2] else "down",
                    "change_percent": ((values[-1] - values[-2]) / values[-2] * 100)
                                    if len(values) > 1 and values[-2] != 0 else 0,
                    "metadata": metric_data["metadata"]
                }
            else:
                processed[metric_id] = {
                    "current_value": 0,
                    "previous_value": 0,
                    "trend": "neutral",
                    "change_percent": 0,
                    "metadata": metric_data["metadata"]
                }

        return processed

    async def _process_gauge_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process data for gauge display."""
        processed = {}

        for metric_id, metric_data in data.items():
            values = [point["value"] for point in metric_data["values"]]
            if values:
                current_value = values[-1]
                metric_def = self.metrics_catalog[metric_id]
                thresholds = metric_def.thresholds

                processed[metric_id] = {
                    "value": current_value,
                    "min": 0,
                    "max": max(thresholds.values()) * 1.2 if thresholds else 100,
                    "thresholds": thresholds,
                    "metadata": metric_data["metadata"]
                }

        return processed

    async def generate_insights_report(self, time_range: TimeRange = TimeRange.LAST_WEEK) -> AnalyticsReport:
        """Generate automated insights and recommendations."""
        try:
            insights = []
            recommendations = []

            # Analyze performance trends
            response_time_data = await self._get_time_series("orchestration_response_time", time_range)
            if response_time_data.data_points:
                avg_response_time = statistics.mean([dp.value for dp in response_time_data.data_points])
                if avg_response_time > 1000:
                    insights.append(f"Average response time is {avg_response_time:.0f}ms, above optimal threshold")
                    recommendations.append("Consider scaling orchestration infrastructure")

            # Analyze user satisfaction
            satisfaction_data = await self._get_time_series("user_satisfaction_score", time_range)
            if satisfaction_data.data_points:
                avg_satisfaction = statistics.mean([dp.value for dp in satisfaction_data.data_points])
                if avg_satisfaction < 4.0:
                    insights.append(f"User satisfaction score is {avg_satisfaction:.1f}, below target of 4.0")
                    recommendations.append("Review user feedback and improve UX")

            # Analyze agent performance
            success_rate_data = await self._get_time_series("agent_success_rate", time_range)
            if success_rate_data.data_points:
                avg_success_rate = statistics.mean([dp.value for dp in success_rate_data.data_points])
                if avg_success_rate < 95:
                    insights.append(f"Agent success rate is {avg_success_rate:.1f}%, below target of 95%")
                    recommendations.append("Analyze agent failure patterns and improve error handling")

            # Analyze usage patterns
            dau_data = await self._get_time_series("daily_active_users", time_range)
            if dau_data.data_points and len(dau_data.data_points) > 7:
                recent_avg = statistics.mean([dp.value for dp in dau_data.data_points[-7:]])
                earlier_avg = statistics.mean([dp.value for dp in dau_data.data_points[:-7]])
                growth_rate = (recent_avg - earlier_avg) / earlier_avg * 100 if earlier_avg > 0 else 0

                if growth_rate > 10:
                    insights.append(f"User base growing at {growth_rate:.1f}% - prepare for scaling")
                    recommendations.append("Monitor system capacity and plan infrastructure scaling")
                elif growth_rate < -10:
                    insights.append(f"User base declining at {abs(growth_rate):.1f}% - investigate causes")
                    recommendations.append("Conduct user research to understand churn reasons")

            report = AnalyticsReport(
                report_id=f"insights_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                title=f"VITAL Path Analytics Insights - {time_range.value}",
                description="Automated analysis of system performance and user behavior",
                metrics=list(self.metrics_catalog.keys()),
                time_range=time_range,
                insights=insights,
                recommendations=recommendations,
                generated_at=datetime.now(),
                data=await self._compile_report_data(time_range)
            )

            return report

        except Exception as e:
            self.logger.error(f"Error generating insights report: {str(e)}")
            raise

    async def _compile_report_data(self, time_range: TimeRange) -> Dict[str, Any]:
        """Compile comprehensive data for the report."""
        try:
            report_data = {}

            for metric_id in self.metrics_catalog.keys():
                time_series = await self._get_time_series(metric_id, time_range)
                if time_series.data_points:
                    values = [dp.value for dp in time_series.data_points]
                    report_data[metric_id] = {
                        "count": len(values),
                        "mean": statistics.mean(values),
                        "median": statistics.median(values),
                        "std_dev": statistics.stdev(values) if len(values) > 1 else 0,
                        "min": min(values),
                        "max": max(values),
                        "latest": values[-1] if values else 0
                    }

            return report_data

        except Exception as e:
            self.logger.error(f"Error compiling report data: {str(e)}")
            return {}

    async def get_active_alerts(self, severity_filter: Optional[AlertSeverity] = None) -> List[Alert]:
        """Get active alerts, optionally filtered by severity."""
        try:
            active_alerts = [alert for alert in self.alerts if not alert.resolved]

            if severity_filter:
                active_alerts = [alert for alert in active_alerts
                               if alert.severity == severity_filter]

            return sorted(active_alerts, key=lambda x: x.triggered_at, reverse=True)

        except Exception as e:
            self.logger.error(f"Error getting active alerts: {str(e)}")
            return []

    async def acknowledge_alert(self, alert_id: str, user_id: str) -> bool:
        """Acknowledge an alert."""
        try:
            for alert in self.alerts:
                if alert.alert_id == alert_id:
                    alert.acknowledged = True
                    alert.metadata = alert.metadata or {}
                    alert.metadata.update({
                        "acknowledged_by": user_id,
                        "acknowledged_at": datetime.now().isoformat()
                    })
                    self.logger.info(f"Alert {alert_id} acknowledged by {user_id}")
                    return True

            return False

        except Exception as e:
            self.logger.error(f"Error acknowledging alert: {str(e)}")
            return False

    async def create_custom_dashboard(self, dashboard_config: DashboardConfiguration) -> str:
        """Create a custom dashboard configuration."""
        try:
            self.dashboard_configs[dashboard_config.dashboard_id] = dashboard_config
            self.logger.info(f"Custom dashboard created: {dashboard_config.dashboard_id}")
            return dashboard_config.dashboard_id

        except Exception as e:
            self.logger.error(f"Error creating custom dashboard: {str(e)}")
            raise

    async def export_data(self, metrics: List[str], time_range: TimeRange,
                         format_type: str = "json") -> Dict[str, Any]:
        """Export metric data in specified format."""
        try:
            export_data = {
                "export_timestamp": datetime.now().isoformat(),
                "time_range": time_range.value,
                "metrics": {}
            }

            for metric_id in metrics:
                if metric_id in self.metrics_catalog:
                    time_series = await self._get_time_series(metric_id, time_range)
                    export_data["metrics"][metric_id] = {
                        "definition": {
                            "name": self.metrics_catalog[metric_id].name,
                            "description": self.metrics_catalog[metric_id].description,
                            "unit": self.metrics_catalog[metric_id].unit
                        },
                        "data": [
                            {
                                "timestamp": dp.timestamp.isoformat(),
                                "value": dp.value,
                                "dimensions": dp.dimensions
                            } for dp in time_series.data_points
                        ]
                    }

            return export_data

        except Exception as e:
            self.logger.error(f"Error exporting data: {str(e)}")
            raise

# Example usage and testing
async def main():
    """Test the Advanced Analytics Dashboard."""
    dashboard = AdvancedAnalyticsDashboard()

    # Simulate metric collection
    sample_metrics = {
        "orchestration_response_time": 850,
        "agent_success_rate": 97.5,
        "user_satisfaction_score": 4.2,
        "daily_active_users": 1250,
        "requests_per_minute": 450,
        "cpu_utilization": 65,
        "memory_usage": 72
    }

    # Collect metrics
    await dashboard.collect_metrics(sample_metrics)

    # Get dashboard data
    overview_data = await dashboard.get_dashboard_data("overview")
    print("Overview Dashboard Data:")
    print(f"Widgets: {len(overview_data['widgets'])}")

    # Generate insights report
    insights_report = await dashboard.generate_insights_report()
    print(f"\nGenerated insights report: {insights_report.report_id}")
    print(f"Insights: {len(insights_report.insights)}")
    print(f"Recommendations: {len(insights_report.recommendations)}")

    # Check alerts
    active_alerts = await dashboard.get_active_alerts()
    print(f"\nActive alerts: {len(active_alerts)}")

if __name__ == "__main__":
    asyncio.run(main())