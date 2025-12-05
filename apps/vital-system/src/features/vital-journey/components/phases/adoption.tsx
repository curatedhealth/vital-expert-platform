"use client";

/**
 * Adoption & Acceleration Phase (A)
 *
 * Fourth phase of VITAL Journey - roll out validated solutions,
 * enable users, integrate with existing systems.
 */

import { useState } from "react";
import {
  Rocket,
  Users,
  Settings,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Plug,
  BarChart3,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@vital/ui";
import { Button } from "@vital/ui";
import { Badge } from "@vital/ui";
import { Progress } from "@vital/ui";
import { VITAL_PHASES } from "../../types/journey.types";

interface AdoptionPhaseProps {
  onComplete: () => void;
}

interface Solution {
  id: string;
  name: string;
  status: "pending" | "deploying" | "deployed" | "adopted";
  adoption: number;
  users: number;
  integrations: number;
}

const MOCK_SOLUTIONS: Solution[] = [
  {
    id: "sol-1",
    name: "Medical Literature AI Assistant",
    status: "adopted",
    adoption: 85,
    users: 45,
    integrations: 3,
  },
  {
    id: "sol-2",
    name: "Regulatory Document Classifier",
    status: "deployed",
    adoption: 60,
    users: 28,
    integrations: 2,
  },
  {
    id: "sol-3",
    name: "KOL Engagement Predictor",
    status: "deploying",
    adoption: 25,
    users: 10,
    integrations: 1,
  },
];

export function AdoptionPhase({ onComplete }: AdoptionPhaseProps) {
  const [step, setStep] = useState(1);
  const [solutions, setSolutions] = useState<Solution[]>(MOCK_SOLUTIONS);
  const [trainingProgress, setTrainingProgress] = useState(45);

  const config = VITAL_PHASES.A;

  const totalUsers = solutions.reduce((sum, s) => sum + s.users, 0);
  const avgAdoption = Math.round(solutions.reduce((sum, s) => sum + s.adoption, 0) / solutions.length);
  const deployedCount = solutions.filter(s => s.status === "deployed" || s.status === "adopted").length;

  const progress = (step / 4) * 100;

  const getStatusColor = (status: Solution["status"]) => {
    switch (status) {
      case "adopted": return "bg-green-100 text-green-700";
      case "deployed": return "bg-blue-100 text-blue-700";
      case "deploying": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const deployNextSolution = () => {
    setSolutions(prev => prev.map((s, i) => {
      if (s.status === "pending") {
        return { ...s, status: "deploying" as const, adoption: 10 };
      }
      if (s.status === "deploying") {
        return { ...s, status: "deployed" as const, adoption: 50 };
      }
      return s;
    }));
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
            <Rocket className="w-7 h-7" />
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
            <div className="text-3xl font-bold" style={{ color: config.color }}>{solutions.length}</div>
            <div className="text-sm text-muted-foreground">Solutions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-500">{deployedCount}</div>
            <div className="text-sm text-muted-foreground">Deployed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-500">{totalUsers}</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-amber-500">{avgAdoption}%</div>
            <div className="text-sm text-muted-foreground">Avg Adoption</div>
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
                  <Rocket className="w-5 h-5" style={{ color: config.color }} />
                  Step 1: Deploy Solutions
                </CardTitle>
                <CardDescription>
                  Roll out validated AI solutions to production
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {solutions.map((solution) => (
                  <div key={solution.id} className="p-4 rounded-lg border bg-white dark:bg-gray-900">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium">{solution.name}</div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {solution.users} users
                          </span>
                          <span className="flex items-center gap-1">
                            <Plug className="w-3 h-3" /> {solution.integrations} integrations
                          </span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(solution.status)}>
                        {solution.status.charAt(0).toUpperCase() + solution.status.slice(1)}
                      </Badge>
                    </div>
                    <Progress value={solution.adoption} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">{solution.adoption}% adoption</div>
                  </div>
                ))}

                <Button variant="outline" onClick={deployNextSolution} className="w-full">
                  <Rocket className="w-4 h-4 mr-2" />
                  Deploy Next Solution
                </Button>

                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} style={{ backgroundColor: config.color }}>
                    Continue to Training <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" style={{ color: config.color }} />
                  Step 2: Train & Enable Users
                </CardTitle>
                <CardDescription>
                  Provide training materials and enable teams
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium">Training Program Progress</div>
                    <span className="text-2xl font-bold" style={{ color: config.color }}>{trainingProgress}%</span>
                  </div>
                  <Progress value={trainingProgress} className="h-3" />
                  <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
                    <div>
                      <div className="font-medium">Modules</div>
                      <div className="text-muted-foreground">12 / 15</div>
                    </div>
                    <div>
                      <div className="font-medium">Users Trained</div>
                      <div className="text-muted-foreground">65 / 100</div>
                    </div>
                    <div>
                      <div className="font-medium">Certifications</div>
                      <div className="text-muted-foreground">45</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {["Quick Start Guide", "Video Tutorials", "Best Practices", "FAQ & Troubleshooting"].map((item) => (
                    <div key={item} className="p-3 rounded-lg border flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => setTrainingProgress(Math.min(100, trainingProgress + 20))}
                  variant="outline"
                  className="w-full"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Complete Next Training Module
                </Button>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)} style={{ backgroundColor: config.color }}>
                    Continue to Integration <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plug className="w-5 h-5" style={{ color: config.color }} />
                  Step 3: Integrate with Workflows
                </CardTitle>
                <CardDescription>
                  Connect AI solutions to existing business processes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Veeva CRM", status: "connected", type: "CRM" },
                  { name: "SharePoint", status: "connected", type: "Documents" },
                  { name: "SAP", status: "pending", type: "ERP" },
                  { name: "Slack", status: "connected", type: "Communication" },
                ].map((integration) => (
                  <div key={integration.name} className="p-3 rounded-lg border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{integration.name}</div>
                        <div className="text-xs text-muted-foreground">{integration.type}</div>
                      </div>
                    </div>
                    <Badge className={integration.status === "connected" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                      {integration.status === "connected" ? "Connected" : "Pending"}
                    </Badge>
                  </div>
                ))}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={() => setStep(4)} style={{ backgroundColor: config.color }}>
                    View Adoption Metrics <BarChart3 className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: config.color }} />
                  Step 4: Measure Adoption
                </CardTitle>
                <CardDescription>
                  Track adoption metrics and acceleration progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border text-center">
                    <div className="text-4xl font-bold" style={{ color: config.color }}>{avgAdoption}%</div>
                    <div className="text-sm text-muted-foreground">Overall Adoption Rate</div>
                    <div className="text-xs text-green-600 mt-1">↑ 15% from last month</div>
                  </div>
                  <div className="p-4 rounded-lg border text-center">
                    <div className="text-4xl font-bold text-blue-500">{totalUsers}</div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                    <div className="text-xs text-green-600 mt-1">↑ 23 new this week</div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-800 dark:text-green-200">
                        Adoption Phase Complete
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        {deployedCount} solutions deployed with {avgAdoption}% average adoption.
                        Ready for Learning & Leadership phase.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
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
                <Target className="w-4 h-4" style={{ color: config.color }} />
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
                Deliverables
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {config.deliverables.map((del, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      i < step ? "bg-green-500" : "bg-gray-300"
                    )} />
                    {del}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
