import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Business function to department/role mapping
const FUNCTION_MAPPING: Record<string, { department: string; roles: string[] }> = {
  'Regulatory Affairs': {
    department: 'Regulatory Strategy',
    roles: ['Regulatory Strategist', 'Regulatory Specialist', 'Compliance Officer', 'Regulatory Intelligence Manager']
  },
  'Clinical Development': {
    department: 'Clinical Operations',
    roles: ['Clinical Operations Manager', 'Clinical Research Specialist', 'Clinical Trial Manager', 'Biostatistician']
  },
  'Quality': {
    department: 'Quality Management Systems',
    roles: ['QMS Architect', 'Quality Assurance Manager', 'QC Manager', 'Compliance Auditor']
  },
  'Pharmacovigilance': {
    department: 'Drug Safety',
    roles: ['Safety Specialist', 'Pharmacovigilance Director', 'Safety Physician', 'Risk Manager']
  },
  'Medical Affairs': {
    department: 'Medical Information',
    roles: ['Medical Information Specialist', 'Medical Writer', 'MSL', 'KOL Manager']
  },
  'Commercial': {
    department: 'Market Access',
    roles: ['Market Access Director', 'HEOR Specialist', 'Payer Relations Manager', 'Commercial Strategist']
  },
  'Manufacturing': {
    department: 'Manufacturing Operations',
    roles: ['Manufacturing Manager', 'Process Engineer', 'Production Specialist']
  },
  'Research & Development': {
    department: 'Research',
    roles: ['Research Scientist', 'R&D Manager', 'Innovation Lead']
  }
};

// Avatar mapping based on role
const AVATAR_MAPPING: Record<string, string> = {
  'regulatory': 'avatar_0013',
  'clinical': 'avatar_0012',
  'quality': 'avatar_0016',
  'safety': 'avatar_0015',
  'medical': 'avatar_0019',
  'commercial': 'avatar_0018',
  'data': 'avatar_0004',
  'manufacturing': 'avatar_0021',
  'research': 'avatar_0014'
};

function getAvatarForRole(displayName: string, businessFunction: string): string {
  const name = displayName.toLowerCase();
  
  if (name.includes('regulatory') || name.includes('compliance')) return AVATAR_MAPPING.regulatory;
  if (name.includes('clinical') || name.includes('trial')) return AVATAR_MAPPING.clinical;
  if (name.includes('quality') || name.includes('qms') || name.includes('qa')) return AVATAR_MAPPING.quality;
  if (name.includes('safety') || name.includes('pharmacovigilance') || name.includes('risk')) return AVATAR_MAPPING.safety;
  if (name.includes('medical') || name.includes('writer') || name.includes('msl') || name.includes('kol')) return AVATAR_MAPPING.medical;
  if (name.includes('market') || name.includes('commercial') || name.includes('heor') || name.includes('payer')) return AVATAR_MAPPING.commercial;
  if (name.includes('data') || name.includes('analyst') || name.includes('biostat')) return AVATAR_MAPPING.data;
  if (name.includes('manufacturing') || name.includes('production')) return AVATAR_MAPPING.manufacturing;
  if (name.includes('research') || name.includes('r&d') || name.includes('digital')) return AVATAR_MAPPING.research;
  
  return 'avatar_0001';
}

function mapBusinessFunction(originalFunction: string): string {
  const mapping: Record<string, string> = {
    'regulatory_affairs': 'Regulatory Affairs',
    'clinical_development': 'Clinical Development',
    'market_access': 'Commercial',
    'medical_affairs': 'Medical Affairs',
    'pharmacovigilance': 'Pharmacovigilance',
    'quality_assurance': 'Quality',
    'clinical_operations': 'Clinical Development',
    'Clinical Operations': 'Clinical Development',
    'Clinical Data': 'Clinical Development',
    'Market Access': 'Commercial',
    'Quality Assurance': 'Quality',
    'general_operations': 'Medical Affairs'
  };
  
  return mapping[originalFunction] || originalFunction;
}

function getDepartmentAndRole(businessFunction: string, displayName: string): { department: string; role: string } {
  const mapping = FUNCTION_MAPPING[businessFunction];
  
  if (!mapping) {
    return { department: businessFunction, role: 'Specialist' };
  }
  
  const name = displayName.toLowerCase();
  
  // Smart role assignment based on display name
  if (name.includes('director') || name.includes('manager')) {
    return { department: mapping.department, role: mapping.roles[0] };
  }
  if (name.includes('specialist') || name.includes('expert')) {
    return { department: mapping.department, role: mapping.roles[1] || mapping.roles[0] };
  }
  if (name.includes('coordinator') || name.includes('designer')) {
    return { department: mapping.department, role: mapping.roles[2] || mapping.roles[1] || mapping.roles[0] };
  }
  
  return { department: mapping.department, role: mapping.roles[0] };
}

async function importAgents() {
  try {
    // Read batch upload file
    const batchPath = path.join(process.cwd(), 'data', 'batch-uploads', 'agents_batch.json');
    const batchData = JSON.parse(fs.readFileSync(batchPath, 'utf-8'));
    
    // Read comprehensive registry
    const registryPath = path.join(process.cwd(), 'docs', 'vital_agents_complete_registry.json');
    const registryData = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
    
    console.log(`📊 Found ${batchData.agents.length} agents in batch file`);
    console.log(`📊 Found ${registryData.agents.length} agents in registry`);
    
    const agentsToImport: any[] = [];
    
    // Process batch agents
    for (const agent of batchData.agents) {
      const businessFunction = agent.business_function || 'Medical Affairs';
      const mappedFunction = mapBusinessFunction(businessFunction);
      const { department, role } = getDepartmentAndRole(mappedFunction, agent.display_name);
      const avatar = getAvatarForRole(agent.display_name, mappedFunction);
      
      agentsToImport.push({
        name: agent.name,
        display_name: agent.display_name,
        description: agent.description,
        avatar,
        color: agent.color || '#1976D2',
        model: agent.model || 'gpt-4',
        system_prompt: agent.system_prompt,
        temperature: agent.temperature || 0.7,
        max_tokens: agent.max_tokens || 2000,
        capabilities: agent.capabilities || [],
        business_function: mappedFunction,
        department,
        role,
        tier: agent.tier || 1,
        status: 'active',
        is_public: true,
        data_classification: 'internal',
        rag_enabled: agent.rag_enabled || true,
        domain_expertise: agent.domain_expertise || 'general'
      });
    }
    
    // Process registry agents (first 50 to avoid overwhelming)
    for (let i = 0; i < Math.min(50, registryData.agents.length); i++) {
      const agent = registryData.agents[i];
      const businessFunction = agent.business_function || 'regulatory_affairs';
      const mappedFunction = mapBusinessFunction(businessFunction);
      const { department, role } = getDepartmentAndRole(mappedFunction, agent.display_name);
      const avatar = getAvatarForRole(agent.display_name, mappedFunction);
      
      // Skip if already exists in batch
      if (agentsToImport.some(a => a.name === agent.name)) {
        continue;
      }
      
      agentsToImport.push({
        name: agent.name,
        display_name: agent.display_name,
        description: agent.description || `${agent.display_name} - Healthcare AI Agent`,
        avatar,
        color: agent.color || '#1976D2',
        model: agent.model || 'gpt-4',
        system_prompt: agent.system_prompt || `You are ${agent.display_name}, a specialized healthcare AI agent.`,
        temperature: agent.temperature || 0.7,
        max_tokens: agent.max_tokens || 2000,
        capabilities: agent.capabilities || [],
        business_function: mappedFunction,
        department,
        role,
        tier: agent.tier || 1,
        status: 'active',
        is_public: true,
        data_classification: 'internal',
        rag_enabled: agent.rag_enabled || false,
        domain_expertise: agent.domain_expertise || 'general'
      });
    }
    
    console.log(`\n🚀 Importing ${agentsToImport.length} agents...`);
    
    // Insert in batches of 10
    for (let i = 0; i < agentsToImport.length; i += 10) {
      const batch = agentsToImport.slice(i, i + 10);
      const { data, error } = await supabase
        .from('agents')
        .insert(batch);
      
      if (error) {
        console.error(`❌ Error importing batch ${i / 10 + 1}:`, error.message);
      } else {
        console.log(`✅ Imported agents ${i + 1} to ${Math.min(i + 10, agentsToImport.length)}`);
      }
    }
    
    // Get final count
    const { count } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n✨ Total agents in database: ${count}`);
    
  } catch (error: any) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

importAgents();
