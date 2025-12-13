'use client';

import { Star, CheckCircle, ArrowRight, Layers, Box, Clock, Rocket } from 'lucide-react';
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
      case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Featured Templates Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <CardTitle className="text-lg">Solution Templates</CardTitle>
                </div>
                <CardDescription>
                  Pre-built digital health solution frameworks with regulatory compliance and best practices built-in
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SOLUTION_TEMPLATES.map((template) => (
                <Card
                  key={template.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Box className="w-5 h-5 text-muted-foreground" />
                        <CardTitle className="text-lg">
                          {template.name}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-sm mb-4">
                      {template.description}
                    </CardDescription>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {template.category}
                      </Badge>
                      <Badge className={`text-xs border ${getComplexityColor(template.complexity)}`}>
                        {template.complexity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {template.timeframe}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {template.features.length} features
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground text-xs">
                        Click to view details
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTemplate(template);
                        }}
                      >
                        View
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Empty State / Getting Started */}
          {!selectedTemplate && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
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
              </CardContent>
            </Card>
          )}

          {/* Selected Template Detail View */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 flex-shrink-0">{renderIcon(selectedTemplate.icon, 64)}</div>
                    <div>
                      <CardTitle className="text-2xl mb-1">{selectedTemplate.name}</CardTitle>
                      <CardDescription>{selectedTemplate.description}</CardDescription>
                    </div>
                  </div>
                  <Button onClick={() => setSelectedTemplate(null)} variant="outline">
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Features */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Key Features</h3>
                    <div className="space-y-2">
                      {selectedTemplate.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
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

                <div className="flex gap-3 pt-4">
                  <Button className="flex-1" onClick={() => window.alert('Starting project setup...')}>
                    Start Building
                  </Button>
                  <Button variant="outline" onClick={() => window.alert('Customization options coming soon!')}>
                    Customize Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
