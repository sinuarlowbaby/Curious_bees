'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Briefcase, 
  User, 
  LogOut, 
  Calendar as CalendarIcon,
  Users,
  Cpu,
  Search,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, roleOverride, logout } = useStore();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Research Feed', href: '/threads', icon: MessageSquare },
    { name: 'Researchers', href: '/researchers', icon: Users },
    { name: 'Opportunities', href: '/opportunities', icon: Briefcase },
    { name: 'Events', href: '/events', icon: CalendarIcon },
    { name: 'AI Search', href: '/search', icon: Search },
    { name: 'AI Pipeline', href: '/pipeline', icon: Cpu },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Ask ReCollab', href: '/copilot', icon: Sparkles },
  ];

  const moreItems = [
    { name: 'My Profile', href: '/profile', icon: User },
  ];

  // Helper to extract initials
  const getInitials = (name?: string) => {
    if (!name) return 'RC';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* 🖥️ DESKTOP SIDEBAR - 220px Fixed Left Panel */}
      <aside className="hidden md:flex flex-col w-[220px] bg-white border-r border-borderStroke h-screen sticky top-0 z-40 select-none shrink-0 font-sans">
        
        {/* TOP SECTION */}
        <div className="h-[60px] flex items-center px-4 border-b border-borderStroke">
          <Link href="/dashboard" className="flex items-center space-x-3 shrink-0">
            <div className="w-[28px] h-[28px] bg-black flex items-center justify-center font-display font-bold text-white text-[13px] tracking-tight rounded-sm">
              RC
            </div>
            <span className="font-sans font-semibold text-[15px] tracking-tight text-black">
              ReCollab
            </span>
            <span className="bg-darkSurfaceMuted border border-borderStroke text-textSecondary text-[11px] font-sans px-2 py-0.5 rounded-full scale-90">
              SRM
            </span>
          </Link>
        </div>

        {/* USER CARD */}
        <div className="p-4 border-b border-borderStroke bg-white">
          <div className="flex items-center space-x-3">
            {/* Avatar Circle with Warm Gradient */}
            <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-tr from-amber-500 via-orange-400 to-rose-400 flex items-center justify-center font-sans font-semibold text-white text-[13px] relative shrink-0">
              <span>{getInitials(currentUser?.name || undefined)}</span>
              {/* Online Dot */}
              <span className="w-2 h-2 rounded-full bg-[#22c55e] border border-white absolute bottom-0 right-0" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-semibold text-black truncate leading-none">
                {currentUser?.name || 'Academic Scholar'}
              </p>
              <div className="mt-1.5 flex">
                <span className="bg-darkSurfaceMuted border border-borderStroke text-textSecondary text-[10px] font-sans px-2 py-0.5 rounded-full leading-none">
                  {roleOverride === 'FACULTY' ? 'Faculty' : 'Scholar'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* NAV SECTIONS */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
          <div>
            <p className="text-[11px] font-sans font-medium text-textMuted uppercase tracking-wider px-3 mb-2 text-left select-none">
              RESEARCH SYSTEMS
            </p>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-lg text-[14px] font-sans tracking-tight transition-all duration-200 group relative shrink-0",
                      isActive 
                        ? 'bg-darkSurfaceMuted text-black font-medium border-l-[2px] border-black rounded-l-none' 
                        : 'text-textSecondary hover:text-black hover:bg-darkBg'
                    )}
                  >
                    <item.icon className={cn(
                      "w-4 h-4 shrink-0 transition-colors mr-2.5",
                      isActive ? 'text-black' : 'text-textSecondary'
                    )} />
                    <span className="truncate leading-none">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-2">
            <p className="text-[11px] font-sans font-medium text-textMuted uppercase tracking-wider px-3 mb-2 text-left select-none">
              ACADEMIC IDENTITY
            </p>
            <nav className="space-y-1">
              {moreItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-lg text-[14px] font-sans tracking-tight transition-all duration-200 group relative shrink-0",
                      isActive 
                        ? 'bg-darkSurfaceMuted text-black font-medium border-l-[2px] border-black rounded-l-none' 
                        : 'text-textSecondary hover:text-black hover:bg-darkBg'
                    )}
                  >
                    <item.icon className={cn(
                      "w-4 h-4 shrink-0 transition-colors mr-2.5",
                      isActive ? 'text-black' : 'text-textSecondary'
                    )} />
                    <span className="truncate leading-none">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="p-3 border-t border-borderStroke shrink-0">
          <button 
            onClick={() => logout()}
            className="w-full flex items-center px-3 py-2.5 rounded-lg text-[13px] font-sans font-semibold text-textMuted hover:text-black hover:bg-darkBg transition-all cursor-pointer text-left shrink-0 select-none"
          >
            <LogOut className="w-4 h-4 shrink-0 mr-2.5 text-textMuted" />
            <span>Exit Portal</span>
          </button>
        </div>

      </aside>

      {/* 📱 MOBILE BOTTOM BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-borderStroke px-2 py-1.5 flex justify-around items-center">
        {menuItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center space-y-0.5 py-1 px-3 rounded-lg transition duration-200",
                isActive ? 'text-black' : 'text-textSecondary'
              )}
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              <span className="text-[9px] font-semibold tracking-tight">{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={() => logout()}
          className="flex flex-col items-center space-y-0.5 py-1 px-3 text-textSecondary"
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          <span className="text-[9px] font-semibold tracking-tight">Exit</span>
        </button>
      </div>
    </>
  );
}
