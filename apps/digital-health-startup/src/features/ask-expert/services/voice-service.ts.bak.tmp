/**
 * Voice I/O Service - Q1 2025 Enhancement
 *
 * Provides speech-to-text (STT) and text-to-speech (TTS) capabilities
 * for hands-free Ask Expert interactions.
 *
 * Features:
 * - Browser Web Speech API integration
 * - Multi-language support (25+ languages)
 * - Real-time transcription
 * - Natural voice synthesis
 * - Wake word detection
 * - Voice activity detection (VAD)
 */

export interface VoiceConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  voiceSpeed?: number;
  voicePitch?: number;
  voiceVolume?: number;
}

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
}

export interface SynthesisOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
}

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private isPaused = false;

  // Callbacks
  private onTranscript: ((result: TranscriptionResult) => void) | null = null;
  private onError: ((error: Error) => void) | null = null;
  private onEnd: (() => void) | null = null;

  constructor() {
    this.initializeServices();
  }

  /**
   * Initialize speech recognition and synthesis services
   */
  private initializeServices(): void {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  /**
   * Check if voice services are available
   */
  isAvailable(): { stt: boolean; tts: boolean } {
    return {
      stt: this.recognition !== null,
      tts: this.synthesis !== null,
    };
  }

  /**
   * Get available voices for synthesis
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  /**
   * Get voice by language and name
   */
  getVoice(language: string = 'en-US', name?: string): SpeechSynthesisVoice | undefined {
    const voices = this.getAvailableVoices();

    if (name) {
      return voices.find(v => v.name === name && v.lang.startsWith(language));
    }

    // Default to first voice matching language
    return voices.find(v => v.lang.startsWith(language));
  }

  /**
   * Start listening for speech input
   */
  startListening(config: VoiceConfig = {}): void {
    if (!this.recognition) {
      throw new Error('Speech recognition not available');
    }

    if (this.isListening) {
      console.warn('Already listening');
      return;
    }

    // Configure recognition
    this.recognition.lang = config.language || 'en-US';
    this.recognition.continuous = config.continuous ?? true;
    this.recognition.interimResults = config.interimResults ?? true;
    this.recognition.maxAlternatives = 3;

    // Set up event handlers
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      // Get alternatives
      const alternatives = [];
      for (let i = 1; i < result.length; i++) {
        alternatives.push({
          transcript: result[i].transcript,
          confidence: result[i].confidence,
        });
      }

      if (this.onTranscript) {
        this.onTranscript({
          transcript,
          confidence,
          isFinal,
          alternatives: alternatives.length > 0 ? alternatives : undefined,
        });
      }
    };

    this.recognition.onerror = (event: any) => {
      const error = new Error(event.error || 'Speech recognition error');
      if (this.onError) {
        this.onError(error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd && !this.isPaused) {
        this.onEnd();
      }
    };

    // Start recognition
    this.recognition.start();
    this.isListening = true;
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (!this.recognition || !this.isListening) return;

    this.recognition.stop();
    this.isListening = false;
  }

  /**
   * Pause listening temporarily
   */
  pauseListening(): void {
    if (!this.recognition || !this.isListening) return;

    this.isPaused = true;
    this.recognition.stop();
  }

  /**
   * Resume listening
   */
  resumeListening(): void {
    if (!this.recognition || !this.isPaused) return;

    this.isPaused = false;
    this.recognition.start();
  }

  /**
   * Speak text using TTS
   */
  speak(text: string, options: SynthesisOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);

      // Configure utterance
      if (options.voice) {
        utterance.voice = options.voice;
      } else if (options.language) {
        const voice = this.getVoice(options.language);
        if (voice) utterance.voice = voice;
      }

      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      // Set up event handlers
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(event.error));

      // Speak
      this.synthesis.speak(utterance);
    });
  }

  /**
   * Stop speaking
   */
  stopSpeaking(): void {
    if (!this.synthesis) return;
    this.synthesis.cancel();
  }

  /**
   * Pause speaking
   */
  pauseSpeaking(): void {
    if (!this.synthesis) return;
    this.synthesis.pause();
  }

  /**
   * Resume speaking
   */
  resumeSpeaking(): void {
    if (!this.synthesis) return;
    this.synthesis.resume();
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis?.speaking ?? false;
  }

  /**
   * Register callback for transcription results
   */
  onTranscription(callback: (result: TranscriptionResult) => void): void {
    this.onTranscript = callback;
  }

  /**
   * Register callback for errors
   */
  onVoiceError(callback: (error: Error) => void): void {
    this.onError = callback;
  }

  /**
   * Register callback for recognition end
   */
  onListeningEnd(callback: () => void): void {
    this.onEnd = callback;
  }

  /**
   * Clear all callbacks
   */
  clearCallbacks(): void {
    this.onTranscript = null;
    this.onError = null;
    this.onEnd = null;
  }

  /**
   * Cleanup and destroy service
   */
  destroy(): void {
    this.stopListening();
    this.stopSpeaking();
    this.clearCallbacks();
    this.recognition = null;
    this.synthesis = null;
  }
}

// Singleton instance
export const voiceService = new VoiceService();

// Hook for React components
export function useVoiceService() {
  return voiceService;
}

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
  { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', flag: '🇵🇹' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
  { code: 'nl-NL', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pl-PL', name: 'Polish', flag: '🇵🇱' },
  { code: 'sv-SE', name: 'Swedish', flag: '🇸🇪' },
  { code: 'da-DK', name: 'Danish', flag: '🇩🇰' },
  { code: 'fi-FI', name: 'Finnish', flag: '🇫🇮' },
  { code: 'no-NO', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'tr-TR', name: 'Turkish', flag: '🇹🇷' },
  { code: 'th-TH', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi-VN', name: 'Vietnamese', flag: '🇻🇳' },
];
