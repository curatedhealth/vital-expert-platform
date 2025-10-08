const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const SUPABASE_URL = 'https://xazinxsiglqokwfmogyk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Helper function to upload data in smaller batches with retry logic
async function uploadTableDataRobust(tableName, data, batchSize = 10) {
  console.log(`📋 Uploading ${data.length} records to ${tableName} in batches of ${batchSize}...`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const batchNumber = Math.floor(i/batchSize) + 1;
    
    console.log(`📤 Processing batch ${batchNumber}/${Math.ceil(data.length/batchSize)} (${batch.length} records)...`);
    
    // Retry logic
    let retryCount = 0;
    const maxRetries = 3;
    let success = false;
    
    while (retryCount < maxRetries && !success) {
      try {
        const { data: result, error } = await supabase
          .from(tableName)
          .upsert(batch, { onConflict: 'id' });
        
        if (error) {
          console.error(`❌ Batch ${batchNumber} attempt ${retryCount + 1} failed:`, error.message);
          errors.push({ batch: batchNumber, error: error.message, attempt: retryCount + 1 });
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`⏳ Retrying batch ${batchNumber} in 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } else {
          successCount += batch.length;
          console.log(`✅ Batch ${batchNumber}: ${batch.length} records uploaded successfully`);
          success = true;
        }
      } catch (err) {
        console.error(`❌ Batch ${batchNumber} attempt ${retryCount + 1} exception:`, err.message);
        errors.push({ batch: batchNumber, error: err.message, attempt: retryCount + 1 });
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`⏳ Retrying batch ${batchNumber} in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    if (!success) {
      errorCount += batch.length;
      console.error(`❌ Batch ${batchNumber} failed after ${maxRetries} attempts`);
    }
    
    // Small delay between batches to avoid overwhelming the server
    if (i + batchSize < data.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`📊 ${tableName} upload complete: ${successCount} successful, ${errorCount} failed`);
  if (errors.length > 0) {
    console.log(`📋 Error summary:`);
    errors.forEach(err => {
      console.log(`   Batch ${err.batch} (attempt ${err.attempt}): ${err.error}`);
    });
  }
  console.log('');
  
  return { successCount, errorCount, errors };
}

// Function to get existing agent names to avoid duplicates
async function getExistingAgentNames() {
  try {
    const { data: existingAgents, error } = await supabase
      .from('agents')
      .select('name, display_name');
    
    if (error) {
      console.error('❌ Error fetching existing agent names:', error.message);
      return { names: new Set(), displayNames: new Set() };
    }
    
    const names = new Set(existingAgents?.map(a => a.name) || []);
    const displayNames = new Set(existingAgents?.map(a => a.display_name) || []);
    
    console.log(`📋 Found ${names.size} existing agent names and ${displayNames.size} display names`);
    return { names, displayNames };
  } catch (error) {
    console.error('❌ Error getting existing names:', error.message);
    return { names: new Set(), displayNames: new Set() };
  }
}

// Function to make names unique
function makeNamesUnique(name, displayName, existingNames, existingDisplayNames, functionPrefix) {
  let uniqueName = name;
  let uniqueDisplayName = displayName;
  let counter = 1;
  
  // Make name unique
  while (existingNames.has(uniqueName)) {
    uniqueName = `${name}-${functionPrefix}-${counter}`;
    counter++;
  }
  
  // Reset counter for display name
  counter = 1;
  const originalDisplayName = displayName;
  
  // Make display name unique
  while (existingDisplayNames.has(uniqueDisplayName)) {
    uniqueDisplayName = `${originalDisplayName} (${functionPrefix} ${counter})`;
    counter++;
  }
  
  return { uniqueName, uniqueDisplayName };
}

// Function to validate and fix status
function validateStatus(status) {
  const validStatuses = ['active', 'inactive', 'development', 'testing', 'deprecated', 'planned', 'pipeline'];
  if (validStatuses.includes(status)) {
    return status;
  }
  return 'active'; // Default to active if invalid
}

// Function to map business function based on agent data
function mapBusinessFunction(agent) {
  // Map based on business_function field or infer from capabilities
  if (agent.business_function) {
    switch (agent.business_function) {
      case 'regulatory_affairs':
        return 'Digital Health - Regulatory Affairs';
      case 'clinical_operations':
        return 'Digital Health - Clinical Operations';
      case 'clinical_informatics':
        return 'Digital Health - Clinical Informatics';
      case 'product_development':
        return 'Digital Health - Product Development';
      case 'patient_experience':
        return 'Digital Health - Patient Experience';
      case 'legal_compliance':
        return 'Digital Health - Legal Compliance';
      case 'healthcare_it':
        return 'Digital Health - Healthcare IT';
      case 'market_access':
        return 'Digital Health - Market Access';
      case 'information_security':
        return 'Digital Health - Information Security';
      case 'marketing':
        return 'Digital Health - Marketing';
      default:
        return 'Digital Health';
    }
  }
  return 'Digital Health';
}

// Function to process enhanced Digital Health agents
function processEnhancedDigitalHealthAgents(jsonData, existingNames, existingDisplayNames) {
  console.log('📋 Processing enhanced Digital Health agents...');
  
  return jsonData.agents.map(agent => {
    const { uniqueName, uniqueDisplayName } = makeNamesUnique(
      agent.name, 
      agent.display_name, 
      existingNames, 
      existingDisplayNames, 
      'DH-ENH'
    );
    
    // Add to existing sets to avoid duplicates within this batch
    existingNames.add(uniqueName);
    existingDisplayNames.add(uniqueDisplayName);
    
    const businessFunction = mapBusinessFunction(agent);
    
    return {
      id: uuidv4(), // Generate proper UUID
      name: uniqueName,
      display_name: uniqueDisplayName,
      description: agent.description,
      avatar: agent.avatar || '',
      system_prompt: agent.system_prompt,
      model: agent.model || 'claude-sonnet-4-5-20250929',
      tier: agent.tier || 2,
      priority: agent.priority || 2,
      status: validateStatus(agent.status),
      business_function: businessFunction,
      role: agent.role || 'Digital Health Specialist',
      medical_specialty: agent.medical_specialty || null,
      hipaa_compliant: agent.hipaa_compliant !== undefined ? agent.hipaa_compliant : true,
      pharma_enabled: agent.pharma_enabled !== undefined ? agent.pharma_enabled : true,
      verify_enabled: agent.verify_enabled !== undefined ? agent.verify_enabled : true,
      cost_per_query: agent.cost_per_query || 0.05,
      accuracy_score: agent.accuracy_score || 0.92,
      medical_accuracy_score: agent.medical_accuracy_score || 0.88,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
}

async function refineDigitalHealthAgents() {
  try {
    console.log('🚀 DIGITAL HEALTH AGENTS REFINEMENT');
    console.log('======================================================================\n');
    
    // Step 1: Get existing agent names to avoid duplicates
    console.log('📋 Step 1: Fetching existing agent names...');
    const { names: existingNames, displayNames: existingDisplayNames } = await getExistingAgentNames();
    console.log(`✅ Found ${existingNames.size} existing names and ${existingDisplayNames.size} display names\n`);
    
    // Step 2: Load and process enhanced Digital Health agents
    console.log('📋 Step 2: Processing enhanced Digital Health agents...');
    const digitalHealthPath = path.join(__dirname, 'DIGITAL_HEALTH_AGENTS_15 (1).json');
    const digitalHealthData = JSON.parse(fs.readFileSync(digitalHealthPath, 'utf8'));
    
    console.log(`📊 JSON file metadata: ${digitalHealthData.metadata.total_agents} agents expected`);
    console.log(`📊 JSON file actual agents: ${digitalHealthData.agents.length} agents found`);
    
    const enhancedDigitalHealthAgents = processEnhancedDigitalHealthAgents(digitalHealthData, existingNames, existingDisplayNames);
    console.log(`✅ Processed ${enhancedDigitalHealthAgents.length} enhanced Digital Health agents\n`);
    
    // Step 3: Show breakdown by business function
    const businessFunctionBreakdown = enhancedDigitalHealthAgents.reduce((acc, agent) => {
      const bf = agent.business_function;
      acc[bf] = (acc[bf] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Enhanced Digital Health Agents by Business Function:');
    Object.entries(businessFunctionBreakdown).forEach(([bf, count]) => {
      console.log(`   ${bf}: ${count} agents`);
    });
    console.log('');
    
    // Step 4: Upload all agents to Supabase with robust error handling
    console.log('📋 Step 4: Uploading enhanced agents to Supabase Cloud...');
    const uploadResult = await uploadTableDataRobust('agents', enhancedDigitalHealthAgents, 10);
    
    // Step 5: Verify the upload
    console.log('📋 Step 5: Verifying upload...');
    const { data: uploadedAgents, error: verifyError } = await supabase
      .from('agents')
      .select('id, name, display_name, business_function, role, status')
      .like('business_function', 'Digital Health%');
    
    if (verifyError) {
      console.error('❌ Error verifying upload:', verifyError.message);
    } else {
      console.log('✅ Upload verification complete:');
      console.log(`   - Total Digital Health agents: ${uploadedAgents?.length || 0}`);
      
      // Show breakdown by business function
      const uploadedBreakdown = uploadedAgents?.reduce((acc, agent) => {
        const bf = agent.business_function;
        acc[bf] = (acc[bf] || 0) + 1;
        return acc;
      }, {}) || {};
      
      console.log('   - By Business Function:');
      Object.entries(uploadedBreakdown).forEach(([bf, count]) => {
        console.log(`     ${bf}: ${count} agents`);
      });
      console.log('');
    }
    
    // Step 6: Show sample of uploaded agents
    console.log('📋 Step 6: Sample of uploaded agents:');
    const sampleAgents = uploadedAgents?.slice(0, 10) || [];
    sampleAgents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.display_name} (${agent.business_function} - ${agent.role})`);
    });
    
    console.log('\n🎉 DIGITAL HEALTH AGENTS REFINEMENT COMPLETE!');
    console.log('======================================================================');
    console.log(`📊 Final Results:`);
    console.log(`   ✅ Enhanced Digital Health agents processed: ${enhancedDigitalHealthAgents.length}`);
    console.log(`   ✅ Successfully uploaded: ${uploadResult.successCount}`);
    console.log(`   ❌ Failed uploads: ${uploadResult.errorCount}`);
    console.log(`   📈 Success rate: ${((uploadResult.successCount / enhancedDigitalHealthAgents.length) * 100).toFixed(1)}%`);
    
    // Show tier distribution
    const tierDistribution = enhancedDigitalHealthAgents.reduce((acc, agent) => {
      acc[`Tier ${agent.tier}`] = (acc[`Tier ${agent.tier}`] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Tier Distribution:');
    Object.entries(tierDistribution).forEach(([tier, count]) => {
      console.log(`   ${tier}: ${count} agents`);
    });
    
    console.log('\n🚀 Your Digital Health agent registry has been enhanced with premium agents!');
    
  } catch (error) {
    console.error('❌ Refinement failed:', error.message);
    process.exit(1);
  }
}

refineDigitalHealthAgents();
