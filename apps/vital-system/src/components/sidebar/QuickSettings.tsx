'use client';

import React, { useState } from 'react';

interface SettingItem {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'slider';
  value: unknown;
  options?: string[];
  min?: number;
  max?: number;
}

export function QuickSettings() {
  const [settings, setSettings] = useState<SettingItem[]>([
    {
      id: 'voice-enabled',
      label: 'Voice Input',
      description: 'Enable voice-to-text input',
      type: 'toggle',
      value: true
    },
    {
      id: 'streaming-responses',
      label: 'Streaming Responses',
      description: 'Show responses as they are generated',
      type: 'toggle',
      value: true
    },
    {
      id: 'auto-save',
      label: 'Auto Save',
      description: 'Automatically save conversations',
      type: 'toggle',
      value: true
    },
    {
      id: 'theme-mode',
      label: 'Theme',
      description: 'Choose your preferred theme',
      type: 'select',
      value: 'system',
      options: ['light', 'dark', 'system']
    },
    {
      id: 'model-temperature',
      label: 'Response Creativity',
      description: 'Adjust AI response creativity (0.1 = focused, 0.9 = creative)',
      type: 'slider',
      value: 0.7,
      min: 0.1,
      max: 0.9
    },
    {
      id: 'max-tokens',
      label: 'Response Length',
      description: 'Maximum response length',
      type: 'select',
      value: '2048',
      options: ['512', '1024', '2048', '4096']
    },
    {
      id: 'hipaa-mode',
      label: 'HIPAA Compliance',
      description: 'Enhanced privacy and compliance checking',
      type: 'toggle',
      value: true
    },
    {
      id: 'safety-checks',
      label: 'Medical Safety Checks',
      description: 'Enable additional medical safety validations',
      type: 'toggle',
      value: true
    }
  ]);

  const updateSetting = (id: string, value: unknown) => {
    setSettings(prev => prev.map(setting =>
      setting.id === id ? { ...setting, value } : setting
    ));
  };

  const renderSettingControl = (setting: SettingItem) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <button
            onClick={() => updateSetting(setting.id, !setting.value)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              setting.value ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                setting.value ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        );

      case 'select':
        return (
          <select
            value={String(setting.value || '')}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            className="text-xs bg-muted border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {setting.options?.map((option: any) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'slider':
        return (
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={setting.min}
              max={setting.max}
              step={0.1}
              value={typeof setting.value === 'number' ? setting.value : 0}
              onChange={(e) => updateSetting(setting.id, parseFloat(e.target.value))}
              className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-muted-foreground w-8 text-right">
              {typeof setting.value === 'number' ? setting.value.toFixed(1) : String(setting.value || '')}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-foreground">Quick Settings</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Customize your VITAL Path experience
        </p>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-4">
          {settings.map((setting) => (
            <div key={setting.id} className="py-3 border-b border-border/30 last:border-b-0">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-foreground">
                  {setting.label}
                </label>
                {renderSettingControl(setting)}
              </div>
              <p className="text-xs text-muted-foreground">
                {setting.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border">
        <div className="space-y-2">
          <button className="w-full px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors">
            Export Settings
          </button>
          <button className="w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
            Reset to Defaults
          </button>
        </div>

        {/* Version Info */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <div>VITAL Path v3.0</div>
            <div>Healthcare AI Platform</div>
            <div className="flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              All systems operational
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}