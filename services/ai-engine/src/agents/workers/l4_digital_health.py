"""
VITAL Path AI Services - VITAL L4 Digital Health Workers

Digital Health Workers: Wearable Data Processor, Digital Biomarker Analyst,
mHealth App Evaluator, Patient Engagement Analyst, Remote Monitoring Processor
5 workers for digital health and decentralized trial tasks.

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values

Naming Convention:
- Class: DigitalHealthL4Worker
- Factory: create_digital_health_worker(worker_key)
"""

from typing import Dict, Any, List
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory
import structlog

logger = structlog.get_logger()


# Worker configs use defaults from WorkerConfig (which pulls from env vars)
# Worker-specific LLM overrides should be stored in PostgreSQL tools table
DIGITAL_HEALTH_WORKER_CONFIGS: Dict[str, WorkerConfig] = {

    "wearable_data_processor": WorkerConfig(
        id="L4-WDP",
        name="Wearable Data Processor",
        description="Process and analyze wearable device data",
        category=WorkerCategory.DIGITAL_HEALTH,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "healthkit", "health_connect", "fitbit",
            "terra", "calculator"
        ],
        task_types=[
            "aggregate_activity", "analyze_sleep", "detect_anomalies",
            "calculate_trends", "quality_check_data", "normalize_data"
        ],
    ),

    "digital_biomarker_analyst": WorkerConfig(
        id="L4-DBA",
        name="Digital Biomarker Analyst",
        description="Analyze digital biomarkers and validate measures",
        category=WorkerCategory.DIGITAL_HEALTH,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "healthkit", "health_connect", "calculator",
            "r_stats", "pubmed"
        ],
        task_types=[
            "validate_biomarker", "assess_reliability", "calculate_mcid",
            "correlate_with_clinical", "assess_sensitivity", "compare_devices"
        ],
    ),

    "mhealth_app_evaluator": WorkerConfig(
        id="L4-MAE",
        name="mHealth App Evaluator",
        description="Evaluate mobile health applications",
        category=WorkerCategory.DIGITAL_HEALTH,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "researchkit", "researchstack", "pubmed"
        ],
        task_types=[
            "assess_usability", "evaluate_privacy", "check_compliance",
            "assess_clinical_validity", "benchmark_against_standards", "generate_report"
        ],
    ),

    "patient_engagement_analyst": WorkerConfig(
        id="L4-PEA",
        name="Patient Engagement Analyst",
        description="Analyze patient engagement and adherence metrics",
        category=WorkerCategory.DIGITAL_HEALTH,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "mydatahelps", "sage_bridge", "calculator"
        ],
        task_types=[
            "calculate_adherence", "analyze_engagement_patterns",
            "predict_dropout", "segment_users", "identify_barriers"
        ],
    ),

    "remote_monitoring_processor": WorkerConfig(
        id="L4-RMP",
        name="Remote Monitoring Processor",
        description="Process remote patient monitoring data",
        category=WorkerCategory.DIGITAL_HEALTH,
        # model, temperature, max_tokens inherit from L4 env defaults
        allowed_l5_tools=[
            "healthkit", "health_connect", "terra",
            "fitbit", "calculator"
        ],
        task_types=[
            "detect_alerts", "calculate_vitals_trend", "identify_outliers",
            "generate_summary", "assess_compliance", "flag_for_review"
        ],
    ),
}


class DigitalHealthL4Worker(L4BaseWorker):
    """L4 Worker class for digital health tasks."""
    
    def __init__(self, worker_key: str, l5_tools: Dict[str, Any] = None):
        if worker_key not in DIGITAL_HEALTH_WORKER_CONFIGS:
            raise ValueError(f"Unknown digital health worker: {worker_key}")
        
        config = DIGITAL_HEALTH_WORKER_CONFIGS[worker_key]
        super().__init__(config, l5_tools)
        self.worker_key = worker_key
    
    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        """Route to appropriate task handler."""
        handler = getattr(self, f"_task_{task}", None)
        if handler:
            return await handler(params)
        return await self._generic_task(task, params)
    
    async def _task_aggregate_activity(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Aggregate activity data from wearables."""
        data_source = params.get("source", "healthkit")
        time_range = params.get("time_range", "7d")
        metrics = params.get("metrics", ["steps", "active_minutes", "distance"])
        
        # Get data from appropriate source
        result = await self.call_l5_tool(data_source, {
            "operation": "get_activity",
            "time_range": time_range,
            "metrics": metrics,
        })
        
        data = result.get("data", {})
        
        # Calculate aggregates
        aggregates = {}
        for metric in metrics:
            values = data.get(metric, [])
            if values:
                aggregates[metric] = {
                    "sum": sum(values),
                    "mean": sum(values) / len(values),
                    "min": min(values),
                    "max": max(values),
                    "count": len(values),
                }
        
        return {
            "source": data_source,
            "time_range": time_range,
            "metrics_aggregated": metrics,
            "aggregates": aggregates,
        }
    
    async def _task_analyze_sleep(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze sleep data."""
        data_source = params.get("source", "healthkit")
        days = params.get("days", 7)
        
        result = await self.call_l5_tool(data_source, {
            "operation": "get_sleep",
            "days": days,
        })
        
        sleep_data = result.get("data", {}).get("sleep_records", [])
        
        # Calculate sleep metrics
        total_sleep_minutes = []
        sleep_efficiency = []
        
        for record in sleep_data:
            total_sleep_minutes.append(record.get("total_sleep_minutes", 0))
            if record.get("time_in_bed", 0) > 0:
                efficiency = record.get("total_sleep_minutes", 0) / record.get("time_in_bed", 1) * 100
                sleep_efficiency.append(efficiency)
        
        return {
            "source": data_source,
            "days_analyzed": len(sleep_data),
            "average_sleep_hours": sum(total_sleep_minutes) / len(total_sleep_minutes) / 60 if total_sleep_minutes else 0,
            "average_efficiency": sum(sleep_efficiency) / len(sleep_efficiency) if sleep_efficiency else 0,
            "sleep_quality_assessment": self._assess_sleep_quality(
                sum(total_sleep_minutes) / len(total_sleep_minutes) if total_sleep_minutes else 0
            ),
        }
    
    def _assess_sleep_quality(self, avg_minutes: float) -> str:
        """Assess sleep quality based on average duration."""
        if avg_minutes >= 420 and avg_minutes <= 540:  # 7-9 hours
            return "Optimal"
        elif avg_minutes >= 360:  # 6+ hours
            return "Adequate"
        elif avg_minutes >= 300:  # 5+ hours
            return "Insufficient"
        else:
            return "Severely insufficient"
    
    async def _task_detect_anomalies(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Detect anomalies in wearable data."""
        data = params.get("data", [])
        metric = params.get("metric", "heart_rate")
        threshold_std = params.get("threshold_std", 2.0)
        
        if not data:
            return {"error": "No data provided"}
        
        # Calculate mean and std
        values = [d.get("value", 0) for d in data]
        mean_val = sum(values) / len(values)
        variance = sum((x - mean_val) ** 2 for x in values) / len(values)
        std_val = variance ** 0.5
        
        # Find anomalies
        anomalies = []
        for i, d in enumerate(data):
            val = d.get("value", 0)
            z_score = (val - mean_val) / std_val if std_val > 0 else 0
            if abs(z_score) > threshold_std:
                anomalies.append({
                    "index": i,
                    "timestamp": d.get("timestamp"),
                    "value": val,
                    "z_score": round(z_score, 2),
                    "direction": "high" if z_score > 0 else "low",
                })
        
        return {
            "metric": metric,
            "data_points": len(data),
            "mean": round(mean_val, 2),
            "std": round(std_val, 2),
            "threshold_std": threshold_std,
            "anomalies_found": len(anomalies),
            "anomalies": anomalies,
        }
    
    async def _task_calculate_adherence(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate adherence metrics."""
        expected_data_points = params.get("expected", 0)
        actual_data_points = params.get("actual", 0)
        expected_sessions = params.get("expected_sessions", 0)
        completed_sessions = params.get("completed_sessions", 0)
        
        # Data adherence
        data_adherence = (actual_data_points / expected_data_points * 100) if expected_data_points > 0 else 0
        
        # Session adherence
        session_adherence = (completed_sessions / expected_sessions * 100) if expected_sessions > 0 else 0
        
        # Overall adherence
        overall = (data_adherence + session_adherence) / 2 if expected_sessions > 0 else data_adherence
        
        return {
            "data_adherence_percent": round(data_adherence, 1),
            "session_adherence_percent": round(session_adherence, 1),
            "overall_adherence_percent": round(overall, 1),
            "adherence_classification": self._classify_adherence(overall),
        }
    
    def _classify_adherence(self, adherence: float) -> str:
        """Classify adherence level."""
        if adherence >= 80:
            return "High"
        elif adherence >= 50:
            return "Moderate"
        elif adherence >= 20:
            return "Low"
        else:
            return "Very low"
    
    async def _task_detect_alerts(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Detect alerts from remote monitoring data."""
        vitals = params.get("vitals", {})
        thresholds = params.get("thresholds", {})
        
        # Default thresholds
        default_thresholds = {
            "heart_rate_high": 100,
            "heart_rate_low": 50,
            "systolic_bp_high": 140,
            "systolic_bp_low": 90,
            "diastolic_bp_high": 90,
            "diastolic_bp_low": 60,
            "oxygen_saturation_low": 92,
            "temperature_high": 38.0,
            "temperature_low": 35.5,
        }
        
        # Merge with provided thresholds
        active_thresholds = {**default_thresholds, **thresholds}
        
        alerts = []
        
        # Check heart rate
        hr = vitals.get("heart_rate")
        if hr:
            if hr > active_thresholds["heart_rate_high"]:
                alerts.append({"type": "heart_rate", "severity": "warning", "message": f"Heart rate elevated: {hr} bpm"})
            elif hr < active_thresholds["heart_rate_low"]:
                alerts.append({"type": "heart_rate", "severity": "warning", "message": f"Heart rate low: {hr} bpm"})
        
        # Check blood pressure
        systolic = vitals.get("systolic_bp")
        diastolic = vitals.get("diastolic_bp")
        if systolic:
            if systolic > active_thresholds["systolic_bp_high"]:
                alerts.append({"type": "blood_pressure", "severity": "warning", "message": f"Systolic BP elevated: {systolic} mmHg"})
            elif systolic < active_thresholds["systolic_bp_low"]:
                alerts.append({"type": "blood_pressure", "severity": "warning", "message": f"Systolic BP low: {systolic} mmHg"})
        
        # Check oxygen saturation
        spo2 = vitals.get("oxygen_saturation")
        if spo2 and spo2 < active_thresholds["oxygen_saturation_low"]:
            alerts.append({"type": "oxygen", "severity": "critical", "message": f"Oxygen saturation low: {spo2}%"})
        
        # Check temperature
        temp = vitals.get("temperature")
        if temp:
            if temp > active_thresholds["temperature_high"]:
                alerts.append({"type": "temperature", "severity": "warning", "message": f"Temperature elevated: {temp}°C"})
            elif temp < active_thresholds["temperature_low"]:
                alerts.append({"type": "temperature", "severity": "warning", "message": f"Temperature low: {temp}°C"})
        
        return {
            "vitals_checked": list(vitals.keys()),
            "alerts_generated": len(alerts),
            "alerts": alerts,
            "critical_alerts": [a for a in alerts if a["severity"] == "critical"],
            "requires_immediate_review": any(a["severity"] == "critical" for a in alerts),
        }
    
    async def _task_validate_biomarker(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Validate digital biomarker reliability and validity."""
        biomarker_name = params.get("biomarker", "")
        test_retest_data = params.get("test_retest", [])
        correlation_with_gold = params.get("gold_standard_correlation", None)
        
        # Calculate test-retest reliability (ICC approximation)
        reliability = None
        if test_retest_data and len(test_retest_data) >= 2:
            test1 = [d.get("test1", 0) for d in test_retest_data]
            test2 = [d.get("test2", 0) for d in test_retest_data]
            
            # Simple correlation as ICC proxy
            mean1 = sum(test1) / len(test1)
            mean2 = sum(test2) / len(test2)
            
            numerator = sum((a - mean1) * (b - mean2) for a, b in zip(test1, test2))
            denom1 = sum((a - mean1) ** 2 for a in test1) ** 0.5
            denom2 = sum((b - mean2) ** 2 for b in test2) ** 0.5
            
            reliability = numerator / (denom1 * denom2) if denom1 > 0 and denom2 > 0 else 0
        
        # Interpret validity
        validity_interpretation = "Unknown"
        if correlation_with_gold is not None:
            if correlation_with_gold >= 0.7:
                validity_interpretation = "Strong validity"
            elif correlation_with_gold >= 0.5:
                validity_interpretation = "Moderate validity"
            elif correlation_with_gold >= 0.3:
                validity_interpretation = "Weak validity"
            else:
                validity_interpretation = "Poor validity"
        
        # Interpret reliability
        reliability_interpretation = "Unknown"
        if reliability is not None:
            if reliability >= 0.9:
                reliability_interpretation = "Excellent reliability"
            elif reliability >= 0.75:
                reliability_interpretation = "Good reliability"
            elif reliability >= 0.5:
                reliability_interpretation = "Moderate reliability"
            else:
                reliability_interpretation = "Poor reliability"
        
        return {
            "biomarker": biomarker_name,
            "reliability_coefficient": round(reliability, 3) if reliability else None,
            "reliability_interpretation": reliability_interpretation,
            "validity_correlation": correlation_with_gold,
            "validity_interpretation": validity_interpretation,
            "overall_assessment": "Valid for use" if (
                reliability and reliability >= 0.75 and 
                correlation_with_gold and correlation_with_gold >= 0.5
            ) else "Requires further validation",
        }
    
    async def _generic_task(self, task: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task handler."""
        return {
            "task": task,
            "status": "executed",
            "params_received": list(params.keys()),
        }


def create_digital_health_worker(worker_key: str, l5_tools: Dict[str, Any] = None) -> DigitalHealthL4Worker:
    return DigitalHealthL4Worker(worker_key, l5_tools)

DIGITAL_HEALTH_WORKER_KEYS = list(DIGITAL_HEALTH_WORKER_CONFIGS.keys())
