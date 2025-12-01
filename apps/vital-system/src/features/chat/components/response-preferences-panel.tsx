'use client';

import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  ListChecks,
  AlignLeft,
  Quote,
  Lightbulb,
  Layers,
  Settings2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/services/utils';

// Response format options
const RESPONSE_FORMATS = [
  {
    id: 'structured',
    label: 'Structured',
    icon: ListChecks,
    description: 'Clear sections with headers and bullet points',
  },
  {
    id: 'narrative',
    label: 'Narrative',
    icon: AlignLeft,
    description: 'Flowing prose with natural paragraphs',
  },
  {
    id: 'executive',
    label: 'Executive',
    icon: FileText,
    description: 'Key insights first, then supporting details',
  },
  {
    id: 'technical',
    label: 'Technical',
    icon: Layers,
    description: 'Detailed specifications and technical depth',
  },
];

// Response depth options
const RESPONSE_DEPTHS = [
  { id: 'concise', label: 'Concise', description: 'Brief, to-the-point answers' },
  { id: 'standard', label: 'Standard', description: 'Balanced detail and brevity' },
  { id: 'comprehensive', label: 'Comprehensive', description: 'Thorough, in-depth responses' },
];

// LocalStorage key
const STORAGE_KEY = 'vital-response-preferences';

// Default preferences
const DEFAULT_PREFERENCES: ResponsePreferences = {
  format: 'structured',
  depth: 'standard',
  includeCitations: true,
  includeInsights: true,
  includeKeyTakeaways: true,
  includeNextSteps: false,
};

export interface ResponsePreferences {
  format: string;
  depth: string;
  includeCitations: boolean;
  includeInsights: boolean;
  includeKeyTakeaways: boolean;
  includeNextSteps: boolean;
}

interface ResponsePreferencesPanelProps {
  onPreferencesChange?: (preferences: ResponsePreferences) => void;
  className?: string;
  compact?: boolean;
}

export function ResponsePreferencesPanel({
  onPreferencesChange,
  className,
  compact = false,
}: ResponsePreferencesPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<ResponsePreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ResponsePreferences;
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch {
      console.warn('Failed to load response preferences from localStorage');
    }
    setIsLoaded(true);
  }, []);

  // Save preferences to localStorage and notify parent
  const updatePreferences = (updates: Partial<ResponsePreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
    } catch {
      console.warn('Failed to save response preferences to localStorage');
    }

    onPreferencesChange?.(newPreferences);
  };

  // Count active customizations
  const customizationCount = [
    preferences.format !== 'structured',
    preferences.depth !== 'standard',
    preferences.includeCitations,
    preferences.includeInsights,
    preferences.includeKeyTakeaways,
    preferences.includeNextSteps,
  ].filter(Boolean).length;

  if (!isLoaded) {
    return null;
  }

  const selectedFormat = RESPONSE_FORMATS.find((f) => f.id === preferences.format);

  if (compact) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn('w-full', className)}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Settings2 className="h-4 w-4" />
            {customizationCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs font-medium">
                {customizationCount}
              </Badge>
            )}
            {isOpen ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2">
          <div className="p-3 bg-muted/50 border rounded-lg space-y-3">
            {/* Format Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Response Format</Label>
              <Select
                value={preferences.format}
                onValueChange={(value) => updatePreferences({ format: value })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESPONSE_FORMATS.map((format) => (
                    <SelectItem key={format.id} value={format.id}>
                      <div className="flex items-center gap-2">
                        <format.icon className="h-3.5 w-3.5" />
                        <span>{format.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Depth Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Response Depth</Label>
              <div className="flex gap-1">
                {RESPONSE_DEPTHS.map((depth) => (
                  <Button
                    key={depth.id}
                    variant={preferences.depth === depth.id ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={() => updatePreferences({ depth: depth.id })}
                  >
                    {depth.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Toggle Options */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-2 bg-background rounded border">
                <div className="flex items-center gap-1.5">
                  <Quote className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs">Citations</span>
                </div>
                <Switch
                  checked={preferences.includeCitations}
                  onCheckedChange={(checked) =>
                    updatePreferences({ includeCitations: checked })
                  }
                  className="scale-75"
                />
              </div>
              <div className="flex items-center justify-between p-2 bg-background rounded border">
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs">Insights</span>
                </div>
                <Switch
                  checked={preferences.includeInsights}
                  onCheckedChange={(checked) =>
                    updatePreferences({ includeInsights: checked })
                  }
                  className="scale-75"
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Full panel version
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn('w-full', className)}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between h-9 px-3"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span className="font-medium">Response Preferences</span>
            {customizationCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {customizationCount} active
              </Badge>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3">
        <div className="p-4 bg-muted/30 border rounded-lg space-y-4">
          {/* Response Format */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Response Format</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {RESPONSE_FORMATS.map((format) => (
                <Button
                  key={format.id}
                  variant={preferences.format === format.id ? 'default' : 'outline'}
                  className={cn(
                    'h-auto p-3 flex flex-col items-start gap-1.5',
                    preferences.format === format.id && 'ring-2 ring-primary ring-offset-2'
                  )}
                  onClick={() => updatePreferences({ format: format.id })}
                >
                  <div className="flex items-center gap-2">
                    <format.icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{format.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left leading-snug">
                    {format.description}
                  </p>
                </Button>
              ))}
            </div>
          </div>

          {/* Response Depth */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Response Depth</Label>
            <div className="flex gap-2">
              {RESPONSE_DEPTHS.map((depth) => (
                <Button
                  key={depth.id}
                  variant={preferences.depth === depth.id ? 'default' : 'outline'}
                  className="flex-1 h-9"
                  onClick={() => updatePreferences({ depth: depth.id })}
                >
                  <span className="font-medium">{depth.label}</span>
                </Button>
              ))}
            </div>
            {selectedFormat && (
              <p className="text-xs text-muted-foreground">
                {RESPONSE_DEPTHS.find((d) => d.id === preferences.depth)?.description}
              </p>
            )}
          </div>

          {/* Additional Options */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Include in Response</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div className="flex items-center gap-2">
                  <Quote className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">Citations</span>
                    <p className="text-xs text-muted-foreground">Reference sources</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.includeCitations}
                  onCheckedChange={(checked) =>
                    updatePreferences({ includeCitations: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">Insights</span>
                    <p className="text-xs text-muted-foreground">Key observations</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.includeInsights}
                  onCheckedChange={(checked) =>
                    updatePreferences({ includeInsights: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">Key Takeaways</span>
                    <p className="text-xs text-muted-foreground">Summary points</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.includeKeyTakeaways}
                  onCheckedChange={(checked) =>
                    updatePreferences({ includeKeyTakeaways: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">Next Steps</span>
                    <p className="text-xs text-muted-foreground">Action items</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.includeNextSteps}
                  onCheckedChange={(checked) =>
                    updatePreferences({ includeNextSteps: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-end pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                setPreferences(DEFAULT_PREFERENCES);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));
                onPreferencesChange?.(DEFAULT_PREFERENCES);
              }}
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Hook to access response preferences from anywhere
export function useResponsePreferences(): ResponsePreferences {
  const [preferences, setPreferences] = useState<ResponsePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) });
      }
    } catch {
      // Use defaults on error
    }

    // Listen for storage changes from other tabs/components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(e.newValue) });
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return preferences;
}

// Export storage key for external use
export { STORAGE_KEY as RESPONSE_PREFERENCES_STORAGE_KEY };
