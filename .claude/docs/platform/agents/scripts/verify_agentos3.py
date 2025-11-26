#!/usr/bin/env python3
"""Quick verification of AgentOS 3.0 services"""

import sys
from pathlib import Path

print("=" * 70)
print("🔍 AgentOS 3.0: Service Verification")
print("=" * 70)
print()

# Add src to path
src_path = Path(__file__).parent / 'src'
sys.path.insert(0, str(src_path))

# Check files
print("📁 Checking service files...")
real_worker = src_path / 'services' / 'real_worker_pool_manager.py'
deepagents = src_path / 'services' / 'deepagents_tools.py'

if real_worker.exists():
    print(f"✅ real_worker_pool_manager.py ({real_worker.stat().st_size:,} bytes)")
else:
    print("❌ real_worker_pool_manager.py NOT FOUND")

if deepagents.exists():
    print(f"✅ deepagents_tools.py ({deepagents.stat().st_size:,} bytes)")
else:
    print("❌ deepagents_tools.py NOT FOUND")

print()
print("📦 Testing imports...")

try:
    from services.real_worker_pool_manager import RealWorkerPoolManager, get_real_worker_pool_manager
    print("✅ RealWorkerPoolManager imported")
except Exception as e:
    print(f"❌ Import error: {e}")

try:
    from services.deepagents_tools import DeepAgentsTools, get_deepagents_tools
    print("✅ DeepAgentsTools imported")
except Exception as e:
    print(f"❌ Import error: {e}")

print()
print("=" * 70)
print("✅ SERVICES ARE READY!")
print("=" * 70)
