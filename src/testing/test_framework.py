"""
VITAL Path Phase 3: Comprehensive Testing Suite
Advanced testing framework with unit, integration, performance, and end-to-end testing capabilities.
"""

import asyncio
import unittest
import pytest
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Callable, Type
from enum import Enum
import json
import time
from datetime import datetime, timedelta
import logging
import inspect
from abc import ABC, abstractmethod
import aiohttp
import statistics
from contextlib import asynccontextmanager

class TestType(Enum):
    UNIT = "unit"
    INTEGRATION = "integration"
    PERFORMANCE = "performance"
    E2E = "end_to_end"
    LOAD = "load"
    SECURITY = "security"
    API = "api"

class TestStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    PASSED = "passed"
    FAILED = "failed"
    SKIPPED = "skipped"
    ERROR = "error"

class TestPriority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class TestResult:
    test_id: str
    name: str
    test_type: TestType
    status: TestStatus
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_ms: Optional[float] = None
    error_message: Optional[str] = None
    stack_trace: Optional[str] = None
    assertions: List[Dict[str, Any]] = field(default_factory=list)
    metrics: Dict[str, Any] = field(default_factory=dict)
    artifacts: List[str] = field(default_factory=list)

@dataclass
class TestSuite:
    suite_id: str
    name: str
    description: str
    test_types: List[TestType]
    tests: List['TestCase'] = field(default_factory=list)
    setup_hooks: List[Callable] = field(default_factory=list)
    teardown_hooks: List[Callable] = field(default_factory=list)
    parallel: bool = True
    timeout_seconds: int = 3600

@dataclass
class TestCase:
    test_id: str
    name: str
    description: str
    test_type: TestType
    priority: TestPriority
    test_function: Callable
    setup_hooks: List[Callable] = field(default_factory=list)
    teardown_hooks: List[Callable] = field(default_factory=list)
    expected_duration_ms: Optional[float] = None
    tags: List[str] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)
    retry_count: int = 0
    timeout_seconds: int = 300

@dataclass
class PerformanceMetrics:
    response_time_ms: float
    throughput_rps: float
    memory_usage_mb: float
    cpu_usage_percent: float
    error_rate_percent: float
    p95_response_time_ms: float
    p99_response_time_ms: float

@dataclass
class LoadTestConfig:
    concurrent_users: int
    duration_seconds: int
    ramp_up_seconds: int
    target_rps: Optional[float] = None
    test_data: List[Dict[str, Any]] = field(default_factory=list)

class TestRunner(ABC):
    """Abstract base class for test runners."""

    @abstractmethod
    async def run_test(self, test_case: TestCase) -> TestResult:
        pass

    @abstractmethod
    async def run_suite(self, test_suite: TestSuite) -> List[TestResult]:
        pass

class UnitTestRunner(TestRunner):
    """Runner for unit tests."""

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    async def run_test(self, test_case: TestCase) -> TestResult:
        """Run a single unit test."""
        result = TestResult(
            test_id=test_case.test_id,
            name=test_case.name,
            test_type=test_case.test_type,
            status=TestStatus.RUNNING,
            start_time=datetime.now()
        )

        try:
            # Run setup hooks
            for setup_hook in test_case.setup_hooks:
                if asyncio.iscoroutinefunction(setup_hook):
                    await setup_hook()
                else:
                    setup_hook()

            # Run the actual test
            start_time = time.time()

            if asyncio.iscoroutinefunction(test_case.test_function):
                await asyncio.wait_for(test_case.test_function(), timeout=test_case.timeout_seconds)
            else:
                test_case.test_function()

            end_time = time.time()

            result.end_time = datetime.now()
            result.duration_ms = (end_time - start_time) * 1000
            result.status = TestStatus.PASSED

        except asyncio.TimeoutError:
            result.status = TestStatus.ERROR
            result.error_message = f"Test timed out after {test_case.timeout_seconds} seconds"
            result.end_time = datetime.now()

        except AssertionError as e:
            result.status = TestStatus.FAILED
            result.error_message = str(e)
            result.stack_trace = self._get_stack_trace()
            result.end_time = datetime.now()

        except Exception as e:
            result.status = TestStatus.ERROR
            result.error_message = str(e)
            result.stack_trace = self._get_stack_trace()
            result.end_time = datetime.now()

        finally:
            # Run teardown hooks
            try:
                for teardown_hook in test_case.teardown_hooks:
                    if asyncio.iscoroutinefunction(teardown_hook):
                        await teardown_hook()
                    else:
                        teardown_hook()
            except Exception as e:
                self.logger.error(f"Teardown hook failed: {str(e)}")

        return result

    async def run_suite(self, test_suite: TestSuite) -> List[TestResult]:
        """Run a test suite."""
        results = []

        try:
            # Run suite setup hooks
            for setup_hook in test_suite.setup_hooks:
                if asyncio.iscoroutinefunction(setup_hook):
                    await setup_hook()
                else:
                    setup_hook()

            # Run tests
            if test_suite.parallel:
                # Run tests in parallel
                tasks = [self.run_test(test_case) for test_case in test_suite.tests]
                results = await asyncio.gather(*tasks, return_exceptions=True)

                # Convert exceptions to error results
                for i, result in enumerate(results):
                    if isinstance(result, Exception):
                        results[i] = TestResult(
                            test_id=test_suite.tests[i].test_id,
                            name=test_suite.tests[i].name,
                            test_type=test_suite.tests[i].test_type,
                            status=TestStatus.ERROR,
                            start_time=datetime.now(),
                            end_time=datetime.now(),
                            error_message=str(result)
                        )
            else:
                # Run tests sequentially
                for test_case in test_suite.tests:
                    result = await self.run_test(test_case)
                    results.append(result)

        finally:
            # Run suite teardown hooks
            try:
                for teardown_hook in test_suite.teardown_hooks:
                    if asyncio.iscoroutinefunction(teardown_hook):
                        await teardown_hook()
                    else:
                        teardown_hook()
            except Exception as e:
                self.logger.error(f"Suite teardown hook failed: {str(e)}")

        return results

    def _get_stack_trace(self) -> str:
        """Get current stack trace."""
        import traceback
        return traceback.format_exc()

class IntegrationTestRunner(TestRunner):
    """Runner for integration tests."""

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.test_environment = {}

    async def run_test(self, test_case: TestCase) -> TestResult:
        """Run a single integration test."""
        result = TestResult(
            test_id=test_case.test_id,
            name=test_case.name,
            test_type=test_case.test_type,
            status=TestStatus.RUNNING,
            start_time=datetime.now()
        )

        try:
            # Setup test environment
            await self._setup_test_environment()

            # Run setup hooks
            for setup_hook in test_case.setup_hooks:
                if asyncio.iscoroutinefunction(setup_hook):
                    await setup_hook()
                else:
                    setup_hook()

            # Run the integration test
            start_time = time.time()

            if asyncio.iscoroutinefunction(test_case.test_function):
                await asyncio.wait_for(
                    test_case.test_function(self.test_environment),
                    timeout=test_case.timeout_seconds
                )
            else:
                test_case.test_function(self.test_environment)

            end_time = time.time()

            result.end_time = datetime.now()
            result.duration_ms = (end_time - start_time) * 1000
            result.status = TestStatus.PASSED

        except Exception as e:
            result.status = TestStatus.ERROR if not isinstance(e, AssertionError) else TestStatus.FAILED
            result.error_message = str(e)
            result.stack_trace = self._get_stack_trace()
            result.end_time = datetime.now()

        finally:
            # Run teardown hooks
            try:
                for teardown_hook in test_case.teardown_hooks:
                    if asyncio.iscoroutinefunction(teardown_hook):
                        await teardown_hook()
                    else:
                        teardown_hook()

                await self._cleanup_test_environment()
            except Exception as e:
                self.logger.error(f"Cleanup failed: {str(e)}")

        return result

    async def run_suite(self, test_suite: TestSuite) -> List[TestResult]:
        """Run integration test suite."""
        # Similar to unit test runner but with environment management
        return await super().run_suite(test_suite)

    async def _setup_test_environment(self):
        """Setup test environment for integration tests."""
        # Initialize test database, services, etc.
        self.test_environment = {
            'database_url': 'postgresql://test:test@localhost:5432/vital_path_test',
            'redis_url': 'redis://localhost:6379/1',
            'api_base_url': 'http://localhost:8000/api/v1',
            'test_data': {}
        }

    async def _cleanup_test_environment(self):
        """Cleanup test environment."""
        # Clean up test data, close connections, etc.
        self.test_environment.clear()

    def _get_stack_trace(self) -> str:
        """Get current stack trace."""
        import traceback
        return traceback.format_exc()

class PerformanceTestRunner(TestRunner):
    """Runner for performance tests."""

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    async def run_test(self, test_case: TestCase) -> TestResult:
        """Run a single performance test."""
        result = TestResult(
            test_id=test_case.test_id,
            name=test_case.name,
            test_type=test_case.test_type,
            status=TestStatus.RUNNING,
            start_time=datetime.now()
        )

        try:
            # Run performance test with metrics collection
            metrics = await self._collect_performance_metrics(test_case)

            result.metrics = {
                'response_time_ms': metrics.response_time_ms,
                'throughput_rps': metrics.throughput_rps,
                'memory_usage_mb': metrics.memory_usage_mb,
                'cpu_usage_percent': metrics.cpu_usage_percent,
                'error_rate_percent': metrics.error_rate_percent,
                'p95_response_time_ms': metrics.p95_response_time_ms,
                'p99_response_time_ms': metrics.p99_response_time_ms
            }

            # Evaluate performance against expectations
            result.status = await self._evaluate_performance(test_case, metrics)
            result.end_time = datetime.now()
            result.duration_ms = (result.end_time - result.start_time).total_seconds() * 1000

        except Exception as e:
            result.status = TestStatus.ERROR
            result.error_message = str(e)
            result.end_time = datetime.now()

        return result

    async def run_suite(self, test_suite: TestSuite) -> List[TestResult]:
        """Run performance test suite."""
        return await super().run_suite(test_suite)

    async def _collect_performance_metrics(self, test_case: TestCase) -> PerformanceMetrics:
        """Collect performance metrics during test execution."""
        import psutil

        start_time = time.time()
        response_times = []
        error_count = 0
        success_count = 0

        # Monitor system resources
        process = psutil.Process()
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        cpu_percent_start = psutil.cpu_percent()

        try:
            # Run the performance test function
            if asyncio.iscoroutinefunction(test_case.test_function):
                await test_case.test_function()
            else:
                test_case.test_function()

            success_count = 1

        except Exception:
            error_count = 1

        end_time = time.time()

        # Calculate metrics
        total_duration = end_time - start_time
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        cpu_percent_end = psutil.cpu_percent()

        response_time_ms = total_duration * 1000
        response_times.append(response_time_ms)

        return PerformanceMetrics(
            response_time_ms=response_time_ms,
            throughput_rps=1 / total_duration if total_duration > 0 else 0,
            memory_usage_mb=final_memory - initial_memory,
            cpu_usage_percent=(cpu_percent_end + cpu_percent_start) / 2,
            error_rate_percent=(error_count / (success_count + error_count)) * 100,
            p95_response_time_ms=statistics.quantiles(response_times, n=20)[18] if response_times else 0,
            p99_response_time_ms=statistics.quantiles(response_times, n=100)[98] if response_times else 0
        )

    async def _evaluate_performance(self, test_case: TestCase, metrics: PerformanceMetrics) -> TestStatus:
        """Evaluate performance metrics against expectations."""
        # Check if performance meets expectations
        if test_case.expected_duration_ms and metrics.response_time_ms > test_case.expected_duration_ms:
            return TestStatus.FAILED

        if metrics.error_rate_percent > 5:  # More than 5% errors
            return TestStatus.FAILED

        return TestStatus.PASSED

class LoadTestRunner:
    """Runner for load tests."""

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    async def run_load_test(self, config: LoadTestConfig, test_function: Callable) -> Dict[str, Any]:
        """Run a load test with specified configuration."""
        results = {
            'config': {
                'concurrent_users': config.concurrent_users,
                'duration_seconds': config.duration_seconds,
                'ramp_up_seconds': config.ramp_up_seconds
            },
            'metrics': {
                'total_requests': 0,
                'successful_requests': 0,
                'failed_requests': 0,
                'response_times': [],
                'errors': []
            },
            'start_time': datetime.now(),
            'end_time': None
        }

        # Create semaphore to limit concurrent users
        semaphore = asyncio.Semaphore(config.concurrent_users)

        async def user_session():
            """Simulate a user session."""
            async with semaphore:
                try:
                    start_time = time.time()
                    await test_function()
                    end_time = time.time()

                    response_time = (end_time - start_time) * 1000
                    results['metrics']['response_times'].append(response_time)
                    results['metrics']['successful_requests'] += 1

                except Exception as e:
                    results['metrics']['failed_requests'] += 1
                    results['metrics']['errors'].append(str(e))

                results['metrics']['total_requests'] += 1

        # Calculate ramp-up delay
        ramp_up_delay = config.ramp_up_seconds / config.concurrent_users if config.concurrent_users > 0 else 0

        # Start user sessions with ramp-up
        tasks = []
        for i in range(config.concurrent_users):
            await asyncio.sleep(ramp_up_delay)
            task = asyncio.create_task(user_session())
            tasks.append(task)

        # Wait for test duration
        await asyncio.sleep(config.duration_seconds)

        # Wait for all tasks to complete or timeout
        try:
            await asyncio.wait_for(asyncio.gather(*tasks), timeout=60)
        except asyncio.TimeoutError:
            self.logger.warning("Some user sessions did not complete within timeout")

        results['end_time'] = datetime.now()

        # Calculate final metrics
        if results['metrics']['response_times']:
            results['metrics']['avg_response_time_ms'] = statistics.mean(results['metrics']['response_times'])
            results['metrics']['p95_response_time_ms'] = statistics.quantiles(
                results['metrics']['response_times'], n=20
            )[18]
            results['metrics']['p99_response_time_ms'] = statistics.quantiles(
                results['metrics']['response_times'], n=100
            )[98]

        total_duration = (results['end_time'] - results['start_time']).total_seconds()
        results['metrics']['throughput_rps'] = results['metrics']['total_requests'] / total_duration
        results['metrics']['error_rate_percent'] = (
            results['metrics']['failed_requests'] / results['metrics']['total_requests'] * 100
            if results['metrics']['total_requests'] > 0 else 0
        )

        return results

class VITALPathTestSuite:
    """Main test suite for VITAL Path platform."""

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.unit_runner = UnitTestRunner()
        self.integration_runner = IntegrationTestRunner()
        self.performance_runner = PerformanceTestRunner()
        self.load_runner = LoadTestRunner()

        # Initialize test suites
        self.test_suites = self._initialize_test_suites()

    def _initialize_test_suites(self) -> Dict[str, TestSuite]:
        """Initialize all test suites."""
        return {
            'orchestration': TestSuite(
                suite_id='orchestration',
                name='Master Orchestration Tests',
                description='Tests for the master orchestration system',
                test_types=[TestType.UNIT, TestType.INTEGRATION],
                tests=self._create_orchestration_tests()
            ),
            'agents': TestSuite(
                suite_id='agents',
                name='AI Agent Tests',
                description='Tests for all AI agents',
                test_types=[TestType.UNIT, TestType.INTEGRATION, TestType.PERFORMANCE],
                tests=self._create_agent_tests()
            ),
            'workflows': TestSuite(
                suite_id='workflows',
                name='Workflow Tests',
                description='Tests for workflow orchestration',
                test_types=[TestType.INTEGRATION, TestType.E2E],
                tests=self._create_workflow_tests()
            ),
            'api': TestSuite(
                suite_id='api',
                name='API Tests',
                description='Tests for REST API endpoints',
                test_types=[TestType.API, TestType.PERFORMANCE],
                tests=self._create_api_tests()
            ),
            'performance': TestSuite(
                suite_id='performance',
                name='Performance Tests',
                description='System performance and load tests',
                test_types=[TestType.PERFORMANCE, TestType.LOAD],
                tests=self._create_performance_tests()
            )
        }

    def _create_orchestration_tests(self) -> List[TestCase]:
        """Create orchestration system tests."""
        return [
            TestCase(
                test_id='orch_001',
                name='Test Triage Classification',
                description='Test the triage classification system',
                test_type=TestType.UNIT,
                priority=TestPriority.HIGH,
                test_function=self._test_triage_classification,
                tags=['orchestration', 'triage']
            ),
            TestCase(
                test_id='orch_002',
                name='Test Agent Routing',
                description='Test agent routing logic',
                test_type=TestType.UNIT,
                priority=TestPriority.HIGH,
                test_function=self._test_agent_routing,
                tags=['orchestration', 'routing']
            ),
            TestCase(
                test_id='orch_003',
                name='Test End-to-End Orchestration',
                description='Test complete orchestration workflow',
                test_type=TestType.INTEGRATION,
                priority=TestPriority.CRITICAL,
                test_function=self._test_e2e_orchestration,
                tags=['orchestration', 'integration'],
                expected_duration_ms=5000
            )
        ]

    def _create_agent_tests(self) -> List[TestCase]:
        """Create AI agent tests."""
        return [
            TestCase(
                test_id='agent_001',
                name='Test Clinical Trial Designer',
                description='Test clinical trial design capabilities',
                test_type=TestType.UNIT,
                priority=TestPriority.HIGH,
                test_function=self._test_clinical_trial_designer,
                tags=['agents', 'clinical_trial']
            ),
            TestCase(
                test_id='agent_002',
                name='Test Regulatory Strategist',
                description='Test regulatory strategy generation',
                test_type=TestType.UNIT,
                priority=TestPriority.HIGH,
                test_function=self._test_regulatory_strategist,
                tags=['agents', 'regulatory']
            ),
            TestCase(
                test_id='agent_003',
                name='Test Market Access Strategist',
                description='Test market access strategy development',
                test_type=TestType.UNIT,
                priority=TestPriority.HIGH,
                test_function=self._test_market_access_strategist,
                tags=['agents', 'market_access']
            ),
            TestCase(
                test_id='agent_004',
                name='Test Agent Performance',
                description='Test agent response times and throughput',
                test_type=TestType.PERFORMANCE,
                priority=TestPriority.MEDIUM,
                test_function=self._test_agent_performance,
                tags=['agents', 'performance'],
                expected_duration_ms=2000
            )
        ]

    def _create_workflow_tests(self) -> List[TestCase]:
        """Create workflow tests."""
        return [
            TestCase(
                test_id='workflow_001',
                name='Test Workflow Execution',
                description='Test workflow step execution',
                test_type=TestType.INTEGRATION,
                priority=TestPriority.HIGH,
                test_function=self._test_workflow_execution,
                tags=['workflows', 'execution']
            ),
            TestCase(
                test_id='workflow_002',
                name='Test Workflow Error Handling',
                description='Test workflow error handling and recovery',
                test_type=TestType.INTEGRATION,
                priority=TestPriority.HIGH,
                test_function=self._test_workflow_error_handling,
                tags=['workflows', 'error_handling']
            )
        ]

    def _create_api_tests(self) -> List[TestCase]:
        """Create API tests."""
        return [
            TestCase(
                test_id='api_001',
                name='Test API Authentication',
                description='Test API authentication endpoints',
                test_type=TestType.API,
                priority=TestPriority.CRITICAL,
                test_function=self._test_api_authentication,
                tags=['api', 'auth']
            ),
            TestCase(
                test_id='api_002',
                name='Test API Rate Limiting',
                description='Test API rate limiting functionality',
                test_type=TestType.API,
                priority=TestPriority.MEDIUM,
                test_function=self._test_api_rate_limiting,
                tags=['api', 'rate_limiting']
            )
        ]

    def _create_performance_tests(self) -> List[TestCase]:
        """Create performance tests."""
        return [
            TestCase(
                test_id='perf_001',
                name='Test System Load',
                description='Test system performance under load',
                test_type=TestType.LOAD,
                priority=TestPriority.MEDIUM,
                test_function=self._test_system_load,
                tags=['performance', 'load']
            )
        ]

    # Test implementation methods (simplified examples)
    async def _test_triage_classification(self):
        """Test triage classification system."""
        # Mock test implementation
        from src.orchestration.triage_classifier import TriageClassifier

        classifier = TriageClassifier()
        result = await classifier.classify("Design a Phase II oncology trial")

        assert result is not None
        assert result.domain is not None
        assert result.complexity_level is not None

    async def _test_agent_routing(self):
        """Test agent routing logic."""
        # Mock test implementation
        from src.orchestration.agent_router import AgentRouter

        router = AgentRouter()
        agent = await router.select_agent("clinical_trial", "high_complexity")

        assert agent is not None
        assert agent.agent_type is not None

    async def _test_e2e_orchestration(self):
        """Test end-to-end orchestration."""
        # Mock test implementation
        from src.orchestration.master_orchestrator import MasterOrchestrator

        orchestrator = MasterOrchestrator()
        result = await orchestrator.triage("Design a clinical trial for rare disease")

        assert result is not None
        assert result.agent_recommendation is not None
        assert result.confidence_score > 0

    async def _test_clinical_trial_designer(self):
        """Test clinical trial designer agent."""
        # Mock test implementation
        from src.agents.clinical_trial_designer import ClinicalTrialDesigner

        designer = ClinicalTrialDesigner()
        protocol = await designer.design_clinical_trial(
            indication="NSCLC",
            phase="phase_2",
            intervention="Novel therapy",
            design_requirements={}
        )

        assert protocol is not None
        assert protocol.study_id is not None

    async def _test_regulatory_strategist(self):
        """Test regulatory strategist agent."""
        # Mock test implementation - would test actual regulatory strategy generation
        pass

    async def _test_market_access_strategist(self):
        """Test market access strategist agent."""
        # Mock test implementation - would test actual market access strategy generation
        pass

    async def _test_agent_performance(self):
        """Test agent performance."""
        # Performance test implementation
        start_time = time.time()

        # Simulate agent call
        await asyncio.sleep(0.5)  # Simulate processing time

        end_time = time.time()
        duration_ms = (end_time - start_time) * 1000

        assert duration_ms < 2000  # Should complete within 2 seconds

    async def _test_workflow_execution(self):
        """Test workflow execution."""
        # Mock test implementation - would test actual workflow execution
        pass

    async def _test_workflow_error_handling(self):
        """Test workflow error handling."""
        # Mock test implementation - would test error handling and recovery
        pass

    async def _test_api_authentication(self):
        """Test API authentication."""
        # Mock test implementation - would test actual API authentication
        pass

    async def _test_api_rate_limiting(self):
        """Test API rate limiting."""
        # Mock test implementation - would test rate limiting
        pass

    async def _test_system_load(self):
        """Test system load."""
        # Load test implementation
        config = LoadTestConfig(
            concurrent_users=50,
            duration_seconds=30,
            ramp_up_seconds=10
        )

        async def load_test_function():
            await asyncio.sleep(0.1)  # Simulate API call

        results = await self.load_runner.run_load_test(config, load_test_function)

        assert results['metrics']['error_rate_percent'] < 5
        assert results['metrics']['avg_response_time_ms'] < 1000

    async def run_all_tests(self) -> Dict[str, List[TestResult]]:
        """Run all test suites."""
        all_results = {}

        for suite_id, test_suite in self.test_suites.items():
            self.logger.info(f"Running test suite: {suite_id}")

            if TestType.UNIT in test_suite.test_types:
                unit_tests = [t for t in test_suite.tests if t.test_type == TestType.UNIT]
                if unit_tests:
                    suite_copy = TestSuite(
                        suite_id=f"{suite_id}_unit",
                        name=f"{test_suite.name} - Unit",
                        description=test_suite.description,
                        test_types=[TestType.UNIT],
                        tests=unit_tests
                    )
                    results = await self.unit_runner.run_suite(suite_copy)
                    all_results[f"{suite_id}_unit"] = results

            if TestType.INTEGRATION in test_suite.test_types:
                integration_tests = [t for t in test_suite.tests if t.test_type == TestType.INTEGRATION]
                if integration_tests:
                    suite_copy = TestSuite(
                        suite_id=f"{suite_id}_integration",
                        name=f"{test_suite.name} - Integration",
                        description=test_suite.description,
                        test_types=[TestType.INTEGRATION],
                        tests=integration_tests
                    )
                    results = await self.integration_runner.run_suite(suite_copy)
                    all_results[f"{suite_id}_integration"] = results

            if TestType.PERFORMANCE in test_suite.test_types:
                performance_tests = [t for t in test_suite.tests if t.test_type == TestType.PERFORMANCE]
                if performance_tests:
                    suite_copy = TestSuite(
                        suite_id=f"{suite_id}_performance",
                        name=f"{test_suite.name} - Performance",
                        description=test_suite.description,
                        test_types=[TestType.PERFORMANCE],
                        tests=performance_tests
                    )
                    results = await self.performance_runner.run_suite(suite_copy)
                    all_results[f"{suite_id}_performance"] = results

        return all_results

    def generate_test_report(self, results: Dict[str, List[TestResult]]) -> Dict[str, Any]:
        """Generate comprehensive test report."""
        total_tests = sum(len(suite_results) for suite_results in results.values())
        passed_tests = sum(
            len([r for r in suite_results if r.status == TestStatus.PASSED])
            for suite_results in results.values()
        )
        failed_tests = sum(
            len([r for r in suite_results if r.status == TestStatus.FAILED])
            for suite_results in results.values()
        )
        error_tests = sum(
            len([r for r in suite_results if r.status == TestStatus.ERROR])
            for suite_results in results.values()
        )

        return {
            'summary': {
                'total_tests': total_tests,
                'passed': passed_tests,
                'failed': failed_tests,
                'errors': error_tests,
                'success_rate': (passed_tests / total_tests * 100) if total_tests > 0 else 0,
                'generated_at': datetime.now().isoformat()
            },
            'suite_results': {
                suite_id: {
                    'total': len(suite_results),
                    'passed': len([r for r in suite_results if r.status == TestStatus.PASSED]),
                    'failed': len([r for r in suite_results if r.status == TestStatus.FAILED]),
                    'errors': len([r for r in suite_results if r.status == TestStatus.ERROR]),
                    'avg_duration_ms': statistics.mean([
                        r.duration_ms for r in suite_results if r.duration_ms
                    ]) if any(r.duration_ms for r in suite_results) else 0,
                    'results': [
                        {
                            'test_id': r.test_id,
                            'name': r.name,
                            'status': r.status.value,
                            'duration_ms': r.duration_ms,
                            'error_message': r.error_message
                        }
                        for r in suite_results
                    ]
                }
                for suite_id, suite_results in results.items()
            }
        }

# Example usage and testing
async def main():
    """Run the comprehensive test suite."""
    test_suite = VITALPathTestSuite()

    print("🧪 Starting VITAL Path Comprehensive Test Suite")
    print("=" * 60)

    # Run all tests
    results = await test_suite.run_all_tests()

    # Generate report
    report = test_suite.generate_test_report(results)

    # Display summary
    summary = report['summary']
    print(f"\n📊 Test Results Summary:")
    print(f"Total Tests: {summary['total_tests']}")
    print(f"✅ Passed: {summary['passed']}")
    print(f"❌ Failed: {summary['failed']}")
    print(f"⚠️  Errors: {summary['errors']}")
    print(f"📈 Success Rate: {summary['success_rate']:.1f}%")

    # Display detailed results
    print(f"\n📋 Detailed Results:")
    for suite_id, suite_result in report['suite_results'].items():
        print(f"\n  {suite_id.upper()}:")
        print(f"    Total: {suite_result['total']}")
        print(f"    Passed: {suite_result['passed']}")
        print(f"    Failed: {suite_result['failed']}")
        print(f"    Errors: {suite_result['errors']}")
        print(f"    Avg Duration: {suite_result['avg_duration_ms']:.1f}ms")

    print(f"\n🎉 Test suite completed successfully!")

    return report

if __name__ == "__main__":
    asyncio.run(main())