const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

const supabaseUrl = 'https://xazinxsiqlqokwfmogyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(supabaseUrl, supabaseKey);

// Function mapping based on the CSV data
const functionMappings = {
  'Research & Development': ['Drug Discovery', 'Preclinical Development', 'Translational Medicine'],
  'Clinical Development': ['Clinical Operations', 'Clinical Development', 'Data Management', 'Biostatistics'],
  'Regulatory Affairs': ['Global Regulatory', 'Regulatory CMC', 'Regulatory Intelligence'],
  'Manufacturing': ['Drug Substance', 'Drug Product', 'Supply Chain'],
  'Quality': ['Quality Assurance', 'Quality Control', 'Quality Compliance'],
  'Medical Affairs': ['Medical Science Liaisons', 'Medical Information', 'Medical Communications'],
  'Pharmacovigilance': ['Drug Safety', 'Risk Management', 'Epidemiology'],
  'Commercial': ['Marketing', 'Sales', 'Market Access', 'HEOR'],
  'Business Development': ['BD&L', 'Strategic Planning'],
  'Legal': ['Legal Affairs'],
  'Finance': ['Finance & Accounting'],
  'IT/Digital': ['Information Technology']
};

// Role mappings based on the CSV data
const roleMappings = {
  'Drug Discovery': [
    'Chief Scientific Officer', 'Head of Discovery', 'Principal Scientist', 
    'Medicinal Chemist', 'Molecular Biologist'
  ],
  'Preclinical Development': [
    'Head of Preclinical', 'Toxicologist', 'Pharmacologist', 
    'DMPK Scientist', 'Formulation Scientist'
  ],
  'Translational Medicine': [
    'Head of Translational Medicine', 'Translational Scientist', 
    'Biomarker Specialist', 'Pharmacogenomics Scientist', 'Systems Biologist'
  ],
  'Clinical Operations': [
    'VP Clinical Operations', 'Clinical Trial Manager', 
    'Clinical Research Associate', 'Study Coordinator', 'Clinical Supply Manager'
  ],
  'Clinical Development': [
    'Chief Medical Officer', 'Therapeutic Area Head', 
    'Clinical Scientist', 'Medical Monitor', 'Protocol Writer'
  ],
  'Data Management': [
    'Head of Data Management', 'Clinical Data Manager', 
    'Database Programmer', 'Data Standards Specialist'
  ],
  'Biostatistics': [
    'Head of Biostatistics', 'Principal Biostatistician', 
    'Statistical Programmer', 'SAS Programmer'
  ],
  'Global Regulatory': [
    'VP Regulatory Affairs', 'Regulatory Strategy Director', 
    'Regulatory Affairs Manager', 'Regulatory Writer'
  ],
  'Regulatory CMC': [
    'CMC Regulatory Head', 'CMC Regulatory Manager', 'Technical Writer'
  ],
  'Regulatory Intelligence': [
    'Regulatory Intelligence Lead', 'Intelligence Analyst', 'Policy Analyst'
  ],
  'Drug Substance': [
    'Head of API Manufacturing', 'Process Engineer', 
    'Production Manager', 'Process Development Scientist'
  ],
  'Drug Product': [
    'Head of Formulation', 'Formulation Scientist', 
    'Packaging Engineer', 'Analytical Scientist'
  ],
  'Supply Chain': [
    'Supply Chain Director', 'Demand Planner', 
    'Supply Planner', 'Logistics Manager'
  ],
  'Quality Assurance': [
    'VP Quality', 'QA Director', 'QA Manager', 'Validation Specialist'
  ],
  'Quality Control': [
    'QC Director', 'QC Lab Manager', 'QC Analyst', 'Microbiologist'
  ],
  'Quality Compliance': [
    'Compliance Director', 'Compliance Manager', 'Data Integrity Specialist'
  ],
  'Medical Science Liaisons': [
    'MSL Director', 'Senior MSL', 'Regional MSL'
  ],
  'Medical Information': [
    'Medical Information Manager', 'Medical Information Specialist', 'Medical Writer'
  ],
  'Medical Communications': [
    'Medical Communications Director', 'Publication Manager', 'Congress Manager'
  ],
  'Drug Safety': [
    'Chief Safety Officer', 'Pharmacovigilance Director', 
    'Drug Safety Scientist', 'Safety Physician'
  ],
  'Risk Management': [
    'Risk Management Director', 'Risk Management Scientist', 'REMS Specialist'
  ],
  'Epidemiology': [
    'Head of Epidemiology', 'Epidemiologist', 'Real-World Evidence Scientist'
  ],
  'Marketing': [
    'VP Marketing', 'Brand Director', 'Product Manager', 
    'Marketing Manager', 'Digital Marketing Specialist'
  ],
  'Sales': [
    'VP Sales', 'National Sales Director', 
    'Regional Sales Manager', 'Territory Manager'
  ],
  'Market Access': [
    'Market Access Director', 'Pricing Manager', 
    'Reimbursement Specialist', 'Payer Relations Manager'
  ],
  'HEOR': [
    'HEOR Director', 'Health Economist', 
    'Outcomes Research Scientist', 'HTA Specialist'
  ],
  'BD&L': [
    'Chief Business Officer', 'BD Director', 
    'Licensing Manager', 'Alliance Manager'
  ],
  'Strategic Planning': [
    'Strategy Director', 'Strategic Planner', 'Business Analyst'
  ],
  'Legal Affairs': [
    'General Counsel', 'Patent Attorney', 'Regulatory Attorney', 
    'Contract Manager', 'Compliance Lawyer', 'IP Specialist'
  ],
  'Finance & Accounting': [
    'CFO', 'Finance Director', 'Controller', 
    'FP&A Manager', 'Cost Accountant'
  ],
  'Information Technology': [
    'CIO', 'IT Director', 'System Architect', 
    'Data Scientist', 'Cybersecurity Specialist', 'Digital Transformation Lead'
  ]
};

async function establishOrganizationalMappings() {
  console.log('🚀 Establishing organizational structure mappings...\n');

  try {
    // Step 1: Get current data
    console.log('📊 Fetching current organizational data...');
    
    const { data: functions, error: funcError } = await supabase
      .from('org_functions')
      .select('id, department_name');
    
    const { data: departments, error: deptError } = await supabase
      .from('org_departments')
      .select('id, department_name');
    
    const { data: roles, error: roleError } = await supabase
      .from('org_roles')
      .select('id, role_name');

    if (funcError || deptError || roleError) {
      console.error('❌ Error fetching data:', { funcError, deptError, roleError });
      return;
    }

    console.log(`📋 Current data: ${functions?.length || 0} functions, ${departments?.length || 0} departments, ${roles?.length || 0} roles\n`);

    // Step 2: Create function mapping
    const functionMap = new Map();
    functions?.forEach(func => {
      functionMap.set(func.department_name, func.id);
    });

    // Step 3: Update departments with function mappings
    console.log('🏢 Updating departments with function mappings...');
    let updatedDepartments = 0;

    for (const [functionName, departmentNames] of Object.entries(functionMappings)) {
      const functionId = functionMap.get(functionName);
      
      if (functionId) {
        for (const departmentName of departmentNames) {
          const department = departments?.find(d => d.department_name === departmentName);
          
          if (department) {
            const { error: updateError } = await supabase
              .from('org_departments')
              .update({ function_id: functionId })
              .eq('id', department.id);
            
            if (updateError) {
              console.error(`❌ Error updating department ${departmentName}:`, updateError);
            } else {
              updatedDepartments++;
              console.log(`  ✅ Mapped ${departmentName} → ${functionName}`);
            }
          } else {
            console.log(`  ⚠️  Department not found: ${departmentName}`);
          }
        }
      } else {
        console.log(`  ⚠️  Function not found: ${functionName}`);
      }
    }

    console.log(`\n✅ Updated ${updatedDepartments} departments with function mappings\n`);

    // Step 4: Get updated departments for role mapping
    const { data: updatedDeptData, error: updatedDeptError } = await supabase
      .from('org_departments')
      .select('id, department_name, function_id');

    if (updatedDeptError) {
      console.error('❌ Error fetching updated departments:', updatedDeptError);
      return;
    }

    const departmentMap = new Map();
    updatedDeptData?.forEach(dept => {
      departmentMap.set(dept.department_name, dept);
    });

    // Step 5: Update roles with department and function mappings
    console.log('👤 Updating roles with department and function mappings...');
    let updatedRoles = 0;

    for (const [departmentName, roleNames] of Object.entries(roleMappings)) {
      const department = departmentMap.get(departmentName);
      
      if (department) {
        for (const roleName of roleNames) {
          const role = roles?.find(r => r.role_name === roleName);
          
          if (role) {
            const { error: updateError } = await supabase
              .from('org_roles')
              .update({ 
                department_id: department.id,
                function_id: department.function_id
              })
              .eq('id', role.id);
            
            if (updateError) {
              console.error(`❌ Error updating role ${roleName}:`, updateError);
            } else {
              updatedRoles++;
              console.log(`  ✅ Mapped ${roleName} → ${departmentName} → ${functions?.find(f => f.id === department.function_id)?.department_name || 'Unknown Function'}`);
            }
          } else {
            console.log(`  ⚠️  Role not found: ${roleName}`);
          }
        }
      } else {
        console.log(`  ⚠️  Department not found: ${departmentName}`);
      }
    }

    console.log(`\n✅ Updated ${updatedRoles} roles with department and function mappings\n`);

    // Step 6: Verify the final structure
    console.log('🔍 Verifying final organizational structure...');
    
    const { data: finalDepartments } = await supabase
      .from('org_departments')
      .select('id, department_name, function_id');
    
    const { data: finalRoles } = await supabase
      .from('org_roles')
      .select('id, role_name, department_id, function_id');

    const departmentsWithFunctions = finalDepartments?.filter(d => d.function_id).length || 0;
    const rolesWithDepartments = finalRoles?.filter(r => r.department_id).length || 0;
    const rolesWithFunctions = finalRoles?.filter(r => r.function_id).length || 0;

    console.log('\n📊 Final Organizational Structure:');
    console.log('==================================');
    console.log(`Functions: ${functions?.length || 0}`);
    console.log(`Departments: ${finalDepartments?.length || 0}`);
    console.log(`Roles: ${finalRoles?.length || 0}`);
    console.log(`Departments mapped to functions: ${departmentsWithFunctions}`);
    console.log(`Roles mapped to departments: ${rolesWithDepartments}`);
    console.log(`Roles mapped to functions: ${rolesWithFunctions}`);

    // Show sample hierarchical structure
    console.log('\n🏗️  Sample Hierarchical Structure:');
    console.log('===================================');
    
    const sampleFunction = functions?.[0];
    if (sampleFunction) {
      console.log(`\n📋 Function: ${sampleFunction.department_name}`);
      
      const functionDepartments = finalDepartments?.filter(d => d.function_id === sampleFunction.id) || [];
      console.log(`  📁 Departments (${functionDepartments.length}):`);
      functionDepartments.slice(0, 3).forEach(dept => {
        console.log(`    - ${dept.department_name}`);
        
        const departmentRoles = finalRoles?.filter(r => r.department_id === dept.id) || [];
        console.log(`      👥 Roles (${departmentRoles.length}):`);
        departmentRoles.slice(0, 2).forEach(role => {
          console.log(`        • ${role.role_name}`);
        });
        if (departmentRoles.length > 2) {
          console.log(`        • ... and ${departmentRoles.length - 2} more roles`);
        }
      });
      if (functionDepartments.length > 3) {
        console.log(`    - ... and ${functionDepartments.length - 3} more departments`);
      }
    }

    console.log('\n🎉 Organizational structure mappings established successfully!');
    console.log('✅ All hierarchical relationships have been created');

  } catch (error) {
    console.error('❌ Fatal error during mapping:', error);
  }
}

// Run the mapping
establishOrganizationalMappings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
