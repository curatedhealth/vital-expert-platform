/**
 * Update Medical Affairs with Comprehensive 30-Agent Structure
 * Based on: docs/MEDICAL_AFFAIRS_EXPANDED_STRUCTURE_30.md
 *
 * Creates/Updates:
 * - 7 Departments within Medical Affairs
 * - 30 Organizational Roles mapped to departments
 * - Updates existing agents with proper organizational mapping
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Medical Affairs Business Function ID (existing)
const MEDICAL_AFFAIRS_ID = '5942a717-4363-4cec-b9b7-db644617e91c';

// 7 Departments Structure
const DEPARTMENTS = [
  {
    name: 'Field Medical',
    description: 'Medical Science Liaisons, Regional Directors, and Field Medical Teams',
    agent_count: 4
  },
  {
    name: 'Medical Information',
    description: 'Medical Information Specialists, Librarians, and Content Management',
    agent_count: 3
  },
  {
    name: 'Medical Communications & Writing',
    description: 'Publication Strategy, Medical Education, Scientific and Regulatory Writing',
    agent_count: 7
  },
  {
    name: 'Evidence Generation & HEOR',
    description: 'Real-World Evidence, Health Economics, Biostatistics, Epidemiology',
    agent_count: 5
  },
  {
    name: 'Clinical Operations Support',
    description: 'Clinical Study Liaisons, Medical Monitors, Data Management, Disclosure',
    agent_count: 4
  },
  {
    name: 'Medical Excellence & Governance',
    description: 'Medical Excellence, Review Committees, Quality Assurance',
    agent_count: 3
  },
  {
    name: 'Medical Strategy & Operations',
    description: 'Medical Affairs Strategy, Therapeutic Area Experts, Global Medical Advisors',
    agent_count: 4
  }
];

// 30 Organizational Roles mapped to departments
const ROLES = [
  // DEPARTMENT 1: FIELD MEDICAL (4 roles)
  {
    dept_index: 0,
    name: 'Medical Science Liaison',
    code: 'MA-001',
    tier: 1,
    seniority_level: 'senior',
    reports_to: 'Head of Field Medical',
    key_stakeholders: 'KOLs, Healthcare Providers, Medical Directors',
    primary_functions: 'KOL engagement, scientific exchange, medical insights'
  },
  {
    dept_index: 0,
    name: 'Regional Medical Director',
    code: 'MA-002',
    tier: 2,
    seniority_level: 'director',
    reports_to: 'VP of Field Medical',
    key_stakeholders: 'Regional KOLs, MSL teams, Healthcare systems',
    primary_functions: 'Regional strategy, MSL management, stakeholder relations'
  },
  {
    dept_index: 0,
    name: 'Therapeutic Area MSL Lead',
    code: 'MA-003',
    tier: 2,
    seniority_level: 'lead',
    reports_to: 'Head of Field Medical',
    key_stakeholders: 'TA experts, Clinical teams, Medical Affairs',
    primary_functions: 'TA expertise, MSL training, scientific strategy'
  },
  {
    dept_index: 0,
    name: 'Field Medical Trainer',
    code: 'MA-004',
    tier: 3,
    seniority_level: 'specialist',
    reports_to: 'Director of Field Medical',
    key_stakeholders: 'MSL teams, HR, Medical Education',
    primary_functions: 'Training programs, competency development, onboarding'
  },

  // DEPARTMENT 2: MEDICAL INFORMATION (3 roles)
  {
    dept_index: 1,
    name: 'Medical Information Specialist',
    code: 'MA-005',
    tier: 1,
    seniority_level: 'specialist',
    reports_to: 'Director of Medical Information',
    key_stakeholders: 'Healthcare Providers, Patients, Regulatory',
    primary_functions: 'Medical inquiries, safety reporting, information management'
  },
  {
    dept_index: 1,
    name: 'Medical Librarian',
    code: 'MA-006',
    tier: 2,
    seniority_level: 'senior',
    reports_to: 'Head of Medical Information',
    key_stakeholders: 'Medical Affairs, R&D, Regulatory',
    primary_functions: 'Literature surveillance, database management, research support'
  },
  {
    dept_index: 1,
    name: 'Medical Content Manager',
    code: 'MA-007',
    tier: 2,
    seniority_level: 'manager',
    reports_to: 'Director of Medical Information',
    key_stakeholders: 'Digital teams, Medical Communications, IT',
    primary_functions: 'Content governance, digital assets, knowledge management'
  },

  // DEPARTMENT 3: MEDICAL COMMUNICATIONS & WRITING (7 roles)
  {
    dept_index: 2,
    name: 'Publication Strategy Lead',
    code: 'MA-008',
    tier: 1,
    seniority_level: 'lead',
    reports_to: 'Head of Medical Communications',
    key_stakeholders: 'Authors, KOLs, Journals',
    primary_functions: 'Publication planning, author engagement, journal strategy'
  },
  {
    dept_index: 2,
    name: 'Medical Education Director',
    code: 'MA-009',
    tier: 1,
    seniority_level: 'director',
    reports_to: 'VP of Medical Communications',
    key_stakeholders: 'Medical Education Providers, Faculty, ACCME',
    primary_functions: 'CME programs, educational strategy, grant management'
  },
  {
    dept_index: 2,
    name: 'Medical Writer - Scientific',
    code: 'MA-010',
    tier: 1,
    seniority_level: 'senior',
    reports_to: 'Head of Medical Writing',
    key_stakeholders: 'Authors, Medical Affairs, Regulatory',
    primary_functions: 'Manuscripts, abstracts, posters, scientific content'
  },
  {
    dept_index: 2,
    name: 'Medical Writer - Regulatory',
    code: 'MA-011',
    tier: 1,
    seniority_level: 'senior',
    reports_to: 'Head of Medical Writing',
    key_stakeholders: 'Regulatory Affairs, Clinical Development, FDA',
    primary_functions: 'CSRs, protocols, IBs, regulatory documents'
  },
  {
    dept_index: 2,
    name: 'Medical Communications Manager',
    code: 'MA-012',
    tier: 2,
    seniority_level: 'manager',
    reports_to: 'Head of Medical Communications',
    key_stakeholders: 'Internal teams, Vendors, Congress organizers',
    primary_functions: 'Communication strategy, congress planning, vendor management'
  },
  {
    dept_index: 2,
    name: 'Medical Editor',
    code: 'MA-013',
    tier: 2,
    seniority_level: 'senior',
    reports_to: 'Head of Medical Writing',
    key_stakeholders: 'Medical Writers, Authors, Publications team',
    primary_functions: 'Editorial review, style guide, quality control'
  },
  {
    dept_index: 2,
    name: 'Congress & Events Manager',
    code: 'MA-014',
    tier: 3,
    seniority_level: 'manager',
    reports_to: 'Director of Medical Communications',
    key_stakeholders: 'Congress organizers, Vendors, Medical teams',
    primary_functions: 'Event planning, logistics, symposia coordination'
  },

  // DEPARTMENT 4: EVIDENCE GENERATION & HEOR (5 roles)
  {
    dept_index: 3,
    name: 'Real-World Evidence Specialist',
    code: 'MA-015',
    tier: 1,
    seniority_level: 'specialist',
    reports_to: 'Head of Real-World Evidence',
    key_stakeholders: 'Market Access, Regulatory, Data Science',
    primary_functions: 'RWE studies, database research, evidence synthesis'
  },
  {
    dept_index: 3,
    name: 'Health Economics Specialist',
    code: 'MA-016',
    tier: 1,
    seniority_level: 'specialist',
    reports_to: 'Head of Health Economics',
    key_stakeholders: 'Market Access, Payers, HTA bodies',
    primary_functions: 'Economic modeling, cost-effectiveness, budget impact'
  },
  {
    dept_index: 3,
    name: 'Biostatistician',
    code: 'MA-017',
    tier: 1,
    seniority_level: 'senior',
    reports_to: 'Head of Biostatistics',
    key_stakeholders: 'Clinical Development, Regulatory, Medical Affairs',
    primary_functions: 'Statistical analysis, study design, data interpretation'
  },
  {
    dept_index: 3,
    name: 'Epidemiologist',
    code: 'MA-018',
    tier: 2,
    seniority_level: 'lead',
    reports_to: 'Head of Epidemiology',
    key_stakeholders: 'Pharmacovigilance, Regulatory, Public Health',
    primary_functions: 'Disease epidemiology, risk assessment, population health'
  },
  {
    dept_index: 3,
    name: 'Outcomes Research Manager',
    code: 'MA-019',
    tier: 2,
    seniority_level: 'manager',
    reports_to: 'Director of HEOR',
    key_stakeholders: 'Clinical teams, Payers, Patient groups',
    primary_functions: 'PRO studies, HRQOL assessment, outcomes metrics'
  },

  // DEPARTMENT 5: CLINICAL OPERATIONS SUPPORT (4 roles)
  {
    dept_index: 4,
    name: 'Clinical Study Liaison',
    code: 'MA-020',
    tier: 1,
    seniority_level: 'specialist',
    reports_to: 'Head of Clinical Collaborations',
    key_stakeholders: 'Investigators, Clinical Development, Sites',
    primary_functions: 'Site support, investigator relations, study facilitation'
  },
  {
    dept_index: 4,
    name: 'Medical Monitor',
    code: 'MA-021',
    tier: 1,
    seniority_level: 'senior',
    reports_to: 'Head of Clinical Science',
    key_stakeholders: 'Clinical teams, Safety, Investigators',
    primary_functions: 'Safety oversight, protocol guidance, medical review'
  },
  {
    dept_index: 4,
    name: 'Clinical Data Manager',
    code: 'MA-022',
    tier: 2,
    seniority_level: 'manager',
    reports_to: 'Head of Data Management',
    key_stakeholders: 'Biostatistics, Clinical Operations, IT',
    primary_functions: 'Data quality, database management, data standards'
  },
  {
    dept_index: 4,
    name: 'Clinical Trial Disclosure Manager',
    code: 'MA-023',
    tier: 3,
    seniority_level: 'manager',
    reports_to: 'Director of Clinical Operations',
    key_stakeholders: 'Regulatory, Legal, Communications',
    primary_functions: 'Trial registration, results disclosure, transparency compliance'
  },

  // DEPARTMENT 6: MEDICAL EXCELLENCE & GOVERNANCE (3 roles)
  {
    dept_index: 5,
    name: 'Medical Excellence Director',
    code: 'MA-024',
    tier: 2,
    seniority_level: 'director',
    reports_to: 'Chief Medical Officer',
    key_stakeholders: 'Leadership, Quality, All Medical Affairs',
    primary_functions: 'Best practices, quality frameworks, excellence initiatives'
  },
  {
    dept_index: 5,
    name: 'Medical Review Committee Coordinator',
    code: 'MA-025',
    tier: 2,
    seniority_level: 'manager',
    reports_to: 'VP of Medical Affairs',
    key_stakeholders: 'Review committees, Legal, Regulatory',
    primary_functions: 'Review processes, approval workflows, governance'
  },
  {
    dept_index: 5,
    name: 'Medical Quality Assurance Manager',
    code: 'MA-026',
    tier: 3,
    seniority_level: 'manager',
    reports_to: 'Head of Quality',
    key_stakeholders: 'Quality, Compliance, Audit',
    primary_functions: 'Quality systems, SOPs, audit preparation'
  },

  // DEPARTMENT 7: MEDICAL STRATEGY & OPERATIONS (4 roles)
  {
    dept_index: 6,
    name: 'Medical Affairs Strategist',
    code: 'MA-027',
    tier: 2,
    seniority_level: 'director',
    reports_to: 'VP of Medical Affairs',
    key_stakeholders: 'Leadership Team, Cross-functional Leads',
    primary_functions: 'Strategic planning, lifecycle management, portfolio strategy'
  },
  {
    dept_index: 6,
    name: 'Therapeutic Area Expert',
    code: 'MA-028',
    tier: 2,
    seniority_level: 'director',
    reports_to: 'Head of Medical Affairs',
    key_stakeholders: 'Clinical Teams, KOLs, Cross-functional Partners',
    primary_functions: 'TA leadership, scientific expertise, medical strategy'
  },
  {
    dept_index: 6,
    name: 'Global Medical Advisor',
    code: 'MA-029',
    tier: 3,
    seniority_level: 'executive',
    reports_to: 'VP of Global Medical Affairs',
    key_stakeholders: 'Regional Medical Leads, Global Teams',
    primary_functions: 'Global coordination, regional alignment, best practice sharing'
  },
  {
    dept_index: 6,
    name: 'Medical Affairs Operations Manager',
    code: 'MA-030',
    tier: 3,
    seniority_level: 'manager',
    reports_to: 'Chief Medical Officer',
    key_stakeholders: 'Finance, HR, Cross-functional Operations',
    primary_functions: 'Budget management, resource allocation, process optimization'
  }
];

async function main() {
  console.log('🏥 Updating Medical Affairs with Comprehensive 30-Agent Structure\n');
  console.log('📋 Based on: docs/MEDICAL_AFFAIRS_EXPANDED_STRUCTURE_30.md\n');

  // Step 1: Create/Update 7 Departments
  console.log('═'.repeat(60));
  console.log('STEP 1: Creating/Updating 7 Departments');
  console.log('═'.repeat(60));

  const departmentIds = [];

  for (const dept of DEPARTMENTS) {
    // Check if department exists
    const { data: existing } = await supabase
      .from('departments')
      .select('id, name')
      .eq('business_function_id', MEDICAL_AFFAIRS_ID)
      .ilike('name', `%${dept.name}%`)
      .maybeSingle();

    if (existing) {
      console.log(`✓ Department exists: ${dept.name}`);
      departmentIds.push(existing.id);
    } else {
      // Create new department
      const { data: newDept, error } = await supabase
        .from('departments')
        .insert({
          name: dept.name,
          description: dept.description,
          business_function_id: MEDICAL_AFFAIRS_ID
        })
        .select('id')
        .single();

      if (error) {
        console.error(`✗ Error creating ${dept.name}:`, error.message);
        departmentIds.push(null);
      } else {
        console.log(`✓ Created department: ${dept.name}`);
        departmentIds.push(newDept.id);
      }
    }
  }

  console.log(`\n✅ Departments setup complete: ${departmentIds.filter(id => id).length}/${DEPARTMENTS.length}\n`);

  // Step 2: Create 30 Organizational Roles
  console.log('═'.repeat(60));
  console.log('STEP 2: Creating 30 Organizational Roles');
  console.log('═'.repeat(60));

  let rolesCreated = 0;
  let rolesExisting = 0;
  let rolesUpdated = 0;

  for (const role of ROLES) {
    const deptId = departmentIds[role.dept_index];
    if (!deptId) {
      console.log(`⚠ Skipping role ${role.code} (department not found)`);
      continue;
    }

    // Check if role exists
    const { data: existing } = await supabase
      .from('organizational_roles')
      .select('id, name, tier')
      .eq('department_id', deptId)
      .eq('name', role.name)
      .maybeSingle();

    const roleData = {
      name: role.name,
      department_id: deptId,
      business_function_id: MEDICAL_AFFAIRS_ID,
      level: role.seniority_level,
      description: `${role.code} | ${role.primary_functions} | Reports to: ${role.reports_to} | Tier ${role.tier}`,
      responsibilities: [
        ...role.primary_functions.split(', '),
        `Key Stakeholders: ${role.key_stakeholders}`,
        `Reports to: ${role.reports_to}`,
        `Tier ${role.tier} role`,
        `Code: ${role.code}`
      ],
      required_capabilities: role.primary_functions.split(', ').map(skill => skill.trim())
    };

    if (existing) {
      // Update existing role
      const { error } = await supabase
        .from('organizational_roles')
        .update(roleData)
        .eq('id', existing.id);

      if (error) {
        console.error(`✗ Error updating ${role.code}:`, error.message);
      } else {
        console.log(`↻ Updated: ${role.code} - ${role.name} (Tier ${role.tier})`);
        rolesUpdated++;
      }
    } else {
      // Create new role
      const { error } = await supabase
        .from('organizational_roles')
        .insert(roleData);

      if (error) {
        console.error(`✗ Error creating ${role.code}:`, error.message);
      } else {
        console.log(`✓ Created: ${role.code} - ${role.name} (Tier ${role.tier})`);
        rolesCreated++;
      }
    }
  }

  console.log(`\n✅ Roles setup complete:`);
  console.log(`   - Created: ${rolesCreated}`);
  console.log(`   - Updated: ${rolesUpdated}`);
  console.log(`   - Total: ${rolesCreated + rolesUpdated}/30\n`);

  // Step 3: Summary Statistics
  console.log('═'.repeat(60));
  console.log('STEP 3: Summary Statistics');
  console.log('═'.repeat(60));

  // Get tier distribution
  const tierCounts = {
    tier1: ROLES.filter(r => r.tier === 1).length,
    tier2: ROLES.filter(r => r.tier === 2).length,
    tier3: ROLES.filter(r => r.tier === 3).length
  };

  console.log('\n📊 Tier Distribution:');
  console.log(`   Tier 1 (Ultra-Specialists): ${tierCounts.tier1} roles (${Math.round(tierCounts.tier1/30*100)}%)`);
  console.log(`   Tier 2 (Specialists):       ${tierCounts.tier2} roles (${Math.round(tierCounts.tier2/30*100)}%)`);
  console.log(`   Tier 3 (Generalists):       ${tierCounts.tier3} roles (${Math.round(tierCounts.tier3/30*100)}%)`);

  console.log('\n📋 Department Distribution:');
  DEPARTMENTS.forEach((dept, i) => {
    const deptRoles = ROLES.filter(r => r.dept_index === i);
    console.log(`   ${i + 1}. ${dept.name}: ${deptRoles.length} roles`);
  });

  console.log('\n═'.repeat(60));
  console.log('✅ MEDICAL AFFAIRS UPDATE COMPLETE');
  console.log('═'.repeat(60));
  console.log('\nNext Steps:');
  console.log('1. Map existing agents to appropriate roles');
  console.log('2. Create new agents for unmapped roles');
  console.log('3. Update agent metadata with organizational structure');
  console.log('4. Validate cross-departmental collaboration mappings\n');
}

main()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
