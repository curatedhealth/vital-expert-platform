'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PhaseActions } from '@/components/platform/phase-actions';
import { BookOpen, TrendingUp, Users, FileText } from 'lucide-react';

export default function LearnPage() {
  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-market-purple/10">
            <BookOpen className="h-6 w-6 text-market-purple" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-deep-charcoal">Learning Phase</h1>
            <p className="text-medical-gray">
              Continuous learning and improvement based on real-world data
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-market-purple/10 text-market-purple">
          0% Complete
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                Continuous learning phase features are under development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-medical-gray">
                This phase will include continuous learning algorithms, real-world evidence collection, and performance optimization tools.
              </p>
            </CardContent>
          </Card>
        </div>

        <PhaseActions
          phase="learn"
          actions={[
            { id: 'analytics-setup', label: 'Setup Analytics', icon: 'chart' },
            { id: 'user-feedback', label: 'Collect User Feedback', icon: 'users' },
            { id: 'performance-report', label: 'Generate Performance Report', icon: 'document' },
            { id: 'improvement-plan', label: 'Create Improvement Plan', icon: 'brain' },
          ]}
        />
      </div>
    </div>
  );
}