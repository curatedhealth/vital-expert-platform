#!/usr/bin/env python3
"""
Phase 2 & 3 Deployment Verification Script

Quick verification of Long-Term Memory + Self-Continuation deployment.
Run after deploying to verify all components are working.

Usage:
    python verify_deployment.py
"""

import asyncio
import sys
from typing import Dict, Any

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'


async def check_python_dependencies() -> bool:
    """Check if required Python packages are installed."""
    print(f"\n{BLUE}━━━ Checking Python Dependencies ━━━{RESET}")
    
    checks = []
    
    # sentence-transformers
    try:
        from sentence_transformers import SentenceTransformer
        print(f"  {GREEN}✅{RESET} sentence-transformers installed")
        checks.append(True)
    except ImportError:
        print(f"  {RED}❌{RESET} sentence-transformers NOT installed")
        print(f"     Run: pip install sentence-transformers==2.2.2")
        checks.append(False)
    
    # faiss (optional)
    try:
        import faiss
        print(f"  {GREEN}✅{RESET} faiss-cpu installed")
        checks.append(True)
    except ImportError:
        print(f"  {YELLOW}⚠️{RESET}  faiss-cpu not installed (optional)")
        checks.append(True)  # Not critical
    
    # Core services
    try:
        from services.embedding_service import EmbeddingService
        print(f"  {GREEN}✅{RESET} EmbeddingService importable")
        checks.append(True)
    except ImportError as e:
        print(f"  {RED}❌{RESET} EmbeddingService import failed: {e}")
        checks.append(False)
    
    try:
        from services.session_memory_service import SessionMemoryService
        print(f"  {GREEN}✅{RESET} SessionMemoryService importable")
        checks.append(True)
    except ImportError as e:
        print(f"  {RED}❌{RESET} SessionMemoryService import failed: {e}")
        checks.append(False)
    
    try:
        from services.autonomous_controller import AutonomousController
        print(f"  {GREEN}✅{RESET} AutonomousController importable")
        checks.append(True)
    except ImportError as e:
        print(f"  {RED}❌{RESET} AutonomousController import failed: {e}")
        checks.append(False)
    
    return all(checks)


async def check_embedding_service() -> bool:
    """Test EmbeddingService functionality."""
    print(f"\n{BLUE}━━━ Testing EmbeddingService ━━━{RESET}")
    
    try:
        from services.embedding_service import EmbeddingService
        
        service = EmbeddingService()
        print(f"  {GREEN}✅{RESET} Service initialized")
        
        # Test embedding generation
        result = await service.embed_text("Test memory for deployment verification")
        
        if len(result.embedding) == 768:
            print(f"  {GREEN}✅{RESET} Embedding generated: {len(result.embedding)} dimensions")
            print(f"  {GREEN}✅{RESET} Model: {result.model}")
            return True
        else:
            print(f"  {RED}❌{RESET} Wrong embedding dimension: {len(result.embedding)} (expected 768)")
            return False
            
    except Exception as e:
        print(f"  {RED}❌{RESET} EmbeddingService test failed: {e}")
        return False


async def check_database_connection() -> bool:
    """Check database connection and tables."""
    print(f"\n{BLUE}━━━ Checking Database Connection ━━━{RESET}")
    
    try:
        from services.supabase_client import SupabaseClient
        from core.config import get_settings
        
        settings = get_settings()
        
        if not settings.supabase_url or not settings.supabase_key:
            print(f"  {RED}❌{RESET} Supabase credentials not configured")
            print(f"     Set SUPABASE_URL and SUPABASE_KEY in .env")
            return False
        
        client = SupabaseClient()
        print(f"  {GREEN}✅{RESET} Supabase client initialized")
        
        # Test connection by querying a table
        result = client.client.table('session_memories').select('id').limit(1).execute()
        print(f"  {GREEN}✅{RESET} session_memories table accessible")
        
        result = client.client.table('autonomous_control_state').select('session_id').limit(1).execute()
        print(f"  {GREEN}✅{RESET} autonomous_control_state table accessible")
        
        return True
        
    except Exception as e:
        print(f"  {RED}❌{RESET} Database check failed: {e}")
        print(f"     Ensure database migrations have been run")
        return False


async def check_autonomous_controller() -> bool:
    """Test AutonomousController functionality."""
    print(f"\n{BLUE}━━━ Testing AutonomousController ━━━{RESET}")
    
    try:
        from services.autonomous_controller import AutonomousController
        from pydantic import UUID4
        from uuid import uuid4
        
        # Create test controller
        controller = AutonomousController(
            session_id="test_verification",
            tenant_id=UUID4(str(uuid4())),
            goal="Test deployment verification",
            cost_limit_usd=1.0,
            runtime_limit_minutes=5
        )
        
        print(f"  {GREEN}✅{RESET} Controller initialized")
        
        # Test decision logic
        decision = await controller.should_continue(
            current_cost_usd=0.1,
            goal_progress=0.3,
            iteration_count=1
        )
        
        if decision.should_continue:
            print(f"  {GREEN}✅{RESET} Decision logic working (should continue)")
        else:
            print(f"  {YELLOW}⚠️{RESET}  Decision said stop (might be valid)")
        
        print(f"  {GREEN}✅{RESET} Progress: {decision.goal_progress:.0%}")
        print(f"  {GREEN}✅{RESET} Reason: {decision.reason}")
        
        return True
        
    except Exception as e:
        print(f"  {RED}❌{RESET} AutonomousController test failed: {e}")
        return False


async def check_api_endpoints() -> bool:
    """Check if API endpoints are responsive."""
    print(f"\n{BLUE}━━━ Checking API Endpoints ━━━{RESET}")
    
    try:
        import httpx
        
        # Test health endpoint
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                response = await client.get("http://localhost:8000/health")
                if response.status_code == 200:
                    print(f"  {GREEN}✅{RESET} API server running (http://localhost:8000)")
                else:
                    print(f"  {YELLOW}⚠️{RESET}  API server returned {response.status_code}")
            except httpx.ConnectError:
                print(f"  {YELLOW}⚠️{RESET}  API server not running on localhost:8000")
                print(f"     Start with: uvicorn src.main:app --reload")
                return False
        
        return True
        
    except ImportError:
        print(f"  {YELLOW}⚠️{RESET}  httpx not installed (skipping API check)")
        return True  # Not critical for deployment verification


def print_summary(results: Dict[str, bool]):
    """Print deployment verification summary."""
    print(f"\n{BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{RESET}")
    print(f"{BLUE}  DEPLOYMENT VERIFICATION SUMMARY{RESET}")
    print(f"{BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{RESET}")
    
    for check, passed in results.items():
        status = f"{GREEN}✅ PASS{RESET}" if passed else f"{RED}❌ FAIL{RESET}"
        print(f"  {check:<30} {status}")
    
    print(f"{BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{RESET}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print(f"\n  {GREEN}🎉 ALL CHECKS PASSED - DEPLOYMENT SUCCESSFUL!{RESET}")
        print(f"\n  Phase 2 (Long-Term Memory) + Phase 3 (Self-Continuation)")
        print(f"  are ready to use!")
        print(f"\n  Next steps:")
        print(f"    1. Run database migrations (if not done)")
        print(f"    2. Start API server: uvicorn src.main:app --reload")
        print(f"    3. Test with real queries")
        print(f"    4. Monitor autonomous executions")
    else:
        print(f"\n  {RED}❌ SOME CHECKS FAILED{RESET}")
        print(f"\n  Review the failures above and:")
        print(f"    1. Install missing dependencies")
        print(f"    2. Run database migrations")
        print(f"    3. Check configuration (.env)")
        print(f"    4. Review DEPLOYMENT_GUIDE_PHASE2_3.md")
    
    print()
    
    return all_passed


async def main():
    """Run all verification checks."""
    print(f"\n{GREEN}{'='*60}{RESET}")
    print(f"{GREEN}  Phase 2 & 3 Deployment Verification{RESET}")
    print(f"{GREEN}  Long-Term Memory + Self-Continuation{RESET}")
    print(f"{GREEN}{'='*60}{RESET}")
    
    results = {}
    
    # Run checks
    results["Python Dependencies"] = await check_python_dependencies()
    results["EmbeddingService"] = await check_embedding_service()
    results["Database Connection"] = await check_database_connection()
    results["AutonomousController"] = await check_autonomous_controller()
    results["API Endpoints"] = await check_api_endpoints()
    
    # Print summary
    all_passed = print_summary(results)
    
    # Exit with appropriate code
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    asyncio.run(main())

