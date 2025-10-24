import React from 'react';

import { Button } from '@/components/ui/button';

interface AgentCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingAgent?: any;
}

export function AgentCreator({ isOpen, onClose, onSave, editingAgent }: AgentCreatorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">
          {editingAgent ? 'Edit Agent' : 'Create Agent'}
        </h2>
        <p className="text-gray-600 mb-6">
          Agent creator functionality is under development.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            {editingAgent ? 'Save Changes' : 'Create Agent'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AgentCreator;