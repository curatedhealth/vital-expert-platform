// @ts-nocheck
'use client';

import { motion } from 'framer-motion';
import {
  Globe,
  Home,
  Truck,
  Video,
  MapPin,
  Package,
  Stethoscope,
  CheckCircle,
  TrendingUp,
  HeartHandshake,
  Wifi,
  Settings,
  Plus
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { DecentralizedTrial } from '../../types';

interface DecentralizedTrialPlatformProps {
  className?: string;
}

interface DCTMetrics {
  activeDCTs: number;
  virtualSites: number;
  homeVisits: number;
  mobileUnits: number;
  telehealthSessions: number;
  participantRetention: number;
  geographicReach: number;
  costReduction: number;
}

interface ServiceAvailability {
  homeNursing: number;
  phlebotomy: number;
  imaging: number;
  telemedicine: number;
}

const DecentralizedTrialPlatform: React.FC<DecentralizedTrialPlatformProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trials' | 'logistics' | 'telehealth' | 'analytics'>('overview');
  const [dctTrials, setDctTrials] = useState<DecentralizedTrial[]>([]);
  const [metrics, setMetrics] = useState<DCTMetrics>({
    activeDCTs: 0,
    virtualSites: 0,
    homeVisits: 0,
    mobileUnits: 0,
    telehealthSessions: 0,
    participantRetention: 0,
    geographicReach: 0,
    costReduction: 0
  });
  const [serviceAvailability, setServiceAvailability] = useState<ServiceAvailability>({
    homeNursing: 0,
    phlebotomy: 0,
    imaging: 0,
    telemedicine: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('all');

  useEffect(() => {
    loadDCTData();
  }, []);

    try {
      setLoading(true);

      setTimeout(() => {
        const mockDCTTrials: DecentralizedTrial[] = [
          {
            id: 'dct-001',
            name: 'Virtual Oncology Care Trial',
            version: '1.0',
            type: 'therapeutic',
            category: 'phase-ii',
            status: 'active',
            objectives: [
              'Evaluate efficacy of virtual oncology care model',
              'Assess patient satisfaction with decentralized care',
              'Measure cost-effectiveness of DCT approach'
            ],
            primaryEndpoints: [
              {
                id: 'ep-001',
                name: 'Overall Response Rate',
                description: 'Proportion of patients with complete or partial response',
                type: 'primary',
                measurementType: 'binary',
                unit: '%',
                timepoint: 'Week 24',
                statisticalMethod: 'Logistic Regression'
              }
            ],
            secondaryEndpoints: [
              {
                id: 'ep-002',
                name: 'Patient Satisfaction',
                description: 'Patient satisfaction with virtual care delivery',
                type: 'secondary',
                measurementType: 'continuous',
                unit: 'Score 1-10',
                timepoint: 'Week 24',
                statisticalMethod: 'Mixed Model'
              }
            ],
            inclusionCriteria: [
              {
                id: 'inc-001',
                description: 'Confirmed solid tumor diagnosis',
                type: 'inclusion',
                category: 'medical-history',
                isCritical: true
              },
              {
                id: 'inc-002',
                description: 'Access to reliable internet connection',
                type: 'inclusion',
                category: 'demographic',
                isCritical: true
              }
            ],
            exclusionCriteria: [
              {
                id: 'exc-001',
                description: 'Inability to use digital devices',
                type: 'exclusion',
                category: 'demographic',
                isCritical: true
              }
            ],
            studyDesign: {
              type: 'rct',
              allocation: 'randomized',
              intervention: 'experimental',
              masking: 'none',
              assignment: 'parallel'
            },
            blinding: 'open-label',
            randomization: {
              method: 'stratified',
              stratificationFactors: ['tumor_type', 'disease_stage'],
              allocationRatio: '1:1'
            },
            phases: [
              {
                id: 'phase-001',
                name: 'Virtual Enrollment',
                description: 'Remote consent and baseline assessments',
                duration: 14,
                visits: [
                  {
                    id: 'visit-001',
                    name: 'E-Consent Visit',
                    type: 'screening',
                    day: 0,
                    window: { before: 0, after: 7 },
                    procedures: ['e-consent', 'telemedicine-consultation', 'digital-intake']
                  }
                ],
                procedures: [
                  {
                    id: 'proc-001',
                    name: 'Electronic Informed Consent',
                    type: 'questionnaire',
                    category: 'regulatory',
                    instructions: 'Complete e-consent via secure platform',
                    frequency: 'once'
                  }
                ],
                assessments: [
                  {
                    id: 'assess-001',
                    name: 'Baseline Quality of Life',
                    type: 'quality-of-life',
                    instrument: 'EORTC QLQ-C30',
                    scoring: 'Digital automated',
                    interpretation: 'Standardized scoring algorithm'
                  }
                ]
              }
            ],
            timeline: {
              startDate: new Date('2024-01-15'),
              endDate: new Date('2025-01-15'),
              recruitmentStart: new Date('2024-02-01'),
              recruitmentEnd: new Date('2024-08-01'),
              lastPatientLastVisit: new Date('2024-12-01'),
              dataLockPoint: new Date('2024-12-15'),
              reportDate: new Date('2025-01-15')
            },
            locations: [
              {
                id: 'loc-001',
                name: 'Virtual Site - Americas',
                type: 'virtual',
                address: {
                  street: 'Cloud Infrastructure',
                  city: 'Virtual',
                  state: 'Multi-State',
                  zipCode: '00000',
                  country: 'USA/Canada'
                },
                principalInvestigator: 'Dr. Maria Rodriguez',
                capacity: 300,
                status: 'recruiting'
              },
              {
                id: 'loc-002',
                name: 'Virtual Site - Europe',
                type: 'virtual',
                address: {
                  street: 'Cloud Infrastructure',
                  city: 'Virtual',
                  state: 'Multi-Country',
                  zipCode: '00000',
                  country: 'EU'
                },
                principalInvestigator: 'Dr. Hans Mueller',
                capacity: 200,
                status: 'recruiting'
              }
            ],
            regulatoryStatus: [
              {
                authority: 'fda',
                type: 'ind',
                status: 'approved',
                submissionDate: new Date('2023-10-01'),
                approvalDate: new Date('2023-12-01'),
                conditions: ['Monthly safety reports', 'DCT-specific monitoring plan']
              },
              {
                authority: 'ema',
                type: 'cta',
                status: 'approved',
                submissionDate: new Date('2023-11-01'),
                approvalDate: new Date('2024-01-01'),
                conditions: ['Virtual monitoring acceptance']
              }
            ],
            ethics: [
              {
                committee: 'Central DCT Ethics Committee',
                type: 'irb',
                status: 'approved',
                approvalDate: new Date('2023-12-15'),
                expiryDate: new Date('2024-12-15'),
                amendments: []
              }
            ],
            createdAt: new Date('2023-09-01'),
            updatedAt: new Date('2024-01-15'),
            createdBy: 'Dr. Sarah Chen',
            principalInvestigator: 'Dr. Maria Rodriguez',

            // DCT-specific properties
            virtualComponents: [
              {
                id: 'vc-001',
                name: 'E-Consent Platform',
                type: 'e-consent',
                platform: 'DocuSign for Life Sciences',
                requirements: [
                  {
                    type: 'software',
                    specification: 'Web browser with PDF support',
                    mandatory: true
                  },
                  {
                    type: 'network',
                    specification: 'Stable internet connection (min 1 Mbps)',
                    mandatory: true
                  }
                ]
              },
              {
                id: 'vc-002',
                name: 'Telemedicine Consultations',
                type: 'telemedicine',
                platform: 'Zoom for Healthcare',
                requirements: [
                  {
                    type: 'hardware',
                    specification: 'Camera and microphone enabled device',
                    mandatory: true
                  },
                  {
                    type: 'skill',
                    specification: 'Basic video conferencing proficiency',
                    mandatory: false
                  }
                ]
              },
              {
                id: 'vc-003',
                name: 'Remote Patient Monitoring',
                type: 'home-monitoring',
                platform: 'VITAL Path Remote Monitoring',
                requirements: [
                  {
                    type: 'hardware',
                    specification: 'Smartphone or tablet (iOS 14+ or Android 8+)',
                    mandatory: true
                  }
                ]
              }
            ],

            homeHealthConfig: {
              services: [
                {
                  id: 'hh-001',
                  name: 'Oncology Nursing Visits',
                  type: 'nursing',
                  duration: 90,
                  requirements: ['Oncology certification', 'IV therapy skills', 'Symptom management']
                },
                {
                  id: 'hh-002',
                  name: 'Laboratory Collection',
                  type: 'phlebotomy',
                  duration: 30,
                  requirements: ['Phlebotomy certification', 'Oncology experience preferred']
                },
                {
                  id: 'hh-003',
                  name: 'Vital Signs Monitoring',
                  type: 'monitoring',
                  duration: 45,
                  requirements: ['Clinical experience', 'Digital device proficiency']
                }
              ],
              providers: [
                {
                  id: 'provider-001',
                  name: 'CareNurse Network',
                  type: 'nurse',
                  qualifications: ['RN License', 'Oncology Certification', 'GCP Training'],
                  coverage: {
                    regions: ['North America', 'Europe'],
                    radius: 50,
                    travelTime: 60
                  }
                },
                {
                  id: 'provider-002',
                  name: 'LabCorp Home Draw',
                  type: 'phlebotomist',
                  qualifications: ['Phlebotomy Certification', 'Clinical Experience'],
                  coverage: {
                    regions: ['United States', 'Canada'],
                    radius: 30,
                    travelTime: 45
                  }
                }
              ],
              scheduling: {
                window: {
                  start: '08:00',
                  end: '18:00',
                  days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                },
                advance: 7,
                cancellation: 24,
                rescheduling: true
              }
            },

            mobileHealthUnits: [
              {
                id: 'mhu-001',
                name: 'Oncology Mobile Unit - West Coast',
                type: 'truck',
                equipment: [
                  {
                    id: 'eq-001',
                    name: 'Digital Radiography System',
                    type: 'imaging',
                    manufacturer: 'Fujifilm',
                    model: 'FDR Go Plus',
                    calibration: [
                      {
                        date: new Date('2024-01-15'),
                        technician: 'Tech Specialist Inc',
                        results: 'Within specifications',
                        nextDue: new Date('2024-07-15')
                      }
                    ]
                  },
                  {
                    id: 'eq-002',
                    name: 'Point-of-Care Laboratory',
                    type: 'laboratory',
                    manufacturer: 'Abbott',
                    model: 'i-STAT Alinity',
                    calibration: [
                      {
                        date: new Date('2024-02-01'),
                        technician: 'Medical Tech Services',
                        results: 'Calibrated and verified',
                        nextDue: new Date('2024-05-01')
                      }
                    ]
                  }
                ],
                capacity: 12,
                route: {
                  locations: [
                    {
                      id: 'route-001',
                      name: 'Los Angeles Medical District',
                      address: {
                        street: '1200 N State St',
                        city: 'Los Angeles',
                        state: 'CA',
                        zipCode: '90033',
                        country: 'USA'
                      },
                      duration: 8,
                      capacity: 12
                    },
                    {
                      id: 'route-002',
                      name: 'San Francisco Bay Area',
                      address: {
                        street: '500 Parnassus Ave',
                        city: 'San Francisco',
                        state: 'CA',
                        zipCode: '94143',
                        country: 'USA'
                      },
                      duration: 8,
                      capacity: 12
                    }
                  ],
                  schedule: [
                    {
                      location: 'route-001',
                      date: new Date('2024-03-15'),
                      startTime: '08:00',
                      endTime: '16:00'
                    },
                    {
                      location: 'route-002',
                      date: new Date('2024-03-17'),
                      startTime: '08:00',
                      endTime: '16:00'
                    }
                  ],
                  duration: 14
                }
              }
            ],

            telehealth: {
              platforms: [
                {
                  id: 'th-001',
                  name: 'Zoom for Healthcare',
                  vendor: 'Zoom Video Communications',
                  features: ['HD Video', 'Screen Sharing', 'Recording', 'Chat', 'Waiting Room'],
                  integration: true,
                  hipaaCompliant: true
                },
                {
                  id: 'th-002',
                  name: 'Teladoc Health Platform',
                  vendor: 'Teladoc Health',
                  features: ['Video Consultation', 'Digital Stethoscope', 'Remote Monitoring', 'EHR Integration'],
                  integration: true,
                  hipaaCompliant: true
                }
              ],
              appointments: {
                types: [
                  {
                    id: 'apt-001',
                    name: 'Oncology Consultation',
                    duration: 45,
                    participants: ['patient', 'oncologist', 'nurse'],
                    requirements: ['High-definition camera', 'Stable internet connection']
                  },
                  {
                    id: 'apt-002',
                    name: 'Symptom Assessment',
                    duration: 30,
                    participants: ['patient', 'clinical-coordinator'],
                    requirements: ['Smartphone or tablet with camera']
                  }
                ],
                scheduling: [
                  {
                    type: 'consultation',
                    advance: { min: 24, max: 336 }, // 1 day to 2 weeks
                    duration: { min: 30, max: 60 },
                    availability: [
                      {
                        role: 'oncologist',
                        timeZone: 'America/Los_Angeles',
                        schedule: [
                          {
                            day: 'monday',
                            slots: [
                              { start: '09:00', end: '12:00', capacity: 8 },
                              { start: '14:00', end: '17:00', capacity: 6 }
                            ]
                          },
                          {
                            day: 'tuesday',
                            slots: [
                              { start: '09:00', end: '12:00', capacity: 8 },
                              { start: '14:00', end: '17:00', capacity: 6 }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ],
                reminders: {
                  enabled: true,
                  timing: [24, 2], // 24 hours and 2 hours before
                  channels: ['email', 'sms', 'push'],
                  templates: ['appointment-reminder-24h', 'appointment-reminder-2h']
                }
              },
              documentation: {
                templates: [
                  {
                    id: 'doc-001',
                    name: 'Telemedicine Consultation Note',
                    type: 'consultation',
                    fields: [
                      {
                        id: 'field-001',
                        name: 'Chief Complaint',
                        type: 'text',
                        required: true,
                        validation: [
                          {
                            type: 'minLength',
                            value: 10,
                            message: 'Please provide detailed chief complaint'
                          }
                        ]
                      },
                      {
                        id: 'field-002',
                        name: 'Assessment',
                        type: 'text',
                        required: true,
                        validation: []
                      }
                    ]
                  }
                ],
                workflows: [
                  {
                    id: 'wf-001',
                    name: 'Consultation Documentation Workflow',
                    steps: [
                      {
                        id: 'step-001',
                        name: 'Complete Documentation',
                        type: 'review',
                        role: 'physician',
                        timeLimit: 24
                      },
                      {
                        id: 'step-002',
                        name: 'Quality Review',
                        type: 'approve',
                        role: 'medical-director',
                        timeLimit: 48
                      }
                    ]
                  }
                ],
                storage: {
                  location: 'cloud',
                  encryption: true,
                  backup: {
                    frequency: 'daily',
                    location: 'secure-cloud-backup',
                    encryption: true
                  },
                  retention: {
                    duration: 25,
                    policy: 'archive'
                  }
                }
              }
            },

            directToPatient: {
              shipping: {
                carriers: [
                  {
                    name: 'FedEx',
                    services: ['Overnight', '2-Day', 'Ground', 'International'],
                    regions: ['North America', 'Europe', 'Asia']
                  },
                  {
                    name: 'UPS',
                    services: ['Next Day Air', '2nd Day Air', 'Ground', 'International'],
                    regions: ['North America', 'Europe']
                  }
                ],
                methods: [
                  {
                    name: 'Overnight Express',
                    carrier: 'FedEx',
                    speed: 'next-day',
                    cost: 45.00,
                    tracking: true
                  },
                  {
                    name: 'Standard Shipping',
                    carrier: 'UPS',
                    speed: '3-5 days',
                    cost: 12.00,
                    tracking: true
                  }
                ],
                tracking: true,
                insurance: true
              },
              inventory: {
                items: [
                  {
                    id: 'item-001',
                    name: 'Study Medication Kit',
                    type: 'medication',
                    sku: 'MED-KIT-001',
                    description: 'Complete study medication package with instructions',
                    specifications: {
                      temperature: '2-8°C',
                      expiry: '24 months',
                      packaging: 'Tamper-evident'
                    }
                  },
                  {
                    id: 'item-002',
                    name: 'Digital Thermometer',
                    type: 'device',
                    sku: 'DEV-THERM-001',
                    description: 'Bluetooth-enabled digital thermometer for remote monitoring',
                    specifications: {
                      accuracy: '±0.1°C',
                      connectivity: 'Bluetooth 5.0',
                      battery: '2 years'
                    }
                  }
                ],
                locations: [
                  {
                    id: 'inv-001',
                    name: 'Central Distribution Center - East',
                    type: 'warehouse',
                    address: {
                      street: '1500 Logistics Blvd',
                      city: 'Atlanta',
                      state: 'GA',
                      zipCode: '30309',
                      country: 'USA'
                    },
                    capacity: 10000
                  }
                ],
                management: {
                  tracking: 'all',
                  reorderPoint: 100,
                  reorderQuantity: 500,
                  alerts: [
                    {
                      type: 'low-stock',
                      threshold: 50,
                      recipients: ['inventory-manager@vitalpath.com']
                    },
                    {
                      type: 'expiry',
                      threshold: 90,
                      recipients: ['quality-assurance@vitalpath.com']
                    }
                  ]
                }
              },
              returns: {
                policy: {
                  timeLimit: 30,
                  conditions: ['Unused medication', 'Original packaging', 'Within expiry'],
                  refund: false
                },
                process: [
                  {
                    step: 1,
                    description: 'Patient initiates return request via app',
                    responsible: 'patient',
                    timeLimit: 24
                  },
                  {
                    step: 2,
                    description: 'Return authorization and shipping label provided',
                    responsible: 'logistics-team'
                  },
                  {
                    step: 3,
                    description: 'Returned items received and inspected',
                    responsible: 'quality-team',
                    timeLimit: 48
                  }
                ],
                disposal: {
                  method: 'return-to-manufacturer',
                  vendor: 'Secure Pharmaceutical Disposal Inc',
                  documentation: true
                }
              }
            }
          }
        ];

        setDctTrials(mockDCTTrials);
        setMetrics({
          activeDCTs: mockDCTTrials.length,
          virtualSites: mockDCTTrials.reduce((total, trial) =>
            total + trial.locations.filter(loc => loc.type === 'virtual').length, 0),
          homeVisits: 2847,
          mobileUnits: mockDCTTrials.reduce((total, trial) => total + trial.mobileHealthUnits.length, 0),
          telehealthSessions: 5624,
          participantRetention: 94.2,
          geographicReach: 78,
          costReduction: 42.5
        });
        setServiceAvailability({
          homeNursing: 89,
          phlebotomy: 95,
          imaging: 67,
          telemedicine: 98
        });
        setLoading(false);
      }, 1500);
    } catch (error) {
//       console.error('Error loading DCT data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Decentralized Clinical Trial Platform</h1>
          <p className="text-neutral-600 mt-2">Virtual, home-based, and mobile clinical trial infrastructure</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            New DCT
          </button>
          <button className="flex items-center px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Active DCTs</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.activeDCTs}</p>
            </div>
            <Globe className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Virtual Sites</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.virtualSites}</p>
            </div>
            <Wifi className="h-8 w-8 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Home Visits</p>
              <p className="text-2xl font-bold text-green-600">{metrics.homeVisits.toLocaleString()}</p>
            </div>
            <Home className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Mobile Units</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.mobileUnits}</p>
            </div>
            <Truck className="h-8 w-8 text-orange-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Telehealth Sessions</p>
              <p className="text-2xl font-bold text-teal-600">{metrics.telehealthSessions.toLocaleString()}</p>
            </div>
            <Video className="h-8 w-8 text-teal-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Retention Rate</p>
              <p className="text-2xl font-bold text-indigo-600">{metrics.participantRetention}%</p>
            </div>
            <HeartHandshake className="h-8 w-8 text-indigo-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Geographic Reach</p>
              <p className="text-2xl font-bold text-pink-600">{metrics.geographicReach}%</p>
            </div>
            <MapPin className="h-8 w-8 text-pink-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Cost Reduction</p>
              <p className="text-2xl font-bold text-red-600">{metrics.costReduction}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-600" />
          </div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'DCT Overview', icon: Globe },
            { key: 'trials', label: 'Virtual Trials', icon: Wifi },
            { key: 'logistics', label: 'Care Logistics', icon: Truck },
            { key: 'telehealth', label: 'Telehealth Platform', icon: Video },
            { key: 'analytics', label: 'DCT Analytics', icon: TrendingUp }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as unknown)}
              className={`flex items-center px-3 py-2 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Service Availability */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-canvas-surface rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Service Availability by Region</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 flex items-center">
                    <Home className="h-4 w-4 mr-2" />
                    Home Nursing
                  </span>
                  <div className="flex items-center">
                    <div className="w-32 bg-neutral-200 rounded-full h-2 mr-3">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: `${serviceAvailability.homeNursing}%`}}></div>
                    </div>
                    <span className="font-medium">{serviceAvailability.homeNursing}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Phlebotomy
                  </span>
                  <div className="flex items-center">
                    <div className="w-32 bg-neutral-200 rounded-full h-2 mr-3">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: `${serviceAvailability.phlebotomy}%`}}></div>
                    </div>
                    <span className="font-medium">{serviceAvailability.phlebotomy}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 flex items-center">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Mobile Imaging
                  </span>
                  <div className="flex items-center">
                    <div className="w-32 bg-neutral-200 rounded-full h-2 mr-3">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: `${serviceAvailability.imaging}%`}}></div>
                    </div>
                    <span className="font-medium">{serviceAvailability.imaging}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 flex items-center">
                    <Video className="h-4 w-4 mr-2" />
                    Telemedicine
                  </span>
                  <div className="flex items-center">
                    <div className="w-32 bg-neutral-200 rounded-full h-2 mr-3">
                      <div className="bg-teal-600 h-2 rounded-full" style={{width: `${serviceAvailability.telemedicine}%`}}></div>
                    </div>
                    <span className="font-medium">{serviceAvailability.telemedicine}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-canvas-surface rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">DCT Platform Benefits</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-neutral-700">Increased patient accessibility and convenience</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-neutral-700">Reduced travel burden and associated costs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-neutral-700">Higher patient retention and engagement</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-neutral-700">Real-time data collection and monitoring</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-neutral-700">Broader geographic reach and diversity</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-neutral-700">Faster recruitment and study completion</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active DCT Trials Summary */}
          <div className="bg-canvas-surface rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Active DCT Trials</h3>
            <div className="space-y-3">
              {dctTrials.map((trial) => (
                <div key={trial.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{trial.name}</p>
                      <p className="text-sm text-neutral-600">
                        {trial.virtualComponents.length} virtual components •
                        {trial.locations.filter(loc => loc.type === 'virtual').length} virtual sites
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {trial.status}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Additional tab implementations would continue here... */}
    </div>
  );
};

export default DecentralizedTrialPlatform;