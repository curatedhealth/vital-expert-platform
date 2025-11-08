#!/usr/bin/env python3
"""
JTBD Document Parser
Parses the comprehensive JTBD library document and generates:
1. JSON file for easy review and manipulation
2. SQL file for direct import into Supabase
"""

import json
import re
from typing import Dict, List, Any
from datetime import datetime

class JTBDParser:
    def __init__(self):
        self.personas = []
        self.jtbds = []
        self.persona_jtbd_mappings = []
        
    def parse_persona_block(self, text: str, start_index: int) -> Dict[str, Any]:
        """Parse a single persona block from the document"""
        persona = {
            'name': '',
            'title': '',
            'organization': '',
            'background': '',
            'responsibilities': [],
            'pain_points': [],
            'jtbds': []
        }
        
        # Extract name
        name_match = re.search(r'name:\s*(.+)', text[start_index:start_index+500])
        if name_match:
            persona['name'] = name_match.group(1).strip()
        
        # Extract title
        title_match = re.search(r'title:\s*(.+)', text[start_index:start_index+500])
        if title_match:
            persona['title'] = title_match.group(1).strip()
        
        # Extract organization
        org_match = re.search(r'organization:\s*(.+)', text[start_index:start_index+500])
        if org_match:
            persona['organization'] = org_match.group(1).strip()
        
        return persona
    
    def parse_jtbd_block(self, text: str) -> Dict[str, Any]:
        """Parse a JTBD block from the document"""
        jtbd = {
            'code': '',
            'statement': '',
            'frequency': '',
            'importance': 0,
            'current_satisfaction': 0,
            'opportunity_score': 0,
            'success_metrics': []
        }
        
        # Extract JTBD code
        code_match = re.search(r'(JTBD-[A-Z]+-\d+):', text)
        if code_match:
            jtbd['code'] = code_match.group(1)
        
        # Extract statement
        statement_match = re.search(r'statement:\s*"([^"]+)"', text)
        if statement_match:
            jtbd['statement'] = statement_match.group(1).strip()
        
        # Extract frequency
        freq_match = re.search(r'frequency:\s*(.+)', text)
        if freq_match:
            jtbd['frequency'] = freq_match.group(1).strip()
        
        # Extract importance
        imp_match = re.search(r'importance:\s*(\d+)/10', text)
        if imp_match:
            jtbd['importance'] = int(imp_match.group(1))
        
        # Extract current satisfaction
        sat_match = re.search(r'current_satisfaction:\s*(\d+)/10', text)
        if sat_match:
            jtbd['current_satisfaction'] = int(sat_match.group(1))
        
        # Extract opportunity score
        opp_match = re.search(r'opportunity_score:\s*(\d+)', text)
        if opp_match:
            jtbd['opportunity_score'] = int(opp_match.group(1))
        
        # Extract success metrics
        metrics_section = re.search(r'success_metrics:(.*?)(?=JTBD-|\n\n###|$)', text, re.DOTALL)
        if metrics_section:
            metrics_text = metrics_section.group(1)
            metrics = re.findall(r'-\s*(.+)', metrics_text)
            jtbd['success_metrics'] = [m.strip() for m in metrics if m.strip()]
        
        return jtbd
    
    def generate_json(self, output_file: str):
        """Generate JSON output file"""
        output = {
            'metadata': {
                'version': '1.0.0',
                'generated_at': datetime.now().isoformat(),
                'source': 'Digital Health JTBD Library - Final Draft',
                'total_personas': len(self.personas),
                'total_jtbds': len(self.jtbds),
                'total_mappings': len(self.persona_jtbd_mappings)
            },
            'personas': self.personas,
            'jtbds': self.jtbds,
            'mappings': self.persona_jtbd_mappings
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        
        print(f"✅ JSON file generated: {output_file}")
        print(f"   - {len(self.personas)} personas")
        print(f"   - {len(self.jtbds)} JTBDs")
        print(f"   - {len(self.persona_jtbd_mappings)} mappings")
    
    def generate_sql(self, output_file: str):
        """Generate SQL output file for Supabase import"""
        sql_statements = []
        
        # Header
        sql_statements.append("""
-- ============================================
-- DIGITAL HEALTH JTBD LIBRARY - COMPLETE IMPORT
-- Generated from Final Draft v1.0.0
-- Date: {date}
-- ============================================

BEGIN;
""".format(date=datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
        
        # Insert JTBDs
        sql_statements.append("\n-- ============================================")
        sql_statements.append("-- INSERT DIGITAL HEALTH JTBDs")
        sql_statements.append("-- ============================================\n")
        
        for jtbd in self.jtbds:
            # Determine industry and function from JTBD code
            industry = 'digital_health'
            function_map = {
                'CTO': 'Technology & Digital',
                'CS': 'Customer Success',
                'GM': 'Growth Marketing',
                'VC': 'Investor Relations',
                'CAC': 'Clinical Advisory',
                'RC': 'Regulatory Consulting',
                'COD': 'Clinical Operations',
                'ITD': 'IT Infrastructure',
                'BM': 'Brand Management',
                'SL': 'Sales Leadership',
                'PDL': 'Product Development',
                'CRD': 'Clinical Research',
                'QRM': 'Quality & Regulatory',
                'BDD': 'Business Development',
                'ISM': 'Implementation Success',
                'CCD': 'Clinical Content',
                'RSL': 'Reimbursement Strategy',
                'DSL': 'Data Science',
                'SPO': 'Security & Privacy',
                'DTXC': 'Digital Therapeutics',
                'DBS': 'Digital Biomarkers',
                'VCP': 'Virtual Care Platform',
                'DHC': 'Digital Health Consulting',
                'HTI': 'Health Tech Investor',
                'HAP': 'Healthcare API Platform',
                'AML': 'AI/ML Research',
                'DCT': 'Digital Clinical Trials',
                'PDP': 'Patient Data Platform',
                'DHP': 'Digital Health Policy'
            }
            
            # Extract function from JTBD code
            code_parts = jtbd['code'].split('-')
            if len(code_parts) >= 2:
                func_abbrev = code_parts[1]
                function_name = function_map.get(func_abbrev, 'Digital Health')
            else:
                function_name = 'Digital Health'
            
            # Create unique_id and jtbd_code
            category = function_name.lower().replace(' ', '_').replace('&', 'and')
            number = code_parts[-1] if len(code_parts) >= 2 else '001'
            unique_id = f"dh_{category}_{number}"
            jtbd_code = f"DH_{func_abbrev}_{number}"
            
            # Parse statement to extract verb and goal
            statement = jtbd['statement']
            verb = 'Execute'
            goal = statement
            
            if 'When' in statement and ', I need' in statement:
                parts = statement.split(', I need')
                context = parts[0].replace('When ', '').strip()
                if len(parts) > 1:
                    needs_part = parts[1].split(', so I can')
                    if len(needs_part) > 1:
                        goal = needs_part[1].strip()
                        verb_match = re.match(r'(\w+ing)', context)
                        if verb_match:
                            verb = verb_match.group(1)
            
            sql_statements.append(f"""
INSERT INTO jtbd_library (
    id, unique_id, jtbd_code, title, verb, goal, function, category,
    description, complexity, business_value, time_to_value,
    is_active, tags, keywords
) VALUES (
    '{jtbd['code']}',
    '{unique_id}',
    '{jtbd_code}',
    '{self.escape_sql(statement[:100])}',
    '{verb}',
    '{self.escape_sql(goal)}',
    '{function_name}',
    '{category}',
    '{self.escape_sql(statement)}',
    {self.calculate_complexity(jtbd['importance'], jtbd['current_satisfaction'])},
    '{self.calculate_business_value(jtbd['opportunity_score'])}',
    '{self.estimate_time_to_value(jtbd['opportunity_score'])}',
    true,
    ARRAY['{industry}', '{function_name}', 'digital_health_startup'],
    ARRAY['{verb.lower()}', '{category}', 'digital', 'health']
) ON CONFLICT (id) DO UPDATE SET
    unique_id = EXCLUDED.unique_id,
    jtbd_code = EXCLUDED.jtbd_code,
    title = EXCLUDED.title,
    verb = EXCLUDED.verb,
    goal = EXCLUDED.goal,
    function = EXCLUDED.function,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    updated_at = now();
""")
        
        sql_statements.append("\nCOMMIT;")
        
        # Write to file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(sql_statements))
        
        print(f"\n✅ SQL file generated: {output_file}")
        print(f"   Ready for Supabase import")
    
    def escape_sql(self, text: str) -> str:
        """Escape single quotes for SQL"""
        return text.replace("'", "''")
    
    def calculate_complexity(self, importance: int, satisfaction: int) -> str:
        """Calculate complexity based on importance and satisfaction"""
        if importance >= 9 and satisfaction <= 3:
            return "'High'"
        elif importance >= 7 and satisfaction <= 5:
            return "'Medium'"
        else:
            return "'Low'"
    
    def calculate_business_value(self, opportunity_score: int) -> str:
        """Calculate business value description"""
        if opportunity_score >= 17:
            return "Critical - High impact, low satisfaction, breakthrough opportunity"
        elif opportunity_score >= 15:
            return "High - Significant value creation potential"
        elif opportunity_score >= 13:
            return "Medium - Notable improvement opportunity"
        else:
            return "Standard - Incremental value"
    
    def estimate_time_to_value(self, opportunity_score: int) -> str:
        """Estimate time to value"""
        if opportunity_score >= 17:
            return "6-12 months"
        elif opportunity_score >= 15:
            return "3-6 months"
        else:
            return "1-3 months"


def main():
    """Main execution function"""
    print("=" * 80)
    print("JTBD DOCUMENT PARSER")
    print("Converts JTBD library document to JSON and SQL formats")
    print("=" * 80)
    print()
    
    # Manual data entry for key Digital Health JTBDs from the document
    # This is a template - you can paste the full document content here
    
    parser = JTBDParser()
    
    # Sample Digital Health JTBDs (add more from your document)
    sample_jtbds = [
        {
            'code': 'JTBD-CTO-001',
            'statement': 'When building HIPAA-compliant infrastructure, I need security frameworks and audit tools, so I can ensure compliance and pass audits',
            'frequency': 'Weekly',
            'importance': 10,
            'current_satisfaction': 4,
            'opportunity_score': 16,
            'success_metrics': [
                'HIPAA compliance achieved',
                'Audits passed first time',
                'Security incidents zero',
                'Documentation complete',
                'Cost optimized'
            ]
        },
        {
            'code': 'JTBD-CTO-002',
            'statement': 'When scaling platform for growth, I need architecture patterns and performance optimization, so I can handle 10x users',
            'frequency': 'Monthly',
            'importance': 9,
            'current_satisfaction': 3,
            'opportunity_score': 15,
            'success_metrics': [
                '10x scale achieved',
                'Performance maintained',
                'Costs linear not exponential',
                'Reliability 99.99%',
                'Team productivity high'
            ]
        },
        {
            'code': 'JTBD-CS-001',
            'statement': 'When driving user engagement and retention, I need behavioral analytics and intervention playbooks, so I can reduce churn',
            'frequency': 'Daily',
            'importance': 10,
            'current_satisfaction': 3,
            'opportunity_score': 17,
            'success_metrics': [
                'Churn reduced to <10%',
                'Engagement increased 50%',
                'NPS improved to >50',
                'Expansion revenue 120%',
                'CAC/LTV ratio >3'
            ]
        }
    ]
    
    parser.jtbds = sample_jtbds
    
    # Generate output files
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    json_file = f'/Users/hichamnaim/Downloads/Cursor/VITAL path/data/jtbd_dh_library_{timestamp}.json'
    sql_file = f'/Users/hichamnaim/Downloads/Cursor/VITAL path/data/jtbd_dh_library_{timestamp}.sql'
    
    # Create data directory if it doesn't exist
    import os
    os.makedirs('/Users/hichamnaim/Downloads/Cursor/VITAL path/data', exist_ok=True)
    
    parser.generate_json(json_file)
    parser.generate_sql(sql_file)
    
    print("\n" + "=" * 80)
    print("✅ PARSING COMPLETE")
    print("=" * 80)
    print(f"\nNext steps:")
    print(f"1. Review the generated files:")
    print(f"   - JSON: {json_file}")
    print(f"   - SQL:  {sql_file}")
    print(f"\n2. To import into Supabase:")
    print(f"   psql <connection_string> -f {sql_file}")
    print(f"\n3. Or use Supabase SQL editor to paste the contents")
    print()


if __name__ == '__main__':
    main()

