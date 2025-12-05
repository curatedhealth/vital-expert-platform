'use client';

import {
  Target,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Flag,
  Clock,
  BarChart3,
  Lightbulb,
  AlertCircle,
  Star
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Progress } from '@vital/ui';
import { cn } from '@/shared/services/utils';

interface JobOutcome {
  id: string;
  title: string;
  description: string;
  category: 'functional' | 'emotional' | 'social';
  priority: 'high' | 'medium' | 'low';
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  metrics?: Array<{
    name: string;
    current: number;
    target: number;
    unit: string;
  }>;
  milestones?: Array<{
    title: string;
    completed: boolean;
    date?: string;
  }>;
}

interface JobsFrameworkProps {
  jobDescription: string;
  onJobComplete?: (outcomes: JobOutcome[]) => void;
  className?: string;
}

const SAMPLE_OUTCOMES: JobOutcome[] = [
  {
    id: 'regulatory-approval',
    title: 'Achieve Regulatory Approval',
    description: 'Obtain FDA 510(k) clearance for digital health device',
    category: 'functional',
    priority: 'high',
    progress: 25,
    status: 'in-progress',
    metrics: [
      { name: 'Submission Progress', current: 25, target: 100, unit: '%' },
      { name: 'Documentation Complete', current: 67, target: 100, unit: '%' },
      { name: 'Timeline Adherence', current: 85, target: 100, unit: '%' }
    ],
    milestones: [
      { title: 'Pre-submission meeting completed', completed: true, date: '2024-09-15' },
      { title: '510(k) documentation prepared', completed: true, date: '2024-09-20' },
      { title: 'Clinical validation completed', completed: false },
      { title: 'FDA submission filed', completed: false },
      { title: 'FDA clearance received', completed: false }
    ]
  },
  {
    id: 'clinical-validation',
    title: 'Demonstrate Clinical Efficacy',
    description: 'Establish evidence of clinical benefit and safety profile',
    category: 'functional',
    priority: 'high',
    progress: 45,
    status: 'in-progress',
    metrics: [
      { name: 'Patient Enrollment', current: 156, target: 200, unit: 'patients' },
      { name: 'Primary Endpoint', current: 78, target: 80, unit: '%' },
      { name: 'Safety Events', current: 2, target: 5, unit: 'max events' }
    ],
    milestones: [
      { title: 'Protocol finalized', completed: true },
      { title: 'IRB approval obtained', completed: true },
      { title: 'Patient recruitment started', completed: true },
      { title: 'Interim analysis completed', completed: false },
      { title: 'Study completion', completed: false }
    ]
  },
  {
    id: 'user-confidence',
    title: 'Build User Confidence',
    description: 'Establish trust and confidence among healthcare providers',
    category: 'emotional',
    priority: 'high',
    progress: 60,
    status: 'in-progress',
    metrics: [
      { name: 'User Satisfaction', current: 4.2, target: 4.5, unit: '/5.0' },
      { name: 'Adoption Rate', current: 65, target: 80, unit: '%' },
      { name: 'Recommendation Score', current: 8.1, target: 9.0, unit: '/10' }
    ]
  },
  {
    id: 'market-recognition',
    title: 'Gain Market Recognition',
    description: 'Establish reputation and credibility in the healthcare market',
    category: 'social',
    priority: 'medium',
    progress: 30,
    status: 'in-progress',
    metrics: [
      { name: 'Industry Awards', current: 1, target: 3, unit: 'awards' },
      { name: 'Press Coverage', current: 12, target: 25, unit: 'articles' },
      { name: 'Conference Presentations', current: 4, target: 8, unit: 'presentations' }
    ]
  }
];

export function JobsFramework({ jobDescription, onJobComplete, className }: JobsFrameworkProps) {
  const [outcomes, setOutcomes] = useState<JobOutcome[]>(SAMPLE_OUTCOMES);
  const [selectedOutcome, setSelectedOutcome] = useState<JobOutcome | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    // Simulate analysis of the job description
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  }, [jobDescription]);

    switch (category) {
      case 'functional': return 'bg-blue-500';
      case 'emotional': return 'bg-green-500';
      case 'social': return 'bg-purple-500';
      default: return 'bg-neutral-500';
    }
  };

    switch (category) {
      case 'functional': return Target;
      case 'emotional': return Star;
      case 'social': return TrendingUp;
      default: return Flag;
    }
  };

    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
    }
  };

    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      case 'blocked': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

    switch (status) {
      case 'completed': return CheckCircle;
      case 'in-progress': return Clock;
      case 'blocked': return AlertCircle;
      default: return Flag;
    }
  };

  if (isAnalyzing) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Target className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <CardTitle>Jobs-to-be-Done Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">Analyzing outcomes and success metrics...</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm">{jobDescription}</p>
              </CardContent>
            </Card>
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Identifying key outcomes...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Jobs-to-be-Done Framework</CardTitle>
              <p className="text-sm text-muted-foreground">Outcome-focused execution</p>
            </div>
          </div>
          <Badge variant="secondary">
            {outcomes.filter((o: any) => o.status === 'completed').length} / {outcomes.length} Complete
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Job Description */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <Lightbulb className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <h4 className="font-medium text-sm mb-1">Job to be Done:</h4>
                <p className="text-sm">{jobDescription}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outcomes Grid */}
        <div className="grid gap-4">
          <h4 className="font-medium text-sm flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Key Outcomes
          </h4>

          <div className="space-y-4">
            {outcomes.map((outcome) => {

              return (
                <Card
                  key={outcome.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    selectedOutcome?.id === outcome.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedOutcome(outcome)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={cn("p-2 rounded-lg", getCategoryColor(outcome.category))}>
                            <CategoryIcon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h5 className="font-medium">{outcome.title}</h5>
                              <Badge variant="outline" className={cn("text-xs", getPriorityColor(outcome.priority))}>
                                {outcome.priority} priority
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{outcome.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={cn("h-4 w-4", getStatusColor(outcome.status))} />
                          <Badge variant="outline" className="text-xs">
                            {outcome.progress}%
                          </Badge>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>{outcome.progress}% complete</span>
                        </div>
                        <Progress value={outcome.progress} className="h-1.5" />
                      </div>

                      {/* Metrics */}
                      {outcome.metrics && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {outcome.metrics.map((metric, i) => (
                            <div key={i} className="bg-muted/50 p-2 rounded text-xs">
                              <div className="font-medium">{metric.name}</div>
                              <div className="text-muted-foreground">
                                {metric.current}{metric.unit} / {metric.target}{metric.unit}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Milestones Preview */}
                      {outcome.milestones && selectedOutcome?.id === outcome.id && (
                        <div className="space-y-2">
                          <h6 className="text-xs font-medium text-muted-foreground">Milestones:</h6>
                          <div className="space-y-1">
                            {outcome.milestones.slice(0, 3).map((milestone, i) => (
                              <div key={i} className="flex items-center space-x-2 text-xs">
                                {milestone.completed ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <div className="w-3 h-3 border border-muted-foreground rounded-full" />
                                )}
                                <span className={milestone.completed ? 'line-through text-muted-foreground' : ''}>
                                  {milestone.title}
                                </span>
                                {milestone.date && (
                                  <span className="text-muted-foreground">({milestone.date})</span>
                                )}
                              </div>
                            ))}
                            {outcome.milestones.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{outcome.milestones.length - 3} more milestones
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <TrendingUp className="h-5 w-5 mr-2" />
              Execution Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {outcomes.filter((o: any) => o.status === 'completed').length}
                </div>
                <div className="text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {outcomes.filter((o: any) => o.status === 'in-progress').length}
                </div>
                <div className="text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {outcomes.filter((o: any) => o.status === 'blocked').length}
                </div>
                <div className="text-muted-foreground">Blocked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{overallProgress}%</div>
                <div className="text-muted-foreground">Overall</div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-medium text-sm">Next Actions:</h5>
              <ul className="text-sm space-y-1">
                <li className="flex items-center space-x-2">
                  <ArrowRight className="h-3 w-3 text-orange-600" />
                  <span>Complete interim clinical analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ArrowRight className="h-3 w-3 text-orange-600" />
                  <span>Finalize FDA submission documentation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ArrowRight className="h-3 w-3 text-orange-600" />
                  <span>Increase user adoption initiatives</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}