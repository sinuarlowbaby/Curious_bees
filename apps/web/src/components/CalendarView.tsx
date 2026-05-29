'use client';

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { MapPin, Clock, Calendar as CalendarIcon, X, Edit, Save, Trash2, ArrowRight } from 'lucide-react';
import { CAMPUS_VENUES } from './EventForm';
import { Event } from '@srm-recollab/types';

// Helper function to format 24h browser clock time (e.g. "14:30") into beautiful 12h AM/PM (e.g. "02:30 PM")
function formatTimeTo12Hour(timeStr: string): string {
  if (!timeStr) return '';
  if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
    return timeStr;
  }
  const [hoursStr, minutesStr] = timeStr.split(':');
  if (!hoursStr || !minutesStr) return timeStr;

  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour should be 12
  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}

// Helper function to convert 12h AM/PM string (e.g. "10:00 AM" or "02:30 PM") to 24h format (e.g. "10:00" or "14:30") for <input type="time">
function convertTo24Hour(timeStr: string): string {
  if (!timeStr) return '';
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return timeStr;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3].toUpperCase();

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

interface CalendarViewProps {
  events: Event[];
  onEventRescheduled: (event: Event, changeDetails: string, targetedRoles: string[]) => void;
  onEventDeleted: (event: Event) => void;
  selectedEventForRescheduling?: Event | null;
  onClearRescheduleSelection?: () => void;
}

export default function CalendarView({ 
  events, 
  onEventRescheduled,
  onEventDeleted,
  selectedEventForRescheduling = null,
  onClearRescheduleSelection
}: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states for editing
  const [editEvent, setEditEvent] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [selectedEditVenue, setSelectedEditVenue] = useState('');
  const [customEditVenue, setCustomEditVenue] = useState('');
  
  // Targeted roles selections for rescheduling
  const [notifyRescheduleStudents, setNotifyRescheduleStudents] = useState(true);
  const [notifyRescheduleFaculty, setNotifyRescheduleFaculty] = useState(true);
  const [notifyRescheduleScholars, setNotifyRescheduleScholars] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hook to handle external sidebar trigger to reschedule event programmatically
  React.useEffect(() => {
    if (selectedEventForRescheduling) {
      setSelectedEvent(selectedEventForRescheduling);
      setEditEvent(selectedEventForRescheduling.event);
      setEditDate(selectedEventForRescheduling.date);
      setEditTime(convertTo24Hour(selectedEventForRescheduling.time));
      const isCustomVenue = !CAMPUS_VENUES.includes(selectedEventForRescheduling.venue);
      setSelectedEditVenue(isCustomVenue ? 'custom' : selectedEventForRescheduling.venue);
      setCustomEditVenue(isCustomVenue ? selectedEventForRescheduling.venue : '');
      setIsEditing(true);
      setError('');
    }
  }, [selectedEventForRescheduling]);

  const closeModal = () => {
    setSelectedEvent(null);
    setIsEditing(false);
    if (onClearRescheduleSelection) {
      onClearRescheduleSelection();
    }
  };

  const handleEventDelete = async () => {
    if (!selectedEvent) return;
    if (!confirm(`Are you sure you want to permanently delete "${selectedEvent.event}"?`)) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/events', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: selectedEvent.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete event.');
      }

      const deletedObj = await response.json();
      closeModal();
      onEventDeleted(deletedObj);
    } catch (err: any) {
      // Offline fallback deletion
      const deletedMock = selectedEvent;
      closeModal();
      onEventDeleted(deletedMock);
    } finally {
      setLoading(false);
    }
  };

  const calendarEvents = events.map((ev) => {
    const titleLower = ev.event.toLowerCase();
    
    // Brand compliant color schemes
    let gradientClass = 'from-slate-100 to-slate-200/60 dark:from-[#0b0f19] dark:to-[#070a13]';
    let borderClass = 'border-srm-gold';
    let textClass = 'text-slate-805 dark:text-white';
    let badgeText = 'Academic Event';

    if (titleLower.includes('phd') || titleLower.includes('viva') || titleLower.includes('defense') || titleLower.includes('thesis')) {
      gradientClass = 'from-srm-blue/15 to-srm-blue/5 dark:from-srm-blue/40 dark:to-slate-900/60';
      borderClass = 'border-srm-gold';
      textClass = 'text-srm-blue dark:text-white';
      badgeText = 'PhD Event';
    } else if (titleLower.includes('seminar') || titleLower.includes('colloquium') || titleLower.includes('symposium') || titleLower.includes('workshop')) {
      gradientClass = 'from-srm-crimson/10 to-srm-crimson/5 dark:from-srm-crimson/40 dark:to-slate-900/60';
      borderClass = 'border-srm-crimson dark:border-srm-gold';
      textClass = 'text-srm-crimson dark:text-white';
      badgeText = 'Colloquium';
    } else if (titleLower.includes('meeting') || titleLower.includes('session') || titleLower.includes('board') || titleLower.includes('committee')) {
      gradientClass = 'from-slate-200/50 to-slate-100/50 dark:from-slate-800/40 dark:to-slate-900/60';
      borderClass = 'border-slate-400 dark:border-slate-700';
      textClass = 'text-slate-700 dark:text-slate-200';
      badgeText = 'Meeting';
    }

    return {
      id: ev.id,
      title: ev.event,
      start: ev.date,
      extendedProps: {
        time: ev.time,
        venue: ev.venue,
        gradientClass,
        borderClass,
        textClass,
        badgeText,
      },
    };
  });

  const renderEventContent = (eventInfo: any) => {
    const { time, venue, gradientClass, borderClass, textClass, badgeText } = eventInfo.event.extendedProps;
    return (
      <div 
        className={`w-full bg-gradient-to-r ${gradientClass} ${textClass} p-1.5 rounded-lg border-l-4 ${borderClass} leading-tight shadow-sm hover:shadow transition duration-200 cursor-pointer flex flex-col min-w-0`}
      >
        <div className="flex items-center justify-between font-bold min-w-0 w-full">
          <span className="truncate text-[10px] tracking-tight font-bold pr-1 min-w-0">{eventInfo.event.title}</span>
          <span className="text-[8px] bg-slate-950/10 dark:bg-white/20 px-1.5 py-0.5 rounded shrink-0 font-black uppercase tracking-wider leading-none">
            {time}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1 text-[8px] opacity-80 min-w-0 w-full font-bold">
          <span className="truncate flex items-center min-w-0 pr-1">
            <MapPin className="w-2.5 h-2.5 mr-0.5 shrink-0 opacity-80" />
            <span className="truncate font-bold">{venue}</span>
          </span>
          <span className="text-[7px] font-black uppercase bg-slate-950/15 dark:bg-black/25 px-1 py-0.5 rounded tracking-wider leading-none shrink-0 ml-1">
            {badgeText}
          </span>
        </div>
      </div>
    );
  };

  const handleEventClick = (clickInfo: any) => {
    const { id, title } = clickInfo.event;
    const { time, venue } = clickInfo.event.extendedProps;
    const date = clickInfo.event.startStr;
    const eventObj = { id, event: title, date, time, venue };
    
    setSelectedEvent(eventObj);
    setEditEvent(title);
    setEditDate(date);
    setEditTime(convertTo24Hour(time));
    const isCustomVenue = !CAMPUS_VENUES.includes(venue);
    setSelectedEditVenue(isCustomVenue ? 'custom' : venue);
    setCustomEditVenue(isCustomVenue ? venue : '');
    setIsEditing(false);
    setError('');
  };

  const handleEventDrop = async (dropInfo: any) => {
    const { id, title } = dropInfo.event;
    const { time, venue } = dropInfo.event.extendedProps;
    const originalDate = dropInfo.oldEvent.startStr;
    const newDate = dropInfo.event.startStr;

    try {
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          event: title,
          date: newDate,
          time,
          venue,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const updated = await response.json();
      onEventRescheduled(
        updated, 
        `rescheduled from ${originalDate} to ${newDate} via drag-and-drop`,
        ['Student', 'Faculty', 'Research Scholar']
      );
    } catch (err: any) {
      const mockUpdated = { id, event: title, date: newDate, time, venue };
      onEventRescheduled(
        mockUpdated, 
        `rescheduled from ${originalDate} to ${newDate} via local drag-and-drop`,
        ['Student', 'Faculty', 'Research Scholar']
      );
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedEvent) return;
    if (!editEvent.trim()) return setError('Event name is required');
    if (!editDate) return setError('Date is required');
    if (!editTime.trim()) return setError('Time is required');
    if (!selectedEditVenue) return setError('Venue is required');
    if (selectedEditVenue === 'custom' && !customEditVenue.trim()) return setError('Custom venue name is required');

    setLoading(true);

    const formattedTime = formatTimeTo12Hour(editTime);
    const finalVenue = selectedEditVenue === 'custom' ? customEditVenue.trim() : selectedEditVenue;

    try {
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedEvent.id,
          event: editEvent,
          date: editDate,
          time: formattedTime,
          venue: finalVenue,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      triggerRescheduleSuccess(data, finalVenue);
    } catch (err: any) {
      const mockUpdated = {
        id: selectedEvent.id,
        event: editEvent,
        date: editDate,
        time: formattedTime,
        venue: finalVenue
      };
      triggerRescheduleSuccess(mockUpdated, finalVenue);
    }
  };

  const triggerRescheduleSuccess = (data: any, finalVenue: string) => {
    setIsEditing(false);
    setSelectedEvent(null);
    
    const targetedRoles: string[] = [];
    if (notifyRescheduleStudents) targetedRoles.push('Student');
    if (notifyRescheduleFaculty) targetedRoles.push('Faculty');
    if (notifyRescheduleScholars) targetedRoles.push('Research Scholar');

    onEventRescheduled(
      data, 
      `rescheduled to ${editDate} at ${editTime} (${finalVenue})`,
      targetedRoles
    );
    setLoading(false);
  };

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15 shadow-sm relative transition-colors duration-300">
      
      {/* Calendar Component */}
      <div className="calendar-container text-xs text-slate-800 dark:text-slate-300 font-sans">
        <style>{`
          .fc-header-toolbar {
            margin-bottom: 1.5rem !important;
          }
          .fc-toolbar-title {
            font-size: 1.1rem !important;
            font-family: var(--font-display), 'Outfit', sans-serif !important;
            font-weight: 800 !important;
            color: hsl(var(--foreground)) !important;
          }
          .fc-button {
            background: hsl(var(--card)) !important;
            border: 1px solid hsl(var(--border)) !important;
            color: #800020 !important;
            font-weight: 700 !important;
            font-size: 0.75rem !important;
            border-radius: 0.5rem !important;
            padding: 0.4rem 0.8rem !important;
            text-transform: uppercase !important;
          }
          .dark .fc-button {
            color: #d4af37 !important;
          }
          .fc-button:hover {
            background: hsl(var(--secondary)) !important;
            color: hsl(var(--foreground)) !important;
          }
          .fc-button-active {
            background: #800020 !important;
            color: #fff !important;
          }
          .dark .fc-button-active {
            background: #d4af37 !important;
            color: #000 !important;
          }
          .fc-daygrid-day {
            background: hsl(var(--card) / 0.3) !important;
            border: 1px solid hsl(var(--border) / 0.4) !important;
          }
          .fc-day-today {
            background: hsl(var(--primary) / 0.04) !important;
          }
          .fc-col-header-cell-cushion {
            color: hsl(var(--muted-foreground)) !important;
            font-size: 0.75rem !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            padding: 0.5rem 0 !important;
          }
          .fc-daygrid-day-number {
            color: hsl(var(--muted-foreground)) !important;
            font-weight: 600 !important;
            font-size: 0.75rem !important;
            padding: 0.4rem !important;
          }
          .fc-theme-standard td, .fc-theme-standard th {
            border: 1px solid hsl(var(--border) / 0.4) !important;
          }
        `}</style>
        
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '',
          }}
          events={calendarEvents}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          editable={true} 
          eventDrop={handleEventDrop} 
          height="auto"
          selectable={false}
          dayMaxEvents={3}
        />
      </div>

      {/* Details / Reschedule Modal Overlay */}
      {selectedEvent && (
        <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/60 backdrop-blur-sm rounded-2xl flex items-center justify-center p-6 z-30 animate-fadeIn">
          <div className="bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 relative transform scale-100 transition-all duration-300">
            {/* Close Modal Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-750 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* HEADER */}
            <div className="flex items-center space-x-3 mb-4 text-left">
              <div className="bg-srm-crimson/5 dark:bg-srm-gold/5 p-2.5 rounded-xl text-srm-crimson dark:text-srm-gold shrink-0 border border-srm-crimson/10 dark:border-srm-gold/15">
                <CalendarIcon className="w-5 h-5 shrink-0" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-black text-srm-crimson dark:text-srm-gold uppercase tracking-widest bg-srm-crimson/10 dark:bg-srm-gold/10 border border-srm-crimson/20 dark:border-srm-gold/20 px-2 py-0.5 rounded-md leading-none block w-fit">
                  {isEditing ? 'Reschedule Event' : 'Event Details'}
                </span>
                <h3 className="text-sm font-black text-slate-850 dark:text-white tracking-tight leading-snug mt-1.5 truncate max-w-[180px]">
                  {isEditing ? 'Update Schedule' : selectedEvent.event}
                </h3>
              </div>
            </div>

            {/* EDIT VIEW */}
            {isEditing ? (
              <form onSubmit={handleRescheduleSubmit} className="space-y-3.5 border-t border-slate-100 dark:border-slate-850 pt-4 text-left">
                {error && (
                  <p className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded-lg border border-red-200 dark:border-red-900/30">{error}</p>
                )}

                {/* Event Title */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Event Name</label>
                  <input
                    type="text"
                    value={editEvent}
                    onChange={(e) => setEditEvent(e.target.value)}
                    className="w-full px-3 py-2 glass-input text-xs font-semibold rounded-lg"
                  />
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 glass-input text-xs font-semibold rounded-lg animate-none"
                  />
                </div>

                {/* Time */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Time</label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full px-3 py-2 glass-input text-xs font-semibold rounded-lg cursor-pointer"
                  />
                </div>

                {/* Venue Select Dropdown */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Venue</label>
                  <select
                    value={selectedEditVenue}
                    onChange={(e) => setSelectedEditVenue(e.target.value)}
                    className="w-full px-3 py-2 glass-input text-xs font-semibold rounded-lg cursor-pointer text-slate-700 dark:text-slate-350"
                  >
                    <option value="" disabled className="bg-slate-50 dark:bg-slate-950">Select Venue...</option>
                    {CAMPUS_VENUES.map(v => (
                      <option key={v} value={v} className="bg-white dark:bg-slate-950 text-slate-805 dark:text-white">{v}</option>
                    ))}
                    <option value="custom" className="bg-white dark:bg-slate-950 text-srm-crimson dark:text-srm-gold">✍️ Add Custom Venue...</option>
                  </select>
                </div>

                {/* Custom Venue Input Area (animates in when selected) */}
                {selectedEditVenue === 'custom' && (
                  <div className="space-y-1 animate-fadeIn">
                    <label className="text-[9px] font-black text-srm-crimson dark:text-srm-gold uppercase tracking-wider block">
                      Specify Custom Venue / Room
                    </label>
                    <input
                      type="text"
                      value={customEditVenue}
                      onChange={(e) => setCustomEditVenue(e.target.value)}
                      placeholder="e.g. Room 602, PG Block"
                      className="w-full px-3 py-2 glass-input text-xs font-semibold rounded-lg"
                    />
                  </div>
                )}

                {/* Target Audience Dynamic Role Notifications Selection */}
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-srm-crimson dark:text-srm-gold uppercase tracking-widest block">
                      🔔 Targeted Alerts Target
                    </span>
                    <span className="text-[8px] text-white bg-srm-crimson px-1.5 py-0.5 rounded font-black uppercase tracking-wider leading-none">
                      targeted
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-450 dark:text-slate-550 font-bold leading-none mb-1">
                    Select roles to dispatch rescheduling alerts:
                  </p>
                  <div className="grid grid-cols-1 gap-1.5 pt-0.5">
                    <label className="flex items-center space-x-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-xl p-1.5 hover:border-slate-350 dark:hover:border-slate-750 transition cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={notifyRescheduleStudents}
                        onChange={(e) => setNotifyRescheduleStudents(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-srm-blue bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 focus:ring-srm-blue focus:ring-2 transition"
                      />
                      <span className="text-[10px] text-slate-655 dark:text-slate-400 font-semibold">Students (@srmist.edu.in)</span>
                    </label>

                    <label className="flex items-center space-x-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-xl p-1.5 hover:border-slate-350 dark:hover:border-slate-750 transition cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={notifyRescheduleFaculty}
                        onChange={(e) => setNotifyRescheduleFaculty(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-srm-blue bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 focus:ring-srm-blue focus:ring-2 transition"
                      />
                      <span className="text-[10px] text-slate-655 dark:text-slate-400 font-semibold">Faculty (@srmist.edu.in)</span>
                    </label>

                    <label className="flex items-center space-x-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-xl p-1.5 hover:border-slate-350 dark:hover:border-slate-750 transition cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={notifyRescheduleScholars}
                        onChange={(e) => setNotifyRescheduleScholars(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-srm-blue bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 focus:ring-srm-blue focus:ring-2 transition"
                      />
                      <span className="text-[10px] text-slate-655 dark:text-slate-400 font-semibold">PhD Scholars (@srmist.edu.in)</span>
                    </label>
                  </div>
                </div>

                {/* Edit Actions */}
                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-305 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 srm-gradient text-white rounded-xl font-black text-xs uppercase tracking-wider shadow flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5 shrink-0" />
                    <span>{loading ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* DETAILS VIEW */
              <div className="space-y-3.5 border-t border-slate-100 dark:border-slate-850 pt-4 text-left">
                {/* Date */}
                <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                  <div className="text-srm-crimson dark:text-srm-gold shrink-0">
                    <CalendarIcon className="w-4.5 h-4.5 shrink-0" />
                  </div>
                  <div className="text-xs truncate">
                    <p className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Date</p>
                    <p className="font-bold text-slate-750 dark:text-slate-300">{selectedEvent.date}</p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                  <div className="text-srm-crimson dark:text-srm-gold shrink-0">
                    <Clock className="w-4.5 h-4.5 shrink-0" />
                  </div>
                  <div className="text-xs truncate">
                    <p className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Time</p>
                    <p className="font-bold text-slate-750 dark:text-slate-300">{selectedEvent.time}</p>
                  </div>
                </div>

                {/* Venue */}
                <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                  <div className="text-srm-crimson dark:text-srm-gold shrink-0">
                    <MapPin className="w-4.5 h-4.5 shrink-0" />
                  </div>
                  <div className="text-xs truncate">
                    <p className="text-[9px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Venue</p>
                    <p className="font-bold text-slate-750 dark:text-slate-300 truncate max-w-[240px]">{selectedEvent.venue}</p>
                  </div>
                </div>

                {/* Detail View Actions */}
                <div className="flex space-x-2 mt-6 pt-2 border-t border-slate-100 dark:border-slate-850/50">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-305 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleEventDelete}
                    disabled={loading}
                    className="flex-1 py-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-1 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 py-2 srm-gradient text-white rounded-xl font-bold text-xs shadow flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 shrink-0" />
                    <span>Update</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
