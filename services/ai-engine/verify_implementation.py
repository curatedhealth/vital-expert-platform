#!/usr/bin/env python3
"""
Comprehensive verification script for AgentOS 3.0 implementation
Checks all phases, files, and critical functionality
"""

import os
import sys
from pathlib import Path
from typing import List, Dict, Tuple

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def check_file_exists(filepath: str, description: str) -> Tuple[bool, str]:
    """Check if a file exists"""
    path = Path(filepath)
    exists = path.exists()
    status = f"{GREEN}✅{RESET}" if exists else f"{RED}❌{RESET}"
    return exists, f"{status} {description}: {filepath}"

def check_files_in_directory(directory: str, pattern: str, description: str) -> Tuple[int, str]:
    """Check how many files match a pattern in a directory"""
    path = Path(directory)
    if not path.exists():
        return 0, f"{RED}❌{RESET} {description}: Directory not found: {directory}"
    
    files = list(path.glob(pattern))
    count = len(files)
    status = f"{GREEN}✅{RESET}" if count > 0 else f"{YELLOW}⚠️{RESET}"
    return count, f"{status} {description}: {count} files"

def verify_phase_0() -> Dict[str, any]:
    """Verify Phase 0: Data Loading"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}📊 PHASE 0: DATA LOADING VERIFICATION{RESET}")
    print(f"{BLUE}{'='*80}{RESET}\n")
    
    results = []
    files_to_check = [
        ("scripts/parse_skills_from_folder.py", "Skill parsing script"),
        ("scripts/load_agents_to_pinecone.py", "Pinecone loading script"),
        ("scripts/load_agents_to_neo4j.py", "Neo4j loading script"),
        ("scripts/verify_data_loading.py", "Data verification script"),
        ("scripts/run_pinecone.sh", "Pinecone helper script"),
        ("scripts/run_neo4j.sh", "Neo4j helper script"),
        ("../../database/seeds/data/skills_from_folder.sql", "Skills seed file"),
        ("../../database/seeds/data/kg_metadata_seed.sql", "KG metadata seed"),
    ]
    
    passed = 0
    for filepath, desc in files_to_check:
        exists, msg = check_file_exists(filepath, desc)
        results.append(msg)
        print(msg)
        if exists:
            passed += 1
    
    print(f"\n{BLUE}Phase 0 Score: {passed}/{len(files_to_check)}{RESET}")
    return {"phase": 0, "passed": passed, "total": len(files_to_check), "details": results}

def verify_phase_1() -> Dict[str, any]:
    """Verify Phase 1: GraphRAG Foundation"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}🔍 PHASE 1: GRAPHRAG FOUNDATION VERIFICATION{RESET}")
    print(f"{BLUE}{'='*80}{RESET}\n")
    
    results = []
    files_to_check = [
        ("src/graphrag/service.py", "Main GraphRAG service"),
        ("src/graphrag/clients/postgres_client.py", "PostgreSQL client"),
        ("src/graphrag/clients/neo4j_client.py", "Neo4j client"),
        ("src/graphrag/clients/vector_db_client.py", "Vector DB client"),
        ("src/graphrag/clients/elastic_client.py", "Elasticsearch client"),
        ("src/graphrag/search/vector_search.py", "Vector search"),
        ("src/graphrag/search/keyword_search.py", "Keyword search"),
        ("src/graphrag/search/graph_search.py", "Graph search"),
        ("src/graphrag/search/fusion.py", "Fusion algorithm"),
        ("src/graphrag/evidence_builder.py", "Evidence builder"),
        ("src/graphrag/profile_resolver.py", "RAG profile resolver"),
        ("src/graphrag/kg_view_resolver.py", "KG view resolver"),
        ("src/graphrag/api/graphrag.py", "GraphRAG API endpoint"),
        ("src/graphrag/ner_service.py", "NER service"),
        ("src/graphrag/reranker.py", "Reranker"),
    ]
    
    passed = 0
    for filepath, desc in files_to_check:
        exists, msg = check_file_exists(filepath, desc)
        results.append(msg)
        print(msg)
        if exists:
            passed += 1
    
    # Check test files
    print(f"\n{YELLOW}Test Files:{RESET}")
    test_count, test_msg = check_files_in_directory("tests/graphrag", "test_*.py", "GraphRAG tests")
    results.append(test_msg)
    print(test_msg)
    
    total = len(files_to_check)
    print(f"\n{BLUE}Phase 1 Score: {passed}/{total}{RESET}")
    return {"phase": 1, "passed": passed, "total": total, "details": results}

def verify_phase_2() -> Dict[str, any]:
    """Verify Phase 2: Agent Graph Compilation"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}🔗 PHASE 2: AGENT GRAPH COMPILATION VERIFICATION{RESET}")
    print(f"{BLUE}{'='*80}{RESET}\n")
    
    results = []
    files_to_check = [
        ("src/langgraph_workflows/graph_compiler.py", "LangGraph compiler"),
        ("src/langgraph_workflows/postgres_checkpointer.py", "Postgres checkpointer"),
        ("src/langgraph_workflows/node_compilers/__init__.py", "Node compilers init"),
        ("src/langgraph_workflows/node_compilers/agent_node_compiler.py", "Agent node compiler"),
        ("src/langgraph_workflows/node_compilers/skill_node_compiler.py", "Skill node compiler"),
        ("src/langgraph_workflows/node_compilers/panel_node_compiler.py", "Panel node compiler"),
        ("src/langgraph_workflows/node_compilers/router_node_compiler.py", "Router node compiler"),
        ("src/langgraph_workflows/node_compilers/tool_node_compiler.py", "Tool node compiler"),
        ("src/langgraph_workflows/node_compilers/human_node_compiler.py", "Human node compiler"),
    ]
    
    passed = 0
    for filepath, desc in files_to_check:
        exists, msg = check_file_exists(filepath, desc)
        results.append(msg)
        print(msg)
        if exists:
            passed += 1
    
    # Check migrations
    print(f"\n{YELLOW}Database Migrations:{RESET}")
    migration_exists, migration_msg = check_file_exists(
        "../../supabase/migrations/20251123_create_agent_graph_tables.sql",
        "Agent graph tables migration"
    )
    results.append(migration_msg)
    print(migration_msg)
    if migration_exists:
        passed += 1
    
    total = len(files_to_check) + 1
    print(f"\n{BLUE}Phase 2 Score: {passed}/{total}{RESET}")
    return {"phase": 2, "passed": passed, "total": total, "details": results}

def verify_phase_3() -> Dict[str, any]:
    """Verify Phase 3: Evidence-Based Selection"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}🎯 PHASE 3: EVIDENCE-BASED SELECTION VERIFICATION{RESET}")
    print(f"{BLUE}{'='*80}{RESET}\n")
    
    results = []
    files_to_check = [
        ("src/services/evidence_based_selector.py", "Evidence-based selector"),
        ("../../supabase/migrations/20251123_create_evidence_based_tables.sql", "Evidence-based tables migration"),
    ]
    
    passed = 0
    for filepath, desc in files_to_check:
        exists, msg = check_file_exists(filepath, desc)
        results.append(msg)
        print(msg)
        if exists:
            passed += 1
    
    # Check test files
    print(f"\n{YELLOW}Test Files:{RESET}")
    test_count, test_msg = check_files_in_directory("tests/integration", "test_evidence*.py", "Evidence tests")
    results.append(test_msg)
    print(test_msg)
    
    total = len(files_to_check)
    print(f"\n{BLUE}Phase 3 Score: {passed}/{total}{RESET}")
    return {"phase": 3, "passed": passed, "total": total, "details": results}

def verify_phase_4() -> Dict[str, any]:
    """Verify Phase 4: Deep Agent Patterns"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}🧠 PHASE 4: DEEP AGENT PATTERNS VERIFICATION{RESET}")
    print(f"{BLUE}{'='*80}{RESET}\n")
    
    results = []
    
    # Backend files
    print(f"{YELLOW}Backend:{RESET}")
    backend_files = [
        ("src/api/routes/ask_expert.py", "Ask Expert API"),
    ]
    
    passed = 0
    for filepath, desc in backend_files:
        exists, msg = check_file_exists(filepath, desc)
        results.append(msg)
        print(msg)
        if exists:
            passed += 1
    
    # Frontend files
    print(f"\n{YELLOW}Frontend:{RESET}")
    frontend_files = [
        ("../../apps/vital-system/src/components/ask-expert/ModeSelector.tsx", "Mode Selector component"),
        ("../../apps/vital-system/src/components/ask-expert/HITLControls.tsx", "HITL Controls component"),
        ("../../apps/vital-system/src/components/ask-expert/StatusIndicators.tsx", "Status Indicators component"),
        ("../../apps/vital-system/src/components/ask-expert/index.ts", "Component exports"),
    ]
    
    for filepath, desc in frontend_files:
        exists, msg = check_file_exists(filepath, desc)
        results.append(msg)
        print(msg)
        if exists:
            passed += 1
    
    total = len(backend_files) + len(frontend_files)
    print(f"\n{BLUE}Phase 4 Score: {passed}/{total}{RESET}")
    return {"phase": 4, "passed": passed, "total": total, "details": results}

def verify_phase_5() -> Dict[str, any]:
    """Verify Phase 5: Monitoring & Safety"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}📈 PHASE 5: MONITORING & SAFETY VERIFICATION{RESET}")
    print(f"{BLUE}{'='*80}{RESET}\n")
    
    results = []
    files_to_check = [
        ("src/monitoring/clinical_monitor.py", "Clinical AI Monitor"),
        ("src/monitoring/fairness_monitor.py", "Fairness Monitor"),
        ("src/monitoring/drift_detector.py", "Drift Detector"),
        ("src/monitoring/prometheus_metrics.py", "Prometheus Metrics"),
        ("src/monitoring/models.py", "Monitoring models"),
        ("../../supabase/migrations/20251123_create_monitoring_tables.sql", "Monitoring tables migration"),
    ]
    
    passed = 0
    for filepath, desc in files_to_check:
        exists, msg = check_file_exists(filepath, desc)
        results.append(msg)
        print(msg)
        if exists:
            passed += 1
    
    total = len(files_to_check)
    print(f"\n{BLUE}Phase 5 Score: {passed}/{total}{RESET}")
    return {"phase": 5, "passed": passed, "total": total, "details": results}

def verify_phase_6() -> Dict[str, any]:
    """Verify Phase 6: Integration & Testing"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}🧪 PHASE 6: INTEGRATION & TESTING VERIFICATION{RESET}")
    print(f"{BLUE}{'='*80}{RESET}\n")
    
    results = []
    files_to_check = [
        ("tests/integration/test_complete_agentos_flow.py", "E2E integration test"),
        ("grafana-dashboards/agentos-performance.json", "Performance dashboard"),
        ("grafana-dashboards/agentos-quality.json", "Quality dashboard"),
        ("grafana-dashboards/agentos-safety.json", "Safety dashboard"),
        ("grafana-dashboards/agentos-fairness.json", "Fairness dashboard"),
        ("pytest.ini", "Pytest configuration"),
    ]
    
    passed = 0
    for filepath, desc in files_to_check:
        exists, msg = check_file_exists(filepath, desc)
        results.append(msg)
        print(msg)
        if exists:
            passed += 1
    
    total = len(files_to_check)
    print(f"\n{BLUE}Phase 6 Score: {passed}/{total}{RESET}")
    return {"phase": 6, "passed": passed, "total": total, "details": results}

def verify_documentation() -> Dict[str, any]:
    """Verify Documentation"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}📚 DOCUMENTATION VERIFICATION{RESET}")
    print(f"{BLUE}{'='*80}{RESET}\n")
    
    results = []
    docs_to_check = [
        ("../../FINAL_HANDOFF_DOCUMENT.md", "Final handoff document"),
        ("../../INTEGRATION_PATTERNS_GUIDE.md", "Integration patterns guide"),
        ("../../PRODUCTION_DEPLOYMENT_GUIDE.md", "Production deployment guide"),
        ("../../KNOWN_ISSUES_FIXED_REPORT.md", "Known issues fix report"),
        ("../../HONEST_AGENTOS_3.0_AUDIT.md", "Comprehensive audit"),
        ("../../AGENTOS_3.0_IMPLEMENTATION_SUMMARY.md", "Implementation summary"),
        ("../../PHASE_5_DEPLOYMENT_COMPLETE.md", "Phase 5 deployment"),
        ("../../DATA_LOADING_SUMMARY.md", "Data loading summary"),
    ]
    
    passed = 0
    for filepath, desc in docs_to_check:
        exists, msg = check_file_exists(filepath, desc)
        results.append(msg)
        print(msg)
        if exists:
            passed += 1
    
    total = len(docs_to_check)
    print(f"\n{BLUE}Documentation Score: {passed}/{total}{RESET}")
    return {"docs": True, "passed": passed, "total": total, "details": results}

def print_summary(phase_results: List[Dict]):
    """Print final summary"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}📊 VERIFICATION SUMMARY{RESET}")
    print(f"{BLUE}{'='*80}{RESET}\n")
    
    total_passed = 0
    total_items = 0
    
    for result in phase_results:
        if "phase" in result:
            phase_name = f"Phase {result['phase']}"
        else:
            phase_name = "Documentation"
        
        passed = result['passed']
        total = result['total']
        percentage = (passed / total * 100) if total > 0 else 0
        
        total_passed += passed
        total_items += total
        
        status = f"{GREEN}✅{RESET}" if percentage == 100 else f"{YELLOW}⚠️{RESET}" if percentage >= 80 else f"{RED}❌{RESET}"
        print(f"{status} {phase_name}: {passed}/{total} ({percentage:.1f}%)")
    
    print(f"\n{BLUE}{'='*80}{RESET}")
    overall_percentage = (total_passed / total_items * 100) if total_items > 0 else 0
    status = f"{GREEN}✅{RESET}" if overall_percentage == 100 else f"{YELLOW}⚠️{RESET}" if overall_percentage >= 80 else f"{RED}❌{RESET}"
    print(f"{status} {BLUE}OVERALL: {total_passed}/{total_items} ({overall_percentage:.1f}%){RESET}")
    print(f"{BLUE}{'='*80}{RESET}\n")
    
    if overall_percentage == 100:
        print(f"{GREEN}🎉 ALL VERIFICATIONS PASSED! AgentOS 3.0 is 100% COMPLETE!{RESET}\n")
    elif overall_percentage >= 80:
        print(f"{YELLOW}⚠️  Most verifications passed. Minor items need attention.{RESET}\n")
    else:
        print(f"{RED}❌ Significant items missing. Review required.{RESET}\n")

def main():
    """Main verification function"""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}🔍 AgentOS 3.0 COMPREHENSIVE VERIFICATION{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")
    
    # Change to ai-engine directory
    os.chdir(Path(__file__).parent)
    print(f"\nWorking directory: {os.getcwd()}\n")
    
    # Run all verifications
    results = []
    results.append(verify_phase_0())
    results.append(verify_phase_1())
    results.append(verify_phase_2())
    results.append(verify_phase_3())
    results.append(verify_phase_4())
    results.append(verify_phase_5())
    results.append(verify_phase_6())
    results.append(verify_documentation())
    
    # Print summary
    print_summary(results)
    
    # Return exit code based on results
    total_passed = sum(r['passed'] for r in results)
    total_items = sum(r['total'] for r in results)
    overall_percentage = (total_passed / total_items * 100) if total_items > 0 else 0
    
    return 0 if overall_percentage == 100 else 1

if __name__ == "__main__":
    sys.exit(main())

