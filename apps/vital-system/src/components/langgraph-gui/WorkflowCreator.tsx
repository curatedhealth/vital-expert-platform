import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PANEL_CONFIGS } from './panel-workflows/panel-definitions';

interface UseCaseType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

// Generate use case types dynamically from panel configurations
const useCaseTypes: UseCaseType[] = Object.values(PANEL_CONFIGS).map((config) => {
  const IconComponent = config.icon;
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    icon: <IconComponent size={20} />,
  };
});

interface WorkflowCreatorProps {
  onCreateWorkflow: (useCaseType: string) => void;
}

export const WorkflowCreator: React.FC<WorkflowCreatorProps> = ({ onCreateWorkflow }) => {
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white border-r border-neutral-200 w-56">
      <div className="p-2 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Workflows</h2>
          <Button
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            title="Create New Workflow"
            size="sm"
            className="h-6 px-2 text-xs"
          >
            <Plus size={14} className="mr-1" />
            New
          </Button>
        </div>

        {showCreateMenu && (
          <div className="mb-2 p-2 bg-neutral-50 rounded border border-neutral-200">
            <h3 className="text-xs font-semibold mb-2 text-neutral-700">Select Type</h3>
            <div className="space-y-1">
              {useCaseTypes.map((useCase) => (
                <Card
                  key={useCase.id}
                  className="cursor-pointer transition-all hover:shadow-sm"
                  onClick={() => {
                    onCreateWorkflow(useCase.id);
                    setShowCreateMenu(false);
                  }}
                >
                  <CardContent className="p-2">
                    <div className="flex items-center gap-2">
                      <div className="text-primary text-sm">{useCase.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs">{useCase.name}</div>
                        <div className="text-[10px] text-neutral-600 mt-0.5 line-clamp-1">{useCase.description}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div>
          <h3 className="text-xs font-semibold text-neutral-700 mb-2">Default</h3>
          <div className="space-y-1">
            {useCaseTypes.map((useCase) => (
              <Card
                key={useCase.id}
                className="cursor-pointer transition-all hover:shadow-sm"
                onClick={() => {
                  onCreateWorkflow(useCase.id);
                  setShowCreateMenu(false);
                }}
              >
                <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                    <div className="text-primary text-sm">{useCase.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs">{useCase.name}</div>
                      <div className="text-[10px] text-neutral-600 mt-0.5 line-clamp-1">{useCase.description}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

