'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Users,
  Play,
  Pause,
  MoreHorizontal,
  Brain,
  Target,
  TestTube,
  BookOpen,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const phaseConfig = {
  vision: {
    label: 'Vision',
    color: 'bg-trust-blue',
    textColor: 'text-trust-blue',
    bgColor: 'bg-trust-blue/10',
    icon: Brain,
  },
  integrate: {
    label: 'Integrate',
    color: 'bg-progress-teal',
    textColor: 'text-progress-teal',
    bgColor: 'bg-progress-teal/10',
    icon: Target,
  },
  test: {
    label: 'Test',
    color: 'bg-clinical-green',
    textColor: 'text-clinical-green',
    bgColor: 'bg-clinical-green/10',
    icon: TestTube,
  },
  activate: {
    label: 'Activate',
    color: 'bg-regulatory-gold',
    textColor: 'text-regulatory-gold',
    bgColor: 'bg-regulatory-gold/10',
    icon: Play,
  },
  learn: {
    label: 'Learn',
    color: 'bg-market-purple',
    textColor: 'text-market-purple',
    bgColor: 'bg-market-purple/10',
    icon: BookOpen,
  },
};

interface Project {
  id: string;
  name: string;
  phase: 'vision' | 'integrate' | 'test' | 'activate' | 'learn';
  progress: number;
  daysActive: number;
  teamMembers: number;
  status: 'active' | 'paused' | 'completed';
  lastActivity: string;
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const phaseInfo = phaseConfig[project.phase];
  const PhaseIcon = phaseInfo.icon;

  const statusConfig = {
    active: { color: 'bg-clinical-green', label: 'Active' },
    paused: { color: 'bg-regulatory-gold', label: 'Paused' },
    completed: { color: 'bg-trust-blue', label: 'Completed' },
  };

  const generateAvatars = (count: number) => {
    return Array.from({ length: Math.min(count, 4) }, (_, i) => (
      <Avatar key={i} className="h-6 w-6 border-2 border-white">
        <AvatarFallback className="text-xs bg-gradient-to-br from-trust-blue to-progress-teal text-white">
          {String.fromCharCode(65 + i)}
        </AvatarFallback>
      </Avatar>
    ));
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${phaseInfo.bgColor}`}>
              <PhaseIcon className={`h-4 w-4 ${phaseInfo.textColor}`} />
            </div>
            <div>
              <h3 className="font-semibold text-deep-charcoal text-sm leading-tight">
                {project.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className={`text-xs ${phaseInfo.textColor} ${phaseInfo.bgColor}`}
                >
                  {phaseInfo.label}
                </Badge>
                <div className={`w-2 h-2 rounded-full ${statusConfig[project.status].color}`} />
                <span className="text-xs text-medical-gray">
                  {statusConfig[project.status].label}
                </span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Project</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuItem className="text-clinical-red">
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          {/* Progress */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-medical-gray">Progress</span>
              <span className="text-xs font-medium text-deep-charcoal">
                {project.progress}%
              </span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-medical-gray">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{project.daysActive} days</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{project.teamMembers} members</span>
              </div>
            </div>
            <span>Last: {project.lastActivity}</span>
          </div>

          {/* Team Avatars */}
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              {generateAvatars(project.teamMembers)}
            </div>
            {project.teamMembers > 4 && (
              <span className="text-xs text-medical-gray ml-2">
                +{project.teamMembers - 4} more
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}