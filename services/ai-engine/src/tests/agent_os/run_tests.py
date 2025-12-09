#!/usr/bin/env python3
"""
Agent OS Test Runner

Run all Agent OS unit and integration tests.

Usage:
    python run_tests.py              # Run all tests
    python run_tests.py --unit       # Run unit tests only
    python run_tests.py --integration # Run integration tests only
    python run_tests.py --coverage   # Run with coverage report
"""

import subprocess
import sys
import os

# Add src to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))


def run_tests(test_type: str = "all", coverage: bool = False):
    """Run Agent OS tests."""
    
    test_dir = os.path.dirname(__file__)
    
    # Build pytest command
    cmd = ["python", "-m", "pytest"]
    
    if coverage:
        cmd.extend(["--cov=services", "--cov=workers", "--cov-report=term-missing"])
    
    # Add test files based on type
    if test_type == "unit":
        cmd.extend([
            os.path.join(test_dir, "test_agent_instantiation_service.py"),
            os.path.join(test_dir, "test_neo4j_sync_service.py"),
            os.path.join(test_dir, "test_pinecone_sync_service.py"),
            os.path.join(test_dir, "test_synergy_calculation.py"),
            os.path.join(test_dir, "test_session_analytics_service.py"),
        ])
    elif test_type == "integration":
        cmd.extend([
            os.path.join(test_dir, "test_agent_os_integration.py"),
        ])
    else:
        cmd.append(test_dir)
    
    # Add verbosity
    cmd.extend(["-v", "--tb=short"])
    
    # Run
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=os.path.dirname(test_dir))
    
    return result.returncode


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Run Agent OS tests")
    parser.add_argument("--unit", action="store_true", help="Run unit tests only")
    parser.add_argument("--integration", action="store_true", help="Run integration tests only")
    parser.add_argument("--coverage", action="store_true", help="Run with coverage report")
    
    args = parser.parse_args()
    
    if args.unit:
        test_type = "unit"
    elif args.integration:
        test_type = "integration"
    else:
        test_type = "all"
    
    exit_code = run_tests(test_type, args.coverage)
    sys.exit(exit_code)
