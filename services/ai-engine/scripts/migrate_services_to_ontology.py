#!/usr/bin/env python3
"""
Script to migrate service files to ontology layers per Phase 4.

Migration Map (per VITAL_PLATFORM_TAXONOMY.md - O-prefix):
- O0 Domain: evidence_detector, graphrag services
- O1 Organization: organization services
- O2 Process: workflow template services
- O4 Agents: agent_service, agent_orchestrator
- O5 Execution: mission services
- O6 Analytics: session_analytics, agent_usage, response_quality
- O7 Value: roi_calculator

Usage:
    python scripts/migrate_services_to_ontology.py [--dry-run] [--verbose]
"""

import os
import shutil
import sys
import argparse
from pathlib import Path
from typing import List, Tuple, Dict

# Get the src root relative to script location
SCRIPT_DIR = Path(__file__).parent
SRC_ROOT = SCRIPT_DIR.parent / "src"
SERVICES_DIR = SRC_ROOT / "services"
ONTOLOGY_DIR = SRC_ROOT / "ontology"

# Migration mapping: source file -> (target layer, target filename)
MIGRATION_MAP: Dict[str, Tuple[str, str]] = {
    # O0 Domain Layer
    "evidence_detector.py": ("o0_domain", "evidence_types.py"),
    "graphrag_selector.py": ("o0_domain", "rag_selector.py"),
    "graphrag_diagnostics.py": ("o0_domain", "rag_diagnostics.py"),
    "medical_rag.py": ("o0_domain", "medical_rag.py"),
    "unified_rag_service.py": ("o0_domain", "unified_rag.py"),

    # O1 Organization Layer
    # (organization_service.py doesn't exist, but tenant_aware_supabase does)
    "tenant_aware_supabase.py": ("o1_organization", "tenant_service.py"),

    # O2 Process Layer
    # (workflow_template_service.py doesn't exist as standalone)

    # O4 Agents Layer
    "agent_service.py": ("o4_agents", "agent_registry.py"),
    "agent_orchestrator.py": ("o4_agents", "orchestration.py"),
    "agent_hierarchy_service.py": ("o4_agents", "hierarchy_service.py"),
    "agent_enrichment_service.py": ("o4_agents", "enrichment_service.py"),
    "agent_instantiation_service.py": ("o4_agents", "instantiation_service.py"),
    "agent_pool_manager.py": ("o4_agents", "pool_manager.py"),
    "unified_agent_loader.py": ("o4_agents", "unified_loader.py"),

    # O5 Execution Layer
    "mission_service.py": ("o5_execution", "mission_manager.py"),
    "mission_repository.py": ("o5_execution", "mission_repository.py"),
    "runner_registry.py": ("o5_execution", "runner_registry.py"),
    "autonomous_controller.py": ("o5_execution", "autonomous_controller.py"),
    "autonomous_enhancements.py": ("o5_execution", "autonomous_enhancements.py"),

    # O6 Analytics Layer
    "session_analytics_service.py": ("o6_analytics", "session_analytics.py"),
    "agent_usage_tracker.py": ("o6_analytics", "usage_tracking.py"),
    "response_quality.py": ("o6_analytics", "quality_metrics.py"),
    "langfuse_monitor.py": ("o6_analytics", "langfuse_monitor.py"),
    "feedback_manager.py": ("o6_analytics", "feedback_manager.py"),

    # O7 Value Layer
    "roi_calculator_service.py": ("o7_value", "roi_analyzer.py"),
    "confidence_calculator.py": ("o7_value", "confidence_calculator.py"),
}

# Files to skip during migration
SKIP_PATTERNS = ["__pycache__", ".pyc", ".DS_Store"]


def log(msg: str, verbose: bool = True):
    """Print log message if verbose."""
    if verbose:
        print(msg)


def migrate_services(dry_run: bool = False, verbose: bool = True) -> List[Tuple[Path, Path]]:
    """Migrate service files to ontology layers."""

    migrated_files: List[Tuple[Path, Path]] = []

    for source_name, (target_layer, target_name) in MIGRATION_MAP.items():
        source_path = SERVICES_DIR / source_name
        target_dir = ONTOLOGY_DIR / target_layer
        target_path = target_dir / target_name

        if not source_path.exists():
            log(f"  SKIP (not found): {source_name}", verbose)
            continue

        if target_path.exists():
            log(f"  SKIP (already exists): {target_path.name}", verbose)
            continue

        log(f"  COPY: {source_name} -> {target_layer}/{target_name}", verbose)

        if not dry_run:
            # Ensure target directory exists
            target_dir.mkdir(parents=True, exist_ok=True)

            # Copy file (not move - preserve original for backward compat)
            shutil.copy2(source_path, target_path)

        migrated_files.append((source_path, target_path))

    return migrated_files


def create_compatibility_imports(
    migrated_files: List[Tuple[Path, Path]],
    dry_run: bool = False,
    verbose: bool = True
):
    """Create backward-compatible imports in services/ pointing to new locations."""

    compat_template = '''"""
DEPRECATED: This module has moved to ontology/{layer}/{filename}
This file provides backward compatibility. Please update your imports.

New import:
    from ontology.{layer}.{module_name} import *
"""

import warnings
warnings.warn(
    "Importing from services.{old_name} is deprecated. "
    "Use ontology.{layer}.{module_name} instead.",
    DeprecationWarning,
    stacklevel=2
)

from ontology.{layer}.{module_name} import *
'''

    for source_path, target_path in migrated_files:
        old_name = source_path.stem
        layer = target_path.parent.name
        module_name = target_path.stem

        compat_content = compat_template.format(
            layer=layer,
            filename=target_path.name,
            module_name=module_name,
            old_name=old_name
        )

        compat_path = source_path.with_suffix(".py.bak")

        log(f"  COMPAT: {source_path.name} -> deprecation wrapper", verbose)

        if not dry_run:
            # Backup original
            shutil.move(source_path, compat_path)
            # Create compatibility import
            source_path.write_text(compat_content)


def update_layer_init_files(dry_run: bool = False, verbose: bool = True):
    """Update __init__.py files in ontology layers to export migrated modules."""

    for layer in ["o0_domain", "o1_organization", "o4_agents", "o5_execution", "o6_analytics", "o7_value"]:
        layer_dir = ONTOLOGY_DIR / layer
        init_file = layer_dir / "__init__.py"

        if not layer_dir.exists():
            continue

        # Get all Python files in the layer
        py_files = [f for f in layer_dir.glob("*.py") if f.name != "__init__.py"]

        if not py_files:
            continue

        exports = []
        for py_file in py_files:
            module_name = py_file.stem
            # Add to exports (simplified - real impl would parse file for exports)
            exports.append(f"# from .{module_name} import *  # TODO: Define specific exports")

        log(f"  UPDATE: {layer}/__init__.py with {len(py_files)} modules", verbose)

        if not dry_run and exports:
            # Read existing init
            existing = init_file.read_text() if init_file.exists() else ""

            # Append new exports if not already present
            new_content = existing
            if "# Migrated services" not in existing:
                new_content += "\n\n# Migrated services (Phase 4)\n"
                new_content += "\n".join(exports)
                new_content += "\n"

            init_file.write_text(new_content)


def main():
    parser = argparse.ArgumentParser(description="Migrate services to ontology layers")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done without making changes")
    parser.add_argument("--verbose", "-v", action="store_true", default=True, help="Verbose output")
    parser.add_argument("--no-compat", action="store_true", help="Skip creating compatibility imports")

    args = parser.parse_args()

    print(f"\n{'='*60}")
    print("Phase 4: Service Migration to Ontology Layers")
    print(f"{'='*60}")
    print(f"Source: {SERVICES_DIR}")
    print(f"Target: {ONTOLOGY_DIR}")
    print(f"Dry run: {args.dry_run}")
    print(f"{'='*60}\n")

    # Step 1: Migrate files
    print("Step 1: Migrating service files...")
    migrated = migrate_services(dry_run=args.dry_run, verbose=args.verbose)
    print(f"  -> Migrated {len(migrated)} files\n")

    # Step 2: Create compatibility imports (optional)
    if not args.no_compat and migrated:
        print("Step 2: Creating backward-compatibility imports...")
        create_compatibility_imports(migrated, dry_run=args.dry_run, verbose=args.verbose)
        print()

    # Step 3: Update layer __init__.py files
    print("Step 3: Updating layer __init__.py files...")
    update_layer_init_files(dry_run=args.dry_run, verbose=args.verbose)
    print()

    print(f"{'='*60}")
    print("Migration complete!" if not args.dry_run else "Dry run complete (no changes made)")
    print(f"{'='*60}\n")

    # Summary
    if migrated:
        print("Migrated files:")
        for src, tgt in migrated:
            print(f"  {src.name} -> {tgt.relative_to(ONTOLOGY_DIR)}")
    else:
        print("No files were migrated.")


if __name__ == "__main__":
    main()
