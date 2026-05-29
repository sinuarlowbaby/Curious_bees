'use client';

import { useStore } from '@/store/useStore';
import ThreadCard from '@/components/ThreadCard';
import { Search, Plus, MessageSquare, Tag, RefreshCcw, X, Layers, Compass } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThreadsFeedPage() {
  const { threads, searchQuery, setSearchQuery, activeTag, setActiveTag, isLoading, fetchData } = useStore();

  // Filter threads based on search queries and pinned active tags
  const filteredThreads = threads.filter((t) => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = activeTag === '' || t.tags.includes(activeTag);
    
    return matchesSearch && matchesTag;
  });

  // Extract all unique tags in threads to populate a filter row
  const allUniqueTags = Array.from(
    new Set(threads.flatMap((t) => t.tags))
  );

  return (
    <div className="space-y-8 select-none">
      
      {/* Upper header title row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-slate-100 dark:border-slate-850 pb-5 text-left">
        <div>
          <span className="text-[10px] font-black text-recollab-crimson dark:text-recollab-gold uppercase tracking-widest flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Collaborative Intranet Feed</span>
          </span>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white mt-1.5">
            Research Discussions & Proposals
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
            Browse open resource shares, grant proposal templates, and interdisciplinary requests across university departments.
          </p>
        </div>

        <Link
          href="/threads/create"
          className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white recollab-gradient hover:opacity-95 shadow transition-all duration-200 active:scale-95 flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>New Proposal</span>
        </Link>
      </div>

      {/* Search Input Bar & Tag Filters row */}
      <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search thread title, keywords or scientific focus..."
              className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl glass-input placeholder-slate-450 dark:placeholder-slate-650 font-semibold"
            />
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-600 absolute left-3 top-3.5" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-slate-405 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button 
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-350 dark:hover:border-slate-750 transition-all flex items-center justify-center shrink-0 cursor-pointer"
            title="Sync Database"
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Dynamic Tag Filter chips */}
        <div className="flex items-center space-x-3 pt-3 border-t border-slate-100 dark:border-slate-850/60 overflow-x-auto pb-1">
          <span className="text-[9px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest flex items-center shrink-0">
            <Tag className="w-3.5 h-3.5 mr-1" />
            Filter Fields:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTag('')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                activeTag === '' 
                  ? 'bg-recollab-crimson/10 text-recollab-crimson border border-recollab-crimson/25 dark:bg-recollab-gold/10 dark:text-recollab-gold dark:border-recollab-gold/30' 
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-850 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Topics
            </button>
            {allUniqueTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                  activeTag === tag 
                    ? 'bg-recollab-crimson/10 text-recollab-crimson border border-recollab-crimson/25 dark:bg-recollab-gold/10 dark:text-recollab-gold dark:border-recollab-gold/30' 
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-850 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Feed Container */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 flex justify-center items-center text-slate-500"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-recollab-crimson dark:border-recollab-gold border-t-transparent animate-spin" />
                <p className="text-xs font-semibold tracking-wider">Syncing Collaborative Database...</p>
              </div>
            </motion.div>
          ) : filteredThreads.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15"
            >
              <MessageSquare className="w-10 h-10 text-slate-350 dark:text-slate-650 mx-auto mb-4" />
              <h4 className="text-slate-900 dark:text-white font-bold text-base">No Matching Research Proposals</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xs mx-auto mt-2 leading-relaxed font-semibold">
                We couldn't find any threads matching your parameters. Be the first to start a collaborative proposal!
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveTag(''); }}
                className="mt-5 text-[10px] font-black uppercase tracking-wider text-recollab-crimson dark:text-recollab-gold border border-recollab-crimson/20 dark:border-recollab-gold/20 hover:border-recollab-crimson dark:hover:border-recollab-gold bg-recollab-crimson/5 dark:bg-recollab-gold/5 px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </motion.div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 gap-6"
            >
              {filteredThreads.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
