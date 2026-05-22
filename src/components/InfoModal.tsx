/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { X, HelpCircle, BookOpen, Info, ChevronDown } from "lucide-react";
import React, { useState } from "react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'about' | 'guide' | 'faq';
}

const FAQ_ITEMS = [
  {
    q: "What is a PortableCard?",
    a: "A PortableCard is a semantic projection of your software project. It's not just a link to a repo, but an agentic entity that tracks status, goals, and architecture snapshots."
  },
  {
    q: "How does the 'Autonomous' part work?",
    a: "We use Gemini-powered agents to monitor your telemetry and code changes. These agents suggest performance fixes, security patches, and test coverage improvements."
  },
  {
    q: "Can I use this for non-GitHub projects?",
    a: "Yes. You can manually describe any architectural system, and intenTidy will create a semantic card to manage its intent and lifecycle."
  }
];

export function InfoModal({ isOpen, onClose, initialTab = 'about' }: InfoModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
          className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-[#FDFDFB]">
             <div className="flex gap-4">
                <TabButton 
                  active={activeTab === 'about'} 
                  onClick={() => setActiveTab('about')}
                  icon={<Info size={16} />}
                  label="About"
                />
                <TabButton 
                  active={activeTab === 'guide'} 
                  onClick={() => setActiveTab('guide')}
                  icon={<BookOpen size={16} />}
                  label="Guide"
                />
                <TabButton 
                  active={activeTab === 'faq'} 
                  onClick={() => setActiveTab('faq')}
                  icon={<HelpCircle size={16} />}
                  label="FAQ"
                />
             </div>
             <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
               <X size={20} />
             </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {activeTab === 'about' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section className="space-y-4">
                  <h3 className="text-3xl font-light tracking-tight text-neutral-900">The Semantic Shift</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    intenTidy solves the <strong>cognitive overload</strong> of multi-device engineering. Instead of managing thousands of raw files, you manage high-level software entities (PortableCards).
                  </p>
                </section>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-neutral-400">For Who?</h4>
                    <ul className="text-sm text-neutral-600 space-y-2">
                      <li>• Solo engineers moving between desktop and mobile.</li>
                      <li>• Architecture leads managing several microservices.</li>
                      <li>• AI-native teams utilizing agentic orchestration.</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-neutral-400">When to use?</h4>
                    <ul className="text-sm text-neutral-600 space-y-2">
                      <li>• Reviewing diffs during a commute.</li>
                      <li>• Tracking deployment health in real-time.</li>
                      <li>• Orchestrating system goals from a phone.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'guide' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section className="space-y-6">
                  <h3 className="text-2xl font-light tracking-tight">Getting Started</h3>
                  <div className="space-y-4">
                    <GuideStep number="01" title="Initialize Card" desc="Paste your repo URL or a system description in the 'Add Card' modal." />
                    <GuideStep number="02" title="Sync Context" desc="Cards automatically pull branch history, telemetry, and deployment states." />
                    <GuideStep number="03" title="Review Diffs" desc="Tap 'Review Diffs' to see semantic changes instead of raw code line-by-line." />
                    <GuideStep number="04" title="Orchestrate" desc="Update goals and tasks. Your agents will listen and suggest actions." />
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {FAQ_ITEMS.map((item, i) => (
                  <div key={i} className="border-b border-neutral-100 last:border-0">
                    <button 
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full py-4 flex justify-between items-center text-left hover:text-neutral-600 transition-colors"
                    >
                      <span className="font-medium">{item.q}</span>
                      <ChevronDown className={`transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="pb-4 text-neutral-500 text-sm leading-relaxed">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        active ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-200' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function GuideStep({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex gap-6 p-4 rounded-2xl border border-neutral-50 bg-neutral-50/30">
      <span className="text-2xl font-black text-neutral-200">{number}</span>
      <div className="space-y-1">
        <h5 className="font-bold text-sm text-neutral-900">{title}</h5>
        <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
