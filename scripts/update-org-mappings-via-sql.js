const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xazinxsiqlqokwfmogyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(supabaseUrl, supabaseKey);

// SQL commands to establish the organizational mappings
const mappingSQL = `
-- Update departments with function mappings
UPDATE org_departments 
SET function_id = (SELECT id FROM org_functions WHERE department_name = 'Research & Development' LIMIT 1)
WHERE department_name IN ('Drug Discovery', 'Preclinical Development', 'Translational Medicine');

UPDATE org_departments 
SET function_id = (SELECT id FROM org_functions WHERE department_name = 'Clinical Development' LIMIT 1)
WHERE department_name IN ('Clinical Operations', 'Clinical Development', 'Data Management', 'Biostatistics');

UPDATE org_departments 
SET function_id = (SELECT id FROM org_functions WHERE department_name = 'Regulatory Affairs' LIMIT 1)
WHERE department_name IN ('Global Regulatory', 'Regulatory CMC', 'Regulatory Intelligence');

UPDATE org_departments 
SET function_id = (SELECT id FROM org_functions WHERE department_name = 'Manufacturing' LIMIT 1)
WHERE department_name IN ('Drug Substance', 'Drug Product', 'Supply Chain');

UPDATE org_departments 
SET function_id = (SELECT id FROM org_functions WHERE department_name = 'Quality' LIMIT 1)
WHERE department_name IN ('Quality Assurance', 'Quality Control', 'Quality Compliance');

UPDATE org_departments 
SET function_id = (SELECT id FROM org_functions WHERE department_name = 'Medical Affairs' LIMIT 1)
WHERE department_name IN ('Medical Science Liaisons', 'Medical Information', 'Medical Communications');

UPDATE org_departments 
SET function_id = (SELECT id FROM org_functions WHERE department_name = 'Pharmacovigilance' LIMIT 1)
WHERE department_name IN ('Drug Safety', 'Risk Management', 'Epidemiology');

UPDATE org_departments 
SET function_id = (SELECT id FROM org_functions WHERE department_name = 'Commercial' LIMIT 1)
WHERE department_name IN ('Marketing', 'Sales', 'Market Access', 'HEOR');

UPDATE org_departments 
SET function_id = (SELECT id FROM org_functions WHERE department_name = 'Business Development' LIMIT 1)
WHERE department_name IN ('BD&L', 'Strategic Planning');

UPDATE org_departments 
SET function_id = (SELECT id FROM org_functions WHERE department_name = 'Legal' LIMIT 1)
WHERE department_name IN ('Legal Affairs');

UPDATE org_departments 
SET function_id = (SELECT id FROM org_functions WHERE department_name = 'Finance' LIMIT 1)
WHERE department_name IN ('Finance & Accounting');

UPDATE org_departments 
SET function_id = (SELECT id FROM org_functions WHERE department_name = 'IT/Digital' LIMIT 1)
WHERE department_name IN ('Information Technology');
`;

async function updateOrganizationalMappings() {
  console.log('🚀 Updating organizational structure mappings via SQL...\n');

  try {
    // Execute the mapping SQL
    console.log('📝 Executing department-to-function mappings...');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql: mappingSQL });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      return;
    }

    console.log('✅ Department-to-function mappings completed\n');

    // Now update roles with department and function mappings
    console.log('👤 Updating roles with department and function mappings...');
    
    const roleMappingSQL = `
-- Update roles with department and function mappings
UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Drug Discovery' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Research & Development' LIMIT 1)
WHERE role_name IN ('Chief Scientific Officer', 'Head of Discovery', 'Principal Scientist', 'Medicinal Chemist', 'Molecular Biologist');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Preclinical Development' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Research & Development' LIMIT 1)
WHERE role_name IN ('Head of Preclinical', 'Toxicologist', 'Pharmacologist', 'DMPK Scientist', 'Formulation Scientist');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Translational Medicine' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Research & Development' LIMIT 1)
WHERE role_name IN ('Head of Translational Medicine', 'Translational Scientist', 'Biomarker Specialist', 'Pharmacogenomics Scientist', 'Systems Biologist');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Clinical Operations' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Clinical Development' LIMIT 1)
WHERE role_name IN ('VP Clinical Operations', 'Clinical Trial Manager', 'Clinical Research Associate', 'Study Coordinator', 'Clinical Supply Manager');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Clinical Development' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Clinical Development' LIMIT 1)
WHERE role_name IN ('Chief Medical Officer', 'Therapeutic Area Head', 'Clinical Scientist', 'Medical Monitor', 'Protocol Writer');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Data Management' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Clinical Development' LIMIT 1)
WHERE role_name IN ('Head of Data Management', 'Clinical Data Manager', 'Database Programmer', 'Data Standards Specialist');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Biostatistics' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Clinical Development' LIMIT 1)
WHERE role_name IN ('Head of Biostatistics', 'Principal Biostatistician', 'Statistical Programmer', 'SAS Programmer');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Global Regulatory' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Regulatory Affairs' LIMIT 1)
WHERE role_name IN ('VP Regulatory Affairs', 'Regulatory Strategy Director', 'Regulatory Affairs Manager', 'Regulatory Writer');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Regulatory CMC' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Regulatory Affairs' LIMIT 1)
WHERE role_name IN ('CMC Regulatory Head', 'CMC Regulatory Manager', 'Technical Writer');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Regulatory Intelligence' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Regulatory Affairs' LIMIT 1)
WHERE role_name IN ('Regulatory Intelligence Lead', 'Intelligence Analyst', 'Policy Analyst');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Drug Substance' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Manufacturing' LIMIT 1)
WHERE role_name IN ('Head of API Manufacturing', 'Process Engineer', 'Production Manager', 'Process Development Scientist');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Drug Product' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Manufacturing' LIMIT 1)
WHERE role_name IN ('Head of Formulation', 'Formulation Scientist', 'Packaging Engineer', 'Analytical Scientist');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Supply Chain' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Manufacturing' LIMIT 1)
WHERE role_name IN ('Supply Chain Director', 'Demand Planner', 'Supply Planner', 'Logistics Manager');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Quality Assurance' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Quality' LIMIT 1)
WHERE role_name IN ('VP Quality', 'QA Director', 'QA Manager', 'Validation Specialist');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Quality Control' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Quality' LIMIT 1)
WHERE role_name IN ('QC Director', 'QC Lab Manager', 'QC Analyst', 'Microbiologist');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Quality Compliance' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Quality' LIMIT 1)
WHERE role_name IN ('Compliance Director', 'Compliance Manager', 'Data Integrity Specialist');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Medical Science Liaisons' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Medical Affairs' LIMIT 1)
WHERE role_name IN ('MSL Director', 'Senior MSL', 'Regional MSL');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Medical Information' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Medical Affairs' LIMIT 1)
WHERE role_name IN ('Medical Information Manager', 'Medical Information Specialist', 'Medical Writer');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Medical Communications' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Medical Affairs' LIMIT 1)
WHERE role_name IN ('Medical Communications Director', 'Publication Manager', 'Congress Manager');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Drug Safety' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Pharmacovigilance' LIMIT 1)
WHERE role_name IN ('Chief Safety Officer', 'Pharmacovigilance Director', 'Drug Safety Scientist', 'Safety Physician');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Risk Management' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Pharmacovigilance' LIMIT 1)
WHERE role_name IN ('Risk Management Director', 'Risk Management Scientist', 'REMS Specialist');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Epidemiology' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Pharmacovigilance' LIMIT 1)
WHERE role_name IN ('Head of Epidemiology', 'Epidemiologist', 'Real-World Evidence Scientist');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Marketing' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Commercial' LIMIT 1)
WHERE role_name IN ('VP Marketing', 'Brand Director', 'Product Manager', 'Marketing Manager', 'Digital Marketing Specialist');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Sales' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Commercial' LIMIT 1)
WHERE role_name IN ('VP Sales', 'National Sales Director', 'Regional Sales Manager', 'Territory Manager');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Market Access' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Commercial' LIMIT 1)
WHERE role_name IN ('Market Access Director', 'Pricing Manager', 'Reimbursement Specialist', 'Payer Relations Manager');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'HEOR' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Commercial' LIMIT 1)
WHERE role_name IN ('HEOR Director', 'Health Economist', 'Outcomes Research Scientist', 'HTA Specialist');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'BD&L' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Business Development' LIMIT 1)
WHERE role_name IN ('Chief Business Officer', 'BD Director', 'Licensing Manager', 'Alliance Manager');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Strategic Planning' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Business Development' LIMIT 1)
WHERE role_name IN ('Strategy Director', 'Strategic Planner', 'Business Analyst');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Legal Affairs' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Legal' LIMIT 1)
WHERE role_name IN ('General Counsel', 'Patent Attorney', 'Regulatory Attorney', 'Contract Manager', 'Compliance Lawyer', 'IP Specialist');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Finance & Accounting' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'Finance' LIMIT 1)
WHERE role_name IN ('CFO', 'Finance Director', 'Controller', 'FP&A Manager', 'Cost Accountant');

UPDATE org_roles 
SET department_id = (SELECT id FROM org_departments WHERE department_name = 'Information Technology' LIMIT 1),
    function_id = (SELECT id FROM org_functions WHERE department_name = 'IT/Digital' LIMIT 1)
WHERE role_name IN ('CIO', 'IT Director', 'System Architect', 'Data Scientist', 'Cybersecurity Specialist', 'Digital Transformation Lead');
`;

    const { data: roleData, error: roleError } = await supabase.rpc('exec_sql', { sql: roleMappingSQL });
    
    if (roleError) {
      console.error('❌ Error executing role mapping SQL:', roleError);
      return;
    }

    console.log('✅ Role-to-department-and-function mappings completed\n');

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
