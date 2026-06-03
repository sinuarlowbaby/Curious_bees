'use client';

import React, { useState } from 'react';
import { Opportunity } from '@curiousbees/types';
import { Share2, Check, ChevronDown, ChevronUp, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const [isApplied, setIsApplied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsApplied(true);
    setTimeout(() => {
      alert(`Interest Sent! Your CuriousBees profile snapshot has been dispatched to ${opportunity.author?.name || 'the faculty lead'}.`);
    }, 100);
  };

  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Determine if opportunity is less than 3 days old for "NEW" badge
  const isNew = () => {
    const created = new Date(opportunity.createdAt).getTime();
    const now = new Date().getTime();
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);
    return diffDays < 3;
  };

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className="bg-white border border-borderStroke rounded-xl p-5 md:p-6 transition-all duration-200 hover:border-black cursor-pointer shadow-none flex flex-col justify-between"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        
        {/* LEFT COLUMN */}
        <div className="text-left flex-1 min-w-0">
          
          {/* Domain and type tags */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="bg-darkSurfaceMuted border border-borderStroke text-black text-[12px] px-3 py-1 rounded-full font-sans font-medium">
              {opportunity.researchDomain || 'Research'}
            </span>
            <span className="bg-darkSurfaceMuted border border-borderStroke text-black text-[12px] px-3 py-1 rounded-full font-sans font-medium">
              JRF / Ph.D.
            </span>
            {isNew() && (
              <span className="bg-black text-white text-[10px] font-semibold px-2 py-0.5 rounded uppercase font-sans">
                NEW
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-sans font-semibold text-[16px] text-black mt-3 leading-snug">
            {opportunity.title}
          </h3>

          {/* Principal Investigator Row */}
          <div className="flex items-center gap-2 mt-2 select-none">
            {opportunity.author?.image ? (
              <img src={opportunity.author.image} className="w-6 h-6 rounded-full object-cover border border-borderStroke" alt="" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-darkSurfaceMuted border border-borderStroke flex items-center justify-center font-sans font-semibold text-black text-[10px]">
                {opportunity.author?.name ? opportunity.author.name[0] : 'PI'}
              </div>
            )}
            <span className="text-textSecondary font-sans text-[13px]">
              {opportunity.author?.name || 'Faculty Lead'}
            </span>
            <span className="text-textMuted text-[12px]">
              · Faculty ({opportunity.department?.split('(')[0]})
            </span>
          </div>

          {/* Description preview */}
          <p className="text-textSecondary font-sans font-normal text-[14px] leading-relaxed mt-3 line-clamp-2">
            {opportunity.description}
          </p>

        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 self-stretch md:self-auto border-t md:border-t-0 border-borderStroke pt-3 md:pt-0">
          <p className="text-textMuted font-sans text-[13px]">
            Posted {formatDate(opportunity.createdAt)}
          </p>
          
          {isApplied ? (
            <div className="bg-[#f0fdf4] border border-[#86efac] text-[#166534] text-[13px] font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 select-none">
              <Check className="w-4 h-4" />
              <span>Interest Sent ✓</span>
            </div>
          ) : (
            <button
              onClick={handleApply}
              className="h-[40px] px-4 bg-black hover:bg-[#222222] text-white font-sans font-semibold text-[13px] rounded-lg transition-colors cursor-pointer"
            >
              Apply Interest
            </button>
          )}
        </div>

      </div>

      {/* EXPANDABLE PROJECT DETAILS */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-5 pt-5 border-t border-borderStroke space-y-4 text-left select-none">
              <h4 className="text-[11px] font-sans font-bold text-textMuted uppercase tracking-wider">
                Full Role Scope & Fellowship Details
              </h4>
              <p className="text-textSecondary font-sans text-[14px] leading-relaxed whitespace-pre-line bg-darkSurfaceMuted p-4 rounded-xl border border-borderStroke">
                {opportunity.description || 'No additional scope details provided by the principal investigator.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Toggle */}
      <div className="flex justify-center mt-3 pt-2 text-textMuted">
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

    </div>
  );
}
