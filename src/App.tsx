/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PortableCard, VoiceIntentResult } from './types';
import { SAMPLE_CARDS } from './constants';
import { CardView } from './components/CardView';
import { summarizeProject, generateSuggestions } from './services/gemini';
import { InfoModal } from './components/InfoModal';
import { FilterModal } from './components/FilterModal';
import { MultiView } from './components/MultiView';
import { VoiceIntentModal } from './components/VoiceIntentModal';
import { 
  Plus, 
  Search, 
  Cpu, 
  LayoutGrid, 
  Terminal, 
  Fingerprint, 
  Command, 
  Ghost,
  Loader2,
  Sparkles,
  Filter,
  X,
  Mic,
  Network
} from 'lucide-react';

export default function App() {
  const [cards, setCards] = useState<PortableCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardInput, setNewCardInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'topology'>('grid');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  
  // Modals state
  const [activeInfoTab, setActiveInfoTab] = useState<'about' | 'guide' | 'faq' | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<'sync' | 'name' | 'status'>('sync');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  // Load cards from server on mount
  useEffect(() => {
    async function fetchCards() {
      try {
        const response = await fetch('/api/cards');
        if (response.ok) {
          const data = await response.json();
          setCards(data);
        } else {
          setSyncStatus('error');
        }
      } catch (err) {
        console.error("Error fetching cards from backend:", err);
        setSyncStatus('error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCards();
  }, []);

  // Near real-time telemetry jitter simulation (throttled to UI-only, no database write storms)
  useEffect(() => {
    const interval = setInterval(() => {
      setCards(prev => prev.map(card => {
        if (!card.runtime.telemetry) return card;
        return {
          ...card,
          runtime: {
            ...card.runtime,
            telemetry: {
              ...card.runtime.telemetry,
              latency: Math.max(20, card.runtime.telemetry.latency! + (Math.random() * 10 - 5)),
              errors: Math.random() > 0.98 ? card.runtime.telemetry.errors! + 1 : card.runtime.telemetry.errors
            }
          }
        };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateCard = async (updatedCard: PortableCard) => {
    setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    setSyncStatus('syncing');
    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCard)
      });
      if (response.ok) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    } catch (err) {
      console.error("Error updating card on server:", err);
      setSyncStatus('error');
    }
  };

  const handleDeleteCard = async (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    setSyncStatus('syncing');
    try {
      const response = await fetch(`/api/cards/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    } catch (err) {
      console.error("Error deleting card on server:", err);
      setSyncStatus('error');
    }
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const availableTags = Array.from(new Set(cards.flatMap(c => c.tags))) as string[];

  const filteredCards = cards.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.every(t => c.tags.includes(t));
    return matchesSearch && matchesTags;
  });

  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortOption === 'sync') {
      return new Date(b.lastSync).getTime() - new Date(a.lastSync).getTime();
    }
    if (sortOption === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortOption === 'status') {
      const order = { success: 0, pending: 1, failure: 2 };
      return order[a.runtime.buildStatus] - order[b.runtime.buildStatus];
    }
    return 0;
  });

  const handleAddCard = async () => {
    if (!newCardInput.trim()) return;
    setIsGenerating(true);
    
    try {
      // Simulate/Generate card data via Gemini
      const summary = await summarizeProject(newCardInput);
      
      const newCard: PortableCard = {
        id: `pc-${Math.random().toString(36).substr(2, 5)}`,
        name: newCardInput.length > 20 ? newCardInput.substring(0, 20) + '...' : newCardInput,
        owner: 'anonymous',
        tags: ['new', 'discovery'],
        status: 'experimental',
        lastSync: new Date().toISOString(),
        summary: {
          description: summary,
          architecture: "Legacy/Unknown architecture detected.",
          capabilities: ["New capability analysis pending"],
          techStack: ["Analyzing..."],
        },
        runtime: {
          buildStatus: 'pending',
          deploymentState: 'offline',
          lastCommit: {
            hash: '0000000',
            message: 'Initial project discovery',
            author: 'intentidy-agent',
          }
        },
        intent: {
          goals: ["Establish baseline configuration"],
          tasks: [{ id: 't-new', title: 'Initialize semantic card', status: 'todo' }],
          blockers: [],
        }
      };

      // Generate initial suggestions
      const suggestions = await generateSuggestions(newCard);
      newCard.suggestions = suggestions;

      setCards([...cards, newCard]);
      setNewCardInput('');
      setIsAddingCard(false);
      setSyncStatus('syncing');
      await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard)
      });
      setSyncStatus('synced');
    } catch (error) {
      console.error("Failed to add card:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyVoiceIntent = async (result: VoiceIntentResult) => {
    // If targetCardId or targetCardName is specified, find the matching card
    let targetCard = cards.find(c => 
      (result.targetCardId && c.id === result.targetCardId) ||
      (result.targetCardName && c.name.toLowerCase().includes(result.targetCardName.toLowerCase()))
    );

    if (result.actionType === 'create_card') {
      const cardTitle = result.payload.title || result.payload.description || "Voice Projected Entity";
      setNewCardInput(cardTitle);
      setIsAddingCard(true);
      return;
    }

    if (!targetCard && cards.length > 0) {
      targetCard = cards[0]; // default to first card if none explicitly matched
    }

    if (!targetCard) return;

    let mutatedCard = { ...targetCard };

    if (result.actionType === 'add_task') {
      const newTask = {
        id: `t-${Math.random().toString(36).substring(2, 7)}`,
        title: result.payload.title || result.payload.description || 'Voice dictated task',
        status: result.payload.status || 'todo'
      };
      mutatedCard = {
        ...mutatedCard,
        intent: {
          ...mutatedCard.intent,
          tasks: [...mutatedCard.intent.tasks, newTask]
        }
      };
    } else if (result.actionType === 'add_goal') {
      const newGoal = result.payload.goal || result.payload.title || result.payload.description || 'System milestone';
      mutatedCard = {
        ...mutatedCard,
        intent: {
          ...mutatedCard.intent,
          goals: [...mutatedCard.intent.goals, newGoal]
        }
      };
    } else if (result.actionType === 'set_blocker') {
      const newBlocker = result.payload.blocker || result.payload.description || 'Reported blocker';
      mutatedCard = {
        ...mutatedCard,
        intent: {
          ...mutatedCard.intent,
          blockers: [...mutatedCard.intent.blockers, newBlocker]
        }
      };
    } else if (result.actionType === 'trigger_deploy') {
      mutatedCard = {
        ...mutatedCard,
        runtime: {
          ...mutatedCard.runtime,
          buildStatus: 'success',
          deploymentState: 'production'
        },
        lastSync: new Date().toISOString()
      };
      // Trigger backend deployment endpoint
      fetch('/api/deployments/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: mutatedCard.id, environment: 'production' })
      }).catch(console.error);
    }

    handleUpdateCard(mutatedCard);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFB] text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-[0.03]">
        <Fingerprint size={1200} strokeWidth={0.5} />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FDFDFB]/80 backdrop-blur-xl border-b border-neutral-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-neutral-900 p-1.5 rounded-lg">
              <Command size={20} className="text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight lowercase">intenTidy <span className="text-neutral-400 font-normal italic ml-1">by Decker</span></h1>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
             {/* View Mode Switcher */}
             <div className="flex items-center bg-neutral-100/80 p-1 rounded-2xl border border-neutral-200/50 text-xs font-semibold">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <LayoutGrid size={14} />
                  <span className="hidden sm:inline">Cards</span>
                </button>
                <button
                  onClick={() => setViewMode('topology')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    viewMode === 'topology'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Network size={14} />
                  <span className="hidden sm:inline">Topology</span>
                </button>
             </div>

             {/* Voice Intent Button */}
             <button
               onClick={() => setIsVoiceModalOpen(true)}
               className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-50 border border-purple-200 text-purple-800 rounded-full text-xs font-bold hover:bg-purple-100 transition-all shadow-sm"
               title="Agentic Voice-to-Intent"
             >
               <Mic size={14} className="text-purple-600 animate-pulse" />
               <span className="hidden md:inline">Voice Agent</span>
             </button>

             <button 
              onClick={async () => {
                const context = cards.map(c => `${c.name}: ${c.summary.description}`).join('; ');
                const summary = await summarizeProject(context);
                alert(`Inventory Intelligence Summary: ${summary}`);
              }}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full text-xs font-bold text-neutral-800 hover:bg-neutral-200 transition-colors"
             >
                <Sparkles size={14} /> pcard summarize
             </button>

             <button 
              onClick={() => setIsAddingCard(true)}
              className="p-2 bg-neutral-900 text-white rounded-full hover:scale-105 transition-transform"
              title="Add New Card"
             >
                <Plus size={20} />
             </button>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <header className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-neutral-400">
             <Cpu size={14} />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Semantic Inventory</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-light tracking-tighter max-w-4xl leading-[1.05]">
            Manage your <span className="font-medium italic">portable software</span> systems as semi-autonomous entities.
          </h2>
          
          <div className="pt-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
             <div className="relative flex-1 md:max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-neutral-900 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Universal system search..." 
                  className="w-full pl-12 pr-12 py-3.5 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  onClick={() => setIsFilterOpen(true)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                    selectedTags.length > 0 ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <Filter size={16} />
                  {selectedTags.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white">
                      {selectedTags.length}
                    </span>
                  )}
                </button>
             </div>

             <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-2xl px-4 py-3.5 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Sort</span>
                <select 
                  className="bg-transparent text-xs font-bold text-neutral-600 focus:outline-none cursor-pointer appearance-none pr-4"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                >
                  <option value="sync">Recent Sync</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="status">Build Status</option>
                </select>
             </div>
             
             {selectedTags.length > 0 && (
               <div className="flex flex-wrap gap-2">
                 {selectedTags.map(tag => (
                   <span key={tag} className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900 text-white text-[11px] font-bold rounded-full uppercase tracking-widest animate-in zoom-in-50 duration-300">
                     {tag}
                     <button onClick={() => handleToggleTag(tag)} className="hover:text-neutral-400">
                       <X size={12} />
                     </button>
                   </span>
                 ))}
                 <button onClick={() => setSelectedTags([])} className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-900 px-2">
                   Clear
                 </button>
               </div>
             )}

             <span className="hidden md:block text-neutral-200">—</span>
             <p className="text-sm text-neutral-500 font-medium font-mono lowercase">
               {filteredCards.length} Result{filteredCards.length !== 1 ? 's' : ''}
             </p>
          </div>
        </motion.div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 pb-40">
        {viewMode === 'topology' ? (
          <MultiView 
            cards={filteredCards} 
            onSelectCard={(id) => {
              setViewMode('grid');
              setExpandedId(id);
            }} 
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {sortedCards.map((card) => (
                <CardView 
                  key={card.id} 
                  card={card} 
                  isExpanded={expandedId === card.id}
                  onToggle={() => setExpandedId(expandedId === card.id ? null : card.id)}
                  onUpdateCard={handleUpdateCard}
                  onDeleteCard={handleDeleteCard}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {sortedCards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-40">
             <Ghost size={64} className="mb-4" />
             <p className="text-lg font-light tracking-tight italic">No systems matched your search query.</p>
          </div>
        )}
      </main>

      {/* Modals */}
      <VoiceIntentModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        cards={cards}
        onApplyIntent={handleApplyVoiceIntent}
      />

      <FilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        availableTags={availableTags}
        selectedTags={selectedTags}
        onToggleTag={handleToggleTag}
        onClear={() => setSelectedTags([])}
      />

      <InfoModal 
        isOpen={activeInfoTab !== null}
        onClose={() => setActiveInfoTab(null)}
        initialTab={activeInfoTab || 'about'}
      />

      {/* Add Card Modal optimized for mobile */}
      <AnimatePresence>
        {isAddingCard && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-neutral-900/60 backdrop-blur-sm"
            onClick={() => setIsAddingCard(false)}
          >
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white rounded-t-[2.5rem] md:rounded-3xl p-8 md:p-12 w-full max-w-2xl shadow-2xl space-y-8 max-h-[95vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-light tracking-tight">Project New Intent</h3>
                  <button onClick={() => setIsAddingCard(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>
                <p className="text-neutral-500 font-light text-sm md:text-base leading-relaxed">
                  Enter a GitHub URL or describe your architecture. We'll projection it onto a semantic card.
                </p>
              </div>

              <div className="space-y-6">
                 <div className="relative">
                    <textarea 
                      value={newCardInput}
                      onChange={(e) => setNewCardInput(e.target.value)}
                      placeholder="e.g. https://github.com/my/repo or 'A distributed KV store with multi-region replication'"
                      className="w-full h-40 md:h-48 p-6 bg-neutral-50 border border-neutral-100 rounded-3xl text-lg font-light tracking-tight focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none transition-all placeholder:text-neutral-300"
                    />
                    {newCardInput && (
                      <button 
                        onClick={() => setNewCardInput('')}
                        className="absolute right-4 top-4 text-neutral-300 hover:text-neutral-900"
                      >
                        <X size={16} />
                      </button>
                    )}
                 </div>
                 
                 <button 
                  disabled={isGenerating || !newCardInput.trim()}
                  onClick={handleAddCard}
                  className="w-full py-5 bg-neutral-900 text-white rounded-[1.5rem] font-bold tracking-widest uppercase text-xs shadow-xl shadow-neutral-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
                 >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Projection in Progress...
                      </>
                    ) : (
                      <>
                        <Terminal size={20} />
                        Initialize System Card
                      </>
                    )}
                 </button>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-neutral-50 border border-neutral-100">
                 <LayoutGrid className="text-neutral-400 shrink-0" size={20} />
                 <p className="text-[11px] text-neutral-500 leading-relaxed italic">
                   Note: New cards default to 'experimental' with agentic analysis active. Telemetry will begin mapping after first commit sync.
                 </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-16 px-6 bg-[#FDFDFB]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Command size={20} className="text-neutral-900" />
              <h4 className="font-bold tracking-tight lowercase">intenTidy</h4>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-300">© 2026 // Orchestration Intelligence</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400">
             <button onClick={() => setActiveInfoTab('guide')} className="hover:text-neutral-900 transition-colors">Guide</button>
             <button onClick={() => setActiveInfoTab('faq')} className="hover:text-neutral-900 transition-colors">FAQ</button>
             <button onClick={() => setActiveInfoTab('about')} className="hover:text-neutral-900 transition-colors">About</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
