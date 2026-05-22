/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { X, Filter, Check } from "lucide-react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClear: () => void;
}

export function FilterModal({ isOpen, onClose, availableTags, selectedTags, onToggleTag, onClear }: FilterModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-8 bg-neutral-900/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-white rounded-t-[2rem] md:rounded-[2rem] w-full max-w-md overflow-hidden flex flex-col shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-[#FDFDFB]">
             <div className="flex items-center gap-2">
                <Filter size={18} className="text-neutral-400" />
                <h3 className="text-lg font-bold tracking-tight">Filter by Tags</h3>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
               <X size={20} />
             </button>
          </div>

          {/* Content */}
          <div className="p-8 max-h-[60vh] overflow-y-auto">
            <div className="flex flex-wrap gap-3">
              {availableTags.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => onToggleTag(tag)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium border transition-all ${
                      isSelected 
                        ? 'bg-neutral-900 border-neutral-900 text-white shadow-lg shadow-neutral-200' 
                        : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400'
                    }`}
                  >
                    <span>{tag}</span>
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}
            </div>
            
            {availableTags.length === 0 && (
              <div className="text-center py-8 text-neutral-400 italic text-sm">
                No tags found in current inventory.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-neutral-100 bg-[#FDFDFB] flex gap-4">
             <button 
              onClick={onClear}
              className="flex-1 py-3 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
             >
               Clear All
             </button>
             <button 
              onClick={onClose}
              className="flex-[2] py-3 bg-neutral-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-neutral-200 hover:bg-neutral-800 transition-colors"
             >
               Apply Filters
             </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
