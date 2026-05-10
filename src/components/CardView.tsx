/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  AlertCircle, 
  Box, 
  ChevronRight, 
  Clock, 
  Code2, 
  Cpu, 
  Database, 
  ExternalLink, 
  GitBranch, 
  Globe, 
  Layers, 
  MessageSquare, 
  PlayCircle, 
  RefreshCcw, 
  Shield, 
  Target, 
  Zap,
  GitCompare
} from "lucide-react";
import { PortableCard, Suggestion } from "../types";
import { useState } from "react";
import { DiffViewer } from "./DiffViewer";

interface CardViewProps {
  card: PortableCard;
  isExpanded: boolean;
  onToggle: () => void;
  key?: string | number;
}

export function CardView({ card, isExpanded, onToggle }: CardViewProps) {
  const [showDiffs, setShowDiffs] = useState(false);

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`relative overflow-hidden cursor-pointer group rounded-2xl border ${
        isExpanded 
          ? "col-span-full bg-neutral-900 border-neutral-800" 
          : "bg-white border-neutral-200 hover:border-neutral-400 p-6 md:p-8"
      }`}
      onClick={!isExpanded ? onToggle : undefined}
    >
      {/* Mini View */}
      {!isExpanded && (
        <div className="flex flex-col h-full space-y-4">
          <div className="flex justify-between items-start">
            <div className={`p-2 rounded-lg ${
              card.status === 'experimental' ? 'bg-amber-50 text-amber-600' : 'bg-neutral-100 text-neutral-600'
            }`}>
              <Box size={24} />
            </div>
            <StatusDot status={card.runtime.buildStatus} />
          </div>
          
          <div>
            <h3 className="text-xl font-medium tracking-tight text-neutral-900">{card.name}</h3>
            <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
              {card.summary.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-auto">
            {card.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-neutral-50 border border-neutral-100 text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 md:p-12 space-y-12"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-neutral-800 pb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggle(); }}
                    className="p-2 -ml-2 rounded-full hover:bg-neutral-800 text-neutral-400 transition-colors"
                  >
                    <ChevronRight className="rotate-180" />
                  </button>
                  <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">{card.name}</h2>
                </div>
                <p className="text-xl text-neutral-400 font-light max-w-2xl italic tracking-tight">
                  “{card.summary.description}”
                </p>
                <div className="flex gap-4">
                  {card.repoUrl && (
                    <a href={card.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white">
                      <GitBranch size={16} /> Repository
                    </a>
                  )}
                  {card.deployUrl && (
                    <a href={card.deployUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white">
                      <Globe size={16} /> Live App
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 text-right">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Runtime Status</span>
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-mono border ${
                    card.runtime.buildStatus === 'success' ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400' : 'bg-rose-950/30 border-rose-800 text-rose-400'
                  }`}>
                    BUILD: {card.runtime.buildStatus.toUpperCase()}
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-mono border border-neutral-700 bg-neutral-800 text-neutral-400">
                    DEPLOY: {card.runtime.deploymentState.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Left: Intelligence & Intent */}
              <div className="lg:col-span-2 space-y-12">
                
                {/* Suggestions Section */}
                {card.suggestions && card.suggestions.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-emerald-500">
                      <Zap size={20} />
                      <h4 className="text-xs font-bold uppercase tracking-widest">Autonomous Insights</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {card.suggestions.map((s) => (
                        <div key={s.id} className="p-6 rounded-xl bg-emerald-950/10 border border-emerald-900/40 space-y-4">
                          <div className="flex items-start justify-between">
                             <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{s.type}</span>
                                <p className="text-white mt-1 font-medium leading-snug">{s.message}</p>
                             </div>
                             <AlertCircle size={18} className="text-emerald-600 shrink-0" />
                          </div>
                          <div className="space-y-2">
                            {s.actions.map((action, i) => (
                              <button key={i} className="flex items-center gap-2 text-xs text-emerald-400/80 hover:text-emerald-400 transition-colors w-full text-left group/action">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 group-hover/action:bg-emerald-400 transition-colors" /> {action}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Intent Section */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Target size={20} />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Intent Layer</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <h5 className="text-sm font-medium text-white/80">Active Goals</h5>
                       <ul className="space-y-3">
                         {card.intent.goals.map((goal, i) => (
                           <li key={i} className="flex gap-3 text-sm text-neutral-400 leading-relaxed capitalize">
                             <span className="text-neutral-600">—</span> {goal}
                           </li>
                         ))}
                       </ul>
                    </div>
                    <div className="space-y-4">
                       <h5 className="text-sm font-medium text-white/80">Blockers</h5>
                       {card.intent.blockers.length > 0 ? (
                         <ul className="space-y-3">
                           {card.intent.blockers.map((blocker, i) => (
                             <li key={i} className="flex gap-3 text-sm text-rose-400/80 leading-relaxed font-mono">
                               <AlertCircle size={14} className="shrink-0 mt-0.5" /> {blocker}
                             </li>
                           ))}
                         </ul>
                       ) : (
                         <div className="text-xs text-neutral-600 italic">No clear blockers detected.</div>
                       )}
                    </div>
                  </div>
                </section>

                {/* Tasks Section */}
                <section className="space-y-6">
                   <div className="flex items-center gap-2 text-neutral-500">
                    <Layers size={20} />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Ongoing Tasks</h4>
                  </div>
                  <div className="divide-y divide-neutral-800 border-y border-neutral-800">
                    {card.intent.tasks.map((task) => (
                      <div key={task.id} className="py-4 flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            task.status === 'done' ? 'bg-emerald-500' : 
                            task.status === 'in-progress' ? 'animate-pulse bg-blue-500' : 'bg-neutral-700'
                          }`} />
                          <span className={`text-sm ${task.status === 'done' ? 'text-neutral-500 line-through' : 'text-neutral-300'}`}>
                            {task.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">{task.status}</span>
                      </div>
                    ))}
                  </div>
                </section>

              </div>

              {/* Right: Technical Details & Telemetry */}
              <div className="space-y-12">
                
                {/* Architecture & Stack */}
                <section className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-8">
                   <div className="space-y-3">
                    <div className="flex items-center gap-2 text-neutral-500">
                      <Cpu size={18} />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest">Architecture</h4>
                    </div>
                    <p className="text-sm text-neutral-300 leading-relaxed">{card.summary.architecture}</p>
                   </div>

                   <div className="space-y-3">
                    <div className="flex items-center gap-2 text-neutral-500">
                      <Code2 size={18} />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest">Tech Stack</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {card.summary.techStack.map(s => (
                         <span key={s} className="px-2 py-1 rounded bg-neutral-800 text-neutral-400 text-[10px] font-mono">{s}</span>
                       ))}
                    </div>
                   </div>
                </section>

                {/* Telemetry */}
                {card.runtime.telemetry && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-neutral-500">
                      <Activity size={18} />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Real-time Telemetry</h4>
                    </div>
                    <div className="space-y-6">
                      <Metric label="Core Latency" value={`${card.runtime.telemetry.latency}ms`} percentage={card.runtime.telemetry.latency ? Math.min(100, (card.runtime.telemetry.latency / 1000) * 100) : 0} />
                      <Metric label="Error Threshold" value={`${card.runtime.telemetry.errors} events`} percentage={Math.min(100, (card.runtime.telemetry.errors || 0) * 10)} color="rose" />
                      <Metric label="Test Capacity" value={`${card.runtime.telemetry.coverage}%`} percentage={card.runtime.telemetry.coverage || 0} color="emerald" />
                    </div>
                  </section>
                )}

                {/* Latest Commit */}
                <section className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-neutral-500">
                      <Clock size={16} />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest">Latest Orchestration</h4>
                    </div>
                    {card.runtime.diffs && (
                      <button 
                        onClick={() => setShowDiffs(!showDiffs)}
                        className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-colors ${
                          showDiffs ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                      >
                        <GitCompare size={14} />
                        {showDiffs ? 'Hide Diffs' : 'Review Diffs'}
                      </button>
                    )}
                  </div>
                  <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-3">
                    <div className="flex justify-between items-start">
                       <span className="text-[10px] font-mono text-neutral-600">#{card.runtime.lastCommit.hash}</span>
                       <span className="text-[10px] text-neutral-500">{card.runtime.lastCommit.author}</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-normal line-clamp-2">
                      {card.runtime.lastCommit.message}
                    </p>
                  </div>
                  
                  {showDiffs && card.runtime.diffs && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-4"
                    >
                      <DiffViewer diffs={card.runtime.diffs} />
                    </motion.div>
                  )}
                </section>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatusDot({ status }: { status: 'success' | 'failure' | 'pending' }) {
  const colors = {
    success: 'bg-emerald-500 ring-emerald-100',
    failure: 'bg-rose-500 ring-rose-100',
    pending: 'bg-blue-500 ring-blue-100'
  };
  return (
    <div className={`w-2.5 h-2.5 rounded-full ring-4 ${colors[status]}`} />
  );
}

function Metric({ label, value, percentage, color = "blue" }: { label: string, value: string, percentage: number, color?: "blue" | "emerald" | "rose" }) {
  const colors = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500"
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] font-mono tracking-tighter">
        <span className="text-neutral-500 uppercase">{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${colors[color]}`}
        />
      </div>
    </div>
  );
}
