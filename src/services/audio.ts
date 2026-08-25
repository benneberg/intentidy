/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PortableCard, VoiceIntentResult } from '../types';

// Declare Web Speech API types for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface SpeechListenerOptions {
  onTranscriptChange: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

export class VoiceIntentController {
  private recognition: any | null = null;
  private isListening: boolean = false;

  constructor() {
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      } catch (e) {
        console.warn("SpeechRecognition init error:", e);
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public start(options: SpeechListenerOptions): void {
    if (!this.recognition) {
      options.onError("Speech recognition is not natively supported in this browser environment. You can type commands directly.");
      return;
    }

    if (this.isListening) {
      this.stop();
    }

    this.isListening = true;

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      options.onTranscriptChange(text, !!finalTranscript);
    };

    this.recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      options.onError(`Speech error: ${event.error || 'Unknown'}`);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      options.onEnd();
    };

    try {
      this.recognition.start();
    } catch (err: any) {
      console.error("Failed to start speech recognition:", err);
      options.onError(err.message || "Failed to start microphone");
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn("Error stopping speech recognition:", e);
      }
      this.isListening = false;
    }
  }
}

/**
 * Send natural voice transcript or command text to the Gemini backend proxy
 * to parse into an actionable intent structure.
 */
export async function parseVoiceIntent(transcript: string, cards: PortableCard[]): Promise<VoiceIntentResult> {
  try {
    const res = await fetch('/api/gemini/parse-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, cards })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server returned ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    console.error("Failed to parse voice intent:", error);
    return {
      actionType: 'general',
      payload: { description: transcript },
      naturalResponse: `Understood: "${transcript}". (AI intent processing encountered an error: ${error.message || 'Offline'})`
    };
  }
}
