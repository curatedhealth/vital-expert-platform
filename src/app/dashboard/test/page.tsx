'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PhaseActions } from '@/components/platform/phase-actions';
import { TestTube, ClipboardCheck, Users, FileText } from 'lucide-react';

export default function TestPage() {
  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-clinical-green/10">
            <TestTube className="h-6 w-6 text-clinical-green" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-deep-charcoal">Trials Phase</h1>
            <p className="text-medical-gray">
              Conduct clinical trials and regulatory compliance verification
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-clinical-green/10 text-clinical-green">
          30% Complete
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                Clinical trials phase features are under development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-medical-gray">
                This phase will include clinical trials management, patient recruitment, and regulatory compliance verification tools.
              </p>
            </CardContent>
          </Card>
        </div>

        <PhaseActions
          phase="test"
          actions={[
            { id: 'clinical-protocol', label: 'Create Clinical Protocol', icon: 'document' },
            { id: 'user-testing', label: 'Schedule User Testing', icon: 'users' },
            { id: 'compliance-check', label: 'Run Compliance Check', icon: 'help' },
            { id: 'test-report', label: 'Generate Test Report', icon: 'chart' },
          ]}
        />
      </div>
    </div>
  );
}