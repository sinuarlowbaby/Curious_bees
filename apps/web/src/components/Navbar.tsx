'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Search, Bell, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AvatarRing from './AvatarRing';
import SpotlightSearch from './SpotlightSearch';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser } = useStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMac, setIsMac] = useState(true);

  // Set OS modifier text (CMD vs CTRL)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMacOs = navigator.userAgent.toUpperCase().includes('MAC');
      setIsMac(isMacOs);
    }
  }, []);

  // Listen for global keyboard shortcut (CMD+K or CTRL+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper to format breadcrumbs or current route name
  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard')) return 'Research Dashboard';
    if (pathname.startsWith('/threads')) return 'Research Feed';
    if (pathname.startsWith('/opportunities')) return 'Recruitment Board';
    if (pathname.startsWith('/events')) return 'AI Events';
    if (pathname.startsWith('/pipeline')) return 'Ingestion Pipeline';
    if (pathname.startsWith('/profile')) return 'Academic Portfolio';
    if (pathname.startsWith('/researchers')) return 'Scholar Discovery';
    return 'ReCollab';
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 w-full bg-darkBg/80 border-b border-borderStroke backdrop-blur-md flex items-center justify-between px-6 md:px-8">
        
        {/* Breadcrumbs Title */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="font-display font-extrabold text-[11px] tracking-wider text-black flex items-center gap-1.5 uppercase font-mono">
              <span className="text-textSecondary font-medium">portal</span>
              <span className="text-textMuted font-light">/</span>
              <span className="text-black tracking-widest">{getPageTitle()}</span>
            </h1>
          </div>
        </div>

        {/* Right Search, Notification & Theme Controls */}
        <div className="flex items-center space-x-4">
          {/* Quick Spotlight Search Toggle input */}
          <div 
            onClick={() => setIsSearchOpen(true)}
            className="relative hidden sm:flex items-center w-48 lg:w-64 h-9 px-3 rounded-lg border border-borderStroke bg-darkSurfaceMuted hover:bg-[#eae6e2] hover:border-textSecondary/20 text-textSecondary cursor-pointer select-none transition-all"
          >
            <Search className="w-3.5 h-3.5 text-textSecondary mr-2 shrink-0" />
            <span className="text-[10px] font-medium font-sans flex-1 text-left">
              Quick search...
            </span>
            <span className="text-[8px] font-mono font-bold tracking-wider opacity-85 border border-borderStroke bg-white px-1.5 py-0.5 rounded leading-none shrink-0 text-black">
              {isMac ? '⌘K' : 'Ctrl+K'}
            </span>
          </div>

          {/* Mobile Search Button */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden p-2 rounded-lg bg-darkSurfaceMuted border border-borderStroke text-textSecondary hover:text-black transition cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Widget */}
          <button className="p-2 rounded-lg bg-darkSurfaceMuted border border-borderStroke text-textSecondary hover:text-black transition relative">
            <Bell className="w-4 h-4" />
            <span className="w-1.5 h-1.5 bg-indigoElectric rounded-full absolute top-1.5 right-1.5 shadow-[0_0_8px_rgba(108,99,255,0.8)]" />
          </button>

          {/* Divider */}
          <span className="w-[1px] h-5 bg-borderStroke" />

          {/* Quick Profile Snapshot Link */}
          <Link href="/profile" className="flex items-center space-x-2.5 group">
            <AvatarRing
              src={currentUser?.image || undefined}
              name={currentUser?.name || undefined}
              role={currentUser?.role}
              size="sm"
            />
            <div className="text-left hidden lg:block min-w-0">
              <p className="text-[11px] font-bold text-textPrimary group-hover:text-indigoElectric transition-colors leading-none truncate max-w-[120px]">
                {currentUser?.name || 'Scholar'}
              </p>
              <p className="text-[8px] text-textSecondary font-mono font-bold mt-1 uppercase tracking-tight truncate max-w-[120px]">
                {currentUser?.department?.split('(')[0].trim() || 'Collaborator'}
              </p>
            </div>
          </Link>
        </div>
      </header>

      {/* Mounting CMD+K Spotlight modal overlay */}
      <SpotlightSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
