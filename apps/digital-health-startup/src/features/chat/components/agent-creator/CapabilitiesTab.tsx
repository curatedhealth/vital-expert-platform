import React from 'react';
import { Plus, X } from 'lucide-react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Input } from '@vital/ui';
import { Label } from '@vital/ui';

import type { AgentFormData } from './types';

interface CapabilitiesTabProps {
  formData: AgentFormData;
  newCapability: string;
  predefinedCapabilities: string[];
  setNewCapability: (value: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<AgentFormData>>;
  handleCapabilityAdd: (capability: string) => void;
  handleCapabilityRemove: (capability: string) => void;
}

export function CapabilitiesTab({
  formData,
  newCapability,
  predefinedCapabilities,
  setNewCapability,
  setFormData,
  handleCapabilityAdd,
  handleCapabilityRemove,
}: CapabilitiesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Capabilities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Add Capability</Label>
          <div className="flex gap-2">
            <Input
              value={newCapability}
              onChange={(e) => setNewCapability(e.target.value)}
              placeholder="Enter a capability"
              onKeyPress={(e) => e.key === 'Enter' && handleCapabilityAdd(newCapability)}
            />
            <Button
              type="button"
              onClick={() => handleCapabilityAdd(newCapability)}
              disabled={!newCapability}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <Label>Predefined Capabilities</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {predefinedCapabilities.map((capability) => (
              <Button
                key={capability}
                type="button"
                variant="outline"
                size="sm"
                className="h-auto py-1 px-2 text-xs"
                onClick={() => handleCapabilityAdd(capability)}
                disabled={formData.capabilities.includes(capability)}
              >
                {capability}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label>Selected Capabilities</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.capabilities.map((capability) => (
              <Badge key={capability} variant="secondary" className="text-xs">
                {capability}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={() => handleCapabilityRemove(capability)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

