'use client';

import Link from 'next/link';
import { Thread } from '@srm-recollab/types';
import { MessageSquare, Calendar, ChevronRight, GraduationCap, UserSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThreadCardProps {
  thread: Thread;
}

export default function ThreadCard({ thread }: ThreadCardProps) {
  // Format dates cleanly
  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRoleBadge = (role: string) => {
    return role === 'FACULTY' 
      ? 'bg-srm-crimson/10 text-srm-crimson border-srm-crimson/20 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/30'
      : 'bg-srm-blue/10 text-srm-blue border-srm-blue/20 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass-card glass-card-hover rounded-3xl p-6 transition-all duration-300 relative group flex flex-col justify-between text-left"
    >
      {/* Thread Author Profile & Title */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center space-x-3">
            <img 
              src={thread.author?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
              alt={thread.author?.name || 'Author'} 
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 object-cover shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="text-xs font-bold text-slate-850 dark:text-slate-200 group-hover:text-srm-crimson dark:group-hover:text-srm-gold transition-colors leading-none">
                  {thread.author?.name || 'Academic Scholar'}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase border leading-none ${getRoleBadge(thread.author?.role || '')}`}>
                  {thread.author?.role === 'FACULTY' ? (
                    <>
                      <GraduationCap className="w-2.5 h-2.5 mr-0.5" />
                      Faculty
                    </>
                  ) : (
                    <>
                      <UserSquare className="w-2.5 h-2.5 mr-0.5" />
                      Scholar
                    </>
                  )}
                </span>
              </div>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-tight mt-1.5 leading-none">
                {thread.author?.department?.split('(')[0].trim() || 'SRM Institute'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider space-x-1 shrink-0 self-start sm:self-center">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(thread.createdAt)}</span>
          </div>
        </div>

        {/* Thread Info Content */}
        <Link href={`/threads/${thread.id}`} className="block focus:outline-none mb-4 space-y-2">
          <h3 className="font-display font-black text-base text-slate-900 dark:text-white group-hover:text-srm-crimson dark:group-hover:text-srm-gold leading-snug transition-colors">
            {thread.title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed font-semibold">
            {thread.content}
          </p>
        </Link>
      </div>

      {/* Tags and Comments Bottom Row */}
      <div className="flex flex-wrap items-center justify-between border-t border-slate-100 dark:border-slate-850/60 pt-4 mt-3 gap-3">
        {/* Thread tags */}
        <div className="flex flex-wrap gap-1.5">
          {thread.tags.map((tag) => (
            <span 
              key={tag}
              className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-555 dark:text-slate-400"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Button & Comment Count */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-450 font-bold space-x-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{thread.comments?.length || thread._count?.comments || 0} comments</span>
          </div>

          <Link 
            href={`/threads/${thread.id}`} 
            className="flex items-center text-xs font-black uppercase text-srm-crimson dark:text-srm-gold hover:underline group-hover:translate-x-0.5 transition-all"
          >
            <span>View Thread</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
