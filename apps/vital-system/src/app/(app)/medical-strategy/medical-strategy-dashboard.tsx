"use client";

/**
 * Medical Strategy Dashboard
 *
 * Main component for evidence-based decision making targeting Global Medical Strategy teams.
 * Integrates VITAL's 8-layer ontology with strategic analytics and AI-powered insights.
 *
 * Core Use Cases:
 * 1. Therapeutic Area Prioritization
 * 2. Evidence Gap Analysis
 * 3. Competitive Intelligence
 * 4. KOL Network Optimization
 * 5. Publication Strategy
 * 6. Cross-Functional Alignment
 */

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@vital/ui";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { AIPoweredInsight } from "@/components/value-view/AIPoweredInsight";
import { cn } from "@/lib/utils";
import {
  Activity,
  BarChart3,
  Brain,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileSearch,
  Flame,
  Globe,
  GraduationCap,
  Layers,
  Lightbulb,
  Link,
  MessageSquare,
  Network,
  PieChart,
  Scale,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

interface EvidenceSource {
  id: string;
  type: "clinical_trial" | "publication" | "real_world" | "expert_opinion";
  title: string;
  source: string;
  level: "1A" | "1B" | "2A" | "2B" | "3" | "4" | "5";
  date: string;
  relevance: number;
  citations?: number;
}

interface TherapeuticArea {
  id: string;
  name: string;
  evidenceStrength: number;
  marketPotential: number;
  competitiveIntensity: number;
  overallScore: number;
  trend: "up" | "down" | "stable";
  evidenceGaps: string[];
  keyAgents: string[];
}

interface CompetitorInsight {
  competitor: string;
  product: string;
  phase: string;
  differentiator: string;
  threat_level: "high" | "medium" | "low";
  last_updated: string;
}

interface KOLProfile {
  id: string;
  name: string;
  institution: string;
  specialty: string;
  publications: number;
  influence_score: number;
  engagement_status: "active" | "pending" | "target";
}

interface StrategicMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  category: "evidence" | "market" | "competitive" | "operational";
}

// ═══════════════════════════════════════════════════════════════════
// MOCK DATA (Replace with API calls in production)
// ═══════════════════════════════════════════════════════════════════

const MOCK_THERAPEUTIC_AREAS: TherapeuticArea[] = [
  {
    id: "ta-1",
    name: "Oncology - NSCLC",
    evidenceStrength: 87,
    marketPotential: 92,
    competitiveIntensity: 78,
    overallScore: 89,
    trend: "up",
    evidenceGaps: ["Real-world survival data", "Biomarker subgroup analysis"],
    keyAgents: ["Clinical Evidence Synthesizer", "Oncology Strategy Advisor"],
  },
  {
    id: "ta-2",
    name: "Immunology - Rheumatoid Arthritis",
    evidenceStrength: 82,
    marketPotential: 76,
    competitiveIntensity: 85,
    overallScore: 81,
    trend: "stable",
    evidenceGaps: ["Long-term safety profile", "Combination therapy data"],
    keyAgents: ["Immunology Expert", "Safety Evidence Reviewer"],
  },
  {
    id: "ta-3",
    name: "Cardiology - Heart Failure",
    evidenceStrength: 75,
    marketPotential: 88,
    competitiveIntensity: 72,
    overallScore: 78,
    trend: "up",
    evidenceGaps: ["Preserved EF outcomes", "Pediatric population data"],
    keyAgents: ["Cardiovascular Advisor", "Clinical Trial Designer"],
  },
  {
    id: "ta-4",
    name: "Neurology - Alzheimer's",
    evidenceStrength: 68,
    marketPotential: 95,
    competitiveIntensity: 65,
    overallScore: 76,
    trend: "up",
    evidenceGaps: ["Early intervention data", "Biomarker-defined populations"],
    keyAgents: ["Neurology Specialist", "Biomarker Strategist"],
  },
];

const MOCK_COMPETITOR_INSIGHTS: CompetitorInsight[] = [
  {
    competitor: "Competitor A",
    product: "Drug X",
    phase: "Phase 3",
    differentiator: "Novel mechanism targeting XYZ pathway",
    threat_level: "high",
    last_updated: "2024-01-15",
  },
  {
    competitor: "Competitor B",
    product: "Drug Y",
    phase: "Approved",
    differentiator: "First-line indication, oral formulation",
    threat_level: "high",
    last_updated: "2024-01-10",
  },
  {
    competitor: "Competitor C",
    product: "Drug Z",
    phase: "Phase 2",
    differentiator: "Combination therapy approach",
    threat_level: "medium",
    last_updated: "2024-01-08",
  },
];

const MOCK_KOLS: KOLProfile[] = [
  {
    id: "kol-1",
    name: "Dr. Sarah Chen",
    institution: "Memorial Hospital",
    specialty: "Medical Oncology",
    publications: 127,
    influence_score: 94,
    engagement_status: "active",
  },
  {
    id: "kol-2",
    name: "Prof. James Mueller",
    institution: "University Medical Center",
    specialty: "Clinical Research",
    publications: 89,
    influence_score: 87,
    engagement_status: "active",
  },
  {
    id: "kol-3",
    name: "Dr. Maria Santos",
    institution: "Research Institute",
    specialty: "Translational Medicine",
    publications: 156,
    influence_score: 91,
    engagement_status: "pending",
  },
];

const MOCK_STRATEGIC_METRICS: StrategicMetric[] = [
  {
    name: "Evidence Coverage",
    value: 78,
    target: 90,
    unit: "%",
    trend: "up",
    category: "evidence",
  },
  {
    name: "Market Insights",
    value: 85,
    target: 85,
    unit: "%",
    trend: "stable",
    category: "market",
  },
  {
    name: "Competitive Intel",
    value: 72,
    target: 80,
    unit: "%",
    trend: "up",
    category: "competitive",
  },
  {
    name: "Publication Rate",
    value: 24,
    target: 30,
    unit: "per quarter",
    trend: "up",
    category: "operational",
  },
];

// ═══════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function EvidenceHierarchyCard() {
  const evidenceLevels = [
    {
      level: "1A",
      name: "Systematic Reviews",
      count: 12,
      color: "bg-emerald-500",
    },
    { level: "1B", name: "Randomized Trials", count: 47, color: "bg-green-500" },
    { level: "2A", name: "Cohort Studies", count: 89, color: "bg-blue-500" },
    {
      level: "2B",
      name: "Case-Control Studies",
      count: 34,
      color: "bg-indigo-500",
    },
    { level: "3", name: "Case Series", count: 156, color: "bg-purple-500" },
    { level: "4", name: "Expert Opinion", count: 78, color: "bg-gray-400" },
  ];

  const totalEvidence = evidenceLevels.reduce((sum, e) => sum + e.count, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Scale className="h-4 w-4 text-blue-500" />
          Evidence Hierarchy
        </CardTitle>
        <CardDescription>
          {totalEvidence} sources across all levels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {evidenceLevels.map((level) => (
          <div key={level.level} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">
                Level {level.level}: {level.name}
              </span>
              <span className="text-muted-foreground">{level.count}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", level.color)}
                style={{ width: `${(level.count / 160) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TherapeuticAreaCard({ area }: { area: TherapeuticArea }) {
  const getTrendIcon = () => {
    if (area.trend === "up")
      return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (area.trend === "down")
      return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
    return <Activity className="h-3 w-3 text-gray-400" />;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium text-sm">{area.name}</h4>
            <div className="flex items-center gap-1 mt-1">
              {getTrendIcon()}
              <span className="text-xs text-muted-foreground">
                Score: {area.overallScore}
              </span>
            </div>
          </div>
          <Badge
            variant={
              area.overallScore >= 85
                ? "default"
                : area.overallScore >= 75
                  ? "secondary"
                  : "outline"
            }
          >
            {area.overallScore >= 85
              ? "Priority"
              : area.overallScore >= 75
                ? "Focus"
                : "Monitor"}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="font-semibold text-emerald-600">
              {area.evidenceStrength}%
            </div>
            <div className="text-muted-foreground">Evidence</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="font-semibold text-blue-600">
              {area.marketPotential}%
            </div>
            <div className="text-muted-foreground">Market</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="font-semibold text-orange-600">
              {area.competitiveIntensity}%
            </div>
            <div className="text-muted-foreground">Competition</div>
          </div>
        </div>

        {area.evidenceGaps.length > 0 && (
          <div className="border-t pt-2">
            <div className="text-xs text-muted-foreground mb-1">
              Evidence Gaps:
            </div>
            <div className="flex flex-wrap gap-1">
              {area.evidenceGaps.map((gap, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {gap}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CompetitorInsightCard({ insight }: { insight: CompetitorInsight }) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg border-l-4",
        insight.threat_level === "high"
          ? "border-l-red-500 bg-red-50 dark:bg-red-950/10"
          : insight.threat_level === "medium"
            ? "border-l-orange-500 bg-orange-50 dark:bg-orange-950/10"
            : "border-l-green-500 bg-green-50 dark:bg-green-950/10"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium text-sm">{insight.competitor}</div>
          <div className="text-xs text-muted-foreground">{insight.product}</div>
        </div>
        <Badge variant="outline" className="text-xs">
          {insight.phase}
        </Badge>
      </div>
      <p className="text-xs mt-2 text-muted-foreground">
        {insight.differentiator}
      </p>
      <div className="text-xs text-muted-foreground mt-2">
        Updated: {insight.last_updated}
      </div>
    </div>
  );
}

function KOLCard({ kol }: { kol: KOLProfile }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium">
        {kol.name
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{kol.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {kol.specialty} • {kol.institution}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-purple-600">
          {kol.influence_score}
        </div>
        <div className="text-xs text-muted-foreground">
          {kol.publications} pubs
        </div>
      </div>
      <Badge
        variant={
          kol.engagement_status === "active"
            ? "default"
            : kol.engagement_status === "pending"
              ? "secondary"
              : "outline"
        }
        className="text-xs"
      >
        {kol.engagement_status}
      </Badge>
    </div>
  );
}

function StrategicMetricCard({ metric }: { metric: StrategicMetric }) {
  const progress = (metric.value / metric.target) * 100;
  const isOnTrack = metric.value >= metric.target;

  const getCategoryIcon = () => {
    switch (metric.category) {
      case "evidence":
        return <FileSearch className="h-4 w-4" />;
      case "market":
        return <TrendingUp className="h-4 w-4" />;
      case "competitive":
        return <Target className="h-4 w-4" />;
      case "operational":
        return <ClipboardList className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            {getCategoryIcon()}
            <span className="text-xs font-medium uppercase">
              {metric.category}
            </span>
          </div>
          {isOnTrack ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <Target className="h-4 w-4 text-orange-500" />
          )}
        </div>
        <div className="text-2xl font-bold">
          {metric.value}
          <span className="text-sm font-normal text-muted-foreground ml-1">
            {metric.unit}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mb-2">
          {metric.name} (Target: {metric.target})
        </div>
        <Progress value={Math.min(progress, 100)} className="h-1.5" />
      </CardContent>
    </Card>
  );
}

function DecisionFrameworkCard() {
  const decisions = [
    {
      name: "TA Prioritization",
      status: "complete",
      date: "Q4 2024",
      confidence: 92,
    },
    {
      name: "Portfolio Allocation",
      status: "in_progress",
      date: "Q1 2025",
      confidence: 78,
    },
    {
      name: "KOL Engagement Plan",
      status: "pending",
      date: "Q1 2025",
      confidence: 65,
    },
    {
      name: "Publication Strategy",
      status: "pending",
      date: "Q2 2025",
      confidence: 45,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="h-4 w-4 text-purple-500" />
          Decision Framework
        </CardTitle>
        <CardDescription>Evidence-backed strategic decisions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {decisions.map((decision, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
          >
            <div className="flex items-center gap-2">
              {decision.status === "complete" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : decision.status === "in_progress" ? (
                <Activity className="h-4 w-4 text-blue-500" />
              ) : (
                <Target className="h-4 w-4 text-gray-400" />
              )}
              <div>
                <div className="text-sm font-medium">{decision.name}</div>
                <div className="text-xs text-muted-foreground">
                  {decision.date}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{decision.confidence}%</div>
              <div className="text-xs text-muted-foreground">confidence</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CrossFunctionalAlignmentCard() {
  const teams = [
    { name: "Medical Affairs", alignment: 92, color: "bg-emerald-500" },
    { name: "Commercial", alignment: 78, color: "bg-blue-500" },
    { name: "Regulatory", alignment: 85, color: "bg-purple-500" },
    { name: "R&D", alignment: 71, color: "bg-orange-500" },
    { name: "Market Access", alignment: 88, color: "bg-teal-500" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Link className="h-4 w-4 text-teal-500" />
          Cross-Functional Alignment
        </CardTitle>
        <CardDescription>Strategic consensus across functions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {teams.map((team) => (
          <div key={team.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{team.name}</span>
              <span
                className={cn(
                  team.alignment >= 85
                    ? "text-green-600"
                    : team.alignment >= 75
                      ? "text-yellow-600"
                      : "text-red-600"
                )}
              >
                {team.alignment}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", team.color)}
                style={{ width: `${team.alignment}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function MedicalStrategyDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden h-full p-6">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-96" />
          <div className="grid grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Page Header */}
      <PageHeader
        icon={Target}
        title="Global Medical Strategy"
        description="Evidence-based decision making hub for strategic planning"
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI-Enhanced
          </Badge>
          <Button variant="outline" size="sm" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </PageHeader>

      {/* Strategic Metrics Overview */}
      <div className="px-6 py-4 border-b bg-muted/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MOCK_STRATEGIC_METRICS.map((metric) => (
            <StrategicMetricCard key={metric.name} metric={metric} />
          ))}
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <Layers className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="evidence" className="gap-2">
              <FileSearch className="h-4 w-4" />
              Evidence Synthesis
            </TabsTrigger>
            <TabsTrigger value="competitive" className="gap-2">
              <Target className="h-4 w-4" />
              Competitive Intel
            </TabsTrigger>
            <TabsTrigger value="kol" className="gap-2">
              <Users className="h-4 w-4" />
              KOL Network
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - TA Prioritization */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-blue-500" />
                      Therapeutic Area Prioritization
                    </CardTitle>
                    <CardDescription>
                      AI-scored prioritization based on evidence, market, and
                      competitive analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {MOCK_THERAPEUTIC_AREAS.map((area) => (
                        <TherapeuticAreaCard key={area.id} area={area} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Supporting Cards */}
              <div className="space-y-4">
                <EvidenceHierarchyCard />
                <DecisionFrameworkCard />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CrossFunctionalAlignmentCard />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    {
                      icon: FileSearch,
                      label: "Run Evidence Gap Analysis",
                      color: "text-blue-500",
                    },
                    {
                      icon: Target,
                      label: "Update Competitive Landscape",
                      color: "text-red-500",
                    },
                    {
                      icon: Users,
                      label: "Refresh KOL Rankings",
                      color: "text-purple-500",
                    },
                    {
                      icon: MessageSquare,
                      label: "Schedule Strategy Review",
                      color: "text-green-500",
                    },
                  ].map((action, i) => (
                    <Button
                      key={i}
                      variant="ghost"
                      className="w-full justify-start gap-2 text-sm"
                    >
                      <action.icon className={cn("h-4 w-4", action.color)} />
                      {action.label}
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Evidence Synthesis Tab */}
          <TabsContent value="evidence" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSearch className="h-5 w-5 text-emerald-500" />
                      Evidence Synthesis Dashboard
                    </CardTitle>
                    <CardDescription>
                      Comprehensive evidence landscape with AI-powered gap
                      identification
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                          <div className="text-3xl font-bold text-emerald-600">
                            416
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Sources
                          </div>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <div className="text-3xl font-bold text-blue-600">
                            12
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Evidence Gaps
                          </div>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                          <div className="text-3xl font-bold text-purple-600">
                            89%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Coverage Score
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Flame className="h-4 w-4 text-orange-500" />
                          Priority Evidence Gaps
                        </h4>
                        <div className="space-y-2">
                          {[
                            "Real-world survival data in elderly populations",
                            "Biomarker-defined subgroup efficacy analysis",
                            "Long-term safety profile beyond 5 years",
                            "Head-to-head comparison with standard of care",
                          ].map((gap, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-2 bg-muted/30 rounded"
                            >
                              <span className="text-sm">{gap}</span>
                              <Badge variant="outline" className="text-xs">
                                High Priority
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <EvidenceHierarchyCard />
              </div>
            </div>
          </TabsContent>

          {/* Competitive Intel Tab */}
          <TabsContent value="competitive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-500" />
                  Competitive Intelligence Hub
                </CardTitle>
                <CardDescription>
                  Real-time monitoring of competitor activities and market
                  dynamics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MOCK_COMPETITOR_INSIGHTS.map((insight, i) => (
                    <CompetitorInsightCard key={i} insight={insight} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KOL Network Tab */}
          <TabsContent value="kol" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-purple-500" />
                  KOL Network Analysis
                </CardTitle>
                <CardDescription>
                  Strategic engagement with key opinion leaders across
                  therapeutic areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_KOLS.map((kol) => (
                    <KOLCard key={kol.id} kol={kol} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIPoweredInsight />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Strategic Recommendations
                  </CardTitle>
                  <CardDescription>
                    AI-generated strategic insights based on evidence synthesis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      priority: "high",
                      text: "Prioritize real-world evidence generation for NSCLC elderly population to address critical evidence gap",
                    },
                    {
                      priority: "high",
                      text: "Strengthen KOL engagement in biomarker-defined subgroups ahead of Phase 3 data readout",
                    },
                    {
                      priority: "medium",
                      text: "Monitor Competitor A's Phase 3 trial closely - potential first-mover advantage risk",
                    },
                    {
                      priority: "medium",
                      text: "Consider strategic publication timing to align with major congress presentations",
                    },
                  ].map((rec, i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-3 rounded-lg border-l-4",
                        rec.priority === "high"
                          ? "border-l-orange-500 bg-orange-50 dark:bg-orange-950/10"
                          : "border-l-blue-500 bg-blue-50 dark:bg-blue-950/10"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                        <span className="text-sm">{rec.text}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
