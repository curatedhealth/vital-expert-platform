#!/usr/bin/env python3
"""
Workflow Analysis Script - Extract Reusable Entities

Analyzes all workflow markdown files to identify:
1. Common agents mentioned across use cases
2. Common tools referenced
3. Common personas/roles
4. Common RAG sources/knowledge bases

Purpose: Prevent entity inflation by identifying truly reusable entities
"""

import re
from pathlib import Path
from collections import Counter, defaultdict
import json


class WorkflowAnalyzer:
    """Analyzes workflow files to extract entity patterns"""
    
    def __init__(self, workflows_dir: Path):
        self.workflows_dir = workflows_dir
        
        # Counters for frequency analysis
        self.agent_mentions = Counter()
        self.tool_mentions = Counter()
        self.persona_mentions = Counter()
        self.rag_mentions = Counter()
        self.capability_mentions = Counter()
        
        # Track which use cases use which entities
        self.agent_usecases = defaultdict(list)
        self.tool_usecases = defaultdict(list)
        self.persona_usecases = defaultdict(list)
        
        # Domain categorization
        self.domain_usecases = defaultdict(list)
    
    def analyze_all_workflows(self):
        """Analyze all workflow files in the directory"""
        workflow_files = list(self.workflows_dir.glob("UC*.md"))
        
        print(f"🔍 Found {len(workflow_files)} workflow files")
        print("=" * 70)
        
        for wf_file in sorted(workflow_files):
            self.analyze_workflow(wf_file)
        
        return self.generate_report()
    
    def analyze_workflow(self, file_path: Path):
        """Analyze a single workflow file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract use case code from filename
        uc_code = file_path.stem.split('_')[0]  # e.g., UC01, UC_CD_001
        
        # Determine domain from use case code
        domain = self._extract_domain(uc_code, content)
        self.domain_usecases[domain].append(uc_code)
        
        # Extract agents
        agents = self._extract_agents(content)
        for agent in agents:
            self.agent_mentions[agent] += 1
            self.agent_usecases[agent].append(uc_code)
        
        # Extract tools
        tools = self._extract_tools(content)
        for tool in tools:
            self.tool_mentions[tool] += 1
            self.tool_usecases[tool].append(uc_code)
        
        # Extract personas
        personas = self._extract_personas(content)
        for persona in personas:
            self.persona_mentions[persona] += 1
            self.persona_usecases[persona].append(uc_code)
        
        # Extract RAG sources
        rags = self._extract_rag_sources(content)
        for rag in rags:
            self.rag_mentions[rag] += 1
        
        # Extract capabilities
        capabilities = self._extract_capabilities(content)
        for cap in capabilities:
            self.capability_mentions[cap] += 1
    
    def _extract_domain(self, uc_code: str, content: str) -> str:
        """Extract domain from use case code"""
        # Common domain prefixes
        if 'CD' in uc_code or 'Clinical Development' in content[:500]:
            return 'Clinical Development (CD)'
        elif 'RA' in uc_code or 'Regulatory' in content[:500]:
            return 'Regulatory Affairs (RA)'
        elif 'MA' in uc_code or 'Market Access' in content[:500] or 'Payer' in content[:500]:
            return 'Market Access (MA)'
        elif 'PD' in uc_code or 'Product Development' in content[:500]:
            return 'Product Development (PD)'
        elif 'EG' in uc_code or 'Evidence' in content[:500]:
            return 'Evidence Generation (EG)'
        else:
            return 'Other'
    
    def _extract_agents(self, content: str) -> list:
        """Extract agent types from content"""
        agents = []
        
        # Common agent patterns
        agent_patterns = {
            'Clinical Endpoint Specialist': ['endpoint', 'clinical endpoint', 'outcome measure'],
            'Regulatory Strategy': ['regulatory strategy', 'FDA guidance', 'regulatory precedent'],
            'Data Scientist': ['data scien', 'statistical', 'analytics', 'machine learning', 'algorithm'],
            'Clinical Research': ['clinical research', 'clinical trial', 'study design'],
            'Medical Writer': ['medical writ', 'documentation', 'report generation', 'manuscript'],
            'Health Economics': ['health economics', 'HEOR', 'cost-effectiveness', 'budget impact'],
            'Regulatory Affairs': ['regulatory affairs', 'FDA submission', '510k', 'de novo'],
            'Evidence Synthesis': ['evidence synthesis', 'systematic review', 'meta-analysis'],
            'Biostatistician': ['biostatisti', 'sample size', 'power analysis', 'statistical analysis'],
            'Market Access': ['market access', 'payer', 'reimbursement', 'formulary'],
            'Patient Engagement': ['patient engagement', 'patient experience', 'usability'],
            'Data Privacy': ['privacy', 'HIPAA', 'data security', 'GDPR'],
            'Literature Search': ['literature search', 'PubMed', 'database search'],
            'Workflow Orchestrator': ['orchestrat', 'coordinator', 'workflow management'],
        }
        
        content_lower = content.lower()
        for agent_name, keywords in agent_patterns.items():
            if any(keyword in content_lower for keyword in keywords):
                agents.append(agent_name)
        
        return agents
    
    def _extract_tools(self, content: str) -> list:
        """Extract tools from content"""
        tools = []
        
        # Tool patterns (actual tools that should be in foundation)
        tool_patterns = {
            # Statistical/Analysis Tools
            'R Statistical Software': ['\\br\\b', 'r studio', 'r statistical'],
            'SAS': ['\\bsas\\b', 'sas statistical'],
            'SPSS': ['spss'],
            'Stata': ['stata'],
            'Python': ['python', 'pandas', 'numpy', 'scipy'],
            
            # Clinical Data Management
            'EDC System (Medidata Rave)': ['medidata', 'rave', 'edc system'],
            'REDCap': ['redcap'],
            'CTMS': ['ctms', 'clinical trial management system'],
            
            # Literature/Research Databases
            'PubMed': ['pubmed'],
            'ClinicalTrials.gov': ['clinicaltrials\\.gov'],
            'Cochrane Library': ['cochrane'],
            'PROQOLID': ['proqolid', 'pro database'],
            
            # Decision Analysis
            'TreeAge': ['treeage', 'decision tree'],
            'Crystal Ball': ['crystal ball', 'monte carlo'],
            
            # Regulatory
            'eCTD Software': ['ectd', 'regulatory submission software'],
            'Veeva Vault': ['veeva'],
            
            # Collaboration/Project Management
            'Microsoft Project': ['microsoft project', 'ms project'],
            'Jira': ['jira'],
            'Confluence': ['confluence'],
            'Slack': ['slack'],
        }
        
        content_lower = content.lower()
        for tool_name, patterns in tool_patterns.items():
            for pattern in patterns:
                if re.search(pattern, content_lower):
                    tools.append(tool_name)
                    break
        
        return list(set(tools))  # Remove duplicates
    
    def _extract_personas(self, content: str) -> list:
        """Extract personas/roles from content"""
        personas = []
        
        # Persona patterns
        persona_patterns = {
            'Chief Medical Officer (CMO)': ['chief medical officer', 'cmo'],
            'VP Clinical Development': ['vp clinical', 'vice president clinical'],
            'Regulatory Affairs Director': ['regulatory affairs director', 'regulatory director'],
            'Biostatistician': ['biostatistician', 'principal biostatistician'],
            'Clinical Research Scientist': ['clinical research scientist', 'clinical scientist'],
            'Data Scientist': ['data scientist', 'senior data scientist'],
            'Medical Writer': ['medical writer'],
            'Health Economist': ['health economist', 'heor specialist'],
            'Market Access Director': ['market access director'],
            'Patient Advocate': ['patient advocate', 'patient representative'],
            'Medical Affairs': ['medical affairs', 'medical science liaison'],
            'Quality Assurance': ['quality assurance', 'qa specialist'],
            'Pharmacovigilance': ['pharmacovigilance', 'safety specialist'],
            'Software Engineer': ['software engineer', 'software developer'],
            'UX Designer': ['ux designer', 'user experience'],
            'Product Manager': ['product manager', 'pm digital health'],
        }
        
        content_lower = content.lower()
        for persona_name, keywords in persona_patterns.items():
            if any(keyword in content_lower for keyword in keywords):
                personas.append(persona_name)
        
        return personas
    
    def _extract_rag_sources(self, content: str) -> list:
        """Extract RAG knowledge sources from content"""
        rags = []
        
        # RAG source patterns
        rag_patterns = {
            'FDA Guidance Documents': ['fda guidance', 'fda digital health', 'fda software'],
            'ICH Guidelines': ['ich guideline', 'ich e6', 'ich e9'],
            'EMA Guidelines': ['ema guideline', 'european medicines agency'],
            'CDISC Standards': ['cdisc', 'sdtm', 'adam'],
            'ISPOR Guidelines': ['ispor', 'pharmacoeconomic guidelines'],
            'DiMe Framework': ['dime', 'digital medicine society'],
            'FDA Drug Database': ['fda drug database', 'drugs@fda'],
            'FDA 510(k) Database': ['510k database', '510\\(k\\) database'],
            'Clinical Literature': ['clinical literature', 'peer-reviewed'],
            'PROMIS Database': ['promis', 'patient-reported outcomes measurement'],
        }
        
        content_lower = content.lower()
        for rag_name, patterns in rag_patterns.items():
            for pattern in patterns:
                if re.search(pattern, content_lower):
                    rags.append(rag_name)
                    break
        
        return rags
    
    def _extract_capabilities(self, content: str) -> list:
        """Extract key capabilities/activities from content"""
        capabilities = []
        
        cap_patterns = {
            'Literature Search': ['literature search', 'database search'],
            'Statistical Analysis': ['statistical analysis', 'data analysis'],
            'Regulatory Review': ['regulatory review', 'fda review'],
            'Clinical Trial Design': ['trial design', 'study design'],
            'Sample Size Calculation': ['sample size', 'power analysis'],
            'Report Writing': ['report writing', 'documentation'],
            'Cost-Effectiveness Analysis': ['cost-effectiveness', 'cea'],
            'Budget Impact Model': ['budget impact', 'bim'],
            'Risk Assessment': ['risk assessment', 'risk analysis'],
            'Data Quality Check': ['data quality', 'quality control'],
        }
        
        content_lower = content.lower()
        for cap_name, patterns in cap_patterns.items():
            if any(pattern in content_lower for pattern in patterns):
                capabilities.append(cap_name)
        
        return capabilities
    
    def generate_report(self):
        """Generate analysis report"""
        report = {
            'summary': {
                'total_workflows': len(self.domain_usecases),
                'unique_agents': len(self.agent_mentions),
                'unique_tools': len(self.tool_mentions),
                'unique_personas': len(self.persona_mentions),
                'unique_rags': len(self.rag_mentions),
            },
            'agents': self._generate_entity_report(self.agent_mentions, self.agent_usecases, 'agents'),
            'tools': self._generate_entity_report(self.tool_mentions, self.tool_usecases, 'tools'),
            'personas': self._generate_entity_report(self.persona_mentions, self.persona_usecases, 'personas'),
            'rags': dict(self.rag_mentions.most_common(20)),
            'domains': dict(self.domain_usecases),
            'capabilities': dict(self.capability_mentions.most_common(20)),
        }
        
        return report
    
    def _generate_entity_report(self, counter, usecases_map, entity_type):
        """Generate report for a specific entity type"""
        # Core entities (used in 5+ use cases) - MUST have
        core = [(entity, count, usecases_map[entity]) 
                for entity, count in counter.most_common() if count >= 5]
        
        # Common entities (used in 2-4 use cases) - SHOULD have
        common = [(entity, count, usecases_map[entity]) 
                  for entity, count in counter.most_common() if 2 <= count < 5]
        
        # Rare entities (used in 1 use case) - OPTIONAL or domain-specific
        rare = [(entity, count, usecases_map[entity]) 
                for entity, count in counter.most_common() if count == 1]
        
        return {
            'core': core,
            'common': common,
            'rare': rare,
        }
    
    def print_report(self, report):
        """Print formatted analysis report"""
        print("\n" + "=" * 70)
        print("📊 WORKFLOW ANALYSIS REPORT")
        print("=" * 70)
        
        # Summary
        print(f"\n📈 SUMMARY:")
        print(f"  Total Workflows: {report['summary']['total_workflows']}")
        print(f"  Unique Agents: {report['summary']['unique_agents']}")
        print(f"  Unique Tools: {report['summary']['unique_tools']}")
        print(f"  Unique Personas: {report['summary']['unique_personas']}")
        print(f"  Unique RAG Sources: {report['summary']['unique_rags']}")
        
        # Domains
        print(f"\n🏢 DOMAINS:")
        for domain, usecases in sorted(report['domains'].items()):
            print(f"  {domain}: {len(usecases)} use cases")
        
        # Core Agents (MUST have - used in 5+ use cases)
        print(f"\n🤖 CORE AGENTS (Used in 5+ use cases - MUST HAVE):")
        for agent, count, usecases in report['agents']['core']:
            print(f"  ✅ {agent}")
            print(f"     Used in: {count} use cases")
            print(f"     Examples: {', '.join(usecases[:3])}")
        
        # Common Agents (SHOULD have - used in 2-4 use cases)
        print(f"\n🤖 COMMON AGENTS (Used in 2-4 use cases - SHOULD HAVE):")
        for agent, count, usecases in report['agents']['common'][:10]:
            print(f"  ⚠️  {agent}")
            print(f"     Used in: {count} use cases ({', '.join(usecases)})")
        
        # Core Tools (MUST have)
        print(f"\n🛠️  CORE TOOLS (Used in 5+ use cases - MUST HAVE):")
        for tool, count, usecases in report['tools']['core']:
            print(f"  ✅ {tool}")
            print(f"     Used in: {count} use cases")
            print(f"     Examples: {', '.join(usecases[:3])}")
        
        # Common Tools (SHOULD have)
        print(f"\n🛠️  COMMON TOOLS (Used in 2-4 use cases - SHOULD HAVE):")
        for tool, count, usecases in report['tools']['common'][:10]:
            print(f"  ⚠️  {tool}")
            print(f"     Used in: {count} use cases ({', '.join(usecases)})")
        
        # Rare Tools (OPTIONAL - domain-specific)
        print(f"\n🛠️  RARE TOOLS (Used in 1 use case - OPTIONAL/Domain-Specific):")
        for tool, count, usecases in report['tools']['rare'][:5]:
            print(f"  ℹ️  {tool} ({usecases[0]})")
        
        # Core Personas (MUST have)
        print(f"\n👥 CORE PERSONAS (Used in 5+ use cases - MUST HAVE):")
        for persona, count, usecases in report['personas']['core']:
            print(f"  ✅ {persona}")
            print(f"     Used in: {count} use cases")
        
        # Top RAG Sources
        print(f"\n📚 TOP RAG SOURCES:")
        for rag, count in list(report['rags'].items())[:10]:
            print(f"  📖 {rag}: {count} use cases")
        
        # Top Capabilities
        print(f"\n🎯 TOP CAPABILITIES:")
        for cap, count in list(report['capabilities'].items())[:10]:
            print(f"  🔹 {cap}: {count} use cases")
        
        print("\n" + "=" * 70)
        print("✅ Analysis complete!")
        print("=" * 70)


def main():
    workflows_dir = Path("/Users/hichamnaim/Downloads/Cursor/VITAL path/docs/Workflows")
    
    analyzer = WorkflowAnalyzer(workflows_dir)
    report = analyzer.analyze_all_workflows()
    analyzer.print_report(report)
    
    # Save detailed report to JSON
    output_file = Path(__file__).parent / "workflow_analysis_report.json"
    with open(output_file, 'w') as f:
        # Convert lists in report to serializable format
        serializable_report = {
            'summary': report['summary'],
            'domains': report['domains'],
            'agents_core': [(name, count, ucs) for name, count, ucs in report['agents']['core']],
            'agents_common': [(name, count, ucs) for name, count, ucs in report['agents']['common']],
            'tools_core': [(name, count, ucs) for name, count, ucs in report['tools']['core']],
            'tools_common': [(name, count, ucs) for name, count, ucs in report['tools']['common']],
            'personas_core': [(name, count, ucs) for name, count, ucs in report['personas']['core']],
            'rags': report['rags'],
            'capabilities': report['capabilities'],
        }
        json.dump(serializable_report, f, indent=2)
    
    print(f"\n💾 Detailed report saved to: {output_file}")


if __name__ == '__main__':
    main()

