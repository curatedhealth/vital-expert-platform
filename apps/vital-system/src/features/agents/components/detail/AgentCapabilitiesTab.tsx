'use client';

/**
 * AgentCapabilitiesTab - Capabilities & Tools
 *
 * Displays agent capabilities, skills, responsibilities, and tools
 * Uses Brand Guidelines v6.0 styling
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Target, Wrench, Briefcase, Lightbulb, CheckCircle, Zap } from 'lucide-react';
import { type Agent } from '@/lib/stores/agents-store';

interface AgentCapabilitiesTabProps {
  agent: Agent;
}

export function AgentCapabilitiesTab({ agent }: AgentCapabilitiesTabProps) {
  const enrichedCapabilities = (agent as any).enriched_capabilities || [];
  const responsibilities = (agent as any).responsibilities || [];
  const assignedTools = (agent as any).assigned_tools || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Capabilities Card */}
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-stone-900">
              <Target className="w-4 h-4 text-stone-500" />
              Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {enrichedCapabilities.length > 0 ? (
                enrichedCapabilities.map((cap: any, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-stone-50">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-stone-900">
                        {typeof cap === 'string' ? cap : cap.name}
                      </p>
                      {cap.description && (
                        <p className="text-xs text-stone-600">{cap.description}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : agent.capabilities?.length > 0 ? (
                agent.capabilities.map((cap: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-stone-50">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <p className="text-sm text-stone-900">{cap}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-stone-500 italic">No capabilities listed</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assigned Tools Card */}
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-stone-900">
              <Wrench className="w-4 h-4 text-purple-500" />
              Assigned Tools
            </CardTitle>
            <CardDescription>
              Tools and external integrations available to this agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignedTools.length > 0 ? (
                assignedTools.map((toolAssignment: any, index: number) => {
                  const tool = toolAssignment.tool || toolAssignment;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg border border-stone-200 bg-white hover:border-purple-300 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-stone-900">
                            {tool.name || 'Unknown Tool'}
                          </p>
                          {toolAssignment.is_enabled !== false && (
                            <Badge className="bg-emerald-100 text-emerald-700 text-xs">Active</Badge>
                          )}
                        </div>
                        {tool.description && (
                          <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                            {tool.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tool.tool_type && (
                            <Badge variant="outline" className="text-xs">
                              {tool.tool_type}
                            </Badge>
                          )}
                          {tool.integration_name && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              {tool.integration_name}
                            </Badge>
                          )}
                          {toolAssignment.priority && (
                            <Badge variant="outline" className="text-xs">
                              Priority: {toolAssignment.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-stone-500">
                  <Wrench className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                  <p className="text-sm">No tools assigned to this agent</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Responsibilities Card */}
      {responsibilities.length > 0 && (
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-stone-900">
              <Briefcase className="w-4 h-4 text-stone-500" />
              Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {responsibilities.map((resp: any, index: number) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-stone-50">
                  <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-stone-900">
                    {typeof resp === 'string' ? resp : resp.name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
