'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../lib/utils';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Loader2,
  Volume2,
  VolumeX,
  Settings,
  X,
  Send,
  Waveform,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface VoiceSettings {
  inputVolume: number;
  outputVolume: number;
  voiceActivityDetection: boolean;
  autoSubmit: boolean;
  language: string;
}

export interface VitalVoiceInterfaceProps {
  /** Current voice state */
  state?: VoiceState;
  /** Transcribed text */
  transcript?: string;
  /** Interim (in-progress) transcript */
  interimTranscript?: string;
  /** Whether voice input is supported */
  isSupported?: boolean;
  /** Audio level (0-100) for visualization */
  audioLevel?: number;
  /** Voice settings */
  settings?: Partial<VoiceSettings>;
  /** Callback when recording starts */
  onStart?: () => void;
  /** Callback when recording stops */
  onStop?: () => void;
  /** Callback when transcript is submitted */
  onSubmit?: (transcript: string) => void;
  /** Callback to update settings */
  onSettingsChange?: (settings: VoiceSettings) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Custom class name */
  className?: string;
}

const defaultSettings: VoiceSettings = {
  inputVolume: 80,
  outputVolume: 100,
  voiceActivityDetection: true,
  autoSubmit: false,
  language: 'en-US',
};

/**
 * VitalVoiceInterface - Hands-free Voice Input
 * 
 * Hands-free mode for clinicians with audio waveform visualization
 * replacing the text input. Supports speech-to-text and voice commands.
 * 
 * Uses Web Speech API for voice recognition.
 * 
 * @example
 * ```tsx
 * <VitalVoiceInterface
 *   state={voiceState}
 *   transcript={currentTranscript}
 *   audioLevel={micLevel}
 *   onStart={() => startListening()}
 *   onStop={() => stopListening()}
 *   onSubmit={(text) => sendMessage(text)}
 * />
 * ```
 */
export function VitalVoiceInterface({
  state = 'idle',
  transcript = '',
  interimTranscript = '',
  isSupported = true,
  audioLevel = 0,
  settings: propSettings,
  onStart,
  onStop,
  onSubmit,
  onSettingsChange,
  onError,
  className,
}: VitalVoiceInterfaceProps) {
  const [settings, setSettings] = useState<VoiceSettings>({
    ...defaultSettings,
    ...propSettings,
  });
  const [showSettings, setShowSettings] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Waveform visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = 3;
      const gap = 2;
      const barCount = Math.floor(width / (barWidth + gap));
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + gap);
        
        // Create wave effect based on position and audio level
        const waveOffset = Math.sin((i / barCount) * Math.PI * 4 + Date.now() / 200);
        const levelMultiplier = state === 'listening' ? audioLevel / 100 : 0.1;
        const barHeight = Math.max(4, Math.abs(waveOffset) * height * 0.4 * levelMultiplier);

        // Color based on state
        let color = 'rgb(156, 163, 175)'; // gray
        if (state === 'listening') {
          color = `rgb(59, 130, 246)`; // blue
        } else if (state === 'processing') {
          color = 'rgb(168, 85, 247)'; // purple
        } else if (state === 'speaking') {
          color = 'rgb(34, 197, 94)'; // green
        }

        ctx.fillStyle = color;
        ctx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight);
      }

      if (state === 'listening' || state === 'processing' || state === 'speaking') {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state, audioLevel]);

  const handleToggle = useCallback(() => {
    if (state === 'listening') {
      onStop?.();
    } else if (state === 'idle') {
      onStart?.();
    }
  }, [state, onStart, onStop]);

  const handleSubmit = useCallback(() => {
    if (transcript) {
      onSubmit?.(transcript);
    }
  }, [transcript, onSubmit]);

  const updateSettings = useCallback((updates: Partial<VoiceSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  }, [settings, onSettingsChange]);

  const getStateLabel = () => {
    switch (state) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Processing...';
      case 'speaking':
        return 'Speaking...';
      case 'error':
        return 'Error occurred';
      default:
        return 'Click to speak';
    }
  };

  const getStateColor = () => {
    switch (state) {
      case 'listening':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-purple-500';
      case 'speaking':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-muted-foreground';
    }
  };

  if (!isSupported) {
    return (
      <div className={cn('p-4 text-center text-muted-foreground', className)}>
        <MicOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Voice input is not supported in this browser</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Voice Button & Waveform */}
      <div className="relative">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border">
          {/* Voice Button */}
          <Button
            size="lg"
            variant={state === 'listening' ? 'destructive' : 'default'}
            className={cn(
              'h-16 w-16 rounded-full flex-shrink-0',
              state === 'listening' && 'animate-pulse'
            )}
            onClick={handleToggle}
            disabled={state === 'processing'}
          >
            {state === 'processing' ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : state === 'listening' ? (
              <Square className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>

          {/* Waveform Visualization */}
          <div className="flex-1 min-w-0">
            <canvas
              ref={canvasRef}
              width={300}
              height={60}
              className="w-full h-[60px]"
            />
          </div>

          {/* Settings */}
          <Popover open={showSettings} onOpenChange={setShowSettings}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Settings className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Voice Settings</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs">Input Volume</label>
                    <span className="text-xs text-muted-foreground">
                      {settings.inputVolume}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.inputVolume]}
                    onValueChange={([v]) => updateSettings({ inputVolume: v })}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs">Output Volume</label>
                    <span className="text-xs text-muted-foreground">
                      {settings.outputVolume}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.outputVolume]}
                    onValueChange={([v]) => updateSettings({ outputVolume: v })}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs">Auto-submit after silence</label>
                  <Button
                    variant={settings.autoSubmit ? 'default' : 'outline'}
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => updateSettings({ autoSubmit: !settings.autoSubmit })}
                  >
                    {settings.autoSubmit ? 'On' : 'Off'}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* State Indicator */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className={cn('w-2 h-2 rounded-full', getStateColor())} />
          <span className="text-sm text-muted-foreground">{getStateLabel()}</span>
        </div>
      </div>

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="p-4 rounded-lg bg-card border">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {transcript && (
                <p className="text-sm">
                  {transcript}
                </p>
              )}
              {interimTranscript && (
                <p className="text-sm text-muted-foreground italic">
                  {interimTranscript}
                </p>
              )}
            </div>
            {transcript && state !== 'listening' && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onStop?.()}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audio Level Indicator */}
      {state === 'listening' && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Input Level</span>
            <span>{audioLevel}%</span>
          </div>
          <Progress value={audioLevel} className="h-1" />
        </div>
      )}
    </div>
  );
}

export default VitalVoiceInterface;
