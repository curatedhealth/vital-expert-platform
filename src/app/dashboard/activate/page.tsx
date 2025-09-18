'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PhaseActions } from '@/components/platform/phase-actions';
import { Play, Rocket, Users, BarChart3 } from 'lucide-react';

export default function ActivatePage() {
  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-regulatory-gold/10">
            <Play className="h-6 w-6 text-regulatory-gold" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-deep-charcoal">Activation Phase</h1>
            <p className="text-medical-gray">
              Launch your solution and manage successful market activation
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-regulatory-gold/10 text-regulatory-gold">
          0% Complete
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                Market activation phase features are under development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-medical-gray">
                This phase will include market activation strategies, deployment management, and launch monitoring tools.
              </p>
            </CardContent>
          </Card>
        </div>

        <PhaseActions
          phase="activate"
          actions={[
            { id: 'launch-plan', label: 'Create Launch Plan', icon: 'document' },
            { id: 'deployment', label: 'Deploy to Production', icon: 'zap' },
            { id: 'monitor-launch', label: 'Monitor Launch Metrics', icon: 'chart' },
            { id: 'user-onboarding', label: 'Setup User Onboarding', icon: 'users' },
          ]}
        />
      </div>
    </div>
  );
}