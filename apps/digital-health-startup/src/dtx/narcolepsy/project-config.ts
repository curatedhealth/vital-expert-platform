// ===================================================================
// Narcolepsy DTx Project Configuration
// VITAL Platform Integration for Digital Therapeutic MVP
// ===================================================================

export const __narcolepsyDTxConfig = {
  project: {
    id: 'narcolepsy-dtx-mvp',
    name: 'Narcolepsy Digital Therapeutic',
    version: '1.0.0',
    therapeuticArea: 'Sleep Disorders',
    indication: 'Narcolepsy Type 1 & 2',
    classification: 'Class IIa Medical Device Software',
    regulatory: {
      pathway: 'FDA DiGA',
      framework: 'CE-MDR',
      compliance: ['HIPAA', 'GDPR', 'SOC2']
    }
  },

  clinical: {
    endpoints: {
      primary: {
        metric: 'ESS_reduction',
        target: 3,
        timeline: '12 weeks',
        power: 0.80
      },
      secondary: [
        {
          metric: 'cataplexy_frequency',
          target: 50, // % reduction
          timeline: '8 weeks'
        },
        {
          metric: 'medication_adherence',
          target: 80, // % adherence
          timeline: 'continuous'
        },
        {
          metric: 'quality_of_life',
          target: 20, // % improvement
          timeline: '12 weeks'
        }
      ]
    },

    validation: {
      frameworks: ['PHARMA', 'VERIFY'],
      accuracy_threshold: 0.95,
      safety_threshold: 0.99,
      confidence_required: 0.85
    }
  },

  agents: {
    sleep_analyzer: {
      id: 'sleep-pattern-analyzer-v2',
      capabilities: [
        'polysomnography_interpretation',
        'circadian_rhythm_analysis',
        'rem_sleep_monitoring',
        'sleep_stage_classification'
      ],
      model: 'med-palm-2',
      temperature: 0.3,
      accuracy: 0.96
    },

    cataplexy_detector: {
      id: 'cataplexy-detector-v2',
      capabilities: [
        'episode_detection',
        'severity_scoring',
        'trigger_identification',
        'risk_prediction'
      ],
      realtime: true,
      alert_threshold: 'immediate',
      ml_model: 'narcolepsy-specific-v2'
    },

    medication_optimizer: {
      id: 'medication-optimizer-narcolepsy',
      capabilities: [
        'dosage_optimization',
        'interaction_checking',
        'adherence_monitoring',
        'side_effect_tracking'
      ],
      medications: [
        'modafinil',
        'armodafinil',
        'sodium_oxybate',
        'pitolisant',
        'methylphenidate'
      ]
    },

    therapy_coach: {
      id: 'cbt-hypersomnia-coach',
      capabilities: [
        'sleep_hygiene_coaching',
        'scheduled_napping_optimization',
        'lifestyle_modification',
        'stress_management'
      ],
      protocol: 'CBT-IH',
      engagement_style: 'motivational_interviewing'
    },

    clinical_validator: {
      id: 'clinical-validator-dtx',
      protocols: ['PHARMA', 'VERIFY'],
      capabilities: [
        'outcome_measurement',
        'safety_monitoring',
        'regulatory_reporting',
        'evidence_generation'
      ]
    }
  },

  workflow: {
    stages: [
      {
        id: 'onboarding',
        duration: '7-14 days',
        activities: [
          'eligibility_screening',
          'baseline_assessment',
          'device_setup'
        ]
      },
      {
        id: 'active_monitoring',
        duration: 'continuous',
        activities: [
          'daily_symptom_tracking',
          'medication_monitoring',
          'safety_surveillance'
        ]
      },
      {
        id: 'optimization',
        duration: 'ongoing',
        activities: [
          'treatment_adjustment',
          'outcome_measurement',
          'long_term_monitoring'
        ]
      }
    ]
  },

  prism_prompts: {
    assessment: {
      precision: 'clinical_accuracy_95_percent',
      relevance: 'icd10_g47_4_specific',
      integration: 'multi_modal_data_synthesis',
      safety: 'driving_risk_assessment',
      measurement: 'validated_outcome_scales'
    },

    treatment: {
      precision: 'evidence_based_algorithms',
      relevance: 'phenotype_specific_matching',
      integration: 'holistic_care_coordination',
      safety: 'contraindication_screening',
      measurement: 'real_world_effectiveness'
    }
  },

  monitoring: {
    clinical_metrics: [
      'ess_score_progression',
      'cataplexy_episode_frequency',
      'medication_adherence_rate',
      'adverse_event_incidence',
      'quality_of_life_scores'
    ],

    system_metrics: [
      'api_response_time',
      'clinical_accuracy',
      'user_engagement',
      'data_quality',
      'compliance_score'
    ],

    alerts: [
      {
        name: 'severe_cataplexy',
        threshold: 'severity > 8',
        action: 'immediate_provider_alert'
      },
      {
        name: 'medication_non_response',
        threshold: 'efficacy < 0.3',
        action: 'treatment_review'
      },
      {
        name: 'safety_signal',
        threshold: 'adverse_event_detected',
        action: 'regulatory_notification'
      }
    ]
  },

  deployment: {
    environment: 'production',
    regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
    scaling: {
      min_replicas: 3,
      max_replicas: 10,
      target_cpu: 70
    },

    health_checks: {
      liveness: '/api/health',
      readiness: '/api/ready',
      startup: '/api/startup'
    }
  }
};

export default narcolepsyDTxConfig;