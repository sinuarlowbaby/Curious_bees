'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Briefcase, 
  User, 
  LogOut, 
  ShieldAlert, 
  UserSquare, 
  Menu,
  GraduationCap,
  Calendar as CalendarIcon,
  Users,
  X,
  ChevronUp,
  MoreHorizontal,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, roleOverride, toggleRoleOverride, setMobileSidebar, showMobileSidebar } = useStore();
  const [showMobileMore, setShowMobileMore] = useState(false);

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Research Feed', href: '/threads', icon: MessageSquare },
    { name: 'Researchers', href: '/researchers', icon: Users },
    { name: 'Opportunities', href: '/opportunities', icon: Briefcase },
    { name: 'Events Hub', href: '/events', icon: CalendarIcon },
  ];

  const moreItems = [
    { name: 'My Profile', href: '/profile', icon: User },
  ];

  return (
    <>
      {/* 🖥️ DESKTOP SIDEBAR - Sleek Academic Design (Linear + Notion) */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-[#fcfdfe] dark:bg-[#07090e] border-r border-slate-200/80 dark:border-slate-800/80 h-screen sticky top-0 z-40 transition-colors duration-300">
        <div>
          {/* Logo Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/60">
            <Link href="/dashboard" className="flex items-center space-x-2.5">
              <img src="/logo.png" className="w-8 h-8 object-contain shrink-0" alt="ReCollab" />
              <div className="flex items-baseline">
                <span className="font-display font-black text-base tracking-tight text-slate-800 dark:text-slate-100">
                  ReCollab
                </span>
              </div>
            </Link>
          </div>

          {/* User Profile Snapshot */}
          <div className="mx-4 my-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/35 border border-slate-100 dark:border-slate-850/50">
            <div className="flex items-center space-x-2.5">
              <img 
                src={currentUser?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                alt={currentUser?.name || 'User'} 
                className="w-9 h-9 rounded-full border border-recollab-gold/30 object-cover shadow-sm shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {currentUser?.name || 'Academic Collaborator'}
                </p>
                <div className="flex items-center mt-0.5">
                  {roleOverride === 'FACULTY' ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-recollab-crimson/10 text-recollab-crimson border border-recollab-crimson/20 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/30">
                      <GraduationCap className="w-2.5 h-2.5 mr-0.5" />
                      Faculty
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-recollab-blue/10 text-recollab-blue border border-recollab-blue/20 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30">
                      <UserSquare className="w-2.5 h-2.5 mr-0.5" />
                      PhD Scholar
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="px-3 py-2">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-2">
              Research portal
            </p>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-200 group relative
                      ${isActive 
                        ? 'bg-slate-100 dark:bg-slate-900/60 text-slate-950 dark:text-slate-100 border-l-2 border-recollab-crimson dark:border-recollab-gold pl-2.5' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/20'
                      }
                    `}
                  >
                    <item.icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-recollab-crimson dark:text-recollab-gold' : 'text-slate-450 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} />
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="active-indicator-desktop"
                        className="absolute inset-0 bg-recollab-crimson/5 dark:bg-recollab-gold/5 rounded-xl -z-10 pointer-events-none" 
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Account and Identity */}
          <div className="px-3 py-1 mt-4">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-2">
              Identity Card
            </p>
            <nav className="space-y-1">
              {moreItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-200 group relative
                      ${isActive 
                        ? 'bg-slate-100 dark:bg-slate-900/60 text-slate-950 dark:text-slate-100 border-l-2 border-recollab-crimson dark:border-recollab-gold pl-2.5' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/20'
                      }
                    `}
                  >
                    <item.icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-recollab-crimson dark:text-recollab-gold' : 'text-slate-450 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer controls & Developer Mode Switcher */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-850 space-y-3">
          {/* Developer Sandbox Card */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850">
            <div className="flex items-center space-x-1.5 text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-wider mb-2 uppercase">
              <ShieldAlert className="w-3 h-3 text-recollab-crimson dark:text-recollab-gold animate-pulse shrink-0" />
              <span>Developer Sandbox</span>
            </div>
            <button 
              onClick={toggleRoleOverride}
              className="w-full text-center py-2 px-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-900 dark:bg-slate-800 text-white hover:bg-recollab-crimson dark:hover:bg-recollab-gold hover:text-white transition-all duration-200 shadow-sm active:scale-[0.98] cursor-pointer"
            >
              Toggle to {roleOverride === 'FACULTY' ? 'PhD Scholar' : 'Faculty'}
            </button>
          </div>

          <Link 
            href="/" 
            className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/15 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Exit Platform</span>
          </Link>
        </div>
      </aside>

      {/* 📱 MOBILE NAVIGATION BAR - Bottom Tab Bar (iOS/Linear Style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#07090e]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 shadow-2xl flex justify-around items-center transition-colors duration-300">
        {menuItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center space-y-0.5 py-1 px-3 rounded-xl transition duration-200 ${isActive ? 'text-recollab-crimson dark:text-recollab-gold' : 'text-slate-450 dark:text-slate-400'}`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="text-[9px] font-bold tracking-tight">{item.name.replace('Research ', '')}</span>
            </Link>
          );
        })}

        {/* "More" Trigger for mobile */}
        <button
          onClick={() => setShowMobileMore(true)}
          className={`flex flex-col items-center space-y-0.5 py-1 px-3 rounded-xl transition duration-200 ${showMobileMore ? 'text-recollab-crimson dark:text-recollab-gold' : 'text-slate-450 dark:text-slate-400'}`}
        >
          <MoreHorizontal className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-bold tracking-tight">More</span>
        </button>
      </div>

      {/* 📱 MOBILE MORE DRAWER SHEET - Slide up overlay */}
      <AnimatePresence>
        {showMobileMore && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMore(false)}
              className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            {/* Sheet */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] bg-[#fcfdfe] dark:bg-[#07090e] border-t border-slate-200 dark:border-slate-800 rounded-t-3xl p-6 shadow-2xl flex flex-col space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <img 
                    src={currentUser?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                    alt={currentUser?.name || 'User'} 
                    className="w-8 h-8 rounded-full border border-recollab-gold/30 object-cover"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-slate-850 dark:text-white leading-tight">{currentUser?.name}</h3>
                    <p className="text-[9px] font-bold text-recollab-gold uppercase mt-0.5 tracking-wider">{roleOverride.replace('_', ' ')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMobileMore(false)}
                  className="p-1.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition"
                >
                  <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              {/* Roster & Quick Action */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/events"
                  onClick={() => setShowMobileMore(false)}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/35 border border-slate-100 dark:border-slate-850 flex flex-col items-center space-y-2 text-center"
                >
                  <CalendarIcon className="w-6 h-6 text-recollab-gold" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Events Hub</span>
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setShowMobileMore(false)}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/35 border border-slate-100 dark:border-slate-850 flex flex-col items-center space-y-2 text-center"
                >
                  <User className="w-6 h-6 text-recollab-crimson" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350">My Profile</span>
                </Link>
              </div>

              {/* Dev Controls inside Mobile Drawer */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850 space-y-3">
                <div className="flex items-center space-x-2 text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                  <ShieldAlert className="w-3.5 h-3.5 text-recollab-gold animate-pulse shrink-0" />
                  <span>Sandbox Environment Settings</span>
                </div>
                <button
                  onClick={() => {
                    toggleRoleOverride();
                    setShowMobileMore(false);
                  }}
                  className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 dark:bg-slate-800 text-white shadow hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
                >
                  Switch Role Override
                </button>
              </div>

              {/* Exit */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col">
                <Link
                  href="/"
                  onClick={() => setShowMobileMore(false)}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl border border-red-200 dark:border-red-900/30 text-xs font-bold text-red-650 dark:text-red-400 bg-red-50/20 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/25 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout and Exit Portal</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
