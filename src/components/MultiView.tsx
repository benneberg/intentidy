/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PortableCard, DependencyLink } from '../types';
import { Activity, ArrowRight, CheckCircle, AlertTriangle, XCircle, Layers, Cpu, Radio, Shield, Zap } from 'lucide-react';

interface MultiViewProps {
  cards: PortableCard[];
  onSelectCard: (id: string) => void;
}

export function MultiView({ cards, onSelectCard }: MultiViewProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Derive all unique tags across cards
  const allTags = useMemo(() => {
    const set = new Set<string>();
    cards.forEach(c => c.tags.forEach(t => set.add(t)));
    return Array.from(set);
  }, [cards]);

  // Synthetic dependency links between cards based on shared tags or semantic affinities
  const dependencyLinks: DependencyLink[] = useMemo(() => {
    const links: DependencyLink[] = [];
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const source = cards[i];
        const target = cards[j];
        const sharedTags = source.tags.filter(t => target.tags.includes(t));
        
        if (sharedTags.length > 0) {
          links.push({
            sourceId: source.id,
            targetId: target.id,
            relationType: source.tags.includes('orchestration') ? 'orchestrates' :
                          source.tags.includes('security') ? 'monitors' : 'data_flow',
            label: sharedTags[0]
          });
        }
      }
    }
    return links;
  }, [cards]);

  const filteredCards = useMemo(() => {
    if (!selectedTag) return cards;
    return cards.filter(c => c.tags.includes(selectedTag));
  }, [cards, selectedTag]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Topology Header & Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-neutral-900 text-white">
              <Layers size={18} />
            </span>
            <h3 className="text-xl font-light tracking-tight text-neutral-900">System Topology & Subsystem Map</h3>
          </div>
          <p className="text-xs text-neutral-500">
            Bird's-eye orchestration view mapping cross-card interconnections, telemetry latency, and subsystem health.
          </p>
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wider transition-all ${
              selectedTag === null
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All Subsystems ({cards.length})
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wider transition-all ${
                selectedTag === tag
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100 border border-neutral-200/60'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Network Dependency Visualization Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card) => {
          const isHovered = hoveredCardId === card.id;
          const connectedLinks = dependencyLinks.filter(
            l => l.sourceId === card.id || l.targetId === card.id
          );
          const connectedCards = cards.filter(c => 
            c.id !== card.id && connectedLinks.some(l => l.sourceId === c.id || l.targetId === c.id)
          );

          const statusColor = 
            card.runtime.buildStatus === 'success' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
            card.runtime.buildStatus === 'failure' ? 'text-rose-600 bg-rose-50 border-rose-200' :
            'text-amber-600 bg-amber-50 border-amber-200';

          const StatusIcon = 
            card.runtime.buildStatus === 'success' ? CheckCircle :
            card.runtime.buildStatus === 'failure' ? XCircle : AlertTriangle;

          return (
            <motion.div
              key={card.id}
              layout
              onHoverStart={() => setHoveredCardId(card.id)}
              onHoverEnd={() => setHoveredCardId(null)}
              onClick={() => onSelectCard(card.id)}
              className={`group cursor-pointer rounded-3xl p-6 transition-all duration-300 relative border overflow-hidden flex flex-col justify-between ${
                isHovered
                  ? 'bg-white border-neutral-900 shadow-xl shadow-neutral-200/50 scale-[1.02]'
                  : 'bg-[#FDFDFB] border-neutral-200/80 hover:border-neutral-400 shadow-sm'
              }`}
            >
              {/* Header */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-lg text-neutral-900 group-hover:text-black">
                        {card.name}
                      </h4>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 font-medium">
                        {card.runtime.deploymentState}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">@{card.owner}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border ${statusColor}`}>
                    <StatusIcon size={12} />
                    {card.runtime.buildStatus}
                  </span>
                </div>

                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                  {card.summary.description}
                </p>

                {/* Architecture & Tech Stack */}
                <div className="p-3 rounded-2xl bg-neutral-50/80 border border-neutral-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-700">
                    <Cpu size={13} className="text-neutral-400" />
                    <span>{card.summary.architecture || "Microservice Architecture"}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {card.summary.techStack.map(tech => (
                      <span key={tech} className="px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-[10px] text-neutral-600 font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Subsystem Health Pills */}
                {card.summary.subsystems && card.summary.subsystems.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      Subsystems ({card.summary.subsystems.length})
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {card.summary.subsystems.map(sub => (
                        <div 
                          key={sub.name} 
                          className="px-2 py-1 rounded-lg bg-neutral-100/60 flex items-center justify-between text-[10px]"
                        >
                          <span className="font-mono text-neutral-700 truncate">{sub.name}</span>
                          <span className={`w-2 h-2 rounded-full ${
                            sub.status === 'healthy' ? 'bg-emerald-500' :
                            sub.status === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Telemetry Metric Gauge */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <Activity size={13} className="text-emerald-500" />
                    <span>Latency:</span>
                    <span className="font-mono font-semibold text-neutral-800">
                      {card.runtime.telemetry?.latency || 42}ms
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <Shield size={13} className="text-purple-500" />
                    <span>Blockers:</span>
                    <span className={`font-mono font-bold ${card.intent.blockers.length > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {card.intent.blockers.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Connected Links Footer */}
              <div className="mt-6 pt-4 border-t border-neutral-100/80 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                  <Radio size={12} className="animate-pulse text-emerald-500" />
                  <span>{connectedCards.length} linked systems</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-neutral-900 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Card</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
