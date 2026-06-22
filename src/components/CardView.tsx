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
  Download,
  Cloud,
  CloudOff,
  Save,
  X,
  Edit2,
  Trash2,
  GitCompare,
  Monitor,
  CheckCircle2,
  XCircle,
  History,
  Terminal,
  MousePointer2,
  Sparkles,
  Loader2,
  Mic,
  MicOff,
  RefreshCw,
  Terminal as TerminalIcon,
  Search,
  FileSearch,
  AlertTriangle
} from "lucide-react";
import { PortableCard, Suggestion } from "../types";
import React, { useState, useEffect } from "react";
import { DiffViewer } from "./DiffViewer";
import { generateArchitectureOverview } from "../services/gemini";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface CardViewProps {
  card: PortableCard;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateCard?: (updatedCard: PortableCard) => void;
  onDeleteCard?: (id: string) => void;
  key?: string | number;
}

export function CardView({ card, isExpanded, onToggle, onUpdateCard, onDeleteCard }: CardViewProps) {
  const [showDiffs, setShowDiffs] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSyncingRepo, setIsSyncingRepo] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isScaffolding, setIsScaffolding] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(card);
  
  // Tabs & Webhooks
  const [activeTab, setActiveTab] = useState<'overview' | 'logs'>('overview');
  const [webhookActive, setWebhookActive] = useState(false);
  
  // Edit Mode

  const startSpeechToTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (onUpdateCard) {
        const newTask = { id: Math.random().toString(36).substr(2, 9), title: transcript, status: 'todo' as const };
        onUpdateCard({
          ...card,
          intent: {
            ...card.intent,
            tasks: [...card.intent.tasks, newTask]
          }
        });
      }
    };
    recognition.start();
  };

  const handleSyncRepo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSyncingRepo(true);
    setTimeout(() => {
      if (onUpdateCard) {
         onUpdateCard({
           ...card,
           lastSync: new Date().toISOString(),
           runtime: {
             ...card.runtime,
             buildStatus: 'success',
             lastCommit: {
               hash: Math.random().toString(16).substr(2, 7),
               message: "chore: repository sync from intenTidy",
               author: card.owner || 'benneberg'
             }
           }
         });
      }
      setIsSyncingRepo(false);
    }, 2000);
  };

  // Simulate GitHub Webhook Listener
  useEffect(() => {
    if (isExpanded) {
      const interval = setInterval(() => {
        // 5% chance of a "real-time push" from GitHub
        if (Math.random() > 0.95) {
          setWebhookActive(true);
          setTimeout(() => {
            if (onUpdateCard) {
              onUpdateCard({
                ...card,
                lastSync: new Date().toISOString(),
                runtime: {
                  ...card.runtime,
                  lastCommit: {
                    hash: Math.random().toString(16).substr(2, 7),
                    message: "automated: real-time push from github-webhook",
                    author: "git-bot"
                  }
                }
              });
            }
            setTimeout(() => setWebhookActive(false), 3000);
          }, 1000);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isExpanded, card, onUpdateCard]);

  const handleReanalyze = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateCard) return;
    setIsAnalyzing(true);
    try {
      const overview = await generateArchitectureOverview(card);
      onUpdateCard({
        ...card,
        summary: {
          ...card.summary,
          ...overview
        }
      });
    } catch (err) {
      console.error("Reanalysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExporting(true);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(card, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `${card.name.toLowerCase().replace(/\s+/g, '-')}-card.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setTimeout(() => setIsExporting(false), 1000);
  };

  // Simulate cloud sync when card changes
  useEffect(() => {
    if (isExpanded) {
      setSyncStatus('syncing');
      const timer = setTimeout(() => {
        setSyncStatus('synced');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [card, isExpanded]);

  const handleUpdateTask = (taskId: string, status: 'todo' | 'in-progress' | 'done') => {
    if (!onUpdateCard) return;
    const updatedTasks = card.intent.tasks.map(t => t.id === taskId ? { ...t, status } : t);
    onUpdateCard({
      ...card,
      intent: {
        ...card.intent,
        tasks: updatedTasks
      }
    });
  };

  const handleSaveSession = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSyncStatus('syncing');
    setTimeout(() => setSyncStatus('synced'), 800);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditForm(card);
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateCard) onUpdateCard(editForm);
    setIsEditing(false);
  };

  const handleQuickAction = async (action: string) => {
    setIsQuickActionsOpen(false);
    
    switch (action) {
      case 'diffs':
        setActiveTab('logs');
        break;
      case 'ai':
        if (!onUpdateCard) return;
        setIsAnalyzing(true);
        try {
          const result = await generateArchitectureOverview(card);
          if (result) {
            onUpdateCard({
              ...card,
              summary: {
                ...card.summary,
                ...result
              }
            });
          }
        } finally {
          setIsAnalyzing(false);
        }
        break;
      case 'scaffold':
        setIsScaffolding(true);
        setTimeout(() => setIsScaffolding(false), 2000);
        break;
      case 'task':
        if (onUpdateCard) {
          const newTask = { id: Math.random().toString(36).substr(2, 9), title: 'New System Task', status: 'todo' as const };
          onUpdateCard({
            ...card,
            intent: {
              ...card.intent,
              tasks: [...card.intent.tasks, newTask]
            }
          });
        }
        break;
      case 'deploy':
        if (onUpdateCard) {
          onUpdateCard({ ...card, runtime: { ...card.runtime, buildStatus: 'pending' } });
          setTimeout(() => {
            onUpdateCard({ ...card, runtime: { ...card.runtime, buildStatus: 'success' } });
          }, 3000);
        }
        break;
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteCard && window.confirm("Are you sure you want to delete this card?")) {
      onDeleteCard(card.id);
    }
  };

  const statusColors = {
    active: 'bg-emerald-500',
    experimental: 'bg-amber-500',
    archived: 'bg-neutral-400'
  };

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`relative overflow-hidden cursor-pointer group rounded-[2rem] border ${
        isExpanded 
          ? "col-span-full bg-neutral-900 border-neutral-800" 
          : "bg-white border-neutral-200 hover:border-neutral-900/10 p-8 md:p-10 shadow-sm hover:shadow-xl hover:shadow-neutral-100 transition-all"
      }`}
      onClick={!isExpanded ? onToggle : undefined}
    >
      {/* Mini View */}
      {!isExpanded && (
        <div className="flex flex-col h-full space-y-6">
          <div className="flex justify-between items-start">
            <div className={`p-3 rounded-2xl ${
              card.status === 'experimental' ? 'bg-amber-50 text-amber-600' : 'bg-neutral-900 text-white shadow-lg shadow-neutral-200'
            }`}>
              <Box size={20} />
            </div>
            <div className="flex gap-2">
               <button 
                onClick={handleEdit}
                className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
               >
                 <Edit2 size={16} />
               </button>
               <StatusDot status={card.runtime.buildStatus} />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <span className={`w-1.5 h-1.5 rounded-full ${statusColors[card.status]}`} />
               <h3 className="text-xl font-bold tracking-tight text-neutral-900 leading-tight">{card.name}</h3>
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2 font-light">
              {card.summary.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-neutral-100/50">
            {card.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-lg bg-neutral-50 border border-neutral-100 text-[9px] uppercase tracking-[0.1em] font-black text-neutral-400">
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
            className="p-6 md:p-16 space-y-16"
          >
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start gap-12 border-b border-neutral-800 pb-12">
               {/* Webhook Notification */}
               <AnimatePresence>
                {webhookActive && (
                  <motion.div 
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="fixed top-8 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-full shadow-2xl text-xs font-bold uppercase tracking-widest"
                  >
                    <RefreshCw size={14} className="animate-spin" />
                    Incoming GitHub Webhook: PUSH sync active
                  </motion.div>
                )}
               </AnimatePresence>
              <div className="space-y-6 flex-1">
                <div className="flex items-center justify-between group/header">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggle(); }}
                      className="p-3 -ml-3 rounded-2xl hover:bg-neutral-800 text-neutral-400 transition-colors"
                    >
                      <ChevronRight className="rotate-180" size={24} />
                    </button>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="bg-neutral-800 text-white text-4xl md:text-5xl font-light tracking-tight px-4 py-2 rounded-2xl w-full border border-neutral-700 focus:outline-none"
                        value={editForm.name}
                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                      />
                    ) : (
                      <h2 className="text-4xl md:text-6xl font-light text-white tracking-tighter">{card.name}</h2>
                    )}
                  </div>

                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); setIsQuickActionsOpen(!isQuickActionsOpen); }}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all border ${
                        isQuickActionsOpen 
                        ? "bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.3)]" 
                        : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white"
                      }`}
                    >
                      <Zap size={14} className={isQuickActionsOpen ? "fill-current" : ""} />
                      Quick Actions
                    </motion.button>

                    <AnimatePresence>
                      {isQuickActionsOpen && (
                        <>
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
                            onClick={() => setIsQuickActionsOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute right-0 mt-4 w-72 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl z-[201] overflow-hidden p-2"
                          >
                            <div className="p-4 border-b border-neutral-800/50 mb-2">
                               <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">System Intent Menu</p>
                            </div>
                            
                            {[
                              { id: 'diffs', label: 'Review Diffs', icon: GitCompare, color: 'text-blue-400' },
                              { id: 'ai', label: 'Analyze Architecture', icon: Sparkles, color: 'text-purple-400', loading: isAnalyzing },
                              { id: 'scaffold', label: 'Generate Scaffold', icon: Layers, color: 'text-emerald-400', loading: isScaffolding },
                              { id: 'task', label: 'Create Intent Task', icon: Target, color: 'text-rose-400' },
                              { id: 'deploy', label: 'Trigger Deployment', icon: PlayCircle, color: 'text-amber-400' },
                              { id: 'subsystem', label: 'Open Subsystem', icon: Cpu, color: 'text-neutral-400' },
                            ].map((action) => (
                              <button
                                key={action.id}
                                onClick={() => handleQuickAction(action.id)}
                                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-neutral-800 transition-colors text-left group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-xl bg-neutral-950 border border-neutral-800 ${action.color} group-hover:scale-110 transition-transform`}>
                                    {action.loading ? <Loader2 size={16} className="animate-spin" /> : <action.icon size={16} />}
                                  </div>
                                  <span className="text-sm font-medium text-neutral-300">{action.label}</span>
                                </div>
                                <ChevronRight size={14} className="text-neutral-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                {isEditing ? (
                  <textarea 
                    className="bg-neutral-800 text-neutral-400 text-lg font-light w-full p-4 rounded-2xl border border-neutral-700 focus:outline-none h-32"
                    value={editForm.summary.description}
                    onChange={e => setEditForm({...editForm, summary: {...editForm.summary, description: e.target.value}})}
                  />
                ) : (
                  <p className="text-xl md:text-2xl text-neutral-400 font-light max-w-3xl leading-relaxed italic tracking-tight">
                    “{card.summary.description}”
                  </p>
                )}

                <div className="flex flex-wrap gap-6 pt-4">
                  {(isEditing ? editForm.repoUrl : card.repoUrl) && (
                    <div className="flex items-center gap-3">
                      <GitBranch size={16} className="text-neutral-600" />
                      {isEditing ? (
                        <input 
                          type="text"
                          className="bg-neutral-800 text-xs text-neutral-400 p-2 rounded-lg border border-neutral-700"
                          value={editForm.repoUrl}
                          onChange={e => setEditForm({...editForm, repoUrl: e.target.value})}
                        />
                      ) : (
                        <a href={card.repoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-500 hover:text-white transition-colors border-b border-neutral-800 hover:border-white">
                          View Repository
                        </a>
                      )}
                    </div>
                  )}
                  {(isEditing ? editForm.deployUrl : card.deployUrl) && (
                    <div className="flex items-center gap-3">
                      <Globe size={16} className="text-neutral-600" />
                      {isEditing ? (
                        <input 
                          type="text"
                          className="bg-neutral-800 text-xs text-neutral-400 p-2 rounded-lg border border-neutral-700"
                          value={editForm.deployUrl}
                          onChange={e => setEditForm({...editForm, deployUrl: e.target.value})}
                        />
                      ) : (
                        <a href={card.deployUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-500 hover:text-white transition-colors border-b border-neutral-800 hover:border-white">
                          Live Deployment
                        </a>
                      )}
                    </div>
                  )}
                  
                  {!isEditing && (
                    <div className="flex gap-3">
                      <button 
                        onClick={handleSyncRepo}
                        disabled={isSyncingRepo}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/20 text-blue-400 border border-blue-900/30 text-xs font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50"
                      >
                        <RefreshCw size={14} className={isSyncingRepo ? 'animate-spin' : ''} />
                        {isSyncingRepo ? "Syncing..." : "Sync Repo"}
                      </button>
                      <button 
                        onClick={handleReanalyze}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/20 text-emerald-500 border border-emerald-900/30 text-xs font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                      >
                        {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {isAnalyzing ? "Analyzing..." : "Deep Review"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-6 text-right w-full lg:w-auto">
                <div className="flex items-center gap-4">
                  {isEditing ? (
                    <div className="flex gap-2">
                       <button onClick={handleDelete} className="p-3 bg-rose-950/30 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                         <Trash2 size={20} />
                       </button>
                       <button onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-2xl border border-neutral-700 text-neutral-400 font-bold uppercase text-xs tracking-widest">
                         Cancel
                       </button>
                       <button onClick={handleSaveEdit} className="px-6 py-2 bg-white text-black rounded-2xl font-bold uppercase text-xs tracking-widest">
                         Save Changes
                       </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={handleEdit}
                        className="p-3 rounded-2xl bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                        title="Edit Card"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button 
                        onClick={handleExport}
                        className="p-3 rounded-2xl bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                        title="Export Card JSON"
                      >
                        {isExporting ? <Loader2 size={20} className="animate-spin text-emerald-500" /> : <Download size={20} />}
                      </button>
                    </>
                  )}
                </div>
                
                <div className="space-y-4">
                   <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-600 font-black">Runtime Intelligence</span>
                   <div className="flex items-center justify-end gap-3">
                      <div className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-tight border ${
                        card.runtime.buildStatus === 'success' ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400' : 'bg-rose-950/30 border-rose-800/50 text-rose-400'
                      }`}>
                        {card.runtime.buildStatus.toUpperCase()}
                      </div>
                      <div className="px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-tight border border-neutral-800 bg-neutral-900 text-neutral-500">
                        {card.runtime.deploymentState.toUpperCase()}
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Tab Switching */}
            <div className="flex gap-8 border-b border-neutral-800/50 mb-12">
               <button 
                onClick={() => setActiveTab('overview')}
                className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${
                  activeTab === 'overview' ? 'text-white' : 'text-neutral-600 hover:text-neutral-400'
                }`}
               >
                 Architecture Overview
                 {activeTab === 'overview' && (
                   <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
                 )}
               </button>
               <button 
                onClick={() => setActiveTab('logs')}
                className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-2 relative ${
                  activeTab === 'logs' ? 'text-white' : 'text-neutral-600 hover:text-neutral-400'
                }`}
               >
                 System Logs
                 {card.runtime.errorLogs && card.runtime.errorLogs.length > 0 && (
                   <span className="px-1.5 py-0.5 bg-rose-500 text-white rounded text-[8px] font-black">
                     {card.runtime.errorLogs.length}
                   </span>
                 )}
                 {activeTab === 'logs' && (
                   <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
                 )}
               </button>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-12">
                {/* Continuity Layer */}
                {card.continuity && (
              <motion.section 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                    <History size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white tracking-tight">Resumable Context Detected</h4>
                    <p className="text-xs text-neutral-500 font-mono">
                      Last edited <span className="text-neutral-300">{card.continuity.lastActiveFile}</span> at line {card.continuity.cursorPosition?.line}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2 mr-4 border-r border-neutral-800 pr-4">
                      {syncStatus === 'synced' ? (
                        <div className="flex items-center gap-2 text-emerald-500">
                          <Cloud size={16} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Synced</span>
                        </div>
                      ) : syncStatus === 'syncing' ? (
                        <div className="flex items-center gap-2 text-blue-400">
                          <Loader2 size={16} className="animate-spin" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Syncing</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-neutral-500">
                          <CloudOff size={16} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Offline</span>
                        </div>
                      )}
                   </div>
                   <div className="flex -space-x-2">
                      {card.continuity.tabs.slice(0, 3).map((tab, i) => (
                        <div key={i} className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] text-neutral-500 font-mono overflow-hidden" title={tab}>
                          {tab.split('.').pop()?.toUpperCase()}
                        </div>
                      ))}
                      {card.continuity.tabs.length > 3 && (
                        <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[10px] text-neutral-600">
                          +{card.continuity.tabs.length - 3}
                        </div>
                      )}
                   </div>
                   <button 
                    onClick={handleSaveSession}
                    className="flex items-center gap-2 px-4 py-2 border border-neutral-700 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors"
                   >
                      <Save size={14} /> Catch Snapshot
                   </button>
                   <button className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl text-xs font-bold hover:scale-105 transition-transform">
                      <Terminal size={14} /> Resume Debug Session
                   </button>
                </div>
              </motion.section>
            )}

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
                   <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-neutral-500">
                      <Layers size={20} />
                      <h4 className="text-xs font-bold uppercase tracking-widest">Ongoing Tasks</h4>
                    </div>
                    <button 
                      onClick={startSpeechToTask}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                        isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                      <span className="text-[10px] font-bold uppercase tracking-widest">Voice to Task</span>
                    </button>
                  </div>
                  <div className="divide-y divide-neutral-800 border-y border-neutral-800">
                    {card.intent.tasks.map((task) => (
                      <div 
                        key={task.id} 
                        className="py-4 flex justify-between items-center gap-4 group/task cursor-pointer hover:bg-neutral-800/10 px-2 -mx-2 rounded-lg transition-colors"
                        onClick={() => handleUpdateTask(task.id, task.status === 'done' ? 'todo' : 'done')}
                      >
                        <div className="flex items-center gap-3">
                          <button 
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                              task.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-neutral-700 group-hover/task:border-neutral-500'
                            }`}
                          >
                            {task.status === 'done' && <CheckCircle2 size={12} className="text-black" />}
                          </button>
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-neutral-500">
                        <Cpu size={18} />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest">Architecture</h4>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-500">IDENTIFIED</span>
                    </div>
                    <p className="text-sm text-neutral-300 leading-relaxed font-light">{card.summary.architecture}</p>
                   </div>

                   {card.summary.subsystems && (
                    <div className="space-y-4">
                       <h5 className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Monitored Subsystems</h5>
                       <div className="space-y-3">
                         {card.summary.subsystems.map((sub, i) => (
                           <div key={i} className="flex justify-between items-center bg-neutral-950/50 p-3 rounded-lg border border-neutral-800/50">
                              <div className="space-y-0.5">
                                 <p className="text-xs font-semibold text-white">{sub.name}</p>
                                 <p className="text-[10px] text-neutral-500">{sub.purpose}</p>
                              </div>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                sub.status === 'healthy' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                                sub.status === 'degraded' ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
                              }`} />
                           </div>
                         ))}
                       </div>
                    </div>
                   )}

                   <div className="space-y-3 pt-4 border-t border-neutral-800">
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
                <div className="space-y-8">
                  {card.runtime.testResults && (
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-neutral-500">
                        <Shield size={18} />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Test Monitoring</h4>
                      </div>
                      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
                        <div className="flex justify-between items-end">
                           <div className="space-y-1">
                              <span className="text-2xl font-light text-white">{card.runtime.testResults.passed}/{card.runtime.testResults.total}</span>
                              <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Specs Passing</p>
                           </div>
                           <div className="text-right">
                              <span className={`text-xs font-mono ${card.runtime.testResults.failed > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {card.runtime.testResults.failed > 0 ? `${card.runtime.testResults.failed} FAILURES` : 'ALL CLEAR'}
                              </span>
                           </div>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500" style={{ width: `${(card.runtime.testResults.passed / card.runtime.testResults.total) * 100}%` }} />
                        </div>
                      </div>
                    </section>
                  )}

                  {card.runtime.telemetry && (
                    <section className="space-y-6">
                      <div className="flex items-center gap-2 text-neutral-500">
                        <Activity size={18} />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Real-time Telemetry</h4>
                      </div>
                      <div className="space-y-6">
                        <Metric label="Core Latency" value={`${card.runtime.telemetry.latency}ms`} percentage={card.runtime.telemetry.latency ? Math.min(100, (card.runtime.telemetry.latency / 1000) * 100) : 0} />
                        
                        {card.runtime.telemetry.latencyHistory && (
                          <div className="h-40 w-full bg-neutral-950/40 rounded-xl border border-neutral-800/50 p-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={card.runtime.telemetry.latencyHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis 
                                  dataKey="time" 
                                  stroke="#555" 
                                  fontSize={8} 
                                  tickLine={false} 
                                  axisLine={false}
                                />
                                <YAxis 
                                  stroke="#555" 
                                  fontSize={8} 
                                  tickLine={false} 
                                  axisLine={false}
                                  hide
                                />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px', borderRadius: '12px', padding: '12px' }}
                                  itemStyle={{ color: '#fff' }}
                                  labelStyle={{ color: '#555', marginBottom: '8px', fontWeight: 'bold' }}
                                  labelFormatter={(label) => `Snapshot Time: ${label}`}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="value" 
                                  stroke="#3b82f6" 
                                  strokeWidth={3} 
                                  dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} 
                                  activeDot={{ r: 6, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }}
                                  animationDuration={2000}
                                  animationBegin={500}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        <Metric label="Error Threshold" value={`${card.runtime.telemetry.errors} events`} percentage={Math.min(100, (card.runtime.telemetry.errors || 0) * 10)} color="rose" />
                        <Metric label="Test Capacity" value={`${card.runtime.telemetry.coverage}%`} percentage={card.runtime.telemetry.coverage || 0} color="emerald" />
                      </div>
                    </section>
                  )}
                </div>

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
          </div>
          )}

          {activeTab === 'logs' && (
            <div className="animate-in fade-in duration-500">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSearch size={24} className="text-neutral-500" />
                    <h3 className="text-2xl font-light text-white tracking-tight">System Error Logs</h3>
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                    Last 10 Events
                  </div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-800/50">
                  {card.runtime.errorLogs && card.runtime.errorLogs.length > 0 ? (
                    card.runtime.errorLogs.map((log, i) => (
                      <div key={i} className="p-6 flex items-start gap-6 hover:bg-neutral-900/50 transition-colors group">
                        <div className={`mt-1 p-2 rounded-lg ${
                          log.level === 'error' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          <AlertTriangle size={16} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{log.service}</span>
                            <span className="text-[10px] font-mono text-neutral-600">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-neutral-300 font-mono tracking-tight leading-relaxed">
                            {log.message}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 text-center space-y-4">
                      <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center mx-auto text-neutral-600">
                        <CheckCircle2 size={24} />
                      </div>
                      <p className="text-neutral-500 text-sm italic">No errors detected in current orchestration cycle.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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
