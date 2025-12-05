"use client";

/**
 * Trials & Testing Phase (T)
 *
 * Third phase of VITAL Journey - design and run experiments to validate
 * AI opportunities, build prototypes, measure impact.
 */

import { useState } from "react";
import {
  FlaskConical,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  Plus,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@vital/ui";
import { Button } from "@vital/ui";
import { Badge } from "@vital/ui";
import { Progress } from "@vital/ui";
import { VITAL_PHASES } from "../../types/journey.types";

interface TrialsPhaseProps {
  onComplete: () => void;
}

interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  status: "planned" | "running" | "completed" | "failed";
  progress: number;
  successRate?: number;
  participants?: number;
}

const MOCK_EXPERIMENTS: Experiment[] = [
  {
    id: "exp-1",
    name: "Medical Literature Summarization",
    hypothesis: "AI can reduce literature review time by 60%",
    status: "completed",
    progress: 100,
    successRate: 78,
    participants: 12,
  },
  {
    id: "exp-2",
    name: "Regulatory Document Classification",
    hypothesis: "Auto-classification accuracy exceeds 90%",
    status: "running",
    progress: 65,
    participants: 8,
  },
  {
    id: "exp-3",
    name: "KOL Engagement Prediction",
    hypothesis: "Predict engagement likelihood with 80% accuracy",
    status: "planned",
    progress: 0,
  },
];

export function TrialsPhase({ onComplete }: TrialsPhaseProps) {
  const [step, setStep] = useState(1);
  const [experiments, setExperiments] = useState<Experiment[]>(MOCK_EXPERIMENTS);
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);

  const config = VITAL_PHASES.T;

  const runningExperiments = experiments.filter(e => e.status === "running").length;
  const completedExperiments = experiments.filter(e => e.status === "completed").length;
  const successfulExperiments = experiments.filter(e => e.status === "completed" && (e.successRate || 0) >= 70).length;

  const startExperiment = (id: string) => {
    setExperiments(prev => prev.map(e =>
      e.id === id ? { ...e, status: "running" as const, progress: 10 } : e
    ));
  };

  const completeExperiment = (id: string) => {
    setExperiments(prev => prev.map(e =>
      e.id === id ? { ...e, status: "completed" as const, progress: 100, successRate: Math.floor(Math.random() * 30) + 70 } : e
    ));
  };

  const progress = (step / 3) * 100;

  const getStatusIcon = (status: Experiment["status"]) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "running": return <Play className="w-4 h-4 text-blue-500 animate-pulse" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: Experiment["status"]) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case "running": return <Badge className="bg-blue-100 text-blue-700">Running</Badge>;
      case "failed": return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
      default: return <Badge variant="outline">Planned</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Phase Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-xl text-white shadow-lg"
            style={{ backgroundColor: config.color }}
          >
            <FlaskConical className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{config.title}</h2>
            <p className="text-muted-foreground">{config.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium">Progress</div>
            <div className="text-2xl font-bold" style={{ color: config.color }}>{Math.round(progress)}%</div>
          </div>
          <Progress value={progress} className="w-32 h-2" />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold" style={{ color: config.color }}>{experiments.length}</div>
            <div className="text-sm text-muted-foreground">Total Experiments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-500">{runningExperiments}</div>
            <div className="text-sm text-muted-foreground">Running</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-500">{completedExperiments}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-emerald-600">{successfulExperiments}</div>
            <div className="text-sm text-muted-foreground">Successful</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5" style={{ color: config.color }} />
                  Step 1: Design Experiments
                </CardTitle>
                <CardDescription>
                  Create and configure experiments for your top opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {experiments.map((exp) => (
                  <div
                    key={exp.id}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all cursor-pointer",
                      selectedExperiment === exp.id
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => setSelectedExperiment(exp.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(exp.status)}
                        <div>
                          <div className="font-medium">{exp.name}</div>
                          <div className="text-sm text-muted-foreground mt-1">{exp.hypothesis}</div>
                        </div>
                      </div>
                      {getStatusBadge(exp.status)}
                    </div>
                    {exp.status === "running" && (
                      <div className="mt-3">
                        <Progress value={exp.progress} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">{exp.progress}% complete</div>
                      </div>
                    )}
                  </div>
                ))}

                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Experiment
                </Button>

                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} style={{ backgroundColor: config.color }}>
                    Continue to Execution <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" style={{ color: config.color }} />
                  Step 2: Run Experiments
                </CardTitle>
                <CardDescription>
                  Execute experiments and monitor progress in real-time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {experiments.map((exp) => (
                  <div key={exp.id} className="p-4 rounded-lg border bg-white dark:bg-gray-900">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(exp.status)}
                        <span className="font-medium">{exp.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(exp.status)}
                        {exp.status === "planned" && (
                          <Button size="sm" onClick={() => startExperiment(exp.id)}>
                            <Play className="w-3 h-3 mr-1" /> Start
                          </Button>
                        )}
                        {exp.status === "running" && (
                          <Button size="sm" variant="outline" onClick={() => completeExperiment(exp.id)}>
                            <Pause className="w-3 h-3 mr-1" /> Complete
                          </Button>
                        )}
                      </div>
                    </div>
                    <Progress value={exp.progress} className="h-2" />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>{exp.progress}% complete</span>
                      {exp.participants && <span>{exp.participants} participants</span>}
                    </div>
                  </div>
                ))}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)} style={{ backgroundColor: config.color }}>
                    View Results <BarChart3 className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: config.color }} />
                  Step 3: Measure Impact
                </CardTitle>
                <CardDescription>
                  Review experiment results and proof of value
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {experiments.filter(e => e.status === "completed").map((exp) => (
                  <div key={exp.id} className="p-4 rounded-lg border bg-white dark:bg-gray-900">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium">{exp.name}</div>
                        <div className="text-sm text-muted-foreground">{exp.hypothesis}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold" style={{ color: config.color }}>
                          {exp.successRate}%
                        </div>
                        <div className="text-xs text-muted-foreground">Success Rate</div>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {exp.participants} participants
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-muted-foreground" />
                        {(exp.successRate || 0) >= 70 ? "Validated" : "Needs Iteration"}
                      </div>
                    </div>
                  </div>
                ))}

                {experiments.filter(e => e.status === "completed").length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No completed experiments yet. Run experiments to see results.
                  </div>
                )}

                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-800 dark:text-green-200">
                        Trials Phase Complete
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        {successfulExperiments} experiments validated.
                        Ready to proceed to Adoption.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
                    Complete Phase <CheckCircle2 className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FlaskConical className="w-4 h-4" style={{ color: config.color }} />
                Objectives
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {config.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className={cn(
                      "w-4 h-4 mt-0.5 flex-shrink-0",
                      i < step ? "text-green-500" : "text-gray-300"
                    )} />
                    <span className={cn(i < step && "text-muted-foreground line-through")}>
                      {obj}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color: config.color }} />
                Success Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Experiments Run:</span>
                <span className="font-medium">{completedExperiments + runningExperiments}/{experiments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Success Rate:</span>
                <span className="font-medium text-green-600">
                  {completedExperiments > 0
                    ? Math.round((successfulExperiments / completedExperiments) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ready for Adoption:</span>
                <span className="font-medium">{successfulExperiments}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
