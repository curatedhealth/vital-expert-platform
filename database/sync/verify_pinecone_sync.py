#!/usr/bin/env python3
"""
Pinecone Sync Verification Script

Verifies that Supabase agent data is properly synchronized with Pinecone.

Usage:
    cd services/ai-engine
    python ../../database/sync/verify_pinecone_sync.py
"""

import os
import sys
from datetime import datetime
from pathlib import Path

# Load environment variables
from dotenv import load_dotenv

# Load from services/ai-engine/.env
env_path = Path(__file__).parent.parent.parent / 'services' / 'ai-engine' / '.env'
if env_path.exists():
    load_dotenv(env_path)
    print(f"Loaded: {env_path}")
else:
    load_dotenv()


def print_header(title: str):
    print(f"\n{'='*70}")
    print(f" {title}")
    print(f"{'='*70}")


def print_result(label: str, value: str, status: str = "info"):
    icons = {"pass": "✅", "fail": "❌", "warn": "⚠️", "info": "📊"}
    print(f"   {icons.get(status, '•')} {label}: {value}")


def main():
    print("\n" + "=" * 70)
    print(" PINECONE SYNC VERIFICATION")
    print(" " + datetime.now().isoformat())
    print("=" * 70)

    # ==========================================================================
    # 1. SUPABASE - Get Agent Counts
    # ==========================================================================
    print_header("1. SUPABASE AGENT DATA")

    supabase_total = 0
    supabase_active = 0
    supabase_by_tenant = {}

    try:
        from supabase import create_client

        url = os.getenv('SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEW_SUPABASE_SERVICE_KEY')

        if not url or not key:
            print_result("Connection", "Missing credentials", "fail")
        else:
            client = create_client(url, key)

            # Total agents
            total_result = client.table('agents').select('id', count='exact').execute()
            supabase_total = total_result.count or 0
            print_result("Total agents", str(supabase_total), "pass" if supabase_total > 0 else "warn")

            # Active agents (status='active')
            active_result = client.table('agents').select('id', count='exact').eq('status', 'active').execute()
            supabase_active = active_result.count or 0
            print_result("Active agents", str(supabase_active), "pass" if supabase_active > 0 else "warn")

            # Get tenant breakdown
            agents_data = client.table('agents').select('tenant_id').execute()
            for agent in agents_data.data:
                tid = str(agent.get('tenant_id', 'null'))
                supabase_by_tenant[tid] = supabase_by_tenant.get(tid, 0) + 1

            print("\n   Agents by tenant:")
            for tid, count in sorted(supabase_by_tenant.items(), key=lambda x: -x[1])[:5]:
                print(f"      - {tid[:36]}: {count}")

    except Exception as e:
        print_result("Connection", f"ERROR: {str(e)[:80]}", "fail")

    # ==========================================================================
    # 2. PINECONE - Get Vector Counts
    # ==========================================================================
    print_header("2. PINECONE VECTOR DATA")

    pinecone_total = 0
    pinecone_agents_ns = 0
    pinecone_ont_agents_ns = 0
    pinecone_namespaces = {}

    try:
        from pinecone import Pinecone

        api_key = os.getenv('PINECONE_API_KEY')
        index_name = os.getenv('PINECONE_INDEX_NAME', 'vital-knowledge')

        if not api_key:
            print_result("Connection", "Missing PINECONE_API_KEY", "fail")
        else:
            pc = Pinecone(api_key=api_key)

            # List indexes
            indexes = pc.list_indexes()
            index_names = [idx.name for idx in indexes]
            print_result("Available indexes", ", ".join(index_names), "info")

            if index_name not in index_names:
                print_result("Target index", f"'{index_name}' NOT FOUND", "fail")
            else:
                index = pc.Index(index_name)
                stats = index.describe_index_stats()

                pinecone_total = stats.total_vector_count
                pinecone_namespaces = stats.namespaces or {}

                print_result("Connection", "SUCCESS", "pass")
                print_result("Total vectors", str(pinecone_total), "pass" if pinecone_total > 0 else "warn")
                print_result("Dimensions", str(stats.dimension), "info")

                # Get specific namespace counts
                pinecone_agents_ns = pinecone_namespaces.get('agents', {})
                if hasattr(pinecone_agents_ns, 'vector_count'):
                    pinecone_agents_ns = pinecone_agents_ns.vector_count
                else:
                    pinecone_agents_ns = 0

                pinecone_ont_agents_ns = pinecone_namespaces.get('ont-agents', {})
                if hasattr(pinecone_ont_agents_ns, 'vector_count'):
                    pinecone_ont_agents_ns = pinecone_ont_agents_ns.vector_count
                else:
                    pinecone_ont_agents_ns = 0

                print(f"\n   Key namespaces for agents:")
                print(f"      - 'agents' namespace: {pinecone_agents_ns} vectors")
                print(f"      - 'ont-agents' namespace: {pinecone_ont_agents_ns} vectors")

                # Show all namespaces
                print(f"\n   All namespaces ({len(pinecone_namespaces)} total):")
                sorted_ns = sorted(
                    [(k, v.vector_count if hasattr(v, 'vector_count') else 0)
                     for k, v in pinecone_namespaces.items()],
                    key=lambda x: -x[1]
                )
                for ns_name, ns_count in sorted_ns[:10]:
                    print(f"      - {ns_name}: {ns_count} vectors")

    except Exception as e:
        print_result("Connection", f"ERROR: {str(e)[:80]}", "fail")

    # ==========================================================================
    # 3. SYNC VERIFICATION
    # ==========================================================================
    print_header("3. SYNC STATUS ANALYSIS")

    # The sync script uses 'agents' namespace
    agent_vectors = pinecone_agents_ns

    print(f"\n   Supabase agents: {supabase_total}")
    print(f"   Pinecone 'agents' namespace: {agent_vectors}")

    if supabase_total > 0 and agent_vectors > 0:
        sync_pct = round((agent_vectors / supabase_total) * 100, 1)
        print(f"   Sync percentage: {sync_pct}%")

        if sync_pct >= 95:
            print_result("Sync Status", "SYNCED (95%+)", "pass")
        elif sync_pct >= 80:
            print_result("Sync Status", f"PARTIAL ({sync_pct}%) - Minor gaps", "warn")
        elif sync_pct >= 50:
            print_result("Sync Status", f"PARTIAL ({sync_pct}%) - Needs re-sync", "warn")
        else:
            print_result("Sync Status", f"NOT SYNCED ({sync_pct}%) - Run sync script", "fail")

        # Check for over-sync (duplicates?)
        if agent_vectors > supabase_total:
            excess = agent_vectors - supabase_total
            print_result("Warning", f"{excess} extra vectors in Pinecone (possible stale data)", "warn")
    elif supabase_total > 0 and agent_vectors == 0:
        print_result("Sync Status", "NOT SYNCED - No vectors in 'agents' namespace", "fail")
    elif supabase_total == 0:
        print_result("Sync Status", "No agents in Supabase to sync", "warn")

    # ==========================================================================
    # 4. SAMPLE VERIFICATION (Check a few random agents exist in Pinecone)
    # ==========================================================================
    print_header("4. SAMPLE VERIFICATION")

    try:
        from supabase import create_client
        from pinecone import Pinecone

        url = os.getenv('SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEW_SUPABASE_SERVICE_KEY')
        client = create_client(url, key)

        pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
        index = pc.Index(os.getenv('PINECONE_INDEX_NAME', 'vital-knowledge'))

        # Get 5 random agent IDs from Supabase
        sample = client.table('agents').select('id, name').limit(5).execute()

        if sample.data:
            print("\n   Checking sample agents in Pinecone:")
            found = 0
            for agent in sample.data:
                # Check if this ID exists in Pinecone
                try:
                    # Try to fetch by ID
                    result = index.fetch(ids=[str(agent['id'])], namespace='agents')
                    if result.vectors and str(agent['id']) in result.vectors:
                        print(f"      ✅ {agent['name'][:40]} - Found in Pinecone")
                        found += 1
                    else:
                        print(f"      ❌ {agent['name'][:40]} - NOT in Pinecone")
                except Exception as e:
                    print(f"      ⚠️ {agent['name'][:40]} - Check error: {str(e)[:30]}")

            print(f"\n   Sample verification: {found}/{len(sample.data)} agents found")

    except Exception as e:
        print(f"   Sample verification error: {str(e)[:60]}")

    # ==========================================================================
    # 5. RECOMMENDATIONS
    # ==========================================================================
    print_header("5. RECOMMENDATIONS")

    if agent_vectors == 0:
        print("   🔧 Run: python database/sync/sync_agents_to_pinecone_neo4j.py")
        print("   This will sync all agents from Supabase to Pinecone 'agents' namespace")
    elif supabase_total > 0 and (agent_vectors / supabase_total) < 0.9:
        print("   🔧 Run: python database/sync/sync_agents_to_pinecone_neo4j.py")
        print("   This will refresh the Pinecone vectors with latest Supabase data")
    else:
        print("   ✅ Sync appears healthy!")
        print("   Run sync periodically to keep data fresh")

    print("\n")


if __name__ == "__main__":
    main()
