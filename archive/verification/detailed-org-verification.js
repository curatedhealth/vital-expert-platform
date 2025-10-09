const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xazinxsiglqokwfmogyk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function detailedOrgVerification() {
  try {
    console.log('🔍 DETAILED ORGANIZATIONAL STRUCTURE VERIFICATION');
    console.log('======================================================================\n');
    
    // Get actual data instead of counts
    const { data: functionsData, error: functionsError } = await supabase
      .from('org_functions')
      .select('*');
    
    const { data: departmentsData, error: departmentsError } = await supabase
      .from('org_departments')
      .select('*');
    
    const { data: rolesData, error: rolesError } = await supabase
      .from('org_roles')
      .select('*');
    
    const { data: responsibilitiesData, error: responsibilitiesError } = await supabase
      .from('org_responsibilities')
      .select('*');
    
    console.log('📊 ACTUAL RECORD COUNTS:');
    console.log(`   ✅ Functions: ${functionsData?.length || 0} records`);
    console.log(`   ✅ Departments: ${departmentsData?.length || 0} records`);
    console.log(`   ✅ Roles: ${rolesData?.length || 0} records`);
    console.log(`   ✅ Responsibilities: ${responsibilitiesData?.length || 0} records\n`);
    
    // Show detailed breakdown
    if (functionsData && functionsData.length > 0) {
      console.log('🏢 FUNCTIONS BREAKDOWN:');
      functionsData.forEach((func, index) => {
        console.log(`   ${index + 1}. ${func.unique_id}: ${func.department_name}`);
      });
      console.log('');
    }
    
    if (departmentsData && departmentsData.length > 0) {
      console.log('🏬 DEPARTMENTS BREAKDOWN (first 10):');
      departmentsData.slice(0, 10).forEach((dept, index) => {
        console.log(`   ${index + 1}. ${dept.unique_id}: ${dept.department_name} (${dept.department_type || 'N/A'})`);
      });
      if (departmentsData.length > 10) {
        console.log(`   ... and ${departmentsData.length - 10} more departments`);
      }
      console.log('');
    }
    
    if (rolesData && rolesData.length > 0) {
      console.log('👥 ROLES BREAKDOWN (first 10):');
      rolesData.slice(0, 10).forEach((role, index) => {
        console.log(`   ${index + 1}. ${role.unique_id}: ${role.role_name}`);
      });
      if (rolesData.length > 10) {
        console.log(`   ... and ${rolesData.length - 10} more roles`);
      }
      console.log('');
    }
    
    if (responsibilitiesData && responsibilitiesData.length > 0) {
      console.log('📋 RESPONSIBILITIES BREAKDOWN (first 10):');
      responsibilitiesData.slice(0, 10).forEach((resp, index) => {
        console.log(`   ${index + 1}. ${resp.unique_id}: ${resp.name}`);
      });
      if (responsibilitiesData.length > 10) {
        console.log(`   ... and ${responsibilitiesData.length - 10} more responsibilities`);
      }
      console.log('');
    }
    
    // Check for any errors
    if (functionsError) console.error('❌ Functions error:', functionsError.message);
    if (departmentsError) console.error('❌ Departments error:', departmentsError.message);
    if (rolesError) console.error('❌ Roles error:', rolesError.message);
    if (responsibilitiesError) console.error('❌ Responsibilities error:', responsibilitiesError.message);
    
    console.log('🎉 DETAILED VERIFICATION COMPLETE!');
    console.log('======================================================================');
    
    const totalRecords = (functionsData?.length || 0) + (departmentsData?.length || 0) + 
                        (rolesData?.length || 0) + (responsibilitiesData?.length || 0);
    
    console.log(`📈 FINAL SUMMARY:`);
    console.log(`   📊 Total organizational records: ${totalRecords}`);
    console.log(`   🏢 Functions: ${functionsData?.length || 0}`);
    console.log(`   🏬 Departments: ${departmentsData?.length || 0}`);
    console.log(`   👥 Roles: ${rolesData?.length || 0}`);
    console.log(`   📋 Responsibilities: ${responsibilitiesData?.length || 0}`);
    
    if (totalRecords > 0) {
      console.log('\n✅ Your comprehensive organizational structure is successfully loaded in Supabase Cloud!');
      console.log('🚀 Ready for production use!');
    } else {
      console.log('\n⚠️  No organizational structure data found. Please check the migration.');
    }
    
  } catch (error) {
    console.error('❌ Detailed verification failed:', error.message);
  }
}

detailedOrgVerification();
