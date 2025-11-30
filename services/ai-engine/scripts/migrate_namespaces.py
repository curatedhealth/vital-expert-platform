#!/usr/bin/env python3
"""
Pinecone Namespace Migration Script

Migrates vectors from legacy namespaces to the new domain-based namespace structure.

Namespace Convention: {layer}-{category}-{domain}
- ont-* : Ontology Layer (agents, personas, capabilities, skills, responsibilities)
- knowledge-* : Domain Knowledge (regulatory, clinical, medical affairs, etc.)
- ops-* : Operational Layer (workflows, templates)

Usage:
    # Dry run (shows what would be migrated)
    python migrate_namespaces.py --dry-run

    # Migrate ontology namespaces only
    python migrate_namespaces.py --ontology-only

    # Migrate default namespace (knowledge documents)
    python migrate_namespaces.py --knowledge-only

    # Full migration
    python migrate_namespaces.py --execute

    # Test with small batch
    python migrate_namespaces.py --test --batch-size 50
"""

import os
import sys
import argparse
import time
from typing import Dict, List, Any, Optional, Tuple
from collections import defaultdict
from datetime import datetime

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from pinecone import Pinecone
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Import namespace config
from graphrag.namespace_config import (
    LEGACY_NAMESPACE_MAP,
    get_namespace_for_document,
    list_all_namespaces,
)


class NamespaceMigrator:
    """Handles migration of vectors between Pinecone namespaces."""

    def __init__(self, dry_run: bool = True, batch_size: int = 100):
        self.dry_run = dry_run
        self.batch_size = batch_size

        # Initialize Pinecone
        self.pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
        self.index = self.pc.Index(os.environ.get("PINECONE_INDEX_NAME", "vital-knowledge"))

        # Migration stats
        self.stats = {
            "vectors_processed": 0,
            "vectors_migrated": 0,
            "namespaces_created": set(),
            "errors": [],
            "namespace_distribution": defaultdict(int),
        }

    def get_index_stats(self) -> Dict:
        """Get current index statistics."""
        return self.index.describe_index_stats()

    def print_current_state(self):
        """Print current namespace distribution."""
        stats = self.get_index_stats()
        print("\n" + "=" * 60)
        print("CURRENT PINECONE STATE")
        print("=" * 60)
        print(f"Total Vectors: {stats.get('total_vector_count', 0)}")
        print(f"Dimension: {stats.get('dimension', 'unknown')}")
        print("\nNamespaces:")

        namespaces = stats.get('namespaces', {})
        for ns_name, ns_data in sorted(namespaces.items()):
            vector_count = ns_data.get('vector_count', 0) if isinstance(ns_data, dict) else ns_data
            print(f"  {ns_name or '__default__'}: {vector_count} vectors")

    def migrate_ontology_namespace(
        self,
        old_namespace: str,
        new_namespace: str
    ) -> Tuple[int, int]:
        """
        Migrate vectors from old ontology namespace to new ont-* namespace.

        Returns:
            Tuple of (vectors_processed, vectors_migrated)
        """
        print(f"\n{'─' * 50}")
        print(f"Migrating: {old_namespace} → {new_namespace}")
        print(f"{'─' * 50}")

        processed = 0
        migrated = 0

        # Query vectors from old namespace
        dummy_vector = [0.0] * 3072  # text-embedding-3-large dimension

        while True:
            # Fetch batch of vectors
            results = self.index.query(
                namespace=old_namespace,
                vector=dummy_vector,
                top_k=self.batch_size,
                include_metadata=True,
                include_values=True
            )

            if not results.matches:
                break

            vectors_to_upsert = []
            ids_to_delete = []

            for match in results.matches:
                processed += 1

                # Prepare vector for new namespace
                vector = {
                    'id': match.id,
                    'values': match.values,
                    'metadata': match.metadata or {}
                }
                vectors_to_upsert.append(vector)
                ids_to_delete.append(match.id)

            if self.dry_run:
                print(f"  [DRY RUN] Would migrate {len(vectors_to_upsert)} vectors")
                migrated += len(vectors_to_upsert)
                # In dry run, we can't continue since we're not deleting
                break
            else:
                # Upsert to new namespace
                self.index.upsert(vectors=vectors_to_upsert, namespace=new_namespace)
                migrated += len(vectors_to_upsert)

                # Delete from old namespace
                self.index.delete(ids=ids_to_delete, namespace=old_namespace)

                print(f"  Migrated batch: {len(vectors_to_upsert)} vectors")
                time.sleep(0.3)  # Rate limiting

        print(f"  Total: {processed} processed, {migrated} migrated")
        return processed, migrated

    def migrate_default_namespace(self, limit: Optional[int] = None) -> Tuple[int, int]:
        """
        Migrate vectors from default namespace to domain-specific knowledge namespaces.

        Returns:
            Tuple of (vectors_processed, vectors_migrated)
        """
        print(f"\n{'=' * 60}")
        print("MIGRATING DEFAULT NAMESPACE (Knowledge Documents)")
        print(f"{'=' * 60}")

        processed = 0
        migrated = 0
        namespace_batches = defaultdict(list)

        # Query vectors from default namespace
        dummy_vector = [0.0] * 3072
        seen_ids = set()

        while True:
            if limit and processed >= limit:
                break

            # Fetch batch of vectors
            results = self.index.query(
                namespace="",  # Empty string for default
                vector=dummy_vector,
                top_k=min(self.batch_size, (limit - processed) if limit else self.batch_size),
                include_metadata=True,
                include_values=True
            )

            if not results.matches:
                break

            # Check if we're getting the same vectors (no progress)
            new_ids = {m.id for m in results.matches}
            if new_ids.issubset(seen_ids):
                print("  No new vectors found, migration complete.")
                break
            seen_ids.update(new_ids)

            ids_to_delete = []

            for match in results.matches:
                if match.id in seen_ids and not self.dry_run:
                    continue  # Skip already processed

                processed += 1
                metadata = match.metadata or {}

                # Determine target namespace based on metadata
                domain = metadata.get('domain', '')
                tags = metadata.get('tags', '').split(',') if metadata.get('tags') else []

                target_namespace = get_namespace_for_document(
                    domain=domain,
                    tags=tags
                )

                # Track distribution
                self.stats["namespace_distribution"][target_namespace] += 1

                # Prepare vector for target namespace
                vector = {
                    'id': match.id,
                    'values': match.values,
                    'metadata': metadata
                }
                namespace_batches[target_namespace].append(vector)
                ids_to_delete.append(match.id)

            # Process batches for each namespace
            for target_ns, vectors in namespace_batches.items():
                if len(vectors) >= self.batch_size:
                    if self.dry_run:
                        print(f"  [DRY RUN] Would migrate {len(vectors)} vectors to {target_ns}")
                        migrated += len(vectors)
                    else:
                        self.index.upsert(vectors=vectors, namespace=target_ns)
                        migrated += len(vectors)
                        print(f"  Migrated {len(vectors)} vectors to {target_ns}")
                        time.sleep(0.3)
                    namespace_batches[target_ns] = []

            if self.dry_run:
                # In dry run, show distribution and exit after first batch
                print("\n  Namespace Distribution (sample):")
                for ns, count in sorted(self.stats["namespace_distribution"].items()):
                    print(f"    {ns}: {count}")
                break
            else:
                # Delete migrated vectors from default namespace
                if ids_to_delete:
                    self.index.delete(ids=ids_to_delete, namespace="")

        # Process remaining vectors in batches
        for target_ns, vectors in namespace_batches.items():
            if vectors:
                if self.dry_run:
                    print(f"  [DRY RUN] Would migrate {len(vectors)} vectors to {target_ns}")
                    migrated += len(vectors)
                else:
                    self.index.upsert(vectors=vectors, namespace=target_ns)
                    migrated += len(vectors)
                    print(f"  Migrated remaining {len(vectors)} vectors to {target_ns}")

        print(f"\nTotal: {processed} processed, {migrated} migrated")
        return processed, migrated

    def run_migration(
        self,
        ontology_only: bool = False,
        knowledge_only: bool = False,
        test_limit: Optional[int] = None
    ):
        """
        Run the full namespace migration.

        Args:
            ontology_only: Only migrate ontology namespaces
            knowledge_only: Only migrate knowledge (default) namespace
            test_limit: Limit number of vectors for testing
        """
        start_time = datetime.now()

        print("\n" + "=" * 60)
        print("PINECONE NAMESPACE MIGRATION")
        print("=" * 60)
        print(f"Mode: {'DRY RUN' if self.dry_run else 'EXECUTE'}")
        print(f"Batch Size: {self.batch_size}")
        if test_limit:
            print(f"Test Limit: {test_limit}")
        print(f"Started: {start_time.isoformat()}")

        # Show current state
        self.print_current_state()

        # Show target namespaces
        print("\n" + "=" * 60)
        print("TARGET NAMESPACE STRUCTURE")
        print("=" * 60)
        for ns in list_all_namespaces():
            print(f"  {ns['namespace']}: {ns['description'][:50]}...")

        if not knowledge_only:
            # Migrate ontology namespaces
            print("\n" + "=" * 60)
            print("PHASE 1: ONTOLOGY NAMESPACE MIGRATION")
            print("=" * 60)

            ontology_mappings = [
                ("agents", "ont-agents"),
                ("personas", "ont-personas"),
                ("capabilities", "ont-capabilities"),
                ("skills", "ont-skills"),
                ("responsibilities", "ont-responsibilities"),
            ]

            for old_ns, new_ns in ontology_mappings:
                processed, migrated = self.migrate_ontology_namespace(old_ns, new_ns)
                self.stats["vectors_processed"] += processed
                self.stats["vectors_migrated"] += migrated
                if migrated > 0:
                    self.stats["namespaces_created"].add(new_ns)

        if not ontology_only:
            # Migrate default namespace
            print("\n" + "=" * 60)
            print("PHASE 2: KNOWLEDGE NAMESPACE MIGRATION")
            print("=" * 60)

            processed, migrated = self.migrate_default_namespace(limit=test_limit)
            self.stats["vectors_processed"] += processed
            self.stats["vectors_migrated"] += migrated

        # Final summary
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        print("\n" + "=" * 60)
        print("MIGRATION SUMMARY")
        print("=" * 60)
        print(f"Mode: {'DRY RUN' if self.dry_run else 'EXECUTED'}")
        print(f"Duration: {duration:.1f} seconds")
        print(f"Vectors Processed: {self.stats['vectors_processed']}")
        print(f"Vectors Migrated: {self.stats['vectors_migrated']}")
        print(f"Namespaces Created: {len(self.stats['namespaces_created'])}")

        if self.stats["namespace_distribution"]:
            print("\nNamespace Distribution:")
            for ns, count in sorted(self.stats["namespace_distribution"].items(), key=lambda x: -x[1]):
                print(f"  {ns}: {count}")

        if self.stats["errors"]:
            print(f"\nErrors: {len(self.stats['errors'])}")
            for error in self.stats["errors"][:5]:
                print(f"  - {error}")

        if not self.dry_run:
            print("\n" + "=" * 60)
            print("FINAL STATE")
            self.print_current_state()


def main():
    parser = argparse.ArgumentParser(
        description="Migrate Pinecone vectors to domain-based namespaces"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be migrated without making changes"
    )
    parser.add_argument(
        "--execute",
        action="store_true",
        help="Execute the migration (requires explicit flag for safety)"
    )
    parser.add_argument(
        "--ontology-only",
        action="store_true",
        help="Only migrate ontology namespaces (agents, personas, etc.)"
    )
    parser.add_argument(
        "--knowledge-only",
        action="store_true",
        help="Only migrate knowledge (default) namespace"
    )
    parser.add_argument(
        "--test",
        action="store_true",
        help="Test mode with small batch"
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=100,
        help="Batch size for migration (default: 100)"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit number of vectors to migrate (for testing)"
    )

    args = parser.parse_args()

    # Determine mode
    if args.execute:
        dry_run = False
    elif args.dry_run or args.test:
        dry_run = True
    else:
        print("ERROR: Must specify either --dry-run, --execute, or --test")
        print("Use --dry-run first to see what would be migrated.")
        sys.exit(1)

    # Set test limits
    test_limit = args.limit
    if args.test and not test_limit:
        test_limit = 50

    # Run migration
    migrator = NamespaceMigrator(
        dry_run=dry_run,
        batch_size=args.batch_size
    )

    migrator.run_migration(
        ontology_only=args.ontology_only,
        knowledge_only=args.knowledge_only,
        test_limit=test_limit
    )


if __name__ == "__main__":
    main()
