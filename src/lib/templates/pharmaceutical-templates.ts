import { WorkflowTemplate, EnhancedWorkflowDefinition } from '@/types/workflow-enhanced';

/**
 * Comprehensive pharmaceutical workflow templates for regulatory, clinical, and market access processes
 */

export const pharmaceuticalTemplates: WorkflowTemplate[] = [
  {
    id: 'template-fda-510k',
    name: 'FDA 510(k) Submission Workflow',
    description: 'Complete workflow for FDA medical device submission including predicate analysis, clinical evidence compilation, and submission preparation',
    category: 'Regulatory',
    industry_tags: ['FDA', 'Medical Devices', '510k', 'Regulatory Submission', 'Predicate Analysis'],
    complexity_level: 'High',
    estimated_duration: 240, // 4 hours
    template_data: {
      id: 'fda-510k-workflow',
      name: 'FDA 510(k) Submission',
      description: 'Comprehensive FDA 510(k) submission preparation workflow for medical devices',
      version: '1.0',
      category: 'Regulatory',
      steps: [
        {
          id: 1,
          jtbd_id: 'fda-510k-workflow',
          step_number: 1,
          step_name: 'Regulatory Gap Analysis',
          step_description: 'Conduct comprehensive analysis of FDA regulatory requirements and identify gaps in current documentation. Review FDA guidance documents, quality system regulations, and product-specific requirements.',
          estimated_duration: 45,
          required_capabilities: ['regulatory_analysis', 'fda_expertise', 'gap_analysis', 'compliance_analysis'],
          agent_selection: {
            strategy: 'capability_based',
            criteria: {
              required_capabilities: ['regulatory_analysis', 'fda_expertise'],
              minimum_tier: 1,
              specializations: ['FDA', '510k', 'Medical Devices']
            }
          },
          validation_rules: [
            {
              field: 'device_description',
              rule: 'required',
              value: null,
              message: 'Device description is required for gap analysis',
              severity: 'error'
            }
          ],
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 100, y: 100 },
          monitoring_config: {
            track_performance: true,
            alert_on_failure: true,
            quality_thresholds: {
              min_confidence: 0.8
            }
          }
        },
        {
          id: 2,
          jtbd_id: 'fda-510k-workflow',
          step_number: 2,
          step_name: 'Predicate Device Analysis',
          step_description: 'Identify and analyze predicate devices for substantial equivalence demonstration. Search FDA databases, analyze predicate device characteristics, and create comparison tables.',
          estimated_duration: 60,
          required_capabilities: ['predicate_analysis', 'fda_database_search', 'device_comparison', 'regulatory_research'],
          agent_selection: {
            strategy: 'automatic',
            criteria: {
              required_capabilities: ['predicate_analysis'],
              minimum_performance_score: 0.7,
              specializations: ['510k', 'Predicate Analysis']
            }
          },
          conditional_next: [
            {
              condition: 'output.predicates && output.predicates.length > 0',
              next_step_id: '5',
              priority: 1
            },
            {
              condition: 'output.predicates && output.predicates.length === 0',
              next_step_id: '3',
              priority: 2
            }
          ],
          retry_config: {
            max_retries: 2,
            retry_delay_ms: 5000,
            exponential_backoff: true,
            retry_on_errors: ['timeout', 'database_error']
          },
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 300, y: 100 }
        },
        {
          id: 3,
          jtbd_id: 'fda-510k-workflow',
          step_number: 2.1,
          step_name: 'De Novo Pathway Assessment',
          step_description: 'Evaluate if De Novo classification pathway is appropriate when no suitable predicates exist. Assess risk classification, special controls requirements, and regulatory strategy.',
          estimated_duration: 45,
          required_capabilities: ['de_novo_analysis', 'risk_assessment', 'regulatory_strategy', 'novel_device_analysis'],
          agent_selection: {
            strategy: 'consensus',
            criteria: {
              required_capabilities: ['de_novo_analysis'],
              minimum_tier: 1
            },
            consensus_config: {
              agent_count: 2,
              selection_strategy: 'top_scored',
              voting_method: 'weighted'
            }
          },
          conditional_next: [
            {
              condition: 'output.de_novo_recommended === true',
              next_step_id: '4',
              priority: 1
            },
            {
              condition: 'output.de_novo_recommended === false',
              next_step_id: '5',
              priority: 2
            }
          ],
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 300, y: 250 }
        },
        {
          id: 4,
          jtbd_id: 'fda-510k-workflow',
          step_number: 2.2,
          step_name: 'De Novo Submission Preparation',
          step_description: 'Prepare De Novo classification request including risk analysis, proposed special controls, and clinical data requirements.',
          estimated_duration: 90,
          required_capabilities: ['de_novo_preparation', 'special_controls_development', 'clinical_data_planning'],
          agent_selection: {
            strategy: 'manual',
            criteria: {
              preferred_agent_id: 'de-novo-specialist'
            },
            fallback_agents: ['regulatory-expert']
          },
          is_parallel: true,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 500, y: 250 }
        },
        {
          id: 5,
          jtbd_id: 'fda-510k-workflow',
          step_number: 3,
          step_name: 'Clinical Evidence Compilation',
          step_description: 'Compile and analyze clinical evidence to support substantial equivalence claims. Review existing clinical data, identify evidence gaps, and develop clinical evaluation strategy.',
          estimated_duration: 90,
          required_capabilities: ['clinical_data_analysis', 'evidence_synthesis', 'statistical_analysis', 'clinical_evaluation'],
          agent_selection: {
            strategy: 'automatic',
            criteria: {
              required_capabilities: ['clinical_data_analysis'],
              specializations: ['Clinical Trials', 'Evidence Synthesis', 'Medical Devices']
            }
          },
          parallel_steps: ['6'],
          is_parallel: false,
          validation_rules: [
            {
              field: 'clinical_data',
              rule: 'min',
              value: 1,
              message: 'At least one clinical study is required',
              severity: 'warning'
            }
          ],
          retry_config: {
            max_retries: 2,
            retry_delay_ms: 5000,
            exponential_backoff: true,
            retry_on_errors: ['timeout', 'rate_limit']
          },
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 500, y: 100 }
        },
        {
          id: 6,
          jtbd_id: 'fda-510k-workflow',
          step_number: 4,
          step_name: 'Testing Strategy Development',
          step_description: 'Develop comprehensive testing strategy including bench testing, biocompatibility testing, software validation, and performance testing protocols.',
          estimated_duration: 60,
          required_capabilities: ['testing_protocols', 'standards_knowledge', 'validation_planning', 'biocompatibility_testing'],
          agent_selection: {
            strategy: 'load_balanced',
            criteria: {
              required_capabilities: ['testing_protocols'],
              specializations: ['Testing Standards', 'Biocompatibility', 'Device Testing']
            }
          },
          is_parallel: true,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 500, y: 250 }
        },
        {
          id: 7,
          jtbd_id: 'fda-510k-workflow',
          step_number: 5,
          step_name: 'Substantial Equivalence Comparison',
          step_description: 'Create detailed comparison table demonstrating substantial equivalence to predicate device including technological characteristics, performance data, and safety profiles.',
          estimated_duration: 45,
          required_capabilities: ['device_comparison', 'regulatory_writing', 'technical_documentation', 'substantial_equivalence'],
          agent_selection: {
            strategy: 'automatic',
            criteria: {
              required_capabilities: ['device_comparison', 'regulatory_writing'],
              minimum_performance_score: 0.8
            }
          },
          validation_rules: [
            {
              field: 'predicate_comparison',
              rule: 'required',
              value: null,
              message: 'Predicate comparison table is required',
              severity: 'error'
            },
            {
              field: 'technological_characteristics',
              rule: 'required',
              value: null,
              message: 'Technological characteristics comparison is required',
              severity: 'error'
            }
          ],
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 700, y: 175 }
        },
        {
          id: 8,
          jtbd_id: 'fda-510k-workflow',
          step_number: 6,
          step_name: 'Submission Package Assembly',
          step_description: 'Compile complete 510(k) submission package with all required forms, cover letter, predicate comparison, testing data, and supporting documentation.',
          estimated_duration: 60,
          required_capabilities: ['document_preparation', 'submission_formatting', 'regulatory_compliance', 'quality_review'],
          agent_selection: {
            strategy: 'manual',
            criteria: {
              preferred_agent_id: 'fda-regulatory-navigator'
            },
            fallback_agents: ['regulatory-expert', 'document-specialist']
          },
          timeout_config: {
            timeout_ms: 3600000, // 1 hour
            timeout_action: 'pause',
            notification_channels: ['email', 'slack']
          },
          validation_rules: [
            {
              field: 'fda_forms',
              rule: 'required',
              value: null,
              message: 'Required FDA forms must be completed',
              severity: 'error'
            },
            {
              field: 'predicate_comparison_table',
              rule: 'required',
              value: null,
              message: 'Predicate comparison table is required',
              severity: 'error'
            }
          ],
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 900, y: 175 }
        }
      ],
      conditional_logic: [
        {
          id: 'no-predicates-branch',
          name: 'No Predicates Found',
          condition: 'steps.step_2.output.predicates.length === 0',
          actions: [
            {
              type: 'insert_step',
              step_id: '3'
            },
            {
              type: 'notify_user',
              message: 'No predicates found - De Novo pathway assessment required'
            },
            {
              type: 'update_timeline',
              adjustment: '+60 days'
            }
          ]
        }
      ],
      parallel_branches: [
        {
          id: 'parallel-evidence-testing',
          name: 'Parallel Evidence and Testing',
          steps: ['5', '6'],
          merge_strategy: 'wait_all',
          merge_step: '7'
        }
      ],
      error_strategies: [
        {
          id: 'critical-error-strategy',
          name: 'Critical Error Handler',
          error_types: ['regulatory_violation', 'missing_required_data'],
          action: 'pause_and_notify',
          notification_config: {
            channels: ['email', 'slack'],
            recipients: ['regulatory_team@company.com'],
            escalation_after: 30
          }
        },
        {
          id: 'retry-strategy',
          name: 'Transient Error Retry',
          error_types: ['timeout', 'rate_limit', 'network_error'],
          action: 'retry_with_backoff',
          max_retries: 3,
          backoff_config: {
            initial_delay_ms: 1000,
            max_delay_ms: 30000,
            multiplier: 2
          }
        }
      ],
      success_criteria: {
        required_outputs: [
          'gap_analysis_report',
          'predicate_analysis',
          'clinical_evidence',
          'submission_package'
        ],
        quality_thresholds: {
          regulatory_confidence: 0.85,
          documentation_completeness: 0.95,
          predicate_similarity: 0.80
        },
        validation_checks: [
          'All FDA required forms completed',
          'Predicate comparison table validated',
          'Clinical evidence meets FDA standards',
          'Testing protocols approved'
        ]
      },
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'Regulatory Team',
        tags: ['FDA', '510k', 'Medical Device', 'Regulatory'],
        estimated_cost: {
          min: 15.00,
          max: 45.00,
          currency: 'USD'
        },
        compliance_frameworks: ['FDA 21 CFR 807', 'ISO 13485', 'IEC 62304'],
        success_rate: 0.92,
        average_completion_time: 210
      }
    },
    usage_count: 0,
    rating: 4.8,
    created_by: 'system',
    is_public: true,
    version: '1.0',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  {
    id: 'template-clinical-trial',
    name: 'Clinical Trial Protocol Design',
    description: 'End-to-end clinical trial protocol development including study design, statistical planning, regulatory considerations, and operational planning',
    category: 'Clinical',
    industry_tags: ['Clinical Trials', 'Protocol Development', 'Biostatistics', 'Study Design', 'GCP'],
    complexity_level: 'High',
    estimated_duration: 300, // 5 hours
    template_data: {
      id: 'clinical-trial-workflow',
      name: 'Clinical Trial Protocol Design',
      description: 'Comprehensive clinical trial protocol development workflow from concept to execution-ready protocol',
      version: '1.0',
      category: 'Clinical',
      steps: [
        {
          id: 1,
          jtbd_id: 'clinical-trial-workflow',
          step_number: 1,
          step_name: 'Literature Review and Background Research',
          step_description: 'Conduct comprehensive literature review to establish scientific rationale, identify knowledge gaps, and support study hypothesis development.',
          estimated_duration: 60,
          required_capabilities: ['literature_search', 'evidence_review', 'medical_writing', 'systematic_review'],
          agent_selection: {
            strategy: 'automatic',
            criteria: {
              required_capabilities: ['literature_search', 'evidence_review'],
              specializations: ['Clinical Research', 'Medical Literature', 'Evidence Synthesis']
            }
          },
          is_parallel: false,
          error_handling: {},
          position: { x: 100, y: 100 }
        },
        {
          id: 2,
          jtbd_id: 'clinical-trial-workflow',
          step_number: 2,
          step_name: 'Study Objectives and Hypotheses',
          step_description: 'Define primary and secondary objectives with clear, measurable, achievable hypotheses based on literature review and clinical rationale.',
          estimated_duration: 45,
          required_capabilities: ['clinical_design', 'hypothesis_formulation', 'endpoint_selection', 'clinical_rationale'],
          agent_selection: {
            strategy: 'capability_based',
            criteria: {
              required_capabilities: ['clinical_design', 'endpoint_selection'],
              minimum_tier: 1,
              specializations: ['Clinical Trial Design', 'Study Endpoints']
            }
          },
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 300, y: 100 }
        },
        {
          id: 5,
          jtbd_id: 'clinical-trial-workflow',
          step_number: 3,
          step_name: 'Statistical Design and Sample Size Calculation',
          step_description: 'Determine optimal study design, calculate sample size with power analysis, develop statistical analysis plan, and define interim analysis strategy.',
          estimated_duration: 90,
          required_capabilities: ['biostatistics', 'sample_size_calculation', 'power_analysis', 'statistical_planning'],
          agent_selection: {
            strategy: 'consensus',
            criteria: {
              required_capabilities: ['biostatistics', 'sample_size_calculation'],
              specializations: ['Biostatistics', 'Clinical Trials', 'Power Analysis']
            },
            consensus_config: {
              agent_count: 2,
              selection_strategy: 'diverse',
              voting_method: 'weighted'
            }
          },
          validation_rules: [
            {
              field: 'power',
              rule: 'min',
              value: 0.8,
              message: 'Statistical power must be at least 80%',
              severity: 'error'
            },
            {
              field: 'alpha',
              rule: 'max',
              value: 0.05,
              message: 'Type I error rate should not exceed 5%',
              severity: 'warning'
            }
          ],
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 500, y: 100 }
        },
        {
          id: 6,
          jtbd_id: 'clinical-trial-workflow',
          step_number: 4,
          step_name: 'Inclusion/Exclusion Criteria Development',
          step_description: 'Define patient population with detailed inclusion and exclusion criteria, considering safety, efficacy, feasibility, and regulatory requirements.',
          estimated_duration: 60,
          required_capabilities: ['patient_selection', 'clinical_criteria', 'safety_assessment', 'population_definition'],
          agent_selection: {
            strategy: 'automatic',
            criteria: {
              required_capabilities: ['patient_selection', 'clinical_criteria'],
              specializations: ['Clinical Medicine', 'Patient Safety']
            }
          },
          parallel_steps: ['7'],
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 700, y: 100 }
        },
        {
          id: 7,
          jtbd_id: 'clinical-trial-workflow',
          step_number: 5,
          step_name: 'Study Procedures and Assessments',
          step_description: 'Detail all study procedures, visit schedules, assessment methods, data collection instruments, and outcome measurements.',
          estimated_duration: 75,
          required_capabilities: ['protocol_writing', 'procedure_development', 'assessment_design', 'data_collection'],
          agent_selection: {
            strategy: 'load_balanced',
            criteria: {
              required_capabilities: ['protocol_writing', 'procedure_development'],
              specializations: ['Clinical Operations', 'Data Management']
            }
          },
          is_parallel: true,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 700, y: 250 }
        },
        {
          id: 8,
          jtbd_id: 'clinical-trial-workflow',
          step_number: 6,
          step_name: 'Safety Monitoring and Risk Management',
          step_description: 'Develop comprehensive safety monitoring plan including adverse event management, DSMB structure, stopping rules, and risk mitigation strategies.',
          estimated_duration: 60,
          required_capabilities: ['safety_monitoring', 'risk_assessment', 'regulatory_compliance', 'pharmacovigilance'],
          agent_selection: {
            strategy: 'automatic',
            criteria: {
              required_capabilities: ['safety_monitoring', 'risk_assessment'],
              minimum_tier: 2,
              specializations: ['Clinical Safety', 'Pharmacovigilance']
            }
          },
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 900, y: 175 }
        },
        {
          id: 9,
          jtbd_id: 'clinical-trial-workflow',
          step_number: 7,
          step_name: 'Regulatory Strategy and Submissions',
          step_description: 'Develop regulatory strategy including IND/CTA requirements, ethics committee submissions, and regulatory agency interactions.',
          estimated_duration: 45,
          required_capabilities: ['regulatory_strategy', 'ind_preparation', 'ethics_submission', 'regulatory_guidance'],
          agent_selection: {
            strategy: 'capability_based',
            criteria: {
              required_capabilities: ['regulatory_strategy', 'ind_preparation'],
              specializations: ['Clinical Regulatory', 'IND', 'Ethics']
            }
          },
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 1100, y: 100 }
        },
        {
          id: 10,
          jtbd_id: 'clinical-trial-workflow',
          step_number: 8,
          step_name: 'Protocol Document Compilation',
          step_description: 'Compile complete protocol document with all sections, appendices, statistical analysis plan, and supporting documents.',
          estimated_duration: 90,
          required_capabilities: ['protocol_writing', 'document_formatting', 'regulatory_compliance', 'quality_review'],
          agent_selection: {
            strategy: 'manual',
            criteria: {
              preferred_agent_id: 'clinical-trial-architect'
            },
            fallback_agents: ['clinical-specialist', 'protocol-writer']
          },
          validation_rules: [
            {
              field: 'protocol_sections',
              rule: 'required',
              value: ['background', 'objectives', 'design', 'population', 'procedures', 'safety', 'statistics'],
              message: 'All required protocol sections must be completed',
              severity: 'error'
            }
          ],
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 1100, y: 250 }
        }
      ],
      conditional_logic: [],
      parallel_branches: [
        {
          id: 'parallel-criteria-procedures',
          name: 'Parallel Development',
          steps: ['6', '7'],
          merge_strategy: 'wait_all',
          merge_step: '8'
        }
      ],
      error_strategies: [
        {
          id: 'statistical-error-strategy',
          name: 'Statistical Review Required',
          error_types: ['power_calculation_error', 'sample_size_issue'],
          action: 'pause_and_notify',
          notification_config: {
            channels: ['email'],
            recipients: ['biostatistics_team@company.com']
          }
        }
      ],
      success_criteria: {
        required_outputs: [
          'literature_review',
          'study_objectives',
          'statistical_plan',
          'eligibility_criteria',
          'study_procedures',
          'safety_plan',
          'protocol_document'
        ],
        quality_thresholds: {
          scientific_rigor: 0.90,
          statistical_validity: 0.95,
          regulatory_compliance: 0.95
        }
      },
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'Clinical Team',
        tags: ['Clinical Trial', 'Protocol', 'Study Design', 'Biostatistics'],
        estimated_cost: {
          min: 20.00,
          max: 60.00,
          currency: 'USD'
        },
        compliance_frameworks: ['ICH GCP', 'FDA 21 CFR 312', 'ISO 14155'],
        success_rate: 0.88,
        average_completion_time: 285
      }
    },
    usage_count: 0,
    rating: 4.7,
    created_by: 'system',
    is_public: true,
    version: '1.0',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  {
    id: 'template-market-access',
    name: 'Market Access and Reimbursement Strategy',
    description: 'Comprehensive market access planning including HTA assessment, payer strategy, value demonstration, and pricing strategy development',
    category: 'Market Access',
    industry_tags: ['Market Access', 'Reimbursement', 'HTA', 'Health Economics', 'Payer Strategy', 'HEOR'],
    complexity_level: 'Medium',
    estimated_duration: 180, // 3 hours
    template_data: {
      id: 'market-access-workflow',
      name: 'Market Access Strategy Development',
      description: 'End-to-end market access and reimbursement strategy workflow for pharmaceutical products',
      version: '1.0',
      category: 'Market Access',
      steps: [
        {
          id: 1,
          jtbd_id: 'market-access-workflow',
          step_number: 1,
          step_name: 'Market Landscape Analysis',
          step_description: 'Analyze competitive landscape, pricing benchmarks, reimbursement environment, and current market access challenges across target markets.',
          estimated_duration: 45,
          required_capabilities: ['market_research', 'competitive_analysis', 'pricing_analysis', 'reimbursement_landscape'],
          agent_selection: {
            strategy: 'automatic',
            criteria: {
              required_capabilities: ['market_research', 'competitive_analysis'],
              specializations: ['Market Access', 'Health Economics', 'Competitive Intelligence']
            }
          },
          is_parallel: false,
          error_handling: {},
          position: { x: 100, y: 100 }
        },
        {
          id: 2,
          jtbd_id: 'market-access-workflow',
          step_number: 2,
          step_name: 'HTA Requirements Assessment',
          step_description: 'Evaluate Health Technology Assessment requirements across target markets including NICE, G-BA, HAS, and other HTA bodies.',
          estimated_duration: 60,
          required_capabilities: ['hta_analysis', 'regulatory_landscape', 'evidence_requirements', 'hta_guidance'],
          agent_selection: {
            strategy: 'capability_based',
            criteria: {
              required_capabilities: ['hta_analysis'],
              specializations: ['HTA', 'Reimbursement', 'NICE', 'G-BA']
            }
          },
          conditional_next: [
            {
              condition: 'output.hta_required === true',
              next_step_id: '5',
              priority: 1
            },
            {
              condition: 'output.hta_required === false',
              next_step_id: '6',
              priority: 2
            }
          ],
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 300, y: 100 }
        },
        {
          id: 5,
          jtbd_id: 'market-access-workflow',
          step_number: 3,
          step_name: 'Evidence Generation Strategy',
          step_description: 'Develop strategy for generating clinical and economic evidence for HTA submissions including RWE, patient-reported outcomes, and comparative effectiveness research.',
          estimated_duration: 60,
          required_capabilities: ['evidence_planning', 'clinical_economics', 'rwe_strategy', 'comparative_effectiveness'],
          agent_selection: {
            strategy: 'consensus',
            criteria: {
              required_capabilities: ['evidence_planning', 'clinical_economics']
            },
            consensus_config: {
              agent_count: 2,
              selection_strategy: 'top_scored'
            }
          },
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 500, y: 50 }
        },
        {
          id: 6,
          jtbd_id: 'market-access-workflow',
          step_number: 4,
          step_name: 'Value Proposition Development',
          step_description: 'Create compelling value proposition for payers, providers, and patients including clinical, economic, and societal value arguments.',
          estimated_duration: 45,
          required_capabilities: ['value_messaging', 'stakeholder_analysis', 'benefit_articulation', 'value_framework'],
          agent_selection: {
            strategy: 'automatic',
            criteria: {
              required_capabilities: ['value_messaging'],
              specializations: ['Value Communication', 'Market Access']
            }
          },
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 500, y: 150 }
        },
        {
          id: 7,
          jtbd_id: 'market-access-workflow',
          step_number: 5,
          step_name: 'Economic Modeling',
          step_description: 'Build comprehensive health economic models including budget impact analysis, cost-effectiveness analysis, and cost-utility analysis.',
          estimated_duration: 75,
          required_capabilities: ['economic_modeling', 'cost_effectiveness', 'budget_impact', 'markov_modeling'],
          agent_selection: {
            strategy: 'automatic',
            criteria: {
              required_capabilities: ['economic_modeling', 'cost_effectiveness'],
              minimum_tier: 2,
              specializations: ['Health Economics', 'Economic Modeling']
            }
          },
          validation_rules: [
            {
              field: 'icer',
              rule: 'max',
              value: 100000,
              message: 'ICER should be below willingness-to-pay threshold',
              severity: 'warning'
            }
          ],
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 700, y: 100 }
        },
        {
          id: 8,
          jtbd_id: 'market-access-workflow',
          step_number: 6,
          step_name: 'Payer Engagement Strategy',
          step_description: 'Develop comprehensive strategy for payer engagement including key messages, negotiation approach, and managed entry agreements.',
          estimated_duration: 45,
          required_capabilities: ['payer_engagement', 'negotiation_strategy', 'stakeholder_management', 'managed_entry'],
          agent_selection: {
            strategy: 'load_balanced',
            criteria: {
              required_capabilities: ['payer_engagement'],
              specializations: ['Payer Relations', 'Negotiation']
            }
          },
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 900, y: 100 }
        }
      ],
      conditional_logic: [
        {
          id: 'hta-required-branch',
          name: 'HTA Requirement Branch',
          condition: 'steps.step_2.output.hta_required === true',
          actions: [
            {
              type: 'include_step',
              step_id: '5'
            },
            {
              type: 'notify_user',
              message: 'HTA submission required - evidence generation strategy needed'
            }
          ]
        }
      ],
      parallel_branches: [],
      error_strategies: [],
      success_criteria: {
        required_outputs: [
          'market_landscape_report',
          'hta_requirements',
          'value_proposition',
          'economic_models',
          'payer_strategy'
        ],
        quality_thresholds: {
          market_coverage: 0.85,
          value_demonstration: 0.90,
          economic_validity: 0.95
        }
      },
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'Market Access Team',
        tags: ['Market Access', 'Reimbursement', 'HTA', 'Payer', 'Health Economics'],
        estimated_cost: {
          min: 10.00,
          max: 30.00,
          currency: 'USD'
        },
        compliance_frameworks: ['HTA Guidelines', 'ISPOR Standards'],
        success_rate: 0.85,
        average_completion_time: 165
      }
    },
    usage_count: 0,
    rating: 4.6,
    created_by: 'system',
    is_public: true,
    version: '1.0',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  {
    id: 'template-real-world-evidence',
    name: 'Real-World Evidence Study Design',
    description: 'Comprehensive RWE study design workflow including data source identification, study protocol development, and regulatory alignment',
    category: 'Clinical',
    industry_tags: ['Real World Evidence', 'RWE', 'RWD', 'Observational Study', 'HEOR'],
    complexity_level: 'Medium',
    estimated_duration: 150, // 2.5 hours
    template_data: {
      id: 'rwe-study-workflow',
      name: 'Real-World Evidence Study Design',
      description: 'End-to-end RWE study design from research question to protocol finalization',
      version: '1.0',
      category: 'Clinical',
      steps: [
        {
          id: 1,
          jtbd_id: 'rwe-study-workflow',
          step_number: 1,
          step_name: 'Research Question Definition',
          step_description: 'Define clear research question using PICO framework, identify evidence gaps, and establish study objectives for real-world evidence generation.',
          estimated_duration: 30,
          required_capabilities: ['research_design', 'pico_framework', 'evidence_gaps', 'rwe_planning'],
          agent_selection: {
            strategy: 'automatic',
            criteria: {
              required_capabilities: ['research_design', 'rwe_planning'],
              specializations: ['RWE', 'Epidemiology', 'Health Outcomes Research']
            }
          },
          is_parallel: false,
          error_handling: {},
          position: { x: 100, y: 100 }
        },
        {
          id: 2,
          jtbd_id: 'rwe-study-workflow',
          step_number: 2,
          step_name: 'Data Source Assessment',
          step_description: 'Evaluate available real-world data sources including EHR, claims databases, registries, and assess data quality, coverage, and feasibility.',
          estimated_duration: 45,
          required_capabilities: ['data_source_evaluation', 'database_assessment', 'data_quality', 'rwd_knowledge'],
          agent_selection: {
            strategy: 'capability_based',
            criteria: {
              required_capabilities: ['data_source_evaluation', 'database_assessment'],
              specializations: ['RWD', 'Database Research', 'Claims Data']
            }
          },
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 300, y: 100 }
        },
        {
          id: 5,
          jtbd_id: 'rwe-study-workflow',
          step_number: 3,
          step_name: 'Study Design Selection',
          step_description: 'Select appropriate observational study design (cohort, case-control, cross-sectional) and develop analysis plan considering confounding and bias.',
          estimated_duration: 45,
          required_capabilities: ['observational_design', 'epidemiology', 'causal_inference', 'bias_assessment'],
          agent_selection: {
            strategy: 'consensus',
            criteria: {
              required_capabilities: ['observational_design', 'epidemiology'],
              specializations: ['Epidemiology', 'Causal Inference']
            },
            consensus_config: {
              agent_count: 2,
              selection_strategy: 'diverse'
            }
          },
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 500, y: 100 }
        },
        {
          id: 6,
          jtbd_id: 'rwe-study-workflow',
          step_number: 4,
          step_name: 'Statistical Analysis Plan',
          step_description: 'Develop comprehensive statistical analysis plan including variable definitions, outcome measures, confounding adjustment, and sensitivity analyses.',
          estimated_duration: 60,
          required_capabilities: ['biostatistics', 'causal_inference', 'confounding_adjustment', 'sensitivity_analysis'],
          agent_selection: {
            strategy: 'automatic',
            criteria: {
              required_capabilities: ['biostatistics', 'causal_inference'],
              minimum_tier: 2,
              specializations: ['RWE Statistics', 'Causal Inference']
            }
          },
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 700, y: 100 }
        },
        {
          id: 7,
          jtbd_id: 'rwe-study-workflow',
          step_number: 5,
          step_name: 'Protocol Documentation',
          step_description: 'Document complete RWE study protocol including rationale, methods, analysis plan, and regulatory considerations for transparency and reproducibility.',
          estimated_duration: 30,
          required_capabilities: ['protocol_writing', 'rwe_standards', 'study_documentation', 'transparency_reporting'],
          agent_selection: {
            strategy: 'load_balanced',
            criteria: {
              required_capabilities: ['protocol_writing', 'rwe_standards']
            }
          },
          is_parallel: false,
          error_handling: {},
          input_schema: { type: 'object', properties: {} },
          output_schema: { type: 'object', properties: {} },
          position: { x: 900, y: 100 }
        }
      ],
      conditional_logic: [],
      parallel_branches: [],
      error_strategies: [],
      success_criteria: {
        required_outputs: [
          'research_question',
          'data_source_assessment',
          'study_design',
          'statistical_plan',
          'protocol_document'
        ],
        quality_thresholds: {
          methodological_rigor: 0.85,
          statistical_validity: 0.90,
          transparency: 0.95
        }
      },
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'RWE Team',
        tags: ['RWE', 'Real World Data', 'Observational Study', 'Epidemiology'],
        estimated_cost: {
          min: 8.00,
          max: 25.00,
          currency: 'USD'
        },
        compliance_frameworks: ['ISPOR RWE Guidelines', 'STROBE', 'RECORD'],
        success_rate: 0.89,
        average_completion_time: 140
      }
    },
    usage_count: 0,
    rating: 4.4,
    created_by: 'system',
    is_public: true,
    version: '1.0',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Template helper functions
export function getTemplatesByCategory(category: string): WorkflowTemplate[] {
  return pharmaceuticalTemplates.filter(t => t.category === category);
}

export function getTemplatesByComplexity(complexity: 'Low' | 'Medium' | 'High'): WorkflowTemplate[] {
  return pharmaceuticalTemplates.filter(t => t.complexity_level === complexity);
}

export function searchTemplates(searchTerm: string): WorkflowTemplate[] {
  const term = searchTerm.toLowerCase();
  return pharmaceuticalTemplates.filter(t =>
    t.name.toLowerCase().includes(term) ||
    t.description.toLowerCase().includes(term) ||
    t.industry_tags.some(tag => tag.toLowerCase().includes(term))
  );
}

export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return pharmaceuticalTemplates.find(t => t.id === id);
}

export function getPopularTemplates(limit: number = 5): WorkflowTemplate[] {
  return pharmaceuticalTemplates
    .filter(t => t.is_public)
    .sort((a, b) => b.usage_count - a.usage_count)
    .slice(0, limit);
}

export function getRecentTemplates(limit: number = 5): WorkflowTemplate[] {
  return pharmaceuticalTemplates
    .filter(t => t.is_public)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export function getTemplatesByTags(tags: string[]): WorkflowTemplate[] {
  return pharmaceuticalTemplates.filter(t =>
    tags.some(tag => t.industry_tags.includes(tag))
  );
}

export function getTemplateMetrics() {
  return {
    total: pharmaceuticalTemplates.length,
    by_category: pharmaceuticalTemplates.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    by_complexity: pharmaceuticalTemplates.reduce((acc, t) => {
      acc[t.complexity_level] = (acc[t.complexity_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    average_rating: pharmaceuticalTemplates.reduce((sum, t) => sum + t.rating, 0) / pharmaceuticalTemplates.length,
    total_usage: pharmaceuticalTemplates.reduce((sum, t) => sum + t.usage_count, 0)
  };
}