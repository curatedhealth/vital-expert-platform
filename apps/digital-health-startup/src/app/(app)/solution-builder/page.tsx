'use client';

import { Rocket, Star, CheckCircle, ArrowRight, Layers } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui';

// Helper function to render icons
const renderIcon = (iconPath: string, size: number = 48) => {
  return (
    <Image
      src={iconPath}
      alt=""
      width={size}
      height={size}
      className="object-contain"
    />
  );
};

// Simplified solution templates - directly embedded for simplicity
const SOLUTION_TEMPLATES = [
  {
    id: 'digital-therapeutic',
    name: 'Digital Therapeutic (DTx)',
    description: 'Evidence-based software interventions for medical conditions',
    category: 'Digital Health',
    icon: '/icons/png/general/AI Chip.png',
    complexity: 'high' as const,
    timeframe: '6-12 months',
    features: [
      'FDA/CE Mark submission support',
      'Clinical evidence generation',
      'Patient engagement tools',
      'Real-time monitoring dashboard'
    ],
    useCases: [
      'Chronic disease management',
      'Mental health interventions',
      'Behavioral change programs',
      'Medication adherence'
    ]
  },
  {
    id: 'remote-monitoring',
    name: 'Remote Patient Monitoring',
    description: 'Real-time patient monitoring with AI-powered analytics',
    category: 'Telehealth',
    icon: '/icons/png/general/Data Analysis.png',
    complexity: 'medium' as const,
    timeframe: '4-8 months',
    features: [
      'Multi-device integration',
      'AI anomaly detection',
      'Automated alerts & escalation',
      'HIPAA-compliant data storage'
    ],
    useCases: [
      'Post-discharge monitoring',
      'Chronic condition tracking',
      'Clinical trial data collection',
      'Elderly care monitoring'
    ]
  },
  {
    id: 'clinical-trial-platform',
    name: 'Clinical Trial Platform',
    description: 'Digital infrastructure for clinical research and trial management',
    category: 'Research',
    icon: '/icons/png/general/Algorithm.png',
    complexity: 'high' as const,
    timeframe: '8-14 months',
    features: [
      'eCRF/EDC system',
      'Patient recruitment tools',
      'Data analytics & reporting',
      '21 CFR Part 11 compliance'
    ],
    useCases: [
      'Phase II/III trials',
      'Decentralized trials (DCT)',
      'Real-world evidence studies',
      'Patient registry management'
    ]
  },
  {
    id: 'telemedicine-platform',
    name: 'Telemedicine Platform',
    description: 'Virtual care delivery and consultation platform',
    category: 'Telehealth',
    icon: '/icons/png/general/Predictive Analytics.png',
    complexity: 'medium' as const,
    timeframe: '3-6 months',
    features: [
      'HD video consultation',
      'E-prescribing integration',
      'Appointment scheduling',
      'Secure messaging & file sharing'
    ],
    useCases: [
      'Primary care consultations',
      'Specialist referrals',
      'Follow-up appointments',
      'Mental health therapy'
    ]
  },
  {
    id: 'patient-engagement',
    name: 'Patient Engagement App',
    description: 'Mobile-first platform for patient education and engagement',
    category: 'Patient Experience',
    icon: '/icons/png/general/Virtual Assistant.png',
    complexity: 'low' as const,
    timeframe: '2-4 months',
    features: [
      'Personalized content delivery',
      'Gamification & rewards',
      'Push notifications',
      'Educational resources library'
    ],
    useCases: [
      'Pre/post-op education',
      'Treatment adherence',
      'Lifestyle modification',
      'Support community access'
    ]
  },
  {
    id: 'biomarker-analytics',
    name: 'Biomarker Analytics Platform',
    description: 'AI-powered analytics for digital biomarker discovery and validation',
    category: 'Data Science',
    icon: '/icons/png/general/Machine Learning.png',
    complexity: 'high' as const,
    timeframe: '10-16 months',
    features: [
      'Multi-modal data integration',
      'ML model development',
      'Validation & verification tools',
      'Regulatory documentation support'
    ],
    useCases: [
      'Digital biomarker discovery',
      'Predictive risk modeling',
      'Treatment response prediction',
      'Clinical endpoint development'
    ]
  }
];

export default function SolutionBuilderPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof SOLUTION_TEMPLATES[0] | null>(null);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rocket className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="text-3xl font-bold">Solution Builder</h1>
              <p className="text-sm text-muted-foreground">
                Build digital health solutions with pre-validated templates
              </p>
            </div>
          </div>
          <Button
            size="default"
            className="flex items-center gap-2"
            onClick={() => window.alert('Custom solution builder coming soon!')}
          >
            <Layers className="h-4 w-4" />
            Start from Scratch
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Featured Templates Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">Solution Templates</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Pre-built digital health solution frameworks with regulatory compliance and best practices built-in
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SOLUTION_TEMPLATES.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-vital-primary-300 group"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex-shrink-0">{renderIcon(template.icon, 48)}</div>
                        <div>
                          <CardTitle className="text-base leading-tight">{template.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                            <Badge className={`text-xs border ${getComplexityColor(template.complexity)}`}>
                              {template.complexity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>

                    {/* Timeframe */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {template.timeframe}
                      </span>
                      <span>{template.features.length} features</span>
                    </div>

                    {/* Key Features Preview */}
                    <div>
                      <h4 className="font-semibold text-xs mb-2">Key Features</h4>
                      <div className="space-y-1">
                        {template.features.slice(0, 2).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                        {template.features.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{template.features.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Empty State / Getting Started */}
          {!selectedTemplate && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Rocket className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Select a Template to Get Started</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Choose from our pre-validated solution templates or start from scratch to build your custom digital health solution
              </p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  View Documentation
                </Button>
                <Button size="sm">
                  Schedule Demo
                </Button>
              </div>
            </div>
          )}

          {/* Selected Template Detail View */}
          {selectedTemplate && (
            <div className="mt-8 border-t pt-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 flex-shrink-0">{renderIcon(selectedTemplate.icon, 64)}</div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
                    <p className="text-muted-foreground">{selectedTemplate.description}</p>
                  </div>
                </div>
                <Button onClick={() => setSelectedTemplate(null)} variant="outline">
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Features */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Key Features</h3>
                  <div className="space-y-2">
                    {selectedTemplate.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Use Cases</h3>
                  <div className="space-y-2">
                    {selectedTemplate.useCases.map((useCase, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{useCase}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button className="flex-1" onClick={() => window.alert('Starting project setup...')}>
                  Start Building
                </Button>
                <Button variant="outline" onClick={() => window.alert('Customization options coming soon!')}>
                  Customize Template
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
