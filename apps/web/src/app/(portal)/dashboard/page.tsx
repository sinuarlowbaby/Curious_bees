'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useStore } from '@/store/useStore';
import { 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight, 
  UserPlus, 
  Compass,
  Briefcase,
  Layers,
  Calendar as CalendarIcon,
  MapPin,
  Clock
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import TagPill from '@/components/TagPill';
import AvatarRing from '@/components/AvatarRing';
import ThreadCard from '@/components/ThreadCard';

export default function DashboardPage() {
  const { 
    currentUser, 
    threads, 
    opportunities, 
    roleOverride, 
    collaborators, 
    events, 
    pendingApprovals,
    collaborationRequests,
    fetchPendingApprovals,
    fetchCollaborationRequests,
    approveScholar,
    updateCollaborationRequest,
    fetchCollaborators, 
    fetchData 
  } = useStore();

  // Fetch live data on mount
  useEffect(() => {
    fetchData();
    fetchCollaborators();
    if (roleOverride === 'FACULTY' || currentUser?.role === 'FACULTY') {
      fetchPendingApprovals();
      fetchCollaborationRequests();
    }
  }, [fetchData, fetchCollaborators, fetchPendingApprovals, fetchCollaborationRequests, roleOverride, currentUser]);

  // Pick suitable greeting based on local time
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good morning';
    if (hrs < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = [
    { name: 'Active Opportunities', value: opportunities.length, icon: Briefcase },
    { name: 'Research Topics', value: threads.length, icon: Layers },
    { name: 'Campus Vivas', value: events.length, icon: CalendarIcon },
  ];

  return (
    <div className="space-y-8 select-none text-left font-sans">
      
      {/* 🚀 1. WELCOME HERO SECTION */}
      <div className="bg-white border border-borderStroke rounded-xl p-6 sm:p-8 relative overflow-hidden select-none">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[12px] font-sans font-medium bg-darkSurfaceMuted text-textSecondary border border-borderStroke">
              <Sparkles className="w-3.5 h-3.5 text-textSecondary" />
              <span>{roleOverride === 'FACULTY' ? 'Faculty Portal' : 'Scholar Portal'}</span>
            </span>
            <h2 className="font-display font-light text-2xl sm:text-3xl text-black tracking-tight">
              {getGreeting()}, {currentUser?.name?.split(' ')[0] || (roleOverride === 'FACULTY' ? 'Professor' : 'Scholar')}!
            </h2>
            <p className="text-textSecondary text-[14px] max-w-xl leading-relaxed">
              {roleOverride === 'FACULTY' 
                ? 'Manage your research groups, post funded PhD vacancies, and track interdisciplinary campus viva schedules.' 
                : 'Discover interdisciplinary proposals, find expert supervisors, and stay updated with the latest campus vivas.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {roleOverride === 'FACULTY' ? (
              <>
                <Link href="/threads/create">
                  <button className="h-[40px] px-5 bg-white border border-borderStroke text-black font-sans font-semibold text-[14px] rounded-lg transition-colors hover:bg-darkSurfaceMuted cursor-pointer">
                    New Thread
                  </button>
                </Link>
                <Link href="/opportunities">
                  <button className="h-[40px] px-5 bg-black hover:bg-[#222222] text-white font-sans font-semibold text-[14px] rounded-lg transition-colors cursor-pointer border border-black">
                    Post Vacancy
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/opportunities">
                  <button className="h-[40px] px-5 bg-white border border-borderStroke text-black font-sans font-semibold text-[14px] rounded-lg transition-colors hover:bg-darkSurfaceMuted cursor-pointer">
                    Find Supervisors
                  </button>
                </Link>
                <Link href="/threads/create">
                  <button className="h-[40px] px-5 bg-black hover:bg-[#222222] text-white font-sans font-semibold text-[14px] rounded-lg transition-colors cursor-pointer border border-black">
                    Start Discussion
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 🚀 2. DYNAMIC STATS MATRIX */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div 
            key={s.name} 
            className="bg-white border border-borderStroke rounded-xl flex items-center justify-between p-5 md:px-6 md:py-5 hover:border-black transition-colors duration-300"
          >
            <div className="text-left">
              <p className="text-[12px] font-sans font-medium text-textMuted uppercase tracking-wider leading-none">{s.name}</p>
              <h4 className="font-display font-light text-[40px] text-black mt-2 leading-none">
                {s.value}
              </h4>
            </div>
            <div className="w-[40px] h-[40px] bg-darkSurfaceMuted border border-borderStroke rounded-lg flex items-center justify-center text-textSecondary shrink-0">
              <s.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* 🚀 3. THREE-COLUMN PRODUCTION LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns (Research proposals) */}
        <div className="lg:col-span-2 space-y-6">

          {roleOverride === 'FACULTY' && (
            <div className="space-y-6">
              
              {/* Scholar Approvals Hub */}
              {pendingApprovals.length > 0 && (
                <div className="bg-white border border-borderStroke rounded-xl p-5 space-y-4">
                  <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-indigoElectric">
                    Pending Scholar Approvals ({pendingApprovals.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-borderStroke text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                          <th className="pb-2">Scholar</th>
                          <th className="pb-2">Department</th>
                          <th className="pb-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-borderStroke">
                        {pendingApprovals.map((scholar) => (
                          <tr key={scholar.id} className="text-xs">
                            <td className="py-3 font-semibold text-black">
                              <div>{scholar.name}</div>
                              <div className="text-[10px] text-textSecondary font-normal">{scholar.email}</div>
                            </td>
                            <td className="py-3 text-textSecondary">{scholar.department || 'N/A'}</td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => approveScholar(scholar.id)}
                                className="px-3 py-1 bg-black text-white hover:bg-[#222222] font-semibold rounded text-[11px] cursor-pointer"
                              >
                                Approve Access
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Collaboration Requests Hub */}
              {collaborationRequests.filter(r => r.status === 'PENDING').length > 0 && (
                <div className="bg-white border border-borderStroke rounded-xl p-5 space-y-4">
                  <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-indigoElectric">
                    Pending Collaboration Invites ({collaborationRequests.filter(r => r.status === 'PENDING').length})
                  </h3>
                  <div className="space-y-3">
                    {collaborationRequests.filter(r => r.status === 'PENDING').map((req) => (
                      <div key={req.id} className="p-3.5 border border-borderStroke rounded-lg bg-darkSurfaceMuted flex flex-col sm:flex-row justify-between sm:items-start gap-3 text-left">
                        <div className="space-y-1 min-w-0">
                          <h4 className="text-xs font-bold text-black truncate">
                            {req.scholar?.name || 'Scholar'} requested synergy
                          </h4>
                          <p className="text-[11px] text-textSecondary truncate">
                            Opportunity: <span className="font-semibold text-black">{req.opportunity?.title}</span>
                          </p>
                          {req.message && (
                            <p className="text-xs text-textSecondary italic border-l-2 border-borderStroke pl-2 mt-1 line-clamp-2">
                              "{req.message}"
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2 shrink-0 self-end sm:self-start">
                          <button
                            onClick={() => updateCollaborationRequest(req.id, 'PUBLISHED')}
                            className="px-3 py-1.5 bg-black text-white hover:bg-[#222222] font-semibold rounded text-[10px] cursor-pointer"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateCollaborationRequest(req.id, 'REJECTED')}
                            className="px-3 py-1.5 bg-white text-dangerAlert border border-borderStroke hover:bg-red-50 font-semibold rounded text-[10px] cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
          <div className="flex items-center justify-between border-b border-borderStroke pb-3">
            <h3 className="font-sans font-semibold text-[14px] uppercase tracking-wider text-black flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-textSecondary" />
              <span>Trending Research Feed</span>
            </h3>
            <Link href="/threads" className="text-xs font-sans font-bold text-black hover:underline flex items-center gap-0.5 transition-colors">
              <span>View Feed</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {threads.slice(0, 2).map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))}
          </div>
        </div>

        {/* Right Columns (Recommended collaborators & Events) */}
        <div className="space-y-6">
          
          {/* Recommended Collaborators */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-borderStroke pb-3">
              <h3 className="font-sans font-semibold text-[14px] uppercase tracking-wider text-black flex items-center gap-2">
                <Compass className="w-4 h-4 text-textSecondary" />
                <span>Expert Directory</span>
              </h3>
              <Link href="/researchers" className="text-xs font-sans font-bold text-black hover:underline flex items-center gap-0.5 transition-colors">
                <span>All Experts</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {collaborators.slice(0, 2).map((collab) => (
                <div 
                  key={collab.email}
                  className="bg-white border border-borderStroke rounded-xl p-4 flex flex-col justify-between"
                >
                  <div className="text-left">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <AvatarRing 
                          src={collab.image || undefined} 
                          name={collab.name || undefined} 
                          role={collab.role}
                          size="sm" 
                          className="shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-[14px] font-semibold text-black leading-tight truncate">{collab.name}</h4>
                          <span className="inline-block mt-1 text-[11px] font-sans font-medium text-textSecondary bg-darkSurfaceMuted px-2 py-0.5 rounded border border-borderStroke">
                            {collab.role === 'FACULTY' ? 'Faculty PI' : 'PhD Scholar'}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => alert(`Synergy invitation dispatched to ${collab.name}!`)}
                        className="w-[32px] h-[32px] bg-white border border-borderStroke text-black hover:border-black transition duration-200 cursor-pointer flex items-center justify-center rounded-lg"
                        title="Invite to Workspace"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <p className="text-[11px] font-sans font-medium text-textMuted uppercase tracking-wider mt-3.5 truncate">
                      🏫 {collab.department?.split('(')[0].trim()}
                    </p>
                    
                    <p className="text-textSecondary text-[13px] mt-2 line-clamp-2 leading-relaxed">
                      {collab.bio || 'Interdisciplinary scholar indexing research fields in the CuriousBees network.'}
                    </p>
                  </div>

                  {/* Subtag interests */}
                  {collab.interests && collab.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-borderStroke">
                      {collab.interests?.slice(0, 2).map((item: any) => (
                        <TagPill 
                          key={item.interest?.name || item.interestId}
                          label={item.interest?.name || 'Research'}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Upcoming Vivas & Events hub placeholder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-borderStroke pb-3">
              <h3 className="font-sans font-semibold text-[14px] uppercase tracking-wider text-black flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-textSecondary" />
                <span>Academic Calendar</span>
              </h3>
              <Link href="/events" className="text-xs font-sans font-bold text-black hover:underline flex items-center gap-0.5 transition-colors">
                <span>Open Calendar</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {events.slice(0, 2).map((ev) => (
                <div 
                  key={ev.id}
                  className="p-4 bg-white border border-borderStroke rounded-xl flex flex-col space-y-2.5 text-left"
                >
                  <div className="flex justify-between items-start gap-3">
                    <h4 className="text-[13px] font-semibold text-black leading-tight line-clamp-2">{ev.title}</h4>
                    <span className="text-[10px] font-sans font-semibold border border-borderStroke bg-darkSurfaceMuted px-2 py-0.5 rounded text-textSecondary shrink-0">Event</span>
                  </div>
                  
                  <div className="space-y-1.5 text-[12px] text-textSecondary font-sans">
                    <div className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-textMuted shrink-0" />
                      <span>{format(new Date(ev.date), 'MMM dd, yyyy')} | {ev.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-textMuted shrink-0" />
                      <span className="truncate">{ev.venue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
