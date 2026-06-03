'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, User, Tag, Mail, Bot, CheckCircle } from 'lucide-react';
import { Event } from '@curiousbees/types';

type PrismaEvent = Event & {
  status: 'DRAFT' | 'PUBLISHED' | 'REVIEW_REQUIRED' | 'FAILED';
  confidence: number;
  aiModel: string;
  aiProvider: string;
  rawEmail?: string;
  topic?: string;
  speaker?: string;
  organizerEmail?: string;
  eventType?: string;
};

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: PrismaEvent | null;
}

export default function EventDetailModal({ isOpen, onClose, event }: EventDetailModalProps) {
  if (!event) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-3xl max-h-[90vh] bg-white border border-borderStroke rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-borderStroke bg-stone-50/50">
                <div className="pr-8">
                  <div className="flex items-center gap-2 flex-wrap mb-2.5">
                    <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
                      event.status === 'PUBLISHED' ? 'bg-teal-50 border-teal-200 text-teal-700' : 
                      event.status === 'REVIEW_REQUIRED' ? 'bg-amber-50 border-amber-200 text-amber-700' : 
                      'bg-stone-100 border-stone-200 text-stone-700'
                    }`}>
                      {event.status.replace('_', ' ')}
                    </span>
                    <span className="text-[9px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded flex items-center gap-1 border border-stone-200/50 font-mono font-bold">
                      <Bot className="w-3 h-3 text-stone-500" />
                      {event.aiModel || 'manual'}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-extrabold text-black tracking-tight">{event.title}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-stone-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Left Column: Parsed Event Data */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-4 border-b border-stone-100 pb-2 font-mono">Extracted Parameters</h3>
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <Calendar className="w-4 h-4 text-indigoElectric mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-black">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p className="text-xs text-stone-500 font-medium mt-0.5 font-mono">{event.time}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <MapPin className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-black">{event.venue}</p>
                          </div>
                        </div>

                        {event.speaker && (
                          <div className="flex gap-3">
                            <User className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-bold text-black">{event.speaker}</p>
                              <p className="text-xs text-stone-500 font-medium mt-0.5">Speaker / Keynote Guest</p>
                            </div>
                          </div>
                        )}

                        {event.eventType && (
                          <div className="flex gap-3">
                            <Tag className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-bold text-black">{event.eventType}</p>
                            </div>
                          </div>
                        )}
                        
                        {event.organizerEmail && (
                          <div className="flex gap-3">
                            <Mail className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-bold text-black">{event.organizerEmail}</p>
                              <p className="text-xs text-stone-500 font-medium mt-0.5 font-mono">Organizer Inquiries</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-4.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-stone-600">AI Confidence Score</span>
                        <span className={`text-sm font-extrabold font-mono ${event.confidence >= 0.9 ? 'text-teal-600' : event.confidence >= 0.7 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {Math.round(event.confidence * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-stone-200/60 h-2 rounded-full overflow-hidden border border-stone-300/30">
                        <div 
                          className={`h-full rounded-full ${event.confidence >= 0.9 ? 'bg-tealGlow' : event.confidence >= 0.7 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.round(event.confidence * 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-stone-500 font-medium mt-3.5 leading-relaxed">
                        Extracted via {event.aiProvider} ({event.aiModel}) on {new Date(event.createdAt || Date.now()).toLocaleString()}.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Raw Email Source */}
                  <div className="flex flex-col">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-4 border-b border-stone-100 pb-2 font-mono">Raw Email Payload</h3>
                    <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-4 h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-stone-200">
                      <pre className="text-[11px] font-mono text-stone-700 whitespace-pre-wrap leading-relaxed">
                        {event.rawEmail || 'No raw email source recorded for this event.'}
                      </pre>
                    </div>
                  </div>
                  
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
