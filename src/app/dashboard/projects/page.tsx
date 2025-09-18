'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ProjectCard } from '@/components/platform/project-card';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Grid3X3,
  List,
} from 'lucide-react';

export default function ProjectsPage() {
  const projects = [
    {
      id: '1',
      name: 'Digital Therapeutics Platform',
      phase: 'integrate' as const,
      progress: 65,
      daysActive: 45,
      teamMembers: 8,
      status: 'active' as const,
      lastActivity: '2 hours ago',
    },
    {
      id: '2',
      name: 'AI-Powered Diagnostics Tool',
      phase: 'test' as const,
      progress: 30,
      daysActive: 23,
      teamMembers: 5,
      status: 'active' as const,
      lastActivity: '1 day ago',
    },
    {
      id: '3',
      name: 'Remote Monitoring System',
      phase: 'vision' as const,
      progress: 90,
      daysActive: 67,
      teamMembers: 12,
      status: 'paused' as const,
      lastActivity: '3 days ago',
    },
    {
      id: '4',
      name: 'Clinical Decision Support',
      phase: 'activate' as const,
      progress: 95,
      daysActive: 156,
      teamMembers: 15,
      status: 'completed' as const,
      lastActivity: '1 week ago',
    },
    {
      id: '5',
      name: 'Patient Portal Integration',
      phase: 'learn' as const,
      progress: 100,
      daysActive: 203,
      teamMembers: 6,
      status: 'completed' as const,
      lastActivity: '2 weeks ago',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-deep-charcoal">Projects</h1>
          <p className="text-medical-gray mt-1">
            Manage your digital health transformation projects
          </p>
        </div>
        <Button className="bg-progress-teal hover:bg-progress-teal/90">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medical-gray" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <div className="flex items-center gap-1 ml-auto">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Empty State or Load More */}
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-deep-charcoal mb-2">
              Ready to start a new project?
            </h3>
            <p className="text-medical-gray mb-4">
              Create a new digital health transformation project using the VITAL framework
            </p>
            <Button className="bg-progress-teal hover:bg-progress-teal/90">
              <Plus className="mr-2 h-4 w-4" />
              Create New Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}