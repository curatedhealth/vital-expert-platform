#!/usr/bin/env python3
"""
Registry 250 - Progress Tracker
Track which batches have been loaded
"""

print("="*80)
print("📊 REGISTRY 250 - LOADING PROGRESS TRACKER")
print("="*80)

batches = {
    1: {"agents": "1-25", "status": "✅ LOADED", "verified": True},
    2: {"agents": "26-50", "status": "✅ LOADED", "verified": True},
    3: {"agents": "51-75", "status": "✅ LOADED", "verified": True},
    4: {"agents": "76-100", "status": "⏳ READY - Execute Next", "file": "exec_batch_04.sql"},
    5: {"agents": "101-125", "status": "⏳ READY", "file": "exec_batch_05.sql"},
    6: {"agents": "126-150", "status": "⏳ READY", "file": "exec_batch_06.sql"},
    7: {"agents": "151-175", "status": "⏳ READY", "file": "exec_batch_07.sql"},
    8: {"agents": "176-200", "status": "⏳ READY", "file": "exec_batch_08.sql"},
    9: {"agents": "201-225", "status": "⏳ READY", "file": "exec_batch_09.sql"},
    10: {"agents": "226-250", "status": "⏳ READY", "file": "exec_batch_10.sql"},
}

print("\n📋 BATCH STATUS:")
print("-"*80)

loaded = 0
pending = 0

for batch_num, info in batches.items():
    status = info["status"]
    agents = info["agents"]
    
    if "✅" in status:
        loaded += 1
        print(f"   Batch {batch_num:2d}: Agents {agents:>8}  {status}")
    else:
        pending += 1
        file = info.get("file", "")
        print(f"   Batch {batch_num:2d}: Agents {agents:>8}  {status:<30} → scripts/{file}")

print("\n" + "="*80)
print(f"📊 PROGRESS:")
print("="*80)
print(f"   ✅ Loaded:    {loaded}/10 batches ({loaded * 25} agents) - {loaded * 10}%")
print(f"   ⏳ Remaining: {pending}/10 batches ({pending * 25} agents) - {pending * 10}%")
print("="*80)

if pending > 0:
    print(f"\n🎯 NEXT STEP: Execute scripts/exec_batch_{loaded + 1:02d}.sql")
    print(f"   This will load agents {(loaded) * 25 + 1}-{(loaded + 1) * 25}")
else:
    print("\n🎉 ALL BATCHES LOADED! Verify with:")
    print("   SELECT COUNT(*) FROM agents WHERE metadata->>'source' = 'vital_agents_registry_250';")

print("="*80)

