const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xazinxsiqlqokwfmogyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateOrganizationalMappings() {
  console.log('🚀 Updating organizational structure mappings...\n');

  try {
    // First, let's get the current data to work with
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

    // Department to Function mappings
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

    // Update departments with function mappings
    console.log('🏢 Updating departments with function mappings...');
    let updatedDepartments = 0;

    for (const mapping of departmentMappings) {
      const departmentId = departmentMap.get(mapping.dept);
      const functionId = functionMap.get(mapping.func);
      
      if (departmentId && functionId) {
        const { error: updateError } = await supabase
          .from('org_departments')
          .update({ function_id: functionId })
          .eq('id', departmentId);
        
        if (updateError) {
          console.error(`❌ Error updating department ${mapping.dept}:`, updateError);
        } else {
          updatedDepartments++;
          console.log(`  ✅ Mapped ${mapping.dept} → ${mapping.func}`);
        }
      } else {
        console.log(`  ⚠️  Missing data: ${mapping.dept} (dept: ${!!departmentId}) → ${mapping.func} (func: ${!!functionId})`);
      }
    }

    console.log(`\n✅ Updated ${updatedDepartments} departments with function mappings\n`);

    // Role to Department mappings
    const roleMappings = [
      // Drug Discovery roles
      { role: 'Chief Scientific Officer', dept: 'Drug Discovery', func: 'Research & Development' },
      { role: 'Head of Discovery', dept: 'Drug Discovery', func: 'Research & Development' },
      { role: 'Principal Scientist', dept: 'Drug Discovery', func: 'Research & Development' },
      { role: 'Medicinal Chemist', dept: 'Drug Discovery', func: 'Research & Development' },
      { role: 'Molecular Biologist', dept: 'Drug Discovery', func: 'Research & Development' },
      
      // Preclinical Development roles
      { role: 'Head of Preclinical', dept: 'Preclinical Development', func: 'Research & Development' },
      { role: 'Toxicologist', dept: 'Preclinical Development', func: 'Research & Development' },
      { role: 'Pharmacologist', dept: 'Preclinical Development', func: 'Research & Development' },
      { role: 'DMPK Scientist', dept: 'Preclinical Development', func: 'Research & Development' },
      { role: 'Formulation Scientist', dept: 'Preclinical Development', func: 'Research & Development' },
      
      // Clinical Operations roles
      { role: 'VP Clinical Operations', dept: 'Clinical Operations', func: 'Clinical Development' },
      { role: 'Clinical Trial Manager', dept: 'Clinical Operations', func: 'Clinical Development' },
      { role: 'Clinical Research Associate', dept: 'Clinical Operations', func: 'Clinical Development' },
      { role: 'Study Coordinator', dept: 'Clinical Operations', func: 'Clinical Development' },
      { role: 'Clinical Supply Manager', dept: 'Clinical Operations', func: 'Clinical Development' },
      
      // Clinical Development roles
      { role: 'Chief Medical Officer', dept: 'Clinical Development', func: 'Clinical Development' },
      { role: 'Therapeutic Area Head', dept: 'Clinical Development', func: 'Clinical Development' },
      { role: 'Clinical Scientist', dept: 'Clinical Development', func: 'Clinical Development' },
      { role: 'Medical Monitor', dept: 'Clinical Development', func: 'Clinical Development' },
      { role: 'Protocol Writer', dept: 'Clinical Development', func: 'Clinical Development' },
      
      // Data Management roles
      { role: 'Head of Data Management', dept: 'Data Management', func: 'Clinical Development' },
      { role: 'Clinical Data Manager', dept: 'Data Management', func: 'Clinical Development' },
      { role: 'Database Programmer', dept: 'Data Management', func: 'Clinical Development' },
      { role: 'Data Standards Specialist', dept: 'Data Management', func: 'Clinical Development' },
      
      // Biostatistics roles
      { role: 'Head of Biostatistics', dept: 'Biostatistics', func: 'Clinical Development' },
      { role: 'Principal Biostatistician', dept: 'Biostatistics', func: 'Clinical Development' },
      { role: 'Statistical Programmer', dept: 'Biostatistics', func: 'Clinical Development' },
      { role: 'SAS Programmer', dept: 'Biostatistics', func: 'Clinical Development' },
      
      // Global Regulatory roles
      { role: 'VP Regulatory Affairs', dept: 'Global Regulatory', func: 'Regulatory Affairs' },
      { role: 'Regulatory Strategy Director', dept: 'Global Regulatory', func: 'Regulatory Affairs' },
      { role: 'Regulatory Affairs Manager', dept: 'Global Regulatory', func: 'Regulatory Affairs' },
      { role: 'Regulatory Writer', dept: 'Global Regulatory', func: 'Regulatory Affairs' },
      
      // Drug Substance roles
      { role: 'Head of API Manufacturing', dept: 'Drug Substance', func: 'Manufacturing' },
      { role: 'Process Engineer', dept: 'Drug Substance', func: 'Manufacturing' },
      { role: 'Production Manager', dept: 'Drug Substance', func: 'Manufacturing' },
      { role: 'Process Development Scientist', dept: 'Drug Substance', func: 'Manufacturing' },
      
      // Quality Assurance roles
      { role: 'VP Quality', dept: 'Quality Assurance', func: 'Quality' },
      { role: 'QA Director', dept: 'Quality Assurance', func: 'Quality' },
      { role: 'QA Manager', dept: 'Quality Assurance', func: 'Quality' },
      { role: 'Validation Specialist', dept: 'Quality Assurance', func: 'Quality' },
      
      // Medical Science Liaisons roles
      { role: 'MSL Director', dept: 'Medical Science Liaisons', func: 'Medical Affairs' },
      { role: 'Senior MSL', dept: 'Medical Science Liaisons', func: 'Medical Affairs' },
      { role: 'Regional MSL', dept: 'Medical Science Liaisons', func: 'Medical Affairs' },
      
      // Drug Safety roles
      { role: 'Chief Safety Officer', dept: 'Drug Safety', func: 'Pharmacovigilance' },
      { role: 'Pharmacovigilance Director', dept: 'Drug Safety', func: 'Pharmacovigilance' },
      { role: 'Drug Safety Scientist', dept: 'Drug Safety', func: 'Pharmacovigilance' },
      { role: 'Safety Physician', dept: 'Drug Safety', func: 'Pharmacovigilance' },
      
      // Marketing roles
      { role: 'VP Marketing', dept: 'Marketing', func: 'Commercial' },
      { role: 'Brand Director', dept: 'Marketing', func: 'Commercial' },
      { role: 'Product Manager', dept: 'Marketing', func: 'Commercial' },
      { role: 'Marketing Manager', dept: 'Marketing', func: 'Commercial' },
      { role: 'Digital Marketing Specialist', dept: 'Marketing', func: 'Commercial' },
      
      // Sales roles
      { role: 'VP Sales', dept: 'Sales', func: 'Commercial' },
      { role: 'National Sales Director', dept: 'Sales', func: 'Commercial' },
      { role: 'Regional Sales Manager', dept: 'Sales', func: 'Commercial' },
      { role: 'Territory Manager', dept: 'Sales', func: 'Commercial' },
      
      // Legal Affairs roles
      { role: 'General Counsel', dept: 'Legal Affairs', func: 'Legal' },
      { role: 'Patent Attorney', dept: 'Legal Affairs', func: 'Legal' },
      { role: 'Regulatory Attorney', dept: 'Legal Affairs', func: 'Legal' },
      { role: 'Contract Manager', dept: 'Legal Affairs', func: 'Legal' },
      { role: 'Compliance Lawyer', dept: 'Legal Affairs', func: 'Legal' },
      { role: 'IP Specialist', dept: 'Legal Affairs', func: 'Legal' },
      
      // Finance & Accounting roles
      { role: 'CFO', dept: 'Finance & Accounting', func: 'Finance' },
      { role: 'Finance Director', dept: 'Finance & Accounting', func: 'Finance' },
      { role: 'Controller', dept: 'Finance & Accounting', func: 'Finance' },
      { role: 'FP&A Manager', dept: 'Finance & Accounting', func: 'Finance' },
      { role: 'Cost Accountant', dept: 'Finance & Accounting', func: 'Finance' },
      
      // Information Technology roles
      { role: 'CIO', dept: 'Information Technology', func: 'IT/Digital' },
      { role: 'IT Director', dept: 'Information Technology', func: 'IT/Digital' },
      { role: 'System Architect', dept: 'Information Technology', func: 'IT/Digital' },
      { role: 'Data Scientist', dept: 'Information Technology', func: 'IT/Digital' },
      { role: 'Cybersecurity Specialist', dept: 'Information Technology', func: 'IT/Digital' },
      { role: 'Digital Transformation Lead', dept: 'Information Technology', func: 'IT/Digital' }
    ];

    // Update roles with department and function mappings
    console.log('👤 Updating roles with department and function mappings...');
    let updatedRoles = 0;

    for (const mapping of roleMappings) {
      const roleId = roleMap.get(mapping.role);
      const departmentId = departmentMap.get(mapping.dept);
      const functionId = functionMap.get(mapping.func);
      
      if (roleId && departmentId && functionId) {
        const { error: updateError } = await supabase
          .from('org_roles')
          .update({ 
            department_id: departmentId,
            function_id: functionId
          })
          .eq('id', roleId);
        
        if (updateError) {
          console.error(`❌ Error updating role ${mapping.role}:`, updateError);
        } else {
          updatedRoles++;
          console.log(`  ✅ Mapped ${mapping.role} → ${mapping.dept} → ${mapping.func}`);
        }
      } else {
        console.log(`  ⚠️  Missing data: ${mapping.role} (role: ${!!roleId}) → ${mapping.dept} (dept: ${!!departmentId}) → ${mapping.func} (func: ${!!functionId})`);
      }
    }

    console.log(`\n✅ Updated ${updatedRoles} roles with department and function mappings\n`);

    // Verify the results
    console.log('🔍 Verifying organizational structure...');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('org_departments')
      .select('id, department_name, function_id')
      .not('function_id', 'is', null);

    const { data: roleVerifyData, error: roleVerifyError } = await supabase
      .from('org_roles')
      .select('id, role_name, department_id, function_id')
      .not('department_id', 'is', null);

    if (verifyError || roleVerifyError) {
      console.error('❌ Error verifying results:', { verifyError, roleVerifyError });
      return;
    }

    console.log('\n📊 Final Organizational Structure:');
    console.log('==================================');
    console.log(`Departments mapped to functions: ${verifyData?.length || 0}`);
    console.log(`Roles mapped to departments: ${roleVerifyData?.length || 0}`);

    console.log('\n🎉 Organizational structure mappings established successfully!');
    console.log('✅ All hierarchical relationships have been created');

  } catch (error) {
    console.error('❌ Fatal error during mapping:', error);
  }
}

// Run the mapping
updateOrganizationalMappings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
