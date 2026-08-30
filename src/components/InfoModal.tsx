/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { X, HelpCircle, BookOpen, Info, ChevronDown, Shield, Layers, Radio } from "lucide-react";
import React, { useState } from "react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'about' | 'guide' | 'faq';
}

const FAQ_ITEMS = [
  {
    q: "What is a PortableCard?",
    a: "A PortableCard is a semantic snapshot of an autonomous software entity. Instead of forcing you to navigate thousands of raw files, it captures runtime health, goals, blockers, deployment state, and architectural dependencies in a compact cognitive format."
  },
  {
    q: "How does Multi-Tenant Workspace isolation work?",
    a: "intenTidy partitions data on disk by workspace ID (/data/workspaces/<id>/cards.json). Teams or environments (e.g. 'engineering', 'security-ops', 'production') have their own isolated card sets, which you can switch between instantly in the navigation bar."
  },
  {
    q: "What are the RBAC roles and permissions?",
    a: "We enforce three distinct roles: 'Viewer' (read-only monitoring of cards and telemetry), 'Operator' (create, update cards, trigger deployments, and sync repositories), and 'Owner' (full administrative access including card deletion and workspace creation). Unauthorized operations present informative warning banners."
  },
  {
    q: "How does Real-Time Server-Sent Events (SSE) synchronization work?",
    a: "The Express BFF maintains a persistent event stream at /api/events. Whenever any user or webhook mutates card state, triggers a deployment, or ingests telemetry, an event is broadcasted and all open browser windows sync immediately without polling."
  },
  {
    q: "How are API keys and secrets protected?",
    a: "All Gemini AI calls, Git proxies, and token generation run strictly on the server-side Express Backend-for-Frontend (BFF). No secret keys are ever exposed to the client bundle or network payloads. In addition, incoming GitHub webhooks are cryptographically authenticated via HMAC-SHA256."
  },
  {
    q: "What happens if external AI services are unavailable or rate-limited?",
    a: "intenTidy includes local rule-based heuristic engines for architecture reviews, maintenance suggestions, project summaries, and speech parsing. If external APIs hit rate limits or downtime, the platform gracefully switches to heuristic fallbacks ensuring 100% continuous uptime."
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
                    intenTidy solves the <strong>cognitive overload</strong> of multi-device engineering. Instead of managing thousands of raw files, you manage high-level software entities (PortableCards) equipped with memory, telemetry, and intent.
                  </p>
                </section>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-neutral-900">
                      <Layers size={15} className="text-neutral-500" />
                      <span>Multi-Tenancy</span>
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Isolated workspaces partition projects and systems on disk with clean tenant boundaries.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-neutral-900">
                      <Shield size={15} className="text-neutral-500" />
                      <span>RBAC Security</span>
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Hierarchical access control (Viewer, Operator, Owner) protects mission-critical mutations.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-neutral-900">
                      <Radio size={15} className="text-neutral-500" />
                      <span>Real-Time SSE</span>
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Live event streams broadcast system changes, deployments, and alerts with zero polling delay.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'guide' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section className="space-y-6">
                  <h3 className="text-2xl font-light tracking-tight">Platform Operations Guide</h3>
                  <div className="space-y-4">
                    <GuideStep number="01" title="Select or Create Workspace" desc="Use the workspace dropdown in the header to switch between environments or create a dedicated tenant partition." />
                    <GuideStep number="02" title="Choose Your Role" desc="Switch between Viewer (read-only), Operator (create, edit, deploy), or Owner (administrative control) to test RBAC boundaries." />
                    <GuideStep number="03" title="Project New System Cards" desc="Click 'Project Card' to paste a GitHub repo URL or natural language architectural description." />
                    <GuideStep number="04" title="Map Cross-System Topology" desc="Toggle to 'Topology View' to inspect directional dependencies, API consumption links, and data pipelines." />
                    <GuideStep number="05" title="Agentic Voice-to-Intent" desc="Tap the microphone icon to speak commands like 'Add goal to deploy telemetry worker' or 'Trigger production deployment'." />
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
