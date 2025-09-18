'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Upload,
  MessageSquare,
  FileText,
  Users,
  Settings,
  Brain,
  Zap,
} from 'lucide-react';

const quickActions = [
  {
    title: 'New Project',
    description: 'Start a new digital health transformation project',
    icon: Plus,
    color: 'bg-progress-teal/10 text-progress-teal',
    action: 'create-project',
  },
  {
    title: 'Upload Documents',
    description: 'Add regulatory or clinical documents to your knowledge base',
    icon: Upload,
    color: 'bg-trust-blue/10 text-trust-blue',
    action: 'upload-docs',
  },
  {
    title: 'Ask AI Expert',
    description: 'Query specialized LLMs for regulatory or clinical guidance',
    icon: Brain,
    color: 'bg-market-purple/10 text-market-purple',
    action: 'ai-query',
  },
  {
    title: 'Generate Report',
    description: 'Create compliance or progress reports automatically',
    icon: FileText,
    color: 'bg-clinical-green/10 text-clinical-green',
    action: 'generate-report',
  },
  {
    title: 'Invite Team',
    description: 'Add team members to collaborate on projects',
    icon: Users,
    color: 'bg-regulatory-gold/10 text-regulatory-gold',
    action: 'invite-team',
  },
  {
    title: 'Setup Workflow',
    description: 'Configure automated workflows for your processes',
    icon: Zap,
    color: 'bg-innovation-orange/10 text-innovation-orange',
    action: 'setup-workflow',
  },
];

export function QuickActions() {
  const handleAction = (action: string) => {
    console.log(`Triggering action: ${action}`);
    // TODO: Implement actual action handlers
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks to accelerate your digital health development
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.action}
              variant="outline"
              className="h-auto p-3 flex flex-col items-start gap-2 text-left hover:bg-background-gray"
              onClick={() => handleAction(action.action)}
            >
              <div className={`p-2 rounded-md ${action.color}`}>
                <action.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium text-sm text-deep-charcoal">
                  {action.title}
                </div>
                <div className="text-xs text-medical-gray leading-tight">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}