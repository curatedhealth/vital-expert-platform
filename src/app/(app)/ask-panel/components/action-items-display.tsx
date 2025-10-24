'use client';

import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Target,
  Calendar,
  GitBranch,
  ListChecks
} from 'lucide-react';
import React, { useState } from 'react';

import type {
  ActionItem,
  ActionItemSummary,
  RACIMatrix
} from '@/lib/services/action-item-extractor';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

interface ActionItemsDisplayProps {
  actionItems: ActionItem[];
  summary: ActionItemSummary;
  raciMatrix: RACIMatrix;
  implementationPlan: {
    phase: string;
    timeframe: string;
    actions: ActionItem[];
  }[];
  criticalPath: ActionItem[];
}

const PRIORITY_COLORS = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-green-100 text-green-800 border-green-300',
};

const TIMELINE_COLORS = {
  immediate: 'bg-red-50 border-red-200',
  'short-term': 'bg-orange-50 border-orange-200',
  'medium-term': 'bg-yellow-50 border-yellow-200',
  'long-term': 'bg-green-50 border-green-200',
};

const CATEGORY_COLORS = {
  clinical: 'bg-blue-100 text-blue-800',
  regulatory: 'bg-purple-100 text-purple-800',
  commercial: 'bg-green-100 text-green-800',
  operational: 'bg-orange-100 text-orange-800',
  strategic: 'bg-pink-100 text-pink-800',
  other: 'bg-gray-100 text-gray-800',
};

const RACI_COLORS = {
  R: 'bg-blue-600 text-white',
  A: 'bg-purple-600 text-white',
  C: 'bg-yellow-600 text-white',
  I: 'bg-gray-600 text-white',
};

export function ActionItemsDisplay({
  actionItems,
  summary,
  raciMatrix,
  implementationPlan,
  criticalPath
}: ActionItemsDisplayProps) {
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{summary.totalItems}</div>
                <div className="text-sm text-muted-foreground">Total Actions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-800">{summary.criticalItems}</div>
                <div className="text-sm text-red-700">Critical</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-800">{summary.immediateActions}</div>
                <div className="text-sm text-orange-700">Immediate</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-300 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-800">{raciMatrix.roles.length}</div>
                <div className="text-sm text-blue-700">Stakeholders</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="all">All Actions</TabsTrigger>
          <TabsTrigger value="raci">RACI Matrix</TabsTrigger>
          <TabsTrigger value="critical-path">Critical Path</TabsTrigger>
        </TabsList>

        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-4">
          {implementationPlan.map(phase => (
            <Card key={phase.phase}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {phase.phase}
                </CardTitle>
                <CardDescription>{phase.timeframe}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {phase.actions.map(action => (
                    <ActionItemCard
                      key={action.id}
                      action={action}
                      onClick={() => setSelectedAction(action)}
                    />
                  ))}
                  {phase.actions.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No actions in this phase
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* All Actions View */}
        <TabsContent value="all" className="space-y-3">
          {actionItems
            .sort((a, b) => {
              const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            })
            .map(action => (
              <ActionItemCard
                key={action.id}
                action={action}
                onClick={() => setSelectedAction(action)}
                expanded
              />
            ))}
        </TabsContent>

        {/* RACI Matrix View */}
        <TabsContent value="raci">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                RACI Matrix
              </CardTitle>
              <CardDescription>
                R = Responsible, A = Accountable, C = Consulted, I = Informed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold text-sm">Action Item</th>
                      {raciMatrix.roles.map(role => (
                        <th key={role} className="text-center p-2 font-semibold text-sm min-w-[80px]">
                          {role}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {raciMatrix.matrix.map(row => (
                      <tr key={row.actionItemId} className="border-b hover:bg-gray-50">
                        <td className="p-2 text-sm">{row.actionItemTitle}</td>
                        {raciMatrix.roles.map(role => {
                          const assignment = row.assignments[role];
                          return (
                            <td key={role} className="text-center p-2">
                              {assignment && (
                                <Badge className={RACI_COLORS[assignment]}>
                                  {assignment}
                                </Badge>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Critical Path View */}
        <TabsContent value="critical-path">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Critical Path
              </CardTitle>
              <CardDescription>
                Sequence of critical actions with dependencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criticalPath.map((action, index) => (
                  <div key={action.id} className="relative">
                    {index < criticalPath.length - 1 && (
                      <div className="absolute left-6 top-full h-4 w-0.5 bg-gray-300" />
                    )}
                    <ActionItemCard
                      action={action}
                      onClick={() => setSelectedAction(action)}
                      expanded
                      showOrder={index + 1}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detailed Action Modal (simplified inline view) */}
      {selectedAction && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle>{selectedAction.title}</CardTitle>
                <CardDescription>Action ID: {selectedAction.id}</CardDescription>
              </div>
              <button
                onClick={() => setSelectedAction(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm">{selectedAction.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Priority & Timeline</h4>
                <div className="flex gap-2">
                  <Badge className={PRIORITY_COLORS[selectedAction.priority]}>
                    {selectedAction.priority}
                  </Badge>
                  <Badge className={CATEGORY_COLORS[selectedAction.category]}>
                    {selectedAction.category}
                  </Badge>
                </div>
                <p className="text-sm mt-2">{selectedAction.timelineDescription}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Ownership</h4>
                <div className="text-sm space-y-1">
                  <div><strong>R:</strong> {selectedAction.responsibleParty}</div>
                  <div><strong>A:</strong> {selectedAction.accountableParty}</div>
                </div>
              </div>
            </div>

            {selectedAction.successMetrics.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Success Metrics
                </h4>
                <ul className="text-sm space-y-1">
                  {selectedAction.successMetrics.map((metric, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      {metric}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">Rationale</h4>
              <p className="text-sm text-muted-foreground">{selectedAction.rationale}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Action Item Card Component
interface ActionItemCardProps {
  action: ActionItem;
  onClick: () => void;
  expanded?: boolean;
  showOrder?: number;
}

function ActionItemCard({ action, onClick, expanded = false, showOrder }: ActionItemCardProps) {
  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
        TIMELINE_COLORS[action.timeline]
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {showOrder && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
            {showOrder}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-sm">{action.title}</h4>
            <div className="flex gap-1 flex-shrink-0">
              <Badge className={PRIORITY_COLORS[action.priority]} variant="outline">
                {action.priority}
              </Badge>
              <Badge className={CATEGORY_COLORS[action.category]} variant="outline">
                {action.category}
              </Badge>
            </div>
          </div>

          {expanded && (
            <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {action.timelineDescription}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {action.responsibleParty}
            </div>
            {action.dependencies.length > 0 && (
              <div className="flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                {action.dependencies.length} deps
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActionItemsDisplay;
