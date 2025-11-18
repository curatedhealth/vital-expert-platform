"""
VITAL Path Phase 3: Production Scaling System
Auto-scaling, load balancing, and resource optimization for production deployment.
"""

import asyncio
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Callable
from enum import Enum
import json
from datetime import datetime, timedelta
import logging
import statistics
import psutil
from abc import ABC, abstractmethod
import aiohttp
import uuid

class ScalingPolicy(Enum):
    CPU_BASED = "cpu_based"
    MEMORY_BASED = "memory_based"
    REQUEST_BASED = "request_based"
    QUEUE_BASED = "queue_based"
    CUSTOM_METRIC = "custom_metric"
    PREDICTIVE = "predictive"

class ScalingDirection(Enum):
    UP = "up"
    DOWN = "down"
    STABLE = "stable"

class LoadBalancingStrategy(Enum):
    ROUND_ROBIN = "round_robin"
    LEAST_CONNECTIONS = "least_connections"
    WEIGHTED_ROUND_ROBIN = "weighted_round_robin"
    LEAST_RESPONSE_TIME = "least_response_time"
    IP_HASH = "ip_hash"
    RESOURCE_BASED = "resource_based"

class InstanceStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    TERMINATING = "terminating"
    TERMINATED = "terminated"
    ERROR = "error"

@dataclass
class ScalingMetric:
    name: str
    current_value: float
    target_value: float
    threshold_up: float
    threshold_down: float
    weight: float = 1.0
    unit: str = ""

@dataclass
class ScalingRule:
    rule_id: str
    name: str
    policy: ScalingPolicy
    metrics: List[ScalingMetric]
    cooldown_seconds: int
    min_instances: int
    max_instances: int
    scale_up_count: int = 1
    scale_down_count: int = 1
    evaluation_period_seconds: int = 300
    enabled: bool = True

@dataclass
class ServiceInstance:
    instance_id: str
    host: str
    port: int
    status: InstanceStatus
    created_at: datetime
    last_health_check: Optional[datetime]
    health_status: str = "unknown"
    current_connections: int = 0
    cpu_usage: float = 0.0
    memory_usage: float = 0.0
    response_time_ms: float = 0.0
    weight: float = 1.0
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class LoadBalancerConfig:
    strategy: LoadBalancingStrategy
    health_check_interval_seconds: int = 30
    health_check_timeout_seconds: int = 5
    max_retries: int = 3
    retry_backoff_seconds: float = 1.0
    sticky_sessions: bool = False
    session_timeout_seconds: int = 3600

@dataclass
class AutoScalerConfig:
    service_name: str
    scaling_rules: List[ScalingRule]
    load_balancer_config: LoadBalancerConfig
    instance_launch_template: Dict[str, Any]
    monitoring_interval_seconds: int = 60
    health_check_grace_period_seconds: int = 180

class InstanceProvider(ABC):
    """Abstract interface for instance providers (AWS, GCP, Azure, etc.)."""

    @abstractmethod
    async def launch_instance(self, template: Dict[str, Any]) -> ServiceInstance:
        pass

    @abstractmethod
    async def terminate_instance(self, instance_id: str) -> bool:
        pass

    @abstractmethod
    async def get_instance_metrics(self, instance_id: str) -> Dict[str, float]:
        pass

    @abstractmethod
    async def health_check_instance(self, instance: ServiceInstance) -> bool:
        pass

class LocalInstanceProvider(InstanceProvider):
    """Local instance provider for testing and development."""

    def __init__(self):
        self.instances: Dict[str, ServiceInstance] = {}
        self.base_port = 8000
        self.logger = logging.getLogger(__name__)

    async def launch_instance(self, template: Dict[str, Any]) -> ServiceInstance:
        """Launch a new instance locally."""
        instance_id = f"local-{uuid.uuid4().hex[:8]}"
        port = self.base_port + len(self.instances)

        instance = ServiceInstance(
            instance_id=instance_id,
            host="127.0.0.1",
            port=port,
            status=InstanceStatus.PENDING,
            created_at=datetime.now(),
            last_health_check=None,
            metadata=template.copy()
        )

        self.instances[instance_id] = instance

        # Simulate instance startup
        await asyncio.sleep(2)
        instance.status = InstanceStatus.RUNNING
        instance.health_status = "healthy"

        self.logger.info(f"Launched local instance {instance_id} on port {port}")
        return instance

    async def terminate_instance(self, instance_id: str) -> bool:
        """Terminate an instance."""
        if instance_id in self.instances:
            instance = self.instances[instance_id]
            instance.status = InstanceStatus.TERMINATING

            # Simulate shutdown time
            await asyncio.sleep(1)

            instance.status = InstanceStatus.TERMINATED
            del self.instances[instance_id]

            self.logger.info(f"Terminated local instance {instance_id}")
            return True

        return False

    async def get_instance_metrics(self, instance_id: str) -> Dict[str, float]:
        """Get instance metrics."""
        if instance_id not in self.instances:
            return {}

        # Simulate metrics - in reality these would come from monitoring systems
        return {
            "cpu_usage": psutil.cpu_percent() + (hash(instance_id) % 20 - 10),
            "memory_usage": psutil.virtual_memory().percent + (hash(instance_id) % 15 - 7),
            "request_rate": max(0, 50 + (hash(instance_id) % 100 - 50)),
            "response_time": max(50, 200 + (hash(instance_id) % 300 - 150))
        }

    async def health_check_instance(self, instance: ServiceInstance) -> bool:
        """Perform health check on instance."""
        try:
            # Simulate health check - in reality this would be HTTP/TCP check
            if instance.instance_id in self.instances:
                instance.last_health_check = datetime.now()
                instance.health_status = "healthy"
                return True
            return False
        except Exception:
            instance.health_status = "unhealthy"
            return False

class LoadBalancer:
    """Intelligent load balancer with multiple strategies."""

    def __init__(self, config: LoadBalancerConfig):
        self.config = config
        self.instances: List[ServiceInstance] = []
        self.session_store: Dict[str, str] = {}  # session_id -> instance_id
        self.round_robin_index = 0
        self.logger = logging.getLogger(__name__)

    def add_instance(self, instance: ServiceInstance):
        """Add an instance to the load balancer."""
        if instance not in self.instances:
            self.instances.append(instance)
            self.logger.info(f"Added instance {instance.instance_id} to load balancer")

    def remove_instance(self, instance_id: str):
        """Remove an instance from the load balancer."""
        self.instances = [i for i in self.instances if i.instance_id != instance_id]
        self.logger.info(f"Removed instance {instance_id} from load balancer")

    def get_healthy_instances(self) -> List[ServiceInstance]:
        """Get list of healthy instances."""
        return [i for i in self.instances
                if i.status == InstanceStatus.RUNNING and i.health_status == "healthy"]

    async def select_instance(self, session_id: Optional[str] = None,
                            client_ip: Optional[str] = None) -> Optional[ServiceInstance]:
        """Select an instance based on load balancing strategy."""
        healthy_instances = self.get_healthy_instances()

        if not healthy_instances:
            return None

        # Handle sticky sessions
        if self.config.sticky_sessions and session_id:
            if session_id in self.session_store:
                instance_id = self.session_store[session_id]
                instance = next((i for i in healthy_instances if i.instance_id == instance_id), None)
                if instance:
                    return instance

        # Select instance based on strategy
        if self.config.strategy == LoadBalancingStrategy.ROUND_ROBIN:
            selected = await self._select_round_robin(healthy_instances)
        elif self.config.strategy == LoadBalancingStrategy.LEAST_CONNECTIONS:
            selected = await self._select_least_connections(healthy_instances)
        elif self.config.strategy == LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN:
            selected = await self._select_weighted_round_robin(healthy_instances)
        elif self.config.strategy == LoadBalancingStrategy.LEAST_RESPONSE_TIME:
            selected = await self._select_least_response_time(healthy_instances)
        elif self.config.strategy == LoadBalancingStrategy.IP_HASH:
            selected = await self._select_ip_hash(healthy_instances, client_ip)
        elif self.config.strategy == LoadBalancingStrategy.RESOURCE_BASED:
            selected = await self._select_resource_based(healthy_instances)
        else:
            selected = healthy_instances[0]  # Default to first instance

        # Store session mapping if sticky sessions enabled
        if self.config.sticky_sessions and session_id and selected:
            self.session_store[session_id] = selected.instance_id

        return selected

    async def _select_round_robin(self, instances: List[ServiceInstance]) -> ServiceInstance:
        """Round-robin selection."""
        selected = instances[self.round_robin_index % len(instances)]
        self.round_robin_index += 1
        return selected

    async def _select_least_connections(self, instances: List[ServiceInstance]) -> ServiceInstance:
        """Select instance with least connections."""
        return min(instances, key=lambda i: i.current_connections)

    async def _select_weighted_round_robin(self, instances: List[ServiceInstance]) -> ServiceInstance:
        """Weighted round-robin selection."""
        total_weight = sum(i.weight for i in instances)
        if total_weight == 0:
            return instances[0]

        # Simple weighted selection
        weights = [i.weight for i in instances]
        selected_idx = 0
        cumulative = 0

        target = (self.round_robin_index % sum(int(w * 10) for w in weights)) / 10
        for i, weight in enumerate(weights):
            cumulative += weight
            if target <= cumulative:
                selected_idx = i
                break

        self.round_robin_index += 1
        return instances[selected_idx]

    async def _select_least_response_time(self, instances: List[ServiceInstance]) -> ServiceInstance:
        """Select instance with lowest response time."""
        return min(instances, key=lambda i: i.response_time_ms)

    async def _select_ip_hash(self, instances: List[ServiceInstance],
                            client_ip: Optional[str]) -> ServiceInstance:
        """Select instance based on client IP hash."""
        if not client_ip:
            return instances[0]

        hash_value = hash(client_ip)
        return instances[hash_value % len(instances)]

    async def _select_resource_based(self, instances: List[ServiceInstance]) -> ServiceInstance:
        """Select instance based on resource utilization."""
        # Score based on CPU and memory usage (lower is better)
        def resource_score(instance: ServiceInstance) -> float:
            return instance.cpu_usage * 0.6 + instance.memory_usage * 0.4

        return min(instances, key=resource_score)

    async def update_instance_stats(self, instance_id: str, stats: Dict[str, Any]):
        """Update instance statistics."""
        for instance in self.instances:
            if instance.instance_id == instance_id:
                instance.current_connections = stats.get("connections", instance.current_connections)
                instance.cpu_usage = stats.get("cpu_usage", instance.cpu_usage)
                instance.memory_usage = stats.get("memory_usage", instance.memory_usage)
                instance.response_time_ms = stats.get("response_time", instance.response_time_ms)
                break

class AutoScaler:
    """Intelligent auto-scaling system."""

    def __init__(self, config: AutoScalerConfig, instance_provider: InstanceProvider):
        self.config = config
        self.instance_provider = instance_provider
        self.load_balancer = LoadBalancer(config.load_balancer_config)
        self.scaling_history: List[Dict[str, Any]] = []
        self.last_scaling_action: Dict[str, datetime] = {}
        self.running = False
        self.logger = logging.getLogger(__name__)

    async def start(self):
        """Start the auto-scaling system."""
        self.running = True
        self.logger.info(f"Starting auto-scaler for service {self.config.service_name}")

        # Start monitoring tasks
        tasks = [
            asyncio.create_task(self._monitoring_loop()),
            asyncio.create_task(self._health_check_loop()),
            asyncio.create_task(self._cleanup_loop())
        ]

        try:
            await asyncio.gather(*tasks)
        except Exception as e:
            self.logger.error(f"Auto-scaler error: {str(e)}")
        finally:
            self.running = False

    async def stop(self):
        """Stop the auto-scaling system."""
        self.running = False
        self.logger.info(f"Stopping auto-scaler for service {self.config.service_name}")

    async def _monitoring_loop(self):
        """Main monitoring and scaling loop."""
        while self.running:
            try:
                await self._evaluate_scaling_rules()
            except Exception as e:
                self.logger.error(f"Monitoring loop error: {str(e)}")

            await asyncio.sleep(self.config.monitoring_interval_seconds)

    async def _health_check_loop(self):
        """Health check loop for instances."""
        while self.running:
            try:
                await self._perform_health_checks()
            except Exception as e:
                self.logger.error(f"Health check loop error: {str(e)}")

            await asyncio.sleep(self.config.load_balancer_config.health_check_interval_seconds)

    async def _cleanup_loop(self):
        """Cleanup loop for terminated instances and old data."""
        while self.running:
            try:
                await self._cleanup_terminated_instances()
                await self._cleanup_old_scaling_history()
            except Exception as e:
                self.logger.error(f"Cleanup loop error: {str(e)}")

            await asyncio.sleep(300)  # Run cleanup every 5 minutes

    async def _evaluate_scaling_rules(self):
        """Evaluate all scaling rules and make scaling decisions."""
        healthy_instances = self.load_balancer.get_healthy_instances()
        current_count = len(healthy_instances)

        for rule in self.config.scaling_rules:
            if not rule.enabled:
                continue

            try:
                scaling_decision = await self._evaluate_rule(rule, healthy_instances)

                if scaling_decision != ScalingDirection.STABLE:
                    # Check cooldown period
                    cooldown_key = f"{rule.rule_id}_{scaling_decision.value}"
                    if cooldown_key in self.last_scaling_action:
                        time_since_last = (datetime.now() -
                                         self.last_scaling_action[cooldown_key]).total_seconds()
                        if time_since_last < rule.cooldown_seconds:
                            continue

                    # Execute scaling action
                    if scaling_decision == ScalingDirection.UP:
                        if current_count < rule.max_instances:
                            await self._scale_up(rule)
                    elif scaling_decision == ScalingDirection.DOWN:
                        if current_count > rule.min_instances:
                            await self._scale_down(rule)

            except Exception as e:
                self.logger.error(f"Error evaluating rule {rule.rule_id}: {str(e)}")

    async def _evaluate_rule(self, rule: ScalingRule,
                           instances: List[ServiceInstance]) -> ScalingDirection:
        """Evaluate a single scaling rule."""
        if not instances:
            return ScalingDirection.UP  # Need at least one instance

        # Collect metrics for all instances
        all_metrics = []
        for instance in instances:
            try:
                metrics = await self.instance_provider.get_instance_metrics(instance.instance_id)
                all_metrics.append(metrics)
            except Exception as e:
                self.logger.warning(f"Failed to get metrics for {instance.instance_id}: {str(e)}")

        if not all_metrics:
            return ScalingDirection.STABLE

        # Evaluate each metric in the rule
        scale_up_votes = 0
        scale_down_votes = 0
        total_weight = sum(m.weight for m in rule.metrics)

        for metric in rule.metrics:
            metric_name = metric.name
            values = [m.get(metric_name, 0) for m in all_metrics if metric_name in m]

            if not values:
                continue

            # Calculate aggregate value based on metric type
            if metric_name in ["cpu_usage", "memory_usage"]:
                current_value = statistics.mean(values)
            elif metric_name in ["request_rate", "queue_length"]:
                current_value = sum(values)
            else:
                current_value = statistics.mean(values)

            # Compare against thresholds
            if current_value > metric.threshold_up:
                scale_up_votes += metric.weight
            elif current_value < metric.threshold_down:
                scale_down_votes += metric.weight

        # Make decision based on weighted votes
        scale_up_ratio = scale_up_votes / total_weight if total_weight > 0 else 0
        scale_down_ratio = scale_down_votes / total_weight if total_weight > 0 else 0

        if scale_up_ratio > 0.5:  # Majority vote to scale up
            return ScalingDirection.UP
        elif scale_down_ratio > 0.5:  # Majority vote to scale down
            return ScalingDirection.DOWN
        else:
            return ScalingDirection.STABLE

    async def _scale_up(self, rule: ScalingRule):
        """Scale up by launching new instances."""
        try:
            instances_to_launch = min(rule.scale_up_count,
                                    rule.max_instances - len(self.load_balancer.instances))

            self.logger.info(f"Scaling up: launching {instances_to_launch} instances")

            for _ in range(instances_to_launch):
                instance = await self.instance_provider.launch_instance(
                    self.config.instance_launch_template
                )
                self.load_balancer.add_instance(instance)

            # Record scaling action
            self.last_scaling_action[f"{rule.rule_id}_up"] = datetime.now()
            self._record_scaling_event("scale_up", rule.rule_id, instances_to_launch)

        except Exception as e:
            self.logger.error(f"Error scaling up: {str(e)}")

    async def _scale_down(self, rule: ScalingRule):
        """Scale down by terminating instances."""
        try:
            healthy_instances = self.load_balancer.get_healthy_instances()
            instances_to_terminate = min(rule.scale_down_count,
                                       len(healthy_instances) - rule.min_instances)

            if instances_to_terminate <= 0:
                return

            self.logger.info(f"Scaling down: terminating {instances_to_terminate} instances")

            # Select instances to terminate (prefer newer instances with fewer connections)
            instances_by_priority = sorted(healthy_instances,
                                         key=lambda i: (i.current_connections, -i.created_at.timestamp()))

            for i in range(instances_to_terminate):
                instance = instances_by_priority[i]
                await self.instance_provider.terminate_instance(instance.instance_id)
                self.load_balancer.remove_instance(instance.instance_id)

            # Record scaling action
            self.last_scaling_action[f"{rule.rule_id}_down"] = datetime.now()
            self._record_scaling_event("scale_down", rule.rule_id, instances_to_terminate)

        except Exception as e:
            self.logger.error(f"Error scaling down: {str(e)}")

    async def _perform_health_checks(self):
        """Perform health checks on all instances."""
        for instance in self.load_balancer.instances.copy():
            try:
                is_healthy = await self.instance_provider.health_check_instance(instance)

                if not is_healthy:
                    if instance.health_status == "healthy":
                        self.logger.warning(f"Instance {instance.instance_id} became unhealthy")
                        instance.health_status = "unhealthy"

                    # If instance has been unhealthy for too long, terminate it
                    if (instance.last_health_check and
                        datetime.now() - instance.last_health_check >
                        timedelta(seconds=self.config.health_check_grace_period_seconds)):

                        self.logger.info(f"Terminating unhealthy instance {instance.instance_id}")
                        await self.instance_provider.terminate_instance(instance.instance_id)
                        self.load_balancer.remove_instance(instance.instance_id)

                else:
                    if instance.health_status != "healthy":
                        self.logger.info(f"Instance {instance.instance_id} recovered")
                        instance.health_status = "healthy"

            except Exception as e:
                self.logger.error(f"Health check error for {instance.instance_id}: {str(e)}")

    async def _cleanup_terminated_instances(self):
        """Remove terminated instances from load balancer."""
        for instance in self.load_balancer.instances.copy():
            if instance.status == InstanceStatus.TERMINATED:
                self.load_balancer.remove_instance(instance.instance_id)

    async def _cleanup_old_scaling_history(self):
        """Clean up old scaling history entries."""
        cutoff_date = datetime.now() - timedelta(days=7)
        self.scaling_history = [
            event for event in self.scaling_history
            if event.get("timestamp", datetime.min) > cutoff_date
        ]

    def _record_scaling_event(self, action: str, rule_id: str, instance_count: int):
        """Record a scaling event."""
        event = {
            "timestamp": datetime.now(),
            "action": action,
            "rule_id": rule_id,
            "instance_count": instance_count,
            "total_instances": len(self.load_balancer.instances)
        }

        self.scaling_history.append(event)

    # Public API methods
    async def get_status(self) -> Dict[str, Any]:
        """Get current auto-scaler status."""
        healthy_instances = self.load_balancer.get_healthy_instances()

        return {
            "service_name": self.config.service_name,
            "running": self.running,
            "total_instances": len(self.load_balancer.instances),
            "healthy_instances": len(healthy_instances),
            "instance_details": [
                {
                    "instance_id": i.instance_id,
                    "host": i.host,
                    "port": i.port,
                    "status": i.status.value,
                    "health_status": i.health_status,
                    "connections": i.current_connections,
                    "cpu_usage": i.cpu_usage,
                    "memory_usage": i.memory_usage,
                    "created_at": i.created_at.isoformat()
                } for i in self.load_balancer.instances
            ],
            "recent_scaling_events": self.scaling_history[-10:],  # Last 10 events
            "active_rules": len([r for r in self.config.scaling_rules if r.enabled])
        }

    async def manual_scale(self, target_count: int) -> bool:
        """Manually scale to target instance count."""
        try:
            current_count = len(self.load_balancer.get_healthy_instances())

            if target_count > current_count:
                # Scale up
                instances_to_launch = target_count - current_count
                for _ in range(instances_to_launch):
                    instance = await self.instance_provider.launch_instance(
                        self.config.instance_launch_template
                    )
                    self.load_balancer.add_instance(instance)

                self._record_scaling_event("manual_scale_up", "manual", instances_to_launch)

            elif target_count < current_count:
                # Scale down
                healthy_instances = self.load_balancer.get_healthy_instances()
                instances_to_terminate = current_count - target_count

                instances_by_priority = sorted(healthy_instances,
                                             key=lambda i: (i.current_connections, -i.created_at.timestamp()))

                for i in range(instances_to_terminate):
                    instance = instances_by_priority[i]
                    await self.instance_provider.terminate_instance(instance.instance_id)
                    self.load_balancer.remove_instance(instance.instance_id)

                self._record_scaling_event("manual_scale_down", "manual", instances_to_terminate)

            return True

        except Exception as e:
            self.logger.error(f"Manual scaling error: {str(e)}")
            return False

# Example usage and testing
async def main():
    """Test the auto-scaling system."""

    # Configure scaling rules
    cpu_metric = ScalingMetric(
        name="cpu_usage",
        current_value=0,
        target_value=70,
        threshold_up=80,
        threshold_down=30,
        weight=1.0,
        unit="percent"
    )

    memory_metric = ScalingMetric(
        name="memory_usage",
        current_value=0,
        target_value=75,
        threshold_up=85,
        threshold_down=40,
        weight=0.8,
        unit="percent"
    )

    scaling_rule = ScalingRule(
        rule_id="cpu_memory_rule",
        name="CPU and Memory Based Scaling",
        policy=ScalingPolicy.CPU_BASED,
        metrics=[cpu_metric, memory_metric],
        cooldown_seconds=300,
        min_instances=2,
        max_instances=10,
        scale_up_count=2,
        scale_down_count=1,
        evaluation_period_seconds=60
    )

    # Configure load balancer
    lb_config = LoadBalancerConfig(
        strategy=LoadBalancingStrategy.LEAST_CONNECTIONS,
        health_check_interval_seconds=30,
        sticky_sessions=False
    )

    # Configure auto-scaler
    autoscaler_config = AutoScalerConfig(
        service_name="vital-path-api",
        scaling_rules=[scaling_rule],
        load_balancer_config=lb_config,
        instance_launch_template={
            "image": "vital-path:latest",
            "instance_type": "m5.large",
            "security_groups": ["sg-12345"],
            "user_data": "#!/bin/bash\necho 'Starting VITAL Path service'"
        },
        monitoring_interval_seconds=30
    )

    # Initialize components
    instance_provider = LocalInstanceProvider()
    autoscaler = AutoScaler(autoscaler_config, instance_provider)

    # Launch initial instances
    for i in range(2):  # Start with minimum instances
        instance = await instance_provider.launch_instance(autoscaler_config.instance_launch_template)
        autoscaler.load_balancer.add_instance(instance)

    # Get initial status
    status = await autoscaler.get_status()
    print(f"Auto-scaler initialized:")
    print(f"Service: {status['service_name']}")
    print(f"Total instances: {status['total_instances']}")
    print(f"Healthy instances: {status['healthy_instances']}")

    # Test load balancer instance selection
    for i in range(5):
        selected = await autoscaler.load_balancer.select_instance()
        if selected:
            print(f"Selected instance: {selected.instance_id} on {selected.host}:{selected.port}")

    print("Scaling system test completed!")

if __name__ == "__main__":
    asyncio.run(main())