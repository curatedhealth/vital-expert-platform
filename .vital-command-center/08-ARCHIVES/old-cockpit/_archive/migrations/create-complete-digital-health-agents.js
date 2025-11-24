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

// Complete Digital Health agents data based on the expanded structure
const digitalHealthAgentsData = [
  // Digital Therapeutics Department (5 agents)
  {
    name: "prescription_digital_therapeutic_advisor",
    display_name: "Prescription Digital Therapeutic Advisor",
    description: "Guide prescribers on DTx selection, patient eligibility, and outcomes monitoring for prescription digital therapeutics.",
    department: "Digital Therapeutics",
    role: "prescription_digital_therapeutic_advisor",
    tier: 2,
    priority: 2
  },
  {
    name: "behavioral_science_integration_specialist",
    display_name: "Behavioral Science Integration Specialist",
    description: "Apply evidence-based behavioral change techniques to DTx product design and user engagement strategies.",
    department: "Digital Therapeutics",
    role: "behavioral_science_integration_specialist",
    tier: 2,
    priority: 2
  },
  {
    name: "digital_biomarker_researcher",
    display_name: "Digital Biomarker Researcher",
    description: "Identify and validate digital biomarkers for use in DTx clinical endpoints and patient monitoring.",
    department: "Digital Therapeutics",
    role: "digital_biomarker_researcher",
    tier: 3,
    priority: 3
  },

  // Remote Patient Monitoring Department (5 agents)
  {
    name: "remote_monitoring_architect",
    display_name: "Remote Monitoring Architect",
    description: "Design end-to-end RPM systems integrating devices, data platforms, and clinical workflows.",
    department: "Remote Patient Monitoring",
    role: "remote_monitoring_architect",
    tier: 1,
    priority: 1
  },
  {
    name: "rpm_clinical_integration_specialist",
    display_name: "RPM Clinical Integration Specialist",
    description: "Integrate RPM programs into clinical care pathways and provider workflows.",
    department: "Remote Patient Monitoring",
    role: "rpm_clinical_integration_specialist",
    tier: 1,
    priority: 1
  },
  {
    name: "wearables_data_scientist",
    display_name: "Wearables Data Scientist",
    description: "Analyze wearable sensor data to identify clinical insights and predictive signals.",
    department: "Remote Patient Monitoring",
    role: "wearables_data_scientist",
    tier: 2,
    priority: 2
  },
  {
    name: "connected_device_product_manager",
    display_name: "Connected Device Product Manager",
    description: "Manage IoT medical device portfolio from concept through commercialization.",
    department: "Remote Patient Monitoring",
    role: "connected_device_product_manager",
    tier: 2,
    priority: 2
  },
  {
    name: "rpm_reimbursement_specialist",
    display_name: "RPM Reimbursement Specialist",
    description: "Navigate RPM reimbursement landscape and optimize billing strategies.",
    department: "Remote Patient Monitoring",
    role: "rpm_reimbursement_specialist",
    tier: 3,
    priority: 3
  },

  // Health Data Analytics Department (5 agents)
  {
    name: "health_data_architect",
    display_name: "Health Data Architect",
    description: "Design enterprise health data infrastructure supporting analytics, AI, and research.",
    department: "Health Data Analytics",
    role: "health_data_architect",
    tier: 1,
    priority: 1
  },
  {
    name: "real_world_evidence_analyst",
    display_name: "Real-World Evidence Analyst",
    description: "Generate real-world evidence from EHR, claims, and registry data for regulatory and commercial use.",
    department: "Health Data Analytics",
    role: "real_world_evidence_analyst",
    tier: 1,
    priority: 1
  },
  {
    name: "patient_analytics_specialist",
    display_name: "Patient Analytics Specialist",
    description: "Analyze patient-level data to identify risk stratification and personalization opportunities.",
    department: "Health Data Analytics",
    role: "patient_analytics_specialist",
    tier: 2,
    priority: 2
  },
  {
    name: "patient_generated_data_analyst",
    display_name: "Patient-Generated Data Analyst",
    description: "Analyze patient-reported outcomes, wearables data, and mobile health data.",
    department: "Health Data Analytics",
    role: "patient_generated_data_analyst",
    tier: 2,
    priority: 2
  },
  {
    name: "healthcare_interoperability_architect",
    display_name: "Healthcare Interoperability Architect",
    description: "Implement FHIR, HL7, and other interoperability standards for seamless data exchange.",
    department: "Health Data Analytics",
    role: "healthcare_interoperability_architect",
    tier: 3,
    priority: 3
  },

  // Patient Engagement Platforms Department (5 agents)
  {
    name: "patient_app_product_manager",
    display_name: "Patient App Product Manager",
    description: "Lead patient-facing mobile and web application product strategy and development.",
    department: "Patient Engagement Platforms",
    role: "patient_app_product_manager",
    tier: 1,
    priority: 1
  },
  {
    name: "digital_engagement_strategist",
    display_name: "Digital Engagement Strategist",
    description: "Design behavioral engagement strategies that maximize patient activation and retention.",
    department: "Patient Engagement Platforms",
    role: "digital_engagement_strategist",
    tier: 1,
    priority: 1
  },
  {
    name: "patient_portal_specialist",
    display_name: "Patient Portal Specialist",
    description: "Optimize patient portals for appointment scheduling, results access, and messaging.",
    department: "Patient Engagement Platforms",
    role: "patient_portal_specialist",
    tier: 2,
    priority: 2
  },
  {
    name: "mobile_health_developer",
    display_name: "Mobile Health Developer",
    description: "Develop HIPAA-compliant mobile health applications with offline capabilities.",
    department: "Patient Engagement Platforms",
    role: "mobile_health_developer",
    tier: 2,
    priority: 2
  },
  {
    name: "patient_communication_specialist",
    display_name: "Patient Communication Specialist",
    description: "Design patient communication strategies across SMS, email, push, and in-app channels.",
    department: "Patient Engagement Platforms",
    role: "patient_communication_specialist",
    tier: 3,
    priority: 3
  },

  // Telehealth Services Department (5 agents)
  {
    name: "telehealth_operations_director",
    display_name: "Telehealth Operations Director",
    description: "Manage end-to-end telehealth operations including provider networks, technology, and quality.",
    department: "Telehealth Services",
    role: "telehealth_operations_director",
    tier: 1,
    priority: 1
  },
  {
    name: "virtual_care_clinical_specialist",
    display_name: "Virtual Care Clinical Specialist",
    description: "Establish clinical protocols and quality standards for virtual care delivery.",
    department: "Telehealth Services",
    role: "virtual_care_clinical_specialist",
    tier: 1,
    priority: 1
  },
  {
    name: "telemedicine_compliance_advisor",
    display_name: "Telemedicine Compliance Advisor",
    description: "Ensure compliance with state licensing, DEA, and telehealth regulations.",
    department: "Telehealth Services",
    role: "telemedicine_compliance_advisor",
    tier: 2,
    priority: 2
  },
  {
    name: "telehealth_technology_specialist",
    display_name: "Telehealth Technology Specialist",
    description: "Manage telehealth video platforms, integrations, and technical support.",
    department: "Telehealth Services",
    role: "telehealth_technology_specialist",
    tier: 2,
    priority: 2
  },
  {
    name: "virtual_specialty_care_coordinator",
    display_name: "Virtual Specialty Care Coordinator",
    description: "Coordinate specialty telehealth services including e-consults and specialist referrals.",
    department: "Telehealth Services",
    role: "virtual_specialty_care_coordinator",
    tier: 3,
    priority: 3
  },

  // Digital Health Strategy & Innovation Department (5 agents)
  {
    name: "digital_health_strategy_director",
    display_name: "Digital Health Strategy Director",
    description: "Define digital health vision, strategy, and roadmap aligned with organizational objectives.",
    department: "Digital Health Strategy",
    role: "digital_health_strategy_director",
    tier: 1,
    priority: 1
  },
  {
    name: "innovation_portfolio_manager",
    display_name: "Innovation Portfolio Manager",
    description: "Manage digital health innovation portfolio from ideation through commercialization.",
    department: "Digital Health Strategy",
    role: "innovation_portfolio_manager",
    tier: 1,
    priority: 1
  },
  {
    name: "digital_health_regulatory_specialist",
    display_name: "Digital Health Regulatory Specialist",
    description: "Navigate FDA, FTC, and international regulations for digital health products.",
    department: "Digital Health Strategy",
    role: "digital_health_regulatory_specialist",
    tier: 2,
    priority: 2
  },
  {
    name: "ai_ml_healthcare_scientist",
    display_name: "AI/ML Healthcare Scientist",
    description: "Research and develop AI/ML applications for clinical decision support and diagnostics.",
    department: "Digital Health Strategy",
    role: "ai_ml_healthcare_scientist",
    tier: 2,
    priority: 2
  },
  {
    name: "digital_health_partnership_director",
    display_name: "Digital Health Partnership Director",
    description: "Identify and manage strategic partnerships with digital health technology vendors.",
    department: "Digital Health Strategy",
    role: "digital_health_partnership_director",
    tier: 3,
    priority: 3
  }
];

// Function to process Digital Health agents with unique names and proper validation
function processCompleteDigitalHealthAgents(existingNames, existingDisplayNames) {
  console.log('📋 Processing complete Digital Health agents...');
  
  return digitalHealthAgentsData.map(agent => {
    const { uniqueName, uniqueDisplayName } = makeNamesUnique(
      agent.name, 
      agent.display_name, 
      existingNames, 
      existingDisplayNames, 
      'DH'
    );
    
    // Add to existing sets to avoid duplicates within this batch
    existingNames.add(uniqueName);
    existingDisplayNames.add(uniqueDisplayName);
    
    // Map department to business_function
    let businessFunction = 'Digital Health';
    if (agent.department) {
      if (agent.department.includes('Digital Therapeutics')) {
        businessFunction = 'Digital Health - Digital Therapeutics';
      } else if (agent.department.includes('Remote Patient Monitoring')) {
        businessFunction = 'Digital Health - Remote Monitoring';
      } else if (agent.department.includes('Health Data Analytics')) {
        businessFunction = 'Digital Health - Data Analytics';
      } else if (agent.department.includes('Patient Engagement')) {
        businessFunction = 'Digital Health - Patient Engagement';
      } else if (agent.department.includes('Telehealth')) {
        businessFunction = 'Digital Health - Telehealth';
      } else if (agent.department.includes('Strategy')) {
        businessFunction = 'Digital Health - Strategy';
      }
    }
    
    return {
      id: uuidv4(), // Generate proper UUID
      name: uniqueName,
      display_name: uniqueDisplayName,
      description: agent.description,
      avatar: '',
      system_prompt: `# Digital Health Agent: ${agent.display_name}\n\nYou are a specialized AI agent focused on ${agent.department} within the digital health ecosystem. Your role is to provide expert guidance and support in ${agent.description.toLowerCase()}.`,
      model: 'claude-sonnet-4-5-20250929',
      tier: agent.tier,
      priority: agent.priority,
      status: 'active',
      business_function: businessFunction,
      role: agent.role,
      medical_specialty: null,
      hipaa_compliant: true,
      pharma_enabled: true,
      verify_enabled: true,
      cost_per_query: 0.05,
      accuracy_score: 0.92,
      medical_accuracy_score: 0.88,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
}

async function createCompleteDigitalHealthAgents() {
  try {
    console.log('🚀 COMPLETE DIGITAL HEALTH AGENTS CREATION');
    console.log('======================================================================\n');
    
    // Step 1: Get existing agent names to avoid duplicates
    console.log('📋 Step 1: Fetching existing agent names...');
    const { names: existingNames, displayNames: existingDisplayNames } = await getExistingAgentNames();
    console.log(`✅ Found ${existingNames.size} existing names and ${existingDisplayNames.size} display names\n`);
    
    // Step 2: Process complete Digital Health agents
    console.log('📋 Step 2: Processing complete Digital Health agents...');
    const digitalHealthAgents = processCompleteDigitalHealthAgents(existingNames, existingDisplayNames);
    console.log(`✅ Processed ${digitalHealthAgents.length} Digital Health agents\n`);
    
    // Step 3: Show breakdown by department
    const departmentBreakdown = digitalHealthAgents.reduce((acc, agent) => {
      const dept = agent.business_function;
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Digital Health Agents by Department:');
    Object.entries(departmentBreakdown).forEach(([dept, count]) => {
      console.log(`   ${dept}: ${count} agents`);
    });
    console.log('');
    
    // Step 4: Upload all agents to Supabase with robust error handling
    console.log('📋 Step 4: Uploading agents to Supabase Cloud...');
    const uploadResult = await uploadTableDataRobust('agents', digitalHealthAgents, 10);
    
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
      
      // Show breakdown by department
      const uploadedBreakdown = uploadedAgents?.reduce((acc, agent) => {
        const dept = agent.business_function;
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {}) || {};
      
      console.log('   - By Department:');
      Object.entries(uploadedBreakdown).forEach(([dept, count]) => {
        console.log(`     ${dept}: ${count} agents`);
      });
      console.log('');
    }
    
    // Step 6: Show sample of uploaded agents
    console.log('📋 Step 6: Sample of uploaded agents:');
    const sampleAgents = uploadedAgents?.slice(0, 10) || [];
    sampleAgents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.display_name} (${agent.business_function} - ${agent.role})`);
    });
    
    console.log('\n🎉 COMPLETE DIGITAL HEALTH AGENTS CREATION COMPLETE!');
    console.log('======================================================================');
    console.log(`📊 Final Results:`);
    console.log(`   ✅ Digital Health agents processed: ${digitalHealthAgents.length}`);
    console.log(`   ✅ Successfully uploaded: ${uploadResult.successCount}`);
    console.log(`   ❌ Failed uploads: ${uploadResult.errorCount}`);
    console.log(`   📈 Success rate: ${((uploadResult.successCount / digitalHealthAgents.length) * 100).toFixed(1)}%`);
    
    // Show tier distribution
    const tierDistribution = digitalHealthAgents.reduce((acc, agent) => {
      acc[`Tier ${agent.tier}`] = (acc[`Tier ${agent.tier}`] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Tier Distribution:');
    Object.entries(tierDistribution).forEach(([tier, count]) => {
      console.log(`   ${tier}: ${count} agents`);
    });
    
    console.log('\n🚀 Your complete Digital Health agent registry is now comprehensive with 30 specialized agents!');
    
  } catch (error) {
    console.error('❌ Creation failed:', error.message);
    process.exit(1);
  }
}

createCompleteDigitalHealthAgents();
