#!/usr/bin/env node

/**
 * Corrected Enhanced VITAL AI Healthcare Agent Integration Script
 * Fixed enum constraints and schema compatibility issues
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

// Corrected enhanced agents with valid enum values
const enhancedAgents = [
  {
    name: "launch_commander_enhanced",
    display_name: "Launch Commander - Strategic Orchestrator v2.0",
    description: "Master orchestrator for pharmaceutical product launch (L-48 to L+12). Coordinates all launch activities, manages cross-functional alignment, tracks critical milestones, and makes go/no-go decisions.",
    avatar: "🚀",
    color: "#1976D2",
    system_prompt: `YOU ARE: Launch Commander, a strategic orchestration agent for pharmaceutical product launches.
YOU DO: Coordinate all launch activities, manage cross-functional alignment, track critical milestones.
SUCCESS CRITERIA: On-time launch (100%), LPI score >85%, stakeholder alignment >90%.

PROMPT STARTERS:
• Create a comprehensive launch readiness assessment for [PRODUCT] with target launch date [DATE]
• Analyze cross-functional alignment gaps and recommend mitigation strategies for our Q3 launch
• Generate a critical path analysis showing dependencies between regulatory approval and commercial readiness
• What are the top 5 risks threatening our launch timeline and how should we address them?
• Develop a go/no-go decision framework with weighted criteria for the launch committee meeting
• Create a 30-60-90 day post-launch monitoring plan with early warning indicators`,
    model: "gpt-4-turbo-preview",
    temperature: 0.6,
    max_tokens: 8000,
    capabilities: [
      "launch_planning",
      "cross_functional_coordination",
      "risk_management",
      "stakeholder_alignment",
      "performance_tracking"
    ],
    status: "active",
    domain_expertise: "general",
    regulatory_context: {
      is_regulated: true,
      standards: ["GCP", "GMP", "GDP", "GVP"],
      guidelines: ["FDA_launch", "EMA_procedures"]
    },
    metadata: {
      version: "2.0.0",
      enhanced_features: ["prompt_starters", "rag_integration", "advanced_analytics"],
      rag_configuration: {
        global_rags: ["clinical_guidelines", "fda_database", "market_intelligence"],
        specific_rags: {
          launch_playbooks: {
            name: "Launch Excellence Playbooks",
            sources: ["Historical launch post-mortems", "Best practice frameworks"]
          }
        }
      }
    }
  },

  {
    name: "clinical_trial_designer_enhanced",
    display_name: "Clinical Trial Design Specialist v2.0",
    description: "Expert in designing clinical trials for digital health interventions, including protocol development, endpoint selection, statistical planning, and regulatory compliance.",
    avatar: "🔬",
    color: "#00ACC1",
    system_prompt: `You are an expert clinical trial designer specializing in digital health and medical device trials.

PROMPT STARTERS:
• Design a Phase 3 protocol for [INDICATION] with primary endpoint of [ENDPOINT] and target N=[NUMBER]
• Calculate sample size for a superiority trial with 80% power and expected effect size of [DELTA]
• Create inclusion/exclusion criteria for a digital therapeutic trial in [POPULATION]
• Develop an adaptive design strategy with interim analyses at 40% and 70% enrollment
• How can we integrate wearable devices for continuous monitoring in our cardiovascular outcome trial?
• Design a decentralized trial protocol minimizing site visits while maintaining data quality`,
    model: "gpt-4-turbo-preview",
    temperature: 0.5,
    max_tokens: 3000,
    capabilities: [
      "protocol_development",
      "statistical_planning",
      "regulatory_compliance",
      "endpoint_selection",
      "sample_size_calculation"
    ],
    status: "active",
    domain_expertise: "general",
    regulatory_context: {
      is_regulated: true,
      standards: ["GCP", "ICH"],
      guidelines: ["FDA_guidance", "EMA_guidance"]
    },
    metadata: {
      version: "2.0.0",
      enhanced_features: ["prompt_starters", "rag_integration"],
      rag_configuration: {
        global_rags: ["clinical_guidelines", "fda_database"],
        specific_rags: {
          trial_designs: {
            name: "Clinical Trial Design Database",
            sources: ["Protocol templates", "Statistical methods"]
          }
        }
      }
    }
  },

  {
    name: "fda_regulatory_strategist_enhanced",
    display_name: "FDA Regulatory Strategy Expert v2.0",
    description: "Expert in FDA regulations, device classifications, and submission strategies for medical devices and digital therapeutics.",
    avatar: "⚖️",
    color: "#388E3C",
    system_prompt: `You are an FDA regulatory strategy expert specializing in medical devices and digital therapeutics.

PROMPT STARTERS:
• What is the optimal FDA pathway for our [DEVICE TYPE] targeting [INDICATION]?
• Analyze the regulatory requirements for a Class II device with AI/ML components
• Create a 510(k) submission timeline with key milestones and deliverables
• How should we approach FDA for a novel digital therapeutic with no predicate device?
• What clinical evidence is required for our De Novo pathway submission?
• Generate a pre-submission strategy for our breakthrough device designation request`,
    model: "gpt-4-turbo-preview",
    temperature: 0.4,
    max_tokens: 3000,
    capabilities: [
      "regulatory_strategy",
      "fda_pathway_selection",
      "submission_planning",
      "device_classification",
      "clinical_evidence_planning"
    ],
    status: "active",
    domain_expertise: "general",
    regulatory_context: {
      is_regulated: true,
      standards: ["FDA_QSR", "ISO_13485"],
      guidelines: ["FDA_guidance", "QSR"]
    },
    metadata: {
      version: "2.0.0",
      enhanced_features: ["prompt_starters", "rag_integration"],
      rag_configuration: {
        global_rags: ["fda_database", "regulatory_guidelines"],
        specific_rags: {
          fda_guidance: {
            name: "FDA Guidance Documents",
            sources: ["FDA guidance library", "Device classification database"]
          }
        }
      }
    }
  },

  {
    name: "medical_writing_specialist_enhanced",
    display_name: "Medical Writing Specialist v2.0",
    description: "Expert in creating regulatory documents, clinical protocols, and scientific communications for healthcare and pharmaceutical contexts.",
    avatar: "✍️",
    color: "#7B1FA2",
    system_prompt: `You are a medical writing specialist with expertise in regulatory documents and scientific communications.

PROMPT STARTERS:
• Create a clinical study protocol synopsis for a [STUDY TYPE] in [INDICATION]
• Write an investigator's brochure section on [DRUG/DEVICE] safety profile
• Generate a regulatory submission cover letter for our [SUBMISSION TYPE]
• Develop a clinical summary for efficacy data showing [ENDPOINT] improvement
• Create a risk management plan outline for our new medical device
• Write a scientific abstract for our Phase 3 trial results in [INDICATION]`,
    model: "gpt-4-turbo-preview",
    temperature: 0.3,
    max_tokens: 4000,
    capabilities: [
      "regulatory_writing",
      "clinical_documentation",
      "scientific_communication",
      "protocol_writing",
      "submission_writing"
    ],
    status: "active",
    domain_expertise: "general",
    regulatory_context: {
      is_regulated: true,
      standards: ["ICH_guidelines", "FDA_guidance"],
      guidelines: ["Medical_writing_standards"]
    },
    metadata: {
      version: "2.0.0",
      enhanced_features: ["prompt_starters", "rag_integration"],
      rag_configuration: {
        global_rags: ["medical_literature", "regulatory_guidelines"],
        specific_rags: {
          writing_templates: {
            name: "Medical Writing Templates",
            sources: ["Document templates", "Style guides"]
          }
        }
      }
    }
  },

  {
    name: "strategic_intelligence_enhanced",
    display_name: "Strategic Intelligence Agent v2.0",
    description: "Advanced competitive intelligence and strategic analysis agent for pharmaceutical and healthcare markets.",
    avatar: "🎯",
    color: "#FF5722",
    system_prompt: `You are a strategic intelligence agent specializing in pharmaceutical competitive analysis and market intelligence.

PROMPT STARTERS:
• Analyze the competitive landscape for [THERAPEUTIC AREA] and identify key threats/opportunities
• Create a competitor profiling report for [COMPANY] including pipeline, partnerships, and market position
• What are the emerging trends in [THERAPY AREA] that could impact our 5-year strategy?
• Generate a market entry strategy for [PRODUCT] considering current competitive dynamics
• Assess the strategic implications of [COMPETITOR]'s recent [ACQUISITION/PARTNERSHIP/LAUNCH]
• Create a threat assessment for our lead asset based on competitor pipeline analysis`,
    model: "gpt-4-turbo-preview",
    temperature: 0.4,
    max_tokens: 3500,
    capabilities: [
      "competitive_analysis",
      "market_intelligence",
      "strategic_planning",
      "threat_assessment",
      "opportunity_identification"
    ],
    status: "active",
    domain_expertise: "general",
    regulatory_context: {
      is_regulated: false,
      considerations: ["antitrust", "sec_disclosure"],
      compliance: ["competition_law"]
    },
    metadata: {
      version: "2.0.0",
      enhanced_features: ["prompt_starters", "rag_integration"],
      rag_configuration: {
        global_rags: ["market_intelligence", "competitor_database"],
        specific_rags: {
          competitor_tracking: {
            name: "Competitor Intelligence Database",
            sources: ["SEC filings", "Clinical trial registries", "Patent databases"]
          }
        }
      }
    }
  }
];

async function loadEnhancedAgents() {
  let loadedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  console.log('🚀 Loading corrected enhanced VITAL AI agents...');
  console.log(`📊 Processing ${enhancedAgents.length} agents...`);

  for (const agent of enhancedAgents) {
    try {
      console.log(`\n🤖 Processing: ${agent.display_name}`);

      // Check if agent exists
      const { data: existing, error: checkError } = await supabase
        .from('agents')
        .select('id, name')
        .eq('name', agent.name);

      if (checkError) {
        throw checkError;
      }

      if (existing.length > 0) {
        // Update existing agent
        console.log(`  ↻ Updating existing agent...`);
        const { data, error } = await supabase
          .from('agents')
          .update(agent)
          .eq('name', agent.name)
          .select('display_name');

        if (error) {
          throw error;
        }

        updatedCount++;
        console.log(`  ✅ Updated: ${data[0]?.display_name}`);
      } else {
        // Create new agent
        console.log(`  ➕ Creating new agent...`);
        const { data, error } = await supabase
          .from('agents')
          .insert([agent])
          .select('display_name');

        if (error) {
          throw error;
        }

        loadedCount++;
        console.log(`  ✅ Created: ${data[0]?.display_name}`);
      }

    } catch (error) {
      errorCount++;
      console.error(`  ❌ Failed to process ${agent.name}:`, error.message);
    }
  }

  // Final verification
  console.log('\n🔍 Verifying agents in database...');
  const { data: allAgents, error: verifyError } = await supabase
    .from('agents')
    .select('name, display_name, status')
    .in('name', enhancedAgents.map(a => a.name));

  if (verifyError) {
    console.error('❌ Verification failed:', verifyError);
  } else {
    console.log(`✅ Found ${allAgents.length} enhanced agents in database:`);
    allAgents.forEach(agent => {
      console.log(`  - ${agent.name}: ${agent.display_name} (${agent.status})`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 FINAL REPORT');
  console.log('='.repeat(80));
  console.log(`✅ Agents Created: ${loadedCount}`);
  console.log(`↻ Agents Updated: ${updatedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📈 Total Processed: ${loadedCount + updatedCount}`);
  console.log('='.repeat(80));

  if (errorCount === 0) {
    console.log('🎉 SUCCESS: All enhanced agents loaded successfully!');
  } else {
    console.log('⚠️ PARTIAL SUCCESS: Some agents had issues');
  }
}

loadEnhancedAgents().catch(console.error);