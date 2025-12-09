"use client";

/**
 * Learning & Leadership Phase (L)
 *
 * Fifth and final phase of VITAL Journey - capture learnings,
 * optimize based on data, expand to new areas, establish thought leadership.
 */

import { useState } from "react";
import {
  GraduationCap,
  TrendingUp,
  Award,
  BookOpen,
  Share2,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Target,
  Lightbulb,
  Globe,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@vital/ui";
import { Button } from "@vital/ui";
import { Badge } from "@vital/ui";
import { Progress } from "@vital/ui";
import { VITAL_PHASES } from "../../types/journey.types";

interface LearningPhaseProps {
  onComplete: () => void;
}

interface Learning {
  id: string;
  title: string;
  type: "success" | "improvement" | "insight";
  impact: string;
  shared: boolean;
}

interface ExpansionOpportunity {
  id: string;
  area: string;
  potential: number;
  status: "identified" | "planned" | "in_progress";
}

const MOCK_LEARNINGS: Learning[] = [
  {
    id: "l-1",
    title: "AI-assisted literature review reduced time by 65%",
    type: "success",
    impact: "High",
    shared: true,
  },
  {
    id: "l-2",
    title: "Human oversight required for complex regulatory documents",
    type: "improvement",
    impact: "Medium",
    shared: true,
  },
  {
    id: "l-3",
    title: "Cross-functional collaboration accelerates adoption",
    type: "insight",
    impact: "High",
    shared: false,
  },
];

const MOCK_EXPANSIONS: ExpansionOpportunity[] = [
  { id: "e-1", area: "Clinical Operations", potential: 85, status: "in_progress" },
  { id: "e-2", area: "Pharmacovigilance", potential: 78, status: "planned" },
  { id: "e-3", area: "Market Access", potential: 72, status: "identified" },
];

export function LearningPhase({ onComplete }: LearningPhaseProps) {
  const [step, setStep] = useState(1);
  const [learnings, setLearnings] = useState<Learning[]>(MOCK_LEARNINGS);
  const [expansions, setExpansions] = useState<ExpansionOpportunity[]>(MOCK_EXPANSIONS);

  const config = VITAL_PHASES.L;

  const sharedLearnings = learnings.filter(l => l.shared).length;
  const activeExpansions = expansions.filter(e => e.status === "in_progress" || e.status === "planned").length;

  const progress = (step / 4) * 100;

  const getTypeIcon = (type: Learning["type"]) => {
    switch (type) {
      case "success": return <Star className="w-4 h-4 text-amber-500" />;
      case "improvement": return <Target className="w-4 h-4 text-blue-500" />;
      case "insight": return <Lightbulb className="w-4 h-4 text-purple-500" />;
    }
  };

  const getTypeBadge = (type: Learning["type"]) => {
    switch (type) {
      case "success": return <Badge className="bg-amber-100 text-amber-700">Success</Badge>;
      case "improvement": return <Badge className="bg-blue-100 text-blue-700">Improvement</Badge>;
      case "insight": return <Badge className="bg-purple-100 text-purple-700">Insight</Badge>;
    }
  };

  const shareLearning = (id: string) => {
    setLearnings(prev => prev.map(l =>
      l.id === id ? { ...l, shared: true } : l
    ));
  };

  const startExpansion = (id: string) => {
    setExpansions(prev => prev.map(e =>
      e.id === id ? { ...e, status: "in_progress" as const } : e
    ));
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
            <GraduationCap className="w-7 h-7" />
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
            <div className="text-3xl font-bold" style={{ color: config.color }}>{learnings.length}</div>
            <div className="text-sm text-muted-foreground">Learnings Captured</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-500">{sharedLearnings}</div>
            <div className="text-sm text-muted-foreground">Shared Across Org</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-500">{expansions.length}</div>
            <div className="text-sm text-muted-foreground">Expansion Areas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-500">{activeExpansions}</div>
            <div className="text-sm text-muted-foreground">Active Initiatives</div>
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
                  <BookOpen className="w-5 h-5" style={{ color: config.color }} />
                  Step 1: Capture Learnings
                </CardTitle>
                <CardDescription>
                  Document successes, improvements, and key insights from the journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {learnings.map((learning) => (
                  <div key={learning.id} className="p-4 rounded-lg border bg-white dark:bg-neutral-900">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getTypeIcon(learning.type)}
                        <div>
                          <div className="font-medium text-sm">{learning.title}</div>
                          <div className="flex items-center gap-2 mt-2">
                            {getTypeBadge(learning.type)}
                            <Badge variant="outline">Impact: {learning.impact}</Badge>
                          </div>
                        </div>
                      </div>
                      {learning.shared ? (
                        <Badge className="bg-green-100 text-green-700">Shared</Badge>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => shareLearning(learning.id)}>
                          <Share2 className="w-3 h-3 mr-1" /> Share
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} style={{ backgroundColor: config.color }}>
                    Continue to Impact Analysis <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: config.color }} />
                  Step 2: Measure Business Impact
                </CardTitle>
                <CardDescription>
                  Quantify the value delivered through the VITAL journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border text-center bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
                    <div className="text-4xl font-bold" style={{ color: config.color }}>65%</div>
                    <div className="text-sm font-medium mt-1">Time Saved</div>
                    <div className="text-xs text-muted-foreground">on literature review</div>
                  </div>
                  <div className="p-4 rounded-lg border text-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                    <div className="text-4xl font-bold text-blue-500">$2.4M</div>
                    <div className="text-sm font-medium mt-1">Estimated Savings</div>
                    <div className="text-xs text-muted-foreground">annual cost reduction</div>
                  </div>
                  <div className="p-4 rounded-lg border text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                    <div className="text-4xl font-bold text-green-500">92%</div>
                    <div className="text-sm font-medium mt-1">User Satisfaction</div>
                    <div className="text-xs text-muted-foreground">based on surveys</div>
                  </div>
                  <div className="p-4 rounded-lg border text-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                    <div className="text-4xl font-bold text-amber-500">3x</div>
                    <div className="text-sm font-medium mt-1">Productivity Increase</div>
                    <div className="text-xs text-muted-foreground">in target processes</div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)} style={{ backgroundColor: config.color }}>
                    Identify Expansion Areas <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" style={{ color: config.color }} />
                  Step 3: Identify Expansion Opportunities
                </CardTitle>
                <CardDescription>
                  Discover new areas to apply AI transformation learnings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {expansions.map((exp) => (
                  <div key={exp.id} className="p-4 rounded-lg border bg-white dark:bg-neutral-900">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium">{exp.area}</div>
                        <div className="text-sm text-muted-foreground">
                          AI Potential: {exp.potential}%
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn(
                          exp.status === "in_progress" && "bg-green-100 text-green-700",
                          exp.status === "planned" && "bg-blue-100 text-blue-700",
                          exp.status === "identified" && "bg-neutral-100 text-neutral-700"
                        )}>
                          {exp.status.replace("_", " ").charAt(0).toUpperCase() + exp.status.slice(1).replace("_", " ")}
                        </Badge>
                        {exp.status === "identified" && (
                          <Button size="sm" onClick={() => startExpansion(exp.id)}>
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                    <Progress value={exp.potential} className="h-2" />
                  </div>
                ))}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={() => setStep(4)} style={{ backgroundColor: config.color }}>
                    Complete Journey <Award className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" style={{ color: config.color }} />
                  Step 4: Establish Thought Leadership
                </CardTitle>
                <CardDescription>
                  Share your GenAI transformation story and build organizational capability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 rounded-xl bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-pink-950/30 dark:via-purple-950/30 dark:to-blue-950/30 text-center">
                  <Award className="w-16 h-16 mx-auto mb-4" style={{ color: config.color }} />
                  <h3 className="text-2xl font-bold mb-2">VITAL Journey Complete!</h3>
                  <p className="text-muted-foreground mb-4">
                    Congratulations on completing the VITAL transformation journey
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div>
                      <div className="text-2xl font-bold" style={{ color: config.color }}>5</div>
                      <div className="text-sm text-muted-foreground">Phases Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-500">{learnings.length}</div>
                      <div className="text-sm text-muted-foreground">Learnings Captured</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-500">{expansions.length}</div>
                      <div className="text-sm text-muted-foreground">Expansion Areas</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-800 dark:text-green-200">
                        Journey Complete - Leadership Established
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        You have successfully completed all 5 phases of the VITAL methodology.
                        Continue to iterate and expand your AI capabilities.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                  <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
                    Finish VITAL Journey <CheckCircle2 className="w-4 h-4 ml-2" />
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
                      i < step ? "text-green-500" : "text-neutral-300"
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

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="w-4 h-4" style={{ color: config.color }} />
                Knowledge Assets
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Best Practices:</span>
                <span className="font-medium">{learnings.filter(l => l.type === "success").length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Improvements:</span>
                <span className="font-medium">{learnings.filter(l => l.type === "improvement").length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Insights:</span>
                <span className="font-medium">{learnings.filter(l => l.type === "insight").length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
