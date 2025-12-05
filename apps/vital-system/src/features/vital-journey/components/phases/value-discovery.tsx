"use client";

/**
 * Value Discovery Phase (V)
 *
 * First phase of VITAL Journey - helps identify strategic value and pain points
 * by exploring the organizational structure and JTBDs.
 */

import { useState, useEffect } from "react";
import {
  Target,
  Users,
  Building2,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@vital/ui";
import { Button } from "@vital/ui";
import { Badge } from "@vital/ui";
import { Progress } from "@vital/ui";
import { VITAL_PHASES } from "../../types/journey.types";

interface ValueDiscoveryPhaseProps {
  onComplete: () => void;
}

interface OntologyData {
  functions: Array<{ id: string; name: string; code: string }>;
  departments: Array<{ id: string; name: string; function_id: string }>;
  roles: Array<{ id: string; name: string; department_id: string }>;
  valueCategories: Array<{ id: string; code: string; name: string }>;
}

const SUPABASE_URL = "https://bomltkhixeatxuoxmolq.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function ValueDiscoveryPhase({ onComplete }: ValueDiscoveryPhaseProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ontologyData, setOntologyData] = useState<OntologyData | null>(null);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [discoveredValues, setDiscoveredValues] = useState<string[]>([]);

  const config = VITAL_PHASES.V;

  // Fetch ontology data on mount
  useEffect(() => {
    async function fetchOntologyData() {
      setLoading(true);
      try {
        const headers = {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        };

        const [functionsRes, departmentsRes, rolesRes, valueCategoriesRes] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/org_functions?select=id,name,code&order=name`, { headers }),
          fetch(`${SUPABASE_URL}/rest/v1/departments?select=id,name,function_id&order=name&limit=50`, { headers }),
          fetch(`${SUPABASE_URL}/rest/v1/org_roles?select=id,name,department_id&order=name&limit=100`, { headers }),
          fetch(`${SUPABASE_URL}/rest/v1/value_categories?select=id,code,name&order=code`, { headers }),
        ]);

        const [functions, departments, roles, valueCategories] = await Promise.all([
          functionsRes.json(),
          departmentsRes.json(),
          rolesRes.json(),
          valueCategoriesRes.json(),
        ]);

        setOntologyData({ functions, departments, roles, valueCategories });
      } catch (error) {
        console.error("Failed to fetch ontology data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOntologyData();
  }, []);

  const handleFunctionSelect = (functionId: string) => {
    setSelectedFunction(functionId);
    setSelectedDepartments([]);
    setSelectedRoles([]);
  };

  const handleDepartmentToggle = (deptId: string) => {
    setSelectedDepartments(prev =>
      prev.includes(deptId)
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleValueDiscovery = () => {
    // Simulate AI-powered value discovery
    const allValues = ontologyData?.valueCategories.map(v => v.code) || [];
    setDiscoveredValues(allValues.slice(0, 4));
    setStep(4);
  };

  const filteredDepartments = ontologyData?.departments.filter(
    d => !selectedFunction || d.function_id === selectedFunction
  ) || [];

  const filteredRoles = ontologyData?.roles.filter(
    r => selectedDepartments.length === 0 || selectedDepartments.includes(r.department_id)
  ) || [];

  const progress = (step / 4) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Phase Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-xl text-white shadow-lg"
            style={{ backgroundColor: config.color }}
          >
            <Target className="w-7 h-7" />
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

      {/* Step Indicators */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <button
              onClick={() => s <= step && setStep(s)}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all",
                s === step && "ring-2 ring-offset-2",
                s < step && "bg-green-500 text-white",
                s === step && "text-white",
                s > step && "bg-neutral-200 text-neutral-500"
              )}
              style={{
                backgroundColor: s === step ? config.color : undefined,
                ringColor: s === step ? config.color : undefined
              }}
              disabled={s > step}
            >
              {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
            </button>
            {s < 4 && (
              <ChevronRight className={cn(
                "w-4 h-4 mx-1",
                s < step ? "text-green-500" : "text-neutral-300"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-4">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" style={{ color: config.color }} />
                  Step 1: Select Your Function
                </CardTitle>
                <CardDescription>
                  Choose the organizational function you want to explore for GenAI opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {ontologyData?.functions.map((func) => (
                      <button
                        key={func.id}
                        onClick={() => handleFunctionSelect(func.id)}
                        className={cn(
                          "p-4 rounded-lg border-2 text-left transition-all hover:shadow-md",
                          selectedFunction === func.id
                            ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20"
                            : "border-neutral-200 hover:border-neutral-300"
                        )}
                      >
                        <div className="font-medium">{func.name}</div>
                        <div className="text-sm text-muted-foreground">{func.code}</div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!selectedFunction}
                    style={{ backgroundColor: selectedFunction ? config.color : undefined }}
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
                  <Briefcase className="w-5 h-5" style={{ color: config.color }} />
                  Step 2: Select Departments
                </CardTitle>
                <CardDescription>
                  Choose the departments within your function to analyze
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {filteredDepartments.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => handleDepartmentToggle(dept.id)}
                      className={cn(
                        "p-3 rounded-lg border-2 text-left transition-all",
                        selectedDepartments.includes(dept.id)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                          : "border-neutral-200 hover:border-neutral-300"
                      )}
                    >
                      <div className="font-medium text-sm">{dept.name}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={selectedDepartments.length === 0}
                    style={{ backgroundColor: selectedDepartments.length > 0 ? config.color : undefined }}
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: config.color }} />
                  Step 3: Select Key Roles
                </CardTitle>
                <CardDescription>
                  Choose roles to identify their Jobs-To-Be-Done for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {filteredRoles.slice(0, 20).map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleRoleToggle(role.id)}
                      className={cn(
                        "p-2 rounded-lg border text-left transition-all text-sm",
                        selectedRoles.includes(role.id)
                          ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                          : "border-neutral-200 hover:border-neutral-300"
                      )}
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    onClick={handleValueDiscovery}
                    disabled={selectedRoles.length === 0}
                    style={{ backgroundColor: selectedRoles.length > 0 ? config.color : undefined }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Discover Value Opportunities
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
                  Step 4: Value Discovery Results
                </CardTitle>
                <CardDescription>
                  AI-identified value opportunities across your selected scope
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {ontologyData?.valueCategories.map((vc) => (
                      <div
                        key={vc.id}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all",
                          discoveredValues.includes(vc.code)
                            ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20"
                            : "border-neutral-200 opacity-50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-lg">{vc.code}</div>
                          {discoveredValues.includes(vc.code) && (
                            <Badge variant="secondary" className="bg-violet-100 text-violet-700">
                              High Potential
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{vc.name}</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-800 dark:text-green-200">
                          Value Discovery Complete
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Found {discoveredValues.length} high-potential value categories.
                          Proceed to Investigation to explore specific JTBDs and AI opportunities.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    Back
                  </Button>
                  <Button
                    onClick={onComplete}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Complete Phase <CheckCircle2 className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Objectives & Deliverables */}
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
                <Briefcase className="w-4 h-4" style={{ color: config.color }} />
                Deliverables
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {config.deliverables.map((del, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      i < step ? "bg-green-500" : "bg-neutral-300"
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
                <AlertCircle className="w-4 h-4" style={{ color: config.color }} />
                Selection Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Function:</span>
                <span className="font-medium">
                  {selectedFunction
                    ? ontologyData?.functions.find(f => f.id === selectedFunction)?.name
                    : "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Departments:</span>
                <span className="font-medium">{selectedDepartments.length} selected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Roles:</span>
                <span className="font-medium">{selectedRoles.length} selected</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
