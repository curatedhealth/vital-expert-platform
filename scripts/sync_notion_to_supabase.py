#!/usr/bin/env python3
"""
Notion to Supabase Sync Script for VITAL Expert System
Syncs all databases: Workflows, Agents, Tools, Capabilities, Prompts, 
Organizational Functions, Departments, Roles, Use Cases, Domains, Personas, Tasks
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv
import requests
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
NOTION_TOKEN = os.getenv('NOTION_TOKEN')
NOTION_VERSION = '2022-06-28'
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_KEY')

# Notion Database IDs (extracted from your workspace)
NOTION_DATABASES = {
    'workflows': 'eb7d52fe-9f7b-455d-a4af-f1b31ebbe524',
    'agents': 'e52a9be9-5c0b-49fa-b6cf-d0e222df6cc8',
    'agents_registry': '02a884e7-ad00-4f0c-9b65-d8fec5d827e3',  # AI Agents Registry
    'tools': '5413fbf4-7a25-4b4f-910f-e205feffacd2',
    'capabilities': 'a7428410-393d-4761-8cc5-966c46f91f49',
    'prompts': 'e0f04531-0e95-4702-934a-44e66fb99eec',
    'rag_documents': '4a61e11f-1a63-42f6-959a-0be6695cc26c',
    'jobs_to_be_done': '1c3736ba-3bf6-4ffb-bb65-40ab0772df63',
    'organizational_functions': 'd7e6bfdf-8d6f-4a4d-8c8a-6ec8d1393ae0',
    'organizational_departments': 'e3649a13-8578-4f34-af1e-2aa7faab7fb4',
    'organizational_roles': '023f7bf4-b15e-4d41-b1a5-e914f0fcf760',
    'competencies': '3efb39ca-bec5-484d-9950-9b8ea90a7b37',
    'l1_industry_category': '9e14b2e3-79c6-4d8a-ab5a-00505b119498',
    'l2_industry_classification': '76ac9d0c-d084-497e-8b9c-5a6b5fb1ffd5',
    'l3_industry_subcategory': '27fc364d-8740-46d5-9c10-b284e4d02957',
}


class NotionToSupabaseSync:
    """Synchronize data from Notion to Supabase"""
    
    def __init__(self):
        """Initialize the sync client"""
        if not NOTION_TOKEN:
            raise ValueError("NOTION_TOKEN not found in environment variables")
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError("Supabase credentials not found in environment variables")
        
        self.notion_headers = {
            'Authorization': f'Bearer {NOTION_TOKEN}',
            'Notion-Version': NOTION_VERSION,
            'Content-Type': 'application/json'
        }
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.id_mapping: Dict[str, Dict[str, str]] = {}  # Map Notion IDs to Supabase IDs
        
    def query_notion_database(self, database_id: str) -> List[Dict[str, Any]]:
        """Query all pages from a Notion database"""
        url = f'https://api.notion.com/v1/databases/{database_id}/query'
        all_results = []
        has_more = True
        start_cursor = None
        
        while has_more:
            payload = {}
            if start_cursor:
                payload['start_cursor'] = start_cursor
            
            response = requests.post(url, headers=self.notion_headers, json=payload)
            
            if response.status_code != 200:
                logger.error(f"Failed to query database {database_id}: {response.text}")
                break
            
            data = response.json()
            all_results.extend(data.get('results', []))
            has_more = data.get('has_more', False)
            start_cursor = data.get('next_cursor')
        
        logger.info(f"Retrieved {len(all_results)} pages from database {database_id}")
        return all_results
    
    def extract_property_value(self, prop: Dict[str, Any]) -> Any:
        """Extract value from Notion property based on its type"""
        prop_type = prop.get('type')
        
        if prop_type == 'title':
            return ''.join([t.get('plain_text', '') for t in prop.get('title', [])])
        elif prop_type == 'rich_text':
            return ''.join([t.get('plain_text', '') for t in prop.get('rich_text', [])])
        elif prop_type == 'number':
            return prop.get('number')
        elif prop_type == 'select':
            select = prop.get('select')
            return select.get('name') if select else None
        elif prop_type == 'multi_select':
            return [item.get('name') for item in prop.get('multi_select', [])]
        elif prop_type == 'date':
            date_obj = prop.get('date')
            return date_obj.get('start') if date_obj else None
        elif prop_type == 'checkbox':
            return prop.get('checkbox', False)
        elif prop_type == 'url':
            return prop.get('url')
        elif prop_type == 'email':
            return prop.get('email')
        elif prop_type == 'phone_number':
            return prop.get('phone_number')
        elif prop_type == 'relation':
            return [rel.get('id') for rel in prop.get('relation', [])]
        elif prop_type == 'people':
            return [person.get('id') for person in prop.get('people', [])]
        elif prop_type == 'created_time':
            return prop.get('created_time')
        elif prop_type == 'last_edited_time':
            return prop.get('last_edited_time')
        elif prop_type == 'auto_increment_id':
            return prop.get('auto_increment_id')
        
        return None
    
    def sync_workflows(self) -> Dict[str, str]:
        """Sync Workflows from Notion to Supabase"""
        logger.info("=== Syncing Workflows ===")
        pages = self.query_notion_database(NOTION_DATABASES['workflows'])
        id_map = {}
        
        for page in pages:
            notion_id = page['id']
            props = page.get('properties', {})
            
            workflow_data = {
                'notion_id': notion_id,
                'name': self.extract_property_value(props.get('Name', {})),
                'description': self.extract_property_value(props.get('Description', {})),
                'steps': self.extract_property_value(props.get('Steps', {})),
                'is_active': self.extract_property_value(props.get('Is Active', {})),
                'created_at': self.extract_property_value(props.get('Created Date', {})),
                'metadata': {
                    'notion_url': f"https://notion.so/{notion_id.replace('-', '')}",
                    'agent_ids': self.extract_property_value(props.get('Agents', {})),
                    'tool_ids': self.extract_property_value(props.get('Tools', {})),
                }
            }
            
            # Upsert to Supabase
            result = self.supabase.table('workflows').upsert(
                workflow_data,
                on_conflict='notion_id'
            ).execute()
            
            if result.data:
                supabase_id = result.data[0]['id']
                id_map[notion_id] = supabase_id
                logger.info(f"✓ Synced workflow: {workflow_data['name']}")
        
        self.id_mapping['workflows'] = id_map
        return id_map
    
    def sync_agents(self) -> Dict[str, str]:
        """Sync Agents from Notion to Supabase"""
        logger.info("=== Syncing Agents ===")
        
        # Sync from main Agents database
        pages = self.query_notion_database(NOTION_DATABASES['agents'])
        id_map = {}
        
        for page in pages:
            notion_id = page['id']
            props = page.get('properties', {})
            
            agent_data = {
                'notion_id': notion_id,
                'name': self.extract_property_value(props.get('Name', {})),
                'display_name': self.extract_property_value(props.get('Display Name', {})),
                'description': self.extract_property_value(props.get('Description', {})),
                'role': self.extract_property_value(props.get('Role', {})),
                'category': self.extract_property_value(props.get('Category', {})),
                'tier': self.extract_property_value(props.get('Tier', {})),
                'lifecycle_stage': self.extract_property_value(props.get('Lifecycle Stage', {})),
                'is_active': self.extract_property_value(props.get('Is Active', {})),
                'is_featured': self.extract_property_value(props.get('Is Featured', {})),
                'model': self.extract_property_value(props.get('Model', {})),
                'temperature': self.extract_property_value(props.get('Temperature', {})),
                'max_tokens': self.extract_property_value(props.get('Max Tokens', {})),
                'system_prompt': self.extract_property_value(props.get('System Prompt', {})),
                'icon': self.extract_property_value(props.get('Icon', {})),
                'color': self.extract_property_value(props.get('Color', {})),
                'success_rate': self.extract_property_value(props.get('Success Rate', {})),
                'usage_count': self.extract_property_value(props.get('Usage Count', {})),
                'created_at': self.extract_property_value(props.get('Created Date', {})),
                'updated_at': self.extract_property_value(props.get('Last Edited', {})),
                'metadata': {
                    'notion_url': f"https://notion.so/{notion_id.replace('-', '')}",
                    'tools': self.extract_property_value(props.get('Tools', {})),
                    'capability_ids': self.extract_property_value(props.get('Capabilities', {})),
                    'prompt_ids': self.extract_property_value(props.get('Related to Prompts (Agent)', {})),
                    'rag_doc_ids': self.extract_property_value(props.get('Related to RAG Documents (Agent)', {})),
                    'workflow_ids': self.extract_property_value(props.get('Related to Workflows (Agents)', {})),
                    'job_ids': self.extract_property_value(props.get('Related to Jobs to Be Done (Agents)', {})),
                }
            }
            
            # Upsert to Supabase
            result = self.supabase.table('agents').upsert(
                agent_data,
                on_conflict='notion_id'
            ).execute()
            
            if result.data:
                supabase_id = result.data[0]['id']
                id_map[notion_id] = supabase_id
                logger.info(f"✓ Synced agent: {agent_data['name']}")
        
        self.id_mapping['agents'] = id_map
        return id_map
    
    def sync_ai_agents_registry(self) -> Dict[str, str]:
        """Sync AI Agents Registry (more detailed agent info)"""
        logger.info("=== Syncing AI Agents Registry ===")
        pages = self.query_notion_database(NOTION_DATABASES['agents_registry'])
        id_map = {}
        
        for page in pages:
            notion_id = page['id']
            props = page.get('properties', {})
            
            agent_data = {
                'notion_id': notion_id,
                'name': self.extract_property_value(props.get('Name', {})),
                'display_name': self.extract_property_value(props.get('Display_Name', {})),
                'agent_code': self.extract_property_value(props.get('Agent_Code', {})),
                'agent_type': self.extract_property_value(props.get('Agent_Type', {})),
                'description': self.extract_property_value(props.get('Description', {})),
                'domain': self.extract_property_value(props.get('Domain', {})),
                'type': self.extract_property_value(props.get('Type', {})),
                'status': self.extract_property_value(props.get('Status', {})),
                'tier': self.extract_property_value(props.get('Tier', {})),
                'model': self.extract_property_value(props.get('Model', {})),
                'primary_model': self.extract_property_value(props.get('Primary_Model', {})),
                'temperature': self.extract_property_value(props.get('Temperature', {})),
                'max_tokens': self.extract_property_value(props.get('Max_Tokens', {})),
                'system_prompt': self.extract_property_value(props.get('System_Prompt', {})),
                'configuration_json': self.extract_property_value(props.get('Configuration_JSON', {})),
                'is_active': self.extract_property_value(props.get('Is_Active', {})),
                'rag_enabled': self.extract_property_value(props.get('RAG_Enabled', {})),
                'hipaa_compliant': self.extract_property_value(props.get('HIPAA_Compliant', {})),
                'gdpr_compliant': self.extract_property_value(props.get('GDPR_Compliant', {})),
                'accuracy_rate': self.extract_property_value(props.get('Accuracy Rate', {})),
                'success_rate': self.extract_property_value(props.get('Success Rate', {})),
                'performance_score': self.extract_property_value(props.get('Performance Score', {})),
                'avatar': self.extract_property_value(props.get('Avatar', {})),
                'created_at': self.extract_property_value(props.get('Created Date', {})),
                'updated_at': self.extract_property_value(props.get('Last Modified', {})),
                'metadata': {
                    'notion_url': f"https://notion.so/{notion_id.replace('-', '')}",
                    'capabilities': self.extract_property_value(props.get('Capabilities', {})),
                    'dependencies': self.extract_property_value(props.get('Dependencies', {})),
                    'medical_specialty': self.extract_property_value(props.get('Medical_Specialty', {})),
                    'domain_expertise': self.extract_property_value(props.get('Domain_Expertise', {})),
                }
            }
            
            # Upsert to Supabase agents_registry table
            result = self.supabase.table('agents_registry').upsert(
                agent_data,
                on_conflict='notion_id'
            ).execute()
            
            if result.data:
                supabase_id = result.data[0]['id']
                id_map[notion_id] = supabase_id
                logger.info(f"✓ Synced agent (registry): {agent_data['name']}")
        
        self.id_mapping['agents_registry'] = id_map
        return id_map
    
    def sync_capabilities(self) -> Dict[str, str]:
        """Sync Capabilities from Notion to Supabase"""
        logger.info("=== Syncing Capabilities ===")
        pages = self.query_notion_database(NOTION_DATABASES['capabilities'])
        id_map = {}
        
        for page in pages:
            notion_id = page['id']
            props = page.get('properties', {})
            
            capability_data = {
                'notion_id': notion_id,
                'name': self.extract_property_value(props.get('Name', {})),
                'display_name': self.extract_property_value(props.get('Display Name', {})),
                'description': self.extract_property_value(props.get('Description', {})),
                'category': self.extract_property_value(props.get('Category', {})),
                'domain': self.extract_property_value(props.get('Domain', {})),
                'vital_component': self.extract_property_value(props.get('VITAL Component', {})),
                'complexity_level': self.extract_property_value(props.get('Complexity Level', {})),
                'maturity': self.extract_property_value(props.get('Maturity', {})),
                'priority': self.extract_property_value(props.get('Priority', {})),
                'stage': self.extract_property_value(props.get('Stage', {})),
                'is_premium': self.extract_property_value(props.get('Is Premium', {})),
                'is_new': self.extract_property_value(props.get('Is New', {})),
                'panel_recommended': self.extract_property_value(props.get('Panel Recommended', {})),
                'success_rate': self.extract_property_value(props.get('Success Rate', {})),
                'usage_count': self.extract_property_value(props.get('Usage Count', {})),
                'icon': self.extract_property_value(props.get('Icon', {})),
                'color': self.extract_property_value(props.get('Color', {})),
                'implementation_timeline': self.extract_property_value(props.get('Implementation Timeline', {})),
                'created_at': self.extract_property_value(props.get('Created Date', {})),
                'updated_at': self.extract_property_value(props.get('Last Edited', {})),
                'metadata': {
                    'notion_url': f"https://notion.so/{notion_id.replace('-', '')}",
                    'agent_ids': self.extract_property_value(props.get('Related to Agents (Capabilities)', {})),
                }
            }
            
            # Upsert to Supabase
            result = self.supabase.table('capabilities').upsert(
                capability_data,
                on_conflict='notion_id'
            ).execute()
            
            if result.data:
                supabase_id = result.data[0]['id']
                id_map[notion_id] = supabase_id
                logger.info(f"✓ Synced capability: {capability_data['name']}")
        
        self.id_mapping['capabilities'] = id_map
        return id_map
    
    def sync_tools(self) -> Dict[str, str]:
        """Sync Tools from Notion to Supabase"""
        logger.info("=== Syncing Tools ===")
        pages = self.query_notion_database(NOTION_DATABASES['tools'])
        id_map = {}
        
        for page in pages:
            notion_id = page['id']
            props = page.get('properties', {})
            
            tool_data = {
                'notion_id': notion_id,
                'name': self.extract_property_value(props.get('Name', {})),
                'description': self.extract_property_value(props.get('Description', {})),
                'tool_type': self.extract_property_value(props.get('Tool Type', {})),
                'configuration': self.extract_property_value(props.get('Configuration', {})),
                'is_active': self.extract_property_value(props.get('Is Active', {})),
                'created_at': self.extract_property_value(props.get('Created Date', {})),
                'metadata': {
                    'notion_url': f"https://notion.so/{notion_id.replace('-', '')}",
                    'workflow_ids': self.extract_property_value(props.get('Related to Workflows (Tools)', {})),
                }
            }
            
            # Upsert to Supabase
            result = self.supabase.table('tools').upsert(
                tool_data,
                on_conflict='notion_id'
            ).execute()
            
            if result.data:
                supabase_id = result.data[0]['id']
                id_map[notion_id] = supabase_id
                logger.info(f"✓ Synced tool: {tool_data['name']}")
        
        self.id_mapping['tools'] = id_map
        return id_map
    
    def sync_prompts(self) -> Dict[str, str]:
        """Sync Prompts from Notion to Supabase"""
        logger.info("=== Syncing Prompts ===")
        pages = self.query_notion_database(NOTION_DATABASES['prompts'])
        id_map = {}
        
        for page in pages:
            notion_id = page['id']
            props = page.get('properties', {})
            
            prompt_data = {
                'notion_id': notion_id,
                'name': self.extract_property_value(props.get('Name', {})),
                'category': self.extract_property_value(props.get('Category', {})),
                'content': self.extract_property_value(props.get('Content', {})),
                'is_active': self.extract_property_value(props.get('Is Active', {})),
                'created_at': self.extract_property_value(props.get('Created Date', {})),
                'metadata': {
                    'notion_url': f"https://notion.so/{notion_id.replace('-', '')}",
                    'agent_ids': self.extract_property_value(props.get('Agent', {})),
                }
            }
            
            # Upsert to Supabase
            result = self.supabase.table('prompts').upsert(
                prompt_data,
                on_conflict='notion_id'
            ).execute()
            
            if result.data:
                supabase_id = result.data[0]['id']
                id_map[notion_id] = supabase_id
                logger.info(f"✓ Synced prompt: {prompt_data['name']}")
        
        self.id_mapping['prompts'] = id_map
        return id_map
    
    def sync_domains(self) -> Dict[str, str]:
        """Sync Domain/Industry data from Notion"""
        logger.info("=== Syncing Domains (L1, L2, L3 Industry Categories) ===")
        
        # Sync L1 Industry Categories
        l1_pages = self.query_notion_database(NOTION_DATABASES['l1_industry_category'])
        l1_map = {}
        
        for page in l1_pages:
            notion_id = page['id']
            props = page.get('properties', {})
            
            domain_data = {
                'notion_id': notion_id,
                'name': self.extract_property_value(props.get('Name', {})),
                'level': 'L1',
                'description': self.extract_property_value(props.get('Description', {})) or '',
                'metadata': {
                    'notion_url': f"https://notion.so/{notion_id.replace('-', '')}",
                }
            }
            
            result = self.supabase.table('domains').upsert(
                domain_data,
                on_conflict='notion_id'
            ).execute()
            
            if result.data:
                supabase_id = result.data[0]['id']
                l1_map[notion_id] = supabase_id
                logger.info(f"✓ Synced L1 domain: {domain_data['name']}")
        
        # Sync L2 Industry Classifications
        l2_pages = self.query_notion_database(NOTION_DATABASES['l2_industry_classification'])
        l2_map = {}
        
        for page in l2_pages:
            notion_id = page['id']
            props = page.get('properties', {})
            
            domain_data = {
                'notion_id': notion_id,
                'name': self.extract_property_value(props.get('Name', {})),
                'level': 'L2',
                'description': self.extract_property_value(props.get('Description', {})) or '',
                'metadata': {
                    'notion_url': f"https://notion.so/{notion_id.replace('-', '')}",
                    'parent_l1_ids': self.extract_property_value(props.get('L1 Category', {})),
                }
            }
            
            result = self.supabase.table('domains').upsert(
                domain_data,
                on_conflict='notion_id'
            ).execute()
            
            if result.data:
                supabase_id = result.data[0]['id']
                l2_map[notion_id] = supabase_id
                logger.info(f"✓ Synced L2 domain: {domain_data['name']}")
        
        # Sync L3 Industry Subcategories
        l3_pages = self.query_notion_database(NOTION_DATABASES['l3_industry_subcategory'])
        l3_map = {}
        
        for page in l3_pages:
            notion_id = page['id']
            props = page.get('properties', {})
            
            domain_data = {
                'notion_id': notion_id,
                'name': self.extract_property_value(props.get('Name', {})),
                'level': 'L3',
                'description': self.extract_property_value(props.get('Description', {})) or '',
                'metadata': {
                    'notion_url': f"https://notion.so/{notion_id.replace('-', '')}",
                    'parent_l2_ids': self.extract_property_value(props.get('L2 Classification', {})),
                }
            }
            
            result = self.supabase.table('domains').upsert(
                domain_data,
                on_conflict='notion_id'
            ).execute()
            
            if result.data:
                supabase_id = result.data[0]['id']
                l3_map[notion_id] = supabase_id
                logger.info(f"✓ Synced L3 domain: {domain_data['name']}")
        
        # Merge all maps
        domain_map = {**l1_map, **l2_map, **l3_map}
        self.id_mapping['domains'] = domain_map
        return domain_map
    
    def sync_use_cases(self) -> Dict[str, str]:
        """Sync Use Cases / Jobs to Be Done from Notion"""
        logger.info("=== Syncing Use Cases (Jobs to Be Done) ===")
        
        try:
            pages = self.query_notion_database(NOTION_DATABASES['jobs_to_be_done'])
        except Exception as e:
            logger.warning(f"Could not sync use cases: {e}")
            return {}
        
        id_map = {}
        
        for page in pages:
            notion_id = page['id']
            props = page.get('properties', {})
            
            use_case_data = {
                'notion_id': notion_id,
                'name': self.extract_property_value(props.get('Name', {})),
                'description': self.extract_property_value(props.get('Description', {})),
                'category': self.extract_property_value(props.get('Category', {})),
                'priority': self.extract_property_value(props.get('Priority', {})),
                'status': self.extract_property_value(props.get('Status', {})),
                'created_at': self.extract_property_value(props.get('Created Date', {})),
                'metadata': {
                    'notion_url': f"https://notion.so/{notion_id.replace('-', '')}",
                    'agent_ids': self.extract_property_value(props.get('Related to Agents (Jobs)', {})),
                }
            }
            
            result = self.supabase.table('use_cases').upsert(
                use_case_data,
                on_conflict='notion_id'
            ).execute()
            
            if result.data:
                supabase_id = result.data[0]['id']
                id_map[notion_id] = supabase_id
                logger.info(f"✓ Synced use case: {use_case_data['name']}")
        
        self.id_mapping['use_cases'] = id_map
        return id_map
    
    def sync_personas(self) -> Dict[str, str]:
        """Sync Personas/Roles from Notion"""
        logger.info("=== Syncing Personas (Organizational Roles) ===")
        
        try:
            pages = self.query_notion_database(NOTION_DATABASES['organizational_roles'])
        except Exception as e:
            logger.warning(f"Could not sync personas: {e}")
            return {}
        
        id_map = {}
        
        for page in pages:
            notion_id = page['id']
            props = page.get('properties', {})
            
            persona_data = {
                'notion_id': notion_id,
                'name': self.extract_property_value(props.get('Name', {})),
                'description': self.extract_property_value(props.get('Description', {})),
                'role_type': self.extract_property_value(props.get('Role Type', {})),
                'seniority_level': self.extract_property_value(props.get('Seniority Level', {})),
                'is_active': self.extract_property_value(props.get('Is Active', {})),
                'created_at': self.extract_property_value(props.get('Created Date', {})),
                'metadata': {
                    'notion_url': f"https://notion.so/{notion_id.replace('-', '')}",
                    'department_ids': self.extract_property_value(props.get('Departments', {})),
                    'responsibility_ids': self.extract_property_value(props.get('Responsibilities', {})),
                }
            }
            
            result = self.supabase.table('personas').upsert(
                persona_data,
                on_conflict='notion_id'
            ).execute()
            
            if result.data:
                supabase_id = result.data[0]['id']
                id_map[notion_id] = supabase_id
                logger.info(f"✓ Synced persona: {persona_data['name']}")
        
        self.id_mapping['personas'] = id_map
        return id_map
    
    def sync_organizational_functions(self) -> Dict[str, str]:
        """Sync Organizational Functions from Notion to Supabase"""
        logger.info("=== Syncing Organizational Functions ===")
        pages = self.query_notion_database(NOTION_DATABASES['organizational_functions'])
        id_map = {}
        
        for page in pages:
            notion_id = page['id']
            props = page.get('properties', {})
            
            function_data = {
                'notion_id': notion_id,
                'name': self.extract_property_value(props.get('Name', {})),
                'description': self.extract_property_value(props.get('Description', {})),
                'function_code': self.extract_property_value(props.get('Function Code', {})),
                'function_type': self.extract_property_value(props.get('Function Type', {})),
                'pharma_criticality': self.extract_property_value(props.get('Pharma Criticality', {})),
                'gxp_regulated': self.extract_property_value(props.get('GxP Regulated', {})),
                'is_active': self.extract_property_value(props.get('Is Active', {})),
                'created_at': self.extract_property_value(props.get('Created Date', {})),
                'metadata': {
                    'notion_url': f"https://notion.so/{notion_id.replace('-', '')}",
                    'department_ids': self.extract_property_value(props.get('Departments', {})),
                    'industry_ids': self.extract_property_value(props.get('Industries', {})),
                    'l3_subcategory_ids': self.extract_property_value(props.get('L3 Industry Subcategories', {})),
                }
            }
            
            # Upsert to Supabase
            result = self.supabase.table('organizational_functions').upsert(
                function_data,
                on_conflict='notion_id'
            ).execute()
            
            if result.data:
                supabase_id = result.data[0]['id']
                id_map[notion_id] = supabase_id
                logger.info(f"✓ Synced function: {function_data['name']}")
        
        self.id_mapping['organizational_functions'] = id_map
        return id_map
    
    def sync_relationships(self):
        """Sync relationships between entities after all entities are synced"""
        logger.info("=== Syncing Relationships ===")
        
        # Sync Workflow-Agent relationships
        self._sync_workflow_agent_relations()
        
        # Sync Workflow-Tool relationships
        self._sync_workflow_tool_relations()
        
        # Sync Agent-Capability relationships
        self._sync_agent_capability_relations()
        
        # Sync Agent-Prompt relationships
        self._sync_agent_prompt_relations()
        
        logger.info("✓ Relationships synced successfully")
    
    def _sync_workflow_agent_relations(self):
        """Sync many-to-many relationships between workflows and agents"""
        logger.info("Syncing Workflow-Agent relationships...")
        
        pages = self.query_notion_database(NOTION_DATABASES['workflows'])
        
        for page in pages:
            workflow_notion_id = page['id']
            props = page.get('properties', {})
            agent_notion_ids = self.extract_property_value(props.get('Agents', {})) or []
            
            workflow_supabase_id = self.id_mapping.get('workflows', {}).get(workflow_notion_id)
            
            if not workflow_supabase_id:
                continue
            
            for agent_notion_id in agent_notion_ids:
                agent_supabase_id = self.id_mapping.get('agents', {}).get(agent_notion_id)
                
                if agent_supabase_id:
                    relation_data = {
                        'workflow_id': workflow_supabase_id,
                        'agent_id': agent_supabase_id,
                    }
                    
                    try:
                        self.supabase.table('workflow_agents').upsert(
                            relation_data,
                            on_conflict='workflow_id,agent_id'
                        ).execute()
                    except Exception as e:
                        logger.warning(f"Failed to sync workflow-agent relation: {e}")
    
    def _sync_workflow_tool_relations(self):
        """Sync many-to-many relationships between workflows and tools"""
        logger.info("Syncing Workflow-Tool relationships...")
        
        pages = self.query_notion_database(NOTION_DATABASES['workflows'])
        
        for page in pages:
            workflow_notion_id = page['id']
            props = page.get('properties', {})
            tool_notion_ids = self.extract_property_value(props.get('Tools', {})) or []
            
            workflow_supabase_id = self.id_mapping.get('workflows', {}).get(workflow_notion_id)
            
            if not workflow_supabase_id:
                continue
            
            for tool_notion_id in tool_notion_ids:
                tool_supabase_id = self.id_mapping.get('tools', {}).get(tool_notion_id)
                
                if tool_supabase_id:
                    relation_data = {
                        'workflow_id': workflow_supabase_id,
                        'tool_id': tool_supabase_id,
                    }
                    
                    try:
                        self.supabase.table('workflow_tools').upsert(
                            relation_data,
                            on_conflict='workflow_id,tool_id'
                        ).execute()
                    except Exception as e:
                        logger.warning(f"Failed to sync workflow-tool relation: {e}")
    
    def _sync_agent_capability_relations(self):
        """Sync many-to-many relationships between agents and capabilities"""
        logger.info("Syncing Agent-Capability relationships...")
        
        pages = self.query_notion_database(NOTION_DATABASES['agents'])
        
        for page in pages:
            agent_notion_id = page['id']
            props = page.get('properties', {})
            capability_notion_ids = self.extract_property_value(props.get('Capabilities', {})) or []
            
            agent_supabase_id = self.id_mapping.get('agents', {}).get(agent_notion_id)
            
            if not agent_supabase_id:
                continue
            
            for capability_notion_id in capability_notion_ids:
                capability_supabase_id = self.id_mapping.get('capabilities', {}).get(capability_notion_id)
                
                if capability_supabase_id:
                    relation_data = {
                        'agent_id': agent_supabase_id,
                        'capability_id': capability_supabase_id,
                    }
                    
                    try:
                        self.supabase.table('agent_capabilities').upsert(
                            relation_data,
                            on_conflict='agent_id,capability_id'
                        ).execute()
                    except Exception as e:
                        logger.warning(f"Failed to sync agent-capability relation: {e}")
    
    def _sync_agent_prompt_relations(self):
        """Sync many-to-many relationships between agents and prompts"""
        logger.info("Syncing Agent-Prompt relationships...")
        
        pages = self.query_notion_database(NOTION_DATABASES['agents'])
        
        for page in pages:
            agent_notion_id = page['id']
            props = page.get('properties', {})
            prompt_notion_ids = self.extract_property_value(props.get('Related to Prompts (Agent)', {})) or []
            
            agent_supabase_id = self.id_mapping.get('agents', {}).get(agent_notion_id)
            
            if not agent_supabase_id:
                continue
            
            for prompt_notion_id in prompt_notion_ids:
                prompt_supabase_id = self.id_mapping.get('prompts', {}).get(prompt_notion_id)
                
                if prompt_supabase_id:
                    relation_data = {
                        'agent_id': agent_supabase_id,
                        'prompt_id': prompt_supabase_id,
                    }
                    
                    try:
                        self.supabase.table('agent_prompts').upsert(
                            relation_data,
                            on_conflict='agent_id,prompt_id'
                        ).execute()
                    except Exception as e:
                        logger.warning(f"Failed to sync agent-prompt relation: {e}")
    
    def run_full_sync(self):
        """Run a full synchronization of all databases"""
        logger.info("🚀 Starting full Notion to Supabase sync...")
        start_time = datetime.now()
        
        try:
            # Sync individual entities first (order matters for relationships)
            self.sync_domains()
            self.sync_tools()
            self.sync_capabilities()
            self.sync_prompts()
            self.sync_agents()
            self.sync_ai_agents_registry()
            self.sync_workflows()
            self.sync_use_cases()
            self.sync_personas()
            self.sync_organizational_functions()
            
            # Sync relationships after all entities are created
            self.sync_relationships()
            
            elapsed = datetime.now() - start_time
            logger.info(f"✅ Full sync completed successfully in {elapsed.total_seconds():.2f} seconds")
            
            # Print summary
            self._print_sync_summary()
            
        except Exception as e:
            logger.error(f"❌ Sync failed: {str(e)}", exc_info=True)
            raise
    
    def _print_sync_summary(self):
        """Print a summary of the sync operation"""
        logger.info("\n" + "="*60)
        logger.info("SYNC SUMMARY")
        logger.info("="*60)
        
        for entity_type, id_map in self.id_mapping.items():
            count = len(id_map)
            logger.info(f"  {entity_type.replace('_', ' ').title()}: {count} records")
        
        total = sum(len(id_map) for id_map in self.id_mapping.values())
        logger.info(f"\n  Total Records Synced: {total}")
        logger.info("="*60 + "\n")


def main():
    """Main entry point"""
    print("""
    ╔══════════════════════════════════════════════════════════╗
    ║   VITAL Expert System - Notion to Supabase Sync         ║
    ║   Syncing: Workflows, Agents, Tools, Capabilities, etc. ║
    ╚══════════════════════════════════════════════════════════╝
    """)
    
    try:
        syncer = NotionToSupabaseSync()
        syncer.run_full_sync()
        
        print("\n✅ Sync completed successfully!")
        print("📊 Check the logs above for detailed statistics\n")
        
    except Exception as e:
        print(f"\n❌ Sync failed: {str(e)}")
        print("Please check the logs for more details\n")
        exit(1)


if __name__ == "__main__":
    main()

