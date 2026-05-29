'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { SRM_DEPARTMENTS } from '@srm-recollab/shared-utils';
import { 
  Users, 
  Search, 
  MapPin, 
  Plus, 
  Sparkles, 
  ShieldAlert, 
  X,
  Compass,
  ArrowUpRight,
  UserCheck,
  Award,
  GraduationCap,
  UserSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResearchersDiscoveryPage() {
  const { allUsers, currentUser } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');
  const [invitee, setInvitee] = useState<any | null>(null);

  // Pick all users except the current logged-in user
  const researchers = Object.values(allUsers).filter((u: any) => u.email !== currentUser?.email);

  // Extract all unique research focus areas from all users to populate filter suggestions
  const allUniqueInterests = Array.from(
    new Set(researchers.flatMap((r: any) => r.interests?.map((i: any) => i.interest?.name || '') || []))
  ).filter(Boolean);

  // Calculate semantic compatibility index
  const calculateCompatibility = (researcher: any) => {
    if (!currentUser || !currentUser.interests || !researcher.interests) return 60;
    
    const myInterests = currentUser.interests.map((i: any) => i.interest?.name);
    const peerInterests = researcher.interests.map((i: any) => i.interest?.name);
    
    const intersection = myInterests.filter((i: any) => peerInterests.includes(i));
    
    if (intersection.length > 0) {
      return 85 + Math.min(intersection.length * 5, 14); // High compatibility if interests overlap!
    }
    
    // Fallback: compatibility based on department similarity
    if (currentUser.department === researcher.department) {
      return 78;
    }
    
    return 65; // Base interdisciplinary score
  };

  // Filter researchers
  const filteredResearchers = researchers.filter((r: any) => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (r.bio && r.bio.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesDept = !selectedDept || r.department === selectedDept;
    
    const researcherInterests = r.interests?.map((i: any) => i.interest?.name || '') || [];
    const matchesInterest = !selectedInterest || researcherInterests.includes(selectedInterest);
    
    return matchesSearch && matchesDept && matchesInterest;
  });

  const getRoleBadge = (role: string) => {
    return role === 'FACULTY' 
      ? 'bg-srm-crimson/10 text-srm-crimson border-srm-crimson/20 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/30'
      : 'bg-srm-blue/10 text-srm-blue border-srm-blue/20 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30';
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitee) return;
    alert(`Success! Workspace synergy invite successfully dispatched to ${invitee.name}. You will be notified in the Intranet activity log upon alignment.`);
    setInvitee(null);
  };

  return (
    <div className="space-y-8 relative select-none">
      
      {/* Upper Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-slate-100 dark:border-slate-850 pb-5 text-left">
        <div>
          <span className="text-[10px] font-black text-srm-crimson dark:text-srm-gold uppercase tracking-widest flex items-center gap-1.5">
            <Compass className="w-4.5 h-4.5 text-srm-crimson dark:text-srm-gold" />
            <span>SRM ResearchGate Network</span>
          </span>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-905 dark:text-white mt-1.5">
            Expert Collaborators Directory
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
            Locate research mentors, discover interdisciplinary co-authors, and invite peers to GPGPU computing pipelines.
          </p>
        </div>
      </div>

      {/* Dynamic Filter Controls */}
      <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15 grid grid-cols-1 md:grid-cols-3 gap-4 text-left shadow-sm">
        
        {/* Name Search */}
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-1">Search Researcher Name</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, biography..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs font-semibold"
            />
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-600 absolute left-3 top-3.5" />
          </div>
        </div>

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
              <option key={dept} value={dept} className="bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-200">{dept.split('(')[0]}</option>
            ))}
          </select>
        </div>

        {/* Focus Area Selection */}
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-1">Filter by Focus Domain</label>
          <select
            value={selectedInterest}
            onChange={(e) => setSelectedInterest(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-350"
          >
            <option value="" className="bg-slate-50 dark:bg-slate-950 text-slate-450 dark:text-slate-500">All Research Domains</option>
            {allUniqueInterests.map((interest) => (
              <option key={interest} value={interest} className="bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-200">#{interest}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Main Grid Feed */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredResearchers.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15"
            >
              <Users className="w-10 h-10 text-slate-350 dark:text-slate-655 mx-auto mb-4" />
              <h4 className="text-slate-900 dark:text-white font-bold text-base">No Researchers Located</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-xs mx-auto mt-2 leading-relaxed font-semibold">
                We couldn't find any researchers matching your specified parameters. Try resetting your search query!
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedDept(''); setSelectedInterest(''); }}
                className="mt-5 text-[10px] font-black uppercase tracking-wider text-srm-crimson dark:text-srm-gold border border-srm-crimson/25 dark:border-srm-gold/25 hover:border-srm-crimson dark:hover:border-srm-gold bg-srm-crimson/5 dark:bg-srm-gold/5 px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredResearchers.map((researcher) => {
                const compatibilityScore = calculateCompatibility(researcher);
                return (
                  <motion.div 
                    layout
                    key={researcher.id}
                    className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition duration-200 shadow-sm"
                  >
                    <div className="space-y-4 text-left">
                      {/* Identity Card Header */}
                      <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-850 pb-3 gap-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          <img 
                            src={researcher.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                            className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-800 shadow-sm shrink-0" 
                          />
                          <div className="min-w-0">
                            <h3 className="text-xs font-black text-slate-855 dark:text-white leading-tight truncate">{researcher.name}</h3>
                            <div className="flex items-center flex-wrap gap-2.5 mt-1.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase border leading-none ${getRoleBadge(researcher.role)}`}>
                                {researcher.role === 'FACULTY' ? (
                                  <>
                                    <GraduationCap className="w-2.5 h-2.5 mr-0.5" />
                                    Faculty PI
                                  </>
                                ) : (
                                  <>
                                    <UserSquare className="w-2.5 h-2.5 mr-0.5" />
                                    PhD Scholar
                                  </>
                                )}
                              </span>
                              <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase flex items-center shrink-0">
                                <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
                                Kattankulathur
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Semantic compatibility badge */}
                        <div className="text-right shrink-0">
                          <div className="px-2 py-1 bg-srm-crimson/5 dark:bg-srm-gold/5 border border-srm-crimson/15 dark:border-srm-gold/20 rounded-lg text-center">
                            <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none mb-0.5">synergy match</span>
                            <span className="text-xs font-black text-srm-crimson dark:text-srm-gold leading-none">{compatibilityScore}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Department */}
                      <div>
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Academic Department</p>
                        <p className="text-xs text-slate-700 dark:text-slate-350 font-bold leading-normal mt-1 max-w-sm truncate">{researcher.department}</p>
                      </div>

                      {/* Bio */}
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed line-clamp-3">
                        {researcher.bio || 'This academic member has recently joined the portal to bootstrap their interdisciplinary research.'}
                      </p>
                    </div>

                    {/* Footer tags and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100 dark:border-slate-850/60 pt-4 mt-4 gap-3">
                      {/* Pinned domains */}
                      <div className="flex flex-wrap gap-1">
                        {researcher.interests?.slice(0, 3).map((item) => (
                          <span 
                            key={item.interest?.name}
                            className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-450 border border-slate-200 dark:border-slate-900"
                          >
                            {item.interest?.name}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => setInvitee(researcher)}
                        className="py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider text-srm-crimson dark:text-srm-gold border border-srm-crimson/25 dark:border-srm-gold/20 bg-srm-crimson/5 dark:bg-srm-gold/5 hover:bg-srm-crimson dark:hover:bg-srm-gold hover:text-white transition active:scale-[0.98] shrink-0 self-end cursor-pointer shadow-sm shadow-black/[0.01]"
                      >
                        Invite to Workspace
                      </button>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 📱 INVITE SHEET drawer modal */}
      <AnimatePresence>
        {invitee && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setInvitee(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] bg-white dark:bg-[#07090e] border-t border-slate-200 dark:border-slate-800 rounded-t-3xl p-6 shadow-2xl flex flex-col space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-srm-crimson/5 dark:bg-srm-gold/5 border border-srm-crimson/15 dark:border-srm-gold/15 flex items-center justify-center text-srm-crimson dark:text-srm-gold">
                    <Compass className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-sm text-slate-850 dark:text-white leading-none">Synergy Proposal</h3>
                    <p className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase mt-1">Intranet Workspace Collaboration</p>
                  </div>
                </div>
                <button 
                  onClick={() => setInvitee(null)}
                  className="p-1 rounded-full bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSendInvite} className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl flex items-center space-x-3.5">
                  <img src={invitee.image} className="w-10 h-10 rounded-full border border-slate-250 dark:border-slate-800 object-cover shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-850 dark:text-white leading-none">{invitee.name}</h4>
                    <p className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-1 truncate max-w-[240px]">{invitee.department?.split('(')[0]}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Synergy Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="E.g. Hi Doctor, I reviewed your nanomaterials synthesizers biography. We have computational sequencing algorithms ready in our lab. Let's align on a SERB grant..."
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs leading-relaxed font-semibold font-sans"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setInvitee(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white srm-gradient hover:opacity-95 shadow active:scale-[0.98] transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 shrink-0" />
                    <span>Send Synergy Invite</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
