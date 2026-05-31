'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Mail, Sparkles, CheckCircle, AlertTriangle, Link2Off, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import PipelineStats from '@/components/events/PipelineStats';
import EventCalendar from '@/components/events/EventCalendar';
import LiveEventFeed from '@/components/events/LiveEventFeed';
import ReviewQueue from '@/components/events/ReviewQueue';
import EventDetailModal from '@/components/events/EventDetailModal';
import GlowButton from '@/components/GlowButton';
import { auth } from '@/lib/firebase';
import { Event } from '@srm-recollab/types';

// Extend local type
type PrismaEvent = Event & {
  status: 'DRAFT' | 'PUBLISHED' | 'REVIEW_REQUIRED' | 'FAILED';
  confidence: number;
  aiModel: string;
  aiProvider: string;
};

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<PrismaEvent | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch Gmail Connection Status
  const { data: gmailStatus, isLoading: statusLoading, refetch: refetchGmailStatus } = useQuery({
    queryKey: ['gmail-connection-status'],
    queryFn: async () => {
      const user = auth.currentUser;
      let headers: any = {};
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        const mockToken = localStorage.getItem('recollab-mock-token');
        if (mockToken) headers['Authorization'] = `Bearer ${mockToken}`;
      }
      const res = await fetch('/api/events/gmail/status', { headers });
      if (!res.ok) return { isLinked: false };
      return res.json() as Promise<{ isLinked: boolean }>;
    },
  });

  // Listen for callback query params to trigger toast
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const linked = searchParams.get('gmail_linked');
      if (linked === 'success') {
        setToastMessage({
          type: 'success',
          text: 'Official SRM Gmail account connected successfully! Real-time email parsing is now active.',
        });
        // Clear parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (linked === 'error') {
        setToastMessage({
          type: 'error',
          text: 'Failed to link Gmail account. Please check your credentials or try again later.',
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Mock manual trigger for Gmail Ingestion
  const handleTriggerMock = async () => {
    try {
      const user = auth.currentUser;
      let headers: any = { 'Content-Type': 'application/json' };
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        const mockToken = localStorage.getItem('recollab-mock-token');
        if (mockToken) headers['Authorization'] = `Bearer ${mockToken}`;
      }

      await fetch('/api/events/gmail/mock', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sender: 'r.matheshwaran.io@gmail.com',
          subject: 'EVENT: AI & Quantum Symposium 2026 Announcement',
          body: 'Dear Colleagues, we are pleased to announce the AI & Quantum Symposium 2026 scheduled on June 18 at 10:30 AM in the TP Ganesan Auditorium. Organized by the FSH Computer Science Department. RSVP at the link shared. Thanks!'
        })
      });
      
      setToastMessage({
        type: 'success',
        text: 'Mock email simulated successfully! Processing via local Qwen pipeline.',
      });
    } catch (e) {
      console.error('Failed to trigger mock ingestion:', e);
    }
  };

  // Disconnect Google Ingestion
  const handleDisconnectGmail = async () => {
    try {
      const user = auth.currentUser;
      let headers: any = {};
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        const mockToken = localStorage.getItem('recollab-mock-token');
        if (mockToken) headers['Authorization'] = `Bearer ${mockToken}`;
      }

      const res = await fetch('/api/events/gmail/disconnect', {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        refetchGmailStatus();
        setToastMessage({
          type: 'success',
          text: 'Gmail integration disconnected successfully.',
        });
      }
    } catch (e) {
      console.error('Failed to disconnect Gmail:', e);
    }
  };

  // Triggers real email syncing
  const handleSyncGmail = async () => {
    setIsSyncing(true);
    try {
      const user = auth.currentUser;
      let headers: any = {};
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        const mockToken = localStorage.getItem('recollab-mock-token');
        if (mockToken) headers['Authorization'] = `Bearer ${mockToken}`;
      }

      const res = await fetch('/api/events/gmail/sync', {
        method: 'POST',
        headers,
      });

      if (res.ok) {
        setToastMessage({
          type: 'success',
          text: 'Gmail mailbox polling triggered! Processing any new emails matching the safety filters.',
        });
      } else {
        throw new Error('Sync failed');
      }
    } catch (e) {
      console.error('Failed to sync Gmail:', e);
      setToastMessage({
        type: 'error',
        text: 'Failed to poll inbox. Make sure you are authenticated.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 relative select-none text-left flex flex-col pb-12">
      
      {/* 🚀 Toast Notifications */}
      {toastMessage && (
        <div className={`border rounded-xl p-4 flex items-center justify-between gap-4 animate-fade-in ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className={`w-5 h-5 shrink-0 ${toastMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`} />
            <span className="text-sm font-medium">{toastMessage.text}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              toastMessage.type === 'success' ? 'text-emerald-700 hover:text-emerald-950' : 'text-rose-700 hover:text-rose-950'
            }`}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 🚀 Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-2">
        <div>
          <span className="text-[10px] font-mono font-bold text-indigoElectric uppercase tracking-widest flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-indigoElectric" />
            <span>AI Automation Engine</span>
          </span>
          <h2 className="font-display font-extrabold text-3xl text-black mt-2 flex items-center gap-3 tracking-tight">
            Events
            <span className="text-[9px] font-mono font-bold bg-tealGlow/10 text-tealGlow border border-tealGlow/20 px-2.5 py-1 rounded-md uppercase tracking-wider animate-pulse">Auto-Pilot Active</span>
          </h2>
          <p className="text-stone-600 text-sm mt-2 leading-relaxed max-w-2xl">
            Real-time visualization of academic events ingested, structured, and published entirely by our local Small Language Model (SLM) pipeline.
          </p>
        </div>
      </div>

      {/* 🔌 Gmail Integration Hub Connection Card */}
      <div className="w-full">
        {statusLoading ? (
          <div className="bg-white border border-borderStroke rounded-2xl p-6 flex items-center justify-center min-h-[92px]">
            <Loader2 className="w-6 h-6 text-stone-400 animate-spin" />
          </div>
        ) : gmailStatus?.isLinked ? (
          /* CONNECTED STATE */
          <div className="bg-white border border-borderStroke rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative flex h-3.5 w-3.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-505 bg-emerald-500"></span>
              </div>
              <div>
                <h3 className="text-[16px] font-display font-bold text-black flex items-center gap-2">
                  Gmail Campus Ingestion Hub
                  <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider">Active</span>
                </h3>
                <p className="text-[13px] text-stone-500 mt-1">Polling campus inbox for new events matching safety whitelist rules.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <GlowButton onClick={handleSyncGmail} disabled={isSyncing} variant="primary" size="sm" className="gap-2">
                {isSyncing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Mail className="w-3.5 h-3.5 text-white" />
                )}
                <span>Sync Inbox</span>
              </GlowButton>
              <GlowButton onClick={handleTriggerMock} variant="secondary" size="sm" className="gap-2">
                <Sparkles className="w-3.5 h-3.5 text-stone-700" />
                <span>Simulate Ingestion</span>
              </GlowButton>
              <GlowButton onClick={handleDisconnectGmail} variant="secondary" size="sm" className="gap-2 text-rose-600 border-rose-200 hover:border-rose-500 hover:bg-rose-50/50">
                <Link2Off className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </GlowButton>
            </div>
          </div>
        ) : (
          /* DISCONNECTED STATE */
          <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-3.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[16px] font-display font-bold text-amber-950 flex items-center gap-2">
                  Gmail Ingestion Service Paused
                  <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-wider">Inactive</span>
                </h3>
                <p className="text-[13px] text-amber-900/75 mt-1 max-w-3xl leading-relaxed">
                  Real-time campus event parsing is currently paused. Link an official SRM Gmail account to start parsing incoming emails. Only messages starting with <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-950 font-semibold">EVENT:</code> sent by <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-950 font-semibold">r.matheshwaran.io@gmail.com</code> are parsed.
                </p>
              </div>
            </div>
            <a href="/api/events/gmail/auth-url" className="shrink-0 self-start md:self-center">
              <GlowButton variant="primary" size="sm" className="gap-2 bg-amber-900 border-amber-950 hover:bg-amber-950 text-white">
                <Mail className="w-3.5 h-3.5" />
                <span>Link SRM Gmail</span>
              </GlowButton>
            </a>
          </div>
        )}
      </div>

      {/* 📊 Pipeline Statistics */}
      <PipelineStats />

      {/* 🗓️ Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: FullCalendar (Span 2) */}
        <div className="lg:col-span-2">
          <EventCalendar onEventClick={setSelectedEvent as any} />
        </div>

        {/* Right Column: Live Event Feed (Span 1) */}
        <div className="lg:col-span-1">
          <LiveEventFeed onEventClick={setSelectedEvent as any} />
        </div>
      </div>

      {/* 🔍 Human-in-the-loop Moderation Queue */}
      <div className="mt-6">
        <ReviewQueue onEventClick={setSelectedEvent as any} />
      </div>

      {/* 🔎 Event Detail Modal */}
      <EventDetailModal 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        event={selectedEvent} 
      />

    </div>
  );
}
