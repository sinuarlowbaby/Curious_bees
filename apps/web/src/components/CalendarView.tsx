'use client';

import React, { useState, useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  X, 
  Search, 
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Event } from '@srm-recollab/types';
import { format } from 'date-fns';

interface CalendarViewProps {
  events: Event[];
  onEventDeleted?: (event: Event) => void;
}

export default function CalendarView({ 
  events, 
  onEventDeleted 
}: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const calendarRef = useRef<any>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Custom header title tracking
  const [calendarTitle, setCalendarTitle] = useState('');
  const [currentView, setCurrentView] = useState('dayGridMonth');

  // Dynamic Extractors for filters
  const departments = useMemo(() => {
    const set = new Set<string>();
    events.forEach(e => {
      if (e.department) set.add(e.department);
    });
    return ['ALL', ...Array.from(set)];
  }, [events]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    events.forEach(e => {
      if (e.category) set.add(e.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [events]);

  // Filter events reactively
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const titleMatches = e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           e.venue?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const deptMatches = selectedDepartment === 'ALL' || e.department === selectedDepartment;
      const catMatches = selectedCategory === 'ALL' || e.category === selectedCategory;

      return titleMatches && deptMatches && catMatches;
    });
  }, [events, searchQuery, selectedDepartment, selectedCategory]);

  // Upcoming Event calculation (next 3)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(e => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [events]);

  // Map events to FullCalendar shape
  const calendarEvents = useMemo(() => {
    return filteredEvents.map((ev) => {
      const categoryLower = (ev.category || '').toLowerCase();
      
      // Sophisticated academic color schemes matching Google Calendar styles
      let gradientClass = 'from-emerald-500/10 to-emerald-500/[0.02] dark:from-emerald-500/20 dark:to-transparent';
      let borderClass = 'border-emerald-500';
      let textClass = 'text-emerald-700 dark:text-emerald-300';
      
      if (categoryLower.includes('viva') || categoryLower.includes('defense') || categoryLower.includes('phd')) {
        gradientClass = 'from-amber-500/10 to-amber-500/[0.02] dark:from-amber-500/20 dark:to-transparent';
        borderClass = 'border-amber-500';
        textClass = 'text-amber-700 dark:text-amber-300';
      } else if (categoryLower.includes('workshop') || categoryLower.includes('bootcamp')) {
        gradientClass = 'from-blue-500/10 to-blue-500/[0.02] dark:from-blue-500/20 dark:to-transparent';
        borderClass = 'border-blue-500';
        textClass = 'text-blue-700 dark:text-blue-300';
      } else if (categoryLower.includes('seminar') || categoryLower.includes('talk') || categoryLower.includes('colloquium')) {
        gradientClass = 'from-rose-500/10 to-rose-500/[0.02] dark:from-rose-500/20 dark:to-transparent';
        borderClass = 'border-rose-500';
        textClass = 'text-rose-700 dark:text-rose-300';
      } else if (categoryLower.includes('conference') || categoryLower.includes('symposium')) {
        gradientClass = 'from-purple-500/10 to-purple-500/[0.02] dark:from-purple-500/20 dark:to-transparent';
        borderClass = 'border-purple-500';
        textClass = 'text-purple-700 dark:text-purple-300';
      }

      return {
        id: ev.id,
        title: ev.title,
        start: ev.date,
        extendedProps: {
          time: ev.time,
          venue: ev.venue,
          category: ev.category || 'Academic',
          department: ev.department || 'SRMIST',
          description: ev.description || '',
          gradientClass,
          borderClass,
          textClass
        },
      };
    });
  }, [filteredEvents]);

  // FullCalendar event custom rendering
  const renderEventContent = (eventInfo: any) => {
    const { time, venue, gradientClass, borderClass, textClass, category } = eventInfo.event.extendedProps;
    return (
      <div 
        className={`w-full bg-gradient-to-r ${gradientClass} ${textClass} p-1.5 rounded-lg border-l-4 ${borderClass} leading-tight shadow-sm hover:shadow-md transition duration-200 cursor-pointer flex flex-col min-w-0 h-full justify-between`}
      >
        <div className="flex items-start justify-between font-bold min-w-0 w-full gap-1">
          <span className="truncate text-[10px] tracking-tight font-black pr-1 min-w-0 leading-tight">
            {eventInfo.event.title}
          </span>
          <span className="text-[8px] bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded shrink-0 font-black uppercase tracking-wider leading-none">
            {time}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1 text-[8px] opacity-90 min-w-0 w-full font-bold">
          <span className="truncate flex items-center min-w-0 pr-1">
            <MapPin className="w-2.5 h-2.5 mr-0.5 shrink-0 opacity-80" />
            <span className="truncate font-bold">{venue}</span>
          </span>
          <span className="text-[7px] font-black uppercase bg-slate-900/10 dark:bg-black/30 px-1 py-0.5 rounded tracking-wider leading-none shrink-0 ml-1">
            {category}
          </span>
        </div>
      </div>
    );
  };

  const handleEventClick = (clickInfo: any) => {
    const { id, title, start } = clickInfo.event;
    const { time, venue, category, department, description } = clickInfo.event.extendedProps;
    
    // Find the original event object
    const originalEvent = events.find(e => e.id === id) || {
      id,
      title,
      date: start,
      time,
      venue,
      category,
      department,
      description,
      tags: [],
      createdByAi: true
    };
    
    setSelectedEvent(originalEvent as any);
  };

  // FullCalendar Toolbar Actions
  const handlePrev = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.prev();
      setCalendarTitle(api.view.title);
    }
  };

  const handleNext = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.next();
      setCalendarTitle(api.view.title);
    }
  };

  const handleToday = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.today();
      setCalendarTitle(api.view.title);
    }
  };

  const changeView = (viewName: string) => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.changeView(viewName);
      setCurrentView(viewName);
      setCalendarTitle(api.view.title);
    }
  };

  // Initialize Title
  React.useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      setCalendarTitle(api.view.title);
    }
  }, [calendarEvents]);

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* 🚀 Interactive Filter Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-850/80">
        
        {/* Search bar */}
        <div className="md:col-span-4 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, venues, topics..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-recollab-gold/50"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* Department Filter */}
        <div className="md:col-span-4 flex items-center space-x-2">
          <span className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Dept:</span>
          </span>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold cursor-pointer focus:outline-none"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept === 'ALL' ? 'All Departments' : dept}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="md:col-span-4 flex items-center space-x-2">
          <span className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold cursor-pointer focus:outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'ALL' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 📅 Main Calendar Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Calendar Body */}
        <div className="xl:col-span-9 bg-white dark:bg-slate-900/15 border border-slate-200/80 dark:border-slate-850 p-5 rounded-3xl shadow-sm flex flex-col relative overflow-hidden min-h-[580px]">
          
          {/* Custom FullCalendar Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-850/60 pb-4 mb-4">
            
            {/* Title & Chevron Nav */}
            <div className="flex items-center space-x-3">
              <h2 className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white min-w-[120px]">
                {calendarTitle || 'University Calendar'}
              </h2>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleToday}
                  className="px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Today
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* View Selector Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-fit">
              <button
                onClick={() => changeView('dayGridMonth')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition ${
                  currentView === 'dayGridMonth' 
                    ? 'bg-white dark:bg-slate-900 text-recollab-crimson dark:text-recollab-gold shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => changeView('timeGridWeek')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition ${
                  currentView === 'timeGridWeek' 
                    ? 'bg-white dark:bg-slate-900 text-recollab-crimson dark:text-recollab-gold shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => changeView('listWeek')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition ${
                  currentView === 'listWeek' 
                    ? 'bg-white dark:bg-slate-900 text-recollab-crimson dark:text-recollab-gold shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Agenda
              </button>
            </div>
          </div>

          {/* Calendar Instance */}
          <div className="flex-1 text-xs text-slate-800 dark:text-slate-300 font-sans">
            <style>{`
              .fc {
                font-family: inherit;
              }
              .fc-theme-standard td, .fc-theme-standard th {
                border: 1px solid rgba(226, 232, 240, 0.3) !important;
              }
              .dark .fc-theme-standard td, .dark .fc-theme-standard th {
                border: 1px solid rgba(30, 41, 59, 0.4) !important;
              }
              .fc-daygrid-day-number, .fc-timegrid-slot-label-cushion {
                color: hsl(var(--muted-foreground)) !important;
                font-weight: 700 !important;
                font-size: 0.75rem !important;
              }
              .fc-col-header-cell-cushion {
                color: #888 !important;
                font-size: 9px !important;
                font-weight: 900 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.05em;
              }
              .fc-day-today {
                background: rgba(212, 175, 55, 0.03) !important;
              }
              .fc-list-event {
                background: transparent !important;
                hover: bg-slate-50/10 !important;
              }
              .fc-list-day-text, .fc-list-day-side-text {
                font-weight: 800 !important;
                text-transform: uppercase !important;
                font-size: 10px !important;
                color: hsl(var(--foreground)) !important;
              }
              .fc-list-event-dot {
                border-color: #d4af37 !important;
              }
            `}</style>
            
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={false} // Disable default header to use our custom one
              events={calendarEvents}
              eventContent={renderEventContent}
              eventClick={handleEventClick}
              editable={false} 
              height="auto"
              selectable={false}
              dayMaxEvents={3}
            />
          </div>
        </div>

        {/* 📋 Upcoming Events Side Panel */}
        <div className="xl:col-span-3 bg-slate-950 border border-slate-850/80 p-5 rounded-3xl flex flex-col justify-between relative overflow-hidden min-h-[580px]">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.01] to-transparent pointer-events-none -z-10" />
          
          <div>
            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Next Upcoming Vivas</span>
            </span>

            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                  <CalendarIcon className="w-6 h-6 opacity-30" />
                  <p className="text-[10px] uppercase font-bold tracking-wider">No Upcoming Vivas</p>
                </div>
              ) : (
                upcomingEvents.map(evt => (
                  <div 
                    key={evt.id} 
                    onClick={() => setSelectedEvent(evt)}
                    className="group border border-slate-850 bg-black/30 hover:border-amber-500/40 p-3.5 rounded-2xl transition cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black uppercase tracking-wider leading-none">
                        {evt.category || 'VIVA'}
                      </span>
                      <span className="text-[8px] text-slate-500 font-bold">
                        {format(new Date(evt.date), 'MMM dd')}
                      </span>
                    </div>

                    <h4 className="text-[11px] font-black text-slate-200 leading-snug line-clamp-2 group-hover:text-amber-400 transition">
                      {evt.title}
                    </h4>

                    <div className="mt-3 flex items-center gap-3 text-[8px] text-slate-450 font-bold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {evt.time}
                      </span>
                      <span className="truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {evt.venue}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-slate-900 pt-4 mt-6">
            <span className="text-[8px] font-semibold text-slate-500 uppercase tracking-widest block text-center">
              ReCollab AI Engine V2.0
            </span>
          </div>
        </div>
      </div>

      {/* 🔍 Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-[#07090e] border border-slate-250 dark:border-slate-850 rounded-3xl shadow-2xl max-w-md w-full p-6 relative transform scale-100 transition-all">
            
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header info */}
            <div className="flex items-center space-x-3 mb-5">
              <div className="bg-recollab-crimson/5 dark:bg-recollab-gold/5 p-2.5 rounded-xl text-recollab-crimson dark:text-recollab-gold shrink-0 border border-recollab-crimson/10 dark:border-recollab-gold/15">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md leading-none inline-block">
                  {selectedEvent.category || 'Event Details'}
                </span>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md leading-none inline-block ml-2">
                  {selectedEvent.department || 'General'}
                </span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-snug mb-4">
              {selectedEvent.title}
            </h3>

            {/* Grid of coordinates */}
            <div className="space-y-3.5 border-t border-b border-slate-100 dark:border-slate-900 py-4 mb-4">
              <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-400">
                <CalendarIcon className="w-4.5 h-4.5 text-slate-500" />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5">Date</p>
                  <p className="font-bold text-slate-800 dark:text-slate-300">
                    {format(new Date(selectedEvent.date), 'PPPP')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-400">
                <Clock className="w-4.5 h-4.5 text-slate-500" />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5">Time</p>
                  <p className="font-bold text-slate-800 dark:text-slate-300">{selectedEvent.time}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-400">
                <MapPin className="w-4.5 h-4.5 text-slate-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5">Venue</p>
                  <p className="font-bold text-slate-800 dark:text-slate-300 truncate">{selectedEvent.venue}</p>
                </div>
              </div>

              {selectedEvent.organizerEmail && (
                <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-400">
                  <span className="text-base text-slate-500">📧</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5">Organizer Email</p>
                    <p className="font-bold text-slate-800 dark:text-slate-300 truncate">{selectedEvent.organizerEmail}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {selectedEvent.description && (
              <div className="mb-6">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">AI Summary Description</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {selectedEvent.tags && selectedEvent.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {selectedEvent.tags.map(tag => (
                  <span key={tag} className="text-[8px] px-2 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 rounded uppercase font-black tracking-wider">{tag}</span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Dismiss Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
