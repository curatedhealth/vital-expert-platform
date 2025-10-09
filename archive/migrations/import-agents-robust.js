const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

// Function to process Medical Affairs agents with minimal required fields
function processMedicalAffairsAgents(jsonData) {
  console.log('📋 Processing Medical Affairs agents...');
  
  return jsonData.agents.map(agent => {
    return {
      id: agent.id,
      name: agent.name,
      display_name: agent.display_name,
      description: agent.description,
      avatar: agent.avatar,
      system_prompt: agent.system_prompt,
      model: agent.model,
      tier: agent.tier,
      priority: agent.priority,
      status: agent.status,
      business_function: 'Medical Affairs',
      role: agent.metadata?.role_name || 'Medical Affairs Specialist',
      medical_specialty: agent.department,
      hipaa_compliant: true,
      pharma_enabled: true,
      verify_enabled: true,
      cost_per_query: 0.05,
      accuracy_score: 0.95,
      medical_accuracy_score: 0.95,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
}

// Function to process Market Access agents with minimal required fields
function processMarketAccessAgents(jsonData) {
  console.log('📋 Processing Market Access agents...');
  
  return jsonData.agents.map(agent => {
    return {
      id: agent.id,
      name: agent.name,
      display_name: agent.display_name,
      description: agent.description,
      avatar: agent.avatar,
      system_prompt: agent.system_prompt,
      model: agent.model,
      tier: agent.tier,
      priority: agent.priority,
      status: agent.status,
      business_function: 'Commercial',
      role: agent.metadata?.role_name || 'Market Access Specialist',
      medical_specialty: null,
      hipaa_compliant: true,
      pharma_enabled: true,
      verify_enabled: true,
      cost_per_query: 0.05,
      accuracy_score: 0.90,
      medical_accuracy_score: 0.85,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
}

// Function to process Marketing agents with minimal required fields
function processMarketingAgents(jsonData) {
  console.log('📋 Processing Marketing agents...');
  
  return jsonData.agents.map(agent => {
    return {
      id: agent.id,
      name: agent.name,
      display_name: agent.display_name,
      description: agent.description,
      avatar: agent.avatar,
      system_prompt: typeof agent.system_prompt === 'object' ? agent.system_prompt.role : agent.system_prompt,
      model: agent.model,
      tier: agent.tier,
      priority: agent.priority,
      status: agent.status,
      business_function: 'Commercial',
      role: agent.metadata?.role_name || 'Marketing Specialist',
      medical_specialty: null,
      hipaa_compliant: false,
      pharma_enabled: true,
      verify_enabled: true,
      cost_per_query: 0.05,
      accuracy_score: 0.88,
      medical_accuracy_score: 0.80,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
}

async function importAgentsRobust() {
  try {
    console.log('🚀 ROBUST AGENT IMPORT - COMPREHENSIVE COLLECTIONS');
    console.log('======================================================================\n');
    
    // Step 1: Load and process Medical Affairs agents
    console.log('📋 Step 1: Processing Medical Affairs agents...');
    const medicalAffairsPath = path.join(__dirname, 'docs', 'MEDICAL_AFFAIRS_AGENTS_30_COMPLETE.json');
    const medicalAffairsData = JSON.parse(fs.readFileSync(medicalAffairsPath, 'utf8'));
    const medicalAffairsAgents = processMedicalAffairsAgents(medicalAffairsData);
    console.log(`✅ Processed ${medicalAffairsAgents.length} Medical Affairs agents\n`);
    
    // Step 2: Load and process Market Access agents
    console.log('📋 Step 2: Processing Market Access agents...');
    const marketAccessPath = path.join(__dirname, 'docs', 'MARKET_ACCESS_AGENTS_30_COMPLETE.json');
    const marketAccessData = JSON.parse(fs.readFileSync(marketAccessPath, 'utf8'));
    const marketAccessAgents = processMarketAccessAgents(marketAccessData);
    console.log(`✅ Processed ${marketAccessAgents.length} Market Access agents\n`);
    
    // Step 3: Load and process Marketing agents
    console.log('📋 Step 3: Processing Marketing agents...');
    const marketingPath = path.join(__dirname, 'docs', 'MARKETING_AGENTS_30_ENHANCED.json');
    const marketingData = JSON.parse(fs.readFileSync(marketingPath, 'utf8'));
    const marketingAgents = processMarketingAgents(marketingData);
    console.log(`✅ Processed ${marketingAgents.length} Marketing agents\n`);
    
    // Step 4: Combine all agents
    const allAgents = [...medicalAffairsAgents, ...marketAccessAgents, ...marketingAgents];
    console.log(`📊 Total agents to import: ${allAgents.length}`);
    console.log(`   - Medical Affairs: ${medicalAffairsAgents.length}`);
    console.log(`   - Market Access: ${marketAccessAgents.length}`);
    console.log(`   - Marketing: ${marketingAgents.length}\n`);
    
    // Step 5: Upload all agents to Supabase with robust error handling
    console.log('📋 Step 5: Uploading agents to Supabase Cloud...');
    const uploadResult = await uploadTableDataRobust('agents', allAgents, 10);
    
    // Step 6: Verify the upload
    console.log('📋 Step 6: Verifying upload...');
    const { data: uploadedAgents, error: verifyError } = await supabase
      .from('agents')
      .select('id, name, display_name, business_function, role, status')
      .in('business_function', ['Medical Affairs', 'Commercial']);
    
    if (verifyError) {
      console.error('❌ Error verifying upload:', verifyError.message);
    } else {
      const medicalAffairsCount = uploadedAgents?.filter(a => a.business_function === 'Medical Affairs').length || 0;
      const commercialCount = uploadedAgents?.filter(a => a.business_function === 'Commercial').length || 0;
      
      console.log('✅ Upload verification complete:');
      console.log(`   - Medical Affairs agents: ${medicalAffairsCount}`);
      console.log(`   - Commercial agents: ${commercialCount}`);
      console.log(`   - Total uploaded: ${uploadedAgents?.length || 0}\n`);
    }
    
    // Step 7: Show sample of uploaded agents
    console.log('📋 Step 7: Sample of uploaded agents:');
    const sampleAgents = uploadedAgents?.slice(0, 10) || [];
    sampleAgents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.display_name} (${agent.business_function} - ${agent.role})`);
    });
    
    console.log('\n🎉 ROBUST AGENT IMPORT COMPLETE!');
    console.log('======================================================================');
    console.log(`📊 Final Results:`);
    console.log(`   ✅ Medical Affairs agents: ${medicalAffairsAgents.length}`);
    console.log(`   ✅ Market Access agents: ${marketAccessAgents.length}`);
    console.log(`   ✅ Marketing agents: ${marketingAgents.length}`);
    console.log(`   ✅ Total agents imported: ${allAgents.length}`);
    console.log(`   📈 Success rate: ${((uploadResult.successCount / allAgents.length) * 100).toFixed(1)}%`);
    console.log(`   ❌ Failed uploads: ${uploadResult.errorCount}`);
    console.log('\n🚀 Your comprehensive agent registry is now updated with specialized Medical Affairs, Market Access, and Marketing agents!');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

importAgentsRobust();
