// @ts-nocheck
'use client';

import {
  Mic,
  MicOff,
  Volume2,
  Settings,
  BookOpen,
  Brain,
  Zap,
  AlertCircle,
  Info,
  RefreshCw
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Progress } from '@/shared/components/ui/progress';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import { Slider } from '@/shared/components/ui/slider';
import { Switch } from '@/shared/components/ui/switch';

interface VoiceIntegrationProps {
  onCommand?: (command: VoiceCommand) => void;
  onTranscription?: (text: string) => void;
  medicalSpecialty?: string;
  className?: string;
}

interface VoiceCommand {
  id: string;
  type: 'navigate' | 'search' | 'create' | 'dictate' | 'query';
  action: string;
  parameters: Record<string, unknown>;
  confidence: number;
  medicalTerms: MedicalTerm[];
}

interface MedicalTerm {
  term: string;
  type: 'condition' | 'procedure' | 'medication' | 'anatomy' | 'measurement';
  confidence: number;
  coding?: {
    system: 'ICD-10' | 'CPT' | 'SNOMED' | 'RxNorm' | 'LOINC';
    code: string;
    display: string;
  };
}

interface VoiceSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  transcription: string;
  commands: VoiceCommand[];
  medicalTermsDetected: number;
  accuracy: number;
}

  {
    trigger: ['show patient timeline', 'open timeline', 'patient history'],
    action: 'navigate',
    target: 'timeline',
    description: 'Navigate to patient timeline'
  },
  {
    trigger: ['search for trials', 'find clinical trials', 'trial matching'],
    action: 'navigate',
    target: 'trials',
    description: 'Open clinical trial matcher'
  },
  {
    trigger: ['check drug interactions', 'interaction analysis', 'drug safety'],
    action: 'navigate',
    target: 'interactions',
    description: 'Open drug interaction checker'
  },
  {
    trigger: ['create new protocol', 'design protocol', 'workflow builder'],
    action: 'navigate',
    target: 'protocols',
    description: 'Open protocol designer'
  },
  {
    trigger: ['dictate notes', 'voice notes', 'clinical notes'],
    action: 'dictate',
    target: 'notes',
    description: 'Start clinical dictation'
  }
];

  { term: 'hypertension', type: 'condition', coding: { system: 'ICD-10', code: 'I10', display: 'Essential hypertension' }},
  { term: 'diabetes mellitus', type: 'condition', coding: { system: 'ICD-10', code: 'E11', display: 'Type 2 diabetes mellitus' }},
  { term: 'myocardial infarction', type: 'condition', coding: { system: 'ICD-10', code: 'I21', display: 'Acute myocardial infarction' }},
  { term: 'electrocardiogram', type: 'procedure', coding: { system: 'CPT', code: '93000', display: 'Electrocardiogram, routine ECG' }},
  { term: 'echocardiogram', type: 'procedure', coding: { system: 'CPT', code: '93306', display: 'Echocardiography, transthoracic' }},
  { term: 'metformin', type: 'medication', coding: { system: 'RxNorm', code: '6809', display: 'Metformin' }},
  { term: 'lisinopril', type: 'medication', coding: { system: 'RxNorm', code: '29046', display: 'Lisinopril' }},
  { term: 'blood pressure', type: 'measurement', coding: { system: 'LOINC', code: '85354-9', display: 'Blood pressure panel' }},
  { term: 'hemoglobin A1c', type: 'measurement', coding: { system: 'LOINC', code: '4548-4', display: 'Hemoglobin A1c' }}
];

export function VoiceIntegration({
  onCommand,
  onTranscription,
  medicalSpecialty = 'General Medicine',
  className = ''
}: VoiceIntegrationProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [currentSession, setCurrentSession] = useState<VoiceSession | null>(null);
  const [settings, setSettings] = useState({
    sensitivity: 80,
    medicalTermRecognition: true,
    autoCommand: true,
    continuousListening: false,
    language: 'en-US',
    specialty: medicalSpecialty
  });
  const [supportedCommands, setSupportedCommands] = useState(medicalCommands);
  const [detectedTerms, setDetectedTerms] = useState<MedicalTerm[]>([]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = settings.language;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        // };

      recognition.onresult = (event: unknown) => {

        for (let __i = event.resultIndex; i < event.results.length; i++) {

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentTranscription(currentText);

        if (finalTranscript) {
          processTranscription(finalTranscript);
        }
      };

      recognition.onerror = (event: unknown) => {
        // console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (currentSession) {
          setCurrentSession(prev => prev ? { ...prev, endTime: new Date() } : null);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [settings.language]);

  // Audio level monitoring

    try {

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 256;
      microphoneRef.current.connect(analyserRef.current);

        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);

          setVoiceLevel(Math.min(100, (average / 128) * 100));
        }
        animationRef.current = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
    } catch (error) {
      // console.error('Error accessing microphone:', error);
    }
  }, []);

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setVoiceLevel(0);
  }, []);

    setIsProcessing(true);

    // Detect medical terms
    const terms: MedicalTerm[] = [];
    medicalVocabulary.forEach(vocab => {
      if (text.toLowerCase().includes(vocab.term.toLowerCase())) {
        terms.push({
          term: vocab.term,
          type: vocab.type as unknown,
          confidence: 0.9,
          coding: vocab.coding as unknown
        });
      }
    });

    setDetectedTerms(terms);

    // Check for voice commands
    const commands: VoiceCommand[] = [];
    supportedCommands.forEach((cmd, index) => {
      cmd.trigger.forEach(trigger => {
        if (text.toLowerCase().includes(trigger.toLowerCase())) {
          commands.push({
            id: `cmd-${Date.now()}-${index}`,
            type: cmd.action as unknown,
            action: cmd.action,
            parameters: { target: cmd.target, text },
            confidence: 0.85,
            medicalTerms: terms
          });
        }
      });
    });

    // Update current session
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        transcription: prev.transcription + ' ' + text,
        commands: [...prev.commands, ...commands],
        medicalTermsDetected: prev.medicalTermsDetected + terms.length
      } : null);
    }

    // Execute commands if auto-command is enabled
    if (settings.autoCommand && commands.length > 0) {
      commands.forEach(command => {
        if (onCommand) {
          onCommand(command);
        }
      });
    }

    if (onTranscription) {
      onTranscription(text);
    }

    setTimeout(() => setIsProcessing(false), 500);
  }, [supportedCommands, currentSession, settings.autoCommand, onCommand, onTranscription]);

    if (recognitionRef.current && !isListening) {
      const newSession: VoiceSession = {
        id: `session-${Date.now()}`,
        startTime: new Date(),
        transcription: '',
        commands: [],
        medicalTermsDetected: 0,
        accuracy: 0
      };

      setCurrentSession(newSession);
      setCurrentTranscription('');
      setDetectedTerms([]);
      recognitionRef.current.start();
      setIsListening(true);
      startAudioMonitoring();
    }
  }, [isListening, startAudioMonitoring]);

    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      stopAudioMonitoring();

      if (currentSession) {
        setSessions(prev => [...prev, { ...currentSession, endTime: new Date() }]);
        setCurrentSession(null);
      }
    }
  }, [isListening, currentSession, stopAudioMonitoring]);

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Voice Control Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Medical Voice Assistant</span>
            </div>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
              Phase 4.3 Component
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Main Voice Control */}
            <div className="text-center space-y-4">
              <div className="relative">
                <Button
                  size="lg"
                  onClick={toggleListening}
                  className={`w-24 h-24 rounded-full ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <RefreshCw className="h-8 w-8 animate-spin" />
                  ) : isListening ? (
                    <MicOff className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>

                {/* Voice Level Indicator */}
                {isListening && (
                  <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-pulse"
                       style={{ transform: `scale(${1 + voiceLevel / 500})` }} />
                )}
              </div>

              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Click to Start'}
                </p>
                <p className="text-sm text-gray-600">
                  {settings.specialty} - Medical terminology enabled
                </p>
              </div>

              {/* Voice Level */}
              {isListening && (
                <div className="w-full max-w-md mx-auto">
                  <Progress value={voiceLevel} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">Voice Level: {Math.round(voiceLevel)}%</p>
                </div>
              )}
            </div>

            {/* Current Transcription */}
            {currentTranscription && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Volume2 className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Live Transcription:</p>
                    <p className="text-gray-800 mt-1">{currentTranscription}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Detected Medical Terms */}
            {detectedTerms.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <BookOpen className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-green-800">Medical Terms Detected:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {detectedTerms.map((term, idx) => (
                        <Badge key={idx} variant="outline" className="bg-white text-green-700 border-green-300">
                          {term.term} ({term.type})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status Alerts */}
            {!('webkitSpeechRecognition' in window) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Speech recognition is not supported in this browser. Please use Chrome or Edge for optimal experience.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Voice Commands and Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Commands */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Voice Commands</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {supportedCommands.map((command, idx) => (
                  <div key={idx} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{command.description}</p>
                        <div className="mt-1">
                          {command.trigger.map((trigger, triggerIdx) => (
                            <Badge key={triggerIdx} variant="secondary" className="mr-1 mb-1 text-xs">
                              "{trigger}"
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {command.action}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Voice Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Voice Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sensitivity">Microphone Sensitivity</Label>
                <div className="mt-2">
                  <Slider
                    id="sensitivity"
                    min={20}
                    max={100}
                    step={5}
                    value={[settings.sensitivity]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, sensitivity: value[0] }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">{settings.sensitivity}%</p>
                </div>
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
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

              <div>
                <Label htmlFor="specialty">Medical Specialty</Label>
                <Select
                  value={settings.specialty}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, specialty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Medicine">General Medicine</SelectItem>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Oncology">Oncology</SelectItem>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Endocrinology">Endocrinology</SelectItem>
                    <SelectItem value="Emergency Medicine">Emergency Medicine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="medical-terms">Medical Term Recognition</Label>
                  <Switch
                    id="medical-terms"
                    checked={settings.medicalTermRecognition}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, medicalTermRecognition: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-command">Auto-execute Commands</Label>
                  <Switch
                    id="auto-command"
                    checked={settings.autoCommand}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoCommand: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="continuous">Continuous Listening</Label>
                  <Switch
                    id="continuous"
                    checked={settings.continuousListening}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, continuousListening: checked }))}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session History */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>Voice Session History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-60">
              <div className="space-y-3">
                {sessions.slice(-5).reverse().map((session) => (
                  <div key={session.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {session.startTime.toLocaleTimeString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {session.medicalTermsDetected} medical terms
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {session.commands.length} commands
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{session.transcription}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}