'use client';

import React, { useState, useEffect } from 'react';
import EventForm, { CAMPUS_VENUES } from '@/components/EventForm';
import dynamic from 'next/dynamic';
const CalendarView = dynamic(() => import('@/components/CalendarView'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl h-[450px] w-full flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider">Loading Calendar Hub...</div>,
});
import { useStore } from '@/store/useStore';
import { Event } from '@srm-recollab/types';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  RefreshCw, 
  Bell, 
  BellOff,
  Sparkles,
  Search,
  School,
  GraduationCap,
  Users,
  X,
  Mail,
  Terminal,
  Send,
  CheckCircle2,
  Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SiteNotification {
  id: string;
  text: string;
  time: string;
  type: 'add' | 'reschedule';
  read: boolean;
}

const EMAIL_TEMPLATES = [
  {
    name: 'PhD Viva Defense',
    sender: 'hod.cse@srmist.edu.in',
    subject: 'Schedule Request: PhD Defense for Suresh Karthik',
    body: 'Dear Recollab Team,\n\nPlease schedule a PhD Defense for Suresh Karthik.\nTopic: PEFT Optimization for Multimodal Models\nDate: 2026-06-04\nTime: 10:00 AM\nVenue: ECE Seminar Hall (PG Block)\n\nTarget alert roles: Research Scholar, Faculty.'
  },
  {
    name: 'Research Grant Review',
    sender: 'dean.research@srmist.edu.in',
    subject: 'Urgent: DST-SERB Proposal Assessment Meeting',
    body: 'Dear colleagues,\n\nWe must coordinate a review panel for upcoming SERB grant applications.\nDate: 2026-06-03\nTime: 09:30 AM\nVenue: Biotech Conference Room\n\nPlease notify all Faculty PIs.'
  },
  {
    name: 'Department Seminar',
    sender: 'dr.priya@srmist.edu.in',
    subject: 'Academic Seminar: Genomics & Bioinformatics Sequence Alignment',
    body: 'Hi Recollab Calendar,\n\nI would like to host a guest lecture on DNA functionalization.\nDate: 2026-06-06\nTime: 11:15 AM\nVenue: Main Auditorium (Administrative Block)\n\nOpen to all students and faculty.'
  }
];

export default function EventsHubPage() {
  const { events, fetchEvents, createEvent, updateEvent, deleteEvent, isLoading } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  // 🤖 AI Email Agent & Inbox States
  const [emails, setEmails] = useState<any[]>([
    {
      id: 'email-1',
      sender: 'dean.research@srmist.edu.in',
      subject: 'Schedule Request: DST-SERB Proposal Assessment Meeting',
      body: 'Dear colleagues,\n\nWe must coordinate a review panel for upcoming SERB grant applications.\nDate: 2026-06-03\nTime: 09:30 AM\nVenue: Biotech Conference Room\n\nPlease notify all Faculty PIs.',
      dateReceived: '10 mins ago',
      status: 'unread'
    },
    {
      id: 'email-2',
      sender: 'hod.cse@srmist.edu.in',
      subject: 'Schedule Request: PhD Defense for Suresh Karthik',
      body: 'Dear Recollab Team,\n\nPlease schedule a PhD Defense for Suresh Karthik.\nTopic: PEFT Optimization for Multimodal Models\nDate: 2026-06-04\nTime: 10:00 AM\nVenue: ECE Seminar Hall (PG Block)\n\nTarget alert roles: Research Scholar, Faculty.',
      dateReceived: '1 hour ago',
      status: 'unread'
    }
  ]);

  const [emailCompose, setEmailCompose] = useState({
    sender: 'hod.cse@srmist.edu.in',
    subject: 'Schedule Request: PhD Defense for Suresh Karthik',
    body: 'Dear Recollab Team,\n\nPlease schedule a PhD Defense for Suresh Karthik.\nTopic: PEFT Optimization for Multimodal Models\nDate: 2026-06-04\nTime: 10:00 AM\nVenue: ECE Seminar Hall (PG Block)\n\nTarget alert roles: Research Scholar, Faculty.'
  });

  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [activeEmailId, setActiveEmailId] = useState<string | null>(null);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<string>('0');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [venueSearchQuery, setVenueSearchQuery] = useState('');

  // User directory simulation states
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([
    { id: 'ru-1', name: 'Dr. Anand Ramachandran', email: 'dr.anand@srmist.edu.in', role: 'Faculty' },
    { id: 'ru-2', name: 'Suresh Karthik', email: 'scholar.suresh@srmist.edu.in', role: 'Research Scholar' },
    { id: 'ru-3', name: 'Divya Nambiar', email: 'scholar.divya@srmist.edu.in', role: 'Research Scholar' }
  ]);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'Student' });
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Notifications State
  const [notifications, setNotifications] = useState<SiteNotification[]>([
    {
      id: 'init-1',
      text: '📚 Event Manager Portal initialized for SRM University Intranet.',
      time: 'Just now',
      type: 'add',
      read: false
    }
  ]);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const [selectedEventForRescheduling, setSelectedEventForRescheduling] = useState<Event | null>(null);

  // Load events
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // 🤖 AI Email Agent Action Handlers
  const handleSendMockEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailCompose.sender || !emailCompose.subject || !emailCompose.body) {
      alert('Please fill out all email fields.');
      return;
    }
    const newEmail = {
      id: `email-${Date.now()}`,
      sender: emailCompose.sender.trim(),
      subject: emailCompose.subject.trim(),
      body: emailCompose.body,
      dateReceived: 'Just now',
      status: 'unread'
    };
    setEmails(prev => [newEmail, ...prev]);
    setEmailCompose({
      sender: 'scholar.suresh@srmist.edu.in',
      subject: '',
      body: ''
    });
    setSelectedTemplateIndex('');
    triggerNotification(`Incoming mock email delivered to recollab@srmist.edu.in from ${newEmail.sender}!`, 'add');
  };

  const handleTemplateChange = (indexStr: string) => {
    setSelectedTemplateIndex(indexStr);
    if (indexStr === '') return;
    const idx = parseInt(indexStr);
    const template = EMAIL_TEMPLATES[idx];
    if (template) {
      setEmailCompose({
        sender: template.sender,
        subject: template.subject,
        body: template.body
      });
    }
  };

  const handleProcessEmailWithAI = async (emailId: string) => {
    const targetEmail = emails.find(e => e.id === emailId);
    if (!targetEmail || isAgentRunning) return;

    setIsAgentRunning(true);
    setActiveEmailId(emailId);
    setAgentLogs([]);
    setSelectedEmail(targetEmail);

    const addLog = (log: string) => {
      setAgentLogs(prev => [...prev, log]);
    };

    setTimeout(() => {
      addLog(`[${new Date().toLocaleTimeString()}] 📨 SMTP: Received packet payload for <${targetEmail.sender}>...`);
    }, 400);

    setTimeout(() => {
      addLog(`[${new Date().toLocaleTimeString()}] 🧠 AI AGENT: Initializing LLM Sequence Parser...`);
    }, 1200);

    setTimeout(() => {
      addLog(`[${new Date().toLocaleTimeString()}] 🔎 AI AGENT: Extracting coordinate parameters from unstructured body...`);
    }, 2000);

    setTimeout(async () => {
      const body = targetEmail.body;
      const subject = targetEmail.subject;

      // Real regex extraction logic
      const dateRegex = /Date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i;
      const dateMatch = body.match(dateRegex);
      const parsedDate = dateMatch ? dateMatch[1].trim() : new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const timeRegex = /Time:\s*([0-9]{2}:[0-9]{2}\s*[AP]M)/i;
      const timeMatch = body.match(timeRegex);
      const parsedTime = timeMatch ? timeMatch[1].trim() : '10:00 AM';

      let parsedVenue = 'ECE Seminar Hall (PG Block)';
      for (const venue of CAMPUS_VENUES) {
        const baseName = venue.split('(')[0].trim().toLowerCase();
        if (body.toLowerCase().includes(baseName)) {
          parsedVenue = venue;
          break;
        }
      }

      addLog(`[${new Date().toLocaleTimeString()}] ✓ EXTRACTED COORDINATES:`);
      addLog(`    Event Title: "${subject}"`);
      addLog(`    Target Date: ${parsedDate}`);
      addLog(`    Target Time: ${parsedTime}`);
      addLog(`    Target Venue: ${parsedVenue}`);

      setTimeout(() => {
        addLog(`[${new Date().toLocaleTimeString()}] 💾 DATABASE: Auto-registering new Calendar event record in store...`);
      }, 800);

      setTimeout(async () => {
        try {
          const newEvent = await createEvent(subject, parsedDate, parsedTime, parsedVenue);
          
          addLog(`[${new Date().toLocaleTimeString()}] 📢 BROADCAST: Dispatching broadcast notifications to Intranet users...`);
          
          setTimeout(() => {
            // Update email status
            setEmails(prev => prev.map(e => e.id === emailId ? { ...e, status: 'scheduled' } : e));
            // Trigger toast
            triggerNotification(`🤖 AI Email Agent successfully scheduled: "${subject}"! Broadcasts dispatched to all users & apps.`, 'add');
            addLog(`[${new Date().toLocaleTimeString()}] ✓ SUCCESS: AI Agent pipeline completed. Mark email as [Scheduled].`);
            setIsAgentRunning(false);
          }, 800);

        } catch (err) {
          addLog(`[${new Date().toLocaleTimeString()}] ❌ ERROR: Failed to register event in database.`);
          setIsAgentRunning(false);
        }
      }, 1600);

    }, 2800);
  };

  // Sign up registered SRM user in simulation directory
  const handleUserRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess(false);
    setUsersLoading(true);

    if (!newUserForm.name.trim() || !newUserForm.email.trim()) {
      setUsersLoading(false);
      return setUserError('Name and email are required.');
    }

    let targetEmail = newUserForm.email.trim().toLowerCase();
    if (!targetEmail.includes('@')) {
      targetEmail = `${targetEmail}@srmist.edu.in`;
    }

    if (!targetEmail.endsWith('@srmist.edu.in')) {
      setUsersLoading(false);
      return setUserError('Access Restricted: Domain must be @srmist.edu.in');
    }

    setTimeout(() => {
      const newUser = {
        id: `ru-${Date.now()}`,
        name: newUserForm.name.trim(),
        email: targetEmail,
        role: newUserForm.role
      };
      setRegisteredUsers(prev => [newUser, ...prev]);
      setUserSuccess(true);
      setNewUserForm({ name: '', email: '', role: 'Student' });
      setUsersLoading(false);
      setTimeout(() => setUserSuccess(false), 4000);
    }, 400);
  };

  const getVenueStatus = (venueName: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const eventToday = events.find(e => e.venue === venueName && e.date === todayStr);
    if (eventToday) {
      return {
        status: 'Booked',
        detail: `Today: "${eventToday.event}" at ${eventToday.time}`
      };
    }
    
    const upcomingEvents = events
      .filter(e => e.venue === venueName && new Date(e.date).getTime() >= new Date().setHours(0,0,0,0))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    if (upcomingEvents.length > 0) {
      const next = upcomingEvents[0];
      return {
        status: 'Reserved',
        detail: `Next: ${next.date} (${next.time})`
      };
    }
    
    return {
      status: 'Available',
      detail: 'No active bookings'
    };
  };

  const handleSyncData = async () => {
    setRefreshing(true);
    await fetchEvents(true);
    setRefreshing(false);
  };

  const triggerNotification = (text: string, type: 'add' | 'reschedule') => {
    setActiveToast(text);
    setTimeout(() => setActiveToast(null), 5000);

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setNotifications(prev => [
      {
        id: Math.random().toString(),
        text,
        time: formattedTime,
        type,
        read: false
      },
      ...prev
    ]);
  };

  const handleEventAdded = async (newEvent: Event, targetedRoles: string[]) => {
    const matchingUsers = registeredUsers.filter(u => targetedRoles.includes(u.role));
    const matchingEmails = matchingUsers.map(u => u.email);
    
    let noticeText = `🎉 New Event: "${newEvent.event}" on ${newEvent.date} at ${newEvent.time}.`;
    if (targetedRoles.length > 0) {
      noticeText += ` 🔔 Targeted alerts target roles: ${targetedRoles.join(', ')}.`;
      if (matchingEmails.length > 0) {
        noticeText += ` Dispatched targeting emails to: ${matchingEmails.join(', ')}`;
      } else {
        noticeText += ` (0 registered users match selected target roles)`;
      }
    } else {
      noticeText += ` 🔕 (Silent schedule - no notification selected)`;
    }
    triggerNotification(noticeText, 'add');

    if (matchingEmails.length > 0) {
      setActiveToast(`📬 Targeted email alerts successfully dispatched to SRM users: ${matchingEmails.join(', ')}`);
    }
  };

  const handleEventRescheduled = async (updatedEvent: Event, changeDetails: string, targetedRoles: string[]) => {
    await updateEvent(updatedEvent.id, updatedEvent.event, updatedEvent.date, updatedEvent.time, updatedEvent.venue);
    
    const matchingUsers = registeredUsers.filter(u => targetedRoles.includes(u.role));
    const matchingEmails = matchingUsers.map(u => u.email);
    
    let noticeText = `🔄 Rescheduled: "${updatedEvent.event}" is now on ${updatedEvent.date} at ${updatedEvent.time}.`;
    if (targetedRoles.length > 0) {
      noticeText += ` 🔔 Rescheduling alerts target roles: ${targetedRoles.join(', ')}.`;
      if (matchingEmails.length > 0) {
        noticeText += ` Dispatched targeting emails to: ${matchingEmails.join(', ')}`;
      } else {
        noticeText += ` (0 registered users match selected target roles)`;
      }
    } else {
      noticeText += ` 🔕 (Silent reschedule - no notification selected)`;
    }
    triggerNotification(noticeText, 'reschedule');

    if (matchingEmails.length > 0) {
      setActiveToast(`📬 Rescheduling notification targeted to SRM users: ${matchingEmails.join(', ')}`);
    }
  };

  const handleEventDeleted = async (deletedEvent: Event) => {
    await deleteEvent(deletedEvent.id);
    const noticeText = `🗑️ Event Deleted: "${deletedEvent.event}" has been permanently removed.`;
    triggerNotification(noticeText, 'reschedule');
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredEvents = events.filter((ev) => {
    const titleLower = ev.event.toLowerCase();
    const venueLower = ev.venue.toLowerCase();
    const queryLower = searchQuery.toLowerCase();
    const matchesSearch = titleLower.includes(queryLower) || venueLower.includes(queryLower);
    
    if (selectedFilter === 'All') return matchesSearch;
    if (selectedFilter === 'PhD') {
      return matchesSearch && (titleLower.includes('phd') || titleLower.includes('viva') || titleLower.includes('defense') || titleLower.includes('thesis'));
    }
    if (selectedFilter === 'Seminar') {
      return matchesSearch && (titleLower.includes('seminar') || titleLower.includes('colloquium') || titleLower.includes('workshop'));
    }
    return matchesSearch;
  });

  const phdCount = events.filter(e => {
    const t = e.event.toLowerCase();
    return t.includes('phd') || t.includes('viva') || t.includes('defense') || t.includes('thesis');
  }).length;
  const seminarCount = events.filter(e => {
    const t = e.event.toLowerCase();
    return t.includes('seminar') || t.includes('colloquium') || t.includes('workshop');
  }).length;

  return (
    <div className="space-y-8 relative selection:bg-srm-gold selection:text-black select-none text-left">
      
      {/* 🚀 Toast Notifications */}
      <AnimatePresence>
        {activeToast && (
          <motion.div 
            initial={{ opacity: 0, x: 50, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed top-24 right-6 z-50 max-w-sm w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-2xl shadow-2xl p-4 flex items-start space-x-3"
          >
            <div className="bg-srm-crimson dark:bg-srm-gold p-2 rounded-xl text-white dark:text-black mt-0.5 animate-pulse shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs text-left">
              <p className="font-black text-srm-crimson dark:text-srm-gold uppercase tracking-widest text-[9px] mb-0.5 animate-pulse">SRM Bulletin</p>
              <p className="font-semibold text-slate-700 dark:text-slate-100 leading-snug">{activeToast}</p>
            </div>
            <button 
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-slate-100 dark:border-slate-855 pb-5 text-left">
        <div>
          <span className="text-[10px] font-black text-srm-crimson dark:text-srm-gold uppercase tracking-widest flex items-center gap-1.5">
            <School className="w-4 h-4 text-srm-crimson dark:text-srm-gold" />
            <span>SRM University Collaborative Intellect</span>
          </span>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-905 dark:text-white mt-1.5">
            Research Nexus Events Hub
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
            Real-time campus coordinate mapping for PhD defenses, seminars, colloquiums, and shared workshops.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0 self-start sm:self-center">
          <button
            onClick={handleSyncData}
            disabled={isLoading || refreshing}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:text-slate-900 dark:hover:text-white hover:border-slate-350 dark:hover:border-slate-750 transition duration-200 text-xs font-bold disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Database'}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setShowBellDropdown(!showBellDropdown);
                handleMarkAllRead();
              }}
              className={`p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition relative cursor-pointer ${showBellDropdown ? 'bg-srm-crimson/5 dark:bg-srm-gold/5 border-srm-crimson/30 dark:border-srm-gold/30 text-srm-crimson dark:text-srm-gold shadow-inner' : ''}`}
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-srm-crimson dark:bg-srm-gold rounded-full border border-white dark:border-slate-950 animate-pulse"></span>
              )}
            </button>

            {/* Notification Dropdown Flyout */}
            <AnimatePresence>
              {showBellDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2 mb-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center space-x-1">
                      <Bell className="w-3.5 h-3.5 text-srm-crimson dark:text-srm-gold mr-1" />
                      <span>Activity Log</span>
                      {unreadCount > 0 && (
                        <span className="text-[9px] bg-srm-crimson/10 text-srm-crimson dark:bg-srm-gold/10 dark:text-srm-gold px-1.5 py-0.5 rounded-full font-bold ml-1">
                          {unreadCount} new
                        </span>
                      )}
                    </span>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearNotifications}
                        className="text-[9px] text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold transition cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
                        <BellOff className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                        <p className="font-bold text-slate-700 dark:text-slate-400">No recent alerts</p>
                        <p className="text-[10px] text-slate-450 dark:text-slate-550 mt-0.5 leading-relaxed">Your schedule is fully synchronized.</p>
                      </div>
                    ) : (
                      notifications.map(noti => (
                        <div 
                          key={noti.id} 
                          className={`p-2.5 rounded-xl text-[11px] flex items-start space-x-2 border transition ${noti.read ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-150 dark:border-slate-900' : 'bg-srm-crimson/5 dark:bg-srm-gold/5 border-srm-crimson/10 dark:border-srm-gold/15 font-medium'}`}
                        >
                          <div className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${noti.type === 'add' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-srm-crimson/5 dark:bg-srm-blue/20 text-srm-crimson dark:text-srm-gold'}`}>
                            {noti.type === 'add' ? <Sparkles className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex-1 leading-normal text-left">
                            <p className="text-slate-650 dark:text-slate-350 font-medium">{noti.text}</p>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block mt-1">{noti.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Statistics Banner */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900/15 border border-slate-200 dark:border-slate-800 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center border-l-4 border-srm-crimson dark:border-srm-gold gap-6 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-srm-blue/[0.01] to-transparent -z-10" />
        <div className="text-left space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[9px] bg-srm-crimson/10 text-srm-crimson dark:bg-srm-gold/10 dark:text-srm-gold font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-srm-crimson/20 dark:border-srm-gold/20 leading-none">
              SRM Intranet Node
            </span>
            <span className="text-[9px] bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider leading-none">
              Verification Active
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">Campus Scheduling Center</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xl font-medium">
            Coordinate interdisciplinary seminars, PhD viva defenses, and equipment share workshops. Pinned entries populate the global grid immediately.
          </p>
        </div>

        <div className="flex space-x-4 shrink-0 w-full sm:w-auto">
          <div className="text-center p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-2xl flex-1 sm:flex-initial min-w-[80px]">
            <p className="text-lg font-black text-srm-crimson dark:text-srm-gold">{phdCount}</p>
            <p className="text-[8px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest mt-1.5">PhD Defense</p>
          </div>
          <div className="text-center p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-2xl flex-1 sm:flex-initial min-w-[80px]">
            <p className="text-lg font-black text-srm-crimson dark:text-srm-gold">{seminarCount}</p>
            <p className="text-[8px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest mt-1.5">Colloquiums</p>
          </div>
          <div className="text-center p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-2xl flex-1 sm:flex-initial min-w-[80px]">
            <p className="text-lg font-black text-slate-805 dark:text-white">{events.length}</p>
            <p className="text-[8px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest mt-1.5">Total Pinned</p>
          </div>
        </div>
      </div>

      {/* 🤖 AI EMAIL AGENT & INTRANET INBOX GATEWAY */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15 shadow-sm text-left space-y-6">
        
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
          <div className="flex items-center space-x-3 text-slate-905 dark:text-white">
            <div className="bg-srm-crimson/5 dark:bg-srm-gold/5 p-2 rounded-xl text-srm-crimson dark:text-srm-gold border border-srm-crimson/10 dark:border-srm-gold/15 shrink-0 animate-pulse">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-150 leading-none">
                AI Email Agent & Project Inbox
              </h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Address Gateway: recollab@srmist.edu.in</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-1.5 rounded-xl">
            <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">AI Agent Status:</span>
            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md leading-none ${isAgentRunning ? 'bg-srm-blue/10 text-srm-blue animate-pulse' : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'}`}>
              {isAgentRunning ? 'Processing Request...' : 'Online & Idling'}
            </span>
          </div>
        </div>

        {/* Triple Column Grid Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Column 1: Compose Simulator (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50/40 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-850/60 p-4 rounded-2xl space-y-4">
            <div>
              <span className="text-[9px] font-black text-srm-crimson dark:text-srm-gold uppercase tracking-wider block mb-2">
                ✉️ Dispatch Mock Request to recollab@srmist.edu.in
              </span>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mb-3 leading-relaxed">
                Choose a preloaded template to test real-time coordinate parsing, or edit fields manually to send a custom email.
              </p>
              
              <div className="space-y-3">
                {/* Template Selector */}
                <div>
                  <label className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Load Coordinate Template</label>
                  <select
                    value={selectedTemplateIndex}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold rounded-lg cursor-pointer text-slate-700 dark:text-slate-350 focus:outline-none"
                  >
                    <option value="" className="bg-white dark:bg-slate-950">Select Template...</option>
                    {EMAIL_TEMPLATES.map((t, idx) => (
                      <option key={idx} value={idx.toString()} className="bg-white dark:bg-slate-950">{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sender Email */}
                <div>
                  <label className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Sender Faculty/HOD Email</label>
                  <input
                    type="email"
                    placeholder="hod@srmist.edu.in"
                    value={emailCompose.sender}
                    onChange={(e) => setEmailCompose({ ...emailCompose, sender: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 text-[10px] font-semibold rounded-lg focus:outline-none focus:border-srm-crimson dark:focus:border-srm-gold"
                  />
                </div>

                {/* Subject / Event Title */}
                <div>
                  <label className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Email Subject / Event Title</label>
                  <input
                    type="text"
                    placeholder="Event Title"
                    value={emailCompose.subject}
                    onChange={(e) => setEmailCompose({ ...emailCompose, subject: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 text-[10px] font-semibold rounded-lg focus:outline-none focus:border-srm-crimson dark:focus:border-srm-gold"
                  />
                </div>

                {/* Email Body */}
                <div>
                  <label className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Email Message Body</label>
                  <textarea
                    rows={4}
                    placeholder="Describe dates, times, and venues here..."
                    value={emailCompose.body}
                    onChange={(e) => setEmailCompose({ ...emailCompose, body: e.target.value })}
                    className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 text-[10px] font-semibold rounded-lg focus:outline-none focus:border-srm-crimson dark:focus:border-srm-gold leading-relaxed font-sans"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSendMockEmail}
              className="w-full py-2.5 srm-gradient text-white rounded-xl font-black text-[9px] uppercase tracking-wider shadow hover:opacity-95 active:scale-[0.98] transition cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5 shrink-0" />
              <span>Dispatch Mock Email</span>
            </button>
          </div>

          {/* Column 2: Inbox Feed (lg:col-span-4) */}
          <div className="lg:col-span-4 bg-slate-50/40 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-855 p-4 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="flex-1 flex flex-col">
              <span className="text-[9px] font-black text-srm-crimson dark:text-srm-gold uppercase tracking-wider block mb-2 flex items-center justify-between">
                <span>📬 Intranet Inbox recollab@srmist.edu.in</span>
                <span className="text-[8px] bg-slate-200 dark:bg-slate-850 text-slate-505 dark:text-slate-400 px-1.5 py-0.5 rounded font-black">{emails.length} Messages</span>
              </span>
              
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-1">
                {emails.map((email) => {
                  const isSelected = selectedEmail?.id === email.id;
                  return (
                    <div
                      key={email.id}
                      onClick={() => {
                        setSelectedEmail(email);
                        if (email.status === 'unread' && !isAgentRunning) {
                          setAgentLogs([`[recollab-agent@srmist:~$] Selected email: "${email.subject}". Ready to process.`]);
                        }
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition duration-150 ${isSelected ? 'bg-white dark:bg-slate-900 border-srm-crimson dark:border-srm-gold shadow-sm' : 'bg-white/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-850 hover:bg-white dark:hover:bg-slate-900'}`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <span className="text-[8px] font-bold text-slate-450 dark:text-slate-550 truncate max-w-[120px]">{email.sender}</span>
                        <span className="text-[8px] text-slate-400 shrink-0">{email.dateReceived}</span>
                      </div>
                      <h4 className="font-bold text-slate-805 dark:text-white text-[10px] leading-snug truncate mb-2">{email.subject}</h4>
                      
                      <div className="flex justify-between items-center">
                        <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded ${
                          email.status === 'unread' 
                            ? 'bg-amber-100 dark:bg-amber-950/45 text-amber-700 dark:text-amber-400 border border-amber-200/50' 
                            : 'bg-emerald-100 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-400 border border-emerald-250/50'
                        }`}>
                          {email.status === 'unread' ? 'Unread Queue' : 'Auto-Scheduled'}
                        </span>
                        
                        {email.status === 'unread' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProcessEmailWithAI(email.id);
                            }}
                            disabled={isAgentRunning}
                            className="px-2 py-1 bg-srm-crimson/5 dark:bg-srm-gold/5 border border-srm-crimson/25 dark:border-srm-gold/25 hover:bg-srm-crimson dark:hover:bg-srm-gold text-srm-crimson dark:text-srm-gold hover:text-white rounded text-[8px] font-black uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                          >
                            Run AI Agent
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Active email details preview snippet */}
            {selectedEmail && (
              <div className="p-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-xl text-xs space-y-1">
                <p className="font-bold text-slate-805 dark:text-white text-[9px] truncate">Preview: "{selectedEmail.subject}"</p>
                <p className="text-[8px] text-slate-500 leading-relaxed line-clamp-2 whitespace-pre-wrap font-medium">{selectedEmail.body}</p>
              </div>
            )}
          </div>

          {/* Column 3: AI Live Console thought stream (lg:col-span-4) */}
          <div className="lg:col-span-4 bg-slate-950 border border-slate-850/85 p-4 rounded-2xl flex flex-col justify-between text-left relative overflow-hidden min-h-[350px]">
            <div className="absolute inset-0 bg-gradient-to-b from-green-500/[0.01] to-transparent pointer-events-none -z-10" />
            
            <div className="flex-1 flex flex-col space-y-2">
              <span className="text-[9px] font-black text-green-500 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>AI Agent Pipeline Live Terminal</span>
              </span>
              
              <div className="flex-1 bg-black/40 border border-slate-900 rounded-xl p-3 font-mono text-[9px] text-green-400 space-y-2.5 overflow-y-auto max-h-[250px] leading-relaxed">
                {agentLogs.length === 0 ? (
                  <div className="text-slate-600 h-full flex flex-col justify-center items-center text-center space-y-2 py-8">
                    <Sparkles className="w-8 h-8 text-slate-700 animate-pulse" />
                    <p className="font-bold">AI Agent Standby Node</p>
                    <p className="text-[8px] max-w-xs font-semibold leading-relaxed">Choose an email on the left or select the PhD template, then hit "Run AI Agent" to watch real-time entity coordinate processing.</p>
                  </div>
                ) : (
                  agentLogs.map((log, idx) => (
                    <p key={idx} className="whitespace-pre-wrap select-text">{log}</p>
                  ))
                )}
                
                {isAgentRunning && (
                  <div className="flex items-center space-x-1.5 text-green-500 font-bold uppercase tracking-wider animate-pulse pt-2 text-[8px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                    <span>Agent is thinking...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Active email details preview snippet */}
            {selectedEmail && selectedEmail.status === 'unread' && !isAgentRunning && (
              <button
                onClick={() => handleProcessEmailWithAI(selectedEmail.id)}
                className="w-full mt-4 py-2 bg-green-950/20 hover:bg-green-950/40 border border-green-500/30 text-green-400 rounded-xl font-black text-[9px] uppercase tracking-wider transition active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Parse Coordinates & Auto-Schedule</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Scheduling Composer & Live Matrix */}
        <div className="lg:col-span-4 space-y-6">
          <EventForm onEventAdded={handleEventAdded} />

          {/* 11-Venue Live Matrix status */}
          <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-3">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
                <div className="bg-srm-crimson/5 dark:bg-srm-gold/5 p-2 rounded-xl text-srm-crimson dark:text-srm-gold shrink-0 border border-srm-crimson/10 dark:border-srm-gold/15">
                  <School className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 leading-none">Venue Matrix</h3>
                  <p className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase mt-1.5">Live room status</p>
                </div>
              </div>
              
              <input
                type="text"
                placeholder="Filter room..."
                value={venueSearchQuery}
                onChange={(e) => setVenueSearchQuery(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:border-srm-crimson dark:focus:border-srm-gold text-[9px] font-semibold rounded-lg w-full sm:w-28 focus:outline-none placeholder-slate-450 dark:placeholder-slate-600 text-slate-700 dark:text-slate-350"
              />
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {CAMPUS_VENUES
                .filter(v => v.toLowerCase().includes(venueSearchQuery.toLowerCase()))
                .map((venueName) => {
                  const statusObj = getVenueStatus(venueName);
                  return (
                    <div 
                      key={venueName} 
                      className="p-2.5 rounded-xl bg-slate-50/40 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition border border-slate-200 dark:border-slate-850/60 flex flex-col space-y-1"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-bold text-slate-800 dark:text-slate-300 text-[10px] leading-tight truncate">{venueName}</p>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                          statusObj.status === 'Available' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/20' 
                            : statusObj.status === 'Booked'
                            ? 'bg-red-100 dark:bg-red-950/45 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/20'
                            : 'bg-amber-100 dark:bg-amber-950/45 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/20'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${
                            statusObj.status === 'Available' ? 'bg-emerald-500' : statusObj.status === 'Booked' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                          }`}></span>
                          <span>{statusObj.status}</span>
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold truncate text-left">
                        {statusObj.detail}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* User simulation directory roster */}
          <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-3">
              <div className="flex items-center space-x-2 text-slate-905 dark:text-white">
                <div className="bg-srm-blue/10 dark:bg-srm-blue/20 p-2 rounded-xl text-srm-crimson dark:text-srm-gold shrink-0 border border-slate-200 dark:border-srm-blue/40">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 leading-none">SRM Registry</h3>
                  <p className="text-[9px] text-slate-455 dark:text-slate-500 font-bold uppercase mt-1.5">Simulated Members</p>
                </div>
              </div>
              
              <input
                type="text"
                placeholder="Filter email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:border-srm-crimson dark:focus:border-srm-gold text-[9px] font-semibold rounded-lg w-full sm:w-28 focus:outline-none placeholder-slate-450 dark:placeholder-slate-600 text-slate-700 dark:text-slate-350"
              />
            </div>

            {/* Signup Form */}
            <form onSubmit={handleUserRegister} className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 space-y-3">
              <span className="text-[9px] font-black text-srm-crimson dark:text-srm-gold uppercase tracking-wider block">
                🔒 Register Member Mock
              </span>
              
              {userError && (
                <p className="text-[9px] font-semibold text-red-650 dark:text-red-400 bg-red-100/50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-900/30">{userError}</p>
              )}
              {userSuccess && (
                <p className="text-[9px] font-semibold text-emerald-650 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/20 p-2 rounded border border-emerald-250 dark:border-emerald-900/30">Member added to roster.</p>
              )}

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 glass-input text-[10px] font-semibold rounded-lg"
                />
                <div className="relative">
                  <input
                    type="text"
                    placeholder="netid@srmist.edu.in"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full pl-2.5 pr-20 py-1.5 glass-input text-[10px] font-semibold rounded-lg"
                  />
                  <span className="absolute inset-y-0 right-2.5 flex items-center text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase select-none">
                    srmist.edu.in
                  </span>
                </div>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full px-2.5 py-1.5 glass-input text-[10px] font-semibold rounded-lg cursor-pointer text-slate-600 dark:text-slate-350"
                >
                  <option value="Student" className="bg-white dark:bg-slate-950">Student</option>
                  <option value="Faculty" className="bg-white dark:bg-slate-950">Faculty</option>
                  <option value="Research Scholar" className="bg-white dark:bg-slate-950">PhD Scholar</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={usersLoading}
                className="w-full py-2 srm-gradient text-white rounded-lg font-black text-[9px] uppercase tracking-wider shadow-sm hover:shadow active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
              >
                {usersLoading ? 'Signing up...' : 'Add simulated user'}
              </button>
            </form>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {registeredUsers
                .filter(u => 
                  u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                  u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
                )
                .map((u) => (
                  <div 
                    key={u.id} 
                    className="p-2.5 rounded-xl bg-slate-50/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                  >
                    <div className="truncate min-w-0 text-left">
                      <p className="font-bold text-slate-800 dark:text-slate-300 text-[10px] leading-tight truncate">{u.name}</p>
                      <p className="text-[9px] text-srm-crimson dark:text-srm-gold font-bold truncate mt-0.5">{u.email}</p>
                    </div>
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 shrink-0">
                      {u.role === 'Research Scholar' ? 'Scholar' : u.role}
                    </span>
                  </div>
                ))}
            </div>
          </div>

        </div>

        {/* Right Side: Interactive Calendar & Upcoming Feed List */}
        <div className="lg:col-span-8 space-y-6">
          <CalendarView 
            events={filteredEvents}
            onEventRescheduled={handleEventRescheduled}
            onEventDeleted={handleEventDeleted}
            selectedEventForRescheduling={selectedEventForRescheduling}
            onClearRescheduleSelection={() => setSelectedEventForRescheduling(null)}
          />

          {/* Dynamic Event Feed List */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/15">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-850 pb-4">
              <div className="flex items-center space-x-2 text-slate-905 dark:text-white">
                <div className="bg-srm-crimson/5 dark:bg-srm-gold/5 p-2 rounded-xl text-srm-crimson dark:text-srm-gold border border-srm-crimson/10 dark:border-srm-gold/15 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 leading-none">Upcoming Event Feed</h3>
                  <p className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase mt-1.5">Filters & Quick Rescheduling</p>
                </div>
              </div>

              {/* Search bar */}
              <div className="relative w-full sm:w-60 shrink-0">
                <input
                  type="text"
                  placeholder="Search rooms, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 rounded-lg glass-input text-[11px] font-semibold"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Filters tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['All', 'PhD', 'Seminar'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer ${
                    selectedFilter === filter
                      ? 'bg-srm-crimson/10 text-srm-crimson border border-srm-crimson/25 dark:bg-srm-gold/10 dark:text-srm-gold dark:border-srm-gold/30'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-450 border border-slate-200 dark:border-slate-850 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {filter === 'All' ? 'Show All' : `${filter} Events`}
                </button>
              ))}
            </div>

            {/* List block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
              {filteredEvents.map((ev) => {
                const isPhD = ev.event.toLowerCase().includes('phd') || ev.event.toLowerCase().includes('viva') || ev.event.toLowerCase().includes('defense') || ev.event.toLowerCase().includes('thesis');
                return (
                  <div
                    key={ev.id}
                    className={`flex justify-between items-center text-xs p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                      isPhD 
                        ? 'bg-srm-crimson/5 border-srm-crimson/15 dark:bg-srm-crimson/[0.02] dark:border-srm-crimson/20 hover:border-srm-crimson' 
                        : 'bg-slate-50/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="truncate pr-3 flex-1 min-w-0 text-left">
                      <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded mb-2 ${
                        isPhD ? 'bg-srm-crimson/10 text-srm-crimson dark:text-red-400 border border-srm-crimson/20' : 'bg-srm-blue/10 text-srm-blue dark:bg-srm-blue/20 dark:text-slate-350 border border-srm-blue/20 dark:border-srm-blue/40'
                      }`}>
                        {isPhD ? 'PhD Event' : 'Colloquium'}
                      </span>
                      
                      <h4 className="font-bold text-slate-800 dark:text-white text-xs leading-snug truncate max-w-[240px]">
                        {ev.event}
                      </h4>

                      <div className="space-y-1 mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                          <span>{ev.date} • {ev.time}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{ev.venue}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedEventForRescheduling(ev)}
                      className="text-[9px] font-black uppercase text-srm-crimson dark:text-srm-gold hover:text-white border border-srm-crimson/20 dark:border-srm-gold/20 bg-srm-crimson/5 dark:bg-srm-gold/5 hover:bg-srm-crimson dark:hover:bg-srm-gold px-3 py-1.5 rounded-lg transition shrink-0 self-end cursor-pointer shadow-sm shadow-black/[0.02]"
                    >
                      Reschedule
                    </button>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
