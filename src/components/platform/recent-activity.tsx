'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  FileText,
  MessageSquare,
  Users,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';

const activityTypes = {
  document_upload: {
    icon: Upload,
    color: 'text-trust-blue',
    bgColor: 'bg-trust-blue/10',
  },
  ai_query: {
    icon: MessageSquare,
    color: 'text-market-purple',
    bgColor: 'bg-market-purple/10',
  },
  milestone_completed: {
    icon: CheckCircle,
    color: 'text-clinical-green',
    bgColor: 'bg-clinical-green/10',
  },
  team_invite: {
    icon: Users,
    color: 'text-progress-teal',
    bgColor: 'bg-progress-teal/10',
  },
  report_generated: {
    icon: FileText,
    color: 'text-regulatory-gold',
    bgColor: 'bg-regulatory-gold/10',
  },
  compliance_alert: {
    icon: AlertTriangle,
    color: 'text-clinical-red',
    bgColor: 'bg-clinical-red/10',
  },
};

const recentActivities = [
  {
    id: '1',
    type: 'ai_query' as const,
    title: 'FDA Pre-submission Query',
    description: 'Asked regulatory expert about 510(k) pathway requirements',
    user: 'John Smith',
    project: 'Digital Therapeutics Platform',
    timestamp: '5 minutes ago',
    priority: 'normal' as const,
  },
  {
    id: '2',
    type: 'milestone_completed' as const,
    title: 'Market Analysis Completed',
    description: 'Vision phase milestone marked as complete',
    user: 'Sarah Johnson',
    project: 'AI-Powered Diagnostics Tool',
    timestamp: '2 hours ago',
    priority: 'high' as const,
  },
  {
    id: '3',
    type: 'document_upload' as const,
    title: 'Clinical Protocol Uploaded',
    description: 'Added clinical trial protocol v2.1 to knowledge base',
    user: 'Dr. Michael Chen',
    project: 'Remote Monitoring System',
    timestamp: '4 hours ago',
    priority: 'normal' as const,
  },
  {
    id: '4',
    type: 'compliance_alert' as const,
    title: 'HIPAA Compliance Review',
    description: 'Scheduled review for data handling procedures',
    user: 'System',
    project: 'All Projects',
    timestamp: '1 day ago',
    priority: 'critical' as const,
  },
  {
    id: '5',
    type: 'team_invite' as const,
    title: 'New Team Member',
    description: 'Invited regulatory consultant to join project team',
    user: 'Admin',
    project: 'Digital Therapeutics Platform',
    timestamp: '2 days ago',
    priority: 'normal' as const,
  },
];

const priorityConfig = {
  critical: { color: 'bg-clinical-red text-white', label: 'Critical' },
  high: { color: 'bg-regulatory-gold text-white', label: 'High' },
  normal: { color: 'bg-medical-gray text-white', label: 'Normal' },
};

export function RecentActivity() {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest updates across your digital health projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const typeConfig = activityTypes[activity.type];
            const TypeIcon = typeConfig.icon;

            return (
              <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                <div className={`p-2 rounded-lg ${typeConfig.bgColor} flex-shrink-0`}>
                  <TypeIcon className={`h-4 w-4 ${typeConfig.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-sm text-deep-charcoal">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-medical-gray mt-1">
                        {activity.description}
                      </p>
                    </div>
                    {activity.priority !== 'normal' && (
                      <Badge
                        variant="secondary"
                        className={`text-xs ${priorityConfig[activity.priority].color}`}
                      >
                        {priorityConfig[activity.priority].label}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-gradient-to-br from-trust-blue to-progress-teal text-white text-xs">
                          {getInitials(activity.user)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-medical-gray">{activity.user}</span>
                    </div>

                    <div className="text-xs text-medical-gray">•</div>

                    <span className="text-xs text-medical-gray">{activity.project}</span>

                    <div className="text-xs text-medical-gray">•</div>

                    <span className="text-xs text-medical-gray">{activity.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}