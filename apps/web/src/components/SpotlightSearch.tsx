'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Search, MessageSquare, Briefcase, Calendar, Users, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResultItem {
  id: string;
  title: string;
  category: 'Threads' | 'Opportunities' | 'Events' | 'Researchers';
  url: string;
  meta?: string;
}

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SpotlightSearch({ isOpen, onClose }: SpotlightSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { threads, opportunities, events, collaborators, fetchCollaborators } = useStore();
  
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'THREADS' | 'OPPORTUNITIES' | 'EVENTS' | 'RESEARCHERS'>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
      fetchCollaborators(); // Ensure collaborators are cached
    }
  }, [isOpen, fetchCollaborators]);

  // Aggregate and filter search items
  const getFilteredResults = (): SearchResultItem[] => {
    const list: SearchResultItem[] = [];

    // 1. Threads
    threads.forEach((t) => {
      list.push({
        id: `t-${t.id}`,
        title: t.title,
        category: 'Threads',
        url: `/threads/${t.id}`,
        meta: `By ${t.author?.name || 'Scholar'} · ${t.tags.join(', ')}`,
      });
    });

    // 2. Opportunities
    opportunities.forEach((o) => {
      list.push({
        id: `o-${o.id}`,
        title: o.title,
        category: 'Opportunities',
        url: '/opportunities',
        meta: `${o.department} · PI: ${o.author?.name || 'Faculty Leads'}`,
      });
    });

    // 3. Events
    events.forEach((e) => {
      list.push({
        id: `e-${e.id}`,
        title: e.title,
        category: 'Events',
        url: '/events',
        meta: `${e.date} · ${e.venue}`,
      });
    });

    // 4. Researchers
    collaborators.forEach((c) => {
      list.push({
        id: `c-${c.id}`,
        title: c.name || 'Scholar',
        category: 'Researchers',
        url: '/researchers',
        meta: `${c.department || 'SRMIST'} · Interests: ${c.interests?.map((i: any) => i.interest?.name || '').filter(Boolean).join(', ') || 'General'}`,
      });
    });

    // Filtering by category & query
    return list.filter((item) => {
      const matchCat =
        activeCategory === 'ALL' ||
        (activeCategory === 'THREADS' && item.category === 'Threads') ||
        (activeCategory === 'OPPORTUNITIES' && item.category === 'Opportunities') ||
        (activeCategory === 'EVENTS' && item.category === 'Events') ||
        (activeCategory === 'RESEARCHERS' && item.category === 'Researchers');

      const matchQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.meta && item.meta.toLowerCase().includes(query.toLowerCase()));

      return matchCat && matchQuery;
    });
  };

  const results = getFilteredResults().slice(0, 8);

  // Handle keyboard shortcuts (CMD+K to toggle, ESC to close, arrows to select, enter to open)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(results.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          router.push(results[selectedIndex].url);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, router]);

  const categoryIcons = {
    Threads: <MessageSquare className="w-3.5 h-3.5 text-indigoElectric" />,
    Opportunities: <Briefcase className="w-3.5 h-3.5 text-violetRoyal" />,
    Events: <Calendar className="w-3.5 h-3.5 text-tealGlow" />,
    Researchers: <Users className="w-3.5 h-3.5 text-emerald-500" />,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-darkBg/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-xl bg-darkSurfaceMuted/90 border border-white/10 rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden glass-premium text-left"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/5 gap-3">
              <Search className="w-4 h-4 text-textMuted" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search across CuriousBees (threads, events, experts...)"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="flex-1 bg-transparent border-none text-[13px] text-textPrimary placeholder-textMuted outline-none select-text"
              />
              <span className="text-[9px] font-bold text-textMuted/60 uppercase border border-white/5 bg-white/5 px-2 py-0.5 rounded">
                ESC
              </span>
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex px-3 py-2 border-b border-white/5 bg-white/[0.01] gap-1.5 overflow-x-auto">
              {(['ALL', 'THREADS', 'OPPORTUNITIES', 'EVENTS', 'RESEARCHERS'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setSelectedIndex(0);
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded text-[9px] font-display uppercase tracking-widest font-extrabold transition-all cursor-pointer',
                    activeCategory === cat
                      ? 'bg-white/10 text-white'
                      : 'bg-transparent text-textMuted hover:text-white hover:bg-white/5'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Results Zone */}
            <div className="max-h-[300px] overflow-y-auto p-2 space-y-0.5">
              {results.length === 0 ? (
                <div className="py-12 text-center text-textMuted space-y-1">
                  <Search className="w-8 h-8 opacity-20 mx-auto" />
                  <p className="text-[11px] font-bold uppercase tracking-wider">No matching results found</p>
                  <p className="text-[10px] opacity-60">Try refining your search keyword details</p>
                </div>
              ) : (
                results.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        router.push(item.url);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150',
                        isSelected ? 'bg-white/5' : 'bg-transparent'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 rounded bg-white/5 shrink-0 border border-white/5">
                          {categoryIcons[item.category]}
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-xs font-bold text-textPrimary leading-tight truncate">
                            {item.title}
                          </p>
                          {item.meta && (
                            <p className="text-[9px] text-textMuted leading-normal truncate mt-0.5">
                              {item.meta}
                            </p>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 text-[8px] font-bold text-textMuted uppercase shrink-0">
                          <span>Open</span>
                          <CornerDownLeft className="w-3 h-3 text-textMuted" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Instructions Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-white/[0.01] text-[9px] text-textMuted/60 font-bold uppercase">
              <div className="flex items-center gap-4">
                <span>↑↓ navigate</span>
                <span>⏎ select</span>
              </div>
              <span>CuriousBees AI Spotlight</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
