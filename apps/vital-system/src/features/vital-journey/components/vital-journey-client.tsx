"use client";

/**
 * VITAL Journey Client Component
 *
 * Main interactive interface for the VITAL methodology
 */

import { useState } from "react";
import {
  Target,
  Search,
  FlaskConical,
  Rocket,
  GraduationCap,
  ChevronRight,
  Play,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Lightbulb,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type VitalPhase,
  VITAL_PHASES,
} from "../types/journey.types";
import { ValueDiscoveryPhase } from "./phases/value-discovery";
import { InvestigationPhase } from "./phases/investigation";
import { TrialsPhase } from "./phases/trials";
import { AdoptionPhase } from "./phases/adoption";
import { LearningPhase } from "./phases/learning";

const PHASE_ICONS: Record<VitalPhase, React.ComponentType<{ className?: string }>> = {
  V: Target,
  I: Search,
  T: FlaskConical,
  A: Rocket,
  L: GraduationCap,
};

const PHASE_ORDER: VitalPhase[] = ["V", "I", "T", "A", "L"];

export function VitalJourneyClient() {
  const [activePhase, setActivePhase] = useState<VitalPhase>("V");
  const [completedPhases, setCompletedPhases] = useState<Set<VitalPhase>>(new Set());

  const handlePhaseClick = (phase: VitalPhase) => {
    setActivePhase(phase);
  };

  const handlePhaseComplete = (phase: VitalPhase) => {
    setCompletedPhases((prev) => new Set([...prev, phase]));
    // Auto-advance to next phase
    const currentIndex = PHASE_ORDER.indexOf(phase);
    if (currentIndex < PHASE_ORDER.length - 1) {
      setActivePhase(PHASE_ORDER[currentIndex + 1]);
    }
  };

  const getPhaseStatus = (phase: VitalPhase): "completed" | "active" | "upcoming" => {
    if (completedPhases.has(phase)) return "completed";
    if (phase === activePhase) return "active";
    return "upcoming";
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-violet-50 via-blue-50 to-emerald-50 dark:from-violet-950/20 dark:via-blue-950/20 dark:to-emerald-950/20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 text-white shadow-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  VITAL Journey
                </h1>
                <p className="text-sm text-muted-foreground">
                  GenAI Opportunity Discovery & Transformation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-full">
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
                  Phase {PHASE_ORDER.indexOf(activePhase) + 1} of 5
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Navigation */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2">
            {PHASE_ORDER.map((phase, index) => {
              const config = VITAL_PHASES[phase];
              const Icon = PHASE_ICONS[phase];
              const status = getPhaseStatus(phase);
              const isLast = index === PHASE_ORDER.length - 1;

              return (
                <div key={phase} className="flex items-center">
                  <button
                    onClick={() => handlePhaseClick(phase)}
                    className={cn(
                      "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      status === "active" && "bg-white dark:bg-neutral-800 shadow-md ring-2",
                      status === "completed" && "bg-white/50 dark:bg-neutral-800/50",
                      status === "upcoming" && "opacity-60 hover:opacity-100"
                    )}
                    style={{
                      borderColor: status === "active" ? config.color : undefined,
                      ringColor: status === "active" ? config.color : undefined,
                    }}
                  >
                    {/* Phase Letter */}
                    <div
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg font-bold text-lg transition-colors",
                        status === "completed" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                        status === "active" && "text-white",
                        status === "upcoming" && "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                      )}
                      style={{
                        backgroundColor: status === "active" ? config.color : undefined,
                      }}
                    >
                      {status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        phase
                      )}
                    </div>

                    {/* Phase Info */}
                    <div className="text-left hidden md:block">
                      <div className="text-sm font-medium">{config.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {config.subtitle}
                      </div>
                    </div>

                    {/* Status Indicator */}
                    {status === "active" && (
                      <div className="absolute -top-1 -right-1">
                        <span className="flex h-3 w-3">
                          <span
                            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                            style={{ backgroundColor: config.color }}
                          />
                          <span
                            className="relative inline-flex rounded-full h-3 w-3"
                            style={{ backgroundColor: config.color }}
                          />
                        </span>
                      </div>
                    )}
                  </button>

                  {/* Connector */}
                  {!isLast && (
                    <div className="flex items-center px-1">
                      <ChevronRight className="w-4 h-4 text-neutral-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {activePhase === "V" && (
          <ValueDiscoveryPhase onComplete={() => handlePhaseComplete("V")} />
        )}
        {activePhase === "I" && (
          <InvestigationPhase onComplete={() => handlePhaseComplete("I")} />
        )}
        {activePhase === "T" && (
          <TrialsPhase onComplete={() => handlePhaseComplete("T")} />
        )}
        {activePhase === "A" && (
          <AdoptionPhase onComplete={() => handlePhaseComplete("A")} />
        )}
        {activePhase === "L" && (
          <LearningPhase onComplete={() => handlePhaseComplete("L")} />
        )}
      </main>
    </div>
  );
}
