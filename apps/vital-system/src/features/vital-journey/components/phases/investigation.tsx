"use client";

/**
 * Investigation & Ideation Phase (I)
 *
 * Second phase of VITAL Journey - uses the enterprise ontology to discover
 * GenAI opportunities, map JTBDs to AI capabilities, and prioritize.
 */

import { useState, useEffect } from "react";
import {
  Search,
  Lightbulb,
  Target,
  Zap,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Filter,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@vital/ui";
import { Button } from "@vital/ui";
import { Badge } from "@vital/ui";
import { Progress } from "@vital/ui";
import { VITAL_PHASES } from "../../types/journey.types";

interface InvestigationPhaseProps {
  onComplete: () => void;
}

interface JTBD {
  id: string;
  code: string;
  name: string;
  complexity?: string;
  ai_suitability?: number;
}

interface ValueDriver {
  id: string;
  code: string;
  name: string;
  value_category?: string;
}

const SUPABASE_URL = "https://bomltkhixeatxuoxmolq.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// AI potential score simulation
const getAIPotential = () => Math.floor(Math.random() * 40) + 60; // 60-100

export function InvestigationPhase({ onComplete }: InvestigationPhaseProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [jtbds, setJtbds] = useState<JTBD[]>([]);
  const [valueDrivers, setValueDrivers] = useState<ValueDriver[]>([]);
  const [selectedJTBDs, setSelectedJTBDs] = useState<string[]>([]);
  const [analyzedJTBDs, setAnalyzedJTBDs] = useState<Map<string, number>>(new Map());
  const [prioritizedList, setPrioritizedList] = useState<Array<{ jtbd: JTBD; score: number }>>([]);

  const config = VITAL_PHASES.I;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const headers = {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        };

        const [jtbdsRes, driversRes] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/jtbd?select=id,code,name,complexity&order=code&limit=50`, { headers }),
          fetch(`${SUPABASE_URL}/rest/v1/value_drivers?select=id,code,name,value_category&order=code&limit=30`, { headers }),
        ]);

        const [jtbdsData, driversData] = await Promise.all([
          jtbdsRes.json(),
          driversRes.json(),
        ]);

        setJtbds(jtbdsData);
        setValueDrivers(driversData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleJTBDToggle = (jtbdId: string) => {
    setSelectedJTBDs(prev =>
      prev.includes(jtbdId)
        ? prev.filter(id => id !== jtbdId)
        : [...prev, jtbdId]
    );
  };

  const analyzeAIPotential = () => {
    const analyzed = new Map<string, number>();
    selectedJTBDs.forEach(id => {
      analyzed.set(id, getAIPotential());
    });
    setAnalyzedJTBDs(analyzed);
    setStep(3);
  };

  const prioritizeOpportunities = () => {
    const prioritized = selectedJTBDs
      .map(id => {
        const jtbd = jtbds.find(j => j.id === id);
        const score = analyzedJTBDs.get(id) || 0;
        return { jtbd: jtbd!, score };
      })
      .filter(item => item.jtbd)
      .sort((a, b) => b.score - a.score);

    setPrioritizedList(prioritized);
    setStep(4);
  };

  const progress = (step / 4) * 100;

  const getPriorityBadge = (score: number) => {
    if (score >= 85) return { label: "Quick Win", color: "bg-green-100 text-green-700" };
    if (score >= 70) return { label: "Strategic", color: "bg-blue-100 text-blue-700" };
    if (score >= 55) return { label: "Foundation", color: "bg-yellow-100 text-yellow-700" };
    return { label: "Defer", color: "bg-gray-100 text-gray-700" };
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
            <Search className="w-7 h-7" />
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

      {/* Description */}
      <Card className="border-l-4" style={{ borderLeftColor: config.color }}>
        <CardContent className="p-4">
          <p className="text-muted-foreground">{config.description}</p>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" style={{ color: config.color }} />
                  Step 1: Browse JTBDs from Ontology
                </CardTitle>
                <CardDescription>
                  Explore Jobs-To-Be-Done mapped to your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {jtbds.map((jtbd) => (
                      <button
                        key={jtbd.id}
                        onClick={() => handleJTBDToggle(jtbd.id)}
                        className={cn(
                          "w-full p-3 rounded-lg border-2 text-left transition-all hover:shadow-sm",
                          selectedJTBDs.includes(jtbd.id)
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                            : "border-gray-200"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono text-sm text-muted-foreground mr-2">{jtbd.code}</span>
                            <span className="font-medium">{jtbd.name}</span>
                          </div>
                          {jtbd.complexity && (
                            <Badge variant="outline">{jtbd.complexity}</Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {selectedJTBDs.length} JTBDs selected
                  </span>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={selectedJTBDs.length === 0}
                    style={{ backgroundColor: selectedJTBDs.length > 0 ? config.color : undefined }}
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" style={{ color: config.color }} />
                  Step 2: Map to Value Drivers
                </CardTitle>
                <CardDescription>
                  Identify value drivers connected to selected JTBDs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {valueDrivers.slice(0, 12).map((driver) => (
                    <div
                      key={driver.id}
                      className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-900"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-muted-foreground">{driver.code}</span>
                        {driver.value_category && (
                          <Badge variant="secondary" className="text-xs">
                            {driver.value_category}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm font-medium mt-1">{driver.name}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button
                    onClick={analyzeAIPotential}
                    style={{ backgroundColor: config.color }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze AI Potential
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" style={{ color: config.color }} />
                  Step 3: AI Suitability Scores
                </CardTitle>
                <CardDescription>
                  Review AI potential scores for each JTBD
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedJTBDs.map(id => {
                    const jtbd = jtbds.find(j => j.id === id);
                    const score = analyzedJTBDs.get(id) || 0;
                    return (
                      <div key={id} className="p-3 rounded-lg border bg-white dark:bg-gray-900">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-mono text-xs text-muted-foreground mr-2">{jtbd?.code}</span>
                            <span className="font-medium text-sm">{jtbd?.name}</span>
                          </div>
                          <div className="text-lg font-bold" style={{ color: config.color }}>
                            {score}%
                          </div>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={prioritizeOpportunities} style={{ backgroundColor: config.color }}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Prioritize Opportunities
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
                  Step 4: Prioritized Opportunity List
                </CardTitle>
                <CardDescription>
                  Ranked opportunities by AI potential and value impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prioritizedList.map((item, index) => {
                    const priority = getPriorityBadge(item.score);
                    return (
                      <div key={item.jtbd.id} className="p-4 rounded-lg border bg-white dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                              style={{ backgroundColor: config.color }}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <span className="font-mono text-xs text-muted-foreground mr-2">{item.jtbd.code}</span>
                              <span className="font-medium">{item.jtbd.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={priority.color}>{priority.label}</Badge>
                            <span className="font-bold text-lg">{item.score}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-800 dark:text-green-200">
                        Investigation Complete
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        {prioritizedList.filter(p => p.score >= 85).length} quick wins identified.
                        Proceed to Trials to test top opportunities.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-between">
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
                <Filter className="w-4 h-4" style={{ color: config.color }} />
                Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">JTBDs Selected:</span>
                <span className="font-medium">{selectedJTBDs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Analyzed:</span>
                <span className="font-medium">{analyzedJTBDs.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quick Wins:</span>
                <span className="font-medium text-green-600">
                  {prioritizedList.filter(p => p.score >= 85).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
