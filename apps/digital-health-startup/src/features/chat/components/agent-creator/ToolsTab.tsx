import { Wrench, CheckCircle } from 'lucide-react';

import { Badge } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Label } from '@vital/ui';
import { cn } from '@vital/ui/lib/utils';
import { TOOL_STATUS } from '@/features/chat/tools/tool-registry';

import type { AgentFormData } from './types';
import type { Tool } from '@/features/chat/hooks';

interface ToolsTabProps {
  formData: AgentFormData;
  availableToolsFromDB: Tool[];
  loadingTools: boolean;
  handleToolToggle: (toolName: string) => void;
}

export function ToolsTab({
  formData,
  availableToolsFromDB,
  loadingTools,
  handleToolToggle,
}: ToolsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Wrench className="h-4 w-4 flex-shrink-0" />
          <span>Tools & Integrations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Available Tools</Label>
          <p className="text-xs text-medical-gray mb-3">
            Select tools and integrations this agent can use
          </p>
          {loadingTools ? (
            <div className="text-sm text-medical-gray py-4">Loading tools...</div>
          ) : availableToolsFromDB.length === 0 ? (
            <div className="text-sm text-medical-gray py-4">
              No tools available. Add tools to the database first.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
              {availableToolsFromDB.map((tool) => {
                const isSelected = formData.tools.includes(tool.name);
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => handleToolToggle(tool.name)}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all',
                      isSelected
                        ? 'border-progress-teal bg-progress-teal/5'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {isSelected ? (
                        <CheckCircle className="h-5 w-5 text-progress-teal" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-sm text-deep-charcoal">{tool.name}</h4>
                        {tool.category && (
                          <Badge variant="outline" className="text-xs">
                            {tool.category}
                          </Badge>
                        )}
                        {TOOL_STATUS[tool.name] === 'available' ? (
                          <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                            ✓ Available
                          </Badge>
                        ) : TOOL_STATUS[tool.name] === 'coming_soon' ? (
                          <Badge
                            variant="outline"
                            className="text-xs border-amber-300 text-amber-700 bg-amber-50"
                          >
                            🚧 Coming Soon
                          </Badge>
                        ) : null}
                      </div>
                      {tool.description && (
                        <p className="text-xs text-medical-gray mt-1">{tool.description}</p>
                      )}
                      {tool.authentication_required && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-amber-600">🔒 Authentication required</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <Label>Selected Tools ({formData.tools.length})</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tools.length > 0 ? (
              formData.tools.map((toolName) => {
                return (
                  <Badge
                    key={toolName}
                    variant="secondary"
                    className="text-xs bg-progress-teal/10 text-progress-teal"
                  >
                    {toolName}
                  </Badge>
                );
              })
            ) : (
              <p className="text-xs text-medical-gray italic">No tools selected</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

