'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Zap,
  Brain,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui';
import { Button } from '@vital/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@vital/ui';
import { Input } from '@vital/ui';
import { Label } from '@vital/ui';
import { Alert, AlertDescription } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Separator } from '@vital/ui';

interface LLMConfig {
  id?: string;
  llm_provider: string;
  llm_model: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  config_name?: string;
  description?: string;
}

const LLM_PROVIDERS = [
  {
    value: 'anthropic',
    label: 'Anthropic (Claude)',
    icon: <Brain className="h-4 w-4" />,
    models: [
      { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Recommended)', recommended: true },
      { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Highest Quality)' },
      { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
      { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Fastest)' },
    ],
  },
  {
    value: 'openai',
    label: 'OpenAI (GPT)',
    icon: <Sparkles className="h-4 w-4" />,
    models: [
      { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo (Recommended)', recommended: true },
      { value: 'gpt-4', label: 'GPT-4 (Highest Quality)' },
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Efficient)' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Fastest)' },
    ],
  },
  {
    value: 'google',
    label: 'Google (Gemini)',
    icon: <Zap className="h-4 w-4" />,
    models: [
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Recommended)', recommended: true },
      { value: 'gemini-pro', label: 'Gemini Pro' },
      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fastest)' },
    ],
  },
];

export function PromptEnhancementConfigPanel() {
  const [config, setConfig] = useState<LLMConfig>({
    llm_provider: 'anthropic',
    llm_model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    max_tokens: 2048,
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load current configuration
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:8000'}/api/prompts/config`);
      const data = await response.json();

      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      setMessage({ type: 'error', text: 'Failed to load configuration' });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:8000'}/api/prompts/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Configuration saved successfully!' });
        // Reload to get the saved config with ID
        await loadConfig();
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const selectedProvider = LLM_PROVIDERS.find((p) => p.value === config.llm_provider);
  const availableModels = selectedProvider?.models || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            <CardTitle>Prompt Enhancement Configuration</CardTitle>
          </div>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI-Powered
          </Badge>
        </div>
        <CardDescription>
          Configure the LLM provider and model for AI-powered prompt enhancement
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-purple-600" />
          </div>
        ) : (
          <>
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label htmlFor="provider">LLM Provider</Label>
              <Select
                value={config.llm_provider}
                onValueChange={(value) =>
                  setConfig({
                    ...config,
                    llm_provider: value,
                    llm_model: LLM_PROVIDERS.find((p) => p.value === value)?.models[0].value || '',
                  })
                }
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LLM_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      <div className="flex items-center gap-2">
                        {provider.icon}
                        {provider.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={config.llm_model}
                onValueChange={(value) => setConfig({ ...config, llm_model: value })}
              >
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex items-center gap-2">
                        {model.label}
                        {model.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Advanced Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Advanced Settings
              </h3>

              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="temperature">Temperature</Label>
                  <span className="text-sm text-muted-foreground">{config.temperature}</span>
                </div>
                <Input
                  id="temperature"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  Lower = More focused and deterministic, Higher = More creative and varied
                </p>
              </div>

              {/* Max Tokens */}
              <div className="space-y-2">
                <Label htmlFor="max_tokens">Max Tokens</Label>
                <Input
                  id="max_tokens"
                  type="number"
                  min="100"
                  max="8000"
                  step="100"
                  value={config.max_tokens}
                  onChange={(e) => setConfig({ ...config, max_tokens: parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum length of the enhanced prompt (100-8000 tokens)
                </p>
              </div>
            </div>

            <Separator />

            {/* Info Box */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> Changes will apply immediately to all new prompt enhancement
                requests. Make sure the corresponding API keys are configured in your environment
                variables.
              </AlertDescription>
            </Alert>

            {/* Message */}
            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button onClick={saveConfig} disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={loadConfig} disabled={loading || saving}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Environment Variable Info */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Required Environment Variables:
              </h4>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                {config.llm_provider === 'anthropic' && (
                  <li className="font-mono">ANTHROPIC_API_KEY</li>
                )}
                {config.llm_provider === 'openai' && <li className="font-mono">OPENAI_API_KEY</li>}
                {config.llm_provider === 'google' && (
                  <li className="font-mono">GOOGLE_API_KEY or GEMINI_API_KEY</li>
                )}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default PromptEnhancementConfigPanel;

