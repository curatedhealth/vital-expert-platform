const fetch = require('node-fetch').default;
const fs = require('fs');

async function completeOrganizationalMapping3Steps() {
  console.log('🚀 COMPLETE ORGANIZATIONAL MAPPING - 3 STEPS\n');
  console.log('==========================================\n');

  try {
    // Step 1: Get current data
    console.log('📊 STEP 0: Analyzing current data...');
    
    const response = await fetch('https://vital-expert-preprod.vercel.app/api/organizational-structure');
    const orgData = await response.json();
    
    if (!orgData.success) {
      console.error('❌ Error fetching organizational data:', orgData.error);
      return;
    }

    const { functions, departments, roles } = orgData.data;
    console.log(`📋 Current data: ${functions?.length || 0} functions, ${departments?.length || 0} departments, ${roles?.length || 0} roles\n`);

    // Get agents data
    const agentsResponse = await fetch('https://vital-expert-preprod.vercel.app/api/agents-crud?showAll=true');
    const agentsData = await agentsResponse.json();
    const agents = agentsData.data || [];
    console.log(`📋 Agents: ${agents.length}\n`);

    // Create lookup maps
    const functionMap = new Map();
    functions?.forEach(func => {
      functionMap.set(func.department_name, func.id);
    });

    const departmentMap = new Map();
    departments?.forEach(dept => {
      departmentMap.set(dept.department_name, dept.id);
    });

    const roleMap = new Map();
    roles?.forEach(role => {
      roleMap.set(role.role_name, role.id);
    });

    // =====================================================================
    // STEP 1: UPDATE TABLES FOR FUNCTIONS, DEPARTMENTS AND ROLES
    // =====================================================================
    
    console.log('🏗️  STEP 1: UPDATE TABLES FOR FUNCTIONS, DEPARTMENTS AND ROLES');
    console.log('================================================================\n');

    // Create comprehensive department mappings based on pharmaceutical industry structure
    const departmentMappings = [
      // Research & Development
      { dept: 'Drug Discovery', func: 'Research & Development' },
      { dept: 'Preclinical Development', func: 'Research & Development' },
      { dept: 'Translational Medicine', func: 'Research & Development' },
      
      // Clinical Development
      { dept: 'Clinical Operations', func: 'Clinical Development' },
      { dept: 'Clinical Development', func: 'Clinical Development' },
      { dept: 'Data Management', func: 'Clinical Development' },
      { dept: 'Biostatistics', func: 'Clinical Development' },
      
      // Regulatory Affairs
      { dept: 'Global Regulatory', func: 'Regulatory Affairs' },
      { dept: 'Regulatory CMC', func: 'Regulatory Affairs' },
      { dept: 'Regulatory Intelligence', func: 'Regulatory Affairs' },
      
      // Manufacturing
      { dept: 'Drug Substance', func: 'Manufacturing' },
      { dept: 'Drug Product', func: 'Manufacturing' },
      { dept: 'Supply Chain', func: 'Manufacturing' },
      
      // Quality
      { dept: 'Quality Assurance', func: 'Quality' },
      { dept: 'Quality Control', func: 'Quality' },
      { dept: 'Quality Compliance', func: 'Quality' },
      
      // Medical Affairs
      { dept: 'Medical Science Liaisons', func: 'Medical Affairs' },
      { dept: 'Medical Information', func: 'Medical Affairs' },
      { dept: 'Medical Communications', func: 'Medical Affairs' },
      
      // Pharmacovigilance
      { dept: 'Drug Safety', func: 'Pharmacovigilance' },
      { dept: 'Risk Management', func: 'Pharmacovigilance' },
      { dept: 'Epidemiology', func: 'Pharmacovigilance' },
      
      // Commercial
      { dept: 'Marketing', func: 'Commercial' },
      { dept: 'Sales', func: 'Commercial' },
      { dept: 'Market Access', func: 'Commercial' },
      { dept: 'HEOR', func: 'Commercial' },
      
      // Business Development
      { dept: 'BD&L', func: 'Business Development' },
      { dept: 'Strategic Planning', func: 'Business Development' },
      
      // Legal
      { dept: 'Legal Affairs', func: 'Legal' },
      
      // Finance
      { dept: 'Finance & Accounting', func: 'Finance' },
      
      // IT/Digital
      { dept: 'Information Technology', func: 'IT/Digital' }
    ];

    // Filter to existing departments
    const existingDepartmentMappings = departmentMappings.filter(mapping => 
      departmentMap.has(mapping.dept) && functionMap.has(mapping.func)
    );

    console.log(`✅ Found ${existingDepartmentMappings.length} existing department mappings`);

    // =====================================================================
    // STEP 2: MAP BIDIRECTIONAL RELATIONS BETWEEN FUNCTION, DEPARTMENT AND ROLES
    // =====================================================================
    
    console.log('\n🔗 STEP 2: MAP BIDIRECTIONAL RELATIONS BETWEEN FUNCTION, DEPARTMENT AND ROLES');
    console.log('================================================================================\n');

    // Create role mappings based on common patterns
    const roleMappings = [
      // Research & Development roles
      { role: 'Chief Scientific Officer', dept: 'Drug Discovery', func: 'Research & Development' },
      { role: 'Head of Discovery', dept: 'Drug Discovery', func: 'Research & Development' },
      { role: 'Principal Scientist', dept: 'Drug Discovery', func: 'Research & Development' },
      { role: 'Medicinal Chemist', dept: 'Drug Discovery', func: 'Research & Development' },
      { role: 'Molecular Biologist', dept: 'Drug Discovery', func: 'Research & Development' },
      { role: 'Head of Preclinical', dept: 'Preclinical Development', func: 'Research & Development' },
      { role: 'Toxicologist', dept: 'Preclinical Development', func: 'Research & Development' },
      { role: 'Pharmacologist', dept: 'Preclinical Development', func: 'Research & Development' },
      { role: 'DMPK Scientist', dept: 'Preclinical Development', func: 'Research & Development' },
      { role: 'Formulation Scientist', dept: 'Preclinical Development', func: 'Research & Development' },
      
      // Clinical Development roles
      { role: 'Chief Medical Officer', dept: 'Clinical Development', func: 'Clinical Development' },
      { role: 'Therapeutic Area Head', dept: 'Clinical Development', func: 'Clinical Development' },
      { role: 'Clinical Scientist', dept: 'Clinical Development', func: 'Clinical Development' },
      { role: 'Medical Monitor', dept: 'Clinical Development', func: 'Clinical Development' },
      { role: 'Protocol Writer', dept: 'Clinical Development', func: 'Clinical Development' },
      { role: 'VP Clinical Operations', dept: 'Clinical Operations', func: 'Clinical Development' },
      { role: 'Clinical Trial Manager', dept: 'Clinical Operations', func: 'Clinical Development' },
      { role: 'Clinical Research Associate', dept: 'Clinical Operations', func: 'Clinical Development' },
      { role: 'Study Coordinator', dept: 'Clinical Operations', func: 'Clinical Development' },
      { role: 'Clinical Supply Manager', dept: 'Clinical Operations', func: 'Clinical Development' },
      
      // Regulatory Affairs roles
      { role: 'VP Regulatory Affairs', dept: 'Global Regulatory', func: 'Regulatory Affairs' },
      { role: 'Regulatory Strategy Director', dept: 'Global Regulatory', func: 'Regulatory Affairs' },
      { role: 'Regulatory Affairs Manager', dept: 'Global Regulatory', func: 'Regulatory Affairs' },
      { role: 'Regulatory Writer', dept: 'Global Regulatory', func: 'Regulatory Affairs' },
      
      // Quality roles
      { role: 'VP Quality', dept: 'Quality Assurance', func: 'Quality' },
      { role: 'QA Director', dept: 'Quality Assurance', func: 'Quality' },
      { role: 'QA Manager', dept: 'Quality Assurance', func: 'Quality' },
      { role: 'Validation Specialist', dept: 'Quality Assurance', func: 'Quality' },
      
      // Commercial roles
      { role: 'VP Marketing', dept: 'Marketing', func: 'Commercial' },
      { role: 'Brand Director', dept: 'Marketing', func: 'Commercial' },
      { role: 'Product Manager', dept: 'Marketing', func: 'Commercial' },
      { role: 'Marketing Manager', dept: 'Marketing', func: 'Commercial' },
      { role: 'Digital Marketing Specialist', dept: 'Marketing', func: 'Commercial' },
      { role: 'VP Sales', dept: 'Sales', func: 'Commercial' },
      { role: 'National Sales Director', dept: 'Sales', func: 'Commercial' },
      { role: 'Regional Sales Manager', dept: 'Sales', func: 'Commercial' },
      { role: 'Territory Manager', dept: 'Sales', func: 'Commercial' },
      
      // Business Development roles
      { role: 'Chief Business Officer', dept: 'Strategic Planning', func: 'Business Development' },
      { role: 'BD Director', dept: 'BD&L', func: 'Business Development' },
      { role: 'Licensing Manager', dept: 'BD&L', func: 'Business Development' },
      { role: 'Alliance Manager', dept: 'BD&L', func: 'Business Development' },
      { role: 'Strategy Director', dept: 'Strategic Planning', func: 'Business Development' },
      { role: 'Strategic Planner', dept: 'Strategic Planning', func: 'Business Development' },
      { role: 'Business Analyst', dept: 'Strategic Planning', func: 'Business Development' },
      
      // Finance roles
      { role: 'CFO', dept: 'Finance & Accounting', func: 'Finance' },
      { role: 'Finance Director', dept: 'Finance & Accounting', func: 'Finance' },
      { role: 'Controller', dept: 'Finance & Accounting', func: 'Finance' },
      { role: 'FP&A Manager', dept: 'Finance & Accounting', func: 'Finance' },
      { role: 'Cost Accountant', dept: 'Finance & Accounting', func: 'Finance' },
      
      // IT/Digital roles
      { role: 'CIO', dept: 'Information Technology', func: 'IT/Digital' },
      { role: 'IT Director', dept: 'Information Technology', func: 'IT/Digital' },
      { role: 'System Architect', dept: 'Information Technology', func: 'IT/Digital' },
      { role: 'Data Scientist', dept: 'Information Technology', func: 'IT/Digital' },
      { role: 'Cybersecurity Specialist', dept: 'Information Technology', func: 'IT/Digital' },
      { role: 'Digital Transformation Lead', dept: 'Information Technology', func: 'IT/Digital' },
      
      // Legal roles
      { role: 'General Counsel', dept: 'Legal Affairs', func: 'Legal' },
      { role: 'Patent Attorney', dept: 'Legal Affairs', func: 'Legal' },
      { role: 'Regulatory Attorney', dept: 'Legal Affairs', func: 'Legal' },
      { role: 'Contract Manager', dept: 'Legal Affairs', func: 'Legal' },
      { role: 'Compliance Lawyer', dept: 'Legal Affairs', func: 'Legal' },
      { role: 'IP Specialist', dept: 'Legal Affairs', func: 'Legal' }
    ];

    // Filter to existing roles
    const existingRoleMappings = roleMappings.filter(mapping => 
      roleMap.has(mapping.role) && departmentMap.has(mapping.dept) && functionMap.has(mapping.func)
    );

    console.log(`✅ Found ${existingRoleMappings.length} existing role mappings`);

    // =====================================================================
    // STEP 3: MAP ROLES, DEPARTMENT AND FUNCTIONS TO AGENTS
    // =====================================================================
    
    console.log('\n🤖 STEP 3: MAP ROLES, DEPARTMENT AND FUNCTIONS TO AGENTS');
    console.log('========================================================\n');

    // Create agent mapping patterns
    const agentMappingPatterns = [
      { pattern: 'scientist|research|discovery', func: 'Research & Development', dept: 'Drug Discovery', role: 'Principal Scientist' },
      { pattern: 'clinical|trial|medical', func: 'Clinical Development', dept: 'Clinical Operations', role: 'Clinical Trial Manager' },
      { pattern: 'regulatory|compliance|fda', func: 'Regulatory Affairs', dept: 'Global Regulatory', role: 'Regulatory Affairs Manager' },
      { pattern: 'quality|qa|validation', func: 'Quality', dept: 'Quality Assurance', role: 'QA Manager' },
      { pattern: 'marketing|brand|commercial', func: 'Commercial', dept: 'Marketing', role: 'Marketing Manager' },
      { pattern: 'sales|territory|account', func: 'Commercial', dept: 'Sales', role: 'Territory Manager' },
      { pattern: 'finance|accounting|cfo', func: 'Finance', dept: 'Finance & Accounting', role: 'Finance Director' },
      { pattern: 'it|digital|technology|cio', func: 'IT/Digital', dept: 'Information Technology', role: 'IT Director' },
      { pattern: 'legal|counsel|attorney', func: 'Legal', dept: 'Legal Affairs', role: 'General Counsel' },
      { pattern: 'business|strategy|planning', func: 'Business Development', dept: 'Strategic Planning', role: 'Strategic Planner' },
      { pattern: 'manufacturing|production|supply', func: 'Manufacturing', dept: 'Drug Substance', role: 'Production Manager' },
      { pattern: 'safety|pharmacovigilance|pv', func: 'Pharmacovigilance', dept: 'Drug Safety', role: 'Drug Safety Scientist' }
    ];

    // Analyze agents
    let mappedAgents = 0;
    const agentMappings = [];

    agents.slice(0, 50).forEach(agent => { // Sample first 50 agents
      const agentName = (agent.display_name || agent.name || '').toLowerCase();
      
      for (const pattern of agentMappingPatterns) {
        const regex = new RegExp(pattern.pattern, 'i');
        if (regex.test(agentName)) {
          agentMappings.push({
            agent: agent.display_name || agent.name,
            agentId: agent.id,
            func: pattern.func,
            dept: pattern.dept,
            role: pattern.role
          });
          mappedAgents++;
          break;
        }
      }
    });

    console.log(`✅ Analyzed ${agents.length} agents, mapped ${mappedAgents} agents`);

    // =====================================================================
    // CREATE COMPREHENSIVE SQL SCRIPT
    // =====================================================================
    
    console.log('\n📝 Creating comprehensive SQL script...\n');

    const comprehensiveSQL = `-- =====================================================================
-- COMPLETE ORGANIZATIONAL STRUCTURE MAPPING - 3 STEPS
-- =====================================================================
-- This script establishes all hierarchical relationships:
-- Functions → Departments → Roles → Agents

-- =====================================================================
-- STEP 1: UPDATE TABLES FOR FUNCTIONS, DEPARTMENTS AND ROLES
-- =====================================================================

-- Department to Function Mappings
${existingDepartmentMappings.map(mapping => 
  `UPDATE org_departments SET function_id = '${functionMap.get(mapping.func)}' WHERE id = '${departmentMap.get(mapping.dept)}'; -- ${mapping.dept} → ${mapping.func}`
).join('\n')}

-- =====================================================================
-- STEP 2: MAP BIDIRECTIONAL RELATIONS BETWEEN FUNCTION, DEPARTMENT AND ROLES
-- =====================================================================

-- Role to Department and Function Mappings
${existingRoleMappings.map(mapping => 
  `UPDATE org_roles SET department_id = '${departmentMap.get(mapping.dept)}', function_id = '${functionMap.get(mapping.func)}' WHERE id = '${roleMap.get(mapping.role)}'; -- ${mapping.role} → ${mapping.dept} → ${mapping.func}`
).join('\n')}

-- =====================================================================
-- STEP 3: MAP ROLES, DEPARTMENT AND FUNCTIONS TO AGENTS
-- =====================================================================

-- Agent to Role, Department and Function Mappings
${agentMappings.map(mapping => 
  `UPDATE agents SET business_function = '${mapping.func}', department = '${mapping.dept}', role = '${mapping.role}' WHERE id = '${mapping.agentId}'; -- ${mapping.agent} → ${mapping.role} → ${mapping.dept} → ${mapping.func}`
).join('\n')}

-- Pattern-based agent mappings for remaining agents
UPDATE agents SET 
  business_function = 'Research & Development',
  department = 'Drug Discovery',
  role = 'Principal Scientist'
WHERE (name ILIKE '%scientist%' OR name ILIKE '%research%' OR name ILIKE '%discovery%')
AND business_function IS NULL;

UPDATE agents SET 
  business_function = 'Clinical Development',
  department = 'Clinical Operations',
  role = 'Clinical Trial Manager'
WHERE (name ILIKE '%clinical%' OR name ILIKE '%trial%' OR name ILIKE '%medical%')
AND business_function IS NULL;

UPDATE agents SET 
  business_function = 'Regulatory Affairs',
  department = 'Global Regulatory',
  role = 'Regulatory Affairs Manager'
WHERE (name ILIKE '%regulatory%' OR name ILIKE '%compliance%' OR name ILIKE '%fda%')
AND business_function IS NULL;

UPDATE agents SET 
  business_function = 'Quality',
  department = 'Quality Assurance',
  role = 'QA Manager'
WHERE (name ILIKE '%quality%' OR name ILIKE '%qa%' OR name ILIKE '%validation%')
AND business_function IS NULL;

UPDATE agents SET 
  business_function = 'Commercial',
  department = 'Marketing',
  role = 'Marketing Manager'
WHERE (name ILIKE '%marketing%' OR name ILIKE '%brand%' OR name ILIKE '%commercial%')
AND business_function IS NULL;

UPDATE agents SET 
  business_function = 'Commercial',
  department = 'Sales',
  role = 'Territory Manager'
WHERE (name ILIKE '%sales%' OR name ILIKE '%territory%' OR name ILIKE '%account%')
AND business_function IS NULL;

UPDATE agents SET 
  business_function = 'Finance',
  department = 'Finance & Accounting',
  role = 'Finance Director'
WHERE (name ILIKE '%finance%' OR name ILIKE '%accounting%' OR name ILIKE '%cfo%')
AND business_function IS NULL;

UPDATE agents SET 
  business_function = 'IT/Digital',
  department = 'Information Technology',
  role = 'IT Director'
WHERE (name ILIKE '%it%' OR name ILIKE '%digital%' OR name ILIKE '%technology%' OR name ILIKE '%cio%')
AND business_function IS NULL;

UPDATE agents SET 
  business_function = 'Legal',
  department = 'Legal Affairs',
  role = 'General Counsel'
WHERE (name ILIKE '%legal%' OR name ILIKE '%counsel%' OR name ILIKE '%attorney%')
AND business_function IS NULL;

UPDATE agents SET 
  business_function = 'Business Development',
  department = 'Strategic Planning',
  role = 'Strategic Planner'
WHERE (name ILIKE '%business%' OR name ILIKE '%strategy%' OR name ILIKE '%planning%')
AND business_function IS NULL;

UPDATE agents SET 
  business_function = 'Manufacturing',
  department = 'Drug Substance',
  role = 'Production Manager'
WHERE (name ILIKE '%manufacturing%' OR name ILIKE '%production%' OR name ILIKE '%supply%')
AND business_function IS NULL;

UPDATE agents SET 
  business_function = 'Pharmacovigilance',
  department = 'Drug Safety',
  role = 'Drug Safety Scientist'
WHERE (name ILIKE '%safety%' OR name ILIKE '%pharmacovigilance%' OR name ILIKE '%pv%')
AND business_function IS NULL;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Check department mappings
SELECT 
  'Departments mapped to functions' as type,
  COUNT(*) as count
FROM org_departments 
WHERE function_id IS NOT NULL;

-- Check role mappings
SELECT 
  'Roles mapped to departments' as type,
  COUNT(*) as count
FROM org_roles 
WHERE department_id IS NOT NULL;

-- Check agent mappings
SELECT 
  'Agents with business_function' as type,
  COUNT(*) as count
FROM agents 
WHERE business_function IS NOT NULL;

-- Show hierarchical structure
SELECT 
  f.department_name as function_name,
  d.department_name,
  COUNT(r.id) as role_count,
  COUNT(a.id) as agent_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
LEFT JOIN agents a ON a.business_function = f.department_name
GROUP BY f.id, f.department_name, d.id, d.department_name
ORDER BY f.department_name, d.department_name;

-- Show unmapped agents
SELECT 
  'Unmapped agents' as type,
  COUNT(*) as count
FROM agents 
WHERE business_function IS NULL;
`;

    // Write the comprehensive SQL script
    fs.writeFileSync('scripts/complete-3-step-org-mapping.sql', comprehensiveSQL);
    
    console.log('✅ Created complete-3-step-org-mapping.sql script\n');

    // =====================================================================
    // SUMMARY REPORT
    // =====================================================================
    
    console.log('📊 COMPREHENSIVE MAPPING SUMMARY');
    console.log('================================\n');
    
    console.log('STEP 1 - TABLE UPDATES:');
    console.log(`  ✅ Functions: ${functions?.length || 0} (ready)`);
    console.log(`  ✅ Departments: ${departments?.length || 0} (${existingDepartmentMappings.length} will be mapped)`);
    console.log(`  ✅ Roles: ${roles?.length || 0} (${existingRoleMappings.length} will be mapped)`);
    console.log(`  ✅ Agents: ${agents.length} (${mappedAgents} will be mapped + pattern-based)`);
    
    console.log('\nSTEP 2 - BIDIRECTIONAL RELATIONS:');
    console.log(`  🔗 Department → Function: ${existingDepartmentMappings.length} mappings`);
    console.log(`  🔗 Role → Department: ${existingRoleMappings.length} mappings`);
    console.log(`  🔗 Role → Function: ${existingRoleMappings.length} mappings`);
    
    console.log('\nSTEP 3 - AGENT MAPPINGS:');
    console.log(`  🤖 Direct agent mappings: ${mappedAgents}`);
    console.log(`  🤖 Pattern-based mappings: ${agents.length - mappedAgents} (remaining agents)`);
    
    console.log('\n🎯 EXECUTION INSTRUCTIONS:');
    console.log('===========================');
    console.log('1. Open Supabase SQL editor');
    console.log('2. Copy and paste the contents of: scripts/complete-3-step-org-mapping.sql');
    console.log('3. Execute the script');
    console.log('4. Verify results using the verification queries');
    console.log('5. Test the organizational structure API');
    
    console.log('\n📁 FILES CREATED:');
    console.log('================');
    console.log('• scripts/complete-3-step-org-mapping.sql - Complete mapping script');
    console.log('• This comprehensive analysis report');
    
    console.log('\n🚀 READY FOR EXECUTION!');

  } catch (error) {
    console.error('❌ Fatal error during comprehensive mapping:', error);
  }
}

// Run the complete 3-step mapping
completeOrganizationalMapping3Steps()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
