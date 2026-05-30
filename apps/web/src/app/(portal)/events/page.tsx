'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/store/useStore';
import { 
  School,
  RefreshCw, 
  Terminal,
  Clock,
  MapPin,
  Bot,
  Mail,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const CalendarView = dynamic(() => import('@/components/CalendarView'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl h-[450px] w-full flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider">Loading Calendar...</div>,
});

export default function EventsPage() {
  const { events, fetchEvents, aiLogs, fetchAiLogs, isLoading } = useStore();
  const [triggeringMock, setTriggeringMock] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchAiLogs();
    
    // Poll for changes every 5 seconds for real-time automatic ingestion updates!
    const interval = setInterval(() => {
      fetchAiLogs();
      fetchEvents();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchEvents, fetchAiLogs]);

  // Helper to map DB processing log to user-friendly status and details
  const getStatusDetails = (log: any) => {
    const status = log.status;
    const reason = (log.errorReason || '').toLowerCase();
    
    if (status === 'SUCCESS') {
      return {
        label: 'Published',
        color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-300',
        badge: '✨ Ingested'
      };
    }
    
    if (status === 'FAILED') {
      if (reason.includes('collision') || reason.includes('overlap') || reason.includes('conflict')) {
        return {
          label: 'Validation Failed',
          color: 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-300',
          badge: '⚠️ Conflict'
        };
      }
      if (reason.includes('duplicate') || reason.includes('already exists')) {
        return {
          label: 'Duplicate Event',
          color: 'bg-purple-500/10 text-purple-500 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-300',
          badge: '👥 Duplicate'
        };
      }
      return {
        label: 'Extraction Failed',
        color: 'bg-red-500/10 text-red-500 border-red-500/20 dark:bg-red-500/20 dark:text-red-300',
        badge: '❌ Error'
      };
    }

    return {
      label: 'Processing',
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-300 animate-pulse',
      badge: '🤖 AI Extracting'
    };
  };

  // Trigger a mock email ingestion
  const handleTriggerMock = async () => {
    setTriggeringMock(true);
    try {
      const response = await fetch('/api/events/gmail/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'srm.dean.fsh@srmist.edu.in',
          subject: 'AI & Quantum Symposium 2026 Announcement',
          body: 'Dear Colleagues, we are pleased to announce the AI & Quantum Symposium 2026 scheduled on June 18 at 10:30 AM in the TP Ganesan Auditorium. Organized by the FSH Computer Science Department. RSVP at the link shared. Thanks!'
        })
      });
      if (response.ok) {
        // Fetch logs and events immediately
        await fetchAiLogs();
        await fetchEvents();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTriggeringMock(false);
    }
  };

  return (
    <div className="space-y-8 relative selection:bg-recollab-gold selection:text-black text-left h-full flex flex-col pb-12">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-slate-100 dark:border-slate-850 pb-5">
        <div>
          <span className="text-[10px] font-black text-recollab-crimson dark:text-recollab-gold uppercase tracking-widest flex items-center gap-1.5">
            <School className="w-4 h-4 text-recollab-crimson dark:text-recollab-gold" />
            <span>ReCollab Academic Portal</span>
          </span>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            AI Automated Events
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md uppercase tracking-wider font-black ml-2 animate-pulse">Auto-Pilot Active</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed max-w-2xl">
            Manual creation is disabled. All events are continuously ingested by our AI parsing engine from emails sent to <strong>recollab@srmist.edu.in</strong> or authorized accounts.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center space-x-2.5 shrink-0 self-start sm:self-center">
          <a
            href="/api/events/gmail/auth-url"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-amber-500/10 to-amber-600/5 hover:from-amber-500/20 hover:to-amber-600/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-xl transition duration-200 text-xs font-black uppercase tracking-wider shadow-sm"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Link Gmail Account</span>
          </a>

          <button
            onClick={handleTriggerMock}
            disabled={triggeringMock || isLoading}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-xl transition duration-200 text-xs font-bold shadow-sm"
          >
            <Zap className={`w-3.5 h-3.5 ${triggeringMock ? 'animate-bounce text-amber-500' : ''}`} />
            <span>{triggeringMock ? 'Triggering...' : 'Trigger Mock Ingestion'}</span>
          </button>

          <button
            onClick={() => { fetchEvents(true); fetchAiLogs(); }}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:text-slate-900 dark:hover:text-white transition duration-200 text-xs font-bold disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. Smart AI Calendar Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-l-4 border-recollab-crimson dark:border-recollab-gold pl-3">
          <h3 className="font-display font-black text-sm uppercase tracking-widest text-slate-800 dark:text-slate-200">
            1. Smart AI Calendar
          </h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-md">
            {events.length} Published Events
          </span>
        </div>
        <CalendarView events={events} />
      </section>

      {/* 2. AI Processed Events List Section */}
      <section className="space-y-4 pt-6">
        <div className="flex items-center justify-between border-l-4 border-recollab-crimson dark:border-recollab-gold pl-3">
          <div>
            <h3 className="font-display font-black text-sm uppercase tracking-widest text-slate-800 dark:text-slate-200">
              2. AI Processed Ingestion Stream
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
              Lifecycle of all email events received and processed by Gemini AI
            </p>
          </div>
          <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
            Listening Continuously
          </span>
        </div>

        {aiLogs.length === 0 ? (
          <div className="border border-dashed border-slate-350 dark:border-slate-800 rounded-3xl py-16 flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
            <Bot className="w-10 h-10 opacity-30 text-recollab-gold" />
            <div>
              <p className="text-[11px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">
                No Ingested Emails Yet
              </p>
              <p className="text-[10px] text-slate-450 dark:text-slate-600 mt-1 max-w-sm">
                Send an email with event details to r.matheshwaran.io@gmail.com or click "Trigger Mock Ingestion" to test.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {aiLogs.map((log: any) => {
              const statusDetails = getStatusDetails(log);
              const data = log.extractedJson || {};
              const confidence = log.confidenceScore || 
                (log.status === 'SUCCESS' ? 96 : log.status === 'PROCESSING' ? 0 : 45);

              return (
                <div 
                  key={log.id} 
                  className="bg-white dark:bg-slate-900/15 border border-slate-200/80 dark:border-slate-850 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden transition hover:shadow-md hover:border-slate-300 dark:hover:border-slate-750"
                >
                  {/* Status and Confidence */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-md border ${statusDetails.color}`}>
                      {statusDetails.label}
                    </span>
                    
                    {confidence > 0 && (
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        {confidence}% AI Confidence
                      </span>
                    )}
                  </div>

                  {/* Subject/Title */}
                  <div className="mb-4">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug line-clamp-1">
                      {data.title || log.subject}
                    </h4>
                    <p className="text-[9px] text-slate-450 dark:text-slate-500 font-bold mt-1 truncate">
                      📧 Sender: {log.senderEmail}
                    </p>
                  </div>

                  {/* Event Details Grid (if successfully extracted/published) */}
                  {log.status === 'SUCCESS' && (
                    <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-900 space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-[9px] text-slate-655 dark:text-slate-400 font-bold">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {data.date ? format(new Date(data.date), 'MMM dd, yyyy') : 'No Date'} | {data.time || 'No Time'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[9px] text-slate-655 dark:text-slate-400 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{data.venue || 'No Venue Specified'}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 text-[8px] font-black uppercase tracking-wider text-slate-400">
                        <span>🏷️ {data.category || 'Academic'}</span>
                        <span className="text-amber-500 dark:text-recollab-gold">{data.department || 'SRMIST'}</span>
                      </div>
                    </div>
                  )}

                  {/* Failure / Validation details */}
                  {log.status === 'FAILED' && log.errorReason && (
                    <div className="bg-rose-500/[0.03] border border-rose-500/20 p-3 rounded-xl mb-4 flex gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div className="text-[9px] font-bold text-rose-600 dark:text-rose-400 leading-normal">
                        <span className="uppercase block text-[8px] font-black text-rose-500">Validation Error:</span>
                        {log.errorReason}
                      </div>
                    </div>
                  )}

                  {/* Processing Status placeholder */}
                  {log.status === 'PROCESSING' && (
                    <div className="py-6 flex flex-col items-center justify-center text-slate-400 space-y-2 mb-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <Bot className="w-6 h-6 animate-bounce text-amber-500" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-amber-500">Gemini LLM Extraction...</span>
                    </div>
                  )}

                  {/* Timestamp footer */}
                  <div className="border-t border-slate-100 dark:border-slate-900 pt-3 flex items-center justify-between text-[8px] text-slate-400 font-bold">
                    <span>Received Inbound</span>
                    <span>{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
