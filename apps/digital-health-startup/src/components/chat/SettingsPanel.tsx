/**
 * SettingsPanel - Chat Configuration and Preferences
 * Healthcare-specific settings for compliance, voice, and AI behavior
 */

'use client';

import { motion } from 'framer-motion';
import {
  X,
  Settings,
  Shield,
  Palette,
  Activity,
  Brain,
  Save
} from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import { Slider } from '@/shared/components/ui/slider';
import { Switch } from '@/shared/components/ui/switch';
import type { ChatSettings } from '@/types/chat.types';

interface SettingsPanelProps {
  onClose: () => void;
  onSettingsChange?: (settings: Partial<ChatSettings>) => void;
}

const defaultSettings: ChatSettings = {
  theme: 'system',
  fontSize: 'medium',
  autoScroll: true,
  voiceEnabled: true,
  suggestionsEnabled: true,
  branchingEnabled: false,
  collaborationEnabled: true,
  confidenceThreshold: 0.7,
  maxAgents: 3,
  streamingEnabled: true,
  citationsEnabled: true,
  complianceMode: true,
  model: 'gpt-4-turbo',
  temperature: 0.7,
  maxTokens: 2000,
  responseStyle: 'balanced',
  enableVoice: true,
  enableFileUpload: true,
  enableMultiAgent: true,
  complianceLevel: 'enhanced',
  language: 'en-US'
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onClose,
  onSettingsChange
}) => {
  const [settings, setSettings] = useState<ChatSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

    setSettings(newSettings);
    setHasChanges(true);
  };

    onSettingsChange?.(settings);
    setHasChanges(false);
    onClose();
  };

    setSettings(defaultSettings);
    setHasChanges(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick=(e) => e.stopPropagation() onKeyDown=(e) => e.stopPropagation() role="button" tabIndex={0}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Settings</h2>
              <p className="text-sm text-muted-foreground">Configure your VITAL Path AI experience</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-8">
            {/* AI Model Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Model Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="model">AI Model</Label>
                    <Select
                      value={settings.model}
                      onValueChange={(value) => handleSettingChange('model', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Recommended)</SelectItem>
                        <SelectItem value="gpt-4">GPT-4 (High Quality)</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast)</SelectItem>
                        <SelectItem value="claude-3-opus">Claude 3 Opus (Creative)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responseStyle">Response Style</Label>
                    <Select
                      value={settings.responseStyle}
                      onValueChange={(value) => handleSettingChange('responseStyle', value as unknown)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concise">Concise (Brief responses)</SelectItem>
                        <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                        <SelectItem value="detailed">Detailed (Comprehensive)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="temperature">Creativity Level</Label>
                    <Badge variant="outline">{settings.temperature || 0.7}</Badge>
                  </div>
                  <Slider
                    value={[settings.temperature || 0.7]}
                    onValueChange={(value) => handleSettingChange('temperature', value[0])}
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>More Focused</span>
                    <span>More Creative</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="maxTokens">Max Response Length</Label>
                    <Badge variant="outline">{settings.maxTokens || 2000} tokens</Badge>
                  </div>
                  <Slider
                    value={[settings.maxTokens || 2000]}
                    onValueChange={(value) => handleSettingChange('maxTokens', value[0])}
                    min={500}
                    max={4000}
                    step={100}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Healthcare Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Healthcare Compliance
                  <Badge variant="outline" className="ml-auto">HIPAA Compliant</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="complianceLevel">Compliance Level</Label>
                  <Select
                    value={settings.complianceLevel}
                    onValueChange={(value) => handleSettingChange('complianceLevel', value as unknown)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (Basic compliance)</SelectItem>
                      <SelectItem value="enhanced">Enhanced (Recommended)</SelectItem>
                      <SelectItem value="maximum">Maximum (Strictest)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Higher levels provide stronger PHI protection but may limit some features
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">PHI Detection</div>
                      <div className="text-xs text-muted-foreground">Automatically detect protected health information</div>
                    </div>
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Audit Logging</div>
                      <div className="text-xs text-muted-foreground">Track all interactions for compliance</div>
                    </div>
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interface Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Interface & Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value) => handleSettingChange('theme', value as unknown)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System (Auto)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => handleSettingChange('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es-ES">Spanish</SelectItem>
                        <SelectItem value="fr-FR">French</SelectItem>
                        <SelectItem value="de-DE">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Features & Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="enableVoice">Voice Input & Output</Label>
                      <p className="text-xs text-muted-foreground">
                        Enable speech recognition and text-to-speech
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableVoice}
                      onCheckedChange={(checked) => handleSettingChange('enableVoice', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="enableFileUpload">File Upload</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow document and image uploads for analysis
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableFileUpload}
                      onCheckedChange={(checked) => handleSettingChange('enableFileUpload', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="enableMultiAgent">Multi-Agent Collaboration</Label>
                      <p className="text-xs text-muted-foreground">
                        Enable multiple AI experts to collaborate on responses
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableMultiAgent}
                      onCheckedChange={(checked) => handleSettingChange('enableMultiAgent', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
          <div className="text-sm text-muted-foreground">
            Changes will be applied immediately
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleReset}>
              Reset to Default
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              {hasChanges ? 'Save Changes' : 'Saved'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};