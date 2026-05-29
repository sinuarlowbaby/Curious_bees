'use client';

import { useStore } from '@/store/useStore';
import ThreadCard from '@/components/ThreadCard';
import { 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight, 
  UserPlus, 
  Compass,
  Briefcase,
  Layers,
  Award,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { currentUser, threads, opportunities, roleOverride, allUsers, events } = useStore();

  // Pick suitable greeting based on local time
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good morning';
    if (hrs < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get recommended collaborators (Filter current logged user out)
  const collaborators = Object.values(allUsers).filter(u => u.email !== currentUser?.email);

  const stats = [
    { name: 'Active Opportunities', value: opportunities.length, icon: Briefcase, color: 'text-amber-500 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-950/20' },
    { name: 'Research Topics Published', value: threads.length, icon: Layers, color: 'text-blue-600 bg-blue-500/10 dark:text-blue-400 dark:bg-blue-950/20' },
    { name: 'Active Campus Vivas', value: events.length, icon: CalendarIcon, color: 'text-srm-crimson bg-srm-crimson/10 dark:text-red-400 dark:bg-red-950/20' },
  ];

  return (
    <div className="space-y-8 select-none">
      
      {/* 🚀 1. WELCOME HERO SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-white dark:bg-slate-900/15 border border-slate-200 dark:border-slate-800"
      >
        {/* Soft layout gradient accent */}
        <div className="absolute inset-0 bg-gradient-to-r from-srm-crimson/[0.02] to-srm-gold/[0.02] -z-10" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2 text-left">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-srm-crimson/10 text-srm-crimson dark:bg-red-950/40 dark:text-red-400 border border-srm-crimson/25 dark:border-red-900/30">
              <Sparkles className="w-3 h-3" />
              <span>SRM Intranet Connected</span>
            </span>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">
              {getGreeting()}, {currentUser?.name?.split(' ')[0] || 'Professor'}!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xl leading-relaxed">
              Welcome back to your academic workspace nerve center. Explore interdisciplinary proposals, review funded PhD vacancies, or manage campus vivas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link 
              href="/threads/create" 
              className="text-xs font-black uppercase tracking-wider text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-950 hover:bg-srm-crimson dark:hover:bg-srm-gold dark:hover:text-black px-5 py-3 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all duration-200 text-center cursor-pointer"
            >
              Start Discussion
            </Link>
            {roleOverride === 'FACULTY' && (
              <Link 
                href="/opportunities" 
                className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 px-5 py-3 rounded-xl shadow-sm text-center transition cursor-pointer"
              >
                Post Vacancy
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* 🚀 2. DYNAMIC STATS MATRIX */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((s, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            key={s.name} 
            className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15 flex items-center justify-between shadow-sm"
          >
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">{s.name}</p>
              <h4 className="font-display font-extrabold text-xl text-slate-900 dark:text-white mt-1.5 leading-none">
                {s.value}
              </h4>
            </div>
            <div className={`p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-850 ${s.color}`}>
              <s.icon className="w-4.5 h-4.5" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 🚀 3. THREE-COLUMN PRODUCTION LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns (Research proposals) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
            <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-srm-crimson dark:text-srm-gold" />
              <span>Trending Research Discussions</span>
            </h3>
            <Link href="/threads" className="text-xs font-bold text-srm-crimson dark:text-srm-gold hover:underline flex items-center gap-0.5">
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
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-4.5 h-4.5 text-srm-crimson dark:text-srm-gold" />
                <span>Expert Recommendations</span>
              </h3>
              <Link href="/researchers" className="text-xs font-bold text-srm-crimson dark:text-srm-gold hover:underline flex items-center gap-0.5">
                <span>Find Experts</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {collaborators.slice(0, 2).map((collab, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  key={collab.email}
                  className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition duration-200"
                >
                  <div className="text-left">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img 
                          src={collab.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                          className="w-9 h-9 rounded-full border border-slate-250 dark:border-slate-700 object-cover shrink-0" 
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">{collab.name}</h4>
                          <span className={`inline-block mt-0.5 text-[8px] font-black uppercase px-2 py-0.2 rounded ${
                            collab.role === 'FACULTY'
                              ? 'bg-srm-crimson/10 text-srm-crimson dark:bg-red-950 dark:text-red-400'
                              : 'bg-srm-blue/10 text-srm-blue dark:bg-blue-950 dark:text-blue-400'
                          }`}>
                            {collab.role === 'FACULTY' ? 'Faculty PI' : 'PhD Scholar'}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => alert(`Synergy invitation dispatched to ${collab.name}!`)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Invite to Workspace"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <p className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wide mt-3 truncate">
                      {collab.department?.split('(')[0].trim()}
                    </p>
                    
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed font-medium">
                      {collab.bio}
                    </p>
                  </div>

                  {/* Subtag interests */}
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                    {collab.interests?.slice(0, 2).map((item) => (
                      <span 
                        key={item.interest?.name}
                        className="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-450 border border-slate-200 dark:border-slate-900"
                      >
                        {item.interest?.name}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Dynamic Upcoming Vivas & Events hub placeholder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-4.5 h-4.5 text-srm-crimson dark:text-srm-gold" />
                <span>Upcoming Academic Events</span>
              </h3>
              <Link href="/events" className="text-xs font-bold text-srm-crimson dark:text-srm-gold hover:underline flex items-center gap-0.5">
                <span>Launch Hub</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {events.slice(0, 2).map((ev) => (
                <div 
                  key={ev.id}
                  className="p-4 bg-white dark:bg-slate-900/15 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col space-y-2 text-left"
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight line-clamp-1">{ev.event}</h4>
                    <span className="text-[8px] font-black uppercase bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded text-slate-550 dark:text-slate-450 shrink-0">Campus viva</span>
                  </div>
                  <div className="space-y-1 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                      <span>{ev.date} at {ev.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
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
