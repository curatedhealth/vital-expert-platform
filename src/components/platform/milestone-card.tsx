'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  MoreHorizontal,
  Play,
  Pause,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  assignees: string[];
  progress: number;
  estimatedHours: number;
  actualHours: number;
}

interface MilestoneCardProps {
  milestone: Milestone;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-medical-gray',
    bgColor: 'bg-medical-gray/10',
    label: 'Pending',
  },
  in_progress: {
    icon: Play,
    color: 'text-progress-teal',
    bgColor: 'bg-progress-teal/10',
    label: 'In Progress',
  },
  completed: {
    icon: CheckCircle,
    color: 'text-clinical-green',
    bgColor: 'bg-clinical-green/10',
    label: 'Completed',
  },
  blocked: {
    icon: AlertTriangle,
    color: 'text-clinical-red',
    bgColor: 'bg-clinical-red/10',
    label: 'Blocked',
  },
};

const priorityConfig = {
  low: { color: 'bg-medical-gray text-white', label: 'Low' },
  medium: { color: 'bg-trust-blue text-white', label: 'Medium' },
  high: { color: 'bg-regulatory-gold text-white', label: 'High' },
  critical: { color: 'bg-clinical-red text-white', label: 'Critical' },
};

export function MilestoneCard({ milestone }: MilestoneCardProps) {
  const statusInfo = statusConfig[milestone.status];
  const priorityInfo = priorityConfig[milestone.priority];
  const StatusIcon = statusInfo.icon;

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue(milestone.dueDate);
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
              <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-deep-charcoal text-sm leading-tight">
                {milestone.title}
              </h3>
              <p className="text-xs text-medical-gray mt-1 line-clamp-2">
                {milestone.description}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Milestone</DropdownMenuItem>
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Assign Team</DropdownMenuItem>
              <DropdownMenuItem className="text-clinical-red">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          {/* Progress */}
          {milestone.status !== 'pending' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-medical-gray">Progress</span>
                <span className="text-xs font-medium text-deep-charcoal">
                  {milestone.progress}%
                </span>
              </div>
              <Progress value={milestone.progress} className="h-2" />
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className={`text-xs ${priorityInfo.color}`}
              >
                {priorityInfo.label}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs ${statusInfo.color}`}
              >
                {statusInfo.label}
              </Badge>
            </div>

            <div className="flex items-center gap-1 text-xs text-medical-gray">
              <Calendar className="h-3 w-3" />
              <span className={cn(
                isOverdue ? 'text-clinical-red font-medium' : '',
                isDueSoon ? 'text-regulatory-gold font-medium' : ''
              )}>
                {formatDate(milestone.dueDate)}
              </span>
            </div>
          </div>

          {/* Assignees and Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-medical-gray" />
              <div className="flex -space-x-1">
                {milestone.assignees.slice(0, 3).map((assignee, index) => (
                  <Avatar key={index} className="h-5 w-5 border-2 border-white">
                    <AvatarFallback className="bg-gradient-to-br from-trust-blue to-progress-teal text-white text-xs">
                      {getInitials(assignee)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {milestone.assignees.length > 3 && (
                <span className="text-xs text-medical-gray">
                  +{milestone.assignees.length - 3}
                </span>
              )}
            </div>

            <div className="text-xs text-medical-gray">
              {milestone.actualHours}h / {milestone.estimatedHours}h
            </div>
          </div>

          {/* Due Date Warning */}
          {(isOverdue || isDueSoon) && (
            <div className={`flex items-center gap-2 p-2 rounded-md text-xs ${
              isOverdue ? 'bg-clinical-red/10 text-clinical-red' : 'bg-regulatory-gold/10 text-regulatory-gold'
            }`}>
              <AlertTriangle className="h-3 w-3" />
              <span>
                {isOverdue
                  ? `Overdue by ${Math.abs(daysUntilDue)} days`
                  : `Due in ${daysUntilDue} days`
                }
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}