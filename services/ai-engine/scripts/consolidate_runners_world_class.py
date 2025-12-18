#!/usr/bin/env python3
"""
World-Class Runner Consolidation Script

Consolidates all runners from 3 locations into a single world-class structure:

FROM:
1. runners/ - framework files + core/ + pharma/
2. langgraph_workflows/task_runners/ - 22 cognitive categories
3. langgraph_workflows/modes34/runners/ - family runners

TO:
runners/
├── __init__.py              # Public exports
├── registry.py              # UnifiedRunnerRegistry
├── base/                    # Abstract base classes
│   ├── task_runner.py       # TaskRunner[InputT, OutputT]
│   ├── family_runner.py     # BaseFamilyRunner[StateT]
│   └── interfaces.py        # Protocols & ABCs
├── families/                # 8 Family Runners (from modes34/)
│   ├── deep_research.py
│   ├── strategy.py
│   ├── investigation.py
│   └── ...
├── cognitive/               # 88+ Task Runners (from task_runners/)
│   ├── understand/
│   ├── evaluate/
│   └── ... (22 categories)
└── pharma/                  # Domain-specific runners
    └── ...

Usage:
    python scripts/consolidate_runners_world_class.py [--dry-run] [--verbose]
"""

import os
import shutil
import argparse
from pathlib import Path
from typing import List, Dict, Tuple

SCRIPT_DIR = Path(__file__).parent
SRC_ROOT = SCRIPT_DIR.parent / "src"

# Target structure
TARGET_RUNNERS = SRC_ROOT / "runners"

# Source locations
SOURCE_RUNNERS = SRC_ROOT / "runners"
SOURCE_TASK_RUNNERS = SRC_ROOT / "langgraph_workflows" / "task_runners"
SOURCE_MODES34 = SRC_ROOT / "langgraph_workflows" / "modes34" / "runners"
ONTOLOGY_RUNNERS = SRC_ROOT / "ontology" / "o5_execution" / "runners"

# Mapping from modes34 runners to family names
MODES34_TO_FAMILIES = {
    "deep_research_runner.py": "deep_research.py",
    "strategy_runner.py": "strategy.py",
    "investigation_runner.py": "investigation.py",
    "evaluation_runner.py": "evaluation.py",
    "problem_solving_runner.py": "problem_solving.py",
    "communication_runner.py": "communication.py",
    "monitoring_runner.py": "monitoring.py",
    "generic_runner.py": "generic.py",
    "base_family_runner.py": None,  # Goes to base/
    "output_validation.py": None,   # Stays in base as utility
    "registry.py": None,            # Merged with main registry
}

# Skip patterns
SKIP_PATTERNS = ["__pycache__", ".pyc", ".DS_Store", ".bak"]


def log(msg: str, verbose: bool = True):
    if verbose:
        print(msg)


def should_skip(path: Path) -> bool:
    for pattern in SKIP_PATTERNS:
        if pattern in str(path):
            return True
    return False


def ensure_dir(path: Path, dry_run: bool = False):
    if not dry_run and not path.exists():
        path.mkdir(parents=True, exist_ok=True)


def copy_file(src: Path, dst: Path, dry_run: bool = False, verbose: bool = True):
    if should_skip(src):
        return False

    if not src.exists():
        log(f"  SKIP (not found): {src.name}", verbose)
        return False

    # Skip if source and destination are the same file
    if src.resolve() == dst.resolve():
        log(f"  SKIP (same file): {src.name}", verbose)
        return False

    # Skip if destination already exists (don't overwrite)
    if dst.exists():
        log(f"  SKIP (exists): {dst.relative_to(TARGET_RUNNERS)}", verbose)
        return False

    log(f"  COPY: {src.name} -> {dst.relative_to(TARGET_RUNNERS)}", verbose)

    if not dry_run:
        ensure_dir(dst.parent)
        shutil.copy2(src, dst)

    return True


def copy_dir(src: Path, dst: Path, dry_run: bool = False, verbose: bool = True):
    if should_skip(src) or not src.exists():
        return 0

    count = 0
    for item in src.iterdir():
        if should_skip(item):
            continue

        target = dst / item.name

        if item.is_dir():
            count += copy_dir(item, target, dry_run, verbose)
        else:
            if copy_file(item, target, dry_run, verbose):
                count += 1

    return count


def consolidate_base(dry_run: bool = False, verbose: bool = True) -> int:
    """Consolidate base runner classes."""
    log("\n=== Step 1: Consolidate base/ ===", verbose)

    base_dir = TARGET_RUNNERS / "base"
    ensure_dir(base_dir, dry_run)

    count = 0

    # From original runners/
    base_files = [
        ("base.py", "task_runner.py"),
        ("executor.py", "executor.py"),
        ("assembler.py", "assembler.py"),
    ]

    for src_name, dst_name in base_files:
        src = SOURCE_RUNNERS / src_name
        dst = base_dir / dst_name
        if copy_file(src, dst, dry_run, verbose):
            count += 1

    # From modes34/
    src = SOURCE_MODES34 / "base_family_runner.py"
    dst = base_dir / "family_runner.py"
    if copy_file(src, dst, dry_run, verbose):
        count += 1

    # Output validation utility
    src = SOURCE_MODES34 / "output_validation.py"
    dst = base_dir / "output_validation.py"
    if copy_file(src, dst, dry_run, verbose):
        count += 1

    # Create interfaces.py stub if needed
    interfaces_path = base_dir / "interfaces.py"
    if not interfaces_path.exists() and not dry_run:
        interfaces_path.write_text('''"""
Runner interfaces and protocols.

This module defines the abstract interfaces that all runners must implement.
"""

from abc import ABC, abstractmethod
from typing import TypeVar, Generic, Dict, Any

InputT = TypeVar("InputT")
OutputT = TypeVar("OutputT")
StateT = TypeVar("StateT")


class RunnerInterface(ABC, Generic[InputT, OutputT]):
    """Base interface for all runners."""

    @abstractmethod
    async def execute(self, input: InputT, context: Dict[str, Any]) -> OutputT:
        """Execute the runner with given input and context."""
        pass


class FamilyRunnerInterface(ABC, Generic[StateT]):
    """Interface for family runners with state management."""

    @abstractmethod
    async def create_plan(self, state: StateT) -> list:
        """Create execution plan."""
        pass

    @abstractmethod
    async def execute_step(self, step: dict, state: StateT) -> dict:
        """Execute a single step."""
        pass

    @abstractmethod
    async def synthesize(self, state: StateT) -> dict:
        """Synthesize final results."""
        pass
''')
        count += 1
        log(f"  CREATE: base/interfaces.py", verbose)

    return count


def consolidate_families(dry_run: bool = False, verbose: bool = True) -> int:
    """Consolidate family runners from modes34/."""
    log("\n=== Step 2: Consolidate families/ ===", verbose)

    families_dir = TARGET_RUNNERS / "families"
    ensure_dir(families_dir, dry_run)

    count = 0

    for src_name, dst_name in MODES34_TO_FAMILIES.items():
        if dst_name is None:
            continue  # Skip, handled elsewhere

        src = SOURCE_MODES34 / src_name
        dst = families_dir / dst_name
        if copy_file(src, dst, dry_run, verbose):
            count += 1

    # Create __init__.py for families
    init_path = families_dir / "__init__.py"
    if not init_path.exists() and not dry_run:
        init_content = '''"""
Family Runners - Complex Multi-Step Workflows

8 Family Runners for Mode 3/4 autonomous missions:
- DeepResearchRunner: ToT → CoT → Reflection pattern
- StrategyRunner: SWOT, Scenarios, Roadmaps
- InvestigationRunner: Bayesian root cause analysis
- EvaluationRunner: MCDA decision analysis
- ProblemSolvingRunner: Hypothesis → Test → Iterate
- CommunicationRunner: Audience-led messaging
- MonitoringRunner: Signal tracking and alerting
- GenericRunner: Flexible fallback for custom workflows
"""

from .deep_research import DeepResearchRunner
from .strategy import StrategyRunner
from .investigation import InvestigationRunner
from .evaluation import EvaluationRunner
from .problem_solving import ProblemSolvingRunner
from .communication import CommunicationRunner
from .monitoring import MonitoringRunner
from .generic import GenericRunner

__all__ = [
    "DeepResearchRunner",
    "StrategyRunner",
    "InvestigationRunner",
    "EvaluationRunner",
    "ProblemSolvingRunner",
    "CommunicationRunner",
    "MonitoringRunner",
    "GenericRunner",
]
'''
        init_path.write_text(init_content)
        count += 1
        log(f"  CREATE: families/__init__.py", verbose)

    return count


def consolidate_cognitive(dry_run: bool = False, verbose: bool = True) -> int:
    """Consolidate cognitive task runners from task_runners/."""
    log("\n=== Step 3: Consolidate cognitive/ ===", verbose)

    cognitive_dir = TARGET_RUNNERS / "cognitive"
    ensure_dir(cognitive_dir, dry_run)

    count = 0

    # Categories to migrate (directories in task_runners/)
    cognitive_categories = [
        "understand", "evaluate", "decide", "create", "synthesize",
        "validate", "plan", "watch", "investigate", "solve",
        "prepare", "refine", "predict", "engage", "align",
        "influence", "adapt", "design", "discover", "execute",
        "govern", "secure"
    ]

    for category in cognitive_categories:
        src_dir = SOURCE_TASK_RUNNERS / category
        dst_dir = cognitive_dir / category

        if src_dir.exists() and src_dir.is_dir():
            copied = copy_dir(src_dir, dst_dir, dry_run, verbose)
            count += copied

    # Copy base_task_runner.py to cognitive/
    src = SOURCE_TASK_RUNNERS / "base_task_runner.py"
    dst = cognitive_dir / "base_task_runner.py"
    if copy_file(src, dst, dry_run, verbose):
        count += 1

    # Create cognitive __init__.py
    init_path = cognitive_dir / "__init__.py"
    if not init_path.exists() and not dry_run:
        init_content = '''"""
Cognitive Task Runners - Atomic Mental Operations

88+ task runners organized into 22 cognitive categories:

Knowledge Acquisition:
- understand/: scan, explore, gap_detect, extract

Quality Assessment:
- evaluate/: critique, compare, score, benchmark

Strategic Choice:
- decide/: frame, option_gen, tradeoff, recommend

Content Generation:
- create/: draft, expand, format, citation

Integration:
- synthesize/: collect, theme, resolve, narrate

Verification:
- validate/: compliance_check, fact_check, citation_check, consistency_check

... and 16 more categories
"""

from .base_task_runner import BaseTaskRunner

__all__ = ["BaseTaskRunner"]
'''
        init_path.write_text(init_content)
        count += 1
        log(f"  CREATE: cognitive/__init__.py", verbose)

    return count


def consolidate_pharma(dry_run: bool = False, verbose: bool = True) -> int:
    """Consolidate pharma domain runners."""
    log("\n=== Step 4: Consolidate pharma/ ===", verbose)

    src_dir = SOURCE_RUNNERS / "pharma"
    dst_dir = TARGET_RUNNERS / "pharma"

    if src_dir.exists():
        return copy_dir(src_dir, dst_dir, dry_run, verbose)

    return 0


def consolidate_core(dry_run: bool = False, verbose: bool = True) -> int:
    """Consolidate core runners."""
    log("\n=== Step 5: Consolidate core/ ===", verbose)

    src_dir = SOURCE_RUNNERS / "core"
    dst_dir = TARGET_RUNNERS / "core"

    if src_dir.exists():
        return copy_dir(src_dir, dst_dir, dry_run, verbose)

    return 0


def update_main_registry(dry_run: bool = False, verbose: bool = True) -> int:
    """Update the main registry.py to include all runners."""
    log("\n=== Step 6: Update main registry.py ===", verbose)

    # Copy original registry
    src = SOURCE_RUNNERS / "registry.py"
    dst = TARGET_RUNNERS / "registry.py"

    if copy_file(src, dst, dry_run, verbose):
        return 1
    return 0


def create_main_init(dry_run: bool = False, verbose: bool = True) -> int:
    """Create the main runners/__init__.py with all exports."""
    log("\n=== Step 7: Create main __init__.py ===", verbose)

    init_path = TARGET_RUNNERS / "__init__.py"

    init_content = '''"""
VITAL Platform Runners - World-Class Cognitive Operations

The unified runner architecture supporting the Task Formula:
    TASK = AGENT + RUNNER + SKILL + KNOWLEDGE + PROMPT

Runner Types:
- base/: Abstract base classes (TaskRunner, FamilyRunner)
- families/: 8 complex multi-step workflow runners
- cognitive/: 88+ atomic task runners in 22 categories
- pharma/: 119 domain-specific pharmaceutical runners
- core/: Core utility runners

Total: 215+ runners

Usage:
    from runners import UnifiedRunnerRegistry
    from runners.families import DeepResearchRunner
    from runners.cognitive.understand import ScanRunner
"""

from .registry import UnifiedRunnerRegistry

# Base classes
from .base.task_runner import TaskRunner
from .base.family_runner import FamilyRunner

# Family runners
from .families import (
    DeepResearchRunner,
    StrategyRunner,
    InvestigationRunner,
    EvaluationRunner,
    ProblemSolvingRunner,
    CommunicationRunner,
    MonitoringRunner,
    GenericRunner,
)

__all__ = [
    # Registry
    "UnifiedRunnerRegistry",
    # Base
    "TaskRunner",
    "FamilyRunner",
    # Families
    "DeepResearchRunner",
    "StrategyRunner",
    "InvestigationRunner",
    "EvaluationRunner",
    "ProblemSolvingRunner",
    "CommunicationRunner",
    "MonitoringRunner",
    "GenericRunner",
]

__version__ = "2.0.0"
'''

    if not dry_run:
        init_path.write_text(init_content)

    log(f"  CREATE: __init__.py", verbose)
    return 1


def cleanup_ontology_runners(dry_run: bool = False, verbose: bool = True) -> int:
    """Remove partial migration from ontology/o5_execution/runners/."""
    log("\n=== Step 8: Clean up ontology runners ===", verbose)

    if ONTOLOGY_RUNNERS.exists():
        # Count files being removed
        count = len(list(ONTOLOGY_RUNNERS.rglob("*.py")))

        log(f"  REMOVE: ontology/o5_execution/runners/ ({count} files)", verbose)

        if not dry_run:
            shutil.rmtree(ONTOLOGY_RUNNERS)
            # Recreate empty directory with placeholder
            ONTOLOGY_RUNNERS.mkdir(parents=True, exist_ok=True)
            (ONTOLOGY_RUNNERS / "__init__.py").write_text('''"""
O5 Execution Runners - DEPRECATED

Runners have been consolidated to the top-level runners/ directory
following the World-Class Project Structure.

Import from runners instead:
    from runners import UnifiedRunnerRegistry
    from runners.families import DeepResearchRunner
"""

import warnings
warnings.warn(
    "ontology.o5_execution.runners is deprecated. Use runners/ instead.",
    DeprecationWarning,
    stacklevel=2
)

# Re-export from new location for backward compatibility
from runners import *
''')

        return count

    return 0


def main():
    parser = argparse.ArgumentParser(description="Consolidate runners to world-class structure")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done")
    parser.add_argument("--verbose", "-v", action="store_true", default=True)
    parser.add_argument("--skip-cleanup", action="store_true", help="Skip ontology cleanup")

    args = parser.parse_args()

    print(f"\n{'='*70}")
    print("World-Class Runner Consolidation")
    print(f"{'='*70}")
    print(f"Target: {TARGET_RUNNERS}")
    print(f"Dry run: {args.dry_run}")
    print(f"{'='*70}")

    total = 0

    # Ensure target directory exists
    ensure_dir(TARGET_RUNNERS, args.dry_run)

    # Consolidate all components
    total += consolidate_base(args.dry_run, args.verbose)
    total += consolidate_families(args.dry_run, args.verbose)
    total += consolidate_cognitive(args.dry_run, args.verbose)
    total += consolidate_pharma(args.dry_run, args.verbose)
    total += consolidate_core(args.dry_run, args.verbose)
    total += update_main_registry(args.dry_run, args.verbose)
    total += create_main_init(args.dry_run, args.verbose)

    if not args.skip_cleanup:
        total += cleanup_ontology_runners(args.dry_run, args.verbose)

    print(f"\n{'='*70}")
    print(f"{'Dry run complete' if args.dry_run else 'Consolidation complete'}!")
    print(f"Total files processed: {total}")
    print(f"{'='*70}\n")

    # Show final structure
    print("Final structure:")
    print(f"  runners/")
    print(f"  ├── base/           # Framework classes")
    print(f"  ├── families/       # 8 family runners")
    print(f"  ├── cognitive/      # 88+ task runners")
    print(f"  ├── core/           # Core utilities")
    print(f"  └── pharma/         # Domain runners")


if __name__ == "__main__":
    main()
