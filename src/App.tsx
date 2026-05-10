/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Cpu, 
  LayoutGrid, 
  Terminal, 
  Fingerprint, 
  Command, 
  Ghost,
  Loader2
} from 'lucide-react';
import { PortableCard } from './types';
import { SAMPLE_CARDS } from './constants';
import { CardView } from './components/CardView';
import { summarizeProject, generateSuggestions } from './services/gemini';

export default function App() {
  const [cards, setCards] = useState<PortableCard[]>(SAMPLE_CARDS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardInput, setNewCardInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredCards = cards.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
    } catch (error) {
      console.error("Failed to add card:", error);
    } finally {
      setIsGenerating(false);
    }
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
          
          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full text-xs font-medium text-neutral-500">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               12 Agents Active
             </div>
             <button 
              onClick={() => setIsAddingCard(true)}
              className="p-2 bg-neutral-900 text-white rounded-full hover:scale-105 transition-transform"
             >
                <Plus size={20} />
             </button>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <header className="max-w-7xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-neutral-400">
             <Cpu size={14} />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Semantic Inventory</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-light tracking-tighter max-w-4xl leading-[1.05]">
            Manage your <span className="font-medium italic">portable software</span> systems as semi-autonomous entities.
          </h2>
          
          <div className="pt-8 flex flex-col md:flex-row gap-4 items-start md:items-center">
             <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-neutral-900 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Filter semantic cards..." 
                  className="w-full pl-12 pr-6 py-3 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <span className="hidden md:block text-neutral-300">—</span>
             <p className="text-sm text-neutral-500 font-medium font-mono lowercase">
               {filteredCards.length} Cards Loaded
             </p>
          </div>
        </motion.div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card) => (
              <CardView 
                key={card.id} 
                card={card} 
                isExpanded={expandedId === card.id}
                onToggle={() => setExpandedId(expandedId === card.id ? null : card.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredCards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-40">
             <Ghost size={64} className="mb-4" />
             <p className="text-lg font-light tracking-tight italic">No systems matched your search query.</p>
          </div>
        )}
      </main>

      {/* Add Card Modal */}
      <AnimatePresence>
        {isAddingCard && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-neutral-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 md:p-12 w-full max-w-2xl shadow-2xl space-y-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-light tracking-tight underline decoration-neutral-200 underline-offset-8">New Semantic Card</h3>
                  <button onClick={() => setIsAddingCard(false)} className="text-neutral-400 hover:text-neutral-900">
                    Close
                  </button>
                </div>
                <p className="text-neutral-500 font-light">
                  Paste a GitHub URL or describe a project to project it onto a PortableCard.
                </p>
              </div>

              <div className="space-y-6">
                 <textarea 
                  value={newCardInput}
                  onChange={(e) => setNewCardInput(e.target.value)}
                  placeholder="https://github.com/org/repo or 'A distributed database built for low-latency gaming'"
                  className="w-full h-40 p-6 bg-neutral-50 border border-neutral-100 rounded-3xl text-lg font-light tracking-tight focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none transition-all"
                 />
                 
                 <button 
                  disabled={isGenerating || !newCardInput.trim()}
                  onClick={handleAddCard}
                  className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-medium tracking-tight hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-colors"
                 >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Generating Semantic Projection...
                      </>
                    ) : (
                      <>
                        <Terminal size={20} />
                        Initialize System Card
                      </>
                    )}
                 </button>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50/50">
                 <LayoutGrid className="text-blue-500 shrink-0 mt-1" size={18} />
                 <p className="text-xs text-blue-700/80 leading-relaxed italic">
                   Note: New cards are initialized as 'experimental' with autonomous agentic analysis enabled by default.
                 </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-300">© 2026 intenTidy // Decker Software Orchestration Intelligence</p>
          <div className="flex gap-8 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
             <a href="#" className="hover:text-neutral-900">Documentation</a>
             <a href="#" className="hover:text-neutral-900">Privacy</a>
             <a href="#" className="hover:text-neutral-900">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
