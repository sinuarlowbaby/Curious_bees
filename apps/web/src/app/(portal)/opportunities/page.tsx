'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import OpportunityCard from '@/components/OpportunityCard';
import { SRM_DEPARTMENTS } from '@srm-recollab/shared-utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateOpportunitySchema } from '@srm-recollab/shared-utils';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Check, 
  MapPin, 
  Sparkles, 
  ShieldAlert, 
  SlidersHorizontal,
  X,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OpportunitiesFeedPage() {
  const { opportunities, createOpportunity, roleOverride, isLoading } = useStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Filtering states
  const [selectedDept, setSelectedDept] = useState('');
  const [searchDomain, setSearchDomain] = useState('');

  // Setup form validation
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(CreateOpportunitySchema),
    defaultValues: {
      title: '',
      description: '',
      department: '',
      researchDomain: ''
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await createOpportunity(
        data.title,
        data.description,
        data.department,
        data.researchDomain
      );
      setIsDrawerOpen(false);
      reset(); // Clear form
    } catch (e: any) {
      alert(`Error publishing position: ${e.message}`);
    }
  };

  // Filter positions
  const filteredOpps = opportunities.filter((o) => {
    const matchesDept = !selectedDept || o.department === selectedDept;
    const matchesDomain = !searchDomain || o.researchDomain.toLowerCase().includes(searchDomain.toLowerCase());
    return matchesDept && matchesDomain;
  });

  const handleOpenDrawer = () => {
    if (roleOverride !== 'FACULTY') {
      alert('🔒 Access Restricted! Only verified SRM Faculty Principal Investigators (PIs) are authorized to publish funded research opportunities. Toggle role in sandbox at sidebar bottom to test!');
      return;
    }
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-8 relative select-none">
      
      {/* Upper Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-slate-100 dark:border-slate-850 pb-5 text-left">
        <div>
          <span className="text-[10px] font-black text-srm-crimson dark:text-srm-gold uppercase tracking-widest flex items-center gap-1">
            <Briefcase className="w-4 h-4 text-srm-crimson dark:text-srm-gold" />
            <span>Academic Portal Vacancies</span>
          </span>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white mt-1.5">
            Faculty Research Openings
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
            Explore funded PhD positions, research assistant slots, and interdisciplinary vacancies published by SRM Principal Investigators.
          </p>
        </div>

        <button
          onClick={handleOpenDrawer}
          className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white srm-gradient hover:opacity-95 shadow transition-all duration-200 active:scale-95 flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Publish Opportunity</span>
        </button>
      </div>

      {/* Dynamic Filter Controls */}
      <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left shadow-sm">
        
        {/* Department select filter */}
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-1">Filter by Department</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-350"
          >
            <option value="" className="bg-slate-50 dark:bg-slate-950 text-slate-450 dark:text-slate-500">All SRM Departments</option>
            {SRM_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept} className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">{dept.split('(')[0]}</option>
            ))}
          </select>
        </div>

        {/* Domain text input filter */}
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-1">Search Research Domain</label>
          <div className="relative">
            <input
              type="text"
              value={searchDomain}
              onChange={(e) => setSearchDomain(e.target.value)}
              placeholder="E.g. Reinforcement Learning, Nanomaterials..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs font-semibold"
            />
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-600 absolute left-3 top-3.5" />
          </div>
        </div>

      </div>

      {/* Main Feed Container */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredOpps.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15"
            >
              <Briefcase className="w-10 h-10 text-slate-350 dark:text-slate-655 mx-auto mb-4" />
              <h4 className="text-slate-900 dark:text-white font-bold text-base">No Vacancies Pinned</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-xs mx-auto mt-2 leading-relaxed font-semibold">
                No funded research slots match your filters at this time. Toggle sandbox roles inside the sidebar to publish a new slot!
              </p>
            </motion.div>
          ) : (
            filteredOpps.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* SLIDE OUT DRAWER FORM (For Faculty Creation) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
            />
            
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full sm:max-w-lg bg-white dark:bg-[#07090e] border-l border-slate-200 dark:border-slate-850 z-50 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto text-left"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-srm-crimson/5 dark:bg-srm-gold/5 border border-srm-crimson/15 dark:border-srm-gold/15 flex items-center justify-center text-srm-crimson dark:text-srm-gold">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white leading-none">Publish Research Slot</h3>
                      <p className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">Exclusive Faculty Intranet Hub</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsDrawerOpen(false)} 
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-805 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form fields */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* 1. Title */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Position Title</label>
                    <input
                      type="text"
                      {...register('title')}
                      placeholder="E.g. PhD Slot: Silicon Photonics Biosensor Integration"
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs font-semibold"
                    />
                    {errors.title && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.title.message as string}</p>}
                  </div>

                  {/* 2. Research Domain */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Research Domain Keyword</label>
                    <input
                      type="text"
                      {...register('researchDomain')}
                      placeholder="E.g. Silicon Photonics"
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs font-semibold"
                    />
                    {errors.researchDomain && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.researchDomain.message as string}</p>}
                  </div>

                  {/* 3. Department */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Department Node</label>
                    <select
                      {...register('department')}
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs font-semibold text-slate-700 dark:text-slate-350 cursor-pointer"
                    >
                      <option value="" className="bg-slate-50 dark:bg-slate-950 text-slate-450 dark:text-slate-500">Select SRM Department</option>
                      {SRM_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept} className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">{dept}</option>
                      ))}
                    </select>
                    {errors.department && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.department.message as string}</p>}
                  </div>

                  {/* 4. Description */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Job Scope & Stipend Details</label>
                    <textarea
                      rows={5}
                      {...register('description')}
                      placeholder="Provide funding details (e.g. SERB rates), essential credentials required, and core lab requirements..."
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs leading-relaxed font-sans font-semibold"
                    />
                    {errors.description && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.description.message as string}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-850">
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-850 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white srm-gradient hover:opacity-95 shadow transition-all duration-200 active:scale-95 flex items-center space-x-1.5 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                      ) : (
                        <>
                          <Check className="w-4 h-4 shrink-0" />
                          <span>Publish Slot</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>

              {/* Dev notice footer */}
              <div className="mt-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-850 p-3 rounded-xl flex items-center space-x-2 text-[9px] text-slate-500 uppercase font-black">
                <ShieldAlert className="w-4 h-4 text-srm-gold shrink-0 animate-pulse" />
                <span>Only Faculty can invoke this service.</span>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
