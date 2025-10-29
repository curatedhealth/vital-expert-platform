'use client';

import {
  Workflow,
  Plus,
  Play,
  Pause,
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import Image from 'next/image';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';

const sampleWorkflows = [
  {
    id: 1,
    name: 'Clinical Trial Design',
    description: 'Automated workflow for designing and validating clinical trials',
    status: 'active',
    lastRun: '2 hours ago',
    nextRun: 'In 4 hours',
    steps: 8,
    successRate: 94,
    icon: '/icons/png/general/Algorithm.png',
    color: 'text-clinical-green',
    bgColor: 'bg-clinical-green/10',
  },
  {
    id: 2,
    name: 'Regulatory Submission',
    description: 'Streamlined process for FDA and regulatory submissions',
    status: 'paused',
    lastRun: '1 day ago',
    nextRun: 'Manual trigger',
    steps: 12,
    successRate: 87,
    icon: '/icons/png/general/AI Ethics.png',
    color: 'text-regulatory-gold',
    bgColor: 'bg-regulatory-gold/10',
  },
  {
    id: 3,
    name: 'AI Model Validation',
    description: 'Automated testing and validation of AI models',
    status: 'active',
    lastRun: '30 minutes ago',
    nextRun: 'In 2 hours',
    steps: 6,
    successRate: 96,
    icon: '/icons/png/general/AI Brain.png',
    color: 'text-trust-blue',
    bgColor: 'bg-trust-blue/10',
  },
  {
    id: 4,
    name: 'Patient Data Processing',
    description: 'Secure processing and anonymization of patient data',
    status: 'error',
    lastRun: '3 hours ago',
    nextRun: 'Manual intervention required',
    steps: 10,
    successRate: 78,
    icon: '/icons/png/general/Data Analysis.png',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
];

const workflowTemplates = [
  {
    name: 'Digital Therapeutic Development',
    description: 'Complete workflow for DTx product development',
    category: 'Development',
    estimatedTime: '3-6 months',
  },
  {
    name: 'Clinical Validation Process',
    description: 'End-to-end clinical trial management',
    category: 'Clinical',
    estimatedTime: '6-12 months',
  },
  {
    name: 'Regulatory Compliance Check',
    description: 'Automated compliance verification',
    category: 'Compliance',
    estimatedTime: '1-2 weeks',
  },
  {
    name: 'Market Launch Preparation',
    description: 'Go-to-market workflow for healthcare products',
    category: 'Marketing',
    estimatedTime: '2-4 months',
  },
];

export default function WorkflowsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-deep-charcoal">Workflows</h1>
          <p className="text-medical-gray mt-2">
            Automate and streamline your healthcare technology processes
          </p>
        </div>
        <Button className="bg-trust-blue hover:bg-trust-blue/90">
          <Plus className="mr-2 h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {/* Active Workflows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-trust-blue" />
            Active Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleWorkflows.map((workflow) => (
              <Card 
                key={workflow.id} 
                className="border-l-4 border-l-vital-primary-500 hover:shadow-lg transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${workflow.bgColor} w-10 h-10 flex items-center justify-center`}>
                        <Image
                          src={workflow.icon}
                          alt=""
                          width={20}
                          height={20}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-deep-charcoal">
                          {workflow.name}
                        </h3>
                        <p className="text-sm text-medical-gray">
                          {workflow.description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        workflow.status === 'active'
                          ? 'default'
                          : workflow.status === 'paused'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {workflow.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-medical-gray">Last Run</p>
                      <p className="text-sm font-medium">{workflow.lastRun}</p>
                    </div>
                    <div>
                      <p className="text-xs text-medical-gray">Next Run</p>
                      <p className="text-sm font-medium">{workflow.nextRun}</p>
                    </div>
                    <div>
                      <p className="text-xs text-medical-gray">Steps</p>
                      <p className="text-sm font-medium">{workflow.steps}</p>
                    </div>
                    <div>
                      <p className="text-xs text-medical-gray">Success Rate</p>
                      <p className="text-sm font-medium">{workflow.successRate}%</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Play className="mr-1 h-3 w-3" />
                      Run
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="mr-1 h-3 w-3" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowTemplates.map((template, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:border-vital-primary-300 hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold text-deep-charcoal mb-2">
                    {template.name}
                  </h3>
                  <p className="text-sm text-medical-gray mb-3">
                    {template.description}
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                    <p className="text-xs text-medical-gray">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {template.estimatedTime}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-medical-gray">Total Workflows</p>
                <p className="text-2xl font-bold text-deep-charcoal">12</p>
              </div>
              <Workflow className="h-8 w-8 text-trust-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-medical-gray">Active</p>
                <p className="text-2xl font-bold text-clinical-green">8</p>
              </div>
              <CheckCircle className="h-8 w-8 text-clinical-green" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-medical-gray">Paused</p>
                <p className="text-2xl font-bold text-regulatory-gold">3</p>
              </div>
              <Pause className="h-8 w-8 text-regulatory-gold" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-medical-gray">Errors</p>
                <p className="text-2xl font-bold text-red-500">1</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
