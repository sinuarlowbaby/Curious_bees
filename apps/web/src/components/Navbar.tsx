'use client';

import { useStore } from '@/store/useStore';
import { Menu, Search, Bell, Sun, Moon, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const { setMobileSidebar, showMobileSidebar, currentUser, theme, toggleTheme } = useStore();

  // Helper to format breadcrumbs or current route name
  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard')) return 'Research Dashboard';
    if (pathname.startsWith('/threads')) return 'Research Feed';
    if (pathname.startsWith('/opportunities')) return 'Recruitment Board';
    if (pathname.startsWith('/events')) return 'Events Hub';
    if (pathname.startsWith('/profile')) return 'Academic Portfolio';
    if (pathname.startsWith('/researchers')) return 'Researcher Discovery';
    return 'ReCollab';
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-white/70 dark:bg-[#07090e]/70 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md flex items-center justify-between px-6 md:px-8 transition-colors duration-300">
      {/* Mobile Toggle Button & Dynamic Path Breadcrumbs */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setMobileSidebar(!showMobileSidebar)}
          className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>
        <div>
          <h1 className="font-display font-extrabold text-sm tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase">
            <span className="text-slate-400 dark:text-slate-500 font-medium">portal</span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-slate-900 dark:text-white">{getPageTitle()}</span>
          </h1>
        </div>
      </div>

      {/* Right Search, Notification & Theme Controls */}
      <div className="flex items-center space-x-3">
        {/* Mock Search Input */}
        <div className="relative hidden sm:block w-48 lg:w-64">
          <input
            type="text"
            placeholder="Quick search (⌘K)..."
            className="w-full pl-8 pr-3 py-1.5 text-[11px] rounded-lg glass-input placeholder-slate-450 dark:placeholder-slate-600 font-semibold"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 absolute left-2.5 top-2.5" />
        </div>

        {/* Dynamic Theme Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors relative cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-recollab-gold" />
          ) : (
            <Moon className="w-4 h-4 text-recollab-crimson" />
          )}
        </button>

        {/* Notifications Button */}
        <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-1.5 h-1.5 bg-recollab-crimson dark:bg-recollab-gold rounded-full absolute top-1.5 right-1.5" />
        </button>

        {/* Divider */}
        <span className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800" />

        {/* Quick Profile Widget */}
        <Link href="/profile" className="flex items-center space-x-2.5 group">
          <img
            src={currentUser?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 group-hover:border-recollab-crimson dark:group-hover:border-recollab-gold transition-colors"
          />
          <div className="text-left hidden lg:block">
            <p className="text-[11px] font-bold text-slate-850 dark:text-white group-hover:text-recollab-crimson dark:group-hover:text-recollab-gold transition-colors leading-none">
              {currentUser?.name || 'Academic Scholar'}
            </p>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-tight">
              {currentUser?.department?.split('(')[0].trim() || 'Collaborator'}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
