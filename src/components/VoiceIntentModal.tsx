/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, Sparkles, Check, ArrowRight, Loader2, PlayCircle, MessageSquare } from 'lucide-react';
import { PortableCard, VoiceIntentResult } from '../types';
import { VoiceIntentController, parseVoiceIntent } from '../services/audio';

interface VoiceIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: PortableCard[];
  onApplyIntent: (result: VoiceIntentResult) => void;
}

export function VoiceIntentModal({ isOpen, onClose, cards, onApplyIntent }: VoiceIntentModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<VoiceIntentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const controllerRef = useRef<VoiceIntentController | null>(null);

  useEffect(() => {
    controllerRef.current = new VoiceIntentController();
    return () => {
      controllerRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setParsedResult(null);
      setErrorMessage(null);
      handleToggleListen();
    } else {
      controllerRef.current?.stop();
      setIsRecording(false);
    }
  }, [isOpen]);

  const handleToggleListen = () => {
    if (isRecording) {
      controllerRef.current?.stop();
      setIsRecording(false);
      if (transcript.trim()) {
        handleAnalyzeTranscript(transcript);
      }
    } else {
      setErrorMessage(null);
      controllerRef.current?.start({
        onTranscriptChange: (text) => {
          setTranscript(text);
        },
        onError: (err) => {
          setErrorMessage(err);
          setIsRecording(false);
        },
        onEnd: () => {
          setIsRecording(false);
        }
      });
      setIsRecording(true);
    }
  };

  const handleAnalyzeTranscript = async (textToParse: string) => {
    if (!textToParse.trim()) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const result = await parseVoiceIntent(textToParse, cards);
      setParsedResult(result);
    } catch (err: any) {
      setErrorMessage("Failed to process speech intent: " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmExecute = () => {
    if (parsedResult) {
      onApplyIntent(parsedResult);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-neutral-900/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col border border-neutral-100"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-[#FDFDFB]">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <Sparkles size={18} />
              </span>
              <div>
                <h3 className="font-semibold text-neutral-900 text-lg">Agentic Voice-to-Intent</h3>
                <p className="text-xs text-neutral-500">Dictate goals, tasks, or deployments to your systems.</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Listening Visualizer */}
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative flex items-center justify-center">
                {isRecording && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className="absolute w-24 h-24 rounded-full bg-purple-400/30"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0.1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="absolute w-32 h-32 rounded-full bg-purple-300/20"
                    />
                  </>
                )}
                <button
                  onClick={handleToggleListen}
                  className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                    isRecording 
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200' 
                      : 'bg-neutral-900 hover:bg-black text-white shadow-neutral-200'
                  }`}
                >
                  {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
              </div>
              <span className="mt-4 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                {isRecording ? "Listening... Speak your command" : "Tap microphone to dictate or type below"}
              </span>
            </div>

            {/* Transcript Input / Edit */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Transcript / Command
              </label>
              <div className="relative">
                <textarea
                  rows={2}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder='e.g., "Add a task to SecurityGuard to upgrade Tailwind CSS and verify the build."'
                  className="w-full px-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all placeholder:text-neutral-400"
                />
                {!isRecording && transcript && (
                  <button
                    onClick={() => handleAnalyzeTranscript(transcript)}
                    disabled={isProcessing}
                    className="absolute right-2 bottom-3 px-3 py-1 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    <span>Parse</span>
                  </button>
                )}
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                {errorMessage}
              </div>
            )}

            {/* Structured Parse Result Preview */}
            {parsedResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-900 uppercase tracking-widest">Parsed Agent Action</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-200/60 text-purple-800 font-mono font-semibold">
                    {parsedResult.actionType}
                  </span>
                </div>

                <div className="text-xs text-neutral-700 space-y-1">
                  {parsedResult.targetCardName && (
                    <p><strong>Target Card:</strong> {parsedResult.targetCardName}</p>
                  )}
                  {parsedResult.payload.title && (
                    <p><strong>Task Title:</strong> {parsedResult.payload.title}</p>
                  )}
                  {parsedResult.payload.goal && (
                    <p><strong>Goal:</strong> {parsedResult.payload.goal}</p>
                  )}
                  {parsedResult.payload.blocker && (
                    <p><strong>Blocker:</strong> {parsedResult.payload.blocker}</p>
                  )}
                  <p className="text-purple-900 font-medium italic mt-2">
                    "{parsedResult.naturalResponse}"
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-neutral-100 bg-[#FDFDFB] flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 text-sm font-semibold hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            {parsedResult && (
              <button
                onClick={handleConfirmExecute}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-sm font-semibold flex items-center gap-2 transition-all shadow-md"
              >
                <Check size={16} />
                <span>Execute Intent</span>
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
