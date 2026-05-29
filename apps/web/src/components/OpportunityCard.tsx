'use client';

import { useState } from 'react';
import { Opportunity } from '@srm-recollab/types';
import { Briefcase, MapPin, GraduationCap, ChevronDown, ChevronUp, Check, Share2, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const handleApply = () => {
    setIsApplied(true);
    setTimeout(() => {
      alert(`Success! Your ReCollab Academic Profile Snapshot has been compiled and dispatched to the PI: ${opportunity.author?.name || 'Faculty Member'}.`);
    }, 100);
  };

  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <motion.div 
      layout
      className="glass-card rounded-3xl p-6 transition-all duration-300 relative border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15 shadow-sm text-left"
    >
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start space-x-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-recollab-crimson/5 dark:bg-recollab-gold/5 border border-recollab-crimson/15 dark:border-recollab-gold/15 flex items-center justify-center text-recollab-crimson dark:text-recollab-gold shrink-0">
            <Briefcase className="w-5 h-5 shrink-0" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-recollab-crimson/10 text-recollab-crimson dark:bg-recollab-gold/10 dark:text-recollab-gold border border-recollab-crimson/25 dark:border-recollab-gold/20">
                {opportunity.researchDomain}
              </span>
              <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase flex items-center">
                <MapPin className="w-3 h-3 mr-0.5" />
                Main Campus
              </span>
            </div>
            <h3 className="font-display font-black text-base text-slate-900 dark:text-white leading-snug truncate">
              {opportunity.title}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-450 font-bold uppercase tracking-tight mt-1.5">
              PI: {opportunity.author?.name || 'Faculty Lead'} • {opportunity.department?.split('(')[0]}
            </p>
          </div>
        </div>

        {/* Date & Quick Details */}
        <div className="text-left sm:text-right shrink-0 self-start sm:self-center">
          <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">Posted {formatDate(opportunity.createdAt)}</p>
          <span className="inline-flex items-center text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 mt-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full">
            Funded Vacancy
          </span>
        </div>
      </div>

      {/* Expanded description block */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-850/80 space-y-4">
              <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-recollab-crimson dark:text-recollab-gold" />
                <span>Project & Role Description</span>
              </h4>
              <p className="text-slate-650 dark:text-slate-350 text-xs leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-850 font-medium">
                {opportunity.description}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-4 border-t border-slate-100 dark:border-slate-850/50 pt-4">
                <div className="flex items-center space-x-2.5">
                  <img 
                    src={opportunity.author?.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'} 
                    alt="PI Avatar" 
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-855 dark:text-white leading-none">{opportunity.author?.name}</p>
                    <p className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wide mt-1">Principal Investigator</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 self-end sm:self-center">
                  <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={isApplied}
                    className={`
                      px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-[0.98] flex items-center space-x-1.5 cursor-pointer
                      ${isApplied 
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 cursor-default' 
                        : 'recollab-gradient hover:opacity-95 text-white'
                      }
                    `}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-4 h-4 shrink-0 animate-bounce" />
                        <span>Application Dispatched</span>
                      </>
                    ) : (
                      <span>Apply with Profile</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand Collapse Row Trigger */}
      <div className="flex justify-center mt-4">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-1 text-[9px] font-black uppercase tracking-wider text-recollab-crimson dark:text-recollab-gold hover:text-slate-900 dark:hover:text-white transition py-1 px-4 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer shadow-sm"
        >
          <span>{isExpanded ? 'Hide Details' : 'Read Project Scope'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
    </motion.div>
  );
}
