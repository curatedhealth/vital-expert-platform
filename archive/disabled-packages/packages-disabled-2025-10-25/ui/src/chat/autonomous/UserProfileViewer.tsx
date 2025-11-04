'use client';

import { User, Briefcase, Target, Settings2, RefreshCw, X, Calendar, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';
import { useUserProfile } from '@/hooks/useAutonomousAgent';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Progress } from '@/shared/components/ui/progress';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import type { UserFact, UserProject, UserGoal, UserPreference, FactCategory } from '@/types/autonomous-agent.types';

interface UserProfileViewerProps {
  userId: string;
  open: boolean;
  onClose: () => void;
}

const categoryColors: Record<FactCategory, string> = {
  preference: 'bg-blue-500/10 text-blue-500',
  context: 'bg-green-500/10 text-green-500',
  history: 'bg-purple-500/10 text-purple-500',
  goal: 'bg-orange-500/10 text-orange-500',
  constraint: 'bg-red-500/10 text-red-500',
};

const categoryIcons: Record<FactCategory, any> = {
  preference: Settings2,
  context: User,
  history: Calendar,
  goal: Target,
  constraint: TrendingUp,
};

export function UserProfileViewer({ userId, open, onClose }: UserProfileViewerProps) {
  const { profile, isLoading, error, fetchProfile } = useUserProfile(userId);

  useEffect(() => {
    if (open && userId) {
      fetchProfile();
    }
  }, [open, userId, fetchProfile]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <DialogTitle>User Profile & Long-Term Memory</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={fetchProfile} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogDescription>
            What the autonomous agent knows about you across all sessions
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        {isLoading && !profile && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {profile && (
          <ScrollArea className="h-[60vh]">
            <div className="space-y-6 pr-4">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Profile Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {profile.summary || 'No profile information available yet.'}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <span>{profile.totalFacts || 0} facts learned</span>
                    <span>•</span>
                    <span>Last updated: {new Date(profile.lastUpdated || Date.now()).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="facts" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="facts">Facts</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="goals">Goals</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>

                {/* Facts Tab */}
                <TabsContent value="facts" className="space-y-4">
                  {profile.categories && Object.keys(profile.categories).length > 0 ? (
                    Object.entries(profile.categories).map(([category, facts]: [string, any[]]) => {
                      if (!facts || facts.length === 0) return null;

                      const Icon = categoryIcons[category as FactCategory];

                      return (
                        <Card key={category}>
                          <CardHeader>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <CardTitle className="text-sm capitalize">{category}</CardTitle>
                              <Badge variant="secondary" className="ml-auto">
                                {facts.length}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {facts.map((fact: UserFact) => (
                                <div
                                  key={fact.id}
                                  className="flex items-start gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors"
                                >
                                  <div className="flex-1">
                                    <p className="text-sm">{fact.fact}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge
                                        variant="outline"
                                        className={categoryColors[fact.category]}
                                      >
                                        {fact.source}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        Confidence: {Math.round(fact.confidence * 100)}%
                                      </span>
                                      <span className="text-xs text-muted-foreground">•</span>
                                      <span className="text-xs text-muted-foreground">
                                        Used {fact.access_count} times
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No facts learned yet. Start a conversation to build your profile!
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Projects Tab */}
                <TabsContent value="projects" className="space-y-4">
                  {profile.activeProjects && profile.activeProjects.length > 0 ? (
                    profile.activeProjects.map((project: UserProject) => (
                      <Card key={project.id}>
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            <CardTitle className="text-sm">{project.name}</CardTitle>
                            <Badge variant="outline" className="ml-auto">
                              {project.type}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge>{project.status}</Badge>
                            <span className="text-xs text-muted-foreground">
                              Last accessed: {new Date(project.last_accessed).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No projects tracked yet. Mention what you're working on to get started!
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Goals Tab */}
                <TabsContent value="goals" className="space-y-4">
                  {profile.activeGoals && profile.activeGoals.length > 0 ? (
                    profile.activeGoals.map((goal: UserGoal) => (
                      <Card key={goal.id}>
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            <CardTitle className="text-sm">{goal.title}</CardTitle>
                            <Badge variant="outline" className="ml-auto">
                              {goal.progress}%
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                            {goal.target_date && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                <Calendar className="h-3 w-3" />
                                <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No goals set yet. Share your objectives to track progress!
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-4">
                  {profile.preferences && Object.keys(profile.preferences).length > 0 ? (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          {Object.entries(profile.preferences).map(([key, value]: [string, any]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors"
                            >
                              <span className="text-sm font-medium">{key.replace(/_/g, ' ')}</span>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </code>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No preferences saved yet. Your workflow preferences will appear here!
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
