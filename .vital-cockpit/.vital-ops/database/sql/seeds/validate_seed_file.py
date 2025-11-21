#!/usr/bin/env python3
"""
Pre-Validation Script for Digital Health Workflow Seed Files

This script validates seed files BEFORE SQL execution to catch common errors:
- Invalid foundation codes (agents, tools, RAG sources, personas)
- Duplicate mappings (task-tool, task-RAG)
- Invalid CHECK constraint values (retry_strategy, assignment_type, responsibility, review_timing)
- Missing tenant_id in INSERT statements
- Mismatched ON CONFLICT clauses

Usage:
    python validate_seed_file.py 2025/06_cd_001_endpoint_selection_part2.sql
    python validate_seed_file.py 2025/*.sql  # Validate all seed files

Exit codes:
    0 - All validations passed
    1 - Validation errors found
"""

import re
import sys
from pathlib import Path
from collections import Counter
from typing import List, Set, Tuple, Dict
import argparse


class Color:
    """ANSI color codes for terminal output"""
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    RESET = '\033[0m'


class SeedValidator:
    """Validates digital health workflow seed files"""
    
    def __init__(self, seeds_dir: Path):
        self.seeds_dir = seeds_dir
        self.errors: List[str] = []
        self.warnings: List[str] = []
        
        # Valid CHECK constraint values
        self.valid_retry_strategies = {'EXPONENTIAL_BACKOFF', 'LINEAR', 'IMMEDIATE', 'NONE'}
        self.valid_assignment_types = {'PRIMARY_EXECUTOR', 'VALIDATOR', 'FALLBACK', 'REVIEWER', 'CO_EXECUTOR'}
        self.valid_responsibilities = {'APPROVE', 'REVIEW', 'PROVIDE_INPUT', 'INFORM', 'VALIDATE', 'CONSULT'}
        self.valid_review_timings = {'BEFORE_AGENT_RUNS', 'AFTER_AGENT_RUNS', 'PARALLEL', 'ON_AGENT_ERROR'}
        self.valid_approval_stages = {'BEFORE_EXECUTION', 'AFTER_EXECUTION', 'ON_ERROR'}
        self.valid_on_failure = {'ESCALATE_TO_HUMAN', 'RETRY', 'FALLBACK_AGENT', 'FAIL', 'SKIP'}
        
        # Foundation codes (loaded from foundation files)
        self.foundation_agents: Set[str] = set()
        self.foundation_personas: Set[str] = set()
        self.foundation_tools: Set[str] = set()
        self.foundation_rags: Set[str] = set()
    
    def load_foundation_codes(self):
        """Load all foundation codes from foundation seed files"""
        print(f"{Color.CYAN}📚 Loading foundation codes...{Color.RESET}")
        
        # Load agents
        agent_file = self.seeds_dir / '00_foundation_agents.sql'
        if agent_file.exists():
            self.foundation_agents = self._extract_codes(agent_file, r"^\s+'(AGT-[^']+)'")
            print(f"  ✅ Loaded {len(self.foundation_agents)} agent codes")
        else:
            self.warnings.append(f"⚠️  Agent foundation file not found: {agent_file}")
        
        # Load personas
        persona_file = self.seeds_dir / '01_foundation_personas.sql'
        if persona_file.exists():
            self.foundation_personas = self._extract_codes(persona_file, r"^\s+'(P\d+_[^']+)'")
            print(f"  ✅ Loaded {len(self.foundation_personas)} persona codes")
        else:
            self.warnings.append(f"⚠️  Persona foundation file not found: {persona_file}")
        
        # Load tools
        tool_file = self.seeds_dir / '02_foundation_tools.sql'
        if tool_file.exists():
            self.foundation_tools = self._extract_codes(tool_file, r"^\s+'(TOOL-[^']+)'")
            print(f"  ✅ Loaded {len(self.foundation_tools)} tool codes")
        else:
            self.warnings.append(f"⚠️  Tool foundation file not found: {tool_file}")
        
        # Load RAG sources
        rag_file = self.seeds_dir / '03_foundation_rag_sources.sql'
        if rag_file.exists():
            self.foundation_rags = self._extract_codes(rag_file, r"^\s+'(RAG-[^']+)'")
            print(f"  ✅ Loaded {len(self.foundation_rags)} RAG source codes")
        else:
            self.warnings.append(f"⚠️  RAG foundation file not found: {rag_file}")
    
    def _extract_codes(self, file_path: Path, pattern: str) -> Set[str]:
        """Extract codes from a file using regex pattern"""
        codes = set()
        with open(file_path, 'r') as f:
            content = f.read()
            matches = re.findall(pattern, content, re.MULTILINE)
            codes.update(matches)
        return codes
    
    def _extract_pairs(self, content: str, pattern: str) -> List[Tuple[str, str]]:
        """Extract pairs of codes (e.g., task-tool, task-RAG)"""
        matches = re.findall(pattern, content, re.MULTILINE)
        return matches
    
    def _find_duplicates(self, items: List) -> List:
        """Find duplicate items in a list"""
        counter = Counter(items)
        return [item for item, count in counter.items() if count > 1]
    
    def validate_file(self, file_path: Path) -> bool:
        """Validate a single seed file"""
        print(f"\n{Color.BOLD}{Color.BLUE}🔍 Validating: {file_path.name}{Color.RESET}")
        
        if not file_path.exists():
            self.errors.append(f"❌ File not found: {file_path}")
            return False
        
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Run all validations
        self._validate_agent_codes(content, file_path.name)
        self._validate_persona_codes(content, file_path.name)
        self._validate_tool_codes(content, file_path.name)
        self._validate_rag_codes(content, file_path.name)
        self._validate_duplicate_mappings(content, file_path.name)
        self._validate_check_constraints(content, file_path.name)
        self._validate_tenant_id(content, file_path.name)
        self._validate_on_conflict(content, file_path.name)
        
        return len(self.errors) == 0
    
    def _validate_agent_codes(self, content: str, filename: str):
        """Validate that all agent codes exist in foundation"""
        agent_codes = set(re.findall(r"'(AGT-[^']+)'", content))
        if not agent_codes:
            return  # No agent codes in this file
        
        invalid_agents = agent_codes - self.foundation_agents
        if invalid_agents:
            self.errors.append(
                f"❌ [{filename}] Invalid agent codes (not in foundation): {sorted(invalid_agents)}\n"
                f"   Available agents: {sorted(list(self.foundation_agents)[:5])}..."
            )
        else:
            print(f"  ✅ Agent codes validated ({len(agent_codes)} codes)")
    
    def _validate_persona_codes(self, content: str, filename: str):
        """Validate that all persona codes exist in foundation"""
        persona_codes = set(re.findall(r"'(P\d+_[^']+)'", content))
        if not persona_codes:
            return  # No persona codes in this file
        
        invalid_personas = persona_codes - self.foundation_personas
        if invalid_personas:
            self.errors.append(
                f"❌ [{filename}] Invalid persona codes (not in foundation): {sorted(invalid_personas)}\n"
                f"   Available personas: {sorted(list(self.foundation_personas)[:5])}..."
            )
        else:
            print(f"  ✅ Persona codes validated ({len(persona_codes)} codes)")
    
    def _validate_tool_codes(self, content: str, filename: str):
        """Validate that all tool codes exist in foundation"""
        tool_codes = set(re.findall(r"'(TOOL-[^']+)'", content))
        if not tool_codes:
            return  # No tool codes in this file
        
        invalid_tools = tool_codes - self.foundation_tools
        if invalid_tools:
            self.errors.append(
                f"❌ [{filename}] Invalid tool codes (not in foundation): {sorted(invalid_tools)}\n"
                f"   Available tools: {sorted(list(self.foundation_tools)[:5])}..."
            )
        else:
            print(f"  ✅ Tool codes validated ({len(tool_codes)} codes)")
    
    def _validate_rag_codes(self, content: str, filename: str):
        """Validate that all RAG codes exist in foundation"""
        rag_codes = set(re.findall(r"'(RAG-[^']+)'", content))
        if not rag_codes:
            return  # No RAG codes in this file
        
        invalid_rags = rag_codes - self.foundation_rags
        if invalid_rags:
            self.errors.append(
                f"❌ [{filename}] Invalid RAG codes (not in foundation): {sorted(invalid_rags)}\n"
                f"   Available RAG sources: {sorted(list(self.foundation_rags)[:5])}..."
            )
        else:
            print(f"  ✅ RAG codes validated ({len(rag_codes)} codes)")
    
    def _validate_duplicate_mappings(self, content: str, filename: str):
        """Validate no duplicate task-tool or task-RAG mappings"""
        
        # Check task-tool duplicates
        task_tool_pairs = self._extract_pairs(
            content, 
            r"\('(TSK-[^']+)',\s*'(TOOL-[^']+)'"
        )
        if task_tool_pairs:
            duplicates = self._find_duplicates(task_tool_pairs)
            if duplicates:
                self.errors.append(
                    f"❌ [{filename}] Duplicate task-tool mappings:\n" +
                    "\n".join([f"   - {task} → {tool}" for task, tool in duplicates])
                )
            else:
                print(f"  ✅ No duplicate task-tool mappings ({len(task_tool_pairs)} mappings)")
        
        # Check task-RAG duplicates
        task_rag_pairs = self._extract_pairs(
            content,
            r"\('(TSK-[^']+)',\s*'(RAG-[^']+)'"
        )
        if task_rag_pairs:
            duplicates = self._find_duplicates(task_rag_pairs)
            if duplicates:
                self.errors.append(
                    f"❌ [{filename}] Duplicate task-RAG mappings:\n" +
                    "\n".join([f"   - {task} → {rag}" for task, rag in duplicates])
                )
            else:
                print(f"  ✅ No duplicate task-RAG mappings ({len(task_rag_pairs)} mappings)")
    
    def _validate_check_constraints(self, content: str, filename: str):
        """Validate CHECK constraint values"""
        
        # Check retry_strategy
        retry_strategies = set(re.findall(r"'((?:EXPONENTIAL_BACKOFF|LINEAR|IMMEDIATE|NONE|LINEAR_BACKOFF))'", content))
        invalid_strategies = retry_strategies - self.valid_retry_strategies
        if invalid_strategies:
            self.errors.append(
                f"❌ [{filename}] Invalid retry_strategy values: {sorted(invalid_strategies)}\n"
                f"   Valid values: {sorted(self.valid_retry_strategies)}"
            )
        elif retry_strategies:
            print(f"  ✅ retry_strategy values validated")
        
        # Check assignment_type
        assignment_types = set(re.findall(r"'((?:PRIMARY_EXECUTOR|VALIDATOR|FALLBACK|REVIEWER|CO_EXECUTOR|PRIMARY|SUPPORT|REVIEW))'", content))
        invalid_types = assignment_types - self.valid_assignment_types
        if invalid_types:
            self.errors.append(
                f"❌ [{filename}] Invalid assignment_type values: {sorted(invalid_types)}\n"
                f"   Valid values: {sorted(self.valid_assignment_types)}"
            )
        elif assignment_types:
            print(f"  ✅ assignment_type values validated")
        
        # Check responsibility
        responsibilities = set(re.findall(r"'((?:APPROVE|REVIEW|PROVIDE_INPUT|INFORM|VALIDATE|CONSULT|LEAD|REVIEWER|CONTRIBUTOR))'", content))
        invalid_responsibilities = responsibilities - self.valid_responsibilities
        if invalid_responsibilities:
            self.errors.append(
                f"❌ [{filename}] Invalid responsibility values: {sorted(invalid_responsibilities)}\n"
                f"   Valid values: {sorted(self.valid_responsibilities)}"
            )
        elif responsibilities:
            print(f"  ✅ responsibility values validated")
        
        # Check review_timing
        review_timings = set(re.findall(r"'((?:BEFORE_AGENT_RUNS|AFTER_AGENT_RUNS|PARALLEL|ON_AGENT_ERROR|DURING|AFTER))'", content))
        invalid_timings = review_timings - self.valid_review_timings
        if invalid_timings:
            self.errors.append(
                f"❌ [{filename}] Invalid review_timing values: {sorted(invalid_timings)}\n"
                f"   Valid values: {sorted(self.valid_review_timings)}"
            )
        elif review_timings:
            print(f"  ✅ review_timing values validated")
    
    def _validate_tenant_id(self, content: str, filename: str):
        """Validate tenant_id in INSERT statements"""
        
        # Check dh_task_tool INSERT
        if 'INSERT INTO dh_task_tool' in content:
            if 'tenant_id' not in content.split('INSERT INTO dh_task_tool')[1].split('SELECT')[0]:
                self.errors.append(
                    f"❌ [{filename}] dh_task_tool INSERT missing tenant_id in column list"
                )
            elif 'sc.tenant_id' not in content.split('INSERT INTO dh_task_tool')[1].split('FROM session_config')[1].split('CROSS JOIN')[0]:
                self.errors.append(
                    f"❌ [{filename}] dh_task_tool SELECT missing sc.tenant_id"
                )
            else:
                print(f"  ✅ dh_task_tool tenant_id validated")
        
        # Check dh_task_rag INSERT
        if 'INSERT INTO dh_task_rag' in content:
            if 'tenant_id' not in content.split('INSERT INTO dh_task_rag')[1].split('SELECT')[0]:
                self.errors.append(
                    f"❌ [{filename}] dh_task_rag INSERT missing tenant_id in column list"
                )
            elif 'sc.tenant_id' not in content.split('INSERT INTO dh_task_rag')[1].split('FROM session_config')[1].split('CROSS JOIN')[0]:
                self.errors.append(
                    f"❌ [{filename}] dh_task_rag SELECT missing sc.tenant_id"
                )
            else:
                print(f"  ✅ dh_task_rag tenant_id validated")
    
    def _validate_on_conflict(self, content: str, filename: str):
        """Validate ON CONFLICT clauses match UNIQUE constraints"""
        
        validations = {
            'dh_workflow': {
                'expected': r'ON CONFLICT \(use_case_id, name\)',
                'wrong_patterns': [r'ON CONFLICT \(tenant_id, use_case_id, name\)']
            },
            'dh_task': {
                'expected': r'ON CONFLICT \(workflow_id, code\)',
                'wrong_patterns': [r'ON CONFLICT \(tenant_id, workflow_id, code\)']
            },
            'dh_task_dependency': {
                'expected': r'ON CONFLICT \(task_id, depends_on_task_id\)',
                'wrong_patterns': [r'ON CONFLICT \(tenant_id, task_id, depends_on_task_id\)']
            },
            'dh_task_agent': {
                'expected': r'ON CONFLICT \(tenant_id, task_id, agent_id, assignment_type\)',
                'wrong_patterns': [r'ON CONFLICT \(tenant_id, task_id, agent_id\)', r'ON CONFLICT \(task_id, agent_id\)']
            },
            'dh_task_persona': {
                'expected': r'ON CONFLICT \(tenant_id, task_id, persona_id, responsibility\)',
                'wrong_patterns': [r'ON CONFLICT \(tenant_id, task_id, persona_id\)', r'ON CONFLICT \(task_id, persona_id\)']
            },
            'dh_task_tool': {
                'expected': r'ON CONFLICT \(task_id, tool_id\)',
                'wrong_patterns': [r'ON CONFLICT \(tenant_id, task_id, tool_id\)']
            },
            'dh_task_rag': {
                'expected': r'ON CONFLICT \(task_id, rag_source_id\)',
                'wrong_patterns': [r'ON CONFLICT \(tenant_id, task_id, rag_source_id\)']
            }
        }
        
        for table, patterns in validations.items():
            if f'INSERT INTO {table}' in content:
                # Check for wrong patterns
                for wrong_pattern in patterns['wrong_patterns']:
                    if re.search(wrong_pattern, content):
                        self.errors.append(
                            f"❌ [{filename}] {table} has wrong ON CONFLICT clause\n"
                            f"   Expected: {patterns['expected']}\n"
                            f"   Found: {wrong_pattern}"
                        )
                        break
                else:
                    # Check for correct pattern
                    if re.search(patterns['expected'], content):
                        print(f"  ✅ {table} ON CONFLICT validated")
    
    def print_summary(self):
        """Print validation summary"""
        print(f"\n{Color.BOLD}{'=' * 70}{Color.RESET}")
        print(f"{Color.BOLD}📊 VALIDATION SUMMARY{Color.RESET}")
        print(f"{Color.BOLD}{'=' * 70}{Color.RESET}")
        
        if self.warnings:
            print(f"\n{Color.YELLOW}⚠️  Warnings ({len(self.warnings)}):{Color.RESET}")
            for warning in self.warnings:
                print(f"  {warning}")
        
        if self.errors:
            print(f"\n{Color.RED}❌ Errors ({len(self.errors)}):{Color.RESET}")
            for i, error in enumerate(self.errors, 1):
                print(f"\n{i}. {error}")
            print(f"\n{Color.RED}{Color.BOLD}🚨 VALIDATION FAILED - Fix errors before running SQL{Color.RESET}")
            return False
        else:
            print(f"\n{Color.GREEN}{Color.BOLD}✅ ALL VALIDATIONS PASSED - Safe to execute SQL!{Color.RESET}")
            return True


def main():
    parser = argparse.ArgumentParser(
        description='Validate digital health workflow seed files',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python validate_seed_file.py 2025/06_cd_001_endpoint_selection_part2.sql
  python validate_seed_file.py 2025/07_cd_002_biomarker_validation_part2.sql
  python validate_seed_file.py 2025/*_part2.sql
        """
    )
    parser.add_argument(
        'files',
        nargs='+',
        help='Seed file(s) to validate (supports wildcards)'
    )
    parser.add_argument(
        '--seeds-dir',
        type=Path,
        default=Path(__file__).parent / '2025',
        help='Directory containing foundation seed files (default: ./2025/)'
    )
    
    args = parser.parse_args()
    
    # Resolve wildcards
    files = []
    for pattern in args.files:
        path = Path(pattern)
        if path.is_absolute():
            files.append(path)
        else:
            # Relative to seeds directory
            files.extend((Path(__file__).parent / path.parent).glob(path.name))
    
    if not files:
        print(f"{Color.RED}❌ No files found matching pattern(s){Color.RESET}")
        return 1
    
    print(f"{Color.BOLD}{Color.CYAN}🚀 Digital Health Workflow Seed Validator{Color.RESET}")
    print(f"{Color.CYAN}{'=' * 70}{Color.RESET}")
    
    validator = SeedValidator(args.seeds_dir)
    validator.load_foundation_codes()
    
    all_valid = True
    for file_path in files:
        if not validator.validate_file(file_path):
            all_valid = False
    
    success = validator.print_summary()
    
    return 0 if success else 1


if __name__ == '__main__':
    sys.exit(main())

