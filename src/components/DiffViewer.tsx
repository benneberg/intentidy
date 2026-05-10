/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { FileCode, GitCommit } from "lucide-react";
import { Diff } from "../types";

interface DiffViewerProps {
  diffs: Diff[];
}

export function DiffViewer({ diffs }: DiffViewerProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-neutral-500">
        <GitCommit size={18} />
        <h4 className="text-[10px] font-bold uppercase tracking-widest">Semantic Code Diff</h4>
      </div>
      
      <div className="space-y-4">
        {diffs.map((diff, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900/50">
            <div className="px-4 py-2 bg-neutral-800/50 border-b border-neutral-800 flex items-center gap-2">
              <FileCode size={14} className="text-neutral-500" />
              <span className="text-xs font-mono text-neutral-400">{diff.file}</span>
            </div>
            <div className="p-4 font-mono text-[11px] leading-relaxed overflow-x-auto">
              {diff.changes.map((change, j) => (
                <div 
                  key={j} 
                  className={`flex gap-4 px-2 py-0.5 ${
                    change.type === 'add' ? 'bg-emerald-950/20 text-emerald-400' :
                    change.type === 'remove' ? 'bg-rose-950/20 text-rose-400' :
                    'bg-neutral-800/20 text-neutral-300'
                  }`}
                >
                  <span className="w-8 text-right opacity-30 select-none">{change.line || '-'}</span>
                  <pre className="whitespace-pre-wrap">{change.content}</pre>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
