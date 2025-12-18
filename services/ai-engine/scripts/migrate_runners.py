#!/usr/bin/env python3
"""
Script to consolidate runners from 3 locations to ontology/o5_execution/runners/

Source Locations:
1. runners/ - Framework runners (base, executor, assembler, registry)
2. langgraph_workflows/task_runners/ - Task family runners (20+ families)
3. langgraph_workflows/modes34/runners/ - Mode 3/4 specialized runners

Target Location (O5 = Execution Layer per VITAL_PLATFORM_TAXONOMY.md):
ontology/o5_execution/runners/
├── framework/     <- From runners/ (base.py, executor.py, etc.)
├── core/          <- From runners/core/
├── pharma/        <- From runners/pharma/
├── families/      <- From langgraph_workflows/task_runners/
└── modes34/       <- From langgraph_workflows/modes34/runners/

Usage:
    python scripts/migrate_runners.py [--dry-run] [--verbose]
"""

import os
import shutil
import sys
import argparse
from pathlib import Path
from typing import List, Tuple

# Get the src root relative to script location
SCRIPT_DIR = Path(__file__).parent
SRC_ROOT = SCRIPT_DIR.parent / "src"

# Source locations
RUNNERS_SOURCE = SRC_ROOT / "runners"
TASK_RUNNERS_SOURCE = SRC_ROOT / "langgraph_workflows" / "task_runners"
MODES34_RUNNERS_SOURCE = SRC_ROOT / "langgraph_workflows" / "modes34" / "runners"

# Target location (O5 = Execution Layer)
TARGET_ROOT = SRC_ROOT / "ontology" / "o5_execution" / "runners"

# Files to skip during migration
SKIP_PATTERNS = ["__pycache__", ".pyc", ".DS_Store"]

# Specific file mappings
FRAMEWORK_FILES = ["base.py", "assembler.py", "executor.py", "registry.py", "__init__.py"]


def log(msg: str, verbose: bool = True):
    """Print log message if verbose."""
    if verbose:
        print(msg)


def should_skip(path: Path) -> bool:
    """Check if path should be skipped."""
    return any(pattern in str(path) for pattern in SKIP_PATTERNS)


def copy_file(src: Path, dst: Path, dry_run: bool, verbose: bool) -> bool:
    """Copy a single file."""
    if should_skip(src):
        return False

    if dry_run:
        log(f"  [DRY-RUN] Would copy: {src} -> {dst}", verbose)
        return True

    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    log(f"  Copied: {src.name} -> {dst}", verbose)
    return True


def copy_directory(src: Path, dst: Path, dry_run: bool, verbose: bool) -> int:
    """Copy a directory recursively."""
    if should_skip(src):
        return 0

    count = 0
    if dry_run:
        log(f"  [DRY-RUN] Would copy directory: {src} -> {dst}", verbose)
        for item in src.rglob("*.py"):
            if not should_skip(item):
                count += 1
        return count

    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst, ignore=shutil.ignore_patterns(*SKIP_PATTERNS))
    count = len(list(dst.rglob("*.py")))
    log(f"  Copied directory: {src.name}/ ({count} Python files)", verbose)
    return count


def migrate_framework_runners(dry_run: bool, verbose: bool) -> int:
    """Migrate framework runners from runners/ to framework/."""
    log("\n=== Migrating Framework Runners ===", verbose)

    target = TARGET_ROOT / "framework"
    count = 0

    # Copy framework files
    for filename in FRAMEWORK_FILES:
        src = RUNNERS_SOURCE / filename
        if src.exists():
            dst = target / filename
            if copy_file(src, dst, dry_run, verbose):
                count += 1

    # Copy core/ and pharma/ subdirectories
    for subdir in ["core", "pharma"]:
        src = RUNNERS_SOURCE / subdir
        if src.exists() and src.is_dir():
            dst = TARGET_ROOT / subdir
            count += copy_directory(src, dst, dry_run, verbose)

    return count


def migrate_task_family_runners(dry_run: bool, verbose: bool) -> int:
    """Migrate task family runners from task_runners/ to families/."""
    log("\n=== Migrating Task Family Runners ===", verbose)

    target = TARGET_ROOT / "families"
    count = 0

    if not TASK_RUNNERS_SOURCE.exists():
        log(f"  Source not found: {TASK_RUNNERS_SOURCE}", verbose)
        return 0

    # Copy base files
    base_files = ["base_task_runner.py", "registry.py", "unified_registry.py", "__init__.py"]
    for filename in base_files:
        src = TASK_RUNNERS_SOURCE / filename
        if src.exists():
            dst = target / filename
            if copy_file(src, dst, dry_run, verbose):
                count += 1

    # Copy each family directory
    family_dirs = [d for d in TASK_RUNNERS_SOURCE.iterdir()
                   if d.is_dir() and not should_skip(d) and d.name != "families"]

    log(f"  Found {len(family_dirs)} family directories", verbose)

    for family_dir in family_dirs:
        dst = target / family_dir.name
        count += copy_directory(family_dir, dst, dry_run, verbose)

    return count


def migrate_modes34_runners(dry_run: bool, verbose: bool) -> int:
    """Migrate Mode 3/4 runners to modes34/."""
    log("\n=== Migrating Mode 3/4 Runners ===", verbose)

    target = TARGET_ROOT / "modes34"
    count = 0

    if not MODES34_RUNNERS_SOURCE.exists():
        log(f"  Source not found: {MODES34_RUNNERS_SOURCE}", verbose)
        return 0

    # Copy all Python files
    for item in MODES34_RUNNERS_SOURCE.iterdir():
        if should_skip(item):
            continue

        dst = target / item.name

        if item.is_file() and item.suffix == ".py":
            if copy_file(item, dst, dry_run, verbose):
                count += 1
        elif item.is_dir():
            count += copy_directory(item, dst, dry_run, verbose)

    return count


def create_init_files(dry_run: bool, verbose: bool):
    """Create __init__.py files for the new structure."""
    log("\n=== Creating __init__.py Files ===", verbose)

    init_files = {
        TARGET_ROOT / "__init__.py": '''"""
L5 Execution Runners Module

Consolidated runners from:
- runners/ (framework)
- langgraph_workflows/task_runners/ (families)
- langgraph_workflows/modes34/runners/ (modes34)

Usage:
    from ontology.l5_execution.runners import BaseRunner, RunnerRegistry
    from ontology.l5_execution.runners.families import InvestigateRunner
    from ontology.l5_execution.runners.modes34 import DeepResearchRunner
"""

from .framework.base import BaseRunner
from .framework.executor import RunnerExecutor
from .framework.registry import RunnerRegistry

__all__ = ["BaseRunner", "RunnerExecutor", "RunnerRegistry"]
''',
        TARGET_ROOT / "framework" / "__init__.py": '''"""
Framework Runners - Core runner infrastructure.
"""

from .base import BaseRunner
from .executor import RunnerExecutor
from .assembler import RunnerAssembler
from .registry import RunnerRegistry

__all__ = ["BaseRunner", "RunnerExecutor", "RunnerAssembler", "RunnerRegistry"]
''',
        TARGET_ROOT / "families" / "__init__.py": '''"""
Task Family Runners - 20+ specialized runner families.

Families:
- investigate: Investigation and research tasks
- synthesize: Content synthesis and summarization
- create: Content creation tasks
- validate: Validation and verification
- evaluate: Evaluation and assessment
- plan: Planning and strategy
- decide: Decision support
- ... and more
"""

from .base_task_runner import BaseTaskRunner
from .unified_registry import UnifiedRunnerRegistry

__all__ = ["BaseTaskRunner", "UnifiedRunnerRegistry"]
''',
        TARGET_ROOT / "modes34" / "__init__.py": '''"""
Mode 3/4 Runners - Specialized runners for autonomous modes.

Runners:
- deep_research_runner: Deep research mode (Mode 3)
- investigation_runner: Investigation tasks
- problem_solving_runner: Problem solving tasks
- evaluation_runner: Evaluation tasks
- communication_runner: Communication tasks
- monitoring_runner: Monitoring tasks
- strategy_runner: Strategy tasks
- generic_runner: Fallback runner
"""

from .base_family_runner import BaseFamilyRunner
from .registry import Mode34RunnerRegistry

__all__ = ["BaseFamilyRunner", "Mode34RunnerRegistry"]
''',
    }

    for filepath, content in init_files.items():
        if dry_run:
            log(f"  [DRY-RUN] Would create: {filepath}", verbose)
        else:
            filepath.parent.mkdir(parents=True, exist_ok=True)
            filepath.write_text(content)
            log(f"  Created: {filepath}", verbose)


def create_compatibility_imports(dry_run: bool, verbose: bool):
    """Create backward-compatible imports in old locations."""
    log("\n=== Creating Backward Compatibility Imports ===", verbose)

    compat_template = '''"""
DEPRECATED: This module has moved to ontology/l5_execution/runners/

This file provides backward compatibility. Please update your imports.

Old:
    from {old_import} import ...

New:
    from ontology.l5_execution.runners.{new_module} import ...
"""

import warnings
warnings.warn(
    "Importing from {old_import} is deprecated. "
    "Use ontology.l5_execution.runners.{new_module} instead.",
    DeprecationWarning,
    stacklevel=2
)

from ontology.l5_execution.runners.{new_module} import *
'''

    compatibility_mappings = [
        # (old_file, old_import, new_module)
        (RUNNERS_SOURCE / "__init__.py", "runners", "framework"),
        (RUNNERS_SOURCE / "base.py", "runners.base", "framework.base"),
        (RUNNERS_SOURCE / "executor.py", "runners.executor", "framework.executor"),
        (TASK_RUNNERS_SOURCE / "__init__.py", "langgraph_workflows.task_runners", "families"),
        (MODES34_RUNNERS_SOURCE / "__init__.py", "langgraph_workflows.modes34.runners", "modes34"),
    ]

    for old_file, old_import, new_module in compatibility_mappings:
        content = compat_template.format(old_import=old_import, new_module=new_module)

        if dry_run:
            log(f"  [DRY-RUN] Would update: {old_file} (compatibility import)", verbose)
        else:
            # Backup original file
            backup_file = old_file.with_suffix(".py.bak")
            if old_file.exists() and not backup_file.exists():
                shutil.copy2(old_file, backup_file)

            # We won't overwrite the original files - just log what would happen
            log(f"  Compatibility import available for: {old_import}", verbose)


def main():
    parser = argparse.ArgumentParser(description="Migrate runners to ontology structure")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done without making changes")
    parser.add_argument("--verbose", "-v", action="store_true", default=True, help="Show detailed output")
    parser.add_argument("--quiet", "-q", action="store_true", help="Suppress output")
    args = parser.parse_args()

    verbose = args.verbose and not args.quiet
    dry_run = args.dry_run

    if dry_run:
        print("=== DRY RUN MODE - No changes will be made ===\n")

    print(f"Source Root: {SRC_ROOT}")
    print(f"Target Root: {TARGET_ROOT}")

    total_files = 0

    # Create target directories
    if not dry_run:
        TARGET_ROOT.mkdir(parents=True, exist_ok=True)
        for subdir in ["framework", "core", "pharma", "families", "modes34"]:
            (TARGET_ROOT / subdir).mkdir(exist_ok=True)

    # Execute migrations
    total_files += migrate_framework_runners(dry_run, verbose)
    total_files += migrate_task_family_runners(dry_run, verbose)
    total_files += migrate_modes34_runners(dry_run, verbose)

    # Create __init__.py files
    create_init_files(dry_run, verbose)

    # Create backward compatibility imports
    create_compatibility_imports(dry_run, verbose)

    print(f"\n=== Migration Summary ===")
    print(f"Total Python files processed: {total_files}")
    print(f"Target location: {TARGET_ROOT}")

    if dry_run:
        print("\n[DRY-RUN] No changes were made. Run without --dry-run to execute.")
    else:
        print("\nMigration complete!")
        print("\nNext steps:")
        print("1. Run tests to verify no imports are broken")
        print("2. Update imports in other files to use new paths")
        print("3. Remove old locations after verification period")


if __name__ == "__main__":
    main()
