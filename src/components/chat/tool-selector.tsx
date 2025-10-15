import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface ToolConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'research' | 'knowledge' | 'analysis' | 'regulatory' | 'clinical';
  subcategory?: string;
  enabled: boolean;
  metadata: {
    apiLimit?: number;
    cacheEnabled?: boolean;
    cacheDuration?: number;
    requiresAuth?: boolean;
    dataSource?: string;
    lastUpdated?: string;
  };
  agentCompatibility?: string[];
}

interface ToolSelectorProps {
  availableTools: ToolConfig[];
  selectedTools: string[];
  onToolToggle: (toolId: string) => void;
  disabled?: boolean;
}

export function ToolSelector({
  availableTools,
  selectedTools,
  onToolToggle,
  disabled
}: ToolSelectorProps) {
  const toolsByCategory = useMemo(() => {
    const grouped: Record<string, ToolConfig[]> = {};
    
    availableTools.forEach(tool => {
      if (!grouped[tool.category]) {
        grouped[tool.category] = [];
      }
      grouped[tool.category].push(tool);
    });
    
    return grouped;
  }, [availableTools]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Available Tools
          <Badge variant="secondary" className="ml-2">
            {selectedTools.length} selected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(toolsByCategory).map(([category, tools]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">
              {category}
            </h4>
            <div className="grid gap-2">
              {tools.map(tool => (
                <label
                  key={tool.id}
                  className={cn(
                    "flex items-start space-x-3 cursor-pointer p-2 rounded-lg hover:bg-accent",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <Checkbox
                    checked={selectedTools.includes(tool.id)}
                    onCheckedChange={() => onToolToggle(tool.id)}
                    disabled={disabled}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tool.icon}</span>
                      <span className="text-sm font-medium">{tool.name}</span>
                      {tool.metadata.requiresAuth && (
                        <Badge variant="outline" className="text-xs">
                          Auth Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tool.description}
                    </p>
                    <div className="flex items-center gap-2">
                      {tool.subcategory && (
                        <Badge variant="outline" className="text-xs">
                          {tool.subcategory}
                        </Badge>
                      )}
                      {tool.metadata.dataSource && (
                        <span className="text-xs text-muted-foreground">
                          Source: {tool.metadata.dataSource}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
