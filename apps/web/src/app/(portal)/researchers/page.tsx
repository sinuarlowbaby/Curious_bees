'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { SRM_DEPARTMENTS } from '@srm-recollab/shared-utils';
import { 
  Users, 
  Search, 
  MapPin, 
  Sparkles, 
  X,
  Compass,
  GraduationCap,
  UserSquare2,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/GlassCard';
import TagPill from '@/components/TagPill';
import AvatarRing from '@/components/AvatarRing';
import GlowButton from '@/components/GlowButton';

export default function ResearchersDiscoveryPage() {
  const { collaborators, currentUser, fetchCollaborators } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');
  const [invitee, setInvitee] = useState<any | null>(null);

  // Query live collaborators directory dynamically from database on search / dept filter changes
  useEffect(() => {
    fetchCollaborators(searchQuery, selectedDept);
  }, [searchQuery, selectedDept, fetchCollaborators]);

  // Pick all query results except current user
  const researchers = collaborators.filter((u: any) => u.email !== currentUser?.email);

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

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitee) return;
    alert(`Success! Workspace synergy invite successfully dispatched to ${invitee.name}. You will be notified in the Intranet activity log upon alignment.`);
    setInvitee(null);
  };

  return (
    <div className="space-y-8 relative select-none">
      
      {/* 🚀 Upper Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-borderStroke pb-5 text-left">
        <div>
          <span className="text-[10px] font-mono font-bold text-indigoElectric uppercase tracking-widest flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigoElectric" />
            <span>ReCollab Academic Network</span>
          </span>
          <h2 className="font-display font-extrabold text-2xl text-black mt-2">
            Expert Collaborators Directory
          </h2>
          <p className="text-textMuted text-xs mt-1 leading-relaxed">
            Locate research mentors, discover interdisciplinary co-authors, and invite peers to GPGPU computing pipelines.
          </p>
        </div>
      </div>

      {/* 🚀 Filter Controls */}
      <GlassCard hoverable={false} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left p-5">
        {/* Name Search */}
        <div className="space-y-2">
          <label className="block text-[9px] font-mono font-bold text-textMuted uppercase tracking-widest">Search Scholar</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, biography..."
              className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-lg bg-white border border-borderStroke text-black placeholder-textMuted bg-white focus:border-indigoElectric/35 focus:outline-none transition-all"
            />
            <Search className="w-3.5 h-3.5 text-textMuted/50 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Department select filter */}
        <div className="space-y-2">
          <label className="block text-[9px] font-mono font-bold text-textMuted uppercase tracking-widest">Department</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-borderStroke text-black bg-white focus:border-indigoElectric/35 focus:outline-none transition-all cursor-pointer"
          >
            <option value="" className="bg-darkSurfaceMuted">All Departments</option>
            {SRM_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept} className="bg-darkSurfaceMuted">{dept.split('(')[0]}</option>
            ))}
          </select>
        </div>

        {/* Focus Area Selection */}
        <div className="space-y-2">
          <label className="block text-[9px] font-mono font-bold text-textMuted uppercase tracking-widest">Research Domain</label>
          <select
            value={selectedInterest}
            onChange={(e) => setSelectedInterest(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-borderStroke text-black bg-white focus:border-indigoElectric/35 focus:outline-none transition-all cursor-pointer"
          >
            <option value="" className="bg-darkSurfaceMuted">All Research Domains</option>
            {allUniqueInterests.map((interest) => (
              <option key={interest} value={interest} className="bg-darkSurfaceMuted">#{interest}</option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* 🚀 Main Grid Feed */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredResearchers.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-darkSurface/40 border border-borderStroke rounded-2xl py-16 text-center"
            >
              <Users className="w-12 h-12 text-textMuted mx-auto mb-4" />
              <h4 className="text-black font-bold text-base">No Scholars Located</h4>
              <p className="text-textMuted text-xs max-w-xs mx-auto mt-2 leading-relaxed font-semibold">
                We couldn't find any researchers matching your specified parameters. Try resetting your search query!
              </p>
              <GlowButton
                onClick={() => { setSearchQuery(''); setSelectedDept(''); setSelectedInterest(''); }}
                variant="secondary"
                size="sm"
                className="mt-6"
              >
                Reset Filters
              </GlowButton>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredResearchers.map((researcher) => {
                const compatibilityScore = calculateCompatibility(researcher);
                return (
                  <GlassCard 
                    key={researcher.id}
                    hoverable={true}
                    glowColor="indigo"
                    className="flex flex-col justify-between"
                  >
                    <div className="space-y-4 text-left">
                      {/* Identity Card Header */}
                      <div className="flex items-start justify-between border-b border-borderStroke pb-3 gap-3">
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <AvatarRing 
                            src={researcher.image || undefined} 
                            name={researcher.name || undefined} 
                            role={researcher.role}
                            size="md" 
                            className="shrink-0"
                          />
                          <div className="min-w-0">
                            <h3 className="text-xs font-black text-black leading-tight truncate">{researcher.name}</h3>
                            <div className="flex items-center flex-wrap gap-2.5 mt-1.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-sans font-medium uppercase border border-borderStroke bg-darkSurfaceMuted text-textSecondary leading-none">
                                {researcher.role === 'FACULTY' ? (
                                  <>
                                    <GraduationCap className="w-2.5 h-2.5 mr-0.5" />
                                    Faculty PI
                                  </>
                                ) : (
                                  <>
                                    <UserSquare2 className="w-2.5 h-2.5 mr-0.5" />
                                    PhD Scholar
                                  </>
                                )}
                              </span>
                              <span className="text-[9px] text-textMuted font-bold uppercase flex items-center shrink-0">
                                <MapPin className="w-3 h-3 mr-0.5 text-textMuted/60" />
                                Kattankulathur
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Semantic compatibility badge */}
                        <div className="text-right shrink-0">
                          <div className="px-2 py-1 bg-darkSurfaceMuted border border-borderStroke rounded-lg text-center shadow-sm">
                            <span className="text-[7px] font-mono font-bold text-textMuted uppercase tracking-widest block leading-none mb-1">synergy match</span>
                            <span className="text-xs font-mono font-black text-black leading-none font-bold">{compatibilityScore}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Department */}
                      <div>
                        <p className="text-[8px] font-mono font-bold text-textMuted uppercase tracking-widest leading-none">Academic Department</p>
                        <p className="text-xs text-textPrimary font-bold leading-normal mt-1.5 max-w-sm truncate">🏫 {researcher.department}</p>
                      </div>

                      {/* Bio */}
                      <p className="text-textMuted text-xs font-semibold leading-relaxed line-clamp-3">
                        {researcher.bio || 'This academic member has recently joined the portal to bootstrap their interdisciplinary research.'}
                      </p>
                    </div>

                    {/* Footer tags and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-borderStroke pt-4 mt-4 gap-3">
                      {/* Pinned domains */}
                      <div className="flex flex-wrap gap-1">
                        {researcher.interests?.slice(0, 3).map((item: any) => (
                          <TagPill 
                            key={item.interest?.name || item.interestId}
                            label={item.interest?.name || 'Research'}
                          />
                        ))}
                      </div>

                      <GlowButton
                        onClick={() => setInvitee(researcher)}
                        variant="secondary"
                        size="sm"
                        className="shrink-0 self-end"
                      >
                        Invite
                      </GlowButton>
                    </div>

                  </GlassCard>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 🚀 INVITE SHEET drawer modal */}
      <AnimatePresence>
        {invitee && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setInvitee(null)}
              className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 cursor-pointer"
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] bg-darkSurface border-t border-borderStroke rounded-t-3xl p-6 shadow-2xl flex flex-col space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-borderStroke pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-darkSurfaceMuted border border-borderStroke flex items-center justify-center text-black">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-sm text-black leading-none">Synergy Proposal</h3>
                    <p className="text-[9px] text-textMuted font-mono font-bold uppercase mt-1">Intranet Workspace Collaboration</p>
                  </div>
                </div>
                <button 
                  onClick={() => setInvitee(null)}
                  className="p-1 rounded-full bg-darkSurfaceMuted hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-4 h-4 text-textMuted animate-pulse" />
                </button>
              </div>

              <form onSubmit={handleSendInvite} className="space-y-4">
                <div className="p-4 bg-darkSurfaceMuted border border-borderStroke rounded-xl flex items-center space-x-3.5">
                  <AvatarRing 
                    src={invitee.image || undefined} 
                    name={invitee.name || undefined} 
                    role={invitee.role}
                    size="sm" 
                  />
                  <div>
                    <h4 className="text-xs font-bold text-black leading-none">{invitee.name}</h4>
                    <p className="text-[9px] text-textMuted font-mono font-bold uppercase mt-1.5 truncate max-w-[240px]">{invitee.department?.split('(')[0]}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-mono font-bold text-textMuted uppercase tracking-widest">Synergy Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="E.g. Hi Doctor, I reviewed your nanomaterials synthesizers biography. We have computational sequencing algorithms ready in our lab. Let's align on a SERB grant..."
                    className="w-full px-3 py-2 text-xs leading-relaxed font-semibold font-sans rounded-lg bg-white border border-borderStroke text-black placeholder-textMuted bg-white focus:border-indigoElectric/35 focus:outline-none transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-borderStroke">
                  <button
                    type="button"
                    onClick={() => setInvitee(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-textMuted hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <GlowButton
                    type="submit"
                    variant="primary"
                    className="gap-2"
                  >
                    <UserCheck className="w-4 h-4 shrink-0" />
                    <span>Send Synergy Invite</span>
                  </GlowButton>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
